# PROMPT PARA GEMINI 3.8 EN ANTIGRAVITY
# Tarea: aplicar acuerdos comerciales de la OMC y corregir los tratados de inversión (ejecutar, medir, informar)

Pega todo este documento como primer mensaje. Después escribe: **«Empieza por el PASO 0 y sigue hasta el informe»**.

---

## 0. REGLAS QUE NO SE NEGOCIAN

Eres un ingeniero que sigue instrucciones al pie de la letra. En esta tarea **el código ya está escrito y probado**; tú solo ejecutas, comparas y avisas. No decides si el resultado es bueno: lo decide el usuario con tu informe.

1. **Un paso cada vez, en orden.** Cada paso tiene un comando exacto y un «RESULTADO ESPERADO».
2. **Después de cada comando, pega su salida real** (sin resumir) y compárala con lo esperado.
3. **Si no coincide, PARA.** Escribe `BLOQUEADO en el paso X` y pega la salida completa. No sigas, no arregles, no pruebes alternativas.
4. **Prohibido, aunque te parezca buena idea:**
   - `git commit`, `git push`, `git stash`, `git checkout`, `git reset`, `git clean`, `git rebase`, `git restore`.
   - Descargar nada (ni `curl`, `wget`, `pip install`, `npm install`).
   - **Tocar la puntuación para que los controles salgan bien.** Si un control falla, se informa tal cual. No cambies pesos, reglas, listas de casos ni umbrales. Los casos y umbrales están fijados con hash antes de empezar.
   - Modificar `engine/relations/world/audit_trade.py` o cualquier `*.sha256`, `audit_benchmark.py`, `audit_holdout.py`, `audit_blocs.py`, `audit_map.py`, nada de `engine/relations/calibration/anchors*.py`.
   - Editar a mano `engine/relations/model/structure.py`, `scoring.py` o `wto_rta.py`.
   - Inventar números o resultados. Si algo no sale, dilo.
5. **El árbol de git ya tiene cambios sin confirmar.** Son trabajo previo válido. No los toques ni los reviertas. Pega `git status --short` en tu informe como punto de partida.
6. **Entorno:** macOS, zsh. Usa siempre `python3 -I`. Rutas relativas a la raíz del repositorio.
7. Los comandos de más de 2 minutos van en segundo plano; espera a que terminen antes de seguir.
8. Lleva una lista de tareas y marca los pasos. Primero escribe un plan de 5 líneas.
9. Al terminar escribe el **informe** del apartado 6 y **detente**. No hagas commit.

---

## 1. CONTEXTO MÍNIMO (léelo, no hay nada que hacer aquí)

- **Repositorio:** `/Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae` (rama `claude/project-new-features-review-f92aae`).
- Un motor en Python (`engine/relations/`) puntúa la relación de los 19.306 pares de países. Cada par tiene *estados* (por ejemplo `FTA_IN_FORCE` = libre comercio en vigor, +12 puntos).
- **Qué cambia en esta tarea** (ya está programado, sin ejecutar sobre todos los pares):
  1. **Lista de acuerdos regionales de la OMC** (`engine/relations/model/wto/rta_all.xlsx`, leída por `model/wto_rta.py`): cada acuerdo en vigor se expande a pares de países y añade `FTA_IN_FORCE` (libre comercio / unión aduanera) o `PREFERENTIAL_TRADE` (preferencias). Hasta ahora solo se veían acuerdos a través de bloques (UE, Mercosur…); faltaban los bilaterales (China–Australia, India–Japón, EE. UU.–Corea…).
  2. **Tratados de inversión (BIT):** pasan de `+2` dentro de `BILATERAL_TREATIES` a un estado propio `INVESTMENT_TREATY` de `+1`, y se descartan los pactados entre dos miembros de la UE (extinguidos por el acuerdo del 5-5-2020).
- **Qué falta hacer:** repuntuar los 19.306 pares con el código nuevo, medir con los controles fijados antes (`world/audit_trade.py`, hash `a9ff35ef…`), regenerar el fichero de la app y comprobar que nada se rompe.
- **Esperable, no es un error:** los pares entre miembros de la UE reciben `FTA_IN_FORCE` (+12) además de `DEEP_INTEGRATION` (+25). Esto puede subir pares muy integrados a la banda `ALLIED`. **No lo arregles**: cuéntalo en el informe (el paso 5 lo mide).

---

## 2. PASO 0 — COMPROBACIÓN INICIAL

```bash
cd /Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae
git branch --show-current
git status --short
shasum -a 256 engine/relations/world/audit_trade.py
cat engine/relations/world/audit_trade.sha256
shasum -a 256 engine/relations/model/wto/rta_all.xlsx
cmp engine/relations/world/out/pairs.json engine/relations/world/out/pairs_before_wto.json && echo IDENTICAL
```

**RESULTADO ESPERADO**
- La rama es `claude/project-new-features-review-f92aae`.
- El hash de `audit_trade.py` empieza por `a9ff35ef154a1a32` (igual que en `audit_trade.sha256`).
- El hash de `rta_all.xlsx` empieza por `4dfa029e89bddc6c`.
- Sale `IDENTICAL` (`pairs.json` todavía es el de antes del cambio y su copia de seguridad es igual).

Si algo es distinto: **BLOQUEADO en el paso 0**.

---

## 3. PASO 1 — ESTADO ANTES DE REPUNTUAR

```bash
python3 -I engine/relations/docs/gemini_trade/run_checks.py pre
```
(tarda 2–3 minutos)

**RESULTADO ESPERADO**
- Todas las líneas `PASS`, **menos una**: `FAIL (expected before the rescoring)  audit_trade A and B`. Esa es correcta porque `pairs.json` aún es el viejo.
- Dentro de la salida verás `A. WTO positives 15/26` y `B. ... 2/5 ... 0/4`. Pégalo.
- Última línea: `12/12 checks passed`.

Si hay otro `FAIL`: **BLOQUEADO en el paso 1**.

---

## 4. PASO 2 — REPUNTUAR LOS 19.306 PARES (unos 8 minutos)

```bash
cd engine/relations/world
WGE_OFFLINE=1 nohup python3 -I score_all.py > out/score_wto.log 2>&1 &
echo started
```
Espera con comandos cortos (uno cada minuto) hasta que el proceso termine:
```bash
pgrep -f score_all.py > /dev/null && echo "sigue corriendo" || echo "terminado"
tail -n 5 out/score_wto.log
ls -la out/pairs.json
```

**RESULTADO ESPERADO:** al terminar, `out/pairs.json` tiene una hora de modificación nueva y `score_wto.log` termina sin la palabra `Traceback`. Si hay `Traceback` o el proceso termina en menos de 1 minuto: **BLOQUEADO en el paso 2**.

No lances el comando dos veces. No uses `kill`, salvo que el usuario lo pida.

---

## 5. PASO 3 — MEDIR

Vuelve a la raíz del repositorio y ejecuta:

```bash
cd /Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/project-new-features-review-f92aae
python3 -I engine/relations/world/audit_trade_eval.py
```
Pega la salida entera. Contiene: **A** (positivos y negativos de la OMC), **B** (tratados de inversión), el cambio de estados y las bandas que cambian de grupo.

Después:
```bash
cd engine/relations/world && WGE_OFFLINE=1 python3 -I export_app.py && cd ../../..
python3 -I engine/relations/docs/gemini_trade/run_checks.py post
```

**CÓMO LEER EL RESULTADO (sin decidir nada tú)**

| Resultado | Qué haces |
|---|---|
| Todo `PASS`, última línea `12/12 checks passed` | Sigue al apartado 6 (informe), marcando «TODO PASA». |
| Falla **A** o **B** de `audit_trade` | Informe con la salida completa, marcando «FALLA A/B». **No arregles nada.** |
| Falla cualquier otra línea (banco de 89 pares, bloques, mapa, hold-out, calibración, tests) | Informe con la salida completa, marcando «REGRESIÓN». **No arregles nada.** |

Si hay fallos, **no regeneres nada más y no ejecutes otra vez el paso 2**. El usuario decide con tu informe si se adopta, se descarta o se corrige con un protocolo nuevo.

---

## 6. INFORME FINAL (rellénalo, no lo resumas más)

1. `git status --short` del paso 0.
2. Salida completa de `run_checks.py pre` y de `run_checks.py post`.
3. Salida completa de `audit_trade_eval.py`.
4. Estas cinco cifras (cópialas de la salida del evaluador, no las calcules a mano): pares con `FTA_IN_FORCE` ahora menos antes; ídem `PREFERENTIAL_TRADE`; ídem `INVESTMENT_TREATY`; ídem `BILATERAL_TREATIES`; número de pares cuya banda cambió.
5. Veredicto en una línea: `TODO PASA` / `FALLA A` / `FALLA B` / `REGRESIÓN en: <líneas>`.
6. Lo que no pudiste hacer o no entendiste. Si no hay nada, escribe «nada».

**No hagas commit. No empieces nada más.**
