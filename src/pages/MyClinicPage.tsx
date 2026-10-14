import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Clock, LocateFixed } from "lucide-react";
import LocationField from "../components/report/LocationField";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { EmptyState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { createMyClinic, deleteMyPlace, getMyPlace, updateMyPlace } from "../lib/api";
import { publisherKinds, type PublisherKind } from "../lib/publisher";
import { PLACE_TEXT, placeMenuKind } from "../lib/professional";
import type { GeoPoint, MyPlace } from "../lib/types";
import "../components/report/report.css";
import "../styles/pages.css";

/**
 * Una sede (veterinaria / refugio / consultorio), homologado de la app:
 * - /mi-clinica/nueva  crear una sede nueva (create_clinic → queda pendiente)
 * - /mi-clinica/:id    ver, editar o eliminar una sede propia
 * Editar una sede ya verificada usa update_my_place: el teléfono cambia al instante y, si
 * cambia el nombre, la dirección o la ubicación, vuelve a revisión de un administrador.
 */
export default function MyClinicPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  // La ruta estática /mi-clinica/nueva no trae param; /mi-clinica/:id sí
  const isNew = !routeId || routeId === "nueva";
  const placeId = isNew ? null : routeId;
  const { profile } = useAuth();

  const [place, setPlace] = useState<MyPlace | null>(null);
  const [kind, setKind] = useState<PublisherKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationText, setLocationText] = useState("");
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [moving, setMoving] = useState(false); // sede verificada: mover la ubicación en el mapa

  const isProfessional = profile?.role === "vet" || profile?.role === "foundation";

  const load = useCallback(async () => {
    if (!profile || !isProfessional) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [mine, kinds] = await Promise.all([
        placeId ? getMyPlace(placeId) : Promise.resolve(null),
        publisherKinds([profile.id]),
      ]);
      const fallbackKind =
        mine?.kind === "clinic" || mine?.kind === "shelter" ? mine.kind : undefined;
      setKind(placeMenuKind(profile.role, kinds[profile.id], fallbackKind));
      if (!isNew && !mine) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPlace(mine);
      if (mine) {
        setName(mine.name);
        setPhone(mine.phone ?? "");
        setLocationText(mine.address ?? "");
        setPoint(mine.point);
      }
    } catch {
      setError("No pudimos cargar esta sede.");
    } finally {
      setLoading(false);
    }
  }, [profile, isProfessional, placeId, isNew]);

  useEffect(() => {
    void load();
  }, [load]);

  const t = PLACE_TEXT[kind ?? (profile?.role === "foundation" ? "shelter" : "clinic")];

  async function create() {
    if (name.trim().length < 3) {
      setError(t.nameError);
      return;
    }
    if (!point) {
      setError("Marca en el mapa dónde está (o usa tu ubicación actual).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createMyClinic({
        name: name.trim(),
        address: locationText.trim(),
        phone: phone.trim() || null,
        point,
        // Provisional según el rol; el admin decide la etiqueta definitiva al verificar
        kind: kind === "shelter" || profile?.role === "foundation" ? "shelter" : "clinic",
      });
      navigate("/mis-lugares", { state: { notice: t.created } });
    } catch (err) {
      console.error("create_clinic falló:", err);
      setError("No pudimos crear esta sede. Intenta de nuevo.");
      setBusy(false);
    }
  }

  async function save() {
    if (!place) return;
    if (name.trim().length < 3) {
      setError(t.nameError);
      return;
    }
    if (place.verified && moving && !point) {
      setError("Marca la nueva ubicación en el mapa.");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const backToReview = await updateMyPlace(place.id, {
        name: name.trim(),
        address: locationText.trim(),
        phone: phone.trim() || null,
        point: !place.verified || moving ? point : null,
      });
      setMoving(false);
      if (backToReview) {
        setSaved(
          "Cambios guardados. Como cambiaste el nombre, la dirección o la ubicación, un administrador lo revisará de nuevo."
        );
      } else if (place.verified) {
        setSaved("Teléfono actualizado.");
      } else {
        setSaved("Cambios guardados.");
      }
      const mine = await getMyPlace(place.id);
      if (mine) {
        setPlace(mine);
        setName(mine.name);
        setPhone(mine.phone ?? "");
        setLocationText(mine.address ?? "");
        setPoint(mine.point);
      }
    } catch (err) {
      console.error("update_my_place falló:", err);
      setError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!place) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteMyPlace(place.id);
      navigate("/mis-lugares", { state: { notice: "Sede eliminada." } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos eliminar esta sede.");
      setConfirmDelete(false);
      setBusy(false);
    }
  }

  if (!profile || (loading && isProfessional)) {
    return <LoadingState label={isNew ? "Preparando el formulario…" : "Cargando esta sede…"} />;
  }

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

  if (notFound) {
    return (
      <div>
        <div className="pc-page-header">
          <button type="button" className="pc-back-btn" onClick={() => navigate("/mis-lugares")} aria-label="Volver">
            ‹
          </button>
          <h1 className="pc-title">Mis lugares</h1>
          <span style={{ width: 42 }} />
        </div>
        <EmptyState
          icon={<LocateFixed size={40} strokeWidth={1.6} />}
          title="No encontramos esta sede"
          body="Puede que la hayas eliminado. Vuelve a la lista de tus lugares para ver las que tienes."
          action={
            <PrimaryButton onClick={() => navigate("/mis-lugares")} type="button">
              Ir a mis lugares
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate("/mis-lugares")} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">{isNew ? t.newTitle : place?.name || t.title}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="pc-form-card">
        {isNew && <p className="pc-muted places-intro">{t.intro}</p>}

        {place && (
          <div className="pro-status">
            <span className="pro-status__icon">
              {place.verified ? <BadgeCheck size={20} /> : <Clock size={20} />}
            </span>
            <div>
              <p className="pro-status__title">
                {place.verified ? t.verified : "Pendiente de verificación"}
              </p>
              <p className="pc-muted pro-status__meta">
                {place.verified ? t.verifiedSub : t.pending}
              </p>
            </div>
          </div>
        )}

        {saved && (
          <p className="auth-page__notice" role="status">
            {saved}
          </p>
        )}

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="place-name">
            Nombre
          </label>
          <input
            id="place-name"
            className="pc-input"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="place-phone">
            Teléfono (opcional)
          </label>
          <input
            id="place-phone"
            className="pc-input"
            placeholder="Ej: 601 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {place && place.verified && !moving ? (
          <div className="pc-field">
            <label className="pc-field-label" htmlFor="place-address">
              Dirección
            </label>
            <input
              id="place-address"
              className="pc-input"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
            <button
              type="button"
              className="pc-outline-btn place-move-btn"
              onClick={() => setMoving(true)}
            >
              <LocateFixed size={16} /> Cambiar la ubicación en el mapa
            </button>
          </div>
        ) : (
          <LocationField
            label="Ubicación"
            placeholder="Ej: Cra 7 # 45-12, Bogotá"
            text={locationText}
            onTextChange={setLocationText}
            point={point}
            onPointChange={setPoint}
            help={
              isNew
                ? "Marca en el mapa dónde está; aparecerá en el mapa público cuando un administrador lo verifique."
                : "Marca la nueva ubicación: el lugar volverá a revisión de un administrador."
            }
          />
        )}

        {place?.verified && (
          <p className="pc-muted location-help">
            El teléfono se actualiza al instante. Si cambias el nombre, la dirección o la
            ubicación, un administrador lo revisará de nuevo antes de mostrarlo.
          </p>
        )}

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}

        <div className="pc-form-actions">
          {isNew ? (
            <PrimaryButton onClick={() => void create()} type="button">
              {busy ? "Guardando…" : t.create}
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton onClick={() => void save()} type="button">
                {busy ? "Guardando…" : "Guardar cambios"}
              </PrimaryButton>
              {place?.verified && (
                <button
                  type="button"
                  className="pc-outline-btn"
                  onClick={() => navigate(`/mapa?place=${place.id}`)}
                >
                  Ver en el mapa
                </button>
              )}
            </>
          )}
        </div>

        {place && (
          <>
            {confirmDelete && !busy && (
              <p className="pc-muted location-help">
                Dejará de aparecer en el mapa. Toca otra vez para confirmar.
              </p>
            )}
            <button
              type="button"
              className="place-delete"
              disabled={busy}
              onClick={() => void remove()}
            >
              {confirmDelete ? "Sí, eliminar esta sede" : t.deleteLabel}
            </button>
          </>
        )}
      </div>

      {place?.verified && (
        <div className="pc-form-card" style={{ marginTop: 14 }}>
          <span className="pc-field-label">Adopciones</span>
          <p className="pc-muted location-help">
            Comparte mascotas en adopción; aparecerán en la sección de adopción de la
            comunidad con tu etiqueta verificada.
          </p>
          <button
            type="button"
            className="pc-outline-btn"
            onClick={() => navigate("/reportar/adopcion")}
          >
            Publicar mascota en adopción
          </button>
        </div>
      )}
    </div>
  );
}
