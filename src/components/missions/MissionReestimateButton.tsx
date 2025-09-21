import { CheckCircle } from "lucide-react";
import { useMissionEstimation } from "../../hooks/missions";
import { useCurrentProject } from "../../store/useCurrentProjectStore";
import AsyncPrimaryButton from "../ui/AsyncPrimaryButton";

interface MissionReestimateButtonProps {
  missionId: string;
  disabled?: boolean;
}

export function MissionReestimateButton({
  missionId,
  disabled = false,
}: MissionReestimateButtonProps) {
  const { currentProject, updateCurrentProject } = useCurrentProject();
  const { handleReestimateSingleMission } = useMissionEstimation(
    currentProject!,
    updateCurrentProject,
  );

  const handleReestimateMission = async () => {
    await handleReestimateSingleMission(missionId);
  };

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-emerald-900">
            Réestimation IA rigoureuse disponible
          </h4>
          <p className="text-xs text-emerald-700">
            Respecte strictement le budget prévu et les contraintes de prix des
            entreprises
          </p>
        </div>
      </div>
      <AsyncPrimaryButton
        onClick={handleReestimateMission}
        disabled={disabled}
        className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
        icon={CheckCircle}
      >
        Réestimer avec IA rigoureuse
      </AsyncPrimaryButton>
    </div>
  );
}
