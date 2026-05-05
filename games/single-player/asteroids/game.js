(function () {
	const root = document.getElementById('gameRoot');
	const canvas = document.getElementById('gameCanvas');
	const statusEl = document.getElementById('gameStatus');
	const scoreValueEl = document.getElementById('scoreValue');
	const bestValueEl = document.getElementById('bestValue');
	const waveValueEl = document.getElementById('waveValue');
	const livesValueEl = document.getElementById('livesValue');
	const overlay = document.getElementById('overlay');
	const overlayKickerEl = document.getElementById('overlayKicker');
	const overlayTitleEl = document.getElementById('overlayTitle');
	const overlayTextEl = document.getElementById('overlayText');
	const startButton = document.getElementById('startButton');
	const restartButton = document.getElementById('restartButton');
	const touchButtons = Array.from(document.querySelectorAll('[data-action]'));

	if (!root || !canvas) return;

	const ctx = canvas.getContext('2d');
	const WIDTH = 400;
	const HEIGHT = 300;
	const STORAGE_KEY = 'playr.asteroids.bestScore.v1';
	const MAX_BULLETS = 5;
	const SHIP_RADIUS = 8;
	const SHIP_THRUST = 165;
	const SHIP_REVERSE_THRUST = 110;
	const SHIP_TURN_SPEED_MIN = 2.7;
	const SHIP_TURN_SPEED_MAX = 6.4;
	const SHIP_TURN_ACCEL = 8.5;
	const BULLET_SPEED = 280;
	const BULLET_LIFETIME = 1.1;
	const RESPAWN_INVULN = 1.7;
	const FIRE_DELAY = 0.18;
	const HYPERSPACE_COOLDOWN = 4.5;
	const WAVE_CLEAR_DELAY = 0.85;
	const ASTEROID_SCORES = {
		large: 20,
		medium: 50,
		small: 100,
	};
	const ASTEROID_RADII = {
		large: 28,
		medium: 17,
		small: 10,
	};

	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx.imageSmoothingEnabled = false;
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'square';

	const state = {
		phase: 'idle',
		score: 0,
		bestScore: loadBestScore(),
		wave: 1,
		lives: 3,
		ship: createShip(),
		bullets: [],
		asteroids: [],
		particles: [],
		stars: createStars(108),
		lastFrame: 0,
		fireCooldown: 0,
		hyperspaceCooldown: 0,
		invulnerable: 0,
		waveClearTimer: 0,
		statusTimer: 0,
		statusTone: 'neutral',
		input: {
			left: false,
			right: false,
			thrust: false,
			reverse: false,
			fire: false,
		},
	};

	function loadBestScore() {
		try {
			return Number(localStorage.getItem(STORAGE_KEY) || 0) || 0;
		} catch {
			return 0;
		}
	}

	function saveBestScore() {
		try {
			localStorage.setItem(STORAGE_KEY, String(state.bestScore));
		} catch {
			// Ignore storage failures.
		}
	}

	function createShip() {
		return {
			x: WIDTH / 2,
			y: HEIGHT / 2,
			vx: 0,
			vy: 0,
			angle: -Math.PI / 2,
			alive: true,
			turnMomentum: 0,
			turnDirection: 0,
		};
	}

	function createStars(count) {
		return Array.from({ length: count }, () => ({
			x: Math.random() * WIDTH,
			y: Math.random() * HEIGHT,
			size: 1 + Math.floor(Math.random() * 2),
			speed: 0.06 + Math.random() * 0.2,
			phase: Math.random() * Math.PI * 2,
			tint: Math.random() > 0.8 ? 'warm' : 'cool',
		}));
	}

	function resetRun() {
		state.score = 0;
		state.wave = 1;
		state.lives = 3;
		state.ship = createShip();
		state.bullets = [];
		state.asteroids = [];
		state.particles = [];
		state.fireCooldown = 0;
		state.hyperspaceCooldown = 0;
		state.invulnerable = RESPAWN_INVULN;
		state.waveClearTimer = 0;
		state.statusTimer = 0;
		state.statusTone = 'neutral';
		spawnWave(state.wave);
		renderHud();
		renderLives();
		setStatus('Wave 1. Hold your line.', 'neutral');
	}

	function startGame() {
		if (state.phase === 'active') return;
		resetRun();
		state.phase = 'active';
		hideOverlay();
		setStatus('Wave 1 live. Clear the field.', 'good');
	}

	function resumeGame() {
		if (state.phase !== 'paused') return;
		state.phase = 'active';
		hideOverlay();
		setStatus('Back in the field.', 'good');
	}

	function pauseGame() {
		if (state.phase !== 'active') return;
		state.phase = 'paused';
		showOverlay('Paused', 'Resume when you are ready to keep the ship alive.', 'Pause engaged', 'Resume');
		setStatus('Paused.', 'warn');
	}

	function togglePause() {
		if (state.phase === 'active') pauseGame();
		else if (state.phase === 'paused') resumeGame();
	}

	function gameOver() {
		state.phase = 'gameover';
		state.bestScore = Math.max(state.bestScore, state.score);
		saveBestScore();
		renderHud();
		showOverlay('Game over', `Final score ${formatScore(state.score)}. The rocks win this round.`, 'Run ended', 'Play again');
		setStatus('Ship destroyed. Press restart to try again.', 'danger');
	}

	function showOverlay(title, text, kicker, startLabel) {
		if (!overlay) return;
		overlay.hidden = false;
		if (overlayTitleEl) overlayTitleEl.textContent = title;
		if (overlayTextEl) overlayTextEl.textContent = text;
		if (overlayKickerEl) overlayKickerEl.textContent = kicker;
		if (startButton) startButton.textContent = startLabel;
	}

	function hideOverlay() {
		if (overlay) overlay.hidden = true;
	}

	function setStatus(message, tone = 'neutral') {
		state.statusTimer = 1.25;
		state.statusTone = tone;
		if (statusEl) {
			statusEl.textContent = message;
			statusEl.dataset.tone = tone;
		}
	}

	function formatScore(value) {
		return String(Math.max(0, Math.floor(value))).padStart(5, '0');
	}

	function formatWave(value) {
		return String(Math.max(1, Math.floor(value))).padStart(2, '0');
	}

	function renderHud() {
		if (scoreValueEl) scoreValueEl.textContent = formatScore(state.score);
		if (bestValueEl) bestValueEl.textContent = formatScore(state.bestScore);
		if (waveValueEl) waveValueEl.textContent = formatWave(state.wave);
	}

	function renderLives() {
		if (!livesValueEl) return;
		livesValueEl.innerHTML = '';
		for (let index = 0; index < state.lives; index += 1) {
			const life = document.createElement('span');
			life.className = 'life-ship';
			life.textContent = '▲';
			livesValueEl.appendChild(life);
		}
	}

	function rand(min, max) {
		return min + Math.random() * (max - min);
	}

	function wrap(value, max) {
		if (value < 0) return value + max;
		if (value >= max) return value - max;
		return value;
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function toRgba(color, alpha) {
		if (!color) return `rgba(255, 255, 255, ${alpha})`;
		if (color.startsWith('rgba(')) {
			return color.replace(/rgba\(([^)]+),\s*[^)]+\)$/, `rgba($1, ${alpha})`);
		}
		if (color.startsWith('rgb(')) {
			return color.replace(/rgb\(([^)]+)\)$/, `rgba($1, ${alpha})`);
		}
		if (color.startsWith('#')) {
			const hex = color.slice(1);
			const normalized = hex.length === 3 ? hex.split('').map((character) => character + character).join('') : hex;
			const parsed = Number.parseInt(normalized, 16);
			const red = (parsed >> 16) & 255;
			const green = (parsed >> 8) & 255;
			const blue = parsed & 255;
			return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
		}
		return color;
	}

	function distanceSq(ax, ay, bx, by) {
		const dx = ax - bx;
		const dy = ay - by;
		return dx * dx + dy * dy;
	}

	function angleDiff(a, b) {
		let diff = a - b;
		while (diff > Math.PI) diff -= Math.PI * 2;
		while (diff < -Math.PI) diff += Math.PI * 2;
		return diff;
	}

	function createAsteroid(size, x, y, vx, vy) {
		const radius = ASTEROID_RADII[size];
		const sides = size === 'large' ? 11 : size === 'medium' ? 8 : 6;
		const points = Array.from({ length: sides }, (_, index) => {
			const angle = (Math.PI * 2 * index) / sides;
			const jitter = 0.72 + Math.random() * 0.45;
			return {
				angle,
				radius: radius * jitter,
			};
		});

		return {
			x,
			y,
			vx,
			vy,
			size,
			radius,
			rotation: Math.random() * Math.PI * 2,
			spin: rand(-1.0, 1.0) * (size === 'large' ? 0.6 : size === 'medium' ? 0.85 : 1.1),
			points,
		};
	}

	function spawnWave(wave) {
		const count = clamp(3 + wave, 4, 12);
		const shipSafeRadiusSq = 90 * 90;

		for (let index = 0; index < count; index += 1) {
			let x;
			let y;
			const side = Math.floor(Math.random() * 4);

			if (side === 0) {
				x = -20;
				y = rand(10, HEIGHT - 10);
			} else if (side === 1) {
				x = WIDTH + 20;
				y = rand(10, HEIGHT - 10);
			} else if (side === 2) {
				x = rand(10, WIDTH - 10);
				y = -20;
			} else {
				x = rand(10, WIDTH - 10);
				y = HEIGHT + 20;
			}

			if (distanceSq(x, y, state.ship.x, state.ship.y) < shipSafeRadiusSq) {
				if (x < WIDTH / 2) x = WIDTH + 20;
				else if (x > WIDTH / 2) x = -20;
				if (y < HEIGHT / 2) y = HEIGHT + 20;
				else if (y > HEIGHT / 2) y = -20;
			}

			const angle = rand(0, Math.PI * 2);
			const speed = rand(18, 42) + wave * 2.4;
			state.asteroids.push(
				createAsteroid(
					'large',
					x,
					y,
					Math.cos(angle) * speed,
					Math.sin(angle) * speed,
				),
			);
		}

		state.wave = wave;
		renderHud();
		setStatus(`Wave ${wave} in play.`, 'good');
	}

	function spawnParticleBurst(x, y, color, amount, power, size = 1) {
		for (let index = 0; index < amount; index += 1) {
			const angle = rand(0, Math.PI * 2);
			const speed = rand(power * 0.35, power);
			state.particles.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: rand(0.25, 0.8),
				maxLife: 0.8,
				color,
				size: size + Math.floor(Math.random() * 2),
			});
		}
	}

	function fireBullet() {
		if (state.fireCooldown > 0 || state.bullets.length >= MAX_BULLETS || state.ship.alive === false) return;

		const noseX = state.ship.x + Math.cos(state.ship.angle) * 10;
		const noseY = state.ship.y + Math.sin(state.ship.angle) * 10;

		state.bullets.push({
			x: noseX,
			y: noseY,
			vx: state.ship.vx + Math.cos(state.ship.angle) * BULLET_SPEED,
			vy: state.ship.vy + Math.sin(state.ship.angle) * BULLET_SPEED,
			life: BULLET_LIFETIME,
		});

		state.fireCooldown = FIRE_DELAY;
		spawnParticleBurst(noseX, noseY, '#ffe08a', 2, 18, 1);
	}

	function hyperspace() {
		if (state.phase !== 'active') return;
		if (state.hyperspaceCooldown > 0) {
			setStatus(`Hyperspace recharging: ${state.hyperspaceCooldown.toFixed(1)}s`, 'warn');
			return;
		}

		state.ship.x = rand(24, WIDTH - 24);
		state.ship.y = rand(24, HEIGHT - 24);
		state.ship.vx = rand(-40, 40);
		state.ship.vy = rand(-40, 40);
		state.invulnerable = RESPAWN_INVULN * 0.75;
		state.hyperspaceCooldown = HYPERSPACE_COOLDOWN;
		spawnParticleBurst(state.ship.x, state.ship.y, '#7cf0c5', 12, 55, 1);
		setStatus('Hyperspace jump complete.', 'neutral');
	}

	function destroyShip() {
		spawnParticleBurst(state.ship.x, state.ship.y, '#ff8d8d', 18, 78, 2);
		state.lives -= 1;
		renderLives();

		if (state.lives <= 0) {
			state.ship.alive = false;
			gameOver();
			return;
		}

		state.ship = createShip();
		state.invulnerable = RESPAWN_INVULN;
		state.fireCooldown = 0.25;
		setStatus('Ship lost. Respawning.', 'warn');
	}

	function splitAsteroid(asteroid) {
		const nextSize = asteroid.size === 'large' ? 'medium' : asteroid.size === 'medium' ? 'small' : null;
		if (!nextSize) return;

		const offsets = [-1, 1];
		offsets.forEach((direction) => {
			const angle = rand(-Math.PI / 2, Math.PI / 2) + direction * 0.85;
			const speed = rand(30, 70) + (nextSize === 'small' ? 16 : 8);
			state.asteroids.push(
				createAsteroid(
					nextSize,
					asteroid.x + direction * 3,
					asteroid.y + direction * 3,
					asteroid.vx * 0.45 + Math.cos(angle) * speed,
					asteroid.vy * 0.45 + Math.sin(angle) * speed,
				),
			);
		});
	}

	function handleShipMovement(dt) {
		const turnDirection = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);

		if (turnDirection !== 0) {
			if (state.ship.turnDirection !== turnDirection) {
				state.ship.turnMomentum = SHIP_TURN_SPEED_MIN;
				state.ship.turnDirection = turnDirection;
			} else {
				state.ship.turnMomentum = Math.min(
					SHIP_TURN_SPEED_MAX,
					state.ship.turnMomentum + SHIP_TURN_ACCEL * dt,
				);
			}
			state.ship.angle += turnDirection * state.ship.turnMomentum * dt;
		} else {
			state.ship.turnDirection = 0;
			state.ship.turnMomentum = 0;
		}

		if (state.input.thrust) {
			state.ship.vx += Math.cos(state.ship.angle) * SHIP_THRUST * dt;
			state.ship.vy += Math.sin(state.ship.angle) * SHIP_THRUST * dt;
		}

		if (state.input.reverse) {
			state.ship.vx -= Math.cos(state.ship.angle) * SHIP_REVERSE_THRUST * dt;
			state.ship.vy -= Math.sin(state.ship.angle) * SHIP_REVERSE_THRUST * dt;
		}

		state.ship.vx *= Math.pow(0.992, dt * 60);
		state.ship.vy *= Math.pow(0.992, dt * 60);
		state.ship.x = wrap(state.ship.x + state.ship.vx * dt, WIDTH);
		state.ship.y = wrap(state.ship.y + state.ship.vy * dt, HEIGHT);
	}

	function handleBullets(dt) {
		for (let index = state.bullets.length - 1; index >= 0; index -= 1) {
			const bullet = state.bullets[index];
			bullet.life -= dt;
			bullet.x += bullet.vx * dt;
			bullet.y += bullet.vy * dt;
			if (
				bullet.life <= 0
				|| bullet.x < -4
				|| bullet.x > WIDTH + 4
				|| bullet.y < -4
				|| bullet.y > HEIGHT + 4
			) {
				state.bullets.splice(index, 1);
			}
		}
	}

	function handleAsteroids(dt) {
		for (const asteroid of state.asteroids) {
			asteroid.rotation += asteroid.spin * dt;
			asteroid.x = wrap(asteroid.x + asteroid.vx * dt, WIDTH);
			asteroid.y = wrap(asteroid.y + asteroid.vy * dt, HEIGHT);
		}
	}

	function handleParticles(dt) {
		for (let index = state.particles.length - 1; index >= 0; index -= 1) {
			const particle = state.particles[index];
			particle.life -= dt;
			particle.vx *= Math.pow(0.985, dt * 60);
			particle.vy *= Math.pow(0.985, dt * 60);
			particle.x = wrap(particle.x + particle.vx * dt, WIDTH);
			particle.y = wrap(particle.y + particle.vy * dt, HEIGHT);
			if (particle.life <= 0) state.particles.splice(index, 1);
		}
	}

	function checkBulletHits() {
		for (let bulletIndex = state.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
			const bullet = state.bullets[bulletIndex];

			for (let asteroidIndex = state.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
				const asteroid = state.asteroids[asteroidIndex];
				const hitRadius = asteroid.radius + 2;

				if (distanceSq(bullet.x, bullet.y, asteroid.x, asteroid.y) <= hitRadius * hitRadius) {
					state.bullets.splice(bulletIndex, 1);
					state.asteroids.splice(asteroidIndex, 1);
					state.score += ASTEROID_SCORES[asteroid.size];
					spawnParticleBurst(asteroid.x, asteroid.y, asteroid.size === 'small' ? '#f0f7ff' : '#7cf0c5', 12, 95, 1);
					if (asteroid.size !== 'small') splitAsteroid(asteroid);

					if (state.score > state.bestScore) {
						state.bestScore = state.score;
						saveBestScore();
					}

					renderHud();
					break;
				}
			}
		}
	}

	function checkShipHits() {
		if (state.invulnerable > 0 || state.phase !== 'active') return;

		for (const asteroid of state.asteroids) {
			const hitRadius = asteroid.radius + SHIP_RADIUS - 1;
			if (distanceSq(state.ship.x, state.ship.y, asteroid.x, asteroid.y) <= hitRadius * hitRadius) {
				destroyShip();
				break;
			}
		}
	}

	function handleWaveProgression(dt) {
		if (state.asteroids.length > 0) {
			state.waveClearTimer = 0;
			return;
		}

		if (state.phase !== 'active') return;

		if (state.waveClearTimer <= 0) {
			state.waveClearTimer = WAVE_CLEAR_DELAY;
			setStatus(`Wave ${state.wave} clear. Incoming field...`, 'neutral');
			return;
		}

		state.waveClearTimer -= dt;
		if (state.waveClearTimer <= 0) {
			spawnWave(state.wave + 1);
		}
	}

	function updateStatusTimer(dt) {
		if (state.statusTimer > 0) {
			state.statusTimer -= dt;
			if (state.statusTimer <= 0 && state.phase === 'active' && state.asteroids.length > 0) {
				setStatus(`Wave ${state.wave} in play.`, 'good');
			}
		}
	}

	function updateGame(dt) {
		if (state.phase !== 'active') return;

		state.fireCooldown = Math.max(0, state.fireCooldown - dt);
		state.hyperspaceCooldown = Math.max(0, state.hyperspaceCooldown - dt);
		state.invulnerable = Math.max(0, state.invulnerable - dt);

		handleShipMovement(dt);

		if (state.input.fire) fireBullet();

		handleBullets(dt);
		handleAsteroids(dt);
		handleParticles(dt);
		checkBulletHits();
		checkShipHits();
		handleWaveProgression(dt);
		updateStatusTimer(dt);

		if (state.score > state.bestScore) {
			state.bestScore = state.score;
			saveBestScore();
			renderHud();
		}
	}

	function drawBackground(time) {
		const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
		grad.addColorStop(0, '#071120');
		grad.addColorStop(0.6, '#091224');
		grad.addColorStop(1, '#04070d');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		ctx.fillStyle = 'rgba(124, 240, 197, 0.06)';
		for (let row = 0; row < HEIGHT; row += 12) {
			ctx.fillRect(0, row, WIDTH, 1);
		}

		ctx.strokeStyle = 'rgba(124, 240, 197, 0.05)';
		ctx.lineWidth = 1;
		for (let col = 0; col < WIDTH; col += 20) {
			ctx.beginPath();
			ctx.moveTo(col + 0.5, 0);
			ctx.lineTo(col + 0.5, HEIGHT);
			ctx.stroke();
		}

		for (const star of state.stars) {
			const twinkle = 0.5 + Math.sin(time * star.speed + star.phase) * 0.5;
			const alpha = star.tint === 'warm' ? 0.45 + twinkle * 0.35 : 0.35 + twinkle * 0.5;
			ctx.fillStyle = star.tint === 'warm' ? `rgba(255, 204, 122, ${alpha})` : `rgba(215, 245, 255, ${alpha})`;
			ctx.fillRect(star.x, star.y, star.size, star.size);
		}
	}

	function drawShip() {
		if (!state.ship.alive) return;

		const blink = state.invulnerable > 0 ? Math.floor(performance.now() / 90) % 2 === 0 : true;
		if (!blink) return;

		ctx.save();
		ctx.translate(state.ship.x, state.ship.y);
		ctx.rotate(state.ship.angle);

		ctx.beginPath();
		ctx.moveTo(11, 0);
		ctx.lineTo(-8, 7);
		ctx.lineTo(-3, 0);
		ctx.lineTo(-8, -7);
		ctx.closePath();
		ctx.fillStyle = '#0f223d';
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#8bf1d1';
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(11, 0);
		ctx.lineTo(1, 0);
		ctx.strokeStyle = '#d9fff5';
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(-8, 7);
		ctx.lineTo(-4, 4);
		ctx.lineTo(0, 0);
		ctx.lineTo(-4, -4);
		ctx.lineTo(-8, -7);
		ctx.strokeStyle = '#5fd2ff';
		ctx.stroke();

		if (state.input.thrust) {
			ctx.beginPath();
			ctx.moveTo(-10, 4);
			ctx.lineTo(-17, 0);
			ctx.lineTo(-10, -4);
			ctx.fillStyle = '#ffb25f';
			ctx.fill();
			ctx.strokeStyle = '#ffe9b2';
			ctx.stroke();
		}

		ctx.restore();
	}

	function drawBullets() {
		for (const bullet of state.bullets) {
			ctx.fillStyle = '#ffe08a';
			ctx.fillRect(Math.round(bullet.x) - 1, Math.round(bullet.y) - 1, 2, 2);
			ctx.fillStyle = 'rgba(255, 224, 138, 0.35)';
			ctx.fillRect(Math.round(bullet.x) - 2, Math.round(bullet.y), 4, 1);
		}
	}

	function drawAsteroids() {
		for (const asteroid of state.asteroids) {
			ctx.save();
			ctx.translate(asteroid.x, asteroid.y);
			ctx.rotate(asteroid.rotation);

			ctx.beginPath();
			asteroid.points.forEach((point, index) => {
				const px = Math.cos(point.angle) * point.radius;
				const py = Math.sin(point.angle) * point.radius;
				if (index === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			});
			ctx.closePath();

			ctx.fillStyle = '#15253d';
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#8bf1d1';
			ctx.stroke();

			ctx.beginPath();
			asteroid.points.forEach((point, index) => {
				const px = Math.cos(point.angle) * (point.radius * 0.72);
				const py = Math.sin(point.angle) * (point.radius * 0.72);
				if (index === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			});
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
			ctx.stroke();

			ctx.restore();
		}
	}

	function drawParticles() {
		for (const particle of state.particles) {
			const alpha = clamp(particle.life / particle.maxLife, 0, 1);
			ctx.fillStyle = toRgba(particle.color, alpha);
			ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
		}
	}

	function drawScene(time) {
		drawBackground(time);
		drawParticles();
		drawAsteroids();
		drawBullets();
		drawShip();

		if (state.invulnerable > 0 && state.phase === 'active') {
			ctx.fillStyle = 'rgba(124, 240, 197, 0.08)';
			ctx.beginPath();
			ctx.arc(state.ship.x, state.ship.y, 16, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function tick(timestamp) {
		if (!state.lastFrame) state.lastFrame = timestamp;
		const dt = clamp((timestamp - state.lastFrame) / 1000, 0, 0.033);
		state.lastFrame = timestamp;

		if (state.phase === 'active') {
			updateGame(dt);
		} else {
			updateStatusTimer(dt);
		}

		drawScene(timestamp / 1000);
		requestAnimationFrame(tick);
	}

	function handleKeyDown(event) {
		const key = event.key.toLowerCase();

		if ([
			'arrowleft',
			'arrowright',
			'arrowup',
			'arrowdown',
			' ',
			'spacebar',
			'space',
			'enter',
			'q',
			'p',
			'escape',
			'a',
			'd',
			'w',
			's',
		].includes(key)) {
			event.preventDefault();
		}

		if (state.phase === 'idle' || state.phase === 'gameover') {
			if (key === 'enter' || key === ' ' || key === 'spacebar' || key === 'space') {
				startGame();
			}
		}

		if (key === 'arrowleft' || key === 'a') state.input.left = true;
		if (key === 'arrowright' || key === 'd') state.input.right = true;
		if (key === 'arrowup' || key === 'w') state.input.thrust = true;
		if (key === 'arrowdown' || key === 's') state.input.reverse = true;

		if (key === ' ' || key === 'spacebar' || key === 'space' || key === 'enter') {
			state.input.fire = true;
			if (state.phase === 'idle' || state.phase === 'gameover') startGame();
		}

		if (key === 'q') {
			if (state.phase === 'active') hyperspace();
		}

		if (key === 'p' || key === 'escape') {
			if (state.phase === 'idle') startGame();
			else togglePause();
		}
	}

	function handleKeyUp(event) {
		const key = event.key.toLowerCase();
		if (key === 'arrowleft' || key === 'a') state.input.left = false;
		if (key === 'arrowright' || key === 'd') state.input.right = false;
		if (key === 'arrowup' || key === 'w') state.input.thrust = false;
		if (key === 'arrowdown' || key === 's') state.input.reverse = false;
		if (key === ' ' || key === 'spacebar' || key === 'space' || key === 'enter') state.input.fire = false;
	}

	function attachTouchControls() {
		for (const button of touchButtons) {
			const action = button.dataset.action;
			if (!action) continue;

			const onDown = (event) => {
				event.preventDefault();
				if (action === 'left') state.input.left = true;
				if (action === 'right') state.input.right = true;
				if (action === 'thrust') state.input.thrust = true;
				if (action === 'fire') {
					if (state.phase === 'idle' || state.phase === 'gameover') startGame();
					state.input.fire = true;
					fireBullet();
				}
				if (action === 'hyperspace') {
					if (state.phase === 'idle' || state.phase === 'gameover') startGame();
					hyperspace();
				}
				if (action === 'pause') {
					if (state.phase === 'idle') startGame();
					else togglePause();
				}
			};

			const onUp = () => {
				if (action === 'left') state.input.left = false;
				if (action === 'right') state.input.right = false;
				if (action === 'thrust') state.input.thrust = false;
				if (action === 'fire') state.input.fire = false;
			};

			button.addEventListener('pointerdown', onDown);
			button.addEventListener('pointerup', onUp);
			button.addEventListener('pointercancel', onUp);
			button.addEventListener('pointerleave', onUp);
		}
	}

	function attachEvents() {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		if (startButton) {
			startButton.addEventListener('click', () => {
				if (state.phase === 'paused') resumeGame();
				else startGame();
			});
		}

		if (restartButton) {
			restartButton.addEventListener('click', () => {
				startGame();
			});
		}

		attachTouchControls();
	}

	function init() {
		renderHud();
		renderLives();
		showOverlay('Launch sequence armed', 'Destroy the wave, survive the drift, and chase the next high score.', '', 'Start');
		setStatus('Press Start or Space to launch.', 'neutral');
		attachEvents();
		requestAnimationFrame(tick);
	}

	init();
})();
