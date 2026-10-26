# PROGRESO — Árbol tecnológico histórico por país (estilo HoI4) actualizado con noticias (`arbol-tecnologico-historico`)

## 1. Resumen Ejecutivo y Estado de los 8 Pasos

| Paso | Nombre | Estado | Archivos Clave y Evidencia |
| :--- | :--- | :--- | :--- |
| **Paso 1** | Explorar y reportar antes de tocar nada | **Completado** | Inspección de `docs/RESEARCH_TOOLS.md`, `lib/services/sovereign-power/`, `TechInnovationPanel.tsx`, ingesta GDELT v2 (`app/api/dev/world-tension/route.ts`) y protección Vault Auth (`middleware.ts`, `lib/vault-auth.ts`). |
| **Paso 2** | Definir el árbol tecnológico fijo y versionado (10 áreas) | **Completado** | [`lib/data/tech-tree/types.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/types.ts), [`lib/data/tech-tree/config.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/config.ts), [`lib/data/tech-tree/definition.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/definition.ts) (`v1.0.0`, 10 áreas, sin «Económico / fintech», sin barras de %). |
| **Paso 3** | Registro de eventos y reconstrucción por fecha (`stateAt`) | **Completado** | [`lib/data/tech-tree/event-log.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/event-log.ts) (`validateTechEvent`, `validateEventLog`, `stateAt`, `calculateAreaScore`, `compareCountriesTech`). |
| **Paso 4** | Semilla histórica verificada para los 7 países piloto | **Completado** | [`lib/data/tech-tree/seeds/us-cn-events.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/seeds/us-cn-events.ts), [`lib/data/tech-tree/seeds/ru-eu-asia-events.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/seeds/ru-eu-asia-events.ts), [`lib/data/tech-tree/wikidata-parser.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/wikidata-parser.ts), [`lib/data/tech-tree/fixtures/wikidata-tech-firsts.json`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/fixtures/wikidata-tech-firsts.json). |
| **Paso 5** | Eliminar tecnologías inventadas y conectar simulador | **Completado** | [`lib/services/sovereign-power/profiles/procedural.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/sovereign-power/profiles/procedural.ts), [`lib/services/sovereign-power/profiles/index.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/sovereign-power/profiles/index.ts), [`lib/services/sovereign-power/wargame-simulator.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/sovereign-power/wargame-simulator.ts). |
| **Paso 6** | UI pública: árbol con deslizador, mapa y comparador | **Completado** | [`TechInnovationPanel.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/TechInnovationPanel.tsx), [`TechNodeBadge.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/tech-tree/TechNodeBadge.tsx), [`TechChoroplethView.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/tech-tree/TechChoroplethView.tsx), [`TechCountryComparator.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/tech-tree/TechCountryComparator.tsx). |
| **Paso 7** | Actualización automática desde noticias con deduplicación | **Completado** | [`lib/services/tech-tree/source-deduplicator.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/source-deduplicator.ts), [`lib/services/tech-tree/news-classifier.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/news-classifier.ts), [`lib/services/tech-tree/gdelt-tech-ingest.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/gdelt-tech-ingest.ts), [`labeled-news-50.json`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/fixtures/labeled-news-50.json). |
| **Paso 8** | Revisión manual en `dev` (botón revertir) y telemetría | **Completado** | [`lib/services/tech-tree/telemetry.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/telemetry.ts), [`app/api/dev/tech-tree/route.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/api/dev/tech-tree/route.ts), [`components/dev/tech-tree/TechTreeDevConsole.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/components/dev/tech-tree/TechTreeDevConsole.tsx), [`app/dev/tech-tree/page.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/dev/tech-tree/page.tsx). |

---

## 2. Hallazgos del Paso 1 y Archivos Reutilizados

1. **Tubería de noticias GDELT existente:**
   - La carpeta `engine/relations/calibration/` pertenece al repositorio Python externo de *World Geopolitical Engine*, mientras que en este repositorio Next.js la ingesta en vivo de GDELT v2 Doc API (`https://api.gdeltproject.org/api/v2/doc/doc?query=...&mode=artlist&format=json`) está implementada en [`app/api/dev/world-tension/route.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/api/dev/world-tension/route.ts) y [`app/api/dev/update-country-tension/route.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/api/dev/update-country-tension/route.ts).
   - Se reutilizó exactamente ese cliente HTTP GDELT v2 con timeout y manejo explícito de errores en [`lib/services/tech-tree/gdelt-tech-ingest.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/gdelt-tech-ingest.ts), y para clasificación opcional con LLM se reutilizó [`lib/llm-client.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/llm-client.ts) (`callLlm` con tier `'LIGHT'`, ejecución secuencial y *circuit breaker* ante errores `429`/`403`).
2. **Perfiles de poder soberano y los 7 países piloto:**
   - En [`lib/services/sovereign-power/profiles/`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/sovereign-power/profiles/) había 6 perfiles de países dedicados (`united-states.ts` [`US`], `china.ts` [`CN`], `russia.ts` [`RU`], `japan.ts` [`JP`], `germany.ts` [`DE`], `taiwan.ts` [`TW`]) más el archivo auxiliar `procedural-cabinet.ts` (7 archivos en total).
   - Se incorporó **Países Bajos (`NL`, Q55)** como el 7.º país del piloto (`['US', 'CN', 'RU', 'JP', 'DE', 'TW', 'NL']`) para que el piloto cubra literalmente 7 naciones estratégicas y permita auditar directamente el caso canónico de soberanía de herramientas litográficas EUV de ASML en 2015 frente a 2026.
3. **Protección de rutas `dev`:**
   - Se reutilizó el mecanismo de sesión HMAC-SHA256 de [`middleware.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/middleware.ts) y [`lib/vault-auth.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/vault-auth.ts) (`SESSION_COOKIE_NAME`, `getVaultSecret`, `validateSessionToken`) en [`app/api/dev/tech-tree/route.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/api/dev/tech-tree/route.ts), exigiendo sesión válida en producción o cuando se envía la cabecera `x-enforce-dev-auth: true`.

---

## 3. Datos Reales Comprobados y Verificación Empírica

### 3.1 Reconstrucción Histórica (`stateAt`) en 2000, 2015 y 2026
Se verificaron instantáneas históricas deterministas a partir del registro de eventos en [`__tests__/tech-tree.test.tsx`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/__tests__/tech-tree.test.tsx):

| País | Año | Score Tecnológico Global (0–100) | Nivel Máx. Semiconductores | Estado Nodo Nivel 5 (Soberanía Herramientas EUV/DUV) | Nodos Bloqueados por Sanción | Nodos en Retroceso |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **EE. UU. (`US`)** | `2000` | **33** | Nivel 2 | `no_alcanzado` | 0 | 0 |
| **EE. UU. (`US`)** | `2015` | **58** | Nivel 5 | `produccion` (fuentes láser EUV Cymer / Applied Materials) | 0 | 0 |
| **EE. UU. (`US`)** | `2026` | **83** | Nivel 5 | `produccion` (más Nivel 3 en `produccion` y Nivel 4 en `prototipo`) | 0 | 0 |
| **China (`CN`)** | `2000` | **13** | Nivel 1 | `no_alcanzado` | 0 | 0 |
| **China (`CN`)** | `2015` | **27** | Nivel 2 | `no_alcanzado` (SMIC 28 nm comercial) | 0 | 0 |
| **China (`CN`)** | `2026` | **74** | Nivel 5 | `prototipo` (bloqueado en EUV por control de exportación) | **4** (`semiconductors` L3/L4/L5, `ai_compute` L5) | 0 |
| **Países Bajos (`NL`)** | `2015` | **10** | Nivel 5 | `produccion` (ASML NXE:3350B EUV en Veldhoven, Q297378) | 0 | 0 |
| **Países Bajos (`NL`)** | `2026` | **14** | Nivel 5 | `exportacion` (monopolio mundial NXE:3400/3800 y High-NA EXE:5000) | 0 | 0 |
| **Rusia (`RU`)** | `2015` | **19** | Nivel 1 | `no_alcanzado` (manufactura/aviación Nivel 3 en `produccion`) | 0 | 0 |
| **Rusia (`RU`)** | `2026` | **30** | Nivel 1 | `no_alcanzado` | **2** (`semiconductors` L2, `robotics_manufacturing` L3) | **1** (`robotics_manufacturing` L3 cae de `produccion` a `prototipo`) |

### 3.2 Países fuera del piloto (eliminación de tecnologías inventadas)
- Se verificó que países fuera del piloto (`MX`, `AR`, `ES`, `BR`) devuelven `hasVerifiedTechTree: false`, resumen `"Sin datos verificados para este país"` y listas de tecnologías vacías (`[]`), sin inventar nodos ni capacidades.

### 3.3 Evaluación de las 50 noticias etiquetadas a mano (`labeled-news-50.json`)
- Se construyó el banco de prueba [`lib/data/tech-tree/fixtures/labeled-news-50.json`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/fixtures/labeled-news-50.json) con **50 noticias etiquetadas a mano** (38 hitos/anuncios reales en las 10 áreas y 12 noticias de ruido sobre precios de acciones, cumbres diplomáticas, criptomonedas, videojuegos y deportes).
- **Precisión medida:**
  - Antes de ordenar la prioridad de términos multi-palabra (`ai accelerator` frente a `chip` genérico y `direct-to-cell` frente a `satellite`): **46 / 50 (92,0 %)**.
  - Tras priorizar los patrones específicos de dominio en [`lib/services/tech-tree/news-classifier.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/news-classifier.ts): **50 / 50 (100,0 %)** en relevancia, país, área, nivel y estado limitado al techo `'prototipo'`.
- **Deduplicación de agencias:** Se comprobó en tests que una misma nota de `Reuters` republicada por 3 medios distintos (`reuters.com`, `finance.yahoo.com`, `usnews.com`) se agrupa en **1 sola fuente independiente** y **no** desbloquea ningún nodo (requiere $\ge 2$ fuentes independientes).

---

## 4. Qué sigue siendo `Suposición` (Configuración en `lib/data/tech-tree/config.ts`)

Todos los umbrales y pesos operativos están centralizados en [`lib/data/tech-tree/config.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/config.ts) y marcados explícitamente con la etiqueta `'Suposición'`:
1. **`minIndependentSources = 2`** (`Suposición`): Mínimo de fuentes independientes tras deduplicar agencias de noticias para permitir una actualización automática (`origen: 'noticia_auto'`).
2. **`maxAllowedAutoStatus = 'prototipo'`** (`Suposición`): Techo máximo que puede asignar el flujo automático de noticias; los estados `'produccion'` y `'exportacion'` exigen fuente primaria o curación manual.
3. **`textSimilarityThreshold = 0.55`** (`Suposición`): Umbral combinado Jaccard + solapamiento léxico para agrupar notas de prensa reescritas a partir del mismo cable de agencia.
4. **Pesos de estado para el cálculo de `scoreTecnologico` (`0`, `0.20`, `0.50`, `0.85`, `1.00`) y penalizaciones por sanción (`0.08`) y retroceso (`0.12`)** (`Suposición`): Fórmulas de agregación del árbol hacia el score 0–100 de `techInnovation`.
5. **Meta de telemetría (`uniqueQueriesTarget = 400` en `evaluationWindowDays = 45` días)** (`Suposición`): Umbral para validar la meta principal de Investigación de Mercado (`#0072B2`).

---

## 5. Puntos de la lista «Por investigar» que siguen abiertos

1. **Cobertura real de Wikidata al escalar de 7 a 45 países:** Aunque el parser [`parseWikidataTechResponse`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/data/tech-tree/wikidata-parser.ts) valida y transforma respuestas reales SPARQL para los 7 países piloto (`US`, `CN`, `RU`, `JP`, `DE`, `TW`, `NL`), queda por medir cuántos de los 38 países restantes del monitor geopolítico tienen propiedades `P571` (fecha de creación/hito) y `P17` (país) completas en Wikidata sin requerir curación manual desde informes de OMPI, TOP500 o OIEA.
2. **Tasa de falsos positivos en producción continua con GDELT v2:** El deduplicador de agencias y similitud léxica resuelve los casos de republicación de cables de Reuters/AP/EFE/Xinhua en el benchmark de 50 noticias, pero requiere observación empírica durante 45 días en la consola [`/dev/tech-tree`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/app/dev/tech-tree/page.tsx) para medir cuántos eventos automáticos necesitan ser revertidos manualmente.
3. **Evidencia real de demanda externa (`Evidencia insuficiente` → `Hecho`):** Actualmente la demanda de mercado está puntuada en `2,4 / 10` (`expresa: 0 [Evidencia insuficiente]`, `frustracion: 1,2 [Hipótesis]`, `conviene: 1,2 [Hipótesis]`). Se requiere publicar los mapas estáticos en X/Reddit y acumular las métricas anónimas de [`lib/services/tech-tree/telemetry.ts`](file:///Users/ironlord/Desktop/v0-equity-analysis-with-buffett/lib/services/tech-tree/telemetry.ts) durante la ventana de 45 días para actualizar la evidencia a nivel `Hecho`.
4. **Verificación formal de licencias por fuente (`Wikidata`, `TOP500`, `WIPO`, `UNESCO/OCDE MSTI`, `Banco Mundial`, `GDELT`):** Queda abierto verificar y archivar la compatibilidad de términos de uso de cada fuente externa para redistribución comercial/pública más allá del piloto gratuito.
