(function () {
  const SETTINGS_KEY = 'playr.f1Academy.settings.v1';
  const HISTORY_KEY = 'playr.f1Academy.history.v1';
  const RECORDS_KEY = 'playr.f1Academy.records.v1';
  const LEADERBOARD_KEY = 'playr.f1Academy.leaderboards.v1';
  const MAX_HISTORY = 40;
  const LEADERBOARD_LIMIT = 12;

  const BOARDS = ['overall', 'reaction', 'memory', 'awareness', 'decision', 'consistency'];
  const RANGES = ['all', 'weekly', 'daily'];
  const TOKEN_POOL = [
    { id: 'brake', label: 'BRAKE' },
    { id: 'entry', label: 'ENTRY' },
    { id: 'apex', label: 'APEX' },
    { id: 'exit', label: 'EXIT' },
    { id: 'deploy', label: 'DEPLOY' },
    { id: 'delta', label: 'DELTA' },
    { id: 'lift', label: 'LIFT' },
    { id: 'box', label: 'BOX' },
  ];

  const REACTION_INPUTS = [
    { key: 'a', label: 'Lane A', cue: 'BRAKE BIAS', short: 'A' },
    { key: 's', label: 'Lane S', cue: 'ENERGY DEPLOY', short: 'S' },
    { key: 'k', label: 'Lane K', cue: 'TORQUE MAP', short: 'K' },
    { key: 'l', label: 'Lane L', cue: 'DIFF ENTRY', short: 'L' },
  ];

  const TELEMETRY_LABELS = ['Tyre Temp', 'Brake Bias', 'Fuel Delta', 'Battery', 'Rear Slip', 'Track Grip', 'Engine Mode', 'Pit Window'];

  const DECISION_SCENARIOS = [
    {
      title: 'Late yellow in sector two',
      copy: 'You are on a strong lap, but a sector-two yellow appears just before your best split. The pit wall needs an immediate call.',
      options: [
        { label: 'Abort push', detail: 'Protect safety and preserve tyre prep for next lap.', score: 100, risk: 18 },
        { label: 'Lift lightly', detail: 'Try to preserve some lap value without full abort.', score: 76, risk: 42 },
        { label: 'Stay flat', detail: 'Chase the lap anyway and hope the sector clears.', score: 12, risk: 94 },
      ],
    },
    {
      title: 'Cooling issue on a traffic out-lap',
      copy: 'Temperatures are climbing while slower traffic blocks clean air. You can protect the car or stay committed to the run plan.',
      options: [
        { label: 'Back off for air', detail: 'Lose time now to preserve the next push safely.', score: 94, risk: 16 },
        { label: 'Swap modes only', detail: 'Reduce load but stay in the queue.', score: 74, risk: 37 },
        { label: 'Force the gap', detail: 'Stay loaded and commit to the original sequence.', score: 28, risk: 71 },
      ],
    },
    {
      title: 'Light rain at the final sector',
      copy: 'Grip remains stable elsewhere, but the final sector is getting damp. One lap remains before the crossover becomes obvious.',
      options: [
        { label: 'Bank a safe lap', detail: 'Shift to lower-risk targets and secure a representative time.', score: 92, risk: 20 },
        { label: 'Push normal line', detail: 'Trust current balance and keep the same risk profile.', score: 66, risk: 48 },
        { label: 'Attack for purple', detail: 'Go for maximum gain before the track tips away.', score: 34, risk: 78 },
      ],
    },
    {
      title: 'Undercut window opening',
      copy: 'Your delta suggests an undercut may work, but the out-lap will likely place you into midfield turbulence.',
      options: [
        { label: 'Take the undercut', detail: 'Use clear logic if the numbers justify the loss risk.', score: 88, risk: 39 },
        { label: 'Extend one lap', detail: 'Wait for a cleaner gap and confirm the model.', score: 83, risk: 28 },
        { label: 'Ignore the window', detail: 'Hold station and remove the strategic lever.', score: 39, risk: 60 },
      ],
    },
    {
      title: 'Battery margin below target',
      copy: 'Mid-lap energy use is higher than planned. You can protect the next straights or keep current attack levels.',
      options: [
        { label: 'Rebalance early', detail: 'Sacrifice a little now to prevent a bigger end-lap loss.', score: 96, risk: 15 },
        { label: 'Hold to next split', detail: 'Delay the decision for more information.', score: 71, risk: 33 },
        { label: 'Ignore and commit', detail: 'Trust the battery to recover late.', score: 22, risk: 86 },
      ],
    },
    {
      title: 'Opponent weaving in mirrors',
      copy: 'You are approaching a slower car that is moving unpredictably before the braking zone. Time is short and visibility is compromised.',
      options: [
        { label: 'Reset entry target', detail: 'Protect a stable line and prepare for exit speed.', score: 90, risk: 23 },
        { label: 'Show the nose late', detail: 'Apply pressure while keeping some margin.', score: 72, risk: 46 },
        { label: 'Dive aggressively', detail: 'Force the pass now regardless of line stability.', score: 18, risk: 92 },
      ],
    },
    {
      title: 'Front locking trend',
      copy: 'Brake traces show repeated front locking at high speed. The run still has good pace if you manage the phase correctly.',
      options: [
        { label: 'Move bias rearward', detail: 'Apply the smallest stabilizing correction and continue.', score: 95, risk: 18 },
        { label: 'Brake earlier only', detail: 'Change driving input without touching balance.', score: 70, risk: 35 },
        { label: 'Push through it', detail: 'Assume it will self-correct on the next lap.', score: 20, risk: 84 },
      ],
    },
    {
      title: 'Safety car likely but unconfirmed',
      copy: 'A stopped car may trigger a safety car, but race control has not acted yet. The timing line approaches quickly.',
      options: [
        { label: 'Cover both outcomes', detail: 'Make the choice that preserves flexibility.', score: 91, risk: 26 },
        { label: 'Commit early', detail: 'Act now and trust the prediction.', score: 68, risk: 51 },
        { label: 'Do nothing', detail: 'Wait until the window closes and remove agency.', score: 31, risk: 63 },
      ],
    },
  ];

  const CATEGORY_META = {
    reaction: {
      label: 'Reaction Program',
      short: 'Reaction',
      boardMetric: 'Avg RT',
      boardSupport: 'Accuracy',
      focus: 'Signal response speed',
      description: 'Train variable-stimulus response speed with mapped inputs, false-start penalties, and decoy management.',
      variants: {
        baseline: {
          label: 'Baseline',
          metric: 'Average reaction time',
          pressure: '2 mapped inputs, no decoys',
          sessionLength: '~45 seconds',
          rules: ['Wait for the live cue before responding.', 'Baseline calibrates performance but does not enter leaderboards.', 'False starts add direct penalties to your analysis.'],
          leaderboardEligible: false,
          inputs: 2,
          reps: 10,
          decoyChance: 0,
          responseWindow: 1250,
          delayMin: 900,
          delayMax: 2000,
        },
        advanced: {
          label: 'Advanced',
          metric: 'Average reaction time',
          pressure: '3 mapped inputs, compressed windows',
          sessionLength: '~55 seconds',
          rules: ['Three cue types are active.', 'Leaderboard validation requires at least 80% correct responses.', 'Fast mistakes are scored below controlled correct inputs.'],
          leaderboardEligible: true,
          inputs: 3,
          reps: 12,
          decoyChance: 0.16,
          responseWindow: 980,
          delayMin: 820,
          delayMax: 1800,
        },
        evaluation: {
          label: 'Evaluation',
          metric: 'Average reaction time',
          pressure: '4 mapped inputs with decoys',
          sessionLength: '~60 seconds',
          rules: ['Decoy signals punish overreaction heavily.', 'Validation requires 84% accuracy with controlled false-start rate.', 'The best runs balance pure speed with discipline.'],
          leaderboardEligible: true,
          inputs: 4,
          reps: 14,
          decoyChance: 0.28,
          responseWindow: 860,
          delayMin: 760,
          delayMax: 1650,
        },
      },
    },
    memory: {
      label: 'Track Cognition',
      short: 'Memory',
      boardMetric: 'Seq',
      boardSupport: 'Recall',
      focus: 'Ordered recall',
      description: 'Encode ordered track-call information, absorb interference, and reconstruct the sequence accurately under time pressure.',
      variants: {
        baseline: {
          label: 'Baseline',
          metric: 'Sequence length recalled',
          pressure: '5-call baseline sequences',
          sessionLength: '~50 seconds',
          rules: ['Watch the sequence carefully.', 'Baseline builds recall without leaderboard pressure.', 'Recall speed matters after accuracy is secured.'],
          leaderboardEligible: false,
          rounds: 3,
          length: 5,
          flashMs: 650,
          interference: false,
          recallWindow: 9000,
        },
        advanced: {
          label: 'Advanced',
          metric: 'Sequence length recalled',
          pressure: '7-call sequences with shorter exposure',
          sessionLength: '~65 seconds',
          rules: ['Leaderboard validation requires at least one perfect round.', 'Input the sequence in order as quickly as possible.', 'Short-term noise is introduced between viewing and recall.'],
          leaderboardEligible: true,
          rounds: 3,
          length: 7,
          flashMs: 460,
          interference: true,
          recallWindow: 8500,
        },
        evaluation: {
          label: 'Evaluation',
          metric: 'Sequence length recalled',
          pressure: '8-call sequences with interference',
          sessionLength: '~75 seconds',
          rules: ['Validation requires high-order recall under interference.', 'Late errors still count against sequence efficiency.', 'The board favors length first, then speed and clean recall.'],
          leaderboardEligible: true,
          rounds: 4,
          length: 8,
          flashMs: 380,
          interference: true,
          recallWindow: 7600,
        },
      },
    },
    awareness: {
      label: 'Situational Awareness',
      short: 'Awareness',
      boardMetric: 'Accuracy',
      boardSupport: 'False+',
      focus: 'Critical signal detection',
      description: 'Track multiple telemetry streams at once, identify critical alerts, and avoid reacting to advisory noise.',
      variants: {
        baseline: {
          label: 'Baseline',
          metric: 'Critical identification rate',
          pressure: '6 streams, clean visibility',
          sessionLength: '~45 seconds',
          rules: ['React only to critical alerts.', 'Amber advisory flashes are noise, not action calls.', 'Baseline is for calibration and does not affect boards.'],
          leaderboardEligible: false,
          tiles: 6,
          duration: 28000,
          minGap: 1500,
          maxGap: 2400,
          criticalChance: 0.62,
          responseWindow: 1300,
        },
        advanced: {
          label: 'Advanced',
          metric: 'Critical identification rate',
          pressure: '8 streams, shorter windows',
          sessionLength: '~55 seconds',
          rules: ['Validation requires at least 78% correct critical handling.', 'False positives are weighted heavily in competitive scoring.', 'Peripheral placement becomes more demanding.'],
          leaderboardEligible: true,
          tiles: 8,
          duration: 34000,
          minGap: 1150,
          maxGap: 2050,
          criticalChance: 0.58,
          responseWindow: 1100,
        },
        evaluation: {
          label: 'Evaluation',
          metric: 'Critical identification rate',
          pressure: '8 streams with more ambiguity',
          sessionLength: '~60 seconds',
          rules: ['Evaluation favors controlled selectivity over frantic input.', 'Validation requires low false positives and a strong critical hit rate.', 'Telemetry noise intensifies over time.'],
          leaderboardEligible: true,
          tiles: 8,
          duration: 39000,
          minGap: 980,
          maxGap: 1750,
          criticalChance: 0.52,
          responseWindow: 960,
        },
      },
    },
    decision: {
      label: 'Decision Program',
      short: 'Decision',
      boardMetric: 'Quality',
      boardSupport: 'Avg time',
      focus: 'Quality vs speed',
      description: 'Evaluate constrained race-engineering scenarios where the best answer is logical, not merely aggressive.',
      variants: {
        baseline: {
          label: 'Baseline',
          metric: 'Decision quality',
          pressure: 'Clearer strategic options',
          sessionLength: '~40 seconds',
          rules: ['Read quickly, but do not guess blindly.', 'Baseline is a guided calibration layer and does not enter boards.', 'Each choice carries logical risk and reward.'],
          leaderboardEligible: false,
          rounds: 4,
          timeLimit: 9000,
        },
        advanced: {
          label: 'Advanced',
          metric: 'Decision quality',
          pressure: 'Faster choices, more ambiguity',
          sessionLength: '~50 seconds',
          rules: ['Validation requires a strong quality score and no repeated timeouts.', 'Slightly slower correct logic beats reckless speed.', 'Scenarios are drawn from multi-variable race contexts.'],
          leaderboardEligible: true,
          rounds: 5,
          timeLimit: 7000,
        },
        evaluation: {
          label: 'Evaluation',
          metric: 'Decision quality',
          pressure: 'Compressed windows and higher uncertainty',
          sessionLength: '~55 seconds',
          rules: ['The board rewards efficient judgment, not random aggression.', 'Validation requires high correctness and controlled risk efficiency.', 'The tightest time budget sits in this variant.'],
          leaderboardEligible: true,
          rounds: 6,
          timeLimit: 5600,
        },
      },
    },
    consistency: {
      label: 'Consistency Program',
      short: 'Consistency',
      boardMetric: 'Index',
      boardSupport: 'Variance',
      focus: 'Stable precision',
      description: 'Sustain repeatable timing accuracy over an extended session while the drill gradually becomes less forgiving.',
      variants: {
        baseline: {
          label: 'Baseline',
          metric: 'Consistency index',
          pressure: '18 precision cycles',
          sessionLength: '~50 seconds',
          rules: ['Hit inside the target window consistently.', 'Baseline measures rhythm but does not enter boards.', 'Stability matters more than a single perfect strike.'],
          leaderboardEligible: false,
          attempts: 18,
          windowPct: 0.14,
          speed: 0.38,
          ramp: 0.004,
          distractions: false,
        },
        advanced: {
          label: 'Advanced',
          metric: 'Consistency index',
          pressure: '24 cycles with tighter target width',
          sessionLength: '~60 seconds',
          rules: ['Validation requires sustained control across the session.', 'Variance and late-session drop-off both reduce ranking quality.', 'The marker speed rises over time.'],
          leaderboardEligible: true,
          attempts: 24,
          windowPct: 0.11,
          speed: 0.46,
          ramp: 0.006,
          distractions: true,
        },
        evaluation: {
          label: 'Evaluation',
          metric: 'Consistency index',
          pressure: '28 cycles under narrowing tolerance',
          sessionLength: '~70 seconds',
          rules: ['Competitive runs must stay stable even as fatigue pressure rises.', 'The best index comes from low variance and low drop-off, not lucky peaks.', 'Evaluation introduces more subtle visual noise.'],
          leaderboardEligible: true,
          attempts: 28,
          windowPct: 0.09,
          speed: 0.53,
          ramp: 0.007,
          distractions: true,
        },
      },
    },
  };

  const dom = {
    briefingTitle: document.getElementById('briefingTitle'),
    briefingCopy: document.getElementById('briefingCopy'),
    briefingMetric: document.getElementById('briefingMetric'),
    briefingPressure: document.getElementById('briefingPressure'),
    briefingRule: document.getElementById('briefingRule'),
    briefingLength: document.getElementById('briefingLength'),
    briefingStatus: document.getElementById('briefingStatus'),
    leaderBoardEligibilityTag: document.getElementById('leaderboardEligibilityTag'),
    leaderboardEligibilityTag: document.getElementById('leaderboardEligibilityTag'),
    ruleList: document.getElementById('ruleList'),
    startBtn: document.getElementById('startBtn'),
    retryBtn: document.getElementById('retryBtn'),
    sessionTitle: document.getElementById('sessionTitle'),
    sessionStateTag: document.getElementById('sessionStateTag'),
    sessionRangeTag: document.getElementById('sessionRangeTag'),
    metricLabel1: document.getElementById('metricLabel1'),
    metricLabel2: document.getElementById('metricLabel2'),
    metricLabel3: document.getElementById('metricLabel3'),
    metricLabel4: document.getElementById('metricLabel4'),
    metricValue1: document.getElementById('metricValue1'),
    metricValue2: document.getElementById('metricValue2'),
    metricValue3: document.getElementById('metricValue3'),
    metricValue4: document.getElementById('metricValue4'),
    stageOverlay: document.getElementById('stageOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayCopy: document.getElementById('overlayCopy'),
    reactionStage: document.getElementById('reactionStage'),
    reactionSignal: document.getElementById('reactionSignal'),
    reactionResponses: document.getElementById('reactionResponses'),
    memoryStage: document.getElementById('memoryStage'),
    sequenceRibbon: document.getElementById('sequenceRibbon'),
    memoryPrompt: document.getElementById('memoryPrompt'),
    memoryActions: document.getElementById('memoryActions'),
    awarenessStage: document.getElementById('awarenessStage'),
    telemetryGrid: document.getElementById('telemetryGrid'),
    decisionStage: document.getElementById('decisionStage'),
    decisionLabel: document.getElementById('decisionLabel'),
    decisionQuestion: document.getElementById('decisionQuestion'),
    decisionCopy: document.getElementById('decisionCopy'),
    decisionOptions: document.getElementById('decisionOptions'),
    consistencyStage: document.getElementById('consistencyStage'),
    targetWindow: document.getElementById('targetWindow'),
    sweepMarker: document.getElementById('sweepMarker'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackCopy: document.getElementById('feedbackCopy'),
    resultsCard: document.getElementById('resultsCard'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsTrend: document.getElementById('resultsTrend'),
    resultsGrid: document.getElementById('resultsGrid'),
    resultsNote: document.getElementById('resultsNote'),
    rangeSummaryTag: document.getElementById('rangeSummaryTag'),
    leaderboardTitle: document.getElementById('leaderboardTitle'),
    leaderboardMeta: document.getElementById('leaderboardMeta'),
    boardPrimaryHeader: document.getElementById('boardPrimaryHeader'),
    boardSecondaryHeader: document.getElementById('boardSecondaryHeader'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    snapshotComposite: document.getElementById('snapshotComposite'),
    snapshotValidated: document.getElementById('snapshotValidated'),
    snapshotTrend: document.getElementById('snapshotTrend'),
    snapshotFocus: document.getElementById('snapshotFocus'),
    trendBars: document.getElementById('trendBars'),
    historyNote: document.getElementById('historyNote'),
    categoryButtons: Array.from(document.querySelectorAll('[data-category]')),
    variantButtons: Array.from(document.querySelectorAll('[data-variant]')),
    rangeButtons: Array.from(document.querySelectorAll('[data-range]')),
    boardButtons: Array.from(document.querySelectorAll('[data-board]')),
    awarenessActionButtons: Array.from(document.querySelectorAll('[data-awareness-action]')),
  };

  if (!dom.startBtn) return;

  const state = {
    selection: loadSettings(),
    history: loadHistory(),
    records: loadRecords(),
    leaderboards: loadLeaderboards(),
    activeSession: null,
    timeouts: [],
    rafId: 0,
    telemetryTickId: 0,
    inputLocked: false,
  };

  function safeParse(raw, fallback) {
    try {
      const parsed = raw ? JSON.parse(raw) : fallback;
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadSettings() {
    const parsed = safeParse(localStorage.getItem(SETTINGS_KEY), null);
    return {
      category: parsed?.category && CATEGORY_META[parsed.category] ? parsed.category : 'reaction',
      variant: parsed?.variant && CATEGORY_META.reaction.variants[parsed.variant] ? parsed.variant : 'baseline',
      range: RANGES.includes(parsed?.range) ? parsed.range : 'all',
      board: BOARDS.includes(parsed?.board) ? parsed.board : 'overall',
    };
  }

  function saveSettings() {
    saveJson(SETTINGS_KEY, state.selection);
  }

  function loadHistory() {
    const parsed = safeParse(localStorage.getItem(HISTORY_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function loadRecords() {
    const parsed = safeParse(localStorage.getItem(RECORDS_KEY), {});
    const domains = {};
    BOARDS.filter((board) => board !== 'overall').forEach((board) => {
      domains[board] = parsed?.domains?.[board] && typeof parsed.domains[board] === 'object' ? parsed.domains[board] : null;
    });
    return {
      domains,
      overall: parsed?.overall && typeof parsed.overall === 'object' ? parsed.overall : null,
    };
  }

  function getDaysAgo(days) {
    return Date.now() - (days * 24 * 60 * 60 * 1000);
  }

  function buildSeedLeaderboards() {
    const names = ['Novak', 'Aster', 'Mira', 'Vale', 'Rin', 'Sora', 'Kian', 'Jett', 'Arin', 'Tala'];
    const seeds = {};
    BOARDS.forEach((board) => {
      seeds[board] = names.map((name, index) => {
        const timestamp = Date.now() - (index * 1.6 + 0.7) * 24 * 60 * 60 * 1000;
        if (board === 'reaction') {
          return {
            player: name,
            avgReaction: 218 + index * 17,
            fastest: 186 + index * 15,
            accuracy: Math.max(82, 98 - index * 1.4),
            falseStarts: Math.min(3, Math.floor(index / 4)),
            variant: index < 5 ? 'evaluation' : 'advanced',
            timestamp,
          };
        }
        if (board === 'memory') {
          return {
            player: name,
            maxSequence: Math.max(5, 9 - Math.floor(index / 2)),
            accuracy: Math.max(74, 98 - index * 2.2),
            recallMs: 4100 + index * 380,
            variant: index < 4 ? 'evaluation' : 'advanced',
            timestamp,
          };
        }
        if (board === 'awareness') {
          return {
            player: name,
            correctRate: Math.max(72, 98 - index * 2.1),
            falsePositives: Math.min(7, index),
            avgReaction: 680 + index * 48,
            variant: index < 4 ? 'evaluation' : 'advanced',
            timestamp,
          };
        }
        if (board === 'decision') {
          return {
            player: name,
            quality: Math.max(54, 97 - index * 3.4),
            avgDecisionMs: 2100 + index * 220,
            riskEfficiency: Math.max(38, 91 - index * 4),
            variant: index < 4 ? 'evaluation' : 'advanced',
            timestamp,
          };
        }
        if (board === 'consistency') {
          return {
            player: name,
            indexScore: Math.max(52, 96 - index * 3),
            variance: 6 + index * 1.2,
            dropoff: Math.max(0.8, 5.8 - index * 0.35),
            variant: index < 4 ? 'evaluation' : 'advanced',
            timestamp,
          };
        }
        return {
          player: name,
          composite: Math.max(58, 96 - index * 3.1),
          support: `${Math.max(76, 97 - index * 2)}% validated`,
          timestamp,
        };
      });
    });
    return seeds;
  }

  function loadLeaderboards() {
    const parsed = safeParse(localStorage.getItem(LEADERBOARD_KEY), null);
    if (parsed && typeof parsed === 'object') {
      const boards = {};
      BOARDS.forEach((board) => {
        boards[board] = Array.isArray(parsed[board]) ? parsed[board] : [];
      });
      return boards;
    }
    return buildSeedLeaderboards();
  }

  function saveLeaderboards() {
    saveJson(LEADERBOARD_KEY, state.leaderboards);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function variance(values) {
    if (values.length <= 1) return 0;
    const mean = average(values);
    return average(values.map((value) => (value - mean) ** 2));
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

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = current;
    }
    return copy;
  }

  function sample(values, count = 1) {
    return shuffle(values).slice(0, count);
  }

  function formatMs(value) {
    return Number.isFinite(value) ? `${Math.round(value)}ms` : '--';
  }

  function formatPercent(value) {
    return Number.isFinite(value) ? `${round(value, 1)}%` : '--';
  }

  function getCurrentPlayerName() {
    try {
      if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
        const user = window.PlayrAuth.getCurrentUser();
        if (user?.displayName) {
          return String(user.displayName).trim().slice(0, 24) || 'Guest';
        }
      }
    } catch {
      // Ignore auth helper issues.
    }

    try {
      const raw = localStorage.getItem('playrCurrentUser');
      const parsed = raw ? JSON.parse(raw) : null;
      return String(parsed?.displayName || 'Guest').trim().slice(0, 24) || 'Guest';
    } catch {
      return 'Guest';
    }
  }

  function selectedConfig() {
    return CATEGORY_META[state.selection.category].variants[state.selection.variant];
  }

  function selectedCategoryMeta() {
    return CATEGORY_META[state.selection.category];
  }

  function queueTimeout(callback, delay) {
    const id = window.setTimeout(() => {
      state.timeouts = state.timeouts.filter((entry) => entry !== id);
      callback();
    }, delay);
    state.timeouts.push(id);
    return id;
  }

  function clearTimers() {
    state.timeouts.forEach((id) => window.clearTimeout(id));
    state.timeouts = [];
    if (state.telemetryTickId) {
      window.clearInterval(state.telemetryTickId);
      state.telemetryTickId = 0;
    }
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function setOverlay(title, copy, visible = true) {
    dom.overlayTitle.textContent = title;
    dom.overlayCopy.textContent = copy;
    dom.stageOverlay.classList.toggle('is-hidden', !visible);
  }

  function setFeedback(title, copy) {
    dom.feedbackTitle.textContent = title;
    dom.feedbackCopy.textContent = copy;
  }

  function setSessionState(text) {
    dom.sessionStateTag.textContent = text;
  }

  function hideAllStages() {
    [dom.reactionStage, dom.memoryStage, dom.awarenessStage, dom.decisionStage, dom.consistencyStage].forEach((element) => {
      element.classList.add('hidden');
    });
  }

  function showStage(stageName) {
    hideAllStages();
    if (stageName === 'reaction') dom.reactionStage.classList.remove('hidden');
    if (stageName === 'memory') dom.memoryStage.classList.remove('hidden');
    if (stageName === 'awareness') dom.awarenessStage.classList.remove('hidden');
    if (stageName === 'decision') dom.decisionStage.classList.remove('hidden');
    if (stageName === 'consistency') dom.consistencyStage.classList.remove('hidden');
  }

  function renderBriefing() {
    const meta = selectedCategoryMeta();
    const config = selectedConfig();
    dom.briefingTitle.textContent = `${meta.label} / ${config.label}`;
    dom.briefingCopy.textContent = meta.description;
    dom.briefingMetric.textContent = config.metric;
    dom.briefingPressure.textContent = config.pressure;
    dom.briefingRule.textContent = config.leaderboardEligible ? 'Validated competitive run' : 'Training only';
    dom.briefingLength.textContent = config.sessionLength;
    dom.briefingStatus.textContent = state.activeSession ? 'Live' : 'Ready';
    dom.leaderboardEligibilityTag.textContent = config.leaderboardEligible ? 'Eligible for validated boards' : 'Baseline = training only';
    dom.ruleList.innerHTML = config.rules.map((rule) => `<li>${rule}</li>`).join('');
    dom.sessionTitle.textContent = `${meta.label} / ${config.label}`;
  }

  function renderSelectionButtons() {
    dom.categoryButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.category === state.selection.category);
      button.disabled = Boolean(state.activeSession);
    });
    dom.variantButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.variant === state.selection.variant);
      button.disabled = Boolean(state.activeSession);
    });
    dom.rangeButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.range === state.selection.range);
    });
    dom.boardButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.board === state.selection.board);
    });
    dom.startBtn.disabled = Boolean(state.activeSession);
    dom.retryBtn.disabled = false;
  }

  function renderMetricsFromIdle() {
    const category = state.selection.category;
    if (category === 'reaction') {
      setMetricCardLabels(['Average', 'Accuracy', 'Pressure', 'State'], ['--', '--', selectedConfig().pressure, 'Ready']);
    } else if (category === 'memory') {
      setMetricCardLabels(['Sequence', 'Accuracy', 'Recall', 'State'], ['--', '--', '--', 'Ready']);
    } else if (category === 'awareness') {
      setMetricCardLabels(['Correct', 'False+', 'Window', 'State'], ['--', '--', `${selectedConfig().responseWindow}ms`, 'Ready']);
    } else if (category === 'decision') {
      setMetricCardLabels(['Quality', 'Avg time', 'Risk', 'State'], ['--', '--', '--', 'Ready']);
    } else {
      setMetricCardLabels(['Index', 'Variance', 'Drop-off', 'State'], ['--', '--', '--', 'Ready']);
    }
  }

  function setMetricCardLabels(labels, values) {
    dom.metricLabel1.textContent = labels[0];
    dom.metricLabel2.textContent = labels[1];
    dom.metricLabel3.textContent = labels[2];
    dom.metricLabel4.textContent = labels[3];
    dom.metricValue1.textContent = values[0];
    dom.metricValue2.textContent = values[1];
    dom.metricValue3.textContent = values[2];
    dom.metricValue4.textContent = values[3];
  }

  function renderResults(summary = null) {
    if (!summary) {
      dom.resultsTitle.textContent = 'No session completed yet';
      dom.resultsTrend.textContent = 'Waiting';
      dom.resultsGrid.innerHTML = '';
      dom.resultsNote.textContent = 'Performance breakdowns appear here after each module.';
      return;
    }

    dom.resultsTitle.textContent = `${CATEGORY_META[summary.category].short} ${summary.variantLabel} analysis`;
    dom.resultsTrend.textContent = summary.trendLabel;

    const items = buildResultCards(summary);
    dom.resultsGrid.innerHTML = items.map(([label, value]) => `
      <div class="result-item">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
    dom.resultsNote.textContent = summary.analysis;
  }

  function buildResultCards(summary) {
    if (summary.category === 'reaction') {
      return [
        ['Avg RT', formatMs(summary.avgReaction)],
        ['Fastest', formatMs(summary.fastest)],
        ['Accuracy', formatPercent(summary.accuracy)],
        ['False starts', String(summary.falseStarts)],
      ];
    }
    if (summary.category === 'memory') {
      return [
        ['Best sequence', String(summary.maxSequence)],
        ['Accuracy', formatPercent(summary.accuracy)],
        ['Avg recall', formatMs(summary.avgRecallMs)],
        ['Perfect rounds', String(summary.perfectRounds)],
      ];
    }
    if (summary.category === 'awareness') {
      return [
        ['Correct rate', formatPercent(summary.correctRate)],
        ['False positives', String(summary.falsePositives)],
        ['Missed critical', String(summary.missedCritical)],
        ['Avg response', formatMs(summary.avgReaction)],
      ];
    }
    if (summary.category === 'decision') {
      return [
        ['Quality', formatPercent(summary.quality)],
        ['Avg time', formatMs(summary.avgDecisionMs)],
        ['Risk efficiency', formatPercent(summary.riskEfficiency)],
        ['Timeouts', String(summary.timeouts)],
      ];
    }
    return [
      ['Index', formatPercent(summary.indexScore)],
      ['Variance', round(summary.variance, 1)],
      ['Drop-off', formatPercent(summary.dropoff)],
      ['Hit rate', formatPercent(summary.hitRate)],
    ];
  }

  function buildTrendLabel(previous, currentValue, lowerIsBetter = false) {
    if (!Number.isFinite(previous)) return 'First validated run';
    const improved = lowerIsBetter ? currentValue < previous : currentValue > previous;
    const delta = Math.abs(currentValue - previous);
    if (delta < 0.1) return 'Flat vs previous validated run';
    return improved ? 'Improved vs previous validated run' : 'Below previous validated run';
  }

  function buildAnalysis(summary) {
    const meta = CATEGORY_META[summary.category];
    if (summary.category === 'reaction') {
      return `${meta.short} session complete. ${summary.trendSentence} Accuracy sat at ${formatPercent(summary.accuracy)} with ${summary.falseStarts} false starts, so the biggest gains now come from staying sharp without jumping the cue.`;
    }
    if (summary.category === 'memory') {
      return `${meta.short} session complete. ${summary.trendSentence} You successfully held ${summary.maxSequence} ordered calls with ${formatPercent(summary.accuracy)} token accuracy, so the next ceiling is faster reconstruction after interference.`;
    }
    if (summary.category === 'awareness') {
      return `${meta.short} session complete. ${summary.trendSentence} The key trade-off was ${formatPercent(summary.correctRate)} correct critical handling against ${summary.falsePositives} false positives, which shows how disciplined your selective attention stayed.`;
    }
    if (summary.category === 'decision') {
      return `${meta.short} session complete. ${summary.trendSentence} Your choices averaged ${formatPercent(summary.quality)} quality in ${formatMs(summary.avgDecisionMs)}, so the next improvement is making the same clean logic faster.`;
    }
    return `${meta.short} session complete. ${summary.trendSentence} Your consistency index landed at ${formatPercent(summary.indexScore)} with ${round(summary.variance, 1)} variance, so long-run stability is the main performance story.`;
  }

  function updateHistory(summary) {
    state.history.unshift({
      category: summary.category,
      variant: summary.variant,
      validated: summary.validated,
      score: summary.competitiveScore,
      metricBasis: summary.scoreEquivalent,
      timestamp: Date.now(),
    });
    state.history = state.history.slice(0, MAX_HISTORY);
    saveJson(HISTORY_KEY, state.history);
  }

  function normalizedOverallScore() {
    const domains = BOARDS.filter((board) => board !== 'overall')
      .map((board) => Number(state.records.domains[board]?.normalizedScore || 0));
    if (!domains.some((value) => value > 0)) return 0;
    return round(average(domains), 1);
  }

  function updateRecords(summary) {
    if (!summary.validated) return;
    const previous = state.records.domains[summary.category];
    const shouldReplace = !previous || summary.normalizedScore > Number(previous.normalizedScore || 0);
    if (shouldReplace) {
      state.records.domains[summary.category] = {
        normalizedScore: summary.normalizedScore,
        competitiveScore: summary.competitiveScore,
        variant: summary.variant,
        timestamp: Date.now(),
        supportText: summary.supportText,
      };
    }
    state.records.overall = {
      normalizedScore: normalizedOverallScore(),
      validatedCount: BOARDS.filter((board) => board !== 'overall' && state.records.domains[board]).length,
    };
    saveJson(RECORDS_KEY, state.records);
  }

  function addLeaderboardEntry(board, entry) {
    state.leaderboards[board].push(entry);
    state.leaderboards[board] = sortBoardEntries(board, state.leaderboards[board]).slice(0, LEADERBOARD_LIMIT);
    saveLeaderboards();
  }

  function updateOverallBoard() {
    const validatedBoards = BOARDS.filter((board) => board !== 'overall' && state.records.domains[board]);
    if (!validatedBoards.length) return;
    const player = getCurrentPlayerName();
    const composite = normalizedOverallScore();
    const support = `${validatedBoards.length}/5 domains validated`;
    const entry = {
      player,
      composite,
      support,
      timestamp: Date.now(),
    };
    state.leaderboards.overall = state.leaderboards.overall.filter((row) => row.player !== player || !row.isPlayerOverall);
    entry.isPlayerOverall = true;
    addLeaderboardEntry('overall', entry);
  }

  function sortBoardEntries(board, entries) {
    const rows = [...entries];
    if (board === 'overall') {
      return rows.sort((a, b) => Number(b.composite || 0) - Number(a.composite || 0));
    }
    if (board === 'reaction') {
      return rows.sort((a, b) => Number(a.avgReaction || Infinity) - Number(b.avgReaction || Infinity)
        || Number(b.accuracy || 0) - Number(a.accuracy || 0)
        || Number(a.falseStarts || 0) - Number(b.falseStarts || 0));
    }
    if (board === 'memory') {
      return rows.sort((a, b) => Number(b.maxSequence || 0) - Number(a.maxSequence || 0)
        || Number(b.accuracy || 0) - Number(a.accuracy || 0)
        || Number(a.recallMs || Infinity) - Number(b.recallMs || Infinity));
    }
    if (board === 'awareness') {
      return rows.sort((a, b) => Number(b.correctRate || 0) - Number(a.correctRate || 0)
        || Number(a.falsePositives || Infinity) - Number(b.falsePositives || Infinity)
        || Number(a.avgReaction || Infinity) - Number(b.avgReaction || Infinity));
    }
    if (board === 'decision') {
      return rows.sort((a, b) => Number(b.quality || 0) - Number(a.quality || 0)
        || Number(a.avgDecisionMs || Infinity) - Number(b.avgDecisionMs || Infinity)
        || Number(b.riskEfficiency || 0) - Number(a.riskEfficiency || 0));
    }
    return rows.sort((a, b) => Number(b.indexScore || 0) - Number(a.indexScore || 0)
      || Number(a.variance || Infinity) - Number(b.variance || Infinity)
      || Number(a.dropoff || Infinity) - Number(b.dropoff || Infinity));
  }

  function filterEntriesByRange(entries, range) {
    if (range === 'all') return entries;
    const cutoff = range === 'daily' ? getDaysAgo(1) : getDaysAgo(7);
    return entries.filter((entry) => Number(entry.timestamp || 0) >= cutoff);
  }

  function boardHeaders(board) {
    if (board === 'overall') return ['Composite', 'Support'];
    const meta = CATEGORY_META[board];
    return [meta.boardMetric, meta.boardSupport];
  }

  function boardRowDisplay(board, entry) {
    if (board === 'overall') {
      return [String(round(entry.composite || 0, 1)), entry.support || '--'];
    }
    if (board === 'reaction') {
      return [formatMs(entry.avgReaction), `${formatPercent(entry.accuracy)} • ${entry.variant}`];
    }
    if (board === 'memory') {
      return [String(entry.maxSequence || 0), `${formatPercent(entry.accuracy)} • ${formatMs(entry.recallMs)}`];
    }
    if (board === 'awareness') {
      return [formatPercent(entry.correctRate), `${entry.falsePositives} false+ • ${formatMs(entry.avgReaction)}`];
    }
    if (board === 'decision') {
      return [formatPercent(entry.quality), `${formatMs(entry.avgDecisionMs)} • ${formatPercent(entry.riskEfficiency)}`];
    }
    return [formatPercent(entry.indexScore), `${round(entry.variance, 1)} var • ${formatPercent(entry.dropoff)}`];
  }

  function renderLeaderboard() {
    const board = state.selection.board;
    const range = state.selection.range;
    const rows = filterEntriesByRange(sortBoardEntries(board, state.leaderboards[board] || []), range).slice(0, 8);
    const [primary, secondary] = boardHeaders(board);
    dom.boardPrimaryHeader.textContent = primary;
    dom.boardSecondaryHeader.textContent = secondary;
    dom.leaderboardTitle.textContent = board === 'overall' ? 'Overall board' : `${CATEGORY_META[board].short} board`;
    dom.leaderboardMeta.textContent = range === 'all' ? 'Validated runs' : `${range === 'weekly' ? '7-day' : '24-hour'} window`;
    dom.rangeSummaryTag.textContent = range === 'all' ? 'All-time' : range === 'weekly' ? 'Weekly' : 'Daily';
    dom.sessionRangeTag.textContent = range === 'all' ? 'All-time board' : range === 'weekly' ? 'Weekly board' : 'Daily board';

    if (!rows.length) {
      dom.leaderboardBody.innerHTML = '<tr><td colspan="4">No validated runs in this range yet.</td></tr>';
      return;
    }

    dom.leaderboardBody.innerHTML = rows.map((entry, index) => {
      const [main, support] = boardRowDisplay(board, entry);
      return `
        <tr>
          <td>#${index + 1}</td>
          <td>${entry.player || 'Guest'}</td>
          <td>${main}</td>
          <td>${support}</td>
        </tr>
      `;
    }).join('');
  }

  function renderHistory() {
    const recent = state.history.slice(0, 8).reverse();
    dom.trendBars.innerHTML = '';
    if (!recent.length) {
      dom.historyNote.textContent = 'Long-term feedback highlights whether your recent work is actually making you sharper.';
      return;
    }
    const maxValue = Math.max(...recent.map((entry) => Number(entry.score || 0)), 1);
    recent.forEach((entry, index) => {
      const bar = document.createElement('div');
      bar.className = `trend-bar${entry.validated ? '' : ' is-dim'}`;
      bar.style.height = `${Math.max(14, (Number(entry.score || 0) / maxValue) * 92)}px`;
      bar.title = `${CATEGORY_META[entry.category].short} ${entry.variant} • ${round(entry.score || 0, 1)}`;
      dom.trendBars.appendChild(bar);
    });
    const latest = state.history[0];
    const prior = state.history.find((entry, index) => index > 0 && entry.category === latest.category);
    const improving = prior ? Number(latest.score || 0) > Number(prior.score || 0) : false;
    dom.historyNote.textContent = prior
      ? `${CATEGORY_META[latest.category].short} is ${improving ? 'trending upward' : 'holding or slipping'} against its previous session. Marginal gains matter most in this program.`
      : 'Your first recent session sets the initial trend line. Re-run the same module to surface actual movement.';
  }

  function renderSnapshots() {
    const composite = normalizedOverallScore();
    const validatedCount = BOARDS.filter((board) => board !== 'overall' && state.records.domains[board]).length;
    const recentValidated = state.history.filter((entry) => entry.validated).slice(0, 6);
    const recentAvg = recentValidated.length ? average(recentValidated.map((entry) => Number(entry.score || 0))) : 0;
    const olderValidated = state.history.filter((entry) => entry.validated).slice(6, 12);
    const olderAvg = olderValidated.length ? average(olderValidated.map((entry) => Number(entry.score || 0))) : recentAvg;
    const trendLabel = recentValidated.length < 2 ? 'Early' : recentAvg > olderAvg + 1 ? 'Up' : recentAvg < olderAvg - 1 ? 'Down' : 'Flat';

    let weakest = 'Reaction';
    let weakestValue = Infinity;
    BOARDS.filter((board) => board !== 'overall').forEach((board) => {
      const value = Number(state.records.domains[board]?.normalizedScore || 0);
      if ((value || 0) < weakestValue) {
        weakestValue = value || 0;
        weakest = CATEGORY_META[board].short;
      }
    });

    dom.snapshotComposite.textContent = String(round(composite, 1));
    dom.snapshotValidated.textContent = String(validatedCount);
    dom.snapshotTrend.textContent = trendLabel;
    dom.snapshotFocus.textContent = weakest;
  }

  function renderAll(summary = null) {
    renderSelectionButtons();
    renderBriefing();
    renderMetricsFromIdle();
    renderResults(summary);
    renderLeaderboard();
    renderHistory();
    renderSnapshots();
  }

  function selectCategory(category) {
    if (state.activeSession || !CATEGORY_META[category]) return;
    state.selection.category = category;
    saveSettings();
    renderAll();
    setOverlay(`${CATEGORY_META[category].label}`, CATEGORY_META[category].description, true);
    setFeedback('Session ready', 'Review the drill, then launch the next evaluation.');
  }

  function selectVariant(variant) {
    if (state.activeSession || !selectedCategoryMeta().variants[variant]) return;
    state.selection.variant = variant;
    saveSettings();
    renderAll();
  }

  function selectRange(range) {
    state.selection.range = range;
    saveSettings();
    renderLeaderboard();
  }

  function selectBoard(board) {
    state.selection.board = board;
    saveSettings();
    renderLeaderboard();
  }

  function buildSessionBase() {
    const category = state.selection.category;
    const meta = CATEGORY_META[category];
    const config = selectedConfig();
    return {
      category,
      variant: state.selection.variant,
      variantLabel: config.label,
      config,
      meta,
      startedAt: performance.now(),
      player: getCurrentPlayerName(),
      live: true,
    };
  }

  function startSession() {
    if (state.activeSession) return;
    clearTimers();
    const category = state.selection.category;
    setOverlay(`${CATEGORY_META[category].label}`, 'Execution live. Follow the module instructions and respond cleanly.', false);
    setSessionState('Live');
    setFeedback('Execution live', 'Immediate feedback updates after each action. Stay disciplined under pressure.');
    if (category === 'reaction') {
      beginReactionSession();
    } else if (category === 'memory') {
      beginMemorySession();
    } else if (category === 'awareness') {
      beginAwarenessSession();
    } else if (category === 'decision') {
      beginDecisionSession();
    } else {
      beginConsistencySession();
    }
    renderSelectionButtons();
    renderBriefing();
  }

  function finishSession(summary) {
    clearTimers();
    state.activeSession = null;
    const previous = state.history.find((entry) => entry.validated && entry.category === summary.category);
    const lowerIsBetter = summary.category === 'reaction';
    summary.trendLabel = buildTrendLabel(previous?.metricBasis, summary.scoreEquivalent, lowerIsBetter);
    summary.trendSentence = summary.trendLabel.toLowerCase();
    summary.analysis = buildAnalysis(summary);
    updateHistory(summary);
    updateRecords(summary);
    if (summary.validated) {
      addLeaderboardEntry(summary.category, summary.boardEntry);
      updateOverallBoard();
    }
    setSessionState(summary.validated ? 'Validated' : 'Complete');
    setFeedback('Session complete', summary.validated ? 'Validated result stored in the competitive boards.' : 'Session stored locally as training analysis only.');
    setOverlay(`${summary.meta.label} complete`, summary.validated ? 'Validated run recorded. Review the analysis and compare against the board.' : 'Baseline or unvalidated run complete. Use the analysis to sharpen the next attempt.', true);
    renderAll(summary);
  }

  function beginReactionSession() {
    const config = selectedConfig();
    const session = buildSessionBase();
    session.inputs = REACTION_INPUTS.slice(0, config.inputs);
    session.phase = 'waiting';
    session.rep = 0;
    session.correct = 0;
    session.totalStimuli = 0;
    session.falseStarts = 0;
    session.errors = 0;
    session.timeouts = 0;
    session.reactions = [];
    session.currentExpected = null;
    session.liveAt = 0;
    session.awaitingResponse = false;
    state.activeSession = session;

    showStage('reaction');
    dom.reactionResponses.innerHTML = session.inputs.map((input) => `
      <button type="button" data-reaction-key="${input.key}">
        <strong>${input.short}</strong>
        <span>${input.cue}</span>
      </button>
    `).join('');
    dom.reactionSignal.className = 'reaction-signal';
    dom.reactionSignal.textContent = 'ARMED';

    updateReactionMetrics();
    queueTimeout(queueReactionTrial, 900);
  }

  function queueReactionTrial() {
    const session = state.activeSession;
    if (!session || session.category !== 'reaction') return;
    clearTimers();
    if (session.rep >= session.config.reps) {
      completeReactionSession();
      return;
    }
    session.phase = 'waiting';
    session.awaitingResponse = false;
    session.currentExpected = null;
    dom.reactionSignal.className = 'reaction-signal';
    dom.reactionSignal.textContent = 'WAIT';
    setFeedback('Awaiting signal', 'Do not jump early. False starts damage the run immediately.');
    updateReactionMetrics();
    queueTimeout(showReactionSignal, randomBetween(session.config.delayMin, session.config.delayMax));
  }

  function showReactionSignal() {
    const session = state.activeSession;
    if (!session || session.category !== 'reaction') return;
    clearTimers();
    const decoy = Math.random() < session.config.decoyChance;
    session.totalStimuli += 1;
    session.awaitingResponse = true;
    session.liveAt = performance.now();
    session.phase = decoy ? 'decoy' : 'live';

    if (decoy) {
      session.currentExpected = null;
      dom.reactionSignal.className = 'reaction-signal state-decoy';
      dom.reactionSignal.textContent = 'HOLD';
      setFeedback('Decoy signal', 'Do not react. Overreaction is penalized harder than patience.');
    } else {
      const expected = session.inputs[randomInt(0, session.inputs.length - 1)];
      session.currentExpected = expected;
      dom.reactionSignal.className = 'reaction-signal state-live';
      dom.reactionSignal.textContent = expected.cue;
      setFeedback('Live cue', `Respond with ${expected.short} for ${expected.cue}.`);
    }

    updateReactionMetrics();
    queueTimeout(() => {
      const active = state.activeSession;
      if (!active || active.category !== 'reaction' || !active.awaitingResponse) return;
      active.awaitingResponse = false;
      active.rep += 1;
      if (active.currentExpected) {
        active.errors += 1;
        active.timeouts += 1;
        setFeedback('Missed window', 'The live cue timed out before a clean response arrived.');
      } else {
        setFeedback('Decoy cleared', 'Discipline held. Safe ignore recorded.');
      }
      queueTimeout(queueReactionTrial, 420);
    }, session.config.responseWindow);
  }

  function handleReactionInput(key) {
    const session = state.activeSession;
    if (!session || session.category !== 'reaction') return false;

    const mapped = session.inputs.find((input) => input.key === key);
    if (!mapped) return false;

    if (session.phase === 'waiting') {
      clearTimers();
      session.falseStarts += 1;
      setFeedback('False start', 'You moved before the signal went live. Reset and stay patient.');
      queueReactionTrial();
      return true;
    }

    if (!session.awaitingResponse) return true;

    session.awaitingResponse = false;
    clearTimers();
    session.rep += 1;
    if (!session.currentExpected) {
      session.errors += 1;
      setFeedback('Decoy hit', 'That was a hold signal. Overreaction costs accuracy immediately.');
      queueTimeout(queueReactionTrial, 420);
      updateReactionMetrics();
      return true;
    }

    if (mapped.key === session.currentExpected.key) {
      const reaction = performance.now() - session.liveAt;
      session.correct += 1;
      session.reactions.push(reaction);
      setFeedback('Clean response', `${formatMs(reaction)} response recorded.`);
    } else {
      session.errors += 1;
      setFeedback('Wrong mapping', `Incorrect lane. Expected ${session.currentExpected.short}.`);
    }
    updateReactionMetrics();
    queueTimeout(queueReactionTrial, 420);
    return true;
  }

  function updateReactionMetrics() {
    const session = state.activeSession;
    if (!session) return;
    const accuracy = session.totalStimuli > 0 ? (session.correct / session.totalStimuli) * 100 : 0;
    setMetricCardLabels(
      ['Average', 'Accuracy', 'Pressure', 'Session'],
      [
        session.reactions.length ? formatMs(average(session.reactions)) : '--',
        formatPercent(accuracy),
        `${session.config.inputs} lanes`,
        `${session.rep}/${session.config.reps}`,
      ],
    );
  }

  function completeReactionSession() {
    const session = state.activeSession;
    if (!session) return;
    const avgReaction = session.reactions.length ? average(session.reactions) : session.config.responseWindow;
    const fastest = session.reactions.length ? Math.min(...session.reactions) : session.config.responseWindow;
    const accuracy = session.totalStimuli > 0 ? (session.correct / session.totalStimuli) * 100 : 0;
    const validated = session.config.leaderboardEligible && accuracy >= (session.variant === 'evaluation' ? 84 : 80) && session.falseStarts <= Math.ceil(session.config.reps * 0.25);
    const normalized = clamp(((1000 - avgReaction) * 0.11) + (accuracy * 0.54) - (session.falseStarts * 3.5) - (session.errors * 1.8), 0, 100);
    const summary = {
      ...session,
      avgReaction,
      fastest,
      accuracy,
      falseStarts: session.falseStarts,
      normalizedScore: round(normalized, 1),
      competitiveScore: round(normalized, 1),
      scoreEquivalent: avgReaction,
      validated,
      supportText: `${formatMs(avgReaction)} • ${formatPercent(accuracy)}`,
      boardEntry: {
        player: session.player,
        avgReaction: round(avgReaction, 1),
        fastest: round(fastest, 1),
        accuracy: round(accuracy, 1),
        falseStarts: session.falseStarts,
        variant: session.variant,
        timestamp: Date.now(),
      },
    };
    finishSession(summary);
  }

  function beginMemorySession() {
    const session = buildSessionBase();
    session.round = 0;
    session.correctTokens = 0;
    session.totalTokens = 0;
    session.perfectRounds = 0;
    session.maxSequence = 0;
    session.recallTimes = [];
    session.currentSequence = [];
    session.recallInput = [];
    state.activeSession = session;

    showStage('memory');
    dom.memoryActions.innerHTML = TOKEN_POOL.map((token) => `
      <button type="button" data-memory-token="${token.id}">
        <strong>${token.label}</strong>
        <span>Input call</span>
      </button>
    `).join('');
    updateMemoryMetrics();
    queueTimeout(runMemoryRound, 700);
  }

  function buildSequenceRibbon(length) {
    dom.sequenceRibbon.innerHTML = Array.from({ length }, (_, index) => `<div class="sequence-token" data-sequence-slot="${index}">--</div>`).join('');
  }

  function runMemoryRound() {
    const session = state.activeSession;
    if (!session || session.category !== 'memory') return;
    if (session.round >= session.config.rounds) {
      completeMemorySession();
      return;
    }

    session.currentSequence = sample(TOKEN_POOL, session.config.length);
    session.recallInput = [];
    session.round += 1;
    buildSequenceRibbon(session.currentSequence.length);
    dom.memoryPrompt.textContent = `Observe sequence ${session.round}/${session.config.rounds}.`;
    setFeedback('Sequence exposure', 'Store the order exactly. Competitive ranking values full ordered recall.');

    let cursor = 0;
    const showNext = () => {
      if (!state.activeSession || state.activeSession !== session) return;
      const slots = Array.from(dom.sequenceRibbon.querySelectorAll('.sequence-token'));
      slots.forEach((slot) => slot.classList.remove('active'));
      if (cursor >= session.currentSequence.length) {
        dom.memoryPrompt.textContent = session.config.interference ? 'Interference task incoming.' : 'Reconstruct the sequence now.';
        if (session.config.interference) {
          startMemoryInterference();
        } else {
          beginMemoryRecall();
        }
        return;
      }
      const token = session.currentSequence[cursor];
      const slot = slots[cursor];
      if (slot) {
        slot.textContent = token.label;
        slot.classList.add('active');
      }
      cursor += 1;
      queueTimeout(showNext, session.config.flashMs);
    };

    queueTimeout(showNext, 300);
  }

  function startMemoryInterference() {
    const session = state.activeSession;
    if (!session || session.category !== 'memory') return;
    const interference = Math.random() < 0.5
      ? { prompt: 'Track temp 29C. Is grip expected to rise? Press Y or N.', answer: 'y' }
      : { prompt: 'Fuel delta is negative. Is that a gain? Press Y or N.', answer: 'n' };
    session.interferenceAnswer = interference.answer;
    session.phase = 'interference';
    dom.memoryPrompt.textContent = interference.prompt;
    setFeedback('Interference layer', 'Resolve the noise quickly, then rebuild the stored sequence.');
    queueTimeout(() => {
      if (state.activeSession === session && session.phase === 'interference') {
        beginMemoryRecall();
      }
    }, 1800);
  }

  function beginMemoryRecall() {
    const session = state.activeSession;
    if (!session || session.category !== 'memory') return;
    session.phase = 'recall';
    session.recallStartedAt = performance.now();
    const slots = Array.from(dom.sequenceRibbon.querySelectorAll('.sequence-token'));
    slots.forEach((slot) => {
      slot.classList.remove('active');
      slot.textContent = '--';
    });
    dom.memoryPrompt.textContent = 'Re-enter the sequence in order.';
    setFeedback('Recall live', 'Input the sequence as cleanly and quickly as possible.');
    queueTimeout(() => {
      if (state.activeSession === session && session.phase === 'recall') {
        scoreMemoryRound();
      }
    }, session.config.recallWindow);
  }

  function handleMemoryInterferenceAnswer(key) {
    const session = state.activeSession;
    if (!session || session.category !== 'memory' || session.phase !== 'interference') return false;
    if (key === 'y' || key === 'n') {
      setFeedback(key === session.interferenceAnswer ? 'Interference cleared' : 'Interference mistake', 'Memory recall is still next. Reset your focus quickly.');
      beginMemoryRecall();
      return true;
    }
    return false;
  }

  function handleMemoryToken(tokenId) {
    const session = state.activeSession;
    if (!session || session.category !== 'memory' || session.phase !== 'recall') return false;
    if (session.recallInput.length >= session.currentSequence.length) return true;
    session.recallInput.push(tokenId);
    const slot = dom.sequenceRibbon.querySelector(`[data-sequence-slot="${session.recallInput.length - 1}"]`);
    const token = TOKEN_POOL.find((entry) => entry.id === tokenId);
    if (slot && token) slot.textContent = token.label;
    if (session.recallInput.length >= session.currentSequence.length) {
      scoreMemoryRound();
    }
    return true;
  }

  function scoreMemoryRound() {
    const session = state.activeSession;
    if (!session || session.category !== 'memory') return;
    session.phase = 'scored';
    const expected = session.currentSequence.map((token) => token.id);
    const correct = session.recallInput.reduce((sum, tokenId, index) => sum + (tokenId === expected[index] ? 1 : 0), 0);
    const perfect = correct === expected.length;
    session.correctTokens += correct;
    session.totalTokens += expected.length;
    session.maxSequence = Math.max(session.maxSequence, correct);
    if (perfect) session.perfectRounds += 1;
    session.recallTimes.push(performance.now() - session.recallStartedAt);
    setFeedback(perfect ? 'Perfect recall' : 'Recall logged', `${correct}/${expected.length} calls reconstructed in order.`);
    updateMemoryMetrics();
    queueTimeout(runMemoryRound, 900);
  }

  function updateMemoryMetrics() {
    const session = state.activeSession;
    if (!session) return;
    const accuracy = session.totalTokens > 0 ? (session.correctTokens / session.totalTokens) * 100 : 0;
    setMetricCardLabels(
      ['Sequence', 'Accuracy', 'Recall', 'Session'],
      [
        String(session.maxSequence || session.config.length),
        formatPercent(accuracy),
        session.recallTimes.length ? formatMs(average(session.recallTimes)) : '--',
        `${session.round}/${session.config.rounds}`,
      ],
    );
  }

  function completeMemorySession() {
    const session = state.activeSession;
    if (!session) return;
    const accuracy = session.totalTokens > 0 ? (session.correctTokens / session.totalTokens) * 100 : 0;
    const avgRecallMs = session.recallTimes.length ? average(session.recallTimes) : session.config.recallWindow;
    const validated = session.config.leaderboardEligible && session.perfectRounds >= 1 && accuracy >= 70;
    const normalized = clamp((session.maxSequence * 10.5) + (accuracy * 0.48) + ((9000 - avgRecallMs) * 0.003), 0, 100);
    const summary = {
      ...session,
      accuracy,
      avgRecallMs,
      normalizedScore: round(normalized, 1),
      competitiveScore: round((session.maxSequence * 10) + (accuracy * 0.35), 1),
      scoreEquivalent: session.maxSequence + (accuracy / 100),
      validated,
      supportText: `${session.maxSequence} max • ${formatPercent(accuracy)}`,
      boardEntry: {
        player: session.player,
        maxSequence: session.maxSequence,
        accuracy: round(accuracy, 1),
        recallMs: round(avgRecallMs, 1),
        variant: session.variant,
        timestamp: Date.now(),
      },
    };
    finishSession(summary);
  }

  function beginAwarenessSession() {
    const session = buildSessionBase();
    session.correctCritical = 0;
    session.missedCritical = 0;
    session.falsePositives = 0;
    session.reactions = [];
    session.phase = 'scan';
    session.tiles = Array.from({ length: session.config.tiles }, (_, index) => ({
      label: TELEMETRY_LABELS[index],
      value: `${randomInt(10, 99)}`,
      alert: '',
    }));
    session.activeAlert = null;
    session.endsAt = performance.now() + session.config.duration;
    state.activeSession = session;

    showStage('awareness');
    renderTelemetryTiles();
    updateAwarenessMetrics();
    setFeedback('Telemetry scan live', 'Monitor everything, but only act on true critical calls.');

    state.telemetryTickId = window.setInterval(() => {
      const active = state.activeSession;
      if (!active || active.category !== 'awareness') return;
      active.tiles.forEach((tile) => {
        tile.value = `${randomInt(12, 98)}`;
      });
      renderTelemetryTiles();
    }, 320);

    queueAwarenessEvent();
    startAwarenessClock();
  }

  function renderTelemetryTiles() {
    const session = state.activeSession;
    if (!session || session.category !== 'awareness') return;
    dom.telemetryGrid.innerHTML = session.tiles.map((tile, index) => `
      <div class="telemetry-tile ${tile.alert || ''}">
        <small>${tile.label}</small>
        <strong>${tile.value}</strong>
        <span>${tile.alert === 'alert-critical' ? 'Critical action required' : tile.alert === 'alert-decoy' ? 'Advisory only' : 'Nominal stream'}</span>
      </div>
    `).join('');
  }

  function queueAwarenessEvent() {
    const session = state.activeSession;
    if (!session || session.category !== 'awareness') return;
    const delay = randomBetween(session.config.minGap, session.config.maxGap);
    queueTimeout(showAwarenessEvent, delay);
  }

  function showAwarenessEvent() {
    const session = state.activeSession;
    if (!session || session.category !== 'awareness') return;
    if (performance.now() >= session.endsAt) {
      completeAwarenessSession();
      return;
    }

    const tileIndex = randomInt(0, session.tiles.length - 1);
    const critical = Math.random() < session.config.criticalChance;
    session.tiles.forEach((tile) => { tile.alert = ''; });
    session.activeAlert = {
      critical,
      expectedAction: critical ? 'ack' : null,
      shownAt: performance.now(),
      resolved: false,
    };
    session.tiles[tileIndex].alert = critical ? 'alert-critical' : 'alert-decoy';
    renderTelemetryTiles();
    setFeedback(critical ? 'Critical alert' : 'Advisory noise', critical ? 'Acknowledge the red critical call quickly.' : 'Hold input. This is not an action trigger.');
    updateAwarenessMetrics();

    queueTimeout(() => {
      const active = state.activeSession;
      if (!active || active.category !== 'awareness' || !active.activeAlert || active.activeAlert.resolved) return;
      if (active.activeAlert.critical) {
        active.missedCritical += 1;
        setFeedback('Missed critical', 'The window closed before the correct action.');
      } else {
        setFeedback('Advisory cleared', 'Good selectivity. No action was required.');
      }
      active.activeAlert = null;
      active.tiles.forEach((tile) => { tile.alert = ''; });
      renderTelemetryTiles();
      updateAwarenessMetrics();
      queueAwarenessEvent();
    }, session.config.responseWindow);
  }

  function handleAwarenessAction(action) {
    const session = state.activeSession;
    if (!session || session.category !== 'awareness') return false;
    if (!session.activeAlert) {
      session.falsePositives += 1;
      setFeedback('Unprompted action', 'No critical call was active. Stay selective.');
      updateAwarenessMetrics();
      return true;
    }
    if (session.activeAlert.resolved) return true;

    session.activeAlert.resolved = true;
    const reaction = performance.now() - session.activeAlert.shownAt;
    if (session.activeAlert.critical && action === session.activeAlert.expectedAction) {
      session.correctCritical += 1;
      session.reactions.push(reaction);
      setFeedback('Critical handled', `${formatMs(reaction)} response with the correct action.`);
    } else {
      session.falsePositives += 1;
      if (session.activeAlert.critical) {
        setFeedback('Wrong action', 'A critical alert was active, but the response logic was incorrect.');
      } else {
        setFeedback('Overreaction', 'That was advisory noise and did not need action.');
      }
    }
    session.activeAlert = null;
    session.tiles.forEach((tile) => { tile.alert = ''; });
    renderTelemetryTiles();
    updateAwarenessMetrics();
    queueAwarenessEvent();
    return true;
  }

  function startAwarenessClock() {
    const tick = () => {
      const session = state.activeSession;
      if (!session || session.category !== 'awareness') return;
      updateAwarenessMetrics();
      if (performance.now() >= session.endsAt) {
        completeAwarenessSession();
        return;
      }
      state.rafId = requestAnimationFrame(tick);
    };
    state.rafId = requestAnimationFrame(tick);
  }

  function updateAwarenessMetrics() {
    const session = state.activeSession;
    if (!session) return;
    const seen = session.correctCritical + session.missedCritical;
    const rate = seen > 0 ? (session.correctCritical / seen) * 100 : 100;
    const timeLeft = Math.max(0, session.endsAt - performance.now());
    setMetricCardLabels(
      ['Correct', 'False+', 'Window', 'Session'],
      [
        formatPercent(rate),
        String(session.falsePositives),
        `${session.config.responseWindow}ms`,
        `${round(timeLeft / 1000, 1)}s`,
      ],
    );
  }

  function completeAwarenessSession() {
    const session = state.activeSession;
    if (!session) return;
    const seen = session.correctCritical + session.missedCritical;
    const correctRate = seen > 0 ? (session.correctCritical / seen) * 100 : 0;
    const avgReaction = session.reactions.length ? average(session.reactions) : session.config.responseWindow;
    const validated = session.config.leaderboardEligible && correctRate >= 78 && session.falsePositives <= 4;
    const normalized = clamp((correctRate * 0.72) + ((1400 - avgReaction) * 0.025) - (session.falsePositives * 4.8) - (session.missedCritical * 2.4), 0, 100);
    const summary = {
      ...session,
      correctRate,
      avgReaction,
      normalizedScore: round(normalized, 1),
      competitiveScore: round(normalized, 1),
      scoreEquivalent: normalized,
      validated,
      supportText: `${formatPercent(correctRate)} • ${session.falsePositives} false+`,
      boardEntry: {
        player: session.player,
        correctRate: round(correctRate, 1),
        falsePositives: session.falsePositives,
        avgReaction: round(avgReaction, 1),
        variant: session.variant,
        timestamp: Date.now(),
      },
    };
    finishSession(summary);
  }

  function beginDecisionSession() {
    const session = buildSessionBase();
    session.round = 0;
    session.totalQuality = 0;
    session.bestPossible = 0;
    session.riskValues = [];
    session.decisionTimes = [];
    session.timeouts = 0;
    session.pool = sample(DECISION_SCENARIOS, session.config.rounds);
    state.activeSession = session;
    showStage('decision');
    updateDecisionMetrics();
    queueTimeout(showDecisionScenario, 500);
  }

  function showDecisionScenario() {
    const session = state.activeSession;
    if (!session || session.category !== 'decision') return;
    if (session.round >= session.pool.length) {
      completeDecisionSession();
      return;
    }
    session.currentScenario = session.pool[session.round];
    session.round += 1;
    session.phase = 'decision-live';
    session.promptShownAt = performance.now();
    session.bestPossible += Math.max(...session.currentScenario.options.map((option) => option.score));
    dom.decisionLabel.textContent = `Scenario ${session.round}/${session.pool.length}`;
    dom.decisionQuestion.textContent = session.currentScenario.title;
    dom.decisionCopy.textContent = session.currentScenario.copy;
    dom.decisionOptions.innerHTML = session.currentScenario.options.map((option, index) => `
      <button type="button" data-decision-index="${index}">
        <strong>${option.label}</strong>
        <span>${option.detail}</span>
      </button>
    `).join('');
    setFeedback('Decision window open', 'Choose the most logical option before the window closes.');
    updateDecisionMetrics();
    queueTimeout(() => {
      const active = state.activeSession;
      if (!active || active.category !== 'decision' || active.phase !== 'decision-live') return;
      active.timeouts += 1;
      setFeedback('Decision timeout', 'The scenario closed before a committed answer was made.');
      active.phase = 'decision-scored';
      queueTimeout(showDecisionScenario, 650);
    }, session.config.timeLimit);
  }

  function handleDecisionChoice(index) {
    const session = state.activeSession;
    if (!session || session.category !== 'decision' || session.phase !== 'decision-live') return false;
    const option = session.currentScenario?.options?.[index];
    if (!option) return false;
    session.phase = 'decision-scored';
    session.totalQuality += option.score;
    session.riskValues.push(100 - option.risk);
    session.decisionTimes.push(performance.now() - session.promptShownAt);
    setFeedback('Decision logged', `${option.label} selected with ${option.score} quality.`);
    updateDecisionMetrics();
    queueTimeout(showDecisionScenario, 650);
    return true;
  }

  function updateDecisionMetrics() {
    const session = state.activeSession;
    if (!session) return;
    const quality = session.bestPossible > 0 ? (session.totalQuality / session.bestPossible) * 100 : 0;
    const avgDecisionMs = session.decisionTimes.length ? average(session.decisionTimes) : 0;
    const riskEfficiency = session.riskValues.length ? average(session.riskValues) : 0;
    setMetricCardLabels(
      ['Quality', 'Avg time', 'Risk', 'Session'],
      [
        formatPercent(quality),
        avgDecisionMs ? formatMs(avgDecisionMs) : '--',
        riskEfficiency ? formatPercent(riskEfficiency) : '--',
        `${session.round}/${session.config.rounds}`,
      ],
    );
  }

  function completeDecisionSession() {
    const session = state.activeSession;
    if (!session) return;
    const quality = session.bestPossible > 0 ? (session.totalQuality / session.bestPossible) * 100 : 0;
    const avgDecisionMs = session.decisionTimes.length ? average(session.decisionTimes) : session.config.timeLimit;
    const riskEfficiency = session.riskValues.length ? average(session.riskValues) : 0;
    const validated = session.config.leaderboardEligible && quality >= 72 && session.timeouts <= 1;
    const normalized = clamp((quality * 0.7) + (riskEfficiency * 0.25) + ((session.config.timeLimit - avgDecisionMs) * 0.006), 0, 100);
    const summary = {
      ...session,
      quality,
      avgDecisionMs,
      riskEfficiency,
      normalizedScore: round(normalized, 1),
      competitiveScore: round(normalized, 1),
      scoreEquivalent: normalized,
      validated,
      supportText: `${formatPercent(quality)} • ${formatMs(avgDecisionMs)}`,
      boardEntry: {
        player: session.player,
        quality: round(quality, 1),
        avgDecisionMs: round(avgDecisionMs, 1),
        riskEfficiency: round(riskEfficiency, 1),
        variant: session.variant,
        timestamp: Date.now(),
      },
    };
    finishSession(summary);
  }

  function beginConsistencySession() {
    const session = buildSessionBase();
    session.attempt = 0;
    session.hits = 0;
    session.offsets = [];
    session.blockScores = [];
    session.progress = 0.5;
    session.direction = 1;
    session.readyForPress = true;
    session.speed = session.config.speed;
    session.windowPct = session.config.windowPct;
    session.lastAt = performance.now();
    state.activeSession = session;
    showStage('consistency');
    positionConsistencyWindow();
    updateConsistencyMetrics();
    setFeedback('Consistency live', 'Hit inside the target window repeatedly. Stability matters more than a single perfect tap.');
    startConsistencyLoop();
  }

  function positionConsistencyWindow() {
    const session = state.activeSession;
    if (!session || session.category !== 'consistency') return;
    const left = clamp(randomBetween(18, 70), 10, 78);
    dom.targetWindow.style.left = `${left}%`;
    dom.targetWindow.style.width = `${session.windowPct * 100}%`;
    session.windowCenter = left + (session.windowPct * 50);
  }

  function startConsistencyLoop() {
    const loop = (now) => {
      const session = state.activeSession;
      if (!session || session.category !== 'consistency') return;
      const delta = (now - session.lastAt) / 1000;
      session.lastAt = now;
      session.progress += delta * session.speed * session.direction;
      if (session.progress >= 0.98 || session.progress <= 0.02) {
        if (session.readyForPress) {
          session.attempt += 1;
          session.blockScores.push(0);
        }
        if (session.attempt >= session.config.attempts) {
          completeConsistencySession();
          return;
        }
        session.progress = clamp(session.progress, 0.02, 0.98);
        session.direction *= -1;
        session.speed += session.config.ramp;
        session.readyForPress = true;
        positionConsistencyWindow();
        if (session.config.distractions && session.attempt > 0 && session.attempt % 6 === 0) {
          setFeedback('Distraction layer', 'Ignore the extra motion and keep the same timing standard.');
        }
        updateConsistencyMetrics();
      }
      dom.sweepMarker.style.left = `${session.progress * 100}%`;
      state.rafId = requestAnimationFrame(loop);
    };
    state.rafId = requestAnimationFrame(loop);
  }

  function handleConsistencyPress() {
    const session = state.activeSession;
    if (!session || session.category !== 'consistency' || !session.readyForPress) return false;
    session.readyForPress = false;
    session.attempt += 1;
    const positionPct = session.progress * 100;
    const offset = Math.abs(positionPct - session.windowCenter);
    const hit = offset <= (session.windowPct * 50);
    if (hit) {
      session.hits += 1;
      session.offsets.push(offset);
      session.blockScores.push(Math.max(0, 100 - (offset / Math.max(0.01, session.windowPct * 50)) * 100));
      setFeedback('Stable hit', `${round(offset, 1)} deviation from the target center.`);
    } else {
      session.offsets.push(session.windowPct * 60);
      session.blockScores.push(0);
      setFeedback('Missed timing', 'That press fell outside the target window.');
    }
    session.speed += session.config.ramp;
    positionConsistencyWindow();
    updateConsistencyMetrics();
    if (session.attempt >= session.config.attempts) {
      completeConsistencySession();
      return true;
    }
    return true;
  }

  function updateConsistencyMetrics() {
    const session = state.activeSession;
    if (!session) return;
    const varianceValue = session.offsets.length ? variance(session.offsets) : 0;
    const hitRate = session.attempt > 0 ? (session.hits / session.attempt) * 100 : 0;
    const early = session.blockScores.slice(0, Math.ceil(session.blockScores.length / 2));
    const late = session.blockScores.slice(Math.ceil(session.blockScores.length / 2));
    const dropoff = early.length && late.length ? Math.max(0, average(early) - average(late)) : 0;
    const indexScore = clamp((hitRate * 0.74) + Math.max(0, 28 - varianceValue) - (dropoff * 0.7), 0, 100);
    setMetricCardLabels(
      ['Index', 'Variance', 'Drop-off', 'Session'],
      [
        formatPercent(indexScore),
        String(round(varianceValue, 1)),
        formatPercent(dropoff),
        `${session.attempt}/${session.config.attempts}`,
      ],
    );
  }

  function completeConsistencySession() {
    const session = state.activeSession;
    if (!session) return;
    const varianceValue = session.offsets.length ? variance(session.offsets) : 0;
    const hitRate = session.attempt > 0 ? (session.hits / session.attempt) * 100 : 0;
    const early = session.blockScores.slice(0, Math.ceil(session.blockScores.length / 2));
    const late = session.blockScores.slice(Math.ceil(session.blockScores.length / 2));
    const dropoff = early.length && late.length ? Math.max(0, average(early) - average(late)) : 0;
    const indexScore = clamp((hitRate * 0.74) + Math.max(0, 28 - varianceValue) - (dropoff * 0.7), 0, 100);
    const validated = session.config.leaderboardEligible && hitRate >= 62 && varianceValue <= 26;
    const summary = {
      ...session,
      variance: varianceValue,
      hitRate,
      dropoff,
      indexScore,
      normalizedScore: round(indexScore, 1),
      competitiveScore: round(indexScore, 1),
      scoreEquivalent: indexScore,
      validated,
      supportText: `${formatPercent(indexScore)} • ${round(varianceValue, 1)} var`,
      boardEntry: {
        player: session.player,
        indexScore: round(indexScore, 1),
        variance: round(varianceValue, 1),
        dropoff: round(dropoff, 1),
        variant: session.variant,
        timestamp: Date.now(),
      },
    };
    finishSession(summary);
  }

  function handleGlobalKeydown(event) {
    const key = String(event.key || '').toLowerCase();
    if (!state.activeSession) {
      if (key === 'enter') {
        event.preventDefault();
        startSession();
      }
      return;
    }

    let handled = false;
    handled = handleReactionInput(key) || handled;
    handled = handleMemoryInterferenceAnswer(key) || handled;
    if ((key === ' ' || key === 'spacebar') && state.activeSession?.category === 'consistency') {
      handled = handleConsistencyPress() || handled;
    }
    if (key === 'a' && state.activeSession?.category === 'awareness') {
      handled = handleAwarenessAction('ack') || handled;
    }
    if (key === 'h' && state.activeSession?.category === 'awareness') {
      handled = handleAwarenessAction('hold') || handled;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  function bindEvents() {
    dom.categoryButtons.forEach((button) => {
      button.addEventListener('click', () => selectCategory(button.dataset.category));
    });
    dom.variantButtons.forEach((button) => {
      button.addEventListener('click', () => selectVariant(button.dataset.variant));
    });
    dom.rangeButtons.forEach((button) => {
      button.addEventListener('click', () => selectRange(button.dataset.range));
    });
    dom.boardButtons.forEach((button) => {
      button.addEventListener('click', () => selectBoard(button.dataset.board));
    });
    dom.startBtn.addEventListener('click', startSession);
    dom.retryBtn.addEventListener('click', () => {
      if (state.activeSession) return;
      startSession();
    });

    dom.reactionResponses.addEventListener('click', (event) => {
      const button = event.target.closest('[data-reaction-key]');
      if (!button) return;
      handleReactionInput(button.dataset.reactionKey);
    });

    dom.memoryActions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-memory-token]');
      if (!button) return;
      handleMemoryToken(button.dataset.memoryToken);
    });

    dom.awarenessActionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        handleAwarenessAction(button.dataset.awarenessAction);
      });
    });

    dom.decisionOptions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-decision-index]');
      if (!button) return;
      handleDecisionChoice(Number(button.dataset.decisionIndex));
    });

    dom.consistencyStage.addEventListener('pointerdown', () => {
      handleConsistencyPress();
    });

    window.addEventListener('keydown', handleGlobalKeydown);
  }

  function init() {
    bindEvents();
    hideAllStages();
    setOverlay('F1 Academy', 'Select a program, review the briefing, and start a structured motorsport-cognition session.', true);
    setFeedback('Session ready', 'Choose a module, review the briefing, and begin the next evaluation.');
    renderAll();
  }

  init();
})();
