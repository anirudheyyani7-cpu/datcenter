'use client';

import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Globe, Building2, Layers, Server, ChevronRight, ChevronDown, ChevronUp,
  Search, Home, Filter, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
  Calendar, X, Box, Activity, BarChart2, Plus, History, ExternalLink,
  Columns, LayoutGrid, RefreshCw, Cpu, FileText, FileSpreadsheet, ClipboardList, Share2,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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
import ZoomPanViewport     from '@/components/eai/widgets/ZoomPanViewport';
import FilterPopover       from '@/components/eai/widgets/FilterPopover';
import DetailDrawer, { DrawerTable, DrawerStatRow } from '@/components/eai/widgets/DetailDrawer';
import { useToast }        from '@/components/eai/widgets/Toast';

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
const MIN_ZOOM = 0.5, MAX_ZOOM = 3;
const NODE_TYPES = ['region', 'campus', 'building', 'floor', 'room', 'rack'];
const STATUS_OPTIONS = ['operational', 'maintenance', 'critical'];

const ASSET_COLUMNS = [
  { key: 'name',           label: 'Asset Name',      sortKey: 'name' },
  { key: 'type',           label: 'Type',             sortKey: 'type' },
  { key: 'vendor',         label: 'Vendor',           sortKey: 'vendor' },
  { key: 'model',          label: 'Model',            sortKey: 'model' },
  { key: 'serialNumber',   label: 'Serial Number' },
  { key: 'status',         label: 'Status',           sortKey: 'status' },
  { key: 'powerKw',        label: 'Power (kW)',       sortKey: 'powerKw' },
  { key: 'uPosition',      label: 'U Position',       sortKey: 'uStart' },
  { key: 'lifecycleStage', label: 'Lifecycle Stage',  sortKey: 'lifecycleStage' },
  { key: 'eolDate',        label: 'EOL Date' },
];

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

// Walks down from any node via its first child at each level until it reaches
// a datacenter-floor room, then returns that room's first rack (raw rack id).
function drillToDefaultRack(startId) {
  let cur = RE_NODES[startId];
  if (!cur) return { nodeId: startId, rackId: null, dcId: null };
  while (cur && ['region', 'campus', 'building', 'floor'].includes(cur.type)) {
    let next;
    if (cur.type === 'floor') {
      next = (cur.children || []).map(id => RE_NODES[id]).find(c => c?.roomType === 'datacenter-floor');
    } else {
      next = (cur.children || []).map(id => RE_NODES[id]).find(Boolean);
    }
    if (!next) break;
    cur = next;
  }
  if (cur && cur.type === 'room' && cur.roomType === 'datacenter-floor') {
    const racks = getRackNodesForRoom(cur.id);
    if (racks.length) return { nodeId: cur.id, rackId: racks[0].rackRef, dcId: cur.dcId };
  }
  return { nodeId: cur?.id ?? startId, rackId: null, dcId: null };
}

function subtreeMatches(id, predicate) {
  if (predicate(id)) return true;
  return getDescendants(id).some(predicate);
}

// ── deterministic synthesis helpers ───────────────────────────────────────────
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function synthTrend(seedStr, base, points = 8) {
  const h = hashStr(seedStr);
  return Array.from({ length: points }, (_, i) => {
    const n = Math.sin(h * 0.0001 + i * 1.7) * 0.5 + 0.5;
    return +(base * (0.82 + n * 0.36)).toFixed(2);
  }).map((v, i) => ({ i, v }));
}

const MAINT_TYPES = ['Preventive Inspection', 'Filter Replacement', 'Firmware Update', 'Battery Test', 'Cooling Service'];
function synthMaintenanceSchedule(id) {
  const h = hashStr(id);
  const anchor = new Date('2025-05-19');
  const items = Array.from({ length: 6 }, (_, i) => {
    const offset = ((h >> (i * 4)) % 60) - 24 + i * 9;
    const d = new Date(anchor); d.setDate(d.getDate() + offset);
    return {
      id: `${id}-maint-${i}`,
      type: MAINT_TYPES[(h + i * 7) % MAINT_TYPES.length],
      dateObj: d,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: offset < 0 ? 'Completed' : offset < 10 ? 'In Progress' : 'Scheduled',
    };
  });
  return items.sort((a, b) => a.dateObj - b.dateObj);
}

function synthDocs(node) {
  return [
    { id: 'runbook',    label: `${node.name} — Operations Runbook`,            type: 'PDF', updated: 'Mar 2025' },
    { id: 'floorplan',  label: `${node.name} — Floor Plan`,                    type: 'DWG', updated: 'Jan 2025' },
    { id: 'warranty',   label: `${node.name} — Warranty Certificate`,          type: 'PDF', updated: 'Nov 2024' },
    { id: 'compliance', label: `${node.name} — Compliance Cert. (ISO 27001)`,  type: 'PDF', updated: 'Feb 2025' },
  ];
}

function synthCompareDiff(nodeId, sliderVal) {
  const h = hashStr(`${nodeId}-${sliderVal}`);
  const assetsDelta = (h % 9) - 2;
  const kwDelta = +(((h >> 4) % 40) / 10 - 1.5).toFixed(1);
  return { assetsDelta, kwDelta };
}

function buildAssetRollup(nodeId) {
  const node = RE_NODES[nodeId];
  if (!node) return [];
  const roomIds = (node.type === 'room' && node.roomType === 'datacenter-floor')
    ? [nodeId]
    : [nodeId, ...getDescendants(nodeId)].filter(id => RE_NODES[id]?.type === 'room' && RE_NODES[id]?.roomType === 'datacenter-floor');
  const typeMap = {};
  roomIds.forEach(roomId => {
    getRackNodesForRoom(roomId).forEach(rackNode => {
      generateRackAssets(rackNode.rack.label, rackNode.dcId).forEach(a => {
        if (!typeMap[a.type]) typeMap[a.type] = { type: a.type, count: 0, powerKw: 0, color: a.color };
        typeMap[a.type].count += 1;
        typeMap[a.type].powerKw += a.powerKw;
      });
    });
  });
  return Object.values(typeMap).sort((a, b) => b.count - a.count);
}

// ── export helpers ────────────────────────────────────────────────────────────
async function exportWorkbook(sheets, filename) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}

async function exportCsv(rows, filename) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportPanelPdf(el, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
  const imgData = canvas.toDataURL('image/png');
  const pxToMm = 0.264583 / 2;
  const w = canvas.width * pxToMm;
  const h = canvas.height * pxToMm;
  const doc = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'mm', format: [w, h] });
  doc.addImage(imgData, 'PNG', 0, 0, w, h);
  doc.save(filename);
}

// ── TreeNode ──────────────────────────────────────────────────────────────────
function TreeNode({ nodeId, depth, query, filterPredicate, selected, expanded, onSelect, onToggle, onDoubleSelect }) {
  const node = RE_NODES[nodeId];
  if (!node) return null;

  if (query && !subtreeMatches(nodeId, id => RE_NODES[id]?.name.toLowerCase().includes(query))) return null;
  if (filterPredicate && !subtreeMatches(nodeId, filterPredicate)) return null;

  const expandable = ['region', 'campus', 'building'].includes(node.type);
  const isOpen = expanded.has(nodeId);
  const isSel  = selected === nodeId;
  const Icon   = NODE_ICONS[node.type] || Box;
  const sc     = S_COLOR[node.status] || '#22c55e';
  const dimmed = filterPredicate ? !filterPredicate(nodeId) : false;

  return (
    <div>
      <div
        onClick={() => { onSelect(nodeId); if (expandable) onToggle(nodeId); }}
        onDoubleClick={() => onDoubleSelect?.(nodeId)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: `4px 6px 4px ${depth * 10 + 6}px`,
          borderRadius: 6, cursor: 'pointer', marginBottom: 1,
          background:   isSel ? 'rgba(124,58,237,0.22)' : 'transparent',
          borderLeft:   isSel ? '2px solid #7C3AED' : '2px solid transparent',
          opacity:      dimmed ? 0.4 : 1,
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
              query={query} filterPredicate={filterPredicate} selected={selected} expanded={expanded}
              onSelect={onSelect} onToggle={onToggle} onDoubleSelect={onDoubleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── small local UI helpers ─────────────────────────────────────────────────────
function MiniTrend({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={34}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Field({ label, val, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${BORD}` }}>
      <span style={{ fontSize: 10, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: color || '#1A1F36' }}>{val}</span>
    </div>
  );
}

function WorkOrderForm({ contextLabel, onSubmit }) {
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const valid = description.trim().length > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px' }}>
        <p style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Context</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{contextLabel}</p>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</span>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ fontSize: 11, padding: '8px 10px', border: `1px solid ${BORD}`, borderRadius: 8, color: '#1A1F36' }}>
          {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</span>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ fontSize: 11, padding: '8px 10px', border: `1px solid ${BORD}`, borderRadius: 8, color: '#1A1F36', resize: 'vertical' }} />
      </label>
      <button
        type="button" disabled={!valid} onClick={() => onSubmit({ priority, description: description.trim() })}
        className="eai-focusable"
        style={{ padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: valid ? 'pointer' : 'default', background: valid ? '#7C3AED' : '#E2E8F0', color: valid ? '#fff' : '#9CA3AF' }}
      >Create Work Order</button>
    </div>
  );
}

// ── Details content ───────────────────────────────────────────────────────────
function DetailsContent({ tab, nodeId, rackId, dcId, onOpenMaintDrawer, onOpenDoc }) {
  const node = RE_NODES[nodeId];
  const rackObj = useMemo(() => {
    if (!rackId || !dcId) return null;
    return (mockRacks[dcId] || generateDCRacks(dcId)).find(r => r.id === rackId) || null;
  }, [rackId, dcId]);

  const assets = useMemo(() => {
    if (!rackObj) return [];
    return generateRackAssets(rackObj.label, dcId);
  }, [rackObj, dcId]);

  const rollup = useMemo(() => (tab === 'Assets' && !rackObj ? buildAssetRollup(nodeId) : []), [tab, rackObj, nodeId]);
  const maintenance = useMemo(() => (tab === 'Maintenance' ? synthMaintenanceSchedule(rackObj ? rackObj.id : nodeId) : []), [tab, rackObj, nodeId]);
  const docs = useMemo(() => (tab === 'Docs' && node ? synthDocs(node) : []), [tab, node]);

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

  if (tab === 'Assets') {
    if (rackObj) {
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
    // Non-rack node: aggregated rollup of descendant assets by type
    const totalCount = rollup.reduce((s, r) => s + r.count, 0);
    return (
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 8 }}>
          {totalCount.toLocaleString()} assets across {node?.name}
        </div>
        {rollup.map(r => (
          <div key={r.type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${BORD}` }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 10, color: '#1A1F36' }}>{r.type}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', fontFamily: 'ui-monospace,monospace' }}>{r.count}</span>
            <span style={{ fontSize: 9, color: '#6B7280', width: 52, textAlign: 'right' }}>{r.powerKw.toFixed(1)} kW</span>
          </div>
        ))}
        {rollup.length === 0 && <div style={{ fontSize: 10, color: '#9CA3AF' }}>No datacenter floors under this node.</div>}
      </div>
    );
  }

  if (tab === 'Metrics') {
    const kpis = buildKpiCards(nodeId);
    const powerBase = kpis.find(k => k.key === 'it')?.value ?? 1;
    const tempBase = kpis.find(k => k.key === 'temp')?.value ?? 22;
    return (
      <div style={{ padding: '10px 14px' }}>
        {kpis.slice(0, 5).map(k => (
          <div key={k.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${BORD}` }}>
            <span style={{ fontSize: 10, color: '#6B7280' }}>{k.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36' }}>{k.value}{k.unit}</span>
          </div>
        ))}
        <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 4px' }}>Power Trend (IT MW)</p>
        <MiniTrend data={synthTrend(`${nodeId}-power`, +powerBase)} color="#7C3AED" />
        <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '10px 0 4px' }}>Temperature Trend (°C)</p>
        <MiniTrend data={synthTrend(`${nodeId}-temp`, +tempBase)} color="#38BDF8" />
      </div>
    );
  }

  if (tab === 'Maintenance') {
    return (
      <div style={{ padding: '10px 14px' }}>
        {maintenance.map(m => (
          <button
            key={m.id} type="button" onClick={() => onOpenMaintDrawer?.(m)}
            className="eai-focusable"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
              padding: '7px 4px', margin: '0 -4px', borderRadius: 6, border: 'none', background: 'transparent',
              borderBottom: `1px solid ${BORD}`, cursor: 'pointer', font: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: m.status === 'Completed' ? '#22c55e' : m.status === 'In Progress' ? '#f97316' : '#9CA3AF',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36' }}>{m.type}</div>
              <div style={{ fontSize: 9, color: '#6B7280' }}>{m.date}</div>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, color: '#6B7280', background: '#F4F6F9' }}>{m.status}</span>
          </button>
        ))}
      </div>
    );
  }

  if (tab === 'Docs') {
    return (
      <div style={{ padding: '10px 14px' }}>
        {docs.map(d => (
          <button
            key={d.id} type="button" onClick={() => onOpenDoc?.(d)}
            className="eai-focusable"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
              padding: '7px 4px', margin: '0 -4px', borderRadius: 6, border: 'none', background: 'transparent',
              borderBottom: `1px solid ${BORD}`, cursor: 'pointer', font: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(0,119,200,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={11} style={{ color: '#0077C8' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
              <div style={{ fontSize: 9, color: '#6B7280' }}>{d.type} · Updated {d.updated}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return null;
}

// ── page (inner — uses useSearchParams, must be wrapped in Suspense) ─────────
function RealEstateExplorerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast, ToastHost } = useToast();
  const vizPanelRef = useRef(null);

  const initialNodeId = searchParams.get('node') || DEFAULT_ID;
  const initialFocus = searchParams.get('focus');
  const initialTabParam = searchParams.get('tab');

  const [selectedId,  setSelectedIdState] = useState(RE_NODES[initialNodeId] ? initialNodeId : DEFAULT_ID);
  const [rackId,      setRackId]      = useState(() => searchParams.get('rack') || null);
  const [rackDcId,    setRackDcId]    = useState(() => (searchParams.get('rack') ? getDcIdForNode(RE_NODES[initialNodeId] ? initialNodeId : DEFAULT_ID) : null));
  const [view,        setViewState]   = useState(() => (searchParams.get('view') === '3d' ? '3d' : '2d'));
  const [expanded,    setExpanded]    = useState(() => {
    const next = new Set(INIT_EXPAND);
    getAncestors(RE_NODES[initialNodeId] ? initialNodeId : DEFAULT_ID).forEach(a => next.add(a));
    return next;
  });
  const [searchQ,     setSearchQ]     = useState('');
  const [detailTab,   setDetailTabState] = useState(() => (
    initialTabParam && DETAIL_TABS.includes(initialTabParam) ? initialTabParam : (initialFocus === 'capacity' ? 'Metrics' : 'Overview')
  ));
  const [sliderVal,   setSliderVal]   = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [refreshing,  setRefreshing]  = useState(false);

  // Pan/zoom (2D views only)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ status: [], nodeType: [], region: [] });
  const [powerUtilMin, setPowerUtilMin] = useState(0);

  // Actions menu
  const [actionsOpen, setActionsOpen] = useState(false);

  // Bottom table
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(() => Object.fromEntries(ASSET_COLUMNS.map(c => [c.key, true])));
  const [tableSort, setTableSort] = useState(null);
  const [selectedAssetRowId, setSelectedAssetRowId] = useState(null);

  const [drawer, setDrawer] = useState(null);

  const updateURL = useCallback((patch) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const node     = RE_NODES[selectedId];
  const nodeType = node?.type ?? 'floor';
  const dcId     = getDcIdForNode(selectedId);

  const toggleExpand = useCallback(id => setExpanded(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  }), []);

  const selectNode = useCallback(id => {
    setSelectedIdState(id); setRackId(null); setRackDcId(null); setDetailTabState('Overview');
    setZoom(1); setOffset({ x: 0, y: 0 });
    setExpanded(prev => { const next = new Set(prev); getAncestors(id).forEach(a => next.add(a)); return next; });
    updateURL({ node: id === DEFAULT_ID ? undefined : id, rack: undefined, tab: undefined, focus: undefined });
  }, [updateURL]);

  const selectRack = useCallback((rid, did) => {
    setRackId(rid); setRackDcId(did); setDetailTabState('Overview'); setSelectedAssetRowId(null);
    updateURL({ rack: rid, tab: undefined });
  }, [updateURL]);

  const selectAndDrill = useCallback(startId => {
    const result = drillToDefaultRack(startId);
    selectNode(result.nodeId);
    if (result.rackId && result.dcId) selectRack(result.rackId, result.dcId);
  }, [selectNode, selectRack]);

  function changeView(v) { setViewState(v); setZoom(1); setOffset({ x: 0, y: 0 }); updateURL({ view: v === '2d' ? undefined : v }); }
  function changeTab(t) { setDetailTabState(t); updateURL({ tab: t === 'Overview' ? undefined : t }); }
  function openDrawer(kind, payload) { setDrawer({ kind, payload }); }
  function closeDrawer() { setDrawer(null); }

  const kpiCards = useMemo(() => buildKpiCards(selectedId), [selectedId]);

  const breadcrumb = useMemo(() => (
    [...getAncestors(selectedId), selectedId].map(id => RE_NODES[id]).filter(Boolean)
  ), [selectedId]);

  const displayDate = useMemo(() => {
    const d = new Date(2025, 4, 19);
    d.setDate(d.getDate() - sliderVal);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [sliderVal]);

  const compareDiff = useMemo(() => synthCompareDiff(selectedId, sliderVal), [selectedId, sliderVal]);

  const rackObj = useMemo(() => {
    if (!rackId || !rackDcId) return null;
    return (mockRacks[rackDcId] || generateDCRacks(rackDcId)).find(r => r.id === rackId) || null;
  }, [rackId, rackDcId]);

  const rackAssetsAll = useMemo(() => {
    if (!rackObj) return [];
    return generateRackAssets(rackObj.label, rackDcId);
  }, [rackObj, rackDcId]);

  const rackAssets = useMemo(() => rackAssetsAll.filter(a =>
    !assetSearch || a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.type.toLowerCase().includes(assetSearch.toLowerCase())
  ), [rackAssetsAll, assetSearch]);

  const sortedRackAssets = useMemo(() => {
    if (!tableSort) return rackAssets;
    const col = ASSET_COLUMNS.find(c => c.sortKey === tableSort.key);
    const field = col?.sortKey ?? tableSort.key;
    const mult = tableSort.dir === 'asc' ? 1 : -1;
    return [...rackAssets].sort((a, b) => {
      const av = a[field], bv = b[field];
      if (typeof av === 'number') return (av - bv) * mult;
      return String(av).localeCompare(String(bv)) * mult;
    });
  }, [rackAssets, tableSort]);

  function handleSort(key) {
    setTableSort(prev => (prev && prev.key === key) ? (prev.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  const REGION_OPTIONS = useMemo(() => ROOT_IDS.map(id => RE_NODES[id].name), []);
  const filtersActive = filters.status.length > 0 || filters.nodeType.length > 0 || filters.region.length > 0 || powerUtilMin > 0;
  const activeFilterCount = filters.status.length + filters.nodeType.length + filters.region.length + (powerUtilMin > 0 ? 1 : 0);

  function nodeMatchesFilters(id) {
    const n = RE_NODES[id];
    if (!n) return true;
    if (filters.status.length && !filters.status.includes(n.status)) return false;
    if (filters.nodeType.length && !filters.nodeType.includes(n.type)) return false;
    if (filters.region.length) {
      const path = getAncestors(id);
      const regionId = path[0] || id;
      if (!filters.region.includes(RE_NODES[regionId]?.name)) return false;
    }
    if (powerUtilMin > 0 && (n.utilizationPct ?? 0) < powerUtilMin) return false;
    return true;
  }

  function rackMatchesFilters(rawRack) {
    if (filters.nodeType.length && !filters.nodeType.includes('rack')) return false;
    const status = rawRack.status === 'warning' ? 'maintenance' : rawRack.status;
    if (filters.status.length && !filters.status.includes(status)) return false;
    if (powerUtilMin > 0 && rawRack.utilPct < powerUtilMin) return false;
    return true;
  }

  function toggleFilter(groupKey, value) {
    setFilters(prev => {
      const cur = prev[groupKey];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...prev, [groupKey]: next };
    });
  }

  function clearAllFilters() {
    setFilters({ status: [], nodeType: [], region: [] });
    setPowerUtilMin(0);
    showToast('Filters cleared', 'info');
  }

  const FILTER_GROUPS = [
    { key: 'status',   label: 'Status',        options: STATUS_OPTIONS },
    { key: 'nodeType', label: 'Node Type',     options: NODE_TYPES },
    { key: 'region',   label: 'Region',        options: REGION_OPTIONS },
  ];
  const filterSelected = { status: filters.status, nodeType: filters.nodeType, region: filters.region };
  const filterExtra = (
    <div style={{ padding: '10px 12px' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        Min Power Utilization: {powerUtilMin}%+
      </p>
      <input type="range" min="0" max="95" step="5" value={powerUtilMin}
        onChange={e => setPowerUtilMin(+e.target.value)}
        style={{ width: '100%', accentColor: '#7C3AED' }} />
    </div>
  );

  // ── Refresh ────────────────────────────────────────────────────────────────
  function handleRefresh() {
    setRefreshing(true);
    setExpanded(new Set(INIT_EXPAND));
    setSearchQ('');
    clearAllFiltersSilent();
    showToast('Hierarchy refreshed', 'info');
    setTimeout(() => setRefreshing(false), 650);
  }
  function clearAllFiltersSilent() { setFilters({ status: [], nodeType: [], region: [] }); setPowerUtilMin(0); }

  // ── Zoom / pan ─────────────────────────────────────────────────────────────
  const use2DZoom = view === '2d' && !rackId;

  function zoomBy(delta, focal, rect) {
    setZoom(prevZoom => {
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(prevZoom + delta).toFixed(2)));
      if (focal && rect) {
        const cx = focal.x - rect.left - rect.width / 2;
        const cy = focal.y - rect.top - rect.height / 2;
        setOffset(prevOffset => ({
          x: cx - (cx - prevOffset.x) * (nextZoom / prevZoom),
          y: cy - (cy - prevOffset.y) * (nextZoom / prevZoom),
        }));
      }
      return nextZoom;
    });
  }
  function resetViewport() { setZoom(1); setOffset({ x: 0, y: 0 }); }

  function handleMinimapClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width - 0.5;
    const fy = (e.clientY - rect.top) / rect.height - 0.5;
    const contentRect = vizPanelRef.current?.getBoundingClientRect();
    setOffset({ x: -fx * (contentRect?.width ?? 300), y: -fy * (contentRect?.height ?? 200) });
  }

  // ── Work order / export / share ──────────────────────────────────────────
  const contextLabel = rackObj ? `Rack ${rackObj.label} — ${node?.name ?? ''}` : (node?.name ?? 'this node');

  function submitWorkOrder(data) {
    showToast(`Work order created for ${contextLabel} (${data.priority} priority)`, 'success');
    closeDrawer();
  }

  async function handleActionsExport(kind) {
    setActionsOpen(false);
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      if (kind === 'pdf') {
        if (!vizPanelRef.current) return;
        await exportPanelPdf(vizPanelRef.current, `re-explorer-${selectedId}-${dateStr}.pdf`);
        showToast('View exported as PDF', 'success');
        return;
      }
      let rows, label;
      if (rackObj) {
        rows = rackAssetsAll.map(a => ({
          'Asset Name': a.name, Type: a.type, Vendor: a.vendor, Model: a.model,
          'Serial Number': a.serialNumber, Status: a.status, 'Power (kW)': a.powerKw,
          'U Position': a.uPosition, 'Lifecycle Stage': a.lifecycleStage, 'EOL Date': a.eolDate,
        }));
        label = `rack-${rackObj.label}`;
      } else {
        rows = kpiCards.map(k => ({ Metric: k.label, Value: `${k.value}${k.unit}`, Sublabel: k.sublabel }));
        label = `node-${selectedId}`;
      }
      await exportWorkbook([{ name: 'Data', rows }], `re-explorer-${label}-${dateStr}.xlsx`);
      showToast(`Exported ${rows.length} rows`, 'success');
    } catch {
      showToast('Export failed — please try again', 'error');
    }
  }

  function handleShareView() {
    setActionsOpen(false);
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Deep-link copied to clipboard', 'success');
    }
  }

  // ── Bottom table export ──────────────────────────────────────────────────
  async function handleTableExport(kind) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const cols = ASSET_COLUMNS.filter(c => visibleCols[c.key]);
    const rows = sortedRackAssets.map(a => Object.fromEntries(cols.map(c => [c.label, a[c.key]])));
    try {
      if (kind === 'xlsx') await exportWorkbook([{ name: `Rack ${rackObj?.label ?? ''}`, rows }], `rack-${rackObj?.label}-assets-${dateStr}.xlsx`);
      else await exportCsv(rows, `rack-${rackObj?.label}-assets-${dateStr}.csv`);
      showToast(`${kind.toUpperCase()} exported (${rows.length} assets)`, 'success');
    } catch {
      showToast('Export failed — please try again', 'error');
    }
  }

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
      return <RackElevationView rackId={rackId} dcId={rackDcId} selectedAssetId={selectedAssetRowId} onSelectAsset={id => setSelectedAssetRowId(id)} />;
    }

    if (nodeType === 'region' || nodeType === 'campus') {
      const buildings = nodeType === 'campus'
        ? (node?.children || []).map(id => RE_NODES[id]).filter(Boolean)
        : (node?.children || []).flatMap(cid => (RE_NODES[cid]?.children || []).map(bid => RE_NODES[bid]).filter(Boolean));
      const dimIds = filtersActive ? new Set(buildings.filter(b => !subtreeMatches(b.id, nodeMatchesFilters)).map(b => b.id)) : undefined;
      return <CampusSitePlan buildings={buildings} selectedId={null} onSelect={id => selectNode(id)} onDoubleSelect={id => selectAndDrill(id)} dimIds={dimIds} />;
    }

    if (nodeType === 'building') {
      const floors = (node?.children || []).map(id => RE_NODES[id]).filter(Boolean);
      const dimIds = filtersActive ? new Set(floors.filter(f => !subtreeMatches(f.id, nodeMatchesFilters)).map(f => f.id)) : undefined;
      return <BuildingFloorStack floors={floors} selectedId={null} onSelect={id => selectNode(id)} onDoubleSelect={id => selectAndDrill(id)} dimIds={dimIds} />;
    }

    // floor or room
    let dimRackIds;
    if (filtersActive) {
      const allRacks = mockRacks[dcId || 'sgp-1'] || generateDCRacks(dcId || 'sgp-1');
      dimRackIds = new Set(allRacks.filter(r => !rackMatchesFilters(r)).map(r => r.id));
    }
    return (
      <FloorRoomSchematic
        dcId={dcId || 'sgp-1'}
        selectedRackId={rackId}
        onSelectRack={rid => selectRack(rid, dcId || 'sgp-1')}
        dimRackIds={dimRackIds}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedId, nodeType, node, dcId, rackId, rackDcId, selectedAssetRowId, filters, powerUtilMin]);

  // ── drawer content ──────────────────────────────────────────────────────
  function renderDrawer() {
    if (!drawer) return <DetailDrawer open={false} onClose={closeDrawer} />;
    const { kind, payload } = drawer;

    if (kind === 'work-order') {
      return (
        <DetailDrawer open title="Create Work Order" subtitle={contextLabel} icon={<Plus size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <WorkOrderForm contextLabel={contextLabel} onSubmit={submitWorkOrder} />
        </DetailDrawer>
      );
    }

    if (kind === 'maintenance') {
      const m = payload;
      return (
        <DetailDrawer open title={m.type} subtitle={contextLabel} icon={<Cpu size={16} color="#F59E0B" />} accentColor="#F59E0B" onClose={closeDrawer}
          footer={
            <button onClick={() => openDrawer('work-order', null)} className="eai-focusable" style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: '#0077C8', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Create Follow-up Work Order
            </button>
          }
        >
          <DrawerStatRow items={[
            { label: 'Date', value: m.date },
            { label: 'Status', value: m.status, color: m.status === 'Completed' ? '#22c55e' : m.status === 'In Progress' ? '#f97316' : '#6B7280' },
          ]} />
          <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>
            {m.type} scheduled for {contextLabel}. {m.status === 'Completed' ? 'This work has already been completed.' : m.status === 'In Progress' ? 'This work is currently underway.' : 'This work has not yet started.'}
          </p>
        </DetailDrawer>
      );
    }

    if (kind === 'asset-detail') {
      const a = payload;
      const statusColor = a.status === 'Operational' ? '#22c55e' : a.status === 'Critical' ? '#ef4444' : '#f97316';
      return (
        <DetailDrawer
          open title={a.name} subtitle={`${a.type} · ${a.vendor} ${a.model}`}
          icon={<Server size={16} color={a.color} />} accentColor={a.color} onClose={closeDrawer}
          footer={
            <button onClick={() => router.push('/eai/asset-lifecycle')} className="eai-focusable" style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: `1px solid ${BORD}`, background: '#F8FAFC', color: '#1A1F36', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              View in Asset Lifecycle
            </button>
          }
        >
          <DrawerStatRow items={[
            { label: 'Status', value: a.status, color: statusColor },
            { label: 'Power', value: `${a.powerKw} kW` },
            { label: 'U Position', value: a.uPosition },
          ]} />
          <DrawerTable columns={[{ key: 'field', label: 'Field' }, { key: 'val', label: 'Value', align: 'right' }]} rows={[
            { field: 'Vendor', val: a.vendor },
            { field: 'Model', val: a.model },
            { field: 'Serial Number', val: a.serialNumber },
            { field: 'Lifecycle Stage', val: a.lifecycleStage },
            { field: 'EOL Date', val: a.eolDate },
          ]} keyField="field" />
        </DetailDrawer>
      );
    }

    return <DetailDrawer open={false} onClose={closeDrawer} />;
  }

  const zoomControls = (
    <>
      <button onClick={() => zoomBy(-0.25)} disabled={!use2DZoom} className="eai-focusable" aria-label="Zoom out"
        style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: use2DZoom ? 'pointer' : 'default', opacity: use2DZoom ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        <ZoomOut size={12} />
      </button>
      <button onClick={() => zoomBy(0.25)} disabled={!use2DZoom} className="eai-focusable" aria-label="Zoom in"
        style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: use2DZoom ? 'pointer' : 'default', opacity: use2DZoom ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        <ZoomIn size={12} />
      </button>
      <button onClick={() => setFullscreen(true)} className="eai-focusable" aria-label="Full screen"
        style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        <Maximize2 size={12} />
      </button>
    </>
  );

  const vizContent = use2DZoom
    ? <ZoomPanViewport zoom={zoom} offset={offset} onOffsetChange={setOffset} onWheelZoom={zoomBy}>{centerViz}</ZoomPanViewport>
    : centerViz;

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden', background: BG, color: '#1A1F36' }}>
      <style>{`
        .eai-focusable:focus-visible { outline: 2px solid #0077C8; outline-offset: 2px; border-radius: 4px; }
        @keyframes eaiSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ── LEFT hierarchy panel ──────────────────────────────────────────── */}
      <div style={{ width: 192, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORD}`, overflow: 'hidden', background: '#FFFFFF' }}>

        <div style={{ padding: '10px 10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Hierarchy</span>
          <button onClick={handleRefresh} className="eai-focusable" aria-label="Refresh hierarchy" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2, display: 'flex' }}>
            <RefreshCw size={11} style={{ animation: refreshing ? 'eaiSpin 0.6s linear' : 'none' }} />
          </button>
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
              query={searchQ.toLowerCase()} filterPredicate={filtersActive ? nodeMatchesFilters : null}
              selected={selectedId} expanded={expanded}
              onSelect={selectNode} onToggle={toggleExpand} onDoubleSelect={selectAndDrill} />
          ))}
        </div>

        {/* Quick Access */}
        <div style={{ borderTop: `1px solid ${BORD}`, padding: '8px 8px 4px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Quick Access</div>
          {[
            ['Open in EAM',          ExternalLink, () => showToast(`Opening ${contextLabel} in EAM…`, 'info')],
            ['Create Work Order',     Plus,         () => openDrawer('work-order', null)],
            ['Maintenance History',   History,      () => changeTab('Maintenance')],
            ['View Asset Lifecycle',  Activity,     () => router.push(`/eai/asset-lifecycle?node=${selectedId}`)],
            ['View Supply Chain',     Box,          () => router.push(`/eai/supply-chain?node=${selectedId}`)],
            ['Capacity Planning',     BarChart2,    () => router.push(`/eai/reports-analytics?focus=capacity&node=${selectedId}`)],
          ].map(([label, Icon, run]) => (
            <button key={label} onClick={run} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', borderRadius: 5, color: '#6B7280', fontSize: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
            <button onClick={() => { setSliderVal(0); setCompareMode(false); }} className="eai-focusable" style={{ flex: 1, padding: '4px 0', borderRadius: 6, background: '#F8FAFC', border: `1px solid ${BORD}`, color: '#6B7280', fontSize: 9, cursor: 'pointer' }}>Today</button>
            <button onClick={() => setCompareMode(v => !v)} className="eai-focusable" style={{ flex: 1, padding: '4px 0', borderRadius: 6, background: compareMode ? 'rgba(124,58,237,0.15)' : '#F8FAFC', border: `1px solid ${compareMode ? '#7C3AED' : BORD}`, color: compareMode ? '#7C3AED' : '#6B7280', fontSize: 9, fontWeight: compareMode ? 700 : 400, cursor: 'pointer' }}>Compare</button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: main content ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6B7280' }}>
            <button onClick={() => selectNode('bld-sgp-a-a')} className="eai-focusable" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}>
              <Home size={11} />
            </button>
            {breadcrumb.map((n, i) => (
              <span key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={9} />
                {i === 0 && n.type === 'region' && (
                  <span style={{ fontSize: 9, background: '#F4F6F9', borderRadius: 4, padding: '1px 5px', marginRight: 2 }}>Asia Pacific</span>
                )}
                <button onClick={() => selectNode(n.id)} className="eai-focusable" style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === breadcrumb.length - 1 ? '#1A1F36' : '#6B7280', fontSize: 10, padding: 0 }}>
                  {n.name}
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setFiltersOpen(o => !o); setActionsOpen(false); }} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 5, background: filtersActive ? 'rgba(0,119,200,0.10)' : '#F8FAFC', border: `1px solid ${filtersActive ? 'rgba(0,119,200,0.30)' : BORD}`, borderRadius: 7, padding: '5px 10px', color: filtersActive ? '#0077C8' : '#6B7280', fontSize: 10, cursor: 'pointer' }}>
                <Filter size={11} /> Filters
                {activeFilterCount > 0 && (
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0077C8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>{activeFilterCount}</span>
                )}
              </button>
              <FilterPopover
                open={filtersOpen} onClose={() => setFiltersOpen(false)}
                groups={FILTER_GROUPS} selected={filterSelected} onToggle={toggleFilter} onClear={clearAllFilters}
                extra={filterExtra} width={230}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setActionsOpen(o => !o); setFiltersOpen(false); }} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#7C3AED', border: 'none', borderRadius: 7, padding: '5px 12px', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                <Download size={11} /> Actions <ChevronDown size={9} style={{ transform: actionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {actionsOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400, width: 220, background: '#fff', border: `1px solid ${BORD}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                  {[
                    { key: 'pdf-view', label: 'Export current view (PDF)', Icon: FileText, run: () => handleActionsExport('pdf') },
                    { key: 'assets',   label: 'Export assets (XLSX)',      Icon: FileSpreadsheet, run: () => handleActionsExport('xlsx') },
                    { key: 'wo',       label: 'Create Work Order',         Icon: ClipboardList, run: () => { setActionsOpen(false); openDrawer('work-order', null); } },
                    { key: 'share',    label: 'Share view',                Icon: Share2, run: handleShareView },
                  ].map(({ key, label, Icon, run }) => (
                    <button key={key} type="button" onClick={run} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Icon size={12} style={{ color: '#7C3AED' }} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                    <button key={lt} onClick={() => anc && selectNode(anc)} className="eai-focusable" style={{
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
                {zoomControls}
                {!rackId && (
                  <div style={{ display: 'flex', background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, overflow: 'hidden' }}>
                    {['2d', '3d'].map(v => (
                      <button key={v} onClick={() => changeView(v)} className="eai-focusable" style={{ padding: '4px 12px', fontSize: 10, fontWeight: view === v ? 700 : 400, background: view === v ? '#0077C8' : 'transparent', border: 'none', color: view === v ? '#fff' : '#6B7280', cursor: 'pointer', textTransform: 'uppercase' }}>{v}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Viz area */}
            <div ref={vizPanelRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {vizContent}

              {/* Compare badge */}
              {compareMode && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(26,31,54,0.92)', color: '#fff', borderRadius: 8, padding: '7px 12px', fontSize: 10, boxShadow: '0 4px 12px rgba(16,24,40,0.2)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>As of {displayDate}</div>
                  <div style={{ color: '#CBD5E1' }}>
                    {compareDiff.assetsDelta >= 0 ? '+' : ''}{compareDiff.assetsDelta} assets, {compareDiff.kwDelta >= 0 ? '+' : ''}{compareDiff.kwDelta}kW since
                  </div>
                </div>
              )}

              {/* Minimap */}
              {(nodeType === 'floor' || nodeType === 'room') && !rackId && view === '2d' && (
                <div
                  onClick={handleMinimapClick}
                  style={{ position: 'absolute', bottom: 12, left: 12, width: 80, height: 56, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)', backdropFilter: 'blur(6px)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}
                >
                  <FloorRoomSchematic dcId={dcId || 'sgp-1'} selectedRackId={null} onSelectRack={() => {}} />
                  <div style={{
                    position: 'absolute',
                    width: `${Math.min(100, 100 / zoom)}%`, height: `${Math.min(100, 100 / zoom)}%`,
                    left: `${50 - Math.min(100, 100 / zoom) / 2 - (offset.x / 300) * 100}%`,
                    top: `${50 - Math.min(100, 100 / zoom) / 2 - (offset.y / 200) * 100}%`,
                    border: '1.5px solid #7C3AED', background: 'rgba(124,58,237,0.08)', pointerEvents: 'none',
                  }} />
                </div>
              )}
              <button onClick={resetViewport} className="eai-focusable" aria-label="Reset view" style={{ position: 'absolute', bottom: 12, right: 12, width: 28, height: 28, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)', backdropFilter: 'blur(6px)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1F36' }}>
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Details panel */}
          <div style={{ width: 268, flexShrink: 0, borderLeft: `1px solid ${BORD}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Details</span>
              {rackId && (
                <button onClick={() => { setRackId(null); setRackDcId(null); updateURL({ rack: undefined }); }} className="eai-focusable" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}><X size={12} /></button>
              )}
            </div>
            <div style={{ display: 'flex', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              {DETAIL_TABS.map(t => (
                <button key={t} onClick={() => changeTab(t)} className="eai-focusable" style={{ flex: 1, padding: '7px 0', fontSize: 9, fontWeight: detailTab === t ? 700 : 400, color: detailTab === t ? '#1A1F36' : '#9CA3AF', borderBottom: `2px solid ${detailTab === t ? '#7C3AED' : 'transparent'}`, background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <DetailsContent
                tab={detailTab} nodeId={selectedId} rackId={rackId} dcId={rackDcId}
                onOpenMaintDrawer={m => openDrawer('maintenance', m)}
                onOpenDoc={d => showToast(`Downloading ${d.label}…`, 'info')}
              />
            </div>
            {/* Quick Actions */}
            <div style={{ flexShrink: 0, borderTop: `1px solid ${BORD}`, padding: '10px 14px' }}>
              <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Open in EAM',          color: '#7C3AED', Icon: ExternalLink, run: () => showToast(`Opening ${contextLabel} in EAM…`, 'info') },
                  { label: 'Create Work Order',      color: null,      Icon: Plus,        run: () => openDrawer('work-order', null) },
                  { label: 'View Maintenance',       color: null,      Icon: Cpu,         run: () => changeTab('Maintenance') },
                  { label: 'View Asset Lifecycle',   color: null,      Icon: Activity,    run: () => router.push(`/eai/asset-lifecycle?node=${selectedId}`) },
                  { label: 'View Supply Chain',      color: null,      Icon: Box,         run: () => router.push(`/eai/supply-chain?node=${selectedId}`) },
                  { label: 'Capacity Planning',      color: null,      Icon: BarChart2,   run: () => router.push(`/eai/reports-analytics?focus=capacity&node=${selectedId}`) },
                ].map(({ label, color, Icon, run }) => (
                  <button key={label} onClick={run} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', borderRadius: 7, background: color ? color + '20' : '#F8FAFC', border: `1px solid ${color ? color + '40' : BORD}`, color: color || '#6B7280', fontSize: 9, cursor: 'pointer' }}>
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
                <span style={{ marginLeft: 6, fontSize: 9, background: 'rgba(239,68,68,0.18)', color: '#f87171', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>{sortedRackAssets.length}</span>
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 8px' }}>
                  <Search size={10} style={{ color: '#9CA3AF' }} />
                  <input value={assetSearch} onChange={e => setAssetSearch(e.target.value)} placeholder="Search assets..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 10, color: '#1A1F36', width: 110 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setColumnsOpen(o => !o)} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 10px', color: '#6B7280', fontSize: 10, cursor: 'pointer' }}>
                    <Columns size={10} /> Columns
                  </button>
                  {columnsOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400, width: 190, background: '#fff', border: `1px solid ${BORD}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', padding: '6px 4px', maxHeight: 260, overflowY: 'auto' }}>
                      {ASSET_COLUMNS.map(c => (
                        <button key={c.key} type="button" onClick={() => setVisibleCols(v => ({ ...v, [c.key]: !v[c.key] }))} className="eai-focusable"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '5px 8px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${visibleCols[c.key] ? '#0077C8' : '#CBD5E1'}`, background: visibleCols[c.key] ? '#0077C8' : '#fff', flexShrink: 0 }} />
                          <span style={{ fontSize: 10.5, color: '#1A1F36' }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => handleTableExport('xlsx')} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 10px', color: '#6B7280', fontSize: 10, cursor: 'pointer' }}>
                    <Download size={10} /> Export
                  </button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1 }}>
                  <tr>
                    {ASSET_COLUMNS.filter(c => visibleCols[c.key]).map(c => {
                      const active = tableSort?.key === c.sortKey;
                      return (
                        <th key={c.key} style={{ padding: '6px 12px', textAlign: 'left', borderBottom: `1px solid ${BORD}`, whiteSpace: 'nowrap' }}>
                          {c.sortKey ? (
                            <button type="button" onClick={() => handleSort(c.sortKey)} className="eai-focusable" aria-label={`Sort by ${c.label}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 2, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 9, color: active ? '#0077C8' : '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {c.label}
                              {active ? (tableSort.dir === 'asc' ? <ChevronUp size={9} /> : <ChevronDown size={9} />) : null}
                            </button>
                          ) : (
                            <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedRackAssets.map((a, i) => {
                    const isSel = a.id === selectedAssetRowId;
                    const rowVals = {
                      name: a.name, type: a.type, vendor: a.vendor, model: a.model,
                      serialNumber: a.serialNumber,
                      status: <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: (a.status === 'Operational' ? '#22c55e' : '#ef4444') + '22', color: a.status === 'Operational' ? '#22c55e' : '#ef4444' }}>{a.status}</span>,
                      powerKw: a.powerKw, uPosition: a.uPosition, lifecycleStage: a.lifecycleStage, eolDate: a.eolDate,
                    };
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAssetRowId(a.id)}
                        onDoubleClick={() => openDrawer('asset-detail', a)}
                        style={{ background: isSel ? 'rgba(0,119,200,0.10)' : i % 2 === 0 ? 'transparent' : '#F8FAFC', cursor: 'pointer' }}
                      >
                        {ASSET_COLUMNS.filter(c => visibleCols[c.key]).map(c => (
                          <td key={c.key} style={{ padding: '6px 12px', color: c.key === 'name' ? '#1A1F36' : '#6B7280', fontWeight: c.key === 'name' ? 600 : 400, whiteSpace: 'nowrap', fontFamily: c.key === 'serialNumber' || c.key === 'uPosition' ? 'monospace' : 'inherit', fontSize: c.key === 'serialNumber' || c.key === 'uPosition' ? 9 : 10, textAlign: c.key === 'powerKw' ? 'right' : 'left' }}>
                            {rowVals[c.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: '5px 12px', fontSize: 9, color: '#9CA3AF' }}>
                Showing 1 to {sortedRackAssets.length} of {sortedRackAssets.length} assets
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viz overlay */}
      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2500, background: '#F4F6F9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>{node?.name}{rackObj ? ` — Rack ${rackObj.label}` : ''}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {zoomControls}
              <button onClick={() => setFullscreen(false)} className="eai-focusable" aria-label="Exit full screen" style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <Minimize2 size={12} />
              </button>
              <button onClick={() => setFullscreen(false)} className="eai-focusable" aria-label="Close" style={{ width: 28, height: 28, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                <X size={13} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {vizContent}
          </div>
        </div>
      )}

      {renderDrawer()}
      <ToastHost />
    </div>
  );
}

export default function RealEstateExplorerPage() {
  return (
    <Suspense fallback={
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', color: '#9CA3AF', fontSize: 12 }}>
        Loading…
      </div>
    }>
      <RealEstateExplorerInner />
    </Suspense>
  );
}
