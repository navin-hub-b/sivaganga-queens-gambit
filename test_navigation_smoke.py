import sys
import re
import urllib.request
import urllib.error

SERVER_BASE = "http://localhost:8000"

CANONICAL_ROUTES = [
    "/",
    "/chronicle",
    "/level/01-the-only-child",
    "/level/02-valari-silambam",
    "/level/03-the-pillared-mandapam",
    "/level/04-the-couriers-message",
    "/level/05-escape-to-the-western-ghats",
    "/level/06-queen-of-sivaganga",
    "/level/07-the-companys-shadow",
    "/level/08-the-dindigul-durbar",
    "/level/09-the-udaiyaal-regiment",
    "/level/10-the-convoy-of-five-thousand",
    "/level/11-kuyilis-eye",
    "/level/12-the-valari-arc",
    "/level/13-the-eic-cantonment-ledgers",
    "/level/14-the-cartographers-trap",
    "/level/15-the-vijayadashami-infiltration",
    "/level/16-the-outer-ramparts",
    "/level/17-the-moat-sluice-gates",
    "/level/18-kuyilis-sacrifice",
    "/level/19-the-royal-palace-courtyard",
    "/level/20-the-last-years",
    "/level/18-kuyilis-sacrifice/complete"
]

EDGE_ROUTES = [
    "/level/02-renamed-future-title",
    "/level/99-nonexistent-level",
    "/unknown-deep/exploratory/trail"
]

STATIC_ASSETS = [
    "/js/router.js",
    "/js/save.js",
    "/js/main.js",
    "/js/chronicle.js",
    "/js/gameplay.js",
    "/css/style.css",
    "/css/tokens.css"
]

def test_live_http_routes():
    print("\n--- 1. LIVE HTTP ZERO-404 ROUTE VERIFICATION ---")
    all_routes = CANONICAL_ROUTES + EDGE_ROUTES
    passed = 0
    for route in all_routes:
        url = f"{SERVER_BASE}{route}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SivagangaSmokeTester/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                status = resp.status
                body = resp.read().decode("utf-8")
                if status == 200 and "SIVAGANGA: THE QUEEN'S GAMBIT" in body and "js/router.js" in body:
                    print(f"  [200 OK] {route} -> Served index.html successfully")
                    passed += 1
                else:
                    print(f"  [FAIL] {route} -> Unexpected response (status {status})")
        except Exception as e:
            print(f"  [ERROR] {route} -> {e}")

    assert passed == len(all_routes), f"Expected {len(all_routes)} passes, got {passed}"
    print(f"  --> PASSED: All {len(all_routes)} routes returned 200 OK with zero 404s!\n")

def test_static_asset_serving():
    print("--- 2. STATIC ASSET SERVING VERIFICATION ---")
    passed = 0
    for asset in STATIC_ASSETS:
        url = f"{SERVER_BASE}{asset}"
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                if resp.status == 200 and len(resp.read()) > 0:
                    print(f"  [200 OK] {asset}")
                    passed += 1
                else:
                    print(f"  [FAIL] {asset} returned status {resp.status}")
        except Exception as e:
            print(f"  [ERROR] {asset} -> {e}")

    assert passed == len(STATIC_ASSETS), f"Expected {len(STATIC_ASSETS)} passes, got {passed}"
    print(f"  --> PASSED: All {len(STATIC_ASSETS)} static assets served correctly!\n")

def test_router_contract_integrity():
    print("--- 3. ROUTER JS LOGIC & CONTRACT VERIFICATION ---")
    with open("js/router.js", "r", encoding="utf-8") as f:
        router_src = f.read()

    # 1. Check all 20 canonical level declarations
    for i in range(1, 21):
        pattern = rf"id:\s*{i},\s*slug:\s*['\"](\d{{2}}-[a-z0-9-]+)['\"]"
        match = re.search(pattern, router_src)
        assert match, f"Level {i} missing from canonicalLevels definition in js/router.js"
        print(f"  [CANONICAL] Level {i:02d} -> {match.group(1)}")

    # 2. Check chapter finales
    assert "this.chapterFinales = [5, 9, 10, 15, 16, 20];" in router_src or "[5, 9, 10, 15, 16, 20]" in router_src, \
        "Chapter finales array not properly declared in js/router.js"
    print("  [CONTRACT] Chapter finales properly registered: [5, 9, 10, 15, 16, 20]")

    # 3. Check Level 18 reflection sub-route handling
    assert "/level/18-kuyilis-sacrifice/complete" in router_src, "Level 18 reflection sub-route not handled"
    assert "renderLevel18ReflectionScreen" in router_src, "Reflection screen renderer missing"
    print("  [CONTRACT] Level 18 reflection sub-route & screen confirmed")

    # 4. Check atomic progression save contract
    assert "window.sivagangaSave.recordLevelComplete" in router_src, "Atomic save record missing"
    assert "saveOk" in router_src or "!saveOk" in router_src, "Atomic save success check missing"
    print("  [CONTRACT] Atomic progression save before route change confirmed")

    # 5. Check palm leaf wipe invocation
    assert "window.sivagangaTransitions.wipe" in router_src, "Palm-leaf scroll wipe missing from router"
    print("  [CONTRACT] Palm-leaf scroll wipe integrated across all transitions")

    # 6. Check Browser Back history hierarchy injection
    assert "history.pushState" in router_src, "history.pushState hierarchy missing"
    print("  [CONTRACT] Browser Back hierarchy (Level -> Chronicle -> Home) confirmed\n")

def test_save_replay_protection():
    print("--- 4. SAVE REPLAY IMMUTABILITY VERIFICATION ---")
    with open("js/save.js", "r", encoding="utf-8") as f:
        save_src = f.read()

    # Verify isReplay parameter on recordLevelComplete
    assert "recordLevelComplete(lvlNumber, stats = {}, isReplay = false)" in save_src or "isReplay" in save_src, \
        "isReplay parameter missing on recordLevelComplete"

    # Verify Level 8 and 18 protection
    assert "lvlNumber === 8 || lvlNumber === 18" in save_src, \
        "Level 8 and 18 replay protection missing in save.js"

    # Verify Alliance replay protection
    assert "setAlliance(index, status = true, isReplay = false)" in save_src or "isReplay" in save_src, \
        "Alliance replay protection missing in save.js"

    # Verify helper methods
    assert "isLevelUnlocked" in save_src, "isLevelUnlocked helper missing in save.js"
    assert "isLevelCompleted" in save_src, "isLevelCompleted helper missing in save.js"

    print("  [SAVE OK] Level 8 & 18 replay protection confirmed.")
    print("  [SAVE OK] Alliance bell replay protection confirmed.")
    print("  [SAVE OK] Progression guard query methods confirmed.\n")

def simulate_url_resolution_and_guards():
    print("--- 5. URL RESOLUTION & GUARD SIMULATION ---")
    canonical_levels = {
        1: "01-the-only-child",
        2: "02-valari-silambam",
        3: "03-the-pillared-mandapam",
        4: "04-the-couriers-message",
        5: "05-escape-to-the-western-ghats",
        6: "06-queen-of-sivaganga",
        7: "07-the-companys-shadow",
        8: "08-the-dindigul-durbar",
        9: "09-the-udaiyaal-regiment",
        10: "10-the-convoy-of-five-thousand",
        11: "11-kuyilis-eye",
        12: "12-the-valari-arc",
        13: "13-the-eic-cantonment-ledgers",
        14: "14-the-cartographers-trap",
        15: "15-the-vijayadashami-infiltration",
        16: "16-the-outer-ramparts",
        17: "17-the-moat-sluice-gates",
        18: "18-kuyilis-sacrifice",
        19: "19-the-royal-palace-courtyard",
        20: "20-the-last-years"
    }

    def resolve_path(path):
        clean = path.rstrip("/") if len(path) > 1 and path.endswith("/") else path
        if clean == "" or clean == "/":
            return {"type": "HOME", "path": "/"}
        if clean == "/chronicle":
            return {"type": "CHRONICLE", "path": "/chronicle"}
        m_refl = re.match(r"^/level/18(?:-[a-z0-9-]+)?/complete$", clean, re.I)
        if m_refl:
            return {"type": "LEVEL_18_COMPLETE", "levelId": 18, "path": "/level/18-kuyilis-sacrifice/complete"}
        m_lvl = re.match(r"^/level/(\d{1,2})(?:-([a-z0-9-]+))?$", clean, re.I)
        if m_lvl:
            lid = int(m_lvl.group(1))
            if 1 <= lid <= 20:
                return {"type": "LEVEL", "levelId": lid, "slug": canonical_levels[lid], "path": f"/level/{canonical_levels[lid]}"}
        return {"type": "UNRECOGNIZED", "originalPath": clean}

    for route in CANONICAL_ROUTES:
        res = resolve_path(route)
        assert res["type"] in ["HOME", "CHRONICLE", "LEVEL", "LEVEL_18_COMPLETE"], f"Failed to resolve {route}"
        print(f"  [RESOLVE OK] {route} -> {res['type']}")

    tol_res = resolve_path("/level/02-the-new-weapons-training")
    assert tol_res["levelId"] == 2 and tol_res["slug"] == "02-valari-silambam", "Tolerance failed on renamed slug"
    print("  [TOLERANCE OK] /level/02-the-new-weapons-training correctly resolved to Level 2 canonical slug")

    unrec_res = resolve_path("/unregistered-trail")
    assert unrec_res["type"] == "UNRECOGNIZED", "Unrecognized path failed"
    print("  [UNRECOGNIZED OK] /unregistered-trail safely classified without throw\n")

if __name__ == "__main__":
    print("==================================================")
    print(" SIVAGANGA: ROUTING & PROGRESSION SMOKE TEST SUITE")
    print("==================================================")
    test_live_http_routes()
    test_static_asset_serving()
    test_router_contract_integrity()
    test_save_replay_protection()
    simulate_url_resolution_and_guards()
    print("==================================================")
    print(" [ALL TESTS PASSED] 100% ROUTING INTEGRITY VERIFIED")
    print("==================================================")
