// Data-access layer for the Asset Portfolio module. Every Supabase query for
// asset_register / asset_events / asset_intelligence lives here so API
// routes don't each hand-roll their own queries.
import { ASSET_REGISTER_FIELDS, ASSET_EVENTS_FIELDS } from '@/data/assetPortfolioSchema';

// ── Server-side (pass a server supabase client created per-request) ────────

export async function getCurrentUserId(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function fetchAssetRegister(supabase, userId) {
  const { data, error } = await supabase
    .from('asset_register')
    .select('*')
    .eq('user_id', userId)
    .order('asset_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAssetEvents(supabase, userId) {
  const { data, error } = await supabase
    .from('asset_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAssetIntelligence(supabase, userId, limit = 50) {
  const { data, error } = await supabase
    .from('asset_intelligence')
    .select('*')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Coerces a raw normalized row (already mapped to canonical db keys) into
// the correct types for its declared field, dropping unknown keys.
function coerceRow(raw, fields) {
  const row = {};
  for (const f of fields) {
    let v = raw[f.db];
    if (v === undefined || v === '' || v === null) { row[f.db] = null; continue; }
    if (f.type === 'number') { const n = Number(v); row[f.db] = Number.isFinite(n) ? n : null; }
    else if (f.type === 'boolean') { row[f.db] = /^(y|yes|true|1)$/i.test(String(v).trim()); }
    else if (f.type === 'date') {
      const d = v instanceof Date ? v : new Date(v);
      row[f.db] = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    } else { row[f.db] = String(v).trim(); }
  }
  return row;
}

export async function upsertAssetRegisterRows(supabase, userId, rawRows) {
  const rows = rawRows
    .map(r => ({ ...coerceRow(r, ASSET_REGISTER_FIELDS), user_id: userId }))
    .filter(r => r.asset_id && r.asset_name);
  if (!rows.length) return { inserted: 0 };
  const { error } = await supabase
    .from('asset_register')
    .upsert(rows, { onConflict: 'user_id,asset_id' });
  if (error) throw new Error(error.message);
  return { inserted: rows.length };
}

export async function upsertAssetEventRows(supabase, userId, rawRows) {
  const rows = rawRows
    .map(r => ({ ...coerceRow(r, ASSET_EVENTS_FIELDS), user_id: userId }))
    .filter(r => r.asset_id);
  if (!rows.length) return { inserted: 0 };
  const { error } = await supabase.from('asset_events').insert(rows);
  if (error) throw new Error(error.message);
  return { inserted: rows.length };
}

export async function insertIntelligenceRows(supabase, userId, rows) {
  if (!rows.length) return { inserted: 0 };
  const { error } = await supabase
    .from('asset_intelligence')
    .insert(rows.map(r => ({ ...r, user_id: userId })));
  if (error) throw new Error(error.message);
  return { inserted: rows.length };
}

// ── Client-side helper (browser supabase client) ────────────────────────────

export async function fetchAssetRegisterClient(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('asset_register')
    .select('*')
    .eq('user_id', user.id)
    .order('asset_name', { ascending: true });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// Live Google data center locations, fetched via our own API route (which
// scrapes datacenters.google server-side and caches for 12h). Used as the
// "no upload yet" fallback instead of a static seed list.
export async function fetchGoogleLocations() {
  try {
    const res = await fetch('/api/asset-portfolio/google-locations');
    const data = await res.json();
    return { rows: data.rows ?? [], live: data.source === 'live' };
  } catch {
    return { rows: [], live: false };
  }
}

export async function fetchAssetIntelligenceClient(supabase, limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('asset_intelligence')
    .select('*')
    .eq('user_id', user.id)
    .order('detected_at', { ascending: false })
    .limit(limit);
  if (error) { console.error(error); return []; }
  return data ?? [];
}
