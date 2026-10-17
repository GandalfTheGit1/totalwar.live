export interface SocialComment {
  id: string;
  author: string;
  avatarSeed: string; // Used for consistent placeholder avatars
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: 'reddit' | 'x';
  likes: number;
  timeAgo: string;
  isBigFigure?: boolean;
  authorFollowers?: number;
  authorName?: string;
  isVerified?: boolean;
  url?: string;
  influencerRank?: number;
  influencerScore?: number;
  influencerReliability?: string;
  influencerRole?: string;
  influencerRegion?: string;
}

export interface KeywordInfo {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface CategorizedKeywords {
  categoryName: string; // e.g., "Productos", "Líderes", "Industria y Foso"
  items: KeywordInfo[];
}

export interface SocialMediaAnalysisData {
  companyId: string;
  sentimentScore: number; // 0 to 100
  sentimentRatio: {
    positive: number; // %
    neutral: number;  // %
    negative: number; // %
  };
  totalComments: number;
  trendingKeywords: CategorizedKeywords[];
  aiSummary: {
    consensus: string;
    positives: string[];
    negatives: string[];
  };
  comments: SocialComment[];
}
