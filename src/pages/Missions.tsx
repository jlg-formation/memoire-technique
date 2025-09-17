import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
// import supprimé, la clé est gérée par la fonction utilitaire
import { estimateMissionDays } from "../lib/OpenAI";
import type {
  MissionEstimation,
  ParticipatingCompany,
  MobilizedPerson,
} from "../types/project";
import { EditableTextArea } from "../components/ui";
import AsyncPrimaryButton from "../components/ui/AsyncPrimaryButton";
import Accordion from "../components/ui/Accordion";

function Missions() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  // apiKey est maintenant géré par la fonction utilitaire
  const [estimating, setEstimating] = useState(false);
  const [percentage, setPercentage] = useState<number>(8);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg
                className="h-6 w-6"
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
            <h1 className="text-3xl font-bold text-slate-800">Missions</h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900">
                  Source des missions
                </h3>
                <p className="leading-relaxed text-blue-800">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Aucun projet sélectionné
                </h3>
                <p className="text-red-800">
                  Veuillez sélectionner un projet pour consulter les missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const missionEstimation: MissionEstimation =
    currentProject.missionEstimations ?? {};
  const missions = currentProject.missions ?? [];
  const companies = currentProject.participatingCompanies ?? [];
  const worksAmount = currentProject.worksAmount ?? 0;
  const targetAmount = worksAmount * (percentage / 100);
  const missingRates = companies.flatMap((company) =>
    (company.mobilizedPeople ?? []).filter((p) => !p.dailyRate),
  );

  if (missingRates.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg
                className="h-6 w-6"
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
            <h1 className="text-3xl font-bold text-slate-800">Missions</h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900">
                  Source des missions
                </h3>
                <p className="leading-relaxed text-blue-800">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Missing Rates Warning */}
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-900">
                  Taux journaliers manquants
                </h3>
                <p className="text-amber-800">
                  Les personnes suivantes n'ont pas de taux journalier (TUJ)
                  défini. Rendez-vous dans la page "Équipes" pour compléter ces
                  informations.
                </p>
                <div className="space-y-2">
                  {missingRates.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800">
                        {p.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")}
                      </div>
                      <span className="font-medium text-amber-900">
                        {p.name}
                      </span>
                      <span className="rounded bg-amber-50 px-2 py-1 text-sm text-amber-700">
                        TUJ manquant
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const getDays = (
    missionId: string,
    companyId: string,
    personId: string,
  ): number =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.nombreDeJours ?? 0;

  const handleChange = (
    missionId: string,
    companyId: string,
    personId: string,
    days: number,
  ): void => {
    const updated: MissionEstimation = {
      ...missionEstimation,
      [missionId]: {
        ...(missionEstimation[missionId] ?? {}),
        [companyId]: {
          ...(missionEstimation[missionId]?.[companyId] ?? {}),
          [personId]: {
            ...(missionEstimation[missionId]?.[companyId]?.[personId] ?? {}),
            nombreDeJours: days,
          },
        },
      },
    };
    updateCurrentProject({ missionEstimations: updated });
  };

  const getJustification = (
    missionId: string,
    companyId: string,
    personId: string,
  ): string =>
    missionEstimation[missionId]?.[companyId]?.[personId]?.justification ?? "";

  const handleJustificationChange = (
    missionId: string,
    companyId: string,
    personId: string,
    text: string,
  ): void => {
    const updated: MissionEstimation = {
      ...missionEstimation,
      [missionId]: {
        ...(missionEstimation[missionId] ?? {}),
        [companyId]: {
          ...(missionEstimation[missionId]?.[companyId] ?? {}),
          [personId]: {
            ...(missionEstimation[missionId]?.[companyId]?.[personId] ?? {}),
            justification: text,
          },
        },
      },
    };
    updateCurrentProject({ missionEstimations: updated });
  };

  const personCost = (
    missionId: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ): number =>
    getDays(missionId, company.id, person.id) * (person.dailyRate ?? 0);

  const missionTotal = (missionId: string): number => {
    return companies.reduce((total, company) => {
      const people = company.mobilizedPeople ?? [];
      return (
        total +
        people.reduce((sum, p) => sum + personCost(missionId, company, p), 0)
      );
    }, 0);
  };

  const allMissionsTotal = missions.reduce(
    (sum: number, mission) => sum + missionTotal(mission.id),
    0,
  );

  const handleEstimate = async (): Promise<void> => {
    setEstimating(true);
    try {
      // On transmet le montant cible à l'IA via le prompt
      const result = await estimateMissionDays(
        missions,
        companies,
        targetAmount,
      );
      updateCurrentProject({
        missionEstimations: result,
      });
    } catch (err) {
      console.error(err);
    }
    setEstimating(false);
  };

  if (!missions.length || !companies.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg
                className="h-6 w-6"
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
            <h1 className="text-3xl font-bold text-slate-800">Missions</h1>
          </div>

          {/* Information Panel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900">
                  Source des missions
                </h3>
                <p className="leading-relaxed text-blue-800">
                  Les missions ci-dessous sont extraites automatiquement de l'
                  <span className="rounded bg-blue-100 px-2 py-1 font-semibold">
                    Acte d'Engagement (AE)
                  </span>
                  que vous fournissez dans la section "Pièces de marché".
                  <br />
                  Pour mettre à jour la liste des missions, importez ou
                  remplacez l'Acte d'Engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-8 text-center shadow-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-700">
                  Aucune donnée disponible
                </h3>
                <p className="text-slate-600">
                  Aucune mission ou entreprise n'a été détectée dans votre
                  projet.
                  <br />
                  Importez l'Acte d'Engagement pour extraire les missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg
              className="h-6 w-6"
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
          <h1 className="text-3xl font-bold text-slate-800">Missions</h1>
        </div>

        {/* Information Panel */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">
                Source des missions
              </h3>
              <p className="leading-relaxed text-blue-800">
                Les missions ci-dessous sont extraites automatiquement de l'
                <span className="rounded bg-blue-100 px-2 py-1 font-semibold">
                  Acte d'Engagement (AE)
                </span>
                que vous fournissez dans la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Estimation Panel */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-emerald-900">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Estimation financière
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Montant des travaux */}
              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Montant global des travaux
                </label>
                <div className="text-2xl font-bold text-emerald-700">
                  {worksAmount.toLocaleString()} €
                </div>
              </div>

              {/* Pourcentage */}
              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <label
                  htmlFor="percentage"
                  className="mb-1 block text-sm font-medium text-slate-600"
                >
                  Pourcentage de l'offre
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="percentage"
                    type="number"
                    min={0.001}
                    max={100}
                    step={0.001}
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-20 rounded-md border border-slate-300 px-3 py-2 text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-600">%</span>
                </div>
              </div>

              {/* Montant cible */}
              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Montant cible de l'offre
                </label>
                <div className="text-2xl font-bold text-emerald-700">
                  {targetAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </div>
              </div>
            </div>

            {/* Estimation IA */}
            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                  <svg
                    className="h-5 w-5"
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
                  Estimation par Intelligence Artificielle
                </h4>
                <AsyncPrimaryButton
                  onClick={handleEstimate}
                  disabled={estimating}
                  className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {estimating ? "Estimation en cours..." : "Estimer par IA"}
                </AsyncPrimaryButton>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Montant estimé IA
                  </label>
                  <div className="text-2xl font-bold text-blue-700">
                    {estimating
                      ? "Calcul en cours..."
                      : `${allMissionsTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} €`}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Pourcentage obtenu
                  </label>
                  <div className="text-2xl font-bold text-blue-700">
                    {estimating
                      ? "..."
                      : `${((allMissionsTotal / worksAmount) * 100).toFixed(2)} %`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Détail des missions
          </h2>

          {missions.map((mission) => (
            <Accordion
              key={mission.id}
              variant="primary"
              title={
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                      {mission.name.charAt(0)}
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                      {mission.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Total:</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xl font-bold text-blue-700">
                      {missionTotal(mission.id).toFixed(2)} €
                    </span>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                {companies.map((company) => {
                  const people = company.mobilizedPeople ?? [];
                  const companyTotal = people.reduce(
                    (sum, p) => sum + personCost(mission.id, company, p),
                    0,
                  );
                  return (
                    <Accordion
                      key={company.id}
                      variant="secondary"
                      title={
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-700">
                              {company.name.charAt(0)}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {company.name}
                            </span>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-700">
                            {companyTotal.toFixed(2)} €
                          </span>
                        </div>
                      }
                    >
                      <div className="space-y-3">
                        {people.map((person) => {
                          const days = getDays(
                            mission.id,
                            company.id,
                            person.id,
                          );
                          const cost = personCost(mission.id, company, person);
                          const justification = getJustification(
                            mission.id,
                            company.id,
                            person.id,
                          );
                          return (
                            <Accordion
                              key={person.id}
                              variant="tertiary"
                              title={
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-800">
                                      {person.name
                                        .split(" ")
                                        .map((n) => n.charAt(0))
                                        .join("")}
                                    </div>
                                    <span className="font-medium text-slate-700">
                                      {person.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        className="w-16 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400"
                                        value={days}
                                        onChange={(e) =>
                                          handleChange(
                                            mission.id,
                                            company.id,
                                            person.id,
                                            Number(e.target.value),
                                          )
                                        }
                                        disabled={estimating}
                                      />
                                      <span className="text-xs text-slate-500">
                                        jours
                                      </span>
                                    </div>
                                    <div className="rounded bg-slate-50 px-2 py-1 text-sm text-slate-600">
                                      {person.dailyRate ?? 0} €/j
                                    </div>
                                    <div className="rounded-full bg-amber-50 px-3 py-1 text-lg font-bold text-amber-700">
                                      {cost.toFixed(2)} €
                                    </div>
                                  </div>
                                </div>
                              }
                            >
                              <div className="mt-3">
                                <label className="mb-2 block text-sm font-medium text-slate-600">
                                  Justification du nombre de jours
                                </label>
                                <EditableTextArea
                                  value={justification}
                                  onChange={(value) =>
                                    handleJustificationChange(
                                      mission.id,
                                      company.id,
                                      person.id,
                                      value,
                                    )
                                  }
                                  placeholder="Expliquez pourquoi ce nombre de jours est nécessaire pour cette mission..."
                                  className="min-h-[80px] w-full resize-none rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-400"
                                />
                              </div>
                            </Accordion>
                          );
                        })}
                      </div>
                    </Accordion>
                  );
                })}
              </div>
            </Accordion>
          ))}
        </div>

        {/* Total Summary */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
              <svg
                className="h-6 w-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Total général
            </h3>
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-3xl font-bold text-slate-800 shadow-sm">
              {allMissionsTotal.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Missions;
