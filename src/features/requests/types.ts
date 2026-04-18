export const REQUEST_STATUS = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'DISPUTED',
] as const;
export type RequestStatus = (typeof REQUEST_STATUS)[number];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORIES = ['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCES', 'OTHER'] as const;
export type Category = (typeof CATEGORIES)[number];

export const PROPOSAL_STATUS = ['PENDING', 'ACCEPTED', 'DECLINED', 'COUNTER_PROPOSED'] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUS)[number];

export type UserRef = {
  id: string;
  name: string;
  role?: 'tenant' | 'maintainer' | 'landlord';
};

export type Photo = {
  id: string;
  url: string;
  thumbnailUrl?: string;
};

export type Comment = {
  id: string;
  author: UserRef;
  message: string;
  createdAt: string;
};

export type ScheduleProposal = {
  id: string;
  proposedDate: string;
  status: ProposalStatus;
  createdBy: UserRef;
  notes?: string;
  createdAt: string;
};

export type TimelineEvent = {
  id: string;
  type: string;
  actor?: UserRef;
  message?: string;
  createdAt: string;
};

export type RequestListItem = {
  id: string;
  referenceId: string;
  title: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  scheduledDate?: string;
  building?: { id: string; name: string };
  unit?: { id: string; number: string };
  tenant?: UserRef;
  photoCount?: number;
};

export type RequestDetail = RequestListItem & {
  description: string;
  photos: Photo[];
  comments: Comment[];
  scheduleProposals: ScheduleProposal[];
  timeline: TimelineEvent[];
  maintainer?: UserRef;
  resolvedAt?: string;
  closedAt?: string;
  resolutionNotes?: string;
};
