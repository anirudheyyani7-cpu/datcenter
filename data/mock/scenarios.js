// Failure Scenario Simulator mock data for v3
// Pre-computed scenario results for 4 failure types × key datacenters

export const scenarioTypes = [
  {
    id: 'power_failure',
    label: 'Power Failure',
    description: 'Simulate UPS/generator failover sequence following utility power loss',
    icon: 'Zap',
    color: '#f59e0b',
    params: [
      { id: 'failed_ups', label: 'Failed UPS Bank', type: 'select', options: ['UPS-A', 'UPS-B', 'UPS-A + UPS-B'] },
      { id: 'generator_start', label: 'Generator Start Delay', type: 'select', options: ['10 seconds', '30 seconds', '60 seconds', 'Generator fails'] },
    ],
  },
  {
    id: 'cooling_failure',
    label: 'Cooling Failure',
    description: 'Model thermal runaway when one or more CRAH/chiller units go offline',
    icon: 'Thermometer',
    color: '#ef4444',
    params: [
      { id: 'failed_crahs', label: 'Failed CRAH Units', type: 'select', options: ['CRAH-1', 'CRAH-1 + CRAH-2', 'All CRAHs'] },
      { id: 'ambient_temp', label: 'Ambient Temperature', type: 'select', options: ['Normal (22°C)', 'Elevated (28°C)', 'Critical (35°C)'] },
    ],
  },
  {
    id: 'network_failure',
    label: 'Network Failure',
    description: 'Trace connectivity loss from core switch or uplink failure to affected tenants',
    icon: 'Network',
    color: '#8b5cf6',
    params: [
      { id: 'failed_switch', label: 'Failed Component', type: 'select', options: ['Core Switch A', 'Core Switch B', 'Both Core Switches', 'Uplink to ISP'] },
      { id: 'failover_mode', label: 'Failover Mode', type: 'select', options: ['Active-Active (auto)', 'Active-Standby (manual)', 'No failover'] },
    ],
  },
  {
    id: 'capacity_breach',
    label: 'Capacity Breach',
    description: 'Preview what happens when a planned deployment exceeds power, space, or weight limits',
    icon: 'AlertTriangle',
    color: '#f97316',
    params: [
      { id: 'breach_type', label: 'Breach Type', type: 'select', options: ['Power (kW)', 'Space (U)', 'Weight (kg)', 'Port capacity'] },
      { id: 'deployment_ref', label: 'Deployment Reference', type: 'select', options: ['dep-005 — DBS NVIDIA DGX', 'dep-010 — Dubai UPS', 'Custom simulation'] },
    ],
  },
];

export const mockScenarioResults = {
  power_failure: {
    'mum-1': {
      resilienceScore: 94,
      redundancyLevel: '2N',
      timeline: [
        { t: 0,  event: 'Utility power loss detected on Feed A', severity: 'critical' },
        { t: 2,  event: 'UPS-A engaged — full load transfer in 150ms', severity: 'info' },
        { t: 8,  event: 'Generator GEN-01 start command issued', severity: 'warning' },
        { t: 38, event: 'Generator GEN-01 online — 2.4MW output stable', severity: 'info' },
        { t: 45, event: 'Automatic Transfer Switch (ATS) completed — utility bypassed', severity: 'info' },
        { t: 60, event: 'All systems confirmed on generator power', severity: 'info' },
        { t: 90, event: 'UPS-A battery at 87% — 4.2 hours runtime remaining', severity: 'warning' },
        { t: 120, event: 'Stable operations confirmed. Generator fuel: 94%. ETA utility restore: unknown', severity: 'info' },
      ],
      affectedRacks: [],
      cascadeEffects: [
        'PDU-MUM1-04 briefly dipped to 210V during transfer (within tolerance)',
        'NOC alerted at T+5s — incident ticket #9821 auto-raised',
        'Generator fuel consumption: ~180L/hour at current load',
      ],
      mitigations: [
        'Test ATS transfer monthly to ensure <200ms handoff',
        'Maintain generator fuel above 60% at all times',
        'Consider upgrading to 2N+1 UPS configuration for Hall B',
      ],
      outcome: 'no_impact',
    },
    'mum-2': {
      resilienceScore: 52,
      redundancyLevel: 'N+1 (degraded)',
      timeline: [
        { t: 0,   event: 'Utility power loss detected on both feeds', severity: 'critical' },
        { t: 2,   event: 'UPS-A engaged — UPS-B offline (thermal anomaly)', severity: 'critical' },
        { t: 5,   event: 'Racks mum-2-D1 to D8 on PDU-B lost power (UPS-B failure)', severity: 'critical' },
        { t: 12,  event: 'Generator start command issued', severity: 'warning' },
        { t: 42,  event: 'Generator GEN-01 online — partial load', severity: 'info' },
        { t: 55,  event: 'PDU-B restored from generator — racks powering up', severity: 'warning' },
        { t: 75,  event: '8 servers failed POST after ungraceful shutdown', severity: 'critical' },
        { t: 120, event: 'Partial restoration — 3 racks still unresponsive', severity: 'critical' },
      ],
      affectedRacks: ['mum-2-D1', 'mum-2-D2', 'mum-2-D3', 'mum-2-D4', 'mum-2-D5', 'mum-2-D6', 'mum-2-D7', 'mum-2-D8'],
      cascadeEffects: [
        'Oracle Cloud and IBM Cloud tenants experienced 55-second full outage',
        '8 servers required manual POST intervention — 3 unresponsive',
        'SLA breach threshold triggered for Oracle Cloud (99.95% SLA)',
      ],
      mitigations: [
        'URGENT: Resolve UPS-B thermal anomaly before next maintenance window',
        'Install bypass PDU feed for Row D to prevent single UPS dependency',
        'Add UPS-C to achieve true 2N redundancy',
      ],
      outcome: 'partial_outage',
    },
  },

  cooling_failure: {
    'mum-2': {
      resilienceScore: 41,
      redundancyLevel: 'N (single point)',
      timeline: [
        { t: 0,   event: 'CRAH-1 and CRAH-2 offline simultaneously — supply failure', severity: 'critical' },
        { t: 5,   event: 'Hall B ambient temperature rising: 27°C → 30°C', severity: 'warning' },
        { t: 15,  event: 'Rack B-03 inlet temp: 35°C — thermal threshold breached', severity: 'critical' },
        { t: 20,  event: 'Server throttling detected in Row B — performance impact', severity: 'warning' },
        { t: 30,  event: 'Hall B ambient: 36°C — emergency shutdown recommended', severity: 'critical' },
        { t: 35,  event: 'Rack B-01, B-02, B-03 auto-shutdown triggered (IPMI)', severity: 'critical' },
        { t: 45,  event: 'Row A approaching 34°C — cascade risk in 10 minutes', severity: 'critical' },
        { t: 60,  event: 'Emergency portable CRAC units dispatched — ETA 90 minutes', severity: 'warning' },
        { t: 120, event: 'Hall B at 41°C — all racks in Rows A-B have shut down', severity: 'critical' },
      ],
      affectedRacks: ['mum-2-A1','mum-2-A2','mum-2-A3','mum-2-A4','mum-2-B1','mum-2-B2','mum-2-B3','mum-2-B4'],
      cascadeEffects: [
        'SBI tenant: 35-minute complete outage — SLA breach imminent',
        'Physical hardware damage risk above 45°C — reached at T+75s (estimated)',
        'Airtel, Vodafone tenants impacted — business continuity plans activated',
      ],
      mitigations: [
        'Install 3rd CRAH unit (Vertiv Liebert CRV deployment dep-006 already approved)',
        'Enable hot-aisle containment to slow thermal runaway rate',
        'Set IPMI auto-shutdown triggers at 34°C (not 40°C)',
        'Pre-position portable CRAC units in facility for <15min deploy time',
      ],
      outcome: 'major_outage',
    },
    'fra-1': {
      resilienceScore: 88,
      redundancyLevel: 'N+1',
      timeline: [
        { t: 0,  event: 'CRAH-2 offline — bearing failure detected', severity: 'warning' },
        { t: 3,  event: 'CRAH-1 and CRAH-3 ramping to compensate — load redistribution', severity: 'info' },
        { t: 15, event: 'Hall temperatures stable at 22°C — N+1 holding', severity: 'info' },
        { t: 30, event: 'Maintenance alert dispatched for CRAH-2 repair', severity: 'warning' },
        { t: 60, event: 'All systems nominal — zero tenant impact', severity: 'info' },
      ],
      affectedRacks: [],
      cascadeEffects: [
        'PUE temporarily increased from 1.28 to 1.31 during compensation',
        'CRAH-1 and CRAH-3 running at 87% capacity — no headroom for second failure',
      ],
      mitigations: [
        'Schedule CRAH-2 repair within 48 hours before another unit fails',
        'Consider adding CRAH-4 to achieve 2N cooling redundancy',
      ],
      outcome: 'no_impact',
    },
  },

  network_failure: {
    'hkg-1': {
      resilienceScore: 61,
      redundancyLevel: 'Active-Active (partial)',
      timeline: [
        { t: 0,  event: 'Core Switch HK-CORE-02 CRC errors escalating — link degraded', severity: 'warning' },
        { t: 8,  event: 'HK-CORE-02 fully offline — BGP sessions dropped', severity: 'critical' },
        { t: 10, event: 'Active-Active failover triggered to HK-CORE-01', severity: 'warning' },
        { t: 18, event: 'Partial failover complete — 60% traffic restored', severity: 'warning' },
        { t: 25, event: 'HSBC and Standard Chartered experiencing packet loss >5%', severity: 'critical' },
        { t: 40, event: 'HK-CORE-01 overloaded at 94% — further degradation', severity: 'critical' },
        { t: 60, event: 'Emergency ISP rerouting requested — ETA 20 minutes', severity: 'warning' },
        { t: 80, event: 'ISP alternate path active — connectivity partially restored', severity: 'info' },
        { t: 120, event: 'Stable at 80% capacity — HK-CORE-02 replacement on order', severity: 'warning' },
      ],
      affectedRacks: [],
      cascadeEffects: [
        'HSBC tenant: 40% packet loss for 55 minutes — transaction failures reported',
        'Standard Chartered: API gateway timeouts for 30 minutes',
        'Li & Fung: VPN tunnels dropped — remote work impact for 140 users',
      ],
      mitigations: [
        'Replace HK-CORE-02 immediately — hardware is failing',
        'Upgrade to dual-core ECMP configuration to prevent overload on single switch',
        'Pre-provision ISP alternate path for <5min activation',
      ],
      outcome: 'degraded',
    },
    'iad-1': {
      resilienceScore: 97,
      redundancyLevel: 'Active-Active 2N',
      timeline: [
        { t: 0,  event: 'Core Switch IAD-CORE-A uplink failure detected', severity: 'warning' },
        { t: 1,  event: 'ECMP rerouting to IAD-CORE-B — 50ms convergence', severity: 'info' },
        { t: 2,  event: 'All traffic on IAD-CORE-B — zero packet loss', severity: 'info' },
        { t: 10, event: 'NOC alerted — ticket #8824 raised for switch A investigation', severity: 'info' },
        { t: 60, event: 'IAD-CORE-A uplink replaced — dual-path restored', severity: 'info' },
      ],
      affectedRacks: [],
      cascadeEffects: ['Brief BGP reconvergence caused <10ms jitter — within SLA tolerance'],
      mitigations: ['Replace aging transceivers on IAD-CORE-A proactively'],
      outcome: 'no_impact',
    },
  },

  capacity_breach: {
    'sgp-1': {
      resilienceScore: 35,
      redundancyLevel: 'N/A — capacity planning',
      timeline: [
        { t: 0,  event: 'Deployment dep-005 submitted: 8× NVIDIA DGX H100 to Rack B-03', severity: 'warning' },
        { t: 1,  event: 'POWER CHECK FAILED — impact +64kW exceeds rack headroom of 7.9kW', severity: 'critical' },
        { t: 2,  event: 'WEIGHT CHECK FAILED — 560kg impact, rack B-03 rated to 500kg max', severity: 'critical' },
        { t: 3,  event: 'Space check passed — 16U available', severity: 'info' },
        { t: 4,  event: 'Deployment BLOCKED — requires capacity resolution before approval', severity: 'critical' },
      ],
      affectedRacks: ['sgp-1-B3'],
      cascadeEffects: [
        'If deployed without resolution: PDU-SG-B would trip at 108% load',
        'Structural floor loading exceeded — risk of rack collapse',
        'Cooling insufficient for +64kW in current zone — thermal runaway in 8 minutes',
      ],
      mitigations: [
        'Split deployment across 4 racks to distribute power load',
        'Request dedicated power feed from PDU-SG-C (currently 40% utilized)',
        'Reinforce floor plate under B-03 (structural team consult required)',
        'Add 2 in-row coolers adjacent to DGX cluster before installation',
      ],
      outcome: 'blocked',
    },
  },
};
