# Banco de preguntas de opción múltiple

Usa AskUserQuestion. Máximo 4 preguntas por tanda, 2 a 4 opciones cada una, la recomendada primero con "(Recommended)". Pregunta solo lo que no puedas deducir de lo que William ya dijo. "Otra" siempre existe, así que no la añadas.

## Tanda 1: la meta (siempre primero)

**¿A qué meta contribuye esta funcionalidad?** (una opción)
- Seguidores: atrae o retiene gente.
- Investigación de mercado: te enseña qué quiere el mercado.
- Monetización: genera ingresos o justifica cobrar.
- Seguridad y riesgo de datos: reduce riesgo legal, de licencia o de calidad de datos.

Si responde "otra" o "ninguna": pregunta **¿La descartamos o le buscamos meta?**

**¿Alguna meta secundaria?** (multiselección, mismas opciones menos la principal)

**¿Cómo la va a usar la gente?** (una opción)
- Gratis, como puerta de entrada.
- De pago.
- Por decidir.

## Tanda 2: evidencia de demanda

**¿Qué evidencia real tienes de que el mercado la quiere?** (una opción; decide la etiqueta)
- Personas que lo pidieron con sus palabras (puedo citarlas): sube a Hecho.
- Lo he visto en foros o redes, pero sin cita guardada: Inferencia.
- Es una intuición mía: Hipótesis.
- Ninguna todavía: Evidencia insuficiente.

**¿Qué frustración resuelve hoy?** (una opción)
- Pierden dinero o toman malas decisiones por no tenerlo.
- Pierden tiempo haciéndolo a mano.
- Pierden confianza en la información.
- No lo sé aún.

## Tanda 3: encaje y alcance

**¿A qué sistema pertenece?** (una opción)
- Equity system: análisis de empresas, score, forense, predicción.
- Global system: el proyecto del globo geopolítico.
- Toca los dos (pregunta cuál es el principal; la ficha va en ese).

**¿En qué parte de la arquitectura de agentes vive?** (multiselección, solo si pertenece a equity; se registra como texto, el tablero ya no tiene esos nodos)
Opciones de la arquitectura que William tenía dibujada: agentes (financiero, inteligencia digital, atención y sentimiento, eventos, competitivo, casos históricos, contradicción, validación), fuentes (SEC, redes y noticias, eventos y macro, búsqueda web), motores (grafo causal, estadística y backtests, Monte Carlo) o "ninguna todavía".

**¿Dónde va la interfaz?** (una opción)
- Área dev: solo yo, con las rutas de API protegidas igual.
- Pública: la ve cualquier usuario.
- No lleva interfaz (exige justificación).

**¿Qué estado tiene hoy?** (una opción): Idea / En construcción / Terminada / Descartada.

**¿Se conecta al score de empresas?** (una opción)
- No, es contexto (Recommended si no está calibrada).
- Sí, pero solo después de calibrar.
- Sí, desde ya (pregunta qué prueba lo respalda).

**¿Desplaza algo crítico que sigue incompleto?** (una opción): Sí, desplaza / No, es independiente / No lo sé.

## Tanda 4: éxito y ejecución

**¿Cómo mediremos que contribuyó a la meta?** (según la meta elegida)
- Seguidores: nuevos suscriptores, retención, alcance de una publicación.
- Investigación de mercado: número de entrevistas o señales recogidas, preguntas respondidas.
- Monetización: conversiones, pruebas de pago, disposición a pagar declarada.
- Seguridad y riesgo de datos: fuentes con licencia verificada, errores de datos detectados, tiempo caído.

**¿Cuánto plan quieres correr en segundo plano?** (una opción)
- Una fuente o paso por vez, con un commit cada uno (Recommended).
- Todo de golpe.
- Solo el plan, sin ejecutar.

## Pregunta de ambigüedad abierta

Estas preguntas se hacen una sola vez, y se guarda la respuesta en el registro para no repetirlas:

**Seguridad y riesgo de datos: ¿qué significa para ti?** (una opción)
- Riesgo de las fuentes de datos: licencias, límites, sesgo de anticipación.
- Seguridad informática: acceso, secretos, protección de datos de usuarios.
- Ambas.
- Riesgo financiero de las inversiones.
