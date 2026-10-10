import { useState } from "react";
import AppHeader from "./AppHeader.jsx";
import SearchBar from "./SearchBar.jsx";
import backIcon from "../svg/Back.svg";

function HelpPage({ onBack }) {
  const [query, setQuery] = useState("");

  return (
    <>
      <AppHeader title="Ayuda y soporte" leftIcon={backIcon} onLeft={onBack} />

      <SearchBar value={query} onChange={setQuery} placeholder="Busca tu duda..." />
    </>
  );
}

export default HelpPage;