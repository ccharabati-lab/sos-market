'use client';

import type { ReactNode } from 'react';

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-default bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-bg-subtle text-caption uppercase tracking-[0.08em] text-text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {rows.map((row, index) => (
            <tr key={index} className="transition-colors duration-180 hover:bg-bg-subtle">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-text-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
