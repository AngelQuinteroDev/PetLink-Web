import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, Map as MapIcon, MessageCircle, PawPrint } from "lucide-react";
import PetCard from "../components/PetCard.jsx";
import ForumPost from "../components/ForumPost.jsx";
import QuickActions from "../components/QuickActions";
import Carousel from "../components/ui/Carousel";
import PetDetailModal, { type PetDetailData } from "../components/ui/PetDetailModal";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import { useUserLocation } from "../hooks/useUserLocation";
import { getFeed, reportsNear, togglePostLike } from "../lib/api";
import { hasGeoDecision } from "../lib/geo";
import { dayLabel, timeAgo } from "../lib/format";
import { verifiedRoleBadge } from "../lib/roles";
import { publisherKinds, type PublisherKind } from "../lib/publisher";
import { petToDetailData, reportToDetailData } from "../lib/petDetail";
import { supabase } from "../lib/supabase";
import type { FeedItem, GeoPoint, Pet, ReportNear } from "../lib/types";
import "../styles/pages.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportNear[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [adoption, setAdoption] = useState<Pet[]>([]);
  const [kinds, setKinds] = useState<Record<string, PublisherKind>>({});
  const [detail, setDetail] = useState<PetDetailData | null>(null);
  const unread = useUnreadNotifications();
  const { point, radius, consent, loading: locLoading, requestConsent } = useUserLocation();
  const askedRef = useRef(false);

  const load = useCallback(async (origin: GeoPoint, radiusM: number) => {
    setLoading(true);
    setError(null);
    try {
      const [near, posts, adoptionPets] = await Promise.all([
        reportsNear(origin, radiusM, 8),
        getFeed({ limit: 3 }),
        supabase
          .from("pets")
          .select("*, species:species(id, name)")
          .eq("status", "for_adoption")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(8)
          .then(({ data }) => (data as unknown as Pet[]) ?? []),
      ]);
      setReports(near);
      setFeed(posts);
      setAdoption(adoptionPets);
      setKinds(
        await publisherKinds(adoptionPets.map((p) => p.user_id)).catch(
          () => ({}) as Record<string, PublisherKind>
        )
      );
    } catch {
      setError("No pudimos cargar tu inicio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!locLoading) void load(point, radius);
  }, [locLoading, point, radius, load]);

  useEffect(() => {
    if (!locLoading && !consent && !hasGeoDecision() && !askedRef.current) {
      askedRef.current = true;
      void requestConsent();
    }
  }, [locLoading, consent, requestConsent]);

  const found = reports.filter((r) => r.type === "found");
  const lost = reports.filter((r) => r.type === "lost");

  async function handleLike(postId: string) {
    try {
      const nowLiked = await togglePostLike(postId);
      setFeed((prev) =>
        prev.map((f) =>
          f.id === postId
            ? {
                ...f,
                liked_by_me: nowLiked,
                like_count: f.like_count + (nowLiked ? 1 : -1),
              }
            : f
        )
      );
    } catch {
      /* el me gusta no es crítico */
    }
  }

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__greeting">Hola, {profile?.name ?? "amigo"}</p>
          <h1 className="pc-title home__title">Tu comunidad</h1>
        </div>
        <button
          type="button"
          className="home__bell"
          onClick={() => navigate("/notificaciones")}
          aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
        >
          <Bell size={17} />
          {unread > 0 && <span className="home__bell-badge">{unread}</span>}
        </button>
      </header>

      <QuickActions
        onLost={() => navigate("/reportar/mi-mascota")}
        onFound={() => navigate("/reportar/encontrada")}
      />

      {loading && <LoadingState label="Cargando tu comunidad…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load(point, radius)} />}

      {!loading && !error && (
        <>
          <section className="home__section">
            <div className="home__section-header">
              <h2 className="pc-section-title">Cerca de ti</h2>
              <button
                type="button"
                className="pc-pill-btn"
                onClick={() => navigate("/mapa")}
              >
                <MapIcon size={15} /> Ver todo
              </button>
            </div>
            {reports.length === 0 ? (
              <EmptyState
                title="Todo tranquilo por aquí"
                body="Cuando haya reportes cerca de tu ubicación los verás en esta sección."
              />
            ) : (
              <Carousel>
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
              </Carousel>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2 className="pc-section-title">De la comunidad</h2>
              <button
                type="button"
                className="pc-pill-btn"
                onClick={() => navigate("/comunidad")}
              >
                <MessageCircle size={15} /> Ver todo
              </button>
            </div>
            {feed.length === 0 ? (
              <EmptyState
                title="Aún no hay publicaciones"
                body="Sé la primera persona en preguntar o compartir algo con la comunidad."
              />
            ) : (
              <div className="home__feed">
                {feed.map((item) => (
                  <ForumPost
                    key={item.id}
                    userName={item.author_name}
                    avatarUrl={item.author_avatar_url ?? ""}
                    authorBadge={verifiedRoleBadge(item.author_role, item.author_vet_status) ?? ""}
                    imageUrl={item.image_url ?? ""}
                    timeAgo={timeAgo(item.created_at)}
                    category={item.type === "question" ? "Pregunta" : "Post"}
                    question={item.content}
                    likes={item.like_count}
                    replies={item.comment_count}
                    liked={item.liked_by_me}
                    onLike={() => void handleLike(item.id)}
                    onClick={() => navigate("/comunidad")}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2 className="pc-section-title">En adopción</h2>
              <button
                type="button"
                className="pc-pill-btn"
                onClick={() => navigate("/adopcion")}
              >
                <Heart size={15} /> Ver todo
              </button>
            </div>
            {adoption.length === 0 ? (
              <EmptyState
                title="Nadie en adopción por ahora"
                body="Las mascotas que busquen hogar aparecerán aquí."
              />
            ) : (
              <Carousel>
                {adoption.map((p) => (
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
              </Carousel>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2 className="pc-section-title">Mascotas encontradas</h2>
              <button
                type="button"
                className="pc-pill-btn"
                onClick={() => navigate("/encontrados")}
              >
                <PawPrint size={15} /> Ver todo
              </button>
            </div>
            {found.length === 0 ? (
              <EmptyState
                title="Aún no hay mascotas encontradas"
                body="Cuando alguien reporte una mascota encontrada cerca, aparecerá aquí."
              />
            ) : (
              <Carousel>
                {found.map((r) => (
                  <PetCard
                    key={r.id}
                    status="Encontrado"
                    name={r.pet_name ?? r.species_name ?? "Mascota"}
                    location={`${r.description || "Cerca de ti"} · ${dayLabel(r.created_at).toLowerCase()}`}
                    photoUrl={r.pet_photo_url ?? undefined}
                    onClick={() => setDetail(reportToDetailData(r))}
                  />
                ))}
              </Carousel>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2 className="pc-section-title">Mascotas perdidas</h2>
              <button
                type="button"
                className="pc-pill-btn"
                onClick={() => navigate("/perdidos")}
              >
                <PawPrint size={15} /> Ver todo
              </button>
            </div>
            {lost.length === 0 ? (
              <EmptyState
                title="Sin mascotas perdidas cerca"
                body="Si alguien reporta una mascota perdida en tu zona, la verás aquí."
              />
            ) : (
              <Carousel>
                {lost.map((r) => (
                  <PetCard
                    key={r.id}
                    status="Perdido"
                    name={r.pet_name ?? r.species_name ?? "Mascota"}
                    location={`${r.description || "Cerca de ti"} · ${dayLabel(r.created_at).toLowerCase()}`}
                    photoUrl={r.pet_photo_url ?? undefined}
                    onClick={() => setDetail(reportToDetailData(r))}
                  />
                ))}
              </Carousel>
            )}
          </section>
        </>
      )}

      <PetDetailModal data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
