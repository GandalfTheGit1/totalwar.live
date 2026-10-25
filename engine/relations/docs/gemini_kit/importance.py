"""Importance of a pair and the kind of gap it has (candidate for engine/relations/world/importance.py). Tested in the scratchpad against world/out/pairs.json."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
WORLD = os.environ.get('WORLD_DIR', HERE)
sys.path.insert(0, WORLD)

G20 = {'AR', 'AU', 'BR', 'CA', 'CN', 'FR', 'DE', 'IN', 'ID', 'IT', 'JP', 'KR', 'MX', 'RU', 'SA', 'ZA', 'TR', 'GB', 'US'}
TIES = {'FULL_DIPLOMATIC', 'NONRESIDENT_RELATIONS', 'SHARED_LANGUAGE', 'BILATERAL_TREATIES', 'TRADE_HIGH', 'TRADE_MEDIUM', 'HUMAN_TIES', 'SHARED_FORUM'}
POP_MIN = 20_000_000
POSITION_MIN = 5.0          # |V| >= 5 counts as a recorded position (same threshold as the map)


def context():
    """(population by ISO-2 code, set of sorted border pairs). Uses the world cache; WGE_OFFLINE=1 stops it from refreshing."""
    import bulk as B
    import priority as PR
    B.setup()
    pop = {c: B.T.population(c) for c in B.CODES}
    return pop, PR.borders()


def reasons(pair, states, pop, borders):
    a, b = pair.split('-')
    codes = {c for c, _ in states}
    out = []
    if (pop.get(a) or 0) >= POP_MIN and (pop.get(b) or 0) >= POP_MIN:
        out.append('both >= 20M')
    if 'TRADE_HIGH' in codes:
        out.append('trade high')
    if tuple(sorted((a, b))) in borders:
        out.append('border')
    if a in G20 and b in G20:
        out.append('both G20')
    return out


def split(R, states):
    ties = sum(v for c, v in states if c in TIES)
    return ties, R - ties


def kind(R, states, important):
    """'position' | 'pending' | 'none' | 'connected'."""
    ties, valence = split(R, states)
    if abs(valence) >= POSITION_MIN:
        return 'position'
    if important:
        return 'pending'
    return 'none' if ties == 0 else 'connected'
