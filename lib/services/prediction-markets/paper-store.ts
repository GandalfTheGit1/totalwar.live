/**
 * Persistence for paper accounts. One JSON document per player.
 *  - Supabase table `paper_accounts` when the project is configured (see supabase/migrations).
 *  - Otherwise a JSON file per player under .data/paper-betting (falls back to the OS temp dir when read-only).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { PaperAccount } from './types';

export interface PaperStore {
  load(playerId: string): Promise<PaperAccount | null>;
  save(account: PaperAccount): Promise<void>;
}

export const PLAYER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertPlayerId(playerId: string) {
  if (!PLAYER_ID_PATTERN.test(playerId)) throw new Error('Invalid player id');
}

export class MemoryPaperStore implements PaperStore {
  private accounts = new Map<string, PaperAccount>();

  async load(playerId: string) {
    return this.accounts.get(playerId) ?? null;
  }

  async save(account: PaperAccount) {
    this.accounts.set(account.playerId, account);
  }
}

export class FilePaperStore implements PaperStore {
  private dir: string | null = null;

  constructor(private readonly preferredDir = path.join(process.cwd(), '.data', 'paper-betting')) {}

  private resolveDir(): string {
    if (this.dir) return this.dir;
    for (const candidate of [this.preferredDir, path.join(os.tmpdir(), 'wge-paper-betting')]) {
      try {
        fs.mkdirSync(candidate, { recursive: true });
        fs.accessSync(candidate, fs.constants.W_OK);
        this.dir = candidate;
        return candidate;
      } catch {
        // try next candidate
      }
    }
    throw new Error('No writable directory for paper-betting data');
  }

  private fileFor(playerId: string): string {
    assertPlayerId(playerId);
    return path.join(this.resolveDir(), `${playerId}.json`);
  }

  async load(playerId: string) {
    try {
      return JSON.parse(await fs.promises.readFile(this.fileFor(playerId), 'utf8')) as PaperAccount;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return null;
      throw err;
    }
  }

  async save(account: PaperAccount) {
    const file = this.fileFor(account.playerId);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(account, null, 2), 'utf8');
    await fs.promises.rename(tmp, file);
  }
}

export class SupabasePaperStore implements PaperStore {
  async load(playerId: string) {
    assertPlayerId(playerId);
    const { data, error } = await supabase
      .from('paper_accounts')
      .select('state')
      .eq('player_id', playerId)
      .maybeSingle();
    if (error) throw new Error(`paper_accounts load failed: ${error.message}`);
    return (data?.state as PaperAccount | undefined) ?? null;
  }

  async save(account: PaperAccount) {
    assertPlayerId(account.playerId);
    const { error } = await supabase
      .from('paper_accounts')
      .upsert({ player_id: account.playerId, state: account, updated_at: account.updatedAt });
    if (error) throw new Error(`paper_accounts save failed: ${error.message}`);
  }
}

let singleton: PaperStore | null = null;

export function getPaperStore(): PaperStore {
  if (!singleton) singleton = isSupabaseConfigured ? new SupabasePaperStore() : new FilePaperStore();
  return singleton;
}
