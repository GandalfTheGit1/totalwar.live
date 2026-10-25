"""Protocol v2 for trade agreements: a ladder of integration levels. Written and hashed (audit_trade_v2.sha256) BEFORE implementing it.

WHY: audit_trade.py (v1) was scored on 2026-10-25: A and B passed, C failed (bloc cases 23/31, benchmark 78, map pairs 36/40). Most misses were the same disagreement: the WTO list and the
earlier fixed cases define "in force" differently (customs union vs free-trade area vs preferential). The user asked for the distinction to be modelled.

WHAT CHANGES
  New state CUSTOMS_UNION (+18) above FTA_IN_FORCE (+12) above PREFERENTIAL_TRADE (+6). ONE level per pair, the highest wins; DEEP_INTEGRATION (EU, +25) replaces all three.
  WTO types: CU and CU & EIA -> CUSTOMS_UNION; FTA and FTA & EIA -> FTA_IN_FORCE; PSA, EIA, PSA & EIA -> PREFERENTIAL_TRADE.
  Rules written in advance because v1 showed them: the African Continental Free Trade Area (any RTA whose name contains 'African Continental') is PREFERENTIAL_TRADE, not FTA (it is not yet a working
  free-trade area); bloc-derived states: MERCOSUR, EAEU and GCC become CUSTOMS_UNION (SACU comes from the WTO list).
  Weights are ordinal judgement (no episode anchors a customs union), not calibrated.

ACCEPTANCE (all must hold, each part judged on its own; if any fails the ladder is not adopted and the WTO states stay off)
  D1 customs unions:  >= 9 of 11 pairs in CU carry CUSTOMS_UNION and neither FTA_IN_FORCE nor PREFERENTIAL_TRADE.
  D2 free-trade areas that are not unions: >= 11 of 13 carry FTA_IN_FORCE and not CUSTOMS_UNION.
  D3 EU: all 5 pairs in EU carry DEEP_INTEGRATION and none of CUSTOMS_UNION / FTA_IN_FORCE / PREFERENTIAL_TRADE.
  D4 AfCFTA only: >= 2 of 3 pairs carry PREFERENTIAL_TRADE and none of CUSTOMS_UNION / FTA_IN_FORCE.
  D5 negatives: >= 9 of 10 pairs carry none of the three levels.
  E  no regression (thresholds set AFTER seeing the v1 numbers, so weaker evidence than D1-D5):
     bloc cases (audit_blocs.py) with these declared amendments: the four GCC cases want CUSTOMS_UNION instead of PREFERENTIAL_TRADE; RU-UZ (Uzbekistan joined the CIS free-trade area) and ER-ET
     are reported, not gated, because a notified real agreement contradicts the old expectation; the remaining 29 must all hold (NG-ZA FTA absent / PREFERENTIAL present are kept as they were).
     benchmark of 89 pairs >= 78;  map cases >= 36/40 (audit_map.py's own threshold; audit_trade.py asked 40/40 and the four misses ES-JP, ES-KR, FR-KR, JP-SE come from real EU agreements);
     map utility >= 35;  hold-out >= 10;  calibration: sum of the six losses <= 151.0 + 15 and no zero-loss episode above 5 (calibration/calib_report.py).
LIMITS: the WTO list only holds notified agreements; D1-D5 pairs are chosen from my knowledge, not from any pair-level WTO output.
"""
CU = ['AR-UY', 'KG-KZ', 'AM-BY', 'BH-KW', 'OM-SA', 'LS-ZA', 'NA-SZ', 'DE-TR', 'FR-TR', 'AE-KW', 'BR-PY']
FTA = ['JP-SG', 'AU-NZ', 'CL-US', 'KR-SG', 'CN-SG', 'ID-JP', 'CO-US', 'MX-US', 'GB-KR', 'CA-KR', 'CA-CL', 'JP-MX', 'PE-US']
EU = ['DE-FR', 'ES-IT', 'NL-SE', 'PL-PT', 'AT-HU']
AFCFTA = ['NG-ZA', 'GH-ZA', 'KE-NG']
NEG = ['IN-US', 'BR-JP', 'AR-US', 'RU-US', 'CN-US', 'SA-US', 'PK-US', 'NG-US', 'JP-RU', 'BR-CN']
NEED = dict(CU=9, FTA=11, AFCFTA=2, NEG=9)
GCC_AMEND = ['AE-SA', 'KW-QA', 'BH-OM', 'QA-SA']                 # want CUSTOMS_UNION instead of PREFERENTIAL_TRADE
NOT_GATED = [('RU-UZ', 'FTA_IN_FORCE'), ('ER-ET', 'TRADE_ANY')]
BENCH_MIN, MAP_MIN, UTIL_MIN, HOLDOUT_MIN = 78, 36, 35, 10
