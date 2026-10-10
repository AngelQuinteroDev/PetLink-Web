import PawBackground from "./PawBackground.jsx";
import useLockBodyScroll from "../../hooks/useLockBodyScroll.js";
import "./LegalModal.css";

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6L18 18" stroke="var(--titulos, #7519FF)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const DOCS = {
  terms: {
    title: "Términos de uso",
    sections: [
      {
        heading: "1. Uso de la aplicación",
        text: "PetClue es una plataforma comunitaria para reportar, buscar y ayudar a mascotas. Te comprometes a usarla de forma responsable y con información veraz.",
      },
      {
        heading: "2. Tu cuenta",
        text: "Eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada desde tu cuenta.",
      },
      {
        heading: "3. Contenido publicado",
        text: "Las publicaciones, fotos y reportes deben ser reales y respetuosos. PetClue puede retirar contenido que incumpla estas normas.",
      },
      {
        heading: "4. Verificación",
        text: "Las cuentas de veterinarios, médicos y refugios pasan por un proceso de revisión antes de mostrar su etiqueta.",
      },
    ],
  },
  privacy: {
    title: "Política de privacidad",
    sections: [
      {
        heading: "1. Datos que recopilamos",
        text: "Nombre, correo electrónico, información de tus mascotas y, si lo autorizas, tu ubicación.",
      },
      {
        heading: "2. Finalidad",
        text: "Usamos tus datos para crear tu cuenta, publicar alertas, mostrar mascotas cercanas y enviarte notificaciones que hayas activado.",
      },
      {
        heading: "3. Tus derechos",
        text: "Puedes conocer, actualizar, rectificar y solicitar la eliminación de tus datos desde Ajustes en cualquier momento.",
      },
      {
        heading: "4. Ubicación",
        text: "El acceso a tu ubicación es opcional. También puedes elegir tu ciudad manualmente.",
      },
    ],
  },
};

function LegalModal({ type, onClose }) {
  useLockBodyScroll(Boolean(type));

  const doc = DOCS[type];
  if (!doc) return null;

  return (
    <div className="legal__overlay" onClick={onClose}>
      <div className="legal__sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <PawBackground contained />

        <span className="legal__handle" />

        <div className="legal__header">
          <h2 className="legal__title">{doc.title}</h2>
          <button type="button" className="legal__close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className="legal__body">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="legal__heading">{s.heading}</h3>
              <p className="legal__text">{s.text}</p>
            </section>
          ))}
        </div>

        <button type="button" className="legal__ok" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default LegalModal;