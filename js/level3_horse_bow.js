/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 3: "HORSE AND BOW"
 * Outer Ramparts of Ramanathapuram Fort (1740s).
 * Young Velu Nachiyar trains in equestrian horsemanship and mounted archery:
 * - Riding at controlled pace along the sun-baked rampart track
 * - Precision lead-aim minigame targeting static and swinging garland rings
 * - Diegetic woven garland-ring reticle:
 *     * Tightens gold (#D9A441, FOCUSED/ACTIVE) as aim lines up
 *     * Loosens to warm amber warning (#D48828, never DANGER-DEEP #7A1F1F) as aim drifts
 *     * Snaps full gold on landed impact
 * - Mentor NPC (Master Veera Maravar) adjusting guidance and skills threshold (5/7 hits)
 * - Strict delta-time & input spike clamping to ensure stability across alt-tab and frame surges
 * - Connected in-world bastion archway pathway leading to Level 4
 */

class SivagangaLevel3HorseBow {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.animationId = null;
    this.lastTime = 0;

    // Arena dimensions
    this.width = 800;
    this.height = 500;

    // Track & Camera (Rampart Length)
    this.trackLength = 3200;
    this.cameraX = 0;
    this.targetCameraX = 0;

    // Game Phase:
    // 0: Mounting & First Screen (Horse saddled by watchtower, garland preview)
    // 1: Riding & Archery Drill (Static -> Swinging targets)
    // 2: Drill Completed / Gateway Unlocked
    this.phase = 0;
    this.isTransitioning = false;
    this.victoryRecorded = false;

    // Protagonist & Horse
    this.horse = {
      x: 220,
      y: 350,
      width: 76,
      height: 52,
      speed: 0,
      targetSpeed: 0,
      baseCanterSpeed: 140, // pixels per second
      maxSpeed: 230,
      minSpeed: 70,
      isMounted: false,
      gaitPhase: 0,
      lastHoofbeat: 0,
      facing: 1, // 1 = right
      reinsY: 0,
      diyaFlicker: 0
    };

    // Young Velu Nachiyar (Rider/Archer)
    this.velu = {
      x: 170,
      y: 362,
      drawnBow: false,
      drawCharge: 0, // 0.0 -> 1.0
      drawTime: 0,
      arrowsLeft: 12,
      facing: 1
    };

    // Reticle System (Garland Ring)
    this.reticle = {
      x: 400,
      y: 220,
      targetX: 400,
      targetY: 220,
      lastValidX: 400,
      lastValidY: 220,
      radius: 22,
      currentRadius: 22,
      tightness: 0, // 0.0 (loose/drift) -> 1.0 (perfect gold focus)
      state: 'idle', // 'idle', 'focused', 'drift', 'snap'
      snapTimer: 0,
      snapX: 0,
      snapY: 0,
      particles: []
    };

    // Flying Arrows Array
    this.arrows = [];

    // Target Garland Rings (3 Static + 4 Swinging = 7 Targets)
    this.targets = [
      // Static targets on carved teak posts
      { id: 1, trackX: 550, baseY: 220, radius: 24, type: 'static', hit: false, swingAngle: 0, swingSpeed: 0, swingRange: 0 },
      { id: 2, trackX: 950, baseY: 190, radius: 22, type: 'static', hit: false, swingAngle: 0, swingSpeed: 0, swingRange: 0 },
      { id: 3, trackX: 1350, baseY: 230, radius: 22, type: 'static', hit: false, swingAngle: 0, swingSpeed: 0, swingRange: 0 },
      // Swinging pendulum targets on fortress gallows (lead-aim required)
      { id: 4, trackX: 1800, baseY: 200, radius: 22, type: 'swinging', hit: false, swingAngle: 0, swingSpeed: 2.2, swingRange: 45 },
      { id: 5, trackX: 2200, baseY: 180, radius: 20, type: 'swinging', hit: false, swingAngle: 1.2, swingSpeed: 2.8, swingRange: 55 },
      { id: 6, trackX: 2550, baseY: 220, radius: 20, type: 'swinging', hit: false, swingAngle: 0.5, swingSpeed: 3.2, swingRange: 50 },
      { id: 7, trackX: 2850, baseY: 195, radius: 20, type: 'swinging', hit: false, swingAngle: 2.0, swingSpeed: 3.5, swingRange: 60 }
    ];

    this.hitCount = 0;
    this.requiredHits = 5; // Majority threshold
    this.totalTargets = 7;

    // Mentor NPC (Master Veera Maravar)
    this.mentor = {
      x: 100,
      y: 350,
      message: 'Mount your saddled horse, Princess Velu. Feel the rhythm of the rampart breeze!',
      timer: 6.0,
      alpha: 1.0
    };

    // Atmosphere: Dust Motes floating in sunbeams
    this.dustMotes = [];
    for (let i = 0; i < 40; i++) {
      this.dustMotes.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        size: 1.2 + Math.random() * 2.2,
        speedY: -0.2 - Math.random() * 0.35,
        speedX: 0.15 + Math.random() * 0.25,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      aimUp: false,
      aimDown: false,
      aimLeft: false,
      aimRight: false,
      draw: false
    };

    this.mouse = {
      x: 400,
      y: 220,
      isDown: false,
      used: false
    };

    // Bound listeners for clean detachment
    this._onKeyDown = (e) => this.handleKeyDown(e);
    this._onKeyUp = (e) => this.handleKeyUp(e);
    this._onMouseMove = (e) => this.handleMouseMove(e);
    this._onMouseDown = (e) => this.handleMouseDown(e);
    this._onMouseUp = (e) => this.handleMouseUp(e);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handleResize();
    this.resetState();
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  resetState() {
    this.phase = 0;
    this.isTransitioning = false;
    this.victoryRecorded = false;
    this.cleanupGatewayUI();
    this.cameraX = 0;
    this.targetCameraX = 0;
    this.hitCount = 0;
    this.arrows = [];

    this.horse.x = 220;
    this.horse.y = Math.min(360, this.height * 0.72);
    this.horse.speed = 0;
    this.horse.targetSpeed = 0;
    this.horse.isMounted = false;
    this.horse.gaitPhase = 0;

    this.velu.x = 165;
    this.velu.y = this.horse.y + 10;
    this.velu.drawnBow = false;
    this.velu.drawCharge = 0;

    this.reticle.x = this.width * 0.55;
    this.reticle.y = this.height * 0.45;
    this.reticle.targetX = this.reticle.x;
    this.reticle.targetY = this.reticle.y;
    this.reticle.lastValidX = this.reticle.x;
    this.reticle.lastValidY = this.reticle.y;
    this.reticle.tightness = 0;
    this.reticle.state = 'idle';
    this.reticle.snapTimer = 0;
    this.reticle.particles = [];

    this.targets.forEach(t => {
      t.hit = false;
      t.swingAngle = Math.random() * Math.PI;
    });

    this.mentor.message = 'Mount your saddled horse, Princess Velu. The outer rampart awaits your bow!';
    this.mentor.timer = 6.0;
  }

  start() {
    this.isActive = true;
    this.lastTime = performance.now();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this._onMouseMove);
      this.canvas.addEventListener('mousedown', this._onMouseDown);
      window.addEventListener('mouseup', this._onMouseUp);
    }

    const loop = (currentTime) => {
      if (!this.isActive) return;
      // Fixed delta calculation with hard clamp to prevent lag surges/alt-tab fling
      const rawDelta = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      const dt = Math.min(Math.max(0.001, rawDelta), 0.05); // Strict 50ms clamp

      this.update(dt);
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    this.isActive = false;
    this.cleanupGatewayUI();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('mousedown', this._onMouseDown);
      window.removeEventListener('mouseup', this._onMouseUp);
    }
  }

  // =========================================================================
  // INPUT HANDLING
  // =========================================================================
  handleKeyDown(e) {
    if (!this.isActive) return;

    if (e.key === 'h' || e.key === 'H' || e.key === 'F1') {
      e.preventDefault();
      if (window.sivagangaGameplay) {
        window.sivagangaGameplay.toggleLoreModal();
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'e') {
      if (this.phase === 0) {
        // Mount horse from first screen
        this.mountHorse();
        return;
      }
      if (this.phase >= 2 || (this.hitCount >= this.requiredHits && this.victoryRecorded)) {
        // Instant advance to Level 4
        e.preventDefault();
        this.transitionToLevel4();
        return;
      }
    }

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') this.keys.forward = true;
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') this.keys.backward = true;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.keys.aimLeft = true;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.keys.aimRight = true;
    if (e.key === ' ' && this.phase >= 1) {
      this.keys.draw = true;
      if (!this.velu.drawnBow) {
        this.velu.drawnBow = true;
        this.velu.drawCharge = 0.1;
        if (window.sivagangaAudio) window.sivagangaAudio.playBowstringDraw(0.2);
      }
    }
  }

  handleKeyUp(e) {
    if (!this.isActive) return;

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') this.keys.forward = false;
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') this.keys.backward = false;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.keys.aimLeft = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.keys.aimRight = false;
    if (e.key === ' ' && this.phase >= 1) {
      this.keys.draw = false;
      if (this.velu.drawnBow) {
        this.looseArrow();
      }
    }
  }

  handleMouseMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Scale to internal canvas coordinates
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.mouse.x = clientX * scaleX;
    this.mouse.y = clientY * scaleY;
    this.mouse.used = true;

    // Clamp input explicitly
    this.reticle.targetX = Math.min(Math.max(40, this.mouse.x), this.width - 40);
    this.reticle.targetY = Math.min(Math.max(40, this.mouse.y), this.height - 70);
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;
    if (this.phase === 0) {
      this.mountHorse();
      return;
    }
    if (this.phase >= 1) {
      this.mouse.isDown = true;
      this.velu.drawnBow = true;
      this.velu.drawCharge = 0.1;
      if (window.sivagangaAudio) window.sivagangaAudio.playBowstringDraw(0.2);
    }
  }

  handleMouseUp(e) {
    if (e.button !== 0) return;
    if (this.phase >= 1 && this.velu.drawnBow) {
      this.mouse.isDown = false;
      this.looseArrow();
    }
  }

  mountHorse() {
    this.phase = 1;
    this.horse.isMounted = true;
    this.horse.targetSpeed = this.horse.baseCanterSpeed;
    this.mentor.message = 'Splendid mount! Keep the canter steady and train your lead-aim on the garland rings!';
    this.mentor.timer = 5.0;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playFocusPing();
      window.sivagangaAudio.playHoofbeat(0.8);
    }
  }

  // =========================================================================
  // GAMEPLAY UPDATE LOOP & INPUT SPIKE CLAMPING
  // =========================================================================
  update(dt) {
    // 1. Dust motes floating in sunbeam light
    this.dustMotes.forEach(m => {
      m.y += m.speedY;
      m.x += m.speedX + Math.sin(m.phase) * 0.3;
      m.phase += dt * 1.8;
      if (m.y < 0) {
        m.y = this.height + 10;
        m.x = Math.random() * this.width;
      }
      if (m.x > this.width) m.x = 0;
    });

    // 2. Mentor dialogue timer
    if (this.mentor.timer > 0) {
      this.mentor.timer -= dt;
    }

    // 3. Reticle Snap Burst Decay
    if (this.reticle.snapTimer > 0) {
      this.reticle.snapTimer -= dt * 2.5;
    }
    for (let i = this.reticle.particles.length - 1; i >= 0; i--) {
      const p = this.reticle.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2.0;
      if (p.life <= 0) {
        this.reticle.particles.splice(i, 1);
      }
    }

    // 4. Update targets (Swinging pendulums)
    this.targets.forEach(t => {
      if (t.type === 'swinging') {
        t.swingAngle += t.swingSpeed * dt;
      }
    });

    // 5. Phase 0: First Screen idle animation
    if (this.phase === 0) {
      this.horse.diyaFlicker = Math.sin(performance.now() * 0.008) * 2.5;
      // Reticle previews on the target post
      this.reticle.targetX = 550 - this.cameraX;
      this.reticle.targetY = 220;
      this.smoothReticle(dt);
      return;
    }

    // 6. Phase 1 & 2: Equestrian Riding & Canter Dynamics
    // Speed adjustments via keys
    if (this.keys.forward) {
      this.horse.targetSpeed = Math.min(this.horse.maxSpeed, this.horse.targetSpeed + 90 * dt);
    } else if (this.keys.backward) {
      this.horse.targetSpeed = Math.max(this.horse.minSpeed, this.horse.targetSpeed - 110 * dt);
    } else {
      // Return gently to baseline canter pace
      const diff = this.horse.baseCanterSpeed - this.horse.targetSpeed;
      this.horse.targetSpeed += diff * dt * 1.5;
    }

    // Smooth speed acceleration
    this.horse.speed += (this.horse.targetSpeed - this.horse.speed) * dt * 3.5;

    // Hard clamp horse speed
    this.horse.speed = Math.min(Math.max(this.horse.minSpeed * 0.8, this.horse.speed), this.horse.maxSpeed * 1.1);

    // Advance horse along track
    this.horse.x += this.horse.speed * dt;

    // Hoofbeat audio cadence synchronized with canter gait
    this.horse.gaitPhase += dt * (this.horse.speed / 28);
    if (Math.sin(this.horse.gaitPhase) > 0.85 && performance.now() - this.horse.lastHoofbeat > 280) {
      this.horse.lastHoofbeat = performance.now();
      if (window.sivagangaAudio) {
        window.sivagangaAudio.playHoofbeat(this.horse.speed / this.horse.maxSpeed);
      }
    }

    // Camera tracks horse with look-ahead
    const desiredCameraX = this.horse.x - this.width * 0.32;
    this.targetCameraX = Math.min(Math.max(0, desiredCameraX), this.trackLength - this.width);

    // Smooth camera tracking with strict clamp
    this.cameraX += (this.targetCameraX - this.cameraX) * dt * 4.0;
    this.cameraX = Math.min(Math.max(0, this.cameraX), this.trackLength - this.width);

    // Check if horse completed the track run, passed final targets with victory, or exhausted arrows
    const passedTargets = this.horse.x >= 2850;
    const endOfTrack = this.horse.x >= this.trackLength - 280;
    const outOfArrows = this.velu.arrowsLeft <= 0 && this.arrows.length === 0;

    if (this.phase === 1 && (endOfTrack || (this.hitCount >= this.requiredHits && (passedTargets || this.horse.x >= 2600)) || outOfArrows)) {
      this.evaluateDrillCompletion();
    }

    // 7. Reticle Positioning & Input Spikes Recovery
    if (!this.mouse.used) {
      // Keyboard aiming support
      const aimSpeed = 260;
      if (this.keys.aimLeft) this.reticle.targetX -= aimSpeed * dt;
      if (this.keys.aimRight) this.reticle.targetX += aimSpeed * dt;
      if (this.keys.aimUp) this.reticle.targetY -= aimSpeed * dt;
      if (this.keys.aimDown) this.reticle.targetY += aimSpeed * dt;
    }

    this.smoothReticle(dt);

    // 8. Bowstring Draw Dynamics
    if (this.velu.drawnBow) {
      this.velu.drawCharge = Math.min(1.0, this.velu.drawCharge + dt * 2.2);
    }

    // 9. Lead-Aim Calculation & Garland Reticle Tightening
    this.calculateLeadAimFeedback();

    // 10. Update Flying Arrows
    this.updateArrows(dt);
  }

  // Clamps reticle and handles graceful recovery from spikes/NaN
  smoothReticle(dt) {
    if (isNaN(this.reticle.targetX) || isNaN(this.reticle.targetY)) {
      this.reticle.targetX = this.reticle.lastValidX;
      this.reticle.targetY = this.reticle.lastValidY;
    }

    // Clamp target within screen boundaries
    this.reticle.targetX = Math.min(Math.max(40, this.reticle.targetX), this.width - 40);
    this.reticle.targetY = Math.min(Math.max(40, this.reticle.targetY), this.height - 70);

    // Exponential smoothing
    this.reticle.x += (this.reticle.targetX - this.reticle.x) * dt * 12.0;
    this.reticle.y += (this.reticle.targetY - this.reticle.y) * dt * 12.0;

    // Hard boundary clamp on actual reticle
    this.reticle.x = Math.min(Math.max(35, this.reticle.x), this.width - 35);
    this.reticle.y = Math.min(Math.max(35, this.reticle.y), this.height - 65);

    this.reticle.lastValidX = this.reticle.x;
    this.reticle.lastValidY = this.reticle.y;
  }

  // Calculates lead-aim proximity and tightens the reticle
  calculateLeadAimFeedback() {
    let closestDist = 9999;
    let closestTarget = null;
    const arrowSpeed = 680; // pixels/sec

    const horseScreenX = this.horse.x - this.cameraX;
    const horseScreenY = this.horse.y - 20;

    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (t.hit) continue;

      const targetScreenX = t.trackX - this.cameraX;
      let targetScreenY = t.baseY;
      let targetVelY = 0;

      if (t.type === 'swinging') {
        targetScreenY += Math.sin(t.swingAngle) * t.swingRange;
        targetVelY = Math.cos(t.swingAngle) * t.swingRange * t.swingSpeed;
      }

      // Only evaluate targets ahead of the horse
      if (targetScreenX > horseScreenX - 40 && targetScreenX < this.width + 60) {
        // Compute travel time
        const dx = targetScreenX - horseScreenX;
        const dy = targetScreenY - horseScreenY;
        const distToTarget = Math.hypot(dx, dy);
        const flightTime = distToTarget / arrowSpeed;

        // Lead point: where the target will be on impact
        const leadTargetX = targetScreenX;
        const leadTargetY = targetScreenY + targetVelY * flightTime;

        // Distance from reticle to predicted lead point
        const aimDist = Math.hypot(this.reticle.x - leadTargetX, this.reticle.y - leadTargetY);
        if (aimDist < closestDist) {
          closestDist = aimDist;
          closestTarget = t;
        }
      }
    }

    if (closestDist < 120) {
      // Within lead window: Tighten gold (#D9A441)
      const factor = Math.max(0, 1.0 - closestDist / 120);
      this.reticle.tightness = factor;
      this.reticle.currentRadius = 24 - factor * 8; // contracts from 24 down to 16
      this.reticle.state = factor > 0.65 ? 'focused' : 'active';
    } else {
      // Drifting off-target: Loosen to warm amber (#D48828, never DANGER-DEEP)
      this.reticle.tightness = 0;
      this.reticle.currentRadius = 26;
      this.reticle.state = 'drift';
    }
  }

  looseArrow() {
    this.velu.drawnBow = false;
    const charge = Math.max(0.3, this.velu.drawCharge);
    this.velu.drawCharge = 0;

    const startX = this.horse.x + 25;
    const startY = this.horse.y - 20;

    const targetWorldX = this.reticle.x + this.cameraX;
    const targetWorldY = this.reticle.y;

    const dx = targetWorldX - startX;
    const dy = targetWorldY - startY;
    const dist = Math.hypot(dx, dy);
    const speed = 720 * charge;

    this.arrows.push({
      x: startX,
      y: startY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      targetX: targetWorldX,
      targetY: targetWorldY,
      life: 1.8,
      charge: charge
    });

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playArrowRelease();
    }
  }

  updateArrows(dt) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.life -= dt;

      // Check collision with targets
      for (let j = 0; j < this.targets.length; j++) {
        const t = this.targets[j];
        if (t.hit) continue;

        let targetY = t.baseY;
        if (t.type === 'swinging') {
          targetY += Math.sin(t.swingAngle) * t.swingRange;
        }

        const hitDist = Math.hypot(a.x - t.trackX, a.y - targetY);
        if (hitDist <= t.radius + 14) {
          // Landed shot!
          t.hit = true;
          this.hitCount++;
          this.spawnGarlandSnapParticles(t.trackX - this.cameraX, targetY);

          this.reticle.snapTimer = 1.0;
          this.reticle.snapX = t.trackX - this.cameraX;
          this.reticle.snapY = targetY;

          if (window.sivagangaAudio) {
            window.sivagangaAudio.playGarlandSnap(true);
          }

          // Mentor encouragement & early threshold unlock
          if (this.hitCount === 1) {
            this.mentor.message = 'Direct hit! The garland ring shattered clean!';
            this.mentor.timer = 4.0;
          } else if (this.hitCount >= this.requiredHits && !this.victoryRecorded) {
            this.victoryRecorded = true;
            this.mentor.message = 'Superb accuracy! Bastion Rampart Gate Unlocked! Press [Enter] or tap button to advance to Scribes\' Hall.';
            this.mentor.timer = 6.0;

            if (window.sivagangaSave) {
              window.sivagangaSave.recordLevelVictory(3, {
                accuracyHits: this.hitCount,
                totalTargets: this.totalTargets,
                discipline: 'Equestrian Archery Mastered'
              });
              window.sivagangaSave.unlockLevel(4);
              window.sivagangaSave.recordChronicleNode(3);
            }
            this.showBastionGatewayPrompt();
          } else if (this.hitCount === this.totalTargets) {
            this.mentor.message = 'FLAWLESS! Every single garland ring cleaved in canter!';
            this.mentor.timer = 5.0;
            setTimeout(() => {
              if (this.isActive && this.phase === 1) {
                this.evaluateDrillCompletion();
              }
            }, 800);
          }

          this.arrows.splice(i, 1);
          break;
        }
      }

      if (a.life <= 0 && this.arrows[i]) {
        this.arrows.splice(i, 1);
      }
    }
  }

  spawnGarlandSnapParticles(screenX, screenY) {
    // Jasmine white and Marigold orange/gold floral burst
    const colors = ['#ffffff', '#fdf3d0', '#D9A441', '#b85042', '#e89f28'];
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.reticle.particles.push({
        x: screenX,
        y: screenY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 3.5,
        life: 0.7 + Math.random() * 0.5
      });
    }
  }

  showBastionGatewayPrompt() {
    if (document.getElementById('level3-bastion-gateway-banner')) return;
    const stage = document.querySelector('.level-canvas-stage') || document.getElementById('view-level-play');
    if (!stage) return;

    const banner = document.createElement('div');
    banner.id = 'level3-bastion-gateway-banner';
    banner.className = 'level3-gateway-banner';
    banner.style.position = 'absolute';
    banner.style.bottom = '42px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = '45';
    banner.style.background = 'rgba(32, 18, 14, 0.95)';
    banner.style.border = '2px solid #D9A441';
    banner.style.borderRadius = '6px';
    banner.style.padding = '12px 24px';
    banner.style.display = 'flex';
    banner.style.flexDirection = 'column';
    banner.style.alignItems = 'center';
    banner.style.gap = '8px';
    banner.style.boxShadow = '0 6px 20px rgba(0,0,0,0.7), 0 0 16px rgba(217, 164, 65, 0.4)';

    banner.innerHTML = `
      <div style="color: #A7BEAE; font-family: 'Calibri', sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">
        Ramparts Cleared &bull; Bastion Gate Unlocked
      </div>
      <div style="color: #fcedcb; font-family: 'Cambria', serif; font-size: 14px; text-align: center;">
        Archery threshold achieved (${this.hitCount}/${this.totalTargets} Rings Struck).
      </div>
      <button id="level3-proceed-btn" class="btn-tamil btn-primary" style="margin-top: 4px; padding: 8px 22px; font-size: 13.5px; cursor: pointer;">
        Proceed to Level 4: Tongues of the World [Enter] &rarr;
      </button>
    `;

    stage.appendChild(banner);

    const btn = banner.querySelector('#level3-proceed-btn');
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.transitionToLevel4();
      };
    }
  }

  cleanupGatewayUI() {
    const banner = document.getElementById('level3-bastion-gateway-banner');
    if (banner) banner.remove();
  }

  evaluateDrillCompletion() {
    if (this.phase >= 2) return;
    this.phase = 2;

    if (this.hitCount >= this.requiredHits) {
      // Threshold satisfied: Unlock Bastion Gate to Level 4
      this.mentor.message = `TRIUMPH! ${this.hitCount}/${this.totalTargets} garland rings struck. Outer Bastion Rampart Gate is unlocked!`;
      this.mentor.timer = 6.0;

      if (window.sivagangaAudio) {
        window.sivagangaAudio.playResolveBell();
      }

      if (window.sivagangaSave) {
        window.sivagangaSave.recordLevelVictory(3, {
          accuracyHits: this.hitCount,
          totalTargets: this.totalTargets,
          discipline: 'Equestrian Archery Mastered'
        });
        window.sivagangaSave.unlockLevel(4);
        window.sivagangaSave.recordChronicleNode(3);
      }

      this.showBastionGatewayPrompt();

      // Auto-step through the gateway after a brief reflection period (2.4s)
      setTimeout(() => {
        if (this.isActive && !this.isTransitioning) {
          this.transitionToLevel4();
        }
      }, 2400);
    } else {
      // Under threshold: Friendly mentor reset for practice
      this.mentor.message = `${this.hitCount}/${this.totalTargets} hits. Turn the horse around and try again, Princess Velu!`;
      this.mentor.timer = 5.0;

      setTimeout(() => {
        if (this.isActive) {
          this.resetState();
          this.phase = 1;
          this.horse.isMounted = true;
          this.horse.targetSpeed = this.horse.baseCanterSpeed;
        }
      }, 3000);
    }
  }

  transitionToLevel4() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.cleanupGatewayUI();

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(3, {
        accuracyHits: this.hitCount,
        totalTargets: this.totalTargets,
        discipline: 'Equestrian Archery Mastered'
      });
      window.sivagangaSave.unlockLevel(4);
      window.sivagangaSave.recordChronicleNode(3);
    }

    const proceed = () => {
      this.stop();
      if (window.sivagangaRouter) {
        window.sivagangaRouter.routeTo('/level/04-tongues-of-the-world', { skipWipe: true });
      } else if (window.sivagangaGameplay) {
        window.sivagangaGameplay.start(4);
      }
      if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
      this.isTransitioning = false;
    };

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(
        proceed,
        () => {
          if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
          this.isTransitioning = false;
        }
      );
    } else {
      proceed();
    }
  }

  // =========================================================================
  // RENDERING PIPELINE (Hand-drawn 2D/2.5D Tamil Fort & Ramparts)
  // =========================================================================
  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Sun-baked Ramparts Skyline & Sky Gradient
    this.drawSkyAndSkyline(ctx, w, h);

    // 2. Distant Fort Battlements & Watchtowers (Parallax 0.3x)
    this.drawDistantTowers(ctx, w, h);

    // 3. Middleground Rampart Walls & Arrow Slits (Parallax 0.6x)
    this.drawRampartWall(ctx, w, h);

    // 4. Foreground Sandy Training Track & Markers
    this.drawRampartTrack(ctx, w, h);

    // 5. Target Posts & Garland Rings
    this.drawTargets(ctx, w, h);

    // 6. Mentor NPC (Master Veera Maravar)
    this.drawMentorNPC(ctx, w, h);

    // 7. Saddled Horse & Young Velu Nachiyar
    this.drawHorseAndRider(ctx, w, h);

    // 8. Flying Arrows
    this.drawArrows(ctx, w, h);

    // 9. Floating Sunlit Dust Motes
    this.drawDustMotes(ctx, w, h);

    // 10. In-World Secret Bastion Gateway (Unlocked after threshold)
    this.drawBastionGate(ctx, w, h);

    // 11. Diegetic Precision Garland-Ring Reticle
    this.drawGarlandReticle(ctx, w, h);

    // 12. Non-Obstructive Mentor Toast & Accuracy Pill
    this.drawHUD(ctx, w, h);
  }

  drawSkyAndSkyline(ctx, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#2E1F1B'); // BG-MAROON
    skyGrad.addColorStop(0.35, '#8c382d');
    skyGrad.addColorStop(0.7, '#B85042'); // BG-TERRACOTTA
    skyGrad.addColorStop(1, '#e3a968'); // Sunlit gold dust horizon

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Golden sun disc partially veiled behind watchtower haze
    const sunGrad = ctx.createRadialGradient(w * 0.78, 90, 10, w * 0.78, 90, 120);
    sunGrad.addColorStop(0, 'rgba(255, 245, 210, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(217, 164, 65, 0.45)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.78, 90, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDistantTowers(ctx, w, h) {
    ctx.save();
    const parallax = this.cameraX * 0.22;
    ctx.fillStyle = '#42241d';

    for (let x = -100; x < this.trackLength * 0.4; x += 320) {
      const screenX = x - parallax;
      if (screenX < -150 || screenX > w + 150) continue;

      // Watchtower base
      ctx.fillRect(screenX, h * 0.22, 54, h * 0.35);

      // Watchtower cornice & corbels
      ctx.fillRect(screenX - 8, h * 0.20, 70, 12);
      ctx.fillRect(screenX - 12, h * 0.18, 78, 8);

      // Gopuram-style pyramidal top
      ctx.beginPath();
      ctx.moveTo(screenX - 14, h * 0.18);
      ctx.lineTo(screenX + 27, h * 0.10);
      ctx.lineTo(screenX + 68, h * 0.18);
      ctx.closePath();
      ctx.fill();

      // Kalasam pinnacle
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(screenX + 25, h * 0.08, 4, 10);
      ctx.beginPath();
      ctx.arc(screenX + 27, h * 0.08, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#42241d';

      // Narrow arrow slits
      ctx.fillStyle = '#1c120f';
      ctx.fillRect(screenX + 23, h * 0.25, 8, 22);
      ctx.fillStyle = '#42241d';
    }
    ctx.restore();
  }

  drawRampartWall(ctx, w, h) {
    ctx.save();
    const parallax = this.cameraX * 0.55;

    // Outer battlements & crenellations
    const wallY = h * 0.44;
    ctx.fillStyle = '#633527';
    ctx.fillRect(0, wallY, w, h * 0.18);

    // Stone ashlar block lines
    ctx.strokeStyle = '#4a251b';
    ctx.lineWidth = 1.2;
    for (let y = wallY; y < wallY + h * 0.18; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Crenellations along top of rampart
    ctx.fillStyle = '#633527';
    for (let x = -80; x < this.trackLength; x += 64) {
      const screenX = x - parallax;
      if (screenX < -70 || screenX > w + 70) continue;
      ctx.fillRect(screenX, wallY - 22, 38, 22);
      ctx.strokeRect(screenX, wallY - 22, 38, 22);

      // Decorative Tanjore terracotta relief band
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(screenX + 6, wallY - 6, 26, 3);
      ctx.fillStyle = '#633527';
    }
    ctx.restore();
  }

  drawRampartTrack(ctx, w, h) {
    const trackY = h * 0.58;
    const trackH = h - trackY;

    // Warm sun-baked earth & sandstone paving gradient
    const trackGrad = ctx.createLinearGradient(0, trackY, 0, h);
    trackGrad.addColorStop(0, '#c7925e');
    trackGrad.addColorStop(0.3, '#b87c48');
    trackGrad.addColorStop(1, '#85512b');

    ctx.fillStyle = trackGrad;
    ctx.fillRect(0, trackY, w, trackH);

    // Sandy texture speckles
    ctx.fillStyle = 'rgba(245, 220, 175, 0.25)';
    const offset = Math.floor(this.cameraX) % 100;
    for (let x = -offset; x < w; x += 32) {
      ctx.fillRect(x, trackY + 12, 12, 2);
      ctx.fillRect(x + 18, trackY + 36, 16, 2.5);
      ctx.fillRect(x + 8, trackY + 68, 14, 2);
    }

    // Lower boundary stone curb
    ctx.fillStyle = '#42241d';
    ctx.fillRect(0, h - 14, w, 14);
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(0, h - 14, w, 2);
  }

  drawTargets(ctx, w, h) {
    this.targets.forEach(t => {
      const screenX = t.trackX - this.cameraX;
      if (screenX < -100 || screenX > w + 100) return;

      let targetY = t.baseY;
      if (t.type === 'swinging') {
        targetY += Math.sin(t.swingAngle) * t.swingRange;
      }

      ctx.save();

      if (t.type === 'static') {
        // Carved teak target post planted into stone
        ctx.fillStyle = '#42241d';
        ctx.fillRect(screenX - 4, targetY, 8, (h * 0.72) - targetY);
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(screenX - 4, targetY, 8, (h * 0.72) - targetY);

        // Crossbar
        ctx.fillRect(screenX - 16, targetY + 6, 32, 6);
      } else {
        // Fortress gallows support beam & hemp rope
        ctx.fillStyle = '#3a1f18';
        ctx.fillRect(screenX - 6, h * 0.28, 12, 14);
        // Rope
        ctx.strokeStyle = '#c49a62';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(screenX, h * 0.28 + 14);
        ctx.lineTo(screenX, targetY - t.radius);
        ctx.stroke();
      }

      if (!t.hit) {
        // Unbroken Woven Garland Ring (Jasmine & Marigold)
        // 1. Outer Marigold ring (warm gold/orange)
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(screenX, targetY, t.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Inner Jasmine ring (white/cream floral buds)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(screenX, targetY, t.radius - 2.5, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Flower bud knots around circumference
        for (let a = 0; a < 8; a++) {
          const ang = (Math.PI * 2 / 8) * a;
          const fx = screenX + Math.cos(ang) * t.radius;
          const fy = targetY + Math.sin(ang) * t.radius;
          ctx.fillStyle = a % 2 === 0 ? '#ffffff' : '#e68a22';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Central red vermilion hanging tassel
        ctx.strokeStyle = '#B85042';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, targetY + t.radius);
        ctx.lineTo(screenX, targetY + t.radius + 12);
        ctx.stroke();
      } else {
        // Broken garland remnant (shattered after landed hit)
        ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, targetY, t.radius * 0.7, 0, Math.PI * 1.2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  drawMentorNPC(ctx, w, h) {
    const screenX = this.mentor.x - this.cameraX;
    if (screenX < -120 || screenX > w + 120) return;
    const y = this.mentor.y;

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(screenX, y + 26, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Veera Maravar body (Master Weapons Tutor)
    ctx.fillStyle = '#612a20'; // Maroon robe
    ctx.fillRect(screenX - 10, y - 24, 20, 48);

    // Golden waist angavastram sash
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(screenX - 11, y, 22, 6);

    // Head & Royal Ramnad Turban
    ctx.fillStyle = '#8f4f2e';
    ctx.beginPath();
    ctx.arc(screenX, y - 36, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(screenX, y - 41, 12, Math.PI, 0);
    ctx.fill();

    // Holding cane/training bow
    ctx.strokeStyle = '#381c15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(screenX + 12, y - 30);
    ctx.lineTo(screenX + 12, y + 26);
    ctx.stroke();

    // Mentor tag
    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('MASTER VEERA MARAVAR', screenX, y - 56);
    ctx.font = '8px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Weapons & Equestrian Mentor', screenX, y - 46);

    ctx.restore();
  }

  drawHorseAndRider(ctx, w, h) {
    const screenX = this.horse.x - this.cameraX;
    const y = this.horse.y;
    const isMounted = this.horse.isMounted;

    ctx.save();

    // 1. Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const shadowStretch = 44 + Math.sin(this.horse.gaitPhase) * 6;
    ctx.beginPath();
    ctx.ellipse(screenX + 4, y + 28, shadowStretch, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gallop vertical bounce
    const bob = isMounted ? Math.sin(this.horse.gaitPhase * 2) * 4 : 0;

    // 2. Horse Body (Deep warm chestnut/maroon coat)
    ctx.fillStyle = '#54281f';
    ctx.beginPath();
    ctx.ellipse(screenX, y + bob, 38, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Arched Marwari Neck & Head
    ctx.beginPath();
    ctx.moveTo(screenX + 22, y - 10 + bob);
    ctx.lineTo(screenX + 44, y - 38 + bob);
    ctx.lineTo(screenX + 54, y - 28 + bob);
    ctx.lineTo(screenX + 34, y + 10 + bob);
    ctx.closePath();
    ctx.fill();

    // Muzzle
    ctx.beginPath();
    ctx.arc(screenX + 50, y - 28 + bob, 7, 0, Math.PI * 2);
    ctx.fill();

    // Curved lyre-shaped Marwari ears
    ctx.fillStyle = '#3d1c15';
    ctx.beginPath();
    ctx.moveTo(screenX + 41, y - 40 + bob);
    ctx.lineTo(screenX + 44, y - 49 + bob);
    ctx.lineTo(screenX + 46, y - 41 + bob);
    ctx.fill();

    // 4. Mane & Flowing Tail
    ctx.fillStyle = '#26110d';
    const tailWag = Math.sin(this.horse.gaitPhase) * 12;
    ctx.beginPath();
    ctx.moveTo(screenX - 36, y - 6 + bob);
    ctx.quadraticCurveTo(screenX - 58 + tailWag, y + 8, screenX - 52 + tailWag, y + 36);
    ctx.stroke();

    // 5. Four Legs (Animated gait cycles during canter)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#421e17';
    const legPhase = this.horse.gaitPhase;

    // Forelegs
    ctx.beginPath();
    ctx.moveTo(screenX + 24, y + 10 + bob);
    ctx.lineTo(screenX + 24 + Math.sin(legPhase) * 16, y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(screenX + 28, y + 10 + bob);
    ctx.lineTo(screenX + 28 - Math.sin(legPhase) * 14, y + 30);
    ctx.stroke();

    // Hindlegs
    ctx.beginPath();
    ctx.moveTo(screenX - 22, y + 10 + bob);
    ctx.lineTo(screenX - 22 + Math.cos(legPhase) * 16, y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(screenX - 26, y + 10 + bob);
    ctx.lineTo(screenX - 26 - Math.cos(legPhase) * 14, y + 30);
    ctx.stroke();

    // 6. Royal Saddle & Embroidery
    ctx.fillStyle = '#B85042'; // Terracotta saddle cloth
    ctx.fillRect(screenX - 16, y - 14 + bob, 32, 18);
    ctx.strokeStyle = '#D9A441'; // Gold embroidered trim
    ctx.lineWidth = 1.8;
    ctx.strokeRect(screenX - 16, y - 14 + bob, 32, 18);

    // 7. DIEGETIC SADDLE OIL LAMP (Morale Diya tucked into saddle edge)
    const lampX = screenX - 18;
    const lampY = y - 10 + bob;

    // Little brass vessel
    ctx.fillStyle = '#b8862d';
    ctx.beginPath();
    ctx.ellipse(lampX, lampY + 4, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flickering diya flame
    const flicker = Math.sin(performance.now() * 0.01) * 1.5;
    const diyaGrad = ctx.createRadialGradient(lampX, lampY + flicker, 1, lampX, lampY + flicker, 9);
    diyaGrad.addColorStop(0, '#ffffff');
    diyaGrad.addColorStop(0.4, '#fbe08e');
    diyaGrad.addColorStop(0.8, '#D9A441');
    diyaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = diyaGrad;
    ctx.beginPath();
    ctx.arc(lampX, lampY + flicker, 8, 0, Math.PI * 2);
    ctx.fill();

    // 8. Young Velu Nachiyar (Rider or Standing)
    if (isMounted) {
      const riderY = y - 32 + bob;

      // Body & Tunic
      ctx.fillStyle = '#8f2e22'; // Royal terracotta/vermilion silks
      ctx.fillRect(screenX - 7, riderY, 14, 22);

      // Gold sash
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(screenX - 8, riderY + 12, 16, 4);

      // Child Head & Hair Bun
      ctx.fillStyle = '#9e5a38';
      ctx.beginPath();
      ctx.arc(screenX + 2, riderY - 8, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f1412';
      ctx.beginPath();
      ctx.arc(screenX - 3, riderY - 11, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Archery Bow in hand
      ctx.strokeStyle = '#4a291b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(screenX + 16, riderY + 6, 16, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Bowstring
      ctx.strokeStyle = '#fcedcb';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(screenX + 16, riderY - 8);
      if (this.velu.drawnBow) {
        ctx.lineTo(screenX + 4, riderY + 6); // Drawn back string
        ctx.lineTo(screenX + 16, riderY + 20);
      } else {
        ctx.lineTo(screenX + 27, riderY + 6);
        ctx.lineTo(screenX + 16, riderY + 20);
      }
      ctx.stroke();

      // Drawn arrow in nock
      if (this.velu.drawnBow) {
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(screenX + 4, riderY + 6);
        ctx.lineTo(screenX + 32, riderY + 6);
        ctx.stroke();
      }
    } else {
      // Standing beside horse (Phase 0: First Screen)
      const riderX = screenX - 52;
      const riderY = y + 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(riderX, riderY + 26, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8f2e22';
      ctx.fillRect(riderX - 6, riderY - 12, 12, 34);

      ctx.fillStyle = '#D9A441';
      ctx.fillRect(riderX - 7, riderY + 8, 14, 4);

      ctx.fillStyle = '#9e5a38';
      ctx.beginPath();
      ctx.arc(riderX, riderY - 18, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1f1412';
      ctx.beginPath();
      ctx.arc(riderX - 4, riderY - 21, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Prompt over horse
      ctx.font = 'bold 10px "Cambria", serif';
      ctx.fillStyle = '#fcedcb';
      ctx.textAlign = 'center';
      ctx.fillText('[SPACE / CLICK TO MOUNT]', screenX, y - 56);
    }

    ctx.restore();
  }

  drawArrows(ctx, w, h) {
    ctx.save();
    this.arrows.forEach(a => {
      const screenX = a.x - this.cameraX;
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 2.0;

      const angle = Math.atan2(a.vy, a.vx);
      const len = 22;

      ctx.beginPath();
      ctx.moveTo(screenX, a.y);
      ctx.lineTo(screenX - Math.cos(angle) * len, a.y - Math.sin(angle) * len);
      ctx.stroke();

      // Golden arrowhead glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX, a.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawDustMotes(ctx, w, h) {
    ctx.save();
    this.dustMotes.forEach(m => {
      ctx.fillStyle = `rgba(255, 235, 175, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawBastionGate(ctx, w, h) {
    const isUnlocked = this.hitCount >= this.requiredHits;
    const gateTrackX = this.trackLength - 80;
    const screenX = gateTrackX - this.cameraX;
    if (screenX < -150 || screenX > w + 150) return;

    const gateY = h * 0.58;
    const gateW = 68;
    const gateH = 110;

    ctx.save();
    // Granite gateway portal
    ctx.fillStyle = isUnlocked ? '#361e18' : '#26130f';
    ctx.fillRect(screenX - gateW / 2, gateY - gateH, gateW, gateH);

    // Carved arch pillars
    ctx.fillStyle = '#54291e';
    ctx.fillRect(screenX - gateW / 2 - 10, gateY - gateH - 6, 12, gateH + 6);
    ctx.fillRect(screenX + gateW / 2 - 2, gateY - gateH - 6, 12, gateH + 6);

    ctx.strokeStyle = isUnlocked ? '#D9A441' : '#633527';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(screenX - gateW / 2 - 10, gateY - gateH - 6, 12, gateH + 6);
    ctx.strokeRect(screenX + gateW / 2 - 2, gateY - gateH - 6, 12, gateH + 6);

    // Torana arch
    ctx.beginPath();
    ctx.arc(screenX, gateY - gateH, gateW / 2, Math.PI, 0);
    ctx.stroke();

    if (isUnlocked) {
      // Golden torchlight glow emanating through doorway
      const glow = ctx.createRadialGradient(screenX, gateY - gateH / 2, 8, screenX, gateY - gateH / 2, 70);
      glow.addColorStop(0, 'rgba(217, 164, 65, 0.75)');
      glow.addColorStop(0.5, 'rgba(184, 80, 66, 0.4)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(screenX - gateW / 2, gateY - gateH, gateW, gateH);
    }

    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = isUnlocked ? '#D9A441' : '#A7BEAE';
    ctx.textAlign = 'center';
    ctx.fillText('OUTER BASTION GATE', screenX, gateY - gateH - 18);
    ctx.font = '8px "Calibri", sans-serif';
    ctx.fillStyle = isUnlocked ? '#fcedcb' : 'rgba(255,255,255,0.4)';
    ctx.fillText(isUnlocked ? 'Rampart Passage → Level 4' : 'Awaiting Archery Mastery', screenX, gateY - gateH - 6);

    ctx.restore();
  }

  // =========================================================================
  // DIEGETIC WOVEN GARLAND RETICLE (Tightens gold, loosens amber, full gold snap)
  // =========================================================================
  drawGarlandReticle(ctx, w, h) {
    if (this.phase === 0) return; // Hidden until riding starts

    const r = this.reticle;
    const x = r.x;
    const y = r.y;
    const rad = r.currentRadius;
    const t = r.tightness;

    ctx.save();

    // 1. Draw Impact Snap Burst Particles
    r.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1.0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 2. Full Gold Snap Flare on Landed Impact
    if (r.snapTimer > 0) {
      const snapAlpha = Math.min(1.0, r.snapTimer);
      const snapRadius = 34 + (1.0 - snapAlpha) * 24;

      const flareGrad = ctx.createRadialGradient(x, y, 2, x, y, snapRadius);
      flareGrad.addColorStop(0, '#ffffff');
      flareGrad.addColorStop(0.3, `rgba(217, 164, 65, ${snapAlpha * 0.8})`);
      flareGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(x, y, snapRadius, 0, Math.PI * 2);
      ctx.fill();

      // Starburst rays
      ctx.strokeStyle = `rgba(253, 237, 203, ${snapAlpha})`;
      ctx.lineWidth = 2;
      for (let k = 0; k < 6; k++) {
        const rayAngle = (Math.PI * 2 / 6) * k;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(rayAngle) * snapRadius, y + Math.sin(rayAngle) * snapRadius);
        ctx.stroke();
      }
    }

    // 3. Ring Color Determination:
    // Tightens gold (#D9A441, FOCUSED/ACTIVE)
    // Loosens to warm amber (#D48828, WARN) as it drifts — NEVER DANGER-DEEP!
    const ringColor = t > 0.6
      ? '#D9A441' // Active/Focused Gold
      : (t > 0.25 ? '#e0a03a' : '#D48828'); // Warm Amber Drift Warning

    const glowColor = t > 0.6
      ? 'rgba(217, 164, 65, 0.45)'
      : 'rgba(212, 136, 40, 0.25)';

    // Subtle ambient glow ring
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(x, y, rad + 4, 0, Math.PI * 2);
    ctx.fill();

    // Woven garland outer ring
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = t > 0.6 ? 3.0 : 2.0;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Inner delicate circle
    ctx.strokeStyle = t > 0.6 ? '#ffffff' : 'rgba(255, 230, 180, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, rad * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Four precision floral notches (Crosshair markers)
    const notchLen = 5 + t * 4;
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.0;

    // Top, Bottom, Left, Right
    ctx.beginPath();
    ctx.moveTo(x, y - rad - notchLen); ctx.lineTo(x, y - rad + 2);
    ctx.moveTo(x, y + rad - 2); ctx.lineTo(x, y + rad + notchLen);
    ctx.moveTo(x - rad - notchLen, y); ctx.lineTo(x - rad + 2, y);
    ctx.moveTo(x + rad - 2, y); ctx.lineTo(x + rad + notchLen, y);
    ctx.stroke();

    // Central aiming pip
    ctx.fillStyle = t > 0.6 ? '#ffffff' : ringColor;
    ctx.beginPath();
    ctx.arc(x, y, t > 0.6 ? 2.5 : 2.0, 0, Math.PI * 2);
    ctx.fill();

    // State Label below reticle (Calibri / Cambria)
    ctx.font = 'bold 8.5px "Calibri", sans-serif';
    ctx.fillStyle = ringColor;
    ctx.textAlign = 'center';
    if (t > 0.6) {
      ctx.fillText('FOCUSED', x, y + rad + 16);
    } else if (t > 0.25) {
      ctx.fillText('LEAD TARGET', x, y + rad + 16);
    } else {
      ctx.fillText('DRIFTING', x, y + rad + 16);
    }

    ctx.restore();
  }

  drawHUD(ctx, w, h) {
    ctx.save();

    // 1. Non-obstructive Mentor Toast (Top center, auto-fading)
    if (this.mentor.timer > 0) {
      const alpha = Math.min(1.0, this.mentor.timer);
      ctx.globalAlpha = alpha;

      const toastW = Math.min(620, w * 0.88);
      const toastH = 38;
      const toastX = (w - toastW) / 2;
      const toastY = 16;

      ctx.fillStyle = 'rgba(26, 15, 12, 0.9)';
      ctx.fillRect(toastX, toastY, toastW, toastH);
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(toastX, toastY, toastW, toastH);

      // Gold corner tabs
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(toastX, toastY, 4, 4);
      ctx.fillRect(toastX + toastW - 4, toastY, 4, 4);
      ctx.fillRect(toastX, toastY + toastH - 4, 4, 4);
      ctx.fillRect(toastX + toastW - 4, toastY + toastH - 4, 4, 4);

      ctx.font = 'bold 10px "Cambria", serif';
      ctx.fillStyle = '#D9A441';
      ctx.textAlign = 'left';
      ctx.fillText('MASTER VEERA MARAVAR:', toastX + 14, toastY + 15);

      ctx.font = '11.5px "Cambria", serif';
      ctx.fillStyle = '#fcedcb';
      ctx.fillText(this.mentor.message, toastX + 14, toastY + 29);

      ctx.globalAlpha = 1.0;
    }

    // 2. Accuracy Threshold Pill (Top Right, minimal & non-obstructive)
    const pillW = 140;
    const pillH = 26;
    const pillX = w - pillW - 20;
    const pillY = 16;

    ctx.fillStyle = 'rgba(26, 15, 12, 0.85)';
    ctx.fillRect(pillX, pillY, pillW, pillH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(pillX, pillY, pillW, pillH);

    ctx.font = 'bold 9.5px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.textAlign = 'left';
    ctx.fillText('TARGETS STRUCK:', pillX + 8, pillY + 17);

    ctx.font = 'bold 11px "Calibri", sans-serif';
    ctx.fillStyle = this.hitCount >= this.requiredHits ? '#D9A441' : '#fcedcb';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.hitCount} / ${this.totalTargets}`, pillX + pillW - 8, pillY + 18);

    // 3. Riding Pace Gauge (Bottom Left, diegetic speedometer)
    if (this.phase >= 1) {
      const paceX = 24;
      const paceY = h - 36;
      ctx.font = 'bold 9px "Calibri", sans-serif';
      ctx.fillStyle = '#A7BEAE';
      ctx.textAlign = 'left';
      ctx.fillText('CANTER PACE:', paceX, paceY);

      // Pace bar
      const barW = 80;
      const barH = 5;
      ctx.fillStyle = '#3a1f18';
      ctx.fillRect(paceX + 68, paceY - 7, barW, barH);
      const paceRatio = (this.horse.speed - this.horse.minSpeed) / (this.horse.maxSpeed - this.horse.minSpeed);
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(paceX + 68, paceY - 7, barW * Math.min(1.0, Math.max(0.1, paceRatio)), barH);
    }

    ctx.restore();
  }
}

// Global Level 3 instance
window.sivagangaHorseAndBow = new SivagangaLevel3HorseBow();
