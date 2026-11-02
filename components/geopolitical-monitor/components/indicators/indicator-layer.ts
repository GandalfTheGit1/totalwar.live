/**
 * Capa temática del mapa para un indicador de Trading Economics: colorea cada país por cuartil.
 */

import type { TeIndicatorValues } from '@/lib/trading-economics/country-list';
import { ThematicLayerCountryData, ThematicLayerMap } from '../../types';
import { registerCountry } from '../../utils/thematic/country-registry';

// shortcut: cuartiles con la paleta de riesgo (rojo = valores más altos) aunque en algunos indicadores alto sea bueno (PIB, reservas); usar paleta secuencial neutra cuando la capa pase de prueba.
const TIERS: ThematicLayerCountryData['colorCategory'][] = ['low', 'medium', 'high', 'critical'];

const fmt = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

export function buildIndicatorLayerMap(data: TeIndicatorValues): ThematicLayerMap {
  const ranked = Object.entries(data.countries)
    .filter((entry): entry is [string, typeof entry[1] & { value: number }] => entry[1].value !== null)
    .sort((a, b) => b[1].value - a[1].value);
  const map: ThematicLayerMap = {};
  ranked.forEach(([iso3, c], i) => {
    const percentile = ranked.length > 1 ? 1 - i / (ranked.length - 1) : 1;
    const unit = c.unit ? ` ${c.unit}` : '';
    registerCountry(map, iso3, {
      intensity: percentile * 100,
      label: `${data.name}: ${fmt(c.value)}${unit}${c.reference ? ` (${c.reference})` : ''}`,
      sublabel: `Puesto ${i + 1} de ${ranked.length}${c.previous !== null ? ` · anterior ${fmt(c.previous)}${unit}` : ''}`,
      colorCategory: TIERS[Math.min(3, Math.floor(percentile * 4))],
    });
  });
  return map;
}
