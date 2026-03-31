import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface TransactionToastProps {
  open: boolean;
  message: string;
  onClose?: () => void;
}

export const TransactionToast: React.FC<TransactionToastProps> = ({ open, message, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="transaction-toast"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border border-white/20 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transaction Complete</p>
              <p className="text-xs text-slate-400">{message}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200 hover:bg-slate-700"
            >
              Close
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
