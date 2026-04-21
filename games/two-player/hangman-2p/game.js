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
	const firestoreFieldValue = window.firebase?.firestore?.FieldValue || null;

	const ROOM_COLLECTION = 'hangmanRooms';
	const MAX_PLAYERS = 5;
	const MAX_LIVES = 9;
	const ROOM_CODE_LENGTH = 6;

	const WORD_BANK = {
		sports: ['basketball', 'baseball', 'football', 'volleyball', 'badminton', 'archery', 'swimming', 'tennis', 'hockey', 'skateboarding', 'gymnastics', 'cricket'],
		household: ['toaster', 'blanket', 'armchair', 'doormat', 'television', 'dishwasher', 'laundry', 'cupboard', 'pillow', 'lamp', 'curtain', 'headphones'],
		animals: ['elephant', 'penguin', 'giraffe', 'dolphin', 'hamster', 'crocodile', 'butterfly', 'turtle', 'kangaroo', 'octopus', 'raccoon', 'meerkat'],
		food: ['sandwich', 'hamburger', 'spaghetti', 'pancake', 'avocado', 'blueberry', 'watermelon', 'cucumber', 'broccoli', 'popcorn', 'cupcake', 'meatball'],
		school: ['notebook', 'backpack', 'blackboard', 'textbook', 'calculator', 'pencil', 'eraser', 'homework', 'clipboard', 'stationery', 'scissors', 'ruler'],
		nature: ['sunflower', 'raindrop', 'mountain', 'forest', 'riverbank', 'starlight', 'waterfall', 'meadow', 'desert', 'rainbow', 'landscape', 'seashell'],
		technology: ['keyboard', 'laptop', 'smartphone', 'software', 'database', 'algorithm', 'browser', 'microchip', 'network', 'download', 'wireless', 'touchscreen'],
		vehicles: ['airplane', 'motorcycle', 'bicycle', 'submarine', 'ambulance', 'helicopter', 'scooter', 'tractor', 'spaceship', 'train', 'minivan', 'sailboat'],
		music: ['guitar', 'piano', 'trumpet', 'drummer', 'melody', 'orchestra', 'headphones', 'saxophone', 'harmonica', 'playlist', 'karaoke', 'rhythm'],
		occupations: ['teacher', 'doctor', 'firefighter', 'carpenter', 'librarian', 'engineer', 'scientist', 'plumber', 'pilot', 'chef', 'nurse', 'veterinarian'],
		science: ['gravity', 'molecule', 'planet', 'oxygen', 'telescope', 'galaxy', 'physics', 'laboratory', 'nucleus', 'photosynthesis', 'experiment', 'voltage'],
		kitchen: ['spatula', 'saucepan', 'cuttingboard', 'microwave', 'refrigerator', 'measuringcup', 'colander', 'ovenmitt', 'blender', 'kettle', 'whisk', 'dishcloth'],
		clothing: ['sweater', 'raincoat', 'sneakers', 'jacket', 'backpack', 'scarf', 'necklace', 'trousers', 'mittens', 'pajamas', 'sunglasses', 'bracelet'],
		travel: ['passport', 'airport', 'luggage', 'landmark', 'tourist', 'roadtrip', 'mapleleaf', 'camping', 'crosswalk', 'sidewalk', 'hotelroom', 'guidebook'],
		space: ['asteroid', 'comet', 'satellite', 'spacesuit', 'moonbase', 'constellation', 'stardust', 'orbit', 'nebula', 'galaxy', 'rocketship', 'meteorite'],
		games: ['puzzle', 'arcade', 'checkmate', 'controller', 'highscore', 'cardgame', 'strategy', 'tournament', 'joystick', 'scoreboard', 'multiplayer', 'levelup'],
		weather: ['thunder', 'lightning', 'hailstorm', 'snowflake', 'blizzard', 'umbrella', 'barometer', 'forecast', 'windstorm', 'raincoat', 'sunshine', 'drizzle'],
	};

	const CATEGORY_ORDER = Object.keys(WORD_BANK);
	const CATEGORY_LABELS = {
		sports: 'Sports',
		household: 'Household Items',
		animals: 'Animals',
		food: 'Food',
		school: 'School Supplies',
		nature: 'Nature',
		technology: 'Technology',
		vehicles: 'Vehicles',
		music: 'Music',
		occupations: 'Jobs',
		science: 'Science',
		kitchen: 'Kitchen',
		clothing: 'Clothing',
		travel: 'Travel',
		space: 'Space',
		games: 'Games',
		weather: 'Weather',
	};

	const state = {
		user: null,
		roomId: '',
		roomData: null,
		roomUnsub: null,
		joinFlowOpen: false,
		keyboardBuilt: false,
		busy: false,
	};

	function serverTimestamp() {
		return firestoreFieldValue?.serverTimestamp ? firestoreFieldValue.serverTimestamp() : Date.now();
	}

	const els = {
		status: document.getElementById('gameStatus'),
		gatePanel: document.getElementById('gatePanel'),
		createRoomBtn: document.getElementById('createRoomBtn'),
		joinFlowBtn: document.getElementById('joinFlowBtn'),
		joinFlow: document.getElementById('joinFlow'),
		joinRoomInput: document.getElementById('joinRoomInput'),
		joinRoomBtn: document.getElementById('joinRoomBtn'),
		backToLobbyBtn: document.getElementById('backToLobbyBtn'),
		roomGateError: document.getElementById('roomGateError'),
		roomInfoPanel: document.getElementById('roomInfoPanel'),
		roomCodeLabel: document.getElementById('roomCodeLabel'),
		leaveRoomBtn: document.getElementById('leaveRoomBtn'),
		playerCountLabel: document.getElementById('playerCountLabel'),
		hostLabel: document.getElementById('hostLabel'),
		roundLabel: document.getElementById('roundLabel'),
		categorySelect: document.getElementById('categorySelect'),
		startRoundBtn: document.getElementById('startRoundBtn'),
		copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
		copyInviteBtn: document.getElementById('copyInviteBtn'),
		roomHint: document.getElementById('roomHint'),
		playerList: document.getElementById('playerList'),
		categoryLabel: document.getElementById('categoryLabel'),
		lifeLabel: document.getElementById('lifeLabel'),
		wrongCountLabel: document.getElementById('wrongCountLabel'),
		lifeDots: document.getElementById('lifeDots'),
		wordDisplay: document.getElementById('wordDisplay'),
		guessInput: document.getElementById('guessInput'),
		guessBtn: document.getElementById('guessBtn'),
		guessedLetters: document.getElementById('guessedLetters'),
		wrongLetters: document.getElementById('wrongLetters'),
		letterKeyboard: document.getElementById('letterKeyboard'),
		roundMessage: document.getElementById('roundMessage'),
	};

	function getLocalUser() {
		try {
			const raw = localStorage.getItem('playrCurrentUser');
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed) return null;
			return {
				uid: String(parsed.uid || parsed.email || parsed.displayName || 'guest'),
				displayName: normalizeName(parsed.displayName || parsed.name || 'Player'),
			};
		} catch {
			return null;
		}
	}

	function normalizeName(value) {
		return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 24) || 'Player';
	}

	function normalizeRoomCode(value) {
		return String(value || '').trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 24);
	}

	function normalizeGuess(value) {
		return String(value || '').trim().toUpperCase().replace(/[^A-Z'-\s]/g, '').replace(/\s+/g, ' ');
	}

	function normalizeWord(value) {
		return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9'\-\s]/g, '').replace(/\s+/g, ' ');
	}

	function isOwnerAccount(user = state.user) {
		return normalizeName(user?.displayName || '').toLowerCase() === 'owner';
	}

	function getFirebase() {
		if (!app || !auth || !db) return null;
		return { app, auth, db };
	}

	async function ensureUser() {
		const localUser = getLocalUser();
		if (auth?.currentUser) {
			return {
				uid: String(auth.currentUser.uid || localUser?.uid || 'guest'),
				displayName: normalizeName(auth.currentUser.displayName || localUser?.displayName || 'Player'),
			};
		}

		if (localUser) {
			return localUser;
		}

		if (!auth?.signInAnonymously) {
			return { uid: 'guest', displayName: 'Player' };
		}

		try {
			const credential = await auth.signInAnonymously();
			const user = credential?.user || auth.currentUser;
			return {
				uid: String(user?.uid || 'guest'),
				displayName: normalizeName(user?.displayName || 'Player'),
			};
		} catch {
			return { uid: 'guest', displayName: 'Player' };
		}
	}

	function roomRef(roomId) {
		return db.collection(ROOM_COLLECTION).doc(roomId);
	}

	function participantsList(room) {
		return Object.entries(room?.participants || {})
			.map(([uid, participant]) => ({ uid, ...(participant || {}) }))
			.sort((a, b) => Number(a.joinedAt || 0) - Number(b.joinedAt || 0));
	}

	function isHost(room, uid = state.user?.uid) {
		return Boolean(room && uid && room.hostUid === uid);
	}

	function canJoinRoom(room) {
		const count = participantsList(room).length;
		return count < MAX_PLAYERS || isOwnerAccount();
	}

	function selectedCategoryKey(room) {
		const value = normalizeName(els.categorySelect?.value || room?.category || CATEGORY_ORDER[0]).toLowerCase();
		return CATEGORY_ORDER.includes(value) ? value : CATEGORY_ORDER[0];
	}

	function buildRoomCode() {
		const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let code = '';
		for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
			code += pool[Math.floor(Math.random() * pool.length)];
		}
		return code;
	}

	function pickWord(category) {
		const words = WORD_BANK[category] || WORD_BANK[CATEGORY_ORDER[0]];
		return normalizeWord(words[Math.floor(Math.random() * words.length)] || 'mystery');
	}

	function isLetter(char) {
		return /^[A-Z]$/.test(char);
	}

	function isWordSolved(room) {
		const secretWord = normalizeWord(room?.secretWord || '');
		if (!secretWord) return false;
		const guessed = new Set((room?.guessedLetters || []).map((letter) => normalizeWord(letter).slice(0, 32)));
		for (const char of secretWord) {
			if (isLetter(char) && !guessed.has(char)) return false;
		}
		return true;
	}

	function getRevealedWord(room) {
		const secretWord = normalizeWord(room?.secretWord || '');
		const guessed = new Set((room?.guessedLetters || []).map((letter) => normalizeWord(letter)));
		return secretWord.split('').map((char) => {
			if (!isLetter(char)) return char;
			return guessed.has(char) ? char : '•';
		}).join(' ');
	}

	function setStatus(message) {
		if (els.status) {
			els.status.textContent = message || '';
		}
	}

	function setRoomGateError(message) {
		if (!els.roomGateError) return;
		const text = String(message || '').trim();
		els.roomGateError.hidden = !text;
		els.roomGateError.textContent = text;
	}

	function setJoinFlow(open) {
		state.joinFlowOpen = Boolean(open);
		if (els.joinFlow) els.joinFlow.hidden = !state.joinFlowOpen;
		setRoomGateError('');
		if (state.joinFlowOpen && els.joinRoomInput) {
			els.joinRoomInput.focus();
			els.joinRoomInput.select();
		}
	}

	function setRoomPanelVisible(visible) {
		if (els.gatePanel) els.gatePanel.hidden = Boolean(visible);
		if (els.roomInfoPanel) els.roomInfoPanel.hidden = !visible;
	}

	function setQueryRoom(roomId) {
		const url = new URL(window.location.href);
		if (roomId) {
			url.searchParams.set('room', roomId);
		} else {
			url.searchParams.delete('room');
		}
		window.history.replaceState({}, '', url.toString());
	}

	function inviteUrl(roomId) {
		const url = new URL(window.location.href);
		url.searchParams.set('room', roomId);
		return url.toString();
	}

	async function copyText(text, successMessage) {
		try {
			await navigator.clipboard.writeText(String(text || ''));
			setStatus(successMessage || 'Copied.');
		} catch {
			setStatus('Copy failed.');
		}
	}

	function categoryLabel(category) {
		return CATEGORY_LABELS[category] || normalizeName(category || 'Mystery');
	}

	function buildKeyboard() {
		if (!els.letterKeyboard || state.keyboardBuilt) return;
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		els.letterKeyboard.innerHTML = letters.map((letter) => `<button class="letter-key" type="button" data-letter="${letter}">${letter}</button>`).join('');
		state.keyboardBuilt = true;
	}

	function renderKeyboard(room) {
		if (!els.letterKeyboard) return;
		const guessed = new Set((room?.guessedLetters || []).map((letter) => normalizeWord(letter)));
		const wrong = new Set((room?.wrongLetters || []).map((letter) => normalizeWord(letter)));
		els.letterKeyboard.querySelectorAll('.letter-key').forEach((button) => {
			const letter = String(button.dataset.letter || '').toUpperCase();
			const disabled = !room || room.stage !== 'playing' || guessed.has(letter) || wrong.has(letter);
			button.disabled = disabled;
			button.classList.toggle('is-hit', guessed.has(letter));
			button.classList.toggle('is-miss', wrong.has(letter));
		});
	}

	function renderLifeDots(room) {
		if (!els.lifeDots) return;
		const wrongCount = Number(room?.wrongLetters?.length || 0);
		if (!els.lifeDots.children.length) {
			els.lifeDots.innerHTML = Array.from({ length: MAX_LIVES }, (_, index) => `<span class="life-dot" data-dot="${index}"></span>`).join('');
		}
		els.lifeDots.querySelectorAll('.life-dot').forEach((dot, index) => {
			dot.classList.toggle('is-lost', index < wrongCount);
		});
	}

	function renderWord(room) {
		if (!els.wordDisplay) return;
		const secretWord = normalizeWord(room?.secretWord || '');
		const guessed = new Set((room?.guessedLetters || []).map((letter) => normalizeWord(letter)));
		els.wordDisplay.innerHTML = secretWord
			.split('')
			.map((char) => {
				if (char === ' ') return '<span class="word-cell is-fixed">&nbsp;</span>';
				if (!isLetter(char)) return `<span class="word-cell is-fixed">${char}</span>`;
				return guessed.has(char)
					? `<span class="word-cell is-revealed">${char}</span>`
					: '<span class="word-cell is-hidden">_</span>';
			})
			.join('');
	}

	function renderChipList(target, values, emptyLabel) {
		if (!target) return;
		const items = Array.isArray(values) ? values.filter(Boolean) : [];
		if (!items.length) {
			target.innerHTML = `<span class="chip">${emptyLabel}</span>`;
			return;
		}
		target.innerHTML = items.map((value) => `<span class="chip">${escapeHtml(String(value).toUpperCase())}</span>`).join('');
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function renderPlayers(room) {
		if (!els.playerList) return;
		const players = participantsList(room);
		if (!players.length) {
			els.playerList.innerHTML = '<div class="player-item"><span class="player-pill">0</span><div><strong>No players yet</strong><span class="player-item-sub">Invite others to join</span></div><span class="player-item-sub">--</span></div>';
			return;
		}

		els.playerList.innerHTML = players.map((player, index) => {
			const isHostPlayer = room?.hostUid === player.uid;
			const isSelf = state.user?.uid === player.uid;
			const badge = isHostPlayer ? 'Host' : `P${index + 1}`;
			const flags = [isHostPlayer ? 'Owner' : '', isSelf ? 'You' : ''].filter(Boolean).join(' · ');
			return `
				<div class="player-item ${isHostPlayer ? 'is-host' : ''} ${isSelf ? 'is-self' : ''}">
					<span class="player-pill">${badge}</span>
					<div>
						<strong>${escapeHtml(normalizeName(player.name || 'Player'))}</strong>
						<span class="player-item-sub">${escapeHtml(flags || 'Ready')}</span>
					</div>
					<span class="player-item-sub">${player.joinedAt ? 'Joined' : ''}</span>
				</div>
			`;
		}).join('');
	}

	function renderCategorySelect(room) {
		if (!els.categorySelect) return;
		if (!els.categorySelect.options.length) {
			els.categorySelect.innerHTML = CATEGORY_ORDER.map((category) => `<option value="${category}">${escapeHtml(categoryLabel(category))}</option>`).join('');
		}
		const category = selectedCategoryKey(room);
		if (els.categorySelect.value !== category) {
			els.categorySelect.value = category;
		}
		els.categorySelect.disabled = !room || !isHost(room) || room.stage === 'playing';
	}

	function renderRoomState(room) {
		const players = participantsList(room);
		const hostName = normalizeName(room?.hostName || 'Player');
		const category = selectedCategoryKey(room);
		const inRoom = Boolean(room);
		const livesLeft = Math.max(0, MAX_LIVES - Number(room?.wrongLetters?.length || 0));
		const roundNumber = Number(room?.roundNumber || 1);

		setRoomPanelVisible(inRoom);
		if (els.roomCodeLabel) els.roomCodeLabel.textContent = room?.roomCode || state.roomId || '------';
		if (els.playerCountLabel) {
			const extra = isOwnerAccount() && players.length > MAX_PLAYERS ? ' + owner' : '';
			els.playerCountLabel.textContent = `${players.length}/${room?.maxPlayers || MAX_PLAYERS}${extra}`;
		}
		if (els.hostLabel) els.hostLabel.textContent = hostName;
		if (els.roundLabel) els.roundLabel.textContent = String(roundNumber);
		if (els.categoryLabel) els.categoryLabel.textContent = room?.stage === 'playing' || room?.stage === 'won' || room?.stage === 'lost' ? categoryLabel(category) : 'Waiting for round start';
		if (els.lifeLabel) els.lifeLabel.textContent = `${livesLeft} lives left`;
		if (els.wrongCountLabel) els.wrongCountLabel.textContent = `${Number(room?.wrongLetters?.length || 0)} wrong guesses`;
		if (els.roomHint) {
			if (!room) {
				els.roomHint.textContent = 'Create a room or join with a room code.';
			} else if (room.stage === 'lobby') {
				els.roomHint.textContent = isHost(room)
					? 'Choose a topic, then start the round.'
					: 'Waiting for the host to start the round.';
			} else if (room.stage === 'playing') {
				els.roomHint.textContent = 'Guess letters together. Every wrong guess removes one life.';
			} else if (room.stage === 'won') {
				els.roomHint.textContent = `Solved in round ${roundNumber}. Start a new round when ready.`;
			} else if (room.stage === 'lost') {
				els.roomHint.textContent = `The word was ${normalizeWord(room.secretWord || '')}. Start a new round when ready.`;
			}
		}

		if (els.startRoundBtn) {
			const canStart = Boolean(room) && isHost(room) && room.stage !== 'playing';
			els.startRoundBtn.disabled = !canStart;
			els.startRoundBtn.textContent = room?.stage === 'playing' ? 'Round in Progress' : room?.stage === 'lobby' ? 'Start Round' : 'Next Word';
		}

		if (els.copyRoomCodeBtn) els.copyRoomCodeBtn.disabled = !room;
		if (els.copyInviteBtn) els.copyInviteBtn.disabled = !room;
		if (els.leaveRoomBtn) els.leaveRoomBtn.disabled = !room;
		if (els.guessInput) els.guessInput.disabled = !room || room.stage !== 'playing';
		if (els.guessBtn) els.guessBtn.disabled = !room || room.stage !== 'playing';

		renderCategorySelect(room);
		renderPlayers(room);
		renderWord(room);
		renderChipList(els.guessedLetters, room?.guessedLetters || [], 'None yet');
		renderChipList(els.wrongLetters, room?.wrongLetters || [], 'No misses');
		renderKeyboard(room);
		renderLifeDots(room);

		if (els.roundMessage) {
			if (!room) {
				els.roundMessage.textContent = 'Create or join a room to begin.';
			} else if (room.stage === 'lobby') {
				els.roundMessage.textContent = isHost(room) ? 'Pick a topic and start the round.' : 'Waiting for the host.';
			} else if (room.stage === 'playing') {
				els.roundMessage.textContent = 'Use the keyboard below or type a letter and press Guess.';
			} else if (room.stage === 'won') {
				els.roundMessage.textContent = `Solved! The word was ${normalizeWord(room.secretWord || '')}.`;
			} else if (room.stage === 'lost') {
				els.roundMessage.textContent = `Out of lives. The word was ${normalizeWord(room.secretWord || '')}.`;
			}
		}

		if (els.guessInput && room?.stage === 'playing' && document.activeElement !== els.guessInput) {
			els.guessInput.value = '';
		}
	}

	function syncFromRoom(roomSnapshot) {
		state.roomData = roomSnapshot;
		if (!roomSnapshot) {
			state.roomId = '';
			setQueryRoom('');
			sessionStorage.removeItem('playrHangmanRoom');
			setRoomPanelVisible(false);
			setStatus('Create a room or join with a code.');
			if (els.categoryLabel) els.categoryLabel.textContent = 'Waiting for a room';
			if (els.lifeLabel) els.lifeLabel.textContent = '9 lives left';
			if (els.wrongCountLabel) els.wrongCountLabel.textContent = '0 wrong guesses';
			renderRoomState(null);
			return;
		}

		state.roomId = roomSnapshot.roomCode || roomSnapshot.id || state.roomId;
		setQueryRoom(state.roomId);
		setStatus(`Room ${state.roomId} ready.`);
		renderRoomState(roomSnapshot);
	}

	function subscribeRoom(roomId) {
		if (typeof state.roomUnsub === 'function') {
			state.roomUnsub();
			state.roomUnsub = null;
		}
		if (!roomId) {
			syncFromRoom(null);
			return;
		}

		state.roomUnsub = roomRef(roomId).onSnapshot((snapshot) => {
			if (!snapshot.exists) {
				syncFromRoom(null);
				return;
			}
			const data = snapshot.data() || {};
			data.id = snapshot.id;
			data.roomCode = data.roomCode || snapshot.id;
			if (!data.maxPlayers) data.maxPlayers = MAX_PLAYERS;
			if (!data.roundNumber) data.roundNumber = 1;
			syncFromRoom(data);
		});
	}

	async function runRoomTransaction(roomId, mutator) {
		const firebase = getFirebase();
		if (!firebase?.db) throw new Error('Firebase is not ready.');
		const ref = roomRef(roomId);
		return firebase.db.runTransaction(async (transaction) => {
			const snapshot = await transaction.get(ref);
			if (!snapshot.exists) {
				throw new Error('Room not found.');
			}
			const room = snapshot.data() || {};
			room.id = snapshot.id;
			const update = await mutator(room, transaction, ref);
			if (update && Object.keys(update).length) {
				transaction.update(ref, update);
			}
			return update || null;
		});
	}

	async function createRoom() {
		if (state.busy) return;
		state.busy = true;
		try {
			const firebase = getFirebase();
			if (!firebase?.db) throw new Error('Firebase is unavailable.');
			const user = state.user || await ensureUser();
			state.user = user;

			for (let attempt = 0; attempt < 6; attempt += 1) {
				const roomId = buildRoomCode();
				const ref = roomRef(roomId);
				const snapshot = await ref.get();
				if (snapshot.exists) continue;

				const category = CATEGORY_ORDER[Math.floor(Math.random() * CATEGORY_ORDER.length)];
				await ref.set({
					roomCode: roomId,
					hostUid: user.uid,
					hostName: normalizeName(user.displayName || 'Player'),
					maxPlayers: MAX_PLAYERS,
					category,
					stage: 'lobby',
					roundNumber: 1,
					participants: {
						[user.uid]: {
							name: normalizeName(user.displayName || 'Player'),
							joinedAt: Date.now(),
							isHost: true,
						},
					},
					guessedLetters: [],
					wrongLetters: [],
					secretWord: '',
					remainingLives: MAX_LIVES,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});
				subscribeRoom(roomId);
			sessionStorage.setItem('playrHangmanRoom', roomId);
				setJoinFlow(false);
				setStatus(`Room ${roomId} created.`);
				return;
			}
			throw new Error('Could not create a unique room code.');
		} catch (error) {
			setRoomGateError(error?.message || 'Could not create room.');
		} finally {
			state.busy = false;
		}
	}

	async function joinRoom() {
		if (state.busy) return;
		state.busy = true;
		try {
			const firebase = getFirebase();
			if (!firebase?.db) throw new Error('Firebase is unavailable.');
			const user = state.user || await ensureUser();
			state.user = user;
			const roomId = normalizeRoomCode(els.joinRoomInput?.value || '');
			if (!roomId) throw new Error('Enter a room code.');

			await runRoomTransaction(roomId, (room) => {
				if (!room) throw new Error('Room not found.');
				if (!canJoinRoom(room) && !room.participants?.[user.uid]) {
					throw new Error('This room is full.');
				}

				const participants = { ...(room.participants || {}) };
				participants[user.uid] = {
					name: normalizeName(user.displayName || 'Player'),
					joinedAt: participants[user.uid]?.joinedAt || Date.now(),
					isHost: room.hostUid === user.uid,
				};

				return {
					participants,
					hostUid: room.hostUid || user.uid,
					hostName: normalizeName(room.hostName || user.displayName || 'Player'),
					updatedAt: serverTimestamp(),
				};
			});

			subscribeRoom(roomId);
			sessionStorage.setItem('playrHangmanRoom', roomId);
			setJoinFlow(false);
			setStatus(`Joined room ${roomId}.`);
		} catch (error) {
			setRoomGateError(error?.message || 'Could not join room.');
		} finally {
			state.busy = false;
		}
	}

	async function leaveRoom() {
		const roomId = state.roomId;
		if (!roomId || state.busy) return;
		state.busy = true;
		try {
			await runRoomTransaction(roomId, (room, transaction, ref) => {
				const participants = { ...(room.participants || {}) };
				delete participants[state.user?.uid];
				const remaining = Object.entries(participants).map(([uid, participant]) => ({ uid, ...(participant || {}) }));

				if (!remaining.length) {
					transaction.delete(ref);
					return {};
				}

				let nextHost = room.hostUid;
				if (!participants[nextHost]) {
					nextHost = remaining[0].uid;
				}

				const nextParticipants = { ...participants };
				remaining.forEach((participant) => {
					nextParticipants[participant.uid] = {
						...nextParticipants[participant.uid],
						isHost: participant.uid === nextHost,
					};
				});

				return {
					participants: nextParticipants,
					hostUid: nextHost,
					hostName: normalizeName(nextParticipants[nextHost]?.name || 'Player'),
					updatedAt: serverTimestamp(),
				};
			});
			sessionStorage.removeItem('playrHangmanRoom');
		} catch (error) {
			setStatus(error?.message || 'Could not leave room cleanly.');
		} finally {
			subscribeRoom('');
			state.roomData = null;
			state.roomId = '';
			setQueryRoom('');
			setRoomPanelVisible(false);
			setStatus('Create a room or join with a code.');
			state.busy = false;
		}
	}

	async function startRound() {
		const roomId = state.roomId;
		if (!roomId || !isHost(state.roomData) || state.busy) return;
		state.busy = true;
		try {
			await runRoomTransaction(roomId, (room) => {
				if (!isHost(room)) throw new Error('Only the host can start a round.');
				const category = selectedCategoryKey(room);
				return {
					category,
					stage: 'playing',
					roundNumber: Number(room.roundNumber || 0) + (room.stage === 'playing' ? 0 : 1),
					secretWord: pickWord(category),
					guessedLetters: [],
					wrongLetters: [],
					remainingLives: MAX_LIVES,
					winnerName: '',
					updatedAt: serverTimestamp(),
				};
			});
			setStatus('Round started.');
		} catch (error) {
			setStatus(error?.message || 'Could not start round.');
		} finally {
			state.busy = false;
		}
	}

	async function updateCategory() {
		const roomId = state.roomId;
		if (!roomId || !isHost(state.roomData) || state.roomData?.stage === 'playing' || state.busy) return;
		state.busy = true;
		try {
			const category = selectedCategoryKey(state.roomData);
			await roomRef(roomId).update({
				category,
				updatedAt: serverTimestamp(),
			});
		} catch {
			setStatus('Could not update category.');
		} finally {
			state.busy = false;
		}
	}

	async function submitGuess(rawGuess) {
		const roomId = state.roomId;
		const room = state.roomData;
		if (!roomId || !room || room.stage !== 'playing' || state.busy) return;

		const guess = normalizeGuess(rawGuess);
		if (!guess) return;
		state.busy = true;
		try {
			await runRoomTransaction(roomId, (currentRoom) => {
				if (currentRoom.stage !== 'playing') throw new Error('The round is not active.');
				const secretWord = normalizeWord(currentRoom.secretWord || '');
				const guessedLetters = new Set((currentRoom.guessedLetters || []).map((letter) => normalizeWord(letter)));
				const wrongLetters = new Set((currentRoom.wrongLetters || []).map((letter) => normalizeWord(letter)));

				if (guess.length === 1 && !isLetter(guess)) {
					throw new Error('Guess a letter.');
				}

				if (guess.length === 1) {
					if (guessedLetters.has(guess) || wrongLetters.has(guess)) {
						throw new Error('That letter was already guessed.');
					}
					if (secretWord.includes(guess)) {
						guessedLetters.add(guess);
					} else {
						wrongLetters.add(guess);
					}
				} else {
					const cleanedGuess = normalizeWord(guess);
					if (!cleanedGuess) throw new Error('Enter a valid guess.');
					if (cleanedGuess === secretWord) {
						secretWord.split('').forEach((char) => {
							if (isLetter(char)) guessedLetters.add(char);
						});
					} else {
						if (wrongLetters.has(cleanedGuess)) throw new Error('That guess was already used.');
						wrongLetters.add(cleanedGuess);
					}
				}

				const guessedArray = Array.from(guessedLetters);
				const wrongArray = Array.from(wrongLetters);
				const remainingLives = Math.max(0, MAX_LIVES - wrongArray.length);
				const solved = (() => {
					for (const char of secretWord) {
						if (isLetter(char) && !guessedLetters.has(char)) return false;
					}
					return true;
				})();

				return {
					guessedLetters: guessedArray,
					wrongLetters: wrongArray,
					remainingLives,
					stage: solved ? 'won' : remainingLives <= 0 ? 'lost' : 'playing',
					winnerName: solved ? normalizeName(state.user?.displayName || 'Player') : currentRoom.winnerName || '',
					updatedAt: serverTimestamp(),
				};
			});

			if (els.guessInput) els.guessInput.value = '';
		} catch (error) {
			setStatus(error?.message || 'Guess rejected.');
		} finally {
			state.busy = false;
		}
	}

	function handleSnapshotRoom(room) {
		if (!room) {
			syncFromRoom(null);
			return;
		}
		if (els.joinRoomInput && !state.roomId) {
			els.joinRoomInput.value = room.roomCode || '';
		}
		syncFromRoom(room);
	}

	function wireKeyboard() {
		if (!els.letterKeyboard) return;
		els.letterKeyboard.addEventListener('click', (event) => {
			const button = event.target.closest('.letter-key');
			if (!button || button.disabled) return;
			submitGuess(button.dataset.letter || '');
		});
	}

	function wireEvents() {
		els.createRoomBtn?.addEventListener('click', createRoom);
		els.joinFlowBtn?.addEventListener('click', () => setJoinFlow(true));
		els.backToLobbyBtn?.addEventListener('click', () => setJoinFlow(false));
		els.joinRoomBtn?.addEventListener('click', joinRoom);
		els.leaveRoomBtn?.addEventListener('click', leaveRoom);
		els.startRoundBtn?.addEventListener('click', startRound);
		els.copyRoomCodeBtn?.addEventListener('click', () => state.roomId && copyText(state.roomId, 'Room code copied.'));
		els.copyInviteBtn?.addEventListener('click', () => state.roomId && copyText(inviteUrl(state.roomId), 'Invite link copied.'));
		els.categorySelect?.addEventListener('change', updateCategory);
		els.guessBtn?.addEventListener('click', () => {
			if (!els.guessInput) return;
			submitGuess(els.guessInput.value);
		});
		els.guessInput?.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				submitGuess(els.guessInput.value);
			}
		});

		window.addEventListener('keydown', (event) => {
			if (!state.roomData || state.roomData.stage !== 'playing') return;
			if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
			if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
				event.preventDefault();
				submitGuess(event.key);
			}
		});
	}

	async function init() {
		buildKeyboard();
		wireKeyboard();
		wireEvents();

		state.user = await ensureUser();
		const firebase = getFirebase();
		if (!firebase) {
			setStatus('Firebase is unavailable for multiplayer rooms.');
			return;
		}

		const params = new URLSearchParams(window.location.search);
		const roomParam = normalizeRoomCode(params.get('room') || '');
		if (roomParam && els.joinRoomInput) {
			els.joinRoomInput.value = roomParam;
			setJoinFlow(true);
			setStatus(`Room code ${roomParam} ready to join.`);
			return;
		}

		const localRoom = roomParam || normalizeRoomCode(sessionStorage.getItem('playrHangmanRoom') || '');
		if (localRoom) {
			subscribeRoom(localRoom);
			return;
		}

		setRoomPanelVisible(false);
		setStatus('Create a room or join with a code.');
	}

	window.addEventListener('beforeunload', () => {
		if (typeof state.roomUnsub === 'function') {
			state.roomUnsub();
			state.roomUnsub = null;
		}
		if (state.roomId) {
			sessionStorage.setItem('playrHangmanRoom', state.roomId);
		} else {
			sessionStorage.removeItem('playrHangmanRoom');
		}
	});

	init().catch((error) => {
		setStatus(error?.message || 'Failed to initialize Hangman Multiplayer.');
	});
})();
