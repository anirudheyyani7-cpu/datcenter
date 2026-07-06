// data/mock/rackAssets.js
// Deterministic asset-list generator for RackElevationView and the Assets table.
// Each rack carries 8-18 assets with U-position ranges.

const ASSET_TYPES = [
  { type: 'GPU Server',      vendors: ['NVIDIA', 'AMD'],       models: ['DGX H100', 'DGX A100', 'MI300X'],          uSize: 4, kw: 2.8, color: '#7C3AED' },
  { type: 'Compute Server',  vendors: ['Dell', 'HPE', 'Cisco'],models: ['PowerEdge R750', 'ProLiant DL360', 'UCS B200'], uSize: 2, kw: 0.6, color: '#0077C8' },
  { type: 'Storage',         vendors: ['NetApp', 'Pure', 'IBM'],models: ['AFF A250', 'FlashArray//C', 'FlashSystem 9200'], uSize: 4, kw: 0.8, color: '#00A36C' },
  { type: 'Network Switch',  vendors: ['Cisco', 'Arista', 'Juniper'], models: ['Nexus 93180YC', 'DCS-7060CX', 'QFX5200'], uSize: 2, kw: 0.4, color: '#F59E0B' },
  { type: 'Firewall',        vendors: ['Palo Alto', 'Fortinet'], models: ['PA-5450', 'FG-3301E'],                    uSize: 2, kw: 0.3, color: '#EF4444' },
  { type: 'Load Balancer',   vendors: ['F5', 'Citrix'],         models: ['BIG-IP i5800', 'ADC SDX 26100'],           uSize: 2, kw: 0.5, color: '#06B6D4' },
  { type: 'PDU',             vendors: ['Vertiv', 'APC', 'Raritan'], models: ['Geist rPDU', 'Rack PDU AP8868', 'PX3-5190V'], uSize: 1, kw: 0.2, color: '#64748B' },
  { type: 'KVM / Console',   vendors: ['Raritan', 'Avocent'],   models: ['Dominion KX IV', 'ACS8048'], uSize: 1, kw: 0.1, color: '#A78BFA' },
  { type: 'Tape Library',    vendors: ['Quantum', 'IBM'],       models: ['Scalar i6', '3584 TS4500'],                uSize: 6, kw: 1.2, color: '#84CC16' },
  { type: 'UPS Module',      vendors: ['Eaton', 'APC'],         models: ['9PX6KI', 'Smart-UPS SRT 6000'],           uSize: 3, kw: 0.8, color: '#F97316' },
];

const LIFECYCLE_STAGES = ['In Use', 'In Use', 'In Use', 'In Maintenance', 'End of Life'];

function lcg(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 4294967296; };
}

function seedFrom(str) {
  return str.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 17);
}

function eolDate(rng, yearsFromNow) {
  const y = 2025 + Math.floor(rng() * yearsFromNow) + 1;
  const m = Math.floor(rng() * 12) + 1;
  const d = Math.floor(rng() * 28) + 1;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m-1]} ${d}, ${y}`;
}

/** Returns an array of asset objects for a given rack.
 *  rackLabel: e.g. 'A-01'; dcId: e.g. 'sgp-1'
 */
export function generateRackAssets(rackLabel, dcId) {
  const rng = lcg(seedFrom(`${dcId}-${rackLabel}`));
  const assets = [];
  let u = 1;
  const maxU = 42;

  while (u <= maxU - 1) {
    const typeIdx = Math.floor(rng() * ASSET_TYPES.length);
    const t = ASSET_TYPES[typeIdx];
    const vendorIdx = Math.floor(rng() * t.vendors.length);
    const modelIdx  = Math.floor(rng() * t.models.length);
    const uSize     = t.uSize;
    if (u + uSize - 1 > maxU - 1) break; // leave 1U for PDU at U42

    const id = `${dcId}-${rackLabel}-${String(assets.length + 1).padStart(2,'0')}`;
    const status = rng() > 0.92 ? 'Critical' : rng() > 0.85 ? 'Maintenance' : 'Operational';
    const lifecycleStage = LIFECYCLE_STAGES[Math.floor(rng() * LIFECYCLE_STAGES.length)];
    assets.push({
      id,
      name:          `${t.type.replace(/\s/g,'-')}-${String(assets.length + 1).padStart(2,'0')}`,
      type:          t.type,
      vendor:        t.vendors[vendorIdx],
      model:         t.models[modelIdx],
      serialNumber:  `SN-${dcId.toUpperCase()}-${Math.floor(rng() * 900000 + 100000)}`,
      status,
      powerKw:       +(t.kw * (0.8 + rng() * 0.4)).toFixed(1),
      uStart:        u,
      uEnd:          u + uSize - 1,
      uPosition:     uSize === 1 ? `U${u}` : `U${u} - U${u + uSize - 1}`,
      lifecycleStage,
      eolDate:       eolDate(rng, 4),
      color:         t.color,
    });

    u += uSize + (rng() > 0.6 ? 1 : 0); // occasional 1U gap
  }

  // Always cap with a PDU at the last 2U
  assets.push({
    id:            `${dcId}-${rackLabel}-pdu`,
    name:          `PDU-${rackLabel.replace('-','')}-1`,
    type:          'PDU',
    vendor:        'Vertiv',
    model:         'Geist rPDU',
    serialNumber:  `SN-${dcId.toUpperCase()}-PDU-${Math.floor(seedFrom(rackLabel) % 99999)}`,
    status:        'Operational',
    powerKw:       0.2,
    uStart:        41,
    uEnd:          42,
    uPosition:     'U41 - U42',
    lifecycleStage: 'In Use',
    eolDate:       'Jan 10, 2029',
    color:         '#64748B',
  });

  return assets;
}
