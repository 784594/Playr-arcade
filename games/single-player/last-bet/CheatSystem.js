// CheatSystem.js - Cheating mechanics
class CheatSystem {
  constructor() {
    this.cheats = {
      // Dice cheats
      weighted_die: {
        name: 'Weighted Die',
        cost: 40,
        stock: 2,
        uses: 3,
        risk: 'medium',
        effect: (gameResult) => {
          if (gameResult.gameType === 'dice') {
            return { payout: gameResult.payout * 1.5, anomaly: 'unusual average' };
          }
          return gameResult;
        },
      },
      third_die: {
        name: 'Third Die',
        cost: 60,
        stock: 1,
        uses: 2,
        risk: 'high',
        effect: (gameResult) => {
          if (gameResult.gameType === 'dice') {
            return { payout: gameResult.payout * 2, anomaly: 'impossible total' };
          }
          return gameResult;
        },
      },
      // Blackjack cheats
      sleeve_ace: {
        name: 'Sleeve Ace',
        cost: 80,
        stock: 1,
        uses: 1,
        risk: 'extreme',
        effect: (gameResult) => {
          if (gameResult.gameType === 'blackjack') {
            return { payout: gameResult.payout * 3, anomaly: 'duplicate card signature' };
          }
          return gameResult;
        },
      },
      card_peek: {
        name: 'Card Peek',
        cost: 35,
        stock: 3,
        uses: 5,
        risk: 'low',
        effect: (gameResult) => {
          if (gameResult.gameType === 'blackjack') {
            return { payout: gameResult.payout * 1.3, anomaly: 'perfect play pattern' };
          }
          return gameResult;
        },
      },
      // Slots cheats
      timing_device: {
        name: 'Timing Device',
        cost: 50,
        stock: 2,
        uses: 4,
        risk: 'medium',
        effect: (gameResult) => {
          if (gameResult.gameType === 'slots') {
            return { payout: gameResult.payout * 1.8, anomaly: 'reel timing anomaly' };
          }
          return gameResult;
        },
      },
      // Global cheats
      camera_blind: {
        name: 'Camera Blind',
        cost: 100,
        stock: 1,
        uses: 2,
        risk: 'high',
        effect: (gameResult) => {
          return { payout: gameResult.payout * 1.5, anomaly: 'camera blind spot' };
        },
      },
      signal_jammer: {
        name: 'Signal Jammer',
        cost: 150,
        stock: 1,
        uses: 1,
        risk: 'extreme',
        effect: (gameResult) => {
          return { payout: gameResult.payout * 2.5, anomaly: 'surveillance disruption' };
        },
      },
    };
  }

  getCheats() {
    return Object.entries(this.cheats).map(([key, cheat]) => ({
      id: key,
      ...cheat,
    }));
  }

  getCheat(id) {
    return this.cheats[id];
  }

  applyCheat(cheatId, gameResult) {
    const cheat = this.cheats[cheatId];
    if (!cheat) return gameResult;
    return cheat.effect(gameResult);
  }
}
