import os, re

files = [
    'index.html',
    'css/tokens.css',
    'css/animations.css',
    'css/style.css',
    'js/save.js',
    'js/audio.js',
    'js/diegetic_hud.js',
    'js/interaction.js',
    'js/settings.js',
    'js/tanjore_art.js',
    'js/transitions.js',
    'js/levels.js',
    'js/chronicle.js',
    'js/level1_courtyard.js',
    'js/level2_valari_silambam.js',
    'js/gameplay.js',
    'js/home_screen.js',
    'js/router.js',
    'js/main.js'
]

print("--- FILE INTEGRITY CHECK ---")
for f in files:
    exists = os.path.exists(f)
    size = os.path.getsize(f) if exists else 0
    print(f"[{'OK' if exists else 'MISSING'}] {f} ({size} bytes)")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for f in files:
    if f.endswith('.js'):
        if f'src="{f}"' not in html and f'src="{f}?' not in html:
            print(f"WARNING: {f} not linked in index.html")
    elif f.endswith('.css'):
        if f'href="{f}"' not in html and f'href="{f}?' not in html:
            print(f"WARNING: {f} not linked in index.html")

print("\n--- LEVEL DEFINITION CHECK ---")
with open('js/levels.js', 'r', encoding='utf-8') as f:
    levels_code = f.read()

# Count levels
ids = re.findall(r'id:\s*(\d+)', levels_code)
print(f"Total levels declared: {len(ids)} (IDs: {ids})")

print("\n--- COLOR TOKEN VERIFICATION ---")
with open('css/tokens.css', 'r', encoding='utf-8') as f:
    tokens = f.read()

required_tokens = [
    '--bg-maroon: #2E1F1B',
    '--bg-terracotta: #B85042',
    '--accent-gold: #D9A441',
    '--accent-sage: #A7BEAE',
    '--danger-deep: #7A1F1F',
    '--map-parchment: #C9A876'
]

for t in required_tokens:
    if t in tokens:
        print(f"[OK] Found token: {t}")
    else:
        print(f"[FAIL] Missing token: {t}")

print("\nVerification Complete.")
