/**
 * Lector ZIP mínimo (sin dependencias): lista las entradas leyendo el directorio central
 * y abre cada una como stream, para procesar CSV de cientos de MB sin cargarlos en memoria.
 * No soporta ZIP64 ni cifrado; los ficheros de FAOSTAT y los .xlsx no los usan.
 */

import { createReadStream, promises as fs } from 'fs';
import { Readable } from 'stream';
import { createInflateRaw, inflateRawSync } from 'zlib';

export interface ZipEntry {
  name: string;
  method: number; // 0 = stored, 8 = deflate
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;

async function readBytes(file: fs.FileHandle, position: number, length: number): Promise<Buffer> {
  const buffer = Buffer.alloc(length);
  const { bytesRead } = await file.read(buffer, 0, length, position);
  return buffer.subarray(0, bytesRead);
}

export async function listZipEntries(zipPath: string): Promise<ZipEntry[]> {
  const file = await fs.open(zipPath, 'r');
  try {
    const { size } = await file.stat();
    // El registro EOCD mide 22 bytes más un comentario de hasta 65535.
    const tailLength = Math.min(size, 22 + 0xffff);
    const tail = await readBytes(file, size - tailLength, tailLength);
    let eocd = -1;
    for (let i = tail.length - 22; i >= 0; i--) {
      if (tail.readUInt32LE(i) === EOCD_SIGNATURE) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error(`${zipPath}: no es un ZIP válido (sin EOCD)`);

    const entryCount = tail.readUInt16LE(eocd + 10);
    const centralSize = tail.readUInt32LE(eocd + 12);
    const centralOffset = tail.readUInt32LE(eocd + 16);
    if (centralOffset === 0xffffffff) throw new Error(`${zipPath}: ZIP64 no soportado`);

    const central = await readBytes(file, centralOffset, centralSize);
    const entries: ZipEntry[] = [];
    let p = 0;
    for (let i = 0; i < entryCount; i++) {
      if (central.readUInt32LE(p) !== CENTRAL_SIGNATURE) throw new Error(`${zipPath}: directorio central corrupto`);
      const method = central.readUInt16LE(p + 10);
      const compressedSize = central.readUInt32LE(p + 20);
      const uncompressedSize = central.readUInt32LE(p + 24);
      const nameLength = central.readUInt16LE(p + 28);
      const extraLength = central.readUInt16LE(p + 30);
      const commentLength = central.readUInt16LE(p + 32);
      const localHeaderOffset = central.readUInt32LE(p + 42);
      const name = central.toString('utf8', p + 46, p + 46 + nameLength);
      entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
      p += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  } finally {
    await file.close();
  }
}

async function dataStart(zipPath: string, entry: ZipEntry): Promise<number> {
  const file = await fs.open(zipPath, 'r');
  try {
    const header = await readBytes(file, entry.localHeaderOffset, 30);
    if (header.readUInt32LE(0) !== LOCAL_SIGNATURE) throw new Error(`${zipPath}: cabecera local corrupta (${entry.name})`);
    return entry.localHeaderOffset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
  } finally {
    await file.close();
  }
}

export async function findZipEntry(zipPath: string, predicate: (name: string) => boolean): Promise<ZipEntry> {
  const entry = (await listZipEntries(zipPath)).find((e) => predicate(e.name));
  if (!entry) throw new Error(`${zipPath}: no contiene la entrada buscada`);
  return entry;
}

/** Abre una entrada como stream de bytes descomprimidos. */
export async function openZipEntryStream(zipPath: string, entry: ZipEntry): Promise<Readable> {
  const start = await dataStart(zipPath, entry);
  if (entry.compressedSize === 0) return Readable.from([]);
  const raw = createReadStream(zipPath, { start, end: start + entry.compressedSize - 1 });
  if (entry.method === 0) return raw;
  if (entry.method === 8) return raw.pipe(createInflateRaw());
  throw new Error(`${zipPath}: método de compresión ${entry.method} no soportado (${entry.name})`);
}

/** Lee una entrada como texto UTF-8 (para tablas de códigos pequeñas dentro de un ZIP grande). */
export async function readZipEntryText(zipPath: string, predicate: (name: string) => boolean): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of await openZipEntryStream(zipPath, await findZipEntry(zipPath, predicate))) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** Lee todas las entradas pequeñas de un ZIP en memoria (para .xlsx). */
export async function readZipEntries(zipPath: string): Promise<Map<string, Buffer>> {
  const data = await fs.readFile(zipPath);
  const out = new Map<string, Buffer>();
  for (const entry of await listZipEntries(zipPath)) {
    const start = await dataStart(zipPath, entry);
    const body = data.subarray(start, start + entry.compressedSize);
    if (entry.method === 0) out.set(entry.name, Buffer.from(body));
    else if (entry.method === 8) out.set(entry.name, inflateRawSync(body));
  }
  return out;
}
