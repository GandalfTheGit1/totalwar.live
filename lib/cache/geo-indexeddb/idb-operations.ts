/**
 * lib/cache/geo-indexeddb/idb-operations.ts
 *
 * Low-level transactional read, write, delete, and pruning operations on IndexedDB stores.
 */

import { GeoCacheRecord } from './types';

/**
 * Reads a single record by key from IndexedDB.
 */
export function readRecordFromIdb<T>(
  db: IDBDatabase,
  storeName: string,
  key: string
): Promise<GeoCacheRecord<T> | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch (txErr) {
      console.warn(`[GeoIndexedDBCache] Read transaction error on "${key}":`, txErr);
      resolve(null);
    }
  });
}

/**
 * Writes a record into IndexedDB with transaction commit verification.
 */
export function writeRecordToIdb(
  db: IDBDatabase,
  storeName: string,
  record: GeoCacheRecord<unknown>
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);

      let completed = false;
      const done = () => {
        if (!completed) {
          completed = true;
          resolve();
        }
      };

      if (req) {
        req.onsuccess = done;
        req.onerror = () => reject(req.error);
      }
      if (tx) {
        tx.oncomplete = done;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }
    } catch (txErr) {
      reject(txErr);
    }
  });
}

/**
 * Deletes an item directly from IndexedDB.
 */
export function deleteRecordFromIdb(
  db: IDBDatabase,
  storeName: string,
  key: string
): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      let completed = false;
      const done = () => {
        if (!completed) {
          completed = true;
          resolve();
        }
      };
      if (req) {
        req.onsuccess = done;
        req.onerror = done;
      }
      if (tx) {
        tx.oncomplete = done;
        tx.onerror = done;
        tx.onabort = done;
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Clears an entire object store in IndexedDB.
 */
export function clearIdbStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      let completed = false;
      const done = () => {
        if (!completed) {
          completed = true;
          resolve();
        }
      };
      if (req) {
        req.onsuccess = done;
        req.onerror = done;
      }
      if (tx) {
        tx.oncomplete = done;
        tx.onerror = done;
        tx.onabort = done;
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Reads all records from an IndexedDB store.
 */
export function readAllRecordsFromIdb(
  db: IDBDatabase,
  storeName: string
): Promise<GeoCacheRecord<unknown>[]> {
  return new Promise<GeoCacheRecord<unknown>[]>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      if (typeof store.getAll === 'function') {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
        tx.onerror = () => resolve([]);
        tx.onabort = () => resolve([]);
      } else {
        resolve([]);
      }
    } catch {
      resolve([]);
    }
  });
}

/**
 * Prunes expired and version-mismatched records from an IndexedDB store in a single transaction.
 */
export function pruneExpiredFromIdb(
  db: IDBDatabase,
  storeName: string,
  now: number,
  dbVersion: number,
  prunedKeys: Set<string>
): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      if (typeof store.getAll !== 'function') return resolve();

      const req = store.getAll();
      let completed = false;
      const done = () => {
        if (!completed) {
          completed = true;
          resolve();
        }
      };

      req.onsuccess = () => {
        const allRecords: GeoCacheRecord<unknown>[] = req.result || [];
        for (const record of allRecords) {
          if (record && (record.expiresAt <= now || record.version !== dbVersion)) {
            store.delete(record.key);
            prunedKeys.add(record.key);
          }
        }
        setTimeout(done, 0);
      };
      req.onerror = done;
      if (tx) {
        tx.oncomplete = done;
        tx.onerror = done;
        tx.onabort = done;
      }
    } catch {
      resolve();
    }
  });
}
