/**
 * components/dev/geopolitical-monitor/hooks/monitor/useMonitorMaritime.ts
 *
 * State and simulation logic for maritime trade routes and chokepoints.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThematicLayer } from '../../types';
import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  MaritimeSimulationResult,
  MaritimeChokepointService,
} from '@/lib/services/maritime-chokepoint-service';

export function useMonitorMaritime(
  activeLayer: ThematicLayer,
  setActiveLayer: (layer: ThematicLayer) => void,
  defaultLayer: ThematicLayer = 'none'
) {
  const [showMaritimeRoutes, setShowMaritimeRoutes] = useState<boolean>(
    defaultLayer === 'maritime'
  );
  const [blockedChokepoints, setBlockedChokepoints] = useState<MaritimeChokepointId[]>([]);
  const [selectedSector, setSelectedSector] = useState<MaritimeIndustrySector>('AUTOMOTIVE_PARTS');
  const [sensitivityMultiplier, setSensitivityMultiplier] = useState<number>(1.0);
  const [isChokepointDrawerOpen, setIsChokepointDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (activeLayer === 'maritime') {
      setShowMaritimeRoutes(true);
    }
  }, [activeLayer]);

  const toggleMaritimeRoutes = useCallback(() => {
    setShowMaritimeRoutes((prev) => {
      const next = !prev;
      if (!next && activeLayer === 'maritime') {
        setActiveLayer('none');
      }
      return next;
    });
  }, [activeLayer, setActiveLayer]);

  const toggleChokepoint = useCallback((id: MaritimeChokepointId) => {
    setBlockedChokepoints((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const openChokepointDrawer = useCallback(() => setIsChokepointDrawerOpen(true), []);
  const closeChokepointDrawer = useCallback(() => setIsChokepointDrawerOpen(false), []);

  const simulationResult = useMemo<MaritimeSimulationResult>(() => {
    return MaritimeChokepointService.simulateChokepointBlockades({
      blockedChokepoints,
      sector: selectedSector,
      sensitivityMultiplier,
    });
  }, [blockedChokepoints, selectedSector, sensitivityMultiplier]);

  return {
    showMaritimeRoutes,
    setShowMaritimeRoutes,
    blockedChokepoints,
    setBlockedChokepoints,
    selectedSector,
    setSelectedSector,
    sensitivityMultiplier,
    setSensitivityMultiplier,
    isChokepointDrawerOpen,
    setIsChokepointDrawerOpen,
    toggleMaritimeRoutes,
    toggleChokepoint,
    openChokepointDrawer,
    closeChokepointDrawer,
    simulationResult,
  };
}
