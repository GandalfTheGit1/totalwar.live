# Concentración de oferta, exposición importadora y precios de materias primas

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 5 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Medir la concentración de oferta y la exposición importadora de cada materia prima. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 5 hechos con cita literal verificada; países más citados: US (1), QA (1), AU (1), RU (1), DE (1), CN (1).

## 2. Qué te permite hacer

Por materia prima el usuario ve qué países concentran producción y exportación, qué importadores dependen de cada proveedor, la serie de precios con tendencia y la proyección de demanda a 2050; los escenarios de precio se calibran con Brier.

**Por qué importa para invertir:** La concentración convierte a un país en palanca de precios; cruzarla con precios y demanda futura indica qué productores e importadores ganan o pierden margen.

## 3. Mapa de alineación

- **Depende de:** calibracion-brier.
- **Conecta con:** registro-minas-minerales-criticos, lib/services/geopolitical/supply-chain-evaluator, calibración Brier (sistema equity), score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Materias primas con índice de concentración (HHI), top importadores y serie mensual de precio.
- **Umbral:** ≥30 materias primas (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** World Bank Pink Sheet, LME, FRED, UN Comtrade/BACI, USGS, IEA Critical Minerals Outlook (demanda 2050).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Ampliar lib/data/natural-resources.json (cuota_exportacion, importaciones_por_proveedor) + nuevo lib/data/critical-commodities/prices.json (series mensuales) y demand-outlook.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/country-resources/commodity-exposure-service.ts (HHI de oferta, exposición del importador, escenarios).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/resources/prices/route.ts + ampliar app/api/resources.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Top-bar ResourcesPanel (precios y concentración) + sección CountryResources (exposición del país) + capa 'resources' del mapa.
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

- (US, QA, AU, RU) El mercado de GNL está concentrado: EE. UU., Qatar, Australia y Rusia suman el 70% de la oferta global; EE. UU. es ya el mayor exportador, con Qatar casi igualado y con instalaciones dañadas en el conflicto que planea ampliar; plazo no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (DE, CN) Las fábricas alemanas dependen de tierras raras y minerales críticos chinos; China ejerce palanca retrasando los suministros más que cortándolos, lo que impide planificar a las empresas; cifras y plazo no indicados. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (—) El precio del cobre se ha más que duplicado en los últimos 10 años por la demanda de electrificación (coches eléctricos, turbinas eólicas). — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)
- (IR, SA, AE) El precio del crudo superó los 126 dólares por barril durante el conflicto de Ormuz, muy por debajo de los 150-200 dólares que pronosticaban muchos bancos, porque inventarios, liberación de reservas, desvío por oleoducto y menor demanda china absorbieron el choque. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (—) La demanda mundial de electricidad se duplicaría hacia 2050 y, sin cobre, no habría redes, renovables, vehículos eléctricos ni centros de datos; causa: electrificación y crecimiento de centros de datos. — [Why Copper Miners Are Turning to Microbes | Bloomberg Primer](https://www.youtube.com/watch?v=5VV11Zx_fzc)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: World Bank Pink Sheet, LME, FRED, UN Comtrade/BACI, USGS, IEA Critical Minerals Outlook (demanda 2050).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
