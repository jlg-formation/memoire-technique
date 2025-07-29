import { Routes, Route } from "react-router";

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
    </Routes>
  );
}

export default App;
