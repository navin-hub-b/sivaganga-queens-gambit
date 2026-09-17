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
      // CHAPTER 1: RAMANATHAPURAM FORT & ROYAL LINEAGE (Levels 1 - 5)
      // Open fort-palace grounds, martial rings, ramparts, scribes' mandapam, betrothal pavilion
      // -------------------------------------------------------------
      {
        id: 1, chapter: 1, chapterName: 'I. The Royal Lineage (1730–1746)',
        title: 'The Only Child', icon: 'shadow_crescent', mechanic: 'Free-Roam Movement & Royal Mentorship',
        desc: 'Explore Ramanathapuram Fort-Palace and master foundational arts under King Chellamuthu Sethupathy.',
        x: 240, y: 720
      },
      {
        id: 2, chapter: 1, chapterName: 'I. The Royal Lineage (1730–1746)',
        title: 'Valari & Silambam', icon: 'valari_boomerang', mechanic: 'Rhythm & Timing Combat (Rangoli Beat)',
        desc: 'Master rhythmic staff strikes and sickle throwing attuned to the fort drummer\'s pulse.',
        x: 380, y: 640
      },
      {
        id: 3, chapter: 1, chapterName: 'I. The Royal Lineage (1730–1746)',
        title: 'Horse and Bow', icon: 'horse_bow', mechanic: 'Precision Lead-Aim & Horsemanship',
        desc: 'Master equestrian horsemanship and precision lead-aim archery along the outer ramparts.',
        x: 520, y: 720
      },
      {
        id: 4, chapter: 1, chapterName: 'I. The Royal Lineage (1730–1746)',
        title: 'Tongues of the World', icon: 'palm_leaf_scroll', mechanic: 'Palm-Leaf Translation & Code Matching',
        desc: 'Decipher intercepted colonial and diplomatic dispatches across Tamil, French, English, and Urdu in the scribes\' mandapam.',
        x: 660, y: 620
      },
      {
        id: 5, chapter: 1, chapterName: 'I. The Royal Lineage (1730–1746)',
        title: 'The Betrothal', icon: 'betrothal_garland', mechanic: 'Tournament of Three Virtues',
        desc: 'Chapter I Finale: Master archery, combat rhythm, and court diplomacy in the ceremonial fort tournament to unite Ramnad and Sivaganga.',
        x: 800, y: 700, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 2: SIVAGANGA KEEP & VIRUPAKSHI HIGHLANDS (Levels 6 - 10)
      // Sivaganga council keep, agrarian canals, granary depots, Mysore treaty, women's regiment
      // -------------------------------------------------------------
      {
        id: 6, chapter: 2, chapterName: 'II. The Sovereign Reign of Sivaganga (1746–1772)',
        title: 'Queen of Sivaganga', icon: 'council_table', mechanic: 'Village-Economy Resource Management',
        desc: 'Allocate grain, gold, and civic loyalty on the council table to govern Sivaganga and foster prosperity.',
        x: 990, y: 520
      },
      {
        id: 7, chapter: 2, chapterName: 'II. Virupakshi Sanctuary & Alliance (1772–1779)',
        title: 'The Granary Allocation', icon: 'grain_basket', mechanic: 'Resource Rationing & Clamping',
        desc: 'Ration coarse millet and silver among refugee families and scouts in the Virupakshi highland depot.',
        x: 1120, y: 640
      },
      {
        id: 8, chapter: 2, chapterName: 'II. Virupakshi Sanctuary & Alliance (1772–1779)',
        title: 'The Dindigul Durbar', icon: 'persian_scroll', mechanic: 'High-Stakes Persian Treaty Diplomacy',
        desc: 'Present an eloquent Persian treaty to Sultan Hyder Ali of Mysore to secure heavy artillery and cavalry.',
        x: 1250, y: 480
      },
      {
        id: 9, chapter: 2, chapterName: 'II. Virupakshi Sanctuary & Alliance (1772–1779)',
        title: 'The Udaiyaal Regiment', icon: 'crossed_staves', mechanic: 'Unit Formation Drills & Silambam Stances',
        desc: 'Drill the first all-female regiment in protective Silambam combat rings under Commander Kuyili.',
        x: 1380, y: 600
      },
      {
        id: 10, chapter: 2, chapterName: 'II. Virupakshi Sanctuary & Alliance (1772–1779)',
        title: 'The Convoy of Five Thousand', icon: 'carried_lantern', mechanic: 'Allied Army Defile Escort',
        desc: 'Chapter II Finale: Guide 5,000 allied Mysore cavalry and scouts through mountain defiles without raising colonial outposts.',
        x: 1510, y: 520, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 3: DINDIGUL ROCK & MADURAI ROADS (Levels 11 - 15)
      // Monolithic rock fort, dual infiltration, parabolic Valari, ciphers, Navaratri disguise
      // -------------------------------------------------------------
      {
        id: 11, chapter: 3, chapterName: 'III. The Shadow Network & Reconnaissance (1779–1780)',
        title: 'Kuyili\'s Eye', icon: 'twin_flame', mechanic: 'Dual-Character Infiltration',
        desc: 'Coordinate Commander Kuyili\'s inner disguise with Velu Nachiyar\'s outer scouts to unlock the gatehouse.',
        x: 1690, y: 720
      },
      {
        id: 12, chapter: 3, chapterName: 'III. The Shadow Network & Reconnaissance (1779–1780)',
        title: 'The Valari Arc', icon: 'valari_boomerang', mechanic: 'Valari Ranged Non-Lethal Aiming',
        desc: 'Throw the forged Tamil Valari along parabolic arcs to sever colonial sentry lanterns in silence.',
        x: 1820, y: 600
      },
      {
        id: 13, chapter: 3, chapterName: 'III. The Shadow Network & Reconnaissance (1779–1780)',
        title: 'The EIC Cantonment Ledgers', icon: 'cipher_wheel', mechanic: 'Cipher Disk Decryption',
        desc: 'Align concentric cipher wheels to decode East India Company logistical manifests and locate munitions vaults.',
        x: 1950, y: 740
      },
      {
        id: 14, chapter: 3, chapterName: 'III. The Shadow Network & Reconnaissance (1779–1780)',
        title: 'The Cartographer\'s Trap', icon: 'crossroads_post', mechanic: 'Patrol Route Tampering',
        desc: 'Tamper with carved granite crossroads markers to redirect British patrols away from the central avenue.',
        x: 2080, y: 620
      },
      {
        id: 15, chapter: 3, chapterName: 'III. The Shadow Network & Reconnaissance (1779–1780)',
        title: 'The Vijayadashami Infiltration', icon: 'flower_basket', mechanic: 'Festival Devotee Disguise',
        desc: 'Chapter III Finale: Enter fortress gates disguised as Navaratri devotees carrying concealed weapons in flower baskets.',
        x: 2210, y: 700, isChapterFinale: true
      },

      // -------------------------------------------------------------
      // CHAPTER 4: THE RECLAMATION OF SIVAGANGA (Levels 16 - 20)
      // Rampart breach, drained moat aqueducts, solemn tribute, inner court disarm, sovereign coronation
      // -------------------------------------------------------------
      {
        id: 16, chapter: 4, chapterName: 'IV. The Reclamation of Sivaganga (1780)',
        title: 'The Outer Ramparts', icon: 'banner_cluster', mechanic: 'Multi-Front Diversion Timing',
        desc: 'Coordinate the Maruthu brothers\' eastern diversion while scaling the southern battlements in darkness.',
        x: 2360, y: 540
      },
      {
        id: 17, chapter: 4, chapterName: 'IV. The Reclamation of Sivaganga (1780)',
        title: 'The Moat Sluice Gates', icon: 'sluice_wheel', mechanic: 'Hydro-Engineering Sluice Alignment',
        desc: 'Rotate ancient hydraulic granite wheels to drain the defensive moat and reveal dry aqueducts.',
        x: 2260, y: 380
      },
      {
        id: 18, chapter: 4, chapterName: 'IV. The Reclamation of Sivaganga (1780)',
        title: 'The Powder Magazine', icon: 'dimming_flame', mechanic: 'The Heroic Turning Point',
        desc: 'Commander Kuyili\'s solemn, heroic sacrifice neutralizing colonial munitions to protect the sacred temple.',
        x: 2060, y: 320
      },
      {
        id: 19, chapter: 4, chapterName: 'IV. The Reclamation of Sivaganga (1780)',
        title: 'The Royal Palace Courtyard', icon: 'royal_bastion', mechanic: 'Tactical Area Disarm',
        desc: 'Disarm retreating colonial command pickets and breach the inner palace throne room.',
        x: 1840, y: 360
      },
      {
        id: 20, chapter: 4, chapterName: 'IV. The Reclamation of Sivaganga (1780)',
        title: 'The Coronation of Sivaganga', icon: 'royal_umbrella', mechanic: 'Grand Coronation & Victory Symphony',
        desc: 'Grand Finale: Ascend the granite throne of Sivaganga as all alliance bells toll and the royal umbrella unfurls.',
        x: 1620, y: 280, isChapterFinale: true
      }
    ];

    // Chapter Fort-Gates (Ability gates rendered geographically between regions)
    this.chapterGates = [
      {
        id: 'gate_1_2',
        name: 'Gate of the Western Ghats & Sivaganga',
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

      // Auto-heal check: if a level was completed, subsequent level must be unlocked
      if (this.completedLevels.includes(3) && this.unlockedLevel < 4) {
        this.unlockedLevel = 4;
        if (state) state.unlockedLevel = 4;
      }
      // Universal Auto-heal: For any completed level N, level N+1 must be unlocked
      for (let i = 1; i <= 20; i++) {
        if (this.completedLevels.includes(i)) {
          const next = Math.min(20, i + 1);
          if (this.unlockedLevel < next) {
            this.unlockedLevel = next;
            if (state) state.unlockedLevel = next;
          }
        }
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
    ctx.strokeStyle = 'rgba(120, 65, 35, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 480, 780, 440);

    // Decorative corner brackets
    const corners1 = [
      [80, 480, 1, 1], [860, 480, -1, 1],
      [80, 920, 1, -1], [860, 920, -1, -1]
    ];
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    corners1.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 20);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 20, cy);
      ctx.stroke();
    });

    // Inscription Header
    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#3a1f14';
    ctx.fillText('REGION I: RAMANATHAPURAM FORT & ROYAL LINEAGE (1730–1746)', 100, 514);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#6e442c';
    ctx.fillText('Palace Grounds • Rampart Bastions • Scribes\' Mandapam • Betrothal Pavilion', 100, 534);

    // 1. Rampart Walls with Crenellations (Top and Right perimeter)
    ctx.strokeStyle = '#5c3924';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(70, 40, 25, 0.12)';
    for (let bx = 100; bx < 840; bx += 24) {
      ctx.fillRect(bx, 545, 14, 8);
      ctx.strokeRect(bx, 545, 14, 8);
    }

    // 2. Corner Watchtower Bastion (x: 110, y: 760)
    ctx.save();
    ctx.fillStyle = '#3b251a';
    ctx.fillRect(95, 740, 36, 60);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(95, 740, 36, 60);
    // Conical roof
    ctx.beginPath();
    ctx.moveTo(90, 740);
    ctx.lineTo(113, 715);
    ctx.lineTo(136, 740);
    ctx.closePath();
    ctx.fillStyle = '#7a2d1d';
    ctx.fill();
    ctx.stroke();
    // Flag pennant
    ctx.strokeStyle = '#D9A441';
    ctx.beginPath();
    ctx.moveTo(113, 715);
    ctx.lineTo(113, 698);
    ctx.stroke();
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.moveTo(113, 698);
    ctx.lineTo(128, 704);
    ctx.lineTo(113, 710);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Stepped Temple Kalyani (Water Tank) (x: 230, y: 830)
    ctx.save();
    ctx.fillStyle = 'rgba(65, 102, 90, 0.35)'; // Teal water
    ctx.fillRect(205, 810, 80, 50);
    ctx.strokeStyle = '#34554a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(205, 810, 80, 50);
    ctx.strokeRect(213, 816, 64, 38);
    ctx.strokeRect(221, 822, 48, 26);
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#22382e';
    ctx.fillText('Temple Kalyani', 214, 874);
    ctx.restore();

    // 4. Scribes\' Mandapam Pavilion (Pillared Hall with Palm-leaf Archives) (x: 640, y: 555)
    ctx.save();
    ctx.fillStyle = 'rgba(46, 31, 27, 0.3)';
    ctx.fillRect(630, 560, 90, 35);
    ctx.strokeStyle = '#85512b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(630, 560, 90, 35);
    // Pillars
    for (let p = 0; p < 5; p++) {
      ctx.beginPath();
      ctx.moveTo(638 + p * 18, 560);
      ctx.lineTo(638 + p * 18, 595);
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#5c3924';
    ctx.fillText('Scribes\' Mandapam', 632, 608);
    ctx.restore();

    // 5. Archery Range Target Posts with Garland Rings (x: 460 to 560, y: 780)
    ctx.save();
    for (let t = 0; t < 3; t++) {
      const tx = 470 + t * 45;
      const ty = 785;
      // Post
      ctx.strokeStyle = '#5c3924';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty - 24);
      ctx.stroke();
      // Target Ring
      ctx.beginPath();
      ctx.arc(tx, ty - 24, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 164, 65, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#D9A441';
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#6e442c';
    ctx.fillText('Rampart Archery Range', 465, 804);
    ctx.restore();

    // 6. Betrothal Tournament Pavilion & Raised Dais (x: 770, y: 740)
    ctx.save();
    ctx.fillStyle = 'rgba(217, 164, 65, 0.2)';
    ctx.fillRect(750, 755, 95, 30);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(750, 755, 95, 30);
    // Festive Saffron Pennants
    for (let f = 0; f < 4; f++) {
      const fx = 755 + f * 26;
      ctx.fillStyle = '#B85042';
      ctx.beginPath();
      ctx.moveTo(fx, 755);
      ctx.lineTo(fx + 10, 745);
      ctx.lineTo(fx + 20, 755);
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.fillText('Betrothal Courtyard', 752, 798);
    ctx.restore();

    // 7. Sacred Banyan Grove with Aerial Prop Roots
    for (let i = 0; i < 4; i++) {
      const bx = 320 + i * 110;
      const by = 860;
      ctx.beginPath();
      ctx.arc(bx, by - 26, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 102, 85, 0.16)'; // Sage canopy wash
      ctx.fill();
      ctx.strokeStyle = '#476353';
      ctx.stroke();
      // Trunk & hanging roots
      ctx.strokeStyle = '#5c4028';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - 16);
      ctx.moveTo(bx - 10, by);
      ctx.lineTo(bx - 10, by - 12);
      ctx.moveTo(bx + 10, by);
      ctx.lineTo(bx + 10, by - 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRegion2_Virupakshi(ctx) {
    // Sivaganga council keep, agrarian canals, granaries, Western Ghats refuge
    ctx.save();
    ctx.fillStyle = 'rgba(167, 190, 174, 0.08)'; // ACCENT-SAGE wash
    ctx.fillRect(900, 380, 680, 460);
    ctx.strokeStyle = 'rgba(80, 110, 95, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(900, 380, 680, 460);

    // Decorative corner brackets
    const corners2 = [
      [900, 380, 1, 1], [1580, 380, -1, 1],
      [900, 840, 1, -1], [1580, 840, -1, -1]
    ];
    ctx.strokeStyle = '#A7BEAE';
    ctx.lineWidth = 2;
    corners2.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 20);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 20, cy);
      ctx.stroke();
    });

    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#20342a';
    ctx.fillText('REGION II: SIVAGANGA KEEP & VIRUPAKSHI HIGHLANDS (1746–1779)', 920, 414);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#4c6e60';
    ctx.fillText('Sivaganga Council Keep • Agrarian Sluices & Granaries • Western Ghats Refuge • Mysore Compact', 920, 434);

    // 1. Sivaganga Fort Council Keep Silhouette (x: 940, y: 450)
    ctx.save();
    ctx.fillStyle = '#30221c';
    ctx.fillRect(930, 460, 85, 45);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    ctx.strokeRect(930, 460, 85, 45);
    // Arched Keep Windows
    ctx.fillStyle = 'rgba(217, 164, 65, 0.5)';
    for (let w = 0; w < 3; w++) {
      const wx = 942 + w * 24;
      ctx.beginPath();
      ctx.arc(wx + 6, 474, 6, Math.PI, 0);
      ctx.rect(wx, 474, 12, 12);
      ctx.fill();
    }
    // Tiled Keep Parapet & Royal Pennant
    ctx.beginPath();
    ctx.moveTo(924, 460);
    ctx.lineTo(972, 442);
    ctx.lineTo(1020, 460);
    ctx.closePath();
    ctx.fillStyle = '#7a2215';
    ctx.fill();
    ctx.strokeStyle = '#D9A441';
    ctx.stroke();
    // Inscription
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#422416';
    ctx.fillText('Sivaganga Council Keep', 926, 518);
    ctx.restore();

    // 2. Granary Storehouses (Nellu Kalanjiyam) (x: 1060, y: 460)
    ctx.save();
    for (let g = 0; g < 2; g++) {
      const gx = 1055 + g * 35;
      ctx.beginPath();
      ctx.arc(gx + 12, 480, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 164, 65, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#85512b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Thatched conical top
      ctx.beginPath();
      ctx.moveTo(gx, 478);
      ctx.lineTo(gx + 12, 458);
      ctx.lineTo(gx + 24, 478);
      ctx.closePath();
      ctx.fillStyle = '#61432c';
      ctx.fill();
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#5c4028';
    ctx.fillText('Nellu Kalañjiyam', 1050, 510);
    ctx.restore();

    // 3. Agrarian Irrigation Canals & Green Terraced Fields (x: 990 to 1180, y: 550 to 600)
    ctx.save();
    ctx.strokeStyle = '#41665a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(980, 580);
    ctx.lineTo(1060, 580);
    ctx.lineTo(1100, 550);
    ctx.lineTo(1160, 550);
    ctx.stroke();
    // Paddy parcels
    ctx.fillStyle = 'rgba(120, 160, 90, 0.16)';
    ctx.fillRect(1000, 558, 45, 18);
    ctx.strokeRect(1000, 558, 45, 18);
    ctx.fillRect(1055, 558, 40, 18);
    ctx.strokeRect(1055, 558, 40, 18);
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#355245';
    ctx.fillText('Irrigation Sluices & Paddy', 1010, 595);
    ctx.restore();

    // 4. Western Ghats Mountain Ridges & Peaks (Refuge of Gopala Nayaker)
    ctx.strokeStyle = '#594432';
    ctx.lineWidth = 1.8;
    for (let m = 0; m < 7; m++) {
      const mx = 1180 + m * 55;
      const my = 760;
      const peakH = 45 + (m % 3) * 16;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 28, my - peakH);
      ctx.lineTo(mx + 56, my);
      ctx.fillStyle = 'rgba(100, 80, 60, 0.12)';
      ctx.fill();
      ctx.stroke();
      // Ridge hachures
      ctx.beginPath();
      ctx.moveTo(mx + 28, my - peakH);
      ctx.lineTo(mx + 34, my);
      ctx.stroke();
    }
    ctx.font = 'italic 11px "Cambria", serif';
    ctx.fillStyle = '#423223';
    ctx.fillText('~ Western Ghats & Virupakshi Highland Forests ~', 1230, 785);

    // 5. Udaiyaal Regiment Sparring Circle (x: 1360, y: 645)
    ctx.save();
    ctx.beginPath();
    ctx.arc(1380, 645, 20, 0, Math.PI * 2);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([3, 2]);
    ctx.stroke();
    // Crossed staves inside circle
    ctx.strokeStyle = '#7a2215';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(1370, 635); ctx.lineTo(1390, 655);
    ctx.moveTo(1390, 635); ctx.lineTo(1370, 655);
    ctx.stroke();
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#4c6e60';
    ctx.fillText('Udaiyaal Drill Ring', 1335, 678);
    ctx.restore();

    // 6. Mountain Defile Pass Outpost (x: 1490, y: 470)
    ctx.save();
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(1485, 460, 24, 30);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(1485, 460, 24, 30);
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#5c4028';
    ctx.fillText('Highland Defile Pass', 1455, 505);
    ctx.restore();

    ctx.restore();
  }

  drawRegion3_Dindigul(ctx) {
    // Allied rock fort court, cantonment stores, shadow routes
    ctx.save();
    ctx.fillStyle = 'rgba(217, 164, 65, 0.08)'; // ACCENT-GOLD wash
    ctx.fillRect(1620, 480, 660, 420);
    ctx.strokeStyle = 'rgba(160, 115, 35, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1620, 480, 660, 420);

    // Decorative corner brackets
    const corners3 = [
      [1620, 480, 1, 1], [2280, 480, -1, 1],
      [1620, 900, 1, -1], [2280, 900, -1, -1]
    ];
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    corners3.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 20);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 20, cy);
      ctx.stroke();
    });

    ctx.font = 'bold 15px "Cambria", serif';
    ctx.fillStyle = '#423214';
    ctx.fillText('REGION III: DINDIGUL ROCK & THE MADURAI HIGHWAYS (1779–1780)', 1640, 514);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#785b24';
    ctx.fillText('Monolithic Rock Fortress • Mysore Cantonments • Tampered Crossroads • Navaratri Sanctuary', 1640, 534);

    // 1. Dindigul Rock Fort Monolith (Massive granite dome with battlements)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(1640, 780);
    ctx.bezierCurveTo(1660, 660, 1740, 640, 1780, 780);
    ctx.closePath();
    ctx.fillStyle = 'rgba(110, 85, 60, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#614833';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Fort battlements on top of rock dome
    for (let c = 1690; c <= 1730; c += 10) {
      ctx.strokeRect(c, 650, 6, 6);
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#423214';
    ctx.fillText('Dindigul Rock Fort', 1675, 796);
    ctx.restore();

    // 2. Mysore Allied Cavalry Cantonment Tents (x: 1720, y: 810)
    ctx.save();
    for (let t = 0; t < 3; t++) {
      const tx = 1715 + t * 34;
      const ty = 845;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 12, ty - 22);
      ctx.lineTo(tx + 24, ty);
      ctx.closePath();
      ctx.fillStyle = 'rgba(217, 164, 65, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#85512b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Flag
      ctx.beginPath();
      ctx.moveTo(tx + 12, ty - 22);
      ctx.lineTo(tx + 12, ty - 28);
      ctx.lineTo(tx + 18, ty - 25);
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#614833';
    ctx.fillText('Mysore Allied Encampment', 1715, 862);
    ctx.restore();

    // 3. Colonial Sentry Lantern Line & Roadside Posts (x: 1840 to 1910, y: 550)
    ctx.save();
    for (let l = 0; l < 2; l++) {
      const lx = 1860 + l * 40;
      ctx.strokeStyle = '#4a2817';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx, 570); ctx.lineTo(lx, 545); ctx.stroke();
      // Lantern
      ctx.fillStyle = '#D9A441';
      ctx.fillRect(lx - 4, 545, 8, 10);
      ctx.strokeRect(lx - 4, 545, 8, 10);
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#785b24';
    ctx.fillText('Sentry Lanterns', 1850, 586);
    ctx.restore();

    // 4. Carved Granite Waymarker at Crossroads (x: 2040, y: 670)
    ctx.save();
    ctx.fillStyle = '#42281a';
    ctx.fillRect(2035, 660, 10, 32);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(2035, 660, 10, 32);
    // Crossroads arms
    ctx.fillStyle = '#7a2215';
    ctx.fillRect(2025, 666, 30, 6);
    ctx.strokeRect(2025, 666, 30, 6);
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#423214';
    ctx.fillText('Crossroads Waymarker', 2005, 706);
    ctx.restore();

    // 5. Rajarajeshwari Temple Gopuram & Navaratri Gate (x: 2180, y: 640)
    ctx.save();
    // Stepped Gopuram Pyramid
    ctx.fillStyle = 'rgba(184, 80, 66, 0.25)';
    ctx.fillRect(2170, 660, 48, 16);
    ctx.strokeRect(2170, 660, 48, 16);
    ctx.fillRect(2176, 646, 36, 14);
    ctx.strokeRect(2176, 646, 36, 14);
    ctx.fillRect(2182, 634, 24, 12);
    ctx.strokeRect(2182, 634, 24, 12);
    // Kalasam Finials
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.5;
    for (let k = 2186; k <= 2202; k += 8) {
      ctx.beginPath();
      ctx.moveTo(k, 634);
      ctx.lineTo(k, 626);
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.fillText('Rajarajeshwari Temple Gate', 2135, 690);
    ctx.restore();

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

    // Decorative corner brackets
    const corners4 = [
      [1580, 160, 1, 1], [2500, 160, -1, 1],
      [1580, 460, 1, -1], [2500, 460, -1, -1]
    ];
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2;
    corners4.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 20);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 20, cy);
      ctx.stroke();
    });

    ctx.font = 'bold 16px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.fillText('REGION IV: THE RECLAMATION OF SIVAGANGA (1780)', 1610, 198);
    ctx.font = 'italic 12px "Cambria", serif';
    ctx.fillStyle = '#9c3d2f';
    ctx.fillText('The Liberated Kingdom & Sovereign Coronation of Rani Velu Nachiyar', 1610, 218);

    // 1. Breached Southern Ramparts & Signal Beacons (x: 2320, y: 410)
    ctx.save();
    ctx.fillStyle = '#42281a';
    ctx.fillRect(2310, 420, 75, 20);
    ctx.strokeStyle = '#B85042';
    ctx.strokeRect(2310, 420, 75, 20);
    // Rope ladder
    ctx.strokeStyle = '#D9A441';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(2340, 420); ctx.lineTo(2340, 448); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2348, 420); ctx.lineTo(2348, 448); ctx.stroke();
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.fillText('Southern Breach', 2315, 458);
    ctx.restore();

    // 2. Moat Sluice Gate Aqueducts & Granite Wheel (x: 2220, y: 320)
    ctx.save();
    ctx.beginPath();
    ctx.arc(2245, 340, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#41665a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2233, 340); ctx.lineTo(2257, 340);
    ctx.moveTo(2245, 328); ctx.lineTo(2245, 352);
    ctx.stroke();
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#355245';
    ctx.fillText('Subterranean Sluice', 2210, 366);
    ctx.restore();

    // 3. Powder Magazine Vault Shrine (Solemn Radiant Ember Tribute to Kuyili)
    ctx.save();
    ctx.fillStyle = '#2b1914';
    ctx.fillRect(2025, 275, 36, 26);
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(2025, 275, 36, 26);
    // Radiant quiet ember glow
    ctx.beginPath();
    ctx.arc(2043, 288, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#D9A441';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#7a2215';
    ctx.shadowBlur = 0;
    ctx.fillText('Sacred Magazine Shrine', 1995, 314);
    ctx.restore();

    // 4. Inner Palace Throne Mandapam (x: 1800, y: 300)
    ctx.save();
    ctx.fillStyle = 'rgba(46, 31, 27, 0.4)';
    ctx.fillRect(1790, 315, 90, 30);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(1790, 315, 90, 30);
    // Pillars
    for (let p = 0; p < 5; p++) {
      ctx.beginPath();
      ctx.moveTo(1798 + p * 18, 315);
      ctx.lineTo(1798 + p * 18, 345);
      ctx.stroke();
    }
    ctx.font = 'italic 10px "Cambria", serif';
    ctx.fillStyle = '#422416';
    ctx.fillText('Palace Throne Mandapam', 1785, 358);
    ctx.restore();

    // 5. The Royal Golden Umbrella (Venkotrakudai) & Sovereign Dais (x: 1620, y: 235)
    ctx.save();
    // Umbrella canopy
    ctx.beginPath();
    ctx.arc(1620, 245, 22, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = '#D9A441';
    ctx.shadowColor = '#D9A441';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pearl fringe drapes
    for (let pr = 1602; pr <= 1638; pr += 6) {
      ctx.beginPath();
      ctx.arc(pr, 248, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    // Umbrella gold shaft
    ctx.strokeStyle = '#D9A441';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(1620, 245);
    ctx.lineTo(1620, 275);
    ctx.stroke();
    // Sovereign Throne Platform
    ctx.fillStyle = '#7a2215';
    ctx.fillRect(1600, 275, 40, 10);
    ctx.strokeStyle = '#D9A441';
    ctx.strokeRect(1600, 275, 40, 10);
    ctx.font = 'bold 11px "Cambria", serif';
    ctx.fillStyle = '#D9A441';
    ctx.shadowBlur = 0;
    ctx.fillText('Royal Coronation Dais', 1575, 298);
    ctx.restore();

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

    // Prominent golden pedagogical arcs connecting unlocked/completed levels across the campaign
    const bridges = [
      { from: 0, to: 1, label: '~ Royal Martial Grounds ~', minUnlocked: 2, curveOffset: -24 },
      { from: 1, to: 2, label: '~ Rampart Bastion Track ~', minUnlocked: 3, curveOffset: 24 },
      { from: 2, to: 3, label: '~ Scribes\' Mandapam Path ~', minUnlocked: 4, curveOffset: -24 },
      { from: 3, to: 4, label: '~ Ceremonial Courtyard Procession ~', minUnlocked: 5, curveOffset: 24 },
      { from: 4, to: 5, label: '~ Western Ghats Highway to Sivaganga ~', minUnlocked: 6, curveOffset: -28 },
      { from: 5, to: 6, label: '~ Virupakshi Highland Trail ~', minUnlocked: 7, curveOffset: 24 },
      { from: 6, to: 7, label: '~ Dindigul Diplomatic Road ~', minUnlocked: 8, curveOffset: -24 },
      { from: 7, to: 8, label: '~ Udaiyaal Regiment Camp ~', minUnlocked: 9, curveOffset: 24 },
      { from: 8, to: 9, label: '~ Highland Mountain Defile ~', minUnlocked: 10, curveOffset: -24 },
      { from: 9, to: 10, label: '~ Reconnaissance Valley Track ~', minUnlocked: 11, curveOffset: 28 },
      { from: 10, to: 11, label: '~ Sentry Lantern Line ~', minUnlocked: 12, curveOffset: -24 },
      { from: 11, to: 12, label: '~ Cantonment Ledger Route ~', minUnlocked: 13, curveOffset: 24 },
      { from: 12, to: 13, label: '~ Tampered Crossroads Avenue ~', minUnlocked: 14, curveOffset: -24 },
      { from: 13, to: 14, label: '~ Navaratri Devotee Way ~', minUnlocked: 15, curveOffset: 24 },
      { from: 14, to: 15, label: '~ Rampart Scaling Breach ~', minUnlocked: 16, curveOffset: -28 },
      { from: 15, to: 16, label: '~ Moat Sluice Aqueduct ~', minUnlocked: 17, curveOffset: 24 },
      { from: 16, to: 17, label: '~ Sacred Temple Magazine ~', minUnlocked: 18, curveOffset: -24 },
      { from: 17, to: 18, label: '~ Palace Courtyard Approach ~', minUnlocked: 19, curveOffset: 24 },
      { from: 18, to: 19, label: '~ Royal Coronation Ascent ~', minUnlocked: 20, curveOffset: -24 }
    ];

    bridges.forEach(b => {
      const na = this.nodes[b.from];
      const nb = this.nodes[b.to];
      if (!na || !nb) return;
      const isAchieved = this.completedLevels.includes(nb.id) || this.unlockedLevel >= b.minUnlocked;
      if (!isAchieved) return;

      ctx.save();
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      ctx.shadowColor = '#D9A441';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      const midX = (na.x + nb.x) / 2;
      const midY = (na.y + nb.y) / 2 + b.curveOffset;
      ctx.quadraticCurveTo(midX, midY, nb.x, nb.y);
      ctx.stroke();

      // Label
      ctx.font = 'bold 11px "Cambria", serif';
      ctx.fillStyle = '#4a2817';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(b.label, midX, midY + (b.curveOffset < 0 ? -6 : 16));
      ctx.restore();
    });

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
    const cw = 460;
    const ch = 195;

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
    ctx.fillText('THE CHRONICLE OF SIVAGANGA', cx + cw / 2, cy + 38);

    ctx.font = 'italic 13px "Cambria", serif';
    ctx.fillStyle = '#eeddcc';
    ctx.fillText('A Fortified Regional Survey of Rani Velu Nachiyar\'s Life & Campaign', cx + cw / 2, cy + 64);
    ctx.fillText('(1730 – 1780)', cx + cw / 2, cy + 84);

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '12px "Cambria", serif';
    ctx.fillStyle = '#A7BEAE';
    ctx.fillText('• Full Icon: Accomplished Historical Trial', cx + 30, cy + 120);
    ctx.fillStyle = '#D9A441';
    ctx.fillText('• Radiant Amber: Current Vanguard Position', cx + 30, cy + 140);
    ctx.fillStyle = '#8c766a';
    ctx.fillText('• Faint Sketch: Unreached Fortress Domain', cx + 30, cy + 160);
    ctx.fillStyle = '#ebd076';
    ctx.fillText('• Golden Bridge: Conquered Highway of the Realm', cx + 30, cy + 180);

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
      
      const mechTag = document.getElementById('plaque-mechanic-tag');
      if (mechTag) {
        const levelDef = window.sivagangaLevels?.find(l => l.id === node.id);
        const mechText = node.mechanic || levelDef?.mechanicName || '';
        mechTag.textContent = mechText ? `[ ${mechText} ]` : '';
        mechTag.style.display = mechText ? 'inline-block' : 'none';
      }

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
      case 'horse_bow':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><path d="M11 8 C21 14 21 26 11 32" fill="none" stroke="${stroke}" stroke-width="2.2" ${dash}/><line x1="11" y1="8" x2="11" y2="32" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="2,1"/><line x1="8" y1="20" x2="28" y2="20" stroke="${stroke}" stroke-width="2"/><polygon points="28,20 23,17 24,20 23,23" fill="${stroke}"/><circle cx="27" cy="20" r="7" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="3,2"/></svg>`;
      case 'palm_leaf_scroll':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="8" y="11" width="24" height="5" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash}/><rect x="8" y="18" width="24" height="5" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash}/><rect x="8" y="25" width="24" height="5" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash}/><line x1="16" y1="9" x2="16" y2="32" stroke="${stroke}" stroke-width="1.8"/><circle cx="20" cy="20" r="3.5" fill="${stroke}"/></svg>`;
      case 'betrothal_garland':
        return `<svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="13" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/><path d="M12 12 Q 20 6 28 12 Q 32 20 28 28 Q 20 34 12 28 Z" fill="none" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3,2"/><circle cx="20" cy="11" r="2.5" fill="${stroke}"/><circle cx="27" cy="18" r="2.5" fill="${stroke}"/><circle cx="20" cy="27" r="2.5" fill="${stroke}"/><circle cx="13" cy="18" r="2.5" fill="${stroke}"/><circle cx="20" cy="19" r="4.5" fill="${stroke}"/></svg>`;
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
      case 'council_table':
        // Level 6: Teakwood Council Table with Grain Basket, Gold Coins, and Loyalty Garland
        return `<svg viewBox="0 0 40 40" width="36" height="36"><rect x="6" y="24" width="28" height="5" rx="1" fill="${fill}" stroke="${stroke}" stroke-width="1.8" ${dash}/><line x1="10" y1="29" x2="8" y2="35" stroke="${stroke}" stroke-width="2"/><line x1="30" y1="29" x2="32" y2="35" stroke="${stroke}" stroke-width="2"/><path d="M9 16 Q 14 13 19 16 L 17 24 Q 14 25 11 24 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash}/><rect x="23" y="19" width="8" height="2" rx="1" fill="${stroke}"/><rect x="23" y="16" width="8" height="2" rx="1" fill="${stroke}"/><rect x="23" y="13" width="8" height="2" rx="1" fill="${stroke}"/><path d="M12 24 Q 20 20 28 24" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-dasharray="2,2"/><circle cx="15" cy="22" r="1.5" fill="${stroke}"/><circle cx="20" cy="21" r="1.5" fill="${stroke}"/><circle cx="25" cy="22" r="1.5" fill="${stroke}"/></svg>`;
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
