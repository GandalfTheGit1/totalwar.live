"""Score the current world/out/pairs.json against audit_benchmark.py."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_benchmark import BENCH

def run(path='out/pairs.json', show=True):
    d = {p['pair']: p for p in json.load(open(path))['pairs']}
    bad = []
    for pair, lo, hi, why in BENCH:
        key = '-'.join(sorted(pair.split('-')))
        p = d.get(key)
        R = p['R'] if p else None
        ok = R is not None and lo <= R <= hi
        if not ok:
            bad.append((key, R, lo, hi, why, [s for s, _ in p['states']] if p else []))
    if show:
        print(f'{len(BENCH) - len(bad)}/{len(BENCH)} within range')
        for key, R, lo, hi, why, st in bad:
            print(f'  {key:6s} R {R if R is None else round(R):>5} want [{lo},{hi}]  {why[:55]:55s} {st}')
    return bad

if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else 'out/pairs.json')
