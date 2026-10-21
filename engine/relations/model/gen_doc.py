"""Generates modelo_puntuacion.md from the catalogs in scoring.py (single source of truth) and the scored_*.json results."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scoring as S

L = []
w = L.append


def fmt_days(d):
    if d < 365:
        return f'{d} d'
    y = round(d / 365, 1)
    return '1 año' if y == 1 else f'{y:g} años'


w('# Modelo de puntuación de relaciones bilaterales (−200 a +200)\n')
w('> Generado desde `scoring.py`: si cambia el catálogo en el código, este documento se regenera con `python3 -I gen_doc.py`.\n')

w('## 1. Escala y fórmula\n')
w('**R = S_estructural + S_dinámica**, cada parte entre −100 y +100, así que **R va de −200 a +200**.\n')
w('| Parte | Qué mide | Cómo cambia con el tiempo |\n|---|---|---|')
w('| **S_estructural** | Lo que está **en vigor** entre los dos Estados: tratados, alianzas, regímenes de sanciones, disputas, nivel de representación, interdependencia y memoria histórica | No decae mientras está en vigor. Al terminar, se desvanece con vida media de 1 año |')
w('| **S_dinámica** | Los **hechos** recientes: visitas, acuerdos firmados, expulsiones, sanciones impuestas, incidentes | Cada hecho decae exponencialmente con una vida media según su tipo |\n')
w(f'Las dos partes pasan por una **saturación tanh** (S_estr = 100·tanh(Σ/{S.K_STRUCT}), S_din = 100·tanh(Σ/{S.K_DYN})): acumular hechos o tratados acerca al límite pero nunca lo supera. Así diez críticas seguidas no valen diez veces una, y una guerra no se compensa con cien llamadas de cortesía.\n')

w('### Bandas de estado\n')
w('| R | Estado | Lectura |\n|---|---|---|')
read = {'CONFLICT': 'Conflicto armado o ruptura total', 'HOSTILE': 'Medidas punitivas sostenidas, relaciones degradadas',
        'TENSE': 'Fricción pública, represalias, pero canales abiertos', 'NEUTRAL': 'Relación normal sin cercanía ni conflicto',
        'PARTNER': 'Cooperación estrecha y diálogo regular', 'ALLIED': 'Alianza formal o integración profunda con dinámica positiva'}
for lo, hi, b in S.BANDS:
    w(f'| {lo} a {min(hi, 200)} | **{S.BAND_ES[b]}** | {read[b]} |')
w('\nSi el flujo no encuentra al menos 3 hechos de gobierno verificados en 12 meses y 3 fuentes independientes, el estado se muestra como **Mínima / sin datos** aunque R tenga un valor: la cifra no es fiable.\n')
w(f'**Tendencia** = R(hoy) − R(hace {S.TREND_DAYS} días), calculando el pasado solo con lo que se sabía entonces. Mejorando si sube {S.TREND_DELTA} puntos o más, empeorando si baja {S.TREND_DELTA} o más, estable en otro caso. Como se compara la puntuación total y no medias de ventanas, una relación mala y estable no aparece como "mejorando" (el fallo de la versión anterior).\n')

w('## 2. Qué es relevante\n')
w('Un hecho **suma o resta** solo si cumple todo esto:\n')
w('1. Lo hace **un Estado de la pareja** (gobierno, ministerio, fuerzas armadas, agencia oficial) o los dos juntos.')
w('2. Va **dirigido al otro** o a un asunto bilateral.')
w('3. Encaja en un **tipo del catálogo** con puntos distintos de cero.')
w('4. Está **verificado** contra su fuente (el verificador lo marca como respaldado o parcial).\n')
w('**No puntúa (se guarda solo como contexto):** opinión, encuestas, análisis de medios, oposición y exgobernantes, ONG y empresas, sentencias judiciales (independencia judicial), asuntos internos sin acto bilateral (dimisiones, investigaciones internas), actos de terceros países (por ejemplo, aranceles de EE. UU. a España por su postura sobre Israel cuentan para EE. UU.–España, no para España–Israel) y eventos multilaterales sin ángulo bilateral.\n')

w('## 3. Componente estructural: estados en vigor\n')
w('Cada estado cuenta mientras está vigente y necesita evidencia (un hecho verificado o una cita de Wikipedia). Cuando termina (se levantan sanciones, regresa el embajador), su efecto se reduce a la mitad cada año.\n')
groups = {}
for code, (label, pts, g) in S.STATES.items():
    groups.setdefault(g, []).append((code, label, pts))
for g, rows in groups.items():
    w(f'### {g}\n')
    w('| Código | Estado | Puntos |\n|---|---|---|')
    for code, label, pts in rows:
        w(f'| `{code}` | {label} | **{pts:+d}** |')
    w('')
w(f'**Memoria histórica.** Los hechos muy graves o muy positivos (|base| ≥ {S.MEMORY_THRESHOLD}: guerras, enfrentamientos armados, rupturas, normalizaciones) dejan, además de su efecto dinámico, una huella del {int(S.MEMORY_SHARE * 100)} % de su valor que decae con vida media de 25 años, con un tope de ±{S.MEMORY_CAP} puntos. Así una guerra de hace 30 años sigue pesando un poco y el establecimiento de relaciones aporta un pequeño saldo positivo de fondo.\n')

import structure as T
w('### De dónde sale cada estado\n')
w('Los estados ya **no los propone un LLM**: salen de datos o se derivan por reglas de los hechos verificados. Si una fuente calla, no se puntúa nada (la ausencia de un dato no es prueba de ausencia).\n')
w('| Estado | Fuente | Regla |\n|---|---|---|')
rows_ = [r for r in T.DATA_SOURCES if not r[0].startswith('TRADE_WAR (pares fuera de la tabla)')]
rows_ += [('MEASURES_IN_FORCE', 'Derivado de hechos + modelo de emparejamiento', 'Cada arancel, veto, control de exportación, sanción, corte de suministro, veto a inversiones o restricción de visados ejecutado por un Estado es una medida en vigor hasta que otro hecho la levanta. Peso 6 por medida (24 las sanciones amplias, 4 los visados); intensidad completa con 24 de peso acumulado (−30 puntos). Levantada, se desvanece con vida media de 1 año. No se añade si el proyecto ya declara una guerra comercial del par.'),
          ('NO_RELATIONS', 'Derivado de hechos', 'Ruptura de relaciones ejecutada y sin restauración o normalización posterior; sustituye a `FULL_DIPLOMATIC` mientras dura y evita contar además `AMBASSADOR_ABSENT`.')]
for st_, src, rule in rows_:
    w(f'| {st_} | **{src}** | {rule} |')
w('')
w('## 4. Componente dinámico: catálogo de hechos\n')
w('Puntos base = impacto de un hecho **ejecutado**, hecho por un **jefe de Estado o de Gobierno**, con **fuente sólida**. Los multiplicadores de la sección 5 lo ajustan.\n')
w('"Vale la mitad" es la vida media. "Irrelevante a los" es cuándo su valor cae por debajo de 0,5 puntos (con multiplicadores máximos) o pasan 6 vidas medias: a partir de ahí sale del cálculo.\n')
cats = {}
for code, (label, base, hl, cat) in S.EVENTS.items():
    cats.setdefault(cat, []).append((code, label, base, hl))
for cat, rows in cats.items():
    w(f'### {cat}\n')
    w('| Código | Hecho | Base | Vale la mitad a los | Irrelevante a los |\n|---|---|---|---|---|')
    for code, label, base, hl in rows:
        w(f'| `{code}` | {label} | **{base:+d}** | {fmt_days(hl)} | {fmt_days(S.irrelevant_after(base, hl)) if base else "—"} |')
    w('')

w('### Cómo se asigna el tipo a cada hecho (doble modelo)\n')
w('1. **Dos clasificadores independientes**, sin verse entre sí, asignan el código del catálogo, el país que actúa, el nivel del actor y si toca un interés central. **A:** Gemini 2.5 Flash. **B:** Groq Qwen3.8-27B, elegido tras la calibración histórica (ver sección 9): es determinista, el más acertado en el nivel del actor (+0,21 sobre Cohere, intervalo del 95 %: +0,08 a +0,33) y el de menor pérdida en las anclas. Reservas en orden: **Cohere command-a-03-2025** y Gemini Flash Lite, que se marca como *independencia degradada* porque comparte familia con A. Cada proveedor espera hasta 100 s a que termine su enfriamiento por minuto (dos veces como máximo) antes de ceder. Nemotron no se usa: es inestable entre corridas (81 %) y tarda más de 570 s. gpt-oss-120b no pudo evaluarse por cuota diaria agotada.')
w('2. **Mismo código:** se acepta. **Códigos distintos pero del mismo signo:** gana el **menos extremo** (menor |puntos|), sin llamar al juez; así un desacuerdo no puede producir por azar la versión más severa (un arancel contado como embargo total).')
w('3. **Signo distinto, o código frente a NONE:** un **tercer modelo** (Gemini 3.5 Flash Lite, o Qwen en Groq si no responde) elige entre el código de A, el de B o NONE.')
w('4. **Verificación de signo:** si el código acordado tiene signo contrario a la polaridad del hecho (extractor + verificador), el tercer modelo decide si el código se mantiene.')
w('5. **Nivel del actor:** si A y B coinciden, ese; si discrepan, el cargo que nombra el texto ("Prime Minister…" ⇒ jefe de Gobierno) y, sin cargo, el más bajo. **Interés central:** solo si los dos lo marcan. **País que actúa:** mayoría entre A, B y el extractor.')
w('6. Si el juez no responde con un código válido, el hecho pasa a NONE y no puntúa.')
w('\n*Coste de esta prudencia:* cuando los dos modelos difieren, la puntuación se inclina hacia cero. Reduce la variación entre ejecuciones, pero puede infravalorar hechos relevantes.\n')
w('## 5. Multiplicadores\n')
w('Valor de un hecho = **base × estado × nivel del actor × calidad de la fuente × interés central × decaimiento**.\n')
w('| Factor | Valores |\n|---|---|')
w(f'| Estado | Ejecutado ×1,0 · Anunciado, amenaza o promesa de un acto futuro ×{S.STATUS_MULT["DECLARED"]} · Las declaraciones (crítica, retórica dura, elogio) siempre ×1,0: hablar ya es el acto |')
w('| Nivel del actor | ' + ' · '.join(f'{k} ×{v}' for k, v in S.ACTOR_MULT.items()) + ' |')
w('| Calidad de la fuente | Corroborado por 2+ medios o fuente oficial ×1,0 · Una sola fuente ×0,7 · Parcialmente respaldado ×0,5 · Desmentido por un gobierno ×0,3 |')
w(f'| Interés central | ×{S.CORE_INTEREST_MULT} si toca la soberanía o el territorio del otro, la seguridad de su régimen o un interés que ha declarado central |')
w('| Decaimiento | ×0,5^(edad ÷ vida media) |\n')

w('## 6. Cómo pierden relevancia los hechos\n')
w('Cada tipo de hecho tiene su vida media según cuánto tiempo condiciona de verdad la relación: una llamada se olvida en semanas, una expulsión de diplomáticos marca la relación medio año, un enfrentamiento armado durante años.\n')
w('| Vida media | Queda a 30 d | a 90 d | a 180 d | a 1 año | a 2 años | Ejemplos |\n|---|---|---|---|---|---|---|')
ex = {30: 'llamadas, críticas, encuentros de pasillo', 60: 'reuniones ministeriales, convocatorias de embajador, boicots',
      120: 'visitas de Estado, cumbres, incidentes fronterizos, cortes de suministro', 180: 'acuerdos sectoriales, retirada de embajador, aranceles',
      365: 'firma de tratados, sanciones amplias, instrumentalización migratoria', 730: 'normalización, ruptura de relaciones, incidentes con muertos',
      1825: 'guerra'}
for hl, txt in ex.items():
    cells = ' | '.join(f'{100 * S.decay(d, hl):.0f} %' for d in (30, 90, 180, 365, 730))
    w(f'| {fmt_days(hl)} | {cells} | {txt} |')
w('\n**Tres reglas temporales:**\n')
w(f'1. **Decaimiento continuo.** Un hecho no desaparece de golpe: pierde la mitad de su peso en cada vida media.')
w(f'2. **Umbral de irrelevancia.** Cuando su valor cae bajo {S.IRRELEVANT_POINTS} puntos, o tras {S.MAX_HALF_LIVES} vidas medias, sale del cálculo y pasa al historial.')
w('3. **Lo vigente no decae, lo terminado sí.** Un embargo en vigor resta siempre lo mismo. Cuando se levanta, el hecho "levantamiento" suma y el embargo terminado sigue restando cada vez menos (vida media de 1 año): la desconfianza tarda en irse.\n')
w('**Consecuencia:** si deja de pasar algo, R vuelve poco a poco a su nivel estructural. Una crisis sin nuevos episodios se va disolviendo; para que la relación empeore de verdad tiene que seguir habiendo hechos negativos.\n')

w('### Regla de reinicio (primera reunión de líderes tras una ruptura)\n')
w('Una reunión rutinaria vale +2, pero la **primera reunión de los dos líderes tras una ruptura reciente** informa sobre la relación misma. Si es un contacto ejecutado a nivel de jefe de Estado o de Gobierno (llamada, encuentro en los márgenes, cumbre, visita de Estado o declaración conjunta), ocurre después de una ruptura ejecutada de los últimos 730 días (expulsión, retirada de embajador, rebaja o ruptura de relaciones, sanciones amplias, migración usada como arma) y no hubo otro contacto de ese tipo desde esa ruptura, **cuenta como una cumbre** (+10, vida media 120 días), nunca menos que su valor propio. Es causal (solo mira hechos anteriores) y no cambia ningún otro puntaje. **Limitación:** solo reconoce rupturas diplomáticas, no la coerción económica (ver sección 9).\n')
w('### Medidas en vigor (hasta que algo las levanta)\n')
w('Un arancel, un veto o una sanción no es solo una noticia que se olvida: es una **situación** que sigue pesando mientras esté en vigor. Los hechos de este tipo (`TRADE_RESTRICTION`, `EXPORT_CONTROLS`, `SANCTIONS_TARGETED`, `SANCTIONS_BROAD`, `SUPPLY_CUT`, `INVESTMENT_BLOCK`, `VISA_RESTRICTION`), ejecutados y por un actor de gobierno, crean un estado `MEASURES_IN_FORCE` hasta que un acto de levantamiento los termina. El **emparejamiento** (qué hecho levantó qué medida) lo hace un modelo y se valida por código: el levantamiento tiene que ser posterior y de un actor compatible, si no se descarta y la medida sigue en vigor; si el modelo no responde, una heurística léxica empareja por palabras distintivas. Los pesos están fijados a priori, no ajustados.\n')
w('Los hechos originales siguen contando como eventos que decaen (el impacto de la noticia); el estado recoge el nivel que persiste. Un levantamiento suma además como evento (`DE_ESCALATION`).\n')
w('### Reverificación de estados antiguos\n')
w('Un estado derivado de un hecho de hace más de 12 meses (embajador ausente, relaciones cortadas, medida sin levantar) solo vale si la lista de hechos está completa. Antes de contarlo se busca en la web su restauración o levantamiento y un modelo juzga los fragmentos, con **cita literal obligatoria que el código comprueba** dentro del fragmento citado. Resultados: *levantado* (se añade un hecho de restauración marcado como verificado en la web, o se fija la fecha de fin de la medida; si el fragmento no trae fecha se anula el estado sin inventar un evento), *sigue vigente* (hay un fragmento de los últimos 12 meses que lo dice) o *desconocido* (el lado o la medida no verificados cuentan a la mitad y la salida lo avisa en `warnings`). Se verifica cada lado por separado: el lado reciente de un embajador ausente conserva su peso completo.\n')
w('## 7. Resultados con los 5 pares de prueba\n')
here = os.path.dirname(os.path.abspath(__file__))
rows = []
for p in ['ES-MA', 'ES-IL', 'US-CN', 'IN-CA', 'MN-SN']:
    fp = os.path.join(here, '..', 'results', f'scored2_{p}_run1.json')
    if os.path.exists(fp):
        rows.append(dict(json.load(open(fp)), run2=json.load(open(fp.replace('run1', 'run2')))['R']))
if rows:
    w('| Par | R (corrida 1) | R (corrida 2) | Estado | Estructural | Dinámica | Tendencia (30 d) | Hace 1 año | Hace 90 d |\n|---|---|---|---|---|---|---|---|---|')
    tr = {'IMPROVING': 'Mejorando', 'DETERIORATING': 'Empeorando', 'STABLE': 'Estable'}
    for r in rows:
        w(f"| {r['pair']} | **{r['R']:+.0f}** | {r['run2']:+.0f} | {S.BAND_ES.get(r['band'], 'Mínima / sin datos')} | {r['S_struct']:+.0f} | {r['S_dyn']:+.0f} | "
          f"{tr[r['trend']]} ({r['trendInfo']['delta']:+.0f}) | {r['timeline']['-365d']:+.0f} | {r['timeline']['-90d']:+.0f} |")
    es = next((r for r in rows if r['pair'] == 'ES-MA'), None)
    if es:
        w('\n### Ejemplo resuelto: España–Marruecos\n')
        w('**Estados en vigor:** ' + ', '.join(f"`{s['code']}` {s['value']:+.0f}" for s in es['states']) + f" → suma {es['rawStruct']:+.0f} → S_estr {es['S_struct']:+.0f}\n")
        w('| Hecho | Tipo | Edad | Valor hoy |\n|---|---|---|---|')
        for e in es['topEvents'][:8]:
            w(f"| {e['fact'][:90]} | `{e['code']}` | {e['ageDays']} d | {e['value']:+.1f} |")
        w(f"\nSuma dinámica {es['rawDyn']:+.1f} → S_din {es['S_dyn']:+.1f}. **R = {es['S_struct']:+.1f} {es['S_dyn']:+.1f} = {es['R']:+.1f}** ({S.BAND_ES.get(es['band'], es['band'])}).\n")

w('## 8. Limitaciones conocidas\n')
w('- **Los estados de datos son prudentes: lo que ninguna fuente recoge, no puntúa.** No hay fuente para mecanismos de cumbres periódicas ni para alianzas o guerras históricas.')
w('- **Lazos humanos (ONU, 2024) cuentan lugar de nacimiento, no nacionalidad**, y no recogen a los hijos de migrantes nacidos en el país de destino: España aparece con 455.890 nacidos en Marruecos, frente a 1,17 millones de marroquíes (nacionalidad) del INE. Subestima las diásporas de segunda generación. No hay API: el fichero Excel se descargó una vez (6,0 MB) y se lee como dato.')
w('- **Los tratados de Wikidata tienen cobertura parcial** (para España–Marruecos solo aparece un tratado de inversiones; para EE. UU.–China y India–Canadá, ninguno). El tratado de amistad de 1991 entra por el flujo de hechos, no por Wikidata.')
w('- **El nivel de R depende del modelo B.** Con Groq como B, España–Marruecos salía unos 8 puntos menos negativa (−27) que con Cohere (−35), porque Groq elegía códigos más suaves (por ejemplo, "crítica" donde A y Cohere ven "violación de soberanía") y la regla de desacuerdo se quedaba con el más suave. La variación entre dos corridas seguidas es ≤ 2,6 puntos, pero entre tandas con B distinto llegó a 8. No hay forma objetiva de decir cuál es el correcto.')
w('- **El día pasa factura a las cuotas:** las cuatro claves de Groq gpt-oss-120b quedaron aparcadas por cuota diaria tras las pruebas, así que la espera con reintento nunca se activó en datos reales (solo está probada con un proveedor simulado).')
w('- **La verificación de signo contra la polaridad se activó una vez con datos reales** y acertó: la visita del rey a Ceuta, con polaridad +1 del extractor, se mantuvo como postura hostil hacia el interés central de Marruecos. Delata además que la polaridad del extractor es ruidosa.')
w('- **La cifra solo es tan completa como la lista de hechos** del flujo de extracción; esta evaluación reutiliza los hechos verificados de v6 para aislar el efecto de los nuevos estados y del doble clasificador.')
w('- Los puntos y las vidas medias son una primera calibración razonada, no ajustada con datos históricos.')
w('- **La reverificación es conservadora:** confirma las restauraciones y levantamientos documentados (4 de 4 en los controles reales, aunque en uno de ellos —España–Marruecos— se mejoraron las consultas viéndolo, así que 3 son independientes; ningún falso «levantado» y un expediente inventado resuelto como desconocido), pero **no consigue confirmar que algo sigue vigente** (fallo con el embargo a Cuba, y con el lado israelí de España–Israel), y en ese caso resta la mitad del peso: sesgo hacia infravalorar situaciones reales.')
w('- **Los clasificadores casi nunca devuelven NONE**: en el episodio reservado recuperaron 0 de 2 hechos sin efecto en bruto (y 0 a 1 de 2 tras la reconciliación), igual que en los episodios de calibración (0,29 a 0,86).')
w('- La puntuación es simétrica: `byActor` indica quién empuja, pero no hay puntuación por dirección.')
w('- **Estado de embajada sin límite de tiempo (ronda 5):** una ausencia dura hasta que algo la termina. Si la lista de hechos no recoge el regreso y la reverificación tampoco lo confirma, el lado se queda ausente a medio peso: hoy pasa con Marruecos en España–Marruecos (la embajadora volvió en marzo de 2022; −5 en lugar de 0). Wikidata no ayuda en ese caso porque registra un mandato continuo desde 2018.')
w('- **Wikidata para fechas pasadas tiene algo de retrospectiva** (los mandatos se registran después) y la mayoría de fechas de inicio solo tienen año, así que una restauración se reconoce el 31 de diciembre de ese año. Un mandato sin fecha de fin puede estar desfasado (el de Lee Su-hoon en Japón sigue abierto desde 2017); por eso vale como máximo 6 años.')

w('\n## 9. Calibración y validación histórica (18-10-2026)\n')
w('Informe completo, con anclas y etiquetas congeladas con hash: `calibracion.md`.\n')
w('**Metodología:** anclas ordinales fijadas antes de puntuar (hechos y fechas documentados; magnitudes esperadas, criterio mío), etiquetas manuales congeladas antes de clasificar, parámetros calibrados con etiquetas manuales y modelos evaluados después. Los episodios que inspiran un cambio ya no pueden validarlo: el código se congeló por hash antes de leer cada episodio reservado.\n')
w('| Episodio | Papel | Anclas cumplidas con etiquetas manuales | Pipeline realista (Qwen / Cohere) |\n|---|---|---|---|')
w('| España–Marruecos 2020–23, India–Canadá 2023–26 | calibración | 28 de 28 | 0,0 de pérdida con Qwen; 0,9 con Cohere |')
w('| Australia–China 2020–24 | **desarrollo** de las medidas en vigor | 9 de 14 antes, 9 de 14 después (pérdida 119,5 → 61,8) | — |')
w('| Arabia Saudí–Catar 2017–22 | reservado 1: **no ejercitó las medidas** (la extracción fundió bloqueo y ruptura en un solo hecho) | 14 de 14 (el modelo anterior también) | 12 y 14 de 14 (antes 10 y 10) |')
w('| Japón–Corea del Sur 2019–23 | reservado 2: las medidas sí se ejercitan | **11 de 13** (antes 8 de 13) | 1–2 y 1–4 violaciones (antes 5–6 y 7) |')
w('\n- **Parámetros: sin cambios.** Los valores por defecto cumplen las anclas de los dos episodios de calibración y quedan dentro de la región factible (87 de 270 combinaciones). Las anclas no identifican el peso de lo anunciado ni un tope de vidas medias.')
w('- **Las medidas en vigor ayudan fuera de muestra donde actúan** (Japón–Corea del Sur) y no empeoran donde no actúan (Catar, calibración). Lo que no corrigen: una ancla de criterio (la recuperación espontánea tras el mínimo sigue siendo demasiado rápida porque los eventos decaen mientras el estado solo resta hasta −30) y una tendencia que el modelo lee «mejorando» tras un gesto positivo documentado.')
w('- **Catálogo corregido en la ronda anterior** (`VISA_RESTRICTION`, `TALKS_SUSPENDED`, regla de reinicio, expulsión de alto comisionado). La mejora de esa ronda es dentro de la muestra.')
w('- **Modelo B:** el acierto de código no distingue a los candidatos; Qwen supera a Cohere en nivel del actor dentro de la muestra (+0,17 a +0,21, significativo) y fuera de muestra la ventaja es +0,15 con intervalo [0,00, +0,30]. Se mantiene Qwen → Cohere → Gemini Flash Lite con confianza moderada.')
w('| Canadá–Arabia Saudí 2018–23 | reservado 3 (ronda 4): expulsión de embajador y bloqueo de comercio durante 4,7 años | 9 de 13 (pérdida 76,2) | pérdida media 78,0 / 80,4 |')
w('- **Magnitud de las medidas (ronda 4): sin cambios.** Con Australia–China y Japón–Corea como desarrollo, subir el máximo de −30 mejora solo el primero y empeora el pipeline realista del segundo; retener el evento de la medida mientras está en vigor (H2) mejora con etiquetas manuales pero empeora el pipeline realista de Japón–Corea y no se confirma en el episodio reservado (Canadá–Arabia Saudí: −27 % con etiquetas, −1 % y +6 % realista). Causa identificada fuera de la magnitud: el corte duro de 36 meses de `AMBASSADOR_ABSENT` y la caída de los eventos; queda como seguimiento con su propio episodio reservado.')
w('| Israel–Turquía 2018–24 | reservado 4 (ronda 5): embajador israelí ausente 51 meses, retirada de 2023 y ruptura de 2024 | 11 de 14 (pérdida 29,4; el estado anterior, 39,2) | pérdida media 64,8 / 44,1 (antes 74,6 / 53,8) |')
w('- **Estado de embajada (ronda 5): adoptado.** Tres valores por lado (presente / ausente / desconocido) con hechos, titulares de Wikidata y reverificación, sin el corte de 36 meses. En desarrollo baja Canadá–Arabia Saudí (76,2 → 47,3 con etiquetas manuales; 78,0 → 23,7 y 80,4 → 31,0 realista) sin mover los otros cinco episodios; en el reservado Israel–Turquía baja 39,2 → 29,4 con etiquetas manuales y 74,6 → 64,8 / 53,8 → 44,1 realista. Fallan los mismos tres niveles de 2018–2021 en ambos modelos: R no baja lo bastante durante la congelación.')
w('- **Límite:** anclas y etiquetas son criterio mío sobre hechos documentados; no son una verdad independiente.')
open(os.path.join(here, '..', 'docs', 'modelo_puntuacion.md'), 'w').write('\n'.join(L) + '\n')
print('written', len(L), 'lines')
