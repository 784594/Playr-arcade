(function () {
	const statusEl = document.getElementById('gameStatus');
	const roundEl = document.getElementById('roundValue');
	const livesEl = document.getElementById('livesValue');
	const strictEl = document.getElementById('strictValue');
	const sequenceEl = document.getElementById('sequenceValue');
	const boardBody = document.getElementById('localBoardBody');
	const winBanner = document.getElementById('winBanner');

	const startBtn = document.getElementById('startBtn');
	const replayBtn = document.getElementById('replayBtn');
	const strictBtn = document.getElementById('strictBtn');
	const padNodes = Array.from(document.querySelectorAll('.pad'));

	if (!startBtn || padNodes.length !== 5) {
		return;
	}

	const STORAGE_KEY = 'playr-simon-says-board-v1';
	const MAX_LOCAL_SCORES = 10;
	const WIN_ROUND = 100;
	const BASE_STEP_MS = 560;
	const MIN_STEP_MS = 240;
	const BASE_GAP_MS = 210;
	const MIN_GAP_MS = 90;
	const BASE_INPUT_TIMEOUT_MS = 3000;
	const MIN_INPUT_TIMEOUT_MS = 900;

	const padFrequencies = [329.63, 392.0, 493.88, 587.33, 698.46];
	const keyboardMap = {
		a: 0,
		'1': 0,
		s: 1,
		'2': 1,
		d: 2,
		'3': 2,
		j: 3,
		'4': 3,
		k: 4,
		'5': 4
	};

	const state = {
		sequence: [],
		playerIndex: 0,
		running: false,
		strict: false,
		lives: 3,
		locked: true,
		bestRun: 0,
		audioContext: null,
		hasWon: false,
		inputTimeoutId: null
	};

	function setStatus(text) {
		if (!statusEl) return;
		statusEl.textContent = text;
	}

	function getRoundForDifficulty() {
		return Math.max(1, Math.min(state.sequence.length, WIN_ROUND));
	}

	function getDifficultyProgress() {
		const round = getRoundForDifficulty();
		return (round - 1) / (WIN_ROUND - 1);
	}

	function getTiming() {
		const progress = getDifficultyProgress();
		const eased = 1 - Math.pow(1 - progress, 1.65);
		const step = Math.round(BASE_STEP_MS - (BASE_STEP_MS - MIN_STEP_MS) * eased);
		const gap = Math.round(BASE_GAP_MS - (BASE_GAP_MS - MIN_GAP_MS) * eased);

		return {
			step: Math.max(MIN_STEP_MS, step),
			gap: Math.max(MIN_GAP_MS, gap)
		};
	}

	function getInputTimeoutMs() {
		const progress = getDifficultyProgress();
		const eased = 1 - Math.pow(1 - progress, 1.45);
		const timeout = Math.round(BASE_INPUT_TIMEOUT_MS - (BASE_INPUT_TIMEOUT_MS - MIN_INPUT_TIMEOUT_MS) * eased);
		return Math.max(MIN_INPUT_TIMEOUT_MS, timeout);
	}

	function clearInputTimeout() {
		if (!state.inputTimeoutId) return;
		window.clearTimeout(state.inputTimeoutId);
		state.inputTimeoutId = null;
	}

	function startInputTimeout() {
		clearInputTimeout();
		if (!state.running || state.locked) return;

		const timeoutMs = getInputTimeoutMs();
		state.inputTimeoutId = window.setTimeout(async () => {
			if (!state.running || state.locked) return;
			state.locked = true;
			setPadsEnabled(false);
			await handleMistake(null, 'Too slow.');
		}, timeoutMs);
	}

	function updateHud() {
		const round = state.sequence.length;
		roundEl.textContent = String(round);
		livesEl.textContent = String(state.lives);
		strictEl.textContent = state.strict ? 'On' : 'Off';
		strictBtn.textContent = `Strict: ${state.strict ? 'On' : 'Off'}`;
		strictBtn.setAttribute('aria-pressed', state.strict ? 'true' : 'false');
		sequenceEl.textContent = String(round);
	}

	function showWinCelebration() {
		if (!winBanner) return;
		winBanner.hidden = false;
		winBanner.classList.remove('show');
		void winBanner.offsetWidth;
		winBanner.classList.add('show');
		window.setTimeout(() => {
			winBanner.hidden = true;
			winBanner.classList.remove('show');
		}, 1300);
	}

	function ensureAudioContext() {
		if (state.audioContext) return state.audioContext;
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return null;
		state.audioContext = new Ctx();
		return state.audioContext;
	}

	function beep(frequency, ms) {
		const ctx = ensureAudioContext();
		if (!ctx) return;

		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		const now = ctx.currentTime;
		const duration = ms / 1000;

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'triangle';
		osc.frequency.value = frequency;

		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + duration + 0.015);
	}

	function sleep(ms) {
		return new Promise((resolve) => {
			window.setTimeout(resolve, ms);
		});
	}

	function setPadsEnabled(enabled) {
		padNodes.forEach((node) => {
			node.disabled = !enabled;
		});
		replayBtn.disabled = !state.running || !enabled;
	}

	function flashPad(index, duration, isError) {
		const pad = padNodes[index];
		if (!pad) return;

		pad.classList.add('active');
		if (isError) {
			pad.classList.add('error');
		}
		beep(isError ? 180 : padFrequencies[index], duration);

		window.setTimeout(() => {
			pad.classList.remove('active');
			pad.classList.remove('error');
		}, duration);
	}

	function nextPadIndex() {
		return Math.floor(Math.random() * padNodes.length);
	}

	async function playSequence() {
		state.locked = true;
		clearInputTimeout();
		setPadsEnabled(false);

		const timing = getTiming();
		const step = timing.step;
		const gap = timing.gap;

		for (const value of state.sequence) {
			flashPad(value, step, false);
			await sleep(step + gap);
		}

		state.locked = false;
		state.playerIndex = 0;
		setPadsEnabled(true);
		setStatus('Your turn. Repeat the pattern.');
		startInputTimeout();
	}

	function saveScore() {
		if (!state.bestRun) return;

		const mode = state.strict ? 'Strict' : 'Classic';
		const entry = {
			date: new Date().toLocaleDateString(),
			score: state.bestRun,
			mode
		};

		let existing = [];
		try {
			existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			if (!Array.isArray(existing)) existing = [];
		} catch {
			existing = [];
		}

		const next = [entry, ...existing]
			.sort((a, b) => b.score - a.score)
			.slice(0, MAX_LOCAL_SCORES);

		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		renderScores(next);
	}

	function renderScores(source) {
		let data = source;
		if (!data) {
			try {
				data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			} catch {
				data = [];
			}
		}

		if (!Array.isArray(data) || data.length === 0) {
			boardBody.innerHTML = '<tr><td>#1</td><td>--</td><td>--</td><td>--</td></tr>';
			return;
		}

		boardBody.innerHTML = data
			.map((row, index) => {
				const safeDate = String(row.date || '--').replace(/[<>]/g, '');
				const safeMode = String(row.mode || '--').replace(/[<>]/g, '');
				const safeScore = Number.isFinite(row.score) ? row.score : '--';
				return `<tr><td>#${index + 1}</td><td>${safeDate}</td><td>${safeScore}</td><td>${safeMode}</td></tr>`;
			})
			.join('');
	}

	async function advanceRound() {
		state.sequence.push(nextPadIndex());
		state.bestRun = Math.max(state.bestRun, state.sequence.length - 1);
		updateHud();
		setStatus(`Round ${state.sequence.length}. Watch closely.`);
		await sleep(450);
		await playSequence();
	}

	function finishGame(reason) {
		state.running = false;
		state.locked = true;
		clearInputTimeout();
		setPadsEnabled(false);
		saveScore();
		setStatus(`${reason} Final sequence: ${state.bestRun}. Press Start to play again.`);
		startBtn.textContent = 'Start';
	}

	async function handleMistake(index, reasonText) {
		clearInputTimeout();
		if (typeof index === 'number') {
			flashPad(index, 260, true);
		}
		state.lives -= 1;
		updateHud();

		if (state.strict) {
			finishGame(reasonText ? `${reasonText} Strict mode ended the game.` : 'Wrong input in strict mode.');
			return;
		}

		if (state.lives <= 0) {
			finishGame(reasonText ? `${reasonText} No lives left.` : 'No lives left.');
			return;
		}

		if (reasonText) {
			setStatus(`${reasonText} ${state.lives} lives left. Replaying sequence...`);
		} else {
			setStatus(`Wrong pad. ${state.lives} lives left. Replaying sequence...`);
		}
		await sleep(750);
		await playSequence();
	}

	async function handleInput(index) {
		if (!state.running || state.locked) return;
		clearInputTimeout();

		flashPad(index, Math.max(170, getTiming().step - 130), false);

		const expected = state.sequence[state.playerIndex];
		if (index !== expected) {
			state.locked = true;
			setPadsEnabled(false);
			await handleMistake(index, null);
			return;
		}

		state.playerIndex += 1;

		if (state.playerIndex === state.sequence.length) {
			state.bestRun = Math.max(state.bestRun, state.sequence.length);

			if (state.bestRun >= WIN_ROUND && !state.hasWon) {
				state.hasWon = true;
				showWinCelebration();
				setStatus('You win! Round 100 cleared. Beyond this is pure flex.');
				updateHud();
				state.locked = true;
				setPadsEnabled(false);
				await sleep(1200);
				await advanceRound();
				return;
			}

			updateHud();
			state.locked = true;
			setPadsEnabled(false);
			setStatus('Nice. Next round loading...');
			await sleep(700);
			await advanceRound();
			return;
		}

		startInputTimeout();
	}

	async function startGame() {
		clearInputTimeout();
		state.sequence = [];
		state.playerIndex = 0;
		state.lives = 3;
		state.bestRun = 0;
		state.hasWon = false;
		state.running = true;
		state.locked = true;
		setPadsEnabled(false);
		updateHud();
		startBtn.textContent = 'Restart';
		setStatus('Starting game...');
		await sleep(350);
		await advanceRound();
	}

	startBtn.addEventListener('click', () => {
		startGame();
	});

	replayBtn.addEventListener('click', async () => {
		if (!state.running || state.locked) return;
		clearInputTimeout();
		state.locked = true;
		setPadsEnabled(false);
		setStatus('Replaying current sequence...');
		await sleep(250);
		await playSequence();
	});

	strictBtn.addEventListener('click', () => {
		if (state.running && state.sequence.length > 0) {
			setStatus('Strict mode can be changed between games.');
			return;
		}
		state.strict = !state.strict;
		updateHud();
	});

	padNodes.forEach((node, index) => {
		node.addEventListener('click', () => {
			handleInput(index);
		});
	});

	document.addEventListener('keydown', (event) => {
		const key = event.key.toLowerCase();
		const index = keyboardMap[key];
		if (typeof index !== 'number') return;

		if (event.repeat) return;
		event.preventDefault();
		handleInput(index);
	});

	renderScores();
	updateHud();
	setPadsEnabled(false);
})();
