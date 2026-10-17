import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 21600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  if (!country) return NextResponse.json({ error: 'Country missing' }, { status: 400 });

  try {
    const res = await fetch('https://tradingeconomics.com/country-list/government-bond-yield', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      let targetYield: number | null = null;
      let usYield: number | null = null;

      $('table tr').each((i, el) => {
         const cols = $(el).find('td');
         if (cols.length >= 2) {
             const rowCountry = $(cols[0]).text().trim().toLowerCase();
             const rowYield = parseFloat($(cols[1]).text().trim());
             if (rowCountry.includes(country.toLowerCase())) {
                 targetYield = rowYield;
             }
             if (rowCountry.includes('united states')) {
                 usYield = rowYield;
             }
         }
      });

      if (targetYield !== null && usYield !== null) {
          const spread = (targetYield - usYield) * 100; // bps
          let distress = 'SAFE';
          if (spread > 500) distress = 'CRITICAL';
          else if (spread > 250) distress = 'HIGH';
          else if (spread > 100) distress = 'MEDIUM';
          
          return NextResponse.json({ spread, distress, source: 'scraped', yield: targetYield, usYield });
      } else if (targetYield !== null) {
          return NextResponse.json({ spread: targetYield * 100, distress: 'UNKNOWN', source: 'scraped', yield: targetYield });
      }
    } else {
        const res2 = await fetch('https://worldgovernmentbonds.com/', { signal: AbortSignal.timeout(8000) });
        if (res2.ok) {
           const html2 = await res2.text();
           const $2 = cheerio.load(html2);
           let targetYield: number | null = null;
           $2('table tr').each((i, el) => {
              const text = $2(el).text().toLowerCase();
              if (text.includes(country.toLowerCase())) {
                 const match = text.match(/([0-9]+\.[0-9]+)%/);
                 if (match) targetYield = parseFloat(match[1]);
              }
           });
           if (targetYield !== null) {
              return NextResponse.json({ spread: targetYield * 100, source: 'scraped_wgb', yield: targetYield });
           }
        }
    }
  } catch (e: any) {
      console.error('[SovereignYields] Scraping failed:', e.message);
  }
  
  return NextResponse.json({ source: 'unavailable', spread: null }, { status: 503 });
}
