/**
 * lib/services/sovereign-power-service.ts
 *
 * Sovereign Power Calculation Engine, Cabinet Intelligence, and Tactical Wargame Simulator.
 * Module M03 (Tasks T03.8 & T03.9).
 *
 * Implements Ray Dalio's 6 Sovereign Empire Pillars:
 * 1. Tecnología e Innovación (Económico, Industrial, Militar, Semiconductores, IA)
 * 2. Política y Gabinete (Liderazgo, Facciones, Doctrina, Reemplazos de Gabinete)
 * 3. Hegemonía de la Moneda (Divisa de reserva, SWIFT, Reservas de Oro/FX, Spread Dalio PIBn vs EIR)
 * 4. Comercio y Competitividad (Balanza comercial, Socios críticos, Vulnerabilidad arancelaria)
 * 5. Capacidad Militar (Presupuesto defensa % PIB, Alianzas, Disuasión nuclear/naval, Chokepoints)
 * 6. Estabilidad Institucional (Estado de derecho, Cohesión interna, Riesgo de fractura o golpe)
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores, 
  WargameShocks, 
  WargameSimulationResult, 
  DefconStatus, 
  BenchmarkSuperpower 
} from '../types/sovereign-power';
import { 
  GLOBAL_AVERAGE_SCORES, 
  SUPERPOWER_BENCHMARKS, 
  DEFCON_LEVELS 
} from './sovereign-power/benchmarks';
import { 
  calculateCompositePowerIndex, 
  calculateGeopoliticalLeverage, 
  calculateDefconStatus 
} from './sovereign-power/calculations';
import { 
  resolveCountryCode, 
  resolveCountryBaseData 
} from './sovereign-power/country-resolver';
import { applyCabinetReshuffle } from './sovereign-power/cabinet-engine';
import { simulateWargame } from './sovereign-power/wargame-simulator';
import { buildProfileForCountry } from './sovereign-power/profiles';

export { GLOBAL_AVERAGE_SCORES, SUPERPOWER_BENCHMARKS, DEFCON_LEVELS };

/**
 * SovereignPowerService Facade
 * Central entry point for sovereign radar scores, wargame simulations, and cabinet reshuffles.
 */
export class SovereignPowerService {
  /**
   * Returns benchmark scores for Global Average.
   */
  static getGlobalAverageScores(): SovereignRadarScores {
    return { ...GLOBAL_AVERAGE_SCORES };
  }

  /**
   * Returns benchmark scores for designated Superpowers (US, CN, RU).
   */
  static getBenchmarkScores(superpower: BenchmarkSuperpower): SovereignRadarScores {
    const benchmark = SUPERPOWER_BENCHMARKS[superpower];
    if (!benchmark) {
      console.warn(`[SovereignPowerService] Unknown superpower benchmark: ${superpower}, fallback to US`);
      return { ...SUPERPOWER_BENCHMARKS.US.scores };
    }
    return { ...benchmark.scores };
  }

  /**
   * Calculates the weighted composite power index (0-100) based on Dalio's weights.
   */
  static calculateCompositePowerIndex(scores: SovereignRadarScores): number {
    return calculateCompositePowerIndex(scores);
  }

  /**
   * Calculates geopolitical leverage index (0-100).
   * Measures asymmetric offensive and defensive leverage across global systems.
   */
  static calculateGeopoliticalLeverage(scores: SovereignRadarScores): number {
    return calculateGeopoliticalLeverage(scores);
  }

  /**
   * Determines the DEFCON alert level based on leverage, active shocks, and composite stability.
   */
  static calculateDefconStatus(
    compositeScore: number, 
    shocks?: WargameShocks, 
    worldTension: number = 45,
    baselineRisk: number = 3.0
  ): DefconStatus {
    return calculateDefconStatus(compositeScore, shocks, worldTension, baselineRisk);
  }

  /**
   * Applies non-linear wargame shock testing to radar scores.
   */
  static simulateWargame(
    baseScores: SovereignRadarScores, 
    shocks: WargameShocks,
    countryCode?: string
  ): WargameSimulationResult {
    return simulateWargame(
      baseScores, 
      shocks, 
      countryCode, 
      (code) => this.getCountrySovereignProfile(code)
    );
  }

  /**
   * Resolves country code from ISO2, ISO3, QID or common name.
   */
  static resolveCountryCode(identifier: string): string | null {
    return resolveCountryCode(identifier);
  }

  /**
   * Retrieves or computes full Sovereign Power Profile with all 6 dimensions & Cabinet intelligence.
   * If `appointedCabinet` is passed, replaces ministers and recalculates doctrinal stability.
   */
  static getCountrySovereignProfile(
    countryIdentifier?: string | null,
    appointedCabinet?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>
  ): CountrySovereignPowerProfile {
    const rawCode = (countryIdentifier && typeof countryIdentifier === 'string') ? countryIdentifier.trim() : '';
    const code = this.resolveCountryCode(rawCode) || rawCode.toUpperCase() || 'US';
    console.log(`[SovereignPowerService] Resolving sovereign profile for: ${code}`);

    const baseData = resolveCountryBaseData(code);
    const rawProfile = buildProfileForCountry(baseData);

    if (appointedCabinet && Object.keys(appointedCabinet).length > 0) {
      applyCabinetReshuffle(rawProfile.dossiers.cabinet, rawProfile.baseScores, appointedCabinet);
      rawProfile.compositePowerIndex = this.calculateCompositePowerIndex(rawProfile.baseScores);
      rawProfile.geopoliticalLeverageIndex = this.calculateGeopoliticalLeverage(rawProfile.baseScores);
    }

    return rawProfile;
  }
}
