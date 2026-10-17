/**
 * Heuristic regex to locate and extract the "Item 2. Properties" text section from raw 10-K text/HTML.
 */
export function extractItem2PropertiesText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let clean = rawText.replace(/\r\n/g, '\n');

  // Strip HTML tags and decode basic entities if raw HTML is detected
  if (/<[a-z][\s\S]*>/i.test(clean)) {
    clean = clean
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/[ \t]{2,}/g, ' ');
  }

  // Common patterns in SEC 10-K filings:
  // "Item 2. Properties" followed by content up to "Item 3. Legal Proceedings"
  const startRegex = /(?:item\s*2[.:\s-]+(?:properties|propiedades))/i;
  const endRegex = /(?:item\s*3[.:\s-]+(?:legal\s+proceedings|procedimientos|mine\s+safety)|item\s*4[.:\s-]+)/i;

  const startMatch = clean.match(startRegex);
  if (!startMatch || startMatch.index === undefined) {
    const fallbackStart = clean.match(/\bitem\s*2\b/i);
    if (!fallbackStart || fallbackStart.index === undefined) return '';
    const sliceFromStart = clean.slice(fallbackStart.index);
    const endMatch = sliceFromStart.match(endRegex);
    if (endMatch && endMatch.index !== undefined && endMatch.index > 200) {
      return sliceFromStart.slice(0, endMatch.index).trim();
    }
    return sliceFromStart.slice(0, 40000).trim();
  }

  const slice = clean.slice(startMatch.index);
  const endMatch = slice.match(endRegex);
  if (endMatch && endMatch.index !== undefined && endMatch.index > 200) {
    return slice.slice(0, endMatch.index).trim();
  }

  return slice.slice(0, 40000).trim();
}
