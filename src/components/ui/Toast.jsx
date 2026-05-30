import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message }) {
  return (
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-premium">
      {message}
    </motion.div>
  );
}
