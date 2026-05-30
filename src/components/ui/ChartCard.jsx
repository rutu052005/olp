import { MoreHorizontal } from 'lucide-react';

export default function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card min-w-0 min-h-0 overflow-hidden ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">{title}</h3>
        <MoreHorizontal className="text-slate-400" />
      </div>
      {children}
    </div>
  );
}
