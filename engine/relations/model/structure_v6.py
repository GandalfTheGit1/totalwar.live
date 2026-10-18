"""Structural states of a country pair, taken from DATA instead of from an LLM.

Sources
  wikidata  diplomatic relation (P530), resident embassies, memberships (P463) in a verified list of blocs, territories claimed (P1336)
  wits      World Bank WITS: share of each country's exports/imports that goes to / comes from the other (latest year available)
  project   hard-country-data.ts (sanctions regimes by country) and RAW_SPECIAL_PAIR_STATUS in the seed script (strategic rivalries, defence treaties)
  derived   deterministic rules over the classified, verified facts (ambassador withdrawn and not restored, trade war, arms embargo, dispute escalation)

An absent datum is NOT evidence of absence: nothing is scored when a source is silent.
"""
import json, os, re, sys, time, urllib.parse, urllib.error
import xml.etree.ElementTree as ET
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import flow as F
import scoring as S
import measures as M

PROJECT = os.path.expanduser('~/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae')
HARD_FILE = f'{PROJECT}/lib/services/geopolitical/hard-country-data.ts'
SEED_FILE = f'{PROJECT}/scripts/seed_geopolitical_matrix.ts'
CACHE_FILE = os.path.join(HERE, 'data_cache.json')
BLOCS = json.load(open(os.path.join(HERE, 'bloc_qids.json')))
ISO3 = {'ES': 'ESP', 'MA': 'MAR', 'IL': 'ISR', 'US': 'USA', 'CN': 'CHN', 'IN': 'IND', 'CA': 'CAN', 'AU': 'AUS', 'SA': 'SAU', 'QA': 'QAT', 'CU': 'CUB', 'MN': 'MNG', 'SN': 'SEN'}
QID = {c: v['qid'] for c, v in F.COUNTRIES.items()}
WITS = 'https://wits.worldbank.org/API/V1/SDMX/V21/datasource/tradestats-trade'
TRADE_HIGH_PCT, TRADE_MEDIUM_PCT = 10.0, 3.0
HEAD_OF_MISSION = re.compile(r"ambassador|high commissioner|charg[ée] d.affaires|nuncio|head of (?:the )?mission", re.I)
HUMAN_FULL_ABS, HUMAN_FULL_SHARE, HUMAN_MIN_SCALE = 1_000_000, 2.0, 0.05    # full value at 1 M people or 2 % of the destination's population
# Reciprocal economic coercion is detected over the whole category: the same act (e.g. a retaliatory tariff) is labelled TRADE_RESTRICTION or SANCTIONS_TARGETED
# from run to run, and both are worth the same points.
ECON_COERCION = ('TRADE_RESTRICTION', 'EXPORT_CONTROLS', 'SANCTIONS_TARGETED', 'SANCTIONS_BROAD', 'INVESTMENT_BLOCK')

# bloc -> state it implies for two members (each state counted once per pair)
BLOC_STATE = {'NATO': 'DEFENSE_ALLIANCE', 'CSTO': 'DEFENSE_ALLIANCE', 'EU': 'DEEP_INTEGRATION', 'FIVE_EYES': 'INTEL_ALLIANCE',
              'USMCA': 'FTA_IN_FORCE', 'CPTPP': 'FTA_IN_FORCE', 'RCEP': 'FTA_IN_FORCE', 'MERCOSUR': 'FTA_IN_FORCE', 'EAEU': 'FTA_IN_FORCE',
              'AFCFTA': 'FTA_IN_FORCE', 'EFTA': 'FTA_IN_FORCE', 'ASEAN': 'PREFERENTIAL_TRADE', 'GCC': 'PREFERENTIAL_TRADE',
              'BRICS': 'SHARED_FORUM', 'SCO': 'SHARED_FORUM', 'OECD': 'SHARED_FORUM', 'G20': 'SHARED_FORUM', 'APEC': 'SHARED_FORUM',
              'OPEC': 'SHARED_FORUM', 'ARAB_LEAGUE': 'SHARED_FORUM', 'AU': 'SHARED_FORUM', 'OIC': 'SHARED_FORUM', 'CELAC': 'SHARED_FORUM'}
STATE_RANK = ['DEFENSE_ALLIANCE', 'DEEP_INTEGRATION', 'FTA_IN_FORCE', 'INTEL_ALLIANCE', 'PREFERENTIAL_TRADE', 'SHARED_FORUM']

DATA_SOURCES = [
    ('FULL_DIPLOMATIC / NONRESIDENT_RELATIONS', 'Wikidata', 'Relación diplomática (P530) y embajadas residentes de cada país en el otro. Dos embajadas = lado doble; si Wikidata calla no se puntúa nada.'),
    ('DEFENSE_ALLIANCE, DEEP_INTEGRATION, INTEL_ALLIANCE, FTA_IN_FORCE, PREFERENTIAL_TRADE, SHARED_FORUM', 'Wikidata (P463)',
     'Pertenencia vigente de ambos a la misma organización de una lista cerrada de 23 bloques, cuyos identificadores se verifican por etiqueta y descripción.'),
    ('HUMAN_TIES', 'ONU (UN DESA, migrantes por origen y destino 2024) + Banco Mundial (población)', f'Nacidos en un país que viven en el otro, en las dos direcciones. Valor completo con ≥ {HUMAN_FULL_ABS:,} personas o ≥ {HUMAN_FULL_SHARE:g} % de la población del país de destino; proporcional por debajo; se ignora bajo el {int(HUMAN_MIN_SCALE * 100)} %. Cuenta lugar de nacimiento, no nacionalidad.'),
    ('TRADE_HIGH / TRADE_MEDIUM', 'Banco Mundial WITS', f'Mayor de las cuatro cuotas bilaterales (exportaciones e importaciones de cada país con el otro): ≥ {TRADE_HIGH_PCT:g} % alta, ≥ {TRADE_MEDIUM_PCT:g} % media.'),
    ('TERRITORIAL_DISPUTE_LOW', 'Wikidata (P1336)', 'Territorios que uno reclama y administra el otro. Sube a ACTIVE o MILITARIZED por reglas sobre hechos recientes (abajo).'),
    ('SANCTIONS_REGIME_* / TECH_RESTRICTIONS / ARMS_EMBARGO_IN_FORCE', 'Proyecto (hard-country-data.ts)', 'Regímenes por país sancionado, asignados a EE. UU., UE o ONU según el nombre del régimen; solo cuenta si el otro país de la pareja es el que sanciona.'),
    ('STRATEGIC_RIVALRY, DEFENSE_ALLIANCE bilateral', 'Proyecto (seed_geopolitical_matrix.ts)', 'Tabla de pares especiales: competencia estratégica o adversario sancionado ⇒ rivalidad; "defensa mutua" en la nota ⇒ alianza.'),
    ('BILATERAL_TREATIES', 'Wikidata (tratados bilaterales)', 'Tratados con como máximo 3 Estados parte entre los dos países, sin fecha de fin, cuyo título indica inversiones, cooperación, defensa, seguridad, información clasificada, fiscalidad, extradición o comercio. Se deduplican por título. Cobertura parcial de Wikidata.'),
    ('SHARED_LANGUAGE', 'Wikidata (P37)', 'Los dos países tienen al menos una lengua oficial en común.'),
    ('TRADE_WAR', 'Proyecto (tabla de pares especiales)', 'La nota del par menciona aranceles cruzados o guerra comercial: estado completo.'),
    ('AMBASSADOR_ABSENT', 'Derivado de hechos', 'Embajador retirado (por su propio país) o expulsado (por el otro: embajador, alto comisionado o encargado de negocios), ejecutado en los últimos 36 meses y sin regreso ni normalización posterior; cuenta un lado por cada misión sin jefe.'),
    ('TRADE_WAR (pares fuera de la tabla)', 'Derivado de hechos', 'Sin corte duro: cada acto de coerción económica ejecutado (aranceles, controles de exportación, sanciones, veto a inversiones) de los últimos 5 años aporta peso 0,5^(edad/1 año); hace falta al menos una de cada lado (represalia) o una conjunta; la intensidad es min(1, suma de pesos); cada desescalada posterior la reduce un 30 % si fue ejecutada o un 12 % si solo anunciada (las dos más fuertes); un acuerdo comercial o el levantamiento la da por terminada y se desvanece.'),
    ('FRIENDSHIP_TREATY', 'Derivado de hechos', 'Firma verificada y ejecutada de un tratado de amistad o buena vecindad (cualquier antigüedad) sin ruptura de relaciones posterior.'),
    ('ARMS_EMBARGO_IN_FORCE', 'Derivado de hechos', 'Embargo de armas ejecutado en los últimos 60 meses sin levantamiento posterior.'),
    ('TERRITORIAL_DISPUTE_ACTIVE / MILITARIZED', 'Derivado de hechos', 'Con reclamación en Wikidata: ≥ 2 incidentes, violaciones de soberanía o posturas hostiles en 24 meses ⇒ activa; choque armado, víctimas o ataque en 60 meses ⇒ militarizada.'),
    ('Sin fuente automática todavía', '—', 'COLONIAL_LEGACY, HISTORICAL_ALLIANCE, HISTORICAL_WAR, NO_RELATIONS, NON_RECOGNITION, PROXY_HOSTILITY, OCCUPATION, ARMED_CONFLICT, STRATEGIC_PARTNERSHIP, HIGH_LEVEL_MECHANISM: solo por configuración manual.'),
]


# ─── cache + HTTP with backoff ────────────────────────────────────────────────
def _cache():
    try:
        return json.load(open(CACHE_FILE))
    except Exception:
        return {}


def cached(key, fn, ttl=86400):
    c = _cache()
    if key in c and time.time() - c[key][0] < ttl:
        return c[key][1]
    val = fn()
    c = _cache()
    c[key] = [time.time(), val]
    tmp = f'{CACHE_FILE}.{os.getpid()}.tmp'
    json.dump(c, open(tmp, 'w'))
    os.replace(tmp, CACHE_FILE)
    return val


def get(url, timeout=60, tries=5):
    for a in range(tries):
        try:
            return F.http_get(url, timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504):
                raise
            time.sleep(5 * (a + 1))
    raise RuntimeError(f'gave up on {url[:80]}')


def sparql(q):
    time.sleep(1.2)
    return json.loads(get('https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(q)))['results']['bindings']


# ─── Wikidata ─────────────────────────────────────────────────────────────────
def memberships(code):
    vals = ' '.join(f'wd:{q}' for q in BLOCS.values())
    q = f'SELECT DISTINCT ?o WHERE {{ wd:{QID[code]} p:P463 ?s. ?s ps:P463 ?o. FILTER NOT EXISTS {{ ?s pq:P582 ?e }} VALUES ?o {{ {vals} }} }}'
    have = {r['o']['value'].split('/')[-1] for r in cached(f'wd-member-{code}', lambda: sparql(q))}
    return {k for k, v in BLOCS.items() if v in have}


def diplomacy(a, b):
    qa, qb = QID[a], QID[b]
    rel = cached(f'wd-p530-{a}-{b}', lambda: sparql(f'SELECT ?x WHERE {{ {{ wd:{qa} wdt:P530 wd:{qb} }} UNION {{ wd:{qb} wdt:P530 wd:{qa} }} BIND(1 AS ?x) }} LIMIT 1'))
    emb = cached(f'wd-emb-{a}-{b}', lambda: sparql(f'''SELECT ?op (COUNT(DISTINCT ?e) AS ?n) WHERE {{ VALUES (?op ?loc) {{(wd:{qa} wd:{qb}) (wd:{qb} wd:{qa})}}
        ?e wdt:P31/wdt:P279* wd:Q3917681; wdt:P137 ?op; wdt:P17 ?loc. FILTER NOT EXISTS {{ ?e wdt:P576 ?x }} }} GROUP BY ?op'''))
    ops = {r['op']['value'].split('/')[-1] for r in emb if int(r['n']['value']) > 0}
    sides = (qa in ops) + (qb in ops)
    return bool(rel), sides


def claims(a, b):
    out = {}
    for x, y in ((a, b), (b, a)):
        rows = cached(f'wd-claims-{x}-{y}', lambda x=x, y=y: sparql(
            f'SELECT DISTINCT ?tLabel WHERE {{ ?t wdt:P1336 wd:{QID[x]}; wdt:P17 wd:{QID[y]}. SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }} LIMIT 20'))
        if rows:
            out[f'{x}->{y}'] = [r['tLabel']['value'] for r in rows]
    return out


TREATY_KEYWORDS = re.compile(r'investment|friendship|cooperation|co-operation|defen[cs]e|security|classified|extradition|taxation|double tax|trade|association|partnership|good.neighbo', re.I)


def filter_treaties(rows):
    """Bilateral treaties from Wikidata rows [{tLabel,t,end?}]: keep modern-sounding titles, drop ended ones, dedupe by title."""
    seen, out = [], []
    for r in rows:
        title = r['tLabel']['value'] if 'tLabel' in r else ''
        if r.get('end', {}).get('value') or not TREATY_KEYWORDS.search(title) or re.match(r'^Q\d+$', title):
            continue
        toks = set(re.findall(r'[a-z]{4,}', title.lower())) - {'agreement', 'between', 'government', 'republic', 'kingdom', 'treaty', 'convention', 'protocol'}
        if not any(len(toks & o) / max(1, len(toks | o)) >= 0.5 for o in seen):     # same agreement entered twice with different wording
            seen.append(toks)
            out.append(title)
    return out


def treaties(a, b):
    q = f'''SELECT ?t ?tLabel (SAMPLE(?e) AS ?end) (COUNT(DISTINCT ?party) AS ?n) WHERE {{
      ?t wdt:P31/wdt:P279* wd:Q131569. VALUES ?pr {{ wdt:P1891 wdt:P6193 wdt:P17 }}
      ?t ?pr wd:{QID[a]}. ?t ?pr2 wd:{QID[b]}. ?t ?pr3 ?party. FILTER(?pr3 IN (wdt:P1891, wdt:P6193, wdt:P17))
      OPTIONAL {{ ?t wdt:P576 ?e }} SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}
      GROUP BY ?t ?tLabel HAVING(COUNT(DISTINCT ?party) <= 3) LIMIT 30'''
    return filter_treaties(cached(f'wd-treaties-{a}-{b}', lambda: sparql(q)))


def shared_languages(a, b):
    q = f'SELECT DISTINCT ?lLabel WHERE {{ wd:{QID[a]} wdt:P37 ?l. wd:{QID[b]} wdt:P37 ?l. SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}'
    return [r['lLabel']['value'] for r in cached(f'wd-lang-{a}-{b}', lambda: sparql(q))]


# ─── Human ties: UN DESA bilateral migrant stock ──────────────────────────────
import migration as MIG


def population(code):
    """Total population (World Bank SP.POP.TOTL, latest of 2023/2022)."""
    def fetch():
        for year in (2023, 2022):
            d = json.loads(get(f'https://api.worldbank.org/v2/country/{ISO3[code]}/indicator/SP.POP.TOTL?format=json&date={year}'))
            if len(d) > 1 and d[1] and d[1][0].get('value'):
                return d[1][0]['value']
        return None
    return cached(f'wb-pop-{code}', fetch, ttl=30 * 86400)


def human_scale(stock_ab, stock_ba, pop_a, pop_b):
    """Intensity 0..1 of the diaspora tie: the larger of (people / 1 M) and (share of the destination population / 2 %), over both directions."""
    best = 0.0
    for stock_, pop_ in ((stock_ab, pop_a), (stock_ba, pop_b)):
        if stock_ and pop_:
            best = max(best, stock_ / HUMAN_FULL_ABS, (stock_ / pop_ * 100) / HUMAN_FULL_SHARE)
    return min(1.0, best)


def human_ties(a, b):
    if not (os.path.exists(MIG.XLSX) or os.path.exists(MIG.CACHE)):
        return None, dict(available=False)
    for c in (a, b):
        if c not in MIG.M49:                       # other countries: ISO numeric code from Wikidata (P299)
            rows = cached(f'wd-p299-{c}', lambda c=c: sparql(f'SELECT ?n WHERE {{ wd:{QID[c]} wdt:P299 ?n }} LIMIT 1'))
            if not rows:
                return None, dict(available=True, error=f'no M49 code for {c}')
            MIG.M49[c] = int(rows[0]['n']['value'])
    sab, sba = MIG.stock(a, b), MIG.stock(b, a)    # sab = born in b, living in a
    pa, pb = population(a), population(b)
    sc = human_scale(sab, sba, pa, pb)
    log = dict(available=True, **{f'{b}-born in {a}': sab, f'{a}-born in {b}': sba}, scale=round(sc, 2),
               share_pct={f'{b} in {a}': (round(sab / pa * 100, 2) if sab and pa else None), f'{a} in {b}': (round(sba / pb * 100, 2) if sba and pb else None)})
    if sc < HUMAN_MIN_SCALE:
        return None, log
    big = max(((sab or 0, f'{b}-born in {a}', pa), (sba or 0, f'{a}-born in {b}', pb)))
    return dict(code='HUMAN_TIES', scale=round(sc, 2), source='un-desa', evidence=f'{big[1]}: {int(big[0]):,} people ({big[0] / big[2] * 100:.2f} % of the destination); UN DESA 2024'), log


# ─── WITS ─────────────────────────────────────────────────────────────────────
def wits_shares(reporter3):
    def fetch():
        for year in (2023, 2022, 2021):
            try:
                out = {}
                for ind, key in (('XPRT-PRTNR-SHR', 'exp'), ('MPRT-PRTNR-SHR', 'imp')):
                    root = ET.fromstring(get(f'{WITS}/reporter/{reporter3}/year/{year}/partner/all/indicator/{ind}'))
                    for el in root.iter():
                        if el.tag.endswith('Series') and el.attrib.get('PARTNER'):
                            for o in el:
                                if o.tag.endswith('Obs') and o.attrib.get('OBS_VALUE'):
                                    out.setdefault(el.attrib['PARTNER'], {})[key] = float(o.attrib['OBS_VALUE'])
                return dict(year=year, data=out)
            except urllib.error.HTTPError:
                continue
        return dict(year=None, data={})
    return cached(f'wits-{reporter3}', fetch, ttl=7 * 86400)


def trade_pair(a, b):
    sa, sb = wits_shares(ISO3[a]), wits_shares(ISO3[b])
    vals = {f'{a} exports to {b}': sa['data'].get(ISO3[b], {}).get('exp'), f'{a} imports from {b}': sa['data'].get(ISO3[b], {}).get('imp'),
            f'{b} exports to {a}': sb['data'].get(ISO3[a], {}).get('exp'), f'{b} imports from {a}': sb['data'].get(ISO3[a], {}).get('imp')}
    vals = {k: v for k, v in vals.items() if v is not None}
    return vals, (sa['year'], sb['year'])


# ─── Project data ─────────────────────────────────────────────────────────────
def hard_data():
    txt = open(HARD_FILE).read()
    out = {}
    for m in re.finditer(r"\n  (\w\w): \{\s*sanctions: \{\s*level: '(\w+)',\s*score: (\d+),\s*regimes: \[([^\]]*)\]", txt):
        out[m[1]] = dict(level=m[2], score=int(m[3]), regimes=re.findall(r"'([^']+)'", m[4]))
    return out


def special_pairs():
    txt = open(SEED_FILE).read()
    out = {}
    for m in re.finditer(r"'(\w\w)-(\w\w)': \{ stance: '(\w+)'.*?note: '([^']*)'", txt):
        out[tuple(sorted((m[1], m[2])))] = dict(stance=m[3], note=m[4])
    return out


def authorities(regimes):
    s = set()
    for r in regimes:
        if re.search(r'OFAC|BIS_|CAATSA|HELMS|UFLPA|NS_CMIC|FTO_|CAESAR|RENACER|ZDERA|CACR|PDVSA|MOGE|MAGNITSKY|TALIBAN|SECONDARY|JCPOA|CHIPS|EXPORT_CONTROLS|G7_', r):
            s.add('US')
        if r.startswith('EU_') or '_EU' in r or r.startswith('EU'):
            s.add('EU')
        if r.startswith('UNSC'):
            s.add('UN')
    return s


# ─── build ────────────────────────────────────────────────────────────────────
def build_states(a, b):
    """Data-backed structural states + a log of what each source returned (including silences)."""
    states, log = [], {}
    related, sides = diplomacy(a, b)
    log['wikidata.diplomacy'] = dict(P530=related, residentEmbassySides=sides)
    if sides >= 1:
        states.append(dict(code='FULL_DIPLOMATIC', sides=sides, source='wikidata', evidence=f'{sides} resident embassy(ies); P530={related}'))
    elif related:
        states.append(dict(code='NONRESIDENT_RELATIONS', source='wikidata', evidence='P530 present, no resident embassy found'))

    ma, mb = memberships(a), memberships(b)
    shared = ma & mb
    log['wikidata.memberships'] = dict(a=sorted(ma), b=sorted(mb), shared=sorted(shared))
    implied = {}
    for blk in sorted(shared):
        implied.setdefault(BLOC_STATE[blk], []).append(blk)
    for code, blks in implied.items():
        if code == 'SHARED_FORUM' and any(c in implied for c in ('DEFENSE_ALLIANCE', 'DEEP_INTEGRATION')):
            continue          # forums add nothing next to an alliance or deep integration
        states.append(dict(code=code, source='wikidata', evidence='shared: ' + ', '.join(blks)))

    cl = claims(a, b)
    log['wikidata.claims'] = cl
    if cl:
        states.append(dict(code='TERRITORIAL_DISPUTE_LOW', source='wikidata', evidence='; '.join(f'{k}: {", ".join(v[:4])}{"…" if len(v) > 4 else ""}' for k, v in cl.items())))

    vals, years = trade_pair(a, b)
    log['wits'] = dict(shares_pct=vals, years=years)
    if vals:
        top = max(vals, key=vals.get)
        code = 'TRADE_HIGH' if vals[top] >= TRADE_HIGH_PCT else 'TRADE_MEDIUM' if vals[top] >= TRADE_MEDIUM_PCT else None
        if code:
            states.append(dict(code=code, source='wits', evidence=f'{top}: {vals[top]:.1f} %'))

    hard = hard_data()
    eu = {c for c in (a, b) if 'EU' in memberships(c)}
    for tgt, other in ((a, b), (b, a)):
        h = hard.get(tgt)
        if not h:
            continue
        auth = authorities(h['regimes'])
        applies = ('US' in auth and other == 'US') or ('EU' in auth and other in eu) or ('UN' in auth)
        log.setdefault('project.sanctions', {})[f'{other}->{tgt}'] = dict(level=h['level'], regimes=h['regimes'], authorities=sorted(auth), applies=applies)
        if not applies:
            continue
        tech = any(re.search(r'EXPORT_CONTROL|BIS_|ENTITY_LIST|CMIC|CHIPS', r) for r in h['regimes'])
        code = 'SANCTIONS_REGIME_BROAD' if h['level'] == 'COMPREHENSIVE' else 'TECH_RESTRICTIONS' if tech else 'SANCTIONS_REGIME_TARGETED'
        states.append(dict(code=code, source='project', evidence=f'{other}->{tgt} {h["level"]}: {", ".join(h["regimes"][:4])}'))
        if any('ARMS_EMBARGO' in r for r in h['regimes']):
            states.append(dict(code='ARMS_EMBARGO_IN_FORCE', source='project', evidence='ARMS_EMBARGO regime'))

    sp = special_pairs().get(tuple(sorted((a, b))))
    log['project.specialPair'] = sp
    if sp:
        if sp['stance'] in ('FRICTION_STRATEGIC_COMPETITION', 'SANCTIONED_ADVERSARIAL'):
            states.append(dict(code='STRATEGIC_RIVALRY', source='project', evidence=sp['stance'] + ': ' + sp['note'][:70]))
        if sp['stance'] == 'STRATEGIC_ALLY' and re.search(r'defensa mutua', sp['note'], re.I):
            states.append(dict(code='DEFENSE_ALLIANCE', source='project', evidence=sp['note'][:70]))

    ht, hlog = human_ties(a, b)
    log['un-desa.migration'] = hlog
    if ht:
        states.append(ht)

    tr = treaties(a, b)
    log['wikidata.treaties'] = tr
    if tr:
        states.append(dict(code='BILATERAL_TREATIES', count=min(3, len(tr)), source='wikidata', evidence='; '.join(t[:60] for t in tr[:3])))
    langs = shared_languages(a, b)
    log['wikidata.sharedLanguages'] = langs
    if langs:
        states.append(dict(code='SHARED_LANGUAGE', source='wikidata', evidence=', '.join(langs[:3])))

    if sp and re.search(r'aranceles cruzados|guerra comercial|trade war', sp['note'], re.I):
        states.append(dict(code='TRADE_WAR', source='project', evidence=sp['note'][:80]))

    seen, out = set(), []
    for s in states:                      # one state per code
        if s['code'] not in seen:
            seen.add(s['code'])
            out.append(s)
    return out, log


# ─── states derived from the classified facts ─────────────────────────────────
def _d(f):
    return S.parse_date(f.get('eventDate'))


def derive_states(a, b, facts, states, at):
    """Deterministic rules over classified facts (each must carry code/type/actor/eventDate)."""
    out, have = [], {s['code'] for s in states}
    months = lambda n: at - timedelta(days=int(n * 30.4))
    ok = lambda f: f.get('type') == 'IMPLEMENTED' and _d(f) and _d(f) <= at
    by = lambda *codes: sorted([f for f in facts if f.get('code') in codes and ok(f)], key=_d)

    # ambassador absent: (a) a country recalled its own ambassador -> that side; (b) a country expelled / declared persona non grata the other's head of mission -> the OTHER side.
    # Cancelled by a later restoration. Looks back 36 months.
    restored = by('AMBASSADOR_RESTORED', 'NORMALIZATION')
    absent = {}
    for f in by('AMBASSADOR_RECALL'):
        side = str(f.get('actor'))
        if side in (a, b) and _d(f) >= months(36) and not any(_d(r) > _d(f) for r in restored):
            absent.setdefault(side, _d(f))
    for f in by('EXPULSION'):
        actor = str(f.get('actor'))
        if actor in (a, b) and HEAD_OF_MISSION.search(f.get('fact') or '') and _d(f) >= months(36) and not any(_d(r) > _d(f) for r in restored):
            absent.setdefault(b if actor == a else a, _d(f))
    if absent and not by('RELATIONS_SEVERED'):
        out.append(dict(code='AMBASSADOR_ABSENT', sides=len(absent), since=min(absent.values()).isoformat()[:7], source='derived', sideDates={k: v.isoformat()[:7] for k, v in absent.items()},
                        evidence='head of mission absent for ' + ', '.join(f'{k} ({v.isoformat()[:7]})' for k, v in absent.items()) + ', no later restoration'))

    # standing coercive measures (tariffs, bans, export controls, sanctions, supply cuts, investment vetoes, visa restrictions): in force until a lifting act, then fade.
    # Not added when the project already describes a trade war for this pair (TRADE_WAR) so the same measures are not counted twice.
    if 'TRADE_WAR' not in have:
        fm = M.annotate([f for f in facts if _d(f) and _d(f) <= at]) if not any('measureUntil' in f for f in facts) else [f for f in facts if _d(f) and _d(f) <= at]
        scale, info = M.intensity(fm, at)
        if scale >= 0.02:
            out.append(dict(code='MEASURES_IN_FORCE', scale=round(scale, 2), since=info['since'], source='derived',
                            evidence=f"{info['active']} measure(s) in force, {info['fading']} lifted and fading; weight {info['weight']} of {M.MEASURE_FULL:g}"))

    # severed relations: stays until a restoration or normalization
    sev = by('RELATIONS_SEVERED')
    if sev:
        back = [r for r in by('AMBASSADOR_RESTORED', 'NORMALIZATION') if _d(r) > _d(sev[-1])]
        if not back:
            out.append(dict(code='NO_RELATIONS', since=_d(sev[-1]).isoformat()[:7], source='derived', replaces='FULL_DIPLOMATIC',
                            evidence=f"{sev[-1]['fact'][:70]} ({_d(sev[-1]).isoformat()[:7]}), no later restoration"))

    # friendship / good-neighbour treaty signed and verified, not followed by a rupture
    ft = by('FRIENDSHIP_TREATY_SIGNED')
    if ft and 'FRIENDSHIP_TREATY' not in have and not any(_d(f) > _d(ft[-1]) for f in by('RELATIONS_SEVERED')):
        out.append(dict(code='FRIENDSHIP_TREATY', since=_d(ft[0]).isoformat()[:7], source='derived', evidence=f"{ft[-1]['fact'][:70]} ({_d(ft[-1]).isoformat()[:7]})"))

    # arms embargo
    emb = [f for f in by('ARMS_EMBARGO') if _d(f) >= months(60)]
    if emb and 'ARMS_EMBARGO_IN_FORCE' not in have and not any(_d(l) > _d(emb[-1]) for l in by('SANCTIONS_LIFTED')):
        out.append(dict(code='ARMS_EMBARGO_IN_FORCE', since=_d(emb[0]).isoformat()[:7], source='derived', evidence=emb[-1]['fact'][:70]))

    # escalation of a dispute that Wikidata knows about
    if 'TERRITORIAL_DISPUTE_LOW' in have:
        violent = [f for f in facts if f.get('code') in ('ARMED_CLASH', 'LETHAL_INCIDENT', 'STATE_ATTACK') and ok(f) and _d(f) >= months(60)]
        hot = [f for f in facts if f.get('code') in ('BORDER_INCIDENT', 'SOVEREIGNTY_VIOLATION', 'CORE_HOSTILE_POSITION', 'MILITARY_PRESSURE')
               and _d(f) and _d(f) <= at and _d(f) >= months(24) and f.get('actorLevel') != 'NON_GOV']
        if violent or len(hot) >= 2:
            out.append(dict(code='TERRITORIAL_DISPUTE_MILITARIZED' if violent else 'TERRITORIAL_DISPUTE_ACTIVE', source='derived', replaces='TERRITORIAL_DISPUTE_LOW',
                            evidence=(f'{len(violent)} violent' if violent else f'{len(hot)} incidents/positions in 24 months')))
    return out


def merge(states, derived):
    """Derived escalation replaces the LOW baseline; otherwise a derived state is added only if its code is not already there."""
    repl = {d['replaces'] for d in derived if d.get('replaces')}
    codes = {s['code'] for s in states}
    out = [s for s in states if s['code'] not in repl]
    for d in derived:
        if d['code'] not in codes or d.get('replaces'):
            out.append(d)
    return out
