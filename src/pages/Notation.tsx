import { useProjectStore } from "../store/useProjectStore";
import { FileText, Info } from "lucide-react";

function Notation() {
  const { currentProject } = useProjectStore();

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const items = currentProject.notation ?? [];
  const rcDocument = currentProject.marketDocuments?.find(
    (doc) => doc.type === "RC",
  );

  return (
    <div className="min-h-screen space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Barème de notation
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Critères d'évaluation extraits automatiquement du règlement de
          consultation
        </p>
      </div>

      {/* Explication de l'origine */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">Source de la notation</h3>
            <p className="text-sm text-blue-800">
              {rcDocument ? (
                <>
                  Le barème de notation ci-dessous a été extrait automatiquement
                  du document{" "}
                  <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900">
                    <FileText className="h-3 w-3" />
                    {rcDocument.name}
                  </span>
                  . Ces critères correspondent aux aspects évalués dans l'offre
                  technique.
                </>
              ) : (
                <>
                  Pour obtenir le barème de notation, veuillez d'abord
                  télécharger le <strong>Règlement de Consultation (RC)</strong>{" "}
                  dans la section "Pièces de marché". L'analyse automatique
                  extraira les critères d'évaluation.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tableau de notation */}
      {items.length ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Critères d'évaluation
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pr-4 pb-3 text-left font-medium text-gray-700">
                    Aspect évalué
                  </th>
                  <th className="pb-3 text-center font-medium text-gray-700">
                    Points maximum
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-3 pr-4 text-gray-900">{item.label}</td>
                    <td className="py-3 text-center font-semibold text-blue-600">
                      {item.points}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="pt-3 pr-4 font-semibold text-gray-900">
                    Total maximum
                  </td>
                  <td className="pt-3 text-center font-bold text-blue-600">
                    {items.reduce((sum, item) => sum + item.points, 0)} points
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 font-medium text-gray-900">
            Aucune notation extraite
          </h3>
          <p className="text-sm text-gray-600">
            Téléchargez le Règlement de Consultation (RC) dans la section
            "Pièces de marché" pour extraire automatiquement le barème de
            notation.
          </p>
        </div>
      )}
    </div>
  );
}
export default Notation;
