export default function CodePanel({ title, code }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-lg font-black">{title}</h3>
      <pre className="max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
