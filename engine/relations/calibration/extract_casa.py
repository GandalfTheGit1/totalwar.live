import sys, json; sys.path.insert(0, '.')
import extract_hist as X
import flow as F
print('CA' in F.COUNTRIES, 'SA' in F.COUNTRIES)
X.EPISODES['CASA'] = dict(pair=('CA', 'SA'), names=('Canada', 'Saudi Arabia'), since='2018-01', until='2023-12',
    evidence=[('E1', 'Canada–Saudi Arabia relations (Wikipedia)', X.sections('ca_sa_relations_md.txt', names=('History', 'Human rights abuses', 'August 2018 diplomatic row', 'Saudi reaction', 'Halting non-oil economic ties with Canada', 'Canadian response', 'International reaction', 'Economic relations', 'Military relations', 'Educational exchange', 'Diplomatic relations')))])
facts, by = X.extract('CASA')
json.dump(facts, open('facts_CASA_auto.json', 'w'), ensure_ascii=False, indent=1)
print(len(facts), by)
for f in facts: print(f['id'], f['eventDate'], f['actor'], f['actorKind'], f['type'], f['polarity'], '|', f['fact'])
