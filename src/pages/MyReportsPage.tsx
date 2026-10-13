import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton.jsx";
import StatusTag from "../components/StatusTag.jsx";
import ChipGroup from "../components/ui/ChipGroup";
import { EmptyState, LoadingState } from "../components/ui/States";
import { myReports, updateMyReport, type MyReportRow } from "../lib/api";
import { dayLabel } from "../lib/format";
import "../styles/activity.css";

const STATUS_OPTIONS = [
  { value: "open", label: "Abierta" },
  { value: "searching", label: "Buscando" },
  { value: "resolved", label: "Resuelta" },
  { value: "closed", label: "Cerrada" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

const FINISHED = ["resolved", "closed"];
const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "done", label: "Finalizadas" },
];
const MIN_RESOLUTION = 5;

type ReportStatus = "open" | "searching" | "resolved" | "closed";

function ReportCard({ report, onSaved }: { report: MyReportRow; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<ReportStatus>(report.status as ReportStatus);
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const lost = report.type === "lost";
  const name = report.pet_name ?? (lost ? "Mascota perdida" : "Mascota encontrada");
  const photo = report.photos?.[0] ?? report.pet_photo_url ?? null;
  const finishing = FINISHED.includes(status);
  const changed = status !== report.status || resolution.trim() !== "";
  const needsResolution = finishing && !report.resolution && resolution.trim().length < MIN_RESOLUTION;

  async function save() {
    if (!changed || needsResolution || busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyReport(report.id, {
        status,
        resolution,
        postId: report.post_id,
      });
      setResolution("");
      setSaved(true);
      await onSaved();
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="my-report">
      <div className="my-report__top">
        <div className="my-report__photo">
          {photo ? (
            <img src={photo} alt={name} />
          ) : (
            <PawPrint size={26} strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>
        <div className="my-report__info">
          <StatusTag status={lost ? "Perdido" : "Encontrado"} />
          <h3 className="my-report__name">{name}</h3>
          <p className="my-report__meta">
            Publicada {dayLabel(report.created_at).toLowerCase()} ·{" "}
            <strong>{STATUS_LABEL[report.status] ?? report.status}</strong>
          </p>
        </div>
      </div>

      {report.description && <p className="my-report__description">{report.description}</p>}

      {report.resolution && (
        <p className="my-report__resolution">
          <strong>Resolución:</strong> {report.resolution}
        </p>
      )}

      <span className="pc-field-label">Estado de la alerta</span>
      <ChipGroup
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => {
          setStatus(v as ReportStatus);
          setSaved(false);
        }}
        label="Estado de la alerta"
      />

      <div className="pc-field">
        <label className="pc-field-label" htmlFor={`resolution-${report.id}`}>
          {finishing ? "¿Qué pasó? Cuéntalo en pocas palabras" : "Actualización (opcional)"}
        </label>
        <textarea
          id={`resolution-${report.id}`}
          className="pc-textarea"
          rows={3}
          placeholder={
            lost
              ? "Ej: La encontré en el parque gracias a un vecino que vio la alerta."
              : "Ej: Ya la entregué a su dueño, que la reconoció por la foto."
          }
          value={resolution}
          onChange={(e) => {
            setResolution(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      {finishing && needsResolution && (
        <p className="my-report__hint">Escribe una resolución de al menos {MIN_RESOLUTION} caracteres.</p>
      )}
      {error && (
        <p className="pc-error-text" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="my-report__saved" role="status">
          Cambios guardados.
        </p>
      )}

      <PrimaryButton onClick={() => void save()} type="button" disabled={!changed || needsResolution || busy}>
        {busy ? "Guardando…" : "Guardar cambios"}
      </PrimaryButton>
    </article>
  );
}

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      setReports(await myReports());
      setError(null);
    } catch {
      setError("No pudimos cargar tus reportes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = reports.filter((r) =>
    filter === "active"
      ? !FINISHED.includes(r.status)
      : filter === "done"
        ? FINISHED.includes(r.status)
        : true
  );

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">Mis reportes</h1>
        <span style={{ width: 42 }} />
      </div>

      <p className="activity-notice">
        Al marcar una alerta como resuelta o cerrada deja de aparecer en el mapa. Tu resolución se
        publica en la alerta para que la comunidad sepa cómo terminó.
      </p>

      <div className="activity-filters">
        <ChipGroup
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          label="Filtrar reportes"
          wrap={false}
        />
      </div>

      {loading && <LoadingState label="Cargando tus reportes…" />}
      {!loading && error && (
        <EmptyState
          icon={<PawPrint size={36} strokeWidth={1.6} />}
          title="No pudimos cargar tus reportes"
          body={error}
        />
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          icon={<PawPrint size={36} strokeWidth={1.6} />}
          title={reports.length === 0 ? "Aún no tienes reportes" : "Nada por aquí"}
          body={
            reports.length === 0
              ? "Cuando reportes una mascota perdida o encontrada, podrás gestionar su estado desde aquí."
              : `No tienes reportes ${filter === "active" ? "activos" : "finalizados"}.`
          }
        />
      )}

      {!loading && !error && (
        <div className="my-reports">
          {visible.map((r) => (
            <ReportCard key={`${r.id}-${r.status}-${r.resolution ?? ""}`} report={r} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
