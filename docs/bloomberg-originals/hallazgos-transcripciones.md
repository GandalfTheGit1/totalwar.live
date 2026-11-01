# Bloomberg Originals: lo que el sistema no tiene (transcripciones)

Revisados **20 de 378** videos relevantes (favorable/riesgo/mixto) uno a uno, un subagente por video. **133 elementos** extraídos; cita verificada contra la transcripción: 133 literales, 0 aproximadas, 0 descartados. En 56 elementos algún término aparece en el repo (empresa, ciudad…): se marcan **a revisar**, porque el término existe pero no el dato concreto.

> Estado: incompleto. YouTube bloqueó la IP para transcripciones tras 20 videos y el bloqueo seguía tras 5,5 h. Faltan 358 videos.

> Contexto, no señal: datos citados por Bloomberg; no son recomendación de inversión.

## Huecos del sistema que más se repiten

1. **Finanzas por empresa fuera de big tech:** beneficio, deuda, mezcla de ingresos (MTR, Rio Tinto, BHP, Seres/AITO…). Hoy solo hay instalaciones de 12 tecnológicas.
2. **Macro fina por país:** tasa de política (Selic), inflación por componentes, deuda de hogares, deuda pública por tramos.
3. **Riesgo político y regulatorio:** vínculos político-empresariales, lobby, seguridad pública, despojo de propiedad.
4. **Sectores sin cobertura:** vivienda, turismo, consumo, transporte, deporte y entretenimiento.
5. **Políticas industriales y megaproyectos** por país (p. ej. Northern Metropolis de Hong Kong), y su efecto en relaciones bilaterales.
6. **Energía y red eléctrica:** capacidad de red y de carga, no solo producción renovable/nuclear.

## Por país

### US (66)

- **[riesgo]** La mina Carlota (EE. UU.) produce un 60% menos cobre que en su pico y está previsto que cierre a finales de la década salvo que se actúe.
  - Por qué importa: Ejemplo de agotamiento de minas maduras en EE. UU.; refuerza la dependencia de importaciones y el valor de tecnologías que alarguen la vida de minas existentes.
  - Falta en el sistema: metals.ts lista activos estratégicos de cobre de EE. UU. sin vida útil de mina, curva de producción ni fecha de cierre.
  - «This is Carlota Mine. It's producing about 60% less copper than it did during peak output. Unless something is done, it's set to shut down by the end of the decade.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **[empresa]** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios. _Empresas: Rio Tinto (RIO), BHP (BHP), Endolith, Amazon Web Services (AMZN)._
  - Por qué importa: Vincula directamente la demanda de centros de datos de los hiperescalares con la oferta de cobre y con la estrategia tecnológica de las grandes mineras (Rio Tinto, BHP).
  - Falta en el sistema: Rio Tinto y BHP aparecen en metals.ts / natural-resources.json solo como activos; faltan sus programas de biominería (Nuton), contratos de compra de cobre de hiperescalares (AWS) y la relación mineras-centros de datos en corporate-facilities.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓ · a revisar: Rio Tinto
- **[oportunidad]** Qualcomm está diversificando más allá del móvil: ha entrado en el mercado de centros de datos (con una nueva marca de producto) y en robótica (familia Dragonwing). _Empresas: Qualcomm (QCOM)._
  - Por qué importa: Cambia la tesis de QCOM de proveedor de chips móviles a jugador en infraestructura de IA y robótica, con nuevos mercados y competidores (NVDA, AMD) y mayor exposición al ciclo de capex de hiperescalares.
  - Falta en el sistema: corporate-facilities/fabless-chips.ts solo registra sedes e I+D de QCOM (San Diego, Hyderabad); faltan líneas de negocio (centros de datos, robótica, auto) y su peso en ingresos.
  - «that's what led us to introducing Dragonfly, which is our latest product. It goes along with our entrance into the data center space.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓ · a revisar: data center
- **[cifra]** Según su CMO, la marca Snapdragon eleva los precios medios de venta (ASP) de Qualcomm porque los consumidores la perciben como premium. _Empresas: Qualcomm (QCOM)._
  - Por qué importa: Indica poder de fijación de precios y márgenes sostenibles en un negocio de componentes, un factor de moat relevante para valorar QCOM.
  - Falta en el sistema: El sistema no tiene métricas de ASP, márgenes ni poder de marca de las fabless (solo ubicaciones de instalaciones en corporate-facilities).
  - «We have found that if we can drive pull for Snapdragon in these devices, our average selling prices tend to be higher because consumers view Snapdragon as premium.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓ · a revisar: Snapdragon
- **[oportunidad]** Qualcomm defiende que la IA en el dispositivo (edge) ahorra costes frente a la IA en la nube, cuyo coste de tokens y capex de los hiperescalares se traslada al usuario. _Empresas: Qualcomm (QCOM)._
  - Por qué importa: Es la tesis central de QCOM en la era de la IA: si el coste de inferencia en la nube sube, la IA en el dispositivo gana demanda; contrasta con la tesis de centros de datos de NVDA/hiperescalares.
  - Falta en el sistema: No hay módulo que modele el reparto IA en el borde vs nube ni el coste de inferencia; solo aparece 'edge AI' como descripción en fabless-chips.ts.
  - «the more you can process closer to the device or on device or on prem, the more economically valuable it is to the user, right? You're saving cost.» — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU) · cita ✓
- **[riesgo]** El yen cotizó por encima de 160 por dólar en julio de 2026, cerca de su mínimo en cuatro décadas, y Japón y el Tesoro de EE. UU. intervinieron de forma coordinada por primera vez en unos 15 años; Bessent dice que no dudará en volver a hacerlo. Japón posee más de un billón de dólares en deuda estadounidense.
  - Por qué importa: Un yen débil encarece importaciones de energía y alimentos, alimenta la inflación y condiciona los márgenes de importadores y exportadores; una intervención conjunta o una venta de Treasuries por Japón tendría efectos globales.
  - Falta en el sistema: El sistema solo tiene el código JPY en el perfil de Japón; falta un módulo de divisas con tipo de cambio, intervenciones y tenencias de deuda extranjera por país.
  - «A coordinated intervention for the first time in about 15 years.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: intervention, yen
- **[cifra]** Según la propia compañía, más de 2.500 millones de huéspedes se han alojado en Airbnb desde 2008, en casi todos los países del mundo. _Empresas: Airbnb (ABNB)._
  - Por qué importa: Indica la escala y la huella global de la plataforma (cifra autodeclarada), relevante para estimar su exposición turística por país.
  - Falta en el sistema: corporate-facilities y country-resources no incluyen plataformas turísticas ni exposición de Airbnb por país; bloomberg-originals/videos.json solo guarda título y tesis.
  - «the company says more than two and a half billion guests have checked into an Airbnb in almost every country around the world» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓
- **[riesgo]** Airbnb ha tenido que enfrentarse a regulaciones municipales y a la insatisfacción de usuarios en sus 20 años de historia; su modelo depende de recuperar la confianza de huéspedes y anfitriones. _Empresas: Airbnb (ABNB)._
  - Por qué importa: La regulación local del alquiler de corta duración es un riesgo recurrente para el negocio y varía por ciudad y país.
  - Falta en el sistema: No hay dataset de regulación de alquiler turístico por país/ciudad ni riesgo regulatorio sectorial en lib/data ni lib/macro.
  - «Airbnb has faced its fair share of adversaries, from battling city regulations to navigating user dissatisfaction» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓
- **[oportunidad]** Airbnb quiere ampliar su negocio del alojamiento a todo el viaje (experiencias, servicios bajo demanda) para vender más a clientes existentes, que viajan unas pocas veces al año; las Experiences lanzadas en 2016 no tuvieron tracción. _Empresas: Airbnb (ABNB)._
  - Por qué importa: Marca la estrategia de crecimiento por ingresos por cliente y el riesgo de ejecución previo en su línea de experiencias.
  - Falta en el sistema: El sistema no modela empresas de turismo/plataformas ni su estrategia de diversificación; falta ficha de empresa para ABNB.
  - «Originally launched in 2016, experiences failed to. Gain traction.» — [How Airbnb Hopes to Build Brand Loyalty | Quantum Marketing](https://www.youtube.com/watch?v=KiB3YHyDcbs) · cita ✓ · a revisar: turismo
- **[cifra]** La familia de Vinod Khosla compró los Seattle Seahawks al patrimonio de Paul Allen por 9.500 millones de dólares, con Dynasty Equity como inversor minoritario. _Empresas: Seattle Seahawks (familia Khosla), Dynasty Equity._
  - Por qué importa: Es una referencia de valoración reciente para franquicias de la NFL y muestra que el capital institucional ya participa en el deporte profesional estadounidense.
  - Falta en el sistema: No existe ningún dataset de valoraciones de franquicias deportivas ni de transacciones de capital privado en deporte (lib/data); solo hay título y tesis en bloomberg-originals/videos.json.
  - «Vinod Khosla and his family buying the Seattle Seahawks from the estate of Paul Allen for $9.5 billion» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[politica]** La NFL limita al 10% la participación de capital privado en un equipo y solo unas cinco firmas están aprobadas como fuente de financiación. _Empresas: NFL._
  - Por qué importa: El tope regulatorio de la liga define el techo de retorno y la competencia entre fondos para entrar en franquicias; los inversores nunca pueden ser propietarios de control.
  - Falta en el sistema: El módulo de regulación/políticas por país no recoge reglas de propiedad de ligas deportivas ni límites a capital institucional; falta un dataset de sector deportes.
  - «because there's a rule that private equity can only up to 10% of a team» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[cifra]** La oficina de la liga (contratos de medios, convenios laborales) puede generar hasta el 75% de la economía de la NFL. _Empresas: NFL._
  - Por qué importa: Indica que el valor de una franquicia depende de la negociación centralizada de derechos de medios, por lo que el riesgo clave es el de la liga, no el del equipo individual.
  - Falta en el sistema: No hay datos de derechos de medios ni de estructura de ingresos de ligas deportivas en el sistema.
  - «So it's a huge part of the economics. In the NFL, it could be up to 75% of the economics.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[empresa]** TMRW Sports (golf y flag football profesional, con PGA Tour, LPGA y NFL) tiene un modelo de baja intensidad de capital: un solo recinto de 75 millones de dólares y propiedad de la economía a nivel de liga. _Empresas: TMRW Sports, Dynasty Equity, PGA Tour._
  - Por qué importa: Ofrece exposición a economía de liga completa (plataforma, fans, patrocinadores) con bajo capex y socios institucionales, un perfil distinto a poseer un equipo.
  - Falta en el sistema: El sistema no tiene empresas de deporte/entretenimiento ni sus métricas de unidad económica (capex, ingresos de liga).
  - «It wasn't about building 20 stadiums around the country. It was one $75 million venue.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[oportunidad]** Los grandes gestores de capital privado (Ares, Apollo, KKR) han entrado en el deporte, consolidándolo como clase de activo. _Empresas: Ares Management (ARES), Apollo Global Management (APO), KKR (KKR)._
  - Por qué importa: La entrada de grandes fondos eleva la liquidez y las valoraciones de franquicias y es una señal de flujo de capital institucional hacia el sector.
  - Falta en el sistema: No hay cobertura de gestores de capital privado ni de sus tesis sectoriales en lib/data ni lib/services.
  - «big brand names, if you think about whether it's Ares, Apollo, KKR, they've all jumped into sports» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[oportunidad]** Amazon, Google y Netflix entran en el deporte en directo, y la demanda de eventos presenciales (como el Mundial de este verano) impulsa el sector. _Empresas: Amazon (AMZN), Alphabet (GOOGL), Netflix (NFLX)._
  - Por qué importa: La competencia de plataformas tecnológicas por derechos deportivos respalda los precios de los derechos de medios y, con ellos, las valoraciones de ligas y equipos.
  - Falta en el sistema: corporate-facilities cubre AMZN y GOOGL solo como instalaciones; falta su exposición a derechos de streaming deportivo y la demanda de eventos en vivo.
  - «when you have this combination of Amazon and Google and Netflix all coming into sports, plus consumers really wanting to be together» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[oportunidad]** El flag football será deporte olímpico en Los Ángeles 2028 y la NFL planea lanzar ligas profesionales masculina y femenina. _Empresas: NFL._
  - Por qué importa: Abre un nuevo mercado de crecimiento (juvenil, femenino, internacional) con catalizador olímpico para patrocinadores, medios y operadores de ligas.
  - Falta en el sistema: No existe calendario de catalizadores sectoriales (eventos como JJ. OO. 2028) ni dataset de deportes emergentes por país.
  - «in 2028 in Los Angeles, flag football, both on the men's and women's side will be an Olympic sport.» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[oportunidad]** La presencia de capital privado en las cuatro grandes ligas da una vía de salida a familias adineradas, atrayendo más compradores y sosteniendo las valoraciones. _Empresas: Dynasty Equity._
  - Por qué importa: La liquidez de salida reduce la prima de iliquidez de las franquicias y puede seguir empujando los precios al alza, aunque también implica riesgo de burbuja de valoración.
  - Falta en el sistema: Sin dataset de valoraciones y múltiplos de franquicias deportivas ni de flujos de capital institucional al sector.
  - «So what you've seen since private equity has been allowed into the four major leagues is that more wealthy families are coming in» — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40) · cita ✓
- **[cifra]** Durante el Mundial Kalshi registró 27.000 millones de dólares de volumen de negociación y sumó tres millones de usuarios nuevos. _Empresas: Kalshi._
  - Por qué importa: Mide la escala real del mercado de predicción líder en EE. UU. y su crecimiento, base para valorar a la plataforma y a sus competidores (Polymarket) y a las casas de apuestas tradicionales.
  - Falta en el sistema: lib/services/prediction-markets solo integra Polymarket (cliente y paper trading); no hay datos de Kalshi ni de volúmenes/usuarios del sector.
  - «During the World Cup, Kalshi recorded $27 billion in trading volume and added three million new users.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[cifra]** El 75% del volumen de Kalshi sigue siendo deportes según Bloomberg; la empresa dice que bajó del 95% a comienzos de año a unos dos tercios o 70%. _Empresas: Kalshi._
  - Por qué importa: Revela una fuerte concentración de ingresos en una sola categoría sujeta a litigio estatal; sin deportes el negocio sería mucho menor.
  - Falta en el sistema: Falta un dataset de plataformas de mercados de predicción con mezcla de volumen por categoría y dependencia del segmento deportivo.
  - «we are at 95% at the beginning of the year. We're much lower now. I think it's like two thirds or 70%.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[riesgo]** 44 estados firmaron una carta que tilda a los mercados de predicción de nuevo casino y 20 litigan sobre si las leyes estatales de apuestas deportivas se aplican; la CFTC demandó a los estados en una disputa de competencia regulatoria. _Empresas: Kalshi._
  - Por qué importa: El riesgo legal federal frente a estatal (posible llegada al Tribunal Supremo) determina la viabilidad del modelo y afecta a operadores de juego regulados por los estados.
  - Falta en el sistema: Ningún módulo recoge riesgo regulatorio sectorial por jurisdicción (estados de EE. UU., CFTC) ni litigios abiertos sobre mercados de predicción.
  - «44 states have signed a letter calling prediction markets a new form of casino, and 20 are fighting in court over whether state sports betting laws apply.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[riesgo]** La comisión de la CFTC, el regulador de los mercados de predicción, ha quedado reducida de cinco miembros a uno solo, un nombramiento de Trump. _Empresas: Kalshi._
  - Por qué importa: Un regulador vaciado implica supervisión débil hoy pero riesgo de giro regulatorio cuando cambie la administración, lo que afecta a la sostenibilidad del sector.
  - Falta en el sistema: Falta capa de capacidad institucional/regulatoria de EE. UU. (composición de la CFTC) en el riesgo político de país.
  - «Under President Trump, the five-person commission is now down to one man.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[riesgo]** Un estudio halló que con 3.500 dólares se puede mover en cinco centavos o más el 97% de los mercados de predicción relacionados con las elecciones de medio mandato. _Empresas: Kalshi, Polymarket._
  - Por qué importa: Las cuotas de estos mercados se usan como señal de riesgo político; si son baratas de manipular, las probabilidades pierden fiabilidad como insumo de inversión.
  - Falta en el sistema: El módulo de prediction-markets usa precios de Polymarket como señal sin medir liquidez ni coste de manipulación ni advertir de ese sesgo.
  - «A recent study found that for $3,500, you can move 97% of midterm related prediction markets by five cents or more.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓ · a revisar: Polymarket
- **[riesgo]** Donald Trump Jr. es inversor en Polymarket y asesor remunerado de Kalshi, de la que recibió en 2025 una participación de 300.000 dólares que ahora podría valer millones. _Empresas: Kalshi, Polymarket._
  - Por qué importa: Conflicto de intereses político-empresarial que sostiene el apoyo federal actual y se vuelve vulnerabilidad si cambia la administración.
  - Falta en el sistema: No hay registro de vínculos político-empresariales ni de dependencia regulatoria de empresas respecto a la administración en el poder.
  - «In 2025, he received a $300,000 equity stake in Kalshi that's now potentially worth millions.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[cifra]** Kalshi cobra una comisión del 0,8% por operación y su modelo es ser bolsa peer-to-peer; el 75% de los clientes pierde dinero. _Empresas: Kalshi._
  - Por qué importa: Define el modelo de ingresos (comisión sobre volumen) y la dependencia del volumen, clave para estimar ingresos y el riesgo reputacional de pérdidas minoristas.
  - Falta en el sistema: Sin ficha de modelo de negocio de plataformas de mercados de predicción (comisión, estructura bolsa vs casa de apuestas).
  - «We take 0.8%, they take something similar. That doesn't make New York Stock Exchange gambling.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[riesgo]** Usuarios de 18 a 21 años, demasiado jóvenes para entrar en un casino en la mayoría de estados, operaron 5.000 millones de dólares en Kalshi este año; el límite legal actual es 18 y subirlo a 21 sería aceptado por la empresa. _Empresas: Kalshi._
  - Por qué importa: Un endurecimiento de la edad mínima o salvaguardas para jóvenes recortaría una porción relevante del volumen y reforzaría el caso de los reguladores estatales.
  - Falta en el sistema: Falta indicador de exposición regulatoria por segmento de usuarios (edad) en el sector de mercados de predicción/apuestas.
  - «users between 18 and 21 who would be too young to walk into a casino in most states traded $5 billion on Kalshi.» — [How Kalshi Became the Biggest Prediction Market | The Circuit with Emily Chang](https://www.youtube.com/watch?v=XNZN6gYhpLU) · cita ✓
- **[politica]** El Tribunal Supremo de EE. UU. anuló los aranceles globales basados en la ley IEEPA, que sustentan entre el 60 y el 75% de la política arancelaria actual de EE. UU.
  - Por qué importa: Cambia el régimen arancelario del mayor mercado de consumo: afecta márgenes de importadores y exportadores, posibles reembolsos y la necesidad de la Casa Blanca de recurrir a otras bases legales para los aranceles.
  - Falta en el sistema: Módulos macro y de relaciones bilaterales no tienen régimen arancelario por país ni estado legal de los aranceles de EE. UU. (IEEPA, fallo del Supremo, base legal sustitutiva).
  - «Trump's IEEPA tariffs, which about 60 to 75% of the tariff policy right now in the United States is based off of» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: tariff, arancel
- **[riesgo]** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo; el comercio digital podría quedar sujeto a impuestos nacionales.
  - Por qué importa: Riesgo regulatorio para plataformas, nube y servicios digitales transfronterizos: posibles aranceles y tasas digitales en grandes mercados emergentes.
  - Falta en el sistema: Relaciones bilaterales y módulo de políticas no recogen disputas de comercio digital ni la moratoria de la OMC sobre transmisiones electrónicas.
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **[politica]** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque cedió algunos beneficios; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - Por qué importa: Define el campo de negociación de la reforma de la OMC y de las reglas de subsidios, con implicaciones para aranceles, ayudas estatales y litigios comerciales entre las grandes economías.
  - Falta en el sistema: Relaciones bilaterales y perfiles soberanos no registran el estatus en la OMC (país en desarrollo vs. desarrollado) ni posiciones sobre la reforma de reglas de subsidios.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: WTO
- **[cifra]** Lectric vende 150.000 bicicletas eléctricas al año, un 50% más que su competidor más cercano en EE. UU. _Empresas: Lectric eBikes._
  - Por qué importa: Indica liderazgo en volumen en el segmento de e-bikes de EE. UU. y permite estimar cuota de mercado de una marca privada rentable frente a rivales financiados por capital riesgo.
  - Falta en el sistema: Bloomberg Originals / datos sectoriales de consumo y movilidad: solo hay una tesis de una frase; faltan volúmenes de ventas y cuota por empresa en e-bikes.
  - «Electric says they sell 150,000 bikes per year, which is 50% more than their closest competitor.» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **[cifra]** Lectric ha construido una marca directa al consumidor de 1.000 millones de dólares sin financiación de capital riesgo. _Empresas: Lectric eBikes._
  - Por qué importa: Muestra un modelo de negocio autofinanciado y escalable en bienes de consumo, con valor potencial como objetivo de adquisición o referencia de valoración.
  - Falta en el sistema: Datos de empresas privadas de consumo/movilidad: el sistema no registra tamaño de negocio ni modelo de financiación de Lectric.
  - «You built a $1 billion direct to consumer brand without any VC funding» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **[riesgo]** El mercado de e-bikes de EE. UU. creció con fuerza entre 2015 y 2022 pero se estabilizó, y los fabricantes afrontan demanda débil, presión sobre precios y más competencia.
  - Por qué importa: Indica saturación y compresión de márgenes en la categoría tras el auge pandémico, lo que afecta a fabricantes e importadores de e-bikes.
  - Falta en el sistema: Indicadores sectoriales de movilidad eléctrica ligera y consumo en EE. UU. (ventas anuales de e-bikes, precios); el módulo macro solo cubre indicadores agregados.
  - «the category has since entered a more challenging phase. As manufacturers navigate slowing demand, pricing pressure, and growing competition» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **[empresa]** Lectric aplica un suelo y un techo de margen: cuando el margen supera el techo, reinvierte en producto; ha sido rentable todo el tiempo y compite con rivales respaldados por capital riesgo. _Empresas: Lectric eBikes._
  - Por qué importa: Describe una política de asignación de capital que sacrifica margen por cuota y apalancamiento operativo, relevante para valorar su ventaja frente a competidores deficitarios.
  - Falta en el sistema: Perfiles de empresas de consumo: el sistema no guarda políticas de margen, rentabilidad ni estrategia competitiva de empresas fuera de las 12 con instalaciones corporativas.
  - «we have a margin floor which most companies have, but we also have a margin ceiling where if we get above the margin ceiling, that means we reinvest in a product» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓
- **[empresa]** Lectric ha adquirido las marcas Monarch y Juiced para ampliar su cartera, incluida una línea juvenil de e-bikes inspiradas en motos de cross. _Empresas: Lectric eBikes, Monarch, Juiced._
  - Por qué importa: Indica consolidación del sector y expansión hacia nuevos segmentos de clientes, señal de que los líderes absorben a rivales debilitados.
  - Falta en el sistema: Datos de M&A y consolidación sectorial en movilidad eléctrica ligera: no hay registro de adquisiciones ni de marcas del portafolio de Lectric.
  - «You've got brands like Monarch and Juiced you have added into your portfolio.» — [The Strategy Behind Lectric’s eBike Success | Quantum Marketing](https://www.youtube.com/watch?v=coyHcx1An_s) · cita ✓ · a revisar: Monarch
- **[cifra]** En la última década Athletic y su equipo han llevado la categoría de cerveza sin alcohol en EE. UU. de 100 millones a más de mil millones de dólares anuales de ingresos. _Empresas: Athletic Brewing Company._
  - Por qué importa: Muestra un crecimiento de unas 10 veces en la categoría y la posición de Athletic como líder, útil para dimensionar el mercado de bebidas sin alcohol y su potencial frente a las cerveceras tradicionales.
  - Falta en el sistema: Bloomberg Originals (lib/data/bloomberg-originals/videos.json) solo guarda una tesis de una frase; falta un dataset sectorial de bebidas con tamaño de mercado y crecimiento por categoría.
  - «Over the last decade, Shufelt and team have helped drive the non-alcoholic beer category from 100 million to over a billion dollars annually in revenue.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[riesgo]** Athletic tiene un conocimiento de marca de solo ~25% a nivel nacional y una distribución inferior al 40%, lo que limita su crecimiento actual. _Empresas: Athletic Brewing Company._
  - Por qué importa: Indica a la vez el recorrido de crecimiento (baja penetración) y el riesgo de ejecución frente a grandes cerveceras con distribución establecida.
  - Falta en el sistema: No hay métricas de penetración, cuota o distribución por empresa de consumo; el módulo de empresas solo cubre tecnología y cadenas industriales.
  - «Currently, the company says awareness for Athletic hovers around 25% nationally, with distribution under 40%.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[cifra]** Más de tres de cada cuatro consumidores que prueban Athletic siguen comprándola, y más del 30% de quienes compran en el pasillo de cerveza sin alcohol no lo habían pisado en seis meses. _Empresas: Athletic Brewing Company._
  - Por qué importa: Una retención del 75% apunta a un producto con demanda recurrente, y la entrada de compradores nuevos indica expansión del mercado total de cerveza y no solo sustitución del alcohol.
  - Falta en el sistema: Falta un dataset de indicadores de consumo y retención de marca por empresa o sector de bienes de consumo.
  - «Over three out of four consumers who try Athletic stay with Athletic.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[oportunidad]** Tras el pico de la pandemia de COVID-19, el consumo mundial de alcohol cae año tras año por mayor conciencia de riesgos para la salud y presión financiera, favoreciendo la moderación.
  - Por qué importa: Es un viento de cola estructural para bebidas sin alcohol y un riesgo de demanda para las cerveceras y destiladoras tradicionales.
  - Falta en el sistema: No existen tendencias de consumo de alcohol por país en lib/data/country-resources.json ni en lib/macro; haría falta una serie de consumo de alcohol per cápita por país.
  - «After spiking during the COVID-19 pandemic, global alcohol consumption has declined year over year.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[empresa]** Athletic compite en cerveza sin alcohol contra los mayores cerveceros del mundo, tanto grandes grupos como internacionales, mientras es la marca líder en EE. UU. desde su fundación en 2017. _Empresas: Athletic Brewing Company._
  - Por qué importa: Define el panorama competitivo: una empresa privada líder frente a incumbentes con escala y distribución, relevante para valorar el riesgo de que entren a la categoría.
  - Falta en el sistema: El sistema no tiene empresas del sector bebidas ni cerveceras (ni sus marcas sin alcohol) en lib/data/corporate-facilities ni trade-dag.
  - «Then within non-alcoholic beer itself, there are macro and international brewers. We're competing against the biggest brewers in the world.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[infraestructura]** Athletic construye y opera sus propias cervecerías y controla la calidad con equipo propio a tiempo completo; su cervecería insignia tiene unos 150.000 pies cuadrados de producción. _Empresas: Athletic Brewing Company._
  - Por qué importa: La integración vertical da control de calidad y marca, pero implica capex y riesgo operativo al escalar la capacidad.
  - Falta en el sistema: lib/data/corporate-facilities no incluye plantas de empresas de consumo/bebidas; faltan capacidad y ubicación de cervecerías.
  - «That's why it's like so important for us to build our all our own breweries, own all our own quality.» — [Inside Athletic Brewing’s Plan to Shake Up the Beer Industry | Quantum Marketing](https://www.youtube.com/watch?v=cvv5iPwKRyQ) · cita ✓
- **[cifra]** La inflación de EE. UU. pasó del 2,4% a comienzos de 2026 al 3,7% en septiembre, tras más de seis meses de guerra entre EE. UU./Israel e Irán.
  - Por qué importa: Una reaceleración de la inflación ligada a energía limita la capacidad de la Fed para recortar tipos y presiona márgenes y valoraciones de empresas estadounidenses.
  - Falta en el sistema: lib/macro/fred/americas.ts solo mapea el ID de serie CPIAUCSL; no hay lectura actual de inflación EE. UU. ni su vínculo con el shock energético del conflicto con Irán.
  - «Fast-forward to 2026, the inflation rate was 2.4%, but more than six months into the US-Israel war with Iran, inflation has heated up. In September, it was 3.7%.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: CPIAUCSL, inflation, Iran war
- **[riesgo]** La guerra de EE. UU./Israel con Irán está disparando los precios de la energía; el diésel es el combustible más afectado y un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible.
  - Por qué importa: El diésel mueve el transporte y la distribución de bienes; su encarecimiento traslada costes a toda la economía y golpea a logística, retail y consumo.
  - Falta en el sistema: lib/services/maritime-chokepoints y lib/data/natural-resources.json no modelan el impacto del conflicto con Irán sobre el precio del diésel ni su transmisión a costes de transporte en EE. UU.
  - «Before the Iran war, I was at $800- $1,200 a week at fuel. I'm up to about $1,700-$1,800 now a week.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: diesel, Iran war
- **[cifra]** Frente a antes de la pandemia, los alimentos suben más del 30%, el alquiler más de un tercio, el seguro de coche casi un 50% y la energía aún más.
  - Por qué importa: Mide la erosión del poder adquisitivo y explica la caída de confianza del consumidor, que afecta a ventas minoristas y a la sostenibilidad del gasto.
  - Falta en el sistema: lib/macro no tiene desglose de inflación por componentes (alimentos, vivienda, seguros, energía) para EE. UU.
  - «groceries are up over 30%. Rent's up by over a third. You've seen car insurance rise by nearly 50% and energy prices are even higher than that.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **[riesgo]** Los salarios ajustados por inflación vuelven a caer en los últimos meses y la duración del desempleo ronda los seis meses, algo que históricamente coincide con recesión.
  - Por qué importa: Salarios reales a la baja y desempleo más prolongado, pese a una tasa de paro baja, son señales adelantadas de debilidad del consumo, motor de la economía estadounidense.
  - Falta en el sistema: lib/macro/fred/americas.ts no incluye series de salario real ni duración del desempleo para EE. UU.
  - «in the last few months, inflation adjusted wages have started to decline again.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **[cifra]** El precio mediano de la vivienda en EE. UU. subió cerca de un 50% y los tipos hipotecarios pasaron de menos del 4% a más del 7%, duplicando aproximadamente la cuota mensual frente a 2019; la construcción residencial estaría casi en recesión.
  - Por qué importa: Asequibilidad de la vivienda hundida y construcción residencial débil afectan a constructoras, materiales y banca hipotecaria, y alimentan el populismo económico electoral.
  - Falta en el sistema: lib/macro no tiene series de precio de vivienda ni tipo hipotecario a 30 años (p. ej. MORTGAGE30US) ni indicadores de construcción residencial de EE. UU.
  - «the median price of a home in the US has gone up by about 50% and mortgage rates have gone up from below 4% to above 7%.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓
- **[oportunidad]** Según un análisis de Bloomberg Economics, la inversión relacionada con IA aportó cerca de un punto porcentual al crecimiento del PIB de EE. UU. en 2025, aproximadamente la mitad del crecimiento total.
  - Por qué importa: El crecimiento estadounidense depende en gran medida del capex en IA: favorece a proveedores de chips, centros de datos y construcción no residencial, pero concentra el riesgo si el ciclo se revierte.
  - Falta en el sistema: lib/macro/sector-base-rates.ts y lib/data/corporate-facilities no cuantifican la contribución del capex en IA al PIB de EE. UU. ni la dependencia del crecimiento respecto a él.
  - «AI-related investment added roughly one percentage point to GDP growth in 2025, about half of overall economic growth.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: capex, data center
- **[riesgo]** La demanda de inversión en IA encarece software y ordenadores, añade presión a la inflación general y genera rechazo local a los centros de datos y temor a la sustitución de empleos.
  - Por qué importa: Los costes de IA contribuyen a la inflación y el rechazo social a los centros de datos puede frenar proyectos y retrasar el despliegue de capacidad de los hiperescalares.
  - Falta en el sistema: lib/data/corporate-facilities (centros de datos de hiperescalares) no registra riesgo de oposición local ni el efecto de la inversión en IA sobre precios de hardware y software.
  - «AI and this demand and need to put billions of dollars into investment in it has driven up the costs of everything from software to computers» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: hyperscale
- **[politica]** La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten.
  - Por qué importa: Un posible acuerdo energético EE. UU.-Rusia afectaría a sanciones, flujos de diésel y precios, con implicaciones para refinadores, transporte y relaciones bilaterales.
  - Falta en el sistema: lib/data/bilateral-relations/relations.json no refleja cooperación energética EE. UU.-Rusia sobre diésel ni el vínculo con las políticas de contención de precios.
  - «making a deal with Russia to try to get more supply of diesel on the market» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: sanctions, energy deal
- **[riesgo]** La oposición local a los centros de datos crece en EE. UU.: vecinos frenaron en tribunales un proyecto de más de 35 centros de datos en casi 2.000 acres junto al parque de Manassas.
  - Por qué importa: El rechazo vecinal y judicial retrasa o cancela proyectos de infraestructura de IA, elevando el riesgo de ejecución y de calendario para promotores, eléctricas e hiperescaladores.
  - Falta en el sistema: corporate-facilities lista centros de datos de hiperescaladores, pero no tiene riesgo de oposición local/permisos ni proyectos bloqueados por país o estado.
  - «residents fought to prevent a project that would've included more than 35 data centers on nearly 2,000 square acres of land near Manassas National Battlefield Park» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓ · a revisar: data center
- **[riesgo]** Los centros de datos se asocian entre los vecinos con daño ambiental, uso de agua y subidas de la factura eléctrica, lo que alimenta el rechazo político.
  - Por qué importa: El coste eléctrico y el uso de agua pueden traducirse en regulación, tarifas especiales o moratorias que afectan a márgenes de operadores de centros de datos y a eléctricas.
  - Falta en el sistema: country-resources y macro no relacionan demanda eléctrica de IA/centros de datos con precios de electricidad ni con presión regulatoria.
  - «They are associated with environmental damage, water usage, electricity bills going up.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓ · a revisar: data center
- **[cifra]** La industria invierte alrededor de un billón de dólares solo este año en construir centros de datos, y centenares de miles de millones más en empresas del ecosistema de IA.
  - Por qué importa: Dimensiona el capex de IA como motor del crecimiento de EE. UU. y de la demanda de chips, energía y construcción, y por tanto de la exposición a un posible giro regulatorio o de sentimiento.
  - Falta en el sistema: corporate-facilities y trade-dag no incluyen cifras de capex agregado en centros de datos ni su peso en el crecimiento económico.
  - «an industry that's putting a trillion dollars just into building data centers this year and probably hundreds of billions more into the various companies that are working in and around AI» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓ · a revisar: capex, data center
- **[politica]** Los grupos políticos alineados con la IA han recaudado cerca de 300 millones de dólares para las elecciones de mitad de mandato de EE. UU., con más de 11.000 millones gastados en publicidad en el ciclo.
  - Por qué importa: Indica la capacidad de la industria de IA para influir en la legislación federal y estatal, determinante para el marco regulatorio al que se enfrentan las empresas de IA cotizadas.
  - Falta en el sistema: No existe un módulo de influencia política/lobby sectorial ni de financiación de campañas por industria en el sistema.
  - «AI aligned political groups have raised close to $300 million for the midterms.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **[politica]** Dos bandos financian la regulación de la IA: Leading the Future (unos 140 millones, a favor de normas federales ligeras) y Public First Action (unos 83 millones respaldados por Anthropic, a favor de salvaguardas estrictas). _Empresas: Anthropic, OpenAI._
  - Por qué importa: El resultado de esta pugna decide si las empresas de IA operarán con estándares federales ligeros o con salvaguardas estrictas, con impacto en costes de cumplimiento y valoración del sector.
  - Falta en el sistema: Falta un dataset de posturas regulatorias y financiación política de empresas de IA (super PACs, bandos pro/anti-regulación).
  - «Public First Action has received significant backing from AI giant Anthropic, with an estimated $83 million overall.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **[politica]** Aumenta la presión por regulación de la IA a nivel estatal y local en EE. UU., lo que apunta a un mosaico normativo en lugar de un marco federal único.
  - Por qué importa: Un mosaico de reglas estatales encarece el cumplimiento y la ubicación de infraestructura de IA, y condiciona dónde se invierte dentro de EE. UU.
  - Falta en el sistema: El sistema carece de un tracker de regulación de IA por jurisdicción (federal, estatal, local) y por país.
  - «as AI's footprint grows, pressure for government action, particularly at the state and local level, is only increasing.» — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ) · cita ✓
- **[cifra]** Los inversores extranjeros ya poseen el 20% de toda la renta variable estadounidense, con el capital concentrado en muy pocas manos tecnológicas americanas por el auge de la IA.
  - Por qué importa: Mide la dependencia de las valoraciones de EE. UU. del capital extranjero y la exposición de otros países si caen las tecnológicas de IA.
  - Falta en el sistema: Módulo macro (lib/macro) sin datos de posiciones extranjeras en acciones/bonos de EE. UU. (TIC, IIP); falta serie de tenencias foráneas por país de origen.
  - «foreign investors now count for 20% of all US equity holdings.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **[relacion_bilateral]** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses, financiando el propio boom de IA (flujo circular).
  - Por qué importa: Si cae la valoración de la IA, las economías asiáticas exportadoras sufren una doble pérdida: activos en EE. UU. devaluados y menores exportaciones.
  - Falta en el sistema: trade-dag y relaciones bilaterales no modelan flujos financieros de retorno (inversión de cartera) entre exportadores de chips y EE. UU.; falta enlace financiero junto al comercial.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: current account
- **[riesgo]** La succión de capital hacia la IA dificulta la colocación de bonos del Tesoro; EE. UU. paga ya 1 billón de dólares anuales en intereses sobre más de 40 billones de deuda.
  - Por qué importa: Menor demanda de Treasuries implica mayores rendimientos y coste fiscal, afectando riesgo soberano de EE. UU. y valoración de activos globales.
  - Falta en el sistema: Macro EE. UU. (FRED) tiene tipo de interés de pagos federales en tipos, pero no la deuda total ni la carga de intereses ni la composición de compradores extranjeros del Tesoro.
  - «now paying $1 trillion a year in interest on more than $40 trillion of US debt.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: interest payments, federal debt
- **[riesgo]** Una caída fuerte de las valoraciones de IA podría revelar exposiciones ocultas y golpear dos veces a las economías asiáticas: por la desvalorización de sus activos en EE. UU. y por el deterioro de su balanza comercial.
  - Por qué importa: Riesgo de contagio concentrado en exportadores de semiconductores; relevante para empresas de Corea, Japón y Taiwán expuestas al ciclo de gasto en IA.
  - Falta en el sistema: Falta escenario de estrés de burbuja de IA en wargame-simulator/trade-dag que combine pérdida de valoración de cartera exterior y caída de exportaciones de chips.
  - «Asia economies can be hit twice where the amount they've invested into US companies gets devalued and at the same time, their trade balance and economy along with it weakens as well.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓
- **[politica]** La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista, buscando reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales.
  - Por qué importa: La política industrial y arancelaria de EE. UU. concentra capital en IA y condiciona flujos globales, afectando exposición país y sectores.
  - Falta en el sistema: Sin módulo de política industrial/comercial de EE. UU. (aranceles, estrategia IA) que vincule déficit comercial y gasto en IA con riesgo soberano de terceros.
  - «He really believes that the US is in an existential competition with China over leadership of this important technology.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: tariff
- **[empresa]** Blackstone gestiona 1,3 billones de dólares y en julio de 2026 poseía más de 12.500 activos inmobiliarios y 250 empresas participadas; salió a bolsa en 2007. _Empresas: Blackstone (BX)._
  - Por qué importa: Blackstone es el mayor gestor de activos alternativos del mundo; su escala y exposición a inmobiliario y empresas privadas lo convierte en termómetro del capital privado estadounidense.
  - Falta en el sistema: lib/data/bloomberg-originals o un dataset de gestores de activos alternativos: no hay ninguna ficha de Blackstone con AUM, activos y participadas.
  - «today   it manages $1.3 trillion. In July 2026, it held more   than 12,500 real estate assets and 250 portfolio companies. It went public in 2007.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **[infraestructura]** Blackstone compró un gran operador de centros de datos en 2021 por 10.000 millones de dólares que ahora es 15 veces mayor, y se declara el mayor propietario de centros de datos del mundo, con los seis hiperescaladores como clientes. _Empresas: Blackstone (BX)._
  - Por qué importa: Muestra que la infraestructura de IA (centros de datos) está concentrada en capital privado y que los hiperescaladores dependen de ella; es una vía de exposición a la IA distinta de las cotizadas tecnológicas.
  - Falta en el sistema: lib/data/corporate-facilities solo cubre instalaciones de cotizadas tech (AAPL, MSFT, GOOGL...); falta la capa de propietarios/operadores privados de centros de datos y su capacidad.
  - «we bought a very large data center, a company in 2021, for $10 billion. It's now 15 times larger. We're the largest owner of   data centers in the world.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓ · a revisar: data center
- **[riesgo]** El crédito privado vale 1,8 billones de dólares y podría duplicarse para 2030, pero hay preocupación por la exposición a software; el fondo BCRED de Blackstone y otros limitaron retiradas tras solicitudes por encima de los límites preestablecidos. _Empresas: Blackstone (BX)._
  - Por qué importa: Un riesgo sistémico de banca en la sombra: préstamos ilíquidos sin precio de mercado, con redenciones limitadas, pueden provocar ventas forzadas y contagio a gestores y a empresas de software endeudadas.
  - Falta en el sistema: lib/macro/bis-client.ts solo trae crédito bancario al sector privado (BIS); falta un indicador de crédito privado no bancario (tamaño, redenciones, rendimiento ~9%, impagos).
  - «Now it's worth $1.8 trillion and could double in size by 2030. Today, some investors are   worried about risks building in private credit, with software companies   a particular focus.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓ · a revisar: private credit
- **[cifra]** OpenAI está valorada en 852.000 millones de dólares tras una ronda de 122.000 millones, y Anthropic negocia captar 30.000 millones a una valoración de 900.000 millones. _Empresas: OpenAI, Anthropic._
  - Por qué importa: Las valoraciones privadas de IA arrastran demanda de chips, energía y centros de datos; si no se materializa el retorno, hay riesgo de burbuja en toda la cadena (NVDA, TSM, ASML, eléctricas).
  - Falta en el sistema: Falta un dataset de valoraciones y rondas de las empresas de IA privadas; el sistema solo tiene OpenAI de forma marginal en corporate-facilities y fixtures de noticias.
  - «OpenAI is now valued at $852 billion. The AI company closed a $122   billion funding round intended to help with its costly   push for more chips, data centers, and talent.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓ · a revisar: OpenAI
- **[recurso]** Schwarzman afirma que el boom de centros de datos de IA hará que el mundo desarrollado se quede corto de electricidad, y Blackstone ha invertido mucho en ese sector antes que otros.
  - Por qué importa: La escasez de electricidad es un cuello de botella para la IA y una oportunidad en generación, redes y almacenamiento en países desarrollados.
  - Falta en el sistema: lib/data/country-resources.json tiene generación renovable/nuclear, pero no demanda eléctrica de centros de datos ni déficit proyectado por país.
  - «we learned that, you know, certainly the   developed world is going to be short electricity. Now we've become huge   investors in that area before other people did it.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **[politica]** Trump firmó una orden para imponer un arancel global del 10% bajo la Sección 122 sobre los aranceles normales ya vigentes.
  - Por qué importa: Un arancel global adicional del 10% encarece importaciones y cambia márgenes de empresas dependientes de cadenas globales de suministro, con efecto en todos los socios comerciales de EE. UU.
  - Falta en el sistema: Falta un dataset de aranceles vigentes por país/producto (tipo, base legal, fecha); lib/services/trade-dag no modela aranceles aplicados.
  - «Today I will sign an   order to impose a 10% global tariff under Section 122 over and above our normal tariffs   already being charged.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **[relacion_bilateral]** Según Schwarzman, EE. UU. y China suman aproximadamente el 42% de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa.
  - Por qué importa: El ciclo de escalada o distensión entre las dos mayores economías determina aranceles, controles de exportación y acceso a minerales críticos, y afecta a casi cualquier empresa global.
  - Falta en el sistema: engine/relations/model/v6_US-CN.json tiene la puntuación del par, pero no el evento reciente (cumbre Xi-Trump en Pekín, tregua de tierras raras) ni los controles de exportación de minerales críticos como eventos fechados.
  - «These are two countries that understand that together they have approximately 42% of the world's economy.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓ · a revisar: rare earth, export controls
- **[oportunidad]** En 2025 EE. UU. construyó el mismo número de viviendas que en 1960 con una población más que duplicada; Blackstone posee unas 60.000 viviendas y planea ofrecer préstamos para construir 50.000 viviendas al año. _Empresas: Blackstone (BX)._
  - Por qué importa: El déficit de oferta de vivienda sostiene los precios y abre oportunidades en promoción, crédito a la construcción y alquiler, pero también riesgo político por la regulación de grandes inversores.
  - Falta en el sistema: No hay datos de mercado de vivienda por país (oferta, déficit, inversores institucionales, regulación) en lib/macro ni lib/data.
  - «Last year, 2025, we built the same number of houses in the United   States as we did in 1960.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓

### CN (17)

- **[oportunidad]** El Northern Metropolis es un plan gubernamental de nuevo polo tecnológico para integrar Hong Kong con China continental, con medio millón de viviendas y siete estaciones nuevas. _Empresas: MTR Corporation (66)._
  - Por qué importa: Política industrial y de vivienda que condiciona constructoras, promotores y MTR, con motivación de integración política con China.
  - Falta en el sistema: Falta un dataset de políticas industriales y megaproyectos por país y su vínculo con relaciones bilaterales (HK-CN).
  - «a massive government plan to build a new tech hub to better integrate Hong Kong with mainland China, including the goal to build half a million new homes.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[riesgo]** Los residentes de Hong Kong hacen más de 90 millones de viajes al año a Shenzhen, desviando gasto del comercio local, y los alquileres de tiendas MTR se ajustan a la baja.
  - Por qué importa: La fuga de consumo hacia China continental presiona retail y alquileres de Hong Kong, un riesgo para inmobiliarias y comercio minorista.
  - Falta en el sistema: Falta indicador de flujos de consumo y turismo transfronterizo HK-CN en lib/macro o bilateral-relations.
  - «residents now make more than 90 million trips a year to Shenzhen in mainland China, shifting spending across the border and away from local retailers.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓ · a revisar: Shenzhen, cross-border
- **[relacion_bilateral]** Tras decir Takaichi que una guerra por Taiwán sería una amenaza existencial para Japón, China respondió con una campaña diplomática para aislarla; Pekín es el mayor socio comercial de Japón y su máximo diplomático describe la relación en mínimos.
  - Por qué importa: El deterioro Japón-China amenaza el principal vínculo comercial de Japón y a las empresas con exposición a ambos mercados; añade riesgo de represalias económicas.
  - Falta en el sistema: engine/relations/model y lib/data/bilateral-relations/relations.json deberían reflejar el enfriamiento JP-CN de 2026 (disparador: declaraciones sobre Taiwán, ausencia de contacto de alto nivel) como evento reciente.
  - «When Takaichi said that a war over Taiwan would be an existential threat for Japan» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: Taiwan
- **[cifra]** Según estimaciones de la Semiconductor Industry Association, China va camino de invertir 142.000 millones de dólares en fabricación de chips, en el marco de décadas de política industrial.
  - Por qué importa: Dimensiona la subvención estatal china a semiconductores: presiona los márgenes de competidores (TSMC, Intel, Samsung) y anticipa sobrecapacidad en nodos maduros y disputas en la OMC.
  - Falta en el sistema: Cadena de valor de semiconductores (trade-dag) y perfil soberano de China no incluyen el monto de inversión/subsidio estatal en fabricación de chips.
  - «China's on track to invest $142 billion into chip making.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **[politica]** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque cedió algunos beneficios; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - Por qué importa: Define el campo de negociación de la reforma de la OMC y de las reglas de subsidios, con implicaciones para aranceles, ayudas estatales y litigios comerciales entre las grandes economías.
  - Falta en el sistema: Relaciones bilaterales y perfiles soberanos no registran el estatus en la OMC (país en desarrollo vs. desarrollado) ni posiciones sobre la reforma de reglas de subsidios.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: WTO
- **[cifra]** China añadió en 2025 más de 500 GW de capacidad eléctrica en 12 meses, equivalente a todo el sistema eléctrico de la India.
  - Por qué importa: Marca la escala del ciclo de inversión energética chino y la ventaja de coste/abundancia eléctrica para su industria (IA, robótica, manufactura).
  - Falta en el sistema: lib/data/country-resources.json tiene electricidad renovable/nuclear por país pero no capacidad instalada añadida por año ni series de adiciones de GW.
  - «It added enough power to match India's entire electricity system, more than 500 gigawatts in just 12 months.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **[riesgo]** Recortes (curtailment) de eolica y solar en China: la capacidad instalada de solar y eolica ronda el 50% pero la generacion apenas supera el 20%, y en el primer semestre de 2026 la energia desperdiciada podria haber abastecido a Francia.
  - Por qué importa: La brecha capacidad-generacion y el curtailment erosionan el retorno de proyectos renovables chinos y de sus fabricantes/operadores; indica cuello de botella en red, no en generacion.
  - Falta en el sistema: No existe indicador de curtailment ni de factor de utilizacion renovable para China en lib/macro ni country-resources; falta el desfase capacidad vs generacion.
  - «China's installed capacity of all solar and wind is about 50% but the generation from solar and wind is actually only just over 20%.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓ · a revisar: curtailment, utilization
- **[infraestructura]** China es lider global en almacenamiento en baterias: aumento su capacidad de ion-litio un 84% entre 2024 y 2025 y tiende miles de km de lineas de larga distancia desde el Gobi a los centros urbanos, pero ambos activos estan infrautilizados.
  - Por qué importa: Define la demanda de baterias y transmision (UHV) y el riesgo de activos varados si no se usan; relevante para fabricantes de baterias y operadores de red.
  - Falta en el sistema: trade-dag cubre baterias EV (CATL, BYD) pero no almacenamiento estacionario a escala de red ni lineas de transmision de larga distancia; falta capacidad de almacenamiento por pais.
  - «It's also become the global leader in battery storage, increasing its lithium ion battery capacity by 84% between 2024 and 2025» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓ · a revisar: transmission
- **[politica]** Pekin se ha comprometido a tener un mercado electrico nacional unificado en 2030, rompiendo las barreras provinciales y pasando de un despacho controlado por la red a mercados mayoristas.
  - Por qué importa: La liberalizacion del mercado electrico cambia precios, margenes de generadores y valor del carbon como respaldo; es un catalizador regulatorio con fecha para utilities y renovables.
  - Falta en el sistema: No hay modulo de politica energetica/reforma de mercado electrico por pais; falta el hito 2030 y el estado de la reforma en China.
  - «It says it will have a unified national power market by 2030, moving it one step closer to the energy abundance Chinese officials hope will power the future economy.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **[riesgo]** La red china la operan un par de gigantes estatales con despacho centralizado a la antigua y cada provincia es responsable de su propio suministro, lo que impide compartir energia en picos de demanda. _Empresas: State Grid._
  - Por qué importa: Fragmentacion provincial y control estatal de la red limitan la absorcion de renovables y elevan el riesgo de apagones regionales como los de 2021-2022.
  - Falta en el sistema: Sin perfiles de empresas de red estatales ni del riesgo de suministro provincial en lib/data o lib/services; el poder soberano de China no incluye energia electrica.
  - «You don't have one unified power market, but in fact, every province is responsible for securing its own energy supply.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **[riesgo]** El carbon sigue siendo dificil de apagar: China es con diferencia el mayor consumidor y productor mundial y parte de su generacion esta bloqueada en contratos anuales, lo que fuerza recortes de renovables a final de ano.
  - Por qué importa: La rigidez contractual del carbon limita la transicion y el retorno de renovables; sugiere estacionalidad en el recorte y dependencia prolongada del carbon.
  - Falta en el sistema: country-resources.json tiene produccion de carbon pero no contratos anuales, flexibilidad del parque ni el rol del carbon como respaldo en China.
  - «Towards the end of the year, if solar and wind generation has been quite high, it's going to be curtailed in the last few months because these coal power plants need to fulfill their contracts.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓ · a revisar: coal
- **[empresa]** Seres opera en Chongqing una Super Factory con 3.000 robots y sus vehiculos AITO superaron un millon de entregas en 46 meses, un record en el mercado de VE chino. _Empresas: Seres (AITO)._
  - Por qué importa: Ejemplifica la manufactura electrificada y automatizada que impulsa la demanda de electricidad y posiciona a Seres como fabricante de VE de alto crecimiento.
  - Falta en el sistema: trade-dag y corporate-facilities no incluyen a Seres/AITO ni su cuota ni sus fabricas; solo BYD y CATL entre los actores de VE chinos.
  - «According to Seres, its luxury AITO vehicles passed one million deliveries in just 46 months, a record for China's EV market.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓ · a revisar: Seres
- **[oportunidad]** China apuesta por IA, robotica y manufactura avanzada, que requieren mucha energia, con el objetivo de crear una capa de electricidad limpia casi infinita y barata como ventaja competitiva industrial.
  - Por qué importa: Una ventaja de coste energetico estructural favorece a centros de datos, EV y manufactura china frente a competidores con electricidad cara; tesis de largo plazo si resuelve el cuello de botella de red.
  - Falta en el sistema: No hay comparativa de coste de electricidad industrial por pais ni vinculo entre abundancia energetica y competitividad de datacenters/manufactura en lib/macro.
  - «So it wants to create this layer of almost infinite, cheap, clean electricity that its industries can tap into.» — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI) · cita ✓
- **[cifra]** A finales de 2024 el gobierno chino indicó que tenía casi 500 embarcaciones eléctricas operando, la mayoría ferris.
  - Por qué importa: China lidera la adopción de buques eléctricos, lo que refuerza la demanda doméstica de baterías (CATL, BYD) y su ventaja en la cadena de valor marítima verde.
  - Falta en el sistema: El nodo de baterías EV en lib/data/trade-dag cubre vehículos, pero no la demanda de baterías para buques ni el despliegue naval eléctrico de China.
  - «We saw China's government at the end of 2024 indicate they had almost 500 electric powered vessels on the water. The majority of those were ferries.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **[politica]** La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista, buscando reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales.
  - Por qué importa: La política industrial y arancelaria de EE. UU. concentra capital en IA y condiciona flujos globales, afectando exposición país y sectores.
  - Falta en el sistema: Sin módulo de política industrial/comercial de EE. UU. (aranceles, estrategia IA) que vincule déficit comercial y gasto en IA con riesgo soberano de terceros.
  - «He really believes that the US is in an existential competition with China over leadership of this important technology.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: tariff
- **[politica]** Trump firmó una orden para imponer un arancel global del 10% bajo la Sección 122 sobre los aranceles normales ya vigentes.
  - Por qué importa: Un arancel global adicional del 10% encarece importaciones y cambia márgenes de empresas dependientes de cadenas globales de suministro, con efecto en todos los socios comerciales de EE. UU.
  - Falta en el sistema: Falta un dataset de aranceles vigentes por país/producto (tipo, base legal, fecha); lib/services/trade-dag no modela aranceles aplicados.
  - «Today I will sign an   order to impose a 10% global tariff under Section 122 over and above our normal tariffs   already being charged.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓
- **[relacion_bilateral]** Según Schwarzman, EE. UU. y China suman aproximadamente el 42% de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa.
  - Por qué importa: El ciclo de escalada o distensión entre las dos mayores economías determina aranceles, controles de exportación y acceso a minerales críticos, y afecta a casi cualquier empresa global.
  - Falta en el sistema: engine/relations/model/v6_US-CN.json tiene la puntuación del par, pero no el evento reciente (cumbre Xi-Trump en Pekín, tregua de tierras raras) ni los controles de exportación de minerales críticos como eventos fechados.
  - «These are two countries that understand that together they have approximately 42% of the world's economy.» — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck) · cita ✓ · a revisar: rare earth, export controls

### -- (13)

- **[cifra]** El precio del cobre se ha más que duplicado en los últimos 10 años por la demanda de electrificación (coches eléctricos, turbinas eólicas).
  - Por qué importa: Confirma un superciclo de precio estructural del cobre que mejora la rentabilidad de mineros y países exportadores (Chile, Perú, RDC) y encarece a los consumidores industriales.
  - Falta en el sistema: lib/data/critical-commodities/metals.ts tiene perfil de cobre (orígenes vulnerables, cuotas) pero no serie de precios ni tendencia de precio/demanda.
  - «And its value has more than doubled over the last 10 years.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓ · a revisar: copper, cobre
- **[cifra]** La demanda mundial de electricidad se duplicaría hacia 2050, y sin cobre no habría redes, renovables, vehículos eléctricos ni centros de datos.
  - Por qué importa: Es el motor de demanda de largo plazo del cobre; sostiene la tesis de inversión en mineras de cobre y en infraestructura eléctrica.
  - Falta en el sistema: El perfil de cobre menciona la transición energética de forma cualitativa; falta proyección cuantitativa de demanda de cobre y de electricidad a 2050.
  - «The global demand for electricity is expected to double by 2050.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓ · a revisar: 2050
- **[riesgo]** La oferta de cobre es estructuralmente limitada: no se descubren minas nuevas fácilmente y abrir una cuesta mucho dinero y años, y la mayoría de mineras son reacias a invertir miles de millones en minas nuevas.
  - Por qué importa: Un déficit de oferta con plazos largos de inversión sostiene precios altos y da poder de mercado a los productores actuales; riesgo de escasez para industrias electrificadas.
  - Falta en el sistema: Falta en critical-commodities un indicador de pipeline de proyectos mineros, plazos de puesta en marcha y capex por país.
  - «Opening a new mine costs a pretty penny, and it takes years to build.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **[cifra]** El cobre restante en la superficie está en menas de baja ley (0,25-0,3% de cobre), y los métodos tradicionales recuperan aproximadamente la mitad.
  - Por qué importa: La caída de la ley del mineral eleva costes y consumo de energía/agua por tonelada, y define qué minas y países seguirán siendo rentables.
  - Falta en el sistema: country-resources.json y metals.ts dan producción y cuota de cobre pero no ley media del mineral ni tasa de recuperación por país/mina.
  - «Most of the copper that's left on the surface of the planet is trapped in low-grade ores. I am talking rocks that are like 0.25 to 0.3% copper.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **[cifra]** La lixiviación en pilas tradicional recupera solo un 20-50% del cobre; la biominería (microbios) busca elevar esa recuperación sin abrir minas nuevas, aunque aún no está probada a escala real. _Empresas: Endolith._
  - Por qué importa: Si la biominería funciona, aumenta la oferta de cobre de minas existentes con menor capex y menor huella de carbono; es una opción tecnológica para mineras y una amenaza para los proyectos greenfield.
  - Falta en el sistema: No hay dataset de tecnologías de extracción ni de tasas de recuperación en lixiviación; ninguna mención a biominería.
  - «Traditionally, heap leaches get about 20 to 50% of copper out. Endolith says they can get more» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓
- **[riesgo]** Cerca del 25% del comercio mundial ya no se rige por las reglas de la OMC, mientras que alrededor de tres cuartas partes sí, lo que mide el grado de fragmentación comercial.
  - Por qué importa: Indica cuánto comercio queda expuesto a medidas unilaterales, acuerdos bilaterales y subsidios sin disciplina, es decir, a riesgo regulatorio y de represalias para empresas exportadoras.
  - Falta en el sistema: Relaciones bilaterales y bloques no incorporan membresía/estatus en la OMC ni indicadores de fragmentación comercial (porcentaje de comercio bajo reglas OMC).
  - «what do we do with say the 25% that is not going on according to WTO rules?» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: WTO
- **[oportunidad]** El comercio digitalmente entregado (cine, música, educación, salud) crece alrededor de 6% anual y ronda 4 billones de dólares, dentro de un comercio mundial de unos 33 billones.
  - Por qué importa: Es el segmento del comercio que más rápido crece; señala dónde se concentran los ingresos de plataformas y servicios exportables frente al comercio de bienes.
  - Falta en el sistema: Macro por país no tiene exportaciones de servicios digitales ni peso del comercio digital; solo comercio de bienes e indicadores generales del Banco Mundial.
  - «growing the fastest at about 6% per year. It's about $ 4 trillion now,» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **[cifra]** El transporte marítimo internacional emitió en 2024 unos 740 millones de toneladas de CO2 equivalente, cerca del 1,4% de las emisiones globales, más que Alemania o Corea del Sur.
  - Por qué importa: Dimensiona la presión regulatoria de descarbonización sobre navieras, astilleros y proveedores de combustibles y baterías, con impacto en costes de flete y capex de flota.
  - Falta en el sistema: lib/services/maritime-chokepoints y lib/macro modelan fletes y congestión, pero no emisiones del transporte marítimo ni riesgo regulatorio de descarbonización (IMO, UE) sobre las navieras.
  - «international shipping accounted for about 740 million tons of carbon dioxide equivalent. That's the measure that we use to calculate all greenhouse gases. To put it in context, that was roughly 1.4% of all global emissions.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **[riesgo]** Las baterías no sirven para el transporte oceánico de larga distancia, que seguirá dependiendo de combustibles alternativos (hidrógeno, quizá nuclear); solo ferris y rutas cortas se electrifican.
  - Por qué importa: Acota el mercado de baterías marinas a rutas cortas y evita sobrevalorar tesis de electrificación total; la descarbonización de la carga oceánica depende de otros combustibles.
  - Falta en el sistema: Las materias primas críticas y chokepoints no distinguen entre segmentos de flota ni modelan la transición de combustibles marítimos.
  - «The longer distance ships that are crossing the, crossing oceans will never go electric.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓ · a revisar: LNG
- **[cifra]** El mercado de ferris eléctricos es mínimo frente a la flota mundial (menos del 1% de los buques), aunque los ferris transportaron más de 4.000 millones de pasajeros al año y sostienen 60.000 millones de dólares de PIB.
  - Por qué importa: Da el tamaño real del mercado y su relevancia económica; ayuda a no sobrestimar los ingresos de los fabricantes a corto plazo.
  - Falta en el sistema: No existe un dataset de tamaño de mercado ni de flota naval por tipo de buque.
  - «ferries carried more than four billion passengers annually and supported $60 billion in GDP globally.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓ · a revisar: fleet
- **[cifra]** En 2025 las economías con superávit por cuenta corriente sumaron unos 2,5 billones de dólares, con déficits equivalentes en el lado opuesto; la brecha es la mayor desde 2008.
  - Por qué importa: Los desequilibrios globales elevados precedieron la crisis financiera de 2008 y señalan vulnerabilidad sistémica y búsqueda de activos de mayor riesgo.
  - Falta en el sistema: lib/macro no incluye saldo de cuenta corriente por país (World Bank BN.CAB.XOKA.CD) ni agregado global de superávit/déficit; solo se menciona en el simulador de guerra comercial.
  - «In 2025, economies running current account surpluses recorded about $2.5 trillion between them.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: current account
- **[relacion_bilateral]** Los países que votan igual en la ONU invierten más entre sí, mientras los que votan en direcciones opuestas reducen la inversión mutua; la geopolítica condiciona los flujos de capital.
  - Por qué importa: Permite usar la afinidad diplomática como predictor de flujos de inversión directa y cartera entre pares de países.
  - Falta en el sistema: engine/relations/model puntúa relaciones bilaterales pero sin afinidad de voto en la ONU ni correlación con inversión cruzada; falta ese indicador y el dato de IED bilateral.
  - «countries that vote the same way in the United Nations, they're more likely to invest in each other.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: bilateral investment
- **[cifra]** La inversión transfronteriza creció del 27% del PIB mundial en 1980 al 141% en 2008, pero desde la crisis financiera se ha estancado pese a haber más dinero que nunca.
  - Por qué importa: Indica fragmentación de la globalización financiera: el capital no llega a mercados emergentes que necesitan infraestructura, lo que afecta oportunidades y riesgos de financiación.
  - Falta en el sistema: lib/macro carece de serie de inversión transfronteriza/IED y de integración financiera por país; faltan stocks de activos y pasivos externos (IIP) sobre PIB.
  - «They grew from 27% of global GDP in 1980 to 141% in 2008. But since the financial crisis, things have slowed down.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: cross-border

### BR (10)

- **[cifra]** La deuda pública de Brasil, que había bajado tras la pandemia, vuelve a crecer y el FMI estima que superará el 100% del PIB a finales de la década; el servicio de la deuda supera el 8% del PIB por los tipos de interés de doble dígito.
  - Por qué importa: Un servicio de deuda superior al 8% del PIB con deuda camino del 100% limita el margen fiscal y eleva el riesgo soberano y la prima de los bonos brasileños.
  - Falta en el sistema: Macro por país (lib/macro) y riesgo soberano base (lib/data/geopolitical-countries) no incluyen proyección de deuda/PIB del FMI ni coste del servicio de deuda para Brasil.
  - «But with double-digit interest rates, Brazil pays far more to service its borrowing. That cost is now over 8% of GDP.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓ · a revisar: debt service
- **[riesgo]** Más del 80% de los hogares brasileños tiene algún tipo de deuda y los tipos rotativos de las tarjetas de crédito superan el 400% anual, lo que alimenta un riesgo de desaceleración o recesión del consumo.
  - Por qué importa: El sobreendeudamiento de los hogares frena el consumo, principal motor del crecimiento, y presiona a bancos, minoristas y emisores de crédito.
  - Falta en el sistema: No hay dataset de endeudamiento de hogares ni de tipos de tarjeta para Brasil; solo aparecen series FRED de EE. UU. en lib/macro/fred/types.ts.
  - «The rotating interest rates of credit cards in Brazil reach over 400% a year. So this is a snowball that for some people is impossible to get out of.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓ · a revisar: household debt
- **[riesgo]** Las empresas brasileñas con pagos atrasados deben cerca de 239.000 millones de reales (unos 46.000 millones de dólares), un récord; el 90% de los nueve millones de negocios morosos son pequeñas y microempresas, y el agro está en niveles récord de impago.
  - Por qué importa: Un máximo histórico de morosidad empresarial, con el agro (clave en las exportaciones) renegociando deuda contraída en la pandemia, indica riesgo de crédito para bancos y proveedores agrícolas.
  - Falta en el sistema: Macro/BIS no incluye morosidad corporativa ni deuda del agro brasileño; el módulo de recursos (country-resources.json) solo cubre producción, no apalancamiento.
  - «Across Brazil, companies behind on their payments now owe nearly 239 billion reais, or about $46 billion, a record high.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **[empresa]** Raizen ha reestructurado su deuda este año y Casas Bahia, una de las cadenas minoristas más populares de Brasil, ha pedido protección por quiebra. _Empresas: Raizen, Casas Bahia._
  - Por qué importa: Son casos de alto perfil de estrés financiero en energía/biocombustibles y retail; señalan contagio del apalancamiento a grandes emisores y a la renta fija corporativa local.
  - Falta en el sistema: Sin empresas brasileñas en corporate-facilities, trade-dag ni sovereign-power; falta un registro de emisores en estrés para Brasil.
  - «We had Casas Bahia, one of the most popular retail chains in Brazil just very recently filing for bankruptcy protection.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **[riesgo]** Las apuestas en línea, legalizadas en 2018, mueven hasta 30.000 millones de reales (5.800 millones de dólares) al mes según el Banco Central, lo que agrava el sobreendeudamiento de los hogares.
  - Por qué importa: Es una fuga de renta disponible que reduce el consumo y la capacidad de pago, y abre un sector regulatorio nuevo con riesgo político.
  - Falta en el sistema: No existe ningún dato sobre apuestas en línea ni regulación de juego en Brasil en los módulos de macro o políticas.
  - «According to Central Bank estimates, Brazilians wager as much as 30 billion reais or 5.8 billion dollars a month.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓ · a revisar: betting
- **[otro]** Pix, el sistema de pago instantáneo gestionado por el Estado, ha sustituido al efectivo e incorpora un componente de crédito instantáneo; junto con las fintechs ha ampliado el acceso al crédito, y entre 2020 y 2024 las tarjetas activas crecieron aproximadamente tres cuartas partes.
  - Por qué importa: Explica el origen del auge de crédito y la oportunidad/riesgo para fintechs y bancos brasileños frente a un ciclo de morosidad.
  - Falta en el sistema: Falta infraestructura de pagos digitales (Pix) y penetración de crédito/fintech de Brasil en macro e infraestructura; fintech solo aparece en el árbol tecnológico y perfiles de otros países.
  - «Between 2020 and 2024, the number of active credit cards in Brazil jumped by roughly three quarters, while the number of people using them increased by 37 million.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓ · a revisar: fintech
- **[politica]** Más del 50% del presupuesto federal brasileño se destina a pensiones y gasto obligatorio constitucional; el gobierno de Lula impulsa gasto social (Bolsa Familia) que puede alimentar la inflación, mientras su rival Flavio Bolsonaro promete reformar las reglas fiscales con pocos detalles.
  - Por qué importa: La rigidez presupuestaria y el riesgo electoral sobre la regla fiscal determinan la trayectoria de la deuda y la dirección de los tipos y del real.
  - Falta en el sistema: geopolitical-countries tiene un riesgo soberano base 1-10 pero no rigidez presupuestaria, calendario electoral ni postura fiscal de candidatos para Brasil.
  - «So over 50% of Brazil's federal budget is spent on pensions, something you cannot cut.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **[cifra]** El banco central brasileño recorta tipos antes de las elecciones y se espera que los reduzca más hasta 2028, tras haber pasado de mínimos récord a dos dígitos en año y medio.
  - Por qué importa: La senda de tipos define el coste de la deuda pública y privada y el atractivo de la renta fija y variable brasileña.
  - Falta en el sistema: Los rendimientos soberanos y FRED en lib/macro no cubren la tasa de política (Selic) ni su senda esperada para Brasil.
  - «the central bank has been cutting interest rates ahead of the elections and is expected to further reduce them into 2028.» — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s) · cita ✓
- **[riesgo]** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo; el comercio digital podría quedar sujeto a impuestos nacionales.
  - Por qué importa: Riesgo regulatorio para plataformas, nube y servicios digitales transfronterizos: posibles aranceles y tasas digitales en grandes mercados emergentes.
  - Falta en el sistema: Relaciones bilaterales y módulo de políticas no recogen disputas de comercio digital ni la moratoria de la OMC sobre transmisiones electrónicas.
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **[politica]** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque cedió algunos beneficios; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - Por qué importa: Define el campo de negociación de la reforma de la OMC y de las reglas de subsidios, con implicaciones para aranceles, ayudas estatales y litigios comerciales entre las grandes economías.
  - Falta en el sistema: Relaciones bilaterales y perfiles soberanos no registran el estatus en la OMC (país en desarrollo vs. desarrollado) ni posiciones sobre la reforma de reglas de subsidios.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: WTO

### JP (9)

- **[politica]** El gobierno de Takaichi plantea una inversión pública y privada de 370 billones de yenes en 14 años (hasta 2040) repartida en 17 sectores estratégicos: IA, defensa, energía, semiconductores, tecnología alimentaria y contenidos como manga y anime.
  - Por qué importa: Define qué sectores japoneses recibirán capital y respaldo político en la próxima década (chips, defensa, energía, IA); orienta la selección de empresas, aunque es un objetivo y no un cheque del Estado.
  - Falta en el sistema: lib/services/sovereign-power/profiles/japan.ts y lib/data/trade-dag/semiconductors.ts no recogen la política industrial vigente de Japón (importe, plazo ni los 17 sectores); falta un dataset de políticas industriales por país.
  - «a 370 trillion yen investment, public and private, over 14 years. She has laid out 17 crucial sectors, including artificial intelligence, defense, energy, and semiconductors» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **[politica]** Takaichi se compromete a bajar el impuesto al consumo sobre alimentos y bebidas sin alcohol del 8% al 1% durante dos años desde abril de 2027, lo que preocupa a los mercados por el aumento de la deuda pública.
  - Por qué importa: Un recorte fiscal con fecha concreta afecta al consumo interno, a la oferta de bonos del Estado (JGB) y al coste de financiación; es un catalizador de riesgo soberano y de rendimientos.
  - Falta en el sistema: lib/macro/static-data.ts tiene el rendimiento del JGB a 10 años pero no los cambios fiscales previstos ni su calendario; falta un registro de medidas fiscales y su impacto en emisión de deuda.
  - «cut the consumption tax on food and soft drinks for two years from 8% to 1%. But this plan, which is set to start in April of 2027, also has markets concerned about mounting government debt.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: JGB, fiscal
- **[riesgo]** La deuda pública de Japón supera el doble de su PIB y su servicio absorbe alrededor de una quinta parte del presupuesto anual; financiar el plan de 370 billones exigiría emitir más bonos.
  - Por qué importa: El peso del servicio de la deuda limita el margen fiscal y expone la economía a subidas de tipos; es un factor central del riesgo soberano de Japón y de sus bancos y aseguradoras.
  - Falta en el sistema: lib/services/sovereign-power/profiles/japan.ts solo guarda debtToGdpPercent (260); falta la carga de intereses sobre el presupuesto y las necesidades de emisión extra de bonos.
  - «Still, servicing that debt swallows up about a fifth of» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: debt service, debtToGdpPercent
- **[relacion_bilateral]** Tras decir Takaichi que una guerra por Taiwán sería una amenaza existencial para Japón, China respondió con una campaña diplomática para aislarla; Pekín es el mayor socio comercial de Japón y su máximo diplomático describe la relación en mínimos.
  - Por qué importa: El deterioro Japón-China amenaza el principal vínculo comercial de Japón y a las empresas con exposición a ambos mercados; añade riesgo de represalias económicas.
  - Falta en el sistema: engine/relations/model y lib/data/bilateral-relations/relations.json deberían reflejar el enfriamiento JP-CN de 2026 (disparador: declaraciones sobre Taiwán, ausencia de contacto de alto nivel) como evento reciente.
  - «When Takaichi said that a war over Taiwan would be an existential threat for Japan» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: Taiwan
- **[riesgo]** El yen cotizó por encima de 160 por dólar en julio de 2026, cerca de su mínimo en cuatro décadas, y Japón y el Tesoro de EE. UU. intervinieron de forma coordinada por primera vez en unos 15 años; Bessent dice que no dudará en volver a hacerlo. Japón posee más de un billón de dólares en deuda estadounidense.
  - Por qué importa: Un yen débil encarece importaciones de energía y alimentos, alimenta la inflación y condiciona los márgenes de importadores y exportadores; una intervención conjunta o una venta de Treasuries por Japón tendría efectos globales.
  - Falta en el sistema: El sistema solo tiene el código JPY en el perfil de Japón; falta un módulo de divisas con tipo de cambio, intervenciones y tenencias de deuda extranjera por país.
  - «A coordinated intervention for the first time in about 15 years.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: intervention, yen
- **[riesgo]** Japón depende en gran medida del petróleo de Oriente Medio y la guerra de EE. UU. e Israel con Irán encareció energía y materiales, incluso interrumpiendo el suministro de tinta para envases; el gobierno subvenciona combustible y diversifica proveedores.
  - Por qué importa: La dependencia energética convierte cualquier choque en Ormuz en inflación e inestabilidad de márgenes para la industria japonesa; la diversificación de suministro es una variable de riesgo clave.
  - Falta en el sistema: El perfil de Japón cita la dependencia de crudo por Ormuz pero no el impacto del conflicto de 2026 en precios y cadenas, ni las subvenciones y la diversificación de suministro de petróleo.
  - «Japan was hugely reliant on oil from the Middle East. They were very vulnerable to rising oil prices.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: Ormuz
- **[cifra]** El gasto en defensa de Japón pasó de alrededor del 1% del PIB durante décadas a cerca del 2% desde 2022 y Takaichi quiere superarlo y reformar las directrices de defensa.
  - Por qué importa: Un mayor presupuesto de defensa abre oportunidades para el sector de defensa y la industria pesada japonesa, pero aumenta la presión sobre la deuda.
  - Falta en el sistema: lib/services/sovereign-power/profiles/japan.ts tiene defenseBudgetGdpPercent: 1.6; está desactualizado frente al ~2% actual y no registra la intención de elevarlo ni la revisión de directrices.
  - «Japan has had defense spending of around 1% of GDP for decades. That changed in 2022 under previous Prime Minister Kishida.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓ · a revisar: defenseBudgetGdpPercent
- **[riesgo]** Las muertes superan a los nacimientos en Japón y la población centenaria supera los seis dígitos, mientras Takaichi endurece las reglas de inmigración pese a que el país necesita más trabajadores extranjeros.
  - Por qué importa: Una fuerza laboral en contracción con menos inmigración limita el crecimiento potencial y la capacidad de financiar el envejecimiento; condiciona el crecimiento a largo plazo y el sector de automatización.
  - Falta en el sistema: No hay dataset de demografía por país (envejecimiento, fuerza laboral, políticas migratorias) en lib/data ni lib/macro; falta para Japón y otros países envejecidos.
  - «Japan currently needs more foreign workers, yet Takaichi has tightened immigration rules and promised tougher enforcement.» — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY) · cita ✓
- **[relacion_bilateral]** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses, financiando el propio boom de IA (flujo circular).
  - Por qué importa: Si cae la valoración de la IA, las economías asiáticas exportadoras sufren una doble pérdida: activos en EE. UU. devaluados y menores exportaciones.
  - Falta en el sistema: trade-dag y relaciones bilaterales no modelan flujos financieros de retorno (inversión de cartera) entre exportadores de chips y EE. UU.; falta enlace financiero junto al comercial.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: current account

### GB (8)

- **[empresa]** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios. _Empresas: Rio Tinto (RIO), BHP (BHP), Endolith, Amazon Web Services (AMZN)._
  - Por qué importa: Vincula directamente la demanda de centros de datos de los hiperescalares con la oferta de cobre y con la estrategia tecnológica de las grandes mineras (Rio Tinto, BHP).
  - Falta en el sistema: Rio Tinto y BHP aparecen en metals.ts / natural-resources.json solo como activos; faltan sus programas de biominería (Nuton), contratos de compra de cobre de hiperescalares (AWS) y la relación mineras-centros de datos en corporate-facilities.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓ · a revisar: Rio Tinto
- **[cifra]** El coste de endeudamiento a largo plazo del Reino Unido ha subido al nivel más alto desde 1998 y los inversores exigen una prima creciente frente a EE. UU., Francia, Italia y Alemania.
  - Por qué importa: Un rendimiento de gilts en máximos de 27 años encarece la deuda pública y privada, presiona valoraciones de empresas británicas y limita el margen fiscal del gobierno.
  - Falta en el sistema: lib/macro/static-data.ts solo tiene un rendimiento estático del gilt a 10 años (4,28%); falta la serie histórica, el máximo desde 1998 y la prima/spread frente a Bund, OAT, BTP y Treasury.
  - «The cost of long-term UK government borrowing had been falling. Now it's risen to the highest level since 1998.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: gilt, Reino Unido (Gilt)
- **[cifra]** La deuda pública británica ronda el 94-96% del PIB (44% en 1979) y el pago de intereses cuesta aproximadamente una vez y media el presupuesto de defensa.
  - Por qué importa: Una carga de intereses superior al gasto en defensa deja poco espacio fiscal, eleva el riesgo de subidas de impuestos o recortes y condiciona el riesgo soberano del Reino Unido.
  - Falta en el sistema: Riesgo soberano / macro por país: falta deuda/PIB e intereses/PIB o intereses vs. defensa para GB, y comparación con el gasto militar de lib/services/sovereign-power.
  - «Now national debt is between about 94 and 96%. And debt interest alone is costing roughly one and a half times the entire defense budget.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: deuda
- **[politica]** El primer ministro Andy Burnham plantea romper con cuatro décadas de ortodoxia de libre mercado, incluida la derogación del veto thatcheriano a la propiedad pública de las compañías de agua.
  - Por qué importa: Un giro hacia mayor control público de utilities e industria cambia el riesgo regulatorio y de expropiación para inversores en empresas británicas.
  - Falta en el sistema: Falta un módulo de régimen de política económica por país (agenda del gobierno, giro nacionalizador/liberalizador) para GB; solo hay riesgo soberano base 1-10.
  - «Prime Minister Andy Burnham now argues that Britain must break with four decades of free-market orthodoxy. The repeal of Margaret Thatcher's ideological ban on public ownership of water companies.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: nationalization, privatization
- **[riesgo]** Nacionalizar el agua sería extraordinariamente caro: incluso recibiendo Thames Water gratis, el Estado tendría que financiar con miles de millones de libras la inversión que hoy aportan inversores privados. _Empresas: Thames Water._
  - Por qué importa: Define el riesgo para acreedores y accionistas de las utilities de agua del Reino Unido y la tensión adicional sobre la deuda pública y los costes de endeudamiento.
  - Falta en el sistema: Sin datos de utilities reguladas británicas (agua, energía, redes) ni de riesgo de nacionalización; ninguna empresa británica de agua en lib/data.
  - «Even if it got hold of Thames Water, for example, for free, the government would then have to pony up billions of pounds for the necessary investment» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: utilities
- **[riesgo]** Se baraja la nacionalización de British Steel, en dificultades, y Burnham quiere una estrategia industrial doméstica con reindustrialización, aunque no hay una gran bolsa de dinero disponible. _Empresas: British Steel._
  - Por qué importa: Señala una posible intervención estatal en el sector siderúrgico y una política industrial activa, con implicaciones para proveedores, cadena de suministro y finanzas públicas.
  - Falta en el sistema: Sin cobertura de la siderurgia británica ni de política industrial del Reino Unido en cadenas de valor (trade-dag) o recursos críticos.
  - «There's been potential nationalization of British steel, which is in trouble. Burnham does seem to want to pursue a domestic industrial strategy, and he has talked about re-industrialization.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: steel
- **[oportunidad]** La nacionalización ferroviaria es casi gratuita porque los operadores solo tienen contratos de servicio: al expirar, el Estado asume la operación sin comprar infraestructura.
  - Por qué importa: Indica qué operadores ferroviarios pierden contratos sin compensación relevante y cuál es la parte realmente cara del giro estatalista, útil para valorar exposición sectorial.
  - Falta en el sistema: Sin datos de infraestructura y operadores de transporte ferroviario del Reino Unido ni del calendario de expiración de contratos.
  - «The nationalization of rail is very simple. It's free effectively because there is no infrastructure to buy. All that the rail operators have is a service contract.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: rail, ferroviario
- **[riesgo]** Si los mercados perciben que Burnham se endeuda de forma irresponsable para financiar sus promesas, le cobrarán más por la deuda, lo que limita su margen de maniobra.
  - Por qué importa: El mercado de bonos actúa como límite a la política fiscal: un episodio de estrés en gilts afectaría a la libra, a la banca y a empresas apalancadas del Reino Unido.
  - Falta en el sistema: Falta un indicador de espacio fiscal (headroom) y de sensibilidad del coste de deuda a anuncios de política para GB en lib/macro.
  - «if the bond markets get a sense that he's borrowing money irresponsibly, they will charge him more for that borrowing.» — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk) · cita ✓ · a revisar: gilt

### HK (7)

- **[cifra]** En 2025 MTR obtuvo unos 14.600 millones de HKD de beneficio, tres cuartas partes procedentes de bienes raíces y no de tarifas. _Empresas: MTR Corporation (66)._
  - Por qué importa: Muestra que el valor de MTR depende del negocio inmobiliario y no del transporte, y por tanto del ciclo de propiedad de Hong Kong.
  - Falta en el sistema: bloomberg-originals/videos.json solo guarda una tesis de una frase; faltan beneficio, mezcla de ingresos y datos por empresa listada de Hong Kong.
  - «in 2025, the MTR made roughly 14.6 billion Hong Kong dollars in profit, three-quarters of it from real estate rather than train fares.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[politica]** El gobierno de Hong Kong da a MTR terreno junto a las estaciones con descuento en vez de efectivo, y MTR lo licita a promotores privados (captura de valor del suelo). _Empresas: MTR Corporation (66)._
  - Por qué importa: Es el mecanismo de financiación del ferrocarril; si el suelo rinde menos, la financiación de nuevas líneas se resiente.
  - Falta en el sistema: Falta un dataset de modelos de financiación de infraestructura por país (captura de valor del suelo, concesiones) en lib/data.
  - «Instead of cash, government is giving us land.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[cifra]** MTR paga al gobierno unos 6.000 millones de HKD al año en dividendos y gestiona 16 centros comerciales, torres de oficinas y 1.600 tiendas de estación. _Empresas: MTR Corporation (66)._
  - Por qué importa: Indica la rentabilidad por dividendo y la dependencia fiscal del gobierno respecto a una empresa cotizada con alto peso inmobiliario.
  - Falta en el sistema: No hay dividendos ni activos inmobiliarios de empresas públicas de Hong Kong en lib/data.
  - «the MTR pays roughly six billion Hong Kong dollars a year back to the government in dividends.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[riesgo]** La primera estación del Northern Metropolis (Kwu Tung) cuesta ya un 70% más que lo estimado y no se compensa con derechos de desarrollo tan lucrativos como antes. _Empresas: MTR Corporation (66)._
  - Por qué importa: Sobrecostes sin ingresos inmobiliarios compensatorios erosionan el retorno de MTR y rompen su regla histórica de que el suelo paga el tren.
  - Falta en el sistema: Falta un registro de riesgos de proyectos de infraestructura por país (sobrecostes, deuda) en lib/data.
  - «the first station being built for the Metropolis at Kwu Tung already costs about 70% more than original estimates.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[cifra]** MTR ha pedido prestados unos 140.000 millones de HKD para los proyectos futuros. _Empresas: MTR Corporation (66)._
  - Por qué importa: Apalancamiento elevado en un contexto de menor demanda de propiedad y alquileres a la baja.
  - Falta en el sistema: No existen datos de deuda por empresa listada de Hong Kong; solo hay deuda soberana en lib/macro.
  - «So far we have borrowed about 140 billion Hong Kong dollars for the coming projects.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[oportunidad]** El Northern Metropolis es un plan gubernamental de nuevo polo tecnológico para integrar Hong Kong con China continental, con medio millón de viviendas y siete estaciones nuevas. _Empresas: MTR Corporation (66)._
  - Por qué importa: Política industrial y de vivienda que condiciona constructoras, promotores y MTR, con motivación de integración política con China.
  - Falta en el sistema: Falta un dataset de políticas industriales y megaproyectos por país y su vínculo con relaciones bilaterales (HK-CN).
  - «a massive government plan to build a new tech hub to better integrate Hong Kong with mainland China, including the goal to build half a million new homes.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓
- **[riesgo]** Los residentes de Hong Kong hacen más de 90 millones de viajes al año a Shenzhen, desviando gasto del comercio local, y los alquileres de tiendas MTR se ajustan a la baja.
  - Por qué importa: La fuga de consumo hacia China continental presiona retail y alquileres de Hong Kong, un riesgo para inmobiliarias y comercio minorista.
  - Falta en el sistema: Falta indicador de flujos de consumo y turismo transfronterizo HK-CN en lib/macro o bilateral-relations.
  - «residents now make more than 90 million trips a year to Shenzhen in mainland China, shifting spending across the border and away from local retailers.» — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA) · cita ✓ · a revisar: Shenzhen, cross-border

### MX (5)

- **[cifra]** En Ciudad de México se 'roban' en promedio 11 viviendas al día por despojo (ocupación y escrituras falsificadas).
  - Por qué importa: Mide la inseguridad jurídica de la propiedad residencial, riesgo directo para promotoras, REITs y hipotecarias expuestas a CDMX.
  - Falta en el sistema: Módulo macro/riesgo país (lib/macro, geopolitical-countries) sin indicadores de seguridad de la propiedad ni delitos patrimoniales para MX.
  - «Criminals will stake out a property, monitoring when it will be vacant for an extended period of time.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **[cifra]** Casi 100.000 casos de robo/despojo de propiedad en CDMX y Estado de México en la última década; entre un tercio y la mitad son disputas familiares, el resto invasiones.
  - Por qué importa: Dimensiona el riesgo legal del activo inmobiliario en la mayor área metropolitana de México.
  - Falta en el sistema: Falta serie de delitos patrimoniales por subnacional en lib/macro; los datos oficiales solo existen desde 2015 por cambio metodológico.
  - «Over the past decade, cases of property theft in Mexico City and Mexico State have added up to almost 100,000.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **[riesgo]** Los procesos judiciales tardan de 8 meses a 2 años con documentación en regla, pero más de 5 años en muchos casos, con mezcla de tribunales penales y civiles y apelaciones.
  - Por qué importa: La lentitud judicial inmoviliza el capital y eleva el coste de resolver disputas de propiedad; afecta valoración y financiación de activos.
  - Falta en el sistema: Dataset de eficiencia judicial/ejecución de contratos y derechos de propiedad por país (tipo Doing Business / Rule of Law) ausente en lib/macro.
  - «If everything is in order, it usually takes, in our experience, from eight months to two years. However, that's not the case in many of the cases that we see, and that might take more than five years.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓
- **[riesgo]** Causas estructurales: gentrificación que encarece las propiedades, cultura de no registrar inmuebles o vender sin notario, y corrupción entre funcionarios, notarios y jueces.
  - Por qué importa: Indica que el riesgo es sistémico y no se resolverá solo con más atención política; relevante para tesis inmobiliarias en CDMX.
  - Falta en el sistema: El riesgo soberano de MX no desagrega corrupción institucional ni informalidad de la propiedad (registro/notarios).
  - «public officials, notaries, judges that can all come in together» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓ · a revisar: corrupción
- **[politica]** La jefa de gobierno Clara Brugada ofreció 100 abogados gratuitos a víctimas y hubo detenciones; la presidenta Sheinbaum ha sido preguntada en sus conferencias matutinas.
  - Por qué importa: Respuesta política aún limitada y reactiva; el backlog se espera que siga creciendo, lo que sostiene el riesgo a medio plazo.
  - Falta en el sistema: Seguimiento de medidas de política pública locales/federales sobre seguridad de la propiedad no existe en el sistema.
  - «They have also offered the 100 lawyers to help out pro bono to several victims.» — [Inside Mexico City’s Housing Theft Crisis](https://www.youtube.com/watch?v=1nBjb9VBuvc) · cita ✓

### FR (5)

- **[cifra]** La economía de influencers superó los 33.000 millones de dólares el año pasado y los microinfluencers generan engagement casi triple que los macroinfluencers; L'Oréal trabaja con cerca de medio millón de creadores. _Empresas: L'Oréal (OR)._
  - Por qué importa: Muestra que el marketing de belleza se desplaza hacia creadores y comunidades pequeñas, lo que afecta a los costes de adquisición de clientes y a la ventaja de escala de los grandes grupos como L'Oréal.
  - Falta en el sistema: Bloomberg Originals / datos de empresas: no hay métricas de canal de marketing ni de gasto en creadores por empresa de bienes de consumo.
  - «The influencer economy is booming and surpassed 33 billion dollars last year.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **[cifra]** Hacia 2040 el 43% de la población mundial tendrá pelo rizado o afro y hacia 2050 una de cada seis personas tendrá más de 65 años, lo que L'Oréal usa para orientar innovación (cuidado capilar específico y ciencia de longevidad). _Empresas: L'Oréal (OR)._
  - Por qué importa: Tendencias demográficas de largo plazo que definen la demanda de categorías de belleza (envejecimiento, cuidado del cuero cabelludo) y los mercados de crecimiento del sector.
  - Falta en el sistema: Macro por país / datos demográficos: no hay proyecciones de envejecimiento ni estructura de demanda sectorial ligadas a empresas de consumo.
  - «by 2040, 43% of the world will have curly or coily hair.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **[empresa]** L'Oréal adquirió ModiFace en 2018 y escaló la prueba virtual con realidad aumentada a todas sus marcas, plataformas y minoristas, además de diagnóstico de piel con reconocimiento de imagen entrenado con miles de imágenes anotadas por dermatólogos. _Empresas: L'Oréal (OR), ModiFace._
  - Por qué importa: Indica una ventaja tecnológica propia (AR e IA de diagnóstico) que puede sostener fidelidad de clientes y márgenes frente a competidores.
  - Falta en el sistema: Instalaciones corporativas / cadenas de valor: L'Oréal y el sector cosmético no tienen módulo de activos tecnológicos ni adquisiciones.
  - «back in 2018, we L'Oreal actually acquired a company called Modiface, and Modiface was kind of leading in this beauty augmented reality and virtual try-on technology» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓
- **[riesgo]** Los LLM y chatbots se convierten en la puerta de entrada al descubrimiento de belleza (OpenAI llegaría a 1.000 millones de usuarios en 2026); L'Oréal busca posicionarse en la capa de respuestas con 280.000 profesionales sanitarios y 850 publicaciones como respaldo de autoridad. _Empresas: L'Oréal (OR)._
  - Por qué importa: Riesgo de disrupción del canal de adquisición (de redes sociales y buscadores a asistentes de IA) que puede erosionar la ventaja de marca o reforzarla a quien tenga datos científicos creíbles.
  - Falta en el sistema: Módulo de empresas de consumo: falta análisis de riesgo de disrupción de canal por IA generativa y de activos de credibilidad científica.
  - «if LLMs are becoming the front door to beauty discovery, then what what do we do anyway? Billions of consumers are chatting and asking questions» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓ · a revisar: LLM
- **[politica]** L'Oréal decidió no usar caras, cuerpos, pelo o piel realistas generados por IA para mostrar beneficios del producto en su comunicación externa, y limita la IA a fondos y automatización de producción de contenido. _Empresas: L'Oréal (OR)._
  - Por qué importa: Política de marca que protege la confianza del consumidor y reduce riesgo reputacional y regulatorio por publicidad engañosa, a costa de menos ahorro de costes en producción.
  - Falta en el sistema: Módulo de gobernanza corporativa/ESG: no hay registro de políticas de uso de IA por empresa.
  - «we are not going to use AI-generated, lifelike face, body, hair, or skin to enhance the product benefits in our external communication because real people use a shampoo.» — [How L’Oreal Is Adapting to Meet the New Beauty Era | Quantum Marketing](https://www.youtube.com/watch?v=Gw606P4B5V0) · cita ✓

### AU (2)

- **[empresa]** Rio Tinto respalda Nuton (soluciones microbianas) y AWS ha comprado su cobre para centros de datos en EE. UU.; Endolith (fundada en 2023, algo más de 20 M$ levantados, subvención del DOE) tiene a BHP y Rio Tinto como socios. _Empresas: Rio Tinto (RIO), BHP (BHP), Endolith, Amazon Web Services (AMZN)._
  - Por qué importa: Vincula directamente la demanda de centros de datos de los hiperescalares con la oferta de cobre y con la estrategia tecnológica de las grandes mineras (Rio Tinto, BHP).
  - Falta en el sistema: Rio Tinto y BHP aparecen en metals.ts / natural-resources.json solo como activos; faltan sus programas de biominería (Nuton), contratos de compra de cobre de hiperescalares (AWS) y la relación mineras-centros de datos en corporate-facilities.
  - «Nuton, a venture backed by mining giant, Rio Tinto, is developing their own microbial solutions. Amazon Web Services has bought their copper for US data centres.» — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc) · cita ✓ · a revisar: Rio Tinto
- **[empresa]** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos. _Empresas: INCAT, Candela, Damen._
  - Por qué importa: Identifica a los astilleros posicionados en un nicho de electrificación naval en crecimiento; son los candidatos de inversión o de cadena de suministro de baterías marinas.
  - Falta en el sistema: trade-dag no tiene una cadena de valor de construcción naval ni de propulsión eléctrica marítima; corporate-facilities no incluye astilleros.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### IN (2)

- **[riesgo]** La moratoria de la OMC sobre aranceles a transmisiones electrónicas no se renovó en la última conferencia ministerial, con EE. UU. y la UE enfrentados a Brasil, India y otros países en desarrollo; el comercio digital podría quedar sujeto a impuestos nacionales.
  - Por qué importa: Riesgo regulatorio para plataformas, nube y servicios digitales transfronterizos: posibles aranceles y tasas digitales en grandes mercados emergentes.
  - Falta en el sistema: Relaciones bilaterales y módulo de políticas no recogen disputas de comercio digital ni la moratoria de la OMC sobre transmisiones electrónicas.
  - «A longstanding moratorium on imposing duties on electronic transmissions, a vague definition that could apply to nearly every online transaction that crosses a border wasn't renewed» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓
- **[politica]** China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque cedió algunos beneficios; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician.
  - Por qué importa: Define el campo de negociación de la reforma de la OMC y de las reglas de subsidios, con implicaciones para aranceles, ayudas estatales y litigios comerciales entre las grandes economías.
  - Falta en el sistema: Relaciones bilaterales y perfiles soberanos no registran el estatus en la OMC (país en desarrollo vs. desarrollado) ni posiciones sobre la reforma de reglas de subsidios.
  - «China has since given up some benefits like extended transition periods, but not its developing country status.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: WTO

### NG (2)

- **[cifra]** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano; exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - Por qué importa: Mide el potencial y el retraso de la integración regional africana: oportunidad de manufactura y logística si el AfCFTA avanza, y riesgo por fricciones (visas, divisas, transporte) para empresas con exposición en África.
  - Falta en el sistema: El motor de relaciones registra la membresía del AfCFTA, pero no cifras de comercio intra-regional ni cuota de exportaciones africanas ni barreras comerciales entre vecinos.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: AfCFTA
- **[riesgo]** Una auditoría del programa de subsidio a la gasolina importada en Nigeria halló unos 2.400 millones de dólares en fraude, ejemplo de corrupción fiscal ligada a subsidios energéticos.
  - Por qué importa: Señala riesgo de gobernanza y presión fiscal en un productor de petróleo que importa combustible refinado, relevante para el riesgo soberano y para importadores y marketers.
  - Falta en el sistema: Riesgo soberano base de Nigeria y datos de recursos no incluyen subsidios a combustibles ni episodios de fraude/corrupción cuantificados.
  - «And we found about $2.4 billion worth of fraud.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓

### UY (2)

- **[infraestructura]** El ferri eléctrico Hull 096 de Buquebus cruzará el Río de la Plata entre Uruguay y Argentina con baterías de más de 40 MWh, 2.100 pasajeros y 225 coches, con inversión total de 184 millones de dólares. _Empresas: Buquebus, INCAT._
  - Por qué importa: Es un caso de referencia de financiación mixta (banca privada e IFC) para electrificación marítima en mercados emergentes, y muestra el capex real de un buque eléctrico grande.
  - Falta en el sistema: El sistema no tiene datos de inversión en infraestructura de transporte en Uruguay ni de proyectos financiados por IFC; lib/macro no cubre capex de proyectos de transporte.
  - «Total investment in Hull 096 of $184 million included financing from Banco Santander, Uruguay and the World Bank's International Finance Corporation.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓
- **[politica]** Uruguay invirtió además 20 millones de dólares en mejoras de red y carga para barcos en el puerto de Colonia.
  - Por qué importa: Muestra que la electrificación naval depende de inversión pública en puertos y red eléctrica, un factor de gasto público y de ventaja logística para los países que lo hagan primero.
  - Falta en el sistema: lib/macro incluye congestión portuaria y LPI, pero no la capacidad de carga eléctrica de puertos ni subsidios públicos a transporte marítimo limpio.
  - «Uruguay also invested in a project worth $20 million in order to make grid updates and to add charging for ships in the port of Colonia.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### ZA (1)

- **[cifra]** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano; exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - Por qué importa: Mide el potencial y el retraso de la integración regional africana: oportunidad de manufactura y logística si el AfCFTA avanza, y riesgo por fricciones (visas, divisas, transporte) para empresas con exposición en África.
  - Falta en el sistema: El motor de relaciones registra la membresía del AfCFTA, pero no cifras de comercio intra-regional ni cuota de exportaciones africanas ni barreras comerciales entre vecinos.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: AfCFTA

### EG (1)

- **[cifra]** África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano; exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021).
  - Por qué importa: Mide el potencial y el retraso de la integración regional africana: oportunidad de manufactura y logística si el AfCFTA avanza, y riesgo por fricciones (visas, divisas, transporte) para empresas con exposición en África.
  - Falta en el sistema: El motor de relaciones registra la membresía del AfCFTA, pero no cifras de comercio intra-regional ni cuota de exportaciones africanas ni barreras comerciales entre vecinos.
  - «only about 15% of the continent's formal trade actually takes place from one African country to another.» — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI) · cita ✓ · a revisar: AfCFTA

### IR (1)

- **[riesgo]** La guerra de EE. UU./Israel con Irán está disparando los precios de la energía; el diésel es el combustible más afectado y un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible.
  - Por qué importa: El diésel mueve el transporte y la distribución de bienes; su encarecimiento traslada costes a toda la economía y golpea a logística, retail y consumo.
  - Falta en el sistema: lib/services/maritime-chokepoints y lib/data/natural-resources.json no modelan el impacto del conflicto con Irán sobre el precio del diésel ni su transmisión a costes de transporte en EE. UU.
  - «Before the Iran war, I was at $800- $1,200 a week at fuel. I'm up to about $1,700-$1,800 now a week.» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: diesel, Iran war

### RU (1)

- **[politica]** La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten.
  - Por qué importa: Un posible acuerdo energético EE. UU.-Rusia afectaría a sanciones, flujos de diésel y precios, con implicaciones para refinadores, transporte y relaciones bilaterales.
  - Falta en el sistema: lib/data/bilateral-relations/relations.json no refleja cooperación energética EE. UU.-Rusia sobre diésel ni el vínculo con las políticas de contención de precios.
  - «making a deal with Russia to try to get more supply of diesel on the market» — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s) · cita ✓ · a revisar: sanctions, energy deal

### SE (1)

- **[empresa]** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos. _Empresas: INCAT, Candela, Damen._
  - Por qué importa: Identifica a los astilleros posicionados en un nicho de electrificación naval en crecimiento; son los candidatos de inversión o de cadena de suministro de baterías marinas.
  - Falta en el sistema: trade-dag no tiene una cadena de valor de construcción naval ni de propulsión eléctrica marítima; corporate-facilities no incluye astilleros.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### NL (1)

- **[empresa]** INCAT (astillero australiano de aluminio), Candela (Suecia) y Damen (Países Bajos) lideran la fabricación de ferris eléctricos. _Empresas: INCAT, Candela, Damen._
  - Por qué importa: Identifica a los astilleros posicionados en un nicho de electrificación naval en crecimiento; son los candidatos de inversión o de cadena de suministro de baterías marinas.
  - Falta en el sistema: trade-dag no tiene una cadena de valor de construcción naval ni de propulsión eléctrica marítima; corporate-facilities no incluye astilleros.
  - «There are a couple of manufacturers within the shipping industry that have really taken a lead with the production of electric ferries. Candela in Sweden, also Darman in the Netherlands.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### AR (1)

- **[infraestructura]** El ferri eléctrico Hull 096 de Buquebus cruzará el Río de la Plata entre Uruguay y Argentina con baterías de más de 40 MWh, 2.100 pasajeros y 225 coches, con inversión total de 184 millones de dólares. _Empresas: Buquebus, INCAT._
  - Por qué importa: Es un caso de referencia de financiación mixta (banca privada e IFC) para electrificación marítima en mercados emergentes, y muestra el capex real de un buque eléctrico grande.
  - Falta en el sistema: El sistema no tiene datos de inversión en infraestructura de transporte en Uruguay ni de proyectos financiados por IFC; lib/macro no cubre capex de proyectos de transporte.
  - «Total investment in Hull 096 of $184 million included financing from Banco Santander, Uruguay and the World Bank's International Finance Corporation.» — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ) · cita ✓

### KR (1)

- **[relacion_bilateral]** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses, financiando el propio boom de IA (flujo circular).
  - Por qué importa: Si cae la valoración de la IA, las economías asiáticas exportadoras sufren una doble pérdida: activos en EE. UU. devaluados y menores exportaciones.
  - Falta en el sistema: trade-dag y relaciones bilaterales no modelan flujos financieros de retorno (inversión de cartera) entre exportadores de chips y EE. UU.; falta enlace financiero junto al comercial.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: current account

### TW (1)

- **[relacion_bilateral]** Corea del Sur, Japón y Taiwán, principales productores de chips, GPU y memorias para los centros de datos de IA en EE. UU., reciclan sus superávits comprando acciones y bonos corporativos estadounidenses, financiando el propio boom de IA (flujo circular).
  - Por qué importa: Si cae la valoración de la IA, las economías asiáticas exportadoras sufren una doble pérdida: activos en EE. UU. devaluados y menores exportaciones.
  - Falta en el sistema: trade-dag y relaciones bilaterales no modelan flujos financieros de retorno (inversión de cartera) entre exportadores de chips y EE. UU.; falta enlace financiero junto al comercial.
  - «Some of those savings then find their way back into US equities and corporate bonds, helping finance the very AI boom that created them. That's the circular flow.» — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI) · cita ✓ · a revisar: current account
