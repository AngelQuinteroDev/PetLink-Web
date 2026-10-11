import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PetCard from "../components/PetCard.jsx";
import PetDetailModal, { type PetDetailData } from "../components/ui/PetDetailModal";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useUserLocation } from "../hooks/useUserLocation";
import { reportsNear } from "../lib/api";
import { dayLabel } from "../lib/format";
import { petToDetailData, reportToDetailData } from "../lib/petDetail";
import { supabase } from "../lib/supabase";
import type { Pet, ReportNear } from "../lib/types";
import "../styles/pages.css";

type Mode = "adoption" | "found";

const TITLES: Record<Mode, string> = {
  adoption: "En adopción",
  found: "Encontrados",
};

export default function PetListPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reports, setReports] = useState<ReportNear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PetDetailData | null>(null);
  const { point, loading: locLoading } = useUserLocation();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "adoption") {
        const { data, error: qError } = await supabase
          .from("pets")
          .select("*, species:species(id, name)")
          .eq("status", "for_adoption")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(60);
        if (qError) throw qError;
        setPets((data as unknown as Pet[]) ?? []);
      } else {
        // "Ver todo": radio amplio (máx. del RPC) para no limitar a la alerta personal
        const near = await reportsNear(point, 50000, 200);
        setReports(near.filter((r) => r.type === "found"));
      }
    } catch {
      setError("No pudimos cargar la lista.");
    } finally {
      setLoading(false);
    }
  }, [mode, point]);

  useEffect(() => {
    if (!locLoading) void load();
  }, [locLoading, load]);

  return (
    <div>
      <div className="pc-page-header">
        <button
          type="button"
          className="pc-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          ‹
        </button>
        <h1 className="pc-title">{TITLES[mode]}</h1>
        <span style={{ width: 42 }} />
      </div>

      {loading && <LoadingState label="Cargando…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && mode === "adoption" &&
        (pets.length === 0 ? (
          <EmptyState
            title="Nadie en adopción por ahora"
            body="Las mascotas que busquen hogar aparecerán aquí."
          />
        ) : (
          <div className="pc-cards-grid">
            {pets.map((p) => (
              <PetCard
                key={p.id}
                status={p.species?.name ?? "Mascota"}
                name={p.name}
                location={`${p.breed || p.species?.name || "Mascota"} · ${dayLabel(p.created_at).toLowerCase()}`}
                photoUrl={p.photo_url ?? undefined}
                onClick={() => setDetail(petToDetailData(p))}
              />
            ))}
          </div>
        ))}

      {!loading && !error && mode === "found" &&
        (reports.length === 0 ? (
          <EmptyState
            title="Sin mascotas encontradas cerca"
            body="Cuando alguien reporte una mascota encontrada en tu zona, aparecerá aquí."
          />
        ) : (
          <div className="pc-cards-grid">
            {reports.map((r) => (
              <PetCard
                key={r.id}
                status="Encontrado"
                name={r.pet_name ?? r.species_name ?? "Mascota"}
                location={`${r.description || "Cerca de ti"} · ${dayLabel(r.created_at).toLowerCase()}`}
                photoUrl={r.pet_photo_url ?? undefined}
                onClick={() => setDetail(reportToDetailData(r))}
              />
            ))}
          </div>
        ))}

      <PetDetailModal data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
