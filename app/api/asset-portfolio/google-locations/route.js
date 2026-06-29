import { fetchGoogleDataCenterLocations } from '@/lib/googleDCLocations';
import { ASSET_PORTFOLIO_SEED } from '@/data/assetPortfolioSeed';

export async function GET() {
  try {
    const rows = await fetchGoogleDataCenterLocations();
    return Response.json({ source: 'live', count: rows.length, rows });
  } catch (err) {
    // Graceful degradation — Google's page is unreachable or changed shape.
    return Response.json({ source: 'fallback', error: err.message, count: ASSET_PORTFOLIO_SEED.length, rows: ASSET_PORTFOLIO_SEED });
  }
}
