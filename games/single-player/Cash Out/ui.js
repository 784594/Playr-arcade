// UI Manager
class UIManager {
    constructor() {
        this.choicePanel = document.getElementById('choice-panel');
        this.choiceContainer = document.getElementById('choice-container');
        this.choiceTitle = document.getElementById('choice-title');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.howToPlayScreen = document.getElementById('how-to-play-screen');
        this.notification = document.getElementById('notification');

        this.setupButtons();
    }

    setupButtons() {
        document.getElementById('cash-out-btn').addEventListener('click', () => {
            if (window.gameInstance) {
                window.gameInstance.cashOut();
            }
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            if (window.gameInstance) {
                window.gameInstance.startNewRun();
            }
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            this.hideHowToPlay();
            if (window.gameInstance) {
                window.gameInstance.beginGame();
            }
        });
    }

    updateStats() {
        document.getElementById('hp-value').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('value-value').textContent = `$${player.value}`;
        document.getElementById('depth-value').textContent = player.depth;
        document.getElementById('streak-value').textContent = player.streak;
        document.getElementById('saved-value').textContent = `$${metaProgression.stats.totalCashed}`;

        // Update HP bar color
        const hpBar = document.getElementById('hp-bar');
        const hpPercent = player.getHpPercent();
        hpBar.style.width = hpPercent + '%';

        if (hpPercent < 30) {
            hpBar.classList.add('low-hp');
        } else {
            hpBar.classList.remove('low-hp');
        }
    }

    updatePressure() {
        const pressurePercent = pressureSystem.getPressurePercent();
        document.getElementById('pressure-bar').style.width = pressurePercent + '%';

        const pressureValue = pressureSystem.pressure;
        const pressureText = document.getElementById('pressure-text');
        const pressureBar = document.getElementById('pressure-bar');

        let level = 'LOW';
        if (pressureValue >= 75) {
            level = 'CRITICAL';
            pressureText.classList.add('critical');
            pressureBar.classList.add('critical');
        } else if (pressureValue >= 50) {
            level = 'UNSTABLE';
            pressureText.classList.remove('critical');
            pressureBar.classList.remove('critical');
            pressureText.classList.add('unstable');
        } else if (pressureValue >= 25) {
            level = 'RISING';
            pressureText.classList.remove('critical', 'unstable');
            pressureBar.classList.remove('critical');
            pressureText.classList.add('rising');
        } else {
            level = 'LOW';
            pressureText.classList.remove('critical', 'unstable', 'rising');
            pressureBar.classList.remove('critical');
        }

        pressureText.textContent = level;
    }

    showChoices(gambles, onSelect) {
        this.choiceContainer.innerHTML = '';
        this.choiceTitle.textContent = `⚡ DEPTH ${player.depth + 1} - CHOOSE YOUR GAMBLE`;

        for (let i = 0; i < gambles.length; i++) {
            const gamble = gambles[i];
            const option = document.createElement('div');
            option.className = 'choice-option';

            const typeEl = document.createElement('div');
            typeEl.className = 'choice-type';
            typeEl.textContent = gamble.type.toUpperCase().replace(/_/g, ' ');

            const descEl = document.createElement('div');
            descEl.className = 'choice-description';
            descEl.textContent = roomManager.getGamebleDescription(gamble);

            option.appendChild(typeEl);
            option.appendChild(descEl);

            const outcomes = roomManager.getGamebleOutcomes(gamble);
            const outcomesContainer = document.createElement('div');
            outcomesContainer.className = 'choice-outcomes';

            // Separate losses and gains
            const losses = outcomes.filter(o => o.type === 'loss');
            const gains = outcomes.filter(o => o.type === 'gain');

            if (losses.length > 0) {
                const lossSection = document.createElement('div');
                lossSection.className = 'choice-outcome choice-outcome-loss';

                const lossLabel = document.createElement('span');
                lossLabel.className = 'choice-outcome-label';
                lossLabel.textContent = '❌ LOSE';
                lossSection.appendChild(lossLabel);

                for (let loss of losses) {
                    const lossValue = document.createElement('div');
                    lossValue.className = 'choice-outcome-value';
                    lossValue.textContent = loss.text;
                    lossSection.appendChild(lossValue);

                    if (loss.chance < 1.0) {
                        const probEl = document.createElement('div');
                        probEl.className = 'choice-outcome-probability';
                        probEl.textContent = `(${Math.round(loss.chance * 100)}% chance)`;
                        lossSection.appendChild(probEl);
                    }
                }

                outcomesContainer.appendChild(lossSection);
            }

            if (gains.length > 0) {
                const gainSection = document.createElement('div');
                gainSection.className = 'choice-outcome choice-outcome-gain';

                const gainLabel = document.createElement('span');
                gainLabel.className = 'choice-outcome-label';
                gainLabel.textContent = '✓ GAIN';
                gainSection.appendChild(gainLabel);

                for (let gain of gains) {
                    const gainValue = document.createElement('div');
                    gainValue.className = 'choice-outcome-value';
                    gainValue.textContent = gain.text;
                    gainSection.appendChild(gainValue);

                    if (gain.chance < 1.0) {
                        const probEl = document.createElement('div');
                        probEl.className = 'choice-outcome-probability';
                        probEl.textContent = `(${Math.round(gain.chance * 100)}% chance)`;
                        gainSection.appendChild(probEl);
                    }
                }

                outcomesContainer.appendChild(gainSection);
            }

            option.appendChild(outcomesContainer);

            if (outcomes.some(o => o.type === 'loss')) {
                option.classList.add('risky');
            }

            option.addEventListener('click', () => {
                this.hideChoices();
                onSelect(i);
            });

            this.choiceContainer.appendChild(option);
        }

        this.choicePanel.classList.remove('hidden');
    }

    hideChoices() {
        this.choicePanel.classList.add('hidden');
    }

    showGameOver(finalValue, depth, cashed) {
        document.getElementById('final-value').textContent = `$${finalValue}`;
        document.getElementById('final-depth').textContent = depth;
        document.getElementById('final-cashed').textContent = `$${cashed}`;

        this.gameOverScreen.classList.remove('hidden');
    }

    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }

    showNotification(message, isLoss = false) {
        this.notification.textContent = message;
        this.notification.classList.remove('hidden');

        if (isLoss) {
            this.notification.classList.add('loss');
            // Add screen shake on loss
            document.getElementById('game-canvas').classList.add('screen-shake');
            setTimeout(() => {
                document.getElementById('game-canvas').classList.remove('screen-shake');
            }, 300);
        } else {
            this.notification.classList.remove('loss');
        }

        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 2000);
    }

    setCashOutButtonEnabled(enabled) {
        document.getElementById('cash-out-btn').disabled = !enabled;
    }

    showHowToPlay() {
        this.howToPlayScreen.classList.remove('hidden');
    }

    hideHowToPlay() {
        this.howToPlayScreen.classList.add('hidden');
    }
}

const uiManager = new UIManager();
