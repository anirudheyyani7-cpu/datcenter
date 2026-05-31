'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  X, RefreshCw, Download, ArrowRight, ChevronRight,
  Building2, TrendingUp, Globe, Zap, Shield, BarChart3,
  MapPin, Users, AlertTriangle, CheckCircle2, Clock,
  Sparkles, Server, Leaf, DollarSign, Activity, Target,
  FileText, ExternalLink, CircleDot, Layers, Wrench
} from 'lucide-react';
import { callClaude } from '@/lib/claude-api';
import { writeToWiki } from '@/lib/wiki';

// ── Constants ─────────────────────────────────────────────────────────────────
const KPMG_BLUE = '#00338D';
const KPMG_MID  = '#0077C8';

const PROFILE_CONFIG = {
  new: {
    label: 'New Market Entrant',
    color: '#0077C8',
    bg: '#EBF5FF',
    border: '#BFDBFE',
    icon: Building2,
    desc: 'Greenfield · Market Entry · Partnerships',
  },
  expansion: {
    label: 'Expansion Play',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: TrendingUp,
    desc: 'Capacity Scale · New Sites · Supply Chain',
  },
  ops: {
    label: 'Ops / PMO',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: Wrench,
    desc: 'Operations · Compliance · Efficiency',
  },
};

const STAGE_LABELS = {
  '01': 'Strategy', '02': 'Supply Chain',
  '03': 'Design & Build', '04': 'Compliance',
  '05': 'Operations', '06': 'Monetization',
};

const COCKPIT_SYSTEM = `You are a senior KPMG Datacenter Advisory AI generating structured JSON data for a real-time client intelligence cockpit dashboard. 

Given a client brief, you MUST return ONLY a single valid JSON object — no markdown, no backticks, no explanation. Just the JSON.

The JSON must follow this exact schema:

{
  "clientName": "string — extracted client/company name",
  "profile": "new|expansion|ops — classify strictly: new=no DC experience/first entry, expansion=existing DC player scaling up, ops=running DCs needing PMO/ops/compliance help",
  "snapshot": {
    "sector": "string — primary industry sector",
    "hq": "string — headquarters location",
    "revenue": "string — estimated revenue or 'Not disclosed'",
    "experience": "string — DC experience level: None / Limited / Moderate / Extensive",
    "whyDC": "string — 1 sentence: why datacenter makes sense for them now"
  },
  "readiness": {
    "score": number between 0-100,
    "rationale": "string — 1 sentence explaining the score",
    "dimensions": [
      {"label": "Financial Strength", "score": number 0-100},
      {"label": "Technical Know-how", "score": number 0-100},
      {"label": "Market Timing", "score": number 0-100},
      {"label": "Regulatory Readiness", "score": number 0-100},
      {"label": "Partnership Potential", "score": number 0-100}
    ]
  },
  "marketContext": {
    "headline": "string — key market stat relevant to client (e.g. 'India DC market growing at 20% CAGR')",
    "demandDriver": "string — top demand driver in their target market",
    "supplyGap": "string — key supply gap or opportunity",
    "keyPlayers": ["string", "string", "string"]
  },
  "infraRec": {
    "recommended": "Greenfield|Brownfield|JV|Colocation|Hybrid",
    "reasoning": "string — 2 sentences explaining why",
    "alternatives": [
      {"type": "string", "fit": number 0-100, "note": "string — one line"},
      {"type": "string", "fit": number 0-100, "note": "string — one line"}
    ]
  },
  "profilePanels": {
    "new": {
      "entryOptions": [
        {"path": "string — option name", "timeline": "string", "capex": "string", "risk": "Low|Medium|High", "note": "string — 1 line"},
        {"path": "string", "timeline": "string", "capex": "string", "risk": "Low|Medium|High", "note": "string"},
        {"path": "string", "timeline": "string", "capex": "string", "risk": "Low|Medium|High", "note": "string"}
      ],
      "partners": [
        {"name": "string", "type": "Hyperscaler|EPC|OEM|Investor|Operator", "relevance": "string — 1 line"},
        {"name": "string", "type": "string", "relevance": "string"},
        {"name": "string", "type": "string", "relevance": "string"},
        {"name": "string", "type": "string", "relevance": "string"}
      ]
    },
    "expansion": {
      "capacityGap": {
        "current": "string — e.g. '0 MW'",
        "target": "string — e.g. '300 MW'",
        "gap": "string",
        "timeline": "string"
      },
      "siteShortlist": [
        {"location": "string", "score": number 0-100, "pros": "string", "cons": "string"},
        {"location": "string", "score": number 0-100, "pros": "string", "cons": "string"},
        {"location": "string", "score": number 0-100, "pros": "string", "cons": "string"}
      ],
      "supplyPriorities": [
        {"item": "string", "priority": "Critical|High|Medium", "note": "string"},
        {"item": "string", "priority": "Critical|High|Medium", "note": "string"},
        {"item": "string", "priority": "Critical|High|Medium", "note": "string"},
        {"item": "string", "priority": "Critical|High|Medium", "note": "string"}
      ]
    },
    "ops": {
      "healthScores": [
        {"dimension": "Power Infrastructure", "score": number 0-100},
        {"dimension": "Cooling Systems", "score": number 0-100},
        {"dimension": "Compliance & Certs", "score": number 0-100},
        {"dimension": "Operational Maturity", "score": number 0-100},
        {"dimension": "ESG / Sustainability", "score": number 0-100},
        {"dimension": "Financial Performance", "score": number 0-100}
      ],
      "complianceGaps": [
        {"item": "string", "severity": "High|Medium|Low", "action": "string"},
        {"item": "string", "severity": "High|Medium|Low", "action": "string"},
        {"item": "string", "severity": "High|Medium|Low", "action": "string"}
      ],
      "efficiencyWins": [
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"}
      ]
    }
  },
  "stageRoadmap": [
    {"stage": "01|02|03|04|05|06", "priority": "Must|Should|Optional", "why": "string — 1 line"},
    {"stage": "string", "priority": "string", "why": "string"},
    {"stage": "string", "priority": "string", "why": "string"},
    {"stage": "string", "priority": "string", "why": "string"}
  ],
  "risks": [
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string — 1 line"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"}
  ],
  "immediateActions": [
    {"action": "string", "owner": "string — KPMG team/role", "by": "string — timeframe"},
    {"action": "string", "owner": "string", "by": "string"},
    {"action": "string", "owner": "string", "by": "string"}
  ]
}

Be specific — use client name, capacity (MW), geography, sector throughout. Use Tavily research for real market data. Return ONLY the JSON.`;

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ children, className = '', delay = 0, noPad = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-white border border-[#E2E8F0] rounded-2xl shadow-sm ${noPad ? '' : 'p-5'} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ icon: Icon, label, color = KPMG_BLUE }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

function ScoreRing({ score, size = 80, stroke = 8, color = KPMG_BLUE }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

function MiniBar({ score, color = KPMG_BLUE, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] text-[#6B7280] w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-bold w-7 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    High:     { bg: '#FEE2E2', color: '#DC2626' },
    Medium:   { bg: '#FEF3C7', color: '#D97706' },
    Low:      { bg: '#DCFCE7', color: '#16A34A' },
    Critical: { bg: '#FEE2E2', color: '#DC2626' },
    Must:     { bg: '#EBF5FF', color: KPMG_BLUE },
    Should:   { bg: '#F0FDF4', color: '#16A34A' },
    Optional: { bg: '#F5F3FF', color: '#7C3AED' },
  };
  const s = map[severity] || { bg: '#F4F6F9', color: '#6B7280' };
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>
      {severity}
    </span>
  );
}

function SkeletonCard({ height = 160 }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 animate-pulse" style={{ height }}>
      <div className="h-3 w-24 bg-[#E2E8F0] rounded mb-4" />
      <div className="space-y-2">
        <div className="h-2 w-full bg-[#E2E8F0] rounded" />
        <div className="h-2 w-4/5 bg-[#E2E8F0] rounded" />
        <div className="h-2 w-3/5 bg-[#E2E8F0] rounded" />
      </div>
    </div>
  );
}

// ── Section: Client Intelligence Row ─────────────────────────────────────────
function ClientIntelRow({ data }) {
  const pc = PROFILE_CONFIG[data.profile];
  const ProfileIcon = pc.icon;

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {/* Snapshot */}
      <Card delay={0.05}>
        <CardLabel icon={Building2} label="Client Snapshot" />
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pc.bg }}>
            <ProfileIcon size={18} style={{ color: pc.color }} />
          </div>
          <div>
            <p className="font-extrabold text-[#1A1F36] text-sm leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{data.clientName}</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            ['Sector', data.snapshot.sector],
            ['HQ', data.snapshot.hq],
            ['Revenue', data.snapshot.revenue],
            ['DC Experience', data.snapshot.experience],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[10px] text-[#9CA3AF]">{k}</span>
              <span className="text-[10px] font-semibold text-[#374151] text-right max-w-[55%]">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4F6F9]">
          <p className="text-[10px] text-[#6B7280] italic leading-relaxed">"{data.snapshot.whyDC}"</p>
        </div>
      </Card>

      {/* Readiness Score */}
      <Card delay={0.1}>
        <CardLabel icon={Target} label="Market Readiness" color="#0077C8" />
        <div className="flex items-center gap-4 mb-3">
          <div className="relative flex-shrink-0">
            <ScoreRing score={data.readiness.score} size={72} stroke={7} color={KPMG_MID} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black" style={{ color: KPMG_BLUE }}>{data.readiness.score}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#374151] leading-snug">{data.readiness.rationale}</p>
          </div>
        </div>
        <div className="space-y-1">
          {data.readiness.dimensions.map(d => (
            <MiniBar key={d.label} label={d.label} score={d.score} color={KPMG_MID} />
          ))}
        </div>
      </Card>

      {/* Market Context */}
      <Card delay={0.15}>
        <CardLabel icon={Globe} label="Market Context" color="#059669" />
        <div className="mb-3 p-2.5 rounded-xl" style={{ background: '#ECFDF5' }}>
          <p className="text-[11px] font-bold text-[#065F46] leading-snug">{data.marketContext.headline}</p>
        </div>
        <div className="space-y-2.5">
          <div>
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Demand Driver</p>
            <p className="text-[11px] text-[#374151]">{data.marketContext.demandDriver}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Supply Gap / Opportunity</p>
            <p className="text-[11px] text-[#374151]">{data.marketContext.supplyGap}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">Key Players</p>
            <div className="flex flex-wrap gap-1">
              {data.marketContext.keyPlayers.map(p => (
                <span key={p} className="text-[9px] font-semibold px-2 py-0.5 bg-[#F4F6F9] text-[#374151] rounded-full">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Infra Rec + Profile Panels ──────────────────────────────────────
function InfraAndProfile({ data }) {
  const profile = data.profile;
  const ir = data.infraRec;
  const fitColors = { 90: '#059669', 75: '#0077C8', 60: '#D97706', 0: '#9CA3AF' };
  const fitColor = (score) => Object.entries(fitColors).reverse().find(([k]) => score >= Number(k))?.[1] || '#9CA3AF';

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {/* Infra Recommendation — always shown */}
      <Card delay={0.2}>
        <CardLabel icon={Server} label="Infra Recommendation" color="#7C3AED" />
        <div className="mb-3 p-3 rounded-xl border-2" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
          <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">Recommended</p>
          <p className="text-lg font-black text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ir.recommended}</p>
        </div>
        <p className="text-[11px] text-[#374151] leading-relaxed mb-3">{ir.reasoning}</p>
        <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-2">Alternatives</p>
        {ir.alternatives.map(a => (
          <div key={a.type} className="flex items-center gap-2 mb-1.5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-semibold text-[#374151]">{a.type}</span>
                <span className="text-[10px] font-bold" style={{ color: fitColor(a.fit) }}>{a.fit}%</span>
              </div>
              <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: fitColor(a.fit) }}
                  initial={{ width: 0 }} animate={{ width: `${a.fit}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }} />
              </div>
              <p className="text-[9px] text-[#9CA3AF] mt-0.5">{a.note}</p>
            </div>
          </div>
        ))}
      </Card>

      {/* Profile-specific panels — span 2 cols */}
      <div className="col-span-2">
        {profile === 'new' && <NewPlayerPanel data={data.profilePanels.new} />}
        {profile === 'expansion' && <ExpansionPanel data={data.profilePanels.expansion} />}
        {profile === 'ops' && <OpsPanel data={data.profilePanels.ops} />}
      </div>
    </div>
  );
}

function NewPlayerPanel({ data }) {
  const riskColor = { Low: '#16A34A', Medium: '#D97706', High: '#DC2626' };
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card delay={0.25} className="h-full">
        <CardLabel icon={Layers} label="Market Entry Options" color="#0077C8" />
        <div className="space-y-2">
          {data.entryOptions.map((o, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] transition-colors">
              <div className="flex items-start justify-between mb-1">
                <p className="text-[11px] font-bold text-[#1A1F36]">{o.path}</p>
                <SeverityBadge severity={o.risk} />
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-[9px] text-[#9CA3AF]">⏱ {o.timeline}</span>
                <span className="text-[9px] text-[#9CA3AF]">💰 {o.capex}</span>
              </div>
              <p className="text-[9px] text-[#6B7280] mt-1 italic">{o.note}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card delay={0.3} className="h-full">
        <CardLabel icon={Users} label="Key Partners to Engage" color="#059669" />
        <div className="space-y-2">
          {data.partners.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F4F6F9] transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#EBF5FF] flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-black text-[#0077C8]">{p.type.slice(0,2)}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-[#1A1F36]">{p.name}</p>
                  <span className="text-[8px] text-[#9CA3AF]">· {p.type}</span>
                </div>
                <p className="text-[9px] text-[#6B7280]">{p.relevance}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ExpansionPanel({ data }) {
  const prColor = { Critical: '#DC2626', High: '#D97706', Medium: '#0077C8' };
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card delay={0.25} className="h-full">
        <CardLabel icon={MapPin} label="Site Shortlist" color="#059669" />
        <div className="mb-3 p-2.5 rounded-xl bg-[#F4F6F9] text-center">
          <div className="flex items-center justify-center gap-4">
            <div><p className="text-[9px] text-[#9CA3AF]">Current</p><p className="text-sm font-black text-[#1A1F36]">{data.capacityGap.current}</p></div>
            <ArrowRight size={14} className="text-[#9CA3AF]" />
            <div><p className="text-[9px] text-[#9CA3AF]">Target</p><p className="text-sm font-black" style={{ color: KPMG_BLUE }}>{data.capacityGap.target}</p></div>
            <div><p className="text-[9px] text-[#9CA3AF]">By</p><p className="text-[10px] font-bold text-[#374151]">{data.capacityGap.timeline}</p></div>
          </div>
        </div>
        <div className="space-y-2">
          {data.siteShortlist.map((s, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-[#1A1F36]">#{i+1} {s.location}</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-12 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: KPMG_BLUE }} />
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: KPMG_BLUE }}>{s.score}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <p className="text-[9px] text-green-600">✓ {s.pros}</p>
                <p className="text-[9px] text-red-500">✗ {s.cons}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card delay={0.3} className="h-full">
        <CardLabel icon={Zap} label="Supply Chain Priorities" color="#D97706" />
        <div className="space-y-2">
          {data.supplyPriorities.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#E2E8F0]">
              <div className="w-1.5 h-full min-h-[32px] rounded-full flex-shrink-0" style={{ background: prColor[s.priority] || '#9CA3AF' }} />
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[11px] font-bold text-[#1A1F36]">{s.item}</p>
                  <SeverityBadge severity={s.priority} />
                </div>
                <p className="text-[9px] text-[#6B7280]">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OpsPanel({ data }) {
  const effortColor = { 'Quick Win': '#059669', 'Medium-term': '#D97706', 'Strategic': '#7C3AED' };
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card delay={0.25} className="h-full">
        <CardLabel icon={Activity} label="Health Scorecard" color="#7C3AED" />
        <div className="space-y-2 mb-3">
          {data.healthScores.map(h => (
            <MiniBar key={h.dimension} label={h.dimension} score={h.score}
              color={h.score >= 80 ? '#059669' : h.score >= 60 ? '#D97706' : '#DC2626'} />
          ))}
        </div>
        <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">Compliance Gaps</p>
        <div className="space-y-1">
          {data.complianceGaps.map((g, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <SeverityBadge severity={g.severity} />
              <p className="text-[9px] text-[#374151]">{g.item}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card delay={0.3} className="h-full">
        <CardLabel icon={TrendingUp} label="Efficiency Opportunities" color="#059669" />
        <div className="space-y-2">
          {data.efficiencyWins.map((e, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[11px] font-semibold text-[#1A1F36]">{e.opportunity}</p>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ background: `${effortColor[e.effort]}18`, color: effortColor[e.effort] }}>
                  {e.effort}
                </span>
              </div>
              <SeverityBadge severity={e.impact} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Section: Bottom Row ───────────────────────────────────────────────────────
function BottomRow({ data, router }) {
  const stageColors = { Must: KPMG_BLUE, Should: '#059669', Optional: '#7C3AED' };
  const sevColor = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Stage Roadmap */}
      <Card delay={0.35}>
        <CardLabel icon={ChevronRight} label="Recommended Stage Roadmap" />
        <div className="space-y-2">
          {data.stageRoadmap.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 group cursor-pointer"
              onClick={() => router.push(`/stage/${s.stage}`)}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: `${stageColors[s.priority]}18` }}>
                <span className="text-[9px] font-black" style={{ color: stageColors[s.priority] }}>S{s.stage}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-[#1A1F36] group-hover:text-[#00338D] transition-colors">
                    {STAGE_LABELS[s.stage]}
                  </p>
                  <SeverityBadge severity={s.priority} />
                </div>
                <p className="text-[9px] text-[#6B7280]">{s.why}</p>
              </div>
              <ChevronRight size={10} className="text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors mt-1 flex-shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      {/* Risks */}
      <Card delay={0.4}>
        <CardLabel icon={AlertTriangle} label="Key Risks" color="#DC2626" />
        <div className="space-y-2">
          {data.risks.map((r, i) => (
            <div key={i} className="p-2.5 rounded-xl border" style={{ borderColor: `${sevColor[r.severity]}30`, background: `${sevColor[r.severity]}06` }}>
              <div className="flex items-start gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: sevColor[r.severity] }} />
                <p className="text-[11px] font-semibold text-[#1A1F36]">{r.risk}</p>
                <SeverityBadge severity={r.severity} />
              </div>
              <p className="text-[9px] text-[#6B7280] pl-3">{r.mitigation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Immediate Actions */}
      <Card delay={0.45}>
        <CardLabel icon={CheckCircle2} label="KPMG Next 30 Days" color="#059669" />
        <div className="space-y-3">
          {data.immediateActions.map((a, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${KPMG_BLUE}12` }}>
                <span className="text-[9px] font-black" style={{ color: KPMG_BLUE }}>{i+1}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#1A1F36] leading-snug mb-0.5">{a.action}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#9CA3AF]">👤 {a.owner}</span>
                  <span className="text-[9px] text-[#9CA3AF]">· ⏱ {a.by}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-[#F4F6F9]">
          <p className="text-[9px] text-[#CBD5E1] text-center">© KPMG 2026 · K-Nexus AI · Strictly Confidential</p>
        </div>
      </Card>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingState({ clientName }) {
  const steps = [
    'Researching client background...',
    'Analysing market position...',
    'Classifying client profile...',
    'Generating infra recommendations...',
    'Building stage roadmap...',
    'Finalising cockpit data...',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${KPMG_BLUE}12` }}>
          <Sparkles size={32} style={{ color: KPMG_BLUE }} />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 border-2 border-t-[#0077C8] border-[#E2E8F0] rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-extrabold text-[#1A1F36] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Building Client Cockpit
        </p>
        <p className="text-sm text-[#6B7280]">{clientName || 'Analysing client brief'}...</p>
      </div>
      <div className="flex flex-col gap-2 w-64">
        {steps.map((s, i) => (
          <motion.div key={i} className="flex items-center gap-2.5"
            initial={{ opacity: 0.2 }} animate={{ opacity: i <= step ? 1 : 0.2 }}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? 'bg-green-100' : i === step ? 'bg-[#EBF5FF]' : 'bg-[#F4F6F9]'}`}>
              {i < step
                ? <CheckCircle2 size={10} className="text-green-600" />
                : i === step
                ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: KPMG_BLUE }} />
                : <div className="w-2 h-2 rounded-full bg-[#CBD5E1]" />}
            </div>
            <span className="text-[11px]" style={{ color: i <= step ? '#374151' : '#CBD5E1' }}>{s}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-1 mt-2">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: KPMG_BLUE }}
            animate={{ opacity: [0.3,1,0.3], y: [0,-4,0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Cockpit ──────────────────────────────────────────────────────────────
export default function ClientCockpit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brief = searchParams.get('brief') || '';
  const clientNameParam = searchParams.get('client') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!brief) {
      setError('No client brief provided. Return to the landing page and use the Guide Bot.');
      setLoading(false);
      return;
    }
    generateCockpit();
  }, [brief]);

  const generateCockpit = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const raw = await callClaude({
        prompt: `Generate the client cockpit dashboard JSON for this client brief:\n\n${brief}\n\nClient name hint: ${clientNameParam || 'extract from brief'}`,
        systemOverride: COCKPIT_SYSTEM,
        maxTokens: 4000,
        ragQuery: `${clientNameParam || 'company'} datacenter India market 2025 2026`,
      });

      // strip any accidental markdown fences
      const cleaned = raw.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      setData(parsed);
      writeToWiki('cockpit', brief, { client: parsed.clientName, profile: parsed.profile, infraRec: parsed.infraRec?.recommended, readinessScore: parsed.readiness?.score });
    } catch (err) {
      setError(`Failed to generate cockpit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pc = data ? PROFILE_CONFIG[data.profile] : null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between"
        style={{ background: KPMG_BLUE }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {data?.clientName || clientNameParam || 'Client'} — Cockpit View
              </span>
              {pc && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  {pc.label}
                </span>
              )}
            </div>
            <p className="text-white/50 text-[10px]">K-Nexus AI · Live Client Intelligence · Strictly Confidential</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <button onClick={generateCockpit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors">
              <RefreshCw size={12} /> Regenerate
            </button>
          )}
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors">
            <X size={12} /> Close
          </button>
        </div>
      </div>

      {/* ── Sub-header strip ── */}
      {data && (
        <div className="flex-shrink-0 px-6 py-2 border-b border-[#E2E8F0] bg-[#F8FAFD] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-[#6B7280]">Live AI Intelligence</span>
            </div>
            <span className="text-[#E2E8F0]">·</span>
            <span className="text-[10px] text-[#9CA3AF]">Powered by K-Nexus · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            {data.stageRoadmap?.slice(0,3).map(s => (
              <button key={s.stage} onClick={() => router.push(`/stage/${s.stage}`)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors hover:border-[#00338D] hover:text-[#00338D]"
                style={{ borderColor: '#E2E8F0', color: '#6B7280' }}>
                Stage {s.stage} <ChevronRight size={9} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFD]">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <LoadingState clientName={clientNameParam} />
          </div>
        )}

        {error && !loading && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <AlertTriangle size={40} className="text-[#DC2626]" />
            <div className="text-center">
              <p className="font-bold text-[#1A1F36] mb-1">Could not generate cockpit</p>
              <p className="text-sm text-[#6B7280] max-w-md">{error}</p>
            </div>
            <button onClick={() => router.back()} className="px-4 py-2 bg-[#00338D] text-white text-sm font-bold rounded-xl">
              Go Back
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="p-6 max-w-[1400px] mx-auto">
            <ClientIntelRow data={data} />
            <InfraAndProfile data={data} />
            <BottomRow data={data} router={router} />
          </div>
        )}
      </div>
    </div>
  );
}