const STORAGE_KEY = 'playr.dinoRun.bestDistances.v1';

const canvas = document.getElementById('dinoCanvas');
const ctx = canvas.getContext('2d');

const gameStatus = document.getElementById('gameStatus');
const runStateEl = document.getElementById('runState');
const distanceStatEl = document.getElementById('distanceStat');
const speedStatEl = document.getElementById('speedStat');
const currentDistanceEl = document.getElementById('currentDistance');
const bestDistanceEl = document.getElementById('bestDistance');
const currentSpeedEl = document.getElementById('currentSpeed');
const boardMetaEl = document.getElementById('boardMeta');
const bestRunsList = document.getElementById('bestRunsList');
const leaderboardPreviewBody = document.getElementById('leaderboardPreviewBody');

const overlayPanel = document.getElementById('overlayPanel');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const overlayStartBtn = document.getElementById('overlayStartBtn');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const jumpBtn = document.getElementById('jumpBtn');
const duckBtn = document.getElementById('duckBtn');

const DINO_WIDTH = 44;
const DINO_STAND_HEIGHT = 52;
const DINO_CROUCH_HEIGHT = 34;

const state = {
	started: false,
	running: false,
	gameOver: false,
	lastFrame: 0,
	elapsedSeconds: 0,
	distance: 0,
	speedScale: 1,
	obstacleTimer: 0,
	nextObstacleAfter: 1,
	groundOffset: 0,
	stars: makeStars(),
	obstacles: [],
	dino: {
		x: 96,
		y: 0,
		width: DINO_WIDTH,
		height: DINO_STAND_HEIGHT,
		velocityY: 0,
		onGround: true,
		crouch: false,
	},
	duckHeld: false,
	bestRuns: loadBestRuns(),
	rafId: 0,
};

function getDifficultyTier() {
	return Math.min(8, Math.floor(state.distance / 220));
}

function makeStars() {
	return Array.from({ length: 18 }, () => ({
		x: Math.random() * 1,
		y: Math.random() * 0.5,
		size: 1 + Math.random() * 2,
		alpha: 0.45 + Math.random() * 0.5,
	}));
}

function loadBestRuns() {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		if (!Array.isArray(parsed)) return [0, 0, 0, 0, 0];
		const valid = parsed
			.map((value) => Number.parseInt(String(value), 10))
			.filter((value) => Number.isFinite(value) && value >= 0)
			.sort((a, b) => b - a)
			.slice(0, 5);
		while (valid.length < 5) valid.push(0);
		return valid;
	} catch {
		return [0, 0, 0, 0, 0];
	}
}

function saveBestRuns() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bestRuns.slice(0, 5)));
}

function updateBestRuns(distance) {
	state.bestRuns.push(distance);
	state.bestRuns = state.bestRuns
		.map((value) => Number.parseInt(String(value), 10))
		.filter((value) => Number.isFinite(value) && value >= 0)
		.sort((a, b) => b - a)
		.slice(0, 5);
	while (state.bestRuns.length < 5) state.bestRuns.push(0);
	saveBestRuns();
}

function groundY() {
	return canvas.height - 62;
}

function gravity() {
	return 2250;
}

function jumpImpulse() {
	return -835;
}

function obstacleSpeed() {
	return 355 * state.speedScale;
}

function showStatus(message, hold = 1300) {
	if (!gameStatus) return;
	gameStatus.textContent = message;
	if (hold > 0) {
		window.setTimeout(() => {
			if (gameStatus.textContent === message) {
				gameStatus.textContent = '';
			}
		}, hold);
	}
}

function resizeCanvas() {
	const width = Math.max(560, Math.min(1040, Math.floor((canvas.parentElement?.clientWidth || 900) - 4)));
	const height = Math.max(300, Math.min(460, Math.floor(width * 0.38)));
	canvas.width = width;
	canvas.height = height;
	state.dino.y = groundY() - state.dino.height;
	render();
}

function spawnObstacle() {
	const tier = getDifficultyTier();
	const flyingChance = Math.min(0.34, Math.max(0, (tier - 2) * 0.06));
	const flying = Math.random() < flyingChance;

	if (flying) {
		const width = 44;
		const height = 24;
		const flightHeight = 54 + Math.min(16, tier * 2);
		state.obstacles.push({
			type: 'flying',
			x: canvas.width + 40,
			y: groundY() - flightHeight,
			width,
			height,
		});
		return;
	}

	const variant = Math.random();
	let width = 20;
	let height = 44;

	if (variant > 0.72) {
		width = 34;
		height = 60;
	} else if (variant > 0.42) {
		width = 27;
		height = 52;
	}

	if (tier >= 5 && Math.random() > 0.8) {
		width = 56;
		height = 32;
	}

	state.obstacles.push({
		type: 'ground',
		x: canvas.width + 40,
		y: groundY() - height,
		width,
		height,
	});
}

function setDuck(isActive) {
	state.duckHeld = isActive;
	if (!state.running || !state.dino.onGround) return;

	const targetHeight = isActive ? DINO_CROUCH_HEIGHT : DINO_STAND_HEIGHT;
	if (state.dino.height === targetHeight) return;

	state.dino.height = targetHeight;
	state.dino.y = groundY() - state.dino.height;
	state.dino.crouch = isActive;
}

function jump() {
	if (!state.started || state.gameOver) {
		startGame();
		return;
	}
	if (!state.running) return;
	if (state.dino.onGround) {
		setDuck(false);
		state.dino.velocityY = jumpImpulse();
		state.dino.onGround = false;
	}
}

function startGame() {
	state.started = true;
	state.running = true;
	state.gameOver = false;
	state.lastFrame = performance.now();
	state.elapsedSeconds = 0;
	state.distance = 0;
	state.speedScale = 1;
	state.obstacleTimer = 0;
	state.nextObstacleAfter = 1 + Math.random() * 0.65;
	state.groundOffset = 0;
	state.obstacles = [];
	state.duckHeld = false;
	state.dino.y = groundY() - state.dino.height;
	state.dino.velocityY = 0;
	state.dino.onGround = true;
	state.dino.height = DINO_STAND_HEIGHT;
	state.dino.crouch = false;

	overlayPanel.hidden = true;
	runStateEl.textContent = 'Running';
	boardMetaEl.textContent = 'Jump to survive, speed increases over time';
	showStatus('Run started. Keep jumping.', 900);
}

function resetToMenu() {
	state.started = false;
	state.running = false;
	state.gameOver = false;
	state.elapsedSeconds = 0;
	state.distance = 0;
	state.speedScale = 1;
	state.obstacles = [];
	state.duckHeld = false;
	state.dino.height = DINO_STAND_HEIGHT;
	state.dino.y = groundY() - state.dino.height;
	state.dino.velocityY = 0;
	state.dino.onGround = true;
	state.dino.crouch = false;

	runStateEl.textContent = '';
	boardMetaEl.textContent = 'Tap or press jump to start';
	overlayTitle.textContent = 'Dino Run';
	overlayText.textContent = 'Jump over obstacles and survive as the pace increases.';
	overlayStartBtn.textContent = 'Start Run';
	overlayPanel.hidden = false;
}

function endGame() {
	state.running = false;
	state.gameOver = true;
	const runDistance = Math.max(0, Math.floor(state.distance));
	updateBestRuns(runDistance);

	const isBest = runDistance >= state.bestRuns[0] && runDistance > 0;
	runStateEl.textContent = 'Game Over';
	overlayTitle.textContent = 'Run Over';
	overlayText.textContent = isBest
		? `New best: ${runDistance}m. Push farther next run.`
		: `Distance: ${runDistance}m. Press Play Again.`;
	overlayStartBtn.textContent = 'Play Again';
	overlayPanel.hidden = false;

	boardMetaEl.textContent = `Final distance: ${runDistance}m`;
	showStatus(isBest ? 'New best distance saved.' : `Run ended at ${runDistance}m.`, 1300);
	syncStats();
}

function intersects(a, b) {
	return (
		a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y
	);
}

function update(deltaSeconds) {
	if (!state.running) return;

	state.elapsedSeconds += deltaSeconds;
	const tier = getDifficultyTier();
	state.speedScale = Math.min(3.8, 1 + state.elapsedSeconds * 0.06 + tier * 0.1);
	state.distance += (125 + state.speedScale * 85) * deltaSeconds;

	state.dino.velocityY += gravity() * deltaSeconds;
	state.dino.y += state.dino.velocityY * deltaSeconds;

	const floorY = groundY() - state.dino.height;
	if (state.dino.y >= floorY) {
		state.dino.y = floorY;
		state.dino.velocityY = 0;
		state.dino.onGround = true;
		if (state.duckHeld) {
			setDuck(true);
		} else {
			setDuck(false);
		}
	}

	state.obstacleTimer += deltaSeconds;
	if (state.obstacleTimer >= state.nextObstacleAfter) {
		spawnObstacle();
		state.obstacleTimer = 0;
		const spawnBase = Math.max(0.34, 1.22 - state.speedScale * 0.2 - tier * 0.04);
		state.nextObstacleAfter = spawnBase + Math.random() * 0.45;

		if (tier >= 4 && Math.random() < 0.14 + tier * 0.015) {
			state.nextObstacleAfter *= 0.7;
		}
	}

	const speed = obstacleSpeed();
	state.obstacles.forEach((obstacle) => {
		const typeBoost = obstacle.type === 'flying' ? 1.05 : 1;
		obstacle.x -= speed * typeBoost * deltaSeconds;
	});
	state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -8);

	state.groundOffset = (state.groundOffset + speed * deltaSeconds) % 46;

	const dinoHitbox = {
		x: state.dino.x + 8,
		y: state.dino.y + (state.dino.crouch ? 10 : 7),
		width: state.dino.width - 14,
		height: state.dino.height - (state.dino.crouch ? 12 : 10),
	};

	const collided = state.obstacles.some((obstacle) => intersects(dinoHitbox, obstacle));
	if (collided) {
		endGame();
	}

	syncStats();
}

function drawSky() {
	const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
	sky.addColorStop(0, '#16294d');
	sky.addColorStop(1, '#0d1629');
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	state.stars.forEach((star) => {
		ctx.globalAlpha = star.alpha;
		ctx.fillStyle = '#dce8ff';
		ctx.fillRect(star.x * canvas.width, star.y * canvas.height, star.size, star.size);
	});
	ctx.globalAlpha = 1;
}

function drawGround() {
	const y = groundY();

	ctx.fillStyle = '#1a2f53';
	ctx.fillRect(0, y, canvas.width, canvas.height - y);

	ctx.strokeStyle = '#95c2ff';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, y + 1);
	ctx.lineTo(canvas.width, y + 1);
	ctx.stroke();

	ctx.fillStyle = '#7fa8da';
	for (let x = -state.groundOffset; x < canvas.width; x += 46) {
		ctx.fillRect(x, y + 18, 26, 4);
	}
}

function drawDino() {
	const x = state.dino.x;
	const y = state.dino.y;
	const width = state.dino.width;
	const height = state.dino.height;

	ctx.fillStyle = '#a4d8ff';
	ctx.fillRect(x + 8, y + 2, width - 8, height - 2);
	if (!state.dino.crouch) {
		ctx.fillRect(x + 30, y - 10, 18, 18);
	} else {
		ctx.fillRect(x + 28, y + 2, 20, 12);
	}
	ctx.fillStyle = '#0a1528';
	ctx.fillRect(x + 41, y + (state.dino.crouch ? 6 : -3), 3, 3);

	const legShift = state.dino.onGround ? Math.sin(state.elapsedSeconds * 20) * 4 : 0;
	ctx.fillStyle = '#89bee9';
	ctx.fillRect(x + 12, y + height - 3, 7, Math.max(8, 12 + legShift));
	ctx.fillRect(x + 28, y + height - 3, 7, Math.max(8, 12 - legShift));
	ctx.fillRect(x + 3, y + 16, 10, 6);
}

function drawObstacles() {
	state.obstacles.forEach((obstacle) => {
		if (obstacle.type === 'flying') {
			ctx.fillStyle = '#a6d1ff';
			ctx.fillRect(obstacle.x, obstacle.y + 8, obstacle.width, obstacle.height - 8);
			ctx.fillStyle = '#c8e0ff';
			ctx.fillRect(obstacle.x + 5, obstacle.y, obstacle.width - 10, 8);
			ctx.fillStyle = '#10243f';
			ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 12, 3, 3);
			return;
		}

		ctx.fillStyle = '#79d097';
		ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
		ctx.fillRect(obstacle.x + obstacle.width * 0.18, obstacle.y - 8, obstacle.width * 0.22, 9);
		ctx.fillRect(obstacle.x + obstacle.width * 0.62, obstacle.y + 8, obstacle.width * 0.18, 10);
	});
}

function drawDistanceHud() {
	const distance = Math.floor(state.distance);
	ctx.fillStyle = 'rgba(4, 10, 19, 0.56)';
	ctx.fillRect(canvas.width - 182, 10, 172, 44);
	ctx.strokeStyle = 'rgba(167, 204, 255, 0.58)';
	ctx.strokeRect(canvas.width - 182, 10, 172, 44);

	ctx.fillStyle = '#d8e8ff';
	ctx.font = '700 17px Segoe UI, Tahoma, sans-serif';
	ctx.textAlign = 'left';
	ctx.fillText(`Distance: ${distance}m`, canvas.width - 172, 38);
}

function render() {
	drawSky();
	drawGround();
	drawObstacles();
	drawDino();
	drawDistanceHud();
}

function syncStats() {
	const distanceValue = Math.floor(state.distance);
	const speedValue = state.speedScale.toFixed(2);
	const best = state.bestRuns[0] || 0;

	distanceStatEl.textContent = `${distanceValue}m`;
	currentDistanceEl.textContent = `${distanceValue}m`;
	speedStatEl.textContent = `${speedValue}x`;
	currentSpeedEl.textContent = `${speedValue}x`;
	bestDistanceEl.textContent = `${best}m`;

	bestRunsList.innerHTML = '';
	state.bestRuns.forEach((runDistance) => {
		const item = document.createElement('li');
		item.textContent = `${runDistance}m`;
		bestRunsList.appendChild(item);
	});

	leaderboardPreviewBody.innerHTML = '';
	state.bestRuns.forEach((runDistance, index) => {
		const row = document.createElement('tr');
		row.innerHTML = `<td>#${index + 1}</td><td>You</td><td>${runDistance}m</td>`;
		leaderboardPreviewBody.appendChild(row);
	});
}

function loop(now) {
	const deltaSeconds = Math.min(0.034, Math.max(0, (now - state.lastFrame) / 1000));
	state.lastFrame = now;

	update(deltaSeconds);
	render();
	state.rafId = requestAnimationFrame(loop);
}

function onKeyDown(event) {
	const code = event.code;

	if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
		event.preventDefault();
		jump();
		return;
	}

	if (code === 'Enter') {
		event.preventDefault();
		if (!state.running) {
			startGame();
		}
		return;
	}

	if (code === 'ArrowDown' || code === 'KeyS') {
		event.preventDefault();
		setDuck(true);
		return;
	}

	if (code === 'KeyR') {
		event.preventDefault();
		resetToMenu();
	}
}

function onKeyUp(event) {
	const code = event.code;
	if (code === 'ArrowDown' || code === 'KeyS') {
		event.preventDefault();
		setDuck(false);
	}
}

function bindEvents() {
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	startBtn.addEventListener('click', () => {
		startGame();
	});

	restartBtn.addEventListener('click', () => {
		resetToMenu();
	});

	overlayStartBtn.addEventListener('click', () => {
		startGame();
	});

	jumpBtn.addEventListener('click', () => {
		jump();
	});

	duckBtn.addEventListener('pointerdown', (event) => {
		event.preventDefault();
		setDuck(true);
	});

	duckBtn.addEventListener('pointerup', (event) => {
		event.preventDefault();
		setDuck(false);
	});

	duckBtn.addEventListener('pointerleave', () => {
		setDuck(false);
	});

	duckBtn.addEventListener('pointercancel', () => {
		setDuck(false);
	});

	canvas.addEventListener('pointerdown', () => {
		jump();
	});

	window.addEventListener('resize', resizeCanvas);
}

function init() {
	resizeCanvas();
	bindEvents();
	syncStats();
	resetToMenu();
	showStatus('Jump with Space, duck with Arrow Down.', 1500);
	state.lastFrame = performance.now();
	state.rafId = requestAnimationFrame(loop);
}

init();
