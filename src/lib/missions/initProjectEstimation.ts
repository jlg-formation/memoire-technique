import type {
  Project,
  MissionCategories,
  ProjectEstimation,
  CategoryEstimation,
} from "../../types/project";

/**
 * Initialise une estimation vide pour toutes les missions d'un projet
 * Cette fonction crée une structure d'estimation de base avec toutes les missions
 * mais sans montants ni allocations de ressources
 *
 * @param project - Le projet courant
 * @param missions - Les missions extraites du document (AE)
 * @returns Une estimation de projet initialisée avec toutes les missions
 */
export function initProjectEstimation(
  project: Project,
  missions: MissionCategories,
): ProjectEstimation {
  // Fonction helper pour initialiser une catégorie
  const initCategory = (
    categoryMissions: typeof missions.base,
  ): CategoryEstimation => {
    const categoryEstimation: CategoryEstimation = {
      montantCible: 0,
      missions: {},
    };

    // Initialiser chaque mission de la catégorie
    categoryMissions.forEach((mission) => {
      categoryEstimation.missions[mission.id] = {
        montantCible: 0,
        companies: {},
      };

      // Initialiser chaque entreprise participante pour cette mission
      if (project.participatingCompanies) {
        project.participatingCompanies.forEach((company) => {
          categoryEstimation.missions[mission.id].companies[company.id] = {
            montantCible: 0,
            isLocked: false,
            persons: {},
          };

          // Initialiser chaque personne mobilisée de l'entreprise
          if (company.mobilizedPeople) {
            company.mobilizedPeople.forEach((person) => {
              categoryEstimation.missions[mission.id].companies[
                company.id
              ].persons[person.id] = {
                nombreDeJours: 0,
                justification: "",
              };
            });
          }
        });
      }
    });

    return categoryEstimation;
  };

  // Initialiser toutes les catégories de missions
  const projectEstimation: ProjectEstimation = {
    base: initCategory(missions.base),
    pse: initCategory(missions.pse),
    tranchesConditionnelles: initCategory(missions.tranchesConditionnelles),
    variantes: initCategory(missions.variantes),
  };

  return projectEstimation;
}
