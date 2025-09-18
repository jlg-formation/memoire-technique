import { useState } from "react";
import { Button } from "../ui/Button";
import type {
  ParticipatingCompany,
  MissionPriceConstraint,
  MissionCategories,
} from "../../types/project";
import { getAllMissions } from "../../lib/missions/missionHelpers";

interface PriceConstraintsPanelProps {
  missionCategories: MissionCategories;
  companies: ParticipatingCompany[];
  constraints: MissionPriceConstraint[];
  worksAmount: number;
  onUpdateConstraints: (constraints: MissionPriceConstraint[]) => void;
}

export default function PriceConstraintsPanel({
  missionCategories,
  companies,
  constraints,
  worksAmount,
  onUpdateConstraints,
}: PriceConstraintsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<{
    missionId: string;
    companyId: string;
    amount: string;
    justification: string;
  } | null>(null);

  const missions = getAllMissions(missionCategories);

  const hasConstraints = constraints.length > 0;

  const handleAddConstraint = () => {
    if (!editingConstraint || !editingConstraint.amount) return;

    const amount = parseFloat(editingConstraint.amount.replace(/\s/g, ""));
    if (isNaN(amount) || amount <= 0) return;

    const newConstraint: MissionPriceConstraint = {
      missionId: editingConstraint.missionId,
      companyId: editingConstraint.companyId,
      imposedAmount: amount,
      justification:
        editingConstraint.justification || "Prix imposé par l'entreprise",
    };

    const updatedConstraints = constraints.filter(
      (c) =>
        !(
          c.missionId === newConstraint.missionId &&
          c.companyId === newConstraint.companyId
        ),
    );
    updatedConstraints.push(newConstraint);

    onUpdateConstraints(updatedConstraints);
    setEditingConstraint(null);
  };

  const handleRemoveConstraint = (missionId: string, companyId: string) => {
    const updatedConstraints = constraints.filter(
      (c) => !(c.missionId === missionId && c.companyId === companyId),
    );
    onUpdateConstraints(updatedConstraints);
  };

  const totalConstrainedAmount = constraints.reduce(
    (sum, c) => sum + c.imposedAmount,
    0,
  );
  const constraintRatio =
    worksAmount > 0 ? (totalConstrainedAmount / worksAmount) * 100 : 0;
  const isOverBudget = totalConstrainedAmount > worksAmount * 0.8; // Alerte si > 80% du budget

  return (
    <div className="rounded-lg border border-orange-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-orange-800 hover:text-orange-900"
        >
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Contraintes de prix des entreprises
        </button>

        {hasConstraints && (
          <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            {constraints.length} contrainte{constraints.length > 1 ? "s" : ""} ·{" "}
            {totalConstrainedAmount.toLocaleString()} €
            {worksAmount > 0 && (
              <span className="ml-2">
                ({constraintRatio.toFixed(1)}% du budget)
              </span>
            )}
          </div>
        )}

        {isOverBudget && (
          <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            ⚠️ Budget dépassé
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Permet aux entreprises co-traitantes ou sous-traitantes d'imposer un
            prix fixe sur certaines missions. L'IA estimera uniquement les
            missions non contraintes.
          </p>

          {isOverBudget && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-1 flex items-center gap-2 font-medium text-red-800">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Attention : Budget élevé
              </div>
              <p className="text-sm text-red-700">
                Les contraintes de prix représentent{" "}
                {constraintRatio.toFixed(1)}% du budget total des travaux. Cela
                laisse peu de marge pour l'estimation IA des autres missions.
              </p>
            </div>
          )}

          {/* Liste des contraintes existantes */}
          {hasConstraints && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-800">
                Contraintes actuelles
              </h4>
              {constraints.map((constraint) => {
                const mission = missions.find(
                  (m) => m.id === constraint.missionId,
                );
                const company = companies.find(
                  (c) => c.id === constraint.companyId,
                );

                return (
                  <div
                    key={`${constraint.missionId}-${constraint.companyId}`}
                    className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">
                        {mission?.name} · {company?.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {constraint.justification}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-orange-700">
                        {constraint.imposedAmount.toLocaleString()} €
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveConstraint(
                            constraint.missionId,
                            constraint.companyId,
                          )
                        }
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Supprimer la contrainte"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="border-t pt-4">
            <h4 className="mb-3 font-medium text-slate-800">
              Ajouter une contrainte de prix
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Mission
                </label>
                <select
                  value={editingConstraint?.missionId || ""}
                  onChange={(e) =>
                    setEditingConstraint((prev) => ({
                      ...prev!,
                      missionId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Sélectionner une mission</option>
                  {missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Entreprise
                </label>
                <select
                  value={editingConstraint?.companyId || ""}
                  onChange={(e) =>
                    setEditingConstraint((prev) => ({
                      ...prev!,
                      companyId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Montant imposé (€ HT)
                </label>
                <input
                  type="text"
                  value={editingConstraint?.amount || ""}
                  onChange={(e) =>
                    setEditingConstraint((prev) => ({
                      ...prev!,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="ex: 50000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Justification
                </label>
                <input
                  type="text"
                  value={editingConstraint?.justification || ""}
                  onChange={(e) =>
                    setEditingConstraint((prev) => ({
                      ...prev!,
                      justification: e.target.value,
                    }))
                  }
                  placeholder="ex: Prix négocié avec le sous-traitant"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleAddConstraint}
                disabled={
                  !editingConstraint?.missionId ||
                  !editingConstraint?.companyId ||
                  !editingConstraint?.amount
                }
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Ajouter la contrainte
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
