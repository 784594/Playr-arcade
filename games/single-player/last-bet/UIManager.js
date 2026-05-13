// UIManager.js - UI and panels management
class UIManager {
  constructor() {
    this.currentPanel = null;
    this.cheats = [];
    this.equippedCheats = [null, null, null, null, null];
    this.toastTimer = null;
  }

  setEquippedCheats(cheats) {
    this.cheats = cheats;
  }

  showGamePanel(gameData) {
    const panel = document.getElementById('game-panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');

    title.textContent = gameData.name;
    let html = `<p>${gameData.description}</p>`;
    html += `<p style="margin-bottom: 14px; color: #9fc3ff;">Minimum chips on hand: ${gameData.minimumStake.toLocaleString()}</p>`;

    for (const opt of gameData.options || []) {
      html += `<div class="game-option" onclick="window.gameUI.selectGameOption('${opt.value}')">${opt.label}</div>`;
    }

    html += `<button onclick="window.gameUI.hidePanel()">Back Away</button>`;
    body.innerHTML = html;
    panel.classList.remove('hidden');
    this.currentPanel = 'game';
  }

  showDealerPanel(inventory, dealerAvailable) {
    const panel = document.getElementById('game-panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');

    title.textContent = 'Dealer Inventory';
    let html = '<p style="margin-bottom: 12px; color: #999;">Bathroom handoff stock. Cash only.</p>';

    if (!dealerAvailable) {
      html += '<p>The dealer got caught. The stall is empty.</p>';
    } else if (inventory.length === 0) {
      html += '<p>No items available right now.</p>';
    } else {
      for (const item of inventory) {
        html += `
          <div class="game-option">
            <div style="display: flex; justify-content: space-between;">
              <div><strong>${item.name}</strong></div>
              <div style="color: var(--accent);">$${item.cost.toLocaleString()}</div>
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 4px;">Stock: ${item.currentStock} | Risk: ${item.risk} | Uses: ${item.uses}</div>
            <button onclick="window.gameUI.purchaseCheat('${item.id}')">Buy</button>
          </div>
        `;
      }
    }

    html += '<button onclick="window.gameUI.hidePanel()">Close</button>';
    body.innerHTML = html;
    panel.classList.remove('hidden');
    this.currentPanel = 'dealer';
  }

  showAtmPanel(atmName, cash, chips) {
    const panel = document.getElementById('game-panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');

    title.textContent = atmName;
    body.innerHTML = `
      <p>Sterile camera-facing conversion point. Chips are safer in the pit. Cash is safer in the bag.</p>
      <div class="stat-row"><span class="label">Current Cash</span><span class="value">$${cash.toLocaleString()}</span></div>
      <div class="stat-row"><span class="label">Current Chips</span><span class="value">${chips.toLocaleString()}</span></div>
      <hr>
      <p style="margin-bottom: 8px;">Cash to Chips</p>
      <div class="game-option" onclick="window.gameUI.convertAtm('cashToChips', 1000)">Convert $1,000</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('cashToChips', 5000)">Convert $5,000</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('cashToChips', 10000)">Convert $10,000</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('cashToChips', 'all')">Convert All Cash</div>
      <hr>
      <p style="margin-bottom: 8px;">Chips to Cash</p>
      <div class="game-option" onclick="window.gameUI.convertAtm('chipsToCash', 1000)">Cash Out 1,000 Chips</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('chipsToCash', 5000)">Cash Out 5,000 Chips</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('chipsToCash', 10000)">Cash Out 10,000 Chips</div>
      <div class="game-option" onclick="window.gameUI.convertAtm('chipsToCash', 'all')">Cash Out All Chips</div>
      <button onclick="window.gameUI.hidePanel()">Step Away</button>
    `;
    panel.classList.remove('hidden');
    this.currentPanel = 'atm';
  }

  showEscapePanel(puzzleState, timeRemaining) {
    const panel = document.getElementById('game-panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');
    const secondsText = Math.max(0, timeRemaining).toFixed(1);

    title.textContent = 'Aureon V12';
    body.innerHTML = `
      <p id="escape-countdown-copy">${puzzleState.engineStarted ? 'Engine live. Hold on.' : `Detonation in ${secondsText}s. Move.`}</p>
      <div class="escape-step ${puzzleState.panelOpened ? 'done' : 'active'}">
        <h3>1. Open Hidden Panel</h3>
        <p>Find the concealed service latch under the dash.</p>
        ${puzzleState.panelOpened ? '<p>Panel opened.</p>' : '<button onclick="window.gameUI.escapePuzzleAction(\'openPanel\')">Pop Service Panel</button>'}
      </div>
      <div class="escape-step ${puzzleState.panelOpened && !puzzleState.wiresSolved ? 'active' : ''} ${puzzleState.wiresSolved ? 'done' : ''}">
        <h3>2. Connect Matching Wires</h3>
        ${puzzleState.panelOpened ? this.buildWireMarkup(puzzleState) : '<p>Panel access required.</p>'}
      </div>
      <div class="escape-step ${puzzleState.wiresSolved && !puzzleState.engineStarted ? 'active' : ''} ${puzzleState.engineStarted ? 'done' : ''}">
        <h3>3. Hold Ignition</h3>
        ${puzzleState.wiresSolved ? `
          <p>Keep the starter engaged for two seconds.</p>
          <button
            onpointerdown="window.gameUI.startIgnitionHold()"
            onpointerup="window.gameUI.stopIgnitionHold()"
            onpointerleave="window.gameUI.stopIgnitionHold()"
            ontouchstart="window.gameUI.startIgnitionHold()"
            ontouchend="window.gameUI.stopIgnitionHold()"
          >Hold Ignition</button>
          <div class="ignition-bar"><div id="ignition-fill" class="ignition-fill" style="width:${Math.round((puzzleState.ignitionHoldProgress || 0) * 100)}%"></div></div>
        ` : '<p>Starter circuit is still dead.</p>'}
      </div>
    `;
    panel.classList.remove('hidden');
    this.currentPanel = 'escape';
  }

  buildWireMarkup(puzzleState) {
    const terminalOptions = (puzzleState.terminals || []).map((terminal) => terminal.label);
    return `
      <div class="wire-grid">
        ${puzzleState.wires.map((wire) => {
          const selected = puzzleState.connections[wire.id];
          const isCorrect = selected === wire.match;
          return `
            <div class="wire-row">
              <strong>${wire.label} wire</strong>
              <div class="wire-options">
                ${terminalOptions.map((option) => `
                  <button
                    class="wire-button ${selected === option ? (isCorrect ? 'correct' : 'wrong') : ''}"
                    onclick="window.gameUI.escapePuzzleAction('connectWire','${wire.id}','${option}')"
                  >${option}</button>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  updateIgnitionHold(progress) {
    const fill = document.getElementById('ignition-fill');
    if (fill) {
      fill.style.width = `${Math.round(progress * 100)}%`;
    }
  }

  updateEscapePanelCountdown(timeRemaining, engineStarted = false) {
    const label = document.getElementById('escape-countdown-copy');
    if (label) {
      label.textContent = engineStarted
        ? 'Engine live. Hold on.'
        : `Detonation in ${Math.max(0, timeRemaining).toFixed(1)}s. Move.`;
    }
  }

  showEnding(text, cash, stageLabel) {
    this.hidePanel();
    const panel = document.getElementById('ending-panel');
    document.getElementById('ending-reason').textContent = text;
    document.getElementById('ending-cash').textContent = `$${cash.toLocaleString()}`;
    document.getElementById('ending-stage').textContent = stageLabel;
    panel.classList.remove('hidden');
  }

  showWarning(reason) {
    const hint = document.getElementById('interaction-hint');
    hint.textContent = `WARNING: ${reason}`;
    this.showToast(reason, 'warning');
    setTimeout(() => {
      if (hint.textContent === `WARNING: ${reason}`) {
        hint.textContent = '';
      }
    }, 3000);
  }

  showMessage(text) {
    this.showToast(text, 'info');
  }

  showToast(text, tone = 'info') {
    const toast = document.getElementById('message-toast');
    if (!toast) return;

    clearTimeout(this.toastTimer);
    toast.textContent = text;
    toast.dataset.tone = tone;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      toast.classList.add('hidden');
    }, 3200);
  }

  showDeath(reason, rounds, cash, stage) {
    const panel = document.getElementById('death-panel');
    const reasonEl = document.getElementById('death-reason');
    document.getElementById('stat-rounds').textContent = rounds.toString();
    document.getElementById('stat-cash').textContent = `$${cash.toLocaleString()}`;
    document.getElementById('stat-cycle').textContent = stage.toString();
    reasonEl.textContent = reason;
    panel.classList.remove('hidden');
  }

  showInteractionHint(text) {
    const hint = document.getElementById('interaction-hint');
    hint.textContent = text || '';
  }

  hidePanel() {
    document.getElementById('game-panel').classList.add('hidden');
    this.currentPanel = null;
  }

  selectGameOption(value) {
    window.gameInstance?.handleGameSelection(value);
  }

  purchaseCheat(cheatId) {
    window.gameInstance?.purchaseCheat(cheatId);
  }

  convertAtm(direction, amount) {
    window.gameInstance?.handleAtmConversion(direction, amount);
  }

  useCheat(slot) {
    window.gameInstance?.queueCheat(slot);
  }

  scrollHotbar(direction) {
    window.gameInstance?.cycleCheatSelection(direction);
  }

  useHotkey(index) {
    window.gameInstance?.handleHotkey(index);
  }

  escapePuzzleAction(action, arg1, arg2) {
    window.gameInstance?.handleEscapePuzzleAction(action, arg1, arg2);
  }

  startIgnitionHold() {
    window.gameInstance?.setIgnitionHolding(true);
  }

  stopIgnitionHold() {
    window.gameInstance?.setIgnitionHolding(false);
  }
}
