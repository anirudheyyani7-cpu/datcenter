'use client';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InsightStrip({ insights = [] }) {
  if (!insights.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="bg-grey-bg border border-grey-border rounded-2xl px-4 py-3 flex items-center gap-4 overflow-x-auto"
    >
      <div className="flex items-center gap-1.5 flex-shrink-0 text-text-secondary">
        <Lightbulb size={13} className="text-amber" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Why these modules</span>
      </div>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {insights.map((insight, i) => (
          <span key={i} className="text-[11px] text-text-secondary whitespace-nowrap flex-shrink-0">
            {i > 0 && <span className="text-grey-border mr-4">|</span>}
            {insight}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
