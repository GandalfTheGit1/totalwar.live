/**
 * top-bar/domains.ts
 *
 * Registry: one entry per top-bar button, with the map scene it activates.
 * Adding a domain = adding an object here, a cell in metrics and a panel.
 */

import {
  Anchor, Cpu, Fuel, Gem, Globe, Handshake, Siren, Swords, TrendingUp,
} from 'lucide-react';
import type { DomainDef, TopBarDomain } from './types';

export const DOMAINS: DomainDef[] = [
  { key: 'military', group: 'country', title: 'Ranking militar', icon: Swords,
    scene: { mode: 'risk', layer: 'military', maritime: false } },
  { key: 'stability', group: 'country', title: 'Estabilidad interna', icon: Siren,
    scene: { mode: 'risk', layer: 'stability', maritime: false } },
  { key: 'tech', group: 'country', title: 'Desarrollo tecnológico', icon: Cpu,
    scene: { mode: 'risk', layer: 'footprint', maritime: false } },
  { key: 'debt', group: 'country', title: 'Deuda y tipos', icon: TrendingUp,
    scene: { mode: 'risk', layer: 'none', maritime: false } },
  { key: 'relations', group: 'bilateral', title: 'Aliados, aranceles y sanciones', icon: Handshake,
    scene: { mode: 'relations', layer: 'none', maritime: false } },
  { key: 'resources', group: 'flows', title: 'Recursos naturales', icon: Gem,
    scene: { mode: 'risk', layer: 'resources', maritime: false } },
  { key: 'ports', group: 'flows', title: 'Puertos y estrechos', icon: Anchor,
    scene: { mode: 'risk', layer: 'maritime', maritime: true } },
  { key: 'energy', group: 'flows', title: 'Energía', icon: Fuel,
    scene: { mode: 'risk', layer: 'maritime', maritime: true } },
  { key: 'tension', group: 'global', title: 'Tensión mundial', icon: Globe,
    scene: { mode: 'news', layer: 'none', maritime: false } },
];

export const GROUP_LABEL: Record<DomainDef['group'], string> = {
  country: 'Estado del país',
  bilateral: 'Entre países',
  flows: 'Recursos y flujos',
  global: 'Global',
};

export function getDomain(key: TopBarDomain): DomainDef {
  return DOMAINS.find((d) => d.key === key)!;
}
