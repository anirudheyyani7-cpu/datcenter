'use client';
// FloorRoomSchematic – floor plan: rack rows + support rooms + emergency exit.
// Props: { dcId, selectedRackId, onSelectRack, highlightRoomType? }
// Uses mockRacks / generateDCRacks to place racks by row/position.

import { useMemo } from 'react';
import { mockRacks, generateDCRacks } from '@/data/mock/racks';

const STATUS_COLOR = {
  operational: '#22c55e',
  warning:     '#f97316',
  critical:    '#ef4444',
};

// SVG constants (viewBox 0 0 1000 660)
const VB_W = 1000, VB_H = 660;
const LEFT_W  = 115;   // UPS / Electrical rooms width
const RIGHT_W = 115;   // Cooling / Network / Storage rooms width
const MAIN_X  = LEFT_W + 10;
const MAIN_W  = VB_W - LEFT_W - RIGHT_W - 20;
const RACK_W  = 74;
const RACK_H  = 80;
const GAP     = 8;
const ROW_Y   = [60, 240, 420]; // y-start for rows A, B, C
const ROWS    = ['A', 'B', 'C'];
const N_RACKS = 8;

// Support rooms: [id, x, y, w, h, label, icon text]
const SUPPORT = [
  { id: 'ups',     x: 4,  y: 4,   w: LEFT_W - 8,  h: VB_H * 0.42,    label: 'UPS Room',      icon: '⚡' },
  { id: 'elec',   x: 4,  y: VB_H * 0.48, w: LEFT_W - 8, h: VB_H * 0.44, label: 'Electrical\nRoom', icon: '⚡' },
  { id: 'cool',   x: VB_W - RIGHT_W + 4, y: 4,  w: RIGHT_W - 8, h: VB_H * 0.30, label: 'Cooling\nUnits', icon: '❄' },
  { id: 'net',    x: VB_W - RIGHT_W + 4, y: VB_H * 0.36, w: RIGHT_W - 8, h: VB_H * 0.30, label: 'Network\nRoom', icon: '⊞' },
  { id: 'store',  x: VB_W - RIGHT_W + 4, y: VB_H * 0.72, w: RIGHT_W - 8, h: VB_H * 0.24, label: 'Storage\nRoom', icon: '▦' },
];

export default function FloorRoomSchematic({ dcId, selectedRackId, onSelectRack }) {
  const racks = useMemo(() => {
    const all = mockRacks[dcId] || generateDCRacks(dcId);
    return all.filter(r => ROWS.includes(r.row) && r.position >= 1 && r.position <= N_RACKS);
  }, [dcId]);

  function rackX(position) {
    return MAIN_X + (position - 1) * (RACK_W + GAP);
  }

  const mainFloorW = N_RACKS * (RACK_W + GAP) - GAP + 40;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Background */}
      <rect width={VB_W} height={VB_H} fill="#0d1525" />

      {/* Main DC floor */}
      <rect
        x={MAIN_X - 5} y={4}
        width={mainFloorW + 10} height={VB_H - 8}
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
        rx="4"
      />

      {/* Grid lines (decorative) */}
      {[...Array(10)].map((_, i) => (
        <line key={`vg${i}`} x1={MAIN_X + i * 70} y1={8} x2={MAIN_X + i * 70} y2={VB_H - 8}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
      {[...Array(8)].map((_, i) => (
        <line key={`hg${i}`} x1={MAIN_X} y1={i * 80} x2={MAIN_X + mainFloorW} y2={i * 80}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}

      {/* Support rooms */}
      {SUPPORT.map(s => (
        <g key={s.id}>
          <rect
            x={s.x} y={s.y} width={s.w} height={s.h}
            fill="rgba(255,255,255,0.025)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
            rx="3"
          />
          <text x={s.x + s.w / 2} y={s.y + 18} textAnchor="middle" fontSize="16" fill="rgba(255,255,255,0.30)">{s.icon}</text>
          {s.label.split('\n').map((line, li) => (
            <text key={li} x={s.x + s.w / 2} y={s.y + s.h / 2 + li * 11}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill="rgba(255,255,255,0.40)" fontFamily="sans-serif">
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* Rack rows */}
      {ROWS.map((row, ri) => {
        const rowY = ROW_Y[ri];
        const rowRacks = racks.filter(r => r.row === row);
        return (
          <g key={row}>
            {/* Row label */}
            <text x={MAIN_X + 6} y={rowY - 10}
              fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.40)"
              fontFamily="monospace">
              Row {row}
            </text>

            {/* Row background band */}
            <rect
              x={MAIN_X - 2} y={rowY - 2}
              width={mainFloorW + 2} height={RACK_H + 24}
              fill="rgba(255,255,255,0.015)" rx="3"
            />

            {/* Racks */}
            {[...Array(N_RACKS)].map((_, pi) => {
              const rack   = rowRacks.find(r => r.position === pi + 1);
              const rId    = rack?.id;
              const status = rack?.status ?? 'operational';
              const color  = STATUS_COLOR[status] ?? STATUS_COLOR.operational;
              const isSel  = rId === selectedRackId;
              const label  = rack?.label ?? `${row}0${pi+1}`;
              const utilPct = rack?.utilPct ?? 60;

              return (
                <g
                  key={pi}
                  style={{ cursor: 'pointer' }}
                  onClick={() => rack && onSelectRack(rId)}
                >
                  {/* Rack body */}
                  <rect
                    x={rackX(pi + 1)} y={rowY}
                    width={RACK_W} height={RACK_H}
                    fill={`${color}22`}
                    stroke={isSel ? '#fff' : `${color}88`}
                    strokeWidth={isSel ? 1.5 : 0.8}
                    rx="3"
                  />
                  {/* Status bar top */}
                  <rect
                    x={rackX(pi + 1)} y={rowY}
                    width={RACK_W} height={3}
                    fill={color} rx="2"
                  />
                  {/* Rack label */}
                  <text
                    x={rackX(pi + 1) + RACK_W / 2} y={rowY + 22}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontWeight="700"
                    fill={isSel ? '#fff' : 'rgba(255,255,255,0.70)'}
                    fontFamily="monospace">
                    {label}
                  </text>
                  {/* Util pct */}
                  <text
                    x={rackX(pi + 1) + RACK_W / 2} y={rowY + 38}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fill="rgba(255,255,255,0.40)" fontFamily="monospace">
                    {utilPct}%
                  </text>
                  {/* Utilisation bar */}
                  <rect
                    x={rackX(pi + 1) + 8} y={rowY + RACK_H - 14}
                    width={RACK_W - 16} height={4}
                    fill="rgba(255,255,255,0.08)" rx="2"
                  />
                  <rect
                    x={rackX(pi + 1) + 8} y={rowY + RACK_H - 14}
                    width={(RACK_W - 16) * utilPct / 100} height={4}
                    fill={color} rx="2"
                  />
                  {/* Status dot */}
                  <circle
                    cx={rackX(pi + 1) + RACK_W - 8} cy={rowY + 10}
                    r="4" fill={color}
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Room label at bottom */}
      <text
        x={MAIN_X + mainFloorW / 2} y={VB_H - 14}
        textAnchor="middle"
        fontSize="11" fontWeight="700"
        fill="rgba(255,255,255,0.25)"
        letterSpacing="3"
        fontFamily="monospace"
      >
        A02
      </text>

      {/* Emergency Exit */}
      <g transform={`translate(${MAIN_X + mainFloorW / 2 - 30}, ${VB_H - 36})`}>
        <rect width="60" height="18" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="0.6" rx="3" />
        <text x="30" y="9" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#ef4444" fontWeight="700">
          Emergency Exit
        </text>
      </g>

      {/* Status legend row at very top */}
      {[
        { label: 'Operational', color: '#22c55e' },
        { label: 'Maintenance', color: '#f97316' },
        { label: 'Critical',    color: '#ef4444' },
        { label: 'Offline',     color: '#64748b' },
      ].map((s, i) => (
        <g key={s.label} transform={`translate(${MAIN_X + 10 + i * 110}, 14)`}>
          <circle r="4" fill={s.color} />
          <text x="10" y="0" dominantBaseline="middle" fontSize="9" fill="rgba(255,255,255,0.55)" fontFamily="sans-serif">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
