/**
 * app/api/macro/[country]/helpers/cache-manager.ts
 *
 * Supabase cache read and write operations for country macro payloads.
 */

import { supabase } from '@/lib/supabase';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCachedMacroPayload(
  countryCode: string,
  period: string
): Promise<any | null> {
  try {
    const { data: cached, error } = await supabase
      .from('macro_country_cache')
      .select('payload, fetched_at')
      .eq('country_code', countryCode)
      .eq('period', period)
      .eq('stale', false)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached && !error) {
      const fetchedAt = new Date(cached.fetched_at).getTime();
      const ageMs = Date.now() - fetchedAt;
      if (ageMs < SEVEN_DAYS_MS) {
        console.log(`[MacroAPI] ✅ Cache HIT for ${countryCode} (Period: ${period})`);
        return cached.payload;
      }
    }
  } catch (dbErr) {
    console.warn(`[MacroAPI] Database cache check failed:`, dbErr);
  }
  return null;
}

export async function saveMacroPayloadToCache(
  countryCode: string,
  period: string,
  payload: any,
  isFred: boolean
): Promise<void> {
  try {
    await supabase.from('macro_country_cache').upsert(
      {
        country_code: countryCode,
        data_source: isFred ? 'fred' : 'trading-economics',
        period,
        payload,
        stale: false,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'country_code,data_source,period' }
    );
    console.log(`[MacroAPI] Saved macro payload for ${countryCode} in DB Cache (period: ${period})`);
  } catch (saveErr) {
    console.error(`[MacroAPI] Database cache write failed:`, saveErr);
  }
}
