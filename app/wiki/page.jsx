'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { X, Network } from 'lucide-react';
import { CATEGORIES, NODES, EDGES } from '@/data/dcKnowledgeGraph';

const DCKnowledgeGraph = dynamic(
  () => import('@/components/wiki/DCKnowledgeGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0f1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/30 text-xs">Loading knowledge graph…</span>
        </div>
      </div>
    ),
  }
);

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const stats = [
    { label: 'Nodes',      value: NODES.length,      color: '#2563eb' },
    { label: 'Edges',      value: EDGES.filter(e => e.source && e.target).length, color: '#7c3aed' },
    { label: 'Domains',    value: CATEGORIES.length,  color: '#0d9488' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1a] flex flex-col overflow-hidden">

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex-shrink-0 bg-[#0f172a] border-b border-white/[0.08] px-5 py-3 flex items-center justify-between gap-4"
      >
        {/* Left: close + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <X size={14} className="text-white/50" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#0d9488]/20 flex items-center justify-center flex-shrink-0">
              <Network size={14} className="text-[#0d9488]" />
            </div>
            <div className="min-w-0">
              <p
                className="font-extrabold text-white text-sm leading-tight truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                DC Knowledge Graph
              </p>
              <p className="text-[9px] text-white/30 leading-tight">
                K-Nexus · Datacenter Domain Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Right: stat chips */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {stats.map(s => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg"
            >
              <span className="text-sm font-black tabular-nums" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[9px] text-white/35 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — domain legend */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-48 flex-shrink-0 bg-[#0f172a] border-r border-white/[0.07] overflow-y-auto flex flex-col"
        >
          <div className="p-3">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2.5 px-1">
              Domains
            </p>

            {/* All domains button */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-2 mb-1 ${
                activeCategory === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white/30 flex-shrink-0" />
              <span className="truncate">All Domains</span>
              <span className="ml-auto text-[9px] opacity-50">{NODES.length}</span>
            </button>

            {/* Category buttons */}
            {CATEGORIES.map(cat => {
              const count = NODES.filter(n => n.category === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? 'all' : cat.id)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-2 mb-0.5"
                  style={
                    isActive
                      ? { backgroundColor: cat.color + '20', color: cat.color }
                      : { color: 'rgba(255,255,255,0.38)' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate leading-tight">{cat.label}</span>
                  <span
                    className="ml-auto text-[9px] flex-shrink-0"
                    style={{ opacity: isActive ? 0.7 : 0.4 }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend: interaction hints */}
          <div className="mt-auto p-3 border-t border-white/[0.06]">
            <p className="text-[9px] text-white/20 leading-relaxed">
              Click a domain to filter · Click a node to highlight connections · Drag to explore
            </p>
          </div>
        </motion.div>

        {/* Graph canvas */}
        <div className="flex-1 relative overflow-hidden">
          <DCKnowledgeGraph activeCategory={activeCategory} />
        </div>

      </div>
    </div>
  );
}
