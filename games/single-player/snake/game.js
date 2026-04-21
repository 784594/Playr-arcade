// Game configuration by size and speed
const SIZE_PRESETS = {
	small: { gridCols: 13, gridRows: 13 },
	normal: { gridCols: 17, gridRows: 17 },
	large: { gridCols: 21, gridRows: 21 },
};

const SPEED_PRESETS = {
	slow: 140,
	medium: 95,
	fast: 60,
};

const BEST_KEY = 'playr.snake.bestScores.v2';

// DOM elements
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const gameMenu = document.getElementById('gameMenu');
const inGamePanel = document.getElementById('inGamePanel');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuButtons = document.getElementById('menuButtons');
const settingsPanel = document.getElementById('settingsPanel');
const playBtn = document.getElementById('playBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backSettingsBtn = document.getElementById('backSettingsBtn');
const roundStatusEl = document.getElementById('roundStatus');
const stripScoreEl = document.getElementById('score');
const stripLengthEl = document.getElementById('length');
const liveScore = document.getElementById('liveScore');
const liveLength = document.getElementById('liveLength');
const liveTimer = document.getElementById('liveTimer');
const boardMetaEl = document.getElementById('boardMeta');
const adminSidebarToggleBtn = document.getElementById('adminSidebarToggleBtn');
const currentModeEl = document.getElementById('currentMode');
const playAgainOverlay = document.getElementById('playAgainOverlay');
const playAgainBtn = document.getElementById('playAgainBtn');
const playAgainSettingsBtn = document.getElementById('playAgainSettingsBtn');
const backMenuBtn = document.getElementById('backMenuBtn');
const gameStatus = document.getElementById('gameStatus');
const adminTools = document.getElementById('adminTools');
const adminModeBtn = document.getElementById('adminModeBtn');
const adminAddFoodBtn = document.getElementById('adminAddFoodBtn');
const adminClearBoardBtn = document.getElementById('adminClearBoardBtn');
const adminSpeedInput = document.getElementById('adminSpeedInput');
const adminApplySpeedBtn = document.getElementById('adminApplySpeedBtn');
const adminScoreInput = document.getElementById('adminScoreInput');
const adminApplyScoreBtn = document.getElementById('adminApplyScoreBtn');
const adminResetScoresBtn = document.getElementById('adminResetScoresBtn');
const adminRevertScoresBtn = document.getElementById('adminRevertScoresBtn');
const adminInfo = document.getElementById('adminInfo');
const leaderboardPreviewBody = document.getElementById('leaderboardPreviewBody');

const bestElFreePlay = document.getElementById('bestFreePlay');
const bestElTrophy = document.getElementById('bestTrophy');

let adminAPI = null;

// Game state
const state = {
	// Menu state
	gameMode: null, // 'freeplay' or 'trophy'
	
	// Settings (for free play)
	mapSize: 'normal',
	gameSpeed: 'medium',
	foodCount: 1,
	
	// Board state
	gridCols: SIZE_PRESETS.normal.gridCols,
	gridRows: SIZE_PRESETS.normal.gridRows,
	speed: SPEED_PRESETS.medium,
	
	// Game state
	snake: [],
	foods: [],
	direction: { x: 1, y: 0 },
	nextDirection: { x: 1, y: 0 },
	hasReceivedInput: false,
	
	foodEaten: 0,
	gameEnded: false,
	gamePaused: false,
	gameLoopId: null,
	startTime: 0,
	elapsedSeconds: 0,
	timerIntervalId: null,
	renderLoopId: null,
	lastTickAt: 0,
	previousSnake: [],
	bumpAnimation: null,
	hiddenTailSegments: 0,
	
	// Crash animation state
	crashPosition: null,
	crashTimer: 0,
	
	bestScores: loadBestScores(),
	
	adminEnabled: false,
	adminMineEdit: false,
	adminCustomMines: false,
	adminSidebarOpen: false,
	adminScoreSnapshot: null,
};

function isOwnerAccount() {
	try {
		if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
			const user = window.PlayrAuth.getCurrentUser();
			if (String(user?.displayName || '').trim().toLowerCase() === 'owner') {
				return true;
			}
		}
	} catch {
		// no-op
	}

	try {
		const raw = localStorage.getItem('playrCurrentUser');
		if (!raw) return false;
		const parsed = JSON.parse(raw);
		return String(parsed?.displayName || '').trim().toLowerCase() === 'owner';
	} catch {
		return false;
	}
}

function refreshAdminSidebarUi() {
	const isOwner = isOwnerAccount();
	if (adminSidebarToggleBtn) {
		adminSidebarToggleBtn.hidden = !isOwner;
		adminSidebarToggleBtn.textContent = state.adminSidebarOpen ? 'Hide Admin' : 'Show Admin';
	}

	if (!adminTools) return;
	if (!isOwner) {
		adminTools.hidden = true;
		state.adminSidebarOpen = false;
		return;
	}

	adminTools.hidden = !state.adminSidebarOpen;
}

function loadBestScores() {
	try {
		const parsed = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
		return {
			freePlay: typeof parsed.freePlay === 'number' ? parsed.freePlay : 0,
			trophy: typeof parsed.trophy === 'number' ? parsed.trophy : 0,
		};
	} catch {
		return { freePlay: 0, trophy: 0 };
	}
}

function saveBestScores() {
	localStorage.setItem(BEST_KEY, JSON.stringify(state.bestScores));
}

function renderBestScores() {
	bestElFreePlay.textContent = state.bestScores.freePlay;
	bestElTrophy.textContent = state.bestScores.trophy;
}

function getModeLabel() {
	if (state.gameMode === 'trophy') return 'Trophy';
	return 'Free Play';
}

function updateLeaderboardPreviewFromAdmin(scoreValue) {
	if (!leaderboardPreviewBody) return;
	const firstRow = leaderboardPreviewBody.querySelector('tr');
	if (!firstRow || firstRow.children.length < 4) return;

	firstRow.children[0].textContent = '#1';
	firstRow.children[1].textContent = 'Owner';
	firstRow.children[2].textContent = getModeLabel();
	firstRow.children[3].textContent = String(scoreValue);
}

function readLeaderboardSnapshot() {
	if (!leaderboardPreviewBody) return [];
	return Array.from(leaderboardPreviewBody.querySelectorAll('tr')).map((row) =>
		Array.from(row.children).map((cell) => cell.textContent || ''),
	);
}

function writeLeaderboardSnapshot(rows) {
	if (!leaderboardPreviewBody || !Array.isArray(rows)) return;
	const trList = Array.from(leaderboardPreviewBody.querySelectorAll('tr'));
	trList.forEach((tr, trIndex) => {
		const rowValues = rows[trIndex];
		if (!Array.isArray(rowValues)) return;
		Array.from(tr.children).forEach((cell, cellIndex) => {
			if (typeof rowValues[cellIndex] === 'string') {
				cell.textContent = rowValues[cellIndex];
			}
		});
	});
}

function captureAdminScoreSnapshotIfNeeded() {
	if (state.adminScoreSnapshot) return;
	state.adminScoreSnapshot = {
		bestScores: { ...state.bestScores },
		foodEaten: state.foodEaten,
		liveLength: String(state.snake.length || 3),
		liveScore: String(state.foodEaten),
		liveTimer: `${state.elapsedSeconds}s`,
		gameMode: state.gameMode,
		mapSize: state.mapSize,
		gameSpeed: state.gameSpeed,
		foodCount: state.foodCount,
		snake: state.snake.map((segment) => ({ ...segment })),
		foods: state.foods.map((food) => ({ ...food })),
		direction: { ...state.direction },
		nextDirection: { ...state.nextDirection },
		gameEnded: state.gameEnded,
		gamePaused: state.gamePaused,
		leaderboardRows: readLeaderboardSnapshot(),
	};
}

function resetAdminScores() {
	if (!state.adminEnabled) return;
	captureAdminScoreSnapshotIfNeeded();

	stopGameLoop();
	stopTimer();
	state.foodEaten = 0;
	state.elapsedSeconds = 0;
	state.hasReceivedInput = false;
	state.gameEnded = false;
	state.gamePaused = false;
	state.gameMode = null;
	state.mapSize = 'normal';
	state.gameSpeed = 'medium';
	state.foodCount = 1;
	state.gridCols = SIZE_PRESETS.normal.gridCols;
	state.gridRows = SIZE_PRESETS.normal.gridRows;
	state.speed = SPEED_PRESETS.medium;
	state.snake = [];
	state.foods = [];
	if (liveTimer) liveTimer.textContent = '0s';
	state.bestScores = {
		freePlay: 0,
		trophy: 0,
	};
	saveBestScores();
	renderBestScores();
	initMenu();

	if (leaderboardPreviewBody) {
		Array.from(leaderboardPreviewBody.querySelectorAll('tr')).forEach((row) => {
			if (row.children.length >= 4) {
				row.children[3].textContent = '0';
			}
		});
	}

	refreshSnakeAdminUi();
}

function revertAdminScores() {
	if (!state.adminEnabled || !state.adminScoreSnapshot) return;
	state.bestScores = {
		freePlay: state.adminScoreSnapshot.bestScores.freePlay,
		trophy: state.adminScoreSnapshot.bestScores.trophy,
	};
	saveBestScores();
	renderBestScores();

	state.foodEaten = state.adminScoreSnapshot.foodEaten;
	state.gameMode = state.adminScoreSnapshot.gameMode;
	state.mapSize = state.adminScoreSnapshot.mapSize;
	state.gameSpeed = state.adminScoreSnapshot.gameSpeed;
	state.foodCount = state.adminScoreSnapshot.foodCount;
	state.snake = state.adminScoreSnapshot.snake.map((segment) => ({ ...segment }));
	state.foods = state.adminScoreSnapshot.foods.map((food) => ({ ...food }));
	state.direction = { ...state.adminScoreSnapshot.direction };
	state.nextDirection = { ...state.adminScoreSnapshot.nextDirection };
	state.gameEnded = state.adminScoreSnapshot.gameEnded;
	state.gamePaused = state.adminScoreSnapshot.gamePaused;
	state.elapsedSeconds = Number.parseInt(String(state.adminScoreSnapshot.liveTimer || '0'), 10) || 0;
	if (liveScore) liveScore.textContent = state.adminScoreSnapshot.liveScore;
	if (liveLength) liveLength.textContent = state.adminScoreSnapshot.liveLength;
	if (liveTimer) liveTimer.textContent = state.adminScoreSnapshot.liveTimer;
	writeLeaderboardSnapshot(state.adminScoreSnapshot.leaderboardRows);

	state.adminScoreSnapshot = null;
	refreshSnakeAdminUi();
}

function applyAdminScoreOverride(rawScore) {
	const parsed = Number(rawScore);
	if (!Number.isFinite(parsed) || parsed < 0) return;
	captureAdminScoreSnapshotIfNeeded();
	const scoreValue = Math.floor(parsed);

	state.foodEaten = scoreValue;
	if (liveScore) liveScore.textContent = String(scoreValue);

	const modeKey = state.gameMode === 'trophy' ? 'trophy' : 'freePlay';
	if (scoreValue > state.bestScores[modeKey]) {
		state.bestScores[modeKey] = scoreValue;
		saveBestScores();
		renderBestScores();
	}

	updateLeaderboardPreviewFromAdmin(scoreValue);
}

function updateRoundStrip() {
	const visibleLength = state.gameMode
		? Math.max(1, state.snake.length - (state.hasReceivedInput ? 0 : state.hiddenTailSegments))
		: 3;

	if (roundStatusEl) {
		if (!state.gameMode) roundStatusEl.textContent = 'Menu';
		else if (state.gameEnded) roundStatusEl.textContent = 'Game Over';
		else if (state.gamePaused) roundStatusEl.textContent = 'Paused';
		else if (!state.hasReceivedInput) roundStatusEl.textContent = '';
		else roundStatusEl.textContent = 'Running';
	}
	if (stripScoreEl) stripScoreEl.textContent = state.gameMode ? String(state.foodEaten) : '--';
	if (stripLengthEl) stripLengthEl.textContent = state.gameMode ? String(visibleLength) : '--';
	if (liveScore) liveScore.textContent = state.gameMode ? String(state.foodEaten) : '0';
	if (liveLength) liveLength.textContent = state.gameMode ? String(visibleLength) : '3';
	if (liveTimer) liveTimer.textContent = state.gameMode ? `${state.elapsedSeconds}s` : '0s';
}

function resizeCanvasForBoard() {
	const wrapWidth = Math.max(280, Math.min(620, (canvas.parentElement?.clientWidth || 520) - 24));
	const wrapHeight = Math.max(280, Math.min(620, window.innerHeight - 300));
	const side = Math.floor(Math.min(wrapWidth, wrapHeight));
	const maxCells = Math.max(state.gridCols, state.gridRows);
	const cellSize = Math.max(12, Math.floor(side / maxCells));
	const boardSize = cellSize * maxCells;
	canvas.width = boardSize;
	canvas.height = boardSize;
}

function renderIdlePreview() {
	resizeCanvasForBoard();
	const cellSize = canvas.width / Math.max(state.gridCols, state.gridRows);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let row = 0; row < state.gridRows; row += 1) {
		for (let col = 0; col < state.gridCols; col += 1) {
			ctx.fillStyle = (row + col) % 2 === 0 ? '#18243f' : '#141f36';
			ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
		}
	}
	ctx.fillStyle = 'rgba(124, 240, 197, 0.3)';
	const mid = Math.floor(state.gridRows / 2);
	for (let col = 4; col <= 8; col += 1) {
		ctx.fillRect(col * cellSize + 1, mid * cellSize + 1, cellSize - 2, cellSize - 2);
	}
}

// Initialize menu
function initMenu() {
	gameMenu.hidden = false;
	inGamePanel.hidden = false;
	canvas.hidden = false;
	playAgainOverlay.hidden = true;
	menuButtons.hidden = false;
	settingsPanel.hidden = true;
	if (menuBackdrop) menuBackdrop.hidden = true;
	backMenuBtn.hidden = true;
	renderBestScores();
	renderIdlePreview();
	updateRoundStrip();
}

// Show full settings modal from launch prompt
function openSettingsMenu() {
	menuButtons.hidden = true;
	settingsPanel.hidden = false;
	if (menuBackdrop) menuBackdrop.hidden = false;
}

// Return to launch prompt while still in menu overlay
function backToLaunchPrompt() {
	menuButtons.hidden = false;
	settingsPanel.hidden = true;
	if (menuBackdrop) menuBackdrop.hidden = true;
}

// Start game with custom settings from settings panel
function startGameCustom() {
	state.mapSize = document.querySelector('input[name="mapSize"]:checked').value;
	state.gameSpeed = document.querySelector('input[name="gameSpeed"]:checked').value;
	state.foodCount = parseInt(document.querySelector('input[name="foodCount"]:checked').value);
	state.gameMode = document.querySelector('input[name="gameMode"]:checked').value;
	
	// Handle Trophy Mode
	if (state.gameMode === 'trophy') {
		state.mapSize = 'small';
		state.gameSpeed = 'fast';
		state.foodCount = 1;
		currentModeEl.textContent = 'Trophy Mode: Small (13x13), Fast, 1 Food';
	} else {
		const sizeLabel = state.mapSize === 'small' ? '13x13' : state.mapSize === 'normal' ? '17x17' : '21x21';
		currentModeEl.textContent = `Free Play: ${state.mapSize} ${sizeLabel}, ${state.gameSpeed}`;
	}
	
	// Apply settings
	const sizeConfig = SIZE_PRESETS[state.mapSize];
	state.gridCols = sizeConfig.gridCols;
	state.gridRows = sizeConfig.gridRows;
	state.speed = SPEED_PRESETS[state.gameSpeed];
	if (state.gameMode !== 'trophy') {
		currentModeEl.textContent = `Free Play: ${state.mapSize} ${state.gridCols}x${state.gridRows}, ${state.gameSpeed}`;
	}
	
	startGame();
}

function startGame() {
	// Hide overlay menu and reveal board
	gameMenu.hidden = true;
	menuButtons.hidden = true;
	settingsPanel.hidden = true;
	if (menuBackdrop) menuBackdrop.hidden = true;
	canvas.hidden = false;
	playAgainOverlay.hidden = true;
	backMenuBtn.hidden = true;
	
	resizeCanvasForBoard();
	
	boardMetaEl.textContent = `${state.gridCols} x ${state.gridRows}`;
	
	// Initialize snake (3 segments in middle)
	const startX = Math.floor(state.gridCols / 2);
	const startY = Math.floor(state.gridRows / 2);
	state.snake = [
		{ x: startX, y: startY },
		{ x: startX - 1, y: startY },
		{ x: startX - 2, y: startY },
	];
	
	state.direction = { x: 1, y: 0 };
	state.nextDirection = { x: 1, y: 0 };
	state.previousSnake = state.snake.map((segment) => ({ ...segment }));
	state.lastTickAt = performance.now();
	state.bumpAnimation = null;
	state.hiddenTailSegments = 0;
	state.hasReceivedInput = false;
	state.foodEaten = 0;
	state.gameEnded = false;
	state.gamePaused = false;
	state.elapsedSeconds = 0;
	if (liveTimer) liveTimer.textContent = '0s';
	state.startTime = Date.now();
	state.crashPosition = null;
	state.crashTimer = 0;
	
	// Place initial food
	state.foods = [];
	placeFirstFoodInFront();
	for (let i = 1; i < state.foodCount; i++) {
		placeFood();
	}
	
	// Update HUD
	if (liveScore) liveScore.textContent = '0';
	if (liveLength) liveLength.textContent = '3';
	
	// Setup admin
	refreshSnakeAdminUi();
	
	// Start game loop
	renderFrame();
	updateRoundStrip();
}

function placeFood() {
	let validPosition = false;
	let newFood;
	while (!validPosition) {
		newFood = {
			x: Math.floor(Math.random() * state.gridCols),
			y: Math.floor(Math.random() * state.gridRows),
		};
		validPosition = true;
		// Check if overlaps with snake
		for (const segment of state.snake) {
			if (segment.x === newFood.x && segment.y === newFood.y) {
				validPosition = false;
				break;
			}
		}
		// Check if overlaps with existing food
		for (const food of state.foods) {
			if (food.x === newFood.x && food.y === newFood.y) {
				validPosition = false;
				break;
			}
		}
	}
	state.foods.push(newFood);
}

function placeFirstFoodInFront() {
	const head = state.snake[0];
	const front = {
		x: head.x + state.direction.x,
		y: head.y + state.direction.y,
	};

	const inBounds =
		front.x >= 0 &&
		front.x < state.gridCols &&
		front.y >= 0 &&
		front.y < state.gridRows;

	const overlapsSnake = state.snake.some((segment) => segment.x === front.x && segment.y === front.y);
	const overlapsFood = state.foods.some((food) => food.x === front.x && food.y === front.y);

	if (inBounds && !overlapsSnake && !overlapsFood) {
		state.foods.push(front);
		return;
	}

	placeFood();
}

function startTimer() {
	if (state.timerIntervalId) return;
	state.timerIntervalId = window.setInterval(() => {
		state.elapsedSeconds += 1;
		if (liveTimer) liveTimer.textContent = `${state.elapsedSeconds}s`;
	}, 1000);
}

function stopTimer() {
	if (state.timerIntervalId) {
		window.clearInterval(state.timerIntervalId);
		state.timerIntervalId = null;
	}
}

function startGameLoop() {
	if (state.gameLoopId) return;
	state.gameLoopId = window.setInterval(() => {
		gameLoopTick();
	}, state.speed);
}

function stopGameLoop() {
	if (state.gameLoopId) {
		window.clearInterval(state.gameLoopId);
		state.gameLoopId = null;
	}
}

function gameLoopTick() {
	if (state.gamePaused || state.gameEnded || state.bumpAnimation) return;
	state.previousSnake = state.snake.map((segment) => ({ ...segment }));
	
	state.direction = state.nextDirection;
	
	const head = state.snake[0];
	const newHead = {
		x: head.x + state.direction.x,
		y: head.y + state.direction.y,
	};
	
	// Wall collision
	if (
		newHead.x < 0 ||
		newHead.x >= state.gridCols ||
		newHead.y < 0 ||
		newHead.y >= state.gridRows
	) {
		startBumpAnimation(head, newHead);
		return;
	}
	
	// Self collision
	for (const segment of state.snake) {
		if (segment.x === newHead.x && segment.y === newHead.y) {
			startBumpAnimation(head, newHead);
			return;
		}
	}
	
	state.snake.unshift(newHead);
	
	// Check food collision
	let foodEaten = false;
	for (let i = 0; i < state.foods.length; i++) {
		const food = state.foods[i];
		if (food.x === newHead.x && food.y === newHead.y) {
			state.foodEaten += 1;
			foodEaten = true;
			state.foods.splice(i, 1);
			placeFood();
			break;
		}
	}
	
	if (!foodEaten) {
		state.snake.pop();
	}

	if (state.hiddenTailSegments > 0) {
		state.hiddenTailSegments = 0;
	}

	state.lastTickAt = performance.now();
	
	updateRoundStrip();
}

function startBumpAnimation(head, attemptedHead) {
	stopGameLoop();
	stopTimer();
	state.bumpAnimation = {
		from: { x: head.x, y: head.y },
		to: { x: attemptedHead.x, y: attemptedHead.y },
		startAt: performance.now(),
		duration: 150,
	};
}

function endGame() {
	state.gameEnded = true;
	stopGameLoop();
	stopTimer();
	
	// Update best scores
	if (state.gameMode === 'freeplay') {
		if (state.foodEaten > state.bestScores.freePlay) {
			state.bestScores.freePlay = state.foodEaten;
			saveBestScores();
		}
	} else {
		if (state.foodEaten > state.bestScores.trophy) {
			state.bestScores.trophy = state.foodEaten;
			saveBestScores();
		}
	}
	
	renderBestScores();
	playAgainOverlay.hidden = false;
	backMenuBtn.hidden = false;
	updateRoundStrip();
}

function togglePause() {
	if (state.gameEnded) return;
	state.gamePaused = !state.gamePaused;
	backMenuBtn.hidden = !state.gamePaused;
	if (!state.gamePaused) {
		startGameLoop();
		if (state.gameMode === 'trophy') {
			startTimer();
		}
	} else {
		stopGameLoop();
		stopTimer();
	}
	updateRoundStrip();
}

function getInterpolatedSnake(progress) {
	if (
		!state.hasReceivedInput ||
		state.gamePaused ||
		state.gameEnded ||
		!Array.isArray(state.previousSnake) ||
		state.previousSnake.length === 0
	) {
		return state.snake;
	}

	const eased = 1 - Math.pow(1 - progress, 3);
	return state.snake.map((segment, index) => {
		const previous = state.previousSnake[index] || segment;
		return {
			x: previous.x + (segment.x - previous.x) * eased,
			y: previous.y + (segment.y - previous.y) * eased,
		};
	});
}

function getBumpHeadPosition(now) {
	if (!state.bumpAnimation) return null;
	const elapsed = now - state.bumpAnimation.startAt;
	const t = Math.max(0, Math.min(1, elapsed / state.bumpAnimation.duration));
	const from = state.bumpAnimation.from;
	const to = state.bumpAnimation.to;

	const forward = t <= 0.5 ? t * 2 : (1 - t) * 2;
	const eased = 1 - Math.pow(1 - forward, 3);

	return {
		x: from.x + (to.x - from.x) * eased,
		y: from.y + (to.y - from.y) * eased,
		finished: t >= 1,
	};
}

function renderFrame(now = performance.now()) {
	const maxCells = Math.max(state.gridCols, state.gridRows);
	const cell = canvas.width / maxCells;
	const offsetX = Math.floor((canvas.width - state.gridCols * cell) / 2);
	const offsetY = Math.floor((canvas.height - state.gridRows * cell) / 2);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let row = 0; row < state.gridRows; row += 1) {
		for (let col = 0; col < state.gridCols; col += 1) {
			ctx.fillStyle = (row + col) % 2 === 0 ? '#18243f' : '#141f36';
			ctx.fillRect(offsetX + col * cell, offsetY + row * cell, cell, cell);
		}
	}

	const stepProgress = state.hasReceivedInput
		? Math.max(0, Math.min(1, (now - state.lastTickAt) / Math.max(1, state.speed)))
		: 1;
	const animatedSnake = getInterpolatedSnake(stepProgress);
	const bumpHead = getBumpHeadPosition(now);

	if (bumpHead?.finished) {
		state.bumpAnimation = null;
		endGame();
		return;
	}

	animatedSnake.forEach((segment, index) => {
		const drawSegment = index === 0 && bumpHead
			? { x: bumpHead.x, y: bumpHead.y }
			: segment;

		if (!state.hasReceivedInput && index >= state.snake.length - state.hiddenTailSegments) {
			return;
		}

		ctx.fillStyle = index === 0 ? '#7cf0c5' : '#4bb985';
		ctx.fillRect(
			offsetX + drawSegment.x * cell + 1,
			offsetY + drawSegment.y * cell + 1,
			cell - 2,
			cell - 2,
		);
	});

	state.foods.forEach((food) => {
		ctx.fillStyle = '#ff6b6b';
		ctx.fillRect(
			offsetX + food.x * cell + 1,
			offsetY + food.y * cell + 1,
			cell - 2,
			cell - 2,
		);
	});

	if (state.gameMode && !state.hasReceivedInput && !state.gameEnded) {
		ctx.fillStyle = 'rgba(7, 12, 22, 0.62)';
		ctx.fillRect(offsetX, offsetY + cell * 6, state.gridCols * cell, cell * 3);
		ctx.fillStyle = '#ecf2ff';
		ctx.textAlign = 'center';
		ctx.font = 'bold 16px Segoe UI';
		ctx.fillText('Press Arrow Keys or WASD to start', canvas.width / 2, offsetY + cell * 7.7);
	}
}

function renderLoop() {
	renderFrame(performance.now());
	state.renderLoopId = window.requestAnimationFrame(renderLoop);
}

function openSettingsFromPostGame() {
	playAgainOverlay.hidden = true;
	state.gameMode = null;
	state.hasReceivedInput = false;
	gameMenu.hidden = false;
	menuButtons.hidden = true;
	settingsPanel.hidden = false;
	if (menuBackdrop) menuBackdrop.hidden = false;
	updateRoundStrip();
}

function refreshSnakeAdminUi() {
	if (!adminTools) return;
	adminAddFoodBtn.disabled = !state.adminEnabled || state.gameEnded;
	adminClearBoardBtn.disabled = !state.adminEnabled || state.gameEnded;
	adminSpeedInput.disabled = !state.adminEnabled;
	adminApplySpeedBtn.disabled = !state.adminEnabled;
	if (adminScoreInput) adminScoreInput.disabled = !state.adminEnabled;
	if (adminApplyScoreBtn) adminApplyScoreBtn.disabled = !state.adminEnabled;
	if (adminResetScoresBtn) adminResetScoresBtn.disabled = !state.adminEnabled;
	if (adminRevertScoresBtn) adminRevertScoresBtn.disabled = !state.adminEnabled || !state.adminScoreSnapshot;
}

function init() {
	renderBestScores();
	state.adminSidebarOpen = isOwnerAccount();
	refreshAdminSidebarUi();
	
	// Setup admin toolkit
	const adminConfig = {
		gameState: state,
		elements: {
			adminTools,
			adminModeBtn,
			adminInfo,
		},
		callbacks: {
			onClearBoard: () => {
				state.snake = [];
				state.foods = [];
				for (let i = 0; i < state.foodCount; i++) {
					placeFood();
				}
				renderFrame();
			},
			onRefreshUI: () => {
				refreshSnakeAdminUi();
			},
		},
	};
	adminAPI = AdminToolkit.init(adminConfig);
	refreshSnakeAdminUi();

	if (adminSidebarToggleBtn) {
		adminSidebarToggleBtn.addEventListener('click', () => {
			if (!isOwnerAccount()) return;
			state.adminSidebarOpen = !state.adminSidebarOpen;
			refreshAdminSidebarUi();
		});
	}

	window.addEventListener('playr-auth-changed', () => {
		if (!isOwnerAccount()) {
			state.adminEnabled = false;
			state.adminMineEdit = false;
		}
		if (isOwnerAccount() && !state.adminSidebarOpen) {
			state.adminSidebarOpen = true;
		}
		refreshAdminSidebarUi();
		refreshSnakeAdminUi();
	});
	
	// Menu button handlers
	initMenu();
	if (gameStatus) gameStatus.textContent = '';
	renderLoop();
	
	// Back to menu
	backMenuBtn.addEventListener('click', () => {
		if (!state.gamePaused && !state.gameEnded) return;
		stopGameLoop();
		stopTimer();
		state.foodEaten = 0;
		state.gameMode = null;
		initMenu();
	});
	
	// Play again
	if (playAgainBtn) {
		playAgainBtn.addEventListener('click', () => {
			startGame();
		});
	}

	if (playAgainSettingsBtn) {
		playAgainSettingsBtn.addEventListener('click', () => {
			openSettingsFromPostGame();
		});
	}
	
	// Admin controls
	adminAddFoodBtn.addEventListener('click', () => {
		if (state.adminEnabled && !state.gameEnded && state.foods.length < 10) {
			placeFood();
			renderFrame();
		}
	});
	
	adminClearBoardBtn.addEventListener('click', () => {
		if (state.adminEnabled && !state.gameEnded) {
			adminAPI.clearBoard();
		}
	});
	
	adminApplySpeedBtn.addEventListener('click', () => {
		const parsed = Number(adminSpeedInput.value);
		if (!Number.isFinite(parsed) || parsed < 50) return;
		state.speed = parsed;
		if (state.gameLoopId) {
			stopGameLoop();
			startGameLoop();
		}
	});

	if (adminApplyScoreBtn) {
		adminApplyScoreBtn.addEventListener('click', () => {
			if (!state.adminEnabled) return;
			applyAdminScoreOverride(adminScoreInput?.value);
		});
	}

	if (adminResetScoresBtn) {
		adminResetScoresBtn.addEventListener('click', () => {
			resetAdminScores();
		});
	}

	if (adminRevertScoresBtn) {
		adminRevertScoresBtn.addEventListener('click', () => {
			revertAdminScores();
		});
	}
	
	// Input handling
	window.addEventListener('keydown', (event) => {
		if (state.gameEnded || state.gamePaused || !state.gameMode) return;
		
		const key = event.key.toLowerCase();
		let newDir = null;
		
		if (key === 'arrowup' || key === 'w') {
			newDir = { x: 0, y: -1 };
		} else if (key === 'arrowdown' || key === 's') {
			newDir = { x: 0, y: 1 };
		} else if (key === 'arrowleft' || key === 'a') {
			newDir = { x: -1, y: 0 };
		} else if (key === 'arrowright' || key === 'd') {
			newDir = { x: 1, y: 0 };
		}
		
		if (newDir && !(newDir.x === -state.direction.x && newDir.y === -state.direction.y)) {
			state.nextDirection = newDir;
			if (!state.hasReceivedInput) {
				state.hasReceivedInput = true;
				if (state.gameMode === 'trophy') startTimer();
				gameLoopTick();
				startGameLoop();
				updateRoundStrip();
			}
			event.preventDefault();
		}
	});
	
	// Pause on Space
	window.addEventListener('keydown', (event) => {
		if (event.code === 'Space' && state.gameMode && !state.gameEnded) {
			event.preventDefault();
			togglePause();
		}
	});
	
	window.addEventListener('resize', () => {
		if (state.gameMode) {
			resizeCanvasForBoard();
		} else {
			renderIdlePreview();
		}
	});

	if (playBtn) {
		playBtn.addEventListener('click', () => {
			startGameCustom();
		});
	}

	if (settingsBtn) {
		settingsBtn.addEventListener('click', () => {
			openSettingsMenu();
		});
	}

	if (backSettingsBtn) {
		backSettingsBtn.addEventListener('click', () => {
			backToLaunchPrompt();
		});
	}
}

init();
