// ============================================
// SPEND BILL GATES' MONEY - GAME ENGINE
// ============================================

const GAME_CONFIG = {
  STARTING_MONEY: 100_000_000_000, // $100B
  BASE_DAILY_INCOME: 50_000_000, // $50M/day
  GAME_DAY_MS: 15_000, // 15 seconds = 1 in-game day
  STOCK_UPDATE_MS: 10_000, // Stocks update every 10 seconds
  TESLA_EASTER_EGG_MS: 300_000, // 5 minutes from game start
  STOCK_BUY_COOLDOWN_MS: 30_000, // 30 seconds between buys per stock
  STOCK_SELL_HOLD_MS: 10_000, // Must hold newly bought shares for 10s
  ASSET_RESALE_MULTIPLIER: 0.2, // Assets only retain 20% value for score/net worth
};

// ============================================
// GAME STATE
// ============================================

const gameState = {
  cash: GAME_CONFIG.STARTING_MONEY,
  assets: {}, // { assetId: { count, purchasePrice, totalUpkeep } }
  investments: {}, // { stockSymbol: shares }
  debt: 0,
  currentDay: 1,
  sessionStartTime: 0,
  isGameStarted: false,

  // Cooldowns
  cooldowns: {
    purchases: {}, // { itemId: cooldownEndTime }
    investments: {}, // { stockSymbol: cooldownEndTime }
  },

  // Stocks
  stocks: {},
  lastStockUpdate: 0,

  // Tesla easter egg
  teslaWipeTriggered: false,

  // Track render state to avoid excessive rerenders
  lastRenderHash: null,

  // Preserve category expanded/collapsed state across rerenders.
  categoryOpenState: {},

  // Per-stock sell lock after buy.
  stockSellUnlockAt: {},

  // UI overlays
  messageHideTimer: null,
  isCharityCutsceneRunning: false,
  purchaseHistory: [],
  hasWon: false,
};

// ============================================
// PURCHASE CATALOG
// ============================================

const PURCHASE_CATALOG = {
  'Daily Stuff': [
    { id: 'big-mac', icon: '🍔', name: 'Big Mac', cost: 2, upkeep: 0, income: 0, maxPurchases: 2_000_000 },
    { id: 'flip-flops', icon: '🩴', name: 'Flip Flops', cost: 3, upkeep: 0, income: 0, maxPurchases: 250_000 },
    { id: 'coca-cola-pack', icon: '🥤', name: 'Coca-Cola Pack', cost: 5, upkeep: 0, income: 0, maxPurchases: 1_000_000 },
    { id: 'movie-ticket', icon: '🎬', name: 'Movie Ticket', cost: 12, upkeep: 0, income: 0, maxPurchases: 500_000 },
    { id: 'book', icon: '📘', name: 'Book', cost: 15, upkeep: 0, income: 0, maxPurchases: 500_000 },
    { id: 'lobster-dinner', icon: '🦞', name: 'Lobster Dinner', cost: 45, upkeep: 0, income: 0, maxPurchases: 250_000 },
    { id: 'video-game', icon: '🎮', name: 'Video Game', cost: 60, upkeep: 0, income: 0, maxPurchases: 250_000 },
  ],
  'Tech & Lifestyle': [
    { id: 'amazon-echo', icon: '🔊', name: 'Amazon Echo', cost: 99, upkeep: 0, income: 0, maxPurchases: 100_000 },
    { id: 'year-of-netflix', icon: '📺', name: 'Year of Netflix', cost: 100, upkeep: 0, income: 0, maxPurchases: 100_000 },
    { id: 'air-jordans', icon: '👟', name: 'Air Jordans', cost: 125, upkeep: 0, income: 0, maxPurchases: 50_000 },
    { id: 'airpods', icon: '🎧', name: 'Airpods', cost: 199, upkeep: 0, income: 0, maxPurchases: 50_000 },
    { id: 'gaming-console', icon: '🕹️', name: 'Gaming Console', cost: 299, upkeep: 0, income: 0, maxPurchases: 40_000 },
    { id: 'drone', icon: '🚁', name: 'Drone', cost: 350, upkeep: 0, income: 0, maxPurchases: 20_000 },
    { id: 'smartphone', icon: '📱', name: 'Smartphone', cost: 699, upkeep: 0, income: 0, maxPurchases: 30_000 },
    { id: 'bike', icon: '🚲', name: 'Bike', cost: 800, upkeep: 0, income: 0, maxPurchases: 15_000 },
  ],
  'Animals & Transport': [
    { id: 'kitten', icon: '🐱', name: 'Kitten', cost: 1_500, upkeep: 30, income: 0, maxPurchases: 200 },
    { id: 'puppy', icon: '🐶', name: 'Puppy', cost: 1_500, upkeep: 35, income: 0, maxPurchases: 200 },
    { id: 'auto-rickshaw', icon: '🛺', name: 'Auto Rickshaw', cost: 2_300, upkeep: 25, income: 40, maxPurchases: 400 },
    { id: 'horse', icon: '🐎', name: 'Horse', cost: 2_500, upkeep: 80, income: 0, maxPurchases: 50 },
    { id: 'jet-ski', icon: '🌊', name: 'Jet Ski', cost: 12_000, upkeep: 150, income: 0, maxPurchases: 40 },
    { id: 'ford-f150', icon: '🛻', name: 'Ford F-150', cost: 30_000, upkeep: 450, income: 0, maxPurchases: 40 },
    { id: 'tesla', icon: '⚡', name: 'Tesla', cost: 75_000, upkeep: 1_250, income: 0, maxPurchases: 30 },
    { id: 'monster-truck', icon: '🚚', name: 'Monster Truck', cost: 150_000, upkeep: 2_200, income: 0, maxPurchases: 20 },
    { id: 'ferrari', icon: '🏎️', name: 'Ferrari', cost: 250_000, upkeep: 3_500, income: 0, maxPurchases: 20 },
  ],
  'Luxury Goods': [
    { id: 'acre-farmland', icon: '🌾', name: 'Acre of Farmland', cost: 3_000, upkeep: 40, income: 85, maxPurchases: 25_000 },
    { id: 'designer-handbag', icon: '👜', name: 'Designer Handbag', cost: 5_500, upkeep: 0, income: 0, maxPurchases: 5_000 },
    { id: 'hot-tub', icon: '♨️', name: 'Hot Tub', cost: 6_000, upkeep: 90, income: 0, maxPurchases: 200 },
    { id: 'luxury-wine', icon: '🍷', name: 'Luxury Wine', cost: 7_000, upkeep: 0, income: 0, maxPurchases: 2_000 },
    { id: 'diamond-ring', icon: '💍', name: 'Diamond Ring', cost: 10_000, upkeep: 0, income: 0, maxPurchases: 2_000 },
    { id: 'rolex', icon: '⌚', name: 'Rolex', cost: 15_000, upkeep: 0, income: 0, maxPurchases: 1_500 },
    { id: 'gold-bar', icon: '🪙', name: 'Gold Bar', cost: 700_000, upkeep: 0, income: 6_000, maxPurchases: 500, resaleMultiplier: 0.92 },
  ],
  'Property & Franchises': [
    { id: 'single-family-home', icon: '🏠', name: 'Single Family Home', cost: 300_000, upkeep: 3_000, income: 18_000, maxPurchases: 300, resaleMultiplier: 0.7 },
    { id: 'mcdonalds-franchise', icon: '🍟', name: 'McDonalds Franchise', cost: 1_500_000, upkeep: 45_000, income: 210_000, maxPurchases: 120, resaleMultiplier: 0.55 },
    { id: 'mansion', icon: '🏰', name: 'Mansion', cost: 45_000_000, upkeep: 850_000, income: 0, maxPurchases: 12, resaleMultiplier: 0.5 },
    { id: 'skyscraper', icon: '🏙️', name: 'Skyscraper', cost: 850_000_000, upkeep: 12_000_000, income: 28_000_000, maxPurchases: 10, resaleMultiplier: 0.58 },
    { id: 'cruise-ship', icon: '🛳️', name: 'Cruise Ship', cost: 930_000_000, upkeep: 22_000_000, income: 34_000_000, maxPurchases: 8, resaleMultiplier: 0.52 },
  ],
  'Mega Experiences': [
    { id: 'superbowl-ad', icon: '📣', name: 'Superbowl Ad', cost: 5_250_000, upkeep: 0, income: 0, maxPurchases: 25, onPurchaseOutcome: { type: 'campaign', chance: 0.42, winMinMultiplier: 0.2, winMaxMultiplier: 1.15, lossMinMultiplier: 0.08, lossMaxMultiplier: 0.55, successLabel: 'The campaign goes viral.', failureLabel: 'The ad underperforms.' } },
    { id: 'yacht', icon: '🛥️', name: 'Yacht', cost: 7_500_000, upkeep: 180_000, income: 0, maxPurchases: 15, resaleMultiplier: 0.46 },
    { id: 'm1-abrams', icon: '🪖', name: 'M1 Abrams', cost: 8_000_000, upkeep: 220_000, income: 0, maxPurchases: 10, resaleMultiplier: 0.4 },
    { id: 'formula-1-car', icon: '🏁', name: 'Formula 1 Car', cost: 15_000_000, upkeep: 360_000, income: 0, maxPurchases: 12, resaleMultiplier: 0.42 },
    { id: 'apache-helicopter', icon: '🚁', name: 'Apache Helicopter', cost: 31_000_000, upkeep: 780_000, income: 0, maxPurchases: 10, resaleMultiplier: 0.38 },
    { id: 'make-a-movie', icon: '🎥', name: 'Make a Movie', cost: 100_000_000, upkeep: 0, income: 0, maxPurchases: 12, onPurchaseOutcome: { type: 'movie', chance: 0.34, winMinMultiplier: 0.5, winMaxMultiplier: 2.6, lossMinMultiplier: 0.05, lossMaxMultiplier: 0.35, successLabel: 'It becomes a hit.', failureLabel: 'It flops at the box office.' } },
    { id: 'boeing-747', icon: '✈️', name: 'Boeing 747', cost: 148_000_000, upkeep: 3_400_000, income: 0, maxPurchases: 10, resaleMultiplier: 0.48 },
    { id: 'mona-lisa', icon: '🖼️', name: 'Mona Lisa', cost: 780_000_000, upkeep: 0, income: 0, maxPurchases: 1, resaleMultiplier: 0.9 },
    { id: 'nba-team', icon: '🏀', name: 'NBA Team', cost: 2_120_000_000, upkeep: 26_000_000, income: 36_000_000, maxPurchases: 20, onPurchaseOutcome: { type: 'sports', baseChance: 0.08, chancePerOwned: 0.025, maxChance: 0.58, winMinMultiplier: 0.08, winMaxMultiplier: 0.38, lossMinMultiplier: 0.01, lossMaxMultiplier: 0.08, successLabel: 'Deep playoff run!', failureLabel: 'Early playoff exit.' } },
  ],
};

const CHARITY_ACTIVITY_IDS = new Set();

// ============================================
// STOCK MARKET
// ============================================

const STOCK_SYMBOLS = [
  'TESLA',
  'TECH-CORP',
  'ELEC-EMPIRE',
  'SPACE-VENT',
  'PHARMA-MAX',
  'ENERGY-SURGE',
  'BIOTECH-LAB',
  'AI-MINDS',
  'CLOUD-NET',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(amount) {
  if (amount >= 1_000_000_000) {
    return '$' + (amount / 1_000_000_000).toFixed(2) + 'B';
  } else if (amount >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(2) + 'M';
  } else if (amount >= 1_000) {
    return '$' + (amount / 1_000).toFixed(2) + 'K';
  }
  return '$' + amount.toFixed(0);
}

function formatCompactNumber(amount) {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}b`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatCompactCount(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}b`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function getSessionElapsedMS() {
  return Date.now() - gameState.sessionStartTime;
}

function getCurrentDay() {
  return Math.floor(getSessionElapsedMS() / GAME_CONFIG.GAME_DAY_MS) + 1;
}

function getIncomeBonus() {
  const totalSpent = getTotalSpent();
  if (totalSpent >= 100_000_000_000) return 1.2; // +20%
  if (totalSpent >= 10_000_000_000) return 1.1; // +10%
  if (totalSpent >= 1_000_000_000) return 1.05; // +5%
  return 1.0;
}

function getTotalPassiveIncome() {
  let total = 0;
  for (const assetId in gameState.assets) {
    const item = findPurchaseById(assetId);
    if (item && item.income > 0) {
      total += item.income * gameState.assets[assetId].count;
    }
  }
  return total;
}

function getDailyIncome() {
  return (GAME_CONFIG.BASE_DAILY_INCOME + getTotalPassiveIncome()) * getIncomeBonus();
}

function getTotalSpent() {
  let total = 0;
  for (const symbol in gameState.stocks) {
    total += gameState.stocks[symbol].invested || 0;
  }
  // Add purchase spending via assets
  for (const assetId in gameState.assets) {
    const item = findPurchaseById(assetId);
    if (item) {
      total += item.cost * gameState.assets[assetId].count;
    }
  }
  return total;
}

function getTotalUpkeep() {
  let upkeep = 0;
  for (const assetId in gameState.assets) {
    const item = findPurchaseById(assetId);
    if (item && item.upkeep > 0) {
      upkeep += item.upkeep * gameState.assets[assetId].count;
    }
  }
  return upkeep;
}

function getTotalAssetValue() {
  let value = 0;
  for (const assetId in gameState.assets) {
    const item = findPurchaseById(assetId);
    if (item) {
      const resaleMultiplier = typeof item.resaleMultiplier === 'number'
        ? item.resaleMultiplier
        : GAME_CONFIG.ASSET_RESALE_MULTIPLIER;
      value += item.cost * resaleMultiplier * gameState.assets[assetId].count;
    }
  }
  return value;
}

function getInvestmentValue() {
  let value = 0;
  for (const symbol in gameState.investments) {
    const stock = gameState.stocks[symbol];
    if (stock) {
      value += stock.price * (gameState.investments[symbol] || 0);
    }
  }
  return value;
}

function getNetWorth() {
  return gameState.cash + getTotalAssetValue() + getInvestmentValue();
}

function getScore() {
  return getNetWorth() - gameState.debt;
}

function findPurchaseById(itemId) {
  for (const category in PURCHASE_CATALOG) {
    const item = PURCHASE_CATALOG[category].find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}

function canAfford(cost) {
  return gameState.cash >= cost;
}

function getOwnedCount(itemId) {
  return gameState.assets[itemId]?.count || 0;
}

function hasReachedMaxPurchases(item) {
  return Number.isFinite(Number(item?.maxPurchases))
    && getOwnedCount(item.id) >= Number(item.maxPurchases);
}

function applyCashDelta(amount) {
  const safeAmount = Number(amount) || 0;
  if (!safeAmount) return;
  gameState.cash += safeAmount;
  if (gameState.cash < 0) {
    gameState.debt += Math.abs(gameState.cash);
    gameState.cash = 0;
  }
}

function rollRange(min, max) {
  return min + Math.random() * (max - min);
}

function isCoolingDown(type, id) {
  const cooldownEndTime = gameState.cooldowns[type][id];
  return cooldownEndTime && cooldownEndTime > Date.now();
}

function setCooldown(type, id, milliseconds) {
  if (!milliseconds || milliseconds <= 0) return;
  gameState.cooldowns[type][id] = Date.now() + milliseconds;
}

function getCooldownRemaining(type, id) {
  const cooldownEndTime = gameState.cooldowns[type][id];
  if (!cooldownEndTime) return 0;
  const remaining = cooldownEndTime - Date.now();
  return Math.max(0, remaining);
}

function showGameMessage(message, title = 'Notice', options = {}) {
  const overlay = document.getElementById('gameMessageOverlay');
  const titleEl = document.getElementById('gameMessageTitle');
  const textEl = document.getElementById('gameMessageText');

  if (!overlay || !titleEl || !textEl) {
    return;
  }

  const autoCloseMs = options.autoCloseMs ?? 2600;
  const persistent = options.persistent ?? false;

  titleEl.textContent = title;
  textEl.textContent = message;
  overlay.classList.remove('hidden');

  if (gameState.messageHideTimer) {
    clearTimeout(gameState.messageHideTimer);
    gameState.messageHideTimer = null;
  }

  if (!persistent && autoCloseMs > 0) {
    gameState.messageHideTimer = setTimeout(() => {
      hideGameMessage();
    }, autoCloseMs);
  }
}

function hideGameMessage() {
  const overlay = document.getElementById('gameMessageOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  if (gameState.messageHideTimer) {
    clearTimeout(gameState.messageHideTimer);
    gameState.messageHideTimer = null;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCharityReelSequence(finalGain, swing) {
  const entries = [];
  for (let i = 0; i < 28; i += 1) {
    const randomGain = Math.random() < 0.5;
    const randomSwing = getCharitySwingAmount();
    entries.push({
      gain: randomGain,
      label: `${randomGain ? 'GAIN' : 'LOSS'} ${formatCurrency(randomSwing)}`,
      className: randomGain ? 'gain' : 'loss',
    });
  }

  entries.push({
    gain: finalGain,
    label: `${finalGain ? 'GAIN' : 'LOSS'} ${formatCurrency(swing)}`,
    className: finalGain ? 'gain' : 'loss',
  });

  return entries;
}

async function playCharityReelCutscene(finalGain, swing) {
  const overlay = document.getElementById('charityCutsceneOverlay');
  const reel = document.getElementById('charityReelRoll');
  const status = document.getElementById('charityCutsceneStatus');

  if (!overlay || !reel || !status) {
    return;
  }

  const entries = buildCharityReelSequence(finalGain, swing);
  reel.innerHTML = entries
    .map((entry) => `<div class="charity-reel-item ${entry.className}">${entry.label}</div>`)
    .join('');

  const itemHeight = 58;
  const lastIndex = entries.length - 1;

  reel.style.transition = 'none';
  reel.style.transform = 'translateY(0px)';
  status.textContent = 'Spinning...';
  overlay.classList.remove('hidden');

  await delay(50);

  const durationMs = 2800;
  reel.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 0.82, 0.2, 1)`;
  reel.style.transform = `translateY(-${lastIndex * itemHeight}px)`;

  await delay(durationMs + 120);

  status.textContent = finalGain
    ? `Lucky roll: +${formatCurrency(swing)}`
    : `Rough roll: -${formatCurrency(swing)}`;

  await delay(1100);
  overlay.classList.add('hidden');
}

// ============================================
// STOCK MARKET ENGINE
// ============================================

function initializeStocks() {
  STOCK_SYMBOLS.forEach((symbol) => {
    gameState.stocks[symbol] = {
      symbol,
      price: getRandomStockPrice(),
      prevPrice: 0,
      history: [],
      invested: 0,
    };
  });
}

function getRandomStockPrice() {
  // Random price between $100 and $5000
  return Math.random() * 4900 + 100;
}

function updateStockPrices() {
  const now = getSessionElapsedMS();

  for (const symbol of STOCK_SYMBOLS) {
    const stock = gameState.stocks[symbol];
    stock.prevPrice = stock.price;

    // Normal stocks: 50/50 rise/fall with realistic values
    const change = (Math.random() - 0.5) * 0.15; // ±7.5%
    stock.price *= 1 + change;

    // Keep price positive
    stock.price = Math.max(0.01, stock.price);
    stock.history.push(stock.price);
    if (stock.history.length > 50) {
      stock.history.shift();
    }
  }

  gameState.lastStockUpdate = now;
}

// ============================================
// PURCHASE FUNCTIONS
// ============================================

async function purchase(itemId) {
  const item = findPurchaseById(itemId);
  if (!item) return false;

  if (gameState.isCharityCutsceneRunning) {
    showGameMessage('Please wait for the charity reel to finish.', 'Charity Event', { autoCloseMs: 1800 });
    return false;
  }

  if (hasReachedMaxPurchases(item)) {
    showGameMessage(`Max purchases reached for ${item.name}.`, 'Purchase Limit', { autoCloseMs: 1800 });
    return false;
  }

  // Check affordability
  if (!canAfford(item.cost)) {
    showGameMessage('Insufficient funds!', 'Purchase Failed');
    return false;
  }

  // Check cooldown
  if (isCoolingDown('purchases', itemId)) {
    const remaining = (getCooldownRemaining('purchases', itemId) / 1000).toFixed(1);
    showGameMessage(`Cooldown: ${remaining}s remaining`, 'Purchase Cooldown', { autoCloseMs: 1800 });
    return false;
  }

  // Execute purchase
  gameState.cash -= item.cost;
  if (!gameState.assets[itemId]) {
    gameState.assets[itemId] = { count: 0, totalUpkeep: 0 };
  }
  gameState.assets[itemId].count += 1;
  recordPurchase(item);
  const ownedCount = gameState.assets[itemId].count;

  // Increase cooldowns on larger purchases, with optional per-item override.
  let cooldown = 0;
  if (typeof item.cooldownMs === 'number' && item.cooldownMs > 0) {
    cooldown = item.cooldownMs;
  } else if (item.cost >= 10_000_000_000) {
    cooldown = 10_000 + Math.random() * 6_000; // 10-16s
  } else if (item.cost >= 1_000_000_000) {
    cooldown = 8_000 + Math.random() * 4_000; // 8-12s
  } else if (item.cost >= 100_000_000) {
    cooldown = 4_000 + Math.random() * 2_000; // 4-6s
  } else if (item.cost >= 10_000_000) {
    cooldown = 1_500 + Math.random() * 1_000; // 1.5-2.5s
  }

  setCooldown('purchases', itemId, cooldown);

  if (CHARITY_ACTIVITY_IDS.has(itemId)) {
    gameState.isCharityCutsceneRunning = true;
    const swing = getCharitySwingAmount();
    const gain = Math.random() < 0.5;

    await playCharityReelCutscene(gain, swing);

    if (gain) {
      gameState.cash += swing;
      showGameMessage(`Charity event result: positive publicity boosted your funds by ${formatCurrency(swing)}.`, 'Charity Event');
    } else {
      if (gameState.cash >= swing) {
        gameState.cash -= swing;
      } else {
        const shortfall = swing - gameState.cash;
        gameState.cash = 0;
        gameState.debt += shortfall;
      }
      showGameMessage(`Charity event result: unexpected costs hit you for ${formatCurrency(swing)}.`, 'Charity Event');
    }
    gameState.isCharityCutsceneRunning = false;
  }

  const purchaseOutcome = resolvePurchaseOutcome(item, ownedCount);
  if (purchaseOutcome) {
    applyCashDelta(purchaseOutcome.payout);
    showGameMessage(
      `${purchaseOutcome.title}: ${purchaseOutcome.summary} ${purchaseOutcome.success ? `You earn back ${formatCurrency(purchaseOutcome.payout)}.` : `You only recover ${formatCurrency(purchaseOutcome.payout)}.`}`,
      purchaseOutcome.success ? 'Return Hit' : 'Return Miss',
      { autoCloseMs: 2400 }
    );
  }

  forceRender();
  checkForWin();
  return true;
}

function getCharitySwingAmount() {
  const min = 1_000_000_000;
  const max = 2_000_000_000;
  const step = 50_000_000;
  const buckets = Math.floor((max - min) / step);
  const n = Math.floor(Math.random() * (buckets + 1));
  return min + n * step;
}

function resolvePurchaseOutcome(item, ownedCount) {
  const profile = item?.onPurchaseOutcome;
  if (!profile) return null;

  let successChance = Number(profile.chance) || 0;
  if (profile.type === 'sports') {
    successChance = Math.min(
      Number(profile.maxChance) || 1,
      (Number(profile.baseChance) || 0) + (Math.max(0, ownedCount - 1) * (Number(profile.chancePerOwned) || 0))
    );
  }

  const success = Math.random() < successChance;
  const multiplier = success
    ? rollRange(Number(profile.winMinMultiplier) || 0, Number(profile.winMaxMultiplier) || 0)
    : rollRange(Number(profile.lossMinMultiplier) || 0, Number(profile.lossMaxMultiplier) || 0);
  const payout = Math.round(item.cost * multiplier);

  return {
    success,
    payout,
    title: item.name,
    summary: success ? profile.successLabel : profile.failureLabel,
  };
}

function recordPurchase(item) {
  const existing = gameState.purchaseHistory.find((entry) => entry.id === item.id);
  if (existing) {
    existing.count += 1;
    existing.totalSpent += item.cost;
    existing.lastPurchasedAt = Date.now();
    return;
  }
  gameState.purchaseHistory.push({
    id: item.id,
    icon: item.icon,
    name: item.name,
    count: 1,
    totalSpent: item.cost,
    lastPurchasedAt: Date.now(),
  });
}

function buildReceiptMarkup() {
  return gameState.purchaseHistory
    .slice()
    .sort((left, right) => right.totalSpent - left.totalSpent)
    .map((entry) => `
      <div class="receipt-row">
        <div class="receipt-item">
          <span class="receipt-icon">${entry.icon}</span>
          <div>
            <strong>${entry.name}</strong>
            <span>x${entry.count}</span>
          </div>
        </div>
        <span class="receipt-total">${formatCurrency(entry.totalSpent)}</span>
      </div>
    `)
    .join('');
}

function showReceipt() {
  const overlay = document.getElementById('receiptOverlay');
  const summary = document.getElementById('receiptSummary');
  const list = document.getElementById('receiptList');
  if (!overlay || !summary || !list) return;
  const totalSpent = gameState.purchaseHistory.reduce((sum, entry) => sum + entry.totalSpent, 0);
  summary.textContent = `You spent the full ${formatCurrency(GAME_CONFIG.STARTING_MONEY)}. Final total spent: ${formatCurrency(totalSpent)}.`;
  list.innerHTML = buildReceiptMarkup() || '<p class="empty-state">No purchases recorded.</p>';
  overlay.classList.remove('hidden');
}

function checkForWin() {
  if (gameState.hasWon) return;
  if (gameState.cash > 0 || gameState.debt > 0) return;
  gameState.hasWon = true;
  gameState.isGameStarted = false;
  forceRender();
  showReceipt();
}

// ============================================
// INVESTMENT FUNCTIONS
// ============================================

function buyStock(symbol) {
  return buyStockWithQuantity(symbol, null);
}

function buyStockWithQuantity(symbol, quantityOverride = null) {
  const stock = gameState.stocks[symbol];
  if (!stock) return false;

  // Failsafe: can't invest if balance <= 0
  if (gameState.cash <= 0) {
    showGameMessage('Cannot invest with zero or negative balance!', 'Investment Blocked');
    return false;
  }

  // Check cooldown
  if (isCoolingDown('investments', `${symbol}-buy`)) {
    const remaining = (getCooldownRemaining('investments', `${symbol}-buy`) / 1000).toFixed(1);
    showGameMessage(`Cooldown: ${remaining}s remaining`, 'Buy Cooldown', { autoCloseMs: 1800 });
    return false;
  }

  let quantity = quantityOverride;
  if (quantity == null) {
    const maxAffordable = Math.floor(gameState.cash / stock.price);
    const input = prompt(
      `How many shares of ${symbol}? (price: ${formatCompactNumber(stock.price)}/share, affordable: ${formatCompactCount(maxAffordable)})`,
      '1'
    );
    if (!input) return false;
    quantity = parseInt(input, 10);
  }

  const maxAffordable = Math.floor(gameState.cash / stock.price);
  quantity = Math.max(1, Number(quantity) || 1);

  if (quantity > maxAffordable) {
    showGameMessage(`You can afford up to ${maxAffordable} shares right now.`, 'Investment Failed');
    return false;
  }

  const totalCost = stock.price * quantity;

  if (!canAfford(totalCost)) {
    showGameMessage(`Insufficient funds. Need ${formatCurrency(totalCost)}, have ${formatCurrency(gameState.cash)}.`, 'Investment Failed');
    return false;
  }

  gameState.cash -= totalCost;
  if (!gameState.investments[symbol]) {
    gameState.investments[symbol] = 0;
  }
  gameState.investments[symbol] += quantity;

  // Track investment
  if (!stock.invested) stock.invested = 0;
  stock.invested += totalCost;

  // Buying refreshes the minimum hold period before this stock can be sold.
  gameState.stockSellUnlockAt[symbol] = Date.now() + GAME_CONFIG.STOCK_SELL_HOLD_MS;

  if (symbol === 'TESLA' && getSessionElapsedMS() >= GAME_CONFIG.TESLA_EASTER_EGG_MS && !gameState.teslaWipeTriggered) {
    gameState.investments = {};
    gameState.stockSellUnlockAt = {};
    for (const stockSymbol of STOCK_SYMBOLS) {
      if (gameState.stocks[stockSymbol]) {
        gameState.stocks[stockSymbol].invested = 0;
      }
    }
    gameState.teslaWipeTriggered = true;
    showGameMessage('Tesla easter egg triggered: 5 minutes passed. All stock holdings were wiped to 0.', 'Tesla Event', { persistent: true, autoCloseMs: 0 });
  }

  setCooldown('investments', `${symbol}-buy`, GAME_CONFIG.STOCK_BUY_COOLDOWN_MS);
  forceRender();
  return true;
}

function sellStock(symbol) {
  const stock = gameState.stocks[symbol];
  if (!stock) return false;

  if (!gameState.investments[symbol] || gameState.investments[symbol] <= 0) {
    showGameMessage('You do not own any shares!', 'Sell Failed', { autoCloseMs: 1800 });
    return false;
  }

  // Check cooldown
  if (isCoolingDown('investments', `${symbol}-sell`)) {
    const remaining = (getCooldownRemaining('investments', `${symbol}-sell`) / 1000).toFixed(1);
    showGameMessage(`Cooldown: ${remaining}s remaining`, 'Sell Cooldown', { autoCloseMs: 1800 });
    return false;
  }

  const holdRemaining = Math.max(0, (gameState.stockSellUnlockAt[symbol] || 0) - Date.now());
  if (holdRemaining > 0) {
    showGameMessage(`You must hold ${symbol} for ${(holdRemaining / 1000).toFixed(1)}s before selling.`, 'Hold Required', { autoCloseMs: 2100 });
    return false;
  }

  // Prompt for quantity
  const input = prompt(`How many shares of ${symbol} to sell? (you own ${gameState.investments[symbol]}, price: ${formatCurrency(stock.price)}/share)`, '1');
  if (!input) return false;

  const quantity = Math.min(Math.max(1, parseInt(input) || 1), gameState.investments[symbol]);
  const proceeds = stock.price * quantity;

  gameState.cash += proceeds;
  gameState.investments[symbol] -= quantity;

  if (gameState.investments[symbol] <= 0) {
    delete gameState.investments[symbol];
  }

  setCooldown('investments', `${symbol}-sell`, 3_000);
  forceRender();
  return true;
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
  if (!gameState.isGameStarted) return;

  const newDay = getCurrentDay();
  if (newDay !== gameState.currentDay) {
    gameState.currentDay = newDay;

    // Apply daily income
    const dailyIncome = getDailyIncome();
    const dailyUpkeep = getTotalUpkeep();
    const netDaily = dailyIncome - dailyUpkeep;

    gameState.cash += netDaily;

    if (gameState.cash < 0) {
      gameState.debt -= gameState.cash;
      gameState.cash = 0;
    }
  }

  // Update stocks
  const now = getSessionElapsedMS();
  if (now - gameState.lastStockUpdate >= GAME_CONFIG.STOCK_UPDATE_MS) {
    updateStockPrices();
  }

  render();
  refreshLiveUi();
}

// ============================================
// RENDERING
// ============================================

function getStateHash() {
  // Create a simple hash of relevant game state to detect changes
  return JSON.stringify({
    cash: gameState.cash,
    debt: gameState.debt,
    day: gameState.currentDay,
    assets: Object.keys(gameState.assets).length,
    investments: Object.keys(gameState.investments).length,
    stockPrices: STOCK_SYMBOLS.map((s) => gameState.stocks[s]?.price?.toFixed(2) || '0').join(','),
  });
}

function shouldRender() {
  const currentHash = getStateHash();
  if (currentHash !== gameState.lastRenderHash) {
    gameState.lastRenderHash = currentHash;
    return true;
  }
  return false;
}

function forceRender() {
  gameState.lastRenderHash = null;
  render();
}

function render() {
  // Only render if state has actually changed
  if (!shouldRender()) return;
  updateStatsBar();
  renderPurchases();
  renderStocks();
  renderAssets();
  renderDebtStatus();
  updateDebugInfo();
}

function updateStatsBar() {
  document.getElementById('cashDisplay').textContent = formatCurrency(gameState.cash);
  document.getElementById('netWorthDisplay').textContent = formatCurrency(getNetWorth());
  document.getElementById('scoreDisplay').textContent = formatCurrency(getScore());
  document.getElementById('incomeDisplay').textContent = formatCurrency(getDailyIncome());
  document.getElementById('dayDisplay').textContent = gameState.currentDay;
  
  const nextRefreshTime = gameState.lastStockUpdate + GAME_CONFIG.STOCK_UPDATE_MS;
  const now = getSessionElapsedMS();
  const timeUntilRefresh = Math.max(0, nextRefreshTime - now);
  const secondsRemaining = (timeUntilRefresh / 1000).toFixed(1);
  const refreshCounter = document.getElementById('stockRefreshCounter');
  if (refreshCounter) {
    refreshCounter.textContent = `Refresh in ${secondsRemaining}s`;
  }
}

function renderPurchases() {
  const container = document.getElementById('purchaseCategoriesContainer');
  container.innerHTML = '';

  let isFirstCategory = true;
  for (const category in PURCHASE_CATALOG) {
    const items = PURCHASE_CATALOG[category];

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-dropdown';

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
      <span class="category-title">${category}</span>
      <span class="category-toggle">▼</span>
    `;

    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'items-grid';
    const isOpen = gameState.categoryOpenState[category] ?? isFirstCategory;
    itemsGrid.style.display = isOpen ? 'grid' : 'none';
    if (isOpen) {
      categoryHeader.classList.add('open');
      categoryHeader.querySelector('.category-toggle').classList.add('open');
    }

    categoryHeader.addEventListener('click', () => {
      const currentlyOpen = itemsGrid.style.display !== 'none';
      const nextOpen = !currentlyOpen;
      itemsGrid.style.display = nextOpen ? 'grid' : 'none';
      categoryHeader.classList.toggle('open');
      categoryHeader.querySelector('.category-toggle').classList.toggle('open');
      gameState.categoryOpenState[category] = nextOpen;
    });

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'purchase-btn';
      btn.disabled = isCoolingDown('purchases', item.id);
      btn.dataset.purchaseId = item.id;
      btn.dataset.purchaseCost = String(item.cost);

      const cooldownRemaining = getCooldownRemaining('purchases', item.id);
      const cooldownText =
        cooldownRemaining > 0 ? ` (${(cooldownRemaining / 1000).toFixed(1)}s)` : '';
      const ownedCount = getOwnedCount(item.id);
      const maxedOut = hasReachedMaxPurchases(item);
      const maxLabel = Number.isFinite(Number(item.maxPurchases))
        ? `${ownedCount}/${item.maxPurchases}`
        : `${ownedCount}`;
      const returnLabel = item.onPurchaseOutcome
        ? (item.onPurchaseOutcome.type === 'movie'
          ? 'Hit or flop'
          : item.onPurchaseOutcome.type === 'sports'
            ? 'Win chance scales'
            : 'Chance return')
        : '';

      btn.innerHTML = `
        <div class="btn-icon">${item.icon}</div>
        <div class="btn-name">${item.name}</div>
        <div class="btn-cost">${formatCurrency(item.cost)}</div>
        ${item.upkeep > 0 ? `<div class="btn-upkeep">-${formatCurrency(item.upkeep)}/day</div>` : ''}
        ${item.income > 0 ? `<div class="btn-income">+${formatCurrency(item.income)}/day</div>` : ''}
        <div class="btn-owned">Owned ${maxLabel}</div>
        ${returnLabel ? `<div class="btn-income">${returnLabel}</div>` : ''}
        <div class="btn-cooldown" data-purchase-cooldown="${item.id}">${cooldownText}</div>
      `;

      btn.addEventListener('click', () => purchase(item.id));
      btn.disabled = btn.disabled || maxedOut;
      itemsGrid.appendChild(btn);
    });

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(itemsGrid);
    container.appendChild(categoryDiv);
    isFirstCategory = false;
  }
}

function renderStocks() {
  const container = document.getElementById('stocksContainer');
  container.innerHTML = '';

  for (const symbol of STOCK_SYMBOLS) {
    const stock = gameState.stocks[symbol];
    const prevPrice = stock.prevPrice || stock.price;
    const change = ((stock.price - prevPrice) / prevPrice) * 100;
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeArrow = change >= 0 ? '▲' : '▼';
    
    const currentValue = stock.price * (gameState.investments[symbol] || 0);
    const investedAmount = stock.invested || 0;
    const gainLoss = currentValue - investedAmount;
    const gainLossPercent = investedAmount > 0 ? ((gainLoss / investedAmount) * 100).toFixed(1) : 0;

    const stockDiv = document.createElement('div');
    stockDiv.className = 'stock-item';

    const buyCooldown = getCooldownRemaining('investments', `${symbol}-buy`);
    const sellCooldown = getCooldownRemaining('investments', `${symbol}-sell`);
    const holdRemaining = Math.max(0, (gameState.stockSellUnlockAt[symbol] || 0) - Date.now());
    const shares = gameState.investments[symbol] || 0;
    const sellRemaining = Math.max(sellCooldown, holdRemaining);

    stockDiv.innerHTML = `
      <div class="stock-info">
        <span class="stock-symbol">${symbol}</span>
        <span class="stock-price">${formatCompactNumber(stock.price)}</span>
        <span class="stock-change ${changeClass}">${changeArrow} ${change.toFixed(1)}%</span>
        ${shares > 0 ? `<span class="stock-gain" style="color: ${gainLoss >= 0 ? '#81c784' : '#ef5350'}; margin-left: 8px;">Gain: ${formatCompactNumber(gainLoss)} (${gainLossPercent}%)</span>` : ''}
        ${shares > 0 ? `<span class="stock-shares" style="color: #81c784; margin-left: 8px;">Qty: ${formatCompactCount(shares)}</span>` : ''}
      </div>
      <div class="stock-actions">
        <button class="stock-btn buy-btn" ${buyCooldown > 0 ? 'disabled' : ''} data-symbol="${symbol}">
          📈 Buy <span class="stock-cooldown" data-stock-cooldown="${symbol}-buy">${buyCooldown > 0 ? `(${(buyCooldown / 1000).toFixed(1)}s)` : ''}</span>
        </button>
        ${shares > 0 ? `<button class="stock-btn sell-btn" ${sellRemaining > 0 ? 'disabled' : ''} data-symbol="${symbol}">
          📉 Sell <span class="stock-cooldown" data-stock-cooldown="${symbol}-sell">${sellRemaining > 0 ? `(${(sellRemaining / 1000).toFixed(1)}s)` : ''}</span>
        </button>` : ''}
      </div>
    `;

    container.appendChild(stockDiv);
  }

}

function refreshLiveUi() {
  const now = getSessionElapsedMS();
  const nextRefreshTime = gameState.lastStockUpdate + GAME_CONFIG.STOCK_UPDATE_MS;
  const timeUntilRefresh = Math.max(0, nextRefreshTime - now);
  const refreshCounter = document.getElementById('stockRefreshCounter');
  if (refreshCounter) {
    refreshCounter.textContent = `Refresh in ${(timeUntilRefresh / 1000).toFixed(1)}s`;
  }

  document.querySelectorAll('[data-purchase-id]').forEach((button) => {
    const itemId = button.dataset.purchaseId;
    const item = findPurchaseById(itemId);
    const remaining = getCooldownRemaining('purchases', itemId);
    const cooldownLabel = button.querySelector(`[data-purchase-cooldown="${itemId}"]`);
    if (cooldownLabel) {
      cooldownLabel.textContent = remaining > 0 ? `(${(remaining / 1000).toFixed(1)}s)` : '';
    }
    button.disabled = remaining > 0 || (item ? hasReachedMaxPurchases(item) : false);
  });

  document.querySelectorAll('.buy-btn[data-symbol]').forEach((button) => {
    const symbol = button.dataset.symbol;
    const stock = gameState.stocks[symbol];
    if (!stock) return;
    const remaining = getCooldownRemaining('investments', `${symbol}-buy`);
    const cooldownLabel = button.querySelector(`[data-stock-cooldown="${symbol}-buy"]`);
    if (cooldownLabel) {
      cooldownLabel.textContent = remaining > 0 ? `(${(remaining / 1000).toFixed(1)}s)` : '';
    }
    button.disabled = remaining > 0;
  });

  document.querySelectorAll('.sell-btn[data-symbol]').forEach((button) => {
    const symbol = button.dataset.symbol;
    const sellCooldownRemaining = getCooldownRemaining('investments', `${symbol}-sell`);
    const holdRemaining = Math.max(0, (gameState.stockSellUnlockAt[symbol] || 0) - Date.now());
    const remaining = Math.max(sellCooldownRemaining, holdRemaining);
    const shares = gameState.investments[symbol] || 0;
    const cooldownLabel = button.querySelector(`[data-stock-cooldown="${symbol}-sell"]`);
    if (cooldownLabel) {
      cooldownLabel.textContent = remaining > 0 ? `(${(remaining / 1000).toFixed(1)}s)` : '';
    }
    button.disabled = remaining > 0 || shares <= 0;
  });

}

function renderAssets() {
  const container = document.getElementById('assetsContainer');
  if (Object.keys(gameState.assets).length === 0) {
    container.innerHTML = '<p class="empty-state">No assets owned yet.</p>';
    return;
  }

  container.innerHTML = '';
  for (const assetId in gameState.assets) {
    const item = findPurchaseById(assetId);
    if (!item) continue;

    const count = gameState.assets[assetId].count;
    const assetDiv = document.createElement('div');
    assetDiv.className = 'asset-item';

    assetDiv.innerHTML = `
      <div>
        <span class="asset-name">${item.icon} ${item.name}</span>
        <span style="color: #888; margin-left: 8px;">×${count}</span>
      </div>
      <div class="asset-meta">
        ${item.income > 0 ? `<span class="asset-income">+${formatCurrency(item.income * count)}/day</span>` : ''}
        ${item.upkeep > 0 ? `<span class="asset-upkeep">-${formatCurrency(item.upkeep * count)}/day</span>` : ''}
      </div>
    `;

    container.appendChild(assetDiv);
  }
}

function renderDebtStatus() {
  document.getElementById('debtDisplay').textContent = formatCurrency(gameState.debt);

  const statusEl = document.getElementById('financialStatus');
  const ratio = getNetWorth() / getScore();

  let status = 'Excellent';
  let statusClass = 'status-good';

  if (gameState.debt > 0 && gameState.debt / getNetWorth() > 0.5) {
    status = 'Critical!';
    statusClass = 'status-danger';
  } else if (gameState.debt > 0 && gameState.debt / getNetWorth() > 0.2) {
    status = 'Warning';
    statusClass = 'status-warning';
  } else if (gameState.debt > 0) {
    status = 'Manageable';
    statusClass = 'status-warning';
  }

  statusEl.textContent = status;
  statusEl.className = statusClass;
}

function updateDebugInfo() {
  const debugContent = document.getElementById('debugContent');
  const teslaPrice = gameState.stocks['TESLA']?.price;
  debugContent.innerHTML = `
    <div>
      <strong>Game Time:</strong> ${getSessionElapsedMS()}ms (${gameState.currentDay} days)<br>
      <strong>Total Spent:</strong> ${formatCurrency(getTotalSpent())}<br>
      <strong>Daily Income Bonus:</strong> ${(getIncomeBonus() * 100 - 100).toFixed(0)}%<br>
      <strong>Total Upkeep:</strong> -${formatCurrency(getTotalUpkeep())}/day<br>
      <strong>Asset Value:</strong> ${formatCurrency(getTotalAssetValue())}<br>
      <strong>Investment Value:</strong> ${formatCurrency(getInvestmentValue())}<br>
      <strong>Assets Owned:</strong> ${Object.keys(gameState.assets).length} types<br>
      <strong>Stocks Owned:</strong> ${Object.keys(gameState.investments).length} types<br>
      <strong>Tesla Status:</strong> ${teslaPrice != null ? teslaPrice.toFixed(2) : 'Unavailable'}<br>
      <strong>Tesla Wipe Triggered:</strong> ${gameState.teslaWipeTriggered ? 'Yes' : 'No'}<br>
    </div>
  `;
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  console.log('🎮 Spend Bill Gates\' Money - Initializing...');

  const startPanel = document.getElementById('startGamePanel');
  const startButton = document.getElementById('startGameButton');
  const helpButton = document.getElementById('helpButton');
  const helpMessage = document.getElementById('helpMessage');
  const gameMessageClose = document.getElementById('gameMessageClose');
  const gameMessageOverlay = document.getElementById('gameMessageOverlay');
  const receiptClose = document.getElementById('receiptClose');
  const receiptOverlay = document.getElementById('receiptOverlay');

  if (gameMessageClose) {
    gameMessageClose.addEventListener('click', hideGameMessage);
  }

  if (gameMessageOverlay) {
    gameMessageOverlay.addEventListener('click', (event) => {
      if (event.target === gameMessageOverlay) {
        hideGameMessage();
      }
    });
  }

  if (receiptClose) {
    receiptClose.addEventListener('click', () => {
      receiptOverlay?.classList.add('hidden');
    });
  }

  if (receiptOverlay) {
    receiptOverlay.addEventListener('click', (event) => {
      if (event.target === receiptOverlay) {
        receiptOverlay.classList.add('hidden');
      }
    });
  }

  if (helpButton && helpMessage) {
    helpButton.addEventListener('click', () => {
      helpMessage.hidden = !helpMessage.hidden;
    });
  }

  if (startButton) {
    startButton.addEventListener('click', () => {
      if (gameState.isGameStarted) return;

      gameState.isGameStarted = true;
      gameState.sessionStartTime = Date.now();
      gameState.currentDay = 1;
      gameState.lastStockUpdate = 0;
      gameState.cash = GAME_CONFIG.STARTING_MONEY;
      gameState.assets = {};
      gameState.investments = {};
      gameState.stocks = {};
      gameState.debt = 0;
      gameState.purchaseHistory = [];
      gameState.hasWon = false;
      gameState.cooldowns = { purchases: {}, investments: {} };
      gameState.stockSellUnlockAt = {};
      gameState.teslaWipeTriggered = false;
      gameState.categoryOpenState = { 'Daily Stuff': true };
      initializeStocks();

      if (startPanel) {
        startPanel.classList.add('hidden');
      }
      receiptOverlay?.classList.add('hidden');

      forceRender();
      refreshLiveUi();
    });
  }

  const stockContainer = document.getElementById('stocksContainer');
  stockContainer.addEventListener('click', (event) => {
    const buyBtn = event.target.closest('.buy-btn');
    if (buyBtn) {
      buyStock(buyBtn.dataset.symbol);
      return;
    }
    const sellBtn = event.target.closest('.sell-btn');
    if (sellBtn) {
      sellStock(sellBtn.dataset.symbol);
    }
  });

  // Main game loop
  setInterval(gameLoop, 100);

  console.log('✅ Game initialized!');
}

document.addEventListener('DOMContentLoaded', init);
