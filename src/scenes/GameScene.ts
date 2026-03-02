import { Player } from '../objects/Player';
import { Obstacle, ObstacleType } from '../objects/Obstacle';

const GROUND_Y = 360;
const GAME_WIDTH = 900;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.TileSprite;

  private score = 0;
  private hiScore = 0;
  private speed = 320;
  private scoreText!: Phaser.GameObjects.Text;
  private hiScoreText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;

  private spawnTimer = 0;
  private spawnInterval = 2200; // ms
  private gameRunning = false;
  private stars: Phaser.GameObjects.Image[] = [];

  // Day / Night theming
  private bgRect!: Phaser.GameObjects.Rectangle;
  private moonImage!: Phaser.GameObjects.Image;
  private dayBgRect!: Phaser.GameObjects.Rectangle;
  private sun!: Phaser.GameObjects.Graphics;
  private dayClouds: { gfx: Phaser.GameObjects.Graphics; speed: number }[] = [];
  private lastThemeZone = 0; // start in day (zone 0)

  // Flash on milestone
  private milestoneFlash!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.score = 0;
    this.speed = 320;
    this.spawnTimer = 0;
    this.spawnInterval = 2200;
    this.gameRunning = true;
    this.lastThemeZone = 0;

    // ── Background ─────────────────────────────────────────────────────────
    // Night sky (hidden at start — game begins in day)
    this.bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x0f3460).setAlpha(0);

    // Day sky (visible at start)
    this.dayBgRect = this.add
      .rectangle(width / 2, height / 2, width, height, 0x87ceeb)
      .setAlpha(1)
      .setDepth(0);

    // Stars (hidden at start — night only)
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      const star = this.add
        .image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height - 60), 'star')
        .setAlpha(0)
        .setDepth(0);
      this.stars.push(star);
    }

    // Sun (visible at start)
    this.sun = this.add.graphics().setDepth(1).setAlpha(1);
    this.drawSun(width - 200, 65);

    // Clouds (visible at start)
    this.dayClouds = [];
    const cloudDefs = [
      { x: 130, y: 72,  scale: 1.0,  speed: 22 },
      { x: 380, y: 55,  scale: 0.70, speed: 30 },
      { x: 580, y: 95,  scale: 1.2,  speed: 17 },
      { x: 760, y: 60,  scale: 0.85, speed: 26 },
    ];
    for (const def of cloudDefs) {
      const g = this.add.graphics().setDepth(1).setAlpha(1).setScale(def.scale);
      g.setPosition(def.x, def.y);
      this.drawCloud(g);
      this.dayClouds.push({ gfx: g, speed: def.speed });
    }

    // Ground tile — top edge of texture = GROUND_Y so player/trees stand ON the leaf tips
    this.add.rectangle(width / 2, height + 10, width, 80, 0x9a7428).setDepth(0); // soil backing
    this.ground = this.add.tileSprite(width / 2, GROUND_Y + 29, width, 58, 'ground').setDepth(0);

    // ── Physics world bounds ────────────────────────────────────────────────
    // Bottom = GROUND_Y guarantees player never sinks below the grass surface.
    // Right extends past spawn zone so obstacles aren't clamped on creation.
    this.physics.world.setBounds(0, 0, width + 300, GROUND_Y);

    // ── Player ─────────────────────────────────────────────────────────────
    this.player = new Player(this, 120);

    // Static ground collider platform
    const groundBody = this.physics.add.staticImage(width / 2, GROUND_Y, '__DEFAULT').setAlpha(0);
    (groundBody.body as Phaser.Physics.Arcade.StaticBody).setSize(width, 4);
    groundBody.refreshBody();

    this.physics.add.collider(this.player, groundBody);

    // ── Obstacles ──────────────────────────────────────────────────────────
    this.obstacles = this.physics.add.group();

    // Collision: player vs obstacles
    this.physics.add.overlap(this.player, this.obstacles, this.onHit, undefined, this);

    // ── UI ─────────────────────────────────────────────────────────────────
    this.scoreText = this.add
      .text(width - 20, 16, 'SCORE  00000', {
        fontSize: '18px',
        color: '#90e0ef',
        fontFamily: 'Segoe UI, monospace',
      })
      .setOrigin(1, 0);

    // Moon decoration — sits to the left of the score block
    this.moonImage = this.add.image(width - 220, 60, 'moon').setOrigin(1, 0.5).setDepth(1).setAlpha(0);

    this.hiScore = Math.floor(+(localStorage.getItem('dinoHiScore') ?? '0'));
    this.hiScoreText = this.add
      .text(width - 20, 40, `HI  ${String(this.hiScore).padStart(5, '0')}`, {
        fontSize: '18px',
        color: '#ffd166',
        fontFamily: 'Segoe UI, monospace',
      })
      .setOrigin(1, 0);

    this.speedText = this.add
      .text(20, 16, '▶ x1.0', {
        fontSize: '16px',
        color: '#4a9eca',
        fontFamily: 'Segoe UI, Arial',
      })
      .setOrigin(0, 0);

    // Milestone flash overlay
    this.milestoneFlash = this.add
      .rectangle(width / 2, height / 2, width, height, 0xffffff)
      .setAlpha(0)
      .setDepth(10);

    // ── Input ──────────────────────────────────────────────────────────────
    // Touch: swipe down → duck, tap → jump
    let touchStartY = 0;
    let touchDucked = false;

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (!this.gameRunning) return;
      touchStartY = ptr.y;
      touchDucked = false;
    });

    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!this.gameRunning || !ptr.isDown) return;
      if (ptr.y - touchStartY > 30) {
        touchDucked = true;
        this.player.setTouchDuck(true);
      }
    });

    this.input.on('pointerup', () => {
      if (!this.gameRunning) return;
      if (touchDucked) {
        this.player.setTouchDuck(false);
        touchDucked = false;
      } else {
        this.player.handleTap();
      }
    });
  }

  private onHit(): void {
    if (!this.gameRunning) return;
    this.gameRunning = false;

    // Camera shake
    this.cameras.main.shake(300, 0.018);

    // Flash red
    this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xff0000)
      .setAlpha(0.25)
      .setDepth(9);

    // ── Manga KABOOM explosion ──────────────────────────────────────────────
    const ex = this.player.x;
    const ey = this.player.y - 30;

    // Orange fire sparks
    const fire = this.add.particles(ex, ey, 'spark', {
      speed: { min: 120, max: 380 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: { min: 350, max: 600 },
      tint: [0xff6600, 0xff3300, 0xffaa00, 0xffff00],
      gravityY: 300,
      frequency: -1,
      quantity: 28,
    }).setDepth(15);
    fire.emitParticleAt(ex, ey, 28);

    // White hot core burst
    const core = this.add.particles(ex, ey, 'spark', {
      speed: { min: 40, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: { min: 200, max: 400 },
      tint: 0xffffff,
      gravityY: 0,
      frequency: -1,
      quantity: 14,
    }).setDepth(16);
    core.emitParticleAt(ex, ey, 14);

    // Manga "KABOOM!" word balloon
    // Cloud puff backdrop around KABOOM text
    const cloudCX = ex;
    const cloudCY = ey - 86; // vertically centred on the KABOOM text
    const cloud = this.add.graphics().setDepth(16).setPosition(cloudCX, cloudCY).setScale(0.1);
    const cloudPuffs = [
      { x: 0,   y: 0,   r: 44 },
      { x: 50,  y: -8,  r: 30 },
      { x: -50, y: -8,  r: 30 },
      { x: 34,  y: 24,  r: 24 },
      { x: -34, y: 24,  r: 24 },
      { x: 62,  y: 16,  r: 20 },
      { x: -62, y: 16,  r: 20 },
      { x: 20,  y: -40, r: 22 },
      { x: -20, y: -40, r: 22 },
      { x: 0,   y: -50, r: 18 },
    ];
    cloud.fillStyle(0xffffff, 1);
    cloudPuffs.forEach(p => cloud.fillCircle(p.x, p.y, p.r));
    cloud.lineStyle(3, 0x111111, 0.7);
    cloudPuffs.forEach(p => cloud.strokeCircle(p.x, p.y, p.r));

    const kaboomShadow = this.add.text(ex + 4, ey - 56, 'KABOOM!', {
      fontSize: '52px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      color: '#000000',
    }).setOrigin(0.5, 1).setDepth(17).setScale(0.1);

    const kaboom = this.add.text(ex, ey - 60, 'KABOOM!', {
      fontSize: '52px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      color: '#ffee00',
      stroke: '#cc0000',
      strokeThickness: 7,
    }).setOrigin(0.5, 1).setDepth(18).setScale(0.1);

    // Pop-in then fade
    this.tweens.add({
      targets: [cloud, kaboom, kaboomShadow],
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [cloud, kaboom, kaboomShadow],
          alpha: 0,
          delay: 300,
          duration: 250,
        });
      },
    });

    // Save hi score
    if (this.score > this.hiScore) {
      this.hiScore = Math.floor(this.score);
      localStorage.setItem('dinoHiScore', String(this.hiScore));
    }

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        hiScore: this.hiScore,
      });
    });
  }

  private spawnObstacle(): void {
    // Flying enemy depends on current theme: birds by day, bats by night
    const themeZone = Math.floor(this.score / 500) % 2; // 0 = day, 1 = night
    const flyingType: ObstacleType = themeZone === 0 ? 'bird' : 'bat';

    const groundTypes: ObstacleType[] = ['cactus', 'cactus', 'cactus2', 'stone'];
    // Birds unlock at score > 500 (day phases), bats at score > 1000 (night phases)
    const flyingUnlocked =
      (themeZone === 0 && this.score > 500) ||
      (themeZone === 1 && this.score > 1000);
    const available: ObstacleType[] = flyingUnlocked
      ? [...groundTypes, flyingType, flyingType, flyingType]
      : groundTypes;
    const type = available[Phaser.Math.Between(0, available.length - 1)];

    const obs = new Obstacle(this, {
      type,
      x: GAME_WIDTH + 60,
      groundY: GROUND_Y,
      speed: this.speed,
    });

    this.obstacles.add(obs);
  }

  update(_time: number, delta: number): void {
    if (!this.gameRunning) return;

    // Score
    this.score += delta * 0.04;
    const scoreInt = Math.floor(this.score);
    this.scoreText.setText(`SCORE  ${String(scoreInt).padStart(5, '0')}`);

    // Update hi score live
    if (scoreInt > this.hiScore) {
      this.hiScore = scoreInt;
    }
    this.hiScoreText.setText(`HI  ${String(this.hiScore).padStart(5, '0')}`);

    // Milestone flash every 100 pts
    if (scoreInt > 0 && scoreInt % 100 === 0 && scoreInt !== Math.floor(this.score - delta * 0.04)) {
      this.tweens.add({
        targets: this.milestoneFlash,
        alpha: { from: 0.3, to: 0 },
        duration: 300,
      });
    }

    // Day / Night theme cycling every 500 pts  (0–499 day, 500–999 night, 1000+ day, …)
    const themeZone = Math.floor(scoreInt / 500) % 2; // 0 = day, 1 = night
    if (themeZone !== this.lastThemeZone) {
      this.lastThemeZone = themeZone;
      if (themeZone === 0) this.transitionToDay();
      else this.transitionToNight();
    }

    // Speed ramp
    this.speed = 320 + scoreInt * 0.35;
    const mult = (this.speed / 320).toFixed(1);
    this.speedText.setText(`▶ x${mult}`);

    // Update obstacle velocities and lock ground obstacles to GROUND_Y
    this.obstacles.getChildren().forEach((obj) => {
      const obs = obj as Obstacle;
      const body = obs.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.speed);
      if (obs.obstacleType !== 'bat' && obs.obstacleType !== 'bird') {
        body.setVelocityY(0);
        obs.y = GROUND_Y;
      } else {
        body.setVelocityY(0);
      }
    });

    // Spawn timer
    this.spawnTimer += delta;
    this.spawnInterval = Math.max(950, 2200 - scoreInt * 0.8);
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    // Remove off-screen obstacles
    this.obstacles.getChildren().slice().forEach((obj) => {
      const obs = obj as Obstacle;
      if (obs.isOffScreen()) {
        obs.destroy();
      }
    });

    // Scroll ground
    this.ground.tilePositionX += this.speed * (delta / 1000);

    // Scroll stars slowly
    this.stars.forEach((star, i) => {
      star.x -= (0.3 + i * 0.005) * (delta / 16);
      if (star.x < -4) star.x = GAME_WIDTH + 4;
    });

    // Scroll clouds (always active so they're ready when day fades in)
    this.dayClouds.forEach(c => {
      c.gfx.x -= c.speed * (delta / 1000);
      if (c.gfx.x < -160) c.gfx.x = GAME_WIDTH + 160;
    });

    // Update player
    this.player.update();
  }

  // ── Day / Night helpers ─────────────────────────────────────────────────

  private transitionToDay(): void {
    const duration = 800;
    // Fade out night elements
    this.tweens.add({ targets: this.bgRect,   alpha: 0, duration });
    this.tweens.add({ targets: this.stars,    alpha: 0, duration });
    this.tweens.add({ targets: this.moonImage, alpha: 0, duration });
    // Fade in day elements
    this.tweens.add({ targets: this.dayBgRect, alpha: 1, duration });
    this.tweens.add({ targets: this.sun,        alpha: 1, duration });
    this.dayClouds.forEach(c =>
      this.tweens.add({ targets: c.gfx, alpha: 1, duration })
    );
  }

  private transitionToNight(): void {
    const duration = 800;
    // Fade in night elements
    this.tweens.add({ targets: this.bgRect,   alpha: 1, duration });
    this.tweens.add({ targets: this.moonImage, alpha: 1, duration });
    this.tweens.add({
      targets: this.stars,
      alpha: { from: 0, to: 1 },
      duration,
      onComplete: () => {
        // Restore individual star alphas after fade
        this.stars.forEach(s =>
          s.setAlpha(Phaser.Math.FloatBetween(0.2, 0.9))
        );
      },
    });
    // Fade out day elements
    this.tweens.add({ targets: this.dayBgRect, alpha: 0, duration });
    this.tweens.add({ targets: this.sun,        alpha: 0, duration });
    this.dayClouds.forEach(c =>
      this.tweens.add({ targets: c.gfx, alpha: 0, duration })
    );
  }

  private drawSun(cx: number, cy: number): void {
    // Outer glow
    this.sun.fillStyle(0xffe566, 0.25);
    this.sun.fillCircle(cx, cy, 52);
    // Mid glow
    this.sun.fillStyle(0xffd700, 0.45);
    this.sun.fillCircle(cx, cy, 42);
    // Body
    this.sun.fillStyle(0xffc800, 1);
    this.sun.fillCircle(cx, cy, 34);
    // Highlight
    this.sun.fillStyle(0xfff0a0, 1);
    this.sun.fillCircle(cx - 10, cy - 10, 13);
    // Second small specular
    this.sun.fillStyle(0xfffce0, 1);
    this.sun.fillCircle(cx - 14, cy - 14, 5);
  }

  private drawCloud(g: Phaser.GameObjects.Graphics): void {
    const puffs = [
      { x:   0, y:  0, r: 28 },
      { x:  34, y:  8, r: 22 },
      { x: -32, y:  8, r: 20 },
      { x:  18, y: -16, r: 20 },
      { x: -14, y: -14, r: 17 },
      { x:  52, y: 14,  r: 14 },
      { x: -50, y: 14,  r: 13 },
    ];
    this.drawCloudAt(g, puffs);
  }

  private drawCloudAt(
    g: Phaser.GameObjects.Graphics,
    puffs: { x: number; y: number; r: number }[],
  ): void {
    // Shadow layer
    g.fillStyle(0xd0e8f4, 0.6);
    puffs.forEach(p => g.fillCircle(p.x + 2, p.y + 6, p.r));
    // White body
    g.fillStyle(0xffffff, 1);
    puffs.forEach(p => g.fillCircle(p.x, p.y, p.r));
    // Highlight
    g.fillStyle(0xf8fdff, 0.7);
    puffs.forEach(p => g.fillCircle(p.x - 4, p.y - 5, p.r * 0.45));
  }
}
