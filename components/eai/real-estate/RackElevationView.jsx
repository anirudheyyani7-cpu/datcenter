'use client';
// RackElevationView – front-of-rack U-slot view.
// Props: { rackId, dcId, selectedAssetId, onSelectAsset }

import { useMemo } from 'react';
import { mockRacks, generateDCRacks } from '@/data/mock/racks';
import { generateRackAssets } from '@/data/mock/rackAssets';

const U_HEIGHT = 12;  // px per 1U slot
const U_GAP    = 1;
const LABEL_W  = 32;

const ASSET_COLORS = {
  'GPU Server':     '#7C3AED',
  'Compute Server': '#0077C8',
  'Storage':        '#00A36C',
  'Network Switch': '#F59E0B',
  'Firewall':       '#EF4444',
  'Load Balancer':  '#06B6D4',
  'PDU':            '#64748B',
  'KVM / Console':  '#A78BFA',
  'Tape Library':   '#84CC16',
  'UPS Module':     '#F97316',
};

export default function RackElevationView({ rackId, dcId, selectedAssetId, onSelectAsset }) {
  const rack = useMemo(() => {
    if (!rackId || !dcId) return null;
    const racks = mockRacks[dcId] || generateDCRacks(dcId);
    return racks.find(r => r.id === rackId) || null;
  }, [rackId, dcId]);

  const assets = useMemo(() => {
    if (!rack) return [];
    return generateRackAssets(rack.label, dcId);
  }, [rack, dcId]);

  const totalU = rack?.spaceTotalU || 42;

  // Build a U-slot occupancy map
  const slotMap = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      for (let u = a.uStart; u <= a.uEnd; u++) {
        map[u] = a;
      }
    });
    return map;
  }, [assets]);

  if (!rack) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: 12 }}>
      Select a rack
    </div>
  );

  const totalH = totalU * (U_HEIGHT + U_GAP);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'auto', padding: '12px 16px', gap: 16 }}>
      {/* Rack panel */}
      <div style={{ flexShrink: 0, width: 280 }}>
        {/* Rack header */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: '8px 8px 0 0', padding: '8px 12px', marginBottom: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>Rack {rack.label}</span>
          <span style={{ fontSize: 9, color: '#6B7280' }}>{totalU}U Standard</span>
        </div>

        {/* Slots */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '0 0 6px 6px',
          overflow: 'hidden',
          height: totalH + 8,
        }}>
          {[...Array(totalU)].map((_, i) => {
            const u    = i + 1;
            const asset = slotMap[u];
            const isTop = asset && asset.uStart === u; // only render label on first U of asset

            // Skip middle/end slots of a multi-U asset (they're covered by the first row's height)
            if (asset && !isTop) return null;

            const uSize  = asset ? asset.uEnd - asset.uStart + 1 : 1;
            const h      = uSize * (U_HEIGHT + U_GAP) - U_GAP;
            const color  = asset ? (ASSET_COLORS[asset.type] || '#4B5563') : 'transparent';
            const isSel  = asset && asset.id === selectedAssetId;

            return (
              <div
                key={u}
                onClick={() => asset && onSelectAsset?.(asset.id)}
                style={{
                  display: 'flex',
                  height: h,
                  marginBottom: U_GAP,
                  cursor: asset ? 'pointer' : 'default',
                  border: isSel ? `1px solid ${color}` : 'none',
                }}
              >
                {/* U label */}
                <div style={{
                  width: LABEL_W, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 6,
                  fontSize: 7, color: '#9CA3AF',
                  fontFamily: 'monospace',
                  background: '#F8FAFC',
                }}>
                  U{u}
                </div>

                {/* Asset slot */}
                <div style={{
                  flex: 1,
                  background: asset ? `${color}22` : '#FFFFFF',
                  borderLeft: `3px solid ${asset ? color : '#E2E8F0'}`,
                  display: 'flex', alignItems: 'center',
                  padding: '0 8px',
                  gap: 6,
                  overflow: 'hidden',
                }}>
                  {asset && (
                    <>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: asset.status === 'Operational' ? '#22c55e' : asset.status === 'Critical' ? '#ef4444' : '#f97316',
                      }} />
                      <div style={{ overflow: 'hidden', minWidth: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#1A1F36', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asset.name}
                        </div>
                        {uSize > 1 && (
                          <div style={{ fontSize: 7, color: '#6B7280', whiteSpace: 'nowrap' }}>
                            {asset.vendor} · {asset.model}
                          </div>
                        )}
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 7, color: color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {asset.powerKw}kW
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ flexShrink: 0, paddingTop: 44 }}>
        <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Asset Types</div>
        {Object.entries(ASSET_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: '#6B7280' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
