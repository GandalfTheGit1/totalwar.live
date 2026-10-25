"""One command that runs every check of the task and prints PASS / FAIL against the expected values.
Run from the repository root:   python3 -I engine/relations/docs/gemini_kit/run_checks.py baseline|phase0|phase1
  baseline : before touching anything                (363 app tests, importance files not there yet)
  phase0   : after the TypeScript patch and the Python files   (366 app tests, importance tests, exported file with 8 fields and 1845 pending pairs)
  phase1   : after the rescoring that follows the new reviewed facts (same expectations as phase0)"""
import json, os, re, subprocess, sys
ROOT = os.getcwd()
WORLD, MODEL, CAL = (os.path.join(ROOT, 'engine', 'relations', d) for d in ('world', 'model', 'calibration'))
if not os.path.isdir(WORLD):
    sys.exit('STOP: run this from the repository root (the folder that contains engine/ and package.json)')
phase = sys.argv[1] if len(sys.argv) > 1 else 'baseline'
env = dict(os.environ, WGE_OFFLINE='1')


def run(cmd, cwd, timeout=900):
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout)
    return r.returncode, (r.stdout + r.stderr)


results = []


def check(name, ok, detail):
    results.append((name, ok, detail))
    print(f"{'PASS' if ok else 'FAIL'}  {name}: {detail}", flush=True)


rc, out = run(['npx', 'tsc', '--noEmit'], ROOT)
check('typecheck (tsc)', rc == 0, 'exit 0' if rc == 0 else out[:300])
rc, out = run(['npx', 'vitest', 'run'], ROOT)
m = re.search(r'Tests\s+(\d+) passed', out)
want = 363 if phase == 'baseline' else 366
check('app tests (vitest)', bool(m) and int(m[1]) == want and 'failed' not in out.split('Tests')[-1][:40], f"{m[1] if m else '?'} passed, expected {want}")
for name, cmd, cwd, pat, label in [
    ('benchmark of 89 pairs', ['python3', '-I', 'audit_eval.py'], WORLD, r'(\d+)/89 within range', 80),
    ('bloc cases', ['python3', '-I', 'audit_blocs_eval.py'], WORLD, r'(\d+)/31 bloc cases right', 31),
    ('map pairs (1)', ['python3', '-I', 'audit_map_eval.py'], WORLD, r'pairs in the expected class: (\d+)/40', 40),
    ('map utility (2)', ['python3', '-I', 'audit_map_eval.py'], WORLD, r'utility: (\d+)/40', 37),
    ('hold-out of 30 pairs', ['python3', '-I', '-c', "import sys; sys.path.insert(0,'.'); import audit_eval as E, audit_holdout as H; E.BENCH[:] = H.BENCH; E.run()"], WORLD, r'(\d+)/30 within range', 10),
]:
    rc, out = run(cmd, cwd)
    m = re.search(pat, out)
    check(name, bool(m) and int(m[1]) == label, f"{m[1] if m else '?'} expected {label}")
for name, script, cwd in [('embassy tests', 'test_embassy.py', MODEL), ('pulse tests', 'test_pulse.py', WORLD), ('calibration reproduction', 'test_reproduce.py', CAL)] + \
        ([('importance tests', 'test_importance.py', WORLD)] if phase != 'baseline' else []):
    rc, out = run(['python3', '-I', script], cwd)
    check(name, rc == 0 and re.search(r'^OK', out, re.M) is not None, 'OK' if rc == 0 else out[-200:])
if phase != 'baseline':
    try:
        d = json.load(open(os.path.join(ROOT, 'lib', 'data', 'bilateral-relations', 'relations.json')))
        TIES = {'FULL_DIPLOMATIC', 'NONRESIDENT_RELATIONS', 'SHARED_LANGUAGE', 'BILATERAL_TREATIES', 'TRADE_HIGH', 'TRADE_MEDIUM', 'HUMAN_TIES', 'SHARED_FORUM'}
        lens = {len(v) for v in d['pairs'].values()}
        pend = sum(1 for v in d['pairs'].values() if v[7:8] == [1] and abs(v[0] - sum(p for c, p in v[5] if c in TIES)) < 5)
        check('exported file: 8 fields per pair', lens == {8}, f'lengths {sorted(lens)}')
        want_pend = 1845 if phase == 'phase0' else 1844          # phase1: the four new sanctions facts give one pair a recorded position
        check('exported file: pending pairs', pend == want_pend, f'{pend} expected {want_pend}')
        check('exported file: important pairs in meta', d['meta'].get('importantPairs') == 2509, f"{d['meta'].get('importantPairs')} expected 2509")
    except Exception as e:
        check('exported file', False, str(e)[:200])
bad = [r for r in results if not r[1]]
print(f"\n{len(results) - len(bad)}/{len(results)} checks passed" + ('' if not bad else '  -> FAILED: ' + ', '.join(r[0] for r in bad)))
sys.exit(1 if bad else 0)
