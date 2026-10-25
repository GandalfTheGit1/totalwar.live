"""Validation of the two-channel map (tone = position V, opacity = ties T) and of the regional blocs added with it. Written and hashed (audit_map.sha256)
BEFORE any of the change was implemented. The pairs and countries are chosen from general knowledge of the relations, not from the engine's output.

DEFINITIONS (same in valence.ts and in audit_map_eval.py)
  TIES  = FULL_DIPLOMATIC, NONRESIDENT_RELATIONS, SHARED_LANGUAGE, BILATERAL_TREATIES, TRADE_HIGH, TRADE_MEDIUM, HUMAN_TIES, SHARED_FORUM
  T     = sum of the points of the TIES states of the pair
  V     = R - T   (everything else: alliances, integration, trade agreements, partnerships, and conflicts, sanctions, disputes, ruptures; for pairs with the events layer, also
                   its dynamic part)
  class ALLY    : V >= +30          class HOSTILE : V <= -25
  class TIES    : |V| < 5 and T > 0 class NODATA  : T = 0 and V = 0

ACCEPTANCE
  (1) PAIRS: at least 36 of the 40 pairs below fall in their expected class.
  (2) UTILITY: of the 40 countries below, at least 35 have 5 or more partners with |V| >= 5 (before the change: measured and recorded in audit_map_baseline.json).
  (3) NO EXAGGERATION: for |V| < 5 the colour must be a mix of the amber, slate and indigo stops only (unit test in __tests__/bilateral-relations.test.tsx).
  (4) BLOCS: the 15 membership cases below all hold; the 31 bloc cases of audit_blocs.py stay 31 of 31; the audit benchmark stays >= 79 of 89 and the hold-out >= 10 of 30.
Nothing is adjusted after seeing the results; a miss is reported as a miss.
"""

PAIRS = (
    [('US-GB', 'ALLY'), ('DE-FR', 'ALLY'), ('FI-SE', 'ALLY'), ('AU-NZ', 'ALLY'), ('JP-US', 'ALLY'), ('KR-US', 'ALLY'), ('DE-PL', 'ALLY'), ('ES-PT', 'ALLY'), ('EE-LV', 'ALLY'), ('AU-US', 'ALLY')] +
    [('RU-UA', 'HOSTILE'), ('IL-IR', 'HOSTILE'), ('KP-KR', 'HOSTILE'), ('IR-US', 'HOSTILE'), ('KP-US', 'HOSTILE'), ('RU-US', 'HOSTILE'), ('US-VE', 'HOSTILE'), ('AM-AZ', 'HOSTILE'),
     ('DZ-MA', 'HOSTILE'), ('CN-TW', 'HOSTILE')] +
    [('ES-JP', 'TIES'), ('BR-FR', 'TIES'), ('DE-IN', 'TIES'), ('IN-IT', 'TIES'), ('ES-KR', 'TIES'), ('FR-KR', 'TIES'), ('DE-ID', 'TIES'), ('BR-IT', 'TIES'), ('IN-NL', 'TIES'), ('JP-SE', 'TIES')] +
    [('AD-NR', 'NODATA'), ('LI-TV', 'NODATA'), ('NR-SM', 'NODATA'), ('BT-MH', 'NODATA'), ('MC-TV', 'NODATA'), ('LI-PW', 'NODATA'), ('AD-KI', 'NODATA'), ('KI-SM', 'NODATA'),
     ('MC-NR', 'NODATA'), ('BT-NR', 'NODATA')]
)

COUNTRIES = ['US', 'CN', 'DE', 'JP', 'IN', 'GB', 'FR', 'IT', 'CA', 'BR', 'RU', 'KR', 'AU', 'MX', 'ES', 'ID', 'NL', 'SA', 'TR', 'CH', 'PL', 'AR', 'SE', 'BE', 'IE', 'TH', 'NO', 'AT',
             'IL', 'AE', 'NG', 'EG', 'ZA', 'PH', 'BD', 'VN', 'DK', 'MY', 'SG', 'CO']

# (country, bloc, must be a member)  -- official lists as of 2026; ECOWAS lost Mali, Burkina Faso and Niger on 29 Jan 2025 (they form the Alliance of Sahel States)
BLOC_CASES = [
    ('NG', 'ECOWAS', True), ('ML', 'ECOWAS', False), ('NE', 'ECOWAS', False), ('BF', 'AES', True), ('ZA', 'SADC', True), ('MZ', 'SADC', True),
    ('KE', 'EAC', True), ('MX', 'PACIFIC_ALLIANCE', True), ('AR', 'CAN', False), ('BO', 'CAN', True), ('JM', 'CARICOM', True), ('AF', 'SAARC', True),
    ('IN', 'SAARC', True), ('AU', 'PIF', True), ('TR', 'SAARC', False),
]
