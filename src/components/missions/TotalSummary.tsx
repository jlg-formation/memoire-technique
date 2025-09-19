import { Calculator } from "lucide-react";

interface TotalSummaryProps {
  allMissionsTotal: number;
}

export default function TotalSummary({ allMissionsTotal }: TotalSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-3 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 sm:text-xl">
          <Calculator className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
          Total général
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-2xl font-bold text-slate-800 shadow-sm sm:px-6 sm:py-3 sm:text-3xl">
          {allMissionsTotal.toFixed(2)}&nbsp;€
        </div>
      </div>
    </div>
  );
}
