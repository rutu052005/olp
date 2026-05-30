import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, X, Compass } from 'lucide-react';

export default function Sidebar({ nav, open, onClose }) {
  const location = useLocation();
  const content = (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#101827] p-5 text-white shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold" onClick={onClose}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ocean">
            <GraduationCap size={21} />
          </span>
          LearnSphere
        </Link>
        <button className="icon-btn bg-white/10 text-white lg:hidden" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={19} />
              {item.label}
            </Link>
          );
        })}
        <Link 
          to="/courses" 
          onClick={onClose} 
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${location.pathname === '/courses' ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          <Compass size={19} />
          <span>Find Courses</span>
        </Link>
      </nav>
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">JWT-ready API</p>
        <p className="mt-1 text-xs text-slate-400">Protected routes, roles, and SQL-backed endpoints are scaffolded.</p>
      </div>
    </aside>
  );
  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <AnimatePresence>{open && <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="lg:hidden">{content}</motion.div>}</AnimatePresence>
    </>
  );
}
