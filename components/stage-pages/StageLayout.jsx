'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Sparkles, RotateCcw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { AIThinkingLoader } from '@/components/shared/LoadingDots';
import AIChatPanel from '@/components/ai-chat/AIChatPanel';
import { parseMarkdown } from '@/utils/helpers';
import useAppStore from '@/store/appStore';

const ALL_STAGES = [
  { num: '01', label: 'Strategy',     path: '/stage/01' },
  { num: '02', label: 'Sourcing',     path: '/stage/02' },
  { num: '03', label: 'Design',       path: '/stage/03' },
  { num: '04', label: 'Compliance',   path: '/stage/04' },
  { num: '05', label: 'Operations',   path: '/stage/05' },
  { num: '06', label: 'Monetization', path: '/stage/06' },
];

function StageProgress({ current }) {
  return (
    <div className="flex items-center gap-0">
      {ALL_STAGES.map((s, i) => {
        const isCurrent = s.num === current;
        const isPast = parseInt(s.num) < parseInt(current);
        return (
          <div key={s.num} className="flex items-center">
            <Link href={s.path}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCurrent ? 'bg-[#00338D] text-white'
                : isPast ? 'bg-[#00A36C]/10 text-[#00A36C] hover:bg-[#00A36C]/15'
                : 'bg-[#F4F6F9] text-[#9CA3AF] hover:bg-[#E2E8F0] hover:text-[#6B7280]'
              }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                isCurrent ? 'bg-white/20' : isPast ? 'bg-[#00A36C]/20 text-[#00A36C]' : 'bg-[#E2E8F0]'
              }`}>{isPast ? '✓' : s.num}</span>
              <span className="hidden sm:block">{s.label}</span>
            </Link>
            {i < ALL_STAGES.length - 1 && <ChevronRight size={14} className="text-[#CBD5E1] mx-0.5" />}
          </div>
        );
      })}
    </div>
  );
}

// Render inline markdown: **bold**
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1A1F36]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Render full markdown output as styled JSX
function MarkdownOutput({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let bulletBuffer = [];

  const flushBullets = (key) => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${key}`} className="space-y-1.5 mb-3 ml-1">
        {bulletBuffer.map((b, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="text-[#0077C8] flex-shrink-0 mt-1.5 text-xs">•</span>
            <span className="text-sm text-[#374151] leading-relaxed">{renderInline(b)}</span>
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
      elements.push(<h2 key={i} className="text-base font-extrabold text-[#00338D] mt-5 mb-2 pb-1.5 border-b border-[#E2E8F0]">{t.slice(2)}</h2>);
    } else if (t.startsWith('## ')) {
      flushBullets(i);
      elements.push(<h3 key={i} className="text-base font-bold text-[#00338D] mt-5 mb-2 pb-1.5 border-b border-[#E2E8F0]">{t.slice(3)}</h3>);
    } else if (t.startsWith('### ')) {
      flushBullets(i);
      elements.push(<h4 key={i} className="text-sm font-bold text-[#1A1F36] mt-4 mb-1.5">{t.slice(4)}</h4>);
    } else if (t.startsWith('---')) {
      flushBullets(i);
      elements.push(<hr key={i} className="border-[#E2E8F0] my-3" />);
    } else if (/^[-*•]\s+/.test(t)) {
      bulletBuffer.push(t.replace(/^[-*•]\s+/, ''));
    } else if (/^\d+\.\s+/.test(t)) {
      flushBullets(i);
      const num = t.match(/^(\d+)\./)[1];
      const content = t.replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={i} className="flex gap-2.5 items-start mb-1.5">
          <span className="w-5 h-5 rounded-full bg-[#00338D]/10 text-[#00338D] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</span>
          <span className="text-sm text-[#374151] leading-relaxed">{renderInline(content)}</span>
        </div>
      );
    } else {
      flushBullets(i);
      elements.push(<p key={i} className="text-sm text-[#374151] leading-relaxed mb-2">{renderInline(t)}</p>);
    }
  });
  flushBullets('end');
  return <div className="space-y-0.5">{elements}</div>;
}

export default function StageLayout({
  stageNum, stageName, stageDescription, stageIcon: StageIcon,
  color = '#00338D', formFields, generateInsights, systemContext, topContent,
}) {
  const router = useRouter();
  const { stageOutputs, setStageOutput, markStageComplete } = useAppStore();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(stageOutputs[stageNum] || '');
  const [error, setError] = useState(null);

  const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInsights(formData);
      setOutput(result);
      setStageOutput(stageNum, result);
      markStageComplete(stageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chatContext = output
    ? `Stage: ${stageName}\n\nUser Inputs:\n${Object.entries(formData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')}\n\nAI Analysis:\n${output}`
    : `Stage: ${stageName}\n\nUser is working on datacenter ${stageName}.`;

  return (
    <div className="min-h-screen bg-[#F4F6F9] pt-16">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1F36] transition-colors">
              <ArrowLeft size={16} />Back to Lifecycle
            </Link>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
                {StageIcon && <StageIcon size={24} style={{ color }} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: color + '12', color }}>STAGE {stageNum}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stageName}</h1>
              </div>
            </div>
            <StageProgress current={stageNum} />
          </div>
          {stageDescription && <p className="text-[#6B7280] text-sm mt-3 max-w-2xl leading-relaxed">{stageDescription}</p>}
        </div>
      </div>

      {topContent && (
        <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-0">
          {topContent}
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F36] font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Analysis Parameters</h2>
                <button onClick={() => setFormData({})} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors" title="Reset">
                  <RotateCcw size={14} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {formFields({ formData, updateField })}
                <div className="pt-2">
                  <Button onClick={handleGenerate} disabled={loading} variant="primary" size="lg" className="w-full justify-center">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                      : <><Sparkles size={16} />Generate Insights</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                  <Sparkles size={14} style={{ color }} />
                </div>
                <h2 className="text-[#1A1F36] font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI-Generated Analysis</h2>
                {output && (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#00A36C]/10 text-[#00A36C] font-semibold">Ready</span>
                    <button
                      onClick={() => router.push('/stage/analysis')}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#00338D] text-white rounded-lg text-xs font-bold hover:bg-[#0044b8] transition-colors shadow-sm"
                    >
                      <BarChart3 size={12} />Deep Dive
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 min-h-[300px]">
                {loading && <AIThinkingLoader />}
                {error && !loading && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                    <p className="font-semibold mb-1">Error generating analysis</p>
                    <p className="text-red-500 text-xs">{error}</p>
                  </div>
                )}
                {!loading && !output && !error && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: color + '10' }}>
                      <Sparkles size={28} style={{ color }} />
                    </div>
                    <h3 className="text-[#1A1F36] font-bold text-sm mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to generate insights</h3>
                    <p className="text-[#9CA3AF] text-sm">Fill in the parameters and click Generate Insights.</p>
                  </div>
                )}
                {!loading && output && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <MarkdownOutput text={output} />
                  </motion.div>
                )}
              </div>
            </div>

            <AIChatPanel context={chatContext} systemContext={systemContext} title={`${stageName} AI Advisor`} className="flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}