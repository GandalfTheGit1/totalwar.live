/**
 * lib/cache/geo-indexeddb/memory-l1.ts
 *
 * High-performance L1 in-memory cache layer with bounded capacity,
 * synchronous 0ms lookups, and FIFO/expired eviction.
 */

import { GeoCacheRecord } from './types';

export class MemoryL1Cache {
  private readonly map = new Map<string, GeoCacheRecord<unknown>>();

  get size(): number {
    return this.map.size;
  }

  getSync<T>(
    key: string,
    dbVersion: number,
    onExpiredOrMismatched: (key: string) => void
  ): T | null {
    if (!key || typeof key !== 'string') return null;
    const memRecord = this.map.get(key);
    if (!memRecord) return null;

    const now = Date.now();
    if (memRecord.expiresAt <= now || memRecord.version !== dbVersion) {
      this.map.delete(key);
      onExpiredOrMismatched(key);
      return null;
    }

    return memRecord.data as T;
  }

  hasSync(
    key: string,
    dbVersion: number,
    onExpiredOrMismatched: (key: string) => void
  ): boolean {
    return this.getSync(key, dbVersion, onExpiredOrMismatched) !== null;
  }

  getRecord(key: string): GeoCacheRecord<unknown> | undefined {
    return this.map.get(key);
  }

  setRecord(key: string, record: GeoCacheRecord<unknown>): void {
    this.map.set(key, record);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  entries(): IterableIterator<[string, GeoCacheRecord<unknown>]> {
    return this.map.entries();
  }

  enforceCapacity(maxL1Entries: number, dbVersion: number): void {
    if (this.map.size < maxL1Entries) return;

    const now = Date.now();
    for (const [k, v] of this.map.entries()) {
      if (v.expiresAt <= now || v.version !== dbVersion) {
        this.map.delete(k);
      }
    }

    while (this.map.size >= maxL1Entries) {
      const oldestKey = this.map.keys().next().value;
      if (!oldestKey) break;
      this.map.delete(oldestKey);
    }
  }

  pruneExpired(now: number, dbVersion: number, prunedKeys: Set<string>): void {
    for (const [key, record] of this.map.entries()) {
      if (record.expiresAt <= now || record.version !== dbVersion) {
        this.map.delete(key);
        prunedKeys.add(key);
      }
    }
  }
}
