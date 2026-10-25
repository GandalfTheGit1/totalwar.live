"""Writes world/out/pending_top300.csv: the 300 most important pairs that have no recorded position, for a HUMAN to fill in.
The columns position_code, since, source, reject and note are left EMPTY on purpose."""
import csv, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
WORLD = os.environ.get('WORLD_DIR', HERE)
sys.path.insert(0, WORLD)
import importance as I
import bulk as B

TOP = 300
OUT = os.path.join(os.environ.get('OUT_DIR', os.path.join(WORLD, 'out')), 'pending_top300.csv')


def main():
    pop, borders = I.context()
    names = {c['code']: c['nameEs'] for c in B.REG}
    rows = []
    for p in json.load(open(os.path.join(WORLD, 'out', 'pairs.json')))['pairs']:
        why = I.reasons(p['pair'], p['states'], pop, borders)
        if I.kind(p['R'], p['states'], bool(why)) != 'pending':
            continue
        a, b = p['pair'].split('-')
        score = math.sqrt((pop.get(a) or 0) * (pop.get(b) or 0))
        ties, valence = I.split(p['R'], p['states'])
        rows.append([p['pair'], names[a], names[b], round(score / 1e6, 1), '; '.join(why), round(ties, 1), round(valence, 1), round(p['R'], 1),
                     ' '.join(f'{c}:{v:g}' for c, v in p['states']), '', '', '', '', ''])
    rows.sort(key=lambda r: -r[3])
    rows = rows[:TOP]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['pair', 'nameA', 'nameB', 'importance_M', 'why_important', 'T', 'V', 'R', 'states', 'position_code', 'since', 'source', 'reject', 'note'])
        w.writerows(rows)
    print(f'{len(rows)} rows ->', OUT)
    print('first 8:', [r[0] for r in rows[:8]])


if __name__ == '__main__':
    main()
