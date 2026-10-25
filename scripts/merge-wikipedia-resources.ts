/**
 * scripts/merge-wikipedia-resources.ts
 *
 * Fusiona los enlaces y metadatos de Wikipedia descubiertos por check-wikipedia-resources.ts
 * dentro del catálogo de recursos de lib/data/country-resources.json.
 *
 * De este modo, los componentes del mapa y la vista mundial (ResourceProducersPanel,
 * CountryResourcesSection, ResourceSearchBar) pueden mostrar directamente los enlaces
 * a los anexos de Wikipedia (como "Anexo:Países por producción de uranio").
 */

import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const WIKI_FILE = path.join(ROOT, 'lib', 'data', 'wikipedia-production-articles.json');
const RESOURCES_FILE = path.join(ROOT, 'lib', 'data', 'country-resources.json');

interface WikiMatch {
  id: string;
  nameEs: string;
  nameEn: string;
  category: string;
  hasArticle: boolean;
  es: {
    exists: boolean;
    title: string | null;
    url: string | null;
    isRedirect: boolean;
  };
  en: {
    exists: boolean;
    title: string | null;
    url: string | null;
    isRedirect: boolean;
  };
}

export async function mergeWikipediaData() {
  console.log('Fusionando enlaces de Wikipedia en country-resources.json...');

  const wikiRaw = await fs.readFile(WIKI_FILE, 'utf8');
  const wikiData = JSON.parse(wikiRaw);
  const wikiResults: WikiMatch[] = wikiData.results || [];

  const wikiMap = new Map<string, { es?: any; en?: any }>();
  for (const r of wikiResults) {
    if (!r.hasArticle) continue;
    const entry: { es?: any; en?: any } = {};
    if (r.es.exists && r.es.url && r.es.title) {
      entry.es = {
        title: r.es.title,
        url: r.es.url,
        isRedirect: r.es.isRedirect,
      };
    }
    if (r.en.exists && r.en.url && r.en.title) {
      entry.en = {
        title: r.en.title,
        url: r.en.url,
        isRedirect: r.en.isRedirect,
      };
    }
    if (entry.es || entry.en) {
      wikiMap.set(r.id, entry);
    }
  }

  const resRaw = await fs.readFile(RESOURCES_FILE, 'utf8');
  const resourcesData = JSON.parse(resRaw);

  let mergedCount = 0;
  for (const c of resourcesData.commodities || []) {
    const wiki = wikiMap.get(c.id);
    if (wiki) {
      c.wikipedia = wiki;
      mergedCount++;
    } else {
      delete c.wikipedia;
    }
  }

  await fs.writeFile(RESOURCES_FILE, JSON.stringify(resourcesData, null, 2), 'utf8');
  console.log(`✓ Fusionados ${mergedCount} recursos con artículos de Wikipedia en ${RESOURCES_FILE}`);
}

if (require.main === module || process.argv[1]?.endsWith('merge-wikipedia-resources.ts')) {
  mergeWikipediaData().catch((err) => {
    console.error('Error fusionando Wikipedia en recursos:', err);
    process.exit(1);
  });
}
