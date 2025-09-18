import { useProjectStore } from "../../store/useProjectStore";
import type { MissionEstimation } from "../../types/project";

export function useMissionChanges(missionEstimation: MissionEstimation) {
  const { updateCurrentProject } = useProjectStore();

  const handleChange = (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ): void => {
    const updated: MissionEstimation = {
      ...missionEstimation,
      [missionId]: {
        ...(missionEstimation[missionId] ?? {}),
        [companyId]: {
          ...(missionEstimation[missionId]?.[companyId] ?? {}),
          [personId]: {
            ...(missionEstimation[missionId]?.[companyId]?.[personId] ?? {}),
            nombreDeJours: days,
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
    const updated: MissionEstimation = {
      ...missionEstimation,
      [missionId]: {
        ...(missionEstimation[missionId] ?? {}),
        [companyId]: {
          ...(missionEstimation[missionId]?.[companyId] ?? {}),
          [personId]: {
            ...(missionEstimation[missionId]?.[companyId]?.[personId] ?? {}),
            justification: text,
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
