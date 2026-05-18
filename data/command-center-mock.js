// Mock data for Command Center Dashboard

export const mockDatacenters = [
  { id: 'mum-1', name: 'Mumbai DC-1', city: 'Mumbai', country: 'India', region: 'APAC', lat: 19.08, lng: 72.88, healthScore: 97, status: 'healthy', activeIncidents: 0, totalCapacityMW: 80, utilizationPercent: 71 },
  { id: 'mum-2', name: 'Mumbai DC-2', city: 'Mumbai', country: 'India', region: 'APAC', lat: 19.04, lng: 72.85, healthScore: 78, status: 'degraded', activeIncidents: 2, totalCapacityMW: 60, utilizationPercent: 84 },
  { id: 'che-1', name: 'Chennai Edge Facility', city: 'Chennai', country: 'India', region: 'APAC', lat: 13.08, lng: 80.27, healthScore: 95, status: 'healthy', activeIncidents: 0, totalCapacityMW: 40, utilizationPercent: 65 },
  { id: 'hyd-1', name: 'Hyderabad Hyperscale-1', city: 'Hyderabad', country: 'India', region: 'APAC', lat: 17.39, lng: 78.49, healthScore: 92, status: 'healthy', activeIncidents: 1, totalCapacityMW: 120, utilizationPercent: 79 },
  { id: 'sgp-1', name: 'Singapore Colo Hub', city: 'Singapore', country: 'Singapore', region: 'APAC', lat: 1.35, lng: 103.82, healthScore: 99, status: 'healthy', activeIncidents: 0, totalCapacityMW: 100, utilizationPercent: 91 },
  { id: 'sgp-2', name: 'Singapore DC-2', city: 'Singapore', country: 'Singapore', region: 'APAC', lat: 1.31, lng: 103.85, healthScore: 96, status: 'healthy', activeIncidents: 0, totalCapacityMW: 75, utilizationPercent: 68 },
  { id: 'hkg-1', name: 'Hong Kong DC-1', city: 'Hong Kong', country: 'Hong Kong', region: 'APAC', lat: 22.32, lng: 114.17, healthScore: 88, status: 'degraded', activeIncidents: 1, totalCapacityMW: 50, utilizationPercent: 73 },
  { id: 'fra-1', name: 'Frankfurt DC-West', city: 'Frankfurt', country: 'Germany', region: 'EMEA', lat: 50.11, lng: 8.68, healthScore: 94, status: 'healthy', activeIncidents: 0, totalCapacityMW: 90, utilizationPercent: 69 },
  { id: 'lon-1', name: 'London Docklands DC', city: 'London', country: 'UK', region: 'EMEA', lat: 51.51, lng: -0.02, healthScore: 91, status: 'healthy', activeIncidents: 1, totalCapacityMW: 70, utilizationPercent: 75 },
  { id: 'dxb-1', name: 'Dubai Edge Node', city: 'Dubai', country: 'UAE', region: 'EMEA', lat: 25.20, lng: 55.27, healthScore: 85, status: 'degraded', activeIncidents: 2, totalCapacityMW: 45, utilizationPercent: 82 },
  { id: 'iad-1', name: 'Ashburn VA Campus', city: 'Ashburn', country: 'USA', region: 'Americas', lat: 39.04, lng: -77.49, healthScore: 98, status: 'healthy', activeIncidents: 0, totalCapacityMW: 150, utilizationPercent: 76 },
  { id: 'gru-1', name: 'São Paulo DC-1', city: 'São Paulo', country: 'Brazil', region: 'Americas', lat: -23.55, lng: -46.63, healthScore: 89, status: 'healthy', activeIncidents: 1, totalCapacityMW: 55, utilizationPercent: 67 },
];

export const mockIncidents = [
  {
    id: 'INC-2026-0847', severity: 'critical', title: 'UPS Battery Bank Degradation — Redundancy Compromised',
    site: 'Mumbai DC-2', rootCause: 'Battery cell temperature anomaly in UPS Bank 3, Module 7. Thermal runaway risk elevated.',
    impactedTenants: 14, aiRecommendation: 'Immediately isolate UPS Bank 3. Redistribute critical load to Banks 1 and 2. Schedule emergency battery replacement within 4 hours. Estimated risk window: 6 hours before N+1 redundancy is fully compromised.',
    detectedAt: '2026-05-18T10:46:00Z', timeSinceDetection: '2h 14m', resolutionOwner: 'Priya Sharma', status: 'investigating',
  },
  {
    id: 'INC-2026-0845', severity: 'critical', title: 'Cooling Loop Pressure Drop — Hall B',
    site: 'Mumbai DC-2', rootCause: 'Chilled water loop pressure dropped below 2.1 bar. Likely valve actuator failure on CRAH-B-07.',
    impactedTenants: 8, aiRecommendation: 'Switch Hall B to secondary cooling loop. Dispatch maintenance to inspect CRAH-B-07 valve actuator. Predicted thermal excursion in 45 minutes if primary loop not restored.',
    detectedAt: '2026-05-18T09:58:00Z', timeSinceDetection: '3h 02m', resolutionOwner: 'Vikram Iyer', status: 'identified',
  },
  {
    id: 'INC-2026-0843', severity: 'high', title: 'Network Latency Spike — Cross-Connect Fabric',
    site: 'Hong Kong DC-1', rootCause: 'Packet loss detected on core switch HK-CORE-02. CRC errors accumulating on uplink port 48.',
    impactedTenants: 6, aiRecommendation: 'Failover traffic to redundant core switch HK-CORE-01. Schedule port 48 transceiver replacement during next maintenance window. Monitor for 30 minutes post-failover.',
    detectedAt: '2026-05-18T07:23:00Z', timeSinceDetection: '5h 37m', resolutionOwner: 'David Chen', status: 'monitoring',
  },
  {
    id: 'INC-2026-0841', severity: 'medium', title: 'Generator Fuel Level Below Threshold',
    site: 'Dubai Edge Node', rootCause: 'Diesel reserve at 34%. Scheduled refueling missed due to vendor logistics delay.',
    impactedTenants: 0, aiRecommendation: 'No immediate risk — mains power stable. Escalate to procurement for emergency fuel delivery within 12 hours. Current reserve supports 8 hours of backup generation.',
    detectedAt: '2026-05-18T04:45:00Z', timeSinceDetection: '8h 15m', resolutionOwner: 'Ahmed Al-Rashid', status: 'identified',
  },
  {
    id: 'INC-2026-0839', severity: 'medium', title: 'CCTV System Offline — Perimeter Zone 4',
    site: 'London Docklands DC', rootCause: 'NVR storage array full. Cameras in Zone 4 stopped recording at 03:42 UTC.',
    impactedTenants: 0, aiRecommendation: 'Purge recordings older than 90 days per retention policy. Expand NVR storage allocation by 2TB. Verify no security gaps during offline period via access control logs.',
    detectedAt: '2026-05-18T00:20:00Z', timeSinceDetection: '12h 40m', resolutionOwner: 'James Wright', status: 'investigating',
  },
];

export const mockKPIs = [
  { id: 'health', title: 'Global Health Score', value: '94.2', unit: 'pts', trend: 'up', trendValue: '+1.8 pts', trendIsPositive: true, status: 'healthy', sparklineData: [88,89,90,90,91,91,92,92,93,93,94,94], comparisonLabel: 'vs last week' },
  { id: 'incidents', title: 'Active Critical Incidents', value: '3', unit: '', trend: 'down', trendValue: '-2', trendIsPositive: true, status: 'warning', sparklineData: [7,6,5,5,4,5,4,3,4,3,4,3], comparisonLabel: 'vs yesterday' },
  { id: 'sla', title: 'SLA Compliance', value: '99.7', unit: '%', trend: 'up', trendValue: '+0.1%', trendIsPositive: true, status: 'healthy', sparklineData: [99.5,99.5,99.6,99.6,99.5,99.6,99.7,99.6,99.7,99.7,99.7,99.7], comparisonLabel: 'vs last month' },
  { id: 'capacity', title: 'Capacity Utilization', value: '73.4', unit: '%', trend: 'up', trendValue: '+2.1%', trendIsPositive: true, status: 'healthy', sparklineData: [68,69,70,70,71,71,72,72,73,73,73,73.4], comparisonLabel: 'vs last quarter' },
  { id: 'power', title: 'Power Availability', value: '847', unit: 'MW', trend: 'down', trendValue: '-12 MW', trendIsPositive: true, status: 'healthy', sparklineData: [860,858,855,852,850,852,849,848,850,848,847,847], comparisonLabel: 'total portfolio' },
  { id: 'cooling', title: 'Cooling Efficiency', value: '91.8', unit: '%', trend: 'down', trendValue: '-0.4%', trendIsPositive: false, status: 'warning', sparklineData: [93,93,92.5,92.5,92,92.2,92,91.8,92,91.8,91.8,91.8], comparisonLabel: 'vs last week' },
  { id: 'pue', title: 'PUE (avg)', value: '1.38', unit: '', trend: 'down', trendValue: '-0.02', trendIsPositive: true, status: 'healthy', sparklineData: [1.45,1.44,1.43,1.42,1.42,1.41,1.41,1.40,1.40,1.39,1.38,1.38], comparisonLabel: 'vs last quarter' },
  { id: 'carbon', title: 'Carbon Efficiency', value: '0.42', unit: 'tCO₂/MWh', trend: 'down', trendValue: '-0.03', trendIsPositive: true, status: 'healthy', sparklineData: [0.48,0.47,0.46,0.46,0.45,0.45,0.44,0.44,0.43,0.43,0.42,0.42], comparisonLabel: 'vs last year' },
];

export const mockInfraHealth = [
  { system: 'Power Systems', icon: 'Zap', healthPct: 96.4, degraded: 3, total: 847, redundancy: 'N+1 Active', failureRisk: 'Low' },
  { system: 'Cooling Systems', icon: 'Thermometer', healthPct: 91.8, degraded: 7, total: 312, redundancy: 'N+1 Active', failureRisk: 'Medium' },
  { system: 'Network Fabric', icon: 'Network', healthPct: 99.2, degraded: 1, total: 1204, redundancy: 'Active-Active', failureRisk: 'Low' },
  { system: 'Physical Security', icon: 'Shield', healthPct: 98.1, degraded: 2, total: 456, redundancy: 'N/A', failureRisk: 'Low' },
  { system: 'Fire Suppression', icon: 'Flame', healthPct: 100, degraded: 0, total: 189, redundancy: 'Standby Ready', failureRisk: 'None' },
  { system: 'Water Systems', icon: 'Droplets', healthPct: 94.5, degraded: 4, total: 167, redundancy: 'N+1 Active', failureRisk: 'Low' },
];

export const mockCapacityData = {
  rackUtilization: { used: 73.4, reserved: 12.1, available: 14.5, total: 14200 },
  powerMW: { consumed: 621, available: 226, total: 847 },
  coolingLoad: 84,
  whiteSpace: { totalSqm: 3200, facilities: 4, breakdown: [
    { name: 'Ashburn VA', sqm: 1200 }, { name: 'Frankfurt DC', sqm: 800 },
    { name: 'Singapore DC-2', sqm: 700 }, { name: 'Chennai Edge', sqm: 500 },
  ]},
  forecastGrowth: [
    { month: 'Jun', utilization: 73 }, { month: 'Jul', utilization: 75 },
    { month: 'Aug', utilization: 77 }, { month: 'Sep', utilization: 80 },
    { month: 'Oct', utilization: 82 }, { month: 'Nov', utilization: 85 },
  ],
};

export const mockSustainabilityData = {
  pueTrend: [
    { month: 'Jun', pue: 1.52 }, { month: 'Jul', pue: 1.49 }, { month: 'Aug', pue: 1.47 },
    { month: 'Sep', pue: 1.45 }, { month: 'Oct', pue: 1.44 }, { month: 'Nov', pue: 1.43 },
    { month: 'Dec', pue: 1.42 }, { month: 'Jan', pue: 1.41 }, { month: 'Feb', pue: 1.40 },
    { month: 'Mar', pue: 1.39 }, { month: 'Apr', pue: 1.38 }, { month: 'May', pue: 1.38 },
  ],
  industryAvgPUE: 1.58,
  carbonIntensity: { value: 0.42, unit: 'tCO₂/MWh', yoyChange: -6.7 },
  renewableMix: [
    { name: 'Renewable', value: 64, color: '#00A36C' },
    { name: 'Grid', value: 31, color: '#0077C8' },
    { name: 'Diesel Backup', value: 5, color: '#D4A017' },
  ],
  wue: 1.2,
  esgScore: 82,
  esgGrade: 'A-',
};

export const mockAIInsights = [
  {
    id: 'ai-1', severity: 'warning', confidence: 94,
    title: 'Cooling Efficiency Degradation — Mumbai DC-2',
    description: 'Thermal analysis indicates progressive efficiency loss in CRAH units serving Hall B. Current COP trending 12% below baseline. Predicted thermal imbalance within 16 hours if load distribution unchanged.',
    suggestedAction: 'Redistribute thermal load across Halls A and C. Schedule CRAH coil cleaning for Hall B.',
    timestamp: '23 min ago', affectedFacility: 'Mumbai DC-2',
  },
  {
    id: 'ai-2', severity: 'info', confidence: 89,
    title: 'Capacity Threshold Approaching — Singapore Colo Hub',
    description: 'Current rack utilization at 91.3% with 4 pending deployment requests. At current growth rate, facility will reach 95% utilization within 6 weeks.',
    suggestedAction: 'Initiate capacity expansion planning. Review pending deployments for optimization opportunities.',
    timestamp: '1h ago', affectedFacility: 'Singapore Colo Hub',
  },
  {
    id: 'ai-3', severity: 'critical', confidence: 97,
    title: 'Power Redundancy Risk — Dubai Edge Node',
    description: 'Generator fuel reserves at 34% combined with forecasted grid instability (scheduled maintenance by DEWA on 2026-05-22) creates a 72-hour risk window with reduced backup power duration.',
    suggestedAction: 'Expedite fuel delivery. Coordinate with DEWA for maintenance schedule confirmation. Pre-position mobile generator.',
    timestamp: '2h ago', affectedFacility: 'Dubai Edge Node',
  },
  {
    id: 'ai-4', severity: 'info', confidence: 86,
    title: 'PUE Optimization Opportunity — Frankfurt DC-West',
    description: 'Ambient temperature forecast for next 7 days indicates potential for 18% increase in free cooling hours. Current economizer setpoints are conservative by 2.1°C.',
    suggestedAction: 'Adjust economizer high-limit setpoint from 18°C to 20.1°C. Projected annual energy savings: €142,000.',
    timestamp: '4h ago', affectedFacility: 'Frankfurt DC-West',
  },
  {
    id: 'ai-5', severity: 'warning', confidence: 91,
    title: 'Predictive Maintenance Alert — Chennai Edge Facility',
    description: 'Vibration analysis on chiller CH-03 shows bearing wear pattern consistent with 60-day failure horizon. Similar pattern preceded CH-01 failure in Q1 2026.',
    suggestedAction: 'Schedule bearing replacement for CH-03 during next maintenance window. Order replacement parts now (lead time: 3 weeks).',
    timestamp: '6h ago', affectedFacility: 'Chennai Edge Facility',
  },
];

export const mockAlerts = [
  { id: 'a1', severity: 'critical', label: 'UPS Battery Alert — Mumbai DC-2', time: '2h ago' },
  { id: 'a2', severity: 'warning', label: 'Cooling Loop Pressure — Mumbai DC-2', time: '3h ago' },
  { id: 'a3', severity: 'warning', label: 'Fuel Level Low — Dubai Edge', time: '8h ago' },
  { id: 'a4', severity: 'info', label: 'CCTV Offline — London DC', time: '12h ago' },
];

export const mockEscalations = [
  { id: 'e1', label: 'Mumbai DC-2 incidents escalated to Regional Director', time: '1h ago' },
  { id: 'e2', label: 'Dubai fuel delivery escalated to VP Operations', time: '6h ago' },
];

export const mockMaintenanceSchedule = [
  { id: 'm1', site: 'Frankfurt DC-West', task: 'Scheduled UPS Maintenance', start: 'May 20, 02:00 UTC', end: '06:00 UTC' },
  { id: 'm2', site: 'Singapore Colo Hub', task: 'Network Firmware Upgrade', start: 'May 21, 22:00 UTC', end: 'May 22, 02:00 UTC' },
  { id: 'm3', site: 'Ashburn VA Campus', task: 'Generator Load Test', start: 'May 23, 14:00 UTC', end: '16:00 UTC' },
];

export const mockSLARisks = [
  { id: 's1', site: 'Mumbai DC-2', metric: 'Power SLA', target: '99.95%', current: '99.91%', severity: 'warning' },
  { id: 's2', site: 'Hong Kong DC-1', metric: 'Latency SLA', target: '< 1ms', current: '0.94ms', severity: 'warning' },
];

export const mockWeatherRisks = [
  { id: 'w1', type: 'Cyclone', description: 'Bay of Bengal advisory — Chennai facility within watch zone. Landfall ETA: 72h.', severity: 'critical' },
  { id: 'w2', type: 'Heatwave', description: 'Dubai — ambient temps exceeding 48°C expected May 20–23.', severity: 'warning' },
];
