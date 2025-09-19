import type {
  Mission,
  MissionCategories,
  CategoryPercentages,
  Project,
  ProjectEstimation,
} from "../../types/project";

/**
 * Trouve la catégorie d'une mission par son ID
 */
export const findMissionCategory = (
  missionId: string,
  missionCategories?: MissionCategories,
): keyof MissionCategories | null => {
  if (!missionCategories) return null;

  if (missionCategories.base.some((m) => m.id === missionId)) return "base";
  if (missionCategories.pse.some((m) => m.id === missionId)) return "pse";
  if (missionCategories.tranchesConditionnelles.some((m) => m.id === missionId))
    return "tranchesConditionnelles";
  if (missionCategories.variantes.some((m) => m.id === missionId))
    return "variantes";

  return null;
};

/**
 * Obtient les catégories non vides avec leurs métadonnées
 */
export const getNonEmptyCategories = (currentProject: Project) => {
  const missionCategories = currentProject.missions;
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

/**
 * Calcule le montant en euros d'une mission spécifique
 * basé sur son pourcentage dans la catégorie et le montant global de la catégorie
 */
export const getMissionAmount = (
  worksAmount: number,
  categoryPercentage: number,
  missionPercentageInCategory: number,
): number => {
  const categoryAmount = getCategoryTargetAmount(
    worksAmount,
    categoryPercentage,
  );
  return categoryAmount * (missionPercentageInCategory / 100);
};

/**
 * Met à jour les montants cibles de toutes les catégories dans les estimations de missions
 * basé sur le montant des travaux et les pourcentages de catégories
 */
export const updateTargetAmountsInEstimations = (
  currentEstimations: ProjectEstimation | undefined,
  worksAmount: number,
  categoryPercentages: CategoryPercentages,
): ProjectEstimation => {
  if (!currentEstimations || !worksAmount) {
    // Retourner une structure par défaut si pas d'estimations existantes
    return {
      base: { montantCible: 0, missions: {} },
      pse: { montantCible: 0, missions: {} },
      tranchesConditionnelles: { montantCible: 0, missions: {} },
      variantes: { montantCible: 0, missions: {} },
    };
  }

  const updatedEstimations: ProjectEstimation = {
    base: {
      montantCible: currentEstimations.base?.montantCible ?? 0,
      missions: { ...currentEstimations.base?.missions },
    },
    pse: {
      montantCible: currentEstimations.pse?.montantCible ?? 0,
      missions: { ...currentEstimations.pse?.missions },
    },
    tranchesConditionnelles: {
      montantCible:
        currentEstimations.tranchesConditionnelles?.montantCible ?? 0,
      missions: { ...currentEstimations.tranchesConditionnelles?.missions },
    },
    variantes: {
      montantCible: currentEstimations.variantes?.montantCible ?? 0,
      missions: { ...currentEstimations.variantes?.missions },
    },
  };

  // Mettre à jour le montant cible pour chaque catégorie
  if (categoryPercentages.base !== undefined) {
    updatedEstimations.base.montantCible = getCategoryTargetAmount(
      worksAmount,
      categoryPercentages.base,
    );
  }

  if (categoryPercentages.pse !== undefined) {
    updatedEstimations.pse.montantCible = getCategoryTargetAmount(
      worksAmount,
      categoryPercentages.pse,
    );
  }

  if (categoryPercentages.tranchesConditionnelles !== undefined) {
    updatedEstimations.tranchesConditionnelles.montantCible =
      getCategoryTargetAmount(
        worksAmount,
        categoryPercentages.tranchesConditionnelles,
      );
  }

  if (categoryPercentages.variantes !== undefined) {
    updatedEstimations.variantes.montantCible = getCategoryTargetAmount(
      worksAmount,
      categoryPercentages.variantes,
    );
  }

  return updatedEstimations;
};
