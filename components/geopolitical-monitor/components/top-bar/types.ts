/**
 * top-bar/types.ts
 *
 * Shared types for the top information bar: domains (one per button),
 * cell values, and the context handed to every drawer panel.
 */

import type { LucideIcon } from 'lucide-react';
import type { CountrySovereignPowerProfile } from '@/lib/types/sovereign-power';
import type {
  CountryMacroData,
  CriticalCommodityKey,
  MaritimeChokepointId,
  MaritimeSimulationResult,
  ThematicLayer,
} from '../../types';
import type { MapMode } from '../MapModeSelector';
import type { WorldTensionData } from '../../hooks/useHoi4Mechanics';

export type TopBarDomain =
  | 'military' | 'stability' | 'tech' | 'debt'
  | 'relations'
  | 'resources' | 'ports' | 'energy'
  | 'tension';

export type CellDomain = Exclude<TopBarDomain, 'tension'>;

export type Level = 'ok' | 'warn' | 'bad' | 'neutral' | 'na';

export interface CellValue {
  text: string;
  level: Level;
}

export type TopBarCells = Record<CellDomain, CellValue>;

export interface DomainScene {
  mode: MapMode;
  layer: ThematicLayer;
  maritime: boolean;
}

export interface DomainDef {
  key: TopBarDomain;
  group: 'country' | 'bilateral' | 'flows' | 'global';
  title: string;
  icon: LucideIcon;
  scene: DomainScene;
}

export interface TopBarContext {
  iso2: string | null;
  countryName: string | null;
  profile: CountrySovereignPowerProfile | null;
  macro: CountryMacroData | null;
  isMacroLoading: boolean;
  blockedChokepoints: MaritimeChokepointId[];
  toggleChokepoint: (id: MaritimeChokepointId) => void;
  simulationResult: MaritimeSimulationResult;
  selectedCommodity: CriticalCommodityKey | null;
  setSelectedCommodity: (key: CriticalCommodityKey) => void;
  worldTension: WorldTensionData | null;
  defcon: number;
}
