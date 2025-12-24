
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

export interface Loan {
  id: string;
  memberName: string;
  fileNumber: string;
  principal: number;
  interestRate: number; // e.g. 5 for 5%
  durationMonths: number;
  startDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  repaidAmount: number;
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
  LOANS = 'LOANS',
  BATCH_UPLOAD = 'BATCH_UPLOAD',
  RECORD_ASSISTANT = 'RECORD_ASSISTANT'
}

export enum Modality {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO'
}
