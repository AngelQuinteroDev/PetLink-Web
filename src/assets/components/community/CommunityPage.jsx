import { useState } from "react";
import AppHeader from "../shared/AppHeader.jsx";
import ShareBar from "./ShareBar.jsx";
import MapFilterTabs from "../map/MapFilterTabs.jsx";
import ForumPost from "./ForumPost.jsx";
import backIcon from "../../svg/Back.svg";
import bellIcon from "../../svg/bell.svg";
import "./CommunityPage.css";

const FILTERS = ["Todo", "Preguntas", "Consejos", "Historias"];

// Filtro de la franja -> categoría del post
const CATEGORY_BY_FILTER = {
  Preguntas: "Pregunta",
  Consejos: "Consejo",
  Historias: "Historia",
};

const SAMPLE_POSTS = [
  {
    id: 1,
    userName: "Usuario",
    timeAgo: "hace 2 horas",
    category: "Pregunta",
    text: "¿Alguien sabe qué puedo darle a mi perrita, tiene mucha comezón?",
    likes: 12,
    replies: 8,
  },
  {
    id: 2,
    userName: "Usuario",
    timeAgo: "hace 2 horas",
    category: "Consejo",
    text: "No le den chocolate a sus perros, es malo para el corazón",
    likes: 12,
    replies: 8,
  },
];

function CommunityPage({
  posts = SAMPLE_POSTS,
  onBack,
  onNotifications,
  onShare,
  onPostClick,
}) {
  const [filter, setFilter] = useState("Todo");

  const visible =
    filter === "Todo"
      ? posts
      : posts.filter((p) => p.category === CATEGORY_BY_FILTER[filter]);

  return (
    <>
      <AppHeader
        title="Comunidad"
        leftIcon={backIcon}
        onLeft={onBack}
        rightIcon={bellIcon}
        onRight={onNotifications}
      />

      <div className="community">
        <ShareBar onClick={onShare} />

        <MapFilterTabs filters={FILTERS} onChange={setFilter} />

        <div className="community__list">
          {visible.length === 0 && (
            <p className="community__empty">Aún no hay publicaciones aquí.</p>
          )}

          {visible.map((post) => (
            <ForumPost
              key={post.id}
              userName={post.userName}
              timeAgo={post.timeAgo}
              category={post.category}
              question={post.text}
              likes={post.likes}
              replies={post.replies}
              avatarUrl={post.avatarUrl}
              onClick={() => onPostClick?.(post)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default CommunityPage;