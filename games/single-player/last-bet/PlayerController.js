// PlayerController.js - First-person camera and movement
class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.isLocked = false;
    this.pitch = 0;
    this.yaw = 0;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.speed = 3.6;
    this.position = new THREE.Vector3(0, 1.6, 0);
    this.velocity = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.interactCallback = null;
    this.lastClickTime = 0;
    this.bounds = {
      minX: -6,
      maxX: 6,
      minZ: -6,
      maxZ: 6,
    };
    this.inputEnabled = true;

    this.setupControls();
  }

  setupControls() {
    // Pointer lock
    this.domElement.addEventListener('click', () => {
      if (!this.inputEnabled) return;
      this.domElement.requestPointerLock?.();
    });

    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (!this.inputEnabled) return;
      if (this.isLocked) {
        this.interact();
      } else {
        this.domElement.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    // Mouse look
    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked || !this.inputEnabled) return;
      const sens = 0.003;
      // Invert X so moving mouse left looks left (standard FPS)
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!this.inputEnabled) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'e', '1', '2', '3', '4', '5', 'g', 'h', 'j', ',', '.', '/'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'w' || key === 'arrowup') this.moveForward = true;
      if (key === 's' || key === 'arrowdown') this.moveBackward = true;
      if (key === 'a' || key === 'arrowleft') this.moveLeft = true;
      if (key === 'd' || key === 'arrowright') this.moveRight = true;
      if (key === 'e') this.interact();
      if (key >= '1' && key <= '5') this.hotbarPress(parseInt(key));
      if (key === 'g' || key === ',') this.triggerHotkey(1);
      if (key === 'h' || key === '.') this.triggerHotkey(2);
      if (key === 'j' || key === '/') this.triggerHotkey(3);
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'w' || key === 'arrowup') this.moveForward = false;
      if (key === 's' || key === 'arrowdown') this.moveBackward = false;
      if (key === 'a' || key === 'arrowleft') this.moveLeft = false;
      if (key === 'd' || key === 'arrowright') this.moveRight = false;
    });

    this.domElement.addEventListener('wheel', (e) => {
      if (!this.inputEnabled) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      this.cycleHotbar(direction);
    }, { passive: false });
  }

  update(delta, scene, environment = null) {
    // Update camera rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    if (!this.inputEnabled) {
      this.camera.position.copy(this.position);
      return;
    }

    // Movement (W = forward, S = backward, A = left, D = right, relative to camera yaw)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() === 0) {
      forward.set(0, 0, -1);
    } else {
      forward.normalize();
    }
    const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
    const moveDir = new THREE.Vector3();
    if (this.moveForward) moveDir.add(forward);
    if (this.moveBackward) moveDir.sub(forward);
    if (this.moveLeft) moveDir.sub(right);
    if (this.moveRight) moveDir.add(right);

    // Collision detection (if scene.getCollisionMeshes exists)
    let nextPos = this.position.clone();
    if (moveDir.length() > 0) {
      moveDir.normalize();
      moveDir.multiplyScalar(this.speed * delta);
      nextPos.add(moveDir);
      // Check collisions with washroom objects (if available)
      const collisionSource =
        environment && typeof environment.getCollisionMeshes === 'function'
          ? environment
          : scene;
      if (typeof collisionSource.getCollisionMeshes === 'function') {
        const collisionMeshes = collisionSource.getCollisionMeshes();
        const playerRadius = 0.3;
        const resolvedPos = this.position.clone();
        const tryX = resolvedPos.clone();
        tryX.x = nextPos.x;
        if (!this.wouldCollide(resolvedPos, tryX, collisionMeshes, playerRadius)) {
          resolvedPos.x = tryX.x;
        }

        const tryZ = resolvedPos.clone();
        tryZ.z = nextPos.z;
        if (!this.wouldCollide(resolvedPos, tryZ, collisionMeshes, playerRadius)) {
          resolvedPos.z = tryZ.z;
        }

        this.position.copy(resolvedPos);
      } else {
        this.position.copy(nextPos);
      }
    }

    // Boundary check (scene-specific)
    this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
    this.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.position.z));
    this.position.y = Math.max(1.5, Math.min(2.0, this.position.y)); // eye height bounds

    this.camera.position.copy(this.position);

    // Check for nearby interactables
    this.checkNearbyInteractables(scene);
  }

  checkNearbyInteractables(scene) {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    this.raycaster.set(this.camera.position, forward);
    const dist = 3; // interaction distance
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    
    let hint = '';
    for (const hit of intersects) {
      if (hit.distance < dist && hit.object.userData?.interactive) {
        hint = hit.object.userData.hint || 'Press E to interact';
        break;
      }
    }
    
    if (window.gameUI) {
      window.gameUI.showInteractionHint(hint);
    }
  }

  wouldCollide(fromPos, toPos, collisionMeshes, playerRadius) {
    const sweepBox = new THREE.Box3().setFromPoints([fromPos, toPos]);
    sweepBox.expandByScalar(playerRadius);

    for (const mesh of collisionMeshes) {
      const meshBox = new THREE.Box3().setFromObject(mesh);
      if (meshBox.intersectsBox(sweepBox)) {
        return true;
      }
    }

    return false;
  }

  interact() {
    if (!this.inputEnabled) return;
    const now = Date.now();
    if (now - this.lastClickTime < 200) return; // debounce
    this.lastClickTime = now;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    this.raycaster.set(this.camera.position, forward);
    
    if (this.interactCallback) {
      this.interactCallback(this.raycaster, 3);
    }
  }

  hotbarPress(slot) {
    if (!this.inputEnabled) return;
    if (window.gameUI) {
      window.gameUI.useCheat(slot - 1);
    }
  }

  cycleHotbar(direction) {
    if (window.gameUI) {
      window.gameUI.scrollHotbar(direction);
    }
  }

  triggerHotkey(index) {
    if (window.gameUI) {
      window.gameUI.useHotkey(index);
    }
  }

  setInputEnabled(enabled) {
    this.inputEnabled = enabled;
    if (!enabled) {
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      document.exitPointerLock?.();
    }
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  setBounds(minX, maxX, minZ, maxZ) {
    this.bounds = { minX, maxX, minZ, maxZ };
  }
}
