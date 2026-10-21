"""Structural states of a country pair, taken from DATA instead of from an LLM.

Sources
  wikidata  diplomatic relation (P530), resident embassies and the holders of the post that directs each one (P2389, P39), memberships (P463) in a verified list of blocs, territories claimed (P1336)
  wits      World Bank WITS: share of each country's exports/imports that goes to / comes from the other (latest year available)
  project   hard-country-data.ts (sanctions regimes by country) and RAW_SPECIAL_PAIR_STATUS in the seed script (strategic rivalries, defence treaties)
  derived   deterministic rules over the classified, verified facts (embassy state per side, standing measures, arms embargo, dispute escalation)

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
import embassy as EMB

PROJECT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))          # repository root (engine/relations/model -> ..)
HARD_FILE = f'{PROJECT}/lib/services/geopolitical/hard-country-data.ts'
SEED_FILE = f'{PROJECT}/scripts/seed_geopolitical_matrix.ts'
CACHE_FILE = os.path.join(HERE, 'data_cache.json')
BLOCS = json.load(open(os.path.join(HERE, 'bloc_qids.json')))
ISO3 = {'ES': 'ESP', 'MA': 'MAR', 'IL': 'ISR', 'US': 'USA', 'CN': 'CHN', 'IN': 'IND', 'CA': 'CAN', 'AU': 'AUS', 'SA': 'SAU', 'QA': 'QAT', 'CU': 'CUB', 'MN': 'MNG', 'SN': 'SEN'}
QID = {c: v['qid'] for c, v in F.COUNTRIES.items()}
_countries_file = os.path.join(HERE, '..', 'world', 'countries.json')
if os.path.exists(_countries_file):
    try:
        for _c in json.load(open(_countries_file, encoding='utf-8')):
            ISO3[_c['code']] = _c['iso3']
            QID[_c['code']] = _c['qid']
    except Exception:
        pass
# Denmark and the Netherlands: the UN member items are the kingdoms, and Wikidata records most of their embassies and memberships on them
# (Kingdom of Denmark: 91 embassies vs 6 on Denmark; Kingdom of the Netherlands: 113 vs 2). Both items are queried.
ALIASES = {'DK': ['Q756617'], 'NL': ['Q29999']}


def qids(code):
    return [QID[code]] + ALIASES.get(code, [])


def vals(code):
    return ' '.join(f'wd:{q}' for q in qids(code))


def akey(code):
    """Cache-key suffix for states whose answers now include the alias item."""
    return '-alias' if code in ALIASES else ''


# An embassy counts only while it is in use: not dissolved (P576), no end time (P582), not 'decommissioned', 'out of service', 'permanently / temporarily closed',
# 'hanging' or 'on hold' (P5817 state of use), and not typed 'defunct diplomatic mission'. Before this filter Russia's closed embassy in Kyiv or Israel's in
# Tehran counted as open.
ACTIVE_EMBASSY = ('FILTER NOT EXISTS { ?e wdt:P576 ?x0 } FILTER NOT EXISTS { ?e wdt:P582 ?x1 } '
                  'FILTER NOT EXISTS { ?e wdt:P5817 ?su . VALUES ?su { wd:Q11639308 wd:Q56651571 wd:Q104664889 wd:Q115754746 wd:Q97317113 wd:Q55653430 } } '
                  'FILTER NOT EXISTS { ?e wdt:P31 wd:Q80905563 }')
G7 = {'US', 'GB', 'CA', 'JP', 'FR', 'DE', 'IT'}
EU_ALIGNED = {'GB', 'NO', 'CH', 'IS', 'LI'}          # apply the EU's sanctions regimes (UK through its own mirror regimes)
# Rivalry declared in an alliance's official doctrine: NATO Strategic Concept 2022 names Russia "the most significant and direct threat" to Allies.
BLOC_THREAT = {'NATO': ({'RU'}, 'NATO Strategic Concept 2022: Russia is the most significant and direct threat')}
REVIEWED_FILE = os.path.join(HERE, 'reviewed_facts.json')
DEFENSE_TITLE = re.compile(r'mutual defen[cs]e|mutual cooperation and security|security treaty|joint defen[cs]e|defen[cs]e (treaty|pact|agreement)|mutual (aid|assistance)', re.I)


def reviewed_facts():
    """{(a, b): [fact]} from reviewed_facts.json (hand-reviewed structural facts with their source)."""
    out = {}
    try:
        for f in json.load(open(REVIEWED_FILE))['facts']:
            out.setdefault(tuple(f['pair'].split('-')), []).append(f)
    except FileNotFoundError:
        pass
    return out


_REVIEWED = None


def sanctions_lifted():
    try:
        return json.load(open(REVIEWED_FILE)).get('sanctionsLifted', [])
    except FileNotFoundError:
        return []


def reviewed_for(a, b):
    global _REVIEWED
    if _REVIEWED is None:
        _REVIEWED = reviewed_facts()
    return _REVIEWED.get(tuple(sorted((a, b))), [])


CLAIMS_FILE = os.path.join(HERE, 'territorial_claims.json')
_CLAIMS_DATA = None
_CLAIMS_INDEX = None
_THIRD_PARTY_INDEX = None
_EXCLUDED_PAIRS = None
_UNREVIEWED_PAIRS = set()


def load_claims_registry():
    global _CLAIMS_DATA, _CLAIMS_INDEX, _THIRD_PARTY_INDEX, _EXCLUDED_PAIRS
    if _CLAIMS_DATA is not None:
        return _CLAIMS_DATA
    try:
        _CLAIMS_DATA = json.load(open(CLAIMS_FILE, encoding='utf-8'))
    except Exception:
        _CLAIMS_DATA = {'claims': [], 'excluded': []}

    _CLAIMS_INDEX = {}
    _THIRD_PARTY_INDEX = {}
    _EXCLUDED_PAIRS = set()

    for ex in _CLAIMS_DATA.get('excluded', []):
        for p in ex.get('pairs', []):
            _EXCLUDED_PAIRS.add(tuple(sorted(p.split('-'))))

    for c in _CLAIMS_DATA.get('claims', []):
        admin = c.get('administeredBy')
        admin_code = admin if isinstance(admin, str) else admin.get('entity')
        claimants = c.get('claimants', [])

        for cl in claimants:
            cl_code = cl if isinstance(cl, str) else cl.get('entity')
            if admin_code and cl_code and admin_code != cl_code:
                pair = tuple(sorted((admin_code, cl_code)))
                _CLAIMS_INDEX.setdefault(pair, []).append((c, 'admin_vs_claimant', admin_code, cl_code))

            for cl2 in claimants:
                cl2_code = cl2 if isinstance(cl2, str) else cl2.get('entity')
                if cl_code and cl2_code and cl_code != cl2_code:
                    pair = tuple(sorted((cl_code, cl2_code)))
                    _CLAIMS_INDEX.setdefault(pair, []).append((c, 'co_claimants', cl_code, cl2_code))

        for tp in c.get('thirdParty', []):
            tp_country = tp.get('country')
            stance = tp.get('stance')
            if not tp_country or not stance:
                continue

            if admin_code and admin_code != tp_country:
                pair = tuple(sorted((tp_country, admin_code)))
                rel = 'CLAIM_STANCE_SUPPORT' if stance == 'supports_administrator' else 'CLAIM_STANCE_OPPOSE'
                _THIRD_PARTY_INDEX.setdefault(pair, []).append((c, tp, rel, admin_code))

            for cl in claimants:
                cl_code = cl if isinstance(cl, str) else cl.get('entity')
                if cl_code and cl_code != tp_country:
                    pair = tuple(sorted((tp_country, cl_code)))
                    rel = 'CLAIM_STANCE_SUPPORT' if stance == 'supports_claimant' else 'CLAIM_STANCE_OPPOSE'
                    _THIRD_PARTY_INDEX.setdefault(pair, []).append((c, tp, rel, cl_code))

    return _CLAIMS_DATA


def save_unreviewed_claims(path=None):
    if path is None:
        path = os.path.join(HERE, '..', 'world', 'out', 'claims_unreviewed.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(sorted(_UNREVIEWED_PAIRS), f, indent=2)

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
BLOC_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bloc_memberships.json')
try:
    BLOC_REVIEW = json.load(open(BLOC_FILE))
except FileNotFoundError:
    BLOC_REVIEW = {'members': {}, 'status': [], 'associates': [], 'blocState': {}}
BLOC_STATE.update({b: v['state'] for b, v in BLOC_REVIEW.get('blocState', {}).items()})      # AfCFTA counts as preferential trade, not a working FTA
NOT_MEMBER = ('suspended', 'observer', 'left', 'non-party')


def bloc_since(bloc, a, b):
    """Date from which both are members of a reviewed bloc (entry into force for each member), so past dates are scored with the agreements of the time."""
    m = BLOC_REVIEW.get('members', {}).get(bloc)
    if not m or not m.get('since'):
        return None
    return max(m.get('memberSince', {}).get(c, m['since']) for c in (a, b))
STATE_RANK = ['DEFENSE_ALLIANCE', 'DEEP_INTEGRATION', 'FTA_IN_FORCE', 'INTEL_ALLIANCE', 'PREFERENTIAL_TRADE', 'SHARED_FORUM']

DATA_SOURCES = [
    ('FULL_DIPLOMATIC / NONRESIDENT_RELATIONS', 'Wikidata', 'Relación diplomática (P530) y embajadas residentes en uso de cada país en el otro (se descartan las disueltas, con fecha de fin, «decommissioned», «out of service», cerradas o en suspenso). Dinamarca y Países Bajos se consultan también con el elemento del Reino. Dos embajadas = lado doble; si Wikidata calla no se puntúa nada.'),
    ('NO_RELATIONS (datos)', 'Wikidata (P530 con fecha de fin)', 'Las declaraciones de relación de un lado sobre el otro tienen todas fecha de fin y el otro lado no tiene una abierta o alguna embajada no está en uso. Taiwán queda fuera: perder el reconocimiento formal no es hostilidad.'),
    ('ARMED_CONFLICT, OCCUPATION, NO_RELATIONS, NON_RECOGNITION, PROXY_HOSTILITY, HISTORICAL_WAR, disputas militarizadas, alianzas bilaterales, aliado principal no OTAN', 'Hechos revisados (reviewed_facts.json)', 'Hechos estructurales que ninguna fuente libre recoge de forma fiable, revisados a mano con su fuente y fecha (conflictos candidatos de Wikidata, lista de Estados patrocinadores del terrorismo, no reconocimiento de Israel, etc.). Deben revisarse cuando cambie la situación; entre revisiones los cambios los capta la capa de hechos.'),
    ('DEFENSE_ALLIANCE, DEEP_INTEGRATION, INTEL_ALLIANCE, FTA_IN_FORCE, PREFERENTIAL_TRADE, SHARED_FORUM', 'Wikidata (P463) + pertenencias revisadas (bloc_memberships.json)',
     'Pertenencia vigente de ambos como miembros plenos a la misma organización de una lista cerrada de 32 bloques (23 más CEDEAO, SADC, Comunidad de África Oriental, CARICOM, Comunidad Andina, Alianza del Pacífico, Alianza de Estados del Sahel, SAARC y Foro de las Islas del Pacífico, con listas oficiales). Wikidata no distingue estados: las listas oficiales sustituyen a Wikidata en Mercosur, UEEA, CCG, CELAC, T-MEC, CPTPP, RCEP, ASEAN y OCS, y los suspendidos, observadores, salidos o no firmantes no cuentan (Venezuela y México en Mercosur, las suspensiones de la Unión Africana, Angola en la OPEP, Eritrea en la zona africana). Los asociados con acuerdo comercial (Chile, Perú, Colombia, Ecuador con Mercosur) reciben ese acuerdo con cada miembro. La zona de libre comercio africana cuenta como acuerdo preferencial. Un par con libre comercio no suma además el preferencial.'),
    ('HUMAN_TIES', 'ONU (UN DESA, migrantes por origen y destino 2024) + Banco Mundial (población)', f'Nacidos en un país que viven en el otro, en las dos direcciones. Valor completo con ≥ {HUMAN_FULL_ABS:,} personas o ≥ {HUMAN_FULL_SHARE:g} % de la población del país de destino; proporcional por debajo; se ignora bajo el {int(HUMAN_MIN_SCALE * 100)} %. Cuenta lugar de nacimiento, no nacionalidad.'),
    ('TRADE_HIGH / TRADE_MEDIUM', 'Banco Mundial WITS', f'Mayor de las cuatro cuotas bilaterales (exportaciones e importaciones de cada país con el otro): ≥ {TRADE_HIGH_PCT:g} % alta, ≥ {TRADE_MEDIUM_PCT:g} % media.'),
    ('TERRITORIAL_DISPUTE_LOW / ACTIVE / MILITARIZED / OCCUPATION, CLAIM_STANCE_SUPPORT / OPPOSE', 'Registro revisado (territorial_claims.json) + Wikidata (P1336) + posturas de terceros', 'Territorios reclamados con estado revisado (latente, activa, militarizada, ocupación). Salience scale (core 1.0, major 0.75, minor 0.35); factor 0.4 entre co-reclamantes. Alianzas con disputa activa reducen garantía defensiva al 50 %. Posturas de terceros apoyan (+10) u oponen (-12).'),
    ('SANCTIONS_REGIME_* / TECH_RESTRICTIONS / ARMS_EMBARGO_IN_FORCE', 'Proyecto (hard-country-data.ts)', 'Regímenes por país sancionado, asignados a EE. UU., UE o G7 según el nombre del régimen; solo cuenta si el otro país de la pareja es el que sanciona. Un régimen solo de la ONU no cuenta como acto bilateral.'),
    ('DEFENSE_ALLIANCE (tratados)', 'Wikidata (tratados bilaterales)', 'Tratado bilateral en vigor cuyo título indica defensa mutua, asistencia mutua o seguridad (salvo los marcados como extinguidos en los hechos revisados).'),
    ('STRATEGIC_RIVALRY, DEFENSE_ALLIANCE bilateral', 'Proyecto (seed_geopolitical_matrix.ts)', 'Tabla de pares especiales: competencia estratégica o adversario sancionado ⇒ rivalidad; "defensa mutua" en la nota ⇒ alianza.'),
    ('BILATERAL_TREATIES', 'Wikidata (tratados bilaterales)', 'Tratados con como máximo 3 Estados parte entre los dos países, sin fecha de fin, cuyo título indica inversiones, cooperación, defensa, seguridad, información clasificada, fiscalidad, extradición o comercio. Se deduplican por título. Cobertura parcial de Wikidata.'),
    ('SHARED_LANGUAGE', 'Wikidata (P37)', 'Los dos países tienen al menos una lengua oficial en común.'),
    ('TRADE_WAR', 'Proyecto (tabla de pares especiales)', 'La nota del par menciona aranceles cruzados o guerra comercial: estado completo.'),
    ('AMBASSADOR_ABSENT (estado de embajada)', 'Hechos + Wikidata (P2389, P39) + reverificación', 'Estado de cada lado (el jefe de misión de un país en el otro): AUSENTE tras una retirada propia o una expulsión por el otro (embajador, alto comisionado, encargado de negocios), sin límite de tiempo, hasta que lo termina una restauración o normalización ejecutada, un titular que Wikidata registra en el cargo después, o la reverificación web; PRESENTE si hubo restauración o Wikidata tiene un titular seguro en esa fecha (inicio redondeado al final de su periodo; sin fecha de fin vale como máximo 6 años); DESCONOCIDO en otro caso (un hueco en Wikidata no se lee como ausencia). Solo AUSENTE puntúa (−10 por lado).'),
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
    if key in c and (os.environ.get('WGE_OFFLINE') or time.time() - c[key][0] < ttl):     # WGE_OFFLINE=1: never refresh (reproducible runs)
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
    q = f'SELECT DISTINCT ?o WHERE {{ VALUES ?c {{ {globals()["vals"](code)} }} ?c p:P463 ?s. ?s ps:P463 ?o. FILTER NOT EXISTS {{ ?s pq:P582 ?e }} VALUES ?o {{ {vals} }} }}'
    have = {r['o']['value'].split('/')[-1] for r in cached(f'wd-member-{code}{akey(code)}', lambda: sparql(q))}
    out = {k for k, v in BLOCS.items() if v in have}
    # Reviewed membership (bloc_memberships.json): official lists replace Wikidata for the blocs listed there, and suspended / observer / departed /
    # non-party states are removed for every bloc, because Wikidata records them as plain members.
    for bloc, m in BLOC_REVIEW.get('members', {}).items():
        out.discard(bloc)
        if code in m['list']:
            out.add(bloc)
    for st in BLOC_REVIEW.get('status', []):
        if st['country'] == code and st['status'] in NOT_MEMBER:
            out.discard(st['bloc'])
    return out


def p530_status(a, b):
    """Diplomatic-relation statements (P530, normal or preferred rank) in each direction: {a: 'open' | 'ended' | None, b: ...}.
    'ended' = every statement of that side about the other has an end time (relations severed and not restored per Wikidata)."""
    rows = cached(f'wd-p530b-{a}-{b}{akey(a)}{akey(b)}', lambda: sparql(f'''SELECT ?x ?y ?end WHERE {{ {{ VALUES ?x {{ {vals(a)} }} VALUES ?y {{ {vals(b)} }} }} UNION {{ VALUES ?x {{ {vals(b)} }} VALUES ?y {{ {vals(a)} }} }}
        ?x p:P530 ?st . ?st ps:P530 ?y ; wikibase:rank ?rk . FILTER(?rk != wikibase:DeprecatedRank) OPTIONAL {{ ?st pq:P582 ?end }} }}'''))
    side = {q: c for c in (a, b) for q in qids(c)}
    out = {a: None, b: None}
    for r in rows:
        c = side.get(r['x']['value'].split('/')[-1])
        if c:
            out[c] = 'open' if ('end' not in r or out[c] == 'open') else 'ended'
    return out


def active_embassy_sides(a, b):
    """Which of the two countries has an embassy in use in the other."""
    emb = cached(f'wd-emb2-{a}-{b}{akey(a)}{akey(b)}', lambda: sparql(f'''SELECT ?op (COUNT(DISTINCT ?e) AS ?n) WHERE {{
        {{ VALUES ?op {{ {vals(a)} }} VALUES ?loc {{ {vals(b)} }} }} UNION {{ VALUES ?op {{ {vals(b)} }} VALUES ?loc {{ {vals(a)} }} }}
        ?e wdt:P31/wdt:P279* wd:Q3917681; wdt:P137 ?op; wdt:P17 ?loc. {ACTIVE_EMBASSY} }} GROUP BY ?op'''))
    ops = {r['op']['value'].split('/')[-1] for r in emb if int(r['n']['value']) > 0}
    return {c for c in (a, b) if set(qids(c)) & ops}


def diplomacy(a, b):
    """(relations open per Wikidata, number of sides with an embassy in use, P530 status per side)."""
    st = p530_status(a, b)
    return 'open' in st.values(), len(active_embassy_sides(a, b)), st


def heads_in(sender, host):
    """Tenures of the sender's heads of mission in the host (one cached query per SENDING country, so all pairs of that country reuse it)."""
    rows = cached(f'wd-heads-{sender}{akey(sender)}', lambda: sparql(EMB.heads_query(qids(sender))), ttl=30 * 86400)
    return EMB.tenures_from_rows(rows, QID[host])


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
      VALUES ?qa {{ {vals(a)} }} VALUES ?qb {{ {vals(b)} }} ?t ?pr ?qa. ?t ?pr2 ?qb. ?t ?pr3 ?party. FILTER(?pr3 IN (wdt:P1891, wdt:P6193, wdt:P17))
      OPTIONAL {{ ?t wdt:P576 ?e }} SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}
      GROUP BY ?t ?tLabel HAVING(COUNT(DISTINCT ?party) <= 3) LIMIT 30'''
    return filter_treaties(cached(f'wd-treaties-{a}-{b}{akey(a)}{akey(b)}', lambda: sparql(q)))


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
    return dict(code='HUMAN_TIES', scale=round(sc, 2), source='un-desa', evidence=f'{big[1]}: {int(big[0]):,} people' + (f' ({big[0] / big[2] * 100:.2f} % of the destination)' if big[2] else '') + '; UN DESA 2024'), log      # no population figure for Taiwan in the World Bank


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
        if r.startswith('G7_'):
            s.add('G7')
        if r.startswith('EU_') or '_EU' in r or r.startswith('EU'):
            s.add('EU')
        if r.startswith('UNSC'):
            s.add('UN')
    return s


# ─── build ────────────────────────────────────────────────────────────────────
def build_states(a, b):
    """Data-backed structural states + a log of what each source returned (including silences)."""
    states, log = [], {}
    related, sides, p530 = diplomacy(a, b)
    log['wikidata.diplomacy'] = dict(P530=related, residentEmbassySides=sides, p530=p530)
    rev = [f for f in reviewed_for(a, b) if not f.get('reject')]
    rejected = {f['code'] for f in reviewed_for(a, b) if f.get('reject')}
    log['reviewed'] = [f['code'] for f in rev]
    # Severed per Wikidata: relation statements exist and ALL have an end time (no side keeps an open one), and neither country has an embassy in use in
    # the other. A looser rule (one side ended) misread 15 of 27 pairs whose restoration Wikidata never recorded (China with 11 states that recognise it
    # today, Germany-Somalia, Saudi Arabia-Iran and -Qatar). Taiwan is left out: losing formal recognition is not hostility.
    severed = ('TW' not in (a, b) and 'ended' in p530.values() and 'open' not in p530.values() and sides == 0)
    no_rel = severed or any(f['code'] in ('NO_RELATIONS', 'NON_RECOGNITION') for f in rev)
    if severed and not any(f['code'] == 'NO_RELATIONS' for f in rev):
        states.append(dict(code='NO_RELATIONS', source='wikidata', evidence=f'relation statements ended: {p530}; embassies in use: {sides}'))
    if not no_rel:
        if sides >= 1:
            states.append(dict(code='FULL_DIPLOMATIC', sides=sides, source='wikidata', evidence=f'{sides} resident embassy(ies) in use; P530={related}'))
        elif related:
            states.append(dict(code='NONRESIDENT_RELATIONS', source='wikidata', evidence='P530 present, no resident embassy in use'))
    pair_tuple = tuple(sorted((a, b)))
    load_claims_registry()
    has_registry_claims = pair_tuple in _CLAIMS_INDEX

    for f in rev:
        if has_registry_claims and f['code'] in ('TERRITORIAL_DISPUTE_LOW', 'TERRITORIAL_DISPUTE_ACTIVE', 'TERRITORIAL_DISPUTE_MILITARIZED', 'OCCUPATION'):
            continue
        states.append(dict(code=f['code'], since=f.get('since'), source='reviewed', evidence=f['source'][:120]))

    ten = {a: heads_in(a, b), b: heads_in(b, a)}
    log['wikidata.heads'] = {k: len(v) for k, v in ten.items()}
    states.append(dict(code='EMBASSY_HEADS', source='wikidata', tenures=ten, evidence=f"Wikidata holders: {a} {len(ten[a])}, {b} {len(ten[b])}"))

    ma, mb = memberships(a), memberships(b)
    shared = ma & mb
    log['wikidata.memberships'] = dict(a=sorted(ma), b=sorted(mb), shared=sorted(shared))
    implied = {}
    for blk in sorted(shared):
        implied.setdefault(BLOC_STATE[blk], []).append(blk)
    for code, blks in implied.items():
        if code == 'SHARED_FORUM' and any(c in implied for c in ('DEFENSE_ALLIANCE', 'DEEP_INTEGRATION')):
            continue          # forums add nothing next to an alliance or deep integration
        dates = [bloc_since(blk, a, b) for blk in blks]
        since = min(dates) if dates and all(dates) else None             # the state exists once the earliest of its blocs applies to both
        states.append(dict(code=code, source='wikidata+reviewed', since=since, evidence='shared: ' + ', '.join(blks)))
    # associated states: a trade agreement between the bloc and the associate applies to each bloc member (e.g. Chile-Mercosur ACE 35)
    for asc in BLOC_REVIEW.get('associates', []):
        for x, y, my in ((a, b, mb), (b, a, ma)):
            if x == asc['country'] and asc['bloc'] in my:
                states.append(dict(code=asc['state'], source='reviewed', since=asc.get('since'), evidence=f"{asc['bloc']} associate: {asc['source']}"))

    for bloc, (targets, why) in BLOC_THREAT.items():
        for member, target in ((a, b), (b, a)):
            if target in targets and bloc in (ma if member == a else mb):
                states.append(dict(code='STRATEGIC_RIVALRY', source='doctrine', evidence=why))
    # ── Territorial claims registry ──────────────────────────────────────────
    c_list = _CLAIMS_INDEX.get(pair_tuple, [])
    log['claims.registry'] = [c['id'] for c, _, _, _ in c_list]

    if c_list:
        severity_rank = {'occupied': 5, 'militarized': 4, 'active': 3, 'latent': 2, 'frozen': 1, 'resolved': 0}
        sorted_claims = sorted(c_list, key=lambda item: (
            severity_rank.get(item[0].get('status', 'latent'), 0),
            1 if item[1] == 'admin_vs_claimant' else 0,
            1.0 if item[0].get('salience') == 'core' else (0.75 if item[0].get('salience') == 'major' else 0.35)
        ), reverse=True)

        all_pair_claim_ids = sorted(list(set(item[0]['id'] for item in c_list)))

        for c, role, side_a, side_b in sorted_claims:
            status = c.get('status', 'latent')
            salience = c.get('salience', 'major')
            salience_scale = 1.0 if salience == 'core' else (0.75 if salience == 'major' else 0.35)
            role_mult = 0.4 if role == 'co_claimants' else 1.0
            status_scale = 0.5 if status == 'frozen' else 1.0
            scale = round(salience_scale * role_mult * status_scale, 2)

            since = c.get('since') or c.get('statusSince')
            evidence = f"{c['id']}: {c['nameEs']} ({status}, salience {salience}{', co-claimants' if role == 'co_claimants' else ''})"

            if status == 'occupied':
                states.append(dict(code='OCCUPATION', source='claims_registry', since=since, scale=scale, claim_id=c['id'], claim_ids=all_pair_claim_ids, evidence=evidence))
            elif status == 'militarized':
                states.append(dict(code='TERRITORIAL_DISPUTE_MILITARIZED', source='claims_registry', since=since, scale=scale, claim_id=c['id'], claim_ids=all_pair_claim_ids, evidence=evidence))
            elif status == 'active':
                states.append(dict(code='TERRITORIAL_DISPUTE_ACTIVE', source='claims_registry', since=since, scale=scale, claim_id=c['id'], claim_ids=all_pair_claim_ids, evidence=evidence))
            elif status == 'resolved':
                until = c.get('resolvedOn')
                if until:
                    states.append(dict(code='TERRITORIAL_DISPUTE_LOW', source='claims_registry', since=since, until=until, scale=scale, claim_id=c['id'], claim_ids=all_pair_claim_ids, evidence=evidence))
            else:  # latent or frozen
                states.append(dict(code='TERRITORIAL_DISPUTE_LOW', source='claims_registry', since=since, scale=scale, claim_id=c['id'], claim_ids=all_pair_claim_ids, evidence=evidence))

    # ── Third-party stances on core territorial claims ────────────────────────
    stances = _THIRD_PARTY_INDEX.get(pair_tuple, [])
    for c, tp, stance_code, target_code in stances:
        since = tp.get('since')
        evidence = f"{tp.get('country')} postura sobre {c['nameEs']} ({c['id']}): {tp.get('stance')}"
        states.append(dict(code=stance_code, source='claims_registry_stance', since=since, claim_id=c['id'], claim_ids=[c['id']], evidence=evidence))

    # ── Fallback for unreviewed Wikidata P1336 claims ─────────────────────────
    cl = claims(a, b)
    log['wikidata.claims'] = cl
    if not c_list and pair_tuple not in _EXCLUDED_PAIRS:
        escalated = any(f['code'] in ('TERRITORIAL_DISPUTE_ACTIVE', 'TERRITORIAL_DISPUTE_MILITARIZED') for f in rev)
        if cl and 'TERRITORIAL_DISPUTE_LOW' not in rejected and not escalated:
            states.append(dict(code='TERRITORIAL_DISPUTE_LOW', source='wikidata', evidence='; '.join(f'{k}: {", ".join(v[:4])}{"…" if len(v) > 4 else ""}' for k, v in cl.items())))
            _UNREVIEWED_PAIRS.add('-'.join(pair_tuple))

    vals, years = trade_pair(a, b)
    log['wits'] = dict(shares_pct=vals, years=years)
    if vals:
        top = max(vals, key=vals.get)
        code = 'TRADE_HIGH' if vals[top] >= TRADE_HIGH_PCT else 'TRADE_MEDIUM' if vals[top] >= TRADE_MEDIUM_PCT else None
        if code:
            states.append(dict(code=code, source='wits', evidence=f'{top}: {vals[top]:.1f} %'))

    hard = hard_data()
    lifted = {x['target'] for x in sanctions_lifted()}
    eu = {c for c in (a, b) if 'EU' in memberships(c)}
    for tgt, other in ((a, b), (b, a)):
        h = hard.get(tgt)
        if not h or tgt in lifted:                  # the project's list can lag behind a lifting (Syria 2025): reviewed_facts.json 'sanctionsLifted'
            continue
        auth = authorities(h['regimes'])
        # A UN Security Council regime binds every member but is not a bilateral act: before this rule North Korea came out 'tense' with China and Russia
        # and Somalia with Spain. It counts only when the other country also sanctions unilaterally (US, EU, G7).
        applies = ('US' in auth and other == 'US') or ('EU' in auth and (other in eu or other in EU_ALIGNED)) or ('G7' in auth and other in G7)
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
        defence = [t for t in tr if DEFENSE_TITLE.search(t)]
        if defence and 'DEFENSE_ALLIANCE' not in rejected:
            states.append(dict(code='DEFENSE_ALLIANCE', source='wikidata', evidence='defence treaty: ' + defence[0][:90]))
    langs = shared_languages(a, b)
    log['wikidata.sharedLanguages'] = langs
    if langs:
        states.append(dict(code='SHARED_LANGUAGE', source='wikidata', evidence=', '.join(langs[:3])))

    if sp and re.search(r'aranceles cruzados|guerra comercial|trade war', sp['note'], re.I):
        states.append(dict(code='TRADE_WAR', source='project', evidence=sp['note'][:80]))

    if any(s['code'] == 'FTA_IN_FORCE' for s in states):          # one trade agreement level: a free-trade area already covers the preferential one
        states = [s for s in states if s['code'] != 'PREFERENTIAL_TRADE']
    if 'DEFENSE_ALLIANCE' in rejected:              # e.g. a terminated treaty still listed without end date, or a frozen membership (Armenia in the CSTO)
        states = [s for s in states if s['code'] != 'DEFENSE_ALLIANCE']

    # Intra-alliance dispute discount:
    # If formal defense allies have an active or militarized territorial dispute
    # (e.g. Greece and Turkey in the Aegean), mutual defense commitments are severely
    # compromised between them; alliance guarantee is discounted by 50 %.
    has_active_or_militarized_dispute = any(c.get('status') in ('active', 'militarized') for c, role, _, _ in c_list if role == 'admin_vs_claimant')
    if has_active_or_militarized_dispute:
        for s in states:
            if s['code'] == 'DEFENSE_ALLIANCE':
                s['scale'] = round(s.get('scale', 1.0) * 0.5, 2)
                s['evidence'] = s.get('evidence', '') + ' (intra-alliance dispute discount: 0.5)'

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

    # embassy state per side (embassy.py, protocol_embassy.py): ABSENT after a recall / expulsion of the head of mission until a restoration (event, Wikidata holder or
    # re-verification), with no time limit; PRESENT / UNKNOWN otherwise. Only ABSENT is scored. RELATIONS_SEVERED gives NO_RELATIONS instead (below).
    heads = next((s for s in states if s.get('code') == 'EMBASSY_HEADS'), {}).get('tenures', {})
    status = EMB.pair_status(a, b, facts, heads, at)
    out.append(dict(code='EMBASSY_STATUS', source='derived', sides=status,
                    evidence='; '.join(f"{k}: {v['status']}" + (f" since {v['since']}" if v['since'] else '') + f" ({v['source']})" for k, v in status.items())))
    absent = {k: v['since'] for k, v in status.items() if v['status'] == 'ABSENT'}
    if absent and not by('RELATIONS_SEVERED') and not (have & {'NO_RELATIONS', 'NON_RECOGNITION'}):
        out.append(dict(code='AMBASSADOR_ABSENT', sides=len(absent), since=min(absent.values()), source='derived', sideDates=dict(absent),
                        evidence='head of mission absent for ' + ', '.join(f'{k} (since {v})' for k, v in absent.items()) + ', no later restoration'))

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
