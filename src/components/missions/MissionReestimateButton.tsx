import AsyncPrimaryButton from "../ui/AsyncPrimaryButton";
import { CheckCircle } from "lucide-react";

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
    <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-4 w-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
        onClick={handleReestimate}
        disabled={disabled}
        className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
        icon={CheckCircle}
      >
        Réestimer avec IA rigoureuse
      </AsyncPrimaryButton>
    </div>
  );
}
