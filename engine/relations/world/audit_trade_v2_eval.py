"""Evaluate world/out/pairs.json against audit_trade_v2.py (D1-D5 and the bloc cases with their declared amendments). Nothing is tuned here.
  python3 -I audit_trade_v2_eval.py      exit code 0 when D1-D5 and the amended bloc cases hold. The rest of E: docs/gemini_trade/run_checks.py (thresholds read from audit_trade_v2.py)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audit_trade_v2 as P
from audit_blocs import CASES

LEVELS = {'CUSTOMS_UNION', 'FTA_IN_FORCE', 'PREFERENTIAL_TRADE'}


def main():
    pairs = {p['pair']: {c for c, v in p['states'] if abs(v) >= 0.05} for p in json.load(open(os.path.join(HERE, 'out', 'pairs.json')))['pairs']}
    st = lambda k: pairs['-'.join(sorted(k.split('-')))]
    res = {}
    res['D1'] = [(k, 'CUSTOMS_UNION' in st(k) and not ({'FTA_IN_FORCE', 'PREFERENTIAL_TRADE'} & st(k))) for k in P.CU]
    res['D2'] = [(k, 'FTA_IN_FORCE' in st(k) and 'CUSTOMS_UNION' not in st(k)) for k in P.FTA]
    res['D3'] = [(k, 'DEEP_INTEGRATION' in st(k) and not (LEVELS & st(k))) for k in P.EU]
    res['D4'] = [(k, 'PREFERENTIAL_TRADE' in st(k) and not ({'CUSTOMS_UNION', 'FTA_IN_FORCE'} & st(k))) for k in P.AFCFTA]
    res['D5'] = [(k, not (LEVELS & st(k))) for k in P.NEG]
    need = dict(D1=P.NEED['CU'], D2=P.NEED['FTA'], D3=len(P.EU), D4=P.NEED['AFCFTA'], D5=P.NEED['NEG'])
    ok_all = True
    for d, rows in res.items():
        n = sum(1 for _, ok in rows if ok)
        ok = n >= need[d]
        ok_all &= ok
        print(f'{d}. {n}/{len(rows)} (need {need[d]}) -> {"PASS" if ok else "FAIL"}')
        for k, good in rows:
            if not good:
                print('     miss', k, sorted(st(k)))
    bad, rep = [], []
    for pair, state, want, why in CASES:
        s = st(pair)
        if pair in P.GCC_AMEND and state == 'PREFERENTIAL_TRADE':
            state = 'CUSTOMS_UNION'
        have = bool(s & {'FTA_IN_FORCE', 'PREFERENTIAL_TRADE', 'CUSTOMS_UNION'}) if state == 'TRADE_ANY' else state in s
        if have != want:
            (rep if (pair, state) in P.NOT_GATED else bad).append((pair, state, want, why, sorted(s)))
    gated = len(CASES) - sum(1 for c in CASES if (c[0], c[1]) in P.NOT_GATED)
    e_ok = not bad
    ok_all &= e_ok
    print(f'E. bloc cases with amendments: {gated - len(bad)}/{gated} gated hold -> {"PASS" if e_ok else "FAIL"}')
    for b in bad:
        print('     miss', b)
    for r in rep:
        print('     reported, not gated:', r[:2], r[3], r[4])
    return ok_all


if __name__ == '__main__':
    sys.exit(0 if main() else 1)
