import type {
  MissionEstimation,
  ParticipatingCompany,
  MobilizedPerson,
  Project,
} from "../../types/project";

export function useMissionData(currentProject: Project | null) {
  const missionEstimation: MissionEstimation =
    currentProject?.missionEstimations ?? {};
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
  ): number =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.nombreDeJours ?? 0;

  const getJustification = (
    missionId: string,
    companyId: string,
    personId: string,
  ): string =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.justification ?? "";

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
