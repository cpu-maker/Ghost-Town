// ===== BASIC SETUP =====
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 70);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHTING =====
scene.add(new THREE.AmbientLight(0x404060, 0.3));

const moon = new THREE.DirectionalLight(0xaaaaff, 0.6);
moon.position.set(20, 30, 10);
scene.add(moon);

// Flashlight
const flashlight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5);
flashlight.visible = false;
camera.add(flashlight);
camera.add(flashlight.target);
scene.add(camera);

// ===== PLAYER STATS =====
const stats = {
  health: 100,
  sanity: 100
};

// ===== UI =====
const healthUI = document.getElementById("health");
const sanityUI = document.getElementById("sanity");

// ===== WORLD =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Buildings
const buildings = [];
function building(x, z) {
  const h = Math.random() * 4 + 3;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, h, 4),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  mesh.position.set(x, h / 2, z);
  buildings.push(mesh);
  scene.add(mesh);
}
for (let i = 0; i < 40; i++) {
  building((Math.random()-0.5)*80, (Math.random()-0.5)*80);
}

// ===== ENEMY =====
const enemy = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x550000 })
);
enemy.position.set(10, 1, 10);
scene.add(enemy);

// ===== INPUT =====
const keys = {};
let mapOpen = false;

addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.key === "f") flashlight.visible = !flashlight.visible;
  if (e.key === "m") toggleMap();
});
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Mouse look
let yaw = 0;
addEventListener("mousemove", e => {
  yaw -= e.movementX * 0.002;
  camera.rotation.y = yaw;
});

// ===== MAP =====
const mapCanvas = document.getElementById("map");
const mapCtx = mapCanvas.getContext("2d");

function toggleMap() {
  mapOpen = !mapOpen;
  mapCanvas.style.display = mapOpen ? "block" : "none";
}

function drawMap() {
  mapCanvas.width = innerWidth;
  mapCanvas.height = innerHeight;
  mapCtx.fillStyle = "#000";
  mapCtx.fillRect(0,0,innerWidth,innerHeight);

  mapCtx.fillStyle = "#666";
  buildings.forEach(b => {
    mapCtx.fillRect(
      innerWidth/2 + b.position.x * 5,
      innerHeight/2 + b.position.z * 5,
      6, 6
    );
  });

  mapCtx.fillStyle = "red";
  mapCtx.fillRect(innerWidth/2, innerHeight/2, 8, 8);
}

// ===== SAVE / LOAD =====
function saveGame() {
  localStorage.setItem("ghostSave", JSON.stringify({
    pos: camera.position,
    stats
  }));
}
function loadGame() {
  const save = JSON.parse(localStorage.getItem("ghostSave"));
  if (!save) return;
  camera.position.set(save.pos.x, save.pos.y, save.pos.z);
  stats.health = save.stats.health;
  stats.sanity = save.stats.sanity;
}
loadGame();

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.08;
  if (keys.w) camera.translateZ(-speed);
  if (keys.s) camera.translateZ(speed);
  if (keys.a) camera.translateX(-speed);
  if (keys.d) camera.translateX(speed);

  // Enemy stalking
  enemy.lookAt(camera.position);
  enemy.position.lerp(camera.position, 0.0005);

  // Sanity drain
  if (!flashlight.visible) stats.sanity -= 0.01;
  if (stats.sanity < 0) stats.sanity = 0;

  // Enemy damage
  if (enemy.position.distanceTo(camera.position) < 1.5) {
    stats.health -= 0.1;
  }

  // UI
  healthUI.textContent = Math.floor(stats.health);
  sanityUI.textContent = Math.floor(stats.sanity);

  if (mapOpen) drawMap();

  renderer.render(scene, camera);
}
animate();

// Auto-save
setInterval(saveGame, 5000);
