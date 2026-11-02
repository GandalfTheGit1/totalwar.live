import { describe, expect, it } from 'vitest';
import { parseCountryList, parseIndicatorCatalog, parseTeNumber } from '@/lib/trading-economics/country-list';

describe('parseIndicatorCatalog', () => {
  it('groups /country-list links by section heading and dedupes slugs', () => {
    const html = `
      <section><h3>Main Indicators</h3><a href="/country-list/gdp">GDP</a><a href="/country-list/inflation-rate">Inflation Rate</a></section>
      <section><h3>Prices</h3><a href="/country-list/inflation-rate">Inflation Rate</a><a href="/calendar">Calendar</a></section>`;
    expect(parseIndicatorCatalog(html)).toEqual([
      { slug: 'gdp', name: 'GDP', category: 'Main Indicators' },
      { slug: 'inflation-rate', name: 'Inflation Rate', category: 'Main Indicators' },
    ]);
  });
});

describe('parseCountryList', () => {
  it('reads the body from the table after a header-only table', () => {
    const html = `
      <table><tr><th>Country ▼ ≡</th><th>Last ▼</th><th>Previous</th><th>Unit</th><th></th></tr></table>
      <table>
        <tr><td><a href="/venezuela/inflation-cpi"><span>Venezuela</span></a></td><td>466</td><td>534</td><td>%</td><td></td></tr>
        <tr><td><a href="/spain/inflation-cpi">Spain</a></td><td>1,234.5</td><td></td><td>%</td><td></td></tr>
      </table>`;
    const { columns, rows } = parseCountryList(html);
    expect(columns).toEqual(['Country', 'Last', 'Previous', 'Unit']);
    expect(rows[0]).toEqual({ teSlug: 'venezuela', name: 'Venezuela', cells: { Last: '466', Previous: '534', Unit: '%' } });
    expect(parseTeNumber(rows[1].cells.Last)).toBe(1234.5);
    expect(parseTeNumber(rows[1].cells.Previous)).toBeNull();
  });

  it('returns nothing when there is no Country table', () => {
    expect(parseCountryList('<table><tr><td>x</td></tr></table>')).toEqual({ columns: [], rows: [] });
  });
});
