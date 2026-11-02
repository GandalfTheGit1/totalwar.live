/**
 * GET /api/indicators
 *   ?catalog=1      → catálogo de indicadores de Trading Economics (para el buscador)
 *   ?slug=<slug>    → valor de ese indicador en cada país (clave ISO alfa-3)
 *
 * Datos generados con `npm run build:te` en lib/data/trading-economics/.
 */

import { NextResponse } from 'next/server';
import catalog from '@/lib/data/trading-economics/catalog.json';
import type { TeIndicator, TeIndicatorValues } from '@/lib/trading-economics/country-list';

const CATALOG = catalog as TeIndicator[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has('catalog')) {
    return NextResponse.json({ indicators: CATALOG });
  }

  const slug = searchParams.get('slug');
  if (slug) {
    // El slug solo se acepta si está en el catálogo y ya tiene datos: evita rutas arbitrarias en el import.
    const meta = CATALOG.find((i) => i.slug === slug);
    if (!meta?.countryCount) {
      return NextResponse.json({ error: `Indicador sin datos descargados: ${slug}` }, { status: 404 });
    }
    const values = (await import(`@/lib/data/trading-economics/values/${meta.slug}.json`)).default as TeIndicatorValues;
    return NextResponse.json(values);
  }

  return NextResponse.json({ error: 'Indica ?catalog=1 o ?slug=<indicador>.' }, { status: 400 });
}
