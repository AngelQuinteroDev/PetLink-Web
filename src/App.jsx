import { useState } from "react";
import LoginScreen from "./assets/components/LoginScreen.jsx";
import RegisterScreen from "./assets/components/RegisterScreen.jsx";
import NavBar from "./assets/components/NavBar.jsx";
import HomePage from "./assets/components/HomePage.jsx";
import MapPage from "./assets/components/MapPage.jsx";
import CircleIconButton from "./assets/components/CircleIconButton.jsx";
import NotificationsPage from "./assets/components/NotificationsPage.jsx";
import ProfileCard from "./assets/components/ProfileCard.jsx";
import ProfileStats from "./assets/components/ProfileStats.jsx";
import MyPetsSection from "./assets/components/MyPetsSection.jsx";
import AccountSection from "./assets/components/AccountSection.jsx";
import ReportModal from "./assets/components/ReportModal.jsx";
import SettingsPage from "./assets/components/SettingsPage.jsx";
import AddPetPage from "./assets/components/AddPetPage.jsx";
import ChangeEmailPage from "./assets/components/ChangeEmailPage.jsx";
import ChangePasswordPage from "./assets/components/ChangePasswordPage.jsx";
import ReportLostPage from "./assets/components/ReportLostPage.jsx";
import ReportFoundPage from "./assets/components/ReportFoundPage.jsx";
import CommunityPage from "./assets/components/CommunityPage.jsx";
import PetListPage from "./assets/components/PetListPage.jsx";
import HelpPage from "./assets/components/HelpPage.jsx";
import PetDetailModal from "./assets/components/PetDetailModal.jsx";
import PhotoPickerModal from "./assets/components/PhotoPickerModal.jsx";
import CityPickerModal from "./assets/components/CityPickerModal.jsx";
import ConfirmModal from "./assets/components/ConfirmModal.jsx";
import PawBackground from "./assets/components/PawBackground.jsx";
import backIcon from "./assets/svg/Back.svg";
import "./App.css";

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="#000000" strokeWidth="2" />
    <path
      d="M19.4 15C19.13 15.64 19.13 16.36 19.4 17L20.4 18.73C20.6 19.08 20.54 19.52 20.25 19.81L19.03 21.03C18.74 21.32 18.3 21.38 17.95 21.18L16.22 20.18C15.58 19.91 14.86 19.91 14.22 20.18C13.6 20.44 13.13 20.94 12.92 21.58L12.5 23H10.5L10.08 21.58C9.87 20.94 9.4 20.44 8.78 20.18C8.14 19.91 7.42 19.91 6.78 20.18L5.05 21.18C4.7 21.38 4.26 21.32 3.97 21.03L2.75 19.81C2.46 19.52 2.4 19.08 2.6 18.73L3.6 17C3.87 16.36 3.87 15.64 3.6 15C3.34 14.38 2.84 13.9 2.2 13.7L0.78 13.27V11.27L2.2 10.84C2.84 10.64 3.34 10.17 3.6 9.55C3.87 8.91 3.87 8.19 3.6 7.55L2.6 5.82C2.4 5.47 2.46 5.03 2.75 4.74L3.97 3.52C4.26 3.23 4.7 3.17 5.05 3.37L6.78 4.37C7.42 4.64 8.14 4.64 8.78 4.37C9.4 4.11 9.87 3.61 10.08 2.97L10.5 1.55H12.5L12.92 2.97C13.13 3.61 13.6 4.11 14.22 4.37C14.86 4.64 15.58 4.64 16.22 4.37L17.95 3.37C18.3 3.17 18.74 3.23 19.03 3.52L20.25 4.74C20.54 5.03 20.6 5.47 20.4 5.82L19.4 7.55C19.13 8.19 19.13 8.91 19.4 9.55C19.66 10.17 20.16 10.64 20.8 10.84L22.22 11.27V13.27L20.8 13.7C20.16 13.9 19.66 14.38 19.4 15Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const sample = (id, species, status) => ({
  id,
  name: "Nombre",
  species,
  status,
  location: "Parque Usaquén · hoy",
  breed: "Mestizo",
  age: "2 años",
  sex: "Macho",
  size: "Mediano",
  color: "Gris",
  marks:
    "Pecho y patas blancas, ojos verdes. Tiene una pequeña mancha oscura en la nariz y una marca en la oreja izquierda.",
});

const MY_PETS = [
  { ...sample(1, "Perro", "Perro"), name: "Mati" },
  { ...sample(2, "Gato", "Gato"), name: "Luna" },
];

const SPECIES_CYCLE = ["Perro", "Gato"];

const makeList = (n, status) =>
  Array.from({ length: n }, (_, i) => {
    const species = SPECIES_CYCLE[i % 2];
    return sample(i + 1, species, status ?? species);
  });

const ADOPTION_PETS = makeList(6);
const FOUND_PETS = makeList(6);
const NEAR_PETS = makeList(6, "Perdido");

const CONFIRMS = {
  logout: {
    title: "¿Estás seguro que quieres cerrar sesión?",
    description:
      "Tu cuenta quedará desconectada y tendrás que iniciar sesión nuevamente para volver a acceder a PetClue.",
    confirmLabel: "Sí, cerrar sesión",
  },
  deactivate: {
    title: "¿Estás seguro que quieres desactivar tu cuenta?",
    description:
      "Tu cuenta quedará desactivada temporalmente. Tu perfil y tu información permanecerán guardados, y podrás volver a activar tu cuenta cuando decidas regresar a PetClue.",
    confirmLabel: "Sí, desactivar cuenta",
  },
  delete: {
    title: "¿Estás seguro que quieres eliminar tu cuenta?",
    description:
      "Esta acción es permanente y no podrás recuperar tu cuenta una vez eliminada. Se eliminarán tu perfil y tus datos asociados según nuestra política de privacidad.",
    confirmLabel: "Sí, eliminar cuenta",
  },
};

function App() {
  const [view, setView] = useState("login");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showReportLost, setShowReportLost] = useState(false);
  const [showReportFound, setShowReportFound] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [listPage, setListPage] = useState(null);

  const [selectedPet, setSelectedPet] = useState(null);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [city, setCity] = useState("Bogotá");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null); // "logout" | "deactivate" | "delete" | null

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setView("app");
  };

  const handleCall = (name) => console.log(`Llamando a: ${name}`);
  const goHome = () => setActiveTab("home");
  const openNotifications = () => setShowNotifications(true);

  const userName = userEmail.split("@")[0] || "usuario";

  const sharedModals = (
    <>
      <PetDetailModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        onContact={(pet) => console.log("Contactar dueño de:", pet.name)}
      />
      <PhotoPickerModal
        open={profilePhotoOpen}
        onClose={() => setProfilePhotoOpen(false)}
        onFile={(file) => setProfilePhoto(URL.createObjectURL(file))}
      />
    </>
  );

  const confirmModal = (
    <ConfirmModal
      open={Boolean(confirmAction)}
      {...(CONFIRMS[confirmAction] ?? {})}
      onClose={() => setConfirmAction(null)}
      onConfirm={() => {
        setConfirmAction(null);
        setShowSettings(false);
        setActiveTab("home");
        setView("login");
      }}
    />
  );

  if (view === "login") {
    return (
      <LoginScreen
        onBack={() => console.log("Volver")}
        onSwitchToRegister={() => setView("register")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterScreen
        onBack={() => setView("login")}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  /* NOTIFICACIONES */
  if (showNotifications) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <NotificationsPage onBack={() => setShowNotifications(false)} />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowNotifications(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* EN ADOPCIÓN / ENCONTRADOS */
  if (listPage) {
    const isAdoption = listPage === "adoption";

    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <PetListPage
            title={isAdoption ? "En adopción" : "Encontrados"}
            pets={isAdoption ? ADOPTION_PETS : FOUND_PETS}
            onBack={() => setListPage(null)}
            onNotifications={() => {
              setListPage(null);
              setShowNotifications(true);
            }}
            onPetClick={setSelectedPet}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setListPage(null);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
          {sharedModals}
        </main>
      </div>
    );
  }

  /* AYUDA */
  if (showHelp) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <HelpPage onBack={() => setShowHelp(false)} />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowHelp(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* REPORTAR PERDIDA */
  if (showReportLost) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <ReportLostPage
            pets={MY_PETS}
            onBack={() => setShowReportLost(false)}
            onNotifications={() => {
              setShowReportLost(false);
              setShowNotifications(true);
            }}
            onNotListed={() => {
              setShowReportLost(false);
              setActiveTab("profile");
              setShowAddPet(true);
            }}
            onSubmit={(report) => {
              console.log("Alerta publicada:", report);
              setShowReportLost(false);
              setActiveTab("home");
            }}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowReportLost(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* ENCONTRÉ MASCOTA */
  if (showReportFound) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <ReportFoundPage
            onBack={() => setShowReportFound(false)}
            onNotifications={() => {
              setShowReportFound(false);
              setShowNotifications(true);
            }}
            onSubmit={(report) => {
              console.log("Alerta de mascota encontrada:", report);
              setShowReportFound(false);
              setActiveTab("home");
            }}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowReportFound(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* CAMBIAR CONTRASEÑA */
  if (showChangePassword) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <ChangePasswordPage
            onBack={() => {
              setShowChangePassword(false);
              setShowSettings(true);
            }}
            onSubmit={() => {
              console.log("Contraseña actualizada");
              setShowChangePassword(false);
              setShowSettings(true);
            }}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowChangePassword(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* CAMBIAR CORREO */
  if (showChangeEmail) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <ChangeEmailPage
            currentEmail={userEmail || "pepito.perez@gmail.com"}
            verified
            onBack={() => {
              setShowChangeEmail(false);
              setShowSettings(true);
            }}
            onSubmit={({ newEmail }) => {
              console.log("Enviar confirmación a:", newEmail);
              setShowChangeEmail(false);
              setShowSettings(true);
            }}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowChangeEmail(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* AJUSTES */
  if (showSettings) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <SettingsPage
            onBack={() => setShowSettings(false)}
            onNotifications={() => {
              setShowSettings(false);
              setShowNotifications(true);
            }}
            onChangeEmail={() => {
              setShowSettings(false);
              setShowChangeEmail(true);
            }}
            onChangePassword={() => {
              setShowSettings(false);
              setShowChangePassword(true);
            }}
            onHelp={() => {
              setShowSettings(false);
              setShowHelp(true);
            }}
            city={city}
            onCityClick={() => setCityPickerOpen(true)}
            onDeactivate={() => setConfirmAction("deactivate")}
            onDelete={() => setConfirmAction("delete")}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowSettings(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
          <CityPickerModal
            open={cityPickerOpen}
            value={city}
            onClose={() => setCityPickerOpen(false)}
            onSelect={setCity}
          />
          {confirmModal}
        </main>
      </div>
    );
  }

  /* INSCRIBIR MASCOTA */
  if (showAddPet) {
    return (
      <div className="phone-frame">
        <main className="app">
          <PawBackground />
          <AddPetPage
            onBack={() => setShowAddPet(false)}
            onNotifications={() => {
              setShowAddPet(false);
              setShowNotifications(true);
            }}
            onSave={(pet) => {
              console.log("Mascota guardada:", pet);
              setShowAddPet(false);
            }}
          />
          <NavBar
            active={activeTab}
            onNavigate={(id) => {
              setShowAddPet(false);
              if (id === "report") setShowReportModal(true);
              else setActiveTab(id);
            }}
          />
        </main>
      </div>
    );
  }

  /* APP PRINCIPAL */
  return (
    <div className="phone-frame">
      <main className="app">
        <PawBackground />

        {/* INICIO */}
        {activeTab === "home" && (
          <HomePage
            userName={userName}
            nearPets={NEAR_PETS}
            adoptionPets={ADOPTION_PETS}
            foundPets={FOUND_PETS}
            onNotifications={openNotifications}
            onLost={() => setShowReportLost(true)}
            onFound={() => setShowReportFound(true)}
            onPetClick={setSelectedPet}
            onSeeAllNear={() => setActiveTab("map")}
            onSeeAllCommunity={() => setActiveTab("community")}
            onSeeAllAdoption={() => setListPage("adoption")}
            onSeeAllFound={() => setListPage("found")}
          />
        )}

        {/* MAPA */}
        {activeTab === "map" && (
          <MapPage
            onBack={goHome}
            onNotifications={openNotifications}
            onFilter={(filter) => {
              if (filter === "Encontradas") setListPage("found");
              else console.log("Filtro seleccionado:", filter);
            }}
            onCall={handleCall}
          />
        )}

        {/* COMUNIDAD */}
        {activeTab === "community" && (
          <CommunityPage
            onBack={goHome}
            onNotifications={openNotifications}
            onShare={() => console.log("Crear publicación")}
            onPostClick={(post) => console.log("Ver publicación:", post)}
          />
        )}

        {/* PERFIL */}
        {activeTab === "profile" && (
          <>
            <header className="page-header">
              <CircleIconButton icon={backIcon} iconAlt="Volver" ariaLabel="Volver" onClick={goHome} />
              <h1 className="page-header__title">Mi perfil</h1>

              <button
                type="button"
                className="circle-icon-button"
                onClick={() => setShowSettings(true)}
                aria-label="Ajustes"
              >
                <span className="circle-icon-button__shadow" aria-hidden="true" />
                <span className="circle-icon-button__circle">
                  <SettingsIcon />
                </span>
              </button>
            </header>

            <section className="home-section">
              <ProfileCard
                name="Angely Parra"
                location="Engativá, Bogotá"
                memberLabel="Miembro"
                photoUrl={profilePhoto}
                onEditPhoto={() => setProfilePhotoOpen(true)}
              />
            </section>

            <section className="home-section">
              <ProfileStats pets={MY_PETS.length} posts={14} activeReports={0} />
            </section>

            <section className="home-section">
              <MyPetsSection
                pets={MY_PETS}
                onEnroll={() => setShowAddPet(true)}
                onPetClick={setSelectedPet}
              />
            </section>

            <AccountSection
              onOptionClick={(id) => {
                if (id === "logout") setConfirmAction("logout");
                else if (id === "help") setShowHelp(true);
                else if (id === "notifications") setShowNotifications(true);
                else if (id === "edit") setShowChangeEmail(true);
                else console.log("Opción seleccionada:", id);
              }}
            />
          </>
        )}

        {/* MODAL DE REPORTAR */}
        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSelectOption={(optionId) => {
            setShowReportModal(false);
            if (optionId === "lost") setShowReportLost(true);
            else if (optionId === "found") setShowReportFound(true);
            else if (optionId === "adoption") console.log("Dar en adopción");
          }}
          onCommunityPost={() => {
            setShowReportModal(false);
            setActiveTab("community");
          }}
        />

        {sharedModals}
        {confirmModal}

        <NavBar
          active={activeTab}
          onNavigate={(id) => {
            if (id === "report") setShowReportModal(true);
            else setActiveTab(id);
          }}
        />
      </main>
    </div>
  );
}

export default App;