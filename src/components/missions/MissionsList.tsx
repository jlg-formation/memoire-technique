import type {
  MissionCategories,
  ParticipatingCompany,
  MobilizedPerson,
} from "../../types/project";

// Import du composant existant renderMissionCategory pour maintenir la compatibilité
import { renderMissionCategory } from "./MissionCategoryRenderer.tsx";

interface MissionsListProps {
  missionCategories: MissionCategories;
  companies: ParticipatingCompany[];
  missionTotal: (missionId: string) => number;
  getDays: (missionId: string, companyId: string, personId: string) => number;
  handleChange: (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ) => void;
  getJustification: (
    missionId: string,
    companyId: string,
    personId: string,
  ) => string;
  handleJustificationChange: (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ) => void;
  personCost: (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ) => number;
  estimating: boolean;
}

export default function MissionsList({
  missionCategories,
  companies,
  missionTotal,
  getDays,
  handleChange,
  getJustification,
  handleJustificationChange,
  personCost,
  estimating,
}: MissionsListProps) {
  return (
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
    </div>
  );
}
