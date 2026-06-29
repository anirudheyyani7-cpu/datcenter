export const WAR_ZONES = [
  {
    id: 'WZ-UA-01',
    name: 'Russia–Ukraine War',
    theatre: 'Eastern Europe',
    severity: 'Critical',
    since: 'Feb 2022',
    affected_regions: ['EMEA'],
    affected_countries: ['Finland', 'Norway', 'Sweden', 'Germany', 'Netherlands', 'Belgium', 'UK', 'Ireland', 'Denmark', 'France', 'Austria'],
    headline: 'Active armed conflict in Eastern Europe — elevated infrastructure risk across Northern & Central Europe',
    risks: [
      { label: 'Power Grid',     detail: 'Cross-border energy infrastructure targeted; Baltic-region grid stability degraded' },
      { label: 'Fiber Cables',   detail: 'Baltic Sea undersea cables sabotaged (2023–2025); Northern European DC connectivity at risk' },
      { label: 'Cyber Warfare',  detail: 'State-sponsored APT groups targeting EU/NATO critical infrastructure including hyperscale DCs' },
      { label: 'Supply Chain',   detail: 'Hardware component delays from disrupted Eastern European logistics corridors' },
    ],
    dc_effect: 'All EMEA DCs face elevated cyber threat posture. Northern European campuses (Finland, Norway, Sweden) are within NATO proximity zone. Verify redundant cable route diversity and activate enhanced SOC monitoring.',
  },
  {
    id: 'WZ-TW-01',
    name: 'Taiwan Strait Crisis',
    theatre: 'East Asia',
    severity: 'High',
    since: '2024',
    affected_regions: ['ASPAC'],
    affected_countries: ['Taiwan', 'Japan', 'Singapore', 'Malaysia'],
    headline: 'Escalating PLA military exercises across the Taiwan Strait — direct operational risk to ASPAC campuses',
    risks: [
      { label: 'Forced Closure',      detail: 'Taiwan campus faces operational shutdown risk under blockade or direct military action' },
      { label: 'Cable Severance',     detail: 'Pacific undersea cables through Taiwan Strait may be targeted; US–APAC latency would spike sharply' },
      { label: 'Semiconductor Supply',detail: 'Global chip supply disruption would extend hardware refresh and capacity expansion timelines by 12–18 months' },
      { label: 'Air Corridor Closure',detail: 'Restricted airspace impacting hardware logistics and on-site engineering rotation' },
    ],
    dc_effect: 'Taiwan campus at direct existential risk — activate DR failover planning immediately. Singapore and Malaysia campuses face connectivity degradation if South China Sea cables are cut. Japan campus under elevated alert.',
  },
  {
    id: 'WZ-ME-01',
    name: 'Middle East Conflict & Red Sea Crisis',
    theatre: 'Middle East / Red Sea',
    severity: 'High',
    since: 'Oct 2023',
    affected_regions: ['EMEA', 'ASPAC'],
    affected_countries: ['Belgium', 'Netherlands', 'UK', 'Ireland', 'France', 'Germany', 'Finland', 'Norway', 'Sweden', 'Denmark', 'Austria', 'Portugal', 'Singapore', 'Malaysia', 'Japan', 'Taiwan'],
    headline: 'Houthi attacks on Red Sea shipping lanes and undersea cables — EMEA ↔ ASPAC connectivity degraded',
    risks: [
      { label: 'Cable Attacks',     detail: 'AAE-1, EIG, SMW5, Seacom cables damaged in Red Sea corridor; more attacks likely' },
      { label: 'Latency Spike',     detail: 'Traffic rerouted around South Africa adds 80–120ms on EMEA–APAC routes' },
      { label: 'Bandwidth Loss',    detail: 'Up to 25% EMEA–APAC capacity degraded on affected cable segments' },
      { label: 'Regional Spillover',detail: 'Wider conflict escalation could extend attacks to Mediterranean cable infrastructure' },
    ],
    dc_effect: 'EMEA and ASPAC DCs relying on Red Sea cable routes face latency increases and potential failover events. Monitor BGP route changes actively. Ensure alternate cable path diversity is validated and live.',
  },
];

export function getWarZonesForRegion(region) {
  if (!region || region === 'All') return [];
  return WAR_ZONES.filter(wz => wz.affected_regions.includes(region));
}
