(function () {
  const STORAGE_KEY = 'playr.typing-test.leaderboard.v1';
  const WEAK_KEY_STORAGE = 'playr.typing-test.weakKeys.v1';
  const SETTINGS_STORAGE = 'playr.typing-test.settings.v1';

  const DEFAULT_SETTINGS = {
    mode: 'standard',
    duration: 15,
    source: 'words',
    difficulty: 'mixed',
    punctuation: false,
    numbers: false,
    caseSensitive: false,
  };

  const MODE_META = {
    standard: {
      label: 'Standard',
      hint: 'Balanced speed + accuracy. This is the main test mode.',
      defaultDuration: 60,
      targetCount: 100,
      reaction: false,
    },
    accuracy: {
      label: 'Accuracy',
      hint: 'Mistakes should be corrected before you move on.',
      defaultDuration: 60,
      targetCount: 90,
      reaction: false,
    },
    burst: {
      label: 'Burst',
      hint: 'Short test windows for max-output typing.',
      defaultDuration: 15,
      targetCount: 55,
      reaction: false,
    },
    'weak-key': {
      label: 'Weak Key',
      hint: 'Reinforce the letters you miss most often.',
      defaultDuration: 60,
      targetCount: 110,
      reaction: false,
    },
    consistency: {
      label: 'Consistency',
      hint: 'Longer runs reward stable pace, not spikes.',
      defaultDuration: 120,
      targetCount: 150,
      reaction: false,
    },
    reaction: {
      label: 'Reaction',
      hint: 'Targets appear suddenly. Type the word before it fades.',
      defaultDuration: 15,
      targetCount: 1,
      reaction: true,
    },
  };

  const WORD_POOLS = {
    common: [
      'time', 'type', 'clean', 'focus', 'track', 'skill', 'press', 'sharp', 'speed', 'quick',
      'train', 'line', 'clear', 'light', 'flow', 'steady', 'press', 'stream', 'sound', 'stone',
      'level', 'score', 'brain', 'hands', 'shift', 'space', 'input', 'target', 'words', 'react',
    ],
    mixed: [
      'window', 'market', 'planet', 'signal', 'orchard', 'planet', 'silver', 'binary', 'ember', 'glimmer',
      'thread', 'vector', 'cursor', 'canvas', 'anchor', 'socket', 'pattern', 'glide', 'native', 'sturdy',
      'canvas', 'logic', 'pattern', 'socket', 'signal', 'rhythm', 'velvet', 'parade', 'rocket', 'stream',
    ],
    hard: [
      'threshold', 'paragraph', 'synchronize', 'grammar', 'precision', 'keyboard', 'network', 'quality', 'fracture', 'horizon',
      'stability', 'compound', 'velocity', 'sequence', 'adjustment', 'navigation', 'platform', 'perimeter', 'consonant', 'elastic',
    ],
    expert: [
      'inconsequential', 'intermediate', 'characterization', 'unpredictable', 'transcription', 'microstructure', 'phenomenon', 'disorientation', 'reconfiguration', 'multithreaded',
      'misalignment', 'comprehensive', 'hyperparameter', 'interdependence', 'synchronization', 'counterbalance', 'indistinguishable', 'approximation', 'thermodynamics', 'configuration',
    ],
  };

  const PUNCTUATION = [',', '.', ';', ':', '!', '?'];
  const SHARED_SENTENCE_ENDS = ['.', '!', '?'];

  const leaderboardSeed = [
    { player: 'Nova', wpm: 112.48, accuracy: 98.91, rawWpm: 115.22, errors: 4, consistency: 94.1, mode: 'standard', duration: 60, note: 'Baseline' },
    { player: 'Kite', wpm: 109.33, accuracy: 98.42, rawWpm: 111.08, errors: 5, consistency: 92.7, mode: 'consistency', duration: 120, note: 'Baseline' },
    { player: 'Milo', wpm: 104.12, accuracy: 97.84, rawWpm: 108.91, errors: 6, consistency: 90.3, mode: 'burst', duration: 15, note: 'Baseline' },
    { player: 'Aya', wpm: 99.77, accuracy: 99.13, rawWpm: 102.26, errors: 3, consistency: 95.4, mode: 'accuracy', duration: 60, note: 'Baseline' },
    { player: 'Juno', wpm: 96.44, accuracy: 98.66, rawWpm: 100.82, errors: 4, consistency: 91.8, mode: 'weak-key', duration: 60, note: 'Baseline' },
  ];

  const dom = {
    headlineWpm: document.getElementById('headlineWpm'),
    headlineAccuracy: document.getElementById('headlineAccuracy'),
    headlineRawWpm: document.getElementById('headlineRawWpm'),
    headlineMode: document.getElementById('headlineMode'),
    gameStatus: document.getElementById('gameStatus'),
    stageTitle: document.getElementById('stageTitle'),
    liveModeTag: document.getElementById('liveModeTag'),
    liveDurationTag: document.getElementById('liveDurationTag'),
    liveSourceTag: document.getElementById('liveSourceTag'),
    modeHint: document.getElementById('modeHint'),
    targetLabel: document.getElementById('targetLabel'),
    targetStream: document.getElementById('targetStream'),
    typingInput: document.getElementById('typingInput'),
    reactionTarget: document.getElementById('reactionTarget'),
    reactionWord: document.getElementById('reactionWord'),
    reactionPrompt: document.getElementById('reactionPrompt'),
    liveWpm: document.getElementById('liveWpm'),
    liveAccuracy: document.getElementById('liveAccuracy'),
    liveRawWpm: document.getElementById('liveRawWpm'),
    liveErrors: document.getElementById('liveErrors'),
    liveBackspaces: document.getElementById('liveBackspaces'),
    liveCombo: document.getElementById('liveCombo'),
    progressLabel: document.getElementById('progressLabel'),
    progressFill: document.getElementById('progressFill'),
    paceChart: document.getElementById('paceChart'),
    chartSummary: document.getElementById('chartSummary'),
    resultsCard: document.getElementById('resultsCard'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsBadge: document.getElementById('resultsBadge'),
    resultWpm: document.getElementById('resultWpm'),
    resultAccuracy: document.getElementById('resultAccuracy'),
    resultRawWpm: document.getElementById('resultRawWpm'),
    resultErrors: document.getElementById('resultErrors'),
    resultConsistency: document.getElementById('resultConsistency'),
    resultStreak: document.getElementById('resultStreak'),
    resultNote: document.getElementById('resultNote'),
    startBtn: document.getElementById('startBtn'),
    replayBtn: document.getElementById('replayBtn'),
    resetStatsBtn: document.getElementById('resetStatsBtn'),
    runAgainBtn: document.getElementById('runAgainBtn'),
    practiceBtn: document.getElementById('practiceBtn'),
    shareStatsBtn: document.getElementById('shareStatsBtn'),
    weakKeySummary: document.getElementById('weakKeySummary'),
    weakKeyList: document.getElementById('weakKeyList'),
    bestList: document.getElementById('bestList'),
    insightCopy: document.getElementById('insightCopy'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    typingStage: document.getElementById('typingStage'),
  };

  const state = {
    settings: loadSettings(),
    leaderboard: loadLeaderboard(),
    weakKeys: loadWeakKeys(),
    active: false,
    startTime: 0,
    endTime: 0,
    timerId: null,
    target: null,
    typedText: '',
    activeWordIndex: 0,
    keyCount: 0,
    correctCount: 0,
    wrongCount: 0,
    backspaces: 0,
    combo: 0,
    bestCombo: 0,
    samples: [],
    sampleStamp: 0,
    reactionStamp: 0,
    reactionActiveWord: '',
    reactionVisibleAt: 0,
    reactionTimeoutId: null,
    reactionTotalShown: 0,
    reactionTotalHits: 0,
    reactionMisses: 0,
    lastRun: null,
    lastSessionSummary: '',
  };

  function safeParse(raw, fallback) {
    try {
      const parsed = raw ? JSON.parse(raw) : fallback;
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function isOwner() {
    try {
      if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
        const user = window.PlayrAuth.getCurrentUser();
        if (String(user?.displayName || '').trim().toLowerCase() === 'owner') {
          return true;
        }
      }
    } catch {
      // ignore auth helper issues
    }

    try {
      const raw = localStorage.getItem('playrCurrentUser');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return String(parsed?.displayName || '').trim().toLowerCase() === 'owner';
    } catch {
      return false;
    }
  }

  function getCurrentDisplayName() {
    try {
      if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
        const user = window.PlayrAuth.getCurrentUser();
        if (user?.displayName) {
          return String(user.displayName).trim().slice(0, 24) || 'Guest';
        }
      }
    } catch {
      // ignore auth helper issues
    }

    try {
      const raw = localStorage.getItem('playrCurrentUser');
      if (!raw) return 'Guest';
      const parsed = JSON.parse(raw);
      return String(parsed?.displayName || 'Guest').trim().slice(0, 24) || 'Guest';
    } catch {
      return 'Guest';
    }
  }

  function loadSettings() {
    const parsed = safeParse(localStorage.getItem(SETTINGS_STORAGE), null);
    return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(state.settings));
  }

  function loadWeakKeys() {
    const parsed = safeParse(localStorage.getItem(WEAK_KEY_STORAGE), {});
    return parsed && typeof parsed === 'object' ? parsed : {};
  }

  function saveWeakKeys() {
    localStorage.setItem(WEAK_KEY_STORAGE, JSON.stringify(state.weakKeys));
  }

  function loadLeaderboard() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY), []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...leaderboardSeed];
  }

  function saveLeaderboard() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.leaderboard));
  }

  function normalizeChar(char) {
    if (char == null) return '';
    const value = String(char);
    if (!state.settings.caseSensitive && /^[a-z]$/i.test(value)) {
      return value.toLowerCase();
    }
    return value;
  }

  function isLetter(char) {
    return /^[a-z]$/i.test(String(char || ''));
  }

  function isPrintableKey(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    if (event.key === 'Backspace' || event.key === 'Tab' || event.key === 'Enter' || event.key === 'Escape') {
      return false;
    }
    return event.key.length === 1 || event.key === ' ';
  }

  function getModeMeta() {
    return MODE_META[state.settings.mode] || MODE_META.standard;
  }

  function getPoolForDifficulty() {
    if (state.settings.difficulty === 'common') {
      return [...WORD_POOLS.common, ...WORD_POOLS.mixed.slice(0, 10)];
    }
    if (state.settings.difficulty === 'hard') {
      return [...WORD_POOLS.mixed, ...WORD_POOLS.hard, ...WORD_POOLS.expert.slice(0, 8)];
    }
    if (state.settings.difficulty === 'expert') {
      return [...WORD_POOLS.hard, ...WORD_POOLS.expert];
    }
    return [...WORD_POOLS.common, ...WORD_POOLS.mixed, ...WORD_POOLS.hard.slice(0, 8)];
  }

  function getWeakLetters() {
    return Object.entries(state.weakKeys)
      .filter(([, count]) => Number(count) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 4)
      .map(([letter]) => letter);
  }

  function chooseWeightedWord(pool, weakLetters) {
    const sourcePool = pool.length > 0 ? pool : WORD_POOLS.common;
    const weakMatches = weakLetters.length > 0
      ? sourcePool.filter((word) => weakLetters.some((letter) => word.toLowerCase().includes(letter)))
      : [];
    if (weakMatches.length > 0 && Math.random() < 0.72) {
      return weakMatches[Math.floor(Math.random() * weakMatches.length)];
    }
    return sourcePool[Math.floor(Math.random() * sourcePool.length)];
  }

  function randomBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function decorateWord(word, settings, isSentenceEnd = false) {
    let result = String(word);

    if (settings.numbers && Math.random() < 0.08) {
      result = String(randomBetween(10, 999));
    }

    if (settings.caseSensitive) {
      const styleRoll = Math.random();
      if (styleRoll < 0.18) {
        result = result.toUpperCase();
      } else if (styleRoll < 0.42) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
      }
    } else if (Math.random() < 0.14) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    if (settings.punctuation) {
      if (isSentenceEnd) {
        result += SHARED_SENTENCE_ENDS[randomBetween(0, SHARED_SENTENCE_ENDS.length - 1)];
      } else if (Math.random() < 0.12) {
        result += PUNCTUATION[randomBetween(0, PUNCTUATION.length - 1)];
      }
    }

    return result;
  }

  function buildTokenChunk(tokenCount) {
    const tokens = [];
    const pool = getPoolForDifficulty();
    const weakLetters = state.settings.mode === 'weak-key' ? getWeakLetters() : [];
    let sentenceCountdown = state.settings.source === 'sentences' ? randomBetween(6, 10) : 0;

    for (let index = 0; index < tokenCount; index += 1) {
      const chosenWord = chooseWeightedWord(pool, weakLetters);
      const isSentenceEnd = state.settings.source === 'sentences' && sentenceCountdown <= 1;
      tokens.push(decorateWord(chosenWord, state.settings, isSentenceEnd));
      if (state.settings.source === 'sentences') {
        sentenceCountdown = isSentenceEnd ? randomBetween(6, 10) : sentenceCountdown - 1;
      }
    }

    return tokens;
  }

  function buildTokenPlan() {
    const modeMeta = getModeMeta();
    const baseCount = modeMeta.targetCount;
    const multiplier = state.settings.source === 'sentences' ? 0.8 : 1;
    const tokenCount = Math.max(18, Math.round(baseCount * multiplier));
    return buildTokenChunk(tokenCount);
  }

  function createWordNode(token, startIndex, index) {
    const word = document.createElement('span');
    word.className = 'word pending';
    word.dataset.index = String(index);
    word.dataset.start = String(startIndex);
    word.dataset.end = String(startIndex + token.length);

    for (let charIndex = 0; charIndex < token.length; charIndex += 1) {
      const char = document.createElement('span');
      char.className = 'char pending';
      char.textContent = token.charAt(charIndex);
      char.dataset.charIndex = String(charIndex);
      word.appendChild(char);
    }

    return word;
  }

  function buildTargetPlan() {
    const tokens = buildTokenPlan();
    const target = {
      tokens: [],
      words: [],
      ranges: [],
      fullText: '',
      nodeMap: [],
    };

    tokens.forEach((token) => {
      if (target.fullText.length > 0) {
        target.fullText += ' ';
      }
      const startIndex = target.fullText.length;
      target.fullText += token;
      const endIndex = target.fullText.length;
      const wordIndex = target.words.length;
      const node = createWordNode(token, startIndex, wordIndex);
      target.tokens.push(token);
      target.words.push(node);
      target.ranges.push({ start: startIndex, end: endIndex });
      for (let charIndex = 0; charIndex < token.length; charIndex += 1) {
        target.nodeMap[startIndex + charIndex] = { wordIndex, charIndex, char: token.charAt(charIndex) };
      }
    });

    return target;
  }

  function appendTargetChunk(tokenCount = 20) {
    if (!state.target) return;
    const chunk = buildTokenChunk(tokenCount);
    chunk.forEach((token) => {
      if (state.target.fullText.length > 0) {
        state.target.fullText += ' ';
      }
      const startIndex = state.target.fullText.length;
      state.target.fullText += token;
      const endIndex = state.target.fullText.length;
      const wordIndex = state.target.words.length;
      const node = createWordNode(token, startIndex, wordIndex);
      state.target.tokens.push(token);
      state.target.words.push(node);
      state.target.ranges.push({ start: startIndex, end: endIndex });
      for (let charIndex = 0; charIndex < token.length; charIndex += 1) {
        state.target.nodeMap[startIndex + charIndex] = { wordIndex, charIndex, char: token.charAt(charIndex) };
      }
      if (dom.targetStream) {
        dom.targetStream.appendChild(node);
      }
    });
  }

  function currentWordIndexForCursor(cursor) {
    if (!state.target || state.target.ranges.length === 0) return 0;
    for (let index = 0; index < state.target.ranges.length; index += 1) {
      if (cursor <= state.target.ranges[index].end) {
        return index;
      }
    }
    return state.target.ranges.length - 1;
  }

  function wordTypedSlice(index) {
    const range = state.target.ranges[index];
    return state.typedText.slice(range.start, Math.min(range.end, state.typedText.length));
  }

  function renderWord(index) {
    if (!state.target || index == null || index < 0 || index >= state.target.words.length) return;
    const node = state.target.words[index];
    const token = state.target.tokens[index];
    const range = state.target.ranges[index];
    const typedSlice = wordTypedSlice(index);
    const cursor = state.typedText.length;
    const isBefore = cursor < range.start;
    const isActive = cursor >= range.start && cursor <= range.end;
    const isAfter = cursor > range.end;
    const exactMatch = normalizeChar(typedSlice) === normalizeChar(token) && typedSlice.length === token.length;

    node.classList.remove('pending', 'current', 'complete', 'incorrect');
    if (isBefore) {
      node.classList.add('pending');
    } else if (isActive) {
      node.classList.add('current');
    } else {
      node.classList.add(exactMatch ? 'complete' : 'incorrect');
    }

    const chars = Array.from(node.querySelectorAll('.char'));
    for (let charIndex = 0; charIndex < chars.length; charIndex += 1) {
      const charNode = chars[charIndex];
      const typedChar = typedSlice.charAt(charIndex);
      const expectedChar = token.charAt(charIndex);
      charNode.classList.remove('correct', 'wrong', 'pending');
      if (isBefore) {
        charNode.classList.add('pending');
      } else if (typedChar) {
        if (normalizeChar(typedChar) === normalizeChar(expectedChar)) {
          charNode.classList.add('correct');
        } else {
          charNode.classList.add('wrong');
        }
      } else if (isActive || isAfter) {
        charNode.classList.add('pending');
      }
    }
  }

  function renderActiveWord() {
    if (!state.target) return;
    const activeWord = currentWordIndexForCursor(state.typedText.length);
    renderWord(state.activeWordIndex);
    if (state.activeWordIndex !== activeWord) {
      state.activeWordIndex = activeWord;
    }
    renderWord(activeWord);
    if (activeWord > 0) {
      renderWord(activeWord - 1);
    }
    if (activeWord + 1 < state.target.words.length) {
      renderWord(activeWord + 1);
    }
  }

  function setStatus(message, tone = 'info') {
    if (!dom.gameStatus) return;
    dom.gameStatus.textContent = message;
    if (!dom.gameStatus.dataset) return;
    dom.gameStatus.dataset.tone = tone;
  }

  function updateModeButtons() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === state.settings.mode);
    });
    document.querySelectorAll('[data-duration]').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.duration) === Number(state.settings.duration));
    });
    document.querySelectorAll('[data-source]').forEach((button) => {
      button.classList.toggle('active', button.dataset.source === state.settings.source);
    });
    document.querySelectorAll('[data-difficulty]').forEach((button) => {
      button.classList.toggle('active', button.dataset.difficulty === state.settings.difficulty);
    });
    document.querySelectorAll('[data-toggle]').forEach((button) => {
      const key = button.dataset.toggle;
      const active = Boolean(state.settings[key]);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const modeMeta = getModeMeta();
    if (dom.headlineMode) dom.headlineMode.textContent = modeMeta.label;
    if (dom.liveModeTag) dom.liveModeTag.textContent = modeMeta.label;
    if (dom.liveDurationTag) dom.liveDurationTag.textContent = `${state.settings.duration}s`;
    if (dom.liveSourceTag) dom.liveSourceTag.textContent = state.settings.source === 'sentences' ? 'Sentences' : 'Words';
    if (dom.modeHint) dom.modeHint.textContent = modeMeta.hint;
    if (dom.stageTitle) {
      dom.stageTitle.textContent = state.active ? `${modeMeta.label} session in progress` : `${modeMeta.label} ready`;
    }
    if (dom.targetLabel) {
      dom.targetLabel.textContent = modeMeta.reaction ? 'Reaction target' : 'Focus target';
    }
  }

  function updateHeadlineStats() {
    const wpm = computeLiveWpm();
    const accuracy = computeLiveAccuracy();
    const raw = computeRawWpm();
    if (dom.headlineWpm) dom.headlineWpm.textContent = wpm.toFixed(2);
    if (dom.headlineAccuracy) dom.headlineAccuracy.textContent = `${accuracy.toFixed(2)}%`;
    if (dom.headlineRawWpm) dom.headlineRawWpm.textContent = raw.toFixed(2);
  }

  function updateLiveStats() {
    const wpm = computeLiveWpm();
    const accuracy = computeLiveAccuracy();
    const raw = computeRawWpm();
    if (dom.liveWpm) dom.liveWpm.textContent = wpm.toFixed(2);
    if (dom.liveAccuracy) dom.liveAccuracy.textContent = `${accuracy.toFixed(2)}%`;
    if (dom.liveRawWpm) dom.liveRawWpm.textContent = raw.toFixed(2);
    if (dom.liveErrors) dom.liveErrors.textContent = String(state.wrongCount);
    if (dom.liveBackspaces) dom.liveBackspaces.textContent = String(state.backspaces);
    if (dom.liveCombo) dom.liveCombo.textContent = String(state.combo);

    const duration = Math.max(1, Number(state.settings.duration));
    const progress = state.active ? clamp((elapsedSeconds() / duration) * 100, 0, 100) : 0;
    if (dom.progressLabel) dom.progressLabel.textContent = `${progress.toFixed(0)}%`;
    if (dom.progressFill) dom.progressFill.style.width = `${progress}%`;

    updateHeadlineStats();
  }

  function elapsedSeconds() {
    if (!state.active) return 0;
    return Math.max(0, (performance.now() - state.startTime) / 1000);
  }

  function computeLiveAccuracy() {
    const attempts = Math.max(1, state.keyCount - state.backspaces);
    return Math.max(0, Math.min(100, (state.correctCount / attempts) * 100));
  }

  function computeLiveWpm() {
    const elapsed = elapsedSeconds();
    if (elapsed <= 0) return 0;
    return (state.correctCount / 5) / (elapsed / 60);
  }

  function computeRawWpm() {
    const elapsed = elapsedSeconds();
    if (elapsed <= 0) return 0;
    const typed = Math.max(0, state.keyCount - state.backspaces);
    return (typed / 5) / (elapsed / 60);
  }

  function consistencyScore() {
    if (state.samples.length < 2) return 100;
    const mean = state.samples.reduce((sum, value) => sum + value, 0) / state.samples.length;
    const variance = state.samples.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / state.samples.length;
    const spread = Math.sqrt(variance);
    return Math.max(0, 100 - spread * 4);
  }

  function renderChart() {
    if (!dom.paceChart) return;
    const samples = state.samples.slice(-20);
    dom.paceChart.innerHTML = '';
    const maxValue = Math.max(1, ...samples, 10);
    const barCount = Math.max(samples.length, 6);
    for (let index = 0; index < barCount; index += 1) {
      const value = samples[index] || 0;
      const bar = document.createElement('div');
      bar.className = 'pace-bar';
      const height = value > 0 ? Math.max(10, (value / maxValue) * 100) : 10;
      bar.style.height = `${height}%`;
      bar.dataset.label = value > 0 ? value.toFixed(0) : '';
      dom.paceChart.appendChild(bar);
    }
    if (dom.chartSummary) {
      const spread = state.samples.length > 1 ? (Math.max(...samples) - Math.min(...samples)).toFixed(1) : '0.0';
      dom.chartSummary.textContent = state.samples.length > 1
        ? `Average spread ${spread} WPM. Lower spread means steadier pacing.`
        : 'Build a steady pace to populate the chart.';
    }
  }

  function renderWeakKeys() {
    if (!dom.weakKeyList || !dom.weakKeySummary) return;
    const entries = Object.entries(state.weakKeys)
      .filter(([, count]) => Number(count) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 5);

    if (entries.length === 0) {
      dom.weakKeySummary.textContent = 'No weak keys detected yet. Run a few sessions to build the training profile.';
      dom.weakKeyList.innerHTML = '<li>Nothing to train yet</li>';
      return;
    }

    dom.weakKeySummary.textContent = `${entries.map(([letter]) => letter.toUpperCase()).join(', ')} are your current focus letters.`;
    dom.weakKeyList.innerHTML = entries
      .map(([letter, count]) => `<li><strong>${letter.toUpperCase()}</strong> <span>mistakes ${count}</span></li>`)
      .join('');
  }

  function renderBestList() {
    if (!dom.bestList) return;
    const bestWpm = state.leaderboard.reduce((best, entry) => Math.max(best, Number(entry.wpm) || 0), 0);
    const bestAccuracy = state.leaderboard.reduce((best, entry) => Math.max(best, Number(entry.accuracy) || 0), 0);
    const bestConsistency = state.leaderboard.reduce((best, entry) => Math.max(best, Number(entry.consistency) || 0), 0);
    const bestReaction = state.leaderboard
      .filter((entry) => entry.mode === 'reaction')
      .reduce((best, entry) => Math.min(best, Number(entry.reactionMs) || Infinity), Infinity);

    const items = [
      { label: 'Best WPM', value: bestWpm > 0 ? `${bestWpm.toFixed(2)} WPM` : '--' },
      { label: 'Best accuracy', value: bestAccuracy > 0 ? `${bestAccuracy.toFixed(2)}%` : '--' },
      { label: 'Best consistency', value: bestConsistency > 0 ? `${bestConsistency.toFixed(1)}` : '--' },
      { label: 'Best reaction', value: Number.isFinite(bestReaction) ? `${Math.round(bestReaction)} ms` : '--' },
    ];

    dom.bestList.innerHTML = items
      .map((item) => `<li><strong>${item.label}</strong><span>${item.value}</span></li>`)
      .join('');
  }

  function renderLeaderboard() {
    if (!dom.leaderboardBody) return;
    if (!state.leaderboard.length) {
      dom.leaderboardBody.innerHTML = '<tr><td colspan="7">No runs yet. Start a session to populate the board.</td></tr>';
      return;
    }

    dom.leaderboardBody.innerHTML = state.leaderboard
      .slice(0, 100)
      .map((entry, index) => `
        <tr>
          <td>#${index + 1}</td>
          <td>${escapeHtml(entry.player || 'Guest')}</td>
          <td>${Number(entry.wpm || 0).toFixed(2)}</td>
          <td>${Number(entry.accuracy || 0).toFixed(2)}%</td>
          <td>${escapeHtml(formatModeName(entry.mode || 'standard'))}</td>
          <td>${Number(entry.duration || 0)}s</td>
          <td>${escapeHtml(entry.note || defaultLeaderboardNote(entry))}</td>
        </tr>
      `)
      .join('');
  }

  function defaultLeaderboardNote(entry) {
    if (entry.mode === 'reaction') {
      return Number.isFinite(Number(entry.reactionMs)) ? `${Math.round(Number(entry.reactionMs))} ms avg reaction` : 'Reaction run';
    }
    if (entry.mode === 'consistency') {
      return `Consistency ${Number(entry.consistency || 0).toFixed(1)}`;
    }
    return `Raw ${Number(entry.rawWpm || 0).toFixed(2)} WPM`;
  }

  function formatModeName(mode) {
    const meta = MODE_META[mode] || MODE_META.standard;
    return meta.label;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function sortLeaderboard() {
    state.leaderboard.sort((a, b) => {
      if (Number(b.wpm || 0) !== Number(a.wpm || 0)) return Number(b.wpm || 0) - Number(a.wpm || 0);
      if (Number(b.accuracy || 0) !== Number(a.accuracy || 0)) return Number(b.accuracy || 0) - Number(a.accuracy || 0);
      if (Number(b.rawWpm || 0) !== Number(a.rawWpm || 0)) return Number(b.rawWpm || 0) - Number(a.rawWpm || 0);
      return Number(a.errors || 0) - Number(b.errors || 0);
    });
    state.leaderboard = state.leaderboard.slice(0, 100);
  }

  function recordWeakKey(expectedChar, typedChar) {
    if (isLetter(expectedChar)) {
      const key = normalizeChar(expectedChar).toLowerCase();
      state.weakKeys[key] = (Number(state.weakKeys[key]) || 0) + 1;
    }
    if (isLetter(typedChar)) {
      const key = normalizeChar(typedChar).toLowerCase();
      state.weakKeys[key] = (Number(state.weakKeys[key]) || 0) + 1;
    }
    saveWeakKeys();
  }

  function resetTargetUi() {
    if (!dom.targetStream || !dom.reactionTarget) return;
    dom.targetStream.hidden = false;
    dom.reactionTarget.hidden = true;
    dom.targetStream.innerHTML = '';
  }

  function renderTarget() {
    if (!dom.targetStream) return;
    dom.targetStream.innerHTML = '';
    state.target.words.forEach((node) => {
      dom.targetStream.appendChild(node);
    });
    renderActiveWord();
  }

  function ensureTargetBuffer() {
    if (!state.target || getModeMeta().reaction) return;
    const remaining = state.target.fullText.length - state.typedText.length;
    if (remaining < 120) {
      appendTargetChunk(24);
      renderActiveWord();
    }
  }

  function beginReactionWord() {
    if (!state.target || !getModeMeta().reaction) return;
    if (state.reactionTimeoutId) {
      window.clearTimeout(state.reactionTimeoutId);
      state.reactionTimeoutId = null;
    }

    const pool = getPoolForDifficulty();
    const weakLetters = state.settings.mode === 'weak-key' ? getWeakLetters() : [];
    const word = decorateWord(chooseWeightedWord(pool, weakLetters), state.settings, false);
    state.reactionActiveWord = word;
    state.reactionVisibleAt = performance.now();
    state.typedText = '';
    state.activeWordIndex = 0;

    if (dom.reactionTarget) dom.reactionTarget.hidden = false;
    if (dom.targetStream) dom.targetStream.hidden = true;
    if (dom.reactionWord) dom.reactionWord.textContent = word;
    if (dom.reactionPrompt) dom.reactionPrompt.textContent = 'Type the word before the next one appears.';

    const lifetime = Math.max(650, 1800 - (state.reactionTotalShown * 12));
    state.reactionTimeoutId = window.setTimeout(() => {
      if (!state.active || !getModeMeta().reaction) return;
      state.reactionMisses += 1;
      state.combo = 0;
      state.reactionTotalShown += 1;
      state.samples.push(computeLiveWpm());
      renderChart();
      beginReactionWord();
      updateLiveStats();
    }, lifetime);
  }

  function startRun(fromAuto = false) {
    if (state.active) return;
    state.active = true;
    state.startTime = performance.now();
    state.endTime = state.startTime + (Number(state.settings.duration) * 1000);
    state.target = getModeMeta().reaction ? null : buildTargetPlan();
    state.typedText = '';
    state.activeWordIndex = 0;
    state.keyCount = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.backspaces = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.samples = [];
    state.sampleStamp = 0;
    state.reactionTotalShown = 0;
    state.reactionTotalHits = 0;
    state.reactionMisses = 0;
    state.reactionActiveWord = '';
    state.lastSessionSummary = '';
    state.resultsShown = false;

    if (dom.resultsCard) dom.resultsCard.hidden = true;
    if (dom.typingStage) dom.typingStage.classList.add('active');
    if (dom.stageTitle) dom.stageTitle.textContent = `${formatModeName(state.settings.mode)} session in progress`;
    if (dom.weakKeySummary && state.settings.mode === 'weak-key' && getWeakLetters().length === 0) {
      dom.weakKeySummary.textContent = 'Weak key mode will adapt after a few runs build a training profile.';
    }

    if (getModeMeta().reaction) {
      if (dom.targetStream) dom.targetStream.hidden = true;
      if (dom.reactionTarget) dom.reactionTarget.hidden = false;
      beginReactionWord();
    } else {
      if (dom.targetStream) dom.targetStream.hidden = false;
      if (dom.reactionTarget) dom.reactionTarget.hidden = true;
      renderTarget();
      if (state.target) {
        renderWord(0);
      }
      ensureTargetBuffer();
    }

    if (!state.timerId) {
      state.timerId = window.setInterval(tick, 50);
    }
    updateLiveStats();
    setStatus(fromAuto ? 'Auto-started. Keep typing cleanly.' : 'Typing session started. Build speed without rushing the accuracy.', 'info');
    saveSettings();
    if (dom.typingInput) {
      dom.typingInput.focus();
    }
  }

  function stopRun() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    if (state.reactionTimeoutId) {
      window.clearTimeout(state.reactionTimeoutId);
      state.reactionTimeoutId = null;
    }
    state.active = false;
    if (dom.typingStage) dom.typingStage.classList.remove('active');
  }

  function completeRun(reason = 'time') {
    if (!state.active) return;
    stopRun();

    const elapsed = Math.max(1, elapsedSeconds());
    const wpm = computeLiveWpm();
    const rawWpm = computeRawWpm();
    const accuracy = computeLiveAccuracy();
    const consistency = consistencyScore();
    const weakLetterList = getWeakLetters();
    const player = getCurrentDisplayName();
    const reactionMs = state.reactionTotalHits > 0 ? state.reactionStamp / state.reactionTotalHits : null;
    const note = state.settings.mode === 'reaction'
      ? `${state.reactionTotalHits} hits • ${state.reactionMisses} misses • ${reactionMs ? `${Math.round(reactionMs)} ms avg reaction` : 'no successful hits yet'}`
      : `${Math.round(state.correctCount)} clean chars • ${Math.round(state.bestCombo)} best combo`;

    const entry = {
      player,
      mode: state.settings.mode,
      duration: Number(state.settings.duration),
      wpm: Number(wpm.toFixed(2)),
      rawWpm: Number(rawWpm.toFixed(2)),
      accuracy: Number(accuracy.toFixed(2)),
      errors: state.wrongCount,
      backspaces: state.backspaces,
      consistency: Number(consistency.toFixed(1)),
      source: state.settings.source,
      difficulty: state.settings.difficulty,
      punctuation: Boolean(state.settings.punctuation),
      numbers: Boolean(state.settings.numbers),
      caseSensitive: Boolean(state.settings.caseSensitive),
      reactionMs: reactionMs != null ? Number(reactionMs.toFixed(0)) : null,
      weakKeys: weakLetterList.slice(0, 4),
      note,
      date: new Date().toISOString(),
    };

    state.leaderboard.push(entry);
    sortLeaderboard();
    saveLeaderboard();
    state.lastRun = entry;
    state.lastSessionSummary = `${entry.wpm.toFixed(2)} WPM | ${entry.accuracy.toFixed(2)}% accuracy | ${formatModeName(entry.mode)} mode`;

    if (dom.resultsCard) dom.resultsCard.hidden = false;
    if (dom.resultsTitle) dom.resultsTitle.textContent = `${formatModeName(entry.mode)} result`;
    if (dom.resultsBadge) dom.resultsBadge.textContent = entry.accuracy >= 98 ? 'Clean run' : entry.wpm >= 100 ? 'High speed' : 'Steady run';
    if (dom.resultWpm) dom.resultWpm.textContent = entry.wpm.toFixed(2);
    if (dom.resultAccuracy) dom.resultAccuracy.textContent = `${entry.accuracy.toFixed(2)}%`;
    if (dom.resultRawWpm) dom.resultRawWpm.textContent = entry.rawWpm.toFixed(2);
    if (dom.resultErrors) dom.resultErrors.textContent = String(entry.errors);
    if (dom.resultConsistency) dom.resultConsistency.textContent = entry.consistency.toFixed(1);
    if (dom.resultStreak) dom.resultStreak.textContent = String(state.bestCombo);
    if (dom.resultNote) dom.resultNote.textContent = state.settings.mode === 'reaction'
      ? `Reaction mode converts sudden targets into pressure practice. ${note}.`
      : `${note}. Weak keys: ${weakLetterList.length > 0 ? weakLetterList.map((letter) => letter.toUpperCase()).join(', ') : 'none yet'}.`;

    renderLeaderboard();
    renderBestList();
    renderWeakKeys();
    renderChart();
    updateLiveStats();
    const summary = `Typing Test: ${entry.wpm.toFixed(2)} WPM, ${entry.accuracy.toFixed(2)}% accuracy, ${formatModeName(entry.mode)} mode, ${entry.duration}s`;
    setStatus(summary, 'success');
    if (dom.insightCopy) {
      dom.insightCopy.textContent = `Run saved. ${weakLetterList.length > 0 ? `Your weak keys are ${weakLetterList.map((letter) => letter.toUpperCase()).join(', ')}.` : 'Keep going to build a weak-key profile.'}`;
    }
    saveSettings();
  }

  function tick() {
    if (!state.active) return;

    const elapsed = elapsedSeconds();
    const remaining = Math.max(0, Number(state.settings.duration) - elapsed);
    if (remaining <= 0) {
      completeRun('time');
      return;
    }

    if (Math.floor(elapsed) > state.sampleStamp) {
      state.sampleStamp = Math.floor(elapsed);
      state.samples.push(computeLiveWpm());
      renderChart();
    }

    if (!getModeMeta().reaction) {
      ensureTargetBuffer();
    }

    updateLiveStats();
  }

  function applySettings(nextSettings, refreshTarget = true) {
    state.settings = { ...state.settings, ...nextSettings };
    if (state.settings.mode && MODE_META[state.settings.mode]) {
      state.settings.duration = Number(nextSettings.duration != null ? nextSettings.duration : DEFAULT_SETTINGS.duration);
    }
    updateModeButtons();
    saveSettings();
    updateHeadlineStats();
    if (refreshTarget && state.active) {
      completeRun('mode-change');
    }
    if (refreshTarget && !state.active) {
      resetTargetUi();
      if (state.settings.mode !== 'reaction') {
        state.target = buildTargetPlan();
        renderTarget();
        renderWord(0);
      }
    }
    renderWeakKeys();
    renderBestList();
    if (dom.insightCopy) {
      dom.insightCopy.textContent = MODE_META[state.settings.mode]?.hint || MODE_META.standard.hint;
    }
  }

  function setMode(mode) {
    const meta = MODE_META[mode] || MODE_META.standard;
    state.settings.mode = mode;
    state.settings.duration = meta.defaultDuration;
    applySettings({ mode, duration: meta.defaultDuration }, true);
  }

  function setDuration(duration) {
    state.settings.duration = Number(duration);
    applySettings({ duration: Number(duration) }, false);
    if (dom.liveDurationTag) dom.liveDurationTag.textContent = `${state.settings.duration}s`;
  }

  function setSource(source) {
    state.settings.source = source;
    applySettings({ source }, false);
  }

  function setDifficulty(difficulty) {
    state.settings.difficulty = difficulty;
    applySettings({ difficulty }, false);
  }

  function toggleRule(rule) {
    state.settings[rule] = !state.settings[rule];
    applySettings({ [rule]: state.settings[rule] }, false);
  }

  function resetStats() {
    state.weakKeys = {};
    state.samples = [];
    state.lastRun = null;
    saveWeakKeys();
    renderWeakKeys();
    renderBestList();
    renderChart();
    setStatus('Training stats reset. Leaderboard entries stay intact.', 'info');
    if (dom.insightCopy) {
      dom.insightCopy.textContent = 'Training stats reset. Run more sessions to rebuild weak-key guidance.';
    }
  }

  function restartCurrentSession() {
    if (state.active) {
      completeRun('restart');
    }
    startRun(false);
  }

  function practiceWeakKeys() {
    setMode('weak-key');
    setDuration(60);
    if (!state.active) {
      startRun(false);
    } else {
      restartCurrentSession();
    }
  }

  function buildSummaryText() {
    const current = state.lastRun || {
      wpm: computeLiveWpm(),
      accuracy: computeLiveAccuracy(),
      rawWpm: computeRawWpm(),
      mode: state.settings.mode,
      duration: state.settings.duration,
    };
    return `${getCurrentDisplayName()} | ${Number(current.wpm).toFixed(2)} WPM | ${Number(current.accuracy).toFixed(2)}% accuracy | ${formatModeName(current.mode)} | ${Number(current.duration)}s`;
  }

  function copySummary() {
    const summary = buildSummaryText();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).then(() => {
        setStatus('Results summary copied to clipboard.', 'success');
      }).catch(() => {
        setStatus(summary, 'info');
      });
      return;
    }
    setStatus(summary, 'info');
  }

  function handleBackspace() {
    if (!state.active || state.typedText.length === 0) return;
    const removedIndex = state.typedText.length - 1;
    const removedChar = state.typedText.charAt(removedIndex);
    state.typedText = state.typedText.slice(0, -1);
    state.backspaces += 1;
    state.combo = 0;
    if (removedChar === ' ') {
      renderActiveWord();
      updateLiveStats();
      return;
    }

    const nodeInfo = state.target?.nodeMap?.[removedIndex];
    if (nodeInfo && state.target?.words?.[nodeInfo.wordIndex]) {
      renderWord(nodeInfo.wordIndex);
      if (nodeInfo.wordIndex > 0) renderWord(nodeInfo.wordIndex - 1);
      if (nodeInfo.wordIndex + 1 < state.target.words.length) renderWord(nodeInfo.wordIndex + 1);
    } else {
      renderActiveWord();
    }
    updateLiveStats();
  }

  function handlePrintableInput(rawKey) {
    if (!state.active) {
      startRun(true);
    }
    if (!state.active) return;

    if (getModeMeta().reaction) {
      handleReactionInput(rawKey);
      return;
    }

    const key = rawKey === 'Spacebar' ? ' ' : rawKey;
    const cursor = state.typedText.length;
    const expectedChar = state.target?.fullText.charAt(cursor) || '';
    state.keyCount += 1;
    state.typedText += key;

    if (key === expectedChar || normalizeChar(key) === normalizeChar(expectedChar)) {
      state.correctCount += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
    } else {
      state.wrongCount += 1;
      state.combo = 0;
      recordWeakKey(expectedChar, key);
    }

    if (expectedChar === ' ' && key === ' ' && state.settings.mode !== 'accuracy') {
      const activeWord = currentWordIndexForCursor(state.typedText.length);
      if (activeWord > 0) renderWord(activeWord - 1);
      renderWord(activeWord);
    }

    if (state.target) {
      const activeWord = currentWordIndexForCursor(state.typedText.length);
      state.activeWordIndex = activeWord;
      renderWord(activeWord);
      if (activeWord > 0) renderWord(activeWord - 1);
      if (activeWord + 1 < state.target.words.length) renderWord(activeWord + 1);
    }

    ensureTargetBuffer();
    updateLiveStats();
  }

  function handleReactionInput(rawKey) {
    const key = rawKey === 'Spacebar' ? ' ' : rawKey;
    const expected = state.reactionActiveWord || '';
    const cursor = state.typedText.length;
    const expectedChar = expected.charAt(cursor) || '';
    state.keyCount += 1;
    state.typedText += key;

    if (key === expectedChar || normalizeChar(key) === normalizeChar(expectedChar)) {
      state.correctCount += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
    } else {
      state.wrongCount += 1;
      state.combo = 0;
      recordWeakKey(expectedChar, key);
    }

    if (state.typedText === expected) {
      if (state.reactionTimeoutId) {
        window.clearTimeout(state.reactionTimeoutId);
        state.reactionTimeoutId = null;
      }
      const reactionMs = performance.now() - state.reactionVisibleAt;
      state.reactionTotalShown += 1;
      state.reactionTotalHits += 1;
      state.reactionStamp += reactionMs;
      state.samples.push(computeLiveWpm());
      renderChart();
      state.typedText = '';
      beginReactionWord();
    }

    updateLiveStats();
  }

  function finalizeReactionIfNeeded() {
    if (!getModeMeta().reaction) return;
    if (state.reactionTimeoutId) {
      window.clearTimeout(state.reactionTimeoutId);
      state.reactionTimeoutId = null;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
    if (event.key === 'Escape' && state.active) {
      event.preventDefault();
      completeRun('escape');
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      handleBackspace();
      return;
    }
    if (!isPrintableKey(event)) return;
    event.preventDefault();
    handlePrintableInput(event.key);
  }

  function initControls() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });

    document.querySelectorAll('[data-duration]').forEach((button) => {
      button.addEventListener('click', () => setDuration(Number(button.dataset.duration)));
    });

    document.querySelectorAll('[data-source]').forEach((button) => {
      button.addEventListener('click', () => setSource(button.dataset.source));
    });

    document.querySelectorAll('[data-difficulty]').forEach((button) => {
      button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
    });

    document.querySelectorAll('[data-toggle]').forEach((button) => {
      button.addEventListener('click', () => toggleRule(button.dataset.toggle));
    });

    if (dom.startBtn) dom.startBtn.addEventListener('click', () => startRun(false));
    if (dom.replayBtn) dom.replayBtn.addEventListener('click', () => restartCurrentSession());
    if (dom.resetStatsBtn) dom.resetStatsBtn.addEventListener('click', () => resetStats());
    if (dom.runAgainBtn) dom.runAgainBtn.addEventListener('click', () => restartCurrentSession());
    if (dom.practiceBtn) dom.practiceBtn.addEventListener('click', () => practiceWeakKeys());
    if (dom.shareStatsBtn) dom.shareStatsBtn.addEventListener('click', () => copySummary());

    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('focus', () => {
      if (dom.typingInput) dom.typingInput.focus();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.active) {
        setStatus('Typing paused while the tab is hidden.', 'warn');
      }
    });
  }

  function initializeUi() {
    updateModeButtons();
    renderWeakKeys();
    renderBestList();
    renderLeaderboard();
    renderChart();
    updateLiveStats();
    resetTargetUi();
    if (dom.stageTitle) dom.stageTitle.textContent = `${formatModeName(state.settings.mode)} ready`;
    if (dom.insightCopy) dom.insightCopy.textContent = MODE_META[state.settings.mode]?.hint || MODE_META.standard.hint;
    setStatus('Choose a mode, then start the session.', 'info');
  }

  function boot() {
    initializeUi();
    initControls();
    if (isOwner()) {
      setStatus('Owner mode detected. Training stats and leaderboard remain local.', 'info');
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  finalizeReactionIfNeeded();
  boot();
})();
