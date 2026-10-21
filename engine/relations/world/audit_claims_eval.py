"""Evaluate world/out/pairs.json and model/territorial_claims.json against audit_claims.py.

Usage:
  python3 -I audit_claims_eval.py [path/to/pairs.json]

Acceptance criteria:
  (a) BENCHMARK: At least 90 % of the benchmark pairs satisfy their expected dispute condition.
  (b) COVERAGE: 100 % of the 99 Natural Earth entities decided; 100 % of the 53 baseline LOW pairs covered.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audit_claims as AC

DISPUTE_CODES = {
    'TERRITORIAL_DISPUTE_LOW',
    'TERRITORIAL_DISPUTE_ACTIVE',
    'TERRITORIAL_DISPUTE_MILITARIZED',
    'OCCUPATION'
}

STANCE_CODES = {
    'CLAIM_STANCE_SUPPORT',
    'CLAIM_STANCE_OPPOSE'
}

def evaluate_pairs(pairs_dict):
    passed = 0
    failures = []
    
    for pair, check_type, param, reason in AC.BENCHMARK_PAIRS:
        key = '-'.join(sorted(pair.split('-')))
        p = pairs_dict.get(key)
        states = p.get('states', []) if p else []
        state_codes = {s[0] for s in states}
        r_val = p.get('R') if p else None

        ok = False
        detail = ''

        if check_type == 'has_dispute':
            disputes = state_codes & DISPUTE_CODES
            ok = len(disputes) > 0
            detail = f"dispute states: {list(disputes)}" if ok else "NO dispute state found"

        elif check_type == 'no_dispute':
            disputes = state_codes & DISPUTE_CODES
            ok = len(disputes) == 0
            detail = "clean (no dispute)" if ok else f"unexpected dispute: {list(disputes)}"

        elif check_type == 'salience_minor':
            # Must have dispute, and its points value must be small (absolute value <= param)
            dispute_pts = [abs(s[1]) for s in states if s[0] in DISPUTE_CODES]
            ok = len(dispute_pts) > 0 and max(dispute_pts) <= float(param)
            detail = f"dispute points: {dispute_pts} (want <= {param})"

        elif check_type == 'range':
            lo, hi = param
            ok = r_val is not None and lo <= r_val <= hi
            detail = f"R={r_val} want [{lo}, {hi}]"

        elif check_type == 'has_stance':
            stances = state_codes & STANCE_CODES
            ok = len(stances) > 0
            detail = f"stances: {list(stances)}" if ok else "NO stance state found"

        if ok:
            passed += 1
        else:
            failures.append((pair, check_type, detail, reason))

    total = len(AC.BENCHMARK_PAIRS)
    pct = (passed / total) * 100
    pass_a = pct >= 90.0

    print(f"(a) Benchmark pairs: {passed}/{total} passed ({pct:.1f}%) (need >= 90.0%) -> {'PASS' if pass_a else 'FAIL'}")
    if failures:
        for pair, check_type, detail, reason in failures:
            print(f"    FAIL {pair:6s} [{check_type}]: {detail} | {reason}")

    return pass_a, passed, total, failures


def evaluate_coverage():
    reg_path = os.path.join(HERE, '..', 'model', 'territorial_claims.json')
    if not os.path.exists(reg_path):
        print("(b) Coverage FAIL: model/territorial_claims.json does not exist")
        return False

    reg = json.load(open(reg_path, encoding='utf-8'))
    claim_ids = {c['id'] for c in reg.get('claims', [])}
    excluded_ids = {e['id'] for e in reg.get('excluded', [])}

    # 1. 99 Natural Earth entities decided
    ne_failures = []
    for ent in AC.NE_99_ENTITIES:
        dec = ent['decision']
        if dec.startswith('claim:'):
            cid = dec.split(':', 1)[1]
            if cid not in claim_ids:
                ne_failures.append((ent['neId'], ent['name'], f"claim '{cid}' not found in registry"))
        elif dec.startswith('excluded:'):
            eid = dec.split(':', 1)[1]
            if eid not in excluded_ids:
                ne_failures.append((ent['neId'], ent['name'], f"exclusion '{eid}' not found in registry"))
        else:
            ne_failures.append((ent['neId'], ent['name'], f"unknown decision '{dec}'"))

    ne_ok = len(ne_failures) == 0
    ne_total = len(AC.NE_99_ENTITIES)
    ne_decided = ne_total - len(ne_failures)
    print(f"(b.1) Natural Earth 99 entities: {ne_decided}/{ne_total} decided (need 100%) -> {'PASS' if ne_ok else 'FAIL'}")
    if ne_failures:
        for ne_id, name, why in ne_failures[:5]:
            print(f"      MISS NE_ID {ne_id} ({name}): {why}")

    # 2. 53 Wikidata LOW pairs covered
    # A pair is covered if:
    # - It is matched by at least one claim in territorial_claims.json
    # - OR it is recorded in world/out/claims_unreviewed.json
    # - OR it is listed in excluded / reviewed_facts.json rejects
    unreviewed_path = os.path.join(HERE, 'out', 'claims_unreviewed.json')
    unreviewed = set()
    if os.path.exists(unreviewed_path):
        try:
            unreviewed = {tuple(sorted(p.split('-'))) if isinstance(p, str) else tuple(sorted(p))
                          for p in json.load(open(unreviewed_path))}
        except Exception:
            pass

    # Claims covered pairs
    claim_pairs = set()
    for c in reg.get('claims', []):
        admin = c.get('administeredBy')
        admin_code = admin if isinstance(admin, str) else admin.get('entity')
        for cl in c.get('claimants', []):
            cl_code = cl if isinstance(cl, str) else cl.get('entity')
            if admin_code and cl_code and admin_code != cl_code:
                claim_pairs.add(tuple(sorted((admin_code, cl_code))))
            # Co-claimants
            for cl2 in c.get('claimants', []):
                cl2_code = cl2 if isinstance(cl2, str) else cl2.get('entity')
                if cl_code and cl2_code and cl_code != cl2_code:
                    claim_pairs.add(tuple(sorted((cl_code, cl2_code))))

    # Excluded pairs / rejected facts
    rev_path = os.path.join(HERE, '..', 'model', 'reviewed_facts.json')
    rejected_pairs = set()
    if os.path.exists(rev_path):
        try:
            rev = json.load(open(rev_path))
            for f in rev.get('facts', []):
                if f.get('reject'):
                    p = f.get('pair')
                    if p:
                        rejected_pairs.add(tuple(sorted(p.split('-'))))
        except Exception:
            pass

    wd_failures = []
    for pair in AC.WIKIDATA_53_PAIRS:
        key = tuple(sorted(pair.split('-')))
        covered = (key in claim_pairs) or (key in unreviewed) or (key in rejected_pairs)
        if not covered:
            wd_failures.append(pair)

    wd_total = len(AC.WIKIDATA_53_PAIRS)
    wd_covered = wd_total - len(wd_failures)
    wd_ok = len(wd_failures) == 0
    print(f"(b.2) Wikidata 53 LOW pairs: {wd_covered}/{wd_total} covered (need 100%) -> {'PASS' if wd_ok else 'FAIL'}")
    if wd_failures:
        print(f"      UNCOVERED PAIRS: {wd_failures}")

    pass_b = ne_ok and wd_ok
    print(f"(b) Coverage overall: {'PASS' if pass_b else 'FAIL'}")
    return pass_b


def main(pairs_path=None):
    if pairs_path is None:
        pairs_path = os.path.join(HERE, 'out', 'pairs.json')

    print(f"--- Territorial Claims Audit Evaluation ---")
    pairs_dict = {}
    if os.path.exists(pairs_path):
        data = json.load(open(pairs_path))
        pairs_dict = {p['pair']: p for p in data.get('pairs', [])}
    else:
        print(f"Warning: {pairs_path} not found. Running coverage check only.")

    pass_a = False
    if pairs_dict:
        pass_a, _, _, _ = evaluate_pairs(pairs_dict)

    pass_b = evaluate_coverage()

    overall = pass_a and pass_b
    print(f"\nFinal result: {'ALL AUDIT CLAIMS CHECKS PASSED' if overall else 'SOME CHECKS FAILED'}")
    return overall


if __name__ == '__main__':
    ok = main(sys.argv[1] if len(sys.argv) > 1 else None)
    sys.exit(0 if ok else 1)
