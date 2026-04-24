const LEADERBOARD_KEY = 'playrClickSpeedLeaderboard';
const LEADERBOARD_LIMIT = 20;

const CHEAT_RULES = {
  suspiciousCps: 15,
  hardCapCps: 25,
};

const DEFAULT_LEADERBOARD = [
  { name: 'Nova', cps: 11.92, clicks: 119, duration: 10, note: 'Baseline' },
  { name: 'Kite', cps: 10.77, clicks: 323, duration: 30, note: 'Baseline' },
  { name: 'Milo', cps: 9.88, clicks: 296, duration: 30, note: 'Baseline' },
  { name: 'Aya', cps: 8.91, clicks: 89, duration: 10, note: 'Baseline' },
  { name: 'Juno', cps: 8.36, clicks: 251, duration: 30, note: 'Baseline' },
  { name: 'Sage', cps: 7.24, clicks: 72, duration: 10, note: 'Baseline' },
];

const state = {
  duration: 0,
  clicks: 0,
  running: false,
  armed: false,
  startedAt: 0,
  timerId: null,
  suspiciousRuns: 0,
  validationLocked: false,
  leaderboard: [],
  adminSnapshot: null,
};

const dom = {
  timerSetup: document.getElementById('timerSetup'),
  testActive: document.getElementById('testActive'),
  testResults: document.getElementById('testResults'),
  runStatus: document.getElementById('runStatus'),
  timeRemaining: document.getElementById('timeRemaining'),
  clickArea: document.getElementById('clickArea'),
  clickPrompt: document.getElementById('clickPrompt'),
  clickCount: document.getElementById('clickCount'),
  liveCps: document.getElementById('liveCps'),
  resultClicks: document.getElementById('resultClicks'),
  resultDuration: document.getElementById('resultDuration'),
  resultCPS: document.getElementById('resultCPS'),
  tierMessage: document.getElementById('tierMessage'),
  validationMessage: document.getElementById('validationMessage'),
  leaderboardBody: document.getElementById('leaderboardBody'),
  quitBtn: document.getElementById('quitBtn'),
  retryBtn: document.getElementById('retryBtn'),
  resetValidationBtn: document.getElementById('resetValidationBtn'),
  homeBtn: document.getElementById('homeBtn'),
  adminTools: document.getElementById('adminTools'),
  adminStatus: document.getElementById('adminStatus'),
  adminNameInput: document.getElementById('adminNameInput'),
  adminCpsInput: document.getElementById('adminCpsInput'),
  adminClicksInput: document.getElementById('adminClicksInput'),
  adminDurationInput: document.getElementById('adminDurationInput'),
  adminNoteInput: document.getElementById('adminNoteInput'),
  adminInjectBtn: document.getElementById('adminInjectBtn'),
  adminResetBtn: document.getElementById('adminResetBtn'),
  adminRevertBtn: document.getElementById('adminRevertBtn'),
};

function getCurrentDisplayName() {
  try {
    if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
      const user = window.PlayrAuth.getCurrentUser();
      if (user?.displayName) return String(user.displayName).trim().slice(0, 24);
    }
  } catch {
    // Ignore auth helper failures.
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

function isOwnerUser() {
  return getCurrentDisplayName().toLowerCase() === 'owner';
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore parse failures and use defaults.
  }
  return [...DEFAULT_LEADERBOARD];
}

function saveLeaderboard() {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(state.leaderboard));
}

function sortLeaderboard() {
  state.leaderboard.sort((a, b) => {
    if (b.cps !== a.cps) return b.cps - a.cps;
    if (b.clicks !== a.clicks) return b.clicks - a.clicks;
    return (a.duration || 0) - (b.duration || 0);
  });
  state.leaderboard = state.leaderboard.slice(0, LEADERBOARD_LIMIT);
}

function renderLeaderboard() {
  if (!dom.leaderboardBody) return;

  if (!state.leaderboard.length) {
    dom.leaderboardBody.innerHTML = '<tr><td colspan="5">No scores yet.</td></tr>';
    return;
  }

  dom.leaderboardBody.innerHTML = state.leaderboard
    .map((entry, index) => `
      <tr>
        <td>#${index + 1}</td>
        <td>${entry.name}</td>
        <td>${Number(entry.cps).toFixed(2)}</td>
        <td>${entry.duration}s</td>
        <td>${entry.clicks}</td>
      </tr>
    `)
    .join('');
}

function classifyCps(cps) {
  if (cps < 4) return '🦥 Sloth (very slow)';
  if (cps < 6) return '🐢 Turtle (casual clicking)';
  if (cps < 7) return '🐕 Dog (average human speed)';
  if (cps < 9) return '🦁 Lion (fast)';
  if (cps < 10) return '🐆 Cheetah (very fast)';
  if (cps < 12) return '🦅 Eagle (elite reflexes)';
  return '⚡ Inhuman / Machine';
}

function setRunStatus(message, tone = 'info') {
  if (!dom.runStatus) return;
  dom.runStatus.textContent = message;
  dom.runStatus.style.color = tone === 'danger' ? '#ff9cb1' : tone === 'warn' ? '#ffbd6b' : '#a6b1cf';
}

function setValidationMessage(message, tone = 'warn') {
  if (!dom.validationMessage) return;
  dom.validationMessage.textContent = message || '';
  dom.validationMessage.style.color = tone === 'danger' ? '#ff9cb1' : tone === 'success' ? '#9ff5cb' : '#ffbd6b';
}

function updateTimerDisplay() {
  const elapsed = (performance.now() - state.startedAt) / 1000;
  const remaining = Math.max(0, state.duration - elapsed);
  dom.timeRemaining.textContent = remaining.toFixed(2);
  dom.liveCps.textContent = elapsed > 0 ? (state.clicks / elapsed).toFixed(2) : '0.00';

  if (remaining <= 0) {
    completeRun();
  }
}

function startTest(duration) {
  if (state.running || state.armed || duration <= 0) return;

  state.duration = duration;
  state.clicks = 0;
  state.startedAt = 0;
  state.running = false;
  state.armed = true;

  dom.clickCount.textContent = '0';
  dom.liveCps.textContent = '0.00';
  dom.timeRemaining.textContent = duration.toFixed(2);
  dom.clickPrompt.textContent = 'Click to begin';
  setValidationMessage('');

  dom.timerSetup.hidden = true;
  dom.testResults.hidden = true;
  dom.testActive.hidden = false;
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  state.running = false;
  state.armed = false;
}

function resetToSetup(statusMessage = '') {
  stopTimer();
  dom.testActive.hidden = true;
  dom.testResults.hidden = true;
  dom.timerSetup.hidden = false;
  dom.clickPrompt.textContent = 'Click as fast as you can!';
  if (statusMessage) {
    setRunStatus(statusMessage, 'info');
  }
}

function detectCheat(cps, clicks, duration) {
  const reasons = [];

  if (cps >= CHEAT_RULES.hardCapCps) {
    reasons.push('CPS is unrealistically high.');
  }
  if (duration >= 10 && cps >= CHEAT_RULES.suspiciousCps) {
    reasons.push('Sustained CPS looks unnatural.');
  }
  if (clicks > duration * 30) {
    reasons.push('Click volume exceeded expected limits.');
  }
  if (state.suspiciousRuns >= 1 && cps >= 12) {
    reasons.push('Repeated suspicious run detected.');
  }

  if (reasons.length > 0) {
    state.suspiciousRuns += 1;
    if (state.suspiciousRuns > 1 || cps >= CHEAT_RULES.hardCapCps) {
      state.validationLocked = true;
    }
  }

  return reasons;
}

function pushScore(entry) {
  state.leaderboard.push(entry);
  sortLeaderboard();
  saveLeaderboard();
  renderLeaderboard();
}

function completeRun() {
  if (!state.running) return;

  stopTimer();
  dom.testActive.hidden = true;
  dom.testResults.hidden = false;

  const duration = state.duration;
  const clicks = state.clicks;
  const cps = duration > 0 ? clicks / duration : 0;
  const tier = classifyCps(cps);

  dom.resultClicks.textContent = String(clicks);
  dom.resultDuration.textContent = `${duration}s`;
  dom.resultCPS.textContent = cps.toFixed(2);
  dom.tierMessage.textContent = `Tier: ${tier}`;

  if (state.validationLocked) {
    setValidationMessage('Score validation is locked after repeated suspicious runs. Press Reset Validation.', 'danger');
    setRunStatus('Validation locked. Reset required before scores can be saved.', 'danger');
    return;
  }

  const reasons = detectCheat(cps, clicks, duration);
  if (reasons.length) {
    setValidationMessage(`Run flagged: ${reasons.join(' ')}`, 'warn');
    setRunStatus('Flagged run was not saved to leaderboard.', 'warn');
    return;
  }

  const name = getCurrentDisplayName();
  pushScore({
    name,
    cps,
    clicks,
    duration,
    note: 'Validated run',
    timestamp: Date.now(),
  });

  setValidationMessage('Validated run saved to leaderboard.', 'success');
  setRunStatus('Score validated and saved.', 'info');
}

function handleClick() {
  if (!state.running && !state.armed) return;

  if (state.armed) {
    state.armed = false;
    state.running = true;
    state.startedAt = performance.now();
    dom.clickPrompt.textContent = 'Go! Go! Go!';
    state.timerId = window.setInterval(updateTimerDisplay, 25);
  }

  state.clicks += 1;
  dom.clickCount.textContent = String(state.clicks);
}

function setupAdminTools() {
  const owner = isOwnerUser();
  if (!dom.adminTools) return;

  dom.adminTools.hidden = !owner;
  if (dom.adminStatus) {
    dom.adminStatus.textContent = owner
      ? 'Owner access confirmed. Custom scores are enabled.'
      : 'Owner only. Sign in as Owner to use custom score tools.';
  }
}

function injectAdminScore() {
  if (!isOwnerUser()) {
    if (dom.adminStatus) dom.adminStatus.textContent = 'Owner access required.';
    return;
  }

  const name = String(dom.adminNameInput?.value || 'Owner').trim().slice(0, 24) || 'Owner';
  const cps = Number(dom.adminCpsInput?.value || 0);
  const clicks = Math.max(0, Math.floor(Number(dom.adminClicksInput?.value || 0)));
  const duration = Math.max(1, Math.floor(Number(dom.adminDurationInput?.value || 10)));
  const note = String(dom.adminNoteInput?.value || 'Admin custom score').trim().slice(0, 48) || 'Admin custom score';

  if (!Number.isFinite(cps) || cps <= 0) {
    if (dom.adminStatus) dom.adminStatus.textContent = 'Enter a valid CPS value.';
    return;
  }

  state.adminSnapshot = state.adminSnapshot || JSON.parse(JSON.stringify(state.leaderboard));
  pushScore({ name, cps, clicks, duration, note, timestamp: Date.now(), admin: true });
  if (dom.adminStatus) dom.adminStatus.textContent = `Injected ${name} (${cps.toFixed(2)} CPS).`;
}

function resetLeaderboardByAdmin() {
  if (!isOwnerUser()) return;
  state.adminSnapshot = JSON.parse(JSON.stringify(state.leaderboard));
  state.leaderboard = [...DEFAULT_LEADERBOARD];
  sortLeaderboard();
  saveLeaderboard();
  renderLeaderboard();
  if (dom.adminStatus) dom.adminStatus.textContent = 'Leaderboard reset to defaults.';
}

function revertLeaderboardByAdmin() {
  if (!isOwnerUser()) return;
  if (!state.adminSnapshot) {
    if (dom.adminStatus) dom.adminStatus.textContent = 'No admin snapshot available yet.';
    return;
  }
  state.leaderboard = JSON.parse(JSON.stringify(state.adminSnapshot));
  sortLeaderboard();
  saveLeaderboard();
  renderLeaderboard();
  if (dom.adminStatus) dom.adminStatus.textContent = 'Leaderboard reverted to last snapshot.';
}

function resetValidation() {
  state.validationLocked = false;
  state.suspiciousRuns = 0;
  setValidationMessage('Validation reset. New runs can be validated again.', 'success');
  setRunStatus('Validation reset complete.', 'info');
}

function initEvents() {
  document.querySelectorAll('.duration-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const duration = Number(button.dataset.duration || 0);
      startTest(duration);
    });
  });

  dom.clickArea.addEventListener('click', handleClick);
  dom.clickArea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  });

  dom.quitBtn.addEventListener('click', () => {
    resetToSetup('Test quit. Choose another duration to run again.');
  });

  dom.retryBtn.addEventListener('click', () => {
    resetToSetup('Pick a test to run again.');
  });

  dom.resetValidationBtn.addEventListener('click', () => {
    resetValidation();
  });

  dom.homeBtn.addEventListener('click', () => {
    window.location.href = '/';
  });

  if (dom.adminInjectBtn) dom.adminInjectBtn.addEventListener('click', injectAdminScore);
  if (dom.adminResetBtn) dom.adminResetBtn.addEventListener('click', resetLeaderboardByAdmin);
  if (dom.adminRevertBtn) dom.adminRevertBtn.addEventListener('click', revertLeaderboardByAdmin);

  window.addEventListener('playr-auth-changed', () => {
    setupAdminTools();
  });
}

function init() {
  state.leaderboard = loadLeaderboard();
  sortLeaderboard();
  renderLeaderboard();
  setupAdminTools();
  initEvents();
  setRunStatus('Pick a test, then click the large target as fast as possible.', 'info');
}

init();

