import { NextResponse } from 'next/server';
import { fetchWorldBankLpi } from '@/lib/macro/world-bank-client';

export const revalidate = 604800; // 7 days in seconds

export async function GET() {
  console.log('[API:WorldBankLPI] Fetching data from World Bank API via canonical client');
  
  try {
    const lpiMap = await fetchWorldBankLpi('all');
    const count = Object.keys(lpiMap).length;
    
    console.log(`[API:WorldBankLPI] Successfully fetched ${count} LPI scores`);
    
    return NextResponse.json({
      source: 'world-bank',
      count,
      data: lpiMap
    });
  } catch (error: any) {
    console.error(`[API:WorldBankLPI] Failure fetching World Bank LPI data:`, error);
    
    // Fail Fast & Loud per Rules 7.5 and 11 (No Silent Mocks on Failure)
    return NextResponse.json(
      {
        error: error.message || 'Error fetching World Bank LPI data',
        source: 'world-bank',
        failedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

