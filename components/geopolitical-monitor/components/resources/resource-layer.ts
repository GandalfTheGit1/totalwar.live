/**
 * Capa temática del mapa para un recurso buscado: colorea a cada productor por su peso mundial.
 */

import { formatQuantity, formatShare } from '@/lib/services/country-resources/format';
import { ProducerEntry, shareTier } from '@/lib/services/country-resources/query';
import { CommodityStats } from '@/lib/services/country-resources/types';
import { ThematicLayerMap } from '../../types';
import { registerCountry } from '../../utils/thematic/country-registry';

export function buildResourceLayerMap(commodity: CommodityStats, producers: ProducerEntry[]): ThematicLayerMap {
  const map: ThematicLayerMap = {};
  for (const p of producers) {
    // Escala raíz cuadrada: con cuotas muy desiguales, la lineal deja a casi todos en 0.
    const intensity = p.s === null ? 0 : Math.sqrt(p.s) * 100;
    registerCountry(map, p.iso2, {
      intensity,
      label: `${commodity.nameEs}: ${formatQuantity(p.v, commodity.unit)} (${p.y})`,
      sublabel: `${formatShare(p.s)} de la producción mundial · puesto ${p.r} de ${producers.length}`,
      colorCategory: shareTier(p.s),
    });
  }
  return map;
}
