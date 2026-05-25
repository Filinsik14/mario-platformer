const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

const TILE_SRC = 18;
const TILE_GAP = 1;
const TILE_SCALE = 3;
const TILE = TILE_SRC * TILE_SCALE;

const CHAR_SRC = 24;
const CHAR_GAP = 1;
const CHAR_SCALE = 3;
const CHAR = CHAR_SRC * CHAR_SCALE;

const GRAVITY = 0.55;
const JUMP_FORCE = -11;
const MOVE_SPEED = 4.5;
const MAX_FALL = 13;

const WORLD_TILES = 120;
const WORLD_PX = WORLD_TILES * TILE;

const GROUND_Y = 10;

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const R_KEY = 82;

function frame(col, row, size, gap) {
  return {
    sx: col * (size + gap) + gap,
    sy: row * (size + gap) + gap,
    sw: size,
    sh: size
  };
}

function tileFrame(col, row) {
  return frame(col, row, TILE_SRC, TILE_GAP);
}

function charFrame(col, row) {
  return frame(col, row, CHAR_SRC, CHAR_GAP);
}

const ANIMATIONS = {
  idle: {
    frames: [charFrame(0, 0), charFrame(1, 0)],
    speed: 4
  },
  run: {
    frames: [charFrame(2, 0), charFrame(3, 0), charFrame(4, 0), charFrame(5, 0)],
    speed: 10
  },
  jump: {
    frames: [charFrame(6, 0), charFrame(7, 0)],
    speed: 3
  }
};

const ENEMY_SPRITES = [
  charFrame(0, 2),
  charFrame(1, 2)
];

const TILE_GROUND_TOP = tileFrame(0, 0);
const TILE_GROUND_INNER = tileFrame(1, 0);
const TILE_PLATFORM = tileFrame(2, 0);
const TILE_BRICK = tileFrame(3, 0);
const TILE_COIN = tileFrame(9, 0);
const TILE_DECO = tileFrame(4, 3);
const TILE_FLAG_POLE = tileFrame(13, 0);
const TILE_FLAG_TOP = tileFrame(14, 0);

const keys = {};
let jumpPressed = false;