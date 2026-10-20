/**
 * Estilos compartidos por el panel de recursos del país y el buscador de recursos.
 */

import { Atom, Droplets, Factory, Fish, Gem, Leaf, PawPrint, Trees, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ShareTier } from '@/lib/services/country-resources/query';
import { CommodityStats, ResourceCategory, ResourceSourceId } from '@/lib/services/country-resources/types';

export const TIER_STYLES: Record<ShareTier, { label: string; badge: string; dot: string }> = {
  critical: { label: 'Crítico', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40', dot: 'bg-rose-500' },
  high: { label: 'Alto', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/40', dot: 'bg-orange-500' },
  medium: { label: 'Medio', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40', dot: 'bg-amber-400' },
  low: { label: 'Bajo', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
};

export const CATEGORY_ICONS: Record<ResourceCategory, LucideIcon> = {
  energy: Droplets,
  metals: Factory,
  minerals: Gem,
  electricity: Zap,
  agriculture: Leaf,
  livestock: PawPrint,
  fisheries: Fish,
  forestry: Trees,
};

export const CATEGORY_SHORT: Record<ResourceCategory, string> = {
  energy: 'Energía',
  metals: 'Metales',
  minerals: 'Minerales',
  electricity: 'Electricidad',
  agriculture: 'Agricultura',
  livestock: 'Ganadería',
  fisheries: 'Pesca',
  forestry: 'Forestal',
};

export const FALLBACK_ICON: LucideIcon = Atom;

export const SOURCE_SHORT: Record<ResourceSourceId, string> = {
  wmd: 'World Mining Data',
  'faostat-qcl': 'FAOSTAT',
  'faostat-fo': 'FAOSTAT',
  fishstat: 'FAO FishStat',
  ember: 'Ember',
  eurostat: 'Eurostat',
};

/** Un dato es antiguo si tiene más de un año de retraso respecto al último publicado del recurso. */
export function isStaleYear(year: number, commodity: Pick<CommodityStats, 'latestYear'>): boolean {
  return commodity.latestYear !== null && year < commodity.latestYear - 1;
}
