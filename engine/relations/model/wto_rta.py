"""Trade agreements in force between pairs of states, from the WTO RTA-IS list (model/wto/rta_all.xlsx).

Every RTA with status 'In Force' or 'In force for at least one Party' is expanded to pairs of states: each signatory is a party (a country, or a bloc that is expanded to its members);
pairs are formed between DIFFERENT parties, never inside one bloc. Per-party entry and exit dates ('Specific Entry/Exit dates') are honoured: a party that has not entered yet
(01-Jan-9999) removes its pairs, and an exit date ends them. Type CU, 'CU & EIA' -> CUSTOMS_UNION; FTA, 'FTA & EIA' -> FTA_IN_FORCE; PSA, EIA only, 'PSA & EIA' -> PREFERENTIAL_TRADE (the AfCFTA is always PREFERENTIAL_TRADE).
Territories that are not in the registry of 197 states (Hong Kong, Macao, Greenland, Faroe Islands...) are dropped.

  pair_states(a, b)  -> list of {code, since, until, source, evidence}
"""
import json, os, re, xml.etree.ElementTree as ET, zipfile
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, 'wto', 'rta_all.xlsx')
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
Q = '{%s}' % NS['m']
FAR = date(9000, 1, 1)

EU27 = 'AT BE BG CY CZ DE DK EE ES FI FR GR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK'.split()
BLOCS = {
    'european union': EU27, 'european free trade association (efta)': ['CH', 'IS', 'LI', 'NO'], 'southern common market (mercosur)': ['AR', 'BR', 'PY', 'UY'],
    'eurasian economic union (eaeu)': ['AM', 'BY', 'KZ', 'KG', 'RU'], 'southern african customs union (sacu)': ['ZA', 'BW', 'LS', 'NA', 'SZ'],
    'gulf cooperation council (gcc)': ['AE', 'BH', 'KW', 'OM', 'QA', 'SA'], 'asean free trade area (afta)': ['BN', 'ID', 'KH', 'LA', 'MM', 'MY', 'PH', 'SG', 'TH', 'VN'],
    'pacific alliance': ['CL', 'CO', 'MX', 'PE'],
}
ALIASES = {   # WTO names that differ from the registry's English names
    'korea, republic of': 'KR', 'united states of america': 'US', 'viet nam': 'VN', 'moldova, republic of': 'MD', 'kyrgyz republic': 'KG', 'russian federation': 'RU',
    'brunei darussalam': 'BN', 'democratic republic of the congo': 'CD', "lao people's democratic republic": 'LA', "côte d'ivoire": 'CI', 'bolivia, plurinational state of': 'BO',
    'venezuela, bolivarian republic of': 'VE', 'kosovo (under unsc res. 1244)': 'XK', 'czech republic': 'CZ', 'slovak republic': 'SK', 'lebanese republic': 'LB', 'chinese taipei': 'TW',
    'syrian arab republic': 'SY', 'bahrain, kingdom of': 'BH', 'cabo verde': 'CV', 'the gambia': 'GM', 'kuwait, the state of': 'KW', 'saudi arabia, kingdom of': 'SA',
    'sao tomé and principe': 'ST', "korea, democratic people's republic of": 'KP', 'micronesia, federated states of': 'FM', 'türkiye': 'TR', 'turkiye': 'TR', 'netherlands, kingdom of the': 'NL',
    'united kingdom': 'GB', 'north macedonia': 'MK', 'republic of north macedonia': 'MK', 'eswatini': 'SZ', 'swaziland': 'SZ', 'timor-leste': 'TL', 'tanzania': 'TZ', 'congo': 'CG',
    'brunei': 'BN', 'laos': 'LA', 'ivory coast': 'CI', 'cape verde': 'CV', 'gambia': 'GM', 'palestine': 'PS', 'state of palestine': 'PS',
}
_codes = None
_rtas = None


def _registry():
    global _codes
    if _codes is None:
        reg = json.load(open(os.path.join(HERE, '..', 'world', 'countries.json')))
        _codes = {c['nameEn'].lower(): c['code'] for c in reg}
        _codes.update({c['nameEs'].lower(): c['code'] for c in reg})
    return _codes


def resolve(name):
    """Country code, list of member codes of a bloc, or None for a territory / unknown name."""
    n = name.strip().lower()
    if n in BLOCS:
        return BLOCS[n]
    return ALIASES.get(n) or _registry().get(n)


def _serial(v):
    try:
        return date(1899, 12, 30) + timedelta(days=int(float(v)))
    except (TypeError, ValueError):
        return None


def _dmy(s):
    m = re.match(r'(\d{2})-([A-Za-z]{3})-(\d{4})', (s or '').strip())
    if not m:
        return None
    mon = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].index(m[2].lower()) + 1
    return date(int(m[3]), mon, int(m[1]))


def _party_dates(text):
    """'Name(dd-Mon-yyyy - dd-Mon-yyyy); Other( - dd-Mon-yyyy)' -> {name lower: (entry or None, exit or None)}."""
    out = {}
    for part in [p.strip() for p in (text or '').split(');') if p.strip()]:
        part = part if part.endswith(')') else part + ')'
        name, _, rng = part.rpartition('(')
        a, _, b = rng.rstrip(')').partition(' - ')
        out[name.strip().lower()] = (_dmy(a), _dmy(b))
    return out


def load():
    global _rtas
    if _rtas is not None:
        return _rtas
    z = zipfile.ZipFile(XLSX)
    ss = [''.join(t.text or '' for t in si.iter(Q + 't')) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    rows = []
    for r in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).iter(Q + 'row'):
        row = {}
        for c in r.findall('m:c', NS):
            col = re.match(r'[A-Z]+', c.attrib['r']).group()
            v = c.find('m:v', NS)
            row[col] = '' if v is None else (ss[int(v.text)] if c.attrib.get('t') == 's' else v.text)
        rows.append(row)
    head = rows[0]
    recs = [{head[k]: v for k, v in r.items() if k in head} for r in rows[1:]]
    out = []
    for r in recs:
        status = r.get('Status', '').strip()
        if not status.lower().startswith('in force'):
            continue
        typ = r.get('Type', '').strip()
        code = ('CUSTOMS_UNION' if re.match(r'^CU\b', typ) else 'FTA_IN_FORCE' if re.match(r'^FTA\b', typ) else 'PREFERENTIAL_TRADE' if typ in ('PSA', 'EIA', 'PSA & EIA') else None)
        if code and 'african continental' in r.get('RTA Name', '').lower():
            code = 'PREFERENTIAL_TRADE'          # the AfCFTA is not yet a working free-trade area
        if code and 'comesa' in r.get('RTA Name', '').lower():
            code = 'PREFERENTIAL_TRADE'          # COMESA is notified as a customs union but never operated one (audit_trade_v4.py)
        if not code:
            continue
        start = min([d for d in (_serial(r.get('Date of Entry into Force (G)')), _serial(r.get('Date of Entry into Force (S)'))) if d] or [None]) if (r.get('Date of Entry into Force (G)') or r.get('Date of Entry into Force (S)')) else None
        dates = _party_dates(r.get('Specific Entry/Exit dates'))
        parties = []                                       # one entry per signatory: (name, members, entry, exit)
        for name in [s.strip() for s in r.get('Current signatories', '').split(';') if s.strip()]:
            res = resolve(name)
            if not res:
                continue
            members = res if isinstance(res, list) else [res]
            entry, exit_ = dates.get(name.lower(), (None, None))
            parties.append((name, members, entry, exit_))
        out.append(dict(id=r['RTA ID'], name=r.get('RTA Name', '').strip(), type=typ, status=status, code=code, start=start, parties=parties))
    _rtas = out
    return out


_index = None


def _build_index():
    global _index
    if _index is not None:
        return _index
    idx = {}
    for r in load():
        P = r['parties']
        for i in range(len(P)):
            for j in range(i + 1, len(P)):
                (n1, m1, e1, x1), (n2, m2, e2, x2) = P[i], P[j]
                entries = [d for d in (r['start'], e1, e2) if d]
                if any(d >= FAR for d in (e1, e2) if d):            # a party that has not entered yet (01-Jan-9999)
                    continue
                since = max(entries) if entries else None
                until = min([d for d in (x1, x2) if d] or [None]) if (x1 or x2) else None
                for x in m1:
                    for y in m2:
                        if x != y:
                            idx.setdefault(tuple(sorted((x, y))), []).append(dict(code=r['code'], rta=r['name'], rtaId=r['id'], type=r['type'], since=since, until=until))
    _index = idx
    return idx


def pair_states(a, b):
    """States for a pair, one per code (the earliest-starting agreement of each code), with since / until as 'YYYY-MM'."""
    best = {}
    for h in _build_index().get(tuple(sorted((a, b))), []):
        cur = best.get(h['code'])
        if cur is None or (h['since'] or date(1900, 1, 1)) < (cur['since'] or date(1900, 1, 1)):
            best[h['code']] = h
    out = []
    for code, h in best.items():
        out.append(dict(code=code, since=h['since'].isoformat()[:7] if h['since'] else None, until=h['until'].isoformat()[:7] if h['until'] else None, source='wto-rta',
                        evidence=f"WTO RTA-IS #{h['rtaId']} {h['rta']} ({h['type']})"))
    return out


if __name__ == '__main__':
    r = load()
    idx = _build_index()
    print(len(r), 'in-force RTAs read;', len(idx), 'pairs with at least one;', sum(len(v) for v in idx.values()), 'pair-agreement links')
    for p in (('AU', 'CN'), ('BR', 'AR'), ('DE', 'FR'), ('GB', 'DE'), ('CN', 'IN'), ('BR', 'IN')):
        print(p, pair_states(*p))
