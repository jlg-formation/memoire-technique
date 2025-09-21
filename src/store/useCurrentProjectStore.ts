import { useProjectStore } from "./useProjectStore";
import type { Project } from "../types/project";

interface UseCurrentProjectReturn {
  currentProject: Project;
  updateCurrentProject: (data: Partial<Project>) => void;
  isLoading: boolean;
}

/**
 * Hook pour accéder au projet courant.
 * Lance une erreur JavaScript si aucun projet n'est sélectionné.
 *
 * @returns {UseCurrentProjectReturn} Le projet courant, la méthode de mise à jour et l'état de chargement
 * @throws {Error} Si aucun projet n'est sélectionné ou si le chargement est en cours
 */
export const useCurrentProject = (): UseCurrentProjectReturn => {
  const { currentProject, updateCurrentProject, isLoading } = useProjectStore();

  if (isLoading) {
    throw new Error("Chargement des projets en cours...");
  }

  if (!currentProject) {
    throw new Error(
      "Aucun projet n'est sélectionné. Veuillez sélectionner un projet avant d'utiliser cette fonctionnalité.",
    );
  }

  return {
    currentProject,
    updateCurrentProject,
    isLoading,
  };
};
