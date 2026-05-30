export default function Input({ label, ...props }) {
  return (
    <label className="mt-4 block text-sm font-bold">
      {label}
      <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none transition focus:border-ocean focus:ring-4 focus:ring-ocean/10 dark:border-white/10 dark:bg-white/5" {...props} />
    </label>
  );
}
