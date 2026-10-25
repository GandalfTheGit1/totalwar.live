"""Calibration library: classification variants, trajectories, anchor loss, parameter overrides."""
import contextlib, json, os, sys, itertools
from datetime import date, timedelta
OLD = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [OLD, HERE]
import flow as F, scoring as S, structure as T, classify_score2 as C, anchors as AN, measures as M

GOLD = json.load(open(os.path.join(HERE, os.environ.get('CALIB_GOLD', 'gold_v2.json'))))
EPIS = {'ESMA': ('ES', 'MA'), 'INCA': ('IN', 'CA')}
CACHE = os.path.join(HERE, os.environ.get('CALIB_CACHE', 'cls_cache_v2.json'))
PROV = {'A': [('gemini', 'gemini-2.5-flash'), ('gemini', 'gemini-3.5-flash-lite')],
        'cohere': [('cohere', 'command-a-03-2025')], 'qwen': [('groq', 'qwen/qwen3.8-27b')],
        'geminilite': [('gemini', 'gemini-3.5-flash-lite')], 'nemotron': [('openrouter', 'nvidia/nemotron-3-super-120b-a12b:free')],
        'gptoss': [('groq', 'openai/gpt-oss-120b')]}
FAMILY = {'A': 'gemini', 'cohere': 'cohere', 'qwen': 'qwen', 'geminilite': 'gemini', 'nemotron': 'nvidia', 'gptoss': 'openai'}
T0 = date(2026, 10, 18)


def load_facts(key, ver):
    return json.load(open(os.path.join(HERE, f'facts_{key}_{ver}.json')))


def gold_of(f):
    return GOLD[f['fact'][:70]]


def d(s):
    y, m, dd = map(int, s.split('-'))
    return date(y, m, dd)


# ── classification cache ───────────────────────────────────────────────────────────────────
def _cache():
    try:
        return json.load(open(CACHE))
    except Exception:
        return {}


def _put(k, v):
    c = _cache()
    c[k] = v
    tmp = f'{CACHE}.{os.getpid()}.tmp'
    json.dump(c, open(tmp, 'w'), ensure_ascii=False)
    os.replace(tmp, CACHE)


def raw_classify(key, ver, name, run=1):
    """Raw output of ONE classifier (no reconciliation). Cached."""
    k = f'raw|{key}|{ver}|{name}|{run}'
    c = _cache()
    if k in c:
        return c[k]
    a, b = EPIS[key]
    facts = load_facts(key, ver)
    got, by = C.classify_all(a, b, facts, PROV[name], 100)
    _put(k, dict(by=by, out=got))
    return _cache()[k]


def reconciled(key, ver, bname, run=1):
    """A (fixed run 1) + B(run) reconciled with the third-model judge. Cached."""
    k = f'rec|{key}|{ver}|{bname}|{run}'
    c = _cache()
    if k in c:
        return c[k]
    a, b = EPIS[key]
    facts = load_facts(key, ver)
    A = raw_classify(key, ver, 'A', 1)
    B = raw_classify(key, ver, bname, run)
    info = {}

    def judge(cases):
        v, by = C.tiebreak(a, b, cases, C.PROV_C, 60)
        info['judge'] = by
        return v
    final, st = C.reconcile(facts, A['out'], B['out'], judge)
    _put(k, dict(final=final, stats=st, A=A['by'], B=B['by'], judge=info.get('judge')))
    return _cache()[k]


def gold_final(key, ver):
    out = []
    for f in load_facts(key, ver):
        g = gold_of(f)
        out.append(dict(f, code=g['code'], actor=g['actor'], actorLevel=g['level'], coreInterest=g['core']))
    return out


# ── parameters ─────────────────────────────────────────────────────────────────────────────
@contextlib.contextmanager
def params(dynScale=1.0, hlScale=1.0, kDyn=60, declared=0.4):
    old = (S.EVENTS, dict(S.STATUS_MULT), S.K_DYN)
    S.EVENTS = {c: (l, b * dynScale, max(1, round(hl * hlScale)), cat) for c, (l, b, hl, cat) in old[0].items()}
    S.STATUS_MULT['DECLARED'] = declared
    S.K_DYN = kDyn
    try:
        yield
    finally:
        S.EVENTS, S.K_DYN = old[0], old[2]
        S.STATUS_MULT.clear()
        S.STATUS_MULT.update(old[1])


# ── trajectories ───────────────────────────────────────────────────────────────────────────
def anchor_dates(key):
    ds = set()
    for a in AN.ANCHORS:
        if a[0] != key:
            continue
        kind = a[1]
        if kind == 'band':
            ds.add(a[3])
        elif kind in ('ge', 'le', 'lt'):
            ds.update([a[3], a[4]])
        elif kind == 'trend':
            ds.add(a[3])
    ds2 = set(ds)
    for s in ds:
        ds2.add((d(s) - timedelta(days=30)).isoformat())
    return sorted(ds2)


_static = {}


def static_states(key):
    if key not in _static:
        a, b = EPIS[key]
        _static[key] = T.build_states(a, b)[0]
    return _static[key]


PAIR_PROVIDERS = [('gemini', 'gemini-2.5-flash'), ('cohere', 'command-a-03-2025'), ('groq', 'qwen/qwen3.8-27b')]


def prepare(key, final, pair=True):
    """Pre-compute the states in force at every anchor date (they depend on the classification, not on the numeric parameters).
    Measures are paired with their lifting acts by a model (validated, cached) unless pair=False (then the lexical fallback is used)."""
    a, b = EPIS[key]
    st = static_states(key)
    ann = M.pair_with_llm(final, F.llm_json, PAIR_PROVIDERS, a, b) if pair else final
    out = {}
    for ds in anchor_dates(key):
        at = d(ds)
        out[ds] = T.merge(list(st), T.derive_states(a, b, ann, st, at))
    return out


def R_at(final, states_by_date, ds):
    return S.score(final, states_by_date[ds], d(ds))['R']


def trend_at(final, states_by_date, ds):
    prev = (d(ds) - timedelta(days=30)).isoformat()
    delta = R_at(final, states_by_date, ds) - R_at(final, states_by_date, prev)
    return 'IMPROVING' if delta >= S.TREND_DELTA else 'DETERIORATING' if delta <= -S.TREND_DELTA else 'STABLE'


def eval_anchors(key, final, states_by_date, detail=False):
    loss, viol, rows = 0.0, 0, []
    for a in AN.ANCHORS:
        if a[0] != key:
            continue
        kind, w, note = a[1], a[-2], a[-1]
        if kind == 'band':
            v = R_at(final, states_by_date, a[3])
            e = max(a[4] - v, v - a[5], 0)
            desc = f'R({a[3]})={v:+.0f} in [{a[4]},{a[5]}]'
        elif kind in ('ge', 'le'):
            dl = R_at(final, states_by_date, a[4]) - R_at(final, states_by_date, a[3])
            e = max(a[5] - dl, 0) if kind == 'ge' else max(dl - a[5], 0)
            desc = f'R({a[4]})-R({a[3]})={dl:+.0f} {">=" if kind == "ge" else "<="} {a[5]}'
        elif kind == 'lt':
            x, y = R_at(final, states_by_date, a[3]), R_at(final, states_by_date, a[4])
            e = max(x - y - a[5], 0)
            desc = f'R({a[3]})={x:+.0f} <= R({a[4]})={y:+.0f}+{a[5]}'
        else:
            got = trend_at(final, states_by_date, a[3])
            e = 0 if got == a[4] else 20
            desc = f'trend({a[3]})={got} (want {a[4]})'
        loss += w * e
        viol += e > 0
        rows.append((e, w, desc, note))
    return (loss, viol, rows) if detail else (loss, viol)


def grid_losses(key, final, states_by_date):
    res = {}
    for ds_, hs, kd, dc in itertools.product(AN.GRID['dynScale'], AN.GRID['hlScale'], AN.GRID['kDyn'], AN.GRID['declared']):
        with params(ds_, hs, kd, dc):
            res[(ds_, hs, kd, dc)] = eval_anchors(key, final, states_by_date)
    return res
