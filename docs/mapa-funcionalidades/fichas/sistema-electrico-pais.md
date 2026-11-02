# Sistema eléctrico: capacidad, red, precios industriales y sensibilidad al clima

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 10 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Comparar la capacidad y el precio eléctrico de cada país. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 10 hechos con cita literal verificada; países más citados: CN (7), GB (2), FR (2), ES (2), DE (2).

## 2. Qué te permite hacer

El usuario ve capacidad instalada y adiciones anuales por tecnología, factor de utilización y curtailment, almacenamiento y transmisión, papel del carbón como respaldo, operadores de red, reformas del mercado y un comparador del precio de electricidad industrial entre países, con su sensibilidad al calor y la sequía.

**Por qué importa para invertir:** El coste y la fiabilidad de la electricidad deciden dónde se instalan fábricas y centros de datos y quién gana en renovables, redes y almacenamiento; una red saturada es un límite físico al crecimiento.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** balance-energetico-dependencia, centros-datos-ia, riesgo-climatico-fisico, lib/data/natural-resources.json, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con capacidad por tecnología y precio de electricidad industrial con fuente y año ≤2 años.
- **Umbral:** ≥80 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** Ember (capacidad, generación, precios), IEA, IRENA, ENTSO-E / EIA (curtailment y transmisión), Eurostat (precios industriales), reguladores nacionales.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/energy/power-system.json: {country, capacidad_por_tecnologia, adiciones_anuales, factor_utilizacion, curtailment_pct, almacenamiento_gw, km_transmision, precio_industrial_eur_mwh, sensibilidad_calor_sequia, reformas[]}. Reutiliza renovable/nuclear de natural-resources.json.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/energy/power-system-service.ts (comparador de precios y margen de reserva).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/energy/[code]/power/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/PowerSystemSection.tsx + comparador en top-bar EnergyPanel.
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

- (CN) China añadió en 2025 más de 500 GW de capacidad eléctrica en 12 meses, equivalente a todo el sistema eléctrico de la India (causa no indicada). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) En China la capacidad instalada de solar y eólica ronda el 50%, pero su generación apenas supera el 20%, por el recorte (curtailment) de energía renovable; en el primer semestre de 2026 la energía desperdiciada podría haber abastecido a Francia. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) China es líder mundial en almacenamiento en baterías: aumentó su capacidad de ion-litio un 84% entre 2024 y 2025 y tiende miles de km de líneas de larga distancia desde el Gobi a los centros urbanos, pero ambos activos están infrautilizados. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) Pekín se ha comprometido a tener un mercado eléctrico nacional unificado en 2030, rompiendo las barreras provinciales y pasando de un despacho controlado por la red a mercados mayoristas (avance actual no indicado). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) La red china la operan un par de gigantes estatales con despacho centralizado a la antigua y cada provincia es responsable de su propio suministro, lo que impide compartir energía en picos de demanda. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) El carbón sigue siendo difícil de apagar en China, que es con diferencia el mayor consumidor y productor mundial, y parte de su generación está bloqueada en contratos anuales, lo que fuerza recortes de renovables a final de año. — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (CN) China apuesta por IA, robótica y manufactura avanzada, que requieren mucha energía, para crear una capa de electricidad limpia casi infinita y barata como ventaja competitiva industrial (cifras y plazo no indicados). — [China’s Quest for ‘Infinite’ Energy](https://www.youtube.com/watch?v=qcGtWW8uERI)
- (GB) Reino Unido tiene la energía más cara del mundo desarrollado, un factor de política interna que pesa sobre la economía al margen del Brexit; cifras y causa exacta no indicadas. — [This Is What Brexit Cost the World](https://www.youtube.com/watch?v=d6gyCyPwRZo)
- (FR, ES, DE) El calor reduce el caudal de los ríos, lo que baja la generación hidroeléctrica, y limita la refrigeración de las centrales nucleares, que necesitan mucha agua; ambos efectos tensionan un sistema eléctrico europeo ya precario por Ucrania e Irán. — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)
- (DE, FR, ES, GB) El consumo eléctrico de los hogares por enfriamiento se duplicó entre 2018 y 2024, y las redes (transformadores y otros equipos) no están diseñadas para este calor, lo que fuerza a las utilities a invertir en nuevo equipamiento (monto no indicado). — [Why Extreme Heat Is Costing Europe](https://www.youtube.com/watch?v=uHR9tZ-LUGw)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: Ember (capacidad, generación, precios), IEA, IRENA, ENTSO-E / EIA (curtailment y transmisión), Eurostat (precios industriales), reguladores nacionales.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
