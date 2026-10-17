import { createClient } from '@supabase/supabase-js';
import { systemEvents } from './system-events';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const isSupabaseConfigured = 
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

const customFetch = async (url: string | URL | Request, options?: RequestInit) => {
  const actualUrl = typeof url === 'string' ? url : (url instanceof Request ? url.url : url.toString());

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      let table = 'unknown';
      if (actualUrl.includes('/rest/v1/')) {
        table = actualUrl.split('/rest/v1/')[1]?.split('?')[0] || table;
      } else if (actualUrl.includes('/rpc/')) {
        table = 'rpc:' + (actualUrl.split('/rpc/')[1]?.split('?')[0] || 'unknown');
      }
      
      const method = options?.method || 'GET';
      
      if (globalThis._systemEvents) {
        globalThis._systemEvents.emit('log', {
          timestamp: new Date().toTimeString().slice(0, 8),
          source: 'Supabase',
          message: `[DB Route] ${method} -> ${table}`,
          type: 'api'
        });
      }
    } catch (e) {
      console.error('Error emitting system event for Supabase route:', e);
    }
  }
  
  const maxRetries = 5;
  let delay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Retry on transient 5xx server errors
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Supabase] Server error ${response.status} on attempt ${attempt}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      
      return response;
    } catch (error: any) {
      const isTransientError = 
        error.message?.includes('fetch failed') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'EADDRINUSE' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.cause?.code === 'ECONNRESET' ||
        error.cause?.code === 'ETIMEDOUT' ||
        error.cause?.code === 'EADDRINUSE' ||
        error.cause?.code === 'ECONNREFUSED' ||
        error.cause?.code === 'ENOTFOUND' ||
        error.cause?.message?.includes('fetch failed');
        
      if (isTransientError && attempt < maxRetries) {
        console.warn(`[Supabase] Network/fetch error on attempt ${attempt}: ${error.message || error} (cause: ${error.cause?.message || 'none'}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      
      console.error(`[Supabase] customFetch error for ${actualUrl} (attempt ${attempt}/${maxRetries}):`, error);
      
      // Build a detailed message including URL and cause to aid troubleshooting
      let errMsg = error.message || String(error);
      const cause = error.cause;
      if (cause) {
        const causeDetail = cause.message || cause.code || String(cause);
        errMsg += ` (cause: ${causeDetail})`;
      }
      
      const enhancedError = new Error(`${error.name || 'TypeError'}: ${errMsg} [URL: ${actualUrl}]`);
      (enhancedError as any).cause = cause;
      (enhancedError as any).code = error.code;
      throw enhancedError;
    }
  }
  
  throw new Error('[Supabase] Max retries reached');
};

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: customFetch
  }
});

// ─── Types matching the Supabase schema ──────────────────────────────────────

export interface DBCompany {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  description: string | null;
  revenue: number | null;
  pe_ratio: number | null;
  roe: number | null;
  debt_to_equity: number | null;
  operating_margin: number | null;
  free_cash_flow: number | null;
  growth_rate: number | null;
  overall_recommendation: string | null;
  rationale: string | null;
  
  decision_tree: any | null;
  tree_cp: any | null;
  tree_mp: any | null;
  
  tree_lp: any | null;
  
  capital_allocation: any | null;
  bias_analysis: any | null;



  timeline: any | null;
  value_network: any | null;
  geographic_operations: any | null;
  social_sentiment: any | null;
  qualitative_trajectory: any | null;
  overall_score: number | null;
  category_averages: any | null;
  brand_moat_metrics: any | null;
  updated_at: string;
}

export interface DBCriteriaScore {
  id: string;
  company_id: string;
  criteria_id: number;
  score: number;
  evidence: string | null;
  interpretation: string | null;
}
