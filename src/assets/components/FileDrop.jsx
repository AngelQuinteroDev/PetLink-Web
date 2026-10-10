import { useRef } from "react";
import uploadIcon from "../svg/Verificacion/subir.svg";
import "./FileDrop.css";

function FileDrop({ label, file, onChange, accept = "image/*,application/pdf" }) {
  const inputRef = useRef(null);

  return (
    <div className="file-drop-field">
      <span className="file-drop-field__label">{label}</span>

      <button type="button" className="file-drop" onClick={() => inputRef.current?.click()}>
        <span className="file-drop__icon">
          <img src={uploadIcon} alt="" />
        </span>

        <span className="file-drop__text">
          <span className="file-drop__title">{file ? file.name : "Adjuntar archivo"}</span>
          <span className="file-drop__hint">PDF o imagen</span>
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
        />
      </button>
    </div>
  );
}

export default FileDrop;