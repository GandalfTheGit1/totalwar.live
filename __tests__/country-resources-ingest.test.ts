/**
 * @vitest-environment node
 *
 * Extracción de recursos por país: lectores (CSV, XLSX, ZIP), resolución de países,
 * parsers de cada fuente y cálculo de cuotas y puestos.
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { deflateRawSync } from 'zlib';
import { parseCsvLine, forEachCsvRow } from '@/lib/services/country-resources/ingest/csv';
import { parseSharedStrings, parseSheet } from '@/lib/services/country-resources/ingest/xlsx';
import { listZipEntries, openZipEntryStream } from '@/lib/services/country-resources/ingest/zip';
import { CountryResolver, M49Row, parseM49Html } from '@/lib/services/country-resources/ingest/country-codes';
import { parseWmdWorkbook } from '@/lib/services/country-resources/ingest/source-wmd';
import { parseFaostatCsv } from '@/lib/services/country-resources/ingest/source-faostat';
import { parseEmberCsv } from '@/lib/services/country-resources/ingest/source-ember';
import { assembleDataset } from '@/lib/services/country-resources/ingest/assemble';
import { FAO_QCL_CATALOG, FAO_STOCKS_CATALOG } from '@/lib/services/country-resources/ingest/catalog-fao';
import { parseFishCountries, parseFishSpecies, parseFishstatCsv } from '@/lib/services/country-resources/ingest/source-fishstat';
import { parseEurostatElectricity } from '@/lib/services/country-resources/ingest/source-eurostat';
import { SourceResult } from '@/lib/services/country-resources/ingest/observations';

const M49_ROWS: M49Row[] = [
  { m49: '724', iso2: 'ES', iso3: 'ESP', name: 'Spain' },
  { m49: '156', iso2: 'CN', iso3: 'CHN', name: 'China' },
  { m49: '410', iso2: 'KR', iso3: 'KOR', name: 'Republic of Korea' },
  { m49: '792', iso2: 'TR', iso3: 'TUR', name: 'Türkiye' },
  { m49: '152', iso2: 'CL', iso3: 'CHL', name: 'Chile' },
];
const resolver = new CountryResolver(M49_ROWS);

const streamOf = (text: string) => Readable.from([text]);

describe('parseCsvLine', () => {
  it('respeta comillas, comas internas, comillas escapadas y campos vacíos', () => {
    expect(parseCsvLine('a,"b,c","say ""hi""",,e')).toEqual(['a', 'b,c', 'say "hi"', '', 'e']);
    expect(parseCsvLine('"2","\'004","Afghanistan"')).toEqual(['2', "'004", 'Afghanistan']);
  });

  it('forEachCsvRow entrega filas con las columnas de la cabecera y quita el BOM', async () => {
    const rows: Record<string, string>[] = [];
    const n = await forEachCsvRow(streamOf('﻿A,B\n1,2\n\n3,"4,5"\n'), (r) => rows.push(r));
    expect(n).toBe(2);
    expect(rows).toEqual([{ A: '1', B: '2' }, { A: '3', B: '4,5' }]);
  });
});

describe('lector XLSX', () => {
  it('resuelve cadenas compartidas, celdas en línea y huecos de columna', () => {
    const shared = parseSharedStrings('<sst><si><t>Country</t></si><si><r><t>Sp</t></r><r><t>ain</t></r></si></sst>');
    expect(shared).toEqual(['Country', 'Spain']);
    const rows = parseSheet(
      '<sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1"><v>2024</v></c></row>' +
        '<row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2" s="1"/><c r="C2" t="inlineStr"><is><t>a &amp; b</t></is></c></row></sheetData>',
      shared
    );
    expect(rows).toEqual([
      ['Country', null, '2024'],
      ['Spain', null, 'a & b'],
    ]);
  });
});

/** Construye un ZIP mínimo con entradas comprimidas (deflate) para probar el lector. */
function buildZip(files: Record<string, string>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = Buffer.from(content);
    const data = deflateRawSync(raw);
    const nameBuf = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, data);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(Object.keys(files).length, 8);
  eocd.writeUInt16LE(Object.keys(files).length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, eocd]);
}

describe('lector ZIP', () => {
  it('lista las entradas y descomprime una en streaming', async () => {
    const zipPath = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'zip-test-')), 'test.zip');
    await fs.writeFile(zipPath, buildZip({ 'codes.csv': 'x', 'data.csv': 'A,B\n1,2\n'.repeat(1000) }));
    const entries = await listZipEntries(zipPath);
    expect(entries.map((e) => e.name)).toEqual(['codes.csv', 'data.csv']);
    const chunks: Buffer[] = [];
    for await (const chunk of await openZipEntryStream(zipPath, entries[1])) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).toString()).toBe('A,B\n1,2\n'.repeat(1000));
  });
});

describe('CountryResolver', () => {
  it('resuelve M49 (con o sin apóstrofo), ISO3, nombres oficiales y alias de World Mining Data', () => {
    expect(resolver.fromM49("'724")).toBe('ES');
    expect(resolver.fromM49('156')).toBe('CN');
    expect(resolver.fromM49('158')).toBe('TW'); // Taiwán no está en la tabla de la ONU
    expect(resolver.fromM49('001')).toBeNull(); // «World» no es un país
    expect(resolver.fromIso3('esp')).toBe('ES');
    expect(resolver.fromIso3('XKX')).toBe('XK');
    expect(resolver.fromName('Korea, South')).toBe('KR');
    expect(resolver.fromName('Turkiye')).toBe('TR');
    expect(resolver.fromName('Congo, D.R.')).toBe('CD');
    expect(resolver.fromName('Atlantis')).toBeNull();
  });

  it('parseM49Html lee la tabla en inglés por nombre de columna', () => {
    const html = `<table id="downloadTableEN"><tr><th>Country or Area</th><th>M49 Code</th><th>ISO-alpha2 Code</th><th>ISO-alpha3 Code</th></tr>
      <tr><td>Spain</td><td>724</td><td>ES</td><td>ESP</td></tr><tr><td>Antarctica</td><td>010</td><td>AQ</td><td>ATA</td></tr></table>`;
    expect(parseM49Html(html)).toEqual([
      { name: 'Spain', m49: '724', iso2: 'ES', iso3: 'ESP' },
      { name: 'Antarctica', m49: '010', iso2: 'AQ', iso3: 'ATA' },
    ]);
  });
});

describe('parsers de fuentes', () => {
  it('World Mining Data: totales mundiales, banderas, ceros conservados y países sin resolver', () => {
    const sheets = new Map([
      ['Copper', [
        ['6.4. Production…'],
        ['Country', 'unit', '2023', '2024', 'data source'],
        ['Spain', 'metr. t', '114786', '119207', 'r'],
        ['Chile', 'metr. t', '5250000', '5505890', 'e'],
        ['Korea, South', 'metr. t', '0', '0', 'r'],
        ['Atlantis', 'metr. t', '1', '1', 'r'],
        ['Total', 'metr. t', '22404392', '22911145', null],
      ]],
    ]);
    const result = parseWmdWorkbook(sheets, resolver);
    expect(result.commodities).toHaveLength(1);
    expect(result.commodities[0]).toMatchObject({ id: 'wmd:copper', nameEs: 'Cobre', unit: 't', category: 'metals' });
    expect(result.worldTotals.get('wmd:copper')?.get(2024)).toBe(22911145);
    expect(result.observations.filter((o) => o.iso2 === 'ES')).toEqual([
      { commodityId: 'wmd:copper', iso2: 'ES', year: 2023, value: 114786, flag: 'official' },
      { commodityId: 'wmd:copper', iso2: 'ES', year: 2024, value: 119207, flag: 'official' },
    ]);
    expect(result.observations.find((o) => o.iso2 === 'CL')?.flag).toBe('estimated');
    // Los ceros se conservan para poder detectar producción detenida en assembleDataset.
    expect(result.observations.filter((o) => o.iso2 === 'KR').map((o) => o.value)).toEqual([0, 0]);
    expect([...result.unmatchedCountries]).toEqual(['Atlantis']);
  });

  it('FAOSTAT: solo producción del catálogo, desde el año mínimo, sin valores «M» y con el mundo aparte', async () => {
    const header = '"Area Code","Area Code (M49)","Area","Item Code","Item Code (CPC)","Item","Element Code","Element","Year Code","Year","Unit","Value","Flag","Note"';
    const row = (m49: string, area: string, item: string, name: string, el: string, year: number, unit: string, v: string, flag: string) =>
      `"1","'${m49}","${area}","${item}","'0","${name}","${el}","x","${year}","${year}","${unit}","${v}","${flag}",`;
    const csv = [
      header,
      row('724', 'Spain', '261', 'Olive oil', '5510', 2023, 't', '854001.000000', 'A'),
      row('724', 'Spain', '261', 'Olive oil', '5510', 2015, 't', '1000.000000', 'A'), // anterior a minYear
      row('724', 'Spain', '261', 'Olive oil', '5312', 2023, 'ha', '5.000000', 'A'), // superficie, no producción
      row('724', 'Spain', '1717', 'Cereals, primary', '5510', 2023, 't', '9.000000', 'A'), // agregado fuera del catálogo
      row('152', 'Chile', '261', 'Olive oil', '5510', 2023, 't', '0.000000', 'M'),
      row('001', 'World', '261', 'Olive oil', '5510', 2023, 't', '2630000.000000', 'A'),
      row('159', 'China', '261', 'Olive oil', '5510', 2023, 't', '5.000000', 'E'), // agregado de China
    ].join('\n');
    const result = await parseFaostatCsv(streamOf(csv), resolver, { source: 'faostat-qcl', catalog: FAO_QCL_CATALOG, minYear: 2019 });
    expect(result.commodities).toEqual([
      expect.objectContaining({ id: 'fao:261', nameEs: 'Aceite de oliva', nameEn: 'Olive oil', unit: 't', category: 'agriculture' }),
    ]);
    expect(result.observations).toEqual([{ commodityId: 'fao:261', iso2: 'ES', year: 2023, value: 854001, flag: 'official' }]);
    expect(result.worldTotals.get('fao:261')?.get(2023)).toBe(2630000);
    expect([...result.unmatchedCountries]).toEqual(['159 China']);
  });

  it('FAOSTAT: cabaña ganadera en cabezas (miles de cabezas multiplicadas) y colmenas', async () => {
    const header = '"Area Code","Area Code (M49)","Area","Item Code","Item Code (CPC)","Item","Element Code","Element","Year Code","Year","Unit","Value","Flag","Note"';
    const row = (item: string, name: string, el: string, unit: string, v: string) =>
      `"1","'724","Spain","${item}","'0","${name}","${el}","Stocks","2024","2024","${unit}","${v}","A",`;
    const csv = [
      header,
      row('1034', 'Swine / pigs', '5111', 'An', '34565280'),
      row('1057', 'Chickens', '5112', '1000 An', '193476'),
      row('1181', 'Bees', '5114', 'No', '2804000'),
      row('866', 'Cattle', '5111', 'An', '6173960'),
    ].join('\n');
    const withStocks = await parseFaostatCsv(streamOf(csv), resolver, {
      source: 'faostat-qcl', catalog: FAO_QCL_CATALOG, stockCatalog: FAO_STOCKS_CATALOG, minYear: 2019,
    });
    const byId = Object.fromEntries(withStocks.observations.map((o) => [o.commodityId, o.value]));
    expect(byId).toEqual({ 'fao-stock:1034': 34565280, 'fao-stock:1057': 193476000, 'fao-stock:1181': 2804000, 'fao-stock:866': 6173960 });
    const pigs = withStocks.commodities.find((c) => c.id === 'fao-stock:1034')!;
    expect(pigs).toMatchObject({ nameEs: 'Cabaña porcina', unit: 'head', category: 'livestock' });
    expect(pigs.note).toMatch(/Existencias/);
    expect(withStocks.commodities.find((c) => c.id === 'fao-stock:1181')!.unit).toBe('hive');

    // Sin catálogo de existencias, esas filas se ignoran.
    const withoutStocks = await parseFaostatCsv(streamOf(csv), resolver, { source: 'faostat-qcl', catalog: FAO_QCL_CATALOG, minYear: 2019 });
    expect(withoutStocks.observations).toEqual([]);
  });

  it('FishStat: suma especies por grupo y en totales de captura, acuicultura y algas', async () => {
    const species = parseFishSpecies(
      '"3A_Code","Major_Group","ISSCAAP_Group_En","ISSCAAP_Group_Es"\n' +
        '"SKJ","PISCES","Tunas, bonitos, billfishes","Atunes, bonitos, agujas"\n' +
        '"YFT","PISCES","Tunas, bonitos, billfishes","Atunes, bonitos, agujas"\n' +
        '"MUS","MOLLUSCA","Mussels","Mejillones"\n' +
        '"SWX","PLANTAE AQUATICAE","Red seaweeds","Algas rojas"\n' +
        '"BLW","MAMMALIA","Blue-whales, fin-whales","Ballenas azules, rorcuales"\n'
    );
    const countries = parseFishCountries('"UN_Code","ISO2_Code","Name_En"\n"724","ES","Spain"\n"896","","Other NEI"\n');
    const header = '"COUNTRY.UN_CODE","SPECIES.ALPHA_3_CODE","AREA.CODE","PRODUCTION_SOURCE_DET.CODE","MEASURE","PERIOD","VALUE","STATUS"';
    const row = (un: string, sp: string, src: string, measure: string, year: number, v: string, status: string) =>
      `"${un}","${sp}","27","${src}","${measure}",${year},${v},"${status}"`;
    const csv = [
      header,
      row('724', 'SKJ', 'CAPTURE', 'Q_tlw', 2023, '100', 'A'),
      row('724', 'YFT', 'CAPTURE', 'Q_tlw', 2023, '300', 'E'),
      row('724', 'MUS', 'MARINE', 'Q_tlw', 2023, '150', 'A'),
      row('724', 'SWX', 'CAPTURE', 'Q_tlw', 2023, '5', 'A'),
      row('724', 'BLW', 'CAPTURE', 'Q_tlw', 2023, '1', 'A'), // mamíferos: fuera
      row('724', 'SKJ', 'CAPTURE', 'Q_no_1', 2023, '9', 'A'), // número, no toneladas
      row('724', 'SKJ', 'CAPTURE', 'Q_tlw', 2022, '0', 'N'), // no significativo → cero
      row('724', 'SKJ', 'CAPTURE', 'Q_tlw', 2021, '', 'O'), // ausente
      row('896', 'SKJ', 'CAPTURE', 'Q_tlw', 2023, '7', 'A'),
    ].join('\n');
    const result = await parseFishstatCsv(streamOf(csv), species, countries, resolver, 2019);
    const obs = Object.fromEntries(result.observations.filter((o) => o.year === 2023).map((o) => [o.commodityId, [o.value, o.flag]]));
    expect(obs).toEqual({
      'fish:tunas-bonitos-billfishes': [400, 'estimated'], // 300 de 400 estimadas
      'fish:capture': [400, 'estimated'],
      'fish:mussels': [150, 'official'],
      'fish:aquaculture': [150, 'official'],
      'fish:red-seaweeds': [5, 'official'],
      'fish:seaweed': [5, 'official'],
    });
    expect(result.observations.find((o) => o.year === 2022 && o.commodityId === 'fish:capture')?.value).toBe(0);
    expect(result.commodities.find((c) => c.id === 'fish:tunas-bonitos-billfishes')).toMatchObject({
      nameEs: 'Atunes, bonitos, agujas', category: 'fisheries', unit: 't', source: 'fishstat',
    });
    expect(result.commodities.some((c) => c.nameEs.startsWith('Ballenas'))).toBe(false);
    expect([...result.unmatchedCountries]).toEqual(['896']);
  });

  it('Eurostat: solo países sin Ember, suma fotovoltaica y termosolar y da la generación total', () => {
    // JSON-stat mínimo: siec × geo × time (los demás ejes con tamaño 1).
    const siec = ['TOTAL', 'RA100', 'RA410', 'RA420'];
    const geo = ['AL', 'EL', 'EU27_2020'];
    const time = ['2024'];
    const value: Record<string, number> = {};
    const put = (s: string, g: string, v: number) => { value[String(siec.indexOf(s) * geo.length + geo.indexOf(g))] = v; };
    put('TOTAL', 'AL', 8255.7); put('RA100', 'AL', 7471.4); put('RA410', 'AL', 4); put('RA420', 'AL', 784.4);
    put('RA100', 'EL', 3000); put('RA100', 'EU27_2020', 1);
    const json = {
      id: ['freq', 'siec', 'geo', 'time'],
      size: [1, siec.length, geo.length, time.length],
      dimension: {
        freq: { category: { index: { A: 0 } } },
        siec: { category: { index: Object.fromEntries(siec.map((s, i) => [s, i])) } },
        geo: { category: { index: geo } },
        time: { category: { index: { 2024: 0 } } },
      },
      value,
    };
    const gr = new CountryResolver([...M49_ROWS, { m49: '008', iso2: 'AL', iso3: 'ALB', name: 'Albania' }, { m49: '300', iso2: 'GR', iso3: 'GRC', name: 'Greece' }]);
    const result = parseEurostatElectricity(json, gr, new Set(['GR']));
    const obs = Object.fromEntries(result.observations.map((o) => [o.commodityId, o]));
    expect(Object.keys(obs).sort()).toEqual(['ember:hydro', 'ember:solar']);
    expect(obs['ember:hydro']).toMatchObject({ iso2: 'AL', year: 2024, source: 'eurostat' });
    expect(obs['ember:hydro'].value).toBeCloseTo(7.4714, 4);
    expect(obs['ember:solar'].value).toBeCloseTo(0.7884, 4);
    expect(result.generationTotals?.get('AL')?.get(2024)).toBeCloseTo(8.2557, 4);
    expect(result.unmatchedCountries.size).toBe(0); // los agregados de la UE no cuentan como país sin resolver
  });

  it('Ember: renovables y nuclear por país, total mundial y generación total para el mix', async () => {
    const header = 'Area,ISO 3 code,Year,Area type,Continent,Ember region,EU,OECD,G20,G7,ASEAN,Category,Subcategory,Variable,Unit,Value,YoY absolute change,YoY % change';
    const row = (area: string, iso: string, type: string, sub: string, variable: string, unit: string, v: string, cat = 'Electricity generation') =>
      `${area},${iso},2024,${type},Europe,Europe,1,1,0,0,0,${cat},${sub},${variable},${unit},${v},,`;
    const csv = [
      header,
      row('Spain', 'ESP', 'Country or economy', 'Fuel', 'Wind', 'TWh', '62.2'),
      row('Spain', 'ESP', 'Country or economy', 'Fuel', 'Gas', 'TWh', '52.3'),
      row('Spain', 'ESP', 'Country or economy', 'Total', 'Total Generation', 'TWh', '280.9'),
      row('Spain', 'ESP', 'Country or economy', 'Fuel', 'Wind', '%', '22.1'),
      row('Spain', 'ESP', 'Country or economy', 'Fuel', 'Wind', 'GW', '31', 'Capacity'),
      row('World', '', 'Region', 'Fuel', 'Wind', 'TWh', '2500'),
    ].join('\n');
    const result = await parseEmberCsv(streamOf(csv), resolver, 2019);
    expect(result.observations).toEqual([{ commodityId: 'ember:wind', iso2: 'ES', year: 2024, value: 62.2 }]);
    expect(result.worldTotals.get('ember:wind')?.get(2024)).toBe(2500);
    expect(result.generationTotals?.get('ES')?.get(2024)).toBe(280.9);
  });
});

describe('assembleDataset', () => {
  const copper: SourceResult = {
    commodities: [{ id: 'wmd:copper', nameEs: 'Cobre', nameEn: 'Copper', category: 'metals', unit: 't', source: 'wmd' }],
    observations: [
      { commodityId: 'wmd:copper', iso2: 'ES', year: 2023, value: 100 },
      { commodityId: 'wmd:copper', iso2: 'ES', year: 2024, value: 120, flag: 'official' },
      { commodityId: 'wmd:copper', iso2: 'CL', year: 2024, value: 600 },
      { commodityId: 'wmd:copper', iso2: 'CN', year: 2022, value: 300 }, // dato más antiguo
      { commodityId: 'wmd:copper', iso2: 'PA', year: 2023, value: 330 },
      { commodityId: 'wmd:copper', iso2: 'PA', year: 2024, value: 0 }, // mina cerrada
      { commodityId: 'wmd:copper', iso2: 'KR', year: 2024, value: 0 }, // nunca produjo
    ],
    worldTotals: new Map([['wmd:copper', new Map([[2022, 1000], [2024, 1200]])]]),
    unmatchedCountries: new Set(),
    years: [2022, 2024],
  };
  const wind: SourceResult = {
    commodities: [{ id: 'ember:wind', nameEs: 'Energía eólica', nameEn: 'Wind power', category: 'electricity', unit: 'TWh', source: 'ember' }],
    observations: [
      { commodityId: 'ember:wind', iso2: 'ES', year: 2024, value: 60 },
      // Un solo cero provisional no basta para dar la producción por detenida…
      { commodityId: 'ember:wind', iso2: 'AZ', year: 2024, value: 0.1 },
      { commodityId: 'ember:wind', iso2: 'AZ', year: 2025, value: 0 },
      // …dos años seguidos en cero sí.
      { commodityId: 'ember:wind', iso2: 'DE', year: 2023, value: 7 },
      { commodityId: 'ember:wind', iso2: 'DE', year: 2024, value: 0 },
      { commodityId: 'ember:wind', iso2: 'DE', year: 2025, value: 0 },
    ],
    worldTotals: new Map(), // sin total publicado: se usa la suma de países
    generationTotals: new Map([['ES', new Map([[2024, 300]])]]),
    unmatchedCountries: new Set(),
    years: [2024, 2024],
  };

  const dataset = assembleDataset([copper, wind], [], 2019, '2026-10-20T00:00:00.000Z');

  it('usa el último año de cada país y la cuota sobre el total mundial de ese año', () => {
    const es = dataset.countries.ES.find((r) => r.c === 'wmd:copper')!;
    expect(es).toMatchObject({ v: 120, y: 2024, s: 0.1, f: 'official' });
    const cn = dataset.countries.CN.find((r) => r.c === 'wmd:copper')!;
    expect(cn).toMatchObject({ y: 2022, s: 0.3 });
  });

  it('ordena el puesto por cuota y cuenta productores', () => {
    const ranks = Object.fromEntries(Object.entries(dataset.countries).map(([iso, recs]) => [iso, recs.find((r) => r.c === 'wmd:copper')?.r]));
    expect(ranks).toEqual({ CL: 1, CN: 2, ES: 3 });
    const stats = dataset.commodities.find((c) => c.id === 'wmd:copper')!;
    expect(stats).toMatchObject({ producerCount: 3, latestYear: 2024, worldTotal: 1200 });
  });

  it('electricidad: cuota del mix nacional y total mundial por suma cuando la fuente no lo publica', () => {
    const esWind = dataset.countries.ES.find((r) => r.c === 'ember:wind')!;
    expect(esWind).toMatchObject({ m: 0.2, r: 1 });
    expect(esWind.s).toBeCloseTo(60 / 60.1, 4);
  });

  it('separa la producción detenida: un cero tras producir en minería; dos seguidos en Ember', () => {
    expect(dataset.countries.PA).toBeUndefined();
    expect(dataset.countries.KR).toBeUndefined();
    expect(dataset.ceased).toEqual({
      DE: [{ c: 'ember:wind', v: 7, y: 2023, z: 2025 }],
      PA: [{ c: 'wmd:copper', v: 330, y: 2023, z: 2024 }],
    });
    expect(dataset.countries.AZ).toEqual([expect.objectContaining({ c: 'ember:wind', v: 0.1, y: 2024 })]);
  });

  it('marca la fuente del dato cuando no es la del recurso (Eurostat dentro de un recurso de Ember)', () => {
    const extra: SourceResult = {
      commodities: [],
      observations: [{ commodityId: 'ember:wind', iso2: 'AL', year: 2024, value: 1, source: 'eurostat' }],
      worldTotals: new Map(),
      generationTotals: new Map([['AL', new Map([[2024, 10]])]]),
      unmatchedCountries: new Set(),
      years: [2024, 2024],
    };
    const withAlbania = assembleDataset([copper, wind, extra], [], 2019);
    expect(withAlbania.countries.AL).toEqual([expect.objectContaining({ c: 'ember:wind', src: 'eurostat', m: 0.1 })]);
    expect(withAlbania.countries.ES.find((r) => r.c === 'ember:wind')!.src).toBeUndefined();
  });

  it('ordena los recursos de cada país por cuota mundial descendente', () => {
    expect(dataset.countries.ES.map((r) => r.c)).toEqual(['ember:wind', 'wmd:copper']);
    expect(Object.keys(dataset.countries)).toEqual(['AZ', 'CL', 'CN', 'ES']);
    expect(dataset.meta).toEqual({ generatedAt: '2026-10-20T00:00:00.000Z', sources: [], minYear: 2019 });
  });
});
