# Ficha Técnica: Monitor de Finanzas Públicas Soberanas y Salud Fiscal

> **ID Registro:** `finanzas-publicas-soberanas`  
> **Sistema:** `global` (World Geopolitical Engine)  
> **Estado:** `idea`  
> **Fecha de definición:** 2026-10-22  
> **Autor / Solicitante:** William  

---

## 1. Meta y Contexto

- **Meta principal:** **Seguidores** (color verde en Figma / Okabe-Ito `#009E73`).
  - *Objetivo:* Atraer y retener usuarios recurrentes en el globo 3D mediante una visualización clara, interactiva y comprensible de la salud y sostenibilidad fiscal de cada país soberano.
- **Metas secundarias:** Ninguna activa (el contenido compartible de déficit y deuda refuerza directamente la meta de Seguidores).
- **Regla del sistema: Contexto, no señal.**
  - **Hecho:** Esta funcionalidad pertenece al subsistema geopolítico global (`world-geopolitical-engine`).
  - **Inferencia:** Sirve como capa de contexto macroeconómico y comparativo soberano para los usuarios del globo interactivo.
  - **Regla innegociable:** No entra al score de valoración intrínseca de empresas (`v0-equity-analysis-with-buffett`) ni genera señales predictivas sobre cotizaciones bursátiles.

---

## 2. Qué te permite hacer

1. **Con esto puedo** consultar de forma inmediata la ratio de deuda pública sobre el PIB (% PIB), el balance presupuestario neto (déficit o superávit) y la carga de intereses de cualquier país soberano seleccionado en el globo 3D.
2. **Con esto puedo** contrastar los ingresos públicos brutos frente al gasto público total de cada Estado con métricas normalizadas y homogéneas procedentes de fuentes multilaterales oficiales (Banco Mundial, FMI, Eurostat).
3. **Con esto puedo** evaluar el grado de estrés o solvencia fiscal mediante un semáforo visual de sostenibilidad soberana (indicadores clave, presión de deuda y divergencia entre crecimiento e intereses) sin tener que bucear por múltiples portales gubernamentales dispersos.

---

## 3. Mapa de Alineación

- **Depende de:** `ninguna` (funcionalidad base e independiente; puede nutrirse de la capa base de países GeoJSON / ISO-3166 ya operativa en el globo).
- **Alimenta:**
  - **Meta del negocio:** Seguidores (retención en el globo, sesiones más largas y capturas compartibles en redes sociales).
  - **Parte del sistema:** `GeopoliticalSidebar` en `components/geopolitical-monitor/` (panel lateral táctico del país).
- **Separado a propósito de:**
  - `score de empresas`: Las métricas de déficit o deuda soberana no alteran el scorecard de 108 criterios ni el modelo de valoración P/IV15. Permanecen como filtro de contexto macro-geopolítico.
  - `calibracion-brier`: No emite predicciones probabilísticas de precios a 1-3 meses, por lo que no alimenta eventos de calibración Brier.

---

## 4. Demanda de Mercado (Rúbrica 0 a 10)

| Criterio | Puntos | Techo | Etiqueta de Evidencia | Justificación y Fuente |
|---|---|---|---|---|
| **Lo piden expresamente** (0-4) | **0.0** | 0% | **Evidencia insuficiente** | Declaración de William: *"Ninguna, estoy emulando funcionalidades de juegos a ver cuáles son las que enganchan"*. No hay peticiones expresas registradas de usuarios externos. |
| **Es una frustración actual** (0-3) | **0.0** | 0% | **Evidencia insuficiente** | Hipótesis de William: los usuarios pierden tiempo buscando y comparando datos dispersos en portales oficiales (FMI, Banco Mundial, Eurostat), pero no se dispone de entrevistas o tickets con citas textuales. |
| **Les conviene** (0-3) | **0.0** | 0% | **Evidencia insuficiente** | Suposición de que una interfaz estilo juego de estrategia (tipo Victoria 3 / HOI4) retendrá más tráfico y aumentará el tiempo de interacción con el globo. |
| **TOTAL** | **0 / 10** | — | **Evidencia insuficiente** | Nota honesta de partida. No hay penalización por empezar en 0/10; refleja con rigor la fase exploratoria de la idea. |

---

## 5. Métrica de Éxito

- **Qué se mide:** Tasa de interacción relativa en el globo (% de usuarios que tras hacer clic en un país interactúan con la sección de finanzas públicas) y tiempo medio de permanencia en dicha vista.
- **Umbral de éxito (Suposición):** Al menos un **25%** de los usuarios que seleccionan un país abren o consultan la sección fiscal, con una permanencia media no inferior a **45 segundos**.
- **Plazo:** **60 días** tras su despliegue público en el entorno de producción.
- **Registro por fecha:** Se registrará la telemetría anónima de clics y eventos de apertura por país con fecha y versión para evitar sesgos retrospectivos.

---

## 6. Datos y Riesgos

1. **Fuentes primarias candidatas:**
   - **Banco Mundial (World Bank Open Data API):** Gratuita, sin clave de API (API key), endpoints REST JSON con soporte de CORS (`api.worldbank.org/v2/country/{iso}/indicator/{code}?format=json`). Indicadores clave:
     - Deuda del gobierno central (% PIB): `GC.DOD.TOTL.GD.ZS`
     - Ingresos públicos (% PIB): `GC.REV.XGRT.GD.ZS`
     - Gastos públicos (% PIB): `GC.XPN.TOTL.GD.ZS`
     - Préstamo neto / endeudamiento neto (% PIB): `GC.NLD.TOTL.GD.ZS`
   - **FRED API / BIS / BCE:** Ya integrados parcialmente en `lib/macro/` para los países desarrollados clave (G20).
   - **Eurostat API:** Homogénea para países de la Unión Europea (procedimiento de déficit excesivo - PDE).
2. **Fragilidad y latencia:**
   - Las APIs multilaterales pueden tener latencias de 400-1500 ms y desfases de publicación de 1 a 2 años.
   - *Mitigación:* Arquitectura de doble nivel: dataset estático precompilado en JSON (`lib/data/country-public-finances.json`) para renderizado a 0 ms en el globo 3D, combinado con caché en cliente (IndexedDB L1/L2) y fallback a "Falta de Transparencia Fiscal" si el país no reporta datos.
3. **Licencias y términos de uso:**
   - Banco Mundial (CC-BY 4.0): permite uso comercial con atribución.
   - FMI: términos de uso libre con cita oficial.

---

## 7. Interfaz de Usuario (UI)

- **Ubicación:** **Pública** (abierta a todos los usuarios, sin muro de pago).
- **Componentes y pantallas:**
  1. **Sección en Sidebar (`GeopoliticalSidebar.tsx`):**
     - Nuevo subcomponente `SovereignPublicFinancesSection.tsx` ubicado dentro del panel lateral táctico del país.
     - Botón selector o sub-tab visible para alternar entre "Perfil Geopolítico", "Ciclo Dalio" y "Finanzas Públicas", o tarjeta expandible integrada en la columna principal.
  2. **Bloque de Indicadores Clave:**
     - Deuda / PIB (%) con barra visual y código cromático (verde <60%, amarillo 60-100%, rojo >100%).
     - Balance fiscal (% PIB) con badge de Déficit (rojo) o Superávit (verde).
     - Relación Ingresos vs Gastos en comparativa visual de barras apiladas o mini-gráfico.
     - Carga de intereses de la deuda (coste de servicio financiero).
  3. **Estados de UI obligatorios:**
     - *Cargando:* Skeleton loader con placeholders parpadeantes idéntico a `MacroSkeleton`.
     - *Vacío / Falta de datos:* Badge sobrio de "Falta de Transparencia Fiscal / Sin reporte oficial reciente".
     - *Error:* Mensaje de fallo no intrusivo con botón de reintento.

---

## 8. Plan por Pasos (Listos para Ejecución Autónoma)

### Paso 1: Definición del Esquema TypeScript y Dataset Base
- **Objetivo:** Definir la interfaz de datos `SovereignPublicFinances` y compilar un dataset JSON local de referencia para los ~195 países con datos de Banco Mundial / FMI.
- **Entradas:** `lib/services/geographic/` y catálogo de códigos ISO-2/3.
- **Hecho cuando:** Existe `lib/services/sovereign-finances/types.ts` y un dataset base `lib/data/sovereign-public-finances.json` que cubre los países principales con tipos validados.
- **Pruebas:** Test unitario en Jest verificando que el dataset contiene los campos obligatorios para G20 y valida rangos lógicos (p. ej., deuda > 0).
- **Commit:** `feat(macro): define sovereign public finances types and static reference dataset`

### Paso 2: Servicio de Ingestión y Endpoint de API con Caché
- **Objetivo:** Crear el servicio `SovereignFinancesService` y la ruta de API `/api/macro/[country]/finances` con soporte para IndexedDB / L1 cache.
- **Entradas:** Paso 1 terminado.
- **Hecho cuando:** La ruta `/api/macro/[country]/finances` responde en <50ms con datos cacheados y estructura normalizada.
- **Pruebas:** Test de integración de la ruta con mock de país con datos completos y país con "falta de transparencia".
- **Commit:** `feat(api): implement sovereign public finances endpoint with caching`

### Paso 3: Componente Visual `SovereignPublicFinancesSection` en el Sidebar
- **Objetivo:** Crear el componente React en Tailwind para renderizar las finanzas públicas en el sidebar del globo.
- **Entradas:** Paso 2 terminado.
- **Hecho cuando:** Al seleccionar un país en el globo interactivo, el sidebar muestra la tarjeta de finanzas públicas con deuda, déficit y desglose de ingresos/gastos.
- **Pruebas:** Test con `@testing-library/react` verificando renderizado de métricas, estilos cromáticos y fallback sin datos.
- **Commit:** `feat(ui): add SovereignPublicFinancesSection to geopolitical sidebar`

### Paso 4: Integración en `GeopoliticalSidebar` y Telemetría de Interacción
- **Objetivo:** Conectar el componente en la jerarquía del monitor geopolítico y añadir el seguimiento de interacción para medir la meta de Seguidores.
- **Entradas:** Paso 3 terminado.
- **Hecho cuando:** El usuario puede alternar la visualización fiscal de forma fluida y se registra el evento de apertura.
- **Pruebas:** Test e2e / de integración del sidebar montado comprobando que el componente responde a cambios de país.
- **Commit:** `feat(monitor): integrate sovereign finances section into sidebar navigation`

---

## 9. Modelo de IA Recomendado

- **Planificador:** `Claude 3.7 Sonnet / Gemini 3.8 Flash (High)`
- **Ejecutor:** `Gemini 3.8 Flash`
- **Verificador:** `Claude 3.7 Sonnet / Antigravity Agent`
- **Razón:** El riesgo de error silencioso en la normalización de magnitudes macroeconómicas (por ejemplo, confundir millones con miles de millones o mezclar moneda local con porcentaje del PIB) requiere un planificador estricto con validaciones por paso. La ejecución puede ser asignada a un modelo ágil (Gemini 3.8 Flash) con tests unitarios estrictos y fixtures con valores reales.
- **Etiqueta:** **Hipótesis** (pendiente de prueba empírica).

---

## 10. Criterios de Aceptación

1. **Determinismo:** Los valores de Deuda/PIB y Déficit mostrados coinciden exactamente con los datos oficiales reportados por la fuente multilateral, sin alucinación de LLM.
2. **Latencia en cliente:** La pestaña o tarjeta fiscal del país carga en menos de **100 ms** aprovechando la precarga y caché en memoria/IndexedDB.
3. **Cero regresiones:** Todos los tests existentes en `__tests__/` continúan pasando en verde.
4. **Resiliencia:** Si un país insular o no reconocido carece de datos fiscales oficiales, la interfaz muestra limpiamente el estado "Falta de Transparencia Fiscal" sin romper el layout del sidebar.

---

## 11. Prohibido

- **Prohibido** conectar los datos de finanzas públicas con el scorecard de 108 criterios o con el cálculo de valoración intrínseca de empresas (`P/IV15`).
- **Prohibido** inventar o imputar cifras fiscales para países sin datos oficiales mediante generación sintética de LLM.
- **Prohibido** modificar o alterar los motores de cálculo existentes en `lib/bonds/`, `lib/dalio-model.ts` o `lib/caching/` sin orden explícita.
- **Prohibido** requerir autenticación o pago al usuario para ver esta funcionalidad en la UI pública.

---

## 12. Cosas por Investigar

1. **Evidencia de demanda:** Diseñar un test de demanda real (p. ej. contar clics en un botón "Finanzas Públicas" o consultar en foros de geopolítica/finanzas) para sustituir la etiqueta de *Evidencia insuficiente* por *Inferencia* o *Hecho*.
2. **Homogeneidad de fuentes:** Comparar la cobertura y frescura entre la API del Banco Mundial y el FMI WEO (World Economic Outlook) para series anuales vs trimestrales.
3. **Límites de cuotas y licencias:** Confirmar los términos legales de redistribución de datos de deuda pública del Banco Mundial para uso en aplicaciones web públicas.
4. **Mapeo de países no miembros:** Identificar los ~15 territorios o países presentes en el GeoJSON que no son miembros del Banco Mundial o FMI (ej. Taiwán, Palestina, Corea del Norte, Cuba) y definir su fuente alternativa o declarar falta de transparencia.
