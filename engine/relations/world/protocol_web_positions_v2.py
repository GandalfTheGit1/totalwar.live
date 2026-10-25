"""Protocol v2 of the web proposal of positions. FROZEN by hash (protocol_web_positions_v2.sha256) BEFORE any search or model call for its controls.

WHY A v2: protocol v1 (protocol_web_positions.py, hash 3c8393dd...) was scored once on its 30 controls on 2026-10-21 and FAILED its guard: positives 13/18 (needed 12, passed), negatives
12/12 (needed 11, passed), false alliances none (passed), but only 9 of the 14 accepted findings that were not on the control list were correct (64 %, needed 90 %). All the errors
were in one code, SANCTIONS_REGIME_TARGETED (1 correct of 6: stale Chinese measures against Australia, sanctions on a Brazilian judge, Russia "joining" the UN sanctions on North Korea,
a quote about third-party sanctions for Russia-Ukraine, one unverifiable); the other eight unexpected findings were all correct. By v1's own rule the 300 pairs were NOT filled.

CHANGE (the only one): SANCTIONS_REGIME_TARGETED is removed from the allowed codes (a news snippet cannot tell who sanctions whom, and whether it is in force). The pipeline, the keyword rules,
the reject words, the queries, the model chain and every threshold are those of v1. A pair with sanctions keeps getting them from the project's own regime data and the reviewed facts.

CONTROLS: NEW pairs, none searched before (the v1 control pairs are not reused). Scored once with the pipeline as frozen; no change afterwards.
  POSITIVES  19 pairs whose expected code must be among the accepted codes.   PASS: >= 13 of 19
  NEGATIVES  12 (pair, code) checks that must NOT be accepted: 6 DEFENSE_ALLIANCE, 6 FTA_IN_FORCE.   PASS: >= 11 of 12, none of the 6 alliance negatives accepted
  GUARD      every accepted finding that is neither an expected code nor a negative is listed and judged by the author against public knowledge; a finding the author cannot verify counts as
             WRONG. PASS: >= 90 % correct.
If any condition fails the worklist is not filled and the web method is dropped for this task.
"""
from protocol_web_positions import *   # noqa: F401,F403  (pipeline constants of v1 are unchanged)

CODES = ['DEFENSE_ALLIANCE', 'STRATEGIC_PARTNERSHIP', 'FTA_IN_FORCE', 'PREFERENTIAL_TRADE', 'TERRITORIAL_DISPUTE_ACTIVE', 'ARMED_CONFLICT', 'OCCUPATION', 'NO_RELATIONS']
CODE_DEFINITIONS = {k: v for k, v in CODE_DEFINITIONS.items() if k in CODES}      # noqa: F405
CODE_RULES = {k: v for k, v in CODE_RULES.items() if k in CODES}                  # noqa: F405

CONTROL_POSITIVES = [
    ('PH-US', 'DEFENSE_ALLIANCE'), ('PK-SA', 'DEFENSE_ALLIANCE'), ('FR-GR', 'DEFENSE_ALLIANCE'),
    ('SG-US', 'FTA_IN_FORCE'), ('CL-CN', 'FTA_IN_FORCE'), ('KR-VN', 'FTA_IN_FORCE'), ('CA-MX', 'FTA_IN_FORCE'),
    ('CN-ID', 'STRATEGIC_PARTNERSHIP'), ('CN-EG', 'STRATEGIC_PARTNERSHIP'), ('DE-IN', 'STRATEGIC_PARTNERSHIP'), ('FR-IN', 'STRATEGIC_PARTNERSHIP'), ('IN-JP', 'STRATEGIC_PARTNERSHIP'),
    ('GE-RU', 'OCCUPATION'), ('IL-SY', 'OCCUPATION'),
    ('CN-JP', 'TERRITORIAL_DISPUTE_ACTIVE'), ('CN-VN', 'TERRITORIAL_DISPUTE_ACTIVE'),
    ('IR-US', 'NO_RELATIONS'), ('IL-SA', 'NO_RELATIONS'), ('KP-US', 'NO_RELATIONS'),
]
CONTROL_NEGATIVES = [
    ('AU-IN', 'DEFENSE_ALLIANCE'), ('IN-JP', 'DEFENSE_ALLIANCE'), ('FR-IN', 'DEFENSE_ALLIANCE'), ('EG-SA', 'DEFENSE_ALLIANCE'), ('CN-EG', 'DEFENSE_ALLIANCE'), ('DE-IN', 'DEFENSE_ALLIANCE'),
    ('RU-US', 'FTA_IN_FORCE'), ('NG-US', 'FTA_IN_FORCE'), ('PK-US', 'FTA_IN_FORCE'), ('EG-US', 'FTA_IN_FORCE'), ('SA-US', 'FTA_IN_FORCE'), ('BR-IN', 'FTA_IN_FORCE'),
]
POSITIVES_NEEDED, NEGATIVES_NEEDED, GUARD_SHARE = 13, 11, 0.90
