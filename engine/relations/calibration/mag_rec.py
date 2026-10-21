import sys; sys.path.insert(0, ".")
from mag_env import *
C = L.C
def rec2(key, b, ra, rb):
    a_, b_ = L.EPIS[key]; ver = VER[key]; facts = L.load_facts(key, ver); k = f'rec2|{key}|{ver}|{b}|{ra}|{rb}'; c = L._cache()
    if k in c: return c[k]
    A = L.raw_classify(key, ver, 'A', ra)['out']; B = L.raw_classify(key, ver, b, rb)['out']
    out = C.reconcile(facts, A, B, lambda cases: C.tiebreak(a_, b_, cases, C.PROV_C, 100)[0])[0]; L._put(k, out); return out
CAND = dict(measureMax=50, fadeHL=365, measureFull=24); CUR = P.CURRENT
