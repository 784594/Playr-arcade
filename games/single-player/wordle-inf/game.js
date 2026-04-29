(function () {
	const WORD_LENGTH = 5;
	const MAX_GUESSES = 6;
	const WORD_LIST_PATH = './valid-wordle-words.txt';
	const BLOCKED_WORDS = new Set([
		'abuse', 'asses', 'bitch', 'boner', 'boobs', 'butts', 'chink', 'cocks', 'crack', 'cunts',
		'damns', 'dicks', 'dildo', 'dykes', 'fagot', 'fanny', 'feces', 'felch', 'fucks', 'gooks',
		'horny', 'kikes', 'milfs', 'naked', 'nigga', 'nudes', 'penis', 'pissy', 'porno', 'porns',
		'pussy', 'queer', 'raped', 'raper', 'rapes', 'recta', 'recto', 'sexed', 'sexes', 'shits',
		'sluts', 'spick', 'spics', 'spunk', 'sucks', 'titty', 'twats', 'wanks', 'wanky', 'whore',
	]);

	const FALLBACK_WORDS = [
		'APPLE', 'BRAVE', 'CRANE', 'DELTA', 'EMBER', 'FLAIR', 'GHOST', 'HOVER', 'IMAGE', 'JUMBO',
		'KNACK', 'LASER', 'MANGO', 'NEXUS', 'OCEAN', 'PRISM', 'QUILT', 'ROBIN', 'SNAKE', 'TIGER',
		'ULTRA', 'VIVID', 'WALTZ', 'XENON', 'YOUNG', 'ZEBRA', 'BLISS', 'CROWN', 'DRIFT', 'ELBOW',
		'FROST', 'GLASS', 'HONEY', 'INPUT', 'JELLY', 'LEMON', 'MIRTH', 'NOBLE', 'OPERA', 'PULSE',
		'RIVER', 'SOLAR', 'THORN', 'UNITE', 'VIGOR', 'WORRY', 'YIELD', 'ZESTY', 'ARISE', 'BLOOM',
	];

	const KEY_ROWS = [
		['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
		['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
		['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
	];

	const firebaseApp = window.firebase?.apps?.length
		? window.firebase.app()
		: window.firebase?.initializeApp
			? window.firebase.initializeApp({
				apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
				authDomain: 'playr3.firebaseapp.com',
				projectId: 'playr3',
				storageBucket: 'playr3.firebasestorage.app',
				messagingSenderId: '784118485475',
				appId: '1:784118485475:web:5347f708718f56602fd0d6',
				measurementId: 'G-J4DKRFRX33',
			})
			: null;

	const state = {
		answer: '',
		wordPool: FALLBACK_WORDS.slice(),
		validWords: new Set(FALLBACK_WORDS),
		guesses: [],
		guessEvaluations: [],
		currentGuess: '',
		gameOver: false,
		won: false,
		revealAdminWord: false,
		statusTimer: null,
		revealingRowIndex: -1,
	};

	const els = {
		status: document.getElementById('gameStatus'),
		board: document.getElementById('board'),
		keyboard: document.getElementById('keyboard'),
		leftRailTitle: document.getElementById('leftRailTitle'),
		nextWordBtn: document.getElementById('nextWordBtn'),
		adminTools: document.getElementById('adminTools'),
		adminWordValue: document.getElementById('adminWordValue'),
		revealWordBtn: document.getElementById('revealWordBtn'),
		gameEndModal: document.getElementById('gameEndModal'),
		modalTitle: document.getElementById('modalTitle'),
		modalMessage: document.getElementById('modalMessage'),
		playAgainBtn: document.getElementById('playAgainBtn'),
		definitionBtn: document.getElementById('definitionBtn'),
		definitionText: document.getElementById('definitionText'),
		invalidWordNotice: document.getElementById('invalidWordNotice'),
		emptyPlaceholder: document.getElementById('emptyPlaceholder'),
	};

	function normalizeWord(value) {
		return String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LENGTH);
	}

	function pickAnswer() {
		const pool = Array.isArray(state.wordPool) && state.wordPool.length ? state.wordPool : FALLBACK_WORDS;
		return pool[Math.floor(Math.random() * pool.length)] || FALLBACK_WORDS[0];
	}

	function isOwnerAccount() {
		try {
			if (window.PlayrAuth?.isAdmin) {
				return true;
			}
			if (typeof window.PlayrAuth?.canAccessAdminControls === 'function') {
				if (window.PlayrAuth.canAccessAdminControls()) {
					return true;
				}
			}
			if (typeof window.PlayrAuth?.getCurrentUser === 'function') {
				const user = window.PlayrAuth.getCurrentUser();
				if (user?.isAdmin) return true;
				if (String(user?.displayName || '').trim().toLowerCase() === 'owner') return true;
			}
		} catch {
			// no-op
		}

		try {
			const raw = localStorage.getItem('playrCurrentUser');
			if (!raw) return false;
			const parsed = JSON.parse(raw);
			if (parsed?.isAdmin) return true;
			return String(parsed?.displayName || '').trim().toLowerCase() === 'owner';
		} catch {
			return false;
		}
	}

	function setStatus(text) {
		if (!els.status) return;
		els.status.textContent = String(text || '');
		if (state.statusTimer) {
			clearTimeout(state.statusTimer);
			state.statusTimer = null;
		}
		if (!text) return;
		state.statusTimer = setTimeout(() => {
			if (els.status) els.status.textContent = '';
			state.statusTimer = null;
		}, 1600);
	}

	function parseWordFile(raw) {
		if (!raw) return [];
		const lines = String(raw)
			.split(/\r?\n/)
			.map((line) => normalizeWord(line))
			.filter((word) => word.length === WORD_LENGTH)
			.filter((word) => !BLOCKED_WORDS.has(word.toLowerCase()));
		return Array.from(new Set(lines));
	}

	async function loadWordData() {
		try {
			const response = await fetch(WORD_LIST_PATH, { cache: 'no-store' });
			if (!response.ok) throw new Error(`HTTP_${response.status}`);
			const raw = await response.text();
			const parsed = parseWordFile(raw);
			if (parsed.length < 100) throw new Error('WORD_LIST_TOO_SMALL');

			state.wordPool = parsed;
			state.validWords = new Set(parsed);
			setStatus(`Loaded ${parsed.length} words.`);
			return;
		} catch {
			state.wordPool = FALLBACK_WORDS.slice();
			state.validWords = new Set(FALLBACK_WORDS);
			setStatus('Using fallback dictionary.');
		}
	}

	function evaluateGuess(guess, answer) {
		const result = new Array(WORD_LENGTH).fill('absent');
		const answerChars = answer.split('');
		const guessChars = guess.split('');
		const used = new Array(WORD_LENGTH).fill(false);

		for (let i = 0; i < WORD_LENGTH; i += 1) {
			if (guessChars[i] === answerChars[i]) {
				result[i] = 'correct';
				used[i] = true;
			}
		}

		for (let i = 0; i < WORD_LENGTH; i += 1) {
			if (result[i] === 'correct') continue;
			const letter = guessChars[i];
			const matchIndex = answerChars.findIndex((candidate, candidateIndex) => candidate === letter && !used[candidateIndex]);
			if (matchIndex !== -1) {
				result[i] = 'present';
				used[matchIndex] = true;
			}
		}

		return result;
	}

	function showGameEndModal() {
		if (!els.gameEndModal) return;
		const title = state.won ? '🎉 Word Found!' : '😢 Game Over';
		const message = state.won 
			? `You guessed it in ${state.guesses.length} guess${state.guesses.length === 1 ? '' : 'es'}!`
			: `The word was: ${state.answer}`;
		
		if (els.modalTitle) els.modalTitle.textContent = title;
		if (els.modalMessage) els.modalMessage.textContent = message;
		els.gameEndModal.hidden = false;
	}

	function hideGameEndModal() {
		if (els.gameEndModal) els.gameEndModal.hidden = true;
		if (els.definitionText) els.definitionText.hidden = true;
	}

	function showInvalidWordNotice() {
		if (!els.invalidWordNotice) return;
		els.invalidWordNotice.hidden = false;
		setTimeout(() => {
			els.invalidWordNotice.hidden = true;
		}, 1500);
	}

	function getSimpleDefinition(word) {
		// Simple hardcoded definitions for testing; in production, you'd use an API
		const defs = {
			'APPLE': 'A round fruit that grows on trees, typically red, green, or yellow.',
			'BRAVE': 'Showing courage in the face of danger or pain.',
			'CRANE': 'A large wading bird with a long neck and legs.',
			'DELTA': 'The fourth letter of the Greek alphabet; also a triangular area where a river meets the sea.',
			'EMBER': 'A glowing piece of coal or wood in a fire.',
			'FLAIR': 'A distinctive elegance, style, or skill.',
			'GHOST': 'The spirit of a dead person believed to haunt living people or places.',
			'HOVER': 'To remain suspended in the air without moving forward or backward.',
			'IMAGE': 'A representation or reproduction of the form of someone or something.',
			'JUMBO': 'Very large; of a size larger than the standard.',
		};
		return defs[word] || 'No definition available.';
	}

	function getKeyboardState() {
		const stateMap = {};
		for (let guessIndex = 0; guessIndex < state.guesses.length; guessIndex += 1) {
			const guess = state.guesses[guessIndex];
			const evaluation = state.guessEvaluations[guessIndex] || evaluateGuess(guess, state.answer);
			guess.split('').forEach((letter, index) => {
				const nextState = evaluation[index];
				const current = stateMap[letter];
				if (current === 'correct' || (current === 'present' && nextState === 'absent')) return;
				if (nextState === 'correct') {
					stateMap[letter] = 'correct';
				} else if (nextState === 'present' && current !== 'correct') {
					stateMap[letter] = 'present';
				} else if (!stateMap[letter]) {
					stateMap[letter] = 'absent';
				}
			});
		}
		return stateMap;
	}

	function renderBoard() {
		if (!els.board) return;
		const rows = [];
		for (let rowIndex = 0; rowIndex < MAX_GUESSES; rowIndex += 1) {
			const guess = state.guesses[rowIndex] || '';
			const isCurrentRow = rowIndex === state.guesses.length && !state.gameOver;
			const isInvalidRow = isCurrentRow && state.currentGuess.length === WORD_LENGTH && !state.validWords.has(state.currentGuess);
			const evaluation = rowIndex < state.guesses.length ? (state.guessEvaluations[rowIndex] || evaluateGuess(guess, state.answer)) : new Array(WORD_LENGTH).fill('');
			const currentDisplay = isCurrentRow ? state.currentGuess.padEnd(WORD_LENGTH, ' ') : ' '.repeat(WORD_LENGTH);
			const letters = (rowIndex < state.guesses.length ? guess : currentDisplay).split('');
			const isRevealingRow = rowIndex === state.revealingRowIndex;

			rows.push(`
				<div class="guess-row${isInvalidRow ? ' invalid' : ''}" aria-label="Guess ${rowIndex + 1}">
					${letters.map((letter, letterIndex) => {
						const filled = Boolean(letter && letter !== ' ');
						const statusClass = rowIndex < state.guesses.length ? evaluation[letterIndex] : '';
						const classes = ['guess-cell'];
						if (filled) classes.push('filled');
						if (statusClass) classes.push(statusClass);
						if (isRevealingRow && statusClass) classes.push('revealing');
						const delayStyle = isRevealingRow && statusClass ? ` style="--flip-delay:${letterIndex * 180}ms"` : '';
						return `<div class="${classes.join(' ')}"${delayStyle}>${filled ? letter : ''}</div>`;
					}).join('')}
				</div>
			`);
		}
		els.board.innerHTML = rows.join('');
	}

	function renderKeyboard() {
		if (!els.keyboard) return;
		const keyboardState = getKeyboardState();
		els.keyboard.innerHTML = KEY_ROWS.map((row, rowIndex) => {
			const rowClass = rowIndex === 1 ? 'key-row center' : rowIndex === 2 ? 'key-row bottom' : 'key-row';
			return `
				<div class="${rowClass}">
					${row.map((key) => {
						const keyClass = ['wordle-key'];
						const stateClass = keyboardState[key] || '';
						if (stateClass) keyClass.push(stateClass);
						if (key === 'ENTER' || key === 'BACKSPACE') keyClass.push('wide');
						const label = key === 'BACKSPACE' ? '⌫' : key;
						return `<button type="button" class="${keyClass.join(' ')}" data-key="${key}">${label}</button>`;
					}).join('')}
				</div>
			`;
		}).join('');
	}

	function updateAdminPanel() {
		const canShowAdmin = isOwnerAccount();
		if (els.leftRailTitle) els.leftRailTitle.textContent = canShowAdmin ? 'Admin' : 'Wordle';
		if (els.adminTools) els.adminTools.hidden = !canShowAdmin;
		if (els.emptyPlaceholder) els.emptyPlaceholder.hidden = canShowAdmin;
		if (!canShowAdmin) state.revealAdminWord = false;
		if (els.revealWordBtn) {
			els.revealWordBtn.textContent = state.revealAdminWord ? 'Hide Word' : 'Reveal Word';
		}
		if (els.adminWordValue) {
			els.adminWordValue.textContent = state.revealAdminWord ? state.answer : 'Hidden';
			els.adminWordValue.classList.toggle('admin-word-revealed', state.revealAdminWord);
		}
	}

	function updateNextWordButton() {
		if (!els.nextWordBtn) return;
		els.nextWordBtn.hidden = !state.gameOver;
		els.nextWordBtn.disabled = !state.gameOver;
	}

	function updateStatus() {
		// Removed generic status text; modal shows game results
		setStatus('');
	}

	function renderAll() {
		renderBoard();
		renderKeyboard();
		updateAdminPanel();
		updateNextWordButton();
		updateStatus();
	}

	function finishRound(won) {
		state.gameOver = true;
		state.won = won;
		updateNextWordButton();
		updateAdminPanel();
		updateStatus();
		renderBoard();
		showGameEndModal();
	}

	function submitGuess() {
		if (state.gameOver) return;
		if (state.currentGuess.length !== WORD_LENGTH) {
			setStatus('Need 5 letters.');
			return;
		}

		if (!state.validWords.has(state.currentGuess)) {
			showInvalidWordNotice();
			// Highlight the invalid row with red vibrate effect
			renderBoard();
			return;
		}

		const submittedGuess = state.currentGuess;
		const guessRowIndex = state.guesses.length;
		const evaluation = evaluateGuess(submittedGuess, state.answer);
		state.guesses.push(submittedGuess);
		state.guessEvaluations.push(evaluation);
		state.revealingRowIndex = guessRowIndex;
		if (submittedGuess === state.answer) {
			state.currentGuess = '';
			renderAll();
			window.setTimeout(() => {
				state.revealingRowIndex = -1;
				renderBoard();
				finishRound(true);
			}, 1000);
			return;
		}

		state.currentGuess = '';
		if (state.guesses.length >= MAX_GUESSES) {
			renderAll();
			window.setTimeout(() => {
				state.revealingRowIndex = -1;
				renderBoard();
				finishRound(false);
			}, 1000);
			return;
		}

		renderAll();
		window.setTimeout(() => {
			if (state.revealingRowIndex === guessRowIndex) {
				state.revealingRowIndex = -1;
				renderBoard();
			}
		}, 1000);
	}

	function handleKeyPress(key) {
		if (state.gameOver) return;

		if (key === 'ENTER') {
			submitGuess();
			return;
		}

		if (key === 'BACKSPACE') {
			state.currentGuess = state.currentGuess.slice(0, -1);
			renderAll();
			return;
		}

		if (/^[A-Z]$/.test(key) && state.currentGuess.length < WORD_LENGTH) {
			state.currentGuess += key;
			renderAll();
		}
	}

	function startNewWord() {
		state.answer = pickAnswer();
		state.guesses = [];
		state.guessEvaluations = [];
		state.currentGuess = '';
		state.gameOver = false;
		state.won = false;
		state.revealAdminWord = false;
		state.revealingRowIndex = -1;
		setStatus('New word loaded.');
		renderAll();
	}

	function bindEvents() {
		document.addEventListener('keydown', (event) => {
			const key = event.key.toUpperCase();
			if (/^[A-Z]$/.test(key)) {
				event.preventDefault();
				handleKeyPress(key);
				return;
			}
			if (event.key === 'Backspace') {
				event.preventDefault();
				handleKeyPress('BACKSPACE');
				return;
			}
			if (event.key === 'Enter') {
				event.preventDefault();
				handleKeyPress('ENTER');
			}
		});

		if (els.keyboard) {
			els.keyboard.addEventListener('click', (event) => {
				const button = event.target.closest('[data-key]');
				if (!button) return;
				handleKeyPress(button.dataset.key || '');
			});
		}

		if (els.nextWordBtn) {
			els.nextWordBtn.addEventListener('click', () => {
				startNewWord();
			});
		}

		if (els.revealWordBtn) {
			els.revealWordBtn.addEventListener('click', () => {
				state.revealAdminWord = !state.revealAdminWord;
				updateAdminPanel();
			});
		}

		if (els.playAgainBtn) {
			els.playAgainBtn.addEventListener('click', () => {
				hideGameEndModal();
				startNewWord();
			});
		}

		if (els.definitionBtn) {
			els.definitionBtn.addEventListener('click', () => {
				if (els.definitionText) {
					const def = getSimpleDefinition(state.answer);
					els.definitionText.textContent = def;
					els.definitionText.hidden = !els.definitionText.hidden;
				}
			});
		}

		window.addEventListener('playr-auth-changed', () => {
			updateAdminPanel();
		});
	}

	async function init() {
		if (!els.board || !els.keyboard || !els.status) return;
		setStatus('Loading word list...');
		await loadWordData();
		state.answer = pickAnswer();
		bindEvents();
		updateAdminPanel();
		renderAll();
	}

	void init();
})();
