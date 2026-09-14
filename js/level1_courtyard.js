/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 1: "THE ONLY CHILD"
 * Free-roam Ramanathapuram Palace Courtyard (1740s).
 * Young Velu Nachiyar explores the fort-palace grounds, meeting her three mentors:
 * 1. Veera Maravar (Master Silambam & Weapons Tutor)
 * 2. Periya Pandithar (Court Scribe & Royal Scholar)
 * 3. Meignana Karuppan (Master of Shadows & Water Acoustics)
 * Features idle NPC animations, smooth walk/run, debounced interaction sigils,
 * sunlit granite ramparts, archery range, scribes' mandapam, and stepped kalyani.
 */

class SivagangaLevel1Courtyard {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.animationId = null;

    // Young Velu Nachiyar (Child avatar)
    this.player = {
      x: 360,
      y: 280,
      radius: 14,
      speed: 2.8,
      isRunning: false,
      facing: 'down',
      walkFrame: 0,
      stepTimer: 0
    };

    // Keyboard state
    this.keys = {
      up: false, down: false, left: false, right: false,
      run: false, interact: false
    };

    // Mentors & Interactable Objects (Preloaded before first frame)
    this.mentors = [
      {
        id: 'weapons_master',
        name: 'Master Veera Maravar',
        title: 'Weapons Master of Ramnad',
        role: 'Silambam & Valari Mentor',
        x: 180,
        y: 190,
        radius: 20,
        visited: false,
        idlePhase: 0,
        dialogue: [
          'Greetings, young Princess Velu! Your royal father, King Chellamuthu, gave strict orders: you are the only child of the Sethupathy throne, so you must learn every weapon of war.',
          'Behold the Valari—this curved iron throwing sickle flies true like the crescent moon. And this rattan Silambam staff will teach you poise and footwork. Practice well, young queen!'
        ]
      },
      {
        id: 'royal_scholar',
        name: 'Periya Pandithar',
        title: 'Court Royal Scribe',
        role: 'Diplomacy & Languages Mentor',
        x: 600,
        y: 170,
        radius: 20,
        visited: false,
        idlePhase: 0.8,
        dialogue: [
          'Ah, our quick-witted pupil! You already read classical Tamil and Sanskrit with grace. Now you must master the tongues of the wider world: Urdu, Persian, French, and English.',
          'True sovereignty is not won by the sword alone, Velu Nachiyar. It is preserved through treaty dispatches, cipher ledgers, and understanding your adversary\'s mind.'
        ]
      },
      {
        id: 'shadow_scout',
        name: 'Meignana Karuppan',
        title: 'Master of Shadows & Trackers',
        role: 'Stealth & Acoustics Mentor',
        x: 670,
        y: 350,
        radius: 20,
        visited: false,
        idlePhase: 1.6,
        dialogue: [
          'Watch the stepped water of the Kalyani tank, young Rani. Cast a tiny stone into the ripples—the sound echoes against the granite ghats, confusing any sentry.',
          'Remember: light reveals your crown, but shadow shields your intent. When you step beneath the banyans, make no more noise than the falling leaf.'
        ]
      }
    ];

    // Other interactable props
    this.props = [
      {
        id: 'weapon_rack',
        name: 'Practice Weapon Rack',
        x: 120,
        y: 200,
        radius: 24,
        sigil: 'valari',
        text: 'Polished rattan Silambam staves and forged iron Valari boomerangs stand racked against the sandstone rampart.'
      },
      {
        id: 'archery_butts',
        name: 'Royal Archery Range',
        x: 130,
        y: 330,
        radius: 24,
        sigil: 'target',
        text: 'Straw archery targets pierced with practice arrows. King Chellamuthu personally supervised your marksmanship here.'
      },
      {
        id: 'kalyani_ghat',
        name: 'Stepped Temple Tank (Kalyani)',
        x: 710,
        y: 380,
        radius: 26,
        sigil: 'ripple',
        text: 'Sacred water of the temple tank. The stepped granite ghats mirror the azure sky above.'
      },
      {
        id: 'palace_gate',
        name: 'Grand Courtyard Gate',
        x: 360,
        y: 440,
        radius: 30,
        sigil: 'gate',
        text: 'The great teak gates leading into the Ramanathapuram throne room and the kingdom beyond.'
      },
      {
        id: 'hidden_pathway',
        name: 'Secret Fort Archway (Hidden Pathway)',
        x: 740,
        y: 160,
        radius: 32,
        sigil: 'hidden_arch',
        isSecretPathway: true,
        text: 'An ancient recessed granite archway hidden behind night-blooming jasmine vines. A warm golden torch-glow and the faint rhythmic cadence of the fort drummer\'s Murasu pulse from the passage within, leading directly into Master Veera Maravar\'s martial training courtyard.'
      }
    ];

    // Ambient NPCs to make the fort feel lived-in
    this.ambientNpcs = [
      { x: 120, y: 110, type: 'guard_rampart', walkRange: 80, currentX: 120, dir: 1 },
      { x: 380, y: 105, type: 'guard_rampart', walkRange: 90, currentX: 380, dir: -1 },
      { x: 640, y: 110, type: 'scribe_assistant', currentX: 640, currentY: 110, idleTimer: 0 },
      { x: 260, y: 390, type: 'stable_keeper', currentX: 260, currentY: 390, idleTimer: 0 }
    ];

    // Interaction debounce lock to prevent double triggering
    this.isInteracting = false;
    this.lastInteractTime = 0;
    this.focusedEntity = null;

    // Progress in Level 1
    this.mentorsConferred = {
      weapons_master: false,
      royal_scholar: false,
      shadow_scout: false
    };

    // Level Flow & Martial Awakening Waypoint
    this.trainingYardUnlocked = false;
    this.flowPromptBanner = null;
    this.flowBridgeOverlay = null;

    // Bounds of the fort courtyard
    this.bounds = {
      minX: 70,
      maxX: 755,
      minY: 130,
      maxY: 430
    };
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bindInputs();
    this.preloadAssets();
  }

  preloadAssets() {
    // Ensure all mentors, props, and animations are warm and pre-calculated
    this.mentors.forEach(m => { m.idlePhase = Math.random() * Math.PI; });
    this.ambientNpcs.forEach(n => { n.idleTimer = Math.random() * 10; });
  }

  start() {
    this.isActive = true;
    this.player.x = 360;
    this.player.y = 280;
    this.isInteracting = false;
    this.isTransitioning = false;
    this.trainingYardUnlocked = false;
    this.mentorsConferred = {
      weapons_master: false,
      royal_scholar: false,
      shadow_scout: false
    };

    // Remove any leftover flow banner or overlay
    this.cleanupFlowUI();

    // Diegetic HUD: Ensure oil lamp burns steady and gold
    window.sivagangaSave.state.resources.morale = 100;
    window.sivagangaHUD.updateDiyaMorale(100);

    // Show initial welcome plaque (auto-dismisses after 3.5s to keep canvas view unobstructed)
    window.sivagangaGameplay.showDialogue(
      'King Chellamuthu Sethupathy',
      'Walk freely through our Ramanathapuram fort, my daughter. Meet your tutors and discover the secret training pathway carved beneath the eastern ramparts.'
    );
    setTimeout(() => {
      const diag = document.getElementById('level-dialogue-box');
      if (diag && !this.isInteracting) {
        diag.style.display = 'none';
      }
    }, 3500);

    this.showCourtyardFlowBanner();
    this.startLoop();
  }

  stop() {
    this.isActive = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.cleanupFlowUI();
  }

  cleanupFlowUI() {
    const banner = document.getElementById('courtyard-flow-banner');
    if (banner) banner.remove();
    const bridge = document.getElementById('level-flow-bridge');
    if (bridge) bridge.remove();
    const overlay = document.getElementById('level-puzzle-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      if (this.isInteracting) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          this.closeDialogue();
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      if (e.key === 'Shift') this.player.isRunning = true;

      if (e.key === 'h' || e.key === 'H' || e.code === 'KeyH' || e.key === 'F1') {
        e.preventDefault();
        if (window.sivagangaGameplay) {
          window.sivagangaGameplay.toggleLoreModal();
        }
        return;
      }

      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.attemptInteract();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActive) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      if (e.key === 'Shift') this.player.isRunning = false;
    });

    // Touch / Click on canvas to move or interact
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        if (!this.isActive) return;
        if (this.isInteracting) {
          this.closeDialogue();
          return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if clicked directly on an interactable mentor or prop
        const targetEntity = this.findClosestEntity(clickX, clickY, 36);
        if (targetEntity) {
          const distToPlayer = Math.hypot(this.player.x - targetEntity.x, this.player.y - targetEntity.y);
          if (distToPlayer <= 70) {
            this.interactWith(targetEntity);
            return;
          }
        }

        // Otherwise, move player towards click
        this.player.targetMoveX = clickX;
        this.player.targetMoveY = clickY;
      });
    }
  }

  startLoop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const loop = () => {
      if (!this.isActive) return;
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  update() {
    if (this.isInteracting) return;

    // Movement calculation
    let vx = 0;
    let vy = 0;

    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;
    if (this.keys.up) vy -= 1;
    if (this.keys.down) vy += 1;

    // Click-to-move interpolation
    if (this.player.targetMoveX !== undefined && this.player.targetMoveY !== undefined) {
      const dx = this.player.targetMoveX - this.player.x;
      const dy = this.player.targetMoveY - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) {
        vx = dx / dist;
        vy = dy / dist;
      } else {
        delete this.player.targetMoveX;
        delete this.player.targetMoveY;
      }
    }

    if (vx !== 0 || vy !== 0) {
      // Normalize diagonal speed
      const len = Math.hypot(vx, vy);
      const currentSpeed = this.player.isRunning ? this.player.speed * 1.8 : this.player.speed;
      const moveX = (vx / len) * currentSpeed;
      const moveY = (vy / len) * currentSpeed;

      // Update facing
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.player.facing = vy > 0 ? 'down' : 'up';
      }

      // Apply with boundary clamp
      this.player.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.player.x + moveX));
      this.player.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.player.y + moveY));

      // Walk cycle animation
      this.player.stepTimer++;
      if (this.player.stepTimer % 8 === 0) {
        this.player.walkFrame = (this.player.walkFrame + 1) % 4;
        if (this.player.stepTimer % 16 === 0) {
          window.sivagangaAudio.playFocusPing();
        }
      }
    }

    // Update ambient NPC animations
    this.ambientNpcs.forEach(npc => {
      if (npc.type === 'guard_rampart') {
        npc.currentX += npc.dir * 0.4;
        if (Math.abs(npc.currentX - npc.x) > npc.walkRange) {
          npc.dir *= -1;
        }
      }
    });

    // Proximity check for interaction sigil halo & chime
    const nearby = this.findClosestEntity(this.player.x, this.player.y, 65);
    if (nearby !== this.focusedEntity) {
      this.focusedEntity = nearby;
      if (nearby) {
        window.sivagangaAudio.playFocusPing();
      }
    }

    // Step-through trigger for secret archway (Hollow Knight / Silksong style)
    const distToSecret = Math.hypot(this.player.x - 740, this.player.y - 160);
    if (distToSecret < 28 && !this.isTransitioning && !this.isInteracting) {
      this.transitionToLevel2();
      return;
    }
  }

  findClosestEntity(x, y, maxDist) {
    let closest = null;
    let minDist = maxDist;

    const allEntities = [...this.mentors, ...this.props];
    for (let ent of allEntities) {
      const dist = Math.hypot(ent.x - x, ent.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = ent;
      }
    }
    return closest;
  }

  attemptInteract() {
    const now = Date.now();
    if (now - this.lastInteractTime < 400) return; // Debounce guard
    this.lastInteractTime = now;

    if (!this.focusedEntity) return;
    this.interactWith(this.focusedEntity);
  }

  interactWith(entity) {
    if (this.isInteracting || this.isTransitioning) return;

    if (entity.id === 'hidden_pathway') {
      this.transitionToLevel2();
      return;
    }

    this.isInteracting = true;
    window.sivagangaAudio.playResolveBell();

    if (entity.dialogue) {
      // Mentor Dialogue
      this.mentorsConferred[entity.id] = true;
      entity.visited = true;

      const overlay = document.getElementById('level-puzzle-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <div class="mentor-dialogue-card" style="background: rgba(36, 22, 18, 0.98); border: 2.5px solid var(--accent-gold); border-radius: 8px; padding: 26px 32px; max-width: 580px; box-shadow: 0 12px 36px rgba(0,0,0,0.9);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #5a382e 0%, #261612 100%); border: 2px solid var(--accent-gold); display: flex; align-items: center; justify-content: center; color: var(--accent-gold-bright); font-size: 20px;">𑁍</div>
              <div>
                <h3 style="color: var(--accent-gold); font-size: 20px; font-family: var(--font-serif); margin-bottom: 2px;">${entity.name}</h3>
                <div style="color: var(--accent-sage); font-size: 13px; font-family: var(--font-serif); letter-spacing: 1px;">${entity.title} — ${entity.role}</div>
              </div>
            </div>
            <div id="mentor-text-body" style="font-family: var(--font-serif); font-size: 15.5px; line-height: 1.65; color: #f4e8db; margin-bottom: 22px;">
              ${entity.dialogue[0]}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--accent-sage);">Mentorship Confirmed</span>
              <button id="dialogue-continue-btn" class="btn-tamil btn-primary" style="padding: 8px 24px;">Conclude Counsel</button>
            </div>
          </div>
        `;

        const btn = document.getElementById('dialogue-continue-btn');
        let step = 0;
        btn.onclick = () => {
          step++;
          if (step < entity.dialogue.length) {
            document.getElementById('mentor-text-body').textContent = entity.dialogue[step];
          } else {
            this.closeDialogue();
            this.showCourtyardFlowBanner();
            this.checkCompletion();
          }
        };
      }
    } else {
      // Prop inspection
      const overlay = document.getElementById('level-puzzle-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        if (entity.id === 'weapon_rack' && this.trainingYardUnlocked) {
          overlay.innerHTML = `
            <div style="background: rgba(36, 22, 18, 0.98); border: 2.5px solid var(--accent-gold); border-radius: 10px; padding: 26px 30px; max-width: 550px; text-align: center; box-shadow: 0 16px 40px rgba(0,0,0,0.95);">
              <div style="font-family: var(--font-serif); font-size: 12px; letter-spacing: 2px; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 6px;">TRAINING WAYPOINT READY</div>
              <h3 style="color: #fff2db; font-size: 21px; font-family: var(--font-serif); margin-bottom: 12px;">Practice Weapon Rack</h3>
              <p style="font-size: 15px; line-height: 1.65; color: #eeddcc; margin-bottom: 22px;">
                You have received counsel from all three royal tutors. Your rattan Silambam staff and iron Valari throwing weapons are primed for the martial training courtyard.
              </p>
              <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                <button id="prop-stay-btn" class="btn-tamil">Stay in Courtyard</button>
                <button id="prop-step-lvl2-btn" class="btn-tamil btn-primary">Step to Training Courtyard ⚔ &rarr;</button>
              </div>
            </div>
          `;
          document.getElementById('prop-stay-btn').onclick = () => this.closeDialogue();
          document.getElementById('prop-step-lvl2-btn').onclick = () => {
            this.closeDialogue();
            this.transitionToLevel2();
          };
        } else if (entity.id === 'palace_gate' || entity.id === 'weapon_rack') {
          const metCount = Object.values(this.mentorsConferred).filter(Boolean).length;
          overlay.innerHTML = `
            <div style="background: rgba(36, 22, 18, 0.98); border: 2.5px solid var(--accent-gold); border-radius: 10px; padding: 26px 30px; max-width: 550px; text-align: center; box-shadow: 0 16px 40px rgba(0,0,0,0.95);">
              <div style="font-family: var(--font-serif); font-size: 12px; letter-spacing: 2px; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 6px;">WAYPOINT &bull; SIVAGANGA CAMPAIGN</div>
              <h3 style="color: #fff2db; font-size: 21px; font-family: var(--font-serif); margin-bottom: 12px;">${entity.name}</h3>
              <p style="font-size: 15px; line-height: 1.65; color: #eeddcc; margin-bottom: 14px;">${entity.text}</p>
              <p style="font-size: 13.5px; color: var(--accent-sage); font-style: italic; margin-bottom: 22px;">
                Tutors Conferred: ${metCount}/3. You may explore further to complete your schooling, or proceed directly to the martial training courtyard for Level 2 (Valari &amp; Silambam).
              </p>
              <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                <button id="prop-stay-btn" class="btn-tamil">Stay in Courtyard</button>
                <button id="prop-step-lvl2-btn" class="btn-tamil btn-primary">Proceed to Level 2: Valari &amp; Silambam ⚔ &rarr;</button>
              </div>
            </div>
          `;
          document.getElementById('prop-stay-btn').onclick = () => this.closeDialogue();
          document.getElementById('prop-step-lvl2-btn').onclick = () => {
            this.closeDialogue();
            this.transitionToLevel2();
          };
        } else {
          overlay.innerHTML = `
            <div style="background: rgba(36, 22, 18, 0.98); border: 2px solid var(--accent-gold); border-radius: 8px; padding: 24px; max-width: 520px; text-align: center;">
              <h3 style="color: var(--accent-gold); font-size: 18px; margin-bottom: 12px;">${entity.name}</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #eeddcc; margin-bottom: 20px;">${entity.text}</p>
              <button id="prop-close-btn" class="btn-tamil btn-primary" style="margin: 0 auto;">Return to Practice</button>
            </div>
          `;
          document.getElementById('prop-close-btn').onclick = () => {
            this.closeDialogue();
            if (entity.id === 'palace_gate') {
              this.checkCompletion(true);
            }
          };
        }
      }
    }
  }

  closeDialogue() {
    this.isInteracting = false;
    const overlay = document.getElementById('level-puzzle-overlay');
    if (overlay) overlay.style.display = 'none';
    window.sivagangaAudio.playPalmLeafScroll();
  }

  checkCompletion(forceCheck = false) {
    const allMet = this.mentorsConferred.weapons_master &&
      this.mentorsConferred.royal_scholar &&
      this.mentorsConferred.shadow_scout;

    if (allMet) {
      if (!this.trainingYardUnlocked) {
        this.trainingYardUnlocked = true;
        this.presentMartialAwakeningFlow();
      }
    } else if (forceCheck) {
      const remaining = [];
      if (!this.mentorsConferred.weapons_master) remaining.push('Master Veera Maravar');
      if (!this.mentorsConferred.royal_scholar) remaining.push('Periya Pandithar');
      if (!this.mentorsConferred.shadow_scout) remaining.push('Meignana Karuppan');

      window.sivagangaGameplay.showDialogue(
        'Palace Gate Warden',
        `Princess Velu, you have not yet conferred with all three tutors (${3 - remaining.length}/3 complete). Seek counsel with ${remaining.join(' and ')} before embarking into martial drills.`
      );
      setTimeout(() => {
        const diag = document.getElementById('level-dialogue-box');
        if (diag && !this.isInteracting) diag.style.display = 'none';
      }, 3500);
    }
  }

  presentMartialAwakeningFlow() {
    if (window.sivagangaAudio) window.sivagangaAudio.playResolveBell();
    // In-world notification: keep screen clear
    window.sivagangaGameplay.showDialogue(
      'Master Veera Maravar',
      'Princess Velu, your tutelage is accomplished! The secret archway beneath the eastern rampart is now open. Step through the torchlit passage into the martial training courtyard.'
    );
    setTimeout(() => {
      const diag = document.getElementById('level-dialogue-box');
      if (diag && !this.isInteracting) diag.style.display = 'none';
    }, 4500);
  }

  showCourtyardFlowBanner() {
    // In-world hidden pathway only - no external banners or next level menus
    const banner = document.getElementById('courtyard-flow-banner');
    if (banner) banner.remove();
  }

  transitionToLevel2() {
    this.cleanupFlowUI();
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // 1. Audio cues
    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
      window.sivagangaAudio.playPalmLeafScroll();
    }

    // 2. Lock inputs for smooth wipe
    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);

    // 3. Atomic Save: Level 1 completed
    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelComplete(1, { stars: 3, completed: true, tutorsMet: 3 });
      window.sivagangaSave.recordChronicleNode(1);
    }

    // 4. Palm-leaf scroll wipe into Level 2 (Silksong-style seamless room transition)
    window.sivagangaTransitions.wipe(
      () => {
        this.stop();
        if (window.sivagangaRouter) {
          window.sivagangaRouter.navigate('/level/02-valari-silambam', { skipWipe: true });
        } else if (window.sivagangaGameplay) {
          window.sivagangaGameplay.start(2);
        }
      },
      () => {
        if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
        this.isTransitioning = false;
      }
    );
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Ramanathapuram Fort Sandstone Ramparts & Sky
    this.drawFortArchitecture(ctx, w, h);

    // 2. Sandstone Pavement Courtyard
    this.drawCourtyardGround(ctx, w, h);

    // 3. Stepped Temple Tank (Kalyani) in Background
    this.drawKalyaniTank(ctx, 670, 370);

    // 4. Pillared Mandapam Scribes' Hall
    this.drawPillaredMandapam(ctx, 550, 120, 160, 90);

    // 5. Practice Archery Range & Stables
    this.drawArcheryRange(ctx, 80, 260);

    // 6. Draw Props & Weapon Racks
    this.drawProps(ctx);

    // 7. Ambient Fort NPCs (Guards on ramparts, scribes)
    this.drawAmbientNpcs(ctx);

    // 8. Mentors with Idle Animations
    this.drawMentors(ctx);

    // 9. Young Velu Nachiyar (Child Protagonist Avatar)
    this.drawPlayer(ctx);

    // 10. Floating Golden Interaction Sigil above Focused Entity
    if (this.focusedEntity) {
      this.drawInteractionSigil(ctx, this.focusedEntity);
    }

    // 11. Diegetic Tutor Progress HUD Pill
    this.drawTutorProgress(ctx, w, h);
  }

  drawFortArchitecture(ctx, w, h) {
    // Warm sunlit sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    skyGrad.addColorStop(0, '#5a382c');
    skyGrad.addColorStop(1, '#8c4839');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.35);

    // Distant Gopuram tower silhouette in sunlight
    ctx.fillStyle = '#42241b';
    ctx.fillRect(w * 0.45, 20, 80, 100);
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)';
    ctx.strokeRect(w * 0.45, 20, 80, 100);

    // Heavy sandstone rampart wall across upper third
    ctx.fillStyle = '#8a4b3d';
    ctx.fillRect(0, 80, w, 60);

    // Crenellations along rampart
    ctx.fillStyle = '#6e382c';
    for (let x = 20; x < w; x += 45) {
      ctx.fillRect(x, 60, 26, 20);
    }

    // Warm sunlit rim along wall edge
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(w, 80);
    ctx.stroke();
  }

  drawCourtyardGround(ctx, w, h) {
    // Warm sandstone paving stones
    const groundGrad = ctx.createLinearGradient(0, 140, 0, h);
    groundGrad.addColorStop(0, '#4a2c24');
    groundGrad.addColorStop(0.5, '#3b221b');
    groundGrad.addColorStop(1, '#2E1F1B');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 140, w, h - 140);

    // Pavement stone grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(184, 80, 66, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 60; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 140); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 140; y < h; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  }

  drawKalyaniTank(ctx, cx, cy) {
    ctx.save();
    // Stepped tank outline
    for (let s = 0; s < 4; s++) {
      const inset = s * 7;
      ctx.fillStyle = s % 2 === 0 ? '#38201a' : '#271511';
      ctx.fillRect(cx - 50 + inset, cy - 40 + inset, 100 - inset * 2, 80 - inset * 2);
    }
    // Deep blue-green water mirror in center
    ctx.fillStyle = '#1e3830';
    ctx.fillRect(cx - 24, cy - 18, 48, 36);
    ctx.strokeStyle = '#A7BEAE';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 24, cy - 18, 48, 36);
    ctx.restore();
  }

  drawPillaredMandapam(ctx, x, y, w, h) {
    ctx.save();
    // Granite Mandapam roof
    ctx.fillStyle = '#3a221a';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Pillars with Yali bracket carvings
    const cols = 5;
    for (let i = 0; i < cols; i++) {
      const px = x + 15 + i * 32;
      ctx.fillStyle = '#5c362b';
      ctx.fillRect(px, y + 10, 8, h - 14);
      ctx.strokeStyle = '#ebd076';
      ctx.strokeRect(px, y + 10, 8, h - 14);
    }

    // Signboard: Scribes' Hall
    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.fillText('SCRIBES\' MANDAPAM', x + 18, y - 6);
    ctx.restore();
  }

  drawArcheryRange(ctx, x, y) {
    ctx.save();
    // Straw target bales
    for (let i = 0; i < 2; i++) {
      const ty = y + i * 42;
      ctx.fillStyle = '#6b4728';
      ctx.beginPath();
      ctx.arc(x, ty, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D9A441';
      ctx.stroke();

      // Red bullseye
      ctx.fillStyle = '#B85042';
      ctx.beginPath();
      ctx.arc(x, ty, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawProps(ctx) {
    this.props.forEach(p => {
      ctx.save();
      if (p.id === 'weapon_rack') {
        // Wooden weapon rack with Silambam staves & Valaris
        ctx.fillStyle = '#543023';
        ctx.fillRect(p.x - 18, p.y - 14, 36, 28);
        ctx.strokeStyle = '#D9A441';
        ctx.strokeRect(p.x - 18, p.y - 14, 36, 28);

        // Staves
        ctx.strokeStyle = '#d4a259';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - 12, p.y + 12); ctx.lineTo(p.x - 12, p.y - 20);
        ctx.moveTo(p.x, p.y + 12); ctx.lineTo(p.x, p.y - 20);
        ctx.moveTo(p.x + 12, p.y + 12); ctx.lineTo(p.x + 12, p.y - 20);
        ctx.stroke();

        if (this.trainingYardUnlocked) {
          // Pulsing Golden Waypoint Beacon
          const pulse = Math.sin(Date.now() * 0.006) * 5;
          ctx.strokeStyle = '#D9A441';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 28 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(217, 164, 65, 0.2)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 28 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 10.5px "Cambria", serif';
          ctx.fillStyle = '#ebd076';
          ctx.textAlign = 'center';
          ctx.fillText('⚔ LEVEL 2 WAYPOINT', p.x, p.y - 30);
        }
      } else if (p.id === 'palace_gate') {
        // Massive carved teak double doors
        ctx.fillStyle = '#3a2016';
        ctx.fillRect(p.x - 32, p.y - 16, 64, 32);
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(p.x - 32, p.y - 16, 64, 32);

        ctx.font = 'bold 10px "Cambria", serif';
        ctx.fillStyle = '#D9A441';
        ctx.textAlign = 'center';
        ctx.fillText('PALACE GATE', p.x, p.y + 4);
      } else if (p.id === 'hidden_pathway') {
        // Hollow Knight / Silksong style secret carved granite archway & torchlit passage
        const archW = 48;
        const archH = 58;
        const archX = p.x - archW / 2;
        const archY = p.y - archH / 2;

        // Recessed darkened interior
        const darkGrad = ctx.createRadialGradient(p.x, p.y + 6, 4, p.x, p.y + 6, 30);
        darkGrad.addColorStop(0, '#100705');
        darkGrad.addColorStop(0.6, '#1e0c08');
        darkGrad.addColorStop(1, '#0a0403');
        ctx.fillStyle = darkGrad;
        ctx.beginPath();
        ctx.arc(p.x, archY + archW / 2, archW / 2, Math.PI, 0);
        ctx.lineTo(archX + archW, archY + archH);
        ctx.lineTo(archX, archY + archH);
        ctx.closePath();
        ctx.fill();

        // Warm torch glow from within the secret corridor
        const glowPulse = Math.sin(Date.now() * 0.005) * 4;
        const torchGlow = ctx.createRadialGradient(p.x, p.y + 10, 2, p.x, p.y + 10, 26 + glowPulse);
        torchGlow.addColorStop(0, 'rgba(217, 164, 65, 0.45)');
        torchGlow.addColorStop(0.5, 'rgba(184, 80, 66, 0.2)');
        torchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = torchGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y + 10, 26 + glowPulse, 0, Math.PI * 2);
        ctx.fill();

        // Carved granite portal border & keystone
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, archY + archW / 2, archW / 2, Math.PI, 0);
        ctx.lineTo(archX + archW, archY + archH);
        ctx.lineTo(archX, archY + archH);
        ctx.closePath();
        ctx.stroke();

        // Ivy vines / night jasmine draping down
        ctx.strokeStyle = '#718c7b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(archX + 4, archY + 12); ctx.lineTo(archX + 6, archY + 30);
        ctx.moveTo(archX + archW - 4, archY + 10); ctx.lineTo(archX + archW - 6, archY + 24);
        ctx.stroke();

        // Floating dust / ember motes
        const moteY = p.y + 8 + Math.sin(Date.now() * 0.003 + p.x) * 6;
        ctx.fillStyle = '#ebd076';
        ctx.beginPath();
        ctx.arc(p.x - 6, moteY, 1.8, 0, Math.PI * 2);
        ctx.arc(p.x + 8, moteY - 4, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Diegetic Title above the arch
        ctx.font = 'bold 9.5px "Cambria", serif';
        ctx.fillStyle = '#D9A441';
        ctx.textAlign = 'center';
        ctx.fillText('SECRET ARCHWAY', p.x, archY - 8);
        ctx.font = '8px "Calibri", sans-serif';
        ctx.fillStyle = '#A7BEAE';
        ctx.fillText('Training Pathway', p.x, archY + 2);
      }
      ctx.restore();
    });
  }

  drawAmbientNpcs(ctx) {
    this.ambientNpcs.forEach(n => {
      ctx.save();
      if (n.type === 'guard_rampart') {
        // Spear guard on high rampart
        ctx.fillStyle = '#B85042';
        ctx.beginPath();
        ctx.arc(n.currentX, 72, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(n.currentX - 5, 80, 10, 18);

        // Spear
        ctx.strokeStyle = '#ebd076';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(n.currentX + 6, 60);
        ctx.lineTo(n.currentX + 6, 98);
        ctx.stroke();
      } else if (n.type === 'scribe_assistant') {
        // Assistant carrying scrolls
        ctx.fillStyle = '#A7BEAE';
        ctx.beginPath();
        ctx.arc(n.currentX, n.currentY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(n.currentX - 4, n.currentY + 8, 8, 16);
      }
      ctx.restore();
    });
  }

  drawMentors(ctx) {
    this.mentors.forEach(m => {
      ctx.save();
      m.idlePhase += 0.04;
      const breathe = Math.sin(m.idlePhase) * 1.5;

      // Mentor disc / shadow
      ctx.fillStyle = 'rgba(20, 12, 10, 0.4)';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 14, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Robes based on role)
      const robeColor = m.id === 'weapons_master' ? '#8a3d2e' : (m.id === 'royal_scholar' ? '#3d594b' : '#6b4d24');
      ctx.fillStyle = robeColor;
      ctx.fillRect(m.x - 7, m.y - 6 + breathe, 14, 20);

      // Head
      ctx.fillStyle = '#d4986a';
      ctx.beginPath();
      ctx.arc(m.x, m.y - 12 + breathe, 8, 0, Math.PI * 2);
      ctx.fill();

      // Turban / Angavastram
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(m.x - 8, m.y - 18 + breathe, 16, 6);

      // Label below mentor
      ctx.font = 'bold 11px "Cambria", serif';
      ctx.fillStyle = m.visited ? '#A7BEAE' : '#D9A441';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, m.x, m.y + 26);

      ctx.restore();
    });
  }

  drawPlayer(ctx) {
    const p = this.player;
    ctx.save();

    // Shadow under feet
    ctx.fillStyle = 'rgba(20, 10, 8, 0.5)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Young Velu Nachiyar (Child Protagonist)
    // Golden silk practice tunic with terracotta sash
    ctx.fillStyle = '#D9A441'; // ACCENT-GOLD
    ctx.fillRect(p.x - 6, p.y - 8, 12, 18);

    // Terracotta sash
    ctx.fillStyle = '#B85042';
    ctx.fillRect(p.x - 7, p.y + 1, 14, 4);

    // Child head & braided hair
    ctx.fillStyle = '#cf9365';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // Braided hair with jasmine flowers (white dots)
    ctx.fillStyle = '#1a0e0a';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 16, 7, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x - 3, p.y - 17, 2, 0, Math.PI * 2);
    ctx.arc(p.x + 3, p.y - 17, 2, 0, Math.PI * 2);
    ctx.fill();

    // Practice staff held in hand when moving
    ctx.strokeStyle = '#b88c4b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + 8, p.y - 10);
    ctx.lineTo(p.x + 8, p.y + 14);
    ctx.stroke();

    ctx.restore();
  }

  drawInteractionSigil(ctx, entity) {
    ctx.save();
    const t = Date.now() * 0.005;
    const hoverY = entity.y - 34 + Math.sin(t) * 3;

    // Golden Halo
    const glow = ctx.createRadialGradient(entity.x, hoverY, 2, entity.x, hoverY, 18);
    glow.addColorStop(0, '#fff6ce');
    glow.addColorStop(0.4, 'rgba(217, 164, 65, 0.8)');
    glow.addColorStop(1, 'rgba(217, 164, 65, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(entity.x, hoverY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Rangoli Kolam Diamond Sigil
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.moveTo(entity.x, hoverY - 7);
    ctx.lineTo(entity.x + 7, hoverY);
    ctx.lineTo(entity.x, hoverY + 7);
    ctx.lineTo(entity.x - 7, hoverY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Key prompt
    ctx.font = 'bold 11px "Montserrat", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    const promptText = (entity.id === 'weapon_rack' && this.trainingYardUnlocked) ? '[E] Enter Level 2 ⚔' : (entity.dialogue ? '[E] Confer' : '[E] Inspect');
    ctx.fillText(promptText, entity.x, hoverY - 14);

    ctx.restore();
  }

  drawTutorProgress(ctx, w, h) {
    const count = (this.mentorsConferred.weapons_master ? 1 : 0) +
      (this.mentorsConferred.royal_scholar ? 1 : 0) +
      (this.mentorsConferred.shadow_scout ? 1 : 0);

    ctx.save();
    const px = w - 215;
    const py = 16;
    const pw = 200;
    const ph = 32;

    // Background pill
    ctx.fillStyle = 'rgba(30, 18, 14, 0.88)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = this.trainingYardUnlocked ? '#D9A441' : 'rgba(217, 164, 65, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    // Text label
    ctx.font = 'bold 11.5px "Cambria", serif';
    ctx.fillStyle = this.trainingYardUnlocked ? '#ebd076' : '#A7BEAE';
    ctx.textAlign = 'center';
    const statusTxt = this.trainingYardUnlocked ? 'Tutors: 3/3 (Level 2 Ready ⚔)' : `Tutors Conferred: ${count}/3`;
    ctx.fillText(statusTxt, px + pw / 2, py + 20);
    ctx.restore();
  }
}

// Global Level 1 Courtyard singleton
window.sivagangaCourtyard = new SivagangaLevel1Courtyard();
