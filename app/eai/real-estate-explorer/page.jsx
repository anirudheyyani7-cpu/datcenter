'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Globe, Building2, Layers, Server, ChevronRight, ChevronDown,
  Search, Home, Filter, Download, Maximize2, ZoomIn, ZoomOut, RotateCcw,
  Calendar, X, Box, Activity, BarChart2, Plus, History, ExternalLink,
  Columns, LayoutGrid, RefreshCw, Cpu,
} from 'lucide-react';

import {
  RE_NODES, ROOT_IDS, getRackNodesForRoom, getAncestors, getAncestorBuilding, getDescendants,
} from '@/data/realEstateHierarchy';
import { buildKpiCards } from '@/lib/realEstateAggregates';
import { mockRacks, generateDCRacks } from '@/data/mock/racks';
import { generateRackAssets } from '@/data/mock/rackAssets';
import KpiCard            from '@/components/eai/widgets/KpiCard';
import CampusSitePlan     from '@/components/eai/real-estate/CampusSitePlan';
import BuildingFloorStack from '@/components/eai/real-estate/BuildingFloorStack';
import FloorRoomSchematic from '@/components/eai/real-estate/FloorRoomSchematic';
import RackElevationView  from '@/components/eai/real-estate/RackElevationView';

const ExteriorModel3D = dynamic(() => import('@/components/datacenters/ExteriorModel3D'), { ssr: false });
const InteriorModel3D = dynamic(() => import('@/components/datacenters/InteriorModel3D'), { ssr: false });

// ── constants ─────────────────────────────────────────────────────────────────
const DEFAULT_ID  = 'bsgpa-f2';
const INIT_EXPAND = new Set(['reg-sgp', 'cmp-sgp-a', 'bld-sgp-a-a']);
const NODE_ICONS  = { region: Globe, campus: Building2, building: Building2, floor: Layers, room: LayoutGrid, rack: Server };
const S_COLOR     = { operational: '#22c55e', maintenance: '#f97316', critical: '#ef4444' };
const LEVEL_TYPES = ['campus', 'building', 'floor', 'room'];
const DETAIL_TABS = ['Overview', 'Assets', 'Metrics', 'Maintenance', 'Docs'];
const BG          = '#F4F6F9';
const BORD        = '#E2E8F0';

function getDcIdForNode(nodeId) {
  const node = RE_NODES[nodeId];
  if (!node) return null;
  if (node.dcId) return node.dcId;
  for (const cid of (node.children || [])) {
    const c = RE_NODES[cid];
    if (c?.roomType === 'datacenter-floor' && c.dcId) return c.dcId;
  }
  return getAncestorBuilding(nodeId)?.dcId || null;
}

function getAncestorOfType(nodeId, type) {
  const path = [...getAncestors(nodeId), nodeId];
  for (let i = path.length - 1; i >= 0; i--) {
    if (RE_NODES[path[i]]?.type === type) return path[i];
  }
  return null;
}

// ── TreeNode ──────────────────────────────────────────────────────────────────
function TreeNode({ nodeId, depth, query, selected, expanded, onSelect, onToggle }) {
  const node = RE_NODES[nodeId];
  if (!node) return null;
  if (query) {
    const hit = node.name.toLowerCase().includes(query);
    const childHit = (node.children || []).some(cid =>
      RE_NODES[cid]?.name.toLowerCase().includes(query) ||
      getDescendants(cid).some(d => RE_NODES[d]?.name.toLowerCase().includes(query))
    );
    if (!hit && !childHit) return null;
  }

  const expandable = ['region', 'campus', 'building'].includes(node.type);
  const isOpen = expanded.has(nodeId);
  const isSel  = selected === nodeId;
  const Icon   = NODE_ICONS[node.type] || Box;
  const sc     = S_COLOR[node.status] || '#22c55e';

  return (
    <div>
      <div
        onClick={() => { onSelect(nodeId); if (expandable) onToggle(nodeId); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: `4px 6px 4px ${depth * 10 + 6}px`,
          borderRadius: 6, cursor: 'pointer', marginBottom: 1,
          background:   isSel ? 'rgba(124,58,237,0.22)' : 'transparent',
          borderLeft:   isSel ? '2px solid #7C3AED' : '2px solid transparent',
        }}
      >
        {expandable
          ? (isOpen
              ? <ChevronDown  size={9} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              : <ChevronRight size={9} style={{ color: '#9CA3AF', flexShrink: 0 }} />)
          : <span style={{ width: 9, flexShrink: 0 }} />}
        <Icon size={11} style={{ color: isSel ? '#7C3AED' : '#6B7280', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#1A1F36', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
      </div>
      {isOpen && expandable && (
        <div>
          {(node.children || []).map(cid => (
            <TreeNode key={cid} nodeId={cid} depth={depth + 1}
              query={query} selected={selected} expanded={expanded}
              onSelect={onSelect} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Details content ───────────────────────────────────────────────────────────
function DetailsContent({ tab, nodeId, rackId, dcId }) {
  const node = RE_NODES[nodeId];
  const rackObj = useMemo(() => {
    if (!rackId || !dcId) return null;
    return (mockRacks[dcId] || generateDCRacks(dcId)).find(r => r.id === rackId) || null;
  }, [rackId, dcId]);

  const assets = useMemo(() => {
    if (!rackObj) return [];
    return generateRackAssets(rackObj.label, dcId);
  }, [rackObj, dcId]);

  const Field = ({ label, val, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${BORD}` }}>
      <span style={{ fontSize: 10, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: color || '#1A1F36' }}>{val}</span>
    </div>
  );

  if (tab === 'Overview') {
    if (rackObj) {
      const sc  = S_COLOR[rackObj.status === 'warning' ? 'maintenance' : rackObj.status] || S_COLOR.operational;
      const bld = getAncestorBuilding(nodeId);
      return (
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1F36' }}>Rack {rackObj.label}</span>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: sc + '22', color: sc }}>
              {rackObj.status === 'operational' ? 'Operational' : rackObj.status === 'warning' ? 'Maintenance' : 'Critical'}
            </span>
          </div>
          <Field label="Rack Name"       val={rackObj.label} />
          <Field label="Row"             val={rackObj.row} />
          <Field label="Room"            val="A02" />
          <Field label="Floor"           val={node?.name ?? '—'} />
          <Field label="Building"        val={bld?.name ?? '—'} />
          <Field label="Campus"          val={RE_NODES[bld?.parentId]?.name ?? '—'} />
          <Field label="Rack Type"       val={`Standard ${rackObj.spaceTotalU}U`} />
          <Field label="Status"          val={rackObj.status === 'operational' ? 'Operational' : rackObj.status} color={sc} />
          <Field label="Installed Assets" val={`${rackObj.spaceUsedU} / ${rackObj.spaceTotalU}U`} />
          <Field label="Power Usage"     val={`${rackObj.powerKw.toFixed(1)} / ${rackObj.maxPowerKw} kW (${rackObj.utilPct}%)`} />
          <Field label="Temperature"     val={`${rackObj.inletTempC} °C`} color="#38bdf8" />
          <Field label="Humidity"        val="45%" />
        </div>
      );
    }
    const kpis = buildKpiCards(nodeId);
    return (
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', marginBottom: 8 }}>
          {node?.name}
          <span style={{ fontSize: 9, color: '#6B7280', fontWeight: 400, marginLeft: 6, textTransform: 'capitalize' }}>({node?.type})</span>
        </div>
        {kpis.slice(0, 6).map(k => (
          <div key={k.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${BORD}` }}>
            <span style={{ fontSize: 10, color: '#6B7280' }}>{k.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36' }}>{k.value}{k.unit}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'Assets' && rackObj) {
    return (
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 8 }}>{assets.length} assets</div>
        {assets.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: `1px solid ${BORD}`, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: a.color + '22', border: `1px solid ${a.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Server size={10} style={{ color: a.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
              <div style={{ fontSize: 9, color: '#6B7280' }}>{a.type} · {a.uPosition}</div>
            </div>
            <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: (a.status === 'Operational' ? '#22c55e' : '#ef4444') + '22', color: a.status === 'Operational' ? '#22c55e' : '#ef4444', flexShrink: 0 }}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const note = { Assets: 'Select a rack to view assets.', Metrics: 'Metrics charts coming soon.', Maintenance: 'Maintenance schedule coming soon.', Docs: 'Documentation links coming soon.' };
  return <div style={{ padding: '20px 14px', fontSize: 11, color: '#9CA3AF' }}>{note[tab]}</div>;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RealEstateExplorerPage() {
  const [selectedId,  setSelectedId]  = useState(DEFAULT_ID);
  const [rackId,      setRackId]      = useState(null);
  const [rackDcId,    setRackDcId]    = useState(null);
  const [view,        setView]        = useState('2d');
  const [expanded,    setExpanded]    = useState(INIT_EXPAND);
  const [searchQ,     setSearchQ]     = useState('');
  const [detailTab,   setDetailTab]   = useState('Overview');
  const [sliderVal,   setSliderVal]   = useState(0);
  const [assetSearch, setAssetSearch] = useState('');

  const node     = RE_NODES[selectedId];
  const nodeType = node?.type ?? 'floor';
  const dcId     = getDcIdForNode(selectedId);

  const toggleExpand = useCallback(id => setExpanded(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  }), []);

  const selectNode = useCallback(id => {
    setSelectedId(id); setRackId(null); setRackDcId(null); setDetailTab('Overview');
    setExpanded(prev => { const next = new Set(prev); getAncestors(id).forEach(a => next.add(a)); return next; });
  }, []);

  const selectRack = useCallback((rid, did) => {
    setRackId(rid); setRackDcId(did); setDetailTab('Overview');
  }, []);

  const kpiCards = useMemo(() => buildKpiCards(selectedId), [selectedId]);

  const breadcrumb = useMemo(() => (
    [...getAncestors(selectedId), selectedId].map(id => RE_NODES[id]).filter(Boolean)
  ), [selectedId]);

  const displayDate = useMemo(() => {
    const d = new Date(2025, 4, 19);
    d.setDate(d.getDate() - sliderVal);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [sliderVal]);

  const rackObj = useMemo(() => {
    if (!rackId || !rackDcId) return null;
    return (mockRacks[rackDcId] || generateDCRacks(rackDcId)).find(r => r.id === rackId) || null;
  }, [rackId, rackDcId]);

  const rackAssets = useMemo(() => {
    if (!rackObj) return [];
    return generateRackAssets(rackObj.label, rackDcId).filter(a =>
      !assetSearch || a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.type.toLowerCase().includes(assetSearch.toLowerCase())
    );
  }, [rackObj, rackDcId, assetSearch]);

  // ── Center visualization ───────────────────────────────────────────────────
  const centerViz = useMemo(() => {
    if (view === '3d') {
      const bld   = getAncestorBuilding(selectedId);
      const dcObj = { id: bld?.dcId || dcId || 'sgp-1', status: 'operational' };
      if (nodeType === 'floor' || nodeType === 'room') {
        return <div style={{ width: '100%', height: '100%' }}><InteriorModel3D dc={dcObj} /></div>;
      }
      return <div style={{ width: '100%', height: '100%' }}><ExteriorModel3D dc={dcObj} /></div>;
    }

    if (rackId && rackDcId) {
      return <RackElevationView rackId={rackId} dcId={rackDcId} />;
    }

    if (nodeType === 'region' || nodeType === 'campus') {
      const buildings = nodeType === 'campus'
        ? (node?.children || []).map(id => RE_NODES[id]).filter(Boolean)
        : (node?.children || []).flatMap(cid => (RE_NODES[cid]?.children || []).map(bid => RE_NODES[bid]).filter(Boolean));
      return <CampusSitePlan buildings={buildings} selectedId={null} onSelect={id => selectNode(id)} />;
    }

    if (nodeType === 'building') {
      const floors = (node?.children || []).map(id => RE_NODES[id]).filter(Boolean);
      return <BuildingFloorStack floors={floors} selectedId={null} onSelect={id => selectNode(id)} />;
    }

    // floor or room
    return (
      <FloorRoomSchematic
        dcId={dcId || 'sgp-1'}
        selectedRackId={rackId}
        onSelectRack={rid => selectRack(rid, dcId || 'sgp-1')}
      />
    );
  }, [view, selectedId, nodeType, node, dcId, rackId, rackDcId]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden', background: BG, color: '#1A1F36' }}>

      {/* ── LEFT hierarchy panel ──────────────────────────────────────────── */}
      <div style={{ width: 192, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORD}`, overflow: 'hidden', background: '#FFFFFF' }}>

        <div style={{ padding: '10px 10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Hierarchy</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}><RefreshCw size={11} /></button>
        </div>

        <div style={{ padding: '6px 8px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', borderRadius: 7, padding: '4px 8px' }}>
            <Search size={10} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search hierarchy..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 10, color: '#1A1F36' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
          {ROOT_IDS.map(rid => (
            <TreeNode key={rid} nodeId={rid} depth={0}
              query={searchQ.toLowerCase()} selected={selectedId} expanded={expanded}
              onSelect={selectNode} onToggle={toggleExpand} />
          ))}
        </div>

        {/* Quick Access */}
        <div style={{ borderTop: `1px solid ${BORD}`, padding: '8px 8px 4px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Quick Access</div>
          {[
            ['Open in EAM',          ExternalLink],
            ['Create Work Order',     Plus],
            ['Maintenance History',   History],
            ['View Asset Lifecycle',  Activity],
            ['View Supply Chain',     Box],
            ['Capacity Planning',     BarChart2],
          ].map(([label, Icon]) => (
            <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', borderRadius: 5, color: '#6B7280', fontSize: 10 }}>
              <Icon size={10} style={{ flexShrink: 0 }} /> {label}
            </button>
          ))}
        </div>

        {/* Time Slider */}
        <div style={{ borderTop: `1px solid ${BORD}`, padding: '8px 8px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Time Slider</div>
          <div style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 6 }}>View historical changes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: '#6B7280', flex: 1 }}>{displayDate}</span>
            <Calendar size={10} style={{ color: '#9CA3AF' }} />
          </div>
          <input type="range" min="0" max="365" value={sliderVal} onChange={e => setSliderVal(+e.target.value)}
            style={{ width: '100%', accentColor: '#7C3AED', marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setSliderVal(0)} style={{ flex: 1, padding: '4px 0', borderRadius: 6, background: '#F8FAFC', border: `1px solid ${BORD}`, color: '#6B7280', fontSize: 9, cursor: 'pointer' }}>Today</button>
            <button style={{ flex: 1, padding: '4px 0', borderRadius: 6, background: '#F8FAFC', border: `1px solid ${BORD}`, color: '#6B7280', fontSize: 9, cursor: 'pointer' }}>Compare</button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: main content ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6B7280' }}>
            <button onClick={() => selectNode('bld-sgp-a-a')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}>
              <Home size={11} />
            </button>
            {breadcrumb.map((n, i) => (
              <span key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={9} />
                {i === 0 && n.type === 'region' && (
                  <span style={{ fontSize: 9, background: '#F4F6F9', borderRadius: 4, padding: '1px 5px', marginRight: 2 }}>Asia Pacific</span>
                )}
                <button onClick={() => selectNode(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === breadcrumb.length - 1 ? '#1A1F36' : '#6B7280', fontSize: 10, padding: 0 }}>
                  {n.name}
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '5px 10px', color: '#6B7280', fontSize: 10, cursor: 'pointer' }}>
              <Filter size={11} /> Filters <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0077C8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>3</span>
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#7C3AED', border: 'none', borderRadius: 7, padding: '5px 12px', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              <Download size={11} /> Actions ▾
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          {kpiCards.map(k => <KpiCard key={k.key} {...k} />)}
        </div>

        {/* Center viz + details panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Viz panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Viz header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36', marginRight: 6 }}>
                  {node?.name}{rackObj ? ` — Rack ${rackObj.label}` : ''}
                </span>
                {LEVEL_TYPES.map(lt => {
                  const anc    = getAncestorOfType(selectedId, lt);
                  const active = nodeType === lt;
                  return (
                    <button key={lt} onClick={() => anc && selectNode(anc)} style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: active ? 700 : 400,
                      background: active ? '#0077C8' : '#F8FAFC',
                      border: `1px solid ${active ? '#0077C8' : BORD}`,
                      color: active ? '#fff' : '#6B7280',
                      cursor: anc ? 'pointer' : 'default', textTransform: 'capitalize',
                    }}>{lt.charAt(0).toUpperCase() + lt.slice(1)}</button>
                  );
                })}
                <button style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: rackId ? 700 : 400, background: rackId ? '#0077C8' : '#F8FAFC', border: `1px solid ${rackId ? '#0077C8' : BORD}`, color: rackId ? '#fff' : '#6B7280', cursor: 'default' }}>Rack</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
                  <button key={i} style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <Icon size={12} />
                  </button>
                ))}
                {!rackId && (
                  <div style={{ display: 'flex', background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, overflow: 'hidden' }}>
                    {['2d','3d'].map(v => (
                      <button key={v} onClick={() => setView(v)} style={{ padding: '4px 12px', fontSize: 10, fontWeight: view === v ? 700 : 400, background: view === v ? '#0077C8' : 'transparent', border: 'none', color: view === v ? '#fff' : '#6B7280', cursor: 'pointer', textTransform: 'uppercase' }}>{v}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Viz area */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {centerViz}
              {/* Minimap */}
              {(nodeType === 'floor' || nodeType === 'room') && !rackId && view === '2d' && (
                <div style={{ position: 'absolute', bottom: 12, left: 12, width: 80, height: 56, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)', backdropFilter: 'blur(6px)', borderRadius: 6, overflow: 'hidden', pointerEvents: 'none' }}>
                  <FloorRoomSchematic dcId={dcId || 'sgp-1'} selectedRackId={null} onSelectRack={() => {}} />
                </div>
              )}
              <button style={{ position: 'absolute', bottom: 12, right: 12, width: 28, height: 28, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)', backdropFilter: 'blur(6px)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1F36' }}>
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Details panel */}
          <div style={{ width: 268, flexShrink: 0, borderLeft: `1px solid ${BORD}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Details</span>
              {rackId && (
                <button onClick={() => { setRackId(null); setRackDcId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}><X size={12} /></button>
              )}
            </div>
            <div style={{ display: 'flex', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              {DETAIL_TABS.map(t => (
                <button key={t} onClick={() => setDetailTab(t)} style={{ flex: 1, padding: '7px 0', fontSize: 9, fontWeight: detailTab === t ? 700 : 400, color: detailTab === t ? '#1A1F36' : '#9CA3AF', borderBottom: `2px solid ${detailTab === t ? '#7C3AED' : 'transparent'}`, background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <DetailsContent tab={detailTab} nodeId={selectedId} rackId={rackId} dcId={rackDcId} />
            </div>
            {/* Quick Actions */}
            <div style={{ flexShrink: 0, borderTop: `1px solid ${BORD}`, padding: '10px 14px' }}>
              <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Open in EAM',          color: '#7C3AED', Icon: ExternalLink },
                  { label: 'Create Work Order',      color: null,      Icon: Plus },
                  { label: 'View Maintenance',       color: null,      Icon: Cpu },
                  { label: 'View Asset Lifecycle',   color: null,      Icon: Activity },
                  { label: 'View Supply Chain',      color: null,      Icon: Box },
                  { label: 'Capacity Planning',      color: null,      Icon: BarChart2 },
                ].map(({ label, color, Icon }) => (
                  <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', borderRadius: 7, background: color ? color + '20' : '#F8FAFC', border: `1px solid ${color ? color + '40' : BORD}`, color: color || '#6B7280', fontSize: 9, cursor: 'pointer' }}>
                    <Icon size={10} style={{ flexShrink: 0 }} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom assets table (rack level only) */}
        {rackId && rackObj && (
          <div style={{ flexShrink: 0, borderTop: `1px solid ${BORD}`, height: 230, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>
                Assets in Rack {rackObj.label}
                <span style={{ marginLeft: 6, fontSize: 9, background: 'rgba(239,68,68,0.18)', color: '#f87171', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>{rackAssets.length}</span>
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 8px' }}>
                  <Search size={10} style={{ color: '#9CA3AF' }} />
                  <input value={assetSearch} onChange={e => setAssetSearch(e.target.value)} placeholder="Search assets..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 10, color: '#1A1F36', width: 110 }} />
                </div>
                {[['Columns', Columns], ['Export', Download]].map(([label, Icon]) => (
                  <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 10px', color: '#6B7280', fontSize: 10, cursor: 'pointer' }}>
                    <Icon size={10} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1 }}>
                  <tr>
                    {['Asset Name','Type','Vendor','Model','Serial Number','Status','Power (kW)','U Position','Lifecycle Stage','EOL Date'].map(h => (
                      <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 9, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${BORD}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rackAssets.map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? 'transparent' : '#F8FAFC' }}>
                      <td style={{ padding: '6px 12px', color: '#1A1F36', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.name}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{a.type}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{a.vendor}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{a.model}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', fontFamily: 'monospace', fontSize: 9, whiteSpace: 'nowrap' }}>{a.serialNumber}</td>
                      <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: (a.status === 'Operational' ? '#22c55e' : '#ef4444') + '22', color: a.status === 'Operational' ? '#22c55e' : '#ef4444' }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', textAlign: 'right' }}>{a.powerKw}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', fontFamily: 'monospace', fontSize: 9, whiteSpace: 'nowrap' }}>{a.uPosition}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{a.lifecycleStage}</td>
                      <td style={{ padding: '6px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{a.eolDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '5px 12px', fontSize: 9, color: '#9CA3AF' }}>
                Showing 1 to {rackAssets.length} of {rackAssets.length} assets
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
