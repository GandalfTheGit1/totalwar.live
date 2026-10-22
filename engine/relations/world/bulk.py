"""Bulk data for every state in world/countries.json, fetched PER COUNTRY (or once for all) instead of per pair.

Scoring every pair with the per-pair queries of model/structure.py would take ~19,300 pairs x 5 Wikidata queries (about 96,000 requests). Here the same
facts are fetched with one query for all states (diplomatic relations P530, territorial claims P1336, official languages P37) or one query per state
(resident embassies, heads of mission, bilateral treaties, bloc memberships, WITS trade shares, World Bank population), and model/structure.py's per-pair
fetchers are replaced in memory by lookups into these tables. Everything else in build_states / derive_states / score runs unchanged.
All answers are cached in world/world_cache.json (the model's own data_cache.json is left alone)."""
import json, os, re, sys, time
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'model'))
import flow as F
import structure as T
import migration as MIG

REG = json.load(open(os.path.join(HERE, 'countries.json')))
CODES = [c['code'] for c in REG]
BY_QID = {c['qid']: c['code'] for c in REG}
BY_QID.update({q: code for code, qs in T.ALIASES.items() for q in qs})       # Kingdom of Denmark / of the Netherlands
TREATY_PROPS = ('P1891', 'P6193', 'P17')


def setup():
    """Register every state with the model and send its cache to world/world_cache.json."""
    for c in REG:
        F.COUNTRIES.setdefault(c['code'], dict(es=c['nameEs'], en=c['nameEn'], local=c.get('local') or c['nameEn'], lang=c.get('lang') or 'en', qid=c['qid']))
        T.QID[c['code']] = c['qid']
        T.ISO3[c['code']] = c['iso3']
        if c.get('m49'):
            MIG.M49[c['code']] = c['m49']
    T.CACHE_FILE = os.path.join(HERE, 'world_cache.json')


def values(codes=None):
    return ' '.join(T.vals(c) for c in (codes or CODES))


def code_of(uri):
    return BY_QID.get(uri.split('/')[-1])


# ─── one query for all states ───────────────────────────────────────────────────
def relations():
    """{(a, b) directed: 'open' | 'ended'} from the diplomatic-relation statements (P530, not deprecated): 'ended' when every statement of a about b has an
    end time. Same reading as structure.p530_status, for all states at once."""
    rows = T.cached('bulk-p530b', lambda: T.sparql(f'''SELECT ?a ?b ?end WHERE {{ VALUES ?a {{ {values()} }} VALUES ?b {{ {values()} }}
        ?a p:P530 ?st . ?st ps:P530 ?b ; wikibase:rank ?rk . FILTER(?rk != wikibase:DeprecatedRank) OPTIONAL {{ ?st pq:P582 ?end }} }}'''), ttl=30 * 86400)
    out = {}
    for r in rows:
        a, b = code_of(r['a']['value']), code_of(r['b']['value'])
        if a and b and a != b:
            out[(a, b)] = 'open' if ('end' not in r or out.get((a, b)) == 'open') else 'ended'
    return out


def claims_all():
    rows = T.cached('bulk-p1336', lambda: T.sparql(f'''SELECT DISTINCT ?x ?y ?tLabel WHERE {{ VALUES ?x {{ {values()} }} VALUES ?y {{ {values()} }}
        ?t wdt:P1336 ?x; wdt:P17 ?y. SERVICE wikibase:label {{ bd:serviceParam wikibase:language "es,en". }} }}'''), ttl=30 * 86400)
    out = defaultdict(list)
    for r in rows:
        x, y = code_of(r['x']['value']), code_of(r['y']['value'])
        if x and y and x != y and len(out[(x, y)]) < 20:            # same cap as the per-pair query (LIMIT 20)
            out[(x, y)].append(r['tLabel']['value'])
    return out


def languages_all():
    rows = T.cached('bulk-p37', lambda: T.sparql(f'''SELECT ?c ?lLabel WHERE {{ VALUES ?c {{ {values()} }} ?c wdt:P37 ?l .
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "es,en". }} }}'''), ttl=30 * 86400)
    out = defaultdict(set)
    for r in rows:
        c = code_of(r['c']['value'])
        if c:
            out[c].add(r['lLabel']['value'])
    return out


# ─── one query per state ────────────────────────────────────────────────────────
def embassies_of(sender):
    """{host code: number of resident embassies of `sender` there} (not dissolved), as in structure.diplomacy()."""
    rows = T.cached(f'bulk-emb2-{sender}', lambda: T.sparql(f'''SELECT ?loc (COUNT(DISTINCT ?e) AS ?n) WHERE {{ VALUES ?op {{ {T.vals(sender)} }}
        ?e wdt:P31/wdt:P279* wd:Q3917681; wdt:P137 ?op; wdt:P17 ?loc . {T.ACTIVE_EMBASSY} }} GROUP BY ?loc'''), ttl=30 * 86400)
    return {code_of(r['loc']['value']): int(r['n']['value']) for r in rows if code_of(r['loc']['value'])}


def treaties_of(code):
    """Treaties with at most 3 state parties in which `code` is a party, as compact records [other party code, treaty URI, title, end date or None].
    The party count is filtered by Wikidata (GROUP BY ... HAVING), so multilateral treaties never come back (fetching them made the cache 700 MB)."""
    def fetch():
        q = f'''SELECT ?t ?tLabel (SAMPLE(?e) AS ?end) (GROUP_CONCAT(DISTINCT STR(?party); separator=" ") AS ?parties) WHERE {{
            ?t wdt:P31/wdt:P279* wd:Q131569 . VALUES ?pr {{ wdt:P1891 wdt:P6193 wdt:P17 }} VALUES ?me {{ {T.vals(code)} }} ?t ?pr ?me .
            VALUES ?pr3 {{ wdt:P1891 wdt:P6193 wdt:P17 }} ?t ?pr3 ?party . OPTIONAL {{ ?t wdt:P576 ?e }}
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "es,en". }} }} GROUP BY ?t ?tLabel HAVING(COUNT(DISTINCT ?party) <= 3)'''
        out = []
        for r in T.sparql(q):
            for p in r['parties']['value'].split():
                other = code_of(p)
                if other and other != code:
                    out.append([other, r['t']['value'], r.get('tLabel', {}).get('value', ''), r.get('end', {}).get('value')])
        return out
    return T.cached(f'bulk-treaties2-{code}{T.akey(code)}', fetch, ttl=30 * 86400)


def prefetch(log=print):
    """Fetch (or load from cache) every bulk table. Safe to re-run: cached answers are reused."""
    setup()
    t0 = time.time()
    rel, cl, lang = relations(), claims_all(), languages_all()
    log(f'[{time.time() - t0:5.0f}s] global tables: {len(rel)} related pairs, {len(cl)} claim links, {len(lang)} states with official languages')
    for i, c in enumerate(CODES):
        for name, fn in (('embassies', embassies_of), ('treaties', treaties_of), ('heads', lambda s: T.heads_in(s, s)), ('blocs', T.memberships),
                         ('trade', lambda s: T.wits_shares(T.ISO3[s])), ('population', T.population)):
            try:
                fn(c)
            except Exception as e:
                log(f'   {c} {name} FAILED: {str(e)[:100]}')
        if i % 10 == 9:
            log(f'[{time.time() - t0:5.0f}s] {i + 1}/{len(CODES)} states')
    log(f'[{time.time() - t0:5.0f}s] done')


# ─── per-pair fetchers of structure.py, answered from the bulk tables ───────────────
class Tables:
    def __init__(self):
        setup()
        self.rel, self.claims, self.lang = relations(), claims_all(), languages_all()
        self.emb = {c: embassies_of(c) for c in CODES}
        self.treaty = defaultdict(list)
        self.missing = []
        for c in CODES:
            failed_key = f'bulk-treaties2-failed-{c}'
            if T.cached(failed_key, lambda: False, ttl=7 * 86400):
                recs, _ = [], self.missing.append(c)
            else:
                try:
                    recs = treaties_of(c)
                except Exception:             # Wikidata timeout (> 60 s): remembered for a week; the pair still gets the treaties found from the other side
                    recs, _ = [], self.missing.append(c)
                    c_ = T._cache(); c_[failed_key] = [time.time(), True]; json.dump(c_, open(T.CACHE_FILE, 'w'))
            for other, uri, label, end in recs:
                self.treaty[tuple(sorted((c, other)))].append(dict(t={'value': uri}, tLabel={'value': label}, **({'end': {'value': end}} if end else {})))

    def diplomacy(self, a, b):
        st = {a: self.rel.get((a, b)), b: self.rel.get((b, a))}
        return 'open' in st.values(), int(b in self.emb.get(a, {})) + int(a in self.emb.get(b, {})), st

    def claims_pair(self, a, b):
        return {f'{x}->{y}': self.claims[(x, y)] for x, y in ((a, b), (b, a)) if self.claims.get((x, y))}

    def treaties_pair(self, a, b):
        rows, seen = [], set()
        for r in self.treaty.get(tuple(sorted((a, b))), []):
            if r['t']['value'] not in seen:
                seen.add(r['t']['value'])
                rows.append(r)
        return T.filter_treaties(rows)

    def languages_pair(self, a, b):
        return sorted(self.lang.get(a, set()) & self.lang.get(b, set()))

    def install(self):
        T.diplomacy, T.claims, T.treaties, T.shared_languages = self.diplomacy, self.claims_pair, self.treaties_pair, self.languages_pair
        return self


if __name__ == '__main__':
    prefetch()
