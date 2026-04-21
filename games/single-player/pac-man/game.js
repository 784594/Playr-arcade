(function () {
	const root = document.getElementById('gameRoot');
	const canvas = document.getElementById('pacmanCanvas');
	const ctx = canvas.getContext('2d');

	const startButton = document.getElementById('startButton');
	const pauseButton = document.getElementById('pauseButton');
	const restartButton = document.getElementById('restartButton');
	const menuOverlay = document.getElementById('menuOverlay');
	const menuTitle = document.getElementById('menuTitle');
	const menuText = document.getElementById('menuText');
	const menuActionButton = document.getElementById('menuActionButton');
	const boardMeta = document.getElementById('boardMeta');
	const gameStatus = document.getElementById('gameStatus');
	const scoreEl = document.getElementById('score');
	const livesEl = document.getElementById('lives');
	const levelEl = document.getElementById('level');
	const bestScoreEl = document.getElementById('bestScore');
	const sideScoreEl = document.getElementById('sideScore');
	const sideBestEl = document.getElementById('sideBest');
	const sideStateEl = document.getElementById('sideState');
	const padPauseButton = document.getElementById('padPauseButton');
	const directionButtons = Array.from(document.querySelectorAll('[data-direction]'));

	const BEST_KEY = 'playr.pacman.bestScore.v1';
	const BOARD_COLS = 21;
	const BOARD_ROWS = 21;
	const TUNNEL_ROW = 10;
	const START_LIVES = 5;
	const POWER_DURATION = 6500;
	const TRANSITION_MS = 1200;
	const DEATH_ANIM_MS = 900;

	const MAZE_LAYOUT = [
		'#####################',
		'#o........#........o#',
		'#.###.###.#.###.###.#',
		'#...................#',
		'#.###.#.#####.#.###.#',
		'#.....#...#...#.....#',
		'#####.###.#.###.#####',
		'#...#.....#.....#...#',
		'#.#.......===.......#',
		'#.#.#...hhhhh...#.#.#',
		'.###....hhhhh....###.',
		'#.#.#...hhhhh...#.#.#',
		'#.#.#.###.#.###.#.#.#',
		'#...#.....#.....#...#',
		'###.#.###.#.###.#.###',
		'#.....#...#...#.....#',
		'#.###.#.#####.#.###.#',
		'#o..#...........#..o#',
		'###.#.#.#####.#.#.###',
		'#.....#...#...#.....#',
		'#####################',
	];

	const MODE_SCHEDULE = [
		{ name: 'scatter', duration: 7000 },
		{ name: 'chase', duration: 20000 },
		{ name: 'scatter', duration: 7000 },
		{ name: 'chase', duration: 20000 },
		{ name: 'scatter', duration: 5000 },
		{ name: 'chase', duration: Infinity },
	];

	const GHOST_CONFIGS = [
		{ id: 'blinky', name: 'Blinky', color: '#ff5f6c', scatter: { x: 19, y: 1 }, spawn: { x: 10, y: 7 }, releaseDelay: 0, startOutside: true },
		{ id: 'pinky', name: 'Pinky', color: '#ff78d2', scatter: { x: 1, y: 1 }, spawn: { x: 9, y: 10 }, releaseDelay: 1200, startOutside: false },
		{ id: 'inky', name: 'Inky', color: '#79f0ff', scatter: { x: 19, y: 19 }, spawn: { x: 10, y: 10 }, releaseDelay: 2600, startOutside: false },
		{ id: 'clyde', name: 'Clyde', color: '#ffb35c', scatter: { x: 1, y: 19 }, spawn: { x: 11, y: 10 }, releaseDelay: 4200, startOutside: false },
	];

	const GHOST_HOUSE_GATE = { x: 10, y: 8 };

	const state = {
		started: false,
		paused: false,
		gameOver: false,
		level: 1,
		score: 0,
		lives: START_LIVES,
		bestScore: loadBestScore(),
		board: [],
		pelletCount: 0,
		modeIndex: 0,
		modeRemaining: MODE_SCHEDULE[0].duration,
		frightenedMs: 0,
		frightenedCombo: 0,
		transitionType: null,
		transitionMs: 0,
		deathAnimMs: 0,
		invulnerableMs: 0,
		statusText: '',
		statusTimer: 0,
		animTime: 0,
		tileSize: 24,
		pacman: null,
		ghosts: [],
		lastFrame: 0,
	};

	function loadBestScore() {
		try {
			const parsed = JSON.parse(localStorage.getItem(BEST_KEY) || '0');
			return Number.isFinite(parsed) ? parsed : 0;
		} catch {
			return 0;
		}
	}

	function saveBestScore() {
		localStorage.setItem(BEST_KEY, String(state.bestScore));
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function keyFor(x, y) {
		return `${x}:${y}`;
	}

	function isOpposite(a, b) {
		return a.x + b.x === 0 && a.y + b.y === 0;
	}

	const DIRECTIONS = [
		{ name: 'up', x: 0, y: -1 },
		{ name: 'left', x: -1, y: 0 },
		{ name: 'down', x: 0, y: 1 },
		{ name: 'right', x: 1, y: 0 },
	];

	function directionFromName(name) {
		return DIRECTIONS.find((direction) => direction.name === name) || null;
	}

	function stepSpeedMs() {
		return Math.max(88, 132 - (state.level - 1) * 3);
	}

	function ghostSpeedMs(ghost) {
		if (ghost.state === 'eyes') {
			return Math.max(84, 112 - (state.level - 1));
		}

		if (ghost.state === 'frightened') {
			return Math.max(240, 310 - state.level * 3);
		}

		if (ghost.state === 'house') {
			return Math.max(138, 172 - state.level);
		}

		return Math.max(114, 158 - (state.level - 1) * 2);
	}

	function setStatus(text, duration = 0) {
		state.statusText = text;
		state.statusTimer = duration;
		gameStatus.textContent = text;
	}

	function updateBestScore(score) {
		if (score <= state.bestScore) return;
		state.bestScore = score;
		saveBestScore();
	}

	function isTunnelCell(x, y) {
		return y === TUNNEL_ROW && (x === 0 || x === BOARD_COLS - 1);
	}

	function buildBoard() {
		const board = Array.from({ length: BOARD_ROWS }, (_, y) =>
			Array.from({ length: BOARD_COLS }, (_, x) => ({
				x,
				y,
				wall: false,
				gate: false,
				house: false,
				pellet: true,
				power: false,
			})),
		);

		const setWall = (x, y) => {
			if (!board[y] || !board[y][x]) return;
			board[y][x].wall = true;
			board[y][x].gate = false;
			board[y][x].pellet = false;
			board[y][x].power = false;
		};

		const setOpen = (x, y, pellet = true) => {
			if (!board[y] || !board[y][x]) return;
			board[y][x].wall = false;
			board[y][x].gate = false;
			board[y][x].house = false;
			board[y][x].pellet = pellet;
			board[y][x].power = false;
		};

		const setGate = (x, y) => {
			if (!board[y] || !board[y][x]) return;
			board[y][x].wall = false;
			board[y][x].gate = true;
			board[y][x].house = false;
			board[y][x].pellet = false;
			board[y][x].power = false;
		};

		const setHouse = (x, y) => {
			if (!board[y] || !board[y][x]) return;
			board[y][x].wall = false;
			board[y][x].gate = false;
			board[y][x].house = true;
			board[y][x].pellet = false;
			board[y][x].power = false;
		};

		for (let y = 0; y < BOARD_ROWS; y += 1) {
			const row = MAZE_LAYOUT[y] || '';
			for (let x = 0; x < BOARD_COLS; x += 1) {
				const token = row[x] || '#';
				if (token === '#') {
					setWall(x, y);
					continue;
				}

				if (token === '=') {
					setGate(x, y);
					continue;
				}

				if (token === 'h') {
					setHouse(x, y);
					continue;
				}

				if (token === 'o') {
					setOpen(x, y, false);
					board[y][x].power = true;
					continue;
				}

				if (token === '.') {
					setOpen(x, y, true);
					continue;
				}

				setOpen(x, y, false);
			}
		}

		setOpen(0, TUNNEL_ROW, false);
		setOpen(BOARD_COLS - 1, TUNNEL_ROW, false);

		const pacmanSpawn = { x: 10, y: 15 };
		const protectedCells = [pacmanSpawn, { x: GHOST_HOUSE_GATE.x, y: GHOST_HOUSE_GATE.y }];

		for (const cell of protectedCells) {
			setOpen(cell.x, cell.y, false);
		}

		let pellets = 0;
		for (const row of board) {
			for (const cell of row) {
				if (cell.wall || cell.gate || cell.house) continue;
				if (cell.pellet || cell.power) pellets += 1;
			}
		}

		return { board, pellets };
	}

	function createPacman() {
		return {
			x: 10,
			y: 15,
			fromX: 10,
			fromY: 15,
			dir: { x: -1, y: 0 },
			queuedDir: { x: -1, y: 0 },
			cooldown: 0,
			speedMs: stepSpeedMs(),
		};
	}

	function createGhosts() {
		return GHOST_CONFIGS.map((config, index) => ({
			...config,
			index,
			x: config.spawn.x,
			y: config.spawn.y,
			fromX: config.spawn.x,
			fromY: config.spawn.y,
			dir: config.startOutside ? { x: -1, y: 0 } : { x: 0, y: -1 },
			state: config.startOutside ? 'scatter' : 'house',
			released: Boolean(config.startOutside),
			releaseDelay: config.releaseDelay,
			cooldown: 0,
			speedMs: 0,
			eatenCount: 0,
		}));
	}

	function resetActors() {
		state.pacman = createPacman();
		state.ghosts = createGhosts();
		state.invulnerableMs = 1200;
		state.modeIndex = 0;
		state.modeRemaining = MODE_SCHEDULE[0].duration;
		state.frightenedMs = 0;
		state.frightenedCombo = 0;
		state.transitionType = null;
		state.transitionMs = 0;
		state.deathAnimMs = 0;
		applySpeeds();
		state.pacman.cooldown = state.pacman.speedMs;
		for (const ghost of state.ghosts) {
			ghost.cooldown = ghost.speedMs;
		}
	}

	function setupLevel() {
		const { board, pellets } = buildBoard();
		state.board = board;
		state.pelletCount = pellets;
		resetActors();
		updateHud();
		resizeCanvas();
		render();
	}

	function startNewRun() {
		state.started = true;
		state.paused = false;
		state.gameOver = false;
		state.level = 1;
		state.score = 0;
		state.lives = START_LIVES;
		state.statusText = '';
		state.statusTimer = 0;
		setupLevel();
		hideMenuOverlay();
		setStatus('Maze loaded. Eat every pellet.', 1600);
		updateHud();
	}

	function restartRun() {
		startNewRun();
	}

	function hideMenuOverlay() {
		menuOverlay.hidden = true;
		menuTitle.textContent = 'Press Start';
		menuText.textContent = 'Use the arrow keys or WASD to move. Eat every pellet, grab power pellets, and keep the ghosts off your trail.';
		menuActionButton.textContent = 'Start Run';
	}

	function showMenuOverlay(title, text, actionLabel) {
		menuOverlay.hidden = false;
		menuTitle.textContent = title;
		menuText.textContent = text;
		menuActionButton.textContent = actionLabel;
	}

	function togglePause() {
		if (!state.started || state.gameOver || state.transitionMs > 0) return;
		state.paused = !state.paused;
		pauseButton.textContent = state.paused ? 'Resume' : 'Pause';
		padPauseButton.textContent = state.paused ? 'Resume' : 'Pause';
		setStatus(state.paused ? 'Paused' : '', 0);
		updateHud();
	}

	function updateHud() {
		scoreEl.textContent = String(state.score);
		livesEl.textContent = String(state.lives);
		levelEl.textContent = String(state.level);
		bestScoreEl.textContent = String(state.bestScore);
		sideScoreEl.textContent = String(state.score);
		sideBestEl.textContent = String(state.bestScore);
		sideStateEl.textContent = state.gameOver ? 'Game Over' : state.paused ? 'Paused' : state.frightenedMs > 0 ? 'Frightened' : state.started ? 'Running' : '';
		boardMeta.textContent = `${BOARD_COLS} x ${BOARD_ROWS} maze`;
		startButton.textContent = state.gameOver || !state.started ? 'Start' : 'New Game';
		menuActionButton.textContent = state.gameOver ? 'Play Again' : 'Start Run';
		pauseButton.disabled = !state.started || state.gameOver || state.transitionMs > 0;
		pauseButton.textContent = state.paused ? 'Resume' : 'Pause';
		padPauseButton.textContent = state.paused ? 'Resume' : 'Pause';

		if (!state.started) {
			showMenuOverlay(
				'Press Start',
				'Use the arrow keys or WASD to move. Eat every pellet, grab power pellets, and keep the ghosts off your trail.',
				'Start Run',
			);
		} else if (state.gameOver) {
			showMenuOverlay(
				'Game Over',
				`Final score: ${state.score}. Press Play Again to restart the maze and try for a higher run.`,
				'Play Again',
			);
		} else {
			hideMenuOverlay();
		}

		if (state.statusTimer <= 0 && state.started && !state.paused && !state.gameOver) {
			gameStatus.textContent = '';
		} else if (state.statusTimer <= 0 && !state.started) {
			gameStatus.textContent = 'Press Start to begin.';
		}
	}

	function applySpeeds() {
		if (state.pacman) {
			state.pacman.speedMs = stepSpeedMs();
		}

		for (const ghost of state.ghosts) {
			ghost.speedMs = ghostSpeedMs(ghost);
		}
	}

	function normalizePosition(x, y) {
		if (y === TUNNEL_ROW) {
			if (x < 0) return { x: BOARD_COLS - 1, y };
			if (x >= BOARD_COLS) return { x: 0, y };
		}

		return { x, y };
	}

	function cellAt(x, y) {
		return state.board[y] && state.board[y][x] ? state.board[y][x] : null;
	}

	function canEnterCell(x, y, type, entity = null) {
		if (x < 0 || x >= BOARD_COLS || y < 0 || y >= BOARD_ROWS) return false;

		const cell = cellAt(x, y);
		if (!cell) return false;
		if (cell.wall) return false;
		if (cell.house && type === 'pacman') return false;
		if (cell.gate && type === 'pacman') return false;

		if (type === 'ghost') {
			const canUseHouse = !entity || entity.state === 'house' || entity.state === 'eyes' || !entity.released;
			if (cell.house && !canUseHouse) return false;
			if (cell.gate && !canUseHouse) return false;
		}

		return true;
	}

	function isGhostAt(x, y, exceptGhost = null) {
		for (const ghost of state.ghosts) {
			if (ghost === exceptGhost) continue;
			if (ghost.x === x && ghost.y === y) return true;
		}
		return false;
	}

	function canGhostMoveTo(ghost, x, y) {
		if (!canEnterCell(x, y, 'ghost', ghost)) return false;
		if (isGhostAt(x, y, ghost)) return false;
		return true;
	}

	function validDirections(entity, type) {
		return DIRECTIONS.filter((direction) => {
			const next = normalizePosition(entity.x + direction.x, entity.y + direction.y);
			return canEnterCell(next.x, next.y, type, entity);
		});
	}

	function projectAhead(position, direction, tiles) {
		let x = position.x;
		let y = position.y;

		for (let i = 0; i < tiles; i += 1) {
			const next = normalizePosition(x + direction.x, y + direction.y);
			x = next.x;
			y = next.y;
		}

		return { x, y };
	}

	function computeDistanceMap(target, type, entity = null) {
		const dist = Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(Infinity));
		const queue = [];
		let head = 0;

		if (!canEnterCell(target.x, target.y, type, entity)) {
			return dist;
		}

		dist[target.y][target.x] = 0;
		queue.push(target);

		while (head < queue.length) {
			const current = queue[head += 1 - 1];
			const currentDistance = dist[current.y][current.x];

			for (const direction of DIRECTIONS) {
				const next = normalizePosition(current.x + direction.x, current.y + direction.y);
				if (!canEnterCell(next.x, next.y, type, entity)) continue;
				if (dist[next.y][next.x] <= currentDistance + 1) continue;
				dist[next.y][next.x] = currentDistance + 1;
				queue.push(next);
			}
			head += 1;
		}

		return dist;
	}

	function bestDirectionFromDistance(entity, type, target) {
		const options = validDirections(entity, type);
		if (!options.length) return null;

		let choices = options;
		if (options.length > 1) {
			const nonReverse = options.filter((direction) => !isOpposite(entity.dir, direction));
			if (nonReverse.length) choices = nonReverse;
		}

		const distances = computeDistanceMap(target, type, entity);
		let best = choices[0];
		let bestDistance = Infinity;

		for (const direction of choices) {
			const next = normalizePosition(entity.x + direction.x, entity.y + direction.y);
			const distance = distances[next.y][next.x];
			if (distance < bestDistance) {
				bestDistance = distance;
				best = direction;
			}
		}

		if (!Number.isFinite(bestDistance)) {
			return choices[Math.floor(Math.random() * choices.length)];
		}

		return best;
	}

	function randomDirection(entity, type) {
		const options = validDirections(entity, type);
		if (!options.length) return null;

		const nonReverse = options.filter((direction) => !isOpposite(entity.dir, direction));
		const pool = nonReverse.length ? nonReverse : options;
		return pool[Math.floor(Math.random() * pool.length)];
	}

	function getCurrentMode() {
		return MODE_SCHEDULE[state.modeIndex].name;
	}

	function targetForGhost(ghost) {
		const currentMode = getCurrentMode();

		if (ghost.state === 'eyes') {
			return { x: ghost.spawn.x, y: ghost.spawn.y };
		}

		if (!ghost.released) {
			return { x: GHOST_HOUSE_GATE.x, y: GHOST_HOUSE_GATE.y };
		}

		if (ghost.state === 'frightened') {
			return { x: ghost.scatter.x, y: ghost.scatter.y };
		}

		if (currentMode === 'scatter') {
			return { x: ghost.scatter.x, y: ghost.scatter.y };
		}

		const pacman = state.pacman;

		if (ghost.id === 'blinky') {
			return { x: pacman.x, y: pacman.y };
		}

		if (ghost.id === 'pinky') {
			return projectAhead(pacman, pacman.dir, 4);
		}

		if (ghost.id === 'inky') {
			const ahead = projectAhead(pacman, pacman.dir, 2);
			const blinky = state.ghosts[0];
			const vectorX = ahead.x - blinky.x;
			const vectorY = ahead.y - blinky.y;
			return {
				x: clamp(ahead.x + vectorX, 0, BOARD_COLS - 1),
				y: clamp(ahead.y + vectorY, 0, BOARD_ROWS - 1),
			};
		}

		const distance = Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y);
		if (distance <= 6) {
			return { x: ghost.scatter.x, y: ghost.scatter.y };
		}

		return { x: pacman.x, y: pacman.y };
	}

	function movePacman() {
		applySpeeds();
		state.pacman.cooldown -= frameDeltaMs;

		while (state.pacman.cooldown <= 0) {
			const preferred = state.pacman.queuedDir || state.pacman.dir;
			const primaryNext = normalizePosition(state.pacman.x + preferred.x, state.pacman.y + preferred.y);
			const canTurn = canEnterCell(primaryNext.x, primaryNext.y, 'pacman');

			if (canTurn) {
				state.pacman.dir = preferred;
			} else {
				const forwardNext = normalizePosition(state.pacman.x + state.pacman.dir.x, state.pacman.y + state.pacman.dir.y);
				if (!canEnterCell(forwardNext.x, forwardNext.y, 'pacman')) {
					state.pacman.cooldown = 0;
					return;
				}
			}

			const next = normalizePosition(state.pacman.x + state.pacman.dir.x, state.pacman.y + state.pacman.dir.y);
			if (!canEnterCell(next.x, next.y, 'pacman')) {
				state.pacman.cooldown = 0;
				return;
			}

			state.pacman.fromX = state.pacman.x;
			state.pacman.fromY = state.pacman.y;
			state.pacman.x = next.x;
			state.pacman.y = next.y;
			state.pacman.cooldown += state.pacman.speedMs;

			consumeTile(next.x, next.y);
			if (checkCollisions()) return;
		}
	}

	function consumeTile(x, y) {
		const cell = cellAt(x, y);
		if (!cell) return;

		if (cell.pellet) {
			cell.pellet = false;
			state.score += 10;
			state.pelletCount -= 1;
			updateBestScore(state.score);
			setStatus('Dot eaten.', 700);
		}

		if (cell.power) {
			cell.power = false;
			state.score += 50;
			state.pelletCount -= 1;
			state.frightenedMs = POWER_DURATION;
			state.frightenedCombo = 0;
			for (const ghost of state.ghosts) {
				if (ghost.state !== 'eyes') {
					ghost.state = 'frightened';
				}
			}
			updateBestScore(state.score);
			setStatus('Power pellet! Ghosts are frightened.', 1100);
		}

		if (state.pelletCount <= 0) {
			triggerLevelClear();
		}
	}

	function triggerLevelClear() {
		if (state.transitionType) return;
		state.transitionType = 'level';
		state.transitionMs = TRANSITION_MS;
		state.paused = true;
		setStatus(`Level ${state.level} cleared!`, 0);
		updateHud();
	}

	function triggerLifeLoss() {
		if (state.transitionType || state.gameOver) return;
		state.transitionType = 'death';
		state.transitionMs = TRANSITION_MS;
		state.deathAnimMs = DEATH_ANIM_MS;
		state.paused = true;
		setStatus('Caught! Resetting the maze.', 0);
		updateHud();
	}

	function applyTransition() {
		const transition = state.transitionType;
		state.transitionType = null;
		state.transitionMs = 0;
		state.paused = false;

		if (transition === 'death') {
			state.lives -= 1;
			state.deathAnimMs = 0;
			if (state.lives <= 0) {
				endGame();
				return;
			}

			resetActors();
			setStatus('Life lost. Back to the maze.', 1100);
			updateHud();
			return;
		}

		if (transition === 'level') {
			state.level += 1;
			setupLevel();
			setStatus(`Level ${state.level}`, 1200);
			updateHud();
		}
	}

	function endGame() {
		state.gameOver = true;
		state.started = true;
		state.paused = false;
		state.transitionType = null;
		state.transitionMs = 0;
		updateBestScore(state.score);
		setStatus('Game over.', 0);
		updateHud();
	}

	function moveGhost(ghost) {
		ghost.speedMs = ghostSpeedMs(ghost);
		ghost.cooldown -= frameDeltaMs;

		while (ghost.cooldown <= 0) {
			if (ghost.state === 'eyes' && ghost.x === ghost.spawn.x && ghost.y === ghost.spawn.y) {
				ghost.state = getCurrentMode();
				ghost.released = true;
				ghost.releaseDelay = 0;
			}

			if (!ghost.released) {
				if (ghost.releaseDelay > 0) {
					ghost.releaseDelay = Math.max(0, ghost.releaseDelay - frameDeltaMs);
				}

				if (ghost.x === GHOST_HOUSE_GATE.x && ghost.y === GHOST_HOUSE_GATE.y && ghost.releaseDelay <= 0) {
					ghost.released = true;
					ghost.state = getCurrentMode();
				} else {
					const target = ghost.releaseDelay > 0
						? { x: ghost.spawn.x, y: ghost.spawn.y }
						: { x: GHOST_HOUSE_GATE.x, y: GHOST_HOUSE_GATE.y };
					const direction = bestDirectionFromDistance(ghost, 'ghost', target) || randomDirection(ghost, 'ghost');
					if (!direction) {
						ghost.cooldown = 24;
						return;
					}

					ghost.dir = direction;
					const next = normalizePosition(ghost.x + direction.x, ghost.y + direction.y);
					if (!canGhostMoveTo(ghost, next.x, next.y)) {
						ghost.cooldown = 24;
						return;
					}

					ghost.fromX = ghost.x;
					ghost.fromY = ghost.y;
					ghost.x = next.x;
					ghost.y = next.y;
					ghost.cooldown += ghost.speedMs;
					if (checkCollisions()) return;
					continue;
				}
			}

			if (ghost.state === 'frightened') {
				const direction = randomDirection(ghost, 'ghost');
				if (!direction) {
					ghost.cooldown = 24;
					return;
				}

				ghost.dir = direction;
			} else if (ghost.state === 'eyes') {
				const target = { x: ghost.spawn.x, y: ghost.spawn.y };
				const direction = bestDirectionFromDistance(ghost, 'ghost', target) || randomDirection(ghost, 'ghost');
				if (!direction) {
					ghost.cooldown = 24;
					return;
				}

				ghost.dir = direction;
			} else {
				const target = targetForGhost(ghost);
				const direction = bestDirectionFromDistance(ghost, 'ghost', target) || randomDirection(ghost, 'ghost');
				if (!direction) {
					ghost.cooldown = 24;
					return;
				}

				ghost.dir = direction;
			}

			const next = normalizePosition(ghost.x + ghost.dir.x, ghost.y + ghost.dir.y);
			if (!canGhostMoveTo(ghost, next.x, next.y)) {
				ghost.cooldown = 24;
				return;
			}

			ghost.fromX = ghost.x;
			ghost.fromY = ghost.y;
			ghost.x = next.x;
			ghost.y = next.y;
			ghost.cooldown += ghost.speedMs;

			if (ghost.state === 'eyes' && ghost.x === ghost.spawn.x && ghost.y === ghost.spawn.y) {
				ghost.state = getCurrentMode();
				ghost.released = true;
			}

			if (
				ghost.state !== 'eyes'
				&& !ghost.released
				&& ghost.x === GHOST_HOUSE_GATE.x
				&& ghost.y === GHOST_HOUSE_GATE.y
				&& ghost.releaseDelay <= 0
			) {
				ghost.released = true;
				ghost.state = getCurrentMode();
			}

			if (checkCollisions()) return;
		}
	}

	function eatGhost(ghost) {
		ghost.x = ghost.spawn.x;
		ghost.y = ghost.spawn.y;
		ghost.fromX = ghost.spawn.x;
		ghost.fromY = ghost.spawn.y;
		ghost.state = 'house';
		ghost.released = false;
		ghost.releaseDelay = 900;
		ghost.dir = { x: 0, y: -1 };
		ghost.cooldown = 0;
		ghost.eatenCount += 1;
		const scoreAward = 200 * (2 ** state.frightenedCombo);
		state.score += scoreAward;
		state.frightenedCombo += 1;
		updateBestScore(state.score);
		setStatus(`Ghost eaten +${scoreAward}`, 800);
		updateHud();
	}

	function checkCollisions() {
		for (const ghost of state.ghosts) {
			if (ghost.x !== state.pacman.x || ghost.y !== state.pacman.y) continue;
			if (ghost.state === 'eyes') continue;

			if (ghost.state === 'frightened') {
				eatGhost(ghost);
				continue;
			}

			if (state.invulnerableMs > 0) return true;

			triggerLifeLoss();
			return true;
		}

		return false;
	}

	function updateStatusTimer(dt) {
		if (state.statusTimer <= 0) return;
		state.statusTimer = Math.max(0, state.statusTimer - dt);
		if (state.statusTimer === 0 && state.started && !state.paused && !state.gameOver) {
			gameStatus.textContent = '';
		}
	}

	function updateTimers(dt) {
		state.animTime += dt;
		updateStatusTimer(dt);

		if (state.invulnerableMs > 0) {
			state.invulnerableMs = Math.max(0, state.invulnerableMs - dt);
		}

		if (state.deathAnimMs > 0) {
			state.deathAnimMs = Math.max(0, state.deathAnimMs - dt);
		}

		if (state.transitionMs > 0) {
			state.transitionMs = Math.max(0, state.transitionMs - dt);
			if (state.transitionMs === 0) {
				applyTransition();
			}
			return;
		}

		if (state.frightenedMs > 0) {
			state.frightenedMs = Math.max(0, state.frightenedMs - dt);
			if (state.frightenedMs === 0) {
				state.frightenedCombo = 0;
				for (const ghost of state.ghosts) {
					if (ghost.state === 'frightened') {
						ghost.state = getCurrentMode();
					}
				}
			}
		} else {
			state.modeRemaining = Math.max(0, state.modeRemaining - dt);
			if (state.modeRemaining === 0 && state.modeIndex < MODE_SCHEDULE.length - 1) {
				state.modeIndex += 1;
				state.modeRemaining = MODE_SCHEDULE[state.modeIndex].duration;
				for (const ghost of state.ghosts) {
					if (ghost.state === 'scatter' || ghost.state === 'chase') {
						ghost.state = getCurrentMode();
					}
				}
			}
		}
	}

	function updateGame(dt) {
		if (!state.started || state.paused || state.gameOver) {
			updateHud();
			render();
			return;
		}

		frameDeltaMs = dt;
		applySpeeds();
		updateTimers(dt);

		if (state.transitionMs > 0) {
			updateHud();
			render();
			return;
		}

		movePacman();
		for (const ghost of state.ghosts) {
			moveGhost(ghost);
			if (state.transitionMs > 0 || state.gameOver) break;
		}

		updateHud();
		render();
	}

	function drawMazeWalls() {
		const isWallCell = (x, y) => {
			const cell = cellAt(x, y);
			return Boolean(cell && cell.wall);
		};

		ctx.save();
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = '#1a42ff';
		ctx.shadowColor = 'rgba(26, 66, 255, 0.42)';
		ctx.shadowBlur = 0.12;
		ctx.lineWidth = 0.12;

		for (let y = 0; y < BOARD_ROWS; y += 1) {
			for (let x = 0; x < BOARD_COLS; x += 1) {
				if (!isWallCell(x, y)) continue;

				if (!isWallCell(x, y - 1)) {
					ctx.beginPath();
					ctx.moveTo(x + 0.08, y + 0.08);
					ctx.lineTo(x + 0.92, y + 0.08);
					ctx.stroke();
				}

				if (!isWallCell(x + 1, y)) {
					ctx.beginPath();
					ctx.moveTo(x + 0.92, y + 0.08);
					ctx.lineTo(x + 0.92, y + 0.92);
					ctx.stroke();
				}

				if (!isWallCell(x, y + 1)) {
					ctx.beginPath();
					ctx.moveTo(x + 0.08, y + 0.92);
					ctx.lineTo(x + 0.92, y + 0.92);
					ctx.stroke();
				}

				if (!isWallCell(x - 1, y)) {
					ctx.beginPath();
					ctx.moveTo(x + 0.08, y + 0.08);
					ctx.lineTo(x + 0.08, y + 0.92);
					ctx.stroke();
				}
			}
		}

		ctx.restore();

		for (let y = 0; y < BOARD_ROWS; y += 1) {
			for (let x = 0; x < BOARD_COLS; x += 1) {
				const cell = cellAt(x, y);
				if (!cell || !cell.gate) continue;

				ctx.save();
				ctx.strokeStyle = '#7ec9ff';
				ctx.lineWidth = 0.08;
				ctx.beginPath();
				ctx.moveTo(x + 0.12, y + 0.5);
				ctx.lineTo(x + 0.88, y + 0.5);
				ctx.stroke();
				ctx.restore();
			}
		}

		ctx.save();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.lineWidth = 0.08;
		ctx.strokeRect(7.05, 8.05, 6.9, 4.9);
		ctx.restore();
	}

	function drawPellet(x, y, power = false) {
		ctx.beginPath();
		if (power) {
			const pulse = 0.22 + 0.06 * Math.sin(state.animTime / 90);
			ctx.fillStyle = '#fff8c2';
			ctx.arc(x + 0.5, y + 0.5, pulse, 0, Math.PI * 2);
		} else {
			ctx.fillStyle = '#f7d7a6';
			ctx.arc(x + 0.5, y + 0.5, 0.085, 0, Math.PI * 2);
		}
		ctx.fill();
	}

	function getEntityDrawPosition(entity) {
		if (typeof entity.fromX !== 'number' || typeof entity.fromY !== 'number') {
			return { x: entity.x, y: entity.y };
		}

		if (entity.x === entity.fromX && entity.y === entity.fromY) {
			return { x: entity.x, y: entity.y };
		}

		if (Math.abs(entity.x - entity.fromX) > 1 || Math.abs(entity.y - entity.fromY) > 1) {
			return { x: entity.x, y: entity.y };
		}

		const progress = entity.speedMs > 0 ? clamp(1 - entity.cooldown / entity.speedMs, 0, 1) : 1;
		return {
			x: entity.fromX + (entity.x - entity.fromX) * progress,
			y: entity.fromY + (entity.y - entity.fromY) * progress,
		};
	}

	function drawPacman() {
		const { dir } = state.pacman;
		const { x, y } = getEntityDrawPosition(state.pacman);
		const centerX = x + 0.5;
		const centerY = y + 0.5;
		const radius = 0.42;

		if (state.transitionType === 'death' && state.deathAnimMs > 0) {
			const progress = 1 - clamp(state.deathAnimMs / DEATH_ANIM_MS, 0, 1);
			const ringRadius = radius * (0.6 + progress * 2.1);
			const alpha = 1 - progress;
			ctx.save();
			ctx.strokeStyle = `rgba(255, 225, 76, ${Math.max(0, alpha)})`;
			ctx.lineWidth = 0.08;
			ctx.beginPath();
			ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
			ctx.stroke();

			ctx.fillStyle = `rgba(255, 225, 76, ${Math.max(0, 0.8 - progress)})`;
			for (let i = 0; i < 10; i += 1) {
				const angle = (Math.PI * 2 * i) / 10 + progress * 3.4;
				const burst = radius * (0.35 + progress * 2.35);
				const px = centerX + Math.cos(angle) * burst;
				const py = centerY + Math.sin(angle) * burst;
				ctx.beginPath();
				ctx.arc(px, py, 0.03 + (1 - progress) * 0.02, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
			return;
		}

		const mouth = 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(state.animTime / 70));
		let base = 0;

		if (dir.x === 1) base = 0;
		if (dir.x === -1) base = Math.PI;
		if (dir.y === -1) base = -Math.PI / 2;
		if (dir.y === 1) base = Math.PI / 2;

		ctx.beginPath();
		ctx.fillStyle = '#ffe14c';
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, radius, base + mouth, base + Math.PI * 2 - mouth, false);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.fillStyle = '#fff3a1';
		ctx.arc(centerX + 0.12, centerY - 0.12, 0.055, 0, Math.PI * 2);
		ctx.fill();
	}

	function drawGhost(ghost) {
		const position = getEntityDrawPosition(ghost);
		const flashing = state.frightenedMs > 0 && state.frightenedMs < 1800 && Math.floor(state.animTime / 120) % 2 === 0;
		let bodyColor = ghost.color;

		if (ghost.state === 'frightened') {
			bodyColor = flashing ? '#f6f8ff' : '#2f77ff';
		}

		if (ghost.state === 'eyes') {
			bodyColor = 'rgba(0, 0, 0, 0)';
		}

		const x = position.x + 0.5;
		const y = position.y + 0.52;
		const radius = 0.38;

		if (ghost.state !== 'eyes') {
			ctx.beginPath();
			ctx.fillStyle = bodyColor;
			ctx.arc(x, y - 0.02, radius, Math.PI, 0, false);
			ctx.lineTo(x + radius, y + 0.26);
			ctx.lineTo(x + 0.22, y + 0.42);
			ctx.lineTo(x + 0.08, y + 0.34);
			ctx.lineTo(x - 0.04, y + 0.42);
			ctx.lineTo(x - 0.18, y + 0.34);
			ctx.lineTo(x - 0.32, y + 0.42);
			ctx.lineTo(x - radius, y + 0.26);
			ctx.closePath();
			ctx.fill();
		}

		const eyeOffsetX = ghost.dir.x * 0.06;
		const eyeOffsetY = ghost.dir.y * 0.06;
		const eyeColor = ghost.state === 'frightened' ? '#0f1a36' : '#ffffff';
		const pupilColor = ghost.state === 'frightened' ? '#ffffff' : '#18306b';

		ctx.beginPath();
		ctx.fillStyle = eyeColor;
		ctx.arc(x - 0.14, y - 0.05, 0.08, 0, Math.PI * 2);
		ctx.arc(x + 0.12, y - 0.05, 0.08, 0, Math.PI * 2);
		ctx.fill();

		ctx.beginPath();
		ctx.fillStyle = pupilColor;
		ctx.arc(x - 0.14 + eyeOffsetX, y - 0.05 + eyeOffsetY, 0.035, 0, Math.PI * 2);
		ctx.arc(x + 0.12 + eyeOffsetX, y - 0.05 + eyeOffsetY, 0.035, 0, Math.PI * 2);
		ctx.fill();

		if (ghost.state === 'eyes') {
			ctx.strokeStyle = '#e8f2ff';
			ctx.lineWidth = 0.03;
			ctx.strokeRect(x - 0.18, y - 0.14, 0.4, 0.26);
		}
	}

	function render() {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#02050c';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.scale(state.tileSize, state.tileSize);

		for (let y = 0; y < BOARD_ROWS; y += 1) {
			for (let x = 0; x < BOARD_COLS; x += 1) {
				const cell = cellAt(x, y);
				if (!cell) continue;

				if (cell.power) {
					drawPellet(x, y, true);
				} else if (cell.pellet) {
					drawPellet(x, y, false);
				}
			}
		}

		drawMazeWalls();

		for (const ghost of state.ghosts) {
			drawGhost(ghost);
		}

		drawPacman();

		if (state.gameOver) {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
			ctx.fillRect(0, 0, BOARD_COLS, BOARD_ROWS);
		}

		if (!state.started) {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
			ctx.fillRect(0, 0, BOARD_COLS, BOARD_ROWS);
		}
	}

	function resizeCanvas() {
		const stage = canvas.closest('.play-area');
		const stageWidth = stage ? stage.clientWidth - 24 : 680;
		const stageHeight = Math.min(window.innerHeight * 0.72, 720);
		const nextTileSize = Math.floor(Math.min(stageWidth / BOARD_COLS, stageHeight / BOARD_ROWS));
		state.tileSize = clamp(nextTileSize, 18, 26);
		canvas.width = BOARD_COLS * state.tileSize;
		canvas.height = BOARD_ROWS * state.tileSize;
		canvas.style.width = `${canvas.width}px`;
		canvas.style.height = `${canvas.height}px`;
		ctx.imageSmoothingEnabled = false;
	}

	function handleKeydown(event) {
		const key = event.key.toLowerCase();
		const moveKeyMap = {
			arrowup: 'up',
			w: 'up',
			arrowleft: 'left',
			a: 'left',
			arrowdown: 'down',
			s: 'down',
			arrowright: 'right',
			d: 'right',
		};

		if (key === ' ' || key === 'enter') {
			event.preventDefault();
			if (!state.started || state.gameOver) {
				startNewRun();
			} else {
				togglePause();
			}
			return;
		}

		if (key === 'p') {
			event.preventDefault();
			togglePause();
			return;
		}

		const directionName = moveKeyMap[key];
		if (!directionName) return;

		event.preventDefault();
		if (!state.started || state.gameOver) {
			startNewRun();
		}

		state.pacman.queuedDir = directionFromName(directionName) || state.pacman.queuedDir;
	}

	function queueDirection(name) {
		if (!state.started || state.gameOver) {
			startNewRun();
		}

		const direction = directionFromName(name);
		if (direction) {
			state.pacman.queuedDir = direction;
		}
	}

	let frameDeltaMs = 0;

	function loop(timestamp) {
		if (!state.lastFrame) {
			state.lastFrame = timestamp;
		}

		const dt = Math.min(50, timestamp - state.lastFrame);
		state.lastFrame = timestamp;
		updateGame(dt);
		requestAnimationFrame(loop);
	}

	startButton.addEventListener('click', () => {
		startNewRun();
	});

	menuActionButton.addEventListener('click', () => {
		startNewRun();
	});

	pauseButton.addEventListener('click', togglePause);
	padPauseButton.addEventListener('click', togglePause);
	restartButton.addEventListener('click', restartRun);

	for (const button of directionButtons) {
		button.addEventListener('click', () => {
			queueDirection(button.dataset.direction || 'up');
		});
	}

	window.addEventListener('keydown', handleKeydown);
	window.addEventListener('resize', () => {
		resizeCanvas();
		render();
	});

	setupLevel();
	state.started = false;
	state.paused = false;
	state.gameOver = false;
	state.bestScore = loadBestScore();
	updateHud();
	resizeCanvas();
	setStatus('', 0);
	render();
	requestAnimationFrame(loop);
})();
