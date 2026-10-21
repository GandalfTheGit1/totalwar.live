/**
 * Route: app/api/claims/route.ts
 *
 * Full territorial claims registry list.
 * GET /api/claims -> { claims: TerritorialClaim[], excluded: ExcludedEntity[], count: number, total: number }
 */

import { NextResponse, NextRequest } from 'next/server';
import { loadClaimsFile, getAllClaims } from '@/lib/services/territorial-claims/claims-store';

export async function GET(_req: Request) {
  const file = loadClaimsFile();
  const claims = file?.claims || getAllClaims();
  const excluded = file?.excluded || [];
  return NextResponse.json(
    { claims, excluded, count: claims.length, total: claims.length },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
