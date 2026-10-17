import type { ReactNode } from 'react';

export type BadgeTone = 'gain' | 'loss' | 'info' | 'notice' | 'neutral' | 'accent' | 'secondary';

export interface ButtonProps {
  /** primary: una por vista. secondary: acción habitual. accent: acción destacada. ghost: acción terciaria. */
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'md' | 'sm';
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface BadgeProps {
  /** gain: alza (▲). loss: baja (▼). info (◆). notice: atención (●). neutral (○). accent (◈). secondary (○). */
  tone?: BadgeTone;
  /** Alias para tone */
  variant?: BadgeTone;
  /** Glifo propio; false lo oculta. Por defecto, el del tono. */
  glyph?: string | false;
  /** Cifra en tipografía mono (variaciones, tickers). */
  mono?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface PanelProps {
  title?: string;
  eyebrow?: string;
  /** Botones de la cabecera, a la derecha. */
  actions?: ReactNode;
  dense?: boolean;
  raised?: boolean;
  /** Columnas que ocupa dentro de Workspace. */
  span?: 1 | 2 | 'full';
  className?: string;
  children?: ReactNode;
}

export interface MetricProps {
  label: string;
  /** Cifra ya formateada, con unidad. */
  value: string;
  /** Variación ya formateada y con signo, p. ej. "+2,1 pp". */
  delta?: string;
  direction?: 'up' | 'down' | 'flat';
  /** Fuerza el tono cuando subir no es bueno (deuda, pasivos) o para atención. */
  tone?: 'gain' | 'loss' | 'neutral' | 'notice' | 'info';
  /** Alias para tone */
  sentiment?: 'gain' | 'loss' | 'neutral' | 'notice' | 'info';
  /** Glifo personalizado opcional en lugar del direccional */
  glyph?: string;
  /** Fuente y periodo. */
  hint?: string;
  className?: string;
}

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  mono?: boolean;
  width?: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  /** Campo único de cada fila. Por defecto "id". */
  rowKey?: string;
  selectedKey?: string | number;
  onSelect?: (key: string | number) => void;
  label?: string;
  /** Fuente, unidad y periodo de la tabla. */
  caption?: string;
  className?: string;
}

export interface WorkspaceRailItem {
  id: string;
  label: string;
  glyph: string;
}

export interface WorkspaceProps {
  title?: string;
  actions?: ReactNode;
  rail?: WorkspaceRailItem[];
  active?: string;
  onSelect?: (id: string) => void;
  /** Paneles (Panel). */
  className?: string;
  children?: ReactNode;
}
