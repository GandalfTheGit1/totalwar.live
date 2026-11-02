# Registro de aranceles, sanciones y controles de exportación por país y producto

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 6 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Registrar cada arancel, sanción y control vigente con su base legal. Eje: fiabilidad.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 6 hechos con cita literal verificada; países más citados: US (5), CN (2), CU (1), IN (1), RU (1), KP (1).

## 2. Qué te permite hacer

El usuario ve cada medida vigente (arancel, sanción, control tecnológico, waiver) con tipo, base legal, productos afectados y fecha, más el seguimiento de su efectividad: ingresos externos del régimen sancionado y desvíos o contrabando.

**Por qué importa para invertir:** Una medida comercial cambia de golpe el mercado accesible y el coste de los insumos de una empresa; saber qué está vigente y qué productos toca es imprescindible para estimar el impacto.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** engine/relations/model/scoring.py, lib/data/trade-dag, comercio-bilateral-producto, linea-temporal-relaciones, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Medidas vigentes registradas con tipo, base legal, fecha y fuente enlazada.
- **Umbral:** 100 % de las medidas mostradas con fuente; ≥500 medidas (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** Global Trade Alert, WTO Tariff Download Facility, OFAC SDN / EU Sanctions Map / UK OFSI, BIS Entity List, OpenSanctions, CREA (ingresos de exportación rusos).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Ampliar engine/relations/model/measures.py de sanciones genéricas a registro tipado {emisor, objetivo, tipo, base_legal, hs[], fecha_inicio, fecha_fin, waivers[]}, exportado a lib/data/bilateral-relations/measures.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/bilateral-relations/measures-service.ts (cruce con trade-dag para productos y empresas afectadas).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Ampliar app/api/relations/[code] con measures[].
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Bloque de medidas en sidebar/BilateralRelationsSection.tsx + arcos de sanción en map2d/render-arcs.ts + top-bar TensionPanel.
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

- (US, CN) Trump firmó una orden para imponer un arancel global del 10 % bajo la Sección 122, sobre los aranceles normales ya vigentes (fecha exacta no indicada; causa no indicada en el hallazgo). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (CU, US) Katapulk, marketplace online de la diáspora cubana, ofrece más de 33.000 productos y procesa entre 1.500 y 2.000 pedidos diarios, amparada en una excepción de los controles de exportación del Departamento de Comercio de EE. UU.; fecha de la excepción no indicada. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (IN, US, RU) EE. UU. bajo Trump usó aranceles adicionales y presión pública contra las compras indias de crudo ruso; tras la guerra EE. UU.-Israel con Irán, Washington suavizó el tono y emitió exenciones (waivers) para comprar petróleo ruso, que India aprovecha; cifra de aranceles y fecha de las exenciones no indicadas. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (US) El Tribunal Supremo de EE. UU. anuló los aranceles globales basados en la ley IEEPA, que sustentaban entre el 60 y el 75% de la política arancelaria actual de EE. UU.; fecha del fallo y base legal sustitutiva no indicadas. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (US, CN) EE. UU. discute en 2026 prohibir empresas y modelos de código abierto chinos y acusa a China de obtener chips por puertas traseras y copiar modelos, mientras los controles de exportación de chips y equipos han frenado la IA china; cifra y plazo exactos no indicados. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (KP) Entre 2022 y 2025 Corea del Norte ingresó hasta 22.000 millones de dólares en divisas, casi cuatro veces más que el cuatrienio anterior, pese a las sanciones (análisis de Bloomberg Economics; causa detallada en otros hallazgos del video: armas, cripto y comercio con China). — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: Global Trade Alert, WTO Tariff Download Facility, OFAC SDN / EU Sanctions Map / UK OFSI, BIS Entity List, OpenSanctions, CREA (ingresos de exportación rusos).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
