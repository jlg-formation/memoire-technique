import { NavLink } from "react-router";

function Sidebar() {
  return (
    <nav className="flex h-screen w-64 flex-col bg-gray-100 p-4">
      <h2 className="mb-4 text-lg font-bold">Menu</h2>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Accueil
      </NavLink>
      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Projets
      </NavLink>
      <NavLink
        to="/groupement"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Groupement
      </NavLink>
      <NavLink
        to="/documents"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Pièces marché
      </NavLink>
      <NavLink
        to="/memoire"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Mémoire
      </NavLink>
      <NavLink
        to="/notation"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Notation
      </NavLink>
      <NavLink
        to="/parametres"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Paramètres
      </NavLink>
    </nav>
  );
}

export default Sidebar;
