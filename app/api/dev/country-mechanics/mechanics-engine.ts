// Module: app/api/dev/country-mechanics/mechanics-engine.ts
// Calculation engine and data aggregation helpers for Country Mechanics (EU4/HOI4 inspired).

import fs from 'fs/promises';
import path from 'path';
import {
  calcSovereignDebtSpiral,
  calcImportStarvation,
  calcPublicCapExTrap,
  calcIndustrialTransition,
  calcGeographicMode,
  calcSovereignCommodityDepletion,
  calcCountryNodeAttrition,
  calcCountryWeakestLink,
} from '@/lib/services/hoi4-eu4-mechanics';

export interface StaticMatrixBundle {
  matrixData: any;
  resourcesData: Record<string, any>;
  tensionCache: Record<string, any>;
  geoLookup: Record<string, any>;
}

export interface TacticalCountryData {
  industrialProduction: number | null;
  portCongestion: number | null;
  fxReserves: number | null;
  capex: number | null;
  sovereignYields: number | null;
  dataSources: Record<string, string>;
}

/**
 * Loads static geopolitical, natural resources, and tension caches from disk.
 */
export async function loadStaticMatrices(): Promise<StaticMatrixBundle> {
  const MATRIX_PATH = path.join(process.cwd(), 'lib/data/geopolitical-global-matrix.json');
  const RESOURCES_PATH = path.join(process.cwd(), 'lib/data/natural-resources.json');
  const TENSION_CACHE_PATH = path.join(process.cwd(), 'lib/data/country-tension-cache.json');

  const [rawMatrix, rawResources] = await Promise.all([
    fs.readFile(MATRIX_PATH, 'utf-8'),
    fs.readFile(RESOURCES_PATH, 'utf-8'),
  ]);

  const matrixData = JSON.parse(rawMatrix);
  const resourcesData = JSON.parse(rawResources);

  let tensionCache: Record<string, any> = {};
  try {
    const rawTension = await fs.readFile(TENSION_CACHE_PATH, 'utf-8');
    tensionCache = JSON.parse(rawTension);
  } catch {
    console.log('[Source:CountryTension] Cache not found, will fallback');
  }

  const geoLookup: Record<string, any> = {};
  for (const node of matrixData.nodes || []) {
    geoLookup[node.iso3] = node;
  }

  return { matrixData, resourcesData, tensionCache, geoLookup };
}

/**
 * Fetches tactical country metrics sequentially to avoid rate-limiting or quota strain.
 */
export async function fetchCountryTacticalMetrics(
  baseUrl: string,
  iso2: string | undefined,
  iso3: string,
  geoName: string,
  bdiSource: string
): Promise<TacticalCountryData> {
  let industrialProduction: number | null = null;
  let portCongestion: number | null = null;
  let fxReserves: number | null = null;
  let capex: number | null = null;
  let sovereignYields: number | null = null;

  const dataSources: Record<string, string> = {
    industrialProduction: 'wb_annual',
    portCongestion: 'wb_lpi',
    fxReserves: 'wb_annual',
    capex: 'wb_annual',
    sovereignYields: 'wb_structural',
    bdi: bdiSource,
    countryTension: 'friction_proxy',
  };

  if (!iso2) {
    return { industrialProduction, portCongestion, fxReserves, capex, sovereignYields, dataSources };
  }

  // Refactor reason: Extracted sub-fetch loop with 50ms throttling to guarantee quota resilience.
  try {
    const res = await fetch(`${baseUrl}/api/dev/industrial-production?country=${iso2}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.yoyChange != null) {
        industrialProduction = data.yoyChange;
        dataSources.industrialProduction = data.source;
      }
    }
  } catch {
    console.log(`[Source:IndustrialProduction] IMF SDMX unavailable for ${iso3}, falling back to WB annual`);
  }

  try {
    const res = await fetch(`${baseUrl}/api/dev/port-congestion?country=${iso2}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.utilization != null) {
        portCongestion = data.utilization;
        dataSources.portCongestion = data.source;
      }
    }
  } catch {}

  try {
    const res = await fetch(`${baseUrl}/api/dev/fx-reserves?country=${iso2}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.monthsOfCover != null) {
        fxReserves = data.monthsOfCover;
        dataSources.fxReserves = data.source || 'imf_ifs';
      }
    }
  } catch {}

  try {
    const res = await fetch(`${baseUrl}/api/dev/capex?country=${iso3}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.grossFixedCapitalPct != null) {
        capex = data.grossFixedCapitalPct;
        dataSources.capex = data.source || 'oecd_quarterly';
      }
    }
  } catch {}

  try {
    const res = await fetch(`${baseUrl}/api/dev/sovereign-yields?country=${encodeURIComponent(geoName || iso3)}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.spread != null) {
        sovereignYields = data.spread;
        dataSources.sovereignYields = data.source;
      }
    }
  } catch {}

  await new Promise(r => setTimeout(r, 50));

  return { industrialProduction, portCongestion, fxReserves, capex, sovereignYields, dataSources };
}

/**
 * Evaluates the 9 game mechanics formulas for a single country.
 */
export function evaluateCountryMechanics(params: {
  iso3: string;
  wb: Record<string, number | null>;
  geo: any;
  resourcesData: Record<string, any>;
  tensionCache: Record<string, any>;
  tactical: TacticalCountryData;
}): any {
  const { iso3, wb, geo, resourcesData, tensionCache, tactical } = params;
  const iso2 = geo.code;
  const resData = iso2 ? resourcesData[iso2] : null;
  const primaryCommodityType = resData?.resources?.[0]?.name || 'Diversified';
  const sovereignRisk = geo.sovereignRiskBase ?? 5.0;

  // Resolve tension proxy
  let countryTensionProxy = 60 * (sovereignRisk / 10);
  if (iso2 && tensionCache[iso2]) {
    countryTensionProxy = tensionCache[iso2].tensionIndex;
    tactical.dataSources.countryTension = 'gdelt_cached';
  } else {
    console.log(`[Source:CountryTension] GDELT cached unavailable for ${iso3}, using static proxy`);
  }

  const getWbVal = (id: string) => wb[id] !== undefined ? wb[id] : null;

  // Sovereign debt spiral
  let sovereignRes = calcSovereignDebtSpiral(getWbVal('GC.XPN.INTP.RV.ZS'), sovereignRisk);
  if (tactical.sovereignYields !== null) {
    if (tactical.sovereignYields > 500) { sovereignRes = { sovereignICR: 0.8, distressScore: 100, breachesThreshold: true }; }
    else if (tactical.sovereignYields > 250) { sovereignRes = { sovereignICR: 1.1, distressScore: 80, breachesThreshold: true }; }
    else { sovereignRes = { sovereignICR: 3.0, distressScore: 0, breachesThreshold: false }; }
  } else if (tactical.dataSources.sovereignYields === 'wb_structural' && !getWbVal('GC.XPN.INTP.RV.ZS')) {
    console.log('[Source:SovereignYields] Scraping blocked, using WB structural data');
  }

  const starvationRes = calcImportStarvation(tactical.fxReserves !== null ? tactical.fxReserves : getWbVal('FI.RES.TOTL.MO'), sovereignRisk);
  const capexRes = calcPublicCapExTrap(tactical.capex !== null ? tactical.capex : getWbVal('NE.GDI.FTOT.ZS'), sovereignRisk);
  const transitionRes = tactical.industrialProduction !== null
    ? calcIndustrialTransition(100 + tactical.industrialProduction, 100, sovereignRisk)
    : calcIndustrialTransition(getWbVal('NV.IND.MANF.ZS'), undefined, sovereignRisk);

  const geoModeRes = calcGeographicMode(getWbVal('NY.GDP.PCAP.CD'), getWbVal('EN.URB.MCTY.TL.ZS'), sovereignRisk);
  const depletionRes = calcSovereignCommodityDepletion(getWbVal('NY.GDP.TOTL.RT.ZS'), primaryCommodityType, sovereignRisk);

  let attritionRes = calcCountryNodeAttrition(getWbVal('LP.LPI.INFR.XQ'), sovereignRisk);
  if (tactical.portCongestion !== null) {
    const simulatedFriction = tactical.portCongestion > 100 ? (tactical.portCongestion / 1000) * 3 : Math.min(10, tactical.portCongestion / 5);
    attritionRes = calcCountryNodeAttrition(getWbVal('LP.LPI.INFR.XQ'), simulatedFriction);
  }

  const weakestRes = calcCountryWeakestLink({
    infr: getWbVal('LP.LPI.INFR.XQ'),
    trac: getWbVal('LP.LPI.TRAC.XQ'),
    itin: getWbVal('LP.LPI.ITIN.XQ'),
    cust: getWbVal('LP.LPI.CUST.XQ'),
  }, sovereignRisk);

  return {
    countryCode: iso3,
    sovereignICR: sovereignRes.sovereignICR,
    sovereignICRBreached: sovereignRes.breachesThreshold,
    sovereignDistressScore: sovereignRes.distressScore,
    importBufferMonths: starvationRes.bufferMonths,
    isImportStarved: starvationRes.isStarved,
    publicCapExGapPct: capexRes.capexGapPct,
    isCapExCannibalized: capexRes.isCannibalized,
    industrialChangePct: transitionRes.yoyChangePct,
    isInTransition: transitionRes.isInTransition,
    portCongestion: tactical.portCongestion,
    industrialProduction: tactical.industrialProduction,
    geographicMode: geoModeRes.mode,
    sprawlPenaltyScore: geoModeRes.sprawlScore,
    resourceRentPct: getWbVal('NY.GDP.TOTL.RT.ZS') || 0,
    dutchDiseaseRisk: depletionRes.dutchDiseaseRisk,
    primaryCommodityType,
    infrastructureQuality: attritionRes.infrastructureScore,
    nodeAttritionRisk: attritionRes.attritionRisk,
    weakestLinkScore: weakestRes.bottleneckScore,
    revenueCeilingMultiplier: weakestRes.revenueCeilingMultiplier,
    countryTensionProxy,
    dataSources: tactical.dataSources,
  };
}
