import { useState } from "react";
import AppHeader from "./AppHeader.jsx";
import ChipGroup from "./ChipGroup.jsx";
import TextInputField from "./TextInputField.jsx";
import PhotoPickerModal from "./PhotoPickerModal.jsx";
import AvatarPlaceholder from "./AvatarPlaceholder.jsx";
import backIcon from "../svg/Back.svg";
import bellIcon from "../svg/bell.svg";
import editIcon from "../svg/edit_icono.svg";
import dogIcon from "../svg/Inscribir/perro.svg";
import catIcon from "../svg/Inscribir/gato.svg";
import "./AddPetPage.css";

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 20.5C12 20.5 3 15.5 3 9C3 6 5.5 4 8 4C10 4 11.3 5.2 12 6.3C12.7 5.2 14 4 16 4C18.5 4 21 6 21 9C21 15.5 12 20.5 12 20.5Z"
      stroke="#7519FF"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const SPECIES = [
  { id: "Perro", label: "Perro", icon: dogIcon },
  { id: "Gato", label: "Gato", icon: catIcon },
  { id: "Otro", label: "Otro", icon: <HeartIcon /> },
];
const SEX = ["Macho", "Hembra"];
const SIZES = ["Pequeño", "Mediano", "Grande"];

function AddPetPage({ onBack, onNotifications, onSave }) {
  const [photo, setPhoto] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    species: "Perro",
    name: "",
    breed: "",
    age: "",
    sex: "Macho",
    size: "Pequeño",
    color: "",
    marks: "",
  });

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <AppHeader
        title="Inscribir mascota"
        leftIcon={backIcon}
        onLeft={onBack}
        rightIcon={bellIcon}
        onRight={onNotifications}
      />

      <form
        className="add-pet"
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.({ ...form, photoUrl: photo });
        }}
      >
        <div className="add-pet__photo-block">
          <div className="add-pet__photo">
            <div className="add-pet__photo-circle">
              {photo ? <img src={photo} alt="" /> : <AvatarPlaceholder />}
            </div>
            <button
              type="button"
              className="add-pet__photo-edit"
              aria-label="Agregar foto"
              onClick={() => setPickerOpen(true)}
            >
              <img src={editIcon} alt="" />
            </button>
          </div>
          <p className="add-pet__photo-hint">Agrega una foto clara de tu mascota</p>
        </div>

        <div className="add-pet__group">
          <span className="add-pet__label">Especie</span>
          <ChipGroup options={SPECIES} value={form.species} onChange={update("species")} />
        </div>

        <TextInputField label="Nombre" value={form.name} onChange={update("name")} />
        <TextInputField label="Raza" optional value={form.breed} onChange={update("breed")} />
        <TextInputField label="Edad" value={form.age} onChange={update("age")} />

        <div className="add-pet__group">
          <span className="add-pet__label">Sexo</span>
          <ChipGroup options={SEX} value={form.sex} onChange={update("sex")} />
        </div>

        <div className="add-pet__group">
          <span className="add-pet__label">Tamaño</span>
          <ChipGroup options={SIZES} value={form.size} onChange={update("size")} variant="plain" />
        </div>

        <TextInputField label="Color" value={form.color} onChange={update("color")} />
        <TextInputField label="Señas particulares" optional value={form.marks} onChange={update("marks")} />

        <div className="add-pet__notice">
          <span className="add-pet__notice-icon" aria-hidden="true">!</span>
          <p>
            Esta información se usará para generar la alerta automática si algún
            día reportas a tu mascota como perdida.
          </p>
        </div>

        <button type="submit" className="add-pet__save">Guardar mascota</button>

        <button type="button" className="add-pet__cancel" onClick={onBack}>
          Cancelar
        </button>
      </form>

      <PhotoPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onFile={(file) => setPhoto(URL.createObjectURL(file))}
      />
    </>
  );
}

export default AddPetPage;