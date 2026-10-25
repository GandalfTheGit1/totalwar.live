"""Protocol for calibrating the MAGNITUDE of the standing coercive measures. FROZEN (hash in protocol_magnitude.sha256) BEFORE the grid is evaluated and before the reserved episode is read.

Problem: with the current design (state value -30 at full intensity, intensity saturates at 24 weight, lifted measures fade with a 1-year half-life) the dynamic shock of a coercion episode
decays within ~1-2 years while the standing state subtracts at most 30, so the relationship appears to recover too fast while the measures are still in force
(Australia-China: R = -20 at the end of 2021 against an expected <= -30; Japan-South Korea: -21 against <= -41).

Development cases (the only data used to choose):  AUCN (14 anchors, gold labels, 'complete' facts)  and  JPKR (13 anchors, gold labels, 'auto' facts).
Knobs (global, three; NOT per event):
    measureMax   absolute value of the MEASURES_IN_FORCE state at full intensity     {30 (current), 40, 50, 60}
    fadeHL       half-life in days with which a LIFTED measure fades                  {180, 365 (current), 730}
    measureFull  accumulated weight that gives full intensity                          {12, 24 (current), 36}
Everything else (event points, half-lives, saturation, multipliers, anchors, gold labels, catalog, reset rule) stays as is.

Loss: the anchors loss used so far (sum of weight x violation in points; 20 for a wrong trend).

Selection (leave-one-episode-out):  fit on AUCN -> test on JPKR;  fit on JPKR -> test on AUCN.  Among the combinations whose TRAINING loss is within 5 % (or 2 points) of the best, pick the one closest to the
current setting (distance = sum of |ln(ratio)| over the three knobs).  The joint choice (sum of both losses, same parsimony rule) is reported but never adopted by itself.

Adoption rule - a candidate replaces the current setting ONLY IF all hold:
  (a) it lowers the held-out loss in BOTH directions of the cross-validation by at least 5 % relative to the current setting (or reaches 0);
  (b) the joint choice and the two cross-validated choices agree on measureMax within one grid step (otherwise the data do not identify it);
  (c) with it, the calibration episodes (ES-MA, IN-CA: 28 anchors) and the Saudi-Qatar episode (14 anchors) keep 0 violations with gold labels where they have 0 now;
  (d) the realistic pipeline loss (A + Qwen + judge, four A/B run combinations) on the two development cases does not increase.
If any condition fails the current setting stays and the failure is reported.  Reserved-episode validation then compares the adopted setting with the current one WITHOUT further changes.
"""
GRID = dict(measureMax=[30, 40, 50, 60], fadeHL=[180, 365, 730], measureFull=[12, 24, 36])
CURRENT = dict(measureMax=30, fadeHL=365, measureFull=24)
