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
 * Composant de comparaison entre pourcentages réels et recommandations IA
 * Affiche deux barres de progression : une pour le réel, une pour l'IA
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
  const isDifferenceSignificant = Math.abs(difference) > 5; // Plus de 5% d'écart

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Barre actuelle */}
      <div className="flex items-center gap-2">
        <span className="w-12 text-xs text-slate-500">Réel:</span>
        <ProgressBar
          percentage={actualPercentage}
          barColor="bg-blue-500"
          width="w-16 sm:w-20"
          height="h-1.5"
          showPercentage={true}
        />
      </div>

      {/* Barre recommandée par l'IA */}
      <div className="flex items-center gap-2">
        <span className="w-12 text-xs text-slate-500">IA:</span>
        <ProgressBar
          percentage={aiPercentage}
          barColor="bg-amber-500"
          width="w-16 sm:w-20"
          height="h-1.5"
          showPercentage={true}
        />
      </div>

      {/* Indicateur d'écart significatif */}
      {isDifferenceSignificant && (
        <div className="flex items-center gap-1">
          <span className="w-12 text-xs text-slate-400">Écart:</span>
          <span
            className={`text-xs font-medium ${
              difference > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {difference > 0 ? "+" : ""}
            {difference.toFixed(1)}%
          </span>
          {Math.abs(difference) > 10 && (
            <span
              className="text-xs text-red-500"
              title={aiEstimation.justification}
            >
              ⚠️
            </span>
          )}
        </div>
      )}
    </div>
  );
}
