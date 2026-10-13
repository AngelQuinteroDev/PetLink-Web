import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Camera } from "lucide-react";
import LocationField from "../components/report/LocationField";
import PrimaryButton from "../components/PrimaryButton.jsx";
import ChipGroup from "../components/ui/ChipGroup";
import SpeciesPicker from "../components/ui/SpeciesPicker";
import PhotoPickerModal from "../components/ui/PhotoPickerModal";
import { EmptyState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { createPet, listSpecies, uploadPhotos } from "../lib/api";
import { SEX_OPTIONS, SIZE_OPTIONS } from "../lib/petOptions";
import type { GeoPoint, PetSex, PetSize, Species } from "../lib/types";
import "../components/report/report.css";
import "../styles/pages.css";

export default function AdoptionPetPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const isPro = profile?.role === "vet" || profile?.role === "foundation";
  const isVerifiedPro =
    profile?.vet_status === "verified" &&
    (isPro || profile?.role === "admin");

  const [species, setSpecies] = useState<Species[]>([]);
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [placeText, setPlaceText] = useState("");
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [name, setName] = useState("");
  const [sex, setSex] = useState<PetSex | null>(null);
  const [size, setSize] = useState<PetSize | null>(null);
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listSpecies()
      .then(setSpecies)
      .catch(() => setSpecies([]));
  }, []);

  async function submit() {
    if (busyRef.current) return;
    setError(null);
    if (!name.trim()) {
      setError("Escribe el nombre de la mascota.");
      return;
    }
    if (!placeText.trim()) {
      setError("Indica el lugar dónde se encuentra.");
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      const photoUrl = photo ? (await uploadPhotos([photo], "pet-photos"))[0] : null;
      const details = [
        placeText.trim(),
        age.trim() ? `Edad aproximada: ${age.trim()}` : "",
        description.trim(),
      ]
        .filter(Boolean)
        .join(" · ");

      await createPet({
        name: name.trim(),
        speciesId,
        description: details || null,
        birthDate: null,
        photoUrl,
        sex,
        size,
        status: "for_adoption",
      });
      navigate("/adopcion");
    } catch (err) {
      console.error("createPet (adopción) falló:", err);
      setError("No pudimos publicar la mascota. Intenta de nuevo.");
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (!profile) return <LoadingState label="Cargando tu cuenta…" />;

  if (!isVerifiedPro) {
    return (
      <div>
        <div className="pc-page-header">
          <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            ‹
          </button>
          <h1 className="pc-title">Dar en adopción</h1>
          <span style={{ width: 42 }} />
        </div>
        <EmptyState
          icon={<BadgeCheck size={40} strokeWidth={1.6} />}
          title={isPro ? "Tu solicitud está en revisión" : "Necesitas verificación"}
          body={
            isPro
              ? "Un administrador está revisando tu solicitud de veterinario/refugio. Cuando sea aprobada podrás publicar mascotas en adopción."
              : "Verificamos cada solicitud. Para dar mascotas en adopción debes ser veterinario o refugio verificado: la comunidad verá tu etiqueta en la publicación."
          }
          action={
            <PrimaryButton onClick={() => navigate("/verificacion")} type="button">
              {isPro ? "Ver mi solicitud" : "Solicitar verificación"}
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">Dar en adopción</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="pc-form-card">
        <p className="pc-muted location-help">
          Tu cuenta está verificada
          {profile.role === "foundation" ? " como refugio" : profile.role === "vet" ? " como veterinario" : ""}
          : la comunidad verá tu etiqueta en la publicación.
        </p>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="adoption-name">
            Nombre
          </label>
          <input
            id="adoption-name"
            className="pc-input"
            placeholder="Ej: Luna"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Especie</span>
          <SpeciesPicker species={species} value={speciesId} onChange={setSpeciesId} />
        </div>

        <LocationField
          label="Lugar dónde se encuentra"
          placeholder="Ej: Parque de Usaquén"
          text={placeText}
          onTextChange={setPlaceText}
          point={point}
          onPointChange={setPoint}
        />

        <div className="pc-field">
          <span className="pc-field-label">Sexo</span>
          <ChipGroup options={SEX_OPTIONS} value={sex} onChange={setSex} label="Sexo" />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Tamaño</span>
          <ChipGroup options={SIZE_OPTIONS} value={size} onChange={setSize} label="Tamaño" />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="adoption-age">
            Edad aproximada
          </label>
          <input
            id="adoption-age"
            className="pc-input"
            placeholder="Ej: 2 años"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="adoption-desc">
            Características / Descripción
          </label>
          <textarea
            id="adoption-desc"
            className="pc-textarea"
            placeholder="Temperamento, estado de salud, vacunas, señas particulares…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Foto de la mascota</span>
          <div className="found-main-photo">
            {photo ? (
              <button
                type="button"
                className="found-main-photo__preview"
                onClick={() => setPickerOpen(true)}
              >
                <img src={URL.createObjectURL(photo)} alt="Foto de la mascota" />
              </button>
            ) : (
              <button
                type="button"
                className="found-main-photo__empty"
                onClick={() => setPickerOpen(true)}
              >
                <Camera size={26} />
                <span>Agregar foto</span>
              </button>
            )}
          </div>
          <PhotoPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={setPhoto}
          />
        </div>

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}

        <div className="pc-form-actions" style={{ display: "flex", gap: 10 }}>
          <PrimaryButton onClick={() => void submit()} type="button" disabled={busy}>
            {busy ? "Publicando…" : "Publicar mascota"}
          </PrimaryButton>
          <button type="button" className="pc-outline-btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
