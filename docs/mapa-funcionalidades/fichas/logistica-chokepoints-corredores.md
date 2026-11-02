# Riesgo logístico: chokepoints con tráfico parcial, rutas alternativas, vías fluviales y corredores

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 9 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Que el simulador de chokepoints reproduzca crisis reales con tráfico parcial. Eje: calidad.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 9 hechos con cita literal verificada; países más citados: IR (2), PA (1), SA (1), AE (1), DE (1), BR (1).

## 2. Qué te permite hacer

El simulador de chokepoints pasa de bloqueo sí/no a porcentaje de tráfico con curva de recuperación, muestra rutas alternativas con su capacidad real, peajes y primas de seguro de guerra, y añade vías fluviales interiores, corredores terrestres y la transición de combustibles y electrificación de puertos.

**Por qué importa para invertir:** La mayoría de disrupciones son parciales y duraderas, no cierres totales; medir capacidad de desvío y coste extra de flete permite estimar el impacto real en márgenes de importadores, navieras y productores que dependen de una ruta.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/services/maritime-chokepoints/sector-profiles-data.ts, balance-energetico-dependencia, riesgo-climatico-fisico, transmision-shocks-energia-inflacion, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Error medio del % de tráfico simulado frente a IMF PortWatch en 3 crisis reales (Mar Rojo 2024, Panamá 2023, Ormuz 2026).
- **Umbral:** ≤20 puntos porcentuales (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** IMF PortWatch (tránsitos diarios), Autoridad del Canal de Panamá (calado y tránsitos), Lloyd's List / Joint War Committee (primas), UNCTAD, IMO (normativa de emisiones), Rhine/Mississippi gauges (USACE, WSV).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Ampliar lib/services/maritime-chokepoints/chokepoints-data.ts (capacidad_pct, nivel_agua, peaje, prima_seguro_guerra) y trade-routes-data.ts (rutas alternativas con capacidad); nuevos inland-waterways-data.ts y land-corridors-data.ts en la misma carpeta; normativa de emisiones marítimas en presets-data.ts.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Ampliar lib/services/maritime-chokepoints/simulation-engine.ts y freight-calculations.ts (bloqueo parcial, curva de recuperación, desvío limitado por capacidad) vía maritime-chokepoint-service.ts.
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/chokepoints/[id]/route.ts (estado actual y simulación) + app/api/dev/port-congestion y baltic-dry-index existentes.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. ChokepointSimulationDrawer (control de % de tráfico y rutas alternativas), map2d/render-maritime.ts y ChokepointTooltip.tsx, top-bar PortsPanel, sidebar TacticalLogisticsSection.
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

- (PA) La sequía asociada a El Niño redujo el tráfico del Canal de Panamá en 2024 y este año (2026) la Autoridad del Canal ya aplica límites de carga para conservar agua, lo que afecta a los flujos de GNL y a los precios de la energía; cifras no indicadas. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (SA, AE) Los oleoductos de desvío (Arabia Saudí hacia el Mar Rojo y Emiratos hacia Fujairah) compensaron unos 6 millones de b/d durante el cierre de Ormuz; los EAU rinden unos 1,5 millones de b/d y planean llegar a 3 millones a finales de 2027, dando más peso a los puertos de Fujairah y Yanbu. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (IR) Algunos buques han pagado hasta 2 millones de dólares para cruzar Ormuz durante el conflicto; se debate un régimen de peajes y quién vigila el estrecho tras el conflicto; plazo no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (IR) La presencia de minas hizo que armadores y propietarios de carga evitaran Ormuz incluso tras el acuerdo de paz interino, porque sacar buques es más fácil que volver a meterlos; la línea base citada es de 120-130 buques diarios y el plazo de recuperación no se indica. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (DE) El Rin, por donde circula cerca del 80% de las mercancías transportadas por barco en Alemania, registra en 2026 un nivel de agua medio aún inferior al de la ola de calor de 2018, lo que amenaza la logística industrial alemana. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (BR, BO) Brasil respaldó formalmente carreteras y un puente fluvial que conectan con Bolivia, a mayor escala de lo sugerido antes, incluida la ruta hacia San Ignacio; más del 90% de la deforestación amazónica ocurre junto a carreteras; fecha del respaldo no indicada. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (—) El transporte marítimo internacional emitió en 2024 unos 740 millones de toneladas de CO2 equivalente, cerca del 1,4% de las emisiones globales, más que Alemania o Corea del Sur. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (UY) Uruguay invirtió además 20 millones de dólares en un proyecto de mejoras de red y carga para barcos en el puerto de Colonia (plazo no indicado). — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)
- (—) Las baterías no sirven para el transporte oceánico de larga distancia, que seguirá dependiendo de combustibles alternativos (hidrógeno, quizá nuclear); solo los ferris y las rutas cortas se electrifican. — [How Batteries Power Some of the World’s Biggest Ferries | Bloomberg Primer](https://www.youtube.com/watch?v=s2AD7DD8_PQ)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: IMF PortWatch (tránsitos diarios), Autoridad del Canal de Panamá (calado y tránsitos), Lloyd's List / Joint War Committee (primas), UNCTAD, IMO (normativa de emisiones), Rhine/Mississippi gauges (USACE, WSV).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
