'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  X, RefreshCw, ArrowRight, ChevronRight,
  Building2, TrendingUp, Globe, Zap, Shield, BarChart3,
  MapPin, Users, AlertTriangle, CheckCircle2, Clock,
  Sparkles, Server, Leaf, DollarSign, Activity, Target,
  FileText, ExternalLink, CircleDot, Layers, Wrench,
  MessageCircle, Send, Award, Briefcase, Link2, Info,
} from 'lucide-react';
import { callClaude } from '@/lib/claude-api';
import { writeToWiki } from '@/lib/wiki';

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, li) => {
    const parts = [];
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0, m;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return <span key={li}>{parts}{li < text.split('\n').length - 1 && <br />}</span>;
  });
}
import { researchClient } from '@/lib/research';

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

// ── Quantitative schema extension added to every persona prompt ───────────────
const QUANT_SCHEMA_EXTENSION = `
Additionally, include these quantitative fields in the same JSON object (alongside the fields above):

"marketIntelligence": {
  "marketSize2024": "e.g. $6.2B — India datacenter market value in 2024 in USD",
  "marketSize2030": "e.g. $22.1B — projected value by 2030",
  "cagr": "e.g. 23.4% — compound annual growth rate 2024–2030",
  "pipelineMW": "e.g. 1,840 MW — total announced capacity pipeline in India",
  "fdiCommitted": "e.g. $15.2B — FDI committed to India DC sector",
  "keyDrivers": [
    {"driver": "Hyperscaler Buildout", "impact": "+240 MW/yr demand"},
    {"driver": "AI Compute Demand", "impact": "+180 MW/yr demand"},
    {"driver": "Digital India Programme", "impact": "$4B government commitment"}
  ],
  "demandBreakdown": [
    {"segment": "Hyperscaler", "share": 45},
    {"segment": "Enterprise", "share": 30},
    {"segment": "Edge / CDN", "share": 15},
    {"segment": "Government", "share": 10}
  ]
},
"competitiveLandscape": {
  "players": [
    {"name": "string — player name", "capacityMW": number, "tier": "Tier III|Tier IV|Tier II", "geography": "string — key cities", "positioning": "string — 1 phrase"},
    {"name": "string", "capacityMW": number, "tier": "string", "geography": "string", "positioning": "string"},
    {"name": "string", "capacityMW": number, "tier": "string", "geography": "string", "positioning": "string"},
    {"name": "string", "capacityMW": number, "tier": "string", "geography": "string", "positioning": "string"}
  ],
  "clientPositioning": "string — 1 sentence on how client differentiates vs above players"
},
"complianceFrameworks": [
  {"framework": "DPDPA 2023", "relevance": "High|Medium|Low", "status": "Compliant|Gap|N/A", "keyRequirement": "string — specific obligation"},
  {"framework": "TIA-942", "relevance": "High|Medium|Low", "status": "Compliant|Gap|N/A", "keyRequirement": "string"},
  {"framework": "ISO 27001", "relevance": "High|Medium|Low", "status": "Compliant|Gap|N/A", "keyRequirement": "string"},
  {"framework": "ESG / GHG Protocol", "relevance": "High|Medium|Low", "status": "Compliant|Gap|N/A", "keyRequirement": "string"},
  {"framework": "GDPR (if cross-border)", "relevance": "High|Medium|Low", "status": "Compliant|Gap|N/A", "keyRequirement": "string"}
],
"partnershipOpportunities": [
  {"type": "Strategic", "partner": "string — company or segment", "opportunity": "string — specific deal or offering", "value": "string — $ amount or % metric e.g. $80M+ over 5yr"},
  {"type": "Direct-sell", "partner": "string", "opportunity": "string", "value": "string"},
  {"type": "Cross-sell", "partner": "string", "opportunity": "string", "value": "string"}
]

Use real India-specific market data where possible. All numbers must be quantified — no vague ranges.`;

// ── Persona Detection ─────────────────────────────────────────────────────────
const PERSONA_DETECTION_SYSTEM = `You are classifying a client brief into exactly one of three datacenter personas.

You will receive a client brief and optionally live research context about the company.
Use BOTH the brief AND the research signals (e.g. recent acquisitions = expander, compliance audit = operator) to classify.

Return ONLY a JSON object — no markdown, no explanation:
{
  "persona": "builder" | "expander" | "operator",
  "confidence": number between 0 and 1,
  "signals": ["signal1", "signal2"],
  "clarificationNeeded": true | false,
  "clarificationQuestion": "string or null"
}

Persona definitions:
- "builder": Client has NO existing datacenter. Wants to build/enter from scratch. Signals: "new to", "foray into", "set up", "establish", "greenfield", "first datacenter", "looking to enter", "no experience", "explore the market"
- "expander": Client HAS existing DC(s) and wants MORE capacity or new locations. Signals: "expand", "scale up", "additional capacity", "second site", "new location", "increase MW", "portfolio", "acquire", "acquisition", "JV"
- "operator": Client HAS existing DC(s) and wants to IMPROVE or MANAGE them. Signals: "operations", "running", "currently operate", "compliance", "PMO", "efficiency", "PUE", "uptime", "SLA", "audit", "existing facility", "improve", "optimise"

Set clarificationNeeded: true ONLY if confidence is below 0.6 after seeing both brief and research.
When clarificationNeeded is true, set clarificationQuestion to one short question like: "Are you looking to build new datacenter capacity, expand existing capacity, or improve operations of a running datacenter?"`;

// ── Builder: client entering datacenter market for the first time ─────────────
const COCKPIT_SYSTEM_BUILDER = `You are a senior KPMG Datacenter Advisory AI generating structured JSON for a client intelligence cockpit.

This client is a BUILDER — they have NO existing datacenter and want to enter the market or build capacity from scratch.
Focus on: greenfield vs brownfield vs JV entry options, partner ecosystem, market entry strategy.
Do NOT recommend operational improvements — the client does not yet operate a datacenter.

Set "profile": "new" in your response.

For stageRoadmap: all 6 stages are relevant. Stages 01-03 are "Must", 04-06 are "Should".

Return ONLY a single valid JSON object — no markdown, no backticks. Schema:

{
  "clientName": "string",
  "profile": "new",
  "snapshot": { "sector": "string", "hq": "string", "revenue": "string", "experience": "None|Limited", "whyDC": "string" },
  "readiness": {
    "score": number 0-100,
    "rationale": "string",
    "dimensions": [
      {"label": "Financial Strength", "score": number},
      {"label": "Technical Know-how", "score": number},
      {"label": "Market Timing", "score": number},
      {"label": "Regulatory Readiness", "score": number},
      {"label": "Partnership Potential", "score": number}
    ]
  },
  "marketContext": { "headline": "string — must include a specific $ or MW figure", "demandDriver": "string", "supplyGap": "string", "keyPlayers": ["string","string","string"] },
  "infraRec": {
    "recommended": "Greenfield|Brownfield|JV|Colocation|Hybrid",
    "reasoning": "string — 2 sentences including capex range in $M",
    "alternatives": [
      {"type": "string", "fit": number 0-100, "note": "string"},
      {"type": "string", "fit": number 0-100, "note": "string"}
    ]
  },
  "profilePanels": {
    "new": {
      "entryOptions": [
        {"path": "string", "timeline": "string e.g. 18-24 months", "capex": "string e.g. $120M–$180M", "risk": "Low|Medium|High", "note": "string"},
        {"path": "string", "timeline": "string", "capex": "string e.g. $X–$YM", "risk": "Low|Medium|High", "note": "string"},
        {"path": "string", "timeline": "string", "capex": "string", "risk": "Low|Medium|High", "note": "string"}
      ],
      "partners": [
        {"name": "string", "type": "Hyperscaler|EPC|OEM|Investor|Operator", "relevance": "string"},
        {"name": "string", "type": "string", "relevance": "string"},
        {"name": "string", "type": "string", "relevance": "string"},
        {"name": "string", "type": "string", "relevance": "string"}
      ]
    },
    "expansion": null,
    "ops": null
  },
  "stageRoadmap": [
    {"stage": "01", "priority": "Must", "why": "string"},
    {"stage": "02", "priority": "Must", "why": "string"},
    {"stage": "03", "priority": "Must", "why": "string"},
    {"stage": "04", "priority": "Should", "why": "string"},
    {"stage": "05", "priority": "Should", "why": "string"},
    {"stage": "06", "priority": "Should", "why": "string"}
  ],
  "risks": [
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"}
  ],
  "immediateActions": [
    {"action": "string — specific task with $ or date where possible", "owner": "string — KPMG team/role", "by": "string — e.g. Q3 2026"},
    {"action": "string", "owner": "string", "by": "string"},
    {"action": "string", "owner": "string", "by": "string"}
  ]
}
${QUANT_SCHEMA_EXTENSION}

Be specific — use client name, capacity (MW), geography, sector throughout. All numbers must be quantified.`;

// ── Expander: client with existing DCs seeking more capacity or new sites ─────
const COCKPIT_SYSTEM_EXPANDER = `You are a senior KPMG Datacenter Advisory AI generating structured JSON for a client intelligence cockpit.

This client is an EXPANDER — they ALREADY OPERATE datacenter(s) and want to grow: more capacity, new sites, acquisitions, or portfolio optimisation.
DO NOT recommend greenfield market entry or first-time DC builds — the client already has assets.
Focus on: capacity expansion options, new site identification, supply chain for scale, financing structures, portfolio optimisation.

Set "profile": "expansion" in your response.

For stageRoadmap: Stage 01 (market/site), 02 (supply chain), 03 (design) are relevant; mark 04 and 05 as "Should" (review existing); 06 (monetisation) is "Must" if seeking revenue from new capacity.

For infraRec.recommended, choose from: "Organic Expansion" | "Acquisition" | "JV Expansion" | "Sale-Leaseback" | "REIT Structure"

Return ONLY a single valid JSON object — no markdown, no backticks. Schema:

{
  "clientName": "string",
  "profile": "expansion",
  "snapshot": { "sector": "string", "hq": "string", "revenue": "string", "experience": "Moderate|Extensive", "whyDC": "string" },
  "readiness": {
    "score": number 0-100,
    "rationale": "string",
    "dimensions": [
      {"label": "Financial Strength", "score": number},
      {"label": "Technical Know-how", "score": number},
      {"label": "Market Timing", "score": number},
      {"label": "Regulatory Readiness", "score": number},
      {"label": "Partnership Potential", "score": number}
    ]
  },
  "marketContext": { "headline": "string — must include a specific $ or MW figure", "demandDriver": "string", "supplyGap": "string", "keyPlayers": ["string","string","string"] },
  "infraRec": {
    "recommended": "Organic Expansion|Acquisition|JV Expansion|Sale-Leaseback|REIT Structure",
    "reasoning": "string — 2 sentences focused on expansion strategy, not greenfield entry — include capex or valuation range",
    "alternatives": [
      {"type": "string", "fit": number 0-100, "note": "string"},
      {"type": "string", "fit": number 0-100, "note": "string"}
    ]
  },
  "profilePanels": {
    "new": null,
    "expansion": {
      "capacityGap": { "current": "string e.g. 50 MW", "target": "string e.g. 300 MW", "gap": "string e.g. 250 MW", "timeline": "string e.g. 36 months" },
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
    "ops": null
  },
  "stageRoadmap": [
    {"stage": "01", "priority": "Must", "why": "string — site identification and market validation"},
    {"stage": "02", "priority": "Must", "why": "string — supply chain for scale"},
    {"stage": "03", "priority": "Must", "why": "string — design for new capacity"},
    {"stage": "04", "priority": "Should", "why": "string — review compliance across expanded portfolio"},
    {"stage": "05", "priority": "Should", "why": "string — standardise operations across sites"},
    {"stage": "06", "priority": "Must", "why": "string — monetise new capacity"}
  ],
  "risks": [
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"}
  ],
  "immediateActions": [
    {"action": "string — specific task with $ or date where possible", "owner": "string — KPMG team/role", "by": "string — e.g. Q3 2026"},
    {"action": "string", "owner": "string", "by": "string"},
    {"action": "string", "owner": "string", "by": "string"}
  ]
}
${QUANT_SCHEMA_EXTENSION}

Be specific — use client name, current MW, target MW, geography, sector throughout. All numbers must be quantified.`;

// ── Operator: client with existing DCs wanting to improve/manage them ─────────
const COCKPIT_SYSTEM_OPERATOR = `You are a senior KPMG Datacenter Advisory AI generating structured JSON for a client intelligence cockpit.

This client is an OPERATOR — they ALREADY RUN datacenters and want to IMPROVE operations, compliance, efficiency, or PMO structure.
DO NOT recommend building new capacity or market entry — the client is not asking to expand.
Focus on: operations health, compliance gaps, efficiency opportunities, PMO structure, SLA improvement, cost reduction.

Set "profile": "ops" in your response.

For stageRoadmap: Stage 04 (compliance) and 05 (operations) are primary "Must"; Stage 06 (monetisation) is relevant if they want to unlock revenue; Stages 01-03 should be marked "Optional" with note "not applicable unless expanding".

Instead of infraRec, return opsRec with this structure:
"opsRec": { "primaryFocus": "string — main ops priority", "approach": "string — 2 sentences on recommended approach including % improvement target", "timeline": "string — e.g. 6-12 months" }

Return ONLY a single valid JSON object — no markdown, no backticks. Schema:

{
  "clientName": "string",
  "profile": "ops",
  "snapshot": { "sector": "string", "hq": "string", "revenue": "string", "experience": "Moderate|Extensive", "whyDC": "string — why ops improvement matters now" },
  "readiness": {
    "score": number 0-100,
    "rationale": "string — readiness for ops improvement programme",
    "dimensions": [
      {"label": "Financial Strength", "score": number},
      {"label": "Technical Know-how", "score": number},
      {"label": "Market Timing", "score": number},
      {"label": "Regulatory Readiness", "score": number},
      {"label": "Partnership Potential", "score": number}
    ]
  },
  "marketContext": { "headline": "string — ops/compliance benchmark with $ or % figure", "demandDriver": "string", "supplyGap": "string — ops capability gap in market", "keyPlayers": ["string","string","string"] },
  "opsRec": {
    "primaryFocus": "string — e.g. PUE Optimisation | Compliance Uplift | PMO Implementation | SLA Improvement",
    "approach": "string — 2 sentences on the recommended ops programme including quantified improvement target",
    "timeline": "string — e.g. 6-12 months"
  },
  "profilePanels": {
    "new": null,
    "expansion": null,
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
        {"item": "string", "severity": "High|Medium|Low", "action": "string"},
        {"item": "string", "severity": "High|Medium|Low", "action": "string"},
        {"item": "string", "severity": "High|Medium|Low", "action": "string"}
      ],
      "efficiencyWins": [
        {"opportunity": "string — quantify potential savings e.g. $2M/yr", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"},
        {"opportunity": "string", "impact": "High|Medium|Low", "effort": "Quick Win|Medium-term|Strategic"}
      ]
    }
  },
  "stageRoadmap": [
    {"stage": "04", "priority": "Must", "why": "string — compliance and certification gaps"},
    {"stage": "05", "priority": "Must", "why": "string — operational efficiency and SLA improvement"},
    {"stage": "06", "priority": "Should", "why": "string — revenue optimisation from existing assets"},
    {"stage": "01", "priority": "Optional", "why": "Not applicable unless client is also expanding capacity"},
    {"stage": "02", "priority": "Optional", "why": "Not applicable unless client is also expanding capacity"},
    {"stage": "03", "priority": "Optional", "why": "Not applicable unless client is also expanding capacity"}
  ],
  "risks": [
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"},
    {"risk": "string", "severity": "High|Medium|Low", "mitigation": "string"}
  ],
  "immediateActions": [
    {"action": "string — specific task with $ or date where possible", "owner": "string — KPMG team/role", "by": "string — e.g. Q3 2026"},
    {"action": "string", "owner": "string", "by": "string"},
    {"action": "string", "owner": "string", "by": "string"}
  ]
}
${QUANT_SCHEMA_EXTENSION}

Be specific — use client name, current MW capacity, facility locations, sector, compliance standards throughout. All numbers must be quantified.`;

const PERSONA_SYSTEM_MAP = {
  builder: COCKPIT_SYSTEM_BUILDER,
  expander: COCKPIT_SYSTEM_EXPANDER,
  operator: COCKPIT_SYSTEM_OPERATOR,
};

// ── Base UI Components ────────────────────────────────────────────────────────

function Card({ children, className = '', delay = 0, noPad = false, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={`bg-white border border-[#E2E8F0] rounded-2xl shadow-sm ${noPad ? '' : 'p-5'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
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

// ── ROW 0a: DC Market Growth Chart (full-width feature card) ─────────────────
function DCGrowthChart({ data, onDrillDown }) {
  const mi = data.marketIntelligence;
  if (!mi) return null;

  const parseNum = (str) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const start = parseNum(mi.marketSize2024);
  const cagrVal = parseNum(mi.cagr) / 100;
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const chartData = years.map((year, i) => ({
    year: year.toString(),
    value: parseFloat((start * Math.pow(1 + cagrVal, i)).toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-lg">
        <p className="text-[10px] text-[#9CA3AF] mb-0.5">{label}</p>
        <p className="text-[13px] font-black" style={{ color: KPMG_BLUE }}>${payload[0].value}B</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => onDrillDown('marketGrowthDetail', { data: mi })}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.995] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${KPMG_BLUE}12` }}>
              <TrendingUp size={14} style={{ color: KPMG_BLUE }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: KPMG_BLUE }}>India DC Market Growth</span>
          </div>
          <p className="text-[22px] font-black text-[#1A1F36] leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {mi.marketSize2024} <span className="text-[13px] font-semibold text-[#9CA3AF]">→ {mi.marketSize2030} by 2030</span>
          </p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] text-[#0077C8] font-semibold">View full market context →</span>
        </div>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={KPMG_BLUE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={KPMG_BLUE} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} width={38} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={KPMG_BLUE} strokeWidth={2.5}
              fill="url(#dcGradient)" dot={{ r: 3, fill: KPMG_BLUE, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: KPMG_BLUE, strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-[9px] text-[#9CA3AF]">CAGR {mi.cagr} · Click to explore full market intelligence</span>
      </div>
    </motion.div>
  );
}

// ── ROW 0b: 3 unique KPI cards ────────────────────────────────────────────────
function KPIBannerRow({ data, onDrillDown }) {
  const mi = data.marketIntelligence;
  if (!mi) return null;

  const kpis = [
    {
      label: '5-Year CAGR',
      value: mi.cagr,
      sub: '2024 – 2030 compound growth',
      color: '#059669',
      icon: TrendingUp,
      type: 'cagr',
      detail: 'Demand segments & growth drivers',
    },
    {
      label: 'Total Pipeline',
      value: mi.pipelineMW,
      sub: 'Announced capacity (India)',
      color: KPMG_MID,
      icon: Zap,
      type: 'pipeline',
      detail: 'Pipeline breakdown by segment',
    },
    {
      label: 'FDI Committed',
      value: mi.fdiCommitted,
      sub: 'To India DC sector',
      color: '#7C3AED',
      icon: DollarSign,
      type: 'fdi',
      detail: 'Investment sources & implications',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            onClick={() => onDrillDown(kpi.type, { data: mi })}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}12` }}>
                <Icon size={16} style={{ color: kpi.color }} />
              </div>
              <span className="text-[9px] text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors opacity-0 group-hover:opacity-100 font-medium">
                Explore →
              </span>
            </div>
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{kpi.value}</p>
            <p className="text-[9px] text-[#9CA3AF] mt-1">{kpi.sub}</p>
            <p className="text-[9px] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: kpi.color }}>{kpi.detail}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── ROW 1: Client Intelligence Row ───────────────────────────────────────────
function ClientIntelRow({ data, onDrillDown, logoUrl, setLogoUrl }) {
  const pc = PROFILE_CONFIG[data.profile];
  const ProfileIcon = pc.icon;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {/* Client Snapshot with logo */}
      <Card delay={0.05} className="hover:shadow-md transition-all duration-200">
        {/* Logo strip */}
        <div className="flex items-center gap-3 mb-3">
          {logoUrl && !imgFailed ? (
            <img
              src={logoUrl}
              alt={data.clientName}
              className="h-8 object-contain max-w-[80px]"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: KPMG_BLUE }}>
              <span className="text-white font-black text-sm">{(data.clientName || 'C').slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-extrabold text-[#1A1F36] text-sm leading-tight truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{data.clientName}</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color }}>{pc.label}</span>
          </div>
        </div>
        <CardLabel icon={Building2} label="Client Snapshot" />
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

      {/* Readiness Score — donut chart */}
      <Card delay={0.1} onClick={() => onDrillDown('readiness', data.readiness)}
        className="hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer group flex flex-col">
        <CardLabel icon={Target} label="Market Readiness" color={KPMG_MID} />
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Donut chart with score overlay */}
          <div className="relative w-full flex justify-center mb-3">
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'score', value: data.readiness.score },
                      { name: 'rest',  value: 100 - data.readiness.score },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={62}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={900}
                  >
                    <Cell fill={KPMG_MID} />
                    <Cell fill="#E2E8F0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Score number in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black leading-none" style={{ color: KPMG_BLUE, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {data.readiness.score}
              </span>
              <span className="text-[9px] text-[#9CA3AF] mt-0.5">/ 100</span>
            </div>
          </div>
          {/* 2-liner rationale */}
          <p className="text-[11px] text-[#374151] text-center leading-snug line-clamp-2 px-1 mb-2">
            {data.readiness.rationale}
          </p>
          <p className="text-[9px] text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors duration-200 font-medium">
            Click for dimension breakdown →
          </p>
        </div>
      </Card>

      {/* Market Context */}
      <Card delay={0.15} onClick={() => onDrillDown('marketContext', data.marketContext)} className="hover:shadow-md hover:border-[#BFDBFE] transition-all group">
        <CardLabel icon={Globe} label="Market Context" color="#059669" />
        <div className="mb-3 p-2.5 rounded-xl cursor-pointer" style={{ background: '#ECFDF5' }}>
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
        <div className="mt-3 pt-3 border-t border-[#F4F6F9] flex items-center justify-between">
          <span className="text-[9px] text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors duration-200 font-medium">
            View market dynamics →
          </span>
          <ExternalLink size={10} className="text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors duration-200" />
        </div>
      </Card>
    </div>
  );
}

// ── ROW 2: Competitive Landscape ─────────────────────────────────────────────
function CompetitiveLandscapeSection({ data, onDrillDown }) {
  const cl = data.competitiveLandscape;
  const mi = data.marketIntelligence;
  if (!cl?.players?.length) return null;

  const TIER_COLORS = { 'Tier IV': KPMG_BLUE, 'Tier III': KPMG_MID, 'Tier II': '#D97706', 'Tier I': '#9CA3AF' };
  const PIE_COLORS = [KPMG_BLUE, KPMG_MID, '#059669', '#D97706', '#7C3AED'];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-[10px]">
        <p className="font-bold text-[#1A1F36] mb-1">{d.name}</p>
        <p className="text-[#9CA3AF]">{d.capacityMW} MW · {d.tier}</p>
        <p className="text-[#374151]">{d.geography}</p>
      </div>
    );
  };

  const CompYTick = ({ x, y, payload }) => {
    const raw = payload.value || '';
    const clean = raw.replace(/\s*\(.*?\)/g, '').replace(/\s*-\s*[\w\s]+JV$/i, '').trim();
    const label = clean.length > 22 ? clean.slice(0, 22) + '…' : clean;
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fill="#374151" style={{ fontSize: 10 }}>
        {label}
      </text>
    );
  };

  const compChartHeight = Math.max(220, cl.players.length * 56);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {/* Bar chart — col-span-2 */}
      <div className="col-span-2">
        <Card delay={0.2} className="h-full">
          <CardLabel icon={BarChart3} label="Competitive Landscape — Installed Capacity (MW)" color={KPMG_MID} />
          <div style={{ height: compChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cl.players} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={<CompYTick />} width={130} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacityMW" radius={[0, 4, 4, 0]} onClick={(entry) => onDrillDown('competitor', entry)}>
                  {cl.players.map((p, i) => (
                    <Cell key={i} fill={TIER_COLORS[p.tier] || '#9CA3AF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-1">
            {Object.entries(TIER_COLORS).map(([tier, color]) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-[9px] text-[#9CA3AF]">{tier}</span>
              </div>
            ))}
            <span className="text-[9px] text-[#CBD5E1] ml-auto">Click any bar to drill down</span>
          </div>
        </Card>
      </div>

      {/* Positioning + demand breakdown — col-span-1 */}
      <div className="flex flex-col gap-4">
        <Card delay={0.25}>
          <CardLabel icon={Target} label="Client Positioning" color="#059669" />
          <p className="text-[11px] text-[#374151] leading-relaxed">{cl.clientPositioning}</p>
        </Card>
        {mi?.demandBreakdown?.length > 0 && (
          <Card delay={0.3} className="flex-1">
            <CardLabel icon={CircleDot} label="Demand Mix" color="#7C3AED" />
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mi.demandBreakdown} cx="50%" cy="50%" outerRadius={42}
                    dataKey="share" nameKey="segment" onClick={(entry) => onDrillDown('market', { kpiLabel: 'Demand Mix', data: mi })}>
                    {mi.demandBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-1">
              {mi.demandBreakdown.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[9px] text-[#374151]">{d.segment}</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#374151]">{d.share}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── ROW 3: Infra Rec + Profile Panels (unchanged) ─────────────────────────────
function InfraRecCard({ ir }) {
  const fitColor = (score) => {
    if (score >= 90) return '#059669';
    if (score >= 75) return KPMG_MID;
    if (score >= 60) return '#D97706';
    return '#9CA3AF';
  };
  return (
    <Card delay={0.2}>
      <CardLabel icon={Server} label="Infra Recommendation" color="#7C3AED" />
      <div className="mb-3 p-3 rounded-xl border-2" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
        <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">Recommended</p>
        <p className="text-lg font-black text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ir.recommended}</p>
      </div>
      <p className="text-[11px] text-[#374151] leading-relaxed mb-3">{ir.reasoning}</p>
      <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-2">Alternatives</p>
      {ir.alternatives?.map(a => (
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
  );
}

function OpsRecCard({ opsRec }) {
  return (
    <Card delay={0.2}>
      <CardLabel icon={Wrench} label="Ops Recommendation" color="#7C3AED" />
      <div className="mb-3 p-3 rounded-xl border-2" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
        <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">Primary Focus</p>
        <p className="text-base font-black text-[#1A1F36] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{opsRec.primaryFocus}</p>
      </div>
      <p className="text-[11px] text-[#374151] leading-relaxed mb-3">{opsRec.approach}</p>
      <div className="p-2.5 rounded-xl bg-[#F4F6F9] flex items-center gap-2">
        <Clock size={12} className="text-[#9CA3AF] flex-shrink-0" />
        <div>
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider">Programme Timeline</p>
          <p className="text-[11px] font-bold text-[#374151]">{opsRec.timeline}</p>
        </div>
      </div>
    </Card>
  );
}

function InfraAndProfile({ data }) {
  const profile = data.profile;
  const isOperator = profile === 'ops';
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {isOperator
        ? <OpsRecCard opsRec={data.opsRec || { primaryFocus: 'Operational Excellence', approach: 'Focus on efficiency and compliance.', timeline: '6-12 months' }} />
        : <InfraRecCard ir={data.infraRec || {}} />
      }
      <div className="col-span-2">
        {profile === 'new' && <NewPlayerPanel data={data.profilePanels.new} />}
        {profile === 'expansion' && <ExpansionPanel data={data.profilePanels.expansion} />}
        {profile === 'ops' && <OpsPanel data={data.profilePanels.ops} />}
      </div>
    </div>
  );
}

function NewPlayerPanel({ data }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card delay={0.25} className="h-full">
        <CardLabel icon={Layers} label="Market Entry Options" color={KPMG_MID} />
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
  const prColor = { Critical: '#DC2626', High: '#D97706', Medium: KPMG_MID };
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

// ── ROW 4: Risk Matrix, Compliance Tracker, Partnership Card ──────────────────
function RiskMatrixCard({ data, onDrillDown }) {
  const risks = data.risks || [];
  const sevColor = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' };

  const categorize = (risk) => {
    const r = (risk.risk || '').toLowerCase();
    if (r.includes('regulat') || r.includes('compliance') || r.includes('policy') || r.includes('law') || r.includes('dpdpa') || r.includes('permit') || r.includes('approval')) return 'Regulatory';
    if (r.includes('financ') || r.includes('capital') || r.includes('cost') || r.includes('debt') || r.includes('fund') || r.includes('liquidity')) return 'Financial';
    if (r.includes('region') || r.includes('location') || r.includes('state') || r.includes('land') || r.includes('grid') || r.includes('geograph') || r.includes('infrastructure')) return 'Regional';
    return 'Operational';
  };

  const catColor = { Regulatory: KPMG_BLUE, Regional: '#7C3AED', Operational: '#D97706', Financial: '#059669' };

  return (
    <Card delay={0.35}>
      <CardLabel icon={AlertTriangle} label="Key Entry Risks" color="#DC2626" />
      <div className="space-y-2">
        {risks.map((r, i) => {
          const cat = categorize(r);
          return (
            <div key={i}
              onClick={() => onDrillDown('risk', r)}
              className="p-2.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all group"
              style={{ borderColor: `${sevColor[r.severity] || '#E2E8F0'}25`, background: `${sevColor[r.severity] || '#F4F6F9'}06` }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[11px] font-semibold text-[#1A1F36] group-hover:text-[#00338D] transition-colors">{r.risk}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${catColor[cat]}15`, color: catColor[cat] }}>{cat}</span>
                  <SeverityBadge severity={r.severity} />
                </div>
              </div>
              <p className="text-[9px] text-[#6B7280]">{r.mitigation}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ComplianceTracker({ data, onDrillDown }) {
  const frameworks = data.complianceFrameworks || [];
  const statusStyle = {
    Compliant: { bg: '#DCFCE7', color: '#16A34A', Icon: CheckCircle2 },
    Gap:       { bg: '#FEE2E2', color: '#DC2626', Icon: AlertTriangle },
    'N/A':     { bg: '#F4F6F9', color: '#9CA3AF', Icon: CircleDot },
  };
  const relColor = { High: KPMG_BLUE, Medium: '#D97706', Low: '#9CA3AF' };

  return (
    <Card delay={0.4}>
      <CardLabel icon={Shield} label="Compliance Frameworks" color={KPMG_BLUE} />
      {frameworks.length > 0 ? (
        <div className="space-y-2">
          {frameworks.map((f, i) => {
            const s = statusStyle[f.status] || statusStyle['N/A'];
            const StatusIcon = s.Icon;
            return (
              <div key={i}
                onClick={() => onDrillDown('compliance', f)}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F4F6F9] cursor-pointer transition-colors group">
                <StatusIcon size={13} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <p className="text-[11px] font-bold text-[#1A1F36] group-hover:text-[#00338D] transition-colors">{f.framework}</p>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>{f.status}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded ml-auto" style={{ color: relColor[f.relevance] || '#9CA3AF', background: `${relColor[f.relevance] || '#9CA3AF'}15` }}>{f.relevance}</span>
                  </div>
                  <p className="text-[9px] text-[#6B7280] line-clamp-1">{f.keyRequirement}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-[#9CA3AF] text-center py-4">No compliance data available</p>
      )}
    </Card>
  );
}

function PartnershipCard({ data, onDrillDown }) {
  const partnerships = data.partnershipOpportunities || [];
  const typeConfig = {
    'Strategic':   { color: KPMG_BLUE,  bg: '#EBF5FF',  Icon: Award },
    'Direct-sell': { color: '#059669',  bg: '#ECFDF5',  Icon: Briefcase },
    'Cross-sell':  { color: '#7C3AED',  bg: '#F5F3FF',  Icon: Link2 },
  };

  return (
    <Card delay={0.45}>
      <CardLabel icon={Briefcase} label="Partnership Opportunities" color="#059669" />
      {partnerships.length > 0 ? (
        <div className="space-y-2">
          {partnerships.map((p, i) => {
            const tc = typeConfig[p.type] || typeConfig['Direct-sell'];
            const Icon = tc.Icon;
            return (
              <div key={i}
                onClick={() => onDrillDown('partnership', p)}
                className="p-2.5 rounded-xl border border-[#E2E8F0] cursor-pointer hover:shadow-sm hover:border-[#BFDBFE] transition-all group">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                    <Icon size={13} style={{ color: tc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-[11px] font-bold text-[#1A1F36] group-hover:text-[#00338D] transition-colors truncate">{p.partner}</p>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: tc.bg, color: tc.color }}>{p.type}</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280] leading-snug mb-1 line-clamp-2">{p.opportunity}</p>
                    <p className="text-[9px] font-bold" style={{ color: '#059669' }}>💰 {p.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-[#9CA3AF] text-center py-4">No partnership data</p>
      )}
    </Card>
  );
}

// ── ROW 5: Immediate Actions (col-span-2) + News Feed (col-span-1) ────────────
function ImmediateActionsCard({ data, onDrillDown }) {
  const actions = data.immediateActions || [];
  return (
    <Card delay={0.5} className="h-full">
      <CardLabel icon={CheckCircle2} label="KPMG Immediate Actions — Next 30 Days" color="#059669" />
      <div className="grid grid-cols-3 gap-3">
        {actions.map((a, i) => (
          <div key={i}
            onClick={() => onDrillDown('action', { ...a, index: i + 1 })}
            className="p-3 rounded-xl border border-[#E2E8F0] cursor-pointer hover:shadow-sm hover:border-[#BFDBFE] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${KPMG_BLUE}12` }}>
                <span className="text-[9px] font-black" style={{ color: KPMG_BLUE }}>{i + 1}</span>
              </div>
              <ChevronRight size={10} className="text-[#CBD5E1] group-hover:text-[#0077C8] transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-[#1A1F36] leading-snug mb-2 group-hover:text-[#00338D] transition-colors">{a.action}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Users size={9} className="text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[9px] text-[#9CA3AF] truncate">{a.owner}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={9} className="text-[#D97706] flex-shrink-0" />
                <span className="text-[9px] font-semibold text-[#D97706]">{a.by}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[#F4F6F9]">
        <p className="text-[9px] text-[#CBD5E1] text-center">© KPMG 2026 · K-Nexus AI · Strictly Confidential</p>
      </div>
    </Card>
  );
}

function ClientNewsFeed({ researchContext }) {
  const parseNews = (ctx) => {
    if (!ctx) return [];
    const newsSection = ctx.split('=== RECENT NEWS')[1] || ctx.split('===')[1] || ctx;
    const rawItems = newsSection.split('\n\n').filter(s => s.replace(/\n/g, ' ').trim().length > 40);
    return rawItems.slice(0, 3).map((text, i) => {
      const cleaned = text.replace(/^\[.*?\]\s*/, '').replace(/\n/g, ' ').trim();
      return {
        snippet: cleaned.length > 140 ? cleaned.slice(0, 140) + '…' : cleaned,
        tag: ['Market', 'Company', 'Sector'][i % 3],
      };
    });
  };

  const news = parseNews(researchContext);
  const tagColors = {
    Market:  { bg: '#EBF5FF',  color: KPMG_BLUE },
    Company: { bg: '#ECFDF5',  color: '#059669' },
    Sector:  { bg: '#F5F3FF',  color: '#7C3AED' },
  };

  return (
    <Card delay={0.55} className="h-full">
      <CardLabel icon={FileText} label="Live Research Intelligence" color="#7C3AED" />
      {news.length > 0 ? (
        <div className="space-y-2">
          {news.map((item, i) => {
            const tc = tagColors[item.tag];
            return (
              <div key={i} className="p-2.5 rounded-xl bg-[#F4F6F9]">
                <div className="mb-1">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: tc.bg, color: tc.color }}>{item.tag}</span>
                </div>
                <p className="text-[10px] text-[#374151] leading-relaxed">{item.snippet}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText size={24} className="text-[#E2E8F0] mb-2" />
          <p className="text-[10px] text-[#9CA3AF]">Research context loading…</p>
        </div>
      )}
      <p className="text-[9px] text-[#CBD5E1] mt-3 text-center">Powered by Tavily + Exa · Live web search</p>
    </Card>
  );
}

// ── Drill-Down Modal System ───────────────────────────────────────────────────
function MarketDrillDown({ payload }) {
  const mi = payload.data || {};
  const parseNum = (str) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const start = parseNum(mi.marketSize2024);
  const end = parseNum(mi.marketSize2030);
  const cagrVal = parseNum(mi.cagr) / 100;
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const projection = years.map((year, i) => ({
    year: year.toString(),
    value: parseFloat((start * Math.pow(1 + cagrVal, i)).toFixed(1)),
  }));

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        India Datacenter Market Intelligence
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Market Size (2024)', value: mi.marketSize2024 },
          { label: 'Projected (2030)', value: mi.marketSize2030 },
          { label: 'CAGR 2024–2030', value: mi.cagr },
          { label: 'FDI Committed', value: mi.fdiCommitted },
        ].map((kpi, i) => (
          <div key={i} className="p-3 bg-[#F4F6F9] rounded-xl">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">{kpi.label}</p>
            <p className="text-lg font-black text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">Market Size Projection (2024–2030, $B)</p>
      <div className="h-44 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projection} margin={{ top: 5, right: 16, bottom: 5, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F9" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
            <Tooltip formatter={(v) => [`$${v}B`, 'Market Size']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
            <Line type="monotone" dataKey="value" stroke={KPMG_BLUE} strokeWidth={2.5} dot={{ r: 3, fill: KPMG_BLUE }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {mi.keyDrivers?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">Key Demand Drivers</p>
          <div className="space-y-2">
            {mi.keyDrivers.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-[#F4F6F9] rounded-xl">
                <span className="text-[11px] font-semibold text-[#374151]">{d.driver}</span>
                <span className="text-[11px] font-bold" style={{ color: '#059669' }}>{d.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Market growth detail (from DCGrowthChart click) ──────────────────────────
function MarketGrowthDetailDrillDown({ payload }) {
  const mi = payload.data || {};
  const parseNum = (str) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const start = parseNum(mi.marketSize2024);
  const cagrVal = parseNum(mi.cagr) / 100;
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const projection = years.map((year, i) => ({
    year: year.toString(),
    value: parseFloat((start * Math.pow(1 + cagrVal, i)).toFixed(1)),
  }));

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        India DC Market — 2024 to 2030 Growth Trajectory
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Market (2024)', value: mi.marketSize2024 },
          { label: 'Projected (2030)', value: mi.marketSize2030 },
          { label: 'CAGR', value: mi.cagr },
        ].map((kpi, i) => (
          <div key={i} className="p-3 bg-[#F4F6F9] rounded-xl text-center">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">{kpi.label}</p>
            <p className="text-[18px] font-black text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="h-48 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projection} margin={{ top: 5, right: 16, bottom: 5, left: 8 }}>
            <defs>
              <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={KPMG_BLUE} stopOpacity={0.15} />
                <stop offset="100%" stopColor={KPMG_BLUE} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} width={38} />
            <Tooltip formatter={(v) => [`$${v}B`, 'Market Size']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
            <Area type="monotone" dataKey="value" stroke={KPMG_BLUE} strokeWidth={2.5} fill="url(#modalGradient)"
              dot={{ r: 3, fill: KPMG_BLUE, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {mi.keyDrivers?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">Key Demand Drivers</p>
          <div className="space-y-2">
            {mi.keyDrivers.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-[#F4F6F9] rounded-xl">
                <span className="text-[11px] font-semibold text-[#374151]">{d.driver}</span>
                <span className="text-[11px] font-bold" style={{ color: '#059669' }}>{d.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CAGR drill-down ───────────────────────────────────────────────────────────
function CAGRDrillDown({ payload }) {
  const mi = payload.data || {};
  const PIE_COLORS = [KPMG_BLUE, KPMG_MID, '#059669', '#D97706', '#7C3AED'];
  const parseNum = (str) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const cagrVal = parseNum(mi.cagr);
  const start = parseNum(mi.marketSize2024);

  const impliedGrowth = [2025, 2026, 2027, 2028, 2029, 2030].map((yr, i) => ({
    year: yr.toString(),
    added: parseFloat((start * Math.pow(1 + cagrVal / 100, i + 1) - start * Math.pow(1 + cagrVal / 100, i)).toFixed(1)),
  }));

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        CAGR Analysis — {mi.cagr} Growth Rate Explained
      </h3>
      <div className="p-4 rounded-2xl mb-5" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
        <p className="text-[11px] text-[#065F46]">At <strong>{mi.cagr}</strong> CAGR, the India datacenter market adds
        approximately <strong>${(parseNum(mi.marketSize2024) * (parseNum(mi.cagr) / 100)).toFixed(1)}B in new value annually</strong>,
        reaching {mi.marketSize2030} by 2030.</p>
      </div>

      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">Incremental Market Added Per Year ($B)</p>
      <div className="h-36 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={impliedGrowth} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} width={36} />
            <Tooltip formatter={(v) => [`$${v}B`, 'Added']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
            <Bar dataKey="added" radius={[3, 3, 0, 0]} fill={KPMG_MID} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {mi.demandBreakdown?.length > 0 && (
        <>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-3">Demand Composition Driving Growth</p>
          <div className="grid grid-cols-2 gap-2">
            {mi.demandBreakdown.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: `${PIE_COLORS[i % PIE_COLORS.length]}10` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[11px] text-[#374151]">{d.segment}</span>
                </div>
                <span className="text-[11px] font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{d.share}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Pipeline drill-down ───────────────────────────────────────────────────────
function PipelineDrillDown({ payload }) {
  const mi = payload.data || {};
  const PIE_COLORS = [KPMG_BLUE, KPMG_MID, '#059669', '#D97706', '#7C3AED'];

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Pipeline Intelligence — {mi.pipelineMW} Total Announced
      </h3>
      <div className="p-4 rounded-2xl mb-5" style={{ background: `${KPMG_MID}10`, border: `1px solid ${KPMG_MID}25` }}>
        <p className="text-[11px] text-[#374151]">India's announced datacenter pipeline of <strong>{mi.pipelineMW}</strong> represents committed future capacity
        across hyperscaler, enterprise and colocation players. This figure excludes speculative projects.</p>
      </div>

      {mi.demandBreakdown?.length > 0 && (
        <>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-3">Pipeline Demand by Segment</p>
          <div style={{ height: Math.max(160, mi.demandBreakdown.length * 52) }} className="mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mi.demandBreakdown} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis
                  type="category"
                  dataKey="segment"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const raw = payload.value || '';
                    const clean = raw.replace(/\s*\(.*?\)/g, '').trim();
                    const label = clean.length > 18 ? clean.slice(0, 18) + '…' : clean;
                    return (
                      <text x={x} y={y} dy={4} textAnchor="end" fill="#374151" style={{ fontSize: 10 }}>
                        {label}
                      </text>
                    );
                  }}
                />
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                  {mi.demandBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="flex items-start gap-2 p-3 bg-[#EBF5FF] rounded-xl">
        <Info size={13} style={{ color: KPMG_BLUE, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[10px] text-[#374151]">Pipeline data reflects publicly announced commitments. Actual commissioning timelines may vary by 12–24 months depending on land acquisition and power availability.</p>
      </div>
    </div>
  );
}

// ── FDI drill-down ────────────────────────────────────────────────────────────
function FDIDrillDown({ payload }) {
  const mi = payload.data || {};
  const fdiBar = [
    { name: 'Committed', value: 100, color: KPMG_BLUE },
    { name: 'Under Diligence', value: 60, color: KPMG_MID },
    { name: 'Deployed (est.)', value: 35, color: '#059669' },
  ];

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        FDI Intelligence — {mi.fdiCommitted} Committed
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {fdiBar.map((f, i) => (
          <div key={i} className="p-3 bg-[#F4F6F9] rounded-xl">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">{f.name}</p>
            <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-1">
              <motion.div className="h-full rounded-full" style={{ background: f.color }}
                initial={{ width: 0 }} animate={{ width: `${f.value}%` }} transition={{ duration: 0.8, delay: i * 0.15 }} />
            </div>
            <p className="text-[9px] font-semibold" style={{ color: f.color }}>{f.name === 'Committed' ? mi.fdiCommitted : f.name === 'Deployed (est.)' ? `~${Math.round(parseFloat((mi.fdiCommitted || '0').replace(/[^0-9.]/g, '')) * 0.35 || 0)}B est.` : 'Due diligence'}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">Key FDI Sources</p>
          <div className="space-y-2">
            {['US Hyperscalers (AWS, Microsoft, Google)', 'Singapore-based Data Centre REITs', 'Middle East Sovereign Funds', 'Japanese Conglomerates (NTT, Softbank)'].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 bg-[#F4F6F9] rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: KPMG_BLUE }} />
                <span className="text-[11px] text-[#374151]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-[#EBF5FF] rounded-xl">
        <Info size={13} style={{ color: KPMG_BLUE, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[10px] text-[#374151]">Strong FDI momentum reflects India's strategic positioning as the next major hyperscaler hub in Asia, driven by data localisation mandates and AI infrastructure demand.</p>
      </div>
    </div>
  );
}

function CompetitorDrillDown({ payload }) {
  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {payload.name} — Player Profile
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Installed Capacity', value: `${payload.capacityMW} MW` },
          { label: 'Tier Rating', value: payload.tier },
          { label: 'Geographic Footprint', value: payload.geography },
          { label: 'Market Positioning', value: payload.positioning },
        ].map((kpi, i) => (
          <div key={i} className="p-3 bg-[#F4F6F9] rounded-xl">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">{kpi.label}</p>
            <p className="text-[13px] font-bold text-[#1A1F36]">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessDrillDown({ payload }) {
  const radarData = (payload.dimensions || []).map(d => ({ label: d.label, score: d.score }));

  const CustomRadarLabel = ({ x, y, cx, cy, value, payload: lp }) => {
    const isLeft = x < cx;
    return (
      <text x={x} y={y} textAnchor={isLeft ? 'end' : 'start'} dominantBaseline="central"
        style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}>
        {lp?.label?.split(' ')[0]}
      </text>
    );
  };

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Market Readiness — Dimension Breakdown
      </h3>
      <div className="flex items-center gap-3 mb-4 p-3 bg-[#F4F6F9] rounded-2xl">
        <div className="text-center px-4 border-r border-[#E2E8F0]">
          <p className="text-3xl font-black" style={{ color: KPMG_BLUE, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{payload.score}</p>
          <p className="text-[9px] text-[#9CA3AF]">/ 100</p>
        </div>
        <p className="text-[11px] text-[#374151] leading-relaxed flex-1">{payload.rationale}</p>
      </div>

      {/* Radar / Spider chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={90} data={radarData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 9.5, fill: '#374151', fontWeight: 600 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Score" dataKey="score"
              stroke={KPMG_MID} fill={KPMG_MID} fillOpacity={0.18}
              dot={{ r: 4, fill: KPMG_MID, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={true} animationDuration={700}
            />
            <Tooltip formatter={(v) => [`${v}/100`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score table */}
      <div className="space-y-1.5">
        {(payload.dimensions || []).map((d, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-[#F4F6F9] rounded-xl">
            <span className="text-[11px] font-semibold text-[#374151]">{d.label}</span>
            <span className="text-[12px] font-black" style={{ color: d.score >= 70 ? '#059669' : d.score >= 50 ? '#D97706' : '#DC2626' }}>
              {d.score}<span className="text-[9px] font-normal text-[#9CA3AF]">/100</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketContextDrillDown({ payload }) {
  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Market Context — Deep Dive
      </h3>
      <div className="p-4 rounded-2xl mb-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
        <p className="text-[13px] font-bold text-[#065F46]">{payload.headline}</p>
      </div>
      <div className="space-y-4">
        {[
          { label: 'Primary Demand Driver', value: payload.demandDriver },
          { label: 'Supply Gap / Opportunity', value: payload.supplyGap },
        ].map((item, i) => (
          <div key={i}>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">{item.label}</p>
            <p className="text-[12px] text-[#374151] leading-relaxed bg-[#F4F6F9] p-3 rounded-xl">{item.value}</p>
          </div>
        ))}
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">Key Market Players</p>
          <div className="flex flex-wrap gap-2">
            {payload.keyPlayers?.map(p => (
              <span key={p} className="text-[11px] font-semibold px-3 py-1.5 bg-[#F4F6F9] text-[#374151] rounded-xl">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskDrillDown({ payload }) {
  const sevColor = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' };
  const color = sevColor[payload.severity] || '#9CA3AF';
  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
          <AlertTriangle size={18} style={{ color }} />
        </div>
        <div>
          <p className="font-extrabold text-[#1A1F36] leading-snug mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{payload.risk}</p>
          <SeverityBadge severity={payload.severity} />
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">Recommended Mitigation</p>
        <p className="text-[12px] text-[#374151] leading-relaxed bg-[#F0FDF4] p-4 rounded-xl border border-[#BBF7D0]">{payload.mitigation}</p>
      </div>
      <div className="flex items-start gap-2 p-3 bg-[#EBF5FF] rounded-xl">
        <Info size={13} style={{ color: KPMG_BLUE, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[10px] text-[#374151]">KPMG Advisory will develop a detailed risk mitigation playbook as part of the engagement scope.</p>
      </div>
    </div>
  );
}

function ComplianceDrillDown({ payload }) {
  const statusStyle = {
    Compliant: { bg: '#DCFCE7', color: '#16A34A' },
    Gap:       { bg: '#FEE2E2', color: '#DC2626' },
    'N/A':     { bg: '#F4F6F9', color: '#9CA3AF' },
  };
  const s = statusStyle[payload.status] || statusStyle['N/A'];
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${KPMG_BLUE}15` }}>
          <Shield size={22} style={{ color: KPMG_BLUE }} />
        </div>
        <div>
          <p className="font-extrabold text-lg text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{payload.framework}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>{payload.status}</span>
            <span className="text-[10px] text-[#9CA3AF]">Relevance: <strong>{payload.relevance}</strong></span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">Key Requirement</p>
        <div className="p-4 bg-[#F4F6F9] rounded-xl">
          <p className="text-[12px] text-[#374151] leading-relaxed">{payload.keyRequirement}</p>
        </div>
      </div>
      {payload.status === 'Gap' && (
        <div className="p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl">
          <p className="text-[10px] font-bold text-[#D97706] mb-1">Action Required</p>
          <p className="text-[11px] text-[#374151]">This compliance gap should be addressed in the KPMG engagement. A remediation roadmap will be developed as a priority workstream.</p>
        </div>
      )}
      {payload.status === 'Compliant' && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl">
          <p className="text-[10px] font-bold text-[#16A34A] mb-1">Currently Compliant</p>
          <p className="text-[11px] text-[#374151]">Ongoing monitoring recommended to maintain compliance as regulations evolve.</p>
        </div>
      )}
    </div>
  );
}

function PartnershipDrillDown({ payload }) {
  const typeColor = { 'Strategic': KPMG_BLUE, 'Direct-sell': '#059669', 'Cross-sell': '#7C3AED' };
  const color = typeColor[payload.type] || KPMG_BLUE;
  return (
    <div>
      <h3 className="text-base font-extrabold text-[#1A1F36] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {payload.partner} — Partnership Opportunity
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-[#F4F6F9] rounded-xl">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">Partnership Type</p>
          <span className="text-[12px] font-bold px-2 py-1 rounded-lg" style={{ background: `${color}15`, color }}>{payload.type}</span>
        </div>
        <div className="p-3 bg-[#ECFDF5] rounded-xl">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-1">Estimated Value</p>
          <p className="text-[13px] font-bold text-[#059669]">{payload.value}</p>
        </div>
      </div>
      <div className="p-4 bg-[#F4F6F9] rounded-xl mb-4">
        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">Opportunity Description</p>
        <p className="text-[12px] text-[#374151] leading-relaxed">{payload.opportunity}</p>
      </div>
      <div className="flex items-start gap-2 p-3 bg-[#EBF5FF] rounded-xl">
        <Info size={13} style={{ color: KPMG_BLUE, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[10px] text-[#374151]">KPMG will facilitate introductions and structure the partnership terms as part of the advisory mandate.</p>
      </div>
    </div>
  );
}

function ActionDrillDown({ payload }) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${KPMG_BLUE}12` }}>
          <span className="text-base font-black" style={{ color: KPMG_BLUE }}>{payload.index}</span>
        </div>
        <p className="font-extrabold text-[#1A1F36] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{payload.action}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-[#F4F6F9] rounded-xl">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Responsible Owner</p>
          <p className="text-[12px] font-bold text-[#374151]">{payload.owner}</p>
        </div>
        <div className="p-3 bg-[#FFF7ED] rounded-xl border border-[#FED7AA]">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Target Date</p>
          <p className="text-[12px] font-bold text-[#D97706]">{payload.by}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-[#EBF5FF] rounded-xl">
        <CheckCircle2 size={13} style={{ color: KPMG_BLUE, marginTop: 1, flexShrink: 0 }} />
        <p className="text-[10px] text-[#374151]">This action will be tracked in the KPMG engagement tracker and reviewed at each status call with the client.</p>
      </div>
    </div>
  );
}

function DrillDownModal({ modal, onClose }) {
  if (!modal) return null;
  const { type, payload } = modal;

  const MODAL_ACCENT = {
    market: KPMG_BLUE, marketContext: '#059669', competitor: KPMG_MID,
    readiness: KPMG_MID, risk: '#DC2626', compliance: KPMG_BLUE,
    partnership: '#059669', action: '#059669',
  };
  const accent = MODAL_ACCENT[type] || KPMG_BLUE;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center p-8"
        style={{ background: 'rgba(26,31,54,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[82vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex-shrink-0 border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
                <Info size={15} style={{ color: accent }} />
              </div>
              <span className="font-bold text-[#1A1F36] capitalize text-sm">
                {type === 'marketContext' ? 'Market Context Detail' : `${type.replace('-', ' ')} Details`}
              </span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#F4F6F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors">
              <X size={14} className="text-[#374151]" />
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto p-6">
            {type === 'marketGrowthDetail' && <MarketGrowthDetailDrillDown payload={payload} />}
            {type === 'cagr' && <CAGRDrillDown payload={payload} />}
            {type === 'pipeline' && <PipelineDrillDown payload={payload} />}
            {type === 'fdi' && <FDIDrillDown payload={payload} />}
            {type === 'market' && <MarketGrowthDetailDrillDown payload={payload} />}
            {type === 'marketContext' && <MarketContextDrillDown payload={payload} />}
            {type === 'competitor' && <CompetitorDrillDown payload={payload} />}
            {type === 'readiness' && <ReadinessDrillDown payload={payload} />}
            {type === 'risk' && <RiskDrillDown payload={payload} />}
            {type === 'compliance' && <ComplianceDrillDown payload={payload} />}
            {type === 'partnership' && <PartnershipDrillDown payload={payload} />}
            {type === 'action' && <ActionDrillDown payload={payload} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Persistent Cockpit Chat ───────────────────────────────────────────────────
function CockpitChat({ data, activeModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm your KPMG Co-Pilot for the ${data?.clientName || 'client'} engagement. Ask me anything about the intelligence on screen.`,
  }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setThinking(true);

    try {
      const cockpitSummary = data ? `
Cockpit data for ${data.clientName}:
- Profile: ${data.profile} (${PROFILE_CONFIG[data.profile]?.label || ''})
- Readiness score: ${data.readiness?.score}/100 — ${data.readiness?.rationale}
- Market headline: ${data.marketContext?.headline}
- Key risks: ${data.risks?.map(r => `${r.risk} (${r.severity})`).join('; ')}
- Immediate actions: ${data.immediateActions?.map(a => a.action).join('; ')}
${data.marketIntelligence ? `- India DC market: ${data.marketIntelligence.marketSize2024} (2024) → ${data.marketIntelligence.marketSize2030} (2030), CAGR ${data.marketIntelligence.cagr}` : ''}
${activeModal ? `\nUser is currently viewing: ${activeModal.type} drill-down — ${JSON.stringify(activeModal.payload).slice(0, 300)}` : ''}` : '';

      const systemPrompt = `You are a KPMG datacenter advisory co-pilot embedded in the K-Nexus platform.
You are assisting a KPMG advisor viewing a client intelligence cockpit${data ? ` for ${data.clientName}` : ''}.
Answer concisely, referencing specific numbers and data points from the cockpit.
Keep responses under 3 sentences unless detail is explicitly requested.
Be direct and quantitative — avoid generic advice.

${cockpitSummary}`;

      const reply = await callClaude({ prompt: userMsg, systemOverride: systemPrompt, maxTokens: 400 });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit an error. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-6 z-[60] w-80 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col"
            style={{ height: '440px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0" style={{ background: KPMG_BLUE }}>
              <img src="/kpmg-logo.png" alt="KPMG" className="h-4 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="text-white font-bold text-[12px]">Co-Pilot</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <button onClick={() => setIsOpen(false)} className="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X size={11} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-[#1A1F36] rounded-br-sm'
                      : 'bg-[#F4F6F9] text-[#374151] rounded-bl-sm'
                  }`}
                  style={msg.role === 'user' ? { background: '#EBF5FF' } : {}}>
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="px-3 py-2.5 bg-[#F4F6F9] rounded-xl rounded-bl-sm flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: KPMG_BLUE }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-[#E2E8F0] p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about this cockpit…"
                className="flex-1 text-[11px] bg-[#F4F6F9] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#00338D] text-[#374151] placeholder:text-[#9CA3AF]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:brightness-90"
                style={{ background: KPMG_BLUE }}
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button — KPMG logo */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden"
        style={{ background: KPMG_BLUE }}
        title="KPMG Co-Pilot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={18} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="k" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <img src="/kpmg-logo.png" alt="K" className="h-6 w-auto object-contain brightness-0 invert"
                onError={(e) => { e.target.outerHTML = '<span class="text-white font-black text-base">K</span>'; }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

// ── Loading State ─────────────────────────────────────────────────────────────
function LoadingState({ clientName }) {
  const steps = [
    'Researching client background…',
    'Pulling India DC market data…',
    'Mapping competitive landscape…',
    'Generating compliance assessment…',
    'Building partnership opportunities…',
    'Finalising cockpit intelligence…',
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
        <p className="text-sm text-[#6B7280]">{clientName || 'Analysing client brief'}…</p>
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
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: KPMG_BLUE }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Cockpit Component ────────────────────────────────────────────────────
export default function ClientCockpit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brief = searchParams.get('brief') || '';
  const clientNameParam = searchParams.get('client') || '';
  const personaParam = searchParams.get('persona') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [persona, setPersona] = useState(personaParam || null);
  const [clarification, setClarification] = useState(null);
  const [researchContext, setResearchContext] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [modal, setModal] = useState(null); // { type, payload }

  const openModal = (type, payload) => setModal({ type, payload });
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (!brief) {
      setError('No client brief provided. Return to the landing page and use the Guide Bot.');
      setLoading(false);
      return;
    }
    generateCockpit();
  }, [brief]);

  // Fetch client logo after data loads
  useEffect(() => {
    if (!data?.clientName) return;
    fetch(`/api/logo?clientName=${encodeURIComponent(data.clientName)}`)
      .then(r => r.json())
      .then(json => { if (json.logoUrl) setLogoUrl(json.logoUrl); })
      .catch(() => {});
  }, [data?.clientName]);

  const generateCockpit = async (overridePersona = null) => {
    setLoading(true);
    setError(null);
    setData(null);
    setClarification(null);
    setResearchContext(null);
    setLogoUrl(null);
    setModal(null);

    try {
      // Step 1: fetch live research
      const ctx = await researchClient({
        clientName: clientNameParam || '',
        brief,
        sector: null,
        eventType: 'cockpit',
      });
      setResearchContext(ctx);

      // Step 2: determine persona
      let resolvedPersona = overridePersona || personaParam;
      if (!resolvedPersona) {
        try {
          const detectionPrompt = `Client brief:\n${brief}\n\nLive research about this company:\n${ctx || 'No research available.'}`;
          const raw = await callClaude({ prompt: detectionPrompt, systemOverride: PERSONA_DETECTION_SYSTEM, maxTokens: 200 });
          const detected = JSON.parse(raw.replace(/```json|```/gi, '').trim());
          if (detected.clarificationNeeded) {
            setClarification({ question: detected.clarificationQuestion, researchContext: ctx });
            setLoading(false);
            return;
          }
          resolvedPersona = detected.persona;
        } catch {
          resolvedPersona = 'builder';
        }
      }

      setPersona(resolvedPersona);

      // Step 3: build enriched system prompt
      const systemPrompt = PERSONA_SYSTEM_MAP[resolvedPersona] || COCKPIT_SYSTEM_BUILDER;
      const enrichedSystem = ctx
        ? `${systemPrompt}\n\n## LIVE RESEARCH CONTEXT (retrieved ${new Date().toISOString()})\n${ctx}\n\nIMPORTANT: If the research context contains very recent announcements, flag these prominently. Do not miss breaking news about this company.`
        : systemPrompt;

      // Step 4: generate cockpit JSON (no maxTokens override — let default 16000 apply)
      const raw = await callClaude({
        prompt: `Generate the client cockpit dashboard JSON for this client brief:\n\n${brief}\n\nClient name hint: ${clientNameParam || 'extract from brief'}`,
        systemOverride: enrichedSystem,
      });

      const _cleaned = raw.replace(/```json|```/gi, '').trim();
      const _jsonStart = _cleaned.indexOf('{');
      const _jsonEnd = _cleaned.lastIndexOf('}');
      const parsed = JSON.parse(_cleaned.slice(_jsonStart, _jsonEnd + 1));
      setData(parsed);

      writeToWiki('cockpit', brief, {
        client: parsed.clientName,
        profile: parsed.profile,
        infraRec: parsed.infraRec?.recommended || parsed.opsRec?.primaryFocus,
        readinessScore: parsed.readiness?.score,
      });
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
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <img src="/kpmg-logo.png" alt="KPMG" className="h-5 object-contain brightness-0 invert opacity-80"
                onError={e => { e.target.style.display = 'none'; }} />
              <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {data?.clientName || clientNameParam || 'Client'} — Intelligence Cockpit
              </span>
              {pc && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  {pc.label}
                </span>
              )}
            </div>
            <p className="text-white/50 text-[10px]">K-Nexus AI · Quantitative Market Intelligence · Strictly Confidential</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <button onClick={() => generateCockpit(persona)}
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
        <div className="flex-shrink-0 px-6 py-2 border-b border-[#E2E8F0] bg-[#F8FAFD] flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-[#6B7280]">Live AI Intelligence</span>
          </div>
          <span className="text-[#E2E8F0]">·</span>
          <span className="text-[10px] text-[#9CA3AF]">
            Powered by K-Nexus · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {data.marketIntelligence?.cagr && (
            <>
              <span className="text-[#E2E8F0]">·</span>
              <span className="text-[10px] font-semibold text-[#059669]">India DC CAGR {data.marketIntelligence.cagr}</span>
            </>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFD]">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <LoadingState clientName={clientNameParam} />
          </div>
        )}

        {/* Persona clarification */}
        {clarification && !loading && !data && (
          <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${KPMG_BLUE}12` }}>
              <Target size={28} style={{ color: KPMG_BLUE }} />
            </div>
            <div className="text-center max-w-md">
              <p className="text-lg font-extrabold text-[#1A1F36] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                One quick question
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {clarification.question || 'What is the primary goal for this engagement?'}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {[
                { key: 'builder',  label: 'Build New DC',        Icon: Building2 },
                { key: 'expander', label: 'Expand Existing',     Icon: TrendingUp },
                { key: 'operator', label: 'Improve Operations',  Icon: Wrench },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => generateCockpit(key)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all hover:shadow-md"
                  style={{ borderColor: KPMG_BLUE, color: KPMG_BLUE, background: 'white' }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && !loading && !clarification && (
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
            {/* Row 0a: DC Market Growth Chart */}
            <DCGrowthChart data={data} onDrillDown={openModal} />
            {/* Row 0b: 3 unique KPI cards */}
            <KPIBannerRow data={data} onDrillDown={openModal} />

            {/* Row 1: Client Intel — Snapshot + Readiness + Market Context */}
            <ClientIntelRow data={data} onDrillDown={openModal} logoUrl={logoUrl} setLogoUrl={setLogoUrl} />

            {/* Row 2: Competitive Landscape */}
            <CompetitiveLandscapeSection data={data} onDrillDown={openModal} />

            {/* Row 3: Infra/Ops Rec + Persona Panels */}
            <InfraAndProfile data={data} />

            {/* Row 4: Risk Matrix + Compliance + Partnerships */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <RiskMatrixCard data={data} onDrillDown={openModal} />
              <ComplianceTracker data={data} onDrillDown={openModal} />
              <PartnershipCard data={data} onDrillDown={openModal} />
            </div>

            {/* Row 5: Immediate Actions — full width */}
            <ImmediateActionsCard data={data} onDrillDown={openModal} />
          </div>
        )}
      </div>

      {/* ── Overlays (outside scroll, always on top) ── */}
      <DrillDownModal modal={modal} onClose={closeModal} />
      {data && <CockpitChat data={data} activeModal={modal} />}
    </div>
  );
}
