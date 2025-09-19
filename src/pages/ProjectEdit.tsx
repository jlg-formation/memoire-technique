import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileAIUpload from "../components/ui/FileAIUpload";
import { useProjectStore } from "../store/useProjectStore";
import { extractConsultationInfo } from "../lib/OpenAI";
import extractMethodologyScores from "../lib/OpenAI/extractMethodologyScores";
import { ButtonPrimary, ButtonLink } from "../components/ui";
import { ArrowLeft } from "lucide-react";
import type { Project } from "../types/project";
import type { MethodologyScore } from "../lib/OpenAI/extractMethodologyScores";

interface ProjectEditProps {
  project?: Project;
  onClose?: () => void;
}

function ProjectEdit({ project: projectProp, onClose }: ProjectEditProps) {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjectStore();

  const [consultationTitle, setConsultationTitle] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [worksAmount, setWorksAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [notation, setNotation] = useState<MethodologyScore[] | undefined>(
    undefined,
  );

  // Si pas de project en prop, le chercher via les params d'URL
  const project = projectProp || projects.find((p) => p.slug === projectSlug);

  // Initialiser les champs avec les données du projet
  useEffect(() => {
    if (project) {
      setConsultationTitle(project.consultationTitle || "");
      setSubmissionDeadline(project.submissionDeadline || "");
      setSubmissionTime(project.submissionTime || "");
      setWorksAmount(project.worksAmount?.toString() || "");
      setNotation(project.notation);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="p-8 text-center text-red-600">
        Projet introuvable
        <button
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => navigate("/projects")}
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/projects");
    }
  };

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
    handleClose();
  };

  // Utilisation de FileAIUpload pour l'import RC
  const handleParse = async (text: string) => {
    setProcessing(true);
    setAnalysisStep("Analyse du contenu avec l'IA...");
    const info = await extractConsultationInfo(text);
    const extractedNotation = await extractMethodologyScores(text);
    return { ...info, extractedNotation };
  };

  type RCAnalysisResult = {
    consultationTitle?: string;
    submissionDeadline?: string;
    submissionTime?: string;
    worksAmount?: number;
    extractedNotation?: MethodologyScore[];
  };
  const handleResult = (result: unknown) => {
    const info = result as RCAnalysisResult;
    setConsultationTitle(info.consultationTitle ?? "");
    setSubmissionDeadline(info.submissionDeadline ?? "");
    setSubmissionTime(info.submissionTime ?? "");
    setWorksAmount(info.worksAmount?.toString() ?? "");
    setNotation(info.extractedNotation ?? notation);
    updateProject({
      ...project,
      ...info,
      worksAmount: info.worksAmount ? Number(info.worksAmount) : undefined,
      notation: info.extractedNotation ?? notation,
    });
    setProcessing(false);
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={handleClose}
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
        <FileAIUpload
          disabled={processing}
          onParse={handleParse}
          onResult={handleResult}
          status={analysisStep}
          setStatus={setAnalysisStep}
          label="Joindre le RC (.pdf ou .docx)"
        />
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
