import { NavLink } from "react-router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <nav
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-100 p-4 transition-transform md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Menu</h2>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer md:hidden"
        >
          ✕
        </button>
      </div>
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
        to="/missions"
        className={({ isActive }) =>
          `mb-2 rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
        }
      >
        Missions
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
