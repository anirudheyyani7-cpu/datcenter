// Stage data for the Services "train route" diagram.
// x/y are coordinates in the SVG viewBox (0 0 1600 580).
// side controls whether the label is drawn above ('top') or below ('bottom') the dot.
// active=true means we currently have an agent live for that service (glows green).
// description is shown in the hover tooltip — what the service/agent actually does.

export const PHASES = [
  { id: 'fund',         label: 'FUND',           from: 0,  to: 6,  color: '#00338D' },
  { id: 'design-build', label: 'DESIGN & BUILD', from: 6,  to: 13, color: '#0077C8' },
  { id: 'operate',      label: 'OPERATE',        from: 13, to: 18, color: '#00A36C' },
  { id: 'refinance',    label: 'REFINANCE',      from: 18, to: 20, color: '#D4A017' },
];

export const SERVICE_STAGES = [
  { key: 'land-audit',        label: 'Land Audit',                          x: 60,   y: 430, side: 'bottom', active: true,
    description: 'Live agent: automatically verifies land title, encumbrances, zoning and statutory approvals for a candidate site before acquisition.' },
  { key: 'market-site',       label: 'Market & Site Feasibility',           x: 134,  y: 380, side: 'bottom', active: false,
    description: 'Evaluates demand drivers, power availability, connectivity and competitive supply to shortlist viable sites.' },
  { key: 'business-case',     label: 'Business Case Development',          x: 208,  y: 280, side: 'bottom', active: false,
    description: 'Builds the financial model and investment thesis used to justify the project to stakeholders.' },
  { key: 'power-ppa',         label: 'Power & PPA Purchasing',              x: 282,  y: 180, side: 'top',    active: false,
    description: 'Negotiates grid connection capacity and power purchase agreements, including renewable sourcing.' },
  { key: 'investment-funding',label: 'Investment & Funding Strategy',       x: 356,  y: 100, side: 'top',    active: false,
    description: 'Defines the capital stack — debt/equity mix, investor targeting and funding sequencing.' },
  { key: 'investment-entity', label: 'Investment & Entity Structure',       x: 430,  y: 120, side: 'bottom', active: false,
    description: 'Designs the legal and tax-efficient holding structure for the investment.' },
  { key: 'risk-regulatory',   label: 'Risk, Regulatory & Economic Assessment', x: 504, y: 220, side: 'top', active: false,
    description: 'Assesses regulatory, environmental and macroeconomic risk exposure ahead of commitment.' },
  { key: 'technical-arch',    label: 'Technical Architecture, Engineering & Connectivity', x: 578, y: 300, side: 'top', active: false,
    description: 'Defines facility electrical, mechanical and network architecture and core engineering specs.' },
  { key: 'sustainability',    label: 'Sustainability & ESG',                x: 652,  y: 360, side: 'top',    active: false,
    description: 'Tracks PUE/WUE targets, carbon reporting and certification pathways (LEED, BREEAM, etc).' },
  { key: 'procurement',       label: 'Procurement & Contracting',           x: 726,  y: 390, side: 'bottom', active: false,
    description: 'Runs vendor tendering, equipment procurement and contract negotiation for the build.' },
  { key: 'construction',      label: 'Construction Management',             x: 800,  y: 425, side: 'bottom', active: false,
    description: 'Oversees on-site construction schedule, budget and quality across all trades.' },
  { key: 'fitout',            label: 'Fitout and Connectivity',             x: 874,  y: 395, side: 'bottom', active: false,
    description: 'Coordinates data hall fit-out, cabling and carrier/cross-connect provisioning.' },
  { key: 'qa-testing',        label: 'Quality Assurance & Testing',         x: 948,  y: 340, side: 'bottom', active: false,
    description: 'Runs factory and site acceptance testing, integrated systems testing and commissioning QA.' },
  { key: 'operational-ready', label: 'Operational Readiness',               x: 1022, y: 300, side: 'top',    active: false,
    description: 'Validates staffing, SOPs and handover documentation before go-live.' },
  { key: 'ops-facility',      label: 'Operations & Facility Management',    x: 1096, y: 260, side: 'top',    active: false,
    description: 'Runs day-to-day facility operations, preventive maintenance and vendor SLAs.' },
  { key: 'monitoring',        label: 'Monitoring & Optimisation',           x: 1170, y: 240, side: 'top',    active: false,
    description: 'Continuously tracks capacity, power and thermal performance to optimise efficiency.' },
  { key: 'dcim',              label: 'DCIM',                                x: 1244, y: 230, side: 'bottom', active: true,
    description: 'Live agent: real-time data centre infrastructure management — asset, capacity, power and thermal telemetry in one pane.' },
  { key: 'compliance',        label: 'Compliance & Reporting',              x: 1318, y: 200, side: 'top',    active: false,
    description: 'Maintains audit trails and regulatory reporting (SOC2, ISO27001, local statutory filings).' },
  { key: 'cyber-physical',    label: 'Cyber & Physical Security',           x: 1392, y: 150, side: 'top',    active: false,
    description: 'Manages perimeter, access control and cyber-security posture across the facility.' },
  { key: 'refinancing',       label: 'Refinancing & Capital Recycling',     x: 1466, y: 80,  side: 'top',    active: false,
    description: 'Structures refinancing events to recycle capital once the asset stabilises.' },
  { key: 'buy-sell',          label: 'Buy / Sell / Fundraise',              x: 1540, y: 110, side: 'bottom', active: false,
    description: 'Runs the sale or fundraising process — data room, due diligence support and deal close.' },
];
