"""Validation on the Japan-South Korea episode with the FROZEN model. Nothing is changed in response to the output."""
import os, sys, json, math; sys.path.insert(0,'.'); sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','model'))
import calib_lib as L, anchors_japan as J, measures as M
K='JPKR'
L.F.COUNTRIES.setdefault('JP',dict(es='Japón',en='Japan',local='Japan',lang='ja',qid='Q17')); L.F.COUNTRIES.setdefault('KR',dict(es='Corea del Sur',en='South Korea',local='South Korea',lang='ko',qid='Q884'))
L.T.QID.update({'JP':'Q17','KR':'Q884'}); L.T.ISO3.update({'JP':'JPN','KR':'KOR'}); L.T.MIG.M49.update({'JP':392,'KR':410})
L.AN.ANCHORS.extend(J.ANCHORS); L.EPIS[K]=('JP','KR'); L.GOLD.update(json.load(open('gold_japan.json')))
import eval_variants as E; E.KEYS=(K,); C=L.C
import structure_v4 as T4
def prep_old(final):
    a,b=L.EPIS[K]; st=L.static_states(K); return {ds: T4.merge(list(st), T4.derive_states(a,b,final,st,L.d(ds))) for ds in L.anchor_dates(K)}
def run_traj(fin, old=False):
    sb=prep_old(fin) if old else L.prepare(K,fin)
    loss,viol,rows=L.eval_anchors(K,fin,sb,detail=True); return loss,viol,rows,{ds:L.R_at(fin,sb,ds) for ds in L.anchor_dates(K)},sb
for name in ('A','qwen','cohere'):
    for run in (1,2): L.raw_classify(K,'auto',name,run)
def rec2(b,ra,rb):
    a_,b_=L.EPIS[K]; facts=L.load_facts(K,'auto'); k=f'rec2|{K}|auto|{b}|{ra}|{rb}'; c=L._cache()
    if k in c: return c[k]
    A=L.raw_classify(K,'auto','A',ra)['out']; B=L.raw_classify(K,'auto',b,rb)['out']
    out=C.reconcile(facts,A,B,lambda cases: C.tiebreak(a_,b_,cases,C.PROV_C,100)[0])[0]; L._put(k,out); return out
variants=[('gold',L.gold_final(K,'auto'))]+[(f'{b} A{ra}B{rb}',rec2(b,ra,rb)) for b in ('qwen','cohere') for ra in (1,2) for rb in (1,2)]
res={n:(run_traj(f),run_traj(f,old=True)) for n,f in variants}
(loss,viol,rows,R,sb),(lo,vo,ro,Ro,sbo)=res['gold']
n=len(J.ANCHORS)
print(f'##### HELD-OUT #3 JP-KR (28 facts), FROZEN MODEL, default parameters')
print(f'GOLD labels: NEW model loss {loss:.1f}, violations {viol}/{n}   |   model as of before this round (no standing measures): loss {lo:.1f}, violations {vo}/{n}')
for (e,w,desc,note),(e2,_,_,_) in zip(rows,ro): print(f"   {'FAIL' if e>0 else 'ok  '} err {e:5.1f} (before: {e2:5.1f})  {desc}   [{note[:46]}]")
bands=[a[3] for a in J.ANCHORS if a[1]=='band']
print('\nR curve new/gold:',{k:round(v) for k,v in sorted(R.items()) if k in bands}); print('R curve old/gold:',{k:round(v) for k,v in sorted(Ro.items()) if k in bands})
ann=M.pair_with_llm(L.gold_final(K,'auto'),L.F.llm_json,L.PAIR_PROVIDERS,'JP','KR')
print('\nMeasure pairing (gold):'); [print(f"   {f['eventDate']} {f['code']:15s} {f['actor']:3s} -> {f.get('measureUntil') or 'STILL IN FORCE'}  | {f['fact'][:60]}") for f in ann if M.is_measure(f)]
for ds in ('2019-06-15','2019-09-15','2020-12-31','2021-12-31','2022-12-31','2023-06-30','2023-12-31'): print('  ',ds,[(s['code'],s.get('scale','')) for s in sb[ds] if s['code'] in ('MEASURES_IN_FORCE','NO_RELATIONS','AMBASSADOR_ABSENT')])
for b in ('qwen','cohere'):
    ls=[res[f'{b} A{ra}B{rb}'] for ra in (1,2) for rb in (1,2)]
    print(f"realistic A+B({b})+judge, 4 combos: NEW loss {[round(x[0][0],1) for x in ls]} viol {[x[0][1] for x in ls]} | OLD loss {[round(x[1][0],1) for x in ls]} viol {[x[1][1] for x in ls]}")
json.dump({nm:dict(new=dict(loss=v[0][0],viol=v[0][1],R=v[0][3]),old=dict(loss=v[1][0],viol=v[1][1],R=v[1][3])) for nm,v in res.items()},open('holdout3_results.json','w'),indent=1)
