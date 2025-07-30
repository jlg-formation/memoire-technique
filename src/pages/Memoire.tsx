import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { generateMemoire } from "../lib/OpenAI";

function Memoire() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!currentProject) return;
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    setGenerating(true);
    try {
      const html = await generateMemoire(currentProject, key);
      updateCurrentProject({ memoHtml: html });
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <button
        type="button"
        onClick={handleGenerate}
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
      >
        Générer mémoire par l&apos;IA
      </button>
      {generating && <div>Génération en cours...</div>}
      {currentProject.memoHtml ? (
        <div dangerouslySetInnerHTML={{ __html: currentProject.memoHtml }} />
      ) : (
        <div>Aucun mémoire technique disponible.</div>
      )}
    </div>
  );
}

export default Memoire;
