'use client';
import { TrendingUp } from 'lucide-react';
import StageLayout from '@/components/stage-pages/StageLayout';
import { FormField, Select, MultiSelect, SliderField } from '@/components/stage-pages/FormComponents';
import { callClaude, buildStagePrompt, buildRagQuery } from '@/lib/claude-api';
import { loadDatacenters, getCountryDataForAI } from '@/lib/datacenter-data';

const STAGE_CONTEXT = `This stage covers market opportunity analysis for datacenter investment — identifying target regions, assessing demand drivers, evaluating competitive landscapes, and recommending entry strategies.`;

// Comprehensive global region list
const REGIONS = [
  // Asia Pacific
  'India', 'Singapore', 'Japan', 'Australia', 'Hong Kong', 'South Korea',
  'China', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'New Zealand',
  // Europe
  'Ireland', 'United Kingdom', 'Germany', 'Netherlands', 'France', 'Spain',
  'Sweden', 'Denmark', 'Norway', 'Finland', 'Switzerland', 'Poland', 'Italy',
  // Americas
  'United States', 'Canada', 'Brazil', 'Mexico', 'Chile', 'Colombia',
  // Middle East & Africa
  'United Arab Emirates', 'Saudi Arabia', 'South Africa', 'Kenya', 'Nigeria', 'Egypt',
  // Multi-region
  'Multi-Region (Global)',
];

function Fields({ formData, updateField }) {
  return (
    <>
      <FormField label="Target Region">
        <Select
          value={formData.region}
          onChange={v => updateField('region', v)}
          options={REGIONS}
          placeholder="Select region..."
        />
      </FormField>
      <FormField label="Primary Workload Type" hint="select all that apply">
        <MultiSelect value={formData.workloads} onChange={v => updateField('workloads', v)}
          options={['AI/ML Training', 'Cloud/SaaS', 'Enterprise IT', 'Colocation', 'Edge Computing', 'HPC', 'Gaming/Media', 'Financial Services', 'Government/Public Sector']} />
      </FormField>
      <FormField label="Target Capacity Range">
        <SliderField value={formData.capacity || 50} onChange={v => updateField('capacity', v)}
          min={5} max={500} step={5} formatValue={v => `${v} MW`} leftLabel="5 MW" rightLabel="500 MW" />
      </FormField>
      <FormField label="Investment Budget Range">
        <Select value={formData.budget} onChange={v => updateField('budget', v)}
          options={['< $50M', '$50M – $200M', '$200M – $500M', '$500M – $1B', '> $1B']} placeholder="Select budget range..." />
      </FormField>
      <FormField label="Target Timeline to Operations">
        <Select value={formData.timeline} onChange={v => updateField('timeline', v)}
          options={['6 months', '12 months', '18 months', '24+ months']} placeholder="Select timeline..." />
      </FormField>
      <FormField label="Sustainability Priority">
        <SliderField value={formData.sustainability || 3} onChange={v => updateField('sustainability', v)}
          min={1} max={5} step={1} formatValue={v => ['', 'Low', 'Moderate', 'Important', 'High', 'Critical'][v]}
          leftLabel="Low" rightLabel="Critical" />
      </FormField>
    </>
  );
}

async function generateInsights(formData) {
  const dcData = await loadDatacenters();
  // Only pass local DC data if we have it for the selected region
  const knownCountries = Object.keys(dcData.country_summary || {});
  const regionData = formData.region && knownCountries.includes(formData.region)
    ? getCountryDataForAI(dcData, formData.region)
    : null;

  const prompt = buildStagePrompt('Stage 01: Strategy Assessment & Market Scan', STAGE_CONTEXT, formData, regionData);
  const ragQuery = buildRagQuery('strategy assessment market', formData);
  return callClaude({ prompt, maxTokens: 8192, ragQuery });
}

export default function Stage01() {
  return (
    <StageLayout
      stageNum="01"
      stageName="Strategy Assessment"
      stageDescription="Conduct a comprehensive market scan and opportunity analysis to validate your datacenter investment thesis. Identify demand drivers, competitive dynamics, and optimal entry strategy for your target region."
      stageIcon={TrendingUp}
      color="#00338D"
      formFields={Fields}
      generateInsights={generateInsights}
    />
  );
}
