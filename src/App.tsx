import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<div>Bienvenue dans l’outil de mémoire technique</div>}
      />
    </Routes>
  );
}

export default App;
