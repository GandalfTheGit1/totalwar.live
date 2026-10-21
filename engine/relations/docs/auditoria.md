# Auditoría de las relaciones de los 197 Estados (20-10-2026)

Revisión sin saber qué pares había visto mal el usuario. Para no corregir solo lo que yo buscaba, fijé antes de tocar nada (con hash) una batería de 89 pares con relación conocida (`world/audit_benchmark.py`). Después de corregir, fijé una segunda batería de 30 pares que no usé para corregir (`world/audit_holdout.py`).

## Resultado
| | Antes | Después |
|---|---|---|
| Batería (89 pares, fijada antes de corregir) | 44 dentro de rango | **83** (81 tras los bloques; 80 al superponer la capa de hechos de los 5 pares) |
| Batería reservada (30 pares, fijada después, sin tocar nada) | — | **10** |
| Pares tensos o peores | 596 (casi todos por sanciones de la ONU) | 132 (bandas: 678 socios, 18.496 neutrales, 124 tensos, 8 hostiles) |

La calibración no cambia (pérdidas de los 6 episodios idénticas), las pruebas del estado de embajada pasan y los 10 pares conocidos dan lo mismo por la vía masiva y la par a par.

## Errores encontrados y su causa
| Causa | Efecto que se veía | Corrección |
|---|---|---|
| Las sanciones de la ONU contaban como si **todos** los países sancionaran | Corea del Norte «tensa» con 162 países (China y Rusia incluidas); República Centroafricana, Sudán del Sur y Somalia tensas con ~130 cada una (España–Somalia, Brasil–Sudán del Sur) | Un régimen solo de la ONU ya no es un acto bilateral |
| Embajadas cerradas contadas como abiertas: Wikidata marca el cierre con el «estado de uso» y no con fecha de disolución | Rusia–Ucrania, Israel–Irán, Argelia–Marruecos, EE. UU.–Irán con «relaciones plenas» | Solo cuentan las embajadas en uso |
| Dinamarca y Países Bajos registran embajadas, OTAN y UE en el elemento del «Reino» | Dinamarca–Noruega sin embajadas ni alianza | Se consultan los dos elementos |
| Ninguna fuente para guerras, ocupaciones, rupturas, no reconocimiento ni alianzas bilaterales | Rusia–Ucrania −13, India–Pakistán +11, Chipre–Turquía +13, Corea del Sur–EE. UU. sin alianza | Rupturas con fecha de fin en Wikidata (regla estricta) y **hechos revisados** con fuente (`model/reviewed_facts.json`, 149) |
| «G7 price cap» atribuido solo a EE. UU.; Reino Unido, Noruega, Suiza, Islandia no aplicaban sanciones de la UE | Reino Unido–Rusia +21 | G7 cuenta a sus miembros; esos cinco aplican los regímenes de la UE |
| Doctrina oficial ignorada | Países de la OTAN neutrales con Rusia | Concepto Estratégico de la OTAN 2022: Rusia, amenaza directa |
| Reclamaciones territoriales de Wikidata obsoletas o erróneas (19) | China–Rusia con disputa (resuelta en 2008), Australia «reclama» Bougainville, Marruecos Madeira, Antártida… | Descartadas en los hechos revisados |
| Una regla de rupturas demasiado laxa (primera versión de esta auditoría) | China sin relaciones con 11 países que hoy la reconocen; Arabia Saudí–Irán y –Catar | Ruptura solo si ningún lado mantiene la relación abierta y no hay embajadas en uso; los 12 países que reconocen a Taiwán, en los hechos revisados |
| Datos del proyecto desfasados | Siria sancionada por EE. UU. y la UE (levantadas en 2025); Armenia aliada militar de Rusia (congeló la OTSC en 2024) | Levantamiento de Siria y congelación de Armenia en los hechos revisados |

## Lo que sigue mal (sin tocar después de verlo)
- **La capa estructural no ve fricciones recientes** que no recoge ninguna base de datos: la batería reservada falla en 20 de 30, casi todas de este tipo (juntas del Sahel contra Francia, Venezuela con Argentina y Perú, Israel con Irlanda y Sudáfrica, Moldavia–Rusia, Bélgica–Ruanda, Egipto–Etiopía por la presa). Eso solo lo capta la capa de hechos.
- **Vecinos en conflicto quedan menos negativos que países lejanos con sanciones**: tener embajadas y comercio suma (Bielorrusia–Ucrania −16, Bielorrusia–Islandia −29); Afganistán–Pakistán −6 y Camboya–Tailandia −9 pese a los choques de 2025.
- **Pertenecer a la OTAN pesa más que las disputas**: Grecia–Turquía +49, Bulgaria–Macedonia del Norte +48.
- **Cobertura pobre de Kosovo y Taiwán** (sin datos de la ONU ni del Banco Mundial; relaciones no oficiales): Albania–Kosovo +13, Taiwán–EE. UU. +11, Japón–Taiwán −2.
- **La reverificación web no es determinista**: el regreso de la embajadora marroquí (2022) se confirmó un día y otro no (España–Marruecos −36 / −41).
- Los hechos revisados son una foto a 20-10-2026: hay que revisarlos cuando cambie la situación.

## Segunda parte: pertenencia a bloques con estado (20-10-2026)
La pregunta por Mercosur destapó un fallo que la primera parte no vio: el motor leía la pertenencia a los 23 bloques de Wikidata como sí/no, y Wikidata no distingue estados. Antes de corregir fijé con hash 31 casos (`world/audit_blocs.py`): **6 de 31 correctos antes, 31 de 31 después**.

| Lo que leía de Wikidata | Realidad | Efecto |
|---|---|---|
| México y Venezuela, miembros de Mercosur | México es observador; Venezuela está suspendida desde 2016 | +12 de libre comercio falso con cada miembro (Argentina–Venezuela +27 con relaciones rotas) |
| T-MEC solo con México; CPTPP, RCEP y UEEA sin miembros; CCG 3 de 6; CELAC 5 de 33 | Listas oficiales | Faltaban los acuerdos de América del Norte, Asia-Pacífico, Eurasia y el Golfo |
| Australia en la ASEAN | Socio de diálogo | Acuerdo preferencial falso con los diez |
| Mali, Burkina Faso, Níger, Sudán y Madagascar en la Unión Africana | Suspendidos | Foro compartido falso |
| Angola en la OPEP; Eritrea en la zona africana | Salió en 2024; no la firmó | Foro y acuerdo falsos |
| Irán y Bielorrusia fuera de la OCS | Miembros desde 2023 y 2024 | Foro ausente |
| Asociados de Mercosur sin nada | Chile y Perú con libre comercio; Colombia y Ecuador con acuerdo preferencial | Acuerdo ausente |
| Zona de libre comercio africana como libre comercio pleno (+12) | Solo opera para un comercio «guiado» limitado | Ahora cuenta como preferencial (+6) |

Corrección: `model/bloc_memberships.json` (listas oficiales, estados con fecha y fuente, asociados y fecha de entrada en vigor de cada miembro, para que el pasado se puntúe con los acuerdos de entonces). Un par con libre comercio ya no suma además el preferencial.

**Efectos que no he forzado:** la batería baja de 83 a 81 porque China–Japón (+25) y China–Filipinas (+21) reciben ahora la RCEP, un acuerdo real; y la calibración de Australia–China sube de 61,8 a 73,7 de pérdida porque la RCEP entró en vigor en enero de 2022 con los dos dentro (el ancla de mediados de 2022 queda en +10 frente a ≤ −15). Las tres cosas apuntan al mismo límite: en la capa estructural los acuerdos reales pesan más que las fricciones; lo que las ve es la capa de hechos. Sigue faltando el libre comercio **bilateral** (por ejemplo, el acuerdo China–Australia de 2015 o México–Uruguay): la fuente para todos los acuerdos es la base de acuerdos regionales de la OMC.
