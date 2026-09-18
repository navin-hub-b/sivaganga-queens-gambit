/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 6: "QUEEN OF SIVAGANGA"
 * Chapter 2 Opening: Sivaganga Fort Inner Keep Council Chamber (c. 1746–1772).
 *
 * Protagonist: Rani Velu Nachiyar as Queen Consort, learning and practicing statecraft
 * alongside King Muthuvaduganatha Periyavudaya Thevar and royal advisors.
 *
 * GAMEPLAY: Village-Economy Resource Management
 * - Calm, systems-teaching level with zero combat threats.
 * - Resources are represented by physical objects on the low council table:
 *     1. Woven grain baskets that physically fill with golden paddy mounds or empty.
 *     2. Stacks of gold varahan coins that physically rise and fall in tiered columns.
 *     3. Woven jasmine-and-marigold loyalty garland that physically lengthens or shortens.
 *     4. Diegetic brass oil lamp on the table edge reflecting morale and royal presence.
 * - 4 Seasonal Statecraft Decisions:
 *     Turn 0 (Spring): Irrigation Sluice Reconstruction (Kalingula & Eri)
 *     Turn 1 (Summer): Temple & Harvest Festival (Vaikasi Thiruvizha)
 *     Turn 2 (Autumn): Famine Reserve & Granary Tariffs (Nellu Kalañjiyam)
 *     Turn 3 (Winter): Rampart Fortifications & Citizen Militia Training
 * - Arched window view looking out onto Sivaganga fort town and ramparts below:
 *   Consequences immediately reflect choices (canal water & emerald fields, temple banners & lanterns,
 *   granary activity, watchtower fire beacons).
 * - Immediate clamping and atomic save persistence per decision so simulated crashes never leave
 *   resources in an inconsistent or corrupted state.
 *
 * PALETTE: BG-MAROON #2E1F1B, BG-TERRACOTTA #B85042, ACCENT-GOLD #D9A441, ACCENT-SAGE #A7BEAE, DANGER-DEEP #7A1F1F.
 * TYPOGRAPHY: Lore in Cambria, UI numerals in Calibri.
 */

class SivagangaLevel6QueenOfSivaganga {
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

    // Progression: 4 Seasonal Decisions
    this.currentTurn = 0; // 0..3
    this.totalTurns = 4;
    this.isLevelCompleted = false;
    this.decisionsHistory = [];
    this.viewMode = 'table'; // 'table' (council desk) or 'town' (panoramic window zoom)

    // Intro screen: non-blocking by default so decisions and table are immediately visible
    this.showIntro = false;
    this.introTimer = 0; // counts up after player dismisses; -1 means not yet shown

    // Smooth physical object animation ratios (interpolated towards target)
    this.displayGrainRatio = 0.5;
    this.displayGoldRatio = 0.5;
    this.displayTrustRatio = 0.6;

    // Visual consequence state of Sivaganga Town below
    this.townState = {
      irrigation: 'adequate', // 'parched', 'adequate', 'lush'
      festival: 'none',       // 'none', 'modest', 'grand'
      granary: 'moderate',    // 'empty', 'moderate', 'abundant'
      defenses: 'basic'       // 'basic', 'citadel', 'fortified'
    };

    // Feedback toast
    this.feedbackText = '';
    this.feedbackTimer = 0;
    this.feedbackColor = '#D9A441';

    // Hovered option index for previewing resource deltas
    this.hoveredOptionIndex = -1;

    // Low Teakwood Council Table
    this.table = {
      x: 70,
      y: 310,
      w: 660,
      h: 165
    };

    // Ceremonial Brass Diya Lamp on table edge
    this.diyaLamp = {
      x: 110,
      y: 350,
      flamePhase: 0
    };

    // Particles array (golden dust, flower petals, coin sparks)
    this.particles = [];

    // The 4 Seasonal Statecraft Decisions
    this.decisions = [
      // -----------------------------------------------------------------------
      // Turn 0: Spring Irrigation Sluices (Kalingula & Eri)
      // -----------------------------------------------------------------------
      {
        turnId: 0,
        season: 'Spring (Chithirai)',
        title: 'The Vaigai Feeder Canals & Sluices',
        context: 'Spring floods have silted the Vaigai feeder canals. Without urgent repair, the summer paddy seedlings across twelve village communes will wither.',
        advisor: {
          name: 'Perumal',
          title: 'Elder Farmer & Sluice Overseer',
          counsel: '"Princess Velu, stone sluices endure for generations. Spare no gold on water, and the soil will repay Sivaganga a hundredfold in grain."'
        },
        options: [
          {
            id: 'sluice_full',
            key: '1',
            label: 'Full Granite Sluice Reconstruction & Canal Desilting',
            costDesc: '-60 Gold  •  +120 Grain  •  +1 Loyalty',
            deltas: { gold: -60, grain: 120, trust: 1 },
            consequence: 'Stone masonry diverts rushing waters into every terrace; emerald green paddy fields flourish.',
            townEffect: { irrigation: 'lush' }
          },
          {
            id: 'sluice_modest',
            key: '2',
            label: 'Community Desilting Corvée & Rattan Reinforcement',
            costDesc: '-20 Gold  •  +40 Grain  •  0 Loyalty',
            deltas: { gold: -20, grain: 40, trust: 0 },
            consequence: 'Frugal timber dams supply central reservoirs, yielding an adequate harvest.',
            townEffect: { irrigation: 'adequate' }
          },
          {
            id: 'sluice_defer',
            key: '3',
            label: 'Defer Sluice Repairs to Conserve Royal Gold',
            costDesc: '0 Gold  •  -50 Grain  •  -1 Loyalty',
            deltas: { gold: 0, grain: -50, trust: -1 },
            consequence: 'Parched earth cracks under the summer heat; disgruntled farmers voice grievance.',
            townEffect: { irrigation: 'parched' }
          }
        ]
      },

      // -----------------------------------------------------------------------
      // Turn 1: Summer Temple & Harvest Festival (Vaikasi Thiruvizha)
      // -----------------------------------------------------------------------
      {
        turnId: 1,
        season: 'Summer (Vaikasi)',
        title: 'The Temple & Harvest Festival',
        context: 'The harvest is reaped. Village leaders and temple priests assemble, requesting royal funds and free grain distribution for the annual festival of the royal temple.',
        advisor: {
          name: 'Dewan Maruthu',
          title: 'Prime Minister of Sivaganga',
          counsel: '"A queen who celebrates alongside her people wins their sworn hearts. Shared feast fires unite the poligar clans far stronger than iron laws."'
        },
        options: [
          {
            id: 'festival_grand',
            key: '1',
            label: 'Grand Royal Festival & Public Grain Feast',
            costDesc: '-40 Gold  •  -60 Grain  •  +2 Loyalty',
            deltas: { gold: -40, grain: -60, trust: 2 },
            consequence: 'Vibrant silk pennants, oil lamps, and joyous feasts fill Sivaganga\'s bazaar square.',
            townEffect: { festival: 'grand' }
          },
          {
            id: 'festival_modest',
            key: '2',
            label: 'Dignified Temple Ritual & Modest Distribution',
            costDesc: '-15 Gold  •  -15 Grain  •  +1 Loyalty',
            deltas: { gold: -15, grain: -15, trust: 1 },
            consequence: 'Sacred pujas observed with solemn dignity while safeguarding royal reserves.',
            townEffect: { festival: 'modest' }
          },
          {
            id: 'festival_suspend',
            key: '3',
            label: 'Suspend Festivities to Hoard State Grain',
            costDesc: '0 Gold  •  0 Grain  •  -1 Loyalty',
            deltas: { gold: 0, grain: 0, trust: -1 },
            consequence: 'Streets remain quiet and dark; townspeople feel alienated from the royal court.',
            townEffect: { festival: 'none' }
          }
        ]
      },

      // -----------------------------------------------------------------------
      // Turn 2: Autumn Famine Reserve & Granary Tariffs (Nellu Kalañjiyam)
      // -----------------------------------------------------------------------
      {
        turnId: 2,
        season: 'Autumn (Purattasi)',
        title: 'Famine Reserve & Granary Tariffs',
        context: 'Drought strikes neighboring Carnatic territories. British and Arcot merchant cartels offer lavish gold prices to buy out Sivaganga\'s entire public granary surplus.',
        advisor: {
          name: 'Treasurer Sundaram',
          title: 'Royal Kanakkupillai (Treasurer)',
          counsel: '"Their gold is tempting, Rani Velu, yet when famine arrives, one cannot eat coins. Keep our granaries full, or our people will starve."'
        },
        options: [
          {
            id: 'granary_secure',
            key: '1',
            label: 'Ban Grain Export & Subsidize Local Granary Reserves',
            costDesc: '-30 Gold  •  +80 Grain  •  +1 Loyalty',
            deltas: { gold: -30, grain: 80, trust: 1 },
            consequence: 'Sivaganga granaries are filled to overflowing; citizens praise the Queen\'s foresight.',
            townEffect: { granary: 'abundant' }
          },
          {
            id: 'granary_tariff',
            key: '2',
            label: 'Permit Regulated Grain Trade with Moderate Royal Tariff',
            costDesc: '+60 Gold  •  -40 Grain  •  0 Loyalty',
            deltas: { gold: 60, grain: -40, trust: 0 },
            consequence: 'Merchants pay rich customs duties into the royal treasury without depleting core reserves.',
            townEffect: { granary: 'moderate' }
          },
          {
            id: 'granary_liquidate',
            key: '3',
            label: 'Liquidate Granary Stockpiles for Maximum Gold',
            costDesc: '+120 Gold  •  -100 Grain  •  -2 Loyalty',
            deltas: { gold: 120, grain: -100, trust: -2 },
            consequence: 'The treasury overflows with gold, but empty village bins spark widespread panic.',
            townEffect: { granary: 'empty' }
          }
        ]
      },

      // -----------------------------------------------------------------------
      // Turn 3: Winter Ramparts & Citizen Militia Training
      // -----------------------------------------------------------------------
      {
        turnId: 3,
        season: 'Winter (Margazhi)',
        title: 'Fort Ramparts & Citizen Militia',
        context: 'Foreign scouts and East India Company surveyors have been sighted mapping routes near the Madurai border. Defense preparations must be prioritized.',
        advisor: {
          name: 'King Muthuvaduganatha',
          title: 'King of Sivaganga & Supreme Commander',
          counsel: '"Velu, stone ramparts without resolute defenders are mere dust. When the day of battle comes, an armed, disciplined people will be our unyielding bastion."'
        },
        options: [
          {
            id: 'militia_citizen',
            key: '1',
            label: 'Fortify Outlying Redoubts & Train Citizen Militia',
            costDesc: '-50 Gold  •  -30 Grain  •  +2 Loyalty',
            deltas: { gold: -50, grain: -30, trust: 2 },
            consequence: 'Spearmen drill along ramparts; watchtower fires burn bright day and night.',
            townEffect: { defenses: 'fortified' }
          },
          {
            id: 'militia_citadel',
            key: '2',
            label: 'Reinforce Inner Citadel Walls & Palace Guards Only',
            costDesc: '-30 Gold  •  0 Grain  •  0 Loyalty',
            deltas: { gold: -30, grain: 0, trust: 0 },
            consequence: 'The inner fortress is strengthened, while outer hamlets rely on regional chieftains.',
            townEffect: { defenses: 'citadel' }
          },
          {
            id: 'militia_frugal',
            key: '3',
            label: 'Rely on Treaties & Maintain Minimum Standing Guard',
            costDesc: '+30 Gold  •  0 Grain  •  -1 Loyalty',
            deltas: { gold: 30, grain: 0, trust: -1 },
            consequence: 'Expenditure is minimized, but the town\'s outer perimeter remains vulnerable.',
            townEffect: { defenses: 'basic' }
          }
        ]
      }
    ];

    // Input bindings
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
  }

  // =========================================================================
  // INITIALIZATION & ATOMIC RESTORATION
  // =========================================================================
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isActive = true;
    this.isTransitioning = false;
    this.isLevelCompleted = false;
    this.viewMode = 'table';
    this.lastTime = performance.now();

    this.handleResize();
    this.loadAndSanitizeState();

    // Event listeners
    window.addEventListener('keydown', this.boundKeyDown);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });

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
   * Technical Contract: Atomic load and restoration.
   * Restores current turn, decisions made, and town state if resumed mid-level.
   */
  loadAndSanitizeState() {
    try {
      const stats = window.sivagangaSave?.state?.levelStats?.[6];
      if (stats && typeof stats.currentTurn === 'number') {
        this.currentTurn = Math.max(0, Math.min(this.totalTurns, stats.currentTurn));
        this.decisionsHistory = Array.isArray(stats.decisionsHistory) ? stats.decisionsHistory : [];
        if (stats.townState) {
          this.townState = { ...this.townState, ...stats.townState };
        }
        if (this.currentTurn >= this.totalTurns) {
          this.isLevelCompleted = true;
          this.viewMode = 'town';
          this.showIntro = false;
        } else {
          // Resuming: skip intro, show resume message
          this.showIntro = false;
          this.showFeedback(`Council Resumed — Decision ${this.currentTurn + 1} of 4`, '#D9A441', 3.0);
        }
      } else {
        this.currentTurn = 0;
        this.decisionsHistory = [];
        this.townState = { irrigation: 'adequate', festival: 'none', granary: 'moderate', defenses: 'basic' };
      }
    } catch (e) {
      console.warn('Level 6: Failed to restore state, starting Turn 0', e);
      this.currentTurn = 0;
      this.decisionsHistory = [];
    }

    this.updateTargetRatios();
    this.displayGrainRatio = this.targetGrainRatio;
    this.displayGoldRatio = this.targetGoldRatio;
    this.displayTrustRatio = this.targetTrustRatio;
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
    }
  }

  showFeedback(text, color = '#D9A441', duration = 2.5) {
    this.feedbackText = text;
    this.feedbackColor = color;
    this.feedbackTimer = duration;
  }

  // =========================================================================
  // UPDATE LOGIC & PHYSICAL RATIOS
  // =========================================================================
  update(dt, timestamp) {
    // Feedback timer
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
      if (this.feedbackTimer <= 0) this.feedbackText = '';
    }

    // Diya lamp flicker
    this.diyaLamp.flamePhase = Math.sin(timestamp * 0.009) * 2 + Math.cos(timestamp * 0.016) * 1.5;

    // Update target ratios from save resources
    this.updateTargetRatios();

    // Smooth physical object animation lerp
    const lerpSpeed = Math.min(1.0, dt * 6.0);
    this.displayGrainRatio += (this.targetGrainRatio - this.displayGrainRatio) * lerpSpeed;
    this.displayGoldRatio += (this.targetGoldRatio - this.displayGoldRatio) * lerpSpeed;
    this.displayTrustRatio += (this.targetTrustRatio - this.displayTrustRatio) * lerpSpeed;

    // Update particles
    this.updateParticles(dt);
  }

  updateTargetRatios() {
    const res = window.sivagangaSave?.state?.resources || { grain: 300, gold: 150, trust: 3 };
    // Grain: baseline 0 to 600
    this.targetGrainRatio = Math.max(0.05, Math.min(1.0, res.grain / 500));
    // Gold: baseline 0 to 400
    this.targetGoldRatio = Math.max(0.05, Math.min(1.0, res.gold / 350));
    // Trust/Loyalty: 0 to 5
    this.targetTrustRatio = Math.max(0.1, Math.min(1.0, res.trust / 5));
  }

  // =========================================================================
  // DECISION RESOLUTION & ATOMIC PERSISTENCE
  // =========================================================================
  applyDecision(optionIndex) {
    const dec = this.decisions[this.currentTurn];
    if (!dec) return;
    const opt = dec.options[optionIndex];
    if (!opt) return;

    // 1. Immediately apply and atomically clamp resources in SaveManager
    let newRes = null;
    if (window.sivagangaSave) {
      newRes = window.sivagangaSave.setResourcesClamped(opt.deltas);
    }

    // 2. Update visible town state
    if (opt.townEffect) {
      this.townState = { ...this.townState, ...opt.townEffect };
    }

    // 3. Record in decision history
    this.decisionsHistory.push({
      turn: this.currentTurn,
      title: dec.title,
      chosenOption: opt.label,
      deltas: opt.deltas
    });

    // 4. Spawn physical burst on the table
    this.spawnResourceChangeParticles(opt.deltas);

    // 5. Audio feedback
    if (window.sivagangaAudio) {
      if (opt.deltas.gold !== 0) window.sivagangaAudio.playFocusPing();
      if (opt.deltas.grain > 0) window.sivagangaAudio.playPalmLeafScroll();
      if (opt.deltas.trust > 0) window.sivagangaAudio.playResolveBell();
    }

    this.showFeedback(`${opt.label} Confirmed: ${opt.consequence}`, '#D9A441', 3.5);

    // 6. Advance turn and commit atomic save
    this.currentTurn++;
    this.persistLevelProgress();

    // 7. Check Level completion
    if (this.currentTurn >= this.totalTurns) {
      setTimeout(() => {
        if (this.isActive) {
          this.resolveLevel();
        }
      }, 2500);
    }
  }

  /**
   * Technical Contract: Atomic persistence to save schema.
   * Guarantees crash consistency: last fully-resolved decision is preserved.
   */
  persistLevelProgress() {
    if (!window.sivagangaSave) return;
    const currentStats = window.sivagangaSave.state.levelStats[6] || {};
    currentStats.currentTurn = this.currentTurn;
    currentStats.decisionsHistory = this.decisionsHistory;
    currentStats.townState = this.townState;
    currentStats.completed = (this.currentTurn >= this.totalTurns);

    window.sivagangaSave.state.levelStats[6] = currentStats;
    window.sivagangaSave.save();
  }

  resolveLevel() {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;
    this.viewMode = 'town'; // Switch to panoramic establishing town view

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(6, {
        reignDecisionsCompleted: true,
        turnsResolved: 4,
        finalTownState: this.townState,
        finalResources: { ...window.sivagangaSave.state.resources }
      });
      window.sivagangaSave.unlockLevel(7);
      window.sivagangaSave.recordChronicleNode(6);
    }

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playCeremonialFanfare();
      window.sivagangaAudio.playTempleBell();
    }

    this.spawnCeremonialPetals();

    // Seamless Campaign Flow: Trigger Royal Scribe Bridge to Level 7
    if (window.sivagangaNarrativeFlow) {
      window.sivagangaNarrativeFlow.onLevelComplete(6, {
        reignDecisionsCompleted: true,
        turnsResolved: 4
      });
    }
  }

  transitionToChronicle() {
    this.transitionToLevel7();
  }

  transitionToLevel7() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);

    const proceed = () => {
      this.stop();
      if (window.sivagangaRouter) {
        window.sivagangaRouter.navigate('/level/07-the-companys-shadow');
      } else if (window.sivagangaGameplay) {
        window.sivagangaGameplay.start(7);
      }
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
      this.isTransitioning = false;
    }
  }

  // =========================================================================
  // INPUT HANDLING
  // =========================================================================
  handleKeyDown(e) {
    if (!this.isActive) return;

    // Dismiss intro screen
    if (this.showIntro) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' ||
          e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        this.showIntro = false;
        if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
      }
      return;
    }

    // Finale keypress: advance to Level 7
    if (this.isLevelCompleted) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        this.transitionToLevel7();
        return;
      }
    }

    // Toggle window / town view
    if (e.key === 'v' || e.key === 'V') {
      e.preventDefault();
      this.viewMode = (this.viewMode === 'table') ? 'town' : 'table';
      if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
      return;
    }

    // Option selections: 1, 2, 3
    if (e.key === '1') {
      this.applyDecision(0);
    } else if (e.key === '2') {
      this.applyDecision(1);
    } else if (e.key === '3') {
      this.applyDecision(2);
    }
  }

  handleMouseMove(e) {
    if (!this.isActive) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.width / rect.width);
    const my = (e.clientY - rect.top) * (this.height / rect.height);

    this.checkOptionHover(mx, my);
  }

  handleMouseDown(e) {
    if (!this.isActive) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.width / rect.width);
    const my = (e.clientY - rect.top) * (this.height / rect.height);

    // Dismiss intro
    if (this.showIntro) {
      this.showIntro = false;
      if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
      return;
    }

    if (this.isLevelCompleted) {
      this.transitionToLevel7();
      return;
    }

    // Check window click to toggle town view
    if (mx >= 260 && mx <= 540 && my >= 55 && my <= 235) {
      this.viewMode = (this.viewMode === 'table') ? 'town' : 'table';
      if (window.sivagangaAudio) window.sivagangaAudio.playFocusPing();
      return;
    }

    // Check option card clicks
    const clickedOption = this.getOptionAtCoords(mx, my);
    if (clickedOption !== -1) {
      this.applyDecision(clickedOption);
    }
  }

  handleTouchStart(e) {
    if (!this.isActive || !e.touches || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  }

  checkOptionHover(mx, my) {
    const optIdx = this.getOptionAtCoords(mx, my);
    if (optIdx !== this.hoveredOptionIndex) {
      this.hoveredOptionIndex = optIdx;
      if (optIdx !== -1 && window.sivagangaAudio) {
        window.sivagangaAudio.playFocusPing();
      }
    }
  }

  getOptionAtCoords(mx, my) {
    if (this.viewMode !== 'table' || this.isLevelCompleted) return -1;
    const cardY = 245;
    const cardH = 58;
    const cardW = 205;
    const startX = 85;

    for (let i = 0; i < 3; i++) {
      const cx = startX + i * 220;
      if (mx >= cx && mx <= cx + cardW && my >= cardY && my <= cardY + cardH) {
        return i;
      }
    }
    return -1;
  }

  // =========================================================================
  // PARTICLES & PHYSICAL EFFECTS
  // =========================================================================
  spawnResourceChangeParticles(deltas) {
    // Grain burst at baskets
    if (deltas.grain !== 0) {
      for (let i = 0; i < 18; i++) {
        this.particles.push({
          type: 'grain',
          x: 230 + (Math.random() - 0.5) * 60,
          y: 380,
          vx: (Math.random() - 0.5) * 40,
          vy: -30 - Math.random() * 50,
          gravity: 70,
          size: 2,
          color: '#f4c760',
          alpha: 1.0,
          life: 0.9
        });
      }
    }

    // Gold sparkle at coin stacks
    if (deltas.gold !== 0) {
      for (let i = 0; i < 16; i++) {
        this.particles.push({
          type: 'coin_spark',
          x: 390 + (Math.random() - 0.5) * 50,
          y: 370,
          vx: (Math.random() - 0.5) * 50,
          vy: -40 - Math.random() * 60,
          gravity: 80,
          size: 2.5,
          color: '#D9A441',
          alpha: 1.0,
          life: 0.8
        });
      }
    }

    // Floral petal at garland
    if (deltas.trust !== 0) {
      for (let i = 0; i < 14; i++) {
        this.particles.push({
          type: 'petal',
          x: 550 + (Math.random() - 0.5) * 70,
          y: 380,
          vx: (Math.random() - 0.5) * 30,
          vy: -20 - Math.random() * 40,
          gravity: 35,
          size: 3,
          color: '#fdfbf7',
          alpha: 1.0,
          life: 1.2
        });
      }
    }
  }

  spawnCeremonialPetals() {
    const colors = ['#fdfbf7', '#D9A441', '#e07b22', '#B85042'];
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        type: 'petal',
        x: Math.random() * this.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 40,
        vy: 35 + Math.random() * 65,
        gravity: 20,
        size: 3.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 3.5 + Math.random() * 2
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 1.5);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // RENDERING PIPELINE
  // =========================================================================
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    if (this.viewMode === 'table') {
      // 1. Council Chamber Wall & Tapestries
      this.renderCouncilChamber(ctx, w, h);

      // 2. Arched Window View to Sivaganga Fort Town
      this.renderArchedWindowView(ctx, 260, 55, 280, 180, false);

      // 3. Current Decision Dialogue & Advisor Counsel
      this.renderDecisionPanel(ctx, w, h);

      // 4. Low Teak Council Table with Physical Objects
      this.renderCouncilTableAndResources(ctx, w, h);

      // 5. Particles
      this.renderParticles(ctx);

      // 6. Turn Progress Bar (always visible when in table view)
      this.renderTurnProgressBar(ctx, w, h);

      // 7. Action Guide & Feedback Toast
      this.renderBottomGuideAndFeedback(ctx, w, h);
    } else {
      // Full Panoramic Window Establishing View
      this.renderPanoramicTownView(ctx, w, h);
    }

    // Intro overlay (shown first time only)
    if (this.showIntro) {
      this.renderIntroOverlay(ctx, w, h);
    }

    // Finale Proclamation Overlay when all 4 decisions conclude
    if (this.isLevelCompleted) {
      this.renderFinaleOverlay(ctx, w, h);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 1. COUNCIL CHAMBER WALL & ROYAL INTERIOR
  // -------------------------------------------------------------------------
  renderCouncilChamber(ctx, w, h) {
    ctx.save();

    // Deep Maroon wall stone
    ctx.fillStyle = '#2E1F1B'; // BG-MAROON
    ctx.fillRect(0, 0, w, h);

    // Carved Granite Pilasters in BG-TERRACOTTA
    ctx.fillStyle = '#3e241d';
    ctx.fillRect(35, 0, 30, h);
    ctx.fillRect(w - 65, 0, 30, h);

    // Gold cornice trim
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(0, 48, w, 4);
    ctx.fillRect(0, h - 35, w, 3);

    // Silk Royal Tapestries on Left & Right
    // Left tapestry: Sivaganga Lotus emblem
    ctx.fillStyle = '#B85042';
    ctx.fillRect(75, 56, 50, 160);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(75, 56, 50, 160);
    // Gold lotus motif
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(100, 136, 12, 0, Math.PI * 2);
    ctx.fill();

    // Right tapestry: Royal Maravar Peacock crest
    ctx.fillStyle = '#54261d';
    ctx.fillRect(w - 125, 56, 50, 160);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w - 125, 56, 50, 160);
    ctx.fillStyle = '#A7BEAE';
    ctx.beginPath();
    ctx.arc(w - 100, 136, 12, 0, Math.PI * 2);
    ctx.fill();

    // Rolled palm-leaf ledgers (Kanakku Olai) on floor shelf
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(70, 222, 60, 8);
    ctx.fillStyle = '#d9b382';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(74 + i * 13, 216, 10, 6);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 2. ARCHED WINDOW VIEW OF SIVAGANGA TOWN
  // -------------------------------------------------------------------------
  renderArchedWindowView(ctx, wx, wy, ww, wh, isPanoramic = false) {
    ctx.save();

    // Clip to arched window aperture
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx, wy + 40);
    ctx.arc(wx + ww / 2, wy + 40, ww / 2, Math.PI, 0);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.closePath();

    if (!isPanoramic) {
      ctx.save();
      ctx.clip();
    }

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh * 0.6);
    skyGrad.addColorStop(0, '#54261d');
    skyGrad.addColorStop(1, '#B85042');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(wx, wy, ww, wh);

    // Distant mountain ridge (Western Ghats foothills)
    ctx.fillStyle = '#2b1612';
    ctx.beginPath();
    ctx.moveTo(wx, wy + 70);
    ctx.lineTo(wx + ww * 0.35, wy + 55);
    ctx.lineTo(wx + ww * 0.7, wy + 68);
    ctx.lineTo(wx + ww, wy + 58);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.lineTo(wx, wy + wh);
    ctx.closePath();
    ctx.fill();

    // Fort Ramparts with Stone Merlons
    ctx.fillStyle = '#1e120f';
    ctx.fillRect(wx, wy + 75, ww, 25);
    for (let bx = wx + 8; bx < wx + ww; bx += 22) {
      ctx.fillRect(bx, wy + 67, 12, 12);
    }

    // Watchtower Beacons (Reflects 'defenses' state)
    const towerX1 = wx + 25;
    const towerX2 = wx + ww - 35;
    ctx.fillStyle = '#140c0a';
    ctx.fillRect(towerX1 - 8, wy + 52, 16, 32);
    ctx.fillRect(towerX2 - 8, wy + 52, 16, 32);

    if (this.townState.defenses === 'fortified') {
      // Burning beacon flames
      const f1 = Math.sin(Date.now() * 0.015) * 2;
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(towerX1, wy + 48 + f1, 5, 0, Math.PI * 2);
      ctx.arc(towerX2, wy + 48 - f1, 5, 0, Math.PI * 2);
      ctx.fill();

      // Spearmen silhouettes on ramparts
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + 80, wy + 62); ctx.lineTo(wx + 80, wy + 76);
      ctx.moveTo(wx + 170, wy + 62); ctx.lineTo(wx + 170, wy + 76);
      ctx.stroke();
    }

    // Valley & Terraced Paddy Fields (Reflects 'irrigation' state)
    const fieldColor = this.townState.irrigation === 'lush' ? '#467849' :
                       this.townState.irrigation === 'adequate' ? '#78824a' : '#855e3c';
    ctx.fillStyle = fieldColor;
    ctx.fillRect(wx, wy + 100, ww, wh - 100);

    // Vaigai Feeder Canal
    const canalColor = this.townState.irrigation === 'lush' ? '#3d6e75' :
                       this.townState.irrigation === 'adequate' ? '#517478' : '#614838';
    ctx.strokeStyle = canalColor;
    ctx.lineWidth = this.townState.irrigation === 'lush' ? 9 : (this.townState.irrigation === 'adequate' ? 6 : 3);
    ctx.beginPath();
    ctx.moveTo(wx + 40, wy + 100);
    ctx.bezierCurveTo(wx + 90, wy + 125, wx + 160, wy + 115, wx + ww - 20, wy + 160);
    ctx.stroke();

    // Central Temple Gopuram & Bazaar
    const gopX = wx + ww * 0.52;
    const gopY = wy + 90;
    ctx.fillStyle = '#B85042';
    // Tiered gopuram tower
    ctx.beginPath();
    ctx.moveTo(gopX - 16, gopY + 45);
    ctx.lineTo(gopX - 8, gopY);
    ctx.lineTo(gopX + 8, gopY);
    ctx.lineTo(gopX + 16, gopY + 45);
    ctx.closePath();
    ctx.fill();
    // Gold kalasam finials
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(gopX, gopY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Festival Banners & Lanterns (Reflects 'festival' state)
    if (this.townState.festival === 'grand') {
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gopX - 35, gopY + 25);
      ctx.lineTo(gopX + 35, gopY + 25);
      ctx.stroke();
      // Glowing festival lamps in town
      ctx.fillStyle = '#fbe9d0';
      for (let lx = wx + 60; lx < wx + ww - 40; lx += 26) {
        ctx.beginPath();
        ctx.arc(lx, wy + 135 + (lx % 12), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.townState.festival === 'modest') {
      ctx.fillStyle = '#fbe9d0';
      ctx.beginPath();
      ctx.arc(gopX - 12, gopY + 28, 2, 0, Math.PI * 2);
      ctx.arc(gopX + 12, gopY + 28, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Granaries & Carts (Reflects 'granary' state)
    const granaryX = wx + ww * 0.22;
    const granaryY = wy + 120;
    ctx.fillStyle = '#54261d';
    ctx.fillRect(granaryX - 14, granaryY, 28, 20);
    // Roof
    ctx.fillStyle = '#855e3c';
    ctx.beginPath();
    ctx.moveTo(granaryX - 18, granaryY);
    ctx.lineTo(granaryX, granaryY - 8);
    ctx.lineTo(granaryX + 18, granaryY);
    ctx.closePath();
    ctx.fill();

    if (this.townState.granary === 'abundant') {
      // Golden grain carts parked outside
      ctx.fillStyle = '#f4c760';
      ctx.fillRect(granaryX + 18, granaryY + 8, 8, 5);
      ctx.fillRect(granaryX - 26, granaryY + 8, 8, 5);
    }

    if (!isPanoramic) {
      ctx.restore();
    }

    // Carved Granite Window Frame & Arch
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx, wy + 40);
    ctx.arc(wx + ww / 2, wy + 40, ww / 2, Math.PI, 0);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.closePath();
    ctx.stroke();

    // Window sill
    ctx.fillStyle = '#3e241d';
    ctx.fillRect(wx - 10, wy + wh - 4, ww + 20, 10);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx - 10, wy + wh - 4, ww + 20, 10);

    // Toggle View Hint
    ctx.font = '9.5px "Calibri", sans-serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK WINDOW OR PRESS [V] TO INSPECT TOWN', wx + ww / 2, wy + wh + 16);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 3. CURRENT DECISION DIALOGUE & ADVISOR COUNSEL
  // -------------------------------------------------------------------------
  renderDecisionPanel(ctx, w, h) {
    const dec = this.decisions[this.currentTurn];
    if (!dec) return;
    ctx.save();

    // Header Badge: Turn & Season
    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`STATECRAFT COUNCIL • DECISION ${this.currentTurn + 1} OF ${this.totalTurns} (${dec.season.toUpperCase()})`, 85, 20);

    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText(dec.title, 85, 38);

    // Advisor Dialogue Box (Upper Right)
    const advX = 560;
    const advY = 55;
    const advW = 165;
    const advH = 175;

    ctx.fillStyle = 'rgba(46, 31, 27, 0.92)';
    ctx.fillRect(advX, advY, advW, advH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(advX, advY, advW, advH);

    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText(dec.advisor.name.toUpperCase(), advX + advW / 2, advY + 16);

    ctx.font = 'italic 8.5px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText(dec.advisor.title, advX + advW / 2, advY + 28);

    ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(advX + 15, advY + 34);
    ctx.lineTo(advX + advW - 15, advY + 34);
    ctx.stroke();

    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'left';
    this.wrapText(ctx, dec.advisor.counsel, advX + 10, advY + 48, advW - 20, 14);

    // 3 Option Cards (Middle row)
    const cardY = 245;
    const cardH = 58;
    const cardW = 205;
    const startX = 85;

    dec.options.forEach((opt, idx) => {
      const cx = startX + idx * 220;
      const isHovered = (idx === this.hoveredOptionIndex);

      ctx.fillStyle = isHovered ? 'rgba(74, 38, 29, 0.96)' : 'rgba(46, 31, 27, 0.88)';
      ctx.fillRect(cx, cardY, cardW, cardH);
      ctx.strokeStyle = isHovered ? '#D9A441' : '#6b4129';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(cx, cardY, cardW, cardH);

      // Key badge
      ctx.fillStyle = isHovered ? '#D9A441' : '#3e241d';
      ctx.fillRect(cx + 6, cardY + 6, 18, 16);
      ctx.font = 'bold 10px "Calibri", sans-serif';
      ctx.fillStyle = isHovered ? '#2E1F1B' : '#f4e5d2';
      ctx.textAlign = 'center';
      ctx.fillText(opt.key, cx + 15, cardY + 18);

      // Option label
      ctx.font = 'bold 10px "Cambria", serif';
      ctx.fillStyle = '#f4e5d2';
      ctx.textAlign = 'left';
      this.wrapText(ctx, opt.label, cx + 28, cardY + 16, cardW - 34, 12);

      // Cost & Delta tag
      ctx.font = 'bold 9px "Calibri", sans-serif';
      ctx.fillStyle = '#D9A441';
      ctx.fillText(opt.costDesc, cx + 10, cardY + cardH - 8);
    });

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 4. LOW TEAK COUNCIL TABLE WITH PHYSICAL OBJECTS
  // -------------------------------------------------------------------------
  renderCouncilTableAndResources(ctx, w, h) {
    const tbl = this.table;
    ctx.save();

    // Table shadow
    ctx.fillStyle = 'rgba(16, 10, 8, 0.7)';
    ctx.beginPath();
    ctx.ellipse(w / 2, tbl.y + tbl.h, tbl.w * 0.52, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teak Table Top
    const teakGrad = ctx.createLinearGradient(tbl.x, tbl.y, tbl.x, tbl.y + tbl.h);
    teakGrad.addColorStop(0, '#5a341b');
    teakGrad.addColorStop(0.5, '#7a4726');
    teakGrad.addColorStop(1, '#3c2010');
    ctx.fillStyle = teakGrad;
    ctx.beginPath();
    ctx.roundRect(tbl.x, tbl.y, tbl.w, tbl.h, [14, 14, 4, 4]);
    ctx.fill();

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Table Woodgrain Lines
    ctx.strokeStyle = 'rgba(46, 25, 12, 0.4)';
    ctx.lineWidth = 1;
    for (let ly = tbl.y + 18; ly < tbl.y + tbl.h; ly += 22) {
      ctx.beginPath();
      ctx.moveTo(tbl.x + 10, ly);
      ctx.lineTo(tbl.x + tbl.w - 10, ly);
      ctx.stroke();
    }

    // Table Label Header (Diegetic Inlaid Brass)
    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('— ROYAL COUNCIL MANAGEMENT TABLE OF SIVAGANGA FORT —', w / 2, tbl.y + 18);

    // =========================================================================
    // PHYSICAL OBJECT 1: WOVEN GRAIN BASKETS (LEFT)
    // =========================================================================
    this.renderPhysicalGrainBaskets(ctx, 210, 395, this.displayGrainRatio);

    // =========================================================================
    // PHYSICAL OBJECT 2: GOLD COIN STACKS (CENTER)
    // =========================================================================
    this.renderPhysicalGoldStacks(ctx, 385, 395, this.displayGoldRatio);

    // =========================================================================
    // PHYSICAL OBJECT 3: WOVEN LOYALTY GARLAND (RIGHT)
    // =========================================================================
    this.renderPhysicalLoyaltyGarland(ctx, 560, 395, this.displayTrustRatio);

    // =========================================================================
    // DIEGETIC OIL DIYA LAMP (TABLE EDGE)
    // =========================================================================
    this.renderTableDiyaLamp(ctx, tbl.x + 40, tbl.y + 75);

    ctx.restore();
  }

  renderPhysicalGrainBaskets(ctx, cx, cy, fillRatio) {
    ctx.save();

    // 3 Overlapping Woven Baskets
    const basketDefs = [
      { ox: -35, oy: 5, rx: 32, ry: 16, h: 36 },
      { ox: 30, oy: -8, rx: 28, ry: 14, h: 32 },
      { ox: 0, oy: 12, rx: 34, ry: 18, h: 38 }
    ];

    basketDefs.forEach((b) => {
      const bx = cx + b.ox;
      const by = cy + b.oy;

      // Basket body (terracotta woven bamboo)
      ctx.fillStyle = '#85512b';
      ctx.beginPath();
      ctx.ellipse(bx, by, b.rx, b.ry, 0, 0, Math.PI);
      ctx.lineTo(bx - b.rx, by - b.h * 0.4);
      ctx.ellipse(bx, by - b.h * 0.4, b.rx, b.ry, 0, Math.PI, 0);
      ctx.lineTo(bx + b.rx, by);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#542d13';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Filled Paddy Grain Mound (Height depends dynamically on fillRatio)
      const moundH = b.h * 0.8 * fillRatio;
      ctx.fillStyle = '#f4c760'; // Golden paddy grain
      ctx.beginPath();
      ctx.ellipse(bx, by - moundH * 0.4, b.rx * 0.9, b.ry * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Grain Texture Specks
      ctx.fillStyle = '#d49b28';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(bx - 12 + i * 4, by - moundH * 0.4 - 2 + (i % 3), 2, 2);
      }

      // Woven Basket Rim
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(bx, by - b.h * 0.4, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Label below
    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';
    const grainVal = window.sivagangaSave?.state?.resources?.grain || 300;
    ctx.fillText(`GRAIN HARVEST BASKETS`, cx, cy + 42);
    ctx.font = 'italic 9px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText(`(${grainVal} Kalams of Paddy)`, cx, cy + 54);

    ctx.restore();
  }

  renderPhysicalGoldStacks(ctx, cx, cy, goldRatio) {
    ctx.save();

    // 4 Columns of Gold Varahan Coins
    const stackDefs = [
      { ox: -28, oy: 0, coins: Math.max(2, Math.floor(goldRatio * 10)) },
      { ox: -9, oy: -10, coins: Math.max(3, Math.floor(goldRatio * 14)) },
      { ox: 10, oy: 6, coins: Math.max(2, Math.floor(goldRatio * 12)) },
      { ox: 28, oy: -4, coins: Math.max(1, Math.floor(goldRatio * 8)) }
    ];

    stackDefs.forEach(s => {
      const sx = cx + s.ox;
      const sy = cy + s.oy;
      const coinH = 4;

      for (let c = 0; c < s.coins; c++) {
        const coinY = sy - c * coinH;

        // Coin rim
        ctx.fillStyle = (c % 2 === 0) ? '#D9A441' : '#f5c542';
        ctx.beginPath();
        ctx.ellipse(sx, coinY, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b5832a';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Top coin face embossed with royal boar/lotus crest
      const topY = sy - (s.coins - 1) * coinH;
      ctx.fillStyle = '#fbe9d0';
      ctx.beginPath();
      ctx.ellipse(sx, topY, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b5832a';
      ctx.beginPath();
      ctx.arc(sx, topY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Label below
    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';
    const goldVal = window.sivagangaSave?.state?.resources?.gold || 150;
    ctx.fillText(`GOLD VARAHAN COINS`, cx, cy + 42);
    ctx.font = 'italic 9px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText(`(${goldVal} Gold Varahans)`, cx, cy + 54);

    ctx.restore();
  }

  renderPhysicalLoyaltyGarland(ctx, cx, cy, trustRatio) {
    ctx.save();

    // Number of floral clusters based on trustRatio (1 to 5)
    const totalBeads = Math.max(3, Math.min(11, Math.floor(trustRatio * 11)));
    const garlandRadiusX = 55 * trustRatio;
    const garlandRadiusY = 22 * trustRatio;

    // Silk thread cord
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, garlandRadiusX, garlandRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Alternating Jasmine & Marigold Blossoms
    for (let i = 0; i < totalBeads; i++) {
      const angle = (i / totalBeads) * Math.PI * 2;
      const bx = cx + Math.cos(angle) * garlandRadiusX;
      const by = cy + Math.sin(angle) * garlandRadiusY;

      const isMarigold = (i % 2 === 0);
      ctx.fillStyle = isMarigold ? '#e07b22' : '#fdfbf7';
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();

      // Flower center
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden glow halo if loyalty is high (>= 4)
    if (trustRatio >= 0.7) {
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, garlandRadiusX + 6, garlandRadiusY + 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label below
    ctx.font = 'bold 10px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';
    const trustVal = window.sivagangaSave?.state?.resources?.trust || 3;
    ctx.fillText(`PUBLIC LOYALTY GARLAND`, cx, cy + 42);
    ctx.font = 'italic 9px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText(`(${trustVal} / 5 Royal Civic Trust)`, cx, cy + 54);

    ctx.restore();
  }

  renderTableDiyaLamp(ctx, x, y) {
    ctx.save();
    // Brass oil reservoir cup
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b5832a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spout
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 6);
    ctx.lineTo(x + 18, y + 2);
    ctx.stroke();

    // Flickering Golden Flame
    const flk = this.diyaLamp.flamePhase;
    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.ellipse(x + 18, y - 2 + flk, 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.ellipse(x + 18, y - 1 + flk, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 5. PANORAMIC TOWN VIEW (FULL WINDOW ZOOM INSPECTION)
  // -------------------------------------------------------------------------
  renderPanoramicTownView(ctx, w, h) {
    ctx.save();
    // Render full-screen window view of Sivaganga Fort & Town
    this.renderArchedWindowView(ctx, 0, 0, w, h, true);

    // Decorative Header Plaque
    ctx.fillStyle = 'rgba(46, 31, 27, 0.9)';
    ctx.fillRect(w / 2 - 200, 20, 400, 50);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 200, 20, 400, 50);

    ctx.font = 'bold 14px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('SIVAGANGA FORT & TOWN PANORAMA', w / 2, 40);

    ctx.font = '11px "Calibri", sans-serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText('Consequences of Royal Statecraft Across the Realm', w / 2, 56);

    // Consequence Status Badges along Bottom
    const badgeW = 165;
    const badgeH = 50;
    const badges = [
      { title: 'IRRIGATION', val: this.townState.irrigation.toUpperCase(), color: this.townState.irrigation === 'lush' ? '#5fa360' : '#d49b28' },
      { title: 'FESTIVAL', val: this.townState.festival.toUpperCase(), color: this.townState.festival === 'grand' ? '#D9A441' : '#A7BEAE' },
      { title: 'GRANARY', val: this.townState.granary.toUpperCase(), color: this.townState.granary === 'abundant' ? '#f4c760' : '#855e3c' },
      { title: 'DEFENSES', val: this.townState.defenses.toUpperCase(), color: this.townState.defenses === 'fortified' ? '#B85042' : '#947565' }
    ];

    badges.forEach((b, i) => {
      const bx = 65 + i * 175;
      const by = h - 75;
      ctx.fillStyle = 'rgba(28, 18, 15, 0.92)';
      ctx.fillRect(bx, by, badgeW, badgeH);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, badgeW, badgeH);

      ctx.font = 'bold 9.5px "Calibri", sans-serif';
      ctx.fillStyle = '#D9A441';
      ctx.textAlign = 'center';
      ctx.fillText(b.title, bx + badgeW / 2, by + 18);

      ctx.font = 'bold 12px "Cambria", serif';
      ctx.fillStyle = b.color;
      ctx.fillText(b.val, bx + badgeW / 2, by + 36);
    });

    // Toggle Back prompt
    ctx.font = 'bold 11px "Calibri", sans-serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS [V] OR CLICK ANYWHERE TO RETURN TO COUNCIL TABLE', w / 2, h - 12);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 6. PARTICLES RENDERING
  // -------------------------------------------------------------------------
  renderParticles(ctx) {
    ctx.save();
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 7. BOTTOM GUIDE & FEEDBACK TOAST
  // -------------------------------------------------------------------------
  renderBottomGuideAndFeedback(ctx, w, h) {
    ctx.save();

    // Feedback Toast (Top Center)
    if (this.feedbackText) {
      ctx.font = 'bold 12.5px "Cambria", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.feedbackColor;
      ctx.fillText(this.feedbackText, w / 2, 235);
    }

    // Action Controls Guide (Bottom Bar)
    ctx.fillStyle = 'rgba(22, 13, 11, 0.9)';
    ctx.fillRect(0, h - 24, w, 24);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, h - 24, w, 24);

    ctx.font = '11px "Calibri", sans-serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.textAlign = 'center';
    ctx.fillText('CONTROLS: [1 / 2 / 3] Select Decision  •  [Hover] Preview Physical Objects  •  [V] Inspect Sivaganga Town View', w / 2, h - 8);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 8. FINALE OVERLAY (LEVEL 6 RESOLUTION)
  // -------------------------------------------------------------------------
  renderFinaleOverlay(ctx, w, h) {
    ctx.save();

    ctx.fillStyle = 'rgba(22, 13, 11, 0.88)';
    ctx.fillRect(0, 0, w, h);

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
    ctx.fillText('THE SOVEREIGN REIGN OF SIVAGANGA', w / 2, modalY + 38);

    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Level 6: Queen of Sivaganga — Statecraft Mastered', w / 2, modalY + 58);

    // Divider
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 130, modalY + 70);
    ctx.lineTo(w / 2 + 130, modalY + 70);
    ctx.stroke();

    // Royal Commendation from King Muthuvaduganatha
    ctx.font = 'bold 12px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText('KING MUTHUVADUGANATHA\'S COMMENDATION:', w / 2, modalY + 95);

    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    const speech = [
      '"Rani Velu. In swordsmanship you are peerless; but today on the council table',
      'you have proven yourself the true mother and guardian of Sivaganga.',
      'Our granaries are guarded, our irrigation flows true, and our people stand united."'
    ];
    speech.forEach((s, idx) => {
      ctx.fillText(s, w / 2, modalY + 118 + idx * 19);
    });

    // Summary of Realm Status
    ctx.font = '11px "Cambria", serif';
    ctx.fillStyle = '#e8dcc8';
    const lines = [
      `Irrigation Sluices: ${this.townState.irrigation.toUpperCase()}  •  Harvest Festival: ${this.townState.festival.toUpperCase()}`,
      `Famine Granaries: ${this.townState.granary.toUpperCase()}  •  Fort Ramparts: ${this.townState.defenses.toUpperCase()}`,
      '',
      'The years of peace and agrarian flourishing endure across the Tamil country...',
      'Until the British East India Company turns its covetous gaze upon Kalaiyar Kovil.'
    ];
    lines.forEach((l, idx) => {
      ctx.fillText(l, w / 2, modalY + 185 + idx * 18);
    });

    // Call-to-action button
    const btnX = w / 2 - 160;
    const btnY = modalY + modalH - 58;
    const btnW = 320;
    const btnH = 40;

    ctx.fillStyle = '#B85042'; // BG-TERRACOTTA
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.font = 'bold 13.5px "Cambria", serif';
    ctx.fillStyle = '#fdfbf7';
    ctx.fillText('ADVANCE TO LEVEL 7: THE COMPANY\'S SHADOW  [ENTER / SPACE]', w / 2, btnY + 25);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // INTRO OVERLAY — explains the mechanic on first entry
  // -------------------------------------------------------------------------
  renderIntroOverlay(ctx, w, h) {
    ctx.save();

    // Dim background
    ctx.fillStyle = 'rgba(14, 8, 6, 0.90)';
    ctx.fillRect(0, 0, w, h);

    // Card
    const cx = w * 0.1;
    const cy = h * 0.08;
    const cw = w * 0.8;
    const ch = h * 0.84;

    ctx.fillStyle = '#2E1F1B';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 8);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = 'rgba(217,164,65,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 6, cy + 6, cw - 12, ch - 12);

    // Chapter tag
    ctx.font = 'bold 10px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.textAlign = 'center';
    ctx.fillText('CHAPTER II · THE SOVEREIGN REIGN (1746–1772)', w / 2, cy + 26);

    // Title
    ctx.font = 'bold 22px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText('Trial VI: Queen of Sivaganga', w / 2, cy + 58);

    ctx.font = 'italic 13px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Statecraft · Village-Economy Management', w / 2, cy + 80);

    // Divider
    ctx.strokeStyle = 'rgba(217,164,65,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy + 95);
    ctx.lineTo(cx + cw - 40, cy + 95);
    ctx.stroke();

    // Story context
    ctx.font = '13.5px "Cambria", serif';
    ctx.fillStyle = '#eeddc8';
    ctx.textAlign = 'center';
    const story = [
      'It is 1746. Velu Nachiyar is now Queen Consort of Sivaganga,',
      'ruling alongside King Muthuvaduganatha Periyavudaya Thevar.',
      'You must guide the kingdom through four seasons of statecraft:',
      'managing grain, gold, and the loyalty of your people.'
    ];
    story.forEach((line, i) => ctx.fillText(line, w / 2, cy + 122 + i * 20));

    // HOW TO PLAY section
    ctx.font = 'bold 11px "Calibri", sans-serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText('HOW TO PLAY', w / 2, cy + 210);

    const tips = [
      ['📜  Four Seasonal Decisions', 'Spring · Summer · Autumn · Winter. Each season presents a governing crisis.'],
      ['🏛  Three Choices', 'Press [1], [2] or [3] — or click a card — to choose your policy.'],
      ['🌾  Watch the Table', 'Grain baskets, gold stacks and the loyalty garland change with each decision.'],
      ['🪟  See the Town', 'Press [V] or click the arched window to inspect how Sivaganga responds.']
    ];

    tips.forEach(([title, desc], i) => {
      const ty = cy + 235 + i * 38;
      ctx.font = 'bold 12px "Cambria", serif';
      ctx.fillStyle = '#f4e5d2';
      ctx.textAlign = 'center';
      ctx.fillText(title, w / 2, ty);
      ctx.font = '11.5px "Cambria", serif';
      ctx.fillStyle = '#b09070';
      ctx.fillText(desc, w / 2, ty + 17);
    });

    // CTA button
    const btnW = 280;
    const btnH = 38;
    const btnX = w / 2 - btnW / 2;
    const btnY = cy + ch - 58;

    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 5);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 13px "Cambria", serif';
    ctx.fillStyle = '#fdfbf7';
    ctx.textAlign = 'center';
    ctx.fillText('BEGIN COUNCIL  [ANY KEY / CLICK]', w / 2, btnY + 24);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // TURN PROGRESS BAR — 4 seasonal pips across the top
  // -------------------------------------------------------------------------
  renderTurnProgressBar(ctx, w, h) {
    ctx.save();

    const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const pipW = 140;
    const pipH = 22;
    const gap = 12;
    const totalW = seasons.length * pipW + (seasons.length - 1) * gap;
    const startX = (w - totalW) / 2;
    const barY = h - 50;

    seasons.forEach((season, i) => {
      const px = startX + i * (pipW + gap);
      const done = i < this.currentTurn;
      const current = i === this.currentTurn;

      ctx.fillStyle = done ? '#3a2018' : current ? '#54261d' : '#1a0e0b';
      ctx.beginPath();
      ctx.roundRect(px, barY, pipW, pipH, 4);
      ctx.fill();

      ctx.strokeStyle = done ? '#D9A441' : current ? '#B85042' : 'rgba(217,164,65,0.2)';
      ctx.lineWidth = current ? 2 : 1;
      ctx.stroke();

      ctx.font = `${current ? 'bold ' : ''}10px "Calibri", sans-serif`;
      ctx.fillStyle = done ? '#D9A441' : current ? '#fdfbf7' : '#6b4129';
      ctx.textAlign = 'center';
      ctx.fillText((done ? '✓ ' : current ? '▶ ' : '') + season.toUpperCase(), px + pipW / 2, barY + 14);
    });

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
}

// Global Level 6 Singleton Instance
window.sivagangaQueenOfSivaganga = new SivagangaLevel6QueenOfSivaganga();
