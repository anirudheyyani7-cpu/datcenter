'use client';
import { useMemo, useState } from 'react';
import { searchFacilities } from '../utils/facilityFilters';

export function useFacilitySearch(facilities) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchFacilities(facilities, query), [facilities, query]);

  return { query, setQuery, results };
}
