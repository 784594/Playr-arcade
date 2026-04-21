// Cookie Clicker

function formatNumber(num) {
  const value = Number(num) || 0;
  if (value < 1000) return Math.floor(value).toString();
  if (value < 1e6) return (value / 1e3).toFixed(1) + 'K';
  if (value < 1e9) return (value / 1e6).toFixed(1) + 'M';
  if (value < 1e12) return (value / 1e9).toFixed(1) + 'B';
  if (value < 1e15) return (value / 1e12).toFixed(1) + 'T';

  let remaining = Math.floor(value / 1e15);
  let letters = '';
  while (remaining > 0) {
    letters = String.fromCharCode(65 + (remaining - 1) % 26) + letters;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return (value / Math.pow(10, 15 + Math.floor(Math.log10(value / 1e15)) / 2.6)).toFixed(1) + letters;
}

const CHEAT_CONFIG = {
  windowMs: 1000,
  decayMs: 12000,
  warningThreshold: 3,
  softCpsThreshold: 10,
  hardCpsThreshold: 18,
};

const REBIRTH_CONFIG = {
  maxRebirths: 3,
  tierBoosts: [0.10, 0.15, 0.25],
  costs: [5_000_000_000, 20_000_000_000, 80_000_000_000],
};

const HYBRID_CONFIG = {
  feedbackLoopClickGainFactor: 0.00005,
  feedbackLoopBaseCpsCap: 5_000,
};

const COOKIE_SAVE_KEY = 'cookieClicker';

const UPGRADES = {
  'click-upgrades': [
    { id: 'strong-finger-1', emoji: '🖐️', name: 'Strong Finger I', cost: 10, bonus: '+2 CPC', type: 'cpc', value: 2 },
    { id: 'strong-finger-2', emoji: '✋', name: 'Strong Finger II', cost: 50, bonus: '+4 CPC', type: 'cpc', value: 4 },
    { id: 'strong-finger-3', emoji: '🫱', name: 'Strong Finger III', cost: 200, bonus: '+8 CPC', type: 'cpc', value: 8 },
    { id: 'strong-finger-4', emoji: '🫲', name: 'Strong Finger IV', cost: 1000, bonus: '+16 CPC', type: 'cpc', value: 16 },
    { id: 'steel-finger', emoji: '🔩', name: 'Steel Finger', cost: 5000, bonus: '+40 CPC', type: 'cpc', value: 40 },
    { id: 'titanium-finger', emoji: '⚙️', name: 'Titanium Finger', cost: 25000, bonus: '+80 CPC', type: 'cpc', value: 80 },
    { id: 'diamond-finger', emoji: '💎', name: 'Diamond Finger', cost: 100000, bonus: '+160 CPC', type: 'cpc', value: 160 },
    { id: 'quantum-finger', emoji: '⚛️', name: 'Quantum Finger', cost: 1000000, bonus: '+400 CPC', type: 'cpc', value: 400 },
    { id: 'god-finger', emoji: '👑', name: 'God Finger', cost: 10000000, bonus: '+2,000 CPC', type: 'cpc', value: 2000 },
  ],
  'auto-clickers': [
    { id: 'auto-1', emoji: '🤖', name: 'Auto Clicker I', cost: 1000, bonus: '+1 CPS', type: 'cps', value: 1 },
    { id: 'auto-2', emoji: '🤖', name: 'Auto Clicker II', cost: 5000, bonus: '+3 CPS', type: 'cps', value: 3 },
    { id: 'auto-3', emoji: '🤖', name: 'Auto Clicker III', cost: 20000, bonus: '+8 CPS', type: 'cps', value: 8 },
    { id: 'auto-4', emoji: '🤖', name: 'Auto Clicker IV', cost: 80000, bonus: '+20 CPS', type: 'cps', value: 20 },
    { id: 'auto-5', emoji: '🤖', name: 'Auto Clicker V', cost: 300000, bonus: '+50 CPS', type: 'cps', value: 50 },
    { id: 'auto-6', emoji: '🤖', name: 'Auto Clicker VI', cost: 1200000, bonus: '+120 CPS', type: 'cps', value: 120 },
    { id: 'auto-7', emoji: '🤖', name: 'Auto Clicker VII', cost: 4800000, bonus: '+300 CPS', type: 'cps', value: 300 },
  ],
  'speed-upgrades': [
    { id: 'faster-motors-1', emoji: '🚗', name: 'Faster Motors I', cost: 40000, bonus: 'x1.5 CPC & CPS', type: 'multiplier', value: 1.5, target: 'both' },
    { id: 'faster-motors-2', emoji: '🚀', name: 'Faster Motors II', cost: 150000, bonus: 'x1.5 CPC & CPS', type: 'multiplier', value: 1.5, target: 'both' },
    { id: 'overclock-core', emoji: '⚡', name: 'Overclock Core', cost: 600000, bonus: 'x1.4 CPS', type: 'multiplier', value: 1.4, target: 'cps' },
    { id: 'quantum-engine', emoji: '🌀', name: 'Quantum Engine', cost: 2400000, bonus: 'x1.6 CPS', type: 'multiplier', value: 1.6, target: 'cps' },
    { id: 'time-warp', emoji: '⏳', name: 'Time Warp Drive', cost: 9000000, bonus: 'x2 CPS', type: 'multiplier', value: 2, target: 'cps' },
  ],
  'hybrid-upgrades': [
    { id: 'click-sync', emoji: '🔗', name: 'Click Sync', cost: 20000, bonus: 'Clicking boosts CPS by 3%', type: 'hybrid', value: 0.03 },
    { id: 'idle-surge', emoji: '🌊', name: 'Idle Surge', cost: 80000, bonus: 'CPS boosts CPC by 8%', type: 'hybrid', value: 0.08 },
    { id: 'combo-engine', emoji: '🧩', name: 'Combo Engine', cost: 320000, bonus: 'Clicking boosts CPS temporarily', type: 'hybrid', value: 0 },
    { id: 'feedback-loop', emoji: '🔄', name: 'Feedback Loop', cost: 1200000, bonus: 'CPS increases click power', type: 'hybrid', value: 0 },
  ],
  'god-tier': [
    { id: 'double-click', emoji: '✌️', name: 'Double Click', cost: 5000000, bonus: 'x1.6 CPC', type: 'multiplier', value: 1.6, target: 'cpc' },
    { id: 'triple-tap', emoji: '🔱', name: 'Triple Tap', cost: 20000000, bonus: 'x1.8 CPC', type: 'multiplier', value: 1.8, target: 'cpc' },
    { id: 'overdrive', emoji: '🔥', name: 'Overdrive', cost: 80000000, bonus: 'x1.15 ALL', type: 'all-multiplier', value: 1.15 },
    { id: 'hyper-mode', emoji: '🌟', name: 'Hyper Mode', cost: 300000000, bonus: 'x1.2 ALL', type: 'all-multiplier', value: 1.2 },
    { id: 'insanity-boost', emoji: '🌀', name: 'Insanity Boost', cost: 1200000000, bonus: 'x1.25 ALL', type: 'all-multiplier', value: 1.25 },
    { id: 'reality-break', emoji: '💥', name: 'Reality Break', cost: 4500000000, bonus: 'x1.35 ALL', type: 'all-multiplier', value: 1.35 },
  ],
  'endgame': [
    { id: 'mega-click-core', emoji: '🧠', name: 'Mega Click Core', cost: 150000000, bonus: 'x10 CPC', type: 'multiplier', value: 10, target: 'cpc' },
    { id: 'auto-farm-ai', emoji: '🛰️', name: 'Auto Farm AI', cost: 450000000, bonus: 'x1.4 CPS', type: 'multiplier', value: 1.4, target: 'cps' },
    { id: 'time-acceleration', emoji: '⏩', name: 'Time Acceleration', cost: 1200000000, bonus: 'Game speed x2', type: 'game-speed', value: 2 },
    { id: 'infinite-loop', emoji: '♾️', name: 'Infinite Loop', cost: 3500000000, bonus: 'CPS heavily boosts CPC', type: 'hybrid', value: 0.5 },
    { id: 'singularity-tap', emoji: '🕳️', name: 'Singularity Tap', cost: 10000000000, bonus: 'Massive scaling', type: 'hybrid', value: 1 },
  ],
};

Object.entries(UPGRADES).forEach(([, upgrades]) => {
  upgrades.forEach((upgrade, index) => {
    upgrade.requires = index > 0 ? upgrades[index - 1].id : null;
  });
});

const UPGRADE_ORDER = Object.keys(UPGRADES);

const gameState = {
  cookies: 0,
  cookieCarry: 0,
  baseCpc: 1,
  baseCps: 0,
  cpcMultiplier: 1,
  cpsMultiplier: 1,
  globalMultiplier: 1,
  gameSpeedMultiplier: 1,
  comboStacks: 0,
  comboExpiresAt: 0,
  lastHumanClickAt: 0,
  clickTimestamps: [],
  suspicionScore: 0,
  lastSuspicionAt: 0,
  warnings: 0,
  leaderboardInvalid: false,
  leaderboardBanned: false,
  isLoggedIn: Boolean(window.PlayrAuth && window.PlayrAuth.isLoggedIn) || localStorage.getItem('playrLoggedIn') === 'true',
  purchased: new Set(),
  activeTab: 'click-upgrades',
  autoTickHandle: null,
  autosaveHandle: null,
  lastSaveAt: 0,
  isWarningModalOpen: false,
  isRebirthCutsceneOpen: false,
  pendingModalConfirmAction: null,
  pendingRebirthCompleteAction: null,
  rebirthCount: 0,
  adminEnabled: false,
  adminSidebarOpen: false,
  adminScoreSnapshot: null,
  ownerWarningsDisabled: false,
};

const dom = {
  cookieBtn: document.getElementById('cookieBtn'),
  cookieImage: document.getElementById('cookieImage'),
  cookieFallback: document.getElementById('cookieFallback'),
  cookieWorkbench: document.getElementById('cookieWorkbench'),
  cookieCount: document.getElementById('cookieCount'),
  cpcDisplay: document.getElementById('cpcDisplay'),
  cpsDisplay: document.getElementById('cpsDisplay'),
  warningCount: document.getElementById('warningCount'),
  leaderboardStatus: document.getElementById('leaderboardStatus'),
  rebirthStatus: document.getElementById('rebirthStatus'),
  crumbsContainer: document.getElementById('crumbsContainer'),
  popupContainer: document.getElementById('popupContainer'),
  upgradesContainer: document.getElementById('upgradesContainer'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  rebirthBtn: document.getElementById('rebirthBtn'),
  warningOverlay: document.getElementById('warningOverlay'),
  warningTitle: document.getElementById('warningTitle'),
  warningMessage: document.getElementById('warningMessage'),
  warningCancelBtn: document.getElementById('warningCancelBtn'),
  warningOkBtn: document.getElementById('warningOkBtn'),
  rebirthCutsceneOverlay: document.getElementById('rebirthCutsceneOverlay'),
  rebirthCutsceneText: document.getElementById('rebirthCutsceneText'),
  rebirthCutsceneOkBtn: document.getElementById('rebirthCutsceneOkBtn'),
  adminSidebarToggleBtn: document.getElementById('adminSidebarToggleBtn'),
  adminTools: document.getElementById('adminTools'),
  adminModeBtn: document.getElementById('adminModeBtn'),
  adminCookieInput: document.getElementById('adminCookieInput'),
  adminAddCookiesBtn: document.getElementById('adminAddCookiesBtn'),
  adminResetScoresBtn: document.getElementById('adminResetScoresBtn'),
  adminRevertScoresBtn: document.getElementById('adminRevertScoresBtn'),
  adminClearWarningsBtn: document.getElementById('adminClearWarningsBtn'),
  adminToggleWarningsBtn: document.getElementById('adminToggleWarningsBtn'),
  adminInfo: document.getElementById('adminInfo'),
};

function shouldSkipWarningsForOwner() {
  return Boolean(isOwnerAccount() && gameState.ownerWarningsDisabled);
}

function hasUpgrade(id) {
  return gameState.purchased.has(id);
}

function getUpgradeById(id) {
  for (const upgrades of Object.values(UPGRADES)) {
    const match = upgrades.find((upgrade) => upgrade.id === id);
    if (match) return match;
  }
  return null;
}

function getUpgradeCount(ids) {
  return ids.reduce((count, id) => count + (hasUpgrade(id) ? 1 : 0), 0);
}

function getTotalUpgradeCount() {
  return Object.values(UPGRADES).reduce((sum, upgrades) => sum + upgrades.length, 0);
}

function isUiBlocked() {
  return gameState.isWarningModalOpen || gameState.isRebirthCutsceneOpen;
}

function hasAllUpgradesPurchased() {
  return gameState.purchased.size >= getTotalUpgradeCount();
}

function getRebirthBoostPercent() {
  let boost = 0;
  for (let i = 0; i < gameState.rebirthCount; i += 1) {
    boost += REBIRTH_CONFIG.tierBoosts[i] || 0;
  }
  return boost;
}

function getRebirthMultiplier() {
  return 1 + getRebirthBoostPercent();
}

function getFeedbackLoopCap() {
  return HYBRID_CONFIG.feedbackLoopBaseCpsCap * getRebirthMultiplier();
}

function getNextRebirthCost() {
  return REBIRTH_CONFIG.costs[gameState.rebirthCount] ?? null;
}

function renderRebirthUi() {
  const boostPercent = Math.round(getRebirthBoostPercent() * 100);
  if (dom.rebirthStatus) {
    dom.rebirthStatus.textContent = `Rebirth: ${gameState.rebirthCount}/${REBIRTH_CONFIG.maxRebirths} (+${boostPercent}%)`;
  }

  if (!dom.rebirthBtn) return;

  if (gameState.rebirthCount >= REBIRTH_CONFIG.maxRebirths) {
    dom.rebirthBtn.disabled = true;
    dom.rebirthBtn.textContent = 'Rebirth Maxed';
    return;
  }

  if (!hasAllUpgradesPurchased()) {
    dom.rebirthBtn.disabled = true;
    dom.rebirthBtn.textContent = 'Rebirth Locked';
    return;
  }

  const cost = getNextRebirthCost();
  dom.rebirthBtn.disabled = false;
  dom.rebirthBtn.textContent = `Rebirth (${formatNumber(cost)})`;
}

function applyUpgradeEffects(upgrade) {
  if (!upgrade) return;

  if (upgrade.type === 'cpc') {
    gameState.baseCpc += upgrade.value;
  } else if (upgrade.type === 'cps') {
    gameState.baseCps += upgrade.value;
  } else if (upgrade.type === 'multiplier') {
    if (upgrade.target === 'cpc') gameState.cpcMultiplier *= upgrade.value;
    if (upgrade.target === 'cps') gameState.cpsMultiplier *= upgrade.value;
    if (upgrade.target === 'both') {
      gameState.cpcMultiplier *= upgrade.value;
      gameState.cpsMultiplier *= upgrade.value;
    }
  } else if (upgrade.type === 'all-multiplier') {
    gameState.globalMultiplier *= upgrade.value;
  } else if (upgrade.type === 'game-speed') {
    gameState.gameSpeedMultiplier *= upgrade.value;
  }

  if (upgrade.id === 'time-acceleration') {
    gameState.gameSpeedMultiplier = 2;
  }
}

function rebuildPurchasedUpgradeEffects() {
  gameState.baseCpc = 1;
  gameState.baseCps = 0;
  gameState.cpcMultiplier = 1;
  gameState.cpsMultiplier = 1;
  gameState.globalMultiplier = 1;
  gameState.gameSpeedMultiplier = 1;

  UPGRADE_ORDER.forEach((category) => {
    const upgrades = UPGRADES[category] || [];
    upgrades.forEach((upgrade) => {
      if (gameState.purchased.has(upgrade.id)) {
        applyUpgradeEffects(upgrade);
      }
    });
  });
}

function getEffectiveStats() {
  let cpc = gameState.baseCpc;
  let cps = gameState.baseCps;
  const cpcMultiplier = gameState.cpcMultiplier;
  const cpsMultiplier = gameState.cpsMultiplier;
  let allMultiplier = gameState.globalMultiplier;
  let speedMultiplier = gameState.gameSpeedMultiplier;

  if (hasUpgrade('click-sync') && Date.now() - gameState.lastHumanClickAt < 1200) {
    cps *= 1.03;
  }

  if (hasUpgrade('combo-engine')) {
    cps *= 1 + Math.min(gameState.comboStacks, 8) * 0.01;
  }

  if (hasUpgrade('idle-surge')) {
    cpc += cps * 0.08;
  }

  if (hasUpgrade('feedback-loop')) {
    cps += cpc * 0.005;
  }

  if (hasUpgrade('infinite-loop')) {
    cpc += cps * 0.15;
  }

  if (hasUpgrade('singularity-tap')) {
    const scale = 1 + Math.log10(gameState.cookies + 10) / 12;
    cpc *= scale;
    cps *= scale;
  }

  cpc *= cpcMultiplier;
  cps *= cpsMultiplier;

  cpc *= allMultiplier;
  cps *= allMultiplier * speedMultiplier;

  const rebirthMultiplier = getRebirthMultiplier();
  cpc *= rebirthMultiplier;
  cps *= rebirthMultiplier;

  return {
    cpc: Math.max(1, cpc),
    cps: Math.max(0, cps),
  };
}

function renderStats() {
  const stats = getEffectiveStats();
  dom.cookieCount.textContent = formatNumber(gameState.cookies);
  dom.cpcDisplay.textContent = formatNumber(stats.cpc);
  dom.cpsDisplay.textContent = formatNumber(stats.cps);
  dom.warningCount.textContent = `Warnings: ${gameState.warnings}`;

  let leaderboardLabel = 'Clean';
  if (shouldSkipWarningsForOwner()) {
    leaderboardLabel = 'Warnings disabled (Owner)';
  } else if (gameState.warnings >= CHEAT_CONFIG.warningThreshold) {
    leaderboardLabel = gameState.isLoggedIn ? 'Leaderboard banned' : 'Score invalid';
  } else if (gameState.warnings > 0) {
    leaderboardLabel = `Warning ${gameState.warnings}/${CHEAT_CONFIG.warningThreshold}`;
  }
  dom.leaderboardStatus.textContent = `Leaderboard: ${leaderboardLabel}`;
  renderRebirthUi();
}

function renderUpgrades() {
  const activeCategory = gameState.activeTab;
  const upgrades = UPGRADES[activeCategory] || [];

  const nextUpgrade = upgrades.find((upgrade) => !hasUpgrade(upgrade.id));

  if (!nextUpgrade) {
    dom.upgradesContainer.innerHTML = `
      <div class="upgrade-item purchased" data-affordable="false">
        <div class="upgrade-name">✅ ${activeCategory.replace('-', ' ').toUpperCase()} complete</div>
        <div class="upgrade-bonus">You purchased every upgrade in this category.</div>
      </div>
    `;
    return;
  }

  const prereqMet = !nextUpgrade.requires || hasUpgrade(nextUpgrade.requires);
  const affordable = gameState.cookies >= nextUpgrade.cost;
  const unlocked = prereqMet;
  const lockedClass = unlocked ? '' : 'locked needs-prereq';
  const prereq = nextUpgrade.requires ? getUpgradeById(nextUpgrade.requires) : null;

  dom.upgradesContainer.innerHTML = `
    <div class="upgrade-item ${lockedClass}" data-upgrade-id="${nextUpgrade.id}" data-affordable="${affordable && unlocked ? 'true' : 'false'}">
      <div class="upgrade-name"><span class="upgrade-emoji">${nextUpgrade.emoji}</span> ${nextUpgrade.name}</div>
      <div class="upgrade-cost">Cost: ${formatNumber(nextUpgrade.cost)} cookies</div>
      <div class="upgrade-bonus">${nextUpgrade.bonus}</div>
      ${prereq && !prereqMet ? `<div class="upgrade-locked-reason">Requires ${prereq.name}</div>` : ''}
      ${prereqMet ? '<div class="upgrade-lock-badge">Ready when you can afford it</div>' : ''}
    </div>
  `;
}

function renderTabState() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === gameState.activeTab);
  });
}

function updateCookieButtonState() {
  const stats = getEffectiveStats();
  dom.cookieBtn.disabled = false;
  dom.cookieBtn.setAttribute('aria-label', `Click the cookie. Current cookies per click: ${formatNumber(stats.cpc)}`);
}

function pruneClickHistory(now) {
  gameState.clickTimestamps = gameState.clickTimestamps.filter((timestamp) => now - timestamp <= 5000);
}

function evaluateClickPattern(now) {
  pruneClickHistory(now);
  const clicks1s = gameState.clickTimestamps.filter((timestamp) => now - timestamp <= CHEAT_CONFIG.windowMs).length;
  const clicks3s = gameState.clickTimestamps.filter((timestamp) => now - timestamp <= 3000).length;
  const interval = gameState.lastHumanClickAt ? now - gameState.lastHumanClickAt : Infinity;

  let suspicionGain = 0;
  if (interval < 55) suspicionGain += 2;
  else if (interval < 90) suspicionGain += 1;

  if (clicks1s > CHEAT_CONFIG.softCpsThreshold) {
    suspicionGain += Math.min(3, clicks1s - CHEAT_CONFIG.softCpsThreshold);
  }
  if (clicks1s > CHEAT_CONFIG.hardCpsThreshold) {
    suspicionGain += 2;
  }
  if (clicks3s > 25) {
    suspicionGain += 1;
  }

  if (now - gameState.lastSuspicionAt > CHEAT_CONFIG.decayMs) {
    gameState.suspicionScore = Math.max(0, gameState.suspicionScore - 1);
  }

  if (suspicionGain > 0) {
    gameState.suspicionScore += suspicionGain;
    gameState.lastSuspicionAt = now;
  }

  if (gameState.suspicionScore >= CHEAT_CONFIG.warningThreshold) {
    issueWarning(`Unnatural clicking detected (${clicks1s} CPS in the last second).`);
    gameState.suspicionScore = 0;
  }
}

function issueWarning(message) {
  if (shouldSkipWarningsForOwner()) {
    return;
  }

  gameState.warnings += 1;
  if (gameState.warnings >= CHEAT_CONFIG.warningThreshold) {
    gameState.leaderboardInvalid = true;
    gameState.leaderboardBanned = gameState.isLoggedIn;
  }

  showWarningModal(message);
  renderStats();
  saveGame(true);
}

function showWarningModal(message, options = {}) {
  if (!dom.warningOverlay || !dom.warningMessage || !dom.warningTitle) {
    return;
  }

  const title = options.title || 'Warning';
  const confirmText = options.confirmText || 'OK';
  const showCancel = Boolean(options.showCancel);

  gameState.pendingModalConfirmAction = typeof options.onConfirm === 'function' ? options.onConfirm : null;
  gameState.isWarningModalOpen = true;
  dom.warningTitle.textContent = title;
  dom.warningMessage.textContent = message;
  if (dom.warningOkBtn) {
    dom.warningOkBtn.textContent = confirmText;
  }
  if (dom.warningCancelBtn) {
    dom.warningCancelBtn.hidden = !showCancel;
  }
  dom.warningOverlay.classList.remove('hidden');
}

function closeWarningModal() {
  if (!dom.warningOverlay) {
    return;
  }

  gameState.isWarningModalOpen = false;
  gameState.pendingModalConfirmAction = null;
  dom.warningOverlay.classList.add('hidden');
}

function showRebirthCutscene(nextTierBoostPercent, onComplete) {
  if (!dom.rebirthCutsceneOverlay || !dom.rebirthCutsceneText || !dom.rebirthCutsceneOkBtn) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  gameState.isRebirthCutsceneOpen = true;
  gameState.pendingRebirthCompleteAction = typeof onComplete === 'function' ? onComplete : null;

  dom.rebirthCutsceneText.textContent = 'Reality tears open... your cookie empire collapses into stardust.';
  dom.rebirthCutsceneOkBtn.hidden = true;
  dom.rebirthCutsceneOverlay.classList.remove('hidden');

  setTimeout(() => {
    if (!gameState.isRebirthCutsceneOpen) return;
    dom.rebirthCutsceneText.textContent = `Rebirth complete. Permanent boost unlocked: +${nextTierBoostPercent}%`;
    dom.rebirthCutsceneOkBtn.hidden = false;
  }, 2800);
}

function onRebirthCutsceneOk() {
  if (!dom.rebirthCutsceneOverlay) return;

  const callback = gameState.pendingRebirthCompleteAction;
  gameState.pendingRebirthCompleteAction = null;
  gameState.isRebirthCutsceneOpen = false;
  dom.rebirthCutsceneOverlay.classList.add('hidden');

  if (callback) {
    callback();
  }
}

function onModalConfirm() {
  const callback = gameState.pendingModalConfirmAction;
  closeWarningModal();
  if (callback) {
    callback();
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'click-popup';
  toast.style.left = '50%';
  toast.style.top = '18%';
  toast.style.fontSize = '0.95rem';
  toast.textContent = message;
  dom.popupContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 1200);
}

function gainCookies(amount) {
  gameState.cookieCarry += amount;
  const wholeCookies = Math.floor(gameState.cookieCarry);
  if (wholeCookies > 0) {
    gameState.cookies += wholeCookies;
    gameState.cookieCarry -= wholeCookies;
  }
}

function createCrumbs() {
  const count = Math.random() < 0.5 ? 4 : 8;
  for (let i = 0; i < count; i += 1) {
    const crumb = document.createElement('div');
    crumb.className = 'crumb';
    crumb.textContent = ['🥐', '✨', '⭐', '💫'][Math.floor(Math.random() * 4)];
    const angle = (Math.PI * 2 * i) / count;
    const distance = 80 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance + Math.random() * 40 - 20;
    crumb.style.setProperty('--tx', `${tx}px`);
    crumb.style.setProperty('--ty', `${ty}px`);
    crumb.style.left = '50%';
    crumb.style.top = '50%';
    dom.crumbsContainer.appendChild(crumb);
    setTimeout(() => crumb.remove(), 1200);
  }
}

function createClickPopup(x, y, amount) {
  const popup = document.createElement('div');
  popup.className = 'click-popup';
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.textContent = `+${formatNumber(amount)}`;
  dom.popupContainer.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

function clickCookie(event) {
  if (isUiBlocked()) return;

  const now = Date.now();
  const stats = getEffectiveStats();
  const earned = Math.max(1, Math.floor(stats.cpc));

  gameState.clickTimestamps.push(now);
  evaluateClickPattern(now);

  const clickGap = gameState.lastHumanClickAt ? now - gameState.lastHumanClickAt : Infinity;
  gameState.lastHumanClickAt = now;
  gameState.comboExpiresAt = now + 2200;
  if (clickGap < 650) {
    gameState.comboStacks = Math.min(gameState.comboStacks + 1, 20);
  } else {
    gameState.comboStacks = 1;
  }

  gainCookies(earned);
  createCrumbs();
  const area = dom.cookieBtn.closest('.cookie-clicker');
  const areaRect = area.getBoundingClientRect();
  createClickPopup(event.clientX - areaRect.left, event.clientY - areaRect.top, earned);

  if (hasUpgrade('feedback-loop')) {
    const cap = getFeedbackLoopCap();
    if (gameState.baseCps < cap) {
      gameState.baseCps = Math.min(cap, gameState.baseCps + Math.max(0, earned * HYBRID_CONFIG.feedbackLoopClickGainFactor));
    }
  }

  renderStats();
  renderUpgrades();
  saveGame(false);
}

function purchaseUpgrade(upgradeId) {
  const upgrade = getUpgradeById(upgradeId);
  if (!upgrade) return false;
  if (gameState.purchased.has(upgradeId)) return false;
  if (upgrade.requires && !hasUpgrade(upgrade.requires)) return false;
  if (gameState.cookies < upgrade.cost) return false;

  gameState.cookies -= upgrade.cost;
  gameState.purchased.add(upgradeId);

  applyUpgradeEffects(upgrade);

  renderStats();
  renderUpgrades();
  saveGame(false);
  return true;
}

function performRebirth() {
  if (gameState.rebirthCount >= REBIRTH_CONFIG.maxRebirths) {
    showWarningModal('You already reached the final rebirth tier.', { title: 'Rebirth' });
    return;
  }

  if (!hasAllUpgradesPurchased()) {
    showWarningModal('Rebirth unlocks only after purchasing all upgrades in every category.', { title: 'Rebirth Locked' });
    return;
  }

  const cost = getNextRebirthCost();
  if (gameState.cookies < cost) {
    showWarningModal(`You need ${formatNumber(cost)} cookies to rebirth.`, { title: 'Not Enough Cookies' });
    return;
  }

  const nextTierBoost = Math.round((REBIRTH_CONFIG.tierBoosts[gameState.rebirthCount] || 0) * 100);
  showWarningModal(
    `Spend ${formatNumber(cost)} cookies to rebirth? This resets upgrades and run progress, and grants a permanent +${nextTierBoost}% boost.`,
    {
      title: 'Confirm Rebirth',
      confirmText: 'Rebirth',
      showCancel: true,
      onConfirm: () => {
        gameState.cookies = 0;
        gameState.cookieCarry = 0;
        gameState.baseCpc = 1;
        gameState.baseCps = 0;
        gameState.cpcMultiplier = 1;
        gameState.cpsMultiplier = 1;
        gameState.globalMultiplier = 1;
        gameState.gameSpeedMultiplier = 1;
        gameState.comboStacks = 0;
        gameState.comboExpiresAt = 0;
        gameState.lastHumanClickAt = 0;
        gameState.clickTimestamps = [];
        gameState.suspicionScore = 0;
        gameState.lastSuspicionAt = 0;
        gameState.warnings = 0;
        gameState.leaderboardInvalid = false;
        gameState.leaderboardBanned = false;
        gameState.purchased.clear();
        gameState.activeTab = 'click-upgrades';
        gameState.rebirthCount += 1;

        renderTabState();
        renderStats();
        renderUpgrades();
        updateCookieButtonState();
        saveGame(false);

        showRebirthCutscene(nextTierBoost, () => {
          const totalBoost = Math.round(getRebirthBoostPercent() * 100);
          showWarningModal(`Rebirth complete. Total permanent boost is now +${totalBoost}%.`, { title: 'Rebirth Complete' });
        });
      },
    }
  );
}

function tick() {
  if (isUiBlocked()) return;

  const now = Date.now();
  if (gameState.comboExpiresAt && now > gameState.comboExpiresAt) {
    gameState.comboStacks = 0;
  }

  const stats = getEffectiveStats();
  gainCookies(stats.cps * 0.25);
  renderStats();
  renderUpgrades();
  updateCookieButtonState();
}

function saveGame(isSystemSave) {
  const saveData = {
    cookies: gameState.cookies,
    cookieCarry: gameState.cookieCarry,
    baseCpc: gameState.baseCpc,
    baseCps: gameState.baseCps,
    cpcMultiplier: gameState.cpcMultiplier,
    cpsMultiplier: gameState.cpsMultiplier,
    globalMultiplier: gameState.globalMultiplier,
    gameSpeedMultiplier: gameState.gameSpeedMultiplier,
    comboStacks: gameState.comboStacks,
    warnings: gameState.warnings,
    leaderboardInvalid: gameState.leaderboardInvalid,
    leaderboardBanned: gameState.leaderboardBanned,
    rebirthCount: gameState.rebirthCount,
    ownerWarningsDisabled: gameState.ownerWarningsDisabled,
    purchased: Array.from(gameState.purchased),
    activeTab: gameState.activeTab,
  };

  localStorage.setItem(COOKIE_SAVE_KEY, JSON.stringify(saveData));
  gameState.lastSaveAt = Date.now();

  if (!isSystemSave && dom.saveBtn) {
    dom.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      dom.saveBtn.textContent = 'Save Progress';
    }, 1500);
  }
}

function loadGame() {
  const saved = localStorage.getItem(COOKIE_SAVE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    gameState.cookies = data.cookies || 0;
    gameState.cookieCarry = data.cookieCarry || 0;
    gameState.baseCpc = data.baseCpc || 1;
    gameState.baseCps = data.baseCps || 0;
    gameState.cpcMultiplier = data.cpcMultiplier || 1;
    gameState.cpsMultiplier = data.cpsMultiplier || 1;
    gameState.globalMultiplier = data.globalMultiplier || 1;
    gameState.gameSpeedMultiplier = data.gameSpeedMultiplier || 1;
    gameState.comboStacks = data.comboStacks || 0;
    gameState.warnings = data.warnings || 0;
    gameState.leaderboardInvalid = Boolean(data.leaderboardInvalid);
    gameState.leaderboardBanned = Boolean(data.leaderboardBanned);
    gameState.rebirthCount = Math.max(0, Math.min(Number(data.rebirthCount || 0), REBIRTH_CONFIG.maxRebirths));
    gameState.ownerWarningsDisabled = Boolean(data.ownerWarningsDisabled);
    gameState.purchased = new Set(data.purchased || []);
    gameState.activeTab = data.activeTab || 'click-upgrades';

    // Normalize upgrade effects for legacy saves so changed upgrade rules apply correctly.
    rebuildPurchasedUpgradeEffects();
  } catch (error) {
    console.error('Failed to load Cookie Clicker save:', error);
  }
}

function resetGame() {
  showWarningModal('Are you sure you want to reset? This clears all progress, including rebirth bonuses.', {
    title: 'Confirm Reset',
    confirmText: 'Reset',
    showCancel: true,
    onConfirm: () => {
      gameState.cookies = 0;
      gameState.cookieCarry = 0;
      gameState.baseCpc = 1;
      gameState.baseCps = 0;
      gameState.cpcMultiplier = 1;
      gameState.cpsMultiplier = 1;
      gameState.globalMultiplier = 1;
      gameState.gameSpeedMultiplier = 1;
      gameState.comboStacks = 0;
      gameState.comboExpiresAt = 0;
      gameState.lastHumanClickAt = 0;
      gameState.clickTimestamps = [];
      gameState.suspicionScore = 0;
      gameState.lastSuspicionAt = 0;
      gameState.warnings = 0;
      gameState.leaderboardInvalid = false;
      gameState.leaderboardBanned = false;
      gameState.rebirthCount = 0;
      gameState.purchased.clear();
      localStorage.removeItem(COOKIE_SAVE_KEY);

      gameState.activeTab = 'click-upgrades';
      renderTabState();
      renderStats();
      renderUpgrades();
      updateCookieButtonState();
    },
  });
}

function bindEvents() {
  dom.cookieBtn.addEventListener('click', clickCookie);

  if (dom.cookieImage) {
    dom.cookieImage.addEventListener('error', () => {
      dom.cookieImage.hidden = true;
      if (dom.cookieFallback) dom.cookieFallback.hidden = false;
    });
  }

  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      gameState.activeTab = button.dataset.tab;
      renderTabState();
      renderUpgrades();
    });
  });

  dom.upgradesContainer.addEventListener('click', (event) => {
    const item = event.target.closest('.upgrade-item');
    if (!item) return;
    if (item.dataset.affordable !== 'true') return;
    purchaseUpgrade(item.dataset.upgradeId);
  });

  dom.saveBtn.addEventListener('click', () => saveGame(false));
  dom.resetBtn.addEventListener('click', resetGame);
  if (dom.rebirthBtn) {
    dom.rebirthBtn.addEventListener('click', performRebirth);
  }

  if (dom.warningOkBtn) {
    dom.warningOkBtn.addEventListener('click', onModalConfirm);
  }
  if (dom.warningCancelBtn) {
    dom.warningCancelBtn.addEventListener('click', closeWarningModal);
  }
  if (dom.rebirthCutsceneOkBtn) {
    dom.rebirthCutsceneOkBtn.addEventListener('click', onRebirthCutsceneOk);
  }

  if (dom.adminSidebarToggleBtn) {
    dom.adminSidebarToggleBtn.addEventListener('click', () => {
      if (!isOwnerAccount()) return;
      gameState.adminSidebarOpen = !gameState.adminSidebarOpen;
      refreshAdminSidebarUi();
    });
  }

  if (dom.adminModeBtn) {
    dom.adminModeBtn.addEventListener('click', () => {
      if (!isOwnerAccount()) {
        refreshAdminControlsUi();
        return;
      }
      gameState.adminEnabled = !gameState.adminEnabled;
      refreshAdminControlsUi();
    });
  }
  refreshAdminControlsUi();

  if (dom.adminAddCookiesBtn) {
    dom.adminAddCookiesBtn.addEventListener('click', () => {
      addAdminCookies();
    });
  }

  if (dom.adminResetScoresBtn) {
    dom.adminResetScoresBtn.addEventListener('click', () => {
      resetAdminScores();
    });
  }

  if (dom.adminRevertScoresBtn) {
    dom.adminRevertScoresBtn.addEventListener('click', () => {
      revertAdminScores();
    });
  }

  if (dom.adminClearWarningsBtn) {
    dom.adminClearWarningsBtn.addEventListener('click', () => {
      clearAdminWarnings();
    });
  }

  if (dom.adminToggleWarningsBtn) {
    dom.adminToggleWarningsBtn.addEventListener('click', () => {
      toggleOwnerWarningBypass();
    });
  }

  window.addEventListener('playr-auth-changed', () => {
    if (!isOwnerAccount()) {
      gameState.adminEnabled = false;
    }
    if (isOwnerAccount() && !gameState.adminSidebarOpen) {
      gameState.adminSidebarOpen = true;
    }
    refreshAdminSidebarUi();
    refreshAdminControlsUi();
  });
}

function startLoops() {
  if (gameState.autoTickHandle) clearInterval(gameState.autoTickHandle);
  if (gameState.autosaveHandle) clearInterval(gameState.autosaveHandle);

  gameState.autoTickHandle = setInterval(tick, 250);
  gameState.autosaveHandle = setInterval(() => saveGame(true), 30000);
}

function isOwnerAccount() {
	try {
		if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
			const user = window.PlayrAuth.getCurrentUser();
			if (String(user?.identifier || '').trim().toLowerCase() === 'owner@playr.io') {
				return true;
			}
		}
	} catch {
		// no-op
	}

	try {
		const raw = localStorage.getItem('playrCurrentUser');
		if (!raw) return false;
		const parsed = JSON.parse(raw);
		return String(parsed?.identifier || '').trim().toLowerCase() === 'owner@playr.io';
	} catch {
		return false;
	}
}

function refreshAdminSidebarUi() {
	const isOwner = isOwnerAccount();
  if (dom.cookieWorkbench) {
    dom.cookieWorkbench.classList.toggle('admin-open', isOwner && gameState.adminSidebarOpen);
  }
	if (dom.adminSidebarToggleBtn) {
		dom.adminSidebarToggleBtn.hidden = !isOwner;
		dom.adminSidebarToggleBtn.textContent = gameState.adminSidebarOpen ? 'Hide Admin' : 'Show Admin';
	}

	if (!dom.adminTools) return;
	if (!isOwner) {
		dom.adminTools.hidden = true;
		gameState.adminSidebarOpen = false;
    if (dom.cookieWorkbench) {
      dom.cookieWorkbench.classList.remove('admin-open');
    }
		return;
	}

	dom.adminTools.hidden = !gameState.adminSidebarOpen;
}

function refreshAdminControlsUi() {
	if (!dom.adminTools) return;
  if (dom.adminModeBtn) {
    dom.adminModeBtn.textContent = gameState.adminEnabled ? 'Disable Admin' : 'Enable Admin';
    dom.adminModeBtn.setAttribute('aria-pressed', String(gameState.adminEnabled));
    dom.adminModeBtn.disabled = !isOwnerAccount();
  }
	if (dom.adminCookieInput) dom.adminCookieInput.disabled = !gameState.adminEnabled;
	if (dom.adminAddCookiesBtn) dom.adminAddCookiesBtn.disabled = !gameState.adminEnabled;
	if (dom.adminResetScoresBtn) dom.adminResetScoresBtn.disabled = !gameState.adminEnabled;
	if (dom.adminRevertScoresBtn) dom.adminRevertScoresBtn.disabled = !gameState.adminEnabled || !gameState.adminScoreSnapshot;
	if (dom.adminClearWarningsBtn) dom.adminClearWarningsBtn.disabled = !gameState.adminEnabled;
	if (dom.adminToggleWarningsBtn) {
		dom.adminToggleWarningsBtn.disabled = !gameState.adminEnabled;
		dom.adminToggleWarningsBtn.textContent = gameState.ownerWarningsDisabled ? 'Enable Warnings' : 'Disable Warnings';
	}
  if (dom.adminInfo) {
    if (!isOwnerAccount()) {
      dom.adminInfo.textContent = 'Admin controls are restricted to the Owner account.';
    } else if (gameState.adminEnabled) {
      dom.adminInfo.textContent = gameState.ownerWarningsDisabled
        ? 'Admin enabled. Owner warning enforcement is currently disabled.'
        : 'Admin enabled. Use the buttons above to adjust this run.';
    } else {
      dom.adminInfo.textContent = 'Admin is locked until you enable it as the Owner account.';
    }
  }
}

function captureAdminScoreSnapshotIfNeeded() {
	if (gameState.adminScoreSnapshot) return;
	gameState.adminScoreSnapshot = {
		cookies: gameState.cookies,
		cookieCarry: gameState.cookieCarry,
    activeTab: gameState.activeTab,
		baseCpc: gameState.baseCpc,
		baseCps: gameState.baseCps,
		cpcMultiplier: gameState.cpcMultiplier,
		cpsMultiplier: gameState.cpsMultiplier,
		globalMultiplier: gameState.globalMultiplier,
		gameSpeedMultiplier: gameState.gameSpeedMultiplier,
    comboStacks: gameState.comboStacks,
		rebirthCount: gameState.rebirthCount,
		warnings: gameState.warnings,
		leaderboardInvalid: gameState.leaderboardInvalid,
		leaderboardBanned: gameState.leaderboardBanned,
    ownerWarningsDisabled: gameState.ownerWarningsDisabled,
    purchased: Array.from(gameState.purchased),
	};
}

function addAdminCookies() {
	if (!gameState.adminEnabled) return;
	captureAdminScoreSnapshotIfNeeded();
	const amount = Number(dom.adminCookieInput?.value || 0);
	if (!Number.isFinite(amount) || amount < 0) return;
	gameState.cookies += Math.floor(amount);
	renderStats();
	saveGame(true);
}

function resetAdminScores() {
	if (!gameState.adminEnabled) return;
	captureAdminScoreSnapshotIfNeeded();
	gameState.cookies = 0;
	gameState.cookieCarry = 0;
  gameState.activeTab = 'click-upgrades';
  gameState.baseCpc = 1;
  gameState.baseCps = 0;
  gameState.cpcMultiplier = 1;
  gameState.cpsMultiplier = 1;
  gameState.globalMultiplier = 1;
  gameState.gameSpeedMultiplier = 1;
  gameState.comboStacks = 0;
  gameState.comboExpiresAt = 0;
  gameState.lastHumanClickAt = 0;
  gameState.clickTimestamps = [];
  gameState.suspicionScore = 0;
  gameState.lastSuspicionAt = 0;
  gameState.warnings = 0;
  gameState.leaderboardInvalid = false;
  gameState.leaderboardBanned = false;
  gameState.rebirthCount = 0;
  gameState.purchased.clear();
  renderTabState();
  renderUpgrades();
  renderRebirthUi();
	renderStats();
	saveGame(true);
}

function revertAdminScores() {
	if (!gameState.adminEnabled || !gameState.adminScoreSnapshot) return;
	gameState.cookies = gameState.adminScoreSnapshot.cookies;
	gameState.cookieCarry = gameState.adminScoreSnapshot.cookieCarry;
	gameState.activeTab = gameState.adminScoreSnapshot.activeTab;
	gameState.baseCpc = gameState.adminScoreSnapshot.baseCpc;
	gameState.baseCps = gameState.adminScoreSnapshot.baseCps;
	gameState.cpcMultiplier = gameState.adminScoreSnapshot.cpcMultiplier;
	gameState.cpsMultiplier = gameState.adminScoreSnapshot.cpsMultiplier;
	gameState.globalMultiplier = gameState.adminScoreSnapshot.globalMultiplier;
	gameState.gameSpeedMultiplier = gameState.adminScoreSnapshot.gameSpeedMultiplier;
	gameState.comboStacks = gameState.adminScoreSnapshot.comboStacks;
	gameState.rebirthCount = gameState.adminScoreSnapshot.rebirthCount;
	gameState.warnings = gameState.adminScoreSnapshot.warnings;
	gameState.leaderboardInvalid = gameState.adminScoreSnapshot.leaderboardInvalid;
	gameState.leaderboardBanned = gameState.adminScoreSnapshot.leaderboardBanned;
	gameState.ownerWarningsDisabled = Boolean(gameState.adminScoreSnapshot.ownerWarningsDisabled);
	gameState.purchased = new Set(gameState.adminScoreSnapshot.purchased || []);
	gameState.adminScoreSnapshot = null;
	renderTabState();
	renderUpgrades();
	renderStats();
	renderRebirthUi();
	saveGame(true);
	refreshAdminControlsUi();
}

function clearAdminWarnings() {
	if (!gameState.adminEnabled) return;
	gameState.warnings = 0;
	gameState.suspicionScore = 0;
	gameState.lastSuspicionAt = 0;
	gameState.leaderboardInvalid = false;
	gameState.leaderboardBanned = false;
	renderStats();
	saveGame(true);
}

function toggleOwnerWarningBypass() {
	if (!gameState.adminEnabled || !isOwnerAccount()) return;
	gameState.ownerWarningsDisabled = !gameState.ownerWarningsDisabled;
	if (gameState.ownerWarningsDisabled) {
		gameState.warnings = 0;
		gameState.suspicionScore = 0;
		gameState.lastSuspicionAt = 0;
		gameState.leaderboardInvalid = false;
		gameState.leaderboardBanned = false;
	}
	renderStats();
	refreshAdminControlsUi();
	saveGame(true);
}

function init() {
  loadGame();
  renderTabState();
  renderStats();
  renderUpgrades();
  updateCookieButtonState();
  gameState.adminSidebarOpen = isOwnerAccount();
  refreshAdminSidebarUi();
  bindEvents();
  startLoops();
  saveGame(true);
}

init();
