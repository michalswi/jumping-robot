export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.image('bird', '/bird.svg');
  }

  create(): void {
    // ── Ground (grass + layered soil, 200 × 58 tileable) ────────────────────
    const groundGfx = this.make.graphics({ x: 0, y: 0 });

    // Helper: draw a diamond leaf shape
    const leaf = (
      gfx: Phaser.GameObjects.Graphics,
      cx: number, ty: number, by: number, hw: number,
    ) => {
      const my = ty + (by - ty) * 0.55;
      gfx.fillPoints([
        { x: cx,      y: ty },
        { x: cx + hw, y: my },
        { x: cx,      y: by },
        { x: cx - hw, y: my },
      ], true);
    };

    // ── Soil layers ────────────────────────────────────────────────────────
    // Main sandy base
    groundGfx.fillStyle(0xc2983c);
    groundGfx.fillRect(0, 27, 200, 31);

    // Sandy highlight band
    groundGfx.fillStyle(0xd4ae58);
    groundGfx.fillRect(0, 30, 200, 10);

    // Deep soil bottom strip
    groundGfx.fillStyle(0x9a7428);
    groundGfx.fillRect(0, 48, 200, 10);

    // Rough dark top-of-soil edge (saw-tooth)
    groundGfx.fillStyle(0x7a5818);
    for (let i = 0; i < 200; i += 8) {
      groundGfx.fillTriangle(i, 27, i + 8, 27, i + 4, 30);
    }

    // Wavy mid-soil crease line
    groundGfx.fillStyle(0xb08830);
    for (let x = 0; x < 200; x += 2) {
      const wy = 40 + Math.round(Math.sin(x * 0.18) * 2);
      groundGfx.fillRect(x, wy, 2, 2);
    }

    // Pebbles
    const pebbles = [
      { x: 18, y: 36, rw: 5, rh: 3 },
      { x: 48, y: 43, rw: 7, rh: 4 },
      { x: 78, y: 37, rw: 4, rh: 3 },
      { x: 105, y: 44, rw: 6, rh: 3 },
      { x: 132, y: 36, rw: 5, rh: 3 },
      { x: 160, y: 43, rw: 7, rh: 4 },
      { x: 188, y: 37, rw: 4, rh: 3 },
    ];
    for (const p of pebbles) {
      groundGfx.fillStyle(0x8c6820);         // shadow
      groundGfx.fillEllipse(p.x + 1, p.y + 1, p.rw * 2, p.rh * 2);
      groundGfx.fillStyle(0xdbc06a);         // pebble body
      groundGfx.fillEllipse(p.x, p.y, p.rw * 2, p.rh * 2);
      groundGfx.fillStyle(0xf0d888);         // highlight
      groundGfx.fillEllipse(p.x - 1, p.y - 1, p.rw, p.rh);
    }

    // ── Grass green base band ──────────────────────────────────────────────
    groundGfx.fillStyle(0x2e7d18);
    groundGfx.fillRect(0, 20, 200, 10);

    // ── Back-row leaves (darker, taller) ──────────────────────────────────
    const backLeaves = [
      { cx: 0 },{ cx: 20 },{ cx: 40 },{ cx: 60 },{ cx: 80 },
      { cx: 100 },{ cx: 120 },{ cx: 140 },{ cx: 160 },{ cx: 180 },{ cx: 200 },
    ];
    groundGfx.fillStyle(0x1a5c10);
    for (const l of backLeaves) leaf(groundGfx, l.cx, 3, 28, 10);
    groundGfx.fillStyle(0x2e8020);
    for (const l of backLeaves) leaf(groundGfx, l.cx, 5, 27, 8);

    // ── Front-row leaves (brighter, varied heights) ────────────────────────
    const frontLeaves = [
      { cx: 10, ty: 0, by: 27, hw: 11 },
      { cx: 30, ty: 2, by: 26, hw: 10 },
      { cx: 50, ty: 0, by: 28, hw: 12 },
      { cx: 70, ty: 1, by: 26, hw: 10 },
      { cx: 90, ty: 0, by: 27, hw: 11 },
      { cx: 110, ty: 2, by: 25, hw: 10 },
      { cx: 130, ty: 0, by: 28, hw: 12 },
      { cx: 150, ty: 1, by: 26, hw: 10 },
      { cx: 170, ty: 0, by: 27, hw: 11 },
      { cx: 190, ty: 2, by: 26, hw: 10 },
    ];
    // Dark outline pass
    groundGfx.fillStyle(0x1e6614);
    for (const l of frontLeaves) leaf(groundGfx, l.cx, l.ty, l.by, l.hw + 1);
    // Mid-green fill
    groundGfx.fillStyle(0x3aaa22);
    for (const l of frontLeaves) leaf(groundGfx, l.cx, l.ty + 1, l.by - 1, l.hw - 1);
    // Bright center highlight (vein)
    groundGfx.fillStyle(0x6fcc44);
    for (const l of frontLeaves) leaf(groundGfx, l.cx, l.ty + 3, l.by - 4, Math.max(3, l.hw - 7));

    groundGfx.generateTexture('ground', 200, 58);
    groundGfx.destroy();

    // ── Player (green skull creature, manga style) ───────────────────────────
    const playerGfx = this.make.graphics({ x: 0, y: 0 });

    const G_DARK = 0x145214;
    const G_MID  = 0x1e8c1e;
    const G_LITE = 0x3ab83a;
    const BLACK  = 0x0d0d0d;
    const WHITE  = 0xffffff;
    const BONE   = 0xf0ece0;
    const RED    = 0xee1111;

    // Spiky horns (manga flair)
    playerGfx.fillStyle(G_DARK);
    playerGfx.fillTriangle(13, 8, 9,  0, 17, 0);
    playerGfx.fillTriangle(31, 8, 27, 0, 35, 0);
    playerGfx.fillTriangle(22, 5, 19, 0, 25, 0);

    // Head
    playerGfx.fillStyle(G_MID);
    playerGfx.fillRoundedRect(4, 4, 36, 24, 7);
    // Head highlight (cell-shade)
    playerGfx.fillStyle(G_LITE);
    playerGfx.fillRoundedRect(7, 5, 30, 8, 5);

    // Skull eye sockets
    playerGfx.fillStyle(BLACK);
    playerGfx.fillEllipse(14, 14, 13, 12);
    playerGfx.fillEllipse(30, 14, 13, 12);
    // Manga eye shine
    playerGfx.fillStyle(WHITE);
    playerGfx.fillCircle(10, 10, 2);
    playerGfx.fillCircle(26, 10, 2);
    // Red irises
    playerGfx.fillStyle(RED);
    playerGfx.fillCircle(15, 15, 3);
    playerGfx.fillCircle(31, 15, 3);

    // Skeleton nose holes
    playerGfx.fillStyle(BLACK);
    playerGfx.fillEllipse(18, 21, 4, 5);
    playerGfx.fillEllipse(26, 21, 4, 5);

    // Skeleton teeth
    playerGfx.fillStyle(BLACK);
    playerGfx.fillRect(7, 25, 30, 3);
    playerGfx.fillStyle(BONE);
    playerGfx.fillRoundedRect(9,  24, 5, 5, 1);
    playerGfx.fillRoundedRect(15, 24, 5, 5, 1);
    playerGfx.fillRoundedRect(21, 24, 5, 5, 1);
    playerGfx.fillRoundedRect(27, 24, 5, 5, 1);

    // Body
    playerGfx.fillStyle(G_MID);
    playerGfx.fillRoundedRect(8, 27, 26, 13, 4);
    // Body highlight
    playerGfx.fillStyle(G_LITE);
    playerGfx.fillRoundedRect(11, 28, 18, 5, 3);

    // Tail
    playerGfx.fillStyle(G_DARK);
    playerGfx.fillTriangle(8, 38, 0, 26, 8, 18);

    // Legs
    playerGfx.fillStyle(G_MID);
    playerGfx.fillRoundedRect(12, 40, 8, 12, 3);
    playerGfx.fillRoundedRect(24, 40, 8, 12, 3);
    // Claws / feet
    playerGfx.fillStyle(G_DARK);
    playerGfx.fillRoundedRect(10, 48, 10, 4, 2);
    playerGfx.fillRoundedRect(22, 48, 10, 4, 2);

    playerGfx.generateTexture('player', 44, 52);
    playerGfx.destroy();

    // ── Ghibli Tree (single, 50×100) ─────────────────────────────────────────
    const cactusGfx = this.make.graphics({ x: 0, y: 0 });

    // Root bumps
    cactusGfx.fillStyle(0x1e0e03);
    cactusGfx.fillEllipse(19, 98, 16, 7);
    cactusGfx.fillEllipse(32, 98, 14, 6);
    cactusGfx.fillStyle(0x2d1605);
    cactusGfx.fillEllipse(18, 96, 14, 6);
    cactusGfx.fillEllipse(31, 96, 12, 5);

    // Trunk shadow
    cactusGfx.fillStyle(0x1e0e03);
    cactusGfx.fillRoundedRect(21, 48, 10, 52, 3);
    // Trunk body
    cactusGfx.fillStyle(0x4a2c12);
    cactusGfx.fillRoundedRect(22, 46, 8, 52, 3);
    // Bark lines
    cactusGfx.fillStyle(0x3a2010);
    cactusGfx.fillRect(23, 52, 2, 8);
    cactusGfx.fillRect(27, 64, 2, 10);
    cactusGfx.fillRect(23, 76, 2, 8);
    // Trunk highlight
    cactusGfx.fillStyle(0x6e4a22);
    cactusGfx.fillRect(25, 50, 2, 36);

    // Canopy — dark outline layer
    cactusGfx.fillStyle(0x0c3a07);
    cactusGfx.fillCircle(25, 44, 24);
    cactusGfx.fillCircle(11, 54, 17);
    cactusGfx.fillCircle(39, 54, 17);
    cactusGfx.fillCircle(17, 28, 18);
    cactusGfx.fillCircle(33, 28, 18);
    cactusGfx.fillCircle(25, 16, 15);

    // Canopy — dark green
    cactusGfx.fillStyle(0x1a5e10);
    cactusGfx.fillCircle(25, 43, 22);
    cactusGfx.fillCircle(12, 53, 15);
    cactusGfx.fillCircle(38, 53, 15);
    cactusGfx.fillCircle(18, 28, 16);
    cactusGfx.fillCircle(32, 28, 16);
    cactusGfx.fillCircle(25, 17, 13);

    // Canopy — mid green
    cactusGfx.fillStyle(0x2e8a1a);
    cactusGfx.fillCircle(24, 42, 17);
    cactusGfx.fillCircle(13, 52, 11);
    cactusGfx.fillCircle(37, 52, 11);
    cactusGfx.fillCircle(18, 27, 12);
    cactusGfx.fillCircle(31, 27, 12);
    cactusGfx.fillCircle(24, 17, 10);

    // Canopy — bright highlights
    cactusGfx.fillStyle(0x4cb828);
    cactusGfx.fillCircle(22, 39, 10);
    cactusGfx.fillCircle(11, 49, 7);
    cactusGfx.fillCircle(35, 49, 6);
    cactusGfx.fillCircle(16, 24, 7);
    cactusGfx.fillCircle(29, 24, 7);
    cactusGfx.fillCircle(22, 14, 6);

    // Canopy — top specular
    cactusGfx.fillStyle(0x78d444);
    cactusGfx.fillCircle(20, 36, 4);
    cactusGfx.fillCircle(10, 47, 3);
    cactusGfx.fillCircle(33, 47, 3);
    cactusGfx.fillCircle(14, 22, 3);
    cactusGfx.fillCircle(27, 22, 3);
    cactusGfx.fillCircle(21, 12, 3);

    cactusGfx.generateTexture('cactus', 50, 100);
    cactusGfx.destroy();

    // ── Ghibli Tree Cluster (two trees, 90×100) ───────────────────────────────
    const cactus2Gfx = this.make.graphics({ x: 0, y: 0 });

    // Helper draws one Ghibli tree at cx, with bottom at baseY
    const ghibliTree = (g: Phaser.GameObjects.Graphics, cx: number, baseY: number, s: number) => {
      // Roots
      g.fillStyle(0x1e0e03);
      g.fillEllipse(cx - 8, baseY - 1, 14 * s, 7 * s);
      g.fillEllipse(cx + 7, baseY - 1, 12 * s, 6 * s);
      g.fillStyle(0x2d1605);
      g.fillEllipse(cx - 8, baseY - 3, 12 * s, 5 * s);
      g.fillEllipse(cx + 6, baseY - 3, 10 * s, 4 * s);
      // Trunk
      g.fillStyle(0x1e0e03);
      g.fillRoundedRect(cx - 6, baseY - 52 * s, 10 * s, 52 * s, 3);
      g.fillStyle(0x4a2c12);
      g.fillRoundedRect(cx - 5, baseY - 52 * s, 8 * s, 52 * s, 3);
      g.fillStyle(0x6e4a22);
      g.fillRect(cx - 3, baseY - 48 * s, 2, 38 * s);
      // Bark
      g.fillStyle(0x3a2010);
      g.fillRect(cx - 4, baseY - 42 * s, 2, 6 * s);
      g.fillRect(cx,     baseY - 32 * s, 2, 6 * s);
      // Canopy outlines
      const R = Math.round(18 * s);
      g.fillStyle(0x0c3a07);
      g.fillCircle(cx, baseY - 55 * s, R + 2);
      g.fillCircle(cx - Math.round(13 * s), baseY - 47 * s, Math.round(13 * s) + 1);
      g.fillCircle(cx + Math.round(13 * s), baseY - 47 * s, Math.round(13 * s) + 1);
      g.fillCircle(cx - Math.round(7 * s),  baseY - 68 * s, Math.round(14 * s) + 1);
      g.fillCircle(cx + Math.round(7 * s),  baseY - 68 * s, Math.round(14 * s) + 1);
      g.fillCircle(cx, baseY - 79 * s, Math.round(11 * s) + 1);
      // Dark green
      g.fillStyle(0x1a5e10);
      g.fillCircle(cx, baseY - 55 * s, R);
      g.fillCircle(cx - Math.round(12 * s), baseY - 47 * s, Math.round(12 * s));
      g.fillCircle(cx + Math.round(12 * s), baseY - 47 * s, Math.round(12 * s));
      g.fillCircle(cx - Math.round(6 * s),  baseY - 68 * s, Math.round(13 * s));
      g.fillCircle(cx + Math.round(6 * s),  baseY - 68 * s, Math.round(13 * s));
      g.fillCircle(cx, baseY - 79 * s, Math.round(10 * s));
      // Mid green
      g.fillStyle(0x2e8a1a);
      g.fillCircle(cx - 1, baseY - 56 * s, R - 4);
      g.fillCircle(cx - Math.round(12 * s), baseY - 48 * s, Math.round(8 * s));
      g.fillCircle(cx + Math.round(12 * s), baseY - 48 * s, Math.round(8 * s));
      g.fillCircle(cx - Math.round(6 * s),  baseY - 69 * s, Math.round(9 * s));
      g.fillCircle(cx + Math.round(6 * s),  baseY - 69 * s, Math.round(9 * s));
      g.fillCircle(cx, baseY - 79 * s, Math.round(7 * s));
      // Highlights
      g.fillStyle(0x4cb828);
      g.fillCircle(cx - 2, baseY - 58 * s, Math.round(9 * s));
      g.fillCircle(cx - Math.round(13 * s), baseY - 50 * s, Math.round(5 * s));
      g.fillCircle(cx + Math.round(11 * s), baseY - 50 * s, Math.round(5 * s));
      g.fillCircle(cx - Math.round(7 * s),  baseY - 71 * s, Math.round(6 * s));
      g.fillCircle(cx + Math.round(5 * s),  baseY - 71 * s, Math.round(5 * s));
      g.fillCircle(cx - 1, baseY - 81 * s, Math.round(4 * s));
      // Specular
      g.fillStyle(0x78d444);
      g.fillCircle(cx - 3, baseY - 61 * s, Math.round(4 * s));
      g.fillCircle(cx - Math.round(14 * s), baseY - 52 * s, 2);
      g.fillCircle(cx - Math.round(8 * s),  baseY - 73 * s, 2);
    };

    ghibliTree(cactus2Gfx, 28, 100, 1);    // left tree, full size
    ghibliTree(cactus2Gfx, 64, 100, 0.85); // right tree, slightly smaller

    cactus2Gfx.generateTexture('cactus2', 90, 100);
    cactus2Gfx.destroy();

    // ── Manga Stone (60×44) ─────────────────────────────────────────────────
    const stoneGfx = this.make.graphics({ x: 0, y: 0 });

    // Stone outline — bold manga black
    stoneGfx.fillStyle(0x111111);
    stoneGfx.fillPoints([
      { x: 12, y: 42 }, { x: 4,  y: 34 }, { x: 3,  y: 20 },
      { x: 10, y: 8  }, { x: 22, y: 2  }, { x: 38, y: 2  },
      { x: 50, y: 8  }, { x: 57, y: 20 }, { x: 57, y: 34 },
      { x: 48, y: 42 },
    ], true);

    // Stone body — mid gray
    stoneGfx.fillStyle(0x8a8a8a);
    stoneGfx.fillPoints([
      { x: 13, y: 40 }, { x: 6,  y: 33 }, { x: 6,  y: 21 },
      { x: 12, y: 10 }, { x: 23, y: 5  }, { x: 37, y: 5  },
      { x: 48, y: 10 }, { x: 54, y: 21 }, { x: 54, y: 33 },
      { x: 47, y: 40 },
    ], true);

    // Manga flat shadow — right/bottom face
    stoneGfx.fillStyle(0x4a4a4a);
    stoneGfx.fillPoints([
      { x: 35, y: 40 }, { x: 47, y: 40 }, { x: 54, y: 33 },
      { x: 54, y: 21 }, { x: 48, y: 11 }, { x: 42, y: 7  },
      { x: 35, y: 18 },
    ], true);

    // Manga highlight — top-left face
    stoneGfx.fillStyle(0xc0c0c0);
    stoneGfx.fillPoints([
      { x: 13, y: 21 }, { x: 14, y: 11 }, { x: 23, y: 5  },
      { x: 35, y: 5  }, { x: 35, y: 18 }, { x: 22, y: 25 },
    ], true);

    // Specular dot — top sheen
    stoneGfx.fillStyle(0xeeeeee);
    stoneGfx.fillEllipse(21, 10, 14, 7);

    // Manga cracks — angular dark lines
    stoneGfx.fillStyle(0x1e1e1e);
    stoneGfx.fillRect(30, 7,  2, 13);  // main vertical crack
    stoneGfx.fillRect(32, 19, 11, 2); // horizontal branch
    stoneGfx.fillRect(42, 21, 2, 8);  // short drop
    stoneGfx.fillRect(9,  24, 9,  2); // left-face crack
    stoneGfx.fillRect(17, 26, 2, 7);  // left crack drop

    // Small pebbles at base
    stoneGfx.fillStyle(0x111111);
    stoneGfx.fillCircle(7,  41, 3);
    stoneGfx.fillCircle(53, 41, 2);
    stoneGfx.fillStyle(0x8a8a8a);
    stoneGfx.fillCircle(7,  41, 2);
    stoneGfx.fillCircle(53, 41, 1);

    stoneGfx.generateTexture('stone', 60, 44);
    stoneGfx.destroy();

    // ── Bat (Ghibli / manga style, 66×30) ─────────────────────────────────
    const batGfx = this.make.graphics({ x: 0, y: 0 });

    // ---- Wing membranes: deep purple with finger-bone ribs ----
    // Left wing — three-layered cel shading
    batGfx.fillStyle(0x2e0e58);
    batGfx.fillTriangle(1, 30, 9, 2, 33, 19);
    batGfx.fillStyle(0x4a1e88);
    batGfx.fillTriangle(4, 30, 11, 5, 31, 19);
    batGfx.fillStyle(0x6a3ab0);
    batGfx.fillTriangle(8, 28, 14, 9, 29, 19);
    // Right wing mirror
    batGfx.fillStyle(0x2e0e58);
    batGfx.fillTriangle(65, 30, 57, 2, 33, 19);
    batGfx.fillStyle(0x4a1e88);
    batGfx.fillTriangle(62, 30, 55, 5, 35, 19);
    batGfx.fillStyle(0x6a3ab0);
    batGfx.fillTriangle(58, 28, 52, 9, 37, 19);

    // ---- Finger-bone rib lines (dark thin strips) ----
    batGfx.fillStyle(0x18062a);
    // Left wing — 3 ribs
    batGfx.fillTriangle(5, 30, 7, 2,  8, 28);
    batGfx.fillTriangle(12, 26, 13, 5, 14, 25);
    batGfx.fillTriangle(19, 22, 20, 8, 21, 21);
    // Right wing — 3 ribs
    batGfx.fillTriangle(61, 30, 59, 2, 58, 28);
    batGfx.fillTriangle(54, 26, 53, 5, 52, 25);
    batGfx.fillTriangle(47, 22, 46, 8, 45, 21);

    // ---- Body ----
    batGfx.fillStyle(0x180830);
    batGfx.fillEllipse(33, 22, 20, 14);  // black outline
    batGfx.fillStyle(0x3a1260);
    batGfx.fillEllipse(33, 22, 17, 11);
    batGfx.fillStyle(0x52209a);
    batGfx.fillEllipse(32, 21, 12, 7);   // cel highlight

    // ---- Head ----
    batGfx.fillStyle(0x180830);          // black halo outline
    batGfx.fillCircle(33, 13, 10);
    batGfx.fillStyle(0x3a1060);
    batGfx.fillCircle(33, 13, 8);
    batGfx.fillStyle(0x5a2298);          // top sheen
    batGfx.fillEllipse(31, 9, 9, 5);

    // ---- Ears ----
    batGfx.fillStyle(0x180830);
    batGfx.fillTriangle(26, 12, 22, 0, 31, 9);  // left ear outline
    batGfx.fillTriangle(40, 12, 44, 0, 35, 9);  // right ear outline
    batGfx.fillStyle(0x50189a);
    batGfx.fillTriangle(26, 12, 23, 2, 30, 9);
    batGfx.fillTriangle(40, 12, 43, 2, 36, 9);
    // Pink inner ear (Ghibli soft touch)
    batGfx.fillStyle(0xee80c0);
    batGfx.fillTriangle(26, 11, 24, 3, 29, 9);
    batGfx.fillTriangle(40, 11, 42, 3, 37, 9);

    // ---- Large manga eyes ----
    // Left eye
    batGfx.fillStyle(0xffffff);
    batGfx.fillEllipse(28, 14, 8, 7);
    batGfx.fillStyle(0xcc1840);
    batGfx.fillEllipse(28, 14, 6, 6);
    batGfx.fillStyle(0x0a0006);
    batGfx.fillEllipse(28, 15, 4, 5);
    batGfx.fillStyle(0xffffff);
    batGfx.fillCircle(30, 12, 1);   // catchlight
    // Right eye
    batGfx.fillStyle(0xffffff);
    batGfx.fillEllipse(38, 14, 8, 7);
    batGfx.fillStyle(0xcc1840);
    batGfx.fillEllipse(38, 14, 6, 6);
    batGfx.fillStyle(0x0a0006);
    batGfx.fillEllipse(38, 15, 4, 5);
    batGfx.fillStyle(0xffffff);
    batGfx.fillCircle(40, 12, 1);

    // ---- Tiny cute nose ----
    batGfx.fillStyle(0xe060a0);
    batGfx.fillEllipse(33, 19, 5, 3);
    batGfx.fillStyle(0x180830);
    batGfx.fillEllipse(31, 18, 2, 2);  // left nostril
    batGfx.fillEllipse(35, 18, 2, 2);  // right nostril

    batGfx.generateTexture('bat', 66, 30);
    batGfx.destroy();

    // ── Bird — texture loaded from /bird.svg via preload() ──────────────────────

    // ── Particle ────────────────────────────────────────────────────────────
    const particleGfx = this.make.graphics({ x: 0, y: 0 });
    particleGfx.fillStyle(0x3ab83a);
    particleGfx.fillCircle(4, 4, 4);
    particleGfx.generateTexture('particle', 8, 8);
    particleGfx.destroy();

    // ── Spark (explosion particle, 10×10 diamond) ───────────────────────────
    const sparkGfx = this.make.graphics({ x: 0, y: 0 });
    sparkGfx.fillStyle(0xffffff);
    sparkGfx.fillPoints([
      { x: 5, y: 0 }, { x: 10, y: 5 }, { x: 5, y: 10 }, { x: 0, y: 5 },
    ], true);
    sparkGfx.generateTexture('spark', 10, 10);
    sparkGfx.destroy();

    // ── Stars ───────────────────────────────────────────────────────────────
    const starGfx = this.make.graphics({ x: 0, y: 0 });
    starGfx.fillStyle(0xffffff);
    starGfx.fillCircle(2, 2, 2);
    starGfx.generateTexture('star', 4, 4);
    starGfx.destroy();

    // ── Moon (sickle / crescent, 90×90) ─────────────────────────────────────────
    const moonGfx = this.make.graphics({ x: 0, y: 0 });

    const MCX = 45, MCY = 45;   // texture centre
    const RO  = 38;              // outer (lit) circle radius
    // Bite circle — larger offset to produce a narrow crescent tip (sickle)
    const BCX = MCX + 24, BCY = MCY - 6, RB = 36;
    const BG   = 0x0f3460;      // matches game background

    // Soft glow halo
    moonGfx.fillStyle(0xfff0aa, 0.45);
    moonGfx.fillCircle(MCX, MCY, RO + 7);

    // Outer lit disc
    moonGfx.fillStyle(0xf5e580);
    moonGfx.fillCircle(MCX, MCY, RO);

    // Inner limb gradient: a slightly smaller darker circle off-centre
    moonGfx.fillStyle(0xd4be48);
    moonGfx.fillCircle(MCX + 5, MCY + 5, RO - 3);

    // Restore lit face
    moonGfx.fillStyle(0xf0df72);
    moonGfx.fillCircle(MCX - 2, MCY - 2, RO - 7);

    // Bright top-left highlight
    moonGfx.fillStyle(0xfff8bb);
    moonGfx.fillEllipse(MCX - 12, MCY - 16, 20, 14);

    // Craters (all within the crescent — left-side of disc)
    type Crater = { x: number; y: number; r: number };
    const craters2: Crater[] = [
      { x: MCX - 14, y: MCY - 8,  r: 6 },
      { x: MCX - 20, y: MCY + 12, r: 5 },
      { x: MCX - 5,  y: MCY + 18, r: 4 },
      { x: MCX - 22, y: MCY - 22, r: 4 },
      { x: MCX + 2,  y: MCY - 20, r: 3 },
    ];
    for (const c of craters2) {
      moonGfx.fillStyle(0xa89220);
      moonGfx.fillCircle(c.x + 1, c.y + 2, c.r);        // rim shadow
      moonGfx.fillStyle(c.r > 4 ? 0xcaae38 : 0xd8bc44);
      moonGfx.fillCircle(c.x, c.y, c.r);                 // floor
      moonGfx.fillStyle(0xb09c2c);
      moonGfx.fillCircle(c.x - 1, c.y - 1, c.r - 1);    // inner shadow
      moonGfx.fillStyle(0xf8e87a);
      moonGfx.fillCircle(c.x + Math.round(c.r * 0.5), c.y + Math.round(c.r * 0.5), Math.max(1, c.r - 3)); // shine
    }

    // Carve the sickle: overdraw bite circle in background colour
    moonGfx.fillStyle(BG);
    moonGfx.fillCircle(BCX, BCY, RB);

    // Re-add a thin bright edge on the inner sickle arc (terminator rim)
    // Draw a ring of small ellipses along the inner arc for a glowing rim effect
    moonGfx.fillStyle(0xffee99, 0.7);
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const a = -Math.PI * 0.55 + (Math.PI * 1.1 * i) / steps;
      const ex = BCX + Math.cos(a) * RB;
      const ey = BCY + Math.sin(a) * RB;
      // Only draw if inside the outer moon circle
      const dx = ex - MCX, dy = ey - MCY;
      if (dx * dx + dy * dy <= (RO + 2) * (RO + 2)) {
        moonGfx.fillEllipse(ex, ey, 5, 4);
      }
    }

    moonGfx.generateTexture('moon', 90, 90);
    moonGfx.destroy();

    this.scene.start('MenuScene');
  }
}
