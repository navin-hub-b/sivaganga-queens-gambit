/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - HOME SCREEN ENGINE
 * Ruined outer gate of Sivaganga Fort: Gopuram tower, moat, ajar doors spilling light,
 * wall-niche gate lamp reflecting save status, 4 carved waystone sigils on stone ramp,
 * fluttering firefly cursor, and parallax embers & mist.
 */

class SivagangaHomeScreen {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.firefly = { x: 0, y: 0, targetX: 0, targetY: 0, angle: 0 };
    this.mistOffset = 0;
    this.hasActiveSave = false;
    this.unlockedChronicle = false;
    this.selectedOptionIndex = 0;
    this.focusedOptionIndex = -1;
    this.cachedSaveData = null;
    this.animationFrame = null;
    this.lampLit = false;
    this.lampFlameHeight = 0;
    this.options = [
      {
        id: 'begin_journey',
        title: 'Begin the Journey',
        desc: 'Embark upon the historical struggle of Sivaganga from the sanctuary of Kalaiyar Kovil.',
        sigilType: 'rangoli_spiral',
        available: true
      },
      {
        id: 'continue',
        title: 'Continue',
        desc: 'Resume your campaign from your furthest recorded encampment in the Tamil heartland.',
        sigilType: 'bead_strand',
        available: false // will be checked against cached save
      },
      {
        id: 'chronicle',
        title: 'The Chronicle',
        desc: 'Consult the cartographic roadmap of the 20 strategic nodes across the Palayams.',
        sigilType: 'fort_rampart',
        available: true // Always unlocked and accessible
      },
      {
        id: 'settings',
        title: 'Settings',
        desc: 'Inspect accessibility covenants, interface timings, and acoustic volumes.',
        sigilType: 'palm_leaf',
        available: true
      }
    ];
  }

  init() {
    this.container = document.getElementById('view-title');
    if (!this.container) return;

    // Cache save data ONCE on load to meet Technical Robustness Contract
    this.checkAndCacheSave();

    this.setupCanvas();
    this.renderMenuSigils();
    this.bindEvents();
    this.bindBeginAnewModal();
    this.startRenderLoop();
  }

  /**
   * Technical Contract: Check for save-file presence once on load and cache the result.
   * Do not re-read storage on every frame. Guard against corruption.
   */
  checkAndCacheSave() {
    try {
      const raw = localStorage.getItem('sivaganga_queens_gambit_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.currentLevel > 1 || (parsed.completedLevels && parsed.completedLevels.length > 0))) {
          this.hasActiveSave = true;
          this.cachedSaveData = parsed;
          this.unlockedChronicle = true;
        } else if (parsed && parsed.currentLevel === 1) {
          // Check if stats or resources exist
          this.hasActiveSave = Boolean(parsed.levelStats && Object.keys(parsed.levelStats).length > 0);
          this.cachedSaveData = parsed;
          this.unlockedChronicle = true;
        }
      }
    } catch (e) {
      console.warn('HomeScreen: Safe fallback on corrupted save file', e);
      this.hasActiveSave = false;
      this.cachedSaveData = null;
      this.unlockedChronicle = true;
    }

    // Reflect onto options
    const continueOpt = this.options.find(o => o.id === 'continue');
    if (continueOpt) continueOpt.available = this.hasActiveSave;
    const chronicleOpt = this.options.find(o => o.id === 'chronicle');
    if (chronicleOpt) chronicleOpt.available = true; // Unconditionally available

    // Gate lamp unlit and grey with no save file present; ignites gold if save is present
    this.lampLit = this.hasActiveSave;
    this.lampFlameHeight = this.lampLit ? 24 : 0;
  }

  setupCanvas() {
    this.canvas = document.getElementById('home-gate-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'home-gate-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '1';
      this.container.insertBefore(this.canvas, this.container.firstChild);
    }
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  renderMenuSigils() {
    const rampContainer = document.getElementById('home-waystone-ramp');
    if (!rampContainer) return;
    rampContainer.innerHTML = '';

    this.options.forEach((opt, idx) => {
      const waystone = document.createElement('div');
      waystone.className = `waystone-node interactive-node ${opt.available ? 'carved' : 'uncarved-outline'}`;
      waystone.setAttribute('role', 'button');
      waystone.setAttribute('tabindex', opt.available ? '0' : '-1');
      waystone.setAttribute('data-option-id', opt.id);
      waystone.setAttribute('data-index', idx);

      // Carved stone sigil icon
      const sigilIcon = document.createElement('div');
      sigilIcon.className = `waystone-sigil-icon ${opt.sigilType}`;
      sigilIcon.innerHTML = this.getSigilSVG(opt.sigilType, opt.available);

      // Label plaque (Cambria serif)
      const label = document.createElement('div');
      label.className = 'waystone-title';
      label.textContent = opt.title;

      // Status mark (Shape pairing for accessibility: Circle for active, Square for uncarved)
      const shapeMark = document.createElement('span');
      shapeMark.className = `shape-indicator ${opt.available ? 'shape-circle' : 'shape-square'}`;

      waystone.appendChild(sigilIcon);
      waystone.appendChild(label);
      waystone.appendChild(shapeMark);

      // Tooltip / Description plaque in Cambria
      const plaque = document.createElement('div');
      plaque.className = 'waystone-lore-plaque';
      plaque.textContent = opt.desc;
      waystone.appendChild(plaque);

      // 4-state interaction binding
      window.sivagangaInteraction.attach(waystone, {
        onFocus: () => this.handleFocusOption(idx, waystone),
        onResolve: () => this.handleSelectOption(opt)
      });

      if (opt.isFeatured) {
        waystone.classList.add('featured-waystone');
        const badge = document.createElement('span');
        badge.className = 'waystone-badge-new';
        badge.textContent = 'NEW';
        waystone.appendChild(badge);
      }

      rampContainer.appendChild(waystone);
    });

    // Default firefly position to first available option
    setTimeout(() => {
      const firstCarved = rampContainer.querySelector('.waystone-node.carved');
      if (firstCarved) {
        const rect = firstCarved.getBoundingClientRect();
        this.firefly.x = rect.left - 24;
        this.firefly.y = rect.top + rect.height / 2;
        this.firefly.targetX = this.firefly.x;
        this.firefly.targetY = this.firefly.y;
      }
    }, 100);
  }

  handleFocusOption(index, element) {
    this.focusedOptionIndex = index;
    const rect = element.getBoundingClientRect();
    this.firefly.targetX = rect.left - 24;
    this.firefly.targetY = rect.top + rect.height / 2;
    // Show one-line description on carved plaque
    const descBox = document.getElementById('home-selection-desc');
    if (descBox) {
      descBox.textContent = this.options[index].desc;
      descBox.style.opacity = '1';
    }
  }

  handleSelectOption(opt) {
    if (window.sivagangaFlow && window.sivagangaFlow.isTransitioning) return;
    if (window.sivagangaTransitions && window.sivagangaTransitions.isWiping) return;

    if (!opt.available) {
      // Uncarved outline: play gentle fail tone and pulse outline without crashing
      window.sivagangaAudio.playQuietFade();
      const descBox = document.getElementById('home-selection-desc');
      if (descBox) {
        descBox.textContent = opt.id === 'continue'
          ? 'No recorded campaign found in stone. Select "Begin the Journey" to embark.'
          : 'Consult the cartographic roadmap of the 20 strategic nodes.';
      }
      return;
    }

    // Ignite gate lamp immediately to celebrate game start/load!
    this.igniteGateLamp();

    // Trigger destination action through Game-Flow State Machine
    if (opt.id === 'begin_journey') {
      if (this.hasActiveSave) {
        // Prior save progress would be lost: Prompt in-world ink-wash confirmation plaque
        this.showBeginAnewModal();
      } else {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('BEGIN_JOURNEY');
        } else if (window.sivagangaRouter) {
          window.sivagangaRouter.navigate('/level/01-the-only-child');
        }
      }
    } else if (opt.id === 'continue') {
      if (window.sivagangaFlow) {
        window.sivagangaFlow.transition('CONTINUE');
      } else if (window.sivagangaRouter) {
        const currentLvl = window.sivagangaSave ? (window.sivagangaSave.state.currentLevel || 1) : 1;
        window.sivagangaRouter.navigate(window.sivagangaRouter.getLevelUrl(currentLvl));
      }
    } else if (opt.id === 'chronicle') {
      if (window.sivagangaFlow) {
        window.sivagangaFlow.transition('OPEN_CHRONICLE');
      } else if (window.sivagangaRouter) {
        window.sivagangaRouter.navigate('/chronicle');
      }
    } else if (opt.id === 'settings') {
      if (window.sivagangaFlow) {
        window.sivagangaFlow.transition('OPEN_SETTINGS');
      } else if (window.sivagangaSettings) {
        window.sivagangaSettings.open();
      }
    }
  }

  bindBeginAnewModal() {
    const modal = document.getElementById('begin-anew-modal');
    if (!modal) return;

    const cancelBtn = document.getElementById('begin-anew-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        modal.classList.remove('active');
        if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll();
      };
    }

    const confirmBtn = document.getElementById('begin-anew-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        modal.classList.remove('active');
        if (window.sivagangaAudio) window.sivagangaAudio.playResolveBell();
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('BEGIN_JOURNEY');
        } else if (window.sivagangaRouter) {
          if (window.sivagangaSave) window.sivagangaSave.reset();
          window.sivagangaRouter.navigate('/level/01-the-only-child');
        }
      };
    }
  }

  showBeginAnewModal() {
    const modal = document.getElementById('begin-anew-modal');
    if (modal) {
      modal.classList.add('active');
      if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll();
    }
  }

  igniteGateLamp() {
    this.lampLit = true;
    window.sivagangaAudio.playResolveBell();
    // Diegetic HUD Diya lamp also updates
    window.sivagangaHUD.updateDiyaMorale(100);
  }

  getSigilSVG(type, isAvailable) {
    const strokeColor = isAvailable ? '#D9A441' : 'rgba(167, 190, 174, 0.4)';
    const fillColor = isAvailable ? 'rgba(217, 164, 65, 0.15)' : 'none';

    switch (type) {
      case 'rangoli_spiral':
        // Level 1's courtyard rangoli spiral
        return `
          <svg viewBox="0 0 48 48" width="40" height="40">
            <path d="M24 8 C14 8 8 14 8 24 C8 33 15 40 24 40 C32 40 38 34 38 26 C38 19 33 15 26 15 C20 15 16 19 16 24 C16 28 19 31 23 31 C26 31 28 29 28 26" 
                  fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" ${!isAvailable ? 'stroke-dasharray="3,3"' : ''}/>
            <circle cx="24" cy="24" r="3" fill="${strokeColor}"/>
          </svg>
        `;
      case 'crossed_staves':
        // Level 2's crossed Silambam staves & Valari throwing weapon
        return `
          <svg viewBox="0 0 48 48" width="40" height="40">
            <line x1="12" y1="36" x2="36" y2="12" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" ${!isAvailable ? 'stroke-dasharray="3,3"' : ''}/>
            <line x1="12" y1="12" x2="36" y2="36" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" ${!isAvailable ? 'stroke-dasharray="3,3"' : ''}/>
            <path d="M16 20 C22 15 28 18 32 26 C28 23 22 23 16 26 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.8"/>
            <circle cx="24" cy="24" r="3.5" fill="${strokeColor}"/>
          </svg>
        `;
      case 'bead_strand':
        // Level 10's trust bead strand motif
        return `
          <svg viewBox="0 0 48 48" width="40" height="40">
            <path d="M10 24 Q 24 34 38 24" fill="none" stroke="${strokeColor}" stroke-width="2" ${!isAvailable ? 'stroke-dasharray="3,3"' : ''}/>
            <circle cx="14" cy="23" r="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
            <circle cx="24" cy="29" r="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
            <circle cx="34" cy="23" r="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
          </svg>
        `;
      case 'fort_rampart':
        // The Chronicle's fort-rampart map icon
        return `
          <svg viewBox="0 0 48 48" width="40" height="40">
            <path d="M10 36 L10 22 L14 22 L14 26 L18 26 L18 22 L22 22 L22 26 L26 26 L26 22 L30 22 L30 26 L34 26 L34 22 L38 22 L38 36 Z" 
                  fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.2" ${!isAvailable ? 'stroke-dasharray="3,3"' : ''}/>
            <path d="M20 36 L20 30 C20 28 28 28 28 30 L28 36 Z" fill="#2E1F1B" stroke="${strokeColor}" stroke-width="1.8"/>
          </svg>
        `;
      case 'palm_leaf':
        // Folded palm-leaf manuscript
        return `
          <svg viewBox="0 0 48 48" width="40" height="40">
            <rect x="10" y="14" width="28" height="7" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
            <rect x="12" y="23" width="28" height="7" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
            <rect x="10" y="32" width="28" height="7" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
            <line x1="16" y1="12" x2="16" y2="40" stroke="${strokeColor}" stroke-width="1.8" stroke-dasharray="2,2"/>
          </svg>
        `;
      default:
        return '';
    }
  }

  bindEvents() {
    // Arrow key navigation between the 4 sigils
    window.addEventListener('keydown', (e) => {
      if (!this.container || !this.container.classList.contains('active-view')) return;
      if (window.sivagangaSettings && window.sivagangaSettings.isOpen) return;

      const nodes = Array.from(document.querySelectorAll('.waystone-node'));
      if (!nodes.length) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % nodes.length;
        nodes[this.selectedOptionIndex].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + nodes.length) % nodes.length;
        nodes[this.selectedOptionIndex].focus();
      }
    });
  }

  startRenderLoop() {
    const loop = () => {
      this.render();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Sivaganga Fort Ruined Outer Gate & Gopuram Tower
    this.drawFortArchitecture(ctx, w, h);

    // 2. Parallax Mist Layer
    this.drawParallaxMist(ctx, w, h);

    // 3. Wall Niche Large Oil Lamp (Grey if unlit, roaring gold if save present)
    this.drawGateLamp(ctx, w, h);

    // 4. Update and draw glowing firefly cursor
    this.drawFirefly(ctx);
  }

  drawFortArchitecture(ctx, w, h) {
    // Distant dark night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#190e0b');
    skyGrad.addColorStop(0.5, '#241410');
    skyGrad.addColorStop(1, '#2E1F1B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Gopuram Gateway Tower rising in center background
    const gopW = Math.min(420, w * 0.45);
    const gopX = w * 0.5;
    const gopBaseY = h * 0.70;
    this.drawGopuramTower(ctx, gopX, gopBaseY, gopW);

    // Massive granite ramparts left & right
    ctx.fillStyle = '#221512';
    // Left rampart
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.lineTo(w * 0.32, h * 0.42);
    ctx.lineTo(w * 0.32, h * 0.85);
    ctx.lineTo(0, h * 0.85);
    ctx.closePath();
    ctx.fill();

    // Right rampart
    ctx.beginPath();
    ctx.moveTo(w, h * 0.35);
    ctx.lineTo(w * 0.68, h * 0.42);
    ctx.lineTo(w * 0.68, h * 0.85);
    ctx.lineTo(w, h * 0.85);
    ctx.closePath();
    ctx.fill();

    // Gateway Arch & Wooden Doors slightly ajar with warm light spilling out
    this.drawGatewayDoors(ctx, w * 0.5, gopBaseY, gopW * 0.45, 160);

    // Moat crossing water in foreground
    const waterGrad = ctx.createLinearGradient(0, h * 0.82, 0, h);
    waterGrad.addColorStop(0, '#172722');
    waterGrad.addColorStop(0.6, '#0f1a16');
    waterGrad.addColorStop(1, '#080d0b');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.82, w, h * 0.18);

    // Stone ramp leading over the moat to the gate
    ctx.fillStyle = '#34211b';
    ctx.beginPath();
    ctx.moveTo(w * 0.36, gopBaseY + 60);
    ctx.lineTo(w * 0.64, gopBaseY + 60);
    ctx.lineTo(w * 0.78, h);
    ctx.lineTo(w * 0.22, h);
    ctx.closePath();
    ctx.fill();

    // Stone ramp borders in terracotta
    ctx.strokeStyle = '#B85042';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Torchlight rim-lighting along granite cornices
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.lineTo(w * 0.32, h * 0.42);
    ctx.moveTo(w, h * 0.35);
    ctx.lineTo(w * 0.68, h * 0.42);
    ctx.stroke();
  }

  drawGopuramTower(ctx, cx, baseY, width) {
    ctx.save();
    const tiers = 5;
    const tierH = 42;
    const totalH = tiers * tierH;
    const topY = baseY - totalH;

    for (let i = 0; i < tiers; i++) {
      const prog = i / tiers;
      const tW = width * (1 - prog * 0.45);
      const curY = baseY - i * tierH;

      ctx.fillStyle = i % 2 === 0 ? '#261713' : '#1e120f';
      ctx.fillRect(cx - tW / 2, curY - tierH, tW, tierH);

      // Gold-inlaid granite carvings / cornice bands
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.25)';
      ctx.strokeRect(cx - tW / 2, curY - tierH, tW, tierH);

      // Niches with miniature carvings
      const niches = 4 - i;
      const nicheW = tW / (niches + 1.5);
      for (let n = 1; n <= niches; n++) {
        const nx = (cx - tW / 2) + n * (tW / (niches + 1));
        ctx.fillStyle = '#140c0a';
        ctx.fillRect(nx - 4, curY - tierH + 8, 8, tierH - 16);
      }
    }

    // Barrel vaulted Shikhara roof with 3 brass Kalasams
    const roofW = width * 0.52;
    ctx.fillStyle = '#2d1a15';
    ctx.beginPath();
    ctx.arc(cx, topY, roofW / 2, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Kalasams
    [-roofW * 0.28, 0, roofW * 0.28].forEach(ox => {
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.arc(cx + ox, topY - roofW / 2 - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx + ox - 1.5, topY - roofW / 2 - 1, 3, 7);
    });

    // Carved Lintel Beam: Authentic Tanjore stone relief frieze
    const lintelY = baseY - 28;
    ctx.fillStyle = '#2c1914';
    ctx.fillRect(cx - width * 0.44, lintelY, width * 0.88, 30);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - width * 0.44, lintelY, width * 0.88, 30);

    // Subtle stone-carved lotus rosette medallion in center of lintel
    ctx.fillStyle = 'rgba(217, 164, 65, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, lintelY + 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Symmetrical carved relief lines along the lintel beam
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.35)';
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.4, lintelY + 15);
    ctx.lineTo(cx - 16, lintelY + 15);
    ctx.moveTo(cx + 16, lintelY + 15);
    ctx.lineTo(cx + width * 0.4, lintelY + 15);
    ctx.stroke();

    ctx.restore();
  }

  drawGatewayDoors(ctx, cx, baseY, doorW, doorH) {
    ctx.save();
    const doorY = baseY - doorH;

    // Dark gate portal interior
    ctx.fillStyle = '#0f0806';
    ctx.fillRect(cx - doorW / 2, doorY, doorW, doorH);

    // Warm golden light spilling out through ajar doors
    const spillGrad = ctx.createRadialGradient(cx, doorY + doorH * 0.7, 10, cx, doorY + doorH + 60, doorW * 1.3);
    spillGrad.addColorStop(0, 'rgba(235, 208, 118, 0.65)');
    spillGrad.addColorStop(0.4, 'rgba(217, 164, 65, 0.35)');
    spillGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');

    ctx.fillStyle = spillGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 15, doorY + 30);
    ctx.lineTo(cx + 15, doorY + 30);
    ctx.lineTo(cx + doorW * 1.1, doorY + doorH + 60);
    ctx.lineTo(cx - doorW * 1.1, doorY + doorH + 60);
    ctx.closePath();
    ctx.fill();

    // Heavy iron-studded teak doors slightly ajar
    ctx.fillStyle = '#3a2319';
    // Left door angled open
    ctx.beginPath();
    ctx.moveTo(cx - doorW / 2, doorY);
    ctx.lineTo(cx - 12, doorY + 8);
    ctx.lineTo(cx - 18, doorY + doorH);
    ctx.lineTo(cx - doorW / 2, doorY + doorH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a0e0a';
    ctx.stroke();

    // Right door angled open
    ctx.beginPath();
    ctx.moveTo(cx + doorW / 2, doorY);
    ctx.lineTo(cx + 12, doorY + 8);
    ctx.lineTo(cx + 18, doorY + doorH);
    ctx.lineTo(cx + doorW / 2, doorY + doorH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawGateLamp(ctx, w, h) {
    ctx.save();
    // Wall-niche positioned beside the gateway (left of gate)
    const nicheX = w * 0.31;
    const nicheY = h * 0.56;
    const nicheW = 44;
    const nicheH = 58;

    // Carved granite niche recess
    ctx.fillStyle = '#150c09';
    ctx.beginPath();
    ctx.arc(nicheX + nicheW / 2, nicheY + nicheH * 0.4, nicheW / 2, Math.PI, 0);
    ctx.lineTo(nicheX + nicheW, nicheY + nicheH);
    ctx.lineTo(nicheX, nicheY + nicheH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3a30';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Terracotta Diya Vessel inside niche
    const lampX = nicheX + nicheW / 2;
    const lampY = nicheY + nicheH - 8;
    ctx.fillStyle = '#7a382b';
    ctx.beginPath();
    ctx.arc(lampX, lampY, 14, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Lamp State: If NO save, grey unlit wick. If save present, ignites gold!
    if (!this.lampLit) {
      // Unlit grey wick
      ctx.fillStyle = '#554f4c';
      ctx.fillRect(lampX - 2, lampY - 14, 4, 10);
    } else {
      // Ignites gold with animated flame
      const flicker = Math.sin(Date.now() * 0.008) * 3 + (Math.random() - 0.5) * 1.5;
      const flameH = 22 + flicker;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(lampX, lampY - 12, 4, lampX, lampY - 12, 36);
      glowGrad.addColorStop(0, 'rgba(255, 230, 140, 0.9)');
      glowGrad.addColorStop(0.3, 'rgba(217, 164, 65, 0.6)');
      glowGrad.addColorStop(1, 'rgba(217, 164, 65, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lampX, lampY - 12, 36, 0, Math.PI * 2);
      ctx.fill();

      // Teardrop golden flame
      ctx.fillStyle = '#fff9d6';
      ctx.beginPath();
      ctx.moveTo(lampX - 6, lampY - 6);
      ctx.quadraticCurveTo(lampX, lampY - flameH, lampX, lampY - flameH);
      ctx.quadraticCurveTo(lampX, lampY - flameH, lampX + 6, lampY - 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawParallaxMist(ctx, w, h) {
    ctx.save();
    this.mistOffset = (this.mistOffset + 0.3) % (w * 2);

    ctx.fillStyle = 'rgba(167, 190, 174, 0.035)'; // ACCENT-SAGE soft mist
    for (let layer = 0; layer < 2; layer++) {
      const y = h * (0.68 + layer * 0.12);
      ctx.beginPath();
      ctx.ellipse(
        (this.mistOffset * (1 + layer * 0.5)) % (w + 400) - 200,
        y,
        w * 0.45,
        34,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawFirefly(ctx) {
    ctx.save();
    // Smooth dampening towards target option
    this.firefly.x += (this.firefly.targetX - this.firefly.x) * 0.12;
    this.firefly.y += (this.firefly.targetY - this.firefly.y) * 0.12;
    this.firefly.angle += 0.05;

    const bobX = Math.cos(this.firefly.angle) * 4;
    const bobY = Math.sin(this.firefly.angle * 1.5) * 4;
    const fx = this.firefly.x + bobX;
    const fy = this.firefly.y + bobY;

    // Firefly halo
    const glow = ctx.createRadialGradient(fx, fy, 1, fx, fy, 16);
    glow.addColorStop(0, '#fff4b8');
    glow.addColorStop(0.4, 'rgba(217, 164, 65, 0.7)');
    glow.addColorStop(1, 'rgba(217, 164, 65, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Central bright ember dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Global home screen singleton
window.sivagangaHome = new SivagangaHomeScreen();
