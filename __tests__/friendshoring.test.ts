/**
 * @file __tests__/friendshoring.test.ts
 * @description Unit & Engine Test Suite for Friendshoring & Critical Raw Materials (T03.4).
 * Validates deterministic math, bilateral friction filter (< 4.0), Haversine distances,
 * treaty alliance matches (NATO, USMCA, QUAD, FiveEyes), and structured substitution arcs.
 */

import { describe, it, expect } from 'vitest';
import {
  FriendshoringService,
  CRITICAL_COMMODITIES_REGISTRY,
  COUNTRY_CENTROIDS,
  calculateHaversineDistance,
  getCountryCentroid,
} from '@/lib/services/geographic/friendshoring-service';

describe('T03.4: Friendshoring Engine & Mathematical Viability (friendshoring.test.ts)', () => {
  // ─── 1. Registry of Critical Raw Materials ──────────────────────────────────
  describe('Critical Commodities Registry (9 Required Commodities)', () => {
    it('should model exactly all 9 critical commodities required by the specification', () => {
      const commodities = FriendshoringService.getAllCommodities();
      expect(commodities).toHaveLength(9);

      const ids = commodities.map((c) => c.id);
      expect(ids).toContain('rare-earths');
      expect(ids).toContain('lithium');
      expect(ids).toContain('cobalt');
      expect(ids).toContain('nickel');
      expect(ids).toContain('copper');
      expect(ids).toContain('gallium-germanium');
      expect(ids).toContain('graphite');
      expect(ids).toContain('semiconductors');
      expect(ids).toContain('oil-gas');
    });

    it('should retrieve individual commodities by ID with complete metadata', () => {
      const lithium = FriendshoringService.getCommodityById('lithium');
      expect(lithium).toBeDefined();
      expect(lithium?.name).toContain('Litio');
      expect(lithium?.category).toBe('Metals');
      expect(lithium?.vulnerableOrigins.length).toBeGreaterThan(0);
      expect(lithium?.viableSubstitutes.length).toBeGreaterThan(0);

      const origins = lithium!.vulnerableOrigins.map((o) => o.countryCode);
      expect(origins).toContain('CN');

      const substitutes = lithium!.viableSubstitutes.map((s) => s.countryCode);
      expect(substitutes).toContain('AU');
      expect(substitutes).toContain('CL');
      expect(substitutes).toContain('CA');
    });

    it('should return undefined for non-existent commodity IDs', () => {
      const notFound = FriendshoringService.getCommodityById('uranium_xyz' as any);
      expect(notFound).toBeUndefined();
    });
  });

  // ─── 2. Centroids and Haversine Distance ─────────────────────────────────────
  describe('Geographic Centroids & Haversine Distance Formula', () => {
    it('should resolve centroids with valid coordinates for all key geopolitical nations', () => {
      const keyCountries = ['US', 'CA', 'CN', 'AU', 'CL', 'CD', 'RU', 'TW', 'JP', 'DE', 'NO'];
      for (const iso of keyCountries) {
        const centroid = getCountryCentroid(iso);
        expect(centroid).toBeDefined();
        expect(Number.isFinite(centroid.lat)).toBe(true);
        expect(Number.isFinite(centroid.lng)).toBe(true);
        expect(centroid.lat).toBeGreaterThanOrEqual(-90);
        expect(centroid.lat).toBeLessThanOrEqual(90);
        expect(centroid.lng).toBeGreaterThanOrEqual(-180);
        expect(centroid.lng).toBeLessThanOrEqual(180);
      }
    });

    it('should resolve centroids when provided ISO-3 or country names', () => {
      const fromIso3 = getCountryCentroid('CHN');
      const fromIso2 = getCountryCentroid('CN');
      expect(fromIso3).toEqual(fromIso2);

      const fromUsaIso3 = getCountryCentroid('USA');
      const fromUsaIso2 = getCountryCentroid('US');
      expect(fromUsaIso3).toEqual(fromUsaIso2);
    });

    it('should return 0 km distance between identical coordinates', () => {
      const point = { lat: 37.0902, lng: -95.7129 };
      const dist = calculateHaversineDistance(point, point);
      expect(dist).toBe(0);
    });

    it('should compute accurate Haversine distance between US and Canada centroids', () => {
      const us = COUNTRY_CENTROIDS.US;
      const ca = COUNTRY_CENTROIDS.CA;
      const dist = calculateHaversineDistance(us, ca);
      expect(dist).toBeGreaterThan(2000);
      expect(dist).toBeLessThan(3000);
    });

    it('should compute large trans-oceanic distance between Australia and US', () => {
      const au = COUNTRY_CENTROIDS.AU;
      const us = COUNTRY_CENTROIDS.US;
      const dist = calculateHaversineDistance(au, us);
      expect(dist).toBeGreaterThan(13000);
      expect(dist).toBeLessThan(17000);
    });

    it('should fallback gracefully for unknown country codes', () => {
      const fallback = getCountryCentroid('UNKNOWN_XYZ');
      expect(fallback).toEqual({ lat: 20, lng: 0 });
    });
  });

  // ─── 3. Feasibility Score & Strict Friction Threshold (< 4.0) ───────────────
  describe('Friendshoring Feasibility Index & Bilateral Friction Filter', () => {
    it('should strictly disqualify candidates with friction >= 4.0 by returning score 0', () => {
      expect(
        FriendshoringService.computeFeasibilityScore({
          frictionScore: 4.0,
          productionCapacityScore: 95,
          distanceKm: 500,
          allianceCount: 3,
        })
      ).toBe(0);

      expect(
        FriendshoringService.computeFeasibilityScore({
          frictionScore: 7.8,
          productionCapacityScore: 100,
          distanceKm: 200,
          allianceCount: 2,
        })
      ).toBe(0);
    });

    it('should produce a high feasibility score (> 80) for ideal allies (friction 1.0, high capacity)', () => {
      const score = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 92,
        distanceKm: 2500,
        allianceCount: 3,
      });
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize long geographic distances (Nearshoring factor)', () => {
      const nearScore = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 85,
        distanceKm: 1200, // Nearshoring
        allianceCount: 2,
      });

      const farScore = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 85,
        distanceKm: 15000, // Distant
        allianceCount: 2,
      });

      expect(nearScore).toBeGreaterThan(farScore);
    });

    it('should award a bonus for shared defense/trade alliances and 0 for no alliances', () => {
      const withAlliances = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.2,
        productionCapacityScore: 80,
        distanceKm: 5000,
        allianceCount: 4, // NATO, G7, USMCA, FiveEyes
      });

      const withoutAlliances = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.2,
        productionCapacityScore: 80,
        distanceKm: 5000,
        allianceCount: 0,
      });

      expect(withAlliances).toBeGreaterThan(withoutAlliances);
    });
  });

  // ─── 4. Structured Substitution Arcs Generation ─────────────────────────────
  describe('Substitution Arcs Generation (`getSubstitutionArcs`)', () => {
    it('should generate arcs conforming strictly to the required schema', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US');
      expect(arcs.length).toBeGreaterThan(0);

      for (const arc of arcs) {
        expect(arc).toHaveProperty('id');
        expect(arc).toHaveProperty('originCountry');
        expect(arc).toHaveProperty('substituteCountry');
        expect(arc).toHaveProperty('commodity', 'rare-earths');
        expect(arc).toHaveProperty('feasibilityScore');
        expect(arc).toHaveProperty('frictionScore');
        expect(arc).toHaveProperty('distanceKm');
        expect(arc).toHaveProperty('sourceCoords');
        expect(arc).toHaveProperty('targetCoords');
        expect(arc).toHaveProperty('allianceMatch');

        // All arcs must adhere to strict safe ally threshold < 4.0
        expect(arc.frictionScore).toBeLessThan(4.0);
        expect(arc.feasibilityScore).toBeGreaterThan(0);
        expect(arc.feasibilityScore).toBeLessThanOrEqual(100);
        expect(arc.distanceKm).toBeGreaterThan(0);
        expect(arc.sourceCoords.lat).toBeDefined();
        expect(arc.targetCoords.lat).toBeDefined();
      }
    });

    it('should accurately populate real alliance treaties (NATO, USMCA, FiveEyes, etc.)', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US');
      const canadaArc = arcs.find((a) => a.substituteCountry === 'CA');
      expect(canadaArc).toBeDefined();
      // Canada and US share NATO, USMCA, FiveEyes, G7, OECD
      expect(canadaArc?.allianceMatch).toContain('NATO');
      expect(canadaArc?.allianceMatch).toContain('USMCA');
      expect(canadaArc?.allianceMatch).toContain('FiveEyes');

      const australiaArc = arcs.find((a) => a.substituteCountry === 'AU');
      expect(australiaArc).toBeDefined();
      // Australia and US share FiveEyes, QUAD, OECD
      expect(australiaArc?.allianceMatch).toContain('FiveEyes');
      expect(australiaArc?.allianceMatch).toContain('QUAD');
    });

    it('should sort arcs by feasibility score descending', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('lithium', 'US');
      expect(arcs.length).toBeGreaterThan(1);
      for (let i = 0; i < arcs.length - 1; i++) {
        expect(arcs[i].feasibilityScore).toBeGreaterThanOrEqual(arcs[i + 1].feasibilityScore);
      }
    });

    it('should substitute China (CN) with safe allies for Rare Earths', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US');
      const originCodes = new Set(arcs.map((a) => a.originCountry));
      expect(originCodes.has('CN')).toBe(true);

      const subCodes = arcs.map((a) => a.substituteCountry);
      expect(subCodes).toContain('AU'); // Lynas Mt Weld
      expect(subCodes).toContain('CA'); // Vital Metals / Nechalacho
      expect(subCodes).toContain('US'); // Mountain Pass MP Materials
    });

    it('should substitute Taiwan (TW) foundry with US/JP/DE/KR for Advanced Semiconductors', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('semiconductors', 'US');
      const originCodes = new Set(arcs.map((a) => a.originCountry));
      expect(originCodes.has('TW')).toBe(true);

      const subCodes = arcs.map((a) => a.substituteCountry);
      expect(subCodes).toContain('US');
      expect(subCodes).toContain('JP');
      expect(subCodes).toContain('DE');
      expect(subCodes).toContain('KR');
    });

    it('should resolve origin filtering with ISO-2, ISO-3, and country names', () => {
      const fromIso2 = FriendshoringService.getFriendshoringAlternativesForOrigin('CN', 'gallium-germanium', 'US');
      const fromIso3 = FriendshoringService.getFriendshoringAlternativesForOrigin('CHN', 'gallium-germanium', 'US');
      const fromName = FriendshoringService.getFriendshoringAlternativesForOrigin('China', 'gallium-germanium', 'US');

      expect(fromIso2.length).toBeGreaterThan(0);
      expect(fromIso3).toEqual(fromIso2);
      expect(fromName).toEqual(fromIso2);
    });

    it('should return an empty array for an invalid origin country with getFriendshoringAlternativesForOrigin', () => {
      const empty = FriendshoringService.getFriendshoringAlternativesForOrigin('NON_EXISTENT_ISO');
      expect(empty).toEqual([]);
    });

    it('should produce a tactical executive summary with getFriendshoringSummary', () => {
      const summary = FriendshoringService.getFriendshoringSummary('copper', 'US');
      expect(summary.commodity).toBeDefined();
      expect(summary.totalArcs).toBeGreaterThan(0);
      expect(summary.averageFeasibility).toBeGreaterThan(0);
      expect(summary.topAlternative).toBeDefined();
      expect(summary.arcs).toHaveLength(summary.totalArcs);
    });
  });
});
