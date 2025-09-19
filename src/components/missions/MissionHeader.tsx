import { Clipboard } from "lucide-react";

export default function MissionHeader() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
        <Clipboard className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
        Missions
      </h1>
    </div>
  );
}
