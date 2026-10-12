import type { PetSex, PetSize } from "./types";

export const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
  { value: "unknown", label: "No sé" },
];

export const SIZE_OPTIONS: { value: PetSize; label: string }[] = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];

export const COLOR_OPTIONS = [
  "Negro",
  "Blanco",
  "Café",
  "Gris",
  "Crema",
  "Dorado",
  "Naranja",
  "Atigrado",
  "Bicolor",
].map((c) => ({ value: c, label: c }));
