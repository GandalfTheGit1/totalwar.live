# Matriz de comercio bilateral por producto, centralidad y fragmentación

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 8 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Que cada relación bilateral muestre su peso comercial real por producto. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 8 hechos con cita literal verificada; países más citados: CN (4), IN (2), US (2), DE (1), KP (1), RU (1).

## 2. Qué te permite hacer

Al abrir un par de países el usuario ve comercio por producto y balanza, cuota de cada socio en exportaciones e importaciones, comercio de servicios y digital, integración del bloque regional, centralidad o aislamiento comercial del país y su estatus en la OMC.

**Por qué importa para invertir:** Mide cuánto depende un país de otro y en qué productos, que es lo que determina quién sufre ante aranceles, sanciones o rupturas diplomáticas.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** engine/relations/model/flow.py, engine/relations/model/bloc_memberships.json, lib/services/geopolitical/tier-n-evaluator, lib/services/geographic/friendshoring-service, aranceles-sanciones-controles.
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Pares de países con comercio por producto (HS-2) y cuota por socio, año ≤3 años.
- **Umbral:** ≥90 % de los pares con relación puntuada en relations.json (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** CEPII BACI, UN Comtrade, OECD-WTO TiSMoS / BaTIS (servicios), WTO (estatus y disputas), IMF DOTS.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/trade/bilateral-trade.json (BACI HS6 agregado: {exporter, importer, hs, valor, año}) + services-trade.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/trade/bilateral-trade-service.ts (cuotas, balanza, centralidad de red, integración por bloque con bloc_memberships.json).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/trade/[code]/route.ts (?partner=).
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Pestaña Comercio en sidebar/BilateralRelationsSection.tsx + top-bar RelationsPanel + grosor de arcos comerciales en map2d/render-arcs.ts.
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

- (DE, CN) El comercio Alemania-China pasó de superávit a déficit creciente: en 2025 las exportaciones alemanas de maquinaria y bienes industriales a China cayeron cerca del 10 % y las de coches más del 30 %, mientras suben las importaciones chinas (China Shock 2.0); causa no desglosada más allá de la competencia china. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (KP, CN) China concentra el 98 % del comercio de Corea del Norte y es su principal destino de exportación, fuente de importaciones y proveedor de energía; plazo no indicado y causa: aislamiento del régimen por las sanciones. — [Why Sanctions Aren't Stopping North Korea](https://www.youtube.com/watch?v=v30SRprmmLE)
- (IN, US, RU, CN) EE. UU. es el mayor mercado de exportación de India, lo que limita su margen para alienarse con Rusia; además la creciente dependencia de Rusia respecto a China incomoda a India (triángulo Rusia-India-China); cifra de exportaciones y plazo no indicados. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (GB) El mundo se divide en grandes bloques comerciales (UE, EE. UU., Asia) y Reino Unido queda aislado, con menos peso como puerta de acceso a Europa para EE. UU. y menos relevancia en la ONU; cifras y fechas no indicadas. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (ZA, NG, EG) África aporta solo ~3% de las exportaciones mundiales y apenas ~15% de su comercio formal es intra-africano, porque exporta materias primas y reimporta manufacturas, pese al área de libre comercio continental (AfCFTA, 54 países, lanzada en 2021). — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (—) El comercio digitalmente entregado (cine, música, educación, salud) crece alrededor de un 6% anual y ronda los 4 billones de dólares dentro de un comercio mundial de unos 33 billones; periodo de medición no indicado, causa no indicada. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (—) Cerca del 25% del comercio mundial ya no se rige por las reglas de la OMC y alrededor de tres cuartas partes sí; fecha y causa de la fragmentación no indicadas. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (CN, IN, BR, US) China entró a la OMC en 2001 como país en desarrollo y conserva ese estatus, aunque ha cedido beneficios como periodos de transición ampliados; EE. UU. exige acabar con ello y India y Brasil se resisten a cambiar las reglas porque también se benefician. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: CEPII BACI, UN Comtrade, OECD-WTO TiSMoS / BaTIS (servicios), WTO (estatus y disputas), IMF DOTS.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
