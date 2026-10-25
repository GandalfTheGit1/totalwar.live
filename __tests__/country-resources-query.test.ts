/**
 * Consultas, búsqueda y formato sobre el dataset real generado (lib/data/country-resources.json).
 */

import { describe, it, expect } from 'vitest';
import { COUNTRY_RESOURCES } from '@/lib/services/country-resources/dataset';
import {
  getCountryCeased,
  getCountryResources,
  getProducers,
  searchCommodities,
  shareTier,
  toIso2,
} from '@/lib/services/country-resources/query';
import { formatQuantity, formatShare } from '@/lib/services/country-resources/format';
import { findCountryByCode } from '@/lib/data/all-198-countries';

const { commodities } = COUNTRY_RESOURCES;
const firstHit = (q: string) => searchCommodities(commodities, q)[0]?.commodity.id;

describe('integridad del dataset', () => {
  it('cubre la mayoría de países, con recursos de todas las categorías', () => {
    expect(Object.keys(COUNTRY_RESOURCES.countries).length).toBeGreaterThan(180);
    expect(new Set(commodities.map((c) => c.category))).toEqual(
      new Set(['energy', 'metals', 'minerals', 'electricity', 'agriculture', 'livestock', 'fisheries', 'forestry'])
    );
    expect(COUNTRY_RESOURCES.meta.sources.map((s) => s.id)).toEqual(['wmd', 'faostat-qcl', 'faostat-fo', 'fishstat', 'ember', 'eurostat']);
  });

  it('todos los países existen en countries.json y todos los registros apuntan a un recurso del catálogo', () => {
    const ids = new Set(commodities.map((c) => c.id));
    for (const [iso2, records] of Object.entries(COUNTRY_RESOURCES.countries)) {
      expect(findCountryByCode(iso2), iso2).toBeDefined();
      for (const r of records) {
        expect(ids.has(r.c), `${iso2} ${r.c}`).toBe(true);
        expect(r.v).toBeGreaterThan(0);
        expect(r.y).toBeGreaterThanOrEqual(COUNTRY_RESOURCES.meta.minYear);
        if (r.s !== null) expect(r.s).toBeLessThanOrEqual(1);
      }
    }
  });

  it('las cuotas de un recurso en su último año no superan el total mundial', () => {
    for (const c of commodities) {
      const sum = getProducers(COUNTRY_RESOURCES, c.id)
        .filter((p) => p.y === c.latestYear)
        .reduce((acc, p) => acc + (p.s ?? 0), 0);
      expect(sum, c.nameEs).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('getCountryResources', () => {
  it('España: aceite de oliva entre los primeros puestos mundiales y electricidad con su peso en el mix', () => {
    const es = getCountryResources(COUNTRY_RESOURCES, 'ESP');
    expect(es.length).toBeGreaterThan(100);
    const olive = es.find((r) => r.commodity.nameEs === 'Aceite de oliva')!;
    expect(olive.r).toBeLessThanOrEqual(3);
    expect(olive.s!).toBeGreaterThan(0.2);
    const wind = es.find((r) => r.commodity.id === 'ember:wind')!;
    expect(wind.m!).toBeGreaterThan(0.1);
    expect(wind.m!).toBeLessThan(0.5);
    // ordenados por cuota mundial
    const shares = es.map((r) => r.s ?? -1);
    expect([...shares].sort((a, b) => b - a)).toEqual(shares);
  });

  it('España: pesca, acuicultura y cabaña ganadera', () => {
    const ids = new Set(getCountryResources(COUNTRY_RESOURCES, 'ES').map((r) => r.c));
    for (const id of ['fish:capture', 'fish:aquaculture', 'fish:mussels', 'fish:tunas-bonitos-billfishes', 'fao-stock:1034', 'fao-stock:866']) {
      expect(ids.has(id), id).toBe(true);
    }
    const pigs = getCountryResources(COUNTRY_RESOURCES, 'ES').find((r) => r.c === 'fao-stock:1034')!;
    expect(pigs.v).toBeGreaterThan(20_000_000);
    expect(pigs.commodity.unit).toBe('head');
  });

  it('Albania: electricidad de Eurostat porque Ember no la cubre, casi toda hidroeléctrica', () => {
    const hydro = getCountryResources(COUNTRY_RESOURCES, 'AL').find((r) => r.c === 'ember:hydro')!;
    expect(hydro.src).toBe('eurostat');
    expect(hydro.v).toBeGreaterThan(4);
    expect(hydro.m!).toBeGreaterThan(0.8);
  });

  it('acepta ISO2 e ISO3 y devuelve lista vacía para códigos desconocidos', () => {
    expect(toIso2('esp')).toBe('ES');
    expect(toIso2('ES')).toBe('ES');
    expect(toIso2('ZZZ')).toBeNull();
    expect(getCountryResources(COUNTRY_RESOURCES, 'ZZZ')).toEqual([]);
  });
});

describe('getCountryCeased', () => {
  it('saca de la producción vigente lo que la fuente declara cerrado', () => {
    const panama = getCountryCeased(COUNTRY_RESOURCES, 'PA').map((r) => r.commodity.id);
    expect(panama).toContain('wmd:copper');
    expect(getCountryResources(COUNTRY_RESOURCES, 'PA').some((r) => r.c === 'wmd:copper')).toBe(false);
    expect(getCountryCeased(COUNTRY_RESOURCES, 'ES').map((r) => r.commodity.id)).toContain('wmd:aluminium');
    expect(getCountryCeased(COUNTRY_RESOURCES, 'DE').map((r) => r.commodity.id)).toContain('ember:nuclear');
    for (const records of Object.values(COUNTRY_RESOURCES.ceased)) {
      for (const r of records) expect(r.z).toBeGreaterThan(r.y);
    }
  });
});

describe('getProducers', () => {
  it('ordena por puesto y trae nombre y bandera del país', () => {
    const cobalt = getProducers(COUNTRY_RESOURCES, 'wmd:cobalt');
    expect(cobalt[0]).toMatchObject({ iso2: 'CD', iso3: 'COD', r: 1 });
    expect(cobalt.map((p) => p.r)).toEqual(cobalt.map((_, i) => i + 1));
    expect(getProducers(COUNTRY_RESOURCES, 'wmd:lithium').slice(0, 3).map((p) => p.iso2)).toContain('AU');
  });
});

describe('searchCommodities', () => {
  it('encuentra por nombre español sin acentos ni mayúsculas', () => {
    expect(firstHit('litio')).toBe('wmd:lithium');
    expect(firstHit('NIQUEL')).toBe('wmd:nickel');
    expect(firstHit('estano')).toBe('wmd:tin');
  });

  it('encuentra por varias palabras, nombre inglés y sinónimos', () => {
    expect(firstHit('aceite oliva')).toBe('fao:261');
    expect(firstHit('copper')).toBe('wmd:copper');
    expect(firstHit('tungsteno')).toBe('wmd:tungsten');
    expect(firstHit('eolica')).toBe('ember:wind');
    expect(firstHit('atun')).toBe('fish:tunas-bonitos-billfishes');
    expect(firstHit('mejillones')).toBe('fish:mussels');
    expect(firstHit('vacas')).toBe('fao-stock:866');
  });

  it('devuelve vacío para consultas vacías o sin coincidencia y respeta el límite', () => {
    expect(searchCommodities(commodities, '   ')).toEqual([]);
    expect(searchCommodities(commodities, 'xyzzy')).toEqual([]);
    expect(searchCommodities(commodities, 'carne', 3)).toHaveLength(3);
  });
});

describe('formato', () => {
  it('formatQuantity elige escala y unidad', () => {
    expect(formatQuantity(8310250, 't')).toBe('8,31 Mt');
    expect(formatQuantity(854001, 't')).toBe('854 kt');
    expect(formatQuantity(348, 't')).toBe('348 t');
    expect(formatQuantity(1343, 'kg')).toBe('1,34 t');
    expect(formatQuantity(450, 'kg')).toBe('450 kg');
    expect(formatQuantity(62.2, 'TWh')).toBe('62,2 TWh');
    expect(formatQuantity(0.4, 'TWh')).toBe('400 GWh');
    expect(formatQuantity(102055, 'Mm3')).toBe('102,1 mil M m³');
    expect(formatQuantity(18834013, 'm3')).toBe('18,8 M m³');
    expect(formatQuantity(9298800, 'ct')).toBe('9,3 M quilates');
    expect(formatQuantity(34565280, 'head')).toBe('34,6 M cabezas');
    expect(formatQuantity(587296, 'hive')).toBe('587 mil colmenas');
  });

  it('formatShare y shareTier', () => {
    expect(formatShare(0.3247)).toBe('32,5 %');
    expect(formatShare(0.0052)).toBe('0,52 %');
    expect(formatShare(0.00001)).toBe('<0,01 %');
    expect(formatShare(null)).toBe('—');
    expect(shareTier(0.1)).toBe('critical');
    expect(shareTier(0.03)).toBe('high');
    expect(shareTier(0.005)).toBe('medium');
    expect(shareTier(0.001)).toBe('low');
    expect(shareTier(null)).toBe('low');
  });
});
