import { describe, expect, it } from 'vitest';
import { parseCountryIndicators, parseCountryList, parseIndicatorCatalog, parseTeNumber } from '@/lib/trading-economics/country-list';

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
    expect(rows[0]).toEqual({ teSlug: 'venezuela', indicatorSlug: 'inflation-cpi', name: 'Venezuela', cells: { Last: '466', Previous: '534', Unit: '%' } });
    expect(parseTeNumber(rows[1].cells.Last)).toBe(1234.5);
    expect(parseTeNumber(rows[1].cells.Previous)).toBeNull();
  });

  it('returns nothing when there is no Country table', () => {
    expect(parseCountryList('<table><tr><td>x</td></tr></table>')).toEqual({ columns: [], rows: [] });
  });
});

describe('parseCountryIndicators', () => {
  const row = (slug: string, name: string, last: string, unit: string, ref: string) =>
    `<tr><td><a href='/spain/${slug}'> ${name} </a></td><td>${last}</td><td>1</td><td>2</td><td>0</td><td>${unit} </td><td>${ref}</td></tr>`;
  const html = `
    <a href="#overview">Overview</a><a href="#labour">Labour</a>
    <div class="tab-pane" id="overview"><table>${row('unemployment-rate', 'Unemployment Rate', '10.2', '%', 'Sep/26')}</table></div>
    <div class="tab-pane" id="labour"><table>
      ${row('unemployment-rate', 'Unemployment Rate', '10.2', '%', 'Sep/26')}
      ${row('youth-unemployment-rate', 'Youth Unemployment Rate', '24', '%', 'Sep/26')}
      ${row('currency', 'Currency', 'n/a', '', 'Nov/26')}
    </table></div>`;

  it('skips the overview tab, keeps the category and parses numbers', () => {
    const rows = parseCountryIndicators(html, 'spain');
    expect(rows.map((r) => r.slug)).toEqual(['unemployment-rate', 'youth-unemployment-rate', 'currency']);
    expect(rows[1]).toEqual({
      slug: 'youth-unemployment-rate', name: 'Youth Unemployment Rate', category: 'Labour',
      last: 24, previous: 1, unit: '%', reference: 'Sep/26',
    });
    expect(rows[2].last).toBeNull();
    expect(rows[2].unit).toBeNull();
  });
});
