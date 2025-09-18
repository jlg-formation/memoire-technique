import InformationPanel from "../components/missions/InformationPanel";
import EstimationPanel from "../components/missions/EstimationPanel";
import TotalSummary from "../components/missions/TotalSummary";
import { MissionCategoriesDisplay } from "../components/missions/MissionCategoriesDisplay";
import MissionHeader from "../components/missions/MissionHeader";
import EmptyState from "../components/missions/states/EmptyState";
import MissingRatesAlert from "../components/missions/states/MissingRatesAlert";
import NoProjectSelected from "../components/missions/states/NoProjectSelected";
import { getNonEmptyCategories } from "../lib/missions/categoryHelpers";
import { allMissionsTotal } from "../lib/missions/missionCalculations";
import { getAllMissions } from "../lib/missions/missionHelpers";
import { useMissionData, useMissionEstimation } from "../hooks/missions";
import { useProjectStore } from "../store/useProjectStore";

export default function Missions() {
  const { currentProject } = useProjectStore();
  const {
    categoryPercentages,
    updateCategoryPercentage,
    estimating,
    handleEstimate,
  } = useMissionEstimation();

  const {
    missionEstimation,
    missionCategories,
    companies,
    worksAmount,
    missingRates,
    getDays,
  } = useMissionData(currentProject);

  if (!currentProject) {
    return <NoProjectSelected />;
  }

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
  const totalAllMissions = allMissionsTotal(missions, companies, getDays);

  if (!missions.length || !companies.length) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <MissionHeader />
        <InformationPanel />

        <EstimationPanel
          worksAmount={worksAmount}
          categoryPercentages={categoryPercentages}
          nonEmptyCategories={nonEmptyCategories}
          updateCategoryPercentage={updateCategoryPercentage}
          onEstimate={() =>
            handleEstimate(missionCategories!, companies, worksAmount)
          }
          estimating={estimating}
          allMissionsTotal={totalAllMissions}
        />

        {/* Missions List - Utilise les composants décomposés */}
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
            <MissionCategoriesDisplay missionEstimation={missionEstimation} />
          )}
        </div>

        <TotalSummary allMissionsTotal={totalAllMissions} />
      </div>
    </div>
  );
}
