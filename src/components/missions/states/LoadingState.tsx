import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Chargement des projets en cours...",
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-slate-700">{message}</p>
          <p className="text-sm text-slate-500">
            Veuillez patienter quelques instants...
          </p>
        </div>
      </div>
    </div>
  );
}
