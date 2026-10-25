# Ficha Técnica: Monitor de Entidades Estratégicas, Capacidades y Postura Vecinal

> **ID Registro:** `entidades-postura-vecinal`  
> **Sistema:** `global` (World Geopolitical Engine)  
> **Estado:** `idea`  
> **Fecha de definición:** 2026-10-22  
> **Autor / Solicitante:** William  

---

## 1. Meta y Contexto

- **Meta principal:** **Investigación de mercado** (color azul en Figma / Okabe-Ito `#0072B2`).
  - *Objetivo:* Enseñar qué despliegues militares, fronteras tensas y rivalidades vecinales despiertan mayor interés de búsqueda y consulta entre analistas y usuarios, guiando el desarrollo de futuros módulos de inteligencia.
- **Metas secundarias:** **Seguidores** (color verde `#009E73`), atrayendo y reteniendo usuarios mediante una capa visual e interactiva tipo mapa táctico OSINT.
- **Regla del sistema: Contexto, no señal.**
  - **Hecho:** Esta funcionalidad pertenece al subsistema geopolítico global (`world-geopolitical-engine`).
  - **Inferencia:** Sirve como capa de contexto táctico, geoespacial y de postura estratégica internacional.
  - **Regla innegociable:** No entra al score de valoración intrínseca de empresas (`v0-equity-analysis-with-buffett`) ni genera señales predictivas sobre cotizaciones bursátiles.

---

## 2. Qué te permite hacer

1. **Con esto puedo** geolocalizar en el globo 3D y en el mapa 2D las principales entidades estratégicas de cualquier país seleccionado (bases militares aéreas/navales/terrestres, centros de mando y control, polígonos de prueba e infraestructuras logísticas críticas de defensa).
2. **Con esto puedo** consultar la ficha de capacidades de cada entidad: tipo de activo, vector de fuerza, rango de alcance operativo o radio de acción, y nivel estimado de preparación.
3. **Con esto puedo** auditar las actividades, ejercicios o traslados que el país está ejecutando actualmente en sus fronteras para inferir su postura estratégica (defensiva, disuasoria, de presión o de proyección ofensiva) respecto a sus países vecinos.

---

## 3. Mapa de Alineación

- **Depende de:**
  - `reclamaciones-territoriales` (para contrastar el despliegue de bases y tropas con las disputas territoriales activas entre vecinos).
- **Alimenta:**
  - **Meta del negocio:** Investigación de mercado (telemetría de búsquedas de fronteras calientes y países bajo escrutinio militar) y Seguidores (engagement interactivo en el visor).
  - **Parte del sistema:** Capa táctica en el globo 3D (`TacticalEntitiesLayer`) y sección `TacticalEntitiesPostureSection` en `GeopoliticalSidebar`.
- **Separado a propósito de:**
  - `score de empresas`: El posicionamiento de bases y maniobras de un país no altera el scorecard de 108 criterios ni el modelo de valoración P/IV15.
  - `calibracion-brier`: No emite apuestas probabilísticas numéricas sobre variaciones de precios bursátiles a 1-3 meses.

---

## 4. Demanda de Mercado (Rúbrica 0 a 10)

| Criterio | Puntos | Techo | Etiqueta de Evidencia | Justificación y Fuente |
|---|---|---|---|---|
| **Lo piden expresamente** (0-4) | **0.0** | 0% | **Evidencia insuficiente** | Declaración de William: intuición propia de diseño inspirado en mapas tácticos; no hay peticiones de usuarios concretos con citas guardadas aún. |
| **Es una frustración actual** (0-3) | **1.2** | 40% | **Hipótesis** | Pérdida de tiempo y esfuerzo recopilando y cruzando manualmente datos dispersos de bases, capacidades y maniobras en portales de noticias o informes estáticos. Techo Hipótesis: 3 × 0.4 = 1.2 pts. |
| **Les conviene** (0-3) | **1.2** | 40% | **Hipótesis** | Disponer de un cuadro unificado de capacidades y postura vecinal aporta claridad táctica inmediata y recurrencia de uso. Techo Hipótesis: 3 × 0.4 = 1.2 pts. |
| **TOTAL** | **2.4 / 10** | — | **Evidencia insuficiente** | La etiqueta más débil del conjunto es *Evidencia insuficiente*. Nota honesta de partida (Hipótesis de valor). |

---

## 5. Métrica de Éxito

- **Qué se mide:** Volumen de consultas únicas en la pestaña de entidades y postura vecinal, tiempo de interacción por país y registro de qué pares de países (fronteras bilaterales) concentran la atención de los usuarios.
- **Umbral de éxito (Suposición):** Al menos **400 consultas únicas** en los primeros 45 días y la identificación de al menos **5 patrones recurrentes** de búsqueda regional (p. ej. concentración de interés en frontera Grecia-Turquía, Taiwán o Báltico).
- **Plazo:** **45 días** tras el despliegue público en producción.
- **Registro por fecha:** Se registrará la telemetría anónima de clics, aperturas de fichas de bases y consultas de postura vecinal con fecha y versión para evitar sesgos retrospectivos.

---

## 6. Datos y Riesgos

1. **Fuentes primarias candidatas:**
   - **Fuentes abiertas OSINT estructuradas:** Catálogos públicos de bases militares y complejos estratégicos (IISS Military Balance datos públicos, SIPRI, Wikipedia OSM Military Overpass).
   - **Monitoreo de actividad actual:** Feed de eventos de incidentes y maniobras procedentes de GDELT Project / ACLED / UN Peacekeeping para registrar qué están haciendo en el país.
   - **Geometría y fronteras:** Catálogo de fronteras terrestres y límites marítimos bilaterales ya existentes en `world-geopolitical-engine`.
2. **Fragilidad y latencia:**
   - La información militar en tiempo real es ruidosa, sujeta a propaganda y desinformación.
   - *Mitigación:* Arquitectura determinista. Los datos estáticos de bases y cuarteles se almacenan en un dataset local precompilado (`lib/data/tactical-entities.json`) con verificación de coordenadas. Las actividades actuales se clasifican con etiquetas estrictas de verificación (Oficial, Reporte OSINT, En curso).
3. **Licencias y términos de uso:**
   - OpenStreetMap / Overpass (ODbL): libre para geolocalización de infraestructuras con atribución.
   - GDELT / ACLED: uso de investigación y análisis no comercial / atribución.

---

## 7. Interfaz de Usuario (UI)

- **Ubicación:** **Pública** (abierta y gratuita en el globo interactivo 3D).
- **Componentes y pantallas:**
  1. **Capa geoespacial táctica en el Globo 3D y Mapa 2D (`TacticalEntitiesLayer`):**
     - Marcadores visuales con simbología militar táctica simplificada (Aeródromo, Base Naval, Mando Terrestre, Complejo Logístico/Industrial).
     - Círculos de radio de acción u orientación hacia frontera activa al hacer clic o hover sobre una base.
  2. **Subsección en Barra Lateral (`TacticalEntitiesPostureSection.tsx`):**
     - Integrada en `GeopoliticalSidebar.tsx`.
     - *Ficha de Entidad:* Nombre, rama de la fuerza, activos clave, capacidad estimada y última actividad reportada.
     - *Matriz de Postura Vecinal:* Tabla de países vecinos limítrofes, distancia de las entidades más próximas a la frontera, índice de fricción/despliegue y clasificación de postura (p. ej., *Defensiva reforzada*, *Rutinaria*, *Alerta / Maniobras conjuntas*, *Proyección disuasoria*).
  3. **Estados de UI obligatorios:**
     - *Cargando:* Skeleton táctico con placeholders parpadeantes.
     - *Vacío:* Mensaje sobrio cuando un país no cuenta con entidades estratégicas reportadas en el dataset base.
     - *Error:* Fallo recuperable sin desmontar el globo ni el sidebar.

---

## 8. Plan por Pasos (Listos para Ejecución Autónoma)

### Paso 1: Tipos TypeScript y Taxonomía de Entidades y Posturas
- **Objetivo:** Definir el modelo de datos `TacticalEntity`, `EntityCapability`, `CurrentActivity` y `NeighborPostureAssessment` en `lib/services/tactical-entities/types.ts`.
- **Entradas:** Catálogo de países ISO-2/3 y servicio de reclamaciones territoriales.
- **Hecho cuando:** Existen los tipos TS completamente definidos y un dataset estático inicial (`lib/data/tactical-entities-sample.json`) con datos de prueba verificados para 3 zonas de interés (p. ej. Grecia-Turquía, Polonia-Bielorrusia, Marruecos-España).
- **Pruebas:** Test unitario verificando la validación del esquema y coherencia de coordenadas lat/lon.
- **Commit:** `feat(tactical): define tactical entities and neighbor posture schema and test fixtures`

### Paso 2: Motor de Evaluación Determinista de Postura Vecinal
- **Objetivo:** Implementar la lógica pura `calculateNeighborPosture(country, neighbor, entities, claims)` en `lib/services/tactical-entities/posture-engine.ts`.
- **Entradas:** Paso 1 terminado.
- **Hecho cuando:** La función calcula la distancia de cada base militar a la frontera vecina, pondera la actividad reciente y cruza con reclamaciones territoriales activas para emitir la etiqueta de postura sin alucinación de LLM.
- **Pruebas:** Test unitario con casos de prueba conocidos (postura de fricción en frontera disputada vs postura rutinaria en frontera aliada).
- **Commit:** `feat(tactical): implement deterministic neighbor posture calculation engine`

### Paso 3: Endpoint de API con Caché
- **Objetivo:** Crear el endpoint `/api/tactical-entities/[countryCode]` que consolida entidades, capacidades y cálculo de postura vecinal.
- **Entradas:** Paso 2 terminado.
- **Hecho cuando:** La ruta responde en <60 ms para cualquier país solicitado.
- **Pruebas:** Test de integración con supertest/vitest verificando respuestas 200 con payload válido y 404 para países inexistentes.
- **Commit:** `feat(api): create tactical entities and posture API route with caching`

### Paso 4: Componente de Barra Lateral `TacticalEntitiesPostureSection`
- **Objetivo:** Construir el componente React en Tailwind para visualizar la lista de entidades, capacidades, actividades y postura hacia vecinos.
- **Entradas:** Paso 3 terminado.
- **Hecho cuando:** El usuario puede seleccionar un país y ver en el sidebar el desglose de entidades y la postura hacia cada país fronterizo.
- **Pruebas:** Test con `@testing-library/react` verificando renderizado de fichas, selector de vecinos y badges de postura.
- **Commit:** `feat(ui): add TacticalEntitiesPostureSection to geopolitical sidebar`

### Paso 5: Capa de Marcadores en el Visor (Globo 3D / Mapa 2D)
- **Objetivo:** Añadir toggle en el selector de capas temáticas (`ThematicLayerSelector`) para mostrar u ocultar las entidades en el mapa.
- **Entradas:** Paso 4 terminado.
- **Hecho cuando:** Al activar la capa "Entidades Estratégicas", se renderizan los iconos sobre el mapa 2D / Three.js con popover al hacer clic.
- **Pruebas:** Test unitario de renderizado del componente de capa y manejo de eventos de clic.
- **Commit:** `feat(map): render tactical entities layer on 3D globe and 2D map`

---

## 9. Modelo de IA Recomendado

- **Planificador:** `Claude 3.7 Sonnet / Gemini 3.8 Flash (High)`
- **Ejecutor:** `Gemini 3.8 Flash`
- **Verificador:** `Claude 3.7 Sonnet / Antigravity Agent`
- **Razón:** El riesgo de error silencioso al clasificar la "intención" de un país hacia sus vecinos es muy elevado si se delega en un prompt desestructurado. Por ello, el planificador debe diseñar una lógica determinista y matemática de proximidad y fricción, dejando la ejecución ágil a Gemini 3.8 Flash con un banco estricto de pruebas unitarias.
- **Etiqueta:** **Hipótesis** (pendiente de prueba empírica).

---

## 10. Criterios de Aceptación

1. **Determinismo:** La postura vecinal se deriva de fórmulas de proximidad geográfica, masa de tropas/bases y reclamaciones territoriales, sin conjeturas libres ni generación no fundamentada.
2. **Latencia fluida:** La apertura de la sección táctica en el sidebar ocurre en menos de **80 ms**.
3. **Cero regresiones:** Las 60 reclamaciones territoriales y los tests de calibración existentes siguen pasando al 100%.
4. **Respeto a la soberanía de datos:** No se publican coordenadas sensibles clasificadas en tiempo real; se utilizan exclusivamente fuentes públicas OSINT y registros consolidados.

---

## 11. Prohibido

- **Prohibido** conectar estas evaluaciones militares con el scorecard de 108 criterios o con el cálculo de valoración intrínseca de empresas (`P/IV15`).
- **Prohibido** inventar o alucinar localizaciones de bases o maniobras mediante generación descontrolada de LLM.
- **Prohibido** romper el rendimiento del visor 3D/WebGL añadiendo geometrías tridimensionales no optimizadas sin niveles de detalle (LOD).
- **Prohibido** requerir suscripción o muro de pago para consultar el mapa base táctico en la UI pública.

---

## 12. Cosas por Investigar

1. **Evidencia real de demanda:** Instrumentar telemetría anónima para medir si los usuarios buscan y consultan específicamente las entidades militares de los países limítrofes, para elevar la etiqueta de *Evidencia insuficiente* a *Inferencia* o *Hecho*.
2. **Fuentes OSINT fiables y sostenibles:** Evaluar la viabilidad técnica y legal de consumir feeds abiertos de eventos de conflicto (ACLED / GDELT) sin incurrir en costes recurrentes de API.
3. **Taxonomía de posturas vecinales:** Validar con analistas de relaciones internacionales si la clasificación en cuatro estados (Defensiva, Disuasoria, Presión, Maniobras) es suficientemente exhaustiva y neutral.
4. **Impacto en FPS en dispositivos de gama baja:** Probar el rendimiento de renderizado en Three.js cuando se visualizan simultáneamente más de 50 entidades con círculos de radio de acción.
5. **Alineación con el sistema Equity:** Investigar a futuro si un shock o cambio brusco en la postura vecinal puede servir como variable cualitativa exógena para alertar sobre riesgos en cadenas de suministro de empresas con activos en la región.
