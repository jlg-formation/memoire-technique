import { useState } from "react";
import { useCurrentProject } from "../store/useCurrentProjectStore";
// import supprimé, la clé est gérée par la fonction utilitaire
import { generatePlanning } from "../lib/OpenAI";
import PlanningChart from "../components/PlanningChart";
import { ButtonPrimary, EditableTextArea } from "../components/ui";
import type { Mission, MissionCategories } from "../types/project";

// Helper function pour obtenir toutes les missions d'un objet MissionCategories
const getAllMissions = (missionCategories?: MissionCategories): Mission[] => {
  if (!missionCategories) return [];
  return [
    ...missionCategories.base,
    ...missionCategories.pse,
    ...missionCategories.tranchesConditionnelles,
    ...missionCategories.variantes,
  ];
};

function Planning() {
  const { currentProject, updateCurrentProject } = useCurrentProject();
  // apiKey est maintenant géré par la fonction utilitaire
  const [generating, setGenerating] = useState(false);

  const missionCategories = currentProject.missions;
  const missions = getAllMissions(missionCategories);

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
