import { useState } from "react";
import AppHeader from "./AppHeader.jsx";
import InfoNotice from "./InfoNotice.jsx";
import ChipGroup from "./ChipGroup.jsx";
import IconInputField from "./IconInputField.jsx";
import TextInputField from "./TextInputField.jsx";
import backIcon from "../svg/Back.svg";
import bellIcon from "../svg/bell.svg";
import vetIcon from "../svg/Adopcion/Vet.svg";
import refugeIcon from "../svg/Adopcion/Ref.svg";
import "./ReportLostPage.css";

const stroke = { stroke: "#66557E", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 19 14.5 19 8.5C19 4.91 15.87 2 12 2C8.13 2 5 4.91 5 8.5C5 14.5 12 21 12 21Z" {...stroke} />
    <circle cx="12" cy="8.5" r="2.5" {...stroke} />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="#7519FF" />
    <circle cx="12" cy="12" r="8" stroke="#7519FF" strokeWidth="2" fill="none" />
    <path d="M12 1V4M12 20V23M1 12H4M20 12H23" stroke="#7519FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#ffffff" />
    <path d="M12 7V17M7 12H17" stroke="#7519FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TYPES = [
  { id: "vet", label: "Médico veterinario", icon: vetIcon },
  { id: "refuge", label: "Refugio/ Veterinaria", icon: refugeIcon },
];
const SEX = ["Macho", "Hembra", "No sé"];
const SIZES = ["Pequeño", "Mediano", "Grande"];
const MAX_PHOTOS = 3;

function ReportAdoptionPage({ onBack, onNotifications, onSubmit }) {
  const [type, setType] = useState("vet");
  const [place, setPlace] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("Macho");
  const [size, setSize] = useState("Pequeño");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);

  const canSubmit = place.trim() !== "" && name.trim() !== "";

  const addPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file && photos.length < MAX_PHOTOS) {
      setPhotos((p) => [...p, URL.createObjectURL(file)]);
    }
    e.target.value = "";
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setPlace(`Mi ubicación actual (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`),
      () => console.log("No se pudo obtener la ubicación")
    );
  };

  return (
    <>
      <AppHeader
        title="Dar en adopción"
        leftIcon={backIcon}
        onLeft={onBack}
        rightIcon={bellIcon}
        onRight={onNotifications}
      />

      <form
        className="report-lost"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.({ type, place, name, sex, size, age, description, photos });
        }}
      >
        <InfoNotice>
          Verificamos cada solicitud. Una vez aprobada, tu cuenta mostrará la
          etiqueta correspondiente y la comunidad podrá identificarte.
        </InfoNotice>

        <div className="found__group">
          <span className="report-lost__label">Tipo de solicitud</span>
          <ChipGroup options={TYPES} value={type} onChange={setType} />
        </div>

        <div className="report-lost__place">
          <IconInputField
            label="Lugar dónde se encuentra"
            icon={<PinIcon />}
            placeholder="Ej: Parque de Usaquén"
            value={place}
            onChange={setPlace}
          />
          <button type="button" className="report-lost__locate" onClick={useMyLocation}>
            <TargetIcon />
            Usar mi ubicación actual
          </button>
        </div>

        <TextInputField label="Nombre" value={name} onChange={setName} />

        <div className="found__group">
          <span className="report-lost__label">Sexo</span>
          <ChipGroup options={SEX} value={sex} onChange={setSex} />
        </div>

        <div className="found__group">
          <span className="report-lost__label">Tamaño</span>
          <ChipGroup options={SIZES} value={size} onChange={setSize} variant="plain" />
        </div>

        <TextInputField label="Edad aproximada" value={age} onChange={setAge} />

        <label className="report-lost__field">
          <span className="report-lost__label">Características / Descripción</span>
          <textarea
            className="report-lost__textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="report-lost__field">
          <span className="report-lost__label">Fotos adicionales</span>

          <div className="report-lost__photos">
            {photos.map((src) => (
              <div key={src} className="report-lost__photo">
                <img src={src} alt="" />
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label className="report-lost__photo report-lost__photo--add">
                <PlusIcon />
                <input type="file" accept="image/*" onChange={addPhoto} hidden />
              </label>
            )}
          </div>
        </div>

        <button type="submit" className="report-lost__submit report-found__submit" disabled={!canSubmit}>
          Publicar mascota
        </button>

        <button type="button" className="report-lost__cancel" onClick={onBack}>
          Cancelar
        </button>
      </form>
    </>
  );
}

export default ReportAdoptionPage;