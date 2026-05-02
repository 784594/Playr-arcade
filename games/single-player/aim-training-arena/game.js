(function () {
  const BESTS_KEY = 'playr.aimTrainingArena.bests.v2';
  const LAST_MODE_KEY = 'playr.aimTrainingArena.lastMode.v2';
  const HOLD_MS = 3000;
  const REACTION_TIMEOUT_MS = 5000;
  const SHOT_TIMEOUT_MS = 3000;
  const TRACKING_DURATION_MS = 30000;
  const PRECISION_DURATION_MS = 60000;
  const TRACKING_DIRECTION_MIN_MS = 2000;
  const TRACKING_DIRECTION_MAX_MS = 4200;
  const TRACKING_NORMAL_SPEED = 132;
  const TRACKING_DYNAMIC_SPEED = 148;
  const REACTION_WAIT_MIN_MS = 5000;
  const REACTION_WAIT_MAX_MS = 10000;
  const FLICK_REPS = 5;
  const REACTION_REPS = 5;
  const TRACKING_RADIUS = 14;
  const PRECISION_TARGET_COUNT = 5;
  const PRECISION_MIN_CENTER_SHOTS = 12;

  const MODE_DEFS = {
    reaction: {
      label: 'Reaction Time',
      group: 'Reaction',
      copy: 'Wait through a random red hold, click on green instantly, and repeat for five reps to measure your average, fastest, and slowest reactions.',
    },
    flick: {
      label: 'Flick Shot',
      group: 'Flicking',
      copy: 'Hold on the orange anchor for 3 seconds, then snap to a full-size 5-ring target. Repeat five times for reaction and accuracy.',
    },
    micro: {
      label: 'Micro Flick',
      group: 'Flicking',
      copy: 'Same anchor-and-fire flow as Flick Shot, but the target is smaller and tighter with a 3-ring micro target.',
    },
    tracking: {
      label: 'Tracking',
      group: 'Tracking',
      copy: 'Choose an axis, hold the orange anchor for 3 seconds, then stay on the moving dot as it changes direction after at least 2 seconds.',
    },
    dynamic: {
      label: 'Dynamic Tracking',
      group: 'Tracking',
      copy: 'Hold the anchor for 3 seconds, then track an orange dot that can move in any direction and switch paths after at least 2 seconds.',
    },
    rapid: {
      label: 'Rapid Fire',
      group: 'Precision',
      copy: 'Hold the orange anchor for 3 seconds, then clear a 60-second board with five small live targets. Score comes from targets shot plus click accuracy.',
    },
    precision: {
      label: 'Precision',
      group: 'Precision',
      copy: 'Hold the orange anchor for 3 seconds, then clear a 60-second board with five small live targets. Score comes from average center accuracy across valid target hits.',
    },
  };

  const dom = {
    startBtn: document.getElementById('startBtn'),
    replayBtn: document.getElementById('replayBtn'),
    heroNote: document.getElementById('heroNote'),
    quitBtn: document.getElementById('quitBtn'),
    modeGroupLabel: document.getElementById('modeGroupLabel'),
    modeCopy: document.getElementById('modeCopy'),
    modeTitle: document.getElementById('modeTitle'),
    runState: document.getElementById('runState'),
    stageHint: document.getElementById('stageHint'),
    arenaStage: document.getElementById('arenaStage'),
    targetLayer: document.getElementById('targetLayer'),
    stageStartPanel: document.getElementById('stageStartPanel'),
    stageStartBtn: document.getElementById('stageStartBtn'),
    stageReplayBtn: document.getElementById('stageReplayBtn'),
    stageStartTitle: document.getElementById('stageStartTitle'),
    stageStartCopy: document.getElementById('stageStartCopy'),
    axisPanel: document.getElementById('axisPanel'),
    hudLabel1: document.getElementById('hudLabel1'),
    hudLabel2: document.getElementById('hudLabel2'),
    hudLabel3: document.getElementById('hudLabel3'),
    hudLabel4: document.getElementById('hudLabel4'),
    hudValue1: document.getElementById('hudValue1'),
    hudValue2: document.getElementById('hudValue2'),
    hudValue3: document.getElementById('hudValue3'),
    hudValue4: document.getElementById('hudValue4'),
    resultsPanel: document.getElementById('resultsPanel'),
    resultsGrid: document.getElementById('resultsGrid'),
    resultTier: document.getElementById('resultTier'),
    resultDetails: document.getElementById('resultDetails'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    changeModeBtn: document.getElementById('changeModeBtn'),
    sessionStats: document.getElementById('sessionStats'),
    bestsList: document.getElementById('bestsList'),
  };

  if (!dom.arenaStage || !dom.targetLayer) return;

  const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
  const axisButtons = Array.from(document.querySelectorAll('[data-axis]'));

  const state = {
    mode: loadLastMode() || 'reaction',
    running: false,
    showAxisPicker: false,
    selectedAxis: 'horizontal',
    pointer: { x: 0, y: 0, inside: false },
    activeElements: [],
    timeoutIds: [],
    rafId: 0,
    loopLastAt: 0,
    stageRect: { width: 0, height: 0 },
    phase: 'idle',
    bests: loadBests(),
    stats: null,
    trackingTarget: null,
    trackingDirectionAt: 0,
    anchorHeldAt: 0,
    holdAction: null,
    currentTarget: null,
    targetTimeoutAt: 0,
    pendingSummary: null,
  };

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors.
    }
  }

  function loadBests() {
    const stored = loadJson(BESTS_KEY, {});
    return stored && typeof stored === 'object' ? stored : {};
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
      // Ignore storage errors.
    }
  }

  function getModeDefinition(mode = state.mode) {
    return MODE_DEFS[mode] || MODE_DEFS.reaction;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function formatMs(value) {
    if (!Number.isFinite(value)) return '--';
    return `${Math.round(value)}ms`;
  }

  function formatSecondsMs(value) {
    if (!Number.isFinite(value)) return '--';
    return `${round(value / 1000, 2)}s`;
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return '0%';
    return `${round(value, 1)}%`;
  }

  function setRunState(text) {
    if (dom.runState) dom.runState.textContent = text;
  }

  function setHint(text, { muted = false } = {}) {
    if (!dom.stageHint) return;
    if (state.running && !state.showAxisPicker) {
      dom.stageHint.textContent = '';
      dom.stageHint.classList.add('is-hidden');
      return;
    }
    dom.stageHint.textContent = text;
    dom.stageHint.classList.toggle('is-hidden', !text);
    dom.stageHint.style.color = muted ? '#a4b4cc' : '#eff6ff';
  }

  function clearTimeouts() {
    state.timeoutIds.forEach((id) => window.clearTimeout(id));
    state.timeoutIds = [];
  }

  function scheduleTimeout(callback, delay) {
    const id = window.setTimeout(() => {
      state.timeoutIds = state.timeoutIds.filter((entry) => entry !== id);
      callback();
    }, delay);
    state.timeoutIds.push(id);
    return id;
  }

  function cancelAnimationLoop() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function clearStageModeClasses() {
    dom.arenaStage.classList.remove('mode-reaction', 'mode-tracking', 'mode-dynamic', 'is-green');
  }

  function destroyActiveElements() {
    state.activeElements.forEach((element) => element.remove());
    state.activeElements = [];
    state.currentTarget = null;
    state.trackingTarget = null;
  }

  function addStageElement(element) {
    state.activeElements.push(element);
    dom.targetLayer.appendChild(element);
    return element;
  }

  function setElementPosition(element, x, y) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  function measureStage() {
    const rect = dom.arenaStage.getBoundingClientRect();
    state.stageRect.width = Math.max(320, rect.width);
    state.stageRect.height = Math.max(320, rect.height);
  }

  function randomStagePoint(margin = 50) {
    const safeX = randomBetween(margin, Math.max(margin + 1, state.stageRect.width - margin));
    const safeY = randomBetween(margin, Math.max(margin + 1, state.stageRect.height - margin));
    return { x: safeX, y: safeY };
  }

  function buildTargetIcon(size, micro = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `target-icon${micro ? ' micro' : ''}`;
    button.style.setProperty('--target-size', `${size}px`);
    return button;
  }

  function buildAnchorDot(className = 'anchor-dot') {
    const dot = document.createElement('div');
    dot.className = className;
    setElementPosition(dot, state.stageRect.width / 2, state.stageRect.height / 2);
    return dot;
  }

  function buildReactionOverlay(text) {
    const overlay = document.createElement('div');
    overlay.className = 'reaction-overlay';
    overlay.textContent = text;
    return overlay;
  }

  function buildPrecisionTarget() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'precision-target';
    return button;
  }

  function pointerDistanceFrom(x, y) {
    return Math.hypot(state.pointer.x - x, state.pointer.y - y);
  }

  function stageClickPosition(event) {
    const rect = dom.arenaStage.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function hideModeDescriptionForRun(hidden) {
    if (!dom.modeCopy) return;
    dom.modeCopy.classList.toggle('is-hidden', hidden);
  }

  function syncRunControls() {
    const running = state.running;
    if (dom.quitBtn) dom.quitBtn.disabled = !running;
    if (dom.startBtn) dom.startBtn.disabled = running;
    if (dom.replayBtn) dom.replayBtn.disabled = running;
    if (dom.stageStartBtn) dom.stageStartBtn.disabled = running;
    if (dom.stageReplayBtn) dom.stageReplayBtn.disabled = running;
    modeButtons.forEach((button) => {
      button.disabled = running;
    });
    if (dom.stageStartPanel) dom.stageStartPanel.hidden = running || state.showAxisPicker;
    if (dom.axisPanel) dom.axisPanel.hidden = !state.showAxisPicker;
  }

  function makeEmptyStats() {
    return {
      mode: state.mode,
      startedAt: performance.now(),
      phaseStartedAt: performance.now(),
      rep: 0,
      reactions: [],
      accuracies: [],
      hits: 0,
      misses: 0,
      clicks: 0,
      falseStarts: 0,
      timeouts: 0,
      onTargetMs: 0,
      trackingTotalMs: 0,
      directionChanges: 0,
      targetsShot: 0,
      targetHitAccuracy: [],
      trackingAxis: state.selectedAxis,
      phaseEndsAt: 0,
      holdProgress: 0,
      greenAt: 0,
      endAt: 0,
      runScore: 0,
      currentDirectionLabel: '--',
    };
  }

  function setMode(mode) {
    if (!MODE_DEFS[mode]) return;
    state.mode = mode;
    saveLastMode(mode);
    const definition = getModeDefinition(mode);
    dom.modeGroupLabel.textContent = definition.group;
    dom.modeTitle.textContent = definition.label;
    dom.modeCopy.textContent = definition.copy;
    dom.stageStartTitle.textContent = definition.label;
    dom.stageStartCopy.textContent = definition.copy;
    dom.heroNote.textContent = 'Pick a mode, then start when you are ready.';
    hideModeDescriptionForRun(false);
    modeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    resetIdleView();
    renderBests();
  }

  function resetIdleView() {
    clearTimeouts();
    cancelAnimationLoop();
    clearStageModeClasses();
    destroyActiveElements();
    state.running = false;
    state.showAxisPicker = false;
    state.phase = 'idle';
    state.holdAction = null;
    state.stats = null;
    state.pendingSummary = null;
    dom.resultsPanel.hidden = true;
    setRunState('Ready');
    setHint('Choose a mode and press Start Run.', { muted: true });
    syncRunControls();
    renderHud();
    renderSessionStats();
  }

  function startRun() {
    if (state.mode === 'tracking' && !state.selectedAxis) {
      state.selectedAxis = 'horizontal';
    }
    clearTimeouts();
    cancelAnimationLoop();
    destroyActiveElements();
    clearStageModeClasses();
    dom.resultsPanel.hidden = true;
    state.running = true;
    state.showAxisPicker = false;
    state.stats = makeEmptyStats();
    hideModeDescriptionForRun(true);
    syncRunControls();

    if (state.mode === 'reaction') {
      startReactionRun();
      return;
    }
    if (state.mode === 'flick' || state.mode === 'micro') {
      startFlickRun();
      return;
    }
    if (state.mode === 'tracking') {
      state.showAxisPicker = true;
      syncRunControls();
      setRunState('Axis select');
      setHint('Choose a lane for tracking before the run starts.', { muted: false });
      return;
    }
    if (state.mode === 'dynamic') {
      startTrackingRun(true);
      return;
    }
    if (state.mode === 'rapid') {
      startRapidFireRun();
      return;
    }
    if (state.mode === 'precision') {
      startPrecisionRun();
    }
  }

  function finishRun() {
    state.running = false;
    state.showAxisPicker = false;
    clearTimeouts();
    cancelAnimationLoop();
    const summary = buildSummary();
    state.pendingSummary = summary;
    updateBests(summary);
    renderSummary(summary);
    hideModeDescriptionForRun(false);
    syncRunControls();
    setRunState('Complete');
    setHint('Run complete. Replay or browse another mode.', { muted: true });
  }

  function buildSummary() {
    const stats = state.stats || makeEmptyStats();
    const validReactions = stats.reactions.filter((value) => Number.isFinite(value));
    const avgReaction = validReactions.length ? average(validReactions) : null;
    const bestReaction = validReactions.length ? Math.min(...validReactions) : null;
    const worstReaction = validReactions.length ? Math.max(...validReactions) : null;
    const accuracyPct = stats.clicks > 0
      ? (stats.hits / stats.clicks) * 100
      : stats.accuracies.length
        ? average(stats.accuracies) * 100
        : 0;
    const onTargetPct = stats.trackingTotalMs > 0 ? (stats.onTargetMs / stats.trackingTotalMs) * 100 : 0;
    let score = 0;
    if (stats.mode === 'reaction') {
      score = avgReaction ? Math.max(0, Math.round(1100 - avgReaction)) : 0;
    } else if (stats.mode === 'flick' || stats.mode === 'micro') {
      score = Math.round((accuracyPct * 8) + Math.max(0, 1200 - (avgReaction || 1200)));
    } else if (stats.mode === 'tracking' || stats.mode === 'dynamic') {
      score = Math.round(stats.onTargetMs + (onTargetPct * 30));
    } else if (stats.mode === 'rapid') {
      score = Math.round((stats.targetsShot * 100) + (accuracyPct * 10));
    } else if (stats.mode === 'precision') {
      const centerAccuracyPct = stats.targetHitAccuracy.length ? average(stats.targetHitAccuracy) * 100 : 0;
      score = Math.round((centerAccuracyPct * 10) + Math.min(300, stats.targetsShot * 8));
    }
    return {
      mode: stats.mode,
      label: getModeDefinition(stats.mode).label,
      avgReaction,
      bestReaction,
      worstReaction,
      accuracyPct,
      onTargetPct,
      hits: stats.hits,
      misses: stats.misses,
      clicks: stats.clicks,
      falseStarts: stats.falseStarts,
      timeouts: stats.timeouts,
      targetsShot: stats.targetsShot,
      centerAccuracyPct: stats.targetHitAccuracy.length ? average(stats.targetHitAccuracy) * 100 : 0,
      centerAccuracySamples: stats.targetHitAccuracy.length,
      onTargetMs: stats.onTargetMs,
      directionChanges: stats.directionChanges,
      axis: stats.trackingAxis,
      score,
    };
  }

  function summaryTier(summary) {
    if (summary.mode === 'reaction') {
      if ((summary.avgReaction || 99999) <= 220) return 'Elite';
      if ((summary.avgReaction || 99999) <= 280) return 'Strong';
      if ((summary.avgReaction || 99999) <= 360) return 'Solid';
      return 'Warm-up';
    }
    if (summary.mode === 'flick' || summary.mode === 'micro') {
      if (summary.accuracyPct >= 90 && (summary.avgReaction || 99999) <= 450) return 'Elite';
      if (summary.accuracyPct >= 82) return 'Strong';
      if (summary.accuracyPct >= 70) return 'Solid';
      return 'Warm-up';
    }
    if (summary.mode === 'tracking' || summary.mode === 'dynamic') {
      if (summary.onTargetPct >= 82) return 'Elite';
      if (summary.onTargetPct >= 68) return 'Strong';
      if (summary.onTargetPct >= 52) return 'Solid';
      return 'Warm-up';
    }
    if (summary.mode === 'rapid') {
      if (summary.targetsShot >= 65 && summary.accuracyPct >= 80) return 'Elite';
      if (summary.targetsShot >= 48) return 'Strong';
      if (summary.targetsShot >= 30) return 'Solid';
      return 'Warm-up';
    }
    if (summary.centerAccuracySamples < PRECISION_MIN_CENTER_SHOTS) return 'Warm-up';
    if (summary.centerAccuracyPct >= 88) return 'Elite';
    if (summary.centerAccuracyPct >= 78) return 'Strong';
    if (summary.centerAccuracyPct >= 68) return 'Solid';
    return 'Warm-up';
  }

  function renderSummary(summary) {
    dom.resultsPanel.hidden = false;
    dom.resultTier.textContent = `Tier: ${summaryTier(summary)}`;
    const cards = [];
    const details = [];

    if (summary.mode === 'reaction') {
      cards.push(['Average', formatMs(summary.avgReaction)], ['Best', formatMs(summary.bestReaction)], ['Worst', formatMs(summary.worstReaction)], ['False starts', String(summary.falseStarts)]);
      details.push(['Timeouts', String(summary.timeouts)], ['Score', String(summary.score)]);
    } else if (summary.mode === 'flick' || summary.mode === 'micro') {
      cards.push(['Accuracy', formatPercent(summary.accuracyPct)], ['Average', formatMs(summary.avgReaction)], ['Best', formatMs(summary.bestReaction)], ['Worst', formatMs(summary.worstReaction)]);
      details.push(['Hits', String(summary.hits)], ['Clicks', String(summary.clicks)], ['Timeouts', String(summary.timeouts)], ['Score', String(summary.score)]);
    } else if (summary.mode === 'tracking' || summary.mode === 'dynamic') {
      cards.push(['On target', formatSecondsMs(summary.onTargetMs)], ['Percent', formatPercent(summary.onTargetPct)], ['Direction changes', String(summary.directionChanges)], ['Score', String(summary.score)]);
      details.push(['Axis', summary.mode === 'tracking' ? (summary.axis || 'horizontal') : 'Free movement']);
    } else if (summary.mode === 'rapid') {
      cards.push(['Targets shot', String(summary.targetsShot)], ['Accuracy', formatPercent(summary.accuracyPct)], ['Clicks', String(summary.clicks)], ['Score', String(summary.score)]);
      details.push(['Misses', String(summary.misses)]);
    } else if (summary.mode === 'precision') {
      cards.push(['Center accuracy', formatPercent(summary.centerAccuracyPct)], ['Valid hits', String(summary.centerAccuracySamples)], ['Targets shot', String(summary.targetsShot)], ['Score', String(summary.score)]);
      details.push(['Minimum hits', String(PRECISION_MIN_CENTER_SHOTS)], ['Misses', String(summary.misses)]);
    }

    dom.resultsGrid.innerHTML = cards.map(([label, value]) => `
      <article class="result-card">
        <span>${label}</span>
        <strong>${value}</strong>
      </article>
    `).join('');

    dom.resultDetails.innerHTML = details.map(([label, value]) => `
      <div class="result-detail">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  function getBestRecordText(record) {
    if (!record) return '--';
    return record.text || '--';
  }

  function updateBests(summary) {
    const current = state.bests[summary.mode] || null;
    let shouldReplace = false;
    let text = '--';

    if (summary.mode === 'reaction') {
      shouldReplace = !current || ((summary.avgReaction || Infinity) < (current.primaryValue || Infinity));
      text = summary.avgReaction ? `Avg ${formatMs(summary.avgReaction)}` : '--';
    } else if (summary.mode === 'flick' || summary.mode === 'micro') {
      shouldReplace = !current || summary.score > (current.primaryValue || 0);
      text = `${formatPercent(summary.accuracyPct)} • Avg ${formatMs(summary.avgReaction)}`;
    } else if (summary.mode === 'tracking' || summary.mode === 'dynamic') {
      shouldReplace = !current || summary.onTargetMs > (current.primaryValue || 0);
      text = `${formatPercent(summary.onTargetPct)} • ${formatSecondsMs(summary.onTargetMs)}`;
    } else if (summary.mode === 'rapid') {
      shouldReplace = !current || summary.targetsShot > (current.primaryValue || 0);
      text = `${summary.targetsShot} shots • ${formatPercent(summary.accuracyPct)}`;
    } else if (summary.mode === 'precision') {
      shouldReplace = summary.centerAccuracySamples >= PRECISION_MIN_CENTER_SHOTS
        && (!current || summary.centerAccuracyPct > (current.primaryValue || 0));
      text = `${formatPercent(summary.centerAccuracyPct)} • ${summary.centerAccuracySamples} hits`;
    }

    if (shouldReplace) {
      state.bests[summary.mode] = {
        primaryValue: summary.mode === 'reaction'
          ? (summary.avgReaction || Infinity)
          : (summary.mode === 'rapid'
            ? summary.targetsShot
            : (summary.mode === 'precision'
              ? summary.centerAccuracyPct
              : summary.mode === 'tracking' || summary.mode === 'dynamic'
                ? summary.onTargetMs
                : summary.score)),
        text,
      };
      saveJson(BESTS_KEY, state.bests);
    }
    renderBests();
  }

  function renderBests() {
    dom.bestsList.innerHTML = Object.keys(MODE_DEFS).map((mode) => `
      <div class="bests-item">
        <span>${getModeDefinition(mode).label}</span>
        <strong>${getBestRecordText(state.bests[mode])}</strong>
      </div>
    `).join('');
  }

  function renderHud() {
    const stats = state.stats;
    if (!stats) {
      dom.hudLabel1.textContent = 'Average';
      dom.hudLabel2.textContent = 'Best';
      dom.hudLabel3.textContent = 'Worst';
      dom.hudLabel4.textContent = 'Rep';
      dom.hudValue1.textContent = '--';
      dom.hudValue2.textContent = '--';
      dom.hudValue3.textContent = '--';
      dom.hudValue4.textContent = '0 / 5';
      return;
    }

    const reactions = stats.reactions.filter((value) => Number.isFinite(value));
    const avgReaction = reactions.length ? average(reactions) : null;
    const bestReaction = reactions.length ? Math.min(...reactions) : null;
    const worstReaction = reactions.length ? Math.max(...reactions) : null;

    if (stats.mode === 'reaction') {
      dom.hudLabel1.textContent = 'Average';
      dom.hudLabel2.textContent = 'Best';
      dom.hudLabel3.textContent = 'Worst';
      dom.hudLabel4.textContent = 'Rep';
      dom.hudValue1.textContent = formatMs(avgReaction);
      dom.hudValue2.textContent = formatMs(bestReaction);
      dom.hudValue3.textContent = formatMs(worstReaction);
      dom.hudValue4.textContent = `${stats.rep} / ${REACTION_REPS}`;
      return;
    }

    if (stats.mode === 'flick' || stats.mode === 'micro') {
      const accuracyPct = stats.accuracies.length ? average(stats.accuracies) * 100 : 0;
      dom.hudLabel1.textContent = 'Accuracy';
      dom.hudLabel2.textContent = 'Average';
      dom.hudLabel3.textContent = 'Best';
      dom.hudLabel4.textContent = 'Worst';
      dom.hudValue1.textContent = formatPercent(accuracyPct);
      dom.hudValue2.textContent = formatMs(avgReaction);
      dom.hudValue3.textContent = formatMs(bestReaction);
      dom.hudValue4.textContent = formatMs(worstReaction);
      return;
    }

    if (stats.mode === 'tracking' || stats.mode === 'dynamic') {
      const pct = stats.trackingTotalMs > 0 ? (stats.onTargetMs / stats.trackingTotalMs) * 100 : 0;
      const timeLeft = Math.max(0, stats.endAt - performance.now());
      dom.hudLabel1.textContent = 'On Target';
      dom.hudLabel2.textContent = 'Percent';
      dom.hudLabel3.textContent = 'Direction';
      dom.hudLabel4.textContent = 'Time Left';
      dom.hudValue1.textContent = formatSecondsMs(stats.onTargetMs);
      dom.hudValue2.textContent = formatPercent(pct);
      dom.hudValue3.textContent = stats.currentDirectionLabel || '--';
      dom.hudValue4.textContent = `${round(timeLeft / 1000, 1)}s`;
      return;
    }

    if (stats.mode === 'rapid') {
      const accuracyPct = stats.clicks > 0 ? (stats.hits / stats.clicks) * 100 : 100;
      const timeLeft = Math.max(0, stats.endAt - performance.now());
      dom.hudLabel1.textContent = 'Targets';
      dom.hudLabel2.textContent = 'Accuracy';
      dom.hudLabel3.textContent = 'Clicks';
      dom.hudLabel4.textContent = 'Time Left';
      dom.hudValue1.textContent = String(stats.targetsShot);
      dom.hudValue2.textContent = formatPercent(accuracyPct);
      dom.hudValue3.textContent = String(stats.clicks);
      dom.hudValue4.textContent = `${round(timeLeft / 1000, 1)}s`;
      return;
    }

    if (stats.mode === 'precision') {
      const centerAccuracyPct = stats.targetHitAccuracy.length ? average(stats.targetHitAccuracy) * 100 : 0;
      const timeLeft = Math.max(0, stats.endAt - performance.now());
      dom.hudLabel1.textContent = 'Center Accuracy';
      dom.hudLabel2.textContent = 'Valid Hits';
      dom.hudLabel3.textContent = 'Targets';
      dom.hudLabel4.textContent = 'Time Left';
      dom.hudValue1.textContent = stats.targetHitAccuracy.length ? formatPercent(centerAccuracyPct) : '--';
      dom.hudValue2.textContent = String(stats.targetHitAccuracy.length);
      dom.hudValue3.textContent = String(stats.targetsShot);
      dom.hudValue4.textContent = `${round(timeLeft / 1000, 1)}s`;
    }
  }

  function renderSessionStats() {
    const stats = state.stats;
    if (!stats) {
      dom.sessionStats.innerHTML = `
        <div class="session-row"><span>Status</span><strong>Idle</strong></div>
        <div class="session-row"><span>Mode</span><strong>${getModeDefinition().label}</strong></div>
      `;
      return;
    }

    const rows = [];
    if (stats.mode === 'reaction') {
      rows.push(['Valid reps', `${stats.reactions.filter((value) => Number.isFinite(value)).length} / ${REACTION_REPS}`]);
      rows.push(['False starts', String(stats.falseStarts)]);
      rows.push(['Timeouts', String(stats.timeouts)]);
      rows.push(['Phase', state.phase]);
    } else if (stats.mode === 'flick' || stats.mode === 'micro') {
      rows.push(['Reps', `${stats.rep} / ${FLICK_REPS}`]);
      rows.push(['Hits', String(stats.hits)]);
      rows.push(['Clicks', String(stats.clicks)]);
      rows.push(['Timeouts', String(stats.timeouts)]);
    } else if (stats.mode === 'tracking' || stats.mode === 'dynamic') {
      rows.push(['Axis', stats.mode === 'tracking' ? (stats.trackingAxis || 'horizontal') : 'Free movement']);
      rows.push(['On target', formatSecondsMs(stats.onTargetMs)]);
      rows.push(['Direction changes', String(stats.directionChanges)]);
      rows.push(['Phase', state.phase]);
    } else if (stats.mode === 'rapid') {
      rows.push(['Targets shot', String(stats.targetsShot)]);
      rows.push(['Hits', String(stats.hits)]);
      rows.push(['Clicks', String(stats.clicks)]);
      rows.push(['Misses', String(stats.misses)]);
    } else if (stats.mode === 'precision') {
      rows.push(['Targets shot', String(stats.targetsShot)]);
      rows.push(['Valid hits', String(stats.targetHitAccuracy.length)]);
      rows.push(['Center accuracy', stats.targetHitAccuracy.length ? formatPercent(average(stats.targetHitAccuracy) * 100) : '--']);
      rows.push(['Misses', String(stats.misses)]);
    }

    dom.sessionStats.innerHTML = rows.map(([label, value]) => `
      <div class="session-row">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  function startReactionRun() {
    clearTimeouts();
    state.stats.rep = 0;
    state.holdAction = 'reaction';
    clearStageModeClasses();
    dom.arenaStage.classList.add('mode-reaction');
    startAnchorHoldPhase();
  }

  function queueReactionRep(isFirst = false) {
    clearTimeouts();
    destroyActiveElements();
    clearStageModeClasses();
    dom.arenaStage.classList.add('mode-reaction');
    state.phase = 'reaction-wait';
    state.stats.phaseStartedAt = performance.now();
    const overlay = addStageElement(buildReactionOverlay('WAIT'));
    state.currentTarget = overlay;
    setRunState(`Red hold ${state.stats.rep + 1}/${REACTION_REPS}`);
    setHint('Wait through the red hold. Clicking early restarts the rep.', { muted: false });
    renderHud();
    renderSessionStats();
    const delay = randomBetween(REACTION_WAIT_MIN_MS, REACTION_WAIT_MAX_MS);
    state.stats.phaseEndsAt = performance.now() + delay;
    scheduleTimeout(() => {
      if (!state.running || state.mode !== 'reaction') return;
      startReactionGreen();
    }, delay);
  }

  function startReactionGreen() {
    clearTimeouts();
    clearStageModeClasses();
    dom.arenaStage.classList.add('mode-reaction', 'is-green');
    state.phase = 'reaction-green';
    state.stats.greenAt = performance.now();
    if (state.currentTarget) state.currentTarget.textContent = 'CLICK';
    setRunState(`Green ${state.stats.rep + 1}/${REACTION_REPS}`);
    setHint('Click as soon as the panel turns green.', { muted: false });
    renderSessionStats();
    scheduleTimeout(() => {
      if (!state.running || state.phase !== 'reaction-green') return;
      state.stats.timeouts += 1;
      state.stats.rep += 1;
      setHint('Timed out. Moving to the next rep.', { muted: false });
      if (state.stats.rep >= REACTION_REPS) {
        finishRun();
      } else {
        scheduleTimeout(() => queueReactionRep(), 350);
      }
    }, REACTION_TIMEOUT_MS);
  }

  function recordReactionClick() {
    if (!state.running || state.phase !== 'reaction-green') return;
    clearTimeouts();
    const reaction = performance.now() - state.stats.greenAt;
    state.stats.reactions.push(reaction);
    state.stats.rep += 1;
    setRunState(`Rep ${state.stats.rep}/${REACTION_REPS}`);
    setHint(`Reaction recorded: ${formatMs(reaction)}.`, { muted: false });
    if (state.currentTarget) {
      state.currentTarget.textContent = 'GOOD';
      state.currentTarget.classList.add('target-hit');
    }
    renderHud();
    renderSessionStats();
    if (state.stats.rep >= REACTION_REPS) {
      scheduleTimeout(() => finishRun(), 200);
    } else {
      scheduleTimeout(() => queueReactionRep(), 350);
    }
  }

  function handleReactionFalseStart() {
    if (!state.running || state.phase !== 'reaction-wait') return;
    clearTimeouts();
    state.stats.falseStarts += 1;
    setHint('Too early. Restarting the rep.', { muted: false });
    queueReactionRep();
  }

  function startFlickRun() {
    state.stats.rep = 0;
    state.holdAction = 'shot';
    startAnchorHoldPhase();
  }

  function startAnchorHoldPhase() {
    destroyActiveElements();
    state.phase = 'anchor-hold';
    state.anchorHeldAt = 0;
    const anchor = addStageElement(buildAnchorDot());
    state.currentTarget = anchor;
    const holdLabel = state.holdAction === 'reaction'
      ? 'Arm hold'
      : state.holdAction === 'tracking'
        ? 'Anchor hold'
        : state.holdAction === 'rapid' || state.holdAction === 'precision'
          ? 'Ready hold'
          : `Hold ${state.stats.rep + 1}/${FLICK_REPS}`;
    setRunState(holdLabel);
    setHint('Hold your cursor on the orange dot for 3 seconds to begin.', { muted: false });
    renderHud();
    renderSessionStats();
    startLoop();
  }

  function beginShotRep() {
    destroyActiveElements();
    state.phase = 'shot-active';
    const size = state.mode === 'micro' ? 42 : 76;
    const target = buildTargetIcon(size, state.mode === 'micro');
    const point = randomStagePoint(size);
    setElementPosition(target, point.x, point.y);
    addStageElement(target);
    state.currentTarget = target;
    state.stats.phaseStartedAt = performance.now();
    state.targetTimeoutAt = performance.now() + SHOT_TIMEOUT_MS;
    setRunState(`Target ${state.stats.rep + 1}/${FLICK_REPS}`);
    setHint('Snap to the target before the timeout.', { muted: false });
    renderHud();
    renderSessionStats();
  }

  function handleShotHit(event) {
    if (!state.running || state.phase !== 'shot-active' || !state.currentTarget) return;
    const rect = state.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const accuracy = clamp(1 - distance / Math.max(1, rect.width / 2), 0, 1);
    const reaction = performance.now() - state.stats.phaseStartedAt;
    state.stats.clicks += 1;
    state.stats.hits += 1;
    state.stats.reactions.push(reaction);
    state.stats.accuracies.push(accuracy);
    state.stats.rep += 1;
    state.currentTarget.classList.add('target-hit');
    setHint(`Hit: ${formatMs(reaction)} • ${formatPercent(accuracy * 100)} accuracy.`, { muted: false });
    renderHud();
    renderSessionStats();
    if (state.stats.rep >= FLICK_REPS) {
      scheduleTimeout(() => finishRun(), 200);
    } else {
      scheduleTimeout(() => startAnchorHoldPhase(), 240);
    }
  }

  function handleShotTimeout() {
    if (!state.running || state.phase !== 'shot-active') return;
    state.stats.timeouts += 1;
    state.stats.misses += 1;
    state.stats.accuracies.push(0);
    state.stats.rep += 1;
    setHint('Target timed out. Resetting to the anchor.', { muted: false });
    renderHud();
    renderSessionStats();
    if (state.stats.rep >= FLICK_REPS) {
      finishRun();
    } else {
      startAnchorHoldPhase();
    }
  }

  function startTrackingRun(isDynamic) {
    state.mode = isDynamic ? 'dynamic' : 'tracking';
    state.stats.trackingAxis = isDynamic ? 'dynamic' : state.selectedAxis;
    state.holdAction = 'tracking';
    startAnchorHoldPhase();
  }

  function beginTrackingMovement() {
    destroyActiveElements();
    state.phase = 'tracking-active';
    clearStageModeClasses();
    dom.arenaStage.classList.add(state.mode === 'dynamic' ? 'mode-dynamic' : 'mode-tracking');
    const dot = buildAnchorDot('tracking-dot');
    addStageElement(dot);
    state.trackingTarget = {
      el: dot,
      x: state.stageRect.width / 2,
      y: state.stageRect.height / 2,
      vx: 0,
      vy: 0,
    };
    state.stats.endAt = performance.now() + TRACKING_DURATION_MS;
    state.loopLastAt = performance.now();
    state.stats.currentDirectionLabel = '--';
    randomizeTrackingDirection(true);
    setRunState('Tracking live');
    setHint('Keep your cursor on the moving orange dot.', { muted: false });
    startLoop();
  }

  function randomizeTrackingDirection(initial = false) {
    if (!state.trackingTarget || !state.stats) return;
    const speed = state.mode === 'dynamic' ? TRACKING_DYNAMIC_SPEED : TRACKING_NORMAL_SPEED;
    if (state.mode === 'tracking') {
      const sign = Math.random() < 0.5 ? -1 : 1;
      if (state.stats.trackingAxis === 'vertical') {
        state.trackingTarget.vx = 0;
        state.trackingTarget.vy = sign * speed;
        state.stats.currentDirectionLabel = sign > 0 ? 'Down' : 'Up';
      } else {
        state.trackingTarget.vx = sign * speed;
        state.trackingTarget.vy = 0;
        state.stats.currentDirectionLabel = sign > 0 ? 'Right' : 'Left';
      }
    } else {
      const angle = randomBetween(0, Math.PI * 2);
      state.trackingTarget.vx = Math.cos(angle) * speed;
      state.trackingTarget.vy = Math.sin(angle) * speed;
      state.stats.currentDirectionLabel = `${Math.round((angle * 180) / Math.PI)}°`;
    }
    if (!initial) {
      state.stats.directionChanges += 1;
    }
    state.trackingDirectionAt = performance.now() + randomBetween(TRACKING_DIRECTION_MIN_MS, TRACKING_DIRECTION_MAX_MS);
  }

  function startRapidFireRun() {
    state.holdAction = 'rapid';
    startAnchorHoldPhase();
  }

  function startPrecisionRun() {
    state.holdAction = 'precision';
    startAnchorHoldPhase();
  }

  function beginPrecisionBoard() {
    state.phase = 'precision-active';
    state.stats.endAt = performance.now() + PRECISION_DURATION_MS;
    setRunState(state.mode === 'rapid' ? 'Rapid fire live' : 'Precision live');
    setHint('Click the small targets. Hits respawn instantly for 60 seconds.', { muted: false });
    for (let index = 0; index < PRECISION_TARGET_COUNT; index += 1) {
      spawnPrecisionTarget();
    }
    startLoop();
  }

  function spawnPrecisionTarget() {
    const point = randomStagePoint(40);
    const target = buildPrecisionTarget();
    setElementPosition(target, point.x, point.y);
    addStageElement(target);
  }

  function handlePrecisionTargetHit(target) {
    if (!state.running || state.phase !== 'precision-active') return;
    const targetX = parseFloat(target.style.left) || 0;
    const targetY = parseFloat(target.style.top) || 0;
    const accuracy = clamp(1 - pointerDistanceFrom(targetX, targetY) / 14, 0, 1);
    state.stats.hits += 1;
    state.stats.clicks += 1;
    state.stats.targetsShot += 1;
    state.stats.targetHitAccuracy.push(accuracy);
    target.classList.add('target-hit');
    const index = state.activeElements.indexOf(target);
    if (index >= 0) state.activeElements.splice(index, 1);
    target.remove();
    spawnPrecisionTarget();
    renderHud();
    renderSessionStats();
  }

  function updateAnchorHold(now) {
    if (!state.currentTarget) return;
    const centerX = state.stageRect.width / 2;
    const centerY = state.stageRect.height / 2;
    const within = state.pointer.inside && pointerDistanceFrom(centerX, centerY) <= TRACKING_RADIUS + 4;
    state.currentTarget.classList.toggle('is-held', within);
    if (!within) {
      state.anchorHeldAt = 0;
      state.stats.holdProgress = 0;
      setRunState('Hold start');
      setHint('Hold your cursor on the orange dot for 3 seconds to begin.', { muted: false });
      return;
    }
    if (!state.anchorHeldAt) {
      state.anchorHeldAt = now;
    }
    state.stats.holdProgress = clamp(now - state.anchorHeldAt, 0, HOLD_MS);
    const remaining = Math.max(0, HOLD_MS - state.stats.holdProgress);
    setRunState(`Hold ${round(remaining / 1000, 1)}s`);
    setHint(`Hold steady... ${round(remaining / 1000, 1)}s left.`, { muted: false });
    if (now - state.anchorHeldAt >= HOLD_MS) {
      if (state.holdAction === 'reaction') {
        startReactionHoldComplete();
      } else if (state.holdAction === 'shot') {
        beginShotRep();
      } else if (state.holdAction === 'tracking') {
        beginTrackingMovement();
      } else if (state.holdAction === 'rapid' || state.holdAction === 'precision') {
        beginPrecisionBoard();
      }
    }
  }

  function startReactionHoldComplete() {
    state.phase = 'reaction-wait';
    clearStageModeClasses();
    dom.arenaStage.classList.add('mode-reaction');
    setRunState('Red hold');
    queueReactionRep(true);
  }

  function updateTracking(now, deltaMs) {
    if (!state.trackingTarget || !state.stats) return;
    if (now >= state.trackingDirectionAt) {
      randomizeTrackingDirection();
    }
    const deltaSeconds = deltaMs / 1000;
    state.trackingTarget.x += state.trackingTarget.vx * deltaSeconds;
    state.trackingTarget.y += state.trackingTarget.vy * deltaSeconds;
    const margin = TRACKING_RADIUS + 8;
    if (state.trackingTarget.x < margin || state.trackingTarget.x > state.stageRect.width - margin) {
      state.trackingTarget.vx *= -1;
      state.trackingTarget.x = clamp(state.trackingTarget.x, margin, state.stageRect.width - margin);
    }
    if (state.trackingTarget.y < margin || state.trackingTarget.y > state.stageRect.height - margin) {
      state.trackingTarget.vy *= -1;
      state.trackingTarget.y = clamp(state.trackingTarget.y, margin, state.stageRect.height - margin);
    }
    setElementPosition(state.trackingTarget.el, state.trackingTarget.x, state.trackingTarget.y);
    state.stats.trackingTotalMs += deltaMs;
    if (state.pointer.inside && pointerDistanceFrom(state.trackingTarget.x, state.trackingTarget.y) <= TRACKING_RADIUS + 2) {
      state.stats.onTargetMs += deltaMs;
    }
    if (now >= state.stats.endAt) {
      finishRun();
    }
  }

  function updateLoop(now) {
    if (!state.running) {
      cancelAnimationLoop();
      return;
    }
    if (!state.loopLastAt) {
      state.loopLastAt = now;
    }
    const deltaMs = now - state.loopLastAt;
    state.loopLastAt = now;

    if (state.phase === 'anchor-hold') {
      updateAnchorHold(now);
    } else if (state.phase === 'shot-active' && now >= state.targetTimeoutAt) {
      handleShotTimeout();
    } else if (state.phase === 'tracking-active') {
      updateTracking(now, deltaMs);
    } else if (state.phase === 'precision-active' && now >= state.stats.endAt) {
      finishRun();
      return;
    }

    renderHud();
    renderSessionStats();
    state.rafId = requestAnimationFrame(updateLoop);
  }

  function startLoop() {
    cancelAnimationLoop();
    state.loopLastAt = 0;
    state.rafId = requestAnimationFrame(updateLoop);
  }

  function handleStagePointerDown(event) {
    if (!state.running) return;

    if (state.mode === 'reaction') {
      if (state.phase === 'reaction-wait') {
        handleReactionFalseStart();
      } else if (state.phase === 'reaction-green') {
        recordReactionClick();
      }
      return;
    }

    if (state.phase === 'shot-active' && (state.mode === 'flick' || state.mode === 'micro')) {
      const target = event.target.closest('.target-icon');
      if (target) {
        handleShotHit(event);
        return;
      }
      state.stats.clicks += 1;
      state.stats.misses += 1;
      renderHud();
      renderSessionStats();
      return;
    }

    if (state.phase === 'precision-active') {
      const target = event.target.closest('.precision-target');
      if (target) {
        handlePrecisionTargetHit(target);
      } else {
        state.stats.clicks += 1;
        state.stats.misses += 1;
        renderHud();
        renderSessionStats();
      }
    }
  }

  function updatePointer(event) {
    const position = stageClickPosition(event);
    state.pointer.x = position.x;
    state.pointer.y = position.y;
    state.pointer.inside = true;
  }

  function wireEvents() {
    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (state.running) return;
        setMode(button.dataset.mode);
      });
    });

    axisButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedAxis = button.dataset.axis || 'horizontal';
        state.showAxisPicker = false;
        state.holdAction = 'tracking';
        syncRunControls();
        startAnchorHoldPhase();
      });
    });

    const startHandler = () => {
      if (state.running) return;
      startRun();
    };

    dom.startBtn.addEventListener('click', startHandler);
    dom.stageStartBtn.addEventListener('click', startHandler);

    const replayHandler = () => {
      resetIdleView();
      startRun();
    };

    dom.replayBtn.addEventListener('click', replayHandler);
    dom.stageReplayBtn.addEventListener('click', replayHandler);

    dom.quitBtn.addEventListener('click', () => {
      resetIdleView();
    });

    dom.playAgainBtn.addEventListener('click', () => {
      resetIdleView();
      startRun();
    });

    dom.changeModeBtn.addEventListener('click', () => {
      dom.resultsPanel.hidden = true;
      setHint('Choose another mode and press Start Run.', { muted: true });
    });

    dom.arenaStage.addEventListener('pointerdown', handleStagePointerDown);
    dom.arenaStage.addEventListener('pointermove', updatePointer);
    dom.arenaStage.addEventListener('pointerenter', updatePointer);
    dom.arenaStage.addEventListener('pointerleave', () => {
      state.pointer.inside = false;
      state.anchorHeldAt = 0;
    });

    window.addEventListener('resize', measureStage);
  }

  function init() {
    measureStage();
    wireEvents();
    setMode(state.mode);
    renderHud();
    renderSessionStats();
    renderBests();
    setRunState('Ready');
    setHint('Choose a mode and press Start Run.', { muted: true });
  }

  init();
})();
