import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Clock, FileUp, ShieldCheck } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton.jsx";
import ChipGroup from "../components/ui/ChipGroup";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { myVetApplication, submitVetApplication, uploadVetDocument } from "../lib/api";
import { timeAgo } from "../lib/format";
import type { VetApplication } from "../lib/types";
import "../styles/pages.css";

type ProRole = "vet" | "foundation";

const ROLE_OPTIONS: { value: ProRole; label: string }[] = [
  { value: "vet", label: "Médico veterinario" },
  { value: "foundation", label: "Establecimiento" },
];

const MAX_DOC_MB = 10;

function translateApplyError(message: string): string {
  if (message.includes("pending application")) return "Ya tienes una solicitud en revisión.";
  if (message.includes("professional role")) return "Tu cuenta ya tiene un rol profesional.";
  return "No pudimos enviar tu solicitud. Intenta de nuevo.";
}

export default function VetApplicationPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [app, setApp] = useState<VetApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<ProRole>("vet");
  const [fullName, setFullName] = useState(profile?.name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [license, setLicense] = useState("");
  const [degree, setDegree] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApp(await myVetApplication());
    } catch {
      setError("No pudimos consultar tu solicitud.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isProfessional = profile?.role === "vet" || profile?.role === "foundation";
  const isVet = role === "vet";

  async function submit() {
    if (fullName.trim().length < 3) {
      setError(isVet ? "Escribe tu nombre completo." : "Escribe el nombre de la organización.");
      return;
    }
    if (!/.+@.+\..+/.test(contactEmail.trim())) {
      setError("Escribe un correo de contacto válido.");
      return;
    }
    if (license.trim().length < 3) {
      setError(
        isVet
          ? "Escribe tu número de tarjeta profesional."
          : "Escribe el número de registro de la organización."
      );
      return;
    }
    if (!licenseFile) {
      setError(
        isVet
          ? "Adjunta tu tarjeta profesional (PDF o imagen)."
          : "Adjunta el documento de registro (PDF o imagen)."
      );
      return;
    }
    if (!idFile) {
      setError("Adjunta tu documento de identidad (PDF o imagen).");
      return;
    }
    if (
      licenseFile.size > MAX_DOC_MB * 1024 * 1024 ||
      idFile.size > MAX_DOC_MB * 1024 * 1024
    ) {
      setError(`Cada documento no puede superar los ${MAX_DOC_MB} MB.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const licensePath = await uploadVetDocument(licenseFile);
      const idPath = await uploadVetDocument(idFile);
      await submitVetApplication(role, {
        documentPath: licensePath,
        idDocumentPath: idPath,
        fullName: fullName.trim(),
        contactEmail: contactEmail.trim(),
        professionalLicense: license.trim(),
        degree: degree.trim() || null,
        specialty: specialty.trim() || null,
      });
      setSent(true);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(translateApplyError(message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">Solicitar verificación</h1>
        <span style={{ width: 42 }} />
      </div>

      {loading && <LoadingState label="Consultando tu solicitud…" />}
      {!loading && error && !app && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && isProfessional && (
        <EmptyState
          icon={<BadgeCheck size={40} strokeWidth={1.6} />}
          title="Ya eres parte del equipo profesional"
          body="Tu cuenta está verificada. Crea o administra la página de tu clínica o refugio."
          action={
            <PrimaryButton onClick={() => navigate("/mi-clinica")} type="button">
              Ir a Mi clínica
            </PrimaryButton>
          }
        />
      )}

      {!loading && !isProfessional && app?.status === "pending" && (
        <div className="pc-form-card">
          <div className="pro-status">
            <span className="pro-status__icon">
              <Clock size={20} />
            </span>
            <div>
              <p className="pro-status__title">Solicitud en revisión</p>
              <p className="pc-muted pro-status__meta">
                {app.target_role === "foundation" ? "Establecimiento" : "Médico veterinario"} ·{" "}
                enviada {timeAgo(app.created_at)}
              </p>
            </div>
          </div>
          <p className="pc-muted pro-hint">
            El equipo de PetClue revisará tus documentos. Te avisaremos cuando esté aprobada; si es
            rechazada podrás volver a intentarlo.
          </p>
        </div>
      )}

      {!loading && !isProfessional && app?.status !== "pending" && (
        <div className="pc-form-card">
          {sent && (
            <p className="auth-page__notice" role="status">
              ¡Solicitud enviada! La revisaremos y te avisaremos.
            </p>
          )}
          {app?.status === "rejected" && !sent && (
            <p className="pc-muted pro-hint" style={{ marginTop: 0 }}>
              Tu solicitud anterior fue rechazada el{" "}
              {new Date(app.created_at).toLocaleDateString("es-CO")}. Puedes intentarlo de nuevo
              con documentos válidos.
            </p>
          )}

          <div className="pc-field">
            <span className="pc-field-label">¿Qué quieres verificar?</span>
            <ChipGroup options={ROLE_OPTIONS} value={role} onChange={setRole} label="Tipo de perfil" />
            {!isVet && (
              <p className="pc-muted pro-hint" style={{ marginTop: 8 }}>
                Un administrador revisará tu solicitud y definirá si tu establecimiento es un
                <strong> refugio</strong> o una <strong>veterinaria</strong>; al aprobarla
                aparecerás en el mapa.
              </p>
            )}
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-name">
              {isVet ? "Nombre completo" : "Nombre de la organización"}
            </label>
            <input
              id="vet-name"
              className="pc-input"
              placeholder={isVet ? "Ej: Ángel Gabriel Quintero" : "Ej: Fundación Huellitas"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-email">
              Correo de contacto
            </label>
            <input
              id="vet-email"
              className="pc-input"
              type="email"
              placeholder="nombre@correo.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-license">
              {isVet ? "Número de tarjeta profesional" : "Número de registro (NIT o similar)"}
            </label>
            <input
              id="vet-license"
              className="pc-input"
              placeholder={isVet ? "Ej: 0000" : "Ej: 900.123.456-7"}
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-degree">
              {isVet ? "Título y universidad" : "Dirección del establecimiento"}
            </label>
            <input
              id="vet-degree"
              className="pc-input"
              placeholder={
                isVet ? "Médico veterinario · Universidad Nacional" : "Ej: Cra 7 # 45-12, Bogotá"
              }
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-specialty">
              Especialidad (opcional)
            </label>
            <input
              id="vet-specialty"
              className="pc-input"
              placeholder="Ej: Cardiología"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-doc">
              {isVet ? "Tarjeta profesional" : "Documento de registro"}
            </label>
            <input
              id="vet-doc"
              className="pc-input"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="pc-field">
            <label className="pc-field-label" htmlFor="vet-id-doc">
              Documento de identidad
            </label>
            <input
              id="vet-id-doc"
              className="pc-input"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <p className="pc-muted pro-hint">
            Los documentos quedan en un archivo privado: solo los verá el equipo de moderación.
          </p>

          {error && (
            <p className="pc-error-text" role="alert">
              {error}
            </p>
          )}

          <div className="pc-form-actions">
            <PrimaryButton onClick={() => void submit()} type="button" disabled={busy}>
              <FileUp size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              {busy ? "Enviando…" : "Enviar solicitud"}
            </PrimaryButton>
          </div>

          <p className="pc-muted pro-hint">
            <ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> Al aprobarse, tu perfil
            pasa a veterinario o fundación y podrás publicar tu clínica o refugio.
          </p>
        </div>
      )}
    </div>
  );
}
