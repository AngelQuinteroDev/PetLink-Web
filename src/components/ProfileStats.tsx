import { Fragment } from "react";
import "./ProfileStats.css";

type Props = {
  pets: number;
  posts: number;
  activeReports: number;
  /** Al tocar un contador, lleva directo a donde se guardan */
  onPets?: () => void;
  onPosts?: () => void;
  onReports?: () => void;
};

export default function ProfileStats({
  pets,
  posts,
  activeReports,
  onPets,
  onPosts,
  onReports,
}: Props) {
  const items = [
    { value: pets, label: "Mascotas", onClick: onPets, aria: "Ir a mis mascotas" },
    { value: posts, label: "Publicaciones", onClick: onPosts, aria: "Ir a mis publicaciones" },
    {
      value: activeReports,
      label: "Reportes activos",
      onClick: onReports,
      aria: "Ir a mis reportes",
    },
  ];

  return (
    <article className="profile-stats">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <span className="profile-stats__divider" />}
          {item.onClick ? (
            <button
              type="button"
              className="profile-stats__item profile-stats__item--link"
              onClick={item.onClick}
              aria-label={item.aria}
            >
              <p className="profile-stats__value">{item.value}</p>
              <p className="profile-stats__label">{item.label}</p>
            </button>
          ) : (
            <div className="profile-stats__item">
              <p className="profile-stats__value">{item.value}</p>
              <p className="profile-stats__label">{item.label}</p>
            </div>
          )}
        </Fragment>
      ))}
    </article>
  );
}
