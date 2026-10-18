"""State of each country's embassy in the other: PRESENT / ABSENT / UNKNOWN, per side, at any date.

A side is the head of one country's mission in the other. Three kinds of evidence are combined (rules E1-E8 of calibration/protocol_embassy.py):
  events    an executed recall by the sending country, or an expulsion of its head of mission by the host, makes the side ABSENT until a restoration;
            an executed AMBASSADOR_RESTORED / NORMALIZATION of the pair is a restoration (marked 'web' when the re-verification step added it)
  wikidata  the holders of the position that directs the sending country's embassy in the host (P2389 -> P39 with start/end qualifiers):
            a holder who took office after the absence is a restoration; a tenure that is certain at the date makes the side PRESENT
  nothing   no absence and no certain tenure: UNKNOWN. A gap in Wikidata is never read as an absence (its coverage is very uneven between countries).
There is no time limit on an absence: it lasts until some evidence ends it.
"""
import calendar, os, re, sys
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scoring as S

OPEN_TENURE_YEARS = 6          # a tenure without an end date is taken as certain for at most 6 years after it began
HEAD_OF_MISSION = re.compile(r"ambassador|high commissioner|charg[ée] d.affaires|nuncio|head of (?:the )?mission", re.I)
RESTORE_CODES = ('AMBASSADOR_RESTORED', 'NORMALIZATION')
YEAR, MONTH, DAY = 9, 10, 11   # Wikidata time precision


# ─── Wikidata ─────────────────────────────────────────────────────────────────
def heads_query(qid):
    """All resident embassies of one SENDING country, the position that directs each one, and that position's holders with dates and their precision."""
    return f'''SELECT ?r ?h ?hLabel ?start ?sp ?end ?ep WHERE {{
        ?e wdt:P31/wdt:P279* wd:Q3917681; wdt:P137 wd:{qid}; wdt:P17 ?r . FILTER NOT EXISTS {{ ?e wdt:P576 ?x }}
        ?pos wdt:P2389 ?e . ?h p:P39 ?st . ?st ps:P39 ?pos .
        OPTIONAL {{ ?st pqv:P580 ?sv . ?sv wikibase:timeValue ?start; wikibase:timePrecision ?sp }}
        OPTIONAL {{ ?st pqv:P582 ?ev . ?ev wikibase:timeValue ?end; wikibase:timePrecision ?ep }}
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}'''


def _wd_date(v):
    m = re.match(r'^\+?(\d{4})-(\d{2})-(\d{2})', v or '')
    if not m:
        return None
    y, mo, d = int(m[1]), max(1, int(m[2])), max(1, int(m[3]))
    try:
        return date(y, mo, d)
    except ValueError:
        return None


def period_start(d, prec):
    return None if d is None or prec < YEAR else date(d.year, 1, 1) if prec == YEAR else date(d.year, d.month, 1) if prec == MONTH else d


def period_end(d, prec):
    if d is None or prec < YEAR:
        return None
    if prec == YEAR:
        return date(d.year, 12, 31)
    if prec == MONTH:
        return date(d.year, d.month, calendar.monthrange(d.year, d.month)[1])
    return d


def tenures_from_rows(rows, host_qid):
    """Wikidata rows of one sending country -> tenures in the given host, with CERTAIN bounds: start at the end of its precision period, end at the beginning of its period."""
    out = []
    for r in rows:
        if r['r']['value'].split('/')[-1] != host_qid:
            continue
        s = period_end(_wd_date(r.get('start', {}).get('value')), int(r.get('sp', {}).get('value', 0)))
        if s is None:
            continue                 # a holder without a usable start date says nothing about when they were in post
        e = period_start(_wd_date(r.get('end', {}).get('value')), int(r.get('ep', {}).get('value', 0))) if 'end' in r else None
        out.append(dict(holder=r.get('hLabel', {}).get('value', ''), start=s.isoformat(), end=e.isoformat() if e else None))
    return sorted(out, key=lambda t: t['start'])


# ─── status of one side ───────────────────────────────────────────────────────
def _d(f):
    return S.parse_date(f.get('eventDate'))


def _done(f, at):
    return f.get('type') == 'IMPLEMENTED' and _d(f) is not None and _d(f) <= at


def absences(side, host, facts, at):
    """Executed acts that left `side` without a head of mission in `host`: its own recall, or the host expelling its head of mission."""
    out = []
    for f in facts:
        if not _done(f, at):
            continue
        actor = str(f.get('actor'))
        if f.get('code') == 'AMBASSADOR_RECALL' and actor == side:
            out.append(f)
        elif f.get('code') == 'EXPULSION' and actor == host and HEAD_OF_MISSION.search(f.get('fact') or ''):
            out.append(f)
    return sorted(out, key=_d)


def certain_at(t, at):
    s = S.parse_date(t['start'])
    e = S.parse_date(t['end']) if t.get('end') else None
    if s is None or s > at:
        return False
    return e > at if e else (at - s).days <= OPEN_TENURE_YEARS * 365.25


def side_status(side, host, facts, tenures, at):
    """Status of `side`'s head of mission in `host` at date `at` (rules E2-E6)."""
    gone = absences(side, host, facts, at)
    if gone:
        d = _d(gone[-1])
        ev = [(_d(f), 'web' if f.get('verified') else 'event', f.get('fact', '')[:90]) for f in facts
              if f.get('code') in RESTORE_CODES and _done(f, at) and _d(f) > d]
        wd = [(S.parse_date(t['start']), 'wikidata', f"{t['holder']} took office") for t in tenures
              if d < S.parse_date(t['start']) <= at]
        back = sorted(ev + wd, key=lambda x: x[0])
        if not back:
            return dict(status='ABSENT', since=d.isoformat()[:7], source='event', evidence=gone[-1].get('fact', '')[:90])
        when, src, what = back[0]
        holder = next((t['holder'] for t in reversed(tenures) if certain_at(t, at)), None)
        return dict(status='PRESENT', since=when.isoformat()[:7], source=src, evidence=what, holder=holder)
    cur = [t for t in tenures if certain_at(t, at)]
    if cur:
        t = cur[-1]
        return dict(status='PRESENT', since=t['start'][:7], source='wikidata', evidence=f"{t['holder']} in post", holder=t['holder'])
    return dict(status='UNKNOWN', since=None, source='none', evidence='no recall or expulsion on record and no certain Wikidata tenure')


def pair_status(a, b, facts, tenures_by_side, at):
    """{side: status dict} for both sides of the pair."""
    return {a: side_status(a, b, facts, tenures_by_side.get(a, []), at), b: side_status(b, a, facts, tenures_by_side.get(b, []), at)}
