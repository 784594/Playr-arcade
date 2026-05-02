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

  const ROOM_COLLECTION = 'chessRooms';
  const ROOM_PREFIX = 'chs-';
  const BOARD_SIZE = 64;
  const START_BOARD = [
    'br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br',
    'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp',
    'wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr',
  ];
  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const PIECE_POINTS = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const PROMOTION_CHOICES = ['q', 'r', 'b', 'n'];
  const STAFF_ROOM_SOURCES = [
    { key: 'tic-tac-toe', label: 'Tic-Tac-Toe', collection: 'tttRooms', path: '/games/two-player/tic-tac-toe/' },
    { key: 'infinite-craft', label: 'Infinite Craft Multiplayer', collection: 'craftRooms', path: '/games/two-player/infinite-craft-multiplayer/' },
    { key: 'battleship', label: 'Battleship', collection: 'battleshipRooms', path: '/games/two-player/battleship/' },
    { key: 'connect-4', label: 'Connect 4', collection: 'connect-4' === 'connect-4' ? 'connect4Rooms' : 'connect4Rooms', path: '/games/two-player/connect-4/' },
    { key: 'chopsticks', label: 'Chopsticks', collection: 'chopsticksRooms', path: '/games/two-player/chopsticks/' },
    { key: 'chess', label: 'Chess', collection: 'chessRooms', path: '/games/two-player/chess/' },
  ];
  const BLOCKED_CHAT_TERMS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'slut',
    'whore', 'porn', 'sex', 'nude', 'nsfw', 'xxx', 'cock', 'faggot', 'fag',
    'nigga', 'nigger', 'retard', 'tranny',
  ];
  const LEET_MAP = {
    '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g',
    '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '|': 'i',
  };

  const app = window.firebase?.apps?.length
    ? window.firebase.app()
    : window.firebase?.initializeApp
      ? window.firebase.initializeApp(firebaseConfig)
      : null;

  const auth = app && window.firebase?.auth ? window.firebase.auth() : null;
  const db = app && window.firebase?.firestore ? window.firebase.firestore() : null;

  const state = {
    user: null,
    roomId: '',
    roomData: null,
    roomUnsub: null,
    chatUnsub: null,
    selectedSquare: -1,
    legalMoves: [],
    spectating: false,
    pendingPromotionMove: null,
    staffLobbyOpen: false,
    staffRooms: [],
    staffLobbyLoading: false,
    selectedStaffRoomKey: '',
    lastChatAt: 0,
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
    myUserDisplay: document.getElementById('myUserDisplay'),
    otherUserDisplay: document.getElementById('otherUserDisplay'),
    sideDisplay: document.getElementById('sideDisplay'),
    turnDisplay: document.getElementById('turnDisplay'),
    stateDisplay: document.getElementById('stateDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
    copyInviteBtn: document.getElementById('copyInviteBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    staffLobbyBtn: document.getElementById('staffLobbyBtn'),
    gateStaffLobbyBtn: document.getElementById('gateStaffLobbyBtn'),
    board: document.getElementById('board'),
    capturedPanel: document.getElementById('capturedPanel'),
    capturedByWhite: document.getElementById('capturedByWhite'),
    capturedByBlack: document.getElementById('capturedByBlack'),
    movePanel: document.getElementById('movePanel'),
    moveLog: document.getElementById('moveLog'),
    moveCountDisplay: document.getElementById('moveCountDisplay'),
    chatPanel: document.getElementById('chatPanel'),
    chatLog: document.getElementById('chatLog'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    chatStatus: document.getElementById('chatStatus'),
    promotionOverlay: document.getElementById('promotionOverlay'),
    promotionChoices: document.getElementById('promotionChoices'),
    endgameOverlay: document.getElementById('endgameOverlay'),
    endgameCard: document.getElementById('endgameCard'),
    endgameLabel: document.getElementById('endgameLabel'),
    endgameName: document.getElementById('endgameName'),
    endgameRematchBtn: document.getElementById('endgameRematchBtn'),
    endgameRematchStatus: document.getElementById('endgameRematchStatus'),
    staffLobbyPanel: document.getElementById('staffLobbyPanel'),
    closeStaffLobbyBtn: document.getElementById('closeStaffLobbyBtn'),
    refreshStaffLobbyBtn: document.getElementById('refreshStaffLobbyBtn'),
    staffRoomList: document.getElementById('staffRoomList'),
    selectedRoomTitle: document.getElementById('selectedRoomTitle'),
    selectedRoomMeta: document.getElementById('selectedRoomMeta'),
    selectedRoomPlayers: document.getElementById('selectedRoomPlayers'),
    openRoomBtn: document.getElementById('openRoomBtn'),
    spectateRoomBtn: document.getElementById('spectateRoomBtn'),
    joinRoomFromLobbyBtn: document.getElementById('joinRoomFromLobbyBtn'),
  };

  function normalizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24) || 'Player';
  }

  function normalizeRoleName(role) {
    return String(role || '').trim().toLowerCase();
  }

  function getRoleRank(roleName) {
    const safeRole = normalizeRoleName(roleName);
    if (safeRole === 'owner') return 4;
    if (safeRole === 'admin') return 3;
    if (safeRole === 'moderator') return 2;
    if (safeRole === 'support') return 1;
    return 0;
  }

  function getCurrentAuthUser() {
    if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
      return window.PlayrAuth.getCurrentUser();
    }
    return null;
  }

  function getCurrentUserRoles() {
    const current = getCurrentAuthUser();
    return Array.isArray(current?.roles) ? current.roles.map(normalizeRoleName) : [];
  }

  function isOwnerAccount(user = getCurrentAuthUser()) {
    const identifier = String(user?.identifier || user?.email || '').trim().toLowerCase();
    return identifier === 'owner@playr.io';
  }

  function getStaffRole() {
    if (isOwnerAccount()) return 'owner';
    const roles = getCurrentUserRoles();
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    if (roles.includes('support')) return 'support';
    return '';
  }

  function canOpenStaffLobby() {
    return getRoleRank(getStaffRole()) > 0;
  }

  function setStatus(text) {
    if (els.gameStatus) els.gameStatus.textContent = text;
  }

  function setGateError(text) {
    if (!els.roomGateError) return;
    const safeText = String(text || '').trim();
    els.roomGateError.hidden = !safeText;
    els.roomGateError.textContent = safeText;
  }

  function showGateMode(mode) {
    if (!els.gateChoice || !els.joinFlow) return;
    els.gateChoice.hidden = mode !== 'choice';
    els.joinFlow.hidden = mode !== 'join';
    if (mode !== 'join') setGateError('');
  }

  function parseRoomId(raw) {
    const normalized = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
    if (!normalized) return '';
    if (normalized.startsWith(ROOM_PREFIX)) return normalized;
    const compact = normalized.replace(/-/g, '');
    const suffix = compact.startsWith('chs') ? compact.slice(3) : compact;
    return suffix ? `${ROOM_PREFIX}${suffix.slice(0, 16)}` : '';
  }

  function roomRef(roomId) {
    return db.collection(ROOM_COLLECTION).doc(roomId);
  }

  function roomMessagesRef(roomId) {
    return roomRef(roomId).collection('messages');
  }

  function boardClone(board) {
    return Array.isArray(board) ? board.slice(0, BOARD_SIZE) : START_BOARD.slice();
  }

  function createInitialPosition() {
    return {
      board: START_BOARD.slice(),
      turn: 'w',
      castling: 'KQkq',
      enPassantIndex: -1,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      winner: '',
      winnerReason: '',
      moveHistory: [],
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      lastMove: null,
    };
  }

  function indexToCoord(index) {
    return { row: Math.floor(index / 8), col: index % 8 };
  }

  function coordToIndex(row, col) {
    return (row * 8) + col;
  }

  function toAlgebraic(index) {
    const { row, col } = indexToCoord(index);
    return `${FILES[col]}${8 - row}`;
  }

  function pieceColor(piece) {
    return piece ? piece[0] : '';
  }

  function pieceType(piece) {
    return piece ? piece[1] : '';
  }

  function otherColor(color) {
    return color === 'w' ? 'b' : 'w';
  }

  function findKing(board, color) {
    return board.findIndex((piece) => piece === `${color}k`);
  }

  function makeSvgPiece(color, type) {
    const fill = color === 'w' ? '#f9fbff' : '#1d2432';
    const accent = color === 'w' ? '#dfe7f4' : '#394863';
    const stroke = color === 'w' ? '#506481' : '#b9c7d8';
    const common = `fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;
    const accentCircle = `<circle cx="36" cy="36" r="4" fill="${accent}" opacity="0.8"></circle>`;
    const paths = {
      p: `<circle cx="36" cy="20" r="9" ${common}></circle><path d="M24 54c0-10 5-18 12-18s12 8 12 18" ${common}></path><path d="M18 60h36" ${common}></path>`,
      r: `<path d="M20 20h32v8H20z" ${common}></path><path d="M24 20v-6M36 20v-6M48 20v-6" ${common}></path><path d="M24 28h24v24H24z" ${common}></path><path d="M18 60h36" ${common}></path>`,
      n: `<path d="M24 54c1-17 4-27 17-34 6-3 12 2 13 10-4-1-7 0-9 3 5 3 7 8 7 14v7H24z" ${common}></path><circle cx="43" cy="28" r="2.4" fill="${stroke}"></circle><path d="M18 60h36" ${common}></path>`,
      b: `${accentCircle}<path d="M36 16c5 5 5 12 0 16-5-4-5-11 0-16z" ${common}></path><path d="M28 36c0-8 4-12 8-12s8 4 8 12c0 7-4 12-8 18-4-6-8-11-8-18z" ${common}></path><path d="M18 60h36" ${common}></path>`,
      q: `<path d="M18 24l8 10 10-14 10 14 8-10 4 28H14z" ${common}></path><circle cx="18" cy="22" r="3" fill="${stroke}"></circle><circle cx="28" cy="18" r="3" fill="${stroke}"></circle><circle cx="36" cy="14" r="3" fill="${stroke}"></circle><circle cx="44" cy="18" r="3" fill="${stroke}"></circle><circle cx="54" cy="22" r="3" fill="${stroke}"></circle><path d="M18 60h36" ${common}></path>`,
      k: `<path d="M36 12v12M30 18h12" ${common}></path><path d="M25 28h22v8H25z" ${common}></path><path d="M28 36h16v18H28z" ${common}></path><path d="M18 60h36" ${common}></path>`,
    };
    return `<svg viewBox="0 0 72 72" aria-hidden="true">${paths[type] || ''}</svg>`;
  }

  function pieceSvg(piece) {
    if (!piece) return '';
    return makeSvgPiece(pieceColor(piece), pieceType(piece));
  }

  function sanitizeForFilter(text) {
    return String(text || '')
      .toLowerCase()
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
    const d = new Date(ms);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function getUserRole(room) {
    if (!state.user || !room) return '';
    if (room.whiteUid === state.user.uid) return 'w';
    if (room.blackUid === state.user.uid) return 'b';
    return '';
  }

  function isPlayerTurn(room) {
    return !state.spectating && getUserRole(room) === room?.turn;
  }

  function pieceBelongsToCurrentPlayer(piece, room) {
    return piece && pieceColor(piece) === getUserRole(room);
  }

  function rayMoves(board, from, color, directions) {
    const moves = [];
    const { row, col } = indexToCoord(from);
    directions.forEach(([dr, dc]) => {
      let nextRow = row + dr;
      let nextCol = col + dc;
      while (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
        const nextIndex = coordToIndex(nextRow, nextCol);
        const target = board[nextIndex];
        if (!target) {
          moves.push({ from, to: nextIndex });
        } else {
          if (pieceColor(target) !== color) {
            moves.push({ from, to: nextIndex, capture: target });
          }
          break;
        }
        nextRow += dr;
        nextCol += dc;
      }
    });
    return moves;
  }

  function attackSquaresForPiece(position, from) {
    const board = position.board;
    const piece = board[from];
    if (!piece) return [];
    const color = pieceColor(piece);
    const type = pieceType(piece);
    const { row, col } = indexToCoord(from);
    const attacks = [];

    if (type === 'p') {
      const direction = color === 'w' ? -1 : 1;
      [-1, 1].forEach((offset) => {
        const nextRow = row + direction;
        const nextCol = col + offset;
        if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
          attacks.push(coordToIndex(nextRow, nextCol));
        }
      });
      return attacks;
    }

    if (type === 'n') {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
          attacks.push(coordToIndex(nextRow, nextCol));
        }
      });
      return attacks;
    }

    if (type === 'b' || type === 'r' || type === 'q') {
      const directions = [];
      if (type === 'b' || type === 'q') directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (type === 'r' || type === 'q') directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      directions.forEach(([dr, dc]) => {
        let nextRow = row + dr;
        let nextCol = col + dc;
        while (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
          const nextIndex = coordToIndex(nextRow, nextCol);
          attacks.push(nextIndex);
          if (board[nextIndex]) break;
          nextRow += dr;
          nextCol += dc;
        }
      });
      return attacks;
    }

    if (type === 'k') {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue;
          const nextRow = row + dr;
          const nextCol = col + dc;
          if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
            attacks.push(coordToIndex(nextRow, nextCol));
          }
        }
      }
      return attacks;
    }

    return attacks;
  }

  function isSquareAttacked(position, square, byColor) {
    for (let index = 0; index < BOARD_SIZE; index += 1) {
      const piece = position.board[index];
      if (!piece || pieceColor(piece) !== byColor) continue;
      const attacks = attackSquaresForPiece(position, index);
      if (attacks.includes(square)) return true;
    }
    return false;
  }

  function isKingInCheck(position, color) {
    const kingIndex = findKing(position.board, color);
    if (kingIndex < 0) return false;
    return isSquareAttacked(position, kingIndex, otherColor(color));
  }

  function generatePseudoMoves(position, from) {
    const board = position.board;
    const piece = board[from];
    if (!piece) return [];
    const color = pieceColor(piece);
    const type = pieceType(piece);
    const { row, col } = indexToCoord(from);
    const moves = [];

    if (type === 'p') {
      const direction = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promotionRow = color === 'w' ? 0 : 7;
      const oneForwardRow = row + direction;
      if (oneForwardRow >= 0 && oneForwardRow < 8) {
        const oneForward = coordToIndex(oneForwardRow, col);
        if (!board[oneForward]) {
          moves.push({
            from,
            to: oneForward,
            promotionNeeded: oneForwardRow === promotionRow,
            piece,
          });
          const twoForwardRow = row + (direction * 2);
          const twoForward = coordToIndex(twoForwardRow, col);
          if (row === startRow && !board[twoForward]) {
            moves.push({
              from,
              to: twoForward,
              piece,
              doublePawnPush: true,
            });
          }
        }
      }

      [-1, 1].forEach((dc) => {
        const nextRow = row + direction;
        const nextCol = col + dc;
        if (nextRow < 0 || nextRow > 7 || nextCol < 0 || nextCol > 7) return;
        const nextIndex = coordToIndex(nextRow, nextCol);
        const target = board[nextIndex];
        if (target && pieceColor(target) !== color) {
          moves.push({
            from,
            to: nextIndex,
            capture: target,
            promotionNeeded: nextRow === promotionRow,
            piece,
          });
        }
        if (position.enPassantIndex === nextIndex) {
          const captureIndex = coordToIndex(row, nextCol);
          const capturePiece = board[captureIndex];
          if (capturePiece && pieceType(capturePiece) === 'p' && pieceColor(capturePiece) !== color) {
            moves.push({
              from,
              to: nextIndex,
              capture: capturePiece,
              enPassant: true,
              captureIndex,
              piece,
            });
          }
        }
      });
      return moves;
    }

    if (type === 'n') {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (nextRow < 0 || nextRow > 7 || nextCol < 0 || nextCol > 7) return;
        const nextIndex = coordToIndex(nextRow, nextCol);
        const target = board[nextIndex];
        if (!target || pieceColor(target) !== color) {
          moves.push({ from, to: nextIndex, capture: target || '', piece });
        }
      });
      return moves;
    }

    if (type === 'b') return rayMoves(board, from, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]).map((move) => ({ ...move, piece }));
    if (type === 'r') return rayMoves(board, from, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]).map((move) => ({ ...move, piece }));
    if (type === 'q') return rayMoves(board, from, color, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]).map((move) => ({ ...move, piece }));

    if (type === 'k') {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue;
          const nextRow = row + dr;
          const nextCol = col + dc;
          if (nextRow < 0 || nextRow > 7 || nextCol < 0 || nextCol > 7) continue;
          const nextIndex = coordToIndex(nextRow, nextCol);
          const target = board[nextIndex];
          if (!target || pieceColor(target) !== color) {
            moves.push({ from, to: nextIndex, capture: target || '', piece });
          }
        }
      }

      const inCheck = isKingInCheck(position, color);
      if (!inCheck) {
        const homeRow = color === 'w' ? 7 : 0;
        const rookKingSideIndex = color === 'w' ? 63 : 7;
        const rookQueenSideIndex = color === 'w' ? 56 : 0;
        if ((color === 'w' && position.castling.includes('K')) || (color === 'b' && position.castling.includes('k'))) {
          const f = coordToIndex(homeRow, 5);
          const g = coordToIndex(homeRow, 6);
          if (board[rookKingSideIndex] === `${color}r` && !board[f] && !board[g] && !isSquareAttacked(position, f, otherColor(color)) && !isSquareAttacked(position, g, otherColor(color))) {
            moves.push({ from, to: g, castle: 'king', piece });
          }
        }
        if ((color === 'w' && position.castling.includes('Q')) || (color === 'b' && position.castling.includes('q'))) {
          const d = coordToIndex(homeRow, 3);
          const c = coordToIndex(homeRow, 2);
          const b = coordToIndex(homeRow, 1);
          if (board[rookQueenSideIndex] === `${color}r` && !board[d] && !board[c] && !board[b] && !isSquareAttacked(position, d, otherColor(color)) && !isSquareAttacked(position, c, otherColor(color))) {
            moves.push({ from, to: c, castle: 'queen', piece });
          }
        }
      }
      return moves;
    }

    return moves;
  }

  function updateCastlingRights(castling, move, boardBefore) {
    let next = String(castling || '');
    const piece = move.piece || boardBefore[move.from] || '';
    const from = move.from;
    const to = move.to;
    if (piece === 'wk') next = next.replace('K', '').replace('Q', '');
    if (piece === 'bk') next = next.replace('k', '').replace('q', '');
    if (piece === 'wr' && from === 63) next = next.replace('K', '');
    if (piece === 'wr' && from === 56) next = next.replace('Q', '');
    if (piece === 'br' && from === 7) next = next.replace('k', '');
    if (piece === 'br' && from === 0) next = next.replace('q', '');
    const captured = move.capture || '';
    if (captured === 'wr' && to === 63) next = next.replace('K', '');
    if (captured === 'wr' && to === 56) next = next.replace('Q', '');
    if (captured === 'br' && to === 7) next = next.replace('k', '');
    if (captured === 'br' && to === 0) next = next.replace('q', '');
    return next;
  }

  function moveNotation(move, nextPosition, colorMoved) {
    if (move.castle === 'king') return 'O-O';
    if (move.castle === 'queen') return 'O-O-O';
    const piece = move.promotionPiece || move.piece || '';
    const type = pieceType(piece);
    const pieceLetter = type === 'p' ? '' : type.toUpperCase();
    const captureMark = move.capture ? 'x' : '';
    const target = toAlgebraic(move.to);
    const promotion = move.promotionPiece ? `=${pieceType(move.promotionPiece).toUpperCase()}` : '';
    const prefix = type === 'p' && move.capture ? FILES[indexToCoord(move.from).col] : pieceLetter;
    const nextMoves = generateLegalMoves(nextPosition, otherColor(colorMoved));
    const inCheck = isKingInCheck(nextPosition, otherColor(colorMoved));
    const suffix = nextMoves.length === 0 ? (inCheck ? '#' : '') : inCheck ? '+' : '';
    return `${prefix}${captureMark}${target}${promotion}${suffix}`;
  }

  function applyMove(position, move) {
    const board = boardClone(position.board);
    const piece = move.piece || board[move.from];
    const color = pieceColor(piece);
    const next = {
      board,
      turn: otherColor(position.turn),
      castling: updateCastlingRights(position.castling, move, position.board),
      enPassantIndex: -1,
      halfmoveClock: position.halfmoveClock + 1,
      fullmoveNumber: position.fullmoveNumber + (color === 'b' ? 1 : 0),
      winner: '',
      winnerReason: '',
      moveHistory: Array.isArray(position.moveHistory) ? position.moveHistory.slice() : [],
      whiteWins: Number(position.whiteWins || 0),
      blackWins: Number(position.blackWins || 0),
      draws: Number(position.draws || 0),
      lastMove: null,
    };

    board[move.from] = '';
    if (move.enPassant && Number.isInteger(move.captureIndex)) {
      board[move.captureIndex] = '';
    }
    if (move.castle === 'king') {
      const rookFrom = color === 'w' ? 63 : 7;
      const rookTo = move.to - 1;
      board[rookTo] = board[rookFrom];
      board[rookFrom] = '';
    }
    if (move.castle === 'queen') {
      const rookFrom = color === 'w' ? 56 : 0;
      const rookTo = move.to + 1;
      board[rookTo] = board[rookFrom];
      board[rookFrom] = '';
    }

    const placedPiece = move.promotionPiece || piece;
    board[move.to] = placedPiece;
    if (pieceType(piece) === 'p' || move.capture) {
      next.halfmoveClock = 0;
    }
    if (move.doublePawnPush) {
      next.enPassantIndex = color === 'w' ? move.to + 8 : move.to - 8;
    }

    next.lastMove = {
      from: move.from,
      to: move.to,
      piece,
      capture: move.capture || '',
      promotionPiece: move.promotionPiece || '',
      san: '',
    };

    const san = moveNotation(move, next, color);
    next.lastMove.san = san;
    next.moveHistory.push(san);
    return next;
  }

  function generateLegalMoves(position, color = position.turn) {
    const legalMoves = [];
    for (let index = 0; index < BOARD_SIZE; index += 1) {
      const piece = position.board[index];
      if (!piece || pieceColor(piece) !== color) continue;
      const pseudoMoves = generatePseudoMoves(position, index);
      pseudoMoves.forEach((move) => {
        const next = applyMove({ ...position, turn: color }, move);
        if (!isKingInCheck(next, color)) {
          legalMoves.push(move);
        }
      });
    }
    return legalMoves;
  }

  function isInsufficientMaterial(board) {
    const pieces = board.filter(Boolean);
    const nonKings = pieces.filter((piece) => pieceType(piece) !== 'k');
    if (!nonKings.length) return true;
    if (nonKings.length === 1 && ['b', 'n'].includes(pieceType(nonKings[0]))) return true;
    return false;
  }

  function resolveGameState(position) {
    const nextMoves = generateLegalMoves(position, position.turn);
    const inCheck = isKingInCheck(position, position.turn);
    const next = { ...position };
    if (nextMoves.length === 0) {
      next.winner = inCheck ? otherColor(position.turn) : 'draw';
      next.winnerReason = inCheck ? 'checkmate' : 'stalemate';
    } else if (position.halfmoveClock >= 100) {
      next.winner = 'draw';
      next.winnerReason = '50-move draw';
    } else if (isInsufficientMaterial(position.board)) {
      next.winner = 'draw';
      next.winnerReason = 'insufficient material';
    }
    if (next.winner === 'w') next.whiteWins = Number(position.whiteWins || 0) + 1;
    if (next.winner === 'b') next.blackWins = Number(position.blackWins || 0) + 1;
    if (next.winner === 'draw') next.draws = Number(position.draws || 0) + 1;
    return next;
  }

  function getCurrentPosition(room = state.roomData) {
    if (!room) return createInitialPosition();
    return {
      board: boardClone(room.board),
      turn: room.turn || 'w',
      castling: String(room.castling || 'KQkq'),
      enPassantIndex: Number.isInteger(room.enPassantIndex) ? room.enPassantIndex : -1,
      halfmoveClock: Math.max(0, Number(room.halfmoveClock || 0)),
      fullmoveNumber: Math.max(1, Number(room.fullmoveNumber || 1)),
      winner: String(room.winner || ''),
      winnerReason: String(room.winnerReason || ''),
      moveHistory: Array.isArray(room.moveHistory) ? room.moveHistory.slice() : [],
      whiteWins: Math.max(0, Number(room.whiteWins || 0)),
      blackWins: Math.max(0, Number(room.blackWins || 0)),
      draws: Math.max(0, Number(room.draws || 0)),
      lastMove: room.lastMove && typeof room.lastMove === 'object' ? room.lastMove : null,
    };
  }

  function renderBoardDecorations() {
    const top = document.querySelector('.board-files-top');
    const bottom = document.querySelector('.board-files-bottom');
    const left = document.querySelector('.board-ranks-left');
    const right = document.querySelector('.board-ranks-right');
    if (top) top.innerHTML = FILES.map((file) => `<span>${file}</span>`).join('');
    if (bottom) bottom.innerHTML = FILES.map((file) => `<span>${file}</span>`).join('');
    if (left) left.innerHTML = RANKS.map((rank) => `<span>${rank}</span>`).join('');
    if (right) right.innerHTML = RANKS.map((rank) => `<span>${rank}</span>`).join('');
  }

  function renderBoard() {
    if (!els.board) return;
    const room = state.roomData;
    const position = getCurrentPosition(room);
    const legalMoves = state.legalMoves;
    const selectedSquare = state.selectedSquare;
    const currentRole = getUserRole(room);
    const lastMove = room?.lastMove || position.lastMove;
    const checkedKingIndex = room?.winner ? -1 : (isKingInCheck(position, position.turn) ? findKing(position.board, position.turn) : -1);

    els.board.innerHTML = position.board.map((piece, index) => {
      const { row, col } = indexToCoord(index);
      const isLight = (row + col) % 2 === 0;
      const moveTarget = legalMoves.find((move) => move.to === index);
      const classes = [
        'square',
        isLight ? 'light' : 'dark',
        selectedSquare === index ? 'selected' : '',
        moveTarget ? (moveTarget.capture ? 'capture-target' : 'move-target') : '',
        lastMove?.from === index ? 'last-from' : '',
        lastMove?.to === index ? 'last-to' : '',
        checkedKingIndex === index ? 'in-check' : '',
      ].filter(Boolean).join(' ');
      const playable = !room?.winner && !state.spectating && currentRole && (
        (piece && pieceColor(piece) === currentRole)
        || Boolean(moveTarget)
      );
      return `
        <button type="button" class="${classes}${playable ? ' can-move' : ''}" data-square-index="${index}">
          ${piece ? `<span class="piece" data-piece="${piece}">${pieceSvg(piece)}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  function renderCapturedPieces() {
    if (!els.capturedPanel || !els.capturedByWhite || !els.capturedByBlack) return;
    const room = state.roomData;
    els.capturedPanel.hidden = !room;
    if (!room) return;
    const board = getCurrentPosition(room).board;
    const whiteMissing = [];
    const blackMissing = [];
    const counts = { wp: 0, wr: 0, wn: 0, wb: 0, wq: 0, wk: 0, bp: 0, br: 0, bn: 0, bb: 0, bq: 0, bk: 0 };
    board.forEach((piece) => {
      if (piece) counts[piece] = (counts[piece] || 0) + 1;
    });
    const baseline = { wp: 8, wr: 2, wn: 2, wb: 2, wq: 1, wk: 1, bp: 8, br: 2, bn: 2, bb: 2, bq: 1, bk: 1 };
    Object.keys(baseline).forEach((piece) => {
      const missing = Math.max(0, baseline[piece] - (counts[piece] || 0));
      for (let i = 0; i < missing; i += 1) {
        if (pieceColor(piece) === 'w') whiteMissing.push(piece);
        else blackMissing.push(piece);
      }
    });
    els.capturedByWhite.innerHTML = blackMissing.map((piece) => `<span class="captured-piece">${pieceSvg(piece)}</span>`).join('') || '<span class="hint">None</span>';
    els.capturedByBlack.innerHTML = whiteMissing.map((piece) => `<span class="captured-piece">${pieceSvg(piece)}</span>`).join('') || '<span class="hint">None</span>';
  }

  function renderMoveLog() {
    if (!els.movePanel || !els.moveLog || !els.moveCountDisplay) return;
    const room = state.roomData;
    els.movePanel.hidden = !room;
    if (!room) return;
    const moves = Array.isArray(room.moveHistory) ? room.moveHistory : [];
    const rows = [];
    for (let index = 0; index < moves.length; index += 2) {
      rows.push({
        turn: Math.floor(index / 2) + 1,
        white: moves[index] || '',
        black: moves[index + 1] || '',
      });
    }
    els.moveCountDisplay.textContent = `${moves.length} moves`;
    els.moveLog.innerHTML = rows.map((row) => `
      <div class="move-row">
        <span class="move-index">${row.turn}.</span>
        <span class="move-san">${escapeHtml(row.white || '--')}</span>
        <span class="move-san">${escapeHtml(row.black || '--')}</span>
      </div>
    `).join('') || '<p class="hint">No moves yet.</p>';
  }

  function renderChatLog(messages) {
    if (!els.chatLog) return;
    els.chatLog.innerHTML = messages.map((message) => `
      <article class="chat-item">
        <div class="chat-author-row">
          <span class="chat-author">${escapeHtml(normalizeName(message.authorName || 'Player'))}</span>
          <span class="chat-time">${escapeHtml(formatTime(message.createdAt))}</span>
        </div>
        <p>${escapeHtml(message.text || '')}</p>
      </article>
    `).join('') || '<p class="hint">No messages yet.</p>';
    els.chatLog.scrollTop = els.chatLog.scrollHeight;
  }

  function renderRoomMeta() {
    const room = state.roomData || null;
    const inRoom = Boolean(state.roomId);
    const currentRole = getUserRole(room);
    const position = getCurrentPosition(room);
    const myName = normalizeName(state.user?.displayName || 'Player');
    const otherName = currentRole === 'w'
      ? normalizeName(room?.blackName || 'Waiting...')
      : currentRole === 'b'
        ? normalizeName(room?.whiteName || 'Waiting...')
        : normalizeName(room?.whiteName || room?.blackName || 'Waiting...');

    if (els.roomGate) els.roomGate.hidden = inRoom || (state.staffLobbyOpen && canOpenStaffLobby());
    if (els.boardInfo) els.boardInfo.hidden = !inRoom;
    if (els.chatPanel) els.chatPanel.hidden = !inRoom;
    if (els.startGameBtn) {
      const canStart = Boolean(room && !state.spectating && room.hostUid === state.user?.uid && room.guestUid && room.status !== 'active');
      els.startGameBtn.hidden = !canStart;
    }
    if (els.staffLobbyBtn) {
      els.staffLobbyBtn.hidden = !canOpenStaffLobby();
      els.staffLobbyBtn.textContent = state.staffLobbyOpen ? 'Close Lobby' : 'Admin Lobby';
    }
    if (els.gateStaffLobbyBtn) els.gateStaffLobbyBtn.hidden = !canOpenStaffLobby();

    if (!room) return;
    if (els.roomCode) els.roomCode.textContent = state.roomId;
    if (els.myUserDisplay) els.myUserDisplay.textContent = myName;
    if (els.otherUserDisplay) els.otherUserDisplay.textContent = otherName;
    if (els.sideDisplay) els.sideDisplay.textContent = currentRole === 'w' ? 'White' : currentRole === 'b' ? 'Black' : state.spectating ? 'Spectator' : '--';
    if (els.turnDisplay) els.turnDisplay.textContent = room.turn === 'w' ? 'White' : 'Black';
    if (els.stateDisplay) {
      const base = room.status === 'active'
        ? (room.winner ? `Finished • ${room.winnerReason || 'match over'}` : (isPlayerTurn(room) ? 'Your move' : 'Waiting on opponent'))
        : room.status === 'waiting'
          ? 'Waiting for player'
          : 'Ready to start';
      els.stateDisplay.textContent = base;
    }
    if (els.scoreDisplay) {
      const myWins = currentRole === 'w' ? Number(room.whiteWins || 0) : currentRole === 'b' ? Number(room.blackWins || 0) : Number(room.whiteWins || 0);
      const myLosses = currentRole === 'w' ? Number(room.blackWins || 0) : currentRole === 'b' ? Number(room.whiteWins || 0) : Number(room.blackWins || 0);
      els.scoreDisplay.innerHTML = `
        <span>Wins: ${myWins}</span>
        <span>Losses: ${myLosses}</span>
        <span>Draws: ${Number(room.draws || 0)}</span>
      `;
    }

    const canSelect = currentRole && !room.winner && room.turn === currentRole && room.status === 'active';
    if (!canSelect) {
      state.selectedSquare = -1;
      state.legalMoves = [];
    }

    renderCapturedPieces();
    renderMoveLog();
    renderEndgameOverlay(position, room);
  }

  function renderEndgameOverlay(position, room) {
    if (!els.endgameOverlay || !els.endgameCard || !els.endgameLabel || !els.endgameName || !els.endgameRematchStatus) return;
    const winner = room?.winner || position.winner;
    const isGameOver = Boolean(winner);
    els.endgameOverlay.hidden = !isGameOver;
    if (!isGameOver) return;
    const currentRole = getUserRole(room);
    const voteCount = Object.values(room?.rematchVotes || {}).filter(Boolean).length;
    const currentVoted = Boolean(state.user && room?.rematchVotes?.[state.user.uid]);
    els.endgameCard.classList.toggle('winner-card', winner !== 'draw');
    els.endgameCard.classList.toggle('draw-card', winner === 'draw');
    if (winner === 'draw') {
      els.endgameLabel.textContent = 'Draw';
      els.endgameName.textContent = room?.winnerReason || 'Match drawn';
    } else if (winner === currentRole) {
      els.endgameLabel.textContent = 'Victory';
      els.endgameName.textContent = `${state.user?.displayName || 'Player'} won by ${room?.winnerReason || 'checkmate'}`;
    } else {
      const winnerName = winner === 'w' ? room?.whiteName : room?.blackName;
      els.endgameLabel.textContent = 'Match Over';
      els.endgameName.textContent = `${normalizeName(winnerName || 'Opponent')} won by ${room?.winnerReason || 'checkmate'}`;
    }
    if (els.endgameRematchBtn) {
      els.endgameRematchBtn.disabled = currentVoted;
      els.endgameRematchBtn.textContent = voteCount === 1 ? 'Rematch 1/2' : 'Rematch';
    }
    els.endgameRematchStatus.textContent = voteCount === 1 ? 'One player is ready for a rematch.' : 'Waiting for votes.';
  }

  function openPromotionChoices(color) {
    if (!els.promotionOverlay || !els.promotionChoices) return;
    els.promotionChoices.innerHTML = PROMOTION_CHOICES.map((choice) => {
      const piece = `${color}${choice}`;
      return `
        <button class="promotion-choice" type="button" data-promotion-piece="${piece}">
          ${pieceSvg(piece)}
          <span>${choice.toUpperCase()}</span>
        </button>
      `;
    }).join('');
    els.promotionOverlay.hidden = false;
  }

  function closePromotionChoices() {
    if (els.promotionOverlay) els.promotionOverlay.hidden = true;
    state.pendingPromotionMove = null;
  }

  function renderStaffLobby() {
    if (!els.staffLobbyPanel || !els.staffRoomList) return;
    const canShow = canOpenStaffLobby();
    els.staffLobbyPanel.hidden = !canShow || !state.staffLobbyOpen;
    document.body.classList.toggle('staff-lobby-open', canShow && state.staffLobbyOpen);
    if (!canShow || !state.staffLobbyOpen) return;

    const selected = state.staffRooms.find((room) => room.key === state.selectedStaffRoomKey) || null;
    els.staffRoomList.innerHTML = state.staffRooms.map((room) => `
      <button class="staff-room-card ${room.key === state.selectedStaffRoomKey ? 'selected' : ''}" type="button" data-staff-room-key="${room.key}">
        <strong>${escapeHtml(room.label)}</strong>
        <p>${escapeHtml(room.roomId)}</p>
        <p>${escapeHtml(room.statusLabel)}</p>
        <p>${room.participants.length} member${room.participants.length === 1 ? '' : 's'}</p>
      </button>
    `).join('') || `<p class="hint">${state.staffLobbyLoading ? 'Loading rooms...' : 'No live multiplayer rooms found.'}</p>`;

    if (els.selectedRoomTitle) {
      els.selectedRoomTitle.textContent = selected ? `${selected.label} • ${selected.roomId}` : 'Select a room';
    }
    if (els.selectedRoomMeta) {
      els.selectedRoomMeta.textContent = selected
        ? `${selected.statusLabel}. Updated ${selected.updatedLabel}.`
        : 'Pick a room to inspect players, open the room page, or spectate if it is a chess room.';
    }
    if (els.selectedRoomPlayers) {
      els.selectedRoomPlayers.innerHTML = selected
        ? selected.participants.map((participant) => `<span class="staff-user-chip">${escapeHtml(participant.role ? `${participant.name} • ${participant.role}` : participant.name)}</span>`).join('') || '<span class="hint">No tracked members.</span>'
        : '';
    }
    const selectedIsChess = selected?.gameKey === 'chess';
    if (els.openRoomBtn) els.openRoomBtn.disabled = !selected;
    if (els.spectateRoomBtn) els.spectateRoomBtn.disabled = !selectedIsChess;
    if (els.joinRoomFromLobbyBtn) els.joinRoomFromLobbyBtn.disabled = !selectedIsChess;
  }

  function extractRoomParticipants(source, roomId, data) {
    if (source.key === 'tic-tac-toe') {
      return [
        { uid: data.xUid, name: normalizeName(data.xName || 'Waiting'), role: data.xUid ? 'X' : 'Open' },
        { uid: data.oUid, name: normalizeName(data.oName || 'Waiting'), role: data.oUid ? 'O' : 'Open' },
      ].filter((entry) => entry.uid || entry.name === 'Waiting');
    }
    if (source.key === 'infinite-craft') {
      return Object.entries(data.participants || {}).map(([uid, participant]) => ({
        uid,
        name: normalizeName(participant?.name || 'Player'),
        role: normalizeName(participant?.role || ''),
      }));
    }
    if (source.key === 'battleship') {
      return [
        { uid: data.hostUid, name: normalizeName(data.hostName || 'Host'), role: 'Host' },
        { uid: data.guestUid, name: normalizeName(data.guestName || 'Waiting'), role: data.guestUid ? 'Guest' : 'Open' },
      ].filter((entry) => entry.uid || entry.name === 'Waiting');
    }
    if (source.key === 'connect-4') {
      return [
        { uid: data.redUid, name: normalizeName(data.redName || 'Red'), role: 'Red' },
        { uid: data.yellowUid, name: normalizeName(data.yellowName || 'Waiting'), role: data.yellowUid ? 'Yellow' : 'Open' },
      ].filter((entry) => entry.uid || entry.name === 'Waiting');
    }
    if (source.key === 'chopsticks') {
      return [
        { uid: data.hostUid, name: normalizeName(data.hostName || 'Host'), role: 'Host' },
        { uid: data.guestUid, name: normalizeName(data.guestName || 'Waiting'), role: data.guestUid ? 'Guest' : 'Open' },
      ].filter((entry) => entry.uid || entry.name === 'Waiting');
    }
    if (source.key === 'chess') {
      return [
        { uid: data.whiteUid, name: normalizeName(data.whiteName || data.hostName || 'White'), role: data.whiteUid ? 'White' : 'Open' },
        { uid: data.blackUid, name: normalizeName(data.blackName || data.guestName || 'Waiting'), role: data.blackUid ? 'Black' : 'Open' },
      ].filter((entry) => entry.uid || entry.name === 'Waiting');
    }
    return [];
  }

  async function refreshStaffLobby() {
    if (!db || !canOpenStaffLobby()) return;
    state.staffLobbyLoading = true;
    renderStaffLobby();
    try {
      const snapshots = await Promise.all(STAFF_ROOM_SOURCES.map(async (source) => {
        const snap = await db.collection(source.collection).orderBy('updatedAt', 'desc').limit(10).get();
        return snap.docs.map((doc) => {
          const data = doc.data() || {};
          const updatedAtMs = timestampToMs(data.updatedAt || data.createdAt);
          return {
            key: `${source.key}:${doc.id}`,
            gameKey: source.key,
            label: source.label,
            collection: source.collection,
            roomId: doc.id,
            path: source.path,
            statusLabel: String(data.status || data.phase || 'active'),
            updatedAtMs,
            updatedLabel: updatedAtMs ? new Date(updatedAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
            participants: extractRoomParticipants(source, doc.id, data),
          };
        });
      }));
      state.staffRooms = snapshots.flat().sort((left, right) => right.updatedAtMs - left.updatedAtMs);
      if (!state.selectedStaffRoomKey && state.staffRooms.length) {
        state.selectedStaffRoomKey = state.staffRooms[0].key;
      }
    } catch (error) {
      setStatus(`Could not load staff lobby rooms: ${error?.message || 'unknown error'}.`);
    } finally {
      state.staffLobbyLoading = false;
      renderStaffLobby();
    }
  }

  async function createRoom() {
    if (!db || !state.user) return;
    const roomId = `${ROOM_PREFIX}${Math.random().toString(36).slice(2, 7).toLowerCase()}`;
    const initial = createInitialPosition();
    await roomRef(roomId).set({
      roomId,
      status: 'waiting',
      hostUid: state.user.uid,
      hostName: normalizeName(state.user.displayName || 'Host'),
      guestUid: '',
      guestName: '',
      whiteUid: '',
      whiteName: '',
      blackUid: '',
      blackName: '',
      board: initial.board,
      turn: initial.turn,
      winner: '',
      winnerReason: '',
      castling: initial.castling,
      enPassantIndex: initial.enPassantIndex,
      halfmoveClock: initial.halfmoveClock,
      fullmoveNumber: initial.fullmoveNumber,
      moveHistory: [],
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      rematchVotes: {},
      lastMove: null,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await joinRoom(roomId);
    setStatus(`Room created. Code: ${roomId}.`);
  }

  async function joinRoom(rawRoomId) {
    if (!db || !state.user) return false;
    const roomId = parseRoomId(rawRoomId);
    if (!roomId) {
      setGateError('Enter a valid room code.');
      return false;
    }
    const ref = roomRef(roomId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      if (room.guestUid && room.guestUid !== state.user.uid && room.hostUid !== state.user.uid) {
        throw new Error('ROOM_FULL');
      }
      if (room.hostUid !== state.user.uid && !room.guestUid) {
        tx.set(ref, {
          guestUid: state.user.uid,
          guestName: normalizeName(state.user.displayName || 'Guest'),
          status: room.status === 'waiting' ? 'ready' : room.status,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    });
    state.spectating = false;
    openRoomSubscription(roomId);
    showGateMode('choice');
    return true;
  }

  function spectateRoom(roomId) {
    state.spectating = true;
    openRoomSubscription(roomId);
    setStatus(`Spectating ${roomId}.`);
  }

  function closeSubscriptions() {
    if (typeof state.roomUnsub === 'function') state.roomUnsub();
    if (typeof state.chatUnsub === 'function') state.chatUnsub();
    state.roomUnsub = null;
    state.chatUnsub = null;
  }

  function openRoomSubscription(roomId) {
    closeSubscriptions();
    state.roomId = roomId;
    state.roomUnsub = roomRef(roomId).onSnapshot((snapshot) => {
      if (!snapshot.exists) return;
      state.roomData = snapshot.data() || null;
      renderRoomMeta();
      renderBoard();
      renderStaffLobby();
    });
    state.chatUnsub = roomMessagesRef(roomId).orderBy('createdAt', 'asc').limitToLast(60).onSnapshot((snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => messages.push(doc.data() || {}));
      renderChatLog(messages);
    });
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

      const initial = createInitialPosition();
      const hostIsWhite = Math.random() < 0.5;
      tx.set(ref, {
        status: 'active',
        whiteUid: hostIsWhite ? room.hostUid : room.guestUid,
        whiteName: hostIsWhite ? room.hostName : room.guestName,
        blackUid: hostIsWhite ? room.guestUid : room.hostUid,
        blackName: hostIsWhite ? room.guestName : room.hostName,
        board: initial.board,
        turn: 'w',
        winner: '',
        winnerReason: '',
        castling: initial.castling,
        enPassantIndex: initial.enPassantIndex,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        moveHistory: [],
        rematchVotes: {},
        lastMove: null,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    setStatus('Match started.');
  }

  async function requestRematch() {
    if (!db || !state.user || !state.roomId || !state.roomData?.winner) return;
    const ref = roomRef(state.roomId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const isPlayer = room.whiteUid === state.user.uid || room.blackUid === state.user.uid;
      if (!isPlayer) throw new Error('NOT_PLAYER');
      const votes = { ...(room.rematchVotes || {}) };
      votes[state.user.uid] = true;
      const both = Boolean(room.whiteUid && room.blackUid && votes[room.whiteUid] && votes[room.blackUid]);
      if (!both) {
        tx.set(ref, { rematchVotes: votes, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        return;
      }
      const reset = createInitialPosition();
      tx.set(ref, {
        status: 'active',
        board: reset.board,
        turn: 'w',
        winner: '',
        winnerReason: '',
        castling: reset.castling,
        enPassantIndex: reset.enPassantIndex,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        moveHistory: [],
        whiteWins: Number(room.whiteWins || 0),
        blackWins: Number(room.blackWins || 0),
        draws: Number(room.draws || 0),
        rematchVotes: {},
        lastMove: null,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  }

  async function commitMove(move) {
    if (!db || !state.user || !state.roomId || !state.roomData) return;
    const ref = roomRef(state.roomId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const currentRole = room.whiteUid === state.user.uid ? 'w' : room.blackUid === state.user.uid ? 'b' : '';
      if (!currentRole) throw new Error('NOT_PLAYER');
      if (room.turn !== currentRole) throw new Error('NOT_YOUR_TURN');
      if (room.winner || room.status !== 'active') throw new Error('GAME_NOT_ACTIVE');

      const position = getCurrentPosition(room);
      const legalMoves = generateLegalMoves(position, currentRole);
      const selectedMove = legalMoves.find((candidate) => candidate.from === move.from && candidate.to === move.to && (
        Boolean(candidate.promotionNeeded) === Boolean(move.promotionNeeded)
      ));
      if (!selectedMove) throw new Error('ILLEGAL_MOVE');
      const committedMove = { ...selectedMove };
      if (selectedMove.promotionNeeded) {
        if (!move.promotionPiece || pieceColor(move.promotionPiece) !== currentRole) throw new Error('PROMOTION_REQUIRED');
        committedMove.promotionPiece = move.promotionPiece;
      }
      let nextPosition = applyMove(position, committedMove);
      nextPosition = resolveGameState(nextPosition);
      tx.set(ref, {
        board: nextPosition.board,
        turn: nextPosition.turn,
        castling: nextPosition.castling,
        enPassantIndex: nextPosition.enPassantIndex,
        halfmoveClock: nextPosition.halfmoveClock,
        fullmoveNumber: nextPosition.fullmoveNumber,
        winner: nextPosition.winner,
        winnerReason: nextPosition.winnerReason,
        moveHistory: nextPosition.moveHistory,
        whiteWins: nextPosition.whiteWins,
        blackWins: nextPosition.blackWins,
        draws: nextPosition.draws,
        lastMove: nextPosition.lastMove,
        rematchVotes: {},
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    state.selectedSquare = -1;
    state.legalMoves = [];
    closePromotionChoices();
  }

  function handleSquareClick(index) {
    const room = state.roomData;
    const position = getCurrentPosition(room);
    const currentRole = getUserRole(room);
    if (!room || room.status !== 'active' || room.winner || state.spectating || room.turn !== currentRole) return;

    const targetMove = state.legalMoves.find((move) => move.to === index);
    if (targetMove) {
      if (targetMove.promotionNeeded) {
        state.pendingPromotionMove = targetMove;
        openPromotionChoices(currentRole);
        return;
      }
      void commitMove(targetMove).catch((error) => {
        setStatus(`Move failed: ${error?.message || 'unknown error'}.`);
      });
      return;
    }

    const piece = position.board[index];
    if (!piece || !pieceBelongsToCurrentPlayer(piece, room)) {
      state.selectedSquare = -1;
      state.legalMoves = [];
      renderBoard();
      return;
    }

    const legalMoves = generateLegalMoves(position, currentRole).filter((move) => move.from === index);
    state.selectedSquare = index;
    state.legalMoves = legalMoves;
    renderBoard();
  }

  async function sendChat() {
    if (!db || !state.user || !state.roomId || !els.chatInput) return;
    const text = String(els.chatInput.value || '').trim();
    if (!text) return;
    if (containsBlockedChat(text)) {
      if (els.chatStatus) els.chatStatus.textContent = 'Message blocked by chat filter.';
      return;
    }
    const now = Date.now();
    if (now - state.lastChatAt < 700) {
      if (els.chatStatus) els.chatStatus.textContent = 'You are sending too fast. Slow down a bit.';
      return;
    }
    state.lastChatAt = now;
    await roomMessagesRef(state.roomId).add({
      authorUid: state.user.uid,
      authorName: normalizeName(state.user.displayName || 'Player'),
      authorProfile: getCurrentAuthUser(),
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

  function selectStaffRoom(key) {
    state.selectedStaffRoomKey = key;
    renderStaffLobby();
  }

  function openSelectedStaffRoom() {
    const selected = state.staffRooms.find((room) => room.key === state.selectedStaffRoomKey);
    if (!selected) return;
    const url = new URL(selected.path, window.location.origin);
    url.searchParams.set('room', selected.roomId);
    window.location.href = url.toString();
  }

  function bindEvents() {
    els.createFlowBtn?.addEventListener('click', () => {
      void createRoom().catch((error) => {
        setStatus(`Create room failed: ${error?.message || 'unknown error'}.`);
      });
    });

    els.joinFlowBtn?.addEventListener('click', () => {
      showGateMode('join');
      window.setTimeout(() => els.roomIdInput?.focus(), 0);
    });

    els.backToChoiceBtn?.addEventListener('click', () => {
      showGateMode('choice');
    });

    els.joinRoomBtn?.addEventListener('click', () => {
      void joinRoom(els.roomIdInput?.value || '').catch((error) => {
        const code = error?.message || 'JOIN_FAILED';
        if (code === 'ROOM_NOT_FOUND') return setGateError('Room not found.');
        if (code === 'ROOM_FULL') return setGateError('Room is already full.');
        setGateError(`Join failed: ${code}.`);
      });
    });

    els.roomIdInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        els.joinRoomBtn?.click();
      }
    });

    els.startGameBtn?.addEventListener('click', () => {
      void startGame().catch((error) => {
        setStatus(`Could not start match: ${error?.message || 'unknown error'}.`);
      });
    });

    els.board?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-square-index]');
      if (!button) return;
      handleSquareClick(Number(button.getAttribute('data-square-index')));
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

    els.copyInviteBtn?.addEventListener('click', () => {
      void copyInvite();
    });

    els.copyRoomCodeBtn?.addEventListener('click', () => {
      void copyRoomCode();
    });

    els.endgameRematchBtn?.addEventListener('click', () => {
      void requestRematch().catch(() => {
        setStatus('Could not request rematch.');
      });
    });

    const toggleStaffLobby = () => {
      if (!canOpenStaffLobby()) return;
      state.staffLobbyOpen = !state.staffLobbyOpen;
      if (state.staffLobbyOpen) {
        void refreshStaffLobby();
      }
      renderStaffLobby();
      renderRoomMeta();
    };

    els.staffLobbyBtn?.addEventListener('click', toggleStaffLobby);
    els.gateStaffLobbyBtn?.addEventListener('click', toggleStaffLobby);
    els.closeStaffLobbyBtn?.addEventListener('click', () => {
      state.staffLobbyOpen = false;
      renderStaffLobby();
      renderRoomMeta();
    });
    els.refreshStaffLobbyBtn?.addEventListener('click', () => {
      void refreshStaffLobby();
    });

    els.staffLobbyPanel?.addEventListener('click', (event) => {
      const roomButton = event.target.closest('[data-staff-room-key]');
      if (roomButton) {
        selectStaffRoom(roomButton.getAttribute('data-staff-room-key') || '');
      }
    });

    els.openRoomBtn?.addEventListener('click', openSelectedStaffRoom);
    els.spectateRoomBtn?.addEventListener('click', () => {
      const selected = state.staffRooms.find((room) => room.key === state.selectedStaffRoomKey);
      if (!selected || selected.gameKey !== 'chess') return;
      state.staffLobbyOpen = false;
      spectateRoom(selected.roomId);
      renderStaffLobby();
      renderRoomMeta();
    });
    els.joinRoomFromLobbyBtn?.addEventListener('click', () => {
      const selected = state.staffRooms.find((room) => room.key === state.selectedStaffRoomKey);
      if (!selected || selected.gameKey !== 'chess') return;
      state.staffLobbyOpen = false;
      void joinRoom(selected.roomId).catch((error) => {
        setStatus(`Could not join room: ${error?.message || 'unknown error'}.`);
      });
    });

    els.promotionChoices?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-promotion-piece]');
      if (!button || !state.pendingPromotionMove) return;
      const promotionPiece = button.getAttribute('data-promotion-piece') || '';
      void commitMove({ ...state.pendingPromotionMove, promotionPiece }).catch((error) => {
        setStatus(`Promotion failed: ${error?.message || 'unknown error'}.`);
      });
    });
  }

  function hydrateSignedInUser(user) {
    const authUser = getCurrentAuthUser();
    if (authUser) {
      return {
        uid: String(authUser.uid || user?.uid || ''),
        displayName: normalizeName(authUser.displayName || user?.displayName || 'Player'),
        identifier: String(authUser.identifier || '').trim().toLowerCase(),
        roles: Array.isArray(authUser.roles) ? authUser.roles : [],
      };
    }
    return {
      uid: String(user?.uid || ''),
      displayName: normalizeName(user?.displayName || 'Player'),
      identifier: '',
      roles: [],
    };
  }

  function init() {
    if (!app || !auth || !db) {
      setStatus('Firebase is not available for this page.');
      return;
    }
    renderBoardDecorations();
    renderBoard();
    showGateMode('choice');
    bindEvents();

    auth.onAuthStateChanged((user) => {
      state.user = user ? hydrateSignedInUser(user) : null;
      if (!state.user) {
        setStatus('Log in on the hub first to play multiplayer chess.');
        return;
      }
      const roomFromUrl = parseRoomId(new URL(window.location.href).searchParams.get('room'));
      const spectate = new URL(window.location.href).searchParams.get('spectate') === '1';
      if (roomFromUrl) {
        if (spectate && canOpenStaffLobby()) {
          spectateRoom(roomFromUrl);
        } else {
          void joinRoom(roomFromUrl).catch((error) => {
            setGateError(error?.message === 'ROOM_NOT_FOUND' ? 'Room not found.' : `Could not join shared room: ${error?.message || 'unknown error'}.`);
            showGateMode('join');
          });
        }
      } else {
        setStatus('Create a room or join with a code.');
      }
      renderRoomMeta();
      renderBoard();
    });
  }

  init();
})();
