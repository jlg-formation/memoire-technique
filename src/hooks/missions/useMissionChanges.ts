import { useProjectStore } from "../../store/useProjectStore";
import type { MissionEstimation } from "../../types/project";
import { findMissionCategory } from "../../lib/missions/categoryHelpers";

export function useMissionChanges(missionEstimation: MissionEstimation) {
  const { updateCurrentProject, currentProject } = useProjectStore();

  const handleChange = (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ): void => {
    const category = findMissionCategory(missionId, currentProject?.missions);
    if (!category) return;

    const updated: MissionEstimation = {
      ...missionEstimation,
      [category]: {
        ...(missionEstimation[category] ?? {}),
        [missionId]: {
          ...(missionEstimation[category]?.[missionId] ?? {}),
          [companyId]: {
            ...(missionEstimation[category]?.[missionId]?.[companyId] ?? {}),
            [personId]: {
              ...(missionEstimation[category]?.[missionId]?.[companyId]?.[
                personId
              ] ?? {}),
              nombreDeJours: days,
            },
          },
        },
      },
    };
    updateCurrentProject({ missionEstimations: updated });
  };

  const handleJustificationChange = (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ): void => {
    const category = findMissionCategory(missionId, currentProject?.missions);
    if (!category) return;

    const updated: MissionEstimation = {
      ...missionEstimation,
      [category]: {
        ...(missionEstimation[category] ?? {}),
        [missionId]: {
          ...(missionEstimation[category]?.[missionId] ?? {}),
          [companyId]: {
            ...(missionEstimation[category]?.[missionId]?.[companyId] ?? {}),
            [personId]: {
              ...(missionEstimation[category]?.[missionId]?.[companyId]?.[
                personId
              ] ?? {}),
              justification: text,
            },
          },
        },
      },
    };
    updateCurrentProject({ missionEstimations: updated });
  };

  return {
    handleChange,
    handleJustificationChange,
  };
}
