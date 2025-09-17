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

function Missions() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  // apiKey est maintenant géré par la fonction utilitaire
  const [estimating, setEstimating] = useState(false);
  const [percentage, setPercentage] = useState<number>(8);

  if (!currentProject) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Missions</h1>
        {/* Panneau bleu d'information toujours visible */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M12 16v-4m0-4h.01"
              />
            </svg>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Source des missions</h3>
              <p className="text-sm text-blue-800">
                Les missions ci-dessous sont extraites automatiquement de l'
                <strong>Acte d'Engagement (AE)</strong> que vous fournissez dans
                la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>
        <div className="text-red-500">Veuillez sélectionner un projet.</div>
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
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Missions</h1>
        {/* Panneau bleu d'information toujours visible */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M12 16v-4m0-4h.01"
              />
            </svg>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Source des missions</h3>
              <p className="text-sm text-blue-800">
                Les missions ci-dessous sont extraites automatiquement de l'
                <strong>Acte d'Engagement (AE)</strong> que vous fournissez dans
                la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-red-500">
          {missingRates.map((p) => (
            <div key={p.id}>
              Aller dans la page Equipes pour indiquer un TUJ pour {p.name}
            </div>
          ))}
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
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Missions</h1>
        {/* Panneau bleu d'information toujours visible */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M12 16v-4m0-4h.01"
              />
            </svg>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Source des missions</h3>
              <p className="text-sm text-blue-800">
                Les missions ci-dessous sont extraites automatiquement de l'
                <strong>Acte d'Engagement (AE)</strong> que vous fournissez dans
                la section "Pièces de marché".
                <br />
                Pour mettre à jour la liste des missions, importez ou remplacez
                l'Acte d'Engagement.
              </p>
            </div>
          </div>
        </div>
        <div>Aucune mission ou entreprise détectée.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Missions</h1>
      {/* Panneau bleu d'information toujours visible */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path stroke="currentColor" strokeWidth="2" d="M12 16v-4m0-4h.01" />
          </svg>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">Source des missions</h3>
            <p className="text-sm text-blue-800">
              Les missions ci-dessous sont extraites automatiquement de l'
              <strong>Acte d'Engagement (AE)</strong> que vous fournissez dans
              la section "Pièces de marché".
              <br />
              Pour mettre à jour la liste des missions, importez ou remplacez
              l'Acte d'Engagement.
            </p>
          </div>
        </div>
      </div>
      {/* Formulaire d'estimation avec pourcentage et montant global */}
      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-4">
          <label htmlFor="worksAmount" className="font-medium text-green-900">
            Montant global des travaux :
          </label>
          <span className="text-lg font-bold text-green-800">
            {worksAmount.toLocaleString()} €
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="percentage" className="font-medium text-green-900">
            Pourcentage de l'offre :
          </label>
          <input
            id="percentage"
            type="number"
            min={0.001}
            max={100}
            step={0.001}
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-24 border p-1 text-right"
          />
          <span className="text-green-800">%</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-medium text-green-900">
            Montant cible de l'offre :
          </label>
          <span className="text-lg font-bold text-green-800">
            {targetAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            €
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-medium text-blue-900">
            Montant estimé IA&nbsp;:
          </label>
          <span className="text-lg font-bold text-blue-800">
            {estimating
              ? "..."
              : allMissionsTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }) + " €"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-medium text-blue-900">
            Pourcentage obtenu après estimation IA&nbsp;:
          </label>
          <span className="text-lg font-bold text-blue-800">
            {estimating
              ? "..."
              : ((allMissionsTotal / worksAmount) * 100).toFixed(2) + " %"}
          </span>
        </div>
        <AsyncPrimaryButton
          onClick={handleEstimate}
          disabled={estimating}
          className="mt-2"
        >
          Estimer par IA
        </AsyncPrimaryButton>
      </div>
      {/* ...reste inchangé... */}
      {missions.map((mission) => (
        <div key={mission.id} className="relative space-y-2 border p-2">
          <h2 className="font-semibold">{mission.name}</h2>
          <div className="absolute top-2 right-2 text-lg font-bold">
            Total mission: {missionTotal(mission.id).toFixed(2)} €
          </div>
          {companies.map((company) => {
            const people = company.mobilizedPeople ?? [];
            const companyTotal = people.reduce(
              (sum, p) => sum + personCost(mission.id, company, p),
              0,
            );
            return (
              <div key={company.id} className="relative space-y-1 border p-2">
                <h3 className="font-medium">{company.name}</h3>
                <div className="text-md absolute top-2 right-2 font-semibold">
                  Total {company.name}: {companyTotal.toFixed(2)} €
                </div>
                <ul className="space-y-1 pl-2">
                  {people.map((person) => {
                    const days = getDays(mission.id, company.id, person.id);
                    const cost = personCost(mission.id, company, person);
                    const justification = getJustification(
                      mission.id,
                      company.id,
                      person.id,
                    );
                    return (
                      <li
                        key={person.id}
                        className="space-y-1 rounded border p-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex-1">{person.name}</span>
                          <input
                            type="number"
                            className="w-20 border p-1"
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
                          <span>{person.dailyRate ?? 0} €/j</span>
                          <span className="font-semibold">
                            {cost.toFixed(2)} €
                          </span>
                        </div>
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
                          placeholder="Justification du nombre de jours"
                          className="w-full border p-1"
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
      <div className="text-lg font-bold">
        Total général: {allMissionsTotal.toFixed(2)} €
      </div>
    </div>
  );
}

export default Missions;
