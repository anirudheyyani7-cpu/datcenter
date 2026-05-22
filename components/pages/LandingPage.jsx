'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, X, Upload, FileText, Sparkles, LayoutDashboard, MessageCircle, Send, ChevronRight, ExternalLink, Clock, Newspaper } from 'lucide-react';
import LifecycleWheel from '@/components/lifecycle-wheel/LifecycleWheel';
import { LoadingDots } from '@/components/shared/LoadingDots';
import { callClaude } from '@/lib/claude-api';
import useAppStore from '@/store/appStore';

// ── Stage directory the guide bot knows about ─────────────────────────────
const STAGE_DIRECTORY = [
  { num: '01', path: '/stage/01', label: 'Strategy', keywords: ['strategy', 'market', 'region', 'country', 'entry', 'invest', 'business case', 'feasibility', 'where', 'opportunity', 'demand'] },
  { num: '02', path: '/stage/02', label: 'Supply Chain Management', keywords: ['supply', 'procurement', 'vendor', 'equipment', 'hardware', 'component', 'sourcing', 'buy', 'cost', 'budget', 'capex'] },
  { num: '03', path: '/stage/03', label: 'Design & Build', keywords: ['design', 'build', 'construct', 'architecture', 'cooling', 'power', 'tier', 'pue', 'rack', 'mep', 'engineer'] },
  { num: '04', path: '/stage/04', label: 'Compliance', keywords: ['compliance', 'regulation', 'legal', 'gdpr', 'dpdp', 'license', 'permit', 'esg', 'audit', 'certification', 'iso', 'tax'] },
  { num: '05', path: '/stage/05', label: 'Operations', keywords: ['operate', 'operations', 'run', 'staff', 'dcim', 'monitoring', 'uptime', 'sla', 'incident', 'maintenance', 'efficiency'] },
  { num: '06', path: '/stage/06', label: 'Monetization', keywords: ['monetize', 'revenue', 'colocation', 'pricing', 'customer', 'tenant', 'ebitda', 'profit', 'sell', 'lease'] },
];

const GUIDE_BOT_SYSTEM = `You are the K-Nexus Guide — a friendly, concise AI assistant on the KPMG K-Nexus Datacenter Intelligence Platform landing page.

Your job: understand what the user wants to accomplish, then recommend the most relevant stage(s) to start with.

The 6 stages are:
01 - Strategy: Market opportunity, region selection, demand analysis, investment thesis
02 - Supply Chain Management: Procurement strategy, vendors, components, CapEx planning
03 - Design & Build: Technical architecture, cooling, power, tier rating, construction approach
04 - Compliance: Regulatory requirements, data sovereignty, ESG, certifications
05 - Operations: Day-to-day running, DCIM, staffing, PUE optimization, SLAs
06 - Monetization: Revenue models, pricing, colocation, customer segments

RULES:
- Be warm, brief, and direct. Max 2–3 sentences before your recommendation.
- Always end with a raw JSON block (no markdown fences, no backticks) in this exact format:
  {"stage": "01", "label": "Strategy", "reason": "one short sentence"}
- The JSON must be the very last thing in your response. No text after it.
- If the user is clearly asking about multiple stages, pick the best starting point.
- If the message is a greeting or too vague, ask one clarifying question and do NOT include the JSON block yet.
- Never make up features — only reference the 6 stages above.`;

// ── AnimatedBackground (unchanged) ────────────────────────────────────────
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

// ── Upload Modal (unchanged) ───────────────────────────────────────────────
function UploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setUploadedDocAnalysis, setUploadedDocName } = useAppStore();
  const fileInputRef = useRef(null);

  const readFileContent = (f) =>
    new Promise((resolve) => {
      if (/\.(txt|md|csv)$/i.test(f.name)) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(f);
      } else {
        resolve(null);
      }
    });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    const content = await readFileContent(file);
    const prompt = content
      ? `You are the KPMG K-Nexus Datacenter Intelligence Engine analyzing a client's datacenter strategy document.\n\nDocument: "${file.name}"\n\n## Document Content\n${content.slice(0, 8000)}\n\nProvide a comprehensive analysis of this datacenter strategy. Structure your response with:\n\n# Executive Summary\n# Key Findings\n# Strategy Gaps & Risks\n# Recommendations & Actions\n# Next Steps & Implementation Roadmap\n# KPIs & Success Metrics\n\nBe specific, reference the document content directly, identify gaps versus industry best practices, and provide quantitative benchmarks where possible.`
      : `You are the KPMG K-Nexus Datacenter Intelligence Engine. A client has uploaded a datacenter strategy document named "${file.name}" for analysis.\n\nProvide a comprehensive strategic analysis covering market positioning, infrastructure planning, operational efficiency, compliance readiness, and monetization opportunities. Structure your response with:\n\n# Executive Summary\n# Key Findings\n# Strategy Gaps & Risks\n# Recommendations & Actions\n# Next Steps & Implementation Roadmap\n# KPIs & Success Metrics\n\nUse specific data-driven insights and quantitative benchmarks typical of a KPMG datacenter strategy advisory engagement.`;

    callClaude({ prompt, maxTokens: 16000 })
      .then(text => {
        setUploadedDocAnalysis(text);
        setUploadedDocName(file.name);
        router.push('/stage/analysis');
      })
      .catch(err => {
        setError(err.message);
        setIsAnalyzing(false);
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

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
        className="bg-[#1A1F36] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00338D] flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Analyse Your Strategy
              </h2>
              <p className="text-white/40 text-xs">Upload a document to get AI-powered datacenter insights</p>
            </div>
          </div>
          {!isAnalyzing && (
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1"><X size={20} /></button>
          )}
        </div>

        {!isAnalyzing ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-[#0077C8] bg-[#0077C8]/10' :
                file ? 'border-[#00A36C]/50 bg-[#00A36C]/5' :
                'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.docx"
                className="hidden"
                onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-[#00A36C]" />
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">{file.name}</p>
                    <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(1)} KB · Ready to analyse</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload size={32} className="text-white/30 mx-auto mb-3" />
                  <p className="text-white/70 text-sm font-semibold mb-1">Drop your strategy document here</p>
                  <p className="text-white/30 text-xs">PDF, DOCX, TXT · Click to browse</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs">{error}</div>
            )}

            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/20 text-white/60 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
              <button
                onClick={handleAnalyze}
                disabled={!file}
                className="flex-1 px-4 py-2.5 bg-[#0077C8] hover:bg-[#0088e0] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />Analyse Document
              </button>
            </div>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#00338D]/20 flex items-center justify-center">
                <Sparkles size={28} className="text-[#0077C8]" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-2 border-[#0077C8]/40 border-t-[#0077C8] rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm mb-1">Analysing with K-Nexus AI</p>
              <p className="text-white/40 text-xs">Generating insights from your strategy document...</p>
            </div>
            <LoadingDots color="#0077C8" size={8} />
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/20 text-xs text-center">© KPMG K-Nexus.AI · Strictly Confidential</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Guide Bot ─────────────────────────────────────────────────────────────
function GuideBot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(null); // { stage, label, path, reason }
  const [showThought, setShowThought] = useState(true);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Hide the thought bubble after 6s or when the bot opens
  useEffect(() => {
    const t = setTimeout(() => setShowThought(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setShowThought(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          text: "Hi! I'm your K-Nexus guide. Tell me what you're trying to achieve — building a new datacenter, improving operations, exploring a market — and I'll point you to the right stage.",
        }]);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const parseResponse = (text) => {
    // Remove the JSON stage block first (with or without markdown fences)
    let cleanText = text
      .replace(/```json[\s\S]*?```/gi, '')   // fenced ```json ... ```
      .replace(/```[\s\S]*?```/g, '')         // any other fenced block
      .replace(/\{[\s\S]*?"stage"\s*:\s*"[^"]*"[\s\S]*?\}/g, '') // bare JSON object
      .replace(/`{1,3}/g, '')                 // any stray backticks left over
      .trim();

    // Also parse the JSON for the redirect CTA
    let stageData = null;
    const jsonMatch = text.match(/\{[\s\S]*?"stage"\s*:\s*"([^"]*)"[\s\S]*?\}/);
    if (jsonMatch) {
      try { stageData = JSON.parse(jsonMatch[0]); } catch {}
    }

    return { cleanText, stageData };
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setRedirect(null);

    // Build conversation history for context
    const history = [...messages, userMsg]
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n\n');

    const prompt = `${history}`;

    try {
      const response = await callClaude({
        prompt,
        systemOverride: GUIDE_BOT_SYSTEM,
        maxTokens: 400,
      });

      const { cleanText, stageData } = parseResponse(response);

      setMessages(prev => [...prev, { role: 'assistant', text: cleanText }]);

      if (stageData?.stage) {
        const match = STAGE_DIRECTORY.find(s => s.num === stageData.stage);
        if (match) {
          setRedirect({
            stage: match.num,
            label: match.label,
            path: match.path,
            reason: stageData.reason || '',
          });
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I hit an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Thought bubble */}
      <AnimatePresence>
        {showThought && !open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 pointer-events-none"
          >
            <div className="relative bg-white border border-[#E2E8F0] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg max-w-[180px]">
              <p className="text-[#1A1F36] text-xs font-semibold leading-snug">How can I help you?</p>
              <p className="text-[#9CA3AF] text-[10px] mt-0.5">Click to get started</p>
              {/* Tail */}
              <div className="absolute -bottom-2 right-3 w-3 h-3 bg-white border-r border-b border-[#E2E8F0] rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#00338D] text-white shadow-xl shadow-[#00338D]/30 flex items-center justify-center hover:bg-[#0044b8] transition-colors"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open guide bot"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#00338D] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K-Nexus Guide</p>
                <p className="text-white/50 text-[10px] mt-0.5">Find your starting stage</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#00338D] text-white rounded-br-sm'
                      : 'bg-[#F4F6F9] text-[#374151] rounded-bl-sm'
                  }`}>
                    {msg.text.replace(/```json\s*/gi, '').replace(/```/g, '').trim()}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F4F6F9] px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Stage redirect CTA */}
              {redirect && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0F4FF] border border-[#00338D]/15 rounded-xl p-3"
                >
                  <p className="text-[10px] text-[#6B7280] mb-1.5">Recommended stage</p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#00338D]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Stage {redirect.stage} — {redirect.label}
                      </p>
                      {redirect.reason && <p className="text-[10px] text-[#6B7280] mt-0.5">{redirect.reason}</p>}
                    </div>
                    <button
                      onClick={() => { setOpen(false); router.push(redirect.path); }}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#00338D] text-white text-[10px] font-bold rounded-lg hover:bg-[#0044b8] transition-colors"
                    >
                      Go <ChevronRight size={10} />
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-[#F4F6F9]">
              <div className="flex items-center gap-2 bg-[#F4F6F9] rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your goal..."
                  className="flex-1 bg-transparent text-xs text-[#1A1F36] placeholder-[#9CA3AF] outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-[#00338D] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0044b8] transition-colors flex-shrink-0"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = (new Date(isoString) - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60) return fmt.format(Math.round(diff), 'second');
  if (abs < 3600) return fmt.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return fmt.format(Math.round(diff / 3600), 'hour');
  return fmt.format(Math.round(diff / 86400), 'day');
}

// ── DatacenterNewsSection ─────────────────────────────────────────────────
function DatacenterNewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    try {
      setError(null);
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const wrapperProps = {
    className: 'mt-24',
    initial: { y: 40, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.8, duration: 0.6 },
  };

  if (loading) return (
    <motion.div {...wrapperProps}>
      <h2 className="text-[#9CA3AF] text-center text-sm font-semibold uppercase tracking-widest mb-8">
        Global Datacenter News
      </h2>
      <div style={{ columnCount: 3, columnGap: '12px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="break-inside-avoid mb-3 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            {i % 4 === 0 && <div className="shimmer h-44 w-full" />}
            <div className="p-4 space-y-2">
              <div className="shimmer h-3 w-1/3 rounded" />
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-4 w-5/6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (error || articles.length === 0) return (
    <motion.div {...wrapperProps}>
      <h2 className="text-[#9CA3AF] text-center text-sm font-semibold uppercase tracking-widest mb-8">
        Global Datacenter News
      </h2>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-sm">
        <Newspaper size={32} className="text-[#CBD5E1] mx-auto mb-3" />
        <p className="text-[#6B7280] text-sm font-semibold mb-1">News unavailable</p>
        <p className="text-[#9CA3AF] text-xs mb-4">{error || 'No articles found at this time.'}</p>
        <button
          onClick={() => { setLoading(true); fetchNews(); }}
          className="px-4 py-2 bg-[#00338D] text-white text-xs font-bold rounded-lg hover:bg-[#0044b8] transition-colors"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Try again
        </button>
      </div>
    </motion.div>
  );

  return (
    <motion.div {...wrapperProps}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-[#9CA3AF] text-sm font-semibold uppercase tracking-widest">
            Global Datacenter News
          </h2>
        </div>
        <span className="text-[#CBD5E1] text-[10px]">Refreshes hourly</span>
      </div>

      <div style={{ columnGap: '12px' }} className="[column-count:1] md:[column-count:2] lg:[column-count:3]">
        {articles.map((article, i) => {
          const featured = i % 4 === 0;
          const showImage = article.urlToImage && (featured || i % 3 === 1);
          return (
            <motion.a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-inside-avoid block mb-3 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#0077C8]/30 transition-all duration-200 group relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.06 }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00338D] to-[#0077C8] opacity-0 group-hover:opacity-100 transition-opacity" />
              {showImage && (
                <div className={`overflow-hidden ${featured ? 'h-44' : 'h-28'}`}>
                  <img
                    src={article.urlToImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[#0077C8] text-[10px] font-bold uppercase tracking-wider truncate">
                    {article.source}
                  </span>
                  <span className="flex items-center gap-1 text-[#9CA3AF] text-[10px] flex-shrink-0">
                    <Clock size={9} />{relativeTime(article.publishedAt)}
                  </span>
                </div>
                <h3
                  className={`text-[#1A1F36] font-bold leading-snug mb-2 group-hover:text-[#00338D] transition-colors ${featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {article.title}
                </h3>
                {article.description && (
                  <p className={`text-[#6B7280] leading-relaxed mb-3 ${featured ? 'text-xs line-clamp-3' : 'text-[10px] line-clamp-2'}`}>
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[#0077C8] text-[10px] font-semibold group-hover:gap-2 transition-all">
                  Read more <ExternalLink size={9} />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── LandingPage ────────────────────────────────────────────────────────────
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
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/db/KPMG_blue_logo.svg" alt="KPMG" className="h-20 w-auto mb-3 mx-auto" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00338D]/8 border border-[#00338D]/15 rounded-full mb-6">
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
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00338D] text-white font-bold rounded-xl hover:bg-[#0044b8] transition-colors text-sm shadow-lg shadow-[#00338D]/20"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <Globe size={16} />
                  Global Datacenter Dashboard
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => router.push('/command-center')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#00338D] text-[#00338D] font-bold rounded-xl hover:bg-[#00338D]/5 transition-colors text-sm shadow-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <LayoutDashboard size={16} />
                  Operations Command Center
                </button>
              </div>
              <p className="text-[#9CA3AF] text-xs text-center mt-2">Global coverage · Live intelligence</p>
            </motion.div>
          </div>

          {/* Global Datacenter News */}
          <DatacenterNewsSection />

          {/* Footer */}
          <motion.div className="mt-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <p className="text-[#CBD5E1] text-xs">© KPMG 2026 · K-Nexus Datacenter Intelligence · Strictly Confidential</p>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <UploadModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      {/* Guide Bot — only on landing page */}
      <GuideBot />
    </div>
  );
}