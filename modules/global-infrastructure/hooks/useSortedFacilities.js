'use client';
import { useMemo, useState } from 'react';

export const SORT_OPTIONS = [
  { id: 'capacity', label: 'Capacity', metric: 'capacityMw', direction: 'desc' },
  { id: 'health', label: 'Health', metric: 'healthScore', direction: 'desc' },
  { id: 'renewable', label: 'Renewable %', metric: 'renewablePct', direction: 'desc' },
  { id: 'risk', label: 'Risk', metric: 'riskRank', direction: 'desc' },
  { id: 'pue', label: 'PUE', metric: 'pue', direction: 'asc' },
  { id: 'utilization', label: 'Utilization', metric: 'utilizationPct', direction: 'desc' },
  { id: 'name', label: 'Alphabetical', metric: 'name', direction: 'asc' },
];

const RISK_RANK = { Low: 1, Medium: 2, High: 3 };

export function useSortedFacilities(facilities) {
  const [sortId, setSortId] = useState('capacity');

  const sorted = useMemo(() => {
    const option = SORT_OPTIONS.find(o => o.id === sortId) ?? SORT_OPTIONS[0];
    return [...facilities].sort((a, b) => {
      const av = option.metric === 'riskRank' ? RISK_RANK[a.riskFlag] : a[option.metric];
      const bv = option.metric === 'riskRank' ? RISK_RANK[b.riskFlag] : b[option.metric];
      if (typeof av === 'string') return option.direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return option.direction === 'asc' ? av - bv : bv - av;
    });
  }, [facilities, sortId]);

  return { sortId, setSortId, sorted };
}
