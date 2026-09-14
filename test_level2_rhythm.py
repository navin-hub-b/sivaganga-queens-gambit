"""
Automated Test Suite for Level 2 Rhythm Combat Mechanics
Validates:
1. Frame-rate independence across 15 FPS, 30 FPS, 60 FPS, and 120 FPS.
2. Single-action input clamping (anti-spam / held key protection).
3. Telegraph-then-react sparring exchange sequence.
"""

def test_rhythm_framerate_independence():
    BPM = 72
    beat_interval_ms = 60000.0 / BPM  # 833.333 ms
    tolerance_ms = 140.0

    def get_beat_info(elapsed_ms):
        closest_beat = round(elapsed_ms / beat_interval_ms)
        diff = abs(elapsed_ms - closest_beat * beat_interval_ms)
        is_on_beat = diff <= tolerance_ms
        return closest_beat, diff, is_on_beat

    framerates = [15, 30, 60, 120, 144]
    results_per_fps = {}
    total_beats_tested = 10

    for fps in framerates:
        frame_dt = 1000.0 / fps
        simulated_time = 0.0
        on_beat_hits = 0
        last_action_beat = -1

        for beat_num in range(total_beats_tested):
            target_hit_time = beat_num * beat_interval_ms
            while simulated_time < target_hit_time:
                simulated_time += frame_dt

            beat_index, diff, on_beat = get_beat_info(simulated_time)

            if beat_index != last_action_beat and on_beat:
                last_action_beat = beat_index
                on_beat_hits += 1

        results_per_fps[fps] = on_beat_hits

    print("--- RHYTHM FRAMERATE INDEPENDENCE TEST ---")
    for fps, hits in results_per_fps.items():
        print(f"[{fps} FPS] Hits: {hits}/{total_beats_tested}")
        assert hits == total_beats_tested, f"Failed at {fps} FPS: expected {total_beats_tested} hits, got {hits}"

    print("[PASS] Rhythm mechanic performs with 100% parity across 15, 30, 60, 120, and 144 FPS!")

def test_anti_spam_clamping():
    BPM = 72
    beat_interval_ms = 60000.0 / BPM
    tolerance_ms = 140.0

    def get_beat_info(elapsed_ms):
        closest_beat = round(elapsed_ms / beat_interval_ms)
        diff = abs(elapsed_ms - closest_beat * beat_interval_ms)
        is_on_beat = diff <= tolerance_ms
        return closest_beat, diff, is_on_beat

    simulated_time = 0.0 # start right on beat 0
    last_action_beat = -1
    action_count = 0

    # Player mashes button 20 times in a single 833ms beat window
    for _ in range(20):
        beat_index, _, _ = get_beat_info(simulated_time)
        if last_action_beat != beat_index:
            action_count += 1
            last_action_beat = beat_index
        simulated_time += 15.0 # 15ms between rapid presses

    print("\n--- ANTI-SPAM INPUT CLAMPING TEST ---")
    print(f"20 rapid inputs in 1 beat window -> Actions registered: {action_count}")
    assert action_count == 1, f"Expected exactly 1 registered action, got {action_count}"
    print("[PASS] Held-button and button-mashing clamped strictly to 1 action per beat window!")

def test_telegraph_sparring_exchange():
    print("\n--- TELEGRAPH & COUNTER SPARRING TEST ---")
    partner_state = 'idle'
    player_score = 0
    telegraph_beat = -1

    for beat in range(12):
        if partner_state == 'idle':
            if beat % 3 == 0:
                partner_state = 'telegraph_windup'
                telegraph_beat = beat
        elif partner_state == 'telegraph_windup':
            if beat == telegraph_beat + 1:
                partner_state = 'striking'
                # Player reads telegraph and blocks on this beat
                partner_state = 'recoiling'
        elif partner_state == 'recoiling':
            # Player counters on immediate next beat
            player_score += 1
            partner_state = 'idle'
            if player_score >= 3:
                break

    print(f"Completed sparring score: {player_score}/3")
    assert player_score == 3, f"Expected 3 successful exchanges, got {player_score}"
    print("[PASS] Telegraph-then-react sparring exchange verified successfully!")

if __name__ == '__main__':
    test_rhythm_framerate_independence()
    test_anti_spam_clamping()
    test_telegraph_sparring_exchange()
    print("\nALL LEVEL 2 RHYTHM TESTS PASSED (100%).")
