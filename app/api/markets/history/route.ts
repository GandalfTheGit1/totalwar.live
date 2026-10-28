/**
 * Route: app/api/markets/history/route.ts
 *
 * Price history of one outcome token (CLOB API).
 * GET /api/markets/history?token=<clobTokenId>&interval=1w -> { history: { t, p }[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory, type HistoryInterval } from '@/lib/services/prediction-markets/polymarket-client';

const INTERVALS: HistoryInterval[] = ['1d', '1w', '1m', 'max'];

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  const interval = (req.nextUrl.searchParams.get('interval') ?? '1w') as HistoryInterval;

  if (!/^\d{1,100}$/.test(token) || !INTERVALS.includes(interval)) {
    return NextResponse.json({ error: 'Invalid token or interval' }, { status: 400 });
  }

  try {
    const history = await getPriceHistory(token, interval);
    return NextResponse.json({ history }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (err) {
    console.error('[markets/history]', err);
    return NextResponse.json({ error: 'Polymarket no responde.' }, { status: 502 });
  }
}
