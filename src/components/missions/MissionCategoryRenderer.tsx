import Accordion from "../ui/Accordion";
import { EditableTextArea } from "../ui";
import type {
  Mission,
  ParticipatingCompany,
  MobilizedPerson,
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
                return (
                  <Accordion
                    key={company.id}
                    variant="secondary"
                    title={
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-700 sm:h-6 sm:w-6">
                            {company.name.charAt(0)}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 sm:text-base">
                            {company.name}
                          </span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700 sm:px-3 sm:text-lg">
                          {companyTotal.toFixed(2)}&nbsp;€
                        </span>
                      </div>
                    }
                  >
                    <div className="space-y-2 sm:space-y-3">
                      {people.map((person) => {
                        const days = getDays(mission.id, company.id, person.id);
                        const cost = personCost(mission.id, company, person);
                        const justification = getJustification(
                          mission.id,
                          company.id,
                          person.id,
                        );
                        return (
                          <Accordion
                            key={person.id}
                            variant="tertiary"
                            title={
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800 sm:h-8 sm:w-8">
                                    {person.name
                                      .split(" ")
                                      .map((n) => n.charAt(0))
                                      .join("")}
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 sm:text-base">
                                    {person.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-3">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <input
                                      type="number"
                                      className="w-12 rounded border border-slate-300 px-1 py-1 text-right text-xs focus:border-amber-400 focus:ring-2 focus:ring-amber-400 sm:w-16 sm:px-2 sm:text-sm"
                                      value={days}
                                      onChange={(e) =>
                                        handleChange(
                                          mission.id,
                                          company.id,
                                          person.id,
                                          Number(e.target.value),
                                        )
                                      }
                                      disabled={estimating}
                                    />
                                    <span className="hidden text-xs text-slate-500 sm:inline">
                                      jours
                                    </span>
                                    <span className="text-xs text-slate-500 sm:hidden">
                                      j
                                    </span>
                                  </div>
                                  <div className="rounded bg-slate-50 px-1 py-1 text-xs text-slate-600 sm:px-2 sm:text-sm">
                                    {person.dailyRate ?? 0}&nbsp;€/j
                                  </div>
                                  <div className="rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700 sm:px-3 sm:text-lg">
                                    {cost.toFixed(2)}&nbsp;€
                                  </div>
                                </div>
                              </div>
                            }
                          >
                            <div className="mt-2 sm:mt-3">
                              <label className="mb-1 block text-xs font-medium text-slate-600 sm:mb-2 sm:text-sm">
                                Justification du nombre de jours
                              </label>
                              <EditableTextArea
                                value={justification}
                                onChange={(value) =>
                                  handleJustificationChange(
                                    mission.id,
                                    company.id,
                                    person.id,
                                    value,
                                  )
                                }
                                placeholder="Expliquez pourquoi ce nombre de jours est nécessaire pour cette mission..."
                                className="min-h-[60px] w-full resize-none rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400 sm:min-h-[80px] sm:px-3"
                              />
                            </div>
                          </Accordion>
                        );
                      })}
                    </div>
                  </Accordion>
                );
              })}
            </div>
          </Accordion>
        ))}
      </div>
    </Accordion>
  );
};
