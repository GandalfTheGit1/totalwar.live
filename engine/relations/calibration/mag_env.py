"""Environment for the magnitude calibration: registers every episode and gives a context manager for the three frozen knobs."""
import sys, json, contextlib; sys.path.insert(0, '.')
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'model'))
import calib_lib as L, measures as M, scoring as S
import anchors_holdout as H, anchors_qatar as Q, anchors_japan as J, protocol_magnitude as P, anchors_canada as CN
L.F.COUNTRIES.setdefault('JP', dict(es='Japón', en='Japan', local='Japan', lang='ja', qid='Q17')); L.F.COUNTRIES.setdefault('KR', dict(es='Corea del Sur', en='South Korea', local='South Korea', lang='ko', qid='Q884'))
L.T.QID.update({'JP': 'Q17', 'KR': 'Q884'}); L.T.ISO3.update({'JP': 'JPN', 'KR': 'KOR'}); L.T.MIG.M49.update({'JP': 392, 'KR': 410})
L.AN.ANCHORS.extend(H.ANCHORS + Q.ANCHORS + J.ANCHORS + CN.ANCHORS)
L.EPIS.update(AUCN=('AU', 'CN'), QASA=('SA', 'QA'), JPKR=('JP', 'KR'), CASA=('CA', 'SA'))
for g in ('gold_holdout.json', 'gold_qatar.json', 'gold_japan.json', 'gold_canada.json'): L.GOLD.update(json.load(open(g)))
VER = dict(ESMA='complete', INCA='complete', AUCN='complete', JPKR='auto', QASA='auto', CASA='complete')
_STATE0 = S.STATES['MEASURES_IN_FORCE']

@contextlib.contextmanager
def mparams(measureMax=30, fadeHL=365, measureFull=24):
    old = (M.FADE_HALF_LIFE_DAYS, M.MEASURE_FULL, S.STATES['MEASURES_IN_FORCE'])
    M.FADE_HALF_LIFE_DAYS, M.MEASURE_FULL = fadeHL, float(measureFull)
    S.STATES['MEASURES_IN_FORCE'] = (_STATE0[0], -float(measureMax)) + tuple(_STATE0[2:])
    try: yield
    finally: M.FADE_HALF_LIFE_DAYS, M.MEASURE_FULL, S.STATES['MEASURES_IN_FORCE'] = old

def evaluate(key, final, **kw):
    with mparams(**kw):
        sb = L.prepare(key, final)
        return L.eval_anchors(key, final, sb)

# ── Amendment A1: hold an in-force measure's event ────────────────────────────────────────
_ORIG_EC = S.event_contribution

def _held_ec(frac):
    def ec(f, at):
        c = _ORIG_EC(f, at)
        if frac <= 0 or 'measureUntil' not in f or not M.is_measure(f) or float(f.get('measureConfidence', 1.0)) == 0:
            return c
        d = S.parse_date(f.get('eventDate')); until = S.parse_date(f.get('measureUntil')) if f.get('measureUntil') else None
        if d is None or d > at:
            return c
        v0 = _ORIG_EC(f, d)
        if not v0:
            return c
        t = at if (until is None or until > at) else until           # value at the moment the hold ends
        vt = _ORIG_EC(f, t); cur = abs(vt['value']) if vt else 0.0
        held = max(cur, frac * abs(v0['value']))
        if t < at:
            held *= S.decay((at - until).days, v0['halfLife'])
        if held < S.IRRELEVANT_POINTS:
            return None
        sign = -1 if v0['value'] < 0 else 1
        return dict(v0, value=sign * held, ageDays=(at - d).days, held=True)
    return ec

@contextlib.contextmanager
def hold(frac):
    S.event_contribution = _held_ec(frac)
    try: yield
    finally: S.event_contribution = _ORIG_EC

def annotated(key, final):
    a, b = L.EPIS[key]
    return M.pair_with_llm(final, L.F.llm_json, L.PAIR_PROVIDERS, a, b)

def evaluate2(key, final, holdFrac=0.0, measureMax=30, detail=False, **kw):
    with mparams(measureMax=measureMax, **kw), hold(holdFrac):
        ann = annotated(key, final)
        sb = L.prepare(key, ann)
        return L.eval_anchors(key, ann, sb, detail=detail)
