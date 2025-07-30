export interface MobilizedPerson {
  id: string;
  name: string;
  /** Taux journalier hors taxes en euros */
  dailyRate?: number;
  cvText?: string;
  cvSummary?: string;
}

export interface ParticipatingCompany {
  id: string;
  name: string;
  presentationText?: string;
  presentationSummary?: string;
  mobilizedPeople?: MobilizedPerson[];
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

export interface Project {
  id: string;
  /** Titre de la consultation extrait du RC */
  consultationTitle: string;
  /** Date limite de remise des offres au format ISO */
  submissionDeadline: string;
  creationDate: string;
  lastUpdateDate: string;
  groupType?: "solidaire" | "conjoint";
  participatingCompanies?: ParticipatingCompany[];
  mandataireId?: string;
  marketDocuments?: MarketDocument[];
  /** Contenu HTML du mémoire technique généré */
  memoHtml?: string;
  /** Barème de la note méthodologique extrait du RC */
  notation?: NotationItem[];
  /** Missions demandées dans l'acte d'engagement */
  missions?: string[];
}
