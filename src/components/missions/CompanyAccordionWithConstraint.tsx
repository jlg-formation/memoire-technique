import Accordion from "../ui/Accordion";
import { EditableTextArea } from "../ui";
import { useState } from "react";
import type {
  Mission,
  ParticipatingCompany,
  MobilizedPerson,
  MissionPriceConstraint,
} from "../../types/project";

interface CompanyAccordionWithConstraintProps {
  mission: Mission;
  company: ParticipatingCompany;
  companyTotal: number;
  constraint?: MissionPriceConstraint;
  constraints: MissionPriceConstraint[];
  onUpdateConstraints: (constraints: MissionPriceConstraint[]) => void;
  people: MobilizedPerson[];
  getDays: (missionId: string, companyId: string, personId: string) => number;
  handleChange: (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ) => void;
  getJustification: (
    missionId: string,
    companyId: string,
    personId: string,
  ) => string;
  handleJustificationChange: (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ) => void;
  personCost: (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ) => number;
  estimating: boolean;
}

// Composant pour l'affichage d'une entreprise avec possibilité d'éditer les contraintes de prix
export default function CompanyAccordionWithConstraint({
  mission,
  company,
  companyTotal,
  constraint,
  constraints,
  onUpdateConstraints,
  people,
  getDays,
  handleChange,
  getJustification,
  handleJustificationChange,
  personCost,
  estimating,
}: CompanyAccordionWithConstraintProps) {
  const [isEditingConstraint, setIsEditingConstraint] = useState(false);
  const [constraintAmount, setConstraintAmount] = useState(
    constraint?.imposedAmount?.toString() || "",
  );
  const [constraintJustification, setConstraintJustification] = useState(
    constraint?.justification || "",
  );

  const handleSaveConstraint = () => {
    const amount = parseFloat(constraintAmount.replace(/\s/g, ""));
    if (isNaN(amount) || amount <= 0) return;

    const newConstraint: MissionPriceConstraint = {
      missionId: mission.id,
      companyId: company.id,
      imposedAmount: amount,
      justification: constraintJustification || "Prix imposé par l'entreprise",
    };

    const updatedConstraints = constraints.filter(
      (c) => !(c.missionId === mission.id && c.companyId === company.id),
    );
    updatedConstraints.push(newConstraint);

    onUpdateConstraints(updatedConstraints);
    setIsEditingConstraint(false);
  };

  const handleRemoveConstraint = () => {
    const updatedConstraints = constraints.filter(
      (c) => !(c.missionId === mission.id && c.companyId === company.id),
    );
    onUpdateConstraints(updatedConstraints);
    setIsEditingConstraint(false);
  };

  const handleCancelEdit = () => {
    setConstraintAmount(constraint?.imposedAmount?.toString() || "");
    setConstraintJustification(constraint?.justification || "");
    setIsEditingConstraint(false);
  };

  const displayAmount = constraint ? constraint.imposedAmount : companyTotal;
  const isConstrained = !!constraint;

  return (
    <Accordion
      variant="secondary"
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-700 sm:h-6 sm:w-6">
              {company.name.charAt(0)}
            </span>
            <span className="text-sm font-semibold text-slate-700 sm:text-base">
              {company.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditingConstraint ? (
              <>
                <input
                  type="text"
                  value={constraintAmount}
                  onChange={(e) => setConstraintAmount(e.target.value)}
                  placeholder="50000"
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="text-sm text-slate-600">€</span>
                <button
                  onClick={handleSaveConstraint}
                  className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                  title="Sauvegarder"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
                  title="Annuler"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span
                  className={`rounded-full px-2 py-1 text-sm font-bold sm:px-3 sm:text-lg ${
                    isConstrained
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {displayAmount.toFixed(2)}&nbsp;€
                  {isConstrained && (
                    <span className="ml-1 text-xs font-normal">(imposé)</span>
                  )}
                </span>
                {isConstrained ? (
                  <button
                    onClick={() => setIsEditingConstraint(true)}
                    className="rounded bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700"
                    title="Modifier le prix imposé"
                  >
                    ✏️
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingConstraint(true)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    title="Imposer un prix"
                  >
                    🔒
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      {isEditingConstraint && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Justification du prix imposé
            </label>
            <input
              type="text"
              value={constraintJustification}
              onChange={(e) => setConstraintJustification(e.target.value)}
              placeholder="ex: Prix négocié avec le sous-traitant"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          {constraint && (
            <div className="mt-2">
              <button
                onClick={handleRemoveConstraint}
                className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
              >
                Supprimer la contrainte
              </button>
            </div>
          )}
        </div>
      )}

      {!isConstrained && (
        <div className="space-y-2 sm:space-y-3">
          {people.map((person) => {
            const days = getDays(mission.id, company.id, person.id);
            const cost = personCost(mission.id, company, person);
            const justification = getJustification(
              mission.id,
              company.id,
              person.id,
            );
            return (
              <Accordion
                key={person.id}
                variant="tertiary"
                title={
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800 sm:h-8 sm:w-8">
                        {person.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")}
                      </div>
                      <span className="text-sm font-medium text-slate-700 sm:text-base">
                        {person.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input
                          type="number"
                          className="w-12 rounded border border-slate-300 px-1 py-1 text-right text-xs focus:border-amber-400 focus:ring-2 focus:ring-amber-400 sm:w-16 sm:px-2 sm:text-sm"
                          value={days}
                          onChange={(e) =>
                            handleChange(
                              mission.id,
                              company.id,
                              person.id,
                              Number(e.target.value),
                            )
                          }
                          disabled={estimating}
                        />
                        <span className="hidden text-xs text-slate-500 sm:inline">
                          jours
                        </span>
                        <span className="text-xs text-slate-500 sm:hidden">
                          j
                        </span>
                      </div>
                      <div className="rounded bg-slate-50 px-1 py-1 text-xs text-slate-600 sm:px-2 sm:text-sm">
                        {person.dailyRate ?? 0}&nbsp;€/j
                      </div>
                      <div className="rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700 sm:px-3 sm:text-lg">
                        {cost.toFixed(2)}&nbsp;€
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="mt-2 sm:mt-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600 sm:mb-2 sm:text-sm">
                    Justification du nombre de jours
                  </label>
                  <EditableTextArea
                    value={justification}
                    onChange={(value) =>
                      handleJustificationChange(
                        mission.id,
                        company.id,
                        person.id,
                        value,
                      )
                    }
                    placeholder="Expliquez pourquoi ce nombre de jours est nécessaire pour cette mission..."
                    className="min-h-[60px] w-full resize-none rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400 sm:min-h-[80px] sm:px-3"
                  />
                </div>
              </Accordion>
            );
          })}
        </div>
      )}

      {isConstrained && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center gap-2 text-orange-800">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div>
              <div className="font-semibold">
                Prix imposé : {constraint?.imposedAmount.toLocaleString()} €
              </div>
              <div className="text-sm">{constraint?.justification}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-orange-700">
            Cette mission a un prix fixe. L'estimation détaillée par personne
            n'est pas affichée.
          </div>
        </div>
      )}
    </Accordion>
  );
}
