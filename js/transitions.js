/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - PALM-LEAF SCROLL TRANSITIONS
 * Olai Chuvadi unrolling wipe with audio rustle and transition input locking.
 */

class SivagangaTransitions {
  constructor() {
    this.container = null;
    this.isTransitioning = false;
  }

  init() {
    this.container = document.getElementById('olai-wipe-overlay');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'olai-wipe-overlay';
      this.container.className = 'olai-wipe-container';

      // Create 12 authentic palm-leaf horizontal slats
      for (let i = 0; i < 12; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'olai-leaf-strip';
        leaf.style.transitionDelay = `${i * 22}ms`;
        this.container.appendChild(leaf);
      }

      document.body.appendChild(this.container);
    }
  }

  /**
   * Performs an authentic Olai Chuvadi palm-leaf scroll unrolling screen wipe.
   * Locks inputs against double triggers until transition concludes.
   */
  wipe(onMidpoint, onComplete) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    window.sivagangaInteraction.setLock(true);

    if (!this.container) this.init();

    // 1. Rustle sound of unrolling dry palm leaves
    window.sivagangaAudio.playPalmLeafScroll();

    // 2. Unroll across screen
    this.container.classList.remove('roll-out');
    this.container.classList.add('active', 'unroll');

    const speedScale = window.sivagangaInteraction.speedScale || 1.0;
    const midTime = 420 * speedScale;
    const endTime = 880 * speedScale;

    // Midpoint: switch views under the cover of the palm leaves
    setTimeout(() => {
      if (onMidpoint) onMidpoint();

      // 3. Roll out to reveal destination screen
      this.container.classList.remove('unroll');
      this.container.classList.add('roll-out');

      setTimeout(() => {
        this.container.classList.remove('active', 'roll-out');
        this.isTransitioning = false;
        window.sivagangaInteraction.setLock(false);
        if (onComplete) onComplete();
      }, 420 * speedScale);
    }, midTime);
  }
}

// Global transitions singleton
window.sivagangaTransitions = new SivagangaTransitions();
