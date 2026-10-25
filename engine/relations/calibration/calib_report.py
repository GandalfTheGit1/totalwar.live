"""Prints the six gold-label calibration losses of the CURRENT model and the verdict of the audit_trade rule (sum may rise by <= 15 against 151.0; an episode at 0 may not exceed 5).
Run:  cd engine/relations/calibration && python3 -I calib_report.py        (offline, cached data only)"""
import os, sys
os.environ.setdefault('WGE_OFFLINE', '1')
sys.path.insert(0, '.')
sys.path.insert(0, '../world')
from mag_env import L, VER, evaluate2
import audit_trade as P

now = {k: round(evaluate2(k, L.gold_final(k, VER[k]))[0], 1) for k in P.CALIB_BASE}
print('losses now   :', now)
print('losses before:', P.CALIB_BASE)
total, base = sum(now.values()), sum(P.CALIB_BASE.values())
zero_bad = [k for k, v in P.CALIB_BASE.items() if v == 0 and now[k] > P.CALIB_ZERO_MAX]
ok = total <= base + P.CALIB_SUM_MAX_RISE and not zero_bad
print(f'sum {total:.1f} vs {base:.1f} (max rise {P.CALIB_SUM_MAX_RISE}); zero-loss episodes above {P.CALIB_ZERO_MAX}: {zero_bad or "none"} -> {"PASS" if ok else "FAIL"}')
sys.exit(0 if ok else 1)
