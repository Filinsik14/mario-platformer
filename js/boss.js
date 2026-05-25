class Boss {
  constructor(x, y, patrolMin, patrolMax) {
    this.x = x;
    this.y = y;
    this.w = CHAR;
    this.h = CHAR;
    this.vx = -1;
    this.vy = 0;
    this.patrolMin = patrolMin || x - 200;
    this.patrolMax = patrolMax || x + 200;
    this.alive = true;
    this.hp = 3;
    this.maxHp = 3;
    this.onGround = false;
    this.animTimer = 0;
    this.animFrame = 0;
    this.invincible = 0;
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

    if (this.invincible > 0) this.invincible -= dt;

    this.animTimer += dt;
    if (this.animTimer >= 1 / 4) {
      this.animTimer -= 1 / 4;
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
    if (this.invincible > 0 || this.squished) return false;
    this.hp--;
    if (this.hp <= 0) {
      this.squished = true;
      this.squishTimer = 0.5;
      this.vx = 0;
      this.vy = 0;
      return true;
    }
    this.invincible = 1.2;
    this.vy = -7;
    return true;
  }

  getBounds() {
    return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 };
  }

  draw(ctx, spritesheet, camX, camY) {
    if (!this.alive) return;

    const drawX = Math.round(this.x - camX);
    const drawY = Math.round(this.y - camY);
    if (drawX < -this.w || drawX > CANVAS_WIDTH + this.w) return;

    ctx.save();

    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.squished) {
      ctx.drawImage(spritesheet, BOSS_SPRITE.sx, BOSS_SPRITE.sy, BOSS_SPRITE.sw, BOSS_SPRITE.sh,
        drawX, drawY + this.h * 0.5, this.w, this.h * 0.5);
    } else {
      ctx.drawImage(spritesheet, BOSS_SPRITE.sx, BOSS_SPRITE.sy, BOSS_SPRITE.sw, BOSS_SPRITE.sh,
        drawX, drawY, this.w, this.h);
    }

    ctx.restore();

    const heartY = drawY - 18;
    const heartSpacing = 22;
    const startX = drawX + (this.w - this.maxHp * heartSpacing) / 2;
    for (let i = 0; i < this.maxHp; i++) {
      ctx.fillStyle = i < this.hp ? '#ff3333' : '#555555';
      ctx.font = '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('♥', startX + i * heartSpacing + 9, heartY);
    }
  }
}