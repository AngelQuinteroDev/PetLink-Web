import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  Lock,
  LogOut,
  PawPrint,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PetCard from "../components/PetCard.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import ProfileStats from "../components/ProfileStats";
import SettingsRow from "../components/ui/SettingsRow";
import PetDetailModal, { type PetDetailData } from "../components/ui/PetDetailModal";
import LogoutConfirm from "../components/ui/LogoutConfirm";
import { EmptyState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { usePrefs } from "../hooks/usePrefs";
import { getMyStats, myPets, removePhoto, updateAvatar, uploadPhoto } from "../lib/api";
import { ageFromBirthDate } from "../lib/format";
import type { Pet } from "../lib/types";
import "../styles/pages.css";
import "../styles/settings.css";

const ROLE_LABELS: Record<string, string> = {
  owner: "Miembro",
  vet: "Veterinario",
  foundation: "Refugio",
  admin: "Administrador",
};

const MAX_AVATAR_MB = 5;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { prefs } = usePrefs();
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState({ posts: 0, activeReports: 0 });
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PetDetailData | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [myPetsList, myStats] = await Promise.all([myPets(), getMyStats()]);
      setPets(myPetsList);
      setStats(myStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAvatarFile(file: File | null) {
    if (!file || avatarBusy) return;
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Elige una imagen (JPG, PNG…).");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setAvatarError(`La imagen no puede superar ${MAX_AVATAR_MB} MB.`);
      return;
    }
    setAvatarBusy(true);
    const previous = profile?.avatar_url ?? null;
    try {
      const url = await uploadPhoto(file, "avatars");
      await updateAvatar(url);
      if (previous) void removePhoto("avatars", previous).catch(() => undefined);
      await refreshProfile();
    } catch {
      setAvatarError("No pudimos guardar tu foto. Intenta de nuevo.");
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  function petDetail(p: Pet): PetDetailData {
    return {
      name: p.name,
      photoUrl: p.photo_url,
      location: `${p.breed || p.species?.name || "Mascota"}`,
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

  return (
    <div>
      <div className="pc-page-header">
        <h1 className="pc-title" style={{ textAlign: "left" }}>
          Mi perfil
        </h1>
        <button
          type="button"
          className="pc-icon-btn"
          onClick={() => navigate("/ajustes")}
          aria-label="Ajustes"
        >
          <SettingsIcon size={18} />
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-card__photo">
          {profile?.avatar_url ? (
            <img
              className="profile-card__avatar-img"
              src={profile.avatar_url}
              alt={`Foto de perfil de ${profile.name}`}
            />
          ) : (
            <span className="profile-card__avatar" aria-hidden="true">
              {(profile?.name ?? "U").charAt(0).toUpperCase()}
            </span>
          )}
          <button
            type="button"
            className="profile-card__edit"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarBusy}
            aria-label="Cambiar foto de perfil"
            title="Cambiar foto de perfil"
          >
            {avatarBusy ? (
              <span className="profile-card__edit-spinner" aria-hidden="true" />
            ) : (
              <Pencil size={12} />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="profile-card__file"
            onChange={(e) => void handleAvatarFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <p className="profile-card__name">{profile?.name ?? "…"}</p>
          <p className="profile-card__city">{prefs.city}</p>
          <span className="pc-badge pc-badge--question">
            {ROLE_LABELS[profile?.role ?? "owner"] ?? profile?.role}
          </span>
          {avatarError && (
            <p className="profile-card__error" role="alert">
              {avatarError}
            </p>
          )}
        </div>
      </div>

      <ProfileStats
        pets={pets.length}
        posts={stats.posts}
        activeReports={stats.activeReports}
      />

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="pc-section-title">Mis mascotas</h2>
          <button type="button" className="pc-pill-btn" onClick={() => navigate("/mascotas/nueva")}>
            <Plus size={15} /> Inscribir
          </button>
        </div>

        {loading && <LoadingState label="Cargando tus mascotas…" />}

        {!loading && pets.length === 0 && (
          <EmptyState
            icon={<PawPrint size={36} strokeWidth={1.6} />}
            title="Inscribe tus mascotas"
            body="Regístralas para recibir recordatorios y reportarlas más rápido si se pierden."
            action={
              <PrimaryButton onClick={() => navigate("/mascotas/nueva")} type="button">
                Inscribir mi primera mascota
              </PrimaryButton>
            }
          />
        )}

        <div className="pc-cards-grid">
          {pets.map((p) => (
            <PetCard
              key={p.id}
              status={p.species?.name ?? "Mascota"}
              name={p.name}
              location={p.breed || p.species?.name || "Mascota"}
              photoUrl={p.photo_url ?? undefined}
              onClick={() => setDetail(petDetail(p))}
              onEdit={() => navigate(`/mascotas/${p.id}/editar`)}
            />
          ))}
        </div>
      </section>

      <section className="home__section">
        <h2 className="pc-section-title" style={{ marginBottom: 12 }}>
          Cuenta
        </h2>
        <div className="settings-card">
          <SettingsRow
            icon={<UserRound size={17} />}
            label="Editar información personal"
            onClick={() => navigate("/ajustes")}
          />
          {profile?.role === "vet" || profile?.role === "foundation" ? (
            <SettingsRow
              icon={<ShieldCheck size={17} />}
              label="Mi clínica"
              onClick={() => navigate("/mi-clinica")}
            />
          ) : (
            <SettingsRow
              icon={<ShieldCheck size={17} />}
              label="Solicitar verificación"
              sublabel="Para veterinarios y refugios"
              onClick={() => navigate("/verificacion")}
            />
          )}
          <SettingsRow
            icon={<Lock size={17} />}
            label="Privacidad"
            onClick={() => navigate("/ajustes")}
          />
          <SettingsRow
            icon={<HelpCircle size={17} />}
            label="Ayuda y soporte"
            onClick={() => navigate("/ayuda")}
          />
          {profile?.role === "admin" && (
            <SettingsRow
              icon={<ShieldCheck size={17} />}
              label="Administración"
              onClick={() => navigate("/admin")}
            />
          )}
          <SettingsRow
            icon={<LogOut size={17} />}
            label="Cerrar sesión"
            danger
            onClick={() => setLogoutOpen(true)}
          />
        </div>
      </section>

      <PetDetailModal data={detail} onClose={() => setDetail(null)} />

      {logoutOpen && <LogoutConfirm onClose={() => setLogoutOpen(false)} />}
    </div>
  );
}
