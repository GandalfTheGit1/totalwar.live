"""Protocol: propose the recorded position of important pairs from the open web (Tavily) with two independent models. FROZEN by hash (protocol_web_positions.sha256)
BEFORE any search or model call of this task. Nothing here is changed after the controls are scored: if they fail, the 300 pairs are NOT filled and the failure is reported.

WHAT IT PRODUCES  A PROPOSAL for the worklist (one row per accepted pair-code, source = url + literal quote). It does not enter the engine: model/reviewed_facts.json is only
                  written by ingest_reviewed.py after a person reviews the rows.

PER PAIR
  1. Three Tavily searches (topic 'general', advanced depth, 6 results each) with the English country names:
       ALLIANCE      '{A} {B} defense treaty OR strategic partnership OR alliance agreement'
       TRADE         '{A} {B} free trade agreement OR preferential trade agreement in force'
       FRICTION      '{A} {B} sanctions OR territorial dispute OR conflict OR severed diplomatic relations'
     Snippets: unique URLs, blocked domains dropped (flow.blocked), at most 14, 700 characters each. A snippet is usable only if its text names BOTH countries
     (English name or one of the aliases in ALIASES).
  2. Two models read the same snippets independently, each answers JSON {"findings": [{"code", "snippet", "quote", "since"}]}:
       model A  Gemini 2.5 Flash  (fallback Cohere command-a-03-2025)
       model B  Groq Qwen3.8-27B  (fallback Cohere command-a-03-2025)
     A pair-code is ACCEPTED only if (a) both models report that code, (b) each cites a snippet and a quote copied literally from it (>= 12 characters, normalised comparison),
     (c) each quote matches the keyword rule of the code (CODE_RULES) and none of the status words in REJECT_WORDS, (d) the two answers come from different model families.
     `since` is kept only when a YYYY or YYYY-MM date is inside the accepted quotes; otherwise empty.
  3. Nothing found, disagreement, or a failed check -> the row stays EMPTY. The pipeline never guesses.

ALLOWED CODES (closed list, all in the engine catalogue scoring.STATES)
  DEFENSE_ALLIANCE, STRATEGIC_PARTNERSHIP, FTA_IN_FORCE, PREFERENTIAL_TRADE, SANCTIONS_REGIME_TARGETED, TERRITORIAL_DISPUTE_ACTIVE, ARMED_CONFLICT, OCCUPATION, NO_RELATIONS
  (STRATEGIC_RIVALRY and PROXY_HOSTILITY are NOT allowed: they need an official doctrine or a judgement that a news snippet cannot give.)

CONTROLS (scored once, with the pipeline exactly as frozen; the existing engine states of these pairs are ignored)
  POSITIVES  18 pairs whose expected code must be among the accepted codes.        PASS: >= 12 of 18
  NEGATIVES  12 (pair, code) checks that must NOT be accepted (a news alliance is not a treaty; a partnership is not a free-trade agreement).
             PASS: >= 11 of 12 correctly absent AND none of the 6 DEFENSE_ALLIANCE negatives accepted
  GUARDS     every accepted finding in the control set passes the literal-quote check (100 % by construction, verified), and every accepted finding that is neither an expected
             code nor in the negatives is listed and judged by the author against public knowledge; PASS: >= 90 % of those judged correct.
  If any condition fails the worklist is not filled. The controls are not rerun with a modified pipeline: a different design needs a new protocol.

COST NOTE  Tavily 'advanced' costs 2 credits per search: about 2 x 3 x (30 + 300) = 1,980 credits for the whole task; every call goes through the key-rotation registry.
LIMITS written in advance: English-language web bias, recall below 100 % by design (the filters prefer silence to a wrong row), news snippets can be stale, and an accepted row is a
proposal that still needs a person's review.
"""
CODES = ['DEFENSE_ALLIANCE', 'STRATEGIC_PARTNERSHIP', 'FTA_IN_FORCE', 'PREFERENTIAL_TRADE', 'SANCTIONS_REGIME_TARGETED', 'TERRITORIAL_DISPUTE_ACTIVE', 'ARMED_CONFLICT', 'OCCUPATION', 'NO_RELATIONS']
CODE_DEFINITIONS = {
    'DEFENSE_ALLIANCE': 'a bilateral or multilateral treaty of mutual defence or mutual assistance in force between the two states (not just close military cooperation, not "alliance" as a figure of speech)',
    'STRATEGIC_PARTNERSHIP': 'a formally declared strategic partnership (strategic, comprehensive, special or global strategic partnership) between the two states',
    'FTA_IN_FORCE': 'a free-trade agreement in force that covers both states (bilateral or through a trade bloc they are both parties of)',
    'PREFERENTIAL_TRADE': 'a preferential trade or economic partnership agreement in force that is not a full free-trade area',
    'SANCTIONS_REGIME_TARGETED': 'one of the two states has imposed sanctions on the other (asset freezes, travel bans, trade restrictions) that are in force',
    'TERRITORIAL_DISPUTE_ACTIVE': 'an active territorial or maritime dispute between the two states with recent incidents',
    'ARMED_CONFLICT': 'the two states are fighting each other now (armed conflict or war between them)',
    'OCCUPATION': 'one of the two states occupies territory that the other claims as its own',
    'NO_RELATIONS': 'the two states have no diplomatic relations (severed, suspended or never established)',
}
CODE_RULES = {   # regexes the QUOTE must match (case-insensitive)
    'DEFENSE_ALLIANCE': r'mutual defen[cs]e|collective defen[cs]e|defen[cs]e (treaty|pact|agreement)|security treaty|mutual (aid|assistance|cooperation and security)|treaty of (alliance|mutual)|mutual defen[cs]e treaty',
    'STRATEGIC_PARTNERSHIP': r'strategic partner|comprehensive (strategic )?partnership|special strategic|global strategic',
    'FTA_IN_FORCE': r'free[- ]trade (agreement|area|zone)|\bFTA\b|free trade',
    'PREFERENTIAL_TRADE': r'preferential|economic partnership agreement|economic complementation|trade agreement|trade pact',
    'SANCTIONS_REGIME_TARGETED': r'sanction|asset freez|travel ban|export ban|embargo',
    'TERRITORIAL_DISPUTE_ACTIVE': r'disput|claims?\b|clash|stand-?off|maritime|border|territor|sovereignty',
    'ARMED_CONFLICT': r'\bwar\b|armed conflict|invasion|invaded|fighting|military strikes?|air ?strikes?|clashes',
    'OCCUPATION': r'occup(y|ies|ied|ation)',
    'NO_RELATIONS': r'sever(ed)?|cut (off )?(diplomatic )?(ties|relations)|broke (off )?(diplomatic )?relations|no diplomatic relations|do(es)? not (have|maintain) diplomatic|cut diplomatic',
}
REJECT_WORDS = r'terminat|suspend|expired|withdr[ae]w|abrogat|under negotiation|negotiat|proposed|plans? to|\bwould\b|\bcould\b|\bmay\b|seek(s|ing)? to|lifted|ended|collapsed|former(ly)?'
QUERIES = {
    'ALLIANCE': '{A} {B} defense treaty OR strategic partnership OR alliance agreement',
    'TRADE': '{A} {B} free trade agreement OR preferential trade agreement in force',
    'FRICTION': '{A} {B} sanctions OR territorial dispute OR conflict OR severed diplomatic relations',
}
MAX_RESULTS, MAX_SNIPPETS, SNIPPET_CHARS, MIN_QUOTE = 6, 14, 700, 12
MODEL_A = [('gemini', 'gemini-2.5-flash'), ('cohere', 'command-a-03-2025')]
MODEL_B = [('groq', 'qwen/qwen3.8-27b'), ('cohere', 'command-a-03-2025')]
ALIASES = {   # words that count as naming the country, besides its English name
    'US': ['United States', 'U.S.', 'Washington', 'American', 'America'], 'GB': ['United Kingdom', 'Britain', 'British', 'U.K.', 'London'], 'RU': ['Russia', 'Russian', 'Moscow'],
    'CN': ['China', 'Chinese', 'Beijing'], 'IN': ['India', 'Indian', 'New Delhi'], 'JP': ['Japan', 'Japanese', 'Tokyo'], 'KR': ['South Korea', 'Korean', 'Seoul', 'Republic of Korea'],
    'KP': ['North Korea', 'DPRK', 'Pyongyang'], 'DE': ['Germany', 'German', 'Berlin'], 'FR': ['France', 'French', 'Paris'], 'IT': ['Italy', 'Italian', 'Rome'],
    'BR': ['Brazil', 'Brazilian', 'Brasilia', 'Brasília'], 'MX': ['Mexico', 'Mexican'], 'TR': ['Turkey', 'Türkiye', 'Turkiye', 'Turkish', 'Ankara'], 'IR': ['Iran', 'Iranian', 'Tehran'],
    'IL': ['Israel', 'Israeli'], 'SA': ['Saudi', 'Riyadh'], 'AE': ['United Arab Emirates', 'UAE', 'Emirati', 'Abu Dhabi'], 'PK': ['Pakistan', 'Pakistani', 'Islamabad'],
    'ID': ['Indonesia', 'Indonesian', 'Jakarta'], 'AU': ['Australia', 'Australian', 'Canberra'], 'NZ': ['New Zealand'], 'PH': ['Philippines', 'Philippine', 'Filipino', 'Manila'],
    'VN': ['Vietnam', 'Viet Nam', 'Vietnamese', 'Hanoi'], 'UA': ['Ukraine', 'Ukrainian', 'Kyiv', 'Kiev'], 'PL': ['Poland', 'Polish', 'Warsaw'], 'ES': ['Spain', 'Spanish', 'Madrid'],
    'EG': ['Egypt', 'Egyptian', 'Cairo'], 'NG': ['Nigeria', 'Nigerian', 'Abuja'], 'ZA': ['South Africa', 'Pretoria'], 'ET': ['Ethiopia', 'Ethiopian', 'Addis Ababa'],
    'CD': ['Congo', 'DRC', 'Kinshasa'], 'TH': ['Thailand', 'Thai', 'Bangkok'], 'MY': ['Malaysia', 'Malaysian', 'Kuala Lumpur'], 'BD': ['Bangladesh', 'Dhaka'], 'AR': ['Argentina', 'Argentine'],
    'CO': ['Colombia', 'Colombian', 'Bogota', 'Bogotá'], 'VE': ['Venezuela', 'Venezuelan', 'Caracas'], 'DZ': ['Algeria', 'Algerian', 'Algiers'], 'MA': ['Morocco', 'Moroccan', 'Rabat'],
    'CY': ['Cyprus', 'Cypriot'], 'TW': ['Taiwan', 'Taiwanese', 'Taipei'], 'CA': ['Canada', 'Canadian', 'Ottawa'], 'SG': ['Singapore', 'Singaporean'], 'KE': ['Kenya', 'Kenyan', 'Nairobi'],
    'TZ': ['Tanzania', 'Tanzanian'], 'UZ': ['Uzbekistan', 'Uzbek'], 'KZ': ['Kazakhstan', 'Kazakh'], 'IQ': ['Iraq', 'Iraqi', 'Baghdad'], 'SY': ['Syria', 'Syrian', 'Damascus'],
    'AF': ['Afghanistan', 'Afghan', 'Kabul'], 'MM': ['Myanmar', 'Burma', 'Burmese'], 'NL': ['Netherlands', 'Dutch'], 'CZ': ['Czech', 'Czechia'], 'GR': ['Greece', 'Greek', 'Athens'],
    'PT': ['Portugal', 'Portuguese', 'Lisbon'], 'SE': ['Sweden', 'Swedish'], 'CH': ['Switzerland', 'Swiss'], 'BE': ['Belgium', 'Belgian'], 'AT': ['Austria', 'Austrian'], 'GH': ['Ghana', 'Ghanaian'],
}

# (pair, expected code) -- pairs alphabetical
CONTROL_POSITIVES = [
    ('JP-US', 'DEFENSE_ALLIANCE'), ('KR-US', 'DEFENSE_ALLIANCE'), ('KP-RU', 'DEFENSE_ALLIANCE'), ('CN-KP', 'DEFENSE_ALLIANCE'), ('AU-US', 'DEFENSE_ALLIANCE'),
    ('AU-CN', 'FTA_IN_FORCE'), ('CN-NZ', 'FTA_IN_FORCE'), ('AU-JP', 'FTA_IN_FORCE'),
    ('CN-RU', 'STRATEGIC_PARTNERSHIP'), ('BR-CN', 'STRATEGIC_PARTNERSHIP'), ('IN-RU', 'STRATEGIC_PARTNERSHIP'), ('IN-US', 'STRATEGIC_PARTNERSHIP'),
    ('RU-UA', 'ARMED_CONFLICT'), ('IL-IR', 'ARMED_CONFLICT'), ('CY-TR', 'OCCUPATION'), ('AU-RU', 'SANCTIONS_REGIME_TARGETED'),
    ('CN-PH', 'TERRITORIAL_DISPUTE_ACTIVE'), ('DZ-MA', 'NO_RELATIONS'),
]
CONTROL_NEGATIVES = [   # (pair, code that must NOT be accepted)
    ('IN-US', 'DEFENSE_ALLIANCE'), ('CN-RU', 'DEFENSE_ALLIANCE'), ('CN-PK', 'DEFENSE_ALLIANCE'), ('BR-CN', 'DEFENSE_ALLIANCE'), ('IN-RU', 'DEFENSE_ALLIANCE'), ('IL-US', 'DEFENSE_ALLIANCE'),
    ('IN-US', 'FTA_IN_FORCE'), ('CN-US', 'FTA_IN_FORCE'), ('CN-IN', 'FTA_IN_FORCE'), ('IN-RU', 'FTA_IN_FORCE'), ('BR-CN', 'FTA_IN_FORCE'), ('BR-US', 'FTA_IN_FORCE'),
]
POSITIVES_NEEDED, NEGATIVES_NEEDED, GUARD_SHARE = 12, 11, 0.90
