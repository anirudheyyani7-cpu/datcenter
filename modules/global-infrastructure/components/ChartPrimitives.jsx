'use client';

/**
 * Shared chart chrome (card shell + tooltip) used by every Recharts panel
 * across the global and regional analytics/sustainability sections, so the
 * visual language stays identical without copy-pasting these two small
 * pieces into every chart file.
 */
export function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
      <p className="text-xs font-bold text-[#1A1F36] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
      {children}
    </div>
  );
}

export const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A1F36] border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
        {label && <p className="text-white/50 mb-0.5">{label}</p>}
        <p className="font-bold text-[#0077C8]">{payload[0].name ? `${payload[0].name}: ` : ''}{payload[0].value}{suffix}</p>
      </div>
    );
  }
  return null;
};
