# Línea temporal y calibración de relaciones bilaterales

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 6 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Que cada puntuación bilateral sea trazable a eventos fechados. Eje: fiabilidad.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 6 hechos con cita literal verificada; países más citados: US (3), PK (2), IN (2), CN (1), AF (1), GB (1).

## 2. Qué te permite hacer

Al abrir una relación el usuario ve los eventos fechados (cumbres, treguas, controles, combates), la afinidad en votaciones de la ONU, la opinión pública en ambos países y cuánto depende la relación de un líder, sobre la serie del score.

**Por qué importa para invertir:** Explica por qué la relación está donde está y lo frágil que es, para juzgar si la exposición de una empresa a ese par de países es estable.

## 3. Mapa de alineación

- **Depende de:** calibracion-relaciones-gdelt.
- **Conecta con:** aranceles-sanciones-controles, comercio-bilateral-producto, GDELT (calibración), eventos-reaccion-mercado.
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Pares de países con línea temporal de ≥5 eventos fechados y con fuente.
- **Umbral:** ≥200 pares, empezando por los 45 países curados (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** GDELT, UN General Assembly Voting Data (Voeten), Pew Global Attitudes, ACLED, Wikidata.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Ampliar engine/relations/model/reviewed_facts.json y exportar lib/data/bilateral-relations/events-timeline.json {pair, fecha, tipo, descripcion, fuente}; añadir afinidad ONU y opinión pública a relations.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Ampliar engine/relations/model/scoring.py (afinidad ONU, volatilidad ligada a líder) + lib/services/bilateral-relations (timeline).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Ampliar app/api/relations/[code] con ?partner=&timeline=1.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Línea temporal en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel.
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

- (US, CN) Según Schwarzman, EE. UU. y China suman aproximadamente el 42 % de la economía mundial y buscan normalizar su relación tras reuniones recientes Xi-Trump en Pekín, aunque la tensión sobre tierras raras y comercio continúa (fechas no indicadas). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (PK, AF) Pakistán mantiene desde principios de año (2026) un conflicto con Afganistán en el que ambos países se atacan mutuamente en la frontera (cifras de víctimas y causa no indicadas). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (GB) El 52% de los británicos apoyaría reincorporarse a la UE según una encuesta reciente; Sunak y Starmer han buscado acercarse a la UE en defensa, seguridad, inmigración y economía, y un analista prevé una asociación tipo membresía asociada; fecha de la encuesta no indicada. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (PK, US, IN) El acercamiento de Pakistán a Trump es frágil y personalista: el caso de India, que pasó de aliado a ser castigado, muestra que puede revertirse rápido (cifras y plazo no indicados). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (IN, US) Una encuesta de Pew indica que el 36% de los indios ve a Rusia como su principal aliado frente al 16% que señala a EE. UU., tras el deterioro de la imagen de EE. UU. por aranceles y la disputa sobre el alto el fuego con Pakistán; fecha de la encuesta no indicada. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (—) Los países que votan igual en la ONU invierten más entre sí, mientras los que votan en direcciones opuestas reducen la inversión mutua; la geopolítica condiciona así los flujos de capital (cifra y plazo no indicados). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: GDELT, UN General Assembly Voting Data (Voeten), Pew Global Attitudes, ACLED, Wikidata.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
