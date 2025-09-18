import MissingRatesAlert from "./MissingRatesAlert";
import type { MobilizedPerson } from "../../../types/project";

interface MissingRatesWarningProps {
  missingRates: MobilizedPerson[];
}

export default function MissingRatesWarning({
  missingRates,
}: MissingRatesWarningProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
            <svg
              className="h-4 w-4 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Missions
          </h1>
        </div>

        {/* Information Panel */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base font-semibold text-blue-900 sm:text-lg">
                Source des missions
              </h3>
              <p className="text-sm leading-relaxed text-blue-800 sm:text-base">
                Les missions ci-dessous sont extraites automatiquement de l'
                <span className="rounded bg-blue-100 px-1 py-1 font-semibold sm:px-2">
                  Acte d'Engagement (AE)
                </span>
                que vous fournissez dans la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Missing Rates Warning */}
        <MissingRatesAlert missingRates={missingRates} />
      </div>
    </div>
  );
}
