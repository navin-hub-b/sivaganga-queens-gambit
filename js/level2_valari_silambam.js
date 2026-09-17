/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 2: "VALARI & SILAMBAM"
 * Ramanathapuram Fort Training Grounds (1740s).
 * Young Velu Nachiyar trains in traditional Tamil martial arts:
 * - Silambam (bamboo/rattan staff fighting)
 * - Valari (crescent-shaped iron throwing weapon)
 * Introduces Rhythm & Timing Combat tied to environmental cues:
 * 1. Animated Drummer NPC striking the Murasu drum
 * 2. Floor Rangoli Kolam sigil pulsing in ACCENT-GOLD on-beat
 * 3. Telegraph-then-react friendly sparring partner
 * 4. Fixed game-clock timing (framerate independent) and single-action clamping
 */

class SivagangaLevel2ValariSilambam {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.animationId = null;

    // Fixed Game-Clock Rhythm Engine (Framerate Independent)
    this.bpm = 72; // 72 Beats Per Minute (~833.33ms per beat)
    this.beatIntervalMs = 60000 / this.bpm;
    this.hitWindowToleranceMs = 200; // ±200ms on-beat window (~48% forgiving rhythm detection)
    this.startTime = 0;
    this.lastDrumBeatIndex = -1;
    this.lastActionBeatIndex = -1;
    this.lastInputTimestamp = 0; // 100ms hardware key debounce
    this.lastSuccessfulActionBeat = -1; // Prevents double hits on same beat without locking out on-beat presses

    // Gameplay Phases:
    // 0: Intro Dialogue
    // 1: Dummy Strike Practice (Silambam, 3 hits)
    // 2: Target Post Throw (Valari, 2 throws)
    // 3: Sparring Partner Exchange (Telegraph Block & Counter, 3 exchanges)
    // 4: Level Resolved
    this.phase = 0;
    this.phaseProgress = 0;
    this.phaseTarget = 3;

    // Young Velu Nachiyar (Protagonist)
    this.player = {
      x: 320,
      y: 330,
      stance: 'idle', // 'idle', 'strike_silambam', 'block_silambam', 'throw_valari'
      actionTimer: 0,
      valariInHand: true,
      facing: 'right'
    };

    // Flying Valari Projectile
    this.valari = {
      active: false,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      curX: 0,
      curY: 0,
      progress: 0, // 0 -> 1 -> 0 (arc return)
      angle: 0
    };

    // Static Training Dummy (Phase 1)
    this.dummy = {
      x: 520,
      y: 330,
      wobble: 0,
      hitFlash: 0
    };

    // Target Post (Phase 2)
    this.targetPost = {
      x: 620,
      y: 320,
      wobble: 0,
      hitFlash: 0
    };

    // Friendly Sparring Partner "Kandan" (Phase 3)
    this.sparringPartner = {
      x: 520,
      y: 330,
      state: 'idle', // 'idle', 'telegraph_windup', 'striking', 'recoiling'
      telegraphBeat: -1,
      strikeBeat: -1,
      actionTimer: 0,
      wobble: 0,
      blockedSuccessfully: false
    };

    // Seated Murasu Drummer NPC
    this.drummer = {
      x: 150,
      y: 260,
      armPhase: 0,
      strikeImpact: 0
    };

    // Wall-Niche Diya Lamp (Diegetic Morale Indicator)
    this.wallLamp = {
      x: 90,
      y: 160,
      flamePhase: 0
    };

    // Floor Rangoli Sigil Pulse & Resolution Particles
    this.rangoliSigil = {
      x: 380,
      y: 340,
      radius: 65,
      pulseGlow: 0,
      lightFlare: 0,
      missFade: 0
    };

    this.particles = [];

    // Keyboard & Input Listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.keysHeld = { strike: false, block: false };

    // Dialogue State
    this.tutorMessage = 'Feel the drummer\'s cadence, young Queen. Watch the floor Rangoli pulse with the Murasu beat.';
    this.tutorSpeaker = 'Master Veera Maravar';
    this.tutorPlaqueTimer = 0;
  }

  init(canvas) {
    this.canvas = canvas;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  start() {
    this.isActive = true;
    this.isTransitioning = false;
    this.startTime = performance.now();
    this.lastDrumBeatIndex = -1;
    this.lastActionBeatIndex = -1;
    this.lastInputTimestamp = 0;
    this.lastSuccessfulActionBeat = -1;
    this.phase = 0;
    this.phaseProgress = 0;
    this.particles = [];
    this.player.stance = 'idle';
    this.player.valariInHand = true;

    // Reset partner & targets
    this.dummy.wobble = 0;
    this.sparringPartner.state = 'idle';

    this.showTutorPlaque(
      'Master Veera Maravar',
      'Welcome to the training grounds, Princess Velu! Feel the drummer\'s cadence and watch the Rangoli pulse with the Murasu beat.'
    );

    // Bind inputs
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', this.boundClick);
    }

    // Attach diegetic action plaques
    this.renderOnScreenActionControls();

    // Start Audio Drone, set master volume to maximum, and trigger punchy opening drumbeat
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.setMasterVolume(1.0);
      window.sivagangaAudio.playMurasuDrumBeat(true);
      window.sivagangaAudio.startTanpuraDrone();
    }

    // Begin Fixed-Clock Animation Loop
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundClick);
    }
    const ctrlBar = document.getElementById('level2-touch-controls');
    if (ctrlBar) ctrlBar.remove();
  }

  renderOnScreenActionControls() {
    const existing = document.getElementById('level2-touch-controls');
    if (existing) existing.remove();

    const container = document.getElementById('view-level-play');
    if (!container) return;

    const ctrlBar = document.createElement('div');
    ctrlBar.id = 'level2-touch-controls';
    ctrlBar.style.cssText = `
      position: absolute;
      bottom: 12px;
      right: 18px;
      z-index: 50;
      display: flex;
      gap: 10px;
      pointer-events: auto;
      opacity: 0.9;
    `;

    const btnStrike = document.createElement('button');
    btnStrike.className = 'btn-tamil btn-primary';
    btnStrike.style.cssText = 'padding: 6px 14px; font-size: 12px; cursor: pointer;';
    btnStrike.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 4px; vertical-align: middle;">
        <path d="M14.5 2.5l7 7-10 10-7-7 10-10zm-3 5l-5 5 1.5 1.5 5-5-1.5-1.5z"/>
      </svg>
      <span>Strike [J / Space / D]</span>
    `;
    btnStrike.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerPlayerAction('strike');
    });

    const btnBlock = document.createElement('button');
    btnBlock.className = 'btn-tamil btn-sage';
    btnBlock.style.cssText = 'padding: 6px 14px; font-size: 12px; cursor: pointer;';
    btnBlock.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 4px; vertical-align: middle;">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
      </svg>
      <span>Block [K / Shift / A]</span>
    `;
    btnBlock.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerPlayerAction('block');
    });

    ctrlBar.appendChild(btnStrike);
    ctrlBar.appendChild(btnBlock);
    container.appendChild(ctrlBar);
  }

  showTutorPlaque(speaker, message) {
    this.tutorSpeaker = speaker;
    this.tutorMessage = message;
    this.tutorPlaqueTimer = 3.5;
  }

  // =========================================================================
  // FIXED GAME-CLOCK TIMING CALCULATIONS (Framerate Independent)
  // =========================================================================
  getCurrentBeatInfo(currentTime) {
    const elapsed = Math.max(0, currentTime - this.startTime);
    const closestBeat = Math.round(elapsed / this.beatIntervalMs);
    const closestBeatTime = closestBeat * this.beatIntervalMs;
    const diffMs = Math.abs(elapsed - closestBeatTime);
    const isOnBeat = diffMs <= this.hitWindowToleranceMs;
    const beatProgress = (elapsed % this.beatIntervalMs) / this.beatIntervalMs;

    return {
      elapsed,
      beatIndex: closestBeat,
      distToClosestBeat: diffMs,
      isOnBeat,
      beatProgress
    };
  }

  // =========================================================================
  // INPUT HANDLING & ANTI-SPAM CLAMPING
  // =========================================================================
  handleKeyDown(e) {
    if (!this.isActive) return;

    if (e.key === 'h' || e.key === 'H' || e.code === 'KeyH' || e.key === 'F1') {
      e.preventDefault();
      if (window.sivagangaGameplay) {
        window.sivagangaGameplay.toggleLoreModal();
      }
      return;
    }

    const isStrikeKey = e.code === 'KeyJ' || e.code === 'Space' || e.code === 'KeyD' || e.code === 'ArrowRight' || e.code === 'Digit1';
    const isBlockKey = e.code === 'KeyK' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'Digit2';

    if (isStrikeKey) {
      if (!this.keysHeld.strike) {
        this.keysHeld.strike = true;
        this.triggerPlayerAction('strike');
      }
      e.preventDefault();
    } else if (isBlockKey) {
      if (!this.keysHeld.block) {
        this.keysHeld.block = true;
        this.triggerPlayerAction('block');
      }
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    const isStrikeKey = e.code === 'KeyJ' || e.code === 'Space' || e.code === 'KeyD' || e.code === 'ArrowRight' || e.code === 'Digit1';
    const isBlockKey = e.code === 'KeyK' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'Digit2';

    if (isStrikeKey) {
      this.keysHeld.strike = false;
    } else if (isBlockKey) {
      this.keysHeld.block = false;
    }
  }

  handleClick(e) {
    if (!this.isActive || this.isTransitioning) return;

    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const w = this.canvas.width;
      const pathX = w - 70;
      const pathY = 320;
      if (Math.hypot(clickX - pathX, clickY - pathY) < 55) {
        if (this.phase >= 4) {
          this.transitionToLevel3();
        } else {
          this.showTutorPlaque(
            'Master Veera Maravar',
            'The secret Mandapam colonnade remains barred until you master staff and sickle drills!'
          );
          if (window.sivagangaAudio) {
            window.sivagangaAudio.playQuietFade();
          }
        }
        return;
      }
    }

    this.triggerPlayerAction('strike');
  }

  triggerPlayerAction(actionType) {
    if (!this.isActive) return;
    const now = performance.now();

    // Input debounce (100ms) prevents physical key bouncing without blocking beat accuracy
    if (now - this.lastInputTimestamp < 100) {
      return;
    }
    this.lastInputTimestamp = now;

    const beatInfo = this.getCurrentBeatInfo(now);

    if (actionType === 'strike') {
      this.executeStrikeAction(beatInfo);
    } else if (actionType === 'block') {
      this.executeBlockAction(beatInfo);
    }
  }

  executeStrikeAction(beatInfo) {
    if (this.phase === 0) {
      this.phase = 1;
      this.phaseProgress = 0;
      this.phaseTarget = 3;
      this.showTutorPlaque(
        'Master Veera Maravar',
        'Phase 1: Strike the training dummy with your Silambam staff in rhythm with the Murasu pulse! [Press J / Space / D on-beat]'
      );
      return;
    }

    if (this.phase === 1) {
      this.player.stance = 'strike_silambam';
      this.player.actionTimer = 0.28;

      if (beatInfo.isOnBeat) {
        if (this.lastSuccessfulActionBeat === beatInfo.beatIndex) return;
        this.lastSuccessfulActionBeat = beatInfo.beatIndex;

        this.phaseProgress++;
        this.dummy.wobble = 14;
        this.dummy.hitFlash = 0.3;
        this.rangoliSigil.lightFlare = 1.0;

        if (window.sivagangaAudio) {
          window.sivagangaAudio.playSilambamClang();
          window.sivagangaAudio.playSoftLightFlare();
        }

        this.spawnFlareParticles(this.dummy.x, this.dummy.y - 30, '#D9A441');

        if (this.phaseProgress >= this.phaseTarget) {
          this.phase = 2;
          this.phaseProgress = 0;
          this.phaseTarget = 2;
          this.showTutorPlaque(
            'Master Veera Maravar',
            'Marvelous cadence! Now draw the Valari sickle. Throw it on the beat at the target post—it will return to your grasp!'
          );
        } else {
          this.showTutorPlaque(
            'Master Veera Maravar',
            `Good strike! (${this.phaseProgress}/3) Keep your breath in tune with the floor Rangoli.`
          );
        }
      } else {
        this.rangoliSigil.missFade = 0.5;
        if (window.sivagangaAudio) {
          window.sivagangaAudio.playQuietFade();
        }
        this.showTutorPlaque(
          'Master Veera Maravar',
          'A fraction off-cadence, Velu. Watch the Rangoli arcs draw together before swinging.'
        );
      }
    } else if (this.phase === 2) {
      if (this.valari.active) return;

      this.player.stance = 'throw_valari';
      this.player.actionTimer = 0.35;

      if (beatInfo.isOnBeat) {
        if (this.lastSuccessfulActionBeat === beatInfo.beatIndex) return;
        this.lastSuccessfulActionBeat = beatInfo.beatIndex;

        this.valari.active = true;
        this.valari.startX = this.player.x + 14;
        this.valari.startY = this.player.y - 20;
        this.valari.targetX = this.targetPost.x;
        this.valari.targetY = this.targetPost.y - 30;
        this.valari.progress = 0;
        this.valari.curX = this.valari.startX;
        this.valari.curY = this.valari.startY;
        this.player.valariInHand = false;
        this.rangoliSigil.lightFlare = 0.8;

        if (window.sivagangaAudio) {
          window.sivagangaAudio.playValariWhistle();
        }
      } else {
        this.rangoliSigil.missFade = 0.5;
        if (window.sivagangaAudio) {
          window.sivagangaAudio.playQuietFade();
        }
        this.showTutorPlaque(
          'Master Veera Maravar',
          'Release when the drum strikes, young queen! The sickle needs the momentum of the beat.'
        );
      }
    } else if (this.phase === 3) {
      this.player.stance = 'strike_silambam';
      this.player.actionTimer = 0.28;

      const canCounter = (this.sparringPartner.state === 'recoiling' || this.sparringPartner.state === 'striking');

      if (canCounter && beatInfo.isOnBeat) {
        if (this.lastSuccessfulActionBeat === beatInfo.beatIndex) return;
        this.lastSuccessfulActionBeat = beatInfo.beatIndex;

        this.phaseProgress++;
        this.sparringPartner.wobble = 18;
        this.sparringPartner.state = 'idle';
        this.sparringPartner.blockedSuccessfully = false;
        this.sparringPartner.actionTimer = 0;
        this.rangoliSigil.lightFlare = 1.0;

        if (window.sivagangaAudio) {
          window.sivagangaAudio.playSilambamClang();
          window.sivagangaAudio.playSoftLightFlare();
        }

        this.spawnFlareParticles(this.sparringPartner.x, this.sparringPartner.y - 25, '#D9A441');

        if (this.phaseProgress >= this.phaseTarget) {
          this.resolveLevel();
        } else {
          this.showTutorPlaque(
            'Master Veera Maravar',
            `Flawless counter! (${this.phaseProgress}/3) Kandan readies his next staff telegraph.`
          );
        }
      } else {
        this.rangoliSigil.missFade = 0.4;
        if (window.sivagangaAudio) {
          window.sivagangaAudio.playQuietFade();
        }
        if (this.sparringPartner.state === 'idle') {
          this.showTutorPlaque(
            'Master Veera Maravar',
            'Wait for Kandan to raise his guard, block his strike, then counter-attack!'
          );
        }
      }
    }
  }

  executeBlockAction(beatInfo) {
    if (this.phase !== 3) {
      this.player.stance = 'block_silambam';
      this.player.actionTimer = 0.35;
      return;
    }

    this.player.stance = 'block_silambam';
    this.player.actionTimer = 0.38;

    if (this.sparringPartner.state === 'striking' && beatInfo.isOnBeat) {
      if (this.lastSuccessfulActionBeat === beatInfo.beatIndex) return;
      this.lastSuccessfulActionBeat = beatInfo.beatIndex;

      this.sparringPartner.state = 'recoiling';
      this.sparringPartner.blockedSuccessfully = true;
      this.sparringPartner.actionTimer = 1.8; // Generous 1.8s recoil window spanning the next full beat (~833ms) and follow-up
      this.rangoliSigil.lightFlare = 0.9;

      if (window.sivagangaAudio) {
        window.sivagangaAudio.playSilambamClang();
      }

      this.spawnFlareParticles(this.player.x + 30, this.player.y - 20, '#D9A441');

      this.showTutorPlaque(
        'Master Veera Maravar',
        'Staff locked in poise! PARRIED! Now COUNTER-STRIKE [J / Space / D] on the next beat!'
      );
    } else {
      this.rangoliSigil.missFade = 0.4;
      if (window.sivagangaAudio) {
        window.sivagangaAudio.playQuietFade();
      }
    }
  }

  loop(now) {
    if (!this.isActive) return;

    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(now, dt);
    this.draw(now);

    this.animationId = requestAnimationFrame((t) => this.loop(t));
  }

  update(now, dt) {
    const beatInfo = this.getCurrentBeatInfo(now);

    // Drummer beat trigger synced to fixed clock
    if (beatInfo.beatIndex !== this.lastDrumBeatIndex) {
      this.lastDrumBeatIndex = beatInfo.beatIndex;
      const isAccent = beatInfo.beatIndex % 4 === 0;

      if (window.sivagangaAudio) {
        window.sivagangaAudio.playMurasuDrumBeat(isAccent);
      }

      this.drummer.strikeImpact = 1.0;

      if (this.phase === 3) {
        this.updateSparringPartnerAI(beatInfo.beatIndex);
      }
    }

    this.drummer.strikeImpact = Math.max(0, this.drummer.strikeImpact - dt * 4);
    this.rangoliSigil.lightFlare = Math.max(0, this.rangoliSigil.lightFlare - dt * 2.5);
    this.rangoliSigil.missFade = Math.max(0, this.rangoliSigil.missFade - dt * 2.0);
    this.dummy.wobble = Math.max(0, this.dummy.wobble - dt * 25);
    this.targetPost.wobble = Math.max(0, this.targetPost.wobble - dt * 25);
    this.sparringPartner.wobble = Math.max(0, this.sparringPartner.wobble - dt * 25);

    if (this.tutorPlaqueTimer > 0) {
      this.tutorPlaqueTimer = Math.max(0, this.tutorPlaqueTimer - dt);
    }

    if (this.player.actionTimer > 0) {
      this.player.actionTimer -= dt;
      if (this.player.actionTimer <= 0) {
        this.player.stance = 'idle';
      }
    }

    if (this.valari.active) {
      this.updateValariFlight(dt);
    }

    if (this.sparringPartner.actionTimer > 0) {
      this.sparringPartner.actionTimer -= dt;
      if (this.sparringPartner.actionTimer <= 0 && this.sparringPartner.state === 'recoiling') {
        this.sparringPartner.state = 'idle';
      }
    }

    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * p.decay;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  updateSparringPartnerAI(currentBeat) {
    if (this.sparringPartner.state === 'recoiling') {
      // Allow player ample time to land their counter-strike
      return;
    }

    if (this.sparringPartner.state === 'idle') {
      if (currentBeat % 3 === 0) {
        this.sparringPartner.state = 'telegraph_windup';
        this.sparringPartner.telegraphBeat = currentBeat;
        this.sparringPartner.blockedSuccessfully = false;
        this.showTutorPlaque(
          'Master Veera Maravar',
          'TELEGRAPH! Kandan raises his rattan staff—prepare to BLOCK [K / Shift / A] on the drum strike!'
        );
      }
    } else if (this.sparringPartner.state === 'telegraph_windup') {
      if (currentBeat === this.sparringPartner.telegraphBeat + 1) {
        this.sparringPartner.state = 'striking';
        this.sparringPartner.strikeBeat = currentBeat;
      }
    } else if (this.sparringPartner.state === 'striking') {
      if (!this.sparringPartner.blockedSuccessfully) {
        this.sparringPartner.state = 'idle';
        this.showTutorPlaque(
          'Master Veera Maravar',
          'A clean wind-up by Kandan. Keep your eyes on his shoulder, then raise your Silambam guard.'
        );
      }
    }
  }

  updateValariFlight(dt) {
    this.valari.progress += dt * 1.5;
    this.valari.angle += dt * 22;

    if (this.valari.progress < 0.5) {
      const t = this.valari.progress * 2;
      const midY = this.valari.startY - 60;
      this.valari.curX = this.valari.startX + (this.valari.targetX - this.valari.startX) * t;
      this.valari.curY = Math.pow(1 - t, 2) * this.valari.startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * this.valari.targetY;
    } else if (this.valari.progress < 1.0) {
      if (this.valari.progress >= 0.5 && this.valari.progress < 0.55 && this.targetPost.wobble === 0) {
        this.targetPost.wobble = 14;
        this.spawnFlareParticles(this.targetPost.x, this.targetPost.y - 30, '#D9A441');
        if (window.sivagangaAudio) {
          window.sivagangaAudio.playSilambamClang();
          window.sivagangaAudio.playSoftLightFlare();
        }
      }
      const t = (this.valari.progress - 0.5) * 2;
      const returnMidY = this.valari.targetY + 40;
      this.valari.curX = this.valari.targetX + (this.player.x - this.valari.targetX) * t;
      this.valari.curY = Math.pow(1 - t, 2) * this.valari.targetY + 2 * (1 - t) * t * returnMidY + Math.pow(t, 2) * (this.player.y - 20);
    } else {
      this.valari.active = false;
      this.player.valariInHand = true;
      this.phaseProgress++;

      if (this.phaseProgress >= this.phaseTarget) {
        this.phase = 3;
        this.phaseProgress = 0;
        this.phaseTarget = 3;
        this.showTutorPlaque(
          'Master Veera Maravar',
          'Splendid! Kandan approaches for staff sparring. He will TELEGRAPH his swing a full beat prior. BLOCK his strike, then COUNTER!'
        );
      } else {
        this.showTutorPlaque(
          'Master Veera Maravar',
          `The sickle returns true! (${this.phaseProgress}/2) Prepare for the next throw.`
        );
      }
    }
  }

  spawnFlareParticles(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i + Math.random() * 0.2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 2.5 + Math.random() * 2,
        life: 1.0,
        decay: 1.8 + Math.random() * 1.2
      });
    }
  }

  // =========================================================================
  // CANVAS RENDERING (Tamil Fort Training Courtyard)
  // =========================================================================
  draw(now) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const beatInfo = this.getCurrentBeatInfo(now);

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    this.drawCourtyardGround(ctx, w, h);
    this.drawWallRamparts(ctx, w, h);
    this.drawMandapamColonnade(ctx, w, h);
    this.drawWeaponRacks(ctx, 230, 200);
    this.drawWallDiyaLamp(ctx, this.wallLamp.x, this.wallLamp.y, now);
    this.drawFloorRangoliSigil(ctx, this.rangoliSigil.x, this.rangoliSigil.y, beatInfo);
    this.drawDrummerNPC(ctx, this.drummer.x, this.drummer.y, beatInfo);

    if (this.phase <= 1) {
      this.drawTrainingDummy(ctx, this.dummy.x, this.dummy.y);
    } else if (this.phase === 2) {
      this.drawTargetPost(ctx, this.targetPost.x, this.targetPost.y);
    } else if (this.phase >= 3) {
      this.drawSparringPartner(ctx, this.sparringPartner.x, this.sparringPartner.y, beatInfo);
    }

    this.drawPlayer(ctx, this.player.x, this.player.y);

    if (this.valari.active) {
      this.drawValariSickle(ctx, this.valari.curX, this.valari.curY, this.valari.angle);
    }

    this.drawParticles(ctx);
    this.drawTutorPlaque(ctx, w, h);

    ctx.restore();
  }

  drawCourtyardGround(ctx, w, h) {
    ctx.fillStyle = '#2E1F1B';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(184, 80, 66, 0.2)';
    ctx.lineWidth = 1.5;
    const tileSize = 60;
    for (let x = 0; x < w; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 180; y < h; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(217, 164, 65, 0.08)';
    ctx.beginPath();
    ctx.arc(this.rangoliSigil.x, this.rangoliSigil.y, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawWallRamparts(ctx, w, h) {
    ctx.fillStyle = '#221411';
    ctx.fillRect(0, 0, w, 180);

    ctx.fillStyle = '#1c0f0d';
    for (let bx = 40; bx < w; bx += 90) {
      ctx.fillRect(bx, 10, 50, 40);
    }

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(w, 180);
    ctx.stroke();

    for (let px = w - 240; px < w; px += 70) {
      ctx.fillStyle = '#190e0b';
      ctx.fillRect(px, 40, 22, 140);
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)';
      ctx.strokeRect(px, 40, 22, 140);
    }
  }

  drawWeaponRacks(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#6b4133';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 10);
    ctx.lineTo(x, y - 60);
    ctx.lineTo(x + 35, y - 10);
    ctx.moveTo(x - 35, y - 25);
    ctx.lineTo(x + 35, y - 25);
    ctx.stroke();

    ctx.strokeStyle = '#e6c88b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 45 + i * 4, y - 55 + i * 12);
      ctx.lineTo(x + 45 - i * 4, y - 45 + i * 12);
      ctx.stroke();
    }

    ctx.strokeStyle = '#A7BEAE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x - 12, y - 48, 10, 0.2, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 12, y - 48, 10, 0.2, Math.PI * 0.9);
    ctx.stroke();

    ctx.font = 'bold 9px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.textAlign = 'center';
    ctx.fillText('SILAMBAM & VALARI RACK', x, y + 6);
    ctx.restore();
  }

  drawWallDiyaLamp(ctx, x, y, now) {
    ctx.save();
    ctx.fillStyle = '#170c0a';
    ctx.beginPath();
    ctx.arc(x, y - 10, 24, Math.PI, 0);
    ctx.lineTo(x + 24, y + 25);
    ctx.lineTo(x - 24, y + 25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#b8862d';
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const flicker = Math.sin(now * 0.008) * 2;
    const flameGrad = ctx.createRadialGradient(x, y + 6 + flicker, 2, x, y + 6 + flicker, 18);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#fbe08e');
    flameGrad.addColorStop(0.7, '#D9A441');
    flameGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(x, y + 6 + flicker, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'italic 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('Royal Diya (Full)', x, y + 38);
    ctx.restore();
  }

  // =========================================================================
  // ENVIRONMENTAL RHYTHM PULSE: CENTRAL FLOOR RANGOLI SIGIL
  // =========================================================================
  drawFloorRangoliSigil(ctx, cx, cy, beatInfo) {
    ctx.save();
    const R = this.rangoliSigil.radius;
    const progress = beatInfo.beatProgress;
    const pulseFactor = beatInfo.isOnBeat ? 1.0 : Math.sin(progress * Math.PI) * 0.4;

    const haloRadius = R * (1 + pulseFactor * 0.25);
    const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, haloRadius);
    const goldAlpha = beatInfo.isOnBeat ? 0.45 + this.rangoliSigil.lightFlare * 0.4 : 0.12;
    glowGrad.addColorStop(0, `rgba(217, 164, 65, ${goldAlpha})`);
    glowGrad.addColorStop(0.8, `rgba(184, 80, 66, ${goldAlpha * 0.5})`);
    glowGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = beatInfo.isOnBeat ? 3.5 : 2;
    ctx.strokeStyle = beatInfo.isOnBeat ? '#fdedc7' : '#D9A441';

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const arcX = cx + Math.cos(angle) * (R * 0.45);
      const arcY = cy + Math.sin(angle) * (R * 0.45);

      ctx.beginPath();
      ctx.arc(arcX, arcY, R * 0.5, angle - Math.PI * 0.4, angle + Math.PI * 0.4);
      ctx.stroke();
    }

    ctx.strokeStyle = beatInfo.isOnBeat ? '#D9A441' : 'rgba(217, 164, 65, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const dotX = cx + Math.cos(angle) * R;
      const dotY = cy + Math.sin(angle) * R;
      ctx.fillStyle = beatInfo.isOnBeat ? '#ffffff' : '#D9A441';
      ctx.beginPath();
      ctx.arc(dotX, dotY, beatInfo.isOnBeat ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = beatInfo.isOnBeat ? '#fcf0d2' : '#b85042';
    ctx.beginPath();
    ctx.arc(cx, cy, 10 + pulseFactor * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.stroke();

    if (this.rangoliSigil.missFade > 0) {
      ctx.fillStyle = `rgba(122, 31, 31, ${this.rangoliSigil.missFade * 0.35})`;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = beatInfo.isOnBeat ? '#fcedcb' : 'rgba(217, 164, 65, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('COMBAT RANGOLI • RHYTHM CADENCE', cx, cy + R + 18);
    ctx.restore();
  }

  drawDrummerNPC(ctx, x, y, beatInfo) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 42, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.ellipse(x, y + 32, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a3422';
    ctx.fillRect(x - 22, y + 10, 44, 24);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 22, y + 10, 44, 24);

    ctx.fillStyle = '#eeddcc';
    ctx.beginPath();
    ctx.ellipse(x - 22, y + 22, 4, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 22, 4, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8f4732';
    ctx.fillRect(x - 12, y - 16, 24, 28);

    ctx.fillStyle = '#784a36';
    ctx.beginPath();
    ctx.arc(x, y - 26, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97f26';
    ctx.beginPath();
    ctx.arc(x, y - 31, 13, Math.PI, 0);
    ctx.fill();

    const stickY = beatInfo.isOnBeat ? y + 12 : y - 2 - Math.sin(beatInfo.beatProgress * Math.PI) * 16;
    ctx.strokeStyle = '#eeddcc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 4);
    ctx.lineTo(x - 22, stickY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 4);
    ctx.lineTo(x + 22, stickY);
    ctx.stroke();

    if (this.drummer.strikeImpact > 0) {
      ctx.strokeStyle = `rgba(217, 164, 65, ${this.drummer.strikeImpact * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + 22, 28 + (1 - this.drummer.strikeImpact) * 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.textAlign = 'center';
    ctx.fillText('FORT DRUMMER', x, y + 58);
    ctx.restore();
  }

  drawPlayer(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7A1F1F';
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 22);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x - 8, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#D9A441';
    ctx.fillRect(x - 8, y - 1, 16, 4);

    ctx.fillStyle = '#8f3b3b';
    ctx.fillRect(x - 7, y - 18, 14, 18);

    ctx.fillStyle = '#8a5944';
    ctx.beginPath();
    ctx.arc(x, y - 25, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a0e0b';
    ctx.beginPath();
    ctx.arc(x, y - 27, 9, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 18, 4, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - 27, 9, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    ctx.strokeStyle = '#eedcb3';
    ctx.lineWidth = 3;
    if (this.player.stance === 'strike_silambam') {
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 10);
      ctx.lineTo(x + 36, y - 28);
      ctx.stroke();
    } else if (this.player.stance === 'block_silambam') {
      ctx.beginPath();
      ctx.moveTo(x + 14, y - 36);
      ctx.lineTo(x + 14, y + 24);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 18);
      ctx.lineTo(x + 22, y - 30);
      ctx.stroke();
    }

    if (this.player.valariInHand) {
      ctx.strokeStyle = '#A7BEAE';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x - 8, y + 4, 7, Math.PI * 0.3, Math.PI * 1.2);
      ctx.stroke();
    }

    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('Young Velu Nachiyar', x, y + 38);
    ctx.restore();
  }

  drawTrainingDummy(ctx, x, y) {
    ctx.save();
    const wobbleX = Math.sin(this.dummy.wobble) * 6;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a2d1d';
    ctx.fillRect(x - 8, y, 16, 24);

    ctx.fillStyle = this.dummy.hitFlash > 0 ? '#fcedcb' : '#8c6b3e';
    ctx.beginPath();
    ctx.ellipse(x + wobbleX, y - 20, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#5c3924';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 30 + wobbleX, y - 26);
    ctx.lineTo(x + 30 + wobbleX, y - 26);
    ctx.stroke();

    ctx.strokeStyle = '#7A1F1F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + wobbleX, y - 20, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.textAlign = 'center';
    ctx.fillText('STRAW DUMMY', x, y + 38);
    ctx.restore();
  }

  drawTargetPost(ctx, x, y) {
    ctx.save();
    const wobbleX = Math.sin(this.targetPost.wobble) * 5;

    ctx.fillStyle = '#44281a';
    ctx.fillRect(x - 6, y - 40, 12, 65);

    ctx.fillStyle = '#6b4133';
    ctx.beginPath();
    ctx.arc(x + wobbleX, y - 30, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + wobbleX, y - 30, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#7A1F1F';
    ctx.beginPath();
    ctx.arc(x + wobbleX, y - 30, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.textAlign = 'center';
    ctx.fillText('VALARI TARGET POST', x, y + 38);
    ctx.restore();
  }

  drawSparringPartner(ctx, x, y, beatInfo) {
    ctx.save();
    const wobbleX = Math.sin(this.sparringPartner.wobble) * 8;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9c4d34';
    ctx.beginPath();
    ctx.moveTo(x - 12 + wobbleX, y + 22);
    ctx.lineTo(x + 12 + wobbleX, y + 22);
    ctx.lineTo(x + 8 + wobbleX, y);
    ctx.lineTo(x - 8 + wobbleX, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4f6c5b';
    ctx.fillRect(x - 8 + wobbleX, y - 18, 16, 18);

    ctx.fillStyle = '#82523d';
    ctx.beginPath();
    ctx.arc(x + wobbleX, y - 26, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#dfc397';
    ctx.lineWidth = 3;

    if (this.sparringPartner.state === 'telegraph_windup') {
      ctx.beginPath();
      ctx.moveTo(x - 8 + wobbleX, y - 16);
      ctx.lineTo(x + 28 + wobbleX, y - 48);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(184, 80, 66, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x + wobbleX, y - 26, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 9.5px "Calibri", sans-serif';
      ctx.fillStyle = '#f5c682';
      ctx.textAlign = 'center';
      ctx.fillText('[TELEGRAPHING STRIKE]', x + wobbleX, y - 56);
    } else if (this.sparringPartner.state === 'striking') {
      ctx.beginPath();
      ctx.moveTo(x - 22 + wobbleX, y - 12);
      ctx.lineTo(x - 38 + wobbleX, y + 18);
      ctx.stroke();
    } else if (this.sparringPartner.state === 'recoiling') {
      ctx.beginPath();
      ctx.moveTo(x + 8 + wobbleX, y - 24);
      ctx.lineTo(x + 28 + wobbleX, y + 12);
      ctx.stroke();

      ctx.font = 'bold 10px "Calibri", sans-serif';
      ctx.fillStyle = '#A7BEAE';
      ctx.textAlign = 'center';
      ctx.fillText('[COUNTER WINDOW!]', x + wobbleX, y - 46);
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 14 + wobbleX, y - 30);
      ctx.lineTo(x + 14 + wobbleX, y + 16);
      ctx.stroke();
    }

    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.textAlign = 'center';
    ctx.fillText('Sparring Partner Kandan', x, y + 38);
    ctx.restore();
  }

  drawValariSickle(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 12, Math.PI * 0.1, Math.PI * 1.1);
    ctx.stroke();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 7, Math.PI * 0.4, Math.PI * 0.9);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 16, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawMandapamColonnade(ctx, w, h) {
    ctx.save();
    const pathX = w - 70;
    const pathY = 320;
    const pathW = 56;
    const pathH = 88;
    const isUnlocked = (this.phase >= 3 || this.phase === 4);

    // Recessed dark passage
    const darkGrad = ctx.createRadialGradient(pathX, pathY, 6, pathX, pathY, 36);
    darkGrad.addColorStop(0, '#0c0605');
    darkGrad.addColorStop(0.7, '#1a0d0a');
    darkGrad.addColorStop(1, '#2e1f1b');
    ctx.fillStyle = darkGrad;
    ctx.beginPath();
    ctx.arc(pathX, pathY - pathH / 4, pathW / 2, Math.PI, 0);
    ctx.lineTo(pathX + pathW / 2, pathY + pathH / 2);
    ctx.lineTo(pathX - pathW / 2, pathY + pathH / 2);
    ctx.closePath();
    ctx.fill();

    // Warm golden torch glow from within the mandapam
    const pulse = Math.sin(Date.now() * 0.005) * 5;
    const torchGlow = ctx.createRadialGradient(pathX, pathY, 2, pathX, pathY, (isUnlocked ? 36 : 24) + pulse);
    torchGlow.addColorStop(0, isUnlocked ? 'rgba(217, 164, 65, 0.65)' : 'rgba(217, 164, 65, 0.35)');
    torchGlow.addColorStop(0.5, 'rgba(184, 80, 66, 0.25)');
    torchGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = torchGlow;
    ctx.beginPath();
    ctx.arc(pathX, pathY, (isUnlocked ? 36 : 24) + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Carved stone pillars framing the doorway
    ctx.fillStyle = '#4a2c22';
    ctx.fillRect(pathX - pathW / 2 - 8, pathY - pathH / 2 + 10, 10, pathH);
    ctx.fillRect(pathX + pathW / 2 - 2, pathY - pathH / 2 + 10, 10, pathH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(pathX - pathW / 2 - 8, pathY - pathH / 2 + 10, 10, pathH);
    ctx.strokeRect(pathX + pathW / 2 - 2, pathY - pathH / 2 + 10, 10, pathH);

    // Carved Torana arch top
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pathX, pathY - pathH / 4, pathW / 2, Math.PI, 0);
    ctx.stroke();

    // Floating golden embers
    const emberY = pathY + Math.sin(Date.now() * 0.004 + pathX) * 8;
    ctx.fillStyle = '#fcedcb';
    ctx.beginPath();
    ctx.arc(pathX - 4, emberY, 1.8, 0, Math.PI * 2);
    ctx.arc(pathX + 6, emberY - 5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Pathway Header
    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('SECRET MANDAPAM', pathX, pathY - pathH / 2 - 4);
    ctx.font = '8px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText(isUnlocked ? 'Hidden Pathway → Level 3' : 'Guarded Passage', pathX, pathY - pathH / 2 + 6);

    ctx.restore();
  }

  drawTutorPlaque(ctx, w, h) {
    if (this.tutorPlaqueTimer <= 0) return;
    ctx.save();
    const alpha = Math.min(1.0, this.tutorPlaqueTimer);
    ctx.globalAlpha = alpha;

    const boxW = Math.min(620, w * 0.88);
    const boxH = 40;
    const boxX = (w - boxW) / 2;
    const boxY = 16; // Non-obstructive toast at top of screen

    ctx.fillStyle = 'rgba(26, 15, 12, 0.9)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#D9A441';
    ctx.fillRect(boxX, boxY, 4, 4);
    ctx.fillRect(boxX + boxW - 4, boxY, 4, 4);
    ctx.fillRect(boxX, boxY + boxH - 4, 4, 4);
    ctx.fillRect(boxX + boxW - 4, boxY + boxH - 4, 4, 4);

    ctx.font = 'bold 10.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.tutorSpeaker.toUpperCase()}:`, boxX + 14, boxY + 16);

    ctx.font = '11.5px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText(this.tutorMessage, boxX + 14, boxY + 30);
    ctx.restore();
  }

  // =========================================================================
  // LEVEL RESOLUTION & IN-WORLD PATHWAY TRANSITION
  // =========================================================================
  resolveLevel() {
    this.phase = 4;
    this.showTutorPlaque(
      'Master Veera Maravar',
      'TRIUMPH! The secret Mandapam colonnade on the eastern rampart is now illuminated—step through into Level 3!'
    );

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playMurasuDrumBeat(true);
    }

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(2, {
        parryRating: 'Flawless',
        martialCadence: 'Mastered',
        unlockedWeapons: ['Valari Sickle', 'Silambam Rattan']
      });
      window.sivagangaSave.unlockLevel(3);
      window.sivagangaSave.recordChronicleNode(2);
    }

    // Auto-step through the hidden pathway or player can click it
    setTimeout(() => {
      if (this.isActive && !this.isTransitioning) {
        this.transitionToLevel3();
      }
    }, 2800);
  }

  transitionToLevel3() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(2, {
        parryRating: 'Flawless',
        martialCadence: 'Mastered',
        unlockedWeapons: ['Valari Sickle', 'Silambam Rattan']
      });
      window.sivagangaSave.unlockLevel(3);
      window.sivagangaSave.recordChronicleNode(2);
    }

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(
        () => {
          this.stop();
          if (window.sivagangaRouter) {
            window.sivagangaRouter.navigate('/level/03-horse-and-bow', { skipWipe: true });
          } else if (window.sivagangaGameplay) {
            window.sivagangaGameplay.start(3);
          }
        },
        () => {
          if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
          this.isTransitioning = false;
        }
      );
    }
  }
}

// Global Level 2 instance
window.sivagangaValariSilambam = new SivagangaLevel2ValariSilambam();
