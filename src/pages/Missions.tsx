import InformationPanel from "../components/missions/InformationPanel";
import EstimationPanel from "../components/missions/EstimationPanel";
import TotalSummary from "../components/missions/TotalSummary";
import { MissionCategoriesDisplay } from "../components/missions/MissionCategoriesDisplay";
import MissionHeader from "../components/missions/MissionHeader";
import CCTPDescriptionButton from "../components/missions/CCTPDescriptionButton";
import EmptyState from "../components/missions/states/EmptyState";
import MissingRatesAlert from "../components/missions/states/MissingRatesAlert";
import { Briefcase } from "lucide-react";
import { getNonEmptyCategories } from "../lib/missions/categoryHelpers";
import { allMissionsTotalWithConstraints } from "../lib/missions/missionCalculations";
import { getAllMissions } from "../lib/missions/missionHelpers";
import { useMissionData, useMissionEstimation } from "../hooks/missions";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import type { MissionPriceConstraint } from "../types/project";

export default function Missions() {
  const { currentProject, updateCurrentProject } = useCurrentProject();

  const {
    categoryPercentages,
    updateCategoryPercentage,
    estimating,
    handleEstimate,
  } = useMissionEstimation(currentProject, updateCurrentProject);

  const {
    missionEstimation,
    missionCategories,
    companies,
    worksAmount,
    missingRates,
    getDays,
  } = useMissionData(currentProject);

  const handleUpdateConstraints = (constraints: MissionPriceConstraint[]) => {
    updateCurrentProject({ missionPriceConstraints: constraints });
  };

  const nonEmptyCategories = getNonEmptyCategories(currentProject);
  const missions = getAllMissions(missionCategories);

  if (missingRates.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          <MissionHeader />
          <InformationPanel />
          <MissingRatesAlert missingRates={missingRates} />
        </div>
      </div>
    );
  }

  // Calculs avec les fonctions importées
  const totalAllMissions = allMissionsTotalWithConstraints(
    missions,
    companies,
    getDays,
    currentProject.missionPriceConstraints || [],
  );

  if (!missions.length || !companies.length) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <MissionHeader />
        <InformationPanel />

        {/* Bouton CCTP - placé juste après le panneau informatif */}
        {missionCategories && <CCTPDescriptionButton />}

        <EstimationPanel
          worksAmount={worksAmount}
          categoryPercentages={categoryPercentages}
          nonEmptyCategories={nonEmptyCategories}
          updateCategoryPercentage={updateCategoryPercentage}
          onEstimate={() => handleEstimate(missionCategories!)}
          estimating={estimating}
          allMissionsTotal={totalAllMissions}
        />

        {/* Missions List - Utilise les composants décomposés */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 sm:text-2xl">
            <Briefcase className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            Détail des missions par catégories
          </h2>

          {missionCategories && (
            <MissionCategoriesDisplay
              projectEstimation={missionEstimation}
              constraints={currentProject.missionPriceConstraints || []}
              onUpdateConstraints={handleUpdateConstraints}
            />
          )}
        </div>

        <TotalSummary allMissionsTotal={totalAllMissions} />
      </div>
    </div>
  );
}
