"""Second opinion: the app's curated matrix (lib/data/geopolitical-global-matrix.json, 45 states, 990 edges, built for the project before the engine)
against the engine's R. Lists the strong disagreements only, so each one can be checked by hand:
  curated STRATEGIC_ALLY          vs engine R < -20  (tense or worse)
  curated SANCTIONED_ADVERSARIAL  vs engine R > 0
  curated FRICTION_STRATEGIC_...  vs engine R > 40
  curated ECONOMIC_PARTNER        vs engine R < -20
The curated matrix is not ground truth (it is synthetic, 'SYNTH-' ids); a disagreement is a lead, not a verdict."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
MATRIX = os.path.join(HERE, '..', '..', '..', 'lib', 'data', 'geopolitical-global-matrix.json')


def edges():
    m = json.load(open(MATRIX))
    seen = {}
    for v in m['oneAtATime'].values():
        for e in v.get('relations', []):
            key = '-'.join(sorted((e['countryA']['code'], e['countryB']['code'])))
            seen[key] = (e['stance'], e.get('summaryNote', ''))
    return seen


def run(path=os.path.join(HERE, 'out', 'pairs.json')):
    d = {p['pair']: p for p in json.load(open(path))['pairs']}
    rules = (('STRATEGIC_ALLY', lambda r: r < -20), ('SANCTIONED_ADVERSARIAL', lambda r: r > 0),
             ('FRICTION_STRATEGIC_COMPETITION', lambda r: r > 40), ('ECONOMIC_PARTNER', lambda r: r < -20))
    out = []
    for key, (stance, note) in sorted(edges().items()):
        p = d.get(key)
        if not p:
            continue
        for st, bad in rules:
            if stance == st and bad(p['R']):
                out.append((key, stance, p['R'], [s for s, _ in p['states']], note))
    print(f'{len(out)} strong disagreements out of {len(edges())} curated edges')
    for key, stance, R, states, note in out:
        print(f'  {key:6s} curated {stance:31s} engine {R:+6.1f}  {states}  | {note[:60]}')
    return out


if __name__ == '__main__':
    run(*(sys.argv[1:2]))
