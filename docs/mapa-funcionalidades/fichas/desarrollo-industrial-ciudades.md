# Ficha Técnica y Plan de Implementación: Monitor de Desarrollo Industrial y Polos Manufactureros Urbanos

> **ID:** `desarrollo-industrial-ciudades`  
> **Sistema:** Global (`world-geopolitical-engine`)  
> **Fecha:** 2026-10-22  
> **Estado:** Idea  

---

## 1. Meta y Contexto

- **Meta Principal:** **Investigación de mercado** (`investigacion_mercado`). El objetivo no es solo pintar polígonos industriales en un mapa, sino monitorizar qué ciudades, clústeres manufactureros y polos logísticos despiertan búsquedas recurrentes e interés analítico de los usuarios para guiar qué cadenas de suministro modelar en profundidad.
- **Meta Secundaria:** **Seguidores** (`seguidores`). Actúa como una capa visual impactante y educativa en el globo 3D que atrae analistas de geopolítica y macroeconomía.
- **Regla del Sistema (Contexto, no señal):** Esta funcionalidad es estrictamente un **filtro de contexto geoespacial**. **No entra al score de empresas ni altera valoraciones intrínsecas** sin calibración causal previa contrastada.
- **Antecedente Histórico:** En octubre de 2026 se retiró un prototipo previo de simulación urbana y capital humano por carecer de calibración y meta definida; esta ficha redefine el enfoque exclusivamente hacia inteligencia física de manufactura y demanda de mercado.

---

## 2. Qué Te Permite Hacer

1. **Con esto puedo** visualizar la concentración espacial de suelo industrial, parques de manufactura pesada y zonas francas aduaneras por ciudad sobre el globo 3D.
2. **Con esto puedo** evaluar la proximidad y conectividad logística de una ciudad respecto a puertos marítimos de contenedores, terminales de carga ferroviaria y redes eléctricas de alta capacidad.
3. **Con esto puedo** registrar y analizar qué polos industriales y regiones manufactureras generan mayor volumen de consultas para alimentar la investigación de mercado del producto.

---

## 3. Mapa de Alineación

- **Depende de:** `[]` (Ninguna dependencia directa en el registro; se integra modularmente en el visor cartográfico existente).
- **Alimenta:**
  - A la meta de **Investigación de mercado**: canaliza métricas de interés sobre sectores industriales específicos (automoción, semiconductores, química, aeroespacial).
  - Al visor 3D de `world-geopolitical-engine` como capa temática seleccionable.
- **Separado a propósito de:**
  - **Score de empresas (`v0-equity-analysis-with-buffett`):** Queda completamente desacoplado del algoritmo de puntuación fundamental hasta que se diseñe un backtesting causal formal.
  - **Simulaciones estocásticas / Monte Carlo:** No inyecta probabilidades ni choques macroeconómicos automáticos.

---

## 4. Demanda de Mercado (Rúbrica 0 a 10)

| Criterio | Puntos | Etiqueta | Fuente / Justificación |
|---|---|---|---|
| **Lo piden expresamente** (0-4) | 0.0 | Evidencia insuficiente | Sin solicitudes explícitas documentadas en foros, encuestas o tickets. |
| **Es una frustración actual** (0-3) | 0.0 | Evidencia insuficiente | No hay entrevistas que demuestren pérdida de dinero o tiempo por falta de esta vista. |
| **Les conviene** (0-3) | 0.0 | Evidencia insuficiente | Hipótesis teórica de utilidad analítica; aún no contrastada con usuarios reales. |
| **Total** | **0.0 / 10** | **Evidencia insuficiente** | Nota honesta de punto de partida. |

> **Cómo subir la nota de demanda:** Entrevistar a 5 analistas o inversores de supply chain y registrar si invierten tiempo manual mapeando polígonos industriales y si pagarían por ver datos de capacidad y cuellos de botella urbanos unificados.

---

## 5. Métrica de Éxito

- **Qué se mide:** Consultas únicas a fichas de ciudades industriales, clics en capas de infraestructura y eventos de interacción con el panel lateral.
- **Umbral (Suposición):** $\ge 500$ interacciones o consultas únicas registradas durante el primer mes posterior al despliegue.
- **Plazo:** 30 días posteriores al lanzamiento en producción.
- **Registro de fecha:** Los eventos de telemetría y consultas se almacenan con timestamp ISO 8601 (`created_at`) para análisis de retención y sesgo temporal.

---

## 6. Datos y Riesgos

- **Fuentes iniciales (Hipótesis):**
  - OpenStreetMap (OSM Overpass API) para polígonos con `landuse=industrial` y terminales logísticas.
  - UNIDO / World Bank para estadísticas agregadas de producción manufacturera por región.
  - Registros portuarios y corredores de transporte abiertos (Natural Earth / World Port Index).
- **Licencias:** OpenStreetMap requiere atribución ODbL. Los datos deben servirse procesados o en agregados vectoriales propios sin violar términos derivados.
- **Sesgo de anticipación:** Los datos urbanos históricos deben registrar el año de consolidación del polígono para evitar imputar capacidad fabril previa a su construcción real.
- **Plan ante caída de fuentes:** Generación de un archivo estático precompilado (`industrial-cities-index.json`) alojado localmente en `public/data/` para no depender de llamadas en vivo a APIs de terceros.

---

## 7. Interfaz de Usuario (Pública)

- **Ubicación:** Pública.
- **Pantallas y Componentes:**
  - Selector de capa `Polos Industriales` en `components/geopolitical-monitor/components/MapModeSelector.tsx`.
  - Capa de marcadores y áreas de clústeres fabriles en el globo 3D (Three.js / Mapbox).
  - Panel lateral de detalle urbano (`CityIndustrialProfileSheet.tsx`):
    - Coeficiente de especialización fabril (automoción, aeroespacial, química, tecnología).
    - Infraestructura conectada: puertos, aeropuertos de carga, distancia a nodos de alta tensión.
    - Mini-encuesta de feedback / analítica de interés ("¿Te resultó útil este polo industrial?").
- **Estados:** Vacío (ciudad sin industria relevante mapeada), Carga (esqueleto animado mientras carga el GeoJSON), Error (mensaje amigable con fallback a datos base del país).

---

## 8. Plan de Implementación por Pasos

### Paso 1: Definición del esquema GeoJSON y curación del dataset semilla
- **Objetivo:** Crear el contrato tipado en TypeScript y una muestra estática inicial de 25 ciudades industriales globales clave (p. ej., Monterrey, Stuttgart, Shenzhen, Detroit, Katowice).
- **Entradas:** `types/industrial-city.ts`.
- **Hecho cuando:** El archivo `lib/data/industrial-cities-seed.json` cumpla la validación de esquema mediante tests unitarios.
- **Pruebas:** Test en Vitest que verifique coordenadas válidas, arrays de infraestructura no nulos y coeficientes en rango $[0, 100]$.
- **Commit:** `feat(industrial): contrato tipado y dataset semilla de 25 ciudades industriales`

### Paso 2: Endpoint API y servicio de consulta de infraestructura urbana
- **Objetivo:** Proveer una ruta REST `/api/geo/industrial-cities` con soporte para filtrado por país, sector predominante y nivel de infraestructura.
- **Entradas:** Dataset semilla del Paso 1.
- **Hecho cuando:** La ruta responda con código 200, cabeceras de caché adecuadas y tiempo de respuesta $< 50$ ms.
- **Pruebas:** Test de integración API con Vitest probando parámetros válidos y manejo de ciudad no encontrada.
- **Commit:** `feat(industrial): endpoint api/geo/industrial-cities y capa de servicio estatico`

### Paso 3: Integración de la capa en el visor 3D y selector de modos
- **Objetivo:** Añadir el modo industrial en la cabina del globo 3D con renderizado de nodos de dispersión mediante Three.js/Canvas.
- **Entradas:** Componentes `MapModeSelector.tsx` y `GlobeView.tsx`.
- **Hecho cuando:** Al activar el modo industrial, aparezcan los marcadores luminosos en las coordenadas correspondientes sin caída de FPS en el render loop.
- **Pruebas:** Test de renderizado de componentes y verificación de no regresión en WebGL context.
- **Commit:** `feat(industrial): capa visual de clusters industriales en globo 3D`

### Paso 4: Panel lateral de desglose urbano y telemetría de interés
- **Objetivo:** Desplegar el drawer lateral con métricas de la ciudad y capturar el evento de telemetría para investigación de mercado.
- **Entradas:** Componente `CityIndustrialProfileSheet.tsx` y hook de analítica de eventos.
- **Hecho cuando:** El clic sobre un polo industrial abra la ficha detallada y registre el evento de consulta en la métrica de éxito.
- **Pruebas:** Test de interacción en testing-library simulando clic y apertura del panel.
- **Commit:** `feat(industrial): panel lateral de detalle de polo industrial y telemetria de demanda`

---

## 9. Modelo de IA Recomendado

```json
{
  "planificador": "Claude 3.7 Sonnet o Gemini 2.5 Pro",
  "ejecutor": "Gemini 3.8 Flash",
  "verificador": "Claude 3.5 Sonnet / Antigravity Linter",
  "razon": "Error silencioso bajo en visualización; moderada complejidad en gestión de geometrías GeoJSON; ejecutor rápido con tests unitarios estrictos por paso.",
  "etiqueta": "Hipótesis"
}
```

---

## 10. Criterios de Aceptación

1. La capa visual se activa desde el selector de modos del monitor geopolítico sin interferir con las capas de reclamaciones territoriales ni recursos naturales.
2. Cada polo industrial del dataset semilla contiene coordenadas verificadas, clúster predominante y distancia a infraestructura de transporte.
3. El rendimiento del visor 3D se mantiene por encima de 45 FPS en dispositivos de escritorio estándar durante la navegación.
4. Cada consulta o apertura de ficha urbana despacha un evento registrable para auditar la métrica de éxito de investigación de mercado.
5. Cobertura de pruebas unitarias $\ge 85\%$ en los servicios y utilidades matemáticas creadas.

---

## 11. Prohibido

- **PROHIBIDO** inyectar o conectar métricas de desarrollo industrial urbano en los algoritmos de valoración intrínseca o scorecard del `v0-equity-analysis-with-buffett`.
- **PROHIBIDO** realizar llamadas directas en tiempo de ejecución de usuario a APIs públicas no autenticadas (como Overpass OSM) que puedan generar bloqueos por rate-limiting o tiempos de espera $> 2$ segundos.
- **PROHIBIDO** modificar la lógica de cálculo de fricción bilateral o reclamaciones territoriales preexistentes.

---

## 12. Cosas por Investigar

1. ¿Qué fuentes de datos abiertas y automatizables permiten escalar el dataset de 25 ciudades a más de 500 sin infringir licencias ni requerir scraping frágil?
2. ¿Cómo normalizar el coeficiente de especialización industrial entre países con metodologías estadísticas dispares (p. ej., NAICS en Norteamérica vs NACE en Europa)?
3. ¿Qué umbral de tráfico o interacciones valida que los usuarios realmente demandan esta herramienta antes de invertir esfuerzo en modelar cadenas de suministro complejas?
