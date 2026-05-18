'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAIInsights } from '@/data/command-center-mock';
import AIInsightCard from './AIInsightCard';

function Toast({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-[#1A1F36] border border-white/10 rounded-xl px-4 py-3 text-white text-sm shadow-2xl"
    >
      {message}
    </motion.div>
  );
}

export default function AIOperationsFeed() {
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden h-full relative">
      {/* Gradient top border */}
      <div className="h-0.5 bg-gradient-to-r from-[#00338D] via-[#0077C8] to-[#00A36C]" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Operations Feed</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0077C8]/10 text-[#0077C8] text-[10px] font-bold">
              <Sparkles size={9} /> AI-Powered
            </span>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">{mockAIInsights.length} insights</span>
        </div>

        <div className="space-y-2.5">
          {mockAIInsights.map(insight => (
            <AIInsightCard
              key={insight.id}
              insight={insight}
              onAction={() => showToast('Action routing coming soon')}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
