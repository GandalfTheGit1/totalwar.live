# Ficha completa y plan de implementación

Dos capas, porque William necesita primero comprobar rápido que la IA lo entendió y después tener todos los detalles. El plan se escribe para que un agente de código lo ejecute **sin supervisión**: todo lo que podría bloquearlo se resuelve antes.

## Cuándo escribirlo

Solo cuando `registro.py validar --id <id>` no da errores. Si hay errores, arréglalos primero: un plan sobre una ficha sin meta es trabajo tirado.

## Capa 1: resumen para confirmar (en el chat, máximo 10 líneas)

```
Qué es: <una frase>
Qué te permite: Con esto puedo <...>
Meta y medida: <meta> -> se mide con <...>, umbral <...> (Suposición)
Demanda de mercado: <n>/10 (evidencia más débil: <etiqueta>)
Se conecta con: <...> | Separado a propósito de: <...>
UI: <dev/pública> -> <pantallas>
Orden de ejecución: <paso 1, paso 2, paso 3>
Lo que más puede salir mal: <2-3 suposiciones>
```

Pregunta al final, con opción múltiple: **¿Esto es lo que querías?** (Sí, sigue con el detalle / Corrige esto / Falta algo).

## Capa 2: detalle (archivo `.md`, extenso)

Secciones, en este orden:

1. **Meta y contexto.** Meta del negocio, regla "contexto, no señal" si aplica, estado actual.
2. **Qué te permite hacer.** Lista completa de capacidades en lenguaje de usuario.
3. **Mapa de alineación.** Depende de / Alimenta / Separado a propósito, con la razón de cada línea.
4. **Demanda de mercado.** Los tres criterios con puntos, etiqueta y fuente. Qué evidencia faltaría para subir la nota.
5. **Métrica de éxito.** Qué se mide, umbral (Suposición), plazo, y cómo se registra el valor por fecha para testearlo después.
6. **Datos y riesgos.** Fuentes, licencias, frecuencia, sesgo de anticipación, qué pasa si una fuente se cae. Lo no verificado va como Evidencia insuficiente.
7. **Interfaz.** Pantallas, estados vacío/carga/error, accesibilidad, dónde vive (dev o pública) y cómo se protegen las rutas de API.
8. **Plan por pasos.** Ver abajo.
9. **Modelo de IA recomendado.** Planificador, ejecutor y verificador con la razón (ver `modelos-llm.md`). Etiqueta Hipótesis.
10. **Criterios de aceptación.** Verificables por prueba automática o por comprobación manual con datos reales (que el agente diga cuáles).
11. **Prohibido.** Lo que el agente no debe tocar (otras fuentes, el score, módulos separados, refactors no relacionados).
12. **Cosas por investigar.** Lista numerada, con quién o qué la resuelve.

## Plan por pasos (listo para segundo plano)

Cada paso es una unidad que se puede terminar, probar y confirmar sola. Plantilla por paso:

```
Paso N: <nombre claro>
Objetivo: <una frase>
Entradas: <qué necesita ya existir>
Hecho cuando: <prueba o comprobación concreta>
Pruebas: <fixtures reales, caso de formato roto que falle con error claro>
Commit: <un commit por paso>
Si se bloquea: <suponer y anotar; no parar, salvo decisión irreversible>
```

Reglas para que corra solo:

- **Explorar antes de escribir.** El agente mira el repo, reutiliza los patrones existentes y reporta lo que encontró antes de implementar.
- **Una fuente o unidad por vez**, de punta a punta, con un commit cada una.
- **Archivo de progreso.** El agente actualiza `PROGRESO.md` después de cada paso: qué terminó, qué verificó con datos reales, qué supuso, qué falló. Así William puede volver horas después y saber el estado.
- **Parada solo en decisiones irreversibles** o que cambian la meta. En el resto, el agente toma la lectura más razonable, la anota como **Suposición** y sigue.
- **No confiar en datos del plan.** URLs, formatos y límites del plan son Hipótesis hasta verificarlos con una petición real.
- **Verificación final por separado.** Lo que está en alto riesgo (licencias, sesgo de anticipación, backtest) lo revisa otro modelo o una pasada aparte que no vio cómo se produjo.
- **Informe final:** qué quedó funcionando, qué se verificó con datos reales (y cuáles), qué quedó como Suposición, y la lista de cosas por investigar.

## Formato del prompt para el agente de código

Si William quiere pegarlo en un agente, genera un único archivo `prompt-<id>.md` con: rol y contexto, meta (con la frase "contexto, no señal" cuando aplique), reglas de trabajo, el plan por pasos, reglas de datos, UI, prohibido, criterios de aceptación y entrega. Como referencia de estilo sirve el prompt de integración del mercado de bonos del Project.
