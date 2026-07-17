'use client';
import Link from 'next/link';
import { Search, Bell, Mail, HelpCircle, ChevronRight, PanelLeft, Home } from 'lucide-react';

const BTN = {
  width: 34, height: 34, borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'rgba(255,255,255,0.40)',
  transition: 'all 0.12s', flexShrink: 0,
};

export default function EAITopbar({ unreadCount = 12, sidebarHidden = false, onToggleSidebar }) {
  return (
    <header style={{
      height: 56, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px',
      background: 'rgba(13,20,40,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>

      {/* Hide/show sidebar toggle — only visible when sidebar is hidden */}
      {sidebarHidden && (
        <button
          onClick={onToggleSidebar}
          title="Show sidebar"
          style={{ ...BTN, flexShrink: 0, marginRight: -4 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <PanelLeft size={14} />
        </button>
      )}

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400 }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.30)', fontSize: 12,
          transition: 'border-color 0.12s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
        >
          <Search size={13} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search for anything...</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.20)', flexShrink: 0 }}>⌘K</span>
        </button>
      </div>

      {/* Home — back to main K-Nexus.AI site */}
      <Link href="/" title="Home" style={BTN}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
        <Home size={14} />
      </Link>

      <div style={{ flex: 1 }} />

      {/* Icon buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button style={BTN}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <Bell size={14} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: '#DC2626', color: '#fff',
              fontSize: 8, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>

        {/* Mail */}
        <button style={BTN}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
          <Mail size={14} />
        </button>

        {/* Help */}
        <button style={BTN}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
          <HelpCircle size={14} />
        </button>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 6px', borderRadius: 10, cursor: 'pointer',
          transition: 'background 0.12s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #00338D, #0077C8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 10 }}>AN</span>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1 }}>Anoushka</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Platform Admin</p>
          </div>
          <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>
    </header>
  );
}
