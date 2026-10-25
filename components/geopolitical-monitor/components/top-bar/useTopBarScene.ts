'use client';

/**
 * top-bar/useTopBarScene.ts
 *
 * Opening a domain applies its map scene (mode, thematic layer, maritime routes);
 * closing it restores what the user had before the first domain was opened.
 */

import { useCallback, useRef, useState } from 'react';
import type { ThematicLayer } from '../../types';
import type { MapMode } from '../MapModeSelector';
import { getDomain } from './domains';
import type { TopBarDomain } from './types';

export interface SceneControls {
  activeMode: MapMode;
  handleModeChange: (mode: MapMode) => void;
  activeLayer: ThematicLayer;
  handleLayerChange: (layer: ThematicLayer) => void;
  showMaritimeRoutes: boolean;
  setShowMaritimeRoutes: (v: boolean) => void;
}

interface Snapshot {
  mode: MapMode;
  layer: ThematicLayer;
  maritime: boolean;
}

export function useTopBarScene(c: SceneControls) {
  const [activeDomain, setActiveDomain] = useState<TopBarDomain | null>(null);
  const snapshot = useRef<Snapshot | null>(null);

  const openDomain = useCallback(
    (key: TopBarDomain | null) => {
      if (key === null || key === activeDomain) {
        const s = snapshot.current;
        if (s) {
          c.handleModeChange(s.mode);
          c.handleLayerChange(s.layer);
          c.setShowMaritimeRoutes(s.maritime);
        }
        snapshot.current = null;
        setActiveDomain(null);
        return;
      }
      if (!snapshot.current) {
        snapshot.current = { mode: c.activeMode, layer: c.activeLayer, maritime: c.showMaritimeRoutes };
      }
      const { scene } = getDomain(key);
      c.handleModeChange(scene.mode);
      c.handleLayerChange(scene.layer);
      c.setShowMaritimeRoutes(scene.maritime);
      setActiveDomain(key);
    },
    [activeDomain, c]
  );

  return { activeDomain, openDomain };
}
