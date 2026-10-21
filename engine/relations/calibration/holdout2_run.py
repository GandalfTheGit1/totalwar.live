"""Validation on the Qatar episode with the FROZEN model. No parameter, catalog or code is changed in response to the output."""
import os, sys, json, math, time; sys.path.insert(0,'.'); sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','model'))
import calib_lib as L, anchors_qatar as Q, measures as M
L.AN.ANCHORS.extend(Q.ANCHORS); L.EPIS['QASA']=('SA','QA'); L.GOLD.update(json.load(open('gold_qatar.json')))
import eval_variants as E
import structure_v4 as T4                                   # the model as it was before this round (no standing measures, no severed-relations state)
E.KEYS=('QASA',); C=L.C; K='QASA'
def prep_old(final):
    a,b=L.EPIS[K]; st=L.static_states(K); return {ds: T4.merge(list(st), T4.derive_states(a,b,final,st,L.d(ds))) for ds in L.anchor_dates(K)}
def run_traj(fin, old=False):
    sb=prep_old(fin) if old else L.prepare(K,fin)
    loss,viol,rows=L.eval_anchors(K,fin,sb,detail=True); R={ds:L.R_at(fin,sb,ds) for ds in L.anchor_dates(K)}
    return loss,viol,rows,R,sb
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
print(f'##### HELD-OUT #2 SA-QA (12 facts), FROZEN MODEL, default parameters')
print(f'GOLD labels: NEW model loss {loss:.1f}, violations {viol}/14   |   model as of before this round: loss {lo:.1f}, violations {vo}/14')
for (e,w,desc,note),(e2,_,_,_) in zip(rows,ro):
    print(f"   {'FAIL' if e>0 else 'ok  '} err {e:5.1f} (before: {e2:5.1f})  {desc}   [{note[:48]}]")
print('\nstates in force (new model, gold):')
for ds in ('2017-05-01','2017-06-30','2018-06-30','2019-06-30','2020-06-30','2021-03-15','2022-03-01'):
    print('  ',ds,[(s['code'],s.get('scale',''),s.get('sides','')) for s in sb[ds] if s['code'] in ('NO_RELATIONS','MEASURES_IN_FORCE','AMBASSADOR_ABSENT','FULL_DIPLOMATIC')])
print('\nR curve (new, gold):',{k:round(v) for k,v in sorted(R.items()) if k in [a[3] for a in Q.ANCHORS if a[1]=='band']})
print('R curve (old, gold):',{k:round(v) for k,v in sorted(Ro.items()) if k in [a[3] for a in Q.ANCHORS if a[1]=='band']})
for b in ('qwen','cohere'):
    ls=[res[f'{b} A{ra}B{rb}'] for ra in (1,2) for rb in (1,2)]
    print(f"realistic A+B({b})+judge, 4 combos: NEW loss {[round(x[0][0],1) for x in ls]} viol {[x[0][1] for x in ls]} | OLD loss {[round(x[1][0],1) for x in ls]} viol {[x[1][1] for x in ls]}")
json.dump({n:dict(new=dict(loss=v[0][0],viol=v[0][1],R=v[0][3]),old=dict(loss=v[1][0],viol=v[1][1],R=v[1][3])) for n,v in res.items()},open('holdout2_results.json','w'),indent=1)
