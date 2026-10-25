"""Protocol for the GDELT press-pulse layer. FROZEN by hash (protocol_gdelt.sha256) BEFORE the authorised download and before any pulse is computed.
The only GDELT data seen so far is one test day (2026-10-19) used to check that the reader works (heaviest pairs RU-UA, RU-US, UA-US, IL-PS, IL-US).

DATA   GDELT 1.0 daily event files; set A = the 365 days before 2026-10-20; set B = one day in 14 from 2016-01-04 to 2025-10-19 (Mondays). Aggregation: gdelt.py.
       "Available days" = A union B. All recency weights below are normalised per available day, so the different densities of A (daily) and B (biweekly) do not matter.

MEASURE (per pair, at date t)
  recent window   available days with age <= 135 d before t, weight 0.5 ** (age / 45)            (half-life 45 d)
  baseline window available days with 135 d < age <= 730 d (validation) or <= 365 d (live, set A only), equal weights
  per-day means   Gp = sum(w*Gpos)/sum(w)   Gn = sum(w*Gneg)/sum(w)   V = sum(w*W)/sum(w)       (Gpos / Gneg = weighted positive / negative Goldstein)
  balance         B = (Gp - Gn) / (Gp + Gn + K_DAY)       K_DAY = 0.5      -> in [-1, +1]
  volume          V90 = 90 * V  (weighted events per 90 days)             VMIN = 15
  no pulse        when V90_recent < VMIN, or the baseline has fewer than 10 available days (validation) -> P = 0
  baseline value  B_base from the baseline window when its V90 >= VMIN; otherwise B0 = volume-weighted mean of B over all pairs in the same baseline window
  change term     DELTA = B_recent - B_base                                              in [-2, +2]
  level term      LEVEL = B_recent - (ALPHA + BETA * S_struct / 100): residual of the recent balance against what the structural score predicts; ALPHA, BETA by ordinary
                  least squares over pairs with V90_recent >= 3 * VMIN, set A only, excluding the 5 pairs that already have the events layer. LIVE ONLY (the structural
                  score of past dates is not available, so history can test the change term only).
  shrink          SHRINK = min(1, V90_recent / (3 * VMIN))
  pulse           P = clip(GAIN_C * DELTA * SHRINK + GAIN_L * LEVEL * SHRINK, -PCAP, +PCAP)      GAIN_C = 15, GAIN_L = 15, PCAP = 20     (points of R)
  into R          R_final = clip(R + P) ; for a pair that already has the events layer (LLM facts) P is multiplied by 0.5. States and the structural score are untouched.

VALIDATION (sign checks use P_change = clip(GAIN_C * DELTA * SHRINK); a hit needs the right sign, |DELTA| >= 0.05 and a pulse (not 'no pulse'))
  Development (episodes already seen; written from their documented dates): DEV_CHECKS below.  Controls: |P_change| <= 3 (a 'no pulse' counts as passing).
  Reserved (episodes and dates written now, never compared with GDELT): RESERVED_CHECKS below, from the author's knowledge of 2024-2025 events.
  Live, today: world/audit_holdout.py (30 pairs, 10 in range without the pulse) and world/audit_benchmark.py (89 pairs, 81 in range) scored with the full pulse.

ADOPTION (all must hold, otherwise the pulse stays OUT of R and is kept only as a separate signal and for ranking pairs for the events layer)
  (a) development: >= 11 of the 14 sign checks hit AND both development controls pass;
  (b) reserved:    >= 5 of the 7 sign checks hit AND both reserved controls pass;
  (c) live:        hold-out in range >= 13 of 30 AND benchmark in range >= 79 of 89 AND the 31 bloc cases still 31 of 31;
  (d) no pair with V90_recent < 3 * VMIN moves by more than |P| <= 20 * V90_recent / (3 * VMIN) (guaranteed by SHRINK; checked on the output).
No constant is tuned on the results: if the rule fails it is reported as failed, and a different design needs a new protocol and new reserved cases.

LIMITS written in advance: media coverage bias (US, Russia, Israel over-represented, Africa and the Pacific under-represented), automatic CAMEO coding noise, symmetric pulse,
single sampled day per fortnight in set B (the validation tests direction, not magnitude), and a baseline that is itself a conflict for long-running wars (the level term addresses it, live only).
"""
K_DAY, VMIN, GAIN_C, GAIN_L, PCAP = 0.5, 15.0, 15.0, 15.0, 20.0
HALF_LIFE, RECENT_MAX_AGE, BASE_MAX_AGE_VALIDATION, BASE_MAX_AGE_LIVE, MIN_BASE_DAYS = 45.0, 135, 730, 365, 10
LLM_FACTOR = 0.5

# (pair, date, expected sign of the change term)
DEV_CHECKS = [
    ('ES-MA', '2021-06-30', -1), ('ES-MA', '2022-06-30', +1),       # border crisis May 2021 / rapprochement from March 2022
    ('CA-IN', '2023-10-31', -1), ('CA-IN', '2025-12-31', +1),       # Nijjar row September 2023 / restoration August 2025
    ('AU-CN', '2020-12-31', -1), ('AU-CN', '2023-03-31', +1),       # trade war 2020 / Bali meeting and Wong's visit
    ('QA-SA', '2017-07-31', -1), ('QA-SA', '2021-03-31', +1),       # blockade June 2017 / Al-Ula January 2021
    ('JP-KR', '2019-09-30', -1), ('JP-KR', '2023-04-30', +1),       # export controls 2019 / Yoon visit March 2023
    ('CA-SA', '2018-09-30', -1), ('CA-SA', '2023-07-31', +1),       # Freeland row August 2018 / restoration May 2023
    ('IL-TR', '2023-11-30', -1), ('IL-TR', '2022-09-30', +1),       # Gaza war rupture / Lapid-Erdogan meeting
]
DEV_CONTROLS = [('DE-FR', '2021-06-30'), ('ES-PT', '2022-06-30')]

RESERVED_CHECKS = [
    ('AZ-RU', '2025-07-31', -1),   # June-July 2025: raids in Yekaterinburg, Azerbaijani deaths, Baku suspends cultural events
    ('AZ-RU', '2025-12-31', +1),   # Putin's apology (October 2025), recovery of contacts
    ('DZ-FR', '2024-09-30', -1),   # July 2024: Macron backs Morocco's Western Sahara plan, Algeria recalls its ambassador
    ('AF-PK', '2025-11-30', -1),   # October 2025 border clashes
    ('KH-TH', '2025-08-31', -1),   # July 2025 border war
    ('IN-PK', '2025-06-30', -1),   # May 2025 military conflict
    ('IL-IR', '2025-07-31', -1),   # June 2025 twelve-day war
]
RESERVED_CONTROLS = [('DE-FR', '2025-06-30'), ('ES-PT', '2025-06-30')]
