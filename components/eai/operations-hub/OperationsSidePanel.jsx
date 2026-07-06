'use client';
import {
  LayoutDashboard, ClipboardList, AlertCircle, Wrench, Activity,
  GitBranch, BarChart2, ListChecks,
  Plus, AlertOctagon, CalendarDays, ClipboardEdit, CalendarRange,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'overview',          label: 'Overview',           Icon: LayoutDashboard },
  { key: 'work-orders',       label: 'Work Orders',        Icon: ClipboardList   },
  { key: 'incidents',         label: 'Incidents',          Icon: AlertCircle     },
  { key: 'maintenance',       label: 'Maintenance',        Icon: Wrench          },
  { key: 'monitoring',        label: 'Monitoring',         Icon: Activity        },
  { key: 'change-management', label: 'Change Management',  Icon: GitBranch       },
  { key: 'sla-performance',   label: 'SLA & Performance',  Icon: BarChart2       },
  { key: 'task-management',   label: 'Task Management',    Icon: ListChecks      },
];

const QUICK_ACTIONS = [
  { label: 'Create Work Order',         Icon: Plus          },
  { label: 'Report an Incident',        Icon: AlertOctagon  },
  { label: 'Schedule Maintenance',      Icon: CalendarDays  },
  { label: 'Create Change Request',     Icon: ClipboardEdit },
  { label: 'View Operations Calendar',  Icon: CalendarRange },
];

export default function OperationsSidePanel({ activeSection = 'overview', onSelect }) {
  return (
    <aside style={{
      width: 196, minWidth: 196, flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#0D1428',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '14px 12px 8px' }}>
        <p style={{
          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8,
        }}>
          Operations Navigation
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => onSelect?.(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                  padding: '6px 8px', borderRadius: 6,
                  border:  isActive ? '1px solid rgba(0,119,200,0.35)' : '1px solid transparent',
                  background: isActive ? 'rgba(0,119,200,0.15)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.12s',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={12} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 700 : 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <p style={{
          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8,
        }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {QUICK_ACTIONS.map(({ label, Icon }) => (
            <button
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px',
                borderRadius: 6, border: '1px solid transparent', background: 'transparent',
                cursor: 'pointer', color: 'rgba(255,255,255,0.40)',
                fontSize: 11, textAlign: 'left', width: '100%',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
              }}
            >
              <Icon size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
