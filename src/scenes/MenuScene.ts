export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Night sky background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f3460).setDepth(0);

    // Stars
    for (let i = 0; i < 60; i++) {
      this.add
        .image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height - 60), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.3, 1))
        .setDepth(0);
    }

    // Moon
    this.add.image(width - 180, 60, 'moon').setOrigin(0.5, 0.5).setDepth(1);

    // Ground (soil backing + grass tile, matching GameScene)
    this.add.rectangle(width / 2, height + 10, width, 80, 0x9a7428).setDepth(0);
    this.add.tileSprite(width / 2, height - 11, width, 58, 'ground').setDepth(1);

    // Player preview
    const dino = this.add.image(120, height - 40, 'player').setOrigin(0.5, 1).setDepth(2);
    this.tweens.add({
      targets: dino,
      y: height - 50,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title
    this.add
      .text(width / 2, height / 2 - 80, 'JUMPING ROBOT', {
        fontSize: '52px',
        color: '#00d4ff',
        fontFamily: 'Segoe UI, Arial',
        fontStyle: 'bold',
        stroke: '#0f3460',
        strokeThickness: 6,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true },
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height / 2 - 10, 'Endless Runner', {
        fontSize: '20px',
        color: '#90e0ef',
        fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0.5);

    // Prompt (blinking)
    const prompt = this.add
      .text(width / 2, height / 2 + 45, 'Press SPACE or TAP to Start', {
        fontSize: '22px',
        color: '#ffd166',
        fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Controls — no background, shifted right
    const ctrlX = width * 0.28;
    const ctrlY = height / 2 + 108;
    const kbLabelW = 90;
    const tsLabelW = 118;

    // Row 1 — keyboard
    this.add
      .text(ctrlX, ctrlY - 13, 'KEYBOARD', {
        fontSize: '13px', color: '#ffd166', fontFamily: 'Segoe UI, Arial', fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    this.add
      .text(ctrlX + kbLabelW, ctrlY - 13,
        'SPACE / ↑  —  jump up to 4×, resets on landing     ↓  —  duck', {
        fontSize: '13px', color: '#90e0ef', fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);

    // Row 2 — touch
    this.add
      .text(ctrlX, ctrlY + 13, 'TOUCH SCREEN', {
        fontSize: '13px', color: '#ffd166', fontFamily: 'Segoe UI, Arial', fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    this.add
      .text(ctrlX + tsLabelW, ctrlY + 13,
        'TAP  —  jump     SWIPE DOWN  —  duck', {
        fontSize: '13px', color: '#90e0ef', fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);

    // Start on SPACE or pointer
    const start = (): void => {
      this.scene.start('GameScene');
    };

    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
