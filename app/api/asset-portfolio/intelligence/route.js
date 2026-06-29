// POST: triggers an intelligence poll for the caller's full asset register
// (or a single asset via { assetId }). Called by a client-side 15-min
// interval and a manual "Refresh Intelligence" button. To run on a schedule
// instead, add a Vercel Cron entry hitting this route with a shared-secret
// header — pollPortfolio itself is already schedule-agnostic.
import { createClient } from '@/lib/supabase-server';
import { getCurrentUserId, fetchAssetRegister, insertIntelligenceRows } from '@/lib/assetPortfolio';
import { pollPortfolio } from '@/lib/assetIntelligencePoll';

export async function POST(request) {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return Response.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const register = await fetchAssetRegister(supabase, userId);
  if (!register.length) return Response.json({ inserted: 0, message: 'No uploaded assets to poll yet.' });

  const targets = body.assetId ? register.filter(a => a.asset_id === body.assetId) : register;
  const found = await pollPortfolio(targets);

  const result = await insertIntelligenceRows(supabase, userId, found);
  return Response.json({ inserted: result.inserted, found });
}
