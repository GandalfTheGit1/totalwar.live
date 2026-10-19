/**
 * Route: app/api/relations/[code]/route.ts
 *
 * Bilateral relations of one country with every other state, from the engine's export (lib/data/bilateral-relations/relations.json).
 * GET /api/relations/ES -> { country, countryNameEs, generatedAt, layer, partners: BilateralScore[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCountryRelations } from '@/lib/services/bilateral-relations/relations-store';
import { resolveCountryCode } from '@/lib/services/geopolitical/country-resolver';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const iso2 = resolveCountryCode(code) || code.toUpperCase();
  const payload = getCountryRelations(iso2);
  if (!payload) {
    return NextResponse.json({ error: `No relations data for ${code}` }, { status: 404 });
  }
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
