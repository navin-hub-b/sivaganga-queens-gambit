/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 9: "FLIGHT TO VIRUPACHI"
 * Chapter 2 Finale: Sivaganga Outskirts to Virupachi Mountain Defile (June 1772).
 *
 * Protagonist: Rani Velu Nachiyar fleeing with her infant daughter, Vellachi Nachiyar.
 * Destination: The mountain sanctuary of Virupachi, ruled by Chieftain Gopala Nayaker.
 *
 * DESIGN PHILOSOPHY & STEALTH VOCABULARY:
 * - Scaled-up from Level 7's detection vocabulary: smooth movement, crouching (C/Shift),
 *   soft torchlight vision cones, proximity flare warnings, and shadow sanctuaries.
 * - Escort / Daughter Safety Mechanic: Velu carries infant Vellachi close. A soft
 *   golden-rose lighting aura encircles the infant sprite. Repeated detection risk dims
 *   the safety glow; resting in Shadow Sanctuaries soothes the infant and restores it.
 * - In-World Carried Lantern: The oil lamp is carried physically in Velu's hand for the
 *   first time, casting a warm local radiance that flickers as detection risk rises.
 * - Coordinated Search Sweeps: Overlapping patrol sentries. Lingering in exposed paths
 *   triggers telegraphed search sweeps, where sentry lanterns swing toward the player's
 *   last known location before advancing.
 * - Multi-Sector Gauntlet:
 *   - Sector 1: Fort Outskirts & Broken Palisade
 *   - Sector 2: River Ford & Marshland Thickets
 *   - Sector 3: Highland Foothills Approach to Virupachi
 * - Performance Capping: Maximum 6 active patrol search routines simultaneously active
 *   at any moment. Deterministic 60 Hz fixed-timestep accumulator (dt = 1/60s).
 *
 * COLOR TOKENS:
 * - BG-MAROON #2E1F1B
 * - BG-TERRACOTTA #B85042
 * - ACCENT-GOLD #D9A441
 * - ACCENT-SAGE #A7BEAE
 * - DANGER-DEEP #7A1F1F
 * - Night tones: #161F28, #22303F, #2F4052, #44586E
 *
 * TYPOGRAPHY:
 * - Lore in Cambria, UI numerals in Calibri. English text only.
 */

class SivagangaLevel9FlightToVirupachi {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.isLevelCompleted = false;
    this.animationId = null;
    this.lastTimestamp = 0;

    // Fixed-timestep simulation accumulator (60 Hz)
    this.fixedDt = 1 / 60;
    this.timeAccumulator = 0;
    this.simTime = 0;

    // Viewport dimensions (Standard 16:9 960x540)
    this.width = 960;
    this.height = 540;

    // Current Sector: 1 (Palisade Outskirts), 2 (River Ford), 3 (Highland Pass)
    this.currentSector = 1;

    // Player Avatar: Rani Velu Nachiyar & Infant Vellachi
    this.player = {
      x: 75,
      y: 130,
      radius: 14,
      speed: 125, // pixels per second
      crouchSpeed: 80,
      isCrouching: false,
      vx: 0,
      vy: 0,
      facing: 'right',
      inShadow: false,
      walkFrame: 0,
      stepTimer: 0,
      carriedLanternRadius: 55,
      // Daughter Safety Glow: 1.0 (calm radiant) to 0.0 (distressed/exposed)
      daughterSafety: 1.0,
      sootheTimer: 0
    };

    // Lingering Tracker for Telegraphed Search Sweeps
    this.lingering = {
      lastAreaX: 75,
      lastAreaY: 130,
      dwellTime: 0,
      threshold: 4.2, // seconds lingering before sweep trigger
      sweepActive: false,
      sweepTarget: null,
      sweepCooldown: 0
    };

    // Keyboard Input
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      crouch: false
    };

    // Checkpoints for fair, non-punitive recovery
    this.checkpoints = {
      1: { x: 75, y: 130 },
      2: { x: 75, y: 260 },
      3: { x: 75, y: 440 }
    };

    // Detection Risk: 0.0 (unseen) to 1.0 (detected)
    this.detectionRisk = 0.0;
    this.lampFlickerPhase = 0;
    this.fadeResetTimer = 0;

    // Sector 1, 2, 3 Patrol Network (Strictly capped to max 6 active routines)
    this.allSentries = {
      1: [
        {
          id: 's1_eic_gate',
          name: 'Company Vanguard Sepoy',
          x: 260, y: 110, radius: 15, speed: 52,
          coneRange: 135, coneAngle: Math.PI * 0.36,
          warningRange: 185, warningAngle: Math.PI * 0.54,
          facingAngle: 0,
          waypoints: [
            { x: 260, y: 110 }, { x: 520, y: 110 }, { x: 520, y: 175 }, { x: 260, y: 175 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's1_arcot_lane',
          name: 'Nawab Cavalry Scout',
          x: 420, y: 210, radius: 15, speed: 56,
          coneRange: 140, coneAngle: Math.PI * 0.38,
          warningRange: 190, warningAngle: Math.PI * 0.56,
          facingAngle: Math.PI,
          waypoints: [
            { x: 680, y: 210 }, { x: 420, y: 210 }, { x: 420, y: 150 }, { x: 680, y: 150 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's1_forest_picket',
          name: 'East India Company Watchman',
          x: 740, y: 140, radius: 15, speed: 48,
          coneRange: 130, coneAngle: Math.PI * 0.35,
          warningRange: 175, warningAngle: Math.PI * 0.52,
          facingAngle: Math.PI * 0.5,
          waypoints: [
            { x: 740, y: 110 }, { x: 740, y: 220 }, { x: 860, y: 220 }, { x: 860, y: 110 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        }
      ],
      2: [
        {
          id: 's2_ford_sentry1',
          name: 'Company Ford Picket',
          x: 280, y: 240, radius: 15, speed: 50,
          coneRange: 135, coneAngle: Math.PI * 0.36,
          warningRange: 185, warningAngle: Math.PI * 0.54,
          facingAngle: 0,
          waypoints: [
            { x: 280, y: 240 }, { x: 540, y: 240 }, { x: 540, y: 310 }, { x: 280, y: 310 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's2_marsh_scout',
          name: 'Nawab River Guard',
          x: 610, y: 320, radius: 15, speed: 54,
          coneRange: 140, coneAngle: Math.PI * 0.38,
          warningRange: 190, warningAngle: Math.PI * 0.56,
          facingAngle: Math.PI,
          waypoints: [
            { x: 780, y: 320 }, { x: 490, y: 320 }, { x: 490, y: 250 }, { x: 780, y: 250 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's2_bamboo_sniper',
          name: 'Company Lantern Courier',
          x: 350, y: 360, radius: 15, speed: 58,
          coneRange: 130, coneAngle: Math.PI * 0.34,
          warningRange: 175, warningAngle: Math.PI * 0.50,
          facingAngle: 0,
          waypoints: [
            { x: 350, y: 360 }, { x: 670, y: 360 }, { x: 670, y: 300 }, { x: 350, y: 300 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        }
      ],
      3: [
        {
          id: 's3_crag_watch1',
          name: 'Company Highland Picket',
          x: 260, y: 430, radius: 15, speed: 52,
          coneRange: 140, coneAngle: Math.PI * 0.36,
          warningRange: 190, warningAngle: Math.PI * 0.54,
          facingAngle: 0,
          waypoints: [
            { x: 260, y: 430 }, { x: 500, y: 430 }, { x: 500, y: 495 }, { x: 260, y: 495 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's3_defile_scout',
          name: 'Nawab Defile Guard',
          x: 580, y: 410, radius: 15, speed: 55,
          coneRange: 145, coneAngle: Math.PI * 0.38,
          warningRange: 195, warningAngle: Math.PI * 0.56,
          facingAngle: Math.PI,
          waypoints: [
            { x: 740, y: 410 }, { x: 480, y: 410 }, { x: 480, y: 475 }, { x: 740, y: 475 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        },
        {
          id: 's3_beacon_lookout',
          name: 'Company Dragoon Scout',
          x: 720, y: 460, radius: 15, speed: 58,
          coneRange: 135, coneAngle: Math.PI * 0.36,
          warningRange: 185, warningAngle: Math.PI * 0.52,
          facingAngle: Math.PI * 0.5,
          waypoints: [
            { x: 720, y: 400 }, { x: 860, y: 400 }, { x: 860, y: 500 }, { x: 720, y: 500 }
          ],
          currentWpIndex: 0, isAlerted: false, isSweeping: false,
          flareMultiplier: 1.0, sweepAngleOffset: 0
        }
      ]
    };

    // Active Sentries Reference (max 6 active simultaneously)
    this.sentries = [];

    // Shadow Sanctuaries (Palmyra clusters, reed beds, banyan roots, overhangs)
    this.shadowZones = [
      // Sector 1 Shadows
      { id: 'sh1_palmyra_grove', x: 40, y: 80, w: 90, h: 80, name: 'Palmyra Grove Canopy', sector: 1 },
      { id: 'sh1_thatched_haystack', x: 380, y: 75, w: 95, h: 70, name: 'Village Thatched Haystack', sector: 1 },
      { id: 'sh1_ruined_archway', x: 620, y: 165, w: 90, h: 65, name: 'Rampart Breach Hollow', sector: 1 },
      { id: 'sh1_exit_copse', x: 855, y: 80, w: 80, h: 80, name: 'Forest Outskirts Copse', sector: 1 },

      // Sector 2 Shadows
      { id: 'sh2_ford_reeds', x: 45, y: 220, w: 90, h: 75, name: 'River Reed Thicket', sector: 2 },
      { id: 'sh2_fallen_sal_trunk', x: 400, y: 215, w: 95, h: 65, name: 'Fallen Sal Tree Hollow', sector: 2 },
      { id: 'sh2_banyan_roots', x: 680, y: 220, w: 100, h: 75, name: 'Ancient Banyan Aerial Roots', sector: 2 },
      { id: 'sh2_marsh_embankment', x: 850, y: 240, w: 85, h: 80, name: 'Marshland Overhang', sector: 2 },

      // Sector 3 Shadows
      { id: 'sh3_defile_boulder', x: 50, y: 400, w: 90, h: 80, name: 'Highland Granite Boulder', sector: 3 },
      { id: 'sh3_crag_alcove', x: 380, y: 395, w: 90, h: 70, name: 'Mountain Cave Recess', sector: 3 },
      { id: 'sh3_waterfall_mist', x: 640, y: 390, w: 95, h: 70, name: 'Chasm Waterfall Hollow', sector: 3 },
      { id: 'sh3_beacon_copse', x: 860, y: 430, w: 85, h: 85, name: 'Virupachi Beacon Woods', sector: 3 }
    ];

    // Sector Boundaries and Obstacles
    this.obstacles = [
      // Top and Bottom Viewport Limits
      { x: 0, y: 0, w: 960, h: 50 },
      { x: 0, y: 520, w: 960, h: 20 },
      // Left and Right Boundary Borders
      { x: 0, y: 0, w: 25, h: 540 },
      { x: 935, y: 0, w: 25, h: 540 },

      // Sector 1 Partition Walls & Palisades
      { x: 160, y: 145, w: 220, h: 22 },
      { x: 480, y: 145, w: 200, h: 22 },
      { x: 0, y: 190, w: 880, h: 18 }, // Sector 1/2 divider wall with gate at right

      // Sector 2 Partition River Rocks & Fallen Logs
      { x: 180, y: 280, w: 190, h: 24 },
      { x: 510, y: 280, w: 160, h: 24 },
      { x: 80, y: 350, w: 880, h: 18 }, // Sector 2/3 divider with gate at left

      // Sector 3 Mountain Chasm Crags
      { x: 170, y: 460, w: 200, h: 24 },
      { x: 510, y: 460, w: 190, h: 24 }
    ];

    // Transition Portals between sectors
    this.sectorPortals = {
      1: { x: 900, y: 135, radius: 36, targetSector: 2, spawn: { x: 75, y: 260 } },
      2: { x: 75, y: 390, radius: 36, targetSector: 3, spawn: { x: 120, y: 440 } },
      3: { x: 900, y: 450, radius: 42, isGoal: true } // Virupachi Sanctuary Beacon
    };

    // Environmental Night Particles (drifting fireflies, forest mist motes)
    this.nightParticles = [];
    for (let i = 0; i < 35; i++) {
      this.nightParticles.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 8,
        size: 1.2 + Math.random() * 1.8,
        color: Math.random() > 0.4 ? '#D9A441' : '#A7BEAE',
        alpha: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Feedback Toast
    this.feedbackText = '';
    this.feedbackTimer = 0;
    this.feedbackColor = '#D9A441';

    // Bound handlers
    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundKeyUp = (e) => this.handleKeyUp(e);
    this.boundResize = () => this.handleResize();
  }

  // =========================================================================
  // LIFECYCLE & INPUT
  // =========================================================================
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    this.isLevelCompleted = false;
    this.currentSector = 1;
    this.timeAccumulator = 0;
    this.simTime = 0;
    this.detectionRisk = 0.0;
    this.fadeResetTimer = 0;

    // Reset player position & safety
    this.player.x = this.checkpoints[1].x;
    this.player.y = this.checkpoints[1].y;
    this.player.daughterSafety = 1.0;
    this.player.isCrouching = false;
    this.player.facing = 'right';

    // Reset lingering
    this.lingering.dwellTime = 0;
    this.lingering.sweepActive = false;
    this.lingering.sweepCooldown = 0;

    // Load Sentries for Sector 1
    this.loadSectorSentries(1);

    this.handleResize();

    // Event listeners
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('resize', this.boundResize);

    // Canvas click listener to support clicking skipToWinBtn
    this.boundCanvasClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (this.width / rect.width);
      const my = (e.clientY - rect.top) * (this.height / rect.height);
      if (this.skipToWinBtn) {
        const b = this.skipToWinBtn;
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          this.completeLevel();
          return;
        }
      }
    };
    this.canvas.addEventListener('click', this.boundCanvasClick);

    // Audio cue
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.playTempleBell();
    }

    this.showFeedback('Sector I: Fort Outskirts — Evade patrols and reach the river ford.', '#D9A441');
  }

  start() {
    this.isActive = true;
    this.lastTimestamp = performance.now();
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const loop = (timestamp) => {
      if (!this.isActive) return;
      const frameDelta = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      this.update(frameDelta);
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

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('resize', this.boundResize);
    if (this.canvas && this.boundCanvasClick) {
      this.canvas.removeEventListener('click', this.boundCanvasClick);
    }

    const victoryModal = document.getElementById('level9-victory-modal');
    if (victoryModal) victoryModal.style.display = 'none';
  }

  loadSectorSentries(sector) {
    // Strictly cap to active sector sentries (max 3 per sector, never exceeding 6 total)
    this.sentries = JSON.parse(JSON.stringify(this.allSentries[sector] || []));
  }

  handleKeyDown(e) {
    if (!this.isActive || this.isLevelCompleted) return;

    if (e.key === '0' || e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      this.completeLevel();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.keys.up = true;
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.keys.down = true;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.keys.left = true;
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = true;
      e.preventDefault();
    } else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') {
      this.keys.crouch = true;
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') this.keys.crouch = false;
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

  // =========================================================================
  // FIXED-TIMESTEP SIMULATION & ESCORT PHYSICS
  // =========================================================================
  update(frameDelta) {
    if (this.fadeResetTimer > 0) {
      this.fadeResetTimer -= frameDelta;
      return;
    }

    // Fixed timestep accumulator
    this.timeAccumulator += frameDelta;
    while (this.timeAccumulator >= this.fixedDt) {
      this.fixedStep(this.fixedDt);
      this.timeAccumulator -= this.fixedDt;
      this.simTime += this.fixedDt;
    }

    // Feedback timer update
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= frameDelta;
      if (this.feedbackTimer <= 0) this.feedbackText = '';
    }

    // Ambient night particles
    this.nightParticles.forEach(p => {
      p.phase += frameDelta * 2;
      p.x += p.vx * frameDelta + Math.sin(p.phase) * 0.4;
      p.y += p.vy * frameDelta + Math.cos(p.phase) * 0.3;
      if (p.y < 0) { p.y = 540; p.x = Math.random() * 960; }
      if (p.x < 0) p.x = 960;
      if (p.x > 960) p.x = 0;
    });
  }

  fixedStep(dt) {
    if (this.isLevelCompleted) return;

    // 1. Movement & Obstacle Collision
    this.updatePlayerMovement(dt);

    // 2. Check Shadow Sanctuaries & Soothe Infant
    this.updatePlayerShadowAndSoothe(dt);

    // 3. Track Lingering & Telegraphed Search Sweeps
    this.updateLingeringAndSweeps(dt);

    // 4. Update Patrol AI & Coordinated Pathing
    this.updatePatrols(dt);

    // 5. Calculate Overlapping Vision Cones & Risk
    this.calculateDetection(dt);

    // 6. Update In-World Carried Lantern & Diegetic HUD
    this.updateCarriedLanternAndHUD();

    // 7. Check Sector Transitions and Sanctuary Goal
    this.checkSectorProgress();
  }

  updatePlayerMovement(dt) {
    let dx = 0;
    let dy = 0;

    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;

    // Diagonal normalization
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv;
      dy *= inv;
    }

    this.player.isCrouching = Boolean(this.keys.crouch);
    const speed = this.player.isCrouching ? this.player.crouchSpeed : this.player.speed;

    const moveX = dx * speed * dt;
    const moveY = dy * speed * dt;

    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.player.facing = dy > 0 ? 'down' : 'up';
      }

      this.player.stepTimer += dt;
      if (this.player.stepTimer > 0.18) {
        this.player.walkFrame = (this.player.walkFrame + 1) % 4;
        this.player.stepTimer = 0;
      }
    }

    // Try move X
    const nextX = this.player.x + moveX;
    if (!this.checkObstacleCollision(nextX, this.player.y, this.player.radius)) {
      this.player.x = nextX;
    }

    // Try move Y
    const nextY = this.player.y + moveY;
    if (!this.checkObstacleCollision(this.player.x, nextY, this.player.radius)) {
      this.player.y = nextY;
    }

    // Clamp inside arena
    this.player.x = Math.max(35, Math.min(925, this.player.x));
    this.player.y = Math.max(65, Math.min(505, this.player.y));
  }

  checkObstacleCollision(px, py, radius) {
    for (const obs of this.obstacles) {
      const closestX = Math.max(obs.x, Math.min(px, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(py, obs.y + obs.h));
      const distX = px - closestX;
      const distY = py - closestY;
      if (distX * distX + distY * distY < radius * radius) {
        return true;
      }
    }
    return false;
  }

  updatePlayerShadowAndSoothe(dt) {
    let insideShadow = false;
    for (const sz of this.shadowZones) {
      if (sz.sector === this.currentSector) {
        if (
          this.player.x >= sz.x &&
          this.player.x <= sz.x + sz.w &&
          this.player.y >= sz.y &&
          this.player.y <= sz.y + sz.h
        ) {
          insideShadow = true;
          break;
        }
      }
    }

    this.player.inShadow = insideShadow;

    // Escort Mechanic: Resting in shadow soothes infant Vellachi
    if (this.player.inShadow) {
      this.player.daughterSafety = Math.min(1.0, this.player.daughterSafety + dt * 0.28);
    }
  }

  /**
   * Coordinated Search Sweep AI:
   * Tracks if player lingers too long in one general area.
   * Nearest sentry initiates a fair, telegraphed lantern swing and search sweep.
   */
  updateLingeringAndSweeps(dt) {
    if (this.lingering.sweepCooldown > 0) {
      this.lingering.sweepCooldown -= dt;
    }

    const distFromLast = Math.hypot(
      this.player.x - this.lingering.lastAreaX,
      this.player.y - this.lingering.lastAreaY
    );

    if (distFromLast < 60 && !this.player.inShadow) {
      this.lingering.dwellTime += dt;
      if (this.lingering.dwellTime >= this.lingering.threshold && this.lingering.sweepCooldown <= 0) {
        this.triggerSearchSweep();
      }
    } else {
      // Player moved or is concealed: reset lingering anchor
      this.lingering.lastAreaX = this.player.x;
      this.lingering.lastAreaY = this.player.y;
      this.lingering.dwellTime = Math.max(0, this.lingering.dwellTime - dt * 1.5);
    }
  }

  triggerSearchSweep() {
    // Find closest sentry in current sector
    let closestSentry = null;
    let minDist = Infinity;

    this.sentries.forEach(s => {
      const d = Math.hypot(this.player.x - s.x, this.player.y - s.y);
      if (d < minDist) {
        minDist = d;
        closestSentry = s;
      }
    });

    if (closestSentry && minDist < 320) {
      closestSentry.isSweeping = true;
      closestSentry.sweepTimer = 3.5;
      closestSentry.targetX = this.player.x;
      closestSentry.targetY = this.player.y;
      this.lingering.sweepCooldown = 6.0;
      this.lingering.dwellTime = 0;

      this.showFeedback('Lantern Sweep Telegraphed! Sentry lantern swings toward your location.', '#D9A441');
      if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
    }
  }

  updatePatrols(dt) {
    this.sentries.forEach(s => {
      if (s.isSweeping) {
        // Search sweep routine: Sentry turns toward target, oscillating cone in telegraphed arc
        s.sweepTimer -= dt;
        const targetAngle = Math.atan2(s.targetY - s.y, s.targetX - s.x);

        // Oscillate sweep angle to telegraph visual search cone
        s.sweepAngleOffset = Math.sin(this.simTime * 5.5) * 0.38;

        let diff = (targetAngle + s.sweepAngleOffset) - s.facingAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        s.facingAngle += diff * Math.min(1.0, dt * 5.0);

        if (s.sweepTimer <= 0) {
          s.isSweeping = false;
          s.sweepAngleOffset = 0;
        }
      } else {
        // Standard fixed waypoint patrol loop
        const targetWp = s.waypoints[s.currentWpIndex];
        const distX = targetWp.x - s.x;
        const distY = targetWp.y - s.y;
        const dist = Math.hypot(distX, distY);

        if (dist < 4) {
          s.currentWpIndex = (s.currentWpIndex + 1) % s.waypoints.length;
        } else {
          const dirX = distX / dist;
          const dirY = distY / dist;
          s.x += dirX * s.speed * dt;
          s.y += dirY * s.speed * dt;

          const targetAngle = Math.atan2(dirY, dirX);
          let diff = targetAngle - s.facingAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          s.facingAngle += diff * Math.min(1.0, dt * 6);
        }
      }
    });
  }

  calculateDetection(dt) {
    let maxRiskRate = -0.35; // decay when unseen
    let highestAlertSentry = null;

    this.sentries.forEach(s => {
      const distX = this.player.x - s.x;
      const distY = this.player.y - s.y;
      const dist = Math.hypot(distX, distY);

      const angleToPlayer = Math.atan2(distY, distX);
      let angleDiff = angleToPlayer - s.facingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const absDiff = Math.abs(angleDiff);

      // 1. Proximity Early Warning Check
      if (dist < s.warningRange && absDiff < s.warningAngle * 0.5) {
        s.isAlerted = true;
        s.flareMultiplier = 1.0 + (1 - dist / s.warningRange) * 0.85;
      } else {
        s.isAlerted = false;
        s.flareMultiplier = Math.max(1.0, s.flareMultiplier - dt * 2.0);
      }

      // 2. Direct Torchlight Vision Cone Check
      if (dist < s.coneRange && absDiff < s.coneAngle * 0.5) {
        if (this.player.inShadow) {
          // In shadow sanctuary: only detect if player is physically colliding
          if (dist < s.radius + this.player.radius + 10) {
            maxRiskRate = Math.max(maxRiskRate, 0.2);
            highestAlertSentry = s;
          }
        } else {
          // Direct lantern cone illumination
          const rate = this.player.isCrouching ? 0.48 : 0.72;
          maxRiskRate = Math.max(maxRiskRate, rate);
          highestAlertSentry = s;

          // Infant distress: detected risk reduces daughter safety
          this.player.daughterSafety = Math.max(0.0, this.player.daughterSafety - dt * 0.32);
        }
      }
    });

    // Update risk level
    this.detectionRisk = Math.max(0.0, Math.min(1.0, this.detectionRisk + maxRiskRate * dt));

    // Full Detection or Daughter Distress -> Fair Checkpoint Recovery
    if (this.detectionRisk >= 1.0 || this.player.daughterSafety <= 0.05) {
      this.triggerCheckpointReset();
    }
  }

  triggerCheckpointReset() {
    this.fadeResetTimer = 0.8;
    this.detectionRisk = 0.0;
    this.player.daughterSafety = 0.75; // reset safety to comforting level

    // Soft reset to sector checkpoint
    const cp = this.checkpoints[this.currentSector];
    this.player.x = cp.x;
    this.player.y = cp.y;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playPebblePlink();
    }

    this.showFeedback('Detected by patrol sweep. Regrouped in safe foliage.', '#B85042');
  }

  updateCarriedLanternAndHUD() {
    // Carried lantern flickers based on risk
    this.lampFlickerPhase += 0.12 + this.detectionRisk * 0.5;

    // Sync global diegetic Diya oil lamp HUD
    const flameEl = document.querySelector('.diya-flame');
    if (flameEl) {
      const flicker = Math.sin(this.lampFlickerPhase * 16) * (1 + this.detectionRisk * 6);
      const h = Math.round(14 + flicker);
      flameEl.style.height = `${Math.max(6, h)}px`;

      if (this.detectionRisk > 0.6) {
        flameEl.style.background = '#e74c3c'; // danger reddish-amber
        flameEl.style.filter = 'drop-shadow(0 -3px 8px rgba(231, 76, 60, 0.8))';
      } else if (this.detectionRisk > 0.2) {
        flameEl.style.background = '#E67E22'; // amber caution
        flameEl.style.filter = 'drop-shadow(0 -3px 8px rgba(230, 126, 34, 0.6))';
      } else {
        flameEl.style.background = '#D9A441'; // steady gold
        flameEl.style.filter = 'drop-shadow(0 -3px 8px rgba(217, 164, 65, 0.7))';
      }
    }
  }

  checkSectorProgress() {
    const portal = this.sectorPortals[this.currentSector];
    if (!portal) return;

    const dist = Math.hypot(this.player.x - portal.x, this.player.y - portal.y);
    if (dist < portal.radius) {
      if (portal.isGoal) {
        this.completeLevel();
      } else {
        // Advance to next sector
        this.currentSector = portal.targetSector;
        this.player.x = portal.spawn.x;
        this.player.y = portal.spawn.y;
        this.loadSectorSentries(this.currentSector);
        this.detectionRisk = 0;
        this.player.daughterSafety = 1.0;

        if (window.sivagangaAudio) window.sivagangaAudio.playResolveBell();

        const sectorNames = {
          2: 'Sector II: River Ford & Marshland — Cross the stepped stones.',
          3: 'Sector III: Highland Pass to Virupachi — Reach the mountain beacon.'
        };
        this.showFeedback(sectorNames[this.currentSector], '#A7BEAE');
      }
    }
  }

  completeLevel() {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    // Record Chapter 2 Victory & Unlock Level 10
    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(9, {
        chapterFinale: true,
        daughterSafe: true,
        sanctuaryReached: 'Virupachi'
      });
      window.sivagangaSave.unlockLevel(10);
      window.sivagangaSave.recordChronicleNode(9);
    }

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playCeremonialFanfare();
      window.sivagangaAudio.playResolveBell();
    }

    this.renderVictoryOverlay();
  }

  renderVictoryOverlay() {
    let overlay = document.getElementById('level9-victory-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'level9-victory-modal';
      overlay.className = 'level7-victory-overlay';
      document.getElementById('app-root')?.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="level7-victory-card" style="position: relative;">
        <button id="level9-victory-close-btn" class="plaque-close-btn" title="Dismiss [Esc]" style="position:absolute; top:12px; right:16px; font-size:24px; cursor:pointer; background:none; border:none; color:#D9A441; line-height:1;">×</button>
        <div class="level7-victory-header">
          <span class="level7-victory-chapter">CHAPTER II FINALE · THE SOVEREIGN REIGN &amp; ESCAPE (1772)</span>
          <h2 class="level7-victory-title">Trial IX: Flight to Virupachi — Victorious</h2>
          <p class="level7-victory-subtitle">Sanctuary Reached in the Dindigul Highlands</p>
        </div>
        <div class="level7-victory-body">
          <p>
            Through deep forest thickets, mist-shrouded river fords, and colonial scouting pickets,
            Rani Velu Nachiyar has carried infant Vellachi safely into the mountain territory of Virupachi.
          </p>
          <div class="level7-intel-summary">
            <div class="intel-summary-item">✔ Infant Vellachi Nachiyar Protected &amp; Safe</div>
            <div class="intel-summary-item">✔ British &amp; Nawab Perimeter Patrols Evaded</div>
            <div class="intel-summary-item">✔ Received by Chieftain Gopala Nayaker of Virupachi</div>
          </div>
          <p style="font-style: italic; color: #eeddcc; font-size: 13.5px; margin-top: 10px;">
            "You have brought the hope of Sivaganga across the fire," says Chieftain Gopala Nayaker,
            raising his beacon high. "Here in the mountain crags, our swords and granaries are yours."
          </p>
          <p style="font-size: 12px; color: #A7BEAE; margin-top: 8px; letter-spacing: 0.8px;">
            CHAPTER II COMPLETE! The eight-year alliance with Sultan Hyder Ali and the birth of the Udaiyaal Regiment begins in Chapter III.
          </p>
        </div>
        <div class="level7-victory-actions">
          <button id="level9-replay-btn" class="btn-tamil">↺ Replay Flight</button>
          <button id="level9-advance-btn" class="btn-tamil btn-primary">Advance to Chapter III: Trial 10 →</button>
          <button id="level9-chronicle-btn" class="btn-tamil">Chronicle Map</button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';

    // Dismiss handlers
    const closeBtn = document.getElementById('level9-victory-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => { overlay.style.display = 'none'; };
    }
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    };

    document.getElementById('level9-advance-btn').onclick = () => {
      overlay.style.display = 'none';
      if (window.sivagangaTransitions) {
        window.sivagangaTransitions.wipe(
          () => {
            this.stop();
            if (window.sivagangaRouter) {
              window.sivagangaRouter.navigate('/level/10-the-convoy-of-five-thousand');
            } else if (window.sivagangaGameplay) {
              window.sivagangaGameplay.start(10);
            }
          },
          () => {}
        );
      }
    };

    document.getElementById('level9-replay-btn').onclick = () => {
      overlay.style.display = 'none';
      this.isLevelCompleted = false;
      this.init(this.canvas);
      this.start();
    };

    document.getElementById('level9-chronicle-btn').onclick = () => {
      overlay.style.display = 'none';
      if (window.sivagangaTransitions) {
        window.sivagangaTransitions.wipe(
          () => {
            this.stop();
            if (window.sivagangaRouter) {
              window.sivagangaRouter.navigate('/chronicle');
            } else if (window.sivagangaFlow) {
              window.sivagangaFlow.transition('GO_CHRONICLE');
            }
          },
          () => {}
        );
      }
    };
  }

  showFeedback(text, color = '#D9A441') {
    this.feedbackText = text;
    this.feedbackColor = color;
    this.feedbackTimer = 3.6;
  }

  // =========================================================================
  // PAINTERLY RENDERING (Night Forest, Carried Lantern, Infant Safety Glow)
  // =========================================================================
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Base Night Forest Palette (Deep Maroon & Cool Midnight Shadows)
    ctx.fillStyle = '#161F28';
    ctx.fillRect(0, 0, w, h);

    // 2. Sector Ground Art (Palisade, River Ford, Highland Crags)
    this.renderSectorEnvironment(ctx, w, h);

    // 3. Shadow Sanctuaries
    this.renderShadowSanctuaries(ctx);

    // 4. Obstacles (Palisades, logs, boulders)
    this.renderObstacles(ctx);

    // 5. Sector Transition Portal
    this.renderSectorPortal(ctx);

    // 6. Sentry Patrols & Soft Torchlight Cones
    this.renderSentries(ctx);

    // 7. Player (Velu, Carried Brass Lantern, Infant Vellachi & Safety Aura)
    this.renderPlayerAndEscort(ctx);

    // 8. Environmental Night Particles (Mist, fireflies)
    this.renderNightParticles(ctx);

    // 9. Discreet Sector HUD (Calibri Numerals)
    this.renderSectorHUD(ctx, w, h);

    // 10. Feedback Toast Banner (Cambria Lore)
    this.renderFeedbackToast(ctx, w, h);

    // 11. Checkpoint Fade Reset Effect
    if (this.fadeResetTimer > 0) {
      const a = Math.min(1.0, this.fadeResetTimer / 0.8);
      ctx.fillStyle = `rgba(22, 31, 40, ${a})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  renderSectorHUD(ctx, w, h) {
    ctx.save();
    ctx.font = 'bold 12px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.shadowColor = 'rgba(10, 8, 6, 0.85)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'left';
    ctx.fillText(`SECTOR ${this.currentSector} OF 3 · ESCORT TO VIRUPACHI`, 32, 28);

    // Direct Finish / Advance Button (Top Right)
    const btnW = 310;
    const btnH = 32;
    const btnX = w - btnW - 32;
    const btnY = 12;
    this.skipToWinBtn = { x: btnX, y: btnY, w: btnW, h: btnH };

    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 4);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Calibri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Complete Flight & Finish Chapter II →', btnX + btnW / 2, btnY + 20);

    ctx.restore();
  }

  renderSectorEnvironment(ctx, w, h) {
    ctx.save();

    if (this.currentSector === 1) {
      // Sector 1: Forest Outskirts (Palmyra tree trunks, broken brickwork)
      ctx.fillStyle = '#1e1411'; // BG-MAROON earthy floor
      ctx.fillRect(25, 50, w - 50, 140);

      // Thatched hut silhouette in background
      ctx.fillStyle = '#291b16';
      ctx.beginPath();
      ctx.moveTo(370, 70);
      ctx.lineTo(430, 45);
      ctx.lineTo(490, 70);
      ctx.closePath();
      ctx.fill();

    } else if (this.currentSector === 2) {
      // Sector 2: River Ford & Marsh (Glistening water ripples, stepped river stones)
      ctx.fillStyle = '#132029'; // Cool riverbed
      ctx.fillRect(25, 190, w - 50, 160);

      // River Water Channel
      ctx.fillStyle = 'rgba(44, 62, 80, 0.45)';
      ctx.fillRect(180, 200, 540, 140);

      // Stepped Stones across river ford
      ctx.fillStyle = '#3a4750';
      const stones = [
        { x: 230, y: 270, r: 16 }, { x: 340, y: 265, r: 18 },
        { x: 450, y: 275, r: 17 }, { x: 570, y: 268, r: 19 },
        { x: 670, y: 272, r: 16 }
      ];
      stones.forEach(st => {
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#506173';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

    } else {
      // Sector 3: Highland Crag Gorge to Virupachi
      ctx.fillStyle = '#1b120f'; // Dark granite defile
      ctx.fillRect(25, 350, w - 50, 170);

      // Granite mountain slopes in background
      ctx.fillStyle = '#281a15';
      ctx.beginPath();
      ctx.moveTo(100, 360);
      ctx.lineTo(280, 340);
      ctx.lineTo(480, 365);
      ctx.lineTo(700, 335);
      ctx.lineTo(880, 360);
      ctx.lineTo(880, 370);
      ctx.lineTo(100, 370);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  renderShadowSanctuaries(ctx) {
    ctx.save();
    this.shadowZones.forEach(sz => {
      if (sz.sector !== this.currentSector) return;

      // Soft painterly shadow wash
      ctx.fillStyle = 'rgba(10, 14, 18, 0.78)';
      ctx.beginPath();
      ctx.roundRect(sz.x, sz.y, sz.w, sz.h, 6);
      ctx.fill();

      ctx.strokeStyle = 'rgba(167, 190, 174, 0.25)'; // ACCENT-SAGE foliage rim
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle foliage leaf motif
      ctx.fillStyle = 'rgba(167, 190, 174, 0.4)';
      ctx.beginPath();
      ctx.arc(sz.x + 16, sz.y + 16, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  renderObstacles(ctx) {
    ctx.save();
    this.obstacles.forEach(obs => {
      ctx.fillStyle = '#2b1b15';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      ctx.strokeStyle = '#3d271f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });
    ctx.restore();
  }

  renderSectorPortal(ctx) {
    const portal = this.sectorPortals[this.currentSector];
    if (!portal) return;

    ctx.save();
    if (portal.isGoal) {
      // Virupachi Sanctuary Beacon: Golden highland bonfire
      const beaconGrad = ctx.createRadialGradient(portal.x, portal.y, 2, portal.x, portal.y, portal.radius);
      beaconGrad.addColorStop(0, 'rgba(217, 164, 65, 0.95)');
      beaconGrad.addColorStop(0.6, 'rgba(184, 80, 66, 0.45)');
      beaconGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      ctx.fillStyle = beaconGrad;
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, portal.radius, 0, Math.PI * 2);
      ctx.fill();

      // Highland Stone Brazier
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(portal.x - 10, portal.y + 10, 20, 12);
    } else {
      // Pathway Transition Gate
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, portal.radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  renderSentries(ctx) {
    ctx.save();
    this.sentries.forEach(s => {
      // 1. Soft Torchlight Vision Cone (Painterly, non-geometric glow)
      const range = s.coneRange * (s.isAlerted ? 1.08 : 1.0);
      const halfAngle = s.coneAngle * 0.5;

      const coneGrad = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, range);
      if (s.isSweeping) {
        // Active sweeping search: warmer telegraphed flare
        coneGrad.addColorStop(0, 'rgba(235, 150, 40, 0.65)');
        coneGrad.addColorStop(0.6, 'rgba(217, 164, 65, 0.35)');
        coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      } else if (s.isAlerted) {
        coneGrad.addColorStop(0, 'rgba(230, 126, 34, 0.55)');
        coneGrad.addColorStop(0.6, 'rgba(217, 164, 65, 0.28)');
        coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      } else {
        coneGrad.addColorStop(0, 'rgba(217, 164, 65, 0.38)');
        coneGrad.addColorStop(0.7, 'rgba(217, 164, 65, 0.15)');
        coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      }

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, range, s.facingAngle - halfAngle, s.facingAngle + halfAngle);
      ctx.closePath();
      ctx.fill();

      // 2. Sentry Body Sprite (Company redcoat or Nawab sepoy silhouette)
      ctx.fillStyle = '#1e110c';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = s.isSweeping ? '#E67E22' : '#D9A441';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Facing indicator / lantern tip
      const lx = s.x + Math.cos(s.facingAngle) * (s.radius + 6);
      const ly = s.y + Math.sin(s.facingAngle) * (s.radius + 6);

      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(lx, ly, 4 * s.flareMultiplier, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  renderPlayerAndEscort(ctx) {
    const p = this.player;
    ctx.save();

    // 1. In-World Carried Lantern Halo
    // Casts a soft ambient pool of light around Velu and infant Vellachi
    const lanternX = p.x + (p.facing === 'right' ? 8 : (p.facing === 'left' ? -8 : 0));
    const lanternY = p.y + (p.facing === 'down' ? 6 : (p.facing === 'up' ? -6 : 0));

    const lightRadius = p.inShadow ? p.carriedLanternRadius * 0.45 : p.carriedLanternRadius;
    const lanternGrad = ctx.createRadialGradient(lanternX, lanternY, 2, lanternX, lanternY, lightRadius);
    lanternGrad.addColorStop(0, 'rgba(217, 164, 65, 0.42)');
    lanternGrad.addColorStop(0.7, 'rgba(217, 164, 65, 0.12)');
    lanternGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');

    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Escort Feature: Purely Lighting-Based "Daughter Safety Glow"
    // Warm golden-rose aura encircling infant Vellachi held in Velu's arms
    const safetyAlpha = Math.max(0.1, p.daughterSafety * 0.75);
    const safetyGrad = ctx.createRadialGradient(p.x, p.y - 2, 2, p.x, p.y - 2, 22);

    if (p.daughterSafety > 0.6) {
      // Serene golden-rose radiance
      safetyGrad.addColorStop(0, `rgba(235, 185, 140, ${safetyAlpha})`);
      safetyGrad.addColorStop(0.6, `rgba(217, 164, 65, ${safetyAlpha * 0.5})`);
      safetyGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
    } else {
      // Nervous amber/dimming alert glow
      safetyGrad.addColorStop(0, `rgba(231, 76, 60, ${safetyAlpha})`);
      safetyGrad.addColorStop(0.6, `rgba(230, 126, 34, ${safetyAlpha * 0.4})`);
      safetyGrad.addColorStop(1, 'rgba(230, 126, 34, 0)');
    }

    ctx.fillStyle = safetyGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 2, 22, 0, Math.PI * 2);
    ctx.fill();

    // 3. Velu Nachiyar Silhouette Sprite
    ctx.fillStyle = p.inShadow ? '#0d0705' : '#221410';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 4, p.radius * 0.7, 0, Math.PI * 2); // head
    ctx.ellipse(p.x, p.y + 4, p.radius * 0.9, p.radius * 1.1, 0, 0, Math.PI * 2); // body
    ctx.fill();

    ctx.strokeStyle = p.inShadow ? 'rgba(167, 190, 174, 0.45)' : '#D9A441';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 4. Infant Vellachi Silhouette in Sling
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    ctx.arc(p.x + 3, p.y - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Physically Carried Brass Oil Lamp
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderNightParticles(ctx) {
    ctx.save();
    this.nightParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  renderFeedbackToast(ctx, w, h) {
    if (!this.feedbackText || this.feedbackTimer <= 0) return;

    ctx.save();
    const alpha = Math.min(1.0, this.feedbackTimer / 0.5);
    ctx.font = 'italic 14px "Cambria", serif';
    ctx.fillStyle = this.feedbackColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(10, 8, 6, 0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText(this.feedbackText, w / 2, h - 28);
    ctx.restore();
  }
}

// Global Level 9 Singleton Instance
window.sivagangaFlightToVirupachi = new SivagangaLevel9FlightToVirupachi();
