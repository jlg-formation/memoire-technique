import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink, ButtonPrimary } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { summarize } from "../lib/OpenAI";
import { extractCompanyName } from "../lib/strings/extractCompanyName";
import { useProjectStore } from "../store/useProjectStore";
import type { ParticipatingCompany } from "../types/project";

interface CompanyEditProps {
  company: ParticipatingCompany;
  onClose: () => void;
}

function CompanyEdit({ company, onClose }: CompanyEditProps) {
  const { currentProject, updateCurrentProject } = useProjectStore();

  const [companyName, setCompanyName] = useState("");
  const [presentationSummary, setPresentationSummary] = useState("");
  const [equipmentText, setEquipmentText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [summaryWords, setSummaryWords] = useState(100);
  const [isMandataire, setIsMandataire] = useState(false);

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

  // Initialiser les champs avec les données de l'entreprise
  useEffect(() => {
    setCompanyName(company.name || "");
    setPresentationSummary(company.presentationSummary || "");
    setEquipmentText(company.equipmentText || "");
    setIsMandataire(currentProject?.mandataireId === company.id);
  }, [company, currentProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: ParticipatingCompany = {
      ...company,
      name: companyName,
      presentationSummary,
      equipmentText,
    };

    const updatedCompanies = companies.map((c) =>
      c.id === company.id ? updatedCompany : c,
    );

    const updatedProject: Partial<typeof currentProject> = {
      participatingCompanies: updatedCompanies,
    };

    // Gestion du mandataire pour les groupements
    if (currentProject?.groupType && currentProject.groupType !== "seule") {
      if (isMandataire) {
        // Cette entreprise devient mandataire
        Object.assign(updatedProject, {
          mandataireId: company.id,
          ...(currentProject.mandataireId !== company.id && {
            mandataireContactId: undefined,
          }),
        });
      } else if (currentProject.mandataireId === company.id) {
        // Cette entreprise n'est plus mandataire
        Object.assign(updatedProject, {
          mandataireId: undefined,
          mandataireContactId: undefined,
        });
      }
    }

    updateCurrentProject(updatedProject);
    onClose();
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={onClose}
            className="flex shrink-0 items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Précédent</span>
          </ButtonLink>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Éditer l'entreprise
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les informations de l'entreprise
        </p>
      </div>

      {/* Upload Section */}
      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
          Télécharger un nouveau fichier de présentation
        </h3>
        <p className="mb-3 text-xs text-blue-700 sm:text-sm">
          Importez un nouveau fichier de présentation pour mettre à jour
          automatiquement les informations de l'entreprise.
        </p>

        <div className="space-y-3">
          <FileAIUpload
            label="Joindre le fichier de présentation de l'entreprise"
            accept=".pdf,.docx,.md,.txt"
            parseLabel="Analyse du contenu avec l'IA..."
            onParse={async (text) => {
              setProcessing(true);
              const summary = await summarize(text, summaryWords);
              return { text, summary };
            }}
            onResult={(result) => {
              const { summary } = result as {
                summary: string;
              };
              const name = extractCompanyName(summary);
              setCompanyName(name);
              setPresentationSummary(summary);
              setProcessing(false);
            }}
            status={analysisStep}
            setStatus={setAnalysisStep}
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-blue-800 sm:text-base">
              Résumé en
            </label>
            <input
              type="number"
              className="w-20 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={summaryWords}
              onChange={(e) => setSummaryWords(Number(e.target.value))}
              disabled={processing}
            />
            <span className="text-sm text-blue-700 sm:text-base">mots</span>
          </div>
        </div>
      </div>

      {/* Equipment Upload Section */}
      <div className="rounded-lg bg-green-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-green-900 sm:text-base">
          Télécharger un nouveau fichier de matériel
        </h3>
        <p className="mb-3 text-xs text-green-700 sm:text-sm">
          Importez un nouveau fichier décrivant le matériel et les équipements
          de l'entreprise (optionnel).
        </p>

        <div className="space-y-3">
          <FileAIUpload
            label="Joindre le fichier de matériel de l'entreprise"
            accept=".pdf,.docx,.md,.txt"
            parseLabel="Lecture du fichier de matériel..."
            onParse={async (text) => {
              return { text };
            }}
            onResult={(result) => {
              const { text } = result as { text: string };
              setEquipmentText(text);
            }}
            status=""
            setStatus={() => {}}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        aria-disabled={processing}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom de l'entreprise
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Saisissez le nom de l'entreprise"
            disabled={processing}
            required
          />
        </div>

        {/* Checkbox Mandataire - uniquement pour les groupements */}
        {currentProject?.groupType && currentProject.groupType !== "seule" && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="mandataire-edit"
                checked={isMandataire}
                onChange={(e) => setIsMandataire(e.target.checked)}
                disabled={processing}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="mandataire-edit"
                className="text-sm font-medium text-blue-900 sm:text-base"
              >
                Cette entreprise est le mandataire du groupement
              </label>
            </div>
            <p className="mt-2 text-xs text-blue-700 sm:text-sm">
              Le mandataire est l'entreprise responsable de la coordination du
              groupement et des relations avec le maître d'ouvrage.
            </p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Résumé de présentation
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={presentationSummary}
            onChange={(e) => setPresentationSummary(e.target.value)}
            placeholder="Résumé de la présentation"
            disabled={processing}
            rows={5}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description du matériel
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={equipmentText}
            onChange={(e) => setEquipmentText(e.target.value)}
            placeholder="Description du matériel et des équipements de l'entreprise"
            disabled={processing}
            rows={8}
          />
        </div>

        <div className="flex justify-end pt-4 pb-4 sm:pb-0">
          <ButtonPrimary
            type="submit"
            disabled={processing}
            className="w-full px-6 py-3 sm:w-auto"
          >
            Mettre à jour l'entreprise
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default CompanyEdit;
