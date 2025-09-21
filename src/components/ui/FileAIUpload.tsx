import { useState, useRef } from "react";
import { Check, Sparkles } from "lucide-react";
import { extractTextFromFile } from "../../lib/file-extraction";
import Spinner from "./Spinner";

interface FileAIUploadProps {
  disabled?: boolean;
  onParse: (text: string) => Promise<unknown>;
  onResult: (result: unknown) => void;
  className?: string;
  status?: string;
  setStatus?: (msg: string) => void;
  label?: string;
}

export default function FileAIUpload({
  disabled = false,
  onParse,
  onResult,
  className = "",
  status,
  setStatus,
  label = "fichier",
}: FileAIUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [internalStep, setInternalStep] = useState<string>("");
  const [cancelled, setCancelled] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Utilise le status externe si fourni, sinon l'interne
  const analysisStep = status !== undefined ? status : internalStep;

  // Générer un ID unique pour chaque instance
  const inputId = useRef(
    `file-ai-upload-input-${Math.random().toString(36).slice(2, 11)}`,
  );

  const setStep = setStatus ?? setInternalStep;

  // Permet d'annuler le traitement IA
  const handleCancel = () => {
    setCancelled(true);
    setIsExtracting(false);
    setStep("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setCancelled(false);
    setFileName(file.name);
    setStep("Extraction du contenu du fichier...");

    try {
      const text = await extractTextFromFile(file);

      if (cancelled) return;

      setStep("Analyse du contenu avec l'IA...");
      const result = await onParse(text);

      if (cancelled) return;
      setStep("Analyse terminée avec succès !");
      onResult(result);
      setTimeout(() => setStep(""), 2000);
    } catch (error) {
      if (!cancelled) {
        setStep(
          `Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        );
        setTimeout(() => setStep(""), 3000);
        // Optionally: onResult(null)
      }
    } finally {
      setIsExtracting(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-all duration-300 hover:border-gray-400 ${className}`}
      style={{ minHeight: 48, maxWidth: 360 }}
    >
      <Sparkles className="h-4 w-4 text-gray-700" />

      <input
        ref={fileInputRef}
        type="file"
        accept={".pdf,.docx,.md,.txt"}
        onChange={handleFileChange}
        disabled={disabled || isExtracting}
        className="hidden"
        id={inputId.current}
      />

      <label
        htmlFor={inputId.current}
        className="flex-1 cursor-pointer px-2 py-1 text-sm font-normal text-gray-500 transition-colors duration-200 select-none hover:text-gray-700"
      >
        {fileName || label}
      </label>

      {/* Zone d'icône avec espace réservé permanent */}
      <div className="flex h-6 min-w-[32px] items-center justify-center gap-2">
        {isExtracting ? (
          <Spinner />
        ) : analysisStep && analysisStep.startsWith("Erreur") ? (
          <span className="text-sm font-medium text-gray-800">✗</span>
        ) : analysisStep && analysisStep.startsWith("Analyse terminée") ? (
          <Check className="h-6 w-6 text-gray-700" />
        ) : (
          <div className="h-6 w-6"></div>
        )}
      </div>

      {isExtracting && (
        <button
          type="button"
          onClick={handleCancel}
          className="ml-2 rounded border border-gray-400 bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300"
          style={{ minWidth: 65 }}
        >
          annuler
        </button>
      )}
    </div>
  );
}
