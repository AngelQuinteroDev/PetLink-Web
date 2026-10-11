export type Prefs = {
  petAlerts: boolean;
  postReplies: boolean;
  reportUpdates: boolean;
  exactLocation: boolean;
  city: string;
};

const STORAGE_KEY = "petclue:prefs";

const DEFAULTS: Prefs = {
  petAlerts: true,
  postReplies: true,
  reportUpdates: true,
  exactLocation: true,
  city: "Bogotá",
};

const listeners = new Set<() => void>();

function load(): Prefs {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

let cache: Prefs = load();

export function getPrefs(): Prefs {
  return cache;
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
  cache = { ...cache, [key]: value };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* almacenamiento no disponible */
  }
  listeners.forEach((fn) => fn());
}

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Santa Marta",
  "Cúcuta",
  "Ibagué",
  "Villavicencio",
];
