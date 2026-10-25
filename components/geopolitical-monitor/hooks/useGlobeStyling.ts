import { useCallback, useMemo } from 'react';
import { GeoFeature, ActiveRelationsMap, CountryMockDataMap, ThematicLayer, ThematicLayerMap } from '../types';
import { MapMode } from '../components/MapModeSelector';
import { resolveThematicCountryData } from './useThematicLayerData';
import {
  FriendshoringService,
  type CriticalCommodityKey,
  type SubstitutionArc,
} from '@/lib/services/geographic/friendshoring-service';
import {
  GLOBAL_MARITIME_ROUTES,
  type MaritimeChokepointId,
} from '@/lib/services/maritime-chokepoint-service';

export function useGlobeStyling(
  selectedCountry: GeoFeature | null,
  hoveredCountry: GeoFeature | null,
  activeMode: MapMode,
  activeRelations: ActiveRelationsMap,
  countryMockData: CountryMockDataMap,
  activeLayer: ThematicLayer = 'none',
  layerData: ThematicLayerMap = {},
  selectedCommodity?: CriticalCommodityKey | null,
  substitutionArcs?: SubstitutionArc[],
  showMaritimeRoutes: boolean = false,
  blockedChokepoints: MaritimeChokepointId[] = []
) {
  const getPolygonColor = useCallback(
    (feat: any) => {
      if (!feat) return 'rgba(15, 23, 42, 0.1)';
      const polyId = feat.polyId || feat.id || feat.properties?.ISO_A3 || feat.properties?.ADM0_A3;
      if (!polyId && !feat.properties) return 'rgba(15, 23, 42, 0.1)';

      const isSelected = !!(selectedCountry && ((feat.polyId && feat.polyId === selectedCountry.polyId) || (polyId && polyId === (selectedCountry.polyId || (selectedCountry as any).id))));
      const isHovered = !!(hoveredCountry && ((feat.polyId && feat.polyId === hoveredCountry.polyId) || (polyId && polyId === (hoveredCountry.polyId || (hoveredCountry as any).id))));

      // ─── Modo Riesgo con Capa Temática Activa (T03.2 Ronda 3) ───
      if (activeMode === 'risk' && activeLayer !== 'none') {
        const item = resolveThematicCountryData(feat, layerData, countryMockData);
        if (item) {
          // En hover o selected sobre país con capa activa, mantener tinte temático intensificado
          if (isSelected || isHovered) {
            switch (item.colorCategory) {
              case 'critical':
                return 'rgba(239, 68, 68, 0.85)';
              case 'high':
                return 'rgba(249, 115, 22, 0.8)';
              case 'medium':
                return 'rgba(234, 179, 8, 0.75)';
              case 'low':
                return 'rgba(34, 197, 94, 0.65)';
              default:
                return isSelected ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.45)';
            }
          }

          // Tinte temático base
          switch (item.colorCategory) {
            case 'critical':
              return 'rgba(239, 68, 68, 0.7)';
            case 'high':
              return 'rgba(249, 115, 22, 0.6)';
            case 'medium':
              return 'rgba(234, 179, 8, 0.5)';
            case 'low':
              return 'rgba(34, 197, 94, 0.4)';
            default:
              return 'rgba(15, 23, 42, 0.25)';
          }
        }

        // Si NO está en layerData (países sin afectación directa en esa capa temática)
        if (isSelected) {
          return 'rgba(56, 189, 248, 0.75)';
        }
        if (isHovered) {
          return 'rgba(56, 189, 248, 0.45)';
        }
        return 'rgba(15, 23, 42, 0.25)';
      }

      if (isSelected) return 'rgba(56, 189, 248, 0.75)';

      // En modo relaciones, respetar el color del tipo de relación incluso en hover
      if (activeMode === 'relations' && selectedCountry) {
        const rel = (polyId && activeRelations?.[polyId]) || (feat.polyId && activeRelations?.[feat.polyId]);
        if (isHovered) {
          // Hover sobre país con relación: color de relación más brillante
          if (rel) {
            if (rel.tone) return rel.tone.hoverFillColor;
            if (rel.type === 'ALLIED' || rel.type === 'STRATEGIC_ALLY' || rel.type === 'ally') return 'rgba(16, 185, 129, 0.88)';
            if (rel.type === 'ECONOMIC_PARTNER' || (rel.type as string) === 'economic_partner') return 'rgba(129, 140, 248, 0.88)';
            if (rel.type === 'FRICTION_STRATEGIC_COMPETITION' || rel.type === 'SANCTIONED_ADVERSARIAL' || rel.type === 'conflict')
              return 'rgba(225, 29, 72, 0.88)';
            if (rel.type === 'NEUTRAL_COMMERCIAL' || rel.type === 'neutral') return 'rgba(245, 158, 11, 0.88)';
            return 'rgba(148, 163, 184, 0.6)';
          }
          // Hover sobre país sin relación: tinte neutro sutil
          return 'rgba(148, 163, 184, 0.4)';
        }
        if (rel) {
          if (rel.tone) return rel.tone.fillColor;
          if (rel.type === 'ALLIED' || rel.type === 'STRATEGIC_ALLY' || rel.type === 'ally') return 'rgba(16, 185, 129, 0.65)';
          if (rel.type === 'ECONOMIC_PARTNER' || (rel.type as string) === 'economic_partner') return 'rgba(129, 140, 248, 0.65)';
          if (rel.type === 'FRICTION_STRATEGIC_COMPETITION' || rel.type === 'SANCTIONED_ADVERSARIAL' || rel.type === 'conflict')
            return 'rgba(225, 29, 72, 0.65)';
          if (rel.type === 'NEUTRAL_COMMERCIAL' || rel.type === 'neutral') return 'rgba(245, 158, 11, 0.65)';
          return 'rgba(100, 116, 139, 0.3)';
        }
        return 'rgba(51, 65, 85, 0.35)';
      }

      if (activeMode === 'claims') {
        if (selectedCountry) {
          const rel = (polyId && activeRelations?.[polyId]) || (feat.polyId && activeRelations?.[feat.polyId]);
          const hasDispute = rel?.states?.some(([code]: [string, number]) => code.startsWith('TERRITORIAL_DISPUTE') || code === 'OCCUPATION');
          const hasStance = rel?.states?.some(([code]: [string, number]) => code.startsWith('CLAIM_STANCE'));
          if (hasDispute) return isHovered ? 'rgba(244, 63, 94, 0.88)' : 'rgba(225, 29, 72, 0.65)';
          if (hasStance) return isHovered ? 'rgba(129, 140, 248, 0.88)' : 'rgba(129, 140, 248, 0.65)';
          return isHovered ? 'rgba(148, 163, 184, 0.4)' : 'rgba(51, 65, 85, 0.25)';
        }
        if (isHovered) return 'rgba(245, 158, 11, 0.5)';
        return (polyId && countryMockData[polyId]?.baseColor) || (feat.polyId && countryMockData[feat.polyId]?.baseColor) || 'rgba(15, 23, 42, 0.25)';
      }

      // Fuera de modo relaciones y reclamos: hover con tinte cyan sutil (no blanco)
      if (isHovered) return 'rgba(56, 189, 248, 0.45)';

      return (polyId && countryMockData[polyId]?.baseColor) || (feat.polyId && countryMockData[feat.polyId]?.baseColor) || 'rgba(15, 23, 42, 0.1)';
    },
    [selectedCountry, hoveredCountry, activeMode, activeRelations, countryMockData, activeLayer, layerData]
  );

  const getPolygonStroke = useCallback(
    (feat: any) => {
      if (!feat) return 'rgba(51, 65, 85, 0.5)';
      const polyId = feat.polyId || feat.id || feat.properties?.ISO_A3 || feat.properties?.ADM0_A3;
      if (!polyId && !feat.properties) return 'rgba(51, 65, 85, 0.5)';

      const isSelected = !!(selectedCountry && ((feat.polyId && feat.polyId === selectedCountry.polyId) || (polyId && polyId === (selectedCountry.polyId || (selectedCountry as any).id))));
      const isHovered = !!(hoveredCountry && ((feat.polyId && feat.polyId === hoveredCountry.polyId) || (polyId && polyId === (hoveredCountry.polyId || (hoveredCountry as any).id))));

      // ─── Modo Riesgo con Capa Temática Activa (T03.2 Ronda 3) ───
      if (activeMode === 'risk' && activeLayer !== 'none') {
        if (isSelected) {
          return '#38bdf8'; // Borde de foco correspondiente (cyan táctico)
        }

        const item = resolveThematicCountryData(feat, layerData, countryMockData);
        if (item) {
          switch (item.colorCategory) {
            case 'critical':
              return '#ef4444';
            case 'high':
              return '#f97316';
            case 'medium':
              return '#eab308';
            case 'low':
              return '#22c55e';
            default:
              return 'rgba(51, 65, 85, 0.3)';
          }
        }

        // Si NO está en layerData (países sin afectación directa)
        if (isHovered) {
          return 'rgba(148, 163, 184, 0.6)';
        }
        return 'rgba(51, 65, 85, 0.3)';
      }

      if (isSelected) return '#38bdf8';

      if (activeMode === 'relations' && selectedCountry) {
        const rel = (polyId && activeRelations?.[polyId]) || (feat.polyId && activeRelations?.[feat.polyId]);
        if (rel) {
          if (rel.tone) return rel.tone.strokeColor;
          if (rel.type === 'ALLIED' || rel.type === 'STRATEGIC_ALLY' || rel.type === 'ally') return '#10b981';
          if (rel.type === 'ECONOMIC_PARTNER' || (rel.type as string) === 'economic_partner') return '#818cf8';
          if (rel.type === 'FRICTION_STRATEGIC_COMPETITION' || rel.type === 'SANCTIONED_ADVERSARIAL' || rel.type === 'conflict')
            return '#e11d48';
          if (rel.type === 'NEUTRAL_COMMERCIAL' || rel.type === 'neutral') return '#f59e0b';
          return '#94a3b8';
        }
        return 'rgba(100, 116, 139, 0.4)';
      }

      if (activeMode === 'claims') {
        if (selectedCountry) {
          const rel = (polyId && activeRelations?.[polyId]) || (feat.polyId && activeRelations?.[feat.polyId]);
          const hasDispute = rel?.states?.some(([code]: [string, number]) => code.startsWith('TERRITORIAL_DISPUTE') || code === 'OCCUPATION');
          const hasStance = rel?.states?.some(([code]: [string, number]) => code.startsWith('CLAIM_STANCE'));
          if (hasDispute) return '#e11d48';
          if (hasStance) return '#818cf8';
          return 'rgba(51, 65, 85, 0.25)';
        }
        if (isHovered) return '#f59e0b';
        return (polyId && countryMockData[polyId]?.baseStroke) || (feat.polyId && countryMockData[feat.polyId]?.baseStroke) || 'rgba(51, 65, 85, 0.4)';
      }

      return (polyId && countryMockData[polyId]?.baseStroke) || (feat.polyId && countryMockData[feat.polyId]?.baseStroke) || 'rgba(51, 65, 85, 0.5)';
    },
    [selectedCountry, hoveredCountry, activeMode, activeRelations, countryMockData, activeLayer, layerData]
  );

  // ─── Arcos 3D de Sustitución, Friendshoring y Rutas Marítimas (T03.4 & T03.5) ───
  const arcsData = useMemo(() => {
    const combinedArcs: any[] = [];

    // 1. Capa de Recursos Críticos (Friendshoring)
    if (activeLayer === 'resources') {
      const arcs = substitutionArcs !== undefined
        ? substitutionArcs
        : FriendshoringService.getSubstitutionArcs(selectedCommodity || undefined);

      for (const arc of arcs) {
        combinedArcs.push({
          startLat: arc.sourceCoords.lat,
          startLng: arc.sourceCoords.lng,
          endLat: arc.targetCoords.lat,
          endLng: arc.targetCoords.lng,
          color: ['rgba(16, 185, 129, 0.9)', 'rgba(6, 182, 212, 0.9)'],
          stroke: 1.6,
          name: `${arc.commodityLabel}: ${arc.originCountry} ➔ ${arc.substituteCountry} (${arc.feasibilityScore}% Viabilidad)`,
          arcData: arc,
        });
      }
    }

    // 2. Líneas de Comercio Marítimo Global (T03.5)
    if (showMaritimeRoutes || activeLayer === 'maritime') {
      const blockedSet = new Set(blockedChokepoints || []);
      for (const route of GLOBAL_MARITIME_ROUTES) {
        const isDisrupted = route.primaryChokepoints.some((id) => blockedSet.has(id));
        const isContingency = route.id.includes('reroute');

        // Solo mostrar rutas de contingencia de forma destacada si hay disrupción relevante
        if (isContingency) {
          const isSuezOrBabBlocked = blockedSet.has('suez') || blockedSet.has('bab_el_mandeb');
          const isPanamaBlocked = blockedSet.has('panama');
          const isRelevantContingency =
            (route.id.includes('cape-good-hope') && isSuezOrBabBlocked) ||
            (route.id.includes('cape-horn') && isPanamaBlocked);
          if (!isRelevantContingency) continue;
        }

        for (let i = 0; i < route.waypoints.length - 1; i++) {
          const [lng1, lat1] = route.waypoints[i];
          const [lng2, lat2] = route.waypoints[i + 1];

          // Evitar saltos de arco que crucen el antimeridiano de golpe en 3D
          if (Math.abs(lng2 - lng1) > 180) continue;

          combinedArcs.push({
            startLat: lat1,
            startLng: lng1,
            endLat: lat2,
            endLng: lng2,
            color: isDisrupted
              ? ['rgba(244, 63, 94, 0.9)', 'rgba(239, 68, 68, 0.9)']
              : isContingency
              ? ['rgba(245, 158, 11, 0.95)', 'rgba(217, 119, 6, 0.95)']
              : ['rgba(56, 189, 248, 0.8)', 'rgba(6, 182, 212, 0.8)'],
            stroke: isDisrupted ? 1.9 : isContingency ? 1.6 : 1.3,
            name: `${route.nameEs}${isDisrupted ? ' [ESTRECHO BLOQUEADO]' : isContingency ? ' [RUTA DE DESVÍO]' : ''}`,
            routeId: route.id,
          });
        }
      }
    }

    return combinedArcs;
  }, [activeLayer, substitutionArcs, selectedCommodity, showMaritimeRoutes, blockedChokepoints]);

  return { getPolygonColor, getPolygonStroke, arcsData };
}