"""Protocol v3 for trade agreements: ONE amendment to audit_trade_v2.py, written and hashed (audit_trade_v3.sha256) BEFORE re-scoring anything.

WHY: v2 was scored on 2026-10-25: D1-D5 passed, benchmark 78 (>= 78), map 36/40, hold-out 10, calibration 153.2, but the bloc cases failed 22/29. The seven misses are Mercosur and EAEU
pairs that the old cases (audit_blocs.py) label FTA_IN_FORCE and that the ladder correctly labels CUSTOMS_UNION (both blocs are customs unions with a common external tariff); v2 declared this
amendment for the four GCC pairs and omitted these seven. This is an amendment written AFTER seeing the failure, so it is weaker evidence than a rule fixed in advance.

WHAT CHANGES: nothing in code, weights, data or thresholds. Only the evaluator: for the pairs in CU_AMEND a case that wants FTA_IN_FORCE present is read as wanting CUSTOMS_UNION present
(and FTA_IN_FORCE absent, the ladder keeps one level). Everything else of audit_trade_v2.py (D1-D5, E's other thresholds, the two reported-not-gated cases) stays as it was.
ACCEPTANCE: D1-D5 as in v2, bloc cases with the GCC amendment of v2 and this one: all 29 gated cases hold, benchmark >= 78, map >= 36/40 and utility >= 35, hold-out >= 10, calibration as in v2.
If it passes the ladder is adopted (WTO states stay on, app export regenerated). If not, the WTO states stay off.
"""
from audit_trade_v2 import *   # noqa: F401,F403

CU_AMEND = ['AR-BR', 'BO-BR', 'PY-UY', 'BY-RU', 'KZ-RU', 'KG-KZ', 'AM-RU']      # want CUSTOMS_UNION instead of FTA_IN_FORCE
