import AppHeader from "./AppHeader.jsx";
import MapFilterTabs from "./MapFilterTabs.jsx";
import MapView from "./MapView.jsx";
import VetCard from "./VetCard.jsx";
import backIcon from "../svg/Back.svg";
import bellIcon from "../svg/bell.svg";
import "./MapPage.css";

function MapPage({ onBack, onNotifications, onFilter, onCall }) {
  return (
    <>
      <AppHeader
        title="Mapa"
        leftIcon={backIcon}
        onLeft={onBack}
        rightIcon={bellIcon}
        onRight={onNotifications}
      />

      <div className="map-page__filters">
        <MapFilterTabs onChange={onFilter} />
      </div>

      <MapView />

      <section className="map-page__nearby">
        <h2 className="map-page__title">Cerca de ti</h2>

        <div className="map-page__list">
          <VetCard name="Toby · Perdido" info="Parque de Usaquén · 1.2 km" badge="HOY" />
          <VetCard name="Lola · Perdido" info="Parque de Usaquén · 1.2 km" badge="HOY" />
          <VetCard
            name="Veterinaria Laika"
            info="Abierto 24 horas · 1.2 km"
            onCall={() => onCall?.("Veterinaria Laika")}
          />
          <VetCard
            name="Clínica Veterinaria San Roque"
            info="Cierra a las 8pm · 2.4 km"
            onCall={() => onCall?.("Clínica Veterinaria San Roque")}
          />
        </div>
      </section>
    </>
  );
}

export default MapPage;