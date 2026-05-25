class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = CHAR;
    this.h = CHAR;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facingRight = true;
    this.state = 'idle';
    this.animTimer = 0;
    this.animFrame = 0;
    this.alive = true;
    this.invincible = 0;
    this.coins = 0;
  }

  getFrame() {
    if (this.state === 'jump') {
      return this.vy < 0 ? ANIM_JUMP_UP : ANIM_JUMP_DOWN;
    }
    const frames = this.state === 'run' ? ANIM_RUN : ANIM_IDLE;
    return frames[this.animFrame % frames.length];
  }

  update(dt) {
    if (!this.alive) {
      this.vy += GRAVITY;
      this.x += this.vx;
      this.y += this.vy;
      return;
    }

    if (this.state === 'jump' && this.vy < 0 && (keys[SPACE] || keys[UP])) {
      this.vy += GRAVITY * 0.55;
    } else {
      this.vy += GRAVITY;
    }
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    const prevState = this.state;
    if (!this.onGround) {
      this.state = 'jump';
    } else if (Math.abs(this.vx) > 0.5) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }

    if (this.state !== prevState) {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    this.animTimer += dt;
    if (this.state !== 'jump') {
      const frames = this.state === 'run' ? ANIM_RUN : ANIM_IDLE;
      const speed = this.state === 'run' ? 10 : 4;
      if (this.animTimer >= 1 / speed) {
        this.animTimer -= 1 / speed;
        this.animFrame++;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.vx > 0) this.facingRight = true;
    else if (this.vx < 0) this.facingRight = false;

    if (this.invincible > 0) this.invincible -= dt;
  }

  jump() {
    if (this.onGround && this.alive) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.animFrame = 0;
    }
  }

  moveLeft() {
    if (!this.alive) return;
    this.vx = -MOVE_SPEED;
  }

  moveRight() {
    if (!this.alive) return;
    this.vx = MOVE_SPEED;
  }

  stop() {
    this.vx = 0;
  }

  die() {
    if (this.invincible > 0) return false;
    this.alive = false;
    this.vy = JUMP_FORCE;
    return true;
  }

  draw(ctx, spritesheet, camX, camY) {
    if (!this.alive) {
      ctx.drawImage(
        spritesheet, ANIM_DEATH.sx, ANIM_DEATH.sy, ANIM_DEATH.sw, ANIM_DEATH.sh,
        Math.round(this.x - camX), Math.round(this.y - camY), this.w, this.h
      );
      return;
    }

    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;

    const f = this.getFrame();
    ctx.save();
    if (!this.facingRight) {
      ctx.translate(Math.round(this.x - camX) + this.w, Math.round(this.y - camY));
      ctx.scale(-1, 1);
      ctx.drawImage(spritesheet, f.sx, f.sy, f.sw, f.sh, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(
        spritesheet, f.sx, f.sy, f.sw, f.sh,
        Math.round(this.x - camX), Math.round(this.y - camY), this.w, this.h
      );
    }
    ctx.restore();
  }

  getBounds() {
    return { x: this.x + 6, y: this.y, w: this.w - 12, h: this.h };
  }
}