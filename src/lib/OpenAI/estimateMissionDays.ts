import type { MissionEstimation, Project } from "../../types/project";

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
 * Stub temporaire - à réimplémenter
 */
export async function estimateMissionDaysWithCategories(
  currentProject: Project,
): Promise<MissionEstimation> {
  // TODO: Réimplémenter cette fonction
  console.log(
    "🔧 Fonction estimateMissionDaysWithCategories appelée (stub temporaire)",
  );
  console.log("currentProject: ", currentProject);

  return {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
  };
}
