import { useCurrentProject } from "../../store/useCurrentProjectStore";
import type { ProjectEstimation } from "../../types/project";
import { findMissionCategory } from "../../lib/missions/categoryHelpers";

export function useMissionChanges(projectEstimation: ProjectEstimation) {
  const { updateCurrentProject, currentProject } = useCurrentProject();

  const handleChange = (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ): void => {
    const category = findMissionCategory(missionId, currentProject.missions);
    if (!category) return;

    const updated: ProjectEstimation = {
      ...projectEstimation,
      [category]: {
        ...projectEstimation[category],
        missions: {
          ...projectEstimation[category]?.missions,
          [missionId]: {
            ...projectEstimation[category]?.missions?.[missionId],
            companies: {
              ...projectEstimation[category]?.missions?.[missionId]?.companies,
              [companyId]: {
                ...projectEstimation[category]?.missions?.[missionId]
                  ?.companies?.[companyId],
                persons: {
                  ...projectEstimation[category]?.missions?.[missionId]
                    ?.companies?.[companyId]?.persons,
                  [personId]: {
                    ...projectEstimation[category]?.missions?.[missionId]
                      ?.companies?.[companyId]?.persons?.[personId],
                    nombreDeJours: days,
                  },
                },
              },
            },
          },
        },
      },
    };
    updateCurrentProject({ projectEstimation: updated });
  };

  const handleJustificationChange = (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ): void => {
    const category = findMissionCategory(missionId, currentProject.missions);
    if (!category) return;

    const updated: ProjectEstimation = {
      ...projectEstimation,
      [category]: {
        ...projectEstimation[category],
        missions: {
          ...projectEstimation[category]?.missions,
          [missionId]: {
            ...projectEstimation[category]?.missions?.[missionId],
            companies: {
              ...projectEstimation[category]?.missions?.[missionId]?.companies,
              [companyId]: {
                ...projectEstimation[category]?.missions?.[missionId]
                  ?.companies?.[companyId],
                persons: {
                  ...projectEstimation[category]?.missions?.[missionId]
                    ?.companies?.[companyId]?.persons,
                  [personId]: {
                    ...projectEstimation[category]?.missions?.[missionId]
                      ?.companies?.[companyId]?.persons?.[personId],
                    justification: text,
                  },
                },
              },
            },
          },
        },
      },
    };
    updateCurrentProject({ projectEstimation: updated });
  };

  const handleMissionDescriptionChange = (
    missionId: string,
    description: string,
  ): void => {
    if (!currentProject.missions) return;

    const updatedMissions = { ...currentProject.missions };

    // Trouve la catégorie contenant la mission
    const category = findMissionCategory(missionId, currentProject.missions);
    if (!category) return;

    // Met à jour la description de la mission dans la catégorie appropriée
    updatedMissions[category] = updatedMissions[category].map((mission) =>
      mission.id === missionId ? { ...mission, description } : mission,
    );

    updateCurrentProject({ missions: updatedMissions });
  };

  return {
    handleChange,
    handleJustificationChange,
    handleMissionDescriptionChange,
  };
}
