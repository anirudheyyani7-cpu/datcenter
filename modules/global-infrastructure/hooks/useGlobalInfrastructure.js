'use client';
import { useEffect, useState } from 'react';
import {
  fetchFacilities,
  fetchPortfolioKpis,
  fetchRegionRollups,
  fetchAiInsights,
} from '../services/globalInfrastructureService';

export function useGlobalInfrastructure() {
  const [facilities, setFacilities]       = useState([]);
  const [kpis, setKpis]                   = useState([]);
  const [regionRollups, setRegionRollups] = useState([]);
  const [insights, setInsights]           = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFacilities().then(async (facilityList) => {
      if (cancelled) return;
      setFacilities(facilityList);
      setLoading(false);

      const rollups = await fetchRegionRollups(facilityList);
      const [kpiData, insightData] = await Promise.all([
        fetchPortfolioKpis(facilityList),
        fetchAiInsights(facilityList, rollups),
      ]);
      if (cancelled) return;
      setRegionRollups(rollups);
      setKpis(kpiData);
      setInsights(insightData);
    });
    return () => { cancelled = true; };
  }, []);

  return { facilities, kpis, regionRollups, insights, loading };
}
