// LLM prioritization layer — Part 4 of the decision-engine spec.
//
// The LLM's ONLY job here is to rank/select from a FIXED module list and
// explain why. It never sees raw computation logic and is never asked to
// produce a score, ranking number, or financial figure — those are already
// computed deterministically and passed in as read-only context.

import { callClaudeServer } from '@/lib/anthropicServer';
import { MODULE_REGISTRY, MODULE_LABELS, applyHardConstraints, defaultSelection } from '@/data/decisionModules';

export const PRIORITIZATION_PROMPT_TEMPLATE = `You are the K-Nexus Decision Prioritization Layer.

You are NOT a chatbot. You do not generate analysis, scores, or financial figures —
those are already computed and provided to you as read-only context.

Your ONLY job: choose which of the AVAILABLE MODULES below are most relevant to
this query, put them in priority order, and give a one-sentence reason for each
selected module.

AVAILABLE MODULES (you may ONLY use these exact keys — never invent a new one):
{{module_list}}

USER QUERY:
decision_type: {{decision_type}}
mode: {{mode}}
client_name: {{client_name}}
location: {{location}}
capacity_mw: {{capacity}}

COMPUTED CONTEXT (already calculated — reference it, do not recompute it):
{{computed_summary}}

HARD RULES (you must respect these; they will also be enforced in code):
- "final_recommendation" must always be included.
- Select a minimum of 3 and a maximum of 5 modules total.
- If capacity_mw >= 50, you must include "power_analysis" (if it is an available module).
- If the location is coastal or flood-prone, you must include "risk_analysis" (if available).
- If this is a land-related query, you must include "candidate_locations" (if available).

Respond with ONLY raw JSON, no markdown fences, no commentary, in EXACTLY this shape:
{
  "selected_modules": ["final_recommendation", "..."],
  "priority_order": ["final_recommendation", "..."],
  "reasoning": { "<module_key>": "one short sentence", ... }
}`;

function buildComputedSummary(computedData) {
  return Object.entries(computedData)
    .map(([key, val]) => {
      const bits = [];
      if (typeof val.score === 'number') bits.push(`score=${val.score}`);
      if (val.coastal !== undefined) bits.push(`coastal=${val.coastal}`);
      if (val.flood_zone) bits.push(`flood_zone=${val.flood_zone}`);
      if (val.verdict) bits.push(`verdict=${val.verdict}`);
      if (val.ranked) bits.push(`top=${val.ranked[0]?.name}`);
      return `- ${key}: ${bits.join(', ') || 'computed'}`;
    })
    .join('\n');
}

function buildPrompt(decisionType, params, computedData) {
  const registry = MODULE_REGISTRY[decisionType] || [];
  const moduleList = registry.map(m => `- ${m}: ${MODULE_LABELS[m]}`).join('\n');
  return PRIORITIZATION_PROMPT_TEMPLATE
    .replace('{{module_list}}', moduleList)
    .replace('{{decision_type}}', decisionType)
    .replace('{{mode}}', params.mode || 'exploratory')
    .replace('{{client_name}}', params.clientName || '(none — exploratory)')
    .replace('{{location}}', params.location)
    .replace('{{capacity}}', String(params.capacity))
    .replace('{{computed_summary}}', buildComputedSummary(computedData));
}

function parseLLMJson(raw) {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in LLM response.');
  return JSON.parse(match[0]);
}

/**
 * Ranks/selects modules for this decision. Always returns a valid,
 * constraint-satisfying result — falls back to a deterministic default
 * selection (no LLM) on any failure, so the system never breaks into a
 * chatbot-style free-text error.
 */
export async function prioritizeModules({ decisionType, params, computedData }) {
  const prompt = buildPrompt(decisionType, params, computedData);

  try {
    const raw = await callClaudeServer({
      prompt,
      system: 'You output only raw JSON matching the requested schema. No prose, no markdown fences.',
      maxTokens: 600,
    });
    const parsed = parseLLMJson(raw);
    const enforced = applyHardConstraints(decisionType, params, parsed);

    const reasoning = {};
    for (const key of enforced.selected_modules) {
      reasoning[key] = (parsed.reasoning && parsed.reasoning[key]) || defaultReason(key, decisionType, params, computedData);
    }

    return { ...enforced, reasoning, source: 'llm' };
  } catch {
    const fallback = defaultSelection(decisionType, params);
    const reasoning = {};
    for (const key of fallback.selected_modules) {
      reasoning[key] = defaultReason(key, decisionType, params, computedData);
    }
    return { ...fallback, reasoning, source: 'fallback' };
  }
}

function defaultReason(key, decisionType, params, computedData) {
  const capacity = Number(params?.capacity) || 0;
  if (key === 'final_recommendation') return 'Always shown — the headline decision for this query.';
  if (key === 'power_analysis' && capacity >= 50) return `Critical at ${capacity}MW — above the grid-impact threshold.`;
  if (key === 'risk_analysis' && computedData.risk_analysis?.coastal) return `${params.location} is a coastal/flood-exposed market.`;
  if (key === 'candidate_locations' && decisionType === 'land_site_audit') return 'Land-related query — site shortlist is always relevant.';
  return `Relevant to ${MODULE_LABELS[key] || key} for this decision.`;
}
