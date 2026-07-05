'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric KPI value counting up from its previous value rather
 * than just snapping to the new one. Non-numeric values pass through
 * unchanged (KPI values are formatted strings like "29" or "4.2M").
 */
export function useCountUp(value, duration = 600) {
  const numeric = parseFloat(String(value).replace(/,/g, ''));
  const isNumeric = !Number.isNaN(numeric) && /^-?[\d.,]+$/.test(String(value).trim());
  const [display, setDisplay] = useState(isNumeric ? 0 : value);
  const fromRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!isNumeric) { setDisplay(value); return; }
    const from = fromRef.current;
    const to = numeric;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(Number.isInteger(to) && Number.isInteger(from) ? Math.round(current) : Math.round(current * 100) / 100);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}
