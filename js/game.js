class Game {
  constructor(canvas, charSheet, tileSheet) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.charSheet = charSheet;
    this.tileSheet = tileSheet;
    this.currentLevel = 0;
    this.score = 0;
    this.coinEffects = [];
    this.state = 'menu';
  }

  selectLevel(n) {
    this.currentLevel = n;
    this.score = 0;
    this.startLevel();
  }

  startLevel() {
    this.level = new Level(this.currentLevel);
    this.player = new Player(3 * TILE, GROUND_Y * TILE - CHAR);
    this.enemies = this.level.enemies.map(e =>
      new Enemy(e.x, e.y, e.patrolMin, e.patrolMax)
    );
    this.boss = this.level.boss ? new Boss(this.level.boss.x, this.level.boss.y, this.level.boss.patrolMin, this.level.boss.patrolMax) : null;
    this.coins = this.level.coins.map(c => ({ x: c.x, y: c.y, collected: false }));
    this.camera = { x: 0, y: 0 };
    this.state = 'playing';
    this.transitionTimer = 0;
    this.coinEffects = [];
  }

  reset() { this.startLevel(); }

  get coinsCollected() { return this.coins.filter(c => c.collected).length; }

  update(dt) {
    if (this.state === 'gameover' || this.state === 'win') {
      this.updateCoinEffects(dt);
      return;
    }
    if (this.state === 'levelComplete') {
      this.transitionTimer += dt;
      this.updateCoinEffects(dt);
      if (this.transitionTimer > 1.5) {
        this.currentLevel++;
        if (this.currentLevel >= TOTAL_LEVELS) {
          this.state = 'win';
          this.transitionTimer = 0;
        } else {
          this.startLevel();
        }
      }
      return;
    }

    this.player.update(dt);
    for (const e of this.enemies) {
      if (e.alive) e.update(dt);
    }
    if (this.boss && this.boss.alive) this.boss.update(dt);

    this.handleCollisions();
    this.updateCamera();
    this.updateCoinEffects(dt);

    if (this.player.x > this.level.goalX) {
      this.state = this.currentLevel < TOTAL_LEVELS - 1 ? 'levelComplete' : 'win';
      this.transitionTimer = 0;
    }

    if (!this.player.alive && this.player.y > GROUND_Y * TILE + 300) {
      this.state = 'gameover';
    }
  }

  handleCollisions() {
    const p = this.player;
    const platforms = this.level.platforms;

    if (!p.alive) return;
    if (p.x < 0) { p.x = 0; p.vx = 0; }

    // --- Pass 1: Y-axis collisions (landing / ceiling) ---
    p.onGround = false;
    for (const plat of platforms) {
      const pb = p.getBounds();
      if (pb.x + pb.w > plat.x && pb.x < plat.x + plat.w &&
          pb.y + pb.h > plat.y && pb.y < plat.y + plat.h) {
        if (p.vy >= 0) {
          p.y = plat.y - p.h; p.vy = 0; p.onGround = true;
        } else {
          p.y = plat.y + plat.h; p.vy = 0;
        }
      }
    }

    // --- Pass 2: X-axis collisions (walls, only if deep vertical overlap) ---
    for (const plat of platforms) {
      const pb = p.getBounds();
      const vertOverlap = Math.min(pb.y + pb.h, plat.y + plat.h) - Math.max(pb.y, plat.y);
      if (vertOverlap > 16 &&
          pb.x + pb.w > plat.x && pb.x < plat.x + plat.w) {
        const ol = (pb.x + pb.w) - plat.x;
        const or = (plat.x + plat.w) - pb.x;
        if (ol < or) { p.x -= ol; } else { p.x += or; }
        p.vx = 0;
      }
    }

    // --- Player-enemy collisions ---
    const pb = p.getBounds();
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const eb = e.getBounds();
      if (pb.x < eb.x + eb.w && pb.x + pb.w > eb.x &&
          pb.y < eb.y + eb.h && pb.y + pb.h > eb.y) {
          const fromAbove = p.vy > 0 && pb.y + pb.h - 8 <= eb.y + 24;

          if (fromAbove && !e.squished) {
            e.stomp();
            p.vy = JUMP_FORCE * 0.8;
            this.score += 100;
          } else if (!e.squished) {
            if (p.die()) this.score = Math.max(0, this.score - 50);
          }
        }
      }

      // --- Player-boss collision ---
      if (this.boss && this.boss.alive) {
        const bb = this.boss.getBounds();
        if (pb.x < bb.x + bb.w && pb.x + pb.w > bb.x &&
            pb.y < bb.y + bb.h && pb.y + pb.h > bb.y) {
          const fromAbove = p.vy > 0 && pb.y + pb.h - 8 <= bb.y + 24;
        if (fromAbove && !this.boss.squished) {
          if (this.boss.stomp()) {
            p.vy = JUMP_FORCE * 0.8;
            this.score += 200;
          }
        } else if (!this.boss.squished) {
          if (p.die()) this.score = Math.max(0, this.score - 50);
        }
      }
    }

    // --- Coins ---
    for (const c of this.coins) {
      if (c.collected) continue;
      const dx = p.x + p.w / 2 - c.x;
      const dy = p.y + p.h / 2 - c.y;
      if (Math.abs(dx) < TILE && Math.abs(dy) < TILE) {
        c.collected = true;
        this.score += 50;
        this.coinEffects.push({ x: c.x, y: c.y, timer: 1 });
      }
    }

    // --- Enemy-platform collisions ---
    for (const e of this.enemies) {
      if (!e.alive || e.squished) continue;
      e.onGround = false;
      let eb = e.getBounds();
      for (const plat of platforms) {
        if (eb.x + eb.w > plat.x && eb.x < plat.x + plat.w &&
            eb.y + eb.h > plat.y && eb.y < plat.y + plat.h) {
          if (e.vy >= 0) {
            e.y = plat.y - e.h;
            e.vy = 0;
            e.onGround = true;
          } else {
            e.y = plat.y + plat.h;
            e.vy = 0;
            e.vx = -e.vx;
          }
          eb = e.getBounds();
        }
      }
    }

    // --- Boss-platform collisions ---
    if (this.boss && this.boss.alive && !this.boss.squished) {
      this.boss.onGround = false;
      let bb = this.boss.getBounds();
      for (const plat of platforms) {
        if (bb.x + bb.w > plat.x && bb.x < plat.x + plat.w &&
            bb.y + bb.h > plat.y && bb.y < plat.y + plat.h) {
          if (this.boss.vy >= 0) {
            this.boss.y = plat.y - this.boss.h;
            this.boss.vy = 0;
            this.boss.onGround = true;
          } else {
            this.boss.y = plat.y + plat.h;
            this.boss.vy = 0;
            this.boss.vx = -this.boss.vx;
          }
          bb = this.boss.getBounds();
        }
      }
    }

    if (p.y > CANVAS_HEIGHT + 200) {
      if (p.alive) p.die();
      this.state = 'gameover';
    }
  }

  updateCoinEffects(dt) {
    for (let i = this.coinEffects.length - 1; i >= 0; i--) {
      this.coinEffects[i].timer -= dt;
      if (this.coinEffects[i].timer <= 0) this.coinEffects.splice(i, 1);
    }
  }

  updateCamera() {
    const targetX = this.player.x - CANVAS_WIDTH / 2 + this.player.w / 2;
    const targetY = this.player.y - CANVAS_HEIGHT / 2 + this.player.h / 2;
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.level.worldTiles * TILE - CANVAS_WIDTH));
    this.camera.y = Math.max(0, Math.min(this.camera.y, 0));
  }

  draw() {
    const ctx = this.ctx;
    if (this.state === 'menu') {
      this.drawMenu(ctx);
      return;
    }

    this.level.drawBackground(ctx, this.camera.x);
    this.level.drawPlatforms(ctx, this.tileSheet, this.camera.x);
    this.level.drawCoins(ctx, this.tileSheet, this.camera.x, this.coins);

    for (const e of this.enemies) e.draw(ctx, this.charSheet, this.camera.x, this.camera.y);
    if (this.boss) this.boss.draw(ctx, this.charSheet, this.camera.x, this.camera.y);

    this.level.drawFlag(ctx, this.tileSheet, this.camera.x);
    this.player.draw(ctx, this.charSheet, this.camera.x, this.camera.y);
    this.drawCoinEffects(ctx);
    this.drawHUD(ctx);

    if (this.state === 'gameover') this.drawOverlay(ctx, 'GAME OVER', '#e94560', 'Press R to restart');
    else if (this.state === 'levelComplete') this.drawOverlay(ctx, 'LEVEL ' + (this.currentLevel + 1) + ' COMPLETE!', '#4ecca3', 'Get ready for next level...');
    else if (this.state === 'win') this.drawOverlay(ctx, 'YOU WIN!', '#f1c40f', 'Press R to play again');
  }

  drawMenu(ctx) {
    const levels = [
      { label: '1', color: '#4ecca3', bg: '#1a3a32' },
      { label: '2', color: '#e9c46a', bg: '#3a2e1a' },
      { label: '3', color: '#e94560', bg: '#3a1a24' }
    ];

    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#0f0f23');
    sky.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PIXEL PLATFORMER', CANVAS_WIDTH / 2, 120);

    ctx.fillStyle = '#8888aa';
    ctx.font = '20px monospace';
    ctx.fillText('SELECT LEVEL', CANVAS_WIDTH / 2, 175);

    const btnW = 140;
    const btnH = 140;
    const gap = 40;
    const totalW = levels.length * btnW + (levels.length - 1) * gap;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const btnY = 250;

    for (let i = 0; i < levels.length; i++) {
      const x = startX + i * (btnW + gap);
      ctx.fillStyle = levels[i].bg;
      ctx.fillRect(x, btnY, btnW, btnH);
      ctx.strokeStyle = levels[i].color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, btnY, btnW, btnH);

      ctx.fillStyle = levels[i].color;
      ctx.font = 'bold 52px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(levels[i].label, x + btnW / 2, btnY + btnH / 2);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Level ' + levels[i].label, x + btnW / 2, btnY + btnH + 30);
    }

    ctx.fillStyle = '#666688';
    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Click a level or press 1 / 2 / 3', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
  }

  drawCoinEffects(ctx) {
    for (const e of this.coinEffects) {
      ctx.save();
      ctx.globalAlpha = Math.min(e.timer * 2, 1);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+50', Math.round(e.x - this.camera.x), Math.round(e.y - this.camera.y - (1 - e.timer) * 60));
      ctx.restore();
    }
  }

  drawHUD(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LEVEL ' + (this.currentLevel + 1) + '/' + TOTAL_LEVELS, 16, 28);
    ctx.textAlign = 'center';
    ctx.fillText('SCORE: ' + this.score, CANVAS_WIDTH / 2 - 80, 28);
    ctx.fillStyle = this.coinsCollected === this.coins.length ? '#f1c40f' : '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('COINS: ' + this.coinsCollected + '/' + this.coins.length, CANVAS_WIDTH - 16, 28);
  }

  drawOverlay(ctx, title, color, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = color;
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(sub || '', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px monospace';
    ctx.fillText('Score: ' + this.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    if (this.state === 'gameover' || this.state === 'win') {
      ctx.fillStyle = '#888888';
      ctx.font = '14px monospace';
      ctx.fillText('Coins collected: ' + this.coinsCollected + '/' + this.coins.length, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 95);
    }
  }
}