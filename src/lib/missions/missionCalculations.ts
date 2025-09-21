import type {
  ParticipatingCompany,
  MobilizedPerson,
  Mission,
  MissionPriceConstraint,
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
 * Calcule le total d'une mission pour toutes les entreprises en tenant compte des contraintes de prix
 */
export const missionTotalWithConstraints = (
  missionId: string,
  companies: ParticipatingCompany[],
  getDays: (missionId: string, companyId: string, personId: string) => number,
  constraints: MissionPriceConstraint[],
): number => {
  return companies.reduce((total, company) => {
    // Vérifier s'il y a une contrainte de prix pour cette mission/entreprise
    const constraint = constraints.find(
      (c) => c.missionId === missionId && c.companyId === company.id,
    );

    if (constraint) {
      // Si contrainte, utiliser le prix imposé
      return total + constraint.imposedAmount;
    }

    // Sinon, calculer normalement
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

/**
 * Calcule le total de toutes les missions en tenant compte des contraintes de prix
 */
export const allMissionsTotalWithConstraints = (
  missions: Mission[],
  companies: ParticipatingCompany[],
  getDays: (missionId: string, companyId: string, personId: string) => number,
  constraints: MissionPriceConstraint[],
): number => {
  return missions.reduce(
    (sum: number, mission) =>
      sum +
      missionTotalWithConstraints(mission.id, companies, getDays, constraints),
    0,
  );
};
