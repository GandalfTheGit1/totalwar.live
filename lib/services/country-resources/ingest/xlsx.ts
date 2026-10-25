/**
 * Lector .xlsx mínimo: devuelve cada hoja como matriz de celdas (texto o null).
 * Suficiente para tablas planas como las de World Mining Data; no evalúa fórmulas.
 */

import { readZipEntries } from './zip';

export type SheetRows = (string | null)[][];

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

function textRuns(xml: string): string {
  let out = '';
  for (const m of xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += m[1];
  return decodeXml(out);
}

function columnIndex(ref: string): number {
  const letters = ref.replace(/\d+/g, '');
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textRuns(m[1]));
}

export function parseSheet(xml: string, shared: string[]): SheetRows {
  const rows: SheetRows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: (string | null)[] = [];
    for (const cell of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1];
      const body = cell[2] ?? '';
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
      const rawValue = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: string | null = null;
      if (type === 's' && rawValue !== undefined) value = shared[Number(rawValue)] ?? null;
      else if (type === 'inlineStr') value = textRuns(body);
      else if (rawValue !== undefined) value = decodeXml(rawValue);
      const index = ref ? columnIndex(ref) : row.length;
      while (row.length < index) row.push(null);
      row[index] = value;
    }
    rows.push(row);
  }
  return rows;
}

/** Lee un .xlsx y devuelve { nombre de hoja → filas } en el orden del libro. */
export async function readXlsx(path: string): Promise<Map<string, SheetRows>> {
  const files = await readZipEntries(path);
  const read = (name: string) => files.get(name)?.toString('utf8') ?? '';

  const shared = parseSharedStrings(read('xl/sharedStrings.xml'));
  const rels = new Map<string, string>();
  for (const m of read('xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = /\bId="([^"]+)"/.exec(m[1])?.[1];
    const target = /\bTarget="([^"]+)"/.exec(m[1])?.[1];
    if (id && target) rels.set(id, target.replace(/^\/?xl\//, ''));
  }

  const sheets = new Map<string, SheetRows>();
  for (const m of read('xl/workbook.xml').matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const name = /\bname="([^"]+)"/.exec(m[1])?.[1];
    const relId = /\br:id="([^"]+)"/.exec(m[1])?.[1];
    const target = relId ? rels.get(relId) : undefined;
    if (!name || !target) continue;
    sheets.set(decodeXml(name).trim(), parseSheet(read(`xl/${target}`), shared));
  }
  return sheets;
}
