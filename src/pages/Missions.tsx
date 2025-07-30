import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import { estimateMissionDays } from "../lib/OpenAI";
import type {
  MissionDays,
  MissionJustifications,
  ParticipatingCompany,
  MobilizedPerson,
} from "../types/project";

function Missions() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();
  const [estimating, setEstimating] = useState(false);

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const missions = currentProject.missions ?? [];
  const companies = currentProject.participatingCompanies ?? [];
  const missingRates = companies.flatMap((company) =>
    (company.mobilizedPeople ?? []).filter((p) => !p.dailyRate),
  );

  if (missingRates.length) {
    return (
      <div className="space-y-2 p-4 text-red-500">
        {missingRates.map((p) => (
          <div key={p.id}>
            Aller dans la page Groupement pour indiquer un TUJ pour {p.name}
          </div>
        ))}
      </div>
    );
  }
  const missionDays: MissionDays = currentProject.missionDays ?? {};
  const missionJustifications: MissionJustifications =
    currentProject.missionJustifications ?? {};

  const getDays = (
    mission: string,
    companyId: string,
    personId: string,
  ): number => missionDays[mission]?.[companyId]?.[personId] ?? 0;

  const handleChange = (
    mission: string,
    companyId: string,
    personId: string,
    days: number,
  ): void => {
    const updated: MissionDays = {
      ...missionDays,
      [mission]: {
        ...(missionDays[mission] ?? {}),
        [companyId]: {
          ...(missionDays[mission]?.[companyId] ?? {}),
          [personId]: days,
        },
      },
    };
    updateCurrentProject({ missionDays: updated });
  };

  const getJustification = (
    mission: string,
    companyId: string,
    personId: string,
  ): string => missionJustifications[mission]?.[companyId]?.[personId] ?? "";

  const handleJustificationChange = (
    mission: string,
    companyId: string,
    personId: string,
    text: string,
  ): void => {
    const updated: MissionJustifications = {
      ...missionJustifications,
      [mission]: {
        ...(missionJustifications[mission] ?? {}),
        [companyId]: {
          ...(missionJustifications[mission]?.[companyId] ?? {}),
          [personId]: text,
        },
      },
    };
    updateCurrentProject({ missionJustifications: updated });
  };

  const personCost = (
    mission: string,
    company: ParticipatingCompany,
    person: MobilizedPerson,
  ): number =>
    getDays(mission, company.id, person.id) * (person.dailyRate ?? 0);

  const missionTotal = (mission: string): number => {
    return companies.reduce((total, company) => {
      const people = company.mobilizedPeople ?? [];
      return (
        total +
        people.reduce((sum, p) => sum + personCost(mission, company, p), 0)
      );
    }, 0);
  };

  const allMissionsTotal = missions.reduce(
    (sum, m) => sum + missionTotal(m),
    0,
  );

  const handleEstimate = async (): Promise<void> => {
    if (!apiKey) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    setEstimating(true);
    try {
      const result = await estimateMissionDays(missions, companies, apiKey);
      updateCurrentProject({
        missionDays: result.missionDays,
        missionJustifications: result.missionJustifications,
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
        <div>Aucune mission ou entreprise détectée.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Missions</h1>
      <button
        type="button"
        onClick={handleEstimate}
        className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white"
      >
        Estimer par IA
      </button>
      {estimating && <div>Estimation en cours...</div>}
      {missions.map((mission) => (
        <div key={mission} className="space-y-2 border p-2">
          <h2 className="font-semibold">{mission}</h2>
          {companies.map((company) => {
            const people = company.mobilizedPeople ?? [];
            const companyTotal = people.reduce(
              (sum, p) => sum + personCost(mission, company, p),
              0,
            );
            return (
              <div key={company.id} className="space-y-1">
                <h3 className="font-medium">{company.name}</h3>
                <ul className="space-y-1 pl-2">
                  {people.map((person) => {
                    const days = getDays(mission, company.id, person.id);
                    const cost = personCost(mission, company, person);
                    const justification = getJustification(
                      mission,
                      company.id,
                      person.id,
                    );
                    return (
                      <li
                        key={person.id}
                        className="space-y-1 rounded border p-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{person.name}</span>
                          <input
                            type="number"
                            className="w-20 border p-1"
                            value={days}
                            onChange={(e) =>
                              handleChange(
                                mission,
                                company.id,
                                person.id,
                                Number(e.target.value),
                              )
                            }
                          />
                          <span>{person.dailyRate ?? 0} €/j</span>
                          <span className="font-semibold">
                            {cost.toFixed(2)} €
                          </span>
                        </div>
                        <textarea
                          className="w-full border p-1"
                          value={justification}
                          onChange={(e) =>
                            handleJustificationChange(
                              mission,
                              company.id,
                              person.id,
                              e.target.value,
                            )
                          }
                          placeholder="Justification du nombre de jours"
                        />
                      </li>
                    );
                  })}
                </ul>
                <div className="font-semibold">
                  Total {company.name}: {companyTotal.toFixed(2)} €
                </div>
              </div>
            );
          })}
          <div className="font-bold">
            Total mission: {missionTotal(mission).toFixed(2)} €
          </div>
        </div>
      ))}
      <div className="text-lg font-bold">
        Total général: {allMissionsTotal.toFixed(2)} €
      </div>
    </div>
  );
}

export default Missions;
