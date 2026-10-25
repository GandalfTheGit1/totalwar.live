import sys, json, math, time; sys.path.insert(0,'.')
import calib_lib as L
import anchors_holdout as H
L.AN.ANCHORS.extend(H.ANCHORS); L.EPIS['AUCN']=('AU','CN'); L.GOLD.update(json.load(open('gold_holdout.json')))
import eval_variants as E
E.KEYS=('AUCN',); KEYS=('AUCN',)
S,C=L.S,L.C
t0=time.time()
def log(m): print(f'[{time.time()-t0:4.0f}s] {m}',flush=True)
# 1) classifications (cached in cls_cache_v2.json under the AUCN key)
for ver in ('complete','auto'):
    for name in ('A','qwen','cohere'):
        for run in (1,2):
            try: L.raw_classify('AUCN',ver,name,run)
            except Exception as e: log(f'{name} {ver} run{run} FAILED {str(e)[:100]}')
    log(f'raw classifications done for {ver}')
def rec2(ver,b,ra,rb):
    a_,b_=L.EPIS['AUCN']; facts=L.load_facts('AUCN',ver); k=f'rec2|AUCN|{ver}|{b}|{ra}|{rb}'; c=L._cache()
    if k in c: return c[k]
    A=L.raw_classify('AUCN',ver,'A',ra)['out']; B=L.raw_classify('AUCN',ver,b,rb)['out']
    out=C.reconcile(facts,A,B,lambda cases: C.tiebreak(a_,b_,cases,C.PROV_C,100)[0])[0]; L._put(k,out); return out
def traj(fin):
    sb=L.prepare('AUCN',fin); loss,viol,rows=L.eval_anchors('AUCN',fin,sb,detail=True)
    R={ds:L.R_at(fin,sb,ds) for ds in L.anchor_dates('AUCN')}; return loss,viol,rows,R,sb
res={}
for ver in ('complete','auto'):
    gold=L.gold_final('AUCN',ver); res[(ver,'gold')]=traj(gold)
    for b in ('qwen','cohere'):
        for ra in (1,2):
            for rb in (1,2):
                fin=rec2(ver,b,ra,rb); res[(ver,f'{b} A{ra}B{rb}')]=traj(fin)
json.dump({'|'.join(k):dict(loss=v[0],viol=v[1],R=v[3]) for k,v in res.items()},open('holdout_results.json','w'),indent=1)
for ver in ('complete','auto'):
    loss,viol,rows,R,sb=res[(ver,'gold')]
    print(f'\n##### HELD-OUT AU-CN ({ver} facts: {len(L.load_facts("AUCN",ver))}) -- GOLD labels, frozen model, default parameters: loss {loss:.1f}, violations {viol}/{len(H.ANCHORS)}')
    for e,w,desc,note in rows: print(f"   {'FAIL' if e>0 else 'ok  '} w{w} err {e:5.1f}  {desc}   [{note[:50]}]")
    print('   R curve (gold):',{k:round(v) for k,v in sorted(R.items()) if k in [a[3] for a in H.ANCHORS if a[1]=='band']})
    for b in ('qwen','cohere'):
        ls=[res[(ver,f'{b} A{ra}B{rb}')] for ra in (1,2) for rb in (1,2)]
        print(f'   realistic A+B({b})+judge, 4 combos: loss {[round(x[0],1) for x in ls]}, violations {[x[1] for x in ls]}')
