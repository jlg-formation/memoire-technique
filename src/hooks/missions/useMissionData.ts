import type {
  MissionEstimation,
  ParticipatingCompany,
  MobilizedPerson,
  Project,
} from "../../types/project";
import { findMissionCategory } from "../../lib/missions/categoryHelpers";

export function useMissionData(currentProject: Project | null) {
  const missionEstimation: MissionEstimation =
    currentProject?.missionEstimations ?? {
      base: {},
      pse: {},
      tranchesConditionnelles: {},
      variantes: {},
    };

  // Debug logs
  console.log("🔍 Hook useMissionData - missionEstimation:", missionEstimation);
  console.log(
    "🔍 Hook useMissionData - currentProject?.missionEstimations:",
    currentProject?.missionEstimations,
  );

  const missionCategories = currentProject?.missions;
  const companies = currentProject?.participatingCompanies ?? [];
  const worksAmount = currentProject?.worksAmount ?? 0;

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
      missionEstimation[category]?.[missionId]?.[companyId]?.[personId]
        ?.nombreDeJours ?? 0
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
      missionEstimation[category]?.[missionId]?.[companyId]?.[personId]
        ?.justification ?? ""
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
