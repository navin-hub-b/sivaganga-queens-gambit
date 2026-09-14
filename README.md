# 🗡️ SIVAGANGA: THE QUEEN'S GAMBIT (1780)

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub_Pages-Automated_Deploy-2ea44f?logo=github)](https://navin-hub-b.github.io/sivaganga-queens-gambit/)
[![Technology](https://img.shields.io/badge/Stack-HTML5_Canvas_%7C_Web_Audio-d4af37)](#technical-architecture)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_External_Libs-success)](#technical-architecture)
[![History](https://img.shields.io/badge/Era-1780_Sivaganga_Liberation-8b0000)](#historical-narrative)

> *"They took our kingdom in the darkness of Kalaiyar Kovil. We shall take it back with the thunder of Hyder Ali's cannon and the iron will of Sivaganga."*  
> — **Rani Velu Nachiyar**

**SIVAGANGA: THE QUEEN'S GAMBIT** is an epic historical chronicle and single-page browser game celebrating the life and triumph of **Veeramangai Rani Velu Nachiyar** (1730–1796) — the legendary queen of Sivaganga and the first Indian sovereign to wage a victorious war of liberation against the British East India Company.

---

## 🏛️ Game Highlights & Design Pillars

### 1. 🌿 Hollow Knight–Style In-World Traversal
Forget flat level-selection lists. Players journey through a continuous, interconnected 18th-century world.
- Advance from level to level through **in-world secret pathways** — such as the *Carved Granite Archway* in the archery courtyard and the *Mandapam Colonnade* in the training grounds.
- Natural spatial discovery preserves immersion, placing the player directly into Velu Nachiyar's world.

### 2. 🛕 Diegetic Architectural HUD
No floating generic UI boxes. Every status indicator is integrated into the Tanjore temple and palace architecture:
- **Diya Lamp in Stone Wall Niche**: Flickering oil flame representing Royal Morale.
- **Temple Archway Bells**: Four bronze alliance bells (*Virupakshi Compact*, *Mysore Alliance*, *Maruthu Brotherhood*, *Udaiyaal Regiment*) that toll and gleam upon forging historical pacts.
- **Silver Wrist Bangles**: Intricate ornaments representing the Trust & Loyalty of your subjects.

### 3. 📜 Unobstructed Visuals & Manuscript Lore Drawer
- 100% full-screen arena viewing without intrusive text overlays.
- Historical context, tactical objectives, and tutor wisdom are housed in a collapsible palm-leaf manuscript drawer.
- Toggle at any time with keyboard hotkeys **`H`** or **`F1`**, or click the **`[📜 Lore (H)]`** stone badge in the header.

### 4. 🥁 Procedural Web Audio Engine (Zero External Audio Bloat)
Real-time acoustic synthesis powered entirely by the browser's Web Audio API:
- Deep, double-membrane **Murasu war drums** with authentic acoustic skin decay and bass resonance.
- High-frequency metallic **Silambam staff clangs** and spinning **Valari boomerang whistles**.
- Dynamic temple bells tuned to traditional pentatonic frequencies.

---

## 🗺️ The 20 Canonical Chapters of Liberation

The game chronicles Velu Nachiyar's 8-year tactical campaign across 4 acts:

| Act | Title | Historical Beat |
| :--- | :--- | :--- |
| **I** | **The Heir of Ramanathapuram** (Levels 1–5) | Royal upbringing, martial training (Silambam & Valari), marriage to Muthu Vaduganatha, and the escape to the Western Ghats after the Kalaiyar Kovil ambush (1772). |
| **II** | **The Virupakshi Compact & Mysore Alliance** (Levels 6–10) | Refuge under Palayakkarar Gopala Nayaker, diplomatic treaty with Hyder Ali in fluent Urdu, and raising the Udaiyaal women's regiment. |
| **III** | **The Intelligence Web & The Sacred Blades** (Levels 11–15) | Kuyili's reconnaissance network, intercepting Company ammunition supply routes, and the Vijayadashami infiltration of the fortified city. |
| **IV** | **The Storming of Sivaganga** (Levels 16–20) | Breaching the outer ramparts, draining the moat sluices, Kuyili's immortal sacrifice at the ammunition depot, and the coronation of 1780. |

---

## 🎮 Controls & Mechanics

| Key | Action |
| :--- | :--- |
| **`W` / `A` / `S` / `D`** or **Arrow Keys** | Guide Velu Nachiyar across the training grounds and battlefield |
| **Mouse Aim + Left Click** / **Space** | Draw and loose arrows at targets and enemy scouts |
| **`A`** | Valari Spin Defense (Rhythm Defense) |
| **`D`** | Silambam High Strike (Rhythm Defense) |
| **`H`** / **`F1`** | Open / Close the Historical Lore Manuscript |
| **`Esc`** | Close Lore Drawer / Open Tactical Pause Menu |

---

## 💻 Technical Architecture

```
sivaganga-queens-gambit/
├── index.html                  # Single-page shell with deep-link query restorer
├── 404.html                    # GitHub Pages SPA redirector (zero 404s on refresh)
├── spa_server.py               # Lightweight Python dev server with SPA history fallback
├── .gitignore                  # Clean repository ignore configuration
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # Automated GitHub Actions deployment to Pages
├── css/
│   ├── tokens.css              # Tanjore mineral pigment colors & typography
│   ├── animations.css          # Palm-leaf scroll wipes, diya flickers & bell chimes
│   └── style.css               # Architectural layouts, diegetic HUD, and modal styling
├── js/
│   ├── router.js               # History SPA router with subpath/GitHub Pages autodetection
│   ├── save.js                 # LocalStorage persistence & immutable progression guards
│   ├── audio.js                # Web Audio API procedural synthesis engine
│   ├── tanjore_art.js          # Procedural gold-leaf borders and temple relief renderer
│   ├── diegetic_hud.js         # Wall-niche diya, temple bells, and wrist bangles
│   ├── home_screen.js          # The Fort Threshold main menu
│   ├── chronicle.js            # The 20-level illustrated parchment roadmap
│   ├── level1_courtyard.js     # Royal Courtyard archery challenge & secret archway
│   ├── level2_valari_silambam.js # Rhythm martial defense & colonnade transition
│   ├── gameplay.js             # Arena canvas pipeline & global combat loop
│   └── main.js                 # Application bootstrap and module orchestrator
└── assets/                     # Historical reference illustrations & textures
```

- **Zero Runtime Dependencies**: Built purely with native standard Web APIs (Canvas 2D, Web Audio, History API, CSS3 Grid/Flexbox).
- **GitHub Pages Single Page App (SPA) Ready**: Includes custom base-path autodetection and `404.html` client redirection to ensure direct deep-links (e.g. `/chronicle` or `/level/01-the-only-child`) never fail on refresh.

---

## 🚀 Running Locally

You can launch the game locally with Python's built-in server:

```bash
# Clone or navigate to the repository
git clone https://github.com/navin-hub-b/sivaganga-queens-gambit.git
cd sivaganga-queens-gambit

# Start the SPA history server (Port 8000)
python spa_server.py 8000
```

Then open your browser and navigate to:
**`http://localhost:8000/`**

---

## 🌐 Deploying to GitHub Pages

This repository is pre-configured with a GitHub Actions workflow that automatically publishes the game to GitHub Pages:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/navin-hub-b/sivaganga-queens-gambit.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Within minutes, your game will be live at:
   `https://navin-hub-b.github.io/sivaganga-queens-gambit/`

---

## 📜 Historical Reverence & Credits

This project was crafted for the **Smart India Hackathon (SIH 2026)** to celebrate Tamil cultural heritage, traditional martial arts (*Silambam*, *Valari*, *Varma Kalai*), and the valor of Rani Velu Nachiyar and Kuyili.

*Vetrivel! Veeravel!* 🗡️
