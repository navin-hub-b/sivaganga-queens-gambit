/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 5: "THE BETROTHAL"
 * Chapter 1 Finale: Ramanathapuram Fort Ceremonial Courtyard (c. 1746).
 *
 * Teenage Velu Nachiyar (aged 16) enters the festival-decorated royal courtyard
 * for her ceremonial betrothal tournament to King Muthuvaduganatha Periyavudaya Thevar
 * of Sivaganga.
 *
 * 3-TRIAL TOURNAMENT STRUCTURE:
 * 1. Trial 1 (Archery): Precision lead-aim target shoot through 3 swinging floral garlands (Mullai & Sevvanthi).
 * 2. Trial 2 (Combat Rhythm): Silambam staff sparring on Murasu drum cadence (High, Low, Center parries).
 * 3. Trial 3 (Diplomacy & Betrothal): Foreground Betel-Leaf Tray (Vetrillai Thamboolam) with 3 royal vows
 *    presented to King Muthuvaduganatha, lifting on hover/focus (keys 1-3, mouse, touch).
 *
 * TOURNAMENT SCORE:
 * - 3 brass oil flame icons (Thiri) carved into the courtyard balustrade, lighting radiant gold (#D9A441)
 *   as each trial is completed.
 * - Center stage features a magnificent Kuthu Vilakku (ceremonial tiered brass lamp) that flares
 *   in radiant festival gold upon full tournament triumph.
 *
 * ATOMIC MID-TOURNAMENT PERSISTENCE:
 * - Every trial completion immediately saves to window.sivagangaSave.state.levelStats[5].
 * - Reloading mid-tournament restores the exact trial in progress with lit flames.
 *
 * CHAPTER 1 GRADUATION:
 * - Trial 3 resolution seals the royal alliance, calls recordLevelVictory(5), unlocks Level 6,
 *   and transitions to /chronicle where Chapter Fort-Gate 1 ("Gate of the Western Ghats") opens.
 *
 * PALETTE: BG-MAROON #2E1F1B, BG-TERRACOTTA #B85042, ACCENT-GOLD #D9A441, ACCENT-SAGE #A7BEAE, DANGER-DEEP #7A1F1F.
 * TYPOGRAPHY: Lore in Cambria, UI numerals in Calibri.
 */

class SivagangaLevel5TheBetrothal {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.isTransitioning = false;
    this.animationId = null;
    this.lastTime = 0;

    // Viewport dimensions
    this.width = 800;
    this.height = 500;

    // Tournament Progression: 3 Trials
    this.currentTrial = 1; // 1: Archery, 2: Silambam, 3: Betel-Leaf Diplomacy
    this.completedTrials = 0; // 0..3
    this.isLevelCompleted = false;
    this.trialIntroTimer = 3.5;
    this.feedbackText = '';
    this.feedbackTimer = 0;
    this.feedbackColor = '#D9A441';

    // Center-stage Ceremonial Lamp (Kuthu Vilakku)
    this.kuthuVilakku = {
      x: 400,
      y: 280,
      flameFlicker: 0,
      radiance: 1.0,
      festiveFlare: 0
    };

    // Diegetic 3 Brass Flames HUD (Top-right balustrade)
    this.flameBalustrade = {
      x: 550,
      y: 18,
      w: 236,
      h: 52
    };

    // Particles array (flower petals, sparks, drum ripples)
    this.particles = [];

    // =========================================================================
    // TRIAL 1: GARLAND ARCHERY STATE
    // =========================================================================
    this.archery = {
      hitsNeeded: 3,
      hitsScored: 0,
      currentGarlandIndex: 0,
      isAiming: false,
      drawCharge: 0,
      arrowsLeft: 8,
      bowAngle: -0.15,
      reticle: {
        x: 400,
        y: 200,
        targetX: 400,
        targetY: 200,
        radius: 24,
        tightness: 0, // 0.0 (drift) -> 1.0 (golden focus)
        state: 'idle'
      },
      arrow: {
        active: false,
        x: 180,
        y: 320,
        vx: 0,
        vy: 0,
        angle: 0,
        targetX: 0,
        targetY: 0
      },
      garlands: [
        { id: 1, name: 'Outer Rampart Torana Garland', baseX: 440, baseY: 175, radius: 26, swingAngle: 0, swingSpeed: 1.6, swingAmp: 34, hit: false, floralType: 'jasmine' },
        { id: 2, name: 'Grand Pavillion Torana Garland', baseX: 560, baseY: 160, radius: 24, swingAngle: 1.2, swingSpeed: 2.2, swingAmp: 42, hit: false, floralType: 'marigold' },
        { id: 3, name: 'Sacred Balcony Crown Garland', baseX: 680, baseY: 145, radius: 22, swingAngle: 2.4, swingSpeed: 2.8, swingAmp: 50, hit: false, floralType: 'lotus_gold' }
      ]
    };

    // =========================================================================
    // TRIAL 2: COMBAT RHYTHM (SILAMBAM SPARRING) STATE
    // =========================================================================
    this.combat = {
      bpm: 74,
      beatIntervalMs: 60000 / 74, // ~810.8ms
      hitWindowToleranceMs: 230, // forgiving ±230ms rhythm parry window
      startTime: 0,
      lastDrumBeatIndex: -1,
      currentExchange: 0, // 0..2 (3 exchanges)
      parriesNeeded: 3,
      parriesScored: 0,
      parrySuccessTimer: 0,
      championStance: 'idle', // 'idle', 'telegraph', 'strike', 'recoil', 'bow'
      championActionTimer: 0,
      currentStrikeType: 'high', // 'high', 'low', 'center'
      strikeSequence: [
        { type: 'high', label: 'High Crescent Staff Strike', keyHint: 'W / ↑ / High Guard', targetStance: 'high' },
        { type: 'low', label: 'Low Sweeping Staff Stave', keyHint: 'S / ↓ / Low Guard', targetStance: 'low' },
        { type: 'center', label: 'Center Spear Thrust', keyHint: 'Space / Enter / Center Parry', targetStance: 'center' }
      ],
      veluStance: 'idle', // 'idle', 'high_parry', 'low_parry', 'center_parry'
      veluStanceTimer: 0,
      lastInputTimestamp: 0
    };

    // =========================================================================
    // TRIAL 3: DIPLOMACY & THE BETEL-LEAF TRAY (VETRILLAI THAMBOOLAM)
    // =========================================================================
    this.diplomacy = {
      selectedLeafIndex: 0,
      hoveredLeafIndex: -1,
      isVowAccepted: false,
      chosenVow: null,
      dialoguePhase: 'intro', // 'intro', 'inspect', 'accepted', 'finale'
      dialogueTimer: 0,
      exchangeGarlandsAnimation: 0,
      trayX: 200,
      trayY: 345,
      trayW: 400,
      trayH: 125,
      leaves: [
        {
          id: 1,
          key: '1',
          title: 'Vow of Twin Sovereignty',
          subtitle: 'The Shield of Independent Kingdoms',
          text: '"We join not as vassal and lord, but as twin shields of Tamil independence. Ramnad and Sivaganga shall stand together against all foreign subjugation."',
          royalResponse: '"Spoken with the fiery soul of a born monarch! No British collector nor Arcot Nawab shall breach what our sovereign alliance defends."',
          accentColor: '#D9A441',
          lift: 0
        },
        {
          id: 2,
          key: '2',
          title: 'Vow of the People\'s Vanguard',
          subtitle: 'Every Hamlet Armed & Trained',
          text: '"Our realm will not rely solely on royal garrisons. We will train the women and men of every village in archery, valari, and horse-riding to build an unconquerable citizen defense."',
          royalResponse: '"A visionary doctrine! A realm defended by its own people\'s spirit cannot be conquered by cannon or crown."',
          accentColor: '#A7BEAE',
          lift: 0
        },
        {
          id: 3,
          key: '3',
          title: 'Vow of the Sacred Soil',
          subtitle: 'Granaries, Sluices & Fair Reign',
          text: '"A kingdom\'s strength resides in its water-tanks and grain-stores. We will guard the farmers, weavers, and scholars so that prosperity sustains our defense."',
          royalResponse: '"Wisdom far beyond your years. An empire that cares for its humblest hands is truly eternal. I accept your hand with reverence and pride."',
          accentColor: '#B85042',
          lift: 0
        }
      ]
    };

    // Royal Spectators on Dais
    this.spectators = {
      muthuvaduganatha: { x: 570, y: 260, cheer: 0, dialogue: '' },
      kingChellamuthu: { x: 650, y: 245, nod: 0 },
      queenSakandhimuthal: { x: 710, y: 245, smile: 0 },
      masterOfArms: { x: 490, y: 310, bow: 0 },
      drummer: { x: 110, y: 300, strikePhase: 0 }
    };

    // Input bindings
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  // =========================================================================
  // INITIALIZATION & LIFECYCLE
  // =========================================================================
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    this.isTransitioning = false;
    this.isLevelCompleted = false;
    this.lastTime = performance.now();

    this.handleResize();
    this.loadProgress();

    // Attach event listeners
    window.addEventListener('keydown', this.boundKeyDown);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    window.addEventListener('touchend', this.boundTouchEnd);

    // Initial audio resonance
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.playTempleBell();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    const stage = document.querySelector('.level-canvas-stage');
    if (stage) {
      this.canvas.width = stage.clientWidth || 800;
      this.canvas.height = stage.clientHeight || 500;
    }
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  /**
   * Technical Contract: Atomic state-side restoration.
   * Restores exact trial and completed brass flames without dropping or duplicating results.
   */
  loadProgress() {
    try {
      const stats = window.sivagangaSave?.state?.levelStats?.[5];
      if (stats && typeof stats.completedTrials === 'number') {
        this.completedTrials = Math.max(0, Math.min(3, stats.completedTrials));
        if (this.completedTrials === 1) {
          this.currentTrial = 2;
          this.showFeedback('Tournament Resumed: Trial 2 — Silambam Martial Poise', '#D9A441', 3.5);
        } else if (this.completedTrials === 2) {
          this.currentTrial = 3;
          this.showFeedback('Tournament Resumed: Trial 3 — The Betel-Leaf Accord', '#D9A441', 3.5);
        } else if (this.completedTrials >= 3) {
          this.currentTrial = 3;
          this.isLevelCompleted = true;
        } else {
          this.currentTrial = 1;
        }
      } else {
        this.completedTrials = 0;
        this.currentTrial = 1;
      }
    } catch (e) {
      console.warn('Level 5: Failed to restore state, starting Trial 1', e);
      this.completedTrials = 0;
      this.currentTrial = 1;
    }

    this.combat.startTime = performance.now();
  }

  /**
   * Save individual trial victory atomically to save manager.
   */
  saveTrialProgress(trialNumber) {
    if (!window.sivagangaSave) return;
    const currentStats = window.sivagangaSave.state.levelStats[5] || {};
    currentStats.completedTrials = Math.max(currentStats.completedTrials || 0, trialNumber);

    if (trialNumber === 1) {
      currentStats.trial1_archery = { passed: true, hits: 3, score: 300 };
    } else if (trialNumber === 2) {
      currentStats.trial2_sparring = { passed: true, parries: 3, cadence: 'Flawless' };
    } else if (trialNumber === 3) {
      currentStats.trial3_diplomacy = {
        passed: true,
        vow: this.diplomacy.chosenVow?.title || 'Vow of Twin Sovereignty',
        accord: 'Formalized Alliance of Sivaganga and Ramnad'
      };
    }

    window.sivagangaSave.state.levelStats[5] = currentStats;
    window.sivagangaSave.save();
  }

  start() {
    this.isActive = true;
    this.lastTime = performance.now();
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const loop = (timestamp) => {
      if (!this.isActive) return;
      const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;

      this.update(dt, timestamp);
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
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove);
      this.canvas.removeEventListener('mousedown', this.boundMouseDown);
      this.canvas.removeEventListener('touchstart', this.boundTouchStart);
      this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    }
    window.removeEventListener('mouseup', this.boundMouseUp);
    window.removeEventListener('touchend', this.boundTouchEnd);
  }

  showFeedback(text, color = '#D9A441', duration = 2.5) {
    this.feedbackText = text;
    this.feedbackColor = color;
    this.feedbackTimer = duration;
  }

  // =========================================================================
  // UPDATE LOGIC
  // =========================================================================
  update(dt, timestamp) {
    // Feedback timer
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
      if (this.feedbackTimer <= 0) this.feedbackText = '';
    }

    // Grand Kuthu Vilakku lamp flicker
    this.kuthuVilakku.flameFlicker = Math.sin(timestamp * 0.008) * 2 + Math.cos(timestamp * 0.015) * 1.5;

    // Update active particles
    this.updateParticles(dt);

    // Update active trial
    if (this.currentTrial === 1) {
      this.updateTrial1Archery(dt, timestamp);
    } else if (this.currentTrial === 2) {
      this.updateTrial2Combat(dt, timestamp);
    } else if (this.currentTrial === 3) {
      this.updateTrial3Diplomacy(dt, timestamp);
    }
  }

  // -------------------------------------------------------------------------
  // TRIAL 1 UPDATE: GARLAND ARCHERY
  // -------------------------------------------------------------------------
  updateTrial1Archery(dt, timestamp) {
    const arch = this.archery;

    // Smooth reticle target interpolation
    const lerpFactor = Math.min(1.0, dt * 14);
    arch.reticle.x += (arch.reticle.targetX - arch.reticle.x) * lerpFactor;
    arch.reticle.y += (arch.reticle.targetY - arch.reticle.y) * lerpFactor;

    // Update swinging target garland rings
    arch.garlands.forEach((g, idx) => {
      if (!g.hit) {
        g.swingAngle += g.swingSpeed * dt;
        g.curX = g.baseX + Math.sin(g.swingAngle) * g.swingAmp;
        g.curY = g.baseY + Math.cos(g.swingAngle * 0.6) * (g.swingAmp * 0.2);
      }
    });

    const activeGarland = arch.garlands[arch.currentGarlandIndex];
    if (activeGarland && !activeGarland.hit) {
      // Calculate distance between reticle and garland center
      const dx = arch.reticle.x - activeGarland.curX;
      const dy = arch.reticle.y - activeGarland.curY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < activeGarland.radius + 8) {
        // Tighten into focused gold
        arch.reticle.tightness = Math.min(1.0, arch.reticle.tightness + dt * 4.0);
        arch.reticle.state = 'focused';
      } else {
        // Loosen to drift
        arch.reticle.tightness = Math.max(0.0, arch.reticle.tightness - dt * 3.0);
        arch.reticle.state = 'drift';
      }
    }

    // Update flying arrow
    if (arch.arrow.active) {
      arch.arrow.x += arch.arrow.vx * dt;
      arch.arrow.y += arch.arrow.vy * dt;

      // Check hit with active garland
      if (activeGarland && !activeGarland.hit) {
        const adx = arch.arrow.x - activeGarland.curX;
        const ady = arch.arrow.y - activeGarland.curY;
        const arrowDist = Math.sqrt(adx * adx + ady * ady);

        if (arrowDist < activeGarland.radius + 12) {
          // HIT!
          activeGarland.hit = true;
          arch.arrow.active = false;
          arch.hitsScored++;

          if (window.sivagangaAudio) {
            window.sivagangaAudio.playGarlandSnap(true);
            window.sivagangaAudio.playFocusPing();
          }

          // Spawn flower petals
          this.spawnFloralBurst(activeGarland.curX, activeGarland.curY, activeGarland.floralType);
          this.showFeedback(`Trial 1: Ring ${arch.hitsScored} of 3 Cleared!`, '#D9A441', 2.0);

          if (arch.hitsScored >= arch.hitsNeeded) {
            // Trial 1 Completed!
            this.completeTrial1();
          } else {
            arch.currentGarlandIndex++;
          }
        }
      }

      // Arrow out of screen
      if (arch.arrow.x > this.width + 50 || arch.arrow.y < -50 || arch.arrow.y > this.height + 50) {
        arch.arrow.active = false;
      }
    }
  }

  fireArrow() {
    const arch = this.archery;
    if (arch.arrow.active) return; // one arrow at a time

    arch.arrow.active = true;
    arch.arrow.x = 210;
    arch.arrow.y = 315;

    const angle = Math.atan2(arch.reticle.y - arch.arrow.y, arch.reticle.x - arch.arrow.x);
    const speed = 720; // fast & crisp flight
    arch.arrow.vx = Math.cos(angle) * speed;
    arch.arrow.vy = Math.sin(angle) * speed;
    arch.arrow.angle = angle;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playArrowRelease();
    }
  }

  completeTrial1() {
    this.completedTrials = Math.max(this.completedTrials, 1);
    this.saveTrialProgress(1);

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playCeremonialFanfare();
    }

    this.showFeedback('TRIAL 1 CLEARED: The Archery of the Royal Garland!', '#D9A441', 3.0);

    // Transition to Trial 2 after celebration
    setTimeout(() => {
      if (this.isActive && this.currentTrial === 1) {
        this.currentTrial = 2;
        this.combat.startTime = performance.now();
        this.showFeedback('Trial 2 Begins: Silambam Martial Poise on Murasu Drum Cadence!', '#D9A441', 3.0);
      }
    }, 2200);
  }

  // -------------------------------------------------------------------------
  // TRIAL 2 UPDATE: COMBAT RHYTHM (SILAMBAM SPARRING)
  // -------------------------------------------------------------------------
  updateTrial2Combat(dt, timestamp) {
    const cmb = this.combat;

    // Calculate fixed game-clock beat
    const elapsed = timestamp - cmb.startTime;
    const currentBeatIndex = Math.floor(elapsed / cmb.beatIntervalMs);
    const beatFraction = (elapsed % cmb.beatIntervalMs) / cmb.beatIntervalMs;

    // Trigger Drum Pulse & Sound
    if (currentBeatIndex > cmb.lastDrumBeatIndex) {
      cmb.lastDrumBeatIndex = currentBeatIndex;
      this.spectators.drummer.strikePhase = 1.0;

      // Murasu drum audio
      if (window.sivagangaAudio) {
        const isAccent = (currentBeatIndex % 4 === 0);
        window.sivagangaAudio.playMurasuDrumBeat(isAccent);
      }

      // Spawn drum wave ripple
      this.spawnDrumWave(140, 310);
    }

    // Drummer arm animation return
    this.spectators.drummer.strikePhase = Math.max(0, this.spectators.drummer.strikePhase - dt * 4.0);

    // Velu stance recovery timer
    if (cmb.veluStanceTimer > 0) {
      cmb.veluStanceTimer -= dt;
      if (cmb.veluStanceTimer <= 0) cmb.veluStance = 'idle';
    }

    // Champion sparring partner AI progression
    const currentStrike = cmb.strikeSequence[cmb.currentExchange];
    if (currentStrike) {
      // 4-beat pattern per exchange:
      // Beat 0: Idle / Ready stance
      // Beat 1: Telegraph windup (concentric gold glow)
      // Beat 2: Strike execution (on-beat impact window)
      // Beat 3: Recoil / reset
      const cycleBeat = currentBeatIndex % 4;

      if (cycleBeat === 1) {
        cmb.championStance = 'telegraph';
      } else if (cycleBeat === 2) {
        cmb.championStance = 'strike';
      } else {
        cmb.championStance = 'idle';
      }
    }
  }

  attemptParry(stanceType) {
    const cmb = this.combat;
    const now = performance.now();
    if (now - cmb.lastInputTimestamp < 100) return; // 100ms hardware debounce
    cmb.lastInputTimestamp = now;

    cmb.veluStance = `${stanceType}_parry`;
    cmb.veluStanceTimer = 0.45;

    // Calculate timing relative to nearest drum beat
    const elapsed = now - cmb.startTime;
    const timeSinceBeat = elapsed % cmb.beatIntervalMs;
    const timeToNextBeat = cmb.beatIntervalMs - timeSinceBeat;
    const timingDiffMs = Math.min(timeSinceBeat, timeToNextBeat);

    const isTimingOnBeat = timingDiffMs <= cmb.hitWindowToleranceMs;
    const currentStrike = cmb.strikeSequence[cmb.currentExchange];

    if (currentStrike && currentStrike.targetStance === stanceType && isTimingOnBeat) {
      // SUCCESSFUL PARRY!
      cmb.parriesScored++;
      cmb.championStance = 'recoil';

      if (window.sivagangaAudio) {
        window.sivagangaAudio.playSilambamClang();
        window.sivagangaAudio.playFocusPing();
      }

      this.spawnCombatSparks(380, 310);
      this.showFeedback(`Flawless Parry: ${currentStrike.label}! (${cmb.parriesScored}/3)`, '#D9A441', 2.0);

      if (cmb.parriesScored >= cmb.parriesNeeded) {
        this.completeTrial2();
      } else {
        cmb.currentExchange++;
      }
    } else {
      // Off-beat or mismatched stance: gentle quiet feedback (no harsh buzzer)
      if (window.sivagangaAudio) {
        window.sivagangaAudio.playQuietFade();
      }
      this.showFeedback(`Watch the Murasu cadence: ${currentStrike?.keyHint || 'Parry On-Beat!'}`, '#f4e5d2', 1.5);
    }
  }

  completeTrial2() {
    this.completedTrials = Math.max(this.completedTrials, 2);
    this.saveTrialProgress(2);

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playCeremonialFanfare();
    }

    this.showFeedback('TRIAL 2 CLEARED: Silambam Martial Poise Proven!', '#D9A441', 3.0);

    // Advance to Trial 3 (The Betel-Leaf Tray)
    setTimeout(() => {
      if (this.isActive && this.currentTrial === 2) {
        this.currentTrial = 3;
        this.showFeedback('Trial 3 Begins: The Betel-Leaf Accord with King Muthuvaduganatha!', '#D9A441', 3.5);
      }
    }, 2200);
  }

  // -------------------------------------------------------------------------
  // TRIAL 3 UPDATE: DIPLOMACY & THE BETEL-LEAF TRAY
  // -------------------------------------------------------------------------
  updateTrial3Diplomacy(dt, timestamp) {
    const dip = this.diplomacy;

    // Smooth elevation lift for hovered/selected leaf
    dip.leaves.forEach((leaf, idx) => {
      const isTargeted = (idx === dip.hoveredLeafIndex || idx === dip.selectedLeafIndex);
      const targetLift = isTargeted ? 18 : 0;
      leaf.lift += (targetLift - leaf.lift) * Math.min(1.0, dt * 10);
    });

    if (dip.isVowAccepted) {
      this.kuthuVilakku.festiveFlare = Math.min(2.5, this.kuthuVilakku.festiveFlare + dt * 1.5);
    }
  }

  selectLeaf(leafIndex) {
    const dip = this.diplomacy;
    if (leafIndex < 0 || leafIndex >= dip.leaves.length) return;

    dip.selectedLeafIndex = leafIndex;
    if (window.sivagangaAudio) {
      window.sivagangaAudio.playFocusPing();
      window.sivagangaAudio.playPalmLeafScroll();
    }
  }

  confirmLeafChoice() {
    const dip = this.diplomacy;
    if (dip.isVowAccepted) return;

    const chosen = dip.leaves[dip.selectedLeafIndex];
    if (!chosen) return;

    dip.chosenVow = chosen;
    dip.isVowAccepted = true;
    dip.dialoguePhase = 'accepted';

    this.completedTrials = 3;
    this.saveTrialProgress(3);

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playCeremonialFanfare();
    }

    // Shower of rose and jasmine petals across courtyard
    this.spawnCeremonialShower();

    // After royal affirmation, trigger Chapter 1 Finale Resolution
    setTimeout(() => {
      if (this.isActive) {
        this.resolveChapterFinale();
      }
    }, 3800);
  }

  resolveChapterFinale() {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(5, {
        tournamentCompleted: true,
        trialsMastered: 3,
        chosenVow: this.diplomacy.chosenVow?.title || 'Vow of Twin Sovereignty',
        accordSealed: 'Royal Betrothal of Rani Velu Nachiyar & King Muthuvaduganatha Periyavudaya Thevar',
        chapterGraduation: 'Chapter 1 Concluded — Gate of the Western Ghats Unlocked'
      });
      window.sivagangaSave.unlockLevel(6);
      window.sivagangaSave.recordChronicleNode(5);
    }

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playTempleBell();
    }
  }

  transitionToChronicle() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(
        () => {
          this.stop();
          if (window.sivagangaRouter) {
            window.sivagangaRouter.routeTo('/chronicle', { skipWipe: true });
          } else if (window.sivagangaFlow) {
            window.sivagangaFlow.transition('CHRONICLE');
          }
        },
        () => {
          if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
          this.isTransitioning = false;
        }
      );
    }
  }

  // =========================================================================
  // INPUT HANDLING
  // =========================================================================
  handleKeyDown(e) {
    if (!this.isActive) return;

    // Finale keypress: continue to Chronicle
    if (this.isLevelCompleted) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        this.transitionToChronicle();
        return;
      }
    }

    // Trial 1: Archery keys
    if (this.currentTrial === 1) {
      const step = 20;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.archery.reticle.targetX = Math.max(150, this.archery.reticle.targetX - step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.archery.reticle.targetX = Math.min(this.width - 50, this.archery.reticle.targetX + step);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.archery.reticle.targetY = Math.max(80, this.archery.reticle.targetY - step);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.archery.reticle.targetY = Math.min(360, this.archery.reticle.targetY + step);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.fireArrow();
      }
    }
    // Trial 2: Silambam combat rhythm keys
    else if (this.currentTrial === 2) {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.attemptParry('high');
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.attemptParry('low');
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.attemptParry('center');
      }
    }
    // Trial 3: Diplomacy betel-leaf keys
    else if (this.currentTrial === 3) {
      if (e.key === '1') {
        this.selectLeaf(0);
      } else if (e.key === '2') {
        this.selectLeaf(1);
      } else if (e.key === '3') {
        this.selectLeaf(2);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.selectLeaf((this.diplomacy.selectedLeafIndex + 2) % 3);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.selectLeaf((this.diplomacy.selectedLeafIndex + 1) % 3);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.confirmLeafChoice();
      }
    }
  }

  handleMouseMove(e) {
    if (!this.isActive) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.width / rect.width);
    const my = (e.clientY - rect.top) * (this.height / rect.height);

    if (this.currentTrial === 1) {
      this.archery.reticle.targetX = mx;
      this.archery.reticle.targetY = my;
    } else if (this.currentTrial === 3) {
      this.checkLeafHover(mx, my);
    }
  }

  handleMouseDown(e) {
    if (!this.isActive) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.width / rect.width);
    const my = (e.clientY - rect.top) * (this.height / rect.height);

    if (this.isLevelCompleted) {
      this.transitionToChronicle();
      return;
    }

    if (this.currentTrial === 1) {
      this.archery.reticle.targetX = mx;
      this.archery.reticle.targetY = my;
      this.fireArrow();
    } else if (this.currentTrial === 2) {
      // Touch/click quadrants for silambam
      if (my < 220) this.attemptParry('high');
      else if (my > 340) this.attemptParry('low');
      else this.attemptParry('center');
    } else if (this.currentTrial === 3) {
      const clickedLeaf = this.getLeafAtCoords(mx, my);
      if (clickedLeaf !== -1) {
        if (this.diplomacy.selectedLeafIndex === clickedLeaf) {
          this.confirmLeafChoice();
        } else {
          this.selectLeaf(clickedLeaf);
        }
      }
    }
  }

  handleMouseUp(e) {}

  handleTouchStart(e) {
    if (!this.isActive || !e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (this.width / rect.width);
    const my = (touch.clientY - rect.top) * (this.height / rect.height);

    this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleTouchMove(e) {
    if (!this.isActive || !e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleTouchEnd(e) {}

  checkLeafHover(mx, my) {
    const leafIdx = this.getLeafAtCoords(mx, my);
    this.diplomacy.hoveredLeafIndex = leafIdx;
    if (leafIdx !== -1 && leafIdx !== this.diplomacy.selectedLeafIndex) {
      this.diplomacy.selectedLeafIndex = leafIdx;
      if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
    }
  }

  getLeafAtCoords(mx, my) {
    const dip = this.diplomacy;
    const trayLeft = (this.width - dip.trayW) / 2;
    const leafW = dip.trayW / 3;

    if (my >= dip.trayY - 30 && my <= dip.trayY + dip.trayH) {
      for (let i = 0; i < 3; i++) {
        const lx = trayLeft + i * leafW;
        if (mx >= lx && mx <= lx + leafW) {
          return i;
        }
      }
    }
    return -1;
  }

  // =========================================================================
  // PARTICLE SYSTEM & VISUAL EFFECTS
  // =========================================================================
  spawnFloralBurst(x, y, floralType = 'jasmine') {
    const colors = floralType === 'marigold' ? ['#e07b22', '#d9a441', '#f5c542'] :
                   floralType === 'lotus_gold' ? ['#d9a441', '#b85042', '#fbe9d0'] :
                   ['#fdfbf7', '#e8dfce', '#d9a441'];

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        type: 'petal',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        gravity: 60,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 6,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.2 + Math.random() * 0.8
      });
    }
  }

  spawnDrumWave(x, y) {
    this.particles.push({
      type: 'drum_wave',
      x: x,
      y: y,
      radius: 12,
      maxRadius: 160,
      speed: 180,
      alpha: 0.75,
      color: '#D9A441'
    });
  }

  spawnCombatSparks(x, y) {
    for (let i = 0; i < 18; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 80,
        size: 1.5 + Math.random() * 2.5,
        color: '#D9A441',
        alpha: 1.0,
        life: 0.5 + Math.random() * 0.4
      });
    }
  }

  spawnCeremonialShower() {
    const colors = ['#b85042', '#d9a441', '#fdfbf7', '#c94235'];
    for (let i = 0; i < 85; i++) {
      this.particles.push({
        type: 'petal',
        x: Math.random() * this.width,
        y: -20 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 45,
        vy: 35 + Math.random() * 70,
        gravity: 20,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        size: 3.5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 3.5 + Math.random() * 2.0
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'drum_wave') {
        p.radius += p.speed * dt;
        p.alpha -= dt * 0.8;
        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          this.particles.splice(i, 1);
        }
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.gravity) p.vy += p.gravity * dt;
        if (p.rotSpeed) p.rot += p.rotSpeed * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / 1.5);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  // =========================================================================
  // RENDERING PIPELINE (2D / 2.5D TAMIL FORT FESTIVAL AESTHETIC)
  // =========================================================================
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Sky & Distant Ramanathapuram Fort Ramparts
    this.renderSkyAndFortBackground(ctx, w, h);

    // 2. Ceremonial Silk Toranas & Festival Banners
    this.renderFestivalBanners(ctx, w, h);

    // 3. Royal Viewing Dais & Visiting Dignitaries
    this.renderRoyalDaisAndSpectators(ctx, w, h);

    // 4. Courtyard Terracotta Floor & Rangoli Kolam Arena
    this.renderCourtyardFloor(ctx, w, h);

    // 5. Center-Stage Ceremonial Kuthu Vilakku Lamp
    this.renderCenterKuthuVilakku(ctx);

    // 6. Active Trial Mechanics
    if (this.currentTrial === 1) {
      this.renderTrial1Archery(ctx);
    } else if (this.currentTrial === 2) {
      this.renderTrial2Combat(ctx);
    } else if (this.currentTrial === 3) {
      this.renderTrial3Diplomacy(ctx);
    }

    // 7. Dynamic Particles (Petals, Sparks, Ripples)
    this.renderParticles(ctx);

    // 8. Diegetic 3 Brass Flames HUD (Top-Right Balustrade)
    this.renderBrassFlamesHUD(ctx);

    // 9. Feedback Toast & On-Screen Action Guides
    this.renderActionGuidesAndFeedback(ctx, w, h);

    // 10. Finale Proclamation Overlay (When Chapter 1 resolves)
    if (this.isLevelCompleted) {
      this.renderFinaleOverlay(ctx, w, h);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 1. SKY & DISTANT FORT ARCHITECTURE
  // -------------------------------------------------------------------------
  renderSkyAndFortBackground(ctx, w, h) {
    // Warm dusk gradient from terracotta to deep maroon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#2E1F1B'); // BG-MAROON
    skyGrad.addColorStop(0.55, '#54261d');
    skyGrad.addColorStop(1, '#B85042'); // BG-TERRACOTTA
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // Distant Ramanathapuram Fort Granite Ramparts and Watchtowers
    ctx.save();
    ctx.fillStyle = '#1e1411';
    // Watchtower left
    ctx.fillRect(40, 70, 75, 140);
    ctx.fillRect(32, 60, 91, 15);
    // Rampart wall line
    ctx.beginPath();
    ctx.moveTo(0, 165);
    for (let x = 0; x < w; x += 36) {
      ctx.lineTo(x, 165);
      ctx.lineTo(x + 18, 165);
      ctx.lineTo(x + 18, 152);
      ctx.lineTo(x + 36, 152);
    }
    ctx.lineTo(w, 230);
    ctx.lineTo(0, 230);
    ctx.closePath();
    ctx.fill();

    // Watchtower right
    ctx.fillRect(w - 120, 65, 80, 145);
    ctx.fillRect(w - 128, 55, 96, 15);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 2. FESTIVAL BANNERS & SILK CANOPIES
  // -------------------------------------------------------------------------
  renderFestivalBanners(ctx, w, h) {
    ctx.save();
    // Swags of terracotta (#B85042) and gold (#D9A441) silk banners strung between towers
    const bannerColors = ['#B85042', '#D9A441', '#A7BEAE', '#B85042'];
    const bannerY = 85;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#D9A441';
    ctx.beginPath();
    ctx.moveTo(110, bannerY);
    ctx.bezierCurveTo(280, bannerY + 35, 520, bannerY + 35, w - 120, bannerY);
    ctx.stroke();

    // Pennants hanging along the rope
    const totalPennants = 16;
    for (let i = 0; i < totalPennants; i++) {
      const t = (i + 0.5) / totalPennants;
      const px = 110 + (w - 230) * t;
      const py = bannerY + Math.sin(t * Math.PI) * 35;
      const color = bannerColors[i % bannerColors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(px - 10, py);
      ctx.lineTo(px + 10, py);
      ctx.lineTo(px, py + 24);
      ctx.closePath();
      ctx.fill();

      // Golden tassel
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(px, py + 24, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 3. ROYAL VIEWING DAIS & SPECTATORS
  // -------------------------------------------------------------------------
  renderRoyalDaisAndSpectators(ctx, w, h) {
    ctx.save();
    const daisX = 480;
    const daisY = 180;
    const daisW = w - 500;
    const daisH = 90;

    // Carved stone platform
    ctx.fillStyle = '#3c2419';
    ctx.fillRect(daisX, daisY, daisW, daisH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(daisX, daisY, daisW, daisH);

    // Pillars supporting silk canopy
    ctx.fillStyle = '#B85042';
    ctx.fillRect(daisX + 15, daisY - 50, 12, 55);
    ctx.fillRect(daisX + daisW - 25, daisY - 50, 12, 55);

    // Golden decorative cornice
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(daisX, daisY - 54, daisW, 6);

    // Spectator 1: King Muthuvaduganatha Periyavudaya Thevar (Sivaganga)
    // Regal, tall, royal maravar turban and gold medallion
    const mk = this.spectators.muthuvaduganatha;
    ctx.fillStyle = '#D9A441'; // Royal gold angavastram
    ctx.fillRect(mk.x - 12, daisY - 36, 24, 42);
    ctx.fillStyle = '#54261d'; // Maravar maroon coat
    ctx.fillRect(mk.x - 8, daisY - 34, 16, 38);
    // Turban
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(mk.x, daisY - 42, 10, 0, Math.PI * 2);
    ctx.fill();
    // Crown crest
    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.moveTo(mk.x, daisY - 56);
    ctx.lineTo(mk.x + 4, daisY - 46);
    ctx.lineTo(mk.x - 4, daisY - 46);
    ctx.closePath();
    ctx.fill();

    // Name label
    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';
    ctx.fillText('King Muthuvaduganatha', mk.x, daisY - 60);

    // Spectator 2: King Chellamuthu Sethupathi (Father)
    const fc = this.spectators.kingChellamuthu;
    ctx.fillStyle = '#7a1f1f'; // Royal crimson
    ctx.fillRect(fc.x - 10, daisY - 30, 20, 36);
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(fc.x, daisY - 36, 8, 0, Math.PI * 2);
    ctx.fill();

    // Spectator 3: Queen Sakandhimuthal (Mother)
    const mc = this.spectators.queenSakandhimuthal;
    ctx.fillStyle = '#A7BEAE'; // Traditional green-sage silk
    ctx.fillRect(mc.x - 9, daisY - 28, 18, 34);
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(mc.x, daisY - 33, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 4. COURTYARD FLOOR & SACRED KOLAM ARENA
  // -------------------------------------------------------------------------
  renderCourtyardFloor(ctx, w, h) {
    ctx.save();
    const floorY = 220;

    // Rich terracotta paving stone floor
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, '#54281f');
    floorGrad.addColorStop(1, '#2E1F1B');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Geometric stone slab mortar seams
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.12)';
    ctx.lineWidth = 1;
    for (let y = floorY + 40; y < h; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Sacred White & Rice-Flour Kolam Pattern on Sparring Dais
    const kolamX = 350;
    const kolamY = 345;
    const radius = 95;

    ctx.strokeStyle = 'rgba(253, 251, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kolamX, kolamY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric inner petal rings
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(kolamX, kolamY, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // 8-point radial lotus petals
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const px = kolamX + Math.cos(a) * radius;
      const py = kolamY + Math.sin(a) * (radius * 0.45);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 5. CENTER-STAGE CEREMONIAL KUTHU VILAKKU LAMP
  // -------------------------------------------------------------------------
  renderCenterKuthuVilakku(ctx) {
    ctx.save();
    const kv = this.kuthuVilakku;
    const baseWidth = 32;

    // Brass Pedestal Base
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.ellipse(kv.x, kv.y + 70, baseWidth, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiered Vertical Shaft
    ctx.fillStyle = '#b5832a';
    ctx.fillRect(kv.x - 4, kv.y - 10, 8, 80);

    // Decorative Rings on shaft
    ctx.fillStyle = '#f4c760';
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(kv.x, kv.y + 15 + r * 22, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main Oil Reservoir Cup
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.ellipse(kv.x, kv.y - 12, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Hamsa/Swan Finial at top
    ctx.fillStyle = '#f4c760';
    ctx.beginPath();
    ctx.arc(kv.x, kv.y - 28, 6, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Golden Lamp Wicks (7 wicks)
    const wickPositions = [-18, -12, -6, 0, 6, 12, 18];
    wickPositions.forEach((wx, idx) => {
      const wy = kv.y - 14 + Math.abs(wx) * 0.15;
      const flicker = Math.sin(Date.now() * 0.01 + idx) * 1.5;

      // Golden Flame
      ctx.fillStyle = '#fbe9d0';
      ctx.beginPath();
      ctx.ellipse(kv.x + wx, wy - 8 + flicker, 2.5, 6 + kv.festiveFlare, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.ellipse(kv.x + wx, wy - 6 + flicker, 4, 8 + kv.festiveFlare, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Festival Triumph Golden Flare Aura
    if (this.completedTrials >= 3 || kv.festiveFlare > 0) {
      const flareRad = 65 + kv.festiveFlare * 45;
      const flareGrad = ctx.createRadialGradient(kv.x, kv.y - 15, 5, kv.x, kv.y - 15, flareRad);
      flareGrad.addColorStop(0, 'rgba(217, 164, 65, 0.45)');
      flareGrad.addColorStop(0.6, 'rgba(184, 80, 66, 0.2)');
      flareGrad.addColorStop(1, 'rgba(46, 31, 27, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(kv.x, kv.y - 15, flareRad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 6A. RENDER TRIAL 1: GARLAND ARCHERY
  // -------------------------------------------------------------------------
  renderTrial1Archery(ctx) {
    const arch = this.archery;
    ctx.save();

    // Protagonist Velu Nachiyar (Teenage, poised with royal bow)
    const veluX = 180;
    const veluY = 320;
    this.renderVeluArcher(ctx, veluX, veluY);

    // Target Toranas and Swinging Garlands
    arch.garlands.forEach((g, idx) => {
      // Brass hanging chain from archway
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g.baseX, 100);
      ctx.lineTo(g.curX, g.curY - g.radius);
      ctx.stroke();

      if (!g.hit) {
        // Woven floral garland ring (outer ring)
        ctx.lineWidth = 6;
        ctx.strokeStyle = g.floralType === 'marigold' ? '#e07b22' :
                          g.floralType === 'lotus_gold' ? '#D9A441' : '#fdfbf7';
        ctx.beginPath();
        ctx.arc(g.curX, g.curY, g.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner golden trim
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#D9A441';
        ctx.beginPath();
        ctx.arc(g.curX, g.curY, g.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Indicator tag if current active target
        if (idx === arch.currentGarlandIndex) {
          ctx.font = 'bold 11px "Calibri", sans-serif';
          ctx.fillStyle = '#D9A441';
          ctx.textAlign = 'center';
          ctx.fillText(`TARGET ${idx + 1}`, g.curX, g.curY - g.radius - 8);
        }
      } else {
        // Cleared marker (Golden checkmark ribbon)
        ctx.font = 'bold 14px "Cambria", serif';
        ctx.fillStyle = '#D9A441';
        ctx.textAlign = 'center';
        ctx.fillText('✓ CLEARED', g.baseX, g.baseY);
      }
    });

    // Flying Arrow
    if (arch.arrow.active) {
      ctx.save();
      ctx.translate(arch.arrow.x, arch.arrow.y);
      ctx.rotate(arch.arrow.angle);

      // Arrow shaft
      ctx.strokeStyle = '#f4e5d2';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      // Steel tip
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(10, -3);
      ctx.lineTo(10, 3);
      ctx.closePath();
      ctx.fill();

      // Peacock/Jasmine fletching
      ctx.fillStyle = '#A7BEAE';
      ctx.fillRect(-18, -2, 6, 4);

      ctx.restore();
    }

    // Woven Garland Aiming Reticle
    const ret = arch.reticle;
    ctx.save();
    ctx.translate(ret.x, ret.y);

    const isTight = ret.tightness > 0.5;
    const ringColor = isTight ? '#D9A441' : '#d48828';
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.5;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-ret.radius - 6, 0); ctx.lineTo(-ret.radius + 6, 0);
    ctx.moveTo(ret.radius - 6, 0); ctx.lineTo(ret.radius + 6, 0);
    ctx.moveTo(0, -ret.radius - 6); ctx.lineTo(0, -ret.radius + 6);
    ctx.moveTo(0, ret.radius - 6); ctx.lineTo(0, ret.radius + 6);
    ctx.stroke();

    // Woven Garland preview ring
    ctx.beginPath();
    ctx.arc(0, 0, ret.radius - (ret.tightness * 6), 0, Math.PI * 2);
    ctx.stroke();

    if (isTight) {
      ctx.fillStyle = 'rgba(217, 164, 65, 0.25)';
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }

  renderVeluArcher(ctx, x, y) {
    ctx.save();
    // Royal draped pavadai & angavastram in Maroon & Gold
    ctx.fillStyle = '#2E1F1B'; // BG-MAROON
    ctx.fillRect(x - 12, y - 24, 24, 48);

    ctx.fillStyle = '#D9A441'; // ACCENT-GOLD sash
    ctx.fillRect(x - 10, y - 10, 20, 12);

    // Head and traditional kondai hair knot adorned with jasmine
    ctx.fillStyle = '#f4d5b2';
    ctx.beginPath();
    ctx.arc(x, y - 36, 9, 0, Math.PI * 2);
    ctx.fill();

    // Jasmine hair ring
    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.arc(x - 6, y - 38, 4, 0, Math.PI * 2);
    ctx.fill();

    // Drawn Recurve Composite Bow
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 18, y - 20, 28, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#f4e5d2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 38, y - 44);
    ctx.lineTo(x + 10, y - 20);
    ctx.lineTo(x + 38, y + 4);
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 6B. RENDER TRIAL 2: COMBAT RHYTHM (SILAMBAM SPARRING)
  // -------------------------------------------------------------------------
  renderTrial2Combat(ctx) {
    const cmb = this.combat;
    ctx.save();

    // Seated Murasu Drummer on Left
    this.renderMurasuDrummer(ctx, 120, 315);

    // Sparring Champion "Marava Commander" on Right
    const champX = 490;
    const champY = 320;
    this.renderSparringChampion(ctx, champX, champY);

    // Protagonist Velu Nachiyar in Silambam Stance on Left
    const veluX = 260;
    const veluY = 320;
    this.renderVeluSilambam(ctx, veluX, veluY);

    // Telegraph indicator ring above sparring champion
    const strike = cmb.strikeSequence[cmb.currentExchange];
    if (strike) {
      const isTelegraphing = (cmb.championStance === 'telegraph');
      const isStriking = (cmb.championStance === 'strike');

      ctx.font = 'bold 12px "Cambria", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isStriking ? '#D9A441' : (isTelegraphing ? '#f4c760' : '#f4e5d2');
      ctx.fillText(strike.label.toUpperCase(), 375, 235);

      ctx.font = '11px "Calibri", sans-serif';
      ctx.fillStyle = '#A7BEAE';
      ctx.fillText(`Input: [${strike.keyHint}] on Murasu Drum Beat!`, 375, 252);

      // Rhythmic Kolam Pulse
      if (isTelegraphing || isStriking) {
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = isStriking ? 3.5 : 2;
        ctx.beginPath();
        ctx.arc(375, 345, 60, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderMurasuDrummer(ctx, x, y) {
    ctx.save();
    const dr = this.spectators.drummer;

    // Bronze Murasu Drum
    ctx.fillStyle = '#8b5328';
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Drumhead skin
    ctx.fillStyle = '#f4e5d2';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Drummer Figure
    ctx.fillStyle = '#54261d';
    ctx.fillRect(x - 12, y - 26, 24, 30);
    // Head
    ctx.fillStyle = '#f4d5b2';
    ctx.beginPath();
    ctx.arc(x, y - 36, 8, 0, Math.PI * 2);
    ctx.fill();
    // Red turban
    ctx.fillStyle = '#B85042';
    ctx.fillRect(x - 9, y - 44, 18, 8);

    // Striking Drumstick Arm (animated)
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 18);
    ctx.lineTo(x + 6, y + 8 - dr.strikePhase * 16);
    ctx.stroke();

    ctx.restore();
  }

  renderSparringChampion(ctx, x, y) {
    const cmb = this.combat;
    ctx.save();

    // Royal Champion (Sivaganga Master of Arms)
    ctx.fillStyle = '#B85042'; // Sivaganga terracotta tunic
    ctx.fillRect(x - 14, y - 28, 28, 52);

    ctx.fillStyle = '#D9A441'; // Gold war sash
    ctx.fillRect(x - 12, y - 8, 24, 10);

    // Head and warrior mustache
    ctx.fillStyle = '#f4d5b2';
    ctx.beginPath();
    ctx.arc(x, y - 38, 9, 0, Math.PI * 2);
    ctx.fill();

    // Rattan Staff (Silambam Kambu)
    ctx.strokeStyle = '#b5832a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (cmb.championStance === 'telegraph') {
      // High raised windup
      ctx.moveTo(x - 30, y - 65);
      ctx.lineTo(x + 10, y + 25);
    } else if (cmb.championStance === 'strike') {
      // Forward strike extension
      ctx.moveTo(x - 55, y - 18);
      ctx.lineTo(x + 18, y + 10);
    } else {
      // Guard ready
      ctx.moveTo(x - 18, y - 48);
      ctx.lineTo(x + 8, y + 25);
    }
    ctx.stroke();

    ctx.restore();
  }

  renderVeluSilambam(ctx, x, y) {
    const cmb = this.combat;
    ctx.save();

    // Velu Nachiyar in athletic Silambam kacham
    ctx.fillStyle = '#2E1F1B'; // Royal maroon
    ctx.fillRect(x - 12, y - 26, 24, 50);

    ctx.fillStyle = '#D9A441'; // Gold waist sash
    ctx.fillRect(x - 10, y - 8, 20, 10);

    // Head
    ctx.fillStyle = '#f4d5b2';
    ctx.beginPath();
    ctx.arc(x, y - 36, 9, 0, Math.PI * 2);
    ctx.fill();

    // Velu's Rattan Staff (Active Parry Position)
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (cmb.veluStance === 'high_parry') {
      // Overhead horizontal block
      ctx.moveTo(x - 10, y - 55);
      ctx.lineTo(x + 45, y - 55);
    } else if (cmb.veluStance === 'low_parry') {
      // Low sweeping block
      ctx.moveTo(x - 10, y + 25);
      ctx.lineTo(x + 45, y + 25);
    } else if (cmb.veluStance === 'center_parry') {
      // Center vertical deflection
      ctx.moveTo(x + 25, y - 45);
      ctx.lineTo(x + 25, y + 25);
    } else {
      // Idle ready guard
      ctx.moveTo(x - 12, y + 25);
      ctx.lineTo(x + 28, y - 40);
    }
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 6C. RENDER TRIAL 3: THE BETEL-LEAF TRAY (VETRILLAI THAMBOOLAM)
  // -------------------------------------------------------------------------
  renderTrial3Diplomacy(ctx) {
    const dip = this.diplomacy;
    const w = this.width;
    ctx.save();

    // Background dialogue speech from King Muthuvaduganatha
    this.renderDiplomaticDialogueHeader(ctx, w);

    // Foreground Rosewood and Carved Brass Thamboolam Tray
    const trayX = (w - dip.trayW) / 2;
    const trayY = dip.trayY;
    const trayW = dip.trayW;
    const trayH = dip.trayH;

    // Tray Shadow & Rim
    ctx.fillStyle = 'rgba(22, 13, 11, 0.6)';
    ctx.beginPath();
    ctx.ellipse(w / 2, trayY + trayH * 0.7, trayW * 0.52, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hand-carved Brass Tray Surface
    const trayGrad = ctx.createLinearGradient(trayX, trayY, trayX + trayW, trayY + trayH);
    trayGrad.addColorStop(0, '#5a3d1c');
    trayGrad.addColorStop(0.5, '#b5832a');
    trayGrad.addColorStop(1, '#5a3d1c');
    ctx.fillStyle = trayGrad;
    ctx.beginPath();
    ctx.ellipse(w / 2, trayY + 45, trayW * 0.48, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Render the 3 Betel Leaves on the tray
    const leafSlotW = trayW / 3;
    dip.leaves.forEach((leaf, idx) => {
      const lx = trayX + idx * leafSlotW + leafSlotW / 2;
      const ly = trayY + 40 - leaf.lift;
      const isSelected = (idx === dip.selectedLeafIndex);

      this.renderBetelLeaf(ctx, lx, ly, leaf, isSelected, idx + 1);
    });

    // Detailed Lore Box for Currently Inspected Leaf
    const activeLeaf = dip.leaves[dip.selectedLeafIndex];
    if (activeLeaf) {
      this.renderSelectedLeafDetails(ctx, activeLeaf, w);
    }

    ctx.restore();
  }

  renderBetelLeaf(ctx, x, y, leaf, isSelected, num) {
    ctx.save();
    ctx.translate(x, y);

    // Glow halo if selected
    if (isSelected) {
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48);
      glowGrad.addColorStop(0, 'rgba(217, 164, 65, 0.4)');
      glowGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leaf Shape (Heart-shaped traditional Piper betle leaf)
    ctx.fillStyle = isSelected ? '#3d7a42' : '#2d5e32';
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.bezierCurveTo(28, 10, 32, -22, 0, -32);
    ctx.bezierCurveTo(-32, -22, -28, 10, 0, 26);
    ctx.closePath();
    ctx.fill();

    // Central leaf vein
    ctx.strokeStyle = '#5fb366';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(0, -28);
    ctx.stroke();

    // Golden Silk Thread wrapping the areca nut roll
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Areca nut (Paaku) detail at center
    ctx.fillStyle = '#7a3e20';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 7, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Keyboard numeral badge [1], [2], [3]
    ctx.fillStyle = isSelected ? '#D9A441' : '#3c2419';
    ctx.beginPath();
    ctx.arc(0, 38, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 11px "Calibri", sans-serif';
    ctx.fillStyle = isSelected ? '#2E1F1B' : '#f4e5d2';
    ctx.textAlign = 'center';
    ctx.fillText(`${num}`, 0, 42);

    ctx.restore();
  }

  renderDiplomaticDialogueHeader(ctx, w) {
    ctx.save();
    const boxX = w * 0.12;
    const boxY = 80;
    const boxW = w * 0.76;
    const boxH = 75;

    ctx.fillStyle = 'rgba(46, 31, 27, 0.92)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.font = 'bold 12px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText('KING MUTHUVADUGANATHA PERIYAVUDAYA THEVAR:', boxX + 16, boxY + 22);

    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    if (!this.diplomacy.isVowAccepted) {
      ctx.fillText('"Princess Velu Nachiyar. Your bow and staff are peerless. Yet Sivaganga requires a co-sovereign', boxX + 16, boxY + 42);
      ctx.fillText('whose statecraft can unite the Poligars against foreign conquest. Which vow do you offer our throne?"', boxX + 16, boxY + 60);
    } else {
      ctx.fillStyle = '#D9A441';
      ctx.fillText(this.diplomacy.chosenVow?.royalResponse || '', boxX + 16, boxY + 45);
    }

    ctx.restore();
  }

  renderSelectedLeafDetails(ctx, leaf, w) {
    ctx.save();
    const boxX = w * 0.12;
    const boxY = 165;
    const boxW = w * 0.76;
    const boxH = 80;

    ctx.fillStyle = 'rgba(28, 18, 15, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Title
    ctx.font = 'bold 13px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`${leaf.title.toUpperCase()} — [Press ${leaf.key} or Click to Seal Vow]`, boxX + 14, boxY + 22);

    // Vow text in Cambria
    ctx.font = '12px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';

    // Word wrap simple
    ctx.fillText(leaf.text, boxX + 14, boxY + 44);
    ctx.font = 'italic 11px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText(`Strategic Accord: ${leaf.subtitle}`, boxX + 14, boxY + 66);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 7. PARTICLES RENDERING
  // -------------------------------------------------------------------------
  renderParticles(ctx) {
    ctx.save();
    this.particles.forEach(p => {
      if (p.type === 'drum_wave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 8. DIEGETIC 3 BRASS FLAMES HUD (TOP-RIGHT BALUSTRADE)
  // -------------------------------------------------------------------------
  renderBrassFlamesHUD(ctx) {
    ctx.save();
    const fb = this.flameBalustrade;

    // Stone Plaque Frame
    ctx.fillStyle = 'rgba(46, 31, 27, 0.9)';
    ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fb.x, fb.y, fb.w, fb.h);

    // Title
    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL TOURNAMENT TRIALS', fb.x + fb.w / 2, fb.y + 14);

    // 3 Brass Oil Cups and Flames
    const flameSlots = [
      { id: 1, label: 'I. ARCHERY', passed: this.completedTrials >= 1 },
      { id: 2, label: 'II. SILAMBAM', passed: this.completedTrials >= 2 },
      { id: 3, label: 'III. BETROTHAL', passed: this.completedTrials >= 3 }
    ];

    const slotW = fb.w / 3;
    flameSlots.forEach((slot, idx) => {
      const fx = fb.x + idx * slotW + slotW / 2;
      const fy = fb.y + 34;

      // Brass Diya Base
      ctx.fillStyle = '#b5832a';
      ctx.beginPath();
      ctx.ellipse(fx, fy + 4, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (slot.passed) {
        // Lit Golden Flame
        const flicker = Math.sin(Date.now() * 0.012 + idx * 2) * 1.5;

        // Radiant glow
        const flameGrad = ctx.createRadialGradient(fx, fy - 4, 1, fx, fy - 4, 14);
        flameGrad.addColorStop(0, '#fbe9d0');
        flameGrad.addColorStop(0.5, '#D9A441');
        flameGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(fx, fy - 4, 14, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core Flame
        ctx.fillStyle = '#fdfbf7';
        ctx.beginPath();
        ctx.ellipse(fx, fy - 4 + flicker, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Unlit wick
        ctx.fillStyle = '#1c120e';
        ctx.fillRect(fx - 1, fy - 2, 2, 4);
      }

      // Sub-label
      ctx.font = 'bold 8px "Calibri", sans-serif';
      ctx.fillStyle = slot.passed ? '#D9A441' : '#947565';
      ctx.textAlign = 'center';
      ctx.fillText(slot.label, fx, fy + 14);
    });

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 9. ACTION GUIDES & FEEDBACK TOAST
  // -------------------------------------------------------------------------
  renderActionGuidesAndFeedback(ctx, w, h) {
    ctx.save();

    // Feedback Toast (Top Center)
    if (this.feedbackText) {
      ctx.font = 'bold 13px "Cambria", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.feedbackColor;
      ctx.fillText(this.feedbackText, w / 2, 42);
    }

    // Action Controls Guide (Bottom Bar)
    ctx.fillStyle = 'rgba(22, 13, 11, 0.88)';
    ctx.fillRect(0, h - 26, w, 26);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, h - 26, w, 26);

    ctx.font = '11px "Calibri", sans-serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';

    if (this.currentTrial === 1) {
      ctx.fillText('TRIAL 1 CONTROLS: [Mouse / Touch / Arrows] Aim Garland Ring  •  [Space / Left Click] Release Arrow  •  3 Ring Hits Required', w / 2, h - 9);
    } else if (this.currentTrial === 2) {
      ctx.fillText('TRIAL 2 CONTROLS: [W / ↑] High Guard  •  [S / ↓] Low Guard  •  [Space / Enter] Center Parry  •  Time on Murasu Drum Beat!', w / 2, h - 9);
    } else if (this.currentTrial === 3) {
      ctx.fillText('TRIAL 3 CONTROLS: [1 / 2 / 3 or Hover] Inspect Betel Leaves  •  [Enter / Click Leaf] Seal Betrothal Vow with King Muthuvaduganatha', w / 2, h - 9);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 10. FINALE PROCLAMATION OVERLAY (CHAPTER 1 GRADUATION)
  // -------------------------------------------------------------------------
  renderFinaleOverlay(ctx, w, h) {
    ctx.save();

    // Dark parchment tint
    ctx.fillStyle = 'rgba(22, 13, 11, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Decorative Royal Proclamation Plaque
    const modalX = w * 0.12;
    const modalY = 40;
    const modalW = w * 0.76;
    const modalH = h - 80;

    // Background parchment
    ctx.fillStyle = '#2E1F1B'; // BG-MAROON
    ctx.fillRect(modalX, modalY, modalW, modalH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    // Inner gold border line
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 6, modalY + 6, modalW - 12, modalH - 12);

    // Title
    ctx.font = 'bold 18px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('THE ROYAL ALLIANCE OF SIVAGANGA & RAMNAD', w / 2, modalY + 42);

    ctx.font = 'italic 12.5px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Chapter 1: The Making of a Queen — Complete', w / 2, modalY + 64);

    // Divider
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, modalY + 76);
    ctx.lineTo(w / 2 + 140, modalY + 76);
    ctx.stroke();

    // Chosen Accord
    ctx.font = 'bold 13px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText(`Sacred Vow: ${this.diplomacy.chosenVow?.title || 'Vow of Twin Sovereignty'}`, w / 2, modalY + 105);

    // Historical Summary
    ctx.font = '12px "Cambria", serif';
    ctx.fillStyle = '#e8dcc8';
    ctx.textAlign = 'center';
    const lines = [
      'In the year 1746, Velu Nachiyar was wed to King Muthuvaduganatha Periyavudaya Thevar',
      'of Sivaganga. For two decades, their joined reign brought flourishing prosperity, military',
      'fortification, and proud independence to the Tamil country.',
      '',
      'Now, the first chapter of her legend stands fulfilled.',
      'Beyond the Ramanathapuram fort walls, the dark clouds of colonial war gather.',
      'The Gate of the Western Ghats stands open!'
    ];

    lines.forEach((l, idx) => {
      ctx.fillText(l, w / 2, modalY + 138 + idx * 21);
    });

    // Call-to-action button
    const btnX = w / 2 - 160;
    const btnY = modalY + modalH - 65;
    const btnW = 320;
    const btnH = 42;

    ctx.fillStyle = '#B85042'; // BG-TERRACOTTA
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.font = 'bold 14px "Cambria", serif';
    ctx.fillStyle = '#fdfbf7';
    ctx.fillText('ENTER THE CHRONICLE [ENTER / SPACE]', w / 2, btnY + 26);

    ctx.restore();
  }
}

// Global Level 5 Singleton Instance
window.sivagangaTheBetrothal = new SivagangaLevel5TheBetrothal();
