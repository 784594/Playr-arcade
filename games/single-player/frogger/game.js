(function () {
	const root = document.getElementById('gameRoot');
	const canvas = document.getElementById('gameCanvas');
	const scoreValue = document.getElementById('scoreValue');
	const livesValue = document.getElementById('livesValue');
	const levelValue = document.getElementById('levelValue');
	const timerValue = document.getElementById('timerValue');
	const homesValue = document.getElementById('homesValue');
	const bestValue = document.getElementById('bestValue');
	const boardOverlay = document.getElementById('boardOverlay');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlayText = document.getElementById('overlayText');
	const startButton = document.getElementById('startButton');
	const restartButton = document.getElementById('restartButton');
	const pauseButton = document.getElementById('pauseButton');
	const touchButtons = Array.from(document.querySelectorAll('[data-action]'));

	if (!root || !canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const storageKey = 'playr.frogger.best.v1';
	const COLS = 15;
	const ROWS = 13;
	const TILE = 40;
	const START_LIVES = 3;
	const ROUND_TIME = 40;
	const HOME_COUNT = 5;
	const HOME_Y = 0;
	const MEDIAN_Y = 6;
	const START_Y = 12;
	const RIVER_ROWS = [1, 2, 3, 4, 5];
	const ROAD_ROWS = [7, 8, 9, 10, 11];

	const palette = {
		bgDark: '#0a1020',
		grass: '#29543c',
		grassAccent: '#366f4f',
		river: '#22506f',
		riverAccent: '#2c6a92',
		road: '#2a2a2f',
		roadStripe: '#e4d07a',
		log: '#8a5d3a',
		logAccent: '#b4874e',
		turtle: '#2f8f8a',
		turtleShell: '#206966',
		carA: '#ef5d5d',
		carB: '#79a8ff',
		carC: '#f6ce68',
		carD: '#b884ff',
		frog: '#6be48f',
		frogEye: '#162117',
		home: '#1f3c2c',
		homeFill: '#72dc92',
		textShadow: '#061019',
	};

	const laneDefs = {
		1: [
			{ x: 0.5, len: 3, speed: 1.65, type: 'log' },
			{ x: 8.5, len: 2, speed: 1.65, type: 'log' },
		],
		2: [
			{ x: 2.2, len: 2, speed: -1.95, type: 'turtle' },
			{ x: 9.4, len: 3, speed: -1.95, type: 'turtle' },
		],
		3: [
			{ x: 1.0, len: 4, speed: 1.35, type: 'log' },
			{ x: 10.3, len: 3, speed: 1.35, type: 'log' },
		],
		4: [
			{ x: 3.5, len: 2, speed: -2.35, type: 'turtle' },
			{ x: 12.1, len: 2, speed: -2.35, type: 'turtle' },
		],
		5: [
			{ x: 0.0, len: 5, speed: 1.1, type: 'log' },
			{ x: 8.8, len: 4, speed: 1.1, type: 'log' },
		],
		7: [
			{ x: 1.5, len: 2, speed: -2.7, type: 'carA' },
			{ x: 8.2, len: 2, speed: -2.7, type: 'carB' },
			{ x: 13.1, len: 2, speed: -2.7, type: 'carA' },
		],
		8: [
			{ x: 0.2, len: 3, speed: 2.05, type: 'carC' },
			{ x: 7.0, len: 2, speed: 2.05, type: 'carD' },
			{ x: 12.3, len: 3, speed: 2.05, type: 'carC' },
		],
		9: [
			{ x: 3.2, len: 2, speed: -3.2, type: 'carB' },
			{ x: 9.8, len: 2, speed: -3.2, type: 'carA' },
		],
		10: [
			{ x: 1.1, len: 4, speed: 1.5, type: 'carD' },
			{ x: 10.7, len: 3, speed: 1.5, type: 'carC' },
		],
		11: [
			{ x: 4.0, len: 2, speed: -3.5, type: 'carA' },
			{ x: 11.0, len: 2, speed: -3.5, type: 'carB' },
		],
	};

	const state = {
		phase: 'idle',
		lanes: [],
		frog: { x: Math.floor(COLS / 2), y: START_Y, px: Math.floor(COLS / 2), py: START_Y },
		homes: Array(HOME_COUNT).fill(false),
		homeXs: [1, 4, 7, 10, 13],
		score: 0,
		lives: START_LIVES,
		level: 1,
		timer: ROUND_TIME,
		best: loadBest(),
		farthestY: START_Y,
		lastTick: 0,
		carrySpeed: 0,
		respawnLock: 0,
		message: 'Start Crossing',
	};

	function loadBest() {
		try {
			return Number(localStorage.getItem(storageKey) || 0) || 0;
		} catch {
			return 0;
		}
	}

	function saveBest() {
		try {
			localStorage.setItem(storageKey, String(state.best));
		} catch {
			// no-op
		}
	}

	function setStatus(message, panelStatus) {
		state.message = message;
	}

	function cloneLanes() {
		const speedFactor = 1 + (state.level - 1) * 0.12;
		const result = [];
		for (const [rowKey, objects] of Object.entries(laneDefs)) {
			const row = Number(rowKey);
			result.push({
				row,
				objects: objects.map((item) => ({
					x: item.x,
					len: item.len,
					type: item.type,
					speed: item.speed * speedFactor,
				})),
			});
		}
		return result;
	}

	function resetFrog() {
		state.frog.x = Math.floor(COLS / 2);
		state.frog.y = START_Y;
		state.frog.px = state.frog.x;
		state.frog.py = state.frog.y;
		state.farthestY = START_Y;
		state.carrySpeed = 0;
	}

	function startGame() {
		state.score = 0;
		state.lives = START_LIVES;
		state.level = 1;
		state.timer = ROUND_TIME;
		state.homes = Array(HOME_COUNT).fill(false);
		state.respawnLock = 0;
		state.lanes = cloneLanes();
		resetFrog();
		state.phase = 'active';
		setStatus('Hop to the river homes and avoid collisions.', 'Playing');
		updateHud();
		updateOverlay();
	}

	function restartGame() {
		startGame();
	}

	function pauseGame() {
		if (state.phase === 'active') {
			state.phase = 'paused';
			setStatus('Game paused.', 'Paused');
			updateOverlay();
		} else if (state.phase === 'paused') {
			state.phase = 'active';
			setStatus('', 'Playing');
			updateOverlay();
		}
	}

	function loseLife(reason) {
		if (state.respawnLock > 0 || state.phase !== 'active') return;
		state.lives -= 1;
		state.respawnLock = 0.55;
		setStatus(reason, 'Hit');
		if (state.lives <= 0) {
			endGame();
			return;
		}
		state.timer = ROUND_TIME;
		resetFrog();
		updateHud();
	}

	function endGame() {
		state.phase = 'gameover';
		if (state.score > state.best) {
			state.best = state.score;
			saveBest();
		}
		setStatus(`Game over. Score: ${state.score}.`, 'Game over');
		updateHud();
		updateOverlay();
	}

	function nextLevel() {
		state.level += 1;
		state.score += 500;
		state.homes = Array(HOME_COUNT).fill(false);
		state.timer = ROUND_TIME;
		state.lanes = cloneLanes();
		resetFrog();
		setStatus(`Level ${state.level}. Lanes are faster now.`, 'Level up');
		updateHud();
	}

	function updateHud() {
		if (scoreValue) scoreValue.textContent = String(Math.floor(state.score));
		if (livesValue) livesValue.textContent = String(state.lives);
		if (levelValue) levelValue.textContent = String(state.level);
		if (timerValue) timerValue.textContent = String(Math.max(0, Math.ceil(state.timer)));
		if (homesValue) {
			const count = state.homes.filter(Boolean).length;
			homesValue.textContent = `${count} / ${HOME_COUNT}`;
		}
		if (bestValue) bestValue.textContent = String(Math.floor(state.best));
	}

	function updateOverlay() {
		if (!boardOverlay) return;
		const show = state.phase !== 'active';
		boardOverlay.classList.toggle('hidden', !show);
		if (!show) return;

		if (state.phase === 'idle') {
			overlayTitle.textContent = 'Pixel Frogger';
			overlayText.textContent = 'Use lanes and logs to reach every home slot at the top.';
			startButton.textContent = 'Start';
		} else if (state.phase === 'paused') {
			overlayTitle.textContent = 'Catch your breath';
			overlayText.textContent = 'Traffic and river flow are frozen. Resume when ready.';
			startButton.textContent = 'Resume';
		} else {
			overlayTitle.textContent = 'Frog splatted';
			overlayText.textContent = `Final score ${Math.floor(state.score)}. Try a cleaner route next run.`;
			startButton.textContent = 'Play again';
		}
	}

	function moveLanes(dt) {
		for (const lane of state.lanes) {
			for (const item of lane.objects) {
				item.x += item.speed * dt;
				if (item.speed > 0 && item.x > COLS + item.len) item.x = -item.len - 1;
				if (item.speed < 0 && item.x < -item.len - 1) item.x = COLS + item.len;
			}
		}
	}

	function overlap(aStart, aEnd, bStart, bEnd) {
		return aStart < bEnd && aEnd > bStart;
	}

	function getLane(row) {
		return state.lanes.find((lane) => lane.row === row);
	}

	function applyRiverCarry(dt) {
		state.carrySpeed = 0;
		if (!RIVER_ROWS.includes(state.frog.y)) return;
		const lane = getLane(state.frog.y);
		if (!lane) return;

		const frogLeft = state.frog.x + 0.16;
		const frogRight = state.frog.x + 0.84;
		let safeRide = null;
		for (const item of lane.objects) {
			const left = item.x;
			const right = item.x + item.len;
			if (overlap(frogLeft, frogRight, left, right)) {
				safeRide = item;
				break;
			}
		}

		if (!safeRide) {
			loseLife('You fell into the water.');
			return;
		}

		state.carrySpeed = safeRide.speed;
		state.frog.x += safeRide.speed * dt;
		if (state.frog.x < -0.45 || state.frog.x > COLS - 0.55) {
			loseLife('You drifted off the log.');
		}
	}

	function checkRoadHits() {
		if (!ROAD_ROWS.includes(state.frog.y)) return;
		const lane = getLane(state.frog.y);
		if (!lane) return;
		const frogLeft = state.frog.x + 0.12;
		const frogRight = state.frog.x + 0.88;
		for (const item of lane.objects) {
			if (overlap(frogLeft, frogRight, item.x + 0.1, item.x + item.len - 0.1)) {
				loseLife('You got hit by traffic.');
				return;
			}
		}
	}

	function checkHome() {
		if (state.frog.y !== HOME_Y) return;
		let slot = -1;
		for (let index = 0; index < state.homeXs.length; index += 1) {
			if (Math.abs(state.frog.x - state.homeXs[index]) < 0.7) {
				slot = index;
				break;
			}
		}

		if (slot < 0) {
			loseLife('Missed a home slot.');
			return;
		}
		if (state.homes[slot]) {
			loseLife('That home is already full.');
			return;
		}

		state.homes[slot] = true;
		state.score += 250 + Math.floor(state.timer * 6);
		setStatus('Home reached.', 'Scored');
		state.timer = ROUND_TIME;
		resetFrog();
		updateHud();

		const allFilled = state.homes.every(Boolean);
		if (allFilled) {
			nextLevel();
		}
	}

	function clampFrogX() {
		state.frog.x = Math.max(-0.49, Math.min(COLS - 0.51, state.frog.x));
	}

	function moveFrog(dx, dy) {
		if (state.phase !== 'active') return;
		if (state.respawnLock > 0) return;

		const oldY = state.frog.y;
		state.frog.x = Math.round(state.frog.x) + dx;
		state.frog.y = Math.max(HOME_Y, Math.min(START_Y, state.frog.y + dy));
		clampFrogX();

		if (state.frog.y < state.farthestY) {
			state.farthestY = state.frog.y;
			state.score += 10;
		}
		if (state.frog.y > oldY && state.frog.y >= MEDIAN_Y) {
			state.score = Math.max(0, state.score - 2);
		}

		checkRoadHits();
		checkHome();
		updateHud();
	}

	function paintLane(row) {
		const y = row * TILE;
		if (row === HOME_Y || row === MEDIAN_Y || row === START_Y) {
			drawRowRect(y, palette.grass);
			drawRowPattern(y, palette.grassAccent, 6);
			return;
		}

		if (RIVER_ROWS.includes(row)) {
			drawRowRect(y, palette.river);
			drawRowPattern(y, palette.riverAccent, 5);
			return;
		}

		if (ROAD_ROWS.includes(row)) {
			drawRowRect(y, palette.road);
			if (row % 2 === 0) {
				for (let stripe = 0; stripe < COLS; stripe += 2) {
					pixelRect(stripe * TILE + 8, y + TILE / 2 - 2, TILE - 16, 4, palette.roadStripe);
				}
			}
			return;
		}

		drawRowRect(y, palette.bgDark);
	}

	function drawRowRect(y, color) {
		pixelRect(0, y, COLS * TILE, TILE, color);
	}

	function drawRowPattern(y, color, size) {
		for (let col = 0; col < COLS; col += 1) {
			const x = col * TILE + ((col + y / TILE) % 2 ? 4 : 16);
			pixelRect(x, y + 6, size, size, color);
			pixelRect(x + 12, y + 22, size, size, color);
		}
	}

	function drawHomes() {
		for (let index = 0; index < state.homeXs.length; index += 1) {
			const homeX = state.homeXs[index] * TILE;
			pixelRect(homeX - 14, 5, 28, 30, palette.home);
			pixelRect(homeX - 10, 9, 20, 22, '#173122');
			if (state.homes[index]) {
				pixelRect(homeX - 10, 9, 20, 22, palette.homeFill);
				pixelRect(homeX - 6, 13, 12, 14, '#388f56');
			}
		}
	}

	function drawLaneObjects() {
		for (const lane of state.lanes) {
			for (const item of lane.objects) {
				const y = lane.row * TILE;
				const x = item.x * TILE;
				const width = item.len * TILE;
				if (item.type === 'log') {
					drawLog(x, y, width);
					continue;
				}
				if (item.type === 'turtle') {
					drawTurtle(x, y, width);
					continue;
				}
				drawCar(x, y, width, item.type);
			}
		}
	}

	function drawLog(x, y, width) {
		pixelRect(x, y + 7, width, 26, palette.log);
		// Top accent stripe
		pixelRect(x + 3, y + 10, width - 6, 3, palette.logAccent);
		// Mid stripe
		pixelRect(x + 4, y + 17, width - 8, 2, palette.logAccent);
		// Bottom dark stripe
		pixelRect(x + 2, y + 24, width - 4, 2, '#5a4420');
		// Knot details every ~20px
		for (let i = 0; i < Math.ceil(width / 20); i++) {
			const knotX = x + 8 + i * 18;
			if (knotX < x + width - 4) {
				pixelRect(knotX, y + 14, 4, 8, '#6f4529');
			}
		}
	}

	function drawTurtle(x, y, width) {
		// Body
		pixelRect(x, y + 8, width, 24, palette.turtle);
		// Shell segments with pattern
		for (let i = 0; i < Math.max(1, Math.floor(width / 20)); i += 1) {
			const segX = x + 4 + i * 18;
			// Shell base
			pixelRect(segX, y + 12, 12, 16, palette.turtleShell);
			// Shell pattern - lighter center
			pixelRect(segX + 1, y + 13, 10, 3, '#38b0a9');
			pixelRect(segX + 2, y + 16, 8, 3, '#38b0a9');
			pixelRect(segX + 3, y + 19, 6, 3, '#206966');
		}
		// Flippers on sides
		pixelRect(x - 2, y + 14, 2, 8, palette.turtle);
		pixelRect(x + width, y + 14, 2, 8, palette.turtle);
	}

	function drawCar(x, y, width, type) {
		const carColorMap = {
			carA: palette.carA,
			carB: palette.carB,
			carC: palette.carC,
			carD: palette.carD,
		};
		const color = carColorMap[type] || palette.carA;
		// Body
		pixelRect(x, y + 9, width, 22, color);
		// Windshield/windows
		pixelRect(x + 6, y + 11, width - 12, 5, '#ffffff44');
		pixelRect(x + width - 8, y + 13, 4, 3, '#555555');
		// Headlights
		pixelRect(x + 1, y + 13, 3, 3, '#ffff99');
		pixelRect(x + width - 4, y + 13, 3, 3, '#ffff99');
		// Bumper stripe
		pixelRect(x + 2, y + 29, width - 4, 1, '#ffffff88');
		// Wheels
		pixelRect(x + 4, y + 28, 6, 4, '#202028');
		pixelRect(x + width - 10, y + 28, 6, 4, '#202028');
		// Wheel details
		pixelRect(x + 5, y + 29, 4, 2, '#454545');
		pixelRect(x + width - 9, y + 29, 4, 2, '#454545');
	}

	function drawFrog() {
		const x = state.frog.x * TILE;
		const y = state.frog.y * TILE;
		// Body
		pixelRect(x + 8, y + 10, 24, 22, palette.frog);
		// Head bumps
		pixelRect(x + 12, y + 6, 7, 6, palette.frog);
		pixelRect(x + 21, y + 6, 7, 6, palette.frog);
		// Eyes
		pixelRect(x + 13, y + 7, 3, 3, palette.frogEye);
		pixelRect(x + 23, y + 7, 3, 3, palette.frogEye);
		// Eye shine
		pixelRect(x + 14, y + 7, 1, 1, '#ffffff88');
		pixelRect(x + 24, y + 7, 1, 1, '#ffffff88');
		// Mouth
		pixelRect(x + 16, y + 17, 8, 2, '#0f4a2a');
		// Feet/legs - back legs
		pixelRect(x + 10, y + 28, 5, 3, palette.frog);
		pixelRect(x + 25, y + 28, 5, 3, palette.frog);
		// Carrying speed indicator
		if (state.carrySpeed !== 0) {
			const dir = state.carrySpeed > 0 ? 1 : -1;
			pixelRect(x + 16 + dir * 7, y + 20, 6, 4, '#ffffff55');
		}
	}

	function drawPixelText(text, x, y) {
		ctx.fillStyle = palette.textShadow;
		ctx.fillText(text, x + 2, y + 2);
		ctx.fillStyle = '#edf6e8';
		ctx.fillText(text, x, y);
	}

	function pixelRect(x, y, w, h, color) {
		ctx.fillStyle = color;
		ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
	}

	function draw() {
		ctx.imageSmoothingEnabled = false;
		pixelRect(0, 0, COLS * TILE, ROWS * TILE, palette.bgDark);

		for (let row = 0; row < ROWS; row += 1) {
			paintLane(row);
		}

		drawHomes();
		drawLaneObjects();
		drawFrog();

		ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
		drawPixelText(`L${state.level}  SCORE ${Math.floor(state.score)}`, 12, 22);
	}

	function update(dt) {
		if (state.phase !== 'active') return;

		state.respawnLock = Math.max(0, state.respawnLock - dt);
		state.timer -= dt;
		if (state.timer <= 0) {
			state.timer = 0;
			loseLife('Time ran out.');
			updateHud();
			return;
		}

		moveLanes(dt);
		applyRiverCarry(dt);
		clampFrogX();
		checkRoadHits();
		checkHome();
		updateHud();
	}

	function onKeyDown(event) {
		const key = event.key.toLowerCase();

		if (key === 'p') {
			pauseGame();
			return;
		}
		if (key === 'r') {
			restartGame();
			return;
		}

		if (state.phase === 'idle' || state.phase === 'gameover') {
			startGame();
		}
		if (state.phase === 'paused') return;

		if (key === 'arrowup' || key === 'w') {
			event.preventDefault();
			moveFrog(0, -1);
		} else if (key === 'arrowdown' || key === 's') {
			event.preventDefault();
			moveFrog(0, 1);
		} else if (key === 'arrowleft' || key === 'a') {
			event.preventDefault();
			moveFrog(-1, 0);
		} else if (key === 'arrowright' || key === 'd') {
			event.preventDefault();
			moveFrog(1, 0);
		}
	}

	function onTouchAction(action) {
		if (state.phase === 'idle' || state.phase === 'gameover') {
			startGame();
		}
		if (state.phase !== 'active') return;

		if (action === 'up') moveFrog(0, -1);
		if (action === 'down') moveFrog(0, 1);
		if (action === 'left') moveFrog(-1, 0);
		if (action === 'right') moveFrog(1, 0);
	}

	function frame(timestamp) {
		if (!state.lastTick) state.lastTick = timestamp;
		const dt = Math.min(0.04, (timestamp - state.lastTick) / 1000);
		state.lastTick = timestamp;

		update(dt);
		draw();
		requestAnimationFrame(frame);
	}

	function wireEvents() {
		window.addEventListener('keydown', onKeyDown);
		startButton?.addEventListener('click', () => {
			if (state.phase === 'paused') {
				pauseGame();
			} else {
				startGame();
			}
		});
		restartButton?.addEventListener('click', restartGame);
		pauseButton?.addEventListener('click', pauseGame);

		touchButtons.forEach((button) => {
			button.addEventListener('click', () => {
				onTouchAction(String(button.dataset.action || ''));
			});
		});
	}

	function init() {
		canvas.width = COLS * TILE;
		canvas.height = ROWS * TILE;
		state.lanes = cloneLanes();
		updateHud();
		updateOverlay();
		setStatus('Cross traffic, ride logs, and fill every home slot.', '');
		wireEvents();
		requestAnimationFrame(frame);
	}

	init();
})();
