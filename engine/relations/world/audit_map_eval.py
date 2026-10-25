"""Evaluate world/out/pairs.json against audit_map.py (acceptance (1), (2), (4)). Nothing is tuned here.

  python3 -I audit_map_eval.py baseline   record the utility count BEFORE the change (audit_map_baseline.json)
  python3 -I audit_map_eval.py            full report
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audit_map as M

TIES = {'FULL_DIPLOMATIC', 'NONRESIDENT_RELATIONS', 'SHARED_LANGUAGE', 'BILATERAL_TREATIES', 'INVESTMENT_TREATY', 'TRADE_HIGH', 'TRADE_MEDIUM', 'HUMAN_TIES', 'SHARED_FORUM'}


def split(p):
    t = sum(v for c, v in p['states'] if c in TIES)
    return t, p['R'] - t


def klass(t, v):
    return 'ALLY' if v >= 30 else 'HOSTILE' if v <= -25 else 'NODATA' if t == 0 and abs(v) < 0.05 else 'TIES' if abs(v) < 5 and t > 0 else 'OTHER'


def utility(pairs):
    n = {}
    for c in M.COUNTRIES:
        n[c] = sum(1 for k, p in pairs.items() if c in k.split('-') and abs(split(p)[1]) >= 5)
    return n


def main():
    pairs = {p['pair']: p for p in json.load(open(os.path.join(HERE, 'out', 'pairs.json')))['pairs']}
    u = utility(pairs)
    ok_u = sum(1 for v in u.values() if v >= 5)
    if sys.argv[1:] == ['baseline']:
        json.dump(dict(countriesWith5=ok_u, partners=u), open(os.path.join(HERE, 'audit_map_baseline.json'), 'w'), indent=1)
        print(f'baseline: {ok_u}/40 countries with >= 5 partners |V| >= 5; zero:', [c for c, v in u.items() if v == 0], '| low:', {c: v for c, v in u.items() if 0 < v < 5})
        return
    bad = []
    for pair, want in M.PAIRS:
        k = '-'.join(sorted(pair.split('-')))
        t, v = split(pairs[k])
        got = klass(t, v)
        if got != want:
            bad.append((k, want, got, round(t, 1), round(v, 1), [s for s, _ in pairs[k]['states']]))
    print(f'(1) pairs in the expected class: {40 - len(bad)}/40 (need >= 36) -> {"PASS" if 40 - len(bad) >= 36 else "FAIL"}')
    for b in bad:
        print('    miss', b)
    base = json.load(open(os.path.join(HERE, 'audit_map_baseline.json')))
    print(f'(2) utility: {ok_u}/40 countries with >= 5 non-neutral partners (before: {base["countriesWith5"]}) (need >= 35) -> {"PASS" if ok_u >= 35 else "FAIL"}')
    print('    still low:', {c: v for c, v in u.items() if v < 5}, '| before:', {c: base['partners'][c] for c, v in u.items() if v < 5})
    return ok_u >= 35 and 40 - len(bad) >= 36


if __name__ == '__main__':
    main()
