import sys; sys.path.insert(0, ".")
from mag_env import *
C = L.C
def rec2(key, b, ra, rb):
    a_, b_ = L.EPIS[key]; ver = VER[key]; facts = L.load_facts(key, ver); k = f'rec2|{key}|{ver}|{b}|{ra}|{rb}'; c = L._cache()
    if k in c: return c[k]
    A = L.raw_classify(key, ver, 'A', ra)['out']; B = L.raw_classify(key, ver, b, rb)['out']
    out = C.reconcile(facts, A, B, lambda cases: C.tiebreak(a_, b_, cases, C.PROV_C, 100)[0])[0]; L._put(k, out); return out
CAND = dict(measureMax=50, fadeHL=365, measureFull=24); CUR = P.CURRENT
for key in ('AUCN', 'JPKR'):
    for b in ('qwen', 'cohere'):
        cur, cand = [], []
        for ra in (1, 2):
            for rb in (1, 2):
                fin = rec2(key, b, ra, rb); cur.append(evaluate(key, fin, **CUR)); cand.append(evaluate(key, fin, **CAND))
        print(key, b, 'current loss', [round(x[0], 1) for x in cur], 'mean %.1f' % (sum(x[0] for x in cur) / 4), '| cand50 loss', [round(x[0], 1) for x in cand], 'mean %.1f' % (sum(x[0] for x in cand) / 4))
for key in ('AUCN', 'JPKR'):
    for nm, kw in (('current', CUR), ('cand50', CAND)):
        with mparams(**kw):
            fin = L.gold_final(key, VER[key]); sb = L.prepare(key, fin); loss, viol, rows = L.eval_anchors(key, fin, sb, detail=True)
        print(f'\n{key} gold {nm}: loss {loss:.1f}'); [print('   FAIL', f'{e:5.1f}', d, '|', n[:50]) for e, w, d, n in rows if e > 0]
