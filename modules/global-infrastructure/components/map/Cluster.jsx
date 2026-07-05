'use client';
import L from 'leaflet';

/**
 * iconCreateFunction for react-leaflet-cluster — renders the cluster count
 * (3, 5, 8, etc.) in a navy circle consistent with the app's accent palette.
 */
export function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count >= 20 ? 46 : count >= 8 ? 38 : 30;

  const html = `
    <div class="gii-cluster" style="width:${size}px;height:${size}px;">
      <span>${count}</span>
    </div>
  `;

  return L.divIcon({ html, className: 'gii-cluster-wrapper', iconSize: [size, size] });
}
