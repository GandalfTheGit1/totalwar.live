'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

import type { LlmProvider } from './llm-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataMode = 'mock' | 'real';
export type LogType = 'info' | 'warn' | 'error' | 'success' | 'api';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: LogType;
}

export interface SettingsContextValue {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  llmProvider: LlmProvider;
  setLlmProvider: (provider: LlmProvider) => void;
  speedBoost: boolean;
  setSpeedBoost: (enabled: boolean) => void;
  dailySpend: number;
  spendCap: number;
  setSpendCap: (cap: number) => void;
  incrementSpend: (amt: number) => void;
  logs: LogEntry[];
  addLog: (source: string, message: string, type?: LogType, customTimestamp?: string) => void;
  addServerLogs: (serverLogs: string[]) => void;
  clearLogs: () => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  sectorOfSearch: string;
  setSectorOfSearch: (sector: string) => void;
  showWorldTensionIndex: boolean;
  setShowWorldTensionIndex: (value: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LOG_ENTRIES = 200;

// ─── Helper for Date ──────────────────────────────────────────────────────────

const getTodayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ─── Safe LocalStorage Helpers ───────────────────────────────────────────────

export const safeLocalStorageGet = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch (error) {
    console.warn(`[AG:Settings] safeLocalStorageGet failed for key "${key}":`, error);
    return null;
  }
};

export const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn(`[AG:Settings] safeLocalStorageSet failed for key "${key}":`, error);
  }
};

export const safeLocalStorageRemove = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[AG:Settings] safeLocalStorageRemove failed for key "${key}":`, error);
  }
};

export const safeCleanOldDailySpends = (todayKey: string): void => {
  try {
    if (typeof window === 'undefined') return;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ag_daily_spend_') && key !== todayKey) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('[AG:Settings] safeCleanOldDailySpends failed:', error);
  }
};

// ─── Server Log Parser ────────────────────────────────────────────────────────

const SERVER_LOG_REGEX = /^\[([\d:]+)\]\s*\[([^\]]+)\]\s*(.*?)(?:\s*\((info|warn|error|success|api)\))?$/;

/**
 * Parses a raw server log string line into a structured LogEntry entity.
 */
export function parseServerLogEntry(logStr: string, logIndex: number): LogEntry {
  const match = logStr.match(SERVER_LOG_REGEX);
  const baseId = `${Date.now()}-${logIndex}-${Math.random()}`;

  if (match) {
    const [, timestamp, source, message, typeStr = 'info'] = match;
    return {
      id: baseId,
      timestamp,
      source: `Server:${source}`,
      message,
      type: typeStr as LogType,
    };
  }

  return {
    id: baseId,
    timestamp: new Date().toTimeString().slice(0, 8),
    source: 'Server',
    message: logStr,
    type: 'info',
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null);

let logCounter = 0;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const dataMode = 'real';
  const setDataMode = useCallback((_mode: DataMode) => {
    console.log('[AG:Settings] Data mode is locked to REAL (mock is disabled)');
  }, []);
  const [llmProvider, setLlmProviderState] = useState<LlmProvider>('gemini');
  const [speedBoost, setSpeedBoostState] = useState(false);
  const [dailySpend, setDailySpendState] = useState<number>(0);
  const [spendCap, setSpendCapState] = useState<number>(5.0); // Default $5.00
  const [sectorOfSearch, setSectorOfSearchState] = useState<string>('All');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [showWorldTensionIndex, setShowWorldTensionIndexState] = useState(false);
  const initialized = useRef(false);

  // Load persisted states from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const storedLlm = safeLocalStorageGet('ag_llm_provider') as LlmProvider | null;
    if (storedLlm === 'gemini') {
      setLlmProviderState(storedLlm);
      console.log(`[AG:Settings] Restored LLM provider: ${storedLlm}`);
    }

    const storedBoost = safeLocalStorageGet('ag_speed_boost');
    if (storedBoost === 'true') {
      setSpeedBoostState(true);
      console.log('[AG:Settings] Restored speed boost: ON');
    }

    const todayStr = getTodayString();
    const todayKey = `ag_daily_spend_${todayStr}`;
    const storedSpend = safeLocalStorageGet(todayKey);
    if (storedSpend) {
      setDailySpendState(Number(storedSpend) || 0);
    } else {
      safeCleanOldDailySpends(todayKey);
      setDailySpendState(0);
    }

    const storedCap = safeLocalStorageGet('ag_spend_cap');
    if (storedCap !== null) {
      setSpendCapState(Number(storedCap));
    }

    const storedSector = safeLocalStorageGet('ag_sector_of_search');
    if (storedSector !== null) {
      setSectorOfSearchState(storedSector);
      console.log(`[AG:Settings] Restored sector of search: ${storedSector}`);
    }

    const storedTension = safeLocalStorageGet('ag_show_world_tension');
    if (storedTension === 'true') {
      setShowWorldTensionIndexState(true);
    }
  }, []);

  const setSectorOfSearch = useCallback((sector: string) => {
    setSectorOfSearchState(sector);
    safeLocalStorageSet('ag_sector_of_search', sector);
    console.log(`[AG:Settings] Sector of search switched → ${sector}`);
  }, []);

  const setShowWorldTensionIndex = useCallback((value: boolean) => {
    setShowWorldTensionIndexState(value);
    safeLocalStorageSet('ag_show_world_tension', String(value));
    console.log(`[AG:Settings] World Tension Index → ${value ? 'ON' : 'OFF'}`);
  }, []);

  const setLlmProvider = useCallback((provider: LlmProvider) => {
    setLlmProviderState(provider);
    safeLocalStorageSet('ag_llm_provider', provider);
    console.log(`[AG:Settings] LLM provider switched → ${provider.toUpperCase()}`);
  }, []);

  const setSpeedBoost = useCallback((enabled: boolean) => {
    setSpeedBoostState(enabled);
    safeLocalStorageSet('ag_speed_boost', String(enabled));
    console.log(`[AG:Settings] Speed Boost → ${enabled ? '⚡ ON (PAID TIER)' : '🔋 OFF (FREE TIER)'}`);
  }, []);

  const setSpendCap = useCallback((cap: number) => {
    setSpendCapState(cap);
    safeLocalStorageSet('ag_spend_cap', String(cap));
    console.log(`[AG:Settings] Spend cap updated to $${cap === Infinity ? 'Unlimited' : cap.toFixed(2)}`);
  }, []);

  const incrementSpend = useCallback((amt: number) => {
    if (amt <= 0) return;
    setDailySpendState((prev) => {
      const next = prev + amt;
      const todayStr = getTodayString();
      const todayKey = `ag_daily_spend_${todayStr}`;
      safeLocalStorageSet(todayKey, String(next));
      return next;
    });
  }, []);

  const addLog = useCallback(
    (source: string, message: string, type: LogType = 'info', customTimestamp?: string) => {
      const timestamp = customTimestamp || new Date().toTimeString().slice(0, 8); // HH:MM:SS

      const consoleArgs = [`[AG:${source}] ${message}`];
      if (type === 'error') {
        console.error(...consoleArgs);
      } else if (type === 'warn') {
        console.warn(...consoleArgs);
      } else {
        console.log(...consoleArgs);
      }

      setLogs((prev) => {
        const entry: LogEntry = {
          id: `${Date.now()}-${logCounter++}`,
          timestamp,
          source,
          message,
          type,
        };
        return [entry, ...prev].slice(0, MAX_LOG_ENTRIES);
      });
    },
    [],
  );

  const addServerLogs = useCallback((serverLogs: string[]) => {
    if (!serverLogs || !Array.isArray(serverLogs)) return;

    setLogs((prev) => {
      let newLogs = [...prev];
      for (const logStr of serverLogs) {
        const entry = parseServerLogEntry(logStr, logCounter++);
        newLogs = [entry, ...newLogs];
      }
      return newLogs.slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        dataMode,
        setDataMode,
        llmProvider,
        setLlmProvider,
        speedBoost,
        setSpeedBoost,
        dailySpend,
        spendCap,
        setSpendCap,
        incrementSpend,
        logs,
        addLog,
        addServerLogs,
        clearLogs,
        isPanelOpen,
        setPanelOpen,
        sectorOfSearch,
        setSectorOfSearch,
        showWorldTensionIndex,
        setShowWorldTensionIndex,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside <SettingsProvider>');
  }
  return ctx;
}
