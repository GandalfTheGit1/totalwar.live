"""AMENDMENT A2 to protocol_magnitude.py. Written AFTER the development rounds (A1 included) and BEFORE any fact of the reserved episode (Canada–Saudi Arabia, anchors_canada.py) was extracted, labelled or scored.

Outcome of the development rounds, recorded before touching the reserved episode:
  * Round 1 (measureMax x fadeHL x measureFull, 36 combos): no candidate adopted (no held-out gain in both directions; realistic JPKR loss worsens with measureMax 50).
  * Round 2 / A1 (holdFrac x measureMax, 12 combos): the cross-validation picks (holdFrac 0.5, measureMax 30) in both directions (AUCN-fit -> JPKR 30.0 -> 20.0; JPKR-fit -> AUCN 61.8 -> 39.6),
    conditions (b) and (c) hold, but condition (d) FAILS: the realistic pipeline loss on JPKR rises (qwen 21.1 -> 49.8, cohere 16.3 -> 25.4) because a held measure is released too slowly after the lifting
    and an unpaired measure stays held forever. By the pre-registered rule the CURRENT model stays: holdFrac 0, measureMax 30, fadeHL 365, measureFull 24.
Reserved-episode protocol:
  * OFFICIAL result = the current (unchanged) model, with gold labels and with the realistic pipeline (A + B{qwen, cohere} + judge, 2x2 runs), compared with the anchors fixed in anchors_canada.py.
  * DIAGNOSTIC result (not an adoption): the same facts and labels evaluated with the rejected candidates C1 = (holdFrac 0.5, measureMax 30) and C2 = (holdFrac 0, measureMax 50), to see whether
    the development gain generalises and whether the veto by condition (d) was right.
  * Reading rule fixed in advance: C1 counts as supported only if its loss is lower than the current one by >= 5 % relative BOTH with gold labels and as the mean of the realistic runs;
    otherwise it is discarded. Nothing is changed after the results are seen; a candidate that is supported still needs a further protocol and a further reserved episode before adoption.
"""
