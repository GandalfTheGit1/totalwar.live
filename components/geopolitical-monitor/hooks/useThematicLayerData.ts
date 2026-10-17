/**
 * @file useThematicLayerData.ts
 * @description Focused React hook for T03.2 Thematic Layers data consumption (<40 lines).
 */

'use client';

import { useMemo } from 'react';
import { ThematicLayer, ThematicLayerMap } from '../types';
import { getThematicLayerData, CorporateFootprintConfig } from '../utils/thematic-generators';

export * from '../utils/thematic-generators';

/**
 * Hook providing memoized country-level thematic layer data for the Geopolitical Monitor.
 */
export function useThematicLayerData(
  activeLayer: ThematicLayer,
  footprintConfig?: CorporateFootprintConfig
): ThematicLayerMap {
  return useMemo(() => getThematicLayerData(activeLayer, footprintConfig), [activeLayer, footprintConfig]);
}
