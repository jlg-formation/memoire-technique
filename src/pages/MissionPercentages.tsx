import { ArrowLeft, BarChart3, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonPrimary } from "../components/ui";
import AsyncPrimaryButton from "../components/ui/AsyncPrimaryButton";
import {
  getMissionAmount,
  getNonEmptyCategories,
} from "../lib/missions/categoryHelpers";
import { estimateRecommendedPercentages } from "../lib/OpenAI";
import { useCurrentProject } from "../store/useCurrentProjectStore";
import type {
  CategoryMissionPercentages,
  CategoryPercentages,
  RecommendedMissionPercentages,
} from "../types/project";

// Type pour les pourcentages en cours d'édition (valeurs locales)
interface MissionPercentageInput {
  [missionId: string]: number;
}

// Type pour les valeurs en cours de saisie (chaînes)
interface MissionPercentageStringInput {
  [missionId: string]: string;
}

interface CategoryMissionPercentageInputs {
  base: MissionPercentageInput;
  pse: MissionPercentageInput;
  tranchesConditionnelles: MissionPercentageInput;
  variantes: MissionPercentageInput;
}

interface CategoryMissionPercentageStringInputs {
  base: MissionPercentageStringInput;
  pse: MissionPercentageStringInput;
  tranchesConditionnelles: MissionPercentageStringInput;
  variantes: MissionPercentageStringInput;
}

export default function MissionPercentages() {
  const navigate = useNavigate();
  const { currentProject, updateCurrentProject } = useCurrentProject();
  const [estimating, setEstimating] = useState(false);
  const [localPercentages, setLocalPercentages] =
    useState<CategoryMissionPercentageInputs>({
      base: {},
      pse: {},
      tranchesConditionnelles: {},
      variantes: {},
    });

  // État pour les valeurs en cours de saisie (chaînes de caractères)
  const [inputValues, setInputValues] =
    useState<CategoryMissionPercentageStringInputs>({
      base: {},
      pse: {},
      tranchesConditionnelles: {},
      variantes: {},
    });

  // Fonction utilitaire pour synchroniser les valeurs string avec les valeurs numériques
  const syncInputValues = (percentages: CategoryMissionPercentageInputs) => {
    const stringValues: CategoryMissionPercentageStringInputs = {
      base: {},
      pse: {},
      tranchesConditionnelles: {},
      variantes: {},
    };

    Object.keys(percentages).forEach((categoryKey) => {
      const category = categoryKey as keyof CategoryPercentages;
      Object.keys(percentages[category]).forEach((missionId) => {
        stringValues[category][missionId] =
          percentages[category][missionId].toString();
      });
    });

    setInputValues(stringValues);
  };

  const nonEmptyCategories = useMemo(
    () => getNonEmptyCategories(currentProject),
    [currentProject],
  );

  // Initialiser les pourcentages équitables au montage du composant
  useEffect(() => {
    const initializeEqualPercentages = () => {
      const initialized: CategoryMissionPercentageInputs = {
        base: {},
        pse: {},
        tranchesConditionnelles: {},
        variantes: {},
      };

      nonEmptyCategories.forEach((category) => {
        const missionCount = category.missions.length;
        const equalPercentage = missionCount > 0 ? 100 / missionCount : 0;

        category.missions.forEach((mission) => {
          initialized[category.key][mission.id] = equalPercentage;
        });
      });

      setLocalPercentages(initialized);
      syncInputValues(initialized);
    };

    // Vérifier s'il y a déjà des pourcentages recommandés par l'IA
    if (currentProject.recommendedPercentages) {
      const fromAI: CategoryMissionPercentageInputs = {
        base: {},
        pse: {},
        tranchesConditionnelles: {},
        variantes: {},
      };

      nonEmptyCategories.forEach((category) => {
        const aiCategoryPercentages =
          currentProject.recommendedPercentages?.[category.key];
        if (aiCategoryPercentages) {
          category.missions.forEach((mission) => {
            const aiEstimation = aiCategoryPercentages[mission.id];
            fromAI[category.key][mission.id] =
              aiEstimation?.categoryPercentage || 0;
          });
        }
      });

      setLocalPercentages(fromAI);
      syncInputValues(fromAI);
    } else {
      initializeEqualPercentages();
    }
  }, [currentProject, nonEmptyCategories]);

  // Fonction pour mettre à jour une valeur d'entrée (string)
  const updateInputValue = (
    categoryKey: keyof CategoryPercentages,
    missionId: string,
    value: string,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [missionId]: value,
      },
    }));
  };

  // Fonction pour convertir une valeur string en nombre et mettre à jour les pourcentages
  const commitInputValue = (
    categoryKey: keyof CategoryPercentages,
    missionId: string,
    value: string,
  ) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue)); // Contrainte entre 0 et 100

    setLocalPercentages((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [missionId]: clampedValue,
      },
    }));

    // Synchroniser la valeur string avec la valeur numérique validée
    setInputValues((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [missionId]: clampedValue.toString(),
      },
    }));
  };

  // Calculer le total des pourcentages pour une catégorie
  const getCategoryTotal = (categoryKey: keyof CategoryPercentages): number => {
    return Object.values(localPercentages[categoryKey]).reduce(
      (sum, val) => sum + val,
      0,
    );
  };

  // Fonction pour estimer les pourcentages avec l'IA
  const handleEstimateWithAI = async () => {
    if (!currentProject.missions) return;

    setEstimating(true);
    try {
      const aiRecommendedPercentages = await estimateRecommendedPercentages(
        currentProject.missions,
      );

      // Mettre à jour les pourcentages locaux avec les résultats de l'IA
      const fromAI: CategoryMissionPercentageInputs = {
        base: {},
        pse: {},
        tranchesConditionnelles: {},
        variantes: {},
      };

      nonEmptyCategories.forEach((category) => {
        const aiCategoryPercentages = aiRecommendedPercentages[category.key];
        if (aiCategoryPercentages) {
          category.missions.forEach((mission) => {
            const aiEstimation = aiCategoryPercentages[mission.id];
            fromAI[category.key][mission.id] =
              aiEstimation?.categoryPercentage || 0;
          });
        }
      });

      setLocalPercentages(fromAI);
      syncInputValues(fromAI);

      // Sauvegarder aussi dans le projet
      updateCurrentProject({
        recommendedPercentages: aiRecommendedPercentages,
      });
    } catch (error) {
      console.error("Erreur lors de l'estimation IA:", error);
    }
    setEstimating(false);
  };

  // Fonction pour appliquer les pourcentages et retourner à /missions
  const handleApply = () => {
    // Convertir les pourcentages locaux en format AIRecommendedPercentages
    const aiRecommendedPercentages: RecommendedMissionPercentages = {};

    nonEmptyCategories.forEach((category) => {
      const categoryPercentages: CategoryMissionPercentages = {};

      category.missions.forEach((mission) => {
        const categoryPercentage =
          localPercentages[category.key][mission.id] || 0;

        // Récupérer la justification existante de l'IA si elle existe
        const existingAiEstimation =
          currentProject.recommendedPercentages?.[category.key]?.[mission.id];
        const existingJustification = existingAiEstimation?.justification;

        // Utiliser la justification IA existante ou une justification par défaut
        const justification =
          existingJustification || "Défini manuellement par l'utilisateur";

        // Le pourcentage par rapport au projet sera calculé dans la logique métier
        categoryPercentages[mission.id] = {
          categoryPercentage,
          projectPercentage: 0, // Sera calculé plus tard
          justification,
        };
      });

      if (Object.keys(categoryPercentages).length > 0) {
        aiRecommendedPercentages[category.key] = categoryPercentages;
      }
    });

    updateCurrentProject({ recommendedPercentages: aiRecommendedPercentages });
    navigate("/missions");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/missions")}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Pourcentages par Mission
            </h1>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Instructions :</strong> Définissez les pourcentages de
            chaque mission dans sa catégorie. Les pourcentages de toutes les
            missions d'une même catégorie doivent totaliser 100%.
          </p>
        </div>

        {/* Bouton IA */}
        <div className="flex justify-center">
          <AsyncPrimaryButton
            onClick={handleEstimateWithAI}
            disabled={estimating}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            icon={Sparkles}
          >
            Estimer avec l'IA
          </AsyncPrimaryButton>
        </div>

        {/* Catégories et missions */}
        <div className="space-y-6">
          {nonEmptyCategories.map((category) => {
            const total = getCategoryTotal(category.key);
            const isValid = Math.abs(total - 100) < 0.01; // Tolérance de 0.01%
            const categoryPercentage =
              currentProject.categoryPercentages?.[category.key] || 0;

            return (
              <div
                key={category.key}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category.name}
                  </h3>
                  <div
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${
                      isValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Total: {total.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-4">
                  {category.missions.map((mission) => {
                    const currentPercentage =
                      localPercentages[category.key][mission.id] || 0;

                    // Calculer le montant en euros pour cette mission
                    const missionAmount = currentProject.worksAmount
                      ? getMissionAmount(
                          currentProject.worksAmount,
                          categoryPercentage,
                          currentPercentage,
                        )
                      : 0;

                    // Récupérer la valeur IA et la justification si disponibles
                    const aiCategoryPercentages =
                      currentProject.recommendedPercentages?.[category.key];
                    const aiEstimation = aiCategoryPercentages?.[mission.id];
                    const aiPercentage = aiEstimation?.categoryPercentage;
                    const aiJustification = aiEstimation?.justification;

                    return (
                      <div
                        key={mission.id}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        {/* Ligne du haut : titre et champs de saisie alignés */}
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <label className="flex-1 text-sm font-medium text-gray-700">
                            {mission.name} ({mission.sigle})
                          </label>

                          {/* Champs de saisie et montant alignés à droite */}
                          <div className="flex flex-shrink-0 items-center gap-4">
                            {/* Pourcentage */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="0"
                                value={
                                  inputValues[category.key][mission.id] ||
                                  currentPercentage.toString()
                                }
                                onChange={(e) => {
                                  updateInputValue(
                                    category.key,
                                    mission.id,
                                    e.target.value,
                                  );
                                }}
                                onBlur={(e) => {
                                  commitInputValue(
                                    category.key,
                                    mission.id,
                                    e.target.value,
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    commitInputValue(
                                      category.key,
                                      mission.id,
                                      e.currentTarget.value,
                                    );
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-end text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>

                            {/* Montant en euros */}
                            <div className="w-20 text-right">
                              <div className="text-sm font-semibold text-emerald-700">
                                {missionAmount.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                                &nbsp;€&nbsp;HT
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* Suggestion IA en dessous si disponible */}
                        {aiPercentage !== undefined && (
                          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Suggestion IA: {aiPercentage.toFixed(1)}%
                                </span>
                              </div>
                              {currentProject.worksAmount && (
                                <div className="text-sm font-semibold text-blue-700">
                                  {getMissionAmount(
                                    currentProject.worksAmount,
                                    categoryPercentage,
                                    aiPercentage,
                                  ).toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                  &nbsp;€ HT
                                </div>
                              )}
                            </div>
                            {aiJustification && (
                              <p className="text-xs leading-relaxed text-blue-700">
                                {aiJustification}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/missions")} className="px-6 py-3">
            Annuler
          </Button>
          <ButtonPrimary
            onClick={handleApply}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            Appliquer
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
