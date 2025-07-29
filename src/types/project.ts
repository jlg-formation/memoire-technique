export interface GroupMember {
  id: string;
  name: string;
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
