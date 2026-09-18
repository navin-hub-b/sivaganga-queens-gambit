/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - DIEGETIC HUD ENGINE
 * Architecture-integrated indicators: Diya flame, wrist bangles, garland beads, archway bells, rangoli sigils.
 */

class SivagangaDiegeticHUD {
  constructor() {
    this.container = null;
    this.flameEl = null;
    this.banglesContainer = null;
    this.garlandContainer = null;
    this.bellsContainer = null;
    this.tooltipEl = null;
    this.flameCanvas = null;
    this.flameCtx = null;
    this.flameParticles = [];
  }

  init() {
    this.container = document.getElementById('diegetic-hud');
    this.flameEl = document.querySelector('.diya-flame');
    this.banglesContainer = document.querySelector('.bangles-stack');
    this.garlandContainer = document.querySelector('.garland-string');
    this.bellsContainer = document.querySelector('.hud-archway-bells');
    this.tooltipEl = document.getElementById('hud-tooltip');

    this.setupTooltips();
    this.updateAll(window.sivagangaSave.state.resources);
  }

  setupTooltips() {
    const attach = (selector, text) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.addEventListener('mouseenter', (e) => this.showTooltip(e, text));
      el.addEventListener('mouseleave', () => this.hideTooltip());
      el.addEventListener('click', (e) => this.showTooltip(e, text));
    };

    attach('.hud-diya-niche', 'Granite Niche Diya: Flame height embodies Royal Morale (Circle Indicator). Diminishes if detected or supplies dwindle.');
    attach('.hud-wrist-bangles', 'Bangles of Velu Nachiyar: Worn on the Queen\'s wrist. Added or removed as Chieftains and Allies place their trust in Sivaganga.');
    attach('.hud-archway-bells', 'Fort Archway Bells: Four sacred bronze bells honoring the Great Alliances (Virupakshi, Mysore, Maruthu Brothers, Udaiyaal). Each rings and shines gold when forged.');
    attach('.hud-intel-garland', 'Garland of Couriers: Woven beads counting intercepted dispatches and tactical reconnaissance (Triangle Indicator).');
  }

  showTooltip(e, text) {
    if (!this.tooltipEl) return;
    this.tooltipEl.textContent = text;
    this.tooltipEl.classList.add('visible');

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 220, Math.max(20, rect.left + rect.width / 2 - 100));
    const y = rect.bottom + 12 < window.innerHeight - 60 ? rect.bottom + 12 : rect.top - 50;

    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove('visible');
  }

  updateAll(resources) {
    if (!resources) return;
    this.updateDiyaMorale(resources.morale);
    this.updateWristBangles(resources.trust);
    this.updateGarlandIntel(resources.intel);
    this.updateAllianceBells(resources.alliances);
  }

  /**
   * Updates the Diya flame size and intensity in the granite fort niche.
   */
  updateDiyaMorale(moraleVal) {
    if (!this.flameEl) return;
    const clamped = window.sivagangaSave.constructor.clamp(moraleVal, 0, 100);
    // Height ranges from 8px (faint ember) to 32px (roaring sacred flame)
    const height = 8 + (clamped / 100) * 24;
    const opacity = 0.25 + (clamped / 100) * 0.75;
    const glow = Math.round(4 + (clamped / 100) * 12);

    this.flameEl.style.height = `${height}px`;
    this.flameEl.style.opacity = opacity;
    this.flameEl.style.filter = `drop-shadow(0 -4px ${glow}px rgba(217, 164, 65, ${opacity}))`;
  }

  /**
   * Updates wrist bangles on Velu Nachiyar's wrist (0 to 5 bangles).
   */
  updateWristBangles(trustVal) {
    if (!this.banglesContainer) return;
    const count = window.sivagangaSave.constructor.clamp(trustVal, 0, 5);
    this.banglesContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
      const bangle = document.createElement('div');
      bangle.className = `bangle-item ${i % 2 === 0 ? 'bangle-gold' : 'bangle-sage'} ${i < count ? 'bangle-shimmer' : 'inactive'}`;
      this.banglesContainer.appendChild(bangle);
    }
  }

  /**
   * Updates garland beads counting intel.
   */
  updateGarlandIntel(intelVal) {
    if (!this.garlandContainer) return;
    const count = window.sivagangaSave.constructor.clamp(intelVal, 0, 10);
    this.garlandContainer.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const bead = document.createElement('div');
      bead.className = `garland-bead ${i < count ? '' : 'inactive'}`;
      this.garlandContainer.appendChild(bead);
    }

    const num = document.querySelector('.garland-count-numeral');
    if (num) num.textContent = `${count}`;
  }

  /**
   * Updates the four alliance bells along the archway.
   */
  updateAllianceBells(alliances = [false, false, false, false]) {
    if (!this.bellsContainer) return;
    const bellNodes = this.bellsContainer.querySelectorAll('.temple-bell-node');
    const names = ['Virupakshi', 'Mysore', 'Maruthu', 'Udaiyaal'];

    bellNodes.forEach((node, idx) => {
      const isAllied = Boolean(alliances[idx]);
      node.className = `temple-bell-node ${isAllied ? 'allied' : 'locked'}`;
      node.title = `${names[idx]} Alliance: ${isAllied ? 'Forged in Loyalty' : 'Awaiting Compact'}`;
    });
  }

  /**
   * Ring an alliance bell with animation and golden ripple.
   */
  ringBell(index) {
    if (!this.bellsContainer) return;
    const bellNodes = this.bellsContainer.querySelectorAll('.temple-bell-node');
    if (bellNodes[index]) {
      const brass = bellNodes[index].querySelector('.bell-brass');
      brass.classList.remove('bell-swinging');
      void brass.offsetWidth; // trigger reflow
      brass.classList.add('bell-swinging');
      bellNodes[index].classList.remove('locked');
      bellNodes[index].classList.add('allied');
      window.sivagangaAudio.playTempleBell();
    }
  }

  /**
   * Renders the Rangoli / Kolam Stone Sigil Preview Modal before a trial starts.
   * Geometric stone etching introducing the mechanic without text-first reliance.
   */
  showRangoliSigil(sigilType, mechanicTitle, mechanicDescription, onProceed) {
    const modal = document.getElementById('sigil-modal');
    if (!modal) {
      if (onProceed) onProceed();
      return;
    }

    const canvas = document.getElementById('sigil-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Rangoli Sigil on stone
    this.renderRangoliPattern(ctx, sigilType, canvas.width, canvas.height);

    document.getElementById('sigil-title').textContent = mechanicTitle;
    document.getElementById('sigil-desc').textContent = mechanicDescription;

    modal.style.display = 'flex';
    window.sivagangaAudio.playResolveBell();

    const proceedBtn = document.getElementById('sigil-proceed-btn');
    const closeBtn = document.getElementById('sigil-close-btn');

    const handleDismiss = () => {
      proceedBtn.removeEventListener('click', handleDismiss);
      if (closeBtn) closeBtn.removeEventListener('click', handleDismiss);
      modal.style.display = 'none';
      if (onProceed) onProceed();
    };

    proceedBtn.addEventListener('click', handleDismiss);
    if (closeBtn) closeBtn.addEventListener('click', handleDismiss);
    modal.onclick = (e) => {
      if (e.target === modal) handleDismiss();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        window.removeEventListener('keydown', handleEsc);
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleEsc);
  }

  renderRangoliPattern(ctx, type, width, height) {
    const cx = width / 2;
    const cy = height / 2;

    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Stone disc background
    ctx.fillStyle = '#211512';
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Outer decorative dotted ring
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = '#A7BEAE';
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#D9A441';

    switch (type) {
      case 'shadow':
        // Crescent moon & banyan branch motif
        ctx.beginPath();
        ctx.arc(cx, cy, 34, 0.4 * Math.PI, 1.6 * Math.PI);
        ctx.quadraticCurveTo(cx - 10, cy, cx + 10, cy + 28);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * 22, cy + Math.sin(angle) * 22, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'ripple':
        // Concentric acoustic water ripple kolam
        for (let r = 10; r <= 36; r += 9) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'vision':
        // Lotus eye vision cone sigil
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy);
        ctx.quadraticCurveTo(cx, cy - 24, cx + 36, cy);
        ctx.quadraticCurveTo(cx, cy + 24, cx - 36, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'valari':
        // Curved boomerang sickle arc
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy - 20);
        ctx.quadraticCurveTo(cx + 34, cy - 18, cx + 18, cy + 28);
        ctx.quadraticCurveTo(cx - 2, cy + 4, cx - 28, cy - 20);
        ctx.stroke();
        break;

      case 'bangles':
        // Interlinked diplomatic trust rings
        ctx.beginPath();
        ctx.arc(cx - 14, cy, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 14, cy, 18, 0, Math.PI * 2);
        ctx.stroke();
        break;

      default:
        // Traditional 8-point Tamil Kolam
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          const x1 = cx + Math.cos(ang) * 12;
          const y1 = cy + Math.sin(ang) * 12;
          const x2 = cx + Math.cos(ang) * 34;
          const y2 = cy + Math.sin(ang) * 34;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x2, y2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  }
}

// Global HUD singleton
window.sivagangaHUD = new SivagangaDiegeticHUD();
