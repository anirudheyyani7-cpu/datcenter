// Per-rack metrics for all 12 datacenters — v3 DC Asset Twin data
// Each datacenter has rows A-D with 8 racks each (32 racks total)

const rackStatuses = ['operational', 'warning', 'critical'];

function rack(id, dcId, row, num, kw, maxKw, spaceU, maxU, weightKg, maxWeightKg, portsUsed, totalPorts, inletTemp, tenant) {
  const utilPct = Math.round((kw / maxKw) * 100);
  const status = utilPct > 90 ? 'critical' : utilPct > 75 ? 'warning' : 'operational';
  return {
    id: `${dcId}-${row}${num}`,
    dcId,
    label: `${row}-${String(num).padStart(2, '0')}`,
    row,
    position: num,
    powerKw: kw,
    maxPowerKw: maxKw,
    spaceUsedU: spaceU,
    spaceTotalU: maxU,
    weightKg,
    maxWeightKg,
    portsUsed,
    totalPorts,
    inletTempC: inletTemp,
    tenant: tenant || null,
    status,
    utilPct,
    aiRecommendation: status === 'critical'
      ? 'Immediate attention required — power draw exceeding safe threshold. Consider load balancing to adjacent racks.'
      : status === 'warning'
      ? 'Approaching capacity limit. Plan for expansion or redistribute workload within 30 days.'
      : 'Operating within normal parameters. No action required.',
  };
}

export const mockRacks = {
  'mum-1': [
    rack('', 'mum-1', 'A', 1, 18.4, 40, 32, 42, 310, 500, 18, 48, 23, 'Reliance Jio'),
    rack('', 'mum-1', 'A', 2, 22.1, 40, 36, 42, 380, 500, 24, 48, 24, 'Reliance Jio'),
    rack('', 'mum-1', 'A', 3, 35.8, 40, 40, 42, 420, 500, 38, 48, 31, 'Infosys'),
    rack('', 'mum-1', 'A', 4, 28.6, 40, 38, 42, 395, 500, 30, 48, 27, 'Infosys'),
    rack('', 'mum-1', 'A', 5, 12.4, 40, 22, 42, 220, 500, 14, 48, 21, 'TCS'),
    rack('', 'mum-1', 'A', 6, 19.7, 40, 34, 42, 340, 500, 20, 48, 23, 'TCS'),
    rack('', 'mum-1', 'A', 7, 8.2,  40, 16, 42, 180, 500, 10, 48, 20, null),
    rack('', 'mum-1', 'A', 8, 5.1,  40, 10, 42, 110, 500, 6,  48, 19, null),
    rack('', 'mum-1', 'B', 1, 31.2, 40, 38, 42, 405, 500, 32, 48, 28, 'HDFC Bank'),
    rack('', 'mum-1', 'B', 2, 29.5, 40, 36, 42, 390, 500, 30, 48, 27, 'HDFC Bank'),
    rack('', 'mum-1', 'B', 3, 38.1, 40, 41, 42, 445, 500, 42, 48, 33, 'ICICI Bank'),
    rack('', 'mum-1', 'B', 4, 36.9, 40, 40, 42, 430, 500, 40, 48, 32, 'ICICI Bank'),
    rack('', 'mum-1', 'B', 5, 24.3, 40, 34, 42, 355, 500, 26, 48, 25, 'Wipro'),
    rack('', 'mum-1', 'B', 6, 21.8, 40, 32, 42, 325, 500, 22, 48, 24, 'Wipro'),
    rack('', 'mum-1', 'B', 7, 14.5, 40, 24, 42, 245, 500, 16, 48, 22, null),
    rack('', 'mum-1', 'B', 8, 9.3,  40, 18, 42, 190, 500, 10, 48, 20, null),
    rack('', 'mum-1', 'C', 1, 26.7, 40, 36, 42, 375, 500, 28, 48, 26, 'HCL Tech'),
    rack('', 'mum-1', 'C', 2, 23.4, 40, 34, 42, 350, 500, 24, 48, 25, 'HCL Tech'),
    rack('', 'mum-1', 'C', 3, 17.8, 40, 28, 42, 290, 500, 18, 48, 22, 'Tata Comm'),
    rack('', 'mum-1', 'C', 4, 15.2, 40, 26, 42, 265, 500, 16, 48, 22, 'Tata Comm'),
    rack('', 'mum-1', 'C', 5, 33.6, 40, 39, 42, 415, 500, 36, 48, 30, 'Azure India'),
    rack('', 'mum-1', 'C', 6, 32.1, 40, 38, 42, 410, 500, 34, 48, 29, 'Azure India'),
    rack('', 'mum-1', 'C', 7, 11.4, 40, 20, 42, 210, 500, 12, 48, 21, null),
    rack('', 'mum-1', 'C', 8, 6.8,  40, 14, 42, 150, 500, 8,  48, 20, null),
    rack('', 'mum-1', 'D', 1, 20.5, 40, 30, 42, 315, 500, 22, 48, 24, 'AWS Mumbai'),
    rack('', 'mum-1', 'D', 2, 19.1, 40, 30, 42, 305, 500, 20, 48, 23, 'AWS Mumbai'),
    rack('', 'mum-1', 'D', 3, 27.8, 40, 36, 42, 380, 500, 28, 48, 26, 'GCP India'),
    rack('', 'mum-1', 'D', 4, 25.3, 40, 34, 42, 360, 500, 26, 48, 25, 'GCP India'),
    rack('', 'mum-1', 'D', 5, 13.6, 40, 22, 42, 235, 500, 14, 48, 21, null),
    rack('', 'mum-1', 'D', 6, 10.9, 40, 20, 42, 215, 500, 12, 48, 21, null),
    rack('', 'mum-1', 'D', 7, 7.4,  40, 14, 42, 160, 500, 8,  48, 20, null),
    rack('', 'mum-1', 'D', 8, 4.2,  40, 8,  42, 90,  500, 4,  48, 19, null),
  ],

  'mum-2': [
    rack('', 'mum-2', 'A', 1, 36.8, 40, 40, 42, 440, 500, 40, 48, 34, 'Airtel'),
    rack('', 'mum-2', 'A', 2, 37.4, 40, 41, 42, 445, 500, 42, 48, 35, 'Airtel'),
    rack('', 'mum-2', 'A', 3, 38.9, 40, 41, 42, 448, 500, 44, 48, 36, 'Vodafone'),
    rack('', 'mum-2', 'A', 4, 34.2, 40, 39, 42, 420, 500, 38, 48, 32, 'Vodafone'),
    rack('', 'mum-2', 'A', 5, 30.1, 40, 37, 42, 400, 500, 34, 48, 29, 'BSNL'),
    rack('', 'mum-2', 'A', 6, 28.7, 40, 36, 42, 390, 500, 30, 48, 28, 'BSNL'),
    rack('', 'mum-2', 'A', 7, 25.4, 40, 34, 42, 365, 500, 26, 48, 26, null),
    rack('', 'mum-2', 'A', 8, 22.6, 40, 32, 42, 340, 500, 24, 48, 25, null),
    rack('', 'mum-2', 'B', 1, 39.2, 40, 42, 42, 452, 500, 46, 48, 37, 'SBI'),
    rack('', 'mum-2', 'B', 2, 38.5, 40, 41, 42, 448, 500, 44, 48, 36, 'SBI'),
    rack('', 'mum-2', 'B', 3, 32.7, 40, 38, 42, 410, 500, 36, 48, 30, 'Paytm'),
    rack('', 'mum-2', 'B', 4, 31.4, 40, 37, 42, 400, 500, 34, 48, 29, 'Paytm'),
    rack('', 'mum-2', 'B', 5, 27.8, 40, 35, 42, 380, 500, 28, 48, 27, null),
    rack('', 'mum-2', 'B', 6, 24.5, 40, 33, 42, 360, 500, 26, 48, 26, null),
    rack('', 'mum-2', 'B', 7, 20.3, 40, 30, 42, 320, 500, 22, 48, 24, null),
    rack('', 'mum-2', 'B', 8, 18.1, 40, 28, 42, 295, 500, 20, 48, 23, null),
    rack('', 'mum-2', 'C', 1, 35.6, 40, 39, 42, 430, 500, 40, 48, 33, 'Razorpay'),
    rack('', 'mum-2', 'C', 2, 33.9, 40, 38, 42, 415, 500, 36, 48, 31, 'Razorpay'),
    rack('', 'mum-2', 'C', 3, 29.3, 40, 36, 42, 395, 500, 32, 48, 28, 'PhonePe'),
    rack('', 'mum-2', 'C', 4, 26.8, 40, 34, 42, 375, 500, 28, 48, 27, 'PhonePe'),
    rack('', 'mum-2', 'C', 5, 23.1, 40, 32, 42, 350, 500, 24, 48, 25, null),
    rack('', 'mum-2', 'C', 6, 21.4, 40, 30, 42, 325, 500, 22, 48, 24, null),
    rack('', 'mum-2', 'C', 7, 17.6, 40, 26, 42, 280, 500, 18, 48, 23, null),
    rack('', 'mum-2', 'C', 8, 15.2, 40, 24, 42, 255, 500, 16, 48, 22, null),
    rack('', 'mum-2', 'D', 1, 40.2, 40, 42, 42, 460, 500, 46, 48, 38, 'Oracle Cloud'),
    rack('', 'mum-2', 'D', 2, 39.7, 40, 42, 42, 458, 500, 46, 48, 37, 'Oracle Cloud'),
    rack('', 'mum-2', 'D', 3, 36.4, 40, 40, 42, 440, 500, 42, 48, 34, 'IBM Cloud'),
    rack('', 'mum-2', 'D', 4, 34.8, 40, 39, 42, 425, 500, 38, 48, 32, 'IBM Cloud'),
    rack('', 'mum-2', 'D', 5, 31.2, 40, 37, 42, 405, 500, 34, 48, 30, null),
    rack('', 'mum-2', 'D', 6, 28.4, 40, 35, 42, 385, 500, 30, 48, 28, null),
    rack('', 'mum-2', 'D', 7, 24.7, 40, 33, 42, 360, 500, 26, 48, 26, null),
    rack('', 'mum-2', 'D', 8, 21.3, 40, 31, 42, 335, 500, 22, 48, 24, null),
  ],

  'che-1': generateRacks('che-1', 0.65, ['TAFE Systems', 'Zoho', 'Freshworks', null, null]),
  'hyd-1': generateRacks('hyd-1', 0.79, ['Microsoft', 'Google Cloud', 'Meta', 'Amazon', 'Flipkart']),
  'sgp-1': generateRacks('sgp-1', 0.91, ['DBS Bank', 'Singtel', 'StarHub', 'UOB', 'OCBC', 'AWS SG']),
  'sgp-2': generateRacks('sgp-2', 0.68, ['Grab', 'SEA Group', 'Gojek', null, null]),
  'hkg-1': generateRacks('hkg-1', 0.73, ['HSBC', 'Standard Chartered', 'Li & Fung', null, null]),
  'fra-1': generateRacks('fra-1', 0.69, ['Deutsche Bank', 'SAP', 'BMW Cloud', 'Allianz', null]),
  'lon-1': generateRacks('lon-1', 0.75, ['Barclays', 'HSBC UK', 'BT Group', 'Sky', null]),
  'dxb-1': generateRacks('dxb-1', 0.82, ['Emirates NBD', 'Etisalat', 'ADNOC', null, null]),
  'iad-1': generateRacks('iad-1', 0.76, ['AWS US-East', 'Azure US', 'DoD Cloud', 'Verizon', 'Booz Allen']),
  'gru-1': generateRacks('gru-1', 0.67, ['Bradesco', 'Itaú', 'Embratel', null, null]),
};

function generateRacks(dcId, avgUtil, tenants) {
  const rows = ['A', 'B', 'C', 'D'];
  const racks = [];
  rows.forEach((row, ri) => {
    for (let i = 1; i <= 8; i++) {
      const variance = (Math.random() - 0.5) * 0.3;
      const util = Math.min(0.98, Math.max(0.1, avgUtil + variance));
      const kw = Math.round(util * 40 * 10) / 10;
      const spaceU = Math.round(util * 42);
      const weightKg = Math.round(util * 500 * 0.9);
      const portsUsed = Math.round(util * 48);
      const baseTemp = 19 + Math.round(util * 18);
      const tenant = tenants[Math.floor((ri * 8 + i - 1) / Math.ceil(32 / tenants.length))] || null;
      racks.push(rack('', dcId, row, i, kw, 40, spaceU, 42, weightKg, 500, portsUsed, 48, baseTemp, tenant));
    }
  });
  return racks;
}
