"""Evaluate world/out/pairs.json against audit_trade.py (parts A and B, plus the change against out/pairs_before_wto.json). Nothing is tuned here.

  python3 -I audit_trade_eval.py          exit code 0 when A and B pass
Part C also needs: audit_blocs_eval.py, audit_eval.py (benchmark and hold-out), audit_map_eval.py and calibration/calib_report.py (docs/gemini_trade/run_checks.py runs them all).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audit_trade as P


def load(name):
    return {p['pair']: p for p in json.load(open(os.path.join(HERE, 'out', name)))['pairs']}


def key(k):
    return '-'.join(sorted(k.split('-')))


def codes(p):
    return {c for c, _ in p['states']}


def bit_caused(k):
    """True when the pair's BILATERAL_TREATIES (if any) counts a treaty whose title is investment-only (audit_trade.py: 'BILATERAL_TREATIES caused by a BIT')."""
    if 'BILATERAL_TREATIES' not in codes(load('pairs.json')[k]):
        return False
    import score_all as SA
    SA.B.Tables().install()
    states, log = SA.T.build_states(*k.split('-'))
    ev = next((x.get('evidence', '') for x in states if x['code'] == 'BILATERAL_TREATIES'), '')
    return any(SA.T.INVESTMENT_ONLY.search(t) and not SA.T.OTHER_TREATY.search(t) for t in ev.split('; '))


def main():
    now = load('pairs.json')
    ya = [(k, w, 'FTA_IN_FORCE' in codes(now[key(k)]) or (w == 'pref' and 'PREFERENTIAL_TRADE' in codes(now[key(k)]))) for k, w in P.TRADE_YES]
    na = [(k, not ({'FTA_IN_FORCE', 'PREFERENTIAL_TRADE'} & codes(now[key(k)]))) for k in P.TRADE_NO]
    nyes, nno = sum(1 for *_, ok in ya if ok), sum(1 for _, ok in na if ok)
    a_ok = nyes >= P.YES_NEEDED and nno >= P.NO_NEEDED
    print(f'A. WTO positives {nyes}/{len(ya)} (need {P.YES_NEEDED}), negatives {nno}/{len(na)} (need {P.NO_NEEDED}) -> {"PASS" if a_ok else "FAIL"}')
    for k, w, ok in ya:
        if not ok:
            print('   missing', k, w, sorted(codes(now[key(k)])))
    for k, ok in na:
        if not ok:
            print('   wrongly has', k, sorted(codes(now[key(k)])))
    eu = [k for k in P.BIT_EU if 'INVESTMENT_TREATY' not in codes(now[key(k)]) and not bit_caused(key(k))]
    keep = [k for k in P.BIT_KEEP if 'INVESTMENT_TREATY' in codes(now[key(k)])]
    b_ok = len(eu) == len(P.BIT_EU) and len(keep) >= P.KEEP_NEEDED
    print(f'B. intra-EU pairs without BIT state {len(eu)}/{len(P.BIT_EU)} (need all); non-EU BITs kept {len(keep)}/{len(P.BIT_KEEP)} (need {P.KEEP_NEEDED}) -> {"PASS" if b_ok else "FAIL"}')
    for k in P.BIT_EU:
        if k not in eu:
            print('   intra-EU still has', k, sorted(codes(now[key(k)])))
    for k in P.BIT_KEEP:
        if k not in keep:
            print('   lost', k, sorted(codes(now[key(k)])))
    before = load('pairs_before_wto.json')
    ch = {c: 0 for c in ('FTA_IN_FORCE', 'PREFERENTIAL_TRADE', 'INVESTMENT_TREATY', 'BILATERAL_TREATIES')}
    bands, dr = {}, []
    for k, p in now.items():
        b = before.get(k)
        if not b:
            continue
        for c in ch:
            ch[c] += (c in codes(p)) - (c in codes(b))
        if p['band'] != b['band']:
            bands[(b['band'], p['band'])] = bands.get((b['band'], p['band']), 0) + 1
        dr.append(p['R'] - b['R'])
    print('   pairs carrying each state, now minus before:', ch)
    print(f'   R change: mean {sum(dr)/len(dr):+.2f}, min {min(dr):+.1f}, max {max(dr):+.1f}; pairs whose band changed: {sum(bands.values())}')
    for (x, y), n in sorted(bands.items(), key=lambda t: -t[1])[:8]:
        print(f'      {x} -> {y}: {n}')
    return a_ok and b_ok


if __name__ == '__main__':
    sys.exit(0 if main() else 1)
