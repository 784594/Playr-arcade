const canvas = document.getElementById('hextrisCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('gameStatus');
const scoreEl = document.getElementById('scoreValue');
const timeEl = document.getElementById('timeValue');
const speedEl = document.getElementById('speedValue');
const bestEl = document.getElementById('bestValue');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const STORAGE_KEY = 'playrHextrisBestV1';
const LANE_COUNT = 6;
const SECTOR_ANGLE = (Math.PI * 2) / LANE_COUNT;
const MAX_STACK = 7;
const INNER_RADIUS = 116;
const BLOCK_DEPTH = 38;
const LANE_PADDING = 0.14;
const ROTATE_STEP = SECTOR_ANGLE;
const ROTATE_SPEED = 16;
const BASE_FALL_SPEED = 138;
const FALL_ACCEL_PER_SECOND = 4.2;
const FAST_DROP_MULTIPLIER = 2.25;
const CLEAR_FLASH_MS = 190;
const SPAWN_DELAY_MS = 220;
const COLORS = ['#63b7ff', '#ff6fcf', '#ffd46e', '#78f0b3', '#9d8dff', '#ff8a65'];

const state = {
  running: false,
  gameOver: false,
  startedAt: 0,
  elapsedMs: 0,
  score: 0,
  bestMs: 0,
  lanes: Array.from({ length: LANE_COUNT }, () => []),
  activePiece: null,
  rotationIndex: 0,
  rotationAngle: 0,
  targetAngle: 0,
  fastDrop: false,
  clearFlashUntil: 0,
  particles: [],
  spawnAt: 0,
  lastFrame: 0,
};

function readBestMs() {
  try {
    return Math.max(0, Number(window.localStorage.getItem(STORAGE_KEY)) || 0);
  } catch {
    return 0;
  }
}

function writeBestMs(bestMs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Math.max(0, Number(bestMs) || 0)));
  } catch {}
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function formatTime(ms) {
  return `${(Math.max(0, Number(ms) || 0) / 1000).toFixed(1)}s`;
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  timeEl.textContent = formatTime(state.elapsedMs);
  speedEl.textContent = `${getSpeedMultiplier().toFixed(2)}x`;
  bestEl.textContent = formatTime(state.bestMs);
}

function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function getSpeedMultiplier() {
  return 1 + ((state.elapsedMs / 1000) * FALL_ACCEL_PER_SECOND / 100);
}

function getCurrentFallSpeed() {
  const speed = BASE_FALL_SPEED * getSpeedMultiplier();
  return state.fastDrop ? speed * FAST_DROP_MULTIPLIER : speed;
}

function getBoardLaneForWorldLane(worldLane) {
  return mod(worldLane - state.rotationIndex, LANE_COUNT);
}

function getWorldAngleForBoardLane(boardLane) {
  return (-Math.PI / 2) + ((boardLane + (state.rotationAngle / SECTOR_ANGLE)) * SECTOR_ANGLE);
}

function getLaneRadius(depthIndex) {
  return INNER_RADIUS + (depthIndex * BLOCK_DEPTH);
}

function polygonPath(points) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.closePath();
}

function pointOnCircle(radius, angle) {
  return {
    x: canvas.width / 2 + Math.cos(angle) * radius,
    y: canvas.height / 2 + Math.sin(angle) * radius,
  };
}

function laneBlockPoints(boardLane, depthIndex) {
  const centerAngle = getWorldAngleForBoardLane(boardLane);
  const halfAngle = (SECTOR_ANGLE / 2) - LANE_PADDING;
  const inner = getLaneRadius(depthIndex) + 5;
  const outer = getLaneRadius(depthIndex + 1) - 5;
  const leftInner = pointOnCircle(inner, centerAngle - halfAngle);
  const rightInner = pointOnCircle(inner, centerAngle + halfAngle);
  const rightOuter = pointOnCircle(outer, centerAngle + halfAngle);
  const leftOuter = pointOnCircle(outer, centerAngle - halfAngle);
  return [leftInner, rightInner, rightOuter, leftOuter];
}

function drawGlowPolygon(points, fill, glow, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 24;
  ctx.shadowColor = glow;
  polygonPath(points);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.stroke();
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a1430');
  gradient.addColorStop(1, '#050912');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.26;
  for (let ring = 0; ring < 6; ring += 1) {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, INNER_RADIUS + (ring * BLOCK_DEPTH), 0, Math.PI * 2);
    ctx.strokeStyle = ring % 2 === 0 ? 'rgba(99, 183, 255, 0.12)' : 'rgba(124, 240, 197, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBoardGuides() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(state.rotationAngle);

  for (let lane = 0; lane < LANE_COUNT; lane += 1) {
    const angle = (-Math.PI / 2) + (lane * SECTOR_ANGLE);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * INNER_RADIUS, Math.sin(angle) * INNER_RADIUS);
    ctx.lineTo(Math.cos(angle) * (INNER_RADIUS + (MAX_STACK * BLOCK_DEPTH) + 30), Math.sin(angle) * (INNER_RADIUS + (MAX_STACK * BLOCK_DEPTH) + 30));
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();

  ctx.save();
  const hexRadius = INNER_RADIUS - 16;
  const hexPoints = Array.from({ length: 6 }, (_, index) => pointOnCircle(hexRadius, (-Math.PI / 2) + (index * SECTOR_ANGLE)));
  ctx.shadowBlur = 38;
  ctx.shadowColor = 'rgba(74, 128, 245, 0.45)';
  polygonPath(hexPoints);
  const fill = ctx.createLinearGradient(canvas.width / 2, canvas.height / 2 - hexRadius, canvas.width / 2, canvas.height / 2 + hexRadius);
  fill.addColorStop(0, 'rgba(26, 53, 95, 0.98)');
  fill.addColorStop(1, 'rgba(12, 23, 47, 0.98)');
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(124, 240, 197, 0.35)';
  ctx.stroke();
  ctx.restore();
}

function drawStacks() {
  const flashAlpha = state.clearFlashUntil > performance.now() ? 0.78 : 1;
  state.lanes.forEach((lane, boardLane) => {
    lane.forEach((block, depthIndex) => {
      const points = laneBlockPoints(boardLane, depthIndex);
      drawGlowPolygon(points, block.color, block.color, flashAlpha);
    });
  });
}

function drawActivePiece() {
  if (!state.activePiece) return;
  const boardLane = getBoardLaneForWorldLane(state.activePiece.worldLane);
  const centerAngle = getWorldAngleForBoardLane(boardLane);
  const halfAngle = (SECTOR_ANGLE / 2) - LANE_PADDING;
  const inner = state.activePiece.radius - (BLOCK_DEPTH / 2) + 5;
  const outer = state.activePiece.radius + (BLOCK_DEPTH / 2) - 5;
  const points = [
    pointOnCircle(inner, centerAngle - halfAngle),
    pointOnCircle(inner, centerAngle + halfAngle),
    pointOnCircle(outer, centerAngle + halfAngle),
    pointOnCircle(outer, centerAngle - halfAngle),
  ];
  drawGlowPolygon(points, state.activePiece.color, state.activePiece.color, 1);
}

function spawnBurst(boardLane, depthIndex, color) {
  const centerAngle = getWorldAngleForBoardLane(boardLane);
  const radius = getLaneRadius(depthIndex) + (BLOCK_DEPTH / 2);
  for (let index = 0; index < 8; index += 1) {
    const angle = centerAngle + ((Math.random() - 0.5) * SECTOR_ANGLE * 0.9);
    const velocity = 80 + (Math.random() * 95);
    state.particles.push({
      x: canvas.width / 2 + Math.cos(angle) * radius,
      y: canvas.height / 2 + Math.sin(angle) * radius,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 0.42 + (Math.random() * 0.22),
      color,
    });
  }
}

function updateParticles(deltaSeconds) {
  state.particles = state.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + (particle.vx * deltaSeconds),
      y: particle.y + (particle.vy * deltaSeconds),
      life: particle.life - deltaSeconds,
      vx: particle.vx * 0.985,
      vy: particle.vy * 0.985,
    }))
    .filter((particle) => particle.life > 0);
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life / 0.55, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 18;
    ctx.shadowColor = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function spawnPiece(now) {
  const worldLane = Math.floor(Math.random() * LANE_COUNT);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const boardLane = getBoardLaneForWorldLane(worldLane);
  const targetDepth = state.lanes[boardLane].length;
  state.activePiece = {
    worldLane,
    color,
    radius: INNER_RADIUS + (MAX_STACK * BLOCK_DEPTH) + 120,
    targetRadius: getLaneRadius(targetDepth) + (BLOCK_DEPTH / 2),
  };
  state.spawnAt = now + SPAWN_DELAY_MS;
}

function markBestIfNeeded() {
  if (state.elapsedMs > state.bestMs) {
    state.bestMs = state.elapsedMs;
    writeBestMs(state.bestMs);
  }
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  markBestIfNeeded();
  updateHud();
  setStatus(`Run over at ${formatTime(state.elapsedMs)}. Press Restart or Space to try again.`);
}

function applyClears() {
  let totalRemoved = 0;
  let chain = 0;

  while (true) {
    const toClear = Array.from({ length: LANE_COUNT }, () => new Set());
    let found = false;

    for (let depth = 0; depth < MAX_STACK; depth += 1) {
      const colors = state.lanes.map((lane) => lane[depth]?.color || '');
      const visited = Array(LANE_COUNT).fill(false);
      for (let start = 0; start < LANE_COUNT; start += 1) {
        if (visited[start] || !colors[start]) continue;
        const color = colors[start];
        const group = [];
        let cursor = start;
        while (!visited[cursor] && colors[cursor] === color) {
          visited[cursor] = true;
          group.push(cursor);
          cursor = mod(cursor + 1, LANE_COUNT);
          if (cursor === start) break;
        }
        if (group.length >= 3) {
          found = true;
          group.forEach((laneIndex) => {
            toClear[laneIndex].add(depth);
            spawnBurst(laneIndex, depth, color);
          });
        }
      }
    }

    if (!found) break;

    chain += 1;
    state.clearFlashUntil = performance.now() + CLEAR_FLASH_MS;
    let removedThisRound = 0;
    state.lanes = state.lanes.map((lane, laneIndex) => lane.filter((block, depthIndex) => {
      if (toClear[laneIndex].has(depthIndex)) {
        removedThisRound += 1;
        return false;
      }
      return true;
    }));
    totalRemoved += removedThisRound;
    state.score += removedThisRound * 120 * chain;
  }

  if (totalRemoved > 0) {
    setStatus(`Cleared ${totalRemoved} block${totalRemoved === 1 ? '' : 's'}${chain > 1 ? ` with a ${chain}x chain` : ''}.`);
  }
}

function landActivePiece() {
  if (!state.activePiece) return;
  const boardLane = getBoardLaneForWorldLane(state.activePiece.worldLane);
  const lane = state.lanes[boardLane];
  if (lane.length >= MAX_STACK) {
    state.activePiece = null;
    endGame();
    return;
  }
  lane.push({
    color: state.activePiece.color,
  });
  state.score += 28;
  state.activePiece = null;
  applyClears();
  if (!state.gameOver) {
    if (state.lanes.some((entry) => entry.length >= MAX_STACK)) {
      endGame();
      return;
    }
    spawnPiece(performance.now());
  }
}

function resetGame() {
  state.running = false;
  state.gameOver = false;
  state.startedAt = 0;
  state.elapsedMs = 0;
  state.score = 0;
  state.lanes = Array.from({ length: LANE_COUNT }, () => []);
  state.activePiece = null;
  state.rotationIndex = 0;
  state.rotationAngle = 0;
  state.targetAngle = 0;
  state.fastDrop = false;
  state.clearFlashUntil = 0;
  state.particles = [];
  state.spawnAt = 0;
  updateHud();
  setStatus('Press Start or tap Space to begin.');
  draw();
}

function startGame() {
  state.running = true;
  state.gameOver = false;
  state.elapsedMs = 0;
  state.score = 0;
  state.lanes = Array.from({ length: LANE_COUNT }, () => []);
  state.activePiece = null;
  state.rotationIndex = 0;
  state.rotationAngle = 0;
  state.targetAngle = 0;
  state.fastDrop = false;
  state.clearFlashUntil = 0;
  state.particles = [];
  state.startedAt = performance.now();
  state.spawnAt = state.startedAt + 180;
  updateHud();
  setStatus('Survive as long as you can.');
}

function rotate(direction) {
  if (!state.running) return;
  state.rotationIndex = mod(state.rotationIndex + direction, LANE_COUNT);
  state.targetAngle = state.rotationIndex * ROTATE_STEP;
}

function updateRotation(deltaSeconds) {
  const current = state.rotationAngle;
  const target = state.targetAngle;
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const step = ROTATE_SPEED * deltaSeconds;
  if (Math.abs(diff) <= step) {
    state.rotationAngle = target;
    return;
  }
  state.rotationAngle += Math.sign(diff) * step;
}

function updateActivePiece(deltaSeconds, now) {
  if (!state.activePiece) {
    if (state.running && now >= state.spawnAt) {
      spawnPiece(now);
    }
    return;
  }

  state.activePiece.targetRadius = getLaneRadius(state.lanes[getBoardLaneForWorldLane(state.activePiece.worldLane)].length) + (BLOCK_DEPTH / 2);
  state.activePiece.radius -= getCurrentFallSpeed() * deltaSeconds;
  if (state.activePiece.radius <= state.activePiece.targetRadius) {
    landActivePiece();
  }
}

function update(deltaSeconds, now) {
  if (!state.running) {
    updateRotation(deltaSeconds);
    updateParticles(deltaSeconds);
    return;
  }

  state.elapsedMs = now - state.startedAt;
  updateRotation(deltaSeconds);
  updateActivePiece(deltaSeconds, now);
  updateParticles(deltaSeconds);
  markBestIfNeeded();
  updateHud();
}

function draw() {
  drawBackground();
  drawBoardGuides();
  drawStacks();
  drawActivePiece();
  drawParticles();
}

function frame(now) {
  if (!state.lastFrame) state.lastFrame = now;
  const deltaSeconds = clamp((now - state.lastFrame) / 1000, 0, 0.05);
  state.lastFrame = now;
  update(deltaSeconds, now);
  draw();
  window.requestAnimationFrame(frame);
}

function handleKeyDown(event) {
  const code = event.code;
  if (code === 'ArrowLeft' || code === 'KeyA') {
    event.preventDefault();
    if (!state.running && !state.gameOver) {
      startGame();
    }
    rotate(-1);
    return;
  }
  if (code === 'ArrowRight' || code === 'KeyD') {
    event.preventDefault();
    if (!state.running && !state.gameOver) {
      startGame();
    }
    rotate(1);
    return;
  }
  if (code === 'ArrowDown' || code === 'KeyS') {
    event.preventDefault();
    state.fastDrop = true;
    return;
  }
  if (code === 'Space') {
    event.preventDefault();
    if (state.gameOver) {
      startGame();
    } else if (!state.running) {
      startGame();
    }
  }
}

function handleKeyUp(event) {
  const code = event.code;
  if (code === 'ArrowDown' || code === 'KeyS') {
    event.preventDefault();
    state.fastDrop = false;
  }
}

function bindEvents() {
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

function init() {
  state.bestMs = readBestMs();
  updateHud();
  bindEvents();
  resetGame();
  window.requestAnimationFrame(frame);
}

init();
