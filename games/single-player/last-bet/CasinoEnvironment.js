// CasinoEnvironment.js - 3D casino scene and bathrooms
class CasinoEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.gameStations = [];
    this.interactables = [];
    this.rgbLights = [];
    this.sceneTriggers = [];
    this.modelBounds = null;
    this.layoutRoot = new THREE.Group();
    this.casinoModel = null;
    this.elapsed = 0;
    this.layoutBuilt = false;
    this.aureonDisplayPosition = new THREE.Vector3(0, 0, 0);
    this.aureonExitTarget = new THREE.Vector3(0, 1.6, -24);
    this.aureonInspectTrigger = null;
    this.aureonEscapeTrigger = null;
    this.aureonMount = null;
    this.bathroomDoorPosition = new THREE.Vector3(0, 0, 0);
    this.scene.add(this.layoutRoot);
    this.build();
  }

  build() {
    this.scene.background = new THREE.Color(0x070b16);
    this.scene.fog = new THREE.Fog(0x070b16, 18, 90);

    // Brighter, lively casino lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.18);
    this.scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x99bbee, 1.1);
    this.scene.add(hemiLight);

    const fillLight = new THREE.PointLight(0xffffff, 2.2, 200);
    fillLight.position.set(0, 22, 0);
    this.scene.add(fillLight);

    this.buildRgbLighting();
    this.loadCasinoModel();
  }

  loadCasinoModel() {
    if (!THREE.GLTFLoader) {
      this.buildLegacyFallback();
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load('ModelV1.glb', (gltf) => {
      this.casinoModel = gltf.scene;
      this.prepareLoadedModel(this.casinoModel);
      this.layoutRoot.add(this.casinoModel);

      const bounds = new THREE.Box3().setFromObject(this.casinoModel);
      this.modelBounds = bounds.clone();
      this.buildCasinoLayout(bounds);
    }, undefined, () => {
      this.buildLegacyFallback();
    });
  }

  prepareLoadedModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          if (child.material.color) {
            child.material.color.set(0xd8d8d8);
          }
        }
      }
    });

    const sourceBounds = new THREE.Box3().setFromObject(model);
    const sourceSize = sourceBounds.getSize(new THREE.Vector3());
    const targetWidth = 56;
    const targetDepth = 56;
    const scale = Math.min(targetWidth / sourceSize.x, targetDepth / sourceSize.z);
    model.scale.setScalar(scale);

    const scaledBounds = new THREE.Box3().setFromObject(model);
    const center = scaledBounds.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -scaledBounds.min.y, -center.z);
  }

  buildLegacyFallback() {
    // Keep a simple fallback if GLB loading fails.
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2837, metalness: 0.08, roughness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.layoutRoot.add(floor);
    this.buildTrafficBackdrop();
    this.buildBathroomDoor(new THREE.Box3(new THREE.Vector3(-30, 0, -30), new THREE.Vector3(30, 8, 30)));
  }

  buildCasinoLayout(bounds) {
    if (this.layoutBuilt || !bounds) return;
    this.layoutBuilt = true;

    const size = bounds.getSize(new THREE.Vector3());
    const min = bounds.min.clone();
    const max = bounds.max.clone();
    const lowerY = min.y + Math.max(0.7, size.y * 0.06);
    const upperY = min.y + Math.max(5.6, size.y * 0.52);
    const leftX = min.x + size.x * 0.12;
    const centerX = min.x + size.x * 0.5;
    const rightX = min.x + size.x * 0.82;
    const frontZ = min.z + size.z * 0.18;
    const midZ = min.z + size.z * 0.45;
    const backZ = min.z + size.z * 0.72;

    this.buildTrafficBackdrop(bounds);
    this.buildBathroomDoor(bounds);
    this.buildAtmCluster(lowerY, min, size);
    this.buildAureonDisplay({
      x: centerX + 0.8,
      y: lowerY,
      z: midZ - 1.2,
    });

    this.buildMachineRow({
      gameType: 'slots',
      label: 'SLOTS',
      x: leftX,
      y: lowerY,
      z: frontZ,
      count: 12,
      playableIndex: 7,
      axis: 'x',
      spacing: 1.7,
      occupiedMessage: "Buzz off. Can't you see I'm playing?",
    });

    this.buildMachineRow({
      gameType: 'high_low',
      label: 'HIGH / LOW',
      x: leftX,
      y: lowerY,
      z: midZ,
      count: 11,
      playableIndex: 3,
      axis: 'x',
      spacing: 1.85,
      occupiedMessage: 'Hey, wait your turn.',
    });

    this.buildMachineRow({
      gameType: 'number_grid',
      label: 'GRID',
      x: leftX + 1.5,
      y: lowerY,
      z: backZ,
      count: 8,
      playableIndex: 6,
      axis: 'x',
      spacing: 1.95,
      occupiedMessage: 'Occupied. Move along.',
    });

    this.buildTableCluster({
      gameType: 'roulette',
      label: 'ROULETTE',
      x: centerX - 2,
      y: lowerY,
      z: frontZ + 1.6,
      count: 5,
      playableIndex: 2,
      occupiedMessage: 'No room at this table.',
    });

    this.buildTableCluster({
      gameType: 'dice',
      label: 'DICE',
      x: centerX + 3.5,
      y: lowerY,
      z: midZ,
      count: 5,
      playableIndex: 1,
      occupiedMessage: 'Hold up, I’m on a streak.',
    });

    this.buildMachineRow({
      gameType: 'precision_dice',
      label: 'PRECISION',
      x: rightX - 1.5,
      y: lowerY,
      z: frontZ + 0.8,
      count: 9,
      playableIndex: 4,
      axis: 'x',
      spacing: 1.65,
      occupiedMessage: 'This seat’s taken.',
    });

    this.buildMachineRow({
      gameType: 'high_roller_slots',
      label: 'HIGH ROLLER',
      x: rightX - 1.5,
      y: lowerY,
      z: midZ + 1.0,
      count: 10,
      playableIndex: 8,
      axis: 'x',
      spacing: 1.7,
      occupiedMessage: 'Security says wait your turn.',
    });

    this.buildUpperTableCluster({
      gameType: 'blackjack',
      label: 'BLACKJACK',
      x: leftX + 3,
      y: upperY,
      z: backZ - 1.0,
      count: 3,
      playableIndex: 1,
      occupiedMessage: 'You can see I’m in the middle of a hand.',
    });

    this.buildUpperTableCluster({
      gameType: 'poker',
      label: 'POKER',
      x: centerX + 1.0,
      y: upperY,
      z: backZ - 0.2,
      count: 3,
      playableIndex: 0,
      occupiedMessage: 'Not now.',
    });

    this.buildUpperTableCluster({
      gameType: 'vip_poker',
      label: 'VIP POKER',
      x: rightX - 0.5,
      y: upperY,
      z: backZ,
      count: 2,
      playableIndex: 0,
      occupiedMessage: 'VIPs only. Beat it.',
    });

    this.buildUpperTableCluster({
      gameType: 'back_room_table',
      label: 'BACK ROOM',
      x: rightX + 3.5,
      y: upperY,
      z: backZ + 2.5,
      count: 1,
      playableIndex: 0,
      occupiedMessage: 'You’re not supposed to be here.',
    });

    this.sceneTriggers.push({
      min: new THREE.Vector3(min.x + size.x * 0.34, lowerY - 1.0, min.z + size.z * 0.08),
      max: new THREE.Vector3(min.x + size.x * 0.46, lowerY + 2.2, min.z + size.z * 0.18),
      target: 'bathroom',
    });
  }

  buildMachineRow(config) {
    const count = config.count || 8;
    const spacing = config.spacing || 1.6;
    const startOffset = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const isPlayable = i === config.playableIndex;
      const x = config.axis === 'x' ? config.x + startOffset + i * spacing : config.x;
      const z = config.axis === 'z' ? config.z + startOffset + i * spacing : config.z;
      if (config.gameType === 'slots') {
        // Use GLB models for slot machines
        this.createSlotMachineGLB({
          x,
          y: config.y,
          z,
          playable: isPlayable,
          occupiedMessage: config.occupiedMessage,
        });
      } else {
        this.createArcadeStation({
          gameType: config.gameType,
          label: config.label,
          x,
          y: config.y,
          z,
          depth: 1.15,
          width: 0.92,
          height: 2.15,
          playable: isPlayable,
          hidden: false,
          occupiedMessage: config.occupiedMessage,
        });
      }
    }
  }

  createSlotMachineGLB({ x, y, z, playable, occupiedMessage }) {
    const loader = new THREE.GLTFLoader();
    let modelPath;
    if (playable) {
      modelPath = 'Casino/user_plays.glb';
    } else {
      // Randomly pick male or female occupied slot
      modelPath = Math.random() < 0.5 ? 'Casino/occupied_slots_m.glb' : 'Casino/occupied_slots_f.glb';
    }
    loader.load(modelPath, (gltf) => {
      const slotMesh = gltf.scene;
      slotMesh.position.set(x, y, z);
      slotMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      // Add invisible trigger for interaction
      const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 2.2, 1.2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      trigger.position.set(0, 1.1, 0);
      trigger.userData.interactive = true;
      trigger.userData.hint = playable ? 'Press E to play SLOTS' : occupiedMessage;
      trigger.userData.type = playable ? 'game_slots' : 'occupied_game';
      trigger.userData.occupiedMessage = occupiedMessage;
      trigger.visible = false;
      slotMesh.add(trigger);
      this.interactables.push(trigger);
      this.layoutRoot.add(slotMesh);
    });
  }

  buildTableCluster(config) {
    const count = config.count || 3;
    const spacing = 2.2;
    const startOffset = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const isPlayable = i === config.playableIndex;
      this.createTableStation({
        gameType: config.gameType,
        label: config.label,
        x: config.x + startOffset + i * spacing,
        y: config.y,
        z: config.z,
        playable: isPlayable,
        occupiedMessage: config.occupiedMessage,
      });
    }
  }

  buildUpperTableCluster(config) {
    const count = config.count || 2;
    const spacing = 2.6;
    const startOffset = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      this.createTableStation({
        gameType: config.gameType,
        label: config.label,
        x: config.x + startOffset + i * spacing,
        y: config.y,
        z: config.z,
        playable: i === config.playableIndex,
        hidden: config.hidden && i !== config.playableIndex,
        occupiedMessage: config.occupiedMessage,
      });
    }
  }

  createArcadeStation({ gameType, label, x, y, z, depth, width, height, playable, hidden, occupiedMessage }) {
    const station = new THREE.Group();
    station.position.set(x, y, z);

    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({
        color: playable ? 0x2b3344 : 0x3d475d,
        roughness: 0.7,
        metalness: 0.18,
        emissive: playable ? 0x0c2230 : 0x080c14,
        emissiveIntensity: playable ? 0.22 : 0.08,
      })
    );
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    station.add(cabinet);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.75, height * 0.45),
      new THREE.MeshBasicMaterial({
        color: playable ? 0x4df7ff : 0x1a2433,
      })
    );
    screen.position.set(0, 0.15, depth / 2 + 0.01);
    station.add(screen);

    const topSign = this.buildSign(0, height / 2 + 0.55, 0, label);
    topSign.rotation.y = Math.PI;
    station.add(topSign);

    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(width * 1.3, height * 1.05, depth * 1.45),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    trigger.userData.interactive = true;
    trigger.userData.hint = playable ? `Press E to play ${label}` : occupiedMessage;
    trigger.userData.type = playable ? `game_${gameType}` : 'occupied_game';
    trigger.userData.occupiedMessage = occupiedMessage;
    trigger.visible = false;
    station.add(trigger);
    this.interactables.push(trigger);

    if (!playable) {
      station.add(this.createOccupiedCard(occupiedMessage));
    }

    if (hidden) {
      station.visible = false;
    }

    this.layoutRoot.add(station);
  }

  createTableStation({ gameType, label, x, y, z, playable, hidden, occupiedMessage }) {
    const station = new THREE.Group();
    station.position.set(x, y, z);

    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.6, 0.55, 24),
      new THREE.MeshStandardMaterial({
        color: playable ? 0x1f6f4f : 0x2d3547,
        roughness: 0.75,
        metalness: 0.12,
        emissive: playable ? 0x0c2018 : 0x05080d,
        emissiveIntensity: playable ? 0.18 : 0.05,
      })
    );
    table.castShadow = true;
    table.receiveShadow = true;
    station.add(table);

    const felt = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.18, 0.08, 24),
      new THREE.MeshStandardMaterial({
        color: playable ? 0x0d6a73 : 0x111827,
        roughness: 0.9,
        metalness: 0.04,
      })
    );
    felt.position.y = 0.34;
    station.add(felt);

    const sign = this.buildSign(0, 1.85, 0, label);
    station.add(sign);

    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.3, 3.6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    trigger.position.y = 1.1;
    trigger.userData.interactive = true;
    trigger.userData.hint = playable ? `Press E to play ${label}` : occupiedMessage;
    trigger.userData.type = playable ? `game_${gameType}` : 'occupied_game';
    trigger.userData.occupiedMessage = occupiedMessage;
    trigger.visible = false;
    station.add(trigger);
    this.interactables.push(trigger);

    if (!playable) {
      station.add(this.createOccupiedCard(occupiedMessage, 0, 0.95, 1.6));
    }

    if (hidden) {
      station.visible = false;
    }

    this.layoutRoot.add(station);
  }

  createOccupiedCard(message, x = 0, y = 1.15, z = 0) {
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.8),
      new THREE.MeshBasicMaterial({ color: 0x10151f, transparent: true, opacity: 0.9 })
    );
    card.position.set(x, y, z);
    card.rotation.y = Math.PI;
    card.userData.message = message;
    return card;
  }

  buildAureonDisplay({ x, y, z }) {
    const display = new THREE.Group();
    display.position.set(x, y, z);
    this.aureonDisplayPosition.set(x, y + 1.2, z);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.2, 0.5, 28),
      new THREE.MeshStandardMaterial({
        color: 0x202838,
        roughness: 0.72,
        metalness: 0.22,
        emissive: 0x08121d,
        emissiveIntensity: 0.18,
      })
    );
    platform.receiveShadow = true;
    display.add(platform);

    const accentRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.08, 12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x6de9ff,
        roughness: 0.3,
        metalness: 0.85,
        emissive: 0x164d68,
        emissiveIntensity: 0.42,
      })
    );
    accentRing.rotation.x = Math.PI / 2;
    accentRing.position.y = 0.28;
    display.add(accentRing);

    const plaque = this.buildSign(0, 1.55, 2.3, 'AUREON V12');
    plaque.rotation.y = Math.PI;
    display.add(plaque);

    this.aureonMount = new THREE.Group();
    this.aureonMount.position.set(0, 0.35, 0);
    display.add(this.aureonMount);

    const silhouette = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.65, 1.85),
      new THREE.MeshStandardMaterial({
        color: 0x182233,
        roughness: 0.68,
        metalness: 0.28,
        transparent: true,
        opacity: 0.55,
      })
    );
    silhouette.position.set(0, 0.85, 0);
    silhouette.castShadow = true;
    display.add(silhouette);

    this.aureonInspectTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.2, 3.2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.aureonInspectTrigger.position.set(0, 1.0, 0);
    this.aureonInspectTrigger.visible = false;
    this.aureonInspectTrigger.userData.interactive = true;
    this.aureonInspectTrigger.userData.type = 'aureon_inspect';
    this.aureonInspectTrigger.userData.hint = 'Press E to inspect Aureon V12';
    display.add(this.aureonInspectTrigger);
    this.interactables.push(this.aureonInspectTrigger);

    this.aureonEscapeTrigger = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 2.5, 3.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.aureonEscapeTrigger.position.set(0, 1.0, 0);
    this.aureonEscapeTrigger.visible = false;
    this.aureonEscapeTrigger.userData.interactive = false;
    this.aureonEscapeTrigger.userData.type = 'escape_car';
    this.aureonEscapeTrigger.userData.hint = 'Press E to hijack the Aureon V12';
    display.add(this.aureonEscapeTrigger);
    this.interactables.push(this.aureonEscapeTrigger);

    this.layoutRoot.add(display);
  }

  checkPlayerTriggers(position) {
    for (const trigger of this.sceneTriggers) {
      if (
        position.x >= trigger.min.x && position.x <= trigger.max.x &&
        position.y >= trigger.min.y && position.y <= trigger.max.y &&
        position.z >= trigger.min.z && position.z <= trigger.max.z
      ) {
        return trigger.target;
      }
    }
    return null;
  }

  buildBathroom() {
    // Bathroom structure (box in corner) - rusty appearance
    const bathroomGeo = new THREE.BoxGeometry(8, 8, 8);
    const bathroomMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a5a,
      metalness: 0.6,
      roughness: 0.7,
      map: this.createRustyTexture(),
    });
    const bathroom = new THREE.Mesh(bathroomGeo, bathroomMat);
    bathroom.position.set(-28, 0, -28);
    bathroom.castShadow = true;
    bathroom.receiveShadow = true;
    this.scene.add(bathroom);

    // Flickering fluorescent light
    const flickerLight = new THREE.PointLight(0x99ff99, 1.5, 50);
    flickerLight.position.set(-28, 3.5, -28);
    flickerLight.castShadow = true;
    this.scene.add(flickerLight);
    this.flickerLights = [flickerLight];

    // Bathroom door frame (entrance) - more visible
    const doorGeo = new THREE.BoxGeometry(2.5, 3, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ 
      color: 0x333344,
      metalness: 0.4,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-28, 1.5, -24.9);
    door.userData.interactive = true;
    door.userData.hint = 'Press E to enter bathroom';
    door.userData.type = 'bathroom_enter';
    this.scene.add(door);
    this.interactables.push(door);

    // Dealer in back
    this.buildDealer(-28, 1.5, -32);

    // Stall (delivery point)
    const stallGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
    const stallMat = new THREE.MeshStandardMaterial({ 
      color: 0x554455,
      metalness: 0.3,
    });
    const stall = new THREE.Mesh(stallGeo, stallMat);
    stall.position.set(-28, 1.25, -32);
    stall.userData.interactive = true;
    stall.userData.hint = 'Press E to deliver money';
    stall.userData.type = 'delivery';
    this.scene.add(stall);
    this.interactables.push(stall);
  }

  createRustyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(0, 0, 256, 256);
    
    // Rust spots
    ctx.fillStyle = 'rgba(200, 80, 50, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 40 + 10;
      ctx.fillRect(x, y, size, size);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }

  buildDealer(x, y, z) {
    // Simple dealer model (cylinder with sphere cap)
    const dealerBody = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16);
    const dealerMat = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    const dealer = new THREE.Mesh(dealerBody, dealerMat);
    dealer.position.set(x, y + 0.7, z);
    dealer.castShadow = true;
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const head = new THREE.Mesh(headGeo, dealerMat);
    head.position.set(x, y + 1.9, z);
    head.castShadow = true;
    dealer.add(head);
    
    dealer.userData.interactive = true;
    dealer.userData.hint = 'Press E to view dealer inventory';
    dealer.userData.type = 'dealer';
    this.scene.add(dealer);
    this.interactables.push(dealer);
  }

  buildDiceTable(x, y, z) {
    // Table surface
    const tableGeo = new THREE.BoxGeometry(4, 0.8, 3);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x00aa44,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(x, y, z);
    table.castShadow = true;
    table.receiveShadow = true;
    this.scene.add(table);

    // Interactive zone
    const interactGeo = new THREE.BoxGeometry(4.5, 0.2, 3.5);
    const interact = new THREE.Mesh(interactGeo);
    interact.position.set(x, y + 0.6, z);
    interact.userData.interactive = true;
    interact.userData.hint = 'Press E to play Dice Game';
    interact.userData.type = 'game_dice';
    interact.visible = false;
    this.scene.add(interact);
    this.interactables.push(interact);
    
    const sign = this.buildSign(x, y + 2, z, 'DICE');
    this.scene.add(sign);
  }

  buildBlackjackTable(x, y, z) {
    const tableGeo = new THREE.BoxGeometry(4, 0.8, 3);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x00aa44,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(x, y, z);
    table.castShadow = true;
    this.scene.add(table);

    const interact = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 3.5));
    interact.position.set(x, y + 0.6, z);
    interact.userData.interactive = true;
    interact.userData.hint = 'Press E to play Blackjack';
    interact.userData.type = 'game_blackjack';
    interact.visible = false;
    this.scene.add(interact);
    this.interactables.push(interact);

    const sign = this.buildSign(x, y + 2, z, 'BLACKJACK');
    this.scene.add(sign);
  }

  buildSlotMachines(x, y, z) {
    for (let i = 0; i < 3; i++) {
      const slotGeo = new THREE.BoxGeometry(1.2, 3, 1.2);
      const slotMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        metalness: 0.6,
      });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(x + i * 2, y + 1.5, z);
      slot.castShadow = true;
      this.scene.add(slot);

      const interact = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5));
      interact.position.set(x + i * 2, y + 1.5, z);
      interact.userData.interactive = true;
      interact.userData.hint = 'Press E to play Slots';
      interact.userData.type = 'game_slots';
      interact.visible = false;
      this.scene.add(interact);
      this.interactables.push(interact);
    }
    const sign = this.buildSign(x + 1, y + 3.5, z, 'SLOTS');
    this.scene.add(sign);
  }

  buildRouletteTable(x, y, z) {
    const tableGeo = new THREE.CylinderGeometry(2, 2, 0.8, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x00aa44,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(x, y, z);
    table.castShadow = true;
    this.scene.add(table);

    const interact = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.2, 32));
    interact.position.set(x, y + 0.6, z);
    interact.userData.interactive = true;
    interact.userData.hint = 'Press E to play Roulette';
    interact.userData.type = 'game_roulette';
    interact.visible = false;
    this.scene.add(interact);
    this.interactables.push(interact);

    const sign = this.buildSign(x, y + 2.5, z, 'ROULETTE');
    this.scene.add(sign);
  }

  buildPokerTable(x, y, z) {
    const tableGeo = new THREE.BoxGeometry(4, 0.8, 2.5);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x00aa44,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(x, y, z);
    table.castShadow = true;
    this.scene.add(table);

    const interact = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 3));
    interact.position.set(x, y + 0.6, z);
    interact.userData.interactive = true;
    interact.userData.hint = 'Press E to play Poker';
    interact.userData.type = 'game_poker';
    interact.visible = false;
    this.scene.add(interact);
    this.interactables.push(interact);

    const sign = this.buildSign(x, y + 2, z, 'POKER');
    this.scene.add(sign);
  }

  buildWalls() {
    const walls = [
      { pos: [0, 15, -30], size: [60, 30, 0.2] },
      { pos: [0, 15, 30], size: [60, 30, 0.2] },
      { pos: [-30, 15, 0], size: [0.2, 30, 60] },
      { pos: [30, 15, 0], size: [0.2, 30, 60] },
    ];

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x101722,
      metalness: 0.05,
      roughness: 0.9,
    });

    for (const w of walls) {
      const geo = new THREE.BoxGeometry(...w.size);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(...w.pos);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  buildRgbLighting() {
    const lights = [
      { color: 0xff335f, position: [-12, 8, -8], phase: 0 },
      { color: 0x3dff88, position: [10, 8, 4], phase: 1.8 },
      { color: 0x337bff, position: [0, 9, 14], phase: 3.4 },
    ];

    for (const cfg of lights) {
      const light = new THREE.PointLight(cfg.color, 2.1, 45);
      light.position.set(...cfg.position);
      light.userData.phase = cfg.phase;
      this.scene.add(light);
      this.rgbLights.push(light);
    }
  }

  buildTrafficBackdrop(bounds = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#05070f');
    gradient.addColorStop(0.65, '#172238');
    gradient.addColorStop(1, '#0c111a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    // Distant city blocks
    ctx.fillStyle = 'rgba(32, 43, 67, 0.95)';
    ctx.fillRect(0, 120, 512, 136);
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * 512;
      const y = 82 + Math.random() * 75;
      const w = 10 + Math.random() * 30;
      const h = 20 + Math.random() * 60;
      ctx.fillStyle = `rgba(${18 + Math.random() * 20}, ${28 + Math.random() * 20}, ${45 + Math.random() * 30}, 0.85)`;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = `rgba(${255 * Math.random()}, ${220 + Math.random() * 25}, ${130 + Math.random() * 40}, ${0.2 + Math.random() * 0.45})`;
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(x + 4 + (j % 2) * 8, y + 6 + j * 10, 3, 5);
      }
    }

    // Traffic streaks
    for (let i = 0; i < 28; i++) {
      const y = 150 + Math.random() * 70;
      const x = Math.random() * 512;
      const len = 20 + Math.random() * 90;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 81, 81, 0.7)' : 'rgba(255, 205, 85, 0.75)';
      ctx.lineWidth = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const width = bounds ? (bounds.max.x - bounds.min.x) * 0.5 : 26;
    const height = bounds ? (bounds.max.y - bounds.min.y) * 0.32 : 13;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 })
    );
    if (bounds) {
      plane.position.set(bounds.max.x + 0.4, bounds.min.y + height * 0.75, bounds.min.z + (bounds.max.z - bounds.min.z) * 0.5);
      plane.rotation.y = -Math.PI / 2;
    } else {
      plane.position.set(0, 11, 29.4);
    }
    this.scene.add(plane);
  }

  buildBathroomDoor(bounds = null) {
    const doorX = bounds ? bounds.min.x + (bounds.max.x - bounds.min.x) * 0.25 : 0;
    const doorY = bounds ? bounds.min.y + 1.7 : 1.7;
    const doorZ = bounds ? bounds.min.z + (bounds.max.z - bounds.min.z) * 0.08 : 29.25;
    this.bathroomDoorPosition.set(doorX, doorY, doorZ);
    this.aureonExitTarget.set(doorX, 1.6, doorZ + 2.4);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 3.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x384157, roughness: 0.55, metalness: 0.2 })
    );
    frame.position.set(doorX, doorY, doorZ);
    this.scene.add(frame);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3.1, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x17202d, roughness: 0.55, metalness: 0.15 })
    );
    door.position.set(doorX, doorY - 0.1, doorZ + 0.1);
    door.userData.interactive = true;
    door.userData.type = 'scene_door';
    door.userData.target = 'bathroom';
    door.userData.hint = 'Click the washroom door to return';
    this.scene.add(door);
    this.interactables.push(door);
  }

  update(delta) {
    this.elapsed += delta;
    for (let i = 0; i < this.rgbLights.length; i++) {
      const light = this.rgbLights[i];
      const phase = light.userData.phase || 0;
      light.intensity = 1.6 + Math.sin(this.elapsed * 1.7 + phase) * 0.55;
      light.position.y = 8 + Math.sin(this.elapsed * 0.9 + phase) * 0.35;
    }
  }

  buildSign(x, y, z, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 70);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const geo = new THREE.PlaneGeometry(3, 1.5);
    const sign = new THREE.Mesh(geo, mat);
    sign.position.set(x, y, z);
    return sign;
  }

  getInteractables() {
    return this.interactables;
  }

  setAureonInspectionEnabled(enabled) {
    if (this.aureonInspectTrigger) {
      this.aureonInspectTrigger.userData.interactive = enabled;
    }
  }

  setAureonEscapeEnabled(enabled) {
    if (this.aureonEscapeTrigger) {
      this.aureonEscapeTrigger.userData.interactive = enabled;
    }
  }

  getAureonDisplayPosition() {
    return this.aureonDisplayPosition.clone();
  }

  getAureonExitTarget() {
    return this.aureonExitTarget.clone();
  }

  getAureonMount() {
    return this.aureonMount;
  }

  buildAtmCluster(lowerY, min, size) {
    const positions = [
      { x: min.x + size.x * 0.2, z: min.z + size.z * 0.3, label: 'ATM 01' },
      { x: min.x + size.x * 0.52, z: min.z + size.z * 0.2, label: 'ATM 02' },
      { x: min.x + size.x * 0.78, z: min.z + size.z * 0.34, label: 'ATM 03' },
    ];

    for (const atm of positions) {
      this.createAtmStation(atm.x, lowerY, atm.z, atm.label);
    }
  }

  createAtmStation(x, y, z, label) {
    const station = new THREE.Group();
    station.position.set(x, y, z);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.3, 0.9),
      new THREE.MeshStandardMaterial({
        color: 0x2b3342,
        roughness: 0.72,
        metalness: 0.22,
        emissive: 0x09111a,
        emissiveIntensity: 0.28,
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    station.add(body);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.9),
      new THREE.MeshBasicMaterial({ color: 0x90f1ff })
    );
    screen.position.set(0, 0.25, 0.46);
    station.add(screen);

    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.06, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xcfd8e6, roughness: 0.4, metalness: 0.7 })
    );
    slot.position.set(0, -0.55, 0.47);
    station.add(slot);

    const sign = this.buildSign(0, 1.75, 0, label);
    sign.rotation.y = Math.PI;
    station.add(sign);

    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.5, 1.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    trigger.position.y = 1.0;
    trigger.visible = false;
    trigger.userData.interactive = true;
    trigger.userData.type = 'atm';
    trigger.userData.hint = `Press E to use ${label}`;
    trigger.userData.atmName = label;
    station.add(trigger);
    this.interactables.push(trigger);

    this.layoutRoot.add(station);
  }

  getCollisionMeshes() {
    return [];
  }
}
