import type { Mission, CategoryPercentages } from "../../types/project";
import { Briefcase } from "lucide-react";

interface CategoryPercentageCardProps {
  category: {
    key: keyof CategoryPercentages;
    name: string;
    missions: Mission[];
    color: string;
  };
  percentage: number;
  targetAmount: number;
  onPercentageChange: (value: number) => void;
}

export default function CategoryPercentageCard({
  category,
  percentage,
  targetAmount,
  onPercentageChange,
}: CategoryPercentageCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex min-h-[4rem] items-start gap-2">
        <div className={`rounded-lg p-2 ${category.color}`}>
          <Briefcase className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h5 className="text-sm leading-tight font-semibold text-slate-800">
            {category.name}
          </h5>
          <p className="text-xs text-slate-500">
            {category.missions.length} mission
            {category.missions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Pourcentage de l'offre
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={percentage}
              onChange={(e) => onPercentageChange(Number(e.target.value))}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              placeholder="0.00"
            />
            <span className="text-sm font-medium text-slate-600">%</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Montant cible
          </label>
          <div className="text-lg font-bold text-emerald-700">
            {targetAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            &nbsp;€
          </div>
        </div>
      </div>
    </div>
  );
}
