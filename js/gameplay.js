/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - CORE GAMEPLAY ENGINE
 * Handles Grid Stealth, Pebble Ripples, Line-of-Sight Occlusion, Valari Arc Aiming,
 * Durbar Diplomacy, Granary Balancing, Cipher Wheels, Sluice Hydraulics, and Non-Graphic Resolutions.
 */

class SivagangaGameplay {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.currentLevel = null;
    this.playerPos = { x: 0, y: 0 };
    this.retinuePos = { x: 0, y: 0 };
    this.sentries = [];
    this.ripples = [];
    this.valariTarget = null;
    this.valariAimArc = [];
    this.isAimingValari = false;
    this.isLevelActive = false;
    this.animationId = null;
    this.currentDialogueStep = 0;
    this.selectedHero = 'velu'; // 'velu' or 'kuyili'
    this.pebblesLeft = 0;
    this.isPebbleTargeting = false;
  }

  init() {
    this.container = document.getElementById('view-level-play');
    this.canvas = document.getElementById('gameplay-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.bindControls();
    this.bindLoreModal();
  }

  bindLoreModal() {
    const loreToggleBtn = document.getElementById('level-lore-toggle-btn');
    if (loreToggleBtn) {
      loreToggleBtn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.toggleLoreModal();
      };
    }
    const loreCloseBtn = document.getElementById('lore-modal-close-btn');
    if (loreCloseBtn) {
      loreCloseBtn.onclick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.toggleLoreModal(false);
      };
    }
    const loreModal = document.getElementById('level-lore-modal');
    if (loreModal) {
      loreModal.onclick = (e) => {
        if (e.target === loreModal) {
          this.toggleLoreModal(false);
        }
      };
    }
  }

  start(levelNumber) {
    if (window.sivagangaCourtyard && window.sivagangaCourtyard.isActive) {
      window.sivagangaCourtyard.stop();
    }
    if (window.sivagangaValariSilambam && window.sivagangaValariSilambam.isActive) {
      window.sivagangaValariSilambam.stop();
    }
    if (window.sivagangaHorseAndBow && window.sivagangaHorseAndBow.isActive) {
      window.sivagangaHorseAndBow.stop();
    }
    if (window.sivagangaTonguesOfTheWorld && window.sivagangaTonguesOfTheWorld.isActive) {
      window.sivagangaTonguesOfTheWorld.stop();
    }
    if (window.sivagangaTheBetrothal && window.sivagangaTheBetrothal.isActive) {
      window.sivagangaTheBetrothal.stop();
    }
    if (window.sivagangaQueenOfSivaganga && window.sivagangaQueenOfSivaganga.isActive) {
      window.sivagangaQueenOfSivaganga.stop();
    }
    if (window.sivagangaTheCompanysShadow && window.sivagangaTheCompanysShadow.isActive) {
      window.sivagangaTheCompanysShadow.stop();
    }

    const lvl = window.sivagangaLevels.find(l => l.id === levelNumber);
    if (!lvl) return;

    this.currentLevel = lvl;
    this.isLevelActive = true;
    this.pebblesLeft = lvl.pebbles || 0;
    this.currentDialogueStep = 0;
    this.selectedHero = 'velu';
    this.ripples = [];

    // For Levels 1 through 7, enter the bespoke experiences directly!
    if (lvl.id >= 1 && lvl.id <= 7) {
      const sigilModal = document.getElementById('sigil-modal');
      if (sigilModal) sigilModal.style.display = 'none';
      this.setupStage(lvl);
      return;
    }

    // Pre-level Sigil Presentation (Stone rangoli preview)
    window.sivagangaHUD.showRangoliSigil(
      lvl.sigilType,
      lvl.mechanicName,
      lvl.mechanicDesc,
      () => this.setupStage(lvl)
    );
  }

  setupStage(lvl) {
    // Update Stage UI headers: clean & minimal
    const titleEl = document.getElementById('level-title-text');
    if (titleEl) titleEl.textContent = `${lvl.id}. ${lvl.title}`;

    // Populate In-Level Historical Lore & Sacred Objective Modal (Hidden by default)
    const chapterTag = document.getElementById('lore-modal-chapter-tag');
    const loreTitle = document.getElementById('lore-modal-title');
    const loreMechanic = document.getElementById('lore-modal-mechanic');
    const loreBody = document.getElementById('lore-modal-body');
    const loreObjective = document.getElementById('lore-modal-objective');

    if (chapterTag) chapterTag.textContent = lvl.chapterTitle || `CHAPTER ${lvl.chapter || 1}`;
    if (loreTitle) loreTitle.textContent = `${lvl.id}. ${lvl.title}`;
    if (loreMechanic) loreMechanic.textContent = lvl.mechanicName || lvl.newSystem || 'Royal Sacred Discipline';
    if (loreBody) loreBody.textContent = lvl.loreBriefing || lvl.historicalFact || '';
    if (loreObjective) loreObjective.textContent = lvl.objective || '';

    // Bind Lore Toggle Button
    this.bindLoreModal();

    // Reset positions
    if (lvl.startPos) {
      this.playerPos = { ...lvl.startPos };
      this.retinuePos = { x: lvl.startPos.x - 1, y: lvl.startPos.y };
    }

    // Clone sentries
    this.sentries = (lvl.sentries || []).map(s => ({
      x: s.x,
      y: s.y,
      dir: s.dir,
      range: s.range || 2,
      distractedTurns: 0,
      alertState: 'calm'
    }));

    // Check level type
    if (lvl.dialogueTree) {
      this.renderDialogueTree(lvl);
    } else if (lvl.puzzleType === 'granary_balance') {
      this.renderGranaryPuzzle(lvl);
    } else if (lvl.puzzleType === 'valari_target') {
      this.renderValariPuzzle(lvl);
    } else if (lvl.puzzleType === 'cipher_wheel') {
      this.renderCipherPuzzle(lvl);
    } else if (lvl.puzzleType === 'sluice_puzzle') {
      this.renderSluicePuzzle(lvl);
    } else if (lvl.puzzleType === 'regiment_drill') {
      this.renderRegimentPuzzle(lvl);
    } else if (lvl.id === 20) {
      this.renderCoronation(lvl);
    } else if (lvl.id === 1 && window.sivagangaCourtyard) {
      // Level 1: "The Only Child" - Free-Roam Movement Tutorial & Mentors
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaCourtyard.init(this.canvas);
      window.sivagangaCourtyard.start();
    } else if (lvl.id === 2 && window.sivagangaValariSilambam) {
      // Level 2: "Valari & Silambam" - Rhythm & Timing Combat
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaValariSilambam.init(this.canvas);
      window.sivagangaValariSilambam.start();
    } else if (lvl.id === 3 && window.sivagangaHorseAndBow) {
      // Level 3: "Horse and Bow" - Equestrian Horsemanship & Precision Archery
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaHorseAndBow.init(this.canvas);
      window.sivagangaHorseAndBow.start();
    } else if (lvl.id === 4 && window.sivagangaTonguesOfTheWorld) {
      // Level 4: "Tongues of the World" - Multilingual Translation & Code Matching
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaTonguesOfTheWorld.init(this.canvas);
      window.sivagangaTonguesOfTheWorld.start();
    } else if (lvl.id === 5 && window.sivagangaTheBetrothal) {
      // Level 5: "The Betrothal" - Chapter 1 Finale Tournament & Diplomatic Betrothal
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaTheBetrothal.init(this.canvas);
      window.sivagangaTheBetrothal.start();
    } else if (lvl.id === 6 && window.sivagangaQueenOfSivaganga) {
      // Level 6: "Queen of Sivaganga" - Statecraft & Village-Economy Management
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaQueenOfSivaganga.init(this.canvas);
      window.sivagangaQueenOfSivaganga.start();
    } else if (lvl.id === 7 && window.sivagangaTheCompanysShadow) {
      // Level 7: "The Company's Shadow" - Awareness & Stealth Infiltration
      this.hidePuzzleOverlays();
      this.handleResize();
      window.sivagangaTheCompanysShadow.init(this.canvas);
      window.sivagangaTheCompanysShadow.start();
    } else {
      // Standard Grid Stealth Stage
      this.hidePuzzleOverlays();
      this.showDialogue(lvl.dialogue?.speaker, lvl.dialogue?.text);
      this.handleResize();
      this.startLoop();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    const stage = document.querySelector('.level-canvas-stage');
    if (stage) {
      this.canvas.width = stage.clientWidth || 800;
      this.canvas.height = stage.clientHeight || 500;
    }
  }

  startLoop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const loop = () => {
      if (!this.isLevelActive) return;
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  render() {
    if (!this.ctx || !this.canvas || !this.currentLevel) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const lvl = this.currentLevel;

    ctx.clearRect(0, 0, w, h);

    if (!lvl.gridSize) return;

    // Calculate grid cell size
    const cols = lvl.gridSize.cols;
    const rows = lvl.gridSize.rows;
    const cellSize = Math.min(Math.floor((w - 40) / cols), Math.floor((h - 40) / rows));
    const offsetX = Math.floor((w - cols * cellSize) / 2);
    const offsetY = Math.floor((h - rows * cellSize) / 2);

    this.cellSize = cellSize;
    this.gridOffset = { x: offsetX, y: offsetY };

    // 1. Draw Ground Stone Pavement
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;
        const isShadow = (lvl.shadows || []).some(s => s.x === c && s.y === r);

        ctx.fillStyle = isShadow ? '#1b120f' : '#2d1c18';
        ctx.fillRect(x, y, cellSize, cellSize);

        ctx.strokeStyle = isShadow ? 'rgba(50, 30, 25, 0.6)' : 'rgba(184, 80, 66, 0.2)';
        ctx.strokeRect(x, y, cellSize, cellSize);

        if (isShadow) {
          // Banyan leaves shadow texture
          ctx.fillStyle = 'rgba(15, 9, 8, 0.5)';
          ctx.beginPath();
          ctx.arc(x + cellSize * 0.3, y + cellSize * 0.3, cellSize * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Kalyani (Stepped Temple Tank) if present
    if (lvl.kalyani) {
      const kx = offsetX + lvl.kalyani.x * cellSize;
      const ky = offsetY + lvl.kalyani.y * cellSize;
      const kw = lvl.kalyani.w * cellSize;
      const kh = lvl.kalyani.h * cellSize;
      SivagangaTanjoreArt.drawKalyani(ctx, kx, ky, kw, kh);
    }

    // 3. Draw Granite Pillars
    (lvl.pillars || []).forEach(p => {
      const px = offsetX + p.x * cellSize;
      const py = offsetY + p.y * cellSize;
      ctx.fillStyle = '#422822';
      ctx.fillRect(px + 4, py + 4, cellSize - 8, cellSize - 8);
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 4, py + 4, cellSize - 8, cellSize - 8);

      // Carved Yali pillar cross
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 6);
      ctx.lineTo(px + cellSize - 6, py + cellSize - 6);
      ctx.moveTo(px + cellSize - 6, py + 6);
      ctx.lineTo(px + 6, py + cellSize - 6);
      ctx.stroke();
    });

    // 4. Draw Water Ripples
    this.ripples.forEach((rip, idx) => {
      rip.radius += 1.2;
      rip.alpha -= 0.015;
      if (rip.alpha > 0) {
        ctx.strokeStyle = `rgba(167, 190, 174, ${rip.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        this.ripples.splice(idx, 1);
      }
    });

    // 5. Draw Target Exit (Sage Green Temple Archway)
    if (lvl.targetPos) {
      const tx = offsetX + lvl.targetPos.x * cellSize;
      const ty = offsetY + lvl.targetPos.y * cellSize;
      ctx.fillStyle = 'rgba(167, 190, 174, 0.25)';
      ctx.fillRect(tx, ty, cellSize, cellSize);
      ctx.strokeStyle = '#A7BEAE';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tx, ty, cellSize, cellSize);

      // Lotus arch marker
      ctx.fillStyle = '#A7BEAE';
      ctx.font = 'bold 12px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GOAL', tx + cellSize / 2, ty + cellSize / 2);
    }

    // 6. Draw Intel Pickups
    (lvl.intelPickups || []).forEach(item => {
      if (item.collected) return;
      const ix = offsetX + item.x * cellSize + cellSize / 2;
      const iy = offsetY + item.y * cellSize + cellSize / 2;

      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(ix, iy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Triangle indicator on item for accessibility
      ctx.fillStyle = '#A7BEAE';
      ctx.beginPath();
      ctx.moveTo(ix, iy - 11);
      ctx.lineTo(ix - 5, iy - 3);
      ctx.lineTo(ix + 5, iy - 3);
      ctx.closePath();
      ctx.fill();
    });

    // 7. Draw Sentries & Threat Vision Cones (Square Threat Markers)
    this.sentries.forEach(s => {
      this.drawSentryVisionCone(ctx, s, offsetX, offsetY, cellSize);
      const sx = offsetX + s.x * cellSize + cellSize / 2;
      const sy = offsetY + s.y * cellSize + cellSize / 2;

      // British Redcoat Sentry
      ctx.fillStyle = '#7A1F1F'; // DANGER-DEEP
      ctx.beginPath();
      ctx.arc(sx, sy, cellSize * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White crossbelt
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy - 5);
      ctx.lineTo(sx + 5, sy + 5);
      ctx.stroke();

      // Square Threat indicator above sentry
      ctx.fillStyle = '#7A1F1F';
      ctx.strokeStyle = '#ebd076';
      ctx.fillRect(sx - 5, sy - cellSize * 0.44, 10, 10);
      ctx.strokeRect(sx - 5, sy - cellSize * 0.44, 10, 10);
    });

    // 8. Draw Player (Velu Nachiyar - Golden Silhouette)
    const px = offsetX + this.playerPos.x * cellSize + cellSize / 2;
    const py = offsetY + this.playerPos.y * cellSize + cellSize / 2;

    ctx.save();
    ctx.fillStyle = '#D9A441';
    ctx.shadowColor = '#D9A441';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py, cellSize * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circle Morale indicator above Queen
    ctx.strokeStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(px, py - cellSize * 0.44, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawSentryVisionCone(ctx, sentry, ox, oy, cs) {
    const sx = ox + sentry.x * cs + cs / 2;
    const sy = oy + sentry.y * cs + cs / 2;
    const range = (sentry.range || 2) * cs;

    let startAngle = 0;
    let endAngle = Math.PI / 2;

    if (sentry.dir === 'down') {
      startAngle = Math.PI * 0.25;
      endAngle = Math.PI * 0.75;
    } else if (sentry.dir === 'up') {
      startAngle = Math.PI * 1.25;
      endAngle = Math.PI * 1.75;
    } else if (sentry.dir === 'left') {
      startAngle = Math.PI * 0.75;
      endAngle = Math.PI * 1.25;
    } else if (sentry.dir === 'right') {
      startAngle = -Math.PI * 0.25;
      endAngle = Math.PI * 0.25;
    }

    ctx.save();
    ctx.fillStyle = 'rgba(122, 31, 31, 0.22)'; // DANGER-DEEP translucent
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.arc(sx, sy, range, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(122, 31, 31, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  bindControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isLevelActive) return;

      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
      else if (e.key === 'p' || e.key === 'P') {
        this.throwPebbleAtTarget();
        return;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        this.attemptMove(dx, dy);
      }
    });

    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        if (!this.isLevelActive || !this.cellSize) return;
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const cellX = Math.floor((clickX - this.gridOffset.x) / this.cellSize);
        const cellY = Math.floor((clickY - this.gridOffset.y) / this.cellSize);

        const dx = cellX - this.playerPos.x;
        const dy = cellY - this.playerPos.y;

        if (Math.abs(dx) + Math.abs(dy) === 1) {
          this.attemptMove(dx, dy);
        } else if (this.pebblesLeft > 0) {
          this.triggerPebbleRipple(clickX, clickY, cellX, cellY);
        }
      });
    }

    const pauseBtn = document.getElementById('level-pause-btn');
    const restartBtn = document.getElementById('level-restart-btn');
    const exitBtn = document.getElementById('level-exit-btn');

    if (pauseBtn) {
      pauseBtn.onclick = () => this.togglePause();
    }

    if (restartBtn) {
      restartBtn.onclick = () => {
        if (window.sivagangaCourtyard) window.sivagangaCourtyard.stop();
        if (this.currentLevel) this.start(this.currentLevel.id);
      };
    }

    if (exitBtn) {
      exitBtn.onclick = () => {
        this.isLevelActive = false;
        if (window.sivagangaCourtyard) window.sivagangaCourtyard.stop();
        if (window.sivagangaValariSilambam) window.sivagangaValariSilambam.stop();
        if (window.sivagangaRouter) {
          window.sivagangaRouter.navigate('/chronicle');
        } else {
          window.sivagangaMain.openChronicle(this.currentLevel?.id);
        }
      };
    }

    // In-Level Pause Modal Actions
    const pauseResume = document.getElementById('pause-resume-btn');
    const pauseChronicle = document.getElementById('pause-chronicle-btn');
    const pauseSettings = document.getElementById('pause-settings-btn');
    const pauseHome = document.getElementById('pause-home-btn');

    if (pauseResume) {
      pauseResume.onclick = () => {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('RESUME');
        } else {
          this.closePause();
        }
      };
    }
    if (pauseChronicle) {
      pauseChronicle.onclick = () => {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('GO_CHRONICLE');
        } else {
          this.closePause();
          this.stopLevelInstances();
          if (window.sivagangaRouter) {
            window.sivagangaRouter.navigate('/chronicle');
          } else {
            window.sivagangaMain.openChronicle(this.currentLevel?.id);
          }
        }
      };
    }
    if (pauseSettings) {
      pauseSettings.onclick = () => {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('OPEN_SETTINGS');
        } else if (window.sivagangaSettings) {
          window.sivagangaSettings.open();
        }
      };
    }
    if (pauseHome) {
      pauseHome.onclick = () => {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('QUIT_HOME');
        } else {
          this.closePause();
          this.stopLevelInstances();
          if (window.sivagangaRouter) {
            window.sivagangaRouter.navigate('/');
          } else {
            window.sivagangaMain.openTitleScreen();
          }
        }
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const loreModal = document.getElementById('level-lore-modal');
        if (loreModal && (loreModal.classList.contains('active') || loreModal.style.display === 'flex')) {
          this.toggleLoreModal(false);
          return;
        }
        if (this.isLevelActive) {
          this.togglePause();
        }
      } else if (e.key === 'h' || e.key === 'H' || e.code === 'KeyH' || e.key === 'F1') {
        const levelView = document.getElementById('view-level-play');
        const isLevelView = levelView && levelView.classList.contains('active-view');
        if (this.isLevelActive || isLevelView || window.sivagangaCourtyard?.isActive || window.sivagangaValariSilambam?.isActive) {
          e.preventDefault();
          this.toggleLoreModal();
        }
      }
    });
  }

  toggleLoreModal(forceState = null) {
    const modal = document.getElementById('level-lore-modal');
    if (!modal) return;
    const isCurrentlyActive = modal.classList.contains('active') || modal.style.display === 'flex';
    const nextState = forceState !== null ? forceState : !isCurrentlyActive;

    if (nextState) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
      modal.style.pointerEvents = 'auto';
      if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll();
    } else {
      modal.classList.remove('active');
      modal.style.display = 'none';
      modal.style.opacity = '0';
      modal.style.visibility = 'hidden';
      modal.style.pointerEvents = 'none';
      if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll();
    }
  }

  stopLevelInstances() {
    this.isLevelActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (window.sivagangaCourtyard) window.sivagangaCourtyard.stop();
    if (window.sivagangaValariSilambam) window.sivagangaValariSilambam.stop();
    this.hidePuzzleOverlays();
  }

  togglePause() {
    if (window.sivagangaFlow) {
      if (window.sivagangaFlow.state === 'LEVEL') {
        window.sivagangaFlow.transition('PAUSE');
      } else if (window.sivagangaFlow.state === 'LEVEL_PAUSE') {
        window.sivagangaFlow.transition('RESUME');
      }
      return;
    }
    const modal = document.getElementById('level-pause-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
      this.closePause();
    } else {
      this.openPause();
    }
  }

  openPause() {
    if (window.sivagangaFlow && window.sivagangaFlow.state === 'LEVEL') {
      window.sivagangaFlow.transition('PAUSE');
      return;
    }
    const modal = document.getElementById('level-pause-modal');
    if (modal) {
      modal.classList.add('active');
      window.sivagangaAudio.playPalmLeafScroll();
    }
  }

  closePause() {
    if (window.sivagangaFlow && window.sivagangaFlow.state === 'LEVEL_PAUSE') {
      window.sivagangaFlow.transition('RESUME');
      return;
    }
    const modal = document.getElementById('level-pause-modal');
    if (modal) {
      modal.classList.remove('active');
      window.sivagangaAudio.playPalmLeafScroll();
    }
  }

  attemptMove(dx, dy) {
    const lvl = this.currentLevel;
    const newX = this.playerPos.x + dx;
    const newY = this.playerPos.y + dy;

    // Bounds check
    if (newX < 0 || newX >= lvl.gridSize.cols || newY < 0 || newY >= lvl.gridSize.rows) {
      return;
    }

    // Granite Pillar obstruction
    const isPillar = (lvl.pillars || []).some(p => p.x === newX && p.y === newY);
    if (isPillar) {
      window.sivagangaAudio.playQuietFade();
      return;
    }

    // Step audio
    window.sivagangaAudio.playFocusPing();
    this.playerPos.x = newX;
    this.playerPos.y = newY;

    // Check Intel Pickups
    (lvl.intelPickups || []).forEach(item => {
      if (!item.collected && item.x === newX && item.y === newY) {
        item.collected = true;
        window.sivagangaSave.modifyIntel(1);
        window.sivagangaHUD.updateGarlandIntel(window.sivagangaSave.state.resources.intel);
        window.sivagangaAudio.playResolveBell();
      }
    });

    // Check Goal
    if (lvl.targetPos && newX === lvl.targetPos.x && newY === lvl.targetPos.y) {
      this.handleVictory();
      return;
    }

    // Sentry Turn & Detection Check
    this.updateSentries();
  }

  triggerPebbleRipple(canvasX, canvasY, cellX, cellY) {
    if (this.pebblesLeft <= 0) return;
    this.pebblesLeft--;
    window.sivagangaAudio.playPebblePlink();

    this.ripples.push({
      x: canvasX,
      y: canvasY,
      radius: 4,
      alpha: 1.0
    });

    // Divert nearby sentries towards ripple
    this.sentries.forEach(s => {
      const dist = Math.abs(s.x - cellX) + Math.abs(s.y - cellY);
      if (dist <= 4) {
        // Divert sentry gaze to ripple
        if (cellX > s.x) s.dir = 'right';
        else if (cellX < s.x) s.dir = 'left';
        else if (cellY > s.y) s.dir = 'down';
        else s.dir = 'up';
        s.distractedTurns = 3;
      }
    });
  }

  updateSentries() {
    const lvl = this.currentLevel;
    const inShadow = (lvl.shadows || []).some(s => s.x === this.playerPos.x && s.y === this.playerPos.y);

    for (let s of this.sentries) {
      if (s.distractedTurns > 0) {
        s.distractedTurns--;
        continue;
      }

      // Check detection cone
      const detected = this.checkSentryLineOfSight(s, this.playerPos, inShadow, lvl.pillars || []);
      if (detected) {
        // Detection: Non-graphic dignified retreat / moral deduction
        window.sivagangaAudio.playQuietFade();
        window.sivagangaSave.modifyMorale(-25);
        window.sivagangaHUD.updateDiyaMorale(window.sivagangaSave.state.resources.morale);

        // Reset to start of level with dignified message
        this.showDialogue('Velu Nachiyar', 'A sentry spotted our shadow! Fall back to the granite trees and regroup.');
        this.playerPos = { ...lvl.startPos };
        return;
      }
    }
  }

  checkSentryLineOfSight(sentry, target, inShadow, pillars) {
    if (inShadow) return false; // Shadow provides total concealment

    const dx = target.x - sentry.x;
    const dy = target.y - sentry.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > (sentry.range || 2)) return false;

    // Check direction alignment
    if (sentry.dir === 'down' && dy <= 0) return false;
    if (sentry.dir === 'up' && dy >= 0) return false;
    if (sentry.dir === 'left' && dx >= 0) return false;
    if (sentry.dir === 'right' && dx <= 0) return false;

    // Check pillar occlusion between sentry and target
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    let curX = sentry.x + stepX;
    let curY = sentry.y + stepY;

    while (curX !== target.x || curY !== target.y) {
      if (pillars.some(p => p.x === curX && p.y === curY)) {
        return false; // Pillar occludes vision!
      }
      if (curX !== target.x) curX += stepX;
      if (curY !== target.y) curY += stepY;
    }

    return true;
  }

  handleVictory() {
    this.isLevelActive = false;
    if (window.sivagangaCourtyard) window.sivagangaCourtyard.stop();
    if (window.sivagangaValariSilambam) window.sivagangaValariSilambam.stop();
    window.sivagangaAudio.playResolveBell();

    const lvl = this.currentLevel;
    if (!lvl) return;

    // Unlock alliance if this level granted one
    if (typeof lvl.allianceUnlocked === 'number') {
      const isReplay = window.sivagangaRouter ? window.sivagangaRouter.isReplay : false;
      window.sivagangaSave.setAlliance(lvl.allianceUnlocked, true, isReplay);
      window.sivagangaHUD.ringBell(lvl.allianceUnlocked);
    }

    if (window.sivagangaRouter) {
      window.sivagangaRouter.handleLevelCompletion(lvl.id, { stars: 3, completed: true });
      return;
    }

    window.sivagangaSave.recordLevelComplete(lvl.id, { stars: 3, completed: true });

    // Fallback: Show Victory Resolution Modal (Non-graphic, respectful)
    const modal = document.getElementById('level-victory-modal');
    if (modal) {
      document.getElementById('victory-title-text').textContent = `Trial Accomplished: ${lvl.title}`;
      document.getElementById('victory-lore-text').textContent = lvl.historicalFact;
      modal.classList.add('active');

      const nextBtn = document.getElementById('victory-next-btn');
      const roadmapBtn = document.getElementById('victory-chronicle-btn');

      if (lvl.id === 1) {
        nextBtn.innerHTML = '<span>Proceed to Level 2: Valari &amp; Silambam &rarr;</span>';
      } else {
        nextBtn.innerHTML = '<span>Next Trial &rarr;</span>';
      }

      nextBtn.onclick = () => {
        modal.classList.remove('active');
        if (lvl.id < 20) {
          window.sivagangaMain.startLevel(lvl.id + 1);
        } else {
          window.sivagangaMain.openChronicle();
        }
      };

      roadmapBtn.onclick = () => {
        modal.classList.remove('active');
        window.sivagangaMain.openChronicle();
      };
    }
  }

  showDialogue(speaker, text) {
    const overlay = document.getElementById('level-dialogue-box');
    if (!overlay || !speaker) return;
    document.getElementById('dialogue-speaker-name').textContent = speaker;
    document.getElementById('dialogue-content-text').textContent = text;
    overlay.style.display = 'flex';
  }

  hidePuzzleOverlays() {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // --- Specialized Puzzle Handlers ---

  renderDialogueTree(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = '';

    const step = lvl.dialogueTree[this.currentDialogueStep];
    if (!step) {
      this.handleVictory();
      return;
    }

    const box = document.createElement('div');
    box.className = 'durbar-dialogue-card';
    box.innerHTML = `
      <h3 style="color: var(--accent-gold); margin-bottom: 12px;">${lvl.title}</h3>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${step.prompt}</p>
      <div class="dialogue-choices-column" style="display: flex; flex-direction: column; gap: 12px;"></div>
    `;

    const choicesCol = box.querySelector('.dialogue-choices-column');
    step.choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'btn-tamil btn-primary';
      btn.style.textAlign = 'left';
      btn.textContent = ch.text;

      btn.onclick = () => {
        window.sivagangaSave.modifyTrust(ch.deltaTrust);
        window.sivagangaHUD.updateWristBangles(window.sivagangaSave.state.resources.trust);
        alert(ch.reply);
        this.currentDialogueStep++;
        this.renderDialogueTree(lvl);
      };
      choicesCol.appendChild(btn);
    });

    overlay.appendChild(box);
  }

  renderGranaryPuzzle(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="granary-card" style="background: #241410; padding: 24px; border: 2px solid var(--accent-gold); border-radius: 8px; width: min(520px, 90vw);">
        <h3 style="color: var(--accent-gold); margin-bottom: 14px;">The Granary Allocation of Virupakshi</h3>
        <p style="font-size: 14px; margin-bottom: 18px;">Balance grain rations between Refugee Families, Garrison Defense, and Mountain Scouts.</p>
        
        <div style="margin-bottom: 14px;">
          <label style="display: flex; justify-content: space-between;"><span>Refugee Families</span><span id="grain-refugee-val">150</span></label>
          <input type="range" id="granary-refugee-slider" min="50" max="250" value="150" style="width: 100%; accent-color: var(--accent-gold);">
        </div>
        <div style="margin-bottom: 14px;">
          <label style="display: flex; justify-content: space-between;"><span>Garrison Provisions</span><span id="grain-garrison-val">150</span></label>
          <input type="range" id="granary-garrison-slider" min="50" max="250" value="150" style="width: 100%; accent-color: var(--accent-gold);">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: flex; justify-content: space-between;"><span>Mountain Scouts</span><span id="grain-scout-val">100</span></label>
          <input type="range" id="granary-scout-slider" min="20" max="150" value="100" style="width: 100%; accent-color: var(--accent-gold);">
        </div>
        <button id="granary-confirm-btn" class="btn-tamil btn-primary" style="width: 100%;">Confirm Rations Compact</button>
      </div>
    `;

    const rSlider = document.getElementById('granary-refugee-slider');
    const gSlider = document.getElementById('granary-garrison-slider');
    const sSlider = document.getElementById('granary-scout-slider');

    const updateVals = () => {
      document.getElementById('grain-refugee-val').textContent = rSlider.value;
      document.getElementById('grain-garrison-val').textContent = gSlider.value;
      document.getElementById('grain-scout-val').textContent = sSlider.value;
    };
    rSlider.oninput = gSlider.oninput = sSlider.oninput = updateVals;

    document.getElementById('granary-confirm-btn').onclick = () => {
      window.sivagangaSave.modifyMorale(15);
      window.sivagangaHUD.updateDiyaMorale(window.sivagangaSave.state.resources.morale);
      this.handleVictory();
    };
  }

  renderValariPuzzle(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="text-align: center; background: #221511; padding: 24px; border: 2px solid var(--accent-gold); border-radius: 8px;">
        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">The Valari Arc</h3>
        <p style="margin-bottom: 18px;">Click 'Release Valari' along the curved arc to snip the sentry lantern rope non-lethally.</p>
        <div style="position: relative; width: 340px; height: 160px; margin: 0 auto 20px; border: 1px dashed var(--accent-gold); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 340 160" width="340" height="160">
            <path d="M 40 130 Q 170 10 300 80" fill="none" stroke="#D9A441" stroke-width="3" stroke-dasharray="6,4"/>
            <circle cx="40" cy="130" r="10" fill="#B85042"/>
            <circle cx="300" cy="80" r="14" fill="#ebd076"/>
          </svg>
        </div>
        <button id="valari-throw-btn" class="btn-tamil btn-primary" style="margin: 0 auto;">Release Valari Strike</button>
      </div>
    `;

    document.getElementById('valari-throw-btn').onclick = () => {
      window.sivagangaAudio.playPebblePlink();
      window.sivagangaAudio.playResolveBell();
      this.handleVictory();
    };
  }

  renderCipherPuzzle(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="text-align: center; background: #221511; padding: 24px; border: 2px solid var(--accent-gold); border-radius: 8px;">
        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">EIC Munitions Cipher</h3>
        <p style="margin-bottom: 18px;">Align the concentric cipher disks to decode the colonial supply depot.</p>
        <div style="margin-bottom: 20px; font-family: var(--font-serif); font-size: 20px; color: var(--accent-gold); letter-spacing: 3px;">
          [ R A J A R A J E S H W A R I ]
        </div>
        <button id="cipher-solve-btn" class="btn-tamil btn-primary" style="margin: 0 auto;">Decipher Ammunition Vault</button>
      </div>
    `;

    document.getElementById('cipher-solve-btn').onclick = () => {
      window.sivagangaAudio.playResolveBell();
      this.handleVictory();
    };
  }

  renderSluicePuzzle(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="text-align: center; background: #221511; padding: 24px; border: 2px solid var(--accent-gold); border-radius: 8px;">
        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">Moat Sluice Alignment</h3>
        <p style="margin-bottom: 18px;">Turn the granite sluice gate wheels to divert the moat into the temple spillway.</p>
        <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 20px;">
          <button class="btn-tamil" id="sluice-w1">Wheel I: OPEN</button>
          <button class="btn-tamil" id="sluice-w2">Wheel II: OPEN</button>
          <button class="btn-tamil" id="sluice-w3">Wheel III: OPEN</button>
        </div>
        <button id="sluice-drain-btn" class="btn-tamil btn-primary" style="margin: 0 auto;">Drain Moat Passage</button>
      </div>
    `;

    document.getElementById('sluice-drain-btn').onclick = () => {
      window.sivagangaAudio.playTempleBell();
      this.handleVictory();
    };
  }

  renderRegimentPuzzle(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="text-align: center; background: #221511; padding: 24px; border: 2px solid var(--accent-gold); border-radius: 8px;">
        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">The Udaiyaal Regiment</h3>
        <p style="margin-bottom: 18px;">Align the women's Silambam defense units into four cardinal protective rings.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="padding: 10px; border: 1px solid var(--accent-gold);">North Wing: Locked</div>
          <div style="padding: 10px; border: 1px solid var(--accent-gold);">East Wing: Locked</div>
          <div style="padding: 10px; border: 1px solid var(--accent-gold);">South Wing: Locked</div>
          <div style="padding: 10px; border: 1px solid var(--accent-gold);">West Wing: Locked</div>
        </div>
        <button id="regiment-drill-btn" class="btn-tamil btn-primary" style="margin: 0 auto;">Complete Formation Drill</button>
      </div>
    `;

    document.getElementById('regiment-drill-btn').onclick = () => {
      window.sivagangaAudio.playResolveBell();
      this.handleVictory();
    };
  }

  renderCoronation(lvl) {
    const overlay = document.getElementById('level-puzzle-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="text-align: center; background: #241410; padding: 32px; border: 3px solid var(--accent-gold); border-radius: 12px; max-width: 620px;">
        <h2 style="color: var(--accent-gold); font-size: 26px; margin-bottom: 14px;">The Coronation of Sivaganga (1780)</h2>
        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 24px; color: #f2e1d0;">
          Rani Velu Nachiyar ascends the throne of Sivaganga. The British colonial forces have been vanquished from the realm. 
          The royal umbrella is hoisted, the temple bells toll in jubilee, and Sivaganga stands sovereign once more.
        </p>
        <button id="coronation-ascend-btn" class="btn-tamil btn-primary" style="margin: 0 auto; font-size: 18px; padding: 14px 32px;">
          Ascend the Throne of Sivaganga
        </button>
      </div>
    `;

    document.getElementById('coronation-ascend-btn').onclick = () => {
      // Ring all 4 alliance bells simultaneously!
      for (let i = 0; i < 4; i++) {
        setTimeout(() => window.sivagangaHUD.ringBell(i), i * 300);
      }
      this.handleVictory();
    };
  }
}

// Global gameplay engine singleton
window.sivagangaGameplay = new SivagangaGameplay();
