// Server serializes with lowercase values; we keep the client enum identical
// to avoid a translation layer at the transport boundary.
export const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type InvitationRole = 'tenant' | 'maintainer';

export type InvitationListItem = {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  buildingId: string | null;
  unitId: string | null;
  invitedById: string;
  sentAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
};

export type InvitationCounts = {
  pending: number;
  accepted: number;
  revoked: number;
  expired: number;
};
