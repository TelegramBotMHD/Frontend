// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Benutzerverwaltung from "./pages/Benutzerverwaltung";
import Einbuchen from "./pages/Einbuchen";
import Ausbuchen from "./pages/Ausbuchen";
import Artikelverwaltung from "./pages/Artikelverwaltung";
import Lieferantenverwaltung from "./pages/Lieferantenverwaltung";
import Artikelliste from "./pages/Artikelliste";
import Lieferantenliste from "./pages/Lieferantenliste";
import Kritische from "./pages/Kritische";
import KPI from "./pages/KPI";
import HACCP from "./pages/HACCP";
import Wareneingang from "./pages/Wareneingang";
import Temperaturkontrolle from "./pages/Temperaturkontrolle";
import Automateninspektion from "./pages/Automateninspektion";
import Korrekturmassnahmen from "./pages/Korrekturmassnahmen";
import HACCPKonzept from "./pages/HACCPKonzept";
import Logins from "./pages/Logins";
import Buchungshistorie from "./pages/Buchungshistorie";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="benutzerverwaltung" element={<Benutzerverwaltung />} />
          <Route path="artikelverwaltung" element={<Artikelverwaltung />} />
          <Route path="einbuchen" element={<Einbuchen />} />
          <Route path="ausbuchen" element={<Ausbuchen />} />
          <Route path="lieferantenverwaltung" element={<Lieferantenverwaltung />} />
          <Route path="artikelliste" element={<Artikelliste />} />
          <Route path="lieferantenliste" element={<Lieferantenliste />} />
          <Route path="kritische" element={<Kritische />} />
          <Route path="kpi" element={<KPI />} />
          <Route path="logins" element={<Logins />} />
          <Route path="buchungshistorie" element={<Buchungshistorie />} />

        <Route path="haccp" element={<HACCP />}>
  <Route path="wareneingang" element={<Wareneingang />} />
  <Route path="temperaturkontrolle" element={<Temperaturkontrolle />} />
  <Route path="automateninspektion" element={<Automateninspektion />} />
  <Route path="korrekturmassnahmen" element={<Korrekturmassnahmen />} />
  <Route path="konzept" element={<HACCPKonzept />} />
</Route>


          {/* Weitere Routen hier einfügen */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
