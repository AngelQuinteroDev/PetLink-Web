import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { reverseGeocode } from "../../lib/geocode";
import { getFreshPoint, requestGeoConsent } from "../../lib/geo";
import { DEFAULT_CENTER, type GeoPoint } from "../../lib/types";

function PointPicker({ onPick }: { onPick: (p: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

/** Leaflet no detecta cambios de tamaño del contenedor por sí solo. */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    window.addEventListener("orientationchange", invalidate);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", invalidate);
    };
  }, [map]);
  return null;
}

/** Al abrir el formulario, centra el mapa en el punto del usuario (una sola vez). */
function InitialFocus({ point }: { point: GeoPoint | null }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !point) return;
    done.current = true;
    map.setView([point.lat, point.lon], 15, { animate: false });
  }, [point, map]);
  return null;
}

interface Props {
  label: string;
  placeholder: string;
  text: string;
  onTextChange: (text: string) => void;
  point: GeoPoint | null;
  onPointChange: (point: GeoPoint) => void;
  help?: string;
}

/**
 * Lugar del reporte: solo el mapa (sin alertas) con el punto elegido.
 * Se marca tocando el mapa o con el botón de ubicación actual (abajo a la
 * derecha, igual que en el mapa principal).
 */
export default function LocationField({
  label,
  placeholder,
  text,
  onTextChange,
  point,
  onPointChange,
  help,
}: Props) {
  const [place, setPlace] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!point) return;
    let active = true;
    setBusy(true);
    void reverseGeocode(point).then((name) => {
      if (!active) return;
      setPlace(name);
      setBusy(false);
      if (name && !text.trim()) onTextChange(name);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point]);

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    },
    []
  );

  function flash(message: string) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3400);
  }

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      const granted = await requestGeoConsent();
      if (!granted) {
        flash("Activa la ubicación en tu navegador para usar tu posición.");
        return;
      }
      const fresh = await getFreshPoint();
      if (!fresh) {
        flash("No pudimos obtener tu ubicación. Marca el punto en el mapa.");
        return;
      }
      onPointChange(fresh);
      mapRef.current?.flyTo([fresh.lat, fresh.lon], 16, { duration: 0.7 });
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="pc-field">
      <label className="pc-field-label" htmlFor="location-text">
        {label}
      </label>
      <input
        id="location-text"
        className="pc-input"
        placeholder={placeholder}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />

      {point && (
        <span className="place-hint">
          <MapPin size={13} />
          {busy ? "Buscando el lugar…" : place ?? "Punto marcado en el mapa"}
        </span>
      )}

      <div className="location-map">
        <MapContainer
          ref={mapRef}
          center={[point?.lat ?? DEFAULT_CENTER.lat, point?.lon ?? DEFAULT_CENTER.lon]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />
          <InitialFocus point={point} />
          <PointPicker onPick={onPointChange} />
          {point && (
            <CircleMarker
              center={[point.lat, point.lon]}
              radius={9}
              pathOptions={{ color: "#7519ff", fillColor: "#ae77ff", fillOpacity: 0.9 }}
            />
          )}
        </MapContainer>

        <button
          type="button"
          className={`map-locate ${locating ? "map-locate--busy" : ""}`}
          onClick={() => void locateMe()}
          disabled={locating}
          aria-label="Usar mi ubicación actual"
          title="Usar mi ubicación actual"
        >
          <LocateFixed size={20} />
        </button>

        {notice && (
          <p className="map-notice" role="status">
            {notice}
          </p>
        )}
      </div>

      {help && <p className="pc-muted location-help">{help}</p>}
    </div>
  );
}
