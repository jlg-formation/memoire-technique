import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import FileAIUpload from "../components/ui/FileAIUpload";
import { ButtonLink } from "../components/ui";
import { Trash2 } from "lucide-react";
import {
  extractMethodologyScores,
  extractMissions,
  extractPlanningConstraints,
} from "../lib/OpenAI";
import type { MarketDocument, MarketDocumentType } from "../types/project";

function MarketDocs() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [processingSteps, setProcessingSteps] = useState<Record<string, string>>({});

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const docs = currentProject.marketDocuments ?? [];

  const handleDocumentParsed = async (
    text: string,
    fileName: string,
    docType: MarketDocumentType
  ) => {
    const doc: MarketDocument = {
      id: crypto.randomUUID(),
      name: fileName,
      type: docType,
      text,
    };
    
    updateCurrentProject({ marketDocuments: [...docs, doc] });
    
    // Traitement spécifique selon le type de document
    if (docType === "AE") {
      try {
        const missions = await extractMissions(text);
        const planningSummary = await extractPlanningConstraints(text);
        updateCurrentProject({ missions, planningSummary });
      } catch (err) {
        console.error(err);
      }
    }
    
    if (docType === "RC") {
      try {
        const notation = await extractMethodologyScores(text);
        updateCurrentProject({ notation });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = (id: string): void => {
    updateCurrentProject({ marketDocuments: docs.filter((d) => d.id !== id) });
  };

  return (
    <div className="min-h-screen space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Pièces de marché</h1>
        <p className="mt-1 text-sm text-gray-600">
          Téléchargez et analysez les documents du marché
        </p>
      </div>

      {/* Upload sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CCAP */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">CCAP</h3>
          <div className="rounded-lg bg-blue-50 p-4">
            <FileAIUpload
              label="CCAP"
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, "CCAP", "CCAP");
              }}
              status={processingSteps.ccap || ""}
              setStatus={(step) => setProcessingSteps(prev => ({ ...prev, ccap: step }))}
            />
          </div>
        </div>

        {/* CCTP */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">CCTP</h3>
          <div className="rounded-lg bg-green-50 p-4">
            <FileAIUpload
              label="CCTP"
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, "CCTP", "CCTP");
              }}
              status={processingSteps.cctp || ""}
              setStatus={(step) => setProcessingSteps(prev => ({ ...prev, cctp: step }))}
            />
          </div>
        </div>

        {/* Acte d'Engagement */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Acte d'Engagement</h3>
          <div className="rounded-lg bg-purple-50 p-4">
            <FileAIUpload
              label="AE"
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, "Acte d'Engagement", "AE");
              }}
              status={processingSteps.ae || ""}
              setStatus={(step) => setProcessingSteps(prev => ({ ...prev, ae: step }))}
            />
          </div>
        </div>

        {/* Règlement de Consultation */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Règlement de Consultation</h3>
          <div className="rounded-lg bg-yellow-50 p-4">
            <FileAIUpload
              label="RC"
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, "Règlement de Consultation", "RC");
              }}
              status={processingSteps.rc || ""}
              setStatus={(step) => setProcessingSteps(prev => ({ ...prev, rc: step }))}
            />
          </div>
        </div>

        {/* Autres documents */}
        <div className="space-y-3 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-800">Autres pièces</h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <FileAIUpload
              label="Autre document"
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, "Autre document", "AUTRE");
              }}
              status={processingSteps.autre || ""}
              setStatus={(step) => setProcessingSteps(prev => ({ ...prev, autre: step }))}
            />
          </div>
        </div>
      </div>

      {/* Documents list */}
      {docs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Documents chargés</h2>
          <div className="space-y-4">
            {docs.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {doc.type}
                    </span>
                    <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                  </div>
                  <ButtonLink
                    onClick={() => handleDelete(doc.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonLink>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Contenu du document
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={doc.text}
                    readOnly
                    rows={6}
                    placeholder="Le contenu du document apparaîtra ici après analyse..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Montant global */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Montant global des travaux (€)
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            value={currentProject.worksAmount ?? ""}
            onChange={(e) =>
              updateCurrentProject({
                worksAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Saisissez le montant des travaux"
          />
        </div>
      </div>
    </div>
  );
}

export default MarketDocs;
