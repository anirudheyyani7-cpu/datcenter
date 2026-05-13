'use client';
export function Badge({ children, color = 'blue', size = 'sm' }) {
  const colors = {
    blue: 'bg-[#0077C8]/10 text-[#0077C8] border-[#0077C8]/20',
    navy: 'bg-[#00338D]/10 text-[#00338D] border-[#00338D]/20',
    green: 'bg-[#00A36C]/10 text-[#00A36C] border-[#00A36C]/20',
    amber: 'bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/20',
    red: 'bg-red-50 text-red-600 border-red-200',
    grey: 'bg-[#F4F6F9] text-[#6B7280] border-[#E2E8F0]',
    tier4: 'bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/20',
    tier3plus: 'bg-[#0077C8]/10 text-[#0077C8] border-[#0077C8]/20',
    tier3: 'bg-[#00338D]/10 text-[#00338D] border-[#00338D]/20',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${colors[color] || colors.blue} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function TierBadge({ tier }) {
  if (!tier) return null;
  let color = 'grey';
  if (tier.includes('IV')) color = 'tier4';
  else if (tier.includes('III+')) color = 'tier3plus';
  else if (tier.includes('III')) color = 'tier3';

  return <Badge color={color}>{tier}</Badge>;
}

export function StatusBadge({ status }) {
  if (!status) return null;
  let color = 'grey';
  if (status.toLowerCase() === 'operational') color = 'green';
  else if (status.toLowerCase().includes('construction')) color = 'amber';
  else if (status.toLowerCase() === 'planned') color = 'blue';

  return (
    <Badge color={color}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
        color === 'green' ? 'bg-[#00A36C]' : color === 'amber' ? 'bg-[#D4A017]' : 'bg-[#0077C8]'
      }`} />
      {status}
    </Badge>
  );
}
