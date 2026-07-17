'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR = {
  optimal:     '#00A36C',
  good:        '#0077C8',
  warning:     '#D4A017',
  critical:    '#DC2626',
  maintenance: '#6B7280',
};

function clusterIcon(count, color, isSelected) {
  const size = count >= 6 ? 42 : count >= 3 ? 36 : 30;
  const ring = isSelected ? `0 0 0 4px ${color}55, 0 0 0 7px ${color}` : `0 0 0 4px ${color}30`;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:2.5px solid rgba(255,255,255,0.30);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${size > 36 ? 14 : 12}px;
      font-family:monospace;
      box-shadow:${ring};
      cursor:pointer;
      transition:box-shadow 0.15s;
    ">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function EAIMapLeaflet({ clusters = [], onMarkerClick, selectedIds }) {
  useEffect(() => {
    // Fix default Leaflet icon path issues in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <ZoomControl position="topleft" />

      {clusters.map(c => (
        <Marker
          key={c.id}
          position={[c.lat, c.lon]}
          icon={clusterIcon(c.count, STATUS_COLOR[c.status] ?? '#6B7280', !!selectedIds?.includes(c.id))}
          eventHandlers={onMarkerClick ? { click: () => onMarkerClick(c) } : undefined}
        >
          <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
            <span style={{ fontSize: 11 }}>{c.label} ({c.count} facilities)</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
