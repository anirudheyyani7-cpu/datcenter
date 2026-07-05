'use client';
import { useEffect, useState } from 'react';
import { getIncidentsByDataCenter } from '@/services/dataCenterService';

/** Loads incident history for a facility set, keyed by data center id. */
export function useIncidentPortfolio(facilities) {
  const [incidentsByDc, setIncidentsByDc] = useState({});
  const [loading, setLoading] = useState(true);
  const dcIds = facilities.map(f => f.id).join(',');

  useEffect(() => {
    if (!facilities.length) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    Promise.all(facilities.map(f => getIncidentsByDataCenter(f.id).then(items => [f.id, items])))
      .then(entries => {
        if (cancelled) return;
        setIncidentsByDc(Object.fromEntries(entries));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dcIds]);

  return { incidentsByDc, loading };
}
