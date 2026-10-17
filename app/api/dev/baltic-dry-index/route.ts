import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 21600;

export async function GET() {
  try {
    const res = await fetch('https://markets.businessinsider.com/commodities/baltic-dry-index', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
       const html = await res.text();
       const $ = cheerio.load(html);
       let priceStr = $('.price-section__current-value').text().replace(',', '').trim();
       if (!priceStr) {
           priceStr = $('[data-field="last_close"]').first().text().replace(',', '').trim();
       }
       const bdi = parseFloat(priceStr);
       if (!isNaN(bdi) && bdi > 0) {
         return NextResponse.json({ bdi, date: new Date().toISOString(), source: 'scraped', trend: 'STABLE' });
       } else {
         console.error('[BDI] Selectors returned empty or NaN. HTML:', html.substring(0, 300));
         return NextResponse.json({ source: 'parse_failed', bdi: null, htmlSample: html.substring(0, 300) });
       }
    }
  } catch (e: any) {
    console.error('[BDI] Scraping failed:', e.message);
  }

  return NextResponse.json({ source: 'unavailable', bdi: null });
}
