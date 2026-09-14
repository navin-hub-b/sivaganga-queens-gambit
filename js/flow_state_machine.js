/**
 * SIVAGANGA: THE QUEEN\'S GAMBIT - GAME-FLOW FINITE STATE MACHINE (FSM)
 * Hollow Knight Modal Connected Game-Flow Single Source of Truth.
 * 
 * Strict States:
 *   - HOME: Ruined outer gate threshold (Zero level names/thumbnails)
 *   - HOME_SETTINGS: Palm-leaf settings modal over Home (torch-dim fade)
 *   - CHRONICLE: Cartographic world roadmap with 20 sequential nodes
 *   - LEVEL: Active in-level gameplay (Levels 1..20)
 *   - LEVEL_PAUSE: In-level tactical pause modal over active level (torch-dim fade)
 *   - LEVEL_PAUSE_SETTINGS: Settings modal stacked over Pause modal over Level
 * 
 * Strict Edges Only:
 *   - Any non-defined transition is explicitly rejected with zero state corruption.
 */

class SivagangaFlowStateMachine {
  constructor() {
    this.state = 'HOME'; // Initial state
    this.currentLevelId = 1;
    this.isTransitioning = false;
    this.chapterFinales = [5, 9, 16, 20];
    this.listeners = [];
  }

  init() {
    console.log('[SivagangaFlow] Initializing Game-Flow State Machine...');
    // Sync with router initial resolution if available
    if (window.sivagangaRouter && window.sivagangaRouter.currentRoute) {
      this.syncFromRoute(window.sivagangaRouter.currentRoute);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.listeners.forEach(cb => {
      try { cb(event, data); } catch (e) { console.error('[SivagangaFlow] Listener error:', e); }
    });
  }

  /**
   * Evaluates if a transition is legal from the current state.
   */
  canTransition(action, payload = {}) {
    if (this.isTransitioning && !action.startsWith('FORCE_')) {
      return false;
    }

    switch (this.state) {
      case 'HOME':
        if (action === 'BEGIN_JOURNEY') return true;
        if (action === 'CONTINUE') {
          return this.hasActiveSave();
        }
        if (action === 'OPEN_CHRONICLE') return true;
        if (action === 'OPEN_SETTINGS') return true;
        return false;

      case 'HOME_SETTINGS':
        return action === 'CLOSE_SETTINGS';

      case 'CHRONICLE':
        if (action === 'SELECT_NODE') {
          const targetId = payload?.levelId;
          if (!targetId || targetId < 1 || targetId > 20) return false;
          return this.isNodeAvailable(targetId);
        }
        if (action === 'GATE_HOME') return true;
        return false;

      case 'LEVEL':
        if (action === 'COMPLETE_LEVEL') {
          const lvlId = payload?.levelId || this.currentLevelId;
          return lvlId >= 1 && lvlId <= 20;
        }
        if (action === 'SWITCH_LEVEL') {
          const lvlId = payload?.levelId;
          return lvlId >= 1 && lvlId <= 20;
        }
        if (action === 'PAUSE') return true;
        return false;

      case 'LEVEL_PAUSE':
        if (action === 'RESUME') return true;
        if (action === 'GO_CHRONICLE') return true;
        if (action === 'OPEN_SETTINGS') return true;
        if (action === 'QUIT_HOME') return true;
        return false;

      case 'LEVEL_PAUSE_SETTINGS':
        return action === 'CLOSE_SETTINGS';

      default:
        return false;
    }
  }

  /**
   * Single source of truth state transition executor.
   * Rejects any non-defined edge.
   */
  transition(action, payload = {}) {
    if (!this.canTransition(action, payload)) {
      console.warn(`[SivagangaFlow] REJECTED illegal transition: Action '${action}' from state '${this.state}'`);
      return false;
    }

    const prevState = this.state;
    console.log(`[SivagangaFlow] Executing transition: ${action} [${prevState} -> ?]`);

    switch (this.state) {
      // -----------------------------------------------------------------------
      // HOME
      // -----------------------------------------------------------------------
      case 'HOME':
        if (action === 'BEGIN_JOURNEY') {
          // Fresh save at Level 1, direct to Level 1 screen (never through Chronicle)
          this.isTransitioning = true;
          if (window.sivagangaSave) {
            window.sivagangaSave.reset();
          }
          this.currentLevelId = 1;
          this.state = 'LEVEL';

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-level-play');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory('/level/01-the-only-child');
              }
              if (window.sivagangaGameplay) {
                window.sivagangaGameplay.start(1);
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: 1 });
            }
          );
          return true;
        }

        if (action === 'CONTINUE') {
          // Read existing save pointer, direct to that level screen (bypass Chronicle)
          const targetLvl = (window.sivagangaSave && window.sivagangaSave.state.currentLevel) || 1;
          this.isTransitioning = true;
          this.currentLevelId = targetLvl;
          this.state = 'LEVEL';

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-level-play');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory(window.sivagangaRouter.getLevelUrl(targetLvl));
              }
              if (window.sivagangaGameplay) {
                window.sivagangaGameplay.start(targetLvl);
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: targetLvl });
            }
          );
          return true;
        }

        if (action === 'OPEN_CHRONICLE') {
          this.isTransitioning = true;
          this.state = 'CHRONICLE';

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-chronicle');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory('/chronicle');
              }
              if (window.sivagangaChronicle) {
                window.sivagangaChronicle.init();
                const focusId = (window.sivagangaSave && window.sivagangaSave.state.currentLevel) || 1;
                const node = window.sivagangaChronicle.nodes.find(n => n.id === focusId) || window.sivagangaChronicle.nodes[0];
                window.sivagangaChronicle.handleFocusNode(node);
                window.sivagangaChronicle.centerOnNode(focusId);
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState });
            }
          );
          return true;
        }

        if (action === 'OPEN_SETTINGS') {
          // Modal over Home: Soft torch-dim overlay fade (NO scroll wipe)
          this.state = 'HOME_SETTINGS';
          if (window.sivagangaSettings) {
            window.sivagangaSettings.open();
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState });
          return true;
        }
        break;

      // -----------------------------------------------------------------------
      // HOME_SETTINGS
      // -----------------------------------------------------------------------
      case 'HOME_SETTINGS':
        if (action === 'CLOSE_SETTINGS') {
          // Closing Settings returns to Home (no navigation, no wipe)
          this.state = 'HOME';
          if (window.sivagangaSettings) {
            window.sivagangaSettings.close(true);
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState });
          return true;
        }
        break;

      // -----------------------------------------------------------------------
      // CHRONICLE
      // -----------------------------------------------------------------------
      case 'CHRONICLE':
        if (action === 'SELECT_NODE') {
          const targetId = payload.levelId;
          this.isTransitioning = true;
          this.currentLevelId = targetId;
          this.state = 'LEVEL';

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-level-play');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory(window.sivagangaRouter.getLevelUrl(targetId));
              }
              if (window.sivagangaGameplay) {
                window.sivagangaGameplay.start(targetId);
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: targetId });
            }
          );
          return true;
        }

        if (action === 'GATE_HOME') {
          this.isTransitioning = true;
          this.state = 'HOME';

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-title');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory('/');
              }
              if (window.sivagangaHome) {
                window.sivagangaHome.checkAndCacheSave();
                window.sivagangaHome.renderMenuSigils();
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState });
            }
          );
          return true;
        }
        break;

      // -----------------------------------------------------------------------
      // LEVEL
      // -----------------------------------------------------------------------
      case 'LEVEL':
        if (action === 'COMPLETE_LEVEL') {
          const lvlId = payload.levelId || this.currentLevelId;
          const isFinale = this.chapterFinales.includes(lvlId);

          if (isFinale) {
            // Chapter Finale Complete: Auto-advances to Chronicle with gate opening
            this.isTransitioning = true;
            this.state = 'CHRONICLE';

            const nextNodeId = Math.min(20, lvlId + 1);
            window.sivagangaTransitions.wipe(
              () => {
                window.sivagangaMain.switchView('view-chronicle');
                if (window.sivagangaRouter) {
                  window.sivagangaRouter.syncBrowserHistory('/chronicle');
                }
                if (window.sivagangaChronicle) {
                  window.sivagangaChronicle.openChapterGateAndFocus(lvlId, nextNodeId);
                }
              },
              () => {
                this.isTransitioning = false;
                this.notify('STATE_CHANGED', { state: this.state, from: prevState });
              }
            );
          } else {
            // Normal Level Complete: Auto-advances directly into next level (LEVEL -> LEVEL, no intermediate screen)
            const nextLvl = Math.min(20, lvlId + 1);
            this.isTransitioning = true;
            this.currentLevelId = nextLvl;
            this.state = 'LEVEL';

            window.sivagangaTransitions.wipe(
              () => {
                if (window.sivagangaRouter) {
                  window.sivagangaRouter.syncBrowserHistory(window.sivagangaRouter.getLevelUrl(nextLvl));
                }
                if (window.sivagangaGameplay) {
                  window.sivagangaGameplay.start(nextLvl);
                }
              },
              () => {
                this.isTransitioning = false;
                this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: nextLvl });
              }
            );
          }
          return true;
        }

        if (action === 'SWITCH_LEVEL') {
          return this.startLevel(payload.levelId);
        }

        if (action === 'PAUSE') {
          // In-level pause modal overlay: torch-dim fade (NO wipe, does not navigate away)
          this.state = 'LEVEL_PAUSE';
          const pauseModal = document.getElementById('level-pause-modal');
          if (pauseModal) {
            pauseModal.classList.add('active');
          }
          if (window.sivagangaAudio) {
            window.sivagangaAudio.playPalmLeafScroll();
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: this.currentLevelId });
          return true;
        }
        break;

      // -----------------------------------------------------------------------
      // LEVEL_PAUSE
      // -----------------------------------------------------------------------
      case 'LEVEL_PAUSE':
        if (action === 'RESUME') {
          // Closes modal, returns to Level exactly where left (no wipe)
          this.state = 'LEVEL';
          const pauseModal = document.getElementById('level-pause-modal');
          if (pauseModal) {
            pauseModal.classList.remove('active');
          }
          if (window.sivagangaAudio) {
            window.sivagangaAudio.playPalmLeafScroll();
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: this.currentLevelId });
          return true;
        }

        if (action === 'GO_CHRONICLE') {
          // Saves level state first; level is NOT resumable mid-scene; palm wipe to Chronicle
          this.isTransitioning = true;
          this.state = 'CHRONICLE';

          // Close pause modal
          const pauseModal = document.getElementById('level-pause-modal');
          if (pauseModal) pauseModal.classList.remove('active');

          // Clean up active level instance
          if (window.sivagangaGameplay) window.sivagangaGameplay.stopLevelInstances();

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-chronicle');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory('/chronicle');
              }
              if (window.sivagangaChronicle) {
                window.sivagangaChronicle.init();
                const node = window.sivagangaChronicle.nodes.find(n => n.id === this.currentLevelId) || window.sivagangaChronicle.nodes[0];
                window.sivagangaChronicle.handleFocusNode(node);
                window.sivagangaChronicle.centerOnNode(this.currentLevelId);
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState });
            }
          );
          return true;
        }

        if (action === 'OPEN_SETTINGS') {
          // Settings modal opened as a further layer above Pause
          this.state = 'LEVEL_PAUSE_SETTINGS';
          if (window.sivagangaSettings) {
            window.sivagangaSettings.open();
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState });
          return true;
        }

        if (action === 'QUIT_HOME') {
          // The ONLY route from LEVEL back to HOME; palm-leaf wipe
          this.isTransitioning = true;
          this.state = 'HOME';

          const pauseModal = document.getElementById('level-pause-modal');
          if (pauseModal) pauseModal.classList.remove('active');

          if (window.sivagangaGameplay) window.sivagangaGameplay.stopLevelInstances();

          window.sivagangaTransitions.wipe(
            () => {
              window.sivagangaMain.switchView('view-title');
              if (window.sivagangaRouter) {
                window.sivagangaRouter.syncBrowserHistory('/');
              }
              if (window.sivagangaHome) {
                window.sivagangaHome.checkAndCacheSave();
                window.sivagangaHome.renderMenuSigils();
              }
            },
            () => {
              this.isTransitioning = false;
              this.notify('STATE_CHANGED', { state: this.state, from: prevState });
            }
          );
          return true;
        }
        break;

      // -----------------------------------------------------------------------
      // LEVEL_PAUSE_SETTINGS
      // -----------------------------------------------------------------------
      case 'LEVEL_PAUSE_SETTINGS':
        if (action === 'CLOSE_SETTINGS') {
          // Closes Settings modal only! Restores Pause modal underneath
          this.state = 'LEVEL_PAUSE';
          if (window.sivagangaSettings) {
            window.sivagangaSettings.close(true);
          }
          // Verify Pause modal is still active
          const pauseModal = document.getElementById('level-pause-modal');
          if (pauseModal) {
            pauseModal.classList.add('active');
          }
          this.notify('STATE_CHANGED', { state: this.state, from: prevState });
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Synchronizes FSM state from a parsed URL route (e.g. on direct browser load).
   */
  syncFromRoute(route) {
    if (!route) return;
    if (route.type === 'HOME') {
      this.state = 'HOME';
    } else if (route.type === 'CHRONICLE') {
      this.state = 'CHRONICLE';
    } else if (route.type === 'LEVEL') {
      this.state = 'LEVEL';
      this.currentLevelId = route.levelId;
    }
  }

  hasActiveSave() {
    try {
      if (!window.sivagangaSave) return false;
      const s = window.sivagangaSave.state;
      return Boolean(s && (s.currentLevel > 1 || (s.completedLevels && s.completedLevels.length > 0)));
    } catch (e) {
      return false;
    }
  }

  isNodeAvailable(nodeId) {
    try {
      if (!window.sivagangaSave) return nodeId === 1;
      const s = window.sivagangaSave.state;
      const unlocked = s.unlockedLevel || 1;
      const completed = s.completedLevels || [];
      return nodeId <= unlocked || completed.includes(nodeId);
    } catch (e) {
      return nodeId === 1;
    }
  }

  startLevel(levelId) {
    if (this.isTransitioning) return false;
    const targetLvl = Math.max(1, Math.min(20, levelId));
    this.isTransitioning = true;
    const prevState = this.state;
    this.state = 'LEVEL';
    this.currentLevelId = targetLvl;
    if (window.sivagangaGameplay) window.sivagangaGameplay.stopLevelInstances();

    window.sivagangaTransitions.wipe(
      () => {
        window.sivagangaMain.switchView('view-level-play');
        if (window.sivagangaRouter) {
          window.sivagangaRouter.syncBrowserHistory(window.sivagangaRouter.getLevelUrl(targetLvl));
        }
        if (window.sivagangaGameplay) {
          window.sivagangaGameplay.start(targetLvl);
        }
      },
      () => {
        this.isTransitioning = false;
        this.notify('STATE_CHANGED', { state: this.state, from: prevState, levelId: targetLvl });
      }
    );
    return true;
  }
}

// Global Singleton
window.sivagangaFlow = new SivagangaFlowStateMachine();
