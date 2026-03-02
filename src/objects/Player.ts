const GROUND_Y = 360;
const DUCK_HITBOX = { w: 52, h: 32 };
const STAND_HITBOX = { w: 36, h: 52 };

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private isDucking = false;
  private touchDucking = false;
  private jumpCount = 0;
  private readonly maxJumps = 4;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, GROUND_Y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(2);

    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    this.refreshBody();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(STAND_HITBOX.w, STAND_HITBOX.h);
    body.setOffset(4, 0);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Dust particles
    this.dustEmitter = scene.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      frequency: -1,
      gravityY: 200,
      alpha: { start: 0.6, end: 0 },
    });
  }

  get onGround(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down;
  }

  jump(): void {
    if (this.isDucking) return;
    if (this.jumpCount >= this.maxJumps) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-820);
    this.jumpCount++;

    // Dust puff on first jump
    if (this.jumpCount === 1) {
      this.dustEmitter.emitParticleAt(this.x, this.y, 8);
    }
    // Smaller puff for double jump
    if (this.jumpCount === 2) {
      this.dustEmitter.emitParticleAt(this.x, this.y - 20, 5);
    }
    // Even smaller puff for triple jump
    if (this.jumpCount === 3) {
      this.dustEmitter.emitParticleAt(this.x, this.y - 40, 3);
    }
    // Tiny puff for quad jump
    if (this.jumpCount === 4) {
      this.dustEmitter.emitParticleAt(this.x, this.y - 55, 2);
    }
  }

  duck(active: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isDucking = active && this.onGround;

    if (this.isDucking) {
      body.setSize(DUCK_HITBOX.w, DUCK_HITBOX.h);
      body.setOffset(0, STAND_HITBOX.h - DUCK_HITBOX.h);
      this.setScale(1.2, 0.6);
    } else {
      body.setSize(STAND_HITBOX.w, STAND_HITBOX.h);
      body.setOffset(4, 0);
      this.setScale(1, 1);
    }
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Reset jump count when landing
    if (body.blocked.down) {
      this.jumpCount = 0;
    }

    const upJustDown =
      Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space!);

    if (upJustDown) {
      this.jump();
    }

    if (!this.touchDucking) {
      const downHeld = this.cursors.down?.isDown ?? false;
      this.duck(downHeld);
    }

    // Visual tilt on descent
    if (!this.onGround) {
      this.setAngle(body.velocity.y > 0 ? 8 : -4);
    } else {
      this.setAngle(0);
    }

    // Running dust
    if (this.onGround && !this.isDucking) {
      if (Math.random() < 0.15) {
        this.dustEmitter.emitParticleAt(this.x - 10, this.y, 1);
      }
    }
  }

  handleTap(): void {
    this.jump();
  }

  setTouchDuck(active: boolean): void {
    this.touchDucking = active;
    this.duck(active);
  }
}
