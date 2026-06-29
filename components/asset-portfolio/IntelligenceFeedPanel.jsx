'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/assetPortfolioCalc';

function severityColor(sev) {
  if (sev >= 8) return STATUS_COLORS.red;
  if (sev >= 6) return STATUS_COLORS.amber;
  return STATUS_COLORS.green;
}

export default function IntelligenceFeedPanel({ feed, assetsById, onRefresh, refreshing }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-sm rounded-xl border border-grey-border shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-grey-border">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-amber" />
          <span className="text-xs font-bold text-text-primary">Intelligence Feed</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Intelligence"
            className="p-1 rounded-md hover:bg-grey-bg text-text-secondary disabled:opacity-40"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded-md hover:bg-grey-bg text-text-secondary">
            {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto divide-y divide-grey-border">
              {feed.length === 0 && (
                <div className="px-3 py-4 text-[11px] text-text-muted text-center">No intelligence detected yet.</div>
              )}
              {feed.map((item) => (
                <div key={item.id || `${item.asset_id}-${item.detected_at}`} className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: severityColor(item.severity) }} />
                    <span className="text-[10px] font-semibold text-text-primary truncate">
                      {assetsById[item.asset_id]?.asset_name || item.asset_id}
                    </span>
                    <span className="text-[9px] text-text-muted ml-auto flex-shrink-0">{item.category}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">{item.headline}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
