"""HELD-OUT episode #2: Saudi Arabia – Qatar 2017–2022. Frozen BEFORE any fact of this episode is extracted, labelled or scored.

The model (catalog, standing measures, reset rule, verification step, parameters) is frozen by code_freeze.sha256 (2026-10-18T12:24Z) and was fixed before this episode was read.
Nothing may be changed in response to these results. Australia–China was a development case for the standing-measures mechanism, so it cannot validate it; this episode can.

Sources (en.wikipedia, fetched 2026-10-18): 'Qatar–Saudi Arabia diplomatic conflict' rev 1374697392; 'Qatar–Saudi Arabia relations' rev 1361502684.
Documented dates: 2014-03 Saudi Arabia, UAE and Bahrain recall their ambassadors from Qatar (defused ~8 months later); 2017-06-05 Saudi Arabia cuts ties with Qatar and blocks its airspace, sea routes and
the only land crossing; 2017-06 thirteen demands, rejected; blockade "remains until Qatar changes its policies"; 2019-11 Saudi Arabia announces it will take part in the Gulf Cup in Doha ("a thaw");
2021-01-05 Al-Ula: Saudi Arabia, UAE, Bahrain and Egypt agree to restore full relations and end the three-and-a-half-year blockade, Saudi reopens airspace and maritime borders;
2021-01-16 Saudi Arabia announces it will reopen its embassy in Qatar; 2021-12-08 Crown Prince Mohammed bin Salman visits Doha, his first visit since 2017.

Anchor kinds as in anchors.py. Weight 0.5 = judgement beyond the sources ('J').
KNOWN RISKS written down in advance (not fixed): (1) the reset rule only looks 730 days back, but Al-Ula came 3.5 years after the rupture, so it will not count as a reset;
(2) the static baseline of shared memberships (GCC, Arab League) and trade is positive and may keep R from going as low as the lower bounds; (3) pairing the blockade with the general
Al-Ula agreement depends on the model recognising a general lifting.
"""

ANCHORS = [
    ('QASA', 'band',  'SA-QA', '2017-05-01', -5, 70, 1.0, 'tense since the 2014 rift but ordinary relations inside the GCC'),
    ('QASA', 'band',  'SA-QA', '2017-06-30', -130, -50, 1.0, 'relations cut, airspace/sea/land blockade, 13 demands: "akin to a bloodless declaration of war"'),
    ('QASA', 'le',    'SA-QA', '2017-05-01', '2017-06-30', -60, 1.0, 'the June 2017 collapse'),
    ('QASA', 'band',  'SA-QA', '2018-06-30', -130, -40, 1.0, 'blockade and severed relations in force'),
    ('QASA', 'band',  'SA-QA', '2019-06-30', -130, -35, 1.0, 'still blockaded two years on'),
    ('QASA', 'lt',    'SA-QA', '2019-06-30', '2017-06-30', 30, 0.5, 'J: no big recovery while the blockade stands'),
    ('QASA', 'band',  'SA-QA', '2020-06-30', -130, -25, 1.0, 'blockade still in force (Gulf Cup thaw signal came in Nov 2019)'),
    ('QASA', 'ge',    'SA-QA', '2020-12-15', '2021-03-15', 50, 1.0, 'Al-Ula agreement, blockade ended, embassy reopening'),
    ('QASA', 'band',  'SA-QA', '2021-03-15', -30, 60, 1.0, 'relations restored but recent'),
    ('QASA', 'band',  'SA-QA', '2022-03-01', 5, 90, 1.0, 'normalised, crown prince visited Doha in Dec 2021'),
    ('QASA', 'trend', 'SA-QA', '2017-06-20', 'DETERIORATING', None, 1.0, 'two weeks after the rupture'),
    ('QASA', 'trend', 'SA-QA', '2021-01-20', 'IMPROVING', None, 1.0, 'after Al-Ula and the embassy announcement'),
    ('QASA', 'trend', 'SA-QA', '2018-09-10', 'STABLE', None, 1.0, 'a frozen blockade is not a deteriorating or improving trend'),
    ('QASA', 'trend', 'SA-QA', '2019-09-10', 'STABLE', None, 1.0, 'idem; the decay of old events must not read as improvement'),
]
