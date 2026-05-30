export default function MetricGrid({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map(([label, value, Icon, color]) => (
        <div key={label} className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
          <div className={`grid h-13 w-13 place-items-center rounded-2xl p-3 ${color}`}>
            <Icon />
          </div>
        </div>
      ))}
    </div>
  );
}
