"""AMENDMENT A1 to protocol_magnitude.py. Written AFTER the first grid on the development cases and BEFORE any material of the reserved episode was read. FROZEN by hash.

Result of round 1 (36 combinations, gold labels; recorded here because it motivates the amendment):
  * AUCN loss 61.8 -> 38.4 for measureMax >= 50; JPKR indifferent (30.0 everywhere near the current setting); fadeHL and measureFull are flat or harmful.
  * By the protocol's own rule NO candidate is adopted: the JPKR-fitted choice IS the current setting (so there is no held-out gain in AUCN) and the AUCN-fitted choice (50,365,24) gives no gain in JPKR.
  * Moreover the realistic pipeline (condition d) gets WORSE in JPKR with measureMax 50 (mean loss 16-21 -> 39-40).
  * Diagnosis from the failing anchors: raising the state magnitude deepens the trough as well (AUCN R(2020-12-31) -76 -> -96), so the 'recovery' anchors
    (R(end) - R(trough) <= 20/30) are still violated. The recovery is not caused by the cap of the STATE but by the DYNAMIC shock of the measure events, which decays
    (half-lives of a few months) while the measure is still in force.

Hypothesis H2 (new knob, pre-declared): while a measure is in force (no lifting act paired to it) its EVENT keeps at least  holdFrac x its initial contribution;
once it is lifted the held value decays with the event's normal half-life counted from the lifting date.  holdFrac = 0 is the current model.
Grid: holdFrac {0, 0.25, 0.5, 0.75}  x  measureMax {30, 40, 50}   (fadeHL = 365 and measureFull = 24 stay fixed: flat in round 1)  -> 12 combinations.
Selection, adoption rule (a)-(d), leave-one-episode-out and the reserved-episode procedure are exactly those of protocol_magnitude.py (distance now = |ln(max/30)| + holdFrac).
Reserved-episode rule: whatever is adopted (or the current setting if nothing is) is compared with the current setting on the reserved episode with NO further change; the result is reported as is.
Limit written in advance: two development episodes cannot identify two interacting knobs well; if the cross-validation does not agree the current setting stays.
"""
GRID = dict(holdFrac=[0.0, 0.25, 0.5, 0.75], measureMax=[30, 40, 50])
CURRENT = dict(holdFrac=0.0, measureMax=30)
