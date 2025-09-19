import MissionHeader from "../MissionHeader";
import InformationPanel from "../InformationPanel";
import { AlertTriangle } from "lucide-react";

export default function NoProjectSelected() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <MissionHeader />
        <InformationPanel />

        {/* Error Message */}
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-3 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-12 sm:w-12">
              <AlertTriangle className="h-5 w-5 text-red-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-red-900 sm:text-lg">
                Aucun projet sélectionné
              </h3>
              <p className="text-sm text-red-800 sm:text-base">
                Veuillez sélectionner un projet pour consulter les missions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
