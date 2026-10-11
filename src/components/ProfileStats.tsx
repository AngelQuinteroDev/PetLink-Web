import { Fragment } from "react";
import "./ProfileStats.css";

type Props = {
  pets: number;
  posts: number;
  activeReports: number;
};

export default function ProfileStats({ pets, posts, activeReports }: Props) {
  const items = [
    { value: pets, label: "Mascotas" },
    { value: posts, label: "Publicaciones" },
    { value: activeReports, label: "Reportes activos" },
  ];

  return (
    <article className="profile-stats">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <span className="profile-stats__divider" />}
          <div className="profile-stats__item">
            <p className="profile-stats__value">{item.value}</p>
            <p className="profile-stats__label">{item.label}</p>
          </div>
        </Fragment>
      ))}
    </article>
  );
}
