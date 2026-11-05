/**
 * scripts/build-worldbank-indicators.ts
 *
 * Completa el catálogo del buscador de indicadores con los World Development Indicators del
 * Banco Mundial (API abierta, licencia CC BY 4.0): último valor disponible por país.
 * Escribe lib/data/trading-economics/values/wb-{id}.json con la misma forma que los de Trading Economics
 * y añade las métricas a catalog.json (sustituye las wb- anteriores).
 *
 * Uso: npm run build:wb -- [--total=500] [--min-countries=100] [--refresh]
 */

import { promises as fs } from 'fs';
import path from 'path';
import rawCountries from '../lib/data/countries.json';
import { downloadCached } from '../lib/services/country-resources/ingest/download';
import type { TeCountryValue, TeIndicator } from '../lib/trading-economics/country-list';

const API = 'https://api.worldbank.org/v2';
const CACHE_DIR = path.join(process.cwd(), '.cache/worldbank');
const OUT_DIR = path.join(process.cwd(), 'lib/data/trading-economics');
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const argValue = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const total = Number(argValue('total')) || 500;
const minCountries = Number(argValue('min-countries')) || 100;

/** Desgloses por sexo, edad o quintil: ruido para un buscador de «lo más importante». */
const BREAKDOWN = /female|male|\bages? \d|age dependency|quintile|decile|lowest 20|highest 20|\bby (sex|age|education)|national estimate\)|\bLCU\b|elevation is below|emissions from|\(Mt CO2e\)|rural land|urban land/i;

type WbIndicator = { id: string; name: string; topics?: { value: string }[] };
type WbPoint = { countryiso3code: string; country: { value: string }; date: string; value: number | null };

const slugOf = (id: string) => `wb-${id.toLowerCase().replace(/\./g, '-')}`;
const json = async (url: string, file: string) => {
  await downloadCached(url, path.join(CACHE_DIR, file), refresh);
  return JSON.parse(await fs.readFile(path.join(CACHE_DIR, file), 'utf8'));
};

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, 'values'), { recursive: true });
  const iso3s = new Set((rawCountries as { iso3: string }[]).map((c) => c.iso3));

  const [, list] = await json(`${API}/source/2/indicator?format=json&per_page=2000`, 'indicators.json') as [unknown, WbIndicator[]];
  const wanted = list.filter((i) => !BREAKDOWN.test(i.name));
  console.log(`WDI: ${list.length} indicadores · ${wanted.length} tras quitar desgloses`);

  const fetched = await pool(wanted, async (ind) => {
    try {
      const [, points] = await json(`${API}/country/all/indicator/${ind.id}?format=json&mrnev=1&per_page=400`, `values/${ind.id}.json`) as [unknown, WbPoint[] | null];
      const countries: Record<string, TeCountryValue> = {};
      for (const p of points ?? []) {
        if (p.value === null || !iso3s.has(p.countryiso3code)) continue;
        countries[p.countryiso3code] = { name: p.country.value, value: p.value, previous: null, reference: p.date, unit: null };
      }
      return { ind, countries };
    } catch (err) {
      console.warn(`  ✗ ${ind.id}: ${(err as Error).message}`);
      return { ind, countries: {} as Record<string, TeCountryValue> };
    }
  });

  const chosen = fetched
    .filter((f) => Object.keys(f.countries).length >= minCountries)
    .sort((a, b) => Object.keys(b.countries).length - Object.keys(a.countries).length || a.ind.id.localeCompare(b.ind.id));

  const catalogFile = path.join(OUT_DIR, 'catalog.json');
  const existing = (JSON.parse(await fs.readFile(catalogFile, 'utf8')) as TeIndicator[]).filter((i) => !i.slug.startsWith('wb-'));
  // Reparto por tema (el de más cobertura de cada uno, por turnos) para que no domine una sola categoría.
  const byTopic = new Map<string, typeof chosen>();
  for (const c of chosen) {
    const topic = c.ind.topics?.[0]?.value.trim() ?? '';
    byTopic.set(topic, [...(byTopic.get(topic) ?? []), c]);
  }
  const picked: typeof chosen = [];
  const limit = Math.max(0, total - existing.length);
  for (let round = 0; picked.length < limit && round < chosen.length; round++) {
    for (const group of byTopic.values()) if (group[round] && picked.length < limit) picked.push(group[round]);
  }

  // Borra los wb- de ejecuciones anteriores para no dejar huérfanos.
  for (const f of await fs.readdir(path.join(OUT_DIR, 'values'))) if (f.startsWith('wb-')) await fs.rm(path.join(OUT_DIR, 'values', f));
  const added: TeIndicator[] = [];
  for (const { ind, countries } of picked) {
    const meta: TeIndicator = { slug: slugOf(ind.id), name: ind.name, category: ind.topics?.[0]?.value.trim() || 'World Bank', countryCount: Object.keys(countries).length };
    await fs.writeFile(path.join(OUT_DIR, 'values', `${meta.slug}.json`), JSON.stringify({
      ...meta, source: `https://data.worldbank.org/indicator/${ind.id}`, fetchedAt: new Date().toISOString(),
      valueColumn: 'Last', columns: ['Country', 'Last', 'Reference'], countries, unmatched: [],
    }));
    added.push(meta);
  }
  await fs.writeFile(catalogFile, JSON.stringify([...existing, ...added], null, 2));
  console.log(`catalog.json: ${existing.length} previas + ${added.length} del Banco Mundial = ${existing.length + added.length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
