export default function ListItem({ icon: Icon, title, meta }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ocean shadow-sm dark:bg-slate-900">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="text-xs text-slate-500">{meta}</p>
      </div>
    </div>
  );
}
