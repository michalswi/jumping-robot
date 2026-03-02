export type ObstacleType = 'cactus' | 'cactus2' | 'stone' | 'bat' | 'bird';

interface ObstacleConfig {
  type: ObstacleType;
  x: number;
  groundY: number;
  speed: number;
}

export class Obstacle extends Phaser.Physics.Arcade.Image {
  readonly obstacleType: ObstacleType;

  constructor(scene: Phaser.Scene, cfg: ObstacleConfig) {
    const isBat  = cfg.type === 'bat';
    const isBird = cfg.type === 'bird';
    const isFlying = isBat || isBird;

    // Flying enemies appear at two heights
    const y = isFlying
      ? cfg.groundY - (Math.random() < 0.5 ? 120 : 60)
      : cfg.groundY;

    super(scene, cfg.x, y, cfg.type);
    this.obstacleType = cfg.type;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    this.setDepth(2);

    this.setOrigin(0.5, 1);
    this.refreshBody();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);
    body.setVelocityX(-cfg.speed);
    body.setVelocityY(0);

    // Hitboxes sized per obstacle shape
    if (cfg.type === 'cactus') {
      body.setSize(18, 72, true);   // tall single tree — narrow trunk/canopy
    } else if (cfg.type === 'cactus2') {
      body.setSize(62, 72, true);   // two-tree cluster — wide
    } else if (cfg.type === 'stone') {
      body.setSize(50, 36, true);   // low boulder
    } else if (cfg.type === 'bat') {
      body.setSize(50, 20, true);
    } else {
      body.setSize(50, 20, true);   // bird
    }

    // Flying enemies face left (toward the player)
    if (isFlying) {
      this.setFlipX(true);
    }
  }

  isOffScreen(): boolean {
    return this.x < -80;
  }
}
