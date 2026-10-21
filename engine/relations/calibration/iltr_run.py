"""Validation on the reserved Israel-Turkey episode with the FROZEN model (round 5): new embassy state vs the old one. Nothing is changed in response to the output."""
import sys, json; sys.path.insert(0, '.')
from embassy_eval import *            # mag_env, rec2, old_model, losses, realistic
import anchors_turkey as TK
K = 'ILTR'
L.F.COUNTRIES.setdefault('TR', dict(es='Turquía', en='Turkey', local='Türkiye', lang='tr', qid='Q43'))
L.T.QID.update({'TR': 'Q43'}); L.T.ISO3.update({'TR': 'TUR'}); L.T.MIG.M49.update({'TR': 792})
L.AN.ANCHORS.extend(TK.ANCHORS); L.EPIS[K] = ('IL', 'TR'); VER[K] = 'complete'; L.GOLD.update(json.load(open('gold_turkey.json')))
for name in ('A', 'qwen', 'cohere'):
    for run in (1, 2):
        try: L.raw_classify(K, 'complete', name, run)
        except Exception as e: print(name, run, 'FAILED', str(e)[:120], flush=True)
with old_model():
    go, ro = losses(K, detail=True)
gn, rn = losses(K, detail=True)
print(f'##### RESERVED IL-TR ({len(L.load_facts(K, "complete"))} facts), frozen model')
print(f'GOLD: new loss {gn[0]:.1f} ({gn[1]}/{len(TK.ANCHORS)} violations) | old loss {go[0]:.1f} ({go[1]})')
for (e0, w, d0, note), (e1, _, d1, _) in zip(go[2], gn[2]):
    print(f'   {"FAIL" if e1 > 0 else "ok  "} new {e1:5.1f} | old {e0:5.1f}   {d1}   [{note[:46]}]')
print(f'realistic mean: qwen new {rn["qwen"]:.1f} / old {ro["qwen"]:.1f} | cohere new {rn["cohere"]:.1f} / old {ro["cohere"]:.1f}')
fin = L.gold_final(K, 'complete'); ann = M.pair_with_llm(fin, L.F.llm_json, L.PAIR_PROVIDERS, 'IL', 'TR'); st = L.static_states(K)
print('Wikidata tenures:', {k: [(t['holder'], t['start'], t['end']) for t in v] for k, v in next(s for s in st if s['code'] == 'EMBASSY_HEADS')['tenures'].items()})
for d in ('2018-06-30', '2020-12-31', '2021-12-31', '2022-12-31', '2023-12-31', '2024-12-31'):
    rep = next(s for s in L.T.derive_states('IL', 'TR', ann, st, L.d(d)) if s['code'] == 'EMBASSY_STATUS')
    print('  ', d, ' | '.join(f"{k}: {v['status']} {v['since'] or ''} ({v['source']})" for k, v in rep['sides'].items()))
json.dump(dict(new=dict(gold=gn[0], viol=gn[1], **rn), old=dict(gold=go[0], viol=go[1], **ro)), open('iltr_results.json', 'w'), indent=1)
