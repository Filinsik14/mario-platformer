class Game {
  constructor(canvas, charSheet, tileSheet) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.charSheet = charSheet;
    this.tileSheet = tileSheet;

    this.level = new Level();
    this.player = new Player(3 * TILE, GROUND_Y * TILE - CHAR);
    this.enemies = this.level.enemies.map(e =>
      new Enemy(e.x, e.y, e.patrolMin, e.patrolMax)
    );
    this.coins = this.level.coins.map(c => ({ x: c.x, y: c.y, collected: false }));
    this.coinAnimTimer = 0;
    this.coinAnimFrame = 0;

    this.camera = { x: 0, y: 0 };
    this.score = 0;
    this.state = 'playing';

    this.hudWidth = CANVAS_WIDTH;
  }

  reset() {
    this.player = new Player(3 * TILE, GROUND_Y * TILE - CHAR);
    this.enemies = this.level.enemies.map(e =>
      new Enemy(e.x, e.y, e.patrolMin, e.patrolMax)
    );
    this.coins = this.level.coins.map(c => ({ x: c.x, y: c.y, collected: false }));
    this.coinAnimTimer = 0;
    this.coinAnimFrame = 0;
    this.camera = { x: 0, y: 0 };
    this.score = 0;
    this.state = 'playing';
  }

  get coinsCollected() {
    return this.coins.filter(c => c.collected).length;
  }

  update(dt) {
    if (this.state === 'gameover' || this.state === 'win') {
      return;
    }

    this.player.update(dt);

    for (const e of this.enemies) {
      if (e.alive) e.update(dt);
    }

    this.coinAnimTimer += dt;
    if (this.coinAnimTimer >= 1 / 6) {
      this.coinAnimTimer -= 1 / 6;
      this.coinAnimFrame++;
    }

    this.handleCollisions();
    this.updateCamera();

    if (this.player.x > this.level.goalX) {
      this.state = 'win';
    }

    if (!this.player.alive && this.player.y > GROUND_Y * TILE + 300) {
      this.state = 'gameover';
    }
  }

  handleCollisions() {
    const p = this.player;
    const pb = p.getBounds();
    p.onGround = false;

    if (p.alive) {
      if (p.x < 0) { p.x = 0; p.vx = 0; }

      for (const plat of this.level.platforms) {
        if (pb.x + pb.w > plat.x && pb.x < plat.x + plat.w) {
          const overlapTop = (pb.y + pb.h) - plat.y;
          const overlapBottom = (plat.y + plat.h) - pb.y;
          const overlapLeft = (pb.x + pb.w) - plat.x;
          const overlapRight = (plat.x + plat.w) - pb.x;

          const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

          if (minOverlap === overlapTop && p.vy >= 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.onGround = true;
          } else if (minOverlap === overlapBottom && p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          } else if (minOverlap === overlapLeft) {
            p.x = plat.x + plat.w;
            p.vx = 0;
          } else if (minOverlap === overlapRight) {
            p.x = plat.x - pb.w - 6;
            p.vx = 0;
          }
        }
      }

      const pBounds = p.getBounds();

      for (const e of this.enemies) {
        if (!e.alive) continue;
        const eb = e.getBounds();

        if (pBounds.x < eb.x + eb.w && pBounds.x + pBounds.w > eb.x &&
            pBounds.y < eb.y + eb.h && pBounds.y + pBounds.h > eb.y) {

          const fromAbove = p.vy > 0 && pBounds.y + pBounds.h - 10 <= eb.y + 10;

          if (fromAbove && !e.squished) {
            e.stomp();
            p.vy = JUMP_FORCE * 0.6;
            this.score += 100;
          } else if (!e.squished) {
            if (p.die()) {
              this.score = Math.max(0, this.score - 50);
            }
          }
        }
      }

      for (const c of this.coins) {
        if (c.collected) continue;
        const dx = p.x + p.w / 2 - (c.x + TILE / 2);
        const dy = p.y + p.h / 2 - (c.y + TILE / 2);
        if (Math.abs(dx) < TILE && Math.abs(dy) < TILE) {
          c.collected = true;
          this.score += 50;
        }
      }
    }

    if (p.y > CANVAS_HEIGHT + 200) {
      if (p.alive) p.die();
      this.state = 'gameover';
    }
  }

  updateCamera() {
    const targetX = this.player.x - CANVAS_WIDTH / 2 + this.player.w / 2;
    const targetY = this.player.y - CANVAS_HEIGHT / 2 + this.player.h / 2;

    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    this.camera.x = Math.max(0, Math.min(this.camera.x, WORLD_PX - CANVAS_WIDTH));
    this.camera.y = Math.max(0, Math.min(this.camera.y, 0));
  }

  draw() {
    const ctx = this.ctx;

    this.level.drawBackground(ctx, this.camera.x);

    this.level.drawPlatforms(ctx, this.tileSheet, this.camera.x);

    this.level.drawCoins(ctx, this.tileSheet, this.camera.x, this.coins);

    for (const e of this.enemies) {
      e.draw(ctx, this.charSheet, this.camera.x, this.camera.y);
    }

    this.level.drawFlag(ctx, this.tileSheet, this.camera.x);

    this.player.draw(ctx, this.charSheet, this.camera.x, this.camera.y);

    this.drawHUD(ctx);

    if (this.state === 'gameover') {
      this.drawOverlay(ctx, 'GAME OVER', '#e94560', 'Press R to restart');
    } else if (this.state === 'win') {
      this.drawOverlay(ctx, 'YOU WIN!', '#4ecca3', 'Press R to play again');
    }
  }

  drawHUD(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + this.score, 20, 28);

    ctx.textAlign = 'right';
    ctx.fillText('COINS: ' + this.coinsCollected + '/' + this.coins.length, CANVAS_WIDTH - 20, 28);

    ctx.fillStyle = '#4ecca3';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARROWS: Move  |  SPACE: Jump', CANVAS_WIDTH / 2, 28);
  }

  drawOverlay(ctx, title, color, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = color;
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(sub || '', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px monospace';
    ctx.fillText('Score: ' + this.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }
}