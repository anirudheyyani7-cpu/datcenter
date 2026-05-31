'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import {
  X, RefreshCw, Layers, Globe, TrendingUp,
  BookOpen, Activity, Clock, Sparkles, ChevronRight,
  Database, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';

const TYPE_CONFIG = {
  client:  { color: '#00338D', bg: '#EBF5FF', label: 'Client' },
  concept: { color: '#0E7490', bg: '#ECFEFF', label: 'Concept' },
  market:  { color: '#059669', bg: '#ECFDF5', label: 'Market' },
  pattern: { color: '#D97706', bg: '#FFFBEB', label: 'Pattern' },
  meta:    { color: '#6B7280', bg: '#F9FAFB', label: 'Meta' },
  index:   { color: '#7C3AED', bg: '#F5F3FF', label: 'Index' },
};

function typeColor(type) { return TYPE_CONFIG[type]?.color || '#9CA3AF'; }
function typeBg(type)    { return TYPE_CONFIG[type]?.bg    || '#F4F6F9'; }

function NodePanel({ node, onClose }) {
  const tc = TYPE_CONFIG[node.type] || TYPE_CONFIG.concept;
  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 w-80 h-full bg-white border-l border-[#E2E8F0] flex flex-col z-10 overflow-hidden"
    >
      <div className="p-4 border-b border-[#E2E8F0] flex-shrink-0" style={{ background: `${tc.color}08` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tc.color }}>{tc.label}</span>
            <p className="font-extrabold text-[#1A1F36] text-sm leading-tight mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{node.label}</p>
            {node.client && <p className="text-[10px] text-[#9CA3AF] mt-0.5">Client: {node.client}</p>}
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-lg hover:bg-[#F4F6F9] flex items-center justify-center flex-shrink-0 transition-colors">
            <X size={13} className="text-[#9CA3AF]" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {node.updated && <span className="flex items-center gap-1 text-[9px] text-[#9CA3AF]"><Clock size={9} /> {node.updated}</span>}
          {node.source && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${tc.color}15`, color: tc.color }}>{node.source}</span>}
        </div>
      </div>
      {node.tags?.length > 0 && (
        <div className="px-4 py-2.5 border-b border-[#F4F6F9] flex-shrink-0 flex flex-wrap gap-1">
          {node.tags.map(t => <span key={t} className="text-[9px] px-2 py-0.5 bg-[#F4F6F9] text-[#6B7280] rounded-full">{t}</span>)}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">Preview</p>
        <div className="text-[11px] text-[#374151] leading-relaxed bg-[#F8FAFD] rounded-xl p-3 font-mono whitespace-pre-wrap break-words">
          {node.preview || 'No preview available'}...
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4F6F9]">
          <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
            <span>{node.wordCount} words</span>
            <span className="font-mono text-[9px] break-all">{node.relPath}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ForceGraph({ nodes, edges, selectedNode, onSelectNode }) {
  const svgRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const el = svgRef.current;
    const W = el.clientWidth || 800;
    const H = el.clientHeight || 600;
    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).attr('width', W).attr('height', H);
    const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);
    zoomRef.current = zoom;
    const g = svg.append('g');

    svg.append('defs').selectAll('marker').data(['arrow']).join('marker')
      .attr('id', 'arrow').attr('viewBox', '0 -4 8 8').attr('refX', 14).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', '#CBD5E1');

    const simNodes = nodes.map(n => ({ ...n }));
    const nodeById = Object.fromEntries(simNodes.map(n => [n.id, n]));
    const simEdges = edges
      .filter(e => nodeById[e.source] && nodeById[e.target])
      .map(e => ({ ...e, source: nodeById[e.source], target: nodeById[e.target] }));

    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simEdges).id(d => d.id).distance(d => 80 + d.source.size * 5).strength(0.4))
      .force('charge', d3.forceManyBody().strength(d => -120 - d.size * 10))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 8));

    const link = g.append('g').selectAll('line').data(simEdges).join('line')
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1).attr('marker-end', 'url(#arrow)');

    const node = g.append('g').selectAll('g').data(simNodes).join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on('click', (event, d) => { event.stopPropagation(); onSelectNode(d); });

    const defs = svg.select('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => typeBg(d.type))
      .attr('stroke', d => typeColor(d.type))
      .attr('stroke-width', d => selectedNode?.id === d.id ? 3 : 1.5)
      .attr('filter', d => selectedNode?.id === d.id ? 'url(#glow)' : null);

    node.append('circle').attr('r', d => Math.max(3, d.size * 0.35)).attr('fill', d => typeColor(d.type));

    node.append('text')
      .attr('dy', d => d.size + 12).attr('text-anchor', 'middle')
      .attr('font-size', d => Math.max(8, Math.min(11, d.size * 0.9)))
      .attr('fill', '#374151').attr('font-family', 'Arial, sans-serif').attr('font-weight', '600')
      .text(d => d.label.length > 20 ? d.label.slice(0, 18) + '…' : d.label);

    node.append('title').text(d => `${d.label}\n${d.type} · ${d.wordCount} words\n${d.relPath}`);

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    svg.on('click', () => onSelectNode(null));

    setTimeout(() => {
      const bounds = g.node().getBBox();
      if (bounds.width && bounds.height) {
        const scale = Math.min(0.9, Math.min(W / bounds.width, H / bounds.height) * 0.8);
        const tx = W / 2 - scale * (bounds.x + bounds.width / 2);
        const ty = H / 2 - scale * (bounds.y + bounds.height / 2);
        svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      }
    }, 800);

    return () => sim.stop();
  }, [nodes, edges]);

  const zoomBy = (factor) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };
  const zoomFit = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full bg-[#FAFBFD]" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {[
          { icon: ZoomIn,    action: () => zoomBy(1.3),  tip: 'Zoom in' },
          { icon: ZoomOut,   action: () => zoomBy(0.77), tip: 'Zoom out' },
          { icon: Maximize2, action: zoomFit,             tip: 'Reset view' },
        ].map(({ icon: Icon, action, tip }) => (
          <button key={tip} onClick={action} title={tip}
            className="w-8 h-8 bg-white border border-[#E2E8F0] rounded-lg shadow-sm flex items-center justify-center hover:bg-[#F4F6F9] transition-colors">
            <Icon size={13} className="text-[#6B7280]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-[#EBF5FF] flex items-center justify-center">
        <Database size={32} className="text-[#0077C8]" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-[#1A1F36] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Wiki is Empty</p>
        <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed">
          Complete a lifecycle stage, upload a document, or run a client cockpit assessment — the wiki will automatically populate with extracted knowledge.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-left max-w-xs">
        {[
          { label: 'Complete Stage 01', desc: 'Strategy analysis → client + market nodes' },
          { label: 'Upload a Document', desc: 'PDF/DOCX → concept + insight nodes' },
          { label: 'Run Client Cockpit', desc: 'Brief → full client profile node' },
          { label: 'Use Guide Bot',      desc: 'Complex query → pattern nodes' },
        ].map(({ label, desc }) => (
          <div key={label} className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
            <p className="text-[11px] font-bold text-[#00338D] mb-0.5">{label}</p>
            <p className="text-[9px] text-[#9CA3AF]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], stats: {}, recentFiles: [], empty: true });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const pollRef = useRef(null);

  const fetchGraph = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/wiki/graph');
      const data = await res.json();
      setGraphData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Wiki Graph]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(); }, []);

  useEffect(() => {
    if (!isLive) { clearInterval(pollRef.current); return; }
    pollRef.current = setInterval(() => fetchGraph(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [isLive, fetchGraph]);

  const { nodes, edges, stats, recentFiles, empty } = graphData;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFD] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F4F6F9] transition-colors">
            <X size={15} className="text-[#6B7280]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#1A1F36] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Knowledge Graph
              </span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isLive ? 'bg-green-50 text-green-600' : 'bg-[#F4F6F9] text-[#9CA3AF]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-[#CBD5E1]'}`} />
                {isLive ? 'Live' : 'Paused'}
              </div>
            </div>
            <p className="text-[10px] text-[#9CA3AF]">
              K-Nexus Knowledge Wiki{lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            {[
              { label: 'Nodes',   value: nodes.length,      color: '#00338D' },
              { label: 'Edges',   value: edges.length,      color: '#0077C8' },
              { label: 'Clients', value: stats.clients || 0, color: '#059669' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F6F9] rounded-lg">
                <span className="text-sm font-black" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[9px] text-[#9CA3AF]">{s.label}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setIsLive(l => !l)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${isLive ? 'border-green-200 bg-green-50 text-green-700' : 'border-[#E2E8F0] bg-white text-[#6B7280]'}`}>
            <Activity size={12} />{isLive ? 'Pause Live' : 'Resume Live'}
          </button>
          <button onClick={() => fetchGraph()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] bg-white text-[#6B7280] text-[11px] font-semibold rounded-lg hover:bg-[#F4F6F9] transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar */}
        <div className="w-52 flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#F4F6F9]">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Node Types</p>
            <div className="space-y-2">
              {Object.entries(TYPE_CONFIG).filter(([t]) => t !== 'meta' && t !== 'index').map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <div>
                    <p className="text-[10px] font-semibold text-[#374151]">{cfg.label}</p>
                    <p className="text-[8px] text-[#9CA3AF]">{stats[type + 's'] || 0} files</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Recent</p>
            {recentFiles.length === 0 ? (
              <p className="text-[10px] text-[#CBD5E1] italic">Nothing yet</p>
            ) : (
              <div className="space-y-1.5">
                {recentFiles.map(f => (
                  <button key={f.id} onClick={() => setSelectedNode(nodes.find(n => n.id === f.id) || null)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F4F6F9] transition-colors group">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeColor(f.type) }} />
                      <p className="text-[10px] font-semibold text-[#374151] group-hover:text-[#00338D] transition-colors truncate">{f.label}</p>
                    </div>
                    <p className="text-[8px] text-[#CBD5E1] pl-3.5">{f.updated}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main graph area */}
        <div className="flex-1 relative overflow-hidden">
          {loading && nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#EBF5FF] flex items-center justify-center">
                    <Sparkles size={24} className="text-[#0077C8]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-t-[#0077C8] border-[#E2E8F0] rounded-full animate-spin" />
                </div>
                <p className="text-sm font-semibold text-[#6B7280]">Loading knowledge graph...</p>
              </div>
            </div>
          ) : empty ? (
            <EmptyState />
          ) : (
            <ForceGraph nodes={nodes} edges={edges} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
          )}
          <AnimatePresence>
            {selectedNode && <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}