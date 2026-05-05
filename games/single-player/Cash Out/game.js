// Main Game Logic
class CashOutGame {
    constructor() {
        this.running = true;
        this.currentGambles = [];
        this.waitingForChoice = false;
        this.inTransition = false;
        this.animationState = null;

        window.gameInstance = this;

        this.setupEventListeners();
        this.startNewRun();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                if (!this.waitingForChoice && !this.inTransition) {
                    this.enterNextRoom();
                }
            }
        });

        // Click to advance
        document.addEventListener('click', (e) => {
            if (e.target === gameEngine.canvas && !this.waitingForChoice && !this.inTransition) {
                this.enterNextRoom();
            }
        });
    }

    startNewRun() {
        player.reset();
        pressureSystem.reset();
        roomManager.roomHistory = [];

        uiManager.hideGameOver();
        uiManager.hideChoices();
        uiManager.showHowToPlay();
        uiManager.updateStats();
        uiManager.updatePressure();
        uiManager.setCashOutButtonEnabled(false);

        this.running = true;
        this.waitingForChoice = false;
        this.inTransition = false;
        this.animationState = null;

        gameEngine.start();
    }

    beginGame() {
        // Show first room after a frame
        setTimeout(() => {
            this.enterNextRoom();
        }, 100);
    }

    async enterNextRoom() {
        if (!this.running || this.waitingForChoice || this.inTransition) return;

        player.depth += 1;

        // Generate new room
        roomManager.generateNextRoom(player.depth);
        this.currentGambles = roomManager.currentRoom.gambles;

        // Update UI
        uiManager.updateStats();
        uiManager.updatePressure();

        // Enable cash out at certain depths
        if (roomManager.currentRoom.canCashOut) {
            uiManager.setCashOutButtonEnabled(true);
        }

        // Show choices
        this.waitingForChoice = true;
        uiManager.showChoices(this.currentGambles, (index) => {
            this.selectGamble(index);
        });
    }

    async selectGamble(index) {
        if (!this.running || index >= this.currentGambles.length) return;

        this.waitingForChoice = false;

        const gamble = this.currentGambles[index];
        const result = gambleSystem.resolve(gamble, player, pressureSystem);

        // Update UI
        uiManager.updateStats();
        uiManager.updatePressure();

        // Show outcome notification
        const message = result.message;
        uiManager.showNotification(message, !result.success);

        // Check death
        if (player.isDead()) {
            await this.playAnimation('death', 1100);
            this.endRun();
            return;
        }

        roomManager.markRoomVisited();

        // Walk into the stairs/portal before the next room appears
        await this.playAnimation('advance', 950);

        if (this.running) {
            this.enterNextRoom();
        }
    }

    playAnimation(mode, duration) {
        this.inTransition = true;
        this.animationState = {
            mode,
            startedAt: Date.now(),
            duration
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                this.animationState = null;
                this.inTransition = false;
                resolve();
            }, duration);
        });
    }

    cashOut() {
        if (!this.running || this.waitingForChoice) return;

        const cashedAmount = Math.floor(player.value);
        player.cashOut(cashedAmount);

        metaProgression.recordRun(player.value, player.depth, cashedAmount);
        metaProgression.save();

        this.endRunWithCashOut(cashedAmount);
    }

    endRun() {
        this.running = false;

        const finalValue = player.value;
        const depth = player.depth;
        const cashed = player.cashed;

        metaProgression.recordRun(finalValue, depth, cashed);
        metaProgression.save();

        uiManager.showGameOver(finalValue, depth, cashed);
        gameEngine.stop();
    }

    endRunWithCashOut(cashedAmount) {
        this.running = false;

        const finalValue = player.value;
        const depth = player.depth;

        // Show cashed out amount
        uiManager.showNotification(`CASHED OUT $${cashedAmount}!`);

        setTimeout(() => {
            uiManager.showGameOver(finalValue, depth, cashedAmount);
            gameEngine.stop();
        }, 1000);
    }
}

// Start game on load
window.addEventListener('load', () => {
    new CashOutGame();
});
