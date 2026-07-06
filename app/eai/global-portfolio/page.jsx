'use client';
import { Calendar, Filter, Download, ChevronRight, ArrowRight, Leaf, Droplets, Recycle } from 'lucide-react';

import KpiCard    from '@/components/eai/widgets/KpiCard';
import DonutChart from '@/components/eai/widgets/DonutChart';
import TrendChart from '@/components/eai/widgets/TrendChart';
import MapPanel   from '@/components/eai/widgets/MapPanel';
import ListCard   from '@/components/eai/widgets/ListCard';
import StatTile   from '@/components/eai/widgets/StatTile';

import {
  eaiKpis, eaiCapacityByRegion, eaiAiBriefing,
  eaiUtilizationTrend, eaiPueTrend, eaiRenewableByRegion, eaiAssetStatus,
  eaiCriticalAlerts, eaiRecentNews, eaiUpcomingMaintenance,
  eaiDemandPlanning, eaiEsgMetrics, eaiMapClusters,
} from '@/data/eaiMockData';

const ESG_ICONS = { leaf: Leaf, droplets: Droplets, recycle: Recycle };

// ── Shared card shell ─────────────────────────────────────────────────────────
function Card({ title, action, children, border, noPad = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${border ?? 'rgba(255,255,255,0.07)'}`,
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{title}</span>
          {action}
        </div>
      )}
      <div style={{ flex: 1, padding: noPad ? 0 : 14 }}>{children}</div>
    </div>
  );
}

function DropBtn({ children }) {
  return (
    <button style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 8, padding: '3px 9px', cursor: 'pointer',
      color: 'rgba(255,255,255,0.45)', fontSize: 9,
    }}>{children}</button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GlobalPortfolioPage() {
  return (
    <div style={{ background: '#0A0F1E', minHeight: '100%', color: '#fff' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>
            <span>Global Portfolio</span>
            <ChevronRight size={8} />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Dashboard</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>Global Portfolio Dashboard</h1>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 3 }}>Real-time overview of your global asset portfolio</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', fontSize: 11,
          }}>
            <Calendar size={12} /> Last 30 Days ▾
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', fontSize: 11,
          }}>
            <Filter size={12} /> Filters
            <span style={{
              width: 16, height: 16, borderRadius: '50%', background: '#0077C8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>3</span>
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#0077C8', border: 'none', borderRadius: 8,
            padding: '6px 14px', cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            <Download size={12} /> Export ▾
          </button>
        </div>
      </div>

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── KPI Strip (8 cards) ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {eaiKpis.map(k => <KpiCard key={k.key} {...k} />)}
        </div>

        {/* ── Row 2: Map | Capacity Donut | Right Rail ─────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px 258px', gap: 14 }}>

          {/* Map */}
          <MapPanel clusters={eaiMapClusters} height={370} />

          {/* Capacity by Region */}
          <Card title="Capacity by Region" action={<DropBtn>IT Power (MW) ▾</DropBtn>}>
            <DonutChart
              data={eaiCapacityByRegion}
              centerLabel="2,134"
              centerUnit="MW"
              centerSublabel="Total Capacity"
              height={155}
              innerRadius={50}
              outerRadius={74}
            />
          </Card>

          {/* Right Rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* AI Executive Briefing */}
            <div style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.22)',
              borderRadius: 16, padding: 14, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>AI Executive Briefing</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: '#7C3AED',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.30)',
                  borderRadius: 5, padding: '2px 6px',
                }}>Beta</span>
              </div>
              {eaiAiBriefing.paragraphs.map((para, i) => (
                <p key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 6 }}>
                  {para.includes(eaiAiBriefing.linkText)
                    ? para.split(eaiAiBriefing.linkText).flatMap((part, j) =>
                        j === 0
                          ? [part]
                          : [<a key={j} href={eaiAiBriefing.linkHref} style={{ color: '#7C3AED', textDecoration: 'underline' }}>{eaiAiBriefing.linkText}</a>, part]
                      )
                    : para}
                </p>
              ))}
              <a href="/eai/intelligence-center" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: '#7C3AED', textDecoration: 'none', marginTop: 4,
              }}>
                View Full Briefing <ArrowRight size={10} />
              </a>
            </div>

            {/* Critical Alerts */}
            <ListCard
              title="Critical Alerts"
              count={24}
              viewAllHref="/eai/operations-hub"
              items={eaiCriticalAlerts}
              variant="alerts"
              footer={{ label: 'Go to Operations Hub', href: '/eai/operations-hub' }}
            />

            {/* Recent News */}
            <ListCard
              title="Recent News"
              viewAllHref="#"
              items={eaiRecentNews}
              variant="news"
            />
          </div>
        </div>

        {/* ── Row 3: 4 Chart Cards ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

          {/* Utilization Trend */}
          <Card title="Utilization Trend" action={<DropBtn>All Regions ▾</DropBtn>}>
            <TrendChart type="line" data={eaiUtilizationTrend} color="#0077C8" unit="%" domain={[50, 100]} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ width: 14, height: 2, background: '#0077C8', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>Avg Utilization</span>
            </div>
          </Card>

          {/* PUE Trend */}
          <Card title="PUE Trend" action={<DropBtn>All Regions ▾</DropBtn>}>
            <TrendChart type="line" data={eaiPueTrend} color="#00A36C" domain={[1.1, 1.6]} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ width: 14, height: 2, background: '#00A36C', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>Power Usage Effectiveness</span>
            </div>
          </Card>

          {/* Renewable Energy % */}
          <Card title="Renewable Energy %" action={<DropBtn>All Regions ▾</DropBtn>}>
            <TrendChart type="bar" data={eaiRenewableByRegion} color="#34D399" unit="%" xKey="name" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ width: 14, height: 6, background: '#34D399', display: 'inline-block', borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>% Renewable by Region</span>
            </div>
          </Card>

          {/* Assets by Status */}
          <Card title="Assets by Status">
            <DonutChart
              data={eaiAssetStatus}
              centerLabel="21,342"
              centerSublabel="Total"
              height={130}
              innerRadius={36}
              outerRadius={56}
            />
          </Card>
        </div>

        {/* ── Row 4: Bottom 3-col ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

          {/* Upcoming Maintenance */}
          <Card
            title="Upcoming Maintenance"
            action={<a href="/eai/operations-hub" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>View All</a>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {eaiUpcomingMaintenance.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                  paddingBottom: i < eaiUpcomingMaintenance.length - 1 ? 10 : 0,
                  borderBottom: i < eaiUpcomingMaintenance.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.80)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.asset}</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{m.facility}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>{m.type}</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)', marginTop: 1 }}>{m.date}</p>
                    <span style={{
                      display: 'inline-block', marginTop: 3,
                      background: m.pc + '22', color: m.pc,
                      fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    }}>{m.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Demand Planning Summary */}
          <Card title="Demand Planning Summary">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {eaiDemandPlanning.map(d => (
                <StatTile key={d.label} {...d} />
              ))}
            </div>
          </Card>

          {/* ESG Summary */}
          <Card title="ESG Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {eaiEsgMetrics.map(e => {
                const Icon = ESG_ICONS[e.iconKey] ?? Leaf;
                return (
                  <div key={e.label} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, padding: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: e.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} style={{ color: e.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{e.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'monospace', lineHeight: 1.1, marginTop: 2 }}>
                        {e.value}{e.unit === '%' && <span style={{ fontSize: 12, marginLeft: 2 }}>%</span>}
                      </p>
                      {e.unit && e.unit !== '%' && <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{e.unit}</p>}
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#00A36C', marginTop: 3 }}>{e.delta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
