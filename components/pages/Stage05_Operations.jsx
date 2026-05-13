'use client';
import { Activity, LayoutDashboard, ArrowRight, Settings2 } from 'lucide-react';
import StageLayout from '@/components/stage-pages/StageLayout';
import { FormField, Select, TextInput, SliderField } from '@/components/stage-pages/FormComponents';
import { callClaude, buildStagePrompt, buildRagQuery } from '@/lib/claude-api';

const STAGE_CONTEXT = `This stage covers day-to-day datacenter operations — staffing models, DCIM tooling, SLA management, PUE optimization, incident response, and predictive maintenance strategies.`;

function Fields({ formData, updateField }) {
  return (
    <>
      <FormField label="Number of Facilities"><TextInput value={formData.numFacilities} onChange={v => updateField('numFacilities', v)} placeholder="e.g., 3" type="number" /></FormField>
      <FormField label="Current Average PUE"><SliderField value={formData.currentPUE || 1.6} onChange={v => updateField('currentPUE', v)} min={1.1} max={2.5} step={0.05} formatValue={v => v.toFixed(2)} leftLabel="1.10 (Best)" rightLabel="2.50 (Poor)" /></FormField>
      <FormField label="Target PUE"><SliderField value={formData.targetPUE || 1.3} onChange={v => updateField('targetPUE', v)} min={1.1} max={2.0} step={0.05} formatValue={v => v.toFixed(2)} leftLabel="1.10 (Best)" rightLabel="2.00 (Basic)" /></FormField>
      <FormField label="Staffing Model"><Select value={formData.staffingModel} onChange={v => updateField('staffingModel', v)} options={['Fully Staffed 24×7 (on-site team)', 'Lights-Out / Remote Hands', 'Hybrid (on-site days + remote nights)', 'NOC-Centric (centralized network ops)']} placeholder="Select staffing model..." /></FormField>
      <FormField label="Monitoring & DCIM Approach"><Select value={formData.monitoring} onChange={v => updateField('monitoring', v)} options={['Legacy DCIM (on-premise, limited)', 'Modern DCIM (cloud-connected)', 'AI-Augmented DCIM (predictive alerts)', 'Fully Autonomous (AI-driven operations)']} placeholder="Select monitoring approach..." /></FormField>
      <FormField label="SLA Target Uptime"><Select value={formData.sla} onChange={v => updateField('sla', v)} options={['99.9% (8.76 hrs/yr downtime)', '99.95% (4.38 hrs/yr)', '99.99% (52.6 min/yr)', '99.999% (5.26 min/yr — Tier IV)']} placeholder="Select SLA target..." /></FormField>
      <FormField label="Average IT Load Utilization"><SliderField value={formData.utilization || 65} onChange={v => updateField('utilization', v)} min={10} max={100} step={5} formatValue={v => `${v}%`} leftLabel="10%" rightLabel="100%" /></FormField>
    </>
  );
}

async function generateInsights(formData) {
  const prompt = buildStagePrompt('Stage 05: DC Operations', STAGE_CONTEXT, formData, null);
  const ragQuery = buildRagQuery('datacenter operations PUE DCIM efficiency optimization', formData);
  return callClaude({ prompt, maxTokens: 8192, ragQuery });
}

// ── 2 Operation cards ──────────────────────────────────────────────────────
function OperationCards() {
  const cards = [
    {
      id: 'dc-optimization',
      icon: LayoutDashboard,
      color: '#00338D',
      tag: 'Assessment',
      label: 'DC Optimization',
      description: 'Comprehensive datacenter efficiency assessment — PUE benchmarking, capacity analysis, and full optimization roadmap.',
      action: null,
      actionLabel: 'Configure below',
      href: null,
    },
    {
      id: 'ai-operations',
      icon: Settings2,
      color: '#003580',
      tag: 'Analysis',
      label: 'AI Operations',
      description: 'Day-to-day operations analysis — staffing models, DCIM tooling, SLA management, and predictive maintenance strategies.',
      action: null,
      actionLabel: 'View AI in Operations',
      href: 'https://www.knexus.space/agents/aiops-sentry/login',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] hover:shadow-md transition-all"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.color + '15' }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00338D]/10 text-[#00338D]">{card.tag}</span>
              </div>
              <h3 className="font-bold text-[#1A1F36] text-sm mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{card.label}</h3>
              <p className="text-[#6B7280] text-xs leading-relaxed mb-4">{card.description}</p>
              {card.href ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#00338D] hover:text-[#0044b8] transition-colors"
                >
                  {card.actionLabel} <ArrowRight size={12} />
                </a>
              ) : (
                <span className="text-xs text-[#9CA3AF] font-medium">{card.actionLabel}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Stage05() {
  return (
    <StageLayout
      stageNum="05"
      stageName="DC Operations"
      stageDescription="Optimize your datacenter operations across efficiency, staffing, monitoring, and uptime."
      stageIcon={Activity}
      color="#003580"
      formFields={Fields}
      generateInsights={generateInsights}
      topContent={<OperationCards />}
    />
  );
}
