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
}

export interface MissionCategories {
  base: Mission[];
  pse: Mission[]; // Prestations Supplémentaires Éventuelles
  tranchesConditionnelles: Mission[];
  variantes: Mission[];
}

export type MissionEstimation = {
  [missionId: string]: {
    [companyId: string]: {
      [personId: string]: {
        nombreDeJours: number;
        justification: string;
      };
    };
  };
};

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
  /** Texte résumant les contraintes de planning extraites de l'AE */
  planningSummary?: string;
  /** Planning généré par l'IA en Markdown */
  planningText?: string;
}
