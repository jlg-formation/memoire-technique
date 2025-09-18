import type { MobilizedPerson } from "../../../types/project";

interface MissingRatesAlertProps {
  missingRates: MobilizedPerson[];
}

export default function MissingRatesAlert({
  missingRates,
}: MissingRatesAlertProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-12 sm:w-12">
          <svg
            className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base font-semibold text-amber-900 sm:text-lg">
            Taux journaliers manquants
          </h3>
          <p className="text-sm text-amber-800 sm:text-base">
            Les personnes suivantes n'ont pas de taux journalier (TUJ) défini.
            Rendez-vous dans la page "Équipes" pour compléter ces informations.
          </p>
          <div className="space-y-2">
            {missingRates.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2 sm:gap-3 sm:p-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800 sm:h-8 sm:w-8">
                  {p.name
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")}
                </div>
                <span className="text-sm font-medium text-amber-900 sm:text-base">
                  {p.name}
                </span>
                <span className="rounded bg-amber-50 px-1 py-1 text-xs text-amber-700 sm:px-2 sm:text-sm">
                  TUJ manquant
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
