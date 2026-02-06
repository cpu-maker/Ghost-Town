// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 60);

// Camera (first-person-ish)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Moonlight
const moonLight = new THREE.DirectionalLight(0xaaaaff, 0.6);
moonLight.position.set(10, 20, 10);
scene.add(moonLight);

const ambient = new THREE.AmbientLight(0x404060, 0.3);
scene.add(ambient);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Simple buildings
function createBuilding(x, z) {
  const height = Math.random() * 4 + 2;
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(2, height, 2),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  building.position.set(x, height / 2, z);
  scene.add(building);
}

for (let i = 0; i < 40; i++) {
  createBuilding(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40
  );
}

// Controls
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Mouse look
let yaw = 0;
document.addEventListener("mousemove", e => {
  yaw -= e.movementX * 0.002;
  camera.rotation.y = yaw;
});

// Game loop
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.05;
  if (keys["w"]) camera.translateZ(-speed);
  if (keys["s"]) camera.translateZ(speed);
  if (keys["a"]) camera.translateX(-speed);
  if (keys["d"]) camera.translateX(speed);

  renderer.render(scene, camera);
}

animate();
