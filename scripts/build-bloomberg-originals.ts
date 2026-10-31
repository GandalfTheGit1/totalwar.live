/**
 * scripts/build-bloomberg-originals.ts
 *
 * Genera lib/data/bloomberg-originals/videos.json: los videos del canal de YouTube Bloomberg Originals
 * etiquetados por país, empresas, sectores y ángulo de inversión (favorable / riesgo / mixto / neutral).
 *   - Catálogo: yt-dlp en modo flat (solo títulos; fecha aproximada a partir de "hace N meses").
 *   - Etiquetado: callLlm (rotación Gemini/Groq/...) en lotes de títulos.
 * Es incremental: los videos ya etiquetados no se vuelven a enviar al LLM.
 *
 * Uso (requiere yt-dlp instalado, o YTDLP_BIN apuntando al binario):
 *   npm run build:bloomberg                      # últimos 2 años
 *   npm run build:bloomberg -- --since=20250101
 */

import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { callLlm } from '../lib/llm-client';
import { resolveCountryCode } from '../lib/services/geopolitical/country-resolver';
import type { BloombergOriginalsFile, BloombergStance, BloombergVideo } from '../lib/services/bloomberg-originals/store';

const CHANNEL_ID = 'UCUMZ7gohGI9HcU9VNsr2FJQ';
const OUT_FILE = path.join(process.cwd(), 'lib', 'data', 'bloomberg-originals', 'videos.json');
const BATCH = 20; // 40 titles truncated the JSON answer at ~8k chars
const STANCES: BloombergStance[] = ['favorable', 'riesgo', 'mixto', 'neutral'];

interface CatalogEntry { id: string; title: string; upload_date: string | null; view_count: number | null }

function arg(name: string): string | undefined {
  return process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
}

function defaultSince(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function fetchCatalog(): CatalogEntry[] {
  const bin = process.env.YTDLP_BIN || 'yt-dlp';
  const res = spawnSync(bin, [
    '--flat-playlist', '--dump-json', '--playlist-end', '1500',
    '--extractor-args', 'youtubetab:approximate_date',
    `https://www.youtube.com/channel/${CHANNEL_ID}/videos`,
  ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(`yt-dlp falló (${bin}): ${res.error?.message ?? res.stderr.slice(-500)}`);
  return res.stdout.trim().split('\n').map(l => JSON.parse(l));
}

const SYSTEM_PROMPT = `You tag Bloomberg Originals YouTube videos for an investor deciding which countries and companies to invest in.
For each video (you only get the title) return:
- countries: ISO-3166 alpha-2 codes of the countries the video is about, plus the home country of each company it covers (e.g. Nvidia -> US). Empty if none.
- companies: public or notable companies named or clearly implied, with stock ticker if listed (else null).
- sectors: 1-3 short sector names in Spanish (e.g. "semiconductores", "inmobiliario").
- stance: investment angle for those countries/companies: "favorable" (growth, opportunity), "riesgo" (crisis, scandal, decline), "mixto", or "neutral" (lifestyle, interviews, no investment angle).
- thesis: one short Spanish sentence with the investment angle. Do not invent facts beyond the title.
Respond ONLY with JSON: {"videos":[{"id":"...","countries":[],"companies":[{"name":"...","ticker":null}],"sectors":[],"stance":"neutral","thesis":"..."}]}`;

function parseJson(text: string): any {
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
}

async function tagBatch(batch: CatalogEntry[]): Promise<BloombergVideo[]> {
  const raw = await callLlm({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: batch.map(v => `${v.id} | ${v.title}`).join('\n'),
    temperature: 0.1,
    maxTokens: 8000,
    tier: 'HEAVY',
    responseFormat: 'json',
  });
  const byId = new Map<string, any>((parseJson(raw).videos ?? []).map((t: any) => [t.id, t]));

  return batch.flatMap(v => {
    const t = byId.get(v.id);
    if (!t) return []; // missing from the LLM answer: retried on the next run
    const d = v.upload_date;
    return [{
      id: v.id,
      title: v.title,
      published: d ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : null,
      views: v.view_count,
      countries: [...new Set<string>((t.countries ?? []).map((c: string) => resolveCountryCode(c)).filter(Boolean))],
      companies: (t.companies ?? []).filter((c: any) => c?.name).map((c: any) => ({ name: String(c.name), ticker: c.ticker ? String(c.ticker) : null })),
      sectors: (t.sectors ?? []).map(String).slice(0, 3),
      stance: STANCES.includes(t.stance) ? t.stance : 'neutral',
      thesis: String(t.thesis ?? ''),
    }];
  });
}

async function main() {
  const since = arg('since') ?? defaultSince();
  let existing: BloombergVideo[] = [];
  try {
    existing = (JSON.parse(await fs.readFile(OUT_FILE, 'utf8')) as BloombergOriginalsFile).videos;
  } catch { /* first run */ }
  const done = new Set(existing.map(v => v.id));

  const catalog = fetchCatalog().filter(v => (v.upload_date ?? '') >= since);
  const pending = catalog.filter(v => !done.has(v.id));
  console.log(`[bloomberg] ${catalog.length} videos desde ${since}, ${pending.length} por etiquetar`);

  const videos = existing.filter(v => (v.published ?? '').replace(/-/g, '') >= since);
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

  for (let i = 0; i < pending.length; i += BATCH) {
    try {
      videos.push(...await tagBatch(pending.slice(i, i + BATCH)));
    } catch (err: any) {
      console.error(`[bloomberg] lote ${i / BATCH + 1} falló: ${err.message}`);
    }
    // Saved after every batch so a quota failure never loses tagged work.
    const out: BloombergOriginalsFile = {
      source: 'YouTube · Bloomberg Originals',
      channelId: CHANNEL_ID,
      generatedAt: new Date().toISOString(),
      since,
      datesApproximate: true,
      videos: videos.sort((a, b) => (b.published ?? '').localeCompare(a.published ?? '')),
    };
    await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 1));
    console.log(`[bloomberg] ${videos.length} etiquetados`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
