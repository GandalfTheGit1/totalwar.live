/**
 * @vitest-environment node
 *
 * Ruta /api/resources: respuestas por parámetro y caché revalidada por versión del dataset.
 */

import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/resources/route';
import { COUNTRY_RESOURCES } from '@/lib/services/country-resources/dataset';

const get = (query: string, headers: Record<string, string> = {}) =>
  GET(new Request(`http://localhost/api/resources?${query}`, { headers }));

describe('GET /api/resources', () => {
  it('devuelve catálogo, país y productores', async () => {
    const catalog = await (await get('catalog=1')).json();
    expect(catalog.commodities).toHaveLength(COUNTRY_RESOURCES.commodities.length);

    const spain = await (await get('country=ESP')).json();
    expect(spain.country).toMatchObject({ iso2: 'ES', iso3: 'ESP', nameEs: 'España' });
    expect(spain.resources.length).toBeGreaterThan(100);
    expect(Array.isArray(spain.ceased)).toBe(true);

    const cobalt = await (await get('commodity=wmd:cobalt')).json();
    expect(cobalt.producers[0].iso2).toBe('CD');
  });

  it('responde 400/404 a parámetros inválidos', async () => {
    expect((await get('')).status).toBe(400);
    expect((await get('country=ZZZ')).status).toBe(400);
    expect((await get('commodity=nope')).status).toBe(404);
  });

  it('no deja que el navegador use un catálogo viejo: ETag por versión y 304 si no cambió', async () => {
    const res = await get('catalog=1');
    const etag = res.headers.get('etag')!;
    expect(etag).toContain(COUNTRY_RESOURCES.meta.generatedAt);
    expect(res.headers.get('cache-control')).toContain('max-age=0');
    const revalidated = await get('catalog=1', { 'If-None-Match': etag });
    expect(revalidated.status).toBe(304);
    expect(await revalidated.text()).toBe('');
    expect((await get('catalog=1', { 'If-None-Match': '"resources-old"' })).status).toBe(200);
  });
});
