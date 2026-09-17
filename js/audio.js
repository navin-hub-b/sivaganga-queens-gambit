/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - PROCEDURAL AUDIO ENGINE
 * Synthesizes 100% of audio via Web Audio API (zero external assets/broken links).
 * Temple bells, bronze chimes, tanpura drone, bamboo strikes, and flame rustles.
 */

class SivagangaAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.droneGain = null;
    this.droneOscillators = [];
    this.isDroneActive = false;
    this.speedMultiplier = 1.0;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (!this.masterGain) return;
    const clamped = Math.max(0, Math.min(1, val));
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.ctx?.currentTime || 0);
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  setSpeedScale(scale) {
    this.speedMultiplier = scale || 1.0;
  }

  /**
   * Focused Chime (100-150ms gentle bronze ping, never a loud "game show" ding)
   */
  playFocusPing() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Gentle warm bronze resonance (587.33 Hz - D5)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t);

    // Soft envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.03 * this.speedMultiplier);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14 * this.speedMultiplier);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15 * this.speedMultiplier);
  }

  /**
   * Resolved Chime (Rich resonant temple bell with golden harmonic decay ~800ms)
   */
  playResolveBell() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Multi-frequency bell harmonics: Root, minor third, octave, fifth
    const harmonics = [440, 523.25, 880, 1318.5];
    const amplitudes = [0.22, 0.14, 0.08, 0.04];

    harmonics.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amplitudes[idx], t + 0.015);
      // Long warm resonant decay
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (0.7 + idx * 0.1) * this.speedMultiplier);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.9 * this.speedMultiplier);
    });
  }

  /**
   * Failed action (Graceful, quiet descending tone fading over ~400ms, NO harsh buzz)
   */
  playQuietFade() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.35 * this.speedMultiplier);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38 * this.speedMultiplier);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.4 * this.speedMultiplier);
  }

  /**
   * Temple Bell Swing & Strike (Deep brass temple bell)
   */
  playTempleBell() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const freqs = [293.66, 587.33, 880]; // D4, D5, A5
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18 / (i + 1), t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2 * this.speedMultiplier);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 1.3 * this.speedMultiplier);
    });
  }

  /**
   * Palm-leaf Scroll Wipe Rustle / Unroll
   */
  playPalmLeafScroll() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35 * this.speedMultiplier;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.25 * this.speedMultiplier);
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32 * this.speedMultiplier);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Bamboo strike / Stealth Pebble Disarm
   */
  playPebblePlink() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(740, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Ambient Tanpura Drone (Subtle background meditative drone)
   */
  startTanpuraDrone() {
    this.ensureContext();
    if (!this.ctx || this.isDroneActive) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    // Pa-Sa roots (G2: 98Hz, C3: 130.81Hz)
    const baseFreqs = [98.0, 130.81, 196.0];
    this.droneOscillators = baseFreqs.map(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      osc.connect(this.droneGain);
      osc.start();
      return osc;
    });

    this.isDroneActive = true;
  }

  stopTanpuraDrone() {
    if (!this.isDroneActive) return;
    this.droneOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.droneOscillators = [];
    this.isDroneActive = false;
  }

  /**
   * Traditional Murasu / Urumi / Thavil Fort Drum Beat (Rich, punchy procedural acoustic drumhead)
   * Engineered with multi-harmonic layers: deep resonant body + wooden shell overtone + crisp stick slap.
   */
  playMurasuDrumBeat(isAccent = false) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Layer 1: Low-Frequency Drumhead Membrane Punch (Deep chest resonance)
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    const startFreq = isAccent ? 175 : 145;
    const endFreq = isAccent ? 62 : 52;
    oscLow.type = 'sine';
    oscLow.frequency.setValueAtTime(startFreq, t);
    oscLow.frequency.exponentialRampToValueAtTime(endFreq, t + 0.22 * this.speedMultiplier);

    const peakLow = isAccent ? 0.95 : 0.78;
    gainLow.gain.setValueAtTime(0.001, t);
    gainLow.gain.linearRampToValueAtTime(peakLow, t + 0.006);
    gainLow.gain.exponentialRampToValueAtTime(0.0001, t + 0.32 * this.speedMultiplier);

    oscLow.connect(gainLow);
    gainLow.connect(this.masterGain);
    oscLow.start(t);
    oscLow.stop(t + 0.35 * this.speedMultiplier);

    // Layer 2: Resonant Wooden Shell & Goatskin Harmonic (Audible on laptop/mobile speakers)
    const oscMid = this.ctx.createOscillator();
    const gainMid = this.ctx.createGain();
    oscMid.type = 'triangle';
    oscMid.frequency.setValueAtTime(isAccent ? 270 : 210, t);
    oscMid.frequency.exponentialRampToValueAtTime(isAccent ? 95 : 75, t + 0.16 * this.speedMultiplier);

    const peakMid = isAccent ? 0.65 : 0.48;
    gainMid.gain.setValueAtTime(0.001, t);
    gainMid.gain.linearRampToValueAtTime(peakMid, t + 0.005);
    gainMid.gain.exponentialRampToValueAtTime(0.0001, t + 0.24 * this.speedMultiplier);

    oscMid.connect(gainMid);
    gainMid.connect(this.masterGain);
    oscMid.start(t);
    oscMid.stop(t + 0.26 * this.speedMultiplier);

    // Layer 3: Drumhead Stick Slap & Rattan Transient (Sharp physical attack)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(isAccent ? 540 : 420, t);
    snapOsc.frequency.exponentialRampToValueAtTime(110, t + 0.05);

    const peakSnap = isAccent ? 0.48 : 0.34;
    snapGain.gain.setValueAtTime(0.001, t);
    snapGain.gain.linearRampToValueAtTime(peakSnap, t + 0.003);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(t);
    snapOsc.stop(t + 0.065);
  }

  /**
   * Silambam Staff Strike / Parry Clang (Crisp, loud bamboo & rattan impact)
   */
  playSilambamClang() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const freqs = [920, 1480, 2350];
    const amplitudes = [0.65, 0.45, 0.25];

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.14 * this.speedMultiplier);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amplitudes[idx], t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (0.16 + idx * 0.03) * this.speedMultiplier);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2 * this.speedMultiplier);
    });
  }

  /**
   * Valari Aerodynamic Sickle Whistle (Crisp spinning crescent flight through air)
   */
  playValariWhistle() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.linearRampToValueAtTime(1050, t + 0.16 * this.speedMultiplier);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.36 * this.speedMultiplier);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.48, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38 * this.speedMultiplier);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.40 * this.speedMultiplier);
  }

  /**
   * Soft Light-Flare / Harmonious Resolve Chime (Ascending golden harmonic flourish)
   */
  playSoftLightFlare() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.045 * this.speedMultiplier;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.08 / (idx * 0.4 + 1), noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35 * this.speedMultiplier);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38 * this.speedMultiplier);
    });
  }

  /**
   * Equestrian Hoofbeat (Dual impact canter rhythm on sun-baked fort earth)
   */
  playHoofbeat(intensity = 0.5) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const vol = Math.max(0.05, Math.min(0.25, 0.12 * intensity));

    // Two-beat impact (foreleg then hindleg ground contact ~80ms apart)
    [0, 0.08].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 85 : 70, t + offset);
      osc.frequency.exponentialRampToValueAtTime(35, t + offset + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, t + offset);

      gain.gain.setValueAtTime(0.001, t + offset);
      gain.gain.linearRampToValueAtTime(vol * (idx === 0 ? 1.0 : 0.8), t + offset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.065);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.07);
    });
  }

  /**
   * Bowstring Draw Tension (Subtle wood creak & string stretch)
   */
  playBowstringDraw(chargeRatio = 0.5) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + chargeRatio * 80, t);
    osc.frequency.linearRampToValueAtTime(220 + chargeRatio * 120, t + 0.08);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.10);
  }

  /**
   * Arrow Release & Flight (High-speed string twang & aerodynamic whoosh)
   */
  playArrowRelease() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. String snap twang
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.09);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.11);

    // 2. Flight whoosh (White noise band-pass sweep)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.16);
      filter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.09, t + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.18);
    } catch (e) {}
  }

  /**
   * Garland Ring Impact Snap (Target post thud + crisp floral burst chime)
   */
  playGarlandSnap(isGoldHit = true) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Wooden post target thud
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(180, t);
    thud.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    thudGain.gain.setValueAtTime(0.18, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t);
    thud.stop(t + 0.10);

    // Golden floral harmonic sparkle (Jasmine & Marigold bell ping)
    const bellFreq = isGoldHit ? 880 : 660;
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(bellFreq, t);

    bellGain.gain.setValueAtTime(0.001, t);
    bellGain.gain.linearRampToValueAtTime(0.15, t + 0.015);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(t);
    bell.stop(t + 0.30);
  }

  /**
   * Royal Ceremonial Fanfare (Celebratory pentatonic temple chime flourish for royal betrothal & alliances)
   */
  playCeremonialFanfare() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Pentatonic royal raga celebration notes: C5, D5, E5, G5, A5, C6
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const delays = [0, 0.08, 0.16, 0.24, 0.34, 0.46];

    notes.forEach((freq, idx) => {
      const noteTime = t + delays[idx] * this.speedMultiplier;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Overtone for festive reed/nagaswaram brightness
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.12 / (idx === 5 ? 0.7 : 1.0), noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (idx === 5 ? 1.4 : 0.6) * this.speedMultiplier);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc2.start(noteTime);
      osc.stop(noteTime + (idx === 5 ? 1.5 : 0.65) * this.speedMultiplier);
      osc2.stop(noteTime + (idx === 5 ? 1.5 : 0.65) * this.speedMultiplier);
    });
  }
}

// Global audio engine singleton
window.sivagangaAudio = new SivagangaAudio();
