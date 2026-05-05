// Player System
class Player {
    constructor() {
        this.hp = 100;
        this.maxHp = 100;
        this.value = 0;
        this.pressure = 0;
        this.streak = 0;
        this.depth = 0;
        this.cashed = 0;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    gainValue(amount) {
        this.value += amount;
    }

    loseValue(amount) {
        this.value = Math.max(0, this.value - amount);
    }

    cashOut(amount) {
        this.cashed += amount;
        this.value -= amount;
        this.value = Math.max(0, this.value);
    }

    reset() {
        this.hp = 100;
        this.maxHp = 100;
        this.value = 0;
        this.pressure = 0;
        this.streak = 0;
        this.depth = 0;
        this.cashed = 0;
    }

    isDead() {
        return this.hp <= 0;
    }

    getHpPercent() {
        return (this.hp / this.maxHp) * 100;
    }
}

// Pressure System
class PressureSystem {
    constructor() {
        this.pressure = 0;
        this.maxPressure = 100;
        this.baseIncrement = 5;
    }

    update(depth, streak) {
        // Pressure increases based on depth and streak
        const depthFactor = depth * 0.5;
        const streakFactor = Math.min(streak * 0.3, 10);
        
        this.pressure += this.baseIncrement + depthFactor + streakFactor;
        this.pressure = Math.min(this.pressure, this.maxPressure);
    }

    decrease(amount) {
        this.pressure = Math.max(0, this.pressure - amount);
    }

    getLevel() {
        if (this.pressure < 25) return 'LOW';
        if (this.pressure < 50) return 'MODERATE';
        if (this.pressure < 75) return 'HIGH';
        return 'CRITICAL';
    }

    getModifiers() {
        const mods = {
            oddsShift: 0,
            damageMultiplier: 1.0,
            valueLossMultiplier: 1.0
        };

        if (this.pressure >= 25) {
            mods.oddsShift = -0.1; // 10% worse odds
            mods.damageMultiplier = 1.1;
        }
        if (this.pressure >= 50) {
            mods.oddsShift = -0.2;
            mods.damageMultiplier = 1.3;
            mods.valueLossMultiplier = 1.2;
        }
        if (this.pressure >= 75) {
            mods.oddsShift = -0.3;
            mods.damageMultiplier = 1.6;
            mods.valueLossMultiplier = 1.5;
        }

        return mods;
    }

    reset() {
        this.pressure = 0;
    }

    getPressurePercent() {
        return (this.pressure / this.maxPressure) * 100;
    }
}

// Gamble System
class GambleSystem {
    constructor() {
        this.gambleTypes = {
            fixed_trade: {
                name: 'Fixed Trade',
                description: 'Certain exchange: lose HP for Value',
                generate: () => this.genFixedTrade()
            },
            probability_roll: {
                name: 'Probability Roll',
                description: 'Risky bet: chance to win big or lose some Value',
                generate: () => this.genProbabilityRoll()
            },
            hidden_outcome: {
                name: 'Unknown Outcome',
                description: 'Mystery choice: unknown reward or penalty',
                generate: () => this.genHiddenOutcome()
            },
            escalating_gamble: {
                name: 'Double or Nothing',
                description: 'High risk, high reward: double or lose current value',
                generate: () => this.genEscalatingGamble()
            },
            pressure_trade: {
                name: 'Pressure Release',
                description: 'Trade pressure for resources',
                generate: () => this.genPressureTrade()
            },
            rest_site: {
                name: 'Rest Site',
                description: 'Recover HP at the cost of some value',
                generate: () => this.genRestSite()
            }
        };
    }

    genFixedTrade() {
        const hpCost = 10 + Math.random() * 20;
        const valueReward = hpCost * 3 + Math.random() * 20;

        return {
            type: 'fixed_trade',
            name: 'Fixed Trade',
            description: `Lose ${Math.round(hpCost)} HP for $${Math.round(valueReward)}`,
            outcomes: [
                {
                    chance: 1.0,
                    result: {
                        hp: -Math.round(hpCost),
                        value: Math.round(valueReward)
                    }
                }
            ]
        };
    }

    genProbabilityRoll() {
        const successChance = 0.5 + Math.random() * 0.3; // 50-80%
        const reward = 50 + Math.random() * 100;
        const penalty = 20 + Math.random() * 40;

        return {
            type: 'probability_roll',
            name: 'Probability Roll',
            description: `${Math.round(successChance * 100)}% to gain $${Math.round(reward)} or lose ${Math.round(penalty)} HP`,
            outcomes: [
                {
                    chance: successChance,
                    result: { value: Math.round(reward) }
                },
                {
                    chance: 1 - successChance,
                    result: { hp: -Math.round(penalty) }
                }
            ]
        };
    }

    genHiddenOutcome() {
        const outcomes = [
            { chance: 0.4, result: { value: 150 } }, // Great win
            { chance: 0.3, result: { value: 50 } },   // Okay win
            { chance: 0.2, result: { hp: -30 } },     // Loss
            { chance: 0.1, result: { hp: -60 } }      // Big loss
        ];

        return {
            type: 'hidden_outcome',
            name: 'Unknown Outcome',
            description: 'Mysterious exchange: result will be revealed',
            outcomes: outcomes
        };
    }

    genEscalatingGamble() {
        return {
            type: 'escalating_gamble',
            name: 'Double or Nothing',
            description: 'Double your current value or lose it all. (50% chance)',
            outcomes: [
                {
                    chance: 0.5,
                    result: { valueMultiplier: 2 }
                },
                {
                    chance: 0.5,
                    result: { valueLoss: 1.0 } // Lose all value
                }
            ]
        };
    }

    genPressureTrade() {
        return {
            type: 'pressure_trade',
            name: 'Pressure Release',
            description: 'Reduce pressure by 30, gain $100',
            outcomes: [
                {
                    chance: 1.0,
                    result: {
                        pressure: -30,
                        value: 100
                    }
                }
            ]
        };
    }

    genRestSite() {
        const healAmount = 20 + Math.floor(Math.random() * 25);
        const valueCost = 0.1 + Math.random() * 0.1;
        const valueCostPercent = Math.round(valueCost * 100);

        return {
            type: 'rest_site',
            name: 'Rest Site',
            description: `Restore ${healAmount} HP by spending ${valueCostPercent}% of your value`,
            outcomes: [
                {
                    chance: 1.0,
                    result: {
                        hp: healAmount,
                        valueLoss: valueCost
                    }
                }
            ]
        };
    }

    resolve(gamble, player, pressureSystem) {
        // Roll for outcome
        const roll = Math.random();
        let cumulative = 0;
        let outcome = null;

        for (let option of gamble.outcomes) {
            cumulative += option.chance;
            if (roll <= cumulative) {
                outcome = option.result;
                break;
            }
        }

        if (!outcome) {
            outcome = gamble.outcomes[gamble.outcomes.length - 1].result;
        }

        // Apply outcome with pressure modifiers
        const mods = pressureSystem.getModifiers();

        if (outcome.hp !== undefined) {
            if (outcome.hp < 0) {
                const damage = Math.round(outcome.hp * mods.damageMultiplier);
                player.takeDamage(-damage); // hp is negative for damage
            } else if (outcome.hp > 0) {
                player.heal(Math.round(outcome.hp));
            }
        }

        if (outcome.value !== undefined) {
            player.gainValue(outcome.value);
        }

        if (outcome.valueLoss !== undefined) {
            player.loseValue(player.value * outcome.valueLoss);
        }

        if (outcome.valueMultiplier !== undefined) {
            player.value = Math.round(player.value * outcome.valueMultiplier);
        }

        if (outcome.pressure !== undefined) {
            pressureSystem.decrease(-outcome.pressure);
        }

        // Update streak
        const wasLoss = outcome.hp && outcome.hp < 0 && !outcome.value;
        if (wasLoss) {
            player.streak = 0;
        } else {
            player.streak += 1;
        }

        // Increase pressure
        pressureSystem.update(player.depth, player.streak);

        return {
            success: !wasLoss,
            outcome: outcome,
            message: this.getOutcomeMessage(gamble, outcome, wasLoss)
        };
    }

    getOutcomeMessage(gamble, outcome, wasLoss) {
        if (outcome.hp && outcome.hp < 0) {
            return `LOST ${-Math.round(outcome.hp)} HP`;
        }
        if (outcome.hp && outcome.hp > 0) {
            return `HEALED ${Math.round(outcome.hp)} HP`;
        }
        if (outcome.value) {
            return `GAINED $${Math.round(outcome.value)}`;
        }
        if (outcome.valueMultiplier) {
            return `VALUE x${outcome.valueMultiplier}`;
        }
        return 'GAMBLE RESOLVED';
    }

    generateGambles(count = 3, allowedTypes = null) {
        const gambles = [];
        const types = allowedTypes || Object.keys(this.gambleTypes);

        for (let i = 0; i < count; i++) {
            const typeKey = types[Math.floor(Math.random() * types.length)];
            const gamble = this.gambleTypes[typeKey].generate();
            gambles.push(gamble);
        }

        return gambles;
    }
}

const player = new Player();
const pressureSystem = new PressureSystem();
const gambleSystem = new GambleSystem();
