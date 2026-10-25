"""(Thresholds are those of audit_trade_v2.py / audit_trade_v3.py; the 31 bloc cases are judged inside audit_trade_v3_eval.py with their declared amendments.)
Runs every check of the WTO + investment-treaty task and prints PASS / FAIL. Run from the repository root:
  python3 -I engine/relations/docs/gemini_trade/run_checks.py pre     before the rescoring (the A and B parts of audit_trade are EXPECTED to FAIL here: pairs.json is still the old one)
  python3 -I engine/relations/docs/gemini_trade/run_checks.py post    after the rescoring (every line must PASS)"""
import os, re, subprocess, sys
ROOT = os.getcwd()
WORLD, CAL, MODEL = (os.path.join(ROOT, 'engine', 'relations', d) for d in ('world', 'calibration', 'model'))
if not os.path.isdir(WORLD):
    sys.exit('STOP: run this from the repository root (the folder that contains engine/ and package.json)')
phase = sys.argv[1] if len(sys.argv) > 1 else 'pre'
env = dict(os.environ, WGE_OFFLINE='1')
results = []


def run(cmd, cwd, timeout=1200):
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout)
    return r.returncode, r.stdout + r.stderr


def check(name, ok, detail, expected_fail=False):
    results.append((name, ok or expected_fail, detail))
    print(f"{'PASS' if ok else ('FAIL (expected before the rescoring)' if expected_fail else 'FAIL')}  {name}: {detail}", flush=True)


rc, out = run(['npx', 'tsc', '--noEmit'], ROOT)
check('typecheck (tsc)', rc == 0, 'exit 0' if rc == 0 else out[:300])
rc, out = run(['npx', 'vitest', 'run'], ROOT)
m = re.search(r'Tests\s+(\d+) passed', out)
check('app tests (vitest)', bool(m) and int(m[1]) == 363 and 'failed' not in out.split('Tests')[-1][:40], f"{m[1] if m else '?'} passed, expected 363")
rc, out = run(['python3', '-I', 'audit_trade_v3_eval.py'], WORLD)
print(out)
check('audit_trade_v3 D1-D5 and amended bloc cases', rc == 0, 'both pass' if rc == 0 else 'see the lines above', expected_fail=(phase == 'pre'))
for name, cmd, cwd, pat, need in [
    ('benchmark of 89 pairs (>= 78)', ['python3', '-I', 'audit_eval.py'], WORLD, r'(\d+)/89 within range', 78),
    ('map pairs (>= 36)', ['python3', '-I', 'audit_map_eval.py'], WORLD, r'pairs in the expected class: (\d+)/40', 36),
    ('map utility (>= 35)', ['python3', '-I', 'audit_map_eval.py'], WORLD, r'utility: (\d+)/40', 35),
    ('hold-out of 30 pairs (>= 10)', ['python3', '-I', '-c', "import sys; sys.path.insert(0,'.'); import audit_eval as E, audit_holdout as H; E.BENCH[:] = H.BENCH; E.run()"], WORLD, r'(\d+)/30 within range', 10),
]:
    rc, out = run(cmd, cwd)
    m = re.search(pat, out)
    check(name, bool(m) and int(m[1]) >= need, f"{m[1] if m else '?'} needed {need}")
rc, out = run(['python3', '-I', 'calib_report.py'], CAL)
print(out)
check('calibration (sum rise <= 15, no zero-loss episode above 5)', rc == 0, 'ok' if rc == 0 else out[-200:])
for name, script, cwd in [('embassy tests', 'test_embassy.py', MODEL), ('pulse tests', 'test_pulse.py', WORLD), ('calibration reproduction', 'test_reproduce.py', CAL)]:
    rc, out = run(['python3', '-I', script], cwd)
    check(name, rc == 0 and re.search(r'^OK', out, re.M) is not None, 'OK' if rc == 0 else out[-200:])
bad = [r for r in results if not r[1]]
print(f"\n{len(results) - len(bad)}/{len(results)} checks passed" + ('' if not bad else '  -> FAILED: ' + ', '.join(r[0] for r in bad)))
sys.exit(1 if bad else 0)
