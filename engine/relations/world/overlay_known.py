"""Pairs that already went through the events layer (engine/relations/results/scored2_<pair>_run1.json) rescored with the current model and written to
world/out/events/<pair>.json, in the same format as events_runner.py, so `events_runner.py merge` overlays them on the structural layer.
The classified facts are reused as they are (no new LLM call); states, embassy state and re-verification (cached) are recomputed."""
import glob, json, os, sys
from datetime import timedelta
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bulk as B
T, S, F = B.T, B.T.S, B.F
import verify_states as V

RESULTS = os.path.join(HERE, '..', 'results')
DONE = os.path.join(HERE, 'out', 'events')


def rescore(pair, old):
    a, b = pair.split('-')
    today = F.TODAY
    facts = old['classifiedFacts']
    st, _ = T.build_states(a, b)
    facts, vscale, vlog = V.verify(a, b, facts, T.derive_states(a, b, facts, st, today), today)

    def states_at(at):
        sts = T.merge(list(st), T.derive_states(a, b, facts, st, at))
        return [dict(s, scale=s.get('scale', 1.0) * vscale[s['code']]) if s['code'] in vscale else s for s in sts]
    sc = S.score(facts, states_at(today), today)
    before = today - timedelta(days=S.TREND_DAYS)
    delta = round(sc['R'] - S.score(facts, states_at(before), before)['R'], 1)
    trend = 'IMPROVING' if delta >= S.TREND_DELTA else 'DETERIORATING' if delta <= -S.TREND_DELTA else 'STABLE'
    emb = next((s['sides'] for s in states_at(today) if s['code'] == 'EMBASSY_STATUS'), {})
    cids = []
    for s in states_at(today):
        for cid in s.get('claim_ids', [s['claim_id']] if 'claim_id' in s else []):
            if cid not in cids:
                cids.append(cid)
    return dict(pair=pair, asOf=today.isoformat(), R=sc['R'], band=sc['band'], trend=trend, trendInfo=dict(delta=delta, days=S.TREND_DAYS),
                S_struct=sc['S_struct'], S_dyn=sc['S_dyn'], states=[dict(code=c['code'], value=c['value']) for c in sc['states']],
                embassies={k: {kk: v.get(kk) for kk in ('status', 'since', 'source', 'holder')} for k, v in emb.items()},
                claims=cids,
                warnings=[f"{v['kind']} since {v['since']}: {v.get('reason', '')}" for v in vlog if v['status'] == 'UNKNOWN'],
                topEvents=[{k: e.get(k) for k in ('code', 'value', 'actor', 'fact')} for e in sc['events'][:8]], eventsAnalysed=True)


import score_all as SA

if __name__ == '__main__':
    B.setup()
    SA.memo_cache()
    B.Tables().install()
    os.makedirs(DONE, exist_ok=True)
    for fp in sorted(glob.glob(os.path.join(RESULTS, 'scored2_*_run1.json'))):
        pair = os.path.basename(fp)[len('scored2_'):-len('_run1.json')]
        key = '-'.join(sorted(pair.split('-')))
        r = rescore(pair, json.load(open(fp)))
        r['pair'] = key
        json.dump(r, open(os.path.join(DONE, f'{key}.json'), 'w'), ensure_ascii=False, indent=1)
        print(f"{key}: R {r['R']:+.1f} {r['band']} trend {r['trend']}")
