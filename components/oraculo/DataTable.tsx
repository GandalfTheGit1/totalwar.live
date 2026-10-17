'use client';

import React from 'react';
import type { DataTableProps } from './types';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectedKey,
  onSelect,
  label,
  caption,
  className,
}: DataTableProps) {
  return (
    <div className={cx('orc-table-wrap', className)}>
      <table className="orc-table" aria-label={label}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cx('label orc-eyebrow', col.align === 'right' && 'orc-right')}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="body-sm text-ink-faint text-center py-6"
              >
                Sin datos para este periodo
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const rowId =
                (row[rowKey] as string | number | undefined) ??
                (row.id as string | number | undefined) ??
                idx;
              const selected =
                selectedKey != null &&
                (selectedKey === rowId || String(selectedKey) === String(rowId));

              return (
                <tr
                  key={String(rowId)}
                  className={cx('orc-row', selected && 'orc-row--selected')}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-selected={onSelect ? selected : undefined}
                  onClick={onSelect ? () => onSelect(rowId) : undefined}
                  onKeyDown={
                    onSelect
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(rowId);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cx(
                        'body-sm',
                        col.mono && 'num-sm orc-cell-mono',
                        col.align === 'right' && 'orc-right'
                      )}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {caption ? <p className="body-sm orc-table-caption">{caption}</p> : null}
    </div>
  );
}
