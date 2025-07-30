import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { generatePlanning } from "../lib/OpenAI";

function Planning() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();
  const [generating, setGenerating] = useState(false);

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const missions = currentProject.missions ?? [];

  const handleGenerate = async (): Promise<void> => {
    if (!missions.length) {
      alert("Aucune mission détectée");
      return;
    }
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    setGenerating(true);
    try {
      const text = await generatePlanning(
        missions,
        currentProject.planningSummary ?? "",
        key,
      );
      updateCurrentProject({ planningText: text });
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Planning</h1>
      <textarea
        className="w-full border p-2"
        value={currentProject.planningSummary ?? ""}
        onChange={(e) =>
          updateCurrentProject({ planningSummary: e.target.value })
        }
        placeholder="Résumé des contraintes de planning"
      />
      <button
        type="button"
        onClick={handleGenerate}
        className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white"
      >
        Générer Planning via IA
      </button>
      {generating && <div>Génération en cours...</div>}
      {currentProject.planningText && (
        <textarea
          className="w-full border p-2"
          readOnly
          value={currentProject.planningText}
        />
      )}
    </div>
  );
}

export default Planning;
