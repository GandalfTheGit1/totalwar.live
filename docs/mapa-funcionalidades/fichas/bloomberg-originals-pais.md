# Contexto de inversión por país desde Bloomberg Originals

Estado: en construcción (dataset, API y panel listos; falta medir la métrica de éxito). Sistema: global. Creada 2026-10-31.

## 1. Meta y contexto

- **Meta:** dar a cada país del globo una capa de contexto cualitativo de inversión (temas, empresas, riesgos), trazable a video y fecha. Eje: cobertura.
- **Contexto, no señal.** El índice dice qué historias cubrió Bloomberg sobre un país y con qué ángulo. No predice precios, no entra al score de empresas y no es una recomendación de inversión. Cualquier uso como señal pasa antes por calibración (Hipótesis hasta entonces).

## 2. Qué te permite hacer

- Abrir un país y ver los videos de Bloomberg Originals que lo tratan, con ángulo favorable / riesgo / mixto / neutral, tesis en una frase, fecha aproximada y enlace.
- Ver las empresas y sectores ligados al país, incluidas las extranjeras cuyo negocio depende de él (la empresa suma también el país de su sede).
- Usarlo como filtro previo: qué países merecen análisis a fondo de sus empresas.

## 3. Mapa de alineación

- **Depende de:** nada del registro. Reutiliza `resolveCountryCode` y `callLlm` (rotación de proveedores).
- **Alimenta:** eje cobertura; panel lateral del país (pendiente).
- **Separado a propósito de:** score de empresas y calibración. Razón: el ángulo lo asigna un LLM a partir del título; no está calibrado.

## 4. Demanda de mercado: 0/10

| Criterio | Puntos | Etiqueta | Fuente |
|---|---|---|---|
| Lo piden | 0 | Evidencia insuficiente | Necesidad propia de William, sin usuarios |
| Frustración | 0 | Evidencia insuficiente | Sin entrevistas |
| Les conviene | 0 | Evidencia insuficiente | Hipótesis de ahorro de tiempo |

Para subirla: preguntar a 5 usuarios del globo si consultan contexto de inversión por país y dónde lo buscan hoy.

## 5. Métrica de éxito

- **Qué:** países con ≥1 video favorable o de riesgo; precisión del país asignado en una muestra manual de 50 videos.
- **Umbral (Suposición):** ≥40 países y ≥90 % de precisión.
- **Plazo:** antes de añadir la subsección al panel.
- **Registro por fecha:** cada video guarda su fecha aproximada de publicación; `generatedAt` marca cuándo se etiquetó.

## 6. Datos y riesgos

- **Fuente:** canal de YouTube Bloomberg Originals (`UCUMZ7gohGI9HcU9VNsr2FJQ`), listado con `yt-dlp --flat-playlist`. Se guarda título, id, vistas y etiquetas propias; no el contenido del video.
- **Fechas aproximadas** (derivadas de "hace N meses"): un video de "hace 1 año" queda en el mismo mes que todos los de esa franja. Insuficiente para tests de anticipación finos.
- **Etiquetado solo por título:** los videos de entrevistas o estilo de vida quedan "neutral" o sin país; algunos países pueden faltar si el título no los nombra.
- **Licencias/términos de uso:** INFORMACIÓN INCOMPLETA (ver por investigar).
- **Si YouTube bloquea:** el script falla con error claro; el JSON previo se conserva. Si el LLM falla en un lote, ese lote se reintenta en la siguiente ejecución.

## 7. Interfaz

- Hoy: `GET /api/bloomberg-originals/[code]` (ISO-2, ISO-3 o nombre) → totales por ángulo, empresas y sectores ordenados por menciones, videos con enlace y la nota "contexto, no señal".
- Subsección "Bloomberg Originals" en el panel lateral del país (`BloombergOriginalsSection.tsx`), debajo del Video Briefing: contadores, empresas, sectores, filtro por ángulo, lista de videos y la nota "contexto, no señal". Estados de carga y vacío ("no ha cubierto este país en los últimos 2 años"); un error de la API cae en el estado vacío.

## 8. Cómo se actualiza

```bash
npm run build:bloomberg                      # últimos 2 años, incremental
YTDLP_BIN=/ruta/a/yt-dlp npm run build:bloomberg -- --since=20250101
```

Requiere `yt-dlp` (con `certifi` si Python falla con SSL) y las claves LLM de `.env.local`.

## 9. Modelo de IA (Hipótesis)

Etiquetado por lotes de 40 títulos con la rotación del proyecto (tier HEAVY). Verificación: muestra manual de 50 videos.

## 10. Criterios de aceptación

- `npx vitest run __tests__/bloomberg-originals.test.tsx` pasa.
- `lib/data/bloomberg-originals/videos.json` existe con los videos de los últimos 2 años.
- `/api/bloomberg-originals/MX` devuelve videos; `/api/bloomberg-originals/ZZZZ` devuelve 404.

## 11. Prohibido

Tocar el score de empresas, la calibración o presentar el ángulo como recomendación de compra/venta.

## 12. Cosas por investigar

1. Demanda real: preguntar a usuarios del globo (William).
2. Términos de uso de YouTube/Bloomberg para indexar títulos y enlazar (revisar ToS de YouTube API Services).
3. ¿Añadir descripción/transcripción mejora la precisión sin bloqueo de IP? (prueba con 50 videos).
4. ¿Hace falta fecha exacta? (una petición por video; coste en riesgo de bloqueo).
5. ¿Desplaza la calibración, que sigue en construcción? (William).
