export interface MobilizedPerson {
  id: string;
  slug: string; // slug lisible pour l'URL
  name: string;
  /** Taux journalier hors taxes en euros */
  dailyRate: number;
  cvText: string;
  cvSummary: string;
}

export interface ParticipatingCompany {
  id: string;
  slug?: string; // slug lisible pour l'URL
  name: string;
  presentationText?: string;
  presentationSummary?: string;
  equipmentText?: string;
  mobilizedPeople?: MobilizedPerson[];
  representativeId?: string; // ID of the mobilized person who is the representative
}

export type MarketDocumentType = "RC" | "CCTP" | "CCAP" | "AE" | "AUTRE";

export interface MarketDocument {
  id: string;
  name: string;
  type: MarketDocumentType;
  text: string;
}

export interface NotationItem {
  label: string;
  points: number;
}

export interface Mission {
  id: string;
  name: string;
  /** Sigle de la mission (ex: APS, APD, VISA, etc.) */
  sigle: string;
  /** Description détaillée extraite du CCTP */
  description?: string;
}

export interface MissionCategories {
  base: Mission[];
  pse: Mission[]; // Prestations Supplémentaires Éventuelles
  tranchesConditionnelles: Mission[];
  variantes: Mission[];
}

export interface CategoryPercentages {
  base?: number;
  pse?: number;
  tranchesConditionnelles?: number;
  variantes?: number;
}

export interface MissionPercentageEstimation {
  /** Pourcentage par rapport au total de la catégorie */
  categoryPercentage: number;
  /** Pourcentage par rapport au total du projet */
  projectPercentage: number;
  /** Justification de l'IA pour ce pourcentage */
  justification: string;
}

export interface CategoryMissionPercentages {
  [missionId: string]: MissionPercentageEstimation;
}

export interface RecommendedMissionPercentages {
  base?: CategoryMissionPercentages;
  pse?: CategoryMissionPercentages;
  tranchesConditionnelles?: CategoryMissionPercentages;
  variantes?: CategoryMissionPercentages;
}

export type CompanyEstimation = {
  montantCible: number;
  isLocked: boolean; // une entreprise peut verrouiller son estimation
  persons: {
    [personId: string]: {
      nombreDeJours: number;
      justification: string;
    };
  };
};

export type MissionEstimation = {
  montantCible: number;
  companies: {
    [companyId: string]: CompanyEstimation;
  };
};

export type CategoryEstimation = {
  montantCible: number;
  missions: {
    [missionId: string]: MissionEstimation;
  };
};

export type ProjectEstimation = {
  [category in keyof MissionCategories]: CategoryEstimation;
};

export interface MissionPriceConstraint {
  missionId: string;
  companyId: string;
  /** Montant imposé en euros HT */
  imposedAmount: number;
  /** Justification du prix imposé */
  justification: string;
}

// Pipeline types for mission estimation refactoring
export interface ProjectAnalysis {
  /** Type d'ouvrage identifié (ex: "scolaire", "renovation-patrimoniale", "logement-social") */
  buildingType: string;
  /** Complexités techniques spécifiques identifiées */
  technicalComplexities: string[];
  /** Enjeux particuliers mentionnés dans le CCTP */
  specificChallenges: string[];
  /** Phases critiques du projet */
  criticalPhases: string[];
  /** Compétences clés requises par mission */
  requiredSkillsByMission: { [missionId: string]: string[] };
  /** Contraintes réglementaires spécifiques */
  regulatoryConstraints: string[];
  /** Technologies ou méthodes imposées */
  mandatedTechnologies: string[];
}

export interface PersonAllocation {
  personId: string;
  /** Nombre de jours attribués à cette personne */
  days: number;
  /** Montant correspondant (jours × taux journalier) */
  amount: number;
  /** Justification technique de l'attribution */
  technicalReason: string;
}

export interface CompanyMissionAllocation {
  companyId: string;
  /** Répartition par personne mobilisée */
  people: PersonAllocation[];
  /** Montant total pour cette entreprise sur cette mission */
  totalAmount: number;
}

export interface MissionAllocation {
  missionId: string;
  /** Répartition par entreprise */
  companies: CompanyMissionAllocation[];
  /** Montant total de la mission */
  totalAmount: number;
}

export interface CategoryAllocation {
  /** Missions de cette catégorie */
  missions: MissionAllocation[];
  /** Montant total de la catégorie */
  totalAmount: number;
  /** Montant cible pour cette catégorie */
  targetAmount: number;
}

export interface BaseBudgetAllocation {
  base?: CategoryAllocation;
  pse?: CategoryAllocation;
  tranchesConditionnelles?: CategoryAllocation;
  variantes?: CategoryAllocation;
}

export interface OptimizedBudgetAllocation extends BaseBudgetAllocation {
  /** Ajustements appliqués pour respecter les contraintes */
  appliedAdjustments: {
    missionId: string;
    companyId: string;
    originalAmount: number;
    constrainedAmount: number;
    adjustment: number;
  }[];
}

export interface Project {
  id: string;
  /** Titre de la consultation extrait du RC */
  consultationTitle: string;
  /** Nom court du projet généré par l'IA */
  nomCourt: string;
  /** Date limite de remise des offres au format ISO */
  submissionDeadline: string;
  /** Heure limite de remise des offres au format HH:mm */
  submissionTime: string;
  /** Montant global des travaux en euros HT */
  worksAmount: number;
  creationDate: string;
  lastUpdateDate: string;
  /** Slug lisible pour l'URL */
  slug: string;
  groupType: "solidaire" | "conjoint" | "seule";
  participatingCompanies: ParticipatingCompany[];
  mandataireId?: string;
  /** Identifiant de la personne mobilisée responsable pour la mission */
  mandataireContactId: string | undefined;
  marketDocuments: MarketDocument[];
  /** Contenu HTML du mémoire technique généré */
  memoHtml: string;
  /** Barème de la note méthodologique extrait du RC */
  notation: NotationItem[];
  /** Liste des missions du projet organisées par catégories */
  missions: MissionCategories;
  /** Estimation des missions (jours et justification) par mission, entreprise et personne mobilisée */
  projectEstimation: ProjectEstimation;
  /** Pourcentages de l'offre par catégorie de missions */
  categoryPercentages: CategoryPercentages;
  /** Pourcentages recommandés par l'IA selon l'état de l'art du métier */
  recommendedPercentages: RecommendedMissionPercentages;
  /** Contraintes de prix imposées par les entreprises */
  missionPriceConstraints: MissionPriceConstraint[];
  /** Texte résumant les contraintes de planning extraites de l'AE */
  planningSummary: string;
  /** Planning généré par l'IA en Markdown */
  planningText: string;
}
