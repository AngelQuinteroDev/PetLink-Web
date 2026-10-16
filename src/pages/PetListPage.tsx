import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PetCard from "../components/PetCard.jsx";
import PetDetailModal, { type PetDetailData } from "../components/ui/PetDetailModal";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useUserLocation } from "../hooks/useUserLocation";
import { reportsNear } from "../lib/api";
import { dayLabel } from "../lib/format";
import { publisherKinds, type PublisherKind } from "../lib/publisher";
import { petToDetailData, reportToDetailData } from "../lib/petDetail";
import { supabase } from "../lib/supabase";
import type { Pet, ReportNear } from "../lib/types";
import "../styles/pages.css";

type Mode = "adoption" | "found" | "lost";

const TITLES: Record<Mode, string> = {
  adoption: "En adopción",
  found: "Mascotas encontradas",
  lost: "Mascotas perdidas",
};

const EMPTY_TEXTS: Record<"found" | "lost", { title: string; body: string }> = {
  found: {
    title: "Sin mascotas encontradas cerca",
    body: "Cuando alguien reporte una mascota encontrada en tu zona, aparecerá aquí.",
  },
  lost: {
    title: "Sin mascotas perdidas cerca",
    body: "Cuando alguien reporte una mascota perdida en tu zona, aparecerá aquí.",
  },
};

export default function PetListPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [kinds, setKinds] = useState<Record<string, PublisherKind>>({});
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
        const rows = (data as unknown as Pet[]) ?? [];
        setPets(rows);
        setKinds(
          await publisherKinds(rows.map((p) => p.user_id)).catch(
            () => ({}) as Record<string, PublisherKind>
          )
        );
      } else {
        // "Ver todo": radio amplio (máx. del RPC) para no limitar a la alerta personal
        const near = await reportsNear(point, 50000, 200);
        setReports(near.filter((r) => r.type === mode));
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
                publisherKind={kinds[p.user_id] ?? null}
                onClick={() => setDetail(petToDetailData(p))}
              />
            ))}
          </div>
        ))}

      {!loading && !error && (mode === "found" || mode === "lost") &&
        (reports.length === 0 ? (
          <EmptyState title={EMPTY_TEXTS[mode].title} body={EMPTY_TEXTS[mode].body} />
        ) : (
          <div className="pc-cards-grid">
            {reports.map((r) => (
              <PetCard
                key={r.id}
                status={r.type === "lost" ? "Perdido" : "Encontrado"}
                name={r.pet_name ?? r.species_name ?? "Mascota"}
                location={`${r.description || "Cerca de ti"} · ${dayLabel(r.created_at).toLowerCase()}`}
                photoUrl={r.pet_photo_url ?? undefined}
                onClick={() => setDetail(reportToDetailData(r))}
              />
            ))}
          </div>
        ))}

      <PetDetailModal data={detail} onClose={() => setDetail(null)} onDeleted={() => void load()} />
    </div>
  );
}
