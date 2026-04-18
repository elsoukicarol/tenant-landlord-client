export const INVITATION_STATUSES = ['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type InvitationRole = 'TENANT' | 'MAINTAINER';

export type InvitationListItem = {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  createdAt: string;
  building?: { id: string; name: string };
  unit?: { id: string; number: string };
};

export type InvitationCounts = {
  PENDING: number;
  ACCEPTED: number;
  REVOKED: number;
  EXPIRED: number;
};
