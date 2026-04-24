(function () {
  const firebaseConfig = {
    apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
    authDomain: 'playr3.firebaseapp.com',
    projectId: 'playr3',
    storageBucket: 'playr3.firebasestorage.app',
    messagingSenderId: '784118485475',
    appId: '1:784118485475:web:5347f708718f56602fd0d6',
    measurementId: 'G-J4DKRFRX33',
  };

  const app = window.firebase?.apps?.length
    ? window.firebase.app()
    : window.firebase?.initializeApp
      ? window.firebase.initializeApp(firebaseConfig)
      : null;
  const auth = app && window.firebase?.auth ? window.firebase.auth() : null;
  const db = app && window.firebase?.firestore ? window.firebase.firestore() : null;

  const ROOM_COLLECTION = 'battleshipRooms';
  const ROOM_PREFIX = 'bnf-';
  const GRID_SIZE = 10;
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
  const PLACEMENT_TIMEOUT_MS = 90 * 1000;
  const TURN_TIMEOUT_MS = 20 * 1000;
  const XP_HIT = 10;
  const XP_SUNK = 50;
  const XP_WIN = 200;
  const ROW_LABELS = 'ABCDEFGHIJ'.split('');
  const SHIPS = [
    { id: 'carrier', name: 'Carrier', size: 5 },
    { id: 'battleship', name: 'Battleship', size: 4 },
    { id: 'cruiser', name: 'Cruiser', size: 3 },
    { id: 'submarine', name: 'Submarine', size: 3 },
    { id: 'destroyer', name: 'Destroyer', size: 2 },
  ];

  const state = {
    user: null,
    roomId: '',
    roomData: null,
    roomUnsub: null,
    gateMode: 'choice',
    draftShips: [],
    selectedShipId: SHIPS[0].id,
    orientation: 'horizontal',
    selectedAttackIndex: -1,
    radarMode: false,
    lastResultMessage: 'Waiting for room activity.',
    tickHandle: null,
  };

  const els = {
    gameStatus: document.getElementById('gameStatus'),
    roomGate: document.getElementById('roomGate'),
    gateChoice: document.getElementById('gateChoice'),
    joinFlow: document.getElementById('joinFlow'),
    showJoinBtn: document.getElementById('showJoinBtn'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    backToChoiceBtn: document.getElementById('backToChoiceBtn'),
    roomIdInput: document.getElementById('roomIdInput'),
    roomGateError: document.getElementById('roomGateError'),
    battleHud: document.getElementById('battleHud'),
    battleStage: document.getElementById('battleStage'),
    roomCodeLabel: document.getElementById('roomCodeLabel'),
    phaseLabel: document.getElementById('phaseLabel'),
    turnLabel: document.getElementById('turnLabel'),
    timerLabel: document.getElementById('timerLabel'),
    selectionLabel: document.getElementById('selectionLabel'),
    copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
    copyInviteBtn: document.getElementById('copyInviteBtn'),
    playerStatusList: document.getElementById('playerStatusList'),
    controlTitle: document.getElementById('controlTitle'),
    rotateShipBtn: document.getElementById('rotateShipBtn'),
    fleetShipList: document.getElementById('fleetShipList'),
    randomizeFleetBtn: document.getElementById('randomizeFleetBtn'),
    clearFleetBtn: document.getElementById('clearFleetBtn'),
    lockFleetBtn: document.getElementById('lockFleetBtn'),
    radarBtn: document.getElementById('radarBtn'),
    confirmAttackBtn: document.getElementById('confirmAttackBtn'),
    controlHint: document.getElementById('controlHint'),
    ownBoard: document.getElementById('ownBoard'),
    enemyBoard: document.getElementById('enemyBoard'),
    fleetHealthLabel: document.getElementById('fleetHealthLabel'),
    enemyBoardHint: document.getElementById('enemyBoardHint'),
    eventPanel: document.getElementById('eventPanel'),
    eventLog: document.getElementById('eventLog'),
    resultBanner: document.getElementById('resultBanner'),
  };

  function setStatus(text) {
    if (els.gameStatus) els.gameStatus.textContent = text;
  }

  function setGateError(text) {
    if (!els.roomGateError) return;
    const value = String(text || '').trim();
    els.roomGateError.hidden = !value;
    els.roomGateError.textContent = value;
  }

  function normalizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24) || 'Player';
  }

  function getDisplayName(user) {
    return normalizeName(user?.displayName || 'Player');
  }

  function roomRef(roomId) {
    return db.collection(ROOM_COLLECTION).doc(roomId);
  }

  function createRoomCode() {
    const token = Math.random().toString(36).slice(2, 8);
    return `${ROOM_PREFIX}${token}`;
  }

  function parseRoomId(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return /^bnf-[a-z0-9]{4,16}$/.test(normalized) ? normalized : '';
  }

  function getShipConfig(shipId) {
    return SHIPS.find((ship) => ship.id === shipId) || null;
  }

  function coordFromIndex(index) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return `${ROW_LABELS[row]}${col + 1}`;
  }

  function indexFromCell(row, col) {
    return row * GRID_SIZE + col;
  }

  function cloneShips(ships) {
    return Array.isArray(ships)
      ? ships.map((ship) => ({
          id: ship.id,
          name: ship.name,
          size: Number(ship.size || 0),
          orientation: ship.orientation === 'vertical' ? 'vertical' : 'horizontal',
          cells: Array.isArray(ship.cells) ? ship.cells.map((cell) => Number(cell)) : [],
        }))
      : [];
  }

  function getEmptyBoardState() {
    return {
      ships: [],
      locked: false,
      incomingShots: [],
      outgoingShots: [],
      radarScans: [],
      radarUsed: false,
    };
  }

  function getBoardState(room, uid) {
    const raw = room?.boards?.[uid];
    return raw && typeof raw === 'object'
      ? {
          ships: cloneShips(raw.ships),
          locked: Boolean(raw.locked),
          incomingShots: Array.isArray(raw.incomingShots) ? raw.incomingShots.map((shot) => ({ ...shot, index: Number(shot.index) })) : [],
          outgoingShots: Array.isArray(raw.outgoingShots) ? raw.outgoingShots.map((shot) => ({ ...shot, index: Number(shot.index) })) : [],
          radarScans: Array.isArray(raw.radarScans) ? raw.radarScans.map((scan) => ({ ...scan, cells: Array.isArray(scan.cells) ? scan.cells.map((cell) => Number(cell)) : [] })) : [],
          radarUsed: Boolean(raw.radarUsed),
        }
      : getEmptyBoardState();
  }

  function buildOccupiedSet(ships) {
    const set = new Set();
    cloneShips(ships).forEach((ship) => {
      ship.cells.forEach((cell) => set.add(Number(cell)));
    });
    return set;
  }

  function buildShipCells(startIndex, size, orientation) {
    const row = Math.floor(startIndex / GRID_SIZE);
    const col = startIndex % GRID_SIZE;
    if (orientation === 'horizontal') {
      if (col + size > GRID_SIZE) return [];
      return Array.from({ length: size }, (_, offset) => indexFromCell(row, col + offset));
    }
    if (row + size > GRID_SIZE) return [];
    return Array.from({ length: size }, (_, offset) => indexFromCell(row + offset, col));
  }

  function canPlaceShip(ships, shipId, startIndex, orientation) {
    const config = getShipConfig(shipId);
    if (!config) return false;
    const cells = buildShipCells(startIndex, config.size, orientation);
    if (cells.length !== config.size) return false;
    const nextShips = cloneShips(ships).filter((ship) => ship.id !== shipId);
    const occupied = buildOccupiedSet(nextShips);
    return cells.every((cell) => !occupied.has(cell));
  }

  function placeShipInDraft(shipId, startIndex, orientation) {
    if (!canPlaceShip(state.draftShips, shipId, startIndex, orientation)) return false;
    const config = getShipConfig(shipId);
    const cells = buildShipCells(startIndex, config.size, orientation);
    state.draftShips = cloneShips(state.draftShips)
      .filter((ship) => ship.id !== shipId)
      .concat({
        id: config.id,
        name: config.name,
        size: config.size,
        orientation,
        cells,
      });
    const nextShip = SHIPS.find((ship) => !state.draftShips.some((placed) => placed.id === ship.id));
    if (nextShip) state.selectedShipId = nextShip.id;
    renderAll();
    return true;
  }

  function clearDraftFleet() {
    state.draftShips = [];
    state.selectedShipId = SHIPS[0].id;
    renderAll();
  }

  function generateRandomFleet() {
    for (let attempt = 0; attempt < 250; attempt += 1) {
      const ships = [];
      let valid = true;
      for (const ship of SHIPS) {
        let placed = false;
        for (let inner = 0; inner < 250; inner += 1) {
          const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
          const startIndex = Math.floor(Math.random() * TOTAL_CELLS);
          if (!canPlaceShip(ships, ship.id, startIndex, orientation)) continue;
          ships.push({
            id: ship.id,
            name: ship.name,
            size: ship.size,
            orientation,
            cells: buildShipCells(startIndex, ship.size, orientation),
          });
          placed = true;
          break;
        }
        if (!placed) {
          valid = false;
          break;
        }
      }
      if (valid) return ships;
    }
    return [];
  }

  function getPlayerIds(room) {
    const ids = [room?.hostUid || '', room?.guestUid || ''].filter(Boolean);
    return ids;
  }

  function getOpponentUid(room, uid) {
    return getPlayerIds(room).find((playerUid) => playerUid !== uid) || '';
  }

  function getPlayerName(room, uid) {
    if (!uid) return 'Waiting...';
    if (uid === room?.hostUid) return normalizeName(room.hostName || 'Player 1');
    if (uid === room?.guestUid) return normalizeName(room.guestName || 'Player 2');
    return 'Player';
  }

  function getPhaseLabel(phase) {
    switch (phase) {
      case 'placement':
        return 'Placement';
      case 'battle':
        return 'Battle';
      case 'end':
        return 'Endgame';
      default:
        return 'Lobby';
    }
  }

  function updateUrl(roomId = '') {
    const url = new URL(window.location.href);
    if (roomId) {
      url.searchParams.set('room', roomId);
    } else {
      url.searchParams.delete('room');
    }
    window.history.replaceState({}, '', url.toString());
  }

  function unsubscribeRoom() {
    if (typeof state.roomUnsub === 'function') {
      state.roomUnsub();
    }
    state.roomUnsub = null;
  }

  function getEventLog(room) {
    return Array.isArray(room?.eventLog) ? room.eventLog.slice(0, 8) : [];
  }

  function pushEvent(events, text) {
    return [{ text, at: Date.now() }, ...events.slice(0, 7)];
  }

  function getCountdown(deadline) {
    if (!deadline) return '--';
    const remaining = Math.max(0, Math.ceil((Number(deadline) - Date.now()) / 1000));
    return `${remaining}s`;
  }

  function getMyBoard(room) {
    return getBoardState(room, state.user?.uid || '');
  }

  function getEnemyBoard(room) {
    return getBoardState(room, getOpponentUid(room, state.user?.uid || ''));
  }

  function getEnemyTrackingBoard(room) {
    return getBoardState(room, state.user?.uid || '');
  }

  function isMyTurn(room) {
    return Boolean(room?.phase === 'battle' && state.user?.uid && room.turnUid === state.user.uid);
  }

  function isPlacementLocked(room) {
    return getMyBoard(room).locked;
  }

  function shouldShowBattleActions(room) {
    return room?.phase === 'battle';
  }

  function getShipHitMap(board) {
    const incomingHits = new Set(
      board.incomingShots
        .filter((shot) => shot.result === 'hit' || shot.result === 'sunk')
        .map((shot) => Number(shot.index)),
    );
    const byShip = {};
    board.ships.forEach((ship) => {
      byShip[ship.id] = ship.cells.filter((cell) => incomingHits.has(Number(cell)));
    });
    return byShip;
  }

  function isShipSunk(board, ship) {
    const hits = getShipHitMap(board)[ship.id] || [];
    return hits.length >= ship.cells.length;
  }

  function getFleetHealthText(board, shipsOverride = null) {
    const displayShips = Array.isArray(shipsOverride) ? cloneShips(shipsOverride) : board.ships;
    if (!displayShips.length) return 'Awaiting placement';
    const sunkCount = displayShips.filter((ship) => isShipSunk(board, ship)).length;
    const remaining = Math.max(0, SHIPS.length - sunkCount);
    return remaining === SHIPS.length
      ? 'Fleet intact'
      : `${remaining}/${SHIPS.length} ships afloat`;
  }

  function getShotMap(shots) {
    const map = new Map();
    (shots || []).forEach((shot) => {
      map.set(Number(shot.index), shot);
    });
    return map;
  }

  function formatIdentity(name, record = null) {
    if (window.PlayrProgression?.formatIdentityMarkup) {
      return window.PlayrProgression.formatIdentityMarkup(name, {
        record,
        compact: true,
        showBadges: Boolean(record),
      });
    }
    return normalizeName(name);
  }

  function buildBoardMarkup(type, room) {
    const board = type === 'own' ? getMyBoard(room) : getEnemyBoard(room);
    const trackingBoard = getEnemyTrackingBoard(room);
    const myUid = state.user?.uid || '';
    const canInteract = room?.phase === 'placement'
      ? type === 'own' && !board.locked
      : room?.phase === 'battle'
        ? type === 'enemy' && isMyTurn(room)
        : false;
    const outgoingMap = getShotMap(trackingBoard.outgoingShots);
    const incomingMap = getShotMap(board.incomingShots);
    const displayShips = type === 'own' && room?.phase === 'placement' && !board.locked
      ? cloneShips(state.draftShips)
      : board.ships;
    const occupied = buildOccupiedSet(displayShips);
    const radarCells = new Set((trackingBoard.radarScans || []).flatMap((scan) => scan.cells || []));
    let markup = '<div class="grid-wrap">';
    markup += '<span class="axis-cell" aria-hidden="true"></span>';
    for (let col = 0; col < GRID_SIZE; col += 1) {
      markup += `<span class="axis-cell" aria-hidden="true">${col + 1}</span>`;
    }
    for (let row = 0; row < GRID_SIZE; row += 1) {
      markup += `<span class="axis-cell" aria-hidden="true">${ROW_LABELS[row]}</span>`;
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const index = indexFromCell(row, col);
        const shot = type === 'own' ? incomingMap.get(index) : outgoingMap.get(index);
        const ship = displayShips.find((entry) => entry.cells.includes(index));
        const classes = ['board-cell'];
        let mark = '';

        if (type === 'own' && occupied.has(index)) {
          classes.push('ship');
          mark = '■';
        }

        if (shot) {
          if (shot.result === 'hit' || shot.result === 'sunk') {
            classes.push('hit');
            mark = '✦';
          } else {
            classes.push('miss');
            mark = '•';
          }
        }

        if (type === 'enemy' && radarCells.has(index) && !shot) {
          classes.push('radar');
          mark = '?';
        }

        if (type === 'enemy' && ship && shot && (shot.result === 'hit' || shot.result === 'sunk') && isShipSunk(board, ship)) {
          classes.push('revealed-sunk');
        }

        if (type === 'enemy' && state.selectedAttackIndex === index) {
          classes.push('selected');
        }

        if (type === 'own' && room?.phase === 'placement' && !board.locked) {
          const selected = getShipConfig(state.selectedShipId);
          if (selected) {
            const previewCells = buildShipCells(index, selected.size, state.orientation);
            const validPreview = previewCells.length === selected.size && canPlaceShip(state.draftShips, selected.id, index, state.orientation);
            if (validPreview && previewCells.includes(index)) {
              classes.push('preview-valid');
            }
          }
        }

        markup += `
          <button
            class="${classes.join(' ')}"
            type="button"
            data-board-type="${type}"
            data-cell-index="${index}"
            ${canInteract ? '' : 'disabled'}
            aria-label="${type === 'own' ? `Your board ${coordFromIndex(index)}` : `Enemy board ${coordFromIndex(index)}`}"
          ><span class="cell-mark">${mark}</span></button>
        `;
      }
    }
    markup += '</div>';
    return markup;
  }

  function renderPlayerStatus(room) {
    if (!els.playerStatusList) return;
    const ids = getPlayerIds(room);
    if (!ids.length) {
      els.playerStatusList.innerHTML = '<div class="empty-state">No captains in room yet.</div>';
      return;
    }
    els.playerStatusList.innerHTML = ids.map((uid) => {
      const board = getBoardState(room, uid);
      const isCurrent = uid === room.turnUid && room.phase === 'battle';
      const isMe = uid === state.user?.uid;
      const boardHealth = getFleetHealthText(board);
      const statusClass = board.locked ? 'ready' : (room.phase === 'lobby' ? 'waiting' : 'waiting');
      const statusText = room.phase === 'battle'
        ? (isCurrent ? 'Attacking now' : 'Waiting for turn')
        : room.phase === 'placement'
          ? (board.locked ? 'Fleet locked' : 'Placing ships')
          : room.phase === 'end'
            ? (uid === room.winnerUid ? 'Winner' : 'Defeated')
            : 'Awaiting second captain';
      const identityRecord = isMe && window.PlayrProgression?.getCurrentRecord
        ? window.PlayrProgression.getCurrentRecord()
        : null;
      return `
        <div class="player-status-item${isCurrent ? ' active-turn' : ''}">
          <div class="player-status-top">
            <div class="player-status-name">
              <span class="status-dot ${statusClass}"></span>
              <span>${formatIdentity(`${getPlayerName(room, uid)}${isMe ? ' (You)' : ''}`, identityRecord)}</span>
            </div>
            <span class="tag">${uid === room.hostUid ? 'Host' : 'Guest'}</span>
          </div>
          <div class="player-status-meta">
            <span>${statusText}</span>
            <span>${boardHealth}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderShipControls(room) {
    const board = getMyBoard(room);
    const ships = board.locked ? board.ships : state.draftShips;
    if (!els.fleetShipList) return;
    els.fleetShipList.innerHTML = SHIPS.map((ship) => {
      const placedShip = ships.find((entry) => entry.id === ship.id);
      const placed = Boolean(placedShip);
      const selected = state.selectedShipId === ship.id;
      return `
        <button class="ship-card${selected ? ' is-selected' : ''}${placed ? ' is-placed' : ''}" type="button" data-ship-id="${ship.id}">
          <strong>${ship.name}</strong>
          <span>${ship.size} tiles · ${placed ? 'Placed' : 'Not placed'}</span>
        </button>
      `;
    }).join('');
  }

  function renderEventLog(room) {
    if (!els.eventLog) return;
    const events = getEventLog(room);
    if (!events.length) {
      els.eventLog.innerHTML = '<div class="empty-state">The sea is quiet for now. Create or join a room to begin.</div>';
      return;
    }
    els.eventLog.innerHTML = events.map((event) => `
      <article class="event-entry">
        <strong>${new Date(Number(event.at) || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
        <span>${event.text || ''}</span>
      </article>
    `).join('');
  }

  function renderBoards(room) {
    if (els.ownBoard) {
      els.ownBoard.innerHTML = buildBoardMarkup('own', room);
    }
    if (els.enemyBoard) {
      els.enemyBoard.innerHTML = buildBoardMarkup('enemy', room);
    }
  }

  function renderAll() {
    const room = state.roomData;
    const signedIn = Boolean(state.user);
    const inRoom = Boolean(room && state.roomId);

    if (els.roomGate) {
      els.roomGate.hidden = inRoom;
    }
    if (els.battleHud) els.battleHud.hidden = !inRoom;
    if (els.battleStage) els.battleStage.hidden = !inRoom;
    if (els.eventPanel) els.eventPanel.hidden = !inRoom;
    if (els.gateChoice) els.gateChoice.hidden = state.gateMode !== 'choice';
    if (els.joinFlow) els.joinFlow.hidden = state.gateMode !== 'join';

    if (!signedIn) {
      setStatus('Log in on the hub first to play multiplayer games.');
      return;
    }

    if (!room) {
      setStatus('Create a room or join with a code.');
      return;
    }

    const myBoard = getMyBoard(room);
    const enemyBoard = getEnemyBoard(room);
    const trackingBoard = getEnemyTrackingBoard(room);
    const placementLocked = myBoard.locked;
    const allPlaced = SHIPS.every((ship) => state.draftShips.some((placed) => placed.id === ship.id));

    if (els.roomCodeLabel) els.roomCodeLabel.textContent = state.roomId;
    if (els.phaseLabel) els.phaseLabel.textContent = getPhaseLabel(room.phase);
    if (els.turnLabel) {
      els.turnLabel.textContent = room.phase === 'battle'
        ? getPlayerName(room, room.turnUid)
        : room.phase === 'end'
          ? (room.winnerUid ? `${getPlayerName(room, room.winnerUid)} won` : 'Match complete')
          : 'Waiting';
    }
    if (els.timerLabel) {
      const deadline = room.phase === 'placement' ? room.placementDeadlineAt : room.turnDeadlineAt;
      els.timerLabel.textContent = getCountdown(deadline);
    }
    if (els.selectionLabel) {
      if (state.radarMode) {
        els.selectionLabel.textContent = 'Radar Ping';
      } else if (state.selectedAttackIndex >= 0) {
        els.selectionLabel.textContent = coordFromIndex(state.selectedAttackIndex);
      } else {
        els.selectionLabel.textContent = room.phase === 'placement'
          ? (getShipConfig(state.selectedShipId)?.name || 'None')
          : 'None';
      }
    }
    if (els.controlTitle) {
      els.controlTitle.textContent = room.phase === 'placement'
        ? 'Prepare your fleet'
        : room.phase === 'battle'
          ? 'Execute your strike'
          : room.phase === 'end'
            ? 'Battle complete'
            : 'Waiting for captains';
    }
    if (els.controlHint) {
      els.controlHint.textContent = room.phase === 'placement'
        ? (placementLocked ? 'Fleet locked in. Waiting for the opposing captain.' : 'Select a ship, place it on your board, and lock your fleet before the timer expires.')
        : room.phase === 'battle'
          ? (state.radarMode ? 'Radar mode active. Click an enemy cell to scan its surrounding 3x3 area.' : (isMyTurn(room) ? 'Pick an enemy coordinate and confirm your attack.' : 'Hold position. You can attack when the turn indicator points to you.'))
          : room.phase === 'end'
            ? (room.winnerUid === state.user?.uid ? 'Victory secured. Launch another room to play again.' : 'Your fleet was lost. Create another room for a rematch.')
            : 'The room enters ship placement as soon as a second captain joins.';
    }
    if (els.rotateShipBtn) {
      els.rotateShipBtn.hidden = room.phase !== 'placement' || placementLocked;
      els.rotateShipBtn.textContent = `Rotate: ${state.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`;
    }
    if (els.randomizeFleetBtn) els.randomizeFleetBtn.hidden = room.phase !== 'placement' || placementLocked;
    if (els.clearFleetBtn) els.clearFleetBtn.hidden = room.phase !== 'placement' || placementLocked;
    if (els.lockFleetBtn) {
      els.lockFleetBtn.hidden = room.phase !== 'placement';
      els.lockFleetBtn.disabled = placementLocked || !allPlaced;
      els.lockFleetBtn.textContent = placementLocked ? 'Fleet Locked' : 'Lock Fleet';
    }
    if (els.radarBtn) {
      els.radarBtn.hidden = !shouldShowBattleActions(room);
      els.radarBtn.disabled = !isMyTurn(room) || trackingBoard.radarUsed;
      els.radarBtn.textContent = trackingBoard.radarUsed ? 'Radar Used' : (state.radarMode ? 'Cancel Radar' : 'Radar Ping');
    }
    if (els.confirmAttackBtn) {
      els.confirmAttackBtn.hidden = !shouldShowBattleActions(room);
      els.confirmAttackBtn.disabled = !isMyTurn(room) || state.selectedAttackIndex < 0 || state.radarMode;
    }
    if (els.fleetHealthLabel) {
      const displayShips = room.phase === 'placement' && !myBoard.locked ? state.draftShips : myBoard.ships;
      els.fleetHealthLabel.textContent = getFleetHealthText(myBoard, displayShips);
    }
    if (els.enemyBoardHint) {
      els.enemyBoardHint.textContent = room.phase === 'battle'
        ? (state.radarMode ? 'Radar scan ready' : (state.selectedAttackIndex >= 0 ? `Target ${coordFromIndex(state.selectedAttackIndex)}` : 'Pick a coordinate'))
        : 'Enemy fleet hidden';
    }
    if (els.resultBanner) els.resultBanner.textContent = state.lastResultMessage;

    renderPlayerStatus(room);
    renderShipControls(room);
    renderBoards(room);
    renderEventLog(room);

    setStatus(room.phase === 'end'
      ? (room.winnerUid === state.user?.uid ? 'You won the battle.' : `${getPlayerName(room, room.winnerUid)} won the battle.`)
      : `Room ${state.roomId} ready.`);
  }

  async function subscribeToRoom(roomId) {
    unsubscribeRoom();
    state.roomId = roomId;
    state.roomUnsub = roomRef(roomId).onSnapshot((snap) => {
      state.roomData = snap.exists ? snap.data() : null;
      if (!snap.exists) {
        state.lastResultMessage = 'Room no longer exists.';
        updateUrl('');
      } else {
        const room = snap.data() || {};
        const myBoard = getMyBoard(room);
        if (room.phase === 'placement' && !myBoard.locked && (!state.draftShips.length || state.draftShips.every((ship) => !ship.cells?.length))) {
          state.draftShips = cloneShips(myBoard.ships);
        }
        if (myBoard.locked) {
          state.draftShips = cloneShips(myBoard.ships);
        }
      }
      renderAll();
    }, () => {
      setStatus('Could not read room updates.');
    });
    updateUrl(roomId);
  }

  async function createRoom() {
    if (!db || !state.user) return;
    const roomId = createRoomCode();
    const displayName = getDisplayName(state.user);
    await roomRef(roomId).set({
      hostUid: state.user.uid,
      hostName: displayName,
      guestUid: '',
      guestName: '',
      phase: 'lobby',
      turnUid: '',
      turnDeadlineAt: 0,
      placementDeadlineAt: 0,
      winnerUid: '',
      winnerName: '',
      boards: {
        [state.user.uid]: getEmptyBoardState(),
      },
      eventLog: [{ text: `${displayName} opened a Neon Fleet room.`, at: Date.now() }],
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    });
    state.draftShips = [];
    state.selectedAttackIndex = -1;
    state.lastResultMessage = 'Room created. Waiting for a second captain.';
    await subscribeToRoom(roomId);
    if (window.PlayrProgression?.grantRoomCreatedXp) {
      window.PlayrProgression.grantRoomCreatedXp();
    }
  }

  async function joinRoom(roomId) {
    if (!db || !state.user) return;
    const safeRoomId = parseRoomId(roomId);
    if (!safeRoomId) throw new Error('INVALID_ROOM');
    const displayName = getDisplayName(state.user);

    await db.runTransaction(async (tx) => {
      const ref = roomRef(safeRoomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.hostUid !== state.user.uid && room.guestUid && room.guestUid !== state.user.uid) {
        throw new Error('ROOM_FULL');
      }
      const boards = { ...(room.boards || {}) };
      if (!boards[state.user.uid]) boards[state.user.uid] = getEmptyBoardState();
      const nextEvents = getEventLog(room);

      if (room.hostUid === state.user.uid || room.guestUid === state.user.uid) {
        tx.set(ref, {
          boards,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      tx.set(ref, {
        guestUid: state.user.uid,
        guestName: displayName,
        phase: 'placement',
        placementDeadlineAt: Date.now() + PLACEMENT_TIMEOUT_MS,
        boards,
        eventLog: pushEvent(nextEvents, `${displayName} joined the room. Fleet placement has started.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    state.draftShips = [];
    state.selectedAttackIndex = -1;
    state.lastResultMessage = 'Joined room. Place your fleet.';
    await subscribeToRoom(safeRoomId);
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      state.lastResultMessage = successMessage;
      renderAll();
    } catch {
      state.lastResultMessage = 'Clipboard access failed.';
      renderAll();
    }
  }

  async function lockFleet() {
    if (!db || !state.user || !state.roomId || !state.roomData) return;
    if (!SHIPS.every((ship) => state.draftShips.some((placed) => placed.id === ship.id))) return;
    const draft = cloneShips(state.draftShips);
    let startedBattle = false;

    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'placement') throw new Error('NOT_PLACEMENT');
      const boards = { ...(room.boards || {}) };
      const board = getBoardState(room, state.user.uid);
      boards[state.user.uid] = {
        ...board,
        ships: draft,
        locked: true,
      };

      const playerIds = getPlayerIds(room);
      const allLocked = playerIds.length === 2 && playerIds.every((uid) => {
        if (uid === state.user.uid) return true;
        return Boolean(getBoardState({ ...room, boards }, uid).locked);
      });

      const nextEvents = getEventLog(room);
      const payload = {
        boards,
        eventLog: pushEvent(nextEvents, `${getDisplayName(state.user)} locked their fleet.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (allLocked) {
        const starterUid = playerIds[Math.floor(Math.random() * playerIds.length)];
        payload.phase = 'battle';
        payload.turnUid = starterUid;
        payload.turnDeadlineAt = Date.now() + TURN_TIMEOUT_MS;
        payload.placementDeadlineAt = 0;
        payload.eventLog = pushEvent(payload.eventLog, `${getPlayerName(room, starterUid)} has the first strike.`);
        startedBattle = true;
      }

      tx.set(ref, payload, { merge: true });
    });

    state.lastResultMessage = startedBattle ? 'All fleets locked. Battle stations!' : 'Fleet locked. Waiting for the opponent.';
  }

  async function maybeFinalizePlacementTimeout() {
    if (!db || !state.roomData || !state.roomId || state.roomData.phase !== 'placement') return;
    if (Number(state.roomData.placementDeadlineAt || 0) > Date.now()) return;
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const room = snap.data() || {};
      if (room.phase !== 'placement' || Number(room.placementDeadlineAt || 0) > Date.now()) return;
      const boards = { ...(room.boards || {}) };
      const playerIds = getPlayerIds(room);
      const nextEvents = getEventLog(room);

      playerIds.forEach((uid) => {
        const board = getBoardState(room, uid);
        if (!board.locked) {
          boards[uid] = {
            ...board,
            ships: board.ships.length ? board.ships : generateRandomFleet(),
            locked: true,
          };
        }
      });

      const starterUid = playerIds[Math.floor(Math.random() * playerIds.length)];
      tx.set(ref, {
        phase: 'battle',
        boards,
        turnUid: starterUid,
        turnDeadlineAt: Date.now() + TURN_TIMEOUT_MS,
        placementDeadlineAt: 0,
        eventLog: pushEvent(nextEvents, `Placement timer expired. ${getPlayerName(room, starterUid)} attacks first.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  }

  function buildAttackOutcome(room, attackerUid, defenderUid, targetIndex, timedOut = false) {
    const attackerBoard = getBoardState(room, attackerUid);
    const defenderBoard = getBoardState(room, defenderUid);
    const incomingShots = [...defenderBoard.incomingShots];
    const outgoingShots = [...attackerBoard.outgoingShots];
    const targetShip = defenderBoard.ships.find((ship) => ship.cells.includes(targetIndex));
    const isHit = Boolean(targetShip) && !timedOut;
    const shotResult = isHit ? 'hit' : 'miss';
    const baseShot = {
      index: targetIndex,
      result: shotResult,
      at: Date.now(),
      attackerUid,
      defenderUid,
    };
    incomingShots.push(baseShot);
    outgoingShots.push(baseShot);

    let sunkShip = null;
    let winnerUid = '';
    if (isHit && targetShip) {
      const hitCells = new Set(
        incomingShots
          .filter((shot) => shot.result === 'hit' || shot.result === 'sunk')
          .map((shot) => Number(shot.index)),
      );
      if (targetShip.cells.every((cell) => hitCells.has(cell))) {
        sunkShip = targetShip;
        outgoingShots[outgoingShots.length - 1] = { ...baseShot, result: 'sunk', shipId: targetShip.id };
        incomingShots[incomingShots.length - 1] = { ...baseShot, result: 'sunk', shipId: targetShip.id };
      }
      const allShipCells = defenderBoard.ships.flatMap((ship) => ship.cells);
      if (allShipCells.every((cell) => hitCells.has(cell))) {
        winnerUid = attackerUid;
      }
    }

    return {
      attackerBoard: {
        ...attackerBoard,
        outgoingShots,
      },
      defenderBoard: {
        ...defenderBoard,
        incomingShots,
      },
      isHit,
      sunkShip,
      winnerUid,
    };
  }

  async function confirmAttack() {
    if (!db || !state.user || !state.roomData || !state.roomId || state.selectedAttackIndex < 0) return;
    const targetIndex = Number(state.selectedAttackIndex);
    let result = { isHit: false, sunkShip: null, winnerUid: '' };

    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const defenderUid = getOpponentUid(room, state.user.uid);
      if (!defenderUid) throw new Error('NO_OPPONENT');

      const attackerBoard = getBoardState(room, state.user.uid);
      if (attackerBoard.outgoingShots.some((shot) => Number(shot.index) === targetIndex)) {
        throw new Error('ALREADY_TARGETED');
      }

      result = buildAttackOutcome(room, state.user.uid, defenderUid, targetIndex);
      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = result.attackerBoard;
      boards[defenderUid] = result.defenderBoard;
      const nextEvents = getEventLog(room);
      const baseEvent = result.isHit
        ? `${getDisplayName(state.user)} landed a hit at ${coordFromIndex(targetIndex)}.`
        : `${getDisplayName(state.user)} missed at ${coordFromIndex(targetIndex)}.`;
      let eventLog = pushEvent(nextEvents, baseEvent);
      if (result.sunkShip) {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, defenderUid)} lost their ${result.sunkShip.name}.`);
      }

      const payload = {
        boards,
        eventLog,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (result.winnerUid) {
        payload.phase = 'end';
        payload.turnUid = '';
        payload.turnDeadlineAt = 0;
        payload.winnerUid = result.winnerUid;
        payload.winnerName = getPlayerName(room, result.winnerUid);
        payload.eventLog = pushEvent(eventLog, `${payload.winnerName} sank the final ship and won the battle.`);
      } else {
        payload.turnUid = defenderUid;
        payload.turnDeadlineAt = Date.now() + TURN_TIMEOUT_MS;
      }

      tx.set(ref, payload, { merge: true });
    });

    state.selectedAttackIndex = -1;
    state.radarMode = false;
    state.lastResultMessage = result.winnerUid
      ? `Victory secured at ${coordFromIndex(targetIndex)}.`
      : result.sunkShip
        ? `Direct hit. ${result.sunkShip.name} sunk.`
        : result.isHit
          ? `Direct hit at ${coordFromIndex(targetIndex)}.`
          : `Miss at ${coordFromIndex(targetIndex)}.`;

    if (window.PlayrProgression?.awardXp) {
      if (result.isHit) window.PlayrProgression.awardXp(XP_HIT, 'battleship-hit', { notifyLevelUp: true });
      if (result.sunkShip) window.PlayrProgression.awardXp(XP_SUNK, 'battleship-sunk', { notifyLevelUp: true });
      if (result.winnerUid === state.user.uid) window.PlayrProgression.awardXp(XP_WIN, 'battleship-win', { notifyLevelUp: true });
    }
    renderAll();
  }

  function findTimeoutMissIndex(defenderBoard, attackerBoard) {
    const targeted = new Set(attackerBoard.outgoingShots.map((shot) => Number(shot.index)));
    const occupied = buildOccupiedSet(defenderBoard.ships);
    const candidates = [];
    for (let index = 0; index < TOTAL_CELLS; index += 1) {
      if (targeted.has(index)) continue;
      if (!occupied.has(index)) candidates.push(index);
    }
    if (candidates.length) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    for (let index = 0; index < TOTAL_CELLS; index += 1) {
      if (!targeted.has(index)) return index;
    }
    return -1;
  }

  async function maybeHandleTurnTimeout() {
    if (!db || !state.roomData || !state.roomId || state.roomData.phase !== 'battle') return;
    if (Number(state.roomData.turnDeadlineAt || 0) > Date.now()) return;
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const room = snap.data() || {};
      if (room.phase !== 'battle' || Number(room.turnDeadlineAt || 0) > Date.now()) return;
      const attackerUid = room.turnUid;
      const defenderUid = getOpponentUid(room, attackerUid);
      if (!attackerUid || !defenderUid) return;
      const attackerBoard = getBoardState(room, attackerUid);
      const defenderBoard = getBoardState(room, defenderUid);
      const timeoutIndex = findTimeoutMissIndex(defenderBoard, attackerBoard);
      const nextEvents = getEventLog(room);
      const payload = {
        turnUid: defenderUid,
        turnDeadlineAt: Date.now() + TURN_TIMEOUT_MS,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (timeoutIndex >= 0) {
        const result = buildAttackOutcome(room, attackerUid, defenderUid, timeoutIndex, true);
        payload.boards = {
          ...(room.boards || {}),
          [attackerUid]: result.attackerBoard,
          [defenderUid]: result.defenderBoard,
        };
        payload.eventLog = pushEvent(nextEvents, `${getPlayerName(room, attackerUid)} timed out. Automatic miss at ${coordFromIndex(timeoutIndex)}.`);
      } else {
        payload.eventLog = pushEvent(nextEvents, `${getPlayerName(room, attackerUid)} timed out and lost the turn.`);
      }

      tx.set(ref, payload, { merge: true });
    });
  }

  async function useRadar(index) {
    if (!db || !state.user || !state.roomData || !state.roomId) return;
    let detected = 0;
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const myBoard = getBoardState(room, state.user.uid);
      if (myBoard.radarUsed) throw new Error('RADAR_USED');
      const enemyUid = getOpponentUid(room, state.user.uid);
      const enemyBoard = getBoardState(room, enemyUid);
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const cells = [];
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          const nextRow = row + rowOffset;
          const nextCol = col + colOffset;
          if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) continue;
          cells.push(indexFromCell(nextRow, nextCol));
        }
      }
      const occupied = buildOccupiedSet(enemyBoard.ships);
      detected = cells.filter((cell) => occupied.has(cell)).length;
      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = {
        ...myBoard,
        radarUsed: true,
        radarScans: [...myBoard.radarScans, { center: index, cells, detected, at: Date.now() }].slice(-4),
      };

      tx.set(ref, {
        boards,
        eventLog: pushEvent(getEventLog(room), `${getDisplayName(state.user)} used Radar Ping at ${coordFromIndex(index)} and detected ${detected} ship tiles nearby.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    state.lastResultMessage = `Radar Ping at ${coordFromIndex(index)} detected ${detected} ship tiles in the 3x3 zone.`;
    state.radarMode = false;
    renderAll();
  }

  function handleBoardClick(event) {
    const button = event.target.closest('[data-board-type][data-cell-index]');
    if (!button || !state.roomData) return;
    const boardType = button.dataset.boardType || '';
    const index = Number(button.dataset.cellIndex);
    if (!Number.isInteger(index) || index < 0 || index >= TOTAL_CELLS) return;

    if (boardType === 'own' && state.roomData.phase === 'placement' && !isPlacementLocked(state.roomData)) {
      const placed = placeShipInDraft(state.selectedShipId, index, state.orientation);
      if (!placed) {
        state.lastResultMessage = 'That ship does not fit there without overlapping another one.';
        renderAll();
      }
      return;
    }

    if (boardType === 'enemy' && state.roomData.phase === 'battle' && isMyTurn(state.roomData)) {
      if (state.radarMode) {
        void useRadar(index).catch(() => {
          state.lastResultMessage = 'Radar ping could not be used right now.';
          state.radarMode = false;
          renderAll();
        });
        return;
      }
      const trackingBoard = getEnemyTrackingBoard(state.roomData);
      if (trackingBoard.outgoingShots.some((shot) => Number(shot.index) === index)) return;
      state.selectedAttackIndex = index;
      renderAll();
    }
  }

  function bindEvents() {
    els.showJoinBtn?.addEventListener('click', () => {
      state.gateMode = 'join';
      renderAll();
    });

    els.backToChoiceBtn?.addEventListener('click', () => {
      state.gateMode = 'choice';
      setGateError('');
      renderAll();
    });

    els.createRoomBtn?.addEventListener('click', () => {
      void createRoom().catch((error) => {
        setGateError(`Could not create room: ${error?.message || 'unknown error'}.`);
      });
    });

    els.joinRoomBtn?.addEventListener('click', () => {
      const roomId = parseRoomId(els.roomIdInput?.value);
      if (!roomId) {
        setGateError('Enter a valid Battleship room code like bnf-ab12cd.');
        return;
      }
      void joinRoom(roomId).then(() => {
        state.gateMode = 'choice';
        setGateError('');
      }).catch((error) => {
        const map = {
          ROOM_NOT_FOUND: 'Room not found.',
          ROOM_FULL: 'That room already has two players.',
          INVALID_ROOM: 'Invalid room code.',
        };
        setGateError(map[error?.message] || `Could not join room: ${error?.message || 'unknown error'}.`);
      });
    });

    els.copyRoomCodeBtn?.addEventListener('click', () => {
      if (!state.roomId) return;
      void copyText(state.roomId, 'Room code copied.');
    });

    els.copyInviteBtn?.addEventListener('click', () => {
      if (!state.roomId) return;
      void copyText(`${window.location.origin}${window.location.pathname}?room=${state.roomId}`, 'Invite link copied.');
    });

    els.rotateShipBtn?.addEventListener('click', () => {
      state.orientation = state.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      renderAll();
    });

    els.randomizeFleetBtn?.addEventListener('click', () => {
      state.draftShips = generateRandomFleet();
      const nextUnplaced = SHIPS.find((ship) => !state.draftShips.some((placed) => placed.id === ship.id));
      state.selectedShipId = nextUnplaced?.id || SHIPS[0].id;
      renderAll();
    });

    els.clearFleetBtn?.addEventListener('click', clearDraftFleet);
    els.lockFleetBtn?.addEventListener('click', () => {
      void lockFleet().catch(() => {
        state.lastResultMessage = 'Could not lock your fleet.';
        renderAll();
      });
    });

    els.confirmAttackBtn?.addEventListener('click', () => {
      void confirmAttack().catch((error) => {
        state.lastResultMessage = `Attack failed: ${error?.message || 'unknown error'}.`;
        renderAll();
      });
    });

    els.radarBtn?.addEventListener('click', () => {
      if (!state.roomData || !isMyTurn(state.roomData)) return;
      const trackingBoard = getEnemyTrackingBoard(state.roomData);
      if (trackingBoard.radarUsed) return;
      state.radarMode = !state.radarMode;
      if (state.radarMode) state.selectedAttackIndex = -1;
      renderAll();
    });

    els.fleetShipList?.addEventListener('click', (event) => {
      const shipButton = event.target.closest('[data-ship-id]');
      if (!shipButton) return;
      state.selectedShipId = shipButton.dataset.shipId || SHIPS[0].id;
      renderAll();
    });

    els.ownBoard?.addEventListener('click', handleBoardClick);
    els.enemyBoard?.addEventListener('click', handleBoardClick);

    window.addEventListener('keydown', (event) => {
      if (!state.roomData) return;
      if (event.key === 'Enter' && state.roomData.phase === 'battle' && state.selectedAttackIndex >= 0 && !state.radarMode) {
        event.preventDefault();
        void confirmAttack().catch(() => {
          state.lastResultMessage = 'Attack failed.';
          renderAll();
        });
      }
      if (event.key.toLowerCase() === 'r' && state.roomData.phase === 'battle') {
        const trackingBoard = getEnemyTrackingBoard(state.roomData);
        if (!trackingBoard.radarUsed && isMyTurn(state.roomData)) {
          event.preventDefault();
          state.radarMode = !state.radarMode;
          if (state.radarMode) state.selectedAttackIndex = -1;
          renderAll();
        }
      }
      if (event.key === 'Escape') {
        state.selectedAttackIndex = -1;
        state.radarMode = false;
        renderAll();
      }
    });
  }

  function startTickLoop() {
    if (state.tickHandle) return;
    state.tickHandle = window.setInterval(() => {
      if (state.roomData?.phase === 'placement') {
        void maybeFinalizePlacementTimeout().catch(() => {});
      }
      if (state.roomData?.phase === 'battle') {
        void maybeHandleTurnTimeout().catch(() => {});
      }
      renderAll();
    }, 1000);
  }

  function start() {
    if (!app || !auth || !db) {
      setStatus('Firebase is not available for this page.');
      return;
    }

    bindEvents();
    startTickLoop();
    renderAll();

    auth.onAuthStateChanged((user) => {
      state.user = user || null;
      if (!state.user) {
        unsubscribeRoom();
        state.roomData = null;
        state.roomId = '';
        updateUrl('');
        renderAll();
        return;
      }

      const roomFromUrl = parseRoomId(new URL(window.location.href).searchParams.get('room'));
      if (roomFromUrl) {
        if (els.roomIdInput) els.roomIdInput.value = roomFromUrl;
        void joinRoom(roomFromUrl).catch((error) => {
          setGateError(error?.message === 'ROOM_NOT_FOUND' ? 'Room not found.' : `Could not join room: ${error?.message || 'unknown error'}.`);
        });
      } else {
        renderAll();
      }
    });
  }

  start();
})();
