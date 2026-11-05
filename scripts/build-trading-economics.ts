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
 * Con --top=N añade una segunda fase: lee /{país}/indicators de cada país (cientos de series
 * que no tienen tabla mundial) y completa el catálogo hasta N métricas. Solo entran las
 * comparables entre países (porcentajes y PMI/confianza) y con al menos --min-countries países;
 * se ordenan por número de países, que es lo más parecido a «importancia» que da la web.
 *
 * Uso:
 *   npm run build:te                                  # catálogo + 10 indicadores de prueba
 *   npm run build:te -- --all                         # las 165 tablas mundiales
 *   npm run build:te -- --top=500                     # --all + fase de países, catálogo de hasta 500
 *   npm run build:te -- --indicators=gdp,inflation-rate
 *   npm run build:te -- --refresh                     # vuelve a descargar
 */

import { promises as fs } from 'fs';
import path from 'path';
import rawCountries from '../lib/data/countries.json';
import { CountryResolver, normalizeCountryName } from '../lib/services/country-resources/ingest/country-codes';
import { downloadCached } from '../lib/services/country-resources/ingest/download';
import {
  parseCountryIndicators, parseCountryList, parseIndicatorCatalog, parseTeNumber,
  type TeCountryValue, type TeIndicator,
} from '../lib/trading-economics/country-list';

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
const argValue = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const indicatorsArg = argValue('indicators');
const top = Number(argValue('top')) || 0;
const minCountries = Number(argValue('min-countries')) || 5;

/** Unidades cuyo valor se puede comparar entre países (el resto va en moneda local o con base distinta). */
const COMPARABLE_UNITS = new Set(['%', 'percent', 'percent of gdp', 'percentage points']);
const COMPARABLE_POINTS = /pmi|confidence|sentiment|expectations|climate/;

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
  const toIso3 = (name: string) => {
    if (TE_AGGREGATES.has(name)) return null;
    const iso2 = TE_NAME_ALIASES[normalizeCountryName(name)] ?? resolver.fromName(name);
    return (iso2 && iso3ByIso2.get(iso2)) || null;
  };
  const writeValues = (meta: TeIndicator, extra: Record<string, unknown>) =>
    fs.writeFile(path.join(OUT_DIR, 'values', `${meta.slug}.json`), JSON.stringify({
      ...meta, source: `${BASE}/indicators`, fetchedAt: new Date().toISOString(), ...extra,
    }, null, 2));

  // Fase 1: tablas mundiales (/country-list/{slug}).
  const slugs = indicatorsArg ? indicatorsArg.split(',') : top || args.includes('--all') ? catalog.map((i) => i.slug) : DEFAULT_INDICATORS;
  const countryByTeSlug = new Map<string, string>();
  const listSlugs = new Set<string>(); // slugs de la tabla mundial y los que usa cada país para lo mismo
  for (const slug of slugs) {
    const meta = catalog.find((i) => i.slug === slug);
    if (!meta) { console.warn(`  ✗ ${slug}: no está en el catálogo`); continue; }

    const html = await fetchPage(`${BASE}/country-list/${slug}?continent=world`, `country-list/${slug}.html`);
    const { columns, rows } = parseCountryList(html);
    // Valor principal: "Last" en casi todas las tablas; en rating es la nota "TE" (0-100).
    const valueColumn = columns.includes('Last') ? 'Last' : columns.includes('TE') ? 'TE' : columns[1];

    const values: Record<string, TeCountryValue> = {};
    const unmatched: string[] = [];
    listSlugs.add(slug);
    for (const row of rows) {
      if (TE_AGGREGATES.has(row.name)) continue;
      const iso3 = toIso3(row.name);
      if (!iso3) { unmatched.push(row.name); continue; }
      countryByTeSlug.set(row.teSlug, iso3);
      if (row.indicatorSlug) listSlugs.add(row.indicatorSlug);
      values[iso3] = {
        name: row.name,
        value: parseTeNumber(row.cells[valueColumn]),
        previous: parseTeNumber(row.cells.Previous),
        reference: row.cells.Reference ?? null,
        unit: row.cells.Unit ?? null,
        ...(valueColumn !== 'Last' && { cells: row.cells }),
      };
    }

    await writeValues(meta, { valueColumn, columns, countries: values, unmatched });
    console.log(`  ✓ ${slug}: ${Object.keys(values).length}/${rows.length} países${unmatched.length ? ` · sin ISO: ${unmatched.join(', ')}` : ''}`);
  }

  // Fase 2: series que solo existen en la página de cada país.
  const extra: TeIndicator[] = [];
  if (top) {
    type Obs = { iso3: string; name: string; last: number | null; previous: number | null; unit: string | null; reference: string | null };
    const sparse = new Map<string, { name: string; category: string; obs: Obs[] }>();
    for (const [teSlug, iso3] of countryByTeSlug) {
      const html = await fetchPage(`${BASE}/${teSlug}/indicators`, `country/${teSlug}.html`);
      for (const r of parseCountryIndicators(html, teSlug)) {
        if (listSlugs.has(r.slug) || r.last === null) continue;
        const entry = sparse.get(r.slug) ?? { name: r.name, category: r.category, obs: [] };
        entry.obs.push({ iso3, name: r.name, last: r.last, previous: r.previous, unit: r.unit, reference: r.reference });
        sparse.set(r.slug, entry);
      }
    }

    const candidates: { slug: string; name: string; category: string; unit: string; obs: Obs[] }[] = [];
    for (const [slug, e] of sparse) {
      const unitCounts = new Map<string, number>();
      for (const o of e.obs) unitCounts.set(o.unit ?? '', (unitCounts.get(o.unit ?? '') ?? 0) + 1);
      const unit = [...unitCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const comparable = COMPARABLE_UNITS.has(unit.toLowerCase()) || (unit.toLowerCase() === 'points' && COMPARABLE_POINTS.test(slug));
      const obs = e.obs.filter((o) => (o.unit ?? '') === unit);
      if (comparable && obs.length >= minCountries) candidates.push({ slug, name: e.name, category: e.category, unit, obs });
    }
    candidates.sort((a, b) => b.obs.length - a.obs.length || a.slug.localeCompare(b.slug));
    console.log(`Fase 2: ${sparse.size} series en páginas de país · ${candidates.length} comparables con ≥${minCountries} países`);

    for (const c of candidates.slice(0, Math.max(0, top - slugs.length))) {
      const meta = { slug: c.slug, name: c.name, category: c.category };
      await writeValues(meta, {
        valueColumn: 'Last', columns: ['Country', 'Last', 'Previous', 'Reference', 'Unit'], unmatched: [],
        countries: Object.fromEntries(c.obs.map((o): [string, TeCountryValue] => [o.iso3, {
          name: o.name, value: o.last, previous: o.previous, reference: o.reference, unit: o.unit,
        }])),
      });
      extra.push({ ...meta, countryCount: c.obs.length });
    }
  }

  // El catálogo del buscador: tablas mundiales + series de país elegidas, solo con datos descargados.
  const withCounts = await Promise.all(catalog.map(async (i) => {
    const file = path.join(OUT_DIR, 'values', `${i.slug}.json`);
    const data = await fs.readFile(file, 'utf8').then(JSON.parse, () => null);
    return data ? { ...i, countryCount: Object.keys(data.countries).length } : i;
  }));
  // Con --top el catálogo solo lleva métricas con datos; enlaces como index-wb-data no tienen tabla.
  const listed = top ? withCounts.filter((i) => i.countryCount) : withCounts;
  await fs.writeFile(path.join(OUT_DIR, 'catalog.json'), JSON.stringify([...listed, ...extra], null, 2));
  console.log(`catalog.json: ${listed.length + extra.length} métricas (${listed.filter((i) => i.countryCount).length} con tabla mundial + ${extra.length} de páginas de país)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
