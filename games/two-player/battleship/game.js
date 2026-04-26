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
  const PLACEMENT_TIMEOUT_MS = 120 * 1000;
  const TURN_TIMEOUT_MS = 30 * 1000;
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
  const POWERS = [
    {
      id: 'radar',
      name: 'Radar',
      hotkey: '1',
      mode: 'enemy',
      description: 'Scan around a previously hit enemy tile to reveal nearby ship positions.',
      summary: 'Needs a previously hit enemy tile.',
    },
    {
      id: 'airstrike',
      name: 'Airstrike',
      hotkey: '2',
      mode: 'enemy',
      description: 'Attack an entire horizontal or vertical line on the enemy board.',
      summary: 'Uses the current line orientation.',
    },
    {
      id: 'mine',
      name: 'Mine',
      hotkey: '3',
      mode: 'own',
      description: 'Place a hidden trap on your board. If it is hit, three random counter-shots fire back.',
      summary: 'Select one tile on your own board.',
    },
    {
      id: 'nuke',
      name: 'Nuke',
      hotkey: '4',
      mode: 'enemy',
      description: 'Detonate a 3x3 blast zone on the enemy board.',
      summary: 'Targets a full 3x3 area.',
    },
  ];

  const state = {
    user: null,
    roomId: '',
    roomData: null,
    roomUnsub: null,
    gateMode: 'choice',
    draftShips: [],
    selectedShipId: SHIPS[0].id,
    pendingPlacementIndex: -1,
    orientation: 'horizontal',
    activePowerId: '',
    selectedAttackIndex: -1,
    selectedMineIndex: -1,
    lastResultMessage: 'Waiting for room activity.',
    seenShipCutsceneKeys: [],
    shipCutsceneTimer: null,
    tickHandle: null,
  };

  const els = {
    gameStatus: document.getElementById('gameStatus'),
    fleetSurface: document.getElementById('fleetSurface'),
    roomGate: document.getElementById('roomGate'),
    gateChoice: document.getElementById('gateChoice'),
    joinFlow: document.getElementById('joinFlow'),
    showJoinBtn: document.getElementById('showJoinBtn'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    backToChoiceBtn: document.getElementById('backToChoiceBtn'),
    roomIdInput: document.getElementById('roomIdInput'),
    roomGateError: document.getElementById('roomGateError'),
    shipCutscene: document.getElementById('shipCutscene'),
    shipCutsceneTitle: document.getElementById('shipCutsceneTitle'),
    shipCutsceneText: document.getElementById('shipCutsceneText'),
    battleLayout: document.getElementById('battleLayout'),
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
    confirmAttackBtn: document.getElementById('confirmAttackBtn'),
    controlHint: document.getElementById('controlHint'),
    powerList: document.getElementById('powerList'),
    powerModeLabel: document.getElementById('powerModeLabel'),
    powerHint: document.getElementById('powerHint'),
    ownBoard: document.getElementById('ownBoard'),
    enemyBoard: document.getElementById('enemyBoard'),
    fleetHealthLabel: document.getElementById('fleetHealthLabel'),
    enemyBoardHint: document.getElementById('enemyBoardHint'),
    resultBanner: document.getElementById('resultBanner'),
  };

  function getDefaultPowers() {
    return {
      radar: 1,
      airstrike: 1,
      mine: 1,
      nuke: 1,
    };
  }

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
    return /^bnf-[a-z0-9]{6,16}$/.test(normalized) ? normalized : '';
  }

  function getShipConfig(shipId) {
    return SHIPS.find((ship) => ship.id === shipId) || null;
  }

  function getPowerConfig(powerId) {
    return POWERS.find((power) => power.id === powerId) || null;
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

  function clonePowerInventory(powers) {
    const defaults = getDefaultPowers();
    const source = powers && typeof powers === 'object' ? powers : {};
    return {
      radar: Math.max(0, Number(source.radar ?? defaults.radar)),
      airstrike: Math.max(0, Number(source.airstrike ?? defaults.airstrike)),
      mine: Math.max(0, Number(source.mine ?? defaults.mine)),
      nuke: Math.max(0, Number(source.nuke ?? defaults.nuke)),
    };
  }

  function cloneShots(shots) {
    return Array.isArray(shots)
      ? shots.map((shot) => ({
          ...shot,
          index: Number(shot.index),
        }))
      : [];
  }

  function cloneRadarScans(scans) {
    return Array.isArray(scans)
      ? scans.map((scan) => ({
          ...scan,
          center: Number(scan.center),
          detected: Number(scan.detected || 0),
          cells: Array.isArray(scan.cells) ? scan.cells.map((cell) => Number(cell)) : [],
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
      powers: getDefaultPowers(),
      mineCells: [],
      triggeredMines: [],
    };
  }

  function getBoardState(room, uid) {
    const raw = room?.boards?.[uid];
    if (!raw || typeof raw !== 'object') return getEmptyBoardState();
    return {
      ships: cloneShips(raw.ships),
      locked: Boolean(raw.locked),
      incomingShots: cloneShots(raw.incomingShots),
      outgoingShots: cloneShots(raw.outgoingShots),
      radarScans: cloneRadarScans(raw.radarScans),
      radarUsed: Boolean(raw.radarUsed),
      powers: clonePowerInventory(raw.powers),
      mineCells: Array.isArray(raw.mineCells) ? raw.mineCells.map((cell) => Number(cell)) : [],
      triggeredMines: Array.isArray(raw.triggeredMines) ? raw.triggeredMines.map((cell) => Number(cell)) : [],
    };
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

  function getCellsInArea(centerIndex, radius = 1) {
    const row = Math.floor(centerIndex / GRID_SIZE);
    const col = centerIndex % GRID_SIZE;
    const cells = [];
    for (let rowOffset = -radius; rowOffset <= radius; rowOffset += 1) {
      for (let colOffset = -radius; colOffset <= radius; colOffset += 1) {
        const nextRow = row + rowOffset;
        const nextCol = col + colOffset;
        if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) continue;
        cells.push(indexFromCell(nextRow, nextCol));
      }
    }
    return cells;
  }

  function getLineCells(index, orientation) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    if (orientation === 'vertical') {
      return Array.from({ length: GRID_SIZE }, (_, nextRow) => indexFromCell(nextRow, col));
    }
    return Array.from({ length: GRID_SIZE }, (_, nextCol) => indexFromCell(row, nextCol));
  }

  function getPendingPlacementCells(shipId = state.selectedShipId, startIndex = state.pendingPlacementIndex, orientation = state.orientation) {
    const config = getShipConfig(shipId);
    if (!config || startIndex < 0) return [];
    const cells = buildShipCells(startIndex, config.size, orientation);
    return cells.length === config.size ? cells : [];
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
    state.pendingPlacementIndex = -1;
    renderAll();
    return true;
  }

  function clearDraftFleet() {
    state.draftShips = [];
    state.selectedShipId = SHIPS[0].id;
    state.pendingPlacementIndex = -1;
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
    return [room?.hostUid || '', room?.guestUid || ''].filter(Boolean);
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

  function getSunkShipIds(board, incomingShotsOverride = null) {
    const incomingShots = Array.isArray(incomingShotsOverride) ? incomingShotsOverride : board.incomingShots;
    const hitCells = new Set(
      incomingShots
        .filter((shot) => shot.result === 'hit' || shot.result === 'sunk')
        .map((shot) => Number(shot.index)),
    );
    return new Set(
      board.ships
        .filter((ship) => ship.cells.every((cell) => hitCells.has(Number(cell))))
        .map((ship) => ship.id),
    );
  }

  function isFleetDestroyed(board, incomingShotsOverride = null) {
    if (!board.ships.length) return false;
    const hitCells = new Set(
      (incomingShotsOverride || board.incomingShots)
        .filter((shot) => shot.result === 'hit' || shot.result === 'sunk')
        .map((shot) => Number(shot.index)),
    );
    return board.ships.flatMap((ship) => ship.cells).every((cell) => hitCells.has(Number(cell)));
  }

  function getUntargetedIndices(attackerBoard, indices) {
    const targeted = new Set(attackerBoard.outgoingShots.map((shot) => Number(shot.index)));
    return Array.from(new Set(indices.map((index) => Number(index))))
      .filter((index) => Number.isInteger(index) && index >= 0 && index < TOTAL_CELLS && !targeted.has(index));
  }

  function resolveFireSequence(attackerBoard, defenderBoard, attackerUid, defenderUid, targetIndices, options = {}) {
    const incomingShots = cloneShots(defenderBoard.incomingShots);
    const outgoingShots = cloneShots(attackerBoard.outgoingShots);
    const sunkBefore = getSunkShipIds(defenderBoard, incomingShots);
    const shotResults = [];
    const sunkShips = [];
    const timedOut = Boolean(options.timedOut);

    for (const targetIndex of getUntargetedIndices(attackerBoard, targetIndices)) {
      const targetShip = defenderBoard.ships.find((ship) => ship.cells.includes(targetIndex));
      const isHit = Boolean(targetShip) && !timedOut;
      const baseShot = {
        index: targetIndex,
        result: isHit ? 'hit' : 'miss',
        at: Date.now(),
        attackerUid,
        defenderUid,
        source: options.source || 'shot',
      };

      incomingShots.push(baseShot);
      outgoingShots.push(baseShot);

      let finalResult = baseShot.result;
      if (isHit && targetShip) {
        const nowSunk = targetShip.cells.every((cell) => incomingShots.some((shot) => Number(shot.index) === Number(cell) && (shot.result === 'hit' || shot.result === 'sunk')));
        if (nowSunk && !sunkBefore.has(targetShip.id)) {
          finalResult = 'sunk';
          sunkBefore.add(targetShip.id);
          sunkShips.push(targetShip);
          incomingShots[incomingShots.length - 1] = { ...baseShot, result: 'sunk', shipId: targetShip.id };
          outgoingShots[outgoingShots.length - 1] = { ...baseShot, result: 'sunk', shipId: targetShip.id };
        }
      }

      shotResults.push({
        index: targetIndex,
        result: finalResult,
        shipId: targetShip?.id || '',
        shipName: targetShip?.name || '',
      });
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
      shotResults,
      sunkShips,
    };
  }

  function formatShotSummary(shotResults) {
    const hits = shotResults.filter((shot) => shot.result === 'hit' || shot.result === 'sunk').length;
    const misses = shotResults.filter((shot) => shot.result === 'miss').length;
    if (!shotResults.length) return 'no new targets';
    if (!hits && misses) return `${misses} miss${misses === 1 ? '' : 'es'}`;
    if (hits && !misses) return `${hits} hit${hits === 1 ? '' : 's'}`;
    return `${hits} hit${hits === 1 ? '' : 's'}, ${misses} miss${misses === 1 ? '' : 'es'}`;
  }

  function chooseRandomUntargetedIndices(attackerBoard, count) {
    const targeted = new Set(attackerBoard.outgoingShots.map((shot) => Number(shot.index)));
    const candidates = [];
    for (let index = 0; index < TOTAL_CELLS; index += 1) {
      if (!targeted.has(index)) candidates.push(index);
    }
    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      const temp = candidates[i];
      candidates[i] = candidates[swapIndex];
      candidates[swapIndex] = temp;
    }
    return candidates.slice(0, count);
  }

  function clearBattleSelections() {
    state.activePowerId = '';
    state.selectedAttackIndex = -1;
    state.selectedMineIndex = -1;
  }

  function rememberShipCutsceneKey(key) {
    const nextKeys = state.seenShipCutsceneKeys.filter((entry) => entry !== key);
    nextKeys.push(key);
    state.seenShipCutsceneKeys = nextKeys.slice(-18);
  }

  function showShipCutscene(title, text) {
    if (!els.shipCutscene || !els.shipCutsceneTitle || !els.shipCutsceneText) return;
    if (state.shipCutsceneTimer) {
      window.clearTimeout(state.shipCutsceneTimer);
      state.shipCutsceneTimer = null;
    }
    els.shipCutsceneTitle.textContent = title;
    els.shipCutsceneText.textContent = text;
    els.shipCutscene.hidden = false;
    els.shipCutscene.classList.remove('ship-cutscene-restart');
    void els.shipCutscene.offsetWidth;
    els.shipCutscene.classList.add('ship-cutscene-restart');
    state.shipCutsceneTimer = window.setTimeout(() => {
      if (els.shipCutscene) els.shipCutscene.hidden = true;
      state.shipCutsceneTimer = null;
    }, 1450);
  }

  function hideShipCutscene() {
    if (state.shipCutsceneTimer) {
      window.clearTimeout(state.shipCutsceneTimer);
      state.shipCutsceneTimer = null;
    }
    if (els.shipCutscene) els.shipCutscene.hidden = true;
  }

  function scanShipCutsceneEvents(room) {
    const events = getEventLog(room).slice(0, 4).reverse();
    events.forEach((event) => {
      const text = String(event?.text || '');
      const match = text.match(/^(.*?) lost their (.+)\.$/);
      if (!match) return;
      const key = `${Number(event?.at) || 0}:${text}`;
      if (state.seenShipCutsceneKeys.includes(key)) return;
      rememberShipCutsceneKey(key);
      const captainName = match[1] || 'A captain';
      const shipName = match[2] || 'Ship';
      showShipCutscene(`${shipName} Destroyed`, `${captainName}'s ${shipName} has been wiped out.`);
    });
  }

  function primeShipCutsceneEvents(room) {
    getEventLog(room).slice(0, 6).forEach((event) => {
      const text = String(event?.text || '');
      if (!/^(.*?) lost their (.+)\.$/.test(text)) return;
      rememberShipCutsceneKey(`${Number(event?.at) || 0}:${text}`);
    });
  }

  function getActivePower() {
    return getPowerConfig(state.activePowerId);
  }

  function getSelectedLabel(room) {
    if (room?.phase === 'placement') {
      const shipName = getShipConfig(state.selectedShipId)?.name || 'None';
      return state.pendingPlacementIndex >= 0
        ? `${shipName} ${coordFromIndex(state.pendingPlacementIndex)}`
        : shipName;
    }
    if (room?.phase !== 'battle') return 'None';
    const activePower = getActivePower();
    if (activePower?.mode === 'own' && state.selectedMineIndex >= 0) {
      return `${activePower.name} ${coordFromIndex(state.selectedMineIndex)}`;
    }
    if (state.selectedAttackIndex >= 0) {
      return `${activePower?.name || 'Shot'} ${coordFromIndex(state.selectedAttackIndex)}`;
    }
    if (activePower) return activePower.name;
    return 'None';
  }

  function buildBoardMarkup(type, room) {
    const board = type === 'own' ? getMyBoard(room) : getEnemyBoard(room);
    const trackingBoard = getEnemyTrackingBoard(room);
    const canInteract = room?.phase === 'placement'
      ? type === 'own' && !board.locked
      : room?.phase === 'battle'
        ? (
          (type === 'enemy' && isMyTurn(room))
          || (type === 'own' && isMyTurn(room) && state.activePowerId === 'mine')
        )
        : false;
    const outgoingMap = getShotMap(trackingBoard.outgoingShots);
    const incomingMap = getShotMap(board.incomingShots);
    const displayShips = type === 'own' && room?.phase === 'placement' && !board.locked
      ? cloneShips(state.draftShips)
      : board.ships;
    const occupied = buildOccupiedSet(displayShips);
    const radarCells = new Set((trackingBoard.radarScans || []).flatMap((scan) => scan.cells || []));
    const mineCells = new Set(board.mineCells || []);
    const triggeredMines = new Set(board.triggeredMines || []);
    const pendingPlacementCells = type === 'own' && room?.phase === 'placement' && !board.locked
      ? new Set(getPendingPlacementCells())
      : new Set();
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
          if (ship) {
            classes.push(ship.orientation === 'vertical' ? 'ship-vertical' : 'ship-horizontal');
            const segmentIndex = ship.cells.indexOf(index);
            if (ship.cells.length <= 1) {
              classes.push('ship-single');
            } else if (segmentIndex === 0) {
              classes.push('ship-start');
            } else if (segmentIndex === ship.cells.length - 1) {
              classes.push('ship-end');
            } else {
              classes.push('ship-middle');
            }
          }
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

        if (type === 'own' && mineCells.has(index)) {
          classes.push('mine-armed');
        }

        if (type === 'own' && triggeredMines.has(index)) {
          classes.push('mine-triggered');
        }

        if (type === 'enemy' && ship && shot && (shot.result === 'hit' || shot.result === 'sunk') && isShipSunk(board, ship)) {
          classes.push('revealed-sunk');
        }

        if (type === 'enemy' && state.selectedAttackIndex === index) {
          classes.push('selected');
        }

        if (type === 'own' && state.selectedMineIndex === index && state.activePowerId === 'mine') {
          classes.push('selected');
        }

        if (pendingPlacementCells.has(index)) {
          classes.push('preview-pending');
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
      const statusClass = board.locked ? 'ready' : 'waiting';
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

  function renderPowerControls(room) {
    if (!els.powerList) return;
    const board = getMyBoard(room);
    const activePower = getActivePower();
    const battleReady = room?.phase === 'battle' && isMyTurn(room);

    els.powerList.innerHTML = POWERS.map((power) => {
      const remaining = Number(board.powers?.[power.id] || 0);
      const selected = activePower?.id === power.id;
      const used = remaining <= 0;
      return `
        <button
          class="power-card${selected ? ' is-selected' : ''}${used ? ' is-used' : ''}"
          type="button"
          data-power-id="${power.id}"
          ${battleReady && !used ? '' : 'disabled'}
        >
          <div class="power-card-header">
            <strong>${power.name}</strong>
            <span class="power-hotkey">${power.hotkey}</span>
          </div>
          <span>${power.description}</span>
          <span class="tag">${remaining > 0 ? `${remaining} ready` : 'Used'}</span>
        </button>
      `;
    }).join('');
  }

  function buildLobbyBoardMarkup() {
    let markup = '<div class="grid-wrap">';
    markup += '<span class="axis-cell" aria-hidden="true"></span>';
    for (let col = 0; col < GRID_SIZE; col += 1) {
      markup += `<span class="axis-cell" aria-hidden="true">${col + 1}</span>`;
    }
    for (let row = 0; row < GRID_SIZE; row += 1) {
      markup += `<span class="axis-cell" aria-hidden="true">${ROW_LABELS[row]}</span>`;
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const index = indexFromCell(row, col);
        markup += `
          <button
            class="board-cell"
            type="button"
            data-board-type="lobby"
            data-cell-index="${index}"
            disabled
            aria-label="Lobby board ${coordFromIndex(index)}"
          ><span class="cell-mark"></span></button>
        `;
      }
    }
    markup += '</div>';
    return markup;
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
    const inRoom = Boolean(state.roomId || state.roomData);

    if (els.roomGate) {
      els.roomGate.hidden = inRoom;
      els.roomGate.toggleAttribute('hidden', inRoom);
    }
    if (els.fleetSurface) {
      els.fleetSurface.classList.toggle('is-lobby-view', !inRoom);
    }
    if (els.battleLayout) els.battleLayout.hidden = false;
    if (els.battleHud) els.battleHud.hidden = !inRoom;
    if (els.battleStage) els.battleStage.hidden = false;
    if (!inRoom) {
      hideShipCutscene();
      if (els.ownBoard) els.ownBoard.innerHTML = buildLobbyBoardMarkup();
      if (els.enemyBoard) els.enemyBoard.innerHTML = buildLobbyBoardMarkup();
      if (els.fleetHealthLabel) els.fleetHealthLabel.textContent = 'Awaiting room';
      if (els.enemyBoardHint) els.enemyBoardHint.textContent = 'Create or join a room';
      if (els.powerList) els.powerList.innerHTML = '';
      if (els.powerModeLabel) els.powerModeLabel.textContent = 'Standard Shot';
    }
    if (els.gateChoice) els.gateChoice.hidden = state.gateMode !== 'choice';
    if (els.joinFlow) els.joinFlow.hidden = state.gateMode !== 'join';

    if (!signedIn) {
      setStatus('Log in on the hub first to play multiplayer games.');
      return;
    }

    if (!room) {
      setStatus(inRoom ? 'Loading room...' : 'Create a room or join with a code.');
      return;
    }

    const myBoard = getMyBoard(room);
    const trackingBoard = getEnemyTrackingBoard(room);
    const placementLocked = myBoard.locked;
    const allPlaced = SHIPS.every((ship) => state.draftShips.some((placed) => placed.id === ship.id));
    const activePower = getActivePower();
    const pendingPlacementReady = room.phase === 'placement'
      && !placementLocked
      && state.pendingPlacementIndex >= 0
      && canPlaceShip(state.draftShips, state.selectedShipId, state.pendingPlacementIndex, state.orientation);
    const readyToLockFleet = room.phase === 'placement' && !placementLocked && allPlaced && state.pendingPlacementIndex < 0;
    const canConfirmBattleAction = room.phase === 'battle' && isMyTurn(room) && (
      (activePower?.mode === 'own' && state.selectedMineIndex >= 0)
      || (activePower?.mode !== 'own' && state.selectedAttackIndex >= 0)
      || (!activePower && state.selectedAttackIndex >= 0)
    );

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
      els.selectionLabel.textContent = getSelectedLabel(room);
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
        ? (placementLocked
          ? 'Fleet locked in. Waiting for the opposing captain.'
          : pendingPlacementReady
            ? `Press Enter to place the ${getShipConfig(state.selectedShipId)?.name || 'ship'} at ${coordFromIndex(state.pendingPlacementIndex)}.`
            : readyToLockFleet
              ? 'All ships are placed. You can still reposition any ship, or press Lock Fleet when you are ready.'
              : 'Click your board to stage a ship position, then press Enter to place it before the timer expires.')
        : room.phase === 'battle'
          ? (activePower?.id === 'mine'
            ? 'Mine selected. Pick one tile on your own board, then confirm to arm the trap and end your turn.'
            : activePower?.id === 'radar'
              ? 'Radar selected. Pick an enemy tile you have already hit to scan its surrounding 3x3 zone.'
              : activePower?.id === 'airstrike'
                ? `Airstrike selected. Pick an enemy tile to strike its ${state.orientation} line.`
                : activePower?.id === 'nuke'
                  ? 'Nuke selected. Pick an enemy tile to blast a 3x3 area.'
                  : (isMyTurn(room) ? 'Pick an enemy coordinate and confirm your attack.' : 'Hold position. You can attack when the turn indicator points to you.'))
          : room.phase === 'end'
            ? (room.winnerUid === state.user?.uid ? 'Victory secured. Launch another room to play again.' : 'Your fleet was lost. Create another room for a rematch.')
            : 'The room enters ship placement as soon as a second captain joins.';
    }
    if (els.rotateShipBtn) {
      const showRotate = (room.phase === 'placement' && !placementLocked) || (room.phase === 'battle' && activePower?.id === 'airstrike' && isMyTurn(room));
      els.rotateShipBtn.hidden = !showRotate;
      els.rotateShipBtn.textContent = room.phase === 'battle'
        ? `Line: ${state.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`
        : `Rotate: ${state.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}`;
    }
    if (els.randomizeFleetBtn) els.randomizeFleetBtn.hidden = room.phase !== 'placement' || placementLocked;
    if (els.clearFleetBtn) els.clearFleetBtn.hidden = room.phase !== 'placement' || placementLocked;
    if (els.lockFleetBtn) {
      els.lockFleetBtn.hidden = room.phase !== 'placement';
      els.lockFleetBtn.disabled = placementLocked || !allPlaced;
      els.lockFleetBtn.textContent = placementLocked ? 'Fleet Locked' : 'Lock Fleet';
    }
    if (els.confirmAttackBtn) {
      els.confirmAttackBtn.hidden = room.phase !== 'battle';
      els.confirmAttackBtn.disabled = !canConfirmBattleAction;
      els.confirmAttackBtn.textContent = activePower
        ? `Confirm ${activePower.name}`
        : 'Confirm Attack';
    }
    if (els.powerModeLabel) {
      els.powerModeLabel.textContent = activePower
        ? activePower.name + (activePower.id === 'airstrike' ? ` · ${state.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}` : '')
        : 'Standard Shot';
    }
    if (els.powerHint) {
      els.powerHint.textContent = room.phase === 'battle'
        ? (activePower?.summary || 'Use one special power per turn. Number keys 1-4 pick a power, R rotates airstrikes, and Enter confirms.')
        : 'Powers unlock during battle. Number keys 1-4 pick a power, R rotates airstrikes, and Enter confirms.';
    }
    if (els.fleetHealthLabel) {
      const displayShips = room.phase === 'placement' && !myBoard.locked ? state.draftShips : myBoard.ships;
      els.fleetHealthLabel.textContent = getFleetHealthText(myBoard, displayShips);
    }
    if (els.enemyBoardHint) {
      els.enemyBoardHint.textContent = room.phase === 'battle'
        ? (
          activePower?.id === 'mine'
            ? 'Mine arms on your own board'
            : state.selectedAttackIndex >= 0
              ? `${activePower?.name || 'Shot'} ${coordFromIndex(state.selectedAttackIndex)}`
              : activePower
                ? `${activePower.name} ready`
                : 'Pick a coordinate'
        )
        : pendingPlacementReady
          ? `Ready to place at ${coordFromIndex(state.pendingPlacementIndex)}`
          : 'Enemy fleet hidden';
    }
    if (els.resultBanner) els.resultBanner.textContent = state.lastResultMessage;

    renderPlayerStatus(room);
    renderShipControls(room);
    renderPowerControls(room);
    renderBoards(room);

    setStatus(room.phase === 'end'
      ? (room.winnerUid === state.user?.uid ? 'You won the battle.' : `${getPlayerName(room, room.winnerUid)} won the battle.`)
      : `Room ${state.roomId} ready.`);
  }

  async function subscribeToRoom(roomId) {
    unsubscribeRoom();
    state.roomId = roomId;
    state.gateMode = 'choice';
    setGateError('');
    renderAll();
    state.roomUnsub = roomRef(roomId).onSnapshot((snap) => {
      if (!snap.exists) {
        state.roomData = null;
        state.roomId = '';
        state.pendingPlacementIndex = -1;
        clearBattleSelections();
        state.lastResultMessage = 'Room no longer exists.';
        updateUrl('');
        renderAll();
        return;
      }

      const room = snap.data() || {};
      const hadRoomSnapshot = Boolean(state.roomData);
      state.roomData = room;
      if (hadRoomSnapshot) {
        scanShipCutsceneEvents(room);
      } else {
        primeShipCutsceneEvents(room);
      }
      const myBoard = getMyBoard(room);
      if (room.phase === 'placement' && !myBoard.locked && (!state.draftShips.length || state.draftShips.every((ship) => !ship.cells?.length))) {
        state.draftShips = cloneShips(myBoard.ships);
      }
      if (myBoard.locked) {
        state.draftShips = cloneShips(myBoard.ships);
        state.pendingPlacementIndex = -1;
      }
      if (room.phase !== 'placement') {
        state.pendingPlacementIndex = -1;
      }
      if (room.phase !== 'battle' || !isMyTurn(room)) {
        state.activePowerId = '';
        state.selectedMineIndex = -1;
      }
      if (room.phase !== 'battle') {
        state.selectedAttackIndex = -1;
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
    clearBattleSelections();
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
    clearBattleSelections();
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

  function finalizeBattleState(payload, room, attackerUid, defenderUid, attackerBoard, defenderBoard, eventLog) {
    if (isFleetDestroyed(defenderBoard)) {
      payload.phase = 'end';
      payload.turnUid = '';
      payload.turnDeadlineAt = 0;
      payload.winnerUid = attackerUid;
      payload.winnerName = getPlayerName(room, attackerUid);
      payload.eventLog = pushEvent(eventLog, `${payload.winnerName} sank the final ship and won the battle.`);
      return;
    }
    if (isFleetDestroyed(attackerBoard)) {
      payload.phase = 'end';
      payload.turnUid = '';
      payload.turnDeadlineAt = 0;
      payload.winnerUid = defenderUid;
      payload.winnerName = getPlayerName(room, defenderUid);
      payload.eventLog = pushEvent(eventLog, `${payload.winnerName} fought back and won the battle.`);
      return;
    }

    payload.turnUid = payload.keepTurnUid || defenderUid;
    payload.turnDeadlineAt = Date.now() + TURN_TIMEOUT_MS;
    delete payload.keepTurnUid;
  }

  function consumePower(board, powerId) {
    const powers = clonePowerInventory(board.powers);
    powers[powerId] = Math.max(0, Number(powers[powerId] || 0) - 1);
    return {
      ...board,
      powers,
      radarUsed: powerId === 'radar' ? true : board.radarUsed,
    };
  }

  async function confirmAttack() {
    if (!db || !state.user || !state.roomData || !state.roomId || state.selectedAttackIndex < 0) return;
    const targetIndex = Number(state.selectedAttackIndex);
    let resultMessage = '';

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
      const defenderBoard = getBoardState(room, defenderUid);
      const sequence = resolveFireSequence(attackerBoard, defenderBoard, state.user.uid, defenderUid, [targetIndex], { source: 'shot' });
      if (!sequence.shotResults.length) throw new Error('ALREADY_TARGETED');
      const mineOutcome = maybeTriggerMine(state.user.uid, defenderUid, room, sequence);
      let nextAttackerBoard = mineOutcome.attackerBoard;
      let nextDefenderBoard = mineOutcome.defenderBoard;

      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = nextAttackerBoard;
      boards[defenderUid] = nextDefenderBoard;
      let eventLog = pushEvent(getEventLog(room), sequence.shotResults[0].result === 'miss'
        ? `${getDisplayName(state.user)} missed at ${coordFromIndex(targetIndex)}.`
        : `${getDisplayName(state.user)} landed a hit at ${coordFromIndex(targetIndex)}.`);

      sequence.sunkShips.forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, defenderUid)} lost their ${ship.name}.`);
      });
      if (mineOutcome.eventText) {
        eventLog = pushEvent(eventLog, mineOutcome.eventText);
      }
      (mineOutcome.sunkShips || []).forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, state.user.uid)} lost their ${ship.name}.`);
      });

      const keepTurn = sequence.shotResults.some((shot) => shot.result === 'hit' || shot.result === 'sunk');
      const payload = {
        boards,
        eventLog,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (keepTurn) payload.keepTurnUid = state.user.uid;
      finalizeBattleState(payload, room, state.user.uid, defenderUid, nextAttackerBoard, nextDefenderBoard, eventLog);
      tx.set(ref, payload, { merge: true });

      const primary = sequence.shotResults[0];
      resultMessage = payload.phase === 'end'
        ? `Victory secured at ${coordFromIndex(primary.index)}.`
        : primary.result === 'sunk'
          ? `Direct hit. ${primary.shipName} sunk.`
          : primary.result === 'hit'
            ? `Direct hit at ${coordFromIndex(primary.index)}.`
            : `Miss at ${coordFromIndex(primary.index)}.`;
      if (mineOutcome.eventText) {
        resultMessage += ' Enemy mine counterfire triggered.';
      }

      if (window.PlayrProgression?.awardXp) {
        if (primary.result === 'hit' || primary.result === 'sunk') {
          window.PlayrProgression.awardXp(XP_HIT, 'battleship-hit', { notifyLevelUp: true });
        }
        if (sequence.sunkShips.length) {
          window.PlayrProgression.awardXp(XP_SUNK, 'battleship-sunk', { notifyLevelUp: true });
        }
        if (payload.winnerUid === state.user.uid) {
          window.PlayrProgression.awardXp(XP_WIN, 'battleship-win', { notifyLevelUp: true });
        }
      }
    });

    clearBattleSelections();
    state.lastResultMessage = resultMessage;
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
        const result = resolveFireSequence(attackerBoard, defenderBoard, attackerUid, defenderUid, [timeoutIndex], { timedOut: true, source: 'timeout' });
        const mineOutcome = maybeTriggerMine(attackerUid, defenderUid, room, result);
        payload.boards = {
          ...(room.boards || {}),
          [attackerUid]: mineOutcome.attackerBoard,
          [defenderUid]: mineOutcome.defenderBoard,
        };
        payload.eventLog = pushEvent(nextEvents, `${getPlayerName(room, attackerUid)} timed out. Automatic miss at ${coordFromIndex(timeoutIndex)}.`);
        if (mineOutcome.eventText) {
          payload.eventLog = pushEvent(payload.eventLog, mineOutcome.eventText);
        }
        finalizeBattleState(payload, room, attackerUid, defenderUid, mineOutcome.attackerBoard, mineOutcome.defenderBoard, payload.eventLog);
      } else {
        payload.eventLog = pushEvent(nextEvents, `${getPlayerName(room, attackerUid)} timed out and lost the turn.`);
      }

      tx.set(ref, payload, { merge: true });
    });
  }

  async function useRadar(index) {
    if (!db || !state.user || !state.roomData || !state.roomId) return;
    let resultMessage = '';
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const myBoard = getBoardState(room, state.user.uid);
      if (Number(myBoard.powers?.radar || 0) <= 0) throw new Error('RADAR_USED');
      const priorHit = myBoard.outgoingShots.some((shot) => Number(shot.index) === index && (shot.result === 'hit' || shot.result === 'sunk'));
      if (!priorHit) throw new Error('RADAR_NEEDS_HIT');
      const enemyUid = getOpponentUid(room, state.user.uid);
      const enemyBoard = getBoardState(room, enemyUid);
      const cells = getCellsInArea(index, 1);
      const occupied = buildOccupiedSet(enemyBoard.ships);
      const detected = cells.filter((cell) => occupied.has(cell)).length;
      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = {
        ...consumePower(myBoard, 'radar'),
        radarScans: [...myBoard.radarScans, { center: index, cells, detected, at: Date.now() }].slice(-4),
      };

      tx.set(ref, {
        boards,
        eventLog: pushEvent(getEventLog(room), `${getDisplayName(state.user)} used Radar at ${coordFromIndex(index)} and detected ${detected} nearby ship tiles.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      resultMessage = `Radar at ${coordFromIndex(index)} detected ${detected} ship tile${detected === 1 ? '' : 's'} in the surrounding 3x3 zone.`;
    });
    clearBattleSelections();
    state.lastResultMessage = resultMessage;
    renderAll();
  }

  async function useAirstrike(index) {
    if (!db || !state.user || !state.roomData || !state.roomId) return;
    let resultMessage = '';
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const defenderUid = getOpponentUid(room, state.user.uid);
      const attackerBoard = getBoardState(room, state.user.uid);
      if (Number(attackerBoard.powers?.airstrike || 0) <= 0) throw new Error('AIRSTRIKE_USED');
      const defenderBoard = getBoardState(room, defenderUid);
      const targets = getLineCells(index, state.orientation);
      const sequence = resolveFireSequence(attackerBoard, defenderBoard, state.user.uid, defenderUid, targets, { source: 'airstrike' });
      if (!sequence.shotResults.length) throw new Error('NO_NEW_TARGETS');

      const mineOutcome = maybeTriggerMine(state.user.uid, defenderUid, room, sequence);
      const nextAttackerBoard = consumePower(mineOutcome.attackerBoard, 'airstrike');
      const nextDefenderBoard = mineOutcome.defenderBoard;
      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = nextAttackerBoard;
      boards[defenderUid] = nextDefenderBoard;

      let eventLog = pushEvent(getEventLog(room), `${getDisplayName(state.user)} launched an airstrike across the ${state.orientation} line at ${coordFromIndex(index)} for ${formatShotSummary(sequence.shotResults)}.`);
      sequence.sunkShips.forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, defenderUid)} lost their ${ship.name}.`);
      });
      if (mineOutcome.eventText) {
        eventLog = pushEvent(eventLog, mineOutcome.eventText);
      }
      (mineOutcome.sunkShips || []).forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, state.user.uid)} lost their ${ship.name}.`);
      });

      const keepTurn = sequence.shotResults.some((shot) => shot.result === 'hit' || shot.result === 'sunk');
      const payload = {
        boards,
        eventLog,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (keepTurn) payload.keepTurnUid = state.user.uid;
      finalizeBattleState(payload, room, state.user.uid, defenderUid, nextAttackerBoard, nextDefenderBoard, eventLog);
      tx.set(ref, payload, { merge: true });

      resultMessage = payload.phase === 'end'
        ? `Airstrike complete. ${payload.winnerName} took the final loss.`
        : `Airstrike delivered ${formatShotSummary(sequence.shotResults)}.`;
      if (mineOutcome.eventText) {
        resultMessage += ' Enemy mine counterfire triggered.';
      }
    });
    clearBattleSelections();
    state.lastResultMessage = resultMessage;
    renderAll();
  }

  async function useMine(index) {
    if (!db || !state.user || !state.roomData || !state.roomId) return;
    let resultMessage = '';
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const defenderUid = getOpponentUid(room, state.user.uid);
      const myBoard = getBoardState(room, state.user.uid);
      if (Number(myBoard.powers?.mine || 0) <= 0) throw new Error('MINE_USED');
      if (myBoard.mineCells.includes(index)) throw new Error('MINE_ALREADY_PLACED');
      if (myBoard.incomingShots.some((shot) => Number(shot.index) === index)) throw new Error('MINE_CELL_BLOCKED');

      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = {
        ...consumePower(myBoard, 'mine'),
        mineCells: [index],
      };

      tx.set(ref, {
        boards,
        turnUid: defenderUid,
        turnDeadlineAt: Date.now() + TURN_TIMEOUT_MS,
        eventLog: pushEvent(getEventLog(room), `${getDisplayName(state.user)} armed a hidden mine.`),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      resultMessage = `Mine armed at ${coordFromIndex(index)}. Enemy turn started.`;
    });
    clearBattleSelections();
    state.lastResultMessage = resultMessage;
    renderAll();
  }

  async function useNuke(index) {
    if (!db || !state.user || !state.roomData || !state.roomId) return;
    let resultMessage = '';
    await db.runTransaction(async (tx) => {
      const ref = roomRef(state.roomId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.phase !== 'battle') throw new Error('NOT_BATTLE');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_TURN');
      const defenderUid = getOpponentUid(room, state.user.uid);
      const attackerBoard = getBoardState(room, state.user.uid);
      if (Number(attackerBoard.powers?.nuke || 0) <= 0) throw new Error('NUKE_USED');
      const defenderBoard = getBoardState(room, defenderUid);
      const targets = getCellsInArea(index, 1);
      const sequence = resolveFireSequence(attackerBoard, defenderBoard, state.user.uid, defenderUid, targets, { source: 'nuke' });
      if (!sequence.shotResults.length) throw new Error('NO_NEW_TARGETS');

      const mineOutcome = maybeTriggerMine(state.user.uid, defenderUid, room, sequence);
      const nextAttackerBoard = consumePower(mineOutcome.attackerBoard, 'nuke');
      const nextDefenderBoard = mineOutcome.defenderBoard;
      const boards = { ...(room.boards || {}) };
      boards[state.user.uid] = nextAttackerBoard;
      boards[defenderUid] = nextDefenderBoard;

      let eventLog = pushEvent(getEventLog(room), `${getDisplayName(state.user)} launched a nuke at ${coordFromIndex(index)} for ${formatShotSummary(sequence.shotResults)}.`);
      sequence.sunkShips.forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, defenderUid)} lost their ${ship.name}.`);
      });
      if (mineOutcome.eventText) {
        eventLog = pushEvent(eventLog, mineOutcome.eventText);
      }
      (mineOutcome.sunkShips || []).forEach((ship) => {
        eventLog = pushEvent(eventLog, `${getPlayerName(room, state.user.uid)} lost their ${ship.name}.`);
      });

      const keepTurn = sequence.shotResults.some((shot) => shot.result === 'hit' || shot.result === 'sunk');
      const payload = {
        boards,
        eventLog,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (keepTurn) payload.keepTurnUid = state.user.uid;
      finalizeBattleState(payload, room, state.user.uid, defenderUid, nextAttackerBoard, nextDefenderBoard, eventLog);
      tx.set(ref, payload, { merge: true });

      resultMessage = payload.phase === 'end'
        ? `Nuke landed. ${payload.winnerName} took the final loss.`
        : `Nuke delivered ${formatShotSummary(sequence.shotResults)}.`;
      if (mineOutcome.eventText) {
        resultMessage += ' Enemy mine counterfire triggered.';
      }
    });
    clearBattleSelections();
    state.lastResultMessage = resultMessage;
    renderAll();
  }

  function maybeTriggerMine(attackerUid, defenderUid, room, primarySequence) {
    const defenderBoard = primarySequence.defenderBoard;
    const attackerBoard = primarySequence.attackerBoard;
    const armedMine = defenderBoard.mineCells.find((cell) => primarySequence.shotResults.some((shot) => Number(shot.index) === Number(cell)));
    if (!Number.isInteger(armedMine)) {
      return {
        attackerBoard,
        defenderBoard,
        eventText: '',
      };
    }

    const updatedDefenderBoard = {
      ...defenderBoard,
      mineCells: defenderBoard.mineCells.filter((cell) => Number(cell) !== Number(armedMine)),
      triggeredMines: [...new Set([...(defenderBoard.triggeredMines || []), armedMine])],
    };
    const counterTargets = chooseRandomUntargetedIndices(updatedDefenderBoard, 3);
    if (!counterTargets.length) {
      return {
        attackerBoard,
        defenderBoard: updatedDefenderBoard,
        eventText: `${getPlayerName(room, defenderUid)}'s mine detonated at ${coordFromIndex(armedMine)}, but there were no untargeted cells left for counterfire.`,
      };
    }

    const counterSequence = resolveFireSequence(updatedDefenderBoard, attackerBoard, defenderUid, attackerUid, counterTargets, { source: 'mine' });
    return {
      attackerBoard: counterSequence.defenderBoard,
      defenderBoard: counterSequence.attackerBoard,
      eventText: `${getPlayerName(room, defenderUid)}'s mine detonated at ${coordFromIndex(armedMine)} and fired back for ${formatShotSummary(counterSequence.shotResults)}.`,
      sunkShips: counterSequence.sunkShips,
      mineIndex: armedMine,
    };
  }

  function handleBoardClick(event) {
    const button = event.target.closest('[data-board-type][data-cell-index]');
    if (!button || !state.roomData) return;
    const boardType = button.dataset.boardType || '';
    const index = Number(button.dataset.cellIndex);
    if (!Number.isInteger(index) || index < 0 || index >= TOTAL_CELLS) return;

    if (boardType === 'own' && state.roomData.phase === 'placement' && !isPlacementLocked(state.roomData)) {
      if (!canPlaceShip(state.draftShips, state.selectedShipId, index, state.orientation)) {
        state.lastResultMessage = 'That ship does not fit there without overlapping another one.';
        renderAll();
        return;
      }
      state.pendingPlacementIndex = index;
      state.lastResultMessage = `${getShipConfig(state.selectedShipId)?.name || 'Ship'} staged at ${coordFromIndex(index)}. Press Enter to confirm placement.`;
      renderAll();
      return;
    }

    if (state.roomData.phase !== 'battle' || !isMyTurn(state.roomData)) return;

    if (boardType === 'own' && state.activePowerId === 'mine') {
      state.selectedMineIndex = index;
      state.selectedAttackIndex = -1;
      renderAll();
      return;
    }

    if (boardType !== 'enemy') return;

    const trackingBoard = getEnemyTrackingBoard(state.roomData);
    if (!state.activePowerId && trackingBoard.outgoingShots.some((shot) => Number(shot.index) === index)) return;
    state.selectedAttackIndex = index;
    state.selectedMineIndex = -1;
    renderAll();
  }

  function isTypingTarget(target) {
    const node = target instanceof Element ? target : null;
    return Boolean(node && (node.closest('input, textarea, [contenteditable="true"]')));
  }

  function toggleOrientation() {
    state.orientation = state.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    if (state.pendingPlacementIndex >= 0 && !canPlaceShip(state.draftShips, state.selectedShipId, state.pendingPlacementIndex, state.orientation)) {
      state.lastResultMessage = 'Rotate moved the staged ship out of bounds or into another ship. Pick a new tile.';
    }
    renderAll();
  }

  function togglePower(powerId) {
    const room = state.roomData;
    if (!room || room.phase !== 'battle' || !isMyTurn(room)) return;
    const board = getMyBoard(room);
    if (Number(board.powers?.[powerId] || 0) <= 0) return;
    state.activePowerId = state.activePowerId === powerId ? '' : powerId;
    state.selectedAttackIndex = -1;
    state.selectedMineIndex = -1;
    renderAll();
  }

  async function confirmCurrentAction() {
    if (!state.roomData) return;
    if (state.roomData.phase === 'placement') {
      if (state.pendingPlacementIndex >= 0) {
        const placedShipName = getShipConfig(state.selectedShipId)?.name || 'Ship';
        const placed = placeShipInDraft(state.selectedShipId, state.pendingPlacementIndex, state.orientation);
        if (!placed) {
          throw new Error('INVALID_PLACEMENT');
        }
        state.lastResultMessage = `${placedShipName} placed.`;
        renderAll();
        return;
      }
      return;
    }
    if (state.roomData.phase !== 'battle') return;
    if (state.activePowerId === 'radar') {
      if (state.selectedAttackIndex < 0) return;
      await useRadar(state.selectedAttackIndex);
      return;
    }
    if (state.activePowerId === 'airstrike') {
      if (state.selectedAttackIndex < 0) return;
      await useAirstrike(state.selectedAttackIndex);
      return;
    }
    if (state.activePowerId === 'mine') {
      if (state.selectedMineIndex < 0) return;
      await useMine(state.selectedMineIndex);
      return;
    }
    if (state.activePowerId === 'nuke') {
      if (state.selectedAttackIndex < 0) return;
      await useNuke(state.selectedAttackIndex);
      return;
    }
    if (state.selectedAttackIndex < 0) return;
    await confirmAttack();
  }

  function bindEvents() {
    els.showJoinBtn?.addEventListener('click', () => {
      state.gateMode = 'join';
      window.setTimeout(() => els.roomIdInput?.focus(), 0);
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

    els.roomIdInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        els.joinRoomBtn?.click();
      }
    });

    els.copyRoomCodeBtn?.addEventListener('click', () => {
      if (!state.roomId) return;
      void copyText(state.roomId, 'Room code copied.');
    });

    els.copyInviteBtn?.addEventListener('click', () => {
      if (!state.roomId) return;
      void copyText(`${window.location.origin}${window.location.pathname}?room=${state.roomId}`, 'Invite link copied.');
    });

    els.rotateShipBtn?.addEventListener('click', toggleOrientation);

    els.randomizeFleetBtn?.addEventListener('click', () => {
      state.draftShips = generateRandomFleet();
      const nextUnplaced = SHIPS.find((ship) => !state.draftShips.some((placed) => placed.id === ship.id));
      state.selectedShipId = nextUnplaced?.id || SHIPS[0].id;
      state.pendingPlacementIndex = -1;
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
      void confirmCurrentAction().catch((error) => {
        const map = {
          RADAR_NEEDS_HIT: 'Radar needs a tile you already hit.',
          NO_NEW_TARGETS: 'That power would only hit already-targeted cells.',
          MINE_CELL_BLOCKED: 'You cannot arm a mine on a tile that was already hit.',
        };
        state.lastResultMessage = map[error?.message] || `Action failed: ${error?.message || 'unknown error'}.`;
        renderAll();
      });
    });

    els.fleetShipList?.addEventListener('click', (event) => {
      const shipButton = event.target.closest('[data-ship-id]');
      if (!shipButton) return;
      state.selectedShipId = shipButton.dataset.shipId || SHIPS[0].id;
      state.pendingPlacementIndex = -1;
      renderAll();
    });

    els.powerList?.addEventListener('click', (event) => {
      const powerButton = event.target.closest('[data-power-id]');
      if (!powerButton) return;
      togglePower(powerButton.dataset.powerId || '');
    });

    els.ownBoard?.addEventListener('click', handleBoardClick);
    els.enemyBoard?.addEventListener('click', handleBoardClick);

    window.addEventListener('keydown', (event) => {
      if (isTypingTarget(event.target)) return;
      if (!state.roomData) return;

      if (event.key === 'Enter') {
        const canPlacementConfirm = state.roomData.phase === 'placement'
          && !isPlacementLocked(state.roomData)
          && state.pendingPlacementIndex >= 0;
        const canBattleConfirm = state.roomData.phase === 'battle' && isMyTurn(state.roomData);
        if (canPlacementConfirm || canBattleConfirm) {
          event.preventDefault();
          void confirmCurrentAction().catch(() => {
            state.lastResultMessage = 'Action failed.';
            renderAll();
          });
        }
        return;
      }

      const lower = event.key.toLowerCase();
      if (lower === 'r') {
        const shouldRotate = (state.roomData.phase === 'placement' && !isPlacementLocked(state.roomData))
          || (state.roomData.phase === 'battle' && state.activePowerId === 'airstrike' && isMyTurn(state.roomData));
        if (shouldRotate) {
          event.preventDefault();
          toggleOrientation();
        }
        return;
      }

      if (state.roomData.phase === 'battle' && isMyTurn(state.roomData)) {
        const power = POWERS.find((entry) => entry.hotkey === event.key);
        if (power) {
          event.preventDefault();
          togglePower(power.id);
          return;
        }
      }

      if (event.key === 'Escape') {
        clearBattleSelections();
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
