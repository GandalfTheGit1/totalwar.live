import { supabase, isSupabaseConfigured } from './supabase';
import { logServer } from './server-logger';
import fs from 'fs';
import path from 'path';
import os from 'os';

const LOCAL_CACHE_DIR = path.join(os.homedir(), '.v0-equity-analysis');
const LOCAL_CACHE_PATH = path.join(LOCAL_CACHE_DIR, 'api_cache.json');
const MAX_CACHE_BYTES = 5 * 1024 * 1024; // 5 MB limit

interface CacheEntry {
  response: any;
  expires_at: string;
  last_accessed?: number;
}

function readLocalCache(): Record<string, CacheEntry> {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_CACHE_PATH)) {
      const cache: Record<string, CacheEntry> = JSON.parse(fs.readFileSync(LOCAL_CACHE_PATH, 'utf8'));
      const now = new Date().getTime();
      let modified = false;

      // TTL Pruning on load
      for (const [key, entry] of Object.entries(cache)) {
        if (new Date(entry.expires_at).getTime() < now) {
          delete cache[key];
          modified = true;
        }
      }

      if (modified) {
        writeLocalCache(cache);
      }
      return cache;
    }
  } catch (e) {
    console.warn(`[API Cache] Error reading local cache file:`, e);
  }
  return {};
}

function writeLocalCache(cache: Record<string, CacheEntry>) {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }

    // TTL Pruning before writing
    const now = Date.now();
    for (const [key, entry] of Object.entries(cache)) {
      if (new Date(entry.expires_at).getTime() < now) {
        delete cache[key];
      }
    }

    // LRU eviction if stringified size exceeds MAX_CACHE_BYTES
    let jsonStr = JSON.stringify(cache);
    if (Buffer.byteLength(jsonStr, 'utf8') > MAX_CACHE_BYTES) {
      const entries = Object.entries(cache).sort((a, b) => {
        const timeA = a[1].last_accessed || 0;
        const timeB = b[1].last_accessed || 0;
        return timeA - timeB; // Oldest / least recently used first
      });

      while (entries.length > 0 && Buffer.byteLength(JSON.stringify(Object.fromEntries(entries)), 'utf8') > MAX_CACHE_BYTES) {
        const evicted = entries.shift();
        if (evicted) {
          delete cache[evicted[0]];
        }
      }
      jsonStr = JSON.stringify(cache);
      logServer('API Cache', `🧹 LRU Eviction applied: pruned cache to fit within ${MAX_CACHE_BYTES / 1024 / 1024}MB limit.`, 'info');
    }

    fs.writeFileSync(LOCAL_CACHE_PATH, jsonStr, 'utf8');
  } catch (e) {
    console.warn(`[API Cache] Error writing local cache file:`, e);
  }
}

/**
 * Gets a cached API response from the database if it exists and hasn't expired.
 */
export async function getCachedApiResponse(cacheKey: string): Promise<any | null> {
  try {
    if (!isSupabaseConfigured) {
      const localCache = readLocalCache();
      const entry = localCache[cacheKey];
      if (!entry) {
        return null;
      }
      if (new Date(entry.expires_at) < new Date()) {
        logServer('API Cache', `Local cache expired for ${cacheKey}`, 'info');
        delete localCache[cacheKey];
        writeLocalCache(localCache);
        return null;
      }
      // Update last accessed time for LRU
      entry.last_accessed = Date.now();
      writeLocalCache(localCache);

      logServer('API Cache', `✅ Local Cache HIT for ${cacheKey}`, 'success');
      return entry.response;
    }

    const { data, error } = await supabase
      .from('api_responses_cache')
      .select('response, expires_at')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) {
      return null;
    }

    if (new Date(data.expires_at) < new Date()) {
      // Expired, let it be cleaned up eventually or overwritten
      logServer('API Cache', `Cache expired for ${cacheKey}`, 'info');
      return null;
    }

    logServer('API Cache', `✅ Cache HIT for ${cacheKey}`, 'success');
    return data.response;
  } catch (err) {
    console.error(`[API Cache] Error getting cache for ${cacheKey}:`, err);
    return null;
  }
}

/**
 * Saves an API response to the database cache.
 * @param ttlHours TTL in hours. If -1, effectively cache indefinitely (e.g. 10 years).
 */
export async function setCachedApiResponse(
  cacheKey: string,
  provider: string,
  endpoint: string,
  response: any,
  ttlHours: number
): Promise<void> {
  try {
    const expiresAt = new Date();
    if (ttlHours === -1) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    } else {
      expiresAt.setHours(expiresAt.getHours() + ttlHours);
    }

    if (!isSupabaseConfigured) {
      const localCache = readLocalCache();
      localCache[cacheKey] = {
        response,
        expires_at: expiresAt.toISOString(),
        last_accessed: Date.now(),
      };
      writeLocalCache(localCache);
      logServer('API Cache', `💾 Local Cache saved for ${cacheKey} (expires at ${expiresAt.toISOString()})`, 'info');
      return;
    }

    const { error } = await supabase
      .from('api_responses_cache')
      .upsert({
        cache_key: cacheKey,
        provider,
        endpoint,
        response,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'cache_key' });

    if (error) {
      console.error(`[API Cache] Error setting cache for ${cacheKey}:`, error);
    } else {
      logServer('API Cache', `💾 Cache saved for ${cacheKey} (expires at ${expiresAt.toISOString()})`, 'info');
    }
  } catch (err) {
    console.error(`[API Cache] Error saving cache for ${cacheKey}:`, err);
  }
}
