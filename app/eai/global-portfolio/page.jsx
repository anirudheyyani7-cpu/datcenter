'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar, Filter, Download, ChevronRight, ArrowRight, Leaf, Droplets, Recycle,
  X, Building2, Layers, Zap, Timer, Activity, ShieldAlert, Globe2, MapPin, Wrench, Newspaper,
} from 'lucide-react';

import KpiCard      from '@/components/eai/widgets/KpiCard';
import DonutChart    from '@/components/eai/widgets/DonutChart';
import TrendChart    from '@/components/eai/widgets/TrendChart';
import MapPanel      from '@/components/eai/widgets/MapPanel';
import ListCard      from '@/components/eai/widgets/ListCard';
import StatTile      from '@/components/eai/widgets/StatTile';
import DetailDrawer, { DrawerTable, DrawerStatRow, DrawerPill } from '@/components/eai/widgets/DetailDrawer';

import {
  eaiKpis, eaiCapacityByRegion, eaiAiBriefing,
  eaiUtilizationTrend, eaiPueTrend, eaiRenewableByRegion, eaiAssetStatus,
  eaiCriticalAlerts, eaiRecentNews, eaiUpcomingMaintenance,
  eaiDemandPlanning, eaiEsgMetrics, eaiMapClusters,
  eaiFacilities, eaiUtilizationByRegion, eaiClusterIdsForRegion,
} from '@/data/eaiMockData';

// Same dynamic-import pattern as app/asset-portfolio/global-cockpit/page.jsx
const GlobeViewer = dynamic(() => import('@/components/globe/GlobeViewer'), { ssr: false });

const ESG_ICONS = { leaf: Leaf, droplets: Droplets, recycle: Recycle };
const KPI_ICONS = { building: Building2, layers: Layers, zap: Zap, timer: Timer, activity: Activity, droplets: Droplets, leaf: Leaf, shieldAlert: ShieldAlert };
const STATUS_COLOR = { optimal: '#00A36C', good: '#0077C8', warning: '#D4A017', critical: '#DC2626', maintenance: '#6B7280' };

// ── Shared card shell ─────────────────────────────────────────────────────────
function Card({ title, action, children, border, noPad = false }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${border ?? '#E2E8F0'}`,
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>{title}</span>
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
      background: '#F8FAFC', border: '1px solid #E2E8F0',
      borderRadius: 8, padding: '3px 9px', cursor: 'pointer',
      color: '#6B7280', fontSize: 9,
    }}>{children}</button>
  );
}

// ── 3D globe modal — expand target for the map card's hover-revealed icon ────
function GlobeModal({ open, onClose, facilities, focusClusterId, onMarkerClick }) {
  if (!open) return null;

  const datacenters = facilities.map(f => ({
    id: f.id,
    name: f.name,
    capacity_mw: f.capacityMW,
    tier_rating: undefined,
    coordinates: { latitude: f.lat, longitude: f.lon },
    status: f.status,
  }));

  const focusFacility = focusClusterId
    ? facilities.find(f => f.mapClusterId === focusClusterId)
    : null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.55)', zIndex: 998 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 999, width: '90vw', maxWidth: 1100, height: '82vh',
        background: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #E2E8F0', boxShadow: '0 24px 64px rgba(16,24,40,0.35)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe2 size={16} color="#0077C8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1F36' }}>Global Infrastructure — 3D View</span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{facilities.length} facilities</span>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 7, border: '1px solid #E2E8F0', background: '#F8FAFC',
            color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Globe canvas — kept on a dark backdrop, same as the reference cockpit globe, since the
            starfield/globe render needs contrast a white page background can't give it. */}
        <div style={{
          flex: 1, position: 'relative', minHeight: 0,
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 40%, #060e1a 100%)',
        }}>
          <GlobeViewer
            datacenters={datacenters}
            selectedId={focusFacility?.id ?? null}
            getMarkerColor={dc => STATUS_COLOR[dc.status] ?? '#6B7280'}
            onMarkerClick={onMarkerClick}
            showLink={false}
          />
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          padding: '10px 18px', borderTop: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          {Object.entries(STATUS_COLOR).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#6B7280', textTransform: 'capitalize' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {status}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GlobalPortfolioPage() {
  // { kind, ...payload } | null — everything the DetailDrawer currently shows
  const [drawer, setDrawer] = useState(null);
  const closeDrawer = () => setDrawer(null);

  // Cross-highlight between Capacity by Region legend and the map pins.
  // source is 'region' (from the donut/legend) or 'cluster' (from a map pin) —
  // whichever was interacted with most recently wins.
  const [highlight, setHighlight] = useState(null);

  const [globeOpen, setGlobeOpen] = useState(false);

  const highlightedClusterIds = highlight?.source === 'region'
    ? eaiClusterIdsForRegion(highlight.value)
    : highlight?.source === 'cluster'
      ? [highlight.value]
      : [];
  const activeRegionName = highlight?.source === 'region' ? highlight.value : null;

  function handleRegionClick(item) {
    setHighlight(prev =>
      prev?.source === 'region' && prev.value === item.name ? null : { source: 'region', value: item.name }
    );
  }

  function handleMarkerClick(cluster) {
    setHighlight({ source: 'cluster', value: cluster.id });
    setDrawer({ kind: 'cluster', cluster });
  }

  function handleExpandGlobe() {
    setGlobeOpen(true);
  }

  function handleGlobeMarkerClick(dc) {
    const facility = eaiFacilities.find(f => f.id === dc.id);
    if (facility) setDrawer({ kind: 'facility', facility });
  }

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', color: '#1A1F36' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid #E2E8F0',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#9CA3AF', marginBottom: 5 }}>
            <span>Global Portfolio</span>
            <ChevronRight size={8} />
            <span style={{ color: '#6B7280' }}>Dashboard</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1F36', margin: 0, lineHeight: 1 }}>Global Portfolio Dashboard</h1>
          <p style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>Real-time overview of your global asset portfolio</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            color: '#6B7280', fontSize: 11,
          }}>
            <Calendar size={12} /> Last 30 Days ▾
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            color: '#6B7280', fontSize: 11,
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
          {eaiKpis.map(k => {
            const { key, ...cardProps } = k;
            return <KpiCard key={key} {...cardProps} onClick={() => setDrawer({ kind: 'kpi', kpi: k })} />;
          })}
        </div>

        {/* ── Row 2: Map | Capacity Donut | Right Rail ─────────────────── */}
        {/* minmax(0, 1fr) lets the map column shrink to the actual available width instead of
            being pushed wide by intrinsic content; alignItems:'start' stops the shorter Map/
            Capacity cards from being stretched to match the taller Right Rail (AI Briefing +
            2 list cards), which otherwise left dead white space at the bottom of those cards. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px 258px', gap: 14, alignItems: 'start' }}>

          {/* Map */}
          <MapPanel
            clusters={eaiMapClusters}
            height={370}
            onMarkerClick={handleMarkerClick}
            selectedClusterIds={highlightedClusterIds}
            onViewFull={handleExpandGlobe}
          />

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
              activeName={activeRegionName}
              onSegmentClick={handleRegionClick}
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
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>AI Executive Briefing</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: '#7C3AED',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.30)',
                  borderRadius: 5, padding: '2px 6px',
                }}>Beta</span>
              </div>
              {eaiAiBriefing.paragraphs.map((para, i) => (
                <p key={i} style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.6, marginBottom: 6 }}>
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
              onItemClick={item => setDrawer({ kind: 'alert', item })}
            />

            {/* Recent News */}
            <ListCard
              title="Recent News"
              items={eaiRecentNews}
              variant="news"
              onItemClick={item => setDrawer({ kind: 'news', item })}
              onViewAll={() => setDrawer({ kind: 'news-all' })}
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
              <span style={{ fontSize: 9, color: '#9CA3AF' }}>Avg Utilization</span>
            </div>
          </Card>

          {/* PUE Trend */}
          <Card title="PUE Trend" action={<DropBtn>All Regions ▾</DropBtn>}>
            <TrendChart type="line" data={eaiPueTrend} color="#00A36C" domain={[1.1, 1.6]} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ width: 14, height: 2, background: '#00A36C', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: '#9CA3AF' }}>Power Usage Effectiveness</span>
            </div>
          </Card>

          {/* Renewable Energy % */}
          <Card title="Renewable Energy %" action={<DropBtn>All Regions ▾</DropBtn>}>
            <TrendChart type="bar" data={eaiRenewableByRegion} color="#34D399" unit="%" xKey="name" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ width: 14, height: 6, background: '#34D399', display: 'inline-block', borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: '#9CA3AF' }}>% Renewable by Region</span>
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
            action={<a href="/eai/operations-hub" style={{ fontSize: 9, color: '#6B7280', textDecoration: 'none' }}>View All</a>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {eaiUpcomingMaintenance.map((m, i) => (
                <div
                  key={i}
                  onClick={() => setDrawer({ kind: 'maintenance', item: m })}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                    paddingBottom: i < eaiUpcomingMaintenance.length - 1 ? 10 : 0,
                    borderBottom: i < eaiUpcomingMaintenance.length - 1 ? '1px solid #E2E8F0' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.asset}</p>
                    <p style={{ fontSize: 9, color: '#6B7280', marginTop: 1 }}>{m.facility}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 9, color: '#6B7280' }}>{m.type}</p>
                    <p style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{m.date}</p>
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
                <StatTile key={d.label} {...d} onClick={() => setDrawer({ kind: 'demand', item: d })} />
              ))}
            </div>
          </Card>

          {/* ESG Summary */}
          <Card title="ESG Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {eaiEsgMetrics.map(e => {
                const Icon = ESG_ICONS[e.iconKey] ?? Leaf;
                return (
                  <div
                    key={e.label}
                    onClick={() => setDrawer({ kind: 'esg', item: e })}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: 10, padding: 10, cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: e.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} style={{ color: e.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 8, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{e.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#1A1F36', fontFamily: 'monospace', lineHeight: 1.1, marginTop: 2 }}>
                        {e.value}{e.unit === '%' && <span style={{ fontSize: 12, marginLeft: 2 }}>%</span>}
                      </p>
                      {e.unit && e.unit !== '%' && <p style={{ fontSize: 9, color: '#6B7280', marginTop: 1 }}>{e.unit}</p>}
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#00A36C', marginTop: 3 }}>{e.delta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>

      {/* ── Detail Drawer — the one shared "show me more" pattern ────────── */}
      <DrawerRouter drawer={drawer} onClose={closeDrawer} onOpen={setDrawer} />

      {/* ── 3D Globe expand modal ─────────────────────────────────────────── */}
      <GlobeModal
        open={globeOpen}
        onClose={() => setGlobeOpen(false)}
        facilities={eaiFacilities}
        focusClusterId={highlightedClusterIds[0] ?? null}
        onMarkerClick={handleGlobeMarkerClick}
      />
    </div>
  );
}

// ── Drawer content router ────────────────────────────────────────────────────
// Translates a `drawer` state value into the right DetailDrawer title/icon/body
// for each interaction built in this pass. Kept local to this page for now —
// once a second EAI page needs the same "kpi" / "facility" content shapes,
// this is the piece to lift into a shared helper.
function DrawerRouter({ drawer, onClose, onOpen }) {
  if (!drawer) return <DetailDrawer open={false} onClose={onClose} />;

  const goToOperationsFooter = (
    <a href="/eai/operations-hub" style={{ fontSize: 11, color: '#0077C8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
      Go to Operations Hub <ChevronRight size={12} />
    </a>
  );

  switch (drawer.kind) {
    case 'kpi': {
      const kpi = drawer.kpi;
      const Icon = KPI_ICONS[kpi.iconKey] ?? Building2;
      return (
        <DetailDrawer open title={kpi.label} subtitle={kpi.sublabel} icon={<Icon size={16} color={kpi.color} />} accentColor={kpi.color} onClose={onClose}>
          <KpiDrawerBody kpi={kpi} onOpen={onOpen} />
        </DetailDrawer>
      );
    }

    case 'cluster': {
      const cluster = drawer.cluster;
      const facilities = eaiFacilities.filter(f => f.mapClusterId === cluster.id);
      const color = STATUS_COLOR[cluster.status] ?? '#6B7280';
      return (
        <DetailDrawer open title={cluster.label} subtitle={`${facilities.length} facilities in this region`} icon={<MapPin size={16} color={color} />} accentColor={color} onClose={onClose}>
          <FacilityTable facilities={facilities} />
        </DetailDrawer>
      );
    }

    case 'facility': {
      const f = drawer.facility;
      const color = STATUS_COLOR[f.status] ?? '#6B7280';
      return (
        <DetailDrawer open title={f.name} subtitle={`${f.city}, ${f.country}`} icon={<Building2 size={16} color={color} />} accentColor={color} onClose={onClose}>
          <DrawerStatRow items={[
            { label: 'Region', value: f.region },
            { label: 'Capacity', value: `${f.capacityMW} MW` },
            { label: 'Utilization', value: `${f.utilizationPct}%` },
            { label: 'Health Score', value: f.healthScore, color },
          ]} />
          <DrawerPill label={f.status} color={color} />
        </DetailDrawer>
      );
    }

    case 'alert': {
      const item = drawer.item;
      return (
        <DetailDrawer open title={item.title} subtitle={item.sub} icon={<ShieldAlert size={16} color={item.color} />} accentColor={item.color} onClose={onClose} footer={goToOperationsFooter}>
          <DrawerStatRow items={[
            { label: 'Severity', value: item.severity, color: item.color },
            { label: 'Asset ID', value: item.assetId },
            { label: 'Detected', value: item.detectedAt },
          ]} />
          <p style={{ fontSize: 11, color: '#1A1F36', lineHeight: 1.6, marginBottom: 14 }}>{item.description}</p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Recommended Action</p>
            <p style={{ fontSize: 11, color: '#1A1F36', lineHeight: 1.55 }}>{item.recommendedAction}</p>
          </div>
        </DetailDrawer>
      );
    }

    case 'news': {
      const item = drawer.item;
      return (
        <DetailDrawer open title={item.title} subtitle={`${item.cat} · ${item.ago}`} icon={<Newspaper size={16} color="#0077C8" />} accentColor="#0077C8" onClose={onClose}>
          <p style={{ fontSize: 11, color: '#1A1F36', lineHeight: 1.65 }}>{item.body}</p>
        </DetailDrawer>
      );
    }

    case 'news-all': {
      return (
        <DetailDrawer open title="Recent News" subtitle={`${eaiRecentNews.length} articles`} icon={<Newspaper size={16} color="#0077C8" />} accentColor="#0077C8" onClose={onClose}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {eaiRecentNews.map(item => (
              <div
                key={item.id}
                onClick={() => onOpen({ kind: 'news', item })}
                style={{ cursor: 'pointer', paddingBottom: 12, borderBottom: '1px solid #E2E8F0' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36', marginBottom: 4 }}>{item.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: '#9CA3AF' }}>{item.ago}</span>
                  <span style={{ width: 2, height: 2, borderRadius: '50%', background: '#E2E8F0', display: 'inline-block' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#0077C8' }}>{item.cat}</span>
                </div>
                <p style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.55 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </DetailDrawer>
      );
    }

    case 'maintenance': {
      const item = drawer.item;
      return (
        <DetailDrawer open title={item.asset} subtitle={`${item.facility} · ${item.type}`} icon={<Wrench size={16} color={item.pc} />} accentColor={item.pc} onClose={onClose} footer={goToOperationsFooter}>
          <DrawerStatRow items={[
            { label: 'Work Order', value: item.workOrderId },
            { label: 'Technician', value: item.technician },
            { label: 'Duration', value: `${item.durationHrs} hrs` },
            { label: 'Scheduled', value: item.date },
          ]} />
          <div style={{ marginBottom: 12 }}><DrawerPill label={`${item.priority} Priority`} color={item.pc} /></div>
          <p style={{ fontSize: 11, color: '#1A1F36', lineHeight: 1.6 }}>{item.notes}</p>
        </DetailDrawer>
      );
    }

    case 'demand': {
      const item = drawer.item;
      return (
        <DetailDrawer open title={item.label} subtitle={`${item.value}${item.unit ? ' ' + item.unit : ''} · ${item.delta}`} icon={<Layers size={16} color="#0077C8" />} accentColor="#0077C8" onClose={onClose}>
          <DrawerTable
            columns={[{ key: 'label', label: 'Category' }, { key: 'value', label: 'Value', align: 'right' }]}
            rows={item.breakdown}
            keyField="label"
          />
        </DetailDrawer>
      );
    }

    case 'esg': {
      const item = drawer.item;
      const Icon = ESG_ICONS[item.iconKey] ?? Leaf;
      return (
        <DetailDrawer open title={item.label} subtitle={`${item.value}${item.unit ? ' ' + item.unit : ''} · ${item.delta}`} icon={<Icon size={16} color={item.color} />} accentColor={item.color} onClose={onClose}>
          <DrawerTable
            columns={[{ key: 'label', label: 'Region' }, { key: 'value', label: 'Value', align: 'right' }]}
            rows={item.breakdown}
            keyField="label"
          />
        </DetailDrawer>
      );
    }

    default:
      return <DetailDrawer open={false} onClose={onClose} />;
  }
}

function FacilityTable({ facilities }) {
  return (
    <DrawerTable
      keyField="id"
      columns={[
        { key: 'name', label: 'Facility' },
        { key: 'country', label: 'Country' },
        { key: 'status', label: 'Status', render: row => <DrawerPill label={row.status} color={STATUS_COLOR[row.status] ?? '#6B7280'} /> },
        { key: 'capacityMW', label: 'Capacity', align: 'right', render: row => `${row.capacityMW} MW` },
        { key: 'utilizationPct', label: 'Util.', align: 'right', render: row => `${row.utilizationPct}%` },
      ]}
      rows={facilities}
    />
  );
}

function KpiDrawerBody({ kpi, onOpen }) {
  switch (kpi.key) {
    case 'facilities':
      return (
        <>
          <DrawerStatRow items={[
            { label: 'Total Facilities', value: eaiFacilities.length },
            { label: 'Countries', value: new Set(eaiFacilities.map(f => f.country)).size },
            { label: 'Total Capacity', value: `${eaiFacilities.reduce((s, f) => s + f.capacityMW, 0).toLocaleString()} MW` },
          ]} />
          <FacilityTable facilities={eaiFacilities} />
        </>
      );

    case 'assets':
      return (
        <DrawerTable
          keyField="name"
          columns={[
            { key: 'name', label: 'Status' },
            { key: 'value', label: 'Assets', align: 'right', render: row => row.value.toLocaleString() },
            { key: 'pct', label: '% of Total', align: 'right', render: row => `${row.pct}%` },
          ]}
          rows={eaiAssetStatus}
        />
      );

    case 'capacity':
      return (
        <DrawerTable
          keyField="name"
          columns={[
            { key: 'name', label: 'Region' },
            { key: 'mw', label: 'MW', align: 'right', render: row => row.mw.toLocaleString() },
            { key: 'pct', label: '% of Total', align: 'right', render: row => `${row.pct}%` },
          ]}
          rows={eaiCapacityByRegion}
        />
      );

    case 'utilization':
      return (
        <DrawerTable
          keyField="name"
          columns={[
            { key: 'name', label: 'Region' },
            { key: 'value', label: 'Utilization', align: 'right', render: row => `${row.value}%` },
          ]}
          rows={eaiUtilizationByRegion}
        />
      );

    case 'health': {
      const sorted = [...eaiFacilities].sort((a, b) => a.healthScore - b.healthScore);
      const avg = Math.round(eaiFacilities.reduce((s, f) => s + f.healthScore, 0) / eaiFacilities.length);
      return (
        <>
          <DrawerStatRow items={[
            { label: 'Portfolio Avg', value: avg, color: '#00A36C' },
            { label: 'Lowest Score', value: sorted[0].healthScore, color: '#DC2626' },
            { label: 'At Risk (<70)', value: eaiFacilities.filter(f => f.healthScore < 70).length, color: '#D4A017' },
          ]} />
          <p style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Lowest-scoring facilities</p>
          <DrawerTable
            keyField="id"
            columns={[
              { key: 'name', label: 'Facility' },
              { key: 'region', label: 'Region' },
              { key: 'healthScore', label: 'Score', align: 'right', render: row => <span style={{ fontWeight: 700, color: row.healthScore < 70 ? '#DC2626' : '#1A1F36' }}>{row.healthScore}</span> },
            ]}
            rows={sorted.slice(0, 10)}
          />
        </>
      );
    }

    case 'pue':
      return (
        <DrawerTable
          keyField="week"
          columns={[
            { key: 'week', label: 'Week' },
            { key: 'value', label: 'PUE', align: 'right' },
          ]}
          rows={eaiPueTrend}
        />
      );

    case 'renewable':
      return (
        <DrawerTable
          keyField="name"
          columns={[
            { key: 'name', label: 'Region' },
            { key: 'value', label: 'Renewable %', align: 'right', render: row => `${row.value}%` },
          ]}
          rows={eaiRenewableByRegion}
        />
      );

    case 'alerts':
      return (
        <>
          <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 10 }}>Showing 3 of 24 active alerts — click a row for full detail.</p>
          <DrawerTable
            keyField="id"
            columns={[
              { key: 'title', label: 'Alert' },
              { key: 'sub', label: 'Facility' },
              { key: 'severity', label: 'Severity', render: row => <DrawerPill label={row.severity} color={row.color} /> },
              { key: 'ago', label: 'Detected', align: 'right' },
            ]}
            rows={eaiCriticalAlerts.map(item => ({ ...item, __onClick: () => onOpen({ kind: 'alert', item }) }))}
          />
        </>
      );

    default:
      return null;
  }
}
