import { GraduationCap } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-[#0c111d]">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-ocean text-white shadow-glow">
          <GraduationCap size={28} />
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
