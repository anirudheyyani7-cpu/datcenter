'use client';
import {
  SearchCheck, Truck, Activity, Wrench, CheckCircle, XCircle, Archive,
  Plus, Upload, ClipboardList, CalendarClock, QrCode,
} from 'lucide-react';

const ToolIcon = Wrench; // Tool was removed from lucide-react; Wrench is the equivalent

const NAV_ITEMS = [
  { stage: null,                    label: 'Discovery & Inventory', Icon: SearchCheck, badge: null           },
  { stage: null,                    label: 'Deployment',            Icon: Truck,       badge: null           },
  { stage: 'In Use',               label: 'In Use',                Icon: Activity,    badge: null           },
  { stage: 'Maintenance',          label: 'Maintenance',           Icon: Wrench,      badge: 'Maintenance'  },
  { stage: 'Repair',               label: 'Repair',                Icon: ToolIcon,    badge: 'Repair'       },
  { stage: 'Ready for Deployment', label: 'Ready for Deployment',  Icon: CheckCircle, badge: 'Ready for Deployment' },
  { stage: 'End of Life',          label: 'End of Life',           Icon: XCircle,     badge: 'End of Life'  },
  { stage: 'Retired',              label: 'Retired',               Icon: Archive,     badge: 'Retired'      },
];

const BADGE_COLOR = {
  'Maintenance':          '#F59E0B',
  'Repair':               '#DC2626',
  'Ready for Deployment': '#7C3AED',
  'End of Life':          '#EF4444',
  'Retired':              '#6B7280',
};

const QUICK_ACTIONS = [
  { label: 'Add New Asset',      Icon: Plus          },
  { label: 'Bulk Import Assets', Icon: Upload        },
  { label: 'Create Work Order',  Icon: ClipboardList },
  { label: 'Schedule Maintenance', Icon: CalendarClock },
  { label: 'Generate QR/Barcode', Icon: QrCode       },
];

export default function LifecycleSidePanel({ counts = {}, activeStage, onSelect }) {
  return (
    <aside style={{
      width: 196, minWidth: 196, flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#0D1428',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>

      {/* ── Lifecycle Navigation ─────────────────────────────────────────── */}
      <div style={{ padding: '14px 12px 8px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
          Lifecycle Navigation
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(item => {
            const { stage, label, Icon, badge } = item;
            const isActive = activeStage === stage && stage !== null;
            const badgeCount = badge ? counts[badge] : null;
            const badgeColor = badge ? BADGE_COLOR[badge] : null;
            return (
              <button
                key={label}
                onClick={() => onSelect && onSelect(stage)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 6, width: '100%', padding: '6px 8px', borderRadius: 6,
                  border: isActive ? '1px solid rgba(124,58,237,0.30)' : '1px solid transparent',
                  background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.12s',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <Icon size={12} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {badgeCount !== undefined && badgeCount !== null && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, flexShrink: 0,
                    padding: '1px 5px', borderRadius: 5,
                    color: badgeColor, background: badgeColor + '22',
                    border: `1px solid ${badgeColor}44`,
                  }}>
                    {badgeCount.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {QUICK_ACTIONS.map(({ label, Icon }) => (
            <button key={label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 8px', borderRadius: 6, border: '1px solid transparent',
              background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.40)',
              fontSize: 11, textAlign: 'left', width: '100%',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
            >
              <Icon size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
}
