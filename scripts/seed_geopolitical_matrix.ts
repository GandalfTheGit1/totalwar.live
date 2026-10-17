/**
 * scripts/seed_geopolitical_matrix.ts
 * 
 * Script to query Wikidata for bilateral relations between the 45 key global economies,
 * enrich the relationships with bloc alignments and friction scores, and compile
 * a permanent static seed file at lib/data/geopolitical-global-matrix.json.
 */

import * as fs from 'fs';
import * as path from 'path';
import { GEOPOLITICAL_45_COUNTRIES, GeopoliticalCountry, COUNTRY_BY_QID } from '../lib/data/geopolitical-countries';

export type GeopoliticalStance = 
  | 'STRATEGIC_ALLY' 
  | 'ECONOMIC_PARTNER' 
  | 'NEUTRAL_COMMERCIAL' 
  | 'FRICTION_STRATEGIC_COMPETITION' 
  | 'SANCTIONED_ADVERSARIAL';

export interface BilateralEdge {
  id: string;                    // e.g. "US-CN"
  relationQid: string;           // Wikidata QID
  relationLabel: string;         // e.g. "relaciones China-Estados Unidos"
  countryA: {
    code: string;
    iso3: string;
    qid: string;
    nameEs: string;
    nameEn: string;
    flag: string;
  };
  countryB: {
    code: string;
    iso3: string;
    qid: string;
    nameEs: string;
    nameEn: string;
    flag: string;
  };
  sharedBlocs: string[];
  stance: GeopoliticalStance;
  frictionScore: number;         // 0 (sin fricción) a 10 (máxima hostilidad/sanciones)
  tariffRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  chokepointRisk: boolean;       // Afecta rutas marítimas o de semiconductores
  summaryNote: string;
}

export interface CountryDetailProfile {
  country: GeopoliticalCountry;
  allies: { code: string; nameEs: string; flag: string }[];
  strategicRivals: { code: string; nameEs: string; flag: string; frictionScore: number }[];
  keyTradePartners: { code: string; nameEs: string; flag: string }[];
  bilateralRelationsCount: number;
  averageFrictionScore: number;
  relations: BilateralEdge[];
}

export interface GlobalGeopoliticalMatrixSeed {
  generatedAt: string;
  version: string;
  totalCountries: number;
  totalBilateralEdges: number;
  theWholeScene: {
    globalAverageFriction: number;
    highestFrictionPairs: { pair: string; friction: number; reason: string }[];
    strategicAlliances: { bloc: string; count: number; members: string[] }[];
    nodes: {
      code: string;
      iso3: string;
      nameEs: string;
      flag: string;
      region: string;
      blocs: string[];
      strategicRole: string;
      sovereignRiskBase: number;
    }[];
    edges: BilateralEdge[];
  };
  oneAtATime: Record<string, CountryDetailProfile>;
}

const RAW_SPECIAL_PAIR_STATUS: Record<string, { stance: GeopoliticalStance; friction: number; tariff: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'; chokepoint: boolean; note: string }> = {
  'US-CN': { stance: 'FRICTION_STRATEGIC_COMPETITION', friction: 7.8, tariff: 'EXTREME', chokepoint: true, note: 'Guerra tecnológica, aranceles cruzados y disputa de hegemonía en semiconductores e IA.' },
  'CN-TW': { stance: 'FRICTION_STRATEGIC_COMPETITION', friction: 8.9, tariff: 'HIGH', chokepoint: true, note: 'Tensión existencial en el Estrecho de Taiwán; cuello de botella absoluto en fundición avanzada (TSMC).' },
  'TW-US': { stance: 'STRATEGIC_ALLY', friction: 1.2, tariff: 'LOW', chokepoint: true, note: 'Alianza tecnológica y militar estratégica; ley CHIPS y reshoring.' },
  'RU-US': { stance: 'SANCTIONED_ADVERSARIAL', friction: 9.5, tariff: 'EXTREME', chokepoint: false, note: 'Sanciones financieras totales (SWIFT, congelación de reservas) y conflicto por delegación.' },
  'RU-UA': { stance: 'SANCTIONED_ADVERSARIAL', friction: 10.0, tariff: 'EXTREME', chokepoint: true, note: 'Guerra activa interestatal; interrupción de rutas agrícolas, fertilizantes y gases nobles.' },
  'IR-US': { stance: 'SANCTIONED_ADVERSARIAL', friction: 9.8, tariff: 'EXTREME', chokepoint: true, note: 'Embargo petrolero secundario y riesgo de cierre del Estrecho de Ormuz.' },
  'IL-IR': { stance: 'SANCTIONED_ADVERSARIAL', friction: 9.9, tariff: 'EXTREME', chokepoint: true, note: 'Hostilidad directa, ataques aéreos y guerra asimétrica en Oriente Medio.' },
  'CN-IN': { stance: 'FRICTION_STRATEGIC_COMPETITION', friction: 6.8, tariff: 'HIGH', chokepoint: false, note: 'Disputas fronterizas en el Himalaya, vetos a apps chinas y competencia manufacturera.' },
  'JP-KR': { stance: 'ECONOMIC_PARTNER', friction: 3.2, tariff: 'LOW', chokepoint: true, note: 'Alianza de seguridad con EE. UU., aunque con fricciones históricas y dependencia en químicos de chips.' },
  'JP-US': { stance: 'STRATEGIC_ALLY', friction: 0.8, tariff: 'LOW', chokepoint: false, note: 'Tratado de defensa mutua, coordinación en controles de exportación a China (Tokyo Electron).' },
  'NL-US': { stance: 'STRATEGIC_ALLY', friction: 1.0, tariff: 'LOW', chokepoint: true, note: 'Alineamiento en restricción de venta de maquinaria litográfica EUV (ASML) a China.' },
  'GB-US': { stance: 'STRATEGIC_ALLY', friction: 0.5, tariff: 'LOW', chokepoint: false, note: 'Alianza Five Eyes/AUKUS y cooperación irrestricta en inteligencia y capital.' },
  'CA-US': { stance: 'STRATEGIC_ALLY', friction: 0.6, tariff: 'LOW', chokepoint: false, note: 'Integración energética e industrial total bajo USMCA.' },
  'MX-US': { stance: 'ECONOMIC_PARTNER', friction: 2.8, tariff: 'MEDIUM', chokepoint: false, note: 'Principal socio comercial de EE. UU. vía Nearshoring con revisiones periódicas del T-MEC.' },
  'CN-RU': { stance: 'STRATEGIC_ALLY', friction: 1.8, tariff: 'LOW', chokepoint: false, note: 'Asociación estratégica sin límites; intercambio de crudo ruso por manufactura y yuanes.' },
  'CN-VN': { stance: 'ECONOMIC_PARTNER', friction: 4.5, tariff: 'MEDIUM', chokepoint: true, note: 'Recepción de cadenas de suministro chinas para eludir aranceles con disputas en el Mar del Sur de China.' },
  'US-VN': { stance: 'ECONOMIC_PARTNER', friction: 2.5, tariff: 'LOW', chokepoint: false, note: 'Asociación estratégica integral para ensamblaje de electrónica de consumo.' },
  'CN-DE': { stance: 'ECONOMIC_PARTNER', friction: 4.8, tariff: 'MEDIUM', chokepoint: false, note: 'Alta dependencia automotriz alemana en el mercado chino frente a la política de Derisking de la UE.' },
  'SA-US': { stance: 'ECONOMIC_PARTNER', friction: 3.5, tariff: 'LOW', chokepoint: true, note: 'Pacto de seguridad energética, petrodólar y balance en precios del crudo OPEP+.' },
  'IR-SA': { stance: 'FRICTION_STRATEGIC_COMPETITION', friction: 6.5, tariff: 'MEDIUM', chokepoint: true, note: 'Rivalidad regional suní-chií bajo tregua mediada por China.' }
};

// Normalize keys to sorted pairs
const SPECIAL_PAIR_STATUS: Record<string, typeof RAW_SPECIAL_PAIR_STATUS[string]> = {};
for (const [key, val] of Object.entries(RAW_SPECIAL_PAIR_STATUS)) {
  const [a, b] = key.split('-');
  SPECIAL_PAIR_STATUS[[a, b].sort().join('-')] = val;
}

function getPairKey(codeA: string, codeB: string): string {
  return [codeA, codeB].sort().join('-');
}

function calculateStanceAndFriction(countryA: GeopoliticalCountry, countryB: GeopoliticalCountry): {
  stance: GeopoliticalStance;
  friction: number;
  tariff: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  chokepoint: boolean;
  note: string;
} {
  const pairKey = getPairKey(countryA.code, countryB.code);
  if (SPECIAL_PAIR_STATUS[pairKey]) {
    return SPECIAL_PAIR_STATUS[pairKey];
  }

  // Check shared blocs
  const shared = countryA.blocs.filter(b => countryB.blocs.includes(b));
  
  if (shared.includes('FiveEyes') || (shared.includes('NATO') && shared.includes('EU'))) {
    return {
      stance: 'STRATEGIC_ALLY',
      friction: 0.8,
      tariff: 'LOW',
      chokepoint: false,
      note: `Alianza militar e institucional de máxima confianza (${shared.join(', ')}).`
    };
  }

  if (shared.includes('EU')) {
    return {
      stance: 'STRATEGIC_ALLY',
      friction: 1.0,
      tariff: 'LOW',
      chokepoint: false,
      note: 'Mercado Único Europeo: libre circulación de capital, bienes y personas.'
    };
  }

  if (shared.includes('NATO') || shared.includes('G7') || shared.includes('USMCA')) {
    return {
      stance: 'STRATEGIC_ALLY',
      friction: 1.5,
      tariff: 'LOW',
      chokepoint: false,
      note: `Tratado de defensa mutua o integración comercial avanzada (${shared.join(', ')}).`
    };
  }

  if (shared.includes('CPTPP') || shared.includes('ASEAN') || shared.includes('OECD') || shared.includes('RCEP')) {
    return {
      stance: 'ECONOMIC_PARTNER',
      friction: 2.6,
      tariff: 'LOW',
      chokepoint: false,
      note: `Socios comerciales preferentes bajo acuerdos multilaterales (${shared.join(', ')}).`
    };
  }

  if (shared.includes('BRICS') || shared.includes('OPEC+')) {
    return {
      stance: 'ECONOMIC_PARTNER',
      friction: 3.0,
      tariff: 'LOW',
      chokepoint: false,
      note: `Coordinación geopolítica y de materias primas en el bloque ${shared.join(', ')}.`
    };
  }

  // Cross-bloc friction default
  const isWestA = countryA.blocs.some(b => ['NATO', 'G7', 'FiveEyes', 'EU'].includes(b));
  const isEastA = countryA.blocs.some(b => ['BRICS', 'SCO'].includes(b));
  const isWestB = countryB.blocs.some(b => ['NATO', 'G7', 'FiveEyes', 'EU'].includes(b));
  const isEastB = countryB.blocs.some(b => ['BRICS', 'SCO'].includes(b));

  if ((isWestA && isEastB) || (isEastA && isWestB)) {
    return {
      stance: 'FRICTION_STRATEGIC_COMPETITION',
      friction: 5.5,
      tariff: 'MEDIUM',
      chokepoint: false,
      note: 'Relación de coexistencia comercial con diferencias geopolíticas de bloque.'
    };
  }

  return {
    stance: 'NEUTRAL_COMMERCIAL',
    friction: 3.5,
    tariff: 'LOW',
    chokepoint: false,
    note: 'Relaciones diplomáticas y comerciales bilaterales estables.'
  };
}

async function fetchAllWikidataBilateralRelations(): Promise<Map<string, { qid: string; label: string }>> {
  console.log('[Seed] 🌐 Consultando grafo global de relaciones bilaterales de Wikidata (Q15221623)...');
  
  const sparqlQuery = `SELECT ?relation ?relationLabel ?country1 ?country2 WHERE {
  ?relation wdt:P31 wd:Q15221623.
  ?relation wdt:P17 ?country1.
  ?relation wdt:P17 ?country2.
  FILTER(STR(?country1) < STR(?country2))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}`;

  const url = 'https://query.wikidata.org/sparql';
  
  let bindings: any[] = [];
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'GeopoliticalResearchBot/1.0 (https://example.com/bot)'
      },
      body: sparqlQuery,
      signal: AbortSignal.timeout(15000)
    });

    if (res.ok) {
      const data = await res.json();
      bindings = data?.results?.bindings || [];
      console.log(`[Seed] ✅ Obtenidas ${bindings.length} relaciones bilaterales brutas de Wikidata.`);
    } else {
      console.warn(`[Seed] ⚠️ Wikidata respondió con status ${res.status}. Usando generación sintética garantizada.`);
    }
  } catch (err: any) {
    console.warn(`[Seed] ⚠️ No se pudo conectar a Wikidata en vivo (${err.message}). Usando relaciones canónicas base.`);
  }

  const relationsMap = new Map<string, { qid: string; label: string }>();

  for (const b of bindings) {
    const qid1 = b.country1.value.split('/').pop();
    const qid2 = b.country2.value.split('/').pop();
    const relQid = b.relation.value.split('/').pop();
    const relLabel = b.relationLabel.value;

    const countryA = COUNTRY_BY_QID.get(qid1);
    const countryB = COUNTRY_BY_QID.get(qid2);

    if (countryA && countryB) {
      const pairKey = getPairKey(countryA.code, countryB.code);
      relationsMap.set(pairKey, { qid: relQid, label: relLabel });
    }
  }

  console.log(`[Seed] 🎯 ${relationsMap.size} relaciones corresponden a los 45 países clave.`);
  return relationsMap;
}

export async function generateGeopoliticalSeed(): Promise<GlobalGeopoliticalMatrixSeed> {
  const wikidataMap = await fetchAllWikidataBilateralRelations();

  const edges: BilateralEdge[] = [];
  const oneAtATime: Record<string, CountryDetailProfile> = {};

  // Initialize oneAtATime records for all 45 countries
  for (const c of GEOPOLITICAL_45_COUNTRIES) {
    oneAtATime[c.code] = {
      country: c,
      allies: [],
      strategicRivals: [],
      keyTradePartners: [],
      bilateralRelationsCount: 0,
      averageFrictionScore: 0,
      relations: []
    };
  }

  // Iterate all distinct pairs among 45 countries (45 * 44 / 2 = 990 potential pairs)
  for (let i = 0; i < GEOPOLITICAL_45_COUNTRIES.length; i++) {
    for (let j = i + 1; j < GEOPOLITICAL_45_COUNTRIES.length; j++) {
      const countryA = GEOPOLITICAL_45_COUNTRIES[i];
      const countryB = GEOPOLITICAL_45_COUNTRIES[j];
      const pairKey = getPairKey(countryA.code, countryB.code);

      const wikiInfo = wikidataMap.get(pairKey) || {
        qid: `SYNTH-${pairKey}`,
        label: `Relaciones ${countryA.nameEs}-${countryB.nameEs}`
      };

      const sharedBlocs = countryA.blocs.filter(b => countryB.blocs.includes(b));
      const stanceData = calculateStanceAndFriction(countryA, countryB);

      const edge: BilateralEdge = {
        id: pairKey,
        relationQid: wikiInfo.qid,
        relationLabel: wikiInfo.label,
        countryA: {
          code: countryA.code,
          iso3: countryA.iso3,
          qid: countryA.qid,
          nameEs: countryA.nameEs,
          nameEn: countryA.nameEn,
          flag: countryA.flag
        },
        countryB: {
          code: countryB.code,
          iso3: countryB.iso3,
          qid: countryB.qid,
          nameEs: countryB.nameEs,
          nameEn: countryB.nameEn,
          flag: countryB.flag
        },
        sharedBlocs,
        stance: stanceData.stance,
        frictionScore: stanceData.friction,
        tariffRisk: stanceData.tariff,
        chokepointRisk: stanceData.chokepoint,
        summaryNote: stanceData.note
      };

      edges.push(edge);

      // Populate Country A's profile
      const profA = oneAtATime[countryA.code];
      profA.relations.push(edge);
      if (stanceData.stance === 'STRATEGIC_ALLY') {
        profA.allies.push({ code: countryB.code, nameEs: countryB.nameEs, flag: countryB.flag });
      } else if (stanceData.friction >= 6.0) {
        profA.strategicRivals.push({ code: countryB.code, nameEs: countryB.nameEs, flag: countryB.flag, frictionScore: stanceData.friction });
      } else {
        profA.keyTradePartners.push({ code: countryB.code, nameEs: countryB.nameEs, flag: countryB.flag });
      }

      // Populate Country B's profile
      const profB = oneAtATime[countryB.code];
      profB.relations.push(edge);
      if (stanceData.stance === 'STRATEGIC_ALLY') {
        profB.allies.push({ code: countryA.code, nameEs: countryA.nameEs, flag: countryA.flag });
      } else if (stanceData.friction >= 6.0) {
        profB.strategicRivals.push({ code: countryA.code, nameEs: countryA.nameEs, flag: countryA.flag, frictionScore: stanceData.friction });
      } else {
        profB.keyTradePartners.push({ code: countryA.code, nameEs: countryA.nameEs, flag: countryA.flag });
      }
    }
  }

  // Calculate stats for each country profile
  for (const c of GEOPOLITICAL_45_COUNTRIES) {
    const prof = oneAtATime[c.code];
    prof.bilateralRelationsCount = prof.relations.length;
    const totalFriction = prof.relations.reduce((acc, r) => acc + r.frictionScore, 0);
    prof.averageFrictionScore = Number((totalFriction / (prof.relations.length || 1)).toFixed(2));
    prof.strategicRivals.sort((a, b) => b.frictionScore - a.frictionScore);
  }

  // Global Scene calculations
  const globalAvgFriction = Number((edges.reduce((acc, e) => acc + e.frictionScore, 0) / (edges.length || 1)).toFixed(2));
  const highestFrictionPairs = edges
    .filter(e => e.frictionScore >= 7.0)
    .sort((a, b) => b.frictionScore - a.frictionScore)
    .slice(0, 15)
    .map(e => ({
      pair: `${e.countryA.flag} ${e.countryA.nameEs} ↔ ${e.countryB.flag} ${e.countryB.nameEs}`,
      friction: e.frictionScore,
      reason: e.summaryNote
    }));

  const allBlocs = ['NATO', 'G7', 'EU', 'BRICS', 'ASEAN', 'FiveEyes', 'USMCA', 'CPTPP', 'OPEC+'];
  const strategicAlliances = allBlocs.map(bloc => ({
    bloc,
    count: GEOPOLITICAL_45_COUNTRIES.filter(c => c.blocs.includes(bloc)).length,
    members: GEOPOLITICAL_45_COUNTRIES.filter(c => c.blocs.includes(bloc)).map(c => `${c.flag} ${c.code}`)
  }));

  const seed: GlobalGeopoliticalMatrixSeed = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    totalCountries: GEOPOLITICAL_45_COUNTRIES.length,
    totalBilateralEdges: edges.length,
    theWholeScene: {
      globalAverageFriction: globalAvgFriction,
      highestFrictionPairs,
      strategicAlliances,
      nodes: GEOPOLITICAL_45_COUNTRIES.map(c => ({
        code: c.code,
        iso3: c.iso3,
        nameEs: c.nameEs,
        flag: c.flag,
        region: c.region,
        blocs: c.blocs,
        strategicRole: c.strategicRole,
        sovereignRiskBase: c.sovereignRiskBase
      })),
      edges
    },
    oneAtATime
  };

  return seed;
}

// Execution block
async function main() {
  try {
    const seed = await generateGeopoliticalSeed();
    const outputPath = path.join(__dirname, '../lib/data/geopolitical-global-matrix.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(seed, null, 2), 'utf-8');
    console.log(`\n🎉 Seed generado con éxito en: ${outputPath}`);
    console.log(`📊 Países indexados: ${seed.totalCountries}`);
    console.log(`🔗 Aristas bilaterales procesadas: ${seed.totalBilateralEdges}`);
    console.log(`⚡ Fricción media global: ${seed.theWholeScene.globalAverageFriction}/10`);
  } catch (err: any) {
    console.error('❌ Error al generar el seed geopolítico:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
