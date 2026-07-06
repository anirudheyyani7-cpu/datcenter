'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, Filter, Download, ChevronRight, Search } from 'lucide-react';

import KpiCard             from '@/components/eai/widgets/KpiCard';
import RiskHeatmapGrid     from '@/components/eai/widgets/RiskHeatmapGrid';
import ForecastChart       from '@/components/eai/widgets/ForecastChart';
import AnomalyStatCard     from '@/components/eai/widgets/AnomalyStatCard';
import IntelligenceSidePanel from '@/components/eai/intelligence-center/IntelligenceSidePanel';
import AIChatPanel         from '@/components/ai-chat/AIChatPanel';

import {
  IC_KPIS, INSIGHTS, INSIGHT_CATEGORIES, RISK_HEATMAP, PREDICTIVE_FAILURES,
  CAPACITY_FORECAST, COST_OPTIMIZATIONS, ANOMALIES, KG_STATS,
} from '@/data/eaiIntelligenceMock';

const KGPreview = dynamic(() => import('@/components/wiki/DCKnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0F1E' }}>
      <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 11 }}>Loading graph…</span>
    </div>
  ),
});

// ─── shared styles ──────────────────────────────────────────────────────────────
const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14, overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
};
const CARD_HDR = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
};
const CARD_TITLE = { fontSize: 11, fontWeight: 700, color: '#fff' };
const VIEW_ALL   = { fontSize: 9, color: '#0077C8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 };

// ─── severity styles ─────────────────────────────────────────────────────────────
const SEV = {
  Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',   border: 'rgba(239,68,68,0.35)'   },
  High:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.35)'  },
  Medium:   { color: '#0077C8', bg: 'rgba(0,119,200,0.18)',   border: 'rgba(0,119,200,0.35)'   },
  Info:     { color: '#6B7280', bg: 'rgba(107,114,128,0.18)', border: 'rgba(107,114,128,0.35)' },
};
const IMPACT_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };

// ─── AI Insights tab strip ────────────────────────────────────────────────────
const CAT_DOTS = {
  'All Insights':     '#0077C8',
  'Assets':           '#F59E0B',
  'Operations':       '#10B981',
  'Finance':          '#0077C8',
  'Sustainability':   '#00A36C',
  'Risk & Compliance':'#F59E0B',
  'Supply Chain':     '#7C3AED',
};

// ─── AI Assistant context ─────────────────────────────────────────────────────
const AI_SYSTEM_CONTEXT = `You are the EAI Platform Intelligence Engine — an AI assistant for enterprise datacenter portfolio management.
You help operations managers, facility teams, and executives understand their asset portfolio, risk scores, predictive analytics, capacity forecasts, and cost optimization opportunities.
Always be specific, data-driven, and concise. Reference specific facilities, asset counts, and metrics where relevant.`;

const AI_CONTEXT = `Intelligence Center Dashboard — Active portfolio: 21,342 assets across 24 data centers in 10 regions.
Key metrics: 432 active insights, 27 critical recommendations, $24.7M potential savings identified YTD, Risk Score 68/100 (Medium).
Current alerts: Power capacity nearing limit in Mumbai DC (42 days), 23% of servers reaching EOL within 90 days.
Anomalies detected (last 7 days): 14 power, 9 temperature, 6 network, 11 configuration.`;

const AI_QUICK_PROMPTS = [
  'Which assets are at risk of failure in next 30 days?',
  'Show me cost optimization opportunities',
  'What is the forecasted power demand for Singapore DC?',
  'Compare utilization trend across APAC region',
];

const AI_CHIPS = ['Capacity Risk', 'Cost Savings', 'EOL Assets', 'Sustainability'];

// ─── page ─────────────────────────────────────────────────────────────────────
export default function IntelligenceCenterPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [insightTab,    setInsightTab]    = useState('All Insights');
  const [forecastMetric] = useState('IT Power (MW)');

  const filteredInsights = insightTab === 'All Insights'
    ? INSIGHTS
    : INSIGHTS.filter(i => i.category === insightTab);

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'row', overflow: 'hidden', background: '#0A0F1E' }}>

      <IntelligenceSidePanel activeSection={activeSection} onSelect={setActiveSection} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Page sub-header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: '#0D1428' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Intelligence Center</h1>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>
                AI-powered insights, recommendations and predictive intelligence across your asset ecosystem
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)' }}>May 1 – May 31, 2025</span>
                <ChevronDown size={10} style={{ color: 'rgba(255,255,255,0.40)' }} />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>
                <Filter size={11} /> Filters
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 8, background: '#0077C8', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 10, fontWeight: 600 }}>
                <Download size={11} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── 6 KPI cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {IC_KPIS.map(k => (
              <KpiCard key={k.key} label={k.label} value={k.value} unit={k.unit} sublabel={k.sublabel}
                delta={k.delta} up={k.up} iconKey={k.iconKey} color={k.color} bg={k.bg} seed={k.seed} />
            ))}
          </div>

          {/* ── AI Insights Summary | AI Assistant ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 14, minHeight: 360 }}>

            {/* AI Insights Summary */}
            <div style={CARD}>
              <div style={{ ...CARD_HDR, flexWrap: 'wrap', gap: 6 }}>
                <span style={CARD_TITLE}>AI Insights Summary</span>
              </div>

              {/* Category tab strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', flexShrink: 0 }}>
                {INSIGHT_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setInsightTab(cat)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 10px', fontSize: 10, fontWeight: insightTab === cat ? 700 : 500,
                    color: insightTab === cat ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: insightTab === cat ? '2px solid #0077C8' : '2px solid transparent',
                    whiteSpace: 'nowrap', transition: 'color 0.12s',
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_DOTS[cat] ?? '#6B7280', display: 'inline-block', flexShrink: 0 }} />
                    {cat}
                  </button>
                ))}
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 64px 90px 88px 28px', padding: '5px 14px 3px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                {['', 'Insight', 'Impact', 'Affected', 'Date', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                ))}
              </div>

              {/* Insight rows */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredInsights.map((insight, i) => {
                  const s = SEV[insight.severity] ?? SEV.Info;
                  return (
                    <div key={insight.id}
                      style={{ display: 'grid', gridTemplateColumns: '80px 1fr 64px 90px 88px 28px', padding: '9px 14px', borderBottom: i < filteredInsights.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Severity badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, color: s.color, whiteSpace: 'nowrap' }}>
                          {insight.severity}
                        </span>
                      </div>
                      {/* Title + description */}
                      <div style={{ minWidth: 0, paddingRight: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insight.title}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{insight.description}</p>
                      </div>
                      {/* Impact */}
                      <span style={{ fontSize: 10, fontWeight: 700, color: IMPACT_COLOR[insight.impact] ?? '#6B7280' }}>{insight.impact}</span>
                      {/* Affected */}
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'ui-monospace,monospace' }}>
                        {insight.affectedAssets != null ? insight.affectedAssets.toLocaleString() : '—'}
                      </span>
                      {/* Date */}
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>{insight.date}</span>
                      {/* Chevron */}
                      <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <a href="#" style={VIEW_ALL}>View All Insights <ChevronRight size={10} /></a>
              </div>
            </div>

            {/* AI Assistant */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AIChatPanel
                title="AI Assistant"
                systemContext={AI_SYSTEM_CONTEXT}
                context={AI_CONTEXT}
                quickPrompts={AI_QUICK_PROMPTS}
                suggestionChips={AI_CHIPS}
                defaultExpanded={true}
                className="flex-1 h-full"
              />
            </div>
          </div>

          {/* ── Risk Heatmap | Predictive Failures | Capacity Forecast ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.6fr', gap: 14 }}>

            {/* Risk Heatmap */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Risk Heatmap</span></div>
              <div style={{ padding: '12px 14px', flex: 1 }}>
                <RiskHeatmapGrid rows={RISK_HEATMAP.rows} viewAllHref="#" />
              </div>
            </div>

            {/* Predictive Failures */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Predictive Failures (Next 30 Days)</span>
              </div>
              <div style={{ padding: '0 14px 12px', flex: 1, overflowY: 'auto' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '72px 80px 1fr 120px 60px', padding: '5px 0 3px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Asset', 'Type', 'Location', 'Failure Prob.', 'Impact'].map(h => (
                    <span key={h} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                  ))}
                </div>
                {PREDICTIVE_FAILURES.map((pf, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 80px 1fr 120px 60px', padding: '7px 0', borderBottom: i < PREDICTIVE_FAILURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pf.asset}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pf.type}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{pf.location}</span>
                    {/* Probability bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${pf.failurePct}%`, height: '100%', borderRadius: 3, background: pf.failurePct >= 70 ? '#EF4444' : pf.failurePct >= 50 ? '#F59E0B' : '#10B981' }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', width: 28, textAlign: 'right', fontFamily: 'ui-monospace,monospace', flexShrink: 0 }}>{pf.failurePct}%</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: IMPACT_COLOR[pf.impact] ?? '#6B7280' }}>{pf.impact}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <a href="#" style={VIEW_ALL}>View All Predictions <ChevronRight size={10} /></a>
              </div>
            </div>

            {/* Capacity Forecast */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Capacity Forecast (Next 90 Days)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.70)' }}>{forecastMetric}</span>
                  <ChevronDown size={9} style={{ color: 'rgba(255,255,255,0.40)' }} />
                </div>
              </div>
              <div style={{ padding: '10px 14px', flex: 1 }}>
                <ForecastChart
                  data={CAPACITY_FORECAST.data}
                  capacityLimitMW={CAPACITY_FORECAST.capacityLimitMW}
                  projectedExceedDate={CAPACITY_FORECAST.projectedExceedDate}
                  height={220}
                />
              </div>
              <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <a href="#" style={VIEW_ALL}>View Capacity Planning <ChevronRight size={10} /></a>
              </div>
            </div>
          </div>

          {/* ── Cost Optimization | Anomaly Detection | Knowledge Graph ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.7fr', gap: 14 }}>

            {/* Cost Optimization Opportunities */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Cost Optimization Opportunities</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>Potential Savings (YTD)</span>
              </div>
              <div style={{ padding: '8px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
                {COST_OPTIMIZATIONS.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < COST_OPTIMIZATIONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{opt.opportunity}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#00A36C', fontFamily: 'ui-monospace,monospace', flexShrink: 0 }}>${opt.potentialM}M</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <a href="#" style={VIEW_ALL}>View All Opportunities <ChevronRight size={10} /></a>
              </div>
            </div>

            {/* Anomaly Detection */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Anomaly Detection</span>
                <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>Detected in the last 7 days</span>
                  <a href="#" style={{ fontSize: 9, color: '#0077C8', textDecoration: 'none' }}>View All</a>
                </div>
              </div>
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {ANOMALIES.map(a => (
                    <AnomalyStatCard key={a.category} category={a.category} count={a.count} delta={a.delta} up={a.up} color={a.color} iconKey={a.iconKey} />
                  ))}
                </div>
              </div>
            </div>

            {/* Knowledge Graph */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Knowledge Graph</span></div>
              <div style={{ padding: '10px 14px', flex: 1, display: 'flex', gap: 12 }}>
                {/* Graph preview */}
                <div style={{ flex: 1, height: 210, background: '#0A0F1E', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <KGPreview activeCategory="all" />
                </div>
                {/* Stats list */}
                <div style={{ width: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 9 }}>
                  {KG_STATS.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'ui-monospace,monospace', flexShrink: 0 }}>{s.value}</span>
                    </div>
                  ))}
                  <a href="/wiki" style={{ fontSize: 10, color: '#0077C8', textDecoration: 'none', marginTop: 6 }}>
                    Explore Knowledge Graph →
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>{/* end scrollable */}
      </div>
    </div>
  );
}
