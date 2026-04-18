import type { Role } from '@/features/auth/store';

import type { RequestStatus, ScheduleProposal } from './types';

export type RequestAction =
  | 'ACKNOWLEDGE'
  | 'PROPOSE_SCHEDULE'
  | 'COUNTER_PROPOSE_SCHEDULE'
  | 'ACCEPT_PROPOSAL'
  | 'DECLINE_PROPOSAL'
  | 'RESOLVE'
  | 'SIGN_OFF'
  | 'DISPUTE'
  | 'CLOSE_WITHOUT_RESOLVING'
  | 'COMMENT';

export type ActionContext = {
  status: RequestStatus;
  role: Role;
  hasPendingProposal: boolean;
  lastProposalByRole: 'tenant' | 'maintainer' | null;
};

export function buildActionContext(
  status: RequestStatus,
  role: Role,
  scheduleProposals: ScheduleProposal[],
): ActionContext {
  const latestPending = [...scheduleProposals]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .find((p) => p.status === 'PENDING');

  return {
    status,
    role,
    hasPendingProposal: Boolean(latestPending),
    lastProposalByRole:
      latestPending?.createdBy.role === 'tenant'
        ? 'tenant'
        : latestPending?.createdBy.role === 'maintainer'
          ? 'maintainer'
          : null,
  };
}

/**
 * Returns the actions available to the current role given the request's
 * status and pending-proposal state. Encodes the backend state machine
 * documented in server/PROJECT_DOCUMENTATION.md §6.
 */
export function availableActions(ctx: ActionContext): RequestAction[] {
  const actions: RequestAction[] = ['COMMENT'];
  const { status, role, hasPendingProposal, lastProposalByRole } = ctx;

  if (role === 'maintainer') {
    if (status === 'OPEN') {
      actions.push('ACKNOWLEDGE', 'CLOSE_WITHOUT_RESOLVING');
    }
    if (status === 'ACKNOWLEDGED') {
      actions.push('CLOSE_WITHOUT_RESOLVING');
      if (!hasPendingProposal) actions.push('PROPOSE_SCHEDULE');
    }
    if (status === 'IN_PROGRESS') {
      actions.push('RESOLVE');
    }
    if (hasPendingProposal && lastProposalByRole === 'tenant') {
      actions.push('ACCEPT_PROPOSAL', 'DECLINE_PROPOSAL', 'COUNTER_PROPOSE_SCHEDULE');
    }
  }

  if (role === 'tenant') {
    if (status === 'ACKNOWLEDGED' && !hasPendingProposal) {
      actions.push('PROPOSE_SCHEDULE');
    }
    if (hasPendingProposal && lastProposalByRole === 'maintainer') {
      actions.push('ACCEPT_PROPOSAL', 'DECLINE_PROPOSAL', 'COUNTER_PROPOSE_SCHEDULE');
    }
    if (status === 'RESOLVED') {
      actions.push('SIGN_OFF', 'DISPUTE');
    }
  }

  return actions;
}

export function canPerform(action: RequestAction, ctx: ActionContext): boolean {
  return availableActions(ctx).includes(action);
}
