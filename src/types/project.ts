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
  equipmentText?: string;
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

export type MissionDays = Record<
  string,
  Record<string, Record<string, number>>
>;

export type MissionJustifications = Record<
  string,
  Record<string, Record<string, string>>
>;

export interface Project {
  id: string;
  /** Titre de la consultation extrait du RC */
  consultationTitle: string;
  /** Date limite de remise des offres au format ISO */
  submissionDeadline: string;
  /** Montant global des travaux en euros HT */
  worksAmount?: number;
  creationDate: string;
  lastUpdateDate: string;
  groupType?: "solidaire" | "conjoint";
  participatingCompanies?: ParticipatingCompany[];
  mandataireId?: string;
  /** Identifiant de la personne mobilisée responsable pour la mission */
  mandataireContactId?: string;
  marketDocuments?: MarketDocument[];
  /** Contenu HTML du mémoire technique généré */
  memoHtml?: string;
  /** Barème de la note méthodologique extrait du RC */
  notation?: NotationItem[];
  /** Missions demandées dans l'acte d'engagement */
  missions?: string[];
  /** Jours alloués par mission, entreprise et personne mobilisée */
  missionDays?: MissionDays;
  /** Justification du nombre de jours par mission, entreprise et personne */
  missionJustifications?: MissionJustifications;
  /** Texte résumant les contraintes de planning extraites de l'AE */
  planningSummary?: string;
  /** Planning généré par l'IA en Markdown */
  planningText?: string;
}
