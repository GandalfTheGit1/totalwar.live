import sys; sys.path.insert(0, ".")
import itertools, json
from mag_env import *
import protocol_magnitude_A1 as A1
G = A1.GRID; combos = [dict(holdFrac=h, measureMax=m) for h, m in itertools.product(G['holdFrac'], G['measureMax'])]
gold = {k: L.gold_final(k, VER[k]) for k in VER}
# sanity: holdFrac 0 / max 30 must reproduce the round-1 numbers
res = {}
for c in combos:
    key = '%g|%d' % (c['holdFrac'], c['measureMax'])
    res[key] = {k: evaluate2(k, gold[k], **c) for k in VER}
json.dump(res, open('mag_grid2_gold.json', 'w'), indent=1)
print('hold|max       AUCN        JPKR        ESMA     INCA     QASA')
for k, v in sorted(res.items(), key=lambda kv: kv[1]['AUCN'][0] + kv[1]['JPKR'][0]):
    print(f"{k:10s}{' *' if k == '0|30' else '  '} AU {v['AUCN'][0]:5.1f}/{v['AUCN'][1]}  JP {v['JPKR'][0]:5.1f}/{v['JPKR'][1]}  ES {v['ESMA'][0]:4.1f}/{v['ESMA'][1]}  IN {v['INCA'][0]:4.1f}/{v['INCA'][1]}  QA {v['QASA'][0]:4.1f}/{v['QASA'][1]}")
