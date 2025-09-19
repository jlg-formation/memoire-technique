export interface MobilizedPerson {
  id: string;
  slug?: string; // slug lisible pour l'URL
  name: string;
  /** Taux journalier hors taxes en euros */
  dailyRate?: number;
  cvText?: string;
  cvSummary?: string;
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

export interface AIRecommendedPercentages {
  base?: CategoryMissionPercentages;
  pse?: CategoryMissionPercentages;
  tranchesConditionnelles?: CategoryMissionPercentages;
  variantes?: CategoryMissionPercentages;
}

export type MissionEstimation = {
  [category in keyof MissionCategories]: {
    [missionId: string]: {
      [companyId: string]: {
        [personId: string]: {
          nombreDeJours: number;
          justification: string;
        };
      };
    };
  };
};

export interface MissionPriceConstraint {
  missionId: string;
  companyId: string;
  /** Montant imposé en euros HT */
  imposedAmount: number;
  /** Justification du prix imposé */
  justification: string;
}

export interface Project {
  id: string;
  /** Titre de la consultation extrait du RC */
  consultationTitle: string;
  /** Nom court du projet généré par l'IA */
  nomCourt?: string;
  /** Date limite de remise des offres au format ISO */
  submissionDeadline: string;
  /** Heure limite de remise des offres au format HH:mm */
  submissionTime?: string;
  /** Montant global des travaux en euros HT */
  worksAmount?: number;
  creationDate: string;
  lastUpdateDate: string;
  /** Slug lisible pour l'URL */
  slug: string;
  groupType?: "solidaire" | "conjoint" | "seule";
  participatingCompanies?: ParticipatingCompany[];
  mandataireId?: string;
  /** Identifiant de la personne mobilisée responsable pour la mission */
  mandataireContactId?: string;
  marketDocuments?: MarketDocument[];
  /** Contenu HTML du mémoire technique généré */
  memoHtml?: string;
  /** Barème de la note méthodologique extrait du RC */
  notation?: NotationItem[];
  /** Liste des missions du projet organisées par catégories */
  missions?: MissionCategories;
  /** Estimation des missions (jours et justification) par mission, entreprise et personne mobilisée */
  missionEstimations?: MissionEstimation;
  /** Pourcentages de l'offre par catégorie de missions */
  categoryPercentages?: CategoryPercentages;
  /** Pourcentages recommandés par l'IA selon l'état de l'art du métier */
  aiRecommendedPercentages?: AIRecommendedPercentages;
  /** Contraintes de prix imposées par les entreprises */
  missionPriceConstraints?: MissionPriceConstraint[];
  /** Texte résumant les contraintes de planning extraites de l'AE */
  planningSummary?: string;
  /** Planning généré par l'IA en Markdown */
  planningText?: string;
}
