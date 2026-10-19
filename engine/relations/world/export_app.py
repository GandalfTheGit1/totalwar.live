"""Export world/out/pairs.json to the compact file the app reads: lib/data/bilateral-relations/relations.json.

Format (read by lib/services/bilateral-relations/relations-store.ts):
  meta      {generatedAt, layer, states, pairs, eventsPairs}
  countries {ISO2: [nameEs, iso3]}
  pairs     {"AA-BB" (alphabetical): [R, band, sStruct, coverage, eventsAnalysed, [[state, points]], {ISO2: [status, since, source, holder]}]}"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'out', 'pairs.json')
DST = os.path.join(HERE, '..', '..', '..', 'lib', 'data', 'bilateral-relations', 'relations.json')


def main():
    data = json.load(open(SRC))
    reg = json.load(open(os.path.join(HERE, 'countries.json')))
    pairs = {}
    for r in data['pairs']:
        a, b = r['pair'].split('-')
        key = '-'.join(sorted((a, b)))
        holder = lambda h: None if not h or re.match(r'^Q\d+$', h) else h          # a bare Wikidata id means the person has no label: not worth showing
        emb = {side: [e.get('status'), e.get('since'), e.get('source'), holder(e.get('holder'))] for side, e in r.get('embassies', {}).items()}
        pairs[key] = [round(r['R'], 1), r['band'], round(r.get('S_struct', 0), 1), r['coverage']['level'], bool(r.get('eventsAnalysed')),
                      [[c, v] for c, v in r['states'] if abs(v) >= 0.05], emb]
    out = dict(meta=dict(generatedAt=data['meta']['generatedAt'], layer=data['meta']['layer'], states=len(reg), pairs=len(pairs), eventsPairs=data['meta'].get('eventsPairs', 0)),
               countries={c['code']: [c['nameEs'], c['iso3']] for c in reg}, pairs=pairs)
    os.makedirs(os.path.dirname(DST), exist_ok=True)
    json.dump(out, open(DST, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(pairs), 'pairs ->', os.path.relpath(DST), f'{os.path.getsize(DST) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
