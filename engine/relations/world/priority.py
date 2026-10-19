"""Which pairs get the EVENTS layer (tier 2: news search, LLM extraction, two-model classification) first.

The events layer costs, per pair, a few dozen search and LLM calls, so it cannot run for all ~19,300 pairs on free quotas. Pairs are ranked by how much is
likely to be happening between the two states, using only the structural data already fetched (no LLM):
  +3 shared border (Wikidata P47)          +3 territorial claim between them        +3 special pair in the project (rivalry, alliance, trade war)
  +3 high trade (>= 10 % of one side's exports or imports)   +2 medium trade (>= 3 %)
  +2 one sanctions the other (project data)                    +2 both in the G20        +1 strong human ties (UN DESA scale >= 0.5)
Ties are broken by total trade share. Output: world/out/priority.json [[pair, score, reasons]]."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bulk as B
T = B.T
G20 = {'AR', 'AU', 'BR', 'CA', 'CN', 'FR', 'DE', 'IN', 'ID', 'IT', 'JP', 'KR', 'MX', 'RU', 'SA', 'ZA', 'TR', 'GB', 'US'}


def borders():
    rows = T.cached('bulk-p47', lambda: T.sparql(f'SELECT ?a ?b WHERE {{ VALUES ?a {{ {B.values()} }} VALUES ?b {{ {B.values()} }} ?a wdt:P47 ?b }}'), ttl=30 * 86400)
    return {tuple(sorted((B.code_of(r['a']['value']), B.code_of(r['b']['value'])))) for r in rows if B.code_of(r['a']['value']) and B.code_of(r['b']['value'])}


def rank(pairs_file=os.path.join(HERE, 'out', 'pairs.json')):
    B.setup()
    nb = borders()
    data = json.load(open(pairs_file))['pairs']
    out = []
    for r in data:
        codes = {s[0] for s in r['states']}
        a, b = r['pair'].split('-')
        sc, why = 0, []
        for cond, pts, label in ((tuple(sorted((a, b))) in nb, 3, 'border'), (any(c.startswith('TERRITORIAL') for c in codes), 3, 'territorial claim'),
                                 (bool(codes & {'STRATEGIC_RIVALRY', 'DEFENSE_ALLIANCE', 'TRADE_WAR'}), 3, 'special pair'),
                                 ('TRADE_HIGH' in codes, 3, 'high trade'), ('TRADE_MEDIUM' in codes, 2, 'medium trade'),
                                 (any(c.startswith('SANCTIONS_REGIME') or c == 'ARMS_EMBARGO_IN_FORCE' for c in codes), 2, 'sanctions'),
                                 ({a, b} <= G20, 2, 'both G20'), ('HUMAN_TIES' in codes and dict(r['states']).get('HUMAN_TIES', 0) >= 2.5, 1, 'human ties')):
            if cond:
                sc += pts
                why.append(label)
        out.append([r['pair'], sc, why])
    out.sort(key=lambda x: -x[1])
    json.dump(out, open(os.path.join(HERE, 'out', 'priority.json'), 'w'), separators=(',', ':'))
    return out, len(nb)


if __name__ == '__main__':
    out, nb = rank()
    print(f'{nb} border pairs; pairs with score >= 5: {sum(1 for x in out if x[1] >= 5)}, >= 3: {sum(1 for x in out if x[1] >= 3)}, 0: {sum(1 for x in out if x[1] == 0)}')
    print('top 25:', [(p, s) for p, s, _ in out[:25]])
