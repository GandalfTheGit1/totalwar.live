"""Registry of the states the engine scores: the 193 UN members, the two UN observer states (Holy See, Palestine), Kosovo and Taiwan.
Built from Wikidata (ISO 3166-1 alpha-2/alpha-3, UN M49 code, Spanish and English labels) and cross-checked with the app's lib/data/countries.json.
Output: world/countries.json  [{code, iso3, qid, m49, nameEs, nameEn, un}]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'model'))
import structure as T

EXTRA = {'VA': 'Q237', 'PS': 'Q219060', 'XK': 'Q1246', 'TW': 'Q865'}
# The UN member items of Denmark and the Netherlands are the kingdoms (Q756617, Q29999); embassies, relations and memberships are recorded on the
# country items, so those are used. M49 codes missing in Wikidata are taken from the UN M49 standard (Palestine 275, Taiwan 158 as used by UN DESA).
OVERRIDE = {'DK': dict(qid='Q35', m49=208, iso3='DNK', un=True), 'NL': dict(qid='Q55', m49=528, iso3='NLD', un=True)}
M49_FIX = {'PS': 275, 'TW': 158}
LANG_FIX = {'AF': ('fa', 'افغانستان')}        # Wikidata lists Arabic among Afghanistan's official languages; its press is in Dari / Pashto
OUT = os.path.join(HERE, 'countries.json')


def fetch():
    T.CACHE_FILE = os.path.join(HERE, 'world_cache.json')       # world data stays out of the model's data_cache.json
    extra = ' '.join(f'wd:{q}' for q in EXTRA.values())
    q = f'''SELECT ?c ?iso2 ?iso3 ?m49 ?es ?en ?un WHERE {{
        {{ ?c p:P463 ?st . ?st ps:P463 wd:Q1065 . FILTER NOT EXISTS {{ ?st pq:P582 ?end }} BIND(true AS ?un) }} UNION {{ VALUES ?c {{ {extra} }} BIND(false AS ?un) }}
        OPTIONAL {{ ?c wdt:P297 ?iso2 }} OPTIONAL {{ ?c wdt:P298 ?iso3 }} OPTIONAL {{ ?c wdt:P2082 ?m49 }}
        OPTIONAL {{ ?c rdfs:label ?es FILTER(LANG(?es) = "es") }} OPTIONAL {{ ?c rdfs:label ?en FILTER(LANG(?en) = "en") }} }}'''
    return T.cached('wd-registry-v1', lambda: T.sparql(q), ttl=365 * 86400)


def build():
    app = {c['code']: c for c in json.load(open(os.path.join(HERE, '..', '..', '..', 'lib', 'data', 'countries.json')))}
    out = {}
    for r in fetch():
        qid = r['c']['value'].split('/')[-1]
        code = r.get('iso2', {}).get('value') or next((k for k, v in EXTRA.items() if v == qid), None)
        if not code:
            continue
        c = out.setdefault(code, dict(code=code, qid=qid, iso3=r.get('iso3', {}).get('value') or app.get(code, {}).get('iso3'),
                                      m49=None, nameEs=r.get('es', {}).get('value') or app.get(code, {}).get('nameEs'),
                                      nameEn=r.get('en', {}).get('value') or app.get(code, {}).get('nameEn'), un=r['un']['value'] == 'true'))
        m = r.get('m49', {}).get('value')
        if m and m.isdigit() and c['m49'] is None:
            c['m49'] = int(m)
    for code, o in OVERRIDE.items():
        out[code] = dict(out.get(code, {}), code=code, **o)
    for code, c in out.items():
        c['m49'] = c.get('m49') or M49_FIX.get(code)
        if code in app:                                  # the app's names, so the interface and the engine say the same thing
            c['nameEs'], c['nameEn'] = app[code]['nameEs'], app[code]['nameEn']
    if 'XK' in out and not out['XK']['iso3']:
        out['XK']['iso3'] = 'XKX'                       # user-assigned code used by the World Bank
    return sorted(out.values(), key=lambda c: c['code'])



def add_languages():
    """Main official language (ISO 639-1) and the state's name in it, used by the news collection of the events layer to search in the local language.
    Known states keep the model's choice; otherwise English when it is official (its press is searchable in English), else the official language with
    the most speakers (Wikidata P1098)."""
    reg = json.load(open(OUT))
    q = f'''SELECT ?c ?code ?name (MAX(?sp) AS ?speakers) WHERE {{ VALUES ?c {{ {' '.join('wd:' + c['qid'] for c in reg)} }} ?c wdt:P37 ?l . ?l wdt:P218 ?code .
        OPTIONAL {{ ?l wdt:P1098 ?sp }} OPTIONAL {{ ?c rdfs:label ?name FILTER(LANG(?name) = ?code) }} }} GROUP BY ?c ?code ?name'''
    rows = T.sparql(q)
    by = {}
    for r in rows:
        by.setdefault(r['c']['value'].split('/')[-1], []).append((r['code']['value'], r.get('name', {}).get('value'), float(r.get('speakers', {}).get('value', 0))))
    for c in reg:
        known = T.F.COUNTRIES.get(c['code'])
        opts = sorted(by.get(c['qid'], []), key=lambda o: -o[2])
        pick = next((o for o in opts if o[0] == 'en'), opts[0] if opts else ('en', None, 0))
        c['lang'] = known['lang'] if known else pick[0]
        c['local'] = known['local'] if known else (pick[1] or c['nameEn'])
    for code, (lang, local) in LANG_FIX.items():
        c = next(x for x in reg if x['code'] == code)
        c['lang'], c['local'] = lang, local
    json.dump(reg, open(OUT, 'w'), ensure_ascii=False, indent=1)
    return reg


if __name__ == '__main__' and sys.argv[1:] == ['languages']:
    reg = add_languages()
    print({c['code']: (c['lang'], c['local']) for c in reg if c['code'] in ('CH', 'BE', 'IN', 'KE', 'PH', 'SG', 'RU', 'BR')})
elif __name__ == '__main__':
    reg = build()
    json.dump(reg, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print(len(reg), 'states;', sum(c['un'] for c in reg), 'UN members')
    print('without ISO3:', [c['code'] for c in reg if not c['iso3']], '| without M49:', [c['code'] for c in reg if not c['m49']])
    app = {c['code'] for c in json.load(open(os.path.join(HERE, '..', '..', '..', 'lib', 'data', 'countries.json')))}
    print('not in the app list:', sorted({c['code'] for c in reg} - app))
