"""RESERVED episode #4 (round 4): Canada – Saudi Arabia 2018–2023. Frozen BEFORE any fact of this episode is extracted, labelled or scored.

Why this episode: it was not used to develop or to validate anything so far, and it exercises exactly what the magnitude calibration is about: a rupture (ambassador expelled, envoy recalled)
that came together with a freeze of all new trade/investment, ended flights, scholarships and medical programmes, which stayed in force for ~4.7 years with almost no reported events and was
closed by one general act (restoration of diplomatic ties, May 2023).
Source (en.wikipedia, fetched 2026-10-18): 'Canada–Saudi Arabia relations' rev 1347094626.
Documented dates: 2018-08-02 Freeland's tweet on the Badawi arrests; 2018-08-05 Saudi Arabia expels Canada's ambassador (given 24 h), recalls its own envoy, freezes all new trade and investment;
2018-08-08 Saudi medical programmes halted, Canadian assets sold; 2018-08-13 Saudia flights to Toronto end; scholarship students ordered out by 2018-08-31; 2018-08-27 medical residents allowed to stay;
2018-08-08 foreign minister al-Jubeir: no negotiation until Canada retracts; 'in May 2023 Canada and Saudi Arabia restored their diplomatic ties' (day not given: the 15th is used by the scorer).

Anchor kinds as in anchors.py. Weight 0.5 = judgement beyond the sources ('J').
KNOWN RISKS written down in advance (not fixed): (1) the article is silent on 2019-2022, so persistence rests entirely on the standing states derived from the 2018 facts (absent ambassadors, measures in force);
(2) the lifting of the trade freeze is not dated separately: the model has to treat the May 2023 restoration as a general lifting; (3) the article gives only the month for the restoration;
(4) the static baseline (both in the G20, large trade, arms deal) is positive and may keep R above the lower bounds.
"""

ANCHORS = [
    ('CASA', 'band',  'CA-SA', '2018-07-15', 0, 70, 1.0, 'cordial relations, large trade, C$15bn arms deal, 16,000 Saudi students'),
    ('CASA', 'band',  'CA-SA', '2018-09-15', -110, -25, 1.0, 'ambassador expelled, envoy recalled, all new trade frozen, flights ended, students ordered out'),
    ('CASA', 'le',    'CA-SA', '2018-07-15', '2018-09-15', -40, 1.0, 'the August 2018 collapse'),
    ('CASA', 'band',  'CA-SA', '2019-06-30', -110, -20, 1.0, 'no ambassadors, new-trade freeze still in force, no negotiation'),
    ('CASA', 'lt',    'CA-SA', '2019-06-30', '2018-09-15', 30, 0.5, 'J: no big recovery without a lifting act'),
    ('CASA', 'band',  'CA-SA', '2021-12-31', -110, -15, 1.0, 'more than three years on: no ambassadors, freeze in force'),
    ('CASA', 'lt',    'CA-SA', '2021-12-31', '2018-09-15', 35, 0.5, 'J: idem'),
    ('CASA', 'ge',    'CA-SA', '2023-04-15', '2023-07-15', 30, 1.0, 'diplomatic ties restored in May 2023'),
    ('CASA', 'band',  'CA-SA', '2023-12-31', 0, 80, 1.0, 'relations restored'),
    ('CASA', 'trend', 'CA-SA', '2018-08-20', 'DETERIORATING', None, 1.0, 'two weeks after the expulsion and the trade freeze'),
    ('CASA', 'trend', 'CA-SA', '2019-09-10', 'STABLE', None, 1.0, 'frozen: decaying old events must not read as improvement'),
    ('CASA', 'trend', 'CA-SA', '2021-09-10', 'STABLE', None, 1.0, 'idem'),
    ('CASA', 'trend', 'CA-SA', '2023-06-10', 'IMPROVING', None, 1.0, 'after the May 2023 restoration'),
]
