'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MODULE_LABELS } from '@/data/decisionModules';

function renderValue(value) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1 mt-1">
        {value.map((item, i) => (
          <li key={i} className="text-[11px] text-text-secondary">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="mt-1 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-text-muted">{k}</span>
            <span className="text-text-primary font-medium">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-text-primary font-medium">{String(value)}</span>;
}

export default function DrillDownModal({ moduleKey, data, reason, onClose }) {
  return (
    <AnimatePresence>
      {moduleKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(26,31,54,0.45)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-5 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-extrabold text-text-primary text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {MODULE_LABELS[moduleKey] || moduleKey}
              </p>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-grey-bg flex items-center justify-center text-text-secondary">
                <X size={14} />
              </button>
            </div>
            {reason && (
              <p className="text-[11px] text-text-secondary bg-grey-bg rounded-lg px-3 py-2 mb-3">{reason}</p>
            )}
            <div className="space-y-2.5">
              {Object.entries(data || {}).map(([key, value]) => (
                <div key={key}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{key.replace(/_/g, ' ')}</p>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
