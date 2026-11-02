# Perfil de conflicto armado: control territorial, costes, economías ilícitas y contagio

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 5 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Cuantificar los conflictos armados activos y su efecto económico. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 5 hechos con cita literal verificada; países más citados: MM (5), TH (2).

## 2. Qué te permite hacer

El usuario ve qué porcentaje del territorio controla el Estado frente a grupos armados, quién controla las zonas de recursos, víctimas y desplazados, economías ilícitas que financian el conflicto y vectores de contagio hacia vecinos.

**Por qué importa para invertir:** El territorio fuera de control estatal es donde las empresas no pueden operar ni proteger activos; el contagio extiende ese riesgo a países vecinos.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/data/territorial-claims, registro-minas-minerales-criticos, lib/services/sovereign-power, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con conflicto activo (según ACLED/UCDP) que tienen víctimas, desplazados y estimación de control territorial con fuente.
- **Umbral:** 100 % de los conflictos activos de UCDP (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** ACLED, UCDP GED, UNHCR/IDMC (desplazados), Crisis Group CrisisWatch, ISW / monitores locales (control territorial, curación manual), UNODC (economías ilícitas).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/conflict/territorial-control.json {country, estado_pct, actores[{nombre, pct, zonas, recursos_controlados}], victimas, desplazados, economias_ilicitas[], vecinos_expuestos[], fecha}.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/conflict/conflict-service.ts.
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/conflict/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/ConflictProfileSection.tsx (junto a TerritorialClaimsSection) + capa 'conflicto' en Map2D + top-bar StabilityPanel.
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

- (MM) La junta militar de Myanmar y sus aliados controlan como máximo el 40-45 % del territorio porque ningún bando gana en el campo de batalla (guerra civil en curso, sin fin previsto a corto plazo); fecha exacta de la estimación no indicada. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM, TH) Los centros de estafa como Shwe Kokko (frontera Myanmar-Tailandia) generan entre miles de millones y decenas de miles de millones de dólares de ingresos que financian a los combatientes, incluida la junta; periodo no indicado, causa: negocio ilícito de fraude online usado como financiación de guerra. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM) Los rebeldes del TNLA tomaron en 2024 la ciudad de Mogok, zona de rubíes de Myanmar (país con reservas de gemas, madera y cobre), y cobran a los mineros por trabajar sus parcelas; causa: el conflicto armado desplaza el control de las zonas mineras. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM) La guerra civil de Myanmar ha dejado unos cien mil muertos, cientos de miles de heridos y millones de desplazados; periodo de acumulación y causa no indicados más allá del conflicto armado. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)
- (MM, TH) La guerra de Myanmar se desborda hacia la frontera occidental de Tailandia: cientos de miles de refugiados cruzan, a menudo de forma ilegal, lo que alimenta el tráfico de personas y obliga al ejército tailandés a vigilar zonas controladas por milicias y rebeldes; plazo no indicado. — [The Dark Money Behind Myanmar’s Civil War | Bloomberg Investigates](https://www.youtube.com/watch?v=0EZ6f3M64rI)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: ACLED, UCDP GED, UNHCR/IDMC (desplazados), Crisis Group CrisisWatch, ISW / monitores locales (control territorial, curación manual), UNODC (economías ilícitas).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
