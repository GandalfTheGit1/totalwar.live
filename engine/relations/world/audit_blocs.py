"""Bloc-membership validation cases, written and hashed (audit_blocs.sha256) BEFORE implementing membership status. Each case states whether a pair must or
must not carry a bloc-derived state. TRADE_ANY = FTA_IN_FORCE or PREFERENTIAL_TRADE. Situation as of 2026 per public membership lists.
Columns: pair (alphabetical), state, expected (True = must have it, False = must not), reason."""

CASES = [
    # Mercosur: members AR BR PY UY BO; Venezuela suspended since 2016; Mexico only an observer; associates with economic complementation agreements
    ('AR-BR', 'FTA_IN_FORCE', True, 'Mercosur members'),
    ('BO-BR', 'FTA_IN_FORCE', True, 'Bolivia full member since 2024'),
    ('PY-UY', 'FTA_IN_FORCE', True, 'Mercosur members'),
    ('AR-VE', 'FTA_IN_FORCE', False, 'Venezuela suspended from Mercosur since 2016'),
    ('BR-VE', 'FTA_IN_FORCE', False, 'Venezuela suspended from Mercosur since 2016'),
    ('MX-VE', 'FTA_IN_FORCE', False, 'neither is a Mercosur member'),
    ('AR-MX', 'FTA_IN_FORCE', False, 'Mexico is only an observer'),
    ('BR-MX', 'FTA_IN_FORCE', False, 'Mexico is only an observer'),
    ('AR-CL', 'TRADE_ANY', True, 'Chile-Mercosur ACE 35 (1996)'),
    ('BR-PE', 'TRADE_ANY', True, 'Peru-Mercosur ACE 58 (2005)'),
    ('AR-CO', 'TRADE_ANY', True, 'Colombia-Mercosur ACE 72 (2017)'),
    ('BR-EC', 'TRADE_ANY', True, 'Ecuador-Mercosur ACE 59 (2005)'),
    # Eurasian Economic Union: members RU BY KZ KG AM; Uzbekistan an observer
    ('BY-RU', 'FTA_IN_FORCE', True, 'EAEU members'),
    ('KZ-RU', 'FTA_IN_FORCE', True, 'EAEU members'),
    ('KG-KZ', 'FTA_IN_FORCE', True, 'EAEU members'),
    ('AM-RU', 'FTA_IN_FORCE', True, 'EAEU members (Armenia still in the EAEU)'),
    ('RU-UZ', 'FTA_IN_FORCE', False, 'Uzbekistan is an EAEU observer'),
    # Gulf Cooperation Council: SA AE KW QA BH OM
    ('AE-SA', 'PREFERENTIAL_TRADE', True, 'GCC members'),
    ('KW-QA', 'PREFERENTIAL_TRADE', True, 'GCC members'),
    ('BH-OM', 'PREFERENTIAL_TRADE', True, 'GCC members'),
    ('QA-SA', 'PREFERENTIAL_TRADE', True, 'GCC members'),
    # CELAC: 33 Latin American and Caribbean states
    ('BO-CU', 'SHARED_FORUM', True, 'CELAC members'),
    ('GT-HN', 'SHARED_FORUM', True, 'CELAC members'),
    ('JM-TT', 'SHARED_FORUM', True, 'CELAC members'),
    # African Union suspensions (Mali, Burkina Faso, Niger, Sudan, Madagascar) and AfCFTA
    ('BF-ZA', 'SHARED_FORUM', False, 'Burkina Faso suspended from the AU; no other shared forum'),
    ('NE-ZA', 'SHARED_FORUM', False, 'Niger suspended from the AU; no other shared forum'),
    ('KE-ZA', 'SHARED_FORUM', True, 'AU members in good standing'),
    ('NG-ZA', 'FTA_IN_FORCE', False, 'AfCFTA is not yet a working free-trade area'),
    ('NG-ZA', 'PREFERENTIAL_TRADE', True, 'AfCFTA as preferential trade'),
    ('ER-ET', 'TRADE_ANY', False, 'Eritrea has not signed the AfCFTA'),
    # SCO: Belarus member since 2024
    ('BY-CN', 'SHARED_FORUM', True, 'SCO members since July 2024'),
]
