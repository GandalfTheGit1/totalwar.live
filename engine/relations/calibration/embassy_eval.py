"""Round 5: embassy state, new (embassy.py) vs old (structure_v6.py: event-derived, 36-month cut). Gold labels and the realistic pipeline. No parameter is changed."""
import sys, os, json, contextlib; sys.path.insert(0, '.')
from mag_rec import *
import structure_v6 as T6

@contextlib.contextmanager
def old_model():
    new = L.T.derive_states
    L.T.derive_states = T6.derive_states
    try: yield
    finally: L.T.derive_states = new

def realistic(key, b, ra, rb):
    legacy = f'rec2|{key}|{b}|{ra}|{rb}'                  # ES-MA / IN-CA were cached by eval_2x2.py under this key (complete facts)
    c = L._cache()
    return c[legacy] if legacy in c else rec2(key, b, ra, rb)

def losses(key, detail=False):
    g = evaluate2(key, L.gold_final(key, VER[key]), detail=detail)
    r = {b: sum(evaluate2(key, realistic(key, b, ra, rb))[0] for ra in (1, 2) for rb in (1, 2)) / 4 for b in ('qwen', 'cohere')}
    return g, r

if __name__ == '__main__':
    keys = sys.argv[1:] or ['ESMA', 'INCA', 'AUCN', 'QASA', 'JPKR', 'CASA']
    res = {}
    for key in keys:
        with old_model():
            go, ro = losses(key, detail=True)
        gn, rn = losses(key, detail=True)
        res[key] = dict(old=dict(gold=go[0], viol=go[1], **ro), new=dict(gold=gn[0], viol=gn[1], **rn))
        print(f'{key}: gold {go[0]:6.1f} ({go[1]}) -> {gn[0]:6.1f} ({gn[1]}) | realistic qwen {ro["qwen"]:6.1f} -> {rn["qwen"]:6.1f} | cohere {ro["cohere"]:6.1f} -> {rn["cohere"]:6.1f}', flush=True)
        for (e0, w, d0, note), (e1, _, d1, _) in zip(go[2], gn[2]):
            if e0 > 0 or e1 > 0: print(f'      {"FAIL" if e1 > 0 else "ok  "} new {e1:5.1f}  old {e0:5.1f}   {d1}   [{note[:40]}]')
    json.dump(res, open(f'embassy_eval_{"_".join(keys)}.json', 'w'), indent=1)
