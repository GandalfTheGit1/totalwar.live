"""Structural layer for EVERY pair of states (tier 1): data-backed states, embassy state per side from Wikidata, and R from structure only.

No news or LLM step runs here, so R is the structural score (S_dyn = 0) and each pair says so (eventsAnalysed = false). Pairs whose sources are all silent
get coverage 'none': their R = 0 means "no information", not "neutral relationship".
Output: world/out/pairs.json (one record per pair) and world/out/by_country.json (each state's partners sorted by R, for the map)."""
import functools, json, os, sys, time
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bulk as B
T, S, F = B.T, B.T.S, B.F
OUT = os.path.join(HERE, 'out')


def memo_cache():
    """structure.cached() re-reads and rewrites the whole cache file on every call; for 19,000 pairs keep it in memory (writes still go to disk on a miss)."""
    mem = T._cache()
    orig = T.cached

    def cached(key, fn, ttl=86400):
        if key in mem:
            return mem[key][1]
        val = orig(key, fn, ttl)
        mem[key] = [time.time(), val]
        return val
    T.cached = cached
    T.hard_data = functools.lru_cache(None)(T.hard_data)
    T.special_pairs = functools.lru_cache(None)(T.special_pairs)
    T.sanctions_lifted = functools.lru_cache(None)(T.sanctions_lifted)


def coverage(log, states):
    have = dict(relation=bool(log.get('wikidata.diplomacy', {}).get('P530')), embassies=log.get('wikidata.diplomacy', {}).get('residentEmbassySides', 0),
                trade=bool(log.get('wits', {}).get('shares_pct')), human=bool((log.get('un-desa.migration') or {}).get('scale')),
                scored_states=sum(1 for s in states if S.state_contribution(s, F.TODAY)))
    n = have['relation'] + bool(have['embassies']) + have['trade'] + have['human']
    # no data-backed state at all: nothing ties the pair in the sources (R = 0 then means "no recorded ties", shown grey, not "neutral")
    have['level'] = 'none' if not have['scored_states'] else 'low' if n <= 1 else 'medium' if n <= 2 else 'high'
    return have


def score_pair(a, b, today):
    states, log = T.build_states(a, b)
    derived = T.derive_states(a, b, [], states, today)
    merged = T.merge(list(states), derived)
    sc = S.score([], merged, today)
    emb = next((s['sides'] for s in derived if s['code'] == 'EMBASSY_STATUS'), {})
    cids = []
    for s in merged:
        for cid in s.get('claim_ids', [s['claim_id']] if 'claim_id' in s else []):
            if cid not in cids:
                cids.append(cid)
    return dict(pair=f'{a}-{b}', R=sc['R'], band=sc['band'], S_struct=sc['S_struct'], eventsAnalysed=False,
                states=[[c['code'], round(c['value'], 1)] for c in sc['states']],
                embassies={k: {kk: v.get(kk) for kk in ('status', 'since', 'source', 'holder') if v.get(kk)} for k, v in emb.items()},
                claims=cids,
                coverage=coverage(log, merged))


def main(limit=None):
    os.environ.setdefault('WGE_OFFLINE', '1')
    B.setup()
    memo_cache()
    tables = B.Tables().install()
    today = F.TODAY
    codes = B.CODES
    pairs = [(a, b) for i, a in enumerate(codes) for b in codes[i + 1:]][:limit]
    os.makedirs(OUT, exist_ok=True)
    res, fails, t0 = [], [], time.time()
    for k, (a, b) in enumerate(pairs):
        try:
            res.append(score_pair(a, b, today))
        except Exception as e:
            fails.append((f'{a}-{b}', str(e)[:120]))
        if k % 2000 == 1999:
            print(f'[{time.time() - t0:5.0f}s] {k + 1}/{len(pairs)} pairs', flush=True)
    T.save_unreviewed_claims(os.path.join(OUT, 'claims_unreviewed.json'))
    meta = dict(generatedAt=today.isoformat(), states=len(codes), pairs=len(res), failed=len(fails), layer='structural (tier 1): no news / LLM events',
                note='R = S_struct only; coverage.level "none" means no data-backed state ties the pair, so R = 0 is "no recorded ties", not "neutral".',
                treatiesMissingFor=tables.missing)
    json.dump(dict(meta=meta, pairs=res, failures=fails), open(os.path.join(OUT, 'pairs.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    by = {c: [] for c in codes}
    for r in res:
        a, b = r['pair'].split('-')
        for x, y in ((a, b), (b, a)):
            by[x].append([y, r['R'], r['band'], r['coverage']['level']])
    for c in by:
        by[c].sort(key=lambda p: -p[1])
    json.dump(dict(meta=meta, countries={c['code']: dict(nameEs=c['nameEs'], nameEn=c['nameEn'], iso3=c['iso3']) for c in B.REG}, partners=by),
              open(os.path.join(OUT, 'by_country.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'[{time.time() - t0:5.0f}s] {len(res)} pairs scored, {len(fails)} failed', fails[:5])


if __name__ == '__main__':
    main(int(sys.argv[1]) if len(sys.argv) > 1 else None)
