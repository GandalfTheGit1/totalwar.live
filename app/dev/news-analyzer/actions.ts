'use server';

/**
 * @file actions.ts
 * @description Server actions for fetching country videos and geopolitical news.
 */

import { searchSingleYouTubeQuery } from '@/lib/youtube-helper';

export interface NewsAnalysisEvent {
  eventTitle: string;
  sourceType: string;
  category: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impactScore: number;
  summary: string;
  rationale: string;
  affectedDimensions: string[];
  date?: string;
  url?: string;
}

export async function fetchCountryEconomyVideosAction(countryName: string, limit = 5) {
  try {
    const queries = [
      `What is happening in ${countryName}'s economy right now`,
      `${countryName} economy current situation 2026`,
      countryName
    ];

    const results = [];
    for (const q of queries) {
      const res = await searchSingleYouTubeQuery(q, 4);
      results.push(res);
      await new Promise(r => setTimeout(r, 1000));
    }
    const flatResults = results.flat();
    
    const seen = new Set();
    const uniqueVideos: any[] = [];
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const countryLower = countryName.toLowerCase();

    for (const v of flatResults) {
      if (v && v.id && !seen.has(v.id)) {
        seen.add(v.id);
        
        let publishedDate;
        try {
          publishedDate = new Date(v.published);
        } catch {
          publishedDate = new Date();
        }
        
        if (publishedDate < oneYearAgo) continue;
        
        const titleLower = v.title ? v.title.toLowerCase() : '';
        if (!titleLower.includes(countryLower)) continue;

        uniqueVideos.push(v);
      }
    }

    uniqueVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
    return { success: true, videos: uniqueVideos.slice(0, limit) };
  } catch (error: any) {
    console.error("Error in fetchCountryEconomyVideosAction:", error);
    return { success: false, error: error.message || 'Error al buscar videos del país' };
  }
}
