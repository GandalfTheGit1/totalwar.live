/**
 * Route: app/api/paper/close/route.ts
 *
 * Sell an open simulated position at the live Polymarket bid.
 * POST /api/paper/close { positionId } -> AccountSummary
 */

import { NextRequest, NextResponse } from 'next/server';
import { closePaperPosition } from '@/lib/services/prediction-markets/paper-service';
import { errorResponse, readPlayerId, withPlayerCookie } from '@/lib/services/prediction-markets/player-session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const positionId = typeof body?.positionId === 'string' ? body.positionId : '';

  if (!/^[0-9a-f-]{36}$/i.test(positionId)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { playerId, isNew } = readPlayerId(req);
  try {
    return withPlayerCookie(NextResponse.json(await closePaperPosition(playerId, positionId)), playerId, isNew);
  } catch (err) {
    return errorResponse(err);
  }
}
