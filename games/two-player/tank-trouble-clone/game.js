(function () {
  const canvas = document.getElementById('artilleryCanvas');
  const context = canvas.getContext('2d');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const SKY_HEIGHT = Math.floor(HEIGHT * 0.72);
  const GRAVITY = 0.32;
  const BASE_POWER = 4.4;
  const MAX_POWER = 12.8;
  const POWER_CHARGE_RATE = 0.14;
  const MOVE_SPEED = 2.2;
  const TANK_BODY_WIDTH = 42;
  const TANK_BODY_HEIGHT = 18;
  const TANK_TREAD_WIDTH = 48;
  const TANK_TREAD_HEIGHT = 10;
  const TURRET_LENGTH = 34;
  const EXPLOSION_RADIUS = 36;
  const SHOT_COOLDOWN_MS = 520;
  const DAMAGE_RADIUS = 72;
  const DIRECT_HIT_RADIUS = 16;
  const WIN_SCORE_TARGET = 3;

  const state = {
    matchStarted: false,
    awaitingResolution: false,
    projectile: null,
    terrain: [],
    tanks: [],
    activePlayer: 0,
    wind: 0,
    gravity: GRAVITY,
    charging: false,
    chargePower: BASE_POWER,
    round: 1,
    shotCount: 1,
    terrainSeed: 0,
    overlayMode: 'intro',
    explosionBursts: [],
    lastShotResolvedAt: 0,
    winnerText: '',
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  };

  const ui = {
    boardOverlay: document.getElementById('boardOverlay'),
    overlayKicker: document.getElementById('overlayKicker'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    startButton: document.getElementById('startButton'),
    regenButton: document.getElementById('regenButton'),
    restartRoundBtn: document.getElementById('restartRoundBtn'),
    newMatchBtn: document.getElementById('newMatchBtn'),
    activeTurnPill: document.getElementById('activeTurnPill'),
    phasePill: document.getElementById('phasePill'),
    statusCopy: document.getElementById('statusCopy'),
    windValue: document.getElementById('windValue'),
    gravityValue: document.getElementById('gravityValue'),
    powerValue: document.getElementById('powerValue'),
    velocityValue: document.getElementById('velocityValue'),
    roundValue: document.getElementById('roundValue'),
    shotValue: document.getElementById('shotValue'),
    seedValue: document.getElementById('seedValue'),
    playerCard0: document.getElementById('playerCard0'),
    playerCard1: document.getElementById('playerCard1'),
    healthValue0: document.getElementById('healthValue0'),
    healthValue1: document.getElementById('healthValue1'),
    angleValue0: document.getElementById('angleValue0'),
    angleValue1: document.getElementById('angleValue1'),
    scoreValue0: document.getElementById('scoreValue0'),
    scoreValue1: document.getElementById('scoreValue1'),
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width * 0.5, height * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  function formatSigned(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
  }

  function setStatus(text) {
    ui.statusCopy.innerHTML = text;
  }

  function randomRange(min, max) {
    return lerp(min, max, Math.random());
  }

  function smoothTerrain(values, passes = 2) {
    for (let pass = 0; pass < passes; pass += 1) {
      const next = values.slice();
      for (let i = 1; i < values.length - 1; i += 1) {
        next[i] = (values[i - 1] + values[i] * 2 + values[i + 1]) / 4;
      }
      values = next;
    }
    return values;
  }

  function generateTerrain() {
    const terrain = new Array(WIDTH);
    const baseline = HEIGHT * 0.67;
    const ampA = randomRange(42, 70);
    const ampB = randomRange(22, 40);
    const ampC = randomRange(10, 18);
    const phaseA = randomRange(0, Math.PI * 2);
    const phaseB = randomRange(0, Math.PI * 2);
    const phaseC = randomRange(0, Math.PI * 2);

    for (let x = 0; x < WIDTH; x += 1) {
      const a = Math.sin((x / WIDTH) * Math.PI * 2.2 + phaseA) * ampA;
      const b = Math.sin((x / WIDTH) * Math.PI * 5.1 + phaseB) * ampB;
      const c = Math.cos((x / WIDTH) * Math.PI * 10.4 + phaseC) * ampC;
      terrain[x] = clamp(baseline + a + b + c, HEIGHT * 0.42, HEIGHT * 0.84);
    }

    state.terrain = smoothTerrain(terrain, 3);
    state.terrainSeed = Math.floor(Math.random() * 9000) + 1000;
  }

  function getTerrainY(x) {
    const index = clamp(Math.round(x), 0, WIDTH - 1);
    return state.terrain[index];
  }

  function getTerrainSlope(x) {
    const left = getTerrainY(x - 4);
    const right = getTerrainY(x + 4);
    return Math.atan2(right - left, 8);
  }

  function createTank(playerIndex, x) {
    const terrainY = getTerrainY(x);
    const bodyY = terrainY - TANK_TREAD_HEIGHT - TANK_BODY_HEIGHT;
    const facing = playerIndex === 0 ? 1 : -1;
    return {
      x,
      y: bodyY,
      turretAngle: playerIndex === 0 ? -Math.PI / 3.2 : -Math.PI + Math.PI / 3.2,
      slopeAngle: getTerrainSlope(x),
      color: playerIndex === 0 ? '#7cf0c5' : '#7aa7ff',
      glow: playerIndex === 0 ? 'rgba(124, 240, 197, 0.24)' : 'rgba(122, 167, 255, 0.24)',
      name: `Player ${playerIndex + 1}`,
      health: 100,
      score: state.tanks[playerIndex]?.score || 0,
      facing,
    };
  }

  function positionTanks() {
    state.tanks = [
      createTank(0, WIDTH * 0.16),
      createTank(1, WIDTH * 0.84),
    ];
  }

  function refreshTankGrounding() {
    state.tanks.forEach((tank) => {
      tank.slopeAngle = getTerrainSlope(tank.x);
      tank.y = getTerrainY(tank.x) - TANK_TREAD_HEIGHT - TANK_BODY_HEIGHT;
    });
  }

  function randomizeWind() {
    state.wind = randomRange(-0.09, 0.09);
  }

  function resetRound({ keepScores = true, keepRoundCounter = true } = {}) {
    const previousScores = keepScores
      ? state.tanks.map((tank) => tank.score || 0)
      : [0, 0];

    generateTerrain();
    positionTanks();

    if (keepScores) {
      state.tanks.forEach((tank, index) => {
        tank.score = previousScores[index];
      });
    }

    state.activePlayer = keepRoundCounter ? state.activePlayer : 0;
    state.projectile = null;
    state.explosionBursts = [];
    state.awaitingResolution = false;
    state.charging = false;
    state.chargePower = BASE_POWER;
    state.shotCount = 1;
    if (!keepRoundCounter) {
      state.round = 1;
    }
    randomizeWind();
    updateHud();
  }

  function startMatch() {
    state.matchStarted = true;
    state.overlayMode = 'none';
    state.winnerText = '';
    resetRound({ keepScores: false, keepRoundCounter: false });
    hideOverlay();
    updateHud();
    setStatus('Player 1 opens the round. Move with <strong>A / D</strong>, aim with <strong>W / S</strong>, then hold <strong>Space</strong> to charge.');
  }

  function hideOverlay() {
    ui.boardOverlay.hidden = true;
  }

  function showOverlay(mode) {
    state.overlayMode = mode;
    ui.boardOverlay.hidden = false;
    if (mode === 'intro') {
      ui.overlayKicker.textContent = 'Generated battlefield';
      ui.overlayTitle.textContent = 'Ready the artillery.';
      ui.overlayText.textContent = 'Each turn is shared on one keyboard. Move along the hill, aim your turret, hold Space to build launch power, and release to fire into the wind.';
      ui.startButton.textContent = 'Start Match';
      ui.startButton.hidden = false;
      ui.regenButton.hidden = false;
      return;
    }

    ui.overlayKicker.textContent = 'Round complete';
    ui.overlayTitle.textContent = state.winnerText || 'Round over';
    ui.overlayText.textContent = `Press Start Match to continue from the next generated ridge. First to ${WIN_SCORE_TARGET} round wins takes the match.`;
    ui.startButton.textContent = 'Next Round';
    ui.startButton.hidden = false;
    ui.regenButton.hidden = true;
  }

  function updateHud() {
    const activeTank = state.tanks[state.activePlayer];
    ui.activeTurnPill.textContent = `${activeTank?.name || 'Player'} turn`;
    ui.phasePill.textContent = state.projectile
      ? 'Projectile in flight'
      : state.charging
        ? 'Charging shot'
        : 'Ready to aim';

    ui.windValue.textContent = `${formatSigned(state.wind * 100)} drift`;
    ui.gravityValue.textContent = state.gravity.toFixed(2);
    ui.powerValue.textContent = `${Math.round(((state.chargePower - BASE_POWER) / (MAX_POWER - BASE_POWER)) * 100)}%`;
    ui.velocityValue.textContent = state.chargePower.toFixed(1);
    ui.roundValue.textContent = String(state.round);
    ui.shotValue.textContent = String(state.shotCount);
    ui.seedValue.textContent = String(state.terrainSeed);

    state.tanks.forEach((tank, index) => {
      ui[`healthValue${index}`].textContent = String(Math.max(0, Math.round(tank.health)));
      ui[`angleValue${index}`].textContent = `${Math.round((tank.turretAngle * 180) / Math.PI)}°`;
      ui[`scoreValue${index}`].textContent = String(tank.score);
      ui[`playerCard${index}`].classList.toggle('is-active', index === state.activePlayer && !state.projectile);
    });
  }

  function getTankTurretOrigin(tank) {
    const centerX = tank.x;
    const baseY = tank.y + TANK_BODY_HEIGHT * 0.35;
    return { x: centerX, y: baseY };
  }

  function getTankBounds(tank) {
    return {
      left: tank.x - TANK_BODY_WIDTH * 0.5,
      right: tank.x + TANK_BODY_WIDTH * 0.5,
      top: tank.y - 6,
      bottom: tank.y + TANK_BODY_HEIGHT + TANK_TREAD_HEIGHT,
    };
  }

  function moveActiveTank(direction) {
    if (!state.matchStarted || state.projectile || state.awaitingResolution) return;
    const tank = state.tanks[state.activePlayer];
    const nextX = clamp(tank.x + direction * MOVE_SPEED, 44, WIDTH - 44);
    tank.x = nextX;
    tank.facing = direction === 0 ? tank.facing : (direction > 0 ? 1 : -1);
    refreshTankGrounding();
  }

  function aimActiveTank(direction) {
    if (!state.matchStarted || state.projectile || state.awaitingResolution) return;
    const tank = state.tanks[state.activePlayer];
    const step = 0.018 * direction;
    if (state.activePlayer === 0) {
      tank.turretAngle = clamp(tank.turretAngle + step, -Math.PI * 0.92, -0.12);
    } else {
      tank.turretAngle = clamp(tank.turretAngle - step, -Math.PI + 0.12, -Math.PI * 0.08);
    }
  }

  function beginCharge() {
    if (!state.matchStarted || state.projectile || state.awaitingResolution || state.charging) return;
    state.charging = true;
    state.chargePower = BASE_POWER;
    updateHud();
  }

  function fireShot() {
    if (!state.charging || state.projectile || !state.matchStarted) return;
    state.charging = false;
    const tank = state.tanks[state.activePlayer];
    const origin = getTankTurretOrigin(tank);
    const barrelX = origin.x + Math.cos(tank.turretAngle) * TURRET_LENGTH;
    const barrelY = origin.y + Math.sin(tank.turretAngle) * TURRET_LENGTH;
    state.projectile = {
      x: barrelX,
      y: barrelY,
      vx: Math.cos(tank.turretAngle) * state.chargePower,
      vy: Math.sin(tank.turretAngle) * state.chargePower,
      owner: state.activePlayer,
      alive: true,
    };
    state.awaitingResolution = true;
    updateHud();
    setStatus(`${tank.name} fired. Watch the arc and let the crater settle before the next turn.`);
  }

  function destroyTerrain(x, y, radius) {
    const start = Math.max(0, Math.floor(x - radius));
    const end = Math.min(WIDTH - 1, Math.ceil(x + radius));
    for (let px = start; px <= end; px += 1) {
      const dx = px - x;
      const inside = radius * radius - dx * dx;
      if (inside <= 0) continue;
      const craterDepth = Math.sqrt(inside);
      state.terrain[px] = Math.max(state.terrain[px], y + craterDepth);
    }
    refreshTankGrounding();
  }

  function distance(aX, aY, bX, bY) {
    return Math.hypot(aX - bX, aY - bY);
  }

  function applyExplosionDamage(x, y) {
    let roundWinner = null;
    state.tanks.forEach((tank, index) => {
      const bounds = getTankBounds(tank);
      const centerX = tank.x;
      const centerY = bounds.top + (bounds.bottom - bounds.top) * 0.48;
      const dist = distance(x, y, centerX, centerY);
      if (dist > DAMAGE_RADIUS) return;
      let damage = Math.round(48 - (dist / DAMAGE_RADIUS) * 34);
      if (distance(x, y, centerX, centerY) < DIRECT_HIT_RADIUS) {
        damage += 28;
      }
      damage = clamp(damage, 8, 72);
      tank.health = Math.max(0, tank.health - damage);
      if (tank.health <= 0) {
        roundWinner = 1 - index;
      }
    });
    return roundWinner;
  }

  function endTurn() {
    state.projectile = null;
    state.awaitingResolution = false;
    state.chargePower = BASE_POWER;
    state.shotCount += 1;
    state.activePlayer = 1 - state.activePlayer;
    randomizeWind();
    updateHud();
    const activeTank = state.tanks[state.activePlayer];
    setStatus(`${activeTank.name} turn. Wind shifted to <strong>${formatSigned(state.wind * 100)}</strong>.`);
  }

  function completeRound(winnerIndex) {
    const winner = state.tanks[winnerIndex];
    winner.score += 1;
    state.activePlayer = winnerIndex;
    state.winnerText = `${winner.name} wins the round.`;
    updateHud();

    if (winner.score >= WIN_SCORE_TARGET) {
      state.winnerText = `${winner.name} wins the match ${winner.score}-${state.tanks[1 - winnerIndex].score}.`;
    }

    state.round += 1;
    state.projectile = null;
    state.awaitingResolution = false;
    showOverlay('round-end');
    setStatus(`${winner.name} landed the deciding blast. Start the next round when ready.`);
  }

  function explodeAt(x, y) {
    state.explosionBursts.push({ x, y, life: 1 });
    destroyTerrain(x, y, EXPLOSION_RADIUS);
    const winnerIndex = applyExplosionDamage(x, y);
    updateHud();

    if (winnerIndex !== null) {
      window.setTimeout(() => completeRound(winnerIndex), SHOT_COOLDOWN_MS);
      return;
    }

    window.setTimeout(endTurn, SHOT_COOLDOWN_MS);
  }

  function detectTankHit(projectile) {
    for (let i = 0; i < state.tanks.length; i += 1) {
      if (i === projectile.owner) continue;
      const tank = state.tanks[i];
      const bounds = getTankBounds(tank);
      if (
        projectile.x >= bounds.left &&
        projectile.x <= bounds.right &&
        projectile.y >= bounds.top &&
        projectile.y <= bounds.bottom
      ) {
        return true;
      }
    }
    return false;
  }

  function updateProjectile() {
    if (!state.projectile) return;
    const shot = state.projectile;
    shot.vx += state.wind;
    shot.vy += state.gravity;
    shot.x += shot.vx;
    shot.y += shot.vy;

    if (shot.x < 0 || shot.x >= WIDTH || shot.y > HEIGHT + 40) {
      explodeAt(clamp(shot.x, 0, WIDTH - 1), clamp(shot.y, SKY_HEIGHT * 0.6, HEIGHT - 2));
      return;
    }

    if (detectTankHit(shot)) {
      explodeAt(shot.x, shot.y);
      return;
    }

    if (shot.y >= getTerrainY(shot.x)) {
      explodeAt(shot.x, shot.y);
    }
  }

  function updateExplosionBursts() {
    state.explosionBursts = state.explosionBursts
      .map((burst) => ({ ...burst, life: burst.life - 0.04 }))
      .filter((burst) => burst.life > 0);
  }

  function updateCharging() {
    if (!state.charging) return;
    state.chargePower = Math.min(MAX_POWER, state.chargePower + POWER_CHARGE_RATE);
  }

  function updateInput() {
    if (!state.matchStarted || state.projectile || state.awaitingResolution) return;
    if (state.keys.left) moveActiveTank(-1);
    if (state.keys.right) moveActiveTank(1);
    if (state.keys.up) aimActiveTank(-1);
    if (state.keys.down) aimActiveTank(1);
  }

  function update() {
    updateInput();
    updateCharging();
    updateProjectile();
    updateExplosionBursts();
    updateHud();
  }

  function drawBackground() {
    const skyGradient = context.createLinearGradient(0, 0, 0, HEIGHT);
    skyGradient.addColorStop(0, '#14213f');
    skyGradient.addColorStop(0.45, '#22355d');
    skyGradient.addColorStop(0.72, '#24314d');
    skyGradient.addColorStop(1, '#101821');
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 20; i += 1) {
      context.fillRect(i * 80 + ((state.terrainSeed % 31) * 3), 72 + (i % 5) * 18, 34, 1);
    }

    context.fillStyle = 'rgba(255, 211, 137, 0.08)';
    context.beginPath();
    context.arc(WIDTH * 0.74, 108, 56, 0, Math.PI * 2);
    context.fill();
  }

  function drawTerrain() {
    context.beginPath();
    context.moveTo(0, HEIGHT);
    context.lineTo(0, state.terrain[0]);
    for (let x = 1; x < WIDTH; x += 1) {
      context.lineTo(x, state.terrain[x]);
    }
    context.lineTo(WIDTH, HEIGHT);
    context.closePath();

    const terrainGradient = context.createLinearGradient(0, SKY_HEIGHT, 0, HEIGHT);
    terrainGradient.addColorStop(0, '#5f7d4f');
    terrainGradient.addColorStop(0.22, '#4f6844');
    terrainGradient.addColorStop(0.58, '#384630');
    terrainGradient.addColorStop(1, '#182119');
    context.fillStyle = terrainGradient;
    context.fill();

    context.strokeStyle = 'rgba(214, 240, 188, 0.22)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, state.terrain[0]);
    for (let x = 1; x < WIDTH; x += 4) {
      context.lineTo(x, state.terrain[x]);
    }
    context.stroke();
  }

  function drawTank(tank, index) {
    const active = index === state.activePlayer && !state.projectile;
    context.save();
    context.translate(tank.x, tank.y + TANK_BODY_HEIGHT + TANK_TREAD_HEIGHT - 4);
    context.rotate(tank.slopeAngle);
    context.translate(0, -(TANK_BODY_HEIGHT + TANK_TREAD_HEIGHT - 4));

    context.shadowBlur = active ? 24 : 12;
    context.shadowColor = tank.glow;

    context.fillStyle = 'rgba(8, 10, 16, 0.36)';
    context.fillRect(-TANK_TREAD_WIDTH * 0.5, TANK_BODY_HEIGHT + 14, TANK_TREAD_WIDTH, 10);

    context.fillStyle = '#1a2532';
    context.fillRect(-TANK_TREAD_WIDTH * 0.5, TANK_BODY_HEIGHT + 4, TANK_TREAD_WIDTH, TANK_TREAD_HEIGHT);
    context.strokeStyle = 'rgba(255,255,255,0.08)';
    context.strokeRect(-TANK_TREAD_WIDTH * 0.5, TANK_BODY_HEIGHT + 4, TANK_TREAD_WIDTH, TANK_TREAD_HEIGHT);

    context.fillStyle = tank.color;
    roundedRectPath(context, -TANK_BODY_WIDTH * 0.5, 0, TANK_BODY_WIDTH, TANK_BODY_HEIGHT, 7);
    context.fill();

    context.fillStyle = '#102032';
    context.beginPath();
    context.arc(0, -2, 11, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = tank.color;
    context.lineWidth = 3;
    context.stroke();

    context.save();
    context.translate(0, 0);
    context.rotate(tank.turretAngle - Math.PI / 2);
    context.strokeStyle = tank.color;
    context.lineWidth = 7;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(TURRET_LENGTH, 0);
    context.stroke();
    context.restore();

    context.restore();
  }

  function drawProjectile() {
    if (!state.projectile) return;
    context.save();
    context.fillStyle = '#ffd47c';
    context.shadowBlur = 16;
    context.shadowColor = 'rgba(255, 212, 124, 0.55)';
    context.beginPath();
    context.arc(state.projectile.x, state.projectile.y, 5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawTrajectoryPreview() {
    if (!state.matchStarted || state.projectile) return;
    const tank = state.tanks[state.activePlayer];
    const origin = getTankTurretOrigin(tank);
    const startX = origin.x + Math.cos(tank.turretAngle) * TURRET_LENGTH;
    const startY = origin.y + Math.sin(tank.turretAngle) * TURRET_LENGTH;

    let sampleX = startX;
    let sampleY = startY;
    let velocityX = Math.cos(tank.turretAngle) * state.chargePower;
    let velocityY = Math.sin(tank.turretAngle) * state.chargePower;

    context.save();
    context.fillStyle = activeTankColor(tank, 0.58);
    for (let i = 0; i < 34; i += 1) {
      velocityX += state.wind;
      velocityY += state.gravity;
      sampleX += velocityX * 0.9;
      sampleY += velocityY * 0.9;
      if (sampleX < 0 || sampleX >= WIDTH || sampleY >= HEIGHT) break;
      if (sampleY >= getTerrainY(sampleX)) break;
      context.globalAlpha = clamp(1 - i / 34, 0.12, 0.9);
      context.beginPath();
      context.arc(sampleX, sampleY, 2.2, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function activeTankColor(tank, alpha = 1) {
    if (tank.color === '#7cf0c5') {
      return `rgba(124, 240, 197, ${alpha})`;
    }
    return `rgba(122, 167, 255, ${alpha})`;
  }

  function drawExplosionBursts() {
    state.explosionBursts.forEach((burst) => {
      context.save();
      context.globalAlpha = burst.life;
      const radius = EXPLOSION_RADIUS * (1 - burst.life * 0.55);
      const gradient = context.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, radius);
      gradient.addColorStop(0, 'rgba(255, 232, 180, 0.95)');
      gradient.addColorStop(0.35, 'rgba(255, 167, 92, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 96, 72, 0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
  }

  function drawHudLabels() {
    context.save();
    context.fillStyle = 'rgba(255,255,255,0.08)';
    context.fillRect(18, 18, 218, 34);
    context.fillRect(WIDTH - 236, 18, 218, 34);
    context.fillStyle = '#ecf2ff';
    context.font = '600 16px "Segoe UI", sans-serif';
    context.fillText(`Wind ${formatSigned(state.wind * 100)}`, 28, 40);
    context.fillText(`Gravity ${state.gravity.toFixed(2)}`, WIDTH - 226, 40);
    context.restore();
  }

  function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();
    drawTerrain();
    drawTrajectoryPreview();
    state.tanks.forEach(drawTank);
    drawProjectile();
    drawExplosionBursts();
    drawHudLabels();
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  function handleKeyChange(event, isDown) {
    const key = event.code;
    if (key === 'KeyA') {
      state.keys.left = isDown;
    } else if (key === 'KeyD') {
      state.keys.right = isDown;
    } else if (key === 'KeyW') {
      state.keys.up = isDown;
    } else if (key === 'KeyS') {
      state.keys.down = isDown;
    } else if (key === 'Space') {
      event.preventDefault();
      if (isDown) {
        beginCharge();
      } else {
        fireShot();
      }
    } else if (isDown && key === 'KeyR') {
      resetRound();
      if (state.matchStarted) {
        hideOverlay();
        setStatus('Round reset. Terrain regenerated and wind rerolled.');
      }
    } else if (isDown && key === 'KeyN') {
      startMatch();
    }
  }

  function attachEvents() {
    window.addEventListener('keydown', (event) => handleKeyChange(event, true));
    window.addEventListener('keyup', (event) => handleKeyChange(event, false));

    ui.startButton.addEventListener('click', () => {
      if (!state.matchStarted || state.overlayMode === 'intro') {
        startMatch();
        return;
      }
      resetRound();
      hideOverlay();
      setStatus(`${state.tanks[state.activePlayer].name} opens the next round.`);
    });

    ui.regenButton.addEventListener('click', () => {
      generateTerrain();
      positionTanks();
      updateHud();
    });

    ui.restartRoundBtn.addEventListener('click', () => {
      resetRound();
      hideOverlay();
      if (!state.matchStarted) {
        showOverlay('intro');
      } else {
        setStatus('Round reset. Same match score, fresh terrain.');
      }
    });

    ui.newMatchBtn.addEventListener('click', startMatch);
  }

  function init() {
    generateTerrain();
    positionTanks();
    updateHud();
    showOverlay('intro');
    setStatus('Build the shot, read the wind, and carve the ridge apart.');
    attachEvents();
    requestAnimationFrame(loop);
  }

  init();
})();
