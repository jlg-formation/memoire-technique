import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { executeDeleteAction } from "../lib/critical-actions";
import type { ParticipatingCompany } from "../types/project";
import CompanyCreate from "./CompanyCreate";
import CompanyEdit from "./CompanyEdit";
import { ButtonPrimary, ButtonLink, Select } from "../components/ui";
import { Plus, Building2, Trash2, Users } from "lucide-react";

function Equipes() {
  const { currentProject, updateCurrentProject } = useProjectStore();

  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">(
    "list",
  );
  const [editingCompany, setEditingCompany] =
    useState<ParticipatingCompany | null>(null);

  const companies: ParticipatingCompany[] =
    currentProject?.participatingCompanies ?? [];

  const handleDeleteCompany = (id: string, companyName: string) => {
    executeDeleteAction(() => {
      updateCurrentProject({
        participatingCompanies: companies.filter((c) => c.id !== id),
        mandataireId:
          currentProject && currentProject.mandataireId === id
            ? undefined
            : currentProject?.mandataireId,
        mandataireContactId:
          currentProject && currentProject.mandataireId === id
            ? undefined
            : currentProject?.mandataireContactId,
      });
    }, companyName);
  };

  const handleEditCompany = (company: ParticipatingCompany): void => {
    setEditingCompany(company);
    setCurrentView("edit");
  };

  const handleCloseEdit = (): void => {
    setEditingCompany(null);
    setCurrentView("list");
  };

  if (currentView === "create") {
    return <CompanyCreate onClose={() => setCurrentView("list")} />;
  }

  if (currentView === "edit" && editingCompany) {
    return <CompanyEdit company={editingCompany} onClose={handleCloseEdit} />;
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Équipes</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Type d'équipe Section */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <Select
            label="Type d'équipe"
            placeholder="-- choisir --"
            options={[
              { value: "seule", label: "Entreprise seule" },
              { value: "solidaire", label: "Groupement Solidaire" },
              { value: "conjoint", label: "Groupement Conjoint" },
            ]}
            value={currentProject?.groupType ?? ""}
            onChange={(e) => {
              updateCurrentProject({
                groupType: e.target.value as "solidaire" | "conjoint" | "seule",
              });
            }}
            className="text-sm sm:text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <ButtonPrimary
            onClick={() => setCurrentView("create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle entreprise
          </ButtonPrimary>
        </div>

        {/* Entreprises List */}
        {companies.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
              <Building2 className="h-full w-full" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucune entreprise
            </h3>
            <p className="mb-4 text-gray-500">
              Ajoutez votre première entreprise pour commencer.
            </p>
            <ButtonPrimary
              onClick={() => setCurrentView("create")}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle entreprise
            </ButtonPrimary>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                onClick={() => handleEditCompany(company)}
              >
                <div className="flex-1">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {company.mobilizedPeople &&
                      company.mobilizedPeople.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {company.mobilizedPeople.length} personne
                          {company.mobilizedPeople.length > 1 ? "s" : ""}{" "}
                          mobilisée
                          {company.mobilizedPeople.length > 1 ? "s" : ""}
                        </div>
                      )}
                    {currentProject?.mandataireId === company.id && (
                      <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Mandataire
                      </div>
                    )}
                  </div>
                  {company.presentationSummary && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {company.presentationSummary}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1">
                    <ButtonLink
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompany(company.id, company.name);
                      }}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mandataire Selection - Only for groupments */}
        {companies.length > 1 &&
          currentProject?.groupType !== undefined &&
          currentProject?.groupType !== "seule" && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-3 text-sm font-medium text-blue-900">
                Sélection du mandataire
              </h3>
              <p className="mb-3 text-xs text-blue-700">
                Pour un groupement, vous devez désigner une entreprise
                mandataire qui sera responsable de la coordination.
              </p>
              <Select
                label=""
                placeholder="-- Sélectionnez le mandataire --"
                options={companies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                value={currentProject?.mandataireId ?? ""}
                onChange={(e) => {
                  updateCurrentProject({
                    mandataireId: e.target.value,
                    mandataireContactId: undefined,
                  });
                }}
                className="text-sm"
              />
            </div>
          )}
      </div>
    </div>
  );
}

export default Equipes;
