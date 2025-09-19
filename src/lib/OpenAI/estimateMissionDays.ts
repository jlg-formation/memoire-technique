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
 * Version refactorisée utilisant le pipeline en 4 étapes séquentielles
 * pour une meilleure qualité de génération et une approche plus robuste
 */
export async function estimateMissionDaysWithCategories(
  currentProject: Project,
): Promise<MissionEstimation> {
  return estimateMissionDaysWithCategoriesPipeline(currentProject);
}
