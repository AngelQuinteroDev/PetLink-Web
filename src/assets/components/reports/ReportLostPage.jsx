import { useState } from "react";
import AppHeader from "../shared/AppHeader.jsx";
import InfoNotice from "../shared/InfoNotice.jsx";
import IconInputField from "../shared/IconInputField.jsx";
import PetPicker from "../pets/PetPicker.jsx";
import backIcon from "../../svg/Back.svg";
import bellIcon from "../../svg/bell.svg";
import "./ReportLostPage.css";

const stroke = { stroke: "#66557E", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="16" rx="2" {...stroke} />
    <path d="M3 10H21M8 3V7M16 3V7" {...stroke} />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" {...stroke} />
    <path d="M12 7V12L15 14" {...stroke} />
  </svg>
);

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

const MAX_EXTRA_PHOTOS = 3;

function ReportLostPage({ pets = [], onBack, onNotifications, onNotListed, onSubmit }) {
  const [petId, setPetId] = useState(pets[0]?.id ?? null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [traits, setTraits] = useState("");
  const [photos, setPhotos] = useState([]);

  const selectedPet = pets.find((p) => p.id === petId);
  const canSubmit = petId !== null && place.trim() !== "";

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setPlace(`Mi ubicación actual (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`),
      () => console.log("No se pudo obtener la ubicación")
    );
  };

  const addPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file && photos.length < MAX_EXTRA_PHOTOS) {
      setPhotos((p) => [...p, URL.createObjectURL(file)]);
    }
    e.target.value = "";
  };

  return (
    <>
      <AppHeader
        title="Reportar mascota"
        leftIcon={backIcon}
        onLeft={onBack}
        rightIcon={bellIcon}
        onRight={onNotifications}
      />

      <form
        className="report-lost"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.({ petId, date, time, place, traits, photos });
        }}
      >
        <InfoNotice>
          Publicaremos una alerta a los usuarios cerca de la ubicación que indiques.
        </InfoNotice>

        <h2 className="report-lost__label">¿Cuál de tus mascotas se perdió?</h2>
        <PetPicker pets={pets} value={petId} onChange={setPetId} onNotListed={onNotListed} />

        <div className="report-lost__row">
          <IconInputField label="Fecha" icon={<CalendarIcon />} type="date" value={date} onChange={setDate} />
          <IconInputField label="Hora aprox" icon={<ClockIcon />} type="time" value={time} onChange={setTime} />
        </div>

        <div className="report-lost__place">
          <IconInputField
            label="Lugar dónde se perdió"
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

        <label className="report-lost__field">
          <span className="report-lost__label">Características al momento de perderse</span>
          <textarea
            className="report-lost__textarea"
            rows={4}
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
          />
        </label>

        <div className="report-lost__field">
          <span className="report-lost__label">Fotos adicionales</span>

          <div className="report-lost__photos">
            <div className="report-lost__photo">
              {selectedPet?.photoUrl && <img src={selectedPet.photoUrl} alt={selectedPet.name} />}
            </div>

            {photos.map((src) => (
              <div key={src} className="report-lost__photo">
                <img src={src} alt="" />
              </div>
            ))}

            {photos.length < MAX_EXTRA_PHOTOS && (
              <label className="report-lost__photo report-lost__photo--add">
                <PlusIcon />
                <input type="file" accept="image/*" onChange={addPhoto} hidden />
              </label>
            )}
          </div>

          <p className="report-lost__hint">
            La primera foto ya es la de {selectedPet?.name ?? "tu mascota"} registrada. Puedes
            agregar hasta {MAX_EXTRA_PHOTOS} más recientes.
          </p>
        </div>

        <button type="submit" className="report-lost__submit" disabled={!canSubmit}>
          Publicar alerta
        </button>

        <button type="button" className="report-lost__cancel" onClick={onBack}>
          Cancelar
        </button>
      </form>
    </>
  );
}

export default ReportLostPage;