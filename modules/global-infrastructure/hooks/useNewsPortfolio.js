'use client';
import { useEffect, useState } from 'react';
import { getNewsByDataCenter } from '@/services/newsService';

/** Loads news items for a facility set and flattens them with the owning facility attached. */
export function useNewsPortfolio(facilities) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const dcIds = facilities.map(f => f.id).join(',');

  useEffect(() => {
    if (!facilities.length) { setNews([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    Promise.all(facilities.map(f => getNewsByDataCenter(f.id).then(items => items.map(item => ({ ...item, facility: f })))))
      .then(results => {
        if (cancelled) return;
        setNews(results.flat().sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dcIds]);

  return { news, loading };
}
