'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Download, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Target, BarChart3, FileText, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import useAppStore from '@/store/appStore';
import { callClaude } from '@/lib/claude-api';

const STAGE_NAMES = {
  '01': 'Strategy Assessment',
  '02': 'Supply Chain Sourcing',
  '03': 'Design & Build',
  '04': 'Compliance',
  '05': 'DC Operations',
  '06': 'Monetization',
};

// ── Mini bar chart ─────────────────────────────────────────────────────────
function BarChart({ data, color = '#0077C8' }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#6B7280] font-mono">{d.value}{d.suffix || ''}</span>
          <motion.div
            className="w-full rounded-t-sm"
            style={{ backgroundColor: color, opacity: 0.85 }}
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 72}px` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
          <span className="text-[9px] text-[#9CA3AF] text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Radial score ───────────────────────────────────────────────────────────
function ScoreRing({ score, label, color = '#0077C8' }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="#E2E8F0" strokeWidth={8} />
        <motion.circle
          cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x={45} y={49} textAnchor="middle" fontSize={18} fontWeight={700} fill={color} fontFamily="JetBrains Mono, monospace">{score}</text>
      </svg>
      <span className="text-xs text-[#6B7280] font-medium text-center">{label}</span>
    </div>
  );
}

// ── Gap item ───────────────────────────────────────────────────────────────
function GapItem({ text, severity }) {
  const cfg = {
    high:   { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',   label: 'High' },
    medium: { icon: AlertTriangle,  color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-100', label: 'Medium' },
    low:    { icon: CheckCircle2,   color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-100', label: 'Low' },
  }[severity] || { icon: AlertTriangle, color: 'text-[#6B7280]', bg: 'bg-[#F4F6F9]', border: 'border-[#E2E8F0]', label: 'Info' };
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <Icon size={16} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1F36] leading-relaxed">{text}</p>
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.color} ${cfg.bg} flex-shrink-0`}>{cfg.label}</span>
    </div>
  );
}

// ── Interactive Timeline ───────────────────────────────────────────────────
function InteractiveTimeline({ steps }) {
  const [hoveredStep, setHoveredStep] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const timeframes = ['Week 1–2', 'Month 1', 'Month 2–3', 'Month 3–6', 'Month 6+'];
  const colors = ['#00338D', '#0055A4', '#0077C8', '#00A36C', '#D4A017'];

  return (
    <div className="w-full">
      {/* Timeline track */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-[#E2E8F0]" />
        <motion.div
          className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-[#00338D] to-[#0077C8]"
          initial={{ width: 0 }}
          animate={{ width: `${((activeStep !== null ? activeStep + 1 : hoveredStep !== null ? hoveredStep + 1 : 0) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />

        {/* Step nodes */}
        <div className="flex justify-between relative">
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            const isHovered = hoveredStep === i;
            const isPast = activeStep !== null && i < activeStep;
            const color = colors[i % colors.length];

            return (
              <div
                key={i}
                className="flex flex-col items-center cursor-pointer group"
                style={{ width: `${100 / steps.length}%` }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
              >
                {/* Node */}
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all relative z-10"
                  style={{
                    backgroundColor: isActive || isHovered ? color : isPast ? color + '30' : 'white',
                    borderColor: isActive || isPast ? color : isHovered ? color : '#E2E8F0',
                    boxShadow: isActive || isHovered ? `0 0 0 6px ${color}18` : 'none',
                  }}
                  animate={{ scale: isActive ? 1.15 : isHovered ? 1.08 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="font-bold text-lg"
                    style={{ color: isActive || isHovered ? 'white' : isPast ? color : '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {i + 1}
                  </span>
                </motion.div>

                {/* Timeframe label */}
                <div className="mt-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isActive || isHovered ? color : '#9CA3AF' }}>
                    {timeframes[i] || `Step ${i + 1}`}
                  </p>
                </div>

                {/* Tooltip on hover */}
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-20 z-20 bg-[#1A1F36] text-white rounded-xl p-3 shadow-2xl text-center"
                    style={{ width: 180, left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: color === '#00338D' ? '#60A5FA' : color }}>
                      {timeframes[i] || `Step ${i + 1}`}
                    </div>
                    <p className="text-xs leading-relaxed text-white/85">{step}</p>
                    {/* Arrow */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1A1F36] rotate-45 rounded-sm" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active step detail card */}
      <div className="mt-24">
        {activeStep !== null ? (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#00338D]/5 to-[#0077C8]/5 rounded-xl border border-[#00338D]/15 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: colors[activeStep % colors.length] }}>
                {activeStep + 1}
              </div>
              <div>
                <p className="font-bold text-[#00338D] text-sm">{timeframes[activeStep] || `Step ${activeStep + 1}`}</p>
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Next Step</p>
              </div>
            </div>
            <p className="text-sm text-[#374151] leading-relaxed">{steps[activeStep]}</p>
          </motion.div>
        ) : (
          <p className="text-center text-xs text-[#9CA3AF]">Click any step to expand details</p>
        )}
      </div>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = '#00338D', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] hover:bg-[#F4F6F9] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
            <Icon size={16} style={{ color }} />
          </div>
          <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ── PDF export ─────────────────────────────────────────────────────────────
function exportPDF(stageNum, stageName, analysis) {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>KPMG K-Nexus — ${stageName} Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #1A1F36; background: white; }
  .cover { background: linear-gradient(135deg, #00338D 0%, #0077C8 100%); color: white; padding: 60px 48px; min-height: 280px; position: relative; }
  .cover-logo { font-size: 32px; font-weight: 900; letter-spacing: 4px; margin-bottom: 8px; }
  .cover-sub { font-size: 11px; letter-spacing: 3px; opacity: 0.6; text-transform: uppercase; margin-bottom: 48px; }
  .cover-title { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
  .cover-desc { font-size: 14px; opacity: 0.75; }
  .cover-meta { position: absolute; bottom: 32px; left: 48px; right: 48px; display: flex; justify-content: space-between; font-size: 11px; opacity: 0.55; }
  .cover-stripe { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.3); }
  .content { padding: 40px 48px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #00338D; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #E2E8F0; }
  .section-body { font-size: 13px; line-height: 1.8; color: #374151; white-space: pre-wrap; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #E8F0FB; color: #00338D; margin-bottom: 12px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; }
  .disclaimer { font-size: 9px; color: #9CA3AF; margin-top: 32px; line-height: 1.6; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-logo">KPMG</div>
  <div class="cover-sub">K-Nexus Datacenter Intelligence</div>
  <div class="cover-title">Stage ${stageNum}: ${stageName}<br/>Analysis Report</div>
  <div class="cover-desc">AI-generated intelligence briefing · Strictly Confidential</div>
  <div class="cover-meta">
    <span>Generated: ${date}</span>
    <span>© KPMG 2025 · Confidential</span>
  </div>
  <div class="cover-stripe"></div>
</div>
<div class="content">
  <div class="badge">STAGE ${stageNum} · ${stageName.toUpperCase()}</div>
  ${analysis.split('\n\n').map(para => {
    if (!para.trim()) return '';
    const isHeader = para.length < 60 && !para.includes('.') && para === para.trimEnd();
    return isHeader
      ? `<div class="section"><div class="section-title">${para}</div></div>`
      : `<div class="section"><div class="section-body">${para}</div></div>`;
  }).join('')}
  <div class="footer">
    <span>KPMG K-Nexus Intelligence Platform</span>
    <span>Stage ${stageNum}: ${stageName}</span>
    <span>${date}</span>
  </div>
  <div class="disclaimer">
    This report has been generated by the KPMG K-Nexus AI Intelligence Engine for internal advisory purposes only.
    The analysis is based on available market data and AI-generated insights. This document is strictly confidential
    and intended solely for the recipient. © KPMG 2025. All rights reserved.
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KPMG_KNexus_Stage${stageNum}_${stageName.replace(/\s+/g, '_')}_Report.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Parse AI output into structured sections ───────────────────────────────
function parseAnalysisIntoSections(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = {
    summary: [],
    findings: [],
    gaps: [],
    recommendations: [],
    nextSteps: [],
    kpis: [],
    raw: rawText,
  };

  let current = 'summary';
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('executive summary') || lower.includes('overview')) { current = 'summary'; continue; }
    if (lower.includes('key finding') || lower.includes('market analysis') || lower.includes('findings')) { current = 'findings'; continue; }
    if (lower.includes('gap') || lower.includes('risk') || lower.includes('challenge')) { current = 'gaps'; continue; }
    if (lower.includes('recommendation') || lower.includes('action')) { current = 'recommendations'; continue; }
    if (lower.includes('next step') || lower.includes('roadmap') || lower.includes('implementation')) { current = 'nextSteps'; continue; }
    if (lower.includes('kpi') || lower.includes('metric') || lower.includes('benchmark')) { current = 'kpis'; continue; }

    const cleaned = line.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').replace(/#{1,3}\s*/g, '').trim();
    if (cleaned && sections[current] !== undefined) sections[current].push(cleaned);
  }

  return sections;
}

// ── KPI cards derived from text ────────────────────────────────────────────
function deriveKPIs(stageName, formData) {
  const kpis = [];
  if (formData.capacity) kpis.push({ label: 'Target Capacity', value: `${formData.capacity} MW`, color: '#0077C8' });
  if (formData.budget) kpis.push({ label: 'Investment Budget', value: formData.budget, color: '#D4A017' });
  if (formData.targetPUE) kpis.push({ label: 'Target PUE', value: formData.targetPUE.toFixed ? formData.targetPUE.toFixed(2) : formData.targetPUE, color: '#00A36C' });
  if (formData.timeline) kpis.push({ label: 'Timeline', value: formData.timeline, color: '#00338D' });
  if (formData.sla) kpis.push({ label: 'SLA Target', value: formData.sla?.split(' ')[0], color: '#0055A4' });
  if (formData.ebitdaTarget) kpis.push({ label: 'EBITDA Target', value: formData.ebitdaTarget, color: '#00A36C' });
  return kpis.slice(0, 4);
}

// ── Inline bold renderer ───────────────────────────────────────────────────
function renderInlineAnalysis(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1A1F36]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ── Full analysis markdown renderer (richer heading hierarchy) ─────────────
function FullAnalysisRenderer({ text }) {
  if (!text) return <p className="text-[#9CA3AF] text-sm italic">No analysis available.</p>;
  const lines = text.split('\n');
  const elements = [];
  let bulletBuffer = [];

  const flushBullets = (key) => {
    if (!bulletBuffer.length) return;
    elements.push(
      <ul key={`ul-${key}`} className="space-y-2 mb-4 ml-2">
        {bulletBuffer.map((b, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            <span className="text-[#0077C8] flex-shrink-0 mt-1.5 text-xs">•</span>
            <span className="text-sm text-[#374151] leading-relaxed">{renderInlineAnalysis(b)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { flushBullets(i); return; }

    if (t.startsWith('# ')) {
      flushBullets(i);
      elements.push(
        <h2 key={i} className="text-xl font-extrabold text-[#00338D] mt-6 mb-3 pb-2 border-b-2 border-[#00338D]/20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.slice(2)}
        </h2>
      );
    } else if (t.startsWith('## ')) {
      flushBullets(i);
      elements.push(
        <h3 key={i} className="text-base font-bold text-[#00338D] mt-5 mb-2 pb-1.5 border-b border-[#E2E8F0]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.slice(3)}
        </h3>
      );
    } else if (t.startsWith('### ')) {
      flushBullets(i);
      elements.push(
        <h4 key={i} className="text-sm font-bold text-[#1A1F36] mt-4 mb-2 uppercase tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.slice(4)}
        </h4>
      );
    } else if (t.startsWith('---')) {
      flushBullets(i);
      elements.push(<hr key={i} className="border-[#E2E8F0] my-4" />);
    } else if (/^[-*•]\s+/.test(t)) {
      bulletBuffer.push(t.replace(/^[-*•]\s+/, ''));
    } else if (/^\d+\.\s+/.test(t)) {
      flushBullets(i);
      const num = t.match(/^(\d+)\./)[1];
      const content = t.replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={i} className="flex gap-3 items-start mb-2">
          <span className="w-6 h-6 rounded-full bg-[#00338D] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</span>
          <span className="text-sm text-[#374151] leading-relaxed">{renderInlineAnalysis(content)}</span>
        </div>
      );
    } else {
      flushBullets(i);
      elements.push(
        <p key={i} className="text-sm text-[#374151] leading-relaxed mb-2">
          {renderInlineAnalysis(t)}
        </p>
      );
    }
  });
  flushBullets('end');
  return <div className="space-y-0.5 max-w-none">{elements}</div>;
}

export default function AnalysisDashboard() {
  const { stageOutputs, completedStages } = useAppStore();
  const [selectedStage, setSelectedStage] = useState(null);
  const [sections, setSections] = useState(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState(null);
  const printRef = useRef(null);

  // Pick the first completed stage by default
  useEffect(() => {
    if (completedStages.length > 0 && !selectedStage) {
      setSelectedStage(completedStages[0]);
    }
  }, [completedStages]);

  useEffect(() => {
    if (!selectedStage) return;
    const raw = stageOutputs[selectedStage];
    if (raw) setSections(parseAnalysisIntoSections(raw));
  }, [selectedStage, stageOutputs]);

  // Generate structured deep-dive from the raw output
  useEffect(() => {
    if (!selectedStage || !stageOutputs[selectedStage]) return;
    setDeepDiveLoading(true);
    setDeepDiveData(null);

    const prompt = `Based on this datacenter analysis, extract structured data in JSON format.
    
Analysis text:
${stageOutputs[selectedStage]}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "readinessScore": <0-100 number>,
  "riskScore": <0-100 number>,
  "opportunityScore": <0-100 number>,
  "gaps": [
    {"text": "gap description", "severity": "high|medium|low"},
    ...max 5 gaps
  ],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4", "rec 5"],
  "nextSteps": ["step 1", "step 2", "step 3"],
  "keyInsight": "one sentence key takeaway"
}`;

    callClaude({ prompt, maxTokens: 8192 })
      .then(text => {
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          setDeepDiveData(JSON.parse(clean));
        } catch { setDeepDiveData(null); }
      })
      .catch(() => setDeepDiveData(null))
      .finally(() => setDeepDiveLoading(false));
  }, [selectedStage]);

  if (completedStages.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] pt-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#00338D]/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={28} className="text-[#00338D]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1F36] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No Analysis Available</h2>
          <p className="text-[#6B7280] text-sm mb-6">Generate insights in at least one lifecycle stage first.</p>
          <Link href="/stage/01" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00338D] text-white rounded-xl text-sm font-bold hover:bg-[#0044b8] transition-colors">
            Start Stage 01
          </Link>
        </div>
      </div>
    );
  }

  const stageName = STAGE_NAMES[selectedStage] || `Stage ${selectedStage}`;
  const rawOutput = stageOutputs[selectedStage] || '';

  return (
    <div className="min-h-screen bg-[#F4F6F9] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href={`/stage/${selectedStage}`} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1F36] transition-colors">
              <ArrowLeft size={16} />Back to Stage
            </Link>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#00338D]/10 text-[#00338D]">DEEP DIVE ANALYSIS</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stageName} — Intelligence Report
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Stage selector */}
              <div className="flex gap-1.5">
                {completedStages.map(s => (
                  <button key={s} onClick={() => setSelectedStage(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedStage === s ? 'bg-[#00338D] text-white' : 'bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E2E8F0]'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {/* Download */}
              <button
                onClick={() => exportPDF(selectedStage, stageName, rawOutput)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00338D] text-white rounded-xl text-sm font-bold hover:bg-[#0044b8] transition-colors"
              >
                <Download size={15} />Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6" ref={printRef}>

        {/* Score rings row */}
        {deepDiveLoading ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#00338D]/30 border-t-[#00338D] rounded-full animate-spin" />
            <span className="text-[#6B7280] text-sm">Generating deep analysis...</span>
          </div>
        ) : deepDiveData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#00338D]" />
              <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Assessment Scores</h2>
            </div>
            <div className="flex items-center justify-around flex-wrap gap-6">
              <ScoreRing score={deepDiveData.readinessScore} label="Readiness" color="#00A36C" />
              <ScoreRing score={100 - deepDiveData.riskScore} label="Risk Profile" color="#D4A017" />
              <ScoreRing score={deepDiveData.opportunityScore} label="Opportunity" color="#0077C8" />
            </div>
            {deepDiveData.keyInsight && (
              <p className="mt-5 text-center text-sm text-[#6B7280] italic border-t border-[#E2E8F0] pt-4">
                "{deepDiveData.keyInsight}"
              </p>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gaps & Risks */}
          <SectionCard title="Gaps Analysed" icon={AlertTriangle} color="#D4A017">
            {deepDiveLoading ? (
              <p className="text-[#9CA3AF] text-sm">Analysing gaps...</p>
            ) : deepDiveData?.gaps?.length ? (
              <div className="space-y-2">
                {deepDiveData.gaps.map((g, i) => <GapItem key={i} text={g.text} severity={g.severity} />)}
              </div>
            ) : sections?.gaps?.length ? (
              <div className="space-y-2">
                {sections.gaps.slice(0, 5).map((g, i) => <GapItem key={i} text={g} severity={i === 0 ? 'high' : i < 3 ? 'medium' : 'low'} />)}
              </div>
            ) : <p className="text-[#9CA3AF] text-sm italic">No gaps identified.</p>}
          </SectionCard>

          {/* Recommendations */}
          <SectionCard title="Actions & Recommendations" icon={Target} color="#00338D">
            {deepDiveLoading ? (
              <p className="text-[#9CA3AF] text-sm">Building recommendations...</p>
            ) : (
              <div className="space-y-2.5">
                {(deepDiveData?.recommendations || sections?.recommendations || []).slice(0, 5).map((r, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-[#F4F6F9] rounded-xl border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-full bg-[#00338D] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</div>
                    <p className="text-sm text-[#1A1F36] leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Key Findings */}
        <SectionCard title="Key Findings" icon={TrendingUp} color="#0077C8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(sections?.findings || sections?.summary || []).slice(0, 6).map((f, i) => (
              <div key={i} className="flex gap-2.5 items-start p-3 bg-[#F4F6F9] rounded-xl border border-[#E2E8F0]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0077C8] flex-shrink-0 mt-2" />
                <p className="text-sm text-[#374151] leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Next Steps — Interactive Timeline */}
        {(deepDiveData?.nextSteps || sections?.nextSteps || []).length > 0 && (
          <SectionCard title="Outcomes & Next Steps" icon={CheckCircle2} color="#00A36C">
            <InteractiveTimeline steps={deepDiveData?.nextSteps || sections?.nextSteps || []} />
          </SectionCard>
        )}

        {/* Full Analysis */}
        <SectionCard title="Full Analysis" icon={FileText} color="#6B7280" defaultOpen={false}>
          <FullAnalysisRenderer text={rawOutput} />
        </SectionCard>

        <div className="text-center pb-4">
          <p className="text-[#CBD5E1] text-xs">© KPMG 2025 · K-Nexus Intelligence Platform · Strictly Confidential</p>
        </div>
      </div>
    </div>
  );
}