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
    const anim = ANIMATIONS[this.state] || ANIMATIONS.idle;
    return anim.frames[this.animFrame % anim.frames.length];
  }

  update(dt) {
    if (!this.alive) return;

    this.animTimer += dt;
    const anim = ANIMATIONS[this.state] || ANIMATIONS.idle;
    if (this.animTimer >= 1 / anim.speed) {
      this.animTimer -= 1 / anim.speed;
      this.animFrame++;
    }

    if (this.vy < 0) {
      this.state = 'jump';
    } else if (!this.onGround) {
      this.state = 'jump';
      if (this.animFrame >= anim.frames.length) {
        this.animFrame = anim.frames.length - 1;
      }
    } else if (Math.abs(this.vx) > 0.5) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }

    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

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
      const f = charFrame(8, 0);
      ctx.drawImage(
        spritesheet, f.sx, f.sy, f.sw, f.sh,
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