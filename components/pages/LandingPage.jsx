'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, X, Bot } from 'lucide-react';
import LifecycleWheel from '@/components/lifecycle-wheel/LifecycleWheel';
import { LoadingDots } from '@/components/shared/LoadingDots';
import { callClaude } from '@/lib/claude-api';
import { parseMarkdown } from '@/utils/helpers';
import useAppStore from '@/store/appStore';

const PLATFORM_PROMPT = `Provide a concise, executive-level summary (300 words max) of the K-Nexus Datacenter Lifecycle Management platform. Explain what it does, who it's for, and how AI enhances each of the 6 lifecycle stages: Strategy Assessment, Supply Chain Sourcing, Design & Build, Compliance, Operations, and Monetization. Frame it as a KPMG capability pitch for senior datacenter industry professionals.`;
const PLATFORM_RAG_QUERY = 'datacenter lifecycle management AI platform market 2025';


function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,51,141,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,51,141,0.055) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 800,
          background: 'radial-gradient(circle, rgba(0,119,200,0.07) 0%, transparent 65%)',
          borderRadius: '50%',
        }}
      />
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1.5,
            height: Math.random() * 3 + 1.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(0, ${51 + Math.random() * 70}, ${141 + Math.random() * 59}, ${0.15 + Math.random() * 0.2})`,
          }}
          animate={{ y: [0, -30 - Math.random() * 20, 0], x: [0, (Math.random() - 0.5) * 20, 0], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function PlatformModal({ onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    callClaude({ prompt: PLATFORM_PROMPT, maxTokens: 600, ragQuery: PLATFORM_RAG_QUERY })
      .then(setContent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(13,20,40,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#1A1F36] border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00338D] flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Platform Intelligence Summary
              </h2>
              <p className="text-white/40 text-xs">K-Nexus Datacenter Lifecycle Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1"><X size={20} /></button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <LoadingDots color="#0077C8" size={10} />
            <span className="text-white/50 text-sm">Generating executive summary...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
            <p className="mt-2 text-red-400/70 text-xs">Contact your system administrator</p>
          </div>
        )}
        {content && (
          <div className="text-white/80 text-sm leading-relaxed ai-output"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
        )}

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/30 text-xs">© KPMG K-Nexus.AI · Confidential</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#0077C8] hover:bg-[#0088e0] text-white text-sm font-semibold rounded-lg transition-colors">
            Explore Platform
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { introComplete, setIntroComplete } = useAppStore();
  const [phase, setPhase] = useState(introComplete ? 'done' : 'logo');

  useEffect(() => {
    if (introComplete) return;
    const t1 = setTimeout(() => setPhase('shrink'), 1500);
    const t2 = setTimeout(() => setPhase('wheel'), 2200);
    const t3 = setTimeout(() => { setPhase('done'); setIntroComplete(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <AnimatedBackground />

      <AnimatePresence>
        {(phase === 'logo' || phase === 'shrink') && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: phase === 'shrink' ? 0.3 : 1, opacity: phase === 'logo' ? 1 : 0, y: phase === 'shrink' ? -100 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="text-7xl font-extrabold text-[#00338D] tracking-widest mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KPMG</div>
              <div className="text-[#6B7280] text-sm tracking-[6px] uppercase">Datacenter Intelligence</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 pt-28 pb-24 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Hero */}
          <motion.div className="text-center mb-16" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}>
            {/* KPMG badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00338D]/8 border border-[#00338D]/15 rounded-full mb-6">
              <div className="w-5 h-5 rounded bg-[#00338D] flex items-center justify-center">
                <span className="text-white text-[10px] font-extrabold">K</span>
              </div>
              <span className="text-[#00338D] text-xs font-bold tracking-wider uppercase">KPMG Advisory · Confidential</span>
            </div>

            <h1 className="text-5xl font-extrabold text-[#1A1F36] mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Datacenter Lifecycle
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00338D, #0077C8)' }}>
                Intelligence Platform
              </span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto leading-relaxed">
              AI-powered orchestration across 6 datacenter lifecycle stages —
              from market strategy to monetization.
            </p>

            {/* Tagline pills */}
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              {['Assess', 'Analyse', 'Recommend', 'Deliver Outcomes'].map((word, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="px-4 py-1.5 rounded-full text-sm font-bold border"
                    style={{
                      backgroundColor: i === 3 ? '#00338D' : 'white',
                      color: i === 3 ? 'white' : '#00338D',
                      borderColor: '#00338D',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {word}
                  </motion.span>
                  {i < 3 && <span className="text-[#CBD5E1] font-light text-lg">→</span>}
                </div>
              ))}
            </div>

            {/* Decorative accent line */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00338D]/30" />
              <div className="flex gap-1.5">
                {['#00338D','#0055A4','#0077C8'].map((c,i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00338D]/30" />
            </div>
          </motion.div>

          {/* Wheel */}
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 150 }}
              >
                <LifecycleWheel onCenterClick={() => setShowModal(true)} />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00338D] text-white font-bold rounded-xl hover:bg-[#0044b8] transition-colors text-sm shadow-lg shadow-[#00338D]/20"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Globe size={16} />
                Global Datacenter Dashboard
                <ArrowRight size={15} />
              </button>
              <p className="text-[#9CA3AF] text-xs text-center mt-2">Global coverage · Live intelligence</p>
            </motion.div>
          </div>

          {/* Stage cards */}
          <motion.div className="mt-24" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
            <h2 className="text-[#9CA3AF] text-center text-sm font-semibold uppercase tracking-widest mb-8">6 Integrated Lifecycle Stages</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { num: '01', label: 'Strategy\nAssessment',   path: '/stage/01' },
                { num: '02', label: 'Supply Chain\nSourcing', path: '/stage/02' },
                { num: '03', label: 'Design &\nBuild',        path: '/stage/03' },
                { num: '04', label: 'Compliance\nChecks',     path: '/stage/04' },
                { num: '05', label: 'DC\nOperations',         path: '/stage/05' },
                { num: '06', label: 'DC\nMonetization',       path: '/stage/06' },
              ].map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => router.push(s.path)}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center hover:bg-[#F4F6F9] hover:border-[#0077C8]/40 hover:shadow-md transition-all group hover:-translate-y-1 shadow-sm relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.06 }}
                >
                  {/* subtle gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00338D] to-[#0077C8] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[#0077C8] font-mono font-bold text-xs mb-2">{s.num}</div>
                  <div className="text-[#1A1F36] font-semibold text-xs leading-tight whitespace-pre-line" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {s.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div className="mt-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <p className="text-[#CBD5E1] text-xs">© KPMG 2025 · K-Nexus Datacenter Intelligence · Strictly Confidential</p>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <PlatformModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
