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

	const BOARD_SIZE = 9;
	const STALE_ROOM_MS = 3 * 60 * 1000;
	const WIN_LINES = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8],
		[0, 3, 6], [1, 4, 7], [2, 5, 8],
		[0, 4, 8], [2, 4, 6],
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

	const state = {
		user: null,
		roomId: null,
		roomData: null,
		roomUnsub: null,
		chatUnsub: null,
		ownerLobbyUnsub: null,
		lastChatAt: 0,
		lastMoveAt: 0,
		lastRoomSignature: '',
		adminPanelOpen: false,
		ragequitTimer: null,
		disconnectTimerActive: false,
		ownerLobbyOpen: false,
		roomGateHidden: false,
		selectedOwnerRoomId: '',
		selectedOwnerUserId: '',
		ownerRooms: [],
		spectating: false,
		adminSelectingCell: false,
		adminSelectedCellIndex: -1,
		lastCoinTossKey: '',
		coinTossTimer: null,
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
		adminToggleBtn: document.getElementById('adminToggleBtn'),
		ownerLobbyBtn: document.getElementById('ownerLobbyBtn'),
		ownerLobbyBoardBtn: document.getElementById('ownerLobbyBoardBtn'),
		board: document.getElementById('board'),
		rematchBtn: document.getElementById('rematchBtn'),
		chatPanel: document.getElementById('chatPanel'),
		chatLog: document.getElementById('chatLog'),
		chatInput: document.getElementById('chatInput'),
		sendChatBtn: document.getElementById('sendChatBtn'),
		chatStatus: document.getElementById('chatStatus'),
		adminTools: document.getElementById('adminTools'),
		adminSelectCellBtn: document.getElementById('adminSelectCellBtn'),
		adminSelectedCellDisplay: document.getElementById('adminSelectedCellDisplay'),
		adminOverrideSelect: document.getElementById('adminOverrideSelect'),
		adminApplyOverrideBtn: document.getElementById('adminApplyOverrideBtn'),
		adminStatus: document.getElementById('adminStatus'),
		disconnectTimer: document.getElementById('disconnectTimer'),
		timerValue: document.getElementById('timerValue'),
		endgameOverlay: document.getElementById('endgameOverlay'),
		endgameCard: document.getElementById('endgameCard'),
		endgameLabel: document.getElementById('endgameLabel'),
		endgameName: document.getElementById('endgameName'),
		endgameRematchBtn: document.getElementById('endgameRematchBtn'),
		endgameRematchStatus: document.getElementById('endgameRematchStatus'),
		coinTossOverlay: document.getElementById('coinTossOverlay'),
		coinTossFace: document.getElementById('coinTossFace'),
		coinTossResult: document.getElementById('coinTossResult'),
		ownerLobbyPanel: document.getElementById('ownerLobbyPanel'),
		closeOwnerLobbyBtn: document.getElementById('closeOwnerLobbyBtn'),
		toggleRoomGateBtn: document.getElementById('toggleRoomGateBtn'),
		refreshRoomsBtn: document.getElementById('refreshRoomsBtn'),
		ownerRoomList: document.getElementById('ownerRoomList'),
		selectedRoomTitle: document.getElementById('selectedRoomTitle'),
		selectedRoomMeta: document.getElementById('selectedRoomMeta'),
		selectedRoomPlayers: document.getElementById('selectedRoomPlayers'),
		spectateRoomBtn: document.getElementById('spectateRoomBtn'),
		joinRoomFromLobbyBtn: document.getElementById('joinRoomFromLobbyBtn'),
		selectedUserName: document.getElementById('selectedUserName'),
		ownerActionStatus: document.getElementById('ownerActionStatus'),
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
		return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
	}

	function isOwnerName(name) {
		return normalizeName(name).toLowerCase() === 'owner';
	}

	function getLocalLegacyDisplayName() {
		try {
			const raw = localStorage.getItem('playrCurrentUser');
			const parsed = raw ? JSON.parse(raw) : null;
			return normalizeName(parsed?.displayName || '');
		} catch {
			return '';
		}
	}

	function getDisplayName(user) {
		return normalizeName(user?.displayName || getLocalLegacyDisplayName() || 'Player');
	}

	function isCurrentUserOwner() {
		return isOwnerName(getDisplayName(state.user));
	}

	function getModerationFor(room, uid) {
		return room?.moderation?.[uid] || {};
	}

	function timestampToMs(value) {
		if (!value) return 0;
		if (typeof value === 'number') return value;
		if (typeof value.toDate === 'function') return value.toDate().getTime();
		if (typeof value.seconds === 'number') return value.seconds * 1000;
		return 0;
	}

	function isMuted(room, uid) {
		const moderation = getModerationFor(room, uid);
		return timestampToMs(moderation.mutedUntil) > Date.now();
	}

	function isBanned(room, uid) {
		return Boolean(getModerationFor(room, uid).banned);
	}

	function formatRoomUserName(name, uid) {
		const safe = normalizeName(name || 'Player');
		return uid ? `${safe}` : safe;
	}

	function getRoomPlayerName(room, role) {
		if (!room) return 'Player';
		if (role === 'X') return room.xName || 'X player';
		if (role === 'O') return room.oName || 'O player';
		return 'Player';
	}

	function getRematchVoteCount(room) {
		return Object.values(room?.rematchVotes || {}).filter(Boolean).length;
	}

	function getHostName(room) {
		if (!room) return 'Waiting';
		if (room.hostUid === room.xUid) return room.xName || 'Waiting';
		if (room.hostUid === room.oUid) return room.oName || 'Waiting';
		return room.hostName || room.xName || 'Waiting';
	}

	function getSecondPlayerName(room) {
		if (!room) return 'Waiting';
		if (room.hostUid && room.xUid && room.xUid !== room.hostUid) return room.xName || 'Waiting';
		if (room.hostUid && room.oUid && room.oUid !== room.hostUid) return room.oName || 'Waiting';
		if (room.oUid) return room.oName || 'Waiting';
		return 'Waiting';
	}

	function getPlayerScore(room, uid) {
		if (!room || !uid) return 0;
		const scores = room.playerScores || {};
		return Number(scores[uid] || 0);
	}

	function renderScoreLines(room) {
		if (!els.scoreDisplay) return;
		const hostName = getHostName(room);
		const secondName = getSecondPlayerName(room);
		const hostScore = getPlayerScore(room, room?.hostUid);
		const secondUid = room?.xUid && room.xUid !== room.hostUid ? room.xUid : room?.oUid && room.oUid !== room.hostUid ? room.oUid : '';
		const secondScore = getPlayerScore(room, secondUid);
		const draws = Number(room?.draws || 0);
		els.scoreDisplay.innerHTML = [
			`<span>${escapeHtml(hostName)}: ${hostScore}</span>`,
			`<span>${escapeHtml(secondName)}: ${secondScore}</span>`,
			`<span>Draws: ${draws}</span>`,
		].join('');
	}

	function renderCoinTossOverlay() {
		if (!els.coinTossOverlay) return;
		if (!state.roomData) {
			els.coinTossOverlay.hidden = true;
			return;
		}
		const room = state.roomData;
		const tossMs = timestampToMs(room.coinTossAt);
		const round = Number(room.roundNumber || 1);
		if (!tossMs || room.status !== 'active') {
			els.coinTossOverlay.hidden = true;
			return;
		}

		const key = `${state.roomId || ''}:${round}:${tossMs}`;
		if (state.lastCoinTossKey === key) return;
		state.lastCoinTossKey = key;

		if (els.coinTossFace) {
			els.coinTossFace.textContent = room.turn || 'X';
			els.coinTossFace.classList.remove('spin');
			void els.coinTossFace.offsetWidth;
			els.coinTossFace.classList.add('spin');
		}
		if (els.coinTossResult) {
			const xName = room.xName || 'Player X';
			const oName = room.oName || 'Player O';
			els.coinTossResult.textContent = `${xName} starts as X. ${oName} plays O.`;
		}
		els.coinTossOverlay.hidden = false;

		if (state.coinTossTimer) clearTimeout(state.coinTossTimer);
		state.coinTossTimer = setTimeout(() => {
			if (els.coinTossOverlay) els.coinTossOverlay.hidden = true;
		}, 2200);
	}

	function renderEndgameOverlay() {
		if (!els.endgameOverlay) return;
		const room = state.roomData || {};
		const isGameOver = Boolean(room.winner);
		const isWinRound = Boolean(room.winner && room.winner !== 'draw');
		const winnerRole = room.winner === 'X' || room.winner === 'O' ? room.winner : '';
		const myRole = getUserRole(room);
		const isWinnerScreen = isWinRound ? myRole === winnerRole : false;
		const voteCount = getRematchVoteCount(room);
		const currentUserVoted = Boolean(state.user && room.rematchVotes?.[state.user.uid]);

		document.body.classList.toggle('endgame-open', isGameOver);
		els.endgameOverlay.hidden = !isGameOver;
		if (els.endgameCard) {
			els.endgameCard.classList.toggle('winner-card', isWinRound && isWinnerScreen);
			els.endgameCard.classList.toggle('loser-card', isWinRound && !isWinnerScreen);
			els.endgameCard.classList.toggle('draw-card', room.winner === 'draw');
		}
		if (els.endgameLabel) {
			els.endgameLabel.textContent = room.winner === 'draw' ? 'Draw!' : isWinnerScreen ? 'Winner!' : 'Loser!';
		}
		if (els.endgameName) {
			els.endgameName.textContent = room.winner === 'draw' ? 'Nobody won' : getDisplayName(state.user);
		}
		if (els.endgameRematchBtn) {
			els.endgameRematchBtn.disabled = currentUserVoted;
			els.endgameRematchBtn.textContent = voteCount === 1 ? 'Rematch 1/2' : 'Rematch';
		}
		if (els.endgameRematchStatus) {
			els.endgameRematchStatus.textContent = voteCount === 1 ? 'Rematch 1/2' : 'Rematch';
		}
	}

	function roomRef(roomId) {
		return db.collection('tttRooms').doc(roomId);
	}

	function roomMessagesRef(roomId) {
		return roomRef(roomId).collection('messages');
	}

	function randomRoomId() {
		return `ttt-${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-3)}`;
	}

	function parseRoomId(raw) {
		return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
	}

	function getWinner(board) {
		for (const [a, b, c] of WIN_LINES) {
			const mark = board[a];
			if (mark && mark === board[b] && mark === board[c]) return mark;
		}
		if (board.every((cell) => cell)) return 'draw';
		return '';
	}

	function getUserRole(room) {
		if (!state.user || !room) return '';
		if (room.xUid === state.user.uid) return 'X';
		if (room.oUid === state.user.uid) return 'O';
		return '';
	}

	function sanitizeForFilter(text) {
		const lowered = String(text || '').toLowerCase();
		return lowered
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
		// Toxic/trash talk overrides
		if (lower.includes('trash')) return 'You\'re really good at this!';
		if (lower.includes('suck')) return 'Keep practicing, you\'ll get better!';
		if (lower.includes('noob')) return 'Everyone starts somewhere!';
		// Easy/ez overrides
		if (lower === 'ez' || lower === 'easy') return 'GG! Well played!';
		if (lower.includes('ez')) return 'GG!';
		// Crying/rage overrides
		if (lower.includes('rage') || lower.includes('mad')) return 'It\'s just a game, have fun!';
		// Default: return original
		return text;
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function formatTime(ts) {
		const ms = timestampToMs(ts);
		if (!ms) return '--:--';
		const d = new Date(ms);
		const h = String(d.getHours()).padStart(2, '0');
		const m = String(d.getMinutes()).padStart(2, '0');
		return `${h}:${m}`;
	}

	function startRagequitTimer() {
		if (state.ragequitTimer) clearInterval(state.ragequitTimer);
		state.ragequitTimer = setInterval(() => {
			const room = state.roomData;
			if (!room || room.status !== 'active' || room.winner) {
				clearInterval(state.ragequitTimer);
				state.ragequitTimer = null;
				state.disconnectTimerActive = false;
				if (els.disconnectTimer) els.disconnectTimer.hidden = true;
				return;
			}

			const lastMove = state.lastMoveAt || Date.now();
			const timeSinceMove = Date.now() - lastMove;
			const NO_MOVE_THRESHOLD = 30 * 1000; // 30 seconds
			const DISCONNECT_TIMEOUT = 60 * 1000; // 60 seconds

			if (timeSinceMove > DISCONNECT_TIMEOUT) {
				state.disconnectTimerActive = false;
				if (els.disconnectTimer) els.disconnectTimer.hidden = true;
				setStatus('Opponent disconnected. You can take as long as you need.');
			} else if (timeSinceMove > NO_MOVE_THRESHOLD) {
				if (!state.disconnectTimerActive) {
					state.disconnectTimerActive = true;
				}
				const remainingMs = DISCONNECT_TIMEOUT - timeSinceMove;
				const remainingSec = Math.ceil(remainingMs / 1000);
				if (els.timerValue) els.timerValue.textContent = remainingSec;
				if (els.disconnectTimer) els.disconnectTimer.hidden = false;
			} else {
				state.disconnectTimerActive = false;
				if (els.disconnectTimer) els.disconnectTimer.hidden = true;
			}
		}, 500);
	}

	function stopRagequitTimer() {
		if (state.ragequitTimer) {
			clearInterval(state.ragequitTimer);
			state.ragequitTimer = null;
		}
		state.disconnectTimerActive = false;
		if (els.disconnectTimer) els.disconnectTimer.hidden = true;
	}

	function showGateMode(mode) {
		if (!els.gateChoice || !els.joinFlow) return;
		els.gateChoice.hidden = mode !== 'choice';
		els.joinFlow.hidden = mode !== 'join';
		if (mode !== 'join') setGateError('');
		if (mode !== 'join' && els.roomIdInput) {
			els.roomIdInput.value = '';
		}
	}

	function renderBoard() {
		if (!els.board) return;
		const room = state.roomData;
		const board = Array.isArray(room?.board) ? room.board : new Array(BOARD_SIZE).fill('');
		const role = getUserRole(room);
		document.body.classList.toggle('admin-selecting-cell', Boolean(state.adminPanelOpen && state.adminSelectingCell));
		const canPlay = (index) => {
			if (!room || !role) return false;
			if (state.spectating) return false;
			if (room.status !== 'active') return false;
			if (room.winner) return false;
			if (room.turn !== role) return false;
			return !board[index];
		};

		els.board.innerHTML = board.map((mark, index) => {
			const disabled = canPlay(index) ? '' : 'disabled';
			const selectedAdminCell = state.adminSelectedCellIndex === index ? ' admin-selected' : '';
			const cls = mark ? `cell marked ${mark === 'X' ? 'mark-x' : 'mark-o'}${selectedAdminCell}` : `cell${selectedAdminCell}`;
			return `<button type="button" class="${cls}" data-cell-index="${index}" ${disabled}>${escapeHtml(mark || '')}</button>`;
		}).join('');
	}

	function renderRoomMeta() {
		const room = state.roomData || {};
		const inRoom = Boolean(state.roomId);
		if (els.roomGate) els.roomGate.hidden = inRoom || (isCurrentUserOwner() && (state.roomGateHidden || state.ownerLobbyOpen));
		if (els.boardInfo) els.boardInfo.hidden = !inRoom;
		if (els.chatPanel) els.chatPanel.hidden = !inRoom;

		const showAdmin = Boolean(inRoom && isCurrentUserOwner());
		if (els.adminToggleBtn) {
			els.adminToggleBtn.hidden = !showAdmin;
			els.adminToggleBtn.textContent = state.adminPanelOpen ? 'Hide Admin' : 'Show Admin';
		}
		if (els.ownerLobbyBtn) {
			els.ownerLobbyBtn.hidden = !isCurrentUserOwner();
		}
		if (els.ownerLobbyBoardBtn) {
			els.ownerLobbyBoardBtn.hidden = !isCurrentUserOwner();
		}
		if (els.adminTools) els.adminTools.hidden = !showAdmin || !state.adminPanelOpen;
		renderOwnerLobby();

		if (!inRoom) {
			setStatus('Create or join a room to start.');
			stopRagequitTimer();
			return;
		}

		if (!state.roomData) {
			if (els.myUserLabel) els.myUserLabel.textContent = 'You:';
			if (els.otherUserLabel) els.otherUserLabel.textContent = 'Other Player:';
			if (els.roomCode) els.roomCode.textContent = state.roomId;
			if (els.myUserDisplay) els.myUserDisplay.textContent = getDisplayName(state.user);
			if (els.otherUserDisplay) els.otherUserDisplay.textContent = 'Loading...';
			if (els.turnDisplay) els.turnDisplay.textContent = '--';
			renderScoreLines(null);
			if (els.rematchBtn) els.rematchBtn.disabled = true;
			if (els.startGameBtn) {
				els.startGameBtn.hidden = true;
				els.startGameBtn.disabled = true;
			}
			if (els.copyRoomCodeBtn) els.copyRoomCodeBtn.disabled = !state.roomId;
			if (els.copyInviteBtn) els.copyInviteBtn.disabled = !state.roomId;
			stopRagequitTimer();
			setStatus('Loading room...');
			return;
		}

		const role = getUserRole(room);
		const spectatorView = Boolean(state.spectating || !role);
		const myName = getDisplayName(state.user);
		const otherName = role === 'X' ? (room.oName || 'Waiting...') : role === 'O' ? (room.xName || 'Waiting...') : `${room.xName || 'Waiting'} / ${room.oName || 'Waiting'}`;
		if (els.roomCode) els.roomCode.textContent = state.roomId;
		if (spectatorView) {
			if (els.myUserLabel) els.myUserLabel.textContent = 'Player 1 (Host):';
			if (els.otherUserLabel) els.otherUserLabel.textContent = 'Player 2:';
			if (els.myUserDisplay) els.myUserDisplay.textContent = getHostName(room);
			if (els.otherUserDisplay) els.otherUserDisplay.textContent = getSecondPlayerName(room);
		} else {
			if (els.myUserLabel) els.myUserLabel.textContent = 'You:';
			if (els.otherUserLabel) els.otherUserLabel.textContent = 'Other Player:';
			if (els.myUserDisplay) els.myUserDisplay.textContent = role ? `${myName} (${role})` : myName;
			if (els.otherUserDisplay) els.otherUserDisplay.textContent = otherName;
		}

		if (room.winner === 'draw') {
			if (els.turnDisplay) els.turnDisplay.textContent = 'Draw';
		} else if (room.winner) {
			if (els.turnDisplay) els.turnDisplay.textContent = `${room.winner} won`; 
		} else {
			if (els.turnDisplay) els.turnDisplay.textContent = room.turn || '--';
		}

		renderScoreLines(room);

		if (els.rematchBtn) {
			const showLegacyRematch = Boolean(room.winner === 'draw');
			const voteCount = getRematchVoteCount(room);
			els.rematchBtn.hidden = !showLegacyRematch;
			els.rematchBtn.disabled = !showLegacyRematch || !Boolean(role === 'X' || role === 'O');
			els.rematchBtn.textContent = voteCount === 1 ? 'Rematch 1/2' : 'Rematch';
		}

		if (els.startGameBtn) {
			const canStart = Boolean(
				!state.spectating &&
				room.status === 'ready' &&
				state.user &&
				room.xUid === state.user.uid &&
				room.oUid &&
				!room.winner,
			);
			els.startGameBtn.hidden = !canStart;
			els.startGameBtn.disabled = !canStart;
		}

		if (els.copyRoomCodeBtn) {
			els.copyRoomCodeBtn.disabled = !state.roomId;
		}

		if (!showAdmin) {
			state.adminPanelOpen = false;
		}

		if (room.status === 'active' && !room.winner) {
			const boardSignature = `${room.turn || ''}:${Array.isArray(room.board) ? room.board.join('') : ''}:${room.winner || ''}`;
			if (boardSignature !== state.lastRoomSignature) {
				state.lastRoomSignature = boardSignature;
				state.lastMoveAt = Date.now();
			}
			startRagequitTimer();
		} else {
			state.lastRoomSignature = '';
			stopRagequitTimer();
		}

		renderEndgameOverlay();

		if (room.status === 'waiting') {
			setStatus('Room created. Waiting for second player...');
		} else if (room.status === 'ready') {
			if (spectatorView) {
				setStatus('Spectating room state.');
			} else {
				setStatus(role === 'X' ? 'Player joined. Start the game when ready.' : 'Waiting for host to start the game.');
			}
		} else if (room.winner === 'draw') {
			setStatus('Draw game. Press Rematch to play again.');
		} else if (room.winner) {
			setStatus(`${room.winner} wins. Press Rematch to play again.`);
		} else if (!spectatorView && role && room.turn === role) {
			setStatus(`Your turn (${role}).`);
		} else if (!spectatorView && role) {
			setStatus(`Waiting for ${room.turn}.`);
		} else {
			setStatus('Spectating room state.');
		}
	}

	function renderAdminTools() {
		if (els.adminSelectCellBtn) {
			els.adminSelectCellBtn.textContent = state.adminSelectingCell ? 'Cancel Selection' : 'Select Cell';
		}
		if (els.adminSelectedCellDisplay) {
			els.adminSelectedCellDisplay.textContent = Number.isInteger(state.adminSelectedCellIndex) && state.adminSelectedCellIndex >= 0
				? `Selected: Cell ${state.adminSelectedCellIndex + 1}`
				: 'No cell selected.';
		}
	}

	function renderOwnerLobby() {
		const canShow = Boolean(isCurrentUserOwner());
		if (els.ownerLobbyBtn) {
			document.body.classList.toggle('owner-lobby-open', state.ownerLobbyOpen && canShow);
			els.ownerLobbyBtn.hidden = !canShow;
			els.ownerLobbyBtn.textContent = state.ownerLobbyOpen ? 'Close Lobby' : 'Owner Lobby';
		}
		if (els.ownerLobbyPanel) {
			els.ownerLobbyPanel.hidden = !canShow || !state.ownerLobbyOpen;
		}
		if (els.toggleRoomGateBtn) {
			els.toggleRoomGateBtn.textContent = state.roomGateHidden ? 'Show Room Panel' : 'Hide Room Panel';
		}

		if (!canShow) return;

		if (els.ownerRoomList) {
			const rooms = Array.isArray(state.ownerRooms) ? state.ownerRooms : [];
			els.ownerRoomList.innerHTML = rooms.length ? rooms.map((room) => {
				const selected = room.roomId === state.selectedOwnerRoomId ? ' selected' : '';
				return `
					<button type="button" class="owner-room-card${selected}" data-owner-room-id="${room.roomId}">
						<strong>${escapeHtml(room.roomId)}</strong>
						<p>Status: ${escapeHtml(room.status || 'unknown')}</p>
						<p>Players: ${escapeHtml(room.xName || 'Open')} / ${escapeHtml(room.oName || 'Open')}</p>
						<p>Updated: ${escapeHtml(formatTime(room.updatedAt))}</p>
					</button>
				`;
			}).join('') : '<p class="hint">No current rooms right now.</p>';
		}

		const selectedRoom = (state.ownerRooms || []).find((room) => room.roomId === state.selectedOwnerRoomId) || null;
		if (els.selectedRoomTitle) {
			els.selectedRoomTitle.textContent = selectedRoom ? `Room ${selectedRoom.roomId}` : 'Select a room';
		}
		if (els.selectedRoomMeta) {
			els.selectedRoomMeta.textContent = selectedRoom
				? `Status: ${selectedRoom.status || 'unknown'} | Turn: ${selectedRoom.turn || '--'} | Winner: ${selectedRoom.winner || 'none'}`
				: 'Pick a room to spectate and moderate.';
		}

		if (els.spectateRoomBtn) els.spectateRoomBtn.disabled = !selectedRoom;
		if (els.joinRoomFromLobbyBtn) els.joinRoomFromLobbyBtn.disabled = !selectedRoom;

		if (els.selectedRoomPlayers) {
			if (!selectedRoom) {
				state.selectedOwnerUserId = '';
				els.selectedRoomPlayers.innerHTML = '';
			} else {
				const players = [
					{ uid: selectedRoom.xUid, name: selectedRoom.xName || 'X player', role: 'X' },
					{ uid: selectedRoom.oUid, name: selectedRoom.oName || 'O player', role: 'O' },
				].filter((player) => player.uid);
				els.selectedRoomPlayers.innerHTML = players.length ? players.map((player) => {
					const selected = player.uid === state.selectedOwnerUserId ? ' selected' : '';
					return `<button type="button" class="owner-user-chip${selected}" data-owner-user-id="${player.uid}">${escapeHtml(player.role)}: ${escapeHtml(player.name)}</button>`;
				}).join('') : '<p class="hint">No players yet.</p>';
			}
		}

		if (els.selectedUserName) {
			const selectedUser = selectedRoom && state.selectedOwnerUserId
				? [
					{ uid: selectedRoom.xUid, name: selectedRoom.xName || 'X player' },
					{ uid: selectedRoom.oUid, name: selectedRoom.oName || 'O player' },
				].find((player) => player.uid === state.selectedOwnerUserId)
				: null;
			els.selectedUserName.textContent = selectedUser ? selectedUser.name : 'No user selected.';
		}
	}

	function syncChatPanelHeight() {
		if (!els.board || !els.chatPanel) return;
		if (window.matchMedia('(max-width: 1120px)').matches) {
			els.chatPanel.style.height = '';
			els.chatPanel.style.maxHeight = '';
			return;
		}
		const boardHeight = Math.round(els.board.getBoundingClientRect().height || 0);
		if (!boardHeight) return;
		els.chatPanel.style.height = `${boardHeight}px`;
		els.chatPanel.style.maxHeight = `${boardHeight}px`;
	}

	function cleanupStaleRooms(roomDocIds) {
		if (!db || !Array.isArray(roomDocIds) || roomDocIds.length === 0) return;
		const batch = db.batch();
		roomDocIds.forEach((docId) => {
			batch.delete(db.collection('tttRooms').doc(docId));
		});
		void batch.commit().catch(() => {
			// Cleanup failure is non-blocking for room rendering.
		});
	}

	function selSelectedLobbyUser(uid) {
		state.selectedOwnerUserId = uid || '';
		renderOwnerLobby();
	}

	function refreshOwnerLobbyState() {
		renderOwnerLobby();
	}

	function selectOwnerRoom(roomId) {
		state.selectedOwnerRoomId = roomId || '';
		state.selectedOwnerUserId = '';
		renderOwnerLobby();
	}

	function unsubscribeOwnerLobby() {
		if (typeof state.ownerLobbyUnsub === 'function') {
			state.ownerLobbyUnsub();
			state.ownerLobbyUnsub = null;
		}
	}

	function syncOwnerLobby() {
		unsubscribeOwnerLobby();
		if (!db || !state.user || !isCurrentUserOwner()) {
			state.ownerRooms = [];
			renderOwnerLobby();
			return;
		}

		state.ownerLobbyUnsub = db.collection('tttRooms')
			.orderBy('updatedAt', 'desc')
			.limit(50)
			.onSnapshot((snap) => {
				const rooms = [];
				const staleRoomDocIds = [];
				const now = Date.now();
				snap.forEach((doc) => {
					const room = doc.data() || {};
					const updatedAtMs = timestampToMs(room.updatedAt) || timestampToMs(room.createdAt);
					if (updatedAtMs && (now - updatedAtMs > STALE_ROOM_MS)) {
						staleRoomDocIds.push(doc.id);
						return;
					}
					if (room.status === 'finished') return;
					if (!room.roomId) room.roomId = doc.id;
					rooms.push(room);
				});
				cleanupStaleRooms(staleRoomDocIds);
				rooms.sort((a, b) => timestampToMs(b.updatedAt) - timestampToMs(a.updatedAt));
				state.ownerRooms = rooms;
				if (state.selectedOwnerRoomId && !rooms.some((room) => room.roomId === state.selectedOwnerRoomId)) {
					state.selectedOwnerRoomId = rooms[0]?.roomId || '';
					state.selectedOwnerUserId = '';
				}
				renderOwnerLobby();
			}, (error) => {
				if (els.ownerActionStatus) {
					els.ownerActionStatus.textContent = `Could not load current rooms: ${error?.message || 'unknown error'}.`;
				}
			});
	}

	function renderAll() {
		renderBoard();
		renderRoomMeta();
		renderAdminTools();
		renderOwnerLobby();
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
			clearTimeout(state.coinTossTimer);
			state.coinTossTimer = null;
		}
		state.lastCoinTossKey = '';
		if (els.coinTossOverlay) els.coinTossOverlay.hidden = true;
		stopRagequitTimer();
	}

	async function createRoom() {
		if (!db || !state.user) throw new Error('NO_AUTH');
		const roomId = randomRoomId();
		const displayName = getDisplayName(state.user);
		await roomRef(roomId).set({
			roomId,
			status: 'waiting',
			board: new Array(BOARD_SIZE).fill(''),
			turn: 'X',
			winner: '',
			xUid: state.user.uid,
			xName: displayName,
			oUid: '',
			oName: '',
			hostUid: state.user.uid,
			hostName: displayName,
			playerScores: { [state.user.uid]: 0 },
			xScore: 0,
			oScore: 0,
			draws: 0,
			roundNumber: 1,
			scoreRound: 0,
			rematchVotes: {},
			createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			adminLastOverrideAt: null,
			adminLastOverrideBy: '',
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
			const update = { updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() };
			const hostUid = room.hostUid || room.xUid || '';

			if (!room.xUid) {
				update.xUid = state.user.uid;
				update.xName = displayName;
			} else if (room.xUid === state.user.uid) {
				update.xName = displayName;
			} else if (!room.oUid) {
				update.oUid = state.user.uid;
				update.oName = displayName;
			} else if (room.oUid === state.user.uid) {
				update.oName = displayName;
			} else {
				throw new Error('ROOM_FULL');
			}

			const xUid = update.xUid || room.xUid;
			const oUid = update.oUid || room.oUid;
			const scores = { ...(room.playerScores || {}) };
			if (xUid && typeof scores[xUid] !== 'number') scores[xUid] = 0;
			if (oUid && typeof scores[oUid] !== 'number') scores[oUid] = 0;
			if (hostUid) {
				update.hostUid = hostUid;
				if (hostUid === room.xUid) update.hostName = room.xName || room.hostName || 'Host';
				if (hostUid === room.oUid) update.hostName = room.oName || room.hostName || 'Host';
			}
			update.playerScores = scores;
			update.status = xUid && oUid ? 'ready' : 'waiting';
			tx.set(ref, update, { merge: true });
		});

		state.spectating = false;
		await subscribeToRoom(roomId);
	}

	async function spectateRoom(roomId) {
		if (!db || !state.user) throw new Error('NO_AUTH');
		const parsedRoomId = parseRoomId(roomId);
		if (!parsedRoomId) throw new Error('INVALID_ROOM');
		state.spectating = true;
		await subscribeToRoom(parsedRoomId, { spectate: true });
	}

	async function subscribeToRoom(roomId, options = {}) {
		unsubscribeAll();
		state.roomId = roomId;
		state.spectating = Boolean(options.spectate);

		state.roomUnsub = roomRef(roomId).onSnapshot((snap) => {
			state.roomData = snap.exists ? snap.data() : null;
			if (!snap.exists && state.roomId) {
				setGateError('Room not found.');
				showGateMode('join');
			}
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
					const author = escapeHtml(msg.authorName || 'Player');
					const text = escapeHtml(msg.text || '');
					const time = formatTime(msg.createdAt);
					return `<div class="chat-item"><span class="chat-author">${author}</span><span class="chat-time">${time}</span><p>${text}</p></div>`;
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

	async function playCell(index) {
		if (!db || !state.user || !state.roomId) return;
		if (state.spectating) throw new Error('SPECTATING_ONLY');
		const ref = roomRef(state.roomId);

		await db.runTransaction(async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
			const room = snap.data() || {};
			const board = Array.isArray(room.board) ? [...room.board] : new Array(BOARD_SIZE).fill('');
			const role = room.xUid === state.user.uid ? 'X' : room.oUid === state.user.uid ? 'O' : '';
			const moderation = getModerationFor(room, state.user.uid);

			if (!role) throw new Error('NOT_PLAYER');
			if (moderation.banned) throw new Error('BANNED');
			if (room.status !== 'active') throw new Error('ROOM_NOT_ACTIVE');
			if (room.winner) throw new Error('GAME_OVER');
			if (room.turn !== role) throw new Error('NOT_YOUR_TURN');
			if (board[index]) throw new Error('CELL_TAKEN');

			board[index] = role;
			const winner = getWinner(board);
			const hasTwoPlayers = Boolean(room.xUid && room.oUid);
			const nextTurn = winner ? room.turn : (role === 'X' ? 'O' : 'X');
			const roundNumber = Number(room.roundNumber || 1);
			const scoreRound = Number(room.scoreRound || 0);

			const playerScores = { ...(room.playerScores || {}) };
			if (room.xUid && typeof playerScores[room.xUid] !== 'number') playerScores[room.xUid] = 0;
			if (room.oUid && typeof playerScores[room.oUid] !== 'number') playerScores[room.oUid] = 0;
			let draws = Number(room.draws || 0);
			let nextScoreRound = scoreRound;

			if (winner && scoreRound !== roundNumber) {
				if (winner === 'X' && room.xUid) playerScores[room.xUid] = Number(playerScores[room.xUid] || 0) + 1;
				if (winner === 'O' && room.oUid) playerScores[room.oUid] = Number(playerScores[room.oUid] || 0) + 1;
				if (winner === 'draw') draws += 1;
				nextScoreRound = roundNumber;
			}

			const xScore = room.xUid ? Number(playerScores[room.xUid] || 0) : 0;
			const oScore = room.oUid ? Number(playerScores[room.oUid] || 0) : 0;

			tx.set(ref, {
				board,
				winner,
				turn: nextTurn,
				status: winner ? 'finished' : (hasTwoPlayers ? 'active' : 'waiting'),
				playerScores,
				xScore,
				oScore,
				draws,
				scoreRound: nextScoreRound,
				rematchVotes: {},
				updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			}, { merge: true });
		});

		state.lastMoveAt = Date.now();
		startRagequitTimer();
	}

	async function requestRematch() {
		if (!db || !state.user || !state.roomId || !state.roomData?.winner) return;
		const ref = roomRef(state.roomId);

		await db.runTransaction(async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
			const room = snap.data() || {};
			const role = room.xUid === state.user.uid ? 'X' : room.oUid === state.user.uid ? 'O' : '';
			if (!role) throw new Error('NOT_PLAYER');

			const votes = { ...(room.rematchVotes || {}) };
			votes[state.user.uid] = true;
			const bothPlayersVoted = Boolean(room.xUid && room.oUid && votes[room.xUid] && votes[room.oUid]);

			if (!bothPlayersVoted) {
				tx.set(ref, {
					rematchVotes: votes,
					updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
				}, { merge: true });
				return;
			}

			tx.set(ref, {
				board: new Array(BOARD_SIZE).fill(''),
				winner: '',
				turn: 'X',
				status: room.xUid && room.oUid ? 'ready' : 'waiting',
				rematchVotes: {},
				roundNumber: Number(room.roundNumber || 1) + 1,
				updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			}, { merge: true });
		});
	}

	async function applyOwnerModerationAction(action) {
		if (!db || !state.user || !isCurrentUserOwner()) return;
		if (!state.selectedOwnerRoomId || !state.selectedOwnerUserId) {
			if (els.ownerActionStatus) els.ownerActionStatus.textContent = 'Select a room and a user first.';
			return;
		}

		const roomId = state.selectedOwnerRoomId;
		const userId = state.selectedOwnerUserId;
		const ref = roomRef(roomId);
		const actionLabel = {
			warn: 'warning',
			mute: 'mute',
			unmute: 'unmute',
			ban: 'ban',
			unban: 'unban',
		}[action] || action;

		await db.runTransaction(async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
			const room = snap.data() || {};
			const moderation = { ...(room.moderation || {}) };
			const current = { ...(moderation[userId] || {}) };
			const now = Date.now();

			if (action === 'warn') {
				current.warningCount = Number(current.warningCount || 0) + 1;
				current.lastWarningAt = window.firebase.firestore.FieldValue.serverTimestamp();
			}

			if (action === 'mute') {
				current.mutedUntil = window.firebase.firestore.Timestamp.fromDate(new Date(now + 10 * 60 * 1000));
			}

			if (action === 'unmute') {
				current.mutedUntil = null;
			}

			if (action === 'ban') {
				current.banned = true;
				current.mutedUntil = null;
				if (room.xUid === userId) {
					room.xUid = '';
					room.xName = '';
				}
				if (room.oUid === userId) {
					room.oUid = '';
					room.oName = '';
				}
				room.board = new Array(BOARD_SIZE).fill('');
				room.turn = 'X';
				room.winner = '';
				room.status = room.xUid && room.oUid ? 'ready' : 'waiting';
				room.rematchVotes = {};
			}

			if (action === 'unban') {
				current.banned = false;
			}

			current.lastModerationAction = actionLabel;
			current.lastModerationAt = window.firebase.firestore.FieldValue.serverTimestamp();
			moderation[userId] = current;

			tx.set(ref, {
				moderation,
				xUid: room.xUid,
				xName: room.xName,
				oUid: room.oUid,
				oName: room.oName,
				board: room.board,
				turn: room.turn,
				winner: room.winner,
				status: room.status,
				rematchVotes: room.rematchVotes || {},
				updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			}, { merge: true });
		});

		if (els.ownerActionStatus) {
			els.ownerActionStatus.textContent = `${actionLabel} applied.`;
		}
		renderOwnerLobby();
	}

	async function startGame() {
		if (!db || !state.user || !state.roomId) return;
		const ref = roomRef(state.roomId);

		await db.runTransaction(async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
			const room = snap.data() || {};
			const hostUid = room.hostUid || room.xUid;
			if (hostUid !== state.user.uid) throw new Error('NOT_HOST');

			const hostName = room.hostUid === room.xUid ? (room.xName || room.hostName || 'Host') : room.hostUid === room.oUid ? (room.oName || room.hostName || 'Host') : (room.hostName || room.xName || 'Host');
			const secondUid = room.xUid && room.xUid !== hostUid ? room.xUid : room.oUid && room.oUid !== hostUid ? room.oUid : '';
			const secondName = secondUid === room.xUid ? (room.xName || 'Player 2') : secondUid === room.oUid ? (room.oName || 'Player 2') : 'Player 2';
			if (!secondUid) throw new Error('WAITING_FOR_PLAYER');

			const hostAsX = Math.random() < 0.5;
			const xUid = hostAsX ? hostUid : secondUid;
			const xName = hostAsX ? hostName : secondName;
			const oUid = hostAsX ? secondUid : hostUid;
			const oName = hostAsX ? secondName : hostName;

			const playerScores = { ...(room.playerScores || {}) };
			if (typeof playerScores[hostUid] !== 'number') playerScores[hostUid] = 0;
			if (typeof playerScores[secondUid] !== 'number') playerScores[secondUid] = 0;

			tx.set(ref, {
				hostUid,
				hostName,
				xUid,
				xName,
				oUid,
				oName,
				turn: 'X',
				winner: '',
				board: new Array(BOARD_SIZE).fill(''),
				status: 'active',
				playerScores,
				coinTossAt: window.firebase.firestore.FieldValue.serverTimestamp(),
				updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			}, { merge: true });
		});
		setStatus('Coin toss started. Assigning X and O...');
	}

	async function sendChat() {
		if (!db || !state.user || !state.roomId || !els.chatInput) return;
		let text = String(els.chatInput.value || '').trim();
		if (!text) return;
		const room = state.roomData || {};
		const moderation = getModerationFor(room, state.user.uid);
		if (moderation.banned) {
			if (els.chatStatus) els.chatStatus.textContent = 'You are banned from this room.';
			return;
		}
		if (isMuted(room, state.user.uid)) {
			if (els.chatStatus) els.chatStatus.textContent = 'You are muted right now.';
			return;
		}

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

		// Apply message overrides for toxic words
		text = applyMessageOverride(text);

		state.lastChatAt = now;
		await roomMessagesRef(state.roomId).add({
			authorUid: state.user.uid,
			authorName: getDisplayName(state.user),
			text,
			createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
		});
		els.chatInput.value = '';
		if (els.chatStatus) els.chatStatus.textContent = 'Sent.';
	}

	async function applyAdminOverride() {
		if (!db || !state.user || !state.roomId || !isCurrentUserOwner()) return;
		if (!els.adminOverrideSelect) return;

		const index = Number(state.adminSelectedCellIndex);
		const action = String(els.adminOverrideSelect.value || '');

		if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
			if (els.adminStatus) els.adminStatus.textContent = 'Please select a cell.';
			return;
		}
		if (!action) {
			if (els.adminStatus) els.adminStatus.textContent = 'Please select an action.';
			return;
		}

		const markerMap = { clear: '', x: 'X', o: 'O' };
		const marker = markerMap[action] || '';

		const ref = roomRef(state.roomId);
		await db.runTransaction(async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists) throw new Error('ROOM_NOT_FOUND');
			const room = snap.data() || {};
			const board = Array.isArray(room.board) ? [...room.board] : new Array(BOARD_SIZE).fill('');
			board[index] = marker;
			const winner = getWinner(board);
			const hasTwoPlayers = Boolean(room.xUid && room.oUid);

			tx.set(ref, {
				board,
				winner,
				status: winner ? 'finished' : (hasTwoPlayers ? 'active' : 'waiting'),
				rematchVotes: {},
				adminLastOverrideAt: window.firebase.firestore.FieldValue.serverTimestamp(),
				adminLastOverrideBy: getDisplayName(state.user),
				updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
			}, { merge: true });
		});

		if (els.adminStatus) {
			const actionText = action === 'clear' ? 'cleared' : action === 'x' ? 'set to X' : 'set to O';
			els.adminStatus.textContent = `Cell ${index + 1} ${actionText}.`;
		}
		els.adminOverrideSelect.value = '';
		state.adminSelectedCellIndex = -1;
		state.adminSelectingCell = false;
		renderAll();
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

	function bindEvents() {
		if (els.createFlowBtn) {
			els.createFlowBtn.addEventListener('click', () => {
				setGateError('');
				showGateMode('choice');
				setStatus('Creating room...');

				void createRoom().then((roomId) => joinRoom(roomId)).then(() => {
					showGateMode('choice');
					setStatus(`Room created. Code: ${state.roomId}. Share it with your opponent.`);
				}).catch((error) => {
					setStatus(`Create room failed: ${error?.message || 'unknown error'}.`);
				});
			});
		}

		if (els.joinFlowBtn) {
			els.joinFlowBtn.addEventListener('click', () => {
				setGateError('');
				showGateMode('join');
				window.setTimeout(() => els.roomIdInput?.focus(), 0);
			});
		}

		if (els.backToChoiceBtn) {
			els.backToChoiceBtn.addEventListener('click', () => {
				setGateError('');
				showGateMode('choice');
			});
		}

		if (els.copyRoomCodeBtn) {
			els.copyRoomCodeBtn.addEventListener('click', () => {
				void copyRoomCode();
			});
		}

		if (els.joinRoomBtn) {
			els.joinRoomBtn.addEventListener('click', () => {
				setGateError('');
				void joinRoom(els.roomIdInput?.value || '').then(() => {
					setGateError('');
					showGateMode('choice');
				}).catch((error) => {
					const code = error?.message || 'JOIN_FAILED';
					if (code === 'ROOM_NOT_FOUND') {
						setGateError('Room not found.');
						return;
					}
					if (code === 'ROOM_FULL') {
						setGateError('Room is already full.');
						return;
					}
					if (code === 'INVALID_ROOM') {
						setGateError('Enter a valid room code.');
						return;
					}
					setGateError(`Join failed: ${code}.`);
				});
			});
		}

		if (els.roomIdInput) {
			els.roomIdInput.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					els.joinRoomBtn?.click();
				}
			});
		}

		if (els.startGameBtn) {
			els.startGameBtn.addEventListener('click', () => {
				void startGame().catch((error) => {
					setStatus(`Could not start game: ${error?.message || 'unknown error'}.`);
				});
			});
		}

		if (els.board) {
			els.board.addEventListener('click', (event) => {
				const button = event.target.closest('[data-cell-index]');
				if (!button) return;
				const index = Number(button.dataset.cellIndex);
				if (!Number.isInteger(index)) return;

				if (state.adminPanelOpen && state.adminSelectingCell && isCurrentUserOwner()) {
					state.adminSelectedCellIndex = index;
					state.adminSelectingCell = false;
					if (els.adminStatus) els.adminStatus.textContent = `Selected cell ${index + 1}. Choose an action.`;
					renderAll();
					return;
				}

				void playCell(index).catch((error) => {
					const code = error?.message || 'MOVE_FAILED';
					if (code === 'SPECTATING_ONLY') return setStatus('Spectating only. Use Join Room to play.');
					if (code === 'NOT_YOUR_TURN') return setStatus('Not your turn yet.');
					if (code === 'CELL_TAKEN') return setStatus('That cell is already taken.');
					if (code === 'ROOM_NOT_ACTIVE') return setStatus('Need two players before moves can start.');
					setStatus('Could not place move. Try again.');
				});
			});
		}

		if (els.sendChatBtn) {
			els.sendChatBtn.addEventListener('click', () => {
				void sendChat();
			});
		}

		if (els.chatInput) {
			els.chatInput.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					void sendChat();
				}
			});
		}

		if (els.rematchBtn) {
			els.rematchBtn.addEventListener('click', () => {
				void requestRematch().catch(() => {
					setStatus('Could not request rematch.');
				});
			});
		}

		if (els.endgameRematchBtn) {
			els.endgameRematchBtn.addEventListener('click', () => {
				void requestRematch().catch(() => {
					setStatus('Could not request rematch.');
				});
			});
		}

		if (els.copyInviteBtn) {
			els.copyInviteBtn.addEventListener('click', () => {
				void copyInvite();
			});
		}

		if (els.adminToggleBtn) {
			els.adminToggleBtn.addEventListener('click', () => {
				state.adminPanelOpen = !state.adminPanelOpen;
				if (!state.adminPanelOpen) {
					state.adminSelectingCell = false;
					state.adminSelectedCellIndex = -1;
				}
				renderRoomMeta();
			});
		}

		if (els.adminSelectCellBtn) {
			els.adminSelectCellBtn.addEventListener('click', () => {
				state.adminSelectingCell = !state.adminSelectingCell;
				if (state.adminSelectingCell) {
					if (els.adminStatus) els.adminStatus.textContent = 'Click a board cell to select it.';
				} else if (els.adminStatus) {
					els.adminStatus.textContent = 'Selection cancelled.';
				}
				renderAll();
			});
		}

		if (els.adminApplyOverrideBtn) {
			els.adminApplyOverrideBtn.addEventListener('click', () => {
				void applyAdminOverride().catch(() => {
					if (els.adminStatus) els.adminStatus.textContent = 'Override failed. Check permissions.';
				});
			});
		}

		const toggleOwnerLobby = () => {
			state.ownerLobbyOpen = !state.ownerLobbyOpen;
			renderOwnerLobby();
		};

		if (els.ownerLobbyBtn) {
			els.ownerLobbyBtn.addEventListener('click', toggleOwnerLobby);
		}

		if (els.ownerLobbyBoardBtn) {
			els.ownerLobbyBoardBtn.addEventListener('click', toggleOwnerLobby);
		}

		if (els.closeOwnerLobbyBtn) {
			els.closeOwnerLobbyBtn.addEventListener('click', () => {
				state.ownerLobbyOpen = false;
				renderOwnerLobby();
			});
		}

		if (els.toggleRoomGateBtn) {
			els.toggleRoomGateBtn.addEventListener('click', () => {
				state.roomGateHidden = !state.roomGateHidden;
				renderRoomMeta();
			});
		}

		if (els.refreshRoomsBtn) {
			els.refreshRoomsBtn.addEventListener('click', () => {
				renderOwnerLobby();
			});
		}

		if (els.ownerLobbyPanel) {
			els.ownerLobbyPanel.addEventListener('click', (event) => {
				const roomButton = event.target.closest('[data-owner-room-id]');
				if (roomButton) {
					selectOwnerRoom(roomButton.dataset.ownerRoomId || '');
					return;
				}

				const userButton = event.target.closest('[data-owner-user-id]');
				if (userButton) {
					selSelectedLobbyUser(userButton.dataset.ownerUserId || '');
					return;
				}

				const actionButton = event.target.closest('[data-owner-action]');
				if (actionButton) {
					void applyOwnerModerationAction(actionButton.dataset.ownerAction || '').catch(() => {
						if (els.ownerActionStatus) els.ownerActionStatus.textContent = 'Moderation action failed.';
					});
				}
			});
		}

		if (els.spectateRoomBtn) {
			els.spectateRoomBtn.addEventListener('click', () => {
				if (!state.selectedOwnerRoomId) return;
				void spectateRoom(state.selectedOwnerRoomId).catch((error) => {
					if (els.ownerActionStatus) els.ownerActionStatus.textContent = `Could not spectate: ${error?.message || 'unknown error'}.`;
				});
			});
		}

		if (els.joinRoomFromLobbyBtn) {
			els.joinRoomFromLobbyBtn.addEventListener('click', () => {
				if (!state.selectedOwnerRoomId) return;
				void joinRoom(state.selectedOwnerRoomId).catch((error) => {
					if (els.ownerActionStatus) els.ownerActionStatus.textContent = `Could not join: ${error?.message || 'unknown error'}.`;
				});
			});
		}
	}

	function start() {
		if (!app || !auth || !db) {
			setStatus('Firebase is not available for this page.');
			return;
		}

		bindEvents();
		window.addEventListener('resize', syncChatPanelHeight);
		renderAll();
		showGateMode('choice');

		auth.onAuthStateChanged((user) => {
			state.user = user || null;
			if (!state.user) {
				setStatus('Log in on the hub first to play 2-player games.');
				state.ownerLobbyOpen = false;
				syncOwnerLobby();
				renderAll();
				return;
			}

			const roomFromUrl = parseRoomId(new URL(window.location.href).searchParams.get('room'));
			if (roomFromUrl) {
				if (els.roomIdInput) els.roomIdInput.value = roomFromUrl;
				void joinRoom(roomFromUrl).then(() => {
					setGateError('');
					showGateMode('choice');
				}).catch((error) => {
					showGateMode('join');
					setGateError(error?.message === 'ROOM_NOT_FOUND' ? 'Room not found.' : `Could not join shared room: ${error?.message || 'unknown error'}.`);
				});
			} else {
				setStatus('Create a room or join with a code.');
			}

			syncOwnerLobby();

			renderAll();
		});
	}

	start();
})();
