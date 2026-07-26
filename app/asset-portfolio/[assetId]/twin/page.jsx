'use client';
import { useState, useEffect, useMemo, useCallback, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { fetchAssetRegisterClient, fetchGoogleLocations } from '@/lib/assetPortfolio';
import { ASSET_PORTFOLIO_SEED } from '@/data/assetPortfolioSeed';
import { GOOGLE_DC_MASTER } from '@/data/googleDCMasterData';
import { assetToDigitalTwinDC, googleDCToDigitalTwinDC } from '@/lib/assetPortfolioCalc';
import { generateDCZoneHealth } from '@/data/mock/zoneHealth';

const DigitalTwinViewer = dynamic(() => import('@/components/datacenters/DigitalTwinViewer'), { ssr: false });
const LiveStatsDashboard = dynamic(() => import('@/components/datacenters/LiveStatsDashboard'), { ssr: false });

export default function AssetTwinPage({ params }) {
  const { assetId } = use(params);
  const router = useRouter();
  const [asset, setAsset] = useState(null);
  const [googleDC, setGoogleDC] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const fromGoogleMaster = GOOGLE_DC_MASTER.find(d => d.id === assetId);
      if (fromGoogleMaster) {
        if (active) { setGoogleDC(fromGoogleMaster); setLoaded(true); }
        return;
      }
      // Check sessionStorage for a DC stashed by the Global Cockpit
      // (uploaded/ingested DCs are not in Supabase or GOOGLE_DC_MASTER)
      try {
        const stashed = sessionStorage.getItem('cockpitTwinDC');
        if (stashed) {
          const parsed = JSON.parse(stashed);
          if (parsed.id === assetId) {
            if (active) { setGoogleDC(parsed); setLoaded(true); }
            return;
          }
        }
      } catch {}
      const supabase = createClient();
      const register = await fetchAssetRegisterClient(supabase);
      let pool = register;
      if (!pool.length) {
        const { rows } = await fetchGoogleLocations();
        pool = rows.length ? rows : ASSET_PORTFOLIO_SEED;
      }
      const found = pool.find(a => a.asset_id === assetId);
      if (active) { setAsset(found || null); setLoaded(true); }
    })();
    return () => { active = false; };
  }, [assetId]);

  if (loaded && !asset && !googleDC) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-text-secondary text-sm">
        Asset not found.
      </div>
    );
  }

  const dc = googleDC ? googleDCToDigitalTwinDC(googleDC) : asset ? assetToDigitalTwinDC(asset) : null;
  const backHref = googleDC ? '/asset-portfolio/global-cockpit' : '/asset-portfolio';
  const backLabel = googleDC ? 'Back to Global Cockpit' : 'Back to Globe';

  // Every DC reaching this page (Google campus, uploaded/ingested dataset, or
  // Supabase asset) has no hand-authored zoneHealth entry — fabricate one
  // deterministically from its real attributes so it's stable per DC but
  // differs across DCs, same as the Command Center's mockZoneHealth shape.
  const zoneHealth = useMemo(() => (dc ? generateDCZoneHealth(dc) : null), [dc]);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const handleHotspotChange = useCallback((zoneId) => setActiveZoneId(zoneId), []);

  return (
    <div className="flex" style={{ height: 'calc(100vh - 49px)' }}>
      {/* Left: Digital Twin — 60% */}
      <div className="flex-shrink-0 relative border-r border-grey-border" style={{ width: '60%' }}>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border-b border-grey-border">
          <button
            onClick={() => router.push(backHref)}
            className="flex items-center gap-1.5 text-[10px] text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={11} /> {backLabel}
          </button>
          {dc && (
            <>
              <div className="w-px h-3 bg-grey-border" />
              <span className="text-[10px] font-semibold text-text-primary">{dc.name}</span>
            </>
          )}
        </div>
        <div className="absolute inset-0" style={{ top: 36 }}>
          {dc && (
            <DigitalTwinViewer
              dc={dc}
              zoneHealth={zoneHealth}
              onHotspotChange={handleHotspotChange}
              isGenerated
            />
          )}
        </div>
      </div>

      {/* Right: Live Stats — 40% */}
      <div className="flex-1 overflow-hidden bg-white">
        {dc && <LiveStatsDashboard dc={dc} zoneHealth={zoneHealth} activeZoneId={activeZoneId} isGenerated />}
      </div>
    </div>
  );
}
