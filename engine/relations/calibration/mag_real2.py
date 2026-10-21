import sys; sys.path.insert(0, ".")
from mag_rec import *
CAND = dict(holdFrac=0.5, measureMax=30); CUR = dict(holdFrac=0.0, measureMax=30)
tot = {}
for key in ('AUCN', 'JPKR'):
    for b in ('qwen', 'cohere'):
        cur, cand = [], []
        for ra in (1, 2):
            for rb in (1, 2):
                fin = rec2(key, b, ra, rb); cur.append(evaluate2(key, fin, **CUR)[0]); cand.append(evaluate2(key, fin, **CAND)[0])
        tot[(key, b)] = (sum(cur) / 4, sum(cand) / 4)
        print(key, b, 'current', [round(x, 1) for x in cur], 'mean %.1f' % (sum(cur) / 4), '| hold0.5', [round(x, 1) for x in cand], 'mean %.1f' % (sum(cand) / 4))
for key in ('AUCN', 'JPKR'):
    for nm, kw in (('current', CUR), ('hold0.5', CAND)):
        loss, viol, rows = evaluate2(key, L.gold_final(key, VER[key]), detail=True, **kw)
        print(f'\n{key} gold {nm}: loss {loss:.1f}'); [print('   FAIL', f'{e:5.1f}', d, '|', n[:50]) for e, w, d, n in rows if e > 0]
