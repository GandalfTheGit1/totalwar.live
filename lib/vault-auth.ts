/**
 * Vault Auth: Single-User Token Rotation and Edge Security Layer
 * Protects all routes, APIs, and pages from scraping by enforcing
 * an 8-hour HMAC-SHA256 rolling session issued via secret URL key.
 */

export const SESSION_COOKIE_NAME = '__vault_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours in ms
export const SESSION_MAX_AGE_SEC = 8 * 60 * 60; // 28,800 seconds

// Fallback secret for local development only
export const DEV_FALLBACK_SECRET = 'dev_vault_secret_replace_in_production_32bytes';

export function getVaultSecret(): string {
  const secret = process.env.APP_ACCESS_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Vault Auth] CRITICAL: APP_ACCESS_SECRET is not configured in Vercel environment!');
      throw new Error('[Vault Auth] FATAL: APP_ACCESS_SECRET must be configured in production environment!');
    } else {
      console.warn('[Vault Auth] Warning: APP_ACCESS_SECRET is missing in .env.local. Using local development fallback.');
    }
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}

export interface VaultCookieOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict';
  path: string;
  maxAge: number;
}

export function getSessionCookieOptions(token: string, isProduction: boolean): VaultCookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function getBurnCookieOptions(isProduction: boolean): VaultCookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };
}

export function getBurnCookieHeader(isProduction: boolean = process.env.NODE_ENV === 'production'): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}`;
}

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  if (hex.length !== 64) return new Uint8Array(0);
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Creates an HMAC-SHA256 signature using the Web Cryptography API.
 */
export async function createSignature(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bufToHex(signature);
}

/**
 * Verifies an HMAC-SHA256 signature in constant time using crypto.subtle.verify.
 */
export async function verifySignature(secret: string, message: string, signatureHex: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = hexToBuf(signatureHex);
    if (sigBytes.length !== 32) return false;
    return await crypto.subtle.verify('HMAC', key, sigBytes as unknown as BufferSource, enc.encode(message));
  } catch (err) {
    console.warn('[Vault Auth] Signature verification error:', err);
    return false;
  }
}

/**
 * Generates an 8-hour token string: `${expiresAt}.${signatureHex}`
 */
export async function generateSessionToken(secret: string): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await createSignature(secret, expiresAt.toString());
  return {
    token: `${expiresAt}.${signature}`,
    expiresAt,
  };
}

/**
 * Validates a session token string against expiration and HMAC signature.
 */
export async function validateSessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiresAtStr, sigHex] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    // Expired or invalid timestamp
    return false;
  }

  return await verifySignature(secret, expiresAtStr, sigHex);
}

/**
 * Verifies the ingress secret key in constant time using HMAC.
 * Protects against timing side-channel attacks on secret comparison.
 */
export async function verifyVaultSecret(incomingKey: string | null | undefined, secret: string): Promise<boolean> {
  if (!incomingKey || typeof incomingKey !== 'string' || !secret) return false;
  const expectedSig = await createSignature(secret, secret);
  return await verifySignature(secret, incomingKey, expectedSig);
}
