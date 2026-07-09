'use client';
import { Fragment, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Quadratic Bezier curve for curved route lines on the map
function curvePath(lat1, lng1, lat2, lng2, points = 40) {
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat   = lat2 - lat1;
  const dLng   = lng2 - lng1;
  // Control point: perpendicular offset creates the arc
  const ctrlLat = midLat - dLng * 0.25;
  const ctrlLng = midLng + dLat * 0.25;
  return Array.from({ length: points + 1 }, (_, i) => {
    const t = i / points;
    return [
      (1-t)**2 * lat1 + 2*(1-t)*t * ctrlLat + t**2 * lat2,
      (1-t)**2 * lng1 + 2*(1-t)*t * ctrlLng + t**2 * lng2,
    ];
  });
}

const STATUS_LINE_COLOR = {
  'In Transit': '#0077C8',
  'Delivered':  '#00A36C',
};

export default function RouteMapLeaflet({ shipments = [] }) {
  useEffect(() => {
    // Prevent the default Leaflet icon path errors in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' });
  }, []);

  // Track which destination coords have already had a marker rendered
  const renderedDests = new Set();

  return (
    <MapContainer
      center={[20, 100]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <ZoomControl position="topleft" />

      {shipments.map(s => {
        const [oLat, oLng] = s.originCoords;
        const [dLat, dLng] = s.destinationCoords;
        const curve   = curvePath(oLat, oLng, dLat, dLng);
        const color   = STATUS_LINE_COLOR[s.status] ?? '#6B7280';
        const destKey = `${dLat},${dLng}`;
        const showDest = !renderedDests.has(destKey);
        renderedDests.add(destKey);
        return (
          <Fragment key={s.shipmentId}>
            <Polyline positions={curve} pathOptions={{ color, weight: 2, opacity: 0.80, dashArray: '6 4' }} />
            <CircleMarker center={[oLat, oLng]} radius={5} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 1, weight: 1 }} />
            {showDest && <CircleMarker center={[dLat, dLng]} radius={6} pathOptions={{ color: '#fff', fillColor: '#00A36C', fillOpacity: 0.9, weight: 2 }} />}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
