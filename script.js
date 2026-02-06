const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 48;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

// 0 = dirt road, 1 = building, 2 = fence
const map = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
  const row = [];
  for (let x = 0; x < MAP_WIDTH; x++) {
    if (Math.random() < 0.12) row.push(1);
    else if (Math.random() < 0.05) row.push(2);
    else row.push(0);
  }
  map.push(row);
}

const player = {
  x: 5,
  y: 5,
  speed: 0.08
};

let keys = {};
let showMap = false;

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "m") showMap = !showMap;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function update() {
  let dx = 0, dy = 0;
  if (keys["w"] || keys["arrowup"]) dy -= player.speed;
  if (keys["s"] || keys["arrowdown"]) dy += player.speed;
  if (keys["a"] || keys["arrowleft"]) dx -= player.speed;
  if (keys["d"] || keys["arrowright"]) dx += player.speed;

  const nx = player.x + dx;
  const ny = player.y + dy;

  if (
    map[Math.floor(ny)] &&
    map[Math.floor(ny)][Math.floor(nx)] === 0
  ) {
    player.x = nx;
    player.y = ny;
  }
}

function drawWorld() {
  const camX = player.x * TILE_SIZE - canvas.width / 2;
  const camY = player.y * TILE_SIZE - canvas.height / 2;

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = map[y][x];
      const sx = x * TILE_SIZE - camX;
      const sy = y * TILE_SIZE - camY;

      if (tile === 0) ctx.fillStyle = "#2b2b2b";
      if (tile === 1) ctx.fillStyle = "#1a1a1a";
      if (tile === 2) ctx.fillStyle = "#333";

      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    }
  }

  // Player
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(
    player.x * TILE_SIZE - camX + TILE_SIZE / 2,
    player.y * TILE_SIZE - camY + TILE_SIZE / 2,
    10,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawFog() {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    60,
    canvas.width / 2,
    canvas.height / 2,
    300
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMapOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(50, 30, 754, 420);

  const scaleX = 754 / MAP_WIDTH;
  const scaleY = 420 / MAP_HEIGHT;

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === 1) ctx.fillStyle = "#555";
      else if (map[y][x] === 2) ctx.fillStyle = "#777";
      else ctx.fillStyle = "#222";

      ctx.fillRect(
        50 + x * scaleX,
        30 + y * scaleY,
        scaleX,
        scaleY
      );
    }
  }

  ctx.fillStyle = "red";
  ctx.fillRect(
    50 + player.x * scaleX,
    30 + player.y * scaleY,
    scaleX,
    scaleY
  );

  ctx.fillStyle = "#fff";
  ctx.fillText("MAP — Press M to Close", 60, 50);
}

function gameLoop() {
  update();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld();
  drawFog();

  if (showMap) drawMapOverlay();

  requestAnimationFrame(gameLoop);
}

gameLoop();
