import { useState, useRef } from "react";
import { Check } from "lucide-react";

interface FileAIUploadProps {
  disabled?: boolean;
  onParse: (text: string) => Promise<unknown>;
  onResult: (result: unknown) => void;
  className?: string;
  status?: string;
  setStatus?: (msg: string) => void;
}

export default function FileAIUpload({
  disabled = false,
  onParse,
  onResult,
  className = "",
  status,
  setStatus,
}: FileAIUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [internalStep, setInternalStep] = useState<string>("");
  const [cancelled, setCancelled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Utilise le status externe si fourni, sinon l'interne
  const analysisStep = status !== undefined ? status : internalStep;

  const setStep = setStatus ?? setInternalStep;

  // Permet d'annuler le traitement IA
  const handleCancel = () => {
    setCancelled(true);
    setIsExtracting(false);
    setStep("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setCancelled(false);
    setStep("Extraction du contenu du fichier...");
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".docx")) {
        // @ts-expect-error: window.extractDocxText est injecté dynamiquement
        text = await window.extractDocxText(file);
      } else {
        // @ts-expect-error: window.extractPdfText est injecté dynamiquement
        text = await window.extractPdfText(file);
      }
      if (cancelled) return;
      setStep("Analyse du contenu avec l'IA...");
      const result = await onParse(text);
      if (cancelled) return;
      setStep("Analyse terminée avec succès !");
      onResult(result);
      setTimeout(() => setStep(""), 2000);
    } catch {
      if (!cancelled) {
        setStep("Erreur lors de l'analyse du fichier");
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
      <span className="font-mono text-xl text-gray-700">&gt;</span>

      <input
        ref={fileInputRef}
        type="file"
        accept={".pdf,.docx,.md,.txt"}
        onChange={handleFileChange}
        disabled={disabled || isExtracting}
        className="hidden"
        id="file-ai-upload-input"
      />

      <label
        htmlFor="file-ai-upload-input"
        className="flex-1 cursor-pointer px-2 py-1 text-lg font-medium text-gray-700 transition-colors duration-200 select-none hover:text-gray-900"
      >
        fichier
      </label>

      <style>{`
        @keyframes breathing-dots {
          0% { opacity: 0.3; }
          25% { opacity: 0.8; }
          50% { opacity: 1; }
          75% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `}</style>

      <div className="flex items-center gap-2">
        {isExtracting ? (
          <span
            className="text-2xl font-bold text-gray-600"
            style={{
              letterSpacing: 3,
              animation: "breathing-dots 1.8s infinite ease-in-out",
            }}
          >
            ...
          </span>
        ) : analysisStep && analysisStep.startsWith("Erreur") ? (
          <span className="text-sm font-medium text-gray-800">✗</span>
        ) : analysisStep && analysisStep.startsWith("Analyse terminée") ? (
          <Check className="h-6 w-6 text-gray-700" />
        ) : null}
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
