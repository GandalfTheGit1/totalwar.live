# Propuesta de posiciones desde la web con Tavily (21-10-2026)

Resultado corto: **el método no pasó su validación y la hoja de los 300 pares NO se rellenó.** Se intentó dos veces con protocolos fijados con hash antes de buscar nada, y los dos fallaron una condición. Queda el código, los dos protocolos y los resultados de los controles.

## Qué se probó
Para un par, tres búsquedas en Tavily (alianza o asociación, comercio, fricción), snippets que nombren a los dos países, y **dos modelos independientes** (Gemini 2.5 Flash y Qwen3.8-27B de Groq) que leen lo mismo. Un código se acepta solo si los dos lo dan, cada uno con una cita **copiada literalmente** del snippet (comprobado por código), una regla de palabras clave por código y sin palabras de estado («terminated», «proposed», «negotiation»…). Si algo falla, la fila queda vacía: nunca se adivina. Código: `world/web_positions.py`; protocolos: `protocol_web_positions.py` y `protocol_web_positions_v2.py`.

## Resultados de los controles (una sola puntuación cada uno, sin cambiar nada después)
| | v1 (`3c8393dd…`) | v2 (`3b522b0d…`, pares nuevos) |
|---|---|---|
| Positivos (el código esperado aparece) | **13/18** (hacían falta 12) | **10/19** (hacían falta 13) → falla |
| Negativos (lo que NO debe aceptarse) | **12/12** | **12/12** |
| Falsas alianzas | ninguna | ninguna |
| Hallazgos inesperados correctos (juzgados por mí; los no verificables cuentan como incorrectos) | **9/14 = 64 %** (hacía falta 90 %) → falla | **11/13 = 85 %** (hacía falta 90 %) → falla |

**v1** falló por un solo código, las **sanciones**: 1 correcta de 6 (castigos chinos a Australia ya levantados, sanción a un juez brasileño, Rusia «uniéndose» a las de la ONU en 2013, una cita sobre sanciones de terceros…). El resto de hallazgos inesperados, 8 de 8, eran correctos. Por eso la v2 quita ese código y nada más.

**v2** acierta menos de lo exigido: 10 de 19. Se le escapan sobre todo las **negaciones** (Irán–EE. UU., Israel–Arabia Saudí, Corea del Norte–EE. UU. son «sin relaciones» y ninguna fuente lo dice con esas palabras), Israel–Siria (ocupación), China–Vietnam (disputa), Corea del Sur–Vietnam y Canadá–México (libre comercio) e India–Japón (asociación). Y se le cuelan dos aciertos dudosos: Egipto–Arabia Saudí (una «asociación estratégica» que no puedo confirmar como declarada) y Nigeria–EE. UU. (la AGOA es una preferencia unilateral, no un acuerdo entre los dos).

## Qué se aprende
- **Lo que sí funciona**: asociaciones estratégicas y libre comercio. Entre los hallazgos de las dos tandas hay unos 25 de esos dos tipos y solo 2 dudosos; las citas verificables dejan comprobar cada uno con un clic. Ejemplos reales: Australia–India (asociación estratégica integral, 2020), Chile–China (2016), India–Japón (libre comercio, 2011), Corea del Sur–Vietnam (2022), Brasil–India (preferencial vía Mercosur).
- **Lo que no**: sanciones («en vigor» y «quién a quién» no se deciden con titulares), ausencia de relaciones, y cualquier cosa que no tenga un documento con nombre.
- **Los negativos pasan siempre**: ninguna falsa alianza en 12 pruebas, lo más grave. El método prefiere callar.
- El método es **conservador, no malo**: falla por defecto (silencio), no por exceso. Pero la regla fijada pedía una precisión del 90 % entre lo inesperado, y no la alcanza.

## Coste
Unas 58 parejas × 3 búsquedas de profundidad avanzada: unos 350 créditos de Tavily, repartidos entre 6 claves con el sistema de rotación, y unas 120 llamadas a modelos. Todo está en `world/out/web_cache.json` (ignorado por git), así que repetir una consulta no cuesta nada.

## Errores míos durante la tarea
- Cuatro pares de los controles de la v2 estaban ya buscados en la v1; lo vi antes de fijar el hash de la v2 y los sustituí.
- Un fallo de concurrencia en la caché (tres hilos escribían el mismo fichero temporal) hizo caer una ejecución de la v2; lo arreglé con un candado y un nombre único, sin tocar ninguna regla ni dato.
- Los hallazgos inesperados los juzgo yo con mi conocimiento, que no es una referencia independiente y puede fallar (por ejemplo, el estado actual de la sanción al juez brasileño).

## Opciones que quedan (decisión del usuario)
1. **Una v3 solo con asociación estratégica y libre comercio**, con controles nuevos fijados antes. Es la parte que ha demostrado precisión, pero la diseñaría a partir de datos ya vistos, así que necesita pares nuevos y puede volver a fallar.
2. **Usar lo que salga como pistas con fuente** para revisión humana, sin validar (precisión estimada 85–90 %), etiquetado así en la hoja. Es una decisión de método, no mía.
3. **Fase 2 con datos** (voto en la ONU, visados, UCDP) que cubre muchas más filas sin depender de titulares.
