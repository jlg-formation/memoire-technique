import { useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { estimateMissionDaysWithCategories } from "../../lib/OpenAI";
import type {
  CategoryPercentages,
  MissionCategories,
} from "../../types/project";

export function useMissionEstimation() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [estimating, setEstimating] = useState(false);

  // Initialiser les pourcentages par catégorie avec des valeurs par défaut
  const categoryPercentages = currentProject?.categoryPercentages || {};

  const updateCategoryPercentage = (
    category: keyof CategoryPercentages,
    percentage: number,
  ) => {
    const updated: CategoryPercentages = {
      ...categoryPercentages,
      [category]: percentage,
    };
    updateCurrentProject({ categoryPercentages: updated });
  };

  const handleEstimate = async (
    missionCategories: MissionCategories,
  ): Promise<void> => {
    setEstimating(true);
    try {
      if (!missionCategories) {
        throw new Error("Aucune catégorie de missions disponible");
      }

      if (!currentProject) {
        throw new Error("Aucun projet courant disponible");
      }

      // Note: Dans la nouvelle approche en pipeline, les validations et calculs
      // sont faits directement dans le pipeline, mais on garde les vérifications
      // basiques ici pour s'assurer que les données sont cohérentes

      if (missionCategories.base.length > 0 && !categoryPercentages.base) {
        throw new Error("Pourcentage manquant pour les missions de base");
      }

      if (missionCategories.pse.length > 0 && !categoryPercentages.pse) {
        throw new Error("Pourcentage manquant pour les PSE");
      }

      if (
        missionCategories.tranchesConditionnelles.length > 0 &&
        !categoryPercentages.tranchesConditionnelles
      ) {
        throw new Error(
          "Pourcentage manquant pour les tranches conditionnelles",
        );
      }

      if (
        missionCategories.variantes.length > 0 &&
        !categoryPercentages.variantes
      ) {
        throw new Error("Pourcentage manquant pour les variantes");
      }

      // Utiliser la nouvelle version qui prend seulement le projet
      const missionEstimations =
        await estimateMissionDaysWithCategories(currentProject);

      console.log("📋 Résultat de l'estimation:", missionEstimations);
      console.log(
        "📊 Données avant mise à jour:",
        currentProject.missionEstimations,
      );

      updateCurrentProject({ missionEstimations });

      console.log("✅ Projet mis à jour avec les nouvelles estimations");
    } catch (err) {
      console.error(err);
    }
    setEstimating(false);
  };

  return {
    currentProject,
    updateCurrentProject,
    categoryPercentages,
    updateCategoryPercentage,
    estimating,
    handleEstimate,
  };
}
