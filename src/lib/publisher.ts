import { supabase } from "./supabase";

export type PublisherKind = "clinic" | "shelter" | "doctor";

// Etiqueta extra cuando quien publica es un establecimiento o un médico veterinario
export const PUBLISHER_LABEL: Record<string, string> = {
  clinic: "Veterinaria",
  shelter: "Refugio",
  doctor: "Médico veterinario",
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
