# Qué modelo de IA usar para implementar

La pregunta de William: ¿basta Claude Sonnet para planear y Gemini 3.8 para ejecutar en Antigravity, o hace falta un modelo más potente por la complejidad (por ejemplo, extracción de datos)?

## Lo que se sabe (verificado el 2026-10-22, vuelve a comprobar: cambia rápido)

- **Hecho:** Gemini 3.8 Flash existe y está en versión estable desde septiembre de 2026, con contexto de aproximadamente 1 millón de tokens y soporte de llamadas a funciones y ejecución de código. Es el modelo por defecto del agente de Antigravity.
- **Hecho:** Antigravity tiene versión de escritorio/CLI (2.x) y el IDE original; según fuentes de terceros admite también modelos de otros proveedores, incluido Claude. Revisa el panel de ajustes para la lista real.
- **Evidencia insuficiente:** no hay comparación fiable de estos modelos para la tarea de William (parsers frágiles, extracción de varias fuentes, XBRL). Cualquier afirmación de "este basta" o "este no basta" sería opinión.

## Criterios para recomendar (Hipótesis hasta probarlos)

Puntúa la funcionalidad en cuatro ejes; cuantos más altos, más capaz el modelo que planifica y verifica:

| Eje | Alto significa |
|---|---|
| Error silencioso | Un fallo no se nota (licencias, sesgo de anticipación, parsers que devuelven ceros) |
| Fragilidad de datos | Formatos que cambian sin aviso, XML, CSV, XBRL |
| Decisión de diseño | El esquema o la arquitectura es difícil de cambiar después |
| Contexto necesario | Hay que leer mucho código o muchos documentos a la vez |

Regla de partida (**Hipótesis**):

- **Planificar y verificar:** el modelo más capaz que puedas pagar cuando hay error silencioso o decisión de diseño difícil de revertir.
- **Ejecutar:** un modelo más barato y rápido (por ejemplo Sonnet o Gemini 3.8 Flash) **solo si** el plan trae una prueba por paso (fixtures reales, caso de formato roto). Sin esas pruebas, el modelo barato falla sin que lo notes.
- **Verificador distinto del ejecutor:** el que revisa no debe ser el que escribió.
- **Corto y claro, no extenso:** las tareas con pocas partes y pruebas fáciles no necesitan el modelo más caro.

## Prueba para decidir con datos (cuando importe)

1. Elige una fuente acotada (por ejemplo, el cliente de Treasury del mercado de bonos).
2. Dale al **mismo plan** a dos configuraciones: A (planificador capaz + ejecutor barato) y B (todo con el modelo más capaz).
3. Compara con lo objetivo: pruebas que pasan, errores que el verificador encuentra, tiempo y coste, y si el formato roto falla con error claro.
4. Anota el resultado en `por_investigar` y cambia la etiqueta de Hipótesis a Hecho solo para ese tipo de tarea.

## Cómo escribirlo en la ficha

```
modelo: {
  planificador: <modelo>, ejecutor: <modelo>, verificador: <modelo distinto>,
  razon: "error silencioso alto, fragilidad alta -> planificador capaz; ejecutor barato con pruebas por paso",
  etiqueta: "Hipótesis"
}
```
