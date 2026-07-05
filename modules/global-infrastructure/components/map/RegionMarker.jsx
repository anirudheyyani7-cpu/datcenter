'use client';
import L from 'leaflet';

/**
 * Region-level click target rendered on the global map only (regional pages
 * never pass these in) — clicking one is what triggers the zoom-and-dim
 * transition into /global-infrastructure/[region]. Visually distinct from
 * facility dots: larger, labeled, navy ring.
 */
export function createRegionIcon(label, count, isActive = false) {
  const size = isActive ? 64 : 52;
  const html = `
    <div class="gii-region-marker" style="width:${size}px;height:${size}px;">
      <span class="gii-region-marker-label">${label}</span>
      <span class="gii-region-marker-count">${count}</span>
    </div>
  `;
  return L.divIcon({ html, className: 'gii-region-marker-wrapper', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}
