'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, X, Upload, FileText, Sparkles, LayoutDashboard, MessageCircle, Send, ChevronRight, ExternalLink, Clock, Newspaper, Download, FileSearch, Zap } from 'lucide-react';
import LifecycleWheel from '@/components/lifecycle-wheel/LifecycleWheel';
import { LoadingDots } from '@/components/shared/LoadingDots';
import { callClaude } from '@/lib/claude-api';
import { writeToWiki } from '@/lib/wiki';
import useAppStore from '@/store/appStore';

const STAGE_DIRECTORY = [
  { num: '01', path: '/stage/01', label: 'Strategy', keywords: ['strategy', 'market', 'region', 'country', 'entry', 'invest', 'business case', 'feasibility', 'where', 'opportunity', 'demand'] },
  { num: '02', path: '/stage/02', label: 'Supply Chain Management', keywords: ['supply', 'procurement', 'vendor', 'equipment', 'hardware', 'component', 'sourcing', 'buy', 'cost', 'budget', 'capex'] },
  { num: '03', path: '/stage/03', label: 'Design & Build', keywords: ['design', 'build', 'construct', 'architecture', 'cooling', 'power', 'tier', 'pue', 'rack', 'mep', 'engineer'] },
  { num: '04', path: '/stage/04', label: 'Compliance', keywords: ['compliance', 'regulation', 'legal', 'gdpr', 'dpdp', 'license', 'permit', 'esg', 'audit', 'certification', 'iso', 'tax'] },
  { num: '05', path: '/stage/05', label: 'Operations', keywords: ['operate', 'operations', 'run', 'staff', 'dcim', 'monitoring', 'uptime', 'sla', 'incident', 'maintenance', 'efficiency'] },
  { num: '06', path: '/stage/06', label: 'Monetization', keywords: ['monetize', 'revenue', 'colocation', 'pricing', 'customer', 'tenant', 'ebitda', 'profit', 'sell', 'lease'] },
];

// ── Guide Bot System Prompt ─────────────────────────────────────────────────
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
- Be warm, concise, and direct. 1 sentence intro max, then bullet points using "- " prefix.
- Use bullet points for any list of stages or recommendations. Never write long paragraphs.
- Never use ** or any markdown bold. Plain text only.
- Always end with a raw JSON block (no markdown fences, no backticks) in this exact format:
  {"stage": "01", "label": "Strategy", "reason": "one short sentence", "isComplex": false}
- Set "isComplex": true if the query involves multiple stages, unclear preferences, new market entry, partnership questions, or a named company/client with specific requirements.
- The JSON must be the very last thing in your response. No text after it.
- If the user is clearly asking about multiple stages, pick the best starting point.
- If the message is a greeting or too vague, ask one clarifying question and do NOT include the JSON block yet.
- Never make up features — only reference the 6 stages above.`;

// ── Assessment System Prompt ────────────────────────────────────────────────
const QUICK_REPORT_SYSTEM = `You are a senior KPMG Datacenter Advisory Partner generating a concise client assessment report.

Generate a structured 2-3 page assessment with these EXACT sections (use # for section headers):

# Executive Summary
2-3 sentences capturing the client situation, ambition, and key recommendation.

# Client Overview
Key facts about the client pulled from research — sector background, financial standing, relevant experience, leadership context.

# Strategic Options
Present exactly 3 options as Option A, Option B, Option C. For each:
- Option name and one-line description
- Pros (2-3 bullets)
- Cons (2-3 bullets)
- Best suited if: [one condition]

# Recommended Lifecycle Stages
Which of the 6 stages (Strategy/Supply Chain/Design & Build/Compliance/Operations/Monetization) apply and why — brief per stage.

# Key Risks & Watch-outs
4-5 specific risks with brief mitigation note each.

# Immediate Next Steps for KPMG
3-4 concrete actions KPMG should take in the next 30 days.

RULES:
- Plain text only. No markdown bold (**). No ### sub-headers. Use - for bullets.
- Be specific and quantitative where possible.
- Tone: confident, senior advisory, not generic.
- Keep it tight — this is a high-impact 2-3 pager.`;

const DETAILED_REPORT_SYSTEM = `You are a senior KPMG Datacenter Advisory Partner generating a comprehensive end-to-end lifecycle assessment report.

Generate a thorough report with these EXACT sections (use # for section headers):

# Executive Summary
4-5 sentences covering client situation, strategic opportunity, KPMG's recommended approach, and expected outcomes.

# Client Deep-Dive
Detailed profile: sector, business model, financial context, leadership, existing infrastructure experience, competitive positioning, and why datacenter is a logical next move.

# Market Context
Current datacenter market dynamics relevant to this client — demand drivers, supply gaps, investment trends, India-specific context if relevant.

# Strategic Options Analysis
Present exactly 3 strategic paths:
Option A: [Name] — Full description, financial implications, timeline, pros, cons, best suited for
Option B: [Name] — Full description, financial implications, timeline, pros, cons, best suited for
Option C: [Name] — Full description, financial implications, timeline, pros, cons, best suited for

# Stage-by-Stage Lifecycle Roadmap
For each of the 6 stages, explain specifically what it means for THIS client:
Stage 01 - Strategy: [client-specific actions]
Stage 02 - Supply Chain: [client-specific actions]
Stage 03 - Design & Build: [client-specific actions]
Stage 04 - Compliance: [client-specific actions]
Stage 05 - Operations: [client-specific actions]
Stage 06 - Monetization: [client-specific actions]

# Partnership & Structuring Options
Specific partnership models, JV structures, financing options relevant to their situation.

# Regulatory & Compliance Snapshot
Key regulatory considerations, data sovereignty requirements, ESG implications.

# Financial Framework
Indicative CapEx ranges, OpEx benchmarks, revenue potential, EBITDA targets for the stated capacity.

# Risk Matrix
8-10 risks categorized as High/Medium/Low with mitigation strategies.

# KPMG Engagement Roadmap
Phased engagement plan — what KPMG delivers in Phase 1 (0-3 months), Phase 2 (3-6 months), Phase 3 (6-12 months).

# KPIs & Success Metrics
Specific metrics to track progress across each lifecycle stage.

RULES:
- Plain text only. No markdown bold (**). Use - for bullets.
- Be highly specific — reference client name, capacity (MW), sector, and geography throughout.
- Quantitative benchmarks wherever possible.
- Tone: authoritative, senior KPMG advisory partner.`;

// ── PDF Export (matching AnalysisDashboard style exactly) ──────────────────
async function exportAssessmentPDF(clientName, reportType, reportContent) {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const PAGE_W   = 794;
  const PAGE_H   = 1123;
  const PAD      = 48;
  const USABLE_H = PAGE_H - PAD * 2 - 48;
  const scale    = window.devicePixelRatio * 2;
  const date     = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const reportLabel = reportType === 'quick' ? 'Quick Assessment' : 'Detailed Lifecycle Assessment';

  const CONTENT_CSS = `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,Helvetica,sans-serif;}
    .section{break-inside:avoid;margin-bottom:22px;}
    .h1{font-size:16px;font-weight:800;color:#00338D;margin-bottom:6px;padding-bottom:6px;border-bottom:2px solid #E2E8F0;}
    .h2{font-size:14px;font-weight:700;color:#00338D;margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid #E2E8F0;}
    .h3{font-size:13px;font-weight:700;color:#1A1F36;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;}
    .para{font-size:12px;line-height:1.8;color:#374151;}
    .para strong{font-weight:700;color:#1A1F36;}
    .para em{font-style:italic;}
    .bullet-list{margin:0;padding-left:0;list-style:none;}
    .bullet-list li{font-size:12px;line-height:1.75;color:#374151;padding-left:16px;position:relative;margin-bottom:3px;}
    .bullet-list li::before{content:"•";position:absolute;left:2px;color:#0077C8;font-size:11px;}
    .num-list{margin:0;padding-left:0;list-style:none;counter-reset:num;}
    .num-list li{font-size:12px;line-height:1.75;color:#374151;padding-left:20px;position:relative;margin-bottom:3px;counter-increment:num;}
    .num-list li::before{content:counter(num)".";position:absolute;left:0;color:#00338D;font-weight:700;font-size:11px;}
    .badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:#E8F0FB;color:#00338D;display:inline-block;margin-bottom:16px;}
    .footer-row{padding-top:12px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:10px;color:#9CA3AF;}
    .disclaimer{font-size:9px;color:#9CA3AF;margin-top:12px;line-height:1.6;}
    .page-num{position:absolute;bottom:24px;right:${PAD}px;font-size:10px;color:#CBD5E1;}
  `;

  function inlineFormat(text) {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="font-family:monospace;background:#F4F6F9;padding:0 3px;border-radius:3px;font-size:11px;">$1</code>');
  }

  function markdownToSections(md) {
    const lines = md.split('\n');
    const sections = [];
    let buffer = [];
    let bufType = null;

    const flushBuffer = () => {
      if (!buffer.length) return;
      if (bufType === 'bullet') {
        sections.push(`<div class="section"><ul class="bullet-list">${buffer.map(b => `<li>${inlineFormat(b)}</li>`).join('')}</ul></div>`);
      } else if (bufType === 'num') {
        sections.push(`<div class="section"><ol class="num-list">${buffer.map(b => `<li>${inlineFormat(b)}</li>`).join('')}</ol></div>`);
      }
      buffer = []; bufType = null;
    };

    for (const raw of lines) {
      const t = raw.trim();
      if (/^---+$/.test(t) || /^\*\*\*+$/.test(t)) continue;
      if (!t) { flushBuffer(); continue; }

      if (t.startsWith('### ')) {
        flushBuffer();
        sections.push(`<div class="section"><div class="h3">${inlineFormat(t.slice(4))}</div></div>`);
      } else if (t.startsWith('## ')) {
        flushBuffer();
        sections.push(`<div class="section"><div class="h2">${inlineFormat(t.slice(3))}</div></div>`);
      } else if (t.startsWith('# ')) {
        flushBuffer();
        sections.push(`<div class="section"><div class="h1">${inlineFormat(t.slice(2))}</div></div>`);
      } else if (/^[-*•]\s+/.test(t)) {
        if (bufType !== 'bullet') flushBuffer();
        bufType = 'bullet';
        buffer.push(t.replace(/^[-*•]\s+/, ''));
      } else if (/^\d+\.\s+/.test(t)) {
        if (bufType !== 'num') flushBuffer();
        bufType = 'num';
        buffer.push(t.replace(/^\d+\.\s+/, ''));
      } else {
        flushBuffer();
        sections.push(`<div class="section"><p class="para">${inlineFormat(t)}</p></div>`);
      }
    }
    flushBuffer();
    return sections;
  }

  const badgeHtml = `<div class="section"><div class="badge">K-NEXUS · CLIENT ASSESSMENT · ${reportLabel.toUpperCase()}</div></div>`;
  const bodyHtmls = markdownToSections(reportContent);
  const footerHtml = `
    <div class="section footer-row">
      <span>K-Nexus Intelligence Platform</span>
      <span>${clientName} — ${reportLabel}</span>
      <span>${date}</span>
    </div>
    <div class="section disclaimer">
      This report has been generated by the K-Nexus AI Intelligence Engine for internal KPMG advisory purposes only.
      The analysis is based on AI-generated insights enriched with live market research. This document is strictly
      confidential and intended solely for the recipient. All rights reserved. © KPMG 2026.
    </div>`;

  const allSections = [badgeHtml, ...bodyHtmls, footerHtml];

  const waitFrame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const measureEl = document.createElement('div');
  measureEl.style.cssText = `position:fixed;left:-9999px;top:0;width:${PAGE_W}px;background:white;z-index:-1;padding:${PAD}px;`;
  measureEl.innerHTML = `<style>${CONTENT_CSS}</style>${allSections.join('')}`;
  document.body.appendChild(measureEl);
  await waitFrame();

  const sectionEls = measureEl.querySelectorAll('.section');
  const heights = Array.from(sectionEls).map(el => el.getBoundingClientRect().height + 28);
  document.body.removeChild(measureEl);

  const pages = [];
  let currentPage = { htmls: [], height: 0 };

  allSections.forEach((html, i) => {
    const h = heights[i] ?? 0;
    if (currentPage.height + h > USABLE_H && currentPage.htmls.length > 0) {
      pages.push(currentPage);
      currentPage = { htmls: [], height: 0 };
    }
    currentPage.htmls.push(html);
    currentPage.height += h;
  });
  if (currentPage.htmls.length > 0) pages.push(currentPage);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const capture = async (innerHTML, bg = '#ffffff') => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:-9999px;top:0;width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden;background:${bg};z-index:-1;`;
    el.innerHTML = innerHTML;
    document.body.appendChild(el);
    await waitFrame();
    const canvas = await html2canvas(el, {
      scale, useCORS: true, allowTaint: true, backgroundColor: bg,
      width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W,
    });
    document.body.removeChild(el);
    return canvas;
  };

  // Cover page
  const coverInner = `
    <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,Helvetica,sans-serif;}</style>
    <div style="background:linear-gradient(135deg,#00338D 0%,#0077C8 100%);color:white;width:${PAGE_W}px;height:${PAGE_H}px;padding:60px ${PAD}px;position:relative;">
      <div style="font-size:32px;font-weight:900;letter-spacing:4px;margin-bottom:8px;">K-Nexus.AI</div>
      <div style="font-size:11px;letter-spacing:3px;opacity:0.6;text-transform:uppercase;margin-bottom:48px;">Datacenter Lifecycle Intelligence</div>
      <div style="font-size:13px;font-weight:600;opacity:0.7;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Client Assessment Report</div>
      <div style="font-size:36px;font-weight:800;line-height:1.2;margin-bottom:16px;">${clientName}</div>
      <div style="font-size:16px;opacity:0.75;margin-bottom:8px;">${reportLabel}</div>
      <div style="font-size:13px;opacity:0.5;">AI-generated intelligence briefing · Strictly Confidential · Internal Use Only</div>
      <div style="position:absolute;bottom:60px;left:${PAD}px;right:${PAD}px;display:flex;justify-content:space-between;font-size:11px;opacity:0.55;">
        <span>Generated: ${date}</span><span>KPMG Advisory · Confidential</span>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:rgba(255,255,255,0.3);"></div>
    </div>`;

  const coverCanvas = await capture(coverInner, '#00338D');
  pdf.addImage(coverCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH);

  for (let i = 0; i < pages.length; i++) {
    pdf.addPage();
    const pageInner = `
      <style>${CONTENT_CSS}</style>
      <div style="position:relative;width:${PAGE_W}px;height:${PAGE_H}px;background:white;padding:${PAD}px;padding-bottom:80px;overflow:hidden;">
        ${pages[i].htmls.join('')}
        <div class="page-num">${i + 2}</div>
      </div>`;
    const canvas = await capture(pageInner);
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, pdfH);
  }

  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  const typeLabel = reportType === 'quick' ? 'Quick' : 'Detailed';
  pdf.save(`KNexus_${safeName}_${typeLabel}_Assessment.pdf`);
}

// ── Animated Background ─────────────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(0,51,141,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,51,141,0.055) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(0,119,200,0.07) 0%, transparent 65%)', borderRadius: '50%' }} />
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: Math.random() * 3 + 1.5, height: Math.random() * 3 + 1.5, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: `rgba(0, ${51 + Math.random() * 70}, ${141 + Math.random() * 59}, ${0.15 + Math.random() * 0.2})` }}
          animate={{ y: [0, -30 - Math.random() * 20, 0], x: [0, (Math.random() - 0.5) * 20, 0], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setUploadedDocAnalysis, setUploadedDocName } = useAppStore();
  const fileInputRef = useRef(null);

  const readFileContent = (f) => new Promise((resolve) => {
    if (/\.(txt|md|csv)$/i.test(f.name)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(f);
    } else { resolve(null); }
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
      .then(text => { setUploadedDocAnalysis(text); setUploadedDocName(file.name); writeToWiki('doc-upload', text, { documentName: file.name }); router.push('/stage/analysis'); })
      .catch(err => { setError(err.message); setIsAnalyzing(false); });
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); const dropped = e.dataTransfer.files[0]; if (dropped) setFile(dropped); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(13,20,40,0.85)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#1A1F36] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00338D] flex items-center justify-center"><Upload size={20} className="text-white" /></div>
            <div>
              <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Analyse Your Strategy</h2>
              <p className="text-white/40 text-xs">Upload a document to get AI-powered datacenter insights</p>
            </div>
          </div>
          {!isAnalyzing && <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1"><X size={20} /></button>}
        </div>
        {!isAnalyzing ? (
          <>
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[#0077C8] bg-[#0077C8]/10' : file ? 'border-[#00A36C]/50 bg-[#00A36C]/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} />
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
            {error && <div className="mt-3 bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs">{error}</div>}
            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/20 text-white/60 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAnalyze} disabled={!file} className="flex-1 px-4 py-2.5 bg-[#0077C8] hover:bg-[#0088e0] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Sparkles size={16} />Analyse Document
              </button>
            </div>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#00338D]/20 flex items-center justify-center"><Sparkles size={28} className="text-[#0077C8]" /></div>
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

// ── Bot text renderer ────────────────────────────────────────────────────────
function renderBotText(text) {
  const clean = text.replace(/```json[\s\S]*?```/gi, '').replace(/```/g, '').trim();
  return clean.split('\n').filter(l => l.trim()).map((line, i) => {
    const t = line.trim();
    if (/^[-•*]\s+/.test(t)) {
      return (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-[#00338D] flex-shrink-0 mt-0.5">•</span>
          <span>{t.replace(/^[-•*]\s+/, '')}</span>
        </div>
      );
    }
    if (/^\d+\.\s+/.test(t)) {
      const num = t.match(/^(\d+)\./)[1];
      return (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-[#00338D] font-bold flex-shrink-0">{num}.</span>
          <span>{t.replace(/^\d+\.\s+/, '')}</span>
        </div>
      );
    }
    return <p key={i} className="leading-relaxed">{t}</p>;
  });
}

// ── Guide Bot ─────────────────────────────────────────────────────────────────
function GuideBot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const [showThought, setShowThought] = useState(true);
  const [botPhase, setBotPhase] = useState('chat'); // 'chat' | 'assessment-offer' | 'report-type' | 'generating' | 'done'
  const [clientContext, setClientContext] = useState('');
  const [clientName, setClientName] = useState('Client');
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowThought(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setShowThought(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', text: "Hi! I'm your K-Nexus guide. Tell me what you're trying to achieve — building a new datacenter, improving operations, exploring a market — and I'll point you to the right stage." }]);
      }
    }
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, botPhase]);

  const parseResponse = (text) => {
    let stageData = null;
    const jsonMatch = text.match(/\{[\s\S]*?"stage"\s*:\s*"([^"]*)"[\s\S]*?\}/);
    if (jsonMatch) { try { stageData = JSON.parse(jsonMatch[0]); } catch {} }

    const cleanText = text
      .replace(/```json[\s\S]*?```/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?"stage"\s*:\s*"[^"]*"[\s\S]*?\}/g, '')
      .replace(/`{1,3}/g, '')
      .trim();

    return { cleanText, stageData };
  };

  // Extract client name from query
  const extractClientName = (query) => {
    const patterns = [
      /(?:client|company)[,\s]+([A-Z][a-zA-Z\s]+?)(?:\s+is|\s+are|\s+wants|\s*,)/i,
      /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Group|Ltd|Limited|Inc|Corp|Pvt)/i,
      /^([A-Z][a-zA-Z\s]+?)(?:\s+is|\s+are|\s+wants|\s*,|\s+looking)/,
    ];
    for (const p of patterns) {
      const m = query.match(p);
      if (m) return m[1].trim();
    }
    return 'Client';
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setRedirect(null);

    // Extract and store client name + context
    const name = extractClientName(trimmed);
    if (name !== 'Client') setClientName(name);
    setClientContext(trimmed);

    const history = [...messages, userMsg].map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');

    try {
      const response = await callClaude({
        prompt: history,
        systemOverride: GUIDE_BOT_SYSTEM,
        maxTokens: 500,
        ragQuery: trimmed.length > 50 ? `${name} company datacenter India` : null,
      });
      const { cleanText, stageData } = parseResponse(response);
      setMessages(prev => [...prev, { role: 'assistant', text: cleanText }]);

      if (stageData?.stage) {
        const match = STAGE_DIRECTORY.find(s => s.num === stageData.stage);
        if (match) {
          setRedirect({ stage: match.num, label: match.label, path: match.path, reason: stageData.reason || '' });
          if (stageData.isComplex) {
            setBotPhase('assessment-offer');
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I hit an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleGenerateReport = async (type) => {
    setReportType(type);
    setBotPhase('generating');

    const systemPrompt = type === 'quick' ? QUICK_REPORT_SYSTEM : DETAILED_REPORT_SYSTEM;
    const reportLabel = type === 'quick' ? 'Quick Assessment (2-3 pages)' : 'Detailed Lifecycle Assessment';

    setMessages(prev => [...prev, {
      role: 'assistant',
      text: `Generating your ${reportLabel} for ${clientName}. I'm researching their background and analysing all lifecycle stages — this may take a moment...`
    }]);

    try {
      const content = await callClaude({
        prompt: `Generate a ${reportLabel} for the following client requirement:\n\n${clientContext}\n\nClient name: ${clientName}`,
        systemOverride: systemPrompt,
        maxTokens: type === 'quick' ? 4000 : 12000,
        ragQuery: `${clientName} company profile business India datacenter`,
      });

      setReportContent(content);
      setBotPhase('done');
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Your ${reportLabel} for ${clientName} is ready. Click below to download the PDF.`
      }]);
    } catch (err) {
      setBotPhase('assessment-offer');
      setMessages(prev => [...prev, { role: 'assistant', text: `Sorry, I couldn't generate the report: ${err.message}` }]);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await exportAssessmentPDF(clientName, reportType, reportContent);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `PDF export failed: ${err.message}` }]);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showThought && !open && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.3 }} className="fixed bottom-24 right-6 z-40 pointer-events-none">
            <div className="relative bg-white border border-[#E2E8F0] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg max-w-[180px]">
              <p className="text-[#1A1F36] text-xs font-semibold leading-snug">How can I help you?</p>
              <p className="text-[#9CA3AF] text-[10px] mt-0.5">Click to get started</p>
              <div className="absolute -bottom-2 right-3 w-3 h-3 bg-white border-r border-b border-[#E2E8F0] rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#00338D] text-white shadow-xl shadow-[#00338D]/30 flex items-center justify-center hover:bg-[#0044b8] transition-colors"
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} aria-label="Open guide bot">
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} /></motion.span>}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col"
            style={{ maxHeight: '520px' }}>

            {/* Header */}
            <div className="px-4 py-3 bg-[#00338D] flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0"><Sparkles size={15} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K-Nexus Guide</p>
                <p className="text-white/50 text-[10px] mt-0.5">Find your starting stage</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs space-y-1 ${
                    msg.role === 'user' ? 'bg-[#00338D] text-white rounded-br-sm' : 'bg-[#F4F6F9] text-[#374151] rounded-bl-sm'
                  }`}>
                    {msg.role === 'user' ? msg.text : renderBotText(msg.text)}
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

              {/* Stage routing card */}
              {redirect && botPhase !== 'generating' && botPhase !== 'done' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0F4FF] border border-[#00338D]/15 rounded-xl p-3">
                  <p className="text-[10px] text-[#6B7280] mb-1.5">Recommended starting stage</p>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs font-bold text-[#00338D]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Stage {redirect.stage} — {redirect.label}</p>
                      {redirect.reason && <p className="text-[10px] text-[#6B7280] mt-0.5">{redirect.reason}</p>}
                    </div>
                    <button onClick={() => { setOpen(false); router.push(redirect.path); }}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#00338D] text-white text-[10px] font-bold rounded-lg hover:bg-[#0044b8] transition-colors">
                      Go <ChevronRight size={10} />
                    </button>
                  </div>

                  {/* Assessment offer — cockpit + assessment buttons */}
                  {botPhase === 'assessment-offer' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-[#00338D]/10 pt-3 space-y-2">
                      <p className="text-[10px] text-[#6B7280] mb-2 font-medium">Complex requirement detected. How would you like to proceed?</p>
                      <button
                        onClick={() => {
                          setOpen(false);
                          const params = new URLSearchParams({
                            brief: clientContext,
                            client: clientName !== 'Client' ? clientName : '',
                          });
                          router.push(`/client-cockpit?${params.toString()}`);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-white text-[10px] font-bold rounded-lg transition-colors"
                        style={{ background: 'linear-gradient(135deg, #00338D 0%, #0077C8 100%)' }}>
                        <LayoutDashboard size={11} /> Client Cockpit — Live Dashboard
                      </button>
                      <button
                        onClick={() => setBotPhase('report-type')}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#00338D]/20 text-[#00338D] text-[10px] font-bold rounded-lg hover:bg-[#00338D]/5 transition-colors">
                        <FileSearch size={11} /> Quick Assessment Report
                      </button>
                    </motion.div>
                  )}

                  {/* Report type selection */}
                  {botPhase === 'report-type' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-[#00338D]/10 pt-3 space-y-2">
                      <p className="text-[10px] text-[#6B7280] mb-2 font-medium">Choose your report type:</p>
                      <button
                        onClick={() => handleGenerateReport('quick')}
                        className="w-full text-left px-3 py-2.5 bg-white border border-[#00338D]/20 rounded-lg hover:border-[#00338D] hover:bg-[#00338D]/5 transition-all group">
                        <div className="flex items-center gap-2">
                          <Zap size={12} className="text-[#0077C8] flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-[#00338D]">Quick Report — 2-3 Pages</p>
                            <p className="text-[9px] text-[#9CA3AF]">High-impact, to-the-point with strategic options</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleGenerateReport('detailed')}
                        className="w-full text-left px-3 py-2.5 bg-white border border-[#00338D]/20 rounded-lg hover:border-[#00338D] hover:bg-[#00338D]/5 transition-all group">
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-[#0077C8] flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-[#00338D]">Detailed Report — Full Lifecycle</p>
                            <p className="text-[9px] text-[#9CA3AF]">End-to-end analysis across all 6 stages</p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Generating state */}
              {botPhase === 'generating' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0F4FF] border border-[#00338D]/15 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#00338D]/10 flex items-center justify-center">
                      <Sparkles size={18} className="text-[#0077C8]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-[#0077C8]/40 border-t-[#0077C8] rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-[#00338D]">Generating assessment...</p>
                    <p className="text-[9px] text-[#9CA3AF] mt-0.5">Researching {clientName} & analysing lifecycle</p>
                  </div>
                  <LoadingDots color="#0077C8" size={6} />
                </motion.div>
              )}

              {/* Done — download button */}
              {botPhase === 'done' && reportContent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0FFF8] border border-[#00A36C]/20 rounded-xl p-3">
                  <p className="text-[10px] text-[#6B7280] mb-2">
                    {reportType === 'quick' ? 'Quick Assessment' : 'Detailed Report'} ready for {clientName}
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#00338D] text-white text-[10px] font-bold rounded-lg hover:bg-[#0044b8] transition-colors disabled:opacity-60">
                    {pdfLoading
                      ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Preparing PDF...</>
                      : <><Download size={11} />Download PDF Report</>}
                  </button>
                  <button
                    onClick={() => { setBotPhase('report-type'); setReportContent(''); }}
                    className="w-full mt-1.5 text-[9px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors py-1">
                    Generate different report type
                  </button>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {botPhase === 'chat' || botPhase === 'assessment-offer' ? (
              <div className="px-3 pb-3 pt-2 border-t border-[#F4F6F9] flex-shrink-0">
                <div className="flex items-center gap-2 bg-[#F4F6F9] rounded-xl px-3 py-2">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Describe your goal..." className="flex-1 bg-transparent text-xs text-[#1A1F36] placeholder-[#9CA3AF] outline-none" />
                  <button onClick={sendMessage} disabled={!input.trim() || loading}
                    className="w-7 h-7 rounded-lg bg-[#00338D] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0044b8] transition-colors flex-shrink-0">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

  const wrapperProps = { className: 'mt-24', initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.8, duration: 0.6 } };

  if (loading) return (
    <motion.div {...wrapperProps}>
      <h2 className="text-[#9CA3AF] text-center text-sm font-semibold uppercase tracking-widest mb-8">Global Datacenter News</h2>
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
      <h2 className="text-[#9CA3AF] text-center text-sm font-semibold uppercase tracking-widest mb-8">Global Datacenter News</h2>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-sm">
        <Newspaper size={32} className="text-[#CBD5E1] mx-auto mb-3" />
        <p className="text-[#6B7280] text-sm font-semibold mb-1">News unavailable</p>
        <p className="text-[#9CA3AF] text-xs mb-4">{error || 'No articles found at this time.'}</p>
        <button onClick={() => { setLoading(true); fetchNews(); }}
          className="px-4 py-2 bg-[#00338D] text-white text-xs font-bold rounded-lg hover:bg-[#0044b8] transition-colors"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Try again</button>
      </div>
    </motion.div>
  );

  return (
    <motion.div {...wrapperProps}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-[#9CA3AF] text-sm font-semibold uppercase tracking-widest">Global Datacenter News</h2>
        </div>
        <span className="text-[#CBD5E1] text-[10px]">Refreshes hourly</span>
      </div>
      <div style={{ columnGap: '12px' }} className="[column-count:1] md:[column-count:2] lg:[column-count:3]">
        {articles.map((article, i) => {
          const featured = i % 4 === 0;
          const showImage = article.urlToImage && (featured || i % 3 === 1);
          return (
            <motion.a key={article.url} href={article.url} target="_blank" rel="noopener noreferrer"
              className="break-inside-avoid block mb-3 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#0077C8]/30 transition-all duration-200 group relative"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 + i * 0.06 }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00338D] to-[#0077C8] opacity-0 group-hover:opacity-100 transition-opacity" />
              {showImage && (
                <div className={`overflow-hidden ${featured ? 'h-44' : 'h-28'}`}>
                  <img src={article.urlToImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[#0077C8] text-[10px] font-bold uppercase tracking-wider truncate">{article.source}</span>
                  <span className="flex items-center gap-1 text-[#9CA3AF] text-[10px] flex-shrink-0"><Clock size={9} />{relativeTime(article.publishedAt)}</span>
                </div>
                <h3 className={`text-[#1A1F36] font-bold leading-snug mb-2 group-hover:text-[#00338D] transition-colors ${featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{article.title}</h3>
                {article.description && (
                  <p className={`text-[#6B7280] leading-relaxed mb-3 ${featured ? 'text-xs line-clamp-3' : 'text-[10px] line-clamp-2'}`}>{article.description}</p>
                )}
                <div className="flex items-center gap-1 text-[#0077C8] text-[10px] font-semibold group-hover:gap-2 transition-all">Read more <ExternalLink size={9} /></div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
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
          <motion.div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <motion.div className="text-center" initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: phase === 'shrink' ? 0.3 : 1, opacity: phase === 'logo' ? 1 : 0, y: phase === 'shrink' ? -100 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/db/KPMG_blue_logo.svg" alt="KPMG" className="h-20 w-auto mb-3 mx-auto" />
              <div className="text-[#6B7280] text-sm tracking-[6px] uppercase">Datacenter Intelligence</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="relative z-10 pt-28 pb-24 px-6" initial={{ opacity: 0 }} animate={{ opacity: phase === 'done' ? 1 : 0 }} transition={{ duration: 0.8 }}>
        <div className="max-w-screen-xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00338D]/8 border border-[#00338D]/15 rounded-full mb-6">
              <span className="text-[#00338D] text-xs font-bold tracking-wider uppercase">KPMG Advisory · Confidential</span>
            </div>
            <h1 className="text-5xl font-extrabold text-[#1A1F36] mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Datacenter Lifecycle<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00338D, #0077C8)' }}>Intelligence Platform</span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto leading-relaxed">AI-powered orchestration across 6 datacenter lifecycle stages — from market strategy to monetization.</p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              {['Assess', 'Analyse', 'Recommend', 'Deliver Outcomes'].map((word, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="px-4 py-1.5 rounded-full text-sm font-bold border"
                    style={{ backgroundColor: i === 3 ? '#00338D' : 'white', color: i === 3 ? 'white' : '#00338D', borderColor: '#00338D', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {word}
                  </motion.span>
                  {i < 3 && <span className="text-[#CBD5E1] font-light text-lg">→</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00338D]/30" />
              <div className="flex gap-1.5">{['#00338D','#0055A4','#0077C8'].map((c,i) => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />)}</div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00338D]/30" />
            </div>
          </motion.div>

          <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative flex items-center justify-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 150 }}>
                <LifecycleWheel onCenterClick={() => setShowModal(true)} />
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="text-center">
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00338D] text-white font-bold rounded-xl hover:bg-[#0044b8] transition-colors text-sm shadow-lg shadow-[#00338D]/20"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <Globe size={16} />Global Datacenter Dashboard<ArrowRight size={15} />
                </button>
                <button onClick={() => router.push('/command-center')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#00338D] text-[#00338D] font-bold rounded-xl hover:bg-[#00338D]/5 transition-colors text-sm shadow-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <LayoutDashboard size={16} />Operations Command Center
                </button>
              </div>
              <p className="text-[#9CA3AF] text-xs text-center mt-2">Global coverage · Live intelligence</p>
            </motion.div>
          </div>

          <DatacenterNewsSection />

          <motion.div className="mt-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <p className="text-[#CBD5E1] text-xs">© KPMG 2026 · K-Nexus Datacenter Intelligence · Strictly Confidential</p>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>{showModal && <UploadModal onClose={() => setShowModal(false)} />}</AnimatePresence>
      <GuideBot />
    </div>
  );
}