"""Compare classifier variants against the frozen gold labels and the frozen anchors."""
import json, math, sys
sys.path.insert(0, '.')
import calib_lib as L

S, C = L.S, L.C
KEYS = ('ESMA', 'INCA')
sign = C.sign
base = lambda c: S.EVENTS[c][1]


def raw_final(key, name, run):
    facts = L.load_facts(key, 'complete')
    out = L.raw_classify(key, 'complete', name, run)['out']
    fin = []
    for f, x in zip(facts, out):
        fin.append(dict(f, code=x['code'], actor=x['actor'] or f['actor'],
                        actorLevel='NON_GOV' if f.get('actorKind') == 'non-government' else x['actorLevel'], coreInterest=x['coreInterest']))
    return fin


def rec_final(key, bname, run):
    return L.reconciled(key, 'complete', bname, run)['final']


def cls_metrics(finals_by_key):
    n = ex = sg = lv = nn = nn_ok = amb_n = amb_ok = 0
    mae = 0.0
    nongold_none = nongold_none_hit = 0
    for key, fin in finals_by_key.items():
        for f in fin:
            g = L.gold_of(f)
            n += 1
            hit = f['code'] == g['code']
            ex += hit
            sg += sign(f['code']) == sign(g['code'])
            lv += f['actorLevel'] == g['level']
            mae += abs(base(f['code']) - base(g['code']))
            if g['amb']:
                amb_n += 1
                amb_ok += hit
            if g['code'] == 'NONE':
                nn += 1
                nn_ok += f['code'] == 'NONE'
            else:
                nongold_none += 1
                nongold_none_hit += f['code'] != 'NONE'
    return dict(n=n, exact=ex / n, sign=sg / n, level=lv / n, mae=mae / n, none_recall=nn_ok / max(1, nn), nonnone_recall=nongold_none_hit / max(1, nongold_none),
                exact_unamb=(ex - amb_ok) / max(1, n - amb_n))


def trajectory(finals_by_key, p=None):
    p = p or L.AN.DEFAULTS
    out = {}
    for key, fin in finals_by_key.items():
        sb = L.prepare(key, fin)
        with L.params(p['dynScale'], p['hlScale'], p['kDyn'], p['declared']):
            loss, viol, rows = L.eval_anchors(key, fin, sb, detail=True)
            R = {ds: L.R_at(fin, sb, ds) for ds in L.anchor_dates(key)}
        out[key] = dict(loss=loss, viol=viol, R=R, rows=rows)
    return out


def rmse(Ra, Rb):
    ds = [k for k in Ra if k in Rb]
    return math.sqrt(sum((Ra[k] - Rb[k]) ** 2 for k in ds) / max(1, len(ds)))


def variant_table(finals_fn, label, gold_traj, runs=(1, 2)):
    rows = []
    per_run = []
    for r in runs:
        try:
            fb = {k: finals_fn(k, r) for k in KEYS}
        except Exception as e:
            rows.append(f'{label} run{r}: unavailable ({str(e)[:70]})')
            continue
        m, tr = cls_metrics(fb), trajectory(fb)
        per_run.append((fb, m, tr))
    return per_run


if __name__ == '__main__':
    gold = {k: L.gold_final(k, 'complete') for k in KEYS}
    gt = trajectory(gold)
    print(f"GOLD       anchors loss {sum(gt[k]['loss'] for k in KEYS):.1f}, violations {sum(gt[k]['viol'] for k in KEYS)}/28")
    summary = {}
    variants = [('A alone (Gemini 2.5 Flash)', lambda k, r: raw_final(k, 'A', r))]
    for b in ('cohere', 'qwen', 'geminilite', 'nemotron'):
        variants.append((f'raw B = {b}', (lambda b: lambda k, r: raw_final(k, b, r))(b)))
        variants.append((f'A+B({b})+judge', (lambda b: lambda k, r: rec_final(k, b, r))(b)))
    print(f"\n{'variant':30s} run | n  exact(all/unamb) sign  level  MAEpts NONE-rec nonNONE-rec | loss viol  RMSE-vs-gold-R | runs agree(code)  R-RMSE between runs")
    for label, fn in variants:
        pr = variant_table(fn, label, gt)
        for i, (fb, m, tr) in enumerate(pr):
            rm = math.sqrt(sum(rmse(tr[k]['R'], gt[k]['R']) ** 2 for k in KEYS) / 2)
            print(f"{label:30s} {i + 1:3d} | {m['n']:2d} {m['exact']:.2f}/{m['exact_unamb']:.2f}  {m['sign']:.2f}  {m['level']:.2f}  {m['mae']:5.2f}   {m['none_recall']:.2f}    {m['nonnone_recall']:.2f}     | {sum(tr[k]['loss'] for k in KEYS):5.1f} {sum(tr[k]['viol'] for k in KEYS):2d}   {rm:5.1f}")
        if len(pr) == 2:
            fa, fb_ = pr[0][0], pr[1][0]
            same = sum(x['code'] == y['code'] for k in KEYS for x, y in zip(fa[k], fb_[k])) / sum(len(fa[k]) for k in KEYS)
            rr = math.sqrt(sum(rmse(pr[0][2][k]['R'], pr[1][2][k]['R']) ** 2 for k in KEYS) / 2)
            print(f"{'':30s}      -> two runs give the same code for {same:.0%} of facts; R differs by RMSE {rr:.1f}")
        summary[label] = [dict(metrics=m, loss=sum(tr[k]['loss'] for k in KEYS), viol=sum(tr[k]['viol'] for k in KEYS)) for _, m, tr in pr]
    json.dump(summary, open('eval_summary.json', 'w'), indent=1)
