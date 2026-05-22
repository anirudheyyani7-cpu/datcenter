'use client';
import { Package } from 'lucide-react';
import StageLayout from '@/components/stage-pages/StageLayout';
import { FormField, Select, MultiSelect, TextInput } from '@/components/stage-pages/FormComponents';
import { callClaude, buildContextualPrompt, buildRagQuery } from '@/lib/claude-api';

const STAGE_CONTEXT = `This stage covers procurement strategy for datacenter construction — evaluating facility types, identifying critical components, selecting vendors, and optimizing supply chain logistics.`;

function Fields({ formData, updateField }) {
  return (
    <>
      <FormField label="Facility Type"><Select value={formData.facilityType} onChange={v => updateField('facilityType', v)} options={['Greenfield Build', 'Brownfield Conversion', 'Colocation Lease', 'Hybrid Build-Lease']} placeholder="Select facility type..." /></FormField>
      <FormField label="Critical Components Needed" hint="select all required"><MultiSelect value={formData.components} onChange={v => updateField('components', v)} options={['Servers & Racks', 'Cooling Systems', 'UPS & Power', 'Generators', 'Network Equipment', 'Fire Suppression', 'Physical Security', 'DCIM Software', 'Cable Management', 'PDUs']} /></FormField>
      <FormField label="Preferred Vendors" hint="optional"><TextInput value={formData.vendors} onChange={v => updateField('vendors', v)} placeholder="e.g., Vertiv, Schneider Electric, Eaton..." /></FormField>
      <FormField label="Supply Chain Region Preference"><Select value={formData.sourceRegion} onChange={v => updateField('sourceRegion', v)} options={['Local Sourcing (in-country)', 'Regional (continent)', 'Global (best-value)']} placeholder="Select sourcing strategy..." /></FormField>
      <FormField label="Lead Time Tolerance"><Select value={formData.leadTime} onChange={v => updateField('leadTime', v)} options={['< 3 months', '3–6 months', '6–12 months', '12–18 months', '18+ months']} placeholder="Select lead time..." /></FormField>
      <FormField label="Total Estimated CapEx"><Select value={formData.capex} onChange={v => updateField('capex', v)} options={['< $20M', '$20M – $50M', '$50M – $150M', '$150M – $500M', '> $500M']} placeholder="Select CapEx range..." /></FormField>
    </>
  );
}

async function generateInsights(formData, sessionContext, stageOutputs) {
  const prompt = buildContextualPrompt(
    'Stage 02: DC Supply Chain & Sourcing',
    STAGE_CONTEXT,
    formData,
    sessionContext,
    stageOutputs,
    '02'
  );
  const ragQuery = buildRagQuery('supply chain sourcing procurement', { ...formData, ...sessionContext });
  return callClaude({ prompt, maxTokens: 8192, ragQuery });
}

export default function Stage02() {
  return <StageLayout stageNum="02" stageName="Supply Chain Management" stageDescription="Develop a robust procurement and sourcing strategy." stageIcon={Package} color="#0055A4" formFields={Fields} generateInsights={generateInsights} />;
}