import { renderMissionCategory } from "./MissionCategoryRenderer";
import { useMissionData } from "../../hooks/missions/useMissionData";
import { useMissionChanges } from "../../hooks/missions/useMissionChanges";
import { useMissionEstimation } from "../../hooks/missions/useMissionEstimation";
import { useProjectStore } from "../../store/useProjectStore";
import {
  missionTotalWithConstraints,
  personCost,
} from "../../lib/missions/missionCalculations";
import type {
  MissionEstimation,
  MissionCategories,
  MissionPriceConstraint,
  MobilizedPerson,
  ParticipatingCompany,
} from "../../types/project";

interface MissionCategoriesDisplayProps {
  missionEstimation: MissionEstimation;
  constraints: MissionPriceConstraint[];
  onUpdateConstraints: (constraints: MissionPriceConstraint[]) => void;
}

interface CategoryConfig {
  key: keyof MissionCategories;
  label: string;
  color: string;
}

// Configuration centralisée des catégories
const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    key: "base",
    label: "Missions de Base",
    color: "bg-blue-100 text-blue-700",
  },
  {
    key: "pse",
    label: "Prestations Supplémentaires Éventuelles (PSE)",
    color: "bg-amber-100 text-amber-700",
  },
  {
    key: "tranchesConditionnelles",
    label: "Tranches Conditionnelles",
    color: "bg-purple-100 text-purple-700",
  },
  {
    key: "variantes",
    label: "Variantes",
    color: "bg-green-100 text-green-700",
  },
];

export function MissionCategoriesDisplay({
  missionEstimation,
  constraints,
  onUpdateConstraints,
}: MissionCategoriesDisplayProps) {
  const { currentProject } = useProjectStore();

  // Utilisation des hooks existants pour récupérer les données et fonctions
  const { missionCategories, companies, getDays, getJustification } =
    useMissionData(currentProject);

  const {
    handleChange,
    handleJustificationChange,
    handleMissionDescriptionChange,
  } = useMissionChanges(missionEstimation);

  const { estimating } = useMissionEstimation();

  // Définitions des fonctions de calcul (reprises de Missions.tsx)
  const getMissionTotal = (missionId: string) =>
    missionTotalWithConstraints(missionId, companies, getDays, constraints);

  const getPersonCost = (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ) => personCost(missionId, company, person, getDays);

  // Si pas de catégories de missions, ne rien afficher
  if (!missionCategories) {
    return null;
  }

  return (
    <>
      {CATEGORY_CONFIG.map((categoryConfig) => {
        const categoryMissions = missionCategories[categoryConfig.key] || [];

        return renderMissionCategory(
          categoryConfig.label,
          categoryMissions,
          categoryConfig.color,
          getMissionTotal,
          companies,
          getDays,
          handleChange,
          getJustification,
          handleJustificationChange,
          getPersonCost,
          estimating,
          constraints,
          onUpdateConstraints,
          currentProject?.recommendedPercentages,
          categoryConfig.key,
          handleMissionDescriptionChange,
        );
      })}
    </>
  );
}
