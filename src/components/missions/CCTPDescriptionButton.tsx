import { FileText } from "lucide-react";
import AsyncPrimaryButton from "../ui/AsyncPrimaryButton";
import { extractMissionDescriptions } from "../../lib/OpenAI";
import { useProjectStore } from "../../store/useProjectStore";
import type { MarketDocument, MissionCategories } from "../../types/project";

interface CCTPDescriptionButtonProps {
  missionCategories: MissionCategories;
  marketDocuments: MarketDocument[];
}

export default function CCTPDescriptionButton({
  missionCategories,
  marketDocuments,
}: CCTPDescriptionButtonProps) {
  const { updateCurrentProject } = useProjectStore();

  // Trouve le document CCTP
  const cctpDocument = marketDocuments.find((doc) => doc.type === "CCTP");

  // Le bouton est désactivé si aucun CCTP n'est chargé
  const isDisabled = !cctpDocument || !cctpDocument.text;

  const handleExtractDescriptions = async (): Promise<void> => {
    if (!cctpDocument || !missionCategories) {
      throw new Error("CCTP ou missions manquants");
    }

    try {
      // Appel à OpenAI pour extraire les descriptions
      const descriptions = await extractMissionDescriptions(
        cctpDocument.text,
        missionCategories,
      );

      // Mise à jour des missions avec les descriptions
      const updatedMissions: MissionCategories = {
        base: missionCategories.base.map((mission) => ({
          ...mission,
          description: descriptions[mission.id] || mission.description,
        })),
        pse: missionCategories.pse.map((mission) => ({
          ...mission,
          description: descriptions[mission.id] || mission.description,
        })),
        tranchesConditionnelles: missionCategories.tranchesConditionnelles.map(
          (mission) => ({
            ...mission,
            description: descriptions[mission.id] || mission.description,
          }),
        ),
        variantes: missionCategories.variantes.map((mission) => ({
          ...mission,
          description: descriptions[mission.id] || mission.description,
        })),
      };

      // Sauvegarde dans le projet
      updateCurrentProject({ missions: updatedMissions });
    } catch (error) {
      console.error("Erreur lors de l'extraction des descriptions:", error);
      throw error;
    }
  };

  return (
    <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-12 sm:w-12">
            <FileText className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-green-900 sm:text-lg">
              Enrichir avec le CCTP
            </h3>
            <p className="text-sm text-green-800 sm:text-base">
              {isDisabled
                ? "Veuillez d'abord charger un CCTP dans la section 'Pièces de marché'"
                : "Extraire automatiquement les descriptions détaillées de chaque mission depuis le CCTP"}
            </p>
          </div>
        </div>

        <AsyncPrimaryButton
          onClick={handleExtractDescriptions}
          disabled={isDisabled}
          icon={FileText}
          className="flex-shrink-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          Ajouter les descriptions du CCTP
        </AsyncPrimaryButton>
      </div>
    </div>
  );
}
