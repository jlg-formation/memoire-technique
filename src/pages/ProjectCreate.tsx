import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { extractConsultationInfo } from "../lib/OpenAI";
import { ButtonPrimary, ButtonLink } from "../components/ui";

interface ProjectCreateProps {
  onClose: () => void;
}

function ProjectCreate({ onClose }: ProjectCreateProps) {
  const { addProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();

  const [consultationTitle, setConsultationTitle] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [worksAmount, setWorksAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      id: crypto.randomUUID(),
      consultationTitle,
      submissionDeadline,
      submissionTime: submissionTime || undefined,
      worksAmount: +worksAmount,
      creationDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
    });
    onClose();
  };

  const handleRCFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !apiKey) {
      if (!apiKey) {
        alert(
          "Veuillez configurer votre clé API OpenAI dans les paramètres avant d'analyser un fichier.",
        );
      }
      return;
    }

    setProcessing(true);

    try {
      // Étape 1: Extraction du texte
      setAnalysisStep("Extraction du contenu du fichier...");
      const text = file.name.toLowerCase().endsWith(".docx")
        ? await extractDocxText(file)
        : await extractPdfText(file);

      // Étape 2: Analyse avec OpenAI
      setAnalysisStep("Analyse du contenu avec l'IA...");
      const info = await extractConsultationInfo(text, apiKey);

      // Étape 3: Préremplissage des champs
      setAnalysisStep("Préremplissage des champs...");
      setConsultationTitle(info.consultationTitle ?? "");
      setSubmissionDeadline(info.submissionDeadline ?? "");
      setSubmissionTime(info.submissionTime ?? "");
      setWorksAmount(info.worksAmount?.toString() ?? "");

      // Succès
      setAnalysisStep("Analyse terminée avec succès !");
      setTimeout(() => setAnalysisStep(""), 2000);
    } catch (err) {
      console.error("Erreur lors de l'analyse:", err);
      setAnalysisStep("Erreur lors de l'analyse du fichier");
      setTimeout(() => setAnalysisStep(""), 3000);
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={onClose}
            className="flex shrink-0 items-center gap-1"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm sm:text-base">Précédent</span>
          </ButtonLink>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Nouveau projet
        </h1>
      </div>

      {/* RC Import Section */}
      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
          Télécharger le RC (Règlement de Consultation)
        </h3>
        <p className="mb-3 text-xs text-blue-700 sm:text-sm">
          Importez votre règlement de consultation pour extraire automatiquement
          le titre et la date limite de soumission.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleRCFileChange}
              disabled={processing}
              className="w-full cursor-pointer rounded-md border border-blue-200 bg-white p-3 text-xs file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
            />
          </div>

          {/* Status message container with fixed height to prevent CLS */}
          <div className="min-h-[52px] sm:min-h-[60px]">
            {processing && (
              <div className="flex items-center gap-2 rounded-md bg-blue-100 p-2 sm:gap-3 sm:p-3">
                {/* Spinner */}
                <div className="flex-shrink-0">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent sm:h-5 sm:w-5"></div>
                </div>

                {/* Message d'étape */}
                <div className="text-xs text-blue-800 sm:text-sm">
                  {analysisStep || "Traitement en cours..."}
                </div>
              </div>
            )}

            {!processing && analysisStep && (
              <div className="flex items-center gap-2 rounded-md bg-green-100 p-2 sm:gap-3 sm:p-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-green-600 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-xs text-green-800 sm:text-sm">
                  {analysisStep}
                </div>
              </div>
            )}

            {!processing && !analysisStep && (
              <div className="flex items-center gap-2 rounded-md bg-gray-50 p-2 sm:gap-3 sm:p-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
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
                <div className="text-xs text-gray-600 sm:text-sm">
                  Une fois sélectionné, le fichier sera analysé automatiquement par l'IA pour extraire les informations.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Titre de la consultation
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={consultationTitle}
            onChange={(e) => setConsultationTitle(e.target.value)}
            placeholder="Saisissez le titre de la consultation"
            disabled={processing}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date limite de soumission
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            type="date"
            value={submissionDeadline}
            onChange={(e) => setSubmissionDeadline(e.target.value)}
            disabled={processing}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Heure limite de soumission
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            type="time"
            value={submissionTime}
            onChange={(e) => setSubmissionTime(e.target.value)}
            disabled={processing}
            placeholder="16:00"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Montant des travaux HT (€)
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            type="number"
            value={worksAmount}
            onChange={(e) => setWorksAmount(e.target.value)}
            placeholder="1000000"
            disabled={processing}
            required
          />
        </div>

        <div className="flex justify-end pt-4 pb-4 sm:pb-0">
          <ButtonPrimary
            type="submit"
            disabled={processing}
            className="w-full px-6 py-3 sm:w-auto"
          >
            Créer le projet
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default ProjectCreate;
