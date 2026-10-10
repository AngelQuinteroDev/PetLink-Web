import { useEffect } from "react";

// Bloquea el scroll de la página mientras `locked` sea true
export default function useLockBodyScroll(locked = true) {
  useEffect(() => {
    if (!locked) return;

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    // Evita el salto de ancho cuando desaparece la barra de scroll
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}