class Level {
  constructor() {
    this.platforms = [];
    this.enemies = [];
    this.coins = [];
    this.flagX = 0;
    this.goalX = 0;
    this.build();
  }

  build() {
    const groundY = GROUND_Y * TILE;

    for (let i = 0; i < WORLD_TILES; i++) {
      if ((i >= 28 && i <= 30) || (i >= 55 && i <= 57) || (i >= 82 && i <= 84)) continue;
      this.platforms.push({
        x: i * TILE, y: groundY, w: TILE, h: TILE * 2,
        type: i % 2 === 0 ? 'groundTop' : 'groundInner'
      });
    }

    const plat1 = { x: 12 * TILE, y: groundY - 4 * TILE, w: 4 * TILE, h: TILE, type: 'platform' };
    const plat2 = { x: 22 * TILE, y: groundY - 3 * TILE, w: 3 * TILE, h: TILE, type: 'platform' };
    const plat3 = { x: 35 * TILE, y: groundY - 5 * TILE, w: 5 * TILE, h: TILE, type: 'platform' };
    const plat4 = { x: 45 * TILE, y: groundY - 3 * TILE, w: 3 * TILE, h: TILE, type: 'platform' };
    const plat5 = { x: 50 * TILE, y: groundY - 4 * TILE, w: 4 * TILE, h: TILE, type: 'platform' };
    const plat6 = { x: 65 * TILE, y: groundY - 3 * TILE, w: 3 * TILE, h: TILE, type: 'platform' };
    const plat7 = { x: 72 * TILE, y: groundY - 5 * TILE, w: 4 * TILE, h: TILE, type: 'platform' };
    const plat8 = { x: 85 * TILE, y: groundY - 3 * TILE, w: 3 * TILE, h: TILE, type: 'platform' };
    const plat9 = { x: 95 * TILE, y: groundY - 4 * TILE, w: 5 * TILE, h: TILE, type: 'platform' };

    this.platforms.push(plat1, plat2, plat3, plat4, plat5, plat6, plat7, plat8, plat9);

    this.enemies = [
      { x: 14 * TILE, y: groundY - CHAR, patrolMin: 10 * TILE, patrolMax: 18 * TILE },
      { x: 38 * TILE, y: groundY - CHAR, patrolMin: 34 * TILE, patrolMax: 42 * TILE },
      { x: 60 * TILE, y: groundY - CHAR, patrolMin: 56 * TILE, patrolMax: 64 * TILE },
      { x: 75 * TILE, y: groundY - CHAR, patrolMin: 72 * TILE, patrolMax: 80 * TILE },
      { x: 100 * TILE, y: groundY - CHAR, patrolMin: 96 * TILE, patrolMax: 105 * TILE }
    ];

    this.coins = [
      { x: 260, y: groundY - 3 * TILE },
      { x: 320, y: groundY - 3 * TILE },
      { x: 500, y: groundY - 3 * TILE },
      { x: 580, y: groundY - 3 * TILE },
      { x: 660, y: groundY - 3 * TILE },
      { x: 12 * TILE + TILE, y: groundY - 6 * TILE },
      { x: 12 * TILE + 3 * TILE, y: groundY - 6 * TILE },
      { x: 22 * TILE + TILE, y: groundY - 5 * TILE },
      { x: 35 * TILE + TILE, y: groundY - 7 * TILE },
      { x: 35 * TILE + 3 * TILE, y: groundY - 7 * TILE },
      { x: 45 * TILE + TILE, y: groundY - 5 * TILE },
      { x: 50 * TILE + TILE, y: groundY - 6 * TILE },
      { x: 50 * TILE + 3 * TILE, y: groundY - 6 * TILE },
      { x: 65 * TILE + TILE, y: groundY - 5 * TILE },
      { x: 72 * TILE + TILE, y: groundY - 7 * TILE },
      { x: 72 * TILE + 3 * TILE, y: groundY - 7 * TILE },
      { x: 85 * TILE + TILE, y: groundY - 5 * TILE },
      { x: 95 * TILE + TILE, y: groundY - 6 * TILE },
      { x: 95 * TILE + 3 * TILE, y: groundY - 6 * TILE },
      { x: 105 * TILE, y: groundY - 4 * TILE }
    ];

    this.flagX = (WORLD_TILES - 3) * TILE;
    this.goalX = this.flagX;
  }

  getSolidAt(x, y, w, h) {
    const margin = 2;
    for (const p of this.platforms) {
      if (
        x + w - margin > p.x && x + margin < p.x + p.w &&
        y + h > p.y && y < p.y + p.h
      ) {
        return p;
      }
    }
    return null;
  }

  drawBackground(ctx, camX) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#4dc9f6');
    skyGrad.addColorStop(0.6, '#87ceeb');
    skyGrad.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

    for (let i = -1; i < 3; i++) {
      const cx = i * CANVAS_WIDTH + (CANVAS_WIDTH * 0.3 + cloudX * 0.7) % CANVAS_WIDTH;
      ctx.beginPath();
      ctx.arc(cx + 200, 120, 25, 0, Math.PI * 2);
      ctx.arc(cx + 220, 110, 20, 0, Math.PI * 2);
      ctx.arc(cx + 240, 115, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    const distMountains = [
      80, 120, 240, 180, 300, 200, 350, 150, 280, 320, 190, 260, 310, 170, 290
    ];
    ctx.fillStyle = 'rgba(100,160,180,0.3)';
    for (let i = 0; i < distMountains.length; i++) {
      const baseX = (i * 250 - camX * 0.2) % (CANVAS_WIDTH * 2);
      const h = distMountains[i];
      ctx.beginPath();
      ctx.moveTo(baseX, CANVAS_HEIGHT);
      ctx.lineTo(baseX + 80, CANVAS_HEIGHT - h);
      ctx.lineTo(baseX + 160, CANVAS_HEIGHT);
      ctx.fill();
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
    for (const c of coins) {
      const drawX = Math.round(c.x - camX);
      const drawY = Math.round(c.y);
      if (drawX > -TILE && drawX < CANVAS_WIDTH + TILE) {
        const coinTile = TILE_COIN;
        ctx.drawImage(
          tilesheet, coinTile.sx, coinTile.sy, coinTile.sw, coinTile.sh,
          drawX + 8, drawY + 8, TILE, TILE
        );
      }
    }
  }

  drawFlag(ctx, tilesheet, camX) {
    const fx = this.flagX;
    const fy = GROUND_Y * TILE;
    const drawX = Math.round(fx - camX);

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