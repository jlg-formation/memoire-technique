import type {
  ProjectEstimation,
  ParticipatingCompany,
  MobilizedPerson,
  Project,
} from "../../types/project";
import { findMissionCategory } from "../../lib/missions/categoryHelpers";

export function useMissionData(currentProject: Project) {
  const missionEstimation: ProjectEstimation =
    currentProject.projectEstimation ?? {
      base: { montantCible: 0, missions: {} },
      pse: { montantCible: 0, missions: {} },
      tranchesConditionnelles: { montantCible: 0, missions: {} },
      variantes: { montantCible: 0, missions: {} },
    };

  const missionCategories = currentProject.missions;
  const companies = currentProject.participatingCompanies ?? [];
  const worksAmount = currentProject.worksAmount ?? 0;

  const missingRates = companies.flatMap((company: ParticipatingCompany) =>
    (company.mobilizedPeople ?? []).filter(
      (p: MobilizedPerson) => !p.dailyRate,
    ),
  );

  const getDays = (
    missionId: string,
    companyId: string,
    personId: string,
  ): number => {
    const category = findMissionCategory(missionId, missionCategories);
    if (!category) return 0;
    return (
      missionEstimation[category]?.missions?.[missionId]?.companies?.[companyId]
        ?.persons?.[personId]?.nombreDeJours ?? 0
    );
  };

  const getJustification = (
    missionId: string,
    companyId: string,
    personId: string,
  ): string => {
    const category = findMissionCategory(missionId, missionCategories);
    if (!category) return "";
    return (
      missionEstimation[category]?.missions?.[missionId]?.companies?.[companyId]
        ?.persons?.[personId]?.justification ?? ""
    );
  };

  return {
    missionEstimation,
    missionCategories,
    companies,
    worksAmount,
    missingRates,
    getDays,
    getJustification,
  };
}
