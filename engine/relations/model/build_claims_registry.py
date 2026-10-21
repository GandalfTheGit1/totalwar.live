#!/usr/bin/env python3
"""Build engine/relations/model/territorial_claims.json with all reviewed claims,
exclusions, sources, third-party stances, and coverage mapping.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REG_PATH = os.path.join(HERE, 'territorial_claims.json')

CLAIMS = [
    # ─── SPAIN / EUROPE ──────────────────────────────────────────────────────────
    {
        "id": "gibraltar",
        "nameEs": "Gibraltar",
        "nameEn": "Gibraltar",
        "neId": 1159320719,
        "wikidata": "Q1410",
        "kind": "land",
        "administeredBy": "GB",
        "claimants": ["ES"],
        "status": "latent",
        "salience": "core",
        "since": "1713-07-13",
        "statusSince": "1713-07-13",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.un.org/dppa/decolonization/en/nsgt/gibraltar", "accessed": "2026-10-21", "note": "UN Special Committee on Decolonization: Gibraltar"},
            {"url": "https://www.lamoncloa.gob.es/espana/politica-exterior/espana-europa/gibraltar/Paginas/index.aspx", "accessed": "2026-10-21", "note": "Posición oficial de España sobre la soberanía de Gibraltar"}
        ],
        "notes": "Cedido por el Tratado de Utrecht (1713) sin jurisdicción territorial ni istmo. España reclama la retrocesión de la soberanía e integridad territorial."
    },
    {
        "id": "olivenza",
        "nameEs": "Olivenza",
        "nameEn": "Olivenza",
        "neId": None,
        "wikidata": "Q748802",
        "kind": "land",
        "administeredBy": "ES",
        "claimants": ["PT"],
        "status": "latent",
        "salience": "minor",
        "since": "1801-06-06",
        "statusSince": "1815-06-09",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.exercito.pt/pt/quem-somos/instituicoes-militares/museu-olivenza", "accessed": "2026-10-21", "note": "Tratado de Badajoz (1801) y Acta del Congreso de Viena (1815)"}
        ],
        "notes": "Ocupada por España en la Guerra de las Naranjas (1801). Portugal reclama su devolución conforme al Congreso de Viena (1815), mantenida sin fricciones activas."
    },
    {
        "id": "perejil",
        "nameEs": "Isla de Perejil",
        "nameEn": "Perejil Island",
        "neId": None,
        "wikidata": "Q191147",
        "kind": "island",
        "administeredBy": "ES",
        "claimants": ["MA"],
        "status": "latent",
        "salience": "minor",
        "since": "2002-07-20",
        "statusSince": "2002-07-20",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://elpais.com/diario/2002/07/21/espana/1027202401_850215.html", "accessed": "2026-10-21", "note": "Acuerdo hispano-marroquí de statu quo mediado por EE. UU. (julio 2002)"}
        ],
        "notes": "Islote deshabitado frente a la costa marroquí. Crisis militar en julio de 2002; retorno al statu quo pactado."
    },
    {
        "id": "ceuta-melilla-plazas",
        "nameEs": "Ceuta, Melilla y plazas de soberanía",
        "nameEn": "Ceuta, Melilla and Spanish sovereign territories",
        "neId": 1159320721,
        "wikidata": "Q5813",
        "kind": "land",
        "administeredBy": "ES",
        "claimants": ["MA"],
        "status": "active",
        "salience": "major",
        "since": "1956-04-07",
        "statusSince": "2023-05-17",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/exteriores/Paginas/2023/170523-reclamacion-marruecos-ceuta-melilla.aspx", "accessed": "2026-10-21", "note": "Nota verbal de protesta de España ante Marruecos por Ceuta y Melilla (mayo 2023)"}
        ],
        "notes": "Ciudades autónomas de Ceuta y Melilla y peñones (Vélez de la Gomera, Alhucemas, Chafarinas). Marruecos reclama soberanía periódicamente."
    },
    {
        "id": "northern-cyprus",
        "nameEs": "Norte de Chipre",
        "nameEn": "Northern Cyprus",
        "neId": 1159320601,
        "wikidata": "Q23681",
        "kind": "breakaway",
        "administeredBy": "TR",
        "claimants": ["CY"],
        "status": "occupied",
        "salience": "core",
        "since": "1974-07-20",
        "statusSince": "1983-11-15",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/S/RES/541(1983)", "accessed": "2026-10-21", "note": "UNSC Resolution 541 (1983): declaration of TRNC legally invalid"}
        ],
        "notes": "Ocupación militar turca del 36 % del territorio de Chipre desde 1974 y proclamación de la República Turca del Norte de Chipre, reconocida únicamente por Turquía."
    },
    {
        "id": "aegean-dispute",
        "nameEs": "Disputa del Mar Egeo",
        "nameEn": "Aegean dispute",
        "neId": None,
        "wikidata": "Q380629",
        "kind": "maritime",
        "administeredBy": "GR",
        "claimants": ["TR"],
        "status": "active",
        "salience": "major",
        "since": "1973-11-01",
        "statusSince": "2020-08-10",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mfa.gr/en/issues-of-greek-turkish-relations/", "accessed": "2026-10-21", "note": "Greek MFA: Issues of Greek-Turkish relations"},
            {"url": "https://www.mfa.gov.tr/maritime-issues-aegean-sea.en.mfa", "accessed": "2026-10-21", "note": "Turkish MFA: Aegean disputes"}
        ],
        "notes": "Disputa sobre delimitación de aguas territoriales, plataforma continental, espacio aéreo e islotes (Imia/Kardak). Vuelos militares rasantes y tensiones marítimas periódicas."
    },
    {
        "id": "danube-vukovar",
        "nameEs": "Frontera del Danubio (Isla de Vukovar)",
        "nameEn": "Danube border dispute (Island of Vukovar)",
        "neId": None,
        "wikidata": "Q12756855",
        "kind": "land",
        "administeredBy": "RS",
        "claimants": ["HR"],
        "status": "latent",
        "salience": "minor",
        "since": "1991-06-25",
        "statusSince": "1998-01-15",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mvep.gov.hr/", "accessed": "2026-10-21", "note": "Croatian MFA: border commissions with Serbia on Danube meanders"}
        ],
        "notes": "Disputa sobre antiguos meandros del río Danubio tras el cambio del cauce. Mantenida en comisiones bilaterales sin incidentes armados."
    },

    # ─── EASTERN EUROPE / CAUCASUS ──────────────────────────────────────────────
    {
        "id": "crimea",
        "nameEs": "Crimea y Sebastopol",
        "nameEn": "Crimea and Sevastopol",
        "neId": 1159320627,
        "wikidata": "Q7835",
        "kind": "occupied",
        "administeredBy": "RU",
        "claimants": ["UA"],
        "status": "occupied",
        "salience": "core",
        "since": "2014-02-27",
        "statusSince": "2014-03-18",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/A/RES/68/262", "accessed": "2026-10-21", "note": "UNGA Resolution 68/262: Territorial integrity of Ukraine"}
        ],
        "notes": "Península ocupada y anexionada unilateralmente por la Federación Rusa en 2014. No reconocida internacionalmente."
    },
    {
        "id": "donbas-zaporizhzhia-kherson",
        "nameEs": "Regiones ocupadas de Ucrania (Donetsk, Lugansk, Zaporiyia, Jersón)",
        "nameEn": "Occupied regions of Ukraine (Donetsk, Luhansk, Zaporizhzhia, Kherson)",
        "neId": 1159320723,
        "wikidata": "Q114336040",
        "kind": "occupied",
        "administeredBy": "RU",
        "claimants": ["UA"],
        "status": "occupied",
        "salience": "core",
        "since": "2022-02-24",
        "statusSince": "2022-09-30",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/A/RES/ES-11/4", "accessed": "2026-10-21", "note": "UNGA Resolution ES-11/4: Territorial integrity of Ukraine: defending the principles of the Charter"}
        ],
        "notes": "Cuatro provincias ucranianas ocupadas militarmente y declaradas anexionadas por Rusia el 30 de septiembre de 2022 tras referendos ilegales."
    },
    {
        "id": "abkhazia-south-ossetia",
        "nameEs": "Abjasia y Osetia del Sur",
        "nameEn": "Abkhazia and South Ossetia",
        "neId": 1159320603,
        "wikidata": "Q221471",
        "kind": "breakaway",
        "administeredBy": "RU",
        "claimants": ["GE"],
        "status": "occupied",
        "salience": "core",
        "since": "2008-08-08",
        "statusSince": "2008-08-26",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://hudoc.echr.coe.int/eng?i=001-207011", "accessed": "2026-10-21", "note": "ECHR Georgia v. Russia (II) judgment: Russia has effective control over Abkhazia and South Ossetia"}
        ],
        "notes": "Territorios de Georgia bajo control militar ruso tras la guerra de 2008. Reconocidos como estados independientes por Rusia y un puñado de países."
    },
    {
        "id": "transnistria",
        "nameEs": "Transnistria",
        "nameEn": "Transnistria",
        "neId": 1159320607,
        "wikidata": "Q907112",
        "kind": "breakaway",
        "administeredBy": {"entity": "Transnistria"},
        "claimants": ["MD"],
        "status": "frozen",
        "salience": "major",
        "since": "1992-07-21",
        "statusSince": "1992-07-21",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.osce.org/mission-to-moldova", "accessed": "2026-10-21", "note": "OSCE Mission to Moldova: Transnistrian settlement process"}
        ],
        "notes": "Región separatista pro-rusa en el este de Moldavia con presencia de tropas rusas de paz y arsenales de Cobasna. Conflicto congelado."
    },
    {
        "id": "kosovo",
        "nameEs": "Kosovo",
        "nameEn": "Kosovo",
        "neId": 1159320609,
        "wikidata": "Q1246",
        "kind": "whole_state",
        "administeredBy": "XK",
        "claimants": ["RS"],
        "status": "active",
        "salience": "core",
        "since": "2008-02-17",
        "statusSince": "2023-09-24",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/141", "accessed": "2026-10-21", "note": "ICJ Advisory Opinion on Kosovo declaration of independence (2010)"}
        ],
        "notes": "Declaró unilateralmente su independencia en 2008. Serbia la considera provincia autónoma de Kosovo y Metojia. Incidentes en el norte (Banjska, 2023)."
    },

    # ─── AMERICAS ────────────────────────────────────────────────────────────────
    {
        "id": "falkland-islands",
        "nameEs": "Islas Malvinas",
        "nameEn": "Falkland Islands",
        "neId": 1159320611,
        "wikidata": "Q9648",
        "kind": "island",
        "administeredBy": "GB",
        "claimants": ["AR"],
        "status": "latent",
        "salience": "core",
        "since": "1833-01-03",
        "statusSince": "1982-06-14",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/A/RES/2065(XX)", "accessed": "2026-10-21", "note": "UNGA Resolution 2065 (XX): Question of the Malvinas"}
        ],
        "notes": "Ocupadas por Reino Unido en 1833. Guerra de 1982. Argentina consagra en su Constitución Nacional la recuperación legítima e imprescriptible."
    },
    {
        "id": "south-georgia-sandwich",
        "nameEs": "Islas Georgias del Sur y Sandwich del Sur",
        "nameEn": "South Georgia and South Sandwich Islands",
        "neId": 1159320613,
        "wikidata": "Q35086",
        "kind": "island",
        "administeredBy": "GB",
        "claimants": ["AR"],
        "status": "latent",
        "salience": "major",
        "since": "1927-01-01",
        "statusSince": "1982-06-14",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://cancilleria.gob.ar/es/politica-exterior/cuestion-malvinas", "accessed": "2026-10-21", "note": "Cancillería Argentina: Cuestión Malvinas, Georgias y Sandwich del Sur"}
        ],
        "notes": "Territorio británico de ultramar reclamado por Argentina como parte integrante de su provincia de Tierra del Fuego."
    },
    {
        "id": "guayana-esequiba",
        "nameEs": "Guayana Esequiba",
        "nameEn": "Guayana Esequiba",
        "neId": 1159320615,
        "wikidata": "Q737877",
        "kind": "land",
        "administeredBy": "GY",
        "claimants": ["VE"],
        "status": "active",
        "salience": "core",
        "since": "1899-10-03",
        "statusSince": "2023-12-03",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/171", "accessed": "2026-10-21", "note": "ICJ Arbitral Award of 3 October 1899 (Guyana v. Venezuela)"},
            {"url": "https://www.icj-cij.org/node/203383", "accessed": "2026-10-21", "note": "ICJ Order on provisional measures (1 Dec 2023)"}
        ],
        "notes": "Territorio de 159.500 km² administrado por Guyana y reclamado por Venezuela. Referéndum venezolano en diciembre de 2023 y caso ante la CIJ."
    },
    {
        "id": "belize-guatemala",
        "nameEs": "Diferendo territorial Belice–Guatemala",
        "nameEn": "Belize–Guatemala territorial dispute",
        "neId": None,
        "wikidata": "Q815668",
        "kind": "land",
        "administeredBy": "BZ",
        "claimants": ["GT"],
        "status": "active",
        "salience": "core",
        "since": "1859-04-30",
        "statusSince": "2019-06-07",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/177", "accessed": "2026-10-21", "note": "ICJ Guatemala's Territorial, Insular and Maritime Claim (Guatemala/Belize)"}
        ],
        "notes": "Guatemala reclama aproximadamente la mitad sur de Belice e islas e islotes adyacentes. Sometido a la Corte Internacional de Justicia en 2019."
    },
    {
        "id": "san-andres-maritime",
        "nameEs": "Archipiélago de San Andrés y frontera marítima",
        "nameEn": "San Andrés archipelago and maritime dispute",
        "neId": None,
        "wikidata": "Q26856",
        "kind": "maritime",
        "administeredBy": "CO",
        "claimants": ["NI"],
        "status": "latent",
        "salience": "major",
        "since": "1928-03-24",
        "statusSince": "2022-04-21",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/124", "accessed": "2026-10-21", "note": "ICJ Judgment 2012: Territorial and Maritime Dispute (Nicaragua v. Colombia)"},
            {"url": "https://www.icj-cij.org/case/175", "accessed": "2026-10-21", "note": "ICJ Judgment 2022: Alleged Violations of Sovereign Rights (Nicaragua v. Colombia)"}
        ],
        "notes": "CIJ reconoció en 2012 la soberanía colombiana sobre las islas pero otorgó a Nicaragua amplia zona económica exclusiva circundante."
    },
    {
        "id": "navassa-island",
        "nameEs": "Isla de Navassa",
        "nameEn": "Navassa Island",
        "neId": 1159320617,
        "wikidata": "Q25359",
        "kind": "island",
        "administeredBy": "US",
        "claimants": ["HT"],
        "status": "latent",
        "salience": "minor",
        "since": "1857-09-19",
        "statusSince": "1999-01-16",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.fws.gov/refuge/navassa-island", "accessed": "2026-10-21", "note": "US Fish and Wildlife Service: Navassa Island National Wildlife Refuge"}
        ],
        "notes": "Islote deshabitado reclamado por EE. UU. bajo el Guano Islands Act de 1856 y por Haití en su constitución de 1801/1987."
    },
    {
        "id": "serranilla-bajo-nuevo",
        "nameEs": "Bancos de Serranilla y Bajo Nuevo",
        "nameEn": "Serranilla and Bajo Nuevo Banks",
        "neId": 1159320619,
        "wikidata": "Q1075304",
        "kind": "island",
        "administeredBy": "CO",
        "claimants": ["US", "HN", "JM", "NI"],
        "status": "latent",
        "salience": "minor",
        "since": "1928-03-24",
        "statusSince": "2012-11-19",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/124", "accessed": "2026-10-21", "note": "ICJ Judgment 2012 confirming Colombian sovereignty over Serranilla and Bajo Nuevo"}
        ],
        "notes": "Arrecifes e islotes en el Caribe occidental. La CIJ confirmó la soberanía de Colombia en 2012 frente a reclamos de Nicaragua y tratados con Jamaica y Honduras."
    },
    {
        "id": "machias-seal-island",
        "nameEs": "Isla Machias Seal",
        "nameEn": "Machias Seal Island",
        "neId": 1159320621,
        "wikidata": "Q1753906",
        "kind": "island",
        "administeredBy": "CA",
        "claimants": ["US"],
        "status": "latent",
        "salience": "minor",
        "since": "1832-01-01",
        "statusSince": "1984-10-12",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.international.gc.ca/world-monde/issues_development-enjeux_developpement/peace_security-paix_securite/borders-frontieres.aspx", "accessed": "2026-10-21", "note": "Global Affairs Canada: Canadian Sovereignty over Machias Seal Island"}
        ],
        "notes": "Islote con faro en el Golfo de Maine, administrado por la Guardia Costera de Canadá y disputado por EE. UU."
    },
    {
        "id": "tigri-area",
        "nameEs": "Área de Tigri (Nuevo Río)",
        "nameEn": "Tigri Area (New River Triangle)",
        "neId": 1159320623,
        "wikidata": "Q2302384",
        "kind": "land",
        "administeredBy": "GY",
        "claimants": ["SR"],
        "status": "latent",
        "salience": "major",
        "since": "1969-08-19",
        "statusSince": "1969-08-19",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://pca-cpa.org/en/cases/37/", "accessed": "2026-10-21", "note": "PCA Guyana v. Suriname Award (2007, maritime delimitation left land intact)"}
        ],
        "notes": "Territorio boscoso de unos 15.000 km² en la confluencia de los ríos Kutari y Nuevo. Guyana expulsó al personal de Surinam en 1969."
    },

    # ─── MIDDLE EAST & NORTH AFRICA ──────────────────────────────────────────────
    {
        "id": "western-sahara",
        "nameEs": "Sáhara Occidental",
        "nameEn": "Western Sahara",
        "neId": 1159320629,
        "wikidata": "Q6250",
        "kind": "land",
        "administeredBy": "MA",
        "claimants": [{"entity": "RASD"}],
        "status": "active",
        "salience": "core",
        "since": "1976-02-27",
        "statusSince": "2020-11-13",
        "resolvedOn": None,
        "thirdParty": [
            {"country": "US", "stance": "supports_administrator", "since": "2020-12-10", "source": "https://trumpwhitehouse.archives.gov/presidential-actions/proclamation-recognizing-sovereignty-kingdom-morocco-western-sahara/"},
            {"country": "ES", "stance": "supports_administrator", "since": "2022-03-14", "source": "https://elpais.com/espana/2022-03-18/espana-cambia-su-posicion-sobre-el-sahara-y-apoya-la-propuesta-de-autonomia-de-marruecos.html"},
            {"country": "FR", "stance": "supports_administrator", "since": "2024-07-30", "source": "https://www.lemonde.fr/afrique/article/2024/07/30/sahara-occidental-la-france-reconnait-la-souverainete-marocaine_6261908_3212.html"},
            {"country": "GB", "stance": "supports_administrator", "since": "2025-05-15", "source": "https://www.gov.uk/government/news/uk-position-on-western-sahara"},
            {"country": "DZ", "stance": "supports_claimant", "since": "1976-02-27", "source": "https://www.aps.dz/algerie/148459-sahara-occidental-l-algerie-reaffirme-son-soutien-indefectible-au-droit-du-peuple-sahraoui-a-l-autodetermination"}
        ],
        "sources": [
            {"url": "https://minurso.unmissions.org/", "accessed": "2026-10-21", "note": "UN MINURSO mandate and mission history"},
            {"url": "https://www.icj-cij.org/case/61", "accessed": "2026-10-21", "note": "ICJ Advisory Opinion on Western Sahara (1975)"}
        ],
        "notes": "Territorio no autónomo pendiente de descolonización. Marruecos administra el 80 % tras el muro defensivo; el Frente Polisario (RASD) controla la zona este."
    },
    {
        "id": "golan-heights",
        "nameEs": "Altos del Golán",
        "nameEn": "Golan Heights",
        "neId": 1159320631,
        "wikidata": "Q83522",
        "kind": "occupied",
        "administeredBy": "IL",
        "claimants": ["SY"],
        "status": "occupied",
        "salience": "core",
        "since": "1967-06-10",
        "statusSince": "1981-12-14",
        "resolvedOn": None,
        "thirdParty": [
            {"country": "US", "stance": "supports_administrator", "since": "2019-03-25", "source": "https://trumpwhitehouse.archives.gov/presidential-actions/proclamation-recognizing-golan-heights-part-state-israel/"}
        ],
        "sources": [
            {"url": "https://undocs.org/S/RES/497(1981)", "accessed": "2026-10-21", "note": "UNSC Resolution 497 (1981): Israeli Golan Heights Law null and void"}
        ],
        "notes": "Territorio sirio ocupado por Israel en 1967 y anexionado unilateralmente en 1981. EE. UU. reconoció la soberanía israelí en 2019."
    },
    {
        "id": "west-bank-east-jerusalem",
        "nameEs": "Cisjordania y Jerusalén Este",
        "nameEn": "West Bank and East Jerusalem",
        "neId": 1159320633,
        "wikidata": "Q407199",
        "kind": "occupied",
        "administeredBy": "IL",
        "claimants": ["PS"],
        "status": "occupied",
        "salience": "core",
        "since": "1967-06-10",
        "statusSince": "1980-07-30",
        "resolvedOn": None,
        "thirdParty": [
            {"country": "US", "stance": "supports_administrator", "since": "2017-12-06", "source": "https://trumpwhitehouse.archives.gov/presidential-actions/presidential-proclamation-recognition-jerusalem-capital-state-israel-relocation-embassy-united-states-embassy-jerusalem/"}
        ],
        "sources": [
            {"url": "https://www.icj-cij.org/case/186", "accessed": "2026-10-21", "note": "ICJ Advisory Opinion 2024: Legal Consequences arising from Policies and Practices of Israel in the OPT"},
            {"url": "https://undocs.org/S/RES/2334(2016)", "accessed": "2026-10-21", "note": "UNSC Resolution 2334 (2016) on Israeli settlements"}
        ],
        "notes": "Territorios palestinos ocupados por Israel desde 1967. Asentamientos, muro de separación y control militar. La CIJ declaró la ocupación ilegal en opinión consultiva de julio de 2024."
    },
    {
        "id": "shebaa-farms",
        "nameEs": "Granjas de Shebaa",
        "nameEn": "Shebaa Farms",
        "neId": 1159320635,
        "wikidata": "Q1133379",
        "kind": "land",
        "administeredBy": "IL",
        "claimants": ["LB", "SY"],
        "status": "occupied",
        "salience": "major",
        "since": "1967-06-10",
        "statusSince": "2000-05-25",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/S/2000/460", "accessed": "2026-10-21", "note": "UN Secretary-General Report S/2000/460 on implementation of UNSC resolutions 425 and 426 (Blue Line)"}
        ],
        "notes": "Zona fronteriza de 22 km² ocupada por Israel en 1967 junto a los Altos del Golán. Líbano y Hezbolá reclaman que es territorio libanés; la ONU la delimitó en territorio sirio ocupado."
    },
    {
        "id": "abu-musa-tunbs",
        "nameEs": "Abu Musa y las islas Tunb Mayor y Menor",
        "nameEn": "Abu Musa and Greater and Lesser Tunbs",
        "neId": 1159320637,
        "wikidata": "Q4670335",
        "kind": "island",
        "administeredBy": "IR",
        "claimants": ["AE"],
        "status": "latent",
        "salience": "major",
        "since": "1971-11-30",
        "statusSince": "1992-04-15",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.gov.ae/en/Missions/Geneva/UAE-and-the-UN/Foreign-Policy/Three-Islands", "accessed": "2026-10-21", "note": "UAE MFA position on the three occupied islands"}
        ],
        "notes": "Islas estratégicas en el Estrecho de Ormuz ocupadas por Irán en 1971 tras la retirada británica y reclamadas por Emiratos Árabes Unidos."
    },
    {
        "id": "halaib-triangle",
        "nameEs": "Triángulo de Halaib",
        "nameEn": "Hala'ib Triangle",
        "neId": 1159320639,
        "wikidata": "Q244172",
        "kind": "land",
        "administeredBy": "EG",
        "claimants": ["SD"],
        "status": "latent",
        "salience": "major",
        "since": "1958-02-01",
        "statusSince": "1995-06-27",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/S/3963", "accessed": "2026-10-21", "note": "Sudan complaint to the UN Security Council (1958) regarding Hala'ib"}
        ],
        "notes": "Territorio de 20.580 km² en la costa del Mar Rojo administrado de facto por Egipto desde 1995 y reclamado por Sudán en base a la frontera administrativa de 1902."
    },

    # ─── SUB-SAHARAN AFRICA ──────────────────────────────────────────────────────
    {
        "id": "abyei",
        "nameEs": "Área de Abyei",
        "nameEn": "Abyei Area",
        "neId": 1159320641,
        "wikidata": "Q336496",
        "kind": "land",
        "administeredBy": "SD",
        "claimants": ["SS"],
        "status": "active",
        "salience": "core",
        "since": "2005-01-09",
        "statusSince": "2011-06-27",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://unisfa.unmissions.org/", "accessed": "2026-10-21", "note": "UN Interim Security Force for Abyei (UNISFA) mandate"},
            {"url": "https://pca-cpa.org/en/cases/64/", "accessed": "2026-10-21", "note": "PCA Abyei Arbitration Award (2009)"}
        ],
        "notes": "Región petrolera y de pastoreo disputada entre Sudán y Sudán del Sur. La fuerza de paz UNISFA custodia el área pendiente de referéndum."
    },
    {
        "id": "ilemi-triangle",
        "nameEs": "Triángulo de Ilemi",
        "nameEn": "Ilemi Triangle",
        "neId": 1159320643,
        "wikidata": "Q844332",
        "kind": "land",
        "administeredBy": "KE",
        "claimants": ["SS"],
        "status": "latent",
        "salience": "major",
        "since": "1914-01-01",
        "statusSince": "2011-07-09",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.clingendael.org/publication/ilemi-triangle-dispute", "accessed": "2026-10-21", "note": "Clingendael Institute: The Ilemi Triangle borderlands"}
        ],
        "notes": "Territorio de pastoreo de entre 10.000 y 14.000 km² administrado por Kenia y reclamado por Sudán del Sur desde su independencia."
    },
    {
        "id": "doumeira-islands",
        "nameEs": "Islas Doumeira",
        "nameEn": "Doumeira Islands",
        "neId": 1159320645,
        "wikidata": "Q1252721",
        "kind": "island",
        "administeredBy": "ER",
        "claimants": ["DJ"],
        "status": "latent",
        "salience": "major",
        "since": "2008-06-10",
        "statusSince": "2017-06-13",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/S/RES/1862(2009)", "accessed": "2026-10-21", "note": "UNSC Resolution 1862 (2009) on Djibouti and Eritrea border conflict"}
        ],
        "notes": "Islas estratégicas en el estrecho de Bab el-Mandeb ocupadas por Eritrea en 2008 provocando choques armados con Yibuti."
    },
    {
        "id": "mayotte",
        "nameEs": "Mayotte",
        "nameEn": "Mayotte",
        "neId": 1159320647,
        "wikidata": "Q17063",
        "kind": "island",
        "administeredBy": "FR",
        "claimants": ["KM"],
        "status": "latent",
        "salience": "core",
        "since": "1975-07-06",
        "statusSince": "2011-03-31",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/A/RES/31/4", "accessed": "2026-10-21", "note": "UNGA Resolution 31/4 (1976): Question of the Comorian island of Mayotte"}
        ],
        "notes": "Isla del archipiélago de las Comoras administrada por Francia como departamento de ultramar tras votar permanecer en 1974 y 1976. Comoras reclama su soberanía e integridad territorial."
    },
    {
        "id": "chagos-archipelago",
        "nameEs": "Archipiélago de Chagos",
        "nameEn": "Chagos Archipelago",
        "neId": 1159320649,
        "wikidata": "Q162121",
        "kind": "island",
        "administeredBy": "GB",
        "claimants": ["MU"],
        "status": "latent",
        "salience": "core",
        "since": "1965-11-08",
        "statusSince": "2024-10-03",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/169", "accessed": "2026-10-21", "note": "ICJ Advisory Opinion 2019: Legal Consequences of the Separation of the Chagos Archipelago from Mauritius"},
            {"url": "https://www.gov.uk/government/news/joint-statement-between-uk-and-mauritius-3-october-2024", "accessed": "2026-10-21", "note": "UK-Mauritius Joint Statement on Chagos agreement (3 Oct 2024)"}
        ],
        "notes": "Separado de Mauricio en 1965 como Territorio Británico del Océano Índico. La CIJ dictaminó la descolonización ilegal. En octubre de 2024 Reino Unido acordó transferir soberanía reteniendo la base de Diego García."
    },
    {
        "id": "iles-eparses",
        "nameEs": "Islas Dispersas del Océano Índico (Glorioso, Juan de Nova, Europa, Bassas da India)",
        "nameEn": "Scattered Islands in the Indian Ocean",
        "neId": 1159320651,
        "wikidata": "Q192257",
        "kind": "island",
        "administeredBy": "FR",
        "claimants": ["MG", "KM"],
        "status": "latent",
        "salience": "major",
        "since": "1960-06-26",
        "statusSince": "2019-11-18",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/A/RES/34/91", "accessed": "2026-10-21", "note": "UNGA Resolution 34/91 (1979): Question of the islands of Glorieuses, Juan de Nova, Europa and Bassas da India"}
        ],
        "notes": "Islotes administrados por Francia como distrito de las Tierras Australes y Antárticas Francesas y reclamados por Madagascar desde su independencia."
    },
    {
        "id": "tromelin-island",
        "nameEs": "Isla Tromelin",
        "nameEn": "Tromelin Island",
        "neId": 1159320653,
        "wikidata": "Q234471",
        "kind": "island",
        "administeredBy": "FR",
        "claimants": ["MU"],
        "status": "latent",
        "salience": "minor",
        "since": "1976-04-02",
        "statusSince": "2010-06-07",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.senat.fr/dossier-legislatif/pjl12-421.html", "accessed": "2026-10-21", "note": "French Senate: Accord de cogestion de Tromelin avec Maurice (2010)"}
        ],
        "notes": "Islote coralino al este de Madagascar administrado por Francia y reclamado por Mauricio."
    },
    {
        "id": "kangwane",
        "nameEs": "KaNgwane / Ingwavuma",
        "nameEn": "KaNgwane and Ingwavuma",
        "neId": None,
        "wikidata": "Q1474288",
        "kind": "land",
        "administeredBy": "ZA",
        "claimants": ["SZ"],
        "status": "latent",
        "salience": "minor",
        "since": "1982-01-01",
        "statusSince": "1984-01-01",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.sahistory.org.za/article/homelands", "accessed": "2026-10-21", "note": "South African History Online: The KaNgwane border adjustment plan"}
        ],
        "notes": "Esuatini reclama franjas territoriales que el régimen del apartheid planeó cederle en 1982 para privar a los swazis sudafricanos de su nacionalidad."
    },

    # ─── ASIA / INDO-PACIFIC ────────────────────────────────────────────────────
    {
        "id": "kashmir-jammu-ladakh",
        "nameEs": "Cachemira (Jammu, Cachemira y Ladakh)",
        "nameEn": "Kashmir (Jammu, Kashmir and Ladakh)",
        "neId": 1159320655,
        "wikidata": "Q43110",
        "kind": "land",
        "administeredBy": "IN",
        "claimants": ["PK"],
        "status": "militarized",
        "salience": "core",
        "since": "1947-10-22",
        "statusSince": "2019-08-05",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://undocs.org/S/RES/47(1948)", "accessed": "2026-10-21", "note": "UNSC Resolution 47 (1948) on the Kashmir dispute"}
        ],
        "notes": "Sector administrado por India a lo largo de la Línea de Control (LoC). Guerras en 1947, 1965 y 1999 (Kargil). India revocó su estatus especial en agosto de 2019."
    },
    {
        "id": "kashmir-azad-gilgit",
        "nameEs": "Azad Cachemira y Gilgit-Baltistán",
        "nameEn": "Azad Kashmir and Gilgit-Baltistan",
        "neId": 1159320657,
        "wikidata": "Q200130",
        "kind": "land",
        "administeredBy": "PK",
        "claimants": ["IN"],
        "status": "militarized",
        "salience": "core",
        "since": "1947-10-22",
        "statusSince": "2019-02-26",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mea.gov.in/press-releases.htm?dtl/31752/Statement_on_Pakistan_Occupied_Jammu_and_Kashmir", "accessed": "2026-10-21", "note": "Indian MEA: Official statement on Pakistan-occupied Jammu and Kashmir"}
        ],
        "notes": "Sectores de Cachemira administrados por Pakistán, reclamados constitucionalmente por India como parte integral de su territorio."
    },
    {
        "id": "aksai-chin",
        "nameEs": "Aksai Chin",
        "nameEn": "Aksai Chin",
        "neId": 1159320659,
        "wikidata": "Q230796",
        "kind": "land",
        "administeredBy": "CN",
        "claimants": ["IN"],
        "status": "militarized",
        "salience": "core",
        "since": "1962-10-20",
        "statusSince": "2020-06-15",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mea.gov.in/speeches-statements.htm?dtl/32770", "accessed": "2026-10-21", "note": "Indian MEA: Galwan Valley clash and disengagement talks (2020)"}
        ],
        "notes": "Meseta desértica de 37.244 km² controlada por China desde la guerra de 1962. Reclamada por India como parte de Ladakh. Choque armado de Galwan en 2020 con 24 muertos."
    },
    {
        "id": "shaksgam-valley",
        "nameEs": "Valle de Shaksgam",
        "nameEn": "Shaksgam Valley (Trans-Karakoram Tract)",
        "neId": 1159320661,
        "wikidata": "Q1771146",
        "kind": "land",
        "administeredBy": "CN",
        "claimants": ["IN"],
        "status": "militarized",
        "salience": "major",
        "since": "1963-03-02",
        "statusSince": "1963-03-02",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mea.gov.in/press-releases.htm?dtl/37812", "accessed": "2026-10-21", "note": "Indian MEA protest on infrastructure construction in Shaksgam Valley (2024)"}
        ],
        "notes": "Área de 5.180 km² cedida por Pakistán a China en el acuerdo fronterizo de 1963. India no reconoce el acuerdo y reclama el territorio."
    },
    {
        "id": "arunachal-pradesh",
        "nameEs": "Arunachal Pradesh (Tíbet del Sur)",
        "nameEn": "Arunachal Pradesh (South Tibet)",
        "neId": 1159320663,
        "wikidata": "Q1162",
        "kind": "land",
        "administeredBy": "IN",
        "claimants": ["CN"],
        "status": "militarized",
        "salience": "core",
        "since": "1914-07-03",
        "statusSince": "2022-12-09",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mea.gov.in/response-to-queries.htm?dtl/36423", "accessed": "2026-10-21", "note": "Indian MEA: Arunachal Pradesh is an integral and inalienable part of India (2024)"}
        ],
        "notes": "Estado indio delimitado por la Línea McMahon de 1914, no reconocida por China, que lo reclama como Tíbet del Sur (Zangnan). Incidentes en el sector de Yangtse en 2022."
    },
    {
        "id": "durand-line",
        "nameEs": "Línea Durand",
        "nameEn": "Durand Line",
        "neId": None,
        "wikidata": "Q467554",
        "kind": "land",
        "administeredBy": "PK",
        "claimants": ["AF"],
        "status": "militarized",
        "salience": "core",
        "since": "1893-11-12",
        "statusSince": "2025-10-11",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mofa.gov.pk/press-releases", "accessed": "2026-10-21", "note": "Pakistani MOFA: Border security and clashes along the Durand Line (Oct 2025)"}
        ],
        "notes": "Frontera de 2.670 km trazada por Mortimer Durand en 1893, nunca reconocida por ningún gobierno afgano. Choques armados fronterizos recurrentes (octubre 2025)."
    },
    {
        "id": "preah-vihear",
        "nameEs": "Templo de Preah Vihear y frontera",
        "nameEn": "Preah Vihear Temple border area",
        "neId": 1159320665,
        "wikidata": "Q46580",
        "kind": "land",
        "administeredBy": "KH",
        "claimants": ["TH"],
        "status": "militarized",
        "salience": "core",
        "since": "1962-06-15",
        "statusSince": "2025-07-24",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.icj-cij.org/case/45", "accessed": "2026-10-21", "note": "ICJ Judgment 1962 and Interpretation 2013: Temple of Preah Vihear"}
        ],
        "notes": "Templo hindú del siglo XI y promontorio adyacente. La CIJ atribuyó el templo y área circundante a Camboya. Choques militares en 2008-2011 y conflicto fronterizo en julio de 2025."
    },
    {
        "id": "kuril-islands",
        "nameEs": "Islas Kuriles del Sur (Territorios del Norte)",
        "nameEn": "Southern Kuril Islands (Northern Territories)",
        "neId": 1159320667,
        "wikidata": "Q1038753",
        "kind": "island",
        "administeredBy": "RU",
        "claimants": ["JP"],
        "status": "latent",
        "salience": "core",
        "since": "1945-09-02",
        "statusSince": "2022-03-21",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.go.jp/region/europe/russia/territory/index.html", "accessed": "2026-10-21", "note": "Japanese MOFA: Northern Territories Issue"},
            {"url": "https://mid.ru/en/foreign_policy/news/1805561/", "accessed": "2026-10-21", "note": "Russian MFA statement on peace treaty negotiations suspension (March 2022)"}
        ],
        "notes": "Islas de Iturup, Kunashir, Shikotan y el archipiélago de Habomai ocupadas por la URSS en 1945. Impiden la firma de un tratado de paz entre Tokio y Moscú."
    },
    {
        "id": "dokdo-takeshima",
        "nameEs": "Liancourt Rocks (Dokdo / Takeshima)",
        "nameEn": "Liancourt Rocks (Dokdo / Takeshima)",
        "neId": 1159320669,
        "wikidata": "Q20352",
        "kind": "island",
        "administeredBy": "KR",
        "claimants": ["JP", "KP"],
        "status": "latent",
        "salience": "major",
        "since": "1953-04-20",
        "statusSince": "2021-06-01",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://dokdo.mofa.go.kr/eng/", "accessed": "2026-10-21", "note": "South Korean MOFA: Dokdo, Beautiful Island of Korea"},
            {"url": "https://www.mofa.go.jp/a_o/na/takeshima/index.html", "accessed": "2026-10-21", "note": "Japanese MOFA: Takeshima Issue"}
        ],
        "notes": "Dos islotes rocosos en el Mar de Japón / Mar del Este administrados de facto por la policía de Corea del Sur y reclamados por Japón."
    },
    {
        "id": "senkaku-diaoyu",
        "nameEs": "Islas Senkaku (Diaoyu)",
        "nameEn": "Senkaku Islands (Diaoyu Islands)",
        "neId": 1159320671,
        "wikidata": "Q29460",
        "kind": "island",
        "administeredBy": "JP",
        "claimants": ["CN", "TW"],
        "status": "active",
        "salience": "core",
        "since": "1895-01-14",
        "statusSince": "2012-09-11",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.go.jp/region/asia-paci/senkaku/index.html", "accessed": "2026-10-21", "note": "Japanese MOFA: Senkaku Islands"},
            {"url": "https://www.mfa.gov.cn/eng/wjdt_665385/2649_665393/201209/t20120910_679472.html", "accessed": "2026-10-21", "note": "Chinese MFA statement on Diaoyu Dao (Sept 2012)"}
        ],
        "notes": "Archipiélago deshabitado en el Mar de la China Oriental administrado por Japón. China nacionalizó las patrullas marítimas tras la compra japonesa de 2012."
    },
    {
        "id": "taiwan",
        "nameEs": "Taiwán (República de China)",
        "nameEn": "Taiwan (Republic of China)",
        "neId": 1159320673,
        "wikidata": "Q865",
        "kind": "whole_state",
        "administeredBy": "TW",
        "claimants": ["CN"],
        "status": "active",
        "salience": "core",
        "since": "1949-10-01",
        "statusSince": "2024-05-20",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mfa.gov.cn/eng/wjdt_665385/2649_665393/202208/t20220810_10740333.html", "accessed": "2026-10-21", "note": "State Council White Paper: The Taiwan Question and China's Reunification in the New Era"}
        ],
        "notes": "Autogobierno democrático de facto desde 1949. Pekín reclama la soberanía bajo el principio de una sola China y no descarta el uso de la fuerza."
    },
    {
        "id": "paracel-islands",
        "nameEs": "Islas Paracel (Xisha / Hoàng Sa)",
        "nameEn": "Paracel Islands",
        "neId": 1159320675,
        "wikidata": "Q26994",
        "kind": "island",
        "administeredBy": "CN",
        "claimants": ["VN", "TW"],
        "status": "active",
        "salience": "core",
        "since": "1974-01-20",
        "statusSince": "2020-04-18",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://vietnamembassy-usa.org/news/2020/04/viet-nams-sovereignty-over-hoang-sa-and-truong-sa-undisputable", "accessed": "2026-10-21", "note": "Vietnam MOFA: Sovereignty over Hoang Sa and Truong Sa"}
        ],
        "notes": "Ocupadas militarmente por China en 1974 tras batalla naval con Vietnam del Sur. Reclamadas por Vietnam y Taiwán."
    },
    {
        "id": "spratly-islands",
        "nameEs": "Islas Spratly (Nansha / Trường Sa / Kalayaan)",
        "nameEn": "Spratly Islands",
        "neId": 1159320677,
        "wikidata": "Q215664",
        "kind": "island",
        "administeredBy": "CN",
        "claimants": ["VN", "PH", "MY", "BN", "TW"],
        "status": "active",
        "salience": "core",
        "since": "1947-12-01",
        "statusSince": "2016-07-12",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://pca-cpa.org/en/cases/7/", "accessed": "2026-10-21", "note": "PCA South China Sea Arbitration Award (Philippines v. China, 2016)"}
        ],
        "notes": "Archipiélago con más de 100 islotes, arrecifes y atolones ocupados por múltiples partes (China, Vietnam, Filipinas, Malasia, Taiwán). China ha construido bases militares sobre arrecifes artificiales."
    },
    {
        "id": "scarborough-shoal",
        "nameEs": "Bajo de Masinloc (Scarborough / Huangyan)",
        "nameEn": "Scarborough Shoal (Huangyan Island)",
        "neId": 1159320679,
        "wikidata": "Q1140986",
        "kind": "island",
        "administeredBy": "CN",
        "claimants": ["PH", "TW"],
        "status": "active",
        "salience": "core",
        "since": "2012-04-08",
        "statusSince": "2024-04-30",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://dfa.gov.ph/dfa-news/statements-and-advisories", "accessed": "2026-10-21", "note": "Philippine DFA: Statements on Chinese coast guard harassment at Bajo de Masinloc"}
        ],
        "notes": "Atolón a 220 km de Luzón. Control de facto por la guardia costera china desde el bloqueo de 2012, dentro de la ZEE de Filipinas."
    },
    {
        "id": "kalapani-territory",
        "nameEs": "Territorio de Kalapani, Lipulekh y Limpiyadhura",
        "nameEn": "Kalapani territory",
        "neId": 1159320681,
        "wikidata": "Q6351659",
        "kind": "land",
        "administeredBy": "IN",
        "claimants": ["NP"],
        "status": "latent",
        "salience": "major",
        "since": "1816-03-04",
        "statusSince": "2020-05-20",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://mofa.gov.np/press-release-regarding-new-political-map-of-nepal/", "accessed": "2026-10-21", "note": "Nepal MOFA: Constitutional amendment adopting updated map including Kalapani (2020)"}
        ],
        "notes": "Zona montañosa fronteriza de unos 370 km² administrada por India y reclamada por Nepal conforme al Tratado de Sugauli de 1816."
    },
    {
        "id": "northern-limit-line",
        "nameEs": "Línea del Límite Norte (NLL)",
        "nameEn": "Northern Limit Line (NLL)",
        "neId": 1159320683,
        "wikidata": "Q494879",
        "kind": "maritime",
        "administeredBy": "KR",
        "claimants": ["KP"],
        "status": "militarized",
        "salience": "core",
        "since": "1953-08-30",
        "statusSince": "2010-11-23",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mfa.go.kr/", "accessed": "2026-10-21", "note": "South Korean Ministry of National Defense: Northern Limit Line inviolability"}
        ],
        "notes": "Frontera marítima de facto fijada por la ONU en 1953 no reconocida por Corea del Norte. Escenario del bombardeo de Yeonpyeong (2010) y batallas navales de Yeonpyeong."
    },
    {
        "id": "wake-island",
        "nameEs": "Isla Wake",
        "nameEn": "Wake Island",
        "neId": 1159320685,
        "wikidata": "Q43501",
        "kind": "island",
        "administeredBy": "US",
        "claimants": ["MH"],
        "status": "latent",
        "salience": "minor",
        "since": "1899-01-17",
        "statusSince": "1982-01-01",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.doi.gov/oia/islands/wakeisland", "accessed": "2026-10-21", "note": "US Department of the Interior: Office of Insular Affairs - Wake Island"}
        ],
        "notes": "Atolón del Pacífico administrado por la Fuerza Aérea de EE. UU. y reclamado consuetudinariamente por las Islas Marshall (EnenKio)."
    },
    {
        "id": "somaliland",
        "nameEs": "Somalilandia",
        "nameEn": "Somaliland",
        "neId": 1159320687,
        "wikidata": "Q34754",
        "kind": "whole_state",
        "administeredBy": {"entity": "Somalilandia"},
        "claimants": ["SO"],
        "status": "active",
        "salience": "core",
        "since": "1991-05-18",
        "statusSince": "2024-01-01",
        "resolvedOn": None,
        "thirdParty": [
            {"country": "ET", "stance": "supports_claimant", "since": "2024-01-01", "source": "https://www.reuters.com/world/africa/landlocked-ethiopia-signs-pact-use-somalilands-red-sea-port-2024-01-01/"}
        ],
        "sources": [
            {"url": "https://somalilandgov.com/", "accessed": "2026-10-21", "note": "Government of Somaliland: Independence declaration (1991) and Memorandum with Ethiopia (2024)"}
        ],
        "notes": "Estado de facto autoproclamado independiente en 1991 en las fronteras de la antigua Somalilandia británica. Somalia lo considera parte integral."
    },
    {
        "id": "sabah",
        "nameEs": "Sabah (Borneo Septentrional)",
        "nameEn": "Sabah (North Borneo)",
        "neId": None,
        "wikidata": "Q179006",
        "kind": "land",
        "administeredBy": "MY",
        "claimants": ["PH"],
        "status": "latent",
        "salience": "major",
        "since": "1962-06-22",
        "statusSince": "1963-09-16",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.officialgazette.gov.ph/1962/06/22/philippine-claim-to-north-borneo-sabah/", "accessed": "2026-10-21", "note": "Philippine formal claim to North Borneo (Sabah) based on Sultanate of Sulu lease (1962)"}
        ],
        "notes": "Reclamación histórica de Filipinas sobre el territorio malasio de Sabah en el norte de Borneo, basada en los derechos del antiguo Sultanato de Joló."
    },
    {
        "id": "ieodo-socotra-rock",
        "nameEs": "Roca Socotra (Ieodo / Suyan Rock)",
        "nameEn": "Socotra Rock (Ieodo)",
        "neId": None,
        "wikidata": "Q494883",
        "kind": "maritime",
        "administeredBy": "KR",
        "claimants": ["CN"],
        "status": "latent",
        "salience": "minor",
        "since": "1951-01-01",
        "statusSince": "2013-12-08",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.go.kr/", "accessed": "2026-10-21", "note": "South Korean EEZ and Ieodo Ocean Research Station"}
        ],
        "notes": "Arrecife sumergido en el Mar de China Oriental con estación científica surcoreana, dentro de ZEE solapadas de Corea del Sur y China."
    },
    {
        "id": "lough-foyle-carlingford",
        "nameEs": "Lough Foyle y Carlingford Lough",
        "nameEn": "Lough Foyle and Carlingford Lough",
        "neId": None,
        "wikidata": "Q1544415",
        "kind": "maritime",
        "administeredBy": "GB",
        "claimants": ["IE"],
        "status": "latent",
        "salience": "minor",
        "since": "1922-12-06",
        "statusSince": "1998-04-10",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.dfa.ie/", "accessed": "2026-10-21", "note": "Irish DFA statement on Lough Foyle jurisdiction and Good Friday Agreement"}
        ],
        "notes": "Entradas marítimas fronterizas entre Irlanda del Norte y la República de Irlanda cuyas aguas permanecen sin delimitación formal definitiva."
    },
    {
        "id": "amboyna-cay-natuna",
        "nameEs": "Cayo Amboyna y plataforma continental de Natuna",
        "nameEn": "Amboyna Cay / Natuna continental shelf",
        "neId": None,
        "wikidata": "Q1005315",
        "kind": "maritime",
        "administeredBy": "VN",
        "claimants": ["ID"],
        "status": "latent",
        "salience": "minor",
        "since": "1980-01-01",
        "statusSince": "2022-12-22",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://kemlu.go.id/", "accessed": "2026-10-21", "note": "Indonesia-Vietnam EEZ delimitation agreement (December 2022)"}
        ],
        "notes": "Delimitación marítima de la plataforma continental y ZEE en el Mar de China Meridional negociada durante décadas y formalizada en 2022."
    },
    {
        "id": "tho-chu-islands",
        "nameEs": "Islas Thổ Chu y frontera marítima del Golfo de Tailandia",
        "nameEn": "Tho Chu Islands maritime sector",
        "neId": None,
        "wikidata": "Q10826010",
        "kind": "maritime",
        "administeredBy": "VN",
        "claimants": ["KH"],
        "status": "latent",
        "salience": "minor",
        "since": "1975-05-10",
        "statusSince": "1982-07-07",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.gov.vn/", "accessed": "2026-10-21", "note": "Vietnam-Cambodia Historic Waters Agreement (1982)"}
        ],
        "notes": "Sector marítimo en el Golfo de Tailandia objeto del acuerdo de aguas históricas de 1982 pendiente de delimitación final de frontera."
    },
    {
        "id": "banc-du-geyser",
        "nameEs": "Banc du Geyser",
        "nameEn": "Banc du Geyser",
        "neId": None,
        "wikidata": "Q806169",
        "kind": "maritime",
        "administeredBy": "FR",
        "claimants": ["MG", "KM"],
        "status": "latent",
        "salience": "minor",
        "since": "1976-01-01",
        "statusSince": "1976-01-01",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.defense.gouv.fr/", "accessed": "2026-10-21", "note": "French Navy surveillance of Banc du Geyser and Îles Éparses"}
        ],
        "notes": "Arrecife en el canal de Mozambique reclamado por Madagascar y Comoras, patrullado por Francia."
    },
    {
        "id": "noktundo-island",
        "nameEs": "Isla de Noktundo",
        "nameEn": "Noktundo Island",
        "neId": None,
        "wikidata": "Q484439",
        "kind": "land",
        "administeredBy": "RU",
        "claimants": ["KR"],
        "status": "latent",
        "salience": "minor",
        "since": "1990-01-01",
        "statusSince": "1990-01-01",
        "resolvedOn": None,
        "thirdParty": [],
        "sources": [
            {"url": "https://www.mofa.go.kr/", "accessed": "2026-10-21", "note": "South Korean constitutional claim on Korean Peninsula and adjacent islands"}
        ],
        "notes": "Antigua isla fluvial en el delta del río Tumen transferida a la URSS en 1860 y ratificada en el acuerdo fronterizo soviético-norcoreano de 1990, cuya validez Corea del Sur no reconoce formalmente."
    }
]

# ─── EXCLUDED ENTITIES (with clear reasons) ──────────────────────────────────
EXCLUDED = [
    {
        "id": "un-buffer-zone-cyprus",
        "name": "Zona de Amortiguación de la ONU en Chipre (Green Line)",
        "neId": 1159320689,
        "pairs": [],
        "reason": "Overlay / Zona de amortiguación de la ONU (UNFICYP), no es una reclamación bilateral."
    },
    {
        "id": "undof-golan",
        "name": "Zona de Separación de UNDOF en los Altos del Golán",
        "neId": 1159320691,
        "pairs": [],
        "reason": "Overlay / Zona de amortiguación de la ONU (UNDOF), no es una reclamación soberana propia."
    },
    {
        "id": "korea-dmz",
        "name": "Zona Desmilitarizada de Corea (DMZ)",
        "neId": 1159320693,
        "pairs": [],
        "reason": "Overlay / Franja de armisticio de 1953, no es un territorio reclamado separado."
    },
    {
        "id": "baikonur",
        "name": "Cosmódromo de Baikonur",
        "neId": 1159320695,
        "pairs": ["KZ-RU"],
        "reason": "Lease / Arrendamiento civil de Kazajistán a Rusia hasta 2050, no disputa de soberanía."
    },
    {
        "id": "hans-island",
        "name": "Isla de Hans (Tartupaluk)",
        "neId": 1159320697,
        "pairs": ["CA-DK"],
        "reason": "Resolved / Disputa resuelta formalmente el 14 de junio de 2022 mediante tratado bilateral que dividió la isla entre Canadá y Dinamarca."
    },
    {
        "id": "artsakh",
        "name": "Nagorno-Karabaj (Artsaj)",
        "neId": 1159320699,
        "pairs": ["AM-AZ"],
        "reason": "Resolved / República de facto disuelta formalmente el 1 de enero de 2024 tras la operación militar de Azerbaiyán de septiembre de 2023."
    },
    {
        "id": "china-russia-border",
        "name": "Frontera China-Rusia (Bolshoy Ussuriysky / Abagaitu)",
        "neId": 1159320701,
        "pairs": ["CN-RU"],
        "reason": "Resolved / Frontera completamente delimitada y demarcada mediante los acuerdos de 2004 y 2008."
    },
    {
        "id": "bakassi-peninsula",
        "name": "Península de Bakassi",
        "neId": 1159320703,
        "pairs": ["CM-NG"],
        "reason": "Resolved / Transferida pacíficamente por Nigeria a Camerún conforme al fallo de la CIJ de 2002 y el Acuerdo de Greentree de 2006 (completada en 2008)."
    },
    {
        "id": "bir-tawil",
        "name": "Bir Tawil",
        "neId": 1159320705,
        "pairs": [],
        "reason": "Terra nullius / Territorio no reclamado por ningún Estado (Egipto y Sudán reclaman fronteras que lo excluyen)."
    },
    {
        "id": "antarctica",
        "name": "Reclamaciones en la Antártida",
        "neId": 1159320707,
        "pairs": ["AR-CL", "CL-GB"],
        "reason": "Congeladas / Las reclamaciones territoriales antárticas de Argentina, Chile, Reino Unido, Francia, Noruega, Australia y Nueva Zelanda están congeladas por el Artículo IV del Tratado Antártico de 1959."
    },
    {
        "id": "morocco-madeira",
        "name": "Madeira (error Wikidata)",
        "neId": None,
        "pairs": ["MA-PT"],
        "reason": "Error en Wikidata / Marruecos no reclama soberanía sobre Madeira (descarte verificado en reviewed_facts.json)."
    },
    {
        "id": "outer-mongolia-taiwan",
        "name": "Mongolia Exterior (reclamación histórica de la República de China)",
        "neId": None,
        "pairs": ["MN-TW"],
        "reason": "Desfasada / Reclamación histórica de la República de China de 1947, abandonada de facto en 2002 al reconocer el Ministerio de Exteriores a Mongolia."
    },
    {
        "id": "china-pakistan-border",
        "name": "Frontera China-Pakistán",
        "neId": None,
        "pairs": ["CN-PK"],
        "reason": "Resolved / Frontera delimitada pacíficamente mediante el Acuerdo de 1963; no hay disputa activa entre ambos."
    },
    {
        "id": "west-bank-jordan",
        "name": "Cisjordania reclamada por Jordania",
        "neId": None,
        "pairs": ["IL-JO", "JO-PS"],
        "reason": "Renuncia / El rey Hussein de Jordania renunció formalmente a todo reclamo sobre Cisjordania el 31 de julio de 1988 en favor de la OLP."
    },
    {
        "id": "philadelphi-corridor",
        "name": "Corredor Filadelfia (Gaza)",
        "neId": None,
        "pairs": ["EG-IL", "EG-PS"],
        "reason": "Franja fronteriza de seguridad en Gaza; no hay reclamación territorial bilateral entre Egipto y Palestina."
    },
    {
        "id": "jarvis-island-uk",
        "name": "Isla Jarvis (error Wikidata)",
        "neId": None,
        "pairs": ["GB-US"],
        "reason": "Error en Wikidata / Territorio no incorporado de EE. UU. sin reclamación viva por parte del Reino Unido."
    },
    {
        "id": "strovilia-sba",
        "name": "Frontera de las Bases Soberanas Británicas en Chipre (Strovilia)",
        "neId": None,
        "pairs": ["CY-GB"],
        "reason": "Límite técnico de demarcación militar de las bases soberanas (SBA) fijadas en 1960; no constituye disputa territorial bilateral entre estados."
    },
    {
        "id": "bougainville",
        "name": "Bougainville",
        "neId": None,
        "pairs": ["AU-PG"],
        "reason": "Asunto interno de Papúa Nueva Guinea tras el referéndum de 2019; Australia no reclama nada."
    },
    {
        "id": "transnistria-ukraine",
        "name": "Transnistria vs Ucrania (error Wikidata)",
        "neId": None,
        "pairs": ["MD-UA"],
        "reason": "Ucrania reconoce a Transnistria como parte integrante de Moldavia; no reclama territorio."
    },
    {
        "id": "french-somaliland",
        "name": "Somalia Francesa (Yibuti)",
        "neId": None,
        "pairs": ["DJ-FR"],
        "reason": "Independizada pacíficamente en 1977 como la República de Yibuti; no es una reclamación actual de Francia."
    },
    {
        "id": "french-mandate-syria",
        "name": "Mandato francés de Siria (error Wikidata)",
        "neId": None,
        "pairs": ["FR-SY"],
        "reason": "Mandato colonial de la Sociedad de Naciones concluido en 1946; no es una reclamación territorial viva."
    }
]

DATA = {
    "about": "Registro revisado de reclamaciones territoriales de primer orden y menor salience en el mundo, revisado a fecha 2026-10-21. Proporciona la fuente única de verdad para el cálculo estructural de disputas territoriales en el motor de relaciones bilaterales y para su representación cartográfica (mapa 2D y globo 3D). Diseñado conforme a la Convención de Montevideo y resoluciones de Naciones Unidas.",
    "reviewed": "2026-10-21",
    "maintainer": "World Geopolitical Engine relations team",
    "claims": CLAIMS,
    "excluded": EXCLUDED
}

def main():
    os.makedirs(os.path.dirname(REG_PATH), exist_ok=True)
    with open(REG_PATH, 'w', encoding='utf-8') as f:
        json.dump(DATA, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(CLAIMS)} claims and {len(EXCLUDED)} excluded items in {REG_PATH}")

if __name__ == '__main__':
    main()
