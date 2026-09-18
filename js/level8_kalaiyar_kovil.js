/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 8: "KALAIYAR KOVIL"
 * Chapter 2 Turning Point: Sivaganga Fort High Rampart & Inner Sanctuary (June 25, 1772).
 *
 * Protagonist: Rani Velu Nachiyar.
 * Historical Event: The fall of King Muthuvaduganatha Periyavudaya Thevar in battle
 * at the sacred temple-fort of Kalaiyar Kovil during a surprise colonial assault
 * by the British East India Company (Gen. Joseph Smith & Abraham Bonjour) and the Nawab of Arcot.
 *
 * DESIGN PHILOSOPHY & RESTRAINT:
 * - Depicts the tragedy with historical dignity, reverence, and restraint.
 * - Zero graphic violence or gore. All violence is implied through distance and silence.
 * - The level never travels to the battlefield itself.
 * - A scripted, contemplative sequence with no player controls, no combat, no fail state.
 *
 * VISUAL STAGING:
 * - Area Art 1: The highest fort rampart stone window at dawn overlooking the distant
 *   sacred Kalaiyar Kovil horizon. Soft hazy silhouettes of temple towers, morning mist,
 *   and distant muted battlefield haze (DANGER-DEEP #7A1F1F) leagues away.
 * - Area Art 2: The quiet interior stone sanctuary. The silent messenger arrives with
 *   the king's royal signet draped in silk.
 * - Symbolic Extinction: The solitary brass oil lamp dwindles and goes completely black.
 *   Complete darkness and silence for several solemn seconds.
 * - Rekindling of the Ember: A spark catches, growing into a steady warm ember.
 *   Velu Nachiyar takes up the signet and vows the liberation of Sivaganga.
 *
 * INPUT SHIELDING:
 * - All player input (keyboard, mouse, pointer, touch, wheel) is intercepted in the
 *   capturing phase and swallowed to prevent any stray input from queuing or altering state.
 * - All extraneous HUD elements are suppressed; only the single oil lamp remains.
 *
 * COLOR TOKENS:
 * - BG-MAROON #2E1F1B
 * - BG-TERRACOTTA #B85042
 * - ACCENT-GOLD #D9A441
 * - ACCENT-SAGE #A7BEAE
 * - DANGER-DEEP #7A1F1F (used strictly for distant, muted battlefield haze)
 *
 * TYPOGRAPHY:
 * - Lore in Cambria, numerals in Calibri. English text only.
 */

class SivagangaLevel8KalaiyarKovil {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.isTransitioning = false;
    this.animationId = null;
    this.lastTimestamp = 0;
    this.elapsedTime = 0;

    // Viewport dimensions
    this.width = 960;
    this.height = 540;

    // Act Timeline (in seconds)
    // Act 1: 0s – 14s (The Dawn Watch at Rampart Window)
    // Act 2: 14s – 27s (Interior Sanctuary & The Silent Messenger)
    // Act 3: 27s – 40s (Emotional Low Point: Total Darkness & Lamp Extinction)
    // Act 4: 40s – 54s (Rekindling of the Ember & The Oath of Exile)
    // Act 5: 54s+ (Transition to Level 9 & Resolution Card)
    this.currentAct = 1;

    // Symbolic Lamp State
    // Opacity: 1.0 (steady) -> wavering -> 0.0 (extinguished) -> 0.38 (warm ember)
    this.lampOpacity = 1.0;
    this.lampFlickerPhase = 0;
    this.isEmberMode = false;

    // Distant Battlefield Haze Pulse
    this.hazePhase = 0;

    // Narrative Lines for Each Act (Cambria)
    this.actNarratives = {
      1: [
        { start: 1.0, end: 6.5, text: "June 25, 1772. Dawn breaks over the sacred forest of Kalaiyar Kovil." },
        { start: 7.0, end: 13.5, text: "King Muthuvaduganatha has ridden to the temple to offer morning prayers... unaware that colonial forces and the Nawab's sepoys have surrounded the grove." }
      ],
      2: [
        { start: 14.5, end: 19.8, text: "Leagues away at Sivaganga, the distant rumble of foreign cannon falls silent." },
        { start: 20.5, end: 26.5, text: "A royal courier enters the inner sanctuary in profound silence, bearing the King's broken signet wrapped in raw silk." }
      ],
      3: [
        { start: 27.5, end: 32.5, text: "King Muthuvaduganatha Periyavudaya Thevar has fallen at the temple steps." },
        { start: 33.0, end: 38.5, text: "The sovereign flame of Sivaganga is extinguished." },
        { start: 38.8, end: 40.0, text: "In the stillness of the dark, all of Tamil country holds its breath." }
      ],
      4: [
        { start: 40.5, end: 46.0, text: "Yet out of the darkness, a quiet ember endures." },
        { start: 46.8, end: 53.0, text: "Velu Nachiyar clenches the signet, shielding her young daughter Vellachi. 'While we draw breath, Sivaganga shall never be conquered.'" }
      ],
      5: [
        { start: 54.0, end: 999.0, text: "The eight-year exile into the Virupakshi hills begins. The foundation for the resistance is laid." }
      ]
    };

    // Particles array (drifting morning mist, quiet temple incense, sparks of the ember)
    this.particles = [];

    // Bound Input Blocker handler
    this.boundBlockInput = this.blockInput.bind(this);
    this.boundResize = this.handleResize.bind(this);
  }

  // =========================================================================
  // LIFECYCLE & INPUT SHIELDING
  // =========================================================================
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    this.isTransitioning = false;
    this.elapsedTime = 0;
    this.currentAct = 1;
    this.lampOpacity = 1.0;
    this.isEmberMode = false;
    this.particles = [];

    this.handleResize();

    // Configure HUD: keep header buttons and Journey Ribbon active and responsive
    this.configureDiegeticHUDForVigil(true);

    // Audio Atmosphere
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.playTempleBell();
    }

    // Canvas click listener to advance acts or jump to Level 9
    this.boundCanvasClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (this.width / rect.width);
      const my = (e.clientY - rect.top) * (this.height / rect.height);
      this.handleCanvasClick(mx, my);
    };
    this.canvas.addEventListener('click', this.boundCanvasClick);

    // Standard non-capturing keydown listener
    this.boundKeyDown = (e) => {
      if (!this.isActive) return;
      if (e.key === '9' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.transitionToLevel9();
        return;
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentAct === 5) {
          this.transitionToLevel9();
        } else {
          this.advanceActFast();
        }
      }
    };
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);
  }

  start() {
    this.isActive = true;
    this.lastTimestamp = performance.now();
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const loop = (timestamp) => {
      if (!this.isActive) return;
      const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.canvas && this.boundCanvasClick) {
      this.canvas.removeEventListener('click', this.boundCanvasClick);
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }

    // Restore full diegetic HUD
    this.configureDiegeticHUDForVigil(false);

    window.removeEventListener('resize', this.boundResize);
  }

  handleCanvasClick(mx, my) {
    // 1. Check direct skip to Level 9 button
    if (this.skipTo9Btn) {
      const b = this.skipTo9Btn;
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        this.transitionToLevel9();
        return;
      }
    }

    // 2. Check Act 5 resolution card button
    if (this.currentAct === 5) {
      this.handleAct5Click(mx, my);
      return;
    }

    // 3. Fast-forward through acts
    this.advanceActFast();
  }

  advanceActFast() {
    if (this.currentAct === 1) {
      this.elapsedTime = 14.1;
    } else if (this.currentAct === 2) {
      this.elapsedTime = 27.1;
    } else if (this.currentAct === 3) {
      this.elapsedTime = 40.1;
    } else if (this.currentAct === 4) {
      this.elapsedTime = 54.1;
    } else if (this.currentAct === 5) {
      this.transitionToLevel9();
    }
    if (window.sivagangaAudio) {
      window.sivagangaAudio.playFocusPing?.();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    const stage = document.querySelector('.level-canvas-stage');
    if (stage) {
      this.canvas.width = stage.clientWidth || 960;
      this.canvas.height = stage.clientHeight || 540;
    }
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  /**
   * Diegetic HUD configuration during the sacred vigil.
   * Keeps the Journey Ribbon and Level Header buttons 100% interactive so
   * the player can always navigate or advance simply.
   */
  configureDiegeticHUDForVigil(enableVigil) {
    const bells = document.querySelector('.hud-archway-bells');
    const bangles = document.querySelector('.hud-wrist-bangles');
    const garland = document.querySelector('.hud-intel-garland');
    const ribbon = document.getElementById('journey-ribbon');
    const headerBtns = document.querySelectorAll('.level-header-row button');

    if (enableVigil) {
      if (bells) bells.style.display = 'none';
      if (bangles) bangles.style.display = 'none';
      if (garland) garland.style.display = 'none';
      if (ribbon) {
        ribbon.style.opacity = '1';
        ribbon.style.pointerEvents = 'auto';
      }
      headerBtns.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
      });
    } else {
      if (bells) bells.style.display = '';
      if (bangles) bangles.style.display = '';
      if (garland) garland.style.display = '';
      if (ribbon) {
        ribbon.style.opacity = '1';
        ribbon.style.pointerEvents = 'auto';
      }
      headerBtns.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
      });
    }
  }

  // =========================================================================
  // UPDATE & SCRIPTED TIMELINE
  // =========================================================================
  update(dt) {
    this.elapsedTime += dt;
    const t = this.elapsedTime;

    // Timeline Act Transitions
    if (t < 14.0) {
      this.currentAct = 1;
    } else if (t < 27.0) {
      this.currentAct = 2;
    } else if (t < 40.0) {
      this.currentAct = 3;
    } else if (t < 54.0) {
      this.currentAct = 4;
    } else {
      this.currentAct = 5;
    }

    // Symbolic Lamp Opacity Curve:
    // Act 1 (0..14): Steady low flame (0.95..1.0)
    // Act 2 (14..27): Flickering down (0.8 -> 0.45)
    // Act 3 (27..40): Plunging to 0 at t=29.0s and remaining in pitch darkness until t=39.5s
    // Act 4 (40..54): Re-igniting from 0 to warm steady ember (0.35..0.45)
    // Act 5 (54+): Enduring warm ember (0.40)
    if (this.currentAct === 1) {
      this.lampOpacity = 0.95 + Math.sin(t * 2.5) * 0.05;
      this.isEmberMode = false;
    } else if (this.currentAct === 2) {
      const p = (t - 14.0) / 13.0;
      this.lampOpacity = (1.0 - p * 0.6) + Math.sin(t * 4.0) * 0.08 * (1.0 - p);
      this.isEmberMode = false;
    } else if (this.currentAct === 3) {
      if (t < 29.5) {
        // Fast wavering fade out into black
        const fadeProgress = (t - 27.0) / 2.5;
        this.lampOpacity = Math.max(0, 0.4 * (1.0 - fadeProgress));
      } else {
        // Pitch darkness
        this.lampOpacity = 0.0;
      }
      this.isEmberMode = false;
    } else if (this.currentAct === 4) {
      // Rekindling the ember
      this.isEmberMode = true;
      const emberProgress = Math.min(1.0, (t - 40.0) / 4.0);
      this.lampOpacity = emberProgress * 0.38 + Math.sin(t * 1.8) * 0.03;
    } else {
      // Act 5: Steady ember
      this.isEmberMode = true;
      this.lampOpacity = 0.40 + Math.sin(t * 1.5) * 0.03;
    }

    // Sync diegetic HUD Diya flame element in the top niche
    this.syncHUDLamp();

    // Haze pulsing
    this.hazePhase += dt * 0.8;

    // Update floating particles (morning mist & ember sparks)
    this.updateParticles(dt);
  }

  syncHUDLamp() {
    const flameEl = document.querySelector('.diya-flame');
    if (!flameEl) return;

    if (this.lampOpacity <= 0.02) {
      flameEl.style.opacity = '0';
      flameEl.style.height = '0px';
      flameEl.style.filter = 'none';
    } else if (this.isEmberMode) {
      // Dim, warm, steadfast ember
      flameEl.style.opacity = (this.lampOpacity * 2).toFixed(2);
      flameEl.style.height = '10px';
      flameEl.style.filter = 'drop-shadow(0 -2px 6px rgba(217, 164, 65, 0.6))';
    } else {
      // Normal low flame
      flameEl.style.opacity = this.lampOpacity.toFixed(2);
      flameEl.style.height = `${Math.round(10 + this.lampOpacity * 10)}px`;
      flameEl.style.filter = `drop-shadow(0 -3px 8px rgba(217, 164, 65, ${this.lampOpacity * 0.8}))`;
    }
  }

  updateParticles(dt) {
    // Spawn subtle particles based on act
    if (this.currentAct === 1 && Math.random() < 0.15) {
      // Distant morning mist wisp
      this.particles.push({
        type: 'mist',
        x: Math.random() * this.width,
        y: 120 + Math.random() * 80,
        vx: 8 + Math.random() * 10,
        vy: -1 + Math.random() * 2,
        size: 30 + Math.random() * 40,
        alpha: 0.15,
        life: 6.0
      });
    } else if (this.currentAct === 4 && Math.random() < 0.25) {
      // Tiny golden spark from the rekindled wick
      this.particles.push({
        type: 'spark',
        x: this.width * 0.5 + (Math.random() - 0.5) * 12,
        y: this.height * 0.54,
        vx: (Math.random() - 0.5) * 16,
        vy: -20 - Math.random() * 25,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.9,
        life: 1.6
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // RENDERING PIPELINE (Painterly 2D/2.5D Muted & Still Art)
  // =========================================================================
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Deep Maroon Background Base
    ctx.fillStyle = '#2E1F1B'; // BG-MAROON
    ctx.fillRect(0, 0, w, h);

    if (this.currentAct === 1) {
      // ---------------------------------------------------------------------
      // ACT 1: HIGH RAMPART ARTIFACT WINDOW AT DAWN
      // ---------------------------------------------------------------------
      this.renderDawnHorizon(ctx, w, h);
      this.renderRampartWindowFrame(ctx, w, h);
      this.renderVeluSilhouetteRampart(ctx, w, h);
      this.renderSolitaryLamp(ctx, w * 0.32, h * 0.68, false);
    } else if (this.currentAct === 2) {
      // ---------------------------------------------------------------------
      // ACT 2: INTERIOR SANCTUARY & THE SILENT MESSENGER
      // ---------------------------------------------------------------------
      this.renderInteriorSanctuary(ctx, w, h);
      this.renderSilentMessengerScene(ctx, w, h);
      this.renderSolitaryLamp(ctx, w * 0.50, h * 0.62, false);
    } else if (this.currentAct === 3) {
      // ---------------------------------------------------------------------
      // ACT 3: EXTINCTION & SOLEMN DARKNESS
      // ---------------------------------------------------------------------
      this.renderDarknessScene(ctx, w, h);
    } else if (this.currentAct === 4) {
      // ---------------------------------------------------------------------
      // ACT 4: REKINDLED EMBER & THE VOW
      // ---------------------------------------------------------------------
      this.renderRekindledEmberScene(ctx, w, h);
      this.renderSolitaryLamp(ctx, w * 0.50, h * 0.62, true);
    } else {
      // ---------------------------------------------------------------------
      // ACT 5: SACRED OATH & RESOLUTION CARD
      // ---------------------------------------------------------------------
      this.renderRekindledEmberScene(ctx, w, h);
      this.renderSolitaryLamp(ctx, w * 0.50, h * 0.62, true);
      this.renderAct5ResolutionCard(ctx, w, h);
    }

    // Render Atmospheric Mist / Ember Sparks
    this.renderParticles(ctx);

    // Render Poetic Narration Banner in Cambria
    this.renderNarrationText(ctx, w, h);

    // Render In-Game Flow Controls Bar
    this.renderControlsBar(ctx, w, h);

    ctx.restore();
  }

  renderControlsBar(ctx, w, h) {
    if (this.currentAct === 5) {
      this.skipTo9Btn = null;
      return;
    }

    ctx.save();
    const barH = 34;
    const barY = h - barH - 8;

    // Status prompt
    ctx.fillStyle = 'rgba(46, 31, 27, 0.88)';
    ctx.fillRect(16, barY, 310, barH);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, barY, 310, barH);

    ctx.fillStyle = '#eeddcc';
    ctx.font = '12px "Cambria", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Act ${this.currentAct} of 5 · Click or [SPACE] to advance ▶`, 28, barY + 21);

    // Direct advance button to Level 9
    const btnW = 300;
    const btnH = barH;
    const btnX = w - btnW - 16;
    this.skipTo9Btn = { x: btnX, y: barY, w: btnW, h: btnH };

    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.roundRect(btnX, barY, btnW, btnH, 4);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12.5px "Calibri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Advance to Level 9: Flight to Virupachi →', btnX + btnW / 2, barY + 21);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SCENE 1: DAWN HORIZON OVER KALAIYAR KOVIL
  // -------------------------------------------------------------------------
  renderDawnHorizon(ctx, w, h) {
    ctx.save();

    // Dawn Sky Gradient: Deep muted maroon rising into pale amber/terracotta
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    skyGrad.addColorStop(0, '#1c110e');
    skyGrad.addColorStop(0.4, '#381c17');
    skyGrad.addColorStop(0.8, '#633126'); // BG-TERRACOTTA blend
    skyGrad.addColorStop(1.0, '#915338');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant Foothills (Western Ghats foothills towards Kalaiyar Kovil)
    ctx.fillStyle = '#1c100d';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    ctx.bezierCurveTo(w * 0.25, h * 0.48, w * 0.45, h * 0.58, w * 0.7, h * 0.50);
    ctx.bezierCurveTo(w * 0.85, h * 0.46, w * 0.95, h * 0.52, w, h * 0.49);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Sacred Kalaiyar Kovil Temple Tower Silhouette (Distant, peaceful, sacred)
    const gopX = w * 0.68;
    const gopY = h * 0.38;
    const gopW = 28;
    const gopH = 55;

    ctx.fillStyle = '#140c0a';
    // Stepped tiered temple gopuram
    ctx.beginPath();
    ctx.moveTo(gopX - gopW * 0.5, gopY + gopH);
    ctx.lineTo(gopX - gopW * 0.28, gopY + gopH * 0.3);
    ctx.lineTo(gopX - gopW * 0.15, gopY);
    ctx.lineTo(gopX + gopW * 0.15, gopY);
    ctx.lineTo(gopX + gopW * 0.28, gopY + gopH * 0.3);
    ctx.lineTo(gopX + gopW * 0.5, gopY + gopH);
    ctx.closePath();
    ctx.fill();

    // Gold Kalasam finials at gopuram crest
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(gopX, gopY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Distant palm silhouettes across the forest plain
    ctx.fillStyle = '#140c0a';
    const treeXs = [w * 0.48, w * 0.53, w * 0.61, w * 0.76, w * 0.82];
    treeXs.forEach((tx, idx) => {
      const ty = h * 0.52 + (idx % 3) * 6;
      ctx.fillRect(tx, ty - 28, 2, 28);
      ctx.beginPath();
      ctx.arc(tx + 1, ty - 28, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // DISTANT MUTED BATTLEFIELD HAZE (DANGER-DEEP #7A1F1F)
    // Strictly distant smoke plumes mixed with morning mist leagues away; NO GORE.
    const hazeAlpha = 0.22 + Math.sin(this.hazePhase) * 0.06;
    const hazeGrad = ctx.createRadialGradient(w * 0.66, h * 0.48, 10, w * 0.66, h * 0.48, 120);
    hazeGrad.addColorStop(0, `rgba(122, 31, 31, ${hazeAlpha * 1.5})`); // DANGER-DEEP #7A1F1F
    hazeGrad.addColorStop(0.5, `rgba(90, 26, 26, ${hazeAlpha * 0.8})`);
    hazeGrad.addColorStop(1, 'rgba(46, 31, 27, 0)');
    ctx.fillStyle = hazeGrad;
    ctx.beginPath();
    ctx.arc(w * 0.66, h * 0.48, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderRampartWindowFrame(ctx, w, h) {
    ctx.save();

    // Arched Granite Window Aperture in Deep Fort Stone
    // Left massive stone wall
    ctx.fillStyle = '#261713';
    ctx.fillRect(0, 0, w * 0.24, h);

    // Right massive stone wall
    ctx.fillRect(w * 0.88, 0, w * 0.12, h);

    // Arched window sill and head
    ctx.beginPath();
    ctx.moveTo(w * 0.24, 0);
    ctx.lineTo(w * 0.88, 0);
    ctx.lineTo(w * 0.88, h * 0.18);
    ctx.bezierCurveTo(w * 0.70, h * 0.05, w * 0.42, h * 0.05, w * 0.24, h * 0.18);
    ctx.closePath();
    ctx.fill();

    // Heavy Granite Window Sill (Lower foreground)
    const sillY = h * 0.68;
    ctx.fillStyle = '#1e110d';
    ctx.fillRect(w * 0.18, sillY, w * 0.75, h - sillY);

    // Carved stone moulding border in ACCENT-GOLD
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.24, sillY);
    ctx.lineTo(w * 0.88, sillY);
    ctx.stroke();

    // Subtle stone filigree
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.18);
    ctx.bezierCurveTo(w * 0.42, h * 0.05, w * 0.70, h * 0.05, w * 0.88, h * 0.18);
    ctx.stroke();

    ctx.restore();
  }

  renderVeluSilhouetteRampart(ctx, w, h) {
    ctx.save();

    // Velu Nachiyar in dignified profile at the window ledge
    // Dark silhouette in #120907 with subtle terracotta rim light
    const vx = w * 0.40;
    const vy = h * 0.45;

    ctx.fillStyle = '#120907';

    // Royal hair bun / crown knot with jasmine garland silhouette
    ctx.beginPath();
    ctx.arc(vx + 6, vy - 28, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head profile looking right toward the distant horizon
    ctx.beginPath();
    ctx.arc(vx, vy - 24, 11, 0, Math.PI * 2);
    ctx.fill();

    // Elegant saree drape / shawl across shoulder down to sill
    ctx.beginPath();
    ctx.moveTo(vx - 8, vy - 14);
    ctx.bezierCurveTo(vx - 22, vy + 30, vx - 18, vy + 90, vx - 26, vy + 125);
    ctx.lineTo(vx + 34, vy + 125);
    ctx.bezierCurveTo(vx + 26, vy + 60, vx + 16, vy + 10, vx + 8, vy - 14);
    ctx.closePath();
    ctx.fill();

    // Soft rim lighting along spine in ACCENT-SAGE
    ctx.strokeStyle = 'rgba(167, 190, 174, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(vx + 6, vy - 35);
    ctx.bezierCurveTo(vx + 16, vy + 20, vx + 28, vy + 75, vx + 34, vy + 125);
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SCENE 2: INTERIOR SACRED SANCTUARY
  // -------------------------------------------------------------------------
  renderInteriorSanctuary(ctx, w, h) {
    ctx.save();

    // Dim Sanctuary Stone Walls in Deep Maroon
    ctx.fillStyle = '#221410';
    ctx.fillRect(0, 0, w, h);

    // Carved Terracotta Temple Pillars
    const pillars = [w * 0.12, w * 0.32, w * 0.68, w * 0.88];
    pillars.forEach(px => {
      ctx.fillStyle = '#3a1f18'; // BG-TERRACOTTA dark
      ctx.fillRect(px - 16, 0, 32, h);

      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - 16, 0, 32, h);

      // Yali bracket capital at top
      ctx.fillStyle = '#54261d';
      ctx.fillRect(px - 26, 40, 52, 16);
      ctx.strokeRect(px - 26, 40, 52, 16);
    });

    // Central Temple Arch in Background
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.7);
    ctx.lineTo(w * 0.32, h * 0.28);
    ctx.arc(w * 0.5, h * 0.28, w * 0.18, Math.PI, 0);
    ctx.lineTo(w * 0.68, h * 0.7);
    ctx.stroke();

    // Stone Pedestal for the Diya Lamp
    ctx.fillStyle = '#1e110d';
    ctx.fillRect(w * 0.44, h * 0.62, w * 0.12, h * 0.28);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.44, h * 0.62, w * 0.12, h * 0.28);

    ctx.restore();
  }

  renderSilentMessengerScene(ctx, w, h) {
    ctx.save();

    // Kneeling Royal Messenger on Left
    const mx = w * 0.28;
    const my = h * 0.60;

    ctx.fillStyle = '#140c09';
    // Kneeling posture
    ctx.beginPath();
    ctx.arc(mx, my - 22, 9, 0, Math.PI * 2); // head bowed
    ctx.ellipse(mx, my + 14, 18, 26, 0.2, 0, Math.PI * 2); // torso
    ctx.fill();

    // Draped white silk cloth holding the King's signet
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    ctx.ellipse(mx + 22, my + 10, 14, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // King's Golden Royal Signet & Ceremonial Dagger Token
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(mx + 22, my + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(mx + 18, my + 6, 8, 2);

    // Velu Nachiyar on Right, in contemplation
    const vx = w * 0.72;
    const vy = h * 0.52;

    ctx.fillStyle = '#120907';
    ctx.beginPath();
    ctx.arc(vx, vy - 26, 11, 0, Math.PI * 2);
    ctx.bezierCurveTo(vx - 20, vy + 20, vx - 15, vy + 70, vx - 22, vy + 105);
    ctx.lineTo(vx + 28, vy + 105);
    ctx.bezierCurveTo(vx + 22, vy + 50, vx + 14, vy + 10, vx + 8, vy - 26);
    ctx.closePath();
    ctx.fill();

    // Saree border in ACCENT-GOLD
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(vx - 6, vy - 10);
    ctx.lineTo(vx - 18, vy + 75);
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SCENE 3: EMOTIONAL LOW POINT — TOTAL DARKNESS
  // -------------------------------------------------------------------------
  renderDarknessScene(ctx, w, h) {
    ctx.save();

    // Complete solemn blackness
    ctx.fillStyle = '#080403';
    ctx.fillRect(0, 0, w, h);

    if (this.lampOpacity > 0.01) {
      // Dying flame wavering in the center before dying completely
      this.renderSolitaryLamp(ctx, w * 0.5, h * 0.55, false);
    } else {
      // A solitary thin wisp of fading smoke in the pitch black
      ctx.strokeStyle = 'rgba(167, 190, 174, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const st = this.elapsedTime;
      ctx.moveTo(w * 0.5, h * 0.55);
      ctx.bezierCurveTo(
        w * 0.5 + Math.sin(st * 2) * 6, h * 0.51,
        w * 0.5 - Math.sin(st * 3) * 10, h * 0.46,
        w * 0.5 + Math.sin(st * 1.5) * 8, h * 0.40
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SCENE 4: THE REKINDLED EMBER & THE VOW
  // -------------------------------------------------------------------------
  renderRekindledEmberScene(ctx, w, h) {
    ctx.save();

    // Deep Dark Room with Warm Central Golden Halo
    ctx.fillStyle = '#0d0705';
    ctx.fillRect(0, 0, w, h);

    // Warm radial glow from the rekindled ember
    const emberGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.60, 2,
      w * 0.5, h * 0.60, 240
    );
    emberGrad.addColorStop(0, 'rgba(217, 164, 65, 0.28)'); // ACCENT-GOLD halo
    emberGrad.addColorStop(0.5, 'rgba(184, 80, 66, 0.12)'); // BG-TERRACOTTA warmth
    emberGrad.addColorStop(1, 'rgba(13, 7, 5, 0)');
    ctx.fillStyle = emberGrad;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.60, 240, 0, Math.PI * 2);
    ctx.fill();

    // Illuminated Profile of Velu Nachiyar clutching the royal signet
    const vx = w * 0.64;
    const vy = h * 0.48;

    ctx.fillStyle = '#1c100d';
    ctx.beginPath();
    ctx.arc(vx, vy - 26, 12, 0, Math.PI * 2);
    ctx.bezierCurveTo(vx - 22, vy + 20, vx - 18, vy + 80, vx - 24, vy + 120);
    ctx.lineTo(vx + 32, vy + 120);
    ctx.bezierCurveTo(vx + 24, vy + 60, vx + 16, vy + 10, vx + 10, vy - 26);
    ctx.closePath();
    ctx.fill();

    // Golden signet held firmly against her heart
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(vx - 4, vy + 25, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Infant daughter Vellachi in gentle embrace (silhouette)
    ctx.fillStyle = '#140c0a';
    ctx.beginPath();
    ctx.arc(vx + 16, vy + 38, 7, 0, Math.PI * 2);
    ctx.ellipse(vx + 14, vy + 56, 9, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SOLITARY BRASS OIL LAMP (THE DIEGETIC SOUL OF SIVAGANGA)
  // -------------------------------------------------------------------------
  renderSolitaryLamp(ctx, lx, ly, isEmber) {
    if (this.lampOpacity <= 0.005) return;
    ctx.save();

    // 1. Carved Brass Diya Vessel (Agal Vilakku)
    ctx.fillStyle = '#8f6826'; // Cast brass
    ctx.beginPath();
    ctx.ellipse(lx, ly, 24, 8, 0, 0, Math.PI);
    ctx.lineTo(lx - 24, ly - 4);
    ctx.ellipse(lx, ly - 4, 24, 8, 0, Math.PI, 0);
    ctx.lineTo(lx + 24, ly);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cotton wick pointing slightly right
    ctx.fillStyle = '#1c120c';
    ctx.fillRect(lx + 14, ly - 7, 6, 3);

    const wickX = lx + 18;
    const wickY = ly - 6;

    // 2. Flame / Ember Rendering based on State
    if (isEmber) {
      // Warm, steady, enduring ember
      const emberRadius = 4.5 + Math.sin(this.elapsedTime * 3) * 0.8;

      // Soft amber halo
      const halo = ctx.createRadialGradient(wickX, wickY, 1, wickX, wickY, 16);
      halo.addColorStop(0, 'rgba(235, 165, 50, 0.9)');
      halo.addColorStop(0.6, 'rgba(217, 164, 65, 0.4)');
      halo.addColorStop(1, 'rgba(217, 164, 65, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(wickX, wickY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Deep glowing ember core
      ctx.fillStyle = '#ff8c1a';
      ctx.beginPath();
      ctx.arc(wickX, wickY, emberRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff4cc';
      ctx.beginPath();
      ctx.arc(wickX, wickY, emberRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Full or flickering low flame
      const fH = (16 + Math.sin(this.elapsedTime * 6) * 3) * this.lampOpacity;
      const fW = (6 + Math.sin(this.elapsedTime * 4) * 1) * this.lampOpacity;

      // Outer golden flame
      ctx.fillStyle = `rgba(217, 164, 65, ${this.lampOpacity * 0.95})`;
      ctx.beginPath();
      ctx.moveTo(wickX - fW, wickY);
      ctx.quadraticCurveTo(wickX - fW * 0.5, wickY - fH * 0.6, wickX, wickY - fH);
      ctx.quadraticCurveTo(wickX + fW * 0.5, wickY - fH * 0.6, wickX + fW, wickY);
      ctx.closePath();
      ctx.fill();

      // Inner white/bright core
      ctx.fillStyle = `rgba(255, 245, 210, ${this.lampOpacity * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(wickX - fW * 0.4, wickY);
      ctx.quadraticCurveTo(wickX, wickY - fH * 0.5, wickX + fW * 0.4, wickY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // SCENE 5: ACT 5 RESOLUTION & TRANSITION TO LEVEL 9
  // -------------------------------------------------------------------------
  renderAct5ResolutionCard(ctx, w, h) {
    ctx.save();

    const cw = Math.min(580, w * 0.72);
    const ch = 150;
    const cx = (w - cw) / 2;
    const cy = h - ch - 48;

    // Parchment card
    ctx.fillStyle = 'rgba(38, 23, 19, 0.92)';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 8);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner gold border
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 5, cy + 5, cw - 10, ch - 10);

    // Card Header Tag
    ctx.font = 'bold 11px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE'; // ACCENT-SAGE
    ctx.textAlign = 'center';
    ctx.fillText('CHAPTER II · SACRED VIGIL COMPLETED (1772)', w / 2, cy + 24);

    // Card Title
    ctx.font = 'bold 16px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText('The Vow of Kalaiyar Kovil Sealed', w / 2, cy + 46);

    ctx.font = 'italic 12.5px "Cambria", serif';
    ctx.fillStyle = '#e8dcc8';
    ctx.fillText('Sivaganga will not fall in despair. The eight-year alliance begins.', w / 2, cy + 68);

    // Action Button: Proceed to Level 9 (The Udaiyaal Regiment)
    const btnW = 320;
    const btnH = 38;
    const btnX = w / 2 - btnW / 2;
    const btnY = cy + 88;

    this.act5Btn = { x: btnX, y: btnY, w: btnW, h: btnH };

    ctx.fillStyle = '#B85042'; // BG-TERRACOTTA
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 5);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 13px "Cambria", serif';
    ctx.fillStyle = '#fdfbf7';
    ctx.fillText('Continue into the Virupakshi Hills [ENTER] →', w / 2, btnY + 24);

    ctx.restore();
  }

  handleAct5Click(mx, my) {
    if (!this.act5Btn) return;
    const b = this.act5Btn;
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
      this.transitionToLevel9();
    }
  }

  // -------------------------------------------------------------------------
  // POETIC SUBTITLES (Cambria)
  // -------------------------------------------------------------------------
  renderNarrationText(ctx, w, h) {
    const t = this.elapsedTime;
    const lines = this.actNarratives[this.currentAct] || [];

    // Find active narration line
    let activeLine = null;
    for (const l of lines) {
      if (t >= l.start && t <= l.end) {
        activeLine = l;
        break;
      }
    }

    if (!activeLine) return;
    ctx.save();

    // Fade in/out calculation
    const fadeIn = Math.min(1.0, (t - activeLine.start) / 0.8);
    const fadeOut = Math.min(1.0, (activeLine.end - t) / 0.8);
    const alpha = Math.max(0, Math.min(1.0, Math.min(fadeIn, fadeOut)));

    ctx.font = 'italic 15px "Cambria", serif';
    ctx.fillStyle = `rgba(244, 232, 218, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Text backing shadow for clarity against any art background
    ctx.shadowColor = 'rgba(14, 8, 6, 0.9)';
    ctx.shadowBlur = 8;

    const ty = (this.currentAct === 5) ? h * 0.28 : h * 0.86;
    this.wrapText(ctx, activeLine.text, w / 2, ty, w * 0.82, 22);

    ctx.restore();
  }

  renderParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      if (p.type === 'mist') {
        ctx.fillStyle = `rgba(167, 190, 174, ${p.alpha * (p.life / 6.0)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = `rgba(217, 164, 65, ${p.alpha * (p.life / 1.6)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  // =========================================================================
  // TRANSITION TO LEVEL 9
  // =========================================================================
  transitionToLevel9() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    // 1. Record Atomic Victory for Level 8
    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(8, {
        memorialHonor: 'Sovereign of Kalaiyar Kovil',
        vowForged: true
      });
      window.sivagangaSave.unlockLevel(9);
      window.sivagangaSave.recordChronicleNode(8);
    }

    // 2. Perform Palm-Leaf Screen Wipe into Level 9
    const proceed = () => {
      this.stop();
      if (window.sivagangaRouter) {
        window.sivagangaRouter.navigate('/level/09-flight-to-virupachi');
      } else if (window.sivagangaGameplay) {
        window.sivagangaGameplay.start(9);
      }
      this.isTransitioning = false;
    };

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(proceed, () => {
        this.isTransitioning = false;
      });
    } else {
      proceed();
    }
  }
}

// Global Level 8 Singleton Instance
window.sivagangaKalaiyarKovil = new SivagangaLevel8KalaiyarKovil();
