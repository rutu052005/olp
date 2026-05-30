import { Edit3, Trash2 } from 'lucide-react';

export default function DataTable({ rows, columns, actions = false }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            {columns.map((c) => <th key={c} className="px-3 py-3 font-black capitalize text-slate-500">{c.replaceAll('_', ' ')}</th>)}
            {actions && <th className="px-3 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-b border-slate-100 dark:border-white/5">
              {columns.map((c) => <td key={c} className="px-3 py-3 font-semibold">{String(row[c] ?? '-')}</td>)}
              {actions && (
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button className="icon-btn"><Edit3 size={16} /></button>
                    <button className="icon-btn"><Trash2 size={16} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Showing 1-{rows.length} rows</span>
        <div className="flex gap-2">
          <button className="chip">Previous</button>
          <button className="chip">Next</button>
        </div>
      </div>
    </div>
  );
}
