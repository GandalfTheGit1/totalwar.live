/**
 * components/dev/geopolitical-monitor/hooks/monitor/types.ts
 *
 * Types and options for useGeopoliticalMonitor hook.
 */

import { ThematicLayer } from '../../types';
import { CriticalCommodityKey } from '@/lib/services/geographic/friendshoring-service';

export interface UseGeopoliticalMonitorOptions {
  /**
   * Modo inicial de visualización (2D Mercator o 3D Globe).
   * @default true
   */
  default2D?: boolean;
  /**
   * Capa temática inicial.
   * @default 'none'
   */
  defaultLayer?: ThematicLayer;
  /**
   * Filtro inicial por ticker para la capa de huella corporativa.
   * @default 'ALL'
   */
  initialFootprintTicker?: string;
  /**
   * Materia prima crítica seleccionada inicialmente para Friendshoring (T03.4).
   * @default 'rare-earths'
   */
  initialCommodity?: CriticalCommodityKey;
}
