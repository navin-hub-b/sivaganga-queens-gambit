/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - LEVEL 4: "TONGUES OF THE WORLD"
 * Ramanathapuram Fort Scribes' Mandapam (1740s).
 *
 * Young Velu Nachiyar studies in the quiet, lamplit study hall:
 * - Master Periya Pandithar instructs her in the four strategic languages of the era:
 *   Tamil, English, French, and Urdu.
 * - Translation and code-matching puzzles using torn palm-leaf manuscripts (Olai Chuvadi).
 * - Matches are validated state-side against an immutable answer key.
 * - Correct matches illuminate in radiant gold (#D9A441) along the torn seam.
 * - Incorrect attempts gently drift back without harsh buzzers or red X's.
 * - Decoded messages explicitly foreshadow Chapter 3's spy network ("spies will matter later").
 * - Fully accessible via Mouse/Touch dragging, Arrow/Enter selection, and Number keys (1-3).
 */

class SivagangaLevel4TonguesOfTheWorld {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.isTransitioning = false;
    this.animationId = null;
    this.lastFrameTime = 0;

    // Canvas dimensions
    this.width = 800;
    this.height = 500;

    // Progression: 3 sequential translation puzzles
    this.currentPuzzleIndex = 0;
    this.puzzleSolvedCount = 0;
    this.totalPuzzles = 3;
    this.isLevelCompleted = false;

    // Active puzzle data structure
    this.slots = [];
    this.fragments = [];
    this.draggedFragment = null;
    this.dragOffset = { x: 0, y: 0 };
    this.selectedIndex = 0; // For keyboard accessibility

    // Mentor Scholar (Periya Pandithar) state
    this.mentor = {
      name: 'Periya Pandithar',
      title: 'Chief Royal Scholar',
      message: 'Welcome to the Scribes\' Mandapam, Princess Velu. A monarch who commands the tongues of her allies and adversaries commands their destiny.',
      timer: 7.0,
      idleTimer: 0,
      x: 105,
      y: 275
    };

    // Desk and Reading Diya Lamp
    this.desk = { x: 220, y: 140, w: 540, h: 320 };
    this.diya = {
      x: 175,
      y: 350,
      flameFlicker: 0,
      flamePhase: 0
    };

    // Ambient floating dust motes & golden seam particles
    this.dustMotes = [];
    this.seamParticles = [];

    // Puzzle Definitions (Historically Grounded & English-Accessible)
    this.puzzles = [
      {
        id: 1,
        title: 'The Picket Dispatch (Tamil & English)',
        subtitle: 'Intercepted Colonial Garrison Order',
        languagePair: 'Tamil ↔ English',
        loreContext: 'An East India Company patrol note seized outside Madurai. Decipher the military terms between court Tamil and colonial English.',
        hint: 'Match each Tamil military term with its translated English counterpart on the parchment.',
        decodedMessage: 'THE COMPANY MOVES UNDER COVER OF NIGHT, YET THEIR PICKETS LEAVE TRACKS THAT SILENT SCOUTS CAN FOLLOW.',
        foreshadowText: 'Knowledge of their patrol routes gives our watchers an invisible path.',
        pairs: [
          {
            keyId: 'p1_kaval',
            sourceLabel: 'Tamil',
            sourcePhrase: 'Kaval Nilayam',
            targetLabel: 'English',
            targetPhrase: 'Garrison Picket',
            meaning: 'Stationed guard outpost along the road'
          },
          {
            keyId: 'p1_olai',
            sourceLabel: 'Tamil',
            sourcePhrase: 'Ondrippaana Olai',
            targetLabel: 'English',
            targetPhrase: 'Secret Dispatch',
            meaning: 'Sealed missive carried by courier'
          },
          {
            keyId: 'p1_paadhai',
            sourceLabel: 'Tamil',
            sourcePhrase: 'Nilavazhi Paadhai',
            targetLabel: 'English',
            targetPhrase: 'Midnight Patrol Route',
            meaning: 'Uncharted track through the dry scrub'
          }
        ]
      },
      {
        id: 2,
        title: 'The Pondicherry Envoy (French & English)',
        subtitle: 'Diplomatic Correspondence from the Coast',
        languagePair: 'French ↔ English',
        loreContext: 'Letters from French merchants and military advisors at Pondicherry. French intelligence reveals colonial logistics and fortress vulnerabilities.',
        hint: 'Align each French diplomatic phrase with its translated meaning on the palm-leaf.',
        decodedMessage: 'THE FRENCH ENVOYS NOTE: TRUE STRENGTH LIES NOT IN OPEN CANNONS, BUT IN HIDDEN EYES WITHIN THE FORTRESS WALLS.',
        foreshadowText: 'European powers clash, but southern alliances are built on trust and covert eyes.',
        pairs: [
          {
            keyId: 'p2_eclaireurs',
            sourceLabel: 'French',
            sourcePhrase: 'Nos éclaireurs invisibles',
            targetLabel: 'English',
            targetPhrase: 'Our invisible shadow scouts',
            meaning: 'Eyes stationed behind enemy cantonments'
          },
          {
            keyId: 'p2_poudre',
            sourceLabel: 'French',
            sourcePhrase: 'Poudre à canon scellée',
            targetLabel: 'English',
            targetPhrase: 'Sealed black powder stores',
            meaning: 'Vulnerable arsenals within British redoubts'
          },
          {
            keyId: 'p2_alliance',
            sourceLabel: 'French',
            sourcePhrase: 'Alliance contre la Compagnie',
            targetLabel: 'English',
            targetPhrase: 'Pact against the Company',
            meaning: 'Joint covenant to expel foreign invaders'
          }
        ]
      },
      {
        id: 3,
        title: 'The Mysore Durbar Cipher (Urdu & English)',
        subtitle: 'Secret Hindustani Envoy Missive (Foreshadowing Chapter 3)',
        languagePair: 'Urdu ↔ English',
        loreContext: 'Encrypted court correspondence in Urdu from Mysore. Decipher the covert strategy that will later safeguard Queen Velu during her years of exile.',
        hint: 'Study the Urdu terms of diplomacy and espionage to decipher the message of the shadow network.',
        decodedMessage: 'A KINGDOM IS NOT WON BY SWORDS ALONE. WHEN KALAIYAR KOVIL FALLS, OUR SHADOW SPIES WILL BE THE LIGHT THAT LEADS US HOME.',
        foreshadowText: 'Remember this truth: armies clash on open fields, but wars are won by shadow spies.',
        pairs: [
          {
            keyId: 'p3_jasoos',
            sourceLabel: 'Urdu',
            sourcePhrase: 'Khabar-rasan aur Jasoos',
            targetLabel: 'English',
            targetPhrase: 'Shadow spies and couriers',
            meaning: 'The covert messengers who move unseen'
          },
          {
            keyId: 'p3_dakhil',
            sourceLabel: 'Urdu',
            sourcePhrase: 'Qila ke andar dakhil',
            targetLabel: 'English',
            targetPhrase: 'Infiltration within the fort',
            meaning: 'Entering disguised during festive days'
          },
          {
            keyId: 'p3_fateh',
            sourceLabel: 'Urdu',
            sourcePhrase: 'Waqt aane par fateh',
            targetLabel: 'English',
            targetPhrase: 'Victory when the hour strikes',
            meaning: 'A strike timed to the exact heartbeat'
          }
        ]
      }
    ];

    // Bound Event Listeners
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
    }
    this.initDustMotes();
  }

  resize() {
    if (!this.canvas) return;
    const stage = document.querySelector('.level-canvas-stage');
    this.width = stage ? (stage.clientWidth || 800) : 800;
    this.height = stage ? (stage.clientHeight || 500) : 500;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Recalculate layout metrics
    this.desk.x = Math.max(180, this.width * 0.22);
    this.desk.y = 100;
    this.desk.w = Math.min(590, this.width * 0.74);
    this.desk.h = Math.min(370, this.height - 120);

    this.mentor.x = Math.max(50, this.width * 0.11);
    this.mentor.y = this.desk.y + 120;

    this.diya.x = this.desk.x + 24;
    this.diya.y = this.desk.y + 60;

    if (this.isActive) {
      this.repositionPuzzleElements();
    }
  }

  initDustMotes() {
    this.dustMotes = [];
    for (let i = 0; i < 35; i++) {
      this.dustMotes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.45,
        speedY: -0.15 - Math.random() * 0.25,
        speedX: Math.sin(i) * 0.15
      });
    }
  }

  start() {
    this.isActive = true;
    this.isTransitioning = false;
    this.isLevelCompleted = false;
    this.currentPuzzleIndex = 0;
    this.puzzleSolvedCount = 0;
    this.draggedFragment = null;
    this.selectedIndex = 0;

    this.mentor.timer = 6.0;
    this.mentor.idleTimer = 0;
    this.mentor.message = 'Welcome to the Scribes\' Mandapam, Princess Velu. Study the palm-leaf fragments and align their meanings.';

    this.loadPuzzle(this.currentPuzzleIndex);

    // Bind event listeners
    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', this.boundPointerDown);
      window.addEventListener('pointermove', this.boundPointerMove);
      window.addEventListener('pointerup', this.boundPointerUp);
    }
    window.addEventListener('keydown', this.boundKeyDown);

    // Start Audio Drone & subtle bell
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.setMasterVolume(1.0);
      window.sivagangaAudio.startTanpuraDrone();
      window.sivagangaAudio.playResolveBell();
    }

    // Begin Animation Loop
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
  }

  loadPuzzle(index) {
    if (index >= this.puzzles.length) {
      this.resolveLevel();
      return;
    }

    this.currentPuzzleIndex = index;
    const pData = this.puzzles[index];
    this.mentor.idleTimer = 0;

    // Provide tailored contextual mentor guidance
    if (index === 0) {
      this.mentor.message = 'The East India Company communicates in English dispatches. Match the Tamil military terms with their English translations.';
    } else if (index === 1) {
      this.mentor.message = 'Pondicherry sends words in French. Align each French phrase with its translated meaning on the palm leaf.';
    } else if (index === 2) {
      this.mentor.message = 'The court of Mysore communicates in formal Urdu. Decipher the terms of diplomacy and shadow espionage.';
    }
    this.mentor.timer = 5.5;

    this.repositionPuzzleElements();
  }

  repositionPuzzleElements() {
    const pData = this.puzzles[this.currentPuzzleIndex];
    if (!pData) return;

    this.slots = [];
    this.fragments = [];

    const slotStartX = this.desk.x + 45;
    const slotStartY = this.desk.y + 75;
    const slotW = Math.min(235, this.desk.w * 0.44);
    const slotH = 58;
    const slotGap = 18;

    // Draggable tray positions on the right side of the desk
    const trayStartX = this.desk.x + this.desk.w - slotW - 35;
    const trayStartY = slotStartY;

    // Create target slots (Source language side)
    pData.pairs.forEach((pair, idx) => {
      const sy = slotStartY + idx * (slotH + slotGap);
      this.slots.push({
        index: idx,
        keyId: pair.keyId,
        sourceLabel: pair.sourceLabel,
        sourcePhrase: pair.sourcePhrase,
        targetPhrase: pair.targetPhrase,
        meaning: pair.meaning,
        x: slotStartX,
        y: sy,
        w: slotW,
        h: slotH,
        matched: false,
        seamGlow: 0, // 0 -> 1 when matched
        matchedFragment: null
      });
    });

    // Shuffle target draggable fragments so they are not in 1:1 row order
    const shuffledPairs = [...pData.pairs];
    // Deterministic shuffle based on puzzle index to keep puzzle fair and repeatable
    if (this.currentPuzzleIndex === 0) {
      // Reorder [2, 0, 1]
      const temp = shuffledPairs[0];
      shuffledPairs[0] = shuffledPairs[2];
      shuffledPairs[2] = temp;
    } else if (this.currentPuzzleIndex === 1) {
      // Reorder [1, 2, 0]
      const temp = shuffledPairs[0];
      shuffledPairs[0] = shuffledPairs[1];
      shuffledPairs[1] = shuffledPairs[2];
      shuffledPairs[2] = temp;
    } else {
      // Reorder [2, 1, 0]
      const temp = shuffledPairs[0];
      shuffledPairs[0] = shuffledPairs[2];
      shuffledPairs[2] = temp;
    }

    shuffledPairs.forEach((pair, idx) => {
      const ty = trayStartY + idx * (slotH + slotGap);
      this.fragments.push({
        id: `frag_${idx}`,
        keyId: pair.keyId,
        label: pair.targetLabel,
        phrase: pair.targetPhrase,
        x: trayStartX,
        y: ty,
        originX: trayStartX,
        originY: ty,
        w: slotW,
        h: slotH,
        isMatched: false,
        isDragging: false,
        isDrifting: false,
        driftProgress: 0,
        driftStartX: 0,
        driftStartY: 0
      });
    });
  }

  // =========================================================================
  // INPUT HANDLING: DRAG & DROP + KEYBOARD ACCESSIBILITY
  // =========================================================================
  getCanvasCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(e) {
    if (!this.isActive || this.isTransitioning) return;
    const pt = this.getCanvasCoordinates(e);

    // Check if player clicked directly on any unmatched draggable fragment
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const frag = this.fragments[i];
      if (frag.isMatched || frag.isDrifting) continue;

      if (pt.x >= frag.x && pt.x <= frag.x + frag.w &&
          pt.y >= frag.y && pt.y <= frag.y + frag.h) {
        this.draggedFragment = frag;
        frag.isDragging = true;
        this.dragOffset.x = pt.x - frag.x;
        this.dragOffset.y = pt.y - frag.y;

        // Bring dragged fragment to top of render array
        this.fragments.splice(i, 1);
        this.fragments.push(frag);

        if (window.sivagangaAudio) {
          window.sivagangaAudio.playPalmLeafScroll();
        }
        break;
      }
    }
  }

  handlePointerMove(e) {
    if (!this.isActive || !this.draggedFragment) return;
    const pt = this.getCanvasCoordinates(e);

    // Update fragment position with bounds clamping within canvas
    this.draggedFragment.x = Math.max(10, Math.min(this.width - this.draggedFragment.w - 10, pt.x - this.dragOffset.x));
    this.draggedFragment.y = Math.max(10, Math.min(this.height - this.draggedFragment.h - 10, pt.y - this.dragOffset.y));
  }

  handlePointerUp(e) {
    if (!this.isActive || !this.draggedFragment) return;
    const frag = this.draggedFragment;
    this.draggedFragment = null;
    frag.isDragging = false;

    this.validateDrop(frag);
  }

  handleKeyDown(e) {
    if (!this.isActive) return;

    // Toggle lore manuscript
    if (e.key === 'h' || e.key === 'H' || e.code === 'KeyH' || e.key === 'F1') {
      e.preventDefault();
      if (window.sivagangaGameplay) {
        window.sivagangaGameplay.toggleLoreModal();
      }
      return;
    }

    // Number keys (1, 2, 3) for quick accessible matching:
    // Automatically attempts to match fragment (1, 2, or 3) to the first available slot
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      const idx = parseInt(e.key, 10) - 1;
      const frag = this.fragments[idx];
      if (frag && !frag.isMatched) {
        const nextSlot = this.slots.find(s => !s.matched);
        if (nextSlot) {
          this.executeMatchAttempt(frag, nextSlot);
        }
      }
      return;
    }
  }

  // =========================================================================
  // STATE-SIDE VALIDATION ENGINE (Prevents Rapid / Glitchy False Matches)
  // =========================================================================
  validateDrop(frag) {
    // Find closest open target slot within snap tolerance (distance < 95px)
    let closestSlot = null;
    let minDistance = 95; // Snap proximity threshold

    this.slots.forEach(slot => {
      if (slot.matched) return;
      const slotCenterX = slot.x + slot.w / 2;
      const slotCenterY = slot.y + slot.h / 2;
      const fragCenterX = frag.x + frag.w / 2;
      const fragCenterY = frag.y + frag.h / 2;
      const dist = Math.hypot(slotCenterX - fragCenterX, slotCenterY - fragCenterY);

      if (dist < minDistance) {
        minDistance = dist;
        closestSlot = slot;
      }
    });

    if (closestSlot) {
      this.executeMatchAttempt(frag, closestSlot);
    } else {
      // Dropped away from any slot: gently drift back to tray
      this.startDriftBack(frag);
    }
  }

  executeMatchAttempt(frag, slot) {
    // STATE-SIDE VALIDATION: Immutable answer key comparison
    if (frag.keyId === slot.keyId) {
      // --- CORRECT MATCH (RESOLVED) ---
      slot.matched = true;
      slot.seamGlow = 1.0;
      slot.matchedFragment = frag;

      frag.isMatched = true;
      frag.isDrifting = false;
      // Snap flush with slot right edge
      frag.x = slot.x + slot.w - 12;
      frag.y = slot.y;

      // Spawn golden seam burst particles
      this.spawnSeamParticles(frag.x, slot.y + slot.h / 2);

      if (window.sivagangaAudio) {
        window.sivagangaAudio.playSoftLightFlare();
      }

      this.checkPuzzleCompletion();
    } else {
      // --- INCORRECT ATTEMPT ---
      // Serene feedback: Gently glide back to shelf without buzzing or red marks
      this.startDriftBack(frag);
      if (window.sivagangaAudio) {
        window.sivagangaAudio.playQuietFade();
      }
    }
  }

  startDriftBack(frag) {
    frag.isDrifting = true;
    frag.driftProgress = 0;
    frag.driftStartX = frag.x;
    frag.driftStartY = frag.y;
  }

  checkPuzzleCompletion() {
    const allSlotsMatched = this.slots.every(s => s.matched);
    if (!allSlotsMatched) return;

    // Current Puzzle Solved!
    const pData = this.puzzles[this.currentPuzzleIndex];
    this.puzzleSolvedCount++;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
    }

    this.mentor.message = `DECODED: "${pData.decodedMessage}"`;
    this.mentor.timer = 5.0;

    // Advance to next puzzle or resolve level after celebration pause
    setTimeout(() => {
      if (this.isActive && !this.isTransitioning) {
        if (this.currentPuzzleIndex + 1 < this.totalPuzzles) {
          this.loadPuzzle(this.currentPuzzleIndex + 1);
        } else {
          this.resolveLevel();
        }
      }
    }, 2800);
  }

  spawnSeamParticles(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i + Math.random() * 0.2;
      const speed = 25 + Math.random() * 45;
      this.seamParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 1.5 + Math.random() * 0.8,
        color: '#D9A441',
        radius: 2 + Math.random() * 1.5
      });
    }
  }

  // =========================================================================
  // ANIMATION LOOP & SIMULATION UPDATE
  // =========================================================================
  loop(now) {
    if (!this.isActive) return;
    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(now, dt);
    this.render(now);

    this.animationId = requestAnimationFrame((t) => this.loop(t));
  }

  update(now, dt) {
    // 1. Diya Lamp flickering
    this.diya.flamePhase += dt * 7.5;
    this.diya.flameFlicker = Math.sin(this.diya.flamePhase) * 2.5 + Math.cos(this.diya.flamePhase * 1.7) * 1.5;

    // 2. Mentor hint timer (offers friendly assistance if player pauses for > 12s)
    if (this.mentor.timer > 0) {
      this.mentor.timer -= dt;
    } else {
      this.mentor.idleTimer += dt;
      if (this.mentor.idleTimer > 12.0) {
        const pData = this.puzzles[this.currentPuzzleIndex];
        if (pData) {
          this.mentor.message = pData.hint;
          this.mentor.timer = 6.0;
          this.mentor.idleTimer = 0;
        }
      }
    }

    // 3. Smooth drift-back animation for misplaced fragments
    this.fragments.forEach(frag => {
      if (frag.isDrifting) {
        frag.driftProgress += dt * 3.5; // ~0.28s smooth return glide
        if (frag.driftProgress >= 1.0) {
          frag.driftProgress = 1.0;
          frag.isDrifting = false;
          frag.x = frag.originX;
          frag.y = frag.originY;
        } else {
          // Smooth ease-out cubic interpolation
          const t = 1 - Math.pow(1 - frag.driftProgress, 3);
          frag.x = frag.driftStartX + (frag.originX - frag.driftStartX) * t;
          frag.y = frag.driftStartY + (frag.originY - frag.driftStartY) * t;
        }
      }
    });

    // 4. Seam glow fading & particles
    this.slots.forEach(slot => {
      if (slot.seamGlow > 0) {
        slot.seamGlow = Math.max(0, slot.seamGlow - dt * 0.8);
      }
    });

    this.seamParticles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
    });
    this.seamParticles = this.seamParticles.filter(p => p.life > 0);

    // 5. Dust motes floating in lamplight
    this.dustMotes.forEach(m => {
      m.y += m.speedY;
      m.x += m.speedX;
      if (m.y < 0) m.y = this.height;
      if (m.x < 0) m.x = this.width;
      if (m.x > this.width) m.x = 0;
    });
  }

  // =========================================================================
  // RENDERING PIPELINE (2D/2.5D Tamil Fort Scribes' Hall Art)
  // =========================================================================
  render(now) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Scribes' Mandapam Granite Walls & Stone Pillars
    this.drawMandapamHall(ctx, w, h);

    // 2. Palm-Leaf Manuscript Shelves (Background)
    this.drawManuscriptShelves(ctx, w, h);

    // 3. Mentor Scribe (Periya Pandithar)
    this.drawMentorScholar(ctx);

    // 4. Carved Teak Desk & Desk Cloth
    this.drawStudyDesk(ctx);

    // 5. Brass Reading Diya Lamp with Warm Radial Light
    this.drawReadingDiya(ctx);

    // 6. Floating Ambient Dust Motes
    this.drawDustMotes(ctx);

    // 7. Open Manuscript Parchment & Target Slots
    this.drawManuscriptSlots(ctx);

    // 8. Draggable Palm-Leaf Fragments
    this.drawPalmLeafFragments(ctx);

    // 9. Seam Particles & Golden Glint
    this.drawSeamParticles(ctx);

    // 10. Puzzle Header & Progress Indicators
    this.drawPuzzleHeader(ctx, w);

    // 11. Mentor Speech Plaque Toast
    this.drawMentorPlaque(ctx, w);
  }

  drawMandapamHall(ctx, w, h) {
    // Deep maroon stone gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1c110e');
    bgGrad.addColorStop(0.5, '#2E1F1B'); // BG-MAROON
    bgGrad.addColorStop(1, '#180d0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Granite pillar reliefs on left and right
    ctx.fillStyle = '#3a241e';
    ctx.fillRect(0, 0, 80, h);
    ctx.fillRect(w - 70, 0, 70, h);

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 80, h);
    ctx.strokeRect(w - 70, 0, 70, h);

    // Carved Yali bracket silhouettes
    ctx.fillStyle = '#4a2d24';
    ctx.fillRect(15, 60, 50, 22);
    ctx.fillRect(w - 60, 60, 48, 22);
  }

  drawManuscriptShelves(ctx, w, h) {
    ctx.save();
    // Teak wooden library shelves along the top-left background
    const shelfX = 90;
    const shelfY = 40;
    const shelfW = w - 180;
    const shelfH = 46;

    ctx.fillStyle = '#382019';
    ctx.fillRect(shelfX, shelfY, shelfW, shelfH);
    ctx.strokeStyle = '#6b4030';
    ctx.lineWidth = 2;
    ctx.strokeRect(shelfX, shelfY, shelfW, shelfH);

    // Bundles of Olai Chuvadi (palm-leaf manuscripts) stacked horizontally
    for (let i = 0; i < 18; i++) {
      const bx = shelfX + 16 + i * 28;
      ctx.fillStyle = (i % 3 === 0) ? '#d2a763' : (i % 3 === 1) ? '#bca068' : '#8d6d45';
      ctx.fillRect(bx, shelfY + 8, 22, 28);
      // Red binding cord string around palm bundles
      ctx.strokeStyle = '#B85042';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx + 11, shelfY + 8);
      ctx.lineTo(bx + 11, shelfY + 36);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMentorScholar(ctx) {
    const mx = this.mentor.x;
    const my = this.mentor.y;

    ctx.save();
    // Seated Chief Scholar Periya Pandithar (Tirunelveli scholar turban and dhoti)
    // Shawl / Angavastram (Sage Green ACCENT-SAGE #A7BEAE)
    ctx.fillStyle = '#A7BEAE';
    ctx.beginPath();
    ctx.arc(mx, my, 22, 0, Math.PI * 2);
    ctx.fill();

    // Scholar Turban / Angavastram folds (Terracotta #B85042 & Gold #D9A441)
    ctx.fillStyle = '#B85042';
    ctx.beginPath();
    ctx.arc(mx, my - 20, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Scholar Head & Tilak
    ctx.fillStyle = '#b57954';
    ctx.beginPath();
    ctx.arc(mx, my - 16, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sacred ash stripes (Vibhuti)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx - 4, my - 18);
    ctx.lineTo(mx + 4, my - 18);
    ctx.stroke();

    // Scholar Robes
    ctx.fillStyle = '#2f1a14';
    ctx.beginPath();
    ctx.ellipse(mx, my + 24, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Palm leaf stylus in scholar's hand
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx + 12, my + 14);
    ctx.lineTo(mx + 26, my + 4);
    ctx.stroke();

    // Label: Chief Royal Scholar
    ctx.font = 'bold 9.5px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'center';
    ctx.fillText('PERIYA PANDITHAR', mx, my + 54);
    ctx.font = '8px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('Chief Royal Scholar', mx, my + 65);

    ctx.restore();
  }

  drawStudyDesk(ctx) {
    const d = this.desk;
    ctx.save();

    // Carved Teak Desk Base
    const deskGrad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.h);
    deskGrad.addColorStop(0, '#3e241c');
    deskGrad.addColorStop(1, '#281510');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(d.x, d.y, d.w, d.h);

    // Warm terracotta desk cloth in center
    ctx.fillStyle = 'rgba(184, 80, 66, 0.15)'; // BG-TERRACOTTA tint
    ctx.fillRect(d.x + 14, d.y + 14, d.w - 28, d.h - 28);

    // Golden inlay border along desk perimeter
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x, d.y, d.w, d.h);

    ctx.strokeStyle = 'rgba(217, 164, 65, 0.35)';
    ctx.strokeRect(d.x + 8, d.y + 8, d.w - 16, d.h - 16);

    ctx.restore();
  }

  drawReadingDiya(ctx) {
    const dx = this.diya.x;
    const dy = this.diya.y;
    const flick = this.diya.flameFlicker;

    ctx.save();
    // Warm ambient reading illumination over desk
    const lampGlow = ctx.createRadialGradient(dx, dy, 6, dx, dy, 180 + flick * 4);
    lampGlow.addColorStop(0, 'rgba(217, 164, 65, 0.45)');
    lampGlow.addColorStop(0.4, 'rgba(184, 80, 66, 0.18)');
    lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(dx, dy, 180 + flick * 4, 0, Math.PI * 2);
    ctx.fill();

    // Brass Diya Lamp Vessel
    ctx.fillStyle = '#b88934';
    ctx.beginPath();
    ctx.ellipse(dx, dy + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Diya Spout & Wick
    ctx.fillStyle = '#22110b';
    ctx.fillRect(dx + 8, dy + 4, 4, 8);

    // Flickering Golden Flame
    ctx.fillStyle = '#fce49f';
    ctx.beginPath();
    ctx.ellipse(dx + 10, dy - 2 + flick * 0.5, 4.5, 9 + flick, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9933';
    ctx.beginPath();
    ctx.ellipse(dx + 10, dy + 2, 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawDustMotes(ctx) {
    ctx.save();
    this.dustMotes.forEach(m => {
      ctx.fillStyle = `rgba(217, 164, 65, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawManuscriptSlots(ctx) {
    const pData = this.puzzles[this.currentPuzzleIndex];
    if (!pData) return;

    ctx.save();

    // Section Labels: Left (Original Inscription) vs Right (Torn Translation Fragments)
    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`ORIGINAL DISPATCH [${pData.languagePair.split('↔')[0].trim()}]`, this.desk.x + 45, this.desk.y + 55);

    ctx.textAlign = 'right';
    ctx.fillText('TRANSLATION FRAGMENTS [DRAG TO MATCH]', this.desk.x + this.desk.w - 35, this.desk.y + 55);

    // Draw each slot socket
    this.slots.forEach(slot => {
      // Slot background parchment
      ctx.fillStyle = slot.matched ? '#302016' : '#221411';
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);

      // Border with torn ragged serrations
      ctx.strokeStyle = slot.matched ? '#D9A441' : 'rgba(217, 164, 65, 0.4)';
      ctx.lineWidth = slot.matched ? 2 : 1;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);

      // Language Tag & Phrase
      ctx.font = 'bold 9px "Calibri", sans-serif';
      ctx.fillStyle = '#A7BEAE';
      ctx.textAlign = 'left';
      ctx.fillText(`${slot.sourceLabel.toUpperCase()} INSCRIPTION:`, slot.x + 10, slot.y + 16);

      ctx.font = 'bold 13px "Cambria", serif';
      ctx.fillStyle = slot.matched ? '#D9A441' : '#f0ddc6';
      ctx.fillText(`"${slot.sourcePhrase}"`, slot.x + 10, slot.y + 35);

      // Context subtitle
      ctx.font = 'italic 8.5px "Cambria", serif';
      ctx.fillStyle = 'rgba(240, 221, 198, 0.65)';
      ctx.fillText(slot.meaning, slot.x + 10, slot.y + 49);

      // If matched, draw radiant golden seam glow along the connecting seam
      if (slot.matched) {
        ctx.strokeStyle = '#D9A441';
        ctx.lineWidth = 3 + slot.seamGlow * 4;
        ctx.beginPath();
        ctx.moveTo(slot.x + slot.w - 2, slot.y);
        ctx.lineTo(slot.x + slot.w - 2, slot.y + slot.h);
        ctx.stroke();

        // Lock icon indicator
        ctx.fillStyle = '#D9A441';
        ctx.font = '10px "Calibri", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('✓ RESOLVED', slot.x + slot.w - 8, slot.y + 16);
      }
    });

    ctx.restore();
  }

  drawPalmLeafFragments(ctx) {
    ctx.save();

    this.fragments.forEach(frag => {
      ctx.save();

      // Shadow when dragging
      if (frag.isDragging) {
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;
      }

      // Authentic fibrous palm-leaf gradient texture
      const leafGrad = ctx.createLinearGradient(frag.x, frag.y, frag.x + frag.w, frag.y);
      if (frag.isMatched) {
        leafGrad.addColorStop(0, '#42281a');
        leafGrad.addColorStop(1, '#351f15');
      } else {
        leafGrad.addColorStop(0, '#543622');
        leafGrad.addColorStop(0.5, '#472d1c');
        leafGrad.addColorStop(1, '#3a2316');
      }

      ctx.fillStyle = leafGrad;
      ctx.fillRect(frag.x, frag.y, frag.w, frag.h);

      // Torn serrated boundary line
      ctx.strokeStyle = frag.isMatched ? '#D9A441' : (frag.isDragging ? '#f3cf7a' : '#885834');
      ctx.lineWidth = frag.isMatched ? 2 : (frag.isDragging ? 2.5 : 1.5);
      ctx.strokeRect(frag.x, frag.y, frag.w, frag.h);

      // Fine palm leaf striations (horizontal fibers)
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.12)';
      ctx.lineWidth = 1;
      for (let y = frag.y + 6; y < frag.y + frag.h; y += 7) {
        ctx.beginPath();
        ctx.moveTo(frag.x + 4, y);
        ctx.lineTo(frag.x + frag.w - 4, y);
        ctx.stroke();
      }

      // Label & Translated Phrase
      ctx.font = 'bold 9px "Calibri", sans-serif';
      ctx.fillStyle = frag.isMatched ? '#D9A441' : '#A7BEAE';
      ctx.textAlign = 'left';
      ctx.fillText(`${frag.label.toUpperCase()} TRANSLATION:`, frag.x + 10, frag.y + 18);

      ctx.font = 'bold 12.5px "Cambria", serif';
      ctx.fillStyle = frag.isMatched ? '#fff2db' : '#ebd1b0';
      ctx.fillText(`"${frag.phrase}"`, frag.x + 10, frag.y + 37);

      // Drag hint prompt
      if (!frag.isMatched && !frag.isDragging) {
        ctx.font = 'italic 8.5px "Calibri", sans-serif';
        ctx.fillStyle = 'rgba(217, 164, 65, 0.7)';
        ctx.fillText('Drag to match left slot', frag.x + 10, frag.y + 50);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  drawSeamParticles(ctx) {
    ctx.save();
    this.seamParticles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawPuzzleHeader(ctx, w) {
    const pData = this.puzzles[this.currentPuzzleIndex];
    if (!pData) return;

    ctx.save();
    // Header Banner Card
    ctx.fillStyle = 'rgba(26, 15, 12, 0.9)';
    ctx.fillRect(this.desk.x, 14, this.desk.w, 48);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(this.desk.x, 14, this.desk.w, 48);

    // Corner brass accents
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(this.desk.x, 14, 4, 4);
    ctx.fillRect(this.desk.x + this.desk.w - 4, 14, 4, 4);
    ctx.fillRect(this.desk.x, 58, 4, 4);
    ctx.fillRect(this.desk.x + this.desk.w - 4, 58, 4, 4);

    // Stage & Puzzle Title
    ctx.font = 'bold 13px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`TRIAL 4 — PUZZLE ${this.currentPuzzleIndex + 1}/3: ${pData.title.toUpperCase()}`, this.desk.x + 14, 34);

    ctx.font = '10.5px "Calibri", sans-serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText(pData.subtitle, this.desk.x + 14, 49);

    // Solved indicators (3 beads in upper-right)
    ctx.textAlign = 'right';
    for (let i = 0; i < this.totalPuzzles; i++) {
      const bx = this.desk.x + this.desk.w - 20 - (2 - i) * 22;
      const isDone = i < this.puzzleSolvedCount;
      ctx.fillStyle = isDone ? '#D9A441' : '#45271d';
      ctx.beginPath();
      ctx.arc(bx, 38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawMentorPlaque(ctx, w) {
    if (this.mentor.timer <= 0) return;
    ctx.save();
    const alpha = Math.min(1.0, this.mentor.timer);
    ctx.globalAlpha = alpha;

    const boxW = Math.min(680, w * 0.88);
    const boxH = 44;
    const boxX = (w - boxW) / 2;
    const boxY = this.height - 56; // Non-obstructive toast docked at bottom

    ctx.fillStyle = 'rgba(26, 15, 12, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#D9A441';
    ctx.fillRect(boxX, boxY, 4, 4);
    ctx.fillRect(boxX + boxW - 4, boxY, 4, 4);
    ctx.fillRect(boxX, boxY + boxH - 4, 4, 4);
    ctx.fillRect(boxX + boxW - 4, boxY + boxH - 4, 4, 4);

    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.mentor.name.toUpperCase()}:`, boxX + 14, boxY + 17);

    ctx.font = '11.5px "Cambria", serif';
    ctx.fillStyle = '#f4e5d2';
    ctx.fillText(this.mentor.message, boxX + 14, boxY + 32);

    ctx.restore();
  }

  // =========================================================================
  // LEVEL RESOLUTION & FLOW INTO LEVEL 5
  // =========================================================================
  resolveLevel() {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    this.mentor.message = 'TRIUMPH! You have mastered the tongues of Tamil, English, French, and Urdu. Remember: wars are won by shadow spies!';
    this.mentor.timer = 6.0;

    if (window.sivagangaAudio) {
      window.sivagangaAudio.playResolveBell();
    }

    if (window.sivagangaSave) {
      window.sivagangaSave.recordLevelVictory(4, {
        tonguesLearned: ['Tamil', 'English', 'French', 'Urdu'],
        decipherRating: 'Flawless',
        espionageInsight: 'Shadow Network Foreshadowed'
      });
      window.sivagangaSave.unlockLevel(5);
      window.sivagangaSave.recordChronicleNode(4);
    }

    // Auto-advance to Level 5 ("Escape to the Western Ghats") after reflection period
    setTimeout(() => {
      if (this.isActive && !this.isTransitioning) {
        this.transitionToLevel5();
      }
    }, 3200);
  }

  transitionToLevel5() {
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
            window.sivagangaRouter.routeTo('/level/05-the-betrothal', { skipWipe: true });
          } else if (window.sivagangaGameplay) {
            window.sivagangaGameplay.start(5);
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

// Global Level 4 Singleton Instance
window.sivagangaTonguesOfTheWorld = new SivagangaLevel4TonguesOfTheWorld();
