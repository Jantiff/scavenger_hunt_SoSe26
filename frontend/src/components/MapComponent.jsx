import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix für die Standard-Marker-Icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Komponente zum automatischen Fokussieren auf neue Koordinaten
const MapUpdater = ({ latitude, longitude, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      // Prüfen ob die Koordinaten gültig sind
      if (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        // Sanft zur neuen Position bewegen
        map.setView([latitude, longitude], zoom || map.getZoom(), {
          animate: true,
          duration: 1.0, // Animation dauert 1 Sekunde
        });
      }
    }
  }, [latitude, longitude, zoom, map]);

  return null;
};

// für manuelle Pin-Setzung
const ClickHandler = ({ onMapClick, allowManualPin }) => {
  useMapEvents({
    click: (e) => {
      if (allowManualPin && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

/**
 * MapComponent - Wiederverwendbare Karten-Komponente mit OpenStreetMap
 *
 * @param {Object} props
 * @param {number} props.latitude - Breitengrad für die Marker-Position
 * @param {number} props.longitude - Längengrad für die Marker-Position
 * @param {number} [props.radius] - Radius in Metern für einen Kreis um den Marker (optional)
 * @param {boolean} [props.allowManualPin=false] - Erlaubt manuelle Pin-Setzung durch Klick (optional)
 * @param {function} [props.onMapClick] - Callback-Funktion wenn auf Karte geklickt wird (lat, lng)
 * @param {number} [props.zoom=13] - Zoom-Level der Karte (optional, Standard: 13)
 * @param {string} [props.width="100%"] - Breite der Karte (optional, Standard: "100%")
 * @param {string} [props.height="400px"] - Höhe der Karte (optional, Standard: "400px")
 * @param {string} [props.popupText] - Text für das Popup beim Klick auf den Marker (optional)
 * @param {string} [props.className] - CSS-Klasse für zusätzliches Styling (optional)
 * @param {boolean} [props.interactive=true] - Ob die Karte interaktiv sein soll (optional, Standard: true)
 */
const MapComponent = ({
  latitude,
  longitude,
  radius,
  allowManualPin = false,
  onMapClick,
  zoom = 13,
  width = "100%",
  height = "400px",
  popupText,
  className = "",
  interactive = true,
}) => {
  const [mapKey, setMapKey] = useState(0);
  const { t } = useTranslation();

  // Validierung der Koordinaten
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <div style={{ width, height }} className={`map-error ${className}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "var(--color-surface-solid-light)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "4px",
            color: "var(--color-text-muted-light)",
          }}
        >
          {t("coordinates_invalid")}
        </div>
      </div>
    );
  }

  // Überprüfung ob Koordinaten im gültigen Bereich sind
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return (
      <div style={{ width, height }} className={`map-error ${className}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "var(--color-surface-solid-light)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "4px",
            color: "var(--color-text-muted-light)",
          }}
        >
          {t("coordinates_to_big")}
        </div>
      </div>
    );
  }

  const position = [latitude, longitude];

  return (
    <div style={{ width, height }} className="map-container">
      <MapContainer
        key={mapKey}
        center={position}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <MapUpdater latitude={latitude} longitude={longitude} zoom={zoom} />
        {allowManualPin && (
          <ClickHandler
            allowManualPin={allowManualPin}
            onMapClick={onMapClick}
          />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {popupText && <Popup>{popupText}</Popup>}
        </Marker>
        {radius && (
          <Circle
            center={position}
            radius={radius}
            pathOptions={{
              color: "var(--color-warning-light)",
              fillColor: "var(--color-warning-light)",
              fillOpacity: 0.4,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
