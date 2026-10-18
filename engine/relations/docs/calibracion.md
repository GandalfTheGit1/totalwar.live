# Calibración histórica del modelo de puntuación (2026-10-18)

## Qué se hizo y qué NO demuestra
- **Episodios:** España–Marruecos 2020–2023 (crisis de Ceuta y reconciliación) e India–Canadá 2023–2026 (caso Nijjar, expulsiones y deshielo).
- **Fuentes:** cuatro artículos de Wikipedia (revisiones registradas en `anchors.py`); la fecha de regreso de la embajadora marroquí (20-03-2022) se verificó con DW, Antena 3, Atalayar y North Africa Post.
- **28 anclas** (12 + 16): bandas esperadas, caídas o recuperaciones mínimas y sentido de la tendencia en fechas concretas. Los **hechos y fechas** son documentados; las **magnitudes esperadas son mi criterio**. Se congelaron con hash (`aa53ab1b…`) antes de extraer o puntuar nada.
- **48 hechos** etiquetados a mano (código, actor, nivel, interés central) y congelados con hash (`4fbe8ba7…`) antes de ejecutar ningún clasificador. 14 etiquetas se marcaron como ambiguas.
- **Límite:** las anclas y las etiquetas son mías, no una verdad independiente. Una trayectoria que las cumple es *coherente con mi lectura de la historia*, nada más.

## Resultado 1: los parámetros actuales no necesitan cambios
Con la clasificación manual, los parámetros por defecto cumplen las **28 anclas (pérdida 0)**. La rejilla de 270 combinaciones deja **82 que cumplen las anclas de los dos episodios**; los valores por defecto están dentro. Qué restringen las anclas:

| Parámetro | Rango que cumple las anclas | Por defecto |
|---|---|---|
| Escala de puntos (todos los hechos) | 0,8 a 1,5 (0,6 rompe India–Canadá; 2,0 rompe España–Marruecos) | 1,0 |
| Escala de vidas medias | desde 0,75 en adelante (0,5 rompe ambos); **sin cota superior** | 1,0 |
| Saturación de la parte dinámica | 40 a 60 (90 rompe India–Canadá) | 60 |
| Peso de lo anunciado | **no restringido** (0,25 a 0,6 dan lo mismo) | 0,4 |

Con el criterio fijado de antemano (cambiar solo si mejora también el episodio de validación) no hay cambio que justificar. Holguras estrechas con los valores actuales: la ancla «octubre de 2024 no es mejor que el primer mínimo» (+2 puntos de margen) y «sin recuperación espontánea» (+4).

**Lo que la calibración no puede decir:** el peso de lo anunciado y el límite superior de las vidas medias no están identificados. Hacen falta anclas sobre rupturas muy persistentes y recuperaciones lentas.

## Resultado 2: elección del modelo B
Cada B se combinó con el mismo A (Gemini 2.5 Flash) y el mismo juez; dos corridas de A × dos de B.

| B | Código exacto | Nivel del actor | Pérdida en anclas | Violaciones | Estabilidad entre corridas (B solo) |
|---|---|---|---|---|---|
| **Groq Qwen3.8-27B** | 0,72 | **0,81** | **22,1** | **2** | 100 % idéntico |
| Cohere command-a | 0,69 | 0,63 | 29,4 | 3 | 94 % |
| Gemini 3.5 Flash Lite | 0,73 | 0,68 | 27,5 | 3 | 90 % (misma familia que A) |
| Nemotron (OpenRouter) | 0,71 | 0,69 | 34,8 | 4,5 | 81 %, 570+ s |
| gpt-oss-120b (Groq) | no evaluado: cuota diaria agotada | | | | |

- **El acierto de código no distingue a los modelos** (intervalos de bootstrap sobre 48 hechos incluyen 0).
- **Sí hay diferencia en nivel del actor:** Qwen supera a Cohere en +0,21 (intervalo del 95 %: +0,08 a +0,33), a Gemini Lite en +0,17 y a Nemotron en +0,15.
- Las diferencias en la pérdida de anclas salen de pocas anclas (la tendencia de julio de 2025 y el orden de octubre de 2024) y **no están contrastadas estadísticamente**.
- **La varianza de A pesa más que la elección de B:** A solo cambia de 31 a 66 puntos de pérdida entre dos corridas idénticas. La reconciliación con B la reduce a una banda de 22 a 38.

**Decisión:** B = Groq Qwen → Cohere → Gemini Flash Lite (marcado como independencia degradada). Nemotron queda fuera. Confianza moderada: Qwen es mejor en nivel del actor con significación estadística y es el más estable, pero la ventaja en código y trayectoria no es concluyente.

## Hallazgos sobre el modelo (más importantes que la elección de B)
1. **Los errores son sistemáticos, no aleatorios:** solo 22 de 48 hechos los acierta toda la batería, y los peores los fallan casi todos igual.
   - *Despliegues defensivos en la frontera* (Ceuta, Melilla): 7 de 9 salidas dicen `MILITARY_PRESSURE`; deberían ser NONE. Falta una regla en el prompt.
   - *Suspensión de visados y pausa de negociaciones comerciales*: los modelos las leen como `TRADE_RESTRICTION` o `SANCTIONS_TARGETED` (−12) y mi etiqueta es −5/−8. Falta un código propio.
   - *Reunión Carney–Modi (junio de 2025)*: los 9 la etiquetan como `SIDELINES_MEETING` (+2) y yo como `SUMMIT` (+10). Por eso falla la ancla de tendencia de julio de 2025 con B realista. **El catálogo no distingue la primera reunión de líderes tras una ruptura de una reunión rutinaria**: su valor depende del estado de la relación.
   - *Ingreso de Ghali en España* y *listado de la banda Bishnoi*: mis etiquetas son interpretaciones que ningún modelo comparte; el hecho no contiene la lectura hostil.
2. **El resultado es robusto a la extracción:** con solo los hechos extraídos automáticamente (sin mis 7 añadidos) las etiquetas oro dan pérdida 0 y 0,3. La extracción de dos pasadas ya es casi suficiente para estos episodios.
3. **Regla de estados con hueco:** la retirada de un alto comisionado por expulsión (India–Canadá, octubre de 2024) no genera `AMBASSADOR_ABSENT`; esa regla solo mira `AMBASSADOR_RECALL`.

## Ediciones manuales a los datos (todas marcadas en los ficheros)
- Eliminado un hecho inventado por el modelo («España llamó a consultas al embajador marroquí»; el titular dice que lo hizo Marruecos) y corregido el tipo del hecho real (retirada de la embajadora: ejecutada, no anunciada).
- Fechas de la visita de Carney a India y de los memorandos: 2026-02 («principios de 2026» en el texto).
- Añadidos 3 hechos de España–Marruecos y 4 de India–Canadá citados en las fuentes (indicados con `manual` y su origen).

---

# Ronda 2: arreglos del catálogo y episodio reservado (18-10-2026)

## Cambios al modelo (todos con pruebas sin red)
| Hueco | Arreglo |
|---|---|
| Refuerzo defensivo de la propia frontera leído como presión militar (7 de 9 salidas) | Regla en el prompt y en la etiqueta de `MILITARY_PRESSURE`: es NONE |
| Visados y pausa de negociaciones leídos como aranceles o sanciones (−12) | Códigos nuevos `VISA_RESTRICTION` (−8, vida media 120 d) y `TALKS_SUSPENDED` (−6, 90 d), con regla en el prompt |
| La primera reunión de líderes tras una ruptura valía como una rutinaria (+2) | **Regla de reinicio** causal: contacto ejecutado a nivel de jefe de Estado o de Gobierno, tras una ruptura ejecutada de los últimos 730 días y sin otro contacto desde entonces, cuenta como cumbre (+10, 120 d) |
| La expulsión del alto comisionado no creaba `AMBASSADOR_ABSENT` | Regla derivada: expulsión de embajador, alto comisionado o encargado de negocios deja sin jefe la misión del otro país; la cancela una restauración posterior |

Los puntos de los dos códigos nuevos son decisiones de diseño mías, tomadas después de ver las etiquetas de estos episodios. Reetiqueté solo 3 hechos (`gold_v2.json`, hash `gold_v2.sha256`): la pausa de negociaciones, el aplazamiento de la misión comercial y la suspensión de visados, que antes no tenían código propio.

## Dentro de la muestra (mismos dos episodios, anclas sin cambios)
- Clasificación manual: pérdida 0 y 0 violaciones sobre 28; margen mínimo en India–Canadá pasa de +2 a +6 y las combinaciones de parámetros que cumplen los dos episodios, de 82 a 87.
- Pipeline realista (A + B + juez, 2×2 corridas): pérdida en anclas Qwen 0,0 (antes 22,1), Gemini Lite 0,0 (27,5), Cohere 0,9 (29,4). Acierto de código 0,76–0,79 (antes 0,69–0,73). A solo: 0,0 y 0,0 entre corridas (antes 31 y 66).
- **Esto es una mejora dentro de la muestra**: las correcciones salieron de mirar estos errores. La distancia a la curva «oro» sigue siendo de 15–17 puntos de RMSE, así que cumplir las anclas es un listón tolerante.

## Episodio reservado: Australia–China 2020–2024 (anclas congeladas antes de puntuar)
Hash de las anclas `ce9ce7b2…`, de las etiquetas `7f61d758…`. Modelo, catálogo y parámetros congelados antes de mirarlo.

| Con clasificación manual y parámetros por defecto | |
|---|---|
| Anclas cumplidas | **9 de 14** (pérdida 119,5) |
| Cumple | caída de 2020, nivel de 2020, deshielo de 2023, nivel de 2024, tendencias de 2020 |
| Falla | R(2021-12-31) = +9 (esperado ≤ −30); R(2022-06-30) = +28 (esperado ≤ −15); la regla de no recuperación sin contacto; la tendencia de finales de 2022 (estable en lugar de mejorando); la recuperación 2022–23 por 0,7 puntos |
| Con A + B + juez (4 combinaciones) | pérdida 97–167 con Qwen y 114–123 con Cohere, 4–5 violaciones |

Los fallos son los que había anotado como riesgo antes de puntuar: la coerción de China fue **unilateral y duró hasta 2023–24**, pero el modelo trata cada veto o arancel como un evento que decae (vida media de 180 días) y la regla de guerra comercial exige represalia de ambos lados; además la regla de reinicio solo reconoce rupturas diplomáticas, así que el encuentro de Bali no cuenta como reinicio. **No es un problema de parámetros ni del clasificador**: ocurre con etiquetas perfectas.

Clasificación fuera de muestra (40 hechos): acierto de código 0,82–0,88; Qwen y Cohere iguales en código (0,85 frente a 0,82 en bruto); nivel del actor en bruto 0,80 frente a 0,65, diferencia +0,15 con intervalo [0,00, +0,30] (en el límite). Todos los clasificadores recuperan 0 de 2 hechos sin efecto en bruto.

## Los 5 pares de hoy, antes y después
| Par | Antes de los arreglos (2 corridas) | Después (2 corridas) | Estado |
|---|---|---|---|
| España–Marruecos | −35 / −32 | −32 / −30 | Tensa, empeorando |
| España–Israel | −35 / −35 | −31 / −31 | Tensa, estable |
| EE. UU.–China | +13 / +12 | +15 / +13 | Neutral, mejorando |
| India–Canadá | +28 / +28 | **+13 / +13** | Neutral, estable |
| Mongolia–Senegal | 0 / 0 | 0 / 0 | Sin datos |

India–Canadá baja 15 puntos por un efecto no deseado de la regla nueva: el alto comisionado expulsado en octubre de 2024 sigue contando como ausente porque la lista de hechos de producción (60 días de noticias más historia) no incluye la restauración de agosto de 2025. Con ese único hecho añadido el resultado sería **+25,0**. No cambié la puntuación; la salida lleva un campo `warnings` que lo avisa. La espera con reintento se activó por primera vez con datos reales (España–Israel, corrida 2).

## Seguimientos recomendados (cada uno necesita un episodio reservado nuevo para validarse)
1. **Medidas en vigor como estados:** un veto, arancel o sanción creado por un acto debería persistir como estado hasta un acto de levantamiento (`DE_ESCALATION`, `SANCTIONS_LIFTED`, «reanudó las importaciones»), igual que ya se hace con las sanciones del proyecto, y no depender de que haya represalia del otro lado.
2. **Reverificar estados derivados antiguos** (embajador ausente, medida en vigor) con una búsqueda dirigida antes de contarlos.
3. **Ampliar la regla de reinicio** a rupturas económicas, y plantear hasta dónde llega la idea de «sorpresa» (el valor de un hecho depende del estado previo de la relación).
4. **Hechos sin efecto:** los clasificadores casi nunca devuelven NONE; probar una pregunta previa de relevancia o más ejemplos negativos.
5. **Cobertura de la extracción:** la segunda pasada no recuperó dos hechos documentados del texto (visita del ministro de Comercio, encuentro con Li Qiang).

---

# Ronda 3: medidas en vigor, reverificación y episodios reservados (18-10-2026)

## Qué se añadió (diseño fijado antes de ver ningún resultado del caso de desarrollo)
| Pieza | Descripción |
|---|---|
| **Medidas en vigor** (`measures.py`) | Los hechos ejecutados de aranceles, vetos, controles de exportación, sanciones, cortes de suministro, vetos a inversiones y restricciones de visados crean el estado `MEASURES_IN_FORCE` (−30 a intensidad completa, que se alcanza con 24 de peso: 6 por medida, 24 las sanciones amplias, 4 los visados) hasta que un acto los levanta; levantada, se desvanece en un año. El emparejamiento medida–levantamiento lo hace un modelo y se valida por código (fecha posterior, actor compatible); heurística léxica de reserva. Sustituye a la regla anterior de guerra comercial derivada, que exigía represalia de ambos lados. |
| **Relaciones cortadas** | `RELATIONS_SEVERED` crea `NO_RELATIONS` hasta una restauración o normalización posterior, sustituye a `FULL_DIPLOMATIC` y evita contar además `AMBASSADOR_ABSENT`. |
| **Reverificación** (`verify_states.py`) | Todo estado derivado de un hecho de más de 12 meses se busca en la web; un modelo juzga los fragmentos y el código comprueba que su cita literal está en el fragmento. Se aplica por lado. Desconocido ⇒ peso a la mitad del lado afectado, con aviso. |

Pruebas sin red: unas 60 comprobaciones (medidas y su emparejamiento, validación de citas, verificación por lado), todas pasan; una falló al principio por un error de mi propio test (la heurística emparejaba correctamente) y otra por contaminación de la caché entre pruebas, y se corrigieron los tests, no el código.

## Controles reales de la reverificación
| Caso | Esperado | Resultado |
|---|---|---|
| España–Marruecos, embajadora retirada en 2021 | levantado, marzo de 2022 | desconocido; **tras mejorar las consultas** (usó el texto del hecho original): levantado, 2022-03 |
| India–Canadá, alto comisionado expulsado en 2024 | levantado, agosto de 2025 | levantado, 2025-08 (29-08 en la producción) |
| Arancel australiano al vino (2020) | levantado, marzo de 2024 | levantado, 2024-03-29 |
| Canadá–Arabia Saudí (2018), caso **nuevo** | levantado, mayo de 2023 | levantado, cita real de Reuters, sin fecha en el fragmento: se anula el estado sin inventar un evento |
| Embargo de EE. UU. a Cuba | sigue vigente | **desconocido** (fallo) |
| Expediente inventado (Mongolia–Senegal) | desconocido | desconocido (dos veces) |

Ningún falso «levantado». El fallo es no poder confirmar que algo sigue vigente.

## Validación: caso de desarrollo y dos episodios reservados
El código se congeló con hash (`code_freeze.sha256`, 12:24Z) antes de leer los episodios reservados; el cableado de producción, la acción por lado de la reverificación y `sideDates` se añadieron **después** de esas validaciones (cubiertos por pruebas unitarias, sin revalidar).

| Episodio (anclas, etiquetas) | Etiquetas manuales, modelo nuevo | Modelo anterior | Pipeline realista nuevo (Qwen / Cohere) | Pipeline realista anterior |
|---|---|---|---|---|
| Australia–China 2020–24 (desarrollo; 14) | 9 cumplidas, pérdida 61,8 | 9, pérdida 119,5 | — | — |
| Arabia Saudí–Catar 2017–22 (reservado; 14; `b72e104b…`, `1d50df30…`) | 14 | 14 | 12 (pérdida 3–6) / 14 (0,0) | 10 / 10 |
| Japón–Corea del Sur 2019–23 (reservado; 13; `ad86ecbb…`, `a65920a4…`) | **11** (pérdida 30,0) | 8 (74,8) | 11–12 (pérdida 20–22) / 9–12 | 7–8 / 6 |

- **Catar no ejercitó las medidas**: la extracción juntó el bloqueo y la ruptura en un solo hecho y ningún clasificador lo codificó como medida; solo actuó `NO_RELATIONS`. Valida la ausencia de regresión y ese estado.
- **Japón–Corea del Sur sí las ejercita**: el emparejamiento ata los controles de exportación de 2019 con la restauración de la lista blanca del 23-03-2023; Corea no queda emparejada para su propia retirada de Japón de la lista blanca (queda en vigor), lo que infravalora algo la recuperación.
- **Fallos que quedan en Japón–Corea del Sur** (sin tocar nada): la ancla de criterio «sin gran recuperación» (R −21 en lugar de ≤ −41: los eventos decaen mientras el estado resta como máximo 30) y la tendencia de septiembre de 2020, que el modelo lee «mejorando» tras un gesto positivo documentado (Corea elimina aranceles antidumping en agosto de 2020) y yo esperaba «estable».
- **En Australia–China** persisten 5 fallos por magnitud: R(2021-12) = −20 frente a ≤ −30; el máximo de −30 de las medidas no compensa la base estructural de +30.

## Los 5 pares de hoy
| Par | Antes (2 corridas) | Ahora (2 corridas) | Cambio |
|---|---|---|---|
| España–Marruecos | −32 / −30 | **−36 / −42** | el corte de diésel (octubre de 2026) ahora cuenta como medida en vigor (−7,5); la corrida 1 usó Cohere como A por cuota |
| España–Israel | −31 / −31 | **−26 / −26** | el lado israelí de «embajador ausente» (mayo de 2024) no se pudo verificar y cuenta al 75 % del estado |
| EE. UU.–China | +13 / +13 | +13 / +13 | sin cambio (el proyecto ya declara guerra comercial) |
| India–Canadá | +13 / +13 | **+24 / +24** | la reverificación encontró la restauración de agosto de 2025 |
| Mongolia–Senegal | 0 / 0 | 0 / 0 | sin datos |

## Seguimientos
1. Calibrar la magnitud de las medidas en vigor con más de un caso (hoy el máximo de −30 deja la recuperación demasiado rápida); necesita un episodio reservado nuevo para validarse.
2. Que la extracción separe en hechos distintos el bloqueo y la ruptura (una regla «un acto por hecho» con ejemplos) y que el emparejamiento reconozca el levantamiento propio del actor (Corea).
3. Mejorar la confirmación de «sigue vigente» (el embargo a Cuba y el lado israelí quedan en desconocido).
4. Ampliar la regla de reinicio a rupturas económicas.


# Ronda 4: magnitud de las medidas en vigor (18-10-2026)

Resultado corto: **no se adopta ningún cambio.** La magnitud del estado (−30) no es la causa de la recuperación demasiado rápida; la ronda lo demuestra con los datos de desarrollo y el episodio reservado nuevo lo confirma, y señala dos causas distintas.

## Protocolo (fijado con hash antes de evaluar la rejilla: `protocol_magnitude.py`, `07c0774b…`)
- Casos de desarrollo: Australia–China (14 anclas) y Japón–Corea del Sur (13), con etiquetas manuales.
- Tres perillas globales: máximo del estado {30, 40, 50, 60}, vida media del desvanecimiento tras el levantamiento {180, 365, 730 d}, peso acumulado para intensidad completa {12, 24, 36}: 36 combinaciones.
- Selección: validación cruzada dejando un episodio fuera, con preferencia por la combinación más cercana a la actual entre las que empatan (±5 % o 2 puntos).
- Regla de adopción: (a) baja la pérdida en el episodio de prueba al menos 5 % en **ambos** sentidos; (b) la elección conjunta y las dos cruzadas coinciden en el máximo; (c) los 42 anclas de España–Marruecos, India–Canadá y Catar siguen sin violaciones; (d) la pérdida del pipeline realista (A + B + juez, 4 combinaciones, Qwen y Cohere) en los dos casos de desarrollo no sube.

## Resultado de la ronda 1 (36 combinaciones, etiquetas manuales)
| Combinación | Australia–China | Japón–Corea | Calibración y Catar |
|---|---|---|---|
| actual (30 / 365 / 24) | pérdida 61,8 (5 fallos) | 30,0 (2) | 0 |
| máximo 50 (365 / 24) | **38,4** (3) | 30,0 (2) | 0 |
| máximo 60, intensidad completa a 12 | 39,6 | 58,0 | 0 |
- La vida media del desvanecimiento no cambia nada salvo en 730 d (empeora Japón–Corea). El peso de saturación solo empeora o empata.
- **Subir el máximo mejora solo Australia–China y no mueve Japón–Corea**, así que la regla (a) falla en los dos sentidos. Además el pipeline realista de Japón–Corea **empeora** con máximo 50 (pérdida media 21,1 → 40,0 con Qwen, 16,3 → 39,0 con Cohere): condición (d) también falla.
- Diagnóstico de las anclas que siguen fallando: un estado más grande también hace el mínimo más profundo (Australia–China R(2020-12) pasa de −76 a −96), de modo que el criterio «sin gran recuperación» (R(final) − R(mínimo) ≤ 20) se sigue violando. **La recuperación sale de la caída de los eventos dinámicos** (vidas medias de meses) mientras la medida sigue en vigor, no del tope del estado.

## Enmienda A1 (escrita tras la ronda 1, antes de leer el episodio reservado; `protocol_magnitude_A1.py`, `44127ccf…`)
Hipótesis H2: mientras una medida está en vigor, su evento conserva al menos una fracción `holdFrac` de su valor inicial; levantada, ese valor decae con la vida media normal contada desde el levantamiento. Rejilla {0, 0,25, 0,5, 0,75} × máximo {30, 40, 50}, mismas reglas.
- La validación cruzada elige (holdFrac 0,5, máximo 30) en los dos sentidos: Australia–China 61,8 → 39,6 y Japón–Corea 30,0 → 20,0 con etiquetas manuales; las condiciones (b) y (c) se cumplen. La elección de Australia–China sale por un margen mínimo (distancia 0,500 frente a 0,511 de la alternativa), así que es frágil; la de Japón–Corea y la conjunta coinciden.
- **La condición (d) falla**: el pipeline realista de Japón–Corea sube (Qwen 21,1 → 49,8; Cohere 16,3 → 25,4) porque el valor retenido se libera despacio tras el levantamiento (R(2023-06) = −10 a +3 frente a ≥ 10) y una medida sin emparejar queda retenida para siempre. Mejora Australia–China (75,0 → 42,7 y 60,5 → 40,6).
- **Decisión por la regla: se queda el modelo actual** (holdFrac 0, máximo 30, 365 d, 24).

## Episodio reservado nuevo: Canadá–Arabia Saudí 2018–2023
Anclas (13; `anchors_canada.py`, `046d6871…`), etiquetas manuales (16 hechos; `gold_canada.json`, `89682481…`) y hechos (`facts_CASA_complete.json`) congelados antes de clasificar nada; el código se congeló con hash a las 12:46Z (nota en `code_freeze.sha256` sobre tres ficheros que cambiaron después de la congelación anterior, solo con añadidos fuera de la ruta de calibración). Fuente: «Canada–Saudi Arabia relations» (en.wikipedia, rev 1347094626). Es el caso para el que se eligió: expulsión del embajador y bloqueo de comercio e inversión nuevos que duran 4,7 años con casi ningún suceso, cerrados por un acto general (restablecimiento de lazos, mayo de 2023). Riesgos escritos antes: el artículo calla entre 2019 y 2022; el levantamiento no está fechado por separado.
Extracción: la primera pasada dio solo 7 hechos (los actos centrales de agosto de 2018 no traen día en el texto); una segunda pasada con la regla «si el texto no da día y el apartado trata de agosto de 2018, usa 2018-08» añadió 9 (16 en total). Es una limitación de la extracción, no del modelo.

| Resultado (modelo actual, sin cambios) | Valor |
|---|---|
| Etiquetas manuales | **9 de 13 anclas cumplidas**, pérdida 76,2 |
| Pipeline realista (A + Qwen + juez / A + Cohere + juez, 4 combinaciones) | pérdida media 78,0 / 80,4 (5–6 violaciones) |
Fallos con etiquetas manuales: R(2018-09) = −129 (la cota inferior esperada era −110; demasiado profundo); R(2019-06) − R(2018-09) = +36 frente a ≤ +30; R(2021-12) = −27 frente a mínimo −129 + 35 (recuperación de +102); y la tendencia de septiembre de 2021 sale «mejorando» en lugar de «estable». Cumple la caída de 2018, la banda de 2019 y de 2021, la recuperación de 2023 (+56) y la tendencia tras el restablecimiento.

**Causa nueva, que no es la magnitud de las medidas:** `AMBASSADOR_ABSENT` tiene un corte duro de 36 meses (`_d(f) >= months(36)`); con una congelación de 4,7 años el estado (−20) desaparece en agosto de 2021 y R salta de −93 a −27 por ese corte, junto con la caída de los eventos (S_din −51 → −4). Es el mismo tipo de corte duro que ya se retiró en `TRADE_WAR`. La reverificación debería ocupar su lugar, pero hoy solo reduce el peso, no sostiene el estado.

### Lectura diagnóstica (enmienda A2, `protocol_magnitude_A2.py`, `4da3c140…`; no es una adopción)
| | Etiquetas manuales | Realista Qwen | Realista Cohere |
|---|---|---|---|
| actual | 76,2 | 78,0 | 80,4 |
| C1 holdFrac 0,5 | 55,8 | 77,1 | 85,2 |
| C2 máximo 50 | 90,0 | 86,5 | 99,9 |
- Regla fijada antes: C1 solo cuenta como respaldada si baja ≥ 5 % tanto con etiquetas manuales como en la media realista. **No lo hace** (−27 % con etiquetas, −1 % con Qwen, +6 % con Cohere). C2 empeora en todo. H2 se descarta como solución simple: ayuda con etiquetas manuales y no sobrevive al ruido de la clasificación.

## Qué queda
1. Sustituir el corte de 36 meses de `AMBASSADOR_ABSENT` por un estado que dura hasta que haya una restauración (o la reverificación lo desmienta). Es un cambio nuevo: necesita su propio protocolo y un episodio reservado nuevo (Canadá–Arabia Saudí ya lo inspiró).
2. Si se retoma H2: que el valor retenido se libere por completo al levantar la medida, y que la medida sin emparejar no se retenga más de la vida del estado. Necesita casos nuevos; dos episodios de desarrollo ya se han usado dos veces.
3. Los seguimientos de la ronda 3 siguen abiertos (un acto por hecho en la extracción, emparejamiento del levantamiento propio, «sigue vigente», regla de reinicio para rupturas económicas).
4. Extracción: pedir al modelo que use el mes del apartado cuando el texto no da día (la segunda pasada lo hizo a mano).
