import { useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import {
  estimateMissionDaysWithCategories,
  performRigorousEstimation,
} from "../../lib/OpenAI";
import { updateTargetAmountsInEstimations } from "../../lib/missions/categoryHelpers";
import type {
  CategoryPercentages,
  MissionCategories,
  ProjectEstimation,
} from "../../types/project";

export function useMissionEstimation() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [estimating, setEstimating] = useState(false);

  // Initialiser les pourcentages par catégorie avec des valeurs par défaut
  const categoryPercentages = currentProject?.categoryPercentages || {};

  const updateCategoryPercentage = (
    category: keyof CategoryPercentages,
    percentage: number,
  ) => {
    const updated: CategoryPercentages = {
      ...categoryPercentages,
      [category]: percentage,
    };

    // Mettre à jour les montants cibles dans les estimations si on a un montant de travaux
    if (currentProject?.worksAmount) {
      const updatedEstimations = updateTargetAmountsInEstimations(
        currentProject.projectEstimation,
        currentProject.worksAmount,
        updated,
      );

      updateCurrentProject({
        categoryPercentages: updated,
        projectEstimation: updatedEstimations,
      });
    } else {
      // Si pas de montant de travaux, mise à jour seulement des pourcentages
      updateCurrentProject({ categoryPercentages: updated });
    }
  };

  const handleEstimate = async (
    missionCategories: MissionCategories,
  ): Promise<void> => {
    setEstimating(true);
    try {
      if (!missionCategories) {
        throw new Error("Aucune catégorie de missions disponible");
      }

      if (!currentProject) {
        throw new Error("Aucun projet courant disponible");
      }

      // Note: Dans la nouvelle approche en pipeline, les validations et calculs
      // sont faits directement dans le pipeline, mais on garde les vérifications
      // basiques ici pour s'assurer que les données sont cohérentes

      if (missionCategories.base.length > 0 && !categoryPercentages.base) {
        throw new Error("Pourcentage manquant pour les missions de base");
      }

      if (missionCategories.pse.length > 0 && !categoryPercentages.pse) {
        throw new Error("Pourcentage manquant pour les PSE");
      }

      if (
        missionCategories.tranchesConditionnelles.length > 0 &&
        !categoryPercentages.tranchesConditionnelles
      ) {
        throw new Error(
          "Pourcentage manquant pour les tranches conditionnelles",
        );
      }

      if (
        missionCategories.variantes.length > 0 &&
        !categoryPercentages.variantes
      ) {
        throw new Error("Pourcentage manquant pour les variantes");
      }

      // Utiliser la nouvelle version qui prend seulement le projet
      const missionEstimations =
        await estimateMissionDaysWithCategories(currentProject);

      console.log("📋 Résultat de l'estimation:", missionEstimations);
      console.log(
        "📊 Données avant mise à jour:",
        currentProject.projectEstimation,
      );

      updateCurrentProject({ projectEstimation: missionEstimations });

      console.log("✅ Projet mis à jour avec les nouvelles estimations");
    } catch (err) {
      console.error(err);
    }
    setEstimating(false);
  };

  const handleReestimateSingleMission = async (
    missionId: string,
  ): Promise<void> => {
    setEstimating(true);
    try {
      if (!currentProject) {
        throw new Error("Aucun projet courant disponible");
      }

      console.log(
        `🎯 Début de la réestimation rigoureuse pour la mission ${missionId}`,
      );

      // Utiliser la nouvelle estimation rigoureuse pour cette mission
      const rigorousEstimation = await performRigorousEstimation(
        currentProject,
        missionId,
      );

      // Récupérer les estimations actuelles
      const currentEstimations = currentProject.projectEstimation || {
        base: { montantCible: 0, missions: {} },
        pse: { montantCible: 0, missions: {} },
        tranchesConditionnelles: { montantCible: 0, missions: {} },
        variantes: { montantCible: 0, missions: {} },
      };

      // Créer une copie des estimations actuelles
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

      // Mettre à jour uniquement la mission réestimée dans toutes les catégories
      Object.keys(rigorousEstimation).forEach((category) => {
        const categoryKey = category as keyof MissionCategories;
        if (rigorousEstimation[categoryKey]?.missions?.[missionId]) {
          updatedEstimations[categoryKey].missions[missionId] =
            rigorousEstimation[categoryKey].missions[missionId];
          console.log(
            `✅ Mission ${missionId} mise à jour dans la catégorie ${categoryKey}`,
          );
        }
      });

      updateCurrentProject({ projectEstimation: updatedEstimations });

      console.log(
        `🎉 Mission ${missionId} réestimée avec succès via l'estimation rigoureuse`,
      );
    } catch (err) {
      console.error(
        "❌ Erreur lors de la réestimation rigoureuse de la mission:",
        err,
      );
      throw err; // Propager l'erreur pour que le bouton puisse l'afficher
    }
    setEstimating(false);
  };

  return {
    currentProject,
    updateCurrentProject,
    categoryPercentages,
    updateCategoryPercentage,
    estimating,
    handleEstimate,
    handleReestimateSingleMission,
  };
}
