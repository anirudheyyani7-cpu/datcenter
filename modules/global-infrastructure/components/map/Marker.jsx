'use client';
import L from 'leaflet';
import { HEALTH_COLORS } from './healthColors';

/**
 * Builds a Leaflet divIcon for a facility marker, colored by health.
 * Scale-on-hover is handled in CSS (see globals.css .gii-marker:hover)
 * rather than re-rendering the icon, so the transition stays smooth.
 *
 * `emphasis` accepts a boolean (back-compat: isSelected) or an options
 * object so callers can also mark a marker as dimmed — used by the global
 * map's region-zoom transition to de-emphasize facilities outside the
 * region the user just clicked, without a second map implementation.
 */
export function createFacilityIcon(facility, emphasis = false) {
  const { isSelected = false, isDimmed = false } =
    typeof emphasis === 'object' ? emphasis : { isSelected: emphasis };

  const color = HEALTH_COLORS[facility.health] ?? HEALTH_COLORS.healthy;
  const size = isSelected ? 22 : 16;
  const opacity = isDimmed ? 0.25 : 1;

  const html = `
    <div class="gii-marker" style="width:${size}px;height:${size}px;opacity:${opacity};transition:opacity 0.4s ease;">
      ${isSelected ? `<span class="gii-marker-ring" style="border-color:${color};"></span>` : ''}
      <span class="gii-marker-dot" style="background:${color};"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'gii-marker-wrapper',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
