(function () {
  const LEADERBOARD_KEY = 'playr.aimTrainingArena.bests.v1';
  const LAST_MODE_KEY = 'playr.aimTrainingArena.lastMode.v1';
  const SESSION_KEY = 'playr.aimTrainingArena.session.v1';

  const MODE_DEFS = {
    reaction: {
      label: 'Reaction Time',
      group: 'Reaction',
      copy: 'Wait for the target, then click instantly. False starts reset the rhythm.',
      modeStatLabel: 'Fastest average response across click-based reps.',
      modeStatUnit: 'ms',
      modeStatKey: 'avgReactionMs',
      allowedClicks: true,
      color: 'amber',
      targetCount: 1,
      targetLifeMs: 1400,
      precisionBias: 0.7,
      centerBias: 0.15,
    },
    flick: {
      label: 'Flick Shot',
      group: 'Flicking',
      copy: 'One target at a time. Snap cleanly and move to the next instantly.',
      modeStatLabel: 'Average time per target.',
      modeStatUnit: 'ms',
      modeStatKey: 'avgHitMs',
      allowedClicks: true,
      color: 'green',
      targetCount: 1,
      targetLifeMs: 1250,
      precisionBias: 0.6,
      centerBias: 0.3,
    },
    precision: {
      label: 'Micro Flick',
      group: 'Flicking',
      copy: 'Small targets with tighter spacing. This trains the last adjustment, not the first snap.',
      modeStatLabel: 'Precision hits inside the smallest aim window.',
      modeStatUnit: '%',
      modeStatKey: 'microAccuracyPct',
      allowedClicks: true,
      color: 'teal',
      targetCount: 1,
      targetLifeMs: 1150,
      precisionBias: 0.95,
      centerBias: 0.42,
    },
    switching: {
      label: 'Target Switching',
      group: 'Switching',
      copy: 'Clear multiple targets fast. Prioritize the highlighted one when waves start to crowd.',
      modeStatLabel: 'Average wave clear time.',
      modeStatUnit: 's',
      modeStatKey: 'avgWaveMs',
      allowedClicks: true,
      color: 'gold',
      targetCount: 5,
      targetLifeMs: 2200,
      precisionBias: 0.7,
      centerBias: 0.2,
    },
    tracking: {
      label: 'Tracking',
      group: 'Tracking',
      copy: 'Keep the cursor on the target while it moves smoothly across the arena.',
      modeStatLabel: 'Percent of run spent on target.',
      modeStatUnit: '%',
      modeStatKey: 'trackingPct',
      allowedClicks: false,
      color: 'green',
      targetCount: 1,
      targetLifeMs: 0,
      precisionBias: 1,
      centerBias: 0.35,
    },
    dynamic: {
      label: 'Dynamic Tracking',
      group: 'Tracking',
      copy: 'Track the target, then react again when it teleports. Smooth control plus flick recovery.',
      modeStatLabel: 'Teleports recovered during the run.',
      modeStatUnit: 'hits',
      modeStatKey: 'teleportsRecovered',
      allowedClicks: false,
      color: 'teal',
      targetCount: 1,
      targetLifeMs: 0,
      precisionBias: 1,
      centerBias: 0.35,
    },
    timing: {
      label: 'Click Timing',
      group: 'Precision',
      copy: 'The target pulses. Click only when it reaches the timing window, not just when it is visible.',
      modeStatLabel: 'Perfect timing hits.',
      modeStatUnit: '%',
      modeStatKey: 'perfectTimingPct',
      allowedClicks: true,
      color: 'amber',
      targetCount: 1,
      targetLifeMs: 1700,
      precisionBias: 0.85,
      centerBias: 0.25,
    },
    decision: {
      label: 'Decision Mode',
      group: 'Advanced',
      copy: 'Some targets pay points, some punish mistakes. Aim is only half the skill here.',
      modeStatLabel: 'Correct picks minus traps.',
      modeStatUnit: 'net',
      modeStatKey: 'decisionNet',
      allowedClicks: true,
      color: 'red',
      targetCount: 5,
      targetLifeMs: 2000,
      precisionBias: 0.75,
      centerBias: 0.25,
    },
  };

  const PRESETS = {
    easy: { targetSize: 72, spawnSpeed: 0.85, movementSpeed: 0.8, duration: 30 },
    standard: { targetSize: 54, spawnSpeed: 1, movementSpeed: 1, duration: 45 },
    hard: { targetSize: 34, spawnSpeed: 1.3, movementSpeed: 1.35, duration: 60 },
  };

  const CHALLENGE_DEFS = [
    {
      mode: 'reaction',
      title: 'False Start Discipline',
      copy: 'Land a 90%+ accuracy run in Reaction Time and do not false-start more than once.',
      metric: 'Accuracy',
      target: '90%',
    },
    {
      mode: 'flick',
      title: 'Clean Snap',
      copy: 'Clear Flick Shot with an average hit time under 260ms and at least a 10-hit streak.',
      metric: 'Avg hit time',
      target: '<260ms',
    },
    {
      mode: 'precision',
      title: 'Tiny Target Discipline',
      copy: 'Beat Micro Flick with at least 80% accuracy while keeping the combo alive.',
      metric: 'Accuracy',
      target: '80%+',
    },
    {
      mode: 'switching',
      title: 'Wave Cleaner',
      copy: 'Clear three switching waves without dropping your combo.',
      metric: 'Waves',
      target: '3',
    },
    {
      mode: 'tracking',
      title: 'Sticky Cursor',
      copy: 'Keep the cursor on target for at least 70% of the run.',
      metric: 'On-target',
      target: '70%+',
    },
    {
      mode: 'dynamic',
      title: 'Recover Fast',
      copy: 'Survive at least five teleports and reacquire each one quickly.',
      metric: 'Teleports',
      target: '5',
    },
    {
      mode: 'timing',
      title: 'Perfect Window',
      copy: 'Hit the pulse window three times in a row without breaking the streak.',
      metric: 'Perfects',
      target: '3',
    },
    {
      mode: 'decision',
      title: 'Prioritize Correctly',
      copy: 'Finish with a positive net decision score and fewer misses than correct hits.',
      metric: 'Net score',
      target: 'Positive',
    },
  ];

  const dom = {
    startBtn: document.getElementById('startBtn'),
    replayBtn: document.getElementById('replayBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsPanel: document.getElementById('settingsPanel'),
    settingsCloseBtn: document.getElementById('settingsCloseBtn'),
    quitBtn: document.getElementById('quitBtn'),
    stageStartPanel: document.getElementById('stageStartPanel'),
    stageStartBtn: document.getElementById('stageStartBtn'),
    stageReplayBtn: document.getElementById('stageReplayBtn'),
    stageStartTitle: document.getElementById('stageStartTitle'),
    stageStartCopy: document.getElementById('stageStartCopy'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    changeModeBtn: document.getElementById('changeModeBtn'),
    heroBest: document.getElementById('heroBest'),
    modeGroupLabel: document.getElementById('modeGroupLabel'),
    modeCopy: document.getElementById('modeCopy'),
    modeTitle: document.getElementById('modeTitle'),
    runState: document.getElementById('runState'),
    stageHint: document.getElementById('stageHint'),
    arenaStage: document.getElementById('arenaStage'),
    targetLayer: document.getElementById('targetLayer'),
    scoreValue: document.getElementById('scoreValue'),
    accuracyValue: document.getElementById('accuracyValue'),
    comboValue: document.getElementById('comboValue'),
    timeValue: document.getElementById('timeValue'),
    hitsValue: document.getElementById('hitsValue'),
    missesValue: document.getElementById('missesValue'),
    streakValue: document.getElementById('streakValue'),
    reactionValue: document.getElementById('reactionValue'),
    resultsPanel: document.getElementById('resultsPanel'),
    resultTier: document.getElementById('resultTier'),
    resultScore: document.getElementById('resultScore'),
    resultReaction: document.getElementById('resultReaction'),
    resultAccuracy: document.getElementById('resultAccuracy'),
    resultStreak: document.getElementById('resultStreak'),
    resultDetails: document.getElementById('resultDetails'),
    targetSizeInput: document.getElementById('targetSizeInput'),
    spawnSpeedInput: document.getElementById('spawnSpeedInput'),
    movementSpeedInput: document.getElementById('movementSpeedInput'),
    durationInput: document.getElementById('durationInput'),
    targetSizeValue: document.getElementById('targetSizeValue'),
    spawnSpeedValue: document.getElementById('spawnSpeedValue'),
    movementSpeedValue: document.getElementById('movementSpeedValue'),
    durationValue: document.getElementById('durationValue'),
    bestsList: document.getElementById('bestsList'),
    challengeTitle: document.getElementById('challengeTitle'),
    challengeCopy: document.getElementById('challengeCopy'),
    challengeMeta: document.getElementById('challengeMeta'),
    challengeBadge: document.getElementById('challengeBadge'),
  };

  if (!dom.arenaStage || !dom.targetLayer) return;

  const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
  const presetButtons = Array.from(document.querySelectorAll('[data-preset]'));

  const state = {
    mode: loadLastMode() || 'reaction',
    running: false,
    ended: false,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hits: 0,
    misses: 0,
    falseStarts: 0,
    totalAccuracy: 0,
    accuracySamples: 0,
    reactionTimes: [],
    trackingOnTime: 0,
    trackingTotalTime: 0,
    decisionNet: 0,
    decisionCorrect: 0,
    decisionWrong: 0,
    perfectTiming: 0,
    timingAttempts: 0,
    waveTimes: [],
    microHits: 0,
    teleportsRecovered: 0,
    activeTargets: [],
    stage: { width: 0, height: 0 },
    targetId: 0,
    phase: 'idle',
    phaseEndsAt: 0,
    phaseStartedAt: 0,
    nextSpawnAt: 0,
    lastFrameAt: performance.now(),
    paused: false,
    pauseStartedAt: 0,
    lastModeStat: 0,
    runStartedAt: 0,
    runEndsAt: 0,
    pointer: { x: 0, y: 0, inside: false },
    bests: loadBests(),
    challenge: buildDailyChallenge(),
    settings: loadSettings(),
    audio: null,
    summary: null,
    pendingWaveStartedAt: 0,
    lockedTargetId: null,
    trackingTeleportAt: 0,
    currentTrackingKind: 'linear',
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function formatMs(value) {
    if (!Number.isFinite(value) || value <= 0) return '--';
    return `${Math.round(value)}ms`;
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return '0%';
    return `${round(value, 1)}%`;
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota issues.
    }
  }

  function loadSettings() {
    const stored = loadJson(SESSION_KEY, null);
    if (stored && typeof stored === 'object') {
      return {
        targetSize: clamp(Number(stored.targetSize) || 54, 18, 120),
        spawnSpeed: clamp(Number(stored.spawnSpeed) || 1, 0.7, 2),
        movementSpeed: clamp(Number(stored.movementSpeed) || 1, 0.5, 3),
        duration: clamp(Number(stored.duration) || 45, 30, 60),
      };
    }

    const preset = PRESETS.standard;
    return { ...preset };
  }

  function persistSettings() {
    saveJson(SESSION_KEY, state.settings);
  }

  function loadBests() {
    const stored = loadJson(LEADERBOARD_KEY, {});
    return stored && typeof stored === 'object' ? stored : {};
  }

  function saveBests() {
    saveJson(LEADERBOARD_KEY, state.bests);
  }

  function loadLastMode() {
    try {
      const value = localStorage.getItem(LAST_MODE_KEY);
      return value && MODE_DEFS[value] ? value : null;
    } catch {
      return null;
    }
  }

  function saveLastMode(mode) {
    try {
      localStorage.setItem(LAST_MODE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  }

  function getModeDefinition(mode = state.mode) {
    return MODE_DEFS[mode] || MODE_DEFS.reaction;
  }

  function getCurrentBest(mode = state.mode) {
    const record = state.bests[mode];
    return record && typeof record.bestScore === 'number' ? record.bestScore : 0;
  }

  function buildDailyChallenge() {
    const today = new Date();
    const key = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
      hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
    }
    const challenge = CHALLENGE_DEFS[hash % CHALLENGE_DEFS.length];
    return {
      ...challenge,
      seed: hash,
      dateLabel: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
  }

  function createAudio() {
    if (state.audio || !window.AudioContext) return;
    try {
      state.audio = new window.AudioContext();
    } catch {
      state.audio = null;
    }
  }

  function playTone({ frequency, duration, gain = 0.045, type = 'sine' }) {
    if (!state.audio) return;
    try {
      const context = state.audio;
      if (context.state === 'suspended') {
        context.resume().catch(() => {});
      }
      const oscillator = context.createOscillator();
      const masterGain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      masterGain.gain.value = gain;
      oscillator.connect(masterGain);
      masterGain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.72), context.currentTime + duration);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    } catch {
      // Ignore audio failures.
    }
  }

  function setRunState(message) {
    dom.runState.textContent = message;
  }

  function syncRunControls() {
    dom.startBtn.textContent = state.running && !state.paused ? 'Pause Run' : 'Start Run';
    dom.quitBtn.disabled = !state.running;
    dom.quitBtn.textContent = 'Quit Run';
    if (dom.stageStartPanel) {
      dom.stageStartPanel.hidden = state.running;
    }
    if (dom.stageStartBtn) {
      dom.stageStartBtn.textContent = state.running && state.paused ? 'Resume Run' : 'Start Run';
    }
  }

  function setMode(mode, { preserveSelection = false } = {}) {
    if (!MODE_DEFS[mode]) return;
    state.mode = mode;
    const modeDef = getModeDefinition(mode);
    dom.modeTitle.textContent = modeDef.label;
    dom.modeCopy.textContent = modeDef.copy;
    dom.modeGroupLabel.textContent = modeDef.group;
    if (dom.heroBest) {
      dom.heroBest.textContent = String(getCurrentBest(mode));
    }
    dom.stageHint.textContent = modeDef.copy;
    if (dom.stageStartTitle) {
      dom.stageStartTitle.textContent = modeDef.label;
    }
    if (dom.stageStartCopy) {
      dom.stageStartCopy.textContent = modeDef.copy;
    }
    saveLastMode(mode);
    renderBests();

    if (!preserveSelection) {
      modeButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.mode === mode);
      });
    }
  }

  function setPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    state.settings = { ...preset };
    syncSettingsUI();
    persistSettings();
    presetButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.preset === presetName);
    });
  }

  function syncSettingsUI() {
    dom.targetSizeInput.value = String(state.settings.targetSize);
    dom.spawnSpeedInput.value = String(state.settings.spawnSpeed);
    dom.movementSpeedInput.value = String(state.settings.movementSpeed);
    dom.durationInput.value = String(state.settings.duration);
    dom.targetSizeValue.textContent = `${Math.round(state.settings.targetSize)}px`;
    dom.spawnSpeedValue.textContent = `${Number(state.settings.spawnSpeed).toFixed(2)}x`;
    dom.movementSpeedValue.textContent = `${Number(state.settings.movementSpeed).toFixed(2)}x`;
    dom.durationValue.textContent = `${Math.round(state.settings.duration)}s`;
  }

  function updateSetting(key, value) {
    state.settings[key] = value;
    persistSettings();
    syncSettingsUI();
  }

  function measureStage() {
    const rect = dom.arenaStage.getBoundingClientRect();
    state.stage.width = Math.max(320, Math.floor(rect.width));
    state.stage.height = Math.max(320, Math.floor(rect.height));
    state.activeTargets.forEach((target) => positionTarget(target));
  }

  function positionTarget(target) {
    if (!target || !target.el) return;
    target.el.style.left = `${target.x}px`;
    target.el.style.top = `${target.y}px`;
    target.el.style.width = `${target.size}px`;
    target.el.style.height = `${target.size}px`;
    target.el.style.opacity = target.visible ? '1' : '0';
    target.el.style.transform = `translate(-50%, -50%) scale(${target.scale || 1})`;
    target.el.dataset.mode = state.mode;
  }

  function clearTargets() {
    state.activeTargets.forEach((target) => target.el.remove());
    state.activeTargets = [];
    state.lockedTargetId = null;
  }

  function createTargetElement(target) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `target ${target.type}`;
    button.innerHTML = `<span>${target.label}</span>`;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      createAudio();
      handleTargetHit(target, event);
    });
    return button;
  }

  function addTarget(target) {
    target.el = createTargetElement(target);
    state.targetLayer.appendChild(target.el);
    state.activeTargets.push(target);
    positionTarget(target);
    return target;
  }

  function removeTarget(target) {
    const index = state.activeTargets.findIndex((entry) => entry.id === target.id);
    if (index >= 0) {
      const [removed] = state.activeTargets.splice(index, 1);
      removed.el.remove();
    }
  }

  function getStagePadding() {
    return Math.max(16, Math.min(state.stage.width, state.stage.height) * 0.04);
  }

  function randomStagePoint(margin = getStagePadding()) {
    return {
      x: randomBetween(margin, Math.max(margin + 1, state.stage.width - margin)),
      y: randomBetween(margin, Math.max(margin + 1, state.stage.height - margin)),
    };
  }

  function centerWeightedPoint(weight = 0.3) {
    const centerX = state.stage.width / 2;
    const centerY = state.stage.height / 2;
    const spreadX = state.stage.width * weight * 0.5;
    const spreadY = state.stage.height * weight * 0.5;
    return {
      x: clamp(centerX + randomBetween(-spreadX, spreadX), getStagePadding(), state.stage.width - getStagePadding()),
      y: clamp(centerY + randomBetween(-spreadY, spreadY), getStagePadding(), state.stage.height - getStagePadding()),
    };
  }

  function buildTarget(mode, index = 0) {
    const modeDef = getModeDefinition(mode);
    const baseSize = clamp(state.settings.targetSize, 18, 120);
    const smaller = Math.max(16, Math.round(baseSize * modeDef.precisionBias));
    const size = mode === 'precision' ? smaller : mode === 'switching' ? Math.round(baseSize * 0.8) : mode === 'decision' ? Math.round(baseSize * 0.92) : baseSize;
    const point = modeDef.centerBias > 0.2 ? centerWeightedPoint(modeDef.centerBias) : randomStagePoint();
    const label = mode === 'decision' ? (index % 2 === 0 ? '+10' : '-8') : mode === 'timing' ? 'Wait' : mode === 'switching' && index === 0 ? '1' : mode === 'tracking' || mode === 'dynamic' ? 'Track' : '';
    const positive = mode !== 'decision' ? true : index % 2 === 0;
    const priority = mode === 'switching' ? index === 0 : false;
    const type = positive ? 'good' : 'bad';

    return {
      id: ++state.targetId,
      mode,
      index,
      x: point.x,
      y: point.y,
      size,
      label,
      type,
      priority,
      positive,
      value: positive ? 10 : -8,
      bornAt: performance.now(),
      expiresAt: 0,
      reactionStart: performance.now(),
      scale: 1,
      visible: true,
      vx: 0,
      vy: 0,
      pulseSeed: Math.random() * Math.PI * 2,
      hitRadius: size / 2,
      phaseOffset: Math.random() * Math.PI * 2,
      movePhase: Math.random() * Math.PI * 2,
      teleportAt: 0,
      locked: false,
      el: null,
    };
  }

  function placeReactionTarget() {
    clearTargets();
    const target = buildTarget('reaction', 0);
    target.expiresAt = performance.now() + Math.max(700, 2000 / state.settings.spawnSpeed);
    target.size = Math.round(clamp(state.settings.targetSize, 18, 120));
    target.label = 'Go';
    addTarget(target);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.lockedTargetId = target.id;
    dom.stageHint.textContent = 'Click as soon as the target appears.';
  }

  function queueReactionSpawn() {
    const delay = randomBetween(900, 3000) / state.settings.spawnSpeed;
    state.phase = 'waiting';
    state.phaseStartedAt = performance.now();
    state.phaseEndsAt = performance.now() + delay;
    clearTargets();
    dom.stageHint.textContent = 'Hold steady. The target will appear after a random delay.';
  }

  function spawnFlickTarget(mode) {
    clearTargets();
    const target = buildTarget(mode, 0);
    const windowSize = mode === 'precision' ? 0.42 : mode === 'flick' ? 0.6 : 0.5;
    const point = mode === 'precision' ? centerWeightedPoint(windowSize) : randomStagePoint();
    target.x = point.x;
    target.y = point.y;
    target.size = mode === 'precision'
      ? Math.max(16, Math.round(state.settings.targetSize * 0.55))
      : Math.round(state.settings.targetSize * (mode === 'flick' ? 0.95 : 1));
    target.expiresAt = performance.now() + Math.max(550, 1800 / state.settings.spawnSpeed);
    target.label = mode === 'precision' ? 'Tiny' : 'Snap';
    target.moveMode = 'none';
    addTarget(target);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.lockedTargetId = target.id;
    dom.stageHint.textContent = mode === 'precision'
      ? 'Tiny targets spawn near the middle of the stage.'
      : 'Click the target, then keep the rhythm going.';
  }

  function spawnSwitchWave() {
    clearTargets();
    const waveSize = clamp(3 + Math.floor(state.settings.spawnSpeed * 2), 3, 6);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.pendingWaveStartedAt = performance.now();
    for (let index = 0; index < waveSize; index += 1) {
      const target = buildTarget('switching', index);
      const point = randomStagePoint();
      target.x = point.x;
      target.y = point.y;
      target.size = Math.max(28, Math.round(state.settings.targetSize * 0.8));
      target.label = String(index + 1);
      target.priority = index === 0;
      target.expiresAt = performance.now() + Math.max(700, 2400 / state.settings.spawnSpeed) + index * 120;
      addTarget(target);
    }
    dom.stageHint.textContent = 'Clear every target on screen as fast as possible.';
  }

  function spawnDecisionWave() {
    clearTargets();
    const count = clamp(4 + Math.floor(state.settings.spawnSpeed * 1.5), 4, 6);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.pendingWaveStartedAt = performance.now();
    for (let index = 0; index < count; index += 1) {
      const target = buildTarget('decision', index);
      const point = index % 2 === 0 ? randomStagePoint() : centerWeightedPoint(0.52);
      target.x = point.x;
      target.y = point.y;
      target.size = Math.max(30, Math.round(state.settings.targetSize * 0.88));
      target.priority = index === 0;
      target.label = target.positive ? '+10' : '-8';
      target.expiresAt = performance.now() + Math.max(800, 2600 / state.settings.spawnSpeed) + index * 150;
      addTarget(target);
    }
    dom.stageHint.textContent = 'Prioritize points, ignore the traps, and do not waste clicks.';
  }

  function spawnTrackingTarget(kind = 'tracking') {
    clearTargets();
    const target = buildTarget(kind, 0);
    const point = centerWeightedPoint(kind === 'dynamic' ? 0.45 : 0.55);
    target.x = point.x;
    target.y = point.y;
    target.size = Math.max(36, Math.round(state.settings.targetSize * 0.92));
    target.label = 'Track';
    target.moveMode = kind;
    target.expiresAt = 0;
    target.vx = (Math.random() > 0.5 ? 1 : -1) * randomBetween(0.5, 1.1) * state.settings.movementSpeed * (kind === 'dynamic' ? 1.5 : 1);
    target.vy = (Math.random() > 0.5 ? 1 : -1) * randomBetween(0.45, 1.0) * state.settings.movementSpeed * (kind === 'dynamic' ? 1.4 : 1);
    target.scale = 1;
    target.teleportAt = performance.now() + randomBetween(1200, 2400) / Math.max(0.75, state.settings.spawnSpeed);
    addTarget(target);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.lockedTargetId = target.id;
    state.currentTrackingKind = kind === 'dynamic' ? 'dynamic' : 'linear';
    state.trackingTeleportAt = 0;
    dom.stageHint.textContent = kind === 'dynamic'
      ? 'Keep tracking when the target teleports. Reacquire quickly.'
      : 'Keep the cursor on the moving target for as long as possible.';
  }

  function spawnTimingTarget() {
    clearTargets();
    const target = buildTarget('timing', 0);
    const point = centerWeightedPoint(0.42);
    target.x = point.x;
    target.y = point.y;
    target.size = Math.max(42, Math.round(state.settings.targetSize * 0.95));
    target.label = 'Pulse';
    target.scale = 0.72;
    target.pulseSeed = Math.random() * Math.PI * 2;
    target.expiresAt = performance.now() + Math.max(1000, 2400 / state.settings.spawnSpeed);
    addTarget(target);
    state.phase = 'active';
    state.phaseStartedAt = performance.now();
    state.lockedTargetId = target.id;
    dom.stageHint.textContent = 'Click only when the pulse is inside the timing window.';
  }

  function startRun() {
    createAudio();
    measureStage();
    clearTargets();
    state.running = true;
    state.ended = false;
    state.paused = false;
    state.pauseStartedAt = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hits = 0;
    state.misses = 0;
    state.falseStarts = 0;
    state.totalAccuracy = 0;
    state.accuracySamples = 0;
    state.reactionTimes = [];
    state.trackingOnTime = 0;
    state.trackingTotalTime = 0;
    state.decisionNet = 0;
    state.decisionCorrect = 0;
    state.decisionWrong = 0;
    state.perfectTiming = 0;
    state.timingAttempts = 0;
    state.waveTimes = [];
    state.microHits = 0;
    state.teleportsRecovered = 0;
    state.phase = 'idle';
    state.phaseEndsAt = 0;
    state.phaseStartedAt = performance.now();
    state.nextSpawnAt = 0;
    state.lastFrameAt = performance.now();
    state.runStartedAt = performance.now();
    state.runEndsAt = performance.now() + state.settings.duration * 1000;
    state.pendingWaveStartedAt = 0;
    state.lockedTargetId = null;
    state.trackingTeleportAt = 0;
    dom.resultsPanel.hidden = true;
    syncRunControls();
    setRunState('Running');
    dom.stageHint.textContent = getModeDefinition().copy;
    dom.arenaStage.focus({ preventScroll: true });
    if (state.mode === 'reaction') {
      queueReactionSpawn();
    } else if (state.mode === 'flick' || state.mode === 'precision') {
      spawnFlickTarget(state.mode);
    } else if (state.mode === 'switching') {
      spawnSwitchWave();
    } else if (state.mode === 'tracking' || state.mode === 'dynamic') {
      spawnTrackingTarget(state.mode);
    } else if (state.mode === 'timing') {
      spawnTimingTarget();
    } else if (state.mode === 'decision') {
      spawnDecisionWave();
    }
    updateHUD();
    renderBests();
  }

  function pauseRun() {
    if (!state.running || state.paused) return;
    state.paused = true;
    state.pauseStartedAt = performance.now();
    setRunState('Paused');
    dom.stageHint.textContent = 'Paused. Press Start Run to resume or Quit Run to end the session.';
    syncRunControls();
  }

  function resumeRun() {
    if (!state.running || !state.paused) return;
    const resumeAt = performance.now();
    const pausedFor = resumeAt - state.pauseStartedAt;
    state.runStartedAt += pausedFor;
    state.runEndsAt += pausedFor;
    if (state.phaseStartedAt) state.phaseStartedAt += pausedFor;
    if (state.phaseEndsAt) state.phaseEndsAt += pausedFor;
    if (state.nextSpawnAt) state.nextSpawnAt += pausedFor;
    if (state.pendingWaveStartedAt) state.pendingWaveStartedAt += pausedFor;
    if (state.trackingTeleportAt) state.trackingTeleportAt += pausedFor;
    state.activeTargets.forEach((target) => {
      target.bornAt += pausedFor;
      if (target.expiresAt) target.expiresAt += pausedFor;
      if (target.teleportAt) target.teleportAt += pausedFor;
    });
    state.lastFrameAt = resumeAt;
    state.paused = false;
    state.pauseStartedAt = 0;
    setRunState('Running');
    dom.stageHint.textContent = getModeDefinition().copy;
    syncRunControls();
  }

  function stopRun({ showResults = true, announce = 'Ready' } = {}) {
    if (!state.running && !state.ended) {
      setRunState(announce);
      syncRunControls();
      return;
    }

    state.running = false;
    state.ended = true;
    state.paused = false;
    state.pauseStartedAt = 0;
    state.runEndsAt = performance.now();
    setRunState(announce);
    clearTargets();
    state.phase = 'idle';
    state.lockedTargetId = null;
    syncRunControls();
    if (showResults) {
      finalizeRun();
    }
  }

  function finalizeRun() {
    const summary = buildSummary();
    state.summary = summary;
    updateBests(summary);
    renderResults(summary);
    renderBests();
    saveBests();
  }

  function buildSummary() {
    const elapsedMs = Math.max(1, performance.now() - state.runStartedAt);
    const accuracyPct = state.accuracySamples > 0 ? (state.totalAccuracy / state.accuracySamples) * 100 : 100;
    const avgReactionMs = state.reactionTimes.length
      ? state.reactionTimes.reduce((sum, value) => sum + value, 0) / state.reactionTimes.length
      : null;
    const avgWaveMs = state.waveTimes.length
      ? state.waveTimes.reduce((sum, value) => sum + value, 0) / state.waveTimes.length
      : null;

    const modeDef = getModeDefinition();
    const modeValue = getModeStatValue(modeDef, {
      accuracyPct,
      avgReactionMs,
      avgWaveMs,
      elapsedMs,
    });

    return {
      mode: state.mode,
      label: modeDef.label,
      score: Math.round(state.score),
      accuracyPct: round(accuracyPct, 1),
      hits: state.hits,
      misses: state.misses + state.falseStarts,
      falseStarts: state.falseStarts,
      bestCombo: state.bestCombo,
      avgReactionMs: avgReactionMs ? round(avgReactionMs, 0) : null,
      avgWaveMs: avgWaveMs ? round(avgWaveMs, 0) : null,
      trackingPct: elapsedMs > 0 ? round((state.trackingOnTime / elapsedMs) * 100, 1) : 0,
      decisionNet: state.decisionNet,
      decisionCorrect: state.decisionCorrect,
      decisionWrong: state.decisionWrong,
      perfectTimingPct: state.timingAttempts > 0 ? round((state.perfectTiming / state.timingAttempts) * 100, 1) : 0,
      microAccuracyPct: state.hits > 0 ? round((state.microHits / state.hits) * 100, 1) : 0,
      teleportsRecovered: state.teleportsRecovered,
      modeValue,
    };
  }

  function getModeStatValue(modeDef, summary) {
    switch (modeDef.modeStatKey) {
      case 'avgReactionMs':
        return summary.avgReactionMs;
      case 'avgHitMs':
        return summary.avgReactionMs;
      case 'microAccuracyPct':
        return summary.microAccuracyPct;
      case 'avgWaveMs':
        return summary.avgWaveMs;
      case 'trackingPct':
        return summary.trackingPct;
      case 'teleportsRecovered':
        return summary.teleportsRecovered;
      case 'perfectTimingPct':
        return summary.perfectTimingPct;
      case 'decisionNet':
        return summary.decisionNet;
      default:
        return null;
    }
  }

  function updateBests(summary) {
    const current = state.bests[summary.mode] || {};
    const next = { ...current };

    if (!Number.isFinite(next.bestScore) || summary.score > next.bestScore) {
      next.bestScore = summary.score;
    }
    if (!Number.isFinite(next.bestAccuracy) || summary.accuracyPct > next.bestAccuracy) {
      next.bestAccuracy = summary.accuracyPct;
    }
    if (!Number.isFinite(next.bestCombo) || summary.bestCombo > next.bestCombo) {
      next.bestCombo = summary.bestCombo;
    }
    if (summary.avgReactionMs !== null && (!Number.isFinite(next.bestReaction) || summary.avgReactionMs < next.bestReaction)) {
      next.bestReaction = summary.avgReactionMs;
    }
    if (summary.avgWaveMs !== null && (!Number.isFinite(next.bestWave) || summary.avgWaveMs < next.bestWave)) {
      next.bestWave = summary.avgWaveMs;
    }
    if (!Number.isFinite(next.bestTracking) || summary.trackingPct > next.bestTracking) {
      next.bestTracking = summary.trackingPct;
    }
    if (!Number.isFinite(next.bestDecision) || summary.decisionNet > next.bestDecision) {
      next.bestDecision = summary.decisionNet;
    }
    if (!Number.isFinite(next.bestTiming) || summary.perfectTimingPct > next.bestTiming) {
      next.bestTiming = summary.perfectTimingPct;
    }
    if (!Number.isFinite(next.bestTeleports) || summary.teleportsRecovered > next.bestTeleports) {
      next.bestTeleports = summary.teleportsRecovered;
    }

    next.updatedAt = new Date().toISOString();
    state.bests[summary.mode] = next;
  }

  function renderBests() {
    const entries = Object.entries(MODE_DEFS).map(([mode, definition]) => {
      const best = state.bests[mode] || {};
      const score = Number.isFinite(best.bestScore) ? best.bestScore : 0;
      return `
        <div class="bests-item">
          <div>
            <span class="bests-label">${definition.label}</span>
            <strong>${score}</strong>
          </div>
          <div style="text-align:right; color: var(--muted); font-size: 0.88rem;">
            ${renderBestDetail(mode, best)}
          </div>
        </div>
      `;
    });

    dom.bestsList.innerHTML = entries.join('');
    if (dom.heroBest) {
      dom.heroBest.textContent = String(getCurrentBest());
    }
  }

  function renderBestDetail(mode, best) {
    const definition = getModeDefinition(mode);
    const primary = definition.modeStatKey;
    if (primary === 'trackingPct') {
      return `${Number.isFinite(best.bestTracking) ? `${round(best.bestTracking, 1)}%` : '--'}`;
    }
    if (primary === 'decisionNet') {
      return `${Number.isFinite(best.bestDecision) ? best.bestDecision : '--'}`;
    }
    if (primary === 'perfectTimingPct') {
      return `${Number.isFinite(best.bestTiming) ? `${round(best.bestTiming, 1)}%` : '--'}`;
    }
    if (primary === 'teleportsRecovered') {
      return `${Number.isFinite(best.bestTeleports) ? best.bestTeleports : '--'}`;
    }
    if (primary === 'avgReactionMs' || primary === 'avgHitMs') {
      return `${Number.isFinite(best.bestReaction) ? `${Math.round(best.bestReaction)}ms` : '--'}`;
    }
    if (primary === 'avgWaveMs') {
      return `${Number.isFinite(best.bestWave) ? `${Math.round(best.bestWave)}ms` : '--'}`;
    }
    return `Accuracy ${Number.isFinite(best.bestAccuracy) ? `${round(best.bestAccuracy, 1)}%` : '--'}`;
  }

  function updateHUD() {
    const elapsedMs = state.running
      ? Math.max(0, state.paused ? state.runEndsAt - state.pauseStartedAt : state.runEndsAt - performance.now())
      : state.settings.duration * 1000;
    const accuracyPct = state.accuracySamples > 0 ? (state.totalAccuracy / state.accuracySamples) * 100 : 100;
    const modeDef = getModeDefinition();
    const summary = buildSummary();

    dom.scoreValue.textContent = String(Math.round(state.score));
    dom.accuracyValue.textContent = formatPercent(accuracyPct);
    dom.comboValue.textContent = String(state.combo);
    dom.timeValue.textContent = `${Math.max(0, elapsedMs / 1000).toFixed(2)}s`;
    dom.hitsValue.textContent = String(state.hits);
    dom.missesValue.textContent = String(state.misses + state.falseStarts);
    dom.streakValue.textContent = String(state.bestCombo);
    dom.reactionValue.textContent = summary.avgReactionMs !== null ? `${Math.round(summary.avgReactionMs)}ms` : '--';
  }

  function formatModeStat(modeDef, summary) {
    const value = getModeStatValue(modeDef, summary);
    switch (modeDef.modeStatKey) {
      case 'avgReactionMs':
      case 'avgHitMs':
      case 'avgWaveMs':
        return value === null ? '--' : `${Math.round(value)}ms`;
      case 'trackingPct':
      case 'microAccuracyPct':
      case 'perfectTimingPct':
        return value === null ? '--' : `${round(value, 1)}%`;
      case 'teleportsRecovered':
      case 'decisionNet':
        return value === null ? '--' : String(value);
      default:
        return '--';
    }
  }

  function renderResults(summary) {
    const tier = classifyScore(summary);
    dom.resultsPanel.hidden = false;
    dom.resultTier.textContent = `Tier: ${tier}`;
    dom.resultScore.textContent = String(summary.score);
    dom.resultReaction.textContent = summary.avgReactionMs !== null ? `${Math.round(summary.avgReactionMs)}ms` : '--';
    dom.resultAccuracy.textContent = `${summary.accuracyPct.toFixed(1)}%`;
    dom.resultStreak.textContent = String(summary.bestCombo);

    const details = [
      { label: 'Mode', value: summary.label },
      { label: 'Hits', value: String(summary.hits) },
      { label: 'Misses', value: String(summary.misses) },
      { label: 'False starts', value: String(summary.falseStarts) },
      { label: 'Mode stat', value: formatResultStat(summary) },
    ];

    dom.resultDetails.innerHTML = details
      .map((entry) => `
        <div class="result-detail">
          <span>${entry.label}</span>
          <strong>${entry.value}</strong>
        </div>
      `)
      .join('');
  }

  function formatResultStat(summary) {
    const modeDef = getModeDefinition(summary.mode);
    const value = getModeStatValue(modeDef, summary);
    if (value === null || typeof value === 'undefined') return '--';
    if (modeDef.modeStatUnit === 'ms') return `${Math.round(value)}ms`;
    if (modeDef.modeStatUnit === '%') return `${round(value, 1)}%`;
    if (modeDef.modeStatUnit === 'hits') return String(value);
    if (modeDef.modeStatUnit === 'net') return String(value);
    return String(value);
  }

  function classifyScore(summary) {
    if (summary.score >= 1600) return 'Insane';
    if (summary.score >= 1100) return 'Elite';
    if (summary.score >= 700) return 'Strong';
    if (summary.score >= 350) return 'Solid';
    return 'Warm-up';
  }

  function hitTarget(target, event) {
    const rect = target.el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const radius = rect.width / 2;
    const accuracy = clamp(1 - distance / Math.max(1, radius), 0, 1);
    return accuracy;
  }

  function registerSuccess(target, accuracy, speedFactor, reactionMs) {
    state.hits += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.totalAccuracy += accuracy;
    state.accuracySamples += 1;
    state.reactionTimes.push(reactionMs);

    const modeDef = getModeDefinition();
    const base = modeDef === MODE_DEFS.decision ? 110 : modeDef === MODE_DEFS.precision ? 130 : modeDef === MODE_DEFS.timing ? 120 : 100;
    const sizeBonus = clamp(120 / Math.max(18, target.size), 0.7, 1.8);
    const accuracyMult = 0.55 + accuracy * 0.45;
    const speedMult = 0.7 + clamp(speedFactor, 0, 1.5) * 0.6;
    const comboMult = 1 + Math.min(1.5, state.combo * 0.08);
    const points = Math.round(base * accuracyMult * speedMult * comboMult * sizeBonus);
    state.score += points;

    if (target.mode === 'precision' || target.mode === 'flick') {
      if (target.mode === 'precision') {
        state.microHits += accuracy >= 0.72 ? 1 : 0;
      }
    }

    if (target.mode === 'reaction') {
      playTone({ frequency: 740, duration: 0.08, gain: 0.055, type: 'triangle' });
    } else if (target.mode === 'decision' && target.positive) {
      playTone({ frequency: 690, duration: 0.08, gain: 0.05, type: 'square' });
    } else {
      playTone({ frequency: 620, duration: 0.08, gain: 0.05, type: 'sine' });
    }

    flashStage('stage-hit-flash');
    target.el.classList.add('hit');
    setTimeout(() => {
      removeTarget(target);
    }, 120);
  }

  function registerMiss(reason = 'miss') {
    state.misses += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 18);
    flashStage('stage-shake');
    playTone({ frequency: reason === 'false-start' ? 180 : 240, duration: 0.1, gain: 0.04, type: 'sawtooth' });
  }

  function flashStage(className) {
    dom.arenaStage.classList.remove('stage-hit-flash', 'stage-shake');
    void dom.arenaStage.offsetWidth;
    dom.arenaStage.classList.add(className);
    window.setTimeout(() => {
      dom.arenaStage.classList.remove(className);
    }, 220);
  }

  function handleTargetHit(target, event) {
    if (!state.running || state.paused || !target || target.mode !== state.mode) return;
    const mode = state.mode;
    const accuracy = hitTarget(target, event);
    const reactionMs = performance.now() - target.bornAt;

    if (mode === 'reaction') {
      const speedFactor = clamp(1.45 - reactionMs / Math.max(240, 1500 / state.settings.spawnSpeed), 0.35, 1.45);
      registerSuccess(target, accuracy, speedFactor, reactionMs);
      state.stageTargetCleared = true;
      state.lastModeStat = reactionMs;
      queueReactionSpawn();
      updateHUD();
      return;
    }

    if (mode === 'flick' || mode === 'precision') {
      const speedFactor = clamp(1.45 - reactionMs / Math.max(250, target.expiresAt - target.bornAt), 0.45, 1.45);
      registerSuccess(target, accuracy, speedFactor, reactionMs);
      if (mode === 'precision') {
        state.microHits += accuracy >= 0.82 ? 1 : 0;
      }
      spawnFlickTarget(mode);
      updateHUD();
      return;
    }

    if (mode === 'switching') {
      const waveTime = performance.now() - state.pendingWaveStartedAt;
      const speedFactor = clamp(1.45 - waveTime / Math.max(300, 2200 / state.settings.spawnSpeed), 0.4, 1.45);
      registerSuccess(target, accuracy, speedFactor, reactionMs);
      const wave = state.activeTargets.filter((entry) => entry.mode === 'switching');
      if (wave.length === 0) {
        state.waveTimes.push(waveTime);
        state.score += 60 + Math.round(Math.max(0, 1500 - waveTime) / 8);
        setTimeout(() => {
          if (state.running && state.mode === 'switching') spawnSwitchWave();
        }, 220);
      }
      updateHUD();
      return;
    }

    if (mode === 'decision') {
      const speedFactor = clamp(1.35 - reactionMs / Math.max(350, 2200 / state.settings.spawnSpeed), 0.35, 1.35);
      if (target.positive) {
        state.decisionCorrect += 1;
        state.decisionNet += 1;
        registerSuccess(target, accuracy, speedFactor, reactionMs);
      } else {
        state.decisionWrong += 1;
        state.decisionNet -= 1;
        registerMiss('decision trap');
        state.score = Math.max(0, state.score - 45);
        target.el.classList.add('hit');
        setTimeout(() => removeTarget(target), 120);
      }
      if (state.activeTargets.filter((entry) => entry.mode === 'decision').length === 0) {
        state.waveTimes.push(performance.now() - state.pendingWaveStartedAt);
        setTimeout(() => {
          if (state.running && state.mode === 'decision') spawnDecisionWave();
        }, 200);
      }
      updateHUD();
      return;
    }

    if (mode === 'timing') {
      state.timingAttempts += 1;
      const cycle = 1600 / Math.max(0.75, state.settings.spawnSpeed);
      const timeIntoCycle = (performance.now() - target.bornAt) % cycle;
      const normalized = Math.abs(timeIntoCycle / cycle - 0.5) * 2;
      const perfect = normalized < 0.16;
      if (perfect) {
        state.perfectTiming += 1;
        registerSuccess(target, 1 - normalized, clamp(1.3 - normalized, 0.5, 1.3), reactionMs);
        spawnTimingTarget();
      } else {
        registerMiss('timing miss');
        state.score = Math.max(0, state.score - 12);
      }
      updateHUD();
    }
  }

  function handleFalseStart() {
    if (!state.running || state.paused || state.mode !== 'reaction') return;
    state.falseStarts += 1;
    registerMiss('false-start');
    queueReactionSpawn();
    updateHUD();
  }

  function updateTrackingTarget(target, deltaMs, now) {
    const baseSpeed = state.settings.movementSpeed * (target.mode === 'dynamic' ? 1.6 : 1);
    const speed = baseSpeed * (deltaMs / 16.67);
    if (target.mode === 'dynamic') {
      if (now >= target.teleportAt) {
        const point = centerWeightedPoint(0.55);
        target.x = point.x;
        target.y = point.y;
        target.teleportAt = now + randomBetween(1150, 2400) / Math.max(0.8, state.settings.spawnSpeed);
        target.el.classList.add('teleporting');
        window.setTimeout(() => target.el.classList.remove('teleporting'), 180);
        state.teleportsRecovered += 0;
        state.trackingTeleportAt = now;
      }
    }

    target.x += target.vx * speed;
    target.y += target.vy * speed;

    const margin = getStagePadding() + target.size / 2;
    if (target.x < margin || target.x > state.stage.width - margin) {
      target.vx *= -1;
      target.x = clamp(target.x, margin, state.stage.width - margin);
    }
    if (target.y < margin || target.y > state.stage.height - margin) {
      target.vy *= -1;
      target.y = clamp(target.y, margin, state.stage.height - margin);
    }

    target.scale = 1 + Math.sin((now + target.pulseSeed) / 260) * 0.02;
    positionTarget(target);
  }

  function updateTimingTarget(target, now) {
    const cycle = 1600 / Math.max(0.75, state.settings.spawnSpeed);
    const progress = ((now - target.bornAt) % cycle) / cycle;
    const pulse = 0.62 + Math.sin((progress * Math.PI * 2) - Math.PI / 2) * 0.44;
    target.scale = pulse;
    target.el.style.setProperty('--pulse', String(pulse));
    positionTarget(target);
  }

  function updateTrackingScore(deltaMs, now) {
    const target = state.activeTargets.find((entry) => entry.mode === 'tracking' || entry.mode === 'dynamic');
    if (!target) return;

    const dx = state.pointer.x - target.x;
    const dy = state.pointer.y - target.y;
    const distance = Math.hypot(dx, dy);
    const radius = target.size / 2;
    const onTarget = distance <= radius;

    state.trackingTotalTime += deltaMs;
    if (onTarget) {
      state.trackingOnTime += deltaMs;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const closeness = clamp(1 - distance / Math.max(1, radius), 0, 1);
      const points = deltaMs * 0.22 * (0.7 + closeness * 0.3) * (1 + Math.min(1.4, state.combo * 0.012));
      state.score += points;
      if (state.mode === 'dynamic' && state.trackingTeleportAt && now - state.trackingTeleportAt < 450) {
        state.teleportsRecovered += 1;
        state.trackingTeleportAt = 0;
      }
      if (Math.floor(state.trackingOnTime / 260) > Math.floor((state.trackingOnTime - deltaMs) / 260)) {
        state.accuracySamples += 1;
        state.totalAccuracy += closeness;
      }
    } else {
      state.combo = 0;
    }
  }

  function updateTargets(now, deltaMs) {
    if (!state.running) return;

    const mode = state.mode;
    if (mode === 'reaction') {
      if (state.phase === 'waiting' && now >= state.phaseEndsAt) {
        placeReactionTarget();
      }
      const target = state.activeTargets[0];
      if (target && now >= target.expiresAt) {
        registerMiss('reaction timeout');
        queueReactionSpawn();
      }
    }

    if (mode === 'flick' || mode === 'precision') {
      const target = state.activeTargets[0];
      if (target && now >= target.expiresAt) {
        registerMiss('target expired');
        spawnFlickTarget(mode);
      }
    }

    if (mode === 'switching' || mode === 'decision') {
      const expiredTargets = state.activeTargets.filter((target) => now >= target.expiresAt);
      expiredTargets.forEach((target) => {
        removeTarget(target);
        registerMiss(mode === 'decision' ? 'wrong priority' : 'expired target');
      });
      if (!state.activeTargets.length) {
        const waveDuration = now - state.pendingWaveStartedAt;
        state.waveTimes.push(waveDuration);
        if (mode === 'switching') {
          spawnSwitchWave();
        } else {
          spawnDecisionWave();
        }
      }
    }

    if (mode === 'tracking' || mode === 'dynamic') {
      const target = state.activeTargets[0];
      if (target) updateTrackingTarget(target, deltaMs, now);
      updateTrackingScore(deltaMs, now);
    }

    if (mode === 'timing') {
      const target = state.activeTargets[0];
      if (target) {
        updateTimingTarget(target, now);
        if (now >= target.expiresAt) {
          registerMiss('timing timeout');
          spawnTimingTarget();
        }
      }
    }
  }

  function tick(now) {
    const deltaMs = now - state.lastFrameAt;
    state.lastFrameAt = now;

    if (state.running && !state.paused) {
      const timeLeft = state.runEndsAt - now;
      if (timeLeft <= 0) {
        stopRun({ showResults: true, announce: 'Run complete' });
      } else {
        updateTargets(now, deltaMs);
      }
    }

    updateHUD();
    requestAnimationFrame(tick);
  }

  function handleStagePointerDown(event) {
    if (!state.running || state.paused) return;
    const clickedTarget = event.target.closest('.target');
    if (clickedTarget) return;

    if (state.mode === 'reaction') {
      handleFalseStart();
      return;
    }

    if (state.mode === 'flick' || state.mode === 'precision' || state.mode === 'switching' || state.mode === 'timing' || state.mode === 'decision') {
      registerMiss('empty click');
      updateHUD();
      return;
    }
  }

  function updatePointer(event) {
    const rect = dom.arenaStage.getBoundingClientRect();
    state.pointer.x = event.clientX - rect.left;
    state.pointer.y = event.clientY - rect.top;
    state.pointer.inside = state.pointer.x >= 0 && state.pointer.y >= 0 && state.pointer.x <= rect.width && state.pointer.y <= rect.height;
  }

  function resetRun() {
    state.running = false;
    state.ended = false;
    state.paused = false;
    state.pauseStartedAt = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hits = 0;
    state.misses = 0;
    state.falseStarts = 0;
    state.totalAccuracy = 0;
    state.accuracySamples = 0;
    state.reactionTimes = [];
    state.trackingOnTime = 0;
    state.trackingTotalTime = 0;
    state.decisionNet = 0;
    state.decisionCorrect = 0;
    state.decisionWrong = 0;
    state.perfectTiming = 0;
    state.timingAttempts = 0;
    state.waveTimes = [];
    state.microHits = 0;
    state.teleportsRecovered = 0;
    state.phase = 'idle';
    state.phaseEndsAt = 0;
    state.phaseStartedAt = performance.now();
    state.runStartedAt = 0;
    state.runEndsAt = 0;
    clearTargets();
    dom.resultsPanel.hidden = true;
    setRunState('Ready');
    dom.stageHint.textContent = getModeDefinition().copy;
    syncRunControls();
    updateHUD();
  }

  function wireEvents() {
    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setMode(button.dataset.mode);
        if (state.running) {
          stopRun({ showResults: true, announce: 'Run complete' });
        }
      });
    });

    presetButtons.forEach((button) => {
      button.addEventListener('click', () => setPreset(button.dataset.preset));
    });

    if (dom.settingsBtn && dom.settingsPanel) {
      dom.settingsBtn.addEventListener('click', () => {
        dom.settingsPanel.hidden = !dom.settingsPanel.hidden;
        if (!dom.settingsPanel.hidden && dom.settingsCloseBtn) {
          dom.settingsCloseBtn.focus({ preventScroll: true });
        }
      });
    }

    if (dom.settingsCloseBtn && dom.settingsPanel) {
      dom.settingsCloseBtn.addEventListener('click', () => {
        dom.settingsPanel.hidden = true;
      });
    }

    const handleStartToggle = () => {
      if (!state.running || state.ended) {
        startRun();
        return;
      }
      if (state.paused) {
        resumeRun();
      } else {
        pauseRun();
      }
    };

    dom.startBtn.addEventListener('click', handleStartToggle);
    if (dom.stageStartBtn) {
      dom.stageStartBtn.addEventListener('click', handleStartToggle);
    }

    const handleReplay = () => {
      if (state.running) {
        stopRun({ showResults: false, announce: 'Ready' });
      }
      startRun();
    };

    dom.replayBtn.addEventListener('click', handleReplay);
    if (dom.stageReplayBtn) {
      dom.stageReplayBtn.addEventListener('click', handleReplay);
    }

    dom.quitBtn.addEventListener('click', () => {
      if (state.running) {
        stopRun({ showResults: true, announce: 'Run ended' });
      }
    });

    dom.playAgainBtn.addEventListener('click', () => {
      dom.resultsPanel.hidden = true;
      startRun();
    });

    dom.changeModeBtn.addEventListener('click', () => {
      dom.resultsPanel.hidden = true;
      dom.arenaStage.focus({ preventScroll: true });
    });

    dom.targetSizeInput.addEventListener('input', (event) => {
      updateSetting('targetSize', Number(event.target.value));
    });

    dom.spawnSpeedInput.addEventListener('input', (event) => {
      updateSetting('spawnSpeed', Number(event.target.value));
    });

    dom.movementSpeedInput.addEventListener('input', (event) => {
      updateSetting('movementSpeed', Number(event.target.value));
    });

    dom.durationInput.addEventListener('input', (event) => {
      updateSetting('duration', Number(event.target.value));
    });

    dom.arenaStage.addEventListener('pointerdown', handleStagePointerDown);
    dom.arenaStage.addEventListener('pointermove', updatePointer);
    dom.arenaStage.addEventListener('pointerleave', () => {
      state.pointer.inside = false;
      if (state.mode === 'tracking' || state.mode === 'dynamic') {
        state.combo = 0;
      }
    });
    dom.arenaStage.addEventListener('pointerenter', updatePointer);

    window.addEventListener('resize', measureStage);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => measureStage());
      observer.observe(dom.arenaStage);
    }
  }

  function init() {
    syncSettingsUI();
    renderBests();
    setMode(state.mode, { preserveSelection: false });
    if (loadLastMode()) {
      setMode(loadLastMode());
    }
    renderChallenge();
    resetRun();
    wireEvents();
    measureStage();
    setRunState('Ready');
    requestAnimationFrame(tick);
  }

  function renderChallenge() {
    const challenge = state.challenge;
    dom.challengeTitle.textContent = challenge.title;
    dom.challengeCopy.textContent = challenge.copy;
    dom.challengeBadge.textContent = challenge.dateLabel;
    dom.challengeMeta.innerHTML = `
      <div>
        <span>Mode</span>
        <strong>${getModeDefinition(challenge.mode).label}</strong>
      </div>
      <div>
        <span>Target</span>
        <strong>${challenge.target}</strong>
      </div>
      <div>
        <span>Metric</span>
        <strong>${challenge.metric}</strong>
      </div>
      <div>
        <span>Reset</span>
        <strong>Daily</strong>
      </div>
    `;
  }

  init();
})();
