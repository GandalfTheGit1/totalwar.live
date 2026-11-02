/**
 * lib/trading-economics/country-list.ts
 *
 * Parsers for the Trading Economics indicator index (/indicators) and the
 * per-indicator country tables (/country-list/{slug}?continent=world).
 */

import * as cheerio from 'cheerio';

export interface TeIndicator {
  slug: string;
  name: string;
  category: string;
  /** Countries with data; only set once the indicator's values have been scraped. */
  countryCount?: number;
}

export interface TeCountryValue {
  name: string;
  value: number | null;
  previous: number | null;
  reference: string | null;
  unit: string | null;
  cells: Record<string, string>;
}

export interface TeIndicatorValues extends TeIndicator {
  source: string;
  fetchedAt: string;
  valueColumn: string;
  columns: string[];
  /** Keyed by ISO alpha-3. */
  countries: Record<string, TeCountryValue>;
  unmatched: string[];
}

export interface TeCountryRow {
  teSlug: string;
  name: string;
  /** Cell text keyed by column header (sort arrows stripped). */
  cells: Record<string, string>;
}

const cleanText = (s: string) => s.replace(/[▲▼≡]/g, '').replace(/\s+/g, ' ').trim();

/** Each <section> of /indicators is a category (h3) holding /country-list/ links. */
export function parseIndicatorCatalog(html: string): TeIndicator[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const out: TeIndicator[] = [];
  $('section').each((_, section) => {
    const category = cleanText($(section).find('h3').first().text());
    $(section).find('a[href^="/country-list/"]').each((__, a) => {
      const slug = ($(a).attr('href') ?? '').replace('/country-list/', '').split('?')[0];
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      out.push({ slug, name: cleanText($(a).text()), category });
    });
  });
  return out;
}

/**
 * Reads the first table whose first header is "Country". TE renders the sticky
 * header as its own one-row <table>, so the body is then the next table.
 */
export function parseCountryList(html: string): { columns: string[]; rows: TeCountryRow[] } {
  const $ = cheerio.load(html);
  const tables = $('table').toArray();
  for (const [idx, table] of tables.entries()) {
    const columns = $(table).find('tr').first().find('th, td').map((_, el) => cleanText($(el).text())).get();
    if (columns[0] !== 'Country') continue;
    const ownRows = $(table).find('tr').slice(1);
    const bodyRows = ownRows.length > 0 ? ownRows : $(tables[idx + 1]).find('tr');
    const rows: TeCountryRow[] = [];
    bodyRows.each((_, tr) => {
      const tds = $(tr).find('td');
      const link = tds.first().find('a').attr('href') ?? '';
      const name = cleanText(tds.first().text());
      if (!name) return;
      const cells: Record<string, string> = {};
      tds.slice(1).each((i, td) => {
        const header = columns[i + 1];
        if (header) cells[header] = cleanText($(td).text());
      });
      rows.push({ teSlug: link.split('/')[1] ?? '', name, cells });
    });
    return { columns: columns.filter(Boolean), rows };
  }
  return { columns: [], rows: [] };
}

/** "1,234.5" → 1234.5; anything non-numeric → null. */
export function parseTeNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/,/g, ''));
  return raw.trim() !== '' && Number.isFinite(n) ? n : null;
}
