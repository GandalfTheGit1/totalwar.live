# Ficha completa: Monitor demográfico por país

## 1. Meta y contexto
- Meta (cobertura, **Suposición**): datos demográficos actuales para ≥90 % de los 198 países, con fuente y año.
- Es **contexto, no señal**: no predice precios ni entra a ningún score. Como señal de inestabilidad (por ejemplo exceso de población joven) sería **Hipótesis** hasta calibrarla.
- Estado: idea. Ya existe `lib/macro/world-bank-client.ts` con población total (`SP.POP.TOTL`) y urbanización, y una dimensión "Fractura Demográfica/Social" en el panel.

## 2. Qué te permite hacer
- Con esto puedo ver población, edad mediana, crecimiento y urbanización de cualquier país.
- Con esto puedo normalizar otros módulos por habitante o por población activa.
- Con esto puedo ver qué países envejecen o crecen rápido, con la fuente de cada dato.

## 3. Mapa de alineación
- **Depende de:** `finanzas-publicas-soberanas` (comparten servicio de ingestión macro y panel lateral).
- **Alimenta:** el eje de cobertura; da contexto a deuda, industria y postura vecinal.
- **Separado a propósito de:** el score de empresas y la calibración (no es señal).

## 4. Demanda de mercado: 0/10
Los tres criterios son **Evidencia insuficiente**. Para subirla: preguntar a usuarios del globo qué dato de país consultan y medir clics reales.

## 5. Métrica de éxito
Países con población, estructura por edad y urbanización con fuente y año ≤3 años, sobre 198. Umbral ≥90 % (**Suposición**). Plazo: antes del despliegue público. Registrar el recuento por fecha.

## 6. Datos y riesgos
Fuentes candidatas: World Bank Open Data (ya integrado), ONU World Population Prospects, Censo de EE. UU. **Licencias y límites de uso: INFORMACIÓN INCOMPLETA**, verificar con cada fuente. Riesgo: años distintos entre países; mostrar siempre el año. Si una fuente cae, mostrar el último dato en caché con su año.

## 7. Interfaz
Pública. Subsección "Demografía" en el panel lateral del país. Estados vacío ("sin dato para este país"), carga y error explícitos. Rutas de API sin claves en el cliente.

## 8. Plan por pasos
1. **Explorar.** Leer `world-bank-client.ts`, `DimensionSection.tsx` y `SovereignPublicFinancesSection.tsx`; reportar qué se reutiliza. Hecho cuando hay un informe corto en `PROGRESO.md`.
2. **Indicadores.** Añadir edad mediana, crecimiento y estructura por edad al cliente con fixtures reales y un caso de respuesta rota que falle con error claro. Un commit.
3. **Cobertura.** Script que cuenta países con dato y año ≤3 años y escribe el recuento por fecha. Un commit.
4. **UI.** Subsección con fuente y año por dato y estados vacío/carga/error. Un commit.
5. **Decisión sobre la dimensión existente.** Proponer a William si se reemplaza o se complementa "Fractura Demográfica/Social" (decisión suya, no del agente).

## 9. Modelo de IA (**Hipótesis**)
Planificador y ejecutor Claude Sonnet; verificador Claude Opus. Riesgo bajo de error silencioso, salvo unidades y años.

## 10. Criterios de aceptación
- El script de cobertura reporta el porcentaje real con datos reales.
- Cada dato mostrado trae fuente y año.
- Un país sin dato muestra el estado vacío, no un cero.

## 11. Prohibido
Tocar el score, la calibración o módulos separados; inventar cifras para completar cobertura; refactors no relacionados.

## 12. Cosas por investigar
1. Evidencia real de demanda (preguntar a usuarios).
2. Licencias de World Bank, ONU y Censo de EE. UU.
3. Cobertura real por país y año.
4. Relación con la dimensión "Fractura Demográfica/Social".
5. Si desplaza trabajo crítico incompleto.
