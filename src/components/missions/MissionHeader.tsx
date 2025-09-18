export default function MissionHeader() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
        <svg
          className="h-4 w-4 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
        Missions
      </h1>
    </div>
  );
}
