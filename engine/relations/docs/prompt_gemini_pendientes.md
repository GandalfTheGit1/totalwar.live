# PROMPT PARA GEMINI 3.8 EN ANTIGRAVITY
# Tarea: pintar y ordenar los pares «sin posición» del mapa de relaciones (fases 0 y 1)

Pega todo este documento como primer mensaje. Después escribe: **«Empieza por el PASO 0 y sigue hasta terminar la FASE 0»**.
Cuando la FASE 0 haya terminado y la hayas revisado, escribe: **«Adelante con la FASE 1»**.

---

## 0. REGLAS QUE NO SE NEGOCIAN

Eres un ingeniero que sigue instrucciones al pie de la letra. No eres creativo en esta tarea: copias, ejecutas, comparas y avisas.

1. **Un paso cada vez, en orden.** Cada paso tiene un comando o una acción exacta y un «RESULTADO ESPERADO».
2. **Después de cada comando, pega su salida real** (no la resumas ni la parafrasees) y compárala con el resultado esperado.
3. **Si la salida no coincide, PARA.** Escribe `BLOQUEADO en el paso X` y pega la salida completa. No sigas, no intentes arreglarlo por tu cuenta, no pruebes alternativas.
4. **Prohibido hacer, aunque te parezca buena idea:**
   - `git commit`, `git push`, `git stash`, `git checkout`, `git reset`, `git clean`, `git rebase`.
   - Descargar nada de internet (ni `curl`, ni `wget`, ni `pip install`, ni `npm install`).
   - Modificar los ficheros de la lista del apartado 2.
   - Cambiar pesos o códigos en `engine/relations/model/scoring.py`.
   - Escribir posiciones, fuentes o fechas dentro de `pending_top300.csv`. Esa hoja la rellena una persona.
   - Inventar hechos, fuentes, números o resultados. Si no sabes algo, dilo.
   - Refactorizar, renombrar, «mejorar» o borrar código que no se te pide tocar.
5. **El árbol de git ya tiene cambios sin confirmar.** Son trabajo previo válido (el mapa de dos canales). No los toques, no los reviertas. Guarda en tu informe la salida de `git status --short` del paso 0 como punto de partida.
6. **Entorno:** macOS, terminal zsh. Usa siempre `python3 -I` como se indica. Todas las rutas son relativas a la raíz del repositorio, salvo que se diga otra cosa.
7. **Comandos largos** (más de 2 minutos): ejecútalos en segundo plano y espera a que terminen antes de seguir.
8. **Lleva una lista de tareas** con los pasos y ve marcándolos. Trabaja en modo Planning: primero escribe un plan de 5 líneas y luego ejecútalo.
9. Cuando termines una fase, escribe el **informe** del apartado 7 y **detente**. No empieces la fase siguiente sin que el usuario lo pida.

---

## 1. CONTEXTO MÍNIMO (léelo, no hay nada que hacer aquí)

- **Repositorio:** `/Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae`
- **Rama:** `claude/project-new-features-review-f92aae`
- **Qué es:** un motor en Python (`engine/relations/`) puntúa la relación entre cada par de países (19.306 pares). Una app Next.js (`components/`, `lib/`, `app/`) la muestra en el mapa de relaciones.
- **Cadena de datos:** `engine/relations/world/out/pairs.json` → `engine/relations/world/export_app.py` → `lib/data/bilateral-relations/relations.json` → `lib/services/bilateral-relations/relations-store.ts` → API `/api/relations/[code]` → `components/geopolitical-monitor/hooks/monitor/engine-relations.ts` → mapa 2D, globo y panel.
- **R** es la puntuación del par. **T (vínculos)** es la suma de los puntos de estas señales: embajadas, comercio, migración, tratados, lengua y foros compartidos. **V (posición)** es `R − T`: de qué lado está el par (alianzas, sanciones, disputas, ruptura…). Un par **tiene posición registrada** si `|V| ≥ 5`.
- **El problema:** el 87 % de los pares (16.757) no tiene posición registrada y el mapa los pinta todos igual. Pero casi todos son legítimos (dos islas pequeñas no tienen una posición que registrar). El hueco real son los pares **importantes**.
- **Un par es «importante»** si cumple CUALQUIERA de estas cuatro condiciones: (a) ambos países tienen 20 millones de habitantes o más, (b) comercio alto (el estado `TRADE_HIGH`), (c) comparten frontera, (d) ambos son del G20.
- **Los números que debes reproducir exactamente:**

| Categoría | Pares |
|---|---|
| Con posición (`|V| ≥ 5`) | 2.549 |
| **Dato pendiente** (importante y sin posición) | **1.845** |
| Conectados, no importantes | 6.327 |
| Sin relación relevante | 8.585 |
| Total | 19.306 |

- **Qué vas a hacer:**
  - **FASE 0:** el mapa y el panel distinguen los **1.845 «dato pendiente»** (rayado ámbar) del resto.
  - **FASE 1:** una hoja de trabajo con los 300 pendientes más importantes (para que una persona la rellene), un cargador que valida lo que se rellene, y 4 hechos de sanciones a Rusia.
- **Qué NO vas a hacer:** descargar datos, rellenar posiciones, tocar la puntuación de los pares ya puntuados. Eso es la FASE 2 y requiere permiso del usuario.

---

## 2. FICHEROS QUE NO PUEDES MODIFICAR (están congelados con hash)

`engine/relations/world/audit_benchmark.py`, `audit_holdout.py`, `audit_blocs.py`, `audit_map.py`, `protocol_gdelt.py`, todos los `*.sha256`, todo lo que hay en `engine/relations/calibration/`, `engine/relations/model/scoring.py` y `engine/relations/model/bloc_memberships.json`.
Tampoco modifiques ningún fichero de `engine/relations/world/gdelt/` ni de `engine/relations/world/out/` salvo los que se nombran en los pasos.

---

## 3. PASO 0 — COMPROBACIÓN INICIAL

```bash
cd /Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae
git branch --show-current
git status --short
ls engine/relations/docs/gemini_kit/
python3 -I engine/relations/docs/gemini_kit/run_checks.py baseline
```

**RESULTADO ESPERADO**
- La rama es `claude/project-new-features-review-f92aae`.
- `git status --short` muestra ficheros modificados (`M`) y nuevos (`??`): es normal. Pégalo en tu informe.
- `ls` muestra: `add_sanctions_facts.py export_app.py importance.py ingest_reviewed.py patch_phase0_ts.py pending_worklist.py run_checks.py test_importance.py`.
- La última línea del comando es **`10/10 checks passed`** (todo `PASS`). Tarda unos 2 minutos.

Si algo es distinto: **BLOQUEADO en el paso 0**.

---

## 4. FASE 0 — «DATO PENDIENTE» EN EL MAPA Y EL PANEL

### Paso 0.1 — Copiar tres ficheros de Python (ya están probados; cópialos, no los reescribas)

```bash
cp engine/relations/docs/gemini_kit/importance.py engine/relations/world/importance.py
cp engine/relations/docs/gemini_kit/test_importance.py engine/relations/world/test_importance.py
cp engine/relations/docs/gemini_kit/export_app.py engine/relations/world/export_app.py
ls -la engine/relations/world/importance.py engine/relations/world/test_importance.py engine/relations/world/export_app.py
```
**RESULTADO ESPERADO:** los tres ficheros existen. (`export_app.py` sustituye al anterior: es correcto.)

### Paso 0.2 — Probar la lógica de importancia

```bash
cd engine/relations/world && python3 -I test_importance.py && cd ../../..
```
**RESULTADO ESPERADO:** termina con `Ran 2 tests` y `OK`.

### Paso 0.3 — Parche de TypeScript (un script hace todas las ediciones; NO edites a mano)

```bash
python3 -I engine/relations/docs/gemini_kit/patch_phase0_ts.py
```
**RESULTADO ESPERADO:** una línea `ok <ruta>` por cada edición (16 líneas) y al final `PATCH COMPLETE`.
**Si aparece `STOP:`** en cualquier punto: **BLOQUEADO en el paso 0.3**. Pega el mensaje entero. No lo repitas, no edites los ficheros a mano: el script comprueba que cada texto a cambiar existe exactamente una vez, y si falla es porque el fichero no está como se esperaba.
**No ejecutes este script dos veces:** la segunda vez daría `STOP:` y eso es normal.

### Paso 0.4 — Regenerar el fichero que lee la app

```bash
cd engine/relations/world && WGE_OFFLINE=1 python3 -I export_app.py && cd ../../..
```
**RESULTADO ESPERADO:** una línea que empieza por `19306 pairs, 2509 important -> ../../../lib/data/bilateral-relations/relations.json`.

### Paso 0.5 — Verificación completa

```bash
python3 -I engine/relations/docs/gemini_kit/run_checks.py phase0
```
**RESULTADO ESPERADO:** **`14/14 checks passed`**, todas las líneas en `PASS`. En concreto:
`app tests (vitest): 366 passed`, `importance tests: OK`, `exported file: pending pairs: 1845`, `exported file: important pairs in meta: 2509`, y las demás cifras iguales que en el paso 0 (`benchmark 80`, `bloc cases 31`, `map pairs 40`, `map utility 37`, `hold-out 10`).

Si alguna línea es `FAIL`: **BLOQUEADO en el paso 0.5**.

### Paso 0.6 — Comprobación visual (OPCIONAL: si el navegador falla, sáltalo y dilo)

```bash
npm run dev -- --port 3107
```
Abre `http://localhost:3107`, pulsa el botón **RELACIONES**, escribe **India** en el buscador («Buscar país…») y pulsa Enter.
**RESULTADO ESPERADO:** varios países aparecen con **rayas diagonales ámbar** (por ejemplo Estados Unidos o Indonesia), y el panel de la derecha tiene un grupo **«Dato pendiente: relación esperable sin posición registrada»** y una línea de leyenda con el rayado. Haz una captura. **Detén el servidor** (Ctrl+C) al terminar.

### Paso 0.7 — Documentar

```bash
cat >> engine/relations/docs/mapa.md <<'EOF'

## Dato pendiente (21-10-2026)
- Un par es «importante» si ambos países tienen 20 millones de habitantes o más, o hay comercio alto, o comparten frontera, o ambos son del G20 (`engine/relations/world/importance.py`). 2.509 pares son importantes.
- **Dato pendiente** = importante y sin posición registrada (|V| < 5): 1.845 pares (9,6 %). En el mapa 2D se pintan con rayado ámbar; en el globo, con relleno y trazo ámbar tenues; en el panel tienen su propio grupo.
- El resto de pares sin posición (14.912, el 77 %) no tiene una relación importante que registrar y se queda en gris.
- La exportación añade un octavo campo por par (`important`, 1 o 0) y `meta.importantPairs`.
EOF
tail -8 engine/relations/docs/mapa.md
```
**RESULTADO ESPERADO:** se ven las líneas añadidas.

### Paso 0.8 — Informe de la FASE 0 y PARAR

Escribe el informe del apartado 7 y **detente**. No empieces la FASE 1.

---

## 5. FASE 1 — HOJA DE TRABAJO, CARGADOR Y SANCIONES
(Solo cuando el usuario escriba «Adelante con la FASE 1».)

### Paso 1.1 — Copiar dos ficheros de Python

```bash
cp engine/relations/docs/gemini_kit/pending_worklist.py engine/relations/world/pending_worklist.py
cp engine/relations/docs/gemini_kit/ingest_reviewed.py engine/relations/world/ingest_reviewed.py
```

### Paso 1.2 — Generar la hoja de trabajo

```bash
cd engine/relations/world && WGE_OFFLINE=1 python3 -I pending_worklist.py && wc -l out/pending_top300.csv && cd ../../..
```
**RESULTADO ESPERADO:**
- `300 rows -> .../engine/relations/world/out/pending_top300.csv`
- `first 8: ['IN-US', 'ID-IN', 'CN-PK', 'IN-NG', 'CN-NG', 'BR-IN', 'BR-CN', 'BD-IN']`
- `301 out/pending_top300.csv` (300 filas más la cabecera).

**NO abras el fichero para rellenarlo.** Las columnas `position_code`, `since`, `source`, `reject` y `note` se quedan vacías: las rellena una persona.

### Paso 1.3 — Comprobar que el cargador no hace nada con la hoja vacía

```bash
cd engine/relations/world && WGE_OFFLINE=1 python3 -I ingest_reviewed.py; echo "exit $?"; cd ../../..
```
**RESULTADO ESPERADO:** `0 facts added to ../model/reviewed_facts.json` y `exit 0`.

### Paso 1.4 — Añadir los 4 hechos de sanciones a Rusia (Australia, Nueva Zelanda, Corea del Sur, Singapur)

```bash
python3 -I engine/relations/docs/gemini_kit/add_sanctions_facts.py
```
**RESULTADO ESPERADO:** `4 facts added; 153 in total`. (Si lo ejecutas otra vez, dice `0 facts added; 153 in total`: es correcto.)

### Paso 1.5 — Volver a puntuar los 19.306 pares y regenerar los ficheros (tarda unos 9 minutos)

Ejecuta estos cinco comandos **uno tras otro**, esperando a que cada uno termine. El primero tarda unos 9 minutos: lánzalo en segundo plano y espera a que el fichero `rescore.log` termine con la línea `pairs scored`.

```bash
cd engine/relations/world
WGE_OFFLINE=1 nohup python3 -I score_all.py > rescore.log 2>&1 &
```
Cuando `tail -2 rescore.log` muestre `19306 pairs scored, 0 failed []`, sigue:

```bash
WGE_OFFLINE=1 python3 -I overlay_known.py
python3 -I events_runner.py merge
WGE_OFFLINE=1 python3 -I export_app.py
WGE_OFFLINE=1 python3 -I priority.py
cd ../../..
```
**RESULTADO ESPERADO**
- `score_all`: `19306 pairs scored, 0 failed []`.
- `overlay_known`: cinco líneas con `R` (ES-IL, ES-MA, CA-IN, MN-SN, CN-US).
- `events_runner merge`: `5 pairs with the events layer merged`.
- `export_app`: `19306 pairs, 2509 important -> ...`.
- `priority`: una línea `top 25: [...]`.

### Paso 1.6 — Comprobar que los cuatro pares tienen el nuevo estado

```bash
python3 -I - <<'EOF'
import json
P = {p['pair']: p for p in json.load(open('engine/relations/world/out/pairs.json'))['pairs']}
for k in ('AU-RU', 'NZ-RU', 'KR-RU', 'RU-SG'):
    print(k, round(P[k]['R'], 1), [s for s in P[k]['states']])
EOF
```
**RESULTADO ESPERADO:** los cuatro pares muestran `['SANCTIONS_REGIME_TARGETED', -12.0]` entre sus estados.

### Paso 1.7 — Verificación completa

```bash
python3 -I engine/relations/docs/gemini_kit/run_checks.py phase1
```
**RESULTADO ESPERADO:** todas las líneas en `PASS`, y `exported file: pending pairs: 1844`.
Todas las cifras son las mismas que en la FASE 0, salvo los pendientes: bajan de 1.845 a 1.844 porque las sanciones dan posición a un par.
Si alguna línea es `FAIL`: **BLOQUEADO en el paso 1.7**.

### Paso 1.8 — Documentar

```bash
cat >> engine/relations/docs/mapa.md <<'EOF'

## Hoja de trabajo de los pendientes (21-10-2026)
- `engine/relations/world/pending_worklist.py` genera `world/out/pending_top300.csv`: los 300 pares pendientes más importantes (importancia = √(población A × población B)). Las columnas `position_code`, `since`, `source`, `reject` y `note` van vacías: las rellena una persona con fuente.
- `engine/relations/world/ingest_reviewed.py` valida la hoja rellena y añade las filas a `model/reviewed_facts.json`. Exige un código del catálogo de estados, una fuente de al menos 15 caracteres, fecha `YYYY-MM[-DD]` o vacía y que no haya duplicados; si UNA fila es inválida, no escribe nada. Cada hecho caduca a los 12 meses.
- Se añadieron 4 hechos de sanciones a Rusia (Australia, Nueva Zelanda, Corea del Sur, Singapur).
EOF
tail -6 engine/relations/docs/mapa.md
```

### Paso 1.9 — Informe de la FASE 1 y PARAR

---

## 6. FASE 2 — NO HACER (necesita permiso del usuario)

No hagas nada de esto. Solo menciónalo en el informe como «pendiente»:
- Descargar el voto en la ONU (Harvard Dataverse, 2,3 MB), los visados (GitHub, 0,37 MB), UCDP, SIPRI, la base de la OMC.
- Rellenar la columna `position_code` de la hoja de trabajo.
- Añadir estados nuevos a `scoring.py` o cambiar pesos.
- Usar GDELT en la puntuación.
- Hacer `git commit`.

---

## 7. FORMATO DEL INFORME (al terminar cada fase)

```
INFORME DE LA FASE N
1. Pasos completados: (lista con ✔ o ✘)
2. Salida de run_checks.py (pégala completa)
3. git status --short (pégalo completo)
4. Ficheros que has creado o modificado: (lista)
5. Algo que no coincidió con lo esperado, aunque no bloqueara: (o «nada»)
6. Pendiente para la siguiente fase: (una línea)
```
No escribas «todo correcto» si no has pegado la salida que lo demuestra.

---

## 8. SI ALGO FALLA

| Síntoma | Qué hacer |
|---|---|
| `ModuleNotFoundError: No module named ...` al ejecutar un script de Python | Estás ejecutando desde la carpeta equivocada. Los comandos del `engine/relations/world` empiezan con `cd engine/relations/world`. No instales nada. |
| `STOP:` del script de parche | **BLOQUEADO.** Pega el mensaje. No edites a mano. |
| `npx tsc` da errores | **BLOQUEADO.** Pega los primeros 20 errores. No «arregles» los tipos por tu cuenta. |
| `vitest` da un número distinto de pruebas | **BLOQUEADO.** Pega la línea `Tests`. |
| `run_checks.py` muestra `FAIL` | **BLOQUEADO.** Pega la línea y su detalle. |
| Un comando tarda más de 15 minutos | Espera. Si pasan 30, **BLOQUEADO**: pega las últimas 10 líneas del log. |
| El navegador no abre o no carga | Salta el paso 0.6 y dilo en el informe. |
| Te falta un permiso o una herramienta | **BLOQUEADO.** Pide al usuario lo que necesitas. |
