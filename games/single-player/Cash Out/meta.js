// Meta Progression System
class MetaProgression {
    constructor() {
        this.stats = {
            totalCashed: 0,
            bestRun: 0,
            gamesPlayed: 0,
            maxDepth: 0
        };

        this.unlocks = {
            gambleTypes: ['fixed_trade', 'probability_roll', 'rest_site'],
            modifiers: []
        };

        this.load();
    }

    load() {
        const saved = localStorage.getItem('cashout_meta');
        if (saved) {
            const data = JSON.parse(saved);
            this.stats = { ...this.stats, ...data.stats };
            this.unlocks = { ...this.unlocks, ...data.unlocks };
        }
    }

    save() {
        localStorage.setItem('cashout_meta', JSON.stringify({
            stats: this.stats,
            unlocks: this.unlocks
        }));
    }

    recordRun(value, depth, cashed) {
        this.stats.totalCashed += cashed;
        this.stats.gamesPlayed += 1;
        
        if (depth > this.stats.maxDepth) {
            this.stats.maxDepth = depth;
        }

        if (cashed > this.stats.bestRun) {
            this.stats.bestRun = cashed;
        }

        // Unlock new gamble types at milestones
        if (this.stats.bestRun >= 500 && !this.unlocks.gambleTypes.includes('hidden_outcome')) {
            this.unlocks.gambleTypes.push('hidden_outcome');
        }
        if (this.stats.bestRun >= 1000 && !this.unlocks.gambleTypes.includes('escalating_gamble')) {
            this.unlocks.gambleTypes.push('escalating_gamble');
        }
        if (this.stats.maxDepth >= 10 && !this.unlocks.gambleTypes.includes('pressure_trade')) {
            this.unlocks.gambleTypes.push('pressure_trade');
        }

        this.save();
    }

    getRandomGambleType() {
        return this.unlocks.gambleTypes[
            Math.floor(Math.random() * this.unlocks.gambleTypes.length)
        ];
    }
}

const metaProgression = new MetaProgression();
