import { supabase } from "./supabase";

export type PublisherKind = "clinic" | "shelter" | "doctor";

// Etiqueta extra cuando quien publica es un establecimiento o un médico veterinario
export const PUBLISHER_LABEL: Record<string, string> = {
  clinic: "Veterinaria",
  shelter: "Refugio",
  doctor: "Médico veterinario",
};

// Etiqueta de rol junto al nombre en la comunidad (publicaciones y comentarios), como en la app
export type RoleBadgeKind = "clinic" | "shelter" | "vet" | "admin";

export const ROLE_BADGE_LABEL: Record<RoleBadgeKind, string> = {
  clinic: "Veterinaria",
  shelter: "Refugio",
  vet: "Médico veterinario",
  admin: "Administrador",
};

/**
 * Mismo criterio que la app, con la persona diferenciada:
 * - lugar VERIFICADO en el mapa (vet_clinics): su tipo, que eligió el admin (Veterinaria/Refugio);
 * - sin lugar pero con rol foundation: refugio;
 * - médico veterinario (persona verificada) sin establecimiento: "Médico veterinario".
 * Devuelve userId → PublisherKind.
 */
export async function publisherKinds(
  userIds: string[]
): Promise<Record<string, PublisherKind>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return {};
  const [places, profiles] = await Promise.all([
    supabase
      .from("vet_clinics")
      .select("created_by, kind, created_at")
      .in("created_by", ids)
      .eq("verified", true)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, role, vet_status").in("id", ids),
  ]);
  if (places.error) throw places.error;
  const kinds: Record<string, PublisherKind> = {};
  for (const row of (places.data ?? []) as { created_by: string; kind: "clinic" | "shelter" }[]) {
    if (!kinds[row.created_by]) kinds[row.created_by] = row.kind;
  }
  for (const p of (profiles.data ?? []) as { id: string; role: string; vet_status: string | null }[]) {
    if (kinds[p.id]) continue;
    if (p.role === "foundation") kinds[p.id] = "shelter";
    else if (p.role === "vet" && p.vet_status === "verified") kinds[p.id] = "doctor";
  }
  return kinds;
}

/**
 * Rol especial de varias cuentas, para la etiqueta junto al nombre en la comunidad:
 * "clinic"/"shelter" (lugar verificado o rol foundation, igual que publisherKinds),
 * "vet" (médico veterinario, persona) y "admin". Las cuentas normales no aparecen.
 */
export async function roleBadges(userIds: string[]): Promise<Record<string, RoleBadgeKind>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return {};
  const [kinds, roles] = await Promise.all([
    publisherKinds(ids).catch(() => ({} as Record<string, PublisherKind>)),
    supabase.from("profiles").select("id, role").in("id", ids),
  ]);
  const out: Record<string, RoleBadgeKind> = {};
  for (const [id, kind] of Object.entries(kinds)) out[id] = kind === "doctor" ? "vet" : kind;
  for (const p of (roles.data ?? []) as { id: string; role: string }[]) {
    if (out[p.id]) continue;
    if (p.role === "admin") out[p.id] = "admin";
    else if (p.role === "vet") out[p.id] = "vet";
  }
  return out;
}
