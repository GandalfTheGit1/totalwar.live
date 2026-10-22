# Auditoría Integral y Rigurosa de Deuda Técnica (Tech Debt Audit)

**Fecha:** 2026-10-22  
**Alcance:** Repositorio Completo (`world-geopolitical-engine`: TypeScript, Next.js 16.2.6 Turbopack, React 19, Three.js / Globe.GL, API Routes, Python Relations Engine)  
**Marco de Priorización Matemática:**  
$$\text{Priority Score} = (\text{Impact} + \text{Risk}) \times (6 - \text{Esfuerzo})$$  
*(Rango: 2 a 50 puntos)*

---

## 1. Resumen Ejecutivo

- **Total de ítems auditados:** 28 ítems catalogados y priorizados matemáticamente.
- **Quick Wins inmediatos (Score $\ge$ 30, Esfuerzo $\le$ 2):** 12 ítems.
- **Refactors y mejoras estructurales:** 16 ítems.
- **Líneas de código muerto / huérfano detectadas:** > 4,500 líneas en múltiples subsistemas desconectados (`components/oraculo/`, subsistema SEC Corporate Facilities, utilidades financieras de equidad, parsers en desuso).
- **Riesgo crítico de build mitigable:** Eliminación de `typescript: { ignoreBuildErrors: true }` y aislamiento de peticiones de red estáticas en `next build`.
- **Vulnerabilidades de seguridad:** Actualización de Next.js de 16.2.6 a 16.4.2 y aislamiento seguro de `braces` vía `overrides`.

---

## 2. Tabla de Priorización

$$\text{Priority Score} = (\text{Impact} + \text{Risk}) \times (6 - \text{Esfuerzo})$$

| ID | Cat. | Archivo / Componente | Imp. (1-5) | Riesgo (1-5) | Esf. (1-5) | Score (2-50) | Acción Recomendada |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| **TD-NEW-01** | Infra | [`next.config.mjs:10`](file:///Users/ironlord/Desktop/world-geopolitical-engine/next.config.mjs#L10) | 5 | 5 | 1 | **50** | Eliminar `ignoreBuildErrors: true` para impedir despliegues con TypeScript roto |
| **TD-17** | Dep | [`package.json:26`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L26) | 5 | 5 | 2 | **40** | Actualizar `next` 16.2.6 $\rightarrow$ 16.4.2 para mitigar RCE, SSRF y DoS críticos |
| **TD-24** | Infra | [`package.json:10`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L10) | 4 | 4 | 1 | **40** | Crear `eslint.config.mjs` (flat config ESLint v10) para desbloquear CI lint |
| **TD-25** | Infra | [`app/api/dev/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/) | 5 | 5 | 2 | **40** | Declarar `dynamic = 'force-dynamic'` en las 4 rutas con fetch externo estático |
| **TD-03** | Arch | [`matrix-scene-engine.ts:9`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geopolitical/matrix-scene-engine.ts#L9) | 5 | 4 | 2 | **36** | Desacoplar matriz de 2.63 MB del bundle cliente (`.next/static` chunk 3.05 MB) |
| **TD-09** | Arch | [`mechanics-engine.ts:97`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/mechanics-engine.ts#L97) | 4 | 4 | 2 | **32** | Eliminar 5 rutas fantasma 404 (`industrial-production`, `capex`, `fx-reserves`, `geo-news`, `facilities`) |
| **TD-12** | Arch | [`structure_v6.py:21`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/structure_v6.py#L21) | 4 | 4 | 2 | **32** | Eliminar rutas absolutas a `.claude/worktrees` y `v0-equity-analysis` en Python |
| **TD-18** | Dep | [`package.json:30`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L30) | 4 | 4 | 2 | **32** | Agregar `"overrides": { "braces": "^3.0.3" }` y actualizar PostCSS a $\ge 8.5.23$ |
| **TD-NEW-04** | Infra | [`.claude/worktrees/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/) | 3 | 3 | 1 | **30** | Purgar 15 worktrees huérfanos de Claude que saturan disco y desbordan el workspace |
| **TD-21** | Doc | [`.env.local:1`](file:///Users/ironlord/Desktop/world-geopolitical-engine/.env.local#L1) | 3 | 3 | 1 | **30** | Crear `.env.example` con las 30+ variables catalogadas en TS y Python |
| **TD-27** | Infra | [`api-cache.ts:7`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/api-cache.ts#L7) | 3 | 3 | 1 | **30** | Reemplazar polución de `~/.v0-equity-analysis` por `.cache/` local al workspace |
| **TD-28** | Infra | [`data_cache.json:1`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/data_cache.json) | 3 | 3 | 1 | **30** | Desindexar 4.5 MB de cachés JSON en git (`git rm --cached`) y añadirlos a `.gitignore` |
| **TD-10** | Code | [`components/oraculo/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/oraculo/) | 4 | 3 | 2 | **28** | Purgar >4,500 líneas de código muerto (Oráculo, Corporate Facilities, Sector Base Rates) |
| **TD-08** | Arch | [`country-mechanics/route.ts:94`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/route.ts#L94) | 5 | 4 | 3 | **27** | Reemplazar fanout secuencial de 1,000 HTTP fetches internos por llamadas en memoria |
| **TD-15** | Test | [`package.json:49`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L49) | 3 | 2 | 1 | **25** | Añadir `@vitest/coverage-v8` para habilitar auditorías de cobertura desatendidas |
| **TD-02** | Code | [`country-mapper.ts:8`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/country-mapper.ts#L8) | 3 | 2 | 1 | **25** | Eliminar archivo huérfano `country-mapper.ts` (0 consumidores en todo el proyecto) |
| **TD-01** | Code | [`geo-macro-analysis/route.ts:92`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/geo-macro-analysis/route.ts#L92) | 3 | 3 | 2 | **24** | Modularizar método monstruo `POST_HANDLER` (234 líneas continuas) |
| **TD-07** | Code | [`risk-scorer.ts:41`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/risk-scorer.ts#L41) | 3 | 3 | 2 | **24** | Reemplazar magic numbers (`CN=7`, `RU=10`) por reglas transparentes en base de datos |
| **TD-13** | Test | [`app/api/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/) | 4 | 4 | 3 | **24** | Diseñar tests de integración para las 10 rutas API desprotegidas (71% de la API) |
| **TD-19** | Dep | [`geo-helpers.ts:28`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/utils/geo-helpers.ts#L28) | 3 | 3 | 2 | **24** | Consumir paquete npm `globe.gl` y eliminar inyección `<script>` dependiente de unpkg CDN |
| **TD-26** | Infra | [`geo-macro-analysis/route.ts:25`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/geo-macro-analysis/route.ts#L25) | 3 | 3 | 2 | **24** | Reemplazar `Map` en memoria sin límite ni evicción por caché acotado con LRU |
| **TD-05** | Code | [`FriendshoringSection.tsx:300`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/components/sidebar/FriendshoringSection.tsx#L300) | 3 | 2 | 2 | **20** | Aplanar anidamiento profundo (>10 niveles) en componentes del HUD y sidebar |
| **TD-11** | Arch | [`useCountryVideos.ts:2`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/hooks/useCountryVideos.ts#L2) | 3 | 2 | 2 | **20** | Reubicar `actions.ts` fuera de `app/dev/news-analyzer` hacia `lib/actions/` |
| **TD-16** | Test | [`vitest.config.ts:1`](file:///Users/ironlord/Desktop/world-geopolitical-engine/vitest.config.ts#L1) | 2 | 2 | 1 | **20** | Renombrar `vitest.config.ts` $\rightarrow$ `vitest.config.mts` para eliminar aviso ESM/CJS de Vite |
| **TD-04** | Code | [`friendshoring-service.ts:12`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/friendshoring-service.ts#L12) | 3 | 3 | 3 | **18** | Desacoplar `natural-resources.json` (495 KB) del cliente y unificar con API de recursos |
| **TD-06** | Code | [`useGlobeInit.ts:5`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/hooks/useGlobeInit.ts#L5) | 3 | 3 | 3 | **18** | Tipar 494 `any` en hooks de Three.js/Globe y retirar refs obsoletas de facilities |
| **TD-20** | Dep | [`engine/relations/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/) | 3 | 3 | 3 | **18** | Crear `pyproject.toml` declarativo y retirar CA bundle fijo `/etc/ssl/cert.pem` |
| **TD-22** | Doc | [`docs/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/docs/) | 2 | 2 | 2 | **16** | Documentar ADR sobre arquitectura del pipeline Python $\rightarrow$ `relations.json` $\rightarrow$ Next.js |
| **TD-23** | Doc | [`geographic-data.ts:21`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/geographic-data.ts#L21) | 2 | 1 | 1 | **15** | Purgar menciones a 7 componentes/rutas eliminados en docstrings de facades |
| **TD-14** | Test | [`lib/services/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/) | 3 | 3 | 4 | **12** | Desarrollar tests unitarios para los 42 módulos de servicios sin test directo |

---

## 3. Detalle de Hallazgos por Categoría

### 3.1. Infrastructure Debt

#### [TD-NEW-01] Supresión de Errores TypeScript en Build de Producción
- **Ubicación:** [`next.config.mjs:9-11`](file:///Users/ironlord/Desktop/world-geopolitical-engine/next.config.mjs#L9-L11)
- **Categoría:** Infrastructure Debt
- **Score:** 50 (Impacto: 5, Riesgo: 5, Esfuerzo: 1)
- **Problema:** El build suprime la verificación de tipos (`ignoreBuildErrors: true`), permitiendo desplegar código con tipos rotos a producción.
- **Propuesta:** Retirar la propiedad `ignoreBuildErrors: true` y garantizar que `npm run typecheck` gobierne el pipeline de CI.

#### [TD-24] Fallo Terminal de Linting por Falta de Flat Config ESLint
- **Ubicación:** [`package.json:10`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L10)
- **Categoría:** Infrastructure Debt
- **Score:** 40 (Impacto: 4, Riesgo: 4, Esfuerzo: 1)
- **Problema:** ESLint v10 falla inmediatamente con error `ESLint couldn't find an eslint.config.* file`.
- **Propuesta:** Crear `eslint.config.mjs` con soporte flat config para Next.js y TypeScript.

#### [TD-25] Peticiones Externas no Aisladas durante `next build`
- **Ubicación:** [`app/api/dev/world-tension/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/world-tension/route.ts), [`baltic-dry-index/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/baltic-dry-index/route.ts), [`world-bank-lpi/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/world-bank-lpi/route.ts), [`country-mechanics/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/route.ts)
- **Categoría:** Infrastructure Debt
- **Score:** 40 (Impacto: 5, Riesgo: 5, Esfuerzo: 2)
- **Problema:** Al ser rutas estáticas sin dynamic runtime, `next build` lanza cientos de peticiones externas (GDELT, World Bank, web scraping) provocando fallos por rate limit y degradación severa del empaquetado.
- **Propuesta:** Declarar `export const dynamic = 'force-dynamic'` en las 4 rutas.

#### [TD-NEW-04] Acumulación de 15 Git Worktrees de Claude en Disco Local
- **Ubicación:** [`.claude/worktrees/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/.claude/worktrees/)
- **Categoría:** Infrastructure Debt
- **Score:** 30 (Impacto: 3, Riesgo: 3, Esfuerzo: 1)
- **Problema:** 15 ramas y árboles de trabajo completos replicados en disco, consumiendo gigabytes de almacenamiento y ralentizando indexadores.
- **Propuesta:** Ejecutar `git worktree prune` y remover carpetas de agentes finalizados.

#### [TD-27] Polución del Directorio `$HOME` (`~/.v0-equity-analysis`)
- **Ubicación:** [`lib/api-cache.ts:7`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/api-cache.ts#L7)
- **Categoría:** Infrastructure Debt
- **Score:** 30 (Impacto: 3, Riesgo: 3, Esfuerzo: 1)
- **Problema:** Escribe cachés fuera del espacio del proyecto en `os.homedir()`, fallando en entornos serverless o contenedores con `$HOME` de solo lectura.
- **Propuesta:** Usar `path.join(process.cwd(), '.cache')` (carpeta ya ignorada en `.gitignore`).

#### [TD-28] Cachés JSON Voluminosos Versionados en el Árbol Git
- **Ubicación:** [`engine/relations/model/data_cache.json`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/data_cache.json) (3.2 MB), [`migration_cache.json`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/migration_cache.json) (1.1 MB), [`verify_cache.json`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/verify_cache.json) (233 KB)
- **Categoría:** Infrastructure Debt
- **Score:** 30 (Impacto: 3, Riesgo: 3, Esfuerzo: 1)
- **Problema:** ~4.5 MB de datos de caché versionados innecesariamente en Git.
- **Propuesta:** Desindexar con `git rm --cached` y añadir la regla `engine/relations/model/*cache*.json` a `.gitignore`.

#### [TD-26] Caché en Memoria Ilimitado sin Evicción
- **Ubicación:** [`geo-macro-analysis/route.ts:25`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/geo-macro-analysis/route.ts#L25)
- **Categoría:** Infrastructure Debt
- **Score:** 24 (Impacto: 3, Riesgo: 3, Esfuerzo: 2)
- **Problema:** `serverAnalysisCache` es un `Map` global sin política de expiración ni límite de entradas (riesgo de memory leak acumulativo).
- **Propuesta:** Sustituir por una implementación LRU con TTL o tamaño máximo acotado.

---

### 3.2. Dependency Debt

#### [TD-17] Vulnerabilidades Críticas en Next.js App Router
- **Ubicación:** [`package.json:26`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L26)
- **Categoría:** Dependency Debt
- **Score:** 40 (Impacto: 5, Riesgo: 5, Esfuerzo: 2)
- **Problema:** `next@16.2.6` sufre múltiples CVEs severos (RCE en Windows/Images, SSRF y DoS en Server Actions, bypass de middleware).
- **Propuesta:** Actualizar a `next@16.4.2`.

#### [TD-18] Vulnerabilidad DoS en Braces y Manejo de Parche
- **Ubicación:** [`package.json:30`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L30)
- **Categoría:** Dependency Debt
- **Score:** 32 (Impacto: 4, Riesgo: 4, Esfuerzo: 2)
- **Problema:** `braces` vulnerable a DoS por agotamiento de pila. `npm audit fix --force` rompe el proyecto degradando `@next/eslint-plugin-next` a v14.
- **Propuesta:** Añadir `"overrides": { "braces": "^3.0.3" }` y actualizar PostCSS a $\ge 8.5.3$.

#### [TD-19] Inyección Dinámica de `<script>` desde CDN unpkg para Globe.gl
- **Ubicación:** [`geo-helpers.ts:28`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/utils/geo-helpers.ts#L28)
- **Categoría:** Dependency Debt
- **Score:** 24 (Impacto: 3, Riesgo: 3, Esfuerzo: 2)
- **Problema:** Pese a tener `"globe.gl": "^2.32.1"` en `package.json`, la app inyecta un `<script>` a `unpkg.com` en runtime, fallando bajo CSP o sin internet.
- **Propuesta:** Importar el módulo npm directamente con SSR deshabilitado (`dynamic(() => import('globe.gl'), { ssr: false })`).

#### [TD-20] Sub-motor Python sin Declaración Formal de Entorno
- **Ubicación:** [`engine/relations/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/)
- **Categoría:** Dependency Debt
- **Score:** 18 (Impacto: 3, Riesgo: 3, Esfuerzo: 3)
- **Problema:** 73 scripts Python sin manifiesto `pyproject.toml` y con CA certs hardcodeados a macOS (`/etc/ssl/cert.pem`).
- **Propuesta:** Declarar `pyproject.toml` y usar `ssl.create_default_context()` genérico.

---

### 3.3. Architecture Debt

#### [TD-03] Chunk de Cliente de 3.05 MB por Acoplamiento de la Matriz Geopolítica
- **Ubicación:** [`matrix-scene-engine.ts:9`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geopolitical/matrix-scene-engine.ts#L9) y [`GeopoliticalHUD.tsx:241`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/components/GeopoliticalHUD.tsx#L241)
- **Categoría:** Architecture Debt
- **Score:** 36 (Impacto: 5, Riesgo: 4, Esfuerzo: 2)
- **Problema:** El HUD cliente arrastra [`geopolitical-global-matrix.json`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/data/geopolitical-global-matrix.json) (2.63 MB) solo para mostrar tres escalares iniciales, inflando el chunk de producción a > 3 MB.
- **Propuesta:** Extraer las estadísticas agregadas a un JSON liviano (< 1 KB) y cargar los grafos detallados bajo demanda (Lazy/API).

#### [TD-09] 5 Endpoints Fantasma (404 en Runtime)
- **Ubicación:** [`mechanics-engine.ts:97,121,132`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/mechanics-engine.ts#L97-L132), [`NewsPanel.tsx:20`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/components/NewsPanel.tsx#L20), [`useCorporateFacilities.ts:21`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geographic-operations/facilities/useCorporateFacilities.ts#L21)
- **Categoría:** Architecture Debt
- **Score:** 32 (Impacto: 4, Riesgo: 4, Esfuerzo: 2)
- **Problema:** Peticiones HTTP a rutas que no existen (`/api/dev/industrial-production`, `/api/dev/capex`, `/api/dev/fx-reserves`, `/api/dev/geo-news`, `/api/stocks/${ticker}/facilities`).
- **Propuesta:** Limpiar llamadas huérfanas en `mechanics-engine.ts`, implementar la ruta formal para `NewsPanel` y purgar `useCorporateFacilities.ts`.

#### [TD-12] Acoplamiento a Rutas Temporales de Agentes y Proyectos Externos
- **Ubicación:** [`structure_v6.py:21`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/structure_v6.py#L21), [`structure_v4.py:20`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/structure_v4.py#L20), [`providers.py:7`](file:///Users/ironlord/Desktop/world-geopolitical-engine/engine/relations/model/providers.py#L7)
- **Categoría:** Architecture Debt
- **Score:** 32 (Impacto: 4, Riesgo: 4, Esfuerzo: 2)
- **Problema:** Rutas hardcodeadas hacia `.claude/worktrees/...` y carpetas de otros proyectos (`v0-equity-analysis-with-buffett`).
- **Propuesta:** Resolver paths con `pathlib.Path(__file__).resolve().parents[...]`.

#### [TD-08] Fanout Secuencial de 1,000 Fetches Internos en `country-mechanics`
- **Ubicación:** [`country-mechanics/route.ts:94`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/route.ts#L94) y [`mechanics-engine.ts:95`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/mechanics-engine.ts#L95)
- **Categoría:** Architecture Debt
- **Score:** 27 (Impacto: 5, Riesgo: 4, Esfuerzo: 3)
- **Problema:** Bucle de 200 países $\times$ 5 endpoints HTTP internos con pausas artificiales de 50ms (acumula >10s de latencia innecesaria).
- **Propuesta:** Ejecutar funciones directamente en memoria y paralelizar la computación.

#### [TD-11] Inversión de Capas en Server Actions
- **Ubicación:** [`useCountryVideos.ts:2`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/hooks/useCountryVideos.ts#L2) $\rightarrow$ [`app/dev/news-analyzer/actions.ts:23`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/dev/news-analyzer/actions.ts#L23)
- **Categoría:** Architecture Debt
- **Score:** 20 (Impacto: 3, Riesgo: 2, Esfuerzo: 2)
- **Problema:** Componentes cliente importando acciones desde directorios de páginas sin estructura arquitectónica clara.
- **Propuesta:** Mover acciones de servidor a `lib/actions/`.

---

### 3.4. Code Debt

#### [TD-10] Purgado Masivo de Código Huérfano (> 4,500 líneas)
- **Ubicación:** `components/oraculo/`, `lib/data/corporate-facilities/`, `components/geographic-operations/`, `lib/services/geographic/sec-properties*`, `lib/macro/sector-base-rates.ts`, `lib/types/education-city-game.ts`, `lib/constants/financial.ts`, `lib/local-cache.ts`, etc.
- **Categoría:** Code Debt
- **Score:** 28 (Impacto: 4, Riesgo: 3, Esfuerzo: 2)
- **Problema:** Más de 4,500 líneas de código y estilos sin uso heredados de prototipos previos que sobrecargan la base de código.
- **Propuesta:** Purgar directorios y módulos huérfanos, retirando `@import` en `globals.css` y suites de test de módulos extintos.

#### [TD-02] Eliminación de `country-mapper.ts` (0 Consumidores)
- **Ubicación:** [`lib/services/geographic/country-mapper.ts:8`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/country-mapper.ts#L8)
- **Categoría:** Code Debt
- **Score:** 25 (Impacto: 3, Riesgo: 2, Esfuerzo: 1)
- **Problema:** Módulo de 219 líneas con 0 referencias e imports en todo el repositorio.
- **Propuesta:** Eliminar el archivo por completo.

#### [TD-01] Método Monstruo en Análisis Causal Macro (`POST_HANDLER`)
- **Ubicación:** [`geo-macro-analysis/route.ts:92-325`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/geo-macro-analysis/route.ts#L92-L325)
- **Categoría:** Code Debt
- **Score:** 24 (Impacto: 3, Riesgo: 3, Esfuerzo: 2)
- **Problema:** Función de 234 líneas continuas mezclando parseo, fallback de modelos, saneamiento de markdown y gestión de caché.
- **Propuesta:** Extraer subrutinas puras (`buildDalioPrompt`, `sanitizeLlmResponse`, `getOrSetServerCache`).

#### [TD-07] Magic Numbers en Scoring de Riesgo País
- **Ubicación:** [`risk-scorer.ts:41`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/risk-scorer.ts#L41)
- **Categoría:** Code Debt
- **Score:** 24 (Impacto: 3, Riesgo: 3, Esfuerzo: 2)
- **Problema:** Valores de riesgo hardcodeados (`CN=7`, `RU=10`) sin trazabilidad ni documentación.
- **Propuesta:** Mover reglas a la base de datos o a configuración de políticas declarativa.

#### [TD-05] Anidamiento JSX Profundo (> 10 niveles) en Sidebar
- **Ubicación:** [`FriendshoringSection.tsx:280-315`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/components/sidebar/FriendshoringSection.tsx#L280-L315)
- **Categoría:** Code Debt
- **Score:** 20 (Impacto: 3, Riesgo: 2, Esfuerzo: 2)
- **Problema:** Componentes con más de 10 niveles de anidación condicional y mapeo JSX.
- **Propuesta:** Extraer `<FriendshoringArcCard arc={arc} />`.

#### [TD-04] Duplicación y Peso de Datos de Recursos Naturales
- **Ubicación:** [`friendshoring-service.ts:12`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/friendshoring-service.ts#L12)
- **Categoría:** Code Debt
- **Score:** 18 (Impacto: 3, Riesgo: 3, Esfuerzo: 3)
- **Problema:** Importación directa de `natural-resources.json` (495 KB) duplicada con la API `/api/resources`.
- **Propuesta:** Unificar la fuente de datos a través de la API o capa de servicio compartida.

#### [TD-06] Tipado Débil (`any`) Extendido
- **Ubicación:** 494 ocurrencias en 121 archivos. Concentración en [`useGlobeInit.ts:5-16`](file:///Users/ironlord/Desktop/world-geopolitical-engine/components/geopolitical-monitor/hooks/useGlobeInit.ts#L5-L16).
- **Categoría:** Code Debt
- **Score:** 18 (Impacto: 3, Riesgo: 3, Esfuerzo: 3)
- **Problema:** Pérdida de autocompletado y seguridad de tipos en hooks de visualización 3D y clientes de base de datos.
- **Propuesta:** Tipar formalmente las interfaces de Three.js y retirar referencias obsoletas a handlers de instalaciones.

---

### 3.5. Test Debt

#### [TD-15] Ausencia de `@vitest/coverage-v8`
- **Ubicación:** [`package.json:49`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L49)
- **Categoría:** Test Debt
- **Score:** 25 (Impacto: 3, Riesgo: 2, Esfuerzo: 1)
- **Problema:** Ejecutar cobertura bloquea el proceso interactivo de Vitest pidiendo confirmación de instalación de paquete.
- **Propuesta:** Instalar `@vitest/coverage-v8` en devDependencies.

#### [TD-13] Brecha de Cobertura en Rutas API (71% Sin Tests)
- **Ubicación:** [`app/api/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/)
- **Categoría:** Test Debt
- **Score:** 24 (Impacto: 4, Riesgo: 4, Esfuerzo: 3)
- **Problema:** 10 de 14 rutas no tienen ningún test de integración automatizado.
- **Propuesta:** Crear suite de pruebas de integración con mocks para proveedores externos.

#### [TD-16] Advertencia de Formato de Configuración en Vite/Vitest
- **Ubicación:** [`vitest.config.ts:1`](file:///Users/ironlord/Desktop/world-geopolitical-engine/vitest.config.ts#L1)
- **Categoría:** Test Debt
- **Score:** 20 (Impacto: 2, Riesgo: 2, Esfuerzo: 1)
- **Problema:** Advertencia recurrente de formato ESM/CJS de Vite al cargar la configuración.
- **Propuesta:** Renombrar a `vitest.config.mts`.

#### [TD-14] 42 Módulos de Servicios sin Pruebas Unitarias Directas
- **Ubicación:** [`lib/services/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/)
- **Categoría:** Test Debt
- **Score:** 12 (Impacto: 3, Riesgo: 3, Esfuerzo: 4)
- **Problema:** Módulos de cálculo y transformación geopolítica sin validación unitaria directa.
- **Propuesta:** Diseñar tests unitarios para los servicios nucleares de la plataforma.

---

### 3.6. Documentation Debt

#### [TD-21] Ausencia de `.env.example` para 30+ Variables Requeridas
- **Ubicación:** Raíz del proyecto
- **Categoría:** Documentation Debt
- **Score:** 30 (Impacto: 3, Riesgo: 3, Esfuerzo: 1)
- **Problema:** 30+ variables de entorno requeridas entre TS y Python no están inventariadas, impidiendo el setup local fluido.
- **Propuesta:** Crear `.env.example` documentado con proveedores y ejemplos.

#### [TD-22] Ausencia de ADR sobre Pipeline Híbrido Python / Next.js
- **Ubicación:** [`docs/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/docs/)
- **Categoría:** Documentation Debt
- **Score:** 16 (Impacto: 2, Riesgo: 2, Esfuerzo: 2)
- **Problema:** No se documenta la decisión de arquitectura de procesar relaciones offline en Python y consumirlas estáticamente en Next.js.
- **Propuesta:** Crear `docs/adr/001-offline-python-relations-pipeline.md`.

#### [TD-23] Comentarios Desactualizados en Facades de Dominio
- **Ubicación:** [`lib/geographic-data.ts:14-29`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/geographic-data.ts#L14-L29)
- **Categoría:** Documentation Debt
- **Score:** 15 (Impacto: 2, Riesgo: 1, Esfuerzo: 1)
- **Problema:** Lista de consumidores en docstring menciona 7 componentes y rutas eliminados.
- **Propuesta:** Actualizar comentarios para reflejar los consumidores activos actuales.

---

## 4. Plan de Remediación por Fases

### Fase 1: Desbloqueo Crítico y Quick Wins Inmediatos (Score $\ge$ 30, Esfuerzo $\le$ 2)
- [ ] **TD-NEW-01:** Retirar `ignoreBuildErrors: true` en [`next.config.mjs:10`](file:///Users/ironlord/Desktop/world-geopolitical-engine/next.config.mjs#L10).
- [ ] **TD-24:** Crear [`eslint.config.mjs`](file:///Users/ironlord/Desktop/world-geopolitical-engine/eslint.config.mjs) con soporte flat config para ESLint v10 y restaurar `npm run lint`.
- [ ] **TD-25:** Añadir `export const dynamic = 'force-dynamic'` en las 4 rutas estáticas de [`app/api/dev/`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/).
- [ ] **TD-17:** Actualizar `next` a `16.4.2` en [`package.json:26`](file:///Users/ironlord/Desktop/world-geopolitical-engine/package.json#L26).
- [ ] **TD-18:** Añadir `"overrides": { "braces": "^3.0.3" }` en `package.json` y actualizar `postcss` a `^8.5.3`.
- [ ] **TD-21:** Crear `.env.example` con las 30+ variables documentadas.
- [ ] **TD-27:** Modificar [`lib/api-cache.ts:7`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/api-cache.ts#L7) para utilizar `.cache/` local.
- [ ] **TD-28:** Desindexar con `git rm --cached` los 4 archivos JSON de caché en `engine/relations/model/` y agregarlos a `.gitignore`.
- [ ] **TD-NEW-04:** Limpiar los 15 worktrees huérfanos de Claude en `.claude/worktrees/`.
- [ ] **TD-02:** Eliminar el archivo huérfano [`country-mapper.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/services/geographic/country-mapper.ts).
- [ ] **TD-16:** Renombrar `vitest.config.ts` $\rightarrow$ `vitest.config.mts`.
- [ ] **TD-15:** Instalar `@vitest/coverage-v8` en `devDependencies`.

### Fase 2: Reducción de Riesgo Crítico, Purga y Rendimiento (Score $\ge$ 24)
- [ ] **TD-03:** Desacoplar [`geopolitical-global-matrix.json`](file:///Users/ironlord/Desktop/world-geopolitical-engine/lib/data/geopolitical-global-matrix.json) del bundle cliente, reduciendo el chunk en 2.63 MB.
- [ ] **TD-10:** Purgar >4,500 líneas de código muerto (Oráculo, Corporate Facilities, Sector Base Rates, etc.).
- [ ] **TD-08:** Refactorizar [`country-mechanics/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/country-mechanics/route.ts) eliminando el fanout de 1,000 HTTP fetches internos.
- [ ] **TD-09:** Eliminar llamadas a rutas fantasma 404 y crear formalmente `/api/dev/geo-news`.
- [ ] **TD-12:** Corregir rutas absolutas en scripts Python (`structure_v6.py`, `structure_v4.py`, `providers.py`).
- [ ] **TD-19:** Eliminar la inyección `<script src="unpkg...">` en `geo-helpers.ts` usando la instalación nativa de `globe.gl`.
- [ ] **TD-01:** Modularizar `POST_HANDLER` en [`geo-macro-analysis/route.ts`](file:///Users/ironlord/Desktop/world-geopolitical-engine/app/api/dev/geo-macro-analysis/route.ts).
- [ ] **TD-26:** Sustituir caché en memoria ilimitado por solución con LRU y TTL.

### Fase 3: Mejoras Estructurales y Cobertura a Medio Plazo
- [ ] **TD-13:** Diseñar suite de tests de integración para las 10 rutas API desprotegidas en `__tests__/api-routes/`.
- [ ] **TD-04:** Unificar `natural-resources.json` (495 KB) con la API de recursos.
- [ ] **TD-06:** Tipado riguroso de eventos en Three.js/Globe y eliminación de handlers obsoletos en `useGlobeInit.ts`.
- [ ] **TD-07:** Mover overrides fijos (`CN=7`, `RU=10`) de `risk-scorer.ts` a la tabla `countries` en base de datos.
- [ ] **TD-11:** Mover `actions.ts` de `app/dev/news-analyzer/` a `lib/actions/`.
- [ ] **TD-20:** Estandarizar el entorno Python mediante `pyproject.toml`.
- [ ] **TD-22:** Documentar ADR sobre el pipeline de relaciones bilaterales.
- [ ] **TD-23:** Limpiar docstrings y contratos obsoletos en facades.
- [ ] **TD-14:** Desarrollar tests unitarios para los 42 servicios no testeados directamente.

---

## 5. Reglas de Prevención de "Agentic Tech Debt"

Al implementar las soluciones de este plan:
1. **No alterar el comportamiento observable:** Un refactor mejora la estructura interna sin cambiar contratos ni romper tests.
2. **Commits y cambios atómicos:** Cada ítem remediado debe resolverse en un cambio acotado y verificable.
3. **No inventar nuevas dependencias:** Resolver la deuda utilizando las librerías nativas o ya presentes en el proyecto (evitar librerías cosméticas para utilidades simples).
