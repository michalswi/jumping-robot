interface GameOverData {
  score: number;
  hiScore: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData): void {
    const { width, height } = this.scale;
    const { score, hiScore } = data;
    const isNewBest = score >= hiScore && score > 0;

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    // Panel background
    this.add.rectangle(width / 2, height / 2, 420, 250, 0x16213e).setStrokeStyle(2, 0x00d4ff);

    // Game over text
    this.add
      .text(width / 2, height / 2 - 90, 'GAME OVER', {
        fontSize: '40px',
        color: '#ff6b6b',
        fontFamily: 'Segoe UI, Arial',
        fontStyle: 'bold',
        stroke: '#0f3460',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // New best badge
    if (isNewBest) {
      const badge = this.add
        .text(width / 2, height / 2 - 48, '★  NEW BEST  ★', {
          fontSize: '16px',
          color: '#ffd166',
          fontFamily: 'Segoe UI, Arial',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0);

      this.tweens.add({
        targets: badge,
        alpha: 1,
        duration: 400,
        delay: 200,
      });
    }

    // Score display
    this.add
      .text(width / 2, height / 2 - (isNewBest ? 12 : 4), `SCORE   ${String(Math.floor(score)).padStart(5, '0')}`, {
        fontSize: '22px',
        color: '#90e0ef',
        fontFamily: 'Segoe UI, monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 28, `HI      ${String(Math.floor(hiScore)).padStart(5, '0')}`, {
        fontSize: '22px',
        color: '#ffd166',
        fontFamily: 'Segoe UI, monospace',
      })
      .setOrigin(0.5);

    // Restart prompt (blinking)
    const prompt = this.add
      .text(width / 2, height / 2 + 80, 'SPACE / TAP to Restart', {
        fontSize: '20px',
        color: '#00d4ff',
        fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 550,
      yoyo: true,
      repeat: -1,
    });

    // Restart handlers
    const restart = (): void => {
      this.scene.start('GameScene');
    };

    // Small delay so accidental key press on death doesn't instantly restart
    this.time.delayedCall(400, () => {
      this.input.keyboard?.once('keydown-SPACE', restart);
      this.input.once('pointerdown', restart);
    });

  }
}
