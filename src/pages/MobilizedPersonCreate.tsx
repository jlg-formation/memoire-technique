import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ButtonLink, ButtonPrimary, EditableTextArea } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { parseMobilizedPersonCV } from "../lib/mobilizedPersonCV";
import { uniqueSlug } from "../lib/strings/slugify";
import type { MobilizedPerson, ParticipatingCompany } from "../types/project";

interface MobilizedPersonCreateProps {
  company: ParticipatingCompany;
  onClose: () => void;
  onSave: (person: MobilizedPerson) => void;
}

function MobilizedPersonCreate({
  company,
  onClose,
  onSave,
}: MobilizedPersonCreateProps) {
  const [personName, setPersonName] = useState("");
  const [dailyRate, setDailyRate] = useState(650);
  const [cvText, setCvText] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingSlugs = (company.mobilizedPeople ?? []).map(
      (p) => p.slug ?? "",
    );
    const slug = uniqueSlug(personName, existingSlugs);
    const newPerson: MobilizedPerson = {
      id: crypto.randomUUID(),
      slug,
      name: personName,
      dailyRate,
      cvText: cvText || undefined,
      cvSummary: cvSummary || undefined,
    };

    onSave(newPerson);
  };

  return (
    <div className="min-h-screen space-y-6 p-2 sm:p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <ButtonLink
            onClick={onClose}
            className="flex shrink-0 items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Précédent</span>
          </ButtonLink>
        </div>

        {/* Badge entreprise */}
        <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          <span className="mr-1">📢</span>
          {company.name}
        </div>

        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Nouvelle personne mobilisée
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Ajoutez une nouvelle personne à mobiliser pour cette entreprise
        </p>
      </div>

      {/* CV Upload Section */}
      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
          Télécharger le CV de la personne
        </h3>
        <p className="mb-3 text-xs text-blue-700 sm:text-sm">
          Importez le CV pour extraire automatiquement les informations de la
          personne.
        </p>

        <div className="space-y-3">
          <FileAIUpload
            label="Joindre le CV de la personne"
            onParse={async (text) => {
              setProcessing(true);
              const { summary, name } = await parseMobilizedPersonCV(text);
              return { text, summary, name };
            }}
            onResult={(result) => {
              const { text, summary, name } = result as {
                text: string;
                summary: string;
                name?: string;
              };
              setCvText(text);
              setCvSummary(summary);
              if (name) {
                setPersonName(name);
              }
              setProcessing(false);
            }}
            status=""
            setStatus={() => {}}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        aria-disabled={processing}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom et prénom de la personne *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Saisissez le nom et prénom de la personne"
            disabled={processing}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Taux journalier HT (€) *
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-base"
            value={dailyRate}
            onChange={(e) => setDailyRate(Number(e.target.value))}
            placeholder="650"
            required
            min="0"
            step="1"
          />
        </div>

        {cvSummary && (
          <EditableTextArea
            label="Résumé du CV"
            value={cvSummary}
            onChange={(value) => setCvSummary(value)}
            placeholder="Résumé du CV de la personne"
            disabled={processing}
            rows={6}
          />
        )}

        <div className="flex justify-end pt-4 pb-4 sm:pb-0">
          <ButtonPrimary
            type="submit"
            disabled={processing || !personName.trim()}
            className="w-full px-6 py-3 sm:w-auto"
          >
            Ajouter la personne
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default MobilizedPersonCreate;
