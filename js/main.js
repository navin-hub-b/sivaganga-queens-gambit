/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - MASTER APPLICATION COORDINATOR
 * Connects Title Screen -> The Chronicle Roadmap -> 20 Sequential Levels
 * into a single unified Hollow Knight modal web experience.
 */

class SivagangaMaster {
  constructor() {
    this.currentState = 'TITLE'; // 'TITLE', 'CHRONICLE', 'LEVEL'
    this.isTransitioning = false;
  }

  init() {
    console.log('Initializing Sivaganga: The Queen\'s Gambit...');

    // 1. Audio and Save subsystems
    window.sivagangaSave = window.sivagangaSave || new SivagangaSaveManager();
    window.sivagangaAudio = window.sivagangaAudio || new SivagangaAudio();

    // 2. Visual and HUD subsystems
    window.sivagangaHUD.init();
    window.sivagangaArt.init();
    window.sivagangaInteraction.init();
    window.sivagangaSettings.init();
    window.sivagangaTransitions.init();
    if (window.sivagangaFlow) window.sivagangaFlow.init();
    window.sivagangaChronicle.init();
    window.sivagangaGameplay.init();

    // 3. Home Screen outer gate initialization
    window.sivagangaHome.init();

    // 5. Initial audio unlock on first interaction
    const unlockAudio = () => {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.startTanpuraDrone();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // 6. Initialize SPA Router System (Direct page rendering & canonical path resolution)
    if (window.sivagangaRouter) {
      window.sivagangaRouter.init();
    } else {
      // Fallback for query param (?level=2) or Title screen
      const urlParams = new URLSearchParams(window.location.search);
      const requestedLevel = parseInt(urlParams.get('level'), 10);
      if (!isNaN(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 20) {
        setTimeout(() => {
          this.startLevel(requestedLevel);
        }, 150);
        return;
      }
      this.switchView('view-title');
    }
  }

  switchView(targetViewId) {
    const views = document.querySelectorAll('.game-view');
    views.forEach(v => {
      if (v.id === targetViewId) {
        v.classList.add('active-view');
      } else {
        v.classList.remove('active-view');
      }
    });

    // Toggle diegetic HUD visibility: HUD active in Chronicle and Level views, hidden on Title view
    const hud = document.getElementById('diegetic-hud');
    if (hud) {
      if (targetViewId === 'view-title') {
        hud.style.display = 'none';
        hud.style.opacity = '0';
      } else {
        hud.style.display = 'flex';
        hud.style.opacity = '1';
      }
    }
  }

  startNewGame() {
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate('/level/01-the-only-child');
      return;
    }
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Transition with palm-leaf wipe into Level 1
    window.sivagangaTransitions.wipe(
      () => {
        this.currentState = 'LEVEL';
        this.switchView('view-level-play');
        window.sivagangaGameplay.start(1);
      },
      () => {
        this.isTransitioning = false;
      }
    );
  }

  continueGame() {
    const currentLvl = window.sivagangaSave ? (window.sivagangaSave.state.currentLevel || 1) : 1;
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate(window.sivagangaRouter.getLevelUrl(currentLvl));
      return;
    }
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    window.sivagangaTransitions.wipe(
      () => {
        this.currentState = 'LEVEL';
        this.switchView('view-level-play');
        window.sivagangaGameplay.start(currentLvl);
      },
      () => {
        this.isTransitioning = false;
      }
    );
  }

  openChronicle(preFocusNodeId) {
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate('/chronicle', { preFocusNodeId });
      return;
    }
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    window.sivagangaTransitions.wipe(
      () => {
        this.currentState = 'CHRONICLE';
        this.switchView('view-chronicle');
        window.sivagangaChronicle.init();

        const targetNodeId = preFocusNodeId || window.sivagangaChronicle.currentNodeId;
        const targetNode = window.sivagangaChronicle.nodes.find(n => n.id === targetNodeId) || window.sivagangaChronicle.nodes[0];
        window.sivagangaChronicle.handleFocusNode(targetNode);
        window.sivagangaChronicle.centerOnNode(targetNodeId);
      },
      () => {
        this.isTransitioning = false;
      }
    );
  }

  openTitleScreen() {
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate('/');
      return;
    }
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    window.sivagangaTransitions.wipe(
      () => {
        this.currentState = 'TITLE';
        this.switchView('view-title');
        window.sivagangaHome.checkAndCacheSave();
      },
      () => {
        this.isTransitioning = false;
      }
    );
  }

  startLevel(lvlNumber) {
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate(window.sivagangaRouter.getLevelUrl(lvlNumber));
      return;
    }
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    window.sivagangaSave.state.currentLevel = lvlNumber;
    window.sivagangaSave.save();

    window.sivagangaTransitions.wipe(
      () => {
        this.currentState = 'LEVEL';
        this.switchView('view-level-play');
        window.sivagangaGameplay.start(lvlNumber);
      },
      () => {
        this.isTransitioning = false;
      }
    );
  }
}

// Global master application singleton
window.sivagangaMain = new SivagangaMaster();

window.addEventListener('DOMContentLoaded', () => {
  window.sivagangaMain.init();
});
