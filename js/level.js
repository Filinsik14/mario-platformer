class Level {
  constructor(levelNum) {
    this.levelNum = levelNum;
    this.platforms = [];
    this.enemies = [];
    this.coins = [];
    this.flagX = 0;
    this.goalX = 0;
    this.worldTiles = 60;
    this.build();
  }

  addGround(segments, y) {
    for (const s of segments) {
      for (let i = s[0]; i < s[1]; i++) {
        this.platforms.push({
          x: i * TILE, y, w: TILE, h: TILE * 2,
          type: i % 2 === 0 ? 'groundTop' : 'groundInner'
        });
      }
    }
  }

  addPlat(tileX, tileY, width) {
    const y = GROUND_Y * TILE - tileY * TILE;
    this.platforms.push({
      x: tileX * TILE, y, w: width * TILE, h: TILE, type: 'platform'
    });
    return { x: tileX * TILE, y, w: width * TILE };
  }

  addCoin(tileX, tileY) {
    const y = GROUND_Y * TILE - tileY * TILE;
    this.coins.push({ x: tileX * TILE + TILE / 2, y: y + TILE / 2 });
  }

  addEnemy(tileX, patrolMin, patrolMax) {
    const y = GROUND_Y * TILE - CHAR;
    this.enemies.push({
      x: tileX * TILE, y, patrolMin: patrolMin * TILE, patrolMax: patrolMax * TILE
    });
  }

  setGoal(tileX) {
    this.flagX = tileX * TILE;
    this.goalX = this.flagX;
    this.worldTiles = tileX + 4;
  }

  build() {
    const gY = GROUND_Y * TILE;

    if (this.levelNum === 0) {
      this.buildLevel1(gY);
    } else if (this.levelNum === 1) {
      this.buildLevel2(gY);
    } else {
      this.buildLevel3(gY);
    }
  }

  buildLevel1(gY) {
    this.addGround([[0, 26], [31, 50]], gY);
    this.addPlat(8, 3, 3);
    this.addPlat(16, 2, 2);
    this.addPlat(24, 3, 3);
    this.addPlat(35, 2, 4);
    this.addPlat(44, 3, 2);

    this.addCoin(9, 4);
    this.addCoin(10, 4);
    this.addCoin(45, 4);

    this.addEnemy(12, 8, 16);
    this.addEnemy(38, 35, 42);

    this.setGoal(54);
  }

  buildLevel2(gY) {
    this.addGround([[0, 23], [28, 52], [57, 75]], gY);
    this.addPlat(6, 3, 3);
    this.addPlat(14, 4, 2);
    this.addPlat(22, 2, 2);
    this.addPlat(30, 4, 3);
    this.addPlat(38, 3, 3);
    this.addPlat(46, 4, 2);
    this.addPlat(55, 3, 3);
    this.addPlat(64, 2, 3);

    this.addCoin(7, 4);
    this.addCoin(31, 5);
    this.addCoin(47, 5);

    this.addEnemy(10, 6, 16);
    this.addEnemy(35, 30, 40);
    this.addEnemy(50, 46, 55);

    this.setGoal(78);
  }

  buildLevel3(gY) {
    this.addGround([[0, 18], [23, 42], [47, 72], [77, 90]], gY);
    this.addPlat(5, 3, 2);
    this.addPlat(12, 5, 2);
    this.addPlat(20, 3, 2);
    this.addPlat(27, 4, 3);
    this.addPlat(35, 5, 2);
    this.addPlat(40, 3, 2);
    this.addPlat(50, 4, 3);
    this.addPlat(58, 5, 2);
    this.addPlat(65, 3, 2);
    this.addPlat(75, 4, 3);
    this.addPlat(82, 3, 2);
    this.addPlat(88, 2, 3);

    this.addCoin(13, 6);
    this.addCoin(36, 6);
    this.addCoin(59, 6);

    this.addEnemy(8, 5, 14);
    this.addEnemy(25, 23, 30);
    this.addEnemy(38, 35, 42);
    this.addEnemy(53, 50, 60);
    this.addEnemy(80, 75, 85);

    this.setGoal(93);
  }

  drawBackground(ctx, camX) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (this.levelNum === 0) {
      skyGrad.addColorStop(0, '#4dc9f6');
      skyGrad.addColorStop(0.6, '#87ceeb');
      skyGrad.addColorStop(1, '#b0e0e6');
    } else if (this.levelNum === 1) {
      skyGrad.addColorStop(0, '#2c3e50');
      skyGrad.addColorStop(0.6, '#34495e');
      skyGrad.addColorStop(1, '#5d6d7e');
    } else {
      skyGrad.addColorStop(0, '#1a0a2e');
      skyGrad.addColorStop(0.5, '#2d1b69');
      skyGrad.addColorStop(1, '#4a2c8a');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.levelNum === 0) {
      const cloudX = (0.1 * camX) % CANVAS_WIDTH;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = -1; i < 3; i++) {
        const cx = i * CANVAS_WIDTH + cloudX;
        ctx.beginPath();
        ctx.arc(cx, 60, 40, 0, Math.PI * 2);
        ctx.arc(cx + 30, 45, 30, 0, Math.PI * 2);
        ctx.arc(cx + 60, 55, 35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.levelNum === 1) {
      for (let i = 0; i < 8; i++) {
        const sx = (i * 140 - camX * 0.15) % (CANVAS_WIDTH * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(sx, 80 + i * 20, 15 + i * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const sx = (i * 180 - camX * 0.1) % (CANVAS_WIDTH * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath();
        ctx.arc(sx, 50 + i * 15, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawPlatforms(ctx, tilesheet, camX) {
    for (const p of this.platforms) {
      const tile = p.type === 'groundTop' ? TILE_GROUND_TOP
        : p.type === 'groundInner' ? TILE_GROUND_INNER
        : TILE_PLATFORM;

      for (let tx = 0; tx < p.w / TILE; tx++) {
        for (let ty = 0; ty < p.h / TILE; ty++) {
          const drawX = Math.round(p.x + tx * TILE - camX);
          const drawY = Math.round(p.y + ty * TILE);
          if (drawX > -TILE && drawX < CANVAS_WIDTH + TILE && drawY > -TILE && drawY < CANVAS_HEIGHT + TILE) {
            ctx.drawImage(
              tilesheet, tile.sx, tile.sy, tile.sw, tile.sh,
              drawX, drawY, TILE, TILE
            );
          }
        }
      }
    }
  }

  drawCoins(ctx, tilesheet, camX, coins) {
    const coinTile = TILE_COIN;
    for (const c of coins) {
      if (c.collected) continue;
      const drawX = Math.round(c.x - TILE / 2 - camX);
      const drawY = Math.round(c.y - TILE / 2);
      if (drawX > -TILE && drawX < CANVAS_WIDTH + TILE) {
        ctx.drawImage(
          tilesheet, coinTile.sx, coinTile.sy, coinTile.sw, coinTile.sh,
          drawX, drawY, TILE, TILE
        );
      }
    }
  }

  drawFlag(ctx, tilesheet, camX) {
    const fx = this.flagX;
    const fy = GROUND_Y * TILE;
    const drawX = Math.round(fx - camX);
    if (drawX < -TILE * 3 || drawX > CANVAS_WIDTH + TILE) return;

    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(drawX + 16, fy - i * TILE + 2, 6, TILE);
    }

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(drawX + 22, fy - 8 * TILE);
    ctx.lineTo(drawX + 22 + TILE * 1.5, fy - 7 * TILE);
    ctx.lineTo(drawX + 22, fy - 6 * TILE);
    ctx.fill();

    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GOAL', drawX + 22 + TILE * 0.75, fy - 7 * TILE + 4);
  }
}