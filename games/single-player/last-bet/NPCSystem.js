// NPCSystem.js - Crowd simulation
class NPCSystem {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this.spawnNPCs();
  }

  spawnNPCs() {
    const positions = [
      [-15, 1.6, -10], [-15, 1.6, 5], [15, 1.6, -10], [15, 1.6, 5], [0, 1.6, -15],
      [-10, 1.6, 0], [10, 1.6, 0], [0, 1.6, 5], [-5, 1.6, 10], [5, 1.6, -5],
    ];

    for (const pos of positions) {
      const npc = this.createNPC(pos);
      this.npcs.push(npc);
      this.scene.add(npc);
    }
  }

  createNPC(pos) {
    // Simple NPC model (cylinder body with sphere head)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.3, 16);
    const colors = [0x0088ff, 0xff0088, 0x00ff88, 0xff8800, 0x8800ff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
    });
    
    // Body
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 0.65;
    body.castShadow = true;
    body.receiveShadow = true;
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 1.7;
    head.castShadow = true;
    head.receiveShadow = true;
    
    // Container
    const npc = new THREE.Group();
    npc.add(body);
    npc.add(head);
    npc.position.set(...pos);
    
    npc.userData.npc = true;
    npc.userData.wanderTimer = Math.random() * 5;
    npc.userData.wanderDir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      0,
      (Math.random() - 0.5) * 2
    ).normalize();
    return npc;
  }

  update(delta) {
    for (const npc of this.npcs) {
      npc.userData.wanderTimer -= delta;
      if (npc.userData.wanderTimer <= 0) {
        npc.userData.wanderDir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ).normalize();
        npc.userData.wanderTimer = 3 + Math.random() * 5;
      }

      // Move slowly
      const speed = 0.5;
      npc.position.x += npc.userData.wanderDir.x * speed * delta;
      npc.position.z += npc.userData.wanderDir.z * speed * delta;

      // Boundary
      npc.position.x = Math.max(-28, Math.min(28, npc.position.x));
      npc.position.z = Math.max(-28, Math.min(28, npc.position.z));
    }
  }

  getNPCs() {
    return this.npcs;
  }
}
