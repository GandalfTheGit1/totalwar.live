/**
 * @file world-bank-batch.test.ts
 * @description Partial-failure behaviour of fetchWorldBankIndicatorsBatch: an indicator rejected by
 * the World Bank API (error envelope, e.g. [120] invalid parameter) is skipped without sinking the
 * batch, while transport/HTTP failures and fully-rejected batches still fail loud.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWorldBankIndicatorsBatch,
  WorldBankApiError,
  WORLD_BANK_INDICATORS,
} from '@/lib/macro/world-bank-client';
import { resetCircuitBreaker } from '@/lib/macro/rate-limited-queue';

const INVALID_PARAM_ENVELOPE = [
  { message: [{ id: '120', key: 'Invalid value', value: 'The provided parameter value is not valid' }] },
];

function observationPayload(indicatorId: string, value: number) {
  return [
    { page: 1, pages: 1, per_page: 1000, total: 1 },
    [
      {
        indicator: { id: indicatorId, value: indicatorId },
        country: { id: 'US', value: 'United States' },
        countryiso3code: 'USA',
        date: '2022',
        value,
      },
    ],
  ];
}

function indicatorFromUrl(url: string): string {
  return decodeURIComponent(url.split('/indicator/')[1].split('?')[0]);
}

function mockWorldBank(responder: (indicatorId: string) => Response) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
    return responder(indicatorFromUrl(String(input)));
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('fetchWorldBankIndicatorsBatch - partial failure', () => {
  beforeEach(() => {
    resetCircuitBreaker();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetCircuitBreaker();
  });

  it('skips an indicator rejected with an API error envelope and keeps the rest', async () => {
    mockWorldBank((id) =>
      id === 'LP.LPI.BOGUS.XQ' ? jsonResponse(INVALID_PARAM_ENVELOPE) : jsonResponse(observationPayload(id, 3.4))
    );

    const batch = await fetchWorldBankIndicatorsBatch(
      'all',
      ['LP.LPI.INFR.XQ', 'LP.LPI.BOGUS.XQ', 'LP.LPI.CUST.XQ'],
      { mrv: 1, delayBetweenRequestsMs: 0 }
    );

    expect(Object.keys(batch).sort()).toEqual(['LP.LPI.CUST.XQ', 'LP.LPI.INFR.XQ']);
    expect(batch['LP.LPI.INFR.XQ'][0]).toMatchObject({ countryIso3: 'USA', value: 3.4 });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('LP.LPI.BOGUS.XQ'),
      expect.stringContaining('[120]')
    );
  });

  it('throws when every indicator is rejected by the API', async () => {
    mockWorldBank(() => jsonResponse(INVALID_PARAM_ENVELOPE));

    await expect(
      fetchWorldBankIndicatorsBatch('all', ['A.BAD', 'B.BAD'], { delayBetweenRequestsMs: 0 })
    ).rejects.toBeInstanceOf(WorldBankApiError);
  });

  it('still halts the batch on HTTP errors', async () => {
    mockWorldBank((id) =>
      id === 'LP.LPI.TRAC.XQ' ? new Response('boom', { status: 502 }) : jsonResponse(observationPayload(id, 3))
    );

    await expect(
      fetchWorldBankIndicatorsBatch('all', ['LP.LPI.INFR.XQ', 'LP.LPI.TRAC.XQ', 'LP.LPI.CUST.XQ'], {
        delayBetweenRequestsMs: 0,
      })
    ).rejects.toThrow(/HTTP error 502/);
  });

  it('uses the valid WDI code for the LPI shipments sub-index', () => {
    expect(WORLD_BANK_INDICATORS.LPI_SHIPMENTS).toBe('LP.LPI.ITRN.XQ');
  });
});
