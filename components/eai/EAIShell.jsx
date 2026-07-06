'use client';
// EAIShell owns sidebar collapsed / hidden state so both Sidebar and Topbar
// share the same source of truth without a context provider.
import { useState } from 'react';
import EAISidebar from './Sidebar';
import EAITopbar  from './Topbar';
import { ChevronRight } from 'lucide-react';

export default function EAIShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden,    setHidden]    = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D1428', color: '#fff', overflow: 'hidden' }}>

      {/* Sidebar — rendered when not fully hidden */}
      {!hidden && (
        <EAISidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          onHide={() => setHidden(true)}
        />
      )}

      {/* Edge-strip control — appears at the left edge when sidebar is completely hidden */}
      {hidden && (
        <button
          onClick={() => setHidden(false)}
          title="Show sidebar"
          style={{
            position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 56, zIndex: 200,
            background: 'rgba(0,119,200,0.28)',
            border: '1px solid rgba(0,119,200,0.45)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.55)',
            padding: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,119,200,0.50)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,119,200,0.28)')}
        >
          <ChevronRight size={10} />
        </button>
      )}

      {/* Main column — topbar + page content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <EAITopbar
          unreadCount={12}
          sidebarHidden={hidden}
          onToggleSidebar={() => setHidden(h => !h)}
        />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
