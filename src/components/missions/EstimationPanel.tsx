import AsyncPrimaryButton from "../ui/AsyncPrimaryButton";
import CategoryPercentageCard from "./CategoryPercentageCard";
import type { CategoryPercentages, Mission } from "../../types/project";
import {
  getCategoryTargetAmount,
  getTotalTargetAmount,
} from "../../lib/missions";
import { Sparkles, BarChart3, Calculator, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ButtonPrimary } from "../ui";

interface EstimationPanelProps {
  worksAmount: number;
  categoryPercentages: CategoryPercentages;
  nonEmptyCategories: Array<{
    key: keyof CategoryPercentages;
    name: string;
    missions: Mission[];
    color: string;
  }>;
  updateCategoryPercentage: (
    category: keyof CategoryPercentages,
    percentage: number,
  ) => void;
  onEstimate: () => Promise<void>;
  estimating: boolean;
  allMissionsTotal: number;
}

export default function EstimationPanel({
  worksAmount,
  categoryPercentages,
  nonEmptyCategories,
  updateCategoryPercentage,
  onEstimate,
  estimating,
  allMissionsTotal,
}: EstimationPanelProps) {
  const navigate = useNavigate();
  const totalTargetAmount = getTotalTargetAmount(
    worksAmount,
    categoryPercentages,
  );

  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-3 shadow-sm sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900 sm:text-xl">
          <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
          Estimation financière
        </h3>

        {/* Montant des travaux */}
        <div className="rounded-lg border border-emerald-100 bg-white p-4 sm:p-6">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Montant global des travaux
          </label>
          <div className="text-2xl font-bold text-emerald-700 sm:text-3xl">
            {worksAmount.toLocaleString()}&nbsp;€
          </div>
        </div>

        {/* Pourcentages par catégorie */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-emerald-800 sm:text-lg">
            Pourcentages par catégorie de missions
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {nonEmptyCategories.map((category) => {
              const percentage = categoryPercentages[category.key] || 0;
              const targetAmount = getCategoryTargetAmount(
                worksAmount,
                percentage,
              );

              return (
                <CategoryPercentageCard
                  key={category.key}
                  category={category}
                  percentage={percentage}
                  targetAmount={targetAmount}
                  onPercentageChange={(value: number) =>
                    updateCategoryPercentage(category.key, value)
                  }
                />
              );
            })}
          </div>

          {/* Total des pourcentages et montants */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-emerald-800">
                  Pourcentage total
                </label>
                <div className="text-xl font-bold text-emerald-700">
                  {Object.values(categoryPercentages)
                    .reduce((sum, p) => sum + (p || 0), 0)
                    .toFixed(2)}
                  &nbsp;%
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-emerald-800">
                  Montant cible total
                </label>
                <div className="text-xl font-bold text-emerald-700">
                  {totalTargetAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  &nbsp;€
                </div>
              </div>
            </div>
          </div>

          {/* Bouton Estimer pourcentages */}
          <div className="flex justify-center">
            <ButtonPrimary
              onClick={() => navigate("/missions/pourcentages")}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 sm:px-6"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Estimer pourcentage
            </ButtonPrimary>
          </div>
        </div>

        {/* Estimation IA */}
        <div className="rounded-lg border border-blue-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="flex items-center gap-2 text-base font-semibold text-blue-900 sm:text-lg">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">
                Estimation par Intelligence Artificielle
              </span>
            </h4>
            <AsyncPrimaryButton
              onClick={onEstimate}
              disabled={estimating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-6"
              icon={Sparkles}
            >
              Estimer par IA
            </AsyncPrimaryButton>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                Montant estimé IA
              </label>
              <div className="text-xl font-bold text-blue-700 sm:text-2xl">
                {estimating
                  ? "Calcul..."
                  : `${allMissionsTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}\u00A0€`}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                Pourcentage obtenu
              </label>
              <div className="text-xl font-bold text-blue-700 sm:text-2xl">
                {estimating
                  ? "..."
                  : `${((allMissionsTotal / worksAmount) * 100).toFixed(2)}\u00A0%`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
