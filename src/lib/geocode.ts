import type { GeoPoint } from "./types";

const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
const SEARCH_ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim permite 1 req/s: espaciamos las llamadas para cumplir su política.
const MIN_INTERVAL_MS = 1100;
let lastCallAt = 0;

interface NominatimResponse {
  name?: string;
  display_name?: string;
}

interface NominatimSearchItem {
  lat: string;
  lon: string;
}

async function throttle(): Promise<void> {
  const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastCallAt));
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();
}

const TIMEOUT_MS = 6000;

/** fetch con timeout y manejo de error: nunca lanza, devuelve null si falla. */
async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Busca un lugar por texto (ej. "Parque de Usaquén") y devuelve su punto. */
export async function searchPlace(query: string): Promise<GeoPoint | null> {
  if (!query.trim()) return null;
  await throttle();
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query.trim(),
    limit: "1",
    "accept-language": "es",
  });
  const data = (await fetchJson(`${SEARCH_ENDPOINT}?${params.toString()}`)) as
    | NominatimSearchItem[]
    | null;
  const first = data?.[0];
  if (!first) return null;
  return { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
}

/**
 * Convierte coordenadas en un nombre de lugar legible (OSM/Nominatim).
 * Devuelve null si no hay red o la respuesta no sirve; nunca lanza.
 */
export async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  await throttle();

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(point.lat),
    lon: String(point.lon),
    zoom: "18",
    "accept-language": "es",
  });

  const data = (await fetchJson(`${ENDPOINT}?${params.toString()}`)) as NominatimResponse | null;
  if (!data) return null;
  if (data.name && data.name.trim()) return data.name.trim();
  if (data.display_name) {
    return data.display_name.split(",").slice(0, 2).join(",").trim();
  }
  return null;
}
