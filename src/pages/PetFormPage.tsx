import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Trash2 } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton.jsx";
import ChipGroup from "../components/ui/ChipGroup";
import SpeciesPicker from "../components/ui/SpeciesPicker";
import PhotoPickerModal from "../components/ui/PhotoPickerModal";
import PhotoCropModal from "../components/ui/PhotoCropModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { createPet, deletePet, getMyPet, listSpecies, updatePet, uploadPhoto } from "../lib/api";
import { birthDateToYears, yearsToBirthDate } from "../lib/format";
import type { PetSex, PetSize, Species } from "../lib/types";
import "../components/report/report.css";
import "../styles/pages.css";

const PET_SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
];

const SIZE_OPTIONS: { value: PetSize; label: string }[] = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];

export default function PetFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [species, setSpecies] = useState<Species[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null); // foto elegida, esperando que el usuario la ajuste
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [sex, setSex] = useState<PetSex | null>(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState<PetSize | null>(null);
  const [markings, setMarkings] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    void listSpecies()
      .then(setSpecies)
      .catch(() => setSpecies([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void (async () => {
      try {
        const pet = await getMyPet(id);
        if (!active) return;
        if (!pet) {
          setLoadError("No encontramos esa mascota en tu perfil.");
          return;
        }
        setName(pet.name);
        setSpeciesId(pet.species_id);
        setSex(pet.sex);
        setBreed(pet.breed ?? "");
        setAgeYears(birthDateToYears(pet.birth_date));
        setColor(pet.color ?? "");
        setSize(pet.size);
        setMarkings(pet.description ?? "");
        setExistingPhotoUrl(pet.photo_url);
      } catch {
        if (active) setLoadError("No pudimos cargar la información de tu mascota.");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function submit() {
    if (busyRef.current) return;
    if (name.trim().length < 2) {
      setError("Escribe el nombre de tu mascota.");
      return;
    }
    if (!speciesId) {
      setError("Selecciona la especie de tu mascota.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      let photoUrl: string | null = existingPhotoUrl;
      if (photo) photoUrl = await uploadPhoto(photo, "pet-photos");
      const payload = {
        name: name.trim(),
        speciesId,
        description: markings.trim() || null,
        birthDate: yearsToBirthDate(ageYears),
        photoUrl,
        sex,
        breed: breed.trim() || null,
        color: color.trim() || null,
        size,
      };
      if (editing && id) {
        await updatePet(id, payload);
      } else {
        await createPet(payload);
      }
      navigate("/perfil");
    } catch (err) {
      console.error("guardar mascota falló:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      if (message.includes("Ya registraste")) {
        setError("Esta mascota ya fue registrada hace un momento. Revisa tu perfil.");
      } else {
        setError(
          editing
            ? "No pudimos guardar los cambios. Intenta de nuevo."
            : "No pudimos inscribir a tu mascota. Intenta de nuevo."
        );
      }
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!id || deleting) return;
    setDeleting(true);
    try {
      await deletePet(id);
      navigate("/perfil");
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
      setError("No pudimos eliminar la mascota. Intenta de nuevo.");
    }
  }

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">{editing ? "Editar mascota" : "Inscribir mascota"}</h1>
        <span style={{ width: 42 }} />
      </div>

      {loadError && (
        <p className="pc-error-text" role="alert" style={{ marginBottom: 12 }}>
          {loadError}
        </p>
      )}

      <div className="pc-form-card">
        <div className="pc-field">
          <span className="pc-field-label">Agrega una foto clara de tu mascota</span>
          <button
            type="button"
            className={photo || existingPhotoUrl ? "found-main-photo__preview" : "found-main-photo__empty"}
            onClick={() => setPickerOpen(true)}
          >
            {photo || existingPhotoUrl ? (
              <img
                src={photo ? URL.createObjectURL(photo) : (existingPhotoUrl as string)}
                alt="Vista previa de tu mascota"
              />
            ) : (
              <>
                <Camera size={26} />
                <span>Agregar foto</span>
              </>
            )}
          </button>
          <PhotoPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={setCropFile}
          />
          {/* Elegir qué parte de la foto se ve en la tarjeta y en la ficha expandida */}
          <PhotoCropModal
            file={cropFile}
            onCancel={() => setCropFile(null)}
            onDone={(file) => {
              setCropFile(null);
              setPhoto(file);
            }}
          />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Especie</span>
          <SpeciesPicker species={species} value={speciesId} onChange={setSpeciesId} />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Sexo</span>
          <ChipGroup options={PET_SEX_OPTIONS} value={sex} onChange={setSex} label="Sexo" />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="pet-name">
            Nombre
          </label>
          <input
            id="pet-name"
            className="pc-input"
            placeholder="Ej: Mati"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="pet-breed">
            Raza (opcional)
          </label>
          <input
            id="pet-breed"
            className="pc-input"
            placeholder="Ej: Criollo"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="pet-age">
            Edad (años)
          </label>
          <input
            id="pet-age"
            className="pc-input"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="Ej: 2 o 0.5 para 6 meses"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
          />
          <p className="pc-muted location-help">
            {yearsToBirthDate(ageYears) ? (
              <>
                Nacimiento aproximado:{" "}
                {new Date(yearsToBirthDate(ageYears) as string).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </>
            ) : (
              "Si no sabes la fecha exacta, pon los años aproximados."
            )}
          </p>
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="pet-color">
            Color
          </label>
          <input
            id="pet-color"
            className="pc-input"
            placeholder="Ej: Café con blanco"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">Tamaño</span>
          <ChipGroup options={SIZE_OPTIONS} value={size} onChange={setSize} label="Tamaño" />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="pet-markings">
            Señas particulares (opcional)
          </label>
          <textarea
            id="pet-markings"
            className="pc-textarea"
            placeholder="Manchas, cicatrices, collar, comportamiento…"
            value={markings}
            onChange={(e) => setMarkings(e.target.value)}
          />
        </div>

        <p className="pc-muted location-help">
          Esta información se usará para generar la alerta automática si algún día reportas a
          tu mascota como perdida.
        </p>

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}

        <div className="pc-form-actions" style={{ display: "flex", gap: 10 }}>
          <PrimaryButton onClick={() => void submit()} type="button" disabled={busy}>
            {busy ? "Guardando…" : editing ? "Guardar cambios" : "Guardar mascota"}
          </PrimaryButton>
          <button type="button" className="pc-outline-btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>

        {editing && (
          <div className="pet-form__danger">
            <button
              type="button"
              className="pet-form__delete"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={15} /> Eliminar mascota
            </button>
          </div>
        )}
      </div>

      {deleteOpen && (
        <ConfirmModal
          title="Eliminar mascota"
          confirmLabel={deleting ? "Eliminando…" : "Eliminar"}
          danger
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => void handleDelete()}
        >
          <p>
            Se eliminará <strong>{name.trim() || "esta mascota"}</strong> de tu perfil y dejarás
            de verla en tu lista de mascotas.
          </p>
          <p>Los reportes que ya publicaste se mantienen en la comunidad.</p>
        </ConfirmModal>
      )}
    </div>
  );
}
