# Capa de riesgo climático físico por país

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 9 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Que cada país muestre su exposición climática física y lo que cuesta. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 9 hechos con cita literal verificada; países más citados: FR (4), ES (4), DE (3), IT (2), GB (2), IN (1).

## 2. Qué te permite hacer

El usuario ve por país la exposición a calor extremo, sequía, inundación, ciclones y desastres, sus pérdidas económicas estimadas, la brecha de protección aseguradora y el coste de adaptación; una capa del mapa colorea el riesgo y lo cruza con instalaciones y cultivos.

**Por qué importa para invertir:** El clima físico destruye activos, corta producción agrícola y presiona las cuentas públicas; saber qué países y regiones están expuestos y mal asegurados evita invertir en empresas cuyos activos o proveedores pueden quedar fuera de servicio.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/data/corporate-facilities (exposición por instalación), lib/data/country-resources.json (producción agrícola), finanzas-publicas-soberanas (pasivos contingentes climáticos), sistema-electrico-pais (estrés térmico de la red), logistica-chokepoints-corredores (riesgo hidrológico), score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con índice de exposición climática y pérdidas económicas con fuente y año ≤3 años, sobre 198.
- **Umbral:** ≥150 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** ND-GAIN, INFORM Risk (JRC), EM-DAT, World Bank Climate Change Knowledge Portal, Swiss Re sigma (brecha aseguradora), NGFS (escenarios), FAO (cultivos).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/climate-risk/physical-risk.json: {country, amenazas[{tipo, indice, tendencia}], perdidas_pct_pib, brecha_aseguradora_pct, coste_adaptacion_pct_pib, cultivos_expuestos[], escenarios_calor[], fuente, fecha}.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/climate-risk/climate-risk-service.ts (normaliza índices, calcula exposición de instalaciones de corporate-facilities por coordenadas y escenarios de impacto en PIB).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/climate-risk/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/ClimateRiskSection.tsx + capa temática 'climate' en Map2D (map2d/country-styler.ts) + indicador en top-bar StabilityPanel.
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

- (IN) India sufre su peor monzón desde el último El Niño: tuvo el quinto junio más seco registrado, seguido de una inundación en julio que concentró la lluvia de un mes en una semana; impacto en cosecha e inflación no indicado. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (—) El Niño de 1982-83 redujo la productividad económica mundial en 4,1 billones de dólares y el de 1997-98 en 5,7 billones (estimaciones de estudios citados en el video); plazo del impacto: largo plazo; causa: eventos ENSO que alteran clima y cosechas, aunque el video no detalla el mecanismo; los episodios recientes podrían costar más. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (FR, ES) Incendios forestales en Europa Occidental han obligado a más de 300.000 personas a abandonar sus hogares en Francia y España, con estado de emergencia; fecha exacta y causa del brote no indicadas en el hallazgo (el video lo enmarca en el contexto del Super El Niño). — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)
- (BR) Los científicos advierten de que la deforestación continuada podría desencadenar un punto de inflexión del Amazonas en la década de 2030. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (MM) Un terremoto de magnitud 7,7, el mayor de Myanmar en un siglo, mató según la junta a unas 1.700 personas (cifra oficial inicial, tres días después del sismo) y agravó la crisis del país; fecha exacta no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (DE, FR, ES, IT, GB) Si persisten los veranos muy calientes, el coste para las mayores economías europeas (DE, FR, ES, IT, GB) podría llegar a cientos de miles de millones, con impacto desigual y algunos países del norte mejor parados; plazo exacto no indicado y causa: pérdida de productividad y daños por calor extremo. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (DE, FR, ES, IT) La Comisión Europea estima que los países de la UE deben gastar unos 80.000 millones de dólares al año en adaptación climática hasta 2050, de los cuales más de 33.000 millones anuales solo en infraestructura. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (FR, ES, DE, GB) Solo el 25 % de las pérdidas económicas por peligros climáticos en Europa tiene cobertura de seguro; el 75 % restante lo asumen empresas y, cada vez más, los Estados como garantes de último recurso (plazo y causa concreta de la brecha no indicados; referencia: unos 40.000 millones de dólares de pérdidas aseguradas en California en 2025). — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (CI, GH) África Occidental, foco de producción de cacao, ya muestra impactos de El Niño en el crecimiento y el rendimiento del cultivo, lo que afectará a los precios en 2027 y a la calidad; el El Niño de 2023-2024 provocó varios picos de precio del cacao. — [How ‘Super El Niño’ Is Turbocharging Weather Disasters](https://www.youtube.com/watch?v=OU0PIBP44_4)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: ND-GAIN, INFORM Risk (JRC), EM-DAT, World Bank Climate Change Knowledge Portal, Swiss Re sigma (brecha aseguradora), NGFS (escenarios), FAO (cultivos).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
