# Motor de transmisión de shocks energéticos a inflación, combustibles y países frágiles

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 4 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Estimar cómo un shock energético llega a la inflación de cada país. Eje: calidad.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 4 hechos con cita literal verificada; países más citados: US (3), MM (1), IR (1).

## 2. Qué te permite hacer

Ante un shock de petróleo o gas (real o simulado en un chokepoint) el usuario ve la inflación por componentes, el traslado a combustibles y transporte por país y qué economías frágiles sufren más por dependencia importadora y subsidios.

**Por qué importa para invertir:** Conecta un evento geopolítico con inflación, tipos y consumo en cada país, que es lo que mueve resultados y valoraciones de empresas expuestas.

## 3. Mapa de alineación

- **Depende de:** balance-energetico-dependencia.
- **Conecta con:** balance-energetico-dependencia, logistica-chokepoints-corredores, salud-fiscal-soberana (subsidios), lib/services/prediction-markets, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Error del traslado simulado a la inflación energética frente al dato real tras el shock de Ormuz 2026, en 10 países.
- **Umbral:** ≤1,5 puntos de inflación interanual (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** FRED, Eurostat HICP, ILOSTAT/ONS/BLS por componentes, GlobalPetrolPrices, IMF Fossil Fuel Subsidies.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Ampliar lib/macro/fred-series-map.ts y world-bank-client.ts con IPC por componentes (energía, alimentos, transporte) y precios de combustible al consumidor.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/geopolitical/energy-shock-transmission.ts (elasticidad de traslado por país, ponderada por energy-security-service).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Ampliar app/api/macro/[country] con bloque inflation_components y pass_through.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Sidebar DalioMacroSection (pestaña Ciclo Económico Dalio) + panel de efecto por país en ChokepointSimulationDrawer.
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

- (MM) Durante la guerra de Irán, Myanmar impuso estrictas restricciones al combustible, con grandes colas de vehículos, por el choque energético que se sumó a los efectos del conflicto interno; magnitud y plazo no indicados. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (US, IR) La guerra de EE. UU./Israel con Irán dispara los precios de la energía, con el diésel como combustible más afectado; un transportista independiente pasó de 800-1.200 a 1.700-1.800 dólares semanales en combustible. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) La inflación de EE. UU. pasó del 2,4% a comienzos de 2026 al 3,7% en septiembre, más de seis meses después del inicio de la guerra de EE. UU./Israel con Irán. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)
- (US) Frente a antes de la pandemia, los alimentos suben más del 30%, el alquiler más de un tercio, el seguro de coche casi un 50% y la energía aún más. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: FRED, Eurostat HICP, ILOSTAT/ONS/BLS por componentes, GlobalPetrolPrices, IMF Fossil Fuel Subsidies.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
