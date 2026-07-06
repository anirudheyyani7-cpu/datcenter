'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, BarChart2, Briefcase, Zap, CheckCircle2, TrendingUp,
  Filter, Download, ChevronDown, Leaf, Users, Shield,
} from 'lucide-react';

import DonutChart          from '@/components/eai/widgets/DonutChart';
import HorizontalBarList   from '@/components/eai/widgets/HorizontalBarList';
import BudgetVsActualTable from '@/components/eai/widgets/BudgetVsActualTable';
import StatusListCard      from '@/components/eai/widgets/StatusListCard';
import ScoreRing           from '@/components/eai/widgets/ScoreRing';
import QuickActionsMenu from '@/components/eai/widgets/QuickActionsMenu';

import {
  FINOPS_KPIS, COST_TREND, COST_BY_CATEGORY, COST_BY_LOCATION,
  TOP_COST_DRIVERS, BUDGET_VS_ACTUAL, UNIT_ECONOMICS, FINOPS_INSIGHTS, ALERTS,
  ESG_SCORECARD, CARBON_TREND, ENERGY_WATER, RENEWABLE_ENERGY,
  EMISSIONS_BY_SCOPE, EMISSIONS_BY_LOCATION, ESG_INITIATIVES,
  COMPLIANCE_REPORTING, ESG_INSIGHTS,
} from '@/data/eaiFinOpsEsgMock';

// ─── shared card styles ──────────────────────────────────────────────────────
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

// ─── local helpers ───────────────────────────────────────────────────────────
function MiniSparkline({ values = [], color = '#0077C8', height = 30 }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length - 1;
  const pts = values.map((v, i) => [
    (i / n) * 100,
    ((1 - (v - min) / range) * height).toFixed(1),
  ]);
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InsightsCard({ title, items = [], footerLink }) {
  return (
    <div style={{ ...CARD, flex: 1 }}>
      <div style={CARD_HDR}><span style={CARD_TITLE}>{title}</span></div>
      <div style={{ padding: '10px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.60)', lineHeight: 1.55 }}>{item.text}</p>
          </div>
        ))}
        {footerLink && (
          <a href="#" style={{ fontSize: 10, color: '#0077C8', textDecoration: 'none', marginTop: 4 }}>
            {footerLink} →
          </a>
        )}
      </div>
    </div>
  );
}

function AlertsCard({ title, items = [] }) {
  return (
    <div style={{ ...CARD, flex: 1 }}>
      <div style={CARD_HDR}>
        <span style={CARD_TITLE}>{title}</span>
        <a href="#" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>View All</a>
      </div>
      <div style={{ padding: '8px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block', marginTop: 3 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, color: '#fff', lineHeight: 1.4 }}>{item.title}</p>
              <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{item.ago}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinKpiCard({ label, value, sublabel, deltaText, deltaGood, Icon, iconColor, iconBg, valueColor }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3 }}>{label}</span>
      </div>
      <div>
        <p style={{ fontSize: 20, fontWeight: 800, color: valueColor ?? '#fff', fontFamily: 'ui-monospace,monospace', lineHeight: 1 }}>{value}</p>
        {sublabel && <p style={{ fontSize: 9, color: '#00A36C', marginTop: 3, fontWeight: 600 }}>{sublabel}</p>}
      </div>
      {deltaText && (
        <span style={{ fontSize: 9, color: deltaGood ? '#00A36C' : '#EF4444', fontWeight: 600 }}>{deltaText}</span>
      )}
    </div>
  );
}

// ─── FinOps tab ───────────────────────────────────────────────────────────────
function FinOpsPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* 6 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        <FinKpiCard
          label="Total Cost (May)" value="$12.64M"
          deltaText={`↓${Math.abs(FINOPS_KPIS.totalCostDelta.pct)}% ${FINOPS_KPIS.totalCostDelta.label}`}
          deltaGood={true}
          Icon={DollarSign} iconColor="#0077C8" iconBg="rgba(0,119,200,0.15)"
        />
        <FinKpiCard
          label="CapEx (YTD)" value="$45.28M"
          deltaText={`↑${Math.abs(FINOPS_KPIS.capexDelta.pct)}% ${FINOPS_KPIS.capexDelta.label}`}
          deltaGood={false}
          Icon={BarChart2} iconColor="#7C3AED" iconBg="rgba(124,58,237,0.15)"
        />
        <FinKpiCard
          label="OpEx (Monthly)" value="$8.91M"
          deltaText={`↓${Math.abs(FINOPS_KPIS.opexDelta.pct)}% ${FINOPS_KPIS.opexDelta.label}`}
          deltaGood={true}
          Icon={Briefcase} iconColor="#0077C8" iconBg="rgba(0,119,200,0.15)"
        />
        <FinKpiCard
          label="Cost / kW (Monthly)" value="$2.38"
          deltaText={`↓${Math.abs(FINOPS_KPIS.costPerKwDelta.pct)}% ${FINOPS_KPIS.costPerKwDelta.label}`}
          deltaGood={true}
          Icon={Zap} iconColor="#F59E0B" iconBg="rgba(245,158,11,0.15)"
        />
        <FinKpiCard
          label="Budget Variance" value="-7.2%"
          sublabel="Under Budget"
          Icon={CheckCircle2} iconColor="#00A36C" iconBg="rgba(0,163,108,0.15)"
          valueColor="#00A36C"
        />
        <FinKpiCard
          label="Forecast (FY2025)" value="$156.2M"
          deltaText={`↑${Math.abs(FINOPS_KPIS.forecastDelta.pct)}% ${FINOPS_KPIS.forecastDelta.label}`}
          deltaGood={false}
          Icon={TrendingUp} iconColor="#0077C8" iconBg="rgba(0,119,200,0.15)"
        />
      </div>

      {/* Row 1: Cost Trend | Cost by Category | Cost by Location | Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.1fr 1fr 0.9fr', gap: 12, minHeight: 280 }}>

        {/* Cost Trend */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Cost Trend (Dec '24 – May '25)</span></div>
          <div style={{ padding: '12px 10px 8px', flex: 1 }}>
            <div style={{ width: '100%', overflow: 'hidden', height: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={COST_TREND} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${v}M`} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} width={38} domain={[0, 16]} />
                  <Tooltip
                    contentStyle={{ background: '#1C2340', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 10, color: '#fff' }}
                    formatter={(v, n) => [`$${v}M`, n]}
                    labelStyle={{ color: 'rgba(255,255,255,0.55)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, color: 'rgba(255,255,255,0.50)' }} iconSize={8} />
                  <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#0077C8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="capex"     name="CapEx"      stroke="#7C3AED" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="opex"      name="OpEx"       stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost by Category */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Cost by Category (May)</span></div>
          <div style={{ padding: '8px 14px 12px', flex: 1, overflowY: 'auto' }}>
            <DonutChart
              data={COST_BY_CATEGORY}
              centerLabel="$12.64M"
              centerSublabel="Total"
              height={140}
              innerRadius={46}
              outerRadius={68}
              showLegend={false}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {COST_BY_CATEGORY.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: 'rgba(255,255,255,0.50)' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>${item.value}M</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>({item.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost by Location */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Cost by Location</span></div>
          <div style={{ padding: '10px 14px', flex: 1, overflowY: 'auto' }}>
            <HorizontalBarList
              items={COST_BY_LOCATION}
              maxValue={COST_BY_LOCATION[0].value}
              prefix="$"
              unit="M"
              labelWidth={86}
            />
          </div>
        </div>

        {/* FinOps Insights */}
        <InsightsCard title="FinOps Insights" items={FINOPS_INSIGHTS} footerLink="View All Insights" />
      </div>

      {/* Row 2: Top Cost Drivers | Budget vs Actual | Unit Economics | Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.75fr 0.75fr', gap: 12, minHeight: 240 }}>

        {/* Top Cost Drivers */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Top Cost Drivers</span></div>
          <div style={{ padding: '0 14px 12px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 56px 48px', padding: '6px 0 4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Driver', 'Category', 'Impact', 'Trend'].map(h => (
                <span key={h} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
            {TOP_COST_DRIVERS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 56px 48px', padding: '7px 0', borderBottom: i < TOP_COST_DRIVERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{row.driver}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 4 }}>{row.category}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'ui-monospace,monospace' }}>${row.impactM.toFixed(2)}M</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: row.up ? '#EF4444' : '#00A36C' }}>
                  {row.up ? '↑' : '↓'}{Math.abs(row.trendPct)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual */}
        <BudgetVsActualTable title="Budget vs Actual (May)" items={BUDGET_VS_ACTUAL} />

        {/* Unit Economics */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Unit Economics</span></div>
          <div style={{ padding: '8px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {UNIT_ECONOMICS.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < UNIT_ECONOMICS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', flex: 1, paddingRight: 8 }}>{row.metric}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'ui-monospace,monospace' }}>{row.value}</span>
                  <span style={{ fontSize: 9, color: '#00A36C', fontWeight: 600, width: 36, textAlign: 'right' }}>
                    ↓{Math.abs(row.deltaPct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <AlertsCard title="Alerts" items={ALERTS} />
      </div>
    </div>
  );
}

// ─── ESG tab ──────────────────────────────────────────────────────────────────
function EsgPanel() {
  const esgSubScores = [
    { label: 'Environmental', score: ESG_SCORECARD.environmental, color: '#10B981', Icon: Leaf   },
    { label: 'Social',        score: ESG_SCORECARD.social,        color: '#0077C8', Icon: Users  },
    { label: 'Governance',    score: ESG_SCORECARD.governance,    color: '#7C3AED', Icon: Shield },
  ];

  const renewableLegend = [
    { label: 'Renewable',     value: `${RENEWABLE_ENERGY.renewablePct}%`,    color: '#00A36C' },
    { label: 'Non-Renewable', value: `${RENEWABLE_ENERGY.nonRenewablePct}%`, color: '#6B7280' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Row 1: ESG Scorecard | Carbon Emissions | Energy & Water | Renewable Energy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>

        {/* ESG Scorecard */}
        <div style={{ ...CARD, alignItems: 'center', padding: '16px 14px', gap: 0 }}>
          <p style={{ ...CARD_TITLE, marginBottom: 14, alignSelf: 'flex-start' }}>ESG Scorecard</p>
          <ScoreRing
            score={ESG_SCORECARD.overall}
            unit="/100"
            color="#10B981"
            sublabel={ESG_SCORECARD.delta}
            size={130}
            items={esgSubScores}
          />
        </div>

        {/* Carbon Emissions */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Carbon Emissions</span></div>
          <div style={{ padding: '10px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace,monospace', lineHeight: 1 }}>
                {CARBON_TREND[CARBON_TREND.length - 1].tCO2e.toLocaleString()}
                <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', marginLeft: 5 }}>tCO2e</span>
              </p>
              <p style={{ fontSize: 10, color: '#00A36C', fontWeight: 600, marginTop: 4 }}>↓6.2% vs Apr '25</p>
            </div>
            <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={CARBON_TREND} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.30)' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#1C2340', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 10, color: '#fff' }}
                    formatter={v => [`${v.toLocaleString()} tCO2e`]}
                    labelStyle={{ color: 'rgba(255,255,255,0.55)' }}
                  />
                  <Area type="monotone" dataKey="tCO2e" stroke="#10B981" strokeWidth={2} fill="url(#carbonGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Energy & Water */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Energy & Water</span></div>
          <div style={{ padding: '10px 14px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Energy Consumption</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace,monospace', lineHeight: 1 }}>
                {ENERGY_WATER.consumptionGWh}
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.40)', marginLeft: 3 }}>GWh</span>
              </p>
              <p style={{ fontSize: 9, color: '#00A36C', fontWeight: 600 }}>↓{Math.abs(ENERGY_WATER.consumptionDelta)}% vs Apr '25</p>
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <MiniSparkline values={ENERGY_WATER.consumptionTrend} color="#F59E0B" height={36} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 10 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Water Usage</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace,monospace', lineHeight: 1 }}>
                {ENERGY_WATER.waterUsageKL}
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.40)', marginLeft: 3 }}>kL</span>
              </p>
              <p style={{ fontSize: 9, color: '#00A36C', fontWeight: 600 }}>↓{Math.abs(ENERGY_WATER.waterDelta)}% vs Apr '25</p>
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <MiniSparkline values={ENERGY_WATER.waterTrend} color="#0077C8" height={36} />
              </div>
            </div>
          </div>
        </div>

        {/* Renewable Energy */}
        <div style={{ ...CARD, alignItems: 'center', padding: '16px 14px', gap: 0 }}>
          <p style={{ ...CARD_TITLE, marginBottom: 14, alignSelf: 'flex-start' }}>Renewable Energy</p>
          <ScoreRing
            score={RENEWABLE_ENERGY.renewablePct}
            unit="%"
            color="#00A36C"
            size={120}
            items={renewableLegend}
            legendStyle
          />
        </div>
      </div>

      {/* Row 2: Emissions by Scope | Emissions by Location | Initiatives | Compliance | ESG Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1fr 1.1fr 1.1fr 1fr', gap: 12, minHeight: 220 }}>

        {/* Emissions by Scope */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Emissions by Scope</span></div>
          <div style={{ padding: '8px 14px 12px', flex: 1, overflowY: 'auto' }}>
            <DonutChart
              data={EMISSIONS_BY_SCOPE}
              centerLabel="12,842"
              centerUnit="tCO2e"
              height={130}
              innerRadius={42}
              outerRadius={60}
              showLegend={false}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {EMISSIONS_BY_SCOPE.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: 'rgba(255,255,255,0.50)' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>{item.value.toLocaleString()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>({item.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emissions by Location */}
        <div style={CARD}>
          <div style={CARD_HDR}><span style={CARD_TITLE}>Emissions by Location</span></div>
          <div style={{ padding: '10px 14px', flex: 1, overflowY: 'auto' }}>
            <HorizontalBarList
              items={EMISSIONS_BY_LOCATION}
              maxValue={EMISSIONS_BY_LOCATION[0].value}
              unit=" t"
              labelWidth={88}
            />
          </div>
        </div>

        {/* ESG Initiatives */}
        <StatusListCard title="ESG Initiatives" items={ESG_INITIATIVES} />

        {/* Compliance & Reporting */}
        <StatusListCard title="Compliance & Reporting" items={COMPLIANCE_REPORTING} />

        {/* ESG Insights */}
        <InsightsCard title="ESG Insights" items={ESG_INSIGHTS} footerLink="View All ESG Insights" />
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function FinOpsEsgPage() {
  const [activeTab,     setActiveTab]     = useState('finops');
  const [activeSection, setActiveSection] = useState('cost-overview');

  function handleTabChange(tab) {
    setActiveTab(tab);
    setActiveSection(tab === 'finops' ? 'cost-overview' : 'esg-overview');
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'row', overflow: 'hidden', background: '#0A0F1E' }}>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Sub-header: tab strip + date + controls */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: '#0D1428', height: 44 }}>
          {[
            { key: 'finops', label: 'FinOps Overview' },
            { key: 'esg',    label: 'ESG Overview'    },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => handleTabChange(key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 2px', height: 44, fontSize: 11, fontWeight: 700,
              color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.40)',
              borderBottom: activeTab === key ? '2px solid #0077C8' : '2px solid transparent',
              transition: 'color 0.12s',
            }}>
              {label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)' }}>May 1 – May 31, 2025</span>
            <ChevronDown size={10} style={{ color: 'rgba(255,255,255,0.40)' }} />
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>
            <Filter size={11} /> Filters
          </button>

          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 14px', borderRadius: 8, background: '#0077C8', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 10, fontWeight: 600 }}>
            <Download size={11} /> Export
          </button>
          <QuickActionsMenu items={[
            { iconKey: 'Plus',    label: 'New Cost Report' },
            { iconKey: 'Download',label: 'Export Data'     },
            { iconKey: 'Filter',  label: 'Apply Filters'   },
            { iconKey: 'Bell',    label: 'Set Budget Alert'},
          ]} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'finops' ? <FinOpsPanel /> : <EsgPanel />}
        </div>
      </div>
    </div>
  );
}
