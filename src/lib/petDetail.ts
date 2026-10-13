import type { PetDetailData } from "../components/ui/PetDetailModal";
import { ageFromBirthDate, dayLabel } from "./format";
import type { Pet, ReportNear } from "./types";

/** Datos de la card expandida a partir de un reporte (perdido/encontrado). */
export function reportToDetailData(r: ReportNear): PetDetailData {
  return {
    kind: "report",
    reportId: r.id,
    ownerId: r.user_id,
    name: r.pet_name ?? r.species_name ?? "Mascota",
    photoUrl: r.pet_photo_url,
    location: `${r.description || "Cerca de ti"} · ${dayLabel(r.created_at).toLowerCase()}`,
    status: r.type === "lost" ? "Perdido" : "Encontrado",
    species: r.species_name,
    breed: r.breed,
    sex: r.sex,
    size: r.size,
    color: r.color,
    age: r.pet_birth_date ? ageFromBirthDate(r.pet_birth_date) : r.age_estimate,
    marks: r.description || null,
    ownerName: r.owner_name,
  };
}

/** Datos de la card expandida a partir de una mascota registrada (adopción). */
export function petToDetailData(p: Pet): PetDetailData {
  return {
    kind: p.status === "for_adoption" ? "adoption" : "pet",
    petId: p.id,
    ownerId: p.user_id,
    name: p.name,
    photoUrl: p.photo_url,
    location: `${p.species?.name ?? "Mascota"} · ${dayLabel(p.created_at).toLowerCase()}`,
    status: p.species?.name ?? "Mascota",
    species: p.species?.name,
    breed: p.breed,
    age: ageFromBirthDate(p.birth_date),
    sex: p.sex,
    size: p.size,
    color: p.color,
    marks: p.description,
  };
}
