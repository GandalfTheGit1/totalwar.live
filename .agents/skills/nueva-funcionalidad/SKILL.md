---
name: nueva-funcionalidad
description: Define, puntúa y mapea cada funcionalidad nueva del Oráculo de Caja Transparente (v0-equity-analysis-with-buffett) y de World Geopolitical Engine. Trigger con /nueva-funcionalidad o /nueva funcionalidad. Genera la ficha (qué es, qué permite hacer, a qué meta contribuye), el mapa de alineación con el resto del sistema, la demanda de mercado de 0 a 10, el plan de implementación en dos capas, el modelo de IA recomendado y la lista de cosas por investigar; al cerrar la ficha la lleva a Figma. Úsala siempre que William hable de una funcionalidad, módulo, fuente de datos, pantalla o idea nueva del proyecto, quiera saber cómo encaja en el sistema o qué métrica del negocio mueve, pida priorizar, planificar o preparar un prompt para un agente de código, o pida actualizar el mapa en Figma, aunque no diga la palabra "ficha".
---

# Ficha de funcionalidad del Oráculo

## Para qué existe esta skill

El proyecto crece rápido y cada funcionalidad nueva compite por el mismo tiempo. Sin un registro, nadie (ni William ni la IA que implementa) sabe si lo que se construye mueve alguna meta del negocio, con qué se conecta, ni qué parte es evidencia y qué parte es intuición.

La regla que manda sobre todo lo demás es la de William: **toda funcionalidad responde "¿a qué meta contribuye esto?". Si no contribuye a ninguna, no vale nada.** Una ficha sin meta no se da por definida, no pasa a Figma y no recibe plan de implementación.

## Cómo hablar con William

- Español. Directo, por puntos, con un ejemplo concreto. Si pide "más corto", acorta.
- Nombres claros, nunca códigos internos ni siglas tipo "F1" o "M41". Habla de "el módulo de calibración", no de su número.
- Etiqueta cada afirmación con su categoría: **Hecho / Inferencia / Hipótesis / Suposición / Evidencia insuficiente / INFORMACIÓN INCOMPLETA**. Cuando falta un dato, dilo con la etiqueta; no pongas un cero ni inventes.
- Las preguntas suelen tener respuestas obvias, así que hazlas **de opción múltiple** con AskUserQuestion (2 a 4 opciones, la recomendada primero, hasta 4 preguntas por tanda). Banco de preguntas en `references/preguntas.md`. Si la herramienta no está disponible, usa opciones numeradas en texto.
- Si decide con poca información, termina con la lista de **cosas por investigar**.

## Flujo (en este orden)

1. **Localiza el registro.** Es un archivo `registro-funcionalidades.json` (formato en `assets/ejemplo-registro.json`). Búscalo en el repositorio (`docs/`) o en los documentos del Project (`claude/registro-funcionalidades.json`). Si no existe, créalo con la lista vacía y dilo. Antes de crear una ficha nueva, mira si ya existe una parecida: actualiza, no dupliques.
2. **Pregunta la meta primero** (opción múltiple). Metas disponibles: Seguidores, Investigación de mercado, Monetización, Seguridad y riesgo de datos, y "ninguna todavía". Si elige ninguna, no avances: pregunta si la descarta o le busca meta. Más preguntas: ver `references/preguntas.md`.
3. **Mapea el sistema.** Primero, ¿a qué sistema pertenece: **equity** (análisis de empresas) o **global** (proyecto del globo geopolítico)? Es el campo `sistema` y decide en qué sección de Figma se dibuja. Anota también `parte_arquitectura` (nodos del tablero de arquitectura donde vive), que se registra pero aún no se dibuja. Lee `references/sistema.md`. Decide con qué partes se conecta, de cuáles depende y qué debe quedar **separado a propósito** (por ejemplo, que no entre al score). Comprueba también si desplaza trabajo crítico que sigue incompleto.
4. **Puntúa la demanda de mercado** con la rúbrica de abajo. Sin evidencia, la nota es baja, y eso es información útil, no un fallo.
5. **Define la UI.** Es obligatoria: ¿área dev o pública?, ¿qué pantallas? Solo se admite "sin interfaz" con una justificación escrita.
6. **Define cómo se mide el éxito** (`metrica_exito`): qué se mide, qué umbral y en qué plazo. Cada meta tiene su forma de medirse; ver `references/preguntas.md`.
7. **Recomienda el modelo de IA** por tarea, según `references/modelos-llm.md`. Siempre como **Hipótesis** hasta probarlo.
8. **Escribe el plan de implementación** en dos capas, según `references/plan-implementacion.md`. Solo si la ficha pasa la validación.
9. **Guarda en el registro y valida:**
   `python scripts/registro.py validar registro-funcionalidades.json --id <id>`
   Sin errores = ficha **definida**.
10. **Figma.** Cuando la ficha está definida, ofrece actualizar el mapa en el tablero FigJam "Equity Platform — Agent Architecture" (el archivo de `assets/config.json`, no uno nuevo); ver `references/figma.md`, que explica el estado del tablero (vacío hoy, con dos secciones previstas: equity y global) y cómo dibujar sin pisar nada que se haya añadido después. Para ver el conjunto: `python scripts/registro.py resumen registro-funcionalidades.json`.

## Qué entregarle a William (dos capas)

**Capa 1: "¿Me entendí bien?"** Va en el chat. Máximo unas 10 líneas, legible en 30 segundos:

- Qué es, en una frase.
- Qué te permite hacer (1-3 frases que empiezan por "Con esto puedo…").
- Meta principal y cómo se mide.
- Demanda de mercado: nota/10 y la etiqueta de evidencia más débil.
- Con qué se conecta y qué queda separado a propósito.
- Estado, dónde va la UI.
- Las 2-3 decisiones o suposiciones que más cambian el resultado.

Si William ve aquí algo mal, el error está en cómo lo entendiste; corrígelo antes de seguir.

**Capa 2: el detalle.** Extensa. Va en el archivo (plan, ficha completa, lista por investigar), no en el chat. Estructura de la ficha en `references/plan-implementacion.md`.

## Rúbrica de demanda de mercado (0 a 10)

10 significa: el mercado **lo pide expresamente**, **es una frustración actual** y **les conviene**. Tres criterios sumados:

| Criterio | Puntos | Pregunta que lo decide |
|---|---|---|
| Lo piden expresamente | 0-4 | ¿Hay personas reales pidiéndolo con sus palabras (posts, entrevistas, tickets, búsquedas)? |
| Es una frustración actual | 0-3 | ¿Hoy sufren un problema por no tenerlo (pierden tiempo, dinero o confianza)? |
| Les conviene | 0-3 | ¿Mejora su resultado y pagarían o lo usarían de forma recurrente? |

Cada criterio lleva una etiqueta de evidencia y una fuente. La etiqueta pone un **techo** a los puntos: Hecho 100 %, Inferencia 60 %, Hipótesis 40 %, Suposición 40 %, Evidencia insuficiente 0 %. Así no sale un 10 por entusiasmo. Pesos y techos son **Suposición** y viven en `assets/config.json`.

Sin ninguna señal real de usuarios, la nota honesta es 0-2 con "Evidencia insuficiente", y la lista por investigar debe decir cómo conseguir esa evidencia (a quién preguntar, qué buscar). No es lo mismo que el interés de William por la idea.

## Metas y cómo se ven en Figma

Figma solo tiene cuatro dimensiones para codificar información. Esta es la asignación elegida por William:

| Dimensión | Representa |
|---|---|
| Color | Meta principal: verde Seguidores, azul Investigación de mercado, naranja Monetización, rojo-naranja Seguridad y riesgo de datos, gris Sin meta |
| Tamaño | Número de dependencias (de cuántas otras funcionalidades depende) |
| Forma | Estado: círculo idea, rectángulo redondeado en construcción, rectángulo terminada, hexágono descartada |
| Conexiones | Línea continua "depende de"; línea punteada "alimenta una meta" |

La demanda 0-10 no tiene dimensión visual: va escrita en la etiqueta del nodo. "Separado a propósito" no se dibuja; se escribe en la ficha.

## Reglas que no se negocian

- Nada nuevo entra al score de las empresas sin pasar por calibración. Mientras no esté calibrado es **Hipótesis**, y la interfaz debe decirlo.
- Contexto no es señal: si una funcionalidad es filtro de contexto, la ficha dice que no predice precios.
- No inventes evidencia de demanda, fuentes, cifras ni términos de uso. Marca **INFORMACIÓN INCOMPLETA** o **Evidencia insuficiente**.
- Los umbrales van en archivos de configuración, marcados como Suposición.
- Si la ficha cita datos de terceros (licencias, límites de uso), esa fila va a la lista por investigar hasta verificarla con la fuente.

## Cosas por investigar que siempre acompañan a una ficha nueva

Revisa si aplican y añade las que falten:

- ¿Hay evidencia real de demanda o solo intuición propia?
- ¿La meta elegida se puede medir con algo que ya existe?
- ¿Qué licencias o términos de uso tienen los datos que usa?
- ¿Se puede testear con calibración, o se quedará como Hipótesis para siempre?
- ¿Desplaza trabajo crítico que sigue incompleto?
- ¿Qué modelo de IA conviene según los resultados de una prueba real, no según opinión?

## Archivos de la skill

- `scripts/registro.py`: validar, resumir y generar el diagrama (solo biblioteca estándar).
- `assets/config.json`: metas, colores, tamaños, pesos y techos.
- `assets/ejemplo-registro.json`: ejemplo de formato con datos de prueba (no son evidencia).
- `references/sistema.md`: partes del sistema y reglas de alineación.
- `references/preguntas.md`: banco de preguntas de opción múltiple.
- `references/plan-implementacion.md`: ficha completa y plan en dos capas, listo para correr en segundo plano.
- `references/modelos-llm.md`: criterios para elegir modelo y cómo probarlo.
- `references/figma.md`: pasos para llevar el mapa a Figma.
