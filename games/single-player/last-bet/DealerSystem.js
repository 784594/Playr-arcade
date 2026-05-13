// DealerSystem.js - Dealer inventory management and messages
class DealerSystem {
  constructor(cheatSystem) {
    this.cheatSystem = cheatSystem;
    this.inventory = [];
    this.lastRefreshTime = Date.now();
    this.refreshInterval = 60000; // 60 seconds outside bathroom
    this.outsideDuration = 0;
    this.lastOutsideTime = 0;
    this.messages = [
      "Security is watching closer than usual.",
      "You're walking a thin line.",
      "One more slip and you're done.",
      "I'm losing faith in you.",
      "Don't waste my time.",
      "You need to be smarter.",
      "That was sloppy.",
      "They're suspicious now.",
      "Keep your head down.",
      "You're running out of chances.",
      "Move faster. Time's running out.",
      "The boss is getting impatient.",
    ];
    this.lastMessageTime = 0;
    this.messageCooldown = 30000; // 30 seconds between messages
    this.refreshInventory();
  }

  getRandomMessage() {
    const now = Date.now();
    if (now - this.lastMessageTime > this.messageCooldown) {
      this.lastMessageTime = now;
      return this.messages[Math.floor(Math.random() * this.messages.length)];
    }
    return null;
  }

  refreshInventory() {
    this.inventory = [];
    const cheats = this.cheatSystem.getCheats();
    
    // Randomly select up to 7 items
    const selected = [];
    for (const cheat of cheats) {
      if (Math.random() < 0.5 && selected.length < 7) {
        selected.push({
          ...cheat,
          currentStock: Math.max(1, Math.floor(Math.random() * 3) + 1),
        });
      }
    }
    this.inventory = selected;
    this.lastRefreshTime = Date.now();
  }

  recordOutsideDuration(duration) {
    if (duration >= 60) {
      this.lastOutsideTime = Date.now();
    }
  }

  refreshIfValid() {
    const timeSinceLastOutside = Date.now() - this.lastOutsideTime;
    if (timeSinceLastOutside >= this.refreshInterval) {
      this.refreshInventory();
      return true;
    }
    return false;
  }

  getInventory() {
    return this.inventory;
  }

  purchaseCheat(cheatId) {
    const item = this.inventory.find(i => i.id === cheatId);
    if (!item) return { success: false, reason: 'Item not found' };
    if (item.currentStock <= 0) return { success: false, reason: 'Out of stock' };
    
    item.currentStock--;
    if (item.currentStock <= 0) {
      this.inventory = this.inventory.filter(i => i.id !== cheatId);
    }
    return { success: true, cost: item.cost };
  }
}
