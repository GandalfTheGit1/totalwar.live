import { useState, useEffect, useRef } from 'react';
import { GeoFeature, CountryMockDataMap } from '../types';
import { EARTH_TEX, BUMP_TEX, GEOJSON_URL, loadGlobeScript, getRiskAppearance } from '../utils/geo-helpers';

export function useGlobeInit(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  getPolygonStrokeRef: React.MutableRefObject<any>,
  getPolygonColorRef: React.MutableRefObject<any>,
  handleCountryHoverRef: React.MutableRefObject<any>,
  handleCountryClickRef: React.MutableRefObject<any>,
  handleBackgroundClickRef: React.MutableRefObject<any>,
  handleFacilityHoverRef?: React.MutableRefObject<any>,
  handleFacilityClickRef?: React.MutableRefObject<any>
) {
  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<GeoFeature[]>([]);
  const [countryMockData, setCountryMockData] = useState<CountryMockDataMap>({});

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    loadGlobeScript()
      .then((GlobeFactory) => {
        if (!isMounted || !globeContainerRef.current) return;

        console.log('[GeopoliticalMonitor] Initializing Globe.GL...');
        const initialWidth = containerRef.current?.clientWidth || window.innerWidth;
        const initialHeight = containerRef.current?.clientHeight || window.innerHeight;

        const globe = GlobeFactory()(globeContainerRef.current)
          .width(initialWidth)
          .height(initialHeight)
          .globeImageUrl(EARTH_TEX)
          .bumpImageUrl(BUMP_TEX)
          .backgroundColor('rgba(0,0,0,0)')
          .polygonAltitude(0.01)
          .polygonsTransitionDuration(0)
          .polygonSideColor(() => 'rgba(15, 23, 42, 0.05)')
          .polygonStrokeColor((feat: any) => getPolygonStrokeRef.current(feat))
          .polygonCapColor((feat: any) => getPolygonColorRef.current(feat))
          .polygonLabel(() => null)
          .arcDashLength(0.4)
          .arcDashGap(0.2)
          .arcDashInitialGap(() => Math.random())
          .arcDashAnimateTime(1500)
          .arcStroke((d: any) => d.stroke || 1)
          .arcColor((d: any) => d.color)
          .arcsTransitionDuration(0)
          // ─── Puntos 3D para Instalaciones Corporativas Item 2 (T03.1) ───
          .pointsData([])
          .pointLat((d: any) => d.lat)
          .pointLng((d: any) => d.lng)
          .pointColor((d: any) => d.color || '#38bdf8')
          .pointAltitude((d: any) => d.altitude || 0.03)
          .pointRadius((d: any) => d.radius || 0.55)
          .pointResolution(20)
          .pointsMerge(false)
          .pointsTransitionDuration(0)
          .onPointHover((point: any, event?: any) => {
            if (handleFacilityHoverRef?.current) {
              handleFacilityHoverRef.current(point, event);
            }
          })
          .onPointClick((point: any, event?: any) => {
            if (handleFacilityClickRef?.current) {
              handleFacilityClickRef.current(point, event);
            }
          })
          .onPolygonHover((polygon: any, event?: any) => handleCountryHoverRef.current(polygon, event))
          .onPolygonClick((polygon: any) => handleCountryClickRef.current(polygon))
          .onGlobeClick(() => handleBackgroundClickRef.current());

        globeInstanceRef.current = globe;
        globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const controls = globe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        globe.camera().position.z = 250;

        console.log('[GeopoliticalMonitor] Fetching GeoJSON datasets...');
        fetch(GEOJSON_URL)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then((countries) => {
            if (!isMounted) return;
            const validFeatures: GeoFeature[] = countries.features
              .filter((feat: any) => feat.geometry && feat.geometry.coordinates && feat.geometry.coordinates.length > 0)
              .map((feat: any, index: number) => ({ ...feat, polyId: `poly-id-${index}` }));

            const KEY_COUNTRY_PMIS: Record<string, { mfg: number; srv: number; comp: number; date: string }> = {
              USA: { mfg: 49.6, srv: 55.2, comp: 54.3, date: 'Agosto 2026' },
              US: { mfg: 49.6, srv: 55.2, comp: 54.3, date: 'Agosto 2026' },
              CHN: { mfg: 50.4, srv: 51.6, comp: 51.2, date: 'Agosto 2026' },
              DEU: { mfg: 43.2, srv: 52.5, comp: 48.7, date: 'Agosto 2026' },
              JPN: { mfg: 49.8, srv: 53.7, comp: 52.5, date: 'Agosto 2026' },
              TWN: { mfg: 52.9, srv: 53.8, comp: 53.4, date: 'Agosto 2026' },
              GBR: { mfg: 52.5, srv: 53.7, comp: 53.3, date: 'Agosto 2026' },
              KOR: { mfg: 51.4, srv: 52.0, comp: 51.7, date: 'Agosto 2026' },
              IND: { mfg: 58.1, srv: 60.5, comp: 59.8, date: 'Agosto 2026' },
              ESP: { mfg: 51.0, srv: 55.3, comp: 54.2, date: 'Agosto 2026' },
              FRA: { mfg: 44.0, srv: 50.1, comp: 49.1, date: 'Agosto 2026' },
              MEX: { mfg: 49.8, srv: 52.3, comp: 51.5, date: 'Agosto 2026' },
              CAN: { mfg: 47.8, srv: 51.2, comp: 50.1, date: 'Agosto 2026' },
              BRA: { mfg: 51.8, srv: 54.0, comp: 53.2, date: 'Agosto 2026' },
            };

            const newMockData: CountryMockDataMap = {};
            validFeatures.forEach((feat) => {
              const rawIso = feat.properties?.ISO_A3;
              const iso = (rawIso && rawIso !== '-99')
                ? rawIso
                : (feat.properties?.ADM0_A3 || feat.properties?.SU_A3 || feat.properties?.ADMIN || 'N/A');
              const risk = Math.floor(Math.random() * 100);
              const appearance = getRiskAppearance(risk);

              let pmiMfg: number;
              let pmiSrv: number;
              let pmiComp: number;
              let pmiDate = 'Agosto 2026';

              if (KEY_COUNTRY_PMIS[iso]) {
                const keyPmi = KEY_COUNTRY_PMIS[iso];
                pmiMfg = keyPmi.mfg;
                pmiSrv = keyPmi.srv;
                pmiComp = keyPmi.comp;
                pmiDate = keyPmi.date;
              } else {
                pmiMfg = Number((53.5 - (risk / 100) * 8 + (Math.random() * 2 - 1)).toFixed(1));
                pmiSrv = Number((54.5 - (risk / 100) * 6 + (Math.random() * 2 - 1)).toFixed(1));
                pmiComp = Number((pmiMfg * 0.4 + pmiSrv * 0.6).toFixed(1));
              }

              const pmiTrend = pmiComp >= 50.0 ? 'expansion' : 'contraction';

              newMockData[feat.polyId] = {
                name: feat.properties.ADMIN || 'Desconocido',
                iso: iso,
                risk: risk,
                friction: (Math.random() * 10).toFixed(1) + '/10',
                aiExposure: (['Alta', 'Media', 'Baja'] as const)[Math.floor(Math.random() * 3)],
                baseColor: appearance.color,
                baseStroke: appearance.stroke,
                indicator: appearance.indicator,
                textClass: appearance.textClass,
                pmiManufacturing: pmiMfg,
                pmiServices: pmiSrv,
                pmiComposite: pmiComp,
                pmiTrend: pmiTrend,
                pmiReportDate: pmiDate,
              };
            });

            setGeoJsonData(validFeatures);
            setCountryMockData(newMockData);
            globe.polygonsData(validFeatures);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('[GeopoliticalMonitor] Error loading GeoJSON:', err);
            if (isMounted) {
              setLoadError('Error cargando topología geográfica. Compruebe la conexión a internet.');
              setIsLoading(false);
            }
          });
      })
      .catch((err) => {
        console.error('[GeopoliticalMonitor] Initialization failed:', err);
        if (isMounted) {
          setLoadError('Error inicializando el motor de renderizado 3D.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (globeInstanceRef.current && globeInstanceRef.current._destructor) {
        globeInstanceRef.current._destructor();
      }
    };
  }, []);

  return { globeContainerRef, globeInstanceRef, isLoading, loadError, geoJsonData, countryMockData };
}