import { useState } from "react";
import { useCurrentProject } from "../store/useCurrentProjectStore";
// import supprimé, la clé est gérée par la fonction utilitaire
import { generateMemoire } from "../lib/OpenAI";
import { ButtonPrimary } from "../components/ui";

function Memoire() {
  const { currentProject, updateCurrentProject } = useCurrentProject();
  // apiKey est maintenant géré par la fonction utilitaire
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    // apiKey est maintenant géré par la fonction utilitaire
    setGenerating(true);
    try {
      const html = await generateMemoire(currentProject);
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
      <ButtonPrimary
        type="button"
        onClick={handleGenerate}
        disabled={generating}
      >
        Générer mémoire par l&apos;IA
      </ButtonPrimary>
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
