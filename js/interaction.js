/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - 4-STATE RESPONSIVE INTERACTION ENGINE
 * Applies mandatory 4-state lifecycle (IDLE, FOCUSED, ACTIVE, RESOLVED/FAILED)
 * to every interactive element across home, chronicle, and all 20 levels.
 */

class SivagangaInteractionEngine {
  constructor() {
    this.speedScale = 1.0;
    this.isLocked = false;
    this.activePointers = new Map();
  }

  init() {
    this.applySpeedScale(window.sivagangaSave.state.settings.interfaceSpeed);
    this.bindGlobalListeners();
  }

  applySpeedScale(speedSetting) {
    switch (speedSetting) {
      case 'slow': this.speedScale = 1.5; break;
      case 'fast': this.speedScale = 0.6; break;
      case 'default':
      default:
        this.speedScale = 1.0; break;
    }
    document.documentElement.style.setProperty('--speed-scale', this.speedScale);
    window.sivagangaAudio.setSpeedScale(this.speedScale);
  }

  /**
   * Lock all interactions during scene wipes/transitions to prevent double-trigger bugs.
   */
  setLock(locked) {
    this.isLocked = Boolean(locked);
  }

  /**
   * Attaches the 4-state interaction lifecycle to any DOM element or container.
   */
  attach(element, options = {}) {
    if (!element || element._hasSivagangaInteraction) return;
    element._hasSivagangaInteraction = true;

    const {
      onFocus = null,
      onActive = null,
      onResolve = null,
      onFail = null,
      sound = true,
      debounceMs = 300
    } = options;

    let isPressed = false;
    let lastTriggerTime = 0;

    // --- 1. FOCUSED (Hover / Focus-visible) ---
    const handleFocus = () => {
      if (this.isLocked) return;
      element.classList.add('state-focused');
      if (sound) window.sivagangaAudio.playFocusPing();
      if (onFocus) onFocus();
    };

    const handleBlur = () => {
      element.classList.remove('state-focused');
      if (!isPressed) {
        element.classList.remove('state-active');
      }
    };

    // --- 2. ACTIVE (Press / Pointerdown / Touchstart) ---
    const handleDown = (e) => {
      if (this.isLocked) return;
      isPressed = true;
      element.classList.add('state-active');
      if (onActive) onActive(e);
    };

    // --- 3. RESOLVED / CONFIRMED (Release / Pointerup / Click) ---
    const handleUp = (e) => {
      if (!isPressed) return;
      isPressed = false;
      element.classList.remove('state-active');

      if (this.isLocked) return;

      const now = Date.now();
      if (now - lastTriggerTime < debounceMs * this.speedScale) {
        return; // Debounce double clicks
      }
      lastTriggerTime = now;

      // Pulse settle effect
      element.classList.add('state-resolved');
      if (sound) window.sivagangaAudio.playResolveBell();

      setTimeout(() => {
        element.classList.remove('state-resolved');
      }, 300 * this.speedScale);

      if (onResolve) onResolve(e);
    };

    // --- 4. FAILED / CANCELLED (Pointerleave / Pointercancel) ---
    const handleCancel = () => {
      if (!isPressed) return;
      isPressed = false;
      element.classList.remove('state-active');
      element.classList.add('state-failed');
      setTimeout(() => {
        element.classList.remove('state-failed');
      }, 400 * this.speedScale);
      if (onFail) onFail();
    };

    element.addEventListener('pointerenter', handleFocus);
    element.addEventListener('pointerleave', handleBlur);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    element.addEventListener('pointerdown', handleDown);
    element.addEventListener('pointerup', handleUp);
    element.addEventListener('pointercancel', handleCancel);

    // Keyboard accessibility (Enter / Space activates)
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDown(e);
      }
    });

    element.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleUp(e);
      }
    });
  }

  /**
   * Scans and attaches 4-state responsiveness to all interactive elements on the screen.
   */
  scanAndBind(container = document) {
    const targets = container.querySelectorAll('.btn-tamil, .interactive-node, .hud-interactive, .dialogue-choice-btn');
    targets.forEach(el => this.attach(el));
  }

  bindGlobalListeners() {
    // Automatically bind elements created dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mut => {
        mut.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches && (node.matches('.btn-tamil') || node.matches('.interactive-node') || node.matches('.hud-interactive'))) {
              this.attach(node);
            }
            this.scanAndBind(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Global interaction engine singleton
window.sivagangaInteraction = new SivagangaInteractionEngine();
