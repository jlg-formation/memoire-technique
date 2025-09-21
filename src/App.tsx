import { Routes, Route } from "react-router";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import { ProjectGuard } from "./components/ProjectGuard";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectEdit from "./pages/ProjectEdit";
import Equipes from "./pages/Equipes";
import MarketDocs from "./pages/MarketDocs";
import Missions from "./pages/Missions";
import MissionPercentages from "./pages/MissionPercentages";
import Planning from "./pages/Planning";
import Notation from "./pages/Notation";
import Settings from "./pages/Settings";
import Debug from "./pages/Debug";
import CompanyEdit from "./pages/CompanyEdit";
import MobilizedPersonCreate from "./pages/MobilizedPersonCreate";
import MobilizedPersonEdit from "./pages/MobilizedPersonEdit";
import CompanyCreate from "./pages/CompanyCreate";
import ProjectImport from "./pages/ProjectImport";
import Memoire from "./pages/Memoire";
import { ButtonLink } from "./components/ui";
import { useNavigation } from "./hooks/useNavigation";

function App() {
  const { isSidebarOpen, openSidebar, closeSidebar } = useNavigation();

  return (
    <div className="min-h-screen md:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 cursor-pointer bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-label="Fermer le menu de navigation"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              closeSidebar();
            }
          }}
        />
      )}
      <div className="flex-1">
        <div className="mx-auto max-w-screen-lg p-0 sm:p-4">
          <ButtonLink
            onClick={openSidebar}
            className="mb-4 md:hidden"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu size={20} />
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
              path="/projects/import"
              element={<ProjectImport onClose={() => window.history.back()} />}
            />
            <Route
              path="/projects/:projectSlug/edit"
              element={<ProjectEdit />}
            />
            <Route
              path="/equipes"
              element={
                <ProjectGuard>
                  <Equipes />
                </ProjectGuard>
              }
            />
            <Route
              path="/equipes/entreprise/:companySlug/edit"
              element={
                <ProjectGuard>
                  <CompanyEdit />
                </ProjectGuard>
              }
            />
            <Route
              path="/equipes/entreprise/:companySlug/personne/ajouter"
              element={
                <ProjectGuard>
                  <MobilizedPersonCreate />
                </ProjectGuard>
              }
            />
            <Route
              path="/equipes/entreprise/:companySlug/personne/:personSlug/edit"
              element={
                <ProjectGuard>
                  <MobilizedPersonEdit />
                </ProjectGuard>
              }
            />
            <Route
              path="/documents"
              element={
                <ProjectGuard>
                  <MarketDocs />
                </ProjectGuard>
              }
            />
            <Route
              path="/missions"
              element={
                <ProjectGuard>
                  <Missions />
                </ProjectGuard>
              }
            />
            <Route
              path="/missions/pourcentages"
              element={
                <ProjectGuard>
                  <MissionPercentages />
                </ProjectGuard>
              }
            />
            <Route
              path="/planning"
              element={
                <ProjectGuard>
                  <Planning />
                </ProjectGuard>
              }
            />
            <Route
              path="/notation"
              element={
                <ProjectGuard>
                  <Notation />
                </ProjectGuard>
              }
            />
            <Route
              path="/memoire"
              element={
                <ProjectGuard>
                  <Memoire />
                </ProjectGuard>
              }
            />
            <Route path="/parametres" element={<Settings />} />
            <Route
              path="/equipes/entreprise/create"
              element={
                <ProjectGuard>
                  <CompanyCreate />
                </ProjectGuard>
              }
            />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
