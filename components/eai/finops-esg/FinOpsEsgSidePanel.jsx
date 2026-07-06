'use client';
import {
  DollarSign, BarChart2, Calculator, Zap, TrendingUp, Share2,
  Leaf, Factory, Droplets, Recycle, Award, ClipboardCheck,
  Plus, Download, Filter, RotateCcw, BookOpen,
} from 'lucide-react';

const FINOPS_NAV = [
  { key: 'cost-overview',          label: 'Cost Overview',        Icon: DollarSign    },
  { key: 'cost-breakdown',         label: 'Cost Breakdown',       Icon: BarChart2     },
  { key: 'budget-vs-actual',       label: 'Budget vs Actual',     Icon: Calculator    },
  { key: 'unit-economics',         label: 'Unit Economics',       Icon: Zap           },
  { key: 'forecasting',            label: 'Forecasting',          Icon: TrendingUp    },
  { key: 'chargeback-allocation',  label: 'Chargeback/Allocation',Icon: Share2        },
];

const ESG_NAV = [
  { key: 'esg-overview',  label: 'ESG Overview',      Icon: Leaf          },
  { key: 'emissions',     label: 'Emissions',         Icon: Factory       },
  { key: 'energy-water',  label: 'Energy & Water',    Icon: Droplets      },
  { key: 'waste',         label: 'Waste & Circularity',Icon: Recycle      },
  { key: 'esg-scores',    label: 'ESG Scores',        Icon: Award         },
  { key: 'compliance',    label: 'Compliance',        Icon: ClipboardCheck},
];

const QUICK_ACTIONS = [
  { label: 'New Cost Report',     Icon: Plus        },
  { label: 'Export Data',         Icon: Download    },
  { label: 'Apply Filters',       Icon: Filter      },
  { label: 'Reset View',          Icon: RotateCcw   },
  { label: 'View Documentation',  Icon: BookOpen    },
];

function NavGroup({ groupLabel, items, activeSection, onSelect }) {
  return (
    <div style={{ padding: '14px 12px 8px' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
        {groupLabel}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(({ key, label, Icon }) => {
          const isActive = activeSection === key;
          return (
            <button key={key} onClick={() => onSelect?.(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                padding: '6px 8px', borderRadius: 6,
                border:  isActive ? '1px solid rgba(124,58,237,0.30)' : '1px solid transparent',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.12s',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={12} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FinOpsEsgSidePanel({ activeSection, onSelect }) {
  return (
    <aside style={{
      width: 196, minWidth: 196, flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#0D1428',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <NavGroup groupLabel="FinOps Navigation" items={FINOPS_NAV} activeSection={activeSection} onSelect={onSelect} />

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
        <NavGroup groupLabel="ESG Navigation" items={ESG_NAV} activeSection={activeSection} onSelect={onSelect} />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {QUICK_ACTIONS.map(({ label, Icon }) => (
            <button key={label} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px',
              borderRadius: 6, border: '1px solid transparent', background: 'transparent',
              cursor: 'pointer', color: 'rgba(255,255,255,0.40)', fontSize: 11, textAlign: 'left', width: '100%',
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
