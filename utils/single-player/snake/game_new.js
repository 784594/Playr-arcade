// Game configuration by size and speed
const SIZE_PRESETS = {
	small: { gridCols: 10, gridRows: 9 },
	normal: { gridCols: 17, gridRows: 15 },
	large: { gridCols: 24, gridRows: 21 },
};

const SPEED_PRESETS = {
	slow: 150,
	medium: 100,
	fast: 50,
};

const BEST_KEY = 'playr.snake.bestScores.v2';

// DOM elements
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const gameMenu = document.getElementById('gameMenu');
const inGamePanel = document.getElementById('inGamePanel');
const menuButtons = document.getElementById('menuButtons');
const settingsPanel = document.getElementById('settingsPanel');
const playBtn = document.getElementById('playBtn');
const settingsBtn = document.getElementById('settingsBtn');
const hudDisplay = document.getElementById('hudDisplay');
const hudScore = document.getElementById('hudScore');
const hudLength = document.getElementById('hudLength');
const hudTimer = document.getElementById('hudTimer');
const hudTime = document.getElementById('hudTime');
const boardMetaEl = document.getElementById('boardMeta');
const currentModeEl = document.getElementById('currentMode');
const pauseBtn = document.getElementById('pauseBtn');
const playAgainOverlay = document.getElementById('playAgainOverlay');
const backMenuBtn = document.getElementById('backMenuBtn');
const gameStatus = document.getElementById('gameStatus');
const adminTools = document.getElementById('adminTools');
const adminModeBtn = document.getElementById('adminModeBtn');
const adminAddFoodBtn = document.getElementById('adminAddFoodBtn');
const adminClearBoardBtn = document.getElementById('adminClearBoardBtn');
const adminSpeedInput = document.getElementById('adminSpeedInput');
const adminApplySpeedBtn = document.getElementById('adminApplySpeedBtn');
const adminInfo = document.getElementById('adminInfo');

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
	
	// Crash animation state
	crashPosition: null,
	crashTimer: 0,
	
	bestScores: loadBestScores(),
	
	adminEnabled: false,
	adminMineEdit: false,
	adminCustomMines: false,
};

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

// Initialize menu
function initMenu() {
	gameMenu.hidden = false;
	inGamePanel.hidden = true;
	canvas.hidden = true;
	hudDisplay.hidden = true;
	playAgainOverlay.hidden = true;
	menuButtons.hidden = false;
	settingsPanel.hidden = true;
	renderBestScores();
}

// Show settings panel
function showSettings() {
	menuButtons.hidden = true;
	settingsPanel.hidden = false;
}

// Go back to button menu
function backToMenu() {
	menuButtons.hidden = false;
	settingsPanel.hidden = true;
}

// Start free play with default settings (normal, medium, 1 food)
function startFreePlayDefault() {
	state.mapSize = 'normal';
	state.gameSpeed = 'medium';
	state.foodCount = 1;
	state.gameMode = 'freeplay';
	
	// Apply settings
	const sizeConfig = SIZE_PRESETS[state.mapSize];
	state.gridCols = sizeConfig.gridCols;
	state.gridRows = sizeConfig.gridRows;
	state.speed = SPEED_PRESETS[state.gameSpeed];
	
	currentModeEl.textContent = `Free Play: Normal 17x15, Medium, 1 Food`;
	startGame();
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
		currentModeEl.textContent = `Trophy Mode: Small (10x9), Fast, 1 Food`;
	} else {
		const sizeLabel = state.mapSize === 'small' ? '10x9' : state.mapSize === 'normal' ? '17x15' : '24x21';
		currentModeEl.textContent = `Free Play: ${state.mapSize} ${sizeLabel}, ${state.gameSpeed}`;
	}
	
	// Apply settings
	const sizeConfig = SIZE_PRESETS[state.mapSize];
	state.gridCols = sizeConfig.gridCols;
	state.gridRows = sizeConfig.gridRows;
	state.speed = SPEED_PRESETS[state.gameSpeed];
	
	startGame();
}

function startGame() {
	// Hide menu, show game
	gameMenu.hidden = true;
	inGamePanel.hidden = false;
	canvas.hidden = false;
	hudDisplay.hidden = false;
	pauseBtn.textContent = 'Pause';
	
	// Resize canvas based on grid - make it square-ish
	// Use square cells to make the board more square
	const availableWidth = Math.min(500, window.innerWidth - 350);
	const availableHeight = 500;
	const cellSizeX = Math.floor(availableWidth / state.gridCols);
	const cellSizeY = Math.floor(availableHeight / state.gridRows);
	const cellSize = Math.min(cellSizeX, cellSizeY);
	
	canvas.width = state.gridCols * cellSize;
	canvas.height = state.gridRows * cellSize;
	
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
	state.hasReceivedInput = false;
	state.foodEaten = 0;
	state.gameEnded = false;
	state.gamePaused = false;
	state.elapsedSeconds = 0;
	state.startTime = Date.now();
	state.crashPosition = null;
	state.crashTimer = 0;
	
	// Place initial food
	state.foods = [];
	for (let i = 0; i < state.foodCount; i++) {
		placeFood();
	}
	
	// Update HUD
	if (state.gameMode === 'trophy') {
		hudTimer.hidden = false;
		startTimer();
	} else {
		hudTimer.hidden = true;
	}
	
	hudScore.textContent = '0';
	hudLength.textContent = '3';
	
	// Setup admin
	refreshSnakeAdminUi();
	
	// Start game loop
	renderFrame();
	// Don't start game loop - wait for first input!
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

function startTimer() {
	if (state.timerIntervalId) return;
	state.timerIntervalId = window.setInterval(() => {
		state.elapsedSeconds += 1;
		hudTime.textContent = `${state.elapsedSeconds}s`;
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
	if (state.gamePaused || state.gameEnded) return;
	
	state.direction = state.nextDirection;
	
	const head = state.snake[0];
	const newHead = {
		x: head.x + state.direction.x,
		y: head.y + state.direction.y,
	};
	
	// Check if we crashed
	let crashed = false;
	
	// Wall collision
	if (
		newHead.x < 0 ||
		newHead.x >= state.gridCols ||
		newHead.y < 0 ||
		newHead.y >= state.gridRows
	) {
		crashed = true;
	}
	
	// Self collision
	if (!crashed) {
		for (const segment of state.snake) {
			if (segment.x === newHead.x && segment.y === newHead.y) {
				crashed = true;
				break;
			}
		}
	}
	
	if (crashed) {
		// Show crash animation - overlap then move back
		state.crashPosition = newHead;
		state.crashTimer = 100; // milliseconds
		renderFrame();
		
		// Set timeout to move back
		setTimeout(() => {
			endGame();
		}, state.crashTimer);
		return;
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
			hudScore.textContent = state.foodEaten;
			placeFood();
			break;
		}
	}
	
	if (!foodEaten) {
		state.snake.pop();
	}
	
	hudLength.textContent = state.snake.length;
	renderFrame();
}

function endGame() {
	state.gameEnded = true;
	stopGameLoop();
	stopTimer();
	state.crashPosition = null;
	
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
}

function togglePause() {
	if (state.gameEnded) return;
	state.gamePaused = !state.gamePaused;
	pauseBtn.textContent = state.gamePaused ? 'Resume' : 'Pause';
	if (!state.gamePaused) {
		startGameLoop();
		if (state.gameMode === 'trophy') {
			startTimer();
		}
	} else {
		stopGameLoop();
		stopTimer();
	}
}

function renderFrame() {
	const cellWidth = canvas.width / state.gridCols;
	const cellHeight = canvas.height / state.gridRows;
	
	// Clear canvas
	ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// Draw checkerboard grid with two shades
	const color1 = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
	const color2 = getComputedStyle(document.documentElement).getPropertyValue('--panel').trim();
	
	for (let row = 0; row < state.gridRows; row++) {
		for (let col = 0; col < state.gridCols; col++) {
			// Alternate colors
			const isEven = (row + col) % 2 === 0;
			ctx.fillStyle = isEven ? color1 : color2;
			ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
		}
	}
	
	// Draw grid lines for clarity
	ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#999';
	ctx.globalAlpha = 0.1;
	ctx.lineWidth = 1;
	for (let i = 0; i <= state.gridCols; i++) {
		ctx.beginPath();
		ctx.moveTo(i * cellWidth, 0);
		ctx.lineTo(i * cellWidth, canvas.height);
		ctx.stroke();
	}
	for (let i = 0; i <= state.gridRows; i++) {
		ctx.beginPath();
		ctx.moveTo(0, i * cellHeight);
		ctx.lineTo(canvas.width, i * cellHeight);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
	
	// Draw snake
	state.snake.forEach((segment, index) => {
		if (index === 0) {
			ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		} else {
			ctx.fillStyle = '#4a9f5f';
		}
		const x = segment.x * cellWidth + 1;
		const y = segment.y * cellHeight + 1;
		ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
	});
	
	// Draw crash animation - semi-transparent overlap
	if (state.crashPosition) {
		ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		ctx.globalAlpha = 0.6;
		const x = state.crashPosition.x * cellWidth + 1;
		const y = state.crashPosition.y * cellHeight + 1;
		ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
		ctx.globalAlpha = 1;
	}
	
	// Draw food
	state.foods.forEach((food) => {
		ctx.fillStyle = '#ff6b6b';
		const x = food.x * cellWidth + 1;
		const y = food.y * cellHeight + 1;
		ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
	});
}

function refreshSnakeAdminUi() {
	if (!adminTools) return;
	adminAddFoodBtn.disabled = !state.adminEnabled || state.gameEnded;
	adminClearBoardBtn.disabled = !state.adminEnabled || state.gameEnded;
	adminSpeedInput.disabled = !state.adminEnabled;
	adminApplySpeedBtn.disabled = !state.adminEnabled;
}

function init() {
	gameStatus.textContent = 'Snake ready.';
	renderBestScores();
	
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
	
	// Menu button handlers
	initMenu();
	playBtn.addEventListener('click', startFreePlayDefault);
	settingsBtn.addEventListener('click', showSettings);
	document.getElementById('backSettingsBtn').addEventListener('click', backToMenu);
	document.getElementById('startGameBtn').addEventListener('click', startGameCustom);
	
	// Pause button
	pauseBtn.addEventListener('click', togglePause);
	
	// Back to menu
	backMenuBtn.addEventListener('click', () => {
		stopGameLoop();
		stopTimer();
		state.gameMode = null;
		initMenu();
	});
	
	// Play again
	playAgainOverlay.addEventListener('click', () => {
		playAgainOverlay.hidden = true;
		startGame();
	});
	
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
	
	// Input handling - don't move until first input
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
			
			// Start game loop on first input
			if (!state.hasReceivedInput && !state.gameEnded) {
				state.hasReceivedInput = true;
				startGameLoop();
				if (state.gameMode === 'trophy') {
					startTimer();
				}
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
		if (state.gameMode && !state.gameEnded) {
			renderFrame();
		}
	});
}

init();
