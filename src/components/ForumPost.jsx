import { Heart } from "lucide-react";
import commentsIcon from "../assets/svg/uil_comments.svg";
import escudoIcon from "../assets/svg/Ajustes/Escudo.svg";
import "./ForumPost.css";

function ForumPost({
  userName = "Usuario",
  timeAgo = "hace 2 horas",
  category = "Pregunta",
  question = "¿Alguien sabe qué puedo darle a mi perrita, tiene mucha comezón?",
  likes = 0,
  replies = 0,
  avatarUrl = "",
  imageUrl = "",
  authorBadge = "",
  liked = false,
  onLike = () => {},
  onClick = () => {},
  onImageClick = /** @type {(() => void) | undefined} */ (undefined),
}) {
  return (
    <article className="forum-post" onClick={onClick}>

      {/* Perfil */}
      <div className="forum-post__profile">

        <div className="forum-post__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} loading="lazy" decoding="async" />
          ) : (
            <span className="forum-post__avatar-letter" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="forum-post__name-time">
          <div className="forum-post__name-row">
            <p className="forum-post__name">{userName}</p>
            {authorBadge && (
              <span className="forum-post__author-badge">
                <img src={escudoIcon} alt="" className="forum-post__author-badge-icon" />
                {authorBadge}
              </span>
            )}
          </div>
          <p className="forum-post__time">{timeAgo}</p>
        </div>

      </div>

      {/* Etiqueta de categoría */}
      <span className="forum-post__tag">
        {category}
      </span>

      {/* Pregunta */}
      <p className="forum-post__question">
        {question}
      </p>

      {/* Imagen de la publicación: dentro de la tarjeta (diseño del Fix) */}
      {imageUrl && (
        <img
          className={`forum-post__image ${onImageClick ? "forum-post__image--zoom" : ""}`}
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onClick={
            onImageClick
              ? (e) => {
                  e.stopPropagation();
                  onImageClick();
                }
              : undefined
          }
        />
      )}

      {/* Interacciones */}
      <div className="forum-post__interactions">

        <button
          type="button"
          className={`forum-post__likes ${liked ? "forum-post__likes--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          aria-pressed={liked}
        >
          <Heart
            size={16}
            className="forum-post__icon"
            fill={liked ? "#e0447c" : "none"}
          />
          <span className="forum-post__count">{likes}</span>
        </button>

        <div className="forum-post__comments">
          <img
            src={commentsIcon}
            alt="Respuestas"
            className="forum-post__icon"
          />
          <span className="forum-post__count">
            {replies} respuestas
          </span>
        </div>

      </div>

    </article>
  );
}

export default ForumPost;