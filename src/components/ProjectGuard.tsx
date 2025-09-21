import type { ReactNode } from "react";
import { useProjectStore } from "../store/useProjectStore";

interface ProjectGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant de protection qui s'assure qu'un projet est sélectionné
 * avant de rendre les composants enfants qui dépendent de useCurrentProject().
 */
export function ProjectGuard({ children, fallback }: ProjectGuardProps) {
  const { currentProject, isLoading } = useProjectStore();

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      )
    );
  }

  if (!currentProject) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Aucun projet sélectionné
            </h2>
            <p className="text-gray-600">
              Veuillez sélectionner un projet pour accéder à cette
              fonctionnalité.
            </p>
            <a
              href="/projects"
              className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Voir les projets
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
