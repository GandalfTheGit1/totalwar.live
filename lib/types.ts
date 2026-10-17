export type CompanyNetwork = any;

export interface BusinessDivision {
  name: string;
  revenueWeight: number; // Porcentaje de ingresos (0-1)
  operatingMargin: number; // Margen de esta división
  impliedMultiple: number; // Múltiplo de valoración estimado (P/E o EV/EBITDA)
  description: string;
}

export interface EcosystemMetrics {
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  retentionRate: number; // Porcentaje
  arpu: number; // Average Revenue Per User
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  revenue: number; // in millions
  peRatio: number;
  roe: number; // Return on Equity %
  debtToEquity: number;
  operatingMargin: number; // %
  freeCashFlow: number; // in millions
  growthRate: number; // %
  description: string;
  competitiveAdvantage: string;
  managementQuality: string;
  riskFactors: string;
  growthProspects: string;
  businessDivisions?: BusinessDivision[];
  ecosystemMetrics?: EcosystemMetrics;
  is_partial?: boolean;
  research_steps?: any;
  reflexiveAnalysis?: any | null;
  managementScorecard?: ManagementScorecard | null;
  moatAuditV4?: any | null;
}

export interface AnalysisCriteria {
  criterion: string;
  score: number; // 1-10
  evidence: string;
  interpretation: string;
}

export interface CompanyAnalysis {
  companyId: string;
  companyName: string;
  analysisDate: string;
  criteria: AnalysisCriteria[];
  summary: string;
  investmentThesis: string;
  riskAssessment: string;
}

export interface FilterState {
  industry: string | null;
  minMarketCap: number | null;
  maxPERatio: number | null;
  minROE: number | null;
}

export interface SortConfig {
  key: keyof Company;
  direction: "asc" | "desc";
}

// ─── AI Analysis Types (shared between server route and client) ───────────────

export interface MoatPillarScore {
  pillarName: string;
  weight: number;
  axisA: number;
  axisB: number;
  score: number;
  contribution: number;
}

export interface CriteriaScoreResult {
  criteriaId: number;
  score: number;
  evidence: string | string[];
  interpretation: string;
  moatBreakdown?: MoatPillarScore[];
  auditTrail?: {
    systemPrompt: string;
    userPrompt: string;
    rawResponse: string;
  };
  numericalValue?: string | number | null;
  unit?: string;
  factCertainty?: 'High' | 'Medium' | 'Low';
  sourcesCited?: string[];
  predictiveImpact?: string;
}

export type CausalRole = 'EVENT_TRIGGER' | 'IMPACT_MULTIPLIER' | 'QUALITY_FILTER';

export interface OperationalCriterionDefinition {
  id: number;
  name: string;
  category: 'Demanda' | 'Rentabilidad Operativa' | 'Oferta' | 'Liderazgo y Gobierno Corporativo';
  subcategory: 'commercial' | 'production' | 'purchasing' | 'hr';
  description: string;
  details?: string;
  customPrompt?: string;
  scoringType: 'deterministic' | 'hybrid' | 'qualitative_rag';
  predictiveHorizon: '1-3 months';
  unit: string;
  role?: CausalRole;
  secondaryRole?: CausalRole;
}

export interface OperationalCriterionResult {
  criterionId: number;
  score: number; // 1-10
  calculatedValue: number | string | null;
  unit: string;
  factCertainty: 'High' | 'Medium' | 'Low';
  sources: string[];
  predictiveImpact: string;
  evidence?: string | string[];
  interpretation?: string;
}


export type BuffettCategory =
  | 'Demanda'
  | 'Oferta'
  | 'Rentabilidad Operativa'
  | 'Salud del Balance'
  | 'Liderazgo y Gobierno Corporativo'
  | 'Valoración'
  | 'Gobierno & Regulación'
  | 'Integridad Forense & Fraude';

export interface PipelineDiagnostic {
  type: string;     // e.g., 'SEC_RATE_LIMIT', 'LLM_TIMEOUT', 'REDDIT_BLOCKED'
  category: 'Scraping' | 'LLM' | 'Database' | 'Logic';
  message: string;
  severity: 'warning' | 'error' | 'fatal';
}

export interface StockAnalysisPayload {
  ticker: string;
  companyName: string;
  sector: string | null;
  financials: {
    revenue: number | null;
    peRatio: number | null;
    roe: number | null;
    debtToEquity: number | null;
    operatingMargin: number | null;
    freeCashFlow: number | null;
    growthRate: number | null;
  };
  scores: CriteriaScoreResult[];
  overallRecommendation: 'BUY' | 'HOLD' | 'AVOID' | null;
  rationale: string | null;
  decisionTree: any | null;
  treeCp?: any | null;
  treeMp?: any | null;
  treeLp?: any | null;
  timeline: any[] | null;
  valueNetwork: CompanyNetwork | null;
  geographicOperations: any | null;
  socialSentiment: any | null;
  qualitativeTrajectory: any | null;
  fraudAnalysis?: any | null;
  reflexiveAnalysis?: any | null;
  analyzedAt: string;
  fromCache: boolean;
  sources: Array<{ title: string; url: string; snippet: string }>;
  isMock?: boolean;
  fallbackReason?: string;
  serverLogs?: string[];
  fallbackWarnings?: string[];
  brandMoatMetrics?: any | null;
  moatAuditV4?: any | null;
  diagnostics?: PipelineDiagnostic[];
  isPartial?: boolean;
  researchSteps?: { step: string; status: 'success' | 'failed' | 'pending'; errorMsg?: string }[];
  managementScorecard?: ManagementScorecard | null;
  estimatedCost?: number;
  overallScore?: number;
  error?: string;
  detail?: string;

  // ─── Forensic Kill Switch & Integrity ─────────────────────────────────────
  isCriticalFraudAlert?: boolean;
  fraudAlertMessage?: string;
  fraudAlertReason?: string;
  forensicKillSwitchTriggered?: boolean;

  // ─── Dashboard Additions ──────────────────────────────────────────────────
  keyCatalysts?: KeyCatalyst[];
  competitorLandscape?: CompetitorLandscapeItem[];
  shortInterest?: ShortInterestData;
  latestTweets?: LatestTweetItem[];
  greatestRisks?: GreatestRiskItem[];
  leadership?: LeadershipMember[];
  sentimentAnalysis?: SentimentAnalysisData;
  quickValuation?: QuickValuationData;
}

export interface KeyCatalyst {
  date: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface CompetitorLandscapeItem {
  name: string;
  marketShare: number;
  threatLevel: 'High' | 'Medium' | 'Low';
}

export interface ShortInterestData {
  percentage: number;
  daysToCover: number;
  institutionalOwnership: number;
}

export interface LatestTweetItem {
  author: string;
  handle: string;
  content: string;
  date: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface GreatestRiskItem {
  category: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface LeadershipMember {
  name: string;
  role: string;
  alignmentScore: number;
}

export interface SentimentAnalysisData {
  retail: number;
  institutional: number;
  media: number;
  overallText: string;
}

export interface QuickValuationData {
  currentPrice: number;
  intrinsicValue: number;
  safetyMargin: number;
  currency: string;
}

export interface ManagementPillarScore {
  score: number;                          // 0–100
  confidence: 'high' | 'medium' | 'low'; // fact certainty matrix
  evidence: string[];                     // up to 3 bullet-point facts
  redFlags: string[];                     // specific flags detected for this pillar
}

export interface HardRedFlag {
  code: 'INSIDER_SELLING' | 'RECURRING_EBITDA_ADJUSTMENTS' | 'EGO_ACQUISITION'
      | 'CFO_AUDITOR_CHANGE' | 'VOLUME_INCENTIVES' | 'STOCK_PLEDGING';
  triggered: boolean;
  detail: string;
  source: string;
}

export interface ManagementScorecard {
  ticker?: string;
  companyName?: string;
  compositeScore: number;                 // weighted average per manual
  pillar1Alignment: ManagementPillarScore;
  pillar2Influence: ManagementPillarScore;
  pillar3CapitalAllocation: ManagementPillarScore;
  pillar4Architecture: ManagementPillarScore;
  pillar5MindProduct: ManagementPillarScore;
  hardRedFlags: HardRedFlag[];            // §5.2 checklist
  fetchedAt: string;                      // ISO timestamp
}


