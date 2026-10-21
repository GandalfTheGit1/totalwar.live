/**
 * GET /api/resources
 *   ?catalog=1          → catálogo de recursos (para el buscador) y fuentes
 *   ?country=ES|ESP     → recursos que produce un país (cantidad, cuota y puesto mundial) y los que dejó de producir
 *   ?commodity=<id>     → países productores de un recurso, ordenados por puesto
 */

import { NextResponse } from 'next/server';
import { COUNTRY_RESOURCES } from '@/lib/services/country-resources/dataset';
import { getCountryCeased, getCountryResources, getProducers, toIso2 } from '@/lib/services/country-resources/query';
import { findCountryByCode } from '@/lib/data/all-198-countries';

/**
 * El navegador revalida siempre contra el ETag (la fecha de generación del dataset):
 * responde 304 sin cuerpo si no cambió y nunca sirve un catálogo viejo tras regenerar los datos.
 */
const ETAG = `"resources-${COUNTRY_RESOURCES.meta.generatedAt}"`;
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: ETAG };

export async function GET(request: Request) {
  if (request.headers.get('if-none-match') === ETAG) {
    return new Response(null, { status: 304, headers: CACHE_HEADERS });
  }
  const { searchParams } = new URL(request.url);
  const { meta, commodities } = COUNTRY_RESOURCES;

  if (searchParams.has('catalog')) {
    return NextResponse.json({ meta, commodities }, { headers: CACHE_HEADERS });
  }

  const countryParam = searchParams.get('country');
  if (countryParam) {
    const iso2 = toIso2(countryParam);
    if (!iso2) {
      return NextResponse.json({ error: `Código de país no reconocido: ${countryParam}` }, { status: 400 });
    }
    const country = findCountryByCode(iso2);
    return NextResponse.json(
      {
        meta,
        country: { iso2, iso3: country?.iso3 ?? null, nameEs: country?.nameEs ?? iso2 },
        resources: getCountryResources(COUNTRY_RESOURCES, iso2),
        ceased: getCountryCeased(COUNTRY_RESOURCES, iso2),
      },
      { headers: CACHE_HEADERS }
    );
  }

  const commodityId = searchParams.get('commodity');
  if (commodityId) {
    const commodity = commodities.find((c) => c.id === commodityId);
    if (!commodity) {
      return NextResponse.json({ error: `Recurso desconocido: ${commodityId}` }, { status: 404 });
    }
    return NextResponse.json(
      { meta, commodity, producers: getProducers(COUNTRY_RESOURCES, commodityId) },
      { headers: CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    { error: 'Indica ?catalog=1, ?country=<ISO> o ?commodity=<id>.' },
    { status: 400 }
  );
}
