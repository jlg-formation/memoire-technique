import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import type { ParticipatingCompany } from "../types/project";
import { summarize } from "../lib/OpenAI";
import { extractPdfText } from "../lib/pdf";
import { extractDocxText } from "../lib/docx";
import { useOpenAIKeyStore } from "../store/useOpenAIKeyStore";
import MobilizedPeopleList from "../components/MobilizedPeopleList";

function Groupement() {
  const { currentProject, updateCurrentProject } = useProjectStore();
  const { apiKey } = useOpenAIKeyStore();
  const [name, setName] = useState("");
  const [summaryWords, setSummaryWords] = useState(100);
  const [presentationFiles, setPresentationFiles] = useState<
    Record<string, File | undefined>
  >({});
  const [cvFiles, setCvFiles] = useState<Record<string, File | undefined>>({});

  if (!currentProject) {
    return (
      <div className="p-4 text-red-500">Veuillez sélectionner un projet.</div>
    );
  }

  const companies = currentProject.participatingCompanies ?? [];

  const updateCompanies = (updated: ParticipatingCompany[]) => {
    updateCurrentProject({ participatingCompanies: updated });
  };

  const handlePresentationChange = async (
    id: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      setPresentationFiles((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }
    setPresentationFiles((prev) => ({ ...prev, [id]: file }));
    updateCompanies(
      companies.map((c) =>
        c.id === id
          ? {
              ...c,
              presentationText: undefined,
              presentationSummary: undefined,
            }
          : c,
      ),
    );
  };

  const handlePersonFileChange = async (
    companyId: string,
    personId: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      setCvFiles((prev) => {
        const key = `${companyId}-${personId}`;
        const copy = { ...prev } as Record<string, File | undefined>;
        delete copy[key];
        return copy;
      });
      return;
    }
    setCvFiles((prev) => ({ ...prev, [`${companyId}-${personId}`]: file }));
    updateCompanies(
      companies.map((c) =>
        c.id === companyId
          ? {
              ...c,
              mobilizedPeople: (c.mobilizedPeople ?? []).map((p) =>
                p.id === personId
                  ? {
                      ...p,
                      cvText: undefined,
                      cvSummary: undefined,
                    }
                  : p,
              ),
            }
          : c,
      ),
    );
  };

  const handleSummarizePresentation = async (
    companyId: string,
  ): Promise<void> => {
    const file = presentationFiles[companyId];
    if (!file) return;
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    try {
      const text = file.name.toLowerCase().endsWith(".docx")
        ? await extractDocxText(file)
        : await extractPdfText(file);
      const summary = await summarize(text, summaryWords, key);
      updateCompanies(
        companies.map((c) =>
          c.id === companyId
            ? { ...c, presentationText: text, presentationSummary: summary }
            : c,
        ),
      );
      setPresentationFiles((prev) => {
        const copy = { ...prev };
        delete copy[companyId];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummarizePerson = async (
    companyId: string,
    personId: string,
  ): Promise<void> => {
    const keyRef = `${companyId}-${personId}`;
    const file = cvFiles[keyRef];
    if (!file) return;
    const key = apiKey || import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      alert("Veuillez saisir votre clé OpenAI dans les paramètres.");
      return;
    }
    try {
      const text = file.name.toLowerCase().endsWith(".docx")
        ? await extractDocxText(file)
        : await extractPdfText(file);
      const summary = await summarize(text, summaryWords, key);
      updateCompanies(
        companies.map((c) =>
          c.id === companyId
            ? {
                ...c,
                mobilizedPeople: (c.mobilizedPeople ?? []).map((p) =>
                  p.id === personId
                    ? { ...p, cvText: text, cvSummary: summary }
                    : p,
                ),
              }
            : c,
        ),
      );
      setCvFiles((prev) => {
        const copy = { ...prev } as Record<string, File | undefined>;
        delete copy[keyRef];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEquipmentChange = async (
    id: string,
    file?: File,
  ): Promise<void> => {
    if (!file) {
      updateCompanies(
        companies.map((c) =>
          c.id === id ? { ...c, equipmentText: undefined } : c,
        ),
      );
      return;
    }
    const text = file.name.toLowerCase().endsWith(".docx")
      ? await extractDocxText(file)
      : await extractPdfText(file);
    updateCompanies(
      companies.map((c) => (c.id === id ? { ...c, equipmentText: text } : c)),
    );
  };

  const handleAddCompany = () => {
    if (!name.trim()) return;
    const newCompany: ParticipatingCompany = { id: crypto.randomUUID(), name };
    updateCurrentProject({
      participatingCompanies: [...companies, newCompany],
    });
    setName("");
  };

  const handleDeleteCompany = (id: string) => {
    updateCurrentProject({
      participatingCompanies: companies.filter((c) => c.id !== id),
      mandataireId:
        currentProject.mandataireId === id
          ? undefined
          : currentProject.mandataireId,
      mandataireContactId:
        currentProject.mandataireId === id
          ? undefined
          : currentProject.mandataireContactId,
    });
  };

  const handleMandataire = (id: string) => {
    const mandataire = companies.find((c) => c.id === id);
    const people = mandataire?.mobilizedPeople ?? [];
    const contactId = people.some(
      (p) => p.id === currentProject.mandataireContactId,
    )
      ? currentProject.mandataireContactId
      : undefined;
    updateCurrentProject({ mandataireId: id, mandataireContactId: contactId });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Groupement</h1>
      <label className="block font-semibold">Type de groupement</label>
      <select
        className="w-full border p-2"
        value={currentProject.groupType ?? ""}
        onChange={(e) =>
          updateCurrentProject({
            groupType: e.target.value as "solidaire" | "conjoint",
          })
        }
      >
        <option value="">-- choisir --</option>
        <option value="solidaire">Solidaire</option>
        <option value="conjoint">Conjoint</option>
      </select>

      <div className="space-y-2">
        <label className="block font-semibold">Entreprises participantes</label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="flex-1 border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'entreprise"
          />
          <button
            type="button"
            onClick={handleAddCompany}
            className="cursor-pointer bg-blue-500 px-4 py-2 text-white"
          >
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-semibold">Résumé en</label>
          <input
            type="number"
            className="w-20 border p-1"
            value={summaryWords}
            onChange={(e) => setSummaryWords(Number(e.target.value))}
          />
          <span>mots</span>
        </div>
        {companies.length > 1 && (
          <p className="font-semibold">Sélectionnez le mandataire</p>
        )}
        <ul className="space-y-1">
          {companies.map((company) => (
            <li key={company.id} className="space-y-2 rounded border p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  {companies.length > 1 && (
                    <input
                      type="radio"
                      name="mandataire"
                      checked={currentProject.mandataireId === company.id}
                      onChange={() => handleMandataire(company.id)}
                    />
                  )}
                  <span>{company.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(company.id)}
                  className="cursor-pointer text-red-500"
                >
                  Supprimer
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) =>
                    handlePresentationChange(company.id, e.target.files?.[0])
                  }
                  className="rounded border border-gray-300 bg-gray-100 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleSummarizePresentation(company.id)}
                  className="cursor-pointer bg-green-500 px-2 text-white"
                >
                  Résumer
                </button>
              </div>
              {company.presentationSummary && (
                <textarea
                  className="mt-2 w-full border p-2"
                  readOnly
                  value={company.presentationSummary}
                />
              )}
              <div className="space-y-1 pt-2">
                <label className="font-semibold">Moyens matériels</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) =>
                    handleEquipmentChange(company.id, e.target.files?.[0])
                  }
                  className="rounded border border-gray-300 bg-gray-100 p-2"
                />
                {company.equipmentText && (
                  <textarea
                    className="mt-2 w-full border p-2"
                    readOnly
                    value={company.equipmentText}
                  />
                )}
              </div>
              <MobilizedPeopleList
                company={company}
                onFileChange={handlePersonFileChange}
                onSummarize={handleSummarizePerson}
                onUpdate={(updated) => {
                  if (
                    currentProject.mandataireId === company.id &&
                    !updated.some(
                      (p) => p.id === currentProject.mandataireContactId,
                    )
                  ) {
                    updateCurrentProject({ mandataireContactId: undefined });
                  }
                  updateCompanies(
                    companies.map((c) =>
                      c.id === company.id
                        ? { ...c, mobilizedPeople: updated }
                        : c,
                    ),
                  );
                }}
              />
              {currentProject.mandataireId === company.id && (
                <div className="space-y-1">
                  <label className="font-semibold">Personne responsable</label>
                  <select
                    className="w-full border p-2"
                    value={currentProject.mandataireContactId ?? ""}
                    onChange={(e) =>
                      updateCurrentProject({
                        mandataireContactId: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">-- choisir --</option>
                    {(company.mobilizedPeople ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groupement;
