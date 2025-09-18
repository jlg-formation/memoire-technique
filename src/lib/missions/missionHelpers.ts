import type { Mission, MissionCategories } from "../../types/project";

/**
 * Obtient toutes les missions d'un objet MissionCategories
 */
export const getAllMissions = (
  missionCategories?: MissionCategories,
): Mission[] => {
  if (!missionCategories) return [];

  return [
    ...missionCategories.base,
    ...missionCategories.pse,
    ...missionCategories.tranchesConditionnelles,
    ...missionCategories.variantes,
  ];
};
