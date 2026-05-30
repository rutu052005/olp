import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import DataTable from '../../components/ui/DataTable';
import CodePanel from '../../components/ui/CodePanel';
import Skeleton from '../../components/ui/Skeleton';
import { adminApi } from '../../api/client';
import { databaseTables } from '../../sampleData';

export default function DatabaseViewer() {
  const [table, setTable] = useState('users');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTableData() {
      setLoading(true);
      try {
        const res = await adminApi.table(table);
        setColumns(res.data.columns);
        setRows(res.data.rows);
        setConnected(res.data.connected);
      } catch (err) {
        console.warn(`Could not browse live table ${table}, falling back to mock data:`, err);
        const fallback = databaseTables[table];
        if (fallback) {
          setColumns(fallback.columns);
          setRows(fallback.rows);
        }
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    fetchTableData();
  }, [table]);

  const filteredRows = rows.filter((row) =>
    columns.some((col) => String(row[col] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Database Viewer"
          subtitle="Admin-only SQL table browser with rows, query preview, pagination, filters, and API JSON output."
        />

        {connected ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Connected to PostgreSQL: learnsphere
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" /> Running in Offline Fallback (Mock Mode)
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="card h-fit lg:sticky lg:top-24">
            <h3 className="mb-3 text-lg font-black">SQL Tables</h3>
            <div className="space-y-1">
              {Object.keys(databaseTables).map((name) => (
                <button
                  key={name}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold ${
                    table === name ? 'bg-ocean text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setTable(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </aside>
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h3 className="text-xl font-black">{table}</h3>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/5">
                  <Search size={16} />
                  <input
                    className="bg-transparent text-sm outline-none"
                    placeholder="Search rows"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable rows={filteredRows} columns={columns} />
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CodePanel
                title="Query preview"
                code={`SELECT ${columns.join(', ')}\nFROM ${table}\nORDER BY id DESC\nLIMIT 50;`}
              />
              <CodePanel
                title="API response panel"
                code={JSON.stringify({ endpoint: `/api/admin/database/${table}`, connected, rows: rows.slice(0, 2) }, null, 2)}
              />
            </div>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
