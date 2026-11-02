# Balance energético y dependencia de importaciones por proveedor

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 10 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Saber de quién depende energéticamente cada país y cuánto aguanta. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 10 hechos con cita literal verificada; países más citados: RU (4), US (3), CU (2), IN (2), CN (1), JP (1).

## 2. Qué te permite hacer

Por país el usuario ve producción, consumo y déficit por combustible, de qué proveedores importa y en qué cuota, días de reservas estratégicas, infraestructura transfronteriza (gasoductos, interconexiones, nucleares) y acuerdos de cooperación o topes de precio.

**Por qué importa para invertir:** La dependencia de un proveedor concreto convierte una crisis diplomática o una sanción en un shock de costes para toda la industria del país; es la vía más directa por la que la geopolítica llega a los márgenes.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** engine/relations/model/flow.py (dependencia como flujo bilateral), engine/relations/model/measures.py (sanciones energéticas), logistica-chokepoints-corredores, transmision-shocks-energia-inflacion, lib/data/country-resources.json.
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con balance por combustible y top-3 proveedores con cuota, fuente y año ≤2 años.
- **Umbral:** ≥120 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** IEA World Energy Balances, Energy Institute Statistical Review, JODI Oil/Gas, Eurostat, UN Comtrade (HS 27), Global Energy Monitor (gasoductos y proyectos).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/energy/energy-balance.json: {country, combustible, produccion, consumo, importaciones[{proveedor, cuota}], reservas_dias, infra_transfronteriza[], proyectos_estrategicos[], acuerdos[]}. country-resources.json sigue con producción.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/energy/energy-security-service.ts (dependencia por proveedor, escenarios de corte).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/energy/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/EnergySecuritySection.tsx + top-bar EnergyPanel + arcos de importación energética en map2d/render-arcs.ts.
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

- (CU) Cuba produce unos 40.000 barriles diarios de crudo, muy por debajo de lo necesario para hacer funcionar con normalidad su red eléctrica, que depende del petróleo; consumo total y año no indicados, causa del déficit: producción interna insuficiente. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (CN) China recortó sus importaciones de crudo en 4-5 millones de barriles diarios, hasta el nivel más bajo en unos ocho años, pausando el almacenamiento estratégico; fue el mayor amortiguador del precio durante el cierre de Ormuz. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (US) La AIE coordinó una liberación de reservas globales de unos 400 millones de barriles que entraron al mercado con poca antelación durante el cierre de Ormuz, con EE. UU. aportando volúmenes de su reserva estratégica y alcanzando exportaciones récord de crudo; plazo exacto no indicado. — [How the Iran War Is Rewiring the Oil Market](https://www.youtube.com/watch?v=GDVeMkTLWGs)
- (JP) Japón depende en gran medida del petróleo de Oriente Medio y la guerra de EE. UU. e Israel con Irán encareció energía y materiales, incluso interrumpiendo el suministro de tinta para envases; el gobierno subvenciona combustible y diversifica proveedores; cifras no indicadas. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (CU, US, MX, VE) Tras la captura de Maduro a finales de enero (año no indicado en el hallazgo), Cuba perdió el petróleo venezolano; EE. UU. amenazó con sanciones a cualquier país que suministrara crudo a Cuba y México (Sheinbaum) dejó de hacerlo por considerarlo un riesgo para su economía, dejando a Cuba sin combustible y con apagones; volumen suministrado no indicado. — [What's Choking Cuba's Economy](https://www.youtube.com/watch?v=Q0PnVLUeFI8)
- (IN, RU) El crudo ruso alcanzó casi el 56% de las importaciones totales de petróleo de India en julio de 2026, unos 6.400 millones de dólares al mes, frente a prácticamente cero antes de 2022; causa implícita: crudo ruso con descuento tras las sanciones occidentales por la guerra de Ucrania (el video no detalla el descuento). — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (DE, RU) Rusia suministraba cerca de la mitad de la demanda de gas natural de Alemania; el corte de ese suministro elevó los costes energéticos muy por encima de los de EE. UU. y China y golpeó a los sectores intensivos en energía; plazo preciso no indicado. — [What's Wrong With Germany?](https://www.youtube.com/watch?v=IlbPO9Vmuuo)
- (PK, IR) Una mejora de relaciones entre EE. UU. e Irán podría desbloquear el gasoducto Irán-Pakistán, estancado desde hace tiempo y que aliviaría la crisis energética pakistaní; la reanudación del conflicto lo aplaza (plazo no indicado). — [Inside Pakistan's High-Stakes Gamble on Trump](https://www.youtube.com/watch?v=jbuB1DhZlnM)
- (IN, RU) La central nuclear de Kudankulam (Tamil Nadu), proyecto emblemático ruso-indio con Rosatom como constructora, es muy cara y se ha retrasado por la guerra de Ucrania, pero avanza y es pieza clave de la diversificación energética india hacia la energía nuclear; coste y fecha de finalización no indicados. — [Why India Won’t Break Up With Russia](https://www.youtube.com/watch?v=TXGXuWfWFIE)
- (US, RU) La administración Trump busca un acuerdo con Rusia para aumentar la oferta de diésel en el mercado, y se espera que los mayores reembolsos fiscales que amortiguaron el consumo se agoten; plazo no indicado. — [Why Does the US Economy Feel Worse Than It Looks?](https://www.youtube.com/watch?v=jLlBm-fYi9s)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: IEA World Energy Balances, Energy Institute Statistical Review, JODI Oil/Gas, Eurostat, UN Comtrade (HS 27), Global Energy Monitor (gasoductos y proyectos).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
