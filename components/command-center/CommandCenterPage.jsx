'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, Server, Cpu, Users, Leaf, Brain,
  AlertTriangle, Wrench, FileText, Settings, Bell, ChevronLeft,
  ChevronRight, Search, Globe, Sparkles, Circle,
} from 'lucide-react';

import KPIStrip from './KPIStrip';
import PortfolioHealthMap from './PortfolioHealthMap';
import IncidentCommandCenter from './IncidentCommandCenter';
import InfrastructureHealthMatrix from './InfrastructureHealthMatrix';
import CapacityUtilization from './CapacityUtilization';
import SustainabilityIntel from './SustainabilityIntel';
import AIOperationsFeed from './AIOperationsFeed';
import ContextPanel from './ContextPanel';
import AICopilotPanel from './AICopilotPanel';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, active: true },
      { id: 'portfolio',      label: 'Portfolio Explorer', icon: Building2 },
      { id: 'datacenters',    label: 'Datacenters',       icon: Server },
      { id: 'assets',         label: 'Asset Intelligence', icon: Cpu },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'tenants',     label: 'Tenant Operations', icon: Users },
      { id: 'sustain',     label: 'Sustainability',    icon: Leaf },
      { id: 'ai-insights', label: 'AI Insights',       icon: Brain },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'incidents',    label: 'Incidents',    icon: AlertTriangle },
      { id: 'maintenance',  label: 'Maintenance',  icon: Wrench },
      { id: 'reports',      label: 'Reports',      icon: FileText },
      { id: 'settings',     label: 'Settings',     icon: Settings },
    ],
  },
];

function Sidebar({ collapsed, onToggle, onComingSoon }) {
  const w = collapsed ? 'w-16' : 'w-64';

  return (
    <div className={`${w} flex-shrink-0 bg-[#0D1428] border-r border-white/[0.06] flex flex-col transition-all duration-300 overflow-hidden h-full`}>
      {/* Toggle button */}
      <div className="flex items-center justify-end px-2 py-3 border-b border-white/[0.06]">
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-2 mb-1.5">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                return item.active ? (
                  <Link
                    key={item.id}
                    href="/command-center"
                    className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-[#00338D]/25 border border-[#00338D]/30 text-white group"
                  >
                    <Icon size={16} className="flex-shrink-0 text-[#0077C8]" />
                    {!collapsed && <span className="text-xs font-semibold truncate">{item.label}</span>}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => onComingSoon(item.label)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors group"
                  >
                    <Icon size={16} className="flex-shrink-0 group-hover:text-white/80" />
                    {!collapsed && <span className="text-xs truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-2 py-3 space-y-2">
        {/* System health */}
        <div className="flex items-center gap-2 px-2">
          <div className="relative flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#00A36C] block" />
            <span className="absolute inset-0 rounded-full bg-[#00A36C] animate-ping opacity-50" />
          </div>
          {!collapsed && <span className="text-[10px] text-white/40">All Systems Operational</span>}
        </div>

        {/* Notification bell */}
        <button onClick={() => onComingSoon('Notifications')} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <div className="relative flex-shrink-0">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[8px] font-bold flex items-center justify-center">7</span>
          </div>
          {!collapsed && <span className="text-xs">Notifications</span>}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0077C8] to-[#00338D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">AM</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Arjun Mehta</p>
              <p className="text-white/30 text-[10px] truncate">Facility Director</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ onCopilotOpen, onComingSoon }) {
  return (
    <div className="h-14 flex-shrink-0 bg-[#1A1F36]/95 border-b border-white/[0.08] flex items-center gap-3 px-4" style={{ backdropFilter: 'blur(20px)' }}>
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#00338D] flex items-center justify-center">
          <span className="text-white font-bold text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K-Nexus</span>
          <span className="text-white/30 text-sm">|</span>
          <span className="text-white/70 text-sm">Command Center</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs mx-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search assets, incidents, tenants..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#0077C8]/50 transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">⌘K</span>
        </div>
      </div>

      {/* Selectors */}
      <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none cursor-pointer">
        <option>Global Portfolio</option>
        <option>APAC Region</option>
        <option>EMEA Region</option>
        <option>Americas</option>
      </select>
      <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none cursor-pointer">
        <option>All Regions</option>
        <option>India</option>
        <option>Southeast Asia</option>
        <option>Europe</option>
        <option>Middle East</option>
      </select>
      <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none cursor-pointer">
        <option>Last 24 Hours</option>
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
        <option>Custom Range</option>
      </select>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="relative">
          <span className="w-2 h-2 rounded-full bg-[#00A36C] block" />
          <span className="absolute inset-0 rounded-full bg-[#00A36C] animate-ping opacity-60" />
        </div>
        <span className="text-xs text-white/60 font-semibold">Live</span>
      </div>

      {/* AI Copilot button */}
      <button
        onClick={onCopilotOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00338D] hover:bg-[#0044b8] text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
      >
        <Sparkles size={13} />
        AI Copilot
      </button>

      {/* User avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0077C8] to-[#00338D] flex items-center justify-center flex-shrink-0 cursor-pointer flex-shrink-0">
        <span className="text-white text-[10px] font-bold">AM</span>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-6 left-1/2 z-50 bg-[#1A1F36] border border-white/10 rounded-xl px-5 py-3 text-white text-sm shadow-2xl whitespace-nowrap"
    >
      {message} — Coming Soon
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cc-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== 'undefined') localStorage.setItem('cc-sidebar-collapsed', String(next));
  };

  const showComingSoon = (name) => setToast(name);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} onComingSoon={showComingSoon} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onCopilotOpen={() => setCopilotOpen(true)} onComingSoon={showComingSoon} />

        {/* Scrollable body */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto">
            {/* KPI Strip */}
            <KPIStrip />

            {/* Main grid */}
            <div className="px-4 pb-6 space-y-4">
              {/* Row 1: Portfolio Map — full width */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <PortfolioHealthMap />
              </motion.div>

              {/* Row 2: Incident Command — full width */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <IncidentCommandCenter />
              </motion.div>

              {/* Row 3: Infra + Capacity */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <InfrastructureHealthMatrix />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <CapacityUtilization />
                </motion.div>
              </div>

              {/* Row 4: Sustainability + AI Feed */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <SustainabilityIntel />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <AIOperationsFeed />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right context panel */}
          <ContextPanel />
        </div>
      </div>

      {/* Floating AI Copilot */}
      <AICopilotPanel forceOpen={copilotOpen} onOpenChange={setCopilotOpen} />

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
