import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  
  if (!country) {
    return NextResponse.json({ error: 'Country code required' }, { status: 400 });
  }

  try {
    const res = await fetch('https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/PortWatch_Port_Calls_Actual/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=5&f=json', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
            let total = 0;
            for (const f of data.features) {
                total += f.attributes?.Vessel_Waiting_Time || f.attributes?.throughput || 1;
            }
            return NextResponse.json({ utilization: total, source: 'imf_portwatch', parsed: true });
        }
    }
  } catch (e: any) {
     console.error('PortWatch failed:', e.message);
  }

  try {
    const res = await fetch('https://www.drewry.co.uk/sea-freight/to-from/world-container-index', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
       const html = await res.text();
       const $ = cheerio.load(html);
       let wciValue: number | null = null;
       $('table').find('td').each((i, el) => {
         const text = $(el).text().trim();
         if (text.includes('$') && text.includes(',')) {
            const num = parseFloat(text.replace('$', '').replace(',', ''));
            if (!isNaN(num) && wciValue === null) {
               wciValue = num;
            }
         }
       });
       if (wciValue !== null) {
           return NextResponse.json({ utilization: wciValue, source: 'drewry' });
       }
    }
  } catch (e: any) {
     console.error('Drewry failed:', e.message);
  }
  
  return NextResponse.json({ source: 'unavailable', utilization: null }, { status: 503 });
}
