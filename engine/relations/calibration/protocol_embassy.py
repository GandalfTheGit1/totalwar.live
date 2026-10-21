"""Protocol for the three-valued EMBASSY STATE (round 5). FROZEN by hash (protocol_embassy.sha256) BEFORE the new code is evaluated on any episode and before the reserved episode is read.

Motivation (round 4): AMBASSADOR_ABSENT was derived from events with a 36-month hard look-back, so in Canada-Saudi Arabia (envoys out from 2018-08 to 2023-05) the state vanished in 2021-08
while nothing had changed, and R jumped. The user asked to know, for every pair, the state of each country's embassy in the other, using Wikidata, events and the re-verification step.

RULES (fixed a priori; no parameter is fitted in this round)
  E1  One status per SIDE s of the pair (= the head of s's mission in the other country r), at any date t:  PRESENT | ABSENT | UNKNOWN.
  E2  Absence evidence for s: an IMPLEMENTED AMBASSADOR_RECALL by s, or an IMPLEMENTED EXPULSION by r whose text names a head of mission (ambassador, high commissioner, charge d'affaires, nuncio).
  E3  Restoration evidence for s after an absence dated d: an IMPLEMENTED AMBASSADOR_RESTORED or NORMALIZATION of the pair dated after d; or a Wikidata holder of the position that directs s's embassy in r
      whose start date, taken at the END of its precision period (year -> 31 Dec, month -> last day), is after d; or a re-verification verdict LIFTED.
  E4  ABSENT when the latest absence evidence <= t has no restoration evidence in (d, t].  NO TIME LIMIT (the 36-month cut is removed).
  E5  Otherwise PRESENT when there was a restoration, or when a Wikidata tenure is certain at t: start (end of its period) <= t and either end (start of its period) > t, or no end and start >= t - 6 years.
  E6  Otherwise UNKNOWN.  A gap in Wikidata is NEVER read as absence (coverage is very uneven: Spain has a current holder for 100 of 119 embassies, Canada for 4 of 99, Senegal for 0 of 27).
  E7  Score unchanged: ABSENT -10 per side (AMBASSADOR_ABSENT); PRESENT and UNKNOWN 0.  RELATIONS_SEVERED still gives NO_RELATIONS instead.  Re-verification unchanged (old ABSENT sides are searched;
      UNKNOWN verdict -> that side at half weight; LIFTED with a date -> restoration fact; LIFTED without a date -> that side ends).
  E8  Every run reports, per side: status, since, source (event / wikidata / web / none) and the Wikidata holder when there is one.

DEVELOPMENT (all six episodes seen so far: ES-MA, IN-CA, AU-CN, SA-QA, JP-KR, CA-SA; gold labels and the realistic pipeline A + B{qwen, cohere} + judge, 2x2 runs).
ADOPTION RULE: the new state replaces the old one only if
  (a) the gold loss of CA-SA (the case that motivated the change) goes down;
  (b) no other development episode's gold loss goes up by more than 2 points;
  (c) the realistic loss summed over the six episodes (mean of the four run combinations, each B) does not go up by more than 5 %.
If any fails, the old state stays and the failure is reported.

RESERVED EPISODE, chosen now by name and before reading anything about it: ISRAEL - TURKEY 2018-2024.
  Criterion: a head-of-mission absence longer than 36 months with a documented restoration, followed by a second withdrawal -- exactly what E4/E5 change.
  Order: freeze code by hash -> fetch the article -> write and hash the anchors -> extract facts -> hand labels, hashed -> classify -> score with the new state and with the old one (structure_v6.py).
  Success criterion fixed now: new gold loss lower than the old one by >= 5 % (or both 0) AND realistic mean loss not higher. Reported as it comes out; nothing changed afterwards.
KNOWN LIMIT written down now: Wikidata tenures are today's record of the past (entered later), so using them for past dates has some hindsight; the year precision of most start dates delays restorations
to 31 December of that year.
"""
OPEN_TENURE_YEARS = 6
ABSENT_POINTS_PER_SIDE = -10
