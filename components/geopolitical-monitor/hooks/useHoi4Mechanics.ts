import { useState, useEffect } from 'react';
import {
  calcBankruptcySpiral,
  calcJITStarvation,
  calcCapExTrap,
  calcRetoolingPenalty,
  calcTallVsWide,
  calcCommodityDepletion,
  calcWeakestLinkThroughput,
  calcNodeAttrition
} from '@/lib/services/hoi4-eu4-mechanics';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';

export interface WorldTensionData {
  tensionIndex: number;
  source: 'gdelt' | 'fallback';
  reason?: string;
  details: {
    articleCount: number;
    avgTone: number;
  };
  events: any[];
}

export function useHoi4Mechanics(companyData: any, selectedCountryCode: string | null = null) {
  const [worldTension, setWorldTension] = useState<WorldTensionData | null>(null);
  const [lpiMap, setLpiMap] = useState<Record<string, number> | null>(null);
  const [countryMechanicsMap, setCountryMechanicsMap] = useState<Record<string, any>>({});
  const [isLoadingTension, setIsLoadingTension] = useState(true);
  const [isLoadingLpi, setIsLoadingLpi] = useState(true);
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchTension() {
      const tensionKey = geoCacheKeys.tension();
      const cached = geoCache.getSync<WorldTensionData>(tensionKey) || await geoCache.get<WorldTensionData>(tensionKey);
      if (cached && mounted) {
        setWorldTension(cached);
        setIsLoadingTension(false);
        return;
      }

      try {
        const res = await fetch('/api/dev/world-tension', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch world tension');
        const data = await res.json();
        if (mounted) {
          setWorldTension(data);
          geoCache.set(tensionKey, data, GEO_CACHE_TTLS.WORLD_TENSION).catch(() => {});
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Error fetching world tension:', err);
        if (mounted) {
          setWorldTension({
            tensionIndex: 45,
            source: 'fallback',
            reason: 'Fetch failed',
            details: { articleCount: 0, avgTone: 0 },
            events: []
          });
        }
      } finally {
        if (mounted) setIsLoadingTension(false);
      }
    }

    async function fetchLpi() {
      const lpiKey = geoCacheKeys.lpi();
      const cached = geoCache.getSync<Record<string, number>>(lpiKey) || await geoCache.get<Record<string, number>>(lpiKey);
      if (cached && mounted) {
        setLpiMap(cached);
        setIsLoadingLpi(false);
        return;
      }

      try {
        const res = await fetch('/api/dev/world-bank-lpi', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch LPI');
        const data = await res.json();
        const payload = data.data || {};
        if (mounted) {
          setLpiMap(payload);
          geoCache.set(lpiKey, payload, GEO_CACHE_TTLS.LPI).catch(() => {});
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Error fetching LPI:', err);
        if (mounted) setLpiMap({});
      } finally {
        if (mounted) setIsLoadingLpi(false);
      }
    }

    async function fetchCountryMechanics() {
      const mechanicsKey = geoCacheKeys.mechanics();
      const cached = geoCache.getSync<Record<string, any>>(mechanicsKey) || await geoCache.get<Record<string, any>>(mechanicsKey);
      if (cached && mounted) {
        setCountryMechanicsMap(cached);
        setIsLoadingCountry(false);
        return;
      }

      try {
        const res = await fetch('/api/dev/country-mechanics', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch country mechanics');
        const data = await res.json();
        const payload = data.data || {};
        if (mounted) {
          setCountryMechanicsMap(payload);
          geoCache.set(mechanicsKey, payload, GEO_CACHE_TTLS.COUNTRY_MECHANICS).catch(() => {});
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Error fetching country mechanics:', err);
        if (mounted) setCountryMechanicsMap({});
      } finally {
        if (mounted) setIsLoadingCountry(false);
      }
    }

    fetchTension();
    fetchLpi();
    fetchCountryMechanics();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (selectedCountryCode) {
      console.log(`[useHoi4Mechanics] Selected country changed to ${selectedCountryCode}`);
    }
  }, [selectedCountryCode]);

  // Use fallback dummy values for company data if not provided
  const ebit = companyData?.ebit ?? 1000000;
  const interestExpense = companyData?.interestExpense ?? 200000;
  const dio = companyData?.dio ?? 35;
  const chokepointDelay = companyData?.chokepointDelay ?? 14;
  const ocf = companyData?.ocf ?? 800000;
  const fixedDebtService = companyData?.fixedDebtService ?? 300000;
  const capEx = companyData?.actualCapEx ?? 400000;
  const da = companyData?.da ?? 450000;
  const totalRevenue = companyData?.totalRevenue ?? 5000000;
  const quartersElapsed = companyData?.quartersElapsed ?? 2;
  const roic = companyData?.roic ?? 12;
  const geoSegmentCount = companyData?.geoSegmentCount ?? 5;
  const sga = companyData?.sga ?? 800000;
  const annualExtraction = companyData?.annualExtraction ?? 100000;
  const provenReserves = companyData?.provenReserves ?? 1000000;
  const localInflation = companyData?.localInflation ?? 0.05;
  const lpiScoresArray = companyData?.lpiScores ?? [3.1, 3.8, 4.1];
  const frictionScore = companyData?.frictionScore ?? 6.5;

  const bankruptcy = calcBankruptcySpiral(ebit, interestExpense);
  const jitStarvation = calcJITStarvation(dio, chokepointDelay, 1.2);
  const capexTrap = calcCapExTrap(ocf, fixedDebtService, capEx, da, totalRevenue);
  const retooling = calcRetoolingPenalty(200, 0.5, quartersElapsed);
  const tallVsWide = calcTallVsWide(roic, geoSegmentCount, sga, totalRevenue);
  const depletion = calcCommodityDepletion(annualExtraction, provenReserves, localInflation);
  const weakestLink = calcWeakestLinkThroughput(lpiScoresArray);
  const nodeAttrition = calcNodeAttrition(frictionScore);

  const countryMechanics = selectedCountryCode ? (countryMechanicsMap[selectedCountryCode] || null) : null;

  return {
    worldTension,
    lpiMap,
    isLoadingTension,
    isLoadingLpi,
    isLoadingCountry,
    countryMechanics,
    mechanics: {
      bankruptcy,
      jitStarvation,
      capexTrap,
      retooling,
      tallVsWide,
      depletion,
      weakestLink,
      nodeAttrition
    }
  };
}
