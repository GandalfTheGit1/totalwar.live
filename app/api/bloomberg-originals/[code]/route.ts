/**
 * Route: app/api/bloomberg-originals/[code]/route.ts
 *
 * Bloomberg Originals videos tagged to a country, with favourable/risk theses and companies mentioned.
 * GET /api/bloomberg-originals/MX -> CountryBloombergPayload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBloombergForCountry } from '@/lib/services/bloomberg-originals/store';
import { resolveCountryCode } from '@/lib/services/geopolitical/country-resolver';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const iso2 = resolveCountryCode(code);
  if (!iso2) {
    return NextResponse.json({ error: `Invalid or unknown country code ${code}` }, { status: 404 });
  }
  const payload = getBloombergForCountry(iso2);
  if (!payload) {
    return NextResponse.json({ error: 'Bloomberg Originals index not built yet' }, { status: 404 });
  }
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
