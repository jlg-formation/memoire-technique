import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import FileAIUpload from "../components/ui/FileAIUpload";
import { ButtonLink, EditableTextArea } from "../components/ui";
import { Trash2 } from "lucide-react";
import {
  extractMethodologyScores,
  extractMissions,
  extractPlanningConstraints,
  generateDocumentTitle,
} from "../lib/OpenAI";
import type { MarketDocument, MarketDocumentType } from "../types/project";

function MarketDocs() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const [processingSteps, setProcessingSteps] = useState<
    Record<string, string>
  >({});

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const docs = currentProject.marketDocuments ?? [];

  const handleDocumentParsed = async (
    text: string,
    fileName: string,
    docType: MarketDocumentType,
  ) => {
    let finalFileName = fileName;

    // Générer automatiquement un titre pour les documents "AUTRE"
    if (docType === "AUTRE") {
      try {
        const generatedTitle = await generateDocumentTitle(text);
        finalFileName = generatedTitle;
      } catch (err) {
        console.error("Erreur lors de la génération du titre:", err);
        // Garder le nom de fichier original en cas d'erreur
      }
    }

    const doc: MarketDocument = {
      id: crypto.randomUUID(),
      name: finalFileName,
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

  const documentTypes = [
    {
      type: "CCAP",
      label: "CCAP",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      type: "CCTP",
      label: "CCTP",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      type: "AE",
      label: "Acte d'Engagement",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    // RC supprimé car déjà traité lors de la création/édition du projet
  ] as const;

  const renderDocumentSection = (
    docType: MarketDocumentType,
    label: string,
    bgColor: string,
    borderColor: string,
  ) => {
    const existingDoc = docs.find((doc) => doc.type === docType);
    const statusKey = docType.toLowerCase();

    return (
      <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
        <div className="space-y-4">
          {/* En-tête avec upload */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
            {existingDoc && (
              <ButtonLink
                onClick={() => handleDelete(existingDoc.id)}
                className="rounded p-1 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </ButtonLink>
            )}
          </div>

          {/* Widget d'upload */}
          {!existingDoc && (
            <FileAIUpload
              label={`Télécharger ${label}`}
              onParse={async (text) => ({ text })}
              onResult={(result) => {
                const { text } = result as { text: string };
                handleDocumentParsed(text, label, docType);
              }}
              status={processingSteps[statusKey] || ""}
              setStatus={(step) =>
                setProcessingSteps((prev) => ({ ...prev, [statusKey]: step }))
              }
            />
          )}

          {/* Contenu du document */}
          {existingDoc && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Document analysé et prêt
              </div>
              <EditableTextArea
                value={existingDoc.text}
                onChange={() => {}} // readonly, pas de changement
                placeholder="Contenu du document..."
                rows={4}
                disabled={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Pièces de marché
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Téléchargez et analysez les documents du marché
        </p>
      </div>

      {/* Documents principaux */}
      <div className="grid gap-4 md:grid-cols-2">
        {documentTypes.map(({ type, label, bgColor, borderColor }) =>
          renderDocumentSection(type, label, bgColor, borderColor),
        )}
      </div>

      {/* Autres documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Autres pièces</h3>

        {/* Documents existants */}
        {docs
          .filter((doc) => doc.type === "AUTRE")
          .map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{doc.name}</h4>
                  <ButtonLink
                    onClick={() => handleDelete(doc.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonLink>
                </div>
                <EditableTextArea
                  value={doc.text}
                  onChange={() => {}} // readonly, pas de changement
                  placeholder="Contenu du document..."
                  rows={4}
                  disabled={true}
                />
              </div>
            </div>
          ))}

        {/* Widget pour ajouter un nouveau document */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <FileAIUpload
            label="Ajouter un autre document"
            onParse={async (text) => ({ text })}
            onResult={(result) => {
              const { text } = result as { text: string };
              const fileInput = document.querySelector(
                'input[type="file"]:last-of-type',
              ) as HTMLInputElement;
              const fileName =
                fileInput?.files?.[0]?.name || "Document sans nom";

              setProcessingSteps((prev) => ({
                ...prev,
                autre: "Génération du titre automatique...",
              }));

              handleDocumentParsed(text, fileName, "AUTRE").finally(() => {
                setProcessingSteps((prev) => ({ ...prev, autre: "" }));
              });
            }}
            status={processingSteps.autre || ""}
            setStatus={(step) =>
              setProcessingSteps((prev) => ({ ...prev, autre: step }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export default MarketDocs;
