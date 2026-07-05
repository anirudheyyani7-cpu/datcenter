'use client';
import { useEffect, useState } from 'react';
import { getWeatherByDataCenter } from '@/services/weatherService';

/** Loads weather profiles for a facility set, keyed by data center id. */
export function useWeatherPortfolio(facilities) {
  const [weatherByDc, setWeatherByDc] = useState({});
  const [loading, setLoading] = useState(true);
  const dcIds = facilities.map(f => f.id).join(',');

  useEffect(() => {
    if (!facilities.length) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    Promise.all(facilities.map(f => getWeatherByDataCenter(f.id).then(w => [f.id, w])))
      .then(entries => {
        if (cancelled) return;
        setWeatherByDc(Object.fromEntries(entries));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dcIds]);

  return { weatherByDc, loading };
}
