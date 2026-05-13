// GameManager.js - Core game orchestration
class GameManager {
  constructor() {
    this.stages = [
      { label: 'Stage 1', startingCash: 10000, requiredQuota: 25000, bossLine: "I spoke with the boss. She said it's not enough." },
      { label: 'Stage 2', startingCash: 25000, requiredQuota: 50000, bossLine: 'You need more. Try getting 50,000 this time.' },
      { label: 'Stage 3', startingCash: 50000, requiredQuota: 100000, bossLine: 'The boss raised the number again. Do not make me repeat myself.' },
      { label: 'Stage 4', startingCash: 100000, requiredQuota: 250000, bossLine: "They're still not satisfied. Push harder." },
      { label: 'Stage 5', startingCash: 250000, requiredQuota: 500000, bossLine: "You're running out of excuses. Bring me half a million." },
      { label: 'Stage 6', startingCash: 500000, requiredQuota: 1000000, bossLine: 'One million. Tonight. No mistakes.' },
      { label: 'Final', startingCash: 1000000, requiredQuota: 2700000, bossLine: "He's gone. You're on your own. Finish this." },
    ];
    this.stageDurationSeconds = 15 * 60;
    this.state = {
      cash: 0,
      chips: 0,
      warnings: 0,
      maxWarnings: 3,
      stageIndex: 0,
      quota: 0,
      inGame: false,
      inCasino: false,
      inBathroom: true,
      currentGameType: null,
      totalCashBanked: 0,
      roundsPlayed: 0,
      remainingRealSeconds: this.stageDurationSeconds,
      clockMinutes: 21 * 60,
      dealerAvailable: true,
    };
    this.ui = null;
    this.audioMgr = null;
    this.detection = null;
    this.dealer = null;
    this.clockStartMinutes = 21 * 60;
    this.timeAlertsPlayed = {
      five: false,
      one: false,
    };
    this.hudOverrides = {
      quotaText: '',
      clockText: '',
    };
  }

  init(ui, audioMgr, detection, dealer) {
    this.ui = ui;
    this.audioMgr = audioMgr;
    this.detection = detection;
    this.dealer = dealer;
    this.applyStage(0, true);
    this.updateHUD();
  }

  startGame() {
    this.state.inGame = true;
    this.state.inBathroom = true;
    this.state.inCasino = false;
    this.audioMgr?.play('ambient', true, 0.4);
    this.ui?.showMessage("Convert cash to chips, gamble, cash out, and deliver before the hour is up.");
  }

  update(delta) {
    if (!this.state.inGame) {
      return;
    }

    this.state.remainingRealSeconds = Math.max(0, this.state.remainingRealSeconds - delta);
    const elapsedRatio = 1 - this.state.remainingRealSeconds / this.stageDurationSeconds;
    this.state.clockMinutes = this.clockStartMinutes + elapsedRatio * 60;

    if (!this.timeAlertsPlayed.five && this.state.remainingRealSeconds <= 300) {
      this.timeAlertsPlayed.five = true;
      this.audioMgr?.play('warning');
      this.ui?.showToast("Five minutes left. Cash out if you're smart.", 'warning');
    }

    if (!this.timeAlertsPlayed.one && this.state.remainingRealSeconds <= 60) {
      this.timeAlertsPlayed.one = true;
      this.audioMgr?.play('warning');
      this.ui?.showToast("One minute. Deliver now or die here.", 'warning');
    }

    if (this.state.remainingRealSeconds <= 0) {
      this.die('Time expired. The earpiece went silent, then everything cut to black.');
      return;
    }

    this.updateHUD();
  }

  enterCasino() {
    this.state.inCasino = true;
    this.state.inBathroom = false;
    this.audioMgr?.play('ambient');
  }

  exitToBathroom() {
    this.state.inCasino = false;
    this.state.inBathroom = true;
    this.audioMgr?.play('ambient', true, 0.6);
    this.dealer?.refreshIfValid();
  }

  playGame(gameType) {
    this.state.currentGameType = gameType;
    this.state.roundsPlayed++;
    this.updateHUD();
  }

  addCash(amount) {
    this.state.cash = Math.max(0, this.state.cash + amount);
    this.updateHUD();
    this.detection?.recordTransaction(amount);
  }

  addChips(amount) {
    this.state.chips = Math.max(0, this.state.chips + amount);
    this.updateHUD();
  }

  canAffordCash(amount) {
    return this.state.cash >= amount;
  }

  canAffordChips(amount) {
    return this.state.chips >= amount;
  }

  convertCashToChips(amount) {
    if (amount <= 0 || amount > this.state.cash) {
      return { success: false, reason: 'Not enough cash on hand.' };
    }
    this.addCash(-amount);
    this.addChips(amount);
    return { success: true, amount };
  }

  convertChipsToCash(amount) {
    if (amount <= 0 || amount > this.state.chips) {
      return { success: false, reason: 'Not enough chips to cash out.' };
    }
    this.addChips(-amount);
    this.addCash(amount);
    return { success: true, amount };
  }

  addWarning(reason = '') {
    this.state.warnings++;
    this.audioMgr?.play('warning');
    this.ui?.showWarning(reason);
    this.updateHUD();
    if (this.state.warnings >= this.state.maxWarnings) {
      this.die('Security had enough. You never made it out.');
    }
  }

  deliverQuota() {
    if (this.state.cash < this.state.quota) {
      return {
        success: false,
        reason: `Quota missed. You were short $${(this.state.quota - this.state.cash).toLocaleString()}.`,
      };
    }

    const delivered = this.state.cash;
    this.state.totalCashBanked += delivered;
    const isFinalStage = this.state.stageIndex >= this.stages.length - 1;

    if (isFinalStage) {
      this.state.cash = 0;
      this.state.chips = 0;
      this.updateHUD();
      return {
        success: true,
        finalDelivery: true,
        delivered,
      };
    }

    this.progressStage();
    return {
      success: true,
      delivered,
      nextStage: this.getCurrentStage(),
    };
  }

  progressStage() {
    const nextIndex = Math.min(this.state.stageIndex + 1, this.stages.length - 1);
    this.applyStage(nextIndex);
    this.audioMgr?.play('levelup');
    this.detection?.reset();
    this.ui?.showMessage(this.getCurrentStage().bossLine);
  }

  applyStage(index, isInitial = false) {
    const stage = this.stages[index];
    this.state.stageIndex = index;
    this.state.cash = stage.startingCash;
    this.state.chips = 0;
    this.state.quota = stage.requiredQuota;
    this.state.warnings = 0;
    this.state.remainingRealSeconds = this.stageDurationSeconds;
    this.clockStartMinutes = 21 * 60 + index * 60;
    this.state.clockMinutes = this.clockStartMinutes;
    this.state.dealerAvailable = index < this.stages.length - 1;
    this.timeAlertsPlayed = { five: false, one: false };

    if (!isInitial) {
      this.ui?.showToast(`${stage.label}: starting cash $${stage.startingCash.toLocaleString()}.`, 'info');
    }

    this.updateHUD();
  }

  die(reason) {
    this.state.inGame = false;
    this.audioMgr?.play('death');
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay?.classList.remove('hidden');
    this.ui?.showDeath(reason, this.state.roundsPlayed, this.state.totalCashBanked, this.state.stageIndex + 1);
  }

  recordCheatUse(cheatName, risk) {
    this.detection?.recordCheatUse(cheatName, risk);
  }

  recordGameResult(gameType, result, anomaly) {
    this.detection?.recordGameResult(gameType, result, anomaly);
  }

  getCurrentStage() {
    return this.stages[this.state.stageIndex];
  }

  getClockString() {
    let totalMinutes = Math.floor(this.state.clockMinutes);
    totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const meridiem = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours24 + 11) % 12) + 1;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
  }

  getDeadlineString() {
    const totalSeconds = Math.ceil(this.state.remainingRealSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  }

  canUseDealer() {
    return this.state.dealerAvailable;
  }

  setQuota(amount) {
    this.state.quota = Math.max(0, amount);
    this.updateHUD();
  }

  setHudOverrides(overrides = {}) {
    this.hudOverrides = {
      ...this.hudOverrides,
      ...overrides,
    };
    this.updateHUD();
  }

  clearHudOverrides() {
    this.hudOverrides = {
      quotaText: '',
      clockText: '',
    };
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('money').textContent = `Cash: $${this.state.cash.toLocaleString()}`;
    document.getElementById('chips').textContent = `Chips: ${this.state.chips.toLocaleString()}`;
    document.getElementById('quota').textContent = this.hudOverrides.quotaText || `Quota: $${this.state.cash.toLocaleString()} / $${this.state.quota.toLocaleString()}`;
    document.getElementById('clock').textContent = this.hudOverrides.clockText || this.getClockString();
    for (let i = 0; i < 3; i++) {
      const dot = document.getElementById(`w${i}`);
      if (i < this.state.warnings) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    }
  }
}
