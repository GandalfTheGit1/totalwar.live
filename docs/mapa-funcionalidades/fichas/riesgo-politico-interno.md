# Riesgo político interno: gobierno, calendario de catalizadores e inestabilidad social

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 8 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Que el riesgo político de cada país se actualice con eventos y calendario. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 8 hechos con cita literal verificada; países más citados: IN (3), BO (2), GB (1), MM (1), US (1), NP (1).

## 2. Qué te permite hacer

El usuario ve quién gobierna, su orientación y legitimidad, el calendario de elecciones y catalizadores (políticos y sectoriales) y un monitor de protestas e inestabilidad con episodios de reversión de políticas.

**Por qué importa para invertir:** Elecciones y protestas cambian impuestos, regulación y contratos; anticipar el calendario permite posicionarse antes del evento.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/services/prediction-markets (mercados electorales), salud-fiscal-soberana (calendario fiscal-electoral), app/api/dev/update-country-tension, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con gobierno actual, próxima elección y eventos de inestabilidad de los últimos 90 días con fuente.
- **Umbral:** ≥150 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** IFES ElectionGuide, ParlGov / V-Dem, ACLED (protestas), Carnegie Global Protest Tracker, GDELT.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/political/government.json (jefe de gobierno, orientación, coalición, próximas elecciones, catalizadores[]) + lib/data/political/unrest-events.json (protestas y reversión de políticas).
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/political/political-risk-service.ts.
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/political/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/PoliticalRiskSection.tsx + top-bar StabilityPanel + modo 'news' del mapa.
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

- (BO) El nuevo presidente centrista boliviano Rodrigo Paz disolvió el Ministerio de Medio Ambiente, asignó la política ambiental a Planificación del Desarrollo (cuyo ministro tiene 25 años en la industria de soja) y pretende expandir la producción agrícola; fecha de la decisión no indicada. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)
- (GB) Reino Unido ha tenido cinco primeros ministros desde el Brexit, con fragmentación del sistema de partidos, y Nigel Farage es el favorito para ganar las próximas elecciones y ser primer ministro; fecha de las elecciones no indicada. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (MM) El parlamento de Myanmar eligió presidente al jefe militar Min Aung Hlaing tras unas elecciones que la oposición considera un intento de legitimar al ejército; fecha no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (IN) El partido de Modi afronta el año próximo elecciones clave en Uttar Pradesh, el estado más poblado de India, donde el desempleo juvenil es una preocupación central; fecha exacta no indicada. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (US) El flag football será deporte olímpico en Los Ángeles 2028, en categorías masculina y femenina, y la NFL planea lanzar ligas profesionales masculina y femenina; fechas de lanzamiento de las ligas no indicadas. — [How K. Don Cornwell’s Private Equity Firm Is Changing the NFL | The Deal](https://www.youtube.com/watch?v=Lcj0KqB4-40)
- (IN) El movimiento juvenil 'Cockroach' (CJP) forzó la dimisión del ministro de Educación Dharmendra Pradhan, la primera vez desde 2014 que un ministro de Modi dimite por presión pública, tras la filtración de un examen médico de acceso que afectó a 2,2 millones de candidatos. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (IN, NP, BD, ID) El malestar juvenil por desigualdad, corrupción y desempleo está desestabilizando gobiernos en Asia (Nepal, Bangladés, Indonesia) además de India; magnitud y plazo no indicados. — [India's Youth Are Angry. Here's Why.](https://www.youtube.com/watch?v=eoMFocllbFw)
- (BO) Paz aprobó una ley para convertir pequeñas fincas en medianas, pero tras protestas indígenas y campesinas (con gases lacrimógenos en La Paz) tuvo que revertirla, en medio de medidas de austeridad; fechas no indicadas. — [The Deal That May Reshape the Amazon’s Future](https://www.youtube.com/watch?v=cHH-DkhTJW4)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: IFES ElectionGuide, ParlGov / V-Dem, ACLED (protestas), Carnegie Global Protest Tracker, GDELT.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
