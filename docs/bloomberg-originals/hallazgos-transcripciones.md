# Bloomberg Originals: hechos y funcionalidades sugeridas

**43 de 378** videos relevantes revisados, un subagente por video. **290 hechos**, cada uno con su cita literal comprobada contra la transcripción (290 literales, 0 descartados). Agrupados en **41 funcionalidades** que el sistema necesitaría para captarlos, con su ubicación en cada capa del proyecto (datos → servicio → API → interfaz).

> Estado: incompleto. YouTube bloquea la IP para transcripciones cada ~20 videos; faltan 335 videos. Ubicaciones y prioridades: Hipótesis (propuestas por IA, sin validar).

> Contexto, no señal: datos citados por Bloomberg; nada entra al score de empresas sin calibración.

## Resumen

| # | Funcionalidad | Hechos | Prioridad | Ficha existente | Interfaz |
|---|---|---|---|---|---|
| 1 | [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) | 15 | media | laboratorio-forense | Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection. |
| 2 | [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) | 13 | alta | finanzas-publicas-soberanas | Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel. |
| 3 | [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) | 10 | alta | nueva | Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts. |
| 4 | [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) | 10 | alta | nueva | Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel. |
| 5 | [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) | 10 | alta | nueva | Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel. |
| 6 | [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) | 9 | alta | nueva | Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel. |
| 7 | [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) | 9 | alta | nueva | ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection. |
| 8 | [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) | 9 | alta | finanzas-publicas-soberanas | SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel. |
| 9 | [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) | 9 | alta | nueva | Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx. |
| 10 | [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) | 9 | media | nueva | Nueva sección sidebar/InvestmentClimateSection.tsx. |
| 11 | [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) | 9 | media | arbol-tecnologico-historico | Top-bar TechPanel (comparador) + vista del árbol tecnológico del país. |
| 12 | [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) | 9 | baja | bloomberg-originals-pais | Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection. |
| 13 | [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) | 8 | alta | nueva | Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts. |
| 14 | [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) | 8 | alta | nueva | Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa. |
| 15 | [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) | 7 | media | nueva | Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection. |
| 16 | [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) | 7 | media | nueva | DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection. |
| 17 | [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) | 7 | media | calibracion-brier | app/markets/page.tsx (insignia de calidad y ficha de plataforma). |
| 18 | [Demografía y mercado laboral por país](#demografia-mercado-laboral) | 7 | media | demografia-pais | Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection. |
| 19 | [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) | 7 | media | demografia-pais | Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais). |
| 20 | [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) | 7 | baja | bloomberg-originals-pais | Lista de empresas privadas en BloombergOriginalsSection.tsx. |
| 21 | [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) | 6 | alta | nueva | Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel. |
| 22 | [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) | 6 | alta | calibracion-relaciones-gdelt | Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel. |
| 23 | [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) | 6 | alta | nueva | CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection. |
| 24 | [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) | 6 | media | nueva | Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa. |
| 25 | [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) | 6 | media | finanzas-publicas-soberanas | Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D. |
| 26 | [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) | 6 | media | nueva | Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel. |
| 27 | [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) | 6 | media | nueva | Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts. |
| 28 | [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) | 6 | media | entidades-postura-vecinal | Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts. |
| 29 | [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) | 6 | media | nueva | Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA). |
| 30 | [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) | 6 | media | nueva | sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa. |
| 31 | [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) | 5 | alta | nueva | Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel. |
| 32 | [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) | 5 | alta | calibracion-brier | Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa. |
| 33 | [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) | 5 | alta | nueva | Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection. |
| 34 | [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) | 5 | alta | nueva | Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel. |
| 35 | [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) | 5 | alta | regimen-credito-bonos | Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel. |
| 36 | [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) | 5 | media | desarrollo-industrial-ciudades | Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha). |
| 37 | [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) | 5 | media | nueva | sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas. |
| 38 | [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) | 5 | baja | finanzas-publicas-soberanas | Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas). |
| 39 | [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) | 4 | alta | nueva | Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer. |
| 40 | [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) | 4 | media | calibracion-brier | Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection. |
| 41 | [Ampliación de instalaciones corporativas a vehículos eléctricos, aeroespacial y consumo](#ampliacion-instalaciones-corporativas) | 3 | media | nueva | Capa 'footprint' del mapa (map2d/render-facilities.ts). |

## Funcionalidades

<a id="ficha-empresa-ampliada"></a>
### 1. Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia

Para cada empresa el usuario ve fundamentales, capex y apalancamiento, mezcla de segmentos y de ingresos por país, economía unitaria, poder de precio, indicadores de marca, eventos corporativos (OPV, traslado de sede) y riesgos estratégicos como la disrupción de canal por IA.

- **Por qué importa para invertir:** Es el puente entre lo que pasa en un país y la empresa: sin ingresos por país y segmento no se puede saber cuánto le afecta un evento.
- **Prioridad:** media · **Ficha:** laboratorio-forense · **Fuente de datos:** SEC EDGAR XBRL (companyfacts, segment reporting), informes anuales, Financial Modeling Prep / similar; marca: Kantar BrandZ / Interbrand.
- **Datos:** Datos XBRL (SEC companyfacts) y segmentos geográficos; reutilizar lib/services/geographic/sec-properties para instalaciones.
- **Servicio:** Nuevo lib/services/company/company-profile-service.ts (lee del sistema equity; no duplica el laboratorio forense).
- **API:** Nuevo app/api/companies/[ticker]/route.ts.
- **Interfaz:** Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
- **Conecta con:** laboratorio forense (sistema equity), lib/services/geographic/risk-scorer, grafo-corporativo, vinculos-politico-empresariales, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US) El flujo de caja libre de Oracle, positivo y en miles de millones de dólares desde los años 90, ha dejado de serlo por la apuesta masiva en infraestructura de nube e IA, y muchos inversores están preocupados; magnitud no indicada. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (US) Oracle vale unos 450.000 millones de dólares y se espera que ingrese este año unos 90.000 millones, repartidos entre aplicaciones en la nube, software tradicional e infraestructura cloud. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (HK) En 2025 MTR (Hong Kong, ticker 66) obtuvo unos 14.600 millones de HKD de beneficio, tres cuartas partes procedentes de bienes raíces y no de tarifas, porque desarrolla propiedades sobre sus estaciones. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)
- (HK) MTR ha pedido prestados unos 140.000 millones de HKD para los proyectos futuros; fecha del cálculo no indicada. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)
- (US) Qualcomm está diversificando más allá del móvil: ha entrado en el mercado de centros de datos (con la marca de producto Dragonfly) y en robótica (familia Dragonwing); cifras y plazo no indicados. — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU)
- (US) Según su director de marketing, la marca Snapdragon eleva los precios medios de venta (ASP) de Qualcomm porque los consumidores la perciben como premium; cifra no indicada. — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU)
- (US) Según la propia compañía, más de 2.500 millones de huéspedes se han alojado en Airbnb desde 2008, en casi todos los países del mundo. — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs)
- (US) Airbnb quiere ampliar su negocio del alojamiento a todo el viaje (experiencias, servicios bajo demanda) para vender más a clientes existentes, que viajan solo unas pocas veces al año; las Experiences lanzadas en 2016 no tuvieron tracción. — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs)
- (US) SpaceX trasladó su sede a Texas en 2024, Elon Musk anunció la mayor OPV de la historia con campana en el nuevo NASDAQ de Texas, su cotización hiperinflada ha empezado a bajar y Starlink es ya su principal fuente de ingresos; cifras de la OPV no indicadas. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (US) TMRW Sports (golf y flag football profesional, con PGA Tour, LPGA y NFL) sigue un modelo de baja intensidad de capital: en lugar de construir 20 estadios, un único recinto de 75 millones de dólares y propiedad de la economía a nivel de liga. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (FR) La economía de influencers superó los 33.000 millones de dólares el año pasado y los microinfluencers generan engagement casi triple que los macroinfluencers; L'Oréal trabaja con cerca de medio millón de creadores. — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0)
- (FR) Los LLM y chatbots se convierten en la puerta de entrada al descubrimiento de belleza (OpenAI llegaría a 1.000 millones de usuarios en 2026); L'Oréal busca posicionarse en la capa de respuestas con 280.000 profesionales sanitarios y 850 publicaciones como respaldo de autoridad. — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0)
- (FR) L'Oréal decidió no usar caras, cuerpos, pelo o piel realistas generados por IA para mostrar beneficios del producto en su comunicación externa, y limita la IA a fondos y automatización de producción de contenido; plazo no indicado. — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0)
- (US) Athletic tiene un conocimiento de marca de solo ~25% a nivel nacional y una distribución inferior al 40%, lo que limita su crecimiento actual; año de medición no indicado. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)
- (US) Más de tres de cada cuatro consumidores que prueban Athletic siguen comprándola, y más del 30% de quienes compran en el pasillo de cerveza sin alcohol no lo habían pisado en seis meses; causa no indicada. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)

<a id="sector-externo-balanza-pagos"></a>
### 2. Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas

El usuario ve cuenta corriente, composición de entradas de divisas (exportaciones, remesas, turismo, ayuda), deuda externa y programas del FMI, posición inversora internacional, tenedores extranjeros de su deuda por origen, intervenciones cambiarias y flujos financieros de retorno.

- **Por qué importa para invertir:** Los países que dependen de financiación externa sufren crisis de divisa y control de capitales que hunden el valor en moneda fuerte de cualquier inversión local.
- **Prioridad:** alta · **Ficha:** finanzas-publicas-soberanas · **Fuente de datos:** IMF BOP/IIP y CPIS, World Bank IDS y WDI, US Treasury TIC, IMF MONA (programas), OECD DAC (ayuda), UN Tourism.
- **Datos:** Nuevo lib/macro/imf-bop-client.ts (BOP e IIP) + ampliar world-bank-client.ts (BN.CAB.XOKA.GD.ZS, DT.ODA.ODAT.GN.ZS, BX.TRF.PWKR.CD.DT, ST.INT.RCPT.CD, deuda externa IDS); nuevo lib/data/external-accounts.json para tenencias por origen (TIC/CPIS) y programas FMI.
- **Servicio:** Nuevo lib/services/sovereign-finances/external-accounts.ts (vulnerabilidad externa, dependencia de ayuda).
- **API:** Ampliar app/api/macro/[country] con bloque external.
- **Interfaz:** Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
- **Conecta con:** salud-fiscal-soberana, regimen-credito-tipos, clima-inversion-extranjera, megaproyectos-infraestructura, score de empresas (tras calibración)

**Hechos que la justifican:**

- (—) En 2025 las economías con superávit por cuenta corriente sumaron unos 2,5 billones de dólares, con déficits equivalentes en el lado opuesto; la brecha es la mayor desde 2008, con causa vinculada al auge de la IA según el video. — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (US) Los inversores extranjeros poseen ya el 20 % de toda la renta variable estadounidense, con el capital concentrado en pocas empresas tecnológicas por el auge de la IA; año del dato y reparto por país de origen no indicados. — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (—) Las inversiones transfronterizas crecieron del 27 % del PIB mundial en 1980 al 141 % en 2008, pero desde la crisis financiera se han estancado pese a haber más dinero que nunca. — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (KR, JP, TW, US) Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses y financian así el propio boom de IA (flujo circular); cuantía y plazo no indicados. — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (CU) Las brigadas médicas cubanas en el extranjero, que en momentos álgidos superaron los 24.000 médicos, aportan más de 4.000 millones de dólares a la economía, la mayor fuente individual de divisas de Cuba; año no indicado, causa: exportación estatal de servicios profesionales. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (PK) Pakistán es el cuarto mayor deudor del FMI, solo por detrás de Argentina, Ucrania y Egipto, y depende de financiación externa; fecha de la clasificación no indicada. — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (US) El presupuesto de USAID era solo el 0,6-0,7% del presupuesto federal de EE. UU. cada año, por lo que su desmantelamiento ahorra poco frente a su coste en influencia exterior; plazo del desmantelamiento no indicado. — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM)
- (US, KE) Al retirarse USAID de Kenia quedaron 26 proyectos de agua y saneamiento (WASH) en curso que costarían unos 2 millones de dólares terminar, dejando infraestructura a medias y mayores riesgos de inundación; fecha de la retirada no indicada. — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM)
- (US) Al menos 80 programas adicionales de agua fueron cancelados en el mundo, programas que debían llevar agua a al menos 11 millones de personas; fecha de cancelación y países afectados no indicados. — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM)
- (US, CN) Un defensor de los recortes sostiene que los países receptores aceptan un trato más transaccional, como el que ya tienen con China, y que el 'soft power' de EE. UU. es una narrativa de los medios; el reportaje sugiere en cambio pérdida de credibilidad estadounidense; cifras y plazo no indicados. — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM)
- (JP, US) El yen cotizó por encima de 160 por dólar en julio de 2026, cerca de su mínimo en cuatro décadas, y Japón y el Tesoro de EE. UU. intervinieron de forma coordinada por primera vez en unos 15 años; Bessent dice que no dudará en volver a hacerlo. Japón posee más de un billón de dólares en deuda estadounidense; causa no indicada. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (CU) Las llegadas de turistas a Cuba el último año fueron las más bajas fuera de los años de Covid en dos décadas; se cerraron hoteles, se suspendieron transacciones con tarjeta y se cancelaron vuelos por falta de combustible; causa: crisis de combustible y recuperación incompleta tras la pandemia. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (HK, CN) Los residentes de Hong Kong hacen más de 90 millones de viajes al año a Shenzhen, desplazando gasto de los comercios locales, por lo que los alquileres de las tiendas de MTR se ajustan a la baja; año de la cifra no indicado. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)

<a id="balance-energetico-dependencia"></a>
### 3. Balance energético y dependencia de importaciones por proveedor

Por país el usuario ve producción, consumo y déficit por combustible, de qué proveedores importa y en qué cuota, días de reservas estratégicas, infraestructura transfronteriza (gasoductos, interconexiones, nucleares) y acuerdos de cooperación o topes de precio.

- **Por qué importa para invertir:** La dependencia de un proveedor concreto convierte una crisis diplomática o una sanción en un shock de costes para toda la industria del país; es la vía más directa por la que la geopolítica llega a los márgenes.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** IEA World Energy Balances, Energy Institute Statistical Review, JODI Oil/Gas, Eurostat, UN Comtrade (HS 27), Global Energy Monitor (gasoductos y proyectos).
- **Datos:** Nuevo lib/data/energy/energy-balance.json: {country, combustible, produccion, consumo, importaciones[{proveedor, cuota}], reservas_dias, infra_transfronteriza[], proyectos_estrategicos[], acuerdos[]}. country-resources.json sigue con producción.
- **Servicio:** Nuevo lib/services/energy/energy-security-service.ts (dependencia por proveedor, escenarios de corte).
- **API:** Nuevo app/api/energy/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
- **Conecta con:** engine/relations/model/flow.py (dependencia como flujo bilateral), engine/relations/model/measures.py (sanciones energéticas), logistica-chokepoints-corredores, transmision-shocks-energia-inflacion, lib/data/country-resources.json

**Hechos que la justifican:**

- (CU) Cuba produce unos 40.000 barriles diarios de crudo, muy por debajo de lo necesario para hacer funcionar con normalidad su red eléctrica, que depende del petróleo; consumo total y año no indicados, causa del déficit: producción interna insuficiente. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (CN) China recortó sus importaciones de crudo en 4-5 millones de barriles diarios, hasta el nivel más bajo en unos ocho años, pausando el almacenamiento estratégico; fue el mayor amortiguador del precio durante el cierre de Ormuz. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (US) La AIE coordinó una liberación de reservas globales de unos 400 millones de barriles que entraron al mercado con poca antelación durante el cierre de Ormuz, con EE. UU. aportando volúmenes de su reserva estratégica y alcanzando exportaciones récord de crudo; plazo exacto no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (JP) Japón depende en gran medida del petróleo de Oriente Medio y la guerra de EE. UU. e Israel con Irán encareció energía y materiales, incluso interrumpiendo el suministro de tinta para envases; el gobierno subvenciona combustible y diversifica proveedores; cifras no indicadas. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (CU, US, MX, VE) Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (IN, RU) El crudo ruso alcanzó casi el 56% de las importaciones totales de petróleo de India en julio de 2026, unos 6.400 millones de dólares al mes, frente a prácticamente cero antes de 2022; causa implícita: crudo ruso con descuento tras las sanciones occidentales por la guerra de Ucrania (el video no detalla el descuento). — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (DE, RU) Rusia suministraba cerca de la mitad de la demanda de gas natural de Alemania; el corte de ese suministro elevó los costes energéticos muy por encima de los de EE. UU. y China y golpeó a los sectores intensivos en energía; plazo preciso no indicado. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (PK, IR) Una mejora de relaciones entre EE. UU. e Irán podría desbloquear el gasoducto Irán-Pakistán, estancado desde hace tiempo y que aliviaría la crisis energética pakistaní; la reanudación del conflicto lo aplaza (plazo no indicado). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (IN, RU) La central nuclear de Kudankulam (Tamil Nadu), proyecto emblemático ruso-indio con Rosatom como constructora, es muy cara y se ha retrasado por la guerra de Ucrania, pero avanza y es pieza clave de la diversificación energética india hacia la energía nuclear; coste y fecha de finalización no indicados. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (US, RU) La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten; plazo no indicado. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

<a id="sistema-electrico-pais"></a>
### 4. Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima

El usuario ve capacidad instalada y adiciones anuales por tecnología, factor de utilización y curtailment, almacenamiento y transmisión, papel del carbón como respaldo, operadores de red, reformas del mercado y un comparador del precio de electricidad industrial entre países, con su sensibilidad al calor y la sequía.

- **Por qué importa para invertir:** El coste y la fiabilidad de la electricidad deciden dónde se instalan fábricas y centros de datos y quién gana en renovables, redes y almacenamiento; una red saturada es un límite físico al crecimiento.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** Ember (capacidad, generación, precios), IEA, IRENA, ENTSO-E / EIA (curtailment y transmisión), Eurostat (precios industriales), reguladores nacionales.
- **Datos:** Nuevo lib/data/energy/power-system.json: {country, capacidad_por_tecnologia, adiciones_anuales, factor_utilizacion, curtailment_pct, almacenamiento_gw, km_transmision, precio_industrial_eur_mwh, sensibilidad_calor_sequia, reformas[]}. Reutiliza renovable/nuclear de natural-resources.json.
- **Servicio:** Nuevo lib/services/energy/power-system-service.ts (comparador de precios y margen de reserva).
- **API:** Nuevo app/api/energy/[code]/power/route.ts.
- **Interfaz:** Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
- **Conecta con:** balance-energetico-dependencia, centros-datos-ia, riesgo-climatico-fisico, lib/data/natural-resources.json, score de empresas (tras calibración)

**Hechos que la justifican:**

- (CN) China añadió en 2025 más de 500 GW de capacidad eléctrica en 12 meses, equivalente a todo el sistema eléctrico de la India (causa no indicada). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) En China la capacidad instalada de solar y eólica ronda el 50%, pero su generación apenas supera el 20%, por el recorte (curtailment) de energía renovable; en el primer semestre de 2026 la energía desperdiciada podría haber abastecido a Francia. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) China es líder mundial en almacenamiento en baterías: aumentó su capacidad de ion-litio un 84% entre 2024 y 2025 y tiende miles de km de líneas de larga distancia desde el Gobi a los centros urbanos, pero ambos activos están infrautilizados. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) Pekín se ha comprometido a tener un mercado eléctrico nacional unificado en 2030, rompiendo las barreras provinciales y pasando de un despacho controlado por la red a mercados mayoristas (avance actual no indicado). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) La red china la operan un par de gigantes estatales con despacho centralizado a la antigua y cada provincia es responsable de su propio suministro, lo que impide compartir energía en picos de demanda. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) El carbón sigue siendo difícil de apagar en China, que es con diferencia el mayor consumidor y productor mundial, y parte de su generación está bloqueada en contratos anuales, lo que fuerza recortes de renovables a final de año. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) China apuesta por IA, robótica y manufactura avanzada, que requieren mucha energía, para crear una capa de electricidad limpia casi infinita y barata como ventaja competitiva industrial (cifras y plazo no indicados). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (GB) Reino Unido tiene la energía más cara del mundo desarrollado, un factor de política interna que pesa sobre la economía al margen del Brexit; cifras y causa exacta no indicadas. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (FR, ES, DE) El calor reduce el caudal de los ríos, lo que baja la generación hidroeléctrica, y limita la refrigeración de las centrales nucleares, que necesitan mucha agua; ambos efectos tensionan un sistema eléctrico europeo ya precario por Ucrania e Irán. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (DE, FR, ES, GB) El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado). — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)

<a id="registro-minas-minerales-criticos"></a>
### 5. Registro global de minas y proyectos de minerales críticos

El usuario ve cada mina o proyecto de minerales críticos con país, operador, etapa, ley del mineral, tecnología de extracción, participación estatal, acuerdos bilaterales y la brecha entre extracción y procesamiento de la cadena completa.

- **Por qué importa para invertir:** Quién controla la mina y el refino decide la seguridad de suministro de baterías, chips y defensa; permite ver qué proyectos son viables y qué gobiernos pueden intervenir en ellos.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** USGS Mineral Commodity Summaries, S&P Capital IQ Pro Metals & Mining (si licencia), Benchmark Mineral Intelligence, informes NI 43-101/JORC de las mineras, IEA Critical Minerals Data Explorer.
- **Datos:** Nuevo lib/data/critical-commodities/mines.ts: {mina, country, coords, mineral, operador, etapa, ley, tecnologia, participacion_estatal, offtake, acuerdos_bilaterales[]}; registrar en critical-commodities-registry.ts.
- **Servicio:** Nuevo lib/services/country-resources/mine-registry-service.ts (brecha extracción/refino por país usando trade-dag/ev-battery.ts).
- **API:** Ampliar app/api/resources con ?country=&mineral=&level=mine.
- **Interfaz:** Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
- **Conecta con:** lib/data/trade-dag/ev-battery.ts, concentracion-precios-materias-primas, engine/relations/model/measures.py (acuerdos y restricciones de exportación), licencia-social-permisos, conflicto-armado-control-territorial

**Hechos que la justifican:**

- (—) La oferta de cobre es estructuralmente limitada: no se descubren minas nuevas fácilmente, abrir una cuesta mucho dinero y años, y la mayoría de mineras son reacias a invertir miles de millones; cifras concretas y plazo no indicados. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (US) La mina Carlota (EE. UU.) produce un 60 % menos cobre que en su pico y, salvo que se actúe, cerrará a finales de la década porque se agota. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (—) El cobre que queda en la superficie está atrapado en menas de baja ley (0,25-0,3 % de cobre) y los métodos tradicionales recuperan aproximadamente la mitad; plazo no indicado. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (—) La lixiviación en pilas tradicional recupera solo un 20-50 % del cobre, y la biominería (microbios) de empresas como Endolith busca elevar esa recuperación sin abrir minas nuevas, aunque aún no está probada a escala real. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (US) El distrito minero de Ambler (Alaska) alberga, según los promotores, algunos de los mayores depósitos de cobre y zinc de EE. UU., ligados al esfuerzo del país por competir con China en minerales críticos; cifras de reservas no indicadas. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (US) El proyecto Ambler depende de una carretera de grava de 211 millas cuyo coste puede alcanzar miles de millones de dólares y cuya financiación es incierta, lo que alimenta la oposición local y las dudas de los contribuyentes. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (US) El valor real de los depósitos minerales de Ambler no está verificado, por lo que la rentabilidad del proyecto sigue siendo especulativa; sin cifra ni plazo indicados. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (US) El gobierno de EE. UU. invierte 35,6 millones de dólares en Trilogy Metals (TMQ) a cambio del 10 % de la empresa y concede el permiso del proyecto Ambler, que la administración Biden había bloqueado repetidamente; fecha no indicada, causa: política industrial de minerales críticos. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (US, CN) Trilogy dijo en 2023 que enviaría el concentrado de cobre y zinc a un puerto asiático; con el proyecto presentado ahora como iniciativa America First, el destino final del mineral es incierto y los críticos temen que acabe en China; plazo de decisión no indicado. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (PK, US) A finales de 2025 EE. UU. y Pakistán firmaron un memorando para invertir en los minerales críticos pakistaníes (monto no indicado; causa no indicada). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)

<a id="riesgo-climatico-fisico"></a>
### 6. Capa de riesgo climático físico por país

El usuario ve por país la exposición a calor extremo, sequía, inundación, ciclones y desastres, sus pérdidas económicas estimadas, la brecha de protección aseguradora y el coste de adaptación; una capa del mapa colorea el riesgo y lo cruza con instalaciones y cultivos.

- **Por qué importa para invertir:** El clima físico destruye activos, corta producción agrícola y presiona las cuentas públicas; saber qué países y regiones están expuestos y mal asegurados evita invertir en empresas cuyos activos o proveedores pueden quedar fuera de servicio.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** ND-GAIN, INFORM Risk (JRC), EM-DAT, World Bank Climate Change Knowledge Portal, Swiss Re sigma (brecha aseguradora), NGFS (escenarios), FAO (cultivos).
- **Datos:** Nuevo lib/data/climate-risk/physical-risk.json: {country, amenazas[{tipo, indice, tendencia}], perdidas_pct_pib, brecha_aseguradora_pct, coste_adaptacion_pct_pib, cultivos_expuestos[], escenarios_calor[], fuente, fecha}.
- **Servicio:** Nuevo lib/services/climate-risk/climate-risk-service.ts (normaliza índices, calcula exposición de instalaciones de corporate-facilities por coordenadas y escenarios de impacto en PIB).
- **API:** Nuevo app/api/climate-risk/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
- **Conecta con:** lib/data/corporate-facilities (exposición por instalación), lib/data/country-resources.json (producción agrícola), finanzas-publicas-soberanas (pasivos contingentes climáticos), sistema-electrico-pais (estrés térmico de la red), logistica-chokepoints-corredores (riesgo hidrológico), score de empresas (tras calibración)

**Hechos que la justifican:**

- (IN) India sufre su peor monzón desde el último El Niño: tuvo el quinto junio más seco registrado, seguido de una inundación en julio que concentró la lluvia de un mes en una semana; impacto en cosecha e inflación no indicado. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (—) El Niño de 1982-83 redujo la productividad económica mundial en 4,1 billones de dólares y el de 1997-98 en 5,7 billones (estimaciones de estudios citados en el video); plazo del impacto: largo plazo; causa: eventos ENSO que alteran clima y cosechas, aunque el video no detalla el mecanismo; los episodios recientes podrían costar más. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (FR, ES) Incendios forestales en Europa Occidental han obligado a más de 300.000 personas a abandonar sus hogares en Francia y España, con estado de emergencia; fecha exacta y causa del brote no indicadas en el hallazgo (el video lo enmarca en el contexto del Super El Niño). — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (BR) Los científicos advierten de que la deforestación continuada podría desencadenar un punto de inflexión del Amazonas en la década de 2030. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (MM) Un terremoto de magnitud 7,7, el mayor de Myanmar en un siglo, mató según la junta a unas 1.700 personas (cifra oficial inicial, tres días después del sismo) y agravó la crisis del país; fecha exacta no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (DE, FR, ES, IT, GB) Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (DE, FR, ES, IT) La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (FR, ES, DE, GB) Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025). — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (CI, GH) África Occidental, foco de producción de cacao, ya muestra impactos de El Niño en el crecimiento y el rendimiento del cultivo, lo que afectará a los precios en 2027 y a la calidad; el El Niño de 2023-2024 provocó varios picos de precio del cacao. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)

<a id="logistica-chokepoints-corredores"></a>
### 7. Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores

El simulador de chokepoints pasa de bloqueo sí/no a porcentaje de tráfico con curva de recuperación, muestra rutas alternativas con su capacidad real, peajes y primas de seguro de guerra, y añade vías fluviales interiores, corredores terrestres y la transición de combustibles y electrificación de puertos.

- **Por qué importa para invertir:** La mayoría de disrupciones son parciales y duraderas, no cierres totales; medir capacidad de desvío y coste extra de flete permite estimar el impacto real en márgenes de importadores, navieras y productores que dependen de una ruta.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** IMF PortWatch (tránsitos diarios), Autoridad del Canal de Panamá (calado y tránsitos), Lloyd's List / Joint War Committee (primas), UNCTAD, IMO (normativa de emisiones), Rhine/Mississippi gauges (USACE, WSV).
- **Datos:** Ampliar lib/services/maritime-chokepoints/chokepoints-data.ts (capacidad_pct, nivel_agua, peaje, prima_seguro_guerra) y trade-routes-data.ts (rutas alternativas con capacidad); nuevos inland-waterways-data.ts y land-corridors-data.ts en la misma carpeta; normativa de emisiones marítimas en presets-data.ts.
- **Servicio:** Ampliar lib/services/maritime-chokepoints/simulation-engine.ts y freight-calculations.ts (bloqueo parcial, curva de recuperación, desvío limitado por capacidad) vía maritime-chokepoint-service.ts.
- **API:** Nuevo app/api/chokepoints/[id]/route.ts (estado actual y simulación) + app/api/dev/port-congestion y baltic-dry-index existentes.
- **Interfaz:** ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
- **Conecta con:** lib/services/maritime-chokepoints/sector-profiles-data.ts, balance-energetico-dependencia, riesgo-climatico-fisico, transmision-shocks-energia-inflacion, score de empresas (tras calibración)

**Hechos que la justifican:**

- (PA) La sequía asociada a El Niño redujo el tráfico del Canal de Panamá en 2024 y este año (2026) la Autoridad del Canal ya aplica límites de carga para conservar agua, lo que afecta a los flujos de GNL y a los precios de la energía; cifras no indicadas. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (SA, AE) Los oleoductos de desvío (Arabia Saudí hacia el Mar Rojo y Emiratos hacia Fujairah) compensaron unos 6 millones de b/d durante el cierre de Ormuz; los EAU rinden unos 1,5 millones de b/d y planean llegar a 3 millones a finales de 2027, dando más peso a los puertos de Fujairah y Yanbu. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (IR) Algunos buques han pagado hasta 2 millones de dólares para cruzar Ormuz durante el conflicto; se debate un régimen de peajes y quién vigila el estrecho tras el conflicto; plazo no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (IR) La presencia de minas hizo que armadores y propietarios de carga evitaran Ormuz incluso tras el acuerdo de paz interino, porque sacar buques es más fácil que volver a meterlos; la línea base citada es de 120-130 buques diarios y el plazo de recuperación no se indica. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (DE) El Rin, por donde circula cerca del 80% de las mercancías transportadas por barco en Alemania, registra en 2026 un nivel de agua medio aún inferior al de la ola de calor de 2018, lo que amenaza la logística industrial alemana. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (BR, BO) Brasil respaldó formalmente carreteras y un puente fluvial que conectan con Bolivia, a mayor escala de lo sugerido antes, incluida la ruta hacia San Ignacio; más del 90% de la deforestación amazónica ocurre junto a carreteras; fecha del respaldo no indicada. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (—) El transporte marítimo internacional emitió en 2024 unos 740 millones de toneladas de CO2 equivalente, cerca del 1,4% de las emisiones globales, más que Alemania o Corea del Sur. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (UY) Uruguay invirtió además 20 millones de dólares en un proyecto de mejoras de red y carga para barcos en el puerto de Colonia (plazo no indicado). — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (—) Las baterías no sirven para el transporte oceánico de larga distancia, que seguirá dependiendo de combustibles alternativos (hidrógeno, quizá nuclear); solo los ferris y las rutas cortas se electrifican. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)

<a id="salud-fiscal-soberana"></a>
### 8. Salud fiscal soberana: deuda, intereses, financiación y política fiscal

El usuario ve la trayectoria de la deuda pública, carga de intereses, necesidades de financiación y compradores de la deuda, espacio fiscal, reglas y medidas fiscales anunciadas con su impacto, rigidez presupuestaria y subsidios.

- **Por qué importa para invertir:** Un Estado con poco espacio fiscal sube impuestos, recorta gasto o presiona a la banca; afecta a tipos, divisa y a las empresas que dependen del gasto público.
- **Prioridad:** alta · **Ficha:** finanzas-publicas-soberanas · **Fuente de datos:** IMF WEO y Fiscal Monitor, World Bank WDI, OECD, Treasury TIC, IMF Fossil Fuel Subsidies, ministerios de hacienda.
- **Datos:** lib/data/sovereign-public-finances.json (ficha) con deuda, déficit, intereses/ingresos, necesidades_financiacion, tenedores, reglas_fiscales, medidas[{fecha, importe, impacto_deuda}], subsidios_combustible; ampliar lib/macro/world-bank-client.ts y nuevo lib/macro/imf-weo-client.ts.
- **Servicio:** lib/services/sovereign-finances/ (ficha): nuevo fiscal-health.ts (espacio fiscal, sensibilidad del coste de deuda).
- **API:** Ampliar app/api/macro/[country] con bloque fiscal.
- **Interfaz:** SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
- **Conecta con:** regimen-credito-tipos, sector-externo-balanza-pagos, riesgo-politico-interno, lib/services/geopolitical/hard-country-engine, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US) La succión de capital hacia la IA dificulta la colocación de bonos del Tesoro de EE. UU., que ya paga 1 billón de dólares anuales en intereses sobre más de 40 billones de deuda; año del dato no indicado. — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (JP) La deuda pública de Japón supera el doble de su PIB y su servicio absorbe alrededor de una quinta parte del presupuesto anual; financiar el plan de 370 billones exigiría emitir más bonos; cifra de emisión adicional no indicada. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (GB) La deuda pública británica ronda el 94-96 % del PIB (44 % en 1979) y el pago de intereses cuesta aproximadamente una vez y media el presupuesto de defensa; fecha de la cifra no indicada, causa no indicada. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (BR) La deuda pública de Brasil, que había bajado tras la pandemia, vuelve a crecer y el FMI estima que superará el 100% del PIB a finales de la década; el servicio de la deuda supera el 8% del PIB debido a los tipos de interés de doble dígito. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (GB) Si los mercados perciben que Burnham se endeuda de forma irresponsable para financiar sus promesas, cobrarán más por la deuda del Reino Unido, lo que limita su margen de maniobra; cifra y plazo no indicados. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (DE) El canciller Merz relajó el freno a la deuda (Schuldenbremse) y lanzó un gran paquete de gasto en defensa e infraestructura cuyo impacto tardará en llegar a la economía; tamaño del paquete y plazo exacto no indicados. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (JP) Takaichi se compromete a bajar el impuesto al consumo sobre alimentos y bebidas sin alcohol del 8% al 1% durante dos años desde abril de 2027, lo que preocupa a los mercados por el aumento de la deuda pública. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (BR) Más del 50% del presupuesto federal brasileño se destina a pensiones y gasto obligatorio constitucional, algo que no se puede recortar; el gobierno de Lula impulsa gasto social (Bolsa Familia) que puede alimentar la inflación, mientras su rival Flavio Bolsonaro promete reformar las reglas fiscales con pocos detalles; plazo electoral no indicado. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (NG) Una auditoría del programa de subsidio a la gasolina importada en Nigeria halló unos 2.400 millones de dólares en fraude; año de la auditoría y causa estructural no indicados. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)

<a id="ciclo-inversion-ia"></a>
### 9. Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja

El usuario ve el capex de hiperescaladores y sus compromisos de infraestructura enlazados con proveedores, el peso de esa inversión en el PIB, precios y monetización de la IA, valoraciones de privadas de IA, el debate borde frente a nube y un escenario de estrés si se corrige la burbuja.

- **Por qué importa para invertir:** Buena parte del crecimiento y de las bolsas depende hoy del gasto en IA; saber quién lo recibe y qué pasa si se frena es clave para chips, utilities, constructores y países exportadores.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** SEC 10-Q/10-K y earnings calls de hiperescaladores, BEA (inversión en equipos y software), Epoch AI, Artificial Analysis (precios de modelos), PitchBook/Crunchbase (valoraciones).
- **Datos:** Nuevo lib/data/ai-cycle/capex-commitments.json {empresa, trimestre, capex, guidance, proyectos[], proveedores[]} + pricing.json (precio por token) + private-valuations.json.
- **Servicio:** Nuevo lib/services/ai-cycle/ai-capex-service.ts (enlaza capex con proveedores vía trade-dag/semiconductors.ts y corporate-facilities; escenario de estrés con efecto en cartera y comercio).
- **API:** Nuevo app/api/ai-cycle/route.ts.
- **Interfaz:** Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
- **Conecta con:** centros-datos-ia, motor-causas-pib, lib/data/trade-dag/semiconductors.ts, mercado-bursatil-pais, score de empresas (tras calibración)

**Hechos que la justifican:**

- (KR, US) Amazon, Google, Meta y Microsoft gastaron 376.000 millones de dólares en capex en 2025 y van camino de 725.000 millones en 2026; los centros de datos demandan chips de memoria que dominan Samsung y SK Hynix. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (US) OpenAI se comprometió a pagar a Oracle unos 300.000 millones de dólares por construir una serie de centros de datos (proyecto Stargate), un contrato en la nube de una escala sin precedentes; plazo no indicado. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (US) La industria invierte alrededor de un billón de dólares solo este año en construir centros de datos, y probablemente centenares de miles de millones más en empresas del ecosistema de IA (año exacto no indicado en el hallazgo; causa: carrera por capacidad de IA). — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Según Bloomberg Economics, la inversión relacionada con IA aportó cerca de un punto porcentual al crecimiento del PIB de EE. UU. en 2025, aproximadamente la mitad del crecimiento total. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) Una caída fuerte de las valoraciones de IA podría golpear dos veces a las economías asiáticas: por la desvalorización de sus activos en EE. UU. y por el deterioro de su balanza comercial y economía; magnitud y plazo no indicados (escenario, no dato). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (CN, US) Un mismo sitio web cuesta unos 50 USD con un modelo cerrado estadounidense frente a 12 USD con Kimi K3 chino (una cuarta parte); el nuevo GPT 5.6 Luna de OpenAI lo hace por poco más de 4 USD, igualando a las alternativas chinas baratas. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (CN) China impulsa modelos de pesos abiertos, que aceleran la difusión y cierran la brecha, pero tienen problemas de monetización: guerra de precios durante más de un año y consumidores chinos poco dispuestos a pagar. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (US) OpenAI está valorada en 852.000 millones de dólares tras cerrar una ronda de 122.000 millones para sus chips, centros de datos y talento, y Anthropic negocia captar 30.000 millones a una valoración de 900.000 millones (fechas de las rondas no indicadas). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) Qualcomm defiende que la IA en el dispositivo (edge) ahorra costes frente a la IA en la nube, cuyo coste de tokens y capex de los hiperescalares se traslada al usuario; cifra no indicada. — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU)

<a id="clima-inversion-extranjera"></a>
### 10. Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación

El usuario ve la serie de IED del país, las restricciones por sector (incluidos límites a capital institucional y compras de tierra), el registro fechado de reformas liberalizadoras o nacionalizadoras y el riesgo de nacionalización de utilities y sectores regulados.

- **Por qué importa para invertir:** Determina si un inversor extranjero puede entrar, quedarse y repatriar; un giro nacionalizador destruye valor de un día para otro.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** OECD FDI Regulatory Restrictiveness Index, UNCTAD Investment Policy Hub y World Investment Report, Land Matrix (tierra), World Bank WDI.
- **Datos:** Nuevo lib/data/investment-climate/fdi-regime.json: {country, restricciones[{sector, limite_pct}], reformas[{fecha, tipo, direccion}], nacionalizaciones[]}; serie IED en lib/macro/world-bank-client.ts (BX.KLT.DINV.WD.GD.ZS).
- **Servicio:** Nuevo lib/services/investment-climate/investment-climate-service.ts (dirección del régimen: liberalizador / nacionalizador).
- **API:** Nuevo app/api/investment-climate/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/InvestmentClimateSection.tsx.
- **Conecta con:** seguridad-juridica-instituciones, riesgo-politico-interno, sector-externo-balanza-pagos, score de empresas (tras calibración)

**Hechos que la justifican:**

- (BO) La Constitución boliviana limita la propiedad de tierra por extranjeros a 5.000 hectáreas (salvo propietarios anteriores a la nueva constitución), pero se evade comprando a través de empresas locales; fecha de la constitución no indicada. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (US) La NFL limita al 10 % la participación de capital privado en un equipo y solo unas cinco firmas están aprobadas como fuente de financiación; causa de la norma y plazo no indicados. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (GB) Nacionalizar el agua en Reino Unido, aun recibiendo Thames Water gratis, obligaría al Estado a financiar con miles de millones de libras la inversión necesaria que hoy aportan inversores privados; plazo no indicado. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (GB) Se baraja la nacionalización de British Steel, en dificultades, y Burnham quiere una estrategia industrial doméstica con reindustrialización, aunque no hay una gran bolsa de dinero; plazo no indicado. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (GB) El primer ministro británico Andy Burnham plantea romper con cuatro décadas de ortodoxia de libre mercado, incluida la derogación del veto thatcheriano a la propiedad pública de las compañías de agua; plazo y causa no indicados. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (CU) El gobierno cubano aprobó más de 170 reformas económicas que abren la puerta a la inversión privada, con más de 9.200 pymes y un sector privado que emplea una parte creciente de la fuerza laboral; fecha exacta y cifra de empleo privado no indicadas. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (KR) El presidente Lee Jae Myung impulsa el paso de la inversión en vivienda a mercados financieros y ha aprobado reformas de protección al accionista minoritario y gobierno corporativo; su popularidad queda ligada a la bolsa; fecha exacta no indicada. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (BR, BO) El magnate de la soja Eraí Maggi (Bom Futuro) habría depositado por una finca selvática de 30.000 hectáreas en San Ignacio de Velasco, Bolivia, y planea invertir con una nueva carretera Brasil-Bolivia; monto y fecha del depósito no indicados. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (PK) La inversión extranjera directa en Pakistán lleva estancada unas dos décadas; cifra no indicada. — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)

<a id="capacidad-tecnologica-innovacion"></a>
### 11. Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)

El usuario compara países por capacidad tecnológica sectorial: empresas y modelos de IA, cuota de adopción, gasto e investigadores de I+D, política científica, clústeres universitarios, flujos de capital riesgo y startups por frente tecnológico.

- **Por qué importa para invertir:** Indica qué países producirán las empresas ganadoras de la próxima década y dónde se concentran talento y capital.
- **Prioridad:** media · **Ficha:** arbol-tecnologico-historico · **Fuente de datos:** UNESCO UIS y OECD MSTI (I+D), WIPO (patentes), Stanford AI Index, Epoch AI, OECD.AI, Crunchbase/Dealroom (capital riesgo), Microsoft AI Diffusion Report.
- **Datos:** Ampliar lib/data/tech-tree/ con indicadores actuales por país {gerd_pct_pib, investigadores, patentes, modelos_ia, adopcion_ia, vc_por_sector, startups[], clusteres[]}.
- **Servicio:** Ampliar lib/services/tech-tree/ con comparador país vs. país por sector.
- **API:** Promover app/api/dev/tech-tree a app/api/tech-tree/[code]/route.ts.
- **Interfaz:** Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
- **Conecta con:** ciclo-inversion-ia, regulacion-sectorial-jurisdiccion, empresas-privadas-activos-alternativos, estructura-productiva-clusteres

**Hechos que la justifican:**

- (CN, US) En junio de 2026 el uso global de modelos de IA chinos superó por primera vez al de los estadounidenses; según OpenRouter, Singapur, Alemania y ya también EE. UU. usan más modelos chinos que estadounidenses; causa no indicada. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (CN) Prácticamente toda gran tecnológica china (Baidu, Alibaba, Tencent) tiene o entrena un modelo de IA, y las startups Moonshot, DeepSeek, Zhipu y MiniMax compiten agresivamente; Moonshot lanzó Kimi K3 de 2,8 billones de parámetros. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (CN, US) EE. UU. mantiene ventaja en modelos de frontera, cómputo y chips, y las empresas chinas de IA están limitadas por escasez de capital y valoraciones que son una fracción de las de las grandes de EE. UU.; cifras y plazo no indicados. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (US, CN) Mientras EE. UU. recorta la financiación científica, China aumenta su inversión en ciencia y su biotecnología se ha acelerado con apoyo estatal y ensayos en humanos más rápidos; Doudna ve posible que China tome la delantera al menos inicialmente (cifras y plazo no indicados). — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US) En tres años las nuevas subvenciones de la NSF de EE. UU. cayeron un 24% y unos 25.000 científicos y personal, cerca del 20% de la plantilla, han dejado las agencias federales de investigación, por los recortes federales de Trump a la ciencia. — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US) Según Doudna, cada dólar invertido por el NIH en investigación genera unos 2,50 dólares de beneficio económico (plazo y metodología no indicados). — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US) El Innovative Genomics Institute de Doudna ha generado 31 empresas con unos 9.000 millones de dólares de valoración conjunta y más de 2.500 empleos, sobre todo en California (plazo no indicado). — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US) La financiación a robots humanoides alcanzó 6.000 millones de dólares, cifra que Fei-Fei Li considera pequeña frente a lo invertido en coches autónomos o modelos de lenguaje; plazo y causa no indicados. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)
- (US) La inversión total en world models (IA que predice el mundo físico) ronda los 3.000 millones de dólares y sigue creciendo, y World Labs ha levantado unos 1.000 millones con un equipo de unas 50 personas; plazo no indicado. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)

<a id="perfiles-sectoriales-mercado"></a>
### 12. Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria

Para sectores sin cadena física clara (consumo, espacio, ligas deportivas, terapias avanzadas) el usuario ve tamaño de mercado por país, cuotas por empresa y marca, inversión y madurez y economía unitaria del sector.

- **Por qué importa para invertir:** Sitúa a una empresa frente a su mercado y competidores, lo que hace falta para juzgar si un evento en un país cambia su posición.
- **Prioridad:** baja · **Ficha:** bloomberg-originals-pais · **Fuente de datos:** Euromonitor / Statista (si licencia), informes anuales, Space Foundation, Deloitte Sports, IQVIA / ARM (terapias avanzadas); parte INFORMACIÓN INCOMPLETA.
- **Datos:** Nuevo lib/data/sector-markets/<sector>.json {sector, country, tamano_mercado, cuotas[{empresa, marca, pct}], inversion, madurez, fuente} (distinto de maritime-chokepoints/sector-profiles-data.ts, que mide exposición a rutas).
- **Servicio:** Nuevo lib/services/sector-markets/sector-market-service.ts.
- **API:** Nuevo app/api/sector-markets/[sector]/route.ts.
- **Interfaz:** Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
- **Conecta con:** ficha-empresa-ampliada, empresas-privadas-activos-alternativos, salud-consumidor-vivienda, lib/macro/sector-base-rates.ts

**Hechos que la justifican:**

- (US) Lectric vende 150.000 bicicletas eléctricas al año, un 50% más que su competidor más cercano en EE. UU.; año de la cifra no indicado. — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s)
- (US) El mercado de e-bikes de EE. UU. creció con fuerza entre 2015 y 2022 pero se estabilizó, y los fabricantes afrontan demanda débil, presión sobre precios y más competencia; cifras de caída no indicadas. — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s)
- (US) En la última década Athletic y su equipo han llevado la categoría de cerveza sin alcohol en EE. UU. de 100 millones a más de mil millones de dólares anuales de ingresos. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)
- (US) Athletic compite en cerveza sin alcohol contra los mayores cerveceros del mundo, tanto grandes grupos como internacionales, y es la marca líder en EE. UU. desde su fundación en 2017. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)
- (US) La economía espacial global está valorada en más de 650.000 millones de dólares y crece rápidamente; año de la cifra y causa del crecimiento no indicados. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (US) La inversión en la industria espacial alcanzó unos 55.000 millones de dólares el último año, más del doble del presupuesto anual de la NASA, que ronda los 24.000 millones; causa no indicada. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (US) La oficina de la liga (contratos de medios, convenios laborales) puede generar hasta el 75 % de la economía de la NFL; plazo y causa no indicados. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (US) La primera terapia CRISPR personalizada (bebé KJ, Hospital Infantil de Filadelfia, 2025) costó unos 800.000 dólares y se apoyó en financiación pública, colaboración académica y filantropía; Doudna dice que no puede escalar a millones de dólares por paciente. — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US) La mayoría de las terapias CRISPR actuales son ex vivo (extraer células, editarlas y reinfundirlas), caras y poco prácticas; el cuello de botella es la entrega in vivo, y Doudna espera avances en tres años si bajan los costes con fabricantes más baratos. — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)

<a id="comercio-bilateral-producto"></a>
### 13. Matriz de comercio bilateral por producto, centralidad y fragmentación

Al abrir un par de países el usuario ve comercio por producto y balanza, cuota de cada socio en exportaciones e importaciones, comercio de servicios y digital, integración del bloque regional, centralidad o aislamiento comercial del país y su estatus en la OMC.

- **Por qué importa para invertir:** Mide cuánto depende un país de otro y en qué productos, que es lo que determina quién sufre ante aranceles, sanciones o rupturas diplomáticas.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** CEPII BACI, UN Comtrade, OECD-WTO TiSMoS / BaTIS (servicios), WTO (estatus y disputas), IMF DOTS.
- **Datos:** Nuevo lib/data/trade/bilateral-trade.json (BACI HS6 agregado: {exporter, importer, hs, valor, año}) + services-trade.json.
- **Servicio:** Nuevo lib/services/trade/bilateral-trade-service.ts (cuotas, balanza, centralidad de red, integración por bloque con bloc_memberships.json).
- **API:** Nuevo app/api/trade/[code]/route.ts (?partner=).
- **Interfaz:** Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
- **Conecta con:** engine/relations/model/flow.py, engine/relations/model/bloc_memberships.json, lib/services/geopolitical/tier-n-evaluator, lib/services/geographic/friendshoring-service, aranceles-sanciones-controles

**Hechos que la justifican:**

- (DE, CN) El comercio Alemania-China pasó de superávit a déficit creciente: en 2025 las exportaciones alemanas de maquinaria y bienes industriales a China cayeron cerca del 10 % y las de coches más del 30 %, mientras suben las importaciones chinas (China Shock 2.0); causa no desglosada más allá de la competencia china. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (KP, CN) China concentra el 98 % del comercio de Corea del Norte y es su principal destino de exportación, fuente de importaciones y proveedor de energía; plazo no indicado y causa: aislamiento del régimen por las sanciones. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (IN, US, RU, CN) EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (GB) El mundo se divide en grandes bloques comerciales (UE, EE. UU., Asia) y Reino Unido queda aislado, con menos peso como puerta de acceso a Europa para EE. UU. y menos relevancia en la ONU; cifras y fechas no indicadas. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (ZA, NG, EG) África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano, porque exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021). — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (—) El comercio digitalmente entregado (cine, música, educación, salud) crece alrededor de un 6% anual y ronda los 4 billones de dólares dentro de un comercio mundial de unos 33 billones; periodo de medición no indicado, causa no indicada. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (—) Cerca del 25% del comercio mundial ya no se rige por las reglas de la OMC y alrededor de tres cuartas partes sí; fecha y causa de la fragmentación no indicadas. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (CN, IN, BR, US) China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)

<a id="riesgo-politico-interno"></a>
### 14. Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social

El usuario ve quién gobierna, su orientación y legitimidad, el calendario de elecciones y catalizadores (políticos y sectoriales) y un monitor de protestas e inestabilidad con episodios de reversión de políticas.

- **Por qué importa para invertir:** Elecciones y protestas cambian impuestos, regulación y contratos; anticipar el calendario permite posicionarse antes del evento.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** IFES ElectionGuide, ParlGov / V-Dem, ACLED (protestas), Carnegie Global Protest Tracker, GDELT.
- **Datos:** Nuevo lib/data/political/government.json (jefe de gobierno, orientación, coalición, próximas elecciones, catalizadores[]) + lib/data/political/unrest-events.json (protestas y reversión de políticas).
- **Servicio:** Nuevo lib/services/political/political-risk-service.ts.
- **API:** Nuevo app/api/political/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
- **Conecta con:** lib/services/prediction-markets (mercados electorales), salud-fiscal-soberana (calendario fiscal-electoral), app/api/dev/update-country-tension, score de empresas (tras calibración)

**Hechos que la justifican:**

- (BO) El nuevo presidente centrista boliviano Rodrigo Paz disolvió el Ministerio de Medio Ambiente, asignó la política ambiental a Planificación del Desarrollo (cuyo ministro tiene 25 años en la industria de soja) y pretende expandir la producción agrícola; fecha de la decisión no indicada. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (GB) Reino Unido ha tenido cinco primeros ministros desde el Brexit, con fragmentación del sistema de partidos, y Nigel Farage es el favorito para ganar las próximas elecciones y ser primer ministro; fecha de las elecciones no indicada. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (MM) El parlamento de Myanmar eligió presidente al jefe militar Min Aung Hlaing tras unas elecciones que la oposición considera un intento de legitimar al ejército; fecha no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (IN) El partido de Modi afronta el año próximo elecciones clave en Uttar Pradesh, el estado más poblado de India, donde el desempleo juvenil es una preocupación central; fecha exacta no indicada. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (US) El flag football será deporte olímpico en Los Ángeles 2028, en categorías masculina y femenina, y la NFL planea lanzar ligas profesionales masculina y femenina; fechas de lanzamiento de las ligas no indicadas. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (IN) El movimiento juvenil 'Cockroach' (CJP) forzó la dimisión del ministro de Educación Dharmendra Pradhan, la primera vez desde 2014 que un ministro de Modi dimite por presión pública, tras la filtración de un examen médico de acceso que afectó a 2,2 millones de candidatos. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (IN, NP, BD, ID) El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (BO) Paz aprobó una ley para convertir pequeñas fincas en medianas, pero tras protestas indígenas y campesinas (con gases lacrimógenos en La Paz) tuvo que revertirla, en medio de medidas de austeridad; fechas no indicadas. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)

<a id="mercado-bursatil-pais"></a>
### 15. Mercado bursátil por país: concentración, valoración, rendimientos y base inversora

El usuario ve los índices de cada país con su concentración en pocas empresas, señales de sobrecalentamiento (valoración frente a historia y PIB), rendimientos históricos y la estructura del inversor (minorista, por generación, preferencia por activos refugio).

- **Por qué importa para invertir:** Indica si el mercado de un país está caro o concentrado y quién lo mueve, lo que condiciona el riesgo de entrar en sus empresas.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** World Bank (capitalización/PIB), MSCI factsheets, Research Affiliates / Shiller (CAPE), WFE, encuestas de inversores (FINRA, Fed SCF).
- **Datos:** Nuevo lib/macro/equity-index-client.ts (índices, pesos top-10, CAPE, capitalización/PIB) + lib/data/equity-markets/investor-structure.json.
- **Servicio:** Nuevo lib/services/equity-markets/market-structure-service.ts.
- **API:** Nuevo app/api/equity-markets/[code]/route.ts.
- **Interfaz:** Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
- **Conecta con:** ciclo-inversion-ia, eventos-reaccion-mercado, salud-consumidor-vivienda, score de empresas (tras calibración)

**Hechos que la justifican:**

- (KR) Samsung y SK Hynix suponen más del 50% del KOSPI, por lo que el índice coreano se comporta casi como dos acciones y es muy vulnerable a un giro del ciclo de IA. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (KR) El KOSPI subió un 200% en 12 meses (más que triplicado), muy por encima del S&P y el Nasdaq. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (KR) 14 millones de inversores minoristas de 51 millones de habitantes participan en la bolsa coreana, muchos apalancados con ETFs x2/x3; el regulador coreano lamenta su lanzamiento. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (US) Una inversión en el S&P 500 hace diez años habría crecido de media un 15% anual, un nivel históricamente muy alto que alimenta la confianza de los inversores jóvenes y podría implicar valoraciones exigentes (causa del rendimiento no indicada). — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc)
- (US) El volumen de negociación en el mercado de opciones de EE. UU. marca récord tras récord en los últimos años, impulsado por inversores minoristas, antes un segmento dominado por fondos de cobertura y mesas profesionales (cifra concreta no indicada). — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc)
- (KR, US) Corea del Sur es conocida por la negociación minorista de ETFs apalancados, mientras que en Europa el apetito es más moderado y el ahorro se concentra históricamente en depósitos bancarios (cifras y plazo no indicados). — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc)
- (CN) Un estudio señala que la Generación Z china es más aversa al riesgo que otras generaciones chinas y tiende a invertir más en oro (cifras y plazo no indicados). — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc)

<a id="salud-consumidor-vivienda"></a>
### 16. Salud del consumidor y vivienda por país

El usuario ve deuda de los hogares y estrés de consumo, salarios reales y economía gig, consumo per cápita, mercado de vivienda (oferta, déficit, asequibilidad hipotecaria, inversores institucionales) y pagos digitales e inclusión financiera.

- **Por qué importa para invertir:** El consumidor sostiene la mayoría de ingresos de empresas de consumo, banca y construcción; un hogar endeudado o una vivienda inasequible anticipa caída de demanda.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** BIS (deuda de hogares, precios de vivienda), OECD, FRED, World Bank Global Findex, ILOSTAT (salarios reales), NY Fed Household Debt.
- **Datos:** Ampliar lib/macro/bis-client.ts (deuda de hogares/PIB, precios residenciales) y fred-series-map.ts; World Bank Findex en world-bank-client.ts.
- **Servicio:** Nuevo lib/services/consumer/consumer-health-service.ts.
- **API:** Ampliar app/api/macro/[country] con bloque household.
- **Interfaz:** DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
- **Conecta con:** demografia-mercado-laboral, regimen-credito-tipos, perfiles-sectoriales-mercado, score de empresas (tras calibración)

**Hechos que la justifican:**

- (BR) Más del 80% de los hogares brasileños tiene algún tipo de deuda y los tipos rotativos de las tarjetas de crédito superan el 400% anual, lo que alimenta el riesgo de desaceleración o recesión del consumo; año no indicado. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (BR) Las apuestas en línea, legalizadas en 2018, mueven hasta 30.000 millones de reales (5.800 millones de dólares) al mes según el Banco Central de Brasil, lo que agrava el sobreendeudamiento de los hogares. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (US) El precio mediano de la vivienda en EE. UU. subió cerca de un 50% y los tipos hipotecarios pasaron de menos del 4% a más del 7%, duplicando aproximadamente la cuota mensual frente a 2019; la construcción residencial estaría casi en recesión. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) En 2025 EE. UU. construyó el mismo número de viviendas que en 1960 con una población más que duplicada; Blackstone posee unas 60.000 viviendas y planea ofrecer préstamos para construir 50.000 viviendas al año (causa del déficit no indicada). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) Tras el pico de la pandemia de COVID-19, el consumo mundial de alcohol cae año tras año por mayor conciencia de riesgos para la salud y presión financiera, favoreciendo la moderación; cifras de caída no indicadas. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)
- (BR) Pix, el sistema de pago instantáneo gestionado por el Estado, ha sustituido al efectivo e incorpora un componente de crédito instantáneo; junto con las fintechs ha ampliado el acceso al crédito, y entre 2020 y 2024 las tarjetas de crédito activas crecieron aproximadamente tres cuartas partes, con 37 millones de usuarios más. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (IN) Los salarios medios mensuales de los graduados varones en India caen desde su pico de 2012 y están estancados; los repartidores gig ganan unas 500-700 rupias al día (5-8 dólares) trabajando 8-10 horas. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)

<a id="mercados-prediccion-calidad"></a>
### 17. Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio

En la página de mercados el usuario ve para cada contrato su liquidez, volumen, profundidad y fiabilidad, un directorio de plataformas (Polymarket, Kalshi…) y el estado regulatorio que puede cerrarlas o restringirlas.

- **Por qué importa para invertir:** Una probabilidad de un mercado ilíquido o amenazado legalmente no debe usarse como contexto; filtra qué señales valen.
- **Prioridad:** media · **Ficha:** calibracion-brier · **Fuente de datos:** API de Polymarket y Kalshi, CFTC (resoluciones y litigios), seguimiento de litigios estatales.
- **Datos:** Nuevo lib/services/prediction-markets/platforms.ts (plataforma, jurisdicción, regulador, estado, litigios) + campos de liquidez en types.ts.
- **Servicio:** Nuevo lib/services/prediction-markets/signal-quality.ts sobre polymarket-client.ts.
- **API:** Ampliar app/api/markets (+history) con quality y platform.
- **Interfaz:** app/markets/page.tsx (insignia de calidad y ficha de plataforma).
- **Conecta con:** riesgo-politico-interno, calibración Brier (sistema equity), regulacion-sectorial-jurisdiccion

**Hechos que la justifican:**

- (US) Un estudio halló que con 3.500 dólares se puede mover en cinco centavos o más el 97% de los mercados de predicción relacionados con las elecciones de medio mandato; causa: baja liquidez de esos mercados. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) Durante el Mundial (año no indicado en el hallazgo), Kalshi registró 27.000 millones de dólares de volumen de negociación y sumó tres millones de usuarios nuevos; causa: la demanda de apuestas deportivas durante el torneo. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) El 75% del volumen de Kalshi sigue siendo deportes según Bloomberg; la empresa dice que bajó del 95% a comienzos de año a unos dos tercios o 70%; causa: diversificación hacia contratos no deportivos. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) Kalshi cobra una comisión del 0,8% por operación y su modelo es ser bolsa peer-to-peer (no casa de apuestas); según el video, el 75% de los clientes pierde dinero. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) 44 estados de EE. UU. firmaron una carta que tilda a los mercados de predicción de nuevo casino y 20 litigan sobre si las leyes estatales de apuestas deportivas se aplican; la CFTC demandó a los estados en una disputa de competencia regulatoria; fecha no indicada. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) La comisión de la CFTC, el regulador de los mercados de predicción, ha quedado reducida de cinco miembros a uno solo, un nombramiento de Trump; fecha de la reducción no indicada, causa: bajas no cubiertas bajo la administración Trump. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) Usuarios de 18 a 21 años, demasiado jóvenes para entrar en un casino en la mayoría de estados, operaron 5.000 millones de dólares en Kalshi este año; el límite legal actual es 18 y subirlo a 21 sería aceptado por la empresa; año no indicado. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)

<a id="demografia-mercado-laboral"></a>
### 18. Demografía y mercado laboral por país

El usuario ve la pirámide y proyecciones demográficas, entrantes anuales al mercado laboral, desempleo juvenil y de titulados, informalidad, capital humano y la sostenibilidad del gasto social, con la demanda sectorial que implica.

- **Por qué importa para invertir:** La demografía define el tamaño futuro del mercado y la disponibilidad de trabajadores; una cohorte joven sin empleo es riesgo social, una envejecida es riesgo fiscal.
- **Prioridad:** media · **Ficha:** demografia-pais · **Fuente de datos:** UN World Population Prospects, World Bank WDI, ILOSTAT, World Bank Human Capital Index, OECD Pensions at a Glance.
- **Datos:** Ampliar lib/macro/world-bank-client.ts (SP.POP por edad, SL.UEM.1524.ZS, informalidad) + nuevo lib/data/demography/projections.json (UN WPP).
- **Servicio:** Nuevo lib/services/demography/demography-service.ts.
- **API:** Nuevo app/api/demography/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
- **Conecta con:** migracion-shocks-politica, salud-fiscal-soberana, riesgo-politico-interno, salud-consumidor-vivienda

**Hechos que la justifican:**

- (IN) India tiene 367 millones de jóvenes (la mayor población joven del mundo, un tercio de su fuerza laboral) y 8 millones de graduados entran al mercado laboral cada año. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (US) Se argumenta que el sistema de visados de EE. UU. no se actualiza desde 1990 y que, con una fecundidad muy por debajo del nivel de reemplazo, la economía necesita más inmigración con otras cualificaciones. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (IN) Los graduados jóvenes desempleados de India pasaron de menos de 1 millón en 1983 a 11 millones (16 veces) en unas cuatro décadas, mientras los graduados totales pasaron de 4,8 a 63 millones, porque la creación de empleo no ha seguido el ritmo. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (IN) De cada 100 jóvenes graduados indios, 50 tienen algún empleo, solo 26 con salario regular y solo 4 con contrato escrito, vacaciones pagadas y seguridad social; año de la medición no indicado. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (US) La asistencia escolar de cientos de miles de niños cae por el miedo a las redadas, lo que reduce el capital humano y la futura capacidad productiva y recaudatoria de EE. UU.; cifra exacta y plazo no indicados. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (FR) Hacia 2040 el 43% de la población mundial tendrá pelo rizado o afro y hacia 2050 una de cada seis personas tendrá más de 65 años, lo que L'Oréal usa para orientar su innovación en cuidado capilar específico y ciencia de la longevidad. — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0)
- (DE) Una fuerza laboral que envejece y se reduce, junto con un crecimiento débil, presiona la financiación del Estado de bienestar y alimenta el voto a los extremos políticos, lo que dificulta las reformas; cifras y plazo no indicados. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)

<a id="migracion-shocks-politica"></a>
### 19. Migración: flujos, dependencia sectorial y motor de shocks de política migratoria

El usuario ve stocks y flujos migratorios, deportaciones, sectores que dependen de mano de obra inmigrante y simula el efecto de una política migratoria (restrictiva u orientada a la economía) sobre consumo y oferta laboral.

- **Por qué importa para invertir:** Un endurecimiento migratorio encarece la mano de obra en construcción, agricultura o cuidados y reduce consumo; afecta a márgenes de empresas concretas.
- **Prioridad:** media · **Ficha:** demografia-pais · **Fuente de datos:** UN DESA International Migrant Stock, OECD International Migration Outlook, DHS/ICE (deportaciones), BLS/Eurostat (empleo por origen).
- **Datos:** Reutilizar engine/relations/model/migration.py (stocks bilaterales) + nuevo lib/data/demography/migration-policy.json {country, politica, deportaciones, dependencia_sectorial[]}.
- **Servicio:** Nuevo lib/services/demography/migration-shock-engine.ts.
- **API:** Nuevo app/api/demography/[code]/migration/route.ts.
- **Interfaz:** Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
- **Conecta con:** demografia-mercado-laboral, engine/relations/model/migration.py, salud-consumidor-vivienda, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US) Un economista cifra en unos 14.000 millones de dólares la caída del gasto respecto al año previo tras las redadas migratorias en EE. UU. y la describe como permanente, no un bache temporal; causa: miedo y salida de consumidores inmigrantes. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (US) El Departamento de Seguridad Nacional afirma que más de medio millón de personas han sido arrestadas y deportadas en estas operaciones a nivel nacional; plazo no indicado. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (US) Se estima que los inmigrantes en EE. UU. tienen al menos 1,3 billones de dólares en renta discrecional y poder de gasto; año de la estimación no indicado. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (US) Los datos de tráfico peatonal y gasto caen incluso en zonas con población inmigrante e hispana inferior a la media, por lo que el efecto de las redadas se contagia a toda la economía local; cifra y plazo no indicados. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (US) Las detenciones apuntan a furgonetas de trabajadores de la construcción a primera hora, retirando mano de obra de la construcción y dejando a empresas sin trabajadores; magnitud y plazo no indicados. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (US) Se propone trasladar la inmigración al Departamento de Comercio para orientarla a la prosperidad económica, como reorientación de política frente al enfoque actual de seguridad y deportación; no es una decisión adoptada. — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc)
- (JP) En Japón las muertes superan a los nacimientos y la población centenaria supera los seis dígitos, mientras Takaichi endurece las reglas de inmigración y promete mayor control pese a que el país necesita más trabajadores extranjeros; cifras exactas y plazo no indicados. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)

<a id="empresas-privadas-activos-alternativos"></a>
### 20. Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores

El usuario ve empresas privadas mencionadas por país (tamaño, financiación, adquisiciones), transacciones y valoraciones de activos alternativos (deporte, capital privado), gestores alternativos con su AUM y sus tesis sectoriales.

- **Por qué importa para invertir:** Muchos competidores y compradores relevantes no cotizan; sus valoraciones y movimientos marcan precios de referencia para las cotizadas del sector.
- **Prioridad:** baja · **Ficha:** bloomberg-originals-pais · **Fuente de datos:** Crunchbase, PitchBook/Preqin (si licencia), Forbes / Sportico (valoraciones de franquicias), SEC Form D y ADV.
- **Datos:** Nuevo lib/data/private-markets/companies.json y deals.json {entidad, country, tipo, importe, valoracion, fecha, fuente}; enlazar desde lib/data/bloomberg-originals/videos.json.
- **Servicio:** Nuevo lib/services/private-markets/private-markets-service.ts.
- **API:** Nuevo app/api/private-markets/[code]/route.ts.
- **Interfaz:** Lista de empresas privadas en BloombergOriginalsSection.tsx.
- **Conecta con:** lib/services/bloomberg-originals, capacidad-tecnologica-innovacion, perfiles-sectoriales-mercado, grafo-corporativo

**Hechos que la justifican:**

- (US) Lectric ha construido una marca directa al consumidor de 1.000 millones de dólares sin financiación de capital riesgo; periodo de construcción no indicado. — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s)
- (US) Lectric aplica un suelo y un techo de margen: cuando el margen supera el techo reinvierte en producto, ha sido rentable todo el tiempo y compite con rivales respaldados por capital riesgo; cifras de margen no indicadas. — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s)
- (US) Lectric ha adquirido las marcas Monarch y Juiced para ampliar su cartera, incluida una línea juvenil de e-bikes inspiradas en motos de cross; fecha de las compras y precios no indicados. — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s)
- (US) Blackstone gestiona 1,3 billones de dólares y en julio de 2026 poseía más de 12.500 activos inmobiliarios y 250 empresas participadas; salió a bolsa en 2007 (causa del crecimiento no indicada en este hallazgo). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) La familia de Vinod Khosla compró los Seattle Seahawks al patrimonio de Paul Allen por 9.500 millones de dólares, con Dynasty Equity como inversor minoritario; fecha de cierre no indicada. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (US) Desde que el capital privado puede entrar en las cuatro grandes ligas, más familias adineradas compran equipos porque encuentran una vía de salida, lo que atrae más compradores y sostiene las valoraciones; magnitud y plazo no indicados. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (US) Grandes gestores de capital privado como Ares, Apollo y KKR han entrado todos en el deporte, consolidándolo como clase de activo; plazo y montos no indicados. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)

<a id="aranceles-sanciones-controles"></a>
### 21. Registro de aranceles, sanciones y controles de exportación por país y producto

El usuario ve cada medida vigente (arancel, sanción, control tecnológico, waiver) con tipo, base legal, productos afectados y fecha, más el seguimiento de su efectividad: ingresos externos del régimen sancionado y desvíos o contrabando.

- **Por qué importa para invertir:** Una medida comercial cambia de golpe el mercado accesible y el coste de los insumos de una empresa; saber qué está vigente y qué productos toca es imprescindible para estimar el impacto.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** Global Trade Alert, WTO Tariff Download Facility, OFAC SDN / EU Sanctions Map / UK OFSI, BIS Entity List, OpenSanctions, CREA (ingresos de exportación rusos).
- **Datos:** Ampliar engine/relations/model/measures.py de sanciones genéricas a registro tipado {emisor, objetivo, tipo, base_legal, hs[], fecha_inicio, fecha_fin, waivers[]}, exportado a lib/data/bilateral-relations/measures.json.
- **Servicio:** Nuevo lib/services/bilateral-relations/measures-service.ts (cruce con trade-dag para productos y empresas afectadas).
- **API:** Ampliar app/api/relations/[code] con measures[].
- **Interfaz:** Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
- **Conecta con:** engine/relations/model/scoring.py, lib/data/trade-dag, comercio-bilateral-producto, linea-temporal-relaciones, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US, CN) Trump firmó una orden para imponer un arancel global del 10 % bajo la Sección 122, sobre los aranceles normales ya vigentes (fecha exacta no indicada; causa no indicada en el hallazgo). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (CU, US) Katapulk, marketplace online de la diáspora cubana, ofrece más de 33.000 productos y procesa entre 1.500 y 2.000 pedidos diarios, amparada en una excepción de los controles de exportación del Departamento de Comercio de EE. UU.; fecha de la excepción no indicada. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (IN, US, RU) EE. UU. bajo Trump usó aranceles adicionales y presión pública contra las compras indias de crudo ruso; tras la guerra EE. UU.-Israel con Irán, Washington suavizó el tono y emitió exenciones (waivers) para comprar petróleo ruso, que India aprovecha; cifra de aranceles y fecha de las exenciones no indicadas. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (US) El Tribunal Supremo de EE. UU. anuló los aranceles globales basados en la ley IEEPA, que sustentaban entre el 60 y el 75% de la política arancelaria actual de EE. UU.; fecha del fallo y base legal sustitutiva no indicadas. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (US, CN) EE. UU. discute en 2026 prohibir empresas y modelos de código abierto chinos y acusa a China de obtener chips por puertas traseras y copiar modelos, mientras los controles de exportación de chips y equipos han frenado la IA china; cifra y plazo exactos no indicados. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (KP) Entre 2022 y 2025 Corea del Norte ingresó hasta 22.000 millones de dólares en divisas, casi cuatro veces más que el cuatrienio anterior, pese a las sanciones (análisis de Bloomberg Economics; causa detallada en otros hallazgos del video: armas, cripto y comercio con China). — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)

<a id="linea-temporal-relaciones"></a>
### 22. Línea temporal y calibración de relaciones bilaterales

Al abrir una relación el usuario ve los eventos fechados (cumbres, treguas, controles, combates), la afinidad en votaciones de la ONU, la opinión pública en ambos países y cuánto depende la relación de un líder, sobre la serie del score.

- **Por qué importa para invertir:** Explica por qué la relación está donde está y lo frágil que es, para juzgar si la exposición de una empresa a ese par de países es estable.
- **Prioridad:** alta · **Ficha:** calibracion-relaciones-gdelt · **Fuente de datos:** GDELT, UN General Assembly Voting Data (Voeten), Pew Global Attitudes, ACLED, Wikidata.
- **Datos:** Ampliar engine/relations/model/reviewed_facts.json y exportar lib/data/bilateral-relations/events-timeline.json {pair, fecha, tipo, descripcion, fuente}; añadir afinidad ONU y opinión pública a relations.json.
- **Servicio:** Ampliar engine/relations/model/scoring.py (afinidad ONU, volatilidad ligada a líder) + lib/services/bilateral-relations (timeline).
- **API:** Ampliar app/api/relations/[code] con ?partner=&timeline=1.
- **Interfaz:** Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
- **Conecta con:** aranceles-sanciones-controles, comercio-bilateral-producto, GDELT (calibración), eventos-reaccion-mercado

**Hechos que la justifican:**

- (US, CN) Según Schwarzman, EE. UU. y China suman aproximadamente el 42 % de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa (fechas no indicadas). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (PK, AF) Pakistán mantiene desde principios de año (2026) un conflicto con Afganistán en el que ambos países se atacan mutuamente en la frontera (cifras de víctimas y causa no indicadas). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (GB) El 52% de los británicos apoyaría reincorporarse a la UE según una encuesta reciente; Sunak y Starmer han buscado acercarse a la UE en defensa, seguridad, inmigración y economía, y un analista prevé una asociación tipo membresía asociada; fecha de la encuesta no indicada. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (PK, US, IN) El acercamiento de Pakistán a Trump es frágil y personalista: el caso de India, que pasó de aliado a ser castigado, muestra que puede revertirse rápido (cifras y plazo no indicados). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (IN, US) Una encuesta de Pew indica que el 36% de los indios ve a Rusia como su principal aliado frente al 16% que señala a EE. UU., tras el deterioro de la imagen de EE. UU. por aranceles y la disputa sobre el alto el fuego con Pakistán; fecha de la encuesta no indicada. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (—) Los países que votan igual en la ONU invierten más entre sí, mientras los que votan en direcciones opuestas reducen la inversión mutua; la geopolítica condiciona así los flujos de capital (cifra y plazo no indicados). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)

<a id="motor-causas-pib"></a>
### 23. Motor de causas de variación del PIB con calidad de dato

El usuario ve por qué creció o cayó el PIB (descomposición por componentes y sectores), la brecha frente a un contrafactual de países pares, el crecimiento necesario frente al real, indicadores adelantados de recesión y una marca de calidad de cada dato (oficial o estimado).

- **Por qué importa para invertir:** Separa crecimiento sano de crecimiento frágil o mal medido, lo que cambia la lectura de la demanda futura para las empresas del país.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** World Bank WDI, IMF WEO, OECD Quarterly National Accounts, FRED, Conference Board LEI, VIIRS luces nocturnas.
- **Datos:** lib/macro/world-bank-client.ts, fred/ y static-data.ts (campo calidad: oficial/estimado/fuente alternativa como luces nocturnas).
- **Servicio:** Nuevo lib/services/geopolitical/gdp-driver-engine.ts (descomposición, control sintético con pares, indicadores adelantados) usando lib/macro/temporal-align.ts.
- **API:** Promover app/api/dev/geo-macro-analysis y ampliar app/api/macro/[country] con bloque gdp_drivers.
- **Interfaz:** CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
- **Conecta con:** estructura-productiva-clusteres, ciclo-inversion-ia (contribución al PIB), transmision-shocks-energia-inflacion, PmiActivitySection

**Hechos que la justifican:**

- (GB, IE, US) El modelo de Bloomberg (23 países de la OCDE como contrafactual) estima un golpe inicial del 10% al PIB británico (300.000 millones de libras) por el Brexit, que tras excluir a Irlanda y ajustar por EE. UU. (shock energético, estímulo fiscal, IA) baja a entre el 2% y el 4% del PIB; plazo de medición no indicado. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (DE) El PIB alemán de los últimos 20 años está entre un 6 y un 7 % por debajo de un control sintético de países pares (Corea, Japón, Finlandia, Canadá, Suecia), lo que indica una pérdida duradera de potencial y no solo un ciclo; causa no indicada en la cita. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (IN) Para ser economía desarrollada en 2047, India necesita crecer de forma sostenida entre 8% y 9% durante 25 años, creando suficiente empleo y subiendo ingresos para seguir siendo gran centro de demanda mundial. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (KP, KR) El PIB de Corea del Norte según el Banco de Corea es de unos 30.000 millones de dólares, 60 veces menor que el de Corea del Sur (unos 1,9 billones); año de la estimación y causa de la brecha no indicados. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (CU) La inflación oficial de Cuba tocó un pico de alrededor del 71% durante la pandemia y fue del 14% en 2025; los economistas estiman que la real está cerca de niveles pandémicos, y la causa de la diferencia es la fiabilidad de las cifras oficiales. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (US) Los salarios ajustados por inflación vuelven a caer en los últimos meses y la duración del desempleo ronda los seis meses, algo que históricamente coincide con recesión. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

<a id="licencia-social-permisos"></a>
### 24. Riesgo de permisos, licencia social y enforcement ambiental por proyecto

Para minas, centros de datos, plantas y zonas agrícolas el usuario ve conflictos con comunidades, oposición local, litigios, retrasos de permisos, deforestación y sanciones ambientales, como puntos en el mapa y como alerta en la ficha de cada instalación.

- **Por qué importa para invertir:** Un proyecto bloqueado por permisos u oposición local retrasa ingresos y dispara capex; es una causa frecuente de pérdidas en mineras, utilities e infraestructura de IA que no aparece en los datos macro.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** Environmental Justice Atlas, Global Forest Watch / PRODES (deforestación), Business & Human Rights Resource Centre, Data Center Watch, registros de permisos nacionales; parte requiere curación manual.
- **Datos:** Nuevo lib/data/project-permitting/permitting-events.json: {proyecto, empresa, country, coords, tipo (oposición, litigio, moratoria, multa, deforestación), estado, fecha, fuente}.
- **Servicio:** Nuevo lib/services/project-permitting/permitting-risk-service.ts (agrega eventos por instalación y país).
- **API:** Nuevo app/api/project-permitting/[code]/route.ts.
- **Interfaz:** Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
- **Conecta con:** lib/data/corporate-facilities, registro-minas-minerales-criticos, centros-datos-ia, riesgo-climatico-fisico, score de empresas (tras calibración)

**Hechos que la justifican:**

- (BO) En Bolivia, deforestar ilegalmente costaría a los productores de soja hasta 1 millón de dólares en multas frente a un terreno que vale algo más de 20 millones, es decir un mero coste administrativo; año de las cifras no indicado. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (BR) La pérdida de bosque en Brasil cayó un 41% en 2025, pero el modelo de intensificación agrícola parece desplazar la deforestación a Bolivia; la soja es el primer producto agrícola de exportación boliviano y tres cuartas partes se destinan a pienso. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (US) La base de Starship en Boca Chica afecta a un hábitat de especies amenazadas y genera oposición ambiental local, aunque el estado mantiene su respaldo con dinero público; cifras y plazo no indicados. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (US) Un candidato local estima que alrededor del 80 % de los nativos de la zona de Ambler se opone a la carretera, y las comunidades indígenas están divididas, con acusaciones de presión e incentivos para cambiar de postura; dato sin fuente verificable, plazo no indicado. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)
- (US) La oposición local a los centros de datos crece en EE. UU.: vecinos frenaron en tribunales un proyecto de más de 35 centros de datos en casi 2.000 acres junto al parque de Manassas; fecha del fallo no indicada y causa: rechazo vecinal por impacto ambiental. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) La demanda de inversión en IA encarece software y ordenadores, añade presión a la inflación general y genera rechazo local a los centros de datos y temor a la sustitución de empleos; magnitud no indicada. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

<a id="megaproyectos-infraestructura"></a>
### 25. Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos

El usuario ve los grandes proyectos de infraestructura y giga-proyectos por país con coste, sobrecostes, financiador (bilateral, multilateral, APP), deuda asociada y calendario de concesiones y contratos.

- **Por qué importa para invertir:** Señala oportunidades para constructoras y proveedores y, a la vez, riesgos de deuda oculta y presión fiscal cuando los proyectos se retrasan o encarecen.
- **Prioridad:** media · **Ficha:** finanzas-publicas-soberanas · **Fuente de datos:** AidData (financiación china), World Bank / AIIB / ADB project databases, PPI Database del Banco Mundial, GIH, prensa especializada.
- **Datos:** Nuevo lib/data/infrastructure/megaprojects.json: {proyecto, country, coords, sector, coste, sobrecoste_pct, financiador, deuda_bilateral, concesion{operador, vencimiento}, estado}.
- **Servicio:** Nuevo lib/services/infrastructure/megaproject-service.ts.
- **API:** Nuevo app/api/infrastructure/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
- **Conecta con:** salud-fiscal-soberana, sector-externo-balanza-pagos (deuda externa bilateral), politica-industrial-subsidios, licencia-social-permisos

**Hechos que la justifican:**

- (PK, CN) China invirtió mucho dinero en Pakistán para construir el Corredor Económico China-Pakistán, y Pakistán equilibra a EE. UU. y China, con una flota de cazas de ambos países (monto y plazo no indicados). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (HK) El gobierno de Hong Kong entrega a MTR terrenos junto a las estaciones con descuento en lugar de efectivo para financiar el metro, y MTR los licita a promotores privados (captura de valor del suelo); importe y plazo no indicados. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)
- (UY, AR) El ferri eléctrico Hull 096 de Buquebus cruzará el Río de la Plata entre Uruguay y Argentina con baterías de más de 40 MWh, 2.100 pasajeros y 225 coches, con una inversión total de 184 millones de dólares financiada con Banco Santander Uruguay y la IFC del Banco Mundial (fecha de entrada en servicio no indicada). — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (GB) La nacionalización ferroviaria en Reino Unido es casi gratuita porque los operadores solo tienen contratos de servicio: al expirar, el Estado asume la operación sin comprar infraestructura; plazo de expiración no indicado. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (HK) La primera estación del Northern Metropolis (Kwu Tung), en Hong Kong, ya cuesta un 70 % más que lo estimado y no se compensa con derechos de desarrollo tan lucrativos como antes; plazo no indicado. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)
- (SA) Algunos megaproyectos saudíes no avanzan bien y otros shocks económicos limitan la capacidad del reino para seguir financiando proyectos de prestigio con cheques en blanco; cifra y plazo no indicados. — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU)

<a id="seguridad-juridica-instituciones"></a>
### 26. Seguridad jurídica y calidad institucional

El usuario ve corrupción, eficiencia judicial, tiempo y coste de ejecutar contratos, seguridad de la propiedad (despojos, delitos patrimoniales) y las respuestas del gobierno a esos problemas.

- **Por qué importa para invertir:** Sin contratos exigibles ni propiedad segura, los flujos de caja de una empresa valen menos; explica descuentos de valoración persistentes por país.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** World Bank Worldwide Governance Indicators, Transparency International CPI, World Justice Project Rule of Law Index, B-READY (Banco Mundial), estadísticas nacionales de delitos.
- **Datos:** Nuevo lib/data/governance/rule-of-law.json: {country, wgi{}, cpi_transparencia, dias_ejecucion_contratos, delitos_patrimoniales, medidas[]}.
- **Servicio:** Nuevo lib/services/governance/governance-service.ts.
- **API:** Nuevo app/api/governance/[code]/route.ts.
- **Interfaz:** Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
- **Conecta con:** clima-inversion-extranjera, lib/data/geopolitical-countries (riesgo soberano base), lib/services/geopolitical/hard-country-engine, score de empresas (tras calibración)

**Hechos que la justifican:**

- (CU) Invertir en Cuba implica operar con el Estado, que no ofrece garantías sobre la inversión, la propiedad ni los derechos de los emprendedores privados sobre sus beneficios (opinión citada en el video); cifra y plazo no indicados. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (MX) El despojo de propiedad en Ciudad de México se debe a la gentrificación que encarece los inmuebles, a la cultura de no registrar propiedades o venderlas sin notario y a la corrupción de funcionarios, notarios y jueces; peso de cada causa no indicado. — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc)
- (MX) Los procesos judiciales por despojo de propiedad en México tardan de 8 meses a 2 años con la documentación en regla, pero más de 5 años en muchos casos, por la mezcla de tribunales penales y civiles y las apelaciones. — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc)
- (MX) En Ciudad de México se roban en promedio 11 viviendas al día por despojo (ocupación y escrituras falsificadas), porque los delincuentes vigilan inmuebles vacíos durante largos periodos; año de la cifra no indicado. — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc)
- (MX) En la última década los casos de robo y despojo de propiedad en Ciudad de México y el Estado de México suman casi 100.000, entre un tercio y la mitad por disputas familiares y el resto por invasiones; los datos oficiales solo arrancan en 2015 por un cambio metodológico. — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc)
- (MX) Ante los despojos de propiedad en Ciudad de México, la jefa de gobierno Clara Brugada ofreció 100 abogados gratuitos a las víctimas, hubo detenciones y la presidenta Sheinbaum ha sido preguntada en sus conferencias matutinas; fecha de las medidas no indicada. — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc)

<a id="vinculos-politico-empresariales"></a>
### 27. Exposición política de empresas: contratos públicos, lobby y vínculos con el poder

En la ficha de una empresa el usuario ve su dependencia de contratos gubernamentales y de defensa, gasto en lobby y financiación de campañas, y vínculos documentados con líderes o familias políticas en cada país.

- **Por qué importa para invertir:** Una empresa muy ligada al gobierno gana con él y pierde cuando cambia; ese riesgo político es invisible en los estados financieros.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** USAspending.gov, SAM.gov, OpenSecrets, EU Transparency Register, OpenCorporates, prensa de investigación (curación manual).
- **Datos:** Nuevo lib/data/political/company-state-links.json: {ticker, country, contratos_publicos_pct, lobby_usd, donaciones, vinculos[{persona, cargo, tipo, fuente}]}.
- **Servicio:** Nuevo lib/services/political/company-state-links-service.ts.
- **API:** Nuevo app/api/companies/[ticker]/political-exposure/route.ts.
- **Interfaz:** Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
- **Conecta con:** ficha-empresa-ampliada, riesgo-politico-interno, regulacion-sectorial-jurisdiccion, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US) Donald Trump Jr. es inversor en Polymarket y asesor remunerado de Kalshi, de la que recibió en 2025 una participación de 300.000 dólares que ahora podría valer millones; conflicto de interés por vínculo familiar con el presidente. — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU)
- (US) Larry Ellison posee cerca del 40% de Oracle y su patrimonio sigue de cerca la cotización, lo que le da un control enorme y concentra el riesgo de gobernanza y de persona clave; plazo no indicado. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (US) Los grupos políticos alineados con la IA han recaudado cerca de 300 millones de dólares para las elecciones de mitad de mandato de EE. UU., con más de 11.000 millones gastados en publicidad en el ciclo; causa: lograr influencia en la regulación. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Dos bandos financian la regulación de la IA en EE. UU.: Leading the Future (unos 140 millones, a favor de normas federales ligeras) y Public First Action (unos 83 millones respaldados por Anthropic, a favor de salvaguardas estrictas); plazo no indicado. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (PK, US) Pakistán firmó un memorando con World Liberty Financial, ligada a la familia Trump, y es el tercer mayor mercado cripto del mundo con más de 40 millones de usuarios (plazo y causa no indicados). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (US) La NASA pasa de supervisar y poseer los vehículos a ser cliente de empresas comerciales; el programa CLPS (desde 2018, gestionado desde Houston) adelanta capital y garantiza un comprador, y Artemis delega el desarrollo de los módulos de aterrizaje; montos no indicados. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)

<a id="capacidades-defensa"></a>
### 28. Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber

El usuario ve la serie de gasto en defensa, arsenal nuclear y su trayectoria, capacidad de producción y exportación de armas, dependencia de proveedores, transferencias y acuerdos militares entre países y actividad cibernética estatal.

- **Por qué importa para invertir:** El gasto en defensa y los acuerdos de armas definen la demanda para contratistas de defensa y señalan escaladas que afectan al riesgo país.
- **Prioridad:** media · **Ficha:** entidades-postura-vecinal · **Fuente de datos:** SIPRI Military Expenditure y Arms Transfers, FAS / Bulletin of the Atomic Scientists, IISS Military Balance, Chainalysis (robo cripto), CSIS Significant Cyber Incidents.
- **Datos:** Ampliar lib/data/military-forces.ts (gasto_serie, ojivas, produccion_armas, exportaciones, proveedores[], ciber) + nuevo lib/data/arms-transfers.json (proveedor, receptor, sistema, año, valor TIV).
- **Servicio:** Ampliar lib/services/military-ranking.ts y lib/services/tactical-entities/posture-engine.ts (ficha).
- **API:** Nuevo app/api/military/[code]/route.ts.
- **Interfaz:** Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
- **Conecta con:** lib/services/sovereign-power, engine/relations/model/scoring.py (acuerdos militares como componente), vinculos-politico-empresariales (contratistas), score de empresas (tras calibración)

**Hechos que la justifican:**

- (KP, US) Tras el fracaso de la cumbre de Hanoi de 2019 sobre alivio de sanciones, Corea del Norte aceleró su producción de armas nucleares y podría acumular uno de los mayores arsenales; cifra de ojivas no indicada. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (KP) Con la experiencia de combate en Ucrania, Corea del Norte habría mejorado sus armas convencionales y, si quiere, podría venderlas a terceros países; cuantía y plazo no indicados. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (KP, RU) Corea del Norte habría ganado hasta 12.800 millones de dólares solo con la venta de artillería y munición a Rusia (estimación del CSIS) y además recibe tecnología rusa, por ejemplo la defensa aérea de un nuevo destructor valorada en más de 20 millones; plazo no indicado y causa: la guerra de Rusia en Ucrania. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (KP) Los grupos de hackers norcoreanos pasaron de aproximadamente el 30 % de los robos globales de criptomonedas en 2017 a más del 70 % actualmente (con robos de hasta 2.000 millones de dólares anuales en 2025), con un respiro durante la pandemia; causa no indicada más allá de financiar al régimen bajo sanciones. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (IN, RU) Rusia sigue siendo el mayor proveedor de defensa de India, con alrededor del 48% de sus necesidades militares, y casi toda la flota de cazas india es rusa, lo que implica dependencia de repuestos y tecnología; plazo no indicado, causa: relación histórica de compras de armamento. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (JP) El gasto en defensa de Japón pasó de cerca del 1 % del PIB durante décadas a cerca del 2 % desde 2022 bajo el primer ministro Kishida, y Takaichi quiere superarlo y reformar las directrices de defensa; plazo de la meta nueva no indicado. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)

<a id="regulacion-sectorial-jurisdiccion"></a>
### 29. Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública

El usuario ve por país y sector las normas vigentes y en trámite (IA, plataformas digitales, datos, tecnologías sensibles), su estado y fecha, junto a la opinión pública que empuja esa regulación.

- **Por qué importa para invertir:** La regulación decide qué modelos de negocio son legales y a qué coste; la opinión pública anticipa hacia dónde irá.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** OECD.AI Policy Observatory, IAPP, EUR-Lex, Digital Policy Alert, Pew / Eurobarómetro / Ipsos (opinión pública).
- **Datos:** Nuevo lib/data/regulation/sector-regulation.json {jurisdiccion, sector, norma, estado, fecha, obligaciones, opinion_publica{fuente, valor}}.
- **Servicio:** Nuevo lib/services/regulation/regulatory-risk-service.ts.
- **API:** Nuevo app/api/regulation/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
- **Conecta con:** vinculos-politico-empresariales, capacidad-tecnologica-innovacion, eventos-reaccion-mercado, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US, CN) Doudna rebaja el hype de la IA en descubrimiento de fármacos: los chatbots no generan ideas nuevas, hacen falta más y mejores datos, y descarta promesas como curar el cáncer en 48 horas; el experimento chino de bebés editados de 2018 sigue siendo precedente de riesgo ético y regulatorio. — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA)
- (US, BR, IN) La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo, por lo que el comercio digital podría quedar sujeto a impuestos nacionales; fecha exacta de la conferencia no indicada. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (GB, US) Estar fuera de la UE ha beneficiado algo a Reino Unido en IA, al evitar la regulación europea que preocupa a las grandes tecnológicas estadounidenses, además de una buena relación con Trump; magnitud no indicada. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (US) Aumenta la presión por regulación de la IA a nivel estatal y local en EE. UU., lo que apunta a un mosaico normativo y no a un marco federal único; magnitud y plazo no indicados. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Hay un sentimiento público ambivalente y de rechazo creciente hacia la IA en EE. UU. (estudiantes con ansiedad por el empleo, abucheos a Eric Schmidt) y Li advierte que si EE. UU. no muestra una actitud positiva hacia la IA todos pierden; cifras y plazo no indicados. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)
- (US) Airbnb ha tenido que enfrentarse a regulaciones municipales y a la insatisfacción de usuarios a lo largo de sus 20 años de historia, y su modelo depende de recuperar la confianza de huéspedes y anfitriones; cifras de impacto no indicadas. — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs)

<a id="trade-dag-nuevas-cadenas"></a>
### 30. Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria

El árbol de cadenas de valor añade construcción naval y propulsión (con flota por tipo de buque), solar y eólica, climatización y el nodo de memoria en semiconductores, con cuotas por país y empresa en cada eslabón.

- **Por qué importa para invertir:** Extiende el análisis de dependencias de N niveles a sectores donde la geopolítica concentra hoy la producción (China en naval y solar, Corea en memoria).
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** Clarksons / UNCTAD (flota y astilleros), IEA (cadenas solar y eólica), TrendForce (memoria), BSRIA (climatización).
- **Datos:** Nuevos lib/data/trade-dag/shipbuilding.ts, energy-transition.ts y hvac-cooling.ts; ampliar semiconductors.ts con nodo de memoria (DRAM/HBM/NAND, cuotas).
- **Servicio:** lib/services/trade-dag-service.ts y lib/services/geopolitical/tier-n-evaluator existentes.
- **API:** La que ya sirve trade-dag (sin ruta nueva).
- **Interfaz:** sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
- **Conecta con:** lib/data/trade-dag/country-dags.ts, aranceles-sanciones-controles, logistica-chokepoints-corredores, score de empresas (tras calibración)

**Hechos que la justifican:**

- (AU, SE, NL) INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos (cifras de producción y plazo no indicados). — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (CN) A finales de 2024 el gobierno chino indicó que tenía casi 500 embarcaciones eléctricas operando, la mayoría ferris. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (—) El mercado de ferris eléctricos es mínimo frente a la flota mundial (menos del 1% de los buques), aunque los ferris transportaron más de 4.000 millones de pasajeros al año y sostienen 60.000 millones de dólares de PIB. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (CN) Alrededor del 90% de los equipos solares del mundo vienen de China y sus exportaciones de solar se dispararon tras el conflicto hacia Asia, Europa y África; magnitud y plazo no indicados. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (KR) En el año Samsung llegó a subir un 500% y SK Hynix más de un 1.000%; se espera que superen a TSMC, que lideró en 2025; plazo exacto no indicado. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (FR, ES, DE) La penetración de aire acondicionado en hogares sube con fuerza: Francia pasó de 7% en 2010 a 25% en 2020 y ahora ronda el 35%, frente a cerca de 65% en España y 20% en Alemania; los fabricantes vendieron unas tres veces lo esperado (la causa es el calor creciente). — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)

<a id="centros-datos-ia"></a>
### 31. Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país

El usuario ve los centros de datos por país y operador (MW en servicio y en construcción), la demanda eléctrica proyectada frente a la capacidad de la red, el déficit esperado y un índice de competitividad de costes (energía, suelo, permisos) para alojar IA.

- **Por qué importa para invertir:** La demanda de IA choca con redes finitas; identifica qué países atraerán inversión, dónde subirán precios eléctricos o habrá moratorias, y qué utilities, constructores y operadores se benefician.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** IEA Energy and AI, EPRI, operadores de red (PJM, EirGrid), Data Center Map / Baxtel, informes de hiperescaladores, Cushman & Wakefield Data Center Development Cost Guide.
- **Datos:** Nuevo lib/data/data-centers/data-centers.json: {operador, country, region, coords, mw_operativo, mw_construccion, estado, fuente}. Ampliar lib/data/corporate-facilities/hyperscale-auto.ts con MW.
- **Servicio:** Nuevo lib/services/data-centers/dc-demand-service.ts (demanda vs capacidad usando power-system-service, índice de costes).
- **API:** Nuevo app/api/data-centers/[code]/route.ts.
- **Interfaz:** Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
- **Conecta con:** sistema-electrico-pais, ciclo-inversion-ia, licencia-social-permisos, lib/data/corporate-facilities, score de empresas (tras calibración)

**Hechos que la justifican:**

- (US) Schwarzman afirma que el boom de centros de datos de IA hará que el mundo desarrollado se quede corto de electricidad (cifra y plazo no indicados), y que Blackstone ya invirtió mucho en ese sector antes que otros. — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) Los vecinos asocian los centros de datos con daño ambiental, uso de agua y subidas de la factura eléctrica, lo que alimenta el rechazo político en EE. UU.; magnitud y plazo no indicados. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Entrenar world models exigirá probablemente más energía y más recursos, y la CEO de World Labs reconoce que aún no sabe si podrá conseguirlos porque es demasiado pronto y la tecnología sigue en fase de demo; cifras y plazo no indicados. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)
- (CN) La ventaja de coste de la IA china viene de electricidad más barata, talento mucho más barato y modelos de pesos abiertos; una startup de EE. UU. redujo su factura de unos 1,5 millones de USD al mes a unos 100.000 USD (10 veces menos) al pasar a modelos abiertos; plazo no indicado. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (US) Blackstone compró en 2021 un gran operador de centros de datos por 10.000 millones de dólares que ahora es 15 veces mayor; se declara el mayor propietario de centros de datos del mundo, con los seis hiperescaladores como clientes (causa: demanda de IA y nube). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)

<a id="concentracion-precios-materias-primas"></a>
### 32. Concentración de oferta, exposición importadora y precios de materias primas

Por materia prima el usuario ve qué países concentran producción y exportación, qué importadores dependen de cada proveedor, la serie de precios con tendencia y la proyección de demanda a 2050; los escenarios de precio se calibran con Brier.

- **Por qué importa para invertir:** La concentración convierte a un país en palanca de precios; cruzarla con precios y demanda futura indica qué productores e importadores ganan o pierden margen.
- **Prioridad:** alta · **Ficha:** calibracion-brier · **Fuente de datos:** World Bank Pink Sheet, LME, FRED, UN Comtrade/BACI, USGS, IEA Critical Minerals Outlook (demanda 2050).
- **Datos:** Ampliar lib/data/natural-resources.json (cuota_exportacion, importaciones_por_proveedor) + nuevo lib/data/critical-commodities/prices.json (series mensuales) y demand-outlook.json.
- **Servicio:** Nuevo lib/services/country-resources/commodity-exposure-service.ts (HHI de oferta, exposición del importador, escenarios).
- **API:** Nuevo app/api/resources/prices/route.ts + ampliar app/api/resources.
- **Interfaz:** Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
- **Conecta con:** registro-minas-minerales-criticos, lib/services/geopolitical/supply-chain-evaluator, calibración Brier (sistema equity), score de empresas (tras calibración)

**Hechos que la justifican:**

- (US, QA, AU, RU) El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (DE, CN) Las fábricas alemanas dependen de tierras raras y minerales críticos chinos; China ejerce palanca retrasando los suministros más que cortándolos, lo que impide planificar a las empresas; cifras y plazo no indicados. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (—) El precio del cobre se ha más que duplicado en los últimos 10 años por la demanda de electrificación (coches eléctricos, turbinas eólicas). — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (IR, SA, AE) El precio del crudo superó los 126 dólares por barril durante el conflicto de Ormuz, muy por debajo de los 150-200 dólares que pronosticaban muchos bancos, porque inventarios, liberación de reservas, desvío por oleoducto y menor demanda china absorbieron el choque. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (—) La demanda mundial de electricidad se duplicaría hacia 2050 y, sin cobre, no habría redes, renovables, vehículos eléctricos ni centros de datos; causa: electrificación y crecimiento de centros de datos. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)

<a id="politica-industrial-subsidios"></a>
### 33. Registro de política industrial y subsidios por país y sector

El usuario ve las políticas industriales vigentes (subsidios, créditos fiscales, aranceles estratégicos, estrategias tecnológicas, incentivos subnacionales) con sector, importe, plazo y empresas beneficiarias.

- **Por qué importa para invertir:** Los subsidios deciden dónde se localiza la inversión y qué empresas tienen viento a favor; su reversión es un riesgo directo para los beneficiarios.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** Global Trade Alert (subsidios), OECD MAGIC, Good Jobs First Subsidy Tracker (EE. UU.), boletines oficiales; curación manual para estrategias.
- **Datos:** Nuevo lib/data/industrial-policy/policies.json: {country, nivel (nacional/subnacional), sector, instrumento, importe, inicio, fin, beneficiarios[]}.
- **Servicio:** Nuevo lib/services/industrial-policy/industrial-policy-service.ts.
- **API:** Nuevo app/api/industrial-policy/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
- **Conecta con:** lib/data/trade-dag, estructura-productiva-clusteres, megaproyectos-infraestructura, eventos-reaccion-mercado, score de empresas (tras calibración)

**Hechos que la justifican:**

- (CN) China va camino de invertir 142.000 millones de dólares en fabricación de chips (estimación de la Semiconductor Industry Association), como parte de décadas de política industrial; plazo concreto de la inversión no indicado. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (JP) El gobierno de Takaichi plantea una inversión pública y privada de 370 billones de yenes en 14 años, hasta 2040, repartida en 17 sectores estratégicos que incluyen IA, defensa, energía, semiconductores, tecnología alimentaria y contenidos como manga y anime. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (US, CN) La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista para reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales (cifras y plazo no indicados). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (US) La Texas Space Commission, creada por la legislatura en 2023, concedió 150 millones de dólares en subvenciones el último año y se espera que lo duplique a finales de este año; causa no indicada. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (HK, CN) El Northern Metropolis es un plan del gobierno de Hong Kong para crear un nuevo polo tecnológico que integre la ciudad con China continental, con medio millón de viviendas y siete estaciones nuevas; plazo no indicado. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)

<a id="conflicto-armado-control-territorial"></a>
### 34. Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio

El usuario ve qué porcentaje del territorio controla el Estado frente a grupos armados, quién controla las zonas de recursos, víctimas y desplazados, economías ilícitas que financian el conflicto y vectores de contagio hacia vecinos.

- **Por qué importa para invertir:** El territorio fuera de control estatal es donde las empresas no pueden operar ni proteger activos; el contagio extiende ese riesgo a países vecinos.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** ACLED, UCDP GED, UNHCR/IDMC (desplazados), Crisis Group CrisisWatch, ISW / monitores locales (control territorial, curación manual), UNODC (economías ilícitas).
- **Datos:** Nuevo lib/data/conflict/territorial-control.json {country, estado_pct, actores[{nombre, pct, zonas, recursos_controlados}], victimas, desplazados, economias_ilicitas[], vecinos_expuestos[], fecha}.
- **Servicio:** Nuevo lib/services/conflict/conflict-service.ts.
- **API:** Nuevo app/api/conflict/[code]/route.ts.
- **Interfaz:** Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
- **Conecta con:** lib/data/territorial-claims, registro-minas-minerales-criticos, lib/services/sovereign-power, score de empresas (tras calibración)

**Hechos que la justifican:**

- (MM) La junta militar de Myanmar y sus aliados controlan como máximo el 40-45 % del territorio porque ningún bando gana en el campo de batalla (guerra civil en curso, sin fin previsto a corto plazo); fecha exacta de la estimación no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM, TH) Los centros de estafa como Shwe Kokko (frontera Myanmar-Tailandia) generan entre miles de millones y decenas de miles de millones de dólares de ingresos que financian a los combatientes, incluida la junta; periodo no indicado, causa: negocio ilícito de fraude online usado como financiación de guerra. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM) Los rebeldes del TNLA tomaron en 2024 la ciudad de Mogok, zona de rubíes de Myanmar (país con reservas de gemas, madera y cobre), y cobran a los mineros por trabajar sus parcelas; causa: el conflicto armado desplaza el control de las zonas mineras. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM) La guerra civil de Myanmar ha dejado unos cien mil muertos, cientos de miles de heridos y millones de desplazados; periodo de acumulación y causa no indicados más allá del conflicto armado. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM, TH) La guerra de Myanmar se desborda hacia la frontera occidental de Tailandia: cientos de miles de refugiados cruzan, a menudo de forma ilegal, lo que alimenta el tráfico de personas y obliga al ejército tailandés a vigilar zonas controladas por milicias y rebeldes; plazo no indicado. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)

<a id="regimen-credito-tipos"></a>
### 35. Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo

El usuario ve el rendimiento soberano con máximos históricos y spreads contra referencias, el tipo de política monetaria y su senda esperada, el tamaño y redenciones del crédito privado y la morosidad corporativa con emisores en estrés.

- **Por qué importa para invertir:** El coste de financiación decide qué empresas apalancadas sobreviven; un régimen de crédito tensionado precede a impagos y caídas de valoración.
- **Prioridad:** alta · **Ficha:** regimen-credito-bonos · **Fuente de datos:** FRED, BIS policy rates, ECB SDW, investing.com/Trading Economics (yields), Moody's/S&P default reports, PitchBook/Preqin (crédito privado, si licencia).
- **Datos:** Promover app/api/dev/sovereign-yields a datos estables; ampliar lib/macro/bis-client.ts (tipos oficiales), lib/macro/fred y ecb-client.ts; nuevo lib/data/credit/private-credit.json (AUM, redenciones, morosidad).
- **Servicio:** Nuevo lib/services/credit-regime/credit-regime-service.ts (consume el régimen de crédito del sistema equity).
- **API:** Nuevo app/api/sovereign-yields/[code]/route.ts (sustituye la ruta dev) + bloque credit en app/api/macro/[country].
- **Interfaz:** Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
- **Conecta con:** salud-fiscal-soberana, régimen de crédito (sistema equity), muro de vencimientos (sistema equity), score de empresas (tras calibración)

**Hechos que la justifican:**

- (GB) El coste de endeudamiento a largo plazo del Reino Unido ha subido al nivel más alto desde 1998 y los inversores exigen una prima creciente frente a EE. UU., Francia, Italia y Alemania; fecha no indicada, causa no indicada. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (BR) El banco central brasileño recorta los tipos antes de las elecciones y se espera que los reduzca más hasta 2028, tras haber pasado de mínimos récord a dos dígitos en año y medio; nivel actual de la Selic no indicado. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (US) El crédito privado vale 1,8 billones de dólares y podría duplicarse para 2030, pero hay preocupación por la exposición a software; el fondo BCRED de Blackstone y otros limitaron retiradas tras recibir solicitudes por encima de los límites preestablecidos (rendimiento cercano al 9 %). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (BR) Las empresas brasileñas con pagos atrasados deben cerca de 239.000 millones de reales (unos 46.000 millones de dólares), un récord; el 90% de los nueve millones de negocios morosos son pequeñas y microempresas, y el agro está en niveles récord de impago; causa implícita: tipos de interés altos. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (BR) Raizen ha reestructurado su deuda este año y Casas Bahia, una de las cadenas minoristas más populares de Brasil, ha pedido protección por quiebra; causa: carga de deuda con tipos altos; cifras de las deudas no indicadas. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)

<a id="estructura-productiva-clusteres"></a>
### 36. Estructura productiva, desindustrialización y clústeres regionales

El usuario ve la composición sectorial del PIB y su evolución, la producción industrial, qué sectores se desindustrializan o relocalizan, los roles de centro financiero y los clústeres regionales con capacidades transferibles entre industrias.

- **Por qué importa para invertir:** Indica de qué vive la economía y hacia dónde se mueve, lo que define qué empresas locales tienen demanda estructural y qué regiones atraen nuevas plantas.
- **Prioridad:** media · **Ficha:** desarrollo-industrial-ciudades · **Fuente de datos:** World Bank WDI, UNIDO INDSTAT, OECD STAN, Eurostat, bancos centrales (producción industrial).
- **Datos:** Ampliar lib/macro/world-bank-client.ts (valor añadido por sector, manufactura % PIB) y lib/macro/sector-base-rates.ts; clústeres en lib/data/industrial-cities-seed.json (ficha).
- **Servicio:** Nuevo lib/services/geopolitical/economic-structure-service.ts.
- **API:** Ampliar app/api/macro/[country] con bloque structure.
- **Interfaz:** Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
- **Conecta con:** politica-industrial-subsidios, motor-causas-pib, ampliacion-instalaciones-corporativas, lib/data/trade-dag

**Hechos que la justifican:**

- (DE) La industria aporta cerca del 20 % del valor añadido total de Alemania, más que en Francia, España o Italia, y la producción industrial alemana lleva cayendo desde su máximo de 2018; causa y magnitud de la caída no indicadas en esta cita. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (CN) China ha hecho de la IA y la robótica humanoide un nuevo motor de crecimiento porque los pilares tradicionales fallan (inmobiliario en declive desde 2018) y apuesta por exportar IA asequible al mundo en desarrollo; peso en el PIB no indicado. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (GB) Los servicios financieros británicos han ido mejor que las exportaciones de bienes desde el Brexit, y Londres sigue siendo destino masivo de capital riesgo, sede de gestoras de fondos de la UE y centro de derivados en euros; cifras no indicadas. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (DE, CN) Entre 2022 y 2025 cerca del 10 % de la capacidad química europea quedó marcada para cierre; BASF emplea en Ludwigshafen a menos de 30.000 personas (mínimo desde los años 50) mientras construye en China una planta de miles de millones de euros; causa implícita en los costes energéticos y la competencia, no precisada en la cita. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (US) Las capacidades del sector petrolero y gasista de Texas (maquinaria pesada, fabricación metálica, telemetría) son transferibles al espacio y dan a Texas una ventaja de cadena de suministro frente a otros estados; cifras no indicadas. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)

<a id="grafo-corporativo"></a>
### 37. Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas

El usuario ve la red de alianzas, contratos de compra (por ejemplo mineras con tecnológicas), adquisiciones y financiación cruzada de una empresa, con fecha e importe, y su exposición a temas tecnológicos.

- **Por qué importa para invertir:** Revela dependencias y contagios que no salen en la cadena de suministro física: si cae un socio, quién queda expuesto.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** SEC 8-K, notas de prensa, Wikidata, Crunchbase, bases de M&A (Refinitiv/Dealogic si licencia).
- **Datos:** Nuevo lib/data/corporate-graph/edges.json {origen, destino, tipo (alianza, offtake, M&A, inversión), fecha, importe, fuente}.
- **Servicio:** Nuevo lib/services/company/corporate-graph-service.ts.
- **API:** Nuevo app/api/companies/[ticker]/graph/route.ts.
- **Interfaz:** sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
- **Conecta con:** lib/data/trade-dag, ficha-empresa-ampliada, registro-minas-minerales-criticos, estado-inversor

**Hechos que la justifican:**

- (US) NVIDIA colabora con World Labs usando entornos 3D generados con Marble para ampliar el entrenamiento de robots; cifras, plazo y causa no indicados. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)
- (US) Amazon, Google y Netflix entran en el deporte en directo y la demanda de eventos presenciales (como el Mundial de este verano) impulsa el sector; cifras y plazo no indicados. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (US) Larry Ellison se comprometió a garantizar personalmente 40.000 millones de dólares en financiación de capital para la oferta hostil de su hijo David (Paramount/Skydance) por Warner Bros.; plazo no indicado. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (FR) L'Oréal adquirió ModiFace en 2018 y escaló la prueba virtual con realidad aumentada a todas sus marcas, plataformas y minoristas, además de diagnóstico de piel con reconocimiento de imagen entrenado con miles de imágenes anotadas por dermatólogos; cifras no indicadas. — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0)
- (US, AU, GB) Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)

<a id="estado-inversor"></a>
### 38. Estado inversor: fondos soberanos, empresas públicas y soft power

El usuario ve los fondos soberanos del país (tamaño, control político, participaciones), las empresas públicas con dividendos al Estado y activos, y el retorno de las inversiones de soft power.

- **Por qué importa para invertir:** Muestra qué empresas tienen al Estado como accionista o comprador y qué sectores reciben capital soberano, con sus incentivos no puramente financieros.
- **Prioridad:** baja · **Ficha:** finanzas-publicas-soberanas · **Fuente de datos:** Global SWF, SWFI, informes anuales de fondos (PIF, GIC, NBIM), presupuestos nacionales (dividendos de empresas públicas).
- **Datos:** Nuevo lib/data/state-capital/state-capital.json: {country, fondos[{nombre, aum, control, participaciones[]}], empresas_publicas[{nombre, dividendo_estado, activos}], inversiones_soft_power[]}.
- **Servicio:** Nuevo lib/services/sovereign-finances/state-capital.ts.
- **API:** Nuevo app/api/state-capital/[code]/route.ts.
- **Interfaz:** Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
- **Conecta con:** salud-fiscal-soberana, grafo-corporativo, vinculos-politico-empresariales

**Hechos que la justifican:**

- (SA, AE) El PIF, fondo soberano saudí presidido por el príncipe heredero Mohammed bin Salman, gestiona unos 1 billón de dólares y solo es superado entre los fondos de Oriente Medio por el ADIA de Abu Dabi. — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU)
- (SA, US) El PIF anunció que retirará su financiación a LIV Golf al final de la temporada tras gastar más de 5.000 millones de dólares en menos de cinco años, en un contexto de guerra en Oriente Medio. — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU)
- (US, SA) BC Partners es el inversor principal de una oferta no vinculante para rescatar LIV Golf, que además pide a los jugadores aceptar participación en el capital; plazo y importe no indicados. — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU)
- (US, MX) La ronda final de LIV en Ciudad de México en abril promedió 49.000 espectadores en EE. UU. en Fox Sports One, frente a 4,35 millones del RBC Heritage del PGA Tour en CBS el mismo día; causa no indicada. — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU)
- (HK) MTR paga al gobierno de Hong Kong unos 6.000 millones de HKD al año en dividendos y gestiona 16 centros comerciales, torres de oficinas y 1.600 tiendas de estación; año de la cifra no indicado. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)

<a id="transmision-shocks-energia-inflacion"></a>
### 39. Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles

Ante un shock de petróleo o gas (real o simulado en un chokepoint) el usuario ve la inflación por componentes, el traslado a combustibles y transporte por país y qué economías frágiles sufren más por dependencia importadora y subsidios.

- **Por qué importa para invertir:** Conecta un evento geopolítico con inflación, tipos y consumo en cada país, que es lo que mueve resultados y valoraciones de empresas expuestas.
- **Prioridad:** alta · **Ficha:** nueva · **Fuente de datos:** FRED, Eurostat HICP, ILOSTAT/ONS/BLS por componentes, GlobalPetrolPrices, IMF Fossil Fuel Subsidies.
- **Datos:** Ampliar lib/macro/fred-series-map.ts y world-bank-client.ts con IPC por componentes (energía, alimentos, transporte) y precios de combustible al consumidor.
- **Servicio:** Nuevo lib/services/geopolitical/energy-shock-transmission.ts (elasticidad de traslado por país, ponderada por energy-security-service).
- **API:** Ampliar app/api/macro/[country] con bloque inflation_components y pass_through.
- **Interfaz:** Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
- **Conecta con:** balance-energetico-dependencia, logistica-chokepoints-corredores, salud-fiscal-soberana (subsidios), lib/services/prediction-markets, score de empresas (tras calibración)

**Hechos que la justifican:**

- (MM) Durante la guerra de Irán, Myanmar impuso estrictas restricciones al combustible, con grandes colas de vehículos, por el choque energético que se sumó a los efectos del conflicto interno; magnitud y plazo no indicados. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (US, IR) La guerra de EE. UU./Israel con Irán dispara los precios de la energía, con el diésel como combustible más afectado; un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) La inflación de EE. UU. pasó del 2,4% a comienzos de 2026 al 3,7% en septiembre, más de seis meses después del inicio de la guerra de EE. UU./Israel con Irán. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) Frente a antes de la pandemia, los alimentos suben más del 30%, el alquiler más de un tercio, el seguro de coche casi un 50% y la energía aún más. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

<a id="eventos-reaccion-mercado"></a>
### 40. Registro de eventos con reacción de mercado y empresas afectadas

Cada evento regulatorio, político o geopolítico queda fechado con las empresas afectadas y su reacción bursátil histórica (retorno anormal), para que al leer una noticia el usuario vea cómo reaccionaron casos parecidos.

- **Por qué importa para invertir:** Convierte noticias en impacto cuantificado sobre empresas concretas y es la base para calibrar cualquier señal antes de que toque el score.
- **Prioridad:** media · **Ficha:** calibracion-brier · **Fuente de datos:** GDELT, Federal Register / boletines oficiales, precios de mercado (Yahoo Finance / Stooq / Polygon) para estudios de evento.
- **Datos:** Nuevo lib/data/events/market-event-studies.json {evento, fecha, country, tipo, tickers[], retorno_anormal{1d, 5d, 20d}}.
- **Servicio:** Nuevo lib/services/events/event-study-service.ts.
- **API:** Nuevo app/api/events/[code]/route.ts.
- **Interfaz:** Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
- **Conecta con:** linea-temporal-relaciones, politica-industrial-subsidios, calibración Brier (sistema equity), score de empresas (tras calibración)

**Hechos que la justifican:**

- (US, CN) Una orden ejecutiva de Trump impulsa que inversores estadounidenses compren las operaciones de TikTok en EE. UU., con Oracle como proveedor de la nube y parte del consorcio; plazo y importe no indicados. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (JP, CN) Tras decir Takaichi que una guerra por Taiwán sería una amenaza existencial para Japón, China respondió con una campaña diplomática para aislarla; Pekín es el mayor socio comercial de Japón y su máximo diplomático describe la relación en mínimos; plazo exacto no indicado. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (KR) El 4 de marzo de 2026 el KOSPI cayó un 12% en un día, arrastrado por temores del conflicto en Oriente Medio. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (US) Tras el anuncio del acuerdo con el gobierno, la acción de Trilogy Metals subió de poco más de 2 dólares a más de 11 dólares sin haberse extraído una sola onza, y después volvió a niveles previos; fechas no indicadas, causa: especulación por el respaldo político. — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE)

<a id="ampliacion-instalaciones-corporativas"></a>
### 41. Ampliación de instalaciones corporativas a vehículos eléctricos, aeroespacial y consumo

La capa de huella del mapa incluye plantas de fabricantes de vehículos eléctricos, aeroespaciales y de consumo y alimentación, además de las 12 tecnológicas actuales.

- **Por qué importa para invertir:** Permite ver qué empresas tienen activos en un país en riesgo y cruzarlo con clima, conflicto o sanciones.
- **Prioridad:** media · **Ficha:** nueva · **Fuente de datos:** SEC 10-K (Item 2 Properties), informes de sostenibilidad, Global Energy Monitor / Benchmark (gigafábricas).
- **Datos:** Nuevos lib/data/corporate-facilities/ev-makers.ts, aerospace.ts y consumer-food.ts con el tipo de types.ts; registrar en curated-corporate-facilities.ts.
- **Servicio:** lib/services/geographic/sec-properties y risk-scorer existentes.
- **API:** Ruta existente que sirve corporate-facilities (sin ruta nueva).
- **Interfaz:** Capa 'footprint' del mapa (map2d/render-facilities.ts).
- **Conecta con:** riesgo-climatico-fisico, conflicto-armado-control-territorial, estructura-productiva-clusteres, ficha-empresa-ampliada, score de empresas (tras calibración)

**Hechos que la justifican:**

- (CN) Seres opera en Chongqing una Super Factory con 3.000 robots y, según la empresa, sus vehículos de lujo AITO superaron el millón de entregas en 46 meses, un récord en el mercado de VE chino. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (US) Texas concentra un clúster espacial: Blue Origin con lanzamiento en el oeste del estado, Axiom Space e Intuitive Machines en Houston, y Firefly Aerospace con su centro de cohetes y desarrollo en el centro; plazo y cifras no indicados. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (US) Athletic construye y opera sus propias cervecerías y controla la calidad con equipo propio a tiempo completo; su cervecería insignia tiene unos 150.000 pies cuadrados de producción. — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ)

## Por país

### US (135)

- **Hecho:** La mina Carlota (EE. UU.) produce un 60 % menos cobre que en su pico y, salvo que se actúe, cerrará a finales de la década porque se agota.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «This is Carlota Mine. It's producing about 60% less copper than it did during peak output. Unless something is done, it's set to shut down by the end of the decade.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** El gobierno de EE. UU. invierte 35,6 millones de dólares en Trilogy Metals (TMQ) a cambio del 10 % de la empresa y concede el permiso del proyecto Ambler, que la administración Biden había bloqueado repetidamente; fecha no indicada, causa: política industrial de minerales críticos.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «The government announced it would invest $35.6 million in Trilogy Metals for a 10% stake and granted the permit.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** Tras el anuncio del acuerdo con el gobierno, la acción de Trilogy Metals subió de poco más de 2 dólares a más de 11 dólares sin haberse extraído una sola onza, y después volvió a niveles previos; fechas no indicadas, causa: especulación por el respaldo político.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «Following the deal's announcement, Trilogy stocks surged from more than $2 to more than $11 per share.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** El distrito minero de Ambler (Alaska) alberga, según los promotores, algunos de los mayores depósitos de cobre y zinc de EE. UU., ligados al esfuerzo del país por competir con China en minerales críticos; cifras de reservas no indicadas.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Developers say the Ambler Mining District is home to some of the nation's biggest copper and sink deposits.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** El proyecto Ambler depende de una carretera de grava de 211 millas cuyo coste puede alcanzar miles de millones de dólares y cuya financiación es incierta, lo que alimenta la oposición local y las dudas de los contribuyentes.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «With the road's cost of construction potentially stretching into the billions of dollars, uncertainty over funding has fueled local opposition and taxpayers' concerns.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** Trilogy dijo en 2023 que enviaría el concentrado de cobre y zinc a un puerto asiático; con el proyecto presentado ahora como iniciativa America First, el destino final del mineral es incierto y los críticos temen que acabe en China; plazo de decisión no indicado.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Trilogy Metals said in 2023, it would ship mineral concentrate to an Asian port. Now, with the government branding the project as an America first initiative, its ultimate destination remains uncertain.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** El valor real de los depósitos minerales de Ambler no está verificado, por lo que la rentabilidad del proyecto sigue siendo especulativa; sin cifra ni plazo indicados.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Meanwhile, questions still remain of the unverified worth of the mineral deposits buried beneath the tundra.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** Un candidato local estima que alrededor del 80 % de los nativos de la zona de Ambler se opone a la carretera, y las comunidades indígenas están divididas, con acusaciones de presión e incentivos para cambiar de postura; dato sin fuente verificable, plazo no indicado.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «The Native people are probably 80% against the road, I would say.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** La AIE coordinó una liberación de reservas globales de unos 400 millones de barriles que entraron al mercado con poca antelación durante el cierre de Ormuz, con EE. UU. aportando volúmenes de su reserva estratégica y alcanzando exportaciones récord de crudo; plazo exacto no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «It was coordinated by the IEA and this added a lot of immediate supplies of oil, something like 400 million barrels of oil that came into the market at short notice» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «The LNG market is highly concentrated with the US, Qatar, Australia, and Russia making up 70% of the global supply.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** OpenAI se comprometió a pagar a Oracle unos 300.000 millones de dólares por construir una serie de centros de datos (proyecto Stargate), un contrato en la nube de una escala sin precedentes; plazo no indicado.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «Stargate is a huge cloud contract. It is about $300 billion OpenAI has agreed to pay Oracle to build a series of data centers at a scale the world has truly never seen before.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** El flujo de caja libre de Oracle, positivo y en miles de millones de dólares desde los años 90, ha dejado de serlo por la apuesta masiva en infraestructura de nube e IA, y muchos inversores están preocupados; magnitud no indicada.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «Look at Oracle's free cash flow. Since the '90s, it had been positive and comfortably in the billions. Not anymore.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** Oracle vale unos 450.000 millones de dólares y se espera que ingrese este año unos 90.000 millones, repartidos entre aplicaciones en la nube, software tradicional e infraestructura cloud.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «Today, it's a $450 billion giant of the industry, with revenue this year expected to land around $90 billion.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** Una orden ejecutiva de Trump impulsa que inversores estadounidenses compren las operaciones de TikTok en EE. UU., con Oracle como proveedor de la nube y parte del consorcio; plazo y importe no indicados.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «President Trump has signed an executive order which advances plans for American investors to buy TikTok's US operations.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** Larry Ellison posee cerca del 40% de Oracle y su patrimonio sigue de cerca la cotización, lo que le da un control enorme y concentra el riesgo de gobernanza y de persona clave; plazo no indicado.
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «He's consistently owned a massive chunk of the company, today, about 40%, giving him huge control of it.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** Larry Ellison se comprometió a garantizar personalmente 40.000 millones de dólares en financiación de capital para la oferta hostil de su hijo David (Paramount/Skydance) por Warner Bros.; plazo no indicado.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «Larry Ellison agreeing to personally guarantee $40 billion in equity financing.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** El PIF anunció que retirará su financiación a LIV Golf al final de la temporada tras gastar más de 5.000 millones de dólares en menos de cinco años, en un contexto de guerra en Oriente Medio.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «Saudi Arabia's public investment fund announced it will be pulling its funding at the end of the season.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** BC Partners es el inversor principal de una oferta no vinculante para rescatar LIV Golf, que además pide a los jugadores aceptar participación en el capital; plazo y importe no indicados.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «BC Partners is the lead investor for this deal, which may or may not happen because it's not a binding offer» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** La ronda final de LIV en Ciudad de México en abril promedió 49.000 espectadores en EE. UU. en Fox Sports One, frente a 4,35 millones del RBC Heritage del PGA Tour en CBS el mismo día; causa no indicada.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «LIV's final round in Mexico City in April averaged 49,000 US viewers on Fox Sports One. That same day, the PGA Tour's RBC Heritage Final Round averaged 4.35 million on CBS.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** Qualcomm está diversificando más allá del móvil: ha entrado en el mercado de centros de datos (con la marca de producto Dragonfly) y en robótica (familia Dragonwing); cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «that's what led us to introducing Dragonfly, which is our latest product. It goes along with our entrance into the data center space.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓
- **Hecho:** Según su director de marketing, la marca Snapdragon eleva los precios medios de venta (ASP) de Qualcomm porque los consumidores la perciben como premium; cifra no indicada.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «We have found that if we can drive pull for Snapdragon in these devices, our average selling prices tend to be higher because consumers view Snapdragon as premium.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓
- **Hecho:** Qualcomm defiende que la IA en el dispositivo (edge) ahorra costes frente a la IA en la nube, cuyo coste de tokens y capex de los hiperescalares se traslada al usuario; cifra no indicada.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «the more you can process closer to the device or on device or on prem, the more economically valuable it is to the user, right? You're saving cost.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓
- **Hecho:** El yen cotizó por encima de 160 por dólar en julio de 2026, cerca de su mínimo en cuatro décadas, y Japón y el Tesoro de EE. UU. intervinieron de forma coordinada por primera vez en unos 15 años; Bessent dice que no dudará en volver a hacerlo. Japón posee más de un billón de dólares en deuda estadounidense; causa no indicada.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «A coordinated intervention for the first time in about 15 years.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** La financiación a robots humanoides alcanzó 6.000 millones de dólares, cifra que Fei-Fei Li considera pequeña frente a lo invertido en coches autónomos o modelos de lenguaje; plazo y causa no indicados.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «Funding for humanoids hit $6 billion, but you know, they still can't load my dishwasher as fast as I can.» — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts) · cita ✓
- **Hecho:** La inversión total en world models (IA que predice el mundo físico) ronda los 3.000 millones de dólares y sigue creciendo, y World Labs ha levantado unos 1.000 millones con un equipo de unas 50 personas; plazo no indicado.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «World Labs may be a small team, but the investment in world models is gigantic. $3 billion and growing.» — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts) · cita ✓
- **Hecho:** Entrenar world models exigirá probablemente más energía y más recursos, y la CEO de World Labs reconoce que aún no sabe si podrá conseguirlos porque es demasiado pronto y la tecnología sigue en fase de demo; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) · interfaz: Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
  - «That we don't know yet. We're too early. We're likely to need more power and more resources.» — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts) · cita ✓
- **Hecho:** NVIDIA colabora con World Labs usando entornos 3D generados con Marble para ampliar el entrenamiento de robots; cifras, plazo y causa no indicados.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «This is a collaboration with NVIDIA where they're using Marble environments to augment the training of robots.» — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts) · cita ✓
- **Hecho:** Hay un sentimiento público ambivalente y de rechazo creciente hacia la IA en EE. UU. (estudiantes con ansiedad por el empleo, abucheos a Eric Schmidt) y Li advierte que si EE. UU. no muestra una actitud positiva hacia la IA todos pierden; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «US is such an important country in terms of its impact to the world that if we are not showing a positive attitude and positive path towards AI, everybody loses.» — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts) · cita ✓
- **Hecho:** Según la propia compañía, más de 2.500 millones de huéspedes se han alojado en Airbnb desde 2008, en casi todos los países del mundo.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «the company says more than two and a half billion guests have checked into an Airbnb in almost every country around the world» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓
- **Hecho:** Airbnb ha tenido que enfrentarse a regulaciones municipales y a la insatisfacción de usuarios a lo largo de sus 20 años de historia, y su modelo depende de recuperar la confianza de huéspedes y anfitriones; cifras de impacto no indicadas.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «Airbnb has faced its fair share of adversaries, from battling city regulations to navigating user dissatisfaction» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓
- **Hecho:** Airbnb quiere ampliar su negocio del alojamiento a todo el viaje (experiencias, servicios bajo demanda) para vender más a clientes existentes, que viajan solo unas pocas veces al año; las Experiences lanzadas en 2016 no tuvieron tracción.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «Originally launched in 2016, experiences failed to. Gain traction.» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓
- **Hecho:** La familia de Vinod Khosla compró los Seattle Seahawks al patrimonio de Paul Allen por 9.500 millones de dólares, con Dynasty Equity como inversor minoritario; fecha de cierre no indicada.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «Vinod Khosla and his family buying the Seattle Seahawks from the estate of Paul Allen for $9.5 billion» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** La NFL limita al 10 % la participación de capital privado en un equipo y solo unas cinco firmas están aprobadas como fuente de financiación; causa de la norma y plazo no indicados.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «because there's a rule that private equity can only up to 10% of a team» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** La oficina de la liga (contratos de medios, convenios laborales) puede generar hasta el 75 % de la economía de la NFL; plazo y causa no indicados.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «So it's a huge part of the economics. In the NFL, it could be up to 75% of the economics.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** TMRW Sports (golf y flag football profesional, con PGA Tour, LPGA y NFL) sigue un modelo de baja intensidad de capital: en lugar de construir 20 estadios, un único recinto de 75 millones de dólares y propiedad de la economía a nivel de liga.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «It wasn't about building 20 stadiums around the country. It was one $75 million venue.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** Grandes gestores de capital privado como Ares, Apollo y KKR han entrado todos en el deporte, consolidándolo como clase de activo; plazo y montos no indicados.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «big brand names, if you think about whether it's Ares, Apollo, KKR, they've all jumped into sports» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** Amazon, Google y Netflix entran en el deporte en directo y la demanda de eventos presenciales (como el Mundial de este verano) impulsa el sector; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «when you have this combination of Amazon and Google and Netflix all coming into sports, plus consumers really wanting to be together» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** El flag football será deporte olímpico en Los Ángeles 2028, en categorías masculina y femenina, y la NFL planea lanzar ligas profesionales masculina y femenina; fechas de lanzamiento de las ligas no indicadas.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «in 2028 in Los Angeles, flag football, both on the men's and women's side will be an Olympic sport.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** Desde que el capital privado puede entrar en las cuatro grandes ligas, más familias adineradas compran equipos porque encuentran una vía de salida, lo que atrae más compradores y sostiene las valoraciones; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «So what you've seen since private equity has been allowed into the four major leagues is that more wealthy families are coming in» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **Hecho:** La economía espacial global está valorada en más de 650.000 millones de dólares y crece rápidamente; año de la cifra y causa del crecimiento no indicados.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «With the global space economy currently valued at over $650 billion, one American state in particular is betting big on this rapidly growing sector.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** La Texas Space Commission, creada por la legislatura en 2023, concedió 150 millones de dólares en subvenciones el último año y se espera que lo duplique a finales de este año; causa no indicada.
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «Last year, the Texas Space Commission gave out $150 million in grants to support space business in the state. It's due to double that by the end of this year.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** La inversión en la industria espacial alcanzó unos 55.000 millones de dólares el último año, más del doble del presupuesto anual de la NASA, que ronda los 24.000 millones; causa no indicada.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «A recent report showed that last year there was about $55 billion of investment in the space industry, and you compare that to say, NASA's annual budget, which has hovered around roughly $24 billion annually» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** SpaceX trasladó su sede a Texas en 2024, Elon Musk anunció la mayor OPV de la historia con campana en el nuevo NASDAQ de Texas, su cotización hiperinflada ha empezado a bajar y Starlink es ya su principal fuente de ingresos; cifras de la OPV no indicadas.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «when Elon Musk announced the biggest IPO the world has ever seen, the bell rang from the new NASDAQ in Texas. Even as its hyped share price starts to come back down to earth.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** Texas concentra un clúster espacial: Blue Origin con lanzamiento en el oeste del estado, Axiom Space e Intuitive Machines en Houston, y Firefly Aerospace con su centro de cohetes y desarrollo en el centro; plazo y cifras no indicados.
  - **Funcionalidad sugerida:** [Ampliación de instalaciones corporativas a vehículos eléctricos, aeroespacial y consumo](#ampliacion-instalaciones-corporativas) · interfaz: Capa 'footprint' del mapa (map2d/render-facilities.ts).
  - «you have Axiom Space, you have Intuitive Machines and then in central Texas Firefly Aerospace has its rocket facility and development center.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** La NASA pasa de supervisar y poseer los vehículos a ser cliente de empresas comerciales; el programa CLPS (desde 2018, gestionado desde Houston) adelanta capital y garantiza un comprador, y Artemis delega el desarrollo de los módulos de aterrizaje; montos no indicados.
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «Now the agency is transitioning to a new way of business where it's less of an overseer and more of a customer.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** La base de Starship en Boca Chica afecta a un hábitat de especies amenazadas y genera oposición ambiental local, aunque el estado mantiene su respaldo con dinero público; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «There are endangered species who live in the area of that beach and the mudflats that surround it.» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** Las capacidades del sector petrolero y gasista de Texas (maquinaria pesada, fabricación metálica, telemetría) son transferibles al espacio y dan a Texas una ventaja de cadena de suministro frente a otros estados; cifras no indicadas.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «It's interesting that the oil and gas industry on the surface is very different from space, but if you start to look at a lot of the capabilities, whether it's heavy machinery, metal fabrication, telemetry» — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw) · cita ✓
- **Hecho:** Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «But in late January, Trump threatened sanctions on any nation that supplied Cuba with oil. And President Claudia Sheinbaum of Mexico decided that was too great a risk to her own economy.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Katapulk, marketplace online de la diáspora cubana, ofrece más de 33.000 productos y procesa entre 1.500 y 2.000 pedidos diarios, amparada en una excepción de los controles de exportación del Departamento de Comercio de EE. UU.; fecha de la excepción no indicada.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «We have over 33,000 products. We do about 1,500 to 2,000 orders a day.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** EE. UU. bajo Trump usó aranceles adicionales y presión pública contra las compras indias de crudo ruso; tras la guerra EE. UU.-Israel con Irán, Washington suavizó el tono y emitió exenciones (waivers) para comprar petróleo ruso, que India aprovecha; cifra de aranceles y fecha de las exenciones no indicadas.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «There are refresh waivers for countries around the world to buy Russian oil. And India has certainly taken advantage of that.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «The US is far and away India's largest export market. So they can't afford to alienate the US.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** Una encuesta de Pew indica que el 36% de los indios ve a Rusia como su principal aliado frente al 16% que señala a EE. UU., tras el deterioro de la imagen de EE. UU. por aranceles y la disputa sobre el alto el fuego con Pakistán; fecha de la encuesta no indicada.
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «A Pew survey recently said that 36% of Indians view Russia as India's top ally. Versus just 16% who see America's India's top ally.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** El presupuesto de USAID era solo el 0,6-0,7% del presupuesto federal de EE. UU. cada año, por lo que su desmantelamiento ahorra poco frente a su coste en influencia exterior; plazo del desmantelamiento no indicado.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Budget for USAID was 0.6 to 0.7% of our budget every year. That is such a small amount of money» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓
- **Hecho:** Al retirarse USAID de Kenia quedaron 26 proyectos de agua y saneamiento (WASH) en curso que costarían unos 2 millones de dólares terminar, dejando infraestructura a medias y mayores riesgos de inundación; fecha de la retirada no indicada.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «when USAID stopped their work in Kenya, there was a total of 26 projects in the WASH space ongoing and it only would cost around $2 million to actually finish them.» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓
- **Hecho:** Al menos 80 programas adicionales de agua fueron cancelados en el mundo, programas que debían llevar agua a al menos 11 millones de personas; fecha de cancelación y países afectados no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «at least 80 other programs were canceled around the world, programs that were supposed to bring water to at least 11 million people.» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓
- **Hecho:** Un defensor de los recortes sostiene que los países receptores aceptan un trato más transaccional, como el que ya tienen con China, y que el 'soft power' de EE. UU. es una narrativa de los medios; el reportaje sugiere en cambio pérdida de credibilidad estadounidense; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «a lot of countries, particularly the places where allegedly we're losing the soft power, are perfectly happy to deal in a more transactional environment.» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓
- **Hecho:** Durante el Mundial (año no indicado en el hallazgo), Kalshi registró 27.000 millones de dólares de volumen de negociación y sumó tres millones de usuarios nuevos; causa: la demanda de apuestas deportivas durante el torneo.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «During the World Cup, Kalshi recorded $27 billion in trading volume and added three million new users.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** El 75% del volumen de Kalshi sigue siendo deportes según Bloomberg; la empresa dice que bajó del 95% a comienzos de año a unos dos tercios o 70%; causa: diversificación hacia contratos no deportivos.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «we are at 95% at the beginning of the year. We're much lower now. I think it's like two thirds or 70%.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** 44 estados de EE. UU. firmaron una carta que tilda a los mercados de predicción de nuevo casino y 20 litigan sobre si las leyes estatales de apuestas deportivas se aplican; la CFTC demandó a los estados en una disputa de competencia regulatoria; fecha no indicada.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «44 states have signed a letter calling prediction markets a new form of casino, and 20 are fighting in court over whether state sports betting laws apply.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** La comisión de la CFTC, el regulador de los mercados de predicción, ha quedado reducida de cinco miembros a uno solo, un nombramiento de Trump; fecha de la reducción no indicada, causa: bajas no cubiertas bajo la administración Trump.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «Under President Trump, the five-person commission is now down to one man.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** Un estudio halló que con 3.500 dólares se puede mover en cinco centavos o más el 97% de los mercados de predicción relacionados con las elecciones de medio mandato; causa: baja liquidez de esos mercados.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «A recent study found that for $3,500, you can move 97% of midterm related prediction markets by five cents or more.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** Donald Trump Jr. es inversor en Polymarket y asesor remunerado de Kalshi, de la que recibió en 2025 una participación de 300.000 dólares que ahora podría valer millones; conflicto de interés por vínculo familiar con el presidente.
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «In 2025, he received a $300,000 equity stake in Kalshi that's now potentially worth millions.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** Kalshi cobra una comisión del 0,8% por operación y su modelo es ser bolsa peer-to-peer (no casa de apuestas); según el video, el 75% de los clientes pierde dinero.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «We take 0.8%, they take something similar. That doesn't make New York Stock Exchange gambling.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** Usuarios de 18 a 21 años, demasiado jóvenes para entrar en un casino en la mayoría de estados, operaron 5.000 millones de dólares en Kalshi este año; el límite legal actual es 18 y subirlo a 21 sería aceptado por la empresa; año no indicado.
  - **Funcionalidad sugerida:** [Mercados de predicción: calidad de señal, plataformas y riesgo regulatorio](#mercados-prediccion-calidad) · interfaz: app/markets/page.tsx (insignia de calidad y ficha de plataforma).
  - «users between 18 and 21 who would be too young to walk into a casino in most states traded $5 billion on Kalshi.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **Hecho:** El Tribunal Supremo de EE. UU. anuló los aranceles globales basados en la ley IEEPA, que sustentaban entre el 60 y el 75% de la política arancelaria actual de EE. UU.; fecha del fallo y base legal sustitutiva no indicadas.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «Trump's IEEPA tariffs, which about 60 to 75% of the tariff policy right now in the United States is based off of» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo, por lo que el comercio digital podría quedar sujeto a impuestos nacionales; fecha exacta de la conferencia no indicada.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** Lectric vende 150.000 bicicletas eléctricas al año, un 50% más que su competidor más cercano en EE. UU.; año de la cifra no indicado.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «Electric says they sell 150,000 bikes per year, which is 50% more than their closest competitor.» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **Hecho:** Lectric ha construido una marca directa al consumidor de 1.000 millones de dólares sin financiación de capital riesgo; periodo de construcción no indicado.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «You built a $1 billion direct to consumer brand without any VC funding» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **Hecho:** El mercado de e-bikes de EE. UU. creció con fuerza entre 2015 y 2022 pero se estabilizó, y los fabricantes afrontan demanda débil, presión sobre precios y más competencia; cifras de caída no indicadas.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «the category has since entered a more challenging phase. As manufacturers navigate slowing demand, pricing pressure, and growing competition» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **Hecho:** Lectric aplica un suelo y un techo de margen: cuando el margen supera el techo reinvierte en producto, ha sido rentable todo el tiempo y compite con rivales respaldados por capital riesgo; cifras de margen no indicadas.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «we have a margin floor which most companies have, but we also have a margin ceiling where if we get above the margin ceiling, that means we reinvest in a product» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **Hecho:** Lectric ha adquirido las marcas Monarch y Juiced para ampliar su cartera, incluida una línea juvenil de e-bikes inspiradas en motos de cross; fecha de las compras y precios no indicados.
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «You've got brands like Monarch and Juiced you have added into your portfolio.» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **Hecho:** En la última década Athletic y su equipo han llevado la categoría de cerveza sin alcohol en EE. UU. de 100 millones a más de mil millones de dólares anuales de ingresos.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «Over the last decade, Shufelt and team have helped drive the non-alcoholic beer category from 100 million to over a billion dollars annually in revenue.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** Athletic tiene un conocimiento de marca de solo ~25% a nivel nacional y una distribución inferior al 40%, lo que limita su crecimiento actual; año de medición no indicado.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «Currently, the company says awareness for Athletic hovers around 25% nationally, with distribution under 40%.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** Más de tres de cada cuatro consumidores que prueban Athletic siguen comprándola, y más del 30% de quienes compran en el pasillo de cerveza sin alcohol no lo habían pisado en seis meses; causa no indicada.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «Over three out of four consumers who try Athletic stay with Athletic.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** Tras el pico de la pandemia de COVID-19, el consumo mundial de alcohol cae año tras año por mayor conciencia de riesgos para la salud y presión financiera, favoreciendo la moderación; cifras de caída no indicadas.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «After spiking during the COVID-19 pandemic, global alcohol consumption has declined year over year.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** Athletic compite en cerveza sin alcohol contra los mayores cerveceros del mundo, tanto grandes grupos como internacionales, y es la marca líder en EE. UU. desde su fundación en 2017.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «Then within non-alcoholic beer itself, there are macro and international brewers. We're competing against the biggest brewers in the world.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** Athletic construye y opera sus propias cervecerías y controla la calidad con equipo propio a tiempo completo; su cervecería insignia tiene unos 150.000 pies cuadrados de producción.
  - **Funcionalidad sugerida:** [Ampliación de instalaciones corporativas a vehículos eléctricos, aeroespacial y consumo](#ampliacion-instalaciones-corporativas) · interfaz: Capa 'footprint' del mapa (map2d/render-facilities.ts).
  - «That's why it's like so important for us to build our all our own breweries, own all our own quality.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **Hecho:** El modelo de Bloomberg (23 países de la OCDE como contrafactual) estima un golpe inicial del 10% al PIB británico (300.000 millones de libras) por el Brexit, que tras excluir a Irlanda y ajustar por EE. UU. (shock energético, estímulo fiscal, IA) baja a entre el 2% y el 4% del PIB; plazo de medición no indicado.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «We get down to a number between two and four percent of GDP, which we think is a reasonable estimate for the hit to the economy.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** Estar fuera de la UE ha beneficiado algo a Reino Unido en IA, al evitar la regulación europea que preocupa a las grandes tecnológicas estadounidenses, además de una buena relación con Trump; magnitud no indicada.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «On all the things to do with AI, Britain has probably benefited a little bit by being outside the European Union, which most of the tech giants in America are slightly scared of.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** En junio de 2026 el uso global de modelos de IA chinos superó por primera vez al de los estadounidenses; según OpenRouter, Singapur, Alemania y ya también EE. UU. usan más modelos chinos que estadounidenses; causa no indicada.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «In June, global usage of Chinese AI models overtook those from the US for the first time.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** Un mismo sitio web cuesta unos 50 USD con un modelo cerrado estadounidense frente a 12 USD con Kimi K3 chino (una cuarta parte); el nuevo GPT 5.6 Luna de OpenAI lo hace por poco más de 4 USD, igualando a las alternativas chinas baratas.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «With Anthropic's Claude Fable 5, you get this polished fully functional website for about $50. Not too bad, right? But China's Kimi K3 can create a similar site for just $12.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** EE. UU. discute en 2026 prohibir empresas y modelos de código abierto chinos y acusa a China de obtener chips por puertas traseras y copiar modelos, mientras los controles de exportación de chips y equipos han frenado la IA china; cifra y plazo exactos no indicados.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «There has been discussion in Washington DC about banning some of these Chinese companies, especially the Chinese open source models.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** EE. UU. mantiene ventaja en modelos de frontera, cómputo y chips, y las empresas chinas de IA están limitadas por escasez de capital y valoraciones que son una fracción de las de las grandes de EE. UU.; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «China's ability to keep up with the US is also limited by the relative scarcity of capital to keep their projects going. In terms of their market valuation, they are a fraction of some of the top US players.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** Un economista cifra en unos 14.000 millones de dólares la caída del gasto respecto al año previo tras las redadas migratorias en EE. UU. y la describe como permanente, no un bache temporal; causa: miedo y salida de consumidores inmigrantes.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «And I found that the decline in spending was about $14 billion, which is a decline relative to the year before.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** El Departamento de Seguridad Nacional afirma que más de medio millón de personas han sido arrestadas y deportadas en estas operaciones a nivel nacional; plazo no indicado.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «the Department of Homeland Security says more than half a million people have been arrested and deported during these operations.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Se estima que los inmigrantes en EE. UU. tienen al menos 1,3 billones de dólares en renta discrecional y poder de gasto; año de la estimación no indicado.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «In the United States, it's estimated that immigrants have at least $1.3 trillion in discretionary income and spending power.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Los datos de tráfico peatonal y gasto caen incluso en zonas con población inmigrante e hispana inferior a la media, por lo que el efecto de las redadas se contagia a toda la economía local; cifra y plazo no indicados.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «Data from across the country indicates that even in areas that have a below-average immigrant and Hispanic population, foot traffic and spending are down.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Las detenciones apuntan a furgonetas de trabajadores de la construcción a primera hora, retirando mano de obra de la construcción y dejando a empresas sin trabajadores; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «They target early morning work vans, vans that look like construction work. These are not people that are a threat.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** La asistencia escolar de cientos de miles de niños cae por el miedo a las redadas, lo que reduce el capital humano y la futura capacidad productiva y recaudatoria de EE. UU.; cifra exacta y plazo no indicados.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «If you have hundreds of thousands of children not showing up to school or partially showing up to school, they're not able to build the human capital that they need in the long run» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Se argumenta que el sistema de visados de EE. UU. no se actualiza desde 1990 y que, con una fecundidad muy por debajo del nivel de reemplazo, la economía necesita más inmigración con otras cualificaciones.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «it hasn't been updated since 1990. And now fertility rates are so low in the United States, we're well below replacement rate.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Se propone trasladar la inmigración al Departamento de Comercio para orientarla a la prosperidad económica, como reorientación de política frente al enfoque actual de seguridad y deportación; no es una decisión adoptada.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «Now imagine that we put immigration under Department of Commerce. It's not just a different framing.» — [Trump's Immigration Raids Have an Unexpected Price Tag](https://www.youtube.com/watch?v=gDEuEDYoDHc) · cita ✓
- **Hecho:** Amazon, Google, Meta y Microsoft gastaron 376.000 millones de dólares en capex en 2025 y van camino de 725.000 millones en 2026; los centros de datos demandan chips de memoria que dominan Samsung y SK Hynix.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «2025 saw the four biggest US tech companies Amazon, Google, META and Microsoft spending $376 billion on capital expenditures, and the industry is on track to spend a whopping $725 billion in 2026.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** La inflación de EE. UU. pasó del 2,4% a comienzos de 2026 al 3,7% en septiembre, más de seis meses después del inicio de la guerra de EE. UU./Israel con Irán.
  - **Funcionalidad sugerida:** [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) · interfaz: Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
  - «Fast-forward to 2026, the inflation rate was 2.4%, but more than six months into the US-Israel war with Iran, inflation has heated up. In September, it was 3.7%.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** La guerra de EE. UU./Israel con Irán dispara los precios de la energía, con el diésel como combustible más afectado; un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible.
  - **Funcionalidad sugerida:** [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) · interfaz: Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
  - «Before the Iran war, I was at $800- $1,200 a week at fuel. I'm up to about $1,700-$1,800 now a week.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** Frente a antes de la pandemia, los alimentos suben más del 30%, el alquiler más de un tercio, el seguro de coche casi un 50% y la energía aún más.
  - **Funcionalidad sugerida:** [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) · interfaz: Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
  - «groceries are up over 30%. Rent's up by over a third. You've seen car insurance rise by nearly 50% and energy prices are even higher than that.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** Los salarios ajustados por inflación vuelven a caer en los últimos meses y la duración del desempleo ronda los seis meses, algo que históricamente coincide con recesión.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «in the last few months, inflation adjusted wages have started to decline again.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** El precio mediano de la vivienda en EE. UU. subió cerca de un 50% y los tipos hipotecarios pasaron de menos del 4% a más del 7%, duplicando aproximadamente la cuota mensual frente a 2019; la construcción residencial estaría casi en recesión.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «the median price of a home in the US has gone up by about 50% and mortgage rates have gone up from below 4% to above 7%.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** Según Bloomberg Economics, la inversión relacionada con IA aportó cerca de un punto porcentual al crecimiento del PIB de EE. UU. en 2025, aproximadamente la mitad del crecimiento total.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «AI-related investment added roughly one percentage point to GDP growth in 2025, about half of overall economic growth.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** La demanda de inversión en IA encarece software y ordenadores, añade presión a la inflación general y genera rechazo local a los centros de datos y temor a la sustitución de empleos; magnitud no indicada.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «AI and this demand and need to put billions of dollars into investment in it has driven up the costs of everything from software to computers» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten; plazo no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «making a deal with Russia to try to get more supply of diesel on the market» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** A finales de 2025 EE. UU. y Pakistán firmaron un memorando para invertir en los minerales críticos pakistaníes (monto no indicado; causa no indicada).
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «By the end of 2025, Pakistan and the US had signed a memorandum of understanding where they would be investing in Pakistan's critical minerals.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** Pakistán firmó un memorando con World Liberty Financial, ligada a la familia Trump, y es el tercer mayor mercado cripto del mundo con más de 40 millones de usuarios (plazo y causa no indicados).
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «Pakistan's now the world's third-largest crypto market with over 40 million crypto users.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** El acercamiento de Pakistán a Trump es frágil y personalista: el caso de India, que pasó de aliado a ser castigado, muestra que puede revertirse rápido (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Trump can be very fickle. He could like you one minute and you could be in the doghouse the next minute.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** En tres años las nuevas subvenciones de la NSF de EE. UU. cayeron un 24% y unos 25.000 científicos y personal, cerca del 20% de la plantilla, han dejado las agencias federales de investigación, por los recortes federales de Trump a la ciencia.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «the number new grants from the NSF dropped 24%, and roughly 25,000 scientists and staff. About 20% of the workforce have left federal research agencies.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** Según Doudna, cada dólar invertido por el NIH en investigación genera unos 2,50 dólares de beneficio económico (plazo y metodología no indicados).
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «On every dollar that's been invested from the NIH in research leads to about $2.50 of economic benefit. That's a pretty darn good return on investment.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** Mientras EE. UU. recorta la financiación científica, China aumenta su inversión en ciencia y su biotecnología se ha acelerado con apoyo estatal y ensayos en humanos más rápidos; Doudna ve posible que China tome la delantera al menos inicialmente (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «at the same time that the United States is pulling back on funding, we're seeing a, you know, a big investment in science in China.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** El Innovative Genomics Institute de Doudna ha generado 31 empresas con unos 9.000 millones de dólares de valoración conjunta y más de 2.500 empleos, sobre todo en California (plazo no indicado).
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «I think we've now spun out 31 companies at last count, $9 billion valuation. If you add it all up, over 2,500 jobs created largely here in California» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** La primera terapia CRISPR personalizada (bebé KJ, Hospital Infantil de Filadelfia, 2025) costó unos 800.000 dólares y se apoyó en financiación pública, colaboración académica y filantropía; Doudna dice que no puede escalar a millones de dólares por paciente.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «the therapy came with a price tag of around $800,000, supported by a patchwork of public research, funding, academic collaboration and philanthropy.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** La mayoría de las terapias CRISPR actuales son ex vivo (extraer células, editarlas y reinfundirlas), caras y poco prácticas; el cuello de botella es la entrega in vivo, y Doudna espera avances en tres años si bajan los costes con fabricantes más baratos.
  - **Funcionalidad sugerida:** [Perfiles sectoriales: tamaño de mercado, cuotas, actores y economía unitaria](#perfiles-sectoriales-mercado) · interfaz: Nueva página app/sectors/[sector]/page.tsx enlazada desde BloombergOriginalsSection.
  - «Right now, it's being done mostly by therapies that, or strategies that involve taking cells out of the patient, editing them in the lab, and then transplanting them back in.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** Doudna rebaja el hype de la IA en descubrimiento de fármacos: los chatbots no generan ideas nuevas, hacen falta más y mejores datos, y descarta promesas como curar el cáncer en 48 horas; el experimento chino de bebés editados de 2018 sigue siendo precedente de riesgo ético y regulatorio.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «I'm not seeing chatbots coming up with a brand new idea for something that nobody else ever thought of.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** El volumen de negociación en el mercado de opciones de EE. UU. marca récord tras récord en los últimos años, impulsado por inversores minoristas, antes un segmento dominado por fondos de cobertura y mesas profesionales (cifra concreta no indicada).
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «Take the US options market, which was once the domain of professionals at hedge funds and trading desks. Look how trading volumes have launched record after record in recent years, driven by itchy retail investors.» — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc) · cita ✓
- **Hecho:** Corea del Sur es conocida por la negociación minorista de ETFs apalancados, mientras que en Europa el apetito es más moderado y el ahorro se concentra históricamente en depósitos bancarios (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «We've seen the same in South Korea where they're famous for trading these leveraged ETFs. But it's been a little bit more muted in Europe where historically people have put up more of their money in bank deposits» — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc) · cita ✓
- **Hecho:** Una inversión en el S&P 500 hace diez años habría crecido de media un 15% anual, un nivel históricamente muy alto que alimenta la confianza de los inversores jóvenes y podría implicar valoraciones exigentes (causa del rendimiento no indicada).
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «you would've seen that grow on average 15% a year, which is actually historically very high» — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc) · cita ✓
- **Hecho:** Tras el fracaso de la cumbre de Hanoi de 2019 sobre alivio de sanciones, Corea del Norte aceleró su producción de armas nucleares y podría acumular uno de los mayores arsenales; cifra de ojivas no indicada.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «North Korea is actually accelerating its production of nuclear weapons and potentially is on track to have one of the biggest stockpiles out there.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** La oposición local a los centros de datos crece en EE. UU.: vecinos frenaron en tribunales un proyecto de más de 35 centros de datos en casi 2.000 acres junto al parque de Manassas; fecha del fallo no indicada y causa: rechazo vecinal por impacto ambiental.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «residents fought to prevent a project that would've included more than 35 data centers on nearly 2,000 square acres of land near Manassas National Battlefield Park» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** Los vecinos asocian los centros de datos con daño ambiental, uso de agua y subidas de la factura eléctrica, lo que alimenta el rechazo político en EE. UU.; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) · interfaz: Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
  - «They are associated with environmental damage, water usage, electricity bills going up.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** La industria invierte alrededor de un billón de dólares solo este año en construir centros de datos, y probablemente centenares de miles de millones más en empresas del ecosistema de IA (año exacto no indicado en el hallazgo; causa: carrera por capacidad de IA).
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «an industry that's putting a trillion dollars just into building data centers this year and probably hundreds of billions more into the various companies that are working in and around AI» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** Los grupos políticos alineados con la IA han recaudado cerca de 300 millones de dólares para las elecciones de mitad de mandato de EE. UU., con más de 11.000 millones gastados en publicidad en el ciclo; causa: lograr influencia en la regulación.
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «AI aligned political groups have raised close to $300 million for the midterms.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** Dos bandos financian la regulación de la IA en EE. UU.: Leading the Future (unos 140 millones, a favor de normas federales ligeras) y Public First Action (unos 83 millones respaldados por Anthropic, a favor de salvaguardas estrictas); plazo no indicado.
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «Public First Action has received significant backing from AI giant Anthropic, with an estimated $83 million overall.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** Aumenta la presión por regulación de la IA a nivel estatal y local en EE. UU., lo que apunta a un mosaico normativo y no a un marco federal único; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «as AI's footprint grows, pressure for government action, particularly at the state and local level, is only increasing.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **Hecho:** Los inversores extranjeros poseen ya el 20 % de toda la renta variable estadounidense, con el capital concentrado en pocas empresas tecnológicas por el auge de la IA; año del dato y reparto por país de origen no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «foreign investors now count for 20% of all US equity holdings.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses y financian así el propio boom de IA (flujo circular); cuantía y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** La succión de capital hacia la IA dificulta la colocación de bonos del Tesoro de EE. UU., que ya paga 1 billón de dólares anuales en intereses sobre más de 40 billones de deuda; año del dato no indicado.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «now paying $1 trillion a year in interest on more than $40 trillion of US debt.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Una caída fuerte de las valoraciones de IA podría golpear dos veces a las economías asiáticas: por la desvalorización de sus activos en EE. UU. y por el deterioro de su balanza comercial y economía; magnitud y plazo no indicados (escenario, no dato).
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «Asia economies can be hit twice where the amount they've invested into US companies gets devalued and at the same time, their trade balance and economy along with it weakens as well.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista para reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «He really believes that the US is in an existential competition with China over leadership of this important technology.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Blackstone gestiona 1,3 billones de dólares y en julio de 2026 poseía más de 12.500 activos inmobiliarios y 250 empresas participadas; salió a bolsa en 2007 (causa del crecimiento no indicada en este hallazgo).
  - **Funcionalidad sugerida:** [Empresas privadas y activos alternativos: tamaño, rondas, transacciones y gestores](#empresas-privadas-activos-alternativos) · interfaz: Lista de empresas privadas en BloombergOriginalsSection.tsx.
  - «today   it manages $1.3 trillion. In July 2026, it held more   than 12,500 real estate assets and 250 portfolio companies. It went public in 2007.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** Blackstone compró en 2021 un gran operador de centros de datos por 10.000 millones de dólares que ahora es 15 veces mayor; se declara el mayor propietario de centros de datos del mundo, con los seis hiperescaladores como clientes (causa: demanda de IA y nube).
  - **Funcionalidad sugerida:** [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) · interfaz: Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
  - «we bought a very large data center, a company in 2021, for $10 billion. It's now 15 times larger. We're the largest owner of   data centers in the world.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** El crédito privado vale 1,8 billones de dólares y podría duplicarse para 2030, pero hay preocupación por la exposición a software; el fondo BCRED de Blackstone y otros limitaron retiradas tras recibir solicitudes por encima de los límites preestablecidos (rendimiento cercano al 9 %).
  - **Funcionalidad sugerida:** [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) · interfaz: Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
  - «Now it's worth $1.8 trillion and could double in size by 2030. Today, some investors are   worried about risks building in private credit, with software companies   a particular focus.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** OpenAI está valorada en 852.000 millones de dólares tras cerrar una ronda de 122.000 millones para sus chips, centros de datos y talento, y Anthropic negocia captar 30.000 millones a una valoración de 900.000 millones (fechas de las rondas no indicadas).
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «OpenAI is now valued at $852 billion. The AI company closed a $122   billion funding round intended to help with its costly   push for more chips, data centers, and talent.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** Schwarzman afirma que el boom de centros de datos de IA hará que el mundo desarrollado se quede corto de electricidad (cifra y plazo no indicados), y que Blackstone ya invirtió mucho en ese sector antes que otros.
  - **Funcionalidad sugerida:** [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) · interfaz: Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
  - «we learned that, you know, certainly the   developed world is going to be short electricity. Now we've become huge   investors in that area before other people did it.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** Trump firmó una orden para imponer un arancel global del 10 % bajo la Sección 122, sobre los aranceles normales ya vigentes (fecha exacta no indicada; causa no indicada en el hallazgo).
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «Today I will sign an   order to impose a 10% global tariff under Section 122 over and above our normal tariffs   already being charged.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** Según Schwarzman, EE. UU. y China suman aproximadamente el 42 % de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa (fechas no indicadas).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «These are two countries that understand that together they have approximately 42% of the world's economy.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** En 2025 EE. UU. construyó el mismo número de viviendas que en 1960 con una población más que duplicada; Blackstone posee unas 60.000 viviendas y planea ofrecer préstamos para construir 50.000 viviendas al año (causa del déficit no indicada).
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «Last year, 2025, we built the same number of houses in the United   States as we did in 1960.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓

### CN (39)

- **Hecho:** El Northern Metropolis es un plan del gobierno de Hong Kong para crear un nuevo polo tecnológico que integre la ciudad con China continental, con medio millón de viviendas y siete estaciones nuevas; plazo no indicado.
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «a massive government plan to build a new tech hub to better integrate Hong Kong with mainland China, including the goal to build half a million new homes.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** Los residentes de Hong Kong hacen más de 90 millones de viajes al año a Shenzhen, desplazando gasto de los comercios locales, por lo que los alquileres de las tiendas de MTR se ajustan a la baja; año de la cifra no indicado.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «residents now make more than 90 million trips a year to Shenzhen in mainland China, shifting spending across the border and away from local retailers.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** Trilogy dijo en 2023 que enviaría el concentrado de cobre y zinc a un puerto asiático; con el proyecto presentado ahora como iniciativa America First, el destino final del mineral es incierto y los críticos temen que acabe en China; plazo de decisión no indicado.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Trilogy Metals said in 2023, it would ship mineral concentrate to an Asian port. Now, with the government branding the project as an America first initiative, its ultimate destination remains uncertain.» — [The Trump Deal That Could Reshape Alaska](https://www.youtube.com/watch?v=7OkGrpbV2BE) · cita ✓
- **Hecho:** China recortó sus importaciones de crudo en 4-5 millones de barriles diarios, hasta el nivel más bajo en unos ocho años, pausando el almacenamiento estratégico; fue el mayor amortiguador del precio durante el cierre de Ormuz.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «We're talking four or five million barrels a day of reduced crude imports to the lowest level in about eight years.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** Alrededor del 90% de los equipos solares del mundo vienen de China y sus exportaciones de solar se dispararon tras el conflicto hacia Asia, Europa y África; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «Something like 90% of the world's solar equipment comes from China.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** Una orden ejecutiva de Trump impulsa que inversores estadounidenses compren las operaciones de TikTok en EE. UU., con Oracle como proveedor de la nube y parte del consorcio; plazo y importe no indicados.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «President Trump has signed an executive order which advances plans for American investors to buy TikTok's US operations.» — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g) · cita ✓
- **Hecho:** Tras decir Takaichi que una guerra por Taiwán sería una amenaza existencial para Japón, China respondió con una campaña diplomática para aislarla; Pekín es el mayor socio comercial de Japón y su máximo diplomático describe la relación en mínimos; plazo exacto no indicado.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «When Takaichi said that a war over Taiwan would be an existential threat for Japan» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** Entre 2022 y 2025 cerca del 10 % de la capacidad química europea quedó marcada para cierre; BASF emplea en Ludwigshafen a menos de 30.000 personas (mínimo desde los años 50) mientras construye en China una planta de miles de millones de euros; causa implícita en los costes energéticos y la competencia, no precisada en la cita.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «Within three years, 2022 to 2025, nearly 10% of European chemical capacity was earmarked to close.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** El comercio Alemania-China pasó de superávit a déficit creciente: en 2025 las exportaciones alemanas de maquinaria y bienes industriales a China cayeron cerca del 10 % y las de coches más del 30 %, mientras suben las importaciones chinas (China Shock 2.0); causa no desglosada más allá de la competencia china.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «Vehicle exports to China were down more than 30% last year.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** Las fábricas alemanas dependen de tierras raras y minerales críticos chinos; China ejerce palanca retrasando los suministros más que cortándolos, lo que impide planificar a las empresas; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «It's not so much that China has stopped supplying Germany with rare earths or critical minerals. It's rather that they delayed it.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «The US is far and away India's largest export market. So they can't afford to alienate the US.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** Un defensor de los recortes sostiene que los países receptores aceptan un trato más transaccional, como el que ya tienen con China, y que el 'soft power' de EE. UU. es una narrativa de los medios; el reportaje sugiere en cambio pérdida de credibilidad estadounidense; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «a lot of countries, particularly the places where allegedly we're losing the soft power, are perfectly happy to deal in a more transactional environment.» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓
- **Hecho:** China va camino de invertir 142.000 millones de dólares en fabricación de chips (estimación de la Semiconductor Industry Association), como parte de décadas de política industrial; plazo concreto de la inversión no indicado.
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «China's on track to invest $142 billion into chip making.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** En junio de 2026 el uso global de modelos de IA chinos superó por primera vez al de los estadounidenses; según OpenRouter, Singapur, Alemania y ya también EE. UU. usan más modelos chinos que estadounidenses; causa no indicada.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «In June, global usage of Chinese AI models overtook those from the US for the first time.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** Prácticamente toda gran tecnológica china (Baidu, Alibaba, Tencent) tiene o entrena un modelo de IA, y las startups Moonshot, DeepSeek, Zhipu y MiniMax compiten agresivamente; Moonshot lanzó Kimi K3 de 2,8 billones de parámetros.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «In China, you have Moonshot, DeepSeek, Zhipu, MiniMax. These companies are really coming up with breakthrough innovations and they're very aggressive in terms of how they're approaching the market.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** Un mismo sitio web cuesta unos 50 USD con un modelo cerrado estadounidense frente a 12 USD con Kimi K3 chino (una cuarta parte); el nuevo GPT 5.6 Luna de OpenAI lo hace por poco más de 4 USD, igualando a las alternativas chinas baratas.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «With Anthropic's Claude Fable 5, you get this polished fully functional website for about $50. Not too bad, right? But China's Kimi K3 can create a similar site for just $12.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** China impulsa modelos de pesos abiertos, que aceleran la difusión y cierran la brecha, pero tienen problemas de monetización: guerra de precios durante más de un año y consumidores chinos poco dispuestos a pagar.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «But this model comes with a key disadvantage. Nobody has quite figured out how to make money. It's really been sort of a race to the bottom for more than a year now.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** EE. UU. discute en 2026 prohibir empresas y modelos de código abierto chinos y acusa a China de obtener chips por puertas traseras y copiar modelos, mientras los controles de exportación de chips y equipos han frenado la IA china; cifra y plazo exactos no indicados.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «There has been discussion in Washington DC about banning some of these Chinese companies, especially the Chinese open source models.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** La ventaja de coste de la IA china viene de electricidad más barata, talento mucho más barato y modelos de pesos abiertos; una startup de EE. UU. redujo su factura de unos 1,5 millones de USD al mes a unos 100.000 USD (10 veces menos) al pasar a modelos abiertos; plazo no indicado.
  - **Funcionalidad sugerida:** [Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país](#centros-datos-ia) · interfaz: Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
  - «China's electricity is cheaper. It has abundant access to talent at a, also a fraction of the cost that US companies must pay top engineers.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** China ha hecho de la IA y la robótica humanoide un nuevo motor de crecimiento porque los pilares tradicionales fallan (inmobiliario en declive desde 2018) y apuesta por exportar IA asequible al mundo en desarrollo; peso en el PIB no indicado.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «The traditional pillars of China's economies are faltering, and China has made AI as one of its new growth drivers.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** EE. UU. mantiene ventaja en modelos de frontera, cómputo y chips, y las empresas chinas de IA están limitadas por escasez de capital y valoraciones que son una fracción de las de las grandes de EE. UU.; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «China's ability to keep up with the US is also limited by the relative scarcity of capital to keep their projects going. In terms of their market valuation, they are a fraction of some of the top US players.» — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4) · cita ✓
- **Hecho:** China invirtió mucho dinero en Pakistán para construir el Corredor Económico China-Pakistán, y Pakistán equilibra a EE. UU. y China, con una flota de cazas de ambos países (monto y plazo no indicados).
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «China invested lots of money in Pakistan to build out what they call the China-Pakistan economic corridor.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** Mientras EE. UU. recorta la financiación científica, China aumenta su inversión en ciencia y su biotecnología se ha acelerado con apoyo estatal y ensayos en humanos más rápidos; Doudna ve posible que China tome la delantera al menos inicialmente (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Capacidad tecnológica e innovación por país (IA, I+D, capital riesgo)](#capacidad-tecnologica-innovacion) · interfaz: Top-bar TechPanel (comparador) + vista del árbol tecnológico del país.
  - «at the same time that the United States is pulling back on funding, we're seeing a, you know, a big investment in science in China.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** Doudna rebaja el hype de la IA en descubrimiento de fármacos: los chatbots no generan ideas nuevas, hacen falta más y mejores datos, y descarta promesas como curar el cáncer en 48 horas; el experimento chino de bebés editados de 2018 sigue siendo precedente de riesgo ético y regulatorio.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «I'm not seeing chatbots coming up with a brand new idea for something that nobody else ever thought of.» — [Why AI Hasn't Cured Anything...Yet, According to Jennifer Doudna | The Circuit](https://www.youtube.com/watch?v=n-hWHV2ZKOA) · cita ✓
- **Hecho:** Un estudio señala que la Generación Z china es más aversa al riesgo que otras generaciones chinas y tiende a invertir más en oro (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «There's one study that looked at Gen Zers in China and find that they are more risk averse than other Chinese generations.» — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc) · cita ✓
- **Hecho:** China añadió en 2025 más de 500 GW de capacidad eléctrica en 12 meses, equivalente a todo el sistema eléctrico de la India (causa no indicada).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «It added enough power to match India's entire electricity system, more than 500 gigawatts in just 12 months.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** En China la capacidad instalada de solar y eólica ronda el 50%, pero su generación apenas supera el 20%, por el recorte (curtailment) de energía renovable; en el primer semestre de 2026 la energía desperdiciada podría haber abastecido a Francia.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «China's installed capacity of all solar and wind is about 50% but the generation from solar and wind is actually only just over 20%.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** China es líder mundial en almacenamiento en baterías: aumentó su capacidad de ion-litio un 84% entre 2024 y 2025 y tiende miles de km de líneas de larga distancia desde el Gobi a los centros urbanos, pero ambos activos están infrautilizados.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «It's also become the global leader in battery storage, increasing its lithium ion battery capacity by 84% between 2024 and 2025» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** Pekín se ha comprometido a tener un mercado eléctrico nacional unificado en 2030, rompiendo las barreras provinciales y pasando de un despacho controlado por la red a mercados mayoristas (avance actual no indicado).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «It says it will have a unified national power market by 2030, moving it one step closer to the energy abundance Chinese officials hope will power the future economy.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** La red china la operan un par de gigantes estatales con despacho centralizado a la antigua y cada provincia es responsable de su propio suministro, lo que impide compartir energía en picos de demanda.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «You don't have one unified power market, but in fact, every province is responsible for securing its own energy supply.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** El carbón sigue siendo difícil de apagar en China, que es con diferencia el mayor consumidor y productor mundial, y parte de su generación está bloqueada en contratos anuales, lo que fuerza recortes de renovables a final de año.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «Towards the end of the year, if solar and wind generation has been quite high, it's going to be curtailed in the last few months because these coal power plants need to fulfill their contracts.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** Seres opera en Chongqing una Super Factory con 3.000 robots y, según la empresa, sus vehículos de lujo AITO superaron el millón de entregas en 46 meses, un récord en el mercado de VE chino.
  - **Funcionalidad sugerida:** [Ampliación de instalaciones corporativas a vehículos eléctricos, aeroespacial y consumo](#ampliacion-instalaciones-corporativas) · interfaz: Capa 'footprint' del mapa (map2d/render-facilities.ts).
  - «According to Seres, its luxury AITO vehicles passed one million deliveries in just 46 months, a record for China's EV market.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** China apuesta por IA, robótica y manufactura avanzada, que requieren mucha energía, para crear una capa de electricidad limpia casi infinita y barata como ventaja competitiva industrial (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «So it wants to create this layer of almost infinite, cheap, clean electricity that its industries can tap into.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **Hecho:** A finales de 2024 el gobierno chino indicó que tenía casi 500 embarcaciones eléctricas operando, la mayoría ferris.
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «We saw China's government at the end of 2024 indicate they had almost 500 electric powered vessels on the water. The majority of those were ferries.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **Hecho:** China concentra el 98 % del comercio de Corea del Norte y es su principal destino de exportación, fuente de importaciones y proveedor de energía; plazo no indicado y causa: aislamiento del régimen por las sanciones.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China is still the most important backer for the North Korean economy. It's where 98% of North Korea's trade comes from.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista para reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «He really believes that the US is in an existential competition with China over leadership of this important technology.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Trump firmó una orden para imponer un arancel global del 10 % bajo la Sección 122, sobre los aranceles normales ya vigentes (fecha exacta no indicada; causa no indicada en el hallazgo).
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «Today I will sign an   order to impose a 10% global tariff under Section 122 over and above our normal tariffs   already being charged.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **Hecho:** Según Schwarzman, EE. UU. y China suman aproximadamente el 42 % de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa (fechas no indicadas).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «These are two countries that understand that together they have approximately 42% of the world's economy.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓

### GB (18)

- **Hecho:** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** El coste de endeudamiento a largo plazo del Reino Unido ha subido al nivel más alto desde 1998 y los inversores exigen una prima creciente frente a EE. UU., Francia, Italia y Alemania; fecha no indicada, causa no indicada.
  - **Funcionalidad sugerida:** [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) · interfaz: Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
  - «The cost of long-term UK government borrowing had been falling. Now it's risen to the highest level since 1998.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** La deuda pública británica ronda el 94-96 % del PIB (44 % en 1979) y el pago de intereses cuesta aproximadamente una vez y media el presupuesto de defensa; fecha de la cifra no indicada, causa no indicada.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «Now national debt is between about 94 and 96%. And debt interest alone is costing roughly one and a half times the entire defense budget.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** El primer ministro británico Andy Burnham plantea romper con cuatro décadas de ortodoxia de libre mercado, incluida la derogación del veto thatcheriano a la propiedad pública de las compañías de agua; plazo y causa no indicados.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «Prime Minister Andy Burnham now argues that Britain must break with four decades of free-market orthodoxy. The repeal of Margaret Thatcher's ideological ban on public ownership of water companies.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** Nacionalizar el agua en Reino Unido, aun recibiendo Thames Water gratis, obligaría al Estado a financiar con miles de millones de libras la inversión necesaria que hoy aportan inversores privados; plazo no indicado.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «Even if it got hold of Thames Water, for example, for free, the government would then have to pony up billions of pounds for the necessary investment» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** Se baraja la nacionalización de British Steel, en dificultades, y Burnham quiere una estrategia industrial doméstica con reindustrialización, aunque no hay una gran bolsa de dinero; plazo no indicado.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «There's been potential nationalization of British steel, which is in trouble. Burnham does seem to want to pursue a domestic industrial strategy, and he has talked about re-industrialization.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** La nacionalización ferroviaria en Reino Unido es casi gratuita porque los operadores solo tienen contratos de servicio: al expirar, el Estado asume la operación sin comprar infraestructura; plazo de expiración no indicado.
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «The nationalization of rail is very simple. It's free effectively because there is no infrastructure to buy. All that the rail operators have is a service contract.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** Si los mercados perciben que Burnham se endeuda de forma irresponsable para financiar sus promesas, cobrarán más por la deuda del Reino Unido, lo que limita su margen de maniobra; cifra y plazo no indicados.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «if the bond markets get a sense that he's borrowing money irresponsibly, they will charge him more for that borrowing.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓
- **Hecho:** El modelo de Bloomberg (23 países de la OCDE como contrafactual) estima un golpe inicial del 10% al PIB británico (300.000 millones de libras) por el Brexit, que tras excluir a Irlanda y ajustar por EE. UU. (shock energético, estímulo fiscal, IA) baja a entre el 2% y el 4% del PIB; plazo de medición no indicado.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «We get down to a number between two and four percent of GDP, which we think is a reasonable estimate for the hit to the economy.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** Los servicios financieros británicos han ido mejor que las exportaciones de bienes desde el Brexit, y Londres sigue siendo destino masivo de capital riesgo, sede de gestoras de fondos de la UE y centro de derivados en euros; cifras no indicadas.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «Financial services in particular have done pretty well in the years since we left the EU. Much better than goods exports, for example.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** Reino Unido tiene la energía más cara del mundo desarrollado, un factor de política interna que pesa sobre la economía al margen del Brexit; cifras y causa exacta no indicadas.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «It's impossible to say that having the most expensive energy in the developed world hasn't made a significant difference.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** Reino Unido ha tenido cinco primeros ministros desde el Brexit, con fragmentación del sistema de partidos, y Nigel Farage es el favorito para ganar las próximas elecciones y ser primer ministro; fecha de las elecciones no indicada.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «A single politician, Nigel Farage, who had most involvement in making that Brexit happen is the favourite to win the next election and be prime minister» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** El 52% de los británicos apoyaría reincorporarse a la UE según una encuesta reciente; Sunak y Starmer han buscado acercarse a la UE en defensa, seguridad, inmigración y economía, y un analista prevé una asociación tipo membresía asociada; fecha de la encuesta no indicada.
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Some advocate rejoining the EU, something a recent poll suggested 52% of the British public would now support.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** Estar fuera de la UE ha beneficiado algo a Reino Unido en IA, al evitar la regulación europea que preocupa a las grandes tecnológicas estadounidenses, además de una buena relación con Trump; magnitud no indicada.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «On all the things to do with AI, Britain has probably benefited a little bit by being outside the European Union, which most of the tech giants in America are slightly scared of.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** El mundo se divide en grandes bloques comerciales (UE, EE. UU., Asia) y Reino Unido queda aislado, con menos peso como puerta de acceso a Europa para EE. UU. y menos relevancia en la ONU; cifras y fechas no indicadas.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «a world which is divided into big trading blocs. The European Union, the United States, and to some extent Asian countries.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓
- **Hecho:** El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «The heat itself is a problem for the utility sector because things like transformers and different parts of the grid really aren't built for that kind of heat.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Only 25% of economic losses caused by climate hazards in Europe have insurance protection. The remaining 75% are covered by businesses and increasingly by governments that have to backstop these losses.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «If the trend of very hot summers continues, the cost of some of Europe's largest economies could run into the hundreds of billions, while some northern countries could fare better.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓

### IN (18)

- **Hecho:** India sufre su peor monzón desde el último El Niño: tuvo el quinto junio más seco registrado, seguido de una inundación en julio que concentró la lluvia de un mes en una semana; impacto en cosecha e inflación no indicado.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «India had its fifth driest June on record, only to be followed up by a massive flood in July, dumping a month's worth of precipitation in a single week.» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓
- **Hecho:** El crudo ruso alcanzó casi el 56% de las importaciones totales de petróleo de India en julio de 2026, unos 6.400 millones de dólares al mes, frente a prácticamente cero antes de 2022; causa implícita: crudo ruso con descuento tras las sanciones occidentales por la guerra de Ucrania (el video no detalla el descuento).
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Russian crude reached nearly 56% of India's total imports in July 2026. That's around $6.4 billion worth of Russian oil a month.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** EE. UU. bajo Trump usó aranceles adicionales y presión pública contra las compras indias de crudo ruso; tras la guerra EE. UU.-Israel con Irán, Washington suavizó el tono y emitió exenciones (waivers) para comprar petróleo ruso, que India aprovecha; cifra de aranceles y fecha de las exenciones no indicadas.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «There are refresh waivers for countries around the world to buy Russian oil. And India has certainly taken advantage of that.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** Rusia sigue siendo el mayor proveedor de defensa de India, con alrededor del 48% de sus necesidades militares, y casi toda la flota de cazas india es rusa, lo que implica dependencia de repuestos y tecnología; plazo no indicado, causa: relación histórica de compras de armamento.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «Russia remains India's largest defense supplier. You look at India's fighter fleet, almost all of it is Russian.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** La central nuclear de Kudankulam (Tamil Nadu), proyecto emblemático ruso-indio con Rosatom como constructora, es muy cara y se ha retrasado por la guerra de Ucrania, pero avanza y es pieza clave de la diversificación energética india hacia la energía nuclear; coste y fecha de finalización no indicados.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «The flagship project is Kudankulam,  which is a nuclear power plant in Tamil Nadu in the very south of India. It's been very, very expensive and delayed» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «The US is far and away India's largest export market. So they can't afford to alienate the US.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** Una encuesta de Pew indica que el 36% de los indios ve a Rusia como su principal aliado frente al 16% que señala a EE. UU., tras el deterioro de la imagen de EE. UU. por aranceles y la disputa sobre el alto el fuego con Pakistán; fecha de la encuesta no indicada.
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «A Pew survey recently said that 36% of Indians view Russia as India's top ally. Versus just 16% who see America's India's top ally.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo, por lo que el comercio digital podría quedar sujeto a impuestos nacionales; fecha exacta de la conferencia no indicada.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** Los graduados jóvenes desempleados de India pasaron de menos de 1 millón en 1983 a 11 millones (16 veces) en unas cuatro décadas, mientras los graduados totales pasaron de 4,8 a 63 millones, porque la creación de empleo no ha seguido el ritmo.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «In 1983, India was home to about 4.8 million young graduates. Over four decades, that total swelled 13-fold to 63 million. But job creation hasn't kept pace.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** De cada 100 jóvenes graduados indios, 50 tienen algún empleo, solo 26 con salario regular y solo 4 con contrato escrito, vacaciones pagadas y seguridad social; año de la medición no indicado.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «Out of every hundred young Indian graduates, 50 are employed in some form. But only 26 of these hold regular salaried roles as opposed to being self-employed or in casual work, for instance.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** Los salarios medios mensuales de los graduados varones en India caen desde su pico de 2012 y están estancados; los repartidores gig ganan unas 500-700 rupias al día (5-8 dólares) trabajando 8-10 horas.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «They work eight to 10 hours a day. They make 500 to 700 rupees a day. That's about five to eight US dollars.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** El movimiento juvenil 'Cockroach' (CJP) forzó la dimisión del ministro de Educación Dharmendra Pradhan, la primera vez desde 2014 que un ministro de Modi dimite por presión pública, tras la filtración de un examen médico de acceso que afectó a 2,2 millones de candidatos.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «This was the first time since Modi took power in 2014 that one of his cabinet ministers had resigned under public pressure.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** El partido de Modi afronta el año próximo elecciones clave en Uttar Pradesh, el estado más poblado de India, donde el desempleo juvenil es una preocupación central; fecha exacta no indicada.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «Next year, Modi's party faces a key election in Utah Pradesh, India's most popular state, where youth unemployment is a major concern.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «From Nepal to Bangladesh and Indonesia, youth-led unrest is rattling governments across Asia, fueled by anger over inequality, corruption, and widespread unemployment.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** India tiene 367 millones de jóvenes (la mayor población joven del mundo, un tercio de su fuerza laboral) y 8 millones de graduados entran al mercado laboral cada año.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «Eight million graduates enter the workforce every year in India.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** Para ser economía desarrollada en 2047, India necesita crecer de forma sostenida entre 8% y 9% durante 25 años, creando suficiente empleo y subiendo ingresos para seguir siendo gran centro de demanda mundial.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «For India to be able to get to a developed status by 2047, the country will have to consistently grow between eight to 9% for the next 25 years.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓
- **Hecho:** El acercamiento de Pakistán a Trump es frágil y personalista: el caso de India, que pasó de aliado a ser castigado, muestra que puede revertirse rápido (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Trump can be very fickle. He could like you one minute and you could be in the doghouse the next minute.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓

### DE (15)

- **Hecho:** La industria aporta cerca del 20 % del valor añadido total de Alemania, más que en Francia, España o Italia, y la producción industrial alemana lleva cayendo desde su máximo de 2018; causa y magnitud de la caída no indicadas en esta cita.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «It accounts for roughly 20% of the country's total value added. It's higher than other big countries in the EU like France or Spain or Italy.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** El PIB alemán de los últimos 20 años está entre un 6 y un 7 % por debajo de un control sintético de países pares (Corea, Japón, Finlandia, Canadá, Suecia), lo que indica una pérdida duradera de potencial y no solo un ciclo; causa no indicada en la cita.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «That, right there is a six to seven percent difference. And that's massive.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** Rusia suministraba cerca de la mitad de la demanda de gas natural de Alemania; el corte de ese suministro elevó los costes energéticos muy por encima de los de EE. UU. y China y golpeó a los sectores intensivos en energía; plazo preciso no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Russia supplied about half of Germany's natural gas demands.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** Entre 2022 y 2025 cerca del 10 % de la capacidad química europea quedó marcada para cierre; BASF emplea en Ludwigshafen a menos de 30.000 personas (mínimo desde los años 50) mientras construye en China una planta de miles de millones de euros; causa implícita en los costes energéticos y la competencia, no precisada en la cita.
  - **Funcionalidad sugerida:** [Estructura productiva, desindustrialización y clústeres regionales](#estructura-productiva-clusteres) · interfaz: Bloque de composición del PIB en SovereignMetricsSection + capa 'Polos Industriales' del mapa (MapModeSelector, ficha).
  - «Within three years, 2022 to 2025, nearly 10% of European chemical capacity was earmarked to close.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** El comercio Alemania-China pasó de superávit a déficit creciente: en 2025 las exportaciones alemanas de maquinaria y bienes industriales a China cayeron cerca del 10 % y las de coches más del 30 %, mientras suben las importaciones chinas (China Shock 2.0); causa no desglosada más allá de la competencia china.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «Vehicle exports to China were down more than 30% last year.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** Las fábricas alemanas dependen de tierras raras y minerales críticos chinos; China ejerce palanca retrasando los suministros más que cortándolos, lo que impide planificar a las empresas; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «It's not so much that China has stopped supplying Germany with rare earths or critical minerals. It's rather that they delayed it.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** El canciller Merz relajó el freno a la deuda (Schuldenbremse) y lanzó un gran paquete de gasto en defensa e infraestructura cuyo impacto tardará en llegar a la economía; tamaño del paquete y plazo exacto no indicados.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «Chancellor Friedrich Merz loosened one of the German government's fiscal constraints, the so-called debt break, and unleashed a huge spending package for defense and infrastructure.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** Una fuerza laboral que envejece y se reduce, junto con un crecimiento débil, presiona la financiación del Estado de bienestar y alimenta el voto a los extremos políticos, lo que dificulta las reformas; cifras y plazo no indicados.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «Another long-term hurdle for companies is a shrinking, aging workforce.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «The European Commission says EU member countries need to be spending about $80 billion a year to adapt to climate change between now and 2050.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El Rin, por donde circula cerca del 80% de las mercancías transportadas por barco en Alemania, registra en 2026 un nivel de agua medio aún inferior al de la ola de calor de 2018, lo que amenaza la logística industrial alemana.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «The Rhine is a central artery for the German economy. About 80% of all goods that are transported by ship are transported along the Rhine.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El calor reduce el caudal de los ríos, lo que baja la generación hidroeléctrica, y limita la refrigeración de las centrales nucleares, que necesitan mucha agua; ambos efectos tensionan un sistema eléctrico europeo ya precario por Ucrania e Irán.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «That heat reduces the amount of flow going down those rivers, and that materially impacts the amount of power that can be generated by those hydropower facilities.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** La penetración de aire acondicionado en hogares sube con fuerza: Francia pasó de 7% en 2010 a 25% en 2020 y ahora ronda el 35%, frente a cerca de 65% en España y 20% en Alemania; los fabricantes vendieron unas tres veces lo esperado (la causa es el calor creciente).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «In 2010, about 7% of French households had air conditioning. By 2020, that's risen to about 25%, and then really into this year, it started to accelerate again and now we're at about 35%.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «The heat itself is a problem for the utility sector because things like transformers and different parts of the grid really aren't built for that kind of heat.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Only 25% of economic losses caused by climate hazards in Europe have insurance protection. The remaining 75% are covered by businesses and increasingly by governments that have to backstop these losses.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «If the trend of very hot summers continues, the cost of some of Europe's largest economies could run into the hundreds of billions, while some northern countries could fare better.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓

### BR (14)

- **Hecho:** La deuda pública de Brasil, que había bajado tras la pandemia, vuelve a crecer y el FMI estima que superará el 100% del PIB a finales de la década; el servicio de la deuda supera el 8% del PIB debido a los tipos de interés de doble dígito.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «But with double-digit interest rates, Brazil pays far more to service its borrowing. That cost is now over 8% of GDP.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Más del 80% de los hogares brasileños tiene algún tipo de deuda y los tipos rotativos de las tarjetas de crédito superan el 400% anual, lo que alimenta el riesgo de desaceleración o recesión del consumo; año no indicado.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «The rotating interest rates of credit cards in Brazil reach over 400% a year. So this is a snowball that for some people is impossible to get out of.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Las empresas brasileñas con pagos atrasados deben cerca de 239.000 millones de reales (unos 46.000 millones de dólares), un récord; el 90% de los nueve millones de negocios morosos son pequeñas y microempresas, y el agro está en niveles récord de impago; causa implícita: tipos de interés altos.
  - **Funcionalidad sugerida:** [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) · interfaz: Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
  - «Across Brazil, companies behind on their payments now owe nearly 239 billion reais, or about $46 billion, a record high.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Raizen ha reestructurado su deuda este año y Casas Bahia, una de las cadenas minoristas más populares de Brasil, ha pedido protección por quiebra; causa: carga de deuda con tipos altos; cifras de las deudas no indicadas.
  - **Funcionalidad sugerida:** [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) · interfaz: Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
  - «We had Casas Bahia, one of the most popular retail chains in Brazil just very recently filing for bankruptcy protection.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Las apuestas en línea, legalizadas en 2018, mueven hasta 30.000 millones de reales (5.800 millones de dólares) al mes según el Banco Central de Brasil, lo que agrava el sobreendeudamiento de los hogares.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «According to Central Bank estimates, Brazilians wager as much as 30 billion reais or 5.8 billion dollars a month.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Pix, el sistema de pago instantáneo gestionado por el Estado, ha sustituido al efectivo e incorpora un componente de crédito instantáneo; junto con las fintechs ha ampliado el acceso al crédito, y entre 2020 y 2024 las tarjetas de crédito activas crecieron aproximadamente tres cuartas partes, con 37 millones de usuarios más.
  - **Funcionalidad sugerida:** [Salud del consumidor y vivienda por país](#salud-consumidor-vivienda) · interfaz: DalioMacroSection (ciclo de deuda privada) + bloque consumidor en SovereignMetricsSection.
  - «Between 2020 and 2024, the number of active credit cards in Brazil jumped by roughly three quarters, while the number of people using them increased by 37 million.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** Más del 50% del presupuesto federal brasileño se destina a pensiones y gasto obligatorio constitucional, algo que no se puede recortar; el gobierno de Lula impulsa gasto social (Bolsa Familia) que puede alimentar la inflación, mientras su rival Flavio Bolsonaro promete reformar las reglas fiscales con pocos detalles; plazo electoral no indicado.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «So over 50% of Brazil's federal budget is spent on pensions, something you cannot cut.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** El banco central brasileño recorta los tipos antes de las elecciones y se espera que los reduzca más hasta 2028, tras haber pasado de mínimos récord a dos dígitos en año y medio; nivel actual de la Selic no indicado.
  - **Funcionalidad sugerida:** [Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo](#regimen-credito-tipos) · interfaz: Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
  - «the central bank has been cutting interest rates ahead of the elections and is expected to further reduce them into 2028.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **Hecho:** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo, por lo que el comercio digital podría quedar sujeto a impuestos nacionales; fecha exacta de la conferencia no indicada.
  - **Funcionalidad sugerida:** [Observatorio de regulación sectorial por jurisdicción (IA, digital, biotecnología) y opinión pública](#regulacion-sectorial-jurisdiccion) · interfaz: Nueva sección sidebar/RegulatoryRiskSection.tsx + top-bar TechPanel (regulación de IA).
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** El magnate de la soja Eraí Maggi (Bom Futuro) habría depositado por una finca selvática de 30.000 hectáreas en San Ignacio de Velasco, Bolivia, y planea invertir con una nueva carretera Brasil-Bolivia; monto y fecha del depósito no indicados.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «Bom Futuro Maggi's agribusiness Empire has allegedly placed a deposit on a nearby pristine 30,000 hectare forested plot. An investment of this size tends to attract others.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** Brasil respaldó formalmente carreteras y un puente fluvial que conectan con Bolivia, a mayor escala de lo sugerido antes, incluida la ruta hacia San Ignacio; más del 90% de la deforestación amazónica ocurre junto a carreteras; fecha del respaldo no indicada.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Roads and a river bridge connecting it to Bolivia. It's much larger than anything previously suggested. Every time a road goes in, the forest comes out.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** La pérdida de bosque en Brasil cayó un 41% en 2025, pero el modelo de intensificación agrícola parece desplazar la deforestación a Bolivia; la soja es el primer producto agrícola de exportación boliviano y tres cuartas partes se destinan a pienso.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «Yet, Brazil has also been celebrated as a conservation success story. With forest lost dropping 41% in 2025 alone.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** Los científicos advierten de que la deforestación continuada podría desencadenar un punto de inflexión del Amazonas en la década de 2030.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Scientists around the world warn that continued deforestation could trigger an Amazon tipping point by the 2030s.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓

### -- (14)

- **Hecho:** El precio del cobre se ha más que duplicado en los últimos 10 años por la demanda de electrificación (coches eléctricos, turbinas eólicas).
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «And its value has more than doubled over the last 10 years.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** La demanda mundial de electricidad se duplicaría hacia 2050 y, sin cobre, no habría redes, renovables, vehículos eléctricos ni centros de datos; causa: electrificación y crecimiento de centros de datos.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «The global demand for electricity is expected to double by 2050.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** La oferta de cobre es estructuralmente limitada: no se descubren minas nuevas fácilmente, abrir una cuesta mucho dinero y años, y la mayoría de mineras son reacias a invertir miles de millones; cifras concretas y plazo no indicados.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Opening a new mine costs a pretty penny, and it takes years to build.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** El cobre que queda en la superficie está atrapado en menas de baja ley (0,25-0,3 % de cobre) y los métodos tradicionales recuperan aproximadamente la mitad; plazo no indicado.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Most of the copper that's left on the surface of the planet is trapped in low-grade ores. I am talking rocks that are like 0.25 to 0.3% copper.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** La lixiviación en pilas tradicional recupera solo un 20-50 % del cobre, y la biominería (microbios) de empresas como Endolith busca elevar esa recuperación sin abrir minas nuevas, aunque aún no está probada a escala real.
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «Traditionally, heap leaches get about 20 to 50% of copper out. Endolith says they can get more» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** El Niño de 1982-83 redujo la productividad económica mundial en 4,1 billones de dólares y el de 1997-98 en 5,7 billones (estimaciones de estudios citados en el video); plazo del impacto: largo plazo; causa: eventos ENSO que alteran clima y cosechas, aunque el video no detalla el mecanismo; los episodios recientes podrían costar más.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «the 1982, 83 El Niño had long-term impacts of decreasing economic productivity of the world by $4.1 trillion. A similar analysis for 97, 98 led to $5.7 trillion of economic damages» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓
- **Hecho:** Cerca del 25% del comercio mundial ya no se rige por las reglas de la OMC y alrededor de tres cuartas partes sí; fecha y causa de la fragmentación no indicadas.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «what do we do with say the 25% that is not going on according to WTO rules?» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** El comercio digitalmente entregado (cine, música, educación, salud) crece alrededor de un 6% anual y ronda los 4 billones de dólares dentro de un comercio mundial de unos 33 billones; periodo de medición no indicado, causa no indicada.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «growing the fastest at about 6% per year. It's about $ 4 trillion now,» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** El transporte marítimo internacional emitió en 2024 unos 740 millones de toneladas de CO2 equivalente, cerca del 1,4% de las emisiones globales, más que Alemania o Corea del Sur.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «international shipping accounted for about 740 million tons of carbon dioxide equivalent. That's the measure that we use to calculate all greenhouse gases. To put it in context, that was roughly 1.4% of all global emissions.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **Hecho:** Las baterías no sirven para el transporte oceánico de larga distancia, que seguirá dependiendo de combustibles alternativos (hidrógeno, quizá nuclear); solo los ferris y las rutas cortas se electrifican.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «The longer distance ships that are crossing the, crossing oceans will never go electric.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **Hecho:** El mercado de ferris eléctricos es mínimo frente a la flota mundial (menos del 1% de los buques), aunque los ferris transportaron más de 4.000 millones de pasajeros al año y sostienen 60.000 millones de dólares de PIB.
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «ferries carried more than four billion passengers annually and supported $60 billion in GDP globally.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **Hecho:** En 2025 las economías con superávit por cuenta corriente sumaron unos 2,5 billones de dólares, con déficits equivalentes en el lado opuesto; la brecha es la mayor desde 2008, con causa vinculada al auge de la IA según el video.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «In 2025, economies running current account surpluses recorded about $2.5 trillion between them.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Los países que votan igual en la ONU invierten más entre sí, mientras los que votan en direcciones opuestas reducen la inversión mutua; la geopolítica condiciona así los flujos de capital (cifra y plazo no indicados).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «countries that vote the same way in the United Nations, they're more likely to invest in each other.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **Hecho:** Las inversiones transfronterizas crecieron del 27 % del PIB mundial en 1980 al 141 % en 2008, pero desde la crisis financiera se han estancado pese a haber más dinero que nunca.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «They grew from 27% of global GDP in 1980 to 141% in 2008. But since the financial crisis, things have slowed down.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓

### FR (12)

- **Hecho:** La economía de influencers superó los 33.000 millones de dólares el año pasado y los microinfluencers generan engagement casi triple que los macroinfluencers; L'Oréal trabaja con cerca de medio millón de creadores.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «The influencer economy is booming and surpassed 33 billion dollars last year.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **Hecho:** Hacia 2040 el 43% de la población mundial tendrá pelo rizado o afro y hacia 2050 una de cada seis personas tendrá más de 65 años, lo que L'Oréal usa para orientar su innovación en cuidado capilar específico y ciencia de la longevidad.
  - **Funcionalidad sugerida:** [Demografía y mercado laboral por país](#demografia-mercado-laboral) · interfaz: Nueva sección sidebar/DemographySection.tsx (ficha) junto a la dimensión 'Fractura Demográfica/Social' de DimensionSection.
  - «by 2040, 43% of the world will have curly or coily hair.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **Hecho:** L'Oréal adquirió ModiFace en 2018 y escaló la prueba virtual con realidad aumentada a todas sus marcas, plataformas y minoristas, además de diagnóstico de piel con reconocimiento de imagen entrenado con miles de imágenes anotadas por dermatólogos; cifras no indicadas.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «back in 2018, we L'Oreal actually acquired a company called Modiface, and Modiface was kind of leading in this beauty augmented reality and virtual try-on technology» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **Hecho:** Los LLM y chatbots se convierten en la puerta de entrada al descubrimiento de belleza (OpenAI llegaría a 1.000 millones de usuarios en 2026); L'Oréal busca posicionarse en la capa de respuestas con 280.000 profesionales sanitarios y 850 publicaciones como respaldo de autoridad.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «if LLMs are becoming the front door to beauty discovery, then what what do we do anyway? Billions of consumers are chatting and asking questions» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **Hecho:** L'Oréal decidió no usar caras, cuerpos, pelo o piel realistas generados por IA para mostrar beneficios del producto en su comunicación externa, y limita la IA a fondos y automatización de producción de contenido; plazo no indicado.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «we are not going to use AI-generated, lifelike face, body, hair, or skin to enhance the product benefits in our external communication because real people use a shampoo.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **Hecho:** Incendios forestales en Europa Occidental han obligado a más de 300.000 personas a abandonar sus hogares en Francia y España, con estado de emergencia; fecha exacta y causa del brote no indicadas en el hallazgo (el video lo enmarca en el contexto del Super El Niño).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Wildfires in Europe. More than 300,000 people have fled their homes in France and Spain.» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓
- **Hecho:** La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «The European Commission says EU member countries need to be spending about $80 billion a year to adapt to climate change between now and 2050.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El calor reduce el caudal de los ríos, lo que baja la generación hidroeléctrica, y limita la refrigeración de las centrales nucleares, que necesitan mucha agua; ambos efectos tensionan un sistema eléctrico europeo ya precario por Ucrania e Irán.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «That heat reduces the amount of flow going down those rivers, and that materially impacts the amount of power that can be generated by those hydropower facilities.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** La penetración de aire acondicionado en hogares sube con fuerza: Francia pasó de 7% en 2010 a 25% en 2020 y ahora ronda el 35%, frente a cerca de 65% en España y 20% en Alemania; los fabricantes vendieron unas tres veces lo esperado (la causa es el calor creciente).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «In 2010, about 7% of French households had air conditioning. By 2020, that's risen to about 25%, and then really into this year, it started to accelerate again and now we're at about 35%.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «The heat itself is a problem for the utility sector because things like transformers and different parts of the grid really aren't built for that kind of heat.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Only 25% of economic losses caused by climate hazards in Europe have insurance protection. The remaining 75% are covered by businesses and increasingly by governments that have to backstop these losses.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «If the trend of very hot summers continues, the cost of some of Europe's largest economies could run into the hundreds of billions, while some northern countries could fare better.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓

### KR (10)

- **Hecho:** Samsung y SK Hynix suponen más del 50% del KOSPI, por lo que el índice coreano se comporta casi como dos acciones y es muy vulnerable a un giro del ciclo de IA.
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «Samsung and SK Hynix make up more than 50% of the KOSPI. The Korean stock market trades like a penny stock or trades like an individual volatile stock.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** El KOSPI subió un 200% en 12 meses (más que triplicado), muy por encima del S&P y el Nasdaq.
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «The KOSPI index, which tracks Korea's public companies, climbed 200% over the last 12 months.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** En el año Samsung llegó a subir un 500% y SK Hynix más de un 1.000%; se espera que superen a TSMC, que lideró en 2025; plazo exacto no indicado.
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «At points this year, Samsung has seen its stock rise 500%, while SK Hynix has surged more than 1,000%.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** Amazon, Google, Meta y Microsoft gastaron 376.000 millones de dólares en capex en 2025 y van camino de 725.000 millones en 2026; los centros de datos demandan chips de memoria que dominan Samsung y SK Hynix.
  - **Funcionalidad sugerida:** [Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja](#ciclo-inversion-ia) · interfaz: Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
  - «2025 saw the four biggest US tech companies Amazon, Google, META and Microsoft spending $376 billion on capital expenditures, and the industry is on track to spend a whopping $725 billion in 2026.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** 14 millones de inversores minoristas de 51 millones de habitantes participan en la bolsa coreana, muchos apalancados con ETFs x2/x3; el regulador coreano lamenta su lanzamiento.
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «Out of 51 million population, 14 million people are retail investors.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** El presidente Lee Jae Myung impulsa el paso de la inversión en vivienda a mercados financieros y ha aprobado reformas de protección al accionista minoritario y gobierno corporativo; su popularidad queda ligada a la bolsa; fecha exacta no indicada.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «He's encouraged the shift from investing in housing to financial markets. The former trader turned politician has enacted sweeping reforms, leveling the playing field for smaller shareholders and strengthening corporate accountability.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** El 4 de marzo de 2026 el KOSPI cayó un 12% en un día, arrastrado por temores del conflicto en Oriente Medio.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «On March 4th this year, the KOSPI plunged 12%, pulled down by concerns over the Middle East conflict.» — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg) · cita ✓
- **Hecho:** Corea del Sur es conocida por la negociación minorista de ETFs apalancados, mientras que en Europa el apetito es más moderado y el ahorro se concentra históricamente en depósitos bancarios (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Mercado bursátil por país: concentración, valoración, rendimientos y base inversora](#mercado-bursatil-pais) · interfaz: Bloque de mercado en DalioMacroSection (fase de burbuja) + SovereignMetricsSection.
  - «We've seen the same in South Korea where they're famous for trading these leveraged ETFs. But it's been a little bit more muted in Europe where historically people have put up more of their money in bank deposits» — [Why Gen Z Is Gambling With Its Future](https://www.youtube.com/watch?v=nBOmghLypWc) · cita ✓
- **Hecho:** El PIB de Corea del Norte según el Banco de Corea es de unos 30.000 millones de dólares, 60 veces menor que el de Corea del Sur (unos 1,9 billones); año de la estimación y causa de la brecha no indicados.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «Estimates from the Bank of Korea put its economy currently, or GDP, at around $30 billion. And that is 60 times smaller than its southern neighbor South Korea» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses y financian así el propio boom de IA (flujo circular); cuantía y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓

### JP (9)

- **Hecho:** El gobierno de Takaichi plantea una inversión pública y privada de 370 billones de yenes en 14 años, hasta 2040, repartida en 17 sectores estratégicos que incluyen IA, defensa, energía, semiconductores, tecnología alimentaria y contenidos como manga y anime.
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «a 370 trillion yen investment, public and private, over 14 years. She has laid out 17 crucial sectors, including artificial intelligence, defense, energy, and semiconductors» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** Takaichi se compromete a bajar el impuesto al consumo sobre alimentos y bebidas sin alcohol del 8% al 1% durante dos años desde abril de 2027, lo que preocupa a los mercados por el aumento de la deuda pública.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «cut the consumption tax on food and soft drinks for two years from 8% to 1%. But this plan, which is set to start in April of 2027, also has markets concerned about mounting government debt.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** La deuda pública de Japón supera el doble de su PIB y su servicio absorbe alrededor de una quinta parte del presupuesto anual; financiar el plan de 370 billones exigiría emitir más bonos; cifra de emisión adicional no indicada.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «Still, servicing that debt swallows up about a fifth of» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** Tras decir Takaichi que una guerra por Taiwán sería una amenaza existencial para Japón, China respondió con una campaña diplomática para aislarla; Pekín es el mayor socio comercial de Japón y su máximo diplomático describe la relación en mínimos; plazo exacto no indicado.
  - **Funcionalidad sugerida:** [Registro de eventos con reacción de mercado y empresas afectadas](#eventos-reaccion-mercado) · interfaz: Etiquetas de empresas afectadas e impacto histórico en NewsPanel + contexto en CausalAnalysisSection.
  - «When Takaichi said that a war over Taiwan would be an existential threat for Japan» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** El yen cotizó por encima de 160 por dólar en julio de 2026, cerca de su mínimo en cuatro décadas, y Japón y el Tesoro de EE. UU. intervinieron de forma coordinada por primera vez en unos 15 años; Bessent dice que no dudará en volver a hacerlo. Japón posee más de un billón de dólares en deuda estadounidense; causa no indicada.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «A coordinated intervention for the first time in about 15 years.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** Japón depende en gran medida del petróleo de Oriente Medio y la guerra de EE. UU. e Israel con Irán encareció energía y materiales, incluso interrumpiendo el suministro de tinta para envases; el gobierno subvenciona combustible y diversifica proveedores; cifras no indicadas.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Japan was hugely reliant on oil from the Middle East. They were very vulnerable to rising oil prices.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** El gasto en defensa de Japón pasó de cerca del 1 % del PIB durante décadas a cerca del 2 % desde 2022 bajo el primer ministro Kishida, y Takaichi quiere superarlo y reformar las directrices de defensa; plazo de la meta nueva no indicado.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «Japan has had defense spending of around 1% of GDP for decades. That changed in 2022 under previous Prime Minister Kishida.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** En Japón las muertes superan a los nacimientos y la población centenaria supera los seis dígitos, mientras Takaichi endurece las reglas de inmigración y promete mayor control pese a que el país necesita más trabajadores extranjeros; cifras exactas y plazo no indicados.
  - **Funcionalidad sugerida:** [Migración: flujos, dependencia sectorial y motor de shocks de política migratoria](#migracion-shocks-politica) · interfaz: Pestaña Migración dentro de sidebar/DemographySection.tsx (misma sección de la ficha demografia-pais).
  - «Japan currently needs more foreign workers, yet Takaichi has tightened immigration rules and promised tougher enforcement.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **Hecho:** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses y financian así el propio boom de IA (flujo circular); cuantía y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓

### RU (9)

- **Hecho:** El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «The LNG market is highly concentrated with the US, Qatar, Australia, and Russia making up 70% of the global supply.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** Rusia suministraba cerca de la mitad de la demanda de gas natural de Alemania; el corte de ese suministro elevó los costes energéticos muy por encima de los de EE. UU. y China y golpeó a los sectores intensivos en energía; plazo preciso no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Russia supplied about half of Germany's natural gas demands.» — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo) · cita ✓
- **Hecho:** El crudo ruso alcanzó casi el 56% de las importaciones totales de petróleo de India en julio de 2026, unos 6.400 millones de dólares al mes, frente a prácticamente cero antes de 2022; causa implícita: crudo ruso con descuento tras las sanciones occidentales por la guerra de Ucrania (el video no detalla el descuento).
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Russian crude reached nearly 56% of India's total imports in July 2026. That's around $6.4 billion worth of Russian oil a month.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** EE. UU. bajo Trump usó aranceles adicionales y presión pública contra las compras indias de crudo ruso; tras la guerra EE. UU.-Israel con Irán, Washington suavizó el tono y emitió exenciones (waivers) para comprar petróleo ruso, que India aprovecha; cifra de aranceles y fecha de las exenciones no indicadas.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «There are refresh waivers for countries around the world to buy Russian oil. And India has certainly taken advantage of that.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** Rusia sigue siendo el mayor proveedor de defensa de India, con alrededor del 48% de sus necesidades militares, y casi toda la flota de cazas india es rusa, lo que implica dependencia de repuestos y tecnología; plazo no indicado, causa: relación histórica de compras de armamento.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «Russia remains India's largest defense supplier. You look at India's fighter fleet, almost all of it is Russian.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** La central nuclear de Kudankulam (Tamil Nadu), proyecto emblemático ruso-indio con Rosatom como constructora, es muy cara y se ha retrasado por la guerra de Ucrania, pero avanza y es pieza clave de la diversificación energética india hacia la energía nuclear; coste y fecha de finalización no indicados.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «The flagship project is Kudankulam,  which is a nuclear power plant in Tamil Nadu in the very south of India. It's been very, very expensive and delayed» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «The US is far and away India's largest export market. So they can't afford to alienate the US.» — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE) · cita ✓
- **Hecho:** La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten; plazo no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «making a deal with Russia to try to get more supply of diesel on the market» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** Corea del Norte habría ganado hasta 12.800 millones de dólares solo con la venta de artillería y munición a Rusia (estimación del CSIS) y además recibe tecnología rusa, por ejemplo la defensa aérea de un nuevo destructor valorada en más de 20 millones; plazo no indicado y causa: la guerra de Rusia en Ucrania.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «The Center for Strategic and International Studies estimates North Korea has earned as much as $12.8 billion from this arms deal alone.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓

### CU (8)

- **Hecho:** Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «But in late January, Trump threatened sanctions on any nation that supplied Cuba with oil. And President Claudia Sheinbaum of Mexico decided that was too great a risk to her own economy.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Cuba produce unos 40.000 barriles diarios de crudo, muy por debajo de lo necesario para hacer funcionar con normalidad su red eléctrica, que depende del petróleo; consumo total y año no indicados, causa del déficit: producción interna insuficiente.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «Even when you add in the roughly 40,000 barrels of domestic production a day, it's well short of what's needed to function normally.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Las brigadas médicas cubanas en el extranjero, que en momentos álgidos superaron los 24.000 médicos, aportan más de 4.000 millones de dólares a la economía, la mayor fuente individual de divisas de Cuba; año no indicado, causa: exportación estatal de servicios profesionales.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «At times, there's been more than 24,000 doctors working these brigades abroad and they, they bring in more than $4 billion to the economy.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** La inflación oficial de Cuba tocó un pico de alrededor del 71% durante la pandemia y fue del 14% en 2025; los economistas estiman que la real está cerca de niveles pandémicos, y la causa de la diferencia es la fiabilidad de las cifras oficiales.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «Inflation in Cuba has been running very, very high. It kind of peaked during the pandemic at about 71%. It's at 14% in 2025 and those are the official figures.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Las llegadas de turistas a Cuba el último año fueron las más bajas fuera de los años de Covid en dos décadas; se cerraron hoteles, se suspendieron transacciones con tarjeta y se cancelaron vuelos por falta de combustible; causa: crisis de combustible y recuperación incompleta tras la pandemia.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Cuba never fully recovered with last year's arrivals the lowest outside the Covid years in two decades. Hotels have closed and credit card transactions have been suspended.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** El gobierno cubano aprobó más de 170 reformas económicas que abren la puerta a la inversión privada, con más de 9.200 pymes y un sector privado que emplea una parte creciente de la fuerza laboral; fecha exacta y cifra de empleo privado no indicadas.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «The Cuban government approving more than 170 sweeping economic reforms opening the door to private investment.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Invertir en Cuba implica operar con el Estado, que no ofrece garantías sobre la inversión, la propiedad ni los derechos de los emprendedores privados sobre sus beneficios (opinión citada en el video); cifra y plazo no indicados.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «You would be a fool to invest in Cuba under these circumstances, precisely because the Cuban government provides no guarantees for either the investment that you might make or property ownership» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓
- **Hecho:** Katapulk, marketplace online de la diáspora cubana, ofrece más de 33.000 productos y procesa entre 1.500 y 2.000 pedidos diarios, amparada en una excepción de los controles de exportación del Departamento de Comercio de EE. UU.; fecha de la excepción no indicada.
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «We have over 33,000 products. We do about 1,500 to 2,000 orders a day.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓

### MM (8)

- **Hecho:** La junta militar de Myanmar y sus aliados controlan como máximo el 40-45 % del territorio porque ningún bando gana en el campo de batalla (guerra civil en curso, sin fin previsto a corto plazo); fecha exacta de la estimación no indicada.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «The military and its allies control at most 40 or 45% of the country.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** Los centros de estafa como Shwe Kokko (frontera Myanmar-Tailandia) generan entre miles de millones y decenas de miles de millones de dólares de ingresos que financian a los combatientes, incluida la junta; periodo no indicado, causa: negocio ilícito de fraude online usado como financiación de guerra.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «They generate, by most accounts, billions, if not tens of billions of dollars in revenue.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** Los rebeldes del TNLA tomaron en 2024 la ciudad de Mogok, zona de rubíes de Myanmar (país con reservas de gemas, madera y cobre), y cobran a los mineros por trabajar sus parcelas; causa: el conflicto armado desplaza el control de las zonas mineras.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «In 2024, a rebel group called the TNLA took control of Mogok. And not surprisingly, it was very interested in rubies.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** La guerra civil de Myanmar ha dejado unos cien mil muertos, cientos de miles de heridos y millones de desplazados; periodo de acumulación y causa no indicados más allá del conflicto armado.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «Around a hundred thousand people have been killed, hundreds of thousands more injured, and millions displaced.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** Un terremoto de magnitud 7,7, el mayor de Myanmar en un siglo, mató según la junta a unas 1.700 personas (cifra oficial inicial, tres días después del sismo) y agravó la crisis del país; fecha exacta no indicada.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Rescuers in Myanmar are working frantically to find survivors three days after the country's biggest earthquake in a century.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** Durante la guerra de Irán, Myanmar impuso estrictas restricciones al combustible, con grandes colas de vehículos, por el choque energético que se sumó a los efectos del conflicto interno; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) · interfaz: Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
  - «It was the middle of the war in Iran. Myanmar has imposed strict fuel restrictions, which are adding to the effects of the conflict on people's day-to-day lives.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** El parlamento de Myanmar eligió presidente al jefe militar Min Aung Hlaing tras unas elecciones que la oposición considera un intento de legitimar al ejército; fecha no indicada.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «Myanmar's parliament has elected military chief Min Aung Hlaing as the country's new president.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** La guerra de Myanmar se desborda hacia la frontera occidental de Tailandia: cientos de miles de refugiados cruzan, a menudo de forma ilegal, lo que alimenta el tráfico de personas y obliga al ejército tailandés a vigilar zonas controladas por milicias y rebeldes; plazo no indicado.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «the impact of the war has spilled over into towns along the border with western Thailand where people have come to seek safety» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓

### PK (8)

- **Hecho:** Pakistán es el cuarto mayor deudor del FMI, solo por detrás de Argentina, Ucrania y Egipto, y depende de financiación externa; fecha de la clasificación no indicada.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «It's currently the fourth-largest IMF debtor behind only Argentina, Ukraine and Egypt.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** La inversión extranjera directa en Pakistán lleva estancada unas dos décadas; cifra no indicada.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «Foreign direct investment into the country has remained mostly stagnant for the past two decades.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** A finales de 2025 EE. UU. y Pakistán firmaron un memorando para invertir en los minerales críticos pakistaníes (monto no indicado; causa no indicada).
  - **Funcionalidad sugerida:** [Registro global de minas y proyectos de minerales críticos](#registro-minas-minerales-criticos) · interfaz: Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
  - «By the end of 2025, Pakistan and the US had signed a memorandum of understanding where they would be investing in Pakistan's critical minerals.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** Pakistán firmó un memorando con World Liberty Financial, ligada a la familia Trump, y es el tercer mayor mercado cripto del mundo con más de 40 millones de usuarios (plazo y causa no indicados).
  - **Funcionalidad sugerida:** [Exposición política de empresas: contratos públicos, lobby y vínculos con el poder](#vinculos-politico-empresariales) · interfaz: Bloque en la ficha de empresa (ver ficha-empresa-ampliada) + tooltip de instalaciones en map2d/render-facilities.ts.
  - «Pakistan's now the world's third-largest crypto market with over 40 million crypto users.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** China invirtió mucho dinero en Pakistán para construir el Corredor Económico China-Pakistán, y Pakistán equilibra a EE. UU. y China, con una flota de cazas de ambos países (monto y plazo no indicados).
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «China invested lots of money in Pakistan to build out what they call the China-Pakistan economic corridor.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** Una mejora de relaciones entre EE. UU. e Irán podría desbloquear el gasoducto Irán-Pakistán, estancado desde hace tiempo y que aliviaría la crisis energética pakistaní; la reanudación del conflicto lo aplaza (plazo no indicado).
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «it could pave the way for a long-stalled gas pipeline between Iran and Pakistan that would help alleviate Pakistan's energy woes.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** Pakistán mantiene desde principios de año (2026) un conflicto con Afganistán en el que ambos países se atacan mutuamente en la frontera (cifras de víctimas y causa no indicadas).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Pakistan has been in conflict with Afghanistan since beginning of this year. Both countries keep attacking each other.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓
- **Hecho:** El acercamiento de Pakistán a Trump es frágil y personalista: el caso de India, que pasó de aliado a ser castigado, muestra que puede revertirse rápido (cifras y plazo no indicados).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Trump can be very fickle. He could like you one minute and you could be in the doghouse the next minute.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓

### ES (7)

- **Hecho:** Incendios forestales en Europa Occidental han obligado a más de 300.000 personas a abandonar sus hogares en Francia y España, con estado de emergencia; fecha exacta y causa del brote no indicadas en el hallazgo (el video lo enmarca en el contexto del Super El Niño).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Wildfires in Europe. More than 300,000 people have fled their homes in France and Spain.» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓
- **Hecho:** La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «The European Commission says EU member countries need to be spending about $80 billion a year to adapt to climate change between now and 2050.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El calor reduce el caudal de los ríos, lo que baja la generación hidroeléctrica, y limita la refrigeración de las centrales nucleares, que necesitan mucha agua; ambos efectos tensionan un sistema eléctrico europeo ya precario por Ucrania e Irán.
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «That heat reduces the amount of flow going down those rivers, and that materially impacts the amount of power that can be generated by those hydropower facilities.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** La penetración de aire acondicionado en hogares sube con fuerza: Francia pasó de 7% en 2010 a 25% en 2020 y ahora ronda el 35%, frente a cerca de 65% en España y 20% en Alemania; los fabricantes vendieron unas tres veces lo esperado (la causa es el calor creciente).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «In 2010, about 7% of French households had air conditioning. By 2020, that's risen to about 25%, and then really into this year, it started to accelerate again and now we're at about 35%.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado).
  - **Funcionalidad sugerida:** [Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima](#sistema-electrico-pais) · interfaz: Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
  - «The heat itself is a problem for the utility sector because things like transformers and different parts of the grid really aren't built for that kind of heat.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025).
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Only 25% of economic losses caused by climate hazards in Europe have insurance protection. The remaining 75% are covered by businesses and increasingly by governments that have to backstop these losses.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «If the trend of very hot summers continues, the cost of some of Europe's largest economies could run into the hundreds of billions, while some northern countries could fare better.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓

### HK (7)

- **Hecho:** En 2025 MTR (Hong Kong, ticker 66) obtuvo unos 14.600 millones de HKD de beneficio, tres cuartas partes procedentes de bienes raíces y no de tarifas, porque desarrolla propiedades sobre sus estaciones.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «in 2025, the MTR made roughly 14.6 billion Hong Kong dollars in profit, three-quarters of it from real estate rather than train fares.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** El gobierno de Hong Kong entrega a MTR terrenos junto a las estaciones con descuento en lugar de efectivo para financiar el metro, y MTR los licita a promotores privados (captura de valor del suelo); importe y plazo no indicados.
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «Instead of cash, government is giving us land.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** MTR paga al gobierno de Hong Kong unos 6.000 millones de HKD al año en dividendos y gestiona 16 centros comerciales, torres de oficinas y 1.600 tiendas de estación; año de la cifra no indicado.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «the MTR pays roughly six billion Hong Kong dollars a year back to the government in dividends.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** La primera estación del Northern Metropolis (Kwu Tung), en Hong Kong, ya cuesta un 70 % más que lo estimado y no se compensa con derechos de desarrollo tan lucrativos como antes; plazo no indicado.
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «the first station being built for the Metropolis at Kwu Tung already costs about 70% more than original estimates.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** MTR ha pedido prestados unos 140.000 millones de HKD para los proyectos futuros; fecha del cálculo no indicada.
  - **Funcionalidad sugerida:** [Ficha de empresa ampliada: fundamentales, segmentos, exposición geográfica y estrategia](#ficha-empresa-ampliada) · interfaz: Ficha de empresa abierta desde instalaciones del mapa (map2d/render-facilities.ts) y desde BloombergOriginalsSection.
  - «So far we have borrowed about 140 billion Hong Kong dollars for the coming projects.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** El Northern Metropolis es un plan del gobierno de Hong Kong para crear un nuevo polo tecnológico que integre la ciudad con China continental, con medio millón de viviendas y siete estaciones nuevas; plazo no indicado.
  - **Funcionalidad sugerida:** [Registro de política industrial y subsidios por país y sector](#politica-industrial-subsidios) · interfaz: Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
  - «a massive government plan to build a new tech hub to better integrate Hong Kong with mainland China, including the goal to build half a million new homes.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **Hecho:** Los residentes de Hong Kong hacen más de 90 millones de viajes al año a Shenzhen, desplazando gasto de los comercios locales, por lo que los alquileres de las tiendas de MTR se ajustan a la baja; año de la cifra no indicado.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «residents now make more than 90 million trips a year to Shenzhen in mainland China, shifting spending across the border and away from local retailers.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓

### KP (7)

- **Hecho:** Entre 2022 y 2025 Corea del Norte ingresó hasta 22.000 millones de dólares en divisas, casi cuatro veces más que el cuatrienio anterior, pese a las sanciones (análisis de Bloomberg Economics; causa detallada en otros hallazgos del video: armas, cripto y comercio con China).
  - **Funcionalidad sugerida:** [Registro de aranceles, sanciones y controles de exportación por país y producto](#aranceles-sanciones-controles) · interfaz: Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
  - «raked in billions of dollars in foreign earnings, totaling as much as $22 billion, according to a Bloomberg Economics analysis» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** El PIB de Corea del Norte según el Banco de Corea es de unos 30.000 millones de dólares, 60 veces menor que el de Corea del Sur (unos 1,9 billones); año de la estimación y causa de la brecha no indicados.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «Estimates from the Bank of Korea put its economy currently, or GDP, at around $30 billion. And that is 60 times smaller than its southern neighbor South Korea» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** Los grupos de hackers norcoreanos pasaron de aproximadamente el 30 % de los robos globales de criptomonedas en 2017 a más del 70 % actualmente (con robos de hasta 2.000 millones de dólares anuales en 2025), con un respiro durante la pandemia; causa no indicada más allá de financiar al régimen bajo sanciones.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «in 2017, North Korean hacking groups accounted for about 30% of global thefts of cryptocurrency such as Bitcoin. Barring a bit of downtime during the pandemic, it's now thought to be in excess of 70%.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** China concentra el 98 % del comercio de Corea del Norte y es su principal destino de exportación, fuente de importaciones y proveedor de energía; plazo no indicado y causa: aislamiento del régimen por las sanciones.
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «China is still the most important backer for the North Korean economy. It's where 98% of North Korea's trade comes from.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** Corea del Norte habría ganado hasta 12.800 millones de dólares solo con la venta de artillería y munición a Rusia (estimación del CSIS) y además recibe tecnología rusa, por ejemplo la defensa aérea de un nuevo destructor valorada en más de 20 millones; plazo no indicado y causa: la guerra de Rusia en Ucrania.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «The Center for Strategic and International Studies estimates North Korea has earned as much as $12.8 billion from this arms deal alone.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** Con la experiencia de combate en Ucrania, Corea del Norte habría mejorado sus armas convencionales y, si quiere, podría venderlas a terceros países; cuantía y plazo no indicados.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «we do believe that they've achieved a level of upgrade of these weapons. Meaning that if it wants to, it can sell these weapons elsewhere, in other countries.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓
- **Hecho:** Tras el fracaso de la cumbre de Hanoi de 2019 sobre alivio de sanciones, Corea del Norte aceleró su producción de armas nucleares y podría acumular uno de los mayores arsenales; cifra de ojivas no indicada.
  - **Funcionalidad sugerida:** [Capacidades de defensa: gasto, arsenales, transferencias de armas y ciber](#capacidades-defensa) · interfaz: Top-bar MilitaryPanel + TacticalEntitiesPostureSection (ficha) + arcos de transferencias de armas en map2d/render-arcs.ts.
  - «North Korea is actually accelerating its production of nuclear weapons and potentially is on track to have one of the biggest stockpiles out there.» — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE) · cita ✓

### MX (7)

- **Hecho:** En Ciudad de México se roban en promedio 11 viviendas al día por despojo (ocupación y escrituras falsificadas), porque los delincuentes vigilan inmuebles vacíos durante largos periodos; año de la cifra no indicado.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «Criminals will stake out a property, monitoring when it will be vacant for an extended period of time.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **Hecho:** En la última década los casos de robo y despojo de propiedad en Ciudad de México y el Estado de México suman casi 100.000, entre un tercio y la mitad por disputas familiares y el resto por invasiones; los datos oficiales solo arrancan en 2015 por un cambio metodológico.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «Over the past decade, cases of property theft in Mexico City and Mexico State have added up to almost 100,000.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **Hecho:** Los procesos judiciales por despojo de propiedad en México tardan de 8 meses a 2 años con la documentación en regla, pero más de 5 años en muchos casos, por la mezcla de tribunales penales y civiles y las apelaciones.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «If everything is in order, it usually takes, in our experience, from eight months to two years. However, that's not the case in many of the cases that we see, and that might take more than five years.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **Hecho:** El despojo de propiedad en Ciudad de México se debe a la gentrificación que encarece los inmuebles, a la cultura de no registrar propiedades o venderlas sin notario y a la corrupción de funcionarios, notarios y jueces; peso de cada causa no indicado.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «public officials, notaries, judges that can all come in together» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **Hecho:** Ante los despojos de propiedad en Ciudad de México, la jefa de gobierno Clara Brugada ofreció 100 abogados gratuitos a las víctimas, hubo detenciones y la presidenta Sheinbaum ha sido preguntada en sus conferencias matutinas; fecha de las medidas no indicada.
  - **Funcionalidad sugerida:** [Seguridad jurídica y calidad institucional](#seguridad-juridica-instituciones) · interfaz: Bloque institucional en SovereignMetricsSection + top-bar StabilityPanel.
  - «They have also offered the 100 lawyers to help out pro bono to several victims.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **Hecho:** La ronda final de LIV en Ciudad de México en abril promedió 49.000 espectadores en EE. UU. en Fox Sports One, frente a 4,35 millones del RBC Heritage del PGA Tour en CBS el mismo día; causa no indicada.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «LIV's final round in Mexico City in April averaged 49,000 US viewers on Fox Sports One. That same day, the PGA Tour's RBC Heritage Final Round averaged 4.35 million on CBS.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «But in late January, Trump threatened sanctions on any nation that supplied Cuba with oil. And President Claudia Sheinbaum of Mexico decided that was too great a risk to her own economy.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓

### BO (6)

- **Hecho:** El magnate de la soja Eraí Maggi (Bom Futuro) habría depositado por una finca selvática de 30.000 hectáreas en San Ignacio de Velasco, Bolivia, y planea invertir con una nueva carretera Brasil-Bolivia; monto y fecha del depósito no indicados.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «Bom Futuro Maggi's agribusiness Empire has allegedly placed a deposit on a nearby pristine 30,000 hectare forested plot. An investment of this size tends to attract others.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** La Constitución boliviana limita la propiedad de tierra por extranjeros a 5.000 hectáreas (salvo propietarios anteriores a la nueva constitución), pero se evade comprando a través de empresas locales; fecha de la constitución no indicada.
  - **Funcionalidad sugerida:** [Clima para el inversor extranjero: IED, restricciones, reformas y riesgo de expropiación](#clima-inversion-extranjera) · interfaz: Nueva sección sidebar/InvestmentClimateSection.tsx.
  - «You can only have up to 5,000 hectares unless you were already owner of that land before the new constitution. And to avoid the law that says that foreigners cannot own land in Bolivia.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** En Bolivia, deforestar ilegalmente costaría a los productores de soja hasta 1 millón de dólares en multas frente a un terreno que vale algo más de 20 millones, es decir un mero coste administrativo; año de las cifras no indicado.
  - **Funcionalidad sugerida:** [Riesgo de permisos, licencia social y enforcement ambiental por proyecto](#licencia-social-permisos) · interfaz: Insignia de riesgo en el tooltip de instalaciones (map2d/render-facilities.ts) y en minas de la capa 'resources'; subcapa 'licencia social' del mapa.
  - «If soy producers deforest that land illegally, it would cost them up to $1 million. And that piece of land is worth a bit more than 20 million US dollars.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** El nuevo presidente centrista boliviano Rodrigo Paz disolvió el Ministerio de Medio Ambiente, asignó la política ambiental a Planificación del Desarrollo (cuyo ministro tiene 25 años en la industria de soja) y pretende expandir la producción agrícola; fecha de la decisión no indicada.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «Bolivia's new minister of development planning, which now oversees environmental policy after President Rodrigo Paz dissolved the Ministry of Environment. His resume over 25 years as a prominent leader in the soy industry.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** Paz aprobó una ley para convertir pequeñas fincas en medianas, pero tras protestas indígenas y campesinas (con gases lacrimógenos en La Paz) tuvo que revertirla, en medio de medidas de austeridad; fechas no indicadas.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «Indigenous leaders and pheasants argued it gave private businesses rights to seize their land. The protests that followed forced him to reverse the law.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓
- **Hecho:** Brasil respaldó formalmente carreteras y un puente fluvial que conectan con Bolivia, a mayor escala de lo sugerido antes, incluida la ruta hacia San Ignacio; más del 90% de la deforestación amazónica ocurre junto a carreteras; fecha del respaldo no indicada.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Roads and a river bridge connecting it to Bolivia. It's much larger than anything previously suggested. Every time a road goes in, the forest comes out.» — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4) · cita ✓

### SA (6)

- **Hecho:** Los oleoductos de desvío (Arabia Saudí hacia el Mar Rojo y Emiratos hacia Fujairah) compensaron unos 6 millones de b/d durante el cierre de Ormuz; los EAU rinden unos 1,5 millones de b/d y planean llegar a 3 millones a finales de 2027, dando más peso a los puertos de Fujairah y Yanbu.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Same thing with UAE. It can currently do about one and a half million barrels per day. By the end of 2027, they're going to have that up to three million barrels per day.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El precio del crudo superó los 126 dólares por barril durante el conflicto de Ormuz, muy por debajo de los 150-200 dólares que pronosticaban muchos bancos, porque inventarios, liberación de reservas, desvío por oleoducto y menor demanda china absorbieron el choque.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «Although we did see prices top $126 a barrel, many of those worst fears were never materialized.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El PIF, fondo soberano saudí presidido por el príncipe heredero Mohammed bin Salman, gestiona unos 1 billón de dólares y solo es superado entre los fondos de Oriente Medio por el ADIA de Abu Dabi.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «PIF manages about $1 trillion. It's only taught by Abu Dhabi's ADIA.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** El PIF anunció que retirará su financiación a LIV Golf al final de la temporada tras gastar más de 5.000 millones de dólares en menos de cinco años, en un contexto de guerra en Oriente Medio.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «Saudi Arabia's public investment fund announced it will be pulling its funding at the end of the season.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** Algunos megaproyectos saudíes no avanzan bien y otros shocks económicos limitan la capacidad del reino para seguir financiando proyectos de prestigio con cheques en blanco; cifra y plazo no indicados.
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «Some of the mega projects weren't going as well, and other economic shocks meant that the league could not offer those blank checks forever.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓
- **Hecho:** BC Partners es el inversor principal de una oferta no vinculante para rescatar LIV Golf, que además pide a los jugadores aceptar participación en el capital; plazo y importe no indicados.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «BC Partners is the lead investor for this deal, which may or may not happen because it's not a binding offer» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓

### IR (5)

- **Hecho:** Algunos buques han pagado hasta 2 millones de dólares para cruzar Ormuz durante el conflicto; se debate un régimen de peajes y quién vigila el estrecho tras el conflicto; plazo no indicado.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Some vessels have been charged up to $2 million just to make it through.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** La presencia de minas hizo que armadores y propietarios de carga evitaran Ormuz incluso tras el acuerdo de paz interino, porque sacar buques es más fácil que volver a meterlos; la línea base citada es de 120-130 buques diarios y el plazo de recuperación no se indica.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «One of the first reasons ship owners were cautious about sailing through Hormuz, even after the interim peace deal, was the presence of mines.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El precio del crudo superó los 126 dólares por barril durante el conflicto de Ormuz, muy por debajo de los 150-200 dólares que pronosticaban muchos bancos, porque inventarios, liberación de reservas, desvío por oleoducto y menor demanda china absorbieron el choque.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «Although we did see prices top $126 a barrel, many of those worst fears were never materialized.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** La guerra de EE. UU./Israel con Irán dispara los precios de la energía, con el diésel como combustible más afectado; un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible.
  - **Funcionalidad sugerida:** [Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles](#transmision-shocks-energia-inflacion) · interfaz: Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
  - «Before the Iran war, I was at $800- $1,200 a week at fuel. I'm up to about $1,700-$1,800 now a week.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **Hecho:** Una mejora de relaciones entre EE. UU. e Irán podría desbloquear el gasoducto Irán-Pakistán, estancado desde hace tiempo y que aliviaría la crisis energética pakistaní; la reanudación del conflicto lo aplaza (plazo no indicado).
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «it could pave the way for a long-stalled gas pipeline between Iran and Pakistan that would help alleviate Pakistan's energy woes.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓

### AE (3)

- **Hecho:** Los oleoductos de desvío (Arabia Saudí hacia el Mar Rojo y Emiratos hacia Fujairah) compensaron unos 6 millones de b/d durante el cierre de Ormuz; los EAU rinden unos 1,5 millones de b/d y planean llegar a 3 millones a finales de 2027, dando más peso a los puertos de Fujairah y Yanbu.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Same thing with UAE. It can currently do about one and a half million barrels per day. By the end of 2027, they're going to have that up to three million barrels per day.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El precio del crudo superó los 126 dólares por barril durante el conflicto de Ormuz, muy por debajo de los 150-200 dólares que pronosticaban muchos bancos, porque inventarios, liberación de reservas, desvío por oleoducto y menor demanda china absorbieron el choque.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «Although we did see prices top $126 a barrel, many of those worst fears were never materialized.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** El PIF, fondo soberano saudí presidido por el príncipe heredero Mohammed bin Salman, gestiona unos 1 billón de dólares y solo es superado entre los fondos de Oriente Medio por el ADIA de Abu Dabi.
  - **Funcionalidad sugerida:** [Estado inversor: fondos soberanos, empresas públicas y soft power](#estado-inversor) · interfaz: Bloque 'Activos del Estado' dentro de SovereignPublicFinancesSection.tsx (componente planificado por la ficha finanzas-publicas-soberanas).
  - «PIF manages about $1 trillion. It's only taught by Abu Dhabi's ADIA.» — [Will LIV Golf Survive?](https://www.youtube.com/watch?v=GUB-MVVuWqU) · cita ✓

### AU (3)

- **Hecho:** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios.
  - **Funcionalidad sugerida:** [Grafo corporativo: alianzas, offtakes, fusiones y financiación entre empresas](#grafo-corporativo) · interfaz: sidebar/ValueNetworkSection.tsx (existente) con aristas corporativas.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **Hecho:** El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «The LNG market is highly concentrated with the US, Qatar, Australia, and Russia making up 70% of the global supply.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓
- **Hecho:** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos (cifras de producción y plazo no indicados).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### IT (2)

- **Hecho:** La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «The European Commission says EU member countries need to be spending about $80 billion a year to adapt to climate change between now and 2050.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓
- **Hecho:** Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «If the trend of very hot summers continues, the cost of some of Europe's largest economies could run into the hundreds of billions, while some northern countries could fare better.» — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw) · cita ✓

### NG (2)

- **Hecho:** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano, porque exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **Hecho:** Una auditoría del programa de subsidio a la gasolina importada en Nigeria halló unos 2.400 millones de dólares en fraude; año de la auditoría y causa estructural no indicados.
  - **Funcionalidad sugerida:** [Salud fiscal soberana: deuda, intereses, financiación y política fiscal](#salud-fiscal-soberana) · interfaz: SovereignPublicFinancesSection.tsx (ficha) en el panel lateral + top-bar DebtPanel.
  - «And we found about $2.4 billion worth of fraud.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓

### TH (2)

- **Hecho:** Los centros de estafa como Shwe Kokko (frontera Myanmar-Tailandia) generan entre miles de millones y decenas de miles de millones de dólares de ingresos que financian a los combatientes, incluida la junta; periodo no indicado, causa: negocio ilícito de fraude online usado como financiación de guerra.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «They generate, by most accounts, billions, if not tens of billions of dollars in revenue.» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓
- **Hecho:** La guerra de Myanmar se desborda hacia la frontera occidental de Tailandia: cientos de miles de refugiados cruzan, a menudo de forma ilegal, lo que alimenta el tráfico de personas y obliga al ejército tailandés a vigilar zonas controladas por milicias y rebeldes; plazo no indicado.
  - **Funcionalidad sugerida:** [Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio](#conflicto-armado-control-territorial) · interfaz: Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
  - «the impact of the war has spilled over into towns along the border with western Thailand where people have come to seek safety» — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI) · cita ✓

### UY (2)

- **Hecho:** El ferri eléctrico Hull 096 de Buquebus cruzará el Río de la Plata entre Uruguay y Argentina con baterías de más de 40 MWh, 2.100 pasajeros y 225 coches, con una inversión total de 184 millones de dólares financiada con Banco Santander Uruguay y la IFC del Banco Mundial (fecha de entrada en servicio no indicada).
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «Total investment in Hull 096 of $184 million included financing from Banco Santander, Uruguay and the World Bank's International Finance Corporation.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **Hecho:** Uruguay invirtió además 20 millones de dólares en un proyecto de mejoras de red y carga para barcos en el puerto de Colonia (plazo no indicado).
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Uruguay also invested in a project worth $20 million in order to make grid updates and to add charging for ships in the port of Colonia.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### AF (1)

- **Hecho:** Pakistán mantiene desde principios de año (2026) un conflicto con Afganistán en el que ambos países se atacan mutuamente en la frontera (cifras de víctimas y causa no indicadas).
  - **Funcionalidad sugerida:** [Línea temporal y calibración de relaciones bilaterales](#linea-temporal-relaciones) · interfaz: Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
  - «Pakistan has been in conflict with Afghanistan since beginning of this year. Both countries keep attacking each other.» — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM) · cita ✓

### AR (1)

- **Hecho:** El ferri eléctrico Hull 096 de Buquebus cruzará el Río de la Plata entre Uruguay y Argentina con baterías de más de 40 MWh, 2.100 pasajeros y 225 coches, con una inversión total de 184 millones de dólares financiada con Banco Santander Uruguay y la IFC del Banco Mundial (fecha de entrada en servicio no indicada).
  - **Funcionalidad sugerida:** [Registro de megaproyectos e infraestructura: financiación, concesiones y riesgos](#megaproyectos-infraestructura) · interfaz: Nueva sección sidebar/InfrastructureProjectsSection.tsx + proyectos como puntos en Map2D.
  - «Total investment in Hull 096 of $184 million included financing from Banco Santander, Uruguay and the World Bank's International Finance Corporation.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### BD (1)

- **Hecho:** El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «From Nepal to Bangladesh and Indonesia, youth-led unrest is rattling governments across Asia, fueled by anger over inequality, corruption, and widespread unemployment.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓

### CI (1)

- **Hecho:** África Occidental, foco de producción de cacao, ya muestra impactos de El Niño en el crecimiento y el rendimiento del cultivo, lo que afectará a los precios en 2027 y a la calidad; el El Niño de 2023-2024 provocó varios picos de precio del cacao.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Western Africa, it's a hotspot for cocoa production. We're already seeing impacts on cocoa growth and yield. This is going to impact pricing going into 2027» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓

### EG (1)

- **Hecho:** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano, porque exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓

### GH (1)

- **Hecho:** África Occidental, foco de producción de cacao, ya muestra impactos de El Niño en el crecimiento y el rendimiento del cultivo, lo que afectará a los precios en 2027 y a la calidad; el El Niño de 2023-2024 provocó varios picos de precio del cacao.
  - **Funcionalidad sugerida:** [Capa de riesgo climático físico por país](#riesgo-climatico-fisico) · interfaz: Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
  - «Western Africa, it's a hotspot for cocoa production. We're already seeing impacts on cocoa growth and yield. This is going to impact pricing going into 2027» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓

### ID (1)

- **Hecho:** El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «From Nepal to Bangladesh and Indonesia, youth-led unrest is rattling governments across Asia, fueled by anger over inequality, corruption, and widespread unemployment.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓

### IE (1)

- **Hecho:** El modelo de Bloomberg (23 países de la OCDE como contrafactual) estima un golpe inicial del 10% al PIB británico (300.000 millones de libras) por el Brexit, que tras excluir a Irlanda y ajustar por EE. UU. (shock energético, estímulo fiscal, IA) baja a entre el 2% y el 4% del PIB; plazo de medición no indicado.
  - **Funcionalidad sugerida:** [Motor de causas de variación del PIB con calidad de dato](#motor-causas-pib) · interfaz: CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
  - «We get down to a number between two and four percent of GDP, which we think is a reasonable estimate for the hit to the economy.» — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo) · cita ✓

### KE (1)

- **Hecho:** Al retirarse USAID de Kenia quedaron 26 proyectos de agua y saneamiento (WASH) en curso que costarían unos 2 millones de dólares terminar, dejando infraestructura a medias y mayores riesgos de inundación; fecha de la retirada no indicada.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «when USAID stopped their work in Kenya, there was a total of 26 projects in the WASH space ongoing and it only would cost around $2 million to actually finish them.» — [The Hidden Cost of Trump's USAID Cuts | Bloomberg Investigates](https://www.youtube.com/watch?v=VbnoIf7aknM) · cita ✓

### NL (1)

- **Hecho:** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos (cifras de producción y plazo no indicados).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### NP (1)

- **Hecho:** El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados.
  - **Funcionalidad sugerida:** [Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social](#riesgo-politico-interno) · interfaz: Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
  - «From Nepal to Bangladesh and Indonesia, youth-led unrest is rattling governments across Asia, fueled by anger over inequality, corruption, and widespread unemployment.» — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw) · cita ✓

### PA (1)

- **Hecho:** La sequía asociada a El Niño redujo el tráfico del Canal de Panamá en 2024 y este año (2026) la Autoridad del Canal ya aplica límites de carga para conservar agua, lo que afecta a los flujos de GNL y a los precios de la energía; cifras no indicadas.
  - **Funcionalidad sugerida:** [Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores](#logistica-chokepoints-corredores) · interfaz: ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
  - «Traffic through the Panama Canal plunged in 2024 due to drought during the last El Niño. And this year, the Canal Authority is already taking measures to conserve water with cargo limits» — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4) · cita ✓

### QA (1)

- **Hecho:** El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado.
  - **Funcionalidad sugerida:** [Concentración de oferta, exposición importadora y precios de materias primas](#concentracion-precios-materias-primas) · interfaz: Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
  - «The LNG market is highly concentrated with the US, Qatar, Australia, and Russia making up 70% of the global supply.» — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs) · cita ✓

### SE (1)

- **Hecho:** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos (cifras de producción y plazo no indicados).
  - **Funcionalidad sugerida:** [Nuevas cadenas de valor en trade-dag: naval, transición energética, climatización y memoria](#trade-dag-nuevas-cadenas) · interfaz: sidebar/TradeDagSection.tsx + capa 'tier-n' del mapa.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### TW (1)

- **Hecho:** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses y financian así el propio boom de IA (flujo circular); cuantía y plazo no indicados.
  - **Funcionalidad sugerida:** [Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas](#sector-externo-balanza-pagos) · interfaz: Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓

### VE (1)

- **Hecho:** Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado.
  - **Funcionalidad sugerida:** [Balance energético y dependencia de importaciones por proveedor](#balance-energetico-dependencia) · interfaz: Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
  - «But in late January, Trump threatened sanctions on any nation that supplied Cuba with oil. And President Claudia Sheinbaum of Mexico decided that was too great a risk to her own economy.» — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8) · cita ✓

### ZA (1)

- **Hecho:** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano, porque exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - **Funcionalidad sugerida:** [Matriz de comercio bilateral por producto, centralidad y fragmentación](#comercio-bilateral-producto) · interfaz: Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓

