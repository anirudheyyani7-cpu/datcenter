'use client';
import { useMemo, useState } from 'react';
import { DEFAULT_FILTERS, applyFacilityFilters } from '../utils/facilityFilters';

export function useFacilityFilters(facilities) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => applyFacilityFilters(facilities, filters), [facilities, filters]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeCount = Object.values(filters).filter(v => v !== 'All').length;

  return { filters, setFilter, setFilters, resetFilters, filtered, activeCount };
}
