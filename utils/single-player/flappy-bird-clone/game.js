(function () {
	const STORAGE_KEY = 'arcadeAtlas.flappyBird.bestScores.v1';

	const canvas = document.getElementById('flappyCanvas');
	const ctx = canvas?.getContext('2d');
	const gameStatus = document.getElementById('gameStatus');
	const runStateEl = document.getElementById('runState');
	const difficultyStatEl = document.getElementById('difficultyStat');
	const distanceStatEl = document.getElementById('distanceStat');
	const scoreStatEl = document.getElementById('scoreStat');
	const bestStatEl = document.getElementById('bestStat');
	const speedStatEl = document.getElementById('speedStat');
	const bestRunsList = document.getElementById('bestRunsList');
	const overlayPanel = document.getElementById('overlayPanel');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlayText = document.getElementById('overlayText');
	const overlayStartBtn = document.getElementById('overlayStartBtn');
	const flapBtn = document.getElementById('flapBtn');
	const restartBtn = document.getElementById('restartBtn');

	if (!canvas || !ctx) return;

	const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
	const WORLD = {
		width: 960,
		height: 560,
		groundHeight: 86,
		ceilingPadding: 18,
	};

	const state = {
		ready: true,
		running: false,
		gameOver: false,
		lastFrame: 0,
		elapsed: 0,
		score: 0,
		distance: 0,
		speed: 1,
		spawnTimer: 0,
		nextSpawn: 1.15,
		shake: 0,
		bird: {
			x: 176,
			y: 0,
			width: 30,
			height: 24,
			velocityY: 0,
			flapCooldown: 0,
			wingPhase: 0,
		},
		pipes: [],
		clouds: makeClouds(),
		particles: [],
		bestScores: loadBestScores(),
		rafId: 0,
	};

	function makeClouds() {
		return [
			{ x: 0.16, y: 0.14, scale: 1.2, speed: 0.018 },
			{ x: 0.49, y: 0.24, scale: 0.82, speed: 0.024 },
			{ x: 0.76, y: 0.18, scale: 1.04, speed: 0.02 },
			{ x: 0.95, y: 0.11, scale: 0.68, speed: 0.03 },
		];
	}

	function loadBestScores() {
		try {
			const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			if (!Array.isArray(parsed)) return [];
			return parsed
				.map((entry) => ({
					score: Number.parseInt(String(entry?.score ?? entry), 10),
					date: entry?.date || new Date().toISOString(),
				}))
				.filter((entry) => Number.isFinite(entry.score) && entry.score >= 0)
				.sort((a, b) => b.score - a.score || String(a.date).localeCompare(String(b.date)))
				.slice(0, 5);
		} catch {
			return [];
		}
	}

	function saveBestScores() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bestScores.slice(0, 5)));
	}

	function submitScore(score) {
		state.bestScores.push({ score, date: new Date().toISOString() });
		state.bestScores = state.bestScores
			.map((entry) => ({
				score: Number.parseInt(String(entry.score), 10),
				date: entry.date,
			}))
			.filter((entry) => Number.isFinite(entry.score) && entry.score >= 0)
			.sort((a, b) => b.score - a.score || String(a.date).localeCompare(String(b.date)))
			.slice(0, 5);
		saveBestScores();
		renderBestScores();
	}

	function renderBestScores() {
		if (!bestRunsList) return;
		bestRunsList.innerHTML = '';

		const scores = state.bestScores.length ? state.bestScores : [{ score: 0, date: '' }];
		scores.forEach((entry, index) => {
			const item = document.createElement('li');
			const label = document.createElement('span');
			label.textContent = `Run ${index + 1}`;
			const value = document.createElement('strong');
			value.textContent = `${Math.max(0, entry.score)} pts`;
			item.append(label, value);
			bestRunsList.append(item);
		});
	}

	function resizeCanvas() {
		const containerWidth = canvas.parentElement?.clientWidth || 960;
		const width = Math.max(540, Math.min(960, Math.floor(containerWidth - 4)));
		const height = Math.max(420, Math.min(620, Math.floor(width * 0.58)));

		canvas.width = Math.floor(width * DPR);
		canvas.height = Math.floor(height * DPR);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

		WORLD.width = width;
		WORLD.height = height;
		state.bird.x = Math.max(160, Math.floor(width * 0.2));
		if (!state.running) {
			state.bird.y = getBirdStartY();
		}
		draw();
	}

	function getGroundTop() {
		return WORLD.height - WORLD.groundHeight;
	}

	function getBirdStartY() {
		return Math.floor(WORLD.height * 0.44);
	}

	function getPipeSpeed() {
		return 214 + state.speed * 28;
	}

	function getPipeGap() {
		const startingGap = Math.max(164, Math.round(WORLD.height * 0.33));
		const tightening = Math.min(34, Math.floor(state.score * 1.75));
		return Math.max(136, startingGap - tightening);
	}

	function getDifficultyLabel() {
		if (state.score >= 35) return 'Expert';
		if (state.score >= 20) return 'Hard';
		if (state.score >= 10) return 'Fast';
		return 'Normal';
	}

	function setStatus(message, hold = 1400) {
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

	function syncStats() {
		if (scoreStatEl) scoreStatEl.textContent = String(state.score);
		if (bestStatEl) bestStatEl.textContent = String(state.bestScores[0]?.score || 0);
		if (distanceStatEl) distanceStatEl.textContent = `${Math.floor(state.distance)}m`;
		if (speedStatEl) speedStatEl.textContent = `${state.speed.toFixed(1)}x`;
		if (runStateEl) runStateEl.textContent = state.gameOver ? 'Crashed' : state.running ? 'Flying' : '';
		if (difficultyStatEl) difficultyStatEl.textContent = getDifficultyLabel();
	}

	function resetGame() {
		state.ready = true;
		state.running = false;
		state.gameOver = false;
		state.lastFrame = 0;
		state.elapsed = 0;
		state.score = 0;
		state.distance = 0;
		state.speed = 1;
		state.spawnTimer = 0;
		state.nextSpawn = 1.1;
		state.shake = 0;
		state.pipes = [];
		state.particles = [];
		state.bird.velocityY = 0;
		state.bird.flapCooldown = 0;
		state.bird.wingPhase = 0;
		state.bird.y = getBirdStartY();

		overlayPanel.hidden = false;
		overlayTitle.textContent = 'Flappy Bird';
		overlayText.textContent = 'Tap, click, or press Space to start. Keep threading the gaps as the pace accelerates.';
		overlayStartBtn.textContent = 'Start Game';
		if (restartBtn) restartBtn.textContent = 'Restart';
		setStatus('Take off!', 1000);
		syncStats();
		draw();
	}

	function startGame() {
		if (state.running) return;
		state.ready = false;
		state.running = true;
		state.gameOver = false;
		state.lastFrame = performance.now();
		state.elapsed = 0;
		state.score = 0;
		state.distance = 0;
		state.speed = 1;
		state.spawnTimer = 0;
		state.nextSpawn = 1.1;
		state.shake = 0;
		state.pipes = [];
		state.particles = [];
		state.bird.velocityY = -120;
		state.bird.y = getBirdStartY();
		overlayPanel.hidden = true;
		setStatus('Go.', 700);
		syncStats();
		cancelAnimationFrame(state.rafId);
		state.rafId = requestAnimationFrame(loop);
	}

	function endGame() {
		if (!state.running) return;
		state.running = false;
		state.gameOver = true;
		state.shake = 9;
		const finalScore = Math.max(0, Math.floor(state.score));
		submitScore(finalScore);
		overlayPanel.hidden = false;
		overlayTitle.textContent = 'Run Over';
		overlayText.textContent = `Score ${finalScore}. Press Enter or click restart to try again.`;
		overlayStartBtn.textContent = 'Play Again';
		if (restartBtn) restartBtn.textContent = 'Play Again';
		setStatus(finalScore > 0 ? `New run saved at ${finalScore} points.` : 'Run ended.', 1500);
		syncStats();
		draw();
	}

	function flap() {
		if (!state.running) {
			startGame();
			return;
		}

		state.bird.velocityY = -480;
		state.bird.flapCooldown = 0.12;
		state.bird.wingPhase = 1;
		spawnParticles(state.bird.x + 2, state.bird.y + state.bird.height * 0.5);
		setStatus('Flap!', 450);
	}

	function spawnPipe() {
		const gap = getPipeGap();
		const minTop = 62;
		const maxTop = Math.max(minTop, WORLD.height - WORLD.groundHeight - gap - 78);
		const gapTop = minTop + Math.random() * (maxTop - minTop);
		const width = 76;

		state.pipes.push({
			x: WORLD.width + 30,
			width,
			gapTop,
			gap,
			scored: false,
		});
	}

	function spawnParticles(x, y) {
		for (let index = 0; index < 6; index += 1) {
			state.particles.push({
				x,
				y,
				vx: -60 - Math.random() * 70,
				vy: (Math.random() - 0.5) * 120,
				life: 0.4 + Math.random() * 0.22,
			});
		}
	}

	function intersects(a, b) {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}

	function update(delta) {
		if (!state.running) return;

		state.elapsed += delta;
		state.speed = Math.min(4.4, 1 + state.score * 0.035 + state.elapsed * 0.02);
		state.distance += delta * (20 + state.speed * 30);
		state.bird.velocityY += 1500 * delta;
		state.bird.y += state.bird.velocityY * delta;
		state.bird.wingPhase += delta * 12;
		state.bird.flapCooldown = Math.max(0, state.bird.flapCooldown - delta);

		state.spawnTimer += delta;
		if (state.spawnTimer >= state.nextSpawn) {
			spawnPipe();
			state.spawnTimer = 0;
			state.nextSpawn = Math.max(0.88, 1.25 - state.speed * 0.1 - state.score * 0.005);
		}

		const groundTop = getGroundTop();
		if (state.bird.y + state.bird.height >= groundTop) {
			state.bird.y = groundTop - state.bird.height;
			state.bird.velocityY = 0;
			endGame();
			return;
		}

		if (state.bird.y <= WORLD.ceilingPadding) {
			state.bird.y = WORLD.ceilingPadding;
			state.bird.velocityY = Math.max(0, state.bird.velocityY);
		}

		const pipeSpeed = getPipeSpeed();
		state.pipes.forEach((pipe) => {
			pipe.x -= pipeSpeed * delta;

			if (!pipe.scored && pipe.x + pipe.width < state.bird.x) {
				pipe.scored = true;
				state.score += 1;
				state.shake = 2.5;
				setStatus(`Score ${state.score}.`, 500);
			}
		});
		state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > -20);

		state.particles = state.particles
			.map((particle) => ({
				...particle,
				x: particle.x + particle.vx * delta,
				y: particle.y + particle.vy * delta,
				vy: particle.vy + 240 * delta,
				life: particle.life - delta,
			}))
			.filter((particle) => particle.life > 0);

		state.clouds.forEach((cloud) => {
			cloud.x -= cloud.speed * delta * state.speed * 0.7;
			if (cloud.x < -0.3) cloud.x = 1.15;
		});

		const birdHitbox = {
			x: state.bird.x + 4,
			y: state.bird.y + 4,
			width: state.bird.width - 8,
			height: state.bird.height - 8,
		};

		const crashed = state.pipes.some((pipe) => {
			const topPipe = { x: pipe.x, y: 0, width: pipe.width, height: pipe.gapTop };
			const bottomPipe = {
				x: pipe.x,
				y: pipe.gapTop + pipe.gap,
				width: pipe.width,
				height: WORLD.height - WORLD.groundHeight - (pipe.gapTop + pipe.gap),
			};
			return intersects(birdHitbox, topPipe) || intersects(birdHitbox, bottomPipe);
		});

		if (crashed) {
			endGame();
			return;
		}

		if (state.shake > 0) state.shake = Math.max(0, state.shake - delta * 20);
		syncStats();
	}

	function drawBackground() {
		const width = WORLD.width;
		const height = WORLD.height;

		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, '#86d9ff');
		sky.addColorStop(0.54, '#c8f4ff');
		sky.addColorStop(1, '#f5fcff');
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = 'rgba(255,255,255,0.26)';
		ctx.fillRect(0, height - WORLD.groundHeight - 22, width, 22);
		ctx.fillStyle = '#b87938';
		ctx.fillRect(0, height - WORLD.groundHeight, width, WORLD.groundHeight);

		ctx.fillStyle = '#8f5225';
		for (let x = 0; x < width; x += 30) {
			ctx.fillRect(x, height - WORLD.groundHeight + 20, 18, 6);
		}

		state.clouds.forEach((cloud) => {
			const x = cloud.x * width;
			const y = cloud.y * height;
			const size = 42 * cloud.scale;
			ctx.fillStyle = 'rgba(255,255,255,0.8)';
			ctx.beginPath();
			ctx.arc(x, y, size * 0.52, 0, Math.PI * 2);
			ctx.arc(x + size * 0.42, y - size * 0.12, size * 0.38, 0, Math.PI * 2);
			ctx.arc(x + size * 0.74, y, size * 0.5, 0, Math.PI * 2);
			ctx.arc(x + size * 0.48, y + size * 0.12, size * 0.4, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	function drawPipes() {
		state.pipes.forEach((pipe) => {
			const x = pipe.x;
			const width = pipe.width;
			const topHeight = pipe.gapTop;
			const bottomY = pipe.gapTop + pipe.gap;
			const bottomHeight = WORLD.height - WORLD.groundHeight - bottomY;

			const pipeGradient = ctx.createLinearGradient(x, 0, x + width, 0);
			pipeGradient.addColorStop(0, '#30a95f');
			pipeGradient.addColorStop(0.48, '#66df8c');
			pipeGradient.addColorStop(1, '#1f7a47');
			ctx.fillStyle = pipeGradient;

			ctx.fillRect(x, 0, width, topHeight);
			ctx.fillRect(x, bottomY, width, bottomHeight);

			ctx.fillStyle = 'rgba(10, 36, 18, 0.28)';
			ctx.fillRect(x + 12, 0, 8, topHeight);
			ctx.fillRect(x + width - 18, bottomY, 8, bottomHeight);

			ctx.fillStyle = '#2ca257';
			ctx.fillRect(x - 8, topHeight - 22, width + 16, 22);
			ctx.fillRect(x - 8, bottomY, width + 16, 22);

			ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			ctx.lineWidth = 2;
			ctx.strokeRect(x - 8, topHeight - 22, width + 16, 22);
			ctx.strokeRect(x - 8, bottomY, width + 16, 22);
		});
	}

	function drawBird() {
		const { x, y, width, height } = state.bird;
		const flap = Math.sin(state.bird.wingPhase) * 0.6;
		const tilt = Math.max(-0.6, Math.min(0.45, state.bird.velocityY / 800));

		ctx.save();
		ctx.translate(x + width * 0.5, y + height * 0.5);
		ctx.rotate(tilt);
		ctx.translate(-(x + width * 0.5), -(y + height * 0.5));

		const bodyGradient = ctx.createLinearGradient(x, y, x + width, y + height);
		bodyGradient.addColorStop(0, '#ffe37a');
		bodyGradient.addColorStop(1, '#ffb84f');
		ctx.fillStyle = bodyGradient;
		ctx.beginPath();
		ctx.ellipse(x + width * 0.5, y + height * 0.52, width * 0.52, height * 0.5, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#ffd13c';
		ctx.beginPath();
		ctx.ellipse(x + 10, y + 14, 12, 10, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#fff4b0';
		ctx.beginPath();
		ctx.moveTo(x + 16, y + 18);
		ctx.quadraticCurveTo(x + 3, y + 10, x + 7, y + 26);
		ctx.quadraticCurveTo(x + 20, y + 30, x + 16, y + 18);
		ctx.fill();

		ctx.fillStyle = '#10273f';
		ctx.beginPath();
		ctx.arc(x + 20, y + 12, 3.4, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = '#f3d05d';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x + 1, y + 16);
		ctx.quadraticCurveTo(x + 12, y + 4 + flap * 4, x + 18, y + 17);
		ctx.stroke();

		ctx.fillStyle = '#ff8c3a';
		ctx.beginPath();
		ctx.moveTo(x + width - 2, y + 16);
		ctx.lineTo(x + width + 12, y + 20);
		ctx.lineTo(x + width - 2, y + 24);
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	}

	function drawParticles() {
		state.particles.forEach((particle) => {
			ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, particle.life / 0.6)})`;
			ctx.fillRect(particle.x, particle.y, 4, 4);
		});
	}

	function drawHud() {
		ctx.save();
		ctx.fillStyle = 'rgba(9, 24, 45, 0.18)';
		ctx.fillRect(14, 14, 150, 60);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
		ctx.strokeRect(14, 14, 150, 60);
		ctx.fillStyle = '#0f2540';
		ctx.font = '700 18px Segoe UI, sans-serif';
		ctx.fillText(`Score ${state.score}`, 28, 40);
		ctx.font = '600 13px Segoe UI, sans-serif';
		ctx.fillStyle = 'rgba(15, 37, 64, 0.78)';
		ctx.fillText(`Best ${state.bestScores[0]?.score || 0}`, 28, 60);
		ctx.restore();
	}

	function draw() {
		const width = WORLD.width;
		const height = WORLD.height;
		ctx.save();
		if (state.shake > 0) {
			const shakeX = (Math.random() - 0.5) * state.shake;
			const shakeY = (Math.random() - 0.5) * state.shake;
			ctx.translate(shakeX, shakeY);
		}
		ctx.clearRect(0, 0, width, height);
		drawBackground();
		drawPipes();
		drawParticles();
		drawBird();
		drawHud();
		ctx.restore();
	}

	function loop(timestamp) {
		if (!state.running) {
			draw();
			return;
		}

		if (!state.lastFrame) state.lastFrame = timestamp;
		const delta = Math.min(0.033, (timestamp - state.lastFrame) / 1000);
		state.lastFrame = timestamp;

		update(delta);
		draw();

		if (state.running) {
			state.rafId = requestAnimationFrame(loop);
		}
	}

	function onKeyDown(event) {
		const key = event.code || event.key;
		if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW' || key === 'Enter') {
			event.preventDefault();
			if (state.gameOver) {
				resetGame();
				startGame();
				return;
			}
			flap();
		}

		if (key === 'KeyR') {
			event.preventDefault();
			resetGame();
		}
	}

	function bindControls() {
		window.addEventListener('keydown', onKeyDown);
		canvas.addEventListener('pointerdown', (event) => {
			event.preventDefault();
			if (state.gameOver) {
				resetGame();
				startGame();
				return;
			}
			flap();
		});

		overlayStartBtn?.addEventListener('click', () => {
			if (state.gameOver) {
				resetGame();
				startGame();
				return;
			}
			startGame();
		});

		flapBtn?.addEventListener('click', () => {
			if (state.gameOver) {
				resetGame();
				startGame();
				return;
			}
			flap();
		});

		restartBtn?.addEventListener('click', () => {
			resetGame();
		});
	}

	window.addEventListener('resize', resizeCanvas, { passive: true });
	bindControls();
	renderBestScores();
	resizeCanvas();
	resetGame();
	syncStats();
})();
