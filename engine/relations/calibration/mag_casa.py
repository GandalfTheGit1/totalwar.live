import sys; sys.path.insert(0, ".")
import json
from mag_rec import *
K = 'CASA'
for name in ('A', 'qwen', 'cohere'):
    for run in (1, 2):
        try: L.raw_classify(K, 'complete', name, run)
        except Exception as e: print(name, run, 'FAILED', str(e)[:120])
SETS = {'current': dict(holdFrac=0.0, measureMax=30), 'C1 hold0.5': dict(holdFrac=0.5, measureMax=30), 'C2 max50': dict(holdFrac=0.0, measureMax=50)}
out = {}
for nm, kw in SETS.items():
    loss, viol, rows = evaluate2(K, L.gold_final(K, 'complete'), detail=True, **kw)
    out[nm] = dict(gold=dict(loss=loss, viol=viol))
    print(f'\n##### CASA gold {nm}: loss {loss:.1f}, violations {viol}/{len(CN.ANCHORS)}')
    for e, w, d, note in rows: print(f"   {'FAIL' if e > 0 else 'ok  '} err {e:5.1f}  {d}   [{note[:48]}]")
    for b in ('qwen', 'cohere'):
        ls = [evaluate2(K, rec2(K, b, ra, rb), **kw) for ra in (1, 2) for rb in (1, 2)]
        out[nm][b] = [round(x[0], 1) for x in ls]
        print(f'   realistic A+B({b})+judge, 4 combos: loss {[round(x[0],1) for x in ls]} viol {[x[1] for x in ls]} mean {sum(x[0] for x in ls)/4:.1f}')
json.dump(out, open('mag_casa_results.json', 'w'), indent=1)
ann = annotated(K, L.gold_final(K, 'complete'))
print('\nmeasure pairing (gold):'); [print('  ', f['eventDate'], f['code'], '->', f.get('measureUntil') or 'IN FORCE', '|', f['fact'][:60]) for f in ann if M.is_measure(f)]
with mparams():
    sb = L.prepare(K, ann)
for ds in ('2018-09-15', '2019-06-30', '2021-12-31', '2023-04-15', '2023-07-15', '2023-12-31'):
    print('  ', ds, [(s['code'], s.get('scale', ''), s.get('sides', '')) for s in sb[ds] if s['code'] in ('MEASURES_IN_FORCE', 'NO_RELATIONS', 'AMBASSADOR_ABSENT', 'AMBASSADOR_RESTORED')], 'R=', round(L.R_at(ann, sb, ds)))
