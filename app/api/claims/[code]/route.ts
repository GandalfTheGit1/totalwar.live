/**
 * Route: app/api/claims/[code]/route.ts
 *
 * Territorial claims involving a specific country (as administrator, claimant, or third-party stance).
 * GET /api/claims/ES -> CountryClaimsPayload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClaimsForCountry } from '@/lib/services/territorial-claims/claims-store';
import { resolveCountryCode } from '@/lib/services/geopolitical/country-resolver';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const iso2 = resolveCountryCode(code);
  if (!iso2) {
    return NextResponse.json({ error: `Invalid or unknown country code ${code}` }, { status: 404 });
  }
  const payload = getClaimsForCountry(iso2);
  if (!payload) {
    return NextResponse.json({ error: `No claims data found for ${code}` }, { status: 404 });
  }
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
