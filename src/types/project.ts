export interface GroupMember {
  id: string;
  name: string;
  dailyRate?: number;
  cvText?: string;
  cvSummary?: string;
}

export interface Project {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  groupType?: "solidaire" | "conjoint";
  groupMembers?: GroupMember[];
  mandataireId?: string;
}
