import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const visibilityBtn = document.getElementById("visibility-btn");
const toggleOverlayBtn = document.getElementById("toggle-overlay-btn");
const overlay = document.getElementById("overlay");
const mobileUI = document.getElementById("mobile-ui");

const isTouchDevice = window.matchMedia("(hover: none)").matches || window.innerWidth < 900;
let pointerLocked = false;
const visibilityMode = { high: true };

function initFallbackMode(reason) {
  statusEl.textContent = "WebGL unavailable on this device/browser. Running fallback mode.";
  visibilityBtn.textContent = "High Visibility: ON";

  const fallback = document.createElement("canvas");
  fallback.id = "fallback-canvas";
  fallback.style.position = "fixed";
  fallback.style.inset = "0";
  fallback.style.zIndex = "0";
  fallback.style.width = "100%";
  fallback.style.height = "100%";
  document.body.appendChild(fallback);

  const ctx = fallback.getContext("2d");
  const player = { x: 120, y: 220, vx: 0, vy: 0, w: 18, h: 28, onGround: false };
  const keys = {};
  const blocks = [];

  function resize() {
    fallback.width = window.innerWidth;
    fallback.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function generate2DWorld() {
    blocks.length = 0;
    const tile = 32;
    const cols = Math.ceil(window.innerWidth / tile) + 16;
    for (let x = 0; x < cols; x++) {
      const h = Math.floor(7 + Math.sin(x * 0.25) * 2 + Math.random() * 2);
      for (let y = 0; y < h; y++) {
        blocks.push({ x: x * tile, y: fallback.height - (y + 1) * tile, s: tile });
      }
    }
  }
  generate2DWorld();

  function intersects(px, py, pw, ph, b) {
    return px < b.x + b.s && px + pw > b.x && py < b.y + b.s && py + ph > b.y;
  }

  window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

  startBtn.onclick = () => {
    player.x = 120;
    player.y = 120;
    player.vx = 0;
    player.vy = 0;
  };

  toggleOverlayBtn.onclick = () => {
    overlay.classList.toggle("minimized");
    toggleOverlayBtn.textContent = overlay.classList.contains("minimized") ? "Show HUD" : "Hide HUD";
  };

  visibilityBtn.onclick = () => {
    visibilityMode.high = !visibilityMode.high;
    visibilityBtn.textContent = `High Visibility: ${visibilityMode.high ? "ON" : "OFF"}`;
  };

  function step() {
    const speed = keys["shift"] ? 4.2 : 3;
    if (keys["a"] || keys["arrowleft"]) player.vx = -speed;
    else if (keys["d"] || keys["arrowright"]) player.vx = speed;
    else player.vx *= 0.75;

    if ((keys["w"] || keys[" "] || keys["arrowup"]) && player.onGround) {
      player.vy = -9;
      player.onGround = false;
    }

    player.vy += 0.38;
    player.x += player.vx;
    player.y += player.vy;
    player.onGround = false;

    for (const b of blocks) {
      if (intersects(player.x, player.y, player.w, player.h, b)) {
        if (player.vy > 0 && player.y + player.h - player.vy <= b.y + 2) {
          player.y = b.y - player.h;
          player.vy = 0;
          player.onGround = true;
        }
      }
    }

    if (player.y > fallback.height + 100) {
      player.x = 120;
      player.y = 120;
      player.vx = 0;
      player.vy = 0;
    }

    const skyTop = visibilityMode.high ? "#9dd5ff" : "#4a5f74";
    const skyBottom = visibilityMode.high ? "#d9f0ff" : "#202f3f";
    const grad = ctx.createLinearGradient(0, 0, 0, fallback.height);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, fallback.width, fallback.height);

    ctx.fillStyle = visibilityMode.high ? "#8f5b2c" : "#6b4623";
    blocks.forEach((b) => ctx.fillRect(b.x, b.y, b.s, b.s));

    ctx.fillStyle = "#ffd26a";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(14, fallback.height - 70, 520, 54);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("Fallback Mode Active (WebGL unavailable): A/D move, W/Space jump, Shift sprint", 22, fallback.height - 36);
    ctx.fillText(`Reason: ${reason}`, 22, fallback.height - 16);

    requestAnimationFrame(step);
  }

  step();
}

function createRenderer() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.18;
    r.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(r.domElement);
    return r;
  } catch (err) {
    initFallbackMode(err?.message || "Renderer initialization failed");
    return null;
  }
}

const renderer = createRenderer();
if (!renderer) {
  mobileUI.remove();
} else {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xaad8ff, 180, 760);

  const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1800);

  const hemi = new THREE.HemisphereLight(0xbfe8ff, 0x41506a, 0.65);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.15);
  sun.position.set(120, 170, 100);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const skyGeo = new THREE.SphereGeometry(700, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x7dbdff) },
      bottomColor: { value: new THREE.Color(0xd7efff) },
      offset: { value: 120 },
      exponent: { value: 0.7 },
    },
    vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 worldPosition=modelMatrix*vec4(position,1.0); vWorldPosition=worldPosition.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; gl_FragColor=vec4(mix(bottomColor, topColor, max(pow(max(h,0.0), exponent),0.0)),1.0);} `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  const BLOCK_TYPES = {
    1: { name: "Dirt", color: 0x8d5a2b, roughness: 1.0 },
    2: { name: "Grass", color: 0x4ea843, roughness: 0.95 },
    3: { name: "Stone", color: 0x868d93, roughness: 0.8 },
    4: { name: "Wood", color: 0xa27143, roughness: 0.85 },
    5: { name: "Sand", color: 0xd5c079, roughness: 0.9 },
  };
  const selected = { value: 1 };
  const inventory = { 1: 150, 2: 120, 3: 280, 4: 110, 5: 180 };
  const worldSize = { x: 96, y: 42, z: 96 };
  const SEA_LEVEL = 11;

  const blockMap = new Map();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = Object.fromEntries(Object.entries(BLOCK_TYPES).map(([id, b]) => [id, new THREE.MeshStandardMaterial({ color: b.color, roughness: b.roughness, metalness: 0.02 })]));
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const water = new THREE.Mesh(new THREE.PlaneGeometry(worldSize.x + 60, worldSize.z + 60), new THREE.MeshPhysicalMaterial({ color: 0x4f93cf, transmission: 0.15, transparent: true, opacity: 0.75, roughness: 0.2, metalness: 0.05 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(worldSize.x / 2, SEA_LEVEL + 0.25, worldSize.z / 2);
  scene.add(water);

  const cloudGroup = new THREE.Group();
  scene.add(cloudGroup);

  const keyOf = (x, y, z) => `${x},${y},${z}`;
  const blockAt = (x, y, z) => blockMap.get(keyOf(x, y, z));
  const hash2 = (x, z) => (Math.sin(x * 127.1 + z * 311.7) * 43758.5453123) % 1;

  function addBlock(x, y, z, type) {
    if (x < 0 || z < 0 || x >= worldSize.x || z >= worldSize.z || y < 0 || y >= worldSize.y) return;
    const k = keyOf(x, y, z);
    if (blockMap.has(k)) return;
    const mesh = new THREE.Mesh(geometry, materials[type]);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.receiveShadow = true;
    mesh.userData = { type, x, y, z };
    worldGroup.add(mesh);
    blockMap.set(k, mesh);
  }

  function removeBlockAt(x, y, z) {
    const k = keyOf(x, y, z);
    const mesh = blockMap.get(k);
    if (!mesh) return null;
    worldGroup.remove(mesh);
    blockMap.delete(k);
    return mesh.userData.type;
  }

  function generateWorld() {
    for (let x = 0; x < worldSize.x; x++) {
      for (let z = 0; z < worldSize.z; z++) {
        const h = Math.max(4, Math.min(worldSize.y - 5, Math.floor(8 + (Math.sin(x * 0.11) + Math.cos(z * 0.08)) * 2.4 + (Math.random() * 3))));
        for (let y = 0; y <= h; y++) {
          const type = h <= SEA_LEVEL + 1 ? (y === h ? 5 : 3) : (y === h ? 2 : (y > h - 3 ? 1 : 3));
          addBlock(x, y, z, type);
        }
        if (h > SEA_LEVEL + 2 && Math.random() > 0.985) {
          addBlock(x, h + 1, z, 4); addBlock(x, h + 2, z, 4); addBlock(x, h + 3, z, 4);
        }
      }
    }

    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0.0 });
    for (let i = 0; i < 20; i++) {
      const c = new THREE.Group();
      for (let p = 0; p < 6; p++) {
        const puff = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 1.8), cloudMat);
        puff.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 4);
        c.add(puff);
      }
      c.position.set(Math.random() * worldSize.x, 30 + Math.random() * 8, Math.random() * worldSize.z);
      cloudGroup.add(c);
    }
  }

  generateWorld();

  const player = { pos: new THREE.Vector3(worldSize.x * 0.5, 27, worldSize.z * 0.5), vel: new THREE.Vector3(), yaw: 0, pitch: -0.1, speed: 8, sprint: 1.55, jumpForce: 9.6, grounded: false, radius: 0.34, height: 1.74 };
  const gravity = 22;
  const keyState = {};
  const raycaster = new THREE.Raycaster();
  const dir = new THREE.Vector3();
  const right = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const mobileState = { moveX: 0, moveY: 0, lookX: 0, lookY: 0, jump: false, sprint: false };

  function updateStatus() {
    statusEl.textContent = `Selected: ${BLOCK_TYPES[selected.value].name} | View: ${camera.far}m | Inventory: D ${inventory[1]} G ${inventory[2]} S ${inventory[3]} W ${inventory[4]} Sa ${inventory[5]}`;
  }
  updateStatus();

  function blockCollision(px, py, pz) {
    for (let x = Math.floor(px - player.radius); x <= Math.floor(px + player.radius); x++) {
      for (let y = Math.floor(py); y <= Math.floor(py + player.height); y++) {
        for (let z = Math.floor(pz - player.radius); z <= Math.floor(pz + player.radius); z++) {
          if (blockAt(x, y, z)) return true;
        }
      }
    }
    return false;
  }

  function moveAndCollide(dt) {
    const step = player.vel.clone().multiplyScalar(dt);
    player.pos.x += step.x; if (blockCollision(player.pos.x, player.pos.y, player.pos.z)) { player.pos.x -= step.x; player.vel.x = 0; }
    player.pos.z += step.z; if (blockCollision(player.pos.x, player.pos.y, player.pos.z)) { player.pos.z -= step.z; player.vel.z = 0; }
    player.pos.y += step.y;
    if (blockCollision(player.pos.x, player.pos.y, player.pos.z)) { if (step.y < 0) player.grounded = true; player.pos.y -= step.y; player.vel.y = 0; }
    else player.grounded = false;
    if (player.pos.y < -6) { player.pos.set(worldSize.x * 0.5, 27, worldSize.z * 0.5); player.vel.set(0, 0, 0); }
  }

  function updateCamera(t) {
    const bob = player.grounded && Math.hypot(player.vel.x, player.vel.z) > 0.2 ? Math.sin(t * 12) * 0.025 : 0;
    camera.position.set(player.pos.x, player.pos.y + player.height * 0.9 + bob, player.pos.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
    const sprinting = keyState["shift"] || mobileState.sprint;
    camera.fov += ((sprinting ? 86 : 80) - camera.fov) * 0.08;
    camera.updateProjectionMatrix();
  }

  const pickBlock = () => { raycaster.set(camera.position, dir.set(0, 0, -1).applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, "YXZ"))); raycaster.far = 7; return raycaster.intersectObjects(worldGroup.children, false)[0] ?? null; };

  function tryBreak() {
    const hit = pickBlock(); if (!hit) return;
    const p = hit.object.userData; const removed = removeBlockAt(p.x, p.y, p.z);
    if (removed) inventory[removed] = (inventory[removed] || 0) + 1;
    updateStatus();
  }

  function tryPlace() {
    const hit = pickBlock(); if (!hit || (inventory[selected.value] || 0) <= 0) return;
    const t = hit.object.position.clone().subScalar(0.5).add(hit.face.normal).floor();
    if (blockAt(t.x, t.y, t.z) || t.y < 0 || t.y >= worldSize.y) return;
    addBlock(t.x, t.y, t.z, selected.value); inventory[selected.value] -= 1; updateStatus();
  }

  window.addEventListener("keydown", (e) => {
    keyState[e.key.toLowerCase()] = true;
    if (["1", "2", "3", "4", "5"].includes(e.key)) { selected.value = Number(e.key); updateStatus(); }
    if (e.key.toLowerCase() === "q") tryBreak();
    if (e.key.toLowerCase() === "e") tryPlace();
    if (e.key.toLowerCase() === "v") visibilityBtn.click();
  });
  window.addEventListener("keyup", (e) => (keyState[e.key.toLowerCase()] = false));
  window.addEventListener("mousemove", (e) => {
    if (!pointerLocked && !isTouchDevice) return;
    player.yaw -= e.movementX * 0.0022;
    player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - e.movementY * 0.0022));
  });

  renderer.domElement.addEventListener("click", () => { if (!isTouchDevice) renderer.domElement.requestPointerLock(); });
  document.addEventListener("pointerlockchange", () => { pointerLocked = document.pointerLockElement === renderer.domElement; });
  renderer.domElement.addEventListener("mousedown", (e) => { if (!isTouchDevice) { if (e.button === 0) tryBreak(); if (e.button === 2) tryPlace(); } });
  renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

  function setupPad(padId, stickId, cb) {
    const pad = document.getElementById(padId); const stick = document.getElementById(stickId);
    let activeId = null, centerX = 0, centerY = 0; const radius = () => pad.clientWidth * 0.36;
    const reset = () => { stick.style.left = "30%"; stick.style.top = "30%"; cb(0, 0); };
    pad.addEventListener("pointerdown", (e) => { activeId = e.pointerId; const r = pad.getBoundingClientRect(); centerX = r.left + r.width / 2; centerY = r.top + r.height / 2; pad.setPointerCapture(e.pointerId); });
    pad.addEventListener("pointermove", (e) => {
      if (e.pointerId !== activeId) return;
      const dx = e.clientX - centerX, dy = e.clientY - centerY; const max = radius(); const len = Math.hypot(dx, dy) || 1; const c = Math.min(max, len);
      const nx = (dx / len) * c, ny = (dy / len) * c; stick.style.left = `${30 + (nx / max) * 30}%`; stick.style.top = `${30 + (ny / max) * 30}%`; cb(nx / max, ny / max);
    });
    const end = (e) => { if (e.pointerId === activeId) { activeId = null; reset(); } };
    pad.addEventListener("pointerup", end); pad.addEventListener("pointercancel", end); reset();
  }

  if (isTouchDevice) {
    mobileUI.setAttribute("aria-hidden", "false");
    setupPad("left-pad", "left-stick", (x, y) => { mobileState.moveX = x; mobileState.moveY = y; mobileState.sprint = Math.hypot(x, y) > 0.85; });
    setupPad("right-pad", "right-stick", (x, y) => { mobileState.lookX = x; mobileState.lookY = y; });
    const jumpBtn = document.getElementById("jump-btn");
    jumpBtn.addEventListener("pointerdown", () => (mobileState.jump = true));
    jumpBtn.addEventListener("pointerup", () => (mobileState.jump = false));
    jumpBtn.addEventListener("pointercancel", () => (mobileState.jump = false));
    document.getElementById("break-btn").addEventListener("click", tryBreak);
    document.getElementById("place-btn").addEventListener("click", tryPlace);
  } else {
    mobileUI.remove();
  }

  startBtn.onclick = () => {
    player.pos.set(worldSize.x * 0.5, 27, worldSize.z * 0.5);
    player.vel.set(0, 0, 0);
    if (!isTouchDevice) renderer.domElement.requestPointerLock();
  };

  visibilityBtn.onclick = () => {
    visibilityMode.high = !visibilityMode.high;
    visibilityBtn.textContent = `High Visibility: ${visibilityMode.high ? "ON" : "OFF"}`;
  };

  toggleOverlayBtn.onclick = () => {
    overlay.classList.toggle("minimized");
    toggleOverlayBtn.textContent = overlay.classList.contains("minimized") ? "Show HUD" : "Hide HUD";
  };

  const clock = new THREE.Clock();

  function animateSky(time) {
    const baseDay = 0.5 + 0.5 * Math.sin(time * 0.03);
    const dayFactor = visibilityMode.high ? Math.max(0.6, baseDay) : baseDay;
    const night = 1 - dayFactor;
    scene.fog.color.setRGB(0.5 + 0.3 * dayFactor, 0.62 + 0.26 * dayFactor, 0.75 + 0.2 * dayFactor);
    scene.fog.near = visibilityMode.high ? 240 : 180;
    scene.fog.far = visibilityMode.high ? 980 : 760;
    skyMat.uniforms.topColor.value.setRGB(0.22 + 0.44 * dayFactor, 0.38 + 0.45 * dayFactor, 0.58 + 0.36 * dayFactor);
    skyMat.uniforms.bottomColor.value.setRGB(0.56 + 0.34 * dayFactor, 0.64 + 0.29 * dayFactor, 0.77 + 0.19 * dayFactor);
    sun.position.set(Math.cos(time * 0.03) * 150 + worldSize.x * 0.5, 90 + 120 * dayFactor, Math.sin(time * 0.03) * 140 + worldSize.z * 0.5);
    sun.intensity = 0.6 + dayFactor * 1.0;
    hemi.intensity = 0.45 + dayFactor * 0.7;
    water.material.opacity = 0.66 + dayFactor * 0.12;
    renderer.toneMappingExposure = (visibilityMode.high ? 1.0 : 0.78) + dayFactor * 0.42;
    cloudGroup.children.forEach((cloud, i) => {
      cloud.position.x += 0.01 + i * 0.00003;
      if (cloud.position.x > worldSize.x + 20) cloud.position.x = -20;
      cloud.position.z += Math.sin(time * 0.2 + i) * 0.002;
      cloud.traverse((m) => { if (m.isMesh) m.material.color.setScalar(0.8 + dayFactor * 0.2 - night * 0.25); });
    });
  }

  function step() {
    const dt = Math.min(clock.getDelta(), 0.033);
    const elapsed = clock.elapsedTime;
    const moveX = (keyState["d"] ? 1 : 0) - (keyState["a"] ? 1 : 0) + mobileState.moveX;
    const moveZ = (keyState["w"] ? 1 : 0) - (keyState["s"] ? 1 : 0) - mobileState.moveY;
    player.yaw -= mobileState.lookX * 0.052;
    player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - mobileState.lookY * 0.038));
    forward.set(Math.sin(player.yaw), 0, Math.cos(player.yaw));
    right.set(forward.z, 0, -forward.x);
    const move = new THREE.Vector3().addScaledVector(forward, moveZ).addScaledVector(right, moveX);
    const sprinting = keyState["shift"] || mobileState.sprint;
    const targetSpeed = player.speed * (sprinting ? player.sprint : 1);
    if (move.lengthSq() > 0) { move.normalize().multiplyScalar(targetSpeed); player.vel.x = move.x; player.vel.z = move.z; }
    else { player.vel.x *= 0.74; player.vel.z *= 0.74; if (Math.abs(player.vel.x) < 0.01) player.vel.x = 0; if (Math.abs(player.vel.z) < 0.01) player.vel.z = 0; }
    if ((keyState[" "] || mobileState.jump) && player.grounded) { player.vel.y = player.jumpForce; player.grounded = false; }
    player.vel.y -= gravity * dt;
    moveAndCollide(dt);
    updateCamera(elapsed);
    animateSky(elapsed);
    renderer.render(scene, camera);
    requestAnimationFrame(step);
  }

  updateCamera(0);
  step();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
