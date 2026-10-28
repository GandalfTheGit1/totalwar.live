/**
 * Route: app/api/paper/account/route.ts
 *
 * GET    /api/paper/account -> AccountSummary (positions marked to market, resolved markets settled)
 * DELETE /api/paper/account -> reset to the starting balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccountSummary, resetPaperAccount } from '@/lib/services/prediction-markets/paper-service';
import { errorResponse, readPlayerId, withPlayerCookie } from '@/lib/services/prediction-markets/player-session';

export async function GET(req: NextRequest) {
  const { playerId, isNew } = readPlayerId(req);
  try {
    return withPlayerCookie(NextResponse.json(await getAccountSummary(playerId)), playerId, isNew);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  const { playerId, isNew } = readPlayerId(req);
  try {
    return withPlayerCookie(NextResponse.json(await resetPaperAccount(playerId)), playerId, isNew);
  } catch (err) {
    return errorResponse(err);
  }
}
