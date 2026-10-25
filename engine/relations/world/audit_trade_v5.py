"""Protocol v5: ONE amendment to audit_trade_v4.py, written and hashed (audit_trade_v5.sha256) BEFORE re-evaluating. No code, weight or data changes.

WHY: v4 was scored on 2026-10-25: RU-UZ and the genuine customs unions held (6/6), 3 of the 5 COMESA cases held, and 2 failed: MW-ZM and MG-MU carry FTA_IN_FORCE because they really are
in the SADC free-trade area (WTO RTA #? 'Southern African Development Community'), not because of COMESA. I chose those two cases without being able to check the SADC and COMESA free-trade-area
membership lists; they were wrong cases, not a wrong rule. This amendment is written AFTER seeing the failure, so it is weaker evidence.
CHANGE: COMESA_PREF loses MW-ZM and MG-MU (3 pairs left: ER-ET, ET-KE, EG-ZM; all 3 must hold). Everything else of v4 stays.
"""
from audit_trade_v4 import *   # noqa: F401,F403

COMESA_PREF = ['ER-ET', 'ET-KE', 'EG-ZM']
