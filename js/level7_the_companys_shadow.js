/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 7: "THE COMPANY'S SHADOW"
 * Chapter 2: Sivaganga Fort Outer Ramparts & Market Lanes at Dusk (1772).
 *
 * Protagonist: Rani Velu Nachiyar as tension rises with the British East India
 * Company and the Nawab of Arcot's forces prior to the assault on Kalaiyar Kovil.
 *
 * ART & AESTHETICS:
 * - Painterly hand-drawn 2D/2.5D Tamil fort architecture.
 * - Warm terracotta-and-gold on deep maroon, blended with cooler dusk blue-grey shadow tones.
 * - Color tokens: BG-MAROON #2E1F1B, BG-TERRACOTTA #B85042, ACCENT-GOLD #D9A441, ACCENT-SAGE #A7BEAE, DANGER-DEEP #7A1F1F.
 * - Dusk ambient tones: #1B2430, #2C3E50, #3A4750, #506173.
 * - Lore text in Cambria; UI numerals in Calibri.
 *
 * FIRST SCREEN:
 * - Velu Nachiyar at a fort rampart window at dusk, distant patrol lantern glows on the horizon
 *   previewing the detection mechanic. The brass oil lamp beside her flickers slightly for the first time.
 *
 * GAMEPLAY & STEALTH MECHANIC:
 * - Basic awareness and stealth infiltration through fort grounds and market lanes.
 * - Patrol NPCs on fixed looping routes; vision cones render as soft torchlight glows, not hard geometric shapes.
 * - Early warning: Patrol lantern visibly brightens/flares when the player nears their cone edge.
 * - Diegetic UI: Detection risk reuses the existing Diya oil lamp HUD element, shifting its flame from
 *   steady radiant gold (#D9A441) toward nervous flickering amber (#E67E22) and agitated danger flutter.
 * - Shadow Sanctuaries: Dark alcoves, banyan trees, and merchant awnings where Velu is concealed.
 * - Objectives: Intercept 3 strategic intelligence ledgers and escape through the inner citadel council gate.
 *
 * TECHNICAL ROBUSTNESS:
 * - Fixed-timestep accumulator (dt = 1/60) decoupling patrol paths and detection math from render framerate,
 *   guaranteeing identical patrol timing across any hardware refresh rate (30 Hz, 60 Hz, 120 Hz).
 */

class SivagangaLevel7TheCompanysShadow {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.animationId = null;
    this.lastTimestamp = 0;

    // Fixed-timestep simulation accumulator (60 Hz)
    this.fixedDt = 1 / 60;
    this.timeAccumulator = 0;
    this.simTime = 0;

    // Viewport dimensions (Standard 16:9 960x540 virtual space)
    this.width = 960;
    this.height = 540;

    // Game Mode: 'window' (prologue establishing shot) or 'infiltrate' (stealth exploration)
    this.viewMode = 'window';
    this.isLevelCompleted = false;

    // Player Avatar (Velu Nachiyar)
    this.player = {
      x: 80,
      y: 110,
      radius: 14,
      speed: 130, // pixels per second (in fixed-step)
      crouchSpeed: 85,
      isCrouching: false,
      vx: 0,
      vy: 0,
      facing: 'down',
      inShadow: false,
      walkFrame: 0,
      stepTimer: 0
    };

    // Keyboard Input
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      crouch: false,
      interact: false
    };

    // Checkpoint for fair non-punitive reset
    this.lastCheckpoint = { x: 80, y: 110 };

    // Detection Risk: 0.0 (unseen) to 1.0 (detected)
    this.detectionRisk = 0.0;
    this.highestAlertSentry = null;
    this.lampFlickerPhase = 0;
    this.detectionFlashTimer = 0;

    // 3 Sentry Patrols on fixed looping routes
    this.sentries = [
      {
        id: 'sentry_rampart',
        name: 'Company Redcoat Scout',
        faction: 'eic',
        x: 200,
        y: 110,
        radius: 15,
        speed: 55, // pixels per second
        coneRange: 135,
        coneAngle: Math.PI * 0.36, // ~65 degrees total
        warningRange: 185,
        warningAngle: Math.PI * 0.55,
        facingAngle: 0,
        waypoints: [
          { x: 200, y: 110 },
          { x: 490, y: 110 },
          { x: 490, y: 195 },
          { x: 200, y: 195 }
        ],
        currentWpIndex: 0,
        isAlerted: false,
        flareMultiplier: 1.0
      },
      {
        id: 'sentry_bazaar',
        name: 'Nawab Sepoy Guard',
        faction: 'arcot',
        x: 320,
        y: 310,
        radius: 15,
        speed: 50,
        coneRange: 130,
        coneAngle: Math.PI * 0.38,
        warningRange: 180,
        warningAngle: Math.PI * 0.55,
        facingAngle: 0,
        waypoints: [
          { x: 320, y: 310 },
          { x: 670, y: 310 },
          { x: 670, y: 240 },
          { x: 320, y: 240 }
        ],
        currentWpIndex: 0,
        isAlerted: false,
        flareMultiplier: 1.0
      },
      {
        id: 'sentry_watergate',
        name: 'Company Gate Watchman',
        faction: 'eic',
        x: 240,
        y: 440,
        radius: 15,
        speed: 48,
        coneRange: 125,
        coneAngle: Math.PI * 0.35,
        warningRange: 175,
        warningAngle: Math.PI * 0.52,
        facingAngle: 0,
        waypoints: [
          { x: 240, y: 440 },
          { x: 570, y: 440 },
          { x: 570, y: 375 },
          { x: 240, y: 375 }
        ],
        currentWpIndex: 0,
        isAlerted: false,
        flareMultiplier: 1.0
      }
    ];

    // Shadow Sanctuaries (Darkened alcoves & stalls where Velu is hidden)
    this.shadowZones = [
      { id: 'shadow_stairwell', x: 50, y: 80, w: 75, h: 70, name: 'Rampart Stair Niche' },
      { id: 'shadow_scribe_awning', x: 440, y: 80, w: 100, h: 65, name: 'Scribes\' Thatched Portico' },
      { id: 'shadow_market_alcove1', x: 220, y: 220, w: 85, h: 65, name: 'Silk Merchant\'s Awning' },
      { id: 'shadow_spice_tents', x: 540, y: 220, w: 90, h: 70, name: 'Spice Storehouse Recess' },
      { id: 'shadow_banyan_tree', x: 740, y: 150, w: 110, h: 100, name: 'Ancient Banyan Canopy' },
      { id: 'shadow_canal_arch', x: 130, y: 360, w: 90, h: 80, name: 'Subterranean Sluice Arch' },
      { id: 'shadow_pottery_corner', x: 410, y: 360, w: 85, h: 70, name: 'Terracotta Potter\'s Stall' },
      { id: 'shadow_council_gates', x: 840, y: 410, w: 90, h: 90, name: 'Citadel Gate Sanctuary' }
    ];

    // Fort Obstacles (Walls, market counters, granite parapets)
    this.obstacles = [
      // Upper Rampart Wall Barrier
      { x: 0, y: 0, w: 960, h: 60 },
      // Left and Right Boundary Walls
      { x: 0, y: 0, w: 30, h: 540 },
      { x: 930, y: 0, w: 30, h: 540 },
      // Bottom Boundary Wall
      { x: 0, y: 510, w: 960, h: 30 },
      // Central Rampart Divider Wall
      { x: 150, y: 150, w: 260, h: 22 },
      { x: 530, y: 150, w: 230, h: 22 },
      // Bazaar Stalls (Central Row)
      { x: 170, y: 270, w: 110, h: 32 },
      { x: 380, y: 270, w: 120, h: 32 },
      { x: 620, y: 270, w: 110, h: 32 },
      // Lower Watergate Partition
      { x: 160, y: 400, w: 200, h: 24 },
      { x: 480, y: 400, w: 180, h: 24 }
    ];

    // 3 Strategic Intel Ledgers
    this.intelItems = [
      {
        id: 'intel_eic_roster',
        name: 'EIC Garrison Roster & Artillery Route',
        x: 500,
        y: 105,
        collected: false,
        desc: 'Detailed manifests of Company redcoat regiments and horse artillery moving along the Madurai road.'
      },
      {
        id: 'intel_nawab_demand',
        name: 'Nawab of Arcot\'s Extortion Demand',
        x: 580,
        y: 250,
        collected: false,
        desc: 'A haughty colonial treaty letter demanding tribute payments and threatening fort confiscation.'
      },
      {
        id: 'intel_sluice_map',
        name: 'Secret Sluice Survey of Fort Moat',
        x: 170,
        y: 450,
        collected: false,
        desc: 'Reconnaissance notes mapping the underwater drainage sluice into Sivaganga\'s southern moat.'
      }
    ];

    // Escape Gateway (Inner Citadel Gate)
    this.escapeGate = {
      x: 885,
      y: 460,
      radius: 40,
      isUnlocked: false
    };

    // Ambient Lighting & Particle Motes (Dusk embers and dust)
    this.duskParticles = [];
    for (let i = 0; i < 30; i++) {
      this.duskParticles.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 12,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4
      });
    }

    // Feedback Banner Toast
    this.feedbackText = '';
    this.feedbackTimer = 0;
    this.feedbackColor = '#D9A441';

    // Key binding handlers
    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundKeyUp = (e) => this.handleKeyUp(e);
  }

  /**
   * Initializes the canvas and event listeners
   */
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    this.isLevelCompleted = false;
    this.viewMode = 'window'; // Always start on the atmospheric first screen
    this.detectionRisk = 0.0;
    this.simTime = 0;
    this.timeAccumulator = 0;

    // Reset player position and intel
    this.player.x = 80;
    this.player.y = 110;
    this.player.isCrouching = false;
    this.lastCheckpoint = { x: 80, y: 110 };
    this.intelItems.forEach(item => item.collected = false);
    this.escapeGate.isUnlocked = false;

    // Reset sentries to initial waypoint
    this.resetSentries();

    // Attach keyboard events
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Canvas click listener to dismiss prologue window mode directly
    this.boundCanvasClick = () => {
      if (this.viewMode === 'window') {
        this.transitionToInfiltration();
      }
    };
    this.canvas.addEventListener('click', this.boundCanvasClick);

    // Initial HUD update
    this.updateDiegeticLamp(0.0);
    this.updateHUDGarland();
  }

  resetSentries() {
    this.sentries.forEach(s => {
      s.x = s.waypoints[0].x;
      s.y = s.waypoints[0].y;
      s.currentWpIndex = 0;
      s.facingAngle = 0;
      s.isAlerted = false;
      s.flareMultiplier = 1.0;
    });
  }

  start() {
    this.isActive = true;
    this.lastTimestamp = performance.now();
    const loop = (timestamp) => {
      if (!this.isActive) return;
      this.update(timestamp);
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
    if (this.canvas && this.boundCanvasClick) {
      this.canvas.removeEventListener('click', this.boundCanvasClick);
    }

    // Restore HUD Diya flame to stable golden state
    this.restoreDiegeticLamp();
  }

  handleKeyDown(e) {
    if (!this.isActive) return;

    // In window mode, any key descends into fort grounds
    if (this.viewMode === 'window') {
      e.preventDefault();
      this.transitionToInfiltration();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    if (e.key === 'Shift' || e.key === 'c' || e.key === 'C') this.keys.crouch = true;
    if (e.key === ' ' || e.key === 'e' || e.key === 'E') this.keys.interact = true;
  }

  handleKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    if (e.key === 'Shift' || e.key === 'c' || e.key === 'C') this.keys.crouch = false;
    if (e.key === ' ' || e.key === 'e' || e.key === 'E') this.keys.interact = false;
  }

  transitionToInfiltration() {
    this.viewMode = 'infiltrate';
    window.sivagangaAudio?.playQuietFade();
    this.showFeedback('Descended into the Market Lanes. Stay to the shadows!', '#D9A441');
  }

  /**
   * Main game loop with fixed-timestep physics/detection decoupling
   */
  update(timestamp) {
    const elapsed = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Guard against giant delta spikes when tabbing out
    const frameDelta = Math.min(elapsed, 0.1);

    if (this.viewMode === 'window') {
      // In prologue window view, simulate distant patrol lanterns and lamp flicker
      this.lampFlickerPhase += frameDelta * 5;
      this.updateDistantPatrols(frameDelta);
      return;
    }

    // Accumulate time for deterministic fixed simulation
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

    // Ambient dusk particles
    this.duskParticles.forEach(p => {
      p.x += p.vx * frameDelta;
      p.y += p.vy * frameDelta;
      if (p.y < 0) { p.y = 540; p.x = Math.random() * 960; }
      if (p.x < 0) p.x = 960;
      if (p.x > 960) p.x = 0;
    });
  }

  /**
   * Fixed-timestep physics, patrol pathing, and detection accumulation
   * Runs at exactly 60 Hz independent of render frame rate
   */
  fixedStep(dt) {
    if (this.isLevelCompleted) return;

    // 1. Player Movement & Collision
    this.updatePlayerMovement(dt);

    // 2. Check Shadow Sanctuaries
    this.updatePlayerShadowState();

    // 3. Update Patrol NPCs (Waypoints & Facing)
    this.updatePatrols(dt);

    // 4. Calculate Sentry Detection Cones & Proximity Warning
    this.calculateDetection(dt);

    // 5. Update Diegetic Lamp HUD & In-World Indicator
    this.updateDiegeticLamp(this.detectionRisk);

    // 6. Check Intel Collections
    this.checkIntelCollection();

    // 7. Check Citadel Escape Gate
    this.checkEscapeGate();
  }

  updatePlayerMovement(dt) {
    let dx = 0;
    let dy = 0;

    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;

    // Normalize diagonal velocity
    if (dx !== 0 && dy !== 0) {
      const invLen = 1 / Math.SQRT2;
      dx *= invLen;
      dy *= invLen;
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

    // Try moving X with obstacle collision
    const nextX = this.player.x + moveX;
    if (!this.checkObstacleCollision(nextX, this.player.y, this.player.radius)) {
      this.player.x = nextX;
    }

    // Try moving Y with obstacle collision
    const nextY = this.player.y + moveY;
    if (!this.checkObstacleCollision(this.player.x, nextY, this.player.radius)) {
      this.player.y = nextY;
    }

    // Keep within playable arena boundaries
    this.player.x = Math.max(40, Math.min(920, this.player.x));
    this.player.y = Math.max(70, Math.min(500, this.player.y));
  }

  checkObstacleCollision(px, py, radius) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      // Circle-box intersection test
      const closestX = Math.max(obs.x, Math.min(px, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(py, obs.y + obs.h));
      const distX = px - closestX;
      const distY = py - closestY;
      if ((distX * distX + distY * distY) < (radius * radius)) {
        return true;
      }
    }
    return false;
  }

  updatePlayerShadowState() {
    let inAnyShadow = false;
    for (let i = 0; i < this.shadowZones.length; i++) {
      const z = this.shadowZones[i];
      if (this.player.x >= z.x && this.player.x <= z.x + z.w &&
          this.player.y >= z.y && this.player.y <= z.y + z.h) {
        inAnyShadow = true;
        // Update checkpoint when safely resting in shadow
        this.lastCheckpoint.x = z.x + z.w / 2;
        this.lastCheckpoint.y = z.y + z.h / 2;
        break;
      }
    }
    this.player.inShadow = inAnyShadow;
  }

  updatePatrols(dt) {
    this.sentries.forEach(s => {
      const targetWp = s.waypoints[s.currentWpIndex];
      const distX = targetWp.x - s.x;
      const distY = targetWp.y - s.y;
      const dist = Math.hypot(distX, distY);

      if (dist < 4) {
        // Switch to next waypoint in the loop
        s.currentWpIndex = (s.currentWpIndex + 1) % s.waypoints.length;
      } else {
        // Move towards target waypoint
        const dirX = distX / dist;
        const dirY = distY / dist;
        s.x += dirX * s.speed * dt;
        s.y += dirY * s.speed * dt;

        // Smoothly rotate facing angle
        const targetAngle = Math.atan2(dirY, dirX);
        let angleDiff = targetAngle - s.facingAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        s.facingAngle += angleDiff * Math.min(1.0, dt * 6);
      }
    });
  }

  calculateDetection(dt) {
    let maxRiskRate = -0.35; // default decay rate when unseen
    let highestAlert = null;
    let anyConeFlare = false;

    this.sentries.forEach(s => {
      const distX = this.player.x - s.x;
      const distY = this.player.y - s.y;
      const dist = Math.hypot(distX, distY);

      // Angle from sentry to player
      const angleToPlayer = Math.atan2(distY, distX);
      let angleDiff = angleToPlayer - s.facingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const absAngleDiff = Math.abs(angleDiff);

      // 1. Proximity Warning Check: Player is near cone perimeter
      if (dist < s.warningRange && absAngleDiff < s.warningAngle * 0.5) {
        anyConeFlare = true;
        s.isAlerted = true;
        // Lantern flares up visually as early warning
        s.flareMultiplier = 1.0 + (1 - dist / s.warningRange) * 0.75;
      } else {
        s.isAlerted = false;
        s.flareMultiplier = Math.max(1.0, s.flareMultiplier - dt * 2.0);
      }

      // 2. Direct Vision Cone Check
      if (dist < s.coneRange && absAngleDiff < s.coneAngle * 0.5) {
        if (this.player.inShadow) {
          // If player is in deep shadow, sentry eyes pass over
          // Mild suspicion only if touching the sentry
          if (dist < s.radius + this.player.radius + 10) {
            maxRiskRate = Math.max(maxRiskRate, 0.15);
            highestAlert = s;
          }
        } else {
          // Player is caught in direct lantern beam!
          // Crouching slows detection slightly
          const detectionRate = this.player.isCrouching ? 0.45 : 0.65;
          maxRiskRate = Math.max(maxRiskRate, detectionRate);
          highestAlert = s;
        }
      } else if (dist < s.warningRange && absAngleDiff < s.warningAngle * 0.5 && !this.player.inShadow) {
        // Player is at the soft peripheral edge of the lantern glow
        maxRiskRate = Math.max(maxRiskRate, 0.18);
        if (!highestAlert) highestAlert = s;
      }
    });

    this.highestAlertSentry = highestAlert;

    // Apply detection accumulation or decay
    this.detectionRisk = Math.max(0.0, Math.min(1.0, this.detectionRisk + maxRiskRate * dt));

    // Detection Failure Check (Non-graphic, fair checkpoint return)
    if (this.detectionRisk >= 1.0) {
      this.handlePlayerDetected();
    }
  }

  handlePlayerDetected() {
    window.sivagangaAudio?.playQuietFade();
    this.showFeedback('Sentry Alert! Sentry hails: "Halt! Who goes there?" Retreating to shadows...', '#B85042');

    // Retreat to last safe shadow checkpoint
    this.player.x = this.lastCheckpoint.x;
    this.player.y = this.lastCheckpoint.y;
    this.detectionRisk = 0.0;
    this.resetSentries();
    this.updateDiegeticLamp(0.0);
  }

  checkIntelCollection() {
    this.intelItems.forEach(item => {
      if (item.collected) return;
      const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
      if (dist < 26) {
        item.collected = true;
        window.sivagangaAudio?.playTempleBell();
        this.showFeedback(`Intercepted: ${item.name}!`, '#D9A441');
        this.updateHUDGarland();

        // Check if all 3 intel items collected
        const allCollected = this.intelItems.every(i => i.collected);
        if (allCollected) {
          this.escapeGate.isUnlocked = true;
          window.sivagangaAudio?.playResolveBell();
          this.showFeedback('All 3 Ledgers Secured! The Citadel Gate is now UNLOCKED! Escape to the Council!', '#A7BEAE');
        }
      }
    });
  }

  checkEscapeGate() {
    if (!this.escapeGate.isUnlocked) return;
    const dist = Math.hypot(this.player.x - this.escapeGate.x, this.player.y - this.escapeGate.y);
    if (dist < this.escapeGate.radius) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    // Atomic Victory Save
    window.sivagangaSave?.recordLevelVictory(7, { intelCount: 3 });
    window.sivagangaAudio?.playResolveBell();

    this.showFeedback('Infiltration Successful! Enemy troop movements secured.', '#A7BEAE');
    this.renderVictoryOverlay();
  }

  renderVictoryOverlay() {
    let overlay = document.getElementById('level7-victory-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'level7-victory-modal';
      overlay.className = 'level7-victory-overlay';
      document.getElementById('app-root')?.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="level7-victory-card">
        <div class="level7-victory-header">
          <span class="level7-victory-chapter">CHAPTER II · THE SOVEREIGN REIGN (1772)</span>
          <h2 class="level7-victory-title">Trial VII: The Company's Shadow — Complete</h2>
          <p class="level7-victory-subtitle">Sivaganga's Counter-Espionage Secured</p>
        </div>
        <div class="level7-victory-body">
          <p>
            Rani Velu Nachiyar slipped through the twilight shadows of the fort and market,
            evading British East India Company scouts and Nawab sepoys to secure all three
            intercepted intelligence ledgers.
          </p>
          <div class="level7-intel-summary">
            <div class="intel-summary-item">✔ EIC Garrison Roster &amp; Artillery Route</div>
            <div class="intel-summary-item">✔ Nawab of Arcot's Extortion Demand</div>
            <div class="intel-summary-item">✔ Secret Sluice Survey of the Southern Moat</div>
          </div>
          <p style="font-style: italic; color: #eeddcc; font-size: 13px; margin-top: 10px;">
            The ledgers confirm what she feared most: the Company and the Nawab have plotted a surprise strike on Kalaiyar Kovil. We prepare for the fateful dawn.
          </p>
        </div>
        <div class="level7-victory-actions">
          <button id="level7-replay-btn" class="btn-tamil">↺ Replay Trial VII</button>
          <button id="level7-advance-btn" class="btn-tamil btn-primary">Advance to Level 8: Kalaiyar Kovil →</button>
          <button id="level7-chronicle-btn" class="btn-tamil">Chronicle Map</button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';

    // Advance to Level 8
    document.getElementById('level7-advance-btn').onclick = () => {
      overlay.style.display = 'none';
      if (window.sivagangaTransitions) {
        window.sivagangaTransitions.wipe(
          () => {
            this.stop();
            if (window.sivagangaRouter) {
              window.sivagangaRouter.navigate('/level/08-kalaiyar-kovil');
            } else if (window.sivagangaGameplay) {
              window.sivagangaGameplay.start(8);
            }
          },
          () => {}
        );
      } else {
        this.stop();
        if (window.sivagangaRouter) {
          window.sivagangaRouter.navigate('/level/08-kalaiyar-kovil');
        } else if (window.sivagangaGameplay) {
          window.sivagangaGameplay.start(8);
        }
      }
    };

    // Replay: restart level 7
    document.getElementById('level7-replay-btn').onclick = () => {
      overlay.style.display = 'none';
      this.isLevelCompleted = false;
      this.stop();
      if (window.sivagangaGameplay) {
        window.sivagangaGameplay.start(7);
      }
    };

    // Chronicle Map
    document.getElementById('level7-chronicle-btn').onclick = () => {
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
      } else if (window.sivagangaRouter) {
        window.sivagangaRouter.navigate('/chronicle');
      }
    };
  }

  /**
   * Updates diegetic Diya oil lamp HUD element and in-world indicator
   * Detection risk shifts flame from steady radiant gold (#D9A441)
   * toward nervous flickering amber (#E67E22) and agitated danger flutter.
   */
  updateDiegeticLamp(risk) {
    const flameEl = document.querySelector('.diya-flame');
    if (!flameEl) return;

    this.lampFlickerPhase += (0.1 + risk * 0.4);
    const flickerJitter = Math.sin(this.lampFlickerPhase * 18) * (2 + risk * 8);

    if (risk <= 0.05) {
      // Calm, radiant gold
      flameEl.style.filter = 'drop-shadow(0 -4px 8px rgba(217, 164, 65, 0.8))';
      flameEl.style.backgroundColor = '#D9A441';
      flameEl.style.transform = `scale(1.0) translateY(${flickerJitter * 0.2}px)`;
    } else if (risk < 0.60) {
      // Rising risk: Flickering amber
      const amberR = Math.round(217 + (230 - 217) * (risk / 0.6));
      const amberG = Math.round(164 + (126 - 164) * (risk / 0.6));
      const amberB = Math.round(65 + (34 - 65) * (risk / 0.6));
      flameEl.style.filter = `drop-shadow(0 -4px ${10 + risk * 6}px rgba(${amberR}, ${amberG}, ${amberB}, 0.95))`;
      flameEl.style.backgroundColor = `rgb(${amberR}, ${amberG}, ${amberB})`;
      flameEl.style.transform = `scale(${1.0 + risk * 0.2}) translateY(${flickerJitter}px)`;
    } else {
      // Critical danger risk: Agitated orange-red flame flutter
      flameEl.style.filter = 'drop-shadow(0 -5px 14px rgba(217, 56, 30, 0.95))';
      flameEl.style.backgroundColor = '#D9381E';
      flameEl.style.transform = `scale(${1.2 + Math.random() * 0.15}) translateY(${flickerJitter * 1.5}px)`;
    }
  }

  restoreDiegeticLamp() {
    const flameEl = document.querySelector('.diya-flame');
    if (!flameEl) return;
    flameEl.style.filter = '';
    flameEl.style.backgroundColor = '';
    flameEl.style.transform = '';
  }

  updateHUDGarland() {
    const collectedCount = this.intelItems.filter(i => i.collected).length;
    window.sivagangaHUD?.updateGarlandIntel(collectedCount);
  }

  showFeedback(text, color = '#D9A441') {
    this.feedbackText = text;
    this.feedbackColor = color;
    this.feedbackTimer = 3.5;
  }

  updateDistantPatrols(dt) {
    // Used during prologue window screen
    this.sentries.forEach(s => {
      s.x += s.speed * dt * 0.5;
      if (s.x > 800) s.x = 200;
    });
  }

  /**
   * Deterministic QA simulation runner
   * Allows automated tests to simulate N seconds at any arbitrary FPS (e.g. 30 vs 60)
   * and verify identical patrol positions down to float precision!
   */
  simulateFixedTimestep(totalSeconds, fps) {
    this.resetSentries();
    this.player.x = 80;
    this.player.y = 110;
    this.timeAccumulator = 0;
    this.simTime = 0;

    const dtPerFrame = 1 / fps;
    const totalFrames = Math.round(totalSeconds * fps);

    for (let f = 0; f < totalFrames; f++) {
      this.timeAccumulator += dtPerFrame;
      while (this.timeAccumulator >= this.fixedDt) {
        this.fixedStep(this.fixedDt);
        this.timeAccumulator -= this.fixedDt;
        this.simTime += this.fixedDt;
      }
    }

    return this.sentries.map(s => ({
      id: s.id,
      x: Number(s.x.toFixed(4)),
      y: Number(s.y.toFixed(4)),
      facingAngle: Number(s.facingAngle.toFixed(4))
    }));
  }

  // =========================================================================
  // RENDERING ENGINE (Painterly 2D/2.5D Tamil Fort Dusk Architecture)
  // =========================================================================

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.viewMode === 'window') {
      this.renderPrologueWindow(ctx);
    } else {
      this.renderInfiltrationGrounds(ctx);
    }
  }

  /**
   * First Screen: Velu Nachiyar at a fort rampart window at dusk
   */
  renderPrologueWindow(ctx) {
    // 1. Dusk Twilight Sky & Distant Horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height * 0.7);
    skyGrad.addColorStop(0, '#1B2430'); // Cool dusk blue-grey
    skyGrad.addColorStop(0.5, '#2C3E50');
    skyGrad.addColorStop(0.85, '#B85042'); // Warm terracotta horizon
    skyGrad.addColorStop(1.0, '#D9A441'); // Sunset amber edge
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Distant Fort Parapets & Battlements Silhouette
    ctx.fillStyle = '#16100E';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    // Left Watchtower
    ctx.lineTo(140, 320); ctx.lineTo(140, 240); ctx.lineTo(170, 240); ctx.lineTo(170, 220); ctx.lineTo(210, 220); ctx.lineTo(210, 240); ctx.lineTo(240, 240); ctx.lineTo(240, 320);
    // Mid Rampart with Merlons
    for (let x = 240; x < 720; x += 40) {
      ctx.lineTo(x, 320); ctx.lineTo(x, 300); ctx.lineTo(x + 20, 300); ctx.lineTo(x + 20, 320);
    }
    // Right Bastion Tower
    ctx.lineTo(720, 320); ctx.lineTo(720, 230); ctx.lineTo(760, 230); ctx.lineTo(760, 210); ctx.lineTo(800, 210); ctx.lineTo(800, 230); ctx.lineTo(840, 230); ctx.lineTo(840, 320);
    ctx.lineTo(this.width, 320); ctx.lineTo(this.width, this.height); ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // 3. Distant Patrol Lantern Glows on the Horizon (Previewing Detection Cones)
    this.sentries.forEach((s, idx) => {
      const lx = 200 + (s.x * 0.7) % 550;
      const ly = 295;

      // Soft sweeping lantern cone
      const coneGrad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 70);
      coneGrad.addColorStop(0, 'rgba(217, 164, 65, 0.85)');
      coneGrad.addColorStop(0.3, 'rgba(217, 164, 65, 0.35)');
      coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');

      ctx.save();
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.arc(lx, ly, 70, -0.3, 0.6);
      ctx.closePath();
      ctx.fill();

      // Sentry lantern pinprick
      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Foreground Fort Rampart Window Arch (Deep Maroon & Terracotta)
    ctx.fillStyle = '#2E1F1B'; // BG-MAROON
    // Left wall pillar
    ctx.fillRect(0, 0, 160, this.height);
    // Right wall pillar
    ctx.fillRect(this.width - 160, 0, 160, this.height);
    // Upper Arch Crown
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width, 0);
    ctx.lineTo(this.width, 140);
    ctx.quadraticCurveTo(this.width / 2, 40, 0, 140);
    ctx.closePath();
    ctx.fill();

    // Terracotta Carved Pillar Molding
    ctx.strokeStyle = '#B85042';
    ctx.lineWidth = 4;
    ctx.strokeRect(156, 120, 10, this.height - 120);
    ctx.strokeRect(this.width - 166, 120, 10, this.height - 120);

    // Stone Window Sill (Foreground Table Ledge)
    ctx.fillStyle = '#3A2822';
    ctx.fillRect(140, this.height - 90, this.width - 280, 90);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(140, this.height - 90, this.width - 280, 90);

    // 5. Traditional Tamil Brass Oil Lamp (Agal Vilakku) on the Sill (Flickering for the first time)
    const lampX = 250;
    const lampY = this.height - 60;

    // Brass bowl vessel
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.ellipse(lampX, lampY + 12, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Flickering Oil Lamp Flame
    const flameJitter = Math.sin(this.lampFlickerPhase * 8) * 3;
    const flameHeight = 22 + Math.cos(this.lampFlickerPhase * 6) * 4;

    // Outer warm amber glow
    const lampGlow = ctx.createRadialGradient(lampX + 10, lampY, 3, lampX + 10, lampY, 55);
    lampGlow.addColorStop(0, 'rgba(217, 164, 65, 0.7)');
    lampGlow.addColorStop(0.4, 'rgba(230, 126, 34, 0.3)');
    lampGlow.addColorStop(1, 'rgba(217, 164, 65, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(lampX + 10, lampY, 55, 0, Math.PI * 2);
    ctx.fill();

    // Flame shape
    ctx.fillStyle = '#FFA726';
    ctx.beginPath();
    ctx.moveTo(lampX + 6, lampY + 8);
    ctx.quadraticCurveTo(lampX + 2, lampY - 6, lampX + 10 + flameJitter * 0.4, lampY - flameHeight);
    ctx.quadraticCurveTo(lampX + 18, lampY - 6, lampX + 14, lampY + 8);
    ctx.closePath();
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath();
    ctx.arc(lampX + 10, lampY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Queen Velu Nachiyar Silhouette at Window (Contemplating the realm)
    const veluX = 660;
    const veluY = this.height - 60;
    ctx.fillStyle = '#1A1210';
    // Saree drapery
    ctx.beginPath();
    ctx.moveTo(veluX - 25, veluY + 30);
    ctx.lineTo(veluX + 25, veluY + 30);
    ctx.lineTo(veluX + 15, veluY - 70);
    ctx.lineTo(veluX - 18, veluY - 65);
    ctx.closePath();
    ctx.fill();
    // Head & Royal Hair Chignon (Kondai)
    ctx.beginPath();
    ctx.arc(veluX, veluY - 90, 14, 0, Math.PI * 2);
    ctx.arc(veluX - 10, veluY - 88, 8, 0, Math.PI * 2);
    ctx.fill();
    // Gold hair ornament rim
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 7. Scribe Briefing Parchment Modal
    ctx.save();
    const bx = 280;
    const by = 80;
    const bw = 400;
    const bh = 220;

    ctx.fillStyle = 'rgba(46, 31, 27, 0.94)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Inner gold fillet
    ctx.strokeStyle = '#eeddcc';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(bx + 6, by + 6, bw - 12, bh - 12);

    ctx.fillStyle = '#D9A441';
    ctx.font = 'bold 18px "Cambria", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIVAGANGA FORT RAMPARTS (1772)', bx + bw / 2, by + 34);

    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Chapter II: The Sovereign Reign — The Company\'s Shadow', bx + bw / 2, by + 56);

    ctx.font = '13px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.textAlign = 'left';
    ctx.fillText('Colonial redcoats and the Nawab\'s sepoys prowl below.', bx + 24, by + 90);
    ctx.fillText('Notice how the brass oil lamp flickers as the night wind rises.', bx + 24, by + 112);
    ctx.fillText('Descend to the market lanes to recover 3 strategic ledgers', bx + 24, by + 134);
    ctx.fillText('before the Citadel Gates are sealed for the night.', bx + 24, by + 156);

    // Interactive Button Prompt
    ctx.fillStyle = 'rgba(184, 80, 66, 0.9)';
    ctx.fillRect(bx + 40, by + 172, bw - 80, 32);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(bx + 40, by + 172, bw - 80, 32);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS [SPACE / ENTER] TO INFILTRATE', bx + bw / 2, by + 193);
    ctx.restore();
  }

  /**
   * Main Stealth Arena: Sivaganga Fort Ramparts & Market Lanes at Dusk
   */
  renderInfiltrationGrounds(ctx) {
    // 1. Ground Cobblestones & Paving (Dusk Slate & Terracotta)
    ctx.fillStyle = '#221B19';
    ctx.fillRect(0, 0, this.width, this.height);

    // Paved stone texture grids
    ctx.save();
    ctx.strokeStyle = 'rgba(70, 52, 45, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
    }
    ctx.restore();

    // 2. Render Shadow Sanctuaries (Cool blue-grey transparent washes)
    this.shadowZones.forEach(z => {
      ctx.fillStyle = 'rgba(27, 36, 48, 0.75)'; // Cooler blue-grey shadow tone
      ctx.fillRect(z.x, z.y, z.w, z.h);

      // Subtle sage border to show it's a sanctuary
      ctx.strokeStyle = 'rgba(167, 190, 174, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(z.x, z.y, z.w, z.h);

      // Faint label in Cambria
      ctx.fillStyle = 'rgba(167, 190, 174, 0.6)';
      ctx.font = 'italic 10px "Cambria", serif';
      ctx.fillText(z.name, z.x + 6, z.y + 14);
    });

    // 3. Render Fort Obstacles (Granite Ashlar Walls & Market Counters)
    this.obstacles.forEach(obs => {
      // Wall base
      ctx.fillStyle = '#2E1F1B'; // BG-MAROON
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Wall coping rim
      ctx.strokeStyle = '#B85042'; // BG-TERRACOTTA
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

      // Top highlighted granite edge
      ctx.fillStyle = '#3E2A24';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.w - 4, Math.min(6, obs.h - 4));
    });

    // 4. Render 3 Strategic Intel Ledgers (Glow if uncollected)
    this.intelItems.forEach(item => {
      if (item.collected) return;

      // Pulsing gold beacon aura
      const pulse = Math.sin(this.simTime * 4) * 4;
      const aura = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 20 + pulse);
      aura.addColorStop(0, 'rgba(217, 164, 65, 0.8)');
      aura.addColorStop(0.5, 'rgba(217, 164, 65, 0.3)');
      aura.addColorStop(1, 'rgba(217, 164, 65, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 20 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Palm-Leaf Scroll Graphic
      ctx.fillStyle = '#E8D3A2';
      ctx.fillRect(item.x - 10, item.y - 6, 20, 12);
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(item.x - 10, item.y - 6, 20, 12);
      // Tie string
      ctx.strokeStyle = '#D9A441';
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 6);
      ctx.lineTo(item.x, item.y + 6);
      ctx.stroke();

      // Item Name Tag
      ctx.font = 'bold 10px "Cambria", serif';
      ctx.fillStyle = '#FFE082';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.split(' ')[0], item.x, item.y - 12);
    });

    // 5. Render Sentry Vision Cones as Soft Torchlight Glows (NO hard geometric shapes!)
    this.sentries.forEach(s => {
      this.renderSoftTorchlightCone(ctx, s);
    });

    // 6. Render Sentry Patrol NPCs
    this.sentries.forEach(s => {
      this.renderSentryNPC(ctx, s);
    });

    // 7. Render Inner Citadel Escape Gate
    this.renderCitadelEscapeGate(ctx);

    // 8. Render Player Avatar (Rani Velu Nachiyar)
    this.renderPlayer(ctx);

    // 9. Render Ambient Dusk Embers / Particles
    ctx.save();
    this.duskParticles.forEach(p => {
      ctx.fillStyle = `rgba(217, 164, 65, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 10. In-Game Diegetic HUD Feedback & Risk Lamp
    this.renderInGameStatus(ctx);
  }

  /**
   * Renders vision cone as a soft radial-conic torchlight glow with feathered edges.
   * Brightens and flares when the player approaches the warning boundary!
   */
  renderSoftTorchlightCone(ctx, sentry) {
    ctx.save();

    const range = sentry.coneRange * sentry.flareMultiplier;
    const halfAngle = (sentry.coneAngle * 0.5);

    // Soft feathered radial gradient
    const coneGrad = ctx.createRadialGradient(sentry.x, sentry.y, 6, sentry.x, sentry.y, range);
    if (sentry.isAlerted) {
      // Flaring bright amber warning
      coneGrad.addColorStop(0, 'rgba(230, 126, 34, 0.75)');
      coneGrad.addColorStop(0.3, 'rgba(217, 164, 65, 0.45)');
      coneGrad.addColorStop(0.7, 'rgba(217, 164, 65, 0.18)');
      coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0.0)');
    } else {
      // Normal soft torchlight
      coneGrad.addColorStop(0, 'rgba(217, 164, 65, 0.45)');
      coneGrad.addColorStop(0.4, 'rgba(217, 164, 65, 0.22)');
      coneGrad.addColorStop(0.8, 'rgba(217, 164, 65, 0.08)');
      coneGrad.addColorStop(1, 'rgba(217, 164, 65, 0.0)');
    }

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(sentry.x, sentry.y);
    ctx.arc(
      sentry.x,
      sentry.y,
      range,
      sentry.facingAngle - halfAngle,
      sentry.facingAngle + halfAngle
    );
    ctx.closePath();
    ctx.fill();

    // Optional subtle torchlight flicker arc
    ctx.strokeStyle = sentry.isAlerted ? 'rgba(230, 126, 34, 0.4)' : 'rgba(217, 164, 65, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      sentry.x,
      sentry.y,
      range * 0.85,
      sentry.facingAngle - halfAngle * 0.8,
      sentry.facingAngle + halfAngle * 0.8
    );
    ctx.stroke();

    ctx.restore();
  }

  renderSentryNPC(ctx, sentry) {
    ctx.save();
    // Shadow under feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(sentry.x, sentry.y + 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sentry Body (Redcoat or Arcot Sepoy)
    const isEIC = sentry.faction === 'eic';
    ctx.fillStyle = isEIC ? '#8B251A' : '#1C3A5A'; // Redcoat red vs Sepoy navy
    ctx.beginPath();
    ctx.arc(sentry.x, sentry.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Sentry Head & Shako / Turban
    ctx.fillStyle = isEIC ? '#1E1E1E' : '#B85042';
    ctx.beginPath();
    ctx.arc(sentry.x, sentry.y - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Held Brass Lantern in Hand
    const handX = sentry.x + Math.cos(sentry.facingAngle) * 12;
    const handY = sentry.y + Math.sin(sentry.facingAngle) * 12;

    ctx.fillStyle = '#B8860B';
    ctx.fillRect(handX - 3, handY - 4, 6, 8);
    ctx.fillStyle = sentry.isAlerted ? '#FFA726' : '#FFE082';
    ctx.beginPath();
    ctx.arc(handX, handY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderPlayer(ctx) {
    ctx.save();
    const p = this.player;

    // Ground shadow (smaller if crouching)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    const shadowR = p.isCrouching ? 8 : 12;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 12, shadowR, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shadow Sanctuary Concealment Aura (Soft sage shimmer when concealed)
    if (p.inShadow) {
      ctx.strokeStyle = 'rgba(167, 190, 174, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Velu Nachiyar Saree & Silhouette
    ctx.fillStyle = p.inShadow ? '#2A1F1B' : '#B85042'; // Darker drape in shadow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.isCrouching ? 9 : 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Royal Kondai (Chignon)
    ctx.fillStyle = '#1A1210';
    ctx.beginPath();
    ctx.arc(p.x, p.y - (p.isCrouching ? 4 : 6), 6, 0, Math.PI * 2);
    ctx.fill();

    // In-World Diegetic Agal Vilakku (Oil Lamp carried at waist/hem)
    // Mirrors HUD risk color and jitter directly!
    const lampOffsetAngle = p.facing === 'left' ? Math.PI : 0;
    const lampX = p.x + Math.cos(lampOffsetAngle) * 11;
    const lampY = p.y + 4;

    const risk = this.detectionRisk;
    let flameColor = '#D9A441';
    if (risk > 0.6) flameColor = '#D9381E';
    else if (risk > 0.1) flameColor = '#E67E22';

    // Faint lamp glow
    const inWorldGlow = ctx.createRadialGradient(lampX, lampY, 1, lampX, lampY, 16);
    inWorldGlow.addColorStop(0, flameColor);
    inWorldGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = inWorldGlow;
    ctx.beginPath();
    ctx.arc(lampX, lampY, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.arc(lampX, lampY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCitadelEscapeGate(ctx) {
    ctx.save();
    const g = this.escapeGate;

    // Stone Arch Gateway Frame
    ctx.fillStyle = g.isUnlocked ? '#3B2A22' : '#221511';
    ctx.fillRect(g.x - 25, g.y - 35, 50, 70);
    ctx.strokeStyle = g.isUnlocked ? '#D9A441' : '#5E4130';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(g.x - 25, g.y - 35, 50, 70);

    // Inner Doorway
    ctx.fillStyle = g.isUnlocked ? 'rgba(217, 164, 65, 0.4)' : '#100A08';
    ctx.beginPath();
    ctx.arc(g.x, g.y - 5, 18, Math.PI, 0);
    ctx.lineTo(g.x + 18, g.y + 35);
    ctx.lineTo(g.x - 18, g.y + 35);
    ctx.closePath();
    ctx.fill();

    // Beacon Pulse if unlocked
    if (g.isUnlocked) {
      const pulse = Math.sin(this.simTime * 5) * 6;
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 10px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESCAPE TO COUNCIL', g.x, g.y - 42);
    } else {
      ctx.fillStyle = '#8C766A';
      ctx.font = 'italic 9px "Cambria", serif';
      ctx.textAlign = 'center';
      ctx.fillText('CITADEL GATE LOCKED', g.x, g.y - 42);
    }

    ctx.restore();
  }

  renderInGameStatus(ctx) {
    // 1. Objectives Bar in Top Left
    ctx.save();
    ctx.fillStyle = 'rgba(46, 31, 27, 0.88)';
    ctx.fillRect(40, 10, 310, 32);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 10, 310, 32);

    const collected = this.intelItems.filter(i => i.collected).length;
    ctx.fillStyle = '#eeddcc';
    ctx.font = '12px "Cambria", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Strategic Ledgers Recovered:`, 50, 30);

    ctx.fillStyle = '#D9A441';
    ctx.font = 'bold 13px "Calibri", sans-serif';
    ctx.fillText(`${collected} / 3`, 220, 31);

    // 2. Crouch / Shadow Status Indicator
    ctx.fillStyle = this.player.inShadow ? '#A7BEAE' : '#E0D0C0';
    ctx.font = 'italic 11px "Cambria", serif';
    ctx.fillText(
      this.player.inShadow ? '[ IN SHADOW — CONCEALED ]' : (this.player.isCrouching ? '[ CROUCHING ]' : '[ SHIFT / C: Crouch ]'),
      265,
      30
    );

    // 3. Feedback Toast
    if (this.feedbackText) {
      const tw = ctx.measureText(this.feedbackText).width + 30;
      const tx = (this.width - tw) / 2;
      ctx.fillStyle = 'rgba(46, 31, 27, 0.95)';
      ctx.fillRect(tx, 485, tw, 28);
      ctx.strokeStyle = this.feedbackColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, 485, tw, 28);

      ctx.fillStyle = this.feedbackColor;
      ctx.font = 'bold 12px "Cambria", serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.feedbackText, this.width / 2, 503);
    }

    ctx.restore();
  }
}

// Global Singleton Instance
window.sivagangaTheCompanysShadow = new SivagangaLevel7TheCompanysShadow();
