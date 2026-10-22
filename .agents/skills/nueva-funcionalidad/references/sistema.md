# Partes del sistema y reglas de alineación

Punto de partida para el mapa de alineación. Viene de conversaciones anteriores de William, **no de leer el repositorio hoy**: el estado de cada parte es **Evidencia insuficiente** hasta que lo compruebes en el código o William lo confirme. Si tienes acceso al repo, verifica antes de afirmar que algo existe o está terminado. Usa siempre los nombres de abajo, nunca números de módulo.

## Partes

| Parte | Qué hace | Nota |
|---|---|---|
| Scorecard de 108 criterios | Puntúa cada empresa del S&P 500 en 8 categorías (75 % núcleo, 25 % precursores) | Es el score de empresas |
| Valoración P/IV15 | Valor intrínseco a 15 años a partir de beneficios del propietario | Parte del scorecard |
| Análisis forense ("Fiscal AI") | Calidad contable y señales de alerta en estados financieros | En el plan del MVP iría gratis (**Hipótesis** de William) |
| Diagnóstico macro | Ciclos de deuda y fragilidad sistémica | Contexto del sistema |
| Grafo de inversión | Relaciones entre empresas, eventos y riesgos en Neo4j | |
| Terminal predictivo Monte Carlo | Simulación para estimar el movimiento a 1-3 meses | Es la meta final del sistema |
| Calibración y backtesting | Mide con Brier si una señal discrimina sobre ~200 eventos de más de 5 % | Condición para que algo entre al score |
| Reacción a noticias | Cómo el mercado responde a una noticia | |
| Atención y hype de mercado | Mide cuánta atención tiene una empresa | |
| Movimiento esperado por opciones | Lo que descuentan las opciones | |
| Régimen de crédito (bonos) | Filtro de contexto: holgado, neutral o tensionado | Nuevo. No entra al score. Sin probabilidad numérica en el MVP (decisión del 2026-10-11) |
| Detector de lo no visto | Brecha entre lo que el mercado percibe y la realidad | Módulo **separado** del de bonos |
| Sentimiento retail | Opiniones de inversores minoristas en redes | En el plan del MVP iría de pago (**Hipótesis**) |
| Comparador de cobertura de noticias | Idea tipo Ground News / AllSides | Idea |
| Señales de capital humano | Liderazgo, plantilla, sucesión | Idea |
| Demanda digital | Tráfico y audiencia (Similarweb) como dato alternativo | Idea |
| Riesgo exógeno | Eventos externos al "snapshot" de la empresa | Exploración |
| Orquestación | Pipeline en TypeScript; se evalúa mover disparadores y llamadas a n8n | Decisión abierta |

## Dos sistemas

William separa el trabajo en **Equity system** (todo lo de arriba) y **Global system** (el proyecto del globo geopolítico, una visualización 3D aparte del análisis de acciones). Cada ficha pertenece a uno; el campo es `sistema`. Cómo se relacionan ambos (si el global alimenta al diagnóstico macro del equity, por ejemplo) es **INFORMACIÓN INCOMPLETA**: pregúntalo cuando aparezca una ficha que toque los dos.

## Reglas de alineación (para decidir "conectado" o "separado a propósito")

1. **Nada entra al score sin calibración.** Si la funcionalidad aporta una señal nueva, su conexión al score queda "separada a propósito" hasta que la calibración diga que discrimina.
2. **Contexto no es señal.** Un filtro de contexto se muestra, se registra por fecha y se testea; no mueve el score ni genera probabilidades.
3. **Registro por fecha.** Todo lo que se quiera testear después se guarda con la fecha en que pudo conocerse, para evitar sesgo de anticipación.
4. **Módulos separados se quedan separados.** Si una ficha dice que algo no debe conectarse con otra parte, la ficha lo anota en `separado_de`.
5. **Orden de trabajo.** Pregunta siempre: ¿esta funcionalidad cierra algo crítico que sigue incompleto (calibración, terminal predictivo, reacción a noticias, atención de mercado, movimiento esperado) o lo desplaza? Si lo desplaza, dilo claramente y deja la decisión a William.
6. **Monetización.** Compara con el plan de MVP: ¿va en la parte gratis (forense) o en la de pago (sentimiento)? Si no encaja en ninguna, marca "por decidir".

## Cómo escribir el mapa de alineación en la ficha

Tres listas cortas, cada una con sus etiquetas:

- **Depende de:** qué debe existir antes (ids del registro).
- **Alimenta:** qué meta del negocio y qué parte del sistema recibe su resultado.
- **Separado a propósito de:** qué parte no debe tocar y por qué.
