/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - SAVE MANAGER & DETERMINISTIC QA SEED
 * Technical Robustness Contract: Versioned v1.0.0 schema, clamp guards, graceful defaults.
 */

const SAVE_KEY = 'sivaganga_queens_gambit_v1';
const SCHEMA_VERSION = '1.0.0';

class SivagangaSaveManager {
  constructor() {
    this.defaultState = {
      version: SCHEMA_VERSION,
      currentLevel: 1,
      unlockedLevel: 2,
      completedLevels: [],
      levelStats: {},
      resources: {
        morale: 100, // 0 - 100 (Diya flame height)
        trust: 3,    // 0 - 5 (Wrist bangles)
        intel: 3,    // 0 - 10 (Garland beads)
        gold: 150,   // 0 - 9999
        grain: 300,  // 0 - 9999
        alliances: [false, false, false, false] // [Virupakshi, Mysore/Hyder Ali, Maruthu Brothers, Udaiyaal Regiment]
      },
      settings: {
        interfaceSpeed: 'default', // 'slow', 'default', 'fast'
        textSpeed: 'normal',       // 'slow', 'normal', 'instant'
        subtitleSize: 'medium',    // 'medium', 'large'
        reduceMotion: false,
        soundVolume: 0.8,
        isMuted: false,
        qaDeterministicSeed: false,
        qaSeedVal: 1780
      },
      companionState: {
        kuyiliPresent: false,
        vellachiProtected: true,
        maruthuReady: false
      }
    };

    this.state = this.load();
    this.initPRNG();
  }

  /**
   * Safe clamp utility to ensure resources never become negative or overflow.
   */
  static clamp(val, min, max) {
    if (typeof val !== 'number' || isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Load and validate save state against the versioned schema.
   */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(this.defaultState));
      const parsed = JSON.parse(raw);
      return this.migrateAndSanitize(parsed);
    } catch (err) {
      console.warn('SivagangaSaveManager: Failed to parse save, restoring defaults gracefully', err);
      return JSON.parse(JSON.stringify(this.defaultState));
    }
  }

  /**
   * Migrates older schemas and injects missing fields without crashing.
   */
  migrateAndSanitize(data) {
    const fresh = JSON.parse(JSON.stringify(this.defaultState));
    if (!data || typeof data !== 'object') return fresh;

    // Core progression (Level 2 is immediately accessible for demonstration)
    fresh.currentLevel = SivagangaSaveManager.clamp(data.currentLevel || 1, 1, 20);
    fresh.unlockedLevel = Math.max(2, SivagangaSaveManager.clamp(data.unlockedLevel || 2, 1, 20));
    fresh.completedLevels = Array.isArray(data.completedLevels) ? data.completedLevels : [];
    fresh.levelStats = (data.levelStats && typeof data.levelStats === 'object') ? data.levelStats : {};

    // Auto-heal progression: if a level was completed, the subsequent level must be unlocked
    if (fresh.completedLevels.includes(3)) {
      fresh.unlockedLevel = Math.max(fresh.unlockedLevel, 4);
    } else if (fresh.completedLevels.includes(2)) {
      fresh.unlockedLevel = Math.max(fresh.unlockedLevel, 3);
    }

    // Resources clamping
    if (data.resources) {
      fresh.resources.morale = SivagangaSaveManager.clamp(data.resources.morale, 0, 100);
      fresh.resources.trust = SivagangaSaveManager.clamp(data.resources.trust, 0, 5);
      fresh.resources.intel = SivagangaSaveManager.clamp(data.resources.intel, 0, 10);
      fresh.resources.gold = SivagangaSaveManager.clamp(data.resources.gold, 0, 9999);
      fresh.resources.grain = SivagangaSaveManager.clamp(data.resources.grain, 0, 9999);
      if (Array.isArray(data.resources.alliances) && data.resources.alliances.length === 4) {
        fresh.resources.alliances = data.resources.alliances.map(Boolean);
      }
    }

    // Settings
    if (data.settings) {
      fresh.settings.interfaceSpeed = ['slow', 'default', 'fast'].includes(data.settings.interfaceSpeed) ? data.settings.interfaceSpeed : 'default';
      fresh.settings.textSpeed = ['slow', 'normal', 'instant'].includes(data.settings.textSpeed) ? data.settings.textSpeed : 'normal';
      fresh.settings.subtitleSize = ['medium', 'large'].includes(data.settings.subtitleSize) ? data.settings.subtitleSize : 'medium';
      fresh.settings.reduceMotion = Boolean(data.settings.reduceMotion);
      fresh.settings.soundVolume = SivagangaSaveManager.clamp(data.settings.soundVolume, 0, 1);
      fresh.settings.isMuted = Boolean(data.settings.isMuted);
      fresh.settings.qaDeterministicSeed = Boolean(data.settings.qaDeterministicSeed);
      fresh.settings.qaSeedVal = typeof data.settings.qaSeedVal === 'number' ? data.settings.qaSeedVal : 1780;
    }

    // Companion State
    if (data.companionState) {
      fresh.companionState.kuyiliPresent = Boolean(data.companionState.kuyiliPresent);
      fresh.companionState.vellachiProtected = Boolean(data.companionState.vellachiProtected);
      fresh.companionState.maruthuReady = Boolean(data.companionState.maruthuReady);
    }

    return fresh;
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      return true;
    } catch (e) {
      console.error('SivagangaSaveManager: Failed to write to localStorage', e);
      return false;
    }
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    return this.save();
  }

  // --- Resource Modifiers (Safe & Clamped) ---
  modifyMorale(delta) {
    this.state.resources.morale = SivagangaSaveManager.clamp(this.state.resources.morale + delta, 0, 100);
    this.save();
    return this.state.resources.morale;
  }

  modifyTrust(delta) {
    this.state.resources.trust = SivagangaSaveManager.clamp(this.state.resources.trust + delta, 0, 5);
    this.save();
    return this.state.resources.trust;
  }

  modifyIntel(delta) {
    this.state.resources.intel = SivagangaSaveManager.clamp(this.state.resources.intel + delta, 0, 10);
    this.save();
    return this.state.resources.intel;
  }

  setAlliance(index, status = true, isReplay = false) {
    // Non-canonical replays do not alter established alliance states
    if (isReplay) return;
    if (index >= 0 && index < 4) {
      this.state.resources.alliances[index] = Boolean(status);
      this.save();
    }
  }

  recordLevelVictory(lvlNumber, stats = {}, isReplay = false) {
    this.unlockLevel(lvlNumber + 1);
    return this.recordLevelComplete(lvlNumber, stats, isReplay);
  }

  recordLevelComplete(lvlNumber, stats = {}, isReplay = false) {
    // If this is a replay of Level 8 or Level 18, preserve canonical state
    if (isReplay && (lvlNumber === 8 || lvlNumber === 18)) {
      return true;
    }

    if (!this.state.completedLevels.includes(lvlNumber)) {
      this.state.completedLevels.push(lvlNumber);
    }
    this.state.levelStats[lvlNumber] = stats;
    if (lvlNumber + 1 > this.state.unlockedLevel && lvlNumber <= 20) {
      this.state.unlockedLevel = Math.min(20, lvlNumber + 1);
    }
    return this.save();
  }

  isLevelUnlocked(lvlNumber) {
    if (lvlNumber === 1 || lvlNumber === 2) return true;
    return this.state.completedLevels.includes(lvlNumber) || lvlNumber <= (this.state.unlockedLevel || 1);
  }

  unlockLevel(lvlNumber) {
    if (lvlNumber > (this.state.unlockedLevel || 1)) {
      this.state.unlockedLevel = Math.min(20, lvlNumber);
      this.save();
    }
  }

  recordChronicleNode(nodeId) {
    if (!this.state.completedLevels.includes(nodeId)) {
      this.state.completedLevels.push(nodeId);
    }
    if (nodeId + 1 > (this.state.unlockedLevel || 1) && nodeId < 20) {
      this.state.unlockedLevel = nodeId + 1;
    }
    this.save();
  }

  isLevelCompleted(lvlNumber) {
    return this.state.completedLevels.includes(lvlNumber);
  }

  // --- Reproducible Deterministic PRNG for QA Testing ---
  initPRNG() {
    this.seed = this.state.settings.qaSeedVal || 1780;
  }

  setQASeed(seedVal) {
    this.seed = seedVal;
    this.state.settings.qaSeedVal = seedVal;
    this.save();
  }

  /**
   * Returns a float in [0, 1) using Mulberry32 PRNG when QA mode is on, or Math.random() in normal play.
   */
  random() {
    if (!this.state.settings.qaDeterministicSeed) {
      return Math.random();
    }
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random integer in [min, max] inclusive
   */
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

// Global save manager singleton
window.sivagangaSave = new SivagangaSaveManager();
