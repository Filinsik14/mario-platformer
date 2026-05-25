const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

document.addEventListener('keydown', (e) => {
  if (!keys[e.keyCode]) {
    if (game && game.state === 'menu') {
      if (e.keyCode >= 49 && e.keyCode <= 51) {
        game.selectLevel(e.keyCode - 49);
      }
    }
    if ((e.keyCode === SPACE || e.keyCode === UP) && game && game.state === 'playing') {
      game.player.jump();
    }
    if ((e.keyCode === R_KEY || e.keyCode === ENTER_KEY) && game &&
        (game.state === 'gameover' || game.state === 'win')) {
      game.selectLevel(0);
    }
  }
  keys[e.keyCode] = true;
  if (e.keyCode === SPACE || e.keyCode === UP) e.preventDefault();
});

canvas.addEventListener('click', (e) => {
  if (!game || game.state !== 'menu') return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
  const my = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

  const btnW = 140, btnH = 140, gap = 40;
  const totalW = 3 * btnW + 2 * gap;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const btnY = 250;

  for (let i = 0; i < 3; i++) {
    const bx = startX + i * (btnW + gap);
    if (mx >= bx && mx <= bx + btnW && my >= btnY && my <= btnY + btnH) {
      game.selectLevel(i);
      return;
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.keyCode] = false;
});

let game = null;
let lastTime = 0;

function loadImages() {
  return new Promise((resolve) => {
    const charSheet = new Image();
    const tileSheet = new Image();

    let loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded === 2) resolve({ charSheet, tileSheet });
    }

    charSheet.onload = onLoad;
    tileSheet.onload = onLoad;

    charSheet.onerror = () => {
      console.error('Failed to load characters spritesheet');
      onLoad();
    };
    tileSheet.onerror = () => {
      console.error('Failed to load tiles spritesheet');
      onLoad();
    };

    charSheet.src = 'assets/Tilemap/tilemap-characters_packed.png';
    tileSheet.src = 'assets/Tilemap/tilemap_packed.png';
  });
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (keys[LEFT]) {
    if (game && game.state === 'playing') game.player.moveLeft();
  } else if (keys[RIGHT]) {
    if (game && game.state === 'playing') game.player.moveRight();
  } else {
    if (game && game.state === 'playing') game.player.stop();
  }

  if (game) {
    game.update(dt);
    game.draw();
  }

  requestAnimationFrame(gameLoop);
}

loadImages().then(({ charSheet, tileSheet }) => {
  game = new Game(canvas, charSheet, tileSheet);
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
});