"""Phase 0 TypeScript patch: adds the 'important' flag and the 'pending data' tone. Run from the repository root. Every replacement checks that the old text exists exactly once."""
import sys

def edit(path, old, new, count=1):
    s = open(path, encoding='utf-8').read()
    n = s.count(old)
    if n != count:
        sys.exit(f'STOP: in {path} I expected {count} occurrence(s) of the text below but found {n}. Do not continue; report this.\n---\n{old}\n---')
    open(path, 'w', encoding='utf-8').write(s.replace(old, new))
    print('ok', path)

# 1. types: the score carries the flag
edit('lib/services/bilateral-relations/types.ts',
     "  valence: number;\n  coverage: CoverageLevel;",
     "  valence: number;\n  /** The pair is expected to have a position (both >= 20M inhabitants, high trade, shared border or both in the G20). */\n  important: boolean;\n  coverage: CoverageLevel;")

# 2. store: read the 8th element of the compact record
edit('lib/services/bilateral-relations/relations-store.ts',
     "type CompactPair = [number, RelationBand, number, CoverageLevel, boolean, [string, number][], Record<string, CompactEmbassy>];",
     "type CompactPair = [number, RelationBand, number, CoverageLevel, boolean, [string, number][], Record<string, CompactEmbassy>, number?];")
edit('lib/services/bilateral-relations/relations-store.ts',
     " * Compact pair record: [R, band, sStruct, coverage, eventsAnalysed, states, embassies]",
     " * Compact pair record: [R, band, sStruct, coverage, eventsAnalysed, states, embassies, important]   (important: 1 or 0; missing = 0)")
edit('lib/services/bilateral-relations/relations-store.ts',
     "    const [R, band, sStruct, coverage, eventsAnalysed, states, embassies] = rec;",
     "    const [R, band, sStruct, coverage, eventsAnalysed, states, embassies, important] = rec;")
edit('lib/services/bilateral-relations/relations-store.ts',
     "ties, valence, coverage, eventsAnalysed, states, embassies: expandEmbassies(embassies) });",
     "ties, valence, important: important === 1, coverage, eventsAnalysed, states, embassies: expandEmbassies(embassies) });")

# 3. valence.ts: gap kind and pending tone (replaces the Tone interface, rgba and toneOf)
P = 'lib/services/bilateral-relations/valence.ts'
s = open(P, encoding='utf-8').read()
a = s.index('export interface Tone {')
b = s.index('/** Short Spanish label of a position')
new_block = '''const POSITION_MIN = 5;
const PENDING_RGB: Rgb = [245, 158, 11];

export interface Tone {
  fillColor: string;
  hoverFillColor: string;
  strokeColor: string;
  strokeWidth: string;
  /** Glow filter id (defined in MapDefs) for strong positions only, '' otherwise. */
  glow: '' | 'emerald' | 'rose';
  valence: number;
  ties: number;
  /** The pair is expected to have a position but none is recorded: the 2D map paints it with the hatch pattern 'hatch-pending'. */
  pending: boolean;
}

export type GapKind = 'position' | 'pending' | 'none' | 'connected';

/** Position recorded (|V| >= 5), position pending (important pair, none recorded), no relevant relation, or connected but not important. */
export function gapKind(valence: number, ties: number, important: boolean): GapKind {
  if (Math.abs(valence) >= POSITION_MIN) return 'position';
  if (important) return 'pending';
  return ties === 0 ? 'none' : 'connected';
}

const rgba = (c: Rgb, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${Math.round(a * 100) / 100})`;

/** Complete tone of one pair; null when nothing is recorded and the pair is not important, so the map keeps its grey. */
export function toneOf(valence: number, ties: number, coverage: CoverageLevel = 'low', important = false): Tone | null {
  if (gapKind(valence, ties, important) === 'pending') {
    return {
      fillColor: rgba(PENDING_RGB, 0.18),
      hoverFillColor: rgba(PENDING_RGB, 0.35),
      strokeColor: `rgb(${PENDING_RGB[0]}, ${PENDING_RGB[1]}, ${PENDING_RGB[2]})`,
      strokeWidth: '1.2px',
      glow: '',
      valence,
      ties,
      pending: true,
    };
  }
  if (coverage === 'none' || (ties === 0 && Math.abs(valence) < 0.05)) return null;
  const c = toneColor(valence);
  const a = toneAlpha(ties);
  const strong = Math.abs(valence) >= STRONG;
  return {
    fillColor: rgba(c, a),
    hoverFillColor: rgba(c, Math.min(HOVER_MAX, a + HOVER_BOOST)),
    strokeColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
    strokeWidth: strong ? '1.8px' : '1.2px',
    glow: strong ? (valence > 0 ? 'emerald' : 'rose') : '',
    valence,
    ties,
    pending: false,
  };
}

'''
open(P, 'w', encoding='utf-8').write(s[:a] + new_block + s[b:])
print('ok', P)

# 4. builder: important pairs are painted even when their coverage is 'none'
edit('components/geopolitical-monitor/hooks/monitor/engine-relations.ts',
     "    if (!p || p.coverage === 'none') continue;\n    const tone = toneOf(p.valence, p.ties, p.coverage);",
     "    if (!p) continue;\n    const tone = toneOf(p.valence, p.ties, p.coverage, p.important);")

# 5. 2D map: pending pairs use the hatch pattern
edit('components/geopolitical-monitor/components/map2d/country-styler.ts',
     "    fillColor: hover ? t.hoverFillColor : t.fillColor,",
     "    fillColor: t.pending ? 'url(#hatch-pending)' : hover ? t.hoverFillColor : t.fillColor,")
edit('components/geopolitical-monitor/components/map2d/MapDefs.tsx',
     "function SingleGlowFilter({ id }: { id: string }) {",
     '''/** Diagonal amber hatch: the pair is expected to have a position but none is recorded ("falta dato"). */
function PendingHatch() {
  return (
    <pattern id="hatch-pending" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="rgba(15, 23, 42, 0.55)" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(245, 158, 11, 0.75)" strokeWidth="1.6" />
    </pattern>
  );
}

function SingleGlowFilter({ id }: { id: string }) {''')
edit('components/geopolitical-monitor/components/map2d/MapDefs.tsx',
     "      <ArcGradientsAndMarkers />\n",
     "      <ArcGradientsAndMarkers />\n      <PendingHatch />\n")

# 6. panel: a group and a line for the pending pairs; the 'connected' group no longer includes them
B = 'components/geopolitical-monitor/components/sidebar/BilateralRelationsSection.tsx'
edit(B, "      connected: scores.filter((s) => s.valence > -5 && s.valence < 5).sort((a, b) => b.ties - a.ties).slice(0, 6),",
     "      pending: scores.filter((s) => s.important && Math.abs(s.valence) < 5).sort((a, b) => b.ties - a.ties).slice(0, 6),\n      connected: scores.filter((s) => !s.important && s.valence > -5 && s.valence < 5).sort((a, b) => b.ties - a.ties).slice(0, 6),")
edit(B, "  const structuralOnly = scores.every((s) => !s.eventsAnalysed);",
     "  const structuralOnly = scores.every((s) => !s.eventsAnalysed);\n  const pendingCount = scores.filter((s) => s.important && Math.abs(s.valence) < 5).length;")
edit(B, '      <Group title="Más conectados, sin posición registrada" items={groups.connected} open={open} setOpen={setOpen} />',
     '      <Group title="Dato pendiente: relación esperable sin posición registrada" items={groups.pending} open={open} setOpen={setOpen} />\n      <Group title="Más conectados, sin posición registrada" items={groups.connected} open={open} setOpen={setOpen} />')
edit(B, '        <p className="mt-1 text-[10px] text-zinc-500">Color = posición (rivalidad ← → alianza). Más opaco = más vínculos (embajadas, comercio, migración, tratados).</p>',
     '''        <p className="mt-1 text-[10px] text-zinc-500">Color = posición (rivalidad ← → alianza). Más opaco = más vínculos (embajadas, comercio, migración, tratados).</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-zinc-500" data-testid="pending-legend">
          <span className="w-3 h-2 rounded-sm shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(245,158,11,0.75) 0 2px, rgba(15,23,42,0.55) 2px 5px)' }} />
          <span>Rayado: relación esperable sin posición registrada ({pendingCount} países; falta dato)</span>
        </div>''')

# 7. tests
T = '__tests__/bilateral-relations.test.tsx'
edit(T, "import { TIES, TONE_STOPS, splitRelation, toneAlpha, toneColor, toneOf, positionLabelEs, NODATA_FILL } from '@/lib/services/bilateral-relations/valence';",
     "import { TIES, TONE_STOPS, splitRelation, toneAlpha, toneColor, toneOf, positionLabelEs, NODATA_FILL, gapKind } from '@/lib/services/bilateral-relations/valence';")
s = open(T, encoding='utf-8').read()
s += '''
describe('pending data (important pair without a recorded position)', () => {
  it('classifies the gap of a pair', () => {
    expect(gapKind(35, 0, false)).toBe('position');
    expect(gapKind(0, 10, true)).toBe('pending');
    expect(gapKind(0, 10, false)).toBe('connected');
    expect(gapKind(0, 0, false)).toBe('none');
    expect(gapKind(4.9, 3, true)).toBe('pending');
    expect(gapKind(-12, 0, true)).toBe('position');       // a recorded position wins over importance
  });

  it('paints an important pair without position as pending, even with coverage none', () => {
    const t = toneOf(0, 0, 'none', true)!;
    expect(t.pending).toBe(true);
    expect(t.fillColor).toBe('rgba(245, 158, 11, 0.18)');
    expect(toneOf(0, 10, 'low', false)!.pending).toBe(false);
    expect(toneOf(35, 20, 'high', true)!.pending).toBe(false);
    expect(toneOf(0, 0, 'none', false)).toBeNull();        // not important and nothing recorded: stays grey
  });

  it('reads the importance flag (8th element) and defaults to false', () => {
    const D2: any = { ...DATA, pairs: { ...DATA.pairs, 'ES-FR': [...DATA.pairs['ES-FR'], 1] } };
    const r = getCountryRelations('ES', D2)!;
    expect(r.partners.find((p) => p.partner === 'FR')!.important).toBe(true);
    expect(r.partners.find((p) => p.partner === 'MA')!.important).toBe(false);
  });
});
'''
open(T, 'w', encoding='utf-8').write(s)
print('ok', T)
print('PATCH COMPLETE')
