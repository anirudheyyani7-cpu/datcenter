'use client';

const CONFIG = {
  healthy:     { bg: 'bg-[#00A36C]/10', text: 'text-[#00A36C]', dot: 'bg-[#00A36C]', label: 'Healthy' },
  degraded:    { bg: 'bg-[#D4A017]/10', text: 'text-[#D4A017]', dot: 'bg-[#D4A017]', label: 'Degraded' },
  warning:     { bg: 'bg-[#D4A017]/10', text: 'text-[#D4A017]', dot: 'bg-[#D4A017]', label: 'Warning' },
  critical:    { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]', label: 'Critical' },
  high:        { bg: 'bg-orange-100',   text: 'text-orange-600', dot: 'bg-orange-500', label: 'High' },
  medium:      { bg: 'bg-[#D4A017]/10', text: 'text-[#D4A017]', dot: 'bg-[#D4A017]', label: 'Medium' },
  low:         { bg: 'bg-[#0077C8]/10', text: 'text-[#0077C8]', dot: 'bg-[#0077C8]', label: 'Low' },
  info:        { bg: 'bg-[#0077C8]/10', text: 'text-[#0077C8]', dot: 'bg-[#0077C8]', label: 'Info' },
  investigating: { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]', label: 'Investigating' },
  identified:  { bg: 'bg-orange-100',   text: 'text-orange-600', dot: 'bg-orange-500', label: 'Identified' },
  monitoring:  { bg: 'bg-[#0077C8]/10', text: 'text-[#0077C8]', dot: 'bg-[#0077C8]', label: 'Monitoring' },
  resolved:    { bg: 'bg-[#00A36C]/10', text: 'text-[#00A36C]', dot: 'bg-[#00A36C]', label: 'Resolved' },
  none:        { bg: 'bg-[#00A36C]/10', text: 'text-[#00A36C]', dot: 'bg-[#00A36C]', label: 'None' },
};

export default function StatusBadge({ status, label, showDot = false, size = 'sm' }) {
  const cfg = CONFIG[status] ?? CONFIG.info;
  const displayLabel = label ?? cfg.label;
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${textSize} ${cfg.bg} ${cfg.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {displayLabel}
    </span>
  );
}
