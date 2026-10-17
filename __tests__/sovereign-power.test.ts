import { describe, it, expect } from 'vitest';
import { 
  SovereignPowerService, 
  SUPERPOWER_BENCHMARKS, 
  GLOBAL_AVERAGE_SCORES, 
  DEFCON_LEVELS 
} from '@/lib/services/sovereign-power-service';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { WargameShocks } from '@/lib/types/sovereign-power';

describe('SovereignPowerService - Calculation Engine & Dalio 6 Pillars (T03.8)', () => {
  it('should return valid benchmark scores for Global Average and Superpowers (US, CN, RU)', () => {
    const globalAvg = SovereignPowerService.getGlobalAverageScores();
    expect(globalAvg.techInnovation).toBe(GLOBAL_AVERAGE_SCORES.techInnovation);
    expect(globalAvg.militaryCapacity).toBe(GLOBAL_AVERAGE_SCORES.militaryCapacity);
    expect(globalAvg.currencyHegemony).toBe(GLOBAL_AVERAGE_SCORES.currencyHegemony);

    const usScores = SovereignPowerService.getBenchmarkScores('US');
    expect(usScores.techInnovation).toBe(SUPERPOWER_BENCHMARKS.US.scores.techInnovation);
    expect(usScores.currencyHegemony).toBe(SUPERPOWER_BENCHMARKS.US.scores.currencyHegemony);
    expect(usScores.militaryCapacity).toBe(SUPERPOWER_BENCHMARKS.US.scores.militaryCapacity);


    const cnScores = SovereignPowerService.getBenchmarkScores('CN');
    expect(cnScores.tradeCompetitiveness).toBe(98);
    expect(cnScores.techInnovation).toBe(90);

    const ruScores = SovereignPowerService.getBenchmarkScores('RU');
    expect(ruScores.militaryCapacity).toBe(92);
    expect(ruScores.currencyHegemony).toBe(42);
  });

  it('should calculate weighted composite sovereign power index accurately', () => {
    const scores = {
      techInnovation: 80,
      politicalCabinet: 70,
      currencyHegemony: 90,
      tradeCompetitiveness: 85,
      militaryCapacity: 95,
      institutionalStability: 75
    };
    // 80*0.22 + 90*0.20 + 95*0.22 + 85*0.16 + 70*0.10 + 75*0.10
    // 17.6 + 18.0 + 20.9 + 13.6 + 7.0 + 7.5 = 84.6 => 85
    const composite = SovereignPowerService.calculateCompositePowerIndex(scores);
    expect(composite).toBe(85);
  });

  it('should calculate geopolitical leverage index with asymmetric offensive weighting', () => {
    const scores = {
      techInnovation: 90,
      politicalCabinet: 60,
      currencyHegemony: 80,
      tradeCompetitiveness: 70,
      militaryCapacity: 100,
      institutionalStability: 60
    };
    // 100*0.30 + 90*0.25 + 80*0.25 + 70*0.20
    // 30 + 22.5 + 20 + 14 = 86.5 => 87
    const leverage = SovereignPowerService.calculateGeopoliticalLeverage(scores);
    expect(leverage).toBe(87);
  });

  it('should evaluate DEFCON alert status dynamically based on severity and shocks', () => {
    // Normal peacetime
    const defconNormal = SovereignPowerService.calculateDefconStatus(80, {
      defenseShock: 0,
      tradeShock: 0,
      currencyShock: 0,
      techShock: 0
    }, 40);
    expect(defconNormal.level).toBe(DEFCON_LEVELS[5].level);
    expect(defconNormal.codeName).toBe(DEFCON_LEVELS[5].codeName);


    // Escalated military shock triggers DEFCON 3 or lower
    const defconAlert = SovereignPowerService.calculateDefconStatus(60, {
      defenseShock: 45,
      tradeShock: -35,
      currencyShock: 0,
      techShock: -35
    }, 80);
    expect([1, 2, 3]).toContain(defconAlert.level);
    expect(defconAlert.color).toBeDefined();
  });

  it('should retrieve full calibrated profile for United States', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    expect(profile.countryCode).toBe('US');
    expect(profile.flag).toBe('🇺🇸');
    expect(profile.dossiers.tech.wipoPatentRank).toBe(2);
    expect(profile.dossiers.currency.currencyCode).toBe('USD');
    expect(profile.dossiers.currency.dalioSpread.isBeautifulDeleveraging).toBe(true);
    expect(profile.dossiers.military.nuclearDeterrence.warheadCount).toBeGreaterThan(5000);
    expect(profile.dossiers.cabinet.headOfState.name).toBe('Joe Biden');
    expect(profile.dossiers.cabinet.defenseMinister.name).toBe('Lloyd Austin');
  });

  it('should retrieve full calibrated profile for China with semiconductor and trade data', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('CN');
    expect(profile.countryCode).toBe('CN');
    expect(profile.flag).toBe('🇨🇳');
    expect(profile.dossiers.trade.tradeBalanceBillionUSD).toBeGreaterThan(500);
    expect(profile.dossiers.tech.subsectors.industrial.score).toBe(99);
    expect(profile.dossiers.cabinet.dominantFaction).toBe('Comité Permanente del Politburó');
  });

  it('should retrieve full calibrated profile for Russia with wartime economy data', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('RU');
    expect(profile.countryCode).toBe('RU');
    expect(profile.flag).toBe('🇷🇺');
    expect(profile.dossiers.currency.swiftStatus).toBe('SANCTIONED_EXCLUDED');
    expect(profile.dossiers.currency.dalioSpread.isBeautifulDeleveraging).toBe(false);
    expect(profile.dossiers.military.nuclearDeterrence.warheadCount).toBeGreaterThan(5000);
  });

  it('should procedurally generate realistic profile for other indexed countries (e.g. Mexico or Spain)', () => {
    const profileMX = SovereignPowerService.getCountrySovereignProfile('MX');
    expect(profileMX.countryCode).toBe('MX');
    expect(profileMX.baseScores.techInnovation).toBeGreaterThan(20);
    expect(profileMX.dossiers.currency.currencyCode).toBe('MXX');
    expect(profileMX.compositePowerIndex).toBeGreaterThan(0);
  });

  it('should access sovereign profile via GeopoliticalKnowledgeService facade', () => {
    const profile = GeopoliticalKnowledgeService.getSovereignPowerProfile('US');
    expect(profile).toBeDefined();
    expect(profile.countryCode).toBe('US');
    expect(profile.compositePowerIndex).toBeGreaterThan(80);
  });
});

describe('SovereignPowerService - Wargame Stress Testing & Shocks', () => {
  it('should warp radar polygon and recalculate leverage under defense shock', () => {
    const baseScores = SovereignPowerService.getBenchmarkScores('US');
    const shocks: WargameShocks = {
      defenseShock: 30, // +30% defense surge
      tradeShock: 0,
      currencyShock: 0,
      techShock: 0
    };

    const sim = SovereignPowerService.simulateWargame(baseScores, shocks, 'US');
    expect(sim.warpedScores.militaryCapacity).toBeGreaterThanOrEqual(baseScores.militaryCapacity);
    expect(sim.tacticalLogs.length).toBeGreaterThan(0);
    expect(sim.warpedLeverage).toBeGreaterThan(0);
  });

  it('should degrade tech and military scores under tech embargo shock', () => {
    const baseScores = SovereignPowerService.getBenchmarkScores('CN');
    const shocks: WargameShocks = {
      defenseShock: 0,
      tradeShock: 0,
      currencyShock: 0,
      techShock: -40 // -40% tech embargo
    };

    const sim = SovereignPowerService.simulateWargame(baseScores, shocks, 'CN');
    expect(sim.warpedScores.techInnovation).toBeLessThan(baseScores.techInnovation);
    expect(sim.warpedScores.militaryCapacity).toBeLessThan(baseScores.militaryCapacity);
    expect(sim.leverageDelta).toBeLessThan(0);
    expect(sim.tacticalLogs.some(log => log.includes('EMBARGO TECNOLÓGICO'))).toBe(true);
  });

  it('should degrade currency and stability under negative currency shock', () => {
    const baseScores = SovereignPowerService.getBenchmarkScores('RU');
    const shocks: WargameShocks = {
      defenseShock: 0,
      tradeShock: 0,
      currencyShock: -40, // -40% currency devaluation
      techShock: 0
    };

    const sim = SovereignPowerService.simulateWargame(baseScores, shocks, 'RU');
    expect(sim.warpedScores.currencyHegemony).toBeLessThan(baseScores.currencyHegemony);
    expect(sim.warpedScores.institutionalStability).toBeLessThan(baseScores.institutionalStability);
    expect(sim.tacticalLogs.some(log => log.includes('SHOCK CAMBIARIO'))).toBe(true);
  });
});

describe('SovereignPowerService - Cabinet Reshuffle Mechanics', () => {
  it('should apply cabinet replacements, update doctrine and alter sovereign scores', () => {
    const baseProfile = SovereignPowerService.getCountrySovereignProfile('US');
    expect(baseProfile.dossiers.cabinet.defenseMinister.name).toBe('Lloyd Austin');

    // Appoint hawk Pete Hegseth as Defense Secretary
    const reshuffled = SovereignPowerService.getCountrySovereignProfile('US', {
      DEFENSE: 'us_rep_hawk_secdef'
    });

    expect(reshuffled.dossiers.cabinet.defenseMinister.name).toBe('Pete Hegseth');
    expect(reshuffled.dossiers.cabinet.defenseMinister.ideologyAlignment).toBe('HAWK');
    // Hawk replacement increases military capacity (+5) and decreases stability (-6)
    expect(reshuffled.baseScores.militaryCapacity).toBeGreaterThanOrEqual(baseProfile.baseScores.militaryCapacity);
    expect(reshuffled.baseScores.institutionalStability).toBeLessThan(baseProfile.baseScores.institutionalStability);
  });

  it('should apply trade protectionist finance replacement and update doctrine', () => {
    const baseProfile = SovereignPowerService.getCountrySovereignProfile('US');
    const reshuffled = SovereignPowerService.getCountrySovereignProfile('US', {
      FINANCE: 'us_rep_trade_finance'
    });

    expect(reshuffled.dossiers.cabinet.financeMinister.name).toBe('Scott Bessent');
    expect(reshuffled.dossiers.cabinet.financeMinister.name).not.toBe(baseProfile.dossiers.cabinet.financeMinister.name);
    expect(reshuffled.dossiers.cabinet.financeMinister.faction).toContain('Proteccionismo Arancelario');

  });

  it('should provide and apply realistic cabinet replacements for procedural nations (e.g. Argentina)', () => {
    const baseAR = SovereignPowerService.getCountrySovereignProfile('AR');
    expect(baseAR.countryCode).toBe('AR');
    expect(baseAR.dossiers.cabinet.availableReplacements.length).toBeGreaterThanOrEqual(3);

    // Verify candidate roles include DEFENSE, FINANCE, and FOREIGN_SECURITY
    const roles = baseAR.dossiers.cabinet.availableReplacements.map(r => r.targetRole);
    expect(roles).toContain('DEFENSE');
    expect(roles).toContain('FINANCE');
    expect(roles).toContain('FOREIGN_SECURITY');

    // Reshuffle Defense with hawk candidate
    const reshuffled = SovereignPowerService.getCountrySovereignProfile('AR', {
      DEFENSE: 'ar_rep_hawk'
    });
    expect(reshuffled.dossiers.cabinet.defenseMinister.id).toBe('ar_rep_hawk');
    expect(reshuffled.dossiers.cabinet.defenseMinister.ideologyAlignment).toBe('HAWK');
    expect(reshuffled.baseScores.militaryCapacity).toBeGreaterThan(baseAR.baseScores.militaryCapacity);
    expect(reshuffled.baseScores.institutionalStability).toBeLessThan(baseAR.baseScores.institutionalStability);
  });
});

describe('SovereignPowerService - Edge Cases & Compound Macro Stress Testing', () => {
  it('should NOT falsely escalate DEFCON level when defense budget is drastically cut (-50%)', () => {
    const baseScores = SovereignPowerService.getBenchmarkScores('US');
    const shocks: WargameShocks = {
      defenseShock: -50, // Pure disarmament / budget cut
      tradeShock: 0,
      currencyShock: 0,
      techShock: 0
    };

    const sim = SovereignPowerService.simulateWargame(baseScores, shocks, 'US');
    // A peaceful budget cut should degrade military capacity without triggering DEFCON 1 or 2 war alert
    expect(sim.warpedScores.militaryCapacity).toBeLessThan(baseScores.militaryCapacity);
    expect([4, 5]).toContain(sim.defconStatus.level);
    expect(sim.defconStatus.level).not.toBe(1);
    expect(sim.defconStatus.level).not.toBe(2);
  });

  it('should trigger DEFCON 1 (COCKED PISTOL) under simultaneous defense surge (+50%) and currency collapse (-50%) on high-risk country', () => {
    const profileAR = SovereignPowerService.getCountrySovereignProfile('AR');
    const shocks: WargameShocks = {
      defenseShock: 50,  // Full wartime emergency mobilization
      tradeShock: 0,
      currencyShock: -50, // Catastrophic currency devaluation
      techShock: 0
    };

    const sim = SovereignPowerService.simulateWargame(profileAR.baseScores, shocks, 'AR');
    // Compound wartime hyperinflationary crisis must trigger maximum alert (DEFCON 1 or 2)
    expect([1, 2]).toContain(sim.defconStatus.level);
    if (sim.defconStatus.level === 1) {
      expect(sim.defconStatus.codeName).toBe('COCKED PISTOL');
    }
  });

  it('should dynamically invert Dalio spread and diagnose debt spiral during severe currency shock', () => {
    const baseUS = SovereignPowerService.getCountrySovereignProfile('US');
    expect(baseUS.dossiers.currency.dalioSpread.isBeautifulDeleveraging).toBe(true);

    const shocks: WargameShocks = {
      defenseShock: 30,   // Fiscal debt strain from mobilization
      tradeShock: 0,
      currencyShock: -50, // Massive currency devaluation / rate spike
      techShock: 0
    };

    const sim = SovereignPowerService.simulateWargame(baseUS.baseScores, shocks, 'US');
    expect(sim.warpedDalioSpread).toBeDefined();
    // Effective interest rate spikes and compresses spread into negative territory
    expect(sim.warpedDalioSpread!.effectiveInterestRatePercent).toBeGreaterThan(baseUS.dossiers.currency.dalioSpread.effectiveInterestRatePercent);
    expect(sim.warpedDalioSpread!.spreadPercent).toBeLessThan(0);
    expect(sim.warpedDalioSpread!.isBeautifulDeleveraging).toBe(false);
    expect(sim.warpedDalioSpread!.verdictEs).toContain('espiral de deuda soberana');
  });

  it('should normalize country identifiers in simulateWargame for consistent baseline risk evaluation', () => {
    const profileAR = SovereignPowerService.getCountrySovereignProfile('AR');
    // Moderate defense & tech shocks where Argentina baseline risk (7.8) tips severity to DEFCON 2
    const shocks: WargameShocks = {
      defenseShock: 40,
      tradeShock: 0,
      currencyShock: 0,
      techShock: -15
    };

    const simUpper = SovereignPowerService.simulateWargame(profileAR.baseScores, shocks, 'AR');
    const simLower = SovereignPowerService.simulateWargame(profileAR.baseScores, shocks, 'ar');
    const simIso3 = SovereignPowerService.simulateWargame(profileAR.baseScores, shocks, 'ARG');
    const simName = SovereignPowerService.simulateWargame(profileAR.baseScores, shocks, 'Argentina');

    // All variations must resolve to Argentina baseline risk and produce identical DEFCON 2
    expect(simUpper.defconStatus.level).toBe(2);
    expect(simLower.defconStatus.level).toBe(2);
    expect(simIso3.defconStatus.level).toBe(2);
    expect(simName.defconStatus.level).toBe(2);
    expect(simLower.defconStatus.codeName).toBe('FAST PACE');
    expect(simLower.warpedLeverage).toBe(simUpper.warpedLeverage);
  });

  it('should safely handle null, undefined, and empty string identifiers without throwing', () => {
    // Null & undefined handling
    expect(SovereignPowerService.resolveCountryCode(null as any)).toBeNull();
    expect(SovereignPowerService.resolveCountryCode(undefined as any)).toBeNull();
    expect(SovereignPowerService.resolveCountryCode('   ')).toBeNull();

    // Sovereign profile safe fallback to US
    const nullProf = SovereignPowerService.getCountrySovereignProfile(null as any);
    expect(nullProf.countryCode).toBe('US');
    expect(nullProf.flag).toBe('🇺🇸');

    const emptyProf = SovereignPowerService.getCountrySovereignProfile('');
    expect(emptyProf.countryCode).toBe('US');
    expect(emptyProf.flag).toBe('🇺🇸');
  });

  it('should synchronize dossiers.cabinet.score with baseScores.politicalCabinet upon reshuffle', () => {
    const profileAR = SovereignPowerService.getCountrySovereignProfile('AR');
    const initialPolitical = profileAR.baseScores.politicalCabinet;
    expect(profileAR.dossiers.cabinet.score).toBe(initialPolitical);

    // Appoint hawk candidate which increases political/military scores
    const reshuffled = SovereignPowerService.getCountrySovereignProfile('AR', {
      DEFENSE: 'ar_rep_hawk'
    });

    expect(reshuffled.baseScores.politicalCabinet).toBeGreaterThan(initialPolitical);
    // dossiers.cabinet.score must be kept in exact synchronization with baseScores.politicalCabinet
    expect(reshuffled.dossiers.cabinet.score).toBe(reshuffled.baseScores.politicalCabinet);
  });

  it('should protect calculation engines against empty or NaN inputs', () => {
    const emptyScores = {} as any;
    expect(SovereignPowerService.calculateCompositePowerIndex(emptyScores)).toBe(0);
    expect(SovereignPowerService.calculateGeopoliticalLeverage(emptyScores)).toBe(0);

    const nanScores = { techInnovation: NaN } as any;
    expect(SovereignPowerService.calculateCompositePowerIndex(nanScores)).toBe(50);
    expect(SovereignPowerService.calculateGeopoliticalLeverage(nanScores)).toBe(50);

    const defconFromNaN = SovereignPowerService.calculateDefconStatus(NaN);
    expect(defconFromNaN.level).toBe(5);
  });
});

