import { Trash2 } from "lucide-react";
import { ButtonLink, EditableTextArea } from "./ui";
import FileAIUpload from "./ui/FileAIUpload";
import MobilizedPeopleList from "./MobilizedPeopleList";
import { summarize } from "../lib/OpenAI";
import { extractCompanyName } from "../lib/strings/extractCompanyName";
import type { ParticipatingCompany, Project } from "../types/project";

interface CompanyProps {
  company: ParticipatingCompany;
  companies: ParticipatingCompany[];
  currentProject: Project | null;
  summaryWords: number;
  onUpdate: (updatedCompany: ParticipatingCompany) => void;
  onDelete: (companyId: string) => void;
  onMandataireChange: (companyId: string) => void;
  onMandataireContactChange: (contactId: string | undefined) => void;
  onMobilizedPeopleUpdate: (
    people: ParticipatingCompany["mobilizedPeople"],
  ) => void;
}

function Company({
  company,
  companies,
  currentProject,
  summaryWords,
  onUpdate,
  onDelete,
  onMandataireChange,
  onMandataireContactChange,
  onMobilizedPeopleUpdate,
}: CompanyProps) {
  const updateCompany = (updates: Partial<ParticipatingCompany>) => {
    onUpdate({ ...company, ...updates });
  };

  const showMandataireRadio =
    companies.length > 1 &&
    currentProject?.groupType !== undefined &&
    currentProject?.groupType !== "seule";

  const showMandataireContact =
    currentProject?.mandataireId === company.id &&
    currentProject?.groupType !== undefined &&
    currentProject?.groupType !== "seule";

  return (
    <li className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {showMandataireRadio && (
          <input
            type="radio"
            name="mandataire"
            checked={currentProject?.mandataireId === company.id}
            onChange={() => onMandataireChange(company.id)}
            className="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500"
          />
        )}
        <input
          type="text"
          className="w-full rounded border px-2 py-1 text-sm font-medium text-gray-900 sm:text-base"
          value={company.name}
          onChange={(e) => updateCompany({ name: e.target.value })}
        />
        <ButtonLink
          type="button"
          onClick={() => onDelete(company.id)}
          className="rounded p-1 text-red-500 hover:bg-red-50"
          aria-label="Supprimer l'entreprise"
        >
          <Trash2 className="h-5 w-5" />
        </ButtonLink>
      </div>

      {/* Présentation de l'entreprise */}
      <div className="space-y-3 rounded-md bg-gray-50 p-3">
        <label className="block text-sm font-medium text-gray-700">
          Présentation de l'entreprise
        </label>
        <FileAIUpload
          onParse={async (text) => {
            const summary = await summarize(text, summaryWords);
            return { text, summary };
          }}
          onResult={(result) => {
            const { text, summary } = result as {
              text: string;
              summary: string;
            };
            const name = extractCompanyName(summary);
            updateCompany({
              name: name || company.name, // Garde le nom actuel si extraction échoue
              presentationText: text,
              presentationSummary: summary,
            });
          }}
          className="mb-2"
        />
        {company.presentationSummary && (
          <EditableTextArea
            value={company.presentationSummary}
            onChange={(value) => updateCompany({ presentationSummary: value })}
            rows={4}
            className="mt-2"
          />
        )}
      </div>

      {/* Moyens matériels */}
      <div className="space-y-3 rounded-md bg-gray-50 p-3">
        <label className="block text-sm font-medium text-gray-700">
          Moyens matériels
        </label>
        <FileAIUpload
          onParse={async (text) => {
            // On peut résumer ou juste stocker le texte
            return { text };
          }}
          onResult={(result) => {
            const { text } = result as { text: string };
            updateCompany({ equipmentText: text });
          }}
          className="mb-2"
        />
        {company.equipmentText && (
          <EditableTextArea
            value={company.equipmentText}
            onChange={(value) => updateCompany({ equipmentText: value })}
            rows={4}
            className="mt-2"
            disabled={true}
          />
        )}
      </div>

      <MobilizedPeopleList
        company={company}
        onUpdate={onMobilizedPeopleUpdate}
      />

      {showMandataireContact && (
        <div className="space-y-3 rounded-md bg-blue-50 p-3">
          <label className="block text-sm font-medium text-blue-900">
            Personne responsable
          </label>
          <select
            className="w-full cursor-pointer rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
            value={currentProject?.mandataireContactId ?? ""}
            onChange={(e) =>
              onMandataireContactChange(e.target.value || undefined)
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
  );
}

export default Company;
