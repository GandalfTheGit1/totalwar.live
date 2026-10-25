"""Phase 1: adds four reviewed sanctions facts (Russia) to engine/relations/model/reviewed_facts.json. Run from the repository root. Safe to run twice."""
import json
P = 'engine/relations/model/reviewed_facts.json'
d = json.load(open(P, encoding='utf-8'))
new = [
    dict(pair='AU-RU', code='SANCTIONS_REGIME_TARGETED', since='2022-02', source='Australia: autonomous sanctions on Russia from February 2022 (DFAT Russia sanctions regime): listings, travel bans and export bans'),
    dict(pair='NZ-RU', code='SANCTIONS_REGIME_TARGETED', since='2022-03', source='New Zealand: Russia Sanctions Act 2022 (March 2022): travel bans, asset freezes and export bans'),
    dict(pair='KR-RU', code='SANCTIONS_REGIME_TARGETED', since='2022-03', source='South Korea: export controls on Russia and support for the SWIFT exclusions announced in March 2022'),
    dict(pair='RU-SG', code='SANCTIONS_REGIME_TARGETED', since='2022-03', source='Singapore: export controls and financial measures against Russian banks announced in March 2022'),
]
have = {(f['pair'], f['code']) for f in d['facts']}
added = 0
for f in new:
    if (f['pair'], f['code']) in have:
        continue
    f['reviewedOn'] = '2026-10-21'
    f['expires'] = '2027-10-21'
    d['facts'].append(f)
    added += 1
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(added, 'facts added;', len(d['facts']), 'in total')
