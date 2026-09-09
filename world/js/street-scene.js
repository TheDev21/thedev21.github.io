class StreetScene extends Phaser.Scene {
  constructor() { super('StreetScene'); }

  init(data) {
    this.characterKey = data.character || 'char_male';
  }

  preload() {
    this.makeSkylineTexture();
    this.makeBuildingTexture();
    this.makeGroundTexture();
    this.makeBillboardTexture('billboard_orange', 0xff3300);
    this.makeBillboardTexture('billboard_cyan', 0x00d4ff);
    this.makeBillboardTexture('billboard_purple', 0xa855f7);
  }

  // A larger, distinct foreground building meant to represent a single project.
  makeBillboardTexture(key, neon) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 220, h = 520;
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, w, h);
    g.lineStyle(2, neon, 0.5);
    g.strokeRect(0, 0, w, h);
    // window grid
    g.fillStyle(neon, 0.22);
    for (let wx = 14; wx < w - 14; wx += 20) {
      for (let wy = 60; wy < h - 20; wy += 26) {
        if (Math.random() < 0.6) g.fillRect(wx, wy, 12, 16);
      }
    }
    // neon trim strip near top for the sign area
    g.fillStyle(neon, 0.9);
    g.fillRect(0, 30, w, 4);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeSkylineTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 1200, h = 400;
    g.fillStyle(0x0a0a12, 1);
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) {
      const bw = Phaser.Math.Between(40, 90);
      const bh = Phaser.Math.Between(120, 320);
      const bx = i * 55;
      g.fillStyle(0x10101a, 1);
      g.fillRect(bx, h - bh, bw, bh);
      // sparse lit windows
      g.fillStyle(0x2a1a10, 1);
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
        for (let wy = h - bh + 8; wy < h - 8; wy += 14) {
          if (Math.random() < 0.15) g.fillRect(wx, wy, 3, 5);
        }
      }
    }
    g.generateTexture('skyline', w, h);
    g.destroy();
  }

  makeBuildingTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 1200, h = 500;
    for (let i = 0; i < 14; i++) {
      const bw = Phaser.Math.Between(90, 160);
      const bh = Phaser.Math.Between(260, 480);
      const bx = i * 90;
      g.fillStyle(0x0d0d0d, 1);
      g.fillRect(bx, h - bh, bw, bh);
      g.lineStyle(1, 0xff3300, 0.15);
      g.strokeRect(bx, h - bh, bw, bh);
      // neon accent windows
      const glow = Math.random() < 0.5 ? 0xff3300 : 0x00d4ff;
      g.fillStyle(glow, 0.5);
      for (let wx = bx + 8; wx < bx + bw - 8; wx += 14) {
        for (let wy = h - bh + 10; wy < h - 10; wy += 20) {
          if (Math.random() < 0.2) g.fillRect(wx, wy, 5, 8);
        }
      }
    }
    g.generateTexture('buildings', w, h);
    g.destroy();
  }

  makeGroundTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 400, h = 80;
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(0, 0, w, 4);
    g.fillStyle(0xff3300, 0.4);
    for (let x = 0; x < w; x += 40) g.fillRect(x, h / 2, 20, 2);
    g.generateTexture('ground', w, h);
    g.destroy();
  }

  create() {
    const { width, height } = this.scale;
    const worldWidth = 4000;

    this.cameras.main.setBackgroundColor('#050505');
    this.physics.world.setBounds(0, 0, worldWidth, height);

    // Parallax layers (far -> near). scrollFactor stays 0; we drive the scroll
    // illusion manually via tilePositionX in update() so speeds can differ per layer.
    this.skylineLayer = this.add.tileSprite(0, height - 400, width, 400, 'skyline')
      .setOrigin(0, 0).setScrollFactor(0);
    this.buildingLayer = this.add.tileSprite(0, height - 500, width, 500, 'buildings')
      .setOrigin(0, 0).setScrollFactor(0);
    this.groundLayer = this.add.tileSprite(0, height - 80, worldWidth, 80, 'ground')
      .setOrigin(0, 0).setScrollFactor(1);

    // Sample project billboards (static preview — proximity glow/prompt comes in a later step)
    this.addBillboard(600, height, 'billboard_orange', '#ff3300', 'DATALENS', 'SQL ANALYZER');
    this.addBillboard(1000, height, 'billboard_cyan', '#00d4ff', 'CHESS', 'AI ENGINE');
    this.addBillboard(1400, height, 'billboard_purple', '#a855f7', 'COSMOS', 'GRAVITY SIM');

    // Arcade alley marker (placeholder for later step)
    this.add.text(worldWidth * 0.35, height - 520, 'ARCADE ->', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff3300'
    }).setScrollFactor(1).setAlpha(0.8);

    // Player
    this.player = this.physics.add.sprite(200, height - 100, this.characterKey);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2.2);
    this.player.body.setSize(16, 40);
    this.player.body.setOffset(8, 8);

    this.cameras.main.setBounds(0, 0, worldWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.speed = 220;

    this.hint = this.add.text(width / 2, 24, 'WASD / Arrow keys to walk', {
      fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.5)'
    }).setScrollFactor(0).setOrigin(0.5);
  }

  addBillboard(x, groundY, textureKey, colorHex, titleText, subText) {
    const img = this.add.image(x, groundY - 80, textureKey).setOrigin(0.5, 1);

    this.add.text(x, groundY - 500, titleText, {
      fontFamily: 'monospace', fontSize: '18px', color: colorHex, letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0.95);

    this.add.text(x, groundY - 478, subText, {
      fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: 1
    }).setOrigin(0.5);

    // gentle pulse to hint these will be interactive later
    this.tweens.add({
      targets: img, alpha: { from: 1, to: 0.75 }, duration: 1800 + Math.random() * 800,
      yoyo: true, repeat: -1
    });
  }

  update() {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;

    let vx = 0;
    if (left) vx = -this.speed;
    else if (right) vx = this.speed;

    this.player.setVelocityX(vx);
    if (vx !== 0) this.player.setFlipX(vx < 0);

    // Parallax scroll tied to camera scrollX via scrollFactor already handles this,
    // but we nudge tileSprite tilePosition for a smoother street-scroll feel.
    this.skylineLayer.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.buildingLayer.tilePositionX = this.cameras.main.scrollX * 0.55;
  }
}
