import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { Map as LeafletMap, CircleMarker as LeafletCircleMarker } from "leaflet";
import { House, LocateFixed, MapPin, PawPrint, Phone, Stethoscope } from "lucide-react";
import "leaflet/dist/leaflet.css";
import GlassHeader from "../components/ui/GlassHeader";
import MapPopupCard from "../components/ui/MapPopupCard";
import PawLoader from "../components/ui/PawLoader";
import PetDetailModal, { type PetDetailData } from "../components/ui/PetDetailModal";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useUserLocation } from "../hooks/useUserLocation";
import { getMyPlace, getReportById, placesNear, reportsNear } from "../lib/api";
import { distanceLabel, dayLabel } from "../lib/format";
import { getFreshPoint } from "../lib/geo";
import { reportToDetailData } from "../lib/petDetail";
import { DEFAULT_CENTER, type GeoPoint, type PlaceNear, type ReportNear } from "../lib/types";
import "../styles/pages.css";

type Filter = "todo" | "lost" | "found" | "clinic" | "shelter";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "lost", label: "Perdidas" },
  { id: "found", label: "Encontradas" },
  { id: "clinic", label: "Veterinarias" },
  { id: "shelter", label: "Refugios" },
];

const REPORT_COLORS: Record<string, string> = { lost: "#e05252", found: "#4a7dd6" };
// Colores de Veterinaria / Refugio del diseño (mismos pines y etiquetas que la app)
const PLACE_COLORS: Record<string, string> = { clinic: "#7519ff", shelter: "#e08a2f" };

type FlyTarget = { lat: number; lon: number; zoom: number; nonce: number };

function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], target.zoom, { duration: 0.7 });
  }, [target, map]);
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

function reportDistance(r: ReportNear): string {
  return r.distance_m != null ? distanceLabel(r.distance_m) : "";
}

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("todo");
  const [center, setCenter] = useState<GeoPoint>(DEFAULT_CENTER);
  const [reports, setReports] = useState<ReportNear[]>([]);
  const [places, setPlaces] = useState<PlaceNear[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PetDetailData | null>(null);
  const [userMarker, setUserMarker] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const deepLinkHandled = useRef(false);
  const noticeTimer = useRef<number | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const reportLayers = useRef<Record<string, LeafletCircleMarker>>({});
  const placeLayers = useRef<Record<string, LeafletCircleMarker>>({});
  const { point, radius, consent, loading: locLoading, requestConsent } = useUserLocation();

  /** "Ver en el mapa" de una tarjeta: centra el mapa en la publicación y abre su globo. */
  const locateOn = useCallback((key: string, lat: number, lon: number) => {
    mapRef.current?.flyTo([lat, lon], 16, { duration: 0.6 });
    const layers = key.startsWith("r-") ? reportLayers.current : placeLayers.current;
    window.setTimeout(() => layers[key]?.openPopup(), 700);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3600);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    },
    []
  );

  const load = useCallback(async (origin: GeoPoint, radiusM: number) => {
    setLoading(true);
    setError(null);
    try {
      setCenter(origin);
      const [r, p] = await Promise.all([
        reportsNear(origin, radiusM, 30),
        placesNear(origin, radiusM),
      ]);
      setReports(r.filter((x) => x.type === "lost" || x.type === "found"));
      setPlaces(p);
      setLoadedOnce(true);
    } catch {
      setError("No pudimos cargar el mapa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!locLoading) void load(point, radius);
  }, [locLoading, point, radius, load]);

  // Marcador azul del usuario cuando ya dio permiso de ubicación.
  useEffect(() => {
    if (consent && (point.lat !== DEFAULT_CENTER.lat || point.lon !== DEFAULT_CENTER.lon)) {
      setUserMarker(point);
    }
  }, [consent, point]);

  // Deep link desde notificaciones/feed: /mapa?report=<id>
  useEffect(() => {
    if (locLoading || loading || deepLinkHandled.current) return;
    deepLinkHandled.current = true;
    const reportId = searchParams.get("report");
    if (reportId) {
      void (async () => {
        const rep = await getReportById(reportId, point).catch(() => null);
        if (!rep) return;
        setFlyTarget({ lat: rep.latitude, lon: rep.longitude, zoom: 15, nonce: Date.now() });
        setReports((prev) => (prev.some((r) => r.id === rep.id) ? prev : [rep, ...prev]));
        setHighlightId(rep.id);
        setTimeout(() => {
          document
            .querySelector(`[data-report-id="${rep.id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        setTimeout(() => reportLayers.current[`r-${rep.id}`]?.openPopup(), 900);
        setTimeout(() => setHighlightId(null), 2600);
      })();
      return;
    }
    // "Ver en el mapa" de una sede propia: /mapa?place=<id>
    const placeId = searchParams.get("place");
    if (placeId) {
      void (async () => {
        const mine = await getMyPlace(placeId).catch(() => null);
        if (!mine?.point) {
          flash("No pudimos ubicar esa sede en el mapa.");
          return;
        }
        const target = mine.point;
        await load(target, radius);
        setFlyTarget({ lat: target.lat, lon: target.lon, zoom: 16, nonce: Date.now() });
        setTimeout(() => placeLayers.current[`p-${mine.id}`]?.openPopup(), 900);
      })();
    }
  }, [locLoading, loading, searchParams, point, radius, load, flash]);

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      let granted = consent;
      if (!granted) granted = await requestConsent();
      if (!granted) {
        flash("Activa la ubicación en tu navegador para verte en el mapa.");
        return;
      }
      const fresh = await getFreshPoint();
      if (!fresh) {
        flash("No pudimos obtener tu ubicación. Intenta de nuevo.");
        return;
      }
      setUserMarker(fresh);
      setFlyTarget({ lat: fresh.lat, lon: fresh.lon, zoom: 16, nonce: Date.now() });
      void load(fresh, radius);
    } finally {
      setLocating(false);
    }
  }

  const visibleReports = reports.filter((r) =>
    filter === "todo" ? true : filter === "lost" ? r.type === "lost" : filter === "found" ? r.type === "found" : false
  );
  const visiblePlaces = places.filter((p) =>
    filter === "todo" ? true : filter === "clinic" ? p.kind === "clinic" : filter === "shelter" ? p.kind === "shelter" : false
  );
  const showReports = filter === "todo" || filter === "lost" || filter === "found";
  const showPlaces = filter === "todo" || filter === "clinic" || filter === "shelter";

  return (
    <div>
      <GlassHeader title="Mapa" />

      <div className="map-filters" role="tablist" aria-label="Filtros del mapa">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`map-filter-chip ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!loadedOnce && loading && <LoadingState label="Buscando cerca de ti…" />}
      {!loadedOnce && !loading && error && (
        <ErrorState message={error} onRetry={() => void load(point, radius)} />
      )}

      {loadedOnce && (
        <div className="map-layout">
          <div className="map-canvas">
            <MapContainer
              ref={mapRef}
              center={[center.lat, center.lon]}
              zoom={13}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizer />
              <FlyTo target={flyTarget} />
              {userMarker && (
                <CircleMarker
                  center={[userMarker.lat, userMarker.lon]}
                  radius={8}
                  pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2f7cf6", fillOpacity: 1 }}
                >
                  <Popup className="map-popup" autoPan maxWidth={260}>
                    <MapPopupCard title="Estás aquí" meta="Tu ubicación aproximada" icon={<MapPin size={20} />} />
                  </Popup>
                </CircleMarker>
              )}
              {showReports &&
                visibleReports.map((r) => (
                  <CircleMarker
                    key={r.id}
                    ref={(layer) => {
                      if (layer) reportLayers.current[`r-${r.id}`] = layer;
                    }}
                    center={[r.latitude, r.longitude]}
                    radius={9}
                    pathOptions={{ color: REPORT_COLORS[r.type], fillColor: REPORT_COLORS[r.type], fillOpacity: 0.85 }}
                  >
                    <Popup className="map-popup" autoPan maxWidth={280}>
                      <MapPopupCard
                        title={r.pet_name ?? r.species_name ?? "Mascota"}
                        meta={[reportDistance(r), dayLabel(r.created_at).toLowerCase()]
                          .filter(Boolean)
                          .join(" · ")}
                        badge={r.type === "lost" ? "Perdido" : "Encontrado"}
                        badgeColor={REPORT_COLORS[r.type]}
                        photoUrl={r.pet_photo_url}
                        icon={<PawPrint size={20} />}
                        onClick={() => {
                          mapRef.current?.closePopup();
                          setDetail(reportToDetailData(r));
                        }}
                      />
                    </Popup>
                  </CircleMarker>
                ))}
              {showPlaces &&
                visiblePlaces.map((p) => (
                  <CircleMarker
                    key={p.id}
                    ref={(layer) => {
                      if (layer) placeLayers.current[`p-${p.id}`] = layer;
                    }}
                    center={[p.latitude, p.longitude]}
                    radius={9}
                    pathOptions={{ color: PLACE_COLORS[p.kind], fillColor: PLACE_COLORS[p.kind], fillOpacity: 0.85 }}
                  >
                    <Popup className="map-popup" autoPan maxWidth={280}>
                      <MapPopupCard
                        title={p.name}
                        meta={[
                          p.address ?? (p.kind === "clinic" ? "Veterinaria" : "Refugio"),
                          distanceLabel(p.distance_m),
                        ].join(" · ")}
                        badge={p.kind === "clinic" ? "Veterinaria" : "Refugio"}
                        badgeColor={PLACE_COLORS[p.kind]}
                        icon={p.kind === "clinic" ? <Stethoscope size={20} /> : <House size={20} />}
                        phone={p.phone}
                      />
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>

            <button
              type="button"
              className={`map-locate ${locating ? "map-locate--busy" : ""}`}
              onClick={() => void locateMe()}
              disabled={locating}
              aria-label="Ir a mi ubicación"
              title="Mi ubicación"
            >
              <LocateFixed size={20} />
            </button>

            {loading && (
              <span className="map-refresh" role="status">
                <PawLoader size={18} />
                Actualizando…
              </span>
            )}

            {notice && (
              <p className="map-notice" role="status">
                {notice}
              </p>
            )}
          </div>

          <div>
            <h2 className="pc-section-title" style={{ marginBottom: 12 }}>Cerca de ti</h2>
            {error && (
              <div className="map-inline-error" role="alert">
                <span>No pudimos actualizar el mapa.</span>
                <button type="button" onClick={() => void load(point, radius)}>
                  Reintentar
                </button>
              </div>
            )}
            {visibleReports.length === 0 && visiblePlaces.length === 0 ? (
              <EmptyState
                title="Nada cerca por ahora"
                body="Amplía el radio de búsqueda en tu perfil o vuelve más tarde."
              />
            ) : (
              <div className="map-list">
                {showReports &&
                  visibleReports.map((r) => (
                    <div
                      key={r.id}
                      data-report-id={r.id}
                      className={`map-row ${highlightId === r.id ? "flash-highlight" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetail(reportToDetailData(r))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetail(reportToDetailData(r));
                        }
                      }}
                    >
                      {r.pet_photo_url ? (
                        <img
                          className="map-row__thumb"
                          src={r.pet_photo_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="map-row__thumb" aria-hidden="true" />
                      )}
                      <span className="map-row__info">
                        <span className="map-row__title">
                          {r.pet_name ?? "Mascota"} · {r.type === "lost" ? "Perdido" : "Encontrado"}
                        </span>
                        <span className="map-row__meta">
                          <MapPin size={13} /> {r.description || "Cerca de ti"}
                          {reportDistance(r) ? ` · ${reportDistance(r)}` : ""}
                        </span>
                      </span>
                      <span className="map-row__side">
                        <span className="pc-badge pc-badge--lost">{dayLabel(r.created_at)}</span>
                        <button
                          type="button"
                          className="map-row__locate"
                          onClick={(e) => {
                            e.stopPropagation();
                            locateOn(`r-${r.id}`, r.latitude, r.longitude);
                          }}
                          aria-label={`Ver ${r.pet_name ?? "esta mascota"} en el mapa`}
                        >
                          <MapPin size={12} /> Ver en el mapa
                        </button>
                      </span>
                    </div>
                  ))}
                {showPlaces &&
                  visiblePlaces.map((p) => (
                    <div key={p.id} className="map-row" style={{ cursor: "default" }}>
                      <span className="map-row__thumb" aria-hidden="true" />
                      <span className="map-row__info">
                        <span className="map-row__title">{p.name}</span>
                        <span className="map-row__meta">
                          {p.address ?? (p.kind === "clinic" ? "Veterinaria" : "Refugio")} · {distanceLabel(p.distance_m)}
                        </span>
                      </span>
                      <span className="map-row__side">
                        {p.phone && (
                          <a
                            className="pc-pill-btn"
                            style={{ background: "var(--pc-primary)", color: "#fff" }}
                            href={`tel:${p.phone}`}
                            aria-label={`Llamar a ${p.name}`}
                          >
                            <Phone size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="map-row__locate"
                          onClick={() => locateOn(`p-${p.id}`, p.latitude, p.longitude)}
                          aria-label={`Ver ${p.name} en el mapa`}
                        >
                          <MapPin size={12} /> Ver en el mapa
                        </button>
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      <PetDetailModal data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
