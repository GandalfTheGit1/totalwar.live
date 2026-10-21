/**
 * Lectura de CSV en streaming. Las fuentes (FAOSTAT, Ember) no llevan saltos de línea
 * dentro de los campos, así que basta con partir por líneas y respetar las comillas.
 */

import { createInterface } from 'readline';
import { Readable } from 'stream';

/** Parte una línea CSV respetando campos entre comillas y comillas escapadas (""). */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Recorre un CSV con cabecera y entrega cada fila como objeto { columna: valor }.
 * `onRow` se llama de forma síncrona por fila.
 */
export async function forEachCsvRow(
  stream: Readable,
  onRow: (row: Record<string, string>) => void
): Promise<number> {
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let header: string[] | null = null;
  let count = 0;
  for await (const rawLine of lines) {
    const line = header === null ? rawLine.replace(/^﻿/, '') : rawLine;
    if (!line) continue;
    const fields = parseCsvLine(line);
    if (header === null) {
      header = fields.map((f) => f.trim());
      continue;
    }
    const row: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = fields[i] ?? '';
    onRow(row);
    count++;
  }
  return count;
}
