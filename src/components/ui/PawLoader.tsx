import "./PawLoader.css";

type Props = {
  size?: number;
  className?: string;
};

// Frame 52.svg: sprite horizontal de 4 frames (294x47 → cada frame 73.5x47)
const RATIO = 47 / 73.5;

export default function PawLoader({ size = 56, className = "" }: Props) {
  return (
    <span
      className={`paw-loader ${className}`}
      style={{ width: size, height: Math.round(size * RATIO) }}
      aria-hidden="true"
    />
  );
}
