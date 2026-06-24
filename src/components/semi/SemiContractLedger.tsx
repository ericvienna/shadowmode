'use client';

import type { SemiContractRow } from '@/types/semi';
import { getSortedContracts } from '@/lib/semi-seed-data';
import { SourceLink } from '../energy/SourceLink';

const STATUS_STYLES: Record<SemiContractRow['status'], string> = {
  reserved: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'reserved-stale': 'bg-red-500/10 text-red-400/80 border-red-500/20',
  'deposit-order': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'operating-pilot': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'delivered-volume': 'bg-green-500/10 text-green-400 border-green-500/30',
};

const STATUS_LABELS: Record<SemiContractRow['status'], string> = {
  reserved: 'Reserved',
  'reserved-stale': 'Reserved — STALE',
  'deposit-order': 'Deposit / Order',
  'operating-pilot': 'Operating (pilot)',
  'delivered-volume': 'Delivered (volume)',
};

function isHotRow(status: SemiContractRow['status']) {
  return status === 'operating-pilot' || status === 'delivered-volume' || status === 'deposit-order';
}

export function SemiContractLedger() {
  const rows = getSortedContracts();
  if (rows.length === 0) return null;

  const hotCount = rows.filter((r) => isHotRow(r.status)).length;
  const staleCount = rows.filter((r) => r.status === 'reserved-stale').length;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white tracking-wider">Semi Contract Ledger</h3>
        <span className="text-[9px] text-neutral-500">
          {rows.length} sourced rows · {hotCount} converting · {staleCount} stale
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] normal-case">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500">
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Units</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">First Announced</th>
              <th className="px-4 py-2 font-medium">Latest Update</th>
              <th className="px-4 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.customer}-${row.firstAnnounced}`}
                className={`border-b border-neutral-800/50 hover:bg-neutral-900/50 ${
                  isHotRow(row.status)
                    ? 'bg-cyan-500/5'
                    : row.stale
                      ? 'bg-red-500/5 opacity-70'
                      : row.status === 'reserved'
                        ? 'opacity-90'
                        : ''
                }`}
              >
                <td
                  className={`px-4 py-2.5 font-medium ${
                    isHotRow(row.status) ? 'text-cyan-100' : row.stale ? 'text-neutral-500' : 'text-white'
                  }`}
                >
                  {row.customer}
                </td>
                <td
                  className={`px-4 py-2.5 tabular-nums ${
                    isHotRow(row.status) ? 'text-cyan-200' : row.stale ? 'text-neutral-600' : 'text-neutral-300'
                  }`}
                >
                  {row.units}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded border text-[9px] uppercase ${STATUS_STYLES[row.status]}`}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className={`px-4 py-2.5 ${row.stale ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {row.firstAnnounced}
                </td>
                <td
                  className={`px-4 py-2.5 max-w-[200px] ${row.stale ? 'text-neutral-600' : 'text-neutral-400'}`}
                >
                  {row.latestUpdate}
                </td>
                <td className="px-4 py-2.5">
                  <SourceLink url={row.sourceUrl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}