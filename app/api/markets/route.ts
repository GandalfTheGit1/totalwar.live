/**
 * Route: app/api/markets/route.ts
 *
 * Live Polymarket events (Gamma API), ordered by 24h volume.
 * GET /api/markets?tag=geopolitics&limit=30&offset=0   -> { events: PmEvent[] }
 * GET /api/markets?q=iran                              -> { events: PmEvent[] } (search)
 */

import { NextRequest, NextResponse } from 'next/server';
import { listEvents, searchEvents } from '@/lib/services/prediction-markets/polymarket-client';

const TAG_PATTERN = /^[a-z0-9-]{1,60}$/;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q')?.trim().slice(0, 100);
  const tag = searchParams.get('tag')?.trim().toLowerCase();
  const limit = Number(searchParams.get('limit') ?? 30);
  const offset = Number(searchParams.get('offset') ?? 0);

  if (tag && !TAG_PATTERN.test(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  try {
    const events = q
      ? await searchEvents(q, Number.isFinite(limit) ? limit : 20)
      : await listEvents({
          tag: tag || undefined,
          limit: Number.isFinite(limit) ? limit : 30,
          offset: Number.isFinite(offset) ? offset : 0,
        });
    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' } });
  } catch (err) {
    console.error('[markets]', err);
    return NextResponse.json({ error: 'Polymarket no responde.' }, { status: 502 });
  }
}
