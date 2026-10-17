/**
 * lib/services/sovereign-power/wargame-simulator.ts
 *
 * Tactical Wargame Simulation Engine.
 * Executes non-linear shock stress-testing on sovereign radar pillars,
 * warp polygon deformation, DEFCON escalations, and Ray Dalio macro debt spread shifts.
 */

import { 
  SovereignRadarScores, 
  WargameShocks, 
  WargameSimulationResult,
  CountrySovereignPowerProfile 
} from '../../types/sovereign-power';
import { GEOPOLITICAL_45_COUNTRIES } from '../../data/geopolitical-countries';
import { 
  calculateCompositePowerIndex, 
  calculateGeopoliticalLeverage, 
  calculateDefconStatus 
} from './calculations';
import { resolveCountryCode } from './country-resolver';

/**
 * Applies defense budget shock and calculates military/fiscal secondary impacts.
 */
function applyDefenseShock(
  warped: SovereignRadarScores, 
  baseScores: SovereignRadarScores, 
  shockPercent: number, 
  logs: string[]
): void {
  if (shockPercent === 0) return;
  const defMultiplier = 1 + (shockPercent / 100);
  warped.militaryCapacity = Math.round(Math.min(100, Math.max(5, baseScores.militaryCapacity * defMultiplier)));
  
  if (shockPercent > 25) {
    warped.currencyHegemony = Math.max(5, warped.currencyHegemony - Math.round(shockPercent * 0.15));
    logs.push(`[ORDEN DE MOVILIZACIÓN]: Expansión del presupuesto militar al +${shockPercent}%. Alerta de estrés fiscal soberano.`);
  } else if (shockPercent < -20) {
    logs.push(`[RECORTE DEFENSIVO]: Reducción de gasto militar (-${Math.abs(shockPercent)}%). Erosión en disuasión de ultramar.`);
  }
}

/**
 * Applies trade shock and calculates tariff vulnerability and current account impacts.
 */
function applyTradeShock(
  warped: SovereignRadarScores, 
  baseScores: SovereignRadarScores, 
  shockPercent: number, 
  logs: string[]
): void {
  if (shockPercent === 0) return;
  const tradeMultiplier = 1 + (shockPercent / 100);
  warped.tradeCompetitiveness = Math.round(Math.min(100, Math.max(5, baseScores.tradeCompetitiveness * tradeMultiplier)));

  if (shockPercent < 0) {
    warped.currencyHegemony = Math.max(5, warped.currencyHegemony - Math.round(Math.abs(shockPercent) * 0.1));
    logs.push(`[BARRERAS ARANCELARIAS]: Impacto de aranceles punitivos de ${shockPercent}%. Contracción de cuota comercial exterior.`);
  } else {
    logs.push(`[APERTURA COMERCIAL]: Expansión de tratados bilaterales (+${shockPercent}%). Mejora en balanza de cuenta corriente.`);
  }
}

/**
 * Applies currency shock and evaluates FX reserves, capital flight, and institutional strain.
 */
function applyCurrencyShock(
  warped: SovereignRadarScores, 
  baseScores: SovereignRadarScores, 
  shockPercent: number, 
  logs: string[]
): void {
  if (shockPercent === 0) return;
  const curMultiplier = 1 + (shockPercent / 100);
  warped.currencyHegemony = Math.round(Math.min(100, Math.max(5, baseScores.currencyHegemony * curMultiplier)));

  if (shockPercent < 0) {
    warped.institutionalStability = Math.max(5, warped.institutionalStability - Math.round(Math.abs(shockPercent) * 0.18));
    logs.push(`[SHOCK CAMBIARIO]: Devaluación / alza desordenada de tipos de interés (${shockPercent}%). Fractura en coste de capital.`);
  } else {
    logs.push(`[FORTALECIMIENTO DIVISA]: Inyecciones de reservas y demanda soberana (+${shockPercent}%).`);
  }
}

/**
 * Applies tech shock (chip embargoes, AI export bans, or R&D acceleration).
 */
function applyTechShock(
  warped: SovereignRadarScores, 
  baseScores: SovereignRadarScores, 
  shockPercent: number, 
  logs: string[]
): void {
  if (shockPercent === 0) return;
  const techMultiplier = 1 + (shockPercent / 100);
  warped.techInnovation = Math.round(Math.min(100, Math.max(5, baseScores.techInnovation * techMultiplier)));

  if (shockPercent < 0) {
    warped.militaryCapacity = Math.max(5, warped.militaryCapacity - Math.round(Math.abs(shockPercent) * 0.12));
    logs.push(`[EMBARGO TECNOLÓGICO]: Veto de semiconductores e IA aplicada (${shockPercent}%). Obsolescencia en sistemas de guiado.`);
  } else {
    logs.push(`[SALTO I+D DISRUPTIVO]: Aceleración en clusters de supercómputo y litografía (+${shockPercent}%).`);
  }
}

/**
 * Calculates warped Dalio macro spread under debt stress.
 */
function computeWarpedDalioSpread(
  countryCode: string,
  shocks: WargameShocks,
  logs: string[],
  getCountryProfileFn?: (code: string) => CountrySovereignPowerProfile
): WargameSimulationResult['warpedDalioSpread'] | undefined {
  if (!getCountryProfileFn) return undefined;
  try {
    const fullProf = getCountryProfileFn(countryCode);
    const baseDalio = fullProf.dossiers.currency.dalioSpread;
    const eirHike = shocks.currencyShock < 0 ? Number((Math.abs(shocks.currencyShock) * 0.08).toFixed(1)) : 0;
    const defenseDebtEir = shocks.defenseShock > 25 ? Number((shocks.defenseShock * 0.03).toFixed(1)) : 0;
    const gdpImpact = shocks.currencyShock < 0 ? Number((shocks.currencyShock * 0.04).toFixed(1)) : Number((shocks.currencyShock * 0.02).toFixed(1));

    const warpedNominalGdp = Number((baseDalio.nominalGdpGrowthPercent + gdpImpact).toFixed(1));
    const warpedEir = Number((baseDalio.effectiveInterestRatePercent + eirHike + defenseDebtEir).toFixed(1));
    const warpedSpread = Number((warpedNominalGdp - warpedEir).toFixed(1));
    const isBeautiful = warpedSpread >= 0;

    if (!isBeautiful && baseDalio.isBeautifulDeleveraging) {
      logs.push(`[ALERTA MACRO DALIO]: Spread PIB vs Tasa Efectiva invertido (${warpedSpread}%). Alerta de desapalancamiento feo (Ugly Deleveraging).`);
    }

    return {
      nominalGdpGrowthPercent: warpedNominalGdp,
      effectiveInterestRatePercent: warpedEir,
      spreadPercent: warpedSpread,
      isBeautifulDeleveraging: isBeautiful,
      verdictEs: isBeautiful
        ? `Spread Dalio positivo (+${warpedSpread}%). Crecimiento supera el coste de la deuda: Desapalancamiento hermoso (Beautiful Deleveraging).`
        : `Spread Dalio negativo (${warpedSpread}%). Tasa efectiva superior al crecimiento: Riesgo crítico de espiral de deuda soberana (Ugly Deleveraging).`
    };
  } catch (err) {
    console.warn(`[SovereignPowerService] Could not compute warped Dalio spread:`, err);
    return undefined;
  }
}

/**
 * Applies non-linear wargame shock testing to sovereign radar scores.
 */
export function simulateWargame(
  baseScores: SovereignRadarScores, 
  shocks: WargameShocks,
  countryCode?: string,
  getCountryProfileFn?: (code: string) => CountrySovereignPowerProfile
): WargameSimulationResult {
  const resolvedCode = countryCode 
    ? (resolveCountryCode(countryCode) || countryCode.toUpperCase()) 
    : undefined;
  console.log(`[SovereignPowerService] Simulating wargame shocks for ${resolvedCode || 'NATION'}:`, shocks);

  const warped: SovereignRadarScores = { ...baseScores };
  const tacticalLogs: string[] = [];

  applyDefenseShock(warped, baseScores, shocks.defenseShock, tacticalLogs);
  applyTradeShock(warped, baseScores, shocks.tradeShock, tacticalLogs);
  applyCurrencyShock(warped, baseScores, shocks.currencyShock, tacticalLogs);
  applyTechShock(warped, baseScores, shocks.techShock, tacticalLogs);

  const baseCountry = resolvedCode ? GEOPOLITICAL_45_COUNTRIES.find(c => c.code === resolvedCode) : null;
  const baselineRisk = baseCountry ? baseCountry.sovereignRiskBase : 3.0;

  const originalLeverage = calculateGeopoliticalLeverage(baseScores);
  const warpedLeverage = calculateGeopoliticalLeverage(warped);
  const leverageDelta = warpedLeverage - originalLeverage;
  const defconStatus = calculateDefconStatus(calculateCompositePowerIndex(warped), shocks, 45, baselineRisk);

  const warpedDalioSpread = resolvedCode 
    ? computeWarpedDalioSpread(resolvedCode, shocks, tacticalLogs, getCountryProfileFn) 
    : undefined;

  return {
    originalScores: baseScores,
    warpedScores: warped,
    originalLeverage,
    warpedLeverage,
    leverageDelta,
    activeShocks: shocks,
    defconStatus,
    tacticalLogs,
    warpedDalioSpread
  };
}
