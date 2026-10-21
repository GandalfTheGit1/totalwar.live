import sys; sys.path.insert(0, ".")
import itertools, json, math
from mag_env import *
G = P.GRID; combos = [dict(measureMax=a, fadeHL=b, measureFull=c) for a, b, c in itertools.product(G['measureMax'], G['fadeHL'], G['measureFull'])]
gold = {k: L.gold_final(k, VER[k]) for k in VER}
res = {}
for c in combos:
    key = '%d|%d|%d' % (c['measureMax'], c['fadeHL'], c['measureFull'])
    res[key] = {k: evaluate(k, gold[k], **c) for k in VER}
json.dump(res, open('mag_grid_gold.json', 'w'), indent=1)
cur = '30|365|24'
print('combo(max|hl|full)   AUCN loss/viol   JPKR loss/viol   ESMA  INCA  QASA')
for k, v in sorted(res.items(), key=lambda kv: kv[1]['AUCN'][0] + kv[1]['JPKR'][0]):
    print(f"{k:12s}{' *' if k == cur else '  '} AU {v['AUCN'][0]:5.1f}/{v['AUCN'][1]}   JP {v['JPKR'][0]:5.1f}/{v['JPKR'][1]}   ES {v['ESMA'][0]:4.1f}/{v['ESMA'][1]} IN {v['INCA'][0]:4.1f}/{v['INCA'][1]} QA {v['QASA'][0]:4.1f}/{v['QASA'][1]}")
