import Accordion from "../ui/Accordion";
import CompanyAccordionWithConstraint from "./CompanyAccordionWithConstraint";
import PercentageComparison from "./PercentageComparison";
import { EditableTextArea } from "../ui/EditableTextArea";
import { MissionReestimateButton } from "./MissionReestimateButton";
import { Briefcase } from "lucide-react";
import type {
  Mission,
  ParticipatingCompany,
  MobilizedPerson,
  MissionPriceConstraint,
  RecommendedMissionPercentages,
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
  aiRecommendedPercentages?: RecommendedMissionPercentages,
  categoryKey?: keyof RecommendedMissionPercentages,
  handleMissionDescriptionChange?: (
    missionId: string,
    description: string,
  ) => void,
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
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
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
        {categoryMissions.map((mission) => {
          const missionCost = missionTotal(mission.id);
          const missionPercentage =
            categoryTotal > 0 ? (missionCost / categoryTotal) * 100 : 0;

          // Récupérer l'estimation IA pour cette mission
          const aiEstimation =
            aiRecommendedPercentages && categoryKey
              ? aiRecommendedPercentages[categoryKey]?.[mission.id]
              : undefined;

          return (
            <Accordion
              key={mission.id}
              variant="primary"
              title={
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center justify-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 sm:text-sm">
                      {mission.sigle}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-800 sm:text-lg">
                        {mission.name}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-base font-bold text-blue-700 sm:px-3 sm:text-xl">
                    {missionCost.toFixed(2)}&nbsp;€
                  </span>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Bouton de réestimation IA */}
                {
                  <MissionReestimateButton
                    missionId={mission.id}
                    disabled={estimating}
                  />
                }

                {/* Comparaison des pourcentages en pleine largeur */}
                {aiEstimation && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-3 text-sm font-medium text-slate-700">
                      Comparaison avec l'état de l'art du métier
                    </h4>
                    <PercentageComparison
                      actualPercentage={missionPercentage}
                      aiEstimation={aiEstimation}
                      showCategoryPercentage={true}
                      className="w-full"
                    />
                    {aiEstimation.justification && (
                      <p className="mt-3 text-xs text-slate-600">
                        <strong>Justification IA :</strong>{" "}
                        {aiEstimation.justification}
                      </p>
                    )}
                  </div>
                )}

                {/* Liste des entreprises */}
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
                        c.missionId === mission.id &&
                        c.companyId === company.id,
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
                {/* Description de la mission */}
                {handleMissionDescriptionChange && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <EditableTextArea
                      value={mission.description || ""}
                      onChange={(description) =>
                        handleMissionDescriptionChange(mission.id, description)
                      }
                      placeholder="Saisir la description de la mission..."
                      rows={3}
                      label="Description de la mission"
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            </Accordion>
          );
        })}
      </div>
    </Accordion>
  );
};
