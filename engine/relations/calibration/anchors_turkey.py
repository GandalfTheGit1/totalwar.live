"""RESERVED episode #5 (round 5): Israel - Turkey 2018-2024. Chosen by name in protocol_embassy.py before reading; anchors frozen BEFORE any fact is extracted, labelled or scored.
The model (embassy state adopted by the rule of protocol_embassy.py) is frozen by code_freeze.sha256 (2026-10-18T14:23:50Z). Nothing is changed in response to these results.

Sources (en.wikipedia, fetched 2026-10-18): 'Israel–Turkey relations' rev 1378778169; "Eitan Na'eh" rev 1365717266 (needed because the relations article does not mention the 2018 expulsion).
Documented dates: 2016-12 ambassadors back after the 2016 reconciliation; 2017-12 Erdogan threatens to break off ties over Jerusalem; 2018-05 Turkey's foreign ministry expels Israel's ambassador Na'eh
(filmed security check, Israeli protest); 2019-12 Turkish navy drives out an Israeli research vessel, Israel calls the Turkey-Libya maritime deal illegal; 2020-08 Mossad chief names Turkey a threat, Turkey hosts
Hamas leaders; 2021-05 Erdogan calls Israel a terror state; 2022-03 Herzog visits Turkey and meets Erdogan; 2022-08-17 decision to restore full diplomatic ties and return ambassadors; 2022-09 Lapid-Erdogan
meeting at the UN (first in 14 years); 2023-02 Israeli earthquake aid; 2023-10-28 Israel withdraws its diplomats; 2023-11 Erdogan: 'terrorist state', genocide; 2024-03-22 Turkey's envoy summoned;
2024-05 Turkey stops all trade and joins the ICJ case; 2024-07 Erdogan compares Netanyahu to Hitler; 2024-11-13 Turkey severs all diplomatic relations.

Anchor kinds as in anchors.py. Weight 0.5 = judgement beyond the sources ('J').
KNOWN RISKS written down in advance (not fixed): (1) Turkey's own 2018 recall is not in the sources, so only the Israeli side can be ABSENT in 2018-2022 from events (the Turkish side depends on Wikidata);
(2) the 2022-08-17 restoration is a decision ('will return ambassadors'): if it is coded DECLARED, no restoration event exists and the Israeli side stays ABSENT until a Wikidata holder appears;
(3) the 2023-2024 anchors test the rest of the model (rhetoric, trade cut, severed relations), not only the embassy state; (4) the static baseline (trade, memberships) is positive.
"""

ANCHORS = [
    ('ILTR', 'band',  'IL-TR', '2018-03-01', -40, 30, 1.0, 'renormalised since 2016 but strained (Dec 2017 threat to break ties)'),
    ('ILTR', 'band',  'IL-TR', '2018-06-30', -100, -20, 1.0, 'Israeli ambassador expelled with a filmed security check'),
    ('ILTR', 'le',    'IL-TR', '2018-03-01', '2018-06-30', -15, 1.0, 'the May 2018 expulsion'),
    ('ILTR', 'band',  'IL-TR', '2020-12-31', -110, -15, 1.0, 'no Israeli ambassador for 2.5 years; navy incident, Hamas hosted, Mossad names Turkey a threat'),
    ('ILTR', 'band',  'IL-TR', '2021-12-31', -110, -15, 1.0, 'still no ambassador; "terror state" rhetoric in 2021'),
    ('ILTR', 'lt',    'IL-TR', '2021-12-31', '2018-06-30', 30, 0.5, 'J: no big recovery while the ambassador is absent'),
    ('ILTR', 'trend', 'IL-TR', '2021-09-10', 'STABLE', None, 1.0, 'frozen: no ambassador, no thaw yet'),
    ('ILTR', 'ge',    'IL-TR', '2022-02-15', '2022-10-15', 25, 1.0, 'Herzog visit, decision to restore full ties and ambassadors, Lapid-Erdogan meeting'),
    ('ILTR', 'trend', 'IL-TR', '2022-08-31', 'IMPROVING', None, 1.0, 'after the 17 August restoration decision'),
    ('ILTR', 'band',  'IL-TR', '2022-12-31', -20, 60, 1.0, 'ties restored'),
    ('ILTR', 'le',    'IL-TR', '2023-09-30', '2023-12-31', -30, 1.0, 'Gaza war: Israel withdraws its diplomats, "terrorist state"'),
    ('ILTR', 'trend', 'IL-TR', '2023-11-15', 'DETERIORATING', None, 1.0, 'after the withdrawal and the November rhetoric'),
    ('ILTR', 'band',  'IL-TR', '2024-06-30', -130, -40, 1.0, 'all trade stopped, ICJ case, no Israeli diplomats'),
    ('ILTR', 'band',  'IL-TR', '2024-12-31', -170, -60, 1.0, 'Turkey severs all diplomatic relations'),
]
