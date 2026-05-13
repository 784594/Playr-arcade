// DetectionSystem.js - Anomaly detection & risk calculation
class DetectionSystem {
  constructor() {
    this.suspicion = 0;
    this.anomalies = [];
    this.maxAnomalies = 50;
    this.gameHistory = [];
    this.maxHistory = 100;
  }

  recordGameResult(gameType, result, anomaly = null) {
    const entry = {
      type: gameType,
      result,
      anomaly,
      timestamp: Date.now(),
    };
    this.gameHistory.push(entry);
    if (this.gameHistory.length > this.maxHistory) {
      this.gameHistory.shift();
    }

    // Analyze patterns
    this.analyzePatterns();
  }

  recordCheatUse(cheatName, risk) {
    const riskScore = { low: 10, medium: 30, high: 60, extreme: 100 }[risk] || 0;
    this.suspicion += riskScore;
    this.anomalies.push({ type: 'cheat', name: cheatName, risk, time: Date.now() });
    if (this.anomalies.length > this.maxAnomalies) {
      this.anomalies.shift();
    }
  }

  recordTransaction(amount) {
    // Unusual transaction sizes raise suspicion
    if (Math.abs(amount) > 200) {
      this.suspicion += 15;
      this.anomalies.push({ type: 'transaction', amount, time: Date.now() });
    }
  }

  analyzePatterns() {
    if (this.gameHistory.length < 10) return;

    // Check for impossible win streaks
    const recent = this.gameHistory.slice(-10);
    const wins = recent.filter(g => g.result === 'WIN').length;
    if (wins >= 8) {
      this.suspicion += 20;
    }

    // Check for anomaly clustering
    const anomalyCount = this.anomalies.filter(a => Date.now() - a.time < 300000).length; // 5 min
    if (anomalyCount >= 5) {
      this.suspicion += 25;
    }
  }

  getSuspicion() {
    return Math.min(100, this.suspicion);
  }

  checkTriggerWarning() {
    const susp = this.getSuspicion();
    // Thresholds for warnings
    if (susp >= 80) return 'extreme';
    if (susp >= 50) return 'moderate';
    if (susp >= 25) return 'light';
    return null;
  }

  reset() {
    this.suspicion = 0;
    this.anomalies = [];
    this.gameHistory = [];
  }

  getReport() {
    return {
      suspicion: this.getSuspicion(),
      anomalyCount: this.anomalies.length,
      recentEvents: this.anomalies.slice(-5),
    };
  }
}
