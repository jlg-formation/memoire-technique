import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ButtonLink, ButtonPrimary } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { extractConsultationInfo } from "../lib/OpenAI";
import extractMethodologyScores from "../lib/OpenAI/extractMethodologyScores";
import type { MethodologyScore } from "../lib/OpenAI/extractMethodologyScores";
import { useProjectStore } from "../store/useProjectStore";

interface ProjectCreateProps {
  onClose: () => void;
}

function ProjectCreate({ onClose }: ProjectCreateProps) {
  const { addProject, setProject } = useProjectStore();

  const [consultationTitle, setConsultationTitle] = useState("");
  const [nomCourt, setNomCourt] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [submissionTime, setSubmissionTime] = useState("");
  const [worksAmount, setWorksAmount] = useState("");
  const [notation, setNotation] = useState<MethodologyScore[] | undefined>(
    undefined,
  );
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject = {
      id: crypto.randomUUID(),
      consultationTitle,
      nomCourt,
      submissionDeadline,
      submissionTime: submissionTime || undefined,
      worksAmount: +worksAmount,
      creationDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
      notation,
    };
    addProject(newProject);
    setProject(newProject);
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
          <FileAIUpload
            label="Joindre le RC (Règlement de Consultation)"
            onParse={async (text) => {
              setProcessing(true);
              const info = await extractConsultationInfo(text);
              // Analyse de la notation
              const notation = await extractMethodologyScores(text);
              return { ...info, notation };
            }}
            onResult={(result) => {
              const info = result as {
                consultationTitle?: string;
                nomCourt?: string;
                submissionDeadline?: string;
                submissionTime?: string;
                worksAmount?: number;
                notation?: MethodologyScore[];
              };
              setConsultationTitle(info.consultationTitle ?? "");
              setNomCourt(info.nomCourt ?? "");
              setSubmissionDeadline(info.submissionDeadline ?? "");
              setSubmissionTime(info.submissionTime ?? "");
              setWorksAmount(info.worksAmount?.toString() ?? "");
              // Met à jour la notation dans le projet
              if (info.notation) {
                setNotation(info.notation);
              }
              setProcessing(false);
            }}
            status={analysisStep}
            setStatus={setAnalysisStep}
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
            Nom court du projet
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={nomCourt}
            onChange={(e) => setNomCourt(e.target.value)}
            placeholder="Nom court généré par l'IA"
            disabled={processing}
            maxLength={20}
            required
          />
        </div>
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
