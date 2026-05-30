export default function Timeline({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.title}${index}`} className="flex gap-3">
          <div className="mt-1 h-3 w-3 rounded-full bg-ocean" />
          <div>
            <p className="font-bold">{item.title}</p>
            <p className="text-sm text-slate-500">{item.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
