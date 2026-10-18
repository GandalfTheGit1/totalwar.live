# Modelo de puntuación de relaciones bilaterales (−200 a +200)

> Generado desde `scoring.py`: si cambia el catálogo en el código, este documento se regenera con `python3 -I gen_doc.py`.

## 1. Escala y fórmula

**R = S_estructural + S_dinámica**, cada parte entre −100 y +100, así que **R va de −200 a +200**.

| Parte | Qué mide | Cómo cambia con el tiempo |
|---|---|---|
| **S_estructural** | Lo que está **en vigor** entre los dos Estados: tratados, alianzas, regímenes de sanciones, disputas, nivel de representación, interdependencia y memoria histórica | No decae mientras está en vigor. Al terminar, se desvanece con vida media de 1 año |
| **S_dinámica** | Los **hechos** recientes: visitas, acuerdos firmados, expulsiones, sanciones impuestas, incidentes | Cada hecho decae exponencialmente con una vida media según su tipo |

Las dos partes pasan por una **saturación tanh** (S_estr = 100·tanh(Σ/100), S_din = 100·tanh(Σ/60)): acumular hechos o tratados acerca al límite pero nunca lo supera. Así diez críticas seguidas no valen diez veces una, y una guerra no se compensa con cien llamadas de cortesía.

### Bandas de estado

| R | Estado | Lectura |
|---|---|---|
| -200 a -130 | **Conflicto** | Conflicto armado o ruptura total |
| -130 a -70 | **Hostil** | Medidas punitivas sostenidas, relaciones degradadas |
| -70 a -20 | **Tensa** | Fricción pública, represalias, pero canales abiertos |
| -20 a 30 | **Neutral** | Relación normal sin cercanía ni conflicto |
| 30 a 100 | **Socios** | Cooperación estrecha y diálogo regular |
| 100 a 200 | **Aliados** | Alianza formal o integración profunda con dinámica positiva |

Si el flujo no encuentra al menos 3 hechos de gobierno verificados en 12 meses y 3 fuentes independientes, el estado se muestra como **Mínima / sin datos** aunque R tenga un valor: la cifra no es fiable.

**Tendencia** = R(hoy) − R(hace 30 días), calculando el pasado solo con lo que se sabía entonces. Mejorando si sube 8 puntos o más, empeorando si baja 8 o más, estable en otro caso. Como se compara la puntuación total y no medias de ventanas, una relación mala y estable no aparece como "mejorando" (el fallo de la versión anterior).

## 2. Qué es relevante

Un hecho **suma o resta** solo si cumple todo esto:

1. Lo hace **un Estado de la pareja** (gobierno, ministerio, fuerzas armadas, agencia oficial) o los dos juntos.
2. Va **dirigido al otro** o a un asunto bilateral.
3. Encaja en un **tipo del catálogo** con puntos distintos de cero.
4. Está **verificado** contra su fuente (el verificador lo marca como respaldado o parcial).

**No puntúa (se guarda solo como contexto):** opinión, encuestas, análisis de medios, oposición y exgobernantes, ONG y empresas, sentencias judiciales (independencia judicial), asuntos internos sin acto bilateral (dimisiones, investigaciones internas), actos de terceros países (por ejemplo, aranceles de EE. UU. a España por su postura sobre Israel cuentan para EE. UU.–España, no para España–Israel) y eventos multilaterales sin ángulo bilateral.

## 3. Componente estructural: estados en vigor

Cada estado cuenta mientras está vigente y necesita evidencia (un hecho verificado o una cita de Wikipedia). Cuando termina (se levantan sanciones, regresa el embajador), su efecto se reduce a la mitad cada año.

### Representación

| Código | Estado | Puntos |
|---|---|---|
| `FULL_DIPLOMATIC` | Relaciones diplomáticas con embajadas residentes | **+10** |
| `NONRESIDENT_RELATIONS` | Relaciones diplomáticas sin embajada residente (acreditación múltiple) | **+3** |
| `AMBASSADOR_ABSENT` | Embajador retirado o representación rebajada a encargado de negocios (por cada lado) | **-10** |
| `NO_RELATIONS` | Sin relaciones diplomáticas | **-30** |
| `NON_RECOGNITION` | Uno no reconoce al otro como Estado o gobierno | **-40** |

### Alianzas y tratados

| Código | Estado | Puntos |
|---|---|---|
| `DEFENSE_ALLIANCE` | Alianza o tratado de defensa mutua en vigor (p. ej. OTAN) | **+35** |
| `DEEP_INTEGRATION` | Integración profunda común (UE, mercado único) | **+25** |
| `INTEL_ALLIANCE` | Alianza de inteligencia (p. ej. Five Eyes) | **+10** |
| `STRATEGIC_PARTNERSHIP` | Asociación estratégica formal | **+10** |
| `FRIENDSHIP_TREATY` | Tratado de amistad y cooperación | **+8** |
| `HIGH_LEVEL_MECHANISM` | Mecanismo institucional de cumbres periódicas | **+6** |
| `BILATERAL_TREATIES` | Tratados bilaterales sectoriales en vigor (inversiones, información clasificada, fiscalidad...): +2 por tratado, máximo 3 | **+2** |
| `SHARED_FORUM` | Comparten un foro o club político-económico (BRICS, OCDE, G20, APEC, OPEP, UA, Liga Árabe...) | **+3** |

### Economía

| Código | Estado | Puntos |
|---|---|---|
| `SHARED_LANGUAGE` | Comparten lengua oficial | **+3** |
| `FTA_IN_FORCE` | Tratado de libre comercio en vigor (bilateral o vía bloque) | **+12** |
| `PREFERENTIAL_TRADE` | Acuerdo de asociación o preferencias comerciales | **+6** |
| `TRADE_HIGH` | Interdependencia comercial alta (socio principal de al menos uno) | **+12** |
| `TRADE_MEDIUM` | Interdependencia comercial media | **+6** |
| `HUMAN_TIES` | Diáspora relevante: nacidos en un país que viven en el otro (valor completo con 1 M de personas o el 2 % de la población del destino; proporcional por debajo) | **+5** |

### Disputas y presión

| Código | Estado | Puntos |
|---|---|---|
| `TERRITORIAL_DISPUTE_LOW` | Disputa territorial latente (reclamación sin incidentes) | **-8** |
| `TERRITORIAL_DISPUTE_ACTIVE` | Disputa territorial activa (protestas e incidentes periódicos) | **-18** |
| `TERRITORIAL_DISPUTE_MILITARIZED` | Disputa territorial militarizada (incidentes armados en los últimos 5 años) | **-30** |
| `STRATEGIC_RIVALRY` | Rivalidad estratégica declarada en doctrinas oficiales | **-20** |
| `MEASURES_IN_FORCE` | Medidas coercitivas en vigor impuestas por un Estado al otro y aún no levantadas (aranceles, vetos, controles de exportación, sanciones, cortes de suministro, visados): intensidad completa con 24 puntos de peso acumulado; levantadas, se desvanecen en un año | **-30** |
| `TRADE_WAR` | Guerra económica: aranceles, restricciones o sanciones recíprocas en vigor entre ambos | **-12** |
| `TECH_RESTRICTIONS` | Régimen de controles tecnológicos o de inversión dirigido al otro | **-10** |
| `SANCTIONS_REGIME_TARGETED` | Régimen de sanciones selectivas en vigor | **-12** |
| `SANCTIONS_REGIME_BROAD` | Régimen de sanciones amplias o embargo en vigor | **-30** |
| `ARMS_EMBARGO_IN_FORCE` | Embargo de armas en vigor | **-15** |
| `PROXY_HOSTILITY` | Apoyo a grupos hostiles al otro o designación como Estado patrocinador del terrorismo | **-35** |

### Conflicto

| Código | Estado | Puntos |
|---|---|---|
| `OCCUPATION` | Ocupación de territorio de uno por el otro | **-50** |
| `ARMED_CONFLICT` | Conflicto armado en curso entre ambos | **-80** |

### Historia

| Código | Estado | Puntos |
|---|---|---|
| `HISTORICAL_ALLIANCE` | Alianza histórica (luchar en el mismo bando, garantía histórica) | **+5** |
| `HISTORICAL_WAR` | Guerra entre ambos en los últimos 80 años | **-10** |
| `COLONIAL_LEGACY` | Legado colonial con agravios no resueltos | **-5** |

**Memoria histórica.** Los hechos muy graves o muy positivos (|base| ≥ 30: guerras, enfrentamientos armados, rupturas, normalizaciones) dejan, además de su efecto dinámico, una huella del 30 % de su valor que decae con vida media de 25 años, con un tope de ±15 puntos. Así una guerra de hace 30 años sigue pesando un poco y el establecimiento de relaciones aporta un pequeño saldo positivo de fondo.

### De dónde sale cada estado

Los estados ya **no los propone un LLM**: salen de datos o se derivan por reglas de los hechos verificados. Si una fuente calla, no se puntúa nada (la ausencia de un dato no es prueba de ausencia).

| Estado | Fuente | Regla |
|---|---|---|
| FULL_DIPLOMATIC / NONRESIDENT_RELATIONS | **Wikidata** | Relación diplomática (P530) y embajadas residentes de cada país en el otro. Dos embajadas = lado doble; si Wikidata calla no se puntúa nada. |
| DEFENSE_ALLIANCE, DEEP_INTEGRATION, INTEL_ALLIANCE, FTA_IN_FORCE, PREFERENTIAL_TRADE, SHARED_FORUM | **Wikidata (P463)** | Pertenencia vigente de ambos a la misma organización de una lista cerrada de 23 bloques, cuyos identificadores se verifican por etiqueta y descripción. |
| HUMAN_TIES | **ONU (UN DESA, migrantes por origen y destino 2024) + Banco Mundial (población)** | Nacidos en un país que viven en el otro, en las dos direcciones. Valor completo con ≥ 1,000,000 personas o ≥ 2 % de la población del país de destino; proporcional por debajo; se ignora bajo el 5 %. Cuenta lugar de nacimiento, no nacionalidad. |
| TRADE_HIGH / TRADE_MEDIUM | **Banco Mundial WITS** | Mayor de las cuatro cuotas bilaterales (exportaciones e importaciones de cada país con el otro): ≥ 10 % alta, ≥ 3 % media. |
| TERRITORIAL_DISPUTE_LOW | **Wikidata (P1336)** | Territorios que uno reclama y administra el otro. Sube a ACTIVE o MILITARIZED por reglas sobre hechos recientes (abajo). |
| SANCTIONS_REGIME_* / TECH_RESTRICTIONS / ARMS_EMBARGO_IN_FORCE | **Proyecto (hard-country-data.ts)** | Regímenes por país sancionado, asignados a EE. UU., UE o ONU según el nombre del régimen; solo cuenta si el otro país de la pareja es el que sanciona. |
| STRATEGIC_RIVALRY, DEFENSE_ALLIANCE bilateral | **Proyecto (seed_geopolitical_matrix.ts)** | Tabla de pares especiales: competencia estratégica o adversario sancionado ⇒ rivalidad; "defensa mutua" en la nota ⇒ alianza. |
| BILATERAL_TREATIES | **Wikidata (tratados bilaterales)** | Tratados con como máximo 3 Estados parte entre los dos países, sin fecha de fin, cuyo título indica inversiones, cooperación, defensa, seguridad, información clasificada, fiscalidad, extradición o comercio. Se deduplican por título. Cobertura parcial de Wikidata. |
| SHARED_LANGUAGE | **Wikidata (P37)** | Los dos países tienen al menos una lengua oficial en común. |
| TRADE_WAR | **Proyecto (tabla de pares especiales)** | La nota del par menciona aranceles cruzados o guerra comercial: estado completo. |
| AMBASSADOR_ABSENT (estado de embajada) | **Hechos + Wikidata (P2389, P39) + reverificación** | Estado de cada lado (el jefe de misión de un país en el otro): AUSENTE tras una retirada propia o una expulsión por el otro (embajador, alto comisionado, encargado de negocios), sin límite de tiempo, hasta que lo termina una restauración o normalización ejecutada, un titular que Wikidata registra en el cargo después, o la reverificación web; PRESENTE si hubo restauración o Wikidata tiene un titular seguro en esa fecha (inicio redondeado al final de su periodo; sin fecha de fin vale como máximo 6 años); DESCONOCIDO en otro caso (un hueco en Wikidata no se lee como ausencia). Solo AUSENTE puntúa (−10 por lado). |
| FRIENDSHIP_TREATY | **Derivado de hechos** | Firma verificada y ejecutada de un tratado de amistad o buena vecindad (cualquier antigüedad) sin ruptura de relaciones posterior. |
| ARMS_EMBARGO_IN_FORCE | **Derivado de hechos** | Embargo de armas ejecutado en los últimos 60 meses sin levantamiento posterior. |
| TERRITORIAL_DISPUTE_ACTIVE / MILITARIZED | **Derivado de hechos** | Con reclamación en Wikidata: ≥ 2 incidentes, violaciones de soberanía o posturas hostiles en 24 meses ⇒ activa; choque armado, víctimas o ataque en 60 meses ⇒ militarizada. |
| Sin fuente automática todavía | **—** | COLONIAL_LEGACY, HISTORICAL_ALLIANCE, HISTORICAL_WAR, NO_RELATIONS, NON_RECOGNITION, PROXY_HOSTILITY, OCCUPATION, ARMED_CONFLICT, STRATEGIC_PARTNERSHIP, HIGH_LEVEL_MECHANISM: solo por configuración manual. |
| MEASURES_IN_FORCE | **Derivado de hechos + modelo de emparejamiento** | Cada arancel, veto, control de exportación, sanción, corte de suministro, veto a inversiones o restricción de visados ejecutado por un Estado es una medida en vigor hasta que otro hecho la levanta. Peso 6 por medida (24 las sanciones amplias, 4 los visados); intensidad completa con 24 de peso acumulado (−30 puntos). Levantada, se desvanece con vida media de 1 año. No se añade si el proyecto ya declara una guerra comercial del par. |
| NO_RELATIONS | **Derivado de hechos** | Ruptura de relaciones ejecutada y sin restauración o normalización posterior; sustituye a `FULL_DIPLOMATIC` mientras dura y evita contar además `AMBASSADOR_ABSENT`. |

## 4. Componente dinámico: catálogo de hechos

Puntos base = impacto de un hecho **ejecutado**, hecho por un **jefe de Estado o de Gobierno**, con **fuente sólida**. Los multiplicadores de la sección 5 lo ajustan.

"Vale la mitad" es la vida media. "Irrelevante a los" es cuándo su valor cae por debajo de 0,5 puntos (con multiplicadores máximos) o pasan 6 vidas medias: a partir de ahí sale del cálculo.

### Contacto diplomático

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `STATE_VISIT` | Visita de Estado u oficial de un jefe de Estado o de Gobierno | **+12** | 120 d | 1.5 años |
| `SUMMIT` | Cumbre bilateral / reunión intergubernamental de alto nivel | **+10** | 120 d | 1.4 años |
| `MINISTERIAL_VISIT` | Visita o reunión ministerial bilateral | **+5** | 60 d | 199 d |
| `LEADER_CALL` | Llamada telefónica entre líderes | **+3** | 30 d | 78 d |
| `SIDELINES_MEETING` | Encuentro en los márgenes de una cumbre multilateral | **+2** | 30 d | 60 d |
| `JOINT_DECLARATION` | Declaración conjunta / hoja de ruta bilateral | **+8** | 180 d | 2 años |
| `POSITIVE_STATEMENT` | Declaración oficial de apoyo, elogio o buena voluntad | **+2** | 30 d | 60 d |
| `SYMBOLIC_GESTURE` | Gesto simbólico (aniversario, regalo de Estado, condecoración) | **+2** | 60 d | 120 d |
| `HUMANITARIAN_AID` | Ayuda humanitaria o condolencias oficiales tras una catástrofe | **+3** | 60 d | 155 d |

### Acuerdos

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `DEFENSE_TREATY_SIGNED` | Firma de tratado de defensa o seguridad | **+30** | 1 año | 5.9 años |
| `TRADE_AGREEMENT_SIGNED` | Firma de acuerdo comercial (TLC, CEPA, asociación económica) | **+20** | 1 año | 5.3 años |
| `FRIENDSHIP_TREATY_SIGNED` | Firma de tratado de amistad, cooperación o buena vecindad | **+15** | 2 años | 9.8 años |
| `TRADE_TALKS_CONCLUDED` | Cierre de negociaciones comerciales | **+12** | 180 d | 2.3 años |
| `TRADE_TALKS_LAUNCHED` | Inicio o relanzamiento de negociaciones comerciales | **+6** | 120 d | 1.2 años |
| `NEGOTIATION_ROUND` | Ronda de negociación (sin cierre) | **+2** | 45 d | 90 d |
| `SECTORAL_AGREEMENTS` | Paquete de acuerdos sectoriales o memorandos (energía, educación, justicia...) | **+5** | 180 d | 1.6 años |
| `FINANCING_PACKAGE` | Financiación, crédito o ayuda económica de un gobierno al otro | **+4** | 180 d | 1.5 años |
| `INVESTMENT_DEAL` | Gran inversión respaldada por un gobierno (≥ 1.000 M USD) | **+5** | 180 d | 1.6 años |
| `DEFENSE_DEAL` | Venta de armas, coproducción o ejercicio militar conjunto | **+6** | 1 año | 3.6 años |
| `SECURITY_COOPERATION` | Cooperación policial, judicial o de inteligencia (operación conjunta, extradición) | **+3** | 90 d | 233 d |
| `DE_ESCALATION` | Tregua, rebaja de aranceles o retirada de medidas de presión | **+10** | 180 d | 2.1 años |
| `SANCTIONS_LIFTED` | Levantamiento de sanciones | **+15** | 1 año | 4.9 años |
| `AMBASSADOR_RESTORED` | Regreso o nombramiento de embajador tras una crisis | **+12** | 180 d | 2.3 años |
| `NORMALIZATION` | Normalización: restablecer relaciones, acuerdo de paz | **+40** | 2 años | 12 años |
| `CORE_SUPPORT` | Apoyo a un interés central del otro (reconocer su postura territorial, votar a favor en la ONU) | **+20** | 2 años | 10.6 años |

### Fricción diplomática

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `CRITICISM` | Crítica o condena oficial | **-3** | 30 d | 78 d |
| `HARSH_RHETORIC` | Acusación grave o amenaza verbal de un líder ("genocidio", "chantaje", "pagarán") | **-6** | 45 d | 161 d |
| `PROTEST_SUMMONS` | Protesta formal / convocatoria del embajador o encargado de negocios | **-6** | 60 d | 215 d |
| `VISA_RESTRICTION` | Suspensión o restricción de visados a los nacionales del otro país | **-8** | 120 d | 1.3 años |
| `TALKS_SUSPENDED` | Suspensión, pausa o aplazamiento de negociaciones, misiones comerciales o diálogos bilaterales | **-6** | 90 d | 323 d |
| `DIPLOMATIC_BOYCOTT` | Boicot diplomático (plantón, ausencia deliberada, retirada de un evento) | **-5** | 60 d | 199 d |
| `AMBASSADOR_RECALL` | Llamada a consultas o retirada del embajador | **-15** | 180 d | 2.4 años |
| `EXPULSION` | Expulsión de diplomáticos | **-20** | 240 d | 3.5 años |
| `RELATIONS_DOWNGRADE` | Rebaja formal del nivel de relaciones | **-30** | 1 año | 5.9 años |
| `RELATIONS_SEVERED` | Ruptura de relaciones diplomáticas | **-60** | 2 años | 12 años |
| `CORE_HOSTILE_POSITION` | Postura contra un interés central del otro (reconocer a su rival o su territorio en disputa) | **-15** | 1 año | 4.9 años |
| `HOSTILE_LEGISLATION` | Ley o acto interno dirigido contra un interés del otro | **-8** | 180 d | 2 años |

### Coerción económica

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `TRADE_RESTRICTION` | Aranceles o restricciones comerciales impuestas | **-12** | 180 d | 2.3 años |
| `SANCTIONS_TARGETED` | Sanciones selectivas (personas, empresas, sectores) | **-12** | 240 d | 3 años |
| `SANCTIONS_BROAD` | Sanciones amplias o embargo comercial | **-30** | 1 año | 5.9 años |
| `ARMS_EMBARGO` | Embargo de armas | **-15** | 1 año | 4.9 años |
| `EXPORT_CONTROLS` | Controles de exportación dirigidos al otro (tecnología, materias primas) | **-10** | 240 d | 2.8 años |
| `SUPPLY_CUT` | Corte de suministro (energía, combustible, materias primas) | **-15** | 120 d | 1.6 años |
| `INVESTMENT_BLOCK` | Veto a inversiones o expropiación | **-10** | 240 d | 2.8 años |

### Seguridad

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `ESPIONAGE` | Caso de espionaje atribuido por un gobierno (detenciones, expulsiones) | **-10** | 180 d | 2.1 años |
| `CYBERATTACK` | Ciberataque atribuido oficialmente | **-15** | 240 d | 3.2 años |
| `POLITICAL_DETENTION` | Detención política de un nacional del otro | **-8** | 180 d | 2 años |
| `SOVEREIGNTY_VIOLATION` | Violación de espacio aéreo o aguas territoriales | **-12** | 120 d | 1.5 años |
| `BORDER_INCIDENT` | Incidente fronterizo sin víctimas | **-10** | 120 d | 1.4 años |
| `MIGRATION_WEAPONIZATION` | Uso de flujos migratorios como presión, atribuido por un gobierno | **-25** | 1 año | 5.6 años |
| `MILITARY_PRESSURE` | Despliegue o maniobras militares dirigidas contra el otro (NO incluye reforzar la propia frontera ante flujos migratorios: eso es NONE) | **-8** | 90 d | 360 d |
| `LETHAL_INCIDENT` | Incidente con víctimas mortales entre fuerzas de ambos | **-30** | 2 años | 11.8 años |
| `STATE_ATTACK` | Asesinato o atentado atribuido a un Estado | **-40** | 3 años | 18 años |
| `ARMED_CLASH` | Enfrentamiento armado | **-50** | 3 años | 18 años |
| `WAR` | Invasión o declaración de guerra | **-90** | 5 años | 30 años |

### Sin peso

| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |
|---|---|---|---|---|
| `NONE` | Contexto: asunto interno, decisión judicial, acto de un tercero, evento multilateral sin ángulo bilateral | **+0** | 30 d | — |

### Cómo se asigna el tipo a cada hecho (doble modelo)

1. **Dos clasificadores independientes**, sin verse entre sí, asignan el código del catálogo, el país que actúa, el nivel del actor y si toca un interés central. **A:** Gemini 2.5 Flash. **B:** Groq Qwen3.8-27B, elegido tras la calibración histórica (ver sección 9): es determinista, el más acertado en el nivel del actor (+0,21 sobre Cohere, intervalo del 95 %: +0,08 a +0,33) y el de menor pérdida en las anclas. Reservas en orden: **Cohere command-a-03-2025** y Gemini Flash Lite, que se marca como *independencia degradada* porque comparte familia con A. Cada proveedor espera hasta 100 s a que termine su enfriamiento por minuto (dos veces como máximo) antes de ceder. Nemotron no se usa: es inestable entre corridas (81 %) y tarda más de 570 s. gpt-oss-120b no pudo evaluarse por cuota diaria agotada.
2. **Mismo código:** se acepta. **Códigos distintos pero del mismo signo:** gana el **menos extremo** (menor |puntos|), sin llamar al juez; así un desacuerdo no puede producir por azar la versión más severa (un arancel contado como embargo total).
3. **Signo distinto, o código frente a NONE:** un **tercer modelo** (Gemini 3.5 Flash Lite, o Qwen en Groq si no responde) elige entre el código de A, el de B o NONE.
4. **Verificación de signo:** si el código acordado tiene signo contrario a la polaridad del hecho (extractor + verificador), el tercer modelo decide si el código se mantiene.
5. **Nivel del actor:** si A y B coinciden, ese; si discrepan, el cargo que nombra el texto ("Prime Minister…" ⇒ jefe de Gobierno) y, sin cargo, el más bajo. **Interés central:** solo si los dos lo marcan. **País que actúa:** mayoría entre A, B y el extractor.
6. Si el juez no responde con un código válido, el hecho pasa a NONE y no puntúa.

*Coste de esta prudencia:* cuando los dos modelos difieren, la puntuación se inclina hacia cero. Reduce la variación entre ejecuciones, pero puede infravalorar hechos relevantes.

## 5. Multiplicadores

Valor de un hecho = **base × estado × nivel del actor × calidad de la fuente × interés central × decaimiento**.

| Factor | Valores |
|---|---|
| Estado | Ejecutado ×1,0 · Anunciado, amenaza o promesa de un acto futuro ×0.4 · Las declaraciones (crítica, retórica dura, elogio) siempre ×1,0: hablar ya es el acto |
| Nivel del actor | HEAD ×1.0 · MINISTER ×0.8 · OFFICIAL ×0.6 · INSTITUTION ×0.4 · COURT ×0.0 · NON_GOV ×0.0 |
| Calidad de la fuente | Corroborado por 2+ medios o fuente oficial ×1,0 · Una sola fuente ×0,7 · Parcialmente respaldado ×0,5 · Desmentido por un gobierno ×0,3 |
| Interés central | ×1.5 si toca la soberanía o el territorio del otro, la seguridad de su régimen o un interés que ha declarado central |
| Decaimiento | ×0,5^(edad ÷ vida media) |

## 6. Cómo pierden relevancia los hechos

Cada tipo de hecho tiene su vida media según cuánto tiempo condiciona de verdad la relación: una llamada se olvida en semanas, una expulsión de diplomáticos marca la relación medio año, un enfrentamiento armado durante años.

| Vida media | Queda a 30 d | a 90 d | a 180 d | a 1 año | a 2 años | Ejemplos |
|---|---|---|---|---|---|---|
| 30 d | 50 % | 12 % | 2 % | 0 % | 0 % | llamadas, críticas, encuentros de pasillo |
| 60 d | 71 % | 35 % | 12 % | 1 % | 0 % | reuniones ministeriales, convocatorias de embajador, boicots |
| 120 d | 84 % | 59 % | 35 % | 12 % | 1 % | visitas de Estado, cumbres, incidentes fronterizos, cortes de suministro |
| 180 d | 89 % | 71 % | 50 % | 25 % | 6 % | acuerdos sectoriales, retirada de embajador, aranceles |
| 1 año | 94 % | 84 % | 71 % | 50 % | 25 % | firma de tratados, sanciones amplias, instrumentalización migratoria |
| 2 años | 97 % | 92 % | 84 % | 71 % | 50 % | normalización, ruptura de relaciones, incidentes con muertos |
| 5 años | 99 % | 97 % | 93 % | 87 % | 76 % | guerra |

**Tres reglas temporales:**

1. **Decaimiento continuo.** Un hecho no desaparece de golpe: pierde la mitad de su peso en cada vida media.
2. **Umbral de irrelevancia.** Cuando su valor cae bajo 0.5 puntos, o tras 6 vidas medias, sale del cálculo y pasa al historial.
3. **Lo vigente no decae, lo terminado sí.** Un embargo en vigor resta siempre lo mismo. Cuando se levanta, el hecho "levantamiento" suma y el embargo terminado sigue restando cada vez menos (vida media de 1 año): la desconfianza tarda en irse.

**Consecuencia:** si deja de pasar algo, R vuelve poco a poco a su nivel estructural. Una crisis sin nuevos episodios se va disolviendo; para que la relación empeore de verdad tiene que seguir habiendo hechos negativos.

### Regla de reinicio (primera reunión de líderes tras una ruptura)

Una reunión rutinaria vale +2, pero la **primera reunión de los dos líderes tras una ruptura reciente** informa sobre la relación misma. Si es un contacto ejecutado a nivel de jefe de Estado o de Gobierno (llamada, encuentro en los márgenes, cumbre, visita de Estado o declaración conjunta), ocurre después de una ruptura ejecutada de los últimos 730 días (expulsión, retirada de embajador, rebaja o ruptura de relaciones, sanciones amplias, migración usada como arma) y no hubo otro contacto de ese tipo desde esa ruptura, **cuenta como una cumbre** (+10, vida media 120 días), nunca menos que su valor propio. Es causal (solo mira hechos anteriores) y no cambia ningún otro puntaje. **Limitación:** solo reconoce rupturas diplomáticas, no la coerción económica (ver sección 9).

### Medidas en vigor (hasta que algo las levanta)

Un arancel, un veto o una sanción no es solo una noticia que se olvida: es una **situación** que sigue pesando mientras esté en vigor. Los hechos de este tipo (`TRADE_RESTRICTION`, `EXPORT_CONTROLS`, `SANCTIONS_TARGETED`, `SANCTIONS_BROAD`, `SUPPLY_CUT`, `INVESTMENT_BLOCK`, `VISA_RESTRICTION`), ejecutados y por un actor de gobierno, crean un estado `MEASURES_IN_FORCE` hasta que un acto de levantamiento los termina. El **emparejamiento** (qué hecho levantó qué medida) lo hace un modelo y se valida por código: el levantamiento tiene que ser posterior y de un actor compatible, si no se descarta y la medida sigue en vigor; si el modelo no responde, una heurística léxica empareja por palabras distintivas. Los pesos están fijados a priori, no ajustados.

Los hechos originales siguen contando como eventos que decaen (el impacto de la noticia); el estado recoge el nivel que persiste. Un levantamiento suma además como evento (`DE_ESCALATION`).

### Reverificación de estados antiguos

Un estado derivado de un hecho de hace más de 12 meses (embajador ausente, relaciones cortadas, medida sin levantar) solo vale si la lista de hechos está completa. Antes de contarlo se busca en la web su restauración o levantamiento y un modelo juzga los fragmentos, con **cita literal obligatoria que el código comprueba** dentro del fragmento citado. Resultados: *levantado* (se añade un hecho de restauración marcado como verificado en la web, o se fija la fecha de fin de la medida; si el fragmento no trae fecha se anula el estado sin inventar un evento), *sigue vigente* (hay un fragmento de los últimos 12 meses que lo dice) o *desconocido* (el lado o la medida no verificados cuentan a la mitad y la salida lo avisa en `warnings`). Se verifica cada lado por separado: el lado reciente de un embajador ausente conserva su peso completo.

## 7. Resultados con los 5 pares de prueba

| Par | R (corrida 1) | R (corrida 2) | Estado | Estructural | Dinámica | Tendencia (30 d) | Hace 1 año | Hace 90 d |
|---|---|---|---|---|---|---|---|---|
| ES-MA | **-36** | -42 | Tensa | +9 | -45 | Empeorando (-70) | +40 | +40 |
| ES-IL | **-26** | -26 | Tensa | +3 | -29 | Estable (-7) | +8 | -6 |
| US-CN | **+13** | +13 | Neutral | -12 | +25 | Mejorando (+37) | -14 | -17 |
| IN-CA | **+24** | +24 | Neutral | +19 | +6 | Estable (+2) | +14 | +23 |
| MN-SN | **+0** | +0 | Mínima / sin datos | +0 | +0 | Estable (+0) | +0 | +0 |

### Ejemplo resuelto: España–Marruecos

**Estados en vigor:** `FULL_DIPLOMATIC` +10, `TRADE_HIGH` +12, `HUMAN_TIES` +2, `BILATERAL_TREATIES` +2, `MEASURES_IN_FORCE` -8, `FRIENDSHIP_TREATY` +8, `TERRITORIAL_DISPUTE_ACTIVE` -18 → suma +9 → S_estr +9

| Hecho | Tipo | Edad | Valor hoy |
|---|---|---|---|
| The Spanish monarch visited the enclave of Ceuta amid bilateral friction following a major | `CORE_HOSTILE_POSITION` | 5 d | -10.4 |
| The Spanish King proclaimed high and clear that Ceuta and Melilla are non-negotiable and t | `CORE_HOSTILE_POSITION` | 5 d | -6.2 |
| Morocco reportedly cut its diesel shipments to Spain amid growing bilateral tensions. | `SUPPLY_CUT` | 3 d | -6.2 |
| Spain formally endorsed Morocco's autonomy plan for Western Sahara in a letter from Prime  | `CORE_SUPPORT` | 1675 d | +6.1 |
| Spanish Prime Minister Pedro Sánchez stated that Moroccan navy vessels entered Spanish ter | `SOVEREIGNTY_VIOLATION` | 6 d | -4.9 |
| King Mohammed VI denounced the instrumentalization of the Ceuta crisis in Spain and stated | `HARSH_RHETORIC` | 9 d | -3.7 |
| Moroccan King Mohammed VI stated that the migration cooperation model with Spain has hit i | `CRITICISM` | 9 d | -2.4 |
| Spain moved closer to granting citizenship to Western Saharans with a new Sahrawi citizens | `CORE_HOSTILE_POSITION` | 37 d | -2.3 |

Suma dinámica -29.0 → S_din -44.9. **R = +8.8 -44.9 = -36.1** (Tensa).

## 8. Limitaciones conocidas

- **Los estados de datos son prudentes: lo que ninguna fuente recoge, no puntúa.** No hay fuente para mecanismos de cumbres periódicas ni para alianzas o guerras históricas.
- **Lazos humanos (ONU, 2024) cuentan lugar de nacimiento, no nacionalidad**, y no recogen a los hijos de migrantes nacidos en el país de destino: España aparece con 455.890 nacidos en Marruecos, frente a 1,17 millones de marroquíes (nacionalidad) del INE. Subestima las diásporas de segunda generación. No hay API: el fichero Excel se descargó una vez (6,0 MB) y se lee como dato.
- **Los tratados de Wikidata tienen cobertura parcial** (para España–Marruecos solo aparece un tratado de inversiones; para EE. UU.–China y India–Canadá, ninguno). El tratado de amistad de 1991 entra por el flujo de hechos, no por Wikidata.
- **El nivel de R depende del modelo B.** Con Groq como B, España–Marruecos salía unos 8 puntos menos negativa (−27) que con Cohere (−35), porque Groq elegía códigos más suaves (por ejemplo, "crítica" donde A y Cohere ven "violación de soberanía") y la regla de desacuerdo se quedaba con el más suave. La variación entre dos corridas seguidas es ≤ 2,6 puntos, pero entre tandas con B distinto llegó a 8. No hay forma objetiva de decir cuál es el correcto.
- **El día pasa factura a las cuotas:** las cuatro claves de Groq gpt-oss-120b quedaron aparcadas por cuota diaria tras las pruebas, así que la espera con reintento nunca se activó en datos reales (solo está probada con un proveedor simulado).
- **La verificación de signo contra la polaridad se activó una vez con datos reales** y acertó: la visita del rey a Ceuta, con polaridad +1 del extractor, se mantuvo como postura hostil hacia el interés central de Marruecos. Delata además que la polaridad del extractor es ruidosa.
- **La cifra solo es tan completa como la lista de hechos** del flujo de extracción; esta evaluación reutiliza los hechos verificados de v6 para aislar el efecto de los nuevos estados y del doble clasificador.
- Los puntos y las vidas medias son una primera calibración razonada, no ajustada con datos históricos.
- **La reverificación es conservadora:** confirma las restauraciones y levantamientos documentados (4 de 4 en los controles reales, aunque en uno de ellos —España–Marruecos— se mejoraron las consultas viéndolo, así que 3 son independientes; ningún falso «levantado» y un expediente inventado resuelto como desconocido), pero **no consigue confirmar que algo sigue vigente** (fallo con el embargo a Cuba, y con el lado israelí de España–Israel), y en ese caso resta la mitad del peso: sesgo hacia infravalorar situaciones reales.
- **Los clasificadores casi nunca devuelven NONE**: en el episodio reservado recuperaron 0 de 2 hechos sin efecto en bruto (y 0 a 1 de 2 tras la reconciliación), igual que en los episodios de calibración (0,29 a 0,86).
- La puntuación es simétrica: `byActor` indica quién empuja, pero no hay puntuación por dirección.
- **Estado de embajada sin límite de tiempo (ronda 5):** una ausencia dura hasta que algo la termina. Si la lista de hechos no recoge el regreso y la reverificación tampoco lo confirma, el lado se queda ausente a medio peso: hoy pasa con Marruecos en España–Marruecos (la embajadora volvió en marzo de 2022; −5 en lugar de 0). Wikidata no ayuda en ese caso porque registra un mandato continuo desde 2018.
- **Wikidata para fechas pasadas tiene algo de retrospectiva** (los mandatos se registran después) y la mayoría de fechas de inicio solo tienen año, así que una restauración se reconoce el 31 de diciembre de ese año. Un mandato sin fecha de fin puede estar desfasado (el de Lee Su-hoon en Japón sigue abierto desde 2017); por eso vale como máximo 6 años.

## 9. Calibración y validación histórica (18-10-2026)

Informe completo, con anclas y etiquetas congeladas con hash: `calibracion.md`.

**Metodología:** anclas ordinales fijadas antes de puntuar (hechos y fechas documentados; magnitudes esperadas, criterio mío), etiquetas manuales congeladas antes de clasificar, parámetros calibrados con etiquetas manuales y modelos evaluados después. Los episodios que inspiran un cambio ya no pueden validarlo: el código se congeló por hash antes de leer cada episodio reservado.

| Episodio | Papel | Anclas cumplidas con etiquetas manuales | Pipeline realista (Qwen / Cohere) |
|---|---|---|---|
| España–Marruecos 2020–23, India–Canadá 2023–26 | calibración | 28 de 28 | 0,0 de pérdida con Qwen; 0,9 con Cohere |
| Australia–China 2020–24 | **desarrollo** de las medidas en vigor | 9 de 14 antes, 9 de 14 después (pérdida 119,5 → 61,8) | — |
| Arabia Saudí–Catar 2017–22 | reservado 1: **no ejercitó las medidas** (la extracción fundió bloqueo y ruptura en un solo hecho) | 14 de 14 (el modelo anterior también) | 12 y 14 de 14 (antes 10 y 10) |
| Japón–Corea del Sur 2019–23 | reservado 2: las medidas sí se ejercitan | **11 de 13** (antes 8 de 13) | 1–2 y 1–4 violaciones (antes 5–6 y 7) |

- **Parámetros: sin cambios.** Los valores por defecto cumplen las anclas de los dos episodios de calibración y quedan dentro de la región factible (87 de 270 combinaciones). Las anclas no identifican el peso de lo anunciado ni un tope de vidas medias.
- **Las medidas en vigor ayudan fuera de muestra donde actúan** (Japón–Corea del Sur) y no empeoran donde no actúan (Catar, calibración). Lo que no corrigen: una ancla de criterio (la recuperación espontánea tras el mínimo sigue siendo demasiado rápida porque los eventos decaen mientras el estado solo resta hasta −30) y una tendencia que el modelo lee «mejorando» tras un gesto positivo documentado.
- **Catálogo corregido en la ronda anterior** (`VISA_RESTRICTION`, `TALKS_SUSPENDED`, regla de reinicio, expulsión de alto comisionado). La mejora de esa ronda es dentro de la muestra.
- **Modelo B:** el acierto de código no distingue a los candidatos; Qwen supera a Cohere en nivel del actor dentro de la muestra (+0,17 a +0,21, significativo) y fuera de muestra la ventaja es +0,15 con intervalo [0,00, +0,30]. Se mantiene Qwen → Cohere → Gemini Flash Lite con confianza moderada.
| Canadá–Arabia Saudí 2018–23 | reservado 3 (ronda 4): expulsión de embajador y bloqueo de comercio durante 4,7 años | 9 de 13 (pérdida 76,2) | pérdida media 78,0 / 80,4 |
- **Magnitud de las medidas (ronda 4): sin cambios.** Con Australia–China y Japón–Corea como desarrollo, subir el máximo de −30 mejora solo el primero y empeora el pipeline realista del segundo; retener el evento de la medida mientras está en vigor (H2) mejora con etiquetas manuales pero empeora el pipeline realista de Japón–Corea y no se confirma en el episodio reservado (Canadá–Arabia Saudí: −27 % con etiquetas, −1 % y +6 % realista). Causa identificada fuera de la magnitud: el corte duro de 36 meses de `AMBASSADOR_ABSENT` y la caída de los eventos; queda como seguimiento con su propio episodio reservado.
| Israel–Turquía 2018–24 | reservado 4 (ronda 5): embajador israelí ausente 51 meses, retirada de 2023 y ruptura de 2024 | 11 de 14 (pérdida 29,4; el estado anterior, 39,2) | pérdida media 64,8 / 44,1 (antes 74,6 / 53,8) |
- **Estado de embajada (ronda 5): adoptado.** Tres valores por lado (presente / ausente / desconocido) con hechos, titulares de Wikidata y reverificación, sin el corte de 36 meses. En desarrollo baja Canadá–Arabia Saudí (76,2 → 47,3 con etiquetas manuales; 78,0 → 23,7 y 80,4 → 31,0 realista) sin mover los otros cinco episodios; en el reservado Israel–Turquía baja 39,2 → 29,4 con etiquetas manuales y 74,6 → 64,8 / 53,8 → 44,1 realista. Fallan los mismos tres niveles de 2018–2021 en ambos modelos: R no baja lo bastante durante la congelación.
- **Límite:** anclas y etiquetas son criterio mío sobre hechos documentados; no son una verdad independiente.
