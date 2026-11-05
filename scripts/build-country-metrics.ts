/**
 * scripts/build-country-metrics.ts
 *
 * Extrae de lib/data/trading-economics/values/ (Banco Mundial + Trading Economics) las pocas
 * series que usa la barra superior y las guarda compactas por ISO-2 en lib/data/country-metrics.json,
 * para no meter cientos de KB de JSON en el bundle del cliente.
 *
 * Uso: npm run build:metrics   (después de build:te / build:wb)
 */

import { promises as fs } from 'fs';
import path from 'path';
import rawCountries from '../lib/data/countries.json';
import { METRIC_SOURCES, type CountryMetricsFile } from '../lib/data/country-metrics';

const VALUES_DIR = path.join(process.cwd(), 'lib/data/trading-economics/values');
const OUT = path.join(process.cwd(), 'lib/data/country-metrics.json');

async function main() {
  const iso2ByIso3 = new Map((rawCountries as { code: string; iso3: string }[]).map((c) => [c.iso3, c.code]));
  const out: CountryMetricsFile = { generatedAt: new Date().toISOString(), sources: METRIC_SOURCES, countries: {} };

  for (const [key, slug] of Object.entries(METRIC_SOURCES)) {
    const file = JSON.parse(await fs.readFile(path.join(VALUES_DIR, `${slug}.json`), 'utf8'));
    let n = 0;
    for (const [iso3, c] of Object.entries(file.countries as Record<string, { value: number | null; reference: string | null }>)) {
      const iso2 = iso2ByIso3.get(iso3);
      if (!iso2 || c.value === null) continue;
      (out.countries[iso2] ??= {})[key as keyof typeof METRIC_SOURCES] = { v: c.value, y: c.reference ?? '' };
      n++;
    }
    console.log(`  ✓ ${key} (${slug}): ${n} países`);
  }
  await fs.writeFile(OUT, JSON.stringify(out));
  console.log(`country-metrics.json: ${Object.keys(out.countries).length} países`);
}

main().catch((err) => { console.error(err); process.exit(1); });
