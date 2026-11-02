# Motor de causas de variación del PIB con calidad de dato

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 6 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Explicar por qué sube o baja el PIB de un país, con datos y no solo narrativa. Eje: calidad.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 6 hechos con cita literal verificada; países más citados: US (2), GB (1), IE (1), DE (1), IN (1), KP (1).

## 2. Qué te permite hacer

El usuario ve por qué creció o cayó el PIB (descomposición por componentes y sectores), la brecha frente a un contrafactual de países pares, el crecimiento necesario frente al real, indicadores adelantados de recesión y una marca de calidad de cada dato (oficial o estimado).

**Por qué importa para invertir:** Separa crecimiento sano de crecimiento frágil o mal medido, lo que cambia la lectura de la demanda futura para las empresas del país.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** estructura-productiva-clusteres, ciclo-inversion-ia (contribución al PIB), transmision-shocks-energia-inflacion, PmiActivitySection.
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Variaciones trimestrales del PIB de los 15 países FRED con descomposición por componentes y causa verificada en una muestra manual.
- **Umbral:** ≥80 % de las explicaciones de la muestra correctas (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** World Bank WDI, IMF WEO, OECD Quarterly National Accounts, FRED, Conference Board LEI, VIIRS luces nocturnas.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. lib/macro/world-bank-client.ts, fred/ y static-data.ts (campo calidad: oficial/estimado/fuente alternativa como luces nocturnas).
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/geopolitical/gdp-driver-engine.ts (descomposición, control sintético con pares, indicadores adelantados) usando lib/macro/temporal-align.ts.
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Promover app/api/dev/geo-macro-analysis y ampliar app/api/macro/[country] con bloque gdp_drivers.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. CausalAnalysisSection (explicación con LLM sobre la descomposición) + DalioMacroSection + aviso de calidad en SovereignMetricsSection.
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

- (GB, IE, US) El modelo de Bloomberg (23 países de la OCDE como contrafactual) estima un golpe inicial del 10% al PIB británico (300.000 millones de libras) por el Brexit, que tras excluir a Irlanda y ajustar por EE. UU. (shock energético, estímulo fiscal, IA) baja a entre el 2% y el 4% del PIB; plazo de medición no indicado. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (DE) El PIB alemán de los últimos 20 años está entre un 6 y un 7 % por debajo de un control sintético de países pares (Corea, Japón, Finlandia, Canadá, Suecia), lo que indica una pérdida duradera de potencial y no solo un ciclo; causa no indicada en la cita. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (IN) Para ser economía desarrollada en 2047, India necesita crecer de forma sostenida entre 8% y 9% durante 25 años, creando suficiente empleo y subiendo ingresos para seguir siendo gran centro de demanda mundial. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (KP, KR) El PIB de Corea del Norte según el Banco de Corea es de unos 30.000 millones de dólares, 60 veces menor que el de Corea del Sur (unos 1,9 billones); año de la estimación y causa de la brecha no indicados. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (CU) La inflación oficial de Cuba tocó un pico de alrededor del 71% durante la pandemia y fue del 14% en 2025; los economistas estiman que la real está cerca de niveles pandémicos, y la causa de la diferencia es la fiabilidad de las cifras oficiales. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (US) Los salarios ajustados por inflación vuelven a caer en los últimos meses y la duración del desempleo ronda los seis meses, algo que históricamente coincide con recesión. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: World Bank WDI, IMF WEO, OECD Quarterly National Accounts, FRED, Conference Board LEI, VIIRS luces nocturnas.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
