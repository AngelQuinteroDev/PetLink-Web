import { Heart } from "lucide-react";
import commentsIcon from "../assets/svg/uil_comments.svg";
import "./ForumPost.css";

function ForumPost({
  userName = "Usuario",
  timeAgo = "hace 2 horas",
  category = "Pregunta",
  question = "¿Alguien sabe qué puedo darle a mi perrita, tiene mucha comezón?",
  likes = 0,
  replies = 0,
  avatarUrl = "",
  liked = false,
  onLike = () => {},
  onClick = () => {},
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
          <p className="forum-post__name">{userName}</p>
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