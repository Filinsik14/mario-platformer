const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

const TILE_SRC = 18;
const TILE_SCALE = 3;
const TILE = TILE_SRC * TILE_SCALE;

const CHAR_SRC = 24;
const CHAR_SCALE = 3;
const CHAR = CHAR_SRC * CHAR_SCALE;

const GRAVITY = 0.22;
const JUMP_FORCE = -10;
const MOVE_SPEED = 4.5;
const MAX_FALL = 8;

const GROUND_Y = 10;

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const R_KEY = 82;
const ENTER_KEY = 13;

function packedFrame(col, row, size) {
  return { sx: col * size, sy: row * size, sw: size, sh: size };
}

function tileFrame(col, row) { return packedFrame(col, row, TILE_SRC); }
function charFrame(col, row) { return packedFrame(col, row, CHAR_SRC); }

const ANIM_IDLE = [charFrame(0, 0), charFrame(1, 0)];
const ANIM_RUN = [charFrame(2, 0), charFrame(3, 0), charFrame(4, 0), charFrame(5, 0)];
const ANIM_JUMP_UP = charFrame(6, 0);
const ANIM_JUMP_DOWN = charFrame(7, 0);
const ANIM_DEATH = charFrame(8, 0);

const ENEMY_SPRITES = [charFrame(0, 2), charFrame(1, 2)];
const BOSS_SPRITE = charFrame(2, 2);

const TILE_GROUND_TOP = tileFrame(0, 0);
const TILE_GROUND_INNER = tileFrame(1, 0);
const TILE_PLATFORM = tileFrame(2, 0);
const TILE_COIN = tileFrame(9, 0);

const TOTAL_LEVELS = 3;
const keys = {};