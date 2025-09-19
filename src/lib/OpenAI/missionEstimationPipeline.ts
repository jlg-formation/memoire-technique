import type { MissionEstimation, Project } from "../../types/project";

export async function estimateMissionDaysWithCategoriesPipeline(
  project: Project,
): Promise<MissionEstimation> {
  console.log("project: ", project);
  return {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
  };
}
