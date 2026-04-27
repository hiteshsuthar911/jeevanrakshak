import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom emoji icons
export const createIcon = (emoji, size = 32) =>
  L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

export const sosIcon = createIcon('🆘', 36);
export const rescueIcon = createIcon('🚁', 32);
export const shelterIcon = createIcon('🏕️', 30);
export const incidentIcon = createIcon('⚠️', 30);
export const adminIcon = createIcon('🎯', 28);

// Risk zone colors
const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };

// Auto-fit bounds component
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try { map.fitBounds(bounds, { padding: [40, 40] }); } catch {}
    }
  }, [bounds]);
  return null;
}

export default function LeafletMap({
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '100%',
  markers = [],       // { id, lat, lng, icon, popup, type }
  circles = [],       // { lat, lng, radius, severity, label }
  fitMarkers = false,
  children
}) {
  const bounds = fitMarkers && markers.length > 0
    ? markers.map(m => [m.lat, m.lng])
    : null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', background: '#0a0a1f' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Risk zone circles */}
      {circles.map((c, i) => (
        <Circle
          key={i}
          center={[c.lat, c.lng]}
          radius={c.radius || 5000}
          pathOptions={{
            color: riskColors[c.severity] || '#ef4444',
            fillColor: riskColors[c.severity] || '#ef4444',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: c.severity === 'low' ? '8 4' : undefined
          }}
        >
          {c.label && (
            <Popup>
              <div className="text-white">
                <div className="font-bold">{c.label}</div>
                <div className="text-sm capitalize opacity-70">Risk: {c.severity}</div>
              </div>
            </Popup>
          )}
        </Circle>
      ))}

      {/* Markers */}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={m.icon || L.Icon.Default}
        >
          {m.popup && (
            <Popup>
              <div style={{ color: 'white', minWidth: '160px' }}>
                {typeof m.popup === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: m.popup }} />
                ) : m.popup}
              </div>
            </Popup>
          )}
        </Marker>
      ))}

      {bounds && <FitBounds bounds={bounds} />}
      {children}
    </MapContainer>
  );
}
