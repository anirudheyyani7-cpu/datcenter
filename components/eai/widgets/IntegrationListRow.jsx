'use client';
import {
  ClipboardList, Database, Wrench, Radio, BarChart2,
  Cloud, Users, Settings, Server, Link, Globe, Boxes,
  Network, Zap, Layers, Activity,
} from 'lucide-react';

const ICON_MAP = {
  ClipboardList, Database, Wrench, Radio, BarChart2,
  Cloud, Users, Settings, Server, Link, Globe, Boxes,
  Network, Zap, Layers, Activity,
};

// Column-header row (render once above the list)
export function IntegrationListHeader() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 38px 64px 72px',
      padding: '5px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {['Integration', 'Status', 'Success Rate', 'Response Time'].map(h => (
        <span key={h} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {h}
        </span>
      ))}
    </div>
  );
}

// Single data row
export default function IntegrationListRow({ name, sublabel, logoIcon, logoColor, statusColor, successRatePct, responseTimeMs, isLast }) {
  const Icon = ICON_MAP[logoIcon] ?? Layers;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 38px 64px 72px',
      alignItems: 'center',
      padding: '7px 14px',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Integration name + icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: logoColor + '22',
          border: `1.5px solid ${logoColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={12} style={{ color: logoColor }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.30)' }}>{sublabel}</p>
        </div>
      </div>

      {/* Status dot */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: statusColor,
          display: 'inline-block',
          boxShadow: `0 0 5px ${statusColor}70`,
        }} />
      </div>

      {/* Success Rate */}
      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', fontFamily: 'ui-monospace,monospace' }}>
        {successRatePct}%
      </span>

      {/* Response Time */}
      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', fontFamily: 'ui-monospace,monospace' }}>
        {responseTimeMs} ms
      </span>
    </div>
  );
}
