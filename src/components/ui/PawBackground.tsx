import "./PawBackground.css";

// top/left en %, size en px, rot en grados (mismo patrón que la app móvil)
const PAWS = [
  { top: 6, left: 4, size: 34, rot: -20 },
  { top: 12, left: 82, size: 40, rot: 25 },
  { top: 27, left: 60, size: 30, rot: -35 },
  { top: 36, left: 6, size: 28, rot: 15 },
  { top: 48, left: 88, size: 36, rot: -15 },
  { top: 58, left: 30, size: 26, rot: 40 },
  { top: 68, left: 74, size: 32, rot: -30 },
  { top: 78, left: 4, size: 38, rot: 20 },
  { top: 86, left: 50, size: 28, rot: -10 },
  { top: 93, left: 86, size: 30, rot: 35 },
];

export default function PawBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div className={`paw-bg ${contained ? "paw-bg--contained" : ""}`} aria-hidden="true">
      {PAWS.map((p, i) => (
        <span
          key={i}
          className="paw-bg__paw"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.8,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
