# Mapa de dos canales: posición y vínculos (21-10-2026)

## Problema
El mapa pintaba por la banda de R (−130/−70/−20/30/100), pero la capa estructural solo llega de −95 a +73 y el 94 % de los pares queda entre −5 y +25, es decir, de un solo color. Además R mezcla dos cosas: cuántos vínculos formales hay (embajadas, comercio, migración) y de qué lado está el par (alianzas, sanciones, disputas).

## Qué se hizo
- **T (vínculos)** = suma de los puntos de los estados `FULL_DIPLOMATIC`, `NONRESIDENT_RELATIONS`, `SHARED_LANGUAGE`, `BILATERAL_TREATIES`, `TRADE_HIGH`, `TRADE_MEDIUM`, `HUMAN_TIES` y `SHARED_FORUM`.
- **V (posición)** = R − T. Para los pares con capa de hechos, V incluye también su parte dinámica.
- **Color por V**, interpolado linealmente entre 9 puntos que coinciden con el peso de un estado del catálogo: −60 `#9f1239`, −25 `#e11d48`, −10 `#f43f5e`, −5 `#f59e0b`, 0 `#94a3b8`, +5 `#818cf8`, +10 `#34d399`, +30 `#10b981`, +60 `#047857`.
- **Opacidad por T**: `0,30 + 0,35 × mín(T, 20)/20`. En hover, +0,25 con máximo 0,90. Brillo y borde más grueso solo cuando |V| ≥ 25.
- **Sin vínculos ni posición registrados** (9.001 pares): se mantiene el gris de siempre.
- El panel muestra el degradado como leyenda, los recuentos por posición y tres bloques: posiciones favorables, adversas y los más conectados sin posición registrada. Cada país desplegado da posición, vínculos y estructura.
- Código: `lib/services/bilateral-relations/valence.ts`; el mapa 2D (`country-styler.ts`), el globo (`useGlobeStyling.ts`) y el panel usan `RelationItem.tone`; si falta, conservan el estilo anterior.
- **Nueve bloques regionales** con listas oficiales en `model/bloc_memberships.json`: CEDEAO (preferencial), SADC, Comunidad de África Oriental, CARICOM, Comunidad Andina (libre comercio), Alianza del Pacífico (preferencial), Alianza de Estados del Sahel (defensa), SAARC y Foro de las Islas del Pacífico (foro). Wikidata los tiene incompletos o con miembros equivocados.

## Validación
Fijada con hash antes de implementar (`world/audit_map.py`, `3a5c32e0…`).

| Criterio | Resultado | Matiz |
|---|---|---|
| (1) 40 pares en su clase esperada (≥ 36) | **40 de 40** | **ya eran 40 de 40 antes del cambio**: el criterio no puede acreditarlo |
| (2) 40 países con ≥ 5 socios con \|V\| ≥ 5 (≥ 35) | **37 de 40** | **ya eran 37 antes**: tampoco lo acredita |
| (3) un par sin posición nunca sale verde ni rosa | cumple (prueba unitaria) | por construcción |
| (4) 15 pertenencias a bloques; 31 casos de bloques; banco ≥ 79; reservada ≥ 10 | **15/15**; **31/31**; **80/89**; **10/30** | banco y reservada no cambian |

**Medida más exigente, añadida después de ver la línea base (no fijada de antemano):** socios con posición clara (|V| ≥ 10) por país, sobre los 40 países.
- Países con ≥ 5 socios con posición clara: **32 de 40 antes y 32 de 40 después**. La mejora que hacen los bloques es pequeña.
- Cambian solo Sudáfrica (0 → 4) y Colombia (1 → 4). 163 pares pasan de «sin posición» o «preferencial» a «cooperación estrecha» (280 → 443).
- **Nigeria sigue con 0**: la CEDEAO es acuerdo preferencial (+6), por debajo del corte de 10. India sigue con 2 y los Emiratos con pocos.

## Lo que se ve
- Rusia: Europa en rojo (rivalidad por sanciones y doctrina de la OTAN), Kazajistán, Kirguistán, Bielorrusia, Tayikistán y Armenia en verde, el resto en gris azulado.
- Estados Unidos: 28 aliados, 8 de cooperación, 14 preferenciales, 95 sin posición, 10 de fricción, 10 de rivalidad.
- Nigeria: 47 preferenciales (índigo), 82 sin posición.

## Lo que sigue siendo cierto
- **El 87 % de los pares (16.757) sigue sin posición registrada**, y es lo que dicen los datos: no hay alianza ni conflicto conocidos. Ahí el mapa solo distingue por opacidad (vínculos).
- Los pares con capa de hechos (5) llevan su parte dinámica en V: España–Marruecos (R −35) sale más rojo de lo que su R sugiere.
- Las listas de los 9 bloques las escribí de memoria de las fuentes públicas y no tienen fechas de entrada por miembro. Hay que revisarlas con la lista oficial de cada organización.
- La ASEAN sin Australia, Mercosur sin México ni Venezuela, y los demás ajustes de la auditoría siguen vigentes.
- Redimensionar la ventana reinicia el mapa a su estilo por defecto hasta volver a seleccionar un país (ocurre también con las demás capas; no lo he tocado).
