import { Routes, Route } from "react-router";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Projects from "./pages/Projects";
import Groupement from "./pages/Groupement";
import MarketDocs from "./pages/MarketDocs";
import Missions from "./pages/Missions";
import Planning from "./pages/Planning";
import Memoire from "./pages/Memoire";
import Notation from "./pages/Notation";
import Settings from "./pages/Settings";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1">
        <div className="mx-auto max-w-screen-lg p-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mb-4 cursor-pointer md:hidden"
          >
            ☰
          </button>
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
            <Route path="/groupement" element={<Groupement />} />
            <Route path="/documents" element={<MarketDocs />} />
            <Route path="/memoire" element={<Memoire />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/notation" element={<Notation />} />
            <Route path="/parametres" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
