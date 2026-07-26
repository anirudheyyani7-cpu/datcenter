'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
          color: open ? '#1A1F36' : '#1A1F36',
          fontSize: 10, fontWeight: 600, transition: 'all 0.12s',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,119,200,0.20)'; e.currentTarget.style.color = '#1A1F36'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,119,200,0.10)'; e.currentTarget.style.color = '#1A1F36'; } }}
      >
        <Zap size={11} /> Actions <ChevronDown size={9} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 300,
          width: 186,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(16,24,40,0.10)',
        }}>
          <div style={{ padding: '4px 0' }}>
            {items.map(({ iconKey, label, href, onClick }) => {
              const Icon = ICON_MAP[iconKey] ?? Plus;
              const itemStyle = {
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', color: '#6B7280',
                fontSize: 11, textAlign: 'left', transition: 'all 0.10s',
                textDecoration: 'none', boxSizing: 'border-box',
              };
              const hoverOn  = e => { e.currentTarget.style.background = '#F4F6F9'; e.currentTarget.style.color = '#1A1F36'; };
              const hoverOff = e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; };

              return href ? (
                <Link key={label} href={href} onClick={() => setOpen(false)} style={itemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <Icon size={12} style={{ flexShrink: 0, color: '#0077C8' }} />
                  {label}
                </Link>
              ) : (
                <button key={label} onClick={() => { onClick?.(); setOpen(false); }} style={itemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
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
