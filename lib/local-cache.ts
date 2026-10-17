import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CACHE_DIR = path.join(os.homedir(), '.v0-equity-analysis');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');

try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.error('[localCache] Failed to create cache directory:', e);
}

interface EphemeralEntry {
  value: any;
  createdAt: number;
}

class PersistentCache {
  private persistentCache: Map<string, any>;
  private ephemeralCache: Map<string, EphemeralEntry>;
  private readonly MAX_PERSISTENT_ITEMS = 20;
  private readonly MAX_EPHEMERAL_ITEMS = 200;
  private readonly EPHEMERAL_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

  constructor() {
    this.persistentCache = new Map<string, any>();
    this.ephemeralCache = new Map<string, EphemeralEntry>();
    this.loadFromDisk();
  }

  private isEphemeral(key: string): boolean {
    return key.startsWith('diag_') || 
           key.startsWith('llm_err_') || 
           key.startsWith('cache_err_') || 
           key.startsWith('deep_research_') ||
           key.startsWith('geo_');
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const raw = fs.readFileSync(CACHE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        for (const [key, value] of Object.entries(parsed)) {
          if (!this.isEphemeral(key)) {
            this.persistentCache.set(key, value);
          }
        }
        console.log(`[localCache] Loaded ${this.persistentCache.size} companies from cache at ${CACHE_FILE}`);
        this.enforcePersistentLimit();
      }
    } catch (e) {
      console.error('[localCache] Failed to load cache from disk:', e);
    }
  }

  private saveToDisk() {
    try {
      const obj: Record<string, any> = {};
      for (const [key, value] of this.persistentCache.entries()) {
        obj[key] = value;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf8');
    } catch (e) {
      console.error('[localCache] Failed to save cache to disk:', e);
    }
  }

  private enforcePersistentLimit() {
    if (this.persistentCache.size <= this.MAX_PERSISTENT_ITEMS) return;

    // Convert map to array, sort by analyzedAt (if present), keep newest
    const entries = Array.from(this.persistentCache.entries());
    
    // Sort oldest first, so we delete from the beginning of the sorted list
    entries.sort((a, b) => {
      const dateA = a[1]?.analyzedAt ? new Date(a[1].analyzedAt).getTime() : 0;
      const dateB = b[1]?.analyzedAt ? new Date(b[1].analyzedAt).getTime() : 0;
      return dateA - dateB;
    });

    const itemsToRemove = entries.length - this.MAX_PERSISTENT_ITEMS;
    let deletedCount = 0;
    
    for (let i = 0; i < itemsToRemove; i++) {
      this.persistentCache.delete(entries[i][0]);
      deletedCount++;
    }

    if (deletedCount > 0) {
       console.log(`[localCache] Evicted ${deletedCount} old items to maintain ${this.MAX_PERSISTENT_ITEMS} max limit.`);
       this.saveToDisk();
    }
  }

  has(key: string): boolean {
    if (this.isEphemeral(key)) {
      const entry = this.ephemeralCache.get(key);
      if (!entry) return false;
      if (Date.now() - entry.createdAt > this.EPHEMERAL_TTL_MS) {
        this.ephemeralCache.delete(key);
        return false;
      }
      return true;
    }
    return this.persistentCache.has(key);
  }

  get(key: string): any {
    if (this.isEphemeral(key)) {
      const entry = this.ephemeralCache.get(key);
      if (!entry) return undefined;
      if (Date.now() - entry.createdAt > this.EPHEMERAL_TTL_MS) {
        this.ephemeralCache.delete(key);
        return undefined;
      }
      return entry.value;
    }
    return this.persistentCache.get(key);
  }

  set(key: string, value: any): this {
    if (this.isEphemeral(key)) {
      this.ephemeralCache.set(key, { value, createdAt: Date.now() });
      this.enforceEphemeralLimit();
    } else {
      this.persistentCache.set(key, value);
      this.enforcePersistentLimit();
      this.saveToDisk();
    }
    return this;
  }

  private enforceEphemeralLimit() {
    if (this.ephemeralCache.size <= this.MAX_EPHEMERAL_ITEMS) return;
    // Evict oldest entries first
    const entries = Array.from(this.ephemeralCache.entries());
    entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
    const toRemove = entries.length - this.MAX_EPHEMERAL_ITEMS;
    for (let i = 0; i < toRemove; i++) {
      this.ephemeralCache.delete(entries[i][0]);
    }
  }

  delete(key: string): boolean {
    if (this.isEphemeral(key)) {
      return this.ephemeralCache.delete(key);
    } else {
      const res = this.persistentCache.delete(key);
      if (res) this.saveToDisk();
      return res;
    }
  }

  *entries(): IterableIterator<[string, any]> {
    // Return all items as a generator, unwrapping ephemeral entries
    yield* this.persistentCache.entries();
    for (const [key, entry] of this.ephemeralCache.entries()) {
      yield [key, entry.value] as [string, any];
    }
  }

  clear(): void {
    this.persistentCache.clear();
    this.ephemeralCache.clear();
    this.saveToDisk();
  }
}

export const localCache = new PersistentCache();
