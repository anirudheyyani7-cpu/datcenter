'use client';
import { Settings } from 'lucide-react';
import StageLayout from '@/components/stage-pages/StageLayout';
import { FormField, Select, MultiSelect, TextInput, SliderField } from '@/components/stage-pages/FormComponents';
import { callClaude, buildStagePrompt, buildRagQuery } from '@/lib/claude-api';

const STAGE_CONTEXT = `This stage covers the technical design and construction requirements for a datacenter — from tier classification and power architecture to cooling strategy, MEP design, and build approach.`;

function Fields({ formData, updateField }) {
  return (
    <>
      <FormField label="Target Tier Rating"><Select value={formData.tier} onChange={v => updateField('tier', v)} options={['Tier I', 'Tier II', 'Tier III', 'Tier III+ (Concurrently Maintainable)', 'Tier IV']} placeholder="Select tier target..." /></FormField>
      <FormField label="Total IT Load (MW)"><TextInput value={formData.itLoad} onChange={v => updateField('itLoad', v)} placeholder="e.g., 50" type="number" /></FormField>
      <FormField label="Target Rack Density"><Select value={formData.rackDensity} onChange={v => updateField('rackDensity', v)} options={['Standard (5–8 kW/rack)', 'Medium (8–15 kW/rack)', 'High (15–30 kW/rack)', 'Very High (30–50 kW/rack)', 'Extreme (50+ kW/rack — AI/GPU)']} placeholder="Select rack density..." /></FormField>
      <FormField label="Cooling Strategy" hint="select all planned"><MultiSelect value={formData.cooling} onChange={v => updateField('cooling', v)} options={['Air-Cooled (CRAC/CRAH)', 'Chilled Water (CRAC+chiller)', 'Liquid-to-Chip (DLC)', 'Immersion Cooling', 'Free Cooling / Economizer', 'Adiabatic Cooling', 'Hybrid']} /></FormField>
      <FormField label="Redundancy Level"><Select value={formData.redundancy} onChange={v => updateField('redundancy', v)} options={['N (Basic)', 'N+1', '2N (Full Redundancy)', '2N+1 (Maximum)']} placeholder="Select redundancy..." /></FormField>
      <FormField label="Build Approach"><Select value={formData.buildApproach} onChange={v => updateField('buildApproach', v)} options={['Stick-Built (Traditional)', 'Modular / Prefabricated', 'Hybrid (Core stick-built + modular wings)', 'Containerized']} placeholder="Select build approach..." /></FormField>
      <FormField label="Target PUE"><SliderField value={formData.targetPUE || 1.4} onChange={v => updateField('targetPUE', v)} min={1.1} max={2.0} step={0.05} formatValue={v => v.toFixed(2)} leftLabel="1.10 (Best)" rightLabel="2.00 (Basic)" /></FormField>
    </>
  );
}

async function generateInsights(formData) {
  const prompt = buildStagePrompt('Stage 03: Design & Build Requirements', STAGE_CONTEXT, formData, null);
  const ragQuery = buildRagQuery('datacenter design build cooling architecture', formData);
  return callClaude({ prompt, maxTokens: 8192, ragQuery });
}

export default function Stage03() {
  return <StageLayout stageNum="03" stageName="Design & Build Requirements" stageDescription="Define the technical architecture for your datacenter." stageIcon={Settings} color="#00529B" formFields={Fields} generateInsights={generateInsights} />;
}
