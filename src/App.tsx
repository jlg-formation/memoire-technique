import { Routes, Route } from "react-router";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectEditRoute from "./pages/ProjectEditRoute";
import Equipes from "./pages/Equipes";
import MarketDocs from "./pages/MarketDocs";
import Missions from "./pages/Missions";
import MissionPercentages from "./pages/MissionPercentages";
import Planning from "./pages/Planning";
import Notation from "./pages/Notation";
import Settings from "./pages/Settings";
import { ButtonLink } from "./components/ui";
import Debug from "./pages/Debug";
import CompanyEditRoute from "./pages/CompanyEditRoute";
import MobilizedPersonCreateRoute from "./pages/MobilizedPersonCreateRoute";
import MobilizedPersonEditRoute from "./pages/MobilizedPersonEditRoute";
import CompanyCreate from "./pages/CompanyCreate";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 cursor-pointer bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1">
        <div className="mx-auto max-w-screen-lg p-0 sm:p-4">
          <ButtonLink
            onClick={() => setSidebarOpen(true)}
            className="mb-4 md:hidden"
          >
            ☰
          </ButtonLink>
          <Routes>
            <Route
              path="/"
              element={
                <div className="font-bold text-blue-500">
                  Bienvenue dans l’outil de mémoire technique
                </div>
              }
            />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/create"
              element={<ProjectCreate onClose={() => window.history.back()} />}
            />
            <Route
              path="/projects/:projectSlug/edit"
              element={<ProjectEditRoute />}
            />
            <Route path="/equipes" element={<Equipes />} />
            <Route
              path="/equipes/entreprise/:companySlug/edit"
              element={<CompanyEditRoute />}
            />
            <Route
              path="/equipes/entreprise/:companySlug/personne/ajouter"
              element={<MobilizedPersonCreateRoute />}
            />
            <Route
              path="/equipes/entreprise/:companySlug/personne/:personSlug/edit"
              element={<MobilizedPersonEditRoute />}
            />
            <Route path="/documents" element={<MarketDocs />} />
            <Route path="/missions" element={<Missions />} />
            <Route
              path="/missions/pourcentages"
              element={<MissionPercentages />}
            />
            <Route path="/planning" element={<Planning />} />
            <Route path="/notation" element={<Notation />} />
            <Route path="/parametres" element={<Settings />} />
            <Route
              path="/equipes/entreprise/create"
              element={<CompanyCreate />}
            />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
