import { useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import {
  estimateMissionDaysWithCategories,
  estimateRecommendedPercentages,
} from "../../lib/OpenAI";
import type { CategoryTargetAmounts } from "../../lib/OpenAI";
import type {
  CategoryPercentages,
  MissionCategories,
  ParticipatingCompany,
} from "../../types/project";
import { getCategoryTargetAmount } from "../../lib/missions";

export function useMissionEstimation() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [estimating, setEstimating] = useState(false);
  const [estimatingPercentages, setEstimatingPercentages] = useState(false);

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

  /**
   * Nouvelle fonction pour estimer les pourcentages recommandés par l'IA
   */
  const handleEstimateRecommendedPercentages = async (
    missionCategories: MissionCategories,
  ): Promise<void> => {
    setEstimatingPercentages(true);
    try {
      if (!missionCategories) {
        throw new Error("Aucune catégorie de missions disponible");
      }

      const aiRecommendedPercentages =
        await estimateRecommendedPercentages(missionCategories);

      updateCurrentProject({ aiRecommendedPercentages });
    } catch (err) {
      console.error("Erreur lors de l'estimation des pourcentages IA:", err);
    }
    setEstimatingPercentages(false);
  };

  const handleEstimate = async (
    missionCategories: MissionCategories,
    companies: ParticipatingCompany[],
    worksAmount: number,
  ): Promise<void> => {
    setEstimating(true);
    try {
      if (!missionCategories) {
        throw new Error("Aucune catégorie de missions disponible");
      }

      // Construire les montants cibles par catégorie
      const categoryTargetAmounts: CategoryTargetAmounts = {};

      if (missionCategories.base.length > 0 && categoryPercentages.base) {
        categoryTargetAmounts.base = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.base,
        );
      }

      if (missionCategories.pse.length > 0 && categoryPercentages.pse) {
        categoryTargetAmounts.pse = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.pse,
        );
      }

      if (
        missionCategories.tranchesConditionnelles.length > 0 &&
        categoryPercentages.tranchesConditionnelles
      ) {
        categoryTargetAmounts.tranchesConditionnelles = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.tranchesConditionnelles,
        );
      }

      if (
        missionCategories.variantes.length > 0 &&
        categoryPercentages.variantes
      ) {
        categoryTargetAmounts.variantes = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.variantes,
        );
      }

      const missionEstimations = await estimateMissionDaysWithCategories(
        missionCategories,
        companies,
        categoryTargetAmounts,
        currentProject?.missionPriceConstraints || [],
        currentProject?.aiRecommendedPercentages,
      );

      updateCurrentProject({ missionEstimations });
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
    estimatingPercentages,
    handleEstimate,
    handleEstimateRecommendedPercentages,
  };
}
