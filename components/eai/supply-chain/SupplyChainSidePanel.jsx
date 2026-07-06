'use client';
import {
  Users, FileText, Truck, Warehouse, Package, ArrowRightLeft, Package2, BarChart3,
  Plus, Search, FileCheck, RotateCcw, Star,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'vendors',          label: 'Vendors',           Icon: Users            },
  { key: 'purchase-orders',  label: 'Purchase Orders',   Icon: FileText         },
  { key: 'shipments',        label: 'Shipments',         Icon: Truck            },
  { key: 'warehouses',       label: 'Warehouses',        Icon: Warehouse        },
  { key: 'inventory',        label: 'Inventory',         Icon: Package          },
  { key: 'in-transit',       label: 'In Transit',        Icon: ArrowRightLeft   },
  { key: 'deliveries',       label: 'Deliveries',        Icon: Package2         },
  { key: 'demand-planning',  label: 'Demand Planning',   Icon: BarChart3        },
];

const QUICK_ACTIONS = [
  { label: 'Create Purchase Order', Icon: Plus       },
  { label: 'Track Shipment',        Icon: Search     },
  { label: 'GRN (Goods Receipt)',   Icon: FileCheck  },
  { label: 'Return / RMA',          Icon: RotateCcw  },
  { label: 'Vendor Performance',    Icon: Star       },
];

export default function SupplyChainSidePanel({ activeSection, onSelect }) {
  return (
    <aside style={{
      width: 196, minWidth: 196, flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#0D1428',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>

      {/* Supply Chain Navigation */}
      <div style={{ padding: '14px 12px 8px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
          Supply Chain Navigation
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = activeSection === key;
            return (
              <button key={key} onClick={() => onSelect?.(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                  padding: '6px 8px', borderRadius: 6,
                  border: isActive ? '1px solid rgba(124,58,237,0.30)' : '1px solid transparent',
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
