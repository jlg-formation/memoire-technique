import { useState, useEffect } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { extractConsultationInfo } from "../lib/OpenAI";
import extractMethodologyScores from "../lib/OpenAI/extractMethodologyScores";
import { ButtonPrimary, ButtonLink } from "../components/ui";
import { ArrowLeft, Check, Info } from "lucide-react";
import type { Project } from "../types/project";
import type { MethodologyScore } from "../lib/OpenAI/extractMethodologyScores";

interface ProjectEditProps {
  project: Project;
  onClose: () => void;
}

function ProjectEdit({ project, onClose }: ProjectEditProps) {
  const { updateProject } = useProjectStore();

  const [consultationTitle, setConsultationTitle] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [worksAmount, setWorksAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [notation, setNotation] = useState<MethodologyScore[] | undefined>(
    project.notation,
  );

  // Initialiser les champs avec les données du projet
  useEffect(() => {
    setConsultationTitle(project.consultationTitle || "");
    setSubmissionDeadline(project.submissionDeadline || "");
    setSubmissionTime(project.submissionTime || "");
    setWorksAmount(project.worksAmount?.toString() || "");
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProject: Project = {
      ...project,
      consultationTitle,
      submissionDeadline,
      submissionTime: submissionTime || undefined,
      worksAmount: +worksAmount,
      lastUpdateDate: new Date().toISOString(),
      notation,
    };
    updateProject(updatedProject);
    onClose();
  };

  const handleRCFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) {
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
      const info = await extractConsultationInfo(text);
      // Analyse de la notation
      const extractedNotation = await extractMethodologyScores(text);
      setNotation(extractedNotation);

      // Étape 3: Préremplissage des champs
      setAnalysisStep("Préremplissage des champs...");
      setConsultationTitle(info.consultationTitle ?? "");
      setSubmissionDeadline(info.submissionDeadline ?? "");
      setSubmissionTime(info.submissionTime ?? "");
      setWorksAmount(info.worksAmount?.toString() ?? "");
      // Met à jour la notation dans le projet
      updateProject({
        ...project,
        ...info,
        worksAmount: info.worksAmount ? Number(info.worksAmount) : undefined,
        notation: extractedNotation,
      });

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
          Éditer le projet
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les informations de votre projet
        </p>
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
                  <Check className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                </div>
                <div className="text-xs text-green-800 sm:text-sm">
                  {analysisStep}
                </div>
              </div>
            )}

            {!processing && !analysisStep && (
              <div className="flex items-center gap-2 rounded-md bg-gray-50 p-2 sm:gap-3 sm:p-3">
                <div className="flex-shrink-0">
                  <Info className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">
                  Une fois sélectionné, le fichier sera analysé automatiquement
                  par l'IA pour extraire les informations.
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
            Mettre à jour le projet
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default ProjectEdit;
