import type {
  ParticipatingCompany,
  MobilizedPerson,
  Mission,
} from "../../types/project";

/**
 * Calcule le coût d'une personne pour une mission donnée
 */
export const personCost = (
  missionId: string,
  company: ParticipatingCompany,
  person: MobilizedPerson,
  getDays: (missionId: string, companyId: string, personId: string) => number,
): number =>
  getDays(missionId, company.id, person.id) * (person.dailyRate ?? 0);

/**
 * Calcule le total d'une mission pour toutes les entreprises
 */
export const missionTotal = (
  missionId: string,
  companies: ParticipatingCompany[],
  getDays: (missionId: string, companyId: string, personId: string) => number,
): number => {
  return companies.reduce((total, company) => {
    const people = company.mobilizedPeople ?? [];
    return (
      total +
      people.reduce(
        (sum, p) => sum + personCost(missionId, company, p, getDays),
        0,
      )
    );
  }, 0);
};

/**
 * Calcule le total de toutes les missions
 */
export const allMissionsTotal = (
  missions: Mission[],
  companies: ParticipatingCompany[],
  getDays: (missionId: string, companyId: string, personId: string) => number,
): number => {
  return missions.reduce(
    (sum: number, mission) =>
      sum + missionTotal(mission.id, companies, getDays),
    0,
  );
};
