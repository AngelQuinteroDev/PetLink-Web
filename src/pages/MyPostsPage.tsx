import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { EmptyState, LoadingState } from "../components/ui/States";
import { myPosts, type MyPostRow } from "../lib/api";
import { dayLabel } from "../lib/format";
import "../styles/activity.css";

const TYPE_LABELS: Record<string, string> = {
  question: "Pregunta",
  tip: "Consejo",
  story: "Historia",
  found: "Encontrada",
  alert: "Alerta",
  post: "Post",
  meme: "Meme",
  experience: "Experiencia",
};

const MODERATION: Record<string, { label: string; className: string }> = {
  published: { label: "Publicada", className: "my-post__status--published" },
  under_review: { label: "En revisión", className: "my-post__status--review" },
  rejected: { label: "Rechazada", className: "my-post__status--rejected" },
};

export default function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<MyPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setPosts(await myPosts());
      setError(null);
    } catch {
      setError("No pudimos cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">Mis publicaciones</h1>
        <span style={{ width: 42 }} />
      </div>

      <p className="activity-notice">
        Aquí ves todas tus publicaciones de la comunidad y su estado. Las publicaciones nuevas pasan
        por revisión de un administrador antes de aparecer para todos.
      </p>

      {loading && <LoadingState label="Cargando tus publicaciones…" />}

      {!loading && error && (
        <EmptyState
          icon={<MessageCircle size={36} strokeWidth={1.6} />}
          title="No pudimos cargar tus publicaciones"
          body={error}
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon={<MessageCircle size={36} strokeWidth={1.6} />}
          title="Aún no tienes publicaciones"
          body="Comparte una pregunta o experiencia en la comunidad y aparecerá aquí."
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="my-posts">
          {posts.map((p) => {
            const moderation = MODERATION[p.moderation_status] ?? {
              label: p.moderation_status,
              className: "",
            };
            return (
              <article key={p.id} className="my-post">
                <div className="my-post__top">
                  {p.image_url ? (
                    <img className="my-post__thumb" src={p.image_url} alt="" loading="lazy" />
                  ) : (
                    <span className="my-post__thumb my-post__thumb--empty" aria-hidden="true">
                      <MessageCircle size={20} />
                    </span>
                  )}
                  <div className="my-post__info">
                    <span className="pc-badge pc-badge--question">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </span>
                    <p className="my-post__content">{p.content || "Sin texto"}</p>
                    <p className="my-post__meta">
                      {dayLabel(p.created_at).toLowerCase()} ·{" "}
                      <span className={`my-post__status ${moderation.className}`}>
                        {moderation.label}
                      </span>
                    </p>
                  </div>
                </div>

                {p.moderation_status === "published" && (
                  <button
                    type="button"
                    className="my-post__open"
                    onClick={() => navigate(`/comunidad?post=${p.id}`)}
                  >
                    Ver en la comunidad
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
