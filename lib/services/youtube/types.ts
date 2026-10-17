export interface YoutubeVideo {
  id: string;
  title: string;
  published: string; // ISO String or similar date representation
  description?: string;
  views?: number;
}

export interface ClassificationResult {
  related: boolean;
  ticker?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  reason?: string;
  contentType?: 'earnings_call' | 'analysis' | 'news' | 'opinion' | 'market_overview';
}

export interface YoutubeVideoItem {
  id: string;
  title: string;
  published: string;
  publishedText?: string;
  views: number;
  description?: string;
}

export interface CeoInterviewResult {
  /** Score reflecting focus on product experience vs financial engineering metrics (0-100). */
  productInstinctScore: number;
  /** Adaptability, speed of learning, and absence of sunk-cost trap attachment (0-100). */
  learningVelocityScore: number;
  /** Composure and structural analysis when discussing failure states (0-100). */
  resilienceScore: number;
  /** Influencia en redes sociales (0-10, donde 10 es Elon Musk, 0 es CEO desconocido) */
  socialInfluenceScore?: number;
  /** Detalles de la influencia en redes sociales */
  socialInfluenceDetails?: string;
  /** Key verbatim comments illustrating these aspects. */
  keyQuotes: string[];
  /** High-level evidence summaries. */
  evidence: string[];
  /** Number of podcast transcripts parsed. */
  videosAnalyzed: number;
}
