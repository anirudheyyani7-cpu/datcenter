'use client';
import { useState, useEffect, useRef } from 'react';
import { Zap, ChevronDown,
  Plus, Upload, ClipboardList, FileText, Download, Filter, Bell,
  AlertOctagon, CalendarDays, Users, Share2, Plug, UploadCloud, BookOpen,
  MessageSquare, GitFork, Eye, FilePlus, CalendarPlus, LayoutGrid,
  ShoppingCart, Search, FileCheck, Truck, UserPlus, UserCog,
  SlidersHorizontal, Ticket, RefreshCw, BarChart2,
} from 'lucide-react';

const ICON_MAP = {
  Plus, Upload, ClipboardList, FileText, Download, Filter, Bell,
  AlertOctagon, CalendarDays, Users, Share2, Plug, UploadCloud, BookOpen,
  MessageSquare, GitFork, Eye, FilePlus, CalendarPlus, LayoutGrid,
  ShoppingCart, Search, FileCheck, Truck, UserPlus, UserCog,
  SlidersHorizontal, Ticket, RefreshCw, BarChart2,
};

export default function QuickActionsMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: open ? 'rgba(0,119,200,0.20)' : 'rgba(0,119,200,0.10)',
          border: '1px solid rgba(0,119,200,0.30)',
          borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
          color: open ? '#fff' : 'rgba(255,255,255,0.65)',
          fontSize: 10, fontWeight: 600, transition: 'all 0.12s',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,119,200,0.20)'; e.currentTarget.style.color = '#fff'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,119,200,0.10)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
      >
        <Zap size={11} /> Actions <ChevronDown size={9} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 300,
          width: 186,
          background: '#1A1F36',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
        }}>
          <div style={{ padding: '4px 0' }}>
            {items.map(({ iconKey, label }) => {
              const Icon = ICON_MAP[iconKey] ?? Plus;
              return (
                <button
                  key={label}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '7px 12px', border: 'none', background: 'transparent',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.60)',
                    fontSize: 11, textAlign: 'left', transition: 'all 0.10s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
                >
                  <Icon size={12} style={{ flexShrink: 0, color: '#0077C8' }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
