# Registro global de minas y proyectos de minerales críticos

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 10 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Tener un registro trazable de minas y proyectos de minerales críticos. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 10 hechos con cita literal verificada; países más citados: US (7), CN (1), PK (1).

## 2. Qué te permite hacer

El usuario ve cada mina o proyecto de minerales críticos con país, operador, etapa, ley del mineral, tecnología de extracción, participación estatal, acuerdos bilaterales y la brecha entre extracción y procesamiento de la cadena completa.

**Por qué importa para invertir:** Quién controla la mina y el refino decide la seguridad de suministro de baterías, chips y defensa; permite ver qué proyectos son viables y qué gobiernos pueden intervenir en ellos.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/data/trade-dag/ev-battery.ts, concentracion-precios-materias-primas, engine/relations/model/measures.py (acuerdos y restricciones de exportación), licencia-social-permisos, conflicto-armado-control-territorial.
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Minas o proyectos de minerales críticos con país, operador, etapa y fuente.
- **Umbral:** ≥300 proyectos de los 10 minerales más críticos (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** USGS Mineral Commodity Summaries, S&P Capital IQ Pro Metals & Mining (si licencia), Benchmark Mineral Intelligence, informes NI 43-101/JORC de las mineras, IEA Critical Minerals Data Explorer.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/critical-commodities/mines.ts: {mina, country, coords, mineral, operador, etapa, ley, tecnologia, participacion_estatal, offtake, acuerdos_bilaterales[]}; registrar en critical-commodities-registry.ts.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/country-resources/mine-registry-service.ts (brecha extracción/refino por país usando trade-dag/ev-battery.ts).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Ampliar app/api/resources con ?country=&mineral=&level=mine.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Minas como puntos en la capa 'resources' del mapa + sección CountryResources del panel lateral + top-bar ResourcesPanel.
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

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: USGS Mineral Commodity Summaries, S&P Capital IQ Pro Metals & Mining (si licencia), Benchmark Mineral Intelligence, informes NI 43-101/JORC de las mineras, IEA Critical Minerals Data Explorer.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
