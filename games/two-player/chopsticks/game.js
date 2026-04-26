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

  const ROOM_COLLECTION = 'chopsticksRooms';
  const MOVE_TIMER_MS = 30000;
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
    timerInterval: null,
    lastChatAt: 0,
    mode: 'attack',
    selectedOwnHand: '',
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
    timerDisplay: document.getElementById('timerDisplay'),
    timerFill: document.getElementById('timerFill'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
    copyInviteBtn: document.getElementById('copyInviteBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    attackModeBtn: document.getElementById('attackModeBtn'),
    transferModeBtn: document.getElementById('transferModeBtn'),
    clearSelectionBtn: document.getElementById('clearSelectionBtn'),
    modeHint: document.getElementById('modeHint'),
    arena: document.getElementById('arena'),
    chatPanel: document.getElementById('chatPanel'),
    chatLog: document.getElementById('chatLog'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    chatStatus: document.getElementById('chatStatus'),
    endgameOverlay: document.getElementById('endgameOverlay'),
    endgameLabel: document.getElementById('endgameLabel'),
    endgameName: document.getElementById('endgameName'),
    endgameRematchBtn: document.getElementById('endgameRematchBtn'),
    endgameRematchStatus: document.getElementById('endgameRematchStatus'),
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
    if (!value && value !== 0) return 0;
    if (typeof value === 'number') return value;
    if (typeof value?.toDate === 'function') return value.toDate().getTime();
    if (typeof value?.seconds === 'number') return value.seconds * 1000;
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
    return `chp-${Math.random().toString(36).slice(2, 8)}`;
  }

  function parseRoomId(raw) {
    const normalized = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    return /^chp-[a-z0-9]{6,16}$/.test(normalized) ? normalized : '';
  }

  function sanitizeHandValue(value) {
    const safe = Math.max(0, Math.floor(Number(value) || 0));
    return safe >= 5 ? 0 : safe;
  }

  function getCurrentSide(room) {
    if (!room || !state.user) return '';
    if (room.hostUid === state.user.uid) return 'host';
    if (room.guestUid === state.user.uid) return 'guest';
    return '';
  }

  function getOpponentSide(side) {
    return side === 'host' ? 'guest' : side === 'guest' ? 'host' : '';
  }

  function getSideUid(room, side) {
    if (!room) return '';
    return side === 'host' ? room.hostUid || '' : side === 'guest' ? room.guestUid || '' : '';
  }

  function getSideName(room, side) {
    if (!room) return 'Player';
    return side === 'host' ? room.hostName || 'Host' : side === 'guest' ? room.guestName || 'Guest' : 'Player';
  }

  function getStarterSide(roundNumber) {
    return Number(roundNumber || 1) % 2 === 1 ? 'host' : 'guest';
  }

  function getHandValue(room, side, hand) {
    if (!room || !side || !hand) return 0;
    return sanitizeHandValue(room[`${side}${hand === 'left' ? 'Left' : 'Right'}`]);
  }

  function setHandValues(update, side, leftValue, rightValue) {
    update[`${side}Left`] = sanitizeHandValue(leftValue);
    update[`${side}Right`] = sanitizeHandValue(rightValue);
  }

  function bothHandsDead(room, side) {
    return getHandValue(room, side, 'left') === 0 && getHandValue(room, side, 'right') === 0;
  }

  function getProgressionApi() {
    return window.PlayrProgression && typeof window.PlayrProgression.formatIdentityMarkup === 'function'
      ? window.PlayrProgression
      : null;
  }

  function getCurrentIdentityRecord() {
    if (window.PlayrProgression && typeof window.PlayrProgression.getCurrentRecord === 'function') {
      return window.PlayrProgression.getCurrentRecord();
    }
    if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
      return window.PlayrAuth.getCurrentUser();
    }
    return state.user || null;
  }

  function formatPlayerIdentity(name, userLike = null) {
    const api = getProgressionApi();
    if (!api) return escapeHtml(normalizeName(name || 'Player'));
    return api.formatIdentityMarkup(name, {
      record: userLike || null,
      showBadges: Boolean(userLike),
      compact: true,
    });
  }

  function containsBlockedChat(text) {
    const direct = String(text || '').toLowerCase();
    const mapped = direct.split('').map((character) => LEET_MAP[character] || character).join('');
    return BLOCKED_CHAT_TERMS.some((term) => direct.includes(term) || mapped.includes(term));
  }

  function getRoundResetPatch(room, nextRoundNumber = Number(room?.roundNumber || 1)) {
    const starterSide = getStarterSide(nextRoundNumber);
    const starterUid = getSideUid(room, starterSide);
    return {
      status: room.hostUid && room.guestUid ? 'active' : 'waiting',
      hostLeft: 1,
      hostRight: 1,
      guestLeft: 1,
      guestRight: 1,
      turnUid: starterUid,
      turnSide: starterSide,
      winnerUid: '',
      winnerName: '',
      winnerSide: '',
      roundNumber: nextRoundNumber,
      rematchVotes: {},
      lastAction: `Round ${nextRoundNumber} started.`,
      lastActionType: 'round-start',
      lastActorUid: starterUid || '',
      turnStartedAt: Date.now(),
      turnDeadlineAt: Date.now() + MOVE_TIMER_MS,
      updatedAt: Date.now(),
    };
  }

  function clearSelection() {
    state.selectedOwnHand = '';
    renderAll();
  }

  function updateMode(nextMode) {
    state.mode = nextMode === 'transfer' ? 'transfer' : 'attack';
    state.selectedOwnHand = '';
    renderAll();
  }

  function getActionHint(room) {
    const side = getCurrentSide(room);
    const opponentSide = getOpponentSide(side);
    if (!state.user) return 'Log in on the hub first to play 2-player games.';
    if (!room) return 'Create a room or join with a code to begin.';
    if (room.status === 'waiting') return 'Waiting for a second player to join.';
    if (room.status === 'ready') {
      return room.hostUid === state.user.uid ? 'Your room is ready. Press Start Game when both players are ready.' : 'Waiting for the host to start the round.';
    }
    if (room.winnerUid) {
      return 'Round finished. Vote for a rematch to continue.';
    }
    if (room.turnUid !== state.user.uid) {
      return `Waiting for ${getSideName(room, room.turnSide)} to move.`;
    }

    if (state.mode === 'attack') {
      if (!state.selectedOwnHand) return 'Attack mode: pick one of your live hands, then tap one of the opponent hands.';
      return `Attack mode: ${state.selectedOwnHand} hand selected. Choose ${getSideName(room, opponentSide)}'s left or right hand.`;
    }

    if (!state.selectedOwnHand) return 'Transfer mode: pick one of your live hands to move 1 finger from.';
    return `Transfer mode: ${state.selectedOwnHand} hand selected. Pick your other hand to move 1 finger to it.`;
  }

  function isMyTurn(room) {
    return Boolean(room && state.user && room.status === 'active' && !room.winnerUid && room.turnUid === state.user.uid);
  }

  function canUseOwnHand(room, hand) {
    const side = getCurrentSide(room);
    return getHandValue(room, side, hand) > 0;
  }

  function wouldBeValidTransfer(room, sourceHand, targetHand) {
    const side = getCurrentSide(room);
    if (!side || sourceHand === targetHand) return false;
    const sourceValue = getHandValue(room, side, sourceHand);
    const targetValue = getHandValue(room, side, targetHand);
    if (sourceValue <= 0) return false;
    const nextSource = sourceValue - 1;
    const nextTarget = targetValue + 1;
    if (nextTarget >= 5) return false;
    return nextSource !== sourceValue || nextTarget !== targetValue;
  }

  function renderTimer(room) {
    const deadline = timestampToMs(room?.turnDeadlineAt);
    if (!els.timerDisplay || !els.timerFill) return;
    if (!deadline || room?.status !== 'active' || room?.winnerUid) {
      els.timerDisplay.textContent = '--.-s';
      els.timerFill.style.transform = 'scaleX(0)';
      return;
    }
    const remaining = Math.max(0, deadline - Date.now());
    const ratio = Math.max(0, Math.min(1, remaining / MOVE_TIMER_MS));
    els.timerDisplay.textContent = `${(remaining / 1000).toFixed(1)}s`;
    els.timerFill.style.transform = `scaleX(${ratio})`;
  }

  function renderRoomMeta() {
    const room = state.roomData;
    const side = getCurrentSide(room);
    const opponentSide = getOpponentSide(side);
    const hasRoomTarget = Boolean(state.roomId);
    const inRoom = Boolean(state.roomId && room);
    if (els.roomGate) {
      els.roomGate.hidden = hasRoomTarget;
      els.roomGate.classList.toggle('is-hidden', hasRoomTarget);
    }
    if (els.boardInfo) els.boardInfo.hidden = !inRoom;
    if (els.chatPanel) els.chatPanel.hidden = !inRoom;

    if (!room) {
      if (els.startGameBtn) els.startGameBtn.hidden = true;
      if (els.modeHint) els.modeHint.textContent = getActionHint(null);
      renderTimer(null);
      return;
    }

    if (els.roomCode) els.roomCode.textContent = state.roomId;
    if (els.myUserDisplay) {
      els.myUserDisplay.innerHTML = formatPlayerIdentity(getSideName(room, side || 'host'), getCurrentIdentityRecord());
    }
    if (els.otherUserDisplay) {
      const otherName = opponentSide ? getSideName(room, opponentSide) : 'Waiting...';
      els.otherUserDisplay.textContent = otherName;
    }

    if (els.turnDisplay) {
      if (room.winnerUid) {
        els.turnDisplay.textContent = `${room.winnerName || 'Winner'} took the round`;
      } else if (room.status === 'waiting') {
        els.turnDisplay.textContent = 'Waiting for player';
      } else if (room.status === 'ready') {
        els.turnDisplay.textContent = 'Ready to start';
      } else {
        els.turnDisplay.textContent = getSideName(room, room.turnSide || 'host');
      }
    }

    const scores = room.playerScores || {};
    const hostScore = Number(scores[room.hostUid] || 0);
    const guestScore = Number(scores[room.guestUid] || 0);
    if (els.scoreDisplay) {
      els.scoreDisplay.innerHTML = `
        <span>${escapeHtml(room.hostName || 'Host')}: <strong>${hostScore}</strong></span>
        <span>${escapeHtml(room.guestName || 'Guest')}: <strong>${guestScore}</strong></span>
      `;
    }

    const hostCanStart = room.hostUid === state.user?.uid && room.status === 'ready';
    if (els.startGameBtn) els.startGameBtn.hidden = !hostCanStart;
    if (els.modeHint) els.modeHint.textContent = getActionHint(room);
    renderTimer(room);
  }

  function buildHandCard({ perspective, hand, count, side, selectable, selected, valid }) {
    const isDead = count <= 0;
    const fingers = [0, 1, 2, 3].map((index) => {
      const active = index < count ? ' is-up' : '';
      return `<span class="finger finger-${index + 1}${active}"></span>`;
    }).join('');
    const label = `${perspective === 'self' ? 'Your' : `${getSideName(state.roomData, side)}'s`} ${hand} hand`;
    const classes = [
      'hand-card',
      selectable ? 'is-clickable' : '',
      selected ? 'is-selected' : '',
      valid ? 'is-valid' : '',
      isDead ? 'is-dead' : '',
    ].filter(Boolean).join(' ');
    return `
      <button
        class="${classes}"
        type="button"
        data-side="${escapeHtml(side)}"
        data-hand="${escapeHtml(hand)}"
        ${selectable ? '' : 'disabled'}
        aria-label="${escapeHtml(`${label} showing ${count} finger${count === 1 ? '' : 's'}`)}"
      >
        <div class="hand-header">
          <span>${escapeHtml(hand === 'left' ? 'Left Hand' : 'Right Hand')}</span>
          <span class="hand-count">${count}</span>
        </div>
        <span class="hand-dead-label">Hidden</span>
        <div class="hand-model">
          <div class="thumb ${hand === 'left' ? 'left' : 'right'}"></div>
          <div class="finger-wrap">${fingers}</div>
          <div class="hand-palm"></div>
        </div>
        ${selected ? '<span class="selection-pulse">Selected</span>' : valid ? '<span class="selection-pulse">Valid move</span>' : ''}
      </button>
    `;
  }

  function renderArena() {
    if (!els.arena) return;
    const room = state.roomData;
    if (!room) {
      els.arena.innerHTML = `
        <div class="arena-centerline"></div>
        <div class="player-zone opponent">
          <div class="player-strip"><span class="tag">Opponent</span></div>
        </div>
        <div class="player-zone self">
          <div class="player-strip"><span class="tag">Your hands will appear here after joining a room.</span></div>
        </div>
      `;
      return;
    }

    const side = getCurrentSide(room);
    const opponentSide = getOpponentSide(side);
    const myTurn = isMyTurn(room);
    const ownHands = ['left', 'right'];
    const oppHands = ['left', 'right'];

    const opponentCards = oppHands.map((hand) => {
      const count = getHandValue(room, opponentSide, hand);
      const valid = myTurn && state.mode === 'attack' && state.selectedOwnHand && count > 0;
      return buildHandCard({
        perspective: 'opponent',
        hand,
        count,
        side: opponentSide,
        selectable: valid,
        selected: false,
        valid,
      });
    }).join('');

    const ownCards = ownHands.map((hand) => {
      const count = getHandValue(room, side, hand);
      const isSelected = state.selectedOwnHand === hand;
      const selectable = myTurn && count > 0;
      let valid = false;
      if (myTurn) {
        if (!state.selectedOwnHand) {
          valid = count > 0;
        } else if (state.mode === 'transfer') {
          valid = hand !== state.selectedOwnHand && wouldBeValidTransfer(room, state.selectedOwnHand, hand);
        } else if (!isSelected) {
          valid = false;
        }
      }

      return buildHandCard({
        perspective: 'self',
        hand,
        count,
        side,
        selectable,
        selected: isSelected,
        valid,
      });
    }).join('');

    els.arena.innerHTML = `
      <div class="arena-centerline"></div>
      <section class="player-zone opponent">
        <div class="player-strip">
          <span class="tag">Opponent</span>
          <span class="tag">Round ${Math.max(1, Number(room.roundNumber || 1))}</span>
          ${room.lastAction ? `<span class="tag">${escapeHtml(room.lastAction)}</span>` : ''}
        </div>
        <div class="hand-row">${opponentCards}</div>
      </section>
      <section class="player-zone self">
        <div class="player-strip">
          <span class="tag">You</span>
          <span class="tag">${state.mode === 'attack' ? 'Attack mode' : 'Transfer mode'}</span>
        </div>
        <div class="hand-row">${ownCards}</div>
      </section>
    `;
  }

  function renderEndgameOverlay() {
    const room = state.roomData;
    const winnerUid = String(room?.winnerUid || '').trim();
    if (!els.endgameOverlay || !els.endgameName || !els.endgameLabel || !els.endgameRematchStatus) return;
    const visible = Boolean(room && winnerUid);
    els.endgameOverlay.hidden = !visible;
    if (!visible) return;
    const myVote = Boolean(state.user?.uid && room.rematchVotes?.[state.user.uid]);
    const voteCount = Object.values(room.rematchVotes || {}).filter(Boolean).length;
    els.endgameLabel.textContent = room.lastActionType === 'timeout' ? 'Timer Loss' : 'Round Winner';
    els.endgameName.textContent = room.winnerName || 'Winner';
    els.endgameRematchStatus.textContent = myVote
      ? `Rematch vote locked in. ${voteCount}/2 ready.`
      : `Vote for rematch. ${voteCount}/2 ready.`;
  }

  function updateStatusFromRoom() {
    const room = state.roomData;
    const side = getCurrentSide(room);
    if (!state.user) {
      setStatus('Log in on the hub first to play 2-player games.');
      return;
    }
    if (!room) {
      setStatus('Create a room or join with a code.');
      return;
    }
    if (room.status === 'waiting') {
      setStatus('Room created. Waiting for second player...');
    } else if (room.status === 'ready') {
      setStatus(room.hostUid === state.user.uid ? 'Player joined. Start the match when ready.' : 'Waiting for host to start the round.');
    } else if (room.winnerUid) {
      setStatus(room.winnerUid === state.user.uid ? 'You won the round. Rematch?' : `${room.winnerName || 'Opponent'} won the round. Rematch?`);
    } else if (room.turnUid === state.user.uid) {
      setStatus(`Your turn. ${state.mode === 'attack' ? 'Attack or switch to transfer.' : 'Move exactly 1 finger between your hands.'}`);
    } else if (side) {
      setStatus(`Waiting for ${getSideName(room, room.turnSide)} to move.`);
    } else {
      setStatus('Room is live.');
    }
  }

  function renderAll() {
    if (els.attackModeBtn) els.attackModeBtn.classList.toggle('is-active', state.mode === 'attack');
    if (els.transferModeBtn) els.transferModeBtn.classList.toggle('is-active', state.mode === 'transfer');
    renderRoomMeta();
    renderArena();
    renderEndgameOverlay();
    updateStatusFromRoom();
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
    if (state.timerInterval) {
      window.clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  async function createRoom() {
    if (!db || !state.user) throw new Error('NO_AUTH');
    const roomId = randomRoomId();
    const displayName = getDisplayName(state.user);
    await roomRef(roomId).set({
      roomId,
      status: 'waiting',
      hostUid: state.user.uid,
      hostName: displayName,
      guestUid: '',
      guestName: '',
      hostLeft: 1,
      hostRight: 1,
      guestLeft: 1,
      guestRight: 1,
      turnUid: state.user.uid,
      turnSide: 'host',
      winnerUid: '',
      winnerName: '',
      winnerSide: '',
      playerScores: { [state.user.uid]: 0 },
      roundNumber: 1,
      scoreRound: 0,
      rematchVotes: {},
      lastAction: 'Room opened. Waiting for a challenger.',
      lastActionType: 'waiting',
      lastActorUid: state.user.uid,
      turnStartedAt: 0,
      turnDeadlineAt: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
        updatedAt: Date.now(),
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
      update.status = guestUid ? (room.winnerUid ? 'finished' : 'ready') : 'waiting';
      update.lastAction = guestUid ? 'Both players are here. Host can start the round.' : (room.lastAction || 'Waiting for a challenger.');
      update.lastActionType = guestUid ? 'ready' : (room.lastActionType || 'waiting');
      tx.set(ref, update, { merge: true });
    });

    await subscribeToRoom(roomId);
  }

  async function subscribeToRoom(roomId) {
    unsubscribeAll();
    state.roomId = roomId;

    state.roomUnsub = roomRef(roomId).onSnapshot((snap) => {
      state.roomData = snap.exists ? snap.data() : null;
      if (!snap.exists) {
        state.roomId = '';
        state.roomData = null;
        showGateMode('join');
        setGateError('Room not found.');
        renderAll();
        return;
      }
      renderAll();
      void maybeTriggerTimeout();
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
      }, () => {
        if (els.chatStatus) els.chatStatus.textContent = 'Could not load chat right now.';
      });

    if (state.timerInterval) window.clearInterval(state.timerInterval);
    state.timerInterval = window.setInterval(() => {
      renderTimer(state.roomData);
      void maybeTriggerTimeout();
    }, 200);

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
      tx.set(ref, {
        ...getRoundResetPatch(room, 1),
        playerScores: {
          [room.hostUid]: Number(room.playerScores?.[room.hostUid] || 0),
          [room.guestUid]: Number(room.playerScores?.[room.guestUid] || 0),
        },
      }, { merge: true });
    });
  }

  function incrementWinnerScore(room, winnerSide) {
    const scores = { ...(room.playerScores || {}) };
    const winnerUid = getSideUid(room, winnerSide);
    if (winnerUid) scores[winnerUid] = Number(scores[winnerUid] || 0) + 1;
    return scores;
  }

  async function performAttack(sourceHand, targetHand) {
    if (!db || !state.user || !state.roomId) return;
    const ref = roomRef(state.roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const side = getCurrentSide(room);
      const opponentSide = getOpponentSide(side);
      if (!side || !opponentSide) throw new Error('NOT_PLAYER');
      if (room.status !== 'active') throw new Error('ROOM_NOT_ACTIVE');
      if (room.winnerUid) throw new Error('ROUND_OVER');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_YOUR_TURN');

      const sourceValue = getHandValue(room, side, sourceHand);
      const targetValue = getHandValue(room, opponentSide, targetHand);
      if (sourceValue <= 0) throw new Error('SOURCE_DEAD');
      if (targetValue <= 0) throw new Error('TARGET_DEAD');

      const nextTarget = sanitizeHandValue(targetValue + sourceValue);
      const patch = {
        updatedAt: Date.now(),
        rematchVotes: {},
        lastActorUid: state.user.uid,
        lastActionType: 'attack',
        lastAction: `${getSideName(room, side)} attacked ${getSideName(room, opponentSide)}'s ${targetHand} hand with ${sourceValue}.`,
      };
      patch[`${opponentSide}${targetHand === 'left' ? 'Left' : 'Right'}`] = nextTarget;

      const simulated = {
        ...room,
        ...patch,
      };
      if (bothHandsDead(simulated, opponentSide)) {
        patch.status = 'finished';
        patch.winnerUid = getSideUid(room, side);
        patch.winnerName = getSideName(room, side);
        patch.winnerSide = side;
        patch.playerScores = incrementWinnerScore(room, side);
        patch.scoreRound = Number(room.roundNumber || 1);
        patch.turnDeadlineAt = 0;
      } else {
        const nextSide = opponentSide;
        patch.turnSide = nextSide;
        patch.turnUid = getSideUid(room, nextSide);
        patch.turnStartedAt = Date.now();
        patch.turnDeadlineAt = Date.now() + MOVE_TIMER_MS;
      }

      tx.set(ref, patch, { merge: true });
    });

    clearSelection();
  }

  async function performTransfer(sourceHand, targetHand) {
    if (!db || !state.user || !state.roomId) return;
    const ref = roomRef(state.roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const side = getCurrentSide(room);
      const opponentSide = getOpponentSide(side);
      if (!side || !opponentSide) throw new Error('NOT_PLAYER');
      if (room.status !== 'active') throw new Error('ROOM_NOT_ACTIVE');
      if (room.winnerUid) throw new Error('ROUND_OVER');
      if (room.turnUid !== state.user.uid) throw new Error('NOT_YOUR_TURN');
      if (!wouldBeValidTransfer(room, sourceHand, targetHand)) throw new Error('INVALID_TRANSFER');

      const sourceValue = getHandValue(room, side, sourceHand);
      const targetValue = getHandValue(room, side, targetHand);
      const patch = {
        updatedAt: Date.now(),
        rematchVotes: {},
        lastActorUid: state.user.uid,
        lastActionType: 'transfer',
        lastAction: `${getSideName(room, side)} moved 1 finger from ${sourceHand} to ${targetHand}.`,
        turnSide: opponentSide,
        turnUid: getSideUid(room, opponentSide),
        turnStartedAt: Date.now(),
        turnDeadlineAt: Date.now() + MOVE_TIMER_MS,
      };
      patch[`${side}${sourceHand === 'left' ? 'Left' : 'Right'}`] = sourceValue - 1;
      patch[`${side}${targetHand === 'left' ? 'Left' : 'Right'}`] = targetValue + 1;
      tx.set(ref, patch, { merge: true });
    });

    clearSelection();
  }

  async function maybeTriggerTimeout() {
    const room = state.roomData;
    if (!db || !state.user || !state.roomId || !room) return;
    if (room.status !== 'active' || room.winnerUid) return;
    const deadline = timestampToMs(room.turnDeadlineAt);
    if (!deadline || Date.now() < deadline) return;
    const currentSide = room.turnSide || 'host';
    const winnerSide = getOpponentSide(currentSide);
    const ref = roomRef(state.roomId);

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
        const liveRoom = snap.data() || {};
        if (liveRoom.status !== 'active' || liveRoom.winnerUid) return;
        const liveDeadline = timestampToMs(liveRoom.turnDeadlineAt);
        if (!liveDeadline || Date.now() < liveDeadline) return;
        const liveCurrentSide = liveRoom.turnSide || 'host';
        const liveWinnerSide = getOpponentSide(liveCurrentSide);
        tx.set(ref, {
          status: 'finished',
          winnerUid: getSideUid(liveRoom, liveWinnerSide),
          winnerName: getSideName(liveRoom, liveWinnerSide),
          winnerSide: liveWinnerSide,
          playerScores: incrementWinnerScore(liveRoom, liveWinnerSide),
          scoreRound: Number(liveRoom.roundNumber || 1),
          rematchVotes: {},
          lastActorUid: getSideUid(liveRoom, liveCurrentSide),
          lastActionType: 'timeout',
          lastAction: `${getSideName(liveRoom, liveCurrentSide)} ran out of time.`,
          turnDeadlineAt: 0,
          updatedAt: Date.now(),
        }, { merge: true });
      });
    } catch {
      // Another client likely handled the timeout.
    }
  }

  async function requestRematch() {
    if (!db || !state.user || !state.roomId || !state.roomData?.winnerUid) return;
    const ref = roomRef(state.roomId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
      const room = snap.data() || {};
      const side = getCurrentSide(room);
      if (!side) throw new Error('NOT_PLAYER');

      const votes = { ...(room.rematchVotes || {}) };
      votes[state.user.uid] = true;
      const bothReady = Boolean(room.hostUid && room.guestUid && votes[room.hostUid] && votes[room.guestUid]);

      if (!bothReady) {
        tx.set(ref, {
          rematchVotes: votes,
          updatedAt: Date.now(),
        }, { merge: true });
        return;
      }

      tx.set(ref, {
        ...getRoundResetPatch(room, Number(room.roundNumber || 1) + 1),
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

  function handleArenaClick(event) {
    const button = event.target.closest('[data-hand][data-side]');
    if (!button || !state.roomData) return;
    const room = state.roomData;
    const side = getCurrentSide(room);
    const opponentSide = getOpponentSide(side);
    const clickedSide = String(button.dataset.side || '');
    const clickedHand = String(button.dataset.hand || '');
    if (!clickedHand || !clickedSide || !isMyTurn(room)) return;

    if (clickedSide === side) {
      if (!state.selectedOwnHand) {
        if (!canUseOwnHand(room, clickedHand)) return;
        state.selectedOwnHand = clickedHand;
        renderAll();
        return;
      }

      if (state.mode === 'transfer' && clickedHand !== state.selectedOwnHand && wouldBeValidTransfer(room, state.selectedOwnHand, clickedHand)) {
        void performTransfer(state.selectedOwnHand, clickedHand).catch((error) => {
          const code = error?.message || 'TRANSFER_FAILED';
          if (code === 'INVALID_TRANSFER') return setStatus('That transfer is not allowed.');
          setStatus('Could not move that finger right now.');
        });
        return;
      }

      if (clickedHand === state.selectedOwnHand) {
        clearSelection();
        return;
      }

      if (canUseOwnHand(room, clickedHand)) {
        state.selectedOwnHand = clickedHand;
        renderAll();
      }
      return;
    }

    if (clickedSide === opponentSide && state.mode === 'attack' && state.selectedOwnHand) {
      void performAttack(state.selectedOwnHand, clickedHand).catch((error) => {
        const code = error?.message || 'ATTACK_FAILED';
        if (code === 'TARGET_DEAD') return setStatus('That opponent hand is already out.');
        if (code === 'NOT_YOUR_TURN') return setStatus('Wait for your turn.');
        setStatus('Could not perform that attack.');
      });
    }
  }

  function bindEvents() {
    els.createFlowBtn?.addEventListener('click', () => {
      setGateError('');
      showGateMode('choice');
      setStatus('Creating room...');
      void createRoom()
        .then(async (roomId) => {
          if (els.roomIdInput) els.roomIdInput.value = roomId;
          await subscribeToRoom(roomId);
          return roomId;
        })
        .then(() => {
          showGateMode('choice');
          setStatus(`Room created. Code: ${state.roomId}. Share it with your opponent.`);
        })
        .catch((error) => {
          state.roomId = '';
          state.roomData = null;
          renderAll();
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
    els.attackModeBtn?.addEventListener('click', () => updateMode('attack'));
    els.transferModeBtn?.addEventListener('click', () => updateMode('transfer'));
    els.clearSelectionBtn?.addEventListener('click', clearSelection);
    els.arena?.addEventListener('click', handleArenaClick);
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

    auth.onAuthStateChanged((user) => {
      state.user = user || null;
      state.selectedOwnHand = '';
      if (!state.user) {
        unsubscribeAll();
        state.roomId = '';
        state.roomData = null;
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
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
