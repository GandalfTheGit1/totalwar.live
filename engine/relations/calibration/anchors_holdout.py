"""HELD-OUT episode: Australia–China 2020–2024. Frozen BEFORE extracting facts, labelling or scoring anything.

The model (catalog, reset rule, parameters) was fixed before this episode was looked at. Nothing may be changed in response to these results; failures are
reported as failures and any change is a separate, labelled follow-up that would need a new held-out episode.

Sources (en.wikipedia, fetched 2026-10-18): 'Australia–China trade war' rev 1380731016; 'Australia–China relations' rev 1373534972.
Documented dates used: 2020-04 Payne's call for a COVID inquiry, Chinese ambassador's boycott warning; 2020-05-11 beef suspended; 2020-05-18 80.5 % barley tariff; 2020-08-18 wine probe;
2020-11-02 lobsters/timber; 2020-11-17 "14 grievances"; 2020-11-25 coal; 2020-11-27 206 % wine tariff; 2020-11-30 Zhao Lijian image; 2021-09-16 AUKUS; mid-2022-06 first defence-minister
meeting in almost three years; 2022-11 Albanese–Xi at the Bali G20; 2022-12 Wong in Beijing; 2023-02-08 coal resumed; 2023-04-11 barley deal; 2023-05 Farrell in Beijing, timber resumed (05-18);
2023-08-04 barley tariff dropped; 2023-10-11 Cheng Lei released; 2023-11-04/07 Albanese in Shanghai and Beijing; 2023-12-12 meat resumed; 2024-03-28 wine tariff dropped; 2024-05-29 meat; 2024-12-20 lobsters.

Anchor kinds as in anchors.py. Weight 0.5 = judgement beyond the sources ('J').
KNOWN RISKS written down in advance (not fixed): (1) China's coercion was one-sided, and derived TRADE_WAR requires coercion by both sides or a joint act, so no standing trade-war state will appear;
(2) the reset rule only recognises diplomatic ruptures, not economic coercion, so the Bali meeting will not be treated as a reset. Both predict a failure of the 2021 persistence anchors and of the
2022-23 recovery anchor.
"""

ANCHORS = [
    ('AUCN', 'band',  'AU-CN', '2020-03-15', 0, 70, 1.0, 'strained since 2018 but ordinary relations under ChAFTA'),
    ('AUCN', 'band',  'AU-CN', '2020-09-15', -100, -15, 1.0, 'COVID-inquiry row, beef and barley measures, wine probe'),
    ('AUCN', 'le',    'AU-CN', '2020-03-15', '2020-12-31', -45, 1.0, 'the 2020 slide'),
    ('AUCN', 'band',  'AU-CN', '2020-12-31', -110, -40, 1.0, 'coal, lobster, timber bans; 206 % wine tariff; 14 grievances; Zhao image'),
    ('AUCN', 'band',  'AU-CN', '2021-12-31', -110, -30, 1.0, 'AUKUS; bans still in force; no leader or ministerial contact'),
    ('AUCN', 'lt',    'AU-CN', '2021-12-31', '2020-12-31', 20, 0.5, 'J: no big recovery without engagement'),
    ('AUCN', 'band',  'AU-CN', '2022-06-30', -110, -15, 1.0, 'first defence-minister meeting in ~3 years, but bans persist'),
    ('AUCN', 'ge',    'AU-CN', '2022-05-15', '2023-02-28', 25, 1.0, 'Albanese government, Bali meeting, Wong in Beijing, coal resumed'),
    ('AUCN', 'band',  'AU-CN', '2023-12-31', -10, 90, 1.0, 'Albanese in Beijing, Cheng Lei freed, barley/timber/coal restored'),
    ('AUCN', 'ge',    'AU-CN', '2021-12-31', '2023-12-31', 45, 1.0, 'net thaw'),
    ('AUCN', 'band',  'AU-CN', '2024-12-31', 5, 90, 1.0, 'wine tariff dropped, meat and lobsters resumed'),
    ('AUCN', 'trend', 'AU-CN', '2020-06-10', 'DETERIORATING', None, 1.0, 'after beef and barley measures'),
    ('AUCN', 'trend', 'AU-CN', '2020-12-10', 'DETERIORATING', None, 1.0, 'after coal, lobsters, wine tariff, 14 grievances'),
    ('AUCN', 'trend', 'AU-CN', '2022-12-31', 'IMPROVING', None, 1.0, 'after Bali and Wong\'s visit'),
]
