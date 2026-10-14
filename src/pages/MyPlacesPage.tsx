import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin, Plus } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { EmptyState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { myPlaces } from "../lib/api";
import { publisherKinds, type PublisherKind } from "../lib/publisher";
import { PLACE_TEXT, placeMenuKind } from "../lib/professional";
import type { MyPlace } from "../lib/types";
import "../styles/pages.css";

/**
 * "Mis veterinarias / Mis refugios / Mis consultorios" (homologado de la app):
 * todas las sedes de la cuenta. Tocar una la abre para verla, editarla o eliminarla;
 * "Agregar" crea otra y queda pendiente hasta que un admin la verifique.
 */
export default function MyPlacesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [places, setPlaces] = useState<MyPlace[] | null>(null);
  const [kind, setKind] = useState<PublisherKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notice = (location.state as { notice?: string } | null)?.notice ?? null;

  const isProfessional = profile?.role === "vet" || profile?.role === "foundation";

  const load = useCallback(async () => {
    if (!profile || !isProfessional) return;
    try {
      const [list, kinds] = await Promise.all([myPlaces(), publisherKinds([profile.id])]);
      setPlaces(list);
      setKind(placeMenuKind(profile.role, kinds[profile.id], list[0]?.kind));
    } catch {
      setPlaces([]);
      setError("No pudimos cargar tus sedes.");
    }
  }, [profile, isProfessional]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!profile) return <LoadingState label="Cargando tus sedes…" />;

  if (!isProfessional) {
    return (
      <div>
        <div className="pc-page-header">
          <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            ‹
          </button>
          <h1 className="pc-title">Mis lugares</h1>
          <span style={{ width: 42 }} />
        </div>
        <EmptyState
          icon={<BadgeCheck size={40} strokeWidth={1.6} />}
          title="Necesitas una cuenta profesional"
          body="Solicita la verificación como veterinario o fundación para publicar tus lugares en el mapa."
          action={
            <PrimaryButton onClick={() => navigate("/verificacion")} type="button">
              Solicitar verificación
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  const t = PLACE_TEXT[kind ?? "clinic"];

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">{t.listTitle}</h1>
        <span style={{ width: 42 }} />
      </div>

      {notice && (
        <p className="auth-page__notice" role="status">
          {notice}
        </p>
      )}

      <div className="pc-form-card">
        <p className="pc-muted places-intro">{t.listIntro}</p>

        {kind === "shelter" && t.adoptionCta && (
          <button
            type="button"
            className="place-adopt-cta"
            onClick={() => navigate("/reportar/adopcion")}
          >
            {t.adoptionCta} ›
          </button>
        )}

        {places === null && !error && <LoadingState label="Cargando tus sedes…" />}

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}

        {places?.length === 0 && !error && <p className="pc-muted places-empty">{t.empty}</p>}

        <div className="places-list">
          {places?.map((p) => (
            <article
              key={p.id}
              className="place-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/mi-clinica/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/mi-clinica/${p.id}`);
                }
              }}
            >
              <span className="place-card__pin">
                <MapPin size={18} />
              </span>
              <span className="place-card__info">
                <span className="place-card__name">{p.name}</span>
                <span className="place-card__address">{p.address || "Sin dirección"}</span>
                <span className={`place-card__status ${p.verified ? "is-verified" : ""}`}>
                  {p.verified ? "✓ Verificada · visible en el mapa" : "Pendiente de verificación"}
                </span>
              </span>
              {p.verified && p.point && (
                <button
                  type="button"
                  className="pc-outline-btn place-card__map"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/mapa?place=${p.id}`);
                  }}
                >
                  Ver en el mapa
                </button>
              )}
            </article>
          ))}
        </div>

        {places !== null && (
          <div className="pc-form-actions">
            <PrimaryButton onClick={() => navigate("/mi-clinica/nueva")} type="button">
              <Plus size={16} /> {places.length ? t.addLabel : t.addFirst}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
