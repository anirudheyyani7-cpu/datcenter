'use client';
import { useEffect, useState } from 'react';
import { getEsgTrend } from '@/services/esgService';

/**
 * Loads the monthly ESG trend for every given facility once and derives the
 * latest/previous-month snapshot per facility. Shared by the Sustainability
 * dashboard (full trend lines) and the AI Executive Briefing (month-over-
 * month renewable delta) so the ESG data is only fetched once per facility
 * set rather than duplicated across components.
 */
export function useEsgPortfolio(facilities) {
  const [trendByDc, setTrendByDc] = useState({});
  const [loading, setLoading] = useState(true);

  const dcIds = facilities.map(f => f.id).join(',');

  useEffect(() => {
    if (!facilities.length) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    Promise.all(facilities.map(f => getEsgTrend(f.id).then(trend => [f.id, trend])))
      .then(entries => {
        if (cancelled) return;
        setTrendByDc(Object.fromEntries(entries));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dcIds]);

  const latestByDc = {};
  const prevByDc = {};
  for (const [id, trend] of Object.entries(trendByDc)) {
    if (!trend.length) continue;
    latestByDc[id] = trend[trend.length - 1];
    prevByDc[id] = trend[trend.length - 2] ?? trend[trend.length - 1];
  }

  return { trendByDc, latestByDc, prevByDc, loading };
}
