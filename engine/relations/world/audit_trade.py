"""Validation of (1) the trade agreements read from the WTO regional trade agreements list and (2) the correction of investment treaties. Written and hashed
(audit_trade.sha256) BEFORE implementing either. The only thing seen of the WTO file is its structure (columns, types, status values, party names), not any pair.

WHAT IS CHANGED
  WTO   every RTA with status 'In Force' (or 'In force for at least one Party') is expanded to country pairs (blocs expanded to their members; no pair is created inside one bloc;
        per-party entry and exit dates are honoured).  Type FTA, CU, 'FTA & EIA', 'CU & EIA' -> FTA_IN_FORCE;  PSA, EIA only, 'PSA & EIA' -> PREFERENTIAL_TRADE.  Source of the state: 'wto-rta'.
        It is ADDED to the bloc-derived trade states (union); a cross-check of the two sources is reported, not gated.
  BIT   investment treaties (Wikidata, ~2,000) become their own state INVESTMENT_TREATY (+1, a TIES state) instead of counting +2 inside BILATERAL_TREATIES. Intra-EU BITs are dropped
        (terminated by the agreement of 5 May 2020). Other treaties keep BILATERAL_TREATIES.

ACCEPTANCE (each part is judged on its own)
  A. WTO FTA / preferential cases (TRADE_YES below):  >= 23 of 26 pairs carry FTA_IN_FORCE (or PREFERENTIAL_TRADE where the case says 'pref').
     WTO negatives (TRADE_NO): >= 12 of 13 pairs carry neither FTA_IN_FORCE nor PREFERENTIAL_TRADE.   If A fails, the WTO states stay OFF.
  B. Investment-treaty cases: all 5 intra-EU pairs (BIT_EU) have NO investment-treaty state and no BILATERAL_TREATIES caused by a BIT; >= 3 of the 4 pairs in BIT_KEEP keep INVESTMENT_TREATY.
  C. No regression: the 31 bloc cases (audit_blocs.py) 31/31; the 89-pair benchmark >= 79; the 30-pair hold-out >= 10; the 40-pair map cases (audit_map.py) 40/40 and utility >= 35.
     Calibration (gold labels, six episodes): the sum of the six losses must not rise by more than 15 relative to the current 0 + 0 + 0 + 73.7 + 30.0 + 47.3 = 151.0, and no episode that has loss 0 today may exceed 5.
     (Australia-China and Japan-Korea gain real agreements from 2015 and 2022; their change is reported with the reason.)
  If C fails the change is not adopted.
LIMITS written in advance: the WTO list records notified agreements (some are never notified); an RTA 'In Force' for a bloc may not be in force for every member; the party-level dates only exist for
some agreements; the registry of states excludes territories (Hong Kong, Macao, Greenland, Faroe Islands...), so those partners are dropped.
"""

# (pair alphabetical, wanted) wanted = 'fta' -> FTA_IN_FORCE present; 'pref' -> PREFERENTIAL_TRADE or FTA_IN_FORCE present
TRADE_YES = [
    ('AU-CN', 'fta'), ('CN-NZ', 'fta'), ('AU-JP', 'fta'), ('IN-JP', 'fta'), ('KR-US', 'fta'), ('SG-US', 'fta'), ('CL-CN', 'fta'), ('KR-VN', 'fta'), ('CA-MX', 'fta'), ('CN-JP', 'fta'),
    ('GB-JP', 'fta'), ('AU-GB', 'fta'), ('GB-NZ', 'fta'), ('DE-FR', 'fta'), ('AR-BR', 'fta'), ('BY-RU', 'fta'), ('KZ-RU', 'fta'), ('AE-SA', 'fta'), ('KE-TZ', 'fta'), ('BW-ZA', 'fta'),
    ('CA-US', 'fta'), ('CH-JP', 'fta'), ('FR-GB', 'fta'), ('DE-GB', 'fta'), ('BR-IN', 'pref'), ('AR-IN', 'pref'),
]
TRADE_NO = ['CN-IN', 'CN-US', 'RU-US', 'NG-US', 'PK-US', 'IN-US', 'BR-US', 'BR-CN', 'EG-US', 'SA-US', 'CN-RU', 'IN-RU', 'IR-US']
BIT_EU = ['ES-PL', 'DE-RO', 'FR-IT', 'NL-SE', 'AT-HU']
BIT_KEEP = ['CN-DE', 'FR-VN', 'IT-MX', 'MA-ES']       # BITs in force with a non-EU partner (sorted below by the evaluator)
YES_NEEDED, NO_NEEDED, KEEP_NEEDED = 23, 12, 3
CALIB_BASE = dict(ESMA=0.0, INCA=0.0, QASA=0.0, AUCN=73.7, JPKR=30.0, CASA=47.3)
CALIB_SUM_MAX_RISE, CALIB_ZERO_MAX = 15.0, 5.0
