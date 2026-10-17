/**
 * @file lib/cache/geo-indexeddb-cache.ts
 * @description High-performance hybrid client-side cache for macroeconomic and geopolitical data.
 * Architecture:
 * - L1: In-memory Map (0ms synchronous access, ensuring 60fps interaction during globe inspection).
 * - L2: Browser IndexedDB (persistent client storage across sessions, single-user platform).
 * - Fallback: Graceful synchronous/asynchronous in-memory fallback when window.indexedDB is unavailable
 *   (e.g., SSR, Node.js, Happy-DOM, private browsing, quota errors).
 * - TTL: Granular time-to-live per entry with automatic expiration pruning.
 * - Store Versioning: Versioned database schema and record validation against dbVersion.
 * - Memory Cap & LRU Eviction: Prevents memory leaks by bounding L1 entry count.
 * - Self-Healing Quota Recovery: Automatically prunes expired records if IndexedDB encounters QuotaExceededError.
 */

import { openDatabase } from './geo-indexeddb/idb-connector';
import {
  clearIdbStore,
  deleteRecordFromIdb,
  pruneExpiredFromIdb,
  readAllRecordsFromIdb,
  readRecordFromIdb,
  writeRecordToIdb
} from './geo-indexeddb/idb-operations';
import { MemoryL1Cache } from './geo-indexeddb/memory-l1';
import {
  GEO_CACHE_TTLS,
  geoCacheKeys,
  GeoCacheConfig,
  GeoCacheRecord
} from './geo-indexeddb/types';

export type { GeoCacheRecord, GeoCacheConfig };
export { GEO_CACHE_TTLS, geoCacheKeys };

export class GeoIndexedDbCache {
  private readonly memoryL1 = new MemoryL1Cache();
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isFallbackMode: boolean = false;
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly dbVersion: number;
  private readonly defaultTtlMs: number;
  private readonly maxL1Entries: number;

  constructor(config?: GeoCacheConfig) {
    this.dbName = config?.dbName ?? 'equity_geo_macro_db';
    this.storeName = config?.storeName ?? 'geo_macro_store';
    this.dbVersion = config?.dbVersion ?? 1;
    this.defaultTtlMs = config?.defaultTtlMs ?? GEO_CACHE_TTLS.DEFAULT;
    this.maxL1Entries = config?.maxL1Entries ?? 300;
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (this.isFallbackMode || typeof window === 'undefined') return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = openDatabase(
      this.dbName,
      this.storeName,
      this.dbVersion,
      () => { this.isFallbackMode = true; },
      () => { this.dbPromise = null; }
    );

    return this.dbPromise;
  }

  public getSync<T>(key: string): T | null {
    return this.memoryL1.getSync<T>(key, this.dbVersion, (k) => {
      this.deleteFromIdb(k).catch(() => {});
    });
  }

  public hasSync(key: string): boolean {
    return this.getSync(key) !== null;
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!key || typeof key !== 'string') return null;
    const now = Date.now();

    const memHit = this.getSync<T>(key);
    if (memHit !== null) return memHit;

    if (this.isFallbackMode || typeof window === 'undefined') return null;

    try {
      const db = await this.getDb();
      if (!db) return null;

      const record = await readRecordFromIdb<T>(db, this.storeName, key);
      if (!record || record.expiresAt <= now || record.version !== this.dbVersion) {
        if (record) await this.deleteFromIdb(key);
        return null;
      }

      this.memoryL1.enforceCapacity(this.maxL1Entries, this.dbVersion);
      this.memoryL1.setRecord(key, record as GeoCacheRecord<unknown>);
      return record.data;
    } catch (err) {
      console.warn(`[GeoIndexedDBCache] Unexpected error during get("${key}"):`, err);
      return null;
    }
  }

  private async persistToIdbWithRetry<T>(record: GeoCacheRecord<T>): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    try {
      await writeRecordToIdb(db, this.storeName, record as GeoCacheRecord<unknown>);
    } catch (writeErr: unknown) {
      const isQuota = writeErr && typeof writeErr === 'object' && 'name' in writeErr && (writeErr as { name: unknown }).name === 'QuotaExceededError';
      if (isQuota) {
        console.warn('[GeoIndexedDBCache] Storage quota exceeded; pruning expired records and retrying...');
        await this.pruneExpired();
        try {
          await writeRecordToIdb(db, this.storeName, record as GeoCacheRecord<unknown>);
        } catch (retryErr) {
          console.warn('[GeoIndexedDBCache] Write retry failed after prune; keeping record in L1 only:', retryErr);
        }
      } else {
        console.warn(`[GeoIndexedDBCache] Failed to persist "${record.key}" to IndexedDB:`, writeErr);
      }
    }
  }

  public async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    if (!key || typeof key !== 'string' || data === undefined) return;

    const effectiveTtl = ttlMs !== undefined ? Math.max(0, ttlMs) : this.defaultTtlMs;
    const now = Date.now();
    const record: GeoCacheRecord<T> = {
      key,
      data,
      timestamp: now,
      ttlMs: effectiveTtl,
      expiresAt: now + effectiveTtl,
      version: this.dbVersion,
    };

    this.memoryL1.enforceCapacity(this.maxL1Entries, this.dbVersion);
    this.memoryL1.setRecord(key, record as GeoCacheRecord<unknown>);

    if (this.isFallbackMode || typeof window === 'undefined') return;

    try {
      await this.persistToIdbWithRetry(record);
    } catch (err) {
      console.warn(`[GeoIndexedDBCache] Persistence failed for "${key}":`, err);
    }
  }

  public async delete(key: string): Promise<void> {
    if (!key) return;
    this.memoryL1.delete(key);
    if (!this.isFallbackMode && typeof window !== 'undefined') {
      await this.deleteFromIdb(key);
    }
  }

  private async deleteFromIdb(key: string): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      await deleteRecordFromIdb(db, this.storeName, key);
    } catch (err) {
      console.warn(`[GeoIndexedDBCache] Delete transaction error on "${key}":`, err);
    }
  }

  public async clear(): Promise<void> {
    this.memoryL1.clear();
    if (this.isFallbackMode || typeof window === 'undefined') return;

    try {
      const db = await this.getDb();
      if (db) await clearIdbStore(db, this.storeName);
    } catch (err) {
      console.warn('[GeoIndexedDBCache] Failed to clear IndexedDB:', err);
    }
  }

  private async collectIdbKeys(now: number, validKeys: Set<string>): Promise<void> {
    if (this.isFallbackMode || typeof window === 'undefined') return;
    try {
      const db = await this.getDb();
      if (!db) return;
      const idbRecords = await readAllRecordsFromIdb(db, this.storeName);
      for (const rec of idbRecords) {
        if (rec && rec.expiresAt > now && rec.version === this.dbVersion) {
          validKeys.add(rec.key);
        }
      }
    } catch (err) {
      console.warn('[GeoIndexedDBCache] Error reading keys from IndexedDB:', err);
    }
  }

  public async keys(): Promise<string[]> {
    const now = Date.now();
    const validKeys = new Set<string>();

    for (const [key, record] of this.memoryL1.entries()) {
      if (record.expiresAt > now && record.version === this.dbVersion) {
        validKeys.add(key);
      }
    }

    await this.collectIdbKeys(now, validKeys);
    return Array.from(validKeys);
  }

  public async pruneExpired(): Promise<number> {
    const now = Date.now();
    const prunedKeys = new Set<string>();

    this.memoryL1.pruneExpired(now, this.dbVersion, prunedKeys);

    if (!this.isFallbackMode && typeof window !== 'undefined') {
      try {
        const db = await this.getDb();
        if (db) {
          await pruneExpiredFromIdb(db, this.storeName, now, this.dbVersion, prunedKeys);
        }
      } catch (err) {
        console.warn('[GeoIndexedDBCache] Error during pruneExpired:', err);
      }
    }

    if (prunedKeys.size > 0) {
      console.log(`[GeoIndexedDBCache] 🧹 Pruned ${prunedKeys.size} expired/stale entries.`);
    }
    return prunedKeys.size;
  }

  private loadRecordsIntoL1(records: GeoCacheRecord<unknown>[], now: number): number {
    let loaded = 0;
    for (const rec of records) {
      if (rec && rec.expiresAt > now && rec.version === this.dbVersion) {
        this.memoryL1.enforceCapacity(this.maxL1Entries, this.dbVersion);
        this.memoryL1.setRecord(rec.key, rec);
        loaded++;
      }
    }
    return loaded;
  }

  public async preload(): Promise<number> {
    if (this.isFallbackMode || typeof window === 'undefined') return this.memoryL1.size;

    try {
      const db = await this.getDb();
      if (!db) return this.memoryL1.size;

      const records = await readAllRecordsFromIdb(db, this.storeName);
      const loaded = this.loadRecordsIntoL1(records, Date.now());

      console.log(`[GeoIndexedDBCache] ⚡ Preloaded ${loaded} records into L1 memory.`);
      return loaded;
    } catch (err) {
      console.warn('[GeoIndexedDBCache] Error preloading cache:', err);
      return this.memoryL1.size;
    }
  }

  public getTelemetry() {
    return {
      l1Size: this.memoryL1.size,
      maxL1Entries: this.maxL1Entries,
      isFallbackMode: this.isFallbackMode,
      dbName: this.dbName,
      storeName: this.storeName,
      dbVersion: this.dbVersion,
    };
  }
}

/**
 * Global singleton instance for single-user platform caching.
 */
export const geoCache = new GeoIndexedDbCache();
