# Pulso de prensa con GDELT (20-10-2026)

Resultado corto: **el pulso no entra en R.** Falló dos de las condiciones fijadas antes de descargar. Se queda como señal aparte y para ordenar la cola de la capa de hechos, donde sí aporta.

## Qué se hizo
- **Datos:** GDELT 1.0, ficheros diarios de eventos de `data.gdeltproject.org`. Autorizado: los últimos 365 días (A) y un día de cada 14 entre 2016 y 2025 (B). Se descargaron 620 de 621 días, 4,43 GB, en 4 minutos; cada zip se procesó y se borró. Quedan 11 MB de agregados por par y día en `world/gdelt/` (ignorado por git). El 23-06-2025 no existe en GDELT (404).
- **Agregación (`world/gdelt.py`):** eventos entre dos países del registro; peso 1 si algún actor es gubernamental o militar y 0,3 si no, por ln(1 + fuentes); se descartan los codificados con más de 7 días de retraso. Por par y día: eventos, peso por clase CAMEO, Goldstein positivo y negativo, tono.
- **Medida (`world/pulse.py`, protocolo `protocol_gdelt.py`, hash `60dcb726…` fijado antes de descargar):** equilibrio cooperación–conflicto de los últimos 135 días (vida media 45 d) frente a la línea base propia del par (hasta 730 d), más un término de nivel frente a lo que predice su puntuación estructural (solo en vivo). Aporte máximo ±20 puntos de R.

## Resultado frente a la regla de adopción
| Condición | Exigido | Resultado | |
|---|---|---|---|
| (a) desarrollo: 14 comprobaciones de signo en los 7 episodios vistos | ≥ 11 y 2 de 2 controles | **10 de 14**, controles 1 de 2 | no |
| (b) reservado: 7 comprobaciones fijadas sin mirar GDELT | ≥ 5 y 2 de 2 controles | **3 de 7**, controles 1 de 2 | no |
| (c) en vivo: reservada de 30 pares y banco de 89 | ≥ 13 y ≥ 79 | **11** de 30 (10 sin pulso) y 83 de 89 | no |
| (d) la reducción por poco volumen limita el aporte | respetada | no | no |

No se tocó ninguna constante ni comprobación después de ver los resultados.

## Qué enseña
- **Funciona bien en caídas bruscas de pares que estaban bien:** Catar–Arabia Saudí 2017 (Δ −0,99), Camboya–Tailandia 2025 (−0,71), Azerbaiyán–Rusia 2025 (−0,50), Canadá–Arabia Saudí 2018, Japón–Corea 2019, España–Marruecos 2021. Todos acertados.
- **No ve las crisis sobre una línea base ya conflictiva** (Israel–Irán 2025, Afganistán–Pakistán 2025): la base ya es negativa, y el pulso solo mide el cambio.
- **No sirve para las recuperaciones:** la línea base de 730 días incluye los años buenos anteriores a la crisis, así que una recuperación nunca supera a esa base (acertó 4 de 8 positivas).
- **Una crisis verbal casi no se nota con la escala de Goldstein:** India–Canadá (septiembre de 2023) sale en +0,14. Las acusaciones puntúan poco negativo y las frases de cooperación diplomática, mucho positivo. Una medida por clase CAMEO (parte de conflicto verbal) podría detectarlo; sería un diseño nuevo con casos reservados nuevos.
- **Ruido en pares grandes:** Francia–Alemania y España–Portugal se mueven ±3–4 puntos solo por el ciclo de noticias; los controles lo detectaron.
- **Dos errores míos al fijar las pruebas, que no cambio porque habría sido ajustar a los resultados:**
  1. La comprobación «España–Marruecos 2022-06-30 debe mejorar» no tuvo en cuenta la tragedia de Melilla del 24 de junio de 2022 (más de 20 muertos), que GDELT sí refleja. Aquel «fallo» probablemente es un acierto del dato.
  2. La condición (d) decía que la reducción por volumen garantizaba el límite, pero el tope de 20 se aplica después de reducir, así que no lo garantiza. Ya habría fallado la adopción por (a) y (b).
- **El banco da 80 de 89, no 81.** Los 81 eran solo de la capa estructural; al superponer la capa de hechos de los 5 pares, China–EE. UU. pasa a +12,8 (visita de Estado de Xi) y queda 2,8 fuera de su rango.

## Para qué se usa
**Cola de la capa de hechos** (`world/priority.py`): se alterna el orden estructural con los pares de volumen pleno de pulso más negativo. Comprobación exploratoria, no fijada de antemano, con los pares que deberían estar tensos: Francia–Níger pasa del puesto 972 al 20, Moldavia–Rusia del 1.972 al 54, Japón–Corea del Norte del 237 al 86, Israel–Yemen del 12.971 al 131 y Francia–Mali del 10.726 al 123. La estructura sigue ganando donde la prensa calla (EE. UU.–Rusia #5 frente a #1.223).

## Qué haría falta para que el pulso entrara en R
Un diseño nuevo con su protocolo y casos reservados nuevos. Pistas de este análisis: separar el conflicto verbal del material; sustituir la línea base de 730 días por una más corta para detectar recuperaciones; subir el umbral de volumen de los pares grandes; y calcular ya el nivel con una muestra diaria de 90 días (el término de nivel nunca pudo validarse con historia).
