import type { MissionEstimation, Project } from "../../types/project";
import { estimateMissionDaysWithCategoriesPipeline } from "./missionEstimationPipeline";

export type MissionDayEstimation = {
  [mission: string]: {
    [companyId: string]: {
      [personId1: string]: {
        nombreDeJours: number;
        justification: string;
      };
    };
  };
};

export interface CategoryTargetAmounts {
  base?: number;
  pse?: number;
  tranchesConditionnelles?: number;
  variantes?: number;
}

/**
 * Fonction principale d'estimation des missions basée sur le pipeline en 6 étapes
 * conformément à la spécification 12-spec_estimation_project.md
 *
 * Étapes implémentées selon la spec :
 * 1. Initialisation de la structure (analyzeProjectSpecifics)
 * 2. Intégration des contraintes (applyConstraintsAndOptimize)
 * 3. Allocation brute (generateBaseBudgetAllocation)
 * 4. Vérification et ajustement (validateAndAdjustPercentages)
 * 5. Justifications (generateDetailedJustifications)
 * 6. Synthèse finale (intégrée dans les étapes précédentes)
 *
 * @param currentProject - Projet contenant missions, entreprises, pourcentages et contraintes
 * @returns Promise<MissionEstimation> - Estimation détaillée avec jours et justifications
 */
export async function estimateMissionDaysWithCategories(
  currentProject: Project,
): Promise<MissionEstimation> {
  console.log("🚀 Estimation des missions avec le pipeline conforme à la spec");

  try {
    // Appel du pipeline principal qui implémente les 6 étapes de la spécification
    const result =
      await estimateMissionDaysWithCategoriesPipeline(currentProject);

    console.log("✅ Estimation terminée avec succès");
    return result;
  } catch (error) {
    console.error("❌ Erreur lors de l'estimation des missions:", error);
    throw error;
  }
}
