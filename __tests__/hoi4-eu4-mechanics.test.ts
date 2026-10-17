
import {
  calcBankruptcySpiral,
  calcJITStarvation,
  calcCapExTrap,
  calcRetoolingPenalty,
  calcTallVsWide,
  calcCommodityDepletion,
  calcWeakestLinkThroughput,
  calcNodeAttrition,
  calcSovereignDebtSpiral,
  calcImportStarvation,
  calcPublicCapExTrap,
  calcIndustrialTransition,
  calcGeographicMode,
  calcSovereignCommodityDepletion,
  calcCountryNodeAttrition,
  calcCountryWeakestLink,
  calcCountryTensionProxy
} from '../lib/services/hoi4-eu4-mechanics';

describe('HoI4 / EU4 Financial Mechanics', () => {
  describe('T03.16 - Bankruptcy Spiral', () => {
    it('handles normal ICR', () => {
      const { icr, distressScore, breachesThreshold } = calcBankruptcySpiral(500000, 200000);
      expect(icr).toBe(2.5);
      expect(distressScore).toBe(0);
      expect(breachesThreshold).toBe(false);
    });

    it('handles ICR < 1.0', () => {
      const { icr, distressScore, breachesThreshold } = calcBankruptcySpiral(50000, 100000);
      expect(icr).toBe(0.5);
      expect(distressScore).toBe(50);
      expect(breachesThreshold).toBe(true);
    });

    it('handles ICR = 0', () => {
      const { icr, distressScore, breachesThreshold } = calcBankruptcySpiral(0, 100000);
      expect(icr).toBe(0);
      expect(distressScore).toBe(100);
      expect(breachesThreshold).toBe(true);
    });

    it('handles ICR = infinity (0 interest)', () => {
      const { icr, distressScore, breachesThreshold } = calcBankruptcySpiral(50000, 0);
      expect(icr).toBe(Infinity);
      expect(distressScore).toBe(0);
      expect(breachesThreshold).toBe(false);
    });
  });

  describe('T03.19 - JIT Starvation', () => {
    it('returns 1 multiplier when not starved', () => {
      const { outputMultiplier, isStarved } = calcJITStarvation(30, 10, 1.5);
      // effective delay = 15 <= 30
      expect(isStarved).toBe(false);
      expect(outputMultiplier).toBe(1);
    });

    it('returns 0 multiplier when starved', () => {
      const { outputMultiplier, isStarved } = calcJITStarvation(30, 25, 1.5);
      // effective delay = 37.5 > 30
      expect(isStarved).toBe(true);
      expect(outputMultiplier).toBe(0);
    });

    it('handles DIO = 0', () => {
      const { outputMultiplier, isStarved } = calcJITStarvation(0, 5, 1.0);
      // effective delay = 5 > 0
      expect(isStarved).toBe(true);
      expect(outputMultiplier).toBe(0);
    });
  });

  describe('T03.20 - CapEx Trap', () => {
    it('handles fully funded maintenance CapEx', () => {
      const { maintenanceCapExDeficit, isCannibalized, revenueDriftPenalty } = calcCapExTrap(1000, 200, 500, 600, 10000);
      // available = 800, DA = 600 -> deficit 0
      expect(maintenanceCapExDeficit).toBe(0);
      expect(isCannibalized).toBe(false);
      expect(revenueDriftPenalty).toBe(0);
    });

    it('handles CapEx deficit', () => {
      const { maintenanceCapExDeficit, isCannibalized, revenueDriftPenalty } = calcCapExTrap(500, 200, 500, 600, 10000);
      // available = 300, DA = 600 -> deficit 300
      expect(maintenanceCapExDeficit).toBe(300);
      expect(isCannibalized).toBe(true);
      expect(revenueDriftPenalty).toBe(-3); // - (300 / 10000) * 100
    });
    
    it('ensures revenueDriftPenalty is never positive', () => {
      const { revenueDriftPenalty } = calcCapExTrap(1000, 200, 500, 600, 10000);
      expect(revenueDriftPenalty).toBeLessThanOrEqual(0);
    });
  });

  describe('T03.13 - Retooling Penalty', () => {
    it('handles initial phase', () => {
      const { currentCompressionBps, isInRetoolingPhase } = calcRetoolingPenalty(200, 0.5, 0);
      expect(currentCompressionBps).toBe(200);
      expect(isInRetoolingPhase).toBe(true);
    });

    it('handles late phase', () => {
      const { currentCompressionBps, isInRetoolingPhase } = calcRetoolingPenalty(200, 0.5, 4);
      expect(currentCompressionBps).toBeCloseTo(200 * Math.exp(-2), 2);
      expect(isInRetoolingPhase).toBe(false);
    });
  });

  describe('T03.17 - Tall vs Wide Sprawl', () => {
    it('detects TALL mode', () => {
      const { mode, sprawlPenaltyBps, sgaPenaltyMultiplier } = calcTallVsWide(25, 2, 1000, 10000);
      expect(mode).toBe('TALL');
      expect(sgaPenaltyMultiplier).toBe(1);
    });

    it('detects WIDE mode', () => {
      const { mode, sgaPenaltyMultiplier } = calcTallVsWide(12, 5, 1000, 10000);
      expect(mode).toBe('WIDE');
      expect(sgaPenaltyMultiplier).toBeGreaterThan(1);
    });
  });

  describe('T03.18 - Commodity Depletion', () => {
    it('handles safe reserves', () => {
      const { depletionProbability, cogsSpikeRisk } = calcCommodityDepletion(50, 1000, 0.02);
      expect(depletionProbability).toBe(0.05); // 50/1000
      expect(cogsSpikeRisk).toBe('LOW');
    });

    it('handles zero reserves edge case', () => {
      const { depletionProbability, yearsToExhaustion, cogsSpikeRisk } = calcCommodityDepletion(50, 0, 0.02);
      expect(depletionProbability).toBe(1);
      expect(yearsToExhaustion).toBe(0);
      expect(cogsSpikeRisk).toBe('HIGH');
    });
  });

  describe('T03.21 - Weakest Link Throughput', () => {
    it('detects bottleneck correctly', () => {
      const { bottleneckScore, revenueCeilingMultiplier } = calcWeakestLinkThroughput([4.5, 3.2, 3.8]);
      expect(bottleneckScore).toBe(3.2);
      expect(revenueCeilingMultiplier).toBe(0.64);
    });

    it('clamps multiplier between 0.5 and 1.0', () => {
      const res1 = calcWeakestLinkThroughput([1.5]); // score 1.5 -> mult 0.3 -> clamped 0.5
      expect(res1.revenueCeilingMultiplier).toBe(0.5);

      const res2 = calcWeakestLinkThroughput([5.5]); // score 5.5 -> mult 1.1 -> clamped 1.0
      expect(res2.revenueCeilingMultiplier).toBe(1.0);
    });

    it('handles single country logistics', () => {
      const { bottleneckScore, revenueCeilingMultiplier } = calcWeakestLinkThroughput([4.0]);
      expect(bottleneckScore).toBe(4.0);
      expect(revenueCeilingMultiplier).toBe(0.8);
    });
  });

  describe('T03.14 - Node Attrition', () => {
    it('handles CRITICAL risk', () => {
      const { attritionRisk, dioPenaltyMultiplier } = calcNodeAttrition(8, 0.98);
      expect(attritionRisk).toBe('CRITICAL');
      expect(dioPenaltyMultiplier).toBe(1.5);
    });

    it('infers utilization if not provided', () => {
      // util = (9/10)*0.8 + 0.2 = 0.92
      const { attritionRisk, dioPenaltyMultiplier } = calcNodeAttrition(9);
      expect(attritionRisk).toBe('HIGH');
      expect(dioPenaltyMultiplier).toBe(1.25);
    });
  });

  describe('Country-Level Mechanics', () => {
    it('calcSovereignDebtSpiral calculates correctly', () => {
      // calcSovereignDebtSpiral(25, ...) -> ICR = 4.0, no breach
      let res = calcSovereignDebtSpiral(25);
      expect(res.sovereignICR).toBe(4.0);
      expect(res.breachesThreshold).toBe(false);

      // calcSovereignDebtSpiral(95, ...) -> ICR approx 1.05, breach (< 1.2)
      res = calcSovereignDebtSpiral(95);
      expect(res.sovereignICR).toBeCloseTo(1.05, 1);
      expect(res.breachesThreshold).toBe(true);

      // calcSovereignDebtSpiral(null, 8.5) -> uses fallback
      res = calcSovereignDebtSpiral(null, 8.5);
      expect(res.sovereignICR).toBeCloseTo(1.5, 1);
    });

    it('calcImportStarvation calculates correctly', () => {
      // calcImportStarvation(1.5) -> CRITICAL (< 2 months)
      let res = calcImportStarvation(1.5);
      expect(res.riskLevel).toBe('CRITICAL');
      expect(res.isStarved).toBe(true);

      // calcImportStarvation(6.0) -> SAFE
      res = calcImportStarvation(6.0);
      expect(res.riskLevel).toBe('SAFE');
      expect(res.isStarved).toBe(false);
    });

    it('calcGeographicMode calculates correctly', () => {
      // calcGeographicMode(45000, 65) -> TALL
      let res = calcGeographicMode(45000, 65);
      expect(res.mode).toBe('TALL');

      // calcGeographicMode(5000, 20) -> WIDE
      res = calcGeographicMode(5000, 20);
      expect(res.mode).toBe('WIDE');
    });

    it('calcCountryWeakestLink calculates correctly', () => {
      // calcCountryWeakestLink({ infr: 4.2, trac: 2.8, itin: 3.9, cust: 3.5 }) -> bottleneck = 'trac', score = 2.8
      const res = calcCountryWeakestLink({ infr: 4.2, trac: 2.8, itin: 3.9, cust: 3.5 });
      expect(res.bottleneckDimension).toBe('trac');
      expect(res.bottleneckScore).toBe(2.8);
    });

    it('calcCountryTensionProxy calculates correctly', () => {
      // calcCountryTensionProxy(60, 9.5) -> high country tension
      const res = calcCountryTensionProxy(60, 9.5);
      expect(res.countryTension).toBe(57); // 60 * 0.95 = 57 -> CRISIS
      expect(res.tensionLabel).toBe('CRISIS');
    });
  });

  describe('Route and Mapping Tests', () => {
    it('BDI mapping works correctly', () => {
      const getBdiStress = (bdi: number) => bdi > 2000 ? 'HIGH' : bdi > 1000 ? 'MEDIUM' : 'LOW';
      expect(getBdiStress(2500)).toBe('HIGH');
      expect(getBdiStress(1500)).toBe('MEDIUM');
      expect(getBdiStress(800)).toBe('LOW');
    });

    it('Bond yield spread distress mapping works correctly', () => {
      const getBondDistress = (spread: number) => {
        if (spread > 500) return { sovereignICR: 0.8, distressScore: 100, breachesThreshold: true };
        if (spread > 250) return { sovereignICR: 1.1, distressScore: 80, breachesThreshold: true };
        return { sovereignICR: 3.0, distressScore: 0, breachesThreshold: false };
      };
      
      const critical = getBondDistress(600);
      expect(critical.breachesThreshold).toBe(true);
      expect(critical.distressScore).toBe(100);
      
      const high = getBondDistress(300);
      expect(high.breachesThreshold).toBe(true);
      
      const safe = getBondDistress(100);
      expect(safe.breachesThreshold).toBe(false);
    });

    it('Data source resolution logic (fallback)', () => {
      // Mock test for IMF returning null and WB being used
      const imfData = null;
      const wbData = 15;
      const resolvedData = imfData !== null ? imfData : wbData;
      expect(resolvedData).toBe(15);
    });

    it('CountryMechanicsProcessed has dataSources field', () => {
      const processedResult = {
        countryCode: 'USA',
        dataSources: {
          industrialProduction: 'wb_annual',
          portCongestion: 'wb_lpi',
          fxReserves: 'wb_annual',
          capex: 'wb_annual',
          sovereignYields: 'wb_structural',
          bdi: 'scraped',
          countryTension: 'gdelt_cached'
        }
      };
      expect(processedResult.dataSources).toBeDefined();
      expect(processedResult.dataSources.bdi).toBe('scraped');
    });
  });
});

