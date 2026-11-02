# Registro de política industrial y subsidios por país y sector

Estado: idea. Sistema: global. Creada 2026-11-02 a partir de 5 hechos verificados de Bloomberg Originals.

## 1. Meta y contexto

- **Meta:** Saber qué sectores y empresas apoya cada Estado y con cuánto. Eje: cobertura.
- **Contexto, no señal.** Muestra datos de contexto por país; no predice precios ni entra al score de empresas sin pasar por calibración.
- **Origen (Hecho):** 5 hechos con cita literal verificada; países más citados: CN (3), US (2), JP (1), HK (1).

## 2. Qué te permite hacer

El usuario ve las políticas industriales vigentes (subsidios, créditos fiscales, aranceles estratégicos, estrategias tecnológicas, incentivos subnacionales) con sector, importe, plazo y empresas beneficiarias.

**Por qué importa para invertir:** Los subsidios deciden dónde se localiza la inversión y qué empresas tienen viento a favor; su reversión es un riesgo directo para los beneficiarios.

## 3. Mapa de alineación

- **Depende de:** nada del registro.
- **Conecta con:** lib/data/trade-dag, estructura-productiva-clusteres, megaproyectos-infraestructura, eventos-reaccion-mercado, score de empresas (tras calibración).
- **Separado a propósito de:** score de empresas, hasta que haya calibración.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| expresa | 0 | Evidencia insuficiente | Sin peticiones de usuarios. Los hechos de Bloomberg Originals muestran que el tema importa al inversor, no que lo pidan. |
| frustracion | 0 | Evidencia insuficiente | Sin entrevistas. |
| conviene | 0 | Evidencia insuficiente | Hipótesis: ahorra tiempo frente a buscar en fuentes dispersas. |

Para subirla: preguntar a 5 usuarios del globo si lo consultarían antes de invertir y qué usan hoy.

## 5. Métrica de éxito

- **Qué:** Políticas industriales registradas con país, sector, importe, plazo y fuente.
- **Umbral:** ≥20 países con ≥3 políticas cada uno (Suposición).
- **Plazo:** Antes del despliegue público.
- **Registro por fecha:** cada dato guarda fuente y fecha de publicación para poder testearlo después.

## 6. Datos y riesgos

- **Fuentes candidatas:** Global Trade Alert (subsidios), OECD MAGIC, Good Jobs First Subsidy Tracker (EE. UU.), boletines oficiales; curación manual para estrategias.
- **Licencias y términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si una fuente se cae:** se conserva el último dato con su fecha y la interfaz lo marca como desactualizado.

## 7. Interfaz (Hipótesis, propuesta por IA)

- **Dónde:** pública. Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
- Estados de carga, vacío ("sin datos para este país") y error (cae al estado vacío), igual que BloombergOriginalsSection.

## 8. Plan por pasos

Paso 1: Datos. Nuevo lib/data/industrial-policy/policies.json: {country, nivel (nacional/subnacional), sector, instrumento, importe, inicio, fin, beneficiarios[]}.
Hecho cuando: el archivo o la ingesta existe con ≥5 países reales y fuente/fecha por fila.

Paso 2: Servicio. Nuevo lib/services/industrial-policy/industrial-policy-service.ts.
Hecho cuando: una prueba vitest con fixture real pasa y un formato roto falla con error claro.

Paso 3: API. Nuevo app/api/industrial-policy/[code]/route.ts.
Hecho cuando: devuelve datos para un país conocido y 404 para un código desconocido.

Paso 4: Interfaz. Nueva sección sidebar/IndustrialPolicySection.tsx + marcadores sobre nodos de TradeDagSection.
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

- (CN) China va camino de invertir 142.000 millones de dólares en fabricación de chips (estimación de la Semiconductor Industry Association), como parte de décadas de política industrial; plazo concreto de la inversión no indicado. — [Trade Wars, Fighting Corruption and Rethinking Globalization | Leaders with Francine Lacqua](https://www.youtube.com/watch?v=bPSeumz6sgI)
- (JP) El gobierno de Takaichi plantea una inversión pública y privada de 370 billones de yenes en 14 años, hasta 2040, repartida en 17 sectores estratégicos que incluyen IA, defensa, energía, semiconductores, tecnología alimentaria y contenidos como manga y anime. — [Can Japan’s Economy Afford Takaichi’s Big Bet?](https://www.youtube.com/watch?v=HffLUwKl8TY)
- (US, CN) La administración Trump apuesta a fondo por la IA como competencia existencial con China y a la vez se muestra más proteccionista para reducir el déficit comercial; ambas políticas alimentan los desequilibrios globales (cifras y plazo no indicados). — [Why AI Is Sucking Up the World’s Wealth](https://www.youtube.com/watch?v=xZPPWP0ZKCI)
- (US) La Texas Space Commission, creada por la legislatura en 2023, concedió 150 millones de dólares en subvenciones el último año y se espera que lo duplique a finales de este año; causa no indicada. — [Why Space Companies Are Betting Big on Texas](https://www.youtube.com/watch?v=MQTVB_TKACw)
- (HK, CN) El Northern Metropolis es un plan del gobierno de Hong Kong para crear un nuevo polo tecnológico que integre la ciudad con China continental, con medio millón de viviendas y siete estaciones nuevas; plazo no indicado. — [The Most Profitable Subway on Earth](https://www.youtube.com/watch?v=3kGQ7gsrOeA)

## 13. Cosas por investigar

1. ¿Hay demanda real? Preguntar a 5 usuarios del globo si consultarían esto antes de invertir.
2. Licencias y términos de uso de las fuentes: Global Trade Alert (subsidios), OECD MAGIC, Good Jobs First Subsidy Tracker (EE. UU.), boletines oficiales; curación manual para estrategias.
3. ¿Desplaza la calibración, que sigue en construcción?
4. Ubicación propuesta por IA sin abrir cada archivo: revisarla contra el código antes de implementar.
