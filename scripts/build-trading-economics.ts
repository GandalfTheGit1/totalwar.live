/**
 * scripts/build-trading-economics.ts
 *
 * Prueba de scraping de Trading Economics para el buscador de indicadores sobre el mapa:
 *   1. Catálogo: /indicators → lib/data/trading-economics/catalog.json (slug, nombre, categoría).
 *   2. Valores: /country-list/{slug}?continent=world → lib/data/trading-economics/values/{slug}.json,
 *      con los países resueltos a ISO alfa-3 (el código que usa el mapa).
 *
 * Las páginas se guardan en .cache/trading-economics/ y solo se piden una vez,
 * a 1 petición cada 3 s (ritmo probado sin bloqueos el 2026-11-02).
 *
 * Uso:
 *   npm run build:te                                  # catálogo + 10 indicadores de prueba
 *   npm run build:te -- --indicators=gdp,inflation-rate
 *   npm run build:te -- --refresh                     # vuelve a descargar
 */

import { promises as fs } from 'fs';
import path from 'path';
import rawCountries from '../lib/data/countries.json';
import { CountryResolver, normalizeCountryName } from '../lib/services/country-resources/ingest/country-codes';
import { downloadCached } from '../lib/services/country-resources/ingest/download';
import { parseCountryList, parseIndicatorCatalog, parseTeNumber } from '../lib/trading-economics/country-list';

const BASE = 'https://tradingeconomics.com';
const CACHE_DIR = path.join(process.cwd(), '.cache/trading-economics');
const OUT_DIR = path.join(process.cwd(), 'lib/data/trading-economics');
const DELAY_MS = 3000;

const DEFAULT_INDICATORS = [
  'gdp', 'gdp-growth-rate', 'inflation-rate', 'interest-rate', 'unemployment-rate',
  'government-debt-to-gdp', 'current-account-to-gdp', 'balance-of-trade',
  'foreign-exchange-reserves', 'rating',
];

/** Nombres de Trading Economics (normalizados) que no coinciden con countries.json. */
const TE_NAME_ALIASES: Record<string, string> = {
  turkey: 'TR', 'czech republic': 'CZ', macedonia: 'MK', 'republic of the congo': 'CG',
  swaziland: 'SZ', 'st lucia': 'LC', 'east timor': 'TL', 'st vincent and the grenadines': 'VC',
  'st kitts and nevis': 'KN',
};

/** Filas agregadas que no son países: no van al mapa. */
const TE_AGGREGATES = new Set(['World', 'European Union', 'Euro Area']);

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const indicatorsArg = args.find((a) => a.startsWith('--indicators='))?.split('=')[1];

async function fetchPage(url: string, file: string): Promise<string> {
  const filePath = path.join(CACHE_DIR, file);
  const cached = !refresh && (await fs.stat(filePath).then((s) => s.size > 0, () => false));
  await downloadCached(url, filePath, refresh);
  if (!cached) await new Promise((r) => setTimeout(r, DELAY_MS));
  return fs.readFile(filePath, 'utf8');
}

async function main() {
  const catalog = parseIndicatorCatalog(await fetchPage(`${BASE}/indicators`, 'indicators.html'));
  if (catalog.length === 0) throw new Error('Catálogo vacío: /indicators cambió de formato');
  await fs.mkdir(path.join(OUT_DIR, 'values'), { recursive: true });
  console.log(`Catálogo: ${catalog.length} indicadores`);

  const countries = rawCountries as { code: string; iso3: string }[];
  const iso3ByIso2 = new Map(countries.map((c) => [c.code, c.iso3]));
  const resolver = new CountryResolver([]);

  const slugs = indicatorsArg ? indicatorsArg.split(',') : DEFAULT_INDICATORS;
  for (const slug of slugs) {
    const meta = catalog.find((i) => i.slug === slug);
    if (!meta) { console.warn(`  ✗ ${slug}: no está en el catálogo`); continue; }

    const html = await fetchPage(`${BASE}/country-list/${slug}?continent=world`, `country-list/${slug}.html`);
    const { columns, rows } = parseCountryList(html);
    // Valor principal: "Last" en casi todas las tablas; en rating es la nota "TE" (0-100).
    const valueColumn = columns.includes('Last') ? 'Last' : columns.includes('TE') ? 'TE' : columns[1];

    const values: Record<string, unknown> = {};
    const unmatched: string[] = [];
    for (const row of rows) {
      if (TE_AGGREGATES.has(row.name)) continue;
      const iso2 = TE_NAME_ALIASES[normalizeCountryName(row.name)] ?? resolver.fromName(row.name);
      const iso3 = iso2 ? iso3ByIso2.get(iso2) : undefined;
      if (!iso3) { unmatched.push(row.name); continue; }
      values[iso3] = {
        name: row.name,
        value: parseTeNumber(row.cells[valueColumn]),
        previous: parseTeNumber(row.cells.Previous),
        reference: row.cells.Reference ?? null,
        unit: row.cells.Unit ?? null,
        cells: row.cells,
      };
    }

    await fs.writeFile(path.join(OUT_DIR, 'values', `${slug}.json`), JSON.stringify({
      ...meta, source: `${BASE}/country-list/${slug}`, fetchedAt: new Date().toISOString(),
      valueColumn, columns, countries: values, unmatched,
    }, null, 2));
    console.log(`  ✓ ${slug}: ${Object.keys(values).length}/${rows.length} países${unmatched.length ? ` · sin ISO: ${unmatched.join(', ')}` : ''}`);
  }

  // countryCount solo en los indicadores ya descargados (de esta y de anteriores ejecuciones): el buscador sabe cuáles se pueden pintar.
  const withCounts = await Promise.all(catalog.map(async (i) => {
    const file = path.join(OUT_DIR, 'values', `${i.slug}.json`);
    const data = await fs.readFile(file, 'utf8').then(JSON.parse, () => null);
    return data ? { ...i, countryCount: Object.keys(data.countries).length } : i;
  }));
  await fs.writeFile(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(withCounts, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
