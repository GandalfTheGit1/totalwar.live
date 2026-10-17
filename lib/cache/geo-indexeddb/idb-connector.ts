/**
 * lib/cache/geo-indexeddb/idb-connector.ts
 *
 * Safe IndexedDB factory accessor, connection lifecycle, and timeout protection.
 */

/**
 * Safe accessor for IndexedDB factory in the current execution context.
 */
export function getIndexedDBFactory(): IDBFactory | null {
  if (typeof window === 'undefined') return null;
  try {
    const win = window as unknown as Record<string, IDBFactory | undefined>;
    const idb = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
    return idb || null;
  } catch (err) {
    console.warn('[GeoIndexedDBCache] Error accessing window.indexedDB:', err);
    return null;
  }
}

function handleUpgradeNeeded(
  request: IDBOpenDBRequest,
  storeName: string,
  dbVersion: number
): void {
  try {
    const db = request.result;
    let store: IDBObjectStore | null = null;
    if (!db.objectStoreNames.contains(storeName)) {
      store = db.createObjectStore(storeName, { keyPath: 'key' });
    } else if (request.transaction && typeof request.transaction.objectStore === 'function') {
      store = request.transaction.objectStore(storeName);
    }

    if (store && store.indexNames && typeof store.indexNames.contains === 'function' && !store.indexNames.contains('expiresAt')) {
      store.createIndex('expiresAt', 'expiresAt', { unique: false });
    }
    console.log(`[GeoIndexedDBCache] Initialized object store "${storeName}" (v${dbVersion})`);
  } catch (upgradeErr) {
    console.warn('[GeoIndexedDBCache] Upgrade failed:', upgradeErr);
  }
}

function configureDatabaseEvents(
  db: IDBDatabase,
  onClosed: () => void
): void {
  db.onclose = () => {
    console.warn('[GeoIndexedDBCache] Database connection closed unexpectedly.');
    onClosed();
  };
  db.onerror = (e) => {
    console.warn('[GeoIndexedDBCache] Database error:', e);
  };
}

function attachOpenRequestListeners(
  request: IDBOpenDBRequest,
  safeResolve: (val: IDBDatabase | null) => void,
  onFallback: () => void,
  onClosed: () => void
): void {
  request.onsuccess = () => {
    const db = request.result;
    configureDatabaseEvents(db, onClosed);
    safeResolve(db);
  };
  request.onerror = () => {
    console.warn('[GeoIndexedDBCache] Failed to open IndexedDB, activating in-memory fallback:', request.error);
    onFallback();
    safeResolve(null);
  };
  request.onblocked = () => {
    console.warn('[GeoIndexedDBCache] IndexedDB open blocked by existing connection; activating fallback to prevent UI hang.');
    onFallback();
    safeResolve(null);
  };
}

function createSettledResolver(
  timeoutMs: number,
  onTimeout: () => void,
  resolve: (val: IDBDatabase | null) => void
): (val: IDBDatabase | null) => void {
  let hasSettled = false;
  const timeoutId = setTimeout(() => {
    if (!hasSettled) {
      hasSettled = true;
      onTimeout();
      resolve(null);
    }
  }, timeoutMs);

  return (val: IDBDatabase | null) => {
    if (!hasSettled) {
      hasSettled = true;
      clearTimeout(timeoutId);
      resolve(val);
    }
  };
}

/**
 * Lazily opens and configures the IndexedDB instance with lock and timeout protection.
 */
export function openDatabase(
  dbName: string,
  storeName: string,
  dbVersion: number,
  onFallback: () => void,
  onClosed: () => void
): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    const idb = getIndexedDBFactory();
    if (!idb) {
      onFallback();
      console.log('[GeoIndexedDBCache] IndexedDB unavailable in this browser environment, using in-memory L1 cache fallback.');
      return resolve(null);
    }

    const safeResolve = createSettledResolver(3000, () => {
      console.warn('[GeoIndexedDBCache] IndexedDB open timed out after 3000ms. Falling back to in-memory L1.');
      onFallback();
    }, resolve);

    try {
      const request = idb.open(dbName, dbVersion);
      request.onupgradeneeded = () => handleUpgradeNeeded(request, storeName, dbVersion);
      attachOpenRequestListeners(request, safeResolve, onFallback, onClosed);
    } catch (openErr) {
      console.warn('[GeoIndexedDBCache] Exception opening IndexedDB:', openErr);
      onFallback();
      safeResolve(null);
    }
  });
}
