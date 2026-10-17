import { CountryMacroData } from '@/components/dev/geopolitical-monitor/types';

export interface DimensionAnalysis {
  score: number; // 1-10
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  keyInsights: string[];
  vulnerabilities: string[];
}

export interface CountryExtendedDimensions {
  iso: string;
  name: string;
  lastUpdated: string; // ISO datetime
  
  // Hard Power (1-5)
  // 1. Economic Capacity & Relations (Already handled by MacroData)
  macroDataRef?: CountryMacroData; 
  
  // 2. Defense Capability & Networks
  defenseAndAlliances: DimensionAnalysis;
  
  // 3. Cyber & Technological Superiority 
  techAndCyber: DimensionAnalysis;
  
  // 4. Critical Resources Control
  resourceControl: DimensionAnalysis;
  
  // 5. Hard Power Will & Projection
  militaryProjection: DimensionAnalysis;
  
  // Soft Power (6-11)
  // 6. Cultural Influence & Diplomatic Presence
  diplomaticInfluence: DimensionAnalysis;
  
  // 7. Rule of Law & Institutional Stability
  institutionalStability: DimensionAnalysis;
  
  // 8. International Narrative & Legitimacy 
  narrativeControl: DimensionAnalysis;
  
  // 9. Attractiveness (Capital, Talent, Tourism)
  attractiveness: DimensionAnalysis;
  
  // 10. Private & Corporate Influence
  corporateInfluence: DimensionAnalysis;
  
  // 11. Soft Power Vulnerability
  softPowerVulnerability: DimensionAnalysis;
  
  // Systemic Vulnerabilities (12-14)
  // 12. Demographic & Social Fractures
  demographicSocialRisk: DimensionAnalysis;
  
  // 13. Systemic Economic Vulnerability
  systemicEconomicRisk: DimensionAnalysis;
  
  // 14. Bilateral Relation Matrix (Handled by Global Matrix)
}
