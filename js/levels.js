/**
 * SIVAGANGA: THE QUEEN'S GAMBIT - 20 SEQUENTIAL LEVELS DEFINITION
 * 4 Chronological Chapters (1772–1780) tracking Rani Velu Nachiyar's historic campaign.
 * Each level introduces exactly one new system and never regresses a previously taught one.
 * English-only text with accurate transliterated Tamil proper nouns.
 * Non-graphic conflict resolution.
 */

window.sivagangaLevels = [
  // =========================================================================
  // CHAPTER 1: THE FALL OF KALAIYAR KOVIL (1772)
  // =========================================================================
  {
    id: 1,
    chapter: 1,
    chapterTitle: 'Chapter I: The Royal Lineage & The Fall of Kalaiyar Kovil',
    title: 'The Only Child',
    subtitle: 'Ramanathapuram Fort-Palace Courtyard (1740s)',
    sigilType: 'shadow',
    mechanicName: 'Free-Roam Movement & Royal Mentorship',
    mechanicDesc: 'Explore the fort-palace grounds freely. Master walking, running, and interacting as young Velu Nachiyar meets her three royal mentors.',
    loreBriefing: 'Born in 1730 as the only child to King Chellamuthu Vijayaragunatha Sethupathy and Queen Sakandhimuthal of the Ramnad kingdom, Velu Nachiyar was raised with the complete education of a crown prince—trained in Silambam, archery, horse riding, Valari throwing, and multiple court languages.',
    objective: 'Explore the palace grounds, practice with the weapon rack, and confer with your three mentors.',
    newSystem: 'Free-Roam Movement & Interaction',
    isFreeRoam: true,
    dialogue: {
      speaker: 'King Chellamuthu Sethupathy',
      text: 'My daughter, you are the only heir to the Sethupathy throne. No art of war or diplomacy shall be withheld from you.'
    },
    historicalFact: 'Velu Nachiyar was trained in martial arts including Valari, Silambam, archery, and swordplay, as well as horse riding, and mastered Tamil, Telugu, Malayalam, Sanskrit, French, English, and Urdu.'
  },
  {
    id: 2,
    chapter: 1,
    chapterTitle: 'Chapter I: The Royal Lineage & The Fall of Kalaiyar Kovil',
    title: 'Valari & Silambam',
    subtitle: 'Ramanathapuram Fort Training Grounds (1740s)',
    sigilType: 'valari_boomerang',
    mechanicName: 'Rhythm & Timing Combat (Rangoli Beat)',
    mechanicDesc: 'Attune your strikes and blocks to the environmental drumbeat and the pulsing floor Rangoli sigil. Defeat the training dummy and spar with your partner.',
    loreBriefing: 'Under the watchful gaze of Master Veera Maravar and the fort drummer, young Velu Nachiyar trains in the traditional arts of Valari—the curved iron throwing sickle—and Silambam staff combat.',
    objective: 'Follow the drummer\'s pulse to land Silambam strikes, throw the Valari crescent, and complete the sparring drill.',
    newSystem: 'Rhythm / Timing Combat & Telegraph React',
    isRhythmCombat: true,
    dialogue: {
      speaker: 'Master Veera Maravar',
      text: 'Combat in our kingdom is not brute force, Velu Nachiyar. It is rhythm. Feel the Murasu drum pulse through the stone floor!'
    },
    historicalFact: 'The Valari is an ancient Tamil crescent-shaped projectile made of seasoned iron or ironwood, capable of rotating with lethal precision and returning along aerodynamic arcs.'
  },
  {
    id: 3,
    chapter: 1,
    chapterTitle: 'Chapter I: The Heir of Ramanathapuram (1740s)',
    title: 'Horse and Bow',
    subtitle: 'Equestrian Archery on the Outer Ramparts',
    sigilType: 'garland_ring',
    mechanicName: 'Precision Lead-Aim & Horsemanship',
    mechanicDesc: 'Ride along the sun-baked fort rampart while aiming at woven garland rings. The garland-ring reticle tightens gold on focus and loosens to warm amber as it drifts. Hold draw, time the release, and lead moving targets.',
    loreBriefing: 'Upon the windswept outer ramparts of Ramanathapuram Fort, young Velu Nachiyar trains in equestrian horsemanship and mounted archery. Master Veera Maravar sets up garland-ring targets along the bastion perimeter to teach precision lead-aim at full canter.',
    objective: 'Mount your saddled horse, control riding pace along the rampart track, and hit a majority of static and swinging garland rings with the precision reticle.',
    newSystem: 'Mounted Archery & Lead-Aim Precision',
    isEquestrianArchery: true,
    dialogue: {
      speaker: 'Master Veera Maravar',
      text: 'A true Sethupathi warrior rides and shoots as one breath. Watch the garland ring tighten gold—hold your draw, lead the swing, and release!'
    },
    historicalFact: 'Rani Velu Nachiyar was formally trained from childhood in equestrian horsemanship, Vilvithai (classical archery), Valari, and Silambam, making her one of the rare 18th-century monarchs to master mounted combat.'
  },
  {
    id: 4,
    chapter: 1,
    chapterTitle: 'Chapter I: The Fall of Kalaiyar Kovil (1772)',
    title: 'Tongues of the World',
    subtitle: 'Multilingual Diplomacy & Scribes\' Cipher',
    sigilType: 'bead_strand',
    mechanicName: 'Palm-Leaf Translation & Code Matching',
    mechanicDesc: 'Decipher intercepted colonial and diplomatic dispatches by matching torn palm-leaf script fragments across Tamil, English, French, and Urdu.',
    loreBriefing: 'Inside the quiet, lamplit scribes\' hall of Ramanathapuram Fort, young Velu Nachiyar studies the four strategic tongues of the subcontinent with Chief Royal Scholar Periya Pandithar. Deciphering intercepted colonial and allied letters reveals critical troop movements and foreshadows the covert spy network of Chapter 3.',
    objective: 'Match the torn palm-leaf fragments across three translation puzzles to decipher intercepted dispatches and uncover the shadow spy network.',
    newSystem: 'Palm-Leaf Translation & Code Matching',
    isTranslationPuzzle: true,
    dialogue: {
      speaker: 'Periya Pandithar',
      text: 'A true sovereign commands the tongues of both her allies and adversaries. Read the palm-leaves, Princess Velu—for wars are decided by shadow spies.'
    },
    historicalFact: 'Rani Velu Nachiyar was renowned as a multilingual scholar-warrior, having mastered Tamil, English, French, and Urdu. Her direct diplomacy in Urdu with Nawab Hyder Ali of Mysore later secured 5,000 cavalry and infantry to liberate Sivaganga.'
  },
  {
    id: 5,
    chapter: 1,
    chapterTitle: 'Chapter I: The Heir of Ramanathapuram (1746)',
    title: 'The Betrothal',
    subtitle: 'Ceremonial Fort Tournament & Royal Union (Chapter I Finale)',
    sigilType: 'garland_ring',
    mechanicName: 'Chapter 1 Finale: Tournament of Three Virtues',
    mechanicDesc: 'Master the three ceremonial trials of the royal betrothal tournament: Archery Precision, Silambam Combat Rhythm, and Thamboolam Betel-Leaf Court Diplomacy.',
    loreBriefing: 'At age sixteen, Princess Velu Nachiyar enters the grand ceremonial courtyard of Ramanathapuram Fort for her betrothal tournament. To seal the historic alliance with King Muthuvaduganatha Periyavudaya Thevar of Sivaganga, she must prove her sovereign mastery before the gathered royal courts across three sacred trials: archery, rhythmic combat, and diplomatic counsel.',
    objective: 'Triumph in the three tournament trials (Archery, Sparring, and Royal Thamboolam Diplomacy) to earn all three ceremonial flames and seal the Sivaganga alliance.',
    newSystem: 'Multi-Trial Tournament & Thamboolam Diplomacy',
    isTournament: true,
    isTrial: true,
    isChapterFinale: true,
    dialogue: {
      speaker: 'King Muthuvaduganatha Thevar',
      text: 'Princess of Ramnad, your arrows fly true, your staff keeps the rhythm of the Murasu, and your counsel rings with sovereign wisdom. Sivaganga welcomes our eternal union.'
    },
    historicalFact: 'In 1746, at the age of sixteen, Princess Velu Nachiyar of Ramanathapuram married King Muthuvaduganatha Periyavudaya Thevar of Sivaganga. The marriage united the Sethupathi dynasty with the royal kingdom of Sivaganga, establishing an alliance that later became the heart of the southern resistance against colonial rule.'
  },

  // =========================================================================
  // CHAPTER 2: THE SOVEREIGN REIGN OF SIVAGANGA (1746–1772)
  // =========================================================================
  {
    id: 6,
    chapter: 2,
    chapterTitle: 'Chapter II: The Sovereign Reign of Sivaganga (1746–1772)',
    title: 'Queen of Sivaganga',
    subtitle: 'The Council Chamber & Economy of the Realm',
    sigilType: 'granary',
    mechanicName: 'Village-Economy Resource Management',
    mechanicDesc: 'Allocate grain, gold, and public loyalty across seasonal decisions. Watch physical baskets, coin stacks, and loyalty garlands adjust on the council table, and witness consequences in the town below.',
    loreBriefing: 'Following her betrothal and marriage to King Muthuvaduganatha, Velu Nachiyar assumes her royal duties as Queen Consort of Sivaganga. In the Fort keep council chamber, she masters statecraft: balancing irrigation canals, festival provisions, famine reserves, and rampart defenses.',
    objective: 'Guide Sivaganga through 4 statecraft decisions, maintaining a thriving economy and high civic trust.',
    newSystem: 'Village-Economy Management & Physical Table Objects',
    isBespokeEconomy: true,
    historicalFact: 'During their joint reign (1746–1772), Rani Velu Nachiyar and King Muthuvaduganatha instituted extensive water-tank desilting and community granary reserves, transforming Sivaganga into a resilient, prosperous agrarian kingdom.'
  },
  {
    id: 7,
    chapter: 2,
    chapterTitle: 'Chapter II: The Exile at Dindigul & The Triple Alliance (1772–1779)',
    title: 'The Granary Allocation',
    subtitle: 'Virupakshi Supply Depot',
    sigilType: 'bead_strand',
    mechanicName: 'Resource Rationing (Grain & Silver Clamping)',
    mechanicDesc: 'Allocate grain bags and silver coins among the refugee camp, the garrison, and scout networks. Ensure no sector falls below survival thresholds.',
    loreBriefing: 'Winter descends upon the highlands. Over two thousand refugees from Sivaganga have gathered. Velu Nachiyar personally oversees fair grain rationing to maintain high morale and prepare troops.',
    objective: 'Balance the rations so that Refugee Morale >= 75 and Defense Readiness >= 75.',
    newSystem: 'Resource Management & Clamping',
    puzzleType: 'granary_balance',
    initialSupplies: { grain: 400, gold: 200 },
    historicalFact: 'During her exile, Velu Nachiyar earned deep reverence because she shared the same modest coarse millets as her followers, ensuring no family starved in exile.'
  },
  {
    id: 8,
    chapter: 2,
    chapterTitle: 'Chapter II: The Exile at Dindigul & The Triple Alliance (1772–1779)',
    title: 'The Dindigul Durbar',
    subtitle: 'Negotiations with Sultan Hyder Ali',
    sigilType: 'bangles',
    mechanicName: 'High-Stakes Persian Treaty Diplomacy',
    mechanicDesc: 'Converse in fluent Persian/Urdu with Sultan Hyder Ali of Mysore. Your command of diplomacy and shared anti-colonial vision secures artillery and cavalry.',
    loreBriefing: 'In 1779, Velu Nachiyar traveled to the formidable rock fort of Dindigul to meet Sultan Hyder Ali of Mysore. Writing and speaking in flawless Persian, she outlined a joint strategy against the British East India Company.',
    objective: 'Impress Sultan Hyder Ali with strategic insight to forge the Mysore Alliance.',
    newSystem: 'High-Stakes Treaty Negotiation',
    dialogueTree: [
      {
        prompt: 'Sultan Hyder Ali: "You address my court in courtly Persian, Queen of Sivaganga. What terms do you bring to Mysore?"',
        choices: [
          { text: '"We seek not mere rescue, but a military coalition. While you strike Company strongholds in the Carnatic, we will liberate Sivaganga and cut their southern supply lines."', deltaTrust: 2, reply: 'Hyder Ali smiles with great admiration: "A true commander\'s eye. You see the whole chessboard."' },
          { text: '"We ask your mighty army to defeat the British on our behalf."', deltaTrust: 0, reply: 'Hyder Ali shakes his head: "A kingdom reclaimed by foreign swords alone is never truly sovereign."' }
        ]
      },
      {
        prompt: 'Sultan Hyder Ali: "I command five thousand cavalry, five thousand infantry, and heavy bronze cannon in Dindigul. How will you supply them?"',
        choices: [
          { text: '"Chieftain Gopala Nayaker and the Maruthu brothers have prepared grain depots across Virupakshi and the jungle corridors."', deltaTrust: 1, reply: 'Hyder Ali raises his hand: "The compact is struck! Commandant Syed Karki shall march under your strategic banner."' }
        ]
      }
    ],
    allianceUnlocked: 1, // Mysore Alliance
    historicalFact: 'Velu Nachiyar was a prodigy who mastered Persian, Urdu, French, and English, alongside Tamil. Sultan Hyder Ali was so impressed by her letter in Persian that he granted 5,000 cavalry and 5,000 infantry.'
  },
  {
    id: 9,
    chapter: 2,
    chapterTitle: 'Chapter II: The Exile at Dindigul & The Triple Alliance (1772–1779)',
    title: 'The Udaiyaal Regiment',
    subtitle: 'Training the Women\'s Brigade',
    sigilType: 'rangoli_spiral',
    mechanicName: 'Unit Formation Drills & Silambam Stances',
    mechanicDesc: 'Direct the Udaiyaal women\'s brigade in traditional Silambam staff formations. Coordinate synchronized defensive and offensive rings.',
    loreBriefing: 'Velu Nachiyar commissions her trusted commander Kuyili to build the Udaiyaal Regiment—the first documented all-female military brigade in Indian history, named in honor of a loyal shepherdess Udaiyaal who died protecting royal secrets.',
    objective: 'Align 4 training squads into balanced defensive and offensive rings.',
    newSystem: 'Squad Formation Coordination',
    puzzleType: 'regiment_drill',
    allianceUnlocked: 3, // Udaiyaal Regiment Alliance
    historicalFact: 'The Udaiyaal regiment was named after Udaiyaal, a young shepherdess tortured by the British who refused to disclose Velu Nachiyar\'s whereabouts, sacrificing her life for the queen.'
  },
  {
    id: 10,
    chapter: 2,
    chapterTitle: 'Chapter II: The Exile at Dindigul & The Triple Alliance (1772–1779)',
    title: 'The Convoy of Five Thousand',
    subtitle: 'The Highland Mountain Defile (Chapter Trial)',
    sigilType: 'fort_rampart',
    mechanicName: 'Chapter 2 Master Trial: Allied Army Escort',
    mechanicDesc: 'Coordinate the march of Mysore cavalry, Maruthu scouts, and supply wagons through mountain passes while neutralizing scout warnings.',
    loreBriefing: 'The allied army departs Dindigul toward Sivaganga. British outposts along the highways must be scouted and bypassed before they can send alarm couriers to Madras.',
    objective: 'Guide the vanguard across 3 mountain sectors without raising fortress alarms.',
    isTrial: true,
    newSystem: 'Allied Army Defile Escort',
    gridSize: { cols: 12, rows: 8 },
    startPos: { x: 1, y: 2 },
    targetPos: { x: 10, y: 5 },
    shadows: [
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
      { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3 },
      { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
      { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 }
    ],
    sentries: [
      { x: 3, y: 4, dir: 'up', range: 2 },
      { x: 7, y: 2, dir: 'down', range: 2 },
      { x: 9, y: 6, dir: 'up', range: 2 }
    ],
    pebbles: 3,
    allianceUnlocked: 2, // Maruthu Brothers Alliance
    dialogue: {
      speaker: 'Chinna Maruthu',
      text: 'Five thousand horsemen move with the thunder of the monsoon. We must silence their watchtowers before the alarm bells can toll.'
    },
    historicalFact: 'The alliance of Velu Nachiyar, Hyder Ali, and the Palayakarars was one of the earliest united fronts against British colonial expansion in southern India.'
  },

  // =========================================================================
  // CHAPTER 3: THE SHADOW NETWORK & RECONNAISSANCE (1779–1780)
  // =========================================================================
  {
    id: 11,
    chapter: 3,
    chapterTitle: 'Chapter III: The Shadow Network & Reconnaissance (1779–1780)',
    title: 'Kuyili\'s Eye',
    subtitle: 'Dual-Character Infiltration',
    sigilType: 'vision',
    mechanicName: 'Dual-Hero Switching (Kuyili & Velu Nachiyar)',
    mechanicDesc: 'Switch between Kuyili (inside the barracks in disguise) and Velu Nachiyar (on the ramparts) to open locked gates and create mutual distractions.',
    loreBriefing: 'Commander Kuyili has infiltrated the British garrison inside Sivaganga. Working in tandem with Velu Nachiyar on the perimeter, they map out colonial armories.',
    objective: 'Coordinate Kuyili and Velu to unlock the gatehouse mechanism.',
    newSystem: 'Dual-Character Perspective Switching',
    puzzleType: 'dual_switch',
    dialogue: {
      speaker: 'Kuyili',
      text: 'I have bypassed the inner courtyard, my Queen. When I extinguish the courtyard torch, scale the southern trellis.'
    },
    historicalFact: 'Kuyili was Velu Nachiyar\'s chief intelligence officer and commander of the Udaiyaal regiment, known for her unmatched courage and disguise tactics.'
  },
  {
    id: 12,
    chapter: 3,
    chapterTitle: 'Chapter III: The Shadow Network & Reconnaissance (1779–1780)',
    title: 'The Valari Arc',
    subtitle: 'Ranged Non-Lethal Disarm',
    sigilType: 'valari',
    mechanicName: 'Valari Boomerang Throwing (Parabolic Arc)',
    mechanicDesc: 'Aim and release the traditional Tamil Valari boomerang along curved trajectories to sever rope lanterns and snip tripwires non-lethally.',
    loreBriefing: 'The Valari is a forged curved throwing weapon of Tamil warfare. Velu Nachiyar was renowned for her mastery of the weapon, using it to disarm sentry lanterns in complete silence.',
    objective: 'Sever 2 lantern ropes with curved Valari throws to plunge sentry posts into darkness.',
    newSystem: 'Valari Ranged Non-Lethal Aiming',
    puzzleType: 'valari_target',
    dialogue: {
      speaker: 'Velu Nachiyar',
      text: 'The Valari curves like the crescent moon. One clean strike severs the lantern cord—silence and darkness follow.'
    },
    historicalFact: 'The Valari was an iron or hardened wood curved throwing weapon unique to Tamil warriors, feared by colonial forces for its silent, deadly accuracy.'
  },
  {
    id: 13,
    chapter: 3,
    chapterTitle: 'Chapter III: The Shadow Network & Reconnaissance (1779–1780)',
    title: 'The EIC Cantonment Ledgers',
    subtitle: 'Decryption of Colonial Munitions Ciphers',
    sigilType: 'bead_strand',
    mechanicName: 'Cipher Disk Decryption',
    mechanicDesc: 'Rotate the concentric Tamil and Latin cipher rings to decode British logistics manifests and locate the concealed gunpowder depot.',
    loreBriefing: 'British East India Company officers recorded ammunition shipments in encrypted ledger books. Velu Nachiyar uses her multilingual intellect to break their logistical code.',
    objective: 'Align the cipher wheels to decipher the location: "RAJARAJESHWARI TEMPLE DEPOT".',
    newSystem: 'Cryptographic Ledger Alignment',
    puzzleType: 'cipher_wheel',
    dialogue: {
      speaker: 'Velu Nachiyar',
      text: 'They write in coded Latin figures, but their shipments speak of black powder and sulfur stored inside the temple precinct itself!'
    },
    historicalFact: 'The British East India Company routinely converted sacred Indian temples into fortified ammunition stores, knowing local rulers hesitated to fire upon holy shrines.'
  },
  {
    id: 14,
    chapter: 3,
    chapterTitle: 'Chapter III: The Shadow Network & Reconnaissance (1779–1780)',
    title: 'The Cartographer\'s Trap',
    subtitle: 'Sentry Patrol Route Tampering',
    sigilType: 'rangoli_spiral',
    mechanicName: 'Patrol Waypoint Manipulation',
    mechanicDesc: 'Switch the carved granite way-markers at crossroads to misdirect British patrols away from the central avenue into dead-end courtyards.',
    loreBriefing: 'Before launching the assault, Velu Nachiyar\'s scouts alter the patrol markers and lantern signals of the garrison.',
    objective: 'Redirect 2 redcoat patrol routes so the southern avenue remains completely unguarded.',
    newSystem: 'Patrol Route Tampering',
    gridSize: { cols: 10, rows: 7 },
    startPos: { x: 1, y: 3 },
    targetPos: { x: 8, y: 3 },
    switches: [{ x: 4, y: 3, toggled: false }],
    sentries: [{ x: 5, y: 1, dir: 'down', range: 3 }],
    historicalFact: 'Tamil guerrilla tactics in the 18th century relied heavily on intimate knowledge of terrain and deceptive signage to confuse colonial regiments.'
  },
  {
    id: 15,
    chapter: 3,
    chapterTitle: 'Chapter III: The Shadow Network & Reconnaissance (1779–1780)',
    title: 'The Vijayadashami Infiltration',
    subtitle: 'Festival of the Goddess (Chapter Trial)',
    sigilType: 'bangles',
    mechanicName: 'Chapter 3 Master Trial: Devotee Disguise',
    mechanicDesc: 'Guide Kuyili and the Udaiyaal women into the fortress gates disguised as flower and ghee-bearing devotees during the Navaratri festival.',
    loreBriefing: 'On Vijayadashami in October 1780, the Sivaganga palace gates were opened for women devotees to worship at the Rajarajeshwari temple. Velu Nachiyar and Kuyili conceived the daring plan to enter the fortress undetected.',
    objective: 'Bypass fortress security checkpoints without arousing suspicion.',
    isTrial: true,
    newSystem: 'Festival Devotee Disguise',
    gridSize: { cols: 12, rows: 8 },
    startPos: { x: 1, y: 4 },
    targetPos: { x: 11, y: 4 },
    shadows: [
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
      { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 },
      { x: 10, y: 4 }, { x: 11, y: 4 }
    ],
    sentries: [
      { x: 4, y: 2, dir: 'down', range: 2 },
      { x: 8, y: 6, dir: 'up', range: 2 }
    ],
    dialogue: {
      speaker: 'Kuyili',
      text: 'Underneath our flower garlands and sweet oils, our staves and daggers are concealed. The temple doors stand open.'
    },
    historicalFact: 'Vijayadashami 1780 was the only day women were permitted entry into the temple inside Sivaganga Fort. Velu Nachiyar utilized this cultural opening with tactical genius.'
  },

  // =========================================================================
  // CHAPTER 4: THE RECLAMATION OF SIVAGANGA (1780)
  // =========================================================================
  {
    id: 16,
    chapter: 4,
    chapterTitle: 'Chapter IV: The Reclamation of Sivaganga (1780)',
    title: 'The Outer Ramparts',
    subtitle: 'Coordinated Multi-Front Breach',
    sigilType: 'fort_rampart',
    mechanicName: 'Coordinated Multi-Hero Breach',
    mechanicDesc: 'Command the Maruthu brothers to stage a noisy feint at the Eastern Gate while Velu Nachiyar scales the Southern Bastion in darkness.',
    loreBriefing: 'The battle for Sivaganga begins. The Maruthu brothers light signal fires and sound war drums on the eastern moat, drawing the colonial garrison away from the southern battlements.',
    objective: 'Time the diversion at the East Gate to open the unguarded southern breach.',
    newSystem: 'Multi-Front Diversion Timing',
    puzzleType: 'dual_breach',
    dialogue: {
      speaker: 'Periya Maruthu',
      text: 'Our war horns echo along the river, Rani! All redcoats rush east. Scale the south wall now!'
    },
    historicalFact: 'The Maruthu Pandiyars staged masterclass diversionary assaults, engaging British cannon while the main strike force penetrated palace weak points.'
  },
  {
    id: 17,
    chapter: 4,
    chapterTitle: 'Chapter IV: The Reclamation of Sivaganga (1780)',
    title: 'The Moat Sluice Gates',
    subtitle: 'Hydro-Engineering Alignment',
    sigilType: 'ripple',
    mechanicName: 'Sluice Gate Hydro-Puzzle',
    mechanicDesc: 'Rotate the granite sluice wheels to drain the northern moat and uncover a dry subterranean aqueduct leading under the palace walls.',
    loreBriefing: 'The moat around Sivaganga Fort was fed by ancestral tank spillways. Velu Nachiyar opens the ancient drainage valves to expose a secret watercourse.',
    objective: 'Align 3 sluice gate wheels to lower the water level below the passage threshold.',
    newSystem: 'Hydro-Engineering Sluice Alignment',
    puzzleType: 'sluice_puzzle',
    dialogue: {
      speaker: 'Velu Nachiyar',
      text: 'My father taught me the hydrology of these tanks. Turn the central wheel twice—the waters will recede.'
    },
    historicalFact: 'Sivaganga\'s fortress design incorporated ingenious water management systems connecting temple tanks with defensive moats.'
  },
  {
    id: 18,
    chapter: 4,
    chapterTitle: 'Chapter IV: The Reclamation of Sivaganga (1780)',
    title: 'The Powder Magazine',
    subtitle: 'Kuyili\'s Supreme Sacrifice',
    sigilType: 'shadow',
    mechanicName: 'The Heroic Turning Point (Non-Graphic)',
    mechanicDesc: 'Navigate Commander Kuyili into the colonial ammunition vault. Through solemn, heroic self-sacrifice, she ignites the British gunpowder reserves, disabling their artillery without harming the sacred temple.',
    loreBriefing: 'Inside the Rajarajeshwari temple storehouse, thousands of barrels of British gunpowder threaten the entire city. Commander Kuyili douses herself in sacred lamp ghee, slips into the magazine, and sets the powder alight. Her sacrifice cripples the East India Company garrison in one stroke.',
    objective: 'Guide Kuyili to the central powder magazine. Rendered respectfully and non-graphically.',
    newSystem: 'Climactic Objective Trigger',
    gridSize: { cols: 10, rows: 6 },
    startPos: { x: 1, y: 3 },
    targetPos: { x: 8, y: 3 },
    shadows: [
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
      { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }
    ],
    sentries: [
      { x: 4, y: 1, dir: 'down', range: 2 },
      { x: 6, y: 5, dir: 'up', range: 2 }
    ],
    dialogue: {
      speaker: 'Kuyili',
      text: 'For Sivaganga. For our Queen. Our people shall be free.'
    },
    historicalFact: 'Commander Kuyili is recognized in historical records as the first recorded suicide attacker in Indian anti-colonial history. Her sacrifice in 1780 destroyed the British ammunition stockpile and turned the tide of the war.'
  },
  {
    id: 19,
    chapter: 4,
    chapterTitle: 'Chapter IV: The Reclamation of Sivaganga (1780)',
    title: 'The Royal Palace Courtyard',
    subtitle: 'Disarming the Colonial Command',
    sigilType: 'valari',
    mechanicName: 'Commander Disarm & Garrison Evasion',
    mechanicDesc: 'With British munitions neutralized, disarm the remaining colonial sentries using Silambam sweeps and Valari strikes, clearing the throne room.',
    loreBriefing: 'The British garrison commanders retreat to the central courtyard. Rani Velu Nachiyar and the Maruthu brothers corner the colonial forces, demanding unconditional evacuation.',
    objective: 'Disarm 3 defensive pickets and reach the throne room doors.',
    newSystem: 'Tactical Area Disarm',
    gridSize: { cols: 10, rows: 7 },
    startPos: { x: 1, y: 3 },
    targetPos: { x: 8, y: 3 },
    shadows: [
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
      { x: 7, y: 3 }, { x: 8, y: 3 }
    ],
    sentries: [
      { x: 3, y: 1, dir: 'down', range: 2 },
      { x: 5, y: 5, dir: 'up', range: 2 },
      { x: 7, y: 1, dir: 'down', range: 2 }
    ],
    dialogue: {
      speaker: 'Velu Nachiyar',
      text: 'Lay down your arms! Sivaganga is reclaimed by its rightful sovereign!'
    },
    historicalFact: 'The British forces under Captain Malleson and the Nawab of Arcot were routed in Sivaganga, fleeing toward Madurai.'
  },
  {
    id: 20,
    chapter: 4,
    chapterTitle: 'Chapter IV: The Reclamation of Sivaganga (1780)',
    title: 'The Coronation of Sivaganga',
    subtitle: 'Enthronement of the Veerangna (Grand Finale)',
    sigilType: 'rangoli_spiral',
    mechanicName: 'Grand Coronation & Victory Symphony',
    mechanicDesc: 'Ascend the granite throne of Sivaganga. All four alliance bells chime in celebratory chorus as the golden royal umbrella is unfurled.',
    loreBriefing: 'In 1780, eight long years after the fall of Kalaiyar Kovil, Rani Velu Nachiyar was crowned Queen of Sivaganga. She ruled with wisdom, justice, and diplomatic brilliance, entering world history as the first Indian queen to vanquish the British Empire.',
    objective: 'Ascend the throne and witness the grand epilogue of Sivaganga.',
    isTrial: true,
    newSystem: 'Victory Coronation Sequence',
    historicalFact: 'Rani Velu Nachiyar ruled Sivaganga for over a decade in peace and prosperity, appointing the Maruthu Pandiyar brothers as her royal administrators and naming her daughter Vellachi Nachiyar as successor.'
  }
];
