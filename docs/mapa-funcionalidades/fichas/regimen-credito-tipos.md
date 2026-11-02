# Régimen de crédito: curvas soberanas, tipos oficiales y estrés corporativo

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 5 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Mostrar el régimen de crédito y de tipos de cada país en el panel del globo. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 5 hechos con cita literal verificada; países más citados: BR (3), GB (1), US (1).

## 2. Qué te permite hacer

El usuario ve el rendimiento soberano con máximos históricos y spreads contra referencias, el tipo de política monetaria y su senda esperada, el tamaño y redenciones del crédito privado y la morosidad corporativa con emisores en estrés.

**Por qué importa para invertir:** El coste de financiación decide qué empresas apalancadas sobreviven; un régimen de crédito tensionado precede a impagos y caídas de valoración.

## 3. Mapa de alineación

- **Depende de:** regimen-credito-bonos.
- **Conecta con:** salud-fiscal-soberana, régimen de crédito (sistema equity), muro de vencimientos (sistema equity), score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Países con tipo oficial, rendimiento a 10 años y spread contra referencia, con fecha ≤1 mes.
- **Umbral:** ≥40 países (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** FRED, BIS policy rates, ECB SDW, investing.com/Trading Economics (yields), Moody's/S&P default reports, PitchBook/Preqin (crédito privado, si licencia).
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Promover app/api/dev/sovereign-yields a datos estables; ampliar lib/macro/bis-client.ts (tipos oficiales), lib/macro/fred y ecb-client.ts; nuevo lib/data/credit/private-credit.json (AUM, redenciones, morosidad).
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/credit-regime/credit-regime-service.ts (consume el régimen de crédito del sistema equity).
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/sovereign-yields/[code]/route.ts (sustituye la ruta dev) + bloque credit en app/api/macro/[country].
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Curva, spread y tipo oficial en SovereignMetricsSection + top-bar DebtPanel.
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

- (GB) El coste de endeudamiento a largo plazo del Reino Unido ha subido al nivel más alto desde 1998 y los inversores exigen una prima creciente frente a EE. UU., Francia, Italia y Alemania; fecha no indicada, causa no indicada. — [The End of Thatcher’s Britain?](https://www.youtube.com/watch?v=7PAZrSHoIhk)
- (BR) El banco central brasileño recorta los tipos antes de las elecciones y se espera que los reduzca más hasta 2028, tras haber pasado de mínimos récord a dos dígitos en año y medio; nivel actual de la Selic no indicado. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (US) El crédito privado vale 1,8 billones de dólares y podría duplicarse para 2030, pero hay preocupación por la exposición a software; el fondo BCRED de Blackstone y otros limitaron retiradas tras recibir solicitudes por encima de los límites preestablecidos (rendimiento cercano al 9 %). — [The Man Who Built Blackstone Into a $1.3 Trillion Empire | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=zaeHzTS6Pck)
- (BR) Las empresas brasileñas con pagos atrasados deben cerca de 239.000 millones de reales (unos 46.000 millones de dólares), un récord; el 90% de los nueve millones de negocios morosos son pequeñas y microempresas, y el agro está en niveles récord de impago; causa implícita: tipos de interés altos. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)
- (BR) Raizen ha reestructurado su deuda este año y Casas Bahia, una de las cadenas minoristas más populares de Brasil, ha pedido protección por quiebra; causa: carga de deuda con tipos altos; cifras de las deudas no indicadas. — [Why Brazil Can’t Hide From Its Debt](https://www.youtube.com/watch?v=UgYnjB2es2s)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: FRED, BIS policy rates, ECB SDW, investing.com/Trading Economics (yields), Moody's/S&P default reports, PitchBook/Preqin (crédito privado, si licencia).
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
