import { useState } from "react";
import { Check, Info } from "lucide-react";

interface FileAIUploadProps {
  label?: string;
  accept?: string;
  disabled?: boolean;
  onParse: (text: string) => Promise<any>;
  onResult: (result: any) => void;
  parseLabel?: string;
  className?: string;
  status?: string;
  setStatus?: (msg: string) => void;
}

export default function FileAIUpload({
  label = "Joindre un fichier",
  accept = ".pdf,.docx",
  disabled = false,
  onParse,
  onResult,
  parseLabel = "Analyse du contenu avec l'IA...",
  className = "",
  status,
  setStatus,
}: FileAIUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [internalStep, setInternalStep] = useState<string>("");
  // Utilise le status externe si fourni, sinon l'interne
  const analysisStep = status !== undefined ? status : internalStep;

  const setStep = setStatus ?? setInternalStep;
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setStep("Extraction du contenu du fichier...");
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".docx")) {
        // @ts-ignore
        text = await window.extractDocxText(file);
      } else {
        // @ts-ignore
        text = await window.extractPdfText(file);
      }
      setStep(parseLabel);
      const result = await onParse(text);
      setStep("Analyse terminée avec succès !");
      onResult(result);
      setTimeout(() => setStep(""), 2000);
    } catch (err) {
      setStep("Erreur lors de l'analyse du fichier");
      setTimeout(() => setStep(""), 3000);
      // Optionally: onResult(null)
    } finally {
      setIsExtracting(false);
      e.target.value = "";
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isExtracting}
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      <div className="mt-2 min-h-[52px] sm:min-h-[60px]">
        {isExtracting && (
          <div className="flex items-center gap-2 rounded-md bg-blue-100 p-2 sm:gap-3 sm:p-3">
            <div className="flex-shrink-0">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent sm:h-5 sm:w-5"></div>
            </div>
            <div className="text-xs text-blue-800 sm:text-sm">
              {analysisStep || "Traitement en cours..."}
            </div>
          </div>
        )}
        {!isExtracting && analysisStep && (
          <div className="flex items-center gap-2 rounded-md bg-green-100 p-2 sm:gap-3 sm:p-3">
            <div className="flex-shrink-0">
              <Check className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
            </div>
            <div className="text-xs text-green-800 sm:text-sm">
              {analysisStep}
            </div>
          </div>
        )}
        {!isExtracting && !analysisStep && (
          <div className="flex items-center gap-2 rounded-md bg-gray-50 p-2 sm:gap-3 sm:p-3">
            <div className="flex-shrink-0">
              <Info className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
            <div className="text-xs text-gray-600 sm:text-sm">
              Une fois sélectionné, le fichier sera analysé automatiquement par
              l'IA pour extraire les informations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
