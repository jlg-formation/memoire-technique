import { Routes, Route } from "react-router";
import Sidebar from "./components/Sidebar";
import Projects from "./pages/Projects";
import Groupement from "./pages/Groupement";
import MarketDocs from "./pages/MarketDocs";
import Memoire from "./pages/Memoire";
import Settings from "./pages/Settings";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
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
          <Route path="/parametres" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
