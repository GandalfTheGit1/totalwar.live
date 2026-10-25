"""Check world/out/pairs.json against audit_blocs.py."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_blocs import CASES

def run(path='out/pairs.json'):
    d = {p['pair']: {s for s, v in p['states'] if abs(v) >= 0.05} for p in json.load(open(path))['pairs']}
    bad = []
    for pair, state, want, why in CASES:
        st = d.get(pair, set())
        have = bool(st & {'FTA_IN_FORCE', 'PREFERENTIAL_TRADE'}) if state == 'TRADE_ANY' else state in st
        if have != want:
            bad.append((pair, state, want, why, sorted(st)))
    print(f'{len(CASES) - len(bad)}/{len(CASES)} bloc cases right')
    for pair, state, want, why, st in bad:
        print(f'  {pair:6s} {state:19s} want {"present" if want else "absent ":7s} {why[:50]:50s} {st}')
    return bad

if __name__ == '__main__':
    run(*sys.argv[1:2])
