import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  Lock,
  LogOut,
  PawPrint,
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
import EditProfileModal from "../components/ui/EditProfileModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { EmptyState, LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { usePrefs } from "../hooks/usePrefs";
import { getMyStats, myPets, updateProfileName } from "../lib/api";
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const { prefs, setPref } = usePrefs();
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState({ posts: 0, activeReports: 0 });
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PetDetailData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

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

  async function saveProfile(name: string, city: string) {
    await updateProfileName(name);
    setPref("city", city);
    await refreshProfile();
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
        <span className="profile-card__avatar" aria-hidden="true">
          {(profile?.name ?? "U").charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="profile-card__name">{profile?.name ?? "…"}</p>
          <p className="profile-card__city">{prefs.city}</p>
          <span className="pc-badge pc-badge--question">
            {ROLE_LABELS[profile?.role ?? "owner"] ?? profile?.role}
          </span>
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
            onClick={() => setEditOpen(true)}
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

      {editOpen && (
        <EditProfileModal
          initialName={profile?.name ?? ""}
          initialCity={prefs.city}
          onSave={saveProfile}
          onClose={() => setEditOpen(false)}
        />
      )}

      {logoutOpen && (
        <ConfirmModal
          title="Cerrar sesión"
          confirmLabel="Cerrar sesión"
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false);
            void signOut();
          }}
        >
          <p>¿Estás seguro de que quieres cerrar sesión en PetClue?</p>
        </ConfirmModal>
      )}
    </div>
  );
}
