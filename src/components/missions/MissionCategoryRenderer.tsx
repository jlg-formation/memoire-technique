import Accordion from "../ui/Accordion";
import CompanyAccordionWithConstraint from "./CompanyAccordionWithConstraint";
import type {
  Mission,
  ParticipatingCompany,
  MobilizedPerson,
  MissionPriceConstraint,
} from "../../types/project";

// Helper function pour afficher les missions d'une catégorie
export const renderMissionCategory = (
  categoryName: string,
  categoryMissions: Mission[],
  categoryColor: string,
  missionTotal: (missionId: string) => number,
  companies: ParticipatingCompany[],
  getDays: (missionId: string, companyId: string, personId: string) => number,
  handleChange: (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ) => void,
  getJustification: (
    missionId: string,
    companyId: string,
    personId: string,
  ) => string,
  handleJustificationChange: (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ) => void,
  personCost: (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ) => number,
  estimating: boolean,
  constraints: MissionPriceConstraint[],
  onUpdateConstraints: (constraints: MissionPriceConstraint[]) => void,
) => {
  if (categoryMissions.length === 0) return null;

  const categoryTotal = categoryMissions.reduce(
    (sum, mission) => sum + missionTotal(mission.id),
    0,
  );

  return (
    <Accordion
      key={categoryName}
      variant="primary"
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`rounded-lg p-2 ${categoryColor}`}>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-800 sm:text-xl">
              {categoryName}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 sm:text-sm">
              {categoryMissions.length} mission
              {categoryMissions.length > 1 ? "s" : ""}
            </span>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-lg font-bold text-slate-700 sm:px-4 sm:text-xl">
            {categoryTotal.toFixed(2)}&nbsp;€
          </span>
        </div>
      }
    >
      <div className="space-y-3 sm:space-y-4">
        {categoryMissions.map((mission) => (
          <Accordion
            key={mission.id}
            variant="primary"
            title={
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 sm:h-8 sm:w-8 sm:text-sm">
                    {mission.name.charAt(0)}
                  </span>
                  <span className="text-base font-semibold text-slate-800 sm:text-lg">
                    {mission.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-base font-bold text-blue-700 sm:px-3 sm:text-xl">
                    {missionTotal(mission.id).toFixed(2)}&nbsp;€
                  </span>
                </div>
              </div>
            }
          >
            <div className="space-y-3 sm:space-y-4">
              {companies.map((company) => {
                const people = company.mobilizedPeople ?? [];
                const companyTotal = people.reduce(
                  (sum, p) => sum + personCost(mission.id, company, p),
                  0,
                );

                // Vérifier s'il y a une contrainte de prix pour cette mission/entreprise
                const constraint = constraints.find(
                  (c) =>
                    c.missionId === mission.id && c.companyId === company.id,
                );

                return (
                  <CompanyAccordionWithConstraint
                    key={company.id}
                    mission={mission}
                    company={company}
                    companyTotal={companyTotal}
                    constraint={constraint}
                    constraints={constraints}
                    onUpdateConstraints={onUpdateConstraints}
                    people={people}
                    getDays={getDays}
                    handleChange={handleChange}
                    getJustification={getJustification}
                    handleJustificationChange={handleJustificationChange}
                    personCost={personCost}
                    estimating={estimating}
                  />
                );
              })}
            </div>
          </Accordion>
        ))}
      </div>
    </Accordion>
  );
};
