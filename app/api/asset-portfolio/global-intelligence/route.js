// POST: same Tavily + NewsAPI + Claude pipeline as
// /api/asset-portfolio/intelligence, but polled against the static
// GOOGLE_DC_MASTER campus list (Global Cockpit) instead of a user's
// uploaded asset_register. asset_intelligence.asset_id has no FK to
// asset_register, so these rows store under the same table/user scope.
import { createClient } from '@/lib/supabase-server';
import { getCurrentUserId, insertIntelligenceRows } from '@/lib/assetPortfolio';
import { pollPortfolio } from '@/lib/assetIntelligencePoll';
import { GOOGLE_DC_MASTER } from '@/data/googleDCMasterData';

const POLL_CAP = 12;
const RISK_ORDER = { High: 0, Medium: 1, Low: 2 };

export async function POST(request) {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return Response.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const pool = body.region && body.region !== 'All'
    ? GOOGLE_DC_MASTER.filter(d => d.region === body.region)
    : GOOGLE_DC_MASTER;

  const targets = [...pool]
    .sort((a, b) => (RISK_ORDER[a.risk_flag] ?? 1) - (RISK_ORDER[b.risk_flag] ?? 1))
    .slice(0, POLL_CAP)
    .map(dc => ({ asset_id: dc.id, asset_name: dc.name, city: dc.market, country: dc.country }));

  if (!targets.length) return Response.json({ inserted: 0, message: 'No Google DC campuses to poll.' });

  const found = await pollPortfolio(targets);
  const result = await insertIntelligenceRows(supabase, userId, found);
  return Response.json({ inserted: result.inserted, found });
}
