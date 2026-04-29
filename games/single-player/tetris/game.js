(function () {
	const root = document.getElementById('gameRoot');
	const canvas = document.getElementById('gameCanvas');
	const holdCanvas = document.getElementById('holdCanvas');
	const nextStack = document.getElementById('nextStack');
	const gameStatus = document.getElementById('gameStatus');
	const scoreValue = document.getElementById('scoreValue');
	const linesValue = document.getElementById('linesValue');
	const levelValue = document.getElementById('levelValue');
	const bestScoreValue = document.getElementById('bestScoreValue');
	const statusValue = document.getElementById('statusValue');
	const boardOverlay = document.getElementById('boardOverlay');
	const overlayKicker = document.getElementById('overlayKicker');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlayText = document.getElementById('overlayText');
	const startButton = document.getElementById('startButton');
	const restartButton = document.getElementById('restartButton');
	const overlayRestartButton = document.getElementById('overlayRestartButton');
	const pauseButton = document.getElementById('pauseButton');
	const touchButtons = Array.from(document.querySelectorAll('[data-action]'));

	if (!root || !canvas) return;

	const ctx = canvas.getContext('2d');
	const holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;
	const storageKey = 'playr.tetris.bestScore.v1';
	const COLS = 10;
	const ROWS = 20;
	const PREVIEW_COUNT = 3;
	const SPAWN_X = 3;
	const SPAWN_Y = -1;
	const BASE_DROP = 1000;
	const SOFT_DROP = 50;
	const LOCK_DELAY = 500;
	const CLEAR_ANIMATION_DURATION = 260;

	const PIECES = {
		I: {
			color: '#63f0ff',
			matrix: [
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		O: {
			color: '#f7db63',
			matrix: [
				[0, 1, 1, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		T: {
			color: '#bb7dff',
			matrix: [
				[0, 1, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		S: {
			color: '#7bf08d',
			matrix: [
				[0, 1, 1, 0],
				[1, 1, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		Z: {
			color: '#ff7b8f',
			matrix: [
				[1, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		J: {
			color: '#6f93ff',
			matrix: [
				[1, 0, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
		L: {
			color: '#ffb563',
			matrix: [
				[0, 0, 1, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
		},
	};

	const pieceTypes = Object.keys(PIECES);

	const JLSTZ_KICKS = {
		'0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
		'1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
		'1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
		'2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
		'2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
		'3>2': [[0, 0], [-1, 0], [-1, 1], [0, 2], [-1, 2]],
		'3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
		'0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
	};

	const I_KICKS = {
		'0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
		'1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
		'1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
		'2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
		'2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
		'3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
		'3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
		'0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
	};

	const state = {
		phase: 'idle',
		board: createBoard(),
		queue: [],
		current: null,
		hold: null,
		holdUsed: false,
		score: 0,
		lines: 0,
		level: 1,
		bestScore: loadBestScore(),
		lastFrame: 0,
		dropAccumulator: 0,
		lockTimer: 0,
		softDropHeld: false,
		clearAnimation: null,
		pendingClear: null,
		nextMessage: 'Press Start or any move to begin.',
	};

	function createBoard() {
		return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
	}

	function loadBestScore() {
		try {
			return Number(localStorage.getItem(storageKey) || 0) || 0;
		} catch {
			return 0;
		}
	}

	function saveBestScore() {
		try {
			localStorage.setItem(storageKey, String(state.bestScore));
		} catch {
			// no-op
		}
	}

	function rotateMatrix(matrix) {
		return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
	}

	function buildRotations(matrix) {
		const rotations = [matrix];
		for (let index = 0; index < 3; index += 1) {
			rotations.push(rotateMatrix(rotations[index]));
		}
		return rotations;
	}

	function getPiece(type) {
		const def = PIECES[type];
		return {
			type,
			rotation: 0,
			x: SPAWN_X,
			y: SPAWN_Y,
			color: def.color,
			rotations: buildRotations(def.matrix),
		};
	}

	function getMatrix(piece, rotation = piece.rotation) {
		return piece.rotations[((rotation % 4) + 4) % 4];
	}

	function shuffleBag() {
		const bag = pieceTypes.slice();
		for (let index = bag.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
		}
		return bag;
	}

	function refillQueue(minLength = 6) {
		while (state.queue.length < minLength) {
			state.queue.push(...shuffleBag());
		}
	}

	function canPlace(piece, targetX = piece.x, targetY = piece.y, rotation = piece.rotation) {
		const matrix = getMatrix(piece, rotation);
		for (let row = 0; row < 4; row += 1) {
			for (let col = 0; col < 4; col += 1) {
				if (!matrix[row][col]) continue;
				const boardX = targetX + col;
				const boardY = targetY + row;
				if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false;
				if (boardY >= 0 && state.board[boardY][boardX]) return false;
			}
		}
		return true;
	}

	function ensureActivePiece() {
		if (state.current) return true;
		refillQueue();
		const type = state.queue.shift();
		const piece = getPiece(type);
		if (!canPlace(piece, piece.x, piece.y, piece.rotation)) {
			state.current = piece;
			endGame();
			return false;
		}
		state.current = piece;
		state.holdUsed = false;
		state.lockTimer = 0;
		updateNextPanel();
		return true;
	}

	function startGame() {
		state.board = createBoard();
		state.queue = [];
		state.current = null;
		state.hold = null;
		state.holdUsed = false;
		state.score = 0;
		state.lines = 0;
		state.level = 1;
		state.dropAccumulator = 0;
		state.lockTimer = 0;
		state.clearAnimation = null;
		state.pendingClear = null;
		state.phase = 'active';
		state.nextMessage = 'Good luck. Stack clean and stay ahead of the queue.';
		ensureActivePiece();
		updateOverlay();
		updateHud();
		updateMiniPreviews();
		setStatus('Game started.', 'Playing');
	}

	function restartGame() {
		startGame();
	}

	function setStatus(message, sessionLabel = message) {
		state.nextMessage = message;
		if (statusValue) statusValue.textContent = sessionLabel;
		if (gameStatus) gameStatus.textContent = state.phase === 'active' ? '' : message;
	}

	function updateHud() {
		if (scoreValue) scoreValue.textContent = String(state.score);
		if (linesValue) linesValue.textContent = String(state.lines);
		if (levelValue) levelValue.textContent = String(state.level);
		if (bestScoreValue) bestScoreValue.textContent = String(state.bestScore);
	}

	function updateOverlay() {
		if (!boardOverlay) return;
		const shouldShow = state.phase !== 'active';
		boardOverlay.classList.toggle('hidden', !shouldShow);

		if (!shouldShow) return;

		if (state.phase === 'idle') {
			overlayKicker.textContent = '';
			overlayTitle.textContent = 'Tetris';
			overlayText.textContent = 'Stack clean lines, use hold when needed, and chase the next tetrimino.';
			startButton.textContent = 'Start';
		} else if (state.phase === 'paused') {
			overlayKicker.textContent = 'Paused';
			overlayTitle.textContent = 'Take a breath';
			overlayText.textContent = 'Resume when you are ready to keep building the stack.';
			startButton.textContent = 'Resume';
		} else {
			overlayKicker.textContent = 'Game over';
			overlayTitle.textContent = 'Stack topped out';
			overlayText.textContent = `Final score ${state.score}. Restart and try to clear a cleaner board.`;
			startButton.textContent = 'Play again';
		}
	}

	function updateMiniPreviews() {
		if (holdCtx) {
			holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
			if (state.hold) drawMiniPiece(holdCtx, state.hold, holdCanvas.width, holdCanvas.height);
		}

		if (!nextStack) return;
		nextStack.innerHTML = '';
		refillQueue(PREVIEW_COUNT);
		state.queue.slice(0, PREVIEW_COUNT).forEach((type, index) => {
			const card = document.createElement('div');
			card.className = 'next-card';

			const preview = document.createElement('canvas');
			preview.width = 68;
			preview.height = 68;
			const previewCtx = preview.getContext('2d');
			drawMiniPiece(previewCtx, getPiece(type), preview.width, preview.height);

			const labelWrap = document.createElement('div');
			labelWrap.innerHTML = `<div class="next-label">${index === 0 ? 'Next' : `Next ${index + 1}`}</div><strong>${type}</strong>`;

			card.appendChild(preview);
			card.appendChild(labelWrap);
			nextStack.appendChild(card);
		});
	}

	function updateNextPanel() {
		updateMiniPreviews();
	}

	function drawMiniPiece(targetCtx, piece, width, height) {
		if (!targetCtx || !piece) return;
		const matrix = getMatrix(piece, 0);
		const cells = matrix.flatMap((row, rowIndex) => row.map((cell, colIndex) => (cell ? [rowIndex, colIndex] : null)).filter(Boolean));
		const cellSize = Math.floor(Math.min(width, height) / 4);
		const bounds = cells.reduce(
			(acc, [rowIndex, colIndex]) => {
				acc.minX = Math.min(acc.minX, colIndex);
				acc.maxX = Math.max(acc.maxX, colIndex);
				acc.minY = Math.min(acc.minY, rowIndex);
				acc.maxY = Math.max(acc.maxY, rowIndex);
				return acc;
			},
			{ minX: 4, maxX: 0, minY: 4, maxY: 0 },
		);
		const pieceWidth = bounds.maxX - bounds.minX + 1;
		const pieceHeight = bounds.maxY - bounds.minY + 1;
		const offsetX = Math.floor((width - pieceWidth * cellSize) / 2);
		const offsetY = Math.floor((height - pieceHeight * cellSize) / 2);

		targetCtx.clearRect(0, 0, width, height);
		targetCtx.fillStyle = 'rgba(255,255,255,0.02)';
		targetCtx.fillRect(0, 0, width, height);

		for (const [rowIndex, colIndex] of cells) {
			const x = offsetX + (colIndex - bounds.minX) * cellSize;
			const y = offsetY + (rowIndex - bounds.minY) * cellSize;
			drawBlock(targetCtx, x, y, cellSize, piece.color, 1);
		}
	}

	function drawBlock(targetCtx, x, y, size, color, alpha = 1, inset = 0) {
		targetCtx.save();
		targetCtx.globalAlpha = alpha;
		const radius = Math.max(4, Math.floor(size * 0.18));
		const innerColor = shadeColor(color, -22);
		const highlight = shadeColor(color, 32);
		targetCtx.fillStyle = color;
		roundRect(targetCtx, x + inset, y + inset, size - inset * 2, size - inset * 2, radius);
		targetCtx.fill();
		targetCtx.lineWidth = 1;
		targetCtx.strokeStyle = innerColor;
		targetCtx.stroke();
		targetCtx.fillStyle = 'rgba(255,255,255,0.14)';
		roundRect(targetCtx, x + inset + 2, y + inset + 2, Math.max(2, size - inset * 2 - 4), Math.max(2, Math.floor(size * 0.28)), Math.max(2, Math.floor(radius * 0.8)));
		targetCtx.fill();
		targetCtx.strokeStyle = highlight;
		targetCtx.strokeRect(x + inset + 1, y + inset + 1, size - inset * 2 - 2, size - inset * 2 - 2);
		targetCtx.restore();
	}

	function roundRect(targetCtx, x, y, width, height, radius) {
		const r = Math.min(radius, width / 2, height / 2);
		targetCtx.beginPath();
		targetCtx.moveTo(x + r, y);
		targetCtx.arcTo(x + width, y, x + width, y + height, r);
		targetCtx.arcTo(x + width, y + height, x, y + height, r);
		targetCtx.arcTo(x, y + height, x, y, r);
		targetCtx.arcTo(x, y, x + width, y, r);
		targetCtx.closePath();
	}

	function shadeColor(hex, amount) {
		const value = hex.replace('#', '');
		const num = Number.parseInt(value, 16);
		const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
		const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
		const b = Math.min(255, Math.max(0, (num & 255) + amount));
		return `rgb(${r}, ${g}, ${b})`;
	}

	function dropInterval() {
		return Math.max(90, BASE_DROP - (state.level - 1) * 80);
	}

	function movePiece(dx, dy) {
		if (!state.current) return false;
		if (!canPlace(state.current, state.current.x + dx, state.current.y + dy, state.current.rotation)) return false;
		state.current.x += dx;
		state.current.y += dy;
		if (dy !== 0 || dx !== 0) state.lockTimer = 0;
		return true;
	}

	function rotatePiece(direction) {
		if (!state.current || state.current.type === 'O') return true;
		const from = state.current.rotation;
		const to = ((from + direction) % 4 + 4) % 4;
		const kicks = getKickTable(state.current.type, from, to);
		for (const [kickX, kickY] of kicks) {
			if (canPlace(state.current, state.current.x + kickX, state.current.y + kickY, to)) {
				state.current.x += kickX;
				state.current.y += kickY;
				state.current.rotation = to;
				state.lockTimer = 0;
				return true;
			}
		}
		return false;
	}

	function getKickTable(type, from, to) {
		if (type === 'O') return [[0, 0]];
		if (type === 'I') return I_KICKS[`${from}>${to}`] || [[0, 0]];
		return JLSTZ_KICKS[`${from}>${to}`] || [[0, 0]];
	}

	function hardDrop() {
		if (state.phase !== 'active' || !ensureActivePiece()) return;
		let distance = 0;
		while (movePiece(0, 1)) {
			distance += 1;
		}
		state.score += distance * 2 * state.level;
		lockPiece();
		updateHud();
	}

	function holdPiece() {
		if (state.phase !== 'active' || !ensureActivePiece() || state.holdUsed) return;
		const activeType = state.current.type;
		state.holdUsed = true;
		if (!state.hold) {
			state.hold = getPiece(activeType);
			state.current = null;
			ensureActivePiece();
		} else {
			const swapType = state.hold.type;
			state.hold = getPiece(activeType);
			state.current = getPiece(swapType);
			if (!canPlace(state.current, state.current.x, state.current.y, state.current.rotation)) {
				endGame();
				return;
			}
		}
		state.lockTimer = 0;
		updateMiniPreviews();
	}

	function lockPiece() {
		if (!state.current) return;
		const matrix = getMatrix(state.current);
		for (let row = 0; row < 4; row += 1) {
			for (let col = 0; col < 4; col += 1) {
				if (!matrix[row][col]) continue;
				const boardX = state.current.x + col;
				const boardY = state.current.y + row;
				if (boardY < 0) {
					endGame();
					return;
				}
				state.board[boardY][boardX] = state.current.color;
			}
		}

		state.current = null;
		state.holdUsed = false;
		state.lockTimer = 0;

		const clearedRows = getFullRows();
		if (clearedRows.length > 0) {
			state.pendingClear = {
				rows: clearedRows,
				scoreBonus: [0, 100, 300, 500, 800][clearedRows.length] * state.level,
				linesBonus: clearedRows.length,
				message: clearedRows.length === 4 ? 'Tetris! Four lines cleared.' : `${clearedRows.length} line${clearedRows.length > 1 ? 's' : ''} cleared.`,
			};
			state.clearAnimation = {
				rows: clearedRows,
				elapsed: 0,
				duration: CLEAR_ANIMATION_DURATION,
			};
			setStatus(state.pendingClear.message, 'Playing');
			return;
		}

		setStatus('Piece locked. Keep building the stack.', 'Playing');
		ensureActivePiece();
		updateHud();
		updateMiniPreviews();
	}

	function getFullRows() {
		const rows = [];
		for (let row = ROWS - 1; row >= 0; row -= 1) {
			if (state.board[row].every(Boolean)) {
				rows.push(row);
			}
		}
		return rows;
	}

	function clearRows(rows) {
		const rowsToClear = new Set(rows);
		const remainingRows = state.board.filter((_, rowIndex) => !rowsToClear.has(rowIndex));
		const newRows = Array.from({ length: rows.length }, () => Array(COLS).fill(null));
		state.board = newRows.concat(remainingRows);
	}

	function finishClearAnimation() {
		if (!state.pendingClear) return;
		const pendingClear = state.pendingClear;
		state.pendingClear = null;
		state.clearAnimation = null;
		clearRows(pendingClear.rows);
		state.score += pendingClear.scoreBonus;
		state.lines += pendingClear.linesBonus;
		state.level = Math.floor(state.lines / 10) + 1;
		if (state.score > state.bestScore) {
			state.bestScore = state.score;
			saveBestScore();
		}
		ensureActivePiece();
		updateHud();
		updateMiniPreviews();
	}

	function endGame() {
		state.phase = 'gameover';
		state.current = null;
		state.lockTimer = 0;
		if (state.score > state.bestScore) {
			state.bestScore = state.score;
			saveBestScore();
		}
		updateHud();
		setStatus('Game over. Press restart to try again.', 'Game over');
		updateOverlay();
	}

	function togglePause(force) {
		if (state.phase === 'idle') return;
		if (state.phase === 'gameover') return;
		const shouldPause = typeof force === 'boolean' ? force : state.phase === 'active';
		state.phase = shouldPause ? 'paused' : 'active';
		setStatus(state.phase === 'paused' ? 'Paused.' : 'Game resumed.', state.phase === 'paused' ? 'Paused' : 'Playing');
		updateOverlay();
	}

	function handleKeyDown(event) {
		const key = event.key.toLowerCase();
		const actionKeys = ['arrowleft', 'arrowright', 'arrowdown', 'arrowup', ' ', 'spacebar', 'a', 'd', 's', 'w', 'x', 'z', 'c', 'p', 'r', 'shift'];
		if (!actionKeys.includes(key)) return;
		event.preventDefault();

		if (state.phase === 'idle') {
			startGame();
			if (key === 'r') return;
		}

		if (key === 'p') {
			togglePause();
			return;
		}

		if (state.phase !== 'active') {
			if (key === ' ' || key === 'spacebar' || key === 'enter') startGame();
			return;
		}

		ensureActivePiece();

		if (key === 'arrowleft' || key === 'a') {
			movePiece(-1, 0);
		} else if (key === 'arrowright' || key === 'd') {
			movePiece(1, 0);
		} else if (key === 'arrowdown' || key === 's') {
			state.softDropHeld = true;
			movePiece(0, 1);
			state.score += state.level;
			updateHud();
		} else if (key === 'arrowup' || key === 'x' || key === 'w' || key === 'r') {
			rotatePiece(1);
		} else if (key === 'z') {
			rotatePiece(-1);
		} else if (key === ' ' || key === 'spacebar') {
			hardDrop();
		} else if (key === 'c' || key === 'shift') {
			holdPiece();
		}
	}

	function handleKeyUp(event) {
		const key = event.key.toLowerCase();
		if (key === 'arrowdown' || key === 's') {
			state.softDropHeld = false;
		}
	}

	function handleTouchAction(action) {
		if (state.phase === 'idle') startGame();
		if (action === 'pause') togglePause();
		if (action === 'restart') restartGame();
		if (state.phase !== 'active' && action !== 'restart') return;

		ensureActivePiece();

		if (action === 'left') movePiece(-1, 0);
		if (action === 'right') movePiece(1, 0);
		if (action === 'down') {
			state.softDropHeld = true;
			movePiece(0, 1);
			state.score += state.level;
			updateHud();
		}
		if (action === 'rotate-cw') rotatePiece(1);
		if (action === 'rotate-ccw') rotatePiece(-1);
		if (action === 'hard-drop') hardDrop();
		if (action === 'hold') holdPiece();
	}

	function drawCellGrid(targetCtx, x, y, size, color, alpha = 1) {
		drawBlock(targetCtx, x, y, size, color, alpha, 0);
	}

	function getClearPulse(elapsed, duration) {
		const progress = Math.min(1, elapsed / duration);
		return 1 - Math.pow(1 - progress, 3);
	}

	function getGhostY(piece) {
		let ghostY = piece.y;
		while (canPlace(piece, piece.x, ghostY + 1, piece.rotation)) {
			ghostY += 1;
		}
		return ghostY;
	}

	function render() {
		const width = canvas.width;
		const height = canvas.height;
		const cellSize = width / COLS;
		const clearPulse = state.clearAnimation ? getClearPulse(state.clearAnimation.elapsed, state.clearAnimation.duration) : 0;
		const clearRows = state.clearAnimation ? new Set(state.clearAnimation.rows) : null;

		const background = ctx.createLinearGradient(0, 0, 0, height);
		background.addColorStop(0, '#0a1324');
		background.addColorStop(1, '#07101b');
		ctx.fillStyle = background;
		ctx.fillRect(0, 0, width, height);

		const glow = ctx.createRadialGradient(width * 0.5, 0, 10, width * 0.5, 0, width * 0.9);
		glow.addColorStop(0, 'rgba(124, 240, 197, 0.15)');
		glow.addColorStop(1, 'rgba(124, 240, 197, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, width, height);

		ctx.strokeStyle = 'rgba(255,255,255,0.05)';
		ctx.lineWidth = 1;
		for (let col = 0; col <= COLS; col += 1) {
			ctx.beginPath();
			ctx.moveTo(col * cellSize + 0.5, 0);
			ctx.lineTo(col * cellSize + 0.5, height);
			ctx.stroke();
		}
		for (let row = 0; row <= ROWS; row += 1) {
			ctx.beginPath();
			ctx.moveTo(0, row * cellSize + 0.5);
			ctx.lineTo(width, row * cellSize + 0.5);
			ctx.stroke();
		}

		for (let row = 0; row < ROWS; row += 1) {
			for (let col = 0; col < COLS; col += 1) {
				const color = state.board[row][col];
				if (!color) continue;
				const isClearingRow = clearRows ? clearRows.has(row) : false;
				if (isClearingRow) {
					const rowY = row * cellSize;
					ctx.save();
					ctx.globalCompositeOperation = 'lighter';
					ctx.fillStyle = `rgba(255, 235, 170, ${0.1 + clearPulse * 0.22})`;
					ctx.shadowColor = 'rgba(255, 234, 150, 0.85)';
					ctx.shadowBlur = 22 + clearPulse * 20;
					ctx.fillRect(0, rowY + 2, width, cellSize - 4);
					ctx.restore();
				}
				const alpha = isClearingRow ? 0.6 + clearPulse * 0.35 : 1;
				drawCellGrid(ctx, col * cellSize + 1, row * cellSize + 1, cellSize - 2, color, alpha);
			}
		}

		if (clearRows) {
			for (const row of state.clearAnimation.rows) {
				const y = row * cellSize;
				ctx.save();
				ctx.strokeStyle = `rgba(255, 247, 205, ${0.18 + clearPulse * 0.34})`;
				ctx.lineWidth = 2;
				ctx.shadowColor = 'rgba(255, 239, 164, 0.8)';
				ctx.shadowBlur = 18 + clearPulse * 18;
				ctx.strokeRect(1.5, y + 1.5, width - 3, cellSize - 3);
				ctx.restore();
			}
		}

		if (state.current) {
			const ghostY = getGhostY(state.current);
			const ghostMatrix = getMatrix(state.current);
			for (let row = 0; row < 4; row += 1) {
				for (let col = 0; col < 4; col += 1) {
					if (!ghostMatrix[row][col]) continue;
					const x = (state.current.x + col) * cellSize;
					const y = (ghostY + row) * cellSize;
					if (y < 0) continue;
					drawCellGrid(ctx, x + 2, y + 2, cellSize - 4, state.current.color, 0.18);
				}
			}

			const matrix = getMatrix(state.current);
			for (let row = 0; row < 4; row += 1) {
				for (let col = 0; col < 4; col += 1) {
					if (!matrix[row][col]) continue;
					const x = (state.current.x + col) * cellSize;
					const y = (state.current.y + row) * cellSize;
					if (y < 0) continue;
					drawCellGrid(ctx, x + 1, y + 1, cellSize - 2, state.current.color, 1);
				}
			}
		}

		ctx.fillStyle = 'rgba(255,255,255,0.04)';
		ctx.fillRect(0, 0, width, 2);
	}

	function updateFrame(timestamp) {
		if (!state.lastFrame) state.lastFrame = timestamp;
		const delta = timestamp - state.lastFrame;
		state.lastFrame = timestamp;

		if (state.clearAnimation) {
			state.clearAnimation.elapsed += delta;
			if (state.clearAnimation.elapsed >= state.clearAnimation.duration) {
				finishClearAnimation();
			}
		} else if (state.phase === 'active' && ensureActivePiece()) {
			state.dropAccumulator += delta;
			const interval = state.softDropHeld ? SOFT_DROP : dropInterval();

			while (state.dropAccumulator >= interval && state.phase === 'active') {
				state.dropAccumulator -= interval;
				if (!movePiece(0, 1)) {
					state.lockTimer += interval;
					break;
				}
				if (state.softDropHeld) {
					state.score += state.level;
					updateHud();
				}
			}

			if (!canPlace(state.current, state.current.x, state.current.y + 1, state.current.rotation)) {
				state.lockTimer += delta;
				if (state.lockTimer >= LOCK_DELAY) {
					lockPiece();
				}
			} else {
				state.lockTimer = 0;
			}
		}

		render();
		requestAnimationFrame(updateFrame);
	}

	function getPreviewButtons() {
		return touchButtons;
	}

	function bindEvents() {
		window.addEventListener('keydown', handleKeyDown, { passive: false });
		window.addEventListener('keyup', handleKeyUp);

		if (startButton) startButton.addEventListener('click', () => {
			if (state.phase === 'paused') {
				togglePause(false);
			} else {
				startGame();
			}
		});

		if (restartButton) restartButton.addEventListener('click', restartGame);
		if (overlayRestartButton) overlayRestartButton.addEventListener('click', restartGame);
		if (pauseButton) pauseButton.addEventListener('click', () => togglePause());

		getPreviewButtons().forEach((button) => {
			button.addEventListener('click', () => handleTouchAction(button.dataset.action));
		});
	}

	function initialRender() {
		updateHud();
		setStatus(state.nextMessage, '');
		updateOverlay();
		updateMiniPreviews();
		render();
	}

	bindEvents();
	initialRender();
	requestAnimationFrame(updateFrame);
})();
