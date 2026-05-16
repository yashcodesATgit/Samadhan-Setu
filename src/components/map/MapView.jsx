
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapview.css";

// Fix Leaflet's default marker icons — they don't work out of the box with bundlers
// We use CDN-hosted images to avoid static import issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Default map center (Jaipur, India) — used when user location isn't available
const JAIPUR = [26.9124, 75.7873];

// ------------------------------------------------------------
// ClickHandler (internal helper)
// Listens for map clicks and fires the onClick callback
// with the latitude and longitude of the clicked spot.
// ------------------------------------------------------------
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;  // renders nothing — just handles events
}

// ------------------------------------------------------------
// MapView Component
// An interactive map that can:
// - Auto-center on the user's location
// - Let users drop a pin by clicking
// - Show multiple markers with popups
// - Look up an address from coordinates (reverse geocoding)
//
// Props:
//   center             - [lat, lng] to center the map (optional)
//   allowDropPin       - if true, clicking the map drops a pin
//   onPick             - callback: { lat, lng, address? }
//   markers            - array of marker objects
//   enableReverseGeocode - if true, looks up address on pin drop
//   className          - CSS classes for the wrapper div
//   heightClassName    - CSS classes controlling map height
//   selectedPin        - externally-controlled pin [lat, lng]
// ------------------------------------------------------------
// ------------------------------------------------------------
// ChangeView (internal helper)
// Pans the map when the center changes
// ------------------------------------------------------------
function ChangeView({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const MapView = ({
  center,
  allowDropPin = false,
  onPick,
  markers = [],
  enableReverseGeocode = false,
  className = "rounded-xl shadow-sm overflow-hidden border",
  heightClassName = "h-[400px] md:h-[600px]",
  selectedPin,
}) => {
  // Map center — will be updated when we detect user's location
  const [currentCenter, setCurrentCenter] = useState(center || JAIPUR);
  // The pin the user dropped by clicking the map
  const [picked, setPicked] = useState(null);
  // Address string for the dropped pin (from reverse geocoding)
  const [pickedAddress, setPickedAddress] = useState(undefined);

  // When the map first loads, try to get the user's real location
  useEffect(() => {
    if (center) return;  // skip if a center was provided manually
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setCurrentCenter(c);
      },
      () => {
        // Can't get location — fall back to Jaipur
        setCurrentCenter(JAIPUR);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [center]);

  // Called when user clicks the map
  const handlePick = useCallback(
    async (lat, lng) => {
      setPicked([lat, lng]);

      let address = undefined;

      // Optionally look up the human-readable address for these coordinates
      if (enableReverseGeocode) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          address = data?.display_name;
          setPickedAddress(address);
        } catch {
          // Silently ignore network errors for geocoding
        }
      }

      // Notify the parent with the picked location
      onPick?.({ lat, lng, address });
    },
    [onPick, enableReverseGeocode]
  );

  // Figure out the correct center for the map
  const hasMarkers = markers && markers.length > 0;
  const mapCenter = useMemo(() => {
    if (hasMarkers) return markers[0].position;  // center on first marker
    if (selectedPin) return selectedPin;           // use external pin
    if (picked) return picked;                     // use dropped pin
    return currentCenter;                          // default / user location
  }, [hasMarkers, markers, picked, currentCenter, selectedPin]);

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className={`w-full ${heightClassName}`}
      >
        <ChangeView center={mapCenter} />
        {/* The actual map tiles from OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Enable click-to-drop-pin if requested */}
        {allowDropPin && <ClickHandler onClick={handlePick} />}

        {/* Show a marker at the selected/dropped pin location */}
        {(selectedPin || picked) && (
          <Marker position={selectedPin || picked}>
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">Selected Location</div>
                <div className="text-xs text-muted-foreground">
                  {(selectedPin || picked)[0].toFixed(6)}, {(selectedPin || picked)[1].toFixed(6)}
                </div>
                {pickedAddress && <div className="text-xs">{pickedAddress}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render all provided markers */}
        {markers.map((m) => (
          <Marker key={m.id} position={m.position}>
            <Popup>
              <div className="space-y-2">
                {m.title && <div className="font-medium">{m.title}</div>}
                {m.description && <div className="text-xs">{m.description}</div>}
                <div className="text-xs text-muted-foreground">
                  {m.position[0].toFixed(6)}, {m.position[1].toFixed(6)}
                </div>
                {m.address && <div className="text-xs">{m.address}</div>}
                {m.status && (
                  <div className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {m.status}
                  </div>
                )}
                {m.images && m.images.length > 0 && (
                  <div className="mt-1 grid grid-cols-3 gap-1">
                    {m.images.slice(0, 6).map((src, idx) => (
                      <a key={idx} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="report image" className="h-12 w-full rounded object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
