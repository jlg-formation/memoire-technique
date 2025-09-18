import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
// import supprimé, la clé est gérée par la fonction utilitaire
import { estimateMissionDaysWithCategories } from "../lib/OpenAI";
import type { CategoryTargetAmounts } from "../lib/OpenAI";
import type {
  MissionEstimation,
  ParticipatingCompany,
  MobilizedPerson,
  Mission,
  MissionCategories,
  CategoryPercentages,
} from "../types/project";
import { EditableTextArea } from "../components/ui";
import AsyncPrimaryButton from "../components/ui/AsyncPrimaryButton";
import Accordion from "../components/ui/Accordion";

// Helper function pour obtenir toutes les missions d'un objet MissionCategories
const getAllMissions = (missionCategories?: MissionCategories): Mission[] => {
  if (!missionCategories) return [];

  return [
    ...missionCategories.base,
    ...missionCategories.pse,
    ...missionCategories.tranchesConditionnelles,
    ...missionCategories.variantes,
  ];
};

// Helper function pour obtenir les catégories non vides
const getNonEmptyCategories = (missionCategories?: MissionCategories) => {
  if (!missionCategories) return [];

  const categories: Array<{
    key: keyof MissionCategories;
    name: string;
    missions: Mission[];
    color: string;
  }> = [];

  if (missionCategories.base.length > 0) {
    categories.push({
      key: "base",
      name: "Missions de Base",
      missions: missionCategories.base,
      color: "bg-blue-100 text-blue-700",
    });
  }

  if (missionCategories.pse.length > 0) {
    categories.push({
      key: "pse",
      name: "Prestations Supplémentaires Éventuelles (PSE)",
      missions: missionCategories.pse,
      color: "bg-amber-100 text-amber-700",
    });
  }

  if (missionCategories.tranchesConditionnelles.length > 0) {
    categories.push({
      key: "tranchesConditionnelles",
      name: "Tranches Conditionnelles",
      missions: missionCategories.tranchesConditionnelles,
      color: "bg-purple-100 text-purple-700",
    });
  }

  if (missionCategories.variantes.length > 0) {
    categories.push({
      key: "variantes",
      name: "Variantes",
      missions: missionCategories.variantes,
      color: "bg-green-100 text-green-700",
    });
  }

  return categories;
};

// Helper function pour calculer le montant cible d'une catégorie
const getCategoryTargetAmount = (
  worksAmount: number,
  percentage: number,
): number => {
  return worksAmount * (percentage / 100);
};

// Helper function pour calculer le montant cible total
const getTotalTargetAmount = (
  worksAmount: number,
  categoryPercentages: CategoryPercentages,
): number => {
  const base = categoryPercentages.base || 0;
  const pse = categoryPercentages.pse || 0;
  const tranchesConditionnelles =
    categoryPercentages.tranchesConditionnelles || 0;
  const variantes = categoryPercentages.variantes || 0;

  const totalPercentage = base + pse + tranchesConditionnelles + variantes;
  return worksAmount * (totalPercentage / 100);
};

// Helper function pour afficher les missions d'une catégorie
const renderMissionCategory = (
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

function Missions() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  // apiKey est maintenant géré par la fonction utilitaire
  const [estimating, setEstimating] = useState(false);

  // Initialiser les pourcentages par catégorie avec des valeurs par défaut
  const categoryPercentages = currentProject?.categoryPercentages || {};
  const nonEmptyCategories = currentProject?.missions
    ? getNonEmptyCategories(currentProject.missions)
    : [];

  const updateCategoryPercentage = (
    category: keyof CategoryPercentages,
    percentage: number,
  ) => {
    const updated: CategoryPercentages = {
      ...categoryPercentages,
      [category]: percentage,
    };
    updateCurrentProject({ categoryPercentages: updated });
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
              <svg
                className="h-4 w-4 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Missions
            </h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base font-semibold text-blue-900 sm:text-lg">
                  Source des missions
                </h3>
                <p className="text-sm leading-relaxed text-blue-800 sm:text-base">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-1 py-1 font-semibold sm:px-2">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-3 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 text-red-600 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-900 sm:text-lg">
                  Aucun projet sélectionné
                </h3>
                <p className="text-sm text-red-800 sm:text-base">
                  Veuillez sélectionner un projet pour consulter les missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const missionEstimation: MissionEstimation =
    currentProject.missionEstimations ?? {};
  const missionCategories = currentProject.missions;
  const missions = getAllMissions(missionCategories);
  const companies = currentProject.participatingCompanies ?? [];
  const worksAmount = currentProject.worksAmount ?? 0;
  const totalTargetAmount = getTotalTargetAmount(
    worksAmount,
    categoryPercentages,
  );
  const missingRates = companies.flatMap((company) =>
    (company.mobilizedPeople ?? []).filter((p) => !p.dailyRate),
  );

  if (missingRates.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
              <svg
                className="h-4 w-4 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Missions
            </h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base font-semibold text-blue-900 sm:text-lg">
                  Source des missions
                </h3>
                <p className="text-sm leading-relaxed text-blue-800 sm:text-base">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-1 py-1 font-semibold sm:px-2">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Missing Rates Warning */}
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base font-semibold text-amber-900 sm:text-lg">
                  Taux journaliers manquants
                </h3>
                <p className="text-sm text-amber-800 sm:text-base">
                  Les personnes suivantes n'ont pas de taux journalier (TUJ)
                  défini. Rendez-vous dans la page "Équipes" pour compléter ces
                  informations.
                </p>
                <div className="space-y-2">
                  {missingRates.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2 sm:gap-3 sm:p-3"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800 sm:h-8 sm:w-8">
                        {p.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")}
                      </div>
                      <span className="text-sm font-medium text-amber-900 sm:text-base">
                        {p.name}
                      </span>
                      <span className="rounded bg-amber-50 px-1 py-1 text-xs text-amber-700 sm:px-2 sm:text-sm">
                        TUJ manquant
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const getDays = (
    missionId: string,
    companyId: string,
    personId: string,
  ): number =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.nombreDeJours ?? 0;

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

  const getJustification = (
    missionId: string,
    companyId: string,
    personId: string,
  ): string =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.justification ?? "";

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

  const personCost = (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ): number =>
    getDays(missionId, company.id, person.id) * (person.dailyRate ?? 0);

  const missionTotal = (missionId: string): number => {
    return companies.reduce((total, company) => {
      const people = company.mobilizedPeople ?? [];
      return (
        total +
        people.reduce((sum, p) => sum + personCost(missionId, company, p), 0)
      );
    }, 0);
  };

  const allMissionsTotal = missions.reduce(
    (sum: number, mission) => sum + missionTotal(mission.id),
    0,
  );

  const handleEstimate = async (): Promise<void> => {
    setEstimating(true);
    try {
      if (!missionCategories) {
        throw new Error("Aucune catégorie de missions disponible");
      }

      // Construire les montants cibles par catégorie
      const categoryTargetAmounts: CategoryTargetAmounts = {};

      if (missionCategories.base.length > 0 && categoryPercentages.base) {
        categoryTargetAmounts.base = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.base,
        );
      }

      if (missionCategories.pse.length > 0 && categoryPercentages.pse) {
        categoryTargetAmounts.pse = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.pse,
        );
      }

      if (
        missionCategories.tranchesConditionnelles.length > 0 &&
        categoryPercentages.tranchesConditionnelles
      ) {
        categoryTargetAmounts.tranchesConditionnelles = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.tranchesConditionnelles,
        );
      }

      if (
        missionCategories.variantes.length > 0 &&
        categoryPercentages.variantes
      ) {
        categoryTargetAmounts.variantes = getCategoryTargetAmount(
          worksAmount,
          categoryPercentages.variantes,
        );
      }

      // Utiliser la nouvelle fonction avec les catégories
      const result = await estimateMissionDaysWithCategories(
        missionCategories,
        companies,
        categoryTargetAmounts,
      );

      updateCurrentProject({
        missionEstimations: result,
      });
    } catch (err) {
      console.error(err);
    }
    setEstimating(false);
  };

  if (!missions.length || !companies.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
              <svg
                className="h-4 w-4 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Missions
            </h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                <svg
                  className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base font-semibold text-blue-900 sm:text-lg">
                  Source des missions
                </h3>
                <p className="text-sm leading-relaxed text-blue-800 sm:text-base">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-1 py-1 font-semibold sm:px-2">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4 text-center shadow-sm sm:p-8">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
                <svg
                  className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-lg font-semibold text-slate-700 sm:text-xl">
                  Aucune donnée disponible
                </h3>
                <p className="text-sm text-slate-600 sm:text-base">
                  Aucune mission ou entreprise n'a été détectée dans votre
                  projet.
                  <br />
                  Importez l'Acte d'Engagement pour extraire les missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
            <svg
              className="h-4 w-4 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Missions
          </h1>
        </div>

        {/* Information Panel */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base font-semibold text-blue-900 sm:text-lg">
                Source des missions
              </h3>
              <p className="text-sm leading-relaxed text-blue-800 sm:text-base">
                Les missions ci-dessous sont extraites automatiquement de l'
                <span className="rounded bg-blue-100 px-1 py-1 font-semibold sm:px-2">
                  Acte d'Engagement (AE)
                </span>
                que vous fournissez dans la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Estimation Panel */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-3 shadow-sm sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900 sm:text-xl">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Estimation financière
            </h3>

            {/* Montant des travaux */}
            <div className="rounded-lg border border-emerald-100 bg-white p-4 sm:p-6">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Montant global des travaux
              </label>
              <div className="text-2xl font-bold text-emerald-700 sm:text-3xl">
                {worksAmount.toLocaleString()}&nbsp;€
              </div>
            </div>

            {/* Pourcentages par catégorie */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-emerald-800 sm:text-lg">
                Pourcentages par catégorie de missions
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {nonEmptyCategories.map((category) => {
                  const percentage = categoryPercentages[category.key] || 0;
                  const targetAmount = getCategoryTargetAmount(
                    worksAmount,
                    percentage,
                  );

                  return (
                    <div
                      key={category.key}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`rounded-lg p-2 ${category.color}`}>
                          <svg
                            className="h-4 w-4"
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
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-slate-800">
                            {category.name}
                          </h5>
                          <p className="text-xs text-slate-500">
                            {category.missions.length} mission
                            {category.missions.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Pourcentage de l'offre
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={percentage}
                              onChange={(e) =>
                                updateCategoryPercentage(
                                  category.key,
                                  Number(e.target.value),
                                )
                              }
                              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                              placeholder="0.00"
                            />
                            <span className="text-sm font-medium text-slate-600">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Montant cible
                          </label>
                          <div className="text-lg font-bold text-emerald-700">
                            {targetAmount.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                            &nbsp;€
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total des pourcentages et montants */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">
                      Pourcentage total
                    </label>
                    <div className="text-xl font-bold text-emerald-700">
                      {Object.values(categoryPercentages)
                        .reduce((sum, p) => sum + (p || 0), 0)
                        .toFixed(2)}
                      &nbsp;%
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">
                      Montant cible total
                    </label>
                    <div className="text-xl font-bold text-emerald-700">
                      {totalTargetAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                      &nbsp;€
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimation IA */}
            <div className="rounded-lg border border-blue-200 bg-white p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="flex items-center gap-2 text-base font-semibold text-blue-900 sm:text-lg">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">
                    Estimation par Intelligence Artificielle
                  </span>
                </h4>
                <AsyncPrimaryButton
                  onClick={handleEstimate}
                  disabled={estimating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-6"
                >
                  {estimating ? "Estimation..." : "Estimer par IA"}
                </AsyncPrimaryButton>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                    Montant estimé IA
                  </label>
                  <div className="text-xl font-bold text-blue-700 sm:text-2xl">
                    {estimating
                      ? "Calcul..."
                      : `${allMissionsTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}\u00A0€`}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                    Pourcentage obtenu
                  </label>
                  <div className="text-xl font-bold text-blue-700 sm:text-2xl">
                    {estimating
                      ? "..."
                      : `${((allMissionsTotal / worksAmount) * 100).toFixed(2)}\u00A0%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 sm:text-2xl">
            <svg
              className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
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
            Détail des missions par catégories
          </h2>

          {missionCategories && (
            <>
              {renderMissionCategory(
                "Missions de Base",
                missionCategories.base || [],
                "bg-blue-100 text-blue-700",
                missionTotal,
                companies,
                getDays,
                handleChange,
                getJustification,
                handleJustificationChange,
                personCost,
                estimating,
              )}

              {renderMissionCategory(
                "Prestations Supplémentaires Éventuelles (PSE)",
                missionCategories.pse || [],
                "bg-amber-100 text-amber-700",
                missionTotal,
                companies,
                getDays,
                handleChange,
                getJustification,
                handleJustificationChange,
                personCost,
                estimating,
              )}

              {renderMissionCategory(
                "Tranches Conditionnelles",
                missionCategories.tranchesConditionnelles || [],
                "bg-purple-100 text-purple-700",
                missionTotal,
                companies,
                getDays,
                handleChange,
                getJustification,
                handleJustificationChange,
                personCost,
                estimating,
              )}

              {renderMissionCategory(
                "Variantes",
                missionCategories.variantes || [],
                "bg-green-100 text-green-700",
                missionTotal,
                companies,
                getDays,
                handleChange,
                getJustification,
                handleJustificationChange,
                personCost,
                estimating,
              )}
            </>
          )}
        </div>

        {/* Total Summary */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-3 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 sm:text-xl">
              <svg
                className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Total général
            </h3>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-2xl font-bold text-slate-800 shadow-sm sm:px-6 sm:py-3 sm:text-3xl">
              {allMissionsTotal.toFixed(2)}&nbsp;€
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Missions;
