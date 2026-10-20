/**
 * scripts/build-country-resources.ts
 *
 * Genera lib/data/country-resources.json: qué recursos produce cada país, en qué cantidad,
 * con qué cuota mundial y puesto, a partir de fuentes estadísticas oficiales:
 *   - World Mining Data 2026 (Ministerio de Finanzas de Austria): 65 minerales y combustibles.
 *   - FAOSTAT (FAO): cultivos, ganadería (producción y cabaña) y productos forestales.
 *   - FAO FishStat: pesca de captura, acuicultura y algas.
 *   - Ember: generación eléctrica renovable y nuclear.
 *   - Eurostat: electricidad de los países que Ember no cubre (Albania).
 *   - Tabla M49 de la ONU para traducir códigos de país.
 *
 * Uso:
 *   npm run build:resources              # usa lo descargado en .cache/country-resources/
 *   npm run build:resources -- --refresh # vuelve a descargar todas las fuentes
 *   npm run build:resources -- --min-year=2018
 */

import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import { ResourceSourceInfo } from '../lib/services/country-resources/types';
import { assembleDataset } from '../lib/services/country-resources/ingest/assemble';
import { FAO_FO_CATALOG, FAO_QCL_CATALOG, FAO_STOCKS_CATALOG } from '../lib/services/country-resources/ingest/catalog-fao';
import { CountryResolver, parseM49Html } from '../lib/services/country-resources/ingest/country-codes';
import { downloadCached } from '../lib/services/country-resources/ingest/download';
import { SourceResult } from '../lib/services/country-resources/ingest/observations';
import { parseEmberCsv } from '../lib/services/country-resources/ingest/source-ember';
import { eurostatUrl, parseEurostatElectricity } from '../lib/services/country-resources/ingest/source-eurostat';
import { parseFishCountries, parseFishSpecies, parseFishstatCsv } from '../lib/services/country-resources/ingest/source-fishstat';
import { parseFaostatCsv } from '../lib/services/country-resources/ingest/source-faostat';
import { parseWmdWorkbook } from '../lib/services/country-resources/ingest/source-wmd';
import { readXlsx } from '../lib/services/country-resources/ingest/xlsx';
import { findZipEntry, openZipEntryStream, readZipEntryText } from '../lib/services/country-resources/ingest/zip';

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'country-resources');
const OUTPUT = path.join(ROOT, 'lib', 'data', 'country-resources.json');

const URLS = {
  m49: 'https://unstats.un.org/unsd/methodology/m49/overview/',
  wmd: 'https://www.world-mining-data.info/wmd/downloads/XLS/6.4.%20Production_of_Mineral_Raw_Materials_of_individual_Countries_by_Minerals.xlsx',
  faoQcl: 'https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip',
  faoFo: 'https://bulks-faostat.fao.org/production/Forestry_E_All_Data_(Normalized).zip',
  ember: 'https://storage.googleapis.com/emb-prod-bkt-publicdata/public-downloads/yearly_full_release_long_format.csv',
  // La FAO publica una versión nueva cada marzo: actualizar el número al cambiar de edición.
  fishstat: 'https://www.fao.org/fishery/static/Data/GlobalProduction_2025.1.0.zip',
};

function parseArgs(argv: string[]) {
  const refresh = argv.includes('--refresh');
  const minYearArg = argv.find((a) => a.startsWith('--min-year='));
  const minYear = minYearArg ? Number(minYearArg.split('=')[1]) : new Date().getFullYear() - 7;
  if (!Number.isInteger(minYear)) throw new Error(`--min-year inválido: ${minYearArg}`);
  return { refresh, minYear };
}

function yearsLabel(result: SourceResult): string {
  return result.years ? `${result.years[0]}–${result.years[1]}` : 'sin datos';
}

function report(name: string, result: SourceResult) {
  const countries = new Set(result.observations.map((o) => o.iso2)).size;
  console.log(
    `  ✓ ${name}: ${result.commodities.length} recursos, ${result.observations.length} datos, ${countries} países, años ${yearsLabel(result)}`
  );
  if (result.unmatchedCountries.size > 0) {
    const sample = [...result.unmatchedCountries].sort().slice(0, 40).join(' | ');
    console.log(`    sin país ISO (${result.unmatchedCountries.size}, agregados o entidades históricas): ${sample}`);
  }
}

async function main() {
  const { refresh, minYear } = parseArgs(process.argv.slice(2));
  console.log(`Recursos por país — años desde ${minYear}${refresh ? ', descarga forzada' : ''}\n`);

  console.log('1. Descargas');
  const files = {
    m49: await downloadCached(URLS.m49, path.join(CACHE_DIR, 'un-m49.html'), refresh),
    wmd: await downloadCached(URLS.wmd, path.join(CACHE_DIR, 'wmd-6.4.xlsx'), refresh),
    faoQcl: await downloadCached(URLS.faoQcl, path.join(CACHE_DIR, 'faostat-qcl.zip'), refresh),
    faoFo: await downloadCached(URLS.faoFo, path.join(CACHE_DIR, 'faostat-fo.zip'), refresh),
    ember: await downloadCached(URLS.ember, path.join(CACHE_DIR, 'ember-yearly.csv'), refresh),
    fishstat: await downloadCached(URLS.fishstat, path.join(CACHE_DIR, 'fishstat-global-production.zip'), refresh),
    eurostat: await downloadCached(eurostatUrl(minYear), path.join(CACHE_DIR, `eurostat-nrg_bal_peh-${minYear}.json`), refresh),
  };

  console.log('\n2. Lectura de fuentes');
  const m49Rows = parseM49Html(await fs.readFile(files.m49, 'utf8'));
  console.log(`  ✓ Tabla M49 de la ONU: ${m49Rows.length} países y territorios`);
  const resolver = new CountryResolver(m49Rows);

  const wmd = parseWmdWorkbook(await readXlsx(files.wmd), resolver);
  report('World Mining Data', wmd);

  const isDataCsv = (name: string) => name.endsWith('All_Data_(Normalized).csv');
  const qcl = await parseFaostatCsv(
    await openZipEntryStream(files.faoQcl, await findZipEntry(files.faoQcl, isDataCsv)),
    resolver,
    { source: 'faostat-qcl', catalog: FAO_QCL_CATALOG, stockCatalog: FAO_STOCKS_CATALOG, minYear }
  );
  report('FAOSTAT cultivos y ganadería', qcl);

  const fo = await parseFaostatCsv(
    await openZipEntryStream(files.faoFo, await findZipEntry(files.faoFo, isDataCsv)),
    resolver,
    { source: 'faostat-fo', catalog: FAO_FO_CATALOG, minYear }
  );
  report('FAOSTAT forestal', fo);

  const fishstat = await parseFishstatCsv(
    await openZipEntryStream(files.fishstat, await findZipEntry(files.fishstat, (n) => n === 'Global_production_quantity.csv')),
    parseFishSpecies(await readZipEntryText(files.fishstat, (n) => n === 'CL_FI_SPECIES_GROUPS.csv')),
    parseFishCountries(await readZipEntryText(files.fishstat, (n) => n === 'CL_FI_COUNTRY_GROUPS.csv')),
    resolver,
    minYear
  );
  report('FAO FishStat pesca y acuicultura', fishstat);

  const ember = await parseEmberCsv(createReadStream(files.ember), resolver, minYear);
  report('Ember electricidad', ember);

  const emberCountries = new Set(ember.observations.map((o) => o.iso2));
  const eurostat = parseEurostatElectricity(JSON.parse(await fs.readFile(files.eurostat, 'utf8')), resolver, emberCountries);
  report('Eurostat electricidad (países sin Ember)', eurostat);

  const sources: ResourceSourceInfo[] = [
    { id: 'wmd', name: 'World Mining Data 2026 (Ministerio Federal de Finanzas de Austria)', url: 'https://www.world-mining-data.info/', license: 'Publicación gratuita; citar la fuente', years: yearsLabel(wmd) },
    { id: 'faostat-qcl', name: 'FAOSTAT — Cultivos y productos de ganadería (FAO)', url: 'https://www.fao.org/faostat/en/#data/QCL', license: 'CC BY 4.0', years: yearsLabel(qcl) },
    { id: 'faostat-fo', name: 'FAOSTAT — Producción forestal (FAO)', url: 'https://www.fao.org/faostat/en/#data/FO', license: 'CC BY 4.0', years: yearsLabel(fo) },
    { id: 'fishstat', name: 'FAO FishStat — Producción mundial de pesca y acuicultura', url: 'https://www.fao.org/fishery/en/collection/global_production', license: 'CC BY 4.0', years: yearsLabel(fishstat) },
    { id: 'ember', name: 'Ember — Yearly electricity data', url: 'https://ember-energy.org/data/yearly-electricity-data/', license: 'CC BY 4.0', years: yearsLabel(ember) },
    { id: 'eurostat', name: 'Eurostat — Producción de electricidad (nrg_bal_peh), países sin Ember', url: 'https://ec.europa.eu/eurostat/databrowser/view/nrg_bal_peh/default/table', license: 'CC BY 4.0', years: yearsLabel(eurostat) },
  ];

  console.log('\n3. Cálculo de cuotas y puestos');
  const dataset = assembleDataset([wmd, qcl, fo, fishstat, ember, eurostat], sources, minYear);
  const records = Object.values(dataset.countries).reduce((n, list) => n + list.length, 0);
  console.log(`  ✓ ${dataset.commodities.length} recursos con productores, ${Object.keys(dataset.countries).length} países, ${records} registros`);

  await fs.writeFile(OUTPUT, JSON.stringify(dataset) + '\n', 'utf8');
  const size = (await fs.stat(OUTPUT)).size;
  console.log(`\n→ ${path.relative(ROOT, OUTPUT)} (${(size / 1e6).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error('\n✗ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
