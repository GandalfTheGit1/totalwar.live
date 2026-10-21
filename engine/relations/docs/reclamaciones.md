# Reclamaciones territoriales y relaciones bilaterales (21-10-2026)

## Problema
El motor bilateral dependía de Wikidata P1336 («territorio reclamado por») cruzado con P17. Este mecanismo presentaba cinco deficiencias estructurales:
1. **Disputas ausentes por modelado en Wikidata**: España–Reino Unido (Gibraltar) tenía P1336 apuntando a Reino Unido en lugar de España (ES-GB salía en +49,1 sin ningún estado de disputa); el Sáhara Occidental tiene P17 = RASD (no reconocida como Estado de la ONU en `world/countries.json`); Grecia–Turquía (Egeo) y Belice–Guatemala no aparecían.
2. **Ponderación uniforme indiscriminada**: Todas las disputas latentes pesaban igual (−8). Cachemira o Arunachal Pradesh tenían idéntico peso que islotes deshabitados como Navassa (HT-US), Serranilla (CO/HN/JM/NI-US) o Machias Seal (CA-US).
3. **Alianzas defensivas que opacaban disputas**: Países aliados en la OTAN con disputas territoriales activas o latentes (GR-TR +48,9 y BG-MK +48,5) quedaban desproporcionadamente altos por la bonificación automática de `DEFENSE_ALLIANCE` (+35).
4. **Inexistencia de posturas de terceros países**: El reconocimiento internacional o rechazo explícito a la soberanía de una de las partes carecía de efecto estructural.
5. **Cero representación cartográfica**: No existía geometría de reclamaciones ni en la vista 2D ni en el globo 3D.

## Qué se hizo
- **Registro revisado (`model/territorial_claims.json`)**: 60 reclamaciones revisadas con fuente primaria oficial, fecha de inicio (`since`), fecha de estado (`statusSince`), entidad administradora y reclamantes (incluyendo entidades no estatales como la RASD, Somalilandia o Transnistria), nivel de relevancia (`salience`: `core`, `major`, `minor`) y posturas de terceros países (`thirdParty`).
- **Ponderación por relevancia (`salience`)**: Factor multiplicador en `scale`: `core` = 1,00; `major` = 0,75; `minor` = 0,35. Esto reduce la penalización de un islote secundario sin incidentes (Navassa, Serranilla, Olivenza) a −2,8 puntos, preservando el impacto pleno de Cachemira o el Esequibo (−8 a −30 puntos).
- **Múltiples reclamantes (Spratly, Serranilla)**: Se aplica un factor de descuento de co-reclamante (0,40) a los pares entre Estados que reclaman el mismo territorio administrado por un tercero, evitando acumulaciones artificiales de fricción entre partes aliadas.
- **Descuento de alianza bajo disputa territorial**: Cuando dos países tienen un tratado de defensa mutua (`DEFENSE_ALLIANCE`) pero mantienen una disputa territorial bilateral directa (ej. Grecia y Turquía por el Egeo), el peso de la alianza se atenúa al 50 % (+17,5 en vez de +35).
- **Posturas de terceros**: Nuevos estados en el catálogo `scoring.py`:
  - `CLAIM_STANCE_SUPPORT` (+10 con el administrador, −8 con el reclamante).
  - `CLAIM_STANCE_OPPOSE` (−10 con el administrador, +8 con el reclamante).
  Solo aplicable a disputas `core` con declaración explícita de política exterior, fuente oficial fechada (ej. reconocimiento de EE. UU., Francia y España sobre el Sáhara Occidental marroquí).
- **Cadena de exportación**:
  - `world/export_claims_geo.py`: genera `public/data/territorial-claims/claims.geojson` (217 KB, coordenadas redondeadas a 3 decimales, geometrías simplificadas) y `lib/data/territorial-claims/claims.json` (23,8 KB, con centroides `lat`/`lng` para el globo).
  - `world/export_app.py`: añade un 8.º elemento opcional `claimIds` a cada par en `relations.json`.
- **Integración visual en frontend**:
  - Selector de modo: Modo `claims` («RECLAMOS») en `MapModeSelector.tsx`.
  - Mapa 2D (`render-claims.ts`, `MapDefs.tsx`): tramas diagonales rayadas diferenciadas por estado (`hatch-occupied`, `hatch-militarized`, `hatch-active`, `hatch-latent`, `hatch-frozen`, `hatch-resolved`), puntos táctiles para islotes/peñones con tooltip interactivo (`ClaimTooltip.tsx`).
  - Globo 3D (`useGlobeStyling.ts`, `points-builder.ts`): marcadores de puntos coloreados por estado y resaltado dinámico de contrapartes y disputas al seleccionar un país.
  - Barra lateral: `TerritorialClaimsSection.tsx` en modos `claims` y `relations`, mostrando disputas administradas, reclamadas y posturas de terceros.
  - Relaciones bilaterales (`BilateralRelationsSection.tsx`): despliega el nombre en español del territorio en disputa gracias al array `claimIds`.

## Validación
Fijada de antemano con hash sha256 (`world/audit_claims.py` y `audit_claims.sha256`).

| Criterio | Objetivo | Resultado | Estado |
|---|---|---|---|
| (a) Pares de referencia de disputas (`audit_claims_eval.py`) | ≥ 90,0 % | **36 / 36 (100,0 %)** | **PASS** |
| (b.1) Entidades de Natural Earth 1:10m decididas | 100,0 % | **99 / 99 (100,0 %)** | **PASS** |
| (b.2) Cobertura de pares LOW de línea base | 100,0 % | **53 / 53 (100,0 %)** | **PASS** |
| Banco de auditoría general (`audit_eval.py`) | ≥ 80 / 89 | **81 / 89** | **PASS** (supera línea base 80/89) |
| Bloques regionales (`audit_blocs_eval.py`) | 31 / 31 | **31 / 31** | **PASS** |
| Mapa de relaciones (`audit_map_eval.py`) | 40 / 40 | **40 / 40** | **PASS** (utilidad 38/40) |
| Reproducibilidad de calibración (`test_reproduce.py`) | 4 / 4 OK | **4 / 4 OK (delta 0,00)** | **PASS** |
| Pruebas offline del motor (`test_claims.py`) | 8 / 8 OK | **8 / 8 OK** | **PASS** |
| Pruebas offline de embajadas (`test_embassy.py`) | 15 / 15 OK | **15 / 15 OK** | **PASS** |
| Pruebas offline de pulso (`test_pulse.py`) | 5 / 5 OK | **5 / 5 OK** | **PASS** |

### Evolución de los 5 pares con disputas en `audit_eval.py`:
- **AF-PK**: R = −6,4 → −14,4 (Entra en rango objetivo [−130, −10] por militarización de la Línea Durand).
- **KH-TH**: R = −3,1 → −11,1 (Entra en rango objetivo [−130, −10] por disputa de Preah Vihear).
- **CN-JP**: R = +24,6 → +16,6 (Entra en rango objetivo [−100, 20] por Senkaku).
- **CN-PH**: R = +20,7 → +12,7 (Mejora hacia rango objetivo [−100, 10] por Scarborough y Spratly).
- **GR-TR**: R = +48,9 → +30,9 (Cae 18 puntos hacia rango objetivo [−60, 30] por atenuación del 50 % en la alianza OTAN bajo disputa del Egeo).

## Registro y Territorios Excluidos
- **Total en registro activo**: 60 reclamaciones territoriales.
  - Por estado: 7 ocupaciones, 7 militarizadas, 8 activas, 37 latentes, 1 congelada.
  - Por relevancia: 23 core, 18 major, 19 minor.
- **Total de entidades excluidas con justificación**: 21 casos documentados en el registro:
  1. `un-buffer-zone-cyprus`: Zona de amortiguación de la ONU en Chipre (Green Line) — overlay técnico UNFICYP, no reclamación soberana bilateral.
  2. `undof-golan`: Zona de separación de UNDOF en los Altos del Golán — zona de armisticio de la ONU, no Estado reclamante.
  3. `korea-dmz`: Franja de armisticio del paralelo 38 (1953), no territorio separado.
  4. `baikonur`: Cosmódromo de Baikonur — contrato civil de arrendamiento de Kazajistán a Rusia hasta 2050, no disputa de soberanía.
  5. `hans-island`: Isla de Hans (Tartupaluk) — disputa resuelta formalmente el 14 de junio de 2022 mediante división bilateral territorial entre Canadá y Dinamarca.
  6. `artsakh`: Nagorno-Karabaj — disuelto formalmente el 1 de enero de 2024 tras la operación militar azerí de septiembre de 2023.
  7. `china-russia-border`: Frontera China-Rusia (Bolshoy Ussuriysky / Abagaitu) — delimitada y demarcada pacíficamente en 2004 y 2008.
  8. `bakassi-peninsula`: Península de Bakassi — transferida pacíficamente por Nigeria a Camerún conforme al fallo de la CIJ de 2002 y Acuerdo de Greentree de 2006.
  9. `bir-tawil`: Terra nullius en la frontera egipcio-sudanesa no reclamada por ningún Estado.
  10. `antarctica`: Reclamaciones territoriales antárticas congeladas por el Artículo IV del Tratado Antártico de 1959.
  11. `morocco-madeira`: Error categorial de Wikidata (Marruecos no reclama soberanía sobre el archipiélago portugués de Madeira).
  12. `outer-mongolia-taiwan`: Reclamación histórica de la República de China (1947), abandonada de facto en 2002 tras reconocimiento ministerial de Mongolia.
  13. `china-pakistan-border`: Frontera delimitada pacíficamente mediante el Acuerdo de 1963.
  14. `west-bank-jordan`: Renuncia formal del rey Hussein de Jordania el 31 de julio de 1988 a todo reclamo sobre Cisjordania en favor de la OLP.
  15. `philadelphi-corridor`: Franja de seguridad fronteriza en Gaza, no reclamación territorial bilateral.
  16. `jarvis-island-uk`: Error en Wikidata; territorio no incorporado estadounidense sin reclamación británica contemporánea.
  17. `strovilia-sba`: Límite técnico militar de las Bases Soberanas Británicas en Chipre según tratado de 1960.
  18. `bougainville`: Proceso autonómico e interno de Papúa Nueva Guinea tras referéndum de 2019; Australia no reclama nada.
  19. `transnistria-ukraine`: Error en Wikidata; Ucrania reconoce la integridad territorial moldava en Transnistria.
  20. `french-somaliland`: Colonia independizada pacíficamente en 1977 como la República de Yibuti.
  21. `french-mandate-syria`: Mandato colonial de la Sociedad de Naciones concluido en 1946.

## Lo que sigue mal o queda como límite conocido
- **Disputas marítimas de ZEE exclusivamente económicas**: Solo se incluyen delimitaciones marítimas con soberanía territorial insular asociada o litigio judicial internacional formalizado (Egeo, San Andrés, Socotra Rock). Las disputas de pesca o plataforma continental extendida sin islas no están cubiertas.
- **Posturas diplomáticas exhaustivas**: Se han recogido las posturas primarias verificadas (Sáhara Occidental, Golán, Jerusalén, Somalilandia). No se han incorporado posturas no verbalizadas o ambiguas de foros multilaterales.
- **Entidades de soberanía limitada**: Actores como la RASD, Somalilandia o Transnistria aparecen correctamente en el registro e interfaz lateral, pero al carecer de código ISO-2 en `world/countries.json` no generan un nodo estatal propio en el grafo bilateral de 19.306 pares, computándose a través de los Estados que las administran o reclaman.
