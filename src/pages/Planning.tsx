import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
// import supprimé, la clé est gérée par la fonction utilitaire
import { generatePlanning } from "../lib/OpenAI";
import PlanningChart from "../components/PlanningChart";
import { ButtonPrimary, EditableTextArea } from "../components/ui";

function Planning() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  // apiKey est maintenant géré par la fonction utilitaire
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
    // apiKey est maintenant géré par la fonction utilitaire
    setGenerating(true);
    try {
      const text = await generatePlanning(
        missions,
        currentProject.planningSummary ?? "",
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
      <EditableTextArea
        value={currentProject.planningSummary ?? ""}
        onChange={(value) => updateCurrentProject({ planningSummary: value })}
        placeholder="Résumé des contraintes de planning"
        className="w-full border p-2"
      />
      <ButtonPrimary
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="border-green-600 bg-green-600 hover:bg-green-700"
      >
        Générer Planning via IA
      </ButtonPrimary>
      {generating && <div>Génération en cours...</div>}
      {currentProject.planningText && (
        <>
          <EditableTextArea
            value={currentProject.planningText}
            onChange={(value) => updateCurrentProject({ planningText: value })}
            className="w-full border p-2"
            disabled={true}
          />
          <PlanningChart markdown={currentProject.planningText} />
        </>
      )}
    </div>
  );
}

export default Planning;
