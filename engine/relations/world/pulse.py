"""Press pulse per pair from the GDELT aggregates, exactly as protocol_gdelt.py defines it (constants are imported from there).

  load()                                    -> {date: {pair: [n, W, Q1w, Q2w, Q3w, Q4w, Gpos, Gneg, toneW]}}
  pulse_at(days, pair, t, live=False)       -> dict(P_change, DELTA, B_recent, B_base, V90, status, ...)    (history: change term only)
  live_table(days, pairs_struct)            -> every pair at TODAY with the change and level terms, ALPHA/BETA fitted as in the protocol
"""
import glob, gzip, json, math, os, sys
from datetime import date, timedelta
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import protocol_gdelt as P

TODAY = date(2026, 10, 20)


def load():
    days = {}
    for fp in sorted(glob.glob(os.path.join(HERE, 'gdelt', 'days', '*.json.gz'))):
        with gzip.open(fp, 'rt') as fh:
            d = json.load(fh)
        days[date.fromisoformat(d['d'])] = d['p']
    return days


def _window(days, pair, t, lo, hi, weighted):
    """Weighted per-day means over available days with lo < age <= hi. Returns (Gp, Gn, V, n_days) or None."""
    sw = swg = swn = swv = 0.0
    n = 0
    for d, pairs in days.items():
        age = (t - d).days
        if not (lo < age <= hi):
            continue
        w = 0.5 ** (age / P.HALF_LIFE) if weighted else 1.0
        row = pairs.get(pair)
        sw += w
        n += 1
        if row:
            swg += w * row[6]
            swn += w * row[7]
            swv += w * row[1]
    if n == 0 or sw == 0:
        return None
    return swg / sw, swn / sw, swv / sw, n


def balance(gp, gn):
    return (gp - gn) / (gp + gn + P.K_DAY)


def pulse_at(days, pair, t, live=False, b0=None):
    rec = _window(days, pair, t, -1, P.RECENT_MAX_AGE, True)           # age 0 included
    base_hi = P.BASE_MAX_AGE_LIVE if live else P.BASE_MAX_AGE_VALIDATION
    base = _window(days, pair, t, P.RECENT_MAX_AGE, base_hi, False)
    out = dict(pair=pair, t=t.isoformat(), status='no pulse', P_change=0.0, DELTA=None, V90=None)
    if rec is None:
        out['why'] = 'no recent days'
        return out
    gp, gn, v, nrec = rec
    v90 = 90 * v
    out.update(V90=round(v90, 1), B_recent=round(balance(gp, gn), 3), nRecentDays=nrec)
    if v90 < P.VMIN:
        out['why'] = 'volume below VMIN'
        return out
    if base is None or base[3] < P.MIN_BASE_DAYS:
        out['why'] = 'baseline too short'
        return out
    bgp, bgn, bv, nbase = base
    if 90 * bv >= P.VMIN:
        b_base = balance(bgp, bgn)
    elif b0 is not None:
        b_base = b0
    else:
        out['why'] = 'baseline volume below VMIN and no global prior'
        return out
    delta = balance(gp, gn) - b_base
    shrink = min(1.0, v90 / (3 * P.VMIN))
    out.update(status='pulse', B_base=round(b_base, 3), DELTA=round(delta, 3), nBaseDays=nbase, shrink=round(shrink, 2),
               P_change=round(max(-P.PCAP, min(P.PCAP, P.GAIN_C * delta * shrink)), 2))
    return out


def global_prior(days, t, live=False):
    """B0: volume-weighted mean of the balance over all pairs in the baseline window."""
    base_hi = P.BASE_MAX_AGE_LIVE if live else P.BASE_MAX_AGE_VALIDATION
    sg = sn = 0.0
    for d, pairs in days.items():
        if P.RECENT_MAX_AGE < (t - d).days <= base_hi:
            for row in pairs.values():
                sg += row[6]
                sn += row[7]
    return (sg - sn) / (sg + sn + P.K_DAY) if (sg + sn) else 0.0


def fit_level(days, struct, exclude=()):
    """ALPHA, BETA by OLS of B_recent on S_struct/100 over pairs with V90_recent >= 3*VMIN (set A window only, i.e. today's recent window)."""
    xs, ys = [], []
    a_days = {d: p for d, p in days.items() if d >= TODAY - timedelta(days=365)}
    keys = set()
    for p in a_days.values():
        keys.update(p)
    for pair in keys:
        if pair in exclude or pair not in struct:
            continue
        rec = _window(a_days, pair, TODAY, -1, P.RECENT_MAX_AGE, True)
        if rec is None or 90 * rec[2] < 3 * P.VMIN:
            continue
        xs.append(struct[pair] / 100.0)
        ys.append(balance(rec[0], rec[1]))
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    beta = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx if sxx else 0.0
    return my - beta * mx, beta, n


def live_table(days, struct, llm_pairs=()):
    """{pair: dict(P, P_change, P_level, ...)} for every pair with data in the recent window, as of TODAY (set A only, for the baseline)."""
    a_days = {d: p for d, p in days.items() if d >= TODAY - timedelta(days=365)}
    alpha, beta, nfit = fit_level(a_days, struct, set(llm_pairs))
    b0 = global_prior(a_days, TODAY, live=True)
    keys = set()
    for p in a_days.values():
        keys.update(p)
    out = {}
    for pair in sorted(keys):
        r = pulse_at(a_days, pair, TODAY, live=True, b0=b0)
        if r['status'] != 'pulse' and r.get('why') != 'baseline too short':
            if r.get('B_recent') is None or r.get('V90') is None or r['V90'] < P.VMIN:
                continue
        if r.get('B_recent') is None or r['V90'] < P.VMIN:
            continue
        shrink = min(1.0, r['V90'] / (3 * P.VMIN))
        level = r['B_recent'] - (alpha + beta * struct.get(pair, 0.0) / 100.0)
        p_change = P.GAIN_C * (r['DELTA'] if r.get('DELTA') is not None else 0.0) * shrink
        p_level = P.GAIN_L * level * shrink
        total = max(-P.PCAP, min(P.PCAP, p_change + p_level))
        if pair in llm_pairs:
            total *= P.LLM_FACTOR
        out[pair] = dict(P=round(total, 2), P_change=round(p_change, 2), P_level=round(p_level, 2), B_recent=r['B_recent'], DELTA=r.get('DELTA'), level=round(level, 3), V90=r['V90'], shrink=round(shrink, 2))
    return out, dict(alpha=round(alpha, 4), beta=round(beta, 4), nFit=nfit, B0=round(b0, 4))
