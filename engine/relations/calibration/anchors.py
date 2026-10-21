"""Calibration protocol, FROZEN before any historical fact was extracted or scored.

WHAT THIS IS: face-validity calibration. The anchors are ordinal expectations (band, size of a drop/recovery, trend) that I derive from the DOCUMENTED
chronology of two episodes. The events and dates come from the Wikipedia revisions listed below; the expected MAGNITUDES are my judgement. They are
therefore not independent ground truth: a score trajectory that satisfies them is "consistent with my reading of the history", nothing more.

Sources (en.wikipedia, fetched 2026-10-18): '2021 Morocco–Spain border incident' rev 1376169580; 'Morocco–Spain relations' rev 1379412211;
'2023–25 Canada–India diplomatic row' rev 1378175781; 'Canada–India relations' rev 1373086666.

Documented dates used to place anchors
  ES-MA: 2020-12-21 Spain summons Morocco's ambassador over Ceuta/Melilla remarks; 2021-04-22 Ghali hospitalised in Spain; 2021-04-30 Morocco grants Puigdemont asylum;
         2021-05-17 ~8,000 cross into Ceuta; 2021-05-18 Morocco recalls its ambassador; 2022-03-14 Sánchez letter backing the autonomy plan; 2022-04-07 Sánchez in Rabat
         "for improved diplomatic relations"; 2023-02 Rabat summit, agreements and credit lines of up to EUR 800 M.
  IN-CA: 2023-03 India summons Canada's High Commissioner; 2023-06 Nijjar killed; 2023-09-18/19 reciprocal expulsions after Trudeau's accusation; 2023-09-21 India suspends visas
         for Canadians; 2023-10-18 41 Canadian diplomats leave India; 2024-06 brief Modi–Trudeau meeting at G7; 2024-10-12/14 Canada names the Indian High Commissioner a person of
         interest, notices of expulsion, tit-for-tat expulsion of six Canadian diplomats; 2024-10-29 Amit Shah allegation; 2025-06-17 Carney–Modi meeting at the G7, plan to revive
         trade talks; 2025-08 new envoys appointed; 2025-09 Bishnoi gang listed as terrorist entity; 2026-early Carney state visit, MOUs.

Anchor kinds:  band(pair,date,lo,hi): R(date) in [lo,hi]   ge/le(pair,d1,d2,x): R(d2)-R(d1) >= x / <= x   lt(pair,d1,d2,tol): R(d1) <= R(d2)+tol   trend(pair,date,label)
Weight 1.0 = documented event + judgement on size; 0.5 = judgement that goes beyond what the sources say (marked 'J').

Loss = sum over anchors of weight x (violation in score points, 0 if satisfied; trend: 20 points if wrong).  Violations are also counted.
Parameter grid (global, 4 knobs; NOT per-event points, there are too few anchors for that):
  dynScale (all event base points x)   in {0.6, 0.8, 1.0, 1.25, 1.5, 2.0}
  hlScale  (all half-lives x)          in {0.5, 0.75, 1.0, 1.5, 2.0}
  kDyn     (tanh saturation of S_dyn)  in {40, 60, 90}
  declared (multiplier for announced/DECLARED acts) in {0.25, 0.4, 0.6}
Selection rule: leave-one-episode-out. Fit on one episode, report the loss on the other. Among combinations within 5 % of the best training loss pick the one closest to the
current defaults (parsimony). Adopt a change only if it also improves the HELD-OUT episode relative to the defaults.
"""

ANCHORS = [
    # ── Spain–Morocco 2020–2023 ───────────────────────────────────────────────
    ('ESMA', 'band',  'ES-MA', '2020-11-15', 0, 80, 1.0, 'normal cooperative relations before the Dec 2020 spat'),
    ('ESMA', 'ge',    'ES-MA', '2020-11-15', '2021-01-15', -20, 1.0, 'summons over Ceuta/Melilla remarks is a spat, not a crisis'),
    ('ESMA', 'le',    'ES-MA', '2020-11-15', '2021-01-15', 5, 1.0, 'and it does not improve the relationship'),
    ('ESMA', 'band',  'ES-MA', '2021-06-15', -100, -20, 1.0, 'Ghali + Puigdemont asylum + Ceuta crossing + ambassador recalled'),
    ('ESMA', 'le',    'ES-MA', '2021-04-10', '2021-06-15', -35, 1.0, 'acute drop in two months'),
    ('ESMA', 'band',  'ES-MA', '2021-12-15', -100, -10, 0.5, 'J: crisis still unresolved (reset only in Mar-Apr 2022)'),
    ('ESMA', 'lt',    'ES-MA', '2021-12-15', '2021-06-15', 25, 0.5, 'J: no big spontaneous recovery without a reconciliation event'),
    ('ESMA', 'ge',    'ES-MA', '2022-02-15', '2022-05-15', 25, 1.0, 'Mar 2022 letter + Apr 2022 Rabat visit'),
    ('ESMA', 'band',  'ES-MA', '2022-05-15', -10, 80, 1.0, 'relations back to normal or better'),
    ('ESMA', 'band',  'ES-MA', '2023-03-01', 10, 90, 1.0, 'Feb 2023 Rabat summit, EUR 800 M credit lines'),
    ('ESMA', 'trend', 'ES-MA', '2021-06-10', 'DETERIORATING', None, 1.0, '3 weeks after the crossing'),
    ('ESMA', 'trend', 'ES-MA', '2022-04-20', 'IMPROVING', None, 1.0, 'after the letter and the visit'),
    # ── India–Canada 2023–2026 ────────────────────────────────────────────────
    ('INCA', 'band',  'IN-CA', '2023-05-15', 0, 70, 1.0, 'before Nijjar: tense on Khalistan but ordinary relations and trade talks'),
    ('INCA', 'band',  'IN-CA', '2023-08-15', -5, 70, 1.0, 'killing not yet publicly attributed'),
    ('INCA', 'band',  'IN-CA', '2023-11-15', -110, -25, 1.0, 'expulsions, visas suspended, 41 diplomats out'),
    ('INCA', 'le',    'IN-CA', '2023-08-15', '2023-11-15', -40, 1.0, 'Sept-Oct 2023 collapse'),
    ('INCA', 'band',  'IN-CA', '2024-06-15', -60, 5, 0.5, 'J: still strained although dialogue resumes briefly at the G7'),
    ('INCA', 'band',  'IN-CA', '2024-11-15', -110, -35, 1.0, 'High Commissioner expelled/withdrawn, six diplomats each, Shah allegation'),
    ('INCA', 'le',    'IN-CA', '2024-06-15', '2024-11-15', -15, 1.0, 'renewed deterioration in Oct 2024'),
    ('INCA', 'lt',    'IN-CA', '2024-11-15', '2023-11-15', 5, 1.0, 'Oct 2024 is at least as bad as the first trough'),
    ('INCA', 'band',  'IN-CA', '2025-02-15', -110, -15, 1.0, 'no reconciliation yet; envoys only appointed in Aug 2025'),
    ('INCA', 'ge',    'IN-CA', '2025-02-15', '2025-07-15', 15, 1.0, '17 Jun 2025 Carney-Modi meeting, plan to revive trade talks'),
    ('INCA', 'band',  'IN-CA', '2025-12-15', -10, 80, 1.0, 'envoys back, trade talks relaunched (Bishnoi listing is a counter-current)'),
    ('INCA', 'ge',    'IN-CA', '2025-02-15', '2025-12-15', 25, 1.0, 'net recovery over 2025'),
    ('INCA', 'band',  'IN-CA', '2026-04-15', 5, 90, 1.0, 'Carney state visit with MOUs'),
    ('INCA', 'trend', 'IN-CA', '2023-10-05', 'DETERIORATING', None, 1.0, 'two weeks after the expulsions'),
    ('INCA', 'trend', 'IN-CA', '2024-11-05', 'DETERIORATING', None, 1.0, 'after the Oct 2024 expulsions'),
    ('INCA', 'trend', 'IN-CA', '2025-07-10', 'IMPROVING', None, 1.0, 'after the G7 meeting'),
]

GRID = dict(dynScale=[0.6, 0.8, 1.0, 1.25, 1.5, 2.0], hlScale=[0.5, 0.75, 1.0, 1.5, 2.0], kDyn=[40, 60, 90], declared=[0.25, 0.4, 0.6])
DEFAULTS = dict(dynScale=1.0, hlScale=1.0, kDyn=60, declared=0.4)
