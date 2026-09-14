/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - SETTINGS & ACCESSIBILITY (PALM-LEAF MANUSCRIPT)
 * Configures Interface Response Speed, Reduce Motion, Dual-Code Shape Accessibility, QA Seed, and Audio.
 */

class SivagangaSettings {
  constructor() {
    this.modal = null;
    this.isOpen = false;
  }

  init() {
    this.modal = document.getElementById('settings-modal');
    this.bindInputs();
    this.applyAllSettings();
  }

  open() {
    if (!this.modal) return;
    this.syncInputsFromState();
    this.modal.classList.add('active');
    this.isOpen = true;
    window.sivagangaAudio.playPalmLeafScroll();
  }

  close(skipFlow = false) {
    if (!skipFlow && window.sivagangaFlow && (window.sivagangaFlow.state === 'HOME_SETTINGS' || window.sivagangaFlow.state === 'LEVEL_PAUSE_SETTINGS')) {
      window.sivagangaFlow.transition('CLOSE_SETTINGS');
      return;
    }
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.isOpen = false;
    window.sivagangaAudio.playPalmLeafScroll();
  }

  bindInputs() {
    const speedSelect = document.getElementById('setting-interface-speed');
    const textSpeedSelect = document.getElementById('setting-text-speed');
    const subtitleSizeSelect = document.getElementById('setting-subtitle-size');
    const motionToggle = document.getElementById('setting-reduce-motion');
    const volumeSlider = document.getElementById('setting-volume');
    const muteToggle = document.getElementById('setting-mute');
    const qaSeedToggle = document.getElementById('setting-qa-seed');
    const qaSeedInput = document.getElementById('setting-qa-val');
    const closeBtn = document.getElementById('settings-close-btn');
    const resetBtn = document.getElementById('settings-reset-save-btn');

    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.interfaceSpeed = e.target.value;
        window.sivagangaSave.save();
        window.sivagangaInteraction.applySpeedScale(e.target.value);
      });
    }

    if (textSpeedSelect) {
      textSpeedSelect.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.textSpeed = e.target.value;
        window.sivagangaSave.save();
      });
    }

    if (subtitleSizeSelect) {
      subtitleSizeSelect.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.subtitleSize = e.target.value;
        window.sivagangaSave.save();
        this.applySubtitleSize(e.target.value);
      });
    }

    if (motionToggle) {
      motionToggle.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.reduceMotion = e.target.checked;
        window.sivagangaSave.save();
        this.applyReduceMotion(e.target.checked);
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.sivagangaSave.state.settings.soundVolume = val;
        window.sivagangaSave.save();
        window.sivagangaAudio.setMasterVolume(val);
      });
    }

    if (muteToggle) {
      muteToggle.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.isMuted = e.target.checked;
        window.sivagangaSave.save();
        window.sivagangaAudio.setMute(e.target.checked);
      });
    }

    if (qaSeedToggle) {
      qaSeedToggle.addEventListener('change', (e) => {
        window.sivagangaSave.state.settings.qaDeterministicSeed = e.target.checked;
        window.sivagangaSave.save();
        if (qaSeedInput) qaSeedInput.disabled = !e.target.checked;
      });
    }

    if (qaSeedInput) {
      qaSeedInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 1780;
        window.sivagangaSave.setQASeed(val);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset chronicle campaign back to Kalaiyar Kovil (1772)? All unlocked levels and alliances will be reset.')) {
          window.sivagangaSave.reset();
          this.syncInputsFromState();
          this.applyAllSettings();
          window.sivagangaHUD.updateAll(window.sivagangaSave.state.resources);
          if (window.sivagangaChronicle) window.sivagangaChronicle.renderNodes();
          alert('Chronicle has been reset.');
        }
      });
    }
  }

  syncInputsFromState() {
    const s = window.sivagangaSave.state.settings;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setChecked = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(val);
    };

    setVal('setting-interface-speed', s.interfaceSpeed);
    setVal('setting-text-speed', s.textSpeed);
    setVal('setting-subtitle-size', s.subtitleSize);
    setChecked('setting-reduce-motion', s.reduceMotion);
    setVal('setting-volume', s.soundVolume);
    setChecked('setting-mute', s.isMuted);
    setChecked('setting-qa-seed', s.qaDeterministicSeed);
    setVal('setting-qa-val', s.qaSeedVal);

    const qaSeedInput = document.getElementById('setting-qa-val');
    if (qaSeedInput) qaSeedInput.disabled = !s.qaDeterministicSeed;
  }

  applyAllSettings() {
    const s = window.sivagangaSave.state.settings;
    window.sivagangaInteraction.applySpeedScale(s.interfaceSpeed);
    this.applySubtitleSize(s.subtitleSize);
    this.applyReduceMotion(s.reduceMotion);
    window.sivagangaAudio.setMasterVolume(s.soundVolume);
    window.sivagangaAudio.setMute(s.isMuted);
  }

  applySubtitleSize(size) {
    document.documentElement.style.fontSize = size === 'large' ? '18px' : '16px';
  }

  applyReduceMotion(reduce) {
    if (reduce) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }
}

// Global settings singleton
window.sivagangaSettings = new SivagangaSettings();
