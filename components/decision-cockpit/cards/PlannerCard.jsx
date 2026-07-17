'use client';
import { Cpu, Thermometer, AlertTriangle, Zap } from 'lucide-react';
import Card, { ACCENTS } from './Card';

function formatUsd(n) {
  if (n == null) return '—';
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  return `$${Math.round(n / 1_000_000)}M`;
}

// Data shape is richer than ranking/metric/score cards — reads the computed
// gpu_cluster_planning fields directly (see data/decisionModules.js's
// shapeForCardType 'planner' case, which passes the module data through as-is).
export default function PlannerCard({ title, shaped, reason, accent = 'accent', onDoubleClick }) {
  if (!shaped || shaped.chip_id === undefined) return null;
  const color = ACCENTS[accent] || ACCENTS.accent;
  const mismatch = !!shaped.cooling_mismatch;
  const warnColor = ACCENTS.danger;

  const facilityUsd = shaped.facility_capex_usd || 0;
  const gpuUsd = shaped.gpu_capex_usd || 0;
  const totalUsd = shaped.total_capex_usd || (facilityUsd + gpuUsd) || 1;
  const facilityPct = Math.round((facilityUsd / totalUsd) * 100);
  const gpuPct = 100 - facilityPct;

  const phasing = shaped.capex_phasing || [];
  const maxPhaseCapex = Math.max(1, ...phasing.map(p => p.capex_usd));

  const env = shaped.envelope_utilization;

  return (
    <Card accent={mismatch ? warnColor : color} onDoubleClick={onDoubleClick}>
      <div className="p-4 flex flex-col h-full gap-2.5">
        <div className="flex items-center gap-2">
          <Cpu size={13} style={{ color }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold" style={{ background: color + '15', color }}>
            {shaped.chip_label}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-grey-bg text-text-secondary">
            <Thermometer size={10} /> {shaped.cooling_label}
          </span>
        </div>

        {mismatch && (
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: warnColor + '12' }}>
            <AlertTriangle size={12} style={{ color: warnColor }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[9.5px] leading-snug" style={{ color: warnColor }}>
              <span className="font-bold">Cooling mismatch:</span> {shaped.cooling_label} can't support {shaped.power_density_kw_per_rack}kW/rack.
              {' '}Minimum viable: <span className="font-bold">{shaped.min_viable_cooling_label}</span>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
          <div>
            <p className="text-[8.5px] text-text-muted">GPUs supported</p>
            <p className="text-xs font-bold text-text-primary">{shaped.gpus_supported?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-text-muted">Racks required</p>
            <p className="text-xs font-bold text-text-primary">{shaped.racks_required?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-text-muted">kW / rack</p>
            <p className="text-xs font-bold text-text-primary">{shaped.power_density_kw_per_rack}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-text-muted">Achievable PUE</p>
            <p className="text-xs font-bold text-text-primary">{shaped.achievable_pue}</p>
          </div>
          <div>
            <p className="text-[8.5px] text-text-muted">Grid connection</p>
            <p className="text-xs font-bold text-text-primary">{shaped.grid_connection_mw_required} MW</p>
          </div>
          <div>
            <p className="text-[8.5px] text-text-muted">WUE</p>
            <p className="text-xs font-bold text-text-primary">{shaped.estimated_wue_l_per_kwh} L/kWh</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[8px] text-text-muted uppercase tracking-wide">Facility vs GPU capex</p>
            <p className="text-[9px] font-bold text-text-primary">{formatUsd(totalUsd)} total</p>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-grey-bg">
            <div style={{ width: `${facilityPct}%`, background: ACCENTS.navy }} />
            <div style={{ width: `${gpuPct}%`, background: color }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[8.5px] text-text-muted">Facility {formatUsd(facilityUsd)} ({facilityPct}%)</span>
            <span className="text-[8.5px] font-semibold" style={{ color }}>GPU HW {formatUsd(gpuUsd)} ({gpuPct}%)</span>
          </div>
        </div>

        {phasing.length > 0 && (
          <div>
            <p className="text-[8px] text-text-muted uppercase tracking-wide mb-1">Capex phasing</p>
            <div className="flex items-end gap-1.5" style={{ height: 30 }}>
              {phasing.map(p => (
                <div key={p.phase} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full rounded-t-sm" style={{ height: `${Math.max(8, (p.capex_usd / maxPhaseCapex) * 100)}%`, background: color, opacity: 0.75 }} />
                  <p className="text-[7.5px] text-text-muted mt-0.5 truncate w-full text-center">{p.phase}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {env && (
          <div className="flex items-start gap-1.5 mt-auto px-2 py-1.5 rounded-lg" style={{ background: ACCENTS.amber + '12' }}>
            <Zap size={11} style={{ color: ACCENTS.amber }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-text-secondary leading-snug">
              A {formatUsd(env.envelope_usd)} envelope (conventional-DC rule of thumb for {env.requested_mw}MW) buys only{' '}
              <span className="font-bold" style={{ color: ACCENTS.amber }}>{env.deliverable_mw}MW ({env.utilization_pct}%)</span> of this GPU cluster.
            </p>
          </div>
        )}

        {reason && <p className="text-[9.5px] text-text-muted leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}
