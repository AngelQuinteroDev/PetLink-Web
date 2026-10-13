import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import PawBackground from "./PawBackground";
import "./PhotoCropModal.css";

// Forma de la foto en la ficha expandida (PetDetailModal). Las tarjetas usan casi la misma.
const CARD_PHOTO_ASPECT = 393 / 215;
const OUTPUT_WIDTH = 1080; // ancho de la foto que se sube
const MAX_ZOOM = 3;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Flecha circular (girar a la derecha; `flip` = a la izquierda) */
function RotateIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  file: File | null;
  aspect?: number;
  onDone: (file: File) => void;
  onCancel: () => void;
};

/**
 * "Ajusta la foto": antes de subirla, el usuario mueve (arrastrando), acerca (barra)
 * y gira (90°) la imagen dentro de un marco con la forma de la foto de la ficha.
 * Se sube YA recortada, así que en las tarjetas y en la ficha se ve exactamente
 * esa parte (homologado de la app).
 */
export default function PhotoCropModal({ file, aspect = CARD_PHOTO_ASPECT, onDone, onCancel }: Props) {
  useLockBodyScroll(Boolean(file));
  const fileSrc = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  // Foto girada (se genera con un canvas); va ligada a su archivo para no mezclarla con la siguiente
  const [rotated, setRotated] = useState<{ file: File; url: string } | null>(null);
  const src = rotated?.file === file ? rotated.url : fileSrc;
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // esquina de la imagen dentro del marco (px)
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ startX: number; startY: number; from: { x: number; y: number } } | null>(null);

  // Marco: el ancho de la pantalla (con márgenes), hasta 360 px
  const frameW = Math.min((typeof window !== "undefined" ? window.innerWidth : 393) - 48, 360);
  const frameH = Math.round(frameW / aspect);

  useEffect(() => () => (fileSrc ? URL.revokeObjectURL(fileSrc) : undefined), [fileSrc]);
  useEffect(() => () => (rotated ? URL.revokeObjectURL(rotated.url) : undefined), [rotated]);

  useEffect(() => {
    if (!file) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, onCancel]);

  if (!file) return null;

  const chosenFile = file; // const: conserva el narrow dentro de los closures async

  const cover = natural ? Math.max(frameW / natural.w, frameH / natural.h) : 1;
  const scale = cover * zoom;
  const imgW = natural ? natural.w * scale : frameW;
  const imgH = natural ? natural.h * scale : frameH;

  // La imagen siempre cubre el marco: no se puede dejar un borde vacío
  const fit = (p: { x: number; y: number }, w = imgW, h = imgH) => ({
    x: clamp(p.x, frameW - w, 0),
    y: clamp(p.y, frameH - h, 0),
  });

  function onLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const n = { w: img.naturalWidth, h: img.naturalHeight };
    const s = Math.max(frameW / n.w, frameH / n.h);
    setNatural(n);
    setZoom(1);
    setPos({ x: (frameW - n.w * s) / 2, y: (frameH - n.h * s) / 2 }); // centrada
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, from: pos };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const { startX, startY, from } = drag.current;
    setPos(fit({ x: from.x + e.clientX - startX, y: from.y + e.clientY - startY }));
  }

  function onPointerUp() {
    drag.current = null;
  }

  // Acercar manteniendo el centro del marco en el mismo punto de la foto
  function changeZoom(next: number) {
    if (!natural) return;
    const z = clamp(next, 1, MAX_ZOOM);
    const cx = (frameW / 2 - pos.x) / scale;
    const cy = (frameH / 2 - pos.y) / scale;
    const s = cover * z;
    setZoom(z);
    setPos(fit({ x: frameW / 2 - cx * s, y: frameH / 2 - cy * s }, natural.w * s, natural.h * s));
  }

  // Girar 90° (dir = 1 derecha, -1 izquierda): se dibuja la foto rotada y se vuelve a encuadrar centrada
  async function rotate(dir: 1 | -1) {
    const img = imgRef.current;
    if (!natural || busy || !img) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = natural.h;
      canvas.height = natural.w;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((dir * Math.PI) / 2);
      ctx.drawImage(img, -natural.w / 2, -natural.h / 2);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (blob) setRotated({ file: chosenFile, url: URL.createObjectURL(blob) });
    } catch (err) {
      console.error("No se pudo girar la foto", err);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!natural || busy || !imgRef.current) return;
    setBusy(true);
    try {
      // Parte de la foto original que se ve en el marco
      const sx = -pos.x / scale;
      const sy = -pos.y / scale;
      const sw = frameW / scale;
      const sh = frameH / scale;
      const outW = Math.min(OUTPUT_WIDTH, Math.round(sw));
      const outH = Math.round(outW / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      canvas.getContext("2d")?.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) throw new Error("No se pudo recortar la foto.");
      const name = (chosenFile.name || "foto").replace(/\.[^.]+$/, "") + ".jpg";
      onDone(new File([blob], name, { type: "image/jpeg" }));
    } catch (err) {
      console.error(err);
      onDone(chosenFile); // si algo falla se usa la foto completa
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-crop__overlay" role="dialog" aria-modal="true" aria-label="Ajusta la foto">
      <div className="photo-crop__sheet">
        <PawBackground contained />

        <h2 className="photo-crop__title">Ajusta la foto</h2>
        <p className="photo-crop__subtitle">
          Arrastra para elegir qué parte se verá en la ficha de la mascota.
        </p>

        <div
          className="photo-crop__frame"
          style={{ width: frameW, height: frameH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(e: ReactWheelEvent<HTMLDivElement>) => changeZoom(zoom - e.deltaY * 0.002)}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={onLoad}
              className="photo-crop__img"
              style={{ width: imgW, height: imgH, transform: `translate(${pos.x}px, ${pos.y}px)` }}
            />
          )}
        </div>

        <label className="photo-crop__zoom">
          <span aria-hidden="true">−</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            aria-label="Acercar foto"
          />
          <span aria-hidden="true">+</span>
        </label>

        <div className="photo-crop__rotate">
          <button
            type="button"
            disabled={!natural || busy}
            onClick={() => void rotate(-1)}
            aria-label="Girar a la izquierda"
          >
            <RotateIcon flip />
            Girar
          </button>
          <button
            type="button"
            disabled={!natural || busy}
            onClick={() => void rotate(1)}
            aria-label="Girar a la derecha"
          >
            Girar
            <RotateIcon />
          </button>
        </div>

        <button
          type="button"
          className="photo-crop__done"
          disabled={!natural || busy}
          onClick={() => void confirm()}
        >
          {busy ? "Preparando…" : "Usar foto"}
        </button>
        <button type="button" className="photo-crop__cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
