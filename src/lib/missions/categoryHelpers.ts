import type {
  Mission,
  MissionCategories,
  CategoryPercentages,
} from "../../types/project";

/**
 * Obtient les catégories non vides avec leurs métadonnées
 */
export const getNonEmptyCategories = (
  missionCategories?: MissionCategories,
) => {
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

/**
 * Calcule le montant cible d'une catégorie
 */
export const getCategoryTargetAmount = (
  worksAmount: number,
  percentage: number,
): number => {
  return worksAmount * (percentage / 100);
};

/**
 * Calcule le montant cible total de toutes les catégories
 */
export const getTotalTargetAmount = (
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
