import type { PublisherKind } from "./publisher";

/**
 * Tipo de cuenta profesional para la gestión de sedes (homologado de la app):
 * - clinic:  veterinaria (establecimiento) con su lugar verificado en el mapa
 * - shelter: refugio (lugar verificado o rol foundation)
 * - doctor:  médico veterinario (persona, rol vet sin lugar verificado): consultorio opcional
 */
export function placeMenuKind(
  role: string,
  verifiedKind: PublisherKind | undefined,
  firstPlaceKind: string | undefined
): PublisherKind {
  if (verifiedKind) return verifiedKind;
  if (firstPlaceKind === "clinic" || firstPlaceKind === "shelter") return firstPlaceKind;
  return role === "foundation" ? "shelter" : "doctor";
}

// Fila del perfil: "Mis veterinarias" / "Mis refugios" / "Mis consultorios"
export const PLACE_MENU: Record<PublisherKind, { label: string; sub: string }> = {
  clinic: { label: "Mis veterinarias", sub: "Tus sedes en el mapa" },
  shelter: { label: "Mis refugios", sub: "Tus sedes en el mapa" },
  doctor: { label: "Mis consultorios", sub: "Dónde atiendes (opcional)" },
};

export interface PlaceText {
  listTitle: string;
  listIntro: string;
  addLabel: string;
  addFirst: string;
  empty: string;
  newTitle: string;
  deleteLabel: string;
  title: string;
  namePlaceholder: string;
  intro: string;
  verified: string;
  verifiedSub: string;
  pending: string;
  created: string;
  create: string;
  nameError: string;
  adoptionCta?: string;
}

export const PLACE_TEXT: Record<PublisherKind, PlaceText> = {
  clinic: {
    listTitle: "Mis veterinarias",
    listIntro:
      "Agrega cada sede de tu veterinaria. Cada una aparece en el mapa cuando un administrador la verifica.",
    addLabel: "Agregar otra sede",
    addFirst: "Agregar mi veterinaria",
    empty: "Todavía no has agregado tu veterinaria al mapa.",
    newTitle: "Nueva sede",
    deleteLabel: "Eliminar esta sede",
    title: "Mi veterinaria",
    namePlaceholder: "Ej: Veterinaria San Francisco",
    intro:
      "Marca en el mapa dónde está tu veterinaria. Los dueños de mascotas te encontrarán en el filtro «Veterinarias» y podrán llamarte.",
    verified: "Veterinaria verificada y visible en el mapa",
    verifiedSub: "Los dueños de mascotas ya pueden encontrarte en el filtro «Veterinarias» y llamarte.",
    pending: "Un administrador revisará tu veterinaria antes de mostrarla en el mapa.",
    created: "¡Listo! Tu veterinaria quedó pendiente de verificación.",
    create: "Crear mi veterinaria en el mapa",
    nameError: "Escribe el nombre de tu veterinaria.",
  },
  shelter: {
    listTitle: "Mis refugios",
    listIntro:
      "Agrega cada sede o punto de tu refugio. Cada una aparece en el mapa cuando un administrador la verifica.",
    addLabel: "Agregar otra sede",
    addFirst: "Agregar mi refugio",
    empty: "Todavía no has agregado tu refugio al mapa.",
    newTitle: "Nueva sede",
    deleteLabel: "Eliminar esta sede",
    title: "Mi refugio",
    namePlaceholder: "Ej: Refugio Huellitas",
    intro:
      "Marca en el mapa dónde está tu refugio. Las personas te encontrarán en el filtro «Refugios» y tus mascotas en adopción llevarán la etiqueta «Refugio».",
    verified: "Refugio verificado y visible en el mapa",
    verifiedSub:
      "Las personas ya pueden encontrarte en el filtro «Refugios». Tus publicaciones en adopción llevan la etiqueta «Refugio».",
    pending: "Un administrador revisará tu refugio antes de mostrarlo en el mapa.",
    created: "¡Listo! Tu refugio quedó pendiente de verificación.",
    create: "Crear mi refugio en el mapa",
    nameError: "Escribe el nombre de tu refugio.",
    adoptionCta: "Dar una mascota en adopción",
  },
  doctor: {
    listTitle: "Mis consultorios",
    listIntro:
      "Si atiendes en uno o varios consultorios, agrégalos (es opcional). Cada uno aparece en el mapa cuando un administrador lo verifica.",
    addLabel: "Agregar otro consultorio",
    addFirst: "Agregar mi consultorio",
    empty: "No has agregado consultorios. Es opcional.",
    newTitle: "Nuevo consultorio",
    deleteLabel: "Eliminar este consultorio",
    title: "Mi consultorio",
    namePlaceholder: "Ej: Consultorio Dra. Pérez",
    intro:
      "Como médico veterinario, tu etiqueta «Médico vet.» ya aparece en tus publicaciones y comentarios. Si además atiendes en un consultorio, márcalo en el mapa (es opcional).",
    verified: "Consultorio verificado y visible en el mapa",
    verifiedSub: "Los dueños de mascotas ya pueden encontrarte en el mapa.",
    pending: "Un administrador revisará tu consultorio antes de mostrarlo en el mapa.",
    created: "¡Listo! Tu consultorio quedó pendiente de verificación.",
    create: "Agregar mi consultorio al mapa",
    nameError: "Escribe el nombre de tu consultorio.",
  },
};
