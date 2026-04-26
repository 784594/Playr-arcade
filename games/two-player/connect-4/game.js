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

  const ROOM_COLLECTION = 'connect4Rooms';
  const ROWS = 6;
  const COLS = 7;
  const BOARD_SIZE = ROWS * COLS;
  const DROP_DURATION_MS = 560;
  const CLEAR_DURATION_MS = 760;
  const BLOCKED_CHAT_TERMS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'slut',
    'whore', 'porn', 'sex', 'nude', 'nsfw', 'xxx', 'cock', 'faggot', 'fag',
    'nigga', 'nigger', 'retard', 'tranny',
  ];
  const LEET_MAP = {
    '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g',
    '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '|': 'i',
  };

  const state = {
    user: null,
    roomId: '',
    roomData: null,
    roomUnsub: null,
    chatUnsub: null,
    lastChatAt: 0,
    hoverColumn: -1,
    lastCoinTossKey: '',
    coinTossTimer: null,
    pendingDrop: null,
    clearBoard: null,
    clearBoardTimer: null,
    previousBoardSignature: '',
  };

  const els = {
    gameStatus: document.getElementById('gameStatus'),
    roomGate: document.getElementById('roomGate'),
    gateChoice: document.getElementById('gateChoice'),
    joinFlow: document.getElementById('joinFlow'),
    roomGateError: document.getElementById('roomGateError'),
    createFlowBtn: document.getElementById('createFlowBtn'),
    joinFlowBtn: document.getElementById('joinFlowBtn'),
    backToChoiceBtn: document.getElementById('backToChoiceBtn'),
    roomIdInput: document.getElementById('roomIdInput'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    boardInfo: document.getElementById('boardInfo'),
    roomCode: document.getElementById('roomCode'),
    myUserLabel: document.getElementById('myUserLabel'),
    myUserDisplay: document.getElementById('myUserDisplay'),
    otherUserLabel: document.getElementById('otherUserLabel'),
    otherUserDisplay: document.getElementById('otherUserDisplay'),
    turnDisplay: document.getElementById('turnDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
    copyInviteBtn: document.getElementById('copyInviteBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    boardShell: document.getElementById('boardShell'),
    columnRail: document.getElementById('columnRail'),
    board: document.getElementById('board'),
    dropLayer: document.getElementById('dropLayer'),
    boardHint: document.getElementById('boardHint'),
    chatPanel: document.getElementById('chatPanel'),
    chatLog: document.getElementById('chatLog'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    chatStatus: document.getElementById('chatStatus'),
    endgameOverlay: document.getElementById('endgameOverlay'),
    endgameCard: document.getElementById('endgameCard'),
    endgameLabel: document.getElementById('endgameLabel'),
    endgameName: document.getElementById('endgameName'),
    endgameRematchBtn: document.getElementById('endgameRematchBtn'),
    endgameRematchStatus: document.getElementById('endgameRematchStatus'),
    coinTossOverlay: document.getElementById('coinTossOverlay'),
    coinTossFace: document.getElementById('coinTossFace'),
    coinTossResult: document.getElementById('coinTossResult'),
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

  function showGateMode(mode) {
    if (!els.gateChoice || !els.joinFlow) return;
    els.gateChoice.hidden = mode !== 'choice';
    els.joinFlow.hidden = mode !== 'join';
    if (mode !== 'join') setGateError('');
    if (mode !== 'join' && els.roomIdInput) els.roomIdInput.value = '';
  }

  function normalizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24) || 'Player';
  }

  function getDisplayName(user) {
    return normalizeName(user?.displayName || 'Player');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function timestampToMs(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    return 0;
  }

  function formatTime(ts) {
    const ms = timestampToMs(ts);
    if (!ms) return '--:--';
    const date = new Date(ms);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function roomRef(roomId) {
    return db.collection(ROOM_COLLECTION).doc(roomId);
  }

  function roomMessagesRef(roomId) {
    return roomRef(roomId).collection('messages');
  }

  function randomRoomId() {
    return `c4-${Math.random().toString(36).slice(2, 8)}`;
  }

  function parseRoomId(raw) {
    const normalized = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    return /^c4-[a-z0-9]{6,16}$/.test(normalized) ? normalized : '';
  }

  function getEmptyBoard() {
    return new Array(BOARD_SIZE).fill('');
  }

  function getIndex(row, col) {
    return row * COLS + col;
  }

  function getBoardCell(board, row, col) {
    return board[getIndex(row, col)] || '';
  }

  function dropPiece(boardInput, col, token) {
    const board = Array.isArray(boardInput) ? [...boardInput] : getEmptyBoard();
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const index = getIndex(row, col);
      if (!board[index]) {
        board[index] = token;
        return { board, row, index };
      }
    }
    return null;
  }

  function getColumnFillRow(board, col) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (!getBoardCell(board, row, col)) return row;
    }
    return -1;
  }

  function isBoardFull(board) {
    return board.every(Boolean);
  }

  function checkWinner(board) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const token = getBoardCell(board, row, col);
        if (!token) continue;

        for (const [dr, dc] of directions) {
          const line = [getIndex(row, col)];
          let matched = true;
          for (let step = 1; step < 4; step += 1) {
            const nextRow = row + dr * step;
            const nextCol = col + dc * step;
            if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS || getBoardCell(board, nextRow, nextCol) !== token) {
              matched = false;
              break;
            }
            line.push(getIndex(nextRow, nextCol));
          }
          if (matched) {
            return { winner: token, winLine: line };
          }
        }
      }
    }

    if (isBoardFull(board)) {
      return { winner: 'draw', winLine: [] };
    }
    return { winner: '', winLine: [] };
  }

  function getUserToken(room) {
    if (!state.user || !room) return '';
    if (room.redUid === state.user.uid) return 'R';
    if (room.yellowUid === state.user.uid) return 'Y';
    return '';
  }

  function getPlayerName(room, token) {
    if (!room) return 'Player';
    if (token === 'R') return room.redName || 'Red';
    if (token === 'Y') return room.yellowName || 'Yellow';
    return 'Player';
  }

  function getPlayerUid(room, token) {
    if (!room) return '';
    if (token === 'R') return room.redUid || '';
    if (token === 'Y') return room.yellowUid || '';
    return '';
  }

  function getHostName(room) {
    return normalizeName(room?.hostName || 'Host');
  }

  function getGuestName(room) {
    return room?.guestUid ? normalizeName(room.guestName || 'Guest') : 'Waiting...';
  }

  function getPlayerScore(room, uid) {
    if (!room || !uid) return 0;
    return Number(room.playerScores?.[uid] || 0);
  }

  function getRematchVoteCount(room) {
    return Object.values(room?.rematchVotes || {}).filter(Boolean).length;
  }

  function getBoardSignature(board) {
    return Array.isArray(board) ? board.join('') : '';
  }

  function sanitizeForFilter(text) {
    return String(text || '').toLowerCase()
      .split('')
      .map((char) => LEET_MAP[char] || char)
      .join('')
      .replace(/[\s_.\-]+/g, '')
      .replace(/[^a-z]/g, '');
  }

  function containsBlockedChat(text) {
    const normalized = sanitizeForFilter(text);
    return BLOCKED_CHAT_TERMS.some((term) => normalized.includes(term));
  }

  function applyMessageOverride(text) {
    const lower = String(text || '').toLowerCase().trim();
    if (lower.includes('trash')) return 'You are playing really well!';
    if (lower.includes('suck')) return 'Keep going, you can still win this.';
    if (lower.includes('noob')) return 'Everyone starts somewhere.';
    if (lower === 'ez' || lower === 'easy') return 'GG! Well played!';
    if (lower.includes('mad') || lower.includes('rage')) return 'Still a fun round though!';
    return text;
  }

  function syncChatPanelHeight() {
    if (!els.boardShell || !els.chatPanel) return;
    if (window.matchMedia('(max-width: 1120px)').matches) {
      els.chatPanel.style.height = '';
      els.chatPanel.style.maxHeight = '';
      return;
    }
    const boardHeight = Math.round(els.boardShell.getBoundingClientRect().height || 0);
    if (!boardHeight) return;
    els.chatPanel.style.height = `${boardHeight}px`;
    els.chatPanel.style.maxHeight = `${boardHeight}px`;
  }

  function clearPendingDropIfResolved(room) {
    if (!state.pendingDrop || !room) return;
    const { index, token } = state.pendingDrop;
    if (room.board?.[index] === token) {
      window.setTimeout(() => {
        state.pendingDrop = null;
        renderDropLayer();
      }, 60);
    }
  }

  function maybeAnimateBoardClear(previousRoom, nextRoom) {
    if (!previousRoom || !nextRoom) return;
    const previousBoard = Array.isArray(previousRoom.board) ? previousRoom.board : [];
    const nextBoard = Array.isArray(nextRoom.board) ? nextRoom.board : [];
    const boardWasFilled = previousBoard.some(Boolean);
    const boardNowEmpty = nextBoard.length === BOARD_SIZE && nextBoard.every((cell) => !cell);
    const roundAdvanced = Number(nextRoom.roundNumber || 0) > Number(previousRoom.roundNumber || 0);
    if (!boardWasFilled || !boardNowEmpty || !roundAdvanced) return;

    state.clearBoard = previousBoard.slice();
    if (state.clearBoardTimer) window.clearTimeout(state.clearBoardTimer);
    state.clearBoardTimer = window.setTimeout(() => {
      state.clearBoard = null;
      renderBoard();
    }, CLEAR_DURATION_MS);
  }

  function renderScoreLines(room) {
    if (!els.scoreDisplay) return;
    const hostUid = room?.hostUid || '';
    const guestUid = room?.guestUid || '';
    const draws = Number(room?.draws || 0);
    els.scoreDisplay.innerHTML = [
      `<span class="score-line"><span class="score-player"><span class="score-token red"></span>${escapeHtml(getHostName(room))}</span><span class="score-value">${getPlayerScore(room, hostUid)}</span></span>`,
      `<span class="score-line"><span class="score-player"><span class="score-token yellow"></span>${escapeHtml(getGuestName(room))}</span><span class="score-value">${getPlayerScore(room, guestUid)}</span></span>`,
      `<span class="score-line"><span class="score-player">Draws</span><span class="score-value">${draws}</span></span>`,
    ].join('');
  }

  function renderDropLayer() {
    if (!els.dropLayer) return;
    if (!state.pendingDrop) {
      els.dropLayer.innerHTML = '';
      return;
    }
    const cellIndex = getIndex(state.pendingDrop.row, state.pendingDrop.col);
    const cell = els.board?.children?.[cellIndex];
    const layerRect = els.dropLayer.getBoundingClientRect();
    if (!cell || !layerRect) {
      els.dropLayer.innerHTML = '';
      return;
    }
    const cellRect = cell.getBoundingClientRect();
    const discSize = Math.max(24, Math.round(cellRect.width * 0.68));
    const left = (cellRect.left - layerRect.left) + ((cellRect.width - discSize) / 2);
    const targetY = (cellRect.top - layerRect.top) + ((cellRect.height - discSize) / 2);
    els.dropLayer.innerHTML = `<div class="drop-disc ${state.pendingDrop.token === 'R' ? 'red' : 'yellow'}" style="--disc-size:${discSize}px;--disc-left:${left}px;--target-y:${targetY}px;"></div>`;
  }

  function renderColumnRail() {
    if (!els.columnRail) return;
    const room = state.roomData;
    const board = Array.isArray(room?.board) ? room.board : getEmptyBoard();
    const myToken = getUserToken(room);
    const myTurn = Boolean(room && room.status === 'active' && !room.winner && room.turn === myToken);

    els.columnRail.innerHTML = Array.from({ length: COLS }, (_, col) => {
      const openRow = getColumnFillRow(board, col);
      const canPlay = myTurn && openRow >= 0;
      const isHovered = state.hoverColumn === col;
      const previewVisible = canPlay && isHovered;
      const previewToken = myToken === 'R' ? 'red' : 'yellow';
      return `
        <button type="button" class="rail-btn${isHovered ? ' is-hovered' : ''}" data-column="${col}" ${canPlay ? '' : 'disabled'} aria-label="Drop in column ${col + 1}">
          <span class="rail-arrow">DROP</span>
          ${previewVisible ? `<span class="rail-preview-disc disc ${previewToken}"></span>` : ''}
        </button>
      `;
    }).join('');
  }

  function renderBoard() {
    if (!els.board) return;
    const room = state.roomData;
    const board = state.clearBoard || (Array.isArray(room?.board) ? room.board : getEmptyBoard());
    const roomBoard = Array.isArray(room?.board) ? room.board : getEmptyBoard();
    const lastMoveIndex = Number(room?.lastMoveIndex ?? -1);
    const winningSet = new Set(Array.isArray(room?.winLine) ? room.winLine.map(Number) : []);
    const isClearing = Boolean(state.clearBoard);
    const roomSignature = getBoardSignature(roomBoard);

    els.board.innerHTML = board.map((cell, index) => {
      const winning = winningSet.has(index) ? ' is-winning' : '';
      const isNew = !isClearing && index === lastMoveIndex && roomSignature !== state.previousBoardSignature ? ' is-new' : '';
      let disc = '';
      if (cell) {
        const tokenClass = cell === 'R' ? 'red' : 'yellow';
        disc = `<span class="disc ${tokenClass}${isNew}${isClearing ? ' is-clearing' : ''}" style="--clear-delay:${(index % COLS) * 28}ms;"></span>`;
      }
      return `<div class="board-cell${winning}" data-cell-index="${index}">${disc}</div>`;
    }).join('');

    state.previousBoardSignature = roomSignature;
  }

  function renderCoinTossOverlay() {
    if (!els.coinTossOverlay) return;
    const room = state.roomData;
    if (!room) {
      els.coinTossOverlay.hidden = true;
      return;
    }

    const tossMs = timestampToMs(room.coinTossAt);
    const round = Number(room.roundNumber || 1);
    if (!tossMs || room.status !== 'active') {
      els.coinTossOverlay.hidden = true;
      return;
    }

    const key = `${state.roomId}:${round}:${tossMs}`;
    if (state.lastCoinTossKey === key) return;
    state.lastCoinTossKey = key;

    if (els.coinTossFace) {
      els.coinTossFace.textContent = room.turn || 'R';
      els.coinTossFace.classList.remove('spin');
      void els.coinTossFace.offsetWidth;
      els.coinTossFace.classList.add('spin');
    }
    if (els.coinTossResult) {
      els.coinTossResult.textContent = `${getPlayerName(room, 'R')} starts as Red. ${getPlayerName(room, 'Y')} plays Yellow.`;
    }
    els.coinTossOverlay.hidden = false;
    if (state.coinTossTimer) window.clearTimeout(state.coinTossTimer);
    state.coinTossTimer = window.setTimeout(() => {
      if (els.coinTossOverlay) els.coinTossOverlay.hidden = true;
    }, 2200);
  }

  function renderEndgameOverlay() {
    if (!els.endgameOverlay) return;
    const room = state.roomData || {};
    const isGameOver = Boolean(room.winner);
    const myToken = getUserToken(room);
    const isWinner = Boolean(room.winner && room.winner !== 'draw' && myToken === room.winner);
    const voteCount = getRematchVoteCount(room);
    const currentUserVoted = Boolean(state.user && room.rematchVotes?.[state.user.uid]);

    els.endgameOverlay.hidden = !isGameOver;
    if (!isGameOver) return;

    if (els.endgameCard) {
      els.endgameCard.classList.toggle('winner-card', room.winner !== 'draw' && isWinner);
      els.endgameCard.classList.toggle('loser-card', room.winner !== 'draw' && !isWinner);
      els.endgameCard.classList.toggle('draw-card', room.winner === 'draw');
    }
    if (els.endgameLabel) {
      els.endgameLabel.textContent = room.winner === 'draw' ? 'Draw!' : isWinner ? 'Winner!' : 'Round Over';
    }
    if (els.endgameName) {
      els.endgameName.textContent = room.winner === 'draw' ? 'Nobody took the round' : `${getPlayerName(room, room.winner)} wins`;
    }
    if (els.endgameRematchBtn) {
      els.endgameRematchBtn.disabled = currentUserVoted;
      els.endgameRematchBtn.textContent = voteCount === 1 ? 'Rematch 1/2' : 'Rematch';
    }
    if (els.endgameRematchStatus) {
      els.endgameRematchStatus.textContent = voteCount === 1 ? 'One vote locked in.' : 'Waiting for votes.';
    }
  }

  function renderRoomMeta() {
    const room = state.roomData || {};
    const inRoom = Boolean(state.roomId);
    const myToken = getUserToken(room);
    const otherToken = myToken === 'R' ? 'Y' : 'R';

    if (els.roomGate) els.roomGate.hidden = inRoom;
    if (els.boardInfo) els.boardInfo.hidden = !inRoom;
    if (els.chatPanel) els.chatPanel.hidden = !inRoom;

    if (!inRoom) {
      setStatus('Create a room or join with a code.');
      if (els.boardHint) els.boardHint.textContent = 'Create a room or join with a code to begin.';
      return;
    }

    if (els.roomCode) els.roomCode.textContent = state.roomId;
    if (els.myUserLabel) els.myUserLabel.textContent = 'You:';
    if (els.otherUserLabel) els.otherUserLabel.textContent = 'Other Player:';
    if (els.myUserDisplay) {
      els.myUserDisplay.textContent = myToken ? `${getDisplayName(state.user)} (${myToken === 'R' ? 'Red' : 'Yellow'})` : getDisplayName(state.user);
    }
    if (els.otherUserDisplay) {
      const otherName = myToken ? getPlayerName(room, otherToken) : `${getHostName(room)} / ${getGuestName(room)}`;
      els.otherUserDisplay.textContent = otherName;
    }

    if (els.turnDisplay) {
      if (room.winner === 'draw') {
        els.turnDisplay.textContent = 'Draw';
      } else if (room.winner) {
        els.turnDisplay.textContent = `${getPlayerName(room, room.winner)} won`;
      } else if (room.turn) {
        els.turnDisplay.textContent = `${getPlayerName(room, room.turn)} (${room.turn === 'R' ? 'Red' : 'Yellow'})`;
      } else {
        els.turnDisplay.textContent = '--';
      }
    }

    renderScoreLines(room);

    if (els.startGameBtn) {
      const canStart = Boolean(
        state.user &&
        room.hostUid === state.user.uid &&
        room.hostUid &&
        room.guestUid &&
        (room.status === 'ready' || room.status === 'waiting')
      );
      els.startGameBtn.hidden = !canStart;
      els.startGameBtn.disabled = !canStart || !room.guestUid;
    }

    if (els.boardHint) {
      if (room.status === 'waiting') {
        els.boardHint.textContent = 'Waiting for a second player to join the room.';
      } else if (room.status === 'ready') {
        els.boardHint.textContent = 'Both players are here. Host can start the game.';
      } else if (room.winner === 'draw') {
        els.boardHint.textContent = 'The board filled up. Vote rematch to clear it and go again.';
      } else if (room.winner) {
        els.boardHint.textContent = `${getPlayerName(room, room.winner)} connected four. Vote rematch for the next round.`;
      } else if (myToken && room.turn === myToken) {
        els.boardHint.textContent = `Your turn. Pick a rail and drop your ${myToken === 'R' ? 'red' : 'yellow'} coin.`;
      } else if (myToken) {
        els.boardHint.textContent = `Waiting for ${getPlayerName(room, room.turn)} to move.`;
      } else {
        els.boardHint.textContent = 'Room is live.';
      }
    }

    if (room.status === 'waiting') {
      setStatus('Room created. Waiting for second player...');
    } else if (room.status === 'ready') {
      setStatus(state.user?.uid === room.hostUid ? 'Player joined. Start the game when ready.' : 'Waiting for host to start the game.');
    } else if (room.winner === 'draw') {
      setStatus('Draw game. Press Rematch to play again.');
    } else if (room.winner) {
      setStatus(`${getPlayerName(room, room.winner)} wins. Press Rematch to play again.`);
    } else if (myToken && room.turn === myToken) {
      setStatus(`Your turn (${myToken === 'R' ? 'Red' : 'Yellow'}).`);
    } else if (myToken) {
      setStatus(`Waiting for ${getPlayerName(room, room.turn)}.`);
    } else {
      setStatus('Room is live.');
    }
  }

  function renderAll() {
    renderColumnRail();
    renderBoard();
    renderDropLayer();
    renderRoomMeta();
    renderEndgameOverlay();
    renderCoinTossOverlay();
    syncChatPanelHeight();
  }

  function unsubscribeAll() {
    if (typeof state.roomUnsub === 'function') {
      state.roomUnsub();
      state.roomUnsub = null;
    }
    if (typeof state.chatUnsub === 'function') {
      state.chatUnsub();
      state.chatUnsub = null;
    }
    if (state.coinTossTimer) {
      window.clearTimeout(state.coinTossTimer);
      state.coinTossTimer = null;
    }
  }

  async function createRoom() {
    if (!db || !state.user) throw new Error('NO_AUTH');
    const roomId = randomRoomId();
    const displayName = getDisplayName(state.user);
    await roomRef(roomId).set({
      roomId,
      status: 'waiting',
      board: getEmptyBoard(),
      turn: 'R',
      winner: '',
      winLine: [],
      hostUid: state.user.uid,
      hostName: displayName,
      guestUid: '',
      guestName: '',
      redUid: state.user.uid,
      redName: displayName,
      yellowUid: '',
      yellowName: '',
      playerScores: { [state.user.uid]: 0 },
      draws: 0,
      roundNumber: 1,
      scoreRound: 0,
      rematchVotes: {},
      lastMoveColumn: -1,
      lastMoveIndex: -1,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      coinTossAt: null,
    }, { merge: false });
    return roomId;
  }

  async function joinRoom(inputRoomId) {
    if (!db || !state.user) throw new Error('NO_AUTH');
    const roomId = parseRoomId(inputRoomId);
    if (!roomId) throw new Error('INVALID_ROOM');

    const ref = roomRef(roomId);
    const displayName = getDisplayName(state.user);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const update = {
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (room.hostUid === state.user.uid) {
        update.hostName = displayName;
      } else if (!room.guestUid) {
        update.guestUid = state.user.uid;
        update.guestName = displayName;
      } else if (room.guestUid === state.user.uid) {
        update.guestName = displayName;
      } else {
        throw new Error('ROOM_FULL');
      }

      const hostUid = room.hostUid || state.user.uid;
      const guestUid = update.guestUid || room.guestUid || '';
      const scores = { ...(room.playerScores || {}) };
      if (hostUid && typeof scores[hostUid] !== 'number') scores[hostUid] = 0;
      if (guestUid && typeof scores[guestUid] !== 'number') scores[guestUid] = 0;

      update.playerScores = scores;
      update.status = guestUid ? (room.winner ? 'finished' : 'ready') : 'waiting';
      tx.set(ref, update, { merge: true });
    });

    await subscribeToRoom(roomId);
  }

  async function subscribeToRoom(roomId) {
    unsubscribeAll();
    state.roomId = roomId;

    state.roomUnsub = roomRef(roomId).onSnapshot((snap) => {
      const previousRoom = state.roomData;
      const nextRoom = snap.exists ? snap.data() : null;
      state.roomData = nextRoom;
      if (!snap.exists) {
        state.roomId = '';
        setGateError('Room not found.');
        showGateMode('join');
        renderAll();
        return;
      }
      maybeAnimateBoardClear(previousRoom, nextRoom);
      clearPendingDropIfResolved(nextRoom);
      renderAll();
    }, () => {
      setStatus('Could not read room updates.');
    });

    state.chatUnsub = roomMessagesRef(roomId)
      .orderBy('createdAt', 'asc')
      .limit(120)
      .onSnapshot((snap) => {
        if (!els.chatLog) return;
        const messages = [];
        snap.forEach((doc) => messages.push(doc.data() || {}));
        els.chatLog.innerHTML = messages.map((msg) => {
          const author = escapeHtml(normalizeName(msg.authorName || 'Player'));
          const text = escapeHtml(msg.text || '');
          const time = formatTime(msg.createdAt);
          return `<div class="chat-item"><div class="chat-author-row"><span class="chat-author">${author}</span><span class="chat-time">${time}</span></div><p>${text}</p></div>`;
        }).join('');
        els.chatLog.scrollTop = els.chatLog.scrollHeight;
        syncChatPanelHeight();
      }, () => {
        if (els.chatStatus) els.chatStatus.textContent = 'Could not load chat right now.';
      });

    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
  }

  async function startGame() {
    if (!db || !state.user || !state.roomId) return;
    const ref = roomRef(state.roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.hostUid !== state.user.uid) throw new Error('NOT_HOST');
      if (!room.guestUid) throw new Error('WAITING_FOR_PLAYER');

      const hostStartsRed = Math.random() < 0.5;
      const redUid = hostStartsRed ? room.hostUid : room.guestUid;
      const redName = hostStartsRed ? room.hostName : room.guestName;
      const yellowUid = hostStartsRed ? room.guestUid : room.hostUid;
      const yellowName = hostStartsRed ? room.guestName : room.hostName;
      const playerScores = { ...(room.playerScores || {}) };
      if (room.hostUid && typeof playerScores[room.hostUid] !== 'number') playerScores[room.hostUid] = 0;
      if (room.guestUid && typeof playerScores[room.guestUid] !== 'number') playerScores[room.guestUid] = 0;

      tx.set(ref, {
        board: getEmptyBoard(),
        status: 'active',
        turn: 'R',
        winner: '',
        winLine: [],
        redUid,
        redName,
        yellowUid,
        yellowName,
        playerScores,
        rematchVotes: {},
        lastMoveColumn: -1,
        lastMoveIndex: -1,
        coinTossAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    setStatus('Coin toss started. Assigning Red and Yellow...');
  }

  async function playColumn(col) {
    if (!db || !state.user || !state.roomId) return;
    const room = state.roomData || {};
    const board = Array.isArray(room.board) ? room.board : getEmptyBoard();
    const myToken = getUserToken(room);
    if (!myToken) throw new Error('NOT_PLAYER');
    if (room.status !== 'active') throw new Error('ROOM_NOT_ACTIVE');
    if (room.winner) throw new Error('GAME_OVER');
    if (room.turn !== myToken) throw new Error('NOT_YOUR_TURN');
    const landingRow = getColumnFillRow(board, col);
    if (landingRow < 0) throw new Error('COLUMN_FULL');

    state.pendingDrop = { col, row: landingRow, token: myToken, index: getIndex(landingRow, col) };
    renderDropLayer();

    const ref = roomRef(state.roomId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const liveRoom = snap.data() || {};
      const liveBoard = Array.isArray(liveRoom.board) ? liveRoom.board : getEmptyBoard();
      const liveToken = liveRoom.redUid === state.user.uid ? 'R' : liveRoom.yellowUid === state.user.uid ? 'Y' : '';
      if (!liveToken) throw new Error('NOT_PLAYER');
      if (liveRoom.status !== 'active') throw new Error('ROOM_NOT_ACTIVE');
      if (liveRoom.winner) throw new Error('GAME_OVER');
      if (liveRoom.turn !== liveToken) throw new Error('NOT_YOUR_TURN');

      const drop = dropPiece(liveBoard, col, liveToken);
      if (!drop) throw new Error('COLUMN_FULL');
      const outcome = checkWinner(drop.board);
      const hasBothPlayers = Boolean(liveRoom.hostUid && liveRoom.guestUid);
      const roundNumber = Number(liveRoom.roundNumber || 1);
      const scoreRound = Number(liveRoom.scoreRound || 0);
      const playerScores = { ...(liveRoom.playerScores || {}) };
      if (liveRoom.hostUid && typeof playerScores[liveRoom.hostUid] !== 'number') playerScores[liveRoom.hostUid] = 0;
      if (liveRoom.guestUid && typeof playerScores[liveRoom.guestUid] !== 'number') playerScores[liveRoom.guestUid] = 0;
      let draws = Number(liveRoom.draws || 0);
      let nextScoreRound = scoreRound;

      if (outcome.winner && scoreRound !== roundNumber) {
        if (outcome.winner === 'draw') {
          draws += 1;
        } else {
          const winnerUid = outcome.winner === 'R' ? liveRoom.redUid : liveRoom.yellowUid;
          if (winnerUid) playerScores[winnerUid] = Number(playerScores[winnerUid] || 0) + 1;
        }
        nextScoreRound = roundNumber;
      }

      tx.set(ref, {
        board: drop.board,
        turn: outcome.winner ? liveToken : (liveToken === 'R' ? 'Y' : 'R'),
        winner: outcome.winner,
        winLine: outcome.winLine,
        status: outcome.winner ? 'finished' : (hasBothPlayers ? 'active' : 'waiting'),
        playerScores,
        draws,
        scoreRound: nextScoreRound,
        rematchVotes: {},
        lastMoveColumn: col,
        lastMoveIndex: drop.index,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    window.setTimeout(() => {
      if (state.pendingDrop && state.pendingDrop.col === col) {
        state.pendingDrop = null;
        renderDropLayer();
      }
    }, DROP_DURATION_MS);
  }

  async function requestRematch() {
    if (!db || !state.user || !state.roomId || !state.roomData?.winner) return;
    const ref = roomRef(state.roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const isPlayer = room.hostUid === state.user.uid || room.guestUid === state.user.uid;
      if (!isPlayer) throw new Error('NOT_PLAYER');

      const votes = { ...(room.rematchVotes || {}) };
      votes[state.user.uid] = true;
      const bothPlayersVoted = Boolean(room.hostUid && room.guestUid && votes[room.hostUid] && votes[room.guestUid]);

      if (!bothPlayersVoted) {
        tx.set(ref, {
          rematchVotes: votes,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
      }

      const hostStartsRed = Math.random() < 0.5;
      const redUid = hostStartsRed ? room.hostUid : room.guestUid;
      const redName = hostStartsRed ? room.hostName : room.guestName;
      const yellowUid = hostStartsRed ? room.guestUid : room.hostUid;
      const yellowName = hostStartsRed ? room.guestName : room.hostName;

      tx.set(ref, {
        board: getEmptyBoard(),
        turn: 'R',
        winner: '',
        winLine: [],
        status: room.hostUid && room.guestUid ? 'active' : 'waiting',
        redUid,
        redName,
        yellowUid,
        yellowName,
        rematchVotes: {},
        roundNumber: Number(room.roundNumber || 1) + 1,
        lastMoveColumn: -1,
        lastMoveIndex: -1,
        coinTossAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  }

  async function sendChat() {
    if (!db || !state.user || !state.roomId || !els.chatInput) return;
    let text = String(els.chatInput.value || '').trim();
    if (!text) return;
    const now = Date.now();

    if (now - state.lastChatAt < 700) {
      if (els.chatStatus) els.chatStatus.textContent = 'You are sending too fast. Slow down a bit.';
      return;
    }
    if (text.length > 220) {
      if (els.chatStatus) els.chatStatus.textContent = 'Message too long.';
      return;
    }
    if (containsBlockedChat(text)) {
      if (els.chatStatus) els.chatStatus.textContent = 'Message blocked by chat filter.';
      return;
    }

    text = applyMessageOverride(text);
    state.lastChatAt = now;
    await roomMessagesRef(state.roomId).add({
      authorUid: state.user.uid,
      authorName: getDisplayName(state.user),
      authorProfile: null,
      text,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    });
    els.chatInput.value = '';
    if (els.chatStatus) els.chatStatus.textContent = 'Sent.';
  }

  async function copyInvite() {
    if (!state.roomId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', state.roomId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus('Invite link copied.');
    } catch {
      setStatus('Could not copy invite link.');
    }
  }

  async function copyRoomCode() {
    if (!state.roomId) return;
    try {
      await navigator.clipboard.writeText(state.roomId);
      setStatus('Room code copied.');
    } catch {
      setStatus('Could not copy room code.');
    }
  }

  function handleColumnPointer(event) {
    const button = event.target.closest('[data-column]');
    if (!button) return;
    const col = Number(button.dataset.column);
    if (!Number.isInteger(col)) return;
    state.hoverColumn = col;
    renderColumnRail();
  }

  function clearColumnHover() {
    if (state.hoverColumn === -1) return;
    state.hoverColumn = -1;
    renderColumnRail();
  }

  function bindEvents() {
    els.createFlowBtn?.addEventListener('click', () => {
      setGateError('');
      showGateMode('choice');
      setStatus('Creating room...');
      void createRoom()
        .then((roomId) => joinRoom(roomId))
        .then(() => {
          showGateMode('choice');
          setStatus(`Room created. Code: ${state.roomId}. Share it with your opponent.`);
        })
        .catch((error) => {
          setStatus(`Create room failed: ${error?.message || 'unknown error'}.`);
        });
    });

    els.joinFlowBtn?.addEventListener('click', () => {
      setGateError('');
      showGateMode('join');
      window.setTimeout(() => els.roomIdInput?.focus(), 0);
    });

    els.backToChoiceBtn?.addEventListener('click', () => {
      setGateError('');
      showGateMode('choice');
    });

    els.joinRoomBtn?.addEventListener('click', () => {
      setGateError('');
      void joinRoom(els.roomIdInput?.value || '').then(() => {
        showGateMode('choice');
      }).catch((error) => {
        const code = error?.message || 'JOIN_FAILED';
        if (code === 'ROOM_NOT_FOUND') return setGateError('Room not found.');
        if (code === 'ROOM_FULL') return setGateError('Room is already full.');
        if (code === 'INVALID_ROOM') return setGateError('Enter a valid room code.');
        return setGateError(`Join failed: ${code}.`);
      });
    });

    els.roomIdInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        els.joinRoomBtn?.click();
      }
    });

    els.copyRoomCodeBtn?.addEventListener('click', () => {
      void copyRoomCode();
    });

    els.copyInviteBtn?.addEventListener('click', () => {
      void copyInvite();
    });

    els.startGameBtn?.addEventListener('click', () => {
      void startGame().catch((error) => {
        setStatus(`Could not start game: ${error?.message || 'unknown error'}.`);
      });
    });

    els.columnRail?.addEventListener('pointerover', handleColumnPointer);
    els.columnRail?.addEventListener('focusin', handleColumnPointer);
    els.columnRail?.addEventListener('pointerleave', clearColumnHover);
    els.columnRail?.addEventListener('focusout', () => {
      window.setTimeout(clearColumnHover, 0);
    });
    els.columnRail?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-column]');
      if (!button) return;
      const col = Number(button.dataset.column);
      if (!Number.isInteger(col)) return;
      void playColumn(col).catch((error) => {
        state.pendingDrop = null;
        renderDropLayer();
        const code = error?.message || 'MOVE_FAILED';
        if (code === 'NOT_YOUR_TURN') return setStatus('Not your turn yet.');
        if (code === 'COLUMN_FULL') return setStatus('That column is full.');
        if (code === 'ROOM_NOT_ACTIVE') return setStatus('Need two players before moves can start.');
        setStatus('Could not place move. Try again.');
      });
    });

    els.sendChatBtn?.addEventListener('click', () => {
      void sendChat();
    });

    els.chatInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void sendChat();
      }
    });

    els.endgameRematchBtn?.addEventListener('click', () => {
      void requestRematch().catch(() => {
        setStatus('Could not request rematch.');
      });
    });
  }

  function start() {
    if (!app || !auth || !db) {
      setStatus('Firebase is not available for this page.');
      return;
    }

    bindEvents();
    showGateMode('choice');
    renderAll();
    window.addEventListener('resize', syncChatPanelHeight);

    auth.onAuthStateChanged((user) => {
      state.user = user || null;
      if (!state.user) {
        unsubscribeAll();
        state.roomId = '';
        state.roomData = null;
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
        setStatus('Log in on the hub first to play 2-player games.');
        renderAll();
        return;
      }

      const roomFromUrl = parseRoomId(new URL(window.location.href).searchParams.get('room'));
      if (roomFromUrl) {
        if (els.roomIdInput) els.roomIdInput.value = roomFromUrl;
        void joinRoom(roomFromUrl).then(() => {
          showGateMode('choice');
        }).catch((error) => {
          showGateMode('join');
          setGateError(error?.message === 'ROOM_NOT_FOUND' ? 'Room not found.' : `Could not join shared room: ${error?.message || 'unknown error'}.`);
        });
      } else {
        setStatus('Create a room or join with a code.');
      }

      renderAll();
    });
  }

  start();
})();
