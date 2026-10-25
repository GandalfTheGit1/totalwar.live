"""Evaluate world/out/pairs.json against audit_trade_v5.py.  python3 -I audit_trade_v5_eval.py   (exit 0 when it holds)"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audit_trade_v5 as P

pairs = {p['pair']: {c for c, v in p['states'] if abs(v) >= 0.05} for p in json.load(open(os.path.join(HERE, 'out', 'pairs.json')))['pairs']}
st = lambda k: pairs['-'.join(sorted(k.split('-')))]
pref = [(k, 'PREFERENTIAL_TRADE' in st(k) and not ({'CUSTOMS_UNION', 'FTA_IN_FORCE'} & st(k))) for k in P.COMESA_PREF]
uz = 'FTA_IN_FORCE' in st(P.UZ) and 'CUSTOMS_UNION' not in st(P.UZ)
keep = [(k, 'CUSTOMS_UNION' in st(k)) for k in P.CU_KEEP]
ok = all(g for _, g in pref) and uz and sum(g for _, g in keep) >= P.CU_KEEP_NEEDED
print(f'COMESA pairs preferential {sum(g for _, g in pref)}/{len(pref)} (need all); RU-UZ FTA {uz}; genuine customs unions kept {sum(g for _, g in keep)}/{len(keep)} (need {P.CU_KEEP_NEEDED}) -> {"PASS" if ok else "FAIL"}')
for k, g in pref + keep:
    if not g:
        print('   miss', k, sorted(st(k)))
sys.exit(0 if ok else 1)
