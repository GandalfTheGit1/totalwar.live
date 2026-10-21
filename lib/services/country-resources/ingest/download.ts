/**
 * Descarga con caché en disco: cada fuente se baja una vez a .cache/country-resources/
 * y se reutiliza en ejecuciones siguientes salvo que se pida refrescar.
 */

import { createWriteStream, promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const USER_AGENT = 'world-geopolitical-engine/1.0 (country resources builder)';

export async function downloadCached(url: string, filePath: string, refresh = false): Promise<string> {
  if (!refresh) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.size > 0) {
        console.log(`  · caché: ${path.basename(filePath)} (${(stat.size / 1e6).toFixed(1)} MB)`);
        return filePath;
      }
    } catch {
      // no existe todavía
    }
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  console.log(`  ↓ ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok || !res.body) throw new Error(`Descarga fallida (${res.status} ${res.statusText}): ${url}`);

  const tmp = `${filePath}.part`;
  await pipeline(Readable.fromWeb(res.body as import('stream/web').ReadableStream), createWriteStream(tmp));
  await fs.rename(tmp, filePath);
  const stat = await fs.stat(filePath);
  console.log(`    ${(stat.size / 1e6).toFixed(1)} MB`);
  return filePath;
}
