import { ProgressBar } from "../ui";
import type { MissionPercentageEstimation } from "../../types/project";

interface PercentageComparisonProps {
  /** Pourcentage réel calculé */
  actualPercentage: number;
  /** Estimation IA recommandée (optionnel) */
  aiEstimation?: MissionPercentageEstimation;
  /** Afficher les pourcentages par rapport à la catégorie ou au projet */
  showCategoryPercentage?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant de comparaison entre pourcentages obtenus et attendus
 * Affiche deux barres de progression : une pour l'obtenu, une pour l'attendu
 */
export default function PercentageComparison({
  actualPercentage,
  aiEstimation,
  showCategoryPercentage = true,
  className = "",
}: PercentageComparisonProps) {
  if (!aiEstimation) {
    // Si pas d'estimation IA, afficher seulement la barre réelle
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <ProgressBar
          percentage={actualPercentage}
          barColor="bg-blue-500"
          width="w-20 sm:w-24"
          height="h-1.5"
          showPercentage={true}
        />
      </div>
    );
  }

  const aiPercentage = showCategoryPercentage
    ? aiEstimation.categoryPercentage
    : aiEstimation.projectPercentage;

  // Calculer l'écart entre réel et IA
  const difference = actualPercentage - aiPercentage;

  // Déterminer si l'écart est acceptable (seuil de 5%)
  const isAcceptableDifference = Math.abs(difference) <= 5;

  // Couleurs pour le pourcentage réel
  const actualPercentageColor = isAcceptableDifference
    ? "text-green-600"
    : "text-red-600";
  const actualBarColor = isAcceptableDifference ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre actuelle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-medium text-slate-600">
            Obtenu
          </span>
          <span
            className={`w-12 text-right text-sm font-semibold ${actualPercentageColor}`}
          >
            {actualPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex-1">
          <ProgressBar
            percentage={actualPercentage}
            barColor={actualBarColor}
            width="w-full"
            height="h-2"
            showPercentage={false}
            backgroundColor="bg-slate-200"
          />
        </div>
      </div>

      {/* Barre recommandée par l'IA */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-medium text-slate-600">
            Attendu
          </span>
          <span className="w-12 text-right text-sm font-semibold text-blue-600">
            {aiPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex-1">
          <ProgressBar
            percentage={aiPercentage}
            barColor="bg-blue-500"
            width="w-full"
            height="h-2"
            showPercentage={false}
            backgroundColor="bg-slate-200"
          />
        </div>
      </div>

      {/* Affichage de l'écart (toujours visible) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-medium text-slate-600">
            Écart:
          </span>
          <span
            className={`w-12 text-right text-sm font-semibold ${
              isAcceptableDifference ? "text-slate-600" : "text-red-600"
            }`}
          >
            {difference > 0 ? "+" : ""}
            {difference.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isAcceptableDifference && (
            <span
              className="text-sm text-red-500"
              title={aiEstimation.justification}
            >
              ⚠️ Écart important
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
