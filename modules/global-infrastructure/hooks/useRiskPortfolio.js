'use client';
import { useEffect, useState } from 'react';
import { getRisksByDataCenter } from '@/services/riskService';

/** Loads the full risk register (7 categories per facility) for a facility set. */
export function useRiskPortfolio(facilities) {
  const [risksByDc, setRisksByDc] = useState({});
  const [loading, setLoading] = useState(true);
  const dcIds = facilities.map(f => f.id).join(',');

  useEffect(() => {
    if (!facilities.length) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    Promise.all(facilities.map(f => getRisksByDataCenter(f.id).then(risks => [f.id, risks])))
      .then(entries => {
        if (cancelled) return;
        setRisksByDc(Object.fromEntries(entries));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dcIds]);

  return { risksByDc, loading };
}
