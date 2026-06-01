'use client';
import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Country, State } from 'country-state-city';
import StageLayout from '@/components/stage-pages/StageLayout';
import { FormField, Select, MultiSelect, SliderField } from '@/components/stage-pages/FormComponents';
import { callClaude, buildStagePrompt, buildRagQuery } from '@/lib/claude-api';
import { loadDatacenters, getCountryDataForAI } from '@/lib/datacenter-data';

const STAGE_CONTEXT = `This stage covers market opportunity analysis for datacenter investment — identifying target regions, assessing demand drivers, evaluating competitive landscapes, and recommending entry strategies.`;

// Build sorted country list once at module level (no re-computation on re-renders)
const ALL_COUNTRIES = Country.getAllCountries()
  .map(c => ({ value: c.isoCode, label: c.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

function Fields({ formData, updateField }) {
  const [stateOptions, setStateOptions] = useState([]);

  // When country changes, fetch its states from the library
  useEffect(() => {
    if (!formData.countryCode) {
      setStateOptions([]);
      return;
    }
    const states = State.getStatesOfCountry(formData.countryCode);
    setStateOptions(states.map(s => ({ value: s.isoCode, label: s.name })));
  }, [formData.countryCode]);

  const handleCountryChange = (isoCode) => {
    const country = Country.getCountryByCode(isoCode);
    updateField('countryCode', isoCode);
    updateField('region', country?.name || isoCode); // human-readable name for prompts
    updateField('state', '');
    updateField('stateCode', '');
  };

  const handleStateChange = (stateCode) => {
    const state = State.getStateByCodeAndCountry(stateCode, formData.countryCode);
    updateField('stateCode', stateCode);
    updateField('state', state?.name || stateCode); // human-readable for prompts
  };

  return (
    <>
      <FormField label="Target Country">
        <Select
          value={formData.countryCode}
          onChange={handleCountryChange}
          options={ALL_COUNTRIES}
          placeholder="Select country..."
        />
      </FormField>

      {/* State dropdown — appears only when the selected country has states */}
      {stateOptions.length > 0 && (
        <FormField label="Target State / Province" hint="optional, narrows analysis">
          <Select
            value={formData.stateCode}
            onChange={handleStateChange}
            options={stateOptions}
            placeholder="Select state / province..."
          />
        </FormField>
      )}

      <FormField label="Primary Workload Type" hint="select all that apply">
        <MultiSelect
          value={formData.workloads}
          onChange={v => updateField('workloads', v)}
          options={['AI/ML Training', 'Cloud/SaaS', 'Enterprise IT', 'Colocation', 'Edge Computing', 'HPC', 'Gaming/Media', 'Financial Services', 'Government/Public Sector']}
        />
      </FormField>

      <FormField label="Target Capacity Range">
        <SliderField
          value={formData.capacity || 50}
          onChange={v => updateField('capacity', v)}
          min={5} max={500} step={5}
          formatValue={v => `${v} MW`}
          leftLabel="5 MW" rightLabel="500 MW"
        />
      </FormField>

      <FormField label="Investment Budget Range">
        <Select
          value={formData.budget}
          onChange={v => updateField('budget', v)}
          options={['< $50M', '$50M – $200M', '$200M – $500M', '$500M – $1B', '> $1B']}
          placeholder="Select budget range..."
        />
      </FormField>

      <FormField label="Target Timeline to Operations">
        <Select
          value={formData.timeline}
          onChange={v => updateField('timeline', v)}
          options={['6 months', '12 months', '18 months', '24+ months']}
          placeholder="Select timeline..."
        />
      </FormField>

      <FormField label="Sustainability Priority">
        <SliderField
          value={formData.sustainability || 3}
          onChange={v => updateField('sustainability', v)}
          min={1} max={5} step={1}
          formatValue={v => ['', 'Low', 'Moderate', 'Important', 'High', 'Critical'][v]}
          leftLabel="Low" rightLabel="Critical"
        />
      </FormField>
    </>
  );
}

async function generateInsights(formData, sessionContext, stageOutputs, researchContext = null) {
  const dcData = await loadDatacenters();
  const knownCountries = Object.keys(dcData.country_summary || {});
  const regionData = formData.region && knownCountries.includes(formData.region)
    ? getCountryDataForAI(dcData, formData.region)
    : null;

  const enrichedFormData = {
    ...formData,
    location: formData.state
      ? `${formData.state}, ${formData.region}`
      : formData.region,
  };

  const basePrompt = buildStagePrompt('Stage 01: Strategy Assessment & Market Scan', STAGE_CONTEXT, enrichedFormData, regionData);
  const researchBlock = researchContext ? `\n\n## LIVE RESEARCH CONTEXT\n${researchContext}` : '';
  const ragQuery = buildRagQuery('strategy assessment market', enrichedFormData);
  return callClaude({ prompt: basePrompt + researchBlock, maxTokens: 8192, ragQuery });
}

export default function Stage01() {
  return (
    <StageLayout
      stageNum="01"
      stageName="Strategy"
      stageDescription="Conduct a comprehensive market scan and opportunity analysis to validate your datacenter investment thesis. Identify demand drivers, competitive dynamics, and optimal entry strategy for your target region."
      stageIcon={TrendingUp}
      color="#00338D"
      formFields={Fields}
      generateInsights={generateInsights}
    />
  );
}