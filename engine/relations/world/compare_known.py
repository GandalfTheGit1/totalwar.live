"""Check the bulk path against the per-pair path on the pairs already scored by the model.

  python3 -I compare_known.py ref    -> per-pair build_states (model/data_cache.json, offline) -> out/known_ref.json
  python3 -I compare_known.py bulk   -> bulk tables (world/world_cache.json)                   -> out/known_bulk.json
  python3 -I compare_known.py diff   -> state-by-state differences
Run 'ref' and 'bulk' as separate processes: the bulk path replaces structure.py's fetchers in memory."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PAIRS = ['ES-MA', 'ES-IL', 'US-CN', 'IN-CA', 'MN-SN', 'AU-CN', 'JP-KR', 'CA-SA', 'SA-QA', 'IL-TR']
OUT = os.path.join(HERE, 'out')


def dump(name, states_of):
    os.makedirs(OUT, exist_ok=True)
    res = {}
    for p in PAIRS:
        a, b = p.split('-')
        st, _ = states_of(a, b)
        res[p] = sorted([s['code'], round(float(s.get('scale', 1.0)), 2), s.get('sides') or s.get('count') or 1] for s in st if s['code'] != 'EMBASSY_HEADS')
    json.dump(res, open(os.path.join(OUT, f'known_{name}.json'), 'w'), indent=1)


if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'ref':
        os.environ['WGE_OFFLINE'] = '1'
        sys.path.insert(0, HERE)
        import bulk as B                     # registry only: countries missing from the model's small list (TR) are registered, the cache is NOT redirected
        cache = B.T.CACHE_FILE
        B.setup()
        B.T.CACHE_FILE = cache
        dump('ref', B.T.build_states)
    elif mode == 'bulk':
        sys.path.insert(0, HERE)
        import bulk as B
        B.Tables().install()
        dump('bulk', B.T.build_states)
    else:
        ref, blk = (json.load(open(os.path.join(OUT, f'known_{n}.json'))) for n in ('ref', 'bulk'))
        same = 0
        for p in PAIRS:
            r, b = {x[0]: x[1:] for x in ref[p]}, {x[0]: x[1:] for x in blk[p]}
            diff = {c: (r.get(c), b.get(c)) for c in sorted(set(r) | set(b)) if r.get(c) != b.get(c)}
            same += not diff
            print(f'{p}: {"identical" if not diff else diff}')
        print(f'{same}/{len(PAIRS)} pairs identical')
