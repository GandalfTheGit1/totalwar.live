export function extractGeoSegments(concept: any): { segments: Record<string, number>; total: number; geoCount: number } {
  const result: Record<string, number> = {};
  let total = 0;
  if (!concept?.units?.USD) return { segments: result, total: 0, geoCount: 0 };

  const allFacts = concept.units.USD;
  const recentFacts = allFacts.filter((f: any) => (f.form === '10-K' || f.form === '20-F') && f.fp === 'FY');
  recentFacts.sort((a: any, b: any) => new Date(b.end).getTime() - new Date(a.end).getTime());

  if (recentFacts.length > 0) {
    const latestFy = recentFacts[0].fy;
    const latestFacts = recentFacts.filter((f: any) => f.fy === latestFy);

    latestFacts.forEach((f: any) => {
      if (f.segment && f.segment.dimension === 'srt:StatementGeographicalAxis') {
        const segmentName = f.segment.value.split(':').pop() || 'Unknown';
        const cleanName = segmentName.replace('Member', '').replace(/([A-Z])/g, ' $1').trim();
        if (!result[cleanName] || f.val > result[cleanName]) {
          result[cleanName] = f.val;
        }
      } else if (!f.segment) {
        if (f.val > total) {
          total = f.val;
        }
      }
    });
  }
  return { segments: result, total, geoCount: Object.keys(result).length };
}

export function processAssetsConcept(concept: any, segments: Record<string, number>) {
  if (!concept?.units?.USD) {
    console.log(`[Geographic Route] Concepto de activos LongLivedAssets no disponible.`);
    return segments;
  }
  console.log(`[Geographic Route] Procesando concepto de activos: ${concept.label || 'LongLivedAssets'}`);
  const allFacts = concept.units.USD;
  const recentFacts = allFacts.filter((f: any) => (f.form === '10-K' || f.form === '20-F') && f.fp === 'FY');
  recentFacts.sort((a: any, b: any) => new Date(b.end).getTime() - new Date(a.end).getTime());
  if (recentFacts.length > 0) {
    const latestFy = recentFacts[0].fy;
    const latestFacts = recentFacts.filter((f: any) => f.fy === latestFy);
    console.log(`[Geographic Route] Encontrados ${latestFacts.length} registros de activos para el año fiscal ${latestFy}`);
    latestFacts.forEach((f: any) => {
      if (f.segment && f.segment.dimension === 'srt:StatementGeographicalAxis') {
        const segmentName = f.segment.value.split(':').pop() || 'Unknown';
        const cleanName = segmentName.replace('Member', '').replace(/([A-Z])/g, ' $1').trim();
        // Only add asset-based segments if we don't already have them from revenue
        if (!segments[cleanName]) {
          segments[cleanName] = f.val;
          console.log(`[Geographic Route] Segmento de activos agregado: ${cleanName} = ${f.val}`);
        }
      }
    });
  }
  return segments;
}

export function getFallbackSegmentsForApple(ticker: string, segments: Record<string, number>): Record<string, number> {
  if (Object.keys(segments).length === 0 && ticker === 'AAPL') {
    console.log(`[Geographic Route] Aplicando fallback estático para Apple (AAPL) al no encontrarse segmentos estructurados en XBRL`);
    return {
      'Americas': 161600000000,
      'Europe': 94300000000,
      'Greater China': 72560000000,
      'Japan': 24260000000,
      'Rest of Asia Pacific': 29610000000
    };
  }
  return segments;
}
