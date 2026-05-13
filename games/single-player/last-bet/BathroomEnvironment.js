// BathroomEnvironment.js - Separate washroom scene
class BathroomEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.interactables = [];
    this.collisionMeshes = [];
    this.flickerLights = [];
    this.elapsed = 0;
    this.modelLoaded = false;
    this.texturesMissing = false;
    this.spawnPosition = new THREE.Vector3(2.45, 1.6, 2.05);
    this.spawnYaw = Math.PI;
    this.returnPosition = new THREE.Vector3(0, 1.6, -3.6);
    this.returnYaw = Math.PI;
    this.dealerPosition = new THREE.Vector3(-2.25, 1.15, 0.6);
    this.dealerDialogueAnchor = new THREE.Vector3(-2.25, 2.55, 0.6);
    this.dealerAvailable = true;
    this.gameplayAnchorsInstalled = false;
    this.anchorMeshes = [];
    this.loadWashroomModel();
  }

  loadWashroomModel() {
    this.scene.background = new THREE.Color(0x08111b);
    // Remove fog for clarity
    this.scene.fog = null;

    // Brighter, but still atmospheric lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.12);
    this.scene.add(ambient);

    if (!THREE.GLTFLoader) {
      // fallback: show error
      alert('GLTFLoader missing. Cannot load washroom model.');
      return;
    }
    const loader = new THREE.GLTFLoader();
    loader.setPath('Washroom/');
    // Set texture path for GLTFLoader if textures are referenced relatively
    if (loader.setResourcePath) loader.setResourcePath('Washroom/textures/');
    loader.load('Model2V2.glb', (gltf) => {
      this.modelLoaded = true;
      const model = gltf.scene;
      // The imported washroom faces the wrong way relative to our gameplay anchors.
      model.rotation.y = Math.PI;
      model.updateMatrixWorld(true);
      // Remove random box: look for a mesh named 'Box' or similar and remove it
      let toRemove = [];
      model.traverse((child) => {
        if (child.isMesh) {
          // Remove box if named 'Box' or similar
          if (/box/i.test(child.name)) {
            toRemove.push(child);
          }
          child.castShadow = true;
          child.receiveShadow = true;
          // Check for missing textures
          if (child.material && child.material.map && !child.material.map.image) {
            this.texturesMissing = true;
          }
          // Flicker lights: look for mesh names containing 'Light' or 'MirrorLight'
          if (child.name && /light/i.test(child.name)) {
            // Place a flicker point light at this mesh's position
            const flicker = new THREE.PointLight(0xf4ffff, 2.2, 10);
            flicker.position.copy(child.getWorldPosition(new THREE.Vector3()));
            flicker.castShadow = true;
            this.scene.add(flicker);
            this.flickerLights.push(flicker);
          }
          // Mirror: add reflection if possible
          if (/mirror/i.test(child.name)) {
            // Add a basic planar reflection (Three.js Reflector)
            if (typeof THREE.Reflector === 'function') {
              const reflector = new THREE.Reflector(child.geometry, {
                color: 0x8899aa,
                textureWidth: 512,
                textureHeight: 512,
                clipBias: 0.003
              });
              reflector.position.copy(child.position);
              reflector.rotation.copy(child.rotation);
              reflector.scale.copy(child.scale);
              this.scene.add(reflector);
            } else {
              // If not available, let user know
              if (window.gameUI) window.gameUI.showWarning('Mirror reflection not supported (missing THREE.Reflector).');
            }
          }
        }
      });
      // Remove unwanted box meshes
      toRemove.forEach((mesh) => {
        if (mesh.parent) mesh.parent.remove(mesh);
      });
      this.scene.add(model);
      this.installGameplayAnchors();
    }, undefined, (err) => {
      this.texturesMissing = true;
      // fallback: show error
      alert('Failed to load washroom model.');
      this.installGameplayAnchors();
    });
  }

  installGameplayAnchors() {
    if (this.gameplayAnchorsInstalled) {
      return;
    }
    this.gameplayAnchorsInstalled = true;
    this.interactables = [];
    this.collisionMeshes = [];

    const collisionBoxes = [
      { x: -4.75, y: 1.6, z: 0, w: 0.45, h: 3.4, d: 10.2 },
      { x: 4.75, y: 1.6, z: 0, w: 0.45, h: 3.4, d: 10.2 },
      { x: 0, y: 1.6, z: 4.85, w: 9.5, h: 3.4, d: 0.4 },
      { x: -3.1, y: 1.6, z: -4.85, w: 3.8, h: 3.4, d: 0.4 },
      { x: 3.1, y: 1.6, z: -4.85, w: 3.8, h: 3.4, d: 0.4 },
      { x: -1.18, y: 1.6, z: -4.35, w: 0.45, h: 3.4, d: 1.15 },
      { x: 1.18, y: 1.6, z: -4.35, w: 0.45, h: 3.4, d: 1.15 },
      { x: -1.55, y: 1.55, z: 2.4, w: 0.18, h: 3.1, d: 2.6 },
      { x: 1.55, y: 1.55, z: 2.4, w: 0.18, h: 3.1, d: 2.6 },
      { x: 3.35, y: 1.55, z: 2.4, w: 0.18, h: 3.1, d: 2.6 },
      { x: 0, y: 1.55, z: 3.62, w: 1.95, h: 3.1, d: 0.18 },
      { x: 1.95, y: 1.55, z: 3.62, w: 1.95, h: 3.1, d: 0.18 },
      { x: -2.55, y: 1.55, z: 3.7, w: 2.55, h: 3.1, d: 0.45 },
      { x: -3.9, y: 1.55, z: 2.55, w: 0.55, h: 3.1, d: 2.7 },
      { x: 2.45, y: 0.55, z: 2.98, w: 1.05, h: 1.1, d: 1.05 },
      { x: 0.25, y: 0.55, z: 2.98, w: 1.05, h: 1.1, d: 1.05 },
      { x: -2.3, y: 0.55, z: 0.6, w: 2.8, h: 1.2, d: 1.8 },
      { x: -2.3, y: 1.3, z: 0.6, w: 0.95, h: 2.0, d: 1.05 },
      { x: -2.55, y: 1.95, z: 4.56, w: 2.8, h: 1.9, d: 0.3 },
      { x: -2.7, y: 1.15, z: 2.7, w: 1.95, h: 1.2, d: 0.8 },
      { x: 3.95, y: 1.55, z: 2.55, w: 0.55, h: 3.1, d: 2.7 },
    ];

    for (const box of collisionBoxes) {
      this.createCollisionBox(box.x, box.y, box.z, box.w, box.h, box.d);
    }

    this.doorTrigger = this.createInteractionBox(0, 1.45, -4.35, 2.25, 2.8, 0.9, {
      type: 'scene_door',
      target: 'casino',
      hint: 'Press E to enter the casino',
    });
    this.deliveryTrigger = this.createInteractionBox(2.55, 1.0, -1.72, 1.35, 1.65, 1.2, {
      type: 'delivery',
      hint: 'Press E to deposit cash',
    });
    this.dealerTrigger = this.createInteractionBox(this.dealerPosition.x, this.dealerPosition.y, this.dealerPosition.z, 1.15, 2.2, 1.35, {
      type: 'dealer',
      hint: 'Press E to speak to the dealer',
    });

    this.setDealerAvailable(this.dealerAvailable);
  }

  createCollisionBox(x, y, z, width, height, depth) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    mesh.position.set(x, y, z);
    mesh.visible = false;
    this.scene.add(mesh);
    this.anchorMeshes.push(mesh);
    this.collisionMeshes.push(mesh);
    return mesh;
  }

  createInteractionBox(x, y, z, width, height, depth, userData) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    mesh.position.set(x, y, z);
    mesh.visible = false;
    mesh.userData = {
      interactive: true,
      ...userData,
    };
    this.scene.add(mesh);
    this.anchorMeshes.push(mesh);
    this.interactables.push(mesh);
    return mesh;
  }

  setDealerAvailable(isAvailable) {
    this.dealerAvailable = isAvailable;
    if (this.dealerTrigger) {
      this.dealerTrigger.userData.interactive = isAvailable;
      this.dealerTrigger.userData.hint = isAvailable
        ? 'Press E to speak to the dealer'
        : 'The dealer never came back.';
      this.dealerTrigger.visible = false;
    }
  }

  addWall(x, y, z, width, height, depth, color) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.02 })
    );
    wall.position.set(x, y, z);
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  createTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#a4b5bf';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(35,45,58,0.55)';
    ctx.lineWidth = 8;
    for (let i = 0; i <= 8; i++) {
      const p = (i / 8) * 256;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(256, p);
      ctx.stroke();
    }

    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${95 + Math.random() * 30}, ${105 + Math.random() * 25}, 0.16)`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.25, 1.25);
    return texture;
  }

  createGrimeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#607080';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = 8 + Math.random() * 34;
      ctx.fillStyle = `rgba(${120 + Math.random() * 60}, ${90 + Math.random() * 35}, ${60 + Math.random() * 30}, ${0.08 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  buildSink() {
    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.9, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xb8c9d6, roughness: 0.35, metalness: 0.15 })
    );
    sink.position.set(-2.7, 0.95, 2.7);
    sink.castShadow = true;
    sink.receiveShadow = true;
    this.scene.add(sink);

    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x8da0ae, metalness: 0.85, roughness: 0.3 })
    );
    faucet.rotation.z = Math.PI / 2;
    faucet.position.set(-2.15, 1.55, 2.7);
    this.scene.add(faucet);
  }

  buildMirror() {
    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x1a2732, roughness: 0.15, metalness: 0.9, emissive: 0x0b1620, emissiveIntensity: 0.45 })
    );
    mirror.position.set(-2.5, 2.25, 4.75);
    this.scene.add(mirror);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.55, 1.65, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x405162, roughness: 0.6, metalness: 0.2 })
    );
    frame.position.set(-2.5, 2.25, 4.72);
    this.scene.add(frame);
  }

  buildToilet() {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.65, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f8, roughness: 0.5 })
    );
    base.position.set(2.5, 0.4, 2.7);
    base.castShadow = true;
    this.scene.add(base);

    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.8, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe9eef2, roughness: 0.45 })
    );
    tank.position.set(2.5, 1.35, 2.45);
    this.scene.add(tank);
  }

  buildTrashCan() {
    const can = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: 0x354252, roughness: 0.8 })
    );
    can.position.set(3.2, 0.35, -2.6);
    this.scene.add(can);
  }

  buildStallDoor() {
    const stall = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.8, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x273242, roughness: 0.85, metalness: 0.1, map: this.createGrimeTexture() })
    );
    stall.position.set(0, 1.4, -4.85);
    stall.castShadow = true;
    this.scene.add(stall);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 3.05, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x444f60, roughness: 0.6, metalness: 0.2 })
    );
    frame.position.set(0, 1.5, -4.88);
    this.scene.add(frame);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 2.75, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x2f3948, roughness: 0.7, metalness: 0.2 })
    );
    door.position.set(0, 1.4, -4.74);
    door.userData.interactive = true;
    door.userData.type = 'scene_door';
    door.userData.target = 'casino';
    door.userData.hint = 'Click the door to leave the washroom';
    this.scene.add(door);
    this.interactables.push(door);
  }

  buildDealerTable() {
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.75, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x2d3547, roughness: 0.8, metalness: 0.1 })
    );
    table.position.set(-2.25, 0.45, 0.6);
    this.scene.add(table);

    const dealerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 1.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x6f7d8c, roughness: 0.35, metalness: 0.22 })
    );
    dealerBody.position.set(-2.25, 1.05, 0.6);
    dealerBody.castShadow = true;
    this.scene.add(dealerBody);

    const dealerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8ccb3, roughness: 0.5 })
    );
    dealerHead.position.set(-2.25, 1.95, 0.6);
    this.scene.add(dealerHead);

    const dealer = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.9, 0.95),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    dealer.position.set(-2.25, 1.05, 0.6);
    dealer.userData.interactive = true;
    dealer.userData.type = 'dealer';
    dealer.userData.hint = 'Click to open dealer inventory';
    this.scene.add(dealer);
    this.interactables.push(dealer);
  }

  buildDeliveryBag() {
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.7, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x7a4b2b, roughness: 0.9, metalness: 0.05 })
    );
    bag.position.set(2.6, 0.35, -1.7);
    bag.userData.interactive = true;
    bag.userData.type = 'delivery';
    bag.userData.hint = 'Click to drop off the money';
    this.scene.add(bag);
    this.interactables.push(bag);
  }

  update(delta) {
    this.elapsed += delta;
    for (let i = 0; i < this.flickerLights.length; i++) {
      const light = this.flickerLights[i];
      light.intensity = 1.1 + Math.sin(this.elapsed * 8 + i * 0.9) * 0.22 + (Math.random() - 0.5) * 0.08;
    }
    // Show missing texture warning if needed
    if (this.texturesMissing && window.gameUI) {
      window.gameUI.showWarning('Some washroom textures are missing. Please check the textures folder.');
      this.texturesMissing = false; // Only show once
    }
  }

  getInteractables() {
    return this.interactables;
  }

  getCollisionMeshes() {
    return this.collisionMeshes || [];
  }

  getSpawnPosition() {
    return this.spawnPosition || new THREE.Vector3(2.45, 1.6, 2.05);
  }

  getSpawnYaw() {
    return this.spawnYaw;
  }

  getReturnPosition() {
    return this.returnPosition || new THREE.Vector3(0.1, 1.6, -3.75);
  }

  getReturnYaw() {
    return this.returnYaw;
  }

  getDealerDialogueAnchor() {
    return this.dealerDialogueAnchor.clone();
  }
}
