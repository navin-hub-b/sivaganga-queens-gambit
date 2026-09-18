/**
 * SIVAGANGA: THE QUEEN'S GAMBIT — ROYAL SCRIBE NARRATIVE FLOW ENGINE
 * Provides seamless story-bridging between every level transition.
 * Renders the "Royal Scribe Narrative Bridge" modal after each trial,
 * giving historical context and a preview of what comes next.
 *
 * Architecture:
 *   - window.sivagangaNarrativeFlow  ← singleton exported below
 *   - onLevelComplete(levelId, stats) ← called by every level on win
 *   - advanceToNextLevel(nextId)      ← wipes → starts next level
 *   - viewInChronicle(levelId)        ← wipes → opens chronicle, centers node
 */

'use strict';

class SivagangaNarrativeFlow {
  constructor() {
    /** @type {boolean} Whether a bridge modal is currently visible */
    this.isModalVisible = false;
    /** @type {number|null} Current level that just completed */
    this._lastCompletedLevel = null;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalVisible) {
        this._closeBridgeModal();
      }
    });

    // =========================================================================
    // HISTORICAL NARRATIVE BRIDGES  (indexed 1→20, i.e. bridges[N] is what
    // appears after level N completes, bridging N → N+1)
    // =========================================================================
    this.bridges = {
      // ── CHAPTER I: THE ROYAL LINEAGE (1730–1746) ─────────────────────────
      1: {
        chapterTag: 'CHAPTER I · THE ROYAL LINEAGE (1730–1746)',
        completedTitle: 'Trial I: The Only Child — Concluded',
        completedSubtitle: 'Courtyard Mentors Awakened',
        story: [
          'In the sunlit courtyards of Ramanathapuram, young Velu Nachiyar met the three masters who would shape her destiny: the swordmaster, the scholar, and the healer.',
          'King Chellamuthu Sethupathy watched with quiet pride. His daughter had greeted each mentor with the precise courtly protocols — confirming that the blood of Ramanathapuram royalty ran true.',
          'But across the Palk Strait, Company ships were gathering. Word of a princess trained in both blade and diplomacy had reached unfriendly ears.'
        ],
        nextPreview: {
          icon: '⚔',
          label: 'NEXT TRIAL · II: VALARI & SILAMBAM',
          desc: 'The Armory awaits. Master the art of the Valari boomerang and Silambam staff through drumbeat-timed sequences.'
        }
      },
      2: {
        chapterTag: 'CHAPTER I · THE ROYAL LINEAGE (1730–1746)',
        completedTitle: 'Trial II: Valari & Silambam — Mastered',
        completedSubtitle: 'Rhythm of the Warrior Sages',
        story: [
          'The armory drum fell silent. Velu Nachiyar stood at the centre of the practice yard, both weapons lowered, chest rising and falling with controlled breath.',
          'Her silambam strokes had matched the mridangam cadence perfectly. The Valari arced back to her hand three times — a feat that took most apprentices a full monsoon season.',
          '"The weapons choose the hand," the drummaster said. "Yours have chosen well." He stamped twice: the highest praise in the armory.'
        ],
        nextPreview: {
          icon: '🏹',
          label: 'NEXT TRIAL · III: HORSE AND BOW',
          desc: 'Ride the rampart circuit at full canter, loosing arrows at garland-ring targets. Precision on horseback separates a warrior queen from the rest.'
        }
      },
      3: {
        chapterTag: 'CHAPTER I · THE ROYAL LINEAGE (1730–1746)',
        completedTitle: 'Trial III: Horse and Bow — Cleared',
        completedSubtitle: 'Bastion Gate Unlocked',
        story: [
          'Velu Nachiyar wheeled her horse at the end of the rampart course, the last garland ring still swaying from the tip of her arrow. Every target struck.',
          'The bastion gate creaked open for the first time in three years — a symbolic passage into the inner knowledge of the fort.',
          'Inside, her tutor Rajan Maistry waited with an intercepted letter, its text scrambled beyond easy reading. "The Company writes in shadows," he said. "It is time you learned to read them."'
        ],
        nextPreview: {
          icon: '📜',
          label: 'NEXT TRIAL · IV: TONGUES OF THE WORLD',
          desc: 'A colonial cipher hides inside the scribes\' mandapam. Decode Tamil, French, English, and Urdu dispatches before the knowledge is lost to flame.'
        }
      },
      4: {
        chapterTag: 'CHAPTER I · THE ROYAL LINEAGE (1730–1746)',
        completedTitle: 'Trial IV: Tongues of the World — Deciphered',
        completedSubtitle: 'Colonial Threat Unveiled',
        story: [
          'The final cipher unlocked its hidden meaning under lamplight. Velu Nachiyar read the decoded text aloud in four languages without stumbling — Tamil, then English, then French, then Urdu.',
          'The decoded letters revealed something far heavier than a vocabulary test: a chain of instructions from Madras to surveyors mapping Sivaganga\'s moat lines.',
          '"They are already counting our walls," she told her father that evening. "We have perhaps ten years." King Chellamuthu set down his goblet. "Then we must fill ten years with preparation in one."'
        ],
        nextPreview: {
          icon: '🌸',
          label: 'NEXT TRIAL · V: THE BETROTHAL (Chapter I Finale)',
          desc: '1746: A great ceremonial tournament fills the fort grounds. Three trials of mind, body, and spirit seal the royal alliance — and the queen\'s destiny.'
        }
      },
      5: {
        chapterTag: 'CHAPTER I · THE ROYAL LINEAGE (1730–1746) — CHAPTER FINALE',
        completedTitle: 'Trial V: The Betrothal — Sealed',
        completedSubtitle: 'Chapter I Complete · The Chronicles Continue',
        story: [
          'The betel leaves were exchanged beneath a sky lit with ceremonial torches. Muthuvaduganatha Periyavudaya Thevar of Sivaganga and Velu Nachiyar of Ramanathapuram were joined in a royal alliance that would unite two of the Carnatic\'s most resilient houses.',
          'It was 1746. Across the subcontinent, the War of Austrian Succession was reshaping European ambitions — and those ambitions were already spilling onto Indian shores.',
          'The Chronicle map now opens. Sivaganga Fort awaits its new queen. Chapter II begins.'
        ],
        nextPreview: {
          icon: '👑',
          label: 'CHAPTER II: THE SOVEREIGN REIGN — Trial VI: Queen of Sivaganga',
          desc: 'The wedding feast is done. Now the real work begins — governing Sivaganga\'s villages, allocating grain, gold and loyalty through four seasons of rule.'
        }
      },
      6: {
        chapterTag: 'CHAPTER II · THE SOVEREIGN REIGN (1746–1772)',
        completedTitle: 'Trial VI: Queen of Sivaganga — Prosperity Achieved',
        completedSubtitle: 'Four Seasons of Just Reign',
        story: [
          'After four turns of careful governance, the grain stores were full, the treasury stable, and the loyalty garlands stretched across every village gate in the kingdom.',
          'Twenty-five years of co-rule passed in measured seasons. Velu Nachiyar sat beside her husband in the council chamber, learning every detail of fort administration — water rights, tax law, merchant treaties.',
          'Then, in 1771, the first shadow fell. A Company officer arrived under parley flag, bearing a debt notice addressed to the Sivaganga estate. The tone was polite. The content was a threat.'
        ],
        nextPreview: {
          icon: '🕯',
          label: 'NEXT TRIAL · VII: THE COMPANY\'S SHADOW',
          desc: '1772: Dusk over Sivaganga Fort. Velu Nachiyar must slip through sentry patrols to recover three intercepted ledgers — without the Company\'s scouts raising the alarm.'
        }
      },
      7: {
        chapterTag: 'CHAPTER II · THE SOVEREIGN REIGN (1746–1772)',
        completedTitle: 'Trial VII: The Company\'s Shadow — Infiltration Secured',
        completedSubtitle: 'Intel Recovered · The Northern Road Opens',
        story: [
          'All three enemy ledgers were in Rani Velu Nachiyar\'s hands as the patrol lanterns swung back toward the east gate. She had not been seen.',
          'The ledgers confirmed the worst: the Company and the Nawab of Arcot were planning a joint assault on Sivaganga within the year. The moat survey, the garrison roster, the extortion demand — all three pieces locked together into one terrible picture.',
          '"We cannot fight them here," she told her council at midnight. "Not yet. We must ride north — to Hyder Ali of Mysore. An alliance forged in strength is the only answer to an empire built on ledger ink."'
        ],
        nextPreview: {
          icon: '🪔',
          label: 'NEXT TRIAL · VIII: KALAIYAR KOVIL',
          desc: 'June 25, 1772. Watch from the highest ramparts of Sivaganga as dawn breaks over the sacred grove of Kalaiyar Kovil. Silence and distance veil the turning point of the war.'
        }
      },
      8: {
        chapterTag: 'CHAPTER II · THE SOVEREIGN REIGN (1746–1772)',
        completedTitle: 'Trial VIII: Kalaiyar Kovil — The Sacred Ember',
        completedSubtitle: 'The Fall of the King · The Oath of Exile',
        story: [
          'The solitary brass lamp in the inner sanctuary died to black as the messenger knelt with King Muthuvaduganatha\'s broken signet. At the temple steps of Kalaiyar Kovil, the sovereign had fallen refusing surrender.',
          'In the silence of the darkened chamber, Rani Velu Nachiyar gathered her infant daughter Vellachi to her heart. From the cold wick, a quiet spark caught—a steadfast ember that would burn through eight years of forest exile.',
          '"Sivaganga is not lost," she whispered into the dawn. "While we draw breath, foreign arms shall never hold this realm." The ride to the Virupakshi hills had begun.'
        ],
        nextPreview: {
          icon: '🪔',
          label: 'NEXT TRIAL · IX: FLIGHT TO VIRUPACHI (Chapter II Finale)',
          desc: 'June 1772: Under cover of midnight, escort infant Vellachi through dense forest patrols toward the highland sanctuary of Chieftain Gopala Nayaker at Virupachi.'
        }
      },
      9: {
        chapterTag: 'CHAPTER II · THE SOVEREIGN REIGN & FLIGHT TO VIRUPACHI (1746–1772) — CHAPTER FINALE',
        completedTitle: 'Trial IX: Flight to Virupachi — Sanctuary Reached',
        completedSubtitle: 'Chapter II Complete · The Highland Refuge',
        story: [
          'The forest shadows receded as the torchlit palisades of Virupachi Fortress came into view against the granite slopes of the Palani hills.',
          'Chieftain Gopala Nayaker rode out to meet the Queen, bowing low before the child Vellachi cradled against her breast. "You are safe beneath our mountain walls, Rani Velu Nachiyar," the chieftain vowed. "Virupachi and Dindigul stand with Sivaganga."',
          'The Chapter II stealth trial concludes. The eight-year strategic exile begins. In the mountain redoubt, the Udaiyaal women\'s regiment will be trained, and the triple alliance with Nawab Hyder Ali and the Maruthu brothers will be forged. Chapter III opens.'
        ],
        nextPreview: {
          icon: '⚔',
          label: 'CHAPTER III: THE EXILE & THE TRIPLE ALLIANCE — Trial X: The Convoy of Five Thousand',
          desc: 'In the mountain defiles of Dindigul, assemble the allied vanguard and coordinate the march toward the plains of Sivaganga.'
        }
      },
      10: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial X: Kuyili\'s Fire — Corps Assembled',
        completedSubtitle: 'The Udaiyaal Corps Is Born',
        story: [
          'Seven hundred women, trained in silence under forest canopy. Kuyili drilled them at dawn and Velu Nachiyar tested each squad at dusk — herb-knowledge for the healers, blade-craft for the vanguard, coded drum signals for the messengers.',
          'They called themselves the Udaiyaal Corps — "those who give of themselves." The name was chosen carefully: it carried no hostility, only dedication.',
          '"The Company\'s soldiers fight for pay," Kuyili told the assembly. "We fight for a reason. That will matter when the walls of Sivaganga are within sight again."'
        ],
        nextPreview: {
          icon: '🗺',
          label: 'NEXT TRIAL · XI: THE INTELLIGENCE NETWORK',
          desc: 'Lay a web of trusted informants across five towns between the exile forest and Sivaganga. Each node must be verified before intelligence can flow.'
        }
      },
      11: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial XI: The Intelligence Network — Web Complete',
        completedSubtitle: 'Five Nodes, Zero Compromises',
        story: [
          'The last informant — a cloth merchant with routes through Kalayarkovil — confirmed her signal via the pre-arranged indigo-thread pattern on a delivered bale.',
          'Velu Nachiyar now knew troop rotation schedules, supply wagon departure times, and the identity of the Company\'s local informers. She shared this with no one outside her immediate council.',
          '"Intelligence shared too widely is intelligence lost," she told Kuyili. "We keep the full picture only here." She pressed a finger to her temple.'
        ],
        nextPreview: {
          icon: '🌊',
          label: 'NEXT TRIAL · XII: THE SLUICE GAMBIT',
          desc: 'The Kaveri feeder channel can flood the southeastern approach road — turning it impassable. Solve the hydraulic puzzle before the monsoon window closes.'
        }
      },
      12: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial XII: The Sluice Gambit — Flood Channel Secured',
        completedSubtitle: 'Southern Road Severed',
        story: [
          'The sluice gates turned on their brass pivots and the feeder surge hit the road three miles south of Sivaganga Fort exactly at the planned hour.',
          'A Company supply column that had been two days out turned back, its wagon axles sinking beyond salvage. The southeastern approach would not be passable for at least two monsoon cycles.',
          '"One road closed," Velu Nachiyar noted on the campaign map. "Three remain. We have time — but not much."'
        ],
        nextPreview: {
          icon: '🎯',
          label: 'NEXT TRIAL · XIII: THE FRENCH ALLIANCE',
          desc: 'A French officer, Maréchal Lally\'s last man in the south, carries training manuals and a treasury note. Negotiate carefully — France has its own interests.'
        }
      },
      13: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial XIII: The French Alliance — Terms Agreed',
        completedSubtitle: 'European Advisors Integrated',
        story: [
          'Captain Martel was a pragmatist who had survived Pondicherry\'s fall by the simple virtue of staying useful. He looked at the Udaiyaal Corps drills and nodded slowly.',
          '"They are disciplined. With European volley-fire timing they will be very dangerous." He opened his portfolio and produced the treasury note: twelve thousand livres, convertible to Mysore gold.',
          'The agreement gave France no territorial claims — Velu Nachiyar had insisted. It gave the Corps something more valuable: battlefield timing doctrine that the Company\'s own recruits spent three years learning.'
        ],
        nextPreview: {
          icon: '🛡',
          label: 'NEXT TRIAL · XIV: THE TRUST TRIALS',
          desc: 'Eight village headmen on the recapture route must be tested for loyalty before the army marches through. A single betrayal at this stage could end everything.'
        }
      },
      14: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial XIV: The Trust Trials — Eight Bonds Confirmed',
        completedSubtitle: 'The March Route Is Secure',
        story: [
          'The eighth headman passed his test without knowing it was a test. He had turned away a Company officer\'s bribe — and then reported the attempt to Velu Nachiyar\'s messenger the same morning.',
          '"That is trust," she said, recording his name in the march ledger. Eight names, eight confirmed routes. The army could move without fearing an ambush at any bridge or grain store.',
          'Word came from Kuyili\'s scouts: the Company garrison inside Sivaganga Fort had grown complacent. The replacement commander was known for long afternoon siestas.'
        ],
        nextPreview: {
          icon: '🌙',
          label: 'NEXT TRIAL · XV: THE NIGHT MARCH',
          desc: 'Seven hundred fighters move through forest trails in darkness over three nights. Maintain column integrity, avoid patrols, and reach the staging ground before dawn.'
        }
      },
      15: {
        chapterTag: 'CHAPTER III · THE EXILE & THE RETURN (1772–1780)',
        completedTitle: 'Trial XV: The Night March — Staging Ground Reached',
        completedSubtitle: 'The Army Stands at Sivaganga\'s Gate',
        story: [
          'On the third morning, the last column filed into the mango grove two miles northwest of Sivaganga. Every fighter accounted for. Three sentry patrols successfully avoided. Zero noise violations.',
          'Velu Nachiyar climbed the grove\'s tallest tree at first light and looked through a brass spyglass at the fort she had not seen in seven years. The Company flag flew from the central tower.',
          'Kuyili placed a hand on the trunk below. "Ready," she said simply. Velu Nachiyar descended. "Tomorrow at the second hour. Kuyili leads the breach. I take the gate." The plan was set. Chapter IV begins at dawn.'
        ],
        nextPreview: {
          icon: '⚡',
          label: 'CHAPTER IV: THE RECAPTURE (1780) — Trial XVI: Kuyili\'s Sacrifice',
          desc: 'Chapter IV Finale. Kuyili breaches the armory in a supreme act of courage. Navigate the fort passages to reach the central gate before the garrison rallies.'
        }
      },
      16: {
        chapterTag: 'CHAPTER IV · THE RECAPTURE (1780) — CHAPTER FINALE',
        completedTitle: 'Trial XVI: Kuyili\'s Sacrifice — The Breach Is Open',
        completedSubtitle: 'Chapter III Complete · The Recapture Begins',
        story: [
          'The armory went up in a great column of smoke and light. In the confusion of shouts and running boots, the Udaiyaal Corps surged through every lane of the fort simultaneously.',
          'Velu Nachiyar walked through the main gate — not running, not hiding. She carried no weapon drawn. The soldiers who saw her stopped. Some of them had heard her name for seven years as a ghost story.',
          '"This fort is Sivaganga\'s," she said, loudly and clearly. "Any soldier who lays down arms before noon will be escorted safely to the coast. Any officer who remains will answer to the court of Sivaganga." Three officers surrendered before she finished the sentence.'
        ],
        nextPreview: {
          icon: '🏛',
          label: 'NEXT TRIAL · XVII: THE LIBERATION OF SIVAGANGA',
          desc: 'The fort is breached but not yet secured. Clear seven key strongpoints inside the walls — the armory, the treasury, the signal tower, and four barracks — through strategic decisions, not combat.'
        }
      },
      17: {
        chapterTag: 'CHAPTER IV · THE RECAPTURE (1780)',
        completedTitle: 'Trial XVII: The Liberation of Sivaganga — Fort Cleared',
        completedSubtitle: 'Seven Strongpoints Secured',
        story: [
          'By midday, all seven strongpoints were under Sivaganga\'s colours. The signal tower flew a flame-orange banner visible from every rooftop in the city below.',
          'The population poured out of homes and temples. There were no words adequate for what was happening; instead, people brought what they had — water pots, flower garlands, lit lamps.',
          'In the treasury chamber, Velu Nachiyar found the original coronation records still intact, sealed in an iron box. The Company accountants had catalogued everything but had not thought to destroy the history of the land they occupied.'
        ],
        nextPreview: {
          icon: '📋',
          label: 'NEXT TRIAL · XVIII: THE GOVERNANCE COUNCIL',
          desc: 'Sivaganga is free — now it must be governed. Eight petitions await the queen\'s decision. Each choice will shape the next decade of the kingdom.'
        }
      },
      18: {
        chapterTag: 'CHAPTER IV · THE RECAPTURE (1780)',
        completedTitle: 'Trial XVIII: The Governance Council — Decrees Issued',
        completedSubtitle: 'The Kingdom Restored to Order',
        story: [
          'Eight petitions in one morning. Land rights for displaced farmers, re-establishment of the temple endowment fund, amnesty terms for local collaborators, repairs to the southern aqueduct, restoration of the merchant guilds, allocation of the recovered treasury surplus, the fate of Company-era records, and the question of standing patrols.',
          'Velu Nachiyar addressed each one without deferring a single decision to the afternoon. Those present in the council chamber that day would later say they felt they were watching history being administered in real time.',
          '"A queen who rules by delay rules by fear," she told the scribes. "Write that down. It belongs in the records."'
        ],
        nextPreview: {
          icon: '✉',
          label: 'NEXT TRIAL · XIX: THE TREATY OF SIVAGANGA',
          desc: 'The Company will return with a larger force unless a treaty is secured. Navigate the diplomatic correspondence — every word of the response letter carries strategic weight.'
        }
      },
      19: {
        chapterTag: 'CHAPTER IV · THE RECAPTURE (1780)',
        completedTitle: 'Trial XIX: The Treaty of Sivaganga — Terms Secured',
        completedSubtitle: 'Sivaganga\'s Sovereignty Affirmed',
        story: [
          'The Company\'s reply took eleven days to arrive from Madras. Velu Nachiyar had written three drafts of the treaty before settling on the final version — each draft a shade more decisive than the last.',
          'The response from Madras accepted the terms. Not because the Company had suddenly discovered generosity, but because three other insurrections were pressing harder at that moment, and Sivaganga had just demonstrated that its queen would make any military recovery costly.',
          '"They will try again," she said, folding the letter. "But not today. And today is enough." She placed the sealed treaty in the iron box beside the coronation records.'
        ],
        nextPreview: {
          icon: '👑',
          label: 'FINAL TRIAL · XX: THE CORONATION (Campaign Finale)',
          desc: 'The coronation of Rani Velu Nachiyar as sole sovereign of Sivaganga. The Udaiyaal Corps forms the guard of honour. The chronicle is complete.'
        }
      },
      20: {
        chapterTag: 'CHAPTER IV · THE RECAPTURE (1780) — CAMPAIGN COMPLETE',
        completedTitle: 'Trial XX: The Coronation — Campaign Complete',
        completedSubtitle: 'Rani Velu Nachiyar — Veeramangai, Queen of Sivaganga',
        story: [
          'The oil lamp was lit by Kuyili\'s closest companion, as Kuyili herself had requested in the document she left before the breach. The flame caught in a single breath of wind and held steady.',
          'Velu Nachiyar received the symbols of sovereignty one by one: the sceptre, the seal, the register of land, and the key to the treasury. The Udaiyaal Corps drummed the acknowledgement cadence — the same rhythm they had drilled to in the exile forest.',
          'She was forty years old. She had spent twenty years preparing, seven years in exile, and seven months recapturing. She would reign for another decade as Sivaganga\'s sole sovereign — the first queen in the Carnatic to recapture and hold her own kingdom. History had been made, not despite the odds, but because she had studied them.'
        ],
        nextPreview: null // Campaign complete
      }
    };
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Called by a level module when the player completes that level.
   * Saves progress then shows the narrative bridge modal.
   *
   * @param {number} levelId   1-based level index
   * @param {Object} [stats]   Optional stats object from the level module
   */
  onLevelComplete(levelId, stats = {}) {
    if (this.isModalVisible) return; // Prevent double-fire

    this._lastCompletedLevel = levelId;

    // 1. Ensure the save reflects this victory (level files may already have
    //    called recordLevelVictory — we call unlockLevel again defensively)
    if (window.sivagangaSave) {
      if (levelId < 20) {
        window.sivagangaSave.unlockLevel(levelId + 1);
      }
      window.sivagangaSave.recordChronicleNode(levelId);
    }

    // 2. Brief delay so the level's own victory animation can play (if any)
    const bridge = this.bridges[levelId];
    if (!bridge) {
      // No bridge data — just advance directly
      if (levelId < 20) {
        this.advanceToNextLevel(levelId + 1);
      } else {
        this._goChronicle();
      }
      return;
    }

    // 3. Show the Royal Scribe bridge modal
    setTimeout(() => {
      this._renderBridgeModal(levelId, bridge);
    }, 800);
  }

  /**
   * Transitions with a palm-leaf wipe to the next level.
   * @param {number} nextId
   */
  advanceToNextLevel(nextId) {
    this._closeBridgeModal();

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);
    if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll?.();

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(
        () => {
          // Stop whatever level is currently running
          this._stopCurrentLevel();
          // Start next level via gameplay engine
          if (window.sivagangaGameplay) {
            window.sivagangaGameplay.start(nextId);
          } else if (window.sivagangaRouter) {
            window.sivagangaRouter.navigate(`/level/${String(nextId).padStart(2, '0')}-${this._slugForLevel(nextId)}`);
          }
        },
        () => {
          if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
        }
      );
    } else {
      this._stopCurrentLevel();
      if (window.sivagangaGameplay) window.sivagangaGameplay.start(nextId);
    }
  }

  /**
   * Transitions to the Chronicle Map, centring on the completed node.
   * @param {number} [levelId]
   */
  viewInChronicle(levelId) {
    this._closeBridgeModal();

    if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(true);
    if (window.sivagangaAudio) window.sivagangaAudio.playPalmLeafScroll?.();

    if (window.sivagangaTransitions) {
      window.sivagangaTransitions.wipe(
        () => {
          this._stopCurrentLevel();
          if (window.sivagangaRouter) {
            window.sivagangaRouter.navigate('/chronicle');
          } else if (window.sivagangaFlow) {
            window.sivagangaFlow.transition('GO_CHRONICLE');
          }
        },
        () => {
          if (window.sivagangaInteraction) window.sivagangaInteraction.setLock(false);
          // Centre the chronicle on the completed node after a short layout delay
          if (levelId && window.sivagangaChronicle?.centreOnNode) {
            setTimeout(() => window.sivagangaChronicle.centreOnNode(levelId), 350);
          }
        }
      );
    } else {
      this._stopCurrentLevel();
      if (window.sivagangaRouter) window.sivagangaRouter.navigate('/chronicle');
    }
  }

  // ===========================================================================
  // JOURNEY RIBBON HELPERS — called by gameplay.js setupStage()
  // ===========================================================================

  /**
   * Refreshes the Journey Ribbon breadcrumb and nav buttons.
   * @param {Object} lvl  Level descriptor from levels.js
   */
  refreshJourneyRibbon(lvl) {
    const chapterEl = document.getElementById('level-breadcrumb-chapter');
    const stepEl    = document.getElementById('level-breadcrumb-step');
    const badgeEl   = document.getElementById('level-mechanic-badge');
    const prevBtn   = document.getElementById('level-prev-btn');
    const nextBtn   = document.getElementById('level-next-btn');
    const chronBtn  = document.getElementById('level-chronicle-btn-ribbon');

    const save = window.sivagangaSave?.state;
    const unlockedUpTo = save?.unlockedLevel ?? 1;

    if (chapterEl) chapterEl.textContent = lvl.chapterTitle || `CHAPTER ${lvl.chapter || 1}`;
    if (stepEl)    stepEl.textContent    = `TRIAL ${lvl.id} OF 20`;
    if (badgeEl)   badgeEl.textContent   = lvl.mechanicName || lvl.newSystem || '';

    // Prev button
    if (prevBtn) {
      if (lvl.id > 1) {
        prevBtn.style.display = '';
        prevBtn.innerHTML = `&larr; Prev: Level ${lvl.id - 1}`;
        prevBtn.onclick = () => {
          this.advanceToNextLevel(lvl.id - 1);
        };
      } else {
        prevBtn.style.display = 'none';
      }
    }

    // Next button
    if (nextBtn) {
      const canGoNext = (lvl.id < 20);
      if (canGoNext) {
        nextBtn.style.display = '';
        nextBtn.innerHTML = `Next: Level ${lvl.id + 1} &rarr;`;
        nextBtn.onclick = () => {
          this.advanceToNextLevel(lvl.id + 1);
        };
      } else {
        nextBtn.style.display = 'none';
      }
    }

    // Chronicle shortcut
    if (chronBtn) {
      chronBtn.onclick = () => this.viewInChronicle(lvl.id);
    }
  }

  // ===========================================================================
  // INTERNAL — Modal Rendering
  // ===========================================================================

  _renderBridgeModal(levelId, bridge) {
    this.isModalVisible = true;

    let modal = document.getElementById('campaign-narrative-bridge-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'campaign-narrative-bridge-modal';
      modal.className = 'narrative-bridge-overlay';
      document.getElementById('app-root')?.appendChild(modal);
    }

    const isCampaignEnd = (levelId === 20);
    const nextPreviewHtml = bridge.nextPreview
      ? `<div class="narrative-bridge-next-preview">
           <span class="narrative-next-icon">${bridge.nextPreview.icon}</span>
           <div>
             <div class="narrative-next-label">${bridge.nextPreview.label}</div>
             <div class="narrative-next-desc">${bridge.nextPreview.desc}</div>
           </div>
         </div>`
      : '';

    const nextBtnHtml = isCampaignEnd
      ? `<button id="narrative-bridge-chronicle-btn" class="btn-tamil btn-primary narrative-btn-wide">Consult the Full Chronicle Map</button>`
      : `<button id="narrative-bridge-continue-btn" class="btn-tamil btn-primary">Continue Journey &rarr;</button>
         <button id="narrative-bridge-chronicle-btn" class="btn-tamil">View Chronicle Map</button>`;

    modal.innerHTML = `
      <div class="narrative-bridge-card" style="position: relative;">
        <button id="narrative-bridge-close-btn" class="plaque-close-btn" title="Dismiss [Esc]" style="position:absolute; top:12px; right:16px; font-size:24px; cursor:pointer; background:none; border:none; color:#D9A441; line-height:1;">×</button>
        <div class="narrative-bridge-header">
          <span class="narrative-bridge-chapter-tag">${bridge.chapterTag}</span>
          <h2 class="narrative-bridge-title">${bridge.completedTitle}</h2>
          <p class="narrative-bridge-subtitle">${bridge.completedSubtitle}</p>
        </div>
        <div class="narrative-bridge-story">
          ${bridge.story.map(p => `<p>${p}</p>`).join('')}
        </div>
        ${nextPreviewHtml}
        <div class="narrative-bridge-actions">
          ${nextBtnHtml}
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Wire buttons
    const closeBtn = document.getElementById('narrative-bridge-close-btn');
    const continueBtn = document.getElementById('narrative-bridge-continue-btn');
    const chronicleBtn = document.getElementById('narrative-bridge-chronicle-btn');

    if (closeBtn) {
      closeBtn.onclick = () => this._closeBridgeModal();
    }
    modal.onclick = (e) => {
      if (e.target === modal) this._closeBridgeModal();
    };

    if (continueBtn) {
      continueBtn.onclick = () => this.advanceToNextLevel(levelId + 1);
    }
    if (chronicleBtn) {
      chronicleBtn.onclick = () => this.viewInChronicle(levelId);
    }
  }

  _closeBridgeModal() {
    this.isModalVisible = false;
    const modal = document.getElementById('campaign-narrative-bridge-modal');
    if (modal) modal.style.display = 'none';
  }

  // ===========================================================================
  // INTERNAL — Helpers
  // ===========================================================================

  _stopCurrentLevel() {
    const stoppers = [
      'sivagangaCourtyard',
      'sivagangaValariSilambam',
      'sivagangaHorseAndBow',
      'sivagangaTonguesOfTheWorld',
      'sivagangaTheBetrothal',
      'sivagangaQueenOfSivaganga',
      'sivagangaTheCompanysShadow',
      'sivagangaKalaiyarKovil',
      'sivagangaFlightToVirupachi'
    ];
    stoppers.forEach(key => {
      if (window[key]?.isActive) window[key].stop();
    });
    if (window.sivagangaGameplay?.isLevelActive) {
      window.sivagangaGameplay.isLevelActive = false;
    }
  }

  _goChronicle() {
    this._closeBridgeModal();
    if (window.sivagangaRouter) {
      window.sivagangaRouter.navigate('/chronicle');
    } else if (window.sivagangaFlow) {
      window.sivagangaFlow.transition('GO_CHRONICLE');
    }
  }

  /** Slug map for router navigation fallback */
  _slugForLevel(id) {
    const slugs = {
      1: 'the-only-child',
      2: 'valari-silambam',
      3: 'horse-and-bow',
      4: 'tongues-of-the-world',
      5: 'the-betrothal',
      6: 'queen-of-sivaganga',
      7: 'the-companys-shadow',
      8: 'kalaiyar-kovil',
      9: 'flight-to-virupachi',
      10: 'kuyilis-fire',
      11: 'the-intelligence-network',
      12: 'the-sluice-gambit',
      13: 'the-french-alliance',
      14: 'the-trust-trials',
      15: 'the-night-march',
      16: 'kuyilis-sacrifice',
      17: 'the-liberation-of-sivaganga',
      18: 'the-governance-council',
      19: 'the-treaty-of-sivaganga',
      20: 'the-coronation'
    };
    return slugs[id] || String(id);
  }
}

// Export singleton
window.sivagangaNarrativeFlow = new SivagangaNarrativeFlow();
