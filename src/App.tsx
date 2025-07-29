import { Routes, Route } from "react-router";
import Projects from "./pages/Projects";

function App() {
  return (
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
    </Routes>
  );
}

export default App;
