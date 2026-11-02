# Ciclo de inversión en IA: capex, compromisos, monetización y escenario de burbuja

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 9 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Seguir el ciclo de inversión en IA y su peso en la economía. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 9 hechos con cita literal verificada; países más citados: US (8), CN (2), KR (1).

## 2. Qué te permite hacer

El usuario ve el capex de hiperescaladores y sus compromisos de infraestructura enlazados con proveedores, el peso de esa inversión en el PIB, precios y monetización de la IA, valoraciones de privadas de IA, el debate borde frente a nube y un escenario de estrés si se corrige la burbuja.

**Por qué importa para invertir:** Buena parte del crecimiento y de las bolsas depende hoy del gasto en IA; saber quién lo recibe y qué pasa si se frena es clave para chips, utilities, constructores y países exportadores.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** centros-datos-ia, motor-causas-pib, lib/data/trade-dag/semiconductors.ts, mercado-bursatil-pais, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Hiperescaladores con capex trimestral y compromisos enlazados a proveedores; países con inversión en IA sobre PIB.
- **Umbral:** ≥5 hiperescaladores y ≥10 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** SEC 10-Q/10-K y earnings calls de hiperescaladores, BEA (inversión en equipos y software), Epoch AI, Artificial Analysis (precios de modelos), PitchBook/Crunchbase (valoraciones).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/ai-cycle/capex-commitments.json {empresa, trimestre, capex, guidance, proyectos[], proveedores[]} + pricing.json (precio por token) + private-valuations.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/ai-cycle/ai-capex-service.ts (enlaza capex con proveedores vía trade-dag/semiconductors.ts y corporate-facilities; escenario de estrés con efecto en cartera y comercio).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/ai-cycle/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Top-bar TechPanel + flujos en sidebar/ValueNetworkSection.tsx.
Hecho cuando: se ve en el panel con datos reales, sin errores de consola, con estados de carga y vacío.

Cada paso, un commit; progreso en `PROGRESO.md`.

## 9. Modelo de IA (Hipótesis)

Planificador Claude Opus, ejecutor Claude Sonnet, verificador: Pruebas vitest con fixtures reales + revisión manual de una muestra de países. Ingesta y normalización de datos tabulares con riesgo de error silencioso moderado; el planificador fija el esquema y el ejecutor lo implementa por pasos con pruebas.

## 10. Criterios de aceptación

- La métrica de éxito se puede calcular con un script sobre los datos guardados.
- Pruebas vitest de servicio y API pasan.
- El panel muestra la fuente y la fecha de cada dato.

## 11. Prohibido

Tocar el score de empresas o la calibración; presentar el dato como recomendación de compra o venta; refactors no relacionados.

## 12. Hechos que la justifican

- (KR, US) Amazon, Google, Meta y Microsoft gastaron 376.000 millones de dólares en capex en 2025 y van camino de 725.000 millones en 2026; los centros de datos demandan chips de memoria que dominan Samsung y SK Hynix. — [Why South Korea’s AI Stock Mania Is a Warning to the World](https://www.youtube.com/watch?v=jJrEnv1IDvg)
- (US) OpenAI se comprometió a pagar a Oracle unos 300.000 millones de dólares por construir una serie de centros de datos (proyecto Stargate), un contrato en la nube de una escala sin precedentes; plazo no indicado. — [How Larry Ellison Built His Empire](https://www.youtube.com/watch?v=GG6ITxfEE6g)
- (US) La industria invierte alrededor de un billón de dólares solo este año en construir centros de datos, y probablemente centenares de miles de millones más en empresas del ecosistema de IA (año exacto no indicado en el hallazgo; causa: carrera por capacidad de IA). — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Según Bloomberg Economics, la inversión relacionada con IA aportó cerca de un punto porcentual al crecimiento del PIB de EE. UU. en 2025, aproximadamente la mitad del crecimiento total. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) Una caída fuerte de las valoraciones de IA podría golpear dos veces a las economías asiáticas: por la desvalorización de sus activos en EE. UU. y por el deterioro de su balanza comercial y economía; magnitud y plazo no indicados (escenario, no dato). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (CN, US) Un mismo sitio web cuesta unos 50 USD con un modelo cerrado estadounidense frente a 12 USD con Kimi K3 chino (una cuarta parte); el nuevo GPT 5.6 Luna de OpenAI lo hace por poco más de 4 USD, igualando a las alternativas chinas baratas. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (CN) China impulsa modelos de pesos abiertos, que aceleran la difusión y cierran la brecha, pero tienen problemas de monetización: guerra de precios durante más de un año y consumidores chinos poco dispuestos a pagar. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (US) OpenAI está valorada en 852.000 millones de dólares tras cerrar una ronda de 122.000 millones para sus chips, centros de datos y talento, y Anthropic negocia captar 30.000 millones a una valoración de 900.000 millones (fechas de las rondas no indicadas). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) Qualcomm defiende que la IA en el dispositivo (edge) ahorra costes frente a la IA en la nube, cuyo coste de tokens y capex de los hiperescalares se traslada al usuario; cifra no indicada. — [Qualcomm Wants to Make the Invisible Visible  | Quantum Marketing](https://www.youtube.com/watch?v=HIqfMDSxrXU)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: SEC 10-Q/10-K y earnings calls de hiperescaladores, BEA (inversión en equipos y software), Epoch AI, Artificial Analysis (precios de modelos), PitchBook/Crunchbase (valoraciones).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
