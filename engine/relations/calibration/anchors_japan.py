"""HELD-OUT episode #3: Japan – South Korea 2019–2023 (export controls and their lifting). Frozen BEFORE any fact of this episode is extracted, labelled or scored.

Why this episode: the Saudi–Qatar episode did not exercise the standing-measures mechanism (the extraction merged the blockade and the rupture into one fact, so no measure was ever coded). Here the measures are
separate, explicit, long-lived (July 2019 – March 2023) and ended by a documented act, which is exactly what the mechanism is for.

Model frozen by code_freeze.sha256 (2026-10-18T12:24Z); nothing is changed in response to these results. Countries are registered at run time (no model file is edited).
Source (en.wikipedia, fetched 2026-10-18): 'Japan–South Korea trade dispute' rev 1371615276.
Documented dates: 2019-07-01/04 Japan's METI applies licensing requirements to exports of three materials to South Korea; 2019-08-02 Japan's cabinet removes South Korea from the "whitelist" (effective 08-28);
2019-08-22 South Korea gives notice to terminate GSOMIA; 2019-09-11 South Korea announces a WTO complaint; 2019-10-24 and 11-04 first leader-level contacts; 2019-11-19 WTO consultations fail;
2020-06 South Korea resumes the WTO process; 2020-11 Suga–Moon phone call agreeing to improve ties; 2023-03-16 Yoon visits Japan (first South Korean leader in 12 years); 2023-03-21 South Korea restores Japan to its
whitelist and normalises GSOMIA; 2023-03-23 Japan restores South Korea to its whitelist and South Korea withdraws the WTO complaint, "effectively ending the trade dispute".

Anchor kinds as in anchors.py. Weight 0.5 = judgement beyond the sources ('J').
KNOWN RISKS written down in advance (not fixed): (1) the pre-dispute level depends only on the static baseline (the window starts in 2019); (2) the reset rule only recognises diplomatic ruptures, so Yoon's visit is
valued as an ordinary state visit; (3) the lifting acts (whitelist restoration, WTO withdrawal) must be recognised by the pairing step as ending the 2019 measures; (4) Japan's measures are licensing requirements,
which a classifier may code as EXPORT_CONTROLS or as TRADE_RESTRICTION (both are measures).
"""

ANCHORS = [
    ('JPKR', 'band',  'JP-KR', '2019-06-15', -25, 60, 1.0, 'strained (forced-labour rulings, comfort women) but ordinary relations and trade'),
    ('JPKR', 'band',  'JP-KR', '2019-09-15', -110, -20, 1.0, 'export controls, whitelist removal, GSOMIA termination notice, WTO complaint: lowest point in decades'),
    ('JPKR', 'le',    'JP-KR', '2019-06-15', '2019-09-15', -35, 1.0, 'the summer-2019 collapse'),
    ('JPKR', 'band',  'JP-KR', '2020-12-31', -100, -10, 1.0, 'measures still in force; Suga-Moon call only agrees to try'),
    ('JPKR', 'band',  'JP-KR', '2021-12-31', -100, -5, 1.0, 'measures still in force more than two years on'),
    ('JPKR', 'lt',    'JP-KR', '2021-12-31', '2019-09-15', 30, 0.5, 'J: no big recovery while the measures stand'),
    ('JPKR', 'ge',    'JP-KR', '2022-12-31', '2023-06-30', 30, 1.0, 'Yoon visit, whitelists restored both ways, WTO complaint withdrawn'),
    ('JPKR', 'band',  'JP-KR', '2023-06-30', 10, 90, 1.0, 'dispute over'),
    ('JPKR', 'band',  'JP-KR', '2023-12-31', 5, 90, 1.0, 'normalised'),
    ('JPKR', 'trend', 'JP-KR', '2019-08-10', 'DETERIORATING', None, 1.0, 'after the July curbs and the 2 August whitelist decision'),
    ('JPKR', 'trend', 'JP-KR', '2020-09-10', 'STABLE', None, 1.0, 'frozen dispute: decaying old events must not read as improvement'),
    ('JPKR', 'trend', 'JP-KR', '2021-09-10', 'STABLE', None, 1.0, 'idem'),
    ('JPKR', 'trend', 'JP-KR', '2023-03-30', 'IMPROVING', None, 1.0, 'after the March 2023 summit and the lifting acts'),
]
