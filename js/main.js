const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

document.addEventListener('keydown', (e) => {
  if (!keys[e.keyCode]) {
    if ((e.keyCode === SPACE || e.keyCode === UP) && game && game.state === 'playing') {
      game.player.jump();
    }
  }
  keys[e.keyCode] = true;
  if (e.keyCode === SPACE || e.keyCode === UP) e.preventDefault();
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