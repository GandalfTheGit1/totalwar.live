/**
 * Route: app/api/paper/bets/route.ts
 *
 * Place a simulated bet filled at the live Polymarket ask.
 * POST /api/paper/bets { marketId, outcomeIndex: 0|1, stake, eventSlug?, eventTitle? } -> AccountSummary
 */

import { NextRequest, NextResponse } from 'next/server';
import { placePaperBet } from '@/lib/services/prediction-markets/paper-service';
import { errorResponse, readPlayerId, withPlayerCookie } from '@/lib/services/prediction-markets/player-session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const marketId = typeof body?.marketId === 'string' ? body.marketId : '';
  const outcomeIndex = body?.outcomeIndex;
  const stake = Number(body?.stake);

  if (!/^\d{1,20}$/.test(marketId) || (outcomeIndex !== 0 && outcomeIndex !== 1) || !Number.isFinite(stake)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { playerId, isNew } = readPlayerId(req);
  try {
    const summary = await placePaperBet(playerId, {
      marketId,
      outcomeIndex,
      stake,
      eventSlug: typeof body.eventSlug === 'string' ? body.eventSlug : undefined,
      eventTitle: typeof body.eventTitle === 'string' ? body.eventTitle : undefined,
    });
    return withPlayerCookie(NextResponse.json(summary), playerId, isNew);
  } catch (err) {
    return errorResponse(err);
  }
}
