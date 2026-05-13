// main.js - Game initialization and main loop
let gameInstance = null;

class Game {
  constructor() {
    this.fadeDurationMs = 5000;
    this.transitionHoldMs = 150;
    this.bathroomScene = new THREE.Scene();
    this.casinoScene = new THREE.Scene();
    this.scene = this.bathroomScene;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x0a0e27);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    this.gameMgr = new GameManager();
    this.audioMgr = new AudioManager();
    this.detection = new DetectionSystem();
    this.cheatSys = new CheatSystem();
    this.dealer = new DealerSystem(this.cheatSys);
    this.ui = new UIManager();
    this.dialogueSystem = new DialogueSystem();
    this.ui.setEquippedCheats(this.cheatSys.getCheats());

    this.gameMgr.init(this.ui, this.audioMgr, this.detection, this.dealer);

    this.bathroomEnvironment = new BathroomEnvironment(this.bathroomScene);
    this.casinoEnvironment = new CasinoEnvironment(this.casinoScene);
    this.environment = this.bathroomEnvironment;
    this.npcSystem = new NPCSystem(this.casinoScene);

    this.player = new PlayerController(this.camera, this.renderer.domElement);
    this.player.interactCallback = (raycaster, distance) => this.handleInteraction(raycaster, distance);
    this.player.setPosition(
      this.bathroomEnvironment.getSpawnPosition().x,
      this.bathroomEnvironment.getSpawnPosition().y,
      this.bathroomEnvironment.getSpawnPosition().z
    );
    this.player.yaw = this.bathroomEnvironment.getSpawnYaw();
    this.player.setBounds(-4.2, 4.2, -4.4, 4.4);

    this.hotbar = [null, null, null, null, null];
    this.activeCheatSlot = null;
    this.updateHotbarUI();

    this.clock = new THREE.Clock();
    this.currentLocation = 'bathroom';
    this.isTransitioning = false;
    this.currentGameData = null;
    this.dialogueFlags = {
      intro_completed: false,
      slots_tutorial_seen: false,
      blackjack_tutorial_seen: false,
      dice_tutorial_seen: false,
      dealer_intro_seen: false,
      final_quota_dialogue_seen: false,
      suspicion_warning_seen: false,
      aureon_intro_seen: false,
      impossible_quota_revealed: false,
    };
    this.pendingFinalChoice = null;
    this.escapeCountdownActive = false;
    this.escapeTimeRemaining = 20;
    this.escapeUrgentPulse = 0;
    this.escapeFailed = false;
    this.escapeCompleted = false;
    this.escapePuzzleActive = false;
    this.escapeSequenceActive = false;
    this.escapeSequenceElapsed = 0;
    this.escapePuzzleState = this.createEscapePuzzleState();

    this.bathroomEnvironment.setDealerAvailable(this.gameMgr.canUseDealer());
    this.casinoEnvironment.setAureonInspectionEnabled(true);
    this.casinoEnvironment.setAureonEscapeEnabled(false);

    window.gameUI = this.ui;
    window.gameInstance = this;

    this.setupEventListeners();
    this.playOpeningSequence();
    this.animate();
  }

  playOpeningSequence() {
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.classList.remove('hidden');
    this.setDialogueMode(true);
    this.dialogueSystem.startDialogue(this.createIntroDialogue(), {
      onComplete: () => this.onIntroDialogueComplete(),
    });
  }

  onIntroDialogueComplete() {
    this.dialogueFlags.intro_completed = true;
    document.getElementById('hud').classList.remove('hidden');
    this.gameMgr.startGame();
    this.ui.showInteractionHint('Face the washroom exit and press E to enter the casino.');
    document.getElementById('fade-overlay')?.classList.add('hidden');
    setTimeout(() => {
      this.setDialogueMode(false);
    }, this.fadeDurationMs);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  transitionScene(targetLocation) {
    if (this.isTransitioning || targetLocation === this.currentLocation) return;

    const fadeOverlay = document.getElementById('fade-overlay');
    this.isTransitioning = true;
    this.player.setInputEnabled(false);
    fadeOverlay.classList.remove('hidden');

    setTimeout(() => {
      if (targetLocation === 'casino') {
        this.scene = this.casinoScene;
        this.environment = this.casinoEnvironment;
        this.currentLocation = 'casino';
        this.gameMgr.enterCasino();
        this.player.setPosition(0, 1.6, 0);
        this.player.yaw = Math.PI;
        this.player.setBounds(-28, 28, -28, 28);
        this.ui.showInteractionHint(
          this.escapeCountdownActive
            ? 'Get to the Aureon V12.'
            : 'Find chips, find games, and watch the clock.'
        );
      } else {
        this.scene = this.bathroomScene;
        this.environment = this.bathroomEnvironment;
        this.currentLocation = 'bathroom';
        this.gameMgr.exitToBathroom();
        const spawn = this.bathroomEnvironment.getReturnPosition();
        this.player.setPosition(spawn.x, spawn.y, spawn.z);
        this.player.yaw = this.bathroomEnvironment.getReturnYaw();
        this.player.setBounds(-4.2, 4.2, -4.4, 4.4);
        this.ui.showInteractionHint(
          this.escapeCountdownActive
            ? 'Rip the door open and run.'
            : 'Speak to the dealer or head back into the casino.'
        );
      }

      fadeOverlay.classList.add('hidden');
      setTimeout(() => {
        this.isTransitioning = false;
        this.player.setInputEnabled(true);
        this.maybeTriggerRoomDialogue(targetLocation);
      }, this.fadeDurationMs);
    }, this.fadeDurationMs + this.transitionHoldMs);
  }

  getGameFactory(gameType) {
    const factories = {
      dice: () => GameSystems.playDice(),
      blackjack: () => GameSystems.playBlackjack(),
      high_low: () => GameSystems.playHighLow(),
      number_grid: () => GameSystems.playNumberGrid(),
      slots: () => GameSystems.playSlots(),
      high_roller_slots: () => GameSystems.playHighRollerSlots(),
      precision_dice: () => GameSystems.playPrecisionDice(),
      roulette: () => GameSystems.playRoulette(),
      poker: () => GameSystems.playPoker(),
      vip_poker: () => GameSystems.playVipPoker(),
      back_room_table: () => GameSystems.playBackRoomTable(),
    };
    return factories[gameType];
  }

  createEscapePuzzleState() {
    const terminals = [
      { id: 'amber_terminal', label: 'AMBER' },
      { id: 'blue_terminal', label: 'BLUE' },
      { id: 'white_terminal', label: 'WHITE' },
    ];

    return {
      active: false,
      panelOpened: false,
      wiresSolved: false,
      engineStarted: false,
      ignitionHolding: false,
      ignitionHoldProgress: 0,
      wires: [
        { id: 'amber', label: 'AMBER', match: 'AMBER' },
        { id: 'blue', label: 'BLUE', match: 'BLUE' },
        { id: 'white', label: 'WHITE', match: 'WHITE' },
      ],
      terminals: terminals.sort(() => Math.random() - 0.5),
      connections: {},
    };
  }

  handleInteraction(raycaster, distance) {
    if (this.dialogueSystem.isPlaying() || this.isTransitioning) return;

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    for (const hit of intersects) {
      if (hit.distance >= distance || !hit.object.userData?.interactive) {
        continue;
      }

      const type = hit.object.userData.type;
      if (type === 'scene_door') {
        this.transitionScene(hit.object.userData.target);
        return;
      }

      if (type === 'occupied_game') {
        this.ui.showMessage(hit.object.userData.occupiedMessage || 'Occupied.');
        return;
      }

      if (type === 'dealer' && this.currentLocation === 'bathroom') {
        this.handleDealerInteraction();
        return;
      }

      if (type === 'delivery' && this.currentLocation === 'bathroom') {
        this.handleDelivery();
        return;
      }

      if (type === 'atm' && this.currentLocation === 'casino') {
        this.showAtmPanel(hit.object.userData.atmName || 'Casino ATM');
        return;
      }

      if (type === 'aureon_inspect' && this.currentLocation === 'casino') {
        this.handleAureonInspection();
        return;
      }

      if (type === 'escape_car' && this.currentLocation === 'casino') {
        this.beginEscapePuzzle();
        return;
      }

      if (type?.startsWith('game_') && this.currentLocation === 'casino') {
        this.requestGameLaunch(type.replace('game_', ''));
        return;
      }
    }
  }

  requestGameLaunch(gameType) {
    const tutorialDialogue = this.getTutorialDialogue(gameType);
    if (tutorialDialogue) {
      this.runDialogue(tutorialDialogue, () => this.playGame(gameType));
      return;
    }

    this.playGame(gameType);
  }

  playGame(gameType) {
    const gameFactory = this.getGameFactory(gameType);
    if (!gameFactory) {
      this.ui.showWarning('This table is offline.');
      return;
    }

    const gameData = gameFactory();
    gameData.gameType = gameType;

    if (!this.gameMgr.canAffordChips(gameData.minimumStake)) {
      this.ui.showWarning(`You need at least ${gameData.minimumStake.toLocaleString()} chips for this game.`);
      return;
    }

    this.gameMgr.playGame(gameType);
    this.currentGameData = gameData;
    this.ui.showGamePanel(gameData);
  }

  handleGameSelection(choice) {
    const gameData = this.currentGameData;
    if (!gameData) {
      return;
    }

    let result = gameData.play(choice);
    result.gameType = gameData.gameType;

    if (this.activeCheatSlot !== null) {
      const slotItem = this.hotbar[this.activeCheatSlot];
      if (slotItem) {
        const cheatDef = this.cheatSys.getCheat(slotItem.id);
        const cheated = this.cheatSys.applyCheat(slotItem.id, result);
        const cheatApplied = cheated !== result || cheated.payout !== result.payout || cheated.anomaly !== result.anomaly;
        if (cheatApplied) {
          result = {
            ...result,
            ...cheated,
            gameType: gameData.gameType,
          };
          this.gameMgr.recordCheatUse(cheatDef.name, cheatDef.risk);
          slotItem.usesLeft--;
          this.ui.showToast(`${cheatDef.name} used. Surveillance will notice if you get greedy.`, 'warning');
          if (slotItem.usesLeft <= 0) {
            this.hotbar[this.activeCheatSlot] = null;
            this.activeCheatSlot = null;
          }
        } else {
          this.ui.showWarning(`${cheatDef.name} does not help with ${gameData.name}.`);
          this.activeCheatSlot = null;
        }
        this.updateHotbarUI();
      }
    }

    this.gameMgr.addChips(result.payout);
    this.detection.recordGameResult(gameData.gameType, result.result, result.anomaly);

    const warningLevel = this.detection.checkTriggerWarning();
    if (warningLevel) {
      this.gameMgr.addWarning('Security suspects something.');
      this.maybeTriggerSuspicionDialogue();
    }

    this.ui.hidePanel();
    this.currentGameData = null;

    const resultText = `${result.result}: ${result.detail}\nChip swing: ${result.payout > 0 ? '+' : ''}${result.payout}`;
    this.ui.showMessage(resultText);
  }

  showDealerInventory() {
    this.ui.showDealerPanel(this.dealer.getInventory(), this.gameMgr.canUseDealer());
  }

  handleDealerInteraction() {
    const isFirstDealerInteraction = !this.dialogueFlags.dealer_intro_seen;
    this.runDialogue(
      this.createDealerDialogue(),
      () => {
        if (isFirstDealerInteraction) {
          this.dialogueFlags.dealer_intro_seen = true;
        }
      },
      {
        anchorResolver: () => this.projectWorldToScreen(this.bathroomEnvironment.getDealerDialogueAnchor()),
      }
    );
  }

  handleAureonInspection() {
    if (this.dialogueFlags.aureon_intro_seen || this.escapeCountdownActive) {
      return;
    }

    this.dialogueFlags.aureon_intro_seen = true;
    this.casinoEnvironment.setAureonInspectionEnabled(false);
    this.runDialogue(this.createAureonIntroDialogue());
  }

  beginEscapePuzzle() {
    if (!this.escapeCountdownActive || this.escapeSequenceActive || this.escapeFailed || this.escapePuzzleActive) {
      return;
    }

    this.escapePuzzleActive = true;
    this.escapePuzzleState.active = true;
    this.setDialogueMode(true);
    this.ui.showEscapePanel(this.escapePuzzleState, this.escapeTimeRemaining);
  }

  handleEscapePuzzleAction(action, arg1, arg2) {
    if (!this.escapePuzzleActive || !this.escapeCountdownActive || this.escapeSequenceActive) {
      return;
    }

    if (action === 'openPanel') {
      this.escapePuzzleState.panelOpened = true;
      this.audioMgr.play('warning', false, 0.35);
    }

    if (action === 'connectWire' && this.escapePuzzleState.panelOpened) {
      this.escapePuzzleState.connections[arg1] = arg2;
      this.escapePuzzleState.wiresSolved = this.escapePuzzleState.wires.every(
        (wire) => this.escapePuzzleState.connections[wire.id] === wire.match
      );
    }

    this.ui.showEscapePanel(this.escapePuzzleState, this.escapeTimeRemaining);
  }

  setIgnitionHolding(active) {
    if (!this.escapePuzzleActive || !this.escapePuzzleState.wiresSolved || this.escapePuzzleState.engineStarted) {
      return;
    }

    this.escapePuzzleState.ignitionHolding = active;
    if (!active) {
      this.escapePuzzleState.ignitionHoldProgress = Math.max(0, this.escapePuzzleState.ignitionHoldProgress - 0.08);
      this.ui.updateIgnitionHold(this.escapePuzzleState.ignitionHoldProgress);
    }
  }

  purchaseCheat(cheatId) {
    if (!this.gameMgr.canUseDealer()) {
      this.ui.showWarning("He's gone. Whatever you saved is all you get.");
      return;
    }

    const cheat = this.cheatSys.getCheat(cheatId);
    const inventoryItem = this.dealer.getInventory().find((item) => item.id === cheatId);
    if (!inventoryItem || !cheat) {
      this.ui.showWarning('Item not found.');
      return;
    }

    if (!this.gameMgr.canAffordCash(inventoryItem.cost)) {
      this.ui.showWarning('Not enough cash.');
      return;
    }

    const freeSlot = this.hotbar.findIndex((slot) => !slot);
    if (freeSlot === -1) {
      this.ui.showWarning('Your hotbar is full.');
      return;
    }

    const purchase = this.dealer.purchaseCheat(cheatId);
    if (!purchase.success) {
      this.ui.showWarning(purchase.reason);
      return;
    }

    this.gameMgr.addCash(-purchase.cost);
    this.hotbar[freeSlot] = { id: cheatId, usesLeft: cheat.uses };
    this.updateHotbarUI();
    this.ui.showWarning(`Equipped: ${cheat.name}`);
    this.showDealerInventory();
  }

  queueCheat(slot) {
    const slotItem = this.hotbar[slot];
    if (!slotItem) {
      this.ui.showWarning('Nothing equipped in that slot.');
      return;
    }
    this.activeCheatSlot = slot;
    const cheat = this.cheatSys.getCheat(slotItem.id);
    this.ui.showToast(`${cheat.name} primed for the next suitable game.`, 'info');
    this.updateHotbarUI();
  }

  cycleCheatSelection(direction) {
    const occupiedSlots = this.hotbar
      .map((slot, index) => (slot ? index : null))
      .filter((index) => index !== null);

    if (!occupiedSlots.length) {
      this.ui.showWarning('Nothing is equipped.');
      return;
    }

    const currentPosition = occupiedSlots.indexOf(this.activeCheatSlot);
    const startIndex = currentPosition === -1
      ? (direction > 0 ? -1 : 0)
      : currentPosition;
    const nextPosition = (startIndex + direction + occupiedSlots.length) % occupiedSlots.length;
    this.queueCheat(occupiedSlots[nextPosition]);
  }

  updateHotbarUI() {
    for (let i = 0; i < 5; i++) {
      const slot = document.querySelector(`.hotbar-slot[data-slot="${i + 1}"]`);
      const slotItem = this.hotbar[i];
      if (slotItem) {
        const cheat = this.cheatSys.getCheat(slotItem.id);
        slot.textContent = `${cheat.name.substring(0, 1)}${slotItem.usesLeft}`;
        slot.classList.add('active');
        slot.classList.toggle('low', slotItem.usesLeft === 1);
        slot.style.outline = this.activeCheatSlot === i ? '2px solid rgba(255,177,86,.7)' : '';
      } else {
        slot.textContent = (i + 1).toString();
        slot.classList.remove('active');
        slot.classList.remove('low');
        slot.style.outline = '';
      }
    }
  }

  showAtmPanel(atmName) {
    this.ui.showAtmPanel(atmName, this.gameMgr.state.cash, this.gameMgr.state.chips);
  }

  handleAtmConversion(direction, amount) {
    const resolvedAmount =
      amount === 'all'
        ? direction === 'cashToChips'
          ? this.gameMgr.state.cash
          : this.gameMgr.state.chips
        : Number(amount);

    let result = null;
    if (direction === 'cashToChips') {
      result = this.gameMgr.convertCashToChips(resolvedAmount);
      if (result.success) {
        this.ui.showToast(`Converted $${resolvedAmount.toLocaleString()} to chips.`, 'info');
      }
    } else {
      result = this.gameMgr.convertChipsToCash(resolvedAmount);
      if (result.success) {
        this.ui.showToast(`Cashed out ${resolvedAmount.toLocaleString()} chips.`, 'info');
      }
    }

    if (!result?.success) {
      this.ui.showWarning(result?.reason || 'Conversion failed.');
    }

    this.showAtmPanel('Casino ATM');
  }

  handleHotkey(index) {
    if (this.currentGameData?.handleHotkey) {
      this.currentGameData.handleHotkey(index);
      return;
    }

    if (this.currentGameData) {
      this.ui.showToast(`Hotkey ${index} is reserved for table actions.`, 'info');
    }
  }

  handleDelivery() {
    if (this.escapeCountdownActive) {
      this.ui.showWarning('Escape first. There is nothing left to deliver.');
      return;
    }

    const outcome = this.gameMgr.deliverQuota();
    if (!outcome.success) {
      this.gameMgr.die(outcome.reason);
      return;
    }

    if (outcome.finalDelivery) {
      this.handleFinalDelivery(outcome.delivered);
      return;
    }

    this.bathroomEnvironment.setDealerAvailable(this.gameMgr.canUseDealer());
    this.ui.showToast(
      `Delivered $${outcome.delivered.toLocaleString()}. ${outcome.nextStage.bossLine}`,
      'warning'
    );
  }

  handleFinalDelivery(amount) {
    this.ui.showToast(`Delivered $${amount.toLocaleString()}. Stand by.`, 'info');
    this.pendingFinalChoice = null;
    this.runDialogue(this.createImpossibleQuotaDialogue(), () => this.resolveImpossibleQuotaChoice());
  }

  resolveImpossibleQuotaChoice() {
    if (this.pendingFinalChoice === 'escape') {
      this.startFinalEscape();
      return;
    }

    if (this.pendingFinalChoice === 'continue') {
      this.dialogueFlags.impossible_quota_revealed = true;
      this.gameMgr.setQuota(5000000);
      this.ui.showToast('New quota posted: $5,000,000.', 'warning');
      this.ui.showInteractionHint('The number climbed again. The Aureon V12 still waits in the center of the floor.');
    }
  }

  startFinalEscape() {
    if (this.escapeCountdownActive || this.escapeCompleted) {
      return;
    }

    this.escapeCountdownActive = true;
    this.escapeTimeRemaining = 20;
    this.escapeFailed = false;
    this.escapePuzzleActive = false;
    this.escapePuzzleState = this.createEscapePuzzleState();
    this.currentGameData = null;
    this.ui.hidePanel();
    this.audioMgr.stop('ambient');
    this.audioMgr.play('urgent', true, 1);
    this.gameMgr.setHudOverrides({
      quotaText: 'OBJECTIVE: ESCAPE',
      clockText: 'DETONATION: 00:20',
    });
    this.casinoEnvironment.setAureonInspectionEnabled(false);
    this.casinoEnvironment.setAureonEscapeEnabled(true);
    this.ui.showWarning('Detonation armed. Reach the Aureon V12.');
    this.ui.showInteractionHint(
      this.currentLocation === 'casino'
        ? 'Get to the Aureon V12.'
        : 'Rip the door open and run.'
    );
  }

  updateEscapeCountdown(delta) {
    if (!this.escapeCountdownActive || this.escapeSequenceActive || this.escapeFailed || this.escapeCompleted) {
      return;
    }

    this.escapeTimeRemaining = Math.max(0, this.escapeTimeRemaining - delta);
    const wholeSeconds = Math.ceil(this.escapeTimeRemaining);
    const seconds = wholeSeconds.toString().padStart(2, '0');
    this.gameMgr.setHudOverrides({
      quotaText: 'OBJECTIVE: ESCAPE',
      clockText: `DETONATION: 00:${seconds}`,
    });

    if (this.escapePuzzleActive) {
      this.updateEscapePuzzle(delta);
      this.ui.updateEscapePanelCountdown(this.escapeTimeRemaining, this.escapePuzzleState.engineStarted);
    }

    const pulseSecond = Math.floor(this.escapeTimeRemaining);
    if (pulseSecond !== this.escapeUrgentPulse && pulseSecond <= 10) {
      this.escapeUrgentPulse = pulseSecond;
      this.audioMgr.play('warning', false, 0.95);
    }

    if (this.escapeTimeRemaining <= 0) {
      this.failEscape();
    }
  }

  updateEscapePuzzle(delta) {
    if (!this.escapePuzzleActive || !this.escapePuzzleState.wiresSolved || this.escapePuzzleState.engineStarted) {
      return;
    }

    if (this.escapePuzzleState.ignitionHolding) {
      this.escapePuzzleState.ignitionHoldProgress = Math.min(1, this.escapePuzzleState.ignitionHoldProgress + delta / 2);
      this.ui.updateIgnitionHold(this.escapePuzzleState.ignitionHoldProgress);
      if (this.escapePuzzleState.ignitionHoldProgress >= 1) {
        this.escapePuzzleState.engineStarted = true;
        this.finishEscapePuzzle();
      }
      return;
    }

    if (this.escapePuzzleState.ignitionHoldProgress > 0) {
      this.escapePuzzleState.ignitionHoldProgress = Math.max(0, this.escapePuzzleState.ignitionHoldProgress - delta * 0.4);
      this.ui.updateIgnitionHold(this.escapePuzzleState.ignitionHoldProgress);
    }
  }

  finishEscapePuzzle() {
    this.escapePuzzleActive = false;
    this.escapePuzzleState.active = false;
    this.ui.hidePanel();
    this.audioMgr.play('levelup', false, 0.8);
    this.ui.showToast('Engine starts.', 'info');
    this.beginEscapeSequence();
  }

  failEscape() {
    if (this.escapeFailed || this.escapeCompleted) {
      return;
    }

    this.escapeFailed = true;
    this.escapeCountdownActive = false;
    this.escapePuzzleActive = false;
    this.ui.hidePanel();
    this.audioMgr.stop('urgent');
    this.gameMgr.clearHudOverrides();
    this.gameMgr.die('The detonation charge went live before you cleared the floor.');
  }

  beginEscapeSequence() {
    this.escapeSequenceActive = true;
    this.escapeCountdownActive = false;
    this.gameMgr.state.inGame = false;
    this.gameMgr.setHudOverrides({
      quotaText: 'OBJECTIVE: ESCAPE',
      clockText: 'ENGINE: LIVE',
    });
    this.setDialogueMode(true);
    this.player.setPosition(
      this.casinoEnvironment.getAureonDisplayPosition().x,
      1.6,
      this.casinoEnvironment.getAureonDisplayPosition().z + 0.5
    );
    this.player.yaw = Math.PI;
    this.escapeSequenceElapsed = 0;
  }

  updateEscapeSequence(delta) {
    if (!this.escapeSequenceActive) {
      return;
    }

    this.escapeSequenceElapsed += delta;
    const duration = 4.8;
    const progress = Math.min(1, this.escapeSequenceElapsed / duration);
    const start = this.casinoEnvironment.getAureonDisplayPosition();
    const end = this.casinoEnvironment.getAureonExitTarget();
    const lift = Math.sin(progress * Math.PI) * 0.35;

    this.camera.position.lerpVectors(
      new THREE.Vector3(start.x, 1.8, start.z + 1.1),
      new THREE.Vector3(end.x, 2.0, end.z),
      progress
    );
    this.camera.position.y += lift;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = -0.05 + progress * 0.08;
    this.camera.rotation.y = Math.PI + (1 - progress) * 0.1;
    this.camera.rotation.z = (Math.random() - 0.5) * 0.01;

    if (progress > 0.55) {
      document.getElementById('fade-overlay')?.classList.remove('hidden');
    }

    if (progress >= 1) {
      this.completeEscapeEnding();
    }
  }

  completeEscapeEnding() {
    if (this.escapeCompleted) {
      return;
    }

    this.escapeCompleted = true;
    this.escapeSequenceActive = false;
    this.audioMgr.stop('urgent');
    this.gameMgr.clearHudOverrides();
    document.getElementById('hud')?.classList.add('hidden');
    this.ui.showEnding(
      'You did not beat the debt. You refused the cycle, tore the earpiece free, and turned their showroom trophy into a way out.',
      this.gameMgr.state.totalCashBanked,
      this.gameMgr.getCurrentStage().label
    );
  }

  setDialogueMode(active) {
    this.player.setInputEnabled(!active);
    if (active) {
      this.ui.showInteractionHint('');
    }
  }

  runDialogue(definition, onComplete = null, options = {}) {
    this.setDialogueMode(true);
    this.dialogueSystem.startDialogue(definition, {
      anchorResolver: options.anchorResolver || null,
      onComplete: () => {
        this.setDialogueMode(false);
        onComplete?.();
      },
    });
  }

  maybeTriggerRoomDialogue(targetLocation) {
    if (
      targetLocation === 'bathroom' &&
      !this.dialogueFlags.final_quota_dialogue_seen &&
      !this.gameMgr.canUseDealer() &&
      this.gameMgr.state.stageIndex === this.gameMgr.stages.length - 1
    ) {
      this.dialogueFlags.final_quota_dialogue_seen = true;
      this.runDialogue(this.createFinalQuotaDialogue());
    }
  }

  maybeTriggerSuspicionDialogue() {
    if (
      this.dialogueFlags.suspicion_warning_seen ||
      this.dialogueSystem.isPlaying() ||
      !this.gameMgr.state.inGame
    ) {
      return;
    }

    this.dialogueFlags.suspicion_warning_seen = true;
    this.runDialogue(this.createSuspicionDialogue());
  }

  getTutorialDialogue(gameType) {
    const tutorials = {
      slots: {
        flag: 'slots_tutorial_seen',
        definition: this.createTutorialDialogue(
          'Slots. Good choice.',
          [
            {
              text: "I know what I'm doing.",
              responseText: "Then don't waste time.",
            },
            {
              text: 'How do I play?',
              responseText: 'Match symbols. More matches, bigger payouts.',
            },
          ]
        ),
      },
      blackjack: {
        flag: 'blackjack_tutorial_seen',
        definition: this.createTutorialDialogue(
          'Blackjack.',
          [
            {
              text: 'I know the rules.',
              responseText: 'Then use your head.',
            },
            {
              text: 'Explain it.',
              responseText: 'Get as close to twenty-one as possible without going over.',
            },
          ]
        ),
      },
      dice: {
        flag: 'dice_tutorial_seen',
        definition: this.createTutorialDialogue(
          'Dice.',
          [
            {
              text: "Let's do this.",
              responseText: 'Try not to get greedy.',
            },
            {
              text: 'How does this work?',
              responseText: 'Higher totals pay better.',
            },
          ]
        ),
      },
    };

    const tutorial = tutorials[gameType];
    if (!tutorial || this.dialogueFlags[tutorial.flag]) {
      return null;
    }

    this.dialogueFlags[tutorial.flag] = true;
    return tutorial.definition;
  }

  createTutorialDialogue(text, choices) {
    return {
      startId: 'tutorial_intro',
      nodes: {
        tutorial_intro: {
          id: 'tutorial_intro',
          speaker: 'Earpiece',
          text,
          choices,
        },
      },
    };
  }

  createIntroDialogue() {
    return {
      startId: 'intro_open',
      nodes: {
        intro_open: {
          id: 'intro_open',
          speaker: 'Earpiece',
          text: 'Good morning.',
          nextId: 'intro_context',
        },
        intro_context: {
          id: 'intro_context',
          speaker: 'Earpiece',
          text: "You're in the casino washroom. You have seed cash, a quota, and one hour before this turns into a body count. If you ever rip out that earpiece, you get twenty seconds before it detonates.",
          nextId: 'intro_choice',
        },
        intro_choice: {
          id: 'intro_choice',
          speaker: 'Earpiece',
          text: 'You can ask one question if it helps you breathe.',
          nextId: 'intro_objective',
          choices: [
            {
              text: 'Who are you?',
              responseText: 'Someone keeping you alive.',
            },
            {
              text: 'What exactly do I do?',
              responseText: [
                'Leave the washroom and find an ATM.',
                'Convert cash into chips, play the floor, then cash those chips back out before you return.',
              ],
            },
          ],
        },
        intro_objective: {
          id: 'intro_objective',
          speaker: 'Earpiece',
          text: 'The loop is simple: cash to chips, chips to winnings, winnings back to cash.',
          nextId: 'intro_delivery',
        },
        intro_delivery: {
          id: 'intro_delivery',
          speaker: 'Earpiece',
          text: 'Bring enough cash back here to cover your quota before the hour runs out. The dealer in this room handles the handoff.',
          nextId: 'intro_step_outside',
        },
        intro_step_outside: {
          id: 'intro_step_outside',
          speaker: 'Earpiece',
          text: 'Face the washroom exit, press E, and start with the ATM.',
        },
      },
    };
  }

  createDealerIntroDialogue() {
    return this.createDealerDialogue();
  }

  createAureonIntroDialogue() {
    return {
      startId: 'aureon_intro_1',
      nodes: {
        aureon_intro_1: {
          id: 'aureon_intro_1',
          speaker: 'Earpiece',
          text: 'Ah. The Aureon V12.',
          nextId: 'aureon_intro_2',
        },
        aureon_intro_2: {
          id: 'aureon_intro_2',
          speaker: 'Earpiece',
          text: 'The new fastest car in the world.',
          nextId: 'aureon_intro_3',
        },
        aureon_intro_3: {
          id: 'aureon_intro_3',
          speaker: 'Earpiece',
          text: 'Rumor says it reaches two hundred in seconds.',
          nextId: 'aureon_intro_4',
        },
        aureon_intro_4: {
          id: 'aureon_intro_4',
          speaker: 'Earpiece',
          text: 'Worth millions.',
          nextId: 'aureon_intro_5',
        },
        aureon_intro_5: {
          id: 'aureon_intro_5',
          speaker: 'Earpiece',
          text: 'Remember where it is.',
        },
      },
    };
  }

  createDealerDialogue() {
    return {
      startId: 'dealer_menu',
      nodes: {
        dealer_menu: {
          id: 'dealer_menu',
          speaker: 'Dealer',
          text: 'What do you need...',
          maxChoices: !this.dialogueFlags.dealer_intro_seen ? 3 : 2,
          choices: this.getDealerChoices(),
        },
        dealer_identity: {
          id: 'dealer_identity',
          speaker: 'Dealer',
          text: 'Someone who can keep you moving, if your cash is good.',
          nextId: 'dealer_menu_followup',
        },
        dealer_menu_followup: {
          id: 'dealer_menu_followup',
          speaker: 'Dealer',
          text: 'Make it quick.',
          maxChoices: 2,
          choices: [
            {
              text: 'Deposit Cash',
              callback: () => this.handleDelivery(),
            },
            {
              text: 'Purchase Items',
              callback: () => this.showDealerInventory(),
            },
          ],
        },
      },
    };
  }

  getDealerChoices() {
    const choices = [
      {
        text: 'Deposit Cash',
        callback: () => this.handleDelivery(),
      },
      {
        text: 'Purchase Items',
        callback: () => this.showDealerInventory(),
      },
    ];

    if (!this.dialogueFlags.dealer_intro_seen) {
      choices.push({
        text: 'Who are you?',
        nextId: 'dealer_identity',
      });
    }

    return choices;
  }

  projectWorldToScreen(worldPosition) {
    if (!worldPosition) {
      return null;
    }

    const projected = worldPosition.clone().project(this.camera);
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight - 24;
    return { x, y };
  }

  createFinalQuotaDialogue() {
    return {
      startId: 'final_quota',
      nodes: {
        final_quota: {
          id: 'final_quota',
          speaker: 'Earpiece',
          text: "He's gone.",
          nextId: 'final_finish',
          choices: [
            {
              text: 'What happened?',
              responseText: 'Security caught him.',
            },
            {
              text: "So I'm alone.",
              responseText: 'Yes.',
            },
          ],
        },
        final_finish: {
          id: 'final_finish',
          speaker: 'Earpiece',
          text: 'Finish this.',
        },
      },
    };
  }

  createImpossibleQuotaDialogue() {
    return {
      startId: 'cycle_reveal_1',
      nodes: {
        cycle_reveal_1: {
          id: 'cycle_reveal_1',
          speaker: 'Earpiece',
          text: 'Quota cleared.',
          nextId: 'cycle_reveal_2',
        },
        cycle_reveal_2: {
          id: 'cycle_reveal_2',
          speaker: 'Earpiece',
          text: 'New quota posted: five million.',
          nextId: 'cycle_reveal_3',
        },
        cycle_reveal_3: {
          id: 'cycle_reveal_3',
          speaker: 'Earpiece',
          text: 'Now you understand. There is no finish line here.',
          choices: [
            {
              text: 'Keep playing.',
              responseText: 'Good. Then get back on the floor.',
              callback: () => {
                this.pendingFinalChoice = 'continue';
              },
            },
            {
              text: 'Take it out.',
              responseText: 'Then move. Twenty seconds.',
              callback: () => {
                this.pendingFinalChoice = 'escape';
              },
            },
          ],
        },
      },
    };
  }

  createSuspicionDialogue() {
    return {
      startId: 'warning_intro',
      nodes: {
        warning_intro: {
          id: 'warning_intro',
          speaker: 'Earpiece',
          text: 'That looked suspicious.',
          choices: [
            {
              text: 'I know.',
              responseText: 'Then be more careful.',
            },
            {
              text: 'I had no choice.',
              responseText: 'Make better choices.',
            },
          ],
        },
      },
    };
  }

  animate() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.environment?.update?.(delta);

    if (this.gameMgr.state.inGame) {
      this.gameMgr.update(delta);
      this.bathroomEnvironment.setDealerAvailable(this.gameMgr.canUseDealer());
      this.player.update(delta, this.scene, this.environment);

      if (this.currentLocation === 'casino') {
        this.npcSystem.update(delta);
        const triggerTarget = this.casinoEnvironment.checkPlayerTriggers?.(this.player.position);
        if (triggerTarget) {
          this.transitionScene(triggerTarget);
        }

        const msg = this.gameMgr.canUseDealer() ? this.dealer.getRandomMessage() : null;
        if (msg) {
          this.ui.showToast(msg, 'warning');
        }
      }
    }

    this.updateEscapeCountdown(delta);
    this.updateEscapeSequence(delta);

    this.dialogueSystem.updateAnchorPosition();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  gameInstance = new Game();
});
