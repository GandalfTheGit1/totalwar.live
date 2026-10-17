import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  MaritimeSimulationResult,
} from '@/lib/services/maritime-chokepoint-service';

export interface ChokepointSimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blockedChokepoints: MaritimeChokepointId[];
  onToggleChokepoint: (id: MaritimeChokepointId) => void;
  onSetBlockedChokepoints: (list: MaritimeChokepointId[]) => void;
  selectedSector: MaritimeIndustrySector;
  onSelectSector: (sector: MaritimeIndustrySector) => void;
  sensitivityMultiplier: number;
  onChangeSensitivity: (val: number) => void;
  simulationResult: MaritimeSimulationResult;
}

export interface JitBadgeConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getJitBadgeConfig(jitStarvationRisk: string): JitBadgeConfig {
  switch (jitStarvationRisk) {
    case 'CRITICAL':
      return {
        label: 'CRÍTICO: PARADA FABRIL',
        badgeClass: 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse',
        dotClass: 'bg-rose-500',
      };
    case 'HIGH':
      return {
        label: 'ELEVADO: RIESGO DE ROTURA',
        badgeClass: 'bg-orange-500/20 border-orange-500 text-orange-300',
        dotClass: 'bg-orange-400',
      };
    case 'MODERATE':
      return {
        label: 'MODERADO: BUFFER EN RIESGO',
        badgeClass: 'bg-amber-500/20 border-amber-500 text-amber-300',
        dotClass: 'bg-amber-400',
      };
    default:
      return {
        label: 'BAJO: FLUJO NOMINAL',
        badgeClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
        dotClass: 'bg-emerald-400',
      };
  }
}
