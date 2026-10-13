import type { ReactNode } from "react";
import "./Carousel.css";

/** Fila deslizable de tarjetas (estilo de la app): scroll horizontal con snap. */
export default function Carousel({ children }: { children: ReactNode }) {
  return <div className="carousel">{children}</div>;
}
