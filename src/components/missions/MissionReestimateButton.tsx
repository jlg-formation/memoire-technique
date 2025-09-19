import AsyncPrimaryButton from "../ui/AsyncPrimaryButton";
import { Lightbulb } from "lucide-react";

interface MissionReestimateButtonProps {
  missionId: string;
  onReestimate: (missionId: string) => Promise<void>;
  disabled?: boolean;
}

export function MissionReestimateButton({
  missionId,
  onReestimate,
  disabled = false,
}: MissionReestimateButtonProps) {
  const handleReestimate = async () => {
    await onReestimate(missionId);
  };

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-4 w-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-medium text-blue-900">
            Réestimation IA disponible
          </h4>
          <p className="text-xs text-blue-700">
            Recalculer automatiquement les jours/homme pour cette mission
          </p>
        </div>
      </div>
      <AsyncPrimaryButton
        onClick={handleReestimate}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        icon={Lightbulb}
      >
        Réestimer par IA
      </AsyncPrimaryButton>
    </div>
  );
}
