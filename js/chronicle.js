/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - THE CHRONICLE ROADMAP & WORLD MAP
 * Hollow Knight-style zoomable, explorable parchment map connecting all 20 levels.
 * Four hand-inked fortified regions with rampart walks and moat bridges,
 * geographic chapter fort-gates, soft BG-MAROON ink-wash fog-of-war,
 * snapping travel-path navigation, firefly-ember marker, ink-bleed plaques,
 * and 20 bespoke established mechanic icons (no generic numbered pins).
 */

const CHRONICLE_TOKENS = {
  BG_MAROON: '#2E1F1B',
  BG_TERRACOTTA: '#B85042',
  ACCENT_GOLD: '#D9A441',
  ACCENT_SAGE: '#A7BEAE',
  DANGER_DEEP: '#7A1F1F',
  MAP_PARCHMENT: '#C9A876'
};

class SivagangaChronicle {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.nodesLayer = null;
    this.fogCanvas = null;
    this.fogCtx = null;
    this.plaqueEl = null;

    // Zoom & Pan transformation state
    this.zoom = 1.0;
    this.minZoom = 0.55;
    this.maxZoom = 1.8;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.startPan = { x: 0, y: 0 };

    // Progression state derived from save schema
    this.unlockedLevel = 1;
    this.completedLevels = [];
    this.currentNodeId = 1;
    this.focusedNodeId = 1;

    // Firefly marker position
    this.emberMarker = { x: 0, y: 0, targetX: 0, targetY: 0, phase: 0 };
    this.animationId = null;

    // 20 Level Nodes across 4 Fortified Regions
    // Map dimensions: 2600 x 1200
    this.nodes = [
      // -------------------------------------------------------------
      // CHAPTER 1: RAMANATHAPURAM & KALAIYAR KOVIL (Levels 1 - 5)
      // Open fort-palace training ground, banyans, kalyani, fallen shrine
      // -------------------------------------------------------------
      {
        id: 1, chapter: 1, chapterName: 'I. Ramanathapuram & Kalaiyar Kovil',
        title: 'The Only Child', icon: 'shadow_crescent',
        desc: 'Master crown prince martial arts, languages, and diplomacy in the Ramnad palace grounds.',
        x: 240, y: 720
      },
      {
        id: 2, chapter: 1, chapterName: 'I. Ramanathapuram & Kalaiyar Kovil',
        title: 'Valari & Silambam', icon: 'valari_boomerang',
        desc: 'Master rhythmic staff strikes and sickle throwing with the fort drummer.',
        x: 380, y: 640
      },
      {
        id: 3, chapter: 1, chapterName: 'I. Ramanathapuram & Kalaiyar Kovil',
        title: 'The Pillared Mandapam', icon: 'granite_column',
        desc: 'Use one thousand granite pillars to occlude British lantern cones.',
        x: 520, y: 720
      },
      {
        id: 4, chapter: 1, chapterName: 'I. Ramanathapuram & Kalaiyar Kovil',
        title: 'The Courier\'s Message', icon: 'garland_bead',
        desc: 'Intercept Colonel Smith\'s search dispatch bags for the intel garland.',
        x: 660, y: 620
      },
      {
        id: 5, chapter: 1, chapterName: 'I. Ramanathapuram & Kalaiyar Kovil',
        title: 'Escape to the Western Ghats', icon: 'defile_crest',
        desc: 'Chapter I Finale: Escort infant Vellachi and ministers across the cordon.',
        x: 800, y: 700, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 2: VIRUPAKSHI & DINDIGUL FOOTHILLS (Levels 6 - 10)
      // Walled fort town, highland sanctuary, granary, Mysore alliance
      // -------------------------------------------------------------
      {
        id: 6, chapter: 2, chapterName: 'II. Virupakshi & Dindigul Foothills',
        title: 'The Gates of Virupakshi', icon: 'trust_bangles',
        desc: 'Persuade Chieftain Gopala Nayaker to earn diplomatic trust bangles.',
        x: 990, y: 520
      },
      {
        id: 7, chapter: 2, chapterName: 'II. Virupakshi & Dindigul Foothills',
        title: 'The Granary Allocation', icon: 'grain_basket',
        desc: 'Ration coarse millet and silver among refugee families and scouts.',
        x: 1120, y: 640
      },
      {
        id: 8, chapter: 2, chapterName: 'II. Virupakshi & Dindigul Foothills',
        title: 'The Dindigul Durbar', icon: 'persian_scroll',
        desc: 'Deliver an eloquent Persian treaty to Sultan Hyder Ali of Mysore.',
        x: 1250, y: 480
      },
      {
        id: 9, chapter: 2, chapterName: 'II. Virupakshi & Dindigul Foothills',
        title: 'The Udaiyaal Regiment', icon: 'crossed_staves',
        desc: 'Drill the first all-female regiment in protective Silambam rings.',
        x: 1380, y: 600
      },
      {
        id: 10, chapter: 2, chapterName: 'II. Virupakshi & Dindigul Foothills',
        title: 'The Convoy of Five Thousand', icon: 'carried_lantern',
        desc: 'Chapter II Finale: Guide 5,000 Mysore cavalry and artillery through defiles.',
        x: 1510, y: 520, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 3: DINDIGUL ROCK & MADURAI ROADS (Levels 11 - 15)
      // Allied court, cantonments, cryptography, festival disguise
      // -------------------------------------------------------------
      {
        id: 11, chapter: 3, chapterName: 'III. Dindigul Rock & Madurai Roads',
        title: 'Kuyili\'s Eye', icon: 'twin_flame',
        desc: 'Coordinate Kuyili\'s inner disguise with Velu Nachiyar\'s outer scouts.',
        x: 1690, y: 720
      },
      {
        id: 12, chapter: 3, chapterName: 'III. Dindigul Rock & Madurai Roads',
        title: 'The Valari Arc', icon: 'valari_boomerang',
        desc: 'Throw the curved Tamil Valari along parabolic arcs to sever lantern lines.',
        x: 1820, y: 600
      },
      {
        id: 13, chapter: 3, chapterName: 'III. Dindigul Rock & Madurai Roads',
        title: 'The EIC Cantonment Ledgers', icon: 'cipher_wheel',
        desc: 'Align concentric brass cipher disks to uncover British powder vaults.',
        x: 1950, y: 740
      },
      {
        id: 14, chapter: 3, chapterName: 'III. Dindigul Rock & Madurai Roads',
        title: 'The Cartographer\'s Trap', icon: 'crossroads_post',
        desc: 'Tamper with granite patrol road-markers to redirect British sentries.',
        x: 2080, y: 620
      },
      {
        id: 15, chapter: 3, chapterName: 'III. Dindigul Rock & Madurai Roads',
        title: 'The Vijayadashami Infiltration', icon: 'flower_basket',
        desc: 'Chapter III Finale: Enter fortress gates disguised as Navaratri devotees.',
        x: 2210, y: 700, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 4: SIVAGANGA RECLAIMED (Levels 16 - 20)
      // Palace-fort transformed; rampart walk loops back to Ch 2!
      // -------------------------------------------------------------
      {
        id: 16, chapter: 4, chapterName: 'IV. Sivaganga Reclaimed',
        title: 'The Outer Ramparts', icon: 'banner_cluster',
        desc: 'Coordinate Maruthu\'s eastern diversion while scaling southern battlements.',
        x: 2360, y: 540
      },
      {
        id: 17, chapter: 4, chapterName: 'IV. Sivaganga Reclaimed',
        title: 'The Moat Sluice Gates', icon: 'sluice_wheel',
        desc: 'Rotate hydraulic sluice wheels to drain the moat and reveal dry aqueducts.',
        x: 2260, y: 380
      },
      {
        id: 18, chapter: 4, chapterName: 'IV. Sivaganga Reclaimed',
        title: 'The Powder Magazine', icon: 'dimming_flame',
        desc: 'Commander Kuyili\'s solemn sacrifice neutralizing colonial munitions.',
        x: 2060, y: 320
      },
      {
        id: 19, chapter: 4, chapterName: 'IV. Sivaganga Reclaimed',
        title: 'The Royal Palace Courtyard', icon: 'royal_bastion',
        desc: 'Disarm the retreating colonial garrison command inside the inner court.',
        x: 1840, y: 360
      },
      {
        id: 20, chapter: 4, chapterName: 'IV. Sivaganga Reclaimed',
        title: 'The Coronation of Sivaganga', icon: 'royal_umbrella',
        desc: 'Grand Finale: Ascend the throne of Sivaganga as all alliance bells toll.',
        x: 1620, y: 280, isChapterFinale: true
      }
    ];

    // Chapter Fort-Gates (Ability gates rendered geographically between regions)
    this.chapterGates = [
      {
        id: 'gate_1_2',
        name: 'Gate of the Western Ghats',
        chapterRequired: 1,
        levelRequirement: 5,
        x: 895, y: 610,
        unlocked: false
      },
      {
        id: 'gate_2_3',
        name: 'Gate of Dindigul Rock',
        chapterRequired: 2,
        levelRequirement: 10,
        x: 1600, y: 620,
        unlocked: false
      },
      {
        id: 'gate_3_4',
        name: 'Gate of Sivaganga Ramparts',
        chapterRequired: 3,
        levelRequirement: 15,
        x: 2285, y: 620,
        unlocked: false
      }
    ];
  }

  init() {
    this.container = document.getElementById('view-chronicle');
    if (!this.container) return;

    this.canvas = document.getElementById('chronicle-cartography-canvas');
    this.ctx = this.canvas?.getContext('2d');
    this.nodesLayer = document.getElementById('chronicle-nodes-container');
    this.plaqueEl = document.getElementById('chronicle-ink-plaque');

    this.loadAndSanitizeProgress();
    this.setupZoomPan();
    this.drawRegionalSurvey();
    this.renderNodeElements();
    this.bindKeyboardNavigation();
    this.bindHeaderControls();
    this.startMarkerLoop();
  }

  bindHeaderControls() {
    const homeBtn = document.getElementById('chronicle-back-home-btn');
    const settingsBtn = document.getElementById('chronicle-settings-btn');
    const embarkBtn = document.getElementById('plaque-embark-btn');
    const unlockAllBtn = document.getElementById('chronicle-unlock-all-btn');

    if (homeBtn) {
      homeBtn.onclick = () => {
        if (window.sivagangaFlow) {
          window.sivagangaFlow.transition('GATE_HOME');
        } else if (window.sivagangaRouter) {
          window.sivagangaRouter.navigate('/');
        } else {
          window.sivagangaMain.openTitleScreen();
        }
      };
    }
    if (settingsBtn) {
      settingsBtn.onclick = () => window.sivagangaSettings.open();
    }
    if (unlockAllBtn) {
      unlockAllBtn.onclick = () => {
        if (window.sivagangaSave) {
          window.sivagangaSave.state.unlockedLevel = 20;
          for (let i = 1; i <= 20; i++) {
            if (!window.sivagangaSave.state.completedLevels.includes(i)) {
              window.sivagangaSave.state.completedLevels.push(i);
            }
          }
          window.sivagangaSave.save();
        }
        this.loadAndSanitizeProgress();
        this.chapterGates.forEach(g => { g.unlocked = true; });
        this.drawRegionalSurvey();
        this.renderNodeElements();
        if (window.sivagangaRouter) {
          window.sivagangaRouter.showNoticeToast('All 20 Historical Trials Unlocked for Evaluation & Seamless Flow!');
        }
        if (window.sivagangaAudio) {
          window.sivagangaAudio.playResolveBell();
        }
      };
    }
    if (embarkBtn) {
      embarkBtn.onclick = () => {
        const targetNode = this.nodes.find(n => n.id === this.focusedNodeId);
        if (targetNode) {
          const isUnlocked = targetNode.id <= this.unlockedLevel || this.completedLevels.includes(targetNode.id);
          this.handleSelectNode(targetNode, isUnlocked);
        }
      };
    }
  }

  /**
   * Technical Contract: Derive all node lock/unlock/complete states from save-data.
   * Guard against corrupted or out-of-range progress by defaulting gracefully to Level 1.
   */
  loadAndSanitizeProgress() {
    try {
      const state = window.sivagangaSave?.state;
      if (state && typeof state.unlockedLevel === 'number') {
        this.unlockedLevel = Math.max(2, Math.min(20, state.unlockedLevel));
      } else {
        this.unlockedLevel = 2;
      }

      if (state && Array.isArray(state.completedLevels)) {
        this.completedLevels = state.completedLevels.filter(n => typeof n === 'number' && n >= 1 && n <= 20);
      } else {
        this.completedLevels = [];
      }

      this.currentNodeId = this.unlockedLevel;
      this.focusedNodeId = this.currentNodeId;
    } catch (e) {
      console.warn('Chronicle: Corrupted save data detected. Defaulting safely to Level 2.', e);
      this.unlockedLevel = 2;
      this.completedLevels = [];
      this.currentNodeId = 2;
      this.focusedNodeId = 2;
    }

    // Update Chapter Fort-Gates state
    this.chapterGates.forEach(g => {
      g.unlocked = this.completedLevels.includes(g.levelRequirement);
    });

    // Set initial ember marker to current node
    const cur = this.nodes.find(n => n.id === this.currentNodeId) || this.nodes[0];
    this.emberMarker.x = cur.x;
    this.emberMarker.y = cur.y;
    this.emberMarker.targetX = cur.x;
    this.emberMarker.targetY = cur.y;
  }

  /**
   * Explorable Zoom & Pan Setup (Mouse wheel, pinch, drag, and zoom buttons)
   */
  setupZoomPan() {
    const viewport = document.querySelector('.chronicle-map-scroll-viewport');
    const wrap = document.querySelector('.chronicle-world-canvas-wrap');
    if (!viewport || !wrap) return;

    // Pan via mouse drag
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.chronicle-node-card') || e.target.closest('.btn-tamil')) return;
      this.isPanning = true;
      this.startPan = { x: e.clientX + viewport.scrollLeft, y: e.clientY + viewport.scrollTop };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      viewport.scrollLeft = this.startPan.x - e.clientX;
      viewport.scrollTop = this.startPan.y - e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
    });

    // Zoom via wheel
    viewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.setZoom(this.zoom + delta);
      }
    }, { passive: false });

    // Zoom buttons
    const zoomInBtn = document.getElementById('chronicle-zoom-in');
    const zoomOutBtn = document.getElementById('chronicle-zoom-out');
    const zoomResetBtn = document.getElementById('chronicle-zoom-reset');

    if (zoomInBtn) zoomInBtn.onclick = () => this.setZoom(this.zoom + 0.2);
    if (zoomOutBtn) zoomOutBtn.onclick = () => this.setZoom(this.zoom - 0.2);
    if (zoomResetBtn) zoomResetBtn.onclick = () => {
      this.setZoom(1.0);
      this.centerOnNode(this.currentNodeId);
    };
  }

  setZoom(val) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, val));
    const wrap = document.querySelector('.chronicle-world-canvas-wrap');
    if (wrap) {
      wrap.style.transform = `scale(${this.zoom})`;
      wrap.style.transformOrigin = '0 0';
    }
    const indicator = document.getElementById('chronicle-zoom-level');
    if (indicator) indicator.textContent = `${Math.round(this.zoom * 100)}%`;
  }

  centerOnNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    const viewport = document.querySelector('.chronicle-map-scroll-viewport');
    if (!node || !viewport) return;

    const targetScrollX = (node.x * this.zoom) - (viewport.clientWidth / 2);
    const targetScrollY = (node.y * this.zoom) - (viewport.clientHeight / 2);

    viewport.scrollTo({
      left: Math.max(0, targetScrollX),
      top: Math.max(0, targetScrollY),
      behavior: 'smooth'
    });
  }

  /**
   * Draws the hand-inked fortified regional survey on MAP-PARCHMENT.
   * 4 distinct regions, rampart-walk bridges, moat crossings, return loop, and fog-of-war.
   */
  drawRegionalSurvey() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width = 2600;
    const h = this.canvas.height = 1200;

    ctx.clearRect(0, 0, w, h);

    // 1. Parchment Texture & Scribe Inking
    ctx.fillStyle = '#C9A876'; // MAP-PARCHMENT
    ctx.fillRect(0, 0, w, h);

    // Scribe grid-lines
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 120, 70, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 100) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Four Fortified Regions with Architectural Silhouettes
    this.drawRegion1_Ramanathapuram(ctx);
    this.drawRegion2_Virupakshi(ctx);
    this.drawRegion3_Dindigul(ctx);
    this.drawRegion4_SivagangaReclaimed(ctx);

    // 3. Meandering Vaigai River with Moat Crossings
    this.drawVaigaiRiverAndMoats(ctx, w, h);

    // 4. Inked Amber Travel-Path connecting all 20 nodes
    this.drawAmberTravelPath(ctx);

    // 5. Geographic Chapter Fort-Gates
    this.drawChapterFortGates(ctx);

    // 6. Scribe Title Cartouche & Legend
    this.drawScribeCartouche(ctx);

    // 7. Soft BG-MAROON Ink-Wash Fog-of-War over unreached regions
    this.drawInkWashFogOfWar(ctx, w, h);
  }

  drawRegion1_Ramanathapuram(ctx) {
    // Open fort-palace training ground, granite ramparts, stepped kalyani outline
    ctx.save();
    ctx.fillStyle = 'rgba(184, 80, 66, 0.08)'; // BG-TERRACOTTA subtle wash
    ctx.fillRect(80, 480, 780, 440);
    ctx.strokeStyle = 'rgba(120, 65, 35, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 480, 780, 440);

    // Label
    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#422416';
    ctx.fillText('REGION I: RAMANATHAPURAM & KALAIYAR KOVIL', 100, 515);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#6e442c';
    ctx.fillText('Sanctuary of the Fallen Sovereign — 1772', 100, 535);

    // Banyan tree grove sketch
    for (let i = 0; i < 5; i++) {
      const bx = 160 + i * 130;
      const by = 830;
      ctx.beginPath();
      ctx.arc(bx, by - 24, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 102, 85, 0.12)'; // Sage canopy wash
      ctx.fill();
      ctx.strokeStyle = '#5c4028';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRegion2_Virupakshi(ctx) {
    // Walled fort town, Kodai mountain ridges, granary depots
    ctx.save();
    ctx.fillStyle = 'rgba(167, 190, 174, 0.08)'; // ACCENT-SAGE wash
    ctx.fillRect(900, 380, 680, 460);
    ctx.strokeStyle = 'rgba(80, 110, 95, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(900, 380, 680, 460);

    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#22382e';
    ctx.fillText('REGION II: VIRUPAKSHI & DINDIGUL FOOTHILLS', 920, 415);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#4c6e60';
    ctx.fillText('Sanctuary of Chieftain Gopala Nayaker — 1772–1779', 920, 435);

    // Mountain peak hatching
    ctx.strokeStyle = '#614833';
    ctx.lineWidth = 1.5;
    for (let m = 0; m < 6; m++) {
      const mx = 950 + m * 90;
      const my = 750;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 35, my - 50);
      ctx.lineTo(mx + 70, my);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRegion3_Dindigul(ctx) {
    // Allied rock fort court, cantonment stores, shadow routes
    ctx.save();
    ctx.fillStyle = 'rgba(217, 164, 65, 0.08)'; // ACCENT-GOLD wash
    ctx.fillRect(1620, 480, 660, 420);
    ctx.strokeStyle = 'rgba(160, 115, 35, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1620, 480, 660, 420);

    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#423214';
    ctx.fillText('REGION III: DINDIGUL ROCK & THE MADURAI HIGHWAYS', 1640, 515);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#785b24';
    ctx.fillText('Mysore Compact & The Shadow Infiltration — 1779–1780', 1640, 535);
    ctx.restore();
  }

  drawRegion4_SivagangaReclaimed(ctx) {
    // Sivaganga Reclaimed: The palace fort transformed!
    // Rampart-walk loops visibly back toward Region 2 to show geographical return!
    ctx.save();
    ctx.fillStyle = 'rgba(184, 80, 66, 0.12)';
    ctx.fillRect(1580, 160, 920, 300);
    ctx.strokeStyle = '#B85042';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1580, 160, 920, 300);

    ctx.font = 'bold 16px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.fillText('REGION IV: THE RECLAMATION OF SIVAGANGA (1780)', 1610, 200);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#9c3d2f';
    ctx.fillText('The Liberated Kingdom & Royal Ascension of Rani Velu Nachiyar', 1610, 222);

    // Visible rampart-walk loop returning back to the heartland
    ctx.strokeStyle = '#85512b';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(1580, 280);
    ctx.bezierCurveTo(1400, 250, 1200, 320, 1120, 480);
    ctx.stroke();
    ctx.restore();
  }

  drawVaigaiRiverAndMoats(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = '#41665a';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(40, 920);
    ctx.bezierCurveTo(600, 860, 1100, 960, 1650, 840);
    ctx.bezierCurveTo(2000, 780, 2300, 920, 2580, 860);
    ctx.stroke();

    // Moat bridges across the river
    const bridgeX = [840, 1580, 2240];
    bridgeX.forEach(bx => {
      ctx.fillStyle = '#42281a';
      ctx.fillRect(bx - 12, 830, 24, 60);
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - 12, 830, 24, 60);
    });

    ctx.font = 'italic 16px "Cambria", serif';
    ctx.fillStyle = '#244037';
    ctx.fillText('~ Sacred Vaigai River & Protective Moat Network ~', 1050, 920);
    ctx.restore();
  }

  drawAmberTravelPath(ctx) {
    ctx.save();
    // Inked dotted amber travel-path threading all 20 nodes
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    this.nodes.forEach((n, idx) => {
      if (idx === 0) {
        ctx.moveTo(n.x, n.y);
      } else {
        const prev = this.nodes[idx - 1];
        // Create natural rampart-walk curvature
        const midX = (prev.x + n.x) / 2;
        const midY = (prev.y + n.y) / 2 + (idx % 2 === 0 ? 25 : -25);
        ctx.quadraticCurveTo(midX, midY, n.x, n.y);
      }
    });
    ctx.stroke();

    // Prominent golden pedagogical arc connecting Level 1 (Courtyard) and Level 2 (Valari & Silambam)
    const n1 = this.nodes[0];
    const n2 = this.nodes[1];
    if (n1 && n2) {
      ctx.save();
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      ctx.shadowColor = '#D9A441';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2 - 28;
      ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);
      ctx.stroke();

      // Label: Tutelage Flow
      ctx.font = 'bold 11px "Cambria", serif';
      ctx.fillStyle = '#4a2817';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText('~ Tutelage Bridge ~', midX, midY - 6);
      ctx.restore();
    }

    ctx.restore();
  }

  drawChapterFortGates(ctx) {
    // Geographic Chapter Ability Gates
    this.chapterGates.forEach(gate => {
      ctx.save();
      const gw = 48;
      const gh = 64;
      const gx = gate.x - gw / 2;
      const gy = gate.y - gh / 2;

      // Gate tower stone
      ctx.fillStyle = gate.unlocked ? '#3b251c' : '#221511';
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = gate.unlocked ? '#D9A441' : '#6e4f3a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(gx, gy, gw, gh);

      // Gate arch opening
      ctx.fillStyle = gate.unlocked ? 'rgba(217, 164, 65, 0.3)' : '#110a08';
      ctx.beginPath();
      ctx.arc(gate.x, gy + gh * 0.45, 14, Math.PI, 0);
      ctx.lineTo(gate.x + 14, gy + gh);
      ctx.lineTo(gate.x - 14, gy + gh);
      ctx.closePath();
      ctx.fill();

      // Gate crest status
      ctx.font = 'bold 10px "Montserrat", sans-serif';
      ctx.fillStyle = gate.unlocked ? '#D9A441' : '#947565';
      ctx.textAlign = 'center';
      ctx.fillText(gate.unlocked ? 'OPEN' : 'LOCKED', gate.x, gy - 8);

      ctx.restore();
    });
  }

  drawScribeCartouche(ctx) {
    ctx.save();
    // Royal Tamil Court Scribe Cartouche
    const cx = 160;
    const cy = 180;
    const cw = 440;
    const ch = 190;

    ctx.fillStyle = 'rgba(46, 31, 27, 0.95)';
    ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, cy, cw, ch);

    // Inner gold fillet
    ctx.strokeStyle = '#ebd076';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 6, cy + 6, cw - 12, ch - 12);

    ctx.fillStyle = '#D9A441';
    ctx.font = 'bold 20px "Cambria", serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CHRONICLE OF SIVAGANGA', cx + cw / 2, cy + 40);

    ctx.font = 'italic 13px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.fillText('A Fortified Regional Survey of Rani Velu Nachiyar\'s Campaign', cx + cw / 2, cy + 68);
    ctx.fillText('(1772 – 1780)', cx + cw / 2, cy + 88);

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '12px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('• Full Icon: Accomplished Trial', cx + 30, cy + 125);
    ctx.fillStyle = '#D9A441';
    ctx.fillText('• Glowing Ember: Current Vanguard Position', cx + 30, cy + 145);
    ctx.fillStyle = '#8c766a';
    ctx.fillText('• Faint Sketch: Unreached Fortress Domain', cx + 30, cy + 165);

    ctx.restore();
  }

  /**
   * Soft BG-MAROON ink-wash fog-of-war with hand-inked gradient feathering.
   * Never a hard black mask! Lifts smoothly over completed chapters.
   */
  drawInkWashFogOfWar(ctx, w, h) {
    ctx.save();

    // Determine highest completed chapter
    let maxChapterUnlocked = 1;
    if (this.unlockedLevel > 5) maxChapterUnlocked = 2;
    if (this.unlockedLevel > 10) maxChapterUnlocked = 3;
    if (this.unlockedLevel > 15) maxChapterUnlocked = 4;

    // Region boundary X-cuts:
    // Ch 1: 0 - 895
    // Ch 2: 895 - 1600
    // Ch 3: 1600 - 2285
    // Ch 4: 1580 - 2600 (upper tier)

    if (maxChapterUnlocked < 4) {
      // Ink-wash over Region 4
      const fogGrad4 = ctx.createLinearGradient(1500, 0, 1750, 0);
      fogGrad4.addColorStop(0, 'rgba(46, 31, 27, 0)');
      fogGrad4.addColorStop(0.35, 'rgba(46, 31, 27, 0.72)');
      fogGrad4.addColorStop(1, 'rgba(46, 31, 27, 0.88)'); // BG-MAROON ink wash
      ctx.fillStyle = fogGrad4;
      ctx.fillRect(1500, 140, 1100, 360);
    }

    if (maxChapterUnlocked < 3) {
      // Ink-wash over Region 3
      const fogGrad3 = ctx.createLinearGradient(1580, 0, 1720, 0);
      fogGrad3.addColorStop(0, 'rgba(46, 31, 27, 0)');
      fogGrad3.addColorStop(0.4, 'rgba(46, 31, 27, 0.76)');
      fogGrad3.addColorStop(1, 'rgba(46, 31, 27, 0.90)');
      ctx.fillStyle = fogGrad3;
      ctx.fillRect(1580, 460, 800, 460);
    }

    if (maxChapterUnlocked < 2) {
      // Ink-wash over Region 2
      const fogGrad2 = ctx.createLinearGradient(860, 0, 1020, 0);
      fogGrad2.addColorStop(0, 'rgba(46, 31, 27, 0)');
      fogGrad2.addColorStop(0.4, 'rgba(46, 31, 27, 0.76)');
      fogGrad2.addColorStop(1, 'rgba(46, 31, 27, 0.90)');
      ctx.fillStyle = fogGrad2;
      ctx.fillRect(860, 360, 800, 500);
    }

    ctx.restore();
  }

  /**
   * Renders the 20 level nodes using established mechanics icons.
   * No generic numbered pins! Full color for completed, gold pulse for current,
   * faint pencil sketch outline through the haze for locked future nodes.
   */
  renderNodeElements() {
    if (!this.nodesLayer) return;
    this.nodesLayer.innerHTML = '';

    this.nodes.forEach(node => {
      const isCompleted = this.completedLevels.includes(node.id);
      const isCurrent = node.id === this.currentNodeId;
      const isUnlocked = node.id <= this.unlockedLevel;

      const nodeEl = document.createElement('div');
      nodeEl.className = `chronicle-node-card interactive-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current-active' : ''} ${!isUnlocked ? 'locked-sketch' : ''}`;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
      nodeEl.setAttribute('tabindex', isUnlocked ? '0' : '-1');
      nodeEl.setAttribute('data-node-id', node.id);

      // Dedicated Established Mechanic Icon SVG
      const iconWrap = document.createElement('div');
      iconWrap.className = `chronicle-icon-disc ${isCompleted ? 'replay-ring' : ''}`;
      iconWrap.innerHTML = this.getNodeIconSVG(node.icon, isCompleted, isCurrent, isUnlocked);

      nodeEl.appendChild(iconWrap);

      // 4-state interaction binding
      window.sivagangaInteraction.attach(nodeEl, {
        onFocus: () => this.handleFocusNode(node),
        onActive: () => {
          nodeEl.classList.add('node-pressed');
        },
        onResolve: () => this.handleSelectNode(node, isUnlocked)
      });

      this.nodesLayer.appendChild(nodeEl);
    });

    // Auto-focus current node initially
    const initialNode = this.nodes.find(n => n.id === this.currentNodeId);
    if (initialNode) this.handleFocusNode(initialNode);
  }

  handleFocusNode(node) {
    this.focusedNodeId = node.id;
    this.emberMarker.targetX = node.x;
    this.emberMarker.targetY = node.y;

    // Show Ink-Bleed Plaque in Cambria
    if (this.plaqueEl) {
      document.getElementById('plaque-chapter-tag').textContent = node.chapterName;
      document.getElementById('plaque-node-title').textContent = `${node.id}. ${node.title}`;
      document.getElementById('plaque-node-desc').textContent = node.desc;

      const actionsRow = this.plaqueEl.querySelector('.plaque-actions-row');
      if (actionsRow) {
        actionsRow.innerHTML = '';

        const isUnlocked = node.id <= this.unlockedLevel || this.completedLevels.includes(node.id);
        const embarkBtn = document.createElement('button');
        embarkBtn.id = 'plaque-embark-btn';
        embarkBtn.className = 'btn-tamil btn-primary';
        embarkBtn.textContent = isUnlocked ? 'Embark Trial' : 'Trial Sealed';
        embarkBtn.onclick = () => {
          const targetNode = this.nodes.find(n => n.id === this.focusedNodeId);
          if (targetNode) {
            this.handleSelectNode(targetNode, isUnlocked);
          }
        };
        actionsRow.appendChild(embarkBtn);

        // Universal Campaign Level Connectivity Navigation on Plaque
        if (node.id > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.className = 'btn-tamil flow-header-link-btn';
          prevBtn.innerHTML = `<span>&larr; Level ${node.id - 1}</span>`;
          prevBtn.title = `Step back to Level ${node.id - 1}`;
          prevBtn.onclick = () => {
            const prevNode = this.nodes.find(n => n.id === node.id - 1);
            if (prevNode) {
              this.handleFocusNode(prevNode);
              const prevUnlocked = prevNode.id <= this.unlockedLevel || this.completedLevels.includes(prevNode.id);
              this.handleSelectNode(prevNode, prevUnlocked);
            }
          };
          actionsRow.appendChild(prevBtn);
        }

        if (node.id < 20) {
          const nextBtn = document.createElement('button');
          nextBtn.className = 'btn-tamil flow-header-link-btn';
          nextBtn.innerHTML = `<span>Level ${node.id + 1} &rarr;</span>`;
          nextBtn.title = `Step forward to Level ${node.id + 1}`;
          nextBtn.onclick = () => {
            const nextNode = this.nodes.find(n => n.id === node.id + 1);
            if (nextNode) {
              const nextUnlocked = nextNode.id <= this.unlockedLevel || this.completedLevels.includes(nextNode.id);
              this.handleFocusNode(nextNode);
              this.handleSelectNode(nextNode, nextUnlocked);
            }
          };
          actionsRow.appendChild(nextBtn);
        }
      }

      this.plaqueEl.classList.add('visible');
    }
  }

  handleSelectNode(node, isUnlocked) {
    if (window.sivagangaFlow && window.sivagangaFlow.isTransitioning) return;
    if (window.sivagangaTransitions && window.sivagangaTransitions.isWiping) return;

    if (!isUnlocked) {
      window.sivagangaAudio.playQuietFade();
      if (this.plaqueEl) {
        document.getElementById('plaque-node-desc').textContent =
          'This fortress gate remains sealed under colonial occupation. Complete prior trials to advance.';
      }
      window.sivagangaRouter?.showNoticeToast(`Trial ${node.id} Locked: Master prior trials in the Chronicle first.`);
      return;
    }

    // Launch Level via Game-Flow State Machine
    if (window.sivagangaFlow) {
      window.sivagangaFlow.transition('SELECT_NODE', { levelId: node.id });
    } else if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate(window.sivagangaRouter.getLevelUrl(node.id));
    } else {
      window.sivagangaMain.startLevel(node.id);
    }
  }

  /**
   * Smoothly unlocks the chapter gate, plays audio, redraws the map, and auto-focuses the next node.
   */
  openChapterGateAndFocus(completedLevelId, nextNodeId) {
    this.loadAndSanitizeProgress();
    this.drawRegionalSurvey();
    this.renderNodeElements();

    // Unlock corresponding chapter gate
    this.chapterGates.forEach(g => {
      if (g.levelRequirement <= completedLevelId) {
        g.unlocked = true;
      }
    });
    this.drawRegionalSurvey();

    window.sivagangaAudio?.playTempleBell();

    const targetNode = this.nodes.find(n => n.id === nextNodeId) || this.nodes[0];
    if (targetNode) {
      this.handleFocusNode(targetNode);
      this.centerOnNode(nextNodeId);
      window.sivagangaAudio?.playResolveBell();
    }
  }

  bindKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      if (!this.container || !this.container.classList.contains('active-view')) return;
      if (window.sivagangaSettings && window.sivagangaSettings.isOpen) return;

      let nextId = this.focusedNodeId;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        nextId = Math.min(20, this.focusedNodeId + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        nextId = Math.max(1, this.focusedNodeId - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetNode = this.nodes.find(n => n.id === this.focusedNodeId);
        if (targetNode) this.handleSelectNode(targetNode, targetNode.id <= this.unlockedLevel);
        return;
      }

      if (nextId !== this.focusedNodeId) {
        const nextNode = this.nodes.find(n => n.id === nextId);
        if (nextNode) {
          this.handleFocusNode(nextNode);
          this.centerOnNode(nextId);
        }
      }
    });
  }

  /**
   * Continuous animation loop for the Firefly-Ember progress marker
   */
  startMarkerLoop() {
    const loop = () => {
      this.updateEmberMarker();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  updateEmberMarker() {
    const m = this.emberMarker;
    m.x += (m.targetX - m.x) * 0.12;
    m.y += (m.targetY - m.y) * 0.12;
    m.phase += 0.06;

    const el = document.getElementById('chronicle-firefly-marker');
    if (el) {
      const bobX = Math.cos(m.phase) * 3;
      const bobY = Math.sin(m.phase * 1.4) * 4;
      el.style.left = `${m.x + bobX}px`;
      el.style.top = `${m.y + bobY}px`;
    }
  }

  /**
   * Returns bespoke established mechanic SVG icon for each of the 20 levels.
   * NO numbered pins anywhere!
   */
  getNodeIconSVG(iconType, isCompleted, isCurrent, isUnlocked) {
    const stroke = isUnlocked ? (isCompleted ? '#A7BEAE' : '#D9A441') : 'rgba(80, 50, 40, 0.45)';
    const fill = isUnlocked ? (isCompleted ? 'rgba(167, 190, 174, 0.25)' : 'rgba(217, 164, 65, 0.25)') : 'none';
    const dash = !isUnlocked ? 'stroke-dasharray="2,2"' : '';

    switch (iconType) {
      case 'shadow_crescent':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M20 6 C12 6 6 12 6 20 C6 28 12 34 20 34 C15 30 15 10 20 6 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/></svg>`;
      case 'water_kalyani':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="14" fill="none" stroke="${stroke}" stroke-width="1.5" ${dash}/><circle cx="20" cy="20" r="9" fill="none" stroke="${stroke}" stroke-width="1.5" ${dash}/><circle cx="20" cy="20" r="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      case 'granite_column':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="14" y="10" width="12" height="20" fill="${fill}" stroke="${stroke}" stroke-width="1.8" ${dash}/><line x1="11" y1="10" x2="29" y2="10" stroke="${stroke}" stroke-width="2"/><line x1="11" y1="30" x2="29" y2="30" stroke="${stroke}" stroke-width="2"/></svg>`;
      case 'garland_bead':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="3,2"/><circle cx="20" cy="8" r="3" fill="${stroke}"/><circle cx="20" cy="32" r="3" fill="${stroke}"/><circle cx="8" cy="20" r="3" fill="${stroke}"/><circle cx="32" cy="20" r="3" fill="${stroke}"/></svg>`;
      case 'defile_crest':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M8 32 L20 10 L32 32 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/><circle cx="20" cy="24" r="3" fill="${stroke}"/></svg>`;
      case 'trust_bangles':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="15" cy="20" r="9" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/><circle cx="25" cy="20" r="9" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/></svg>`;
      case 'grain_basket':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M10 18 Q 20 14 30 18 L26 32 Q 20 34 14 32 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/></svg>`;
      case 'persian_scroll':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="12" y="10" width="16" height="20" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.8" ${dash}/><line x1="16" y1="15" x2="24" y2="15" stroke="${stroke}" stroke-width="1.5"/><line x1="16" y1="20" x2="24" y2="20" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      case 'crossed_staves':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><line x1="10" y1="10" x2="30" y2="30" stroke="${stroke}" stroke-width="2.5" ${dash}/><line x1="30" y1="10" x2="10" y2="30" stroke="${stroke}" stroke-width="2.5" ${dash}/></svg>`;
      case 'carried_lantern':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="14" y="14" width="12" height="16" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.8" ${dash}/><path d="M17 14 C17 8 23 8 23 14" fill="none" stroke="${stroke}" stroke-width="1.8"/><circle cx="20" cy="22" r="3" fill="${stroke}"/></svg>`;
      case 'twin_flame':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M14 26 C11 26 11 20 14 16 C17 20 17 26 14 26 Z" fill="${stroke}"/><path d="M26 26 C23 26 23 20 26 16 C29 20 29 26 26 26 Z" fill="${stroke}"/></svg>`;
      case 'valari_boomerang':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M10 26 Q 22 8 30 22 Q 22 18 10 26 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/></svg>`;
      case 'cipher_wheel':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="13" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/><circle cx="20" cy="20" r="7" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="20" y1="7" x2="20" y2="13" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      case 'crossroads_post':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><line x1="20" y1="10" x2="20" y2="32" stroke="${stroke}" stroke-width="2.5"/><polygon points="20,12 28,15 20,18" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><polygon points="20,20 12,23 20,26" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      case 'flower_basket':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M10 20 Q 20 16 30 20 L27 32 Q 20 34 13 32 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" ${dash}/><circle cx="16" cy="17" r="3" fill="${stroke}"/><circle cx="20" cy="15" r="3" fill="${stroke}"/><circle cx="24" cy="17" r="3" fill="${stroke}"/></svg>`;
      case 'banner_cluster':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><line x1="12" y1="10" x2="12" y2="32" stroke="${stroke}" stroke-width="2"/><polygon points="12,12 22,15 12,18" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="24" y1="10" x2="24" y2="32" stroke="${stroke}" stroke-width="2"/><polygon points="24,14 34,17 24,20" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
      case 'sluice_wheel':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="12" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/><line x1="8" y1="20" x2="32" y2="20" stroke="${stroke}" stroke-width="2"/><line x1="20" y1="8" x2="20" y2="32" stroke="${stroke}" stroke-width="2"/></svg>`;
      case 'dimming_flame':
        // Level 18: Handled with solemn restraint, a quiet ember honoring Kuyili
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M20 28 C16 28 16 22 20 16 C24 22 24 28 20 28 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/><circle cx="20" cy="22" r="2" fill="${stroke}"/></svg>`;
      case 'royal_bastion':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="12" y="16" width="16" height="16" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/><polygon points="12,16 20,8 28,16" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/></svg>`;
      case 'royal_umbrella':
        // Level 20: Royal Golden Umbrella (Venkotrakudai)
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M10 20 C10 12 30 12 30 20 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/><line x1="20" y1="20" x2="20" y2="32" stroke="${stroke}" stroke-width="2"/><circle cx="20" cy="11" r="2" fill="${stroke}"/></svg>`;
      default:
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`;
    }
  }
}

// Global chronicle singleton
window.sivagangaChronicle = new SivagangaChronicle();
