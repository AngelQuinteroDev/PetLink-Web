/**
 * Etiqueta de autor verificado para las publicaciones:
 * veterinarios y refugios con vet_status = 'verified' muestran su rol
 * al lado del nombre (para que la comunidad valide quién publica).
 */
export function verifiedRoleBadge(
  role: string | null | undefined,
  vetStatus: string | null | undefined
): string | null {
  if (vetStatus !== "verified") return null;
  if (role === "vet") return "Veterinario";
  if (role === "foundation") return "Refugio";
  return null;
}
