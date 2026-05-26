class Enemy {
  constructor(x, y, patrolMin, patrolMax) {
    this.x = x;
    this.y = y;
    this.w = CHAR;
    this.h = CHAR;
    this.vx = -1.5;
    this.vy = 0;
    this.patrolMin = patrolMin || x - 150;
    this.patrolMax = patrolMax || x + 150;
    this.alive = true;
    this.onGround = false;
    this.animTimer = 0;
    this.animFrame = 0;
    this.squished = false;
    this.squishTimer = 0;
  }

  update(dt) {
    if (!this.alive) return;

    if (this.squished) {
      this.squishTimer -= dt;
      if (this.squishTimer <= 0) this.alive = false;
      return;
    }

    this.animTimer += dt;
    if (this.animTimer >= 1 / 5) {
      this.animTimer -= 1 / 5;
      this.animFrame++;
    }

    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= this.patrolMin) {
      this.x = this.patrolMin;
      this.vx = Math.abs(this.vx);
    }
    if (this.x + this.w >= this.patrolMax) {
      this.x = this.patrolMax - this.w;
      this.vx = -Math.abs(this.vx);
    }
  }

  stomp() {
    this.squished = true;
    this.squishTimer = 0.5;
    this.vx = 0;
    this.vy = 0;
  }

  getBounds() {
    return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 };
  }

  draw(ctx, spritesheet, camX, camY) {
    if (!this.alive) return;

    const frame = ENEMY_SPRITES[this.animFrame % ENEMY_SPRITES.length];

    if (this.squished) {
      ctx.save();
      ctx.drawImage(
        spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
        Math.round(this.x - camX), Math.round(this.y - camY + this.h / 2), this.w, this.h / 2
      );
      ctx.restore();
      return;
    }

    ctx.drawImage(
      spritesheet, frame.sx, frame.sy, frame.sw, frame.sh,
      Math.round(this.x - camX), Math.round(this.y - camY), this.w, this.h
    );
  }
}