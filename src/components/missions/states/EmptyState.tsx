import MissionHeader from "../MissionHeader";
import InformationPanel from "../InformationPanel";
import { FileText } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <MissionHeader />
        <InformationPanel />

        {/* Empty State */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4 text-center shadow-sm sm:p-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
              <FileText className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-lg font-semibold text-slate-700 sm:text-xl">
                Aucune donnée disponible
              </h3>
              <p className="text-sm text-slate-600 sm:text-base">
                Aucune mission ou entreprise n'a été détectée dans votre projet.
                <br />
                Importez l'Acte d'Engagement pour extraire les missions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
