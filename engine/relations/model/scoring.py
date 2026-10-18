"""Bilateral relationship score R in [-200, +200].

    R = S_struct + S_dyn
      S_struct in (-100, +100): what is IN FORCE between the two states (treaties, alliances, sanctions regimes,
                                disputes, diplomatic representation, interdependence) + historical memory.
                                States do not decay while in force; after they end they fade (half-life 1 year).
      S_dyn    in (-100, +100): EVENTS (visits, agreements signed, expulsions, sanctions imposed, incidents...),
                                each worth base x multipliers, decaying exponentially with a half-life set per event type.
    Both are saturated with tanh, so piling up events or treaties approaches the bound without exceeding it.

This file is the single source of truth: the catalogs below are what the classifier may use, and the
documentation (render_doc) is generated from them.
"""
import math, re
from datetime import date

# ─── Event catalog: code -> (label, base points, half-life in days, category) ───────────────────────
# Base points are the impact of the event done by a head of state/government, executed, well sourced.
EVENTS = {
    # Diplomatic contact
    'STATE_VISIT':          ('Visita de Estado u oficial de un jefe de Estado o de Gobierno', +12, 120, 'Contacto diplomático'),
    'SUMMIT':               ('Cumbre bilateral / reunión intergubernamental de alto nivel', +10, 120, 'Contacto diplomático'),
    'MINISTERIAL_VISIT':    ('Visita o reunión ministerial bilateral', +5, 60, 'Contacto diplomático'),
    'LEADER_CALL':          ('Llamada telefónica entre líderes', +3, 30, 'Contacto diplomático'),
    'SIDELINES_MEETING':    ('Encuentro en los márgenes de una cumbre multilateral', +2, 30, 'Contacto diplomático'),
    'JOINT_DECLARATION':    ('Declaración conjunta / hoja de ruta bilateral', +8, 180, 'Contacto diplomático'),
    'POSITIVE_STATEMENT':   ('Declaración oficial de apoyo, elogio o buena voluntad', +2, 30, 'Contacto diplomático'),
    'SYMBOLIC_GESTURE':     ('Gesto simbólico (aniversario, regalo de Estado, condecoración)', +2, 60, 'Contacto diplomático'),
    'HUMANITARIAN_AID':     ('Ayuda humanitaria o condolencias oficiales tras una catástrofe', +3, 60, 'Contacto diplomático'),
    # Agreements and de-escalation
    'DEFENSE_TREATY_SIGNED':  ('Firma de tratado de defensa o seguridad', +30, 365, 'Acuerdos'),
    'TRADE_AGREEMENT_SIGNED': ('Firma de acuerdo comercial (TLC, CEPA, asociación económica)', +20, 365, 'Acuerdos'),
    'FRIENDSHIP_TREATY_SIGNED': ('Firma de tratado de amistad, cooperación o buena vecindad', +15, 730, 'Acuerdos'),
    'TRADE_TALKS_CONCLUDED':  ('Cierre de negociaciones comerciales', +12, 180, 'Acuerdos'),
    'TRADE_TALKS_LAUNCHED':   ('Inicio o relanzamiento de negociaciones comerciales', +6, 120, 'Acuerdos'),
    'NEGOTIATION_ROUND':      ('Ronda de negociación (sin cierre)', +2, 45, 'Acuerdos'),
    'SECTORAL_AGREEMENTS':    ('Paquete de acuerdos sectoriales o memorandos (energía, educación, justicia...)', +5, 180, 'Acuerdos'),
    'FINANCING_PACKAGE':      ('Financiación, crédito o ayuda económica de un gobierno al otro', +4, 180, 'Acuerdos'),
    'INVESTMENT_DEAL':        ('Gran inversión respaldada por un gobierno (≥ 1.000 M USD)', +5, 180, 'Acuerdos'),
    'DEFENSE_DEAL':           ('Venta de armas, coproducción o ejercicio militar conjunto', +6, 365, 'Acuerdos'),
    'SECURITY_COOPERATION':   ('Cooperación policial, judicial o de inteligencia (operación conjunta, extradición)', +3, 90, 'Acuerdos'),
    'DE_ESCALATION':          ('Tregua, rebaja de aranceles o retirada de medidas de presión', +10, 180, 'Acuerdos'),
    'SANCTIONS_LIFTED':       ('Levantamiento de sanciones', +15, 365, 'Acuerdos'),
    'AMBASSADOR_RESTORED':    ('Regreso o nombramiento de embajador tras una crisis', +12, 180, 'Acuerdos'),
    'NORMALIZATION':          ('Normalización: restablecer relaciones, acuerdo de paz', +40, 730, 'Acuerdos'),
    'CORE_SUPPORT':           ('Apoyo a un interés central del otro (reconocer su postura territorial, votar a favor en la ONU)', +20, 730, 'Acuerdos'),
    # Diplomatic friction
    'CRITICISM':              ('Crítica o condena oficial', -3, 30, 'Fricción diplomática'),
    'HARSH_RHETORIC':         ('Acusación grave o amenaza verbal de un líder ("genocidio", "chantaje", "pagarán")', -6, 45, 'Fricción diplomática'),
    'PROTEST_SUMMONS':        ('Protesta formal / convocatoria del embajador o encargado de negocios', -6, 60, 'Fricción diplomática'),
    'VISA_RESTRICTION':       ('Suspensión o restricción de visados a los nacionales del otro país', -8, 120, 'Fricción diplomática'),
    'TALKS_SUSPENDED':        ('Suspensión, pausa o aplazamiento de negociaciones, misiones comerciales o diálogos bilaterales', -6, 90, 'Fricción diplomática'),
    'DIPLOMATIC_BOYCOTT':     ('Boicot diplomático (plantón, ausencia deliberada, retirada de un evento)', -5, 60, 'Fricción diplomática'),
    'AMBASSADOR_RECALL':      ('Llamada a consultas o retirada del embajador', -15, 180, 'Fricción diplomática'),
    'EXPULSION':              ('Expulsión de diplomáticos', -20, 240, 'Fricción diplomática'),
    'RELATIONS_DOWNGRADE':    ('Rebaja formal del nivel de relaciones', -30, 365, 'Fricción diplomática'),
    'RELATIONS_SEVERED':      ('Ruptura de relaciones diplomáticas', -60, 730, 'Fricción diplomática'),
    'CORE_HOSTILE_POSITION':  ('Postura contra un interés central del otro (reconocer a su rival o su territorio en disputa)', -15, 365, 'Fricción diplomática'),
    'HOSTILE_LEGISLATION':    ('Ley o acto interno dirigido contra un interés del otro', -8, 180, 'Fricción diplomática'),
    # Economic coercion
    'TRADE_RESTRICTION':      ('Aranceles o restricciones comerciales impuestas', -12, 180, 'Coerción económica'),
    'SANCTIONS_TARGETED':     ('Sanciones selectivas (personas, empresas, sectores)', -12, 240, 'Coerción económica'),
    'SANCTIONS_BROAD':        ('Sanciones amplias o embargo comercial', -30, 365, 'Coerción económica'),
    'ARMS_EMBARGO':           ('Embargo de armas', -15, 365, 'Coerción económica'),
    'EXPORT_CONTROLS':        ('Controles de exportación dirigidos al otro (tecnología, materias primas)', -10, 240, 'Coerción económica'),
    'SUPPLY_CUT':             ('Corte de suministro (energía, combustible, materias primas)', -15, 120, 'Coerción económica'),
    'INVESTMENT_BLOCK':       ('Veto a inversiones o expropiación', -10, 240, 'Coerción económica'),
    # Security
    'ESPIONAGE':              ('Caso de espionaje atribuido por un gobierno (detenciones, expulsiones)', -10, 180, 'Seguridad'),
    'CYBERATTACK':            ('Ciberataque atribuido oficialmente', -15, 240, 'Seguridad'),
    'POLITICAL_DETENTION':    ('Detención política de un nacional del otro', -8, 180, 'Seguridad'),
    'SOVEREIGNTY_VIOLATION':  ('Violación de espacio aéreo o aguas territoriales', -12, 120, 'Seguridad'),
    'BORDER_INCIDENT':        ('Incidente fronterizo sin víctimas', -10, 120, 'Seguridad'),
    'MIGRATION_WEAPONIZATION':('Uso de flujos migratorios como presión, atribuido por un gobierno', -25, 365, 'Seguridad'),
    'MILITARY_PRESSURE':      ('Despliegue o maniobras militares dirigidas contra el otro (NO incluye reforzar la propia frontera ante flujos migratorios: eso es NONE)', -8, 90, 'Seguridad'),
    'LETHAL_INCIDENT':        ('Incidente con víctimas mortales entre fuerzas de ambos', -30, 730, 'Seguridad'),
    'STATE_ATTACK':           ('Asesinato o atentado atribuido a un Estado', -40, 1095, 'Seguridad'),
    'ARMED_CLASH':            ('Enfrentamiento armado', -50, 1095, 'Seguridad'),
    'WAR':                    ('Invasión o declaración de guerra', -90, 1825, 'Seguridad'),
    # Zero-weight (kept as context, never moves the score)
    'NONE':                   ('Contexto: asunto interno, decisión judicial, acto de un tercero, evento multilateral sin ángulo bilateral', 0, 30, 'Sin peso'),
}

# ─── Structural catalog: code -> (label, points while in force, group) ────────────────────────────
STATES = {
    'FULL_DIPLOMATIC':        ('Relaciones diplomáticas con embajadas residentes', +10, 'Representación'),
    'NONRESIDENT_RELATIONS':  ('Relaciones diplomáticas sin embajada residente (acreditación múltiple)', +3, 'Representación'),
    'AMBASSADOR_ABSENT':      ('Embajador retirado o representación rebajada a encargado de negocios (por cada lado)', -10, 'Representación'),
    'NO_RELATIONS':           ('Sin relaciones diplomáticas', -30, 'Representación'),
    'NON_RECOGNITION':        ('Uno no reconoce al otro como Estado o gobierno', -40, 'Representación'),
    'DEFENSE_ALLIANCE':       ('Alianza o tratado de defensa mutua en vigor (p. ej. OTAN)', +35, 'Alianzas y tratados'),
    'DEEP_INTEGRATION':       ('Integración profunda común (UE, mercado único)', +25, 'Alianzas y tratados'),
    'INTEL_ALLIANCE':         ('Alianza de inteligencia (p. ej. Five Eyes)', +10, 'Alianzas y tratados'),
    'STRATEGIC_PARTNERSHIP':  ('Asociación estratégica formal', +10, 'Alianzas y tratados'),
    'FRIENDSHIP_TREATY':      ('Tratado de amistad y cooperación', +8, 'Alianzas y tratados'),
    'HIGH_LEVEL_MECHANISM':   ('Mecanismo institucional de cumbres periódicas', +6, 'Alianzas y tratados'),
    'SHARED_LANGUAGE':        ('Comparten lengua oficial', +3, 'Economía'),
    'BILATERAL_TREATIES':     ('Tratados bilaterales sectoriales en vigor (inversiones, información clasificada, fiscalidad...): +2 por tratado, máximo 3', +2, 'Alianzas y tratados'),
    'SHARED_FORUM':           ('Comparten un foro o club político-económico (BRICS, OCDE, G20, APEC, OPEP, UA, Liga Árabe...)', +3, 'Alianzas y tratados'),
    'FTA_IN_FORCE':           ('Tratado de libre comercio en vigor (bilateral o vía bloque)', +12, 'Economía'),
    'PREFERENTIAL_TRADE':     ('Acuerdo de asociación o preferencias comerciales', +6, 'Economía'),
    'TRADE_HIGH':             ('Interdependencia comercial alta (socio principal de al menos uno)', +12, 'Economía'),
    'TRADE_MEDIUM':           ('Interdependencia comercial media', +6, 'Economía'),
    'HUMAN_TIES':             ('Diáspora relevante: nacidos en un país que viven en el otro (valor completo con 1 M de personas o el 2 % de la población del destino; proporcional por debajo)', +5, 'Economía'),
    'TERRITORIAL_DISPUTE_LOW':    ('Disputa territorial latente (reclamación sin incidentes)', -8, 'Disputas y presión'),
    'TERRITORIAL_DISPUTE_ACTIVE': ('Disputa territorial activa (protestas e incidentes periódicos)', -18, 'Disputas y presión'),
    'TERRITORIAL_DISPUTE_MILITARIZED': ('Disputa territorial militarizada (incidentes armados en los últimos 5 años)', -30, 'Disputas y presión'),
    'STRATEGIC_RIVALRY':      ('Rivalidad estratégica declarada en doctrinas oficiales', -20, 'Disputas y presión'),
    'MEASURES_IN_FORCE':      ('Medidas coercitivas en vigor impuestas por un Estado al otro y aún no levantadas (aranceles, vetos, controles de exportación, sanciones, cortes de suministro, visados): intensidad completa con 24 puntos de peso acumulado; levantadas, se desvanecen en un año', -30, 'Disputas y presión'),
    'TRADE_WAR':              ('Guerra económica: aranceles, restricciones o sanciones recíprocas en vigor entre ambos', -12, 'Disputas y presión'),
    'TECH_RESTRICTIONS':      ('Régimen de controles tecnológicos o de inversión dirigido al otro', -10, 'Disputas y presión'),
    'SANCTIONS_REGIME_TARGETED': ('Régimen de sanciones selectivas en vigor', -12, 'Disputas y presión'),
    'SANCTIONS_REGIME_BROAD': ('Régimen de sanciones amplias o embargo en vigor', -30, 'Disputas y presión'),
    'ARMS_EMBARGO_IN_FORCE':  ('Embargo de armas en vigor', -15, 'Disputas y presión'),
    'PROXY_HOSTILITY':        ('Apoyo a grupos hostiles al otro o designación como Estado patrocinador del terrorismo', -35, 'Disputas y presión'),
    'OCCUPATION':             ('Ocupación de territorio de uno por el otro', -50, 'Conflicto'),
    'ARMED_CONFLICT':         ('Conflicto armado en curso entre ambos', -80, 'Conflicto'),
    'HISTORICAL_ALLIANCE':    ('Alianza histórica (luchar en el mismo bando, garantía histórica)', +5, 'Historia'),
    'HISTORICAL_WAR':         ('Guerra entre ambos en los últimos 80 años', -10, 'Historia'),
    'COLONIAL_LEGACY':        ('Legado colonial con agravios no resueltos', -5, 'Historia'),
}

# ─── Multipliers ──────────────────────────────────────────────────────────────
STATUS_MULT = {'IMPLEMENTED': 1.0, 'DECLARED': 0.4}          # announcement, threat or promise of a FUTURE act counts 40 %
SPEECH_ACTS = {'CRITICISM', 'HARSH_RHETORIC', 'POSITIVE_STATEMENT'}  # for these the statement IS the act: always full status weight
ACTOR_MULT = {'HEAD': 1.0, 'MINISTER': 0.8, 'OFFICIAL': 0.6, 'INSTITUTION': 0.4, 'COURT': 0.0, 'NON_GOV': 0.0}
CORE_INTEREST_MULT = 1.5                                      # touches sovereignty/territory/regime security of the target


def source_mult(f):
    """Evidence quality: denied by a government -> 0.3, partial -> 0.5, single ordinary source -> 0.7, corroborated/primary -> 1.0."""
    if f.get('contested'):
        return 0.3
    if f.get('verdict') == 'PARTIAL':
        return 0.5
    return 1.0 if (f.get('corroboration') or 0) >= 2 else 0.7


# ─── Time ─────────────────────────────────────────────────────────────────────
IRRELEVANT_POINTS = 0.5            # an event below this residual value is dropped from the score
# ─── Reset rule: the first leader-level contact after a rupture ────────────────────────────────
# A routine meeting is worth +2, but the first meeting of the two leaders after a recent rupture (expulsions, recalled ambassador, downgrade, severed relations,
# broad sanctions, migration used as a weapon) is information about the relationship itself: it counts as a summit (+10, half-life 120 d), never less than its own value.
RESET_CODES = {'LEADER_CALL', 'SIDELINES_MEETING', 'SUMMIT', 'STATE_VISIT', 'JOINT_DECLARATION'}
RESET_RUPTURES = {'EXPULSION', 'AMBASSADOR_RECALL', 'RELATIONS_DOWNGRADE', 'RELATIONS_SEVERED', 'SANCTIONS_BROAD', 'MIGRATION_WEAPONIZATION'}
RESET_BASE, RESET_HL, RESET_WINDOW_DAYS = 10, 120, 730


def annotate_resets(facts):
    """Causal and independent of the scoring date: returns copies of the facts with reset=True on qualifying contacts.
    Qualifies: an IMPLEMENTED contact (RESET_CODES) at head-of-state/government level, strictly after an IMPLEMENTED rupture within the previous 730 days,
    and with no earlier qualifying-type contact between that (most recent) rupture and itself."""
    items = [(parse_date(f.get('eventDate')), i, f) for i, f in enumerate(facts)]
    items = [(d, i, f) for d, i, f in items if d]
    ruptures = sorted(d for d, _, f in items if f.get('code') in RESET_RUPTURES and f.get('type') == 'IMPLEMENTED'
                      and f.get('actorLevel') not in ('NON_GOV', 'COURT'))
    contacts = sorted((d, i) for d, i, f in items if f.get('code') in RESET_CODES and f.get('type') == 'IMPLEMENTED' and f.get('actorLevel') == 'HEAD')
    flagged = set()
    for d, i in contacts:
        prior = [r for r in ruptures if r < d]
        if not prior or (d - prior[-1]).days > RESET_WINDOW_DAYS:
            continue
        if any(prior[-1] < cd < d for cd, _ in contacts):
            continue                                   # an earlier head-level contact already happened since the last rupture
        flagged.add(i)
    return [dict(f, reset=True) if i in flagged else f for i, f in enumerate(facts)]


MAX_HALF_LIVES = 6                 # ...and in any case after 6 half-lives (< 1.6 % left)
MEMORY_THRESHOLD = 30              # events with |base| >= 30 also leave a historical memory
MEMORY_SHARE = 0.3                 # memory = 30 % of the event's weighted base...
MEMORY_HALF_LIFE = 25 * 365        # ...fading with a 25-year half-life
MEMORY_CAP = 15
STATE_END_HALF_LIFE = 365          # an ended state (lifted sanctions, ended alliance) fades with a 1-year half-life
K_STRUCT, K_DYN = 100, 60          # tanh saturation constants
TREND_DAYS, TREND_DELTA = 30, 8    # trend = R(today) - R(30 days ago); |delta| >= 8 points to call it a change

BANDS = [(-200, -130, 'CONFLICT'), (-130, -70, 'HOSTILE'), (-70, -20, 'TENSE'), (-20, 30, 'NEUTRAL'), (30, 100, 'PARTNER'), (100, 201, 'ALLIED')]
BAND_ES = {'CONFLICT': 'Conflicto', 'HOSTILE': 'Hostil', 'TENSE': 'Tensa', 'NEUTRAL': 'Neutral', 'PARTNER': 'Socios', 'ALLIED': 'Aliados'}


def parse_date(s):
    m = re.match(r'^(\d{4})-(\d{2})(?:-(\d{2}))?$', (s or '').strip()) if isinstance(s, str) else None
    if not m:
        return None
    try:
        return date(int(m[1]), int(m[2]), int(m[3]) if m[3] else 15)
    except ValueError:
        return None


def decay(age_days, half_life):
    return 0.5 ** (age_days / half_life)


def irrelevant_after(base, half_life):
    """Days until an event of this base (best case multipliers) drops below IRRELEVANT_POINTS, capped at MAX_HALF_LIVES."""
    if base == 0:
        return 0
    return round(min(half_life * math.log2(abs(base) / IRRELEVANT_POINTS), half_life * MAX_HALF_LIVES))


def event_contribution(f, at):
    """Value of one classified fact at date `at`, or None if it is not (yet / any longer) relevant."""
    d = parse_date(f.get('eventDate'))
    code = f.get('code', 'NONE')
    if d is None or d > at or code not in EVENTS:
        return None
    _, base, hl, _ = EVENTS[code]
    if f.get('reset') and base > 0:
        base, hl = max(base, RESET_BASE), max(hl, RESET_HL)
    if base == 0:
        return None
    status = 1.0 if code in SPEECH_ACTS else STATUS_MULT.get(f.get('type'), 0.4)
    mult = (status * ACTOR_MULT.get(f.get('actorLevel'), 0.0) * source_mult(f)
            * (CORE_INTEREST_MULT if f.get('coreInterest') else 1.0))
    age = (at - d).days
    value = base * mult * decay(age, hl)
    if mult == 0 or age > hl * MAX_HALF_LIVES or abs(value) < IRRELEVANT_POINTS:
        return None
    return dict(code=code, base=base, mult=round(mult, 2), ageDays=age, halfLife=hl, value=value, fact=f.get('fact'), actor=f.get('actor'))


def memory_contribution(f, at):
    d = parse_date(f.get('eventDate'))
    code = f.get('code', 'NONE')
    if d is None or d > at or code not in EVENTS or abs(EVENTS[code][1]) < MEMORY_THRESHOLD:
        return 0.0
    mult = STATUS_MULT.get(f.get('type'), 0.4) * ACTOR_MULT.get(f.get('actorLevel'), 0.0) * source_mult(f)
    return EVENTS[code][1] * mult * MEMORY_SHARE * decay((at - d).days, MEMORY_HALF_LIFE)


def state_contribution(s, at):
    code = s.get('code')
    if code not in STATES:
        return None
    since, until = parse_date(s.get('since')), parse_date(s.get('until'))
    if since and since > at:
        return None
    pts = STATES[code][1] * (max(1, min(2, int(s.get('sides') or 1))) if code == 'AMBASSADOR_ABSENT' else
                             max(1, min(3, int(s.get('count') or 1))) if code == 'BILATERAL_TREATIES' else 1)
    pts *= max(0.0, min(1.0, float(s.get('scale', 1.0))))     # intensity of a standing condition (e.g. trade war after a truce)
    if until and until <= at:
        pts *= decay((at - until).days, STATE_END_HALF_LIFE)
        if abs(pts) < IRRELEVANT_POINTS:
            return None
    if abs(pts) < 0.05:
        return None
    return dict(code=code, value=pts, since=s.get('since'), until=s.get('until'), ended=bool(until and until <= at), scale=s.get('scale', 1.0))


def band(r):
    return next(b for lo, hi, b in BANDS if lo <= r < hi)


def score(facts, states, at):
    facts = annotate_resets(facts)
    ev = [c for c in (event_contribution(f, at) for f in facts) if c]
    st = [c for c in (state_contribution(s, at) for s in states) if c]
    mem = max(-MEMORY_CAP, min(MEMORY_CAP, sum(memory_contribution(f, at) for f in facts)))
    raw_struct = sum(c['value'] for c in st) + mem
    raw_dyn = sum(c['value'] for c in ev)
    s_struct = K_STRUCT * math.tanh(raw_struct / K_STRUCT)
    s_dyn = 100 * math.tanh(raw_dyn / K_DYN)
    r = s_struct + s_dyn
    return dict(R=round(r, 1), band=band(r), S_struct=round(s_struct, 1), S_dyn=round(s_dyn, 1), memory=round(mem, 1),
                rawStruct=round(raw_struct, 1), rawDyn=round(raw_dyn, 1), states=st, events=sorted(ev, key=lambda c: -abs(c['value'])))


def trend(facts, states, at, days=TREND_DAYS):
    from datetime import timedelta
    now, before = score(facts, states, at)['R'], score(facts, states, at - timedelta(days=days))['R']
    delta = round(now - before, 1)
    label = 'IMPROVING' if delta >= TREND_DELTA else 'DETERIORATING' if delta <= -TREND_DELTA else 'STABLE'
    return label, dict(now=now, before=before, delta=delta, days=days)


def contributions_by_actor(facts, at):
    out = {}
    for f in annotate_resets(facts):
        c = event_contribution(f, at)
        if c:
            out[c['actor']] = out.get(c['actor'], 0) + c['value']
    return {k: round(v, 1) for k, v in out.items()}
