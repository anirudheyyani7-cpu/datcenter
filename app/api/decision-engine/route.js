import { MODULE_REGISTRY } from '@/data/decisionModules';
import { computeDecisionData } from '@/lib/decisionEngine';
import { prioritizeModules } from '@/lib/decisionPrioritization';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { decision_type, mode = 'exploratory', client_name, location, capacity } = body;

  if (!decision_type || !MODULE_REGISTRY[decision_type]) {
    return Response.json({ error: `Unknown decision_type: ${decision_type}` }, { status: 400 });
  }

  const isExploratory = mode === 'exploratory';
  const params = {
    mode,
    clientName: isExploratory ? '' : (client_name || ''),
    location: isExploratory ? 'Metro Region' : (location || 'Metro Region'),
    capacity: capacity ? Number(capacity) : 100,
  };

  // 1. Deterministic computation — every module's data, no LLM involved.
  const { modules: computedData } = computeDecisionData(decision_type, params);

  // 2. LLM prioritization layer — selection/ranking/explanation only.
  const { selected_modules, priority_order, reasoning, source } = await prioritizeModules({
    decisionType: decision_type,
    params,
    computedData,
  });

  // 3. Assemble cockpit payload — only the selected modules' data goes out.
  const modules = {};
  for (const key of selected_modules) modules[key] = computedData[key];

  const insights = priority_order
    .filter(key => reasoning[key])
    .map(key => reasoning[key]);

  return Response.json({
    decision_type,
    mode,
    params: {
      client_name: params.clientName,
      location: params.location,
      capacity: params.capacity,
    },
    selected_modules,
    priority_order,
    reasoning,
    modules,
    insights,
    prioritization_source: source,
  });
}
