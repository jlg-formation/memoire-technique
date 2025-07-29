export interface MobilizedPerson {
  id: string;
  name: string;
  cvFile?: string;
  cvText?: string;
  cvSummary?: string;
}

export interface ParticipatingCompany {
  id: string;
  name: string;
  presentationFile?: string;
  presentationText?: string;
  presentationSummary?: string;
  mobilizedPeople?: MobilizedPerson[];
}

export interface Project {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  groupType?: "solidaire" | "conjoint";
  participatingCompanies?: ParticipatingCompany[];
  mandataireId?: string;
}
