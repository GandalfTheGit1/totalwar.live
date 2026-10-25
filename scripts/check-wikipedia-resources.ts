/**
 * scripts/check-wikipedia-resources.ts
 *
 * Revisa de forma sistemática y rápida si existe algún artículo en Wikipedia (en español o en inglés)
 * para los ~300 recursos naturales definidos en lib/data/country-resources.json.
 *
 * Comprueba páginas con patrones de clasificación y ranking de producción por países:
 *   - Español: "Anexo:Países por producción de [recurso]", "Anexo:Países productores de [recurso]",
 *              "Anexo:Producción mundial de [recurso]", "Anexo:Países por población de [ganado]"
 *   - Inglés:  "List of countries by [resource] production", "[resource] production by country",
 *              "Lists of countries by mineral production"
 *
 * Uso:
 *   npx tsx scripts/check-wikipedia-resources.ts
 *   npx tsx scripts/check-wikipedia-resources.ts --refresh
 *   npx tsx scripts/check-wikipedia-resources.ts --category metals
 *   npx tsx scripts/check-wikipedia-resources.ts --missing-only
 *   npx tsx scripts/check-wikipedia-resources.ts --found-only
 *   npx tsx scripts/check-wikipedia-resources.ts --out lib/data/wikipedia-production-articles.json
 */

import { promises as fs } from 'fs';
import path from 'path';

interface Commodity {
  id: string;
  nameEs: string;
  nameEn: string;
  category: string;
  unit: string;
  source: string;
  aliases?: string[];
  note?: string;
  producerCount?: number;
  latestYear?: number;
  worldTotal?: number;
}

interface CountryResourcesData {
  meta: Record<string, unknown>;
  commodities: Commodity[];
}

export interface ArticleMatch {
  exists: boolean;
  title: string | null;
  url: string | null;
  isRedirect: boolean;
  redirectTarget?: string | null;
  fragment?: string | null;
  matchType?: 'canonical' | 'alias' | 'category' | 'langlink' | 'online_verify';
}

export interface CommodityWikiResult {
  id: string;
  nameEs: string;
  nameEn: string;
  category: string;
  unit: string;
  source: string;
  hasArticle: boolean;
  hasBoth: boolean;
  es: ArticleMatch;
  en: ArticleMatch;
}

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'lib', 'data', 'country-resources.json');
const CACHE_DIR = path.join(ROOT, '.cache', 'wikipedia-production');
const DEFAULT_OUTPUT = path.join(ROOT, 'lib', 'data', 'wikipedia-production-articles.json');
const USER_AGENT = 'GeopoliticalEngineResearchBot/1.0 (contact@worldgeo.org; Wikipedia Research for Open Geopolitics)';

const PAREN_REGEX = /\s*\([^)]*\)/g;
const COMMA_SUFFIX_REGEX = /,\s*.*$/;

function cleanTerm(text: string): string {
  return text
    .replace(PAREN_REGEX, '')
    .replace(COMMA_SUFFIX_REGEX, '')
    .trim();
}

function singularizeEn(word: string): string {
  const w = word.trim().toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ses') || w.endsWith('shes') || w.endsWith('ches') || w.endsWith('xes')) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
  return w;
}

function singularizeEs(word: string): string {
  const w = word.trim().toLowerCase();
  if (w.endsWith('ces') && w.length > 4) return w.slice(0, -3) + 'z';
  if (w.endsWith('es') && !w.endsWith('tes') && !w.endsWith('res')) {
    if (w.endsWith('les')) return w.slice(0, -2);
    if (w.endsWith('nes')) return w.slice(0, -2);
  }
  if (w.endsWith('as') || w.endsWith('os') || w.endsWith('es')) return w.slice(0, -1);
  if (w.endsWith('s') && !w.endsWith('is')) return w.slice(0, -1);
  return w;
}

// Diccionario de equivalencias o sinónimos directos para garantizar correspondencia fiel
const KNOWN_SYNONYMS: Record<string, { es?: string[]; en?: string[] }> = {
  'wmd:uranium': { es: ['uranio'], en: ['uranium'] },
  'wmd:coking-coal': { es: ['carbón'], en: ['coal'] },
  'wmd:steam-coal': { es: ['carbón'], en: ['coal'] },
  'wmd:lignite': { es: ['carbón'], en: ['coal'] },
  'wmd:petroleum': { es: ['petróleo', 'crudo'], en: ['oil', 'petroleum'] },
  'wmd:natural-gas': { es: ['gas natural'], en: ['natural gas', 'gas'] },
  'wmd:iron': { es: ['hierro'], en: ['iron ore', 'iron'] },
  'wmd:copper': { es: ['cobre'], en: ['copper'] },
  'wmd:gold': { es: ['oro'], en: ['gold'] },
  'wmd:silver': { es: ['plata'], en: ['silver'] },
  'wmd:aluminium': { es: ['aluminio'], en: ['aluminium', 'aluminum'] },
  'wmd:tin': { es: ['estaño'], en: ['tin'] },
  'wmd:lead': { es: ['plomo'], en: ['lead'] },
  'wmd:zinc': { es: ['zinc'], en: ['zinc'] },
  'wmd:nickel': { es: ['nickel', 'níquel'], en: ['nickel'] },
  'wmd:lithium': { es: ['litio'], en: ['lithium'] },
  'wmd:manganese': { es: ['manganeso'], en: ['manganese'] },
  'wmd:titanium': { es: ['titanio'], en: ['titanium'] },
  'wmd:bauxite': { es: ['bauxita'], en: ['bauxite'] },
  'wmd:salt': { es: ['sal'], en: ['salt'] },
  'ember:solar': { es: ['electricidad', 'energía solar', 'fuentes renovables'], en: ['photovoltaics', 'solar power', 'renewable electricity'] },
  'ember:wind': { es: ['electricidad', 'energía eólica', 'fuentes renovables'], en: ['wind power', 'renewable electricity'] },
  'ember:hydro': { es: ['electricidad', 'fuentes renovables'], en: ['hydroelectricity', 'hydro power', 'renewable electricity'] },
  'ember:nuclear': { es: ['electricidad'], en: ['nuclear power', 'electricity'] },
  'ember:bioenergy': { es: ['fuentes renovables'], en: ['renewable electricity'] },
  'fao:27': { es: ['arroz'], en: ['rice'] },
  'fao:15': { es: ['trigo'], en: ['wheat'] },
  'fao:56': { es: ['maíz'], en: ['corn', 'maize'] },
  'fao:236': { es: ['soja', 'soya'], en: ['soybean', 'soy', 'soya beans'] },
  'fao:116': { es: ['papa', 'patata'], en: ['potato'] },
  'fao:572': { es: ['aguacate', 'palta'], en: ['avocado'] },
  'fao:388': { es: ['tomate'], en: ['tomato'] },
  'fao:403': { es: ['cebolla', 'cebollas'], en: ['onion'] },
  'fao:515': { es: ['manzana'], en: ['apple'] },
  'fao:560': { es: ['uva'], en: ['grape', 'wine'] },
  'fao:656': { es: ['café'], en: ['coffee'] },
  'fao:661': { es: ['cacao'], en: ['cocoa'] },
  'fao-stock:866': { es: ['ganado vacuno', 'ganado bovino'], en: ['cattle'] },
};

async function fetchWikiJson(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Error en API Wikipedia (${res.status}): ${url}`);
  }
  return res.json();
}

/**
 * Carga o descarga el índice completo de anexos de producción en Wikipedia ES
 */
async function loadSpanishWikiIndex(refresh: boolean) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cacheFile = path.join(CACHE_DIR, 'es-production-index.json');

  if (!refresh) {
    try {
      const data = await fs.readFile(cacheFile, 'utf8');
      const parsed = JSON.parse(data);
      const map = new Map<string, any>();
      for (const [k, v] of Object.entries(parsed)) {
        map.set(k, v);
      }
      return { pages: map };
    } catch {
      // continuar descarga si no existe
    }
  }

  process.stdout.write('  Descargando índice de anexos y listas de producción en Wikipedia (ES)...');
  const rawTitles = new Set<string>();

  const prefixes = [
    'Países por producción',
    'Países productores de',
    'Producción mundial de',
    'Países por población de ganado',
  ];

  for (const prefix of prefixes) {
    const url = new URL('https://es.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'allpages');
    url.searchParams.set('apprefix', prefix);
    url.searchParams.set('apnamespace', '104');
    url.searchParams.set('aplimit', '500');
    url.searchParams.set('format', 'json');

    const json = await fetchWikiJson(url.toString());
    for (const p of json.query?.allpages || []) {
      rawTitles.add(p.title);
    }
  }

  // Categorías de producción en español
  const categories = [
    'Categoría:Anexos:Países por producción',
    'Categoría:Anexos:Producción mundial de alimentos',
  ];

  for (const cat of categories) {
    const catUrl = `https://es.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=500&format=json`;
    const catJson = await fetchWikiJson(catUrl);
    for (const m of catJson.query?.categorymembers || []) {
      rawTitles.add(m.title);
    }
  }

  const titleArray = Array.from(rawTitles);
  const resultPages = new Map<string, any>();

  const setEntry = (key: string, entry: any) => {
    const k = key.toLowerCase().trim();
    if (!k) return;
    const existing = resultPages.get(k);
    if (!existing) {
      resultPages.set(k, entry);
    } else if (existing.isRedirect && !entry.isRedirect) {
      // Priorizar artículo canónico real sobre redirecciones
      resultPages.set(k, entry);
    }
  };

  for (let i = 0; i < titleArray.length; i += 50) {
    const batch = titleArray.slice(i, i + 50);
    const url = new URL('https://es.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('titles', batch.join('|'));
    url.searchParams.set('prop', 'info|langlinks');
    url.searchParams.set('lllang', 'en');
    url.searchParams.set('redirects', '1');
    url.searchParams.set('format', 'json');

    const json = await fetchWikiJson(url.toString());
    const redirectsMap = new Map<string, string>();
    for (const r of json.query?.redirects || []) {
      redirectsMap.set(r.from, r.to);
    }

    const pages = json.query?.pages || {};
    for (const p of Object.values(pages) as any[]) {
      if (p.missing !== undefined) continue;
      const title = p.title;
      const enTitle = p.langlinks?.[0]?.['*'] || null;
      const urlWiki = `https://es.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

      const entry = {
        title,
        url: urlWiki,
        isRedirect: false,
        enTitle,
      };

      setEntry(title, entry);

      const match = title.match(/^(?:Anexo:)?(?:Países por producción de|Países productores de|Producción mundial de|Países por población de)\s+(?:a nivel mundial\s+)?(?:de\s+)?(.+)/i);
      if (match) {
        const resourcePart = match[1].trim();
        setEntry(resourcePart, entry);
        setEntry(singularizeEs(resourcePart), entry);
      }
    }

    for (const [from, to] of redirectsMap.entries()) {
      if (to.includes('Bancos de América Central')) continue;

      const targetEntry = resultPages.get(to.toLowerCase());
      const fromUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(from.replace(/ /g, '_'))}`;
      const entry = {
        title: from,
        url: fromUrl,
        isRedirect: true,
        target: to,
        enTitle: targetEntry?.enTitle || null,
      };

      setEntry(from, entry);

      const match = from.match(/^(?:Anexo:)?(?:Países por producción de|Países productores de|Producción mundial de|Países por población de)\s+(?:a nivel mundial\s+)?(?:de\s+)?(.+)/i);
      if (match) {
        const resourcePart = match[1].trim();
        setEntry(resourcePart, entry);
        setEntry(singularizeEs(resourcePart), entry);
      }
    }
  }

  const obj: Record<string, any> = {};
  for (const [k, v] of resultPages.entries()) {
    obj[k] = v;
  }
  await fs.writeFile(cacheFile, JSON.stringify(obj, null, 2), 'utf8');
  console.log(` listo (${resultPages.size} entradas)`);

  return { pages: resultPages };
}

/**
 * Carga o descarga el índice completo de listas de producción en Wikipedia EN
 */
async function loadEnglishWikiIndex(refresh: boolean) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cacheFile = path.join(CACHE_DIR, 'en-production-index.json');

  if (!refresh) {
    try {
      const data = await fs.readFile(cacheFile, 'utf8');
      const parsed = JSON.parse(data);
      const map = new Map<string, any>();
      for (const [k, v] of Object.entries(parsed)) {
        map.set(k, v);
      }
      return { pages: map };
    } catch {
      // continuar descarga si no existe
    }
  }

  process.stdout.write('  Descargando índice de listas de producción en Wikipedia (EN)...');
  const rawTitles = new Set<string>();

  let apcontinue: string | undefined = undefined;
  do {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'allpages');
    url.searchParams.set('apprefix', 'List of countries by ');
    url.searchParams.set('apnamespace', '0');
    url.searchParams.set('aplimit', '500');
    url.searchParams.set('format', 'json');
    if (apcontinue) url.searchParams.set('apcontinue', apcontinue);

    const json = await fetchWikiJson(url.toString());
    for (const p of json.query?.allpages || []) {
      const t = p.title.toLowerCase();
      if (t.includes('production') || t.includes('producing') || t.includes('reserves') || t.includes('exports')) {
        rawTitles.add(p.title);
      }
    }
    apcontinue = json.continue?.apcontinue;
  } while (apcontinue);

  const categories = [
    'Category:Lists_of_countries_by_production',
    'Category:Lists_of_countries_by_mineral_production',
  ];

  for (const cat of categories) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${cat}&cmlimit=500&format=json`;
    const json = await fetchWikiJson(url);
    for (const m of json.query?.categorymembers || []) {
      if (m.ns === 0) rawTitles.add(m.title);
    }
  }

  const templates = [
    'Template:Industry_country_lists',
    'Template:Agriculture_country_lists',
    'Template:Energy_country_lists',
  ];

  for (const tmpl of templates) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=links&titles=${tmpl}&pllimit=500&format=json`;
    const json = await fetchWikiJson(url);
    const pages = json.query?.pages || {};
    for (const p of Object.values(pages) as any[]) {
      for (const l of p.links || []) {
        if (l.ns === 0 && (l.title.includes('List of') || l.title.includes('production') || l.title.includes('by country'))) {
          rawTitles.add(l.title);
        }
      }
    }
  }

  rawTitles.add('Lists of countries by mineral production');
  rawTitles.add('Solar power by country');
  rawTitles.add('Wind power by country');
  rawTitles.add('Nuclear power by country');
  rawTitles.add('Fishing industry by country');

  const titleArray = Array.from(rawTitles);
  const resultPages = new Map<string, any>();

  const setEntry = (key: string, entry: any) => {
    const k = key.toLowerCase().trim();
    if (!k) return;
    const existing = resultPages.get(k);
    if (!existing) {
      resultPages.set(k, entry);
    } else if (existing.isRedirect && !entry.isRedirect) {
      resultPages.set(k, entry);
    }
  };

  for (let i = 0; i < titleArray.length; i += 50) {
    const batch = titleArray.slice(i, i + 50);
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('titles', batch.join('|'));
    url.searchParams.set('prop', 'info|langlinks');
    url.searchParams.set('lllang', 'es');
    url.searchParams.set('redirects', '1');
    url.searchParams.set('format', 'json');

    const json = await fetchWikiJson(url.toString());
    const redirectsMap = new Map<string, { to: string; tofragment?: string }>();
    for (const r of json.query?.redirects || []) {
      redirectsMap.set(r.from, { to: r.to, tofragment: r.tofragment });
    }

    const pages = json.query?.pages || {};
    for (const p of Object.values(pages) as any[]) {
      if (p.missing !== undefined) continue;
      const title = p.title;
      const esTitle = p.langlinks?.[0]?.['*'] || null;
      const urlWiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

      const entry = {
        title,
        url: urlWiki,
        isRedirect: false,
        esTitle,
      };

      setEntry(title, entry);

      const match = title.match(/^List of countries by (.+?) production$/i);
      if (match) {
        const res = match[1].trim();
        setEntry(res, entry);
        setEntry(singularizeEn(res), entry);
      }
      const matchOf = title.match(/^List of countries by production of (.+)$/i);
      if (matchOf) {
        const res = matchOf[1].trim();
        setEntry(res, entry);
        setEntry(singularizeEn(res), entry);
      }
      const matchByCountry = title.match(/^(.+?)\s+production by country$/i);
      if (matchByCountry) {
        const res = matchByCountry[1].trim();
        setEntry(res, entry);
        setEntry(singularizeEn(res), entry);
      }
    }

    for (const [from, target] of redirectsMap.entries()) {
      const fragment = target.tofragment ? `#${target.tofragment}` : '';
      const finalUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(target.to.replace(/ /g, '_'))}${fragment}`;
      const entry = {
        title: from,
        url: finalUrl,
        isRedirect: true,
        target: target.to,
        fragment: target.tofragment || null,
      };

      setEntry(from, entry);

      const match = from.match(/^List of countries by (.+?) production$/i);
      if (match) {
        const res = match[1].trim();
        setEntry(res, entry);
        setEntry(singularizeEn(res), entry);
      }
    }
  }

  const obj: Record<string, any> = {};
  for (const [k, v] of resultPages.entries()) {
    obj[k] = v;
  }
  await fs.writeFile(cacheFile, JSON.stringify(obj, null, 2), 'utf8');
  console.log(` listo (${resultPages.size} entradas)`);

  return { pages: resultPages };
}

/**
 * Genera candidatos exhaustivos para cada recurso
 */
function generateCandidates(c: Commodity) {
  const esCandidates = new Set<string>();
  const enCandidates = new Set<string>();

  const cleanEs = cleanTerm(c.nameEs).toLowerCase();
  const cleanEn = cleanTerm(c.nameEn).toLowerCase();

  esCandidates.add(cleanEs);
  esCandidates.add(singularizeEs(cleanEs));
  enCandidates.add(cleanEn);
  enCandidates.add(singularizeEn(cleanEn));

  // Patrones directos en español
  esCandidates.add(`anexo:países por producción de ${cleanEs}`);
  esCandidates.add(`anexo:países por producción de ${singularizeEs(cleanEs)}`);
  esCandidates.add(`anexo:países por producción del ${cleanEs}`);
  esCandidates.add(`anexo:países por producción de la ${cleanEs}`);
  esCandidates.add(`anexo:países productores de ${cleanEs}`);
  esCandidates.add(`anexo:países productores de ${singularizeEs(cleanEs)}`);
  esCandidates.add(`anexo:producción mundial de ${cleanEs}`);
  esCandidates.add(`anexo:producción mundial de ${singularizeEs(cleanEs)}`);
  esCandidates.add(`anexo:países por población de ${cleanEs}`);

  // Patrones directos en inglés
  enCandidates.add(`list of countries by ${cleanEn} production`);
  enCandidates.add(`list of countries by ${singularizeEn(cleanEn)} production`);
  enCandidates.add(`list of countries by production of ${cleanEn}`);
  enCandidates.add(`list of countries by production of ${singularizeEn(cleanEn)}`);
  enCandidates.add(`${cleanEn} production by country`);
  enCandidates.add(`${singularizeEn(cleanEn)} production by country`);

  // Aliases
  if (c.aliases) {
    for (const a of c.aliases) {
      const ca = a.toLowerCase().trim();
      esCandidates.add(ca);
      esCandidates.add(`anexo:países por producción de ${ca}`);
      enCandidates.add(ca);
      enCandidates.add(`list of countries by ${ca} production`);
    }
  }

  // Sinónimos conocidos
  const syn = KNOWN_SYNONYMS[c.id];
  if (syn) {
    if (syn.es) {
      for (const s of syn.es) {
        esCandidates.add(s);
        esCandidates.add(`anexo:países por producción de ${s}`);
        esCandidates.add(`anexo:países productores de ${s}`);
        esCandidates.add(`anexo:países por población de ${s}`);
      }
    }
    if (syn.en) {
      for (const s of syn.en) {
        enCandidates.add(s);
        enCandidates.add(`list of countries by ${s} production`);
        enCandidates.add(`${s} by country`);
        enCandidates.add(`list of countries by ${s} population`);
      }
    }
  }

  return {
    es: Array.from(esCandidates),
    en: Array.from(enCandidates),
  };
}

/**
 * Consulta en línea por lotes si quedan candidatos pendientes
 */
async function verifyTitlesOnline(titles: string[], lang: 'es' | 'en'): Promise<Map<string, ArticleMatch>> {
  const result = new Map<string, ArticleMatch>();
  if (titles.length === 0) return result;

  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const domain = lang === 'es' ? 'es.wikipedia.org' : 'en.wikipedia.org';
    const url = new URL(`https://${domain}/w/api.php`);
    url.searchParams.set('action', 'query');
    url.searchParams.set('titles', batch.join('|'));
    url.searchParams.set('redirects', '1');
    url.searchParams.set('format', 'json');

    try {
      const json = await fetchWikiJson(url.toString());
      const redirectsMap = new Map<string, { to: string; tofragment?: string }>();
      for (const r of json.query?.redirects || []) {
        redirectsMap.set(r.from.toLowerCase(), { to: r.to, tofragment: r.tofragment });
      }

      const pages = json.query?.pages || {};
      for (const p of Object.values(pages) as any[]) {
        if (p.missing !== undefined) continue;
        const pageTitle = p.title;
        const pageUrl = `https://${domain}/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
        result.set(pageTitle.toLowerCase(), {
          exists: true,
          title: pageTitle,
          url: pageUrl,
          isRedirect: false,
          matchType: 'online_verify',
        });
      }

      for (const [from, target] of redirectsMap.entries()) {
        const fragment = target.tofragment ? `#${target.tofragment}` : '';
        const targetUrl = `https://${domain}/wiki/${encodeURIComponent(target.to.replace(/ /g, '_'))}${fragment}`;
        result.set(from.toLowerCase(), {
          exists: true,
          title: target.to,
          url: targetUrl,
          isRedirect: true,
          redirectTarget: target.to,
          fragment: target.tofragment || null,
          matchType: 'online_verify',
        });
      }
    } catch (err) {
      console.warn(`Aviso: Error verificando títulos en ${lang}:`, err);
    }
  }

  return result;
}

interface CliArgs {
  refresh: boolean;
  category?: string;
  missingOnly: boolean;
  foundOnly: boolean;
  output: string;
}

function parseCliArgs(argv: string[]): CliArgs {
  const refresh = argv.includes('--refresh');
  const missingOnly = argv.includes('--missing-only');
  const foundOnly = argv.includes('--found-only');

  const catArg = argv.find((a) => a.startsWith('--category='));
  const category = catArg ? catArg.split('=')[1] : (argv.includes('--category') ? argv[argv.indexOf('--category') + 1] : undefined);

  const outArg = argv.find((a) => a.startsWith('--out='));
  const output = outArg ? outArg.split('=')[1] : (argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : DEFAULT_OUTPUT);

  return { refresh, category, missingOnly, foundOnly, output };
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  console.log('='.repeat(78));
  console.log('  AUDITORÍA DE ARTÍCULOS DE PRODUCCIÓN EN WIKIPEDIA (ES / EN)');
  console.log('  Recursos naturales: Catálogo de producción por países (world-geopolitical-engine)');
  console.log('='.repeat(78));

  console.log(`\n1. Leyendo catálogo de recursos desde:\n   ${DATA_FILE}`);
  const rawData = await fs.readFile(DATA_FILE, 'utf8');
  const dataset: CountryResourcesData = JSON.parse(rawData);
  let commodities = dataset.commodities;

  console.log(`   ✓ Total de recursos en catálogo: ${commodities.length}`);

  if (args.category) {
    commodities = commodities.filter((c) => c.category === args.category);
    console.log(`   Filtrando por categoría "${args.category}": ${commodities.length} recursos`);
  }

  console.log('\n2. Preparando índices de Wikipedia (con caché local)');
  const esIndex = await loadSpanishWikiIndex(args.refresh);
  const enIndex = await loadEnglishWikiIndex(args.refresh);

  console.log('\n3. Cotejando los 342 recursos contra los artículos de Wikipedia...');

  const unmatchedEsTitles: string[] = [];
  const unmatchedEnTitles: string[] = [];
  const preliminaryResults: CommodityWikiResult[] = [];

  for (const c of commodities) {
    const candidates = generateCandidates(c);

    // Búsqueda en Español
    let esMatch: ArticleMatch = { exists: false, title: null, url: null, isRedirect: false };
    for (const cand of candidates.es) {
      const hit = esIndex.pages.get(cand);
      if (hit) {
        esMatch = {
          exists: true,
          title: hit.title,
          url: hit.url,
          isRedirect: hit.isRedirect || false,
          redirectTarget: hit.target,
          matchType: 'canonical',
        };
        break;
      }
    }

    // Búsqueda en Inglés
    let enMatch: ArticleMatch = { exists: false, title: null, url: null, isRedirect: false };
    for (const cand of candidates.en) {
      const hit = enIndex.pages.get(cand);
      if (hit) {
        enMatch = {
          exists: true,
          title: hit.title,
          url: hit.url,
          isRedirect: hit.isRedirect || false,
          redirectTarget: hit.target,
          fragment: hit.fragment,
          matchType: 'canonical',
        };
        break;
      }
    }

    // Langlinks cruzados si uno de los idiomas no encontró enlace directo
    if (esMatch.exists && !enMatch.exists) {
      const hit = esIndex.pages.get(esMatch.title?.toLowerCase() || '');
      if (hit?.enTitle) {
        enMatch = {
          exists: true,
          title: hit.enTitle,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.enTitle.replace(/ /g, '_'))}`,
          isRedirect: false,
          matchType: 'langlink',
        };
      }
    }

    if (enMatch.exists && !esMatch.exists) {
      const hit = enIndex.pages.get(enMatch.title?.toLowerCase() || '');
      if (hit?.esTitle) {
        esMatch = {
          exists: true,
          title: hit.esTitle,
          url: `https://es.wikipedia.org/wiki/${encodeURIComponent(hit.esTitle.replace(/ /g, '_'))}`,
          isRedirect: false,
          matchType: 'langlink',
        };
      }
    }

    if (!esMatch.exists) {
      const cleanEs = cleanTerm(c.nameEs);
      unmatchedEsTitles.push(`Anexo:Países por producción de ${cleanEs}`);
      unmatchedEsTitles.push(`Anexo:Países por producción de ${singularizeEs(cleanEs)}`);
    }
    if (!enMatch.exists) {
      const cleanEn = cleanTerm(c.nameEn);
      unmatchedEnTitles.push(`List of countries by ${cleanEn} production`);
      unmatchedEnTitles.push(`List of countries by ${singularizeEn(cleanEn)} production`);
    }

    preliminaryResults.push({
      id: c.id,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
      category: c.category,
      unit: c.unit,
      source: c.source,
      hasArticle: esMatch.exists || enMatch.exists,
      hasBoth: esMatch.exists && enMatch.exists,
      es: esMatch,
      en: enMatch,
    });
  }

  // Verificación online complementaria
  if (unmatchedEsTitles.length > 0 || unmatchedEnTitles.length > 0) {
    process.stdout.write(`  Comprobando candidatos online no indexados (${unmatchedEsTitles.length} ES, ${unmatchedEnTitles.length} EN)...`);
    const esOnlineMap = await verifyTitlesOnline([...new Set(unmatchedEsTitles)], 'es');
    const enOnlineMap = await verifyTitlesOnline([...new Set(unmatchedEnTitles)], 'en');

    for (const res of preliminaryResults) {
      if (!res.es.exists) {
        const cleanEs = cleanTerm(res.nameEs).toLowerCase();
        const cand1 = `anexo:países por producción de ${cleanEs}`;
        const cand2 = `anexo:países por producción de ${singularizeEs(cleanEs)}`;
        const hit = esOnlineMap.get(cand1) || esOnlineMap.get(cand2);
        if (hit) {
          res.es = hit;
        }
      }
      if (!res.en.exists) {
        const cleanEn = cleanTerm(res.nameEn).toLowerCase();
        const cand1 = `list of countries by ${cleanEn} production`;
        const cand2 = `list of countries by ${singularizeEn(cleanEn)} production`;
        const hit = enOnlineMap.get(cand1) || enOnlineMap.get(cand2);
        if (hit) {
          res.en = hit;
        }
      }
      res.hasArticle = res.es.exists || res.en.exists;
      res.hasBoth = res.es.exists && res.en.exists;
    }
    console.log(' listo');
  }

  // Estadísticas globales y por categoría
  const statsByCategory: Record<
    string,
    { total: number; withEs: number; withEn: number; withEither: number; withBoth: number; missing: number }
  > = {};

  let totalWithEs = 0;
  let totalWithEn = 0;
  let totalWithEither = 0;
  let totalWithBoth = 0;
  let totalMissing = 0;

  for (const r of preliminaryResults) {
    if (!statsByCategory[r.category]) {
      statsByCategory[r.category] = { total: 0, withEs: 0, withEn: 0, withEither: 0, withBoth: 0, missing: 0 };
    }
    const cat = statsByCategory[r.category];
    cat.total++;

    if (r.es.exists) {
      cat.withEs++;
      totalWithEs++;
    }
    if (r.en.exists) {
      cat.withEn++;
      totalWithEn++;
    }
    if (r.hasArticle) {
      cat.withEither++;
      totalWithEither++;
    } else {
      cat.missing++;
      totalMissing++;
    }
    if (r.hasBoth) {
      cat.withBoth++;
      totalWithBoth++;
    }
  }

  // Reporte en terminal
  console.log('\n' + '='.repeat(78));
  console.log('  RESUMEN EJECUTIVO DE COBERTURA');
  console.log('='.repeat(78));
  console.log(`Total de recursos analizados: ${commodities.length}`);
  console.log(`  ✓ Con artículo en Wikipedia (ES o EN): ${totalWithEither} (${((totalWithEither / commodities.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Con artículo en español:              ${totalWithEs} (${((totalWithEs / commodities.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Con artículo en inglés:               ${totalWithEn} (${((totalWithEn / commodities.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Con artículo en ambos idiomas:        ${totalWithBoth} (${((totalWithBoth / commodities.length) * 100).toFixed(1)}%)`);
  console.log(`  ✗ Sin artículo de producción conocido:  ${totalMissing} (${((totalMissing / commodities.length) * 100).toFixed(1)}%)`);

  console.log('\n' + '-'.repeat(78));
  console.log(
    'Categoría'.padEnd(16) +
    'Total'.padStart(7) +
    'En ES'.padStart(9) +
    'En EN'.padStart(9) +
    'En Alguno'.padStart(12) +
    'Ambos'.padStart(8) +
    'Sin Art.'.padStart(11)
  );
  console.log('-'.repeat(78));

  for (const [catName, c] of Object.entries(statsByCategory)) {
    console.log(
      catName.padEnd(16) +
      String(c.total).padStart(7) +
      String(c.withEs).padStart(9) +
      String(c.withEn).padStart(9) +
      String(c.withEither).padStart(12) +
      String(c.withBoth).padStart(8) +
      String(c.missing).padStart(11)
    );
  }
  console.log('-'.repeat(78));

  // Muestra de recursos encontrados
  if (!args.missingOnly) {
    console.log('\n' + '='.repeat(78));
    console.log('  RECURSOS CON ARTÍCULO ENCONTRADO EN WIKIPEDIA (Muestra)');
    console.log('='.repeat(78));

    const matched = preliminaryResults.filter((r) => r.hasArticle);
    const sample = matched.slice(0, 30);

    for (const r of sample) {
      const tag = r.hasBoth ? '[ES+EN]' : r.es.exists ? '[ES]   ' : '[EN]   ';
      console.log(`\n${tag} ${r.nameEs} (${r.nameEn}) [${r.category}]`);
      if (r.es.exists) {
        const redir = r.es.isRedirect ? ` (redirección a ${r.es.redirectTarget})` : '';
        console.log(`       ES: ${r.es.url}${redir}`);
      }
      if (r.en.exists) {
        const redir = r.en.isRedirect ? ` (redirección a ${r.en.redirectTarget}${r.en.fragment ? '#' + r.en.fragment : ''})` : '';
        console.log(`       EN: ${r.en.url}${redir}`);
      }
    }

    if (matched.length > 30) {
      console.log(`\n... y ${matched.length - 30} recursos más con artículo disponibles en el archivo JSON.`);
    }
  }

  // Recursos faltantes agrupados
  if (!args.foundOnly) {
    console.log('\n' + '='.repeat(78));
    console.log('  RECURSOS SIN ARTÍCULO DE PRODUCCIÓN ESPECÍFICO EN WIKIPEDIA');
    console.log('='.repeat(78));

    const missing = preliminaryResults.filter((r) => !r.hasArticle);
    const missingByCat: Record<string, string[]> = {};
    for (const m of missing) {
      if (!missingByCat[m.category]) missingByCat[m.category] = [];
      missingByCat[m.category].push(`${m.nameEs} (${m.nameEn})`);
    }

    for (const [cat, items] of Object.entries(missingByCat)) {
      console.log(`\n• ${cat.toUpperCase()} (${items.length} sin artículo):`);
      for (let i = 0; i < items.length; i += 3) {
        const chunk = items.slice(i, i + 3).join(' | ');
        console.log(`    ${chunk}`);
      }
    }
  }

  // Guardar archivo JSON con los resultados detallados
  const outputData = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalCommodities: commodities.length,
      coverage: {
        totalWithArticle: totalWithEither,
        totalWithEs,
        totalWithEn,
        totalWithBoth,
        totalMissing,
        percentCoverage: Number(((totalWithEither / commodities.length) * 100).toFixed(2)),
      },
      statsByCategory,
    },
    results: preliminaryResults,
  };

  await fs.writeFile(args.output, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`\n✓ Resultados completos guardados en:\n  ${args.output}`);

  // Actualizar automáticamente country-resources.json para el mapa y la vista mundial
  if (!args.category) {
    try {
      const resRaw = await fs.readFile(DATA_FILE, 'utf8');
      const resData = JSON.parse(resRaw);
      const wikiMap = new Map<string, any>();
      for (const r of preliminaryResults) {
        if (!r.hasArticle) continue;
        const entry: Record<string, any> = {};
        if (r.es.exists && r.es.url && r.es.title) {
          entry.es = { title: r.es.title, url: r.es.url, isRedirect: r.es.isRedirect };
        }
        if (r.en.exists && r.en.url && r.en.title) {
          entry.en = { title: r.en.title, url: r.en.url, isRedirect: r.en.isRedirect };
        }
        if (entry.es || entry.en) wikiMap.set(r.id, entry);
      }
      for (const c of resData.commodities || []) {
        const w = wikiMap.get(c.id);
        if (w) c.wikipedia = w; else delete c.wikipedia;
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(resData, null, 2), 'utf8');
      console.log(`✓ Enlaces integrados directamente en el catálogo del mapa:\n  ${DATA_FILE}\n`);
    } catch (err) {
      console.warn('Aviso: no se pudo actualizar country-resources.json automáticamente:', err);
    }
  }
}

main().catch((err) => {
  console.error('\nError en check-wikipedia-resources:', err);
  process.exit(1);
});
