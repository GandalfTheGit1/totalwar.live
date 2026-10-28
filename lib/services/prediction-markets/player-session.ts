/**
 * Anonymous player identity for paper betting: a random UUID kept in an httpOnly cookie.
 * Swap for real auth when accounts exist; the ledger is keyed by this id only.
 */

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { PLAYER_ID_PATTERN } from './paper-store';
import { PaperBetError } from './paper-engine';

export const PLAYER_COOKIE = 'wge_player';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function readPlayerId(req: NextRequest): { playerId: string; isNew: boolean } {
  const existing = req.cookies.get(PLAYER_COOKIE)?.value;
  if (existing && PLAYER_ID_PATTERN.test(existing)) return { playerId: existing, isNew: false };
  return { playerId: randomUUID(), isNew: true };
}

export function withPlayerCookie(res: NextResponse, playerId: string, isNew: boolean): NextResponse {
  if (isNew) {
    res.cookies.set(PLAYER_COOKIE, playerId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR,
    });
  }
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof PaperBetError) {
    const status = err.code === 'position_not_found' ? 404 : 422;
    return NextResponse.json({ error: err.message, code: err.code }, { status });
  }
  console.error('[paper-betting]', err);
  return NextResponse.json({ error: 'Error interno del simulador de apuestas.' }, { status: 502 });
}
