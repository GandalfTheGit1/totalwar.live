# Mapa de centros de datos: capacidad, demanda eléctrica y competitividad por país

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 5 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Ver dónde se concentra la infraestructura de IA y si la red la soporta. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 5 hechos con cita literal verificada; países más citados: US (4), CN (1).

## 2. Qué te permite hacer

El usuario ve los centros de datos por país y operador (MW en servicio y en construcción), la demanda eléctrica proyectada frente a la capacidad de la red, el déficit esperado y un índice de competitividad de costes (energía, suelo, permisos) para alojar IA.

**Por qué importa para invertir:** La demanda de IA choca con redes finitas; identifica qué países atraerán inversión, dónde subirán precios eléctricos o habrá moratorias, y qué utilities, constructores y operadores se benefician.

## 3. Mapa de alineación

- **Depende de:** sistema-electrico-pais.
- **Conecta con:** sistema-electrico-pais, ciclo-inversion-ia, licencia-social-permisos, lib/data/corporate-facilities, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con MW de centros de datos (en servicio y en construcción) y demanda proyectada con fuente.
- **Umbral:** ≥30 países, incluidos los 15 con datos FRED (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** IEA Energy and AI, EPRI, operadores de red (PJM, EirGrid), Data Center Map / Baxtel, informes de hiperescaladores, Cushman & Wakefield Data Center Development Cost Guide.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/data-centers/data-centers.json: {operador, country, region, coords, mw_operativo, mw_construccion, estado, fuente}. Ampliar lib/data/corporate-facilities/hyperscale-auto.ts con MW.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/data-centers/dc-demand-service.ts (demanda vs capacidad usando power-system-service, índice de costes).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/data-centers/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Capa 'data-centers' en Map2D (map2d/render-facilities.ts) + bloque en top-bar TechPanel.
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

- (US) Schwarzman afirma que el boom de centros de datos de IA hará que el mundo desarrollado se quede corto de electricidad (cifra y plazo no indicados), y que Blackstone ya invirtió mucho en ese sector antes que otros. — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (US) Los vecinos asocian los centros de datos con daño ambiental, uso de agua y subidas de la factura eléctrica, lo que alimenta el rechazo político en EE. UU.; magnitud y plazo no indicados. — [The AI Elections Have Arrived](https://www.youtube.com/watch?v=wraPuftwsxQ)
- (US) Entrenar world models exigirá probablemente más energía y más recursos, y la CEO de World Labs reconoce que aún no sabe si podrá conseguirlos porque es demasiado pronto y la tecnología sigue en fase de demo; cifras y plazo no indicados. — [What's Beyond ChatGPT? The 'Godmother of AI' Has a Plan | The Circuit](https://www.youtube.com/watch?v=ITxsc3mgqts)
- (CN) La ventaja de coste de la IA china viene de electricidad más barata, talento mucho más barato y modelos de pesos abiertos; una startup de EE. UU. redujo su factura de unos 1,5 millones de USD al mes a unos 100.000 USD (10 veces menos) al pasar a modelos abiertos; plazo no indicado. — [How China Plans to Win the Global AI Race](https://www.youtube.com/watch?v=eVUYCiRLgB4)
- (US) Blackstone compró en 2021 un gran operador de centros de datos por 10.000 millones de dólares que ahora es 15 veces mayor; se declara el mayor propietario de centros de datos del mundo, con los seis hiperescaladores como clientes (causa: demanda de IA y nube). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: IEA Energy and AI, EPRI, operadores de red (PJM, EirGrid), Data Center Map / Baxtel, informes de hiperescaladores, Cushman & Wakefield Data Center Development Cost Guide.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
