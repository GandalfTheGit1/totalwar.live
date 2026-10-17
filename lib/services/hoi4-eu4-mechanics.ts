export function calcBankruptcySpiral(ebit: number, interestExpense: number): {
  icr: number;
  distressScore: number;
  breachesThreshold: boolean;
} {
  const icr = interestExpense === 0 ? Infinity : ebit / interestExpense;
  const distressScore = Math.min(100, Math.max(0, (1 - icr) * 100));
  const breachesThreshold = icr < 1.0;

  return { icr, distressScore, breachesThreshold };
}

export function calcJITStarvation(diodays: number, chokepointDelayDays: number, frictionModifier: number): {
  outputMultiplier: number;
  isStarved: boolean;
} {
  const effectiveDelay = chokepointDelayDays * frictionModifier;
  const isStarved = effectiveDelay > diodays;
  return {
    outputMultiplier: isStarved ? 0 : 1,
    isStarved,
  };
}

export function calcCapExTrap(operatingCashFlow: number, fixedDebtService: number, actualCapEx: number, da: number, totalRevenue: number): {
  maintenanceCapExDeficit: number;
  isCannibalized: boolean;
  revenueDriftPenalty: number;
} {
  const availableCash = operatingCashFlow - fixedDebtService;
  const maintenanceCapExDeficit = Math.max(0, da - availableCash);
  const isCannibalized = maintenanceCapExDeficit > 0;
  
  const revenueDriftPenalty = totalRevenue > 0 && maintenanceCapExDeficit > 0 ? -(maintenanceCapExDeficit / totalRevenue) * 100 : 0;
  
  return {
    maintenanceCapExDeficit,
    isCannibalized,
    revenueDriftPenalty
  };
}

export function calcRetoolingPenalty(maxPenaltyBps: number, learningRate: number, quartersElapsed: number): {
  currentCompressionBps: number;
  isInRetoolingPhase: boolean;
} {
  const currentCompressionBps = maxPenaltyBps * Math.exp(-learningRate * quartersElapsed);
  const isInRetoolingPhase = currentCompressionBps > 50;
  return {
    currentCompressionBps,
    isInRetoolingPhase,
  };
}

export function calcTallVsWide(roic: number, geoSegmentCount: number, sga: number, totalRevenue: number): {
  mode: 'TALL' | 'WIDE' | 'NEUTRAL';
  sprawlPenaltyBps: number;
  sgaPenaltyMultiplier: number;
} {
  const roicPercent = roic; // assume roic is already in percentage, e.g., 25 for 25%
  let mode: 'TALL' | 'WIDE' | 'NEUTRAL' = 'NEUTRAL';
  if (roicPercent >= 20) {
    mode = 'TALL';
  } else if (geoSegmentCount > 3 && roicPercent < 15) {
    mode = 'WIDE';
  }

  const sprawlPenaltyBps = ((geoSegmentCount * 0.15) / (totalRevenue || 1)) * sga * 10000;
  
  return {
    mode,
    sprawlPenaltyBps,
    sgaPenaltyMultiplier: mode === 'WIDE' ? 1 + (geoSegmentCount * 0.05) : 1
  };
}

export function calcCommodityDepletion(annualExtractionRate: number, provenReserves: number, localCostInflationRate: number): {
  depletionProbability: number;
  yearsToExhaustion: number;
  cogsSpikeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const depletionProbability = provenReserves === 0 ? 1 : Math.min(1, Math.max(0, annualExtractionRate / provenReserves));
  const yearsToExhaustion = annualExtractionRate === 0 ? Infinity : provenReserves / annualExtractionRate;
  
  let cogsSpikeRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (depletionProbability >= 0.25) {
    cogsSpikeRisk = 'HIGH';
  } else if (depletionProbability >= 0.1) {
    cogsSpikeRisk = 'MEDIUM';
  }

  return {
    depletionProbability,
    yearsToExhaustion,
    cogsSpikeRisk,
  };
}

export function calcWeakestLinkThroughput(lpiScores: number[]): {
  bottleneckScore: number;
  revenueCeilingMultiplier: number;
} {
  if (lpiScores.length === 0) return { bottleneckScore: 5, revenueCeilingMultiplier: 1 };
  
  const bottleneckScore = Math.min(...lpiScores);
  const revenueCeilingMultiplier = Math.max(0.5, Math.min(1.0, bottleneckScore / 5));
  
  return {
    bottleneckScore,
    revenueCeilingMultiplier,
  };
}

export function calcNodeAttrition(countryFrictionScore: number, estimatedHubUtilization?: number): {
  attritionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dioPenaltyMultiplier: number;
} {
  const utilization = estimatedHubUtilization ?? ((countryFrictionScore / 10) * 0.8 + 0.2);
  
  let attritionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let dioPenaltyMultiplier = 1.0;

  if (utilization > 0.95) {
    attritionRisk = 'CRITICAL';
    dioPenaltyMultiplier = 1.5;
  } else if (utilization > 0.80) {
    attritionRisk = 'HIGH';
    dioPenaltyMultiplier = 1.25;
  } else if (utilization > 0.60) {
    attritionRisk = 'MEDIUM';
    dioPenaltyMultiplier = 1.1;
  }

  return {
    attritionRisk,
    dioPenaltyMultiplier,
  };
}

export function calcSovereignDebtSpiral(interestAsPercentOfRevenue: number | null, fallbackSovereignRisk?: number): {
  sovereignICR: number;
  distressScore: number;
  breachesThreshold: boolean;
} {
  let icr = 100; // safe default
  let fromFallback = false;
  if (interestAsPercentOfRevenue !== null && interestAsPercentOfRevenue > 0) {
    icr = 100 / interestAsPercentOfRevenue;
  } else if (fallbackSovereignRisk !== undefined) {
    // using fallback sovereign risk to proxy ICR
    // e.g. sovereignRisk of 8.5 -> high risk, low ICR
    icr = Math.max(0.1, 10 - fallbackSovereignRisk);
    fromFallback = true;
  } else {
    // defaults
    icr = 5.0;
  }
  
  const breachesThreshold = icr < 1.2;
  const distressScore = Math.min(100, Math.max(0, (1.2 - icr) * 100)); // proxy score
  
  return { sovereignICR: icr, distressScore, breachesThreshold };
}

export function calcImportStarvation(importCoverMonths: number | null, fallbackSovereignRisk?: number): {
  bufferMonths: number;
  isStarved: boolean;
  riskLevel: 'SAFE' | 'VULNERABLE' | 'CRITICAL';
} {
  let bufferMonths = importCoverMonths;
  if (bufferMonths === null && fallbackSovereignRisk !== undefined) {
    bufferMonths = Math.max(0.1, 6.0 - (fallbackSovereignRisk * 0.6));
  }
  bufferMonths = bufferMonths ?? 3.0; // fallback to 3.0 safe if no proxy available

  const isStarved = bufferMonths < 2.0;
  let riskLevel: 'SAFE' | 'VULNERABLE' | 'CRITICAL' = 'SAFE';
  if (bufferMonths < 2.0) riskLevel = 'CRITICAL';
  else if (bufferMonths < 3.0) riskLevel = 'VULNERABLE';
  
  return { bufferMonths, isStarved, riskLevel };
}

export function calcPublicCapExTrap(grossFixedCapitalPct: number | null, fallbackSovereignRisk?: number): {
  capexGapPct: number;
  isCannibalized: boolean;
  investmentMode: 'ADEQUATE' | 'DEFICIT' | 'SEVERE';
} {
  let value = grossFixedCapitalPct;
  if (value === null && fallbackSovereignRisk !== undefined) {
    value = Math.max(5, 30 - (fallbackSovereignRisk * 2));
  }
  value = value ?? 22; // fallback to 22%

  const capexGapPct = Math.max(0, 22 - value);
  const isCannibalized = value < 18;
  
  let investmentMode: 'ADEQUATE' | 'DEFICIT' | 'SEVERE' = 'ADEQUATE';
  if (value < 15) investmentMode = 'SEVERE';
  else if (value < 18) investmentMode = 'DEFICIT';
  
  return { capexGapPct, isCannibalized, investmentMode };
}

export function calcIndustrialTransition(manufacturingPct: number | null, priorPct?: number, fallbackSovereignRisk?: number): {
  yoyChangePct: number;
  isInTransition: boolean;
  compressionEstimateBps: number;
} {
  let value = manufacturingPct;
  if (value === null && fallbackSovereignRisk !== undefined) {
    value = Math.max(2, 25 - (fallbackSovereignRisk * 1.5));
  }
  value = value ?? 15;

  const prev = priorPct ?? value;
  const yoyChangePct = prev > 0 ? ((value - prev) / prev) * 100 : 0;
  const isInTransition = yoyChangePct < -2;
  const compressionEstimateBps = isInTransition ? Math.abs(yoyChangePct) * 10 : 0;
  
  return { yoyChangePct, isInTransition, compressionEstimateBps };
}

export function calcGeographicMode(gdpPerCapita: number | null, urbanConcentrationPct: number | null, fallbackSovereignRisk?: number): {
  mode: 'TALL' | 'WIDE' | 'NEUTRAL';
  sprawlScore: number;
} {
  let gdp = gdpPerCapita;
  let urban = urbanConcentrationPct;

  if ((gdp === null || urban === null) && fallbackSovereignRisk !== undefined) {
    gdp = gdp ?? Math.max(500, 50000 - (fallbackSovereignRisk * 5000));
    urban = urban ?? Math.max(10, 80 - (fallbackSovereignRisk * 6));
  }
  
  gdp = gdp ?? 15000;
  urban = urban ?? 40;
  
  let mode: 'TALL' | 'WIDE' | 'NEUTRAL' = 'NEUTRAL';
  if (gdp > 25000 && urban > 50) mode = 'TALL';
  else if (gdp < 10000 && urban < 25) mode = 'WIDE';
  
  let sprawlScore = 50;
  if (mode === 'WIDE') sprawlScore = 80;
  else if (mode === 'TALL') sprawlScore = 20;
  
  return { mode, sprawlScore };
}

export function calcSovereignCommodityDepletion(resourceRentPct: number | null, primaryCommodity: string, fallbackSovereignRisk?: number): {
  dutchDiseaseRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  depletionProxy: number;
  cogsSpikeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  let rent = resourceRentPct;
  if (rent === null && fallbackSovereignRisk !== undefined) {
    // High sovereign risk often correlates with high resource dependence in developing countries, just a proxy
    rent = Math.min(40, Math.max(0, (fallbackSovereignRisk - 3) * 3));
  }
  rent = rent ?? 5;

  let dutchDiseaseRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (rent > 15) dutchDiseaseRisk = 'HIGH';
  else if (rent > 8) dutchDiseaseRisk = 'MEDIUM';
  
  const depletionProxy = rent / 100;
  const cogsSpikeRisk = dutchDiseaseRisk;
  
  return { dutchDiseaseRisk, depletionProxy, cogsSpikeRisk };
}

export function calcCountryNodeAttrition(lpiInfraScore: number | null, frictionScore?: number): {
  attritionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  infrastructureScore: number;
  dioPenaltyMultiplier: number;
} {
  let score = lpiInfraScore;
  if (score === null && frictionScore !== undefined) {
    score = Math.max(1, 5 - (frictionScore / 2.5)); // fallback approx
  }
  if (score === null || score === undefined) score = 3.0;
  
  let attritionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let dioPenaltyMultiplier = 1.0;
  
  if (score < 2.0) { attritionRisk = 'CRITICAL'; dioPenaltyMultiplier = 1.5; }
  else if (score < 2.8) { attritionRisk = 'HIGH'; dioPenaltyMultiplier = 1.25; }
  else if (score < 3.5) { attritionRisk = 'MEDIUM'; dioPenaltyMultiplier = 1.1; }
  
  return { attritionRisk, infrastructureScore: score, dioPenaltyMultiplier };
}

export function calcCountryWeakestLink(lpiSubScores: { infr: number | null, trac: number | null, itin: number | null, cust: number | null }, fallbackSovereignRisk?: number): {
  bottleneckScore: number;
  bottleneckDimension: string;
  revenueCeilingMultiplier: number;
} {
  const getSubScore = (val: number | null) => {
    if (val !== null) return val;
    if (fallbackSovereignRisk !== undefined) return Math.max(1, 5 - (fallbackSovereignRisk / 2.5));
    return 3.0;
  };

  let bottleneckDimension = 'infr';
  let bottleneckScore = getSubScore(lpiSubScores.infr);
  
  const tracScore = getSubScore(lpiSubScores.trac);
  if (tracScore < bottleneckScore) { bottleneckScore = tracScore; bottleneckDimension = 'trac'; }
  
  const itinScore = getSubScore(lpiSubScores.itin);
  if (itinScore < bottleneckScore) { bottleneckScore = itinScore; bottleneckDimension = 'itin'; }
  
  const custScore = getSubScore(lpiSubScores.cust);
  if (custScore < bottleneckScore) { bottleneckScore = custScore; bottleneckDimension = 'cust'; }
  
  const revenueCeilingMultiplier = Math.max(0.5, Math.min(1.0, bottleneckScore / 5));
  
  return { bottleneckScore, bottleneckDimension, revenueCeilingMultiplier };
}

export function calcCountryTensionProxy(globalWTI: number, frictionScore: number): {
  countryTension: number;
  tensionLabel: 'PEACETIME' | 'ELEVATED' | 'CRISIS' | 'WAR FOOTING';
} {
  const countryTension = globalWTI * (frictionScore / 10);
  let tensionLabel: 'PEACETIME' | 'ELEVATED' | 'CRISIS' | 'WAR FOOTING' = 'PEACETIME';
  
  if (countryTension > 80) tensionLabel = 'WAR FOOTING';
  else if (countryTension > 50) tensionLabel = 'CRISIS';
  else if (countryTension > 25) tensionLabel = 'ELEVATED';
  
  return { countryTension, tensionLabel };
}

