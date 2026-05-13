export function formatNumber(n, decimals = 0) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatMW(mw) {
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)}GW`;
  return `${formatNumber(mw)}MW`;
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'operational': return 'text-[#00A36C]';
    case 'under construction': return 'text-[#D4A017]';
    case 'planned': return 'text-[#0077C8]';
    default: return 'text-[#6B7280]';
  }
}

export function getStatusDot(status) {
  switch (status?.toLowerCase()) {
    case 'operational': return 'bg-[#00A36C]';
    case 'under construction': return 'bg-[#D4A017]';
    case 'planned': return 'bg-[#0077C8]';
    default: return 'bg-[#6B7280]';
  }
}

export function getTierColor(tier) {
  if (tier?.includes('IV')) return '#D4A017';
  if (tier?.includes('III+')) return '#0077C8';
  if (tier?.includes('III')) return '#00338D';
  return '#6B7280';
}

export function getPUEColor(pue) {
  if (pue <= 1.2) return '#00A36C';
  if (pue <= 1.35) return '#0077C8';
  if (pue <= 1.5) return '#D4A017';
  return '#EF4444';
}

export function getCountryColor(country) {
  const colors = {
    'India': '#1B3A5C',
    'Singapore': '#00529B',
    'Ireland': '#2E7D32',
    'United Kingdom': '#1565C0',
    'United States': '#0D47A1',
  };
  return colors[country] || '#00338D';
}

export function parseMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[uh]|<li|<p)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export const STAGE_COLORS = [
  '#00338D',
  '#0077C8',
  '#1B3A5C',
  '#00529B',
  '#1565C0',
  '#003580',
];

export const STAGE_COLORS_LIGHT = [
  'rgba(0,51,141,0.15)',
  'rgba(0,119,200,0.15)',
  'rgba(27,58,92,0.15)',
  'rgba(0,82,155,0.15)',
  'rgba(21,101,192,0.15)',
  'rgba(0,53,128,0.15)',
];
