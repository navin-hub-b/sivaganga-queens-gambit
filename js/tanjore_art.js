/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - TANJORE ARCHITECTURAL ART ENGINE
 * Procedural 2D/2.5D illustration: Granite fort ramparts, Gopuram silhouettes,
 * Stepped temple tanks (Kalyanis), Pillared Mandapams, and Torchlight rim-lighting.
 */

class SivagangaTanjoreArt {
  constructor() {
    this.ambientCanvas = null;
    this.ambientCtx = null;
    this.particles = [];
    this.animationFrameId = null;
  }

  init() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    if (!this.ambientCanvas) return;
    this.ambientCtx = this.ambientCanvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    this.initEmbers();
    this.startLoop();
  }

  handleResize() {
    if (!this.ambientCanvas) return;
    this.ambientCanvas.width = window.innerWidth;
    this.ambientCanvas.height = window.innerHeight;
    this.drawBackgroundScene();
  }

  initEmbers() {
    const count = 38;
    this.particles = [];
    const w = this.ambientCanvas?.width || window.innerWidth;
    const h = this.ambientCanvas?.height || window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  startLoop() {
    const loop = () => {
      this.renderFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  renderFrame() {
    if (!this.ambientCtx || !this.ambientCanvas) return;
    const ctx = this.ambientCtx;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    // Clear particle layer (preserving static background)
    ctx.clearRect(0, 0, w, h);

    // Redraw static architectural silhouettes
    this.drawBackgroundScene();

    // Floating torch embers
    ctx.save();
    for (let p of this.particles) {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const alphaClamped = Math.max(0.1, Math.min(0.85, p.alpha));
      ctx.fillStyle = `rgba(217, 164, 65, ${alphaClamped})`;
      ctx.shadowColor = '#D9A441';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draws layered painterly Tamil fort ramparts, gopurams, and torchlight rim-lighting.
   */
  drawBackgroundScene() {
    const ctx = this.ambientCtx;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    // Layer 1: Distant midnight sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1a110e');
    skyGrad.addColorStop(0.5, '#261713');
    skyGrad.addColorStop(1, '#2E1F1B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Layer 2: Distant Western Ghats mountain ridges
    ctx.fillStyle = '#201512';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.bezierCurveTo(w * 0.25, h * 0.58, w * 0.45, h * 0.68, w * 0.7, h * 0.54);
    ctx.bezierCurveTo(w * 0.85, h * 0.48, w * 0.95, h * 0.62, w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Layer 3: Gopuram Temple Gateway silhouette in distance (Tanjore tiered profile)
    this.drawGopuramSilhouette(ctx, w * 0.78, h * 0.56, 120, 180);

    // Layer 4: Granite Fort Ramparts with Crenellations (Midground)
    ctx.fillStyle = '#2b1b17';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78);

    const wallTop = h * 0.78;
    const crenWidth = 28;
    const crenHeight = 16;
    let x = 0;
    let step = 0;

    while (x < w) {
      if (step % 2 === 0) {
        ctx.lineTo(x, wallTop - crenHeight);
        ctx.lineTo(Math.min(w, x + crenWidth), wallTop - crenHeight);
      } else {
        ctx.lineTo(x, wallTop);
        ctx.lineTo(Math.min(w, x + crenWidth), wallTop);
      }
      x += crenWidth;
      step++;
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Layer 5: Watchtower Bastion on left rampart
    this.drawBastionTower(ctx, w * 0.12, wallTop - 110, 80, 120);

    // Layer 6: Golden Torchlight Rim-Lighting along wall ridges
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#D9A441';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, wallTop - crenHeight);
    ctx.lineTo(w * 0.35, wallTop - crenHeight);
    ctx.moveTo(w * 0.55, wallTop - crenHeight);
    ctx.lineTo(w, wallTop - crenHeight);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  }

  /**
   * Draws a classic 7-tier South Indian Gopuram silhouette with Kalasam finials.
   */
  drawGopuramSilhouette(ctx, cx, baseBottom, width, height) {
    ctx.save();
    ctx.fillStyle = '#1c1210';
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.2)';
    ctx.lineWidth = 1.5;

    const tiers = 6;
    const tierH = height / (tiers + 1);

    for (let t = 0; t < tiers; t++) {
      const prog = t / tiers;
      const tW = width * (1 - prog * 0.55);
      const tY = baseBottom - t * tierH;

      // Tier rectangle with curved cornice
      ctx.fillRect(cx - tW / 2, tY - tierH, tW, tierH);
      ctx.strokeRect(cx - tW / 2, tY - tierH, tW, tierH);
    }

    // Barrel vaulted Shikhara roof & 3 Kalasam spires
    const topW = width * 0.42;
    const topY = baseBottom - tiers * tierH;
    ctx.beginPath();
    ctx.arc(cx, topY, topW / 2, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Kalasams (Brass finials)
    [-topW * 0.3, 0, topW * 0.3].forEach(offset => {
      ctx.fillStyle = 'rgba(217, 164, 65, 0.75)';
      ctx.beginPath();
      ctx.arc(cx + offset, topY - topW / 2 - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx + offset - 1, topY - topW / 2, 2, 6);
    });

    ctx.restore();
  }

  /**
   * Draws a fortified Dravidian octagonal granite bastion with arrow slits.
   */
  drawBastionTower(ctx, cx, topY, width, height) {
    ctx.save();
    ctx.fillStyle = '#221512';
    ctx.fillRect(cx - width / 2, topY, width, height);

    // Overhanging cornice
    ctx.fillStyle = '#2f1d19';
    ctx.fillRect(cx - (width * 1.15) / 2, topY, width * 1.15, 14);

    // Arrow slit windows
    ctx.fillStyle = '#0f0806';
    [-width * 0.25, width * 0.25].forEach(ox => {
      ctx.fillRect(cx + ox - 3, topY + 30, 6, 26);
    });

    // Warm brazier fire glow on top of bastion
    ctx.fillStyle = 'rgba(217, 164, 65, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, topY, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws a Stepped Temple Tank (Kalyani) for water-based levels.
   */
  static drawKalyani(ctx, x, y, w, h) {
    ctx.save();
    // Stepped granite terraces
    const steps = 5;
    for (let s = 0; s < steps; s++) {
      const inset = s * 14;
      const shade = 30 + s * 8;
      ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 15})`;
      ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.2)';
      ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    }
    // Deep green temple tank water in center
    const waterInset = steps * 14;
    ctx.fillStyle = '#1c3029';
    ctx.fillRect(x + waterInset, y + waterInset, w - waterInset * 2, h - waterInset * 2);
    ctx.restore();
  }
}

// Global Tanjore art singleton
window.sivagangaArt = new SivagangaTanjoreArt();
