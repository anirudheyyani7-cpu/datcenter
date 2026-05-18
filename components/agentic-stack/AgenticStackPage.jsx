'use client';
import { motion } from 'framer-motion';
import CCLayout from '@/components/command-center/CCLayout';

// ─── Inline SVG Logos ─────────────────────────────────────────────────────────

function AWSLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M17 38c-1.6 0.7-2.6 1-3.4 1-1.4 0-2.2-0.8-2.2-2.2 0-1.6 1.2-3 3.8-4.2l1.8-0.8v6.2zm0 3.4v1.4c0 0.4 0.3 0.6 0.8 0.6 0.4 0 0.8-0.1 1.2-0.3l0.2 1.2c-0.6 0.3-1.4 0.5-2.2 0.5-1.6 0-2.4-0.8-2.4-2.2v-1.4l2.4 0.2zm-4.2-5.4c0 2.8 1.8 4.4 4.6 4.4 1.2 0 2.2-0.2 3.2-0.7l-0.4-1.4c-0.8 0.4-1.6 0.6-2.6 0.6-1.8 0-2.8-1-2.8-2.8 0-1.2 0.6-2.2 1.8-2.8l-1-1c-1.8 1-2.8 2.4-2.8 3.7z" fill="#FF9900"/>
      <path d="M30 20c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="#FF9900"/>
      <path d="M9 44c8.6 5.4 19.8 6.8 29.6 3.4l-1-1.8c-9 3.2-19.4 1.8-27.4-3.6L9 44zm41 1.6c0.8-0.6 1.6-1.2 2.4-1.8l-1.2-1.4c-0.8 0.6-1.6 1.4-2.4 2l1.2 1.2z" fill="#FF9900"/>
      <text x="30" y="33" textAnchor="middle" fill="#FF9900" fontSize="10" fontWeight="bold" fontFamily="Arial">AWS</text>
    </svg>
  );
}

function ClaudeLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#D97757"/>
      <path d="M18 42l6.5-18h3.2L20 42h-2zm5.5 0l6.5-18h3.2L25.7 42h-2.2zm5 0l6.5-18H38L31.5 42H28.5z" fill="white" opacity="0.9"/>
    </svg>
  );
}

function TavilyLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#1A1A2E"/>
      <path d="M12 20h36v4H12zm8 8h20v4H20zm4 8h12v4H24z" fill="#F5A623"/>
      <circle cx="44" cy="44" r="8" fill="#F5A623"/>
      <path d="M41 44l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PeeringDBLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#003366"/>
      <circle cx="18" cy="30" r="6" fill="#4A90D9"/>
      <circle cx="42" cy="18" r="5" fill="#4A90D9"/>
      <circle cx="42" cy="42" r="5" fill="#4A90D9"/>
      <circle cx="30" cy="30" r="4" fill="#7BB8F0"/>
      <line x1="24" y1="30" x2="30" y2="30" stroke="#4A90D9" strokeWidth="2"/>
      <line x1="34" y1="28" x2="38" y2="21" stroke="#4A90D9" strokeWidth="2"/>
      <line x1="34" y1="32" x2="38" y2="39" stroke="#4A90D9" strokeWidth="2"/>
    </svg>
  );
}

function LangGraphLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#1C1C1E"/>
      <circle cx="30" cy="16" r="5" fill="#7C3AED"/>
      <circle cx="16" cy="38" r="5" fill="#7C3AED"/>
      <circle cx="44" cy="38" r="5" fill="#7C3AED"/>
      <line x1="30" y1="21" x2="20" y2="33" stroke="#9F67FF" strokeWidth="2"/>
      <line x1="30" y1="21" x2="40" y2="33" stroke="#9F67FF" strokeWidth="2"/>
      <line x1="21" y1="38" x2="39" y2="38" stroke="#9F67FF" strokeWidth="2"/>
    </svg>
  );
}

function CrewAILogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#0F172A"/>
      <circle cx="30" cy="22" r="7" fill="#E11D48"/>
      <path d="M16 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="26" r="4" fill="#E11D48" opacity="0.6"/>
      <circle cx="44" cy="26" r="4" fill="#E11D48" opacity="0.6"/>
    </svg>
  );
}

function KnowledgeGraphLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#064E3B"/>
      <circle cx="30" cy="30" r="5" fill="#10B981"/>
      <circle cx="14" cy="22" r="4" fill="#34D399"/>
      <circle cx="46" cy="22" r="4" fill="#34D399"/>
      <circle cx="14" cy="42" r="4" fill="#34D399"/>
      <circle cx="46" cy="42" r="4" fill="#34D399"/>
      <line x1="18" y1="24" x2="26" y2="28" stroke="#10B981" strokeWidth="1.5"/>
      <line x1="42" y1="24" x2="34" y2="28" stroke="#10B981" strokeWidth="1.5"/>
      <line x1="18" y1="40" x2="26" y2="33" stroke="#10B981" strokeWidth="1.5"/>
      <line x1="42" y1="40" x2="34" y2="33" stroke="#10B981" strokeWidth="1.5"/>
    </svg>
  );
}

function RAGLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#1E3A5F"/>
      <ellipse cx="30" cy="20" rx="16" ry="6" fill="#2563EB"/>
      <rect x="14" y="20" width="32" height="8" fill="#1D4ED8"/>
      <ellipse cx="30" cy="28" rx="16" ry="6" fill="#3B82F6"/>
      <rect x="14" y="28" width="32" height="8" fill="#2563EB"/>
      <ellipse cx="30" cy="36" rx="16" ry="6" fill="#60A5FA"/>
      <text x="30" y="22" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">KPMG</text>
      <text x="30" y="39" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial">RAG</text>
    </svg>
  );
}

function BedrockLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#232F3E"/>
      <path d="M30 12l16 9v18l-16 9-16-9V21z" fill="none" stroke="#FF9900" strokeWidth="2"/>
      <path d="M30 12l16 9-16 9-16-9z" fill="#FF9900" opacity="0.8"/>
      <path d="M14 21l16 9v18" stroke="#FF9900" strokeWidth="1.5" fill="none"/>
      <path d="M46 21l-16 9v18" stroke="#FF9900" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FlowArrow({ className = '' }) {
  return (
    <div className={`flex justify-center py-1 ${className}`}>
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
        <path d="M12 0v14M5 10l7 8 7-8" stroke="#0077C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function LayerLabel({ children }) {
  return (
    <span className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full text-[9px] font-bold uppercase tracking-widest text-white/25 rotate-180 [writing-mode:vertical-rl] hidden xl:block">
      {children}
    </span>
  );
}

const AGENTS = [
  { label: 'Strategy',     color: '#00338D', desc: 'Market positioning & site strategy' },
  { label: 'Sourcing',     color: '#0055A4', desc: 'Vendor & land acquisition' },
  { label: 'Design',       color: '#0077C8', desc: 'Engineering & facility design' },
  { label: 'Compliance',   color: '#005F9E', desc: 'Regulatory & legal adherence' },
  { label: 'Operations',   color: '#0099CC', desc: 'Live facility management' },
  { label: 'Monetization', color: '#00A36C', desc: 'Revenue & tenant optimization' },
];

const DATA_TOOLS = [
  { label: 'Tavily Search', sub: 'Live, verified market data',        Logo: TavilyLogo },
  { label: 'PeeringDB',     sub: 'Global DC peering connectivity',    Logo: PeeringDBLogo },
  { label: 'Knowledge Graph', sub: 'Entity relationship mappings',    Logo: KnowledgeGraphLogo },
  { label: 'RAG Vector Store', sub: 'KPMG Frameworks — highly efficient retrieval', Logo: RAGLogo },
];

const CORE_SKILLS = [
  { logo: LangGraphLogo,  title: 'Multi-agent Orchestration', sub: 'LangGraph, CrewAI' },
  { logo: null,           title: 'Dynamic Retrieval Routing', sub: 'Semantic + keyword hybrid' },
  { logo: ClaudeLogo,     title: 'Reflect + Retry Self-correction', sub: 'Claude-powered' },
  { logo: KnowledgeGraphLogo, title: 'Hybrid RAG', sub: 'Semantic, Knowledge Graph' },
];

const TOOL_FRAMEWORKS = [
  { Logo: BedrockLogo,      label: 'AWS Bedrock',           sub: 'Cloud Platform' },
  { Logo: ClaudeLogo,       label: 'Claude 3.5 Sonnet & Opus', sub: 'Foundation Models' },
  { Logo: TavilyLogo,       label: 'Tavily Search',         sub: 'Live market data' },
  { Logo: PeeringDBLogo,    label: 'PeeringDB',              sub: 'Network connectivity' },
  { Logo: RAGLogo,          label: 'RAG Vector Store',       sub: 'KPMG Frameworks' },
  { Logo: KnowledgeGraphLogo, label: 'Knowledge Graph',     sub: 'Entity mappings' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgenticStackPage() {
  return (
    <CCLayout title="Agentic AI Stack">
      <div className="p-5 min-h-full bg-[#0D1117]">
        {/* Page heading */}
        <motion.div {...fade(0)} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-white font-bold text-xl tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Data Center Life-Cycle Intelligence Platform
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                Proprietary KPMG Agentic AI Architecture — Powered by AWS Bedrock & Claude
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00338D]/20 border border-[#00338D]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A36C] animate-pulse" />
              <span className="text-[#0077C8] text-xs font-bold uppercase tracking-widest">Proprietary Framework</span>
            </div>
          </div>
        </motion.div>

        {/* Main layout: diagram + right panel */}
        <div className="flex gap-5 items-start">

          {/* ── Left: Architecture Diagram ── */}
          <div className="flex-1 min-w-0 space-y-2 relative">

            {/* User Query */}
            <motion.div {...fade(0.05)} className="flex justify-center">
              <div className="px-10 py-3 rounded-xl bg-white/[0.06] border border-white/15 shadow-lg">
                <p className="text-white font-semibold text-sm tracking-wide text-center">User Query</p>
              </div>
            </motion.div>

            <FlowArrow />

            {/* Memory + Planning Layer */}
            <motion.div {...fade(0.1)} className="grid grid-cols-2 gap-4 relative">
              {/* Horizontal connector between the two */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <div className="w-full flex items-center">
                  <div className="flex-1 h-px bg-[#0077C8]/40" />
                  <div className="mx-2 px-2.5 py-0.5 rounded-md bg-[#0D1117] border border-[#0077C8]/40 text-[#0077C8] text-[10px] font-bold tracking-widest flex-shrink-0">
                    AND
                  </div>
                  <div className="flex-1 h-px bg-[#0077C8]/40" />
                </div>
              </div>

              {/* Memory Layer */}
              <div className="relative z-10 rounded-xl border border-[#00338D]/40 bg-[#00338D]/10 p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00338D]/30 border border-[#0077C8]/30 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0077C8" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs">Memory Layer</p>
                    <p className="text-white/45 text-[10px] mt-0.5">Short + Long term context storage</p>
                  </div>
                </div>
              </div>

              {/* Planning Layer */}
              <div className="relative z-10 rounded-xl border border-[#00338D]/40 bg-[#00338D]/10 p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00338D]/30 border border-[#0077C8]/30 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0077C8" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs">Planning Layer</p>
                    <p className="text-white/45 text-[10px] mt-0.5">ReAct + Chain-of-Thought Reasoning</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <FlowArrow />

            {/* Aggregator Agent */}
            <motion.div {...fade(0.15)} className="flex justify-center">
              <div className="w-full max-w-sm rounded-xl border border-[#0077C8]/50 bg-[#0077C8]/10 p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0077C8]/20 border border-[#0077C8]/40 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0077C8" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Aggregator Agent</p>
                  <p className="text-white/45 text-[10px]">Routes and coordinates all specialist agents</p>
                </div>
              </div>
            </motion.div>

            <FlowArrow />

            {/* 6 Specialist Agents */}
            <motion.div {...fade(0.2)}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2 text-center">Specialist Agents</p>
              <div className="grid grid-cols-6 gap-2">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.label}
                    className="rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-colors p-2.5 flex flex-col items-center gap-1.5 text-center group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${agent.color}25`, border: `1px solid ${agent.color}50` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-sm" style={{ background: agent.color }} />
                    </div>
                    <p className="text-white text-[10px] font-semibold leading-tight">{agent.label}</p>
                    <p className="text-white/35 text-[9px] leading-tight hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1A1F36] border border-white/10 rounded-lg px-2 py-1 w-28 z-10 pointer-events-none whitespace-normal">
                      {agent.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <FlowArrow />

            {/* Data & Tools */}
            <motion.div {...fade(0.25)}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2 text-center">Data & Tools</p>
              <div className="grid grid-cols-4 gap-3">
                {DATA_TOOLS.map(({ label, sub, Logo }) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col gap-2">
                    <Logo size={28} />
                    <div>
                      <p className="text-white text-[11px] font-semibold">{label}</p>
                      <p className="text-white/40 text-[9px] mt-0.5 leading-tight">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <FlowArrow />

            {/* AWS Bedrock */}
            <motion.div {...fade(0.3)}>
              <div className="rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/5 p-3.5 flex items-center gap-4">
                <BedrockLogo size={36} />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">AWS Bedrock</p>
                  <p className="text-white/45 text-[10px] mt-0.5">Managed Foundation Models + Vector DB + Embeddings</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A36C] animate-pulse" />
                  <span className="text-[#00A36C] text-[10px] font-semibold">Active</span>
                </div>
              </div>
            </motion.div>

            <FlowArrow />

            {/* Generative Model + Reflect & Retry */}
            <motion.div {...fade(0.35)} className="grid grid-cols-5 gap-3">
              {/* Generative Model */}
              <div className="col-span-3 rounded-xl border border-[#D97757]/30 bg-[#D97757]/5 p-3.5 flex items-center gap-3">
                <ClaudeLogo size={36} />
                <div>
                  <p className="text-white font-semibold text-sm">Generative Model</p>
                  <p className="text-white/45 text-[10px] mt-0.5">Claude 3.5 Sonnet / Opus — Inference, Scoring, Output Generation</p>
                </div>
              </div>

              {/* Arrow connector */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-px w-full bg-[#0077C8]/40" />
                    <span className="text-[9px] text-[#0077C8]/60 font-semibold tracking-wider">reflect + retry</span>
                    <div className="h-px w-full bg-[#0077C8]/40" />
                  </div>
                  <div className="rounded-xl border border-[#0077C8]/40 bg-[#0077C8]/10 p-3 text-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0077C8" strokeWidth="2" strokeLinecap="round" className="mx-auto">
                      <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
                    </svg>
                    <p className="text-[9px] text-white/60 mt-1 font-semibold">Reflect &amp; Retry</p>
                    <p className="text-[8px] text-white/30">Self-correction</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── Right: Capabilities Panel ── */}
          <motion.div {...fade(0.1)} className="w-64 flex-shrink-0 space-y-4">

            {/* Title card */}
            <div className="rounded-xl border border-[#00338D]/40 bg-[#00338D]/15 p-4">
              <p className="text-white font-bold text-xs uppercase tracking-widest text-center leading-snug">
                Data Center Life-Cycle<br />Intelligence Platform
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-px h-3 bg-white/20" />
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Capabilities</p>
                <div className="w-px h-3 bg-white/20" />
              </div>
            </div>

            {/* Core Skills */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#00338D]/20 border-b border-white/[0.06]">
                <p className="text-white font-bold text-xs uppercase tracking-wider">Core Skills</p>
              </div>
              <div className="p-3 space-y-2.5">
                {CORE_SKILLS.map(({ logo: Logo, title, sub }) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[#00338D]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {Logo ? (
                        <Logo size={12} />
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0077C8" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-white/85 text-[11px] font-semibold leading-tight">{title}</p>
                      <p className="text-white/35 text-[9px] mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools & Frameworks */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#00A36C]/15 border-b border-white/[0.06]">
                <p className="text-[#00A36C] font-bold text-xs uppercase tracking-wider">Tools & Frameworks</p>
              </div>
              <div className="p-3 space-y-2.5">
                {TOOL_FRAMEWORKS.map(({ Logo, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Logo size={22} />
                    <div className="min-w-0">
                      <p className="text-white/85 text-[11px] font-semibold truncate">{label}</p>
                      <p className="text-white/35 text-[9px]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPMG Badge */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between">
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-widest">Powered by</p>
                <p className="text-white font-bold text-xs mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KPMG</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[9px] uppercase tracking-widest">Framework</p>
                <p className="text-[#0077C8] font-bold text-[10px] mt-0.5">Proprietary</p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </CCLayout>
  );
}
