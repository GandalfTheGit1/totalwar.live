import sys, random, math, statistics; sys.path.insert(0,'.')
import calib_lib as L, eval_variants as E
C=L.C; KEYS=E.KEYS
def rec2(key,b,ra,rb):
    a_,b_=L.EPIS[key]; facts=L.load_facts(key,'complete')
    k=f'rec2|{key}|{b}|{ra}|{rb}'; c=L._cache()
    if k in c: return c[k]
    A=L.raw_classify(key,'complete','A',ra)['out']; B=L.raw_classify(key,'complete',b,rb)['out']
    def judge(cases):
        v,_=C.tiebreak(a_,b_,cases,C.PROV_C,100); return v
    out=C.reconcile(facts,A,B,judge)[0]; L._put(k,out); return out
BS=sys.argv[1:] or ['qwen','cohere','geminilite']
gt=E.trajectory({k:L.gold_final(k,'complete') for k in KEYS})
print(f"GOLD v2 anchors: loss {sum(gt[k]['loss'] for k in KEYS):.1f}, violations {sum(gt[k]['viol'] for k in KEYS)}/28")
res={}
for b in BS:
    rows=[]
    for ra in (1,2):
        for rb in (1,2):
            fb={k:rec2(k,b,ra,rb) for k in KEYS}; m=E.cls_metrics(fb); tr=E.trajectory(fb)
            rows.append(dict(exact=m['exact'],level=m['level'],mae=m['mae'],nonerec=m['none_recall'],loss=sum(tr[k]['loss'] for k in KEYS),viol=sum(tr[k]['viol'] for k in KEYS),
                             rmse=math.sqrt(sum(E.rmse(tr[k]['R'],gt[k]['R'])**2 for k in KEYS)/2),fails=[(k,d) for k in KEYS for e,w,d,n in tr[k]['rows'] if e>0]))
    res[b]=rows
print('\n2x2 (A run x B run), mean [min..max]      -- v1 before the fixes: qwen loss 22.1/2 viol exact .72 level .81 | cohere 29.4/3 .69 .63 | geminilite 27.5/3 .73 .68')
print(f"{'B':11s} exact          level          MAE pts       NONE recall   anchor loss        violations   RMSE vs gold R")
for b,rows in res.items():
    f=lambda k: f"{statistics.mean(r[k] for r in rows):5.2f} [{min(r[k] for r in rows):.2f}..{max(r[k] for r in rows):.2f}]"
    g=lambda k: f"{statistics.mean(r[k] for r in rows):5.1f} [{min(r[k] for r in rows):.0f}..{max(r[k] for r in rows):.0f}]"
    print(f"{b:11s} {f('exact')}  {f('level')}  {f('mae')}  {f('nonerec')}  {g('loss')}   {g('viol')}   {g('rmse')}")
    seen=set(); 
    for r in rows:
        for x in r['fails']: seen.add(x)
    print(f"{'':11s} anchors violated in at least one combination: {sorted(seen)}")
allf=[(k,i) for k in KEYS for i in range(len(L.load_facts(k,'complete')))]
pf={}
for b in BS:
    fb={k:rec2(k,b,1,1) for k in KEYS}; pf[b]=[]
    for k,i in allf:
        f=fb[k][i]; g=L.gold_of(f); pf[b].append((f['code']==g['code'],abs(E.base(f['code'])-E.base(g['code'])),f['actorLevel']==g['level']))
random.seed(7)
def boot(b1,b2,idx,n=4000):
    ds=[]
    for _ in range(n):
        s=[random.randrange(len(allf)) for _ in allf]; ds.append(sum(pf[b1][j][idx]-pf[b2][j][idx] for j in s)/len(s))
    ds.sort(); return statistics.mean(ds),ds[int(.025*n)],ds[int(.975*n)]
print('\nPaired bootstrap over 48 facts (A run1, B run1): b1 - b2, 95% interval')
for b1,b2 in (('qwen','cohere'),('qwen','geminilite'),('cohere','geminilite')):
    if b1 in BS and b2 in BS:
        for idx,name in ((0,'exact'),(1,'|pts error|'),(2,'level')):
            m,lo,hi=boot(b1,b2,idx); print(f"  {b1:10s} - {b2:10s} {name:12s} {m:+.3f} [{lo:+.3f}, {hi:+.3f}] {'*' if (lo>0 or hi<0) else ''}")
# raw-B stability and A-alone variance
print('\nStability of the raw classifiers (two runs, same code for N of 48 facts) and A alone:')
for name in ['A']+BS:
    same=sum(x['code']==y['code'] for k in KEYS for x,y in zip(L.raw_classify(k,'complete',name,1)['out'],L.raw_classify(k,'complete',name,2)['out']))
    fa={k:E.raw_final(k,name,1) for k in KEYS}; fb={k:E.raw_final(k,name,2) for k in KEYS}; ta,tb=E.trajectory(fa),E.trajectory(fb)
    print(f"  {name:11s} {same}/48 identical; anchor loss run1 {sum(ta[k]['loss'] for k in KEYS):.1f} / run2 {sum(tb[k]['loss'] for k in KEYS):.1f}")
