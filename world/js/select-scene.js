class SelectScene extends Phaser.Scene {
  constructor() { super('SelectScene'); }

  preload() {
    this.makeCharacterTexture('char_male', 0x00d4ff);
    this.makeCharacterTexture('char_female', 0xff3300);
  }

  // Draws a small placeholder pixel humanoid onto a texture so we don't need external art yet.
  makeCharacterTexture(key, glowColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 32, h = 48;
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(10, 0, 12, 12);           // head
    g.fillStyle(glowColor, 1);
    g.fillRect(8, 12, 16, 20);           // torso
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(8, 32, 6, 16);            // left leg
    g.fillRect(18, 32, 6, 16);           // right leg
    g.lineStyle(1, glowColor, 0.8);
    g.strokeRect(8, 12, 16, 20);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#050505');

    this.add.text(width / 2, height * 0.18, 'PORTFOLIO WORLD', {
      fontFamily: 'monospace', fontSize: '32px', color: '#ff3300', letterSpacing: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.18 + 40, 'Choose your character', {
      fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.5)'
    }).setOrigin(0.5);

    this.buildCard(width * 0.32, height * 0.55, 'char_male', 'MALE');
    this.buildCard(width * 0.68, height * 0.55, 'char_female', 'FEMALE');

    this.add.text(width / 2, height * 0.9, 'Click a character to enter the street', {
      fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)'
    }).setOrigin(0.5);
  }

  buildCard(x, y, textureKey, label) {
    const cardW = 180, cardH = 240;
    const card = this.add.rectangle(x, y, cardW, cardH, 0x0a0a0a, 1)
      .setStrokeStyle(1, 0x333333)
      .setInteractive({ useHandCursor: true });

    const sprite = this.add.image(x, y - 20, textureKey).setScale(3);

    const label_ = this.add.text(x, y + cardH / 2 - 30, label, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', letterSpacing: 2
    }).setOrigin(0.5);

    const hoverColor = textureKey === 'char_male' ? 0x00d4ff : 0xff3300;

    card.on('pointerover', () => {
      card.setStrokeStyle(2, hoverColor);
      this.tweens.add({ targets: sprite, scale: 3.3, duration: 150 });
    });
    card.on('pointerout', () => {
      card.setStrokeStyle(1, 0x333333);
      this.tweens.add({ targets: sprite, scale: 3, duration: 150 });
    });
    card.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('StreetScene', { character: textureKey });
      });
    });
  }
}
