import { useProjectStore } from "./useProjectStore";
import type { Project } from "../types/project";

interface UseCurrentProjectReturn {
  currentProject: Project;
  updateCurrentProject: (data: Partial<Project>) => void;
}

/**
 * Hook pour accéder au projet courant.
 * Lance une erreur JavaScript si aucun projet n'est sélectionné.
 *
 * @returns {UseCurrentProjectReturn} Le projet courant et la méthode de mise à jour
 * @throws {Error} Si aucun projet n'est sélectionné
 */
export const useCurrentProject = (): UseCurrentProjectReturn => {
  const { currentProject, updateCurrentProject } = useProjectStore();

  if (!currentProject) {
    throw new Error(
      "Aucun projet n'est sélectionné. Veuillez sélectionner un projet avant d'utiliser cette fonctionnalité.",
    );
  }

  return {
    currentProject,
    updateCurrentProject,
  };
};
