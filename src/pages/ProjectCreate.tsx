import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { extractConsultationInfo } from "../lib/OpenAI";

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Nouveau projet</h1>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* RC Import Section */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">
          Télécharger le RC (Règlement de Consultation)
        </h3>
        <p className="mb-3 text-sm text-blue-700">
          Importez votre règlement de consultation pour extraire automatiquement
          le titre et la date limite de soumission.
        </p>

        <div className="space-y-3">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleRCFileChange}
            disabled={processing}
            className="w-full rounded-md border border-blue-200 bg-white p-3 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {processing && (
            <div className="flex items-center gap-3 rounded-md bg-blue-100 p-3">
              {/* Spinner */}
              <div className="flex-shrink-0">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              </div>

              {/* Message d'étape */}
              <div className="text-sm text-blue-800">
                {analysisStep || "Traitement en cours..."}
              </div>
            </div>
          )}

          {!processing && analysisStep && (
            <div className="flex items-center gap-3 rounded-md bg-green-100 p-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-600"
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
              <div className="text-sm text-green-800">{analysisStep}</div>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Titre de la consultation
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
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
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
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
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
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
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
            type="number"
            value={worksAmount}
            onChange={(e) => setWorksAmount(e.target.value)}
            placeholder="1000000"
            disabled={processing}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={processing}
            className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            Créer le projet
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectCreate;
