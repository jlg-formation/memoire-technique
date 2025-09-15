import { NavLink } from "react-router";
import { useProjectStore } from "../store/useProjectStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentProject } = useProjectStore();
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-100 transition-transform md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-4 hover:bg-gray-300 md:hidden"
          >
            ✕
          </button>
          <h2 className="p-4 text-lg font-bold">Menu</h2>
        </div>
      </div>
      <nav className="flex flex-col">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Accueil
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          {currentProject?.nomCourt
            ? `Projet : ${currentProject.nomCourt}`
            : "Projets"}
        </NavLink>
        <NavLink
          to="/groupement"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Groupement
        </NavLink>
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Pièces marché
        </NavLink>
        <NavLink
          to="/memoire"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Mémoire
        </NavLink>
        <NavLink
          to="/missions"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Missions
        </NavLink>
        <NavLink
          to="/planning"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Planning
        </NavLink>
        <NavLink
          to="/notation"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Notation
        </NavLink>
        <NavLink
          to="/parametres"
          className={({ isActive }) =>
            `mb-2 cursor-pointer rounded px-2 py-1 ${isActive ? "bg-blue-500 text-white" : "text-blue-500"}`
          }
        >
          Paramètres
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
