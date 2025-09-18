import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { ButtonLink, ButtonPrimary, EditableTextArea } from "../components/ui";
import FileAIUpload from "../components/ui/FileAIUpload";
import { parseMobilizedPersonCV } from "../lib/mobilizedPersonCV";
import type { MobilizedPerson, ParticipatingCompany } from "../types/project";

interface MobilizedPersonEditProps {
  person: MobilizedPerson;
  company: ParticipatingCompany;
  onClose: () => void;
  onSave: (person: MobilizedPerson, shouldBeRepresentative?: boolean) => void;
}

function MobilizedPersonEdit({
  person,
  company,
  onClose,
  onSave,
}: MobilizedPersonEditProps) {
  const [personName, setPersonName] = useState("");
  const [dailyRate, setDailyRate] = useState(650);
  const [cvText, setCvText] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [processing, setProcessing] = useState(false);
  const [shouldBeRepresentative, setShouldBeRepresentative] = useState(false);

  const isCurrentRepresentative = company.representativeId === person.id;

  // Initialiser les champs avec les données de la personne
  useEffect(() => {
    setPersonName(person.name || "");
    setDailyRate(person.dailyRate || 650);
    setCvText(person.cvText || "");
    setCvSummary(person.cvSummary || "");
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPerson: MobilizedPerson = {
      ...person,
      name: personName,
      dailyRate,
      cvText: cvText || undefined,
      cvSummary: cvSummary || undefined,
    };

    onSave(updatedPerson, shouldBeRepresentative);
    // onClose(); // supprimé pour éviter la double navigation
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
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Éditer la personne mobilisée
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les informations de la personne mobilisée
        </p>
      </div>

      {/* CV Upload Section */}
      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900 sm:text-base">
          Télécharger un nouveau CV
        </h3>
        <p className="mb-3 text-xs text-blue-700 sm:text-sm">
          Importez un nouveau CV pour mettre à jour automatiquement les
          informations de la personne.
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

        {/* Section représentant - seulement si pas déjà représentant */}
        {!isCurrentRepresentative && (
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center">
              <input
                id="representative-checkbox"
                type="checkbox"
                checked={shouldBeRepresentative}
                onChange={(e) => setShouldBeRepresentative(e.target.checked)}
                disabled={processing}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="representative-checkbox"
                className="ml-3 text-sm font-medium text-green-900"
              >
                Désigner cette personne comme représentant de l'entreprise
              </label>
            </div>
            <p className="mt-2 text-xs text-green-700">
              Le représentant de l'entreprise sera responsable de la
              coordination et sera affiché comme contact principal.
            </p>
          </div>
        )}

        {/* Affichage si déjà représentant */}
        {isCurrentRepresentative && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="ml-3 text-sm font-medium text-blue-900">
                Cette personne est actuellement le représentant de l'entreprise
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 pb-4 sm:pb-0">
          <ButtonPrimary
            type="submit"
            disabled={processing || !personName.trim()}
            className="w-full px-6 py-3 sm:w-auto"
          >
            Mettre à jour la personne
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
}

export default MobilizedPersonEdit;
