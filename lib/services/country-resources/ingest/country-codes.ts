/**
 * Resolución de países de las fuentes a ISO 3166-1 alfa-2:
 * - FAOSTAT trae el código numérico M49 → tabla oficial de la División de Estadística de la ONU.
 * - Ember trae ISO alfa-3.
 * - World Mining Data solo trae el nombre en inglés → nombres de la ONU, de countries.json y alias.
 */

import * as cheerio from 'cheerio';
import rawCountries from '@/lib/data/countries.json';

interface CountryRow { code: string; iso3: string; nameEn: string; nameEs: string }
const COUNTRIES = rawCountries as CountryRow[];

export interface M49Row { m49: string; iso2: string; iso3: string; name: string }

/** Códigos M49 que la ONU no publica pero FAOSTAT sí usa. */
const EXTRA_M49: Record<string, string> = {
  '158': 'TW', // China, Taiwan Province of
};

/** Códigos alfa-3 de uso común que no son ISO oficiales. */
const EXTRA_ISO3: Record<string, string> = {
  XKX: 'XK', // Kosovo (Ember, Banco Mundial)
};

/** Nombres de World Mining Data que no coinciden con ninguna lista oficial. */
const NAME_ALIASES: Record<string, string> = {
  'bosnia herzegovina': 'BA',
  'congo d r': 'CD',
  'congo rep': 'CG',
  'korea north': 'KP',
  'korea south': 'KR',
  'cape verde': 'CV',
  kosovo: 'XK',
  taiwan: 'TW',
};

export function normalizeCountryName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Extrae la tabla en inglés de https://unstats.un.org/unsd/methodology/m49/overview/. */
export function parseM49Html(html: string): M49Row[] {
  const $ = cheerio.load(html);
  const table = $('#downloadTableEN');
  const headers = table.find('tr').first().find('th, td').map((_, el) => $(el).text().trim()).get();
  const col = (label: string) => headers.indexOf(label);
  const iName = col('Country or Area');
  const iM49 = col('M49 Code');
  const iIso2 = col('ISO-alpha2 Code');
  const iIso3 = col('ISO-alpha3 Code');
  if ([iName, iM49, iIso2, iIso3].some((i) => i < 0)) {
    throw new Error('Tabla M49: cabeceras inesperadas, la página de la ONU cambió de formato');
  }
  const rows: M49Row[] = [];
  table.find('tr').slice(1).each((_, tr) => {
    const cells = $(tr).find('td').map((__, td) => $(td).text().trim()).get();
    if (cells.length > iIso3 && cells[iIso2]) rows.push({ name: cells[iName], m49: cells[iM49], iso2: cells[iIso2], iso3: cells[iIso3] });
  });
  return rows;
}

export class CountryResolver {
  private byM49 = new Map<string, string>();
  private byIso3 = new Map<string, string>();
  private byName = new Map<string, string>();
  readonly known = new Set<string>();

  constructor(m49Rows: M49Row[]) {
    for (const c of COUNTRIES) {
      this.known.add(c.code);
      this.byIso3.set(c.iso3.toUpperCase(), c.code);
      this.byName.set(normalizeCountryName(c.nameEn), c.code);
    }
    for (const row of m49Rows) {
      if (!this.known.has(row.iso2)) continue;
      this.byM49.set(row.m49.padStart(3, '0'), row.iso2);
      this.byIso3.set(row.iso3.toUpperCase(), row.iso2);
      this.byName.set(normalizeCountryName(row.name), row.iso2);
    }
    for (const [m49, iso2] of Object.entries(EXTRA_M49)) this.byM49.set(m49, iso2);
    for (const [iso3, iso2] of Object.entries(EXTRA_ISO3)) this.byIso3.set(iso3, iso2);
    for (const [name, iso2] of Object.entries(NAME_ALIASES)) this.byName.set(name, iso2);
  }

  fromM49(code: string): string | null {
    return this.byM49.get(code.replace(/^'/, '').padStart(3, '0')) ?? null;
  }

  fromIso3(code: string): string | null {
    return this.byIso3.get(code.trim().toUpperCase()) ?? null;
  }

  fromName(name: string): string | null {
    return this.byName.get(normalizeCountryName(name)) ?? null;
  }
}
