import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { reverseGeocode, searchPlace } from "../../lib/geocode";
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
  onPointChange: (point: GeoPoint | null) => void;
  help?: string;
}

/**
 * Lugar de un formulario (reportes, adopción, sedes): dirección + mini mapa, y uno completa al
 * otro (homologado de la app):
 * - escribir la dirección → al dejar de escribir se ubica sola en el mapa;
 * - tocar el mapa o usar la ubicación actual → se marca el punto y se escribe su dirección.
 * Mientras se escribe, el punto anterior deja de valer hasta ubicar la nueva dirección.
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
  const [syncing, setSyncing] = useState<"" | "map" | "address">("");
  const [note, setNote] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const lastPick = useRef<GeoPoint | null>(null); // punto que puso el mapa (ya tiene nombre)
  const fromMap = useRef<string | null>(null); // texto que puso el mapa: no se vuelve a buscar
  const typed = useRef(false); // el usuario escribió (no viene del mapa)

  // Nombre del lugar marcado (solo para el aviso bajo el campo)
  useEffect(() => {
    if (!point) {
      setPlace(null);
      setBusy(false);
      return;
    }
    if (lastPick.current === point) return; // ya lo resolvió pick()
    let active = true;
    setBusy(true);
    void reverseGeocode(point).then((name) => {
      if (!active) return;
      setPlace(name);
      setBusy(false);
    });
    return () => {
      active = false;
    };
  }, [point]);

  function changeText(value: string) {
    typed.current = true;
    onTextChange(value);
    onPointChange(null); // el punto anterior ya no corresponde al texto
  }

  /** Tocar el mapa o usar el GPS: marca el punto y escribe su dirección. */
  async function pick(p: GeoPoint) {
    lastPick.current = p;
    onPointChange(p);
    setSyncing("address");
    setNote(null);
    const name = await reverseGeocode(p).catch(() => null);
    setSyncing("");
    if (name) {
      setPlace(name);
      setBusy(false);
    }
    const finalText = name ?? `Punto marcado en el mapa (${p.lat.toFixed(4)}, ${p.lon.toFixed(4)})`;
    fromMap.current = finalText;
    typed.current = false;
    onTextChange(finalText);
    setNote(
      name
        ? "Escribimos la dirección del punto que marcaste. Puedes corregirla."
        : "Marcamos el punto en el mapa."
    );
  }

  // Escribir la dirección: al dejar de escribir (0,9 s) se ubica sola en el mapa
  useEffect(() => {
    const value = text.trim();
    if (!typed.current || value.length < 6 || value === fromMap.current) return undefined;
    let alive = true;
    const timer = window.setTimeout(async () => {
      setSyncing("map");
      const p = await searchPlace(value).catch(() => null);
      if (!alive) return;
      setSyncing("");
      if (p) {
        lastPick.current = p;
        setPlace(value);
        setBusy(false);
        onPointChange(p);
        setNote("Ubicamos la dirección en el mapa. Si no es exacto, toca el punto correcto.");
      } else {
        setNote("No encontramos esa dirección en el mapa: escríbela más completa o toca el mapa.");
      }
    }, 900);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // onPointChange cambia en cada render del padre: solo importa el texto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      const granted = await requestGeoConsent();
      if (!granted) {
        setNote("Activa la ubicación en tu navegador para usar tu posición.");
        return;
      }
      const fresh = await getFreshPoint();
      if (!fresh) {
        setNote("No pudimos obtener tu ubicación. Marca el punto en el mapa.");
        return;
      }
      mapRef.current?.flyTo([fresh.lat, fresh.lon], 16, { duration: 0.7 });
      await pick(fresh);
    } finally {
      setLocating(false);
    }
  }

  const statusText =
    syncing === "map"
      ? "Buscando la dirección en el mapa…"
      : syncing === "address"
        ? "Buscando la dirección de ese punto…"
        : note;

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
        onChange={(e) => changeText(e.target.value)}
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
          <PointPicker onPick={(p) => void pick(p)} />
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

        {statusText && (
          <p className="map-notice" role="status">
            {statusText}
          </p>
        )}
      </div>

      {help && <p className="pc-muted location-help">{help}</p>}
    </div>
  );
}
