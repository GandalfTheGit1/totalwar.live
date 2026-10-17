/**
 * lib/macro/rss-parser.ts
 *
 * Lightweight XML RSS Parser to fetch and parse Google News and Central Bank RSS feeds.
 * Avoids dependencies by parsing standard RSS XML format using robust regular expressions.
 */

export interface ParsedRssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

/**
 * Clean HTML entities and tags from strings
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') // CDATA sections
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a single tag's content from a block of XML
 */
function extractTagContent(xmlBlock: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xmlBlock.match(regex);
  return match ? match[1] : '';
}

/**
 * Parses an RSS XML feed string into structured items
 */
export function parseRssFeed(xmlText: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  
  // Find all <item>...</item> blocks
  const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
  if (!itemMatches) return [];

  for (const itemXml of itemMatches) {
    const title = extractTagContent(itemXml, 'title');
    const link = extractTagContent(itemXml, 'link');
    const pubDate = extractTagContent(itemXml, 'pubDate');
    const description = extractTagContent(itemXml, 'description');
    
    // Extract source name if present, e.g. <source url="...">Source Name</source>
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const source = sourceMatch ? sourceMatch[1] : '';

    items.push({
      title: cleanText(title),
      link: cleanText(link),
      pubDate: cleanText(pubDate),
      description: cleanText(description),
      source: cleanText(source) || 'Google News',
    });
  }

  return items;
}

/**
 * Fetches and parses a Google News RSS feed for a specific search query
 */
export async function fetchGoogleNewsRss(query: string, lang = 'es', country = 'ES'): Promise<ParsedRssItem[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=${lang}&gl=${country}`;
    
    const headers = {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    };

    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      console.warn(`[GoogleNewsRSS] Failed to fetch feed for query "${query}": ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    return parseRssFeed(xmlText);
  } catch (err) {
    console.error(`[GoogleNewsRSS] Error fetching feed:`, err);
    return [];
  }
}
