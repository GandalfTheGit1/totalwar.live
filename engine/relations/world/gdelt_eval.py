"""Evaluate the press pulse against protocol_gdelt.py (checks a, b, c). Nothing is tuned here: it reports and applies the adoption rule.

  python3 -I gdelt_eval.py history    development and reserved sign checks (change term, validation baseline)
  python3 -I gdelt_eval.py live       live pulse for all pairs, hold-out and benchmark scored with and without it
"""
import json, os, sys
from datetime import date
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import protocol_gdelt as P
import pulse as PU


def sign_checks(days, checks, controls, title):
    print(f'\n== {title}')
    hits = 0
    rows = []
    for pair, ds, sign in checks:
        t = date.fromisoformat(ds)
        b0 = PU.global_prior(days, t)
        r = PU.pulse_at(days, pair, t, b0=b0)
        ok = r['status'] == 'pulse' and abs(r['DELTA']) >= 0.05 and (r['DELTA'] > 0) == (sign > 0)
        hits += ok
        rows.append((pair, ds, sign, r, ok))
        print(f"  {'HIT ' if ok else 'miss'} {pair} {ds} want {'+' if sign > 0 else '-'}  " +
              (f"DELTA {r['DELTA']:+.2f} (recent {r['B_recent']:+.2f} vs base {r['B_base']:+.2f}) V90 {r['V90']} P_change {r['P_change']:+.1f}" if r['status'] == 'pulse' else f"no pulse: {r.get('why')} V90 {r.get('V90')}"))
    cok = 0
    for pair, ds in controls:
        t = date.fromisoformat(ds)
        r = PU.pulse_at(days, pair, t, b0=PU.global_prior(days, t))
        ok = abs(r['P_change']) <= 3
        cok += ok
        print(f"  {'ctl ok ' if ok else 'ctl BAD'} {pair} {ds} P_change {r['P_change']:+.1f} ({r['status']})")
    return hits, len(checks), cok, len(controls)


def history():
    days = PU.load()
    d_hits, d_n, d_c, d_cn = sign_checks(days, P.DEV_CHECKS, P.DEV_CONTROLS, 'DEVELOPMENT sign checks')
    r_hits, r_n, r_c, r_cn = sign_checks(days, P.RESERVED_CHECKS, P.RESERVED_CONTROLS, 'RESERVED sign checks')
    a = d_hits >= 11 and d_c == d_cn
    b = r_hits >= 5 and r_c == r_cn
    print(f'\n(a) development {d_hits}/{d_n} hits (need >= 11), controls {d_c}/{d_cn}  -> {"PASS" if a else "FAIL"}')
    print(f'(b) reserved    {r_hits}/{r_n} hits (need >= 5),  controls {r_c}/{r_cn}  -> {"PASS" if b else "FAIL"}')
    json.dump(dict(dev=[d_hits, d_n, d_c, d_cn], reserved=[r_hits, r_n, r_c, r_cn], a=a, b=b), open(os.path.join(HERE, 'out', 'gdelt_history.json'), 'w'))
    return a, b


def live():
    days = PU.load()
    data = json.load(open(os.path.join(HERE, 'out', 'pairs.json')))
    pairs = {p['pair']: p for p in data['pairs']}
    struct = {k: p['S_struct'] for k, p in pairs.items()}
    llm = {k for k, p in pairs.items() if p.get('eventsAnalysed')}
    table, fit = PU.live_table(days, struct, llm)
    print('fit', fit, '| pairs with a live pulse:', len(table), '| of', len(pairs))
    json.dump(dict(fit=fit, pulse=table), open(os.path.join(HERE, 'out', 'gdelt_live.json'), 'w'), separators=(',', ':'))
    import audit_benchmark as AB, audit_holdout as AH

    def score(bench, use):
        ok, bad = 0, []
        for pair, lo, hi, why in bench:
            key = '-'.join(sorted(pair.split('-')))
            p = pairs[key]
            R = p['R'] + (table.get(key, {}).get('P', 0.0) if use else 0.0)
            R = max(-200, min(200, R))
            if lo <= R <= hi:
                ok += 1
            else:
                bad.append((key, round(R), lo, hi))
        return ok, bad
    out = {}
    for name, bench in (('hold-out (30)', AH.BENCH), ('benchmark (89)', AB.BENCH)):
        o0, _ = score(bench, False)
        o1, bad = score(bench, True)
        out[name] = (o0, o1)
        print(f'{name}: in range without pulse {o0}, with pulse {o1}  (of {len(bench)})')
    c = out['hold-out (30)'][1] >= 13 and out['benchmark (89)'][1] >= 79
    big = [(k, v['P']) for k, v in table.items() if abs(v['P']) > 20 * v['V90'] / (3 * P.VMIN) + 1e-6 and v['V90'] < 3 * P.VMIN]
    print(f'(c) live: hold-out >= 13 and benchmark >= 79 -> {"PASS" if c else "FAIL"}   (d) shrink respected: {"PASS" if not big else big[:5]}')
    return c


if __name__ == '__main__':
    history() if sys.argv[1:] == ['history'] else live()
