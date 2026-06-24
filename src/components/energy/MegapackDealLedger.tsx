'use client';

import type { MegapackDealRow } from '@/types/energy';
import { SourceLink } from './SourceLink';

const STATUS_STYLES: Record<MegapackDealRow['status'], string> = {
  announced: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'under-construction': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  operational: 'bg-green-500/10 text-green-400 border-green-500/30',
};

interface MegapackDealLedgerProps {
  deals: MegapackDealRow[];
}

export function MegapackDealLedger({ deals }: MegapackDealLedgerProps) {
  const rows = deals.filter((d) => d.sourceUrl?.startsWith('http'));
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white tracking-wider">Megapack Deal Ledger</h3>
        <span className="text-[9px] text-neutral-500">{rows.length} sourced rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] normal-case">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500">
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Capacity</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.customer}-${row.date}`} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                <td className="px-4 py-2.5 text-white font-medium">{row.customer}</td>
                <td className="px-4 py-2.5 text-neutral-300 tabular-nums">{row.capacity}</td>
                <td className="px-4 py-2.5 text-neutral-400">{row.location ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded border text-[9px] uppercase ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-neutral-400">{row.date}</td>
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