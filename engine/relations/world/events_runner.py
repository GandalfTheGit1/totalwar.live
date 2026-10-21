"""Events layer (tier 2) for the highest-priority pairs, in batches that can be stopped and resumed.

For each pair of world/out/priority.json not yet done: news + Wikipedia collection and fact extraction (model/flow.py), then two-model classification,
judge, measure pairing, embassy state and re-verification (model/classify_score2.py), with the structural states taken from the same bulk tables as tier 1.
Each pair costs roughly 20-30 LLM calls, a few dozen searches and 3-6 minutes. The run stops on its own when every provider is out of quota
(several consecutive pairs failing with 'failed on all providers'), and the next run picks up where it stopped.

  python3 -I events_runner.py 25          -> next 25 pairs of the priority list
  python3 -I events_runner.py merge       -> world/out/pairs.json with the events results overlaid (R, band, trend, events)"""
import json, os, sys, time, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bulk as B
OUT = os.path.join(HERE, 'out')
DONE = os.path.join(OUT, 'events')
MODEL = os.path.join(HERE, '..', 'model')
STOP_AFTER_QUOTA_FAILS = 3


def run_batch(n):
    tables = B.Tables().install()
    import flow as F, classify_score2 as C
    os.makedirs(DONE, exist_ok=True)
    todo = [p for p, score, _ in json.load(open(os.path.join(OUT, 'priority.json'))) if not os.path.exists(os.path.join(DONE, f'{p}.json'))][:n]
    fails, t0 = 0, time.time()
    for k, pair in enumerate(todo):
        a, b = pair.split('-')
        try:
            v6 = os.path.join(MODEL, f'v6_{pair}.json')
            if not os.path.exists(v6):
                json.dump(F.run(a, b), open(v6, 'w'), ensure_ascii=False, indent=1)
            res = C.run(pair, '_world')
            keep = {k_: res[k_] for k_ in ('pair', 'asOf', 'R', 'band', 'trend', 'trendInfo', 'timeline', 'S_struct', 'S_dyn', 'states', 'embassies', 'warnings', 'topEvents', 'byActor', 'classification')}
            json.dump(dict(keep, eventsAnalysed=True), open(os.path.join(DONE, f'{pair}.json'), 'w'), ensure_ascii=False, indent=1)
            fails = 0
            print(f'[{time.time() - t0:6.0f}s] {k + 1}/{len(todo)} {pair}: R {res["R"]:+.1f} {res["band"]} trend {res["trend"]}', flush=True)
        except Exception as e:
            msg = str(e)
            print(f'[{time.time() - t0:6.0f}s] {pair} FAILED: {msg[:160]}', flush=True)
            if 'failed on all providers' in msg or 'exhausted' in msg:
                fails += 1
                if fails >= STOP_AFTER_QUOTA_FAILS:
                    print('providers out of quota: stopping; run again later to continue', flush=True)
                    break
            else:
                traceback.print_exc()


def merge():
    data = json.load(open(os.path.join(OUT, 'pairs.json')))
    n = 0
    for r in data['pairs']:
        fp = os.path.join(DONE, f'{"-".join(sorted(r["pair"].split("-")))}.json')
        if os.path.exists(fp):
            e = json.load(open(fp))
            r.update(R=e['R'], band=e['band'], trend=e['trend'], S_struct=e.get('S_struct', r.get('S_struct')), S_dyn=e['S_dyn'], eventsAnalysed=True,
                     states=[[s['code'], round(s['value'], 1)] for s in e.get('states', [])] or r['states'],
                     embassies={k: {kk: vv for kk, vv in v.items() if vv} for k, v in (e.get('embassies') or {}).items()} or r['embassies'],
                     claims=e.get('claims', r.get('claims', [])),
                     topEvents=[{k: x.get(k) for k in ('code', 'value', 'actor', 'fact')} for x in e.get('topEvents', [])[:5]], warnings=e.get('warnings', []))
            n += 1
    data['meta']['eventsPairs'] = n
    json.dump(data, open(os.path.join(OUT, 'pairs.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(n, 'pairs with the events layer merged')


if __name__ == '__main__':
    merge() if sys.argv[1:] == ['merge'] else run_batch(int(sys.argv[1]) if len(sys.argv) > 1 else 10)
