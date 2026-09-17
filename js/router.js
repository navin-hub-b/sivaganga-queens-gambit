/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - SPA ROUTER & PROGRESSION-FLOW ENGINE
 * Technical Robustness Contract:
 * - 22 Distinct Shareable/Bookmarkable Routes (/, /chronicle, 20 Levels, L18 Reflection)
 * - First-Class Direct Page Rendering & Deep Linking
 * - Strict Save-Schema Guard Rules (Locked/Completed/Unrecognized/Replay)
 * - Hollow Knight-Style Auto-Progression Sequence & Chapter Finale Map Gateways
 * - Browser Back/Forward Hierarchy (Level -> Chronicle -> Home)
 * - Atomic Progression Writes & Debounced Uninterruptible Transitions
 */

class SivagangaRouter {
  constructor() {
    this.canonicalLevels = [
      { id: 1, slug: '01-the-only-child', title: 'The Only Child', chapter: 1 },
      { id: 2, slug: '02-valari-silambam', title: 'Valari & Silambam', chapter: 1 },
      { id: 3, slug: '03-horse-and-bow', title: 'Horse and Bow', chapter: 1 },
      { id: 4, slug: '04-tongues-of-the-world', title: 'Tongues of the World', chapter: 1 },
      { id: 5, slug: '05-the-betrothal', title: 'The Betrothal', chapter: 1, isFinale: true },
      { id: 6, slug: '06-queen-of-sivaganga', title: 'Queen of Sivaganga', chapter: 2 },
      { id: 7, slug: '07-the-companys-shadow', title: "The Company's Shadow", chapter: 2 },
      { id: 8, slug: '08-the-dindigul-durbar', title: 'The Dindigul Durbar', chapter: 2 },
      { id: 9, slug: '09-the-udaiyaal-regiment', title: 'The Udaiyaal Regiment', chapter: 2, isFinale: true },
      { id: 10, slug: '10-the-convoy-of-five-thousand', title: 'The Convoy of Five Thousand', chapter: 2, isFinale: true },
      { id: 11, slug: '11-kuyilis-eye', title: "Kuyili's Eye", chapter: 3 },
      { id: 12, slug: '12-the-valari-arc', title: 'The Valari Arc', chapter: 3 },
      { id: 13, slug: '13-the-eic-cantonment-ledgers', title: 'The EIC Cantonment Ledgers', chapter: 3 },
      { id: 14, slug: '14-the-cartographers-trap', title: "The Cartographer's Trap", chapter: 3 },
      { id: 15, slug: '15-the-vijayadashami-infiltration', title: 'The Vijayadashami Infiltration', chapter: 3, isFinale: true },
      { id: 16, slug: '16-the-outer-ramparts', title: 'The Outer Ramparts', chapter: 4, isFinale: true },
      { id: 17, slug: '17-the-moat-sluice-gates', title: 'The Moat Sluice Gates', chapter: 4 },
      { id: 18, slug: '18-kuyilis-sacrifice', title: 'The Powder Magazine', chapter: 4 },
      { id: 19, slug: '19-the-royal-palace-courtyard', title: 'The Royal Palace Courtyard', chapter: 4 },
      { id: 20, slug: '20-the-last-years', title: 'The Coronation of Sivaganga', chapter: 4, isFinale: true }
    ];

    this.chapterFinales = [5, 9, 10, 15, 16, 20];
    this.currentRoute = null;
    this.basePath = this.detectBasePath();
    this.isTransitioning = false;
    this.isReplay = false;
    this.completionDebounceTimer = 0;
  }

  /**
   * Detects base path for GitHub Pages (e.g. /<repo-name>) or subfolder hosting.
   */
  detectBasePath() {
    if (typeof window === 'undefined' || !window.location) return '';
    if (window.location.protocol === 'file:') return '';

    const pathname = window.location.pathname || '';

    // Direct root or root-level clean SPA routes
    if (pathname === '/' || pathname.startsWith('/chronicle') || pathname.startsWith('/level')) {
      return '';
    }

    // Extract potential subfolder/repository segment
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const first = segments[0];
      // If first segment is not a known route and not a filename
      if (first !== 'chronicle' && first !== 'level' && !first.includes('.html')) {
        return '/' + first;
      }
    }
    return '';
  }

  init() {
    console.log(`[SivagangaRouter] Initializing SPA Routing System (Base: "${this.basePath || '/'}")`);

    // 1. Listen to browser Back/Forward (popstate)
    window.addEventListener('popstate', (e) => this.handlePopState(e));

    // 2. Listen to hashchange for file:// protocol and hash-deep-links
    window.addEventListener('hashchange', () => {
      const hashPath = window.location.hash.replace(/^#/, '');
      if (hashPath && hashPath.startsWith('/')) {
        this.routeTo(hashPath, { replace: true, skipWipe: false });
      }
    });

    // 3. Intercept internal anchor clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link) {
        let href = link.getAttribute('href');
        if (!href) return;
        if (this.basePath && href.startsWith(this.basePath)) {
          href = href.slice(this.basePath.length) || '/';
        }
        if (href.startsWith('/')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });

    // 4. Resolve initial path on page load
    const initialPath = this.normalizePath(window.location.pathname);
    this.routeTo(initialPath, { isInitialLoad: true, replace: true });
  }

  normalizePath(rawPath) {
    if (!rawPath) return '/';

    // Strip base path if running on GitHub Pages or subfolder
    if (this.basePath && rawPath.startsWith(this.basePath)) {
      rawPath = rawPath.slice(this.basePath.length) || '/';
    }

    // If a hash route is present in the URL on initial load and rawPath is the page path
    if ((rawPath === '/' || rawPath.includes('.html') || rawPath.includes(':')) && window.location.hash && window.location.hash.length > 1) {
      const hashVal = window.location.hash.replace(/^#/, '');
      if (hashVal.startsWith('/')) {
        return hashVal;
      }
    }

    // If it's already a clean internal route (starts with /level, /chronicle, or exactly /)
    if (rawPath === '/' || rawPath === '/chronicle' || rawPath.startsWith('/level/')) {
      return rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    }

    // If the path contains the local filesystem path or .html filename
    if (rawPath.includes('.html') || rawPath.includes('SIH 2026') || rawPath.includes('SIH%202026') || rawPath.includes(':')) {
      return '/';
    }

    // Trim trailing slash except for root
    return rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  }

  getCanonicalSlug(levelId) {
    const lvl = this.canonicalLevels.find(l => l.id === levelId);
    return lvl ? lvl.slug : `level-${levelId}`;
  }

  getLevelUrl(levelId) {
    return `/level/${this.getCanonicalSlug(levelId)}`;
  }

  /**
   * Parses and resolves any given URL path into a structured route descriptor.
   */
  resolvePath(path) {
    const clean = this.normalizePath(path);

    if (clean === '/' || clean === '') {
      return { type: 'HOME', path: '/' };
    }

    if (clean === '/chronicle') {
      return { type: 'CHRONICLE', path: '/chronicle' };
    }

    // Special Level 18 Reflection Sub-route: /level/18-kuyilis-sacrifice/complete
    const reflectionMatch = clean.match(/^\/level\/18(?:-[a-z0-9-]+)?\/complete$/i);
    if (reflectionMatch) {
      return {
        type: 'LEVEL_18_COMPLETE',
        levelId: 18,
        path: '/level/18-kuyilis-sacrifice/complete'
      };
    }

    // Level Routes: /level/01-the-only-child ... /level/20-the-last-years
    const levelMatch = clean.match(/^\/level\/(\d{1,2})(?:-([a-z0-9-]+))?$/i);
    if (levelMatch) {
      const lvlId = parseInt(levelMatch[1], 10);
      if (lvlId >= 1 && lvlId <= 20) {
        return {
          type: 'LEVEL',
          levelId: lvlId,
          slug: this.getCanonicalSlug(lvlId),
          path: this.getLevelUrl(lvlId)
        };
      }
    }

    return { type: 'UNRECOGNIZED', originalPath: clean };
  }

  /**
   * Evaluates route guards according to the save-data progression contract.
   */
  evaluateGuards(route) {
    if (route.type === 'HOME' || route.type === 'CHRONICLE') {
      return { allowed: true };
    }

    if (route.type === 'UNRECOGNIZED') {
      return {
        allowed: false,
        redirect: '/chronicle',
        reason: 'unrecognized',
        message: 'Unrecorded Trail: Returned to The Chronicle.'
      };
    }

    if (route.type === 'LEVEL' || route.type === 'LEVEL_18_COMPLETE') {
      const lvlId = route.levelId;
      const isUnlocked = window.sivagangaSave.isLevelUnlocked(lvlId);
      const isCompleted = window.sivagangaSave.isLevelCompleted(lvlId);

      if (!isUnlocked && !isCompleted) {
        return {
          allowed: false,
          redirect: '/chronicle',
          focusNodeId: lvlId,
          reason: 'locked',
          message: `Trial ${lvlId} Locked: Master prior trials in the Chronicle first.`
        };
      }

      return {
        allowed: true,
        isReplay: isCompleted
      };
    }

    return { allowed: true };
  }

  /**
   * Primary entry point for navigating to a new route.
   */
  navigate(targetPath, options = {}) {
    if (this.isTransitioning) return;
    this.routeTo(targetPath, options);
  }

  /**
   * Core routing dispatcher: handles guards, history hierarchy, view switching, and wipes.
   */
  routeTo(targetPath, options = {}) {
    const {
      isInitialLoad = false,
      replace = false,
      skipWipe = false,
      preFocusNodeId = null
    } = options;

    const route = this.resolvePath(targetPath);
    const guard = this.evaluateGuards(route);

    if (!guard.allowed) {
      console.warn(`[SivagangaRouter] Guard blocked ${targetPath}: ${guard.reason}`);
      if (guard.message) {
        this.showNoticeToast(guard.message);
      }
      // Redirect to fallback (Chronicle)
      this.routeTo(guard.redirect, {
        replace: true,
        skipWipe: isInitialLoad,
        preFocusNodeId: guard.focusNodeId || null
      });
      return;
    }

    // Set canonical replay status
    this.isReplay = Boolean(guard.isReplay);

    // Synchronize Browser History Stack & Hierarchy safely
    try {
      this.syncBrowserHistory(route, replace, isInitialLoad);
    } catch (e) {
      console.warn('[SivagangaRouter] History sync non-fatal warning:', e);
    }

    // Execute Screen Transition
    if (skipWipe || isInitialLoad) {
      this.renderRouteView(route, preFocusNodeId);
    } else {
      this.isTransitioning = true;
      window.sivagangaInteraction.setLock(true);

      window.sivagangaTransitions.wipe(
        () => {
          this.renderRouteView(route, preFocusNodeId);
        },
        () => {
          this.isTransitioning = false;
          window.sivagangaInteraction.setLock(false);
        }
      );
    }
  }

  /**
   * Manages browser history hierarchy so Back button follows:
   * Level -> Chronicle -> Home
   */
  syncBrowserHistory(route, replace, isInitialLoad) {
    const canonicalPath = route.path || '/';
    const targetUrl = (this.basePath || '') + canonicalPath;

    // On file:// protocol, pushState/replaceState throws SecurityError
    if (window.location.protocol === 'file:') {
      try {
        if (canonicalPath === '/') {
          if (window.location.hash) {
            window.location.hash = '';
          }
        } else {
          window.location.hash = canonicalPath;
        }
      } catch (e) {
        console.warn('[SivagangaRouter] Hash sync warning:', e);
      }
      this.currentRoute = canonicalPath;
      return;
    }

    try {
      if (isInitialLoad || replace) {
        window.history.replaceState({ route: canonicalPath, type: route.type }, '', targetUrl);
        this.currentRoute = canonicalPath;
        return;
      }

      // When embarking on a level directly from Home ('/'), inject /chronicle into history first
      // so browser Back from the level lands on Chronicle rather than skipping straight to Home!
      if ((route.type === 'LEVEL' || route.type === 'LEVEL_18_COMPLETE') && this.currentRoute === '/') {
        window.history.pushState({ route: '/chronicle', type: 'CHRONICLE' }, '', (this.basePath || '') + '/chronicle');
      }

      window.history.pushState({ route: canonicalPath, type: route.type }, '', targetUrl);
      this.currentRoute = canonicalPath;
    } catch (e) {
      console.warn('[SivagangaRouter] History pushState blocked or unsupported, falling back safely:', e);
      try {
        if (canonicalPath !== '/') {
          window.location.hash = canonicalPath;
        }
      } catch (err) {}
      this.currentRoute = canonicalPath;
    }
  }

  /**
   * Handles browser Back/Forward (popstate).
   */
  handlePopState(e) {
    if (this.isTransitioning) return;

    const targetPath = this.normalizePath(window.location.pathname);
    console.log(`[SivagangaRouter] Popstate event received: ${targetPath}`);

    const route = this.resolvePath(targetPath);
    const guard = this.evaluateGuards(route);

    if (!guard.allowed) {
      console.warn(`[SivagangaRouter] Popstate guard blocked: ${guard.reason}`);
      this.routeTo(guard.redirect, { replace: true, skipWipe: false });
      return;
    }

    this.currentRoute = targetPath;
    this.isReplay = Boolean(guard.isReplay);

    window.sivagangaTransitions.wipe(
      () => {
        this.renderRouteView(route);
      },
      () => {
        this.isTransitioning = false;
        window.sivagangaInteraction.setLock(false);
      }
    );
  }

  /**
   * Renders the corresponding view and initializes level state.
   */
  renderRouteView(route, preFocusNodeId) {
    this.hideLevel18ReflectionModal();
    if (window.sivagangaFlow) {
      window.sivagangaFlow.syncFromRoute(route);
    }

    if (route.type === 'HOME') {
      window.sivagangaMain.switchView('view-title');
      if (window.sivagangaHome) {
        window.sivagangaHome.checkAndCacheSave();
        window.sivagangaHome.renderMenuSigils();
      }
    } else if (route.type === 'CHRONICLE') {
      window.sivagangaMain.switchView('view-chronicle');
      if (window.sivagangaChronicle) {
        window.sivagangaChronicle.init();
        const focusId = preFocusNodeId || window.sivagangaSave.state.currentLevel || 1;
        const node = window.sivagangaChronicle.nodes.find(n => n.id === focusId) || window.sivagangaChronicle.nodes[0];
        window.sivagangaChronicle.handleFocusNode(node);
        window.sivagangaChronicle.centerOnNode(focusId);
      }
    } else if (route.type === 'LEVEL') {
      window.sivagangaMain.switchView('view-level-play');
      window.sivagangaSave.state.currentLevel = route.levelId;
      window.sivagangaSave.save();

      // Launch Level First Screen directly
      if (window.sivagangaGameplay) {
        window.sivagangaGameplay.start(route.levelId, { isReplay: this.isReplay });
      }
    } else if (route.type === 'LEVEL_18_COMPLETE') {
      window.sivagangaMain.switchView('view-level-play');
      this.renderLevel18ReflectionScreen();
    }
  }

  /**
   * Progression-Flow Engine: Invoked upon reaching a level's "Done when" state.
   * Enforces atomic save, diegetic completion beat, and automatic progression.
   */
  handleLevelCompletion(levelId, stats = {}) {
    const now = Date.now();
    if (now - this.completionDebounceTimer < 800) {
      console.warn(`[SivagangaRouter] Debounced duplicate level completion call for Level ${levelId}`);
      return;
    }
    this.completionDebounceTimer = now;

    // 1. Lock all player inputs for uninterruptible transition sequence
    window.sivagangaInteraction.setLock(true);

    // 2. Atomic Save Write: Update save-data schema BEFORE navigation fires
    const saveOk = window.sivagangaSave.recordLevelComplete(levelId, stats, this.isReplay);
    if (!saveOk) {
      console.error('[SivagangaRouter] Atomic save failed! Aborting navigation to prevent progress loss.');
      window.sivagangaInteraction.setLock(false);
      this.showSaveRetryCue(levelId, stats);
      return;
    }

    // 3. Display Brief Diegetic Completion Beat (Golden Rangoli flare in place)
    this.displayDiegeticCompletionBeat(levelId, () => {
      // 4. Palm-leaf scroll wipe into next destination
      window.sivagangaTransitions.wipe(
        () => {
          this.advanceToNextDestination(levelId);
        },
        () => {
          window.sivagangaInteraction.setLock(false);
        }
      );
    });
  }

  /**
   * Determines next destination: Level 18 reflection, Chapter Finale Chronicle gate, or next Level.
   */
  advanceToNextDestination(levelId) {
    if (levelId === 18) {
      // Level 18 unique pause: route to /level/18-kuyilis-sacrifice/complete
      this.navigate('/level/18-kuyilis-sacrifice/complete', { skipWipe: true });
    } else if (this.chapterFinales.includes(levelId)) {
      // Chapter Finale: Route to /chronicle and visibly open next chapter gate!
      const nextNodeId = Math.min(20, levelId + 1);
      this.navigate('/chronicle', {
        skipWipe: true,
        preFocusNodeId: nextNodeId
      });
      setTimeout(() => {
        if (window.sivagangaChronicle) {
          window.sivagangaChronicle.openChapterGateAndFocus(levelId, nextNodeId);
        }
      }, 100);
    } else if (levelId < 20) {
      // Standard Play-Order Auto-Advance to next level URL
      const nextLvl = levelId + 1;
      this.navigate(this.getLevelUrl(nextLvl), { skipWipe: true });
    } else {
      // Level 20 Coronation Finale: Route to Chronicle
      this.navigate('/chronicle', { skipWipe: true, preFocusNodeId: 20 });
    }
  }

  /**
   * Displays the diegetic on-screen completion flare using authentic Rangoli geometry.
   */
  displayDiegeticCompletionBeat(levelId, onComplete) {
    const lvlDef = window.sivagangaLevels?.find(l => l.id === levelId);
    const container = document.getElementById('view-level-play') || document.body;

    const flareOverlay = document.createElement('div');
    flareOverlay.id = 'diegetic-completion-flare';
    flareOverlay.className = 'diegetic-completion-overlay';

    const isFinale = this.chapterFinales.includes(levelId);
    const badgeText = isFinale ? 'CHAPTER CONCLUDED' : 'TRIAL MASTERED';
    const titleText = lvlDef ? lvlDef.title : `Trial ${levelId}`;
    const factText = lvlDef?.historicalFact || 'Honor and sovereignty restored through courage.';

    flareOverlay.innerHTML = `
      <div class="completion-sigil-card">
        <div class="completion-rangoli-disc">
          <svg viewBox="0 0 100 100" class="completion-pulse-svg">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#D9A441" stroke-width="2.5" stroke-dasharray="4,4"/>
            <circle cx="50" cy="50" r="32" fill="none" stroke="#ebd076" stroke-width="1.8"/>
            <path d="M50 12 L50 88 M12 50 L88 50 M23 23 L77 77 M23 77 L77 23" stroke="#D9A441" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="8" fill="#D9A441"/>
          </svg>
        </div>
        <div class="completion-badge-tag">${badgeText}</div>
        <h2 class="completion-title-heading">${titleText}</h2>
        <div class="completion-lore-snippet">"${factText}"</div>
      </div>
    `;

    container.appendChild(flareOverlay);
    window.sivagangaAudio.playResolveBell();

    setTimeout(() => {
      flareOverlay.classList.add('fade-out');
      setTimeout(() => {
        flareOverlay.remove();
        if (onComplete) onComplete();
      }, 350);
    }, 1700);
  }

  /**
   * Renders the dedicated post-sacrifice reflection beat for Level 18.
   */
  renderLevel18ReflectionScreen() {
    this.hideLevel18ReflectionModal();

    const container = document.getElementById('view-level-play') || document.body;
    const modal = document.createElement('div');
    modal.id = 'level18-reflection-modal';
    modal.className = 'kuyili-reflection-view';

    modal.innerHTML = `
      <div class="reflection-card">
        <div class="reflection-diya-amber">
          <div class="diya-wick"></div>
          <div class="diya-flame diya-flame-dimmed"></div>
        </div>
        <div class="reflection-sub-heading">OCTOBER 1780 &bull; RAJARAJESHWARI TEMPLE PRECINCT</div>
        <h1 class="reflection-main-heading">Commander Kuyili's Supreme Sacrifice</h1>
        <p class="reflection-body-text">
          In the depths of the temple munitions vault, Commander Kuyili doused herself in sacred ghee and ignited the British ammunition stockpile.
          The colonial artillery is turned to smoke and ash. The temple towers stand unscathed. Sivaganga's hour of liberation arrives.
        </p>
        <div class="reflection-quote">
          "For Sivaganga. For our Queen. Our people shall be free."
        </div>
        <div class="reflection-action-row">
          <button id="reflection-chronicle-btn" class="btn-tamil">
            <span>The Chronicle Map</span>
          </button>
          <button id="reflection-proceed-btn" class="btn-tamil btn-primary">
            <span>Proceed to Level 19: The Royal Palace Courtyard &rarr;</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(modal);

    // Audio cue
    if (window.sivagangaAudio) {
      window.sivagangaAudio.ensureContext();
      window.sivagangaAudio.startTanpuraDrone();
    }

    document.getElementById('reflection-proceed-btn').onclick = () => {
      this.navigate(this.getLevelUrl(19));
    };
    document.getElementById('reflection-chronicle-btn').onclick = () => {
      this.navigate('/chronicle');
    };
  }

  hideLevel18ReflectionModal() {
    const existing = document.getElementById('level18-reflection-modal');
    if (existing) existing.remove();
  }

  /**
   * Surfaces a non-blocking notification toast for unrecognized or locked routes.
   */
  showNoticeToast(message) {
    let toast = document.getElementById('router-notice-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'router-notice-toast';
      toast.className = 'router-notice-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  /**
   * Surfaces in-world retry cue if atomic save fails.
   */
  showSaveRetryCue(levelId, stats) {
    let cue = document.getElementById('save-retry-modal');
    if (!cue) {
      cue = document.createElement('div');
      cue.id = 'save-retry-modal';
      cue.className = 'palm-manuscript-modal active';
      cue.innerHTML = `
        <div class="manuscript-leaf-body" style="text-align: center; max-width: 440px;">
          <h3 style="color: var(--danger-deep); font-family: var(--font-serif); margin-bottom: 10px;">Storage Seal Incomplete</h3>
          <p style="font-size: 14px; color: #422921; margin-bottom: 16px;">
            The scribe's ink could not be recorded into local storage. Tap below to retry sealing your trial victory.
          </p>
          <button id="save-retry-confirm-btn" class="btn-tamil btn-primary">Retry Sealing Trial</button>
        </div>
      `;
      document.body.appendChild(cue);
    }

    document.getElementById('save-retry-confirm-btn').onclick = () => {
      cue.remove();
      this.handleLevelCompletion(levelId, stats);
    };
  }
}

// Global SPA Router singleton
window.sivagangaRouter = new SivagangaRouter();
