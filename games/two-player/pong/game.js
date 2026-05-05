(function () {
  const canvas = document.getElementById('volleyCanvas');
  const context = canvas.getContext('2d');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // Customization hooks:
  const ballColor = '#7cf0c5';
  const paddleWidth = 18;

  const MAX_SCORE = 10;
  const BASE_PADDLE_HEIGHT = 118;
  const MIN_PADDLE_HEIGHT = 82;
  const MAX_PADDLE_HEIGHT = 154;
  const PADDLE_SPEED = 8.8;
  const BALL_RADIUS = 11;
  const BASE_BALL_SPEED = 6.4;
  const SPEED_RAMP_MULTIPLIER = 1.1;
  const MAX_BOUNCE_ANGLE = Math.PI / 3.6;
  const AI_DELAY_MS = 130;
  const AI_TRACKING_GAIN = 0.155;
  const AI_MAX_SPEED = 6.8;
  const TRAIL_LENGTH = 16;
  const SERVE_DELAY_MS = 860;

  const state = {
    running: false,
    paused: false,
    mode: 'ai',
    scores: [0, 0],
    paddles: [
      { x: 46, y: HEIGHT * 0.5, targetY: HEIGHT * 0.5, height: BASE_PADDLE_HEIGHT, hitPulse: 0 },
      { x: WIDTH - 46 - paddleWidth, y: HEIGHT * 0.5, targetY: HEIGHT * 0.5, height: BASE_PADDLE_HEIGHT, hitPulse: 0 },
    ],
    ball: {
      x: WIDTH * 0.5,
      y: HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      speed: BASE_BALL_SPEED,
      trail: [],
    },
    keys: {
      p1Up: false,
      p1Down: false,
      p2Up: false,
      p2Down: false,
    },
    lastTime: 0,
    serveOwner: Math.random() > 0.5 ? 0 : 1,
    rallyHits: 0,
    statusText: '',
    overlayMode: 'intro',
    aiMemoryY: HEIGHT * 0.5,
    aiLastSampleAt: 0,
    pulseAmount: 0,
    shakeAmount: 0,
    winnerLabel: '',
  };

  const ui = {
    boardOverlay: document.getElementById('boardOverlay'),
    overlayKicker: document.getElementById('overlayKicker'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    startButton: document.getElementById('startButton'),
    toggleModeBtn: document.getElementById('toggleModeBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    stageShell: document.getElementById('stageShell'),
    modePill: document.getElementById('modePill'),
    phasePill: document.getElementById('phasePill'),
    statusCopy: document.getElementById('statusCopy'),
    speedValue: document.getElementById('speedValue'),
    rallyValue: document.getElementById('rallyValue'),
    aiDelayValue: document.getElementById('aiDelayValue'),
    pulseValue: document.getElementById('pulseValue'),
    playerCard0: document.getElementById('playerCard0'),
    playerCard1: document.getElementById('playerCard1'),
    scoreValue0: document.getElementById('scoreValue0'),
    scoreValue1: document.getElementById('scoreValue1'),
    heightValue0: document.getElementById('heightValue0'),
    heightValue1: document.getElementById('heightValue1'),
    rightPlayerLabel: document.getElementById('rightPlayerLabel'),
    rightPlayerTag: document.getElementById('rightPlayerTag'),
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setStatus(text) {
    state.statusText = text;
    ui.statusCopy.innerHTML = text;
  }

  function setOverlay(mode) {
    state.overlayMode = mode;
    ui.boardOverlay.hidden = mode === 'none';
    if (mode === 'intro') {
      ui.overlayKicker.textContent = 'Vector duel';
      ui.overlayTitle.textContent = 'Vector Volley';
      ui.overlayText.textContent = 'Launch the rally, bend the return angle by hitting the paddle off-center, and survive the 10% speed climb after every paddle contact.';
      ui.startButton.textContent = 'Start Match';
      return;
    }

    if (mode === 'point') {
      ui.overlayKicker.textContent = 'Point scored';
      ui.overlayTitle.textContent = state.winnerLabel;
      ui.overlayText.textContent = `${state.winnerLabel} takes the point. Launch the next serve when ready.`;
      ui.startButton.textContent = 'Serve Again';
      return;
    }

    if (mode === 'match') {
      ui.overlayKicker.textContent = 'Match complete';
      ui.overlayTitle.textContent = `${state.winnerLabel} wins the match`;
      ui.overlayText.textContent = 'Restart to clear the board or toggle modes for a different opponent style.';
      ui.startButton.textContent = 'Play Again';
    }
  }

  function updateModeUi() {
    const versusAi = state.mode === 'ai';
    ui.modePill.textContent = versusAi ? 'Mode: Versus AI' : 'Mode: Local 2P';
    ui.toggleModeBtn.textContent = versusAi ? 'Switch to 2P' : 'Switch to AI';
    ui.rightPlayerLabel.textContent = versusAi ? 'Vector AI' : 'Player 2';
    ui.rightPlayerTag.textContent = versusAi ? 'Delay follow' : 'Arrow keys';
    ui.aiDelayValue.textContent = versusAi ? `${AI_DELAY_MS}ms` : 'Manual';
  }

  function updatePaddleSizes() {
    const diff = state.scores[0] - state.scores[1];
    state.paddles[0].height = clamp(BASE_PADDLE_HEIGHT - diff * 8, MIN_PADDLE_HEIGHT, MAX_PADDLE_HEIGHT);
    state.paddles[1].height = clamp(BASE_PADDLE_HEIGHT + diff * 8, MIN_PADDLE_HEIGHT, MAX_PADDLE_HEIGHT);
  }

  function resetBall(owner = state.serveOwner) {
    state.ball.x = WIDTH * 0.5;
    state.ball.y = HEIGHT * 0.5;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.speed = BASE_BALL_SPEED;
    state.ball.trail = [];
    state.rallyHits = 0;
    state.serveOwner = owner;
    updateHud();
  }

  function serveBall() {
    const direction = state.serveOwner === 0 ? 1 : -1;
    const launchAngle = (Math.random() * 0.9 - 0.45) * MAX_BOUNCE_ANGLE;
    state.ball.speed = BASE_BALL_SPEED;
    state.ball.vx = Math.cos(launchAngle) * state.ball.speed * direction;
    state.ball.vy = Math.sin(launchAngle) * state.ball.speed;
    state.running = true;
    state.paused = false;
    setOverlay('none');
    setStatus(state.mode === 'ai'
      ? 'Player 1 uses <strong>W / S</strong>. The right paddle follows with a slight reaction delay.'
      : 'Player 1 uses <strong>W / S</strong>. Player 2 uses <strong>Arrow Up / Arrow Down</strong>.');
  }

  function resetMatch() {
    state.scores = [0, 0];
    state.paddles[0].y = HEIGHT * 0.5;
    state.paddles[1].y = HEIGHT * 0.5;
    state.paddles[0].targetY = HEIGHT * 0.5;
    state.paddles[1].targetY = HEIGHT * 0.5;
    state.paddles[0].hitPulse = 0;
    state.paddles[1].hitPulse = 0;
    state.serveOwner = Math.random() > 0.5 ? 0 : 1;
    state.winnerLabel = '';
    state.pulseAmount = 0;
    state.shakeAmount = 0;
    updatePaddleSizes();
    resetBall(state.serveOwner);
    state.running = false;
    state.paused = false;
    setOverlay('intro');
    updateHud();
    setStatus('Press Start to launch the first rally.');
  }

  function updateHud() {
    ui.scoreValue0.textContent = String(state.scores[0]);
    ui.scoreValue1.textContent = String(state.scores[1]);
    ui.heightValue0.textContent = `${Math.round(state.paddles[0].height)}px`;
    ui.heightValue1.textContent = `${Math.round(state.paddles[1].height)}px`;
    ui.speedValue.textContent = `${(state.ball.speed / BASE_BALL_SPEED).toFixed(2)}x`;
    ui.rallyValue.textContent = String(state.rallyHits);
    ui.pulseValue.textContent = state.pulseAmount > 0.08 ? 'Impact' : 'Idle';
    ui.phasePill.textContent = state.paused
      ? 'Paused'
      : state.overlayMode === 'intro'
        ? 'Press Start'
        : state.overlayMode === 'point'
          ? 'Point over'
          : state.overlayMode === 'match'
            ? 'Match finished'
            : 'Rally live';
    ui.playerCard0.classList.toggle('is-active', state.ball.vx <= 0);
    ui.playerCard1.classList.toggle('is-active', state.ball.vx > 0);
    ui.stageShell.classList.toggle('is-pulsing', state.pulseAmount > 0.08);
    updateModeUi();
  }

  function triggerImpactPulse(strength = 1) {
    state.pulseAmount = Math.max(state.pulseAmount, 0.18 * strength);
    state.shakeAmount = Math.max(state.shakeAmount, 8 * strength);
    updateHud();
  }

  function maybeUpdateAiTarget(now) {
    if (state.mode !== 'ai') return;
    if ((now - state.aiLastSampleAt) < AI_DELAY_MS) return;
    state.aiLastSampleAt = now;
    state.aiMemoryY = state.ball.y + (Math.random() * 20 - 10);
  }

  function updateAi(deltaMs, now) {
    if (state.mode !== 'ai') return;
    maybeUpdateAiTarget(now);
    const paddle = state.paddles[1];
    const desired = clamp(state.aiMemoryY - paddle.height * 0.5, 0, HEIGHT - paddle.height);
    const distance = desired - paddle.y;
    paddle.y += clamp(distance * AI_TRACKING_GAIN * (deltaMs / 16.6667), -AI_MAX_SPEED, AI_MAX_SPEED);
  }

  function updateManualPaddles(deltaMs) {
    const frameSpeed = PADDLE_SPEED * (deltaMs / 16.6667);
    if (state.keys.p1Up) state.paddles[0].y -= frameSpeed;
    if (state.keys.p1Down) state.paddles[0].y += frameSpeed;
    state.paddles[0].y = clamp(state.paddles[0].y, 0, HEIGHT - state.paddles[0].height);

    if (state.mode === '2p') {
      if (state.keys.p2Up) state.paddles[1].y -= frameSpeed;
      if (state.keys.p2Down) state.paddles[1].y += frameSpeed;
      state.paddles[1].y = clamp(state.paddles[1].y, 0, HEIGHT - state.paddles[1].height);
    }
  }

  function registerTrail() {
    state.ball.trail.unshift({ x: state.ball.x, y: state.ball.y });
    if (state.ball.trail.length > TRAIL_LENGTH) {
      state.ball.trail.length = TRAIL_LENGTH;
    }
  }

  function handleWallBounce() {
    if (state.ball.y - BALL_RADIUS <= 0) {
      state.ball.y = BALL_RADIUS;
      state.ball.vy *= -1;
      triggerImpactPulse(0.45);
    } else if (state.ball.y + BALL_RADIUS >= HEIGHT) {
      state.ball.y = HEIGHT - BALL_RADIUS;
      state.ball.vy *= -1;
      triggerImpactPulse(0.45);
    }
  }

  function paddleCollision(paddle, paddleIndex) {
    const left = paddle.x;
    const right = paddle.x + paddleWidth;
    const top = paddle.y;
    const bottom = paddle.y + paddle.height;

    if (
      state.ball.x + BALL_RADIUS < left ||
      state.ball.x - BALL_RADIUS > right ||
      state.ball.y + BALL_RADIUS < top ||
      state.ball.y - BALL_RADIUS > bottom
    ) {
      return false;
    }

    const movingTowardPaddle = paddleIndex === 0 ? state.ball.vx < 0 : state.ball.vx > 0;
    if (!movingTowardPaddle) return false;

    const paddleCenter = paddle.y + paddle.height * 0.5;
    const distanceFromCenter = (state.ball.y - paddleCenter) / (paddle.height * 0.5);
    const normalized = clamp(distanceFromCenter, -1, 1);
    const reflectionAngle = normalized * MAX_BOUNCE_ANGLE;

    state.ball.speed *= SPEED_RAMP_MULTIPLIER;
    const direction = paddleIndex === 0 ? 1 : -1;
    state.ball.vx = Math.cos(reflectionAngle) * state.ball.speed * direction;
    state.ball.vy = Math.sin(reflectionAngle) * state.ball.speed;
    state.ball.x = paddleIndex === 0 ? right + BALL_RADIUS + 1 : left - BALL_RADIUS - 1;
    state.rallyHits += 1;
    paddle.hitPulse = 1;
    triggerImpactPulse(1);
    updateHud();
    return true;
  }

  function handleScore(side) {
    state.scores[side] += 1;
    updatePaddleSizes();
    state.running = false;
    state.paused = false;
    state.winnerLabel = side === 0 ? 'Player 1' : (state.mode === 'ai' ? 'Vector AI' : 'Player 2');
    resetBall(side === 0 ? 1 : 0);
    updateHud();

    if (state.scores[side] >= MAX_SCORE) {
      setOverlay('match');
      setStatus(`<strong>${state.winnerLabel}</strong> won the match ${state.scores[0]}-${state.scores[1]}.`);
      return;
    }

    setOverlay('point');
    setStatus(`<strong>${state.winnerLabel}</strong> scored. Next serve goes to the other side.`);
  }

  function updateBall(deltaMs, now) {
    if (!state.running || state.paused) return;

    const step = deltaMs / 16.6667;
    state.ball.x += state.ball.vx * step;
    state.ball.y += state.ball.vy * step;
    registerTrail();
    handleWallBounce();

    paddleCollision(state.paddles[0], 0);
    paddleCollision(state.paddles[1], 1);

    if (state.ball.x + BALL_RADIUS < 0) {
      handleScore(1);
      return;
    }

    if (state.ball.x - BALL_RADIUS > WIDTH) {
      handleScore(0);
      return;
    }

    updateAi(deltaMs, now);
  }

  function updateEffects(deltaMs) {
    const decay = deltaMs / 220;
    state.pulseAmount = Math.max(0, state.pulseAmount - decay * 0.08);
    state.shakeAmount = Math.max(0, state.shakeAmount - decay * 2.1);
    state.paddles.forEach((paddle) => {
      paddle.hitPulse = Math.max(0, paddle.hitPulse - decay * 0.18);
    });
  }

  function drawBackground() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    const bg = context.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, '#09101d');
    bg.addColorStop(0.55, '#0d1727');
    bg.addColorStop(1, '#04070f');
    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.save();
    context.globalAlpha = 0.09;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 1;
    for (let y = 60; y < HEIGHT; y += 60) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(WIDTH, y);
      context.stroke();
    }
    context.restore();

    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '900 210px "Segoe UI", Tahoma, sans-serif';
    context.fillStyle = 'rgba(255,255,255,0.035)';
    context.fillText(`${state.scores[0]}   ${state.scores[1]}`, WIDTH * 0.5, HEIGHT * 0.5);
    context.restore();
  }

  function drawArenaLines() {
    context.save();
    context.strokeStyle = 'rgba(255,255,255,0.14)';
    context.lineWidth = 4;
    context.strokeRect(18, 18, WIDTH - 36, HEIGHT - 36);

    context.setLineDash([14, 12]);
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(WIDTH * 0.5, 24);
    context.lineTo(WIDTH * 0.5, HEIGHT - 24);
    context.stroke();
    context.setLineDash([]);
    context.restore();
  }

  function drawTrail() {
    context.save();
    for (let i = 0; i < state.ball.trail.length; i += 1) {
      const node = state.ball.trail[i];
      const alpha = (1 - i / state.ball.trail.length) * 0.42;
      context.fillStyle = `rgba(124, 240, 197, ${alpha})`;
      context.beginPath();
      context.arc(node.x, node.y, Math.max(2, BALL_RADIUS - i * 0.45), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function drawPaddle(paddle, color) {
    const pulse = paddle.hitPulse;
    context.save();
    context.shadowBlur = 18 + pulse * 18;
    context.shadowColor = color;
    context.fillStyle = color;
    context.fillRect(paddle.x, paddle.y, paddleWidth, paddle.height);
    context.fillStyle = 'rgba(255,255,255,0.16)';
    context.fillRect(paddle.x + 3, paddle.y + 3, Math.max(2, paddleWidth - 8), paddle.height - 6);
    context.restore();
  }

  function drawBall() {
    context.save();
    context.shadowBlur = 22;
    context.shadowColor = ballColor;
    context.fillStyle = ballColor;
    context.beginPath();
    context.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawGoalFlash() {
    if (state.overlayMode === 'none' || state.overlayMode === 'intro') return;
    context.save();
    context.globalAlpha = 0.14 + state.pulseAmount * 0.4;
    context.fillStyle = state.winnerLabel.includes('1') ? 'rgba(124,240,197,1)' : 'rgba(122,167,255,1)';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.restore();
  }

  function render() {
    context.save();
    const shakeX = (Math.random() * 2 - 1) * state.shakeAmount;
    const shakeY = (Math.random() * 2 - 1) * state.shakeAmount * 0.6;
    context.translate(shakeX, shakeY);
    drawBackground();
    drawArenaLines();
    drawTrail();
    drawPaddle(state.paddles[0], '#7cf0c5');
    drawPaddle(state.paddles[1], '#7aa7ff');
    drawBall();
    drawGoalFlash();
    context.restore();
  }

  function update(now) {
    if (!state.lastTime) state.lastTime = now;
    const deltaMs = Math.min(32, now - state.lastTime);
    state.lastTime = now;

    updateManualPaddles(deltaMs);
    updateBall(deltaMs, now);
    updateEffects(deltaMs);
    updateHud();
    render();
    requestAnimationFrame(update);
  }

  function startOrResumeMatch() {
    if (state.overlayMode === 'match') {
      resetMatch();
      return;
    }

    if (state.overlayMode === 'intro' || state.overlayMode === 'point') {
      window.setTimeout(() => {
        serveBall();
        updateHud();
      }, state.overlayMode === 'intro' ? 120 : SERVE_DELAY_MS * 0.15);
    } else if (state.paused) {
      state.paused = false;
      setOverlay('none');
      setStatus('Rally resumed.');
    }
  }

  function toggleMode() {
    state.mode = state.mode === 'ai' ? '2p' : 'ai';
    state.aiMemoryY = state.ball.y;
    updateModeUi();
    resetMatch();
    setStatus(state.mode === 'ai'
      ? 'AI enabled on the right paddle. Press Start to begin.'
      : 'Local 2-player mode enabled. Press Start to begin.');
  }

  function togglePause() {
    if (state.overlayMode !== 'none') return;
    state.paused = !state.paused;
    if (state.paused) {
      setOverlay('point');
      ui.overlayKicker.textContent = 'Paused';
      ui.overlayTitle.textContent = 'Rally paused';
      ui.overlayText.textContent = 'Press Start Match or P to continue the current rally.';
      ui.startButton.textContent = 'Resume';
      setStatus('Paused.');
    } else {
      setOverlay('none');
      setStatus('Rally resumed.');
    }
    updateHud();
  }

  function attachEvents() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat && event.code !== 'KeyW' && event.code !== 'KeyS' && event.code !== 'ArrowUp' && event.code !== 'ArrowDown') {
        return;
      }

      if (event.code === 'KeyW') state.keys.p1Up = true;
      if (event.code === 'KeyS') state.keys.p1Down = true;
      if (event.code === 'ArrowUp') state.keys.p2Up = true;
      if (event.code === 'ArrowDown') state.keys.p2Down = true;

      if (event.code === 'KeyP') {
        event.preventDefault();
        togglePause();
      }

      if (event.code === 'KeyR') {
        event.preventDefault();
        resetMatch();
      }

      if (event.code === 'KeyT') {
        event.preventDefault();
        toggleMode();
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'KeyW') state.keys.p1Up = false;
      if (event.code === 'KeyS') state.keys.p1Down = false;
      if (event.code === 'ArrowUp') state.keys.p2Up = false;
      if (event.code === 'ArrowDown') state.keys.p2Down = false;
    });

    ui.startButton.addEventListener('click', startOrResumeMatch);
    ui.toggleModeBtn.addEventListener('click', toggleMode);
    ui.pauseBtn.addEventListener('click', togglePause);
    ui.restartBtn.addEventListener('click', resetMatch);
  }

  function init() {
    updatePaddleSizes();
    updateModeUi();
    updateHud();
    setOverlay('intro');
    setStatus('Player 1 uses <strong>W / S</strong>. Start in AI mode or switch to full local 2P.');
    attachEvents();
    requestAnimationFrame(update);
  }

  init();
})();
