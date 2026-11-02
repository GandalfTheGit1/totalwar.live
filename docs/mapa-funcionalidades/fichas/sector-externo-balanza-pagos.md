# Sector externo: balanza de pagos, posición inversora, divisa y fuentes de divisas

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 13 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Ver la vulnerabilidad externa de cada país: de dónde vienen sus divisas y a quién debe. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 13 hechos con cita literal verificada; países más citados: US (7), JP (2), CU (2), CN (2), KR (1), TW (1).

## 2. Qué te permite hacer

El usuario ve cuenta corriente, composición de entradas de divisas (exportaciones, remesas, turismo, ayuda), deuda externa y programas del FMI, posición inversora internacional, tenedores extranjeros de su deuda por origen, intervenciones cambiarias y flujos financieros de retorno.

**Por qué importa para invertir:** Los países que dependen de financiación externa sufren crisis de divisa y control de capitales que hunden el valor en moneda fuerte de cualquier inversión local.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** salud-fiscal-soberana, regimen-credito-tipos, clima-inversion-extranjera, megaproyectos-infraestructura, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con cuenta corriente, composición de entradas de divisas y deuda externa con fuente y año ≤2 años.
- **Umbral:** ≥150 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** IMF BOP/IIP y CPIS, World Bank IDS y WDI, US Treasury TIC, IMF MONA (programas), OECD DAC (ayuda), UN Tourism.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/macro/imf-bop-client.ts (BOP e IIP) + ampliar world-bank-client.ts (BN.CAB.XOKA.GD.ZS, DT.ODA.ODAT.GN.ZS, BX.TRF.PWKR.CD.DT, ST.INT.RCPT.CD, deuda externa IDS); nuevo lib/data/external-accounts.json para tenencias por origen (TIC/CPIS) y programas FMI.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/sovereign-finances/external-accounts.ts (vulnerabilidad externa, dependencia de ayuda).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Ampliar app/api/macro/[country] con bloque external.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Bloque 'Cuentas externas' en SovereignMetricsSection + desequilibrios en DalioMacroSection + top-bar DebtPanel.
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

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: IMF BOP/IIP y CPIS, World Bank IDS y WDI, US Treasury TIC, IMF MONA (programas), OECD DAC (ayuda), UN Tourism.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
