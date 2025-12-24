
export interface Contribution {
  id: string;
  memberName: string;
  fileNumber: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  previousPayment?: number;
}

export interface Member {
  fileNumber: string;
  name: string;
  totalContributed: number;
  lastContributionDate: string;
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  MEMBERS = 'MEMBERS',
  CONTRIBUTIONS = 'CONTRIBUTIONS',
  BATCH_UPLOAD = 'BATCH_UPLOAD',
  RECORD_ASSISTANT = 'RECORD_ASSISTANT'
}
