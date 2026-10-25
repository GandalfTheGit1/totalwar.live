"""Protocol v4: review of the two cases v3 left reported-not-gated. Written and hashed (audit_trade_v4.sha256) BEFORE changing any code or re-scoring.

FINDINGS (read from the WTO list, model/wto/rta_all.xlsx):
  RU-UZ: the list holds a real bilateral free-trade agreement (RTA #861, Russian Federation - Uzbekistan, 1993, FTA). FTA_IN_FORCE is therefore right; the old case in audit_blocs.py
         ("Uzbekistan is an EAEU observer -> no FTA") was wrong about the pair. No code change; the case is amended here.
  ER-ET: CUSTOMS_UNION comes only from COMESA (RTA #121 and its accessions, all typed CU). COMESA announced a customs union in 2009 but never operates one; Ethiopia and Eritrea are not even in
         its free-trade area. A notified type is not the same as an operating regime, as already ruled for the AfCFTA.
CHANGE: any WTO agreement whose name contains 'COMESA' is read as PREFERENTIAL_TRADE (like the AfCFTA). LIMIT written in advance: this understates the COMESA free-trade-area members
(e.g. Egypt-Kenya) and gives them +6 instead of +12; no list of those members is hard-coded because I cannot verify it here.
ACCEPTANCE: ER_ET_PREF: all 5 COMESA_PREF pairs carry PREFERENTIAL_TRADE and neither CUSTOMS_UNION nor FTA_IN_FORCE. UZ: RU-UZ keeps FTA_IN_FORCE and no CUSTOMS_UNION.
CU_KEEP: >= 5 of 6 genuine customs-union pairs keep CUSTOMS_UNION. D1-D5 and E of v3 and the regression thresholds (benchmark >= 78, map >= 36, utility >= 35, hold-out >= 10,
calibration sum <= 166 and no zero-loss episode above 5) must still hold. If not, the change is reverted.
"""
COMESA_PREF = ['ER-ET', 'ET-KE', 'EG-ZM', 'MW-ZM', 'MG-MU']
UZ = 'RU-UZ'
CU_KEEP = ['AR-UY', 'BH-KW', 'LS-ZA', 'NA-SZ', 'BR-PY', 'KG-KZ']
CU_KEEP_NEEDED = 5
