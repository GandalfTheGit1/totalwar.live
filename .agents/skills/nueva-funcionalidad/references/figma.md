# Llevar el mapa a Figma

## Archivo destino

Todas las actualizaciones van al tablero FigJam **"Equity Platform — Agent Architecture"** (`fileKey` en `assets/config.json`, bloque `figma`). No crees archivos nuevos por cada cambio.

## Estado del tablero (comprobado el 2026-10-22)

**Está vacío.** William borró las dos copias de la arquitectura de agentes que había (las dibujó con la herramienta de diagramas y no le servían). Hoy es un lienzo en blanco, así que el mapa de funcionalidades es lo primero que se dibuja. Antes de pintar, vuelve a leerlo con `get_figjam` sobre el nodo `0:1`: si William o alguien añadió algo, no lo pises.

## Decisiones de William (2026-10-22)

- **Dos secciones:** una para el **Equity system** y otra para el **Global system** (el proyecto del globo geopolítico). Cada ficha lleva el campo `sistema` (`equity` o `global`) y el script dibuja una sección por sistema. Si una no tiene fichas definidas, queda reservada con un nodo vacío.
- **Sin arquitectura en el tablero:** el campo `parte_arquitectura` de cada ficha (por ejemplo "Events / Catalysts / Macro") se registra como texto, pero no se dibuja como conexión porque no hay nodos de arquitectura a los que unirla. Si William vuelve a dibujar la arquitectura, cambiar `figma.conectar_arquitectura` a `true` en `assets/config.json` y revisar el script, que hoy no genera esas conexiones.
- **Datos de prueba fuera:** el registro de ejemplo no se sube al tablero. Solo se dibujan fichas reales, definidas.

## Cuándo se dibuja

Solo cuando la funcionalidad está **definida**: `registro.py validar --id <id>` sin errores. Las incompletas no se dibujan, para que el mapa solo muestre lo decidido. Con `--todas` se ven igualmente.

## Codificación (elegida por William)

| Dimensión | Representa |
|---|---|
| Color | Meta principal (verde Seguidores, azul Investigación de mercado, naranja Monetización, rojo-naranja Seguridad y riesgo de datos, gris Sin meta) |
| Tamaño | Número de dependencias |
| Forma | Estado (círculo idea, redondeado en construcción, rectángulo terminada, hexágono descartada) |
| Conexiones | Continua = depende de; punteada = alimenta una meta (las metas son nodos con borde grueso) |

Paleta colorblind-safe (Okabe-Ito), con texto negro sobre todos los colores. Cambiar colores y tamaños: `assets/config.json`.

## Límites de la herramienta de diagramas (según su descripción)

- Admite Mermaid de tipo flowchart; permite estilo de color "con moderación".
- **No admite cambios de fuente ni mover formas.** Por tanto el tamaño del nodo **no** se puede codificar con `classDef font-size`: ese estilo probablemente se ignora (**Hipótesis**, falta comprobarlo con una prueba).
- Pide texto entre comillas y sin saltos de línea; por eso el script genera etiquetas de una sola línea con barras verticales.
- No usar la palabra "end" en nombres de clase.

## Pasos

1. Genera los archivos:
   `python scripts/registro.py figma registro-funcionalidades.json --out figma-salida`
   Produce `mapa.mmd` (Mermaid) y `figma-spec.json` (color, forma, tamaño y sistema exactos de cada nodo).
2. Carga las skills del conector antes de usar sus herramientas: la de diagramas antes de `generate_diagram` y la de FigJam antes de `use_figma` (si no están instaladas, se leen del recurso `skill://figma/...`).
3. Abre una sesión con `create_session` sobre el `fileKey` del tablero y reutiliza su `sessionId` en todas las llamadas.
4. Dibuja `mapa.mmd` con `generate_diagram` pasando el `fileKey` para añadirlo al tablero.
5. Aplica el tamaño y los colores que la herramienta ignore, nodo por nodo, con `use_figma` y `figma-spec.json`. Si algo no se puede aplicar, dile a William qué falta; no digas que quedó bien.
6. Lee el resultado con `get_figjam` y compruébalo: ¿están todos los nodos, colores, secciones y conexiones? Solo entonces dilo terminado.
7. Añade la leyenda (color, tamaño, forma, conexiones) junto al mapa y guarda en el registro la URL con el `node-id` de la sección en el campo `figma_url`.

## Mantenerlo vivo

Cuando cambie el estado, la meta o las dependencias de una ficha, regenera el mapa y actualiza el mismo archivo, en vez de crear otro. Como la herramienta de diagramas no edita formas sueltas (**Hipótesis**), lo más probable es que haya que redibujar la sección completa; antes de borrar la anterior, confirma con William.

## Pendiente de verificar (Evidencia insuficiente)

- Si `generate_diagram` permite elegir la posición dentro de un archivo existente (importa para colocar las dos secciones sin que se superpongan).
- Si respeta `classDef` (colores), las formas de Mermaid (hexágonos, nodos tipo estadio) y los subgrafos como secciones.
- Si `use_figma` puede redimensionar nodos creados por `generate_diagram`.
- Cuántos nodos se leen bien en un solo lienzo. Con el crecimiento que William espera, probablemente haya que dividir el mapa por meta o por parte del sistema.
