import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 p-10 text-center dark:border-white/15">
      <Sparkles className="mx-auto text-ocean" />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-1 text-slate-500">{text}</p>
    </div>
  );
}
