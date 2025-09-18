import type { Mission, CategoryPercentages } from "../../types/project";

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
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-lg p-2 ${category.color}`}>
          <svg
            className="h-4 w-4"
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
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-semibold text-slate-800">
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
